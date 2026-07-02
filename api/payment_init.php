<?php
/**
 * Payment Initialization API
 * Creates payment transactions and initializes with the selected gateway.
 * 
 * POST — Initialize a payment for a specific invoice using a chosen gateway.
 */
require_once 'db.php';
require_once 'auth_helper.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed."]);
    exit();
}

// Authenticate client
$username = verify_admin_token();
$userStmt = $pdo->prepare("SELECT `id`, `username`, `email`, `role` FROM `users` WHERE `username` = ?");
$userStmt->execute([$username]);
$user = $userStmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    http_response_code(401);
    echo json_encode(["message" => "User not found."]);
    exit();
}

$inputData = json_decode(file_get_contents('php://input'), true);
$invoiceId = intval($inputData['invoice_id'] ?? 0);
$gatewayName = trim($inputData['gateway'] ?? '');

if ($invoiceId <= 0 || empty($gatewayName)) {
    http_response_code(400);
    echo json_encode(["message" => "Invoice ID and gateway selection are required."]);
    exit();
}

// Fetch invoice details
$invStmt = $pdo->prepare("SELECT * FROM `client_invoices` WHERE `id` = ? AND `client_id` = ?");
$invStmt->execute([$invoiceId, $user['id']]);
$invoice = $invStmt->fetch(PDO::FETCH_ASSOC);

if (!$invoice) {
    http_response_code(404);
    echo json_encode(["message" => "Invoice not found."]);
    exit();
}

if ($invoice['status'] === 'Paid') {
    http_response_code(400);
    echo json_encode(["message" => "This invoice has already been paid."]);
    exit();
}

// Fetch gateway configuration
$gwStmt = $pdo->prepare("SELECT * FROM `payment_gateways` WHERE `gateway_name` = ? AND `is_enabled` = 1");
$gwStmt->execute([$gatewayName]);
$gateway = $gwStmt->fetch(PDO::FETCH_ASSOC);

if (!$gateway) {
    http_response_code(400);
    echo json_encode(["message" => "Selected payment gateway is not available or not configured."]);
    exit();
}

// Generate unique reference
$reference = 'BFT-' . strtoupper($gatewayName) . '-' . time() . '-' . str_pad(random_int(0, 9999), 4, '0', STR_PAD_LEFT);
$txRef = 'BFTX-' . time() . '-' . $invoiceId;

// Determine amount (use balance_due if available, else full amount)
$payAmount = floatval($invoice['balance_due']) > 0 ? floatval($invoice['balance_due']) : floatval($invoice['amount']);
$currency = $invoice['currency'] ?: 'NGN';

// Map currency symbols to ISO codes
$currencyMap = [
    '$' => 'USD', '₦' => 'NGN', '€' => 'EUR', '£' => 'GBP', 'C$' => 'CAD',
    'USD' => 'USD', 'NGN' => 'NGN', 'EUR' => 'EUR', 'GBP' => 'GBP', 'CAD' => 'CAD'
];
$currencyCode = $currencyMap[$currency] ?? 'NGN';

$clientEmail = $user['email'] ?: $user['username'] . '@client.brainfeels.tech';

// Create pending transaction record
$txStmt = $pdo->prepare("INSERT INTO `payment_transactions` (`client_id`, `invoice_id`, `gateway`, `reference`, `tx_ref`, `amount`, `currency`, `status`) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')");
$txStmt->execute([$user['id'], $invoiceId, $gatewayName, $reference, $txRef, $payAmount, $currencyCode]);
$transactionId = $pdo->lastInsertId();

// Check if the keys are configured. If not, auto-enable sandbox simulation.
if (empty($gateway['public_key']) || empty($gateway['secret_key'])) {
    $demoReference = 'BFT-DEMO-' . strtoupper($gatewayName) . '-' . time() . '-' . str_pad(random_int(0, 9999), 4, '0', STR_PAD_LEFT);
    $upStmt = $pdo->prepare("UPDATE `payment_transactions` SET `reference` = ? WHERE `id` = ?");
    $upStmt->execute([$demoReference, $transactionId]);

    $responseData = [
        "success" => true,
        "transaction_id" => $transactionId,
        "reference" => $demoReference,
        "tx_ref" => $txRef,
        "amount" => $payAmount,
        "currency" => $currencyCode,
        "client_email" => $clientEmail,
        "client_name" => $user['username'],
        "gateway" => $gatewayName,
        "invoice_code" => $invoice['invoice_code'],
        "is_demo" => true
    ];
    echo json_encode($responseData);
    exit();
}

$responseData = [
    "success" => true,
    "transaction_id" => $transactionId,
    "reference" => $reference,
    "tx_ref" => $txRef,
    "amount" => $payAmount,
    "currency" => $currencyCode,
    "client_email" => $clientEmail,
    "client_name" => $user['username'],
    "gateway" => $gatewayName,
    "invoice_code" => $invoice['invoice_code']
];

// Gateway-specific initialization
switch ($gatewayName) {
    case 'paystack':
        // Paystack: Initialize transaction server-side to get access_code
        $paystackAmount = intval($payAmount * 100); // Convert to kobo/cents
        $paystackPayload = json_encode([
            "email" => $clientEmail,
            "amount" => $paystackAmount,
            "currency" => $currencyCode,
            "reference" => $reference,
            "callback_url" => $gateway['callback_url'] ?: (isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] . '/#/portal' : 'http://localhost:5173/#/portal'),
            "metadata" => [
                "invoice_id" => $invoiceId,
                "invoice_code" => $invoice['invoice_code'],
                "transaction_id" => $transactionId
            ]
        ]);

        $ch = curl_init('https://api.paystack.co/transaction/initialize');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $gateway['secret_key'],
            'Content-Type: application/json'
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $paystackPayload);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        $result = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $paystackRes = json_decode($result, true);
        if ($httpCode === 200 && isset($paystackRes['data']['access_code'])) {
            $responseData['access_code'] = $paystackRes['data']['access_code'];
            $responseData['authorization_url'] = $paystackRes['data']['authorization_url'];
        } else {
            $responseData['gateway_error'] = $paystackRes['message'] ?? 'Failed to initialize Paystack transaction.';
        }
        $responseData['public_key'] = $gateway['public_key'];
        break;

    case 'flutterwave':
        // Flutterwave: Return config for inline popup (initialization is client-side)
        $responseData['public_key'] = $gateway['public_key'];
        $responseData['payment_options'] = 'card,banktransfer,ussd,mobilemoney';
        $responseData['customizations'] = [
            "title" => "Brainfeels Tech",
            "description" => "Payment for " . $invoice['invoice_code'],
            "logo" => ""
        ];
        break;

    case 'stripe':
        // Stripe: Create a Checkout Session and return URL for redirect
        $stripePayload = http_build_query([
            'line_items[0][price_data][currency]' => strtolower($currencyCode),
            'line_items[0][price_data][product_data][name]' => 'Invoice ' . $invoice['invoice_code'],
            'line_items[0][price_data][product_data][description]' => 'Payment for Brainfeels Tech project invoice',
            'line_items[0][price_data][unit_amount]' => intval($payAmount * 100),
            'line_items[0][quantity]' => 1,
            'mode' => 'payment',
            'success_url' => ($gateway['callback_url'] ?: 'http://localhost:5173/#/portal') . '?payment_status=success&reference=' . $reference . '&gateway=stripe',
            'cancel_url' => ($gateway['callback_url'] ?: 'http://localhost:5173/#/portal') . '?payment_status=cancelled',
            'client_reference_id' => $reference,
            'customer_email' => $clientEmail,
            'metadata[invoice_id]' => $invoiceId,
            'metadata[transaction_id]' => $transactionId
        ]);

        $ch = curl_init('https://api.stripe.com/v1/checkout/sessions');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_USERPWD, $gateway['secret_key'] . ':');
        curl_setopt($ch, CURLOPT_POSTFIELDS, $stripePayload);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        $result = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $stripeRes = json_decode($result, true);
        if ($httpCode === 200 && isset($stripeRes['url'])) {
            $responseData['checkout_url'] = $stripeRes['url'];
            $responseData['session_id'] = $stripeRes['id'];
        } else {
            $responseData['gateway_error'] = $stripeRes['error']['message'] ?? 'Failed to create Stripe checkout session.';
        }
        break;

    case 'monnify':
        // Monnify: Return config for inline popup (initialization is client-side)
        $responseData['public_key'] = $gateway['public_key'];
        $responseData['contract_code'] = $gateway['webhook_secret'] ?: ''; // We reuse webhook_secret field for Monnify contract code
        break;

    default:
        http_response_code(400);
        echo json_encode(["message" => "Unsupported payment gateway."]);
        exit();
}

echo json_encode($responseData);
exit();
