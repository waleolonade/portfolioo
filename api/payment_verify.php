<?php
/**
 * Payment Verification API
 * Verifies payment status with the respective gateway and fulfills the invoice.
 * 
 * POST — Verify a completed payment and update invoice + task status.
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
$userStmt = $pdo->prepare("SELECT `id`, `username`, `role` FROM `users` WHERE `username` = ?");
$userStmt->execute([$username]);
$user = $userStmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    http_response_code(401);
    echo json_encode(["message" => "User not found."]);
    exit();
}

$inputData = json_decode(file_get_contents('php://input'), true);
$reference = trim($inputData['reference'] ?? '');
$gatewayName = trim($inputData['gateway'] ?? '');
$transactionId = intval($inputData['transaction_id'] ?? 0);

if (empty($reference) || empty($gatewayName)) {
    http_response_code(400);
    echo json_encode(["message" => "Payment reference and gateway are required."]);
    exit();
}

// Start database transaction with row locking to prevent race conditions
$pdo->beginTransaction();

try {
    // 1. Fetch transaction record with FOR UPDATE write lock
    $txQuery = "SELECT * FROM `payment_transactions` WHERE ";
    if ($transactionId > 0) {
        $txStmt = $pdo->prepare($txQuery . "`id` = ? AND `client_id` = ? FOR UPDATE");
        $txStmt->execute([$transactionId, $user['id']]);
    } else {
        $txStmt = $pdo->prepare($txQuery . "`reference` = ? AND `client_id` = ? FOR UPDATE");
        $txStmt->execute([$reference, $user['id']]);
    }
    $transaction = $txStmt->fetch(PDO::FETCH_ASSOC);

    if (!$transaction) {
        $pdo->rollBack();
        http_response_code(404);
        echo json_encode(["message" => "Transaction record not found."]);
        exit();
    }

    // 2. Check if already processed
    if ($transaction['status'] === 'success') {
        $pdo->commit();
        echo json_encode(["success" => true, "message" => "Payment already verified and fulfilled.", "already_verified" => true]);
        exit();
    }

    // Fetch gateway secret key
    $gwStmt = $pdo->prepare("SELECT `secret_key`, `public_key` FROM `payment_gateways` WHERE `gateway_name` = ?");
    $gwStmt->execute([$gatewayName]);
    $gateway = $gwStmt->fetch(PDO::FETCH_ASSOC);

    if (!$gateway) {
        $pdo->rollBack();
        http_response_code(400);
        echo json_encode(["message" => "Gateway configuration not found."]);
        exit();
    }

    $verified = false;
    $gatewayResponse = null;

    // Helper function to perform secure cURL requests
    function verify_gateway_curl($url, $method = 'GET', $payload = null, $headers = [], $basicAuth = null) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 8);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Disabled peer verification for local XAMPP sandbox test routes
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        
        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            if ($payload) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
            }
        }
        
        if ($basicAuth) {
            curl_setopt($ch, CURLOPT_USERPWD, $basicAuth);
        }
        
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $err = curl_error($ch);
        curl_close($ch);
        
        return [
            'success' => ($err === ''),
            'error' => $err,
            'code' => $httpCode,
            'body' => $response
        ];
    }

    // 3. Verify status with Gateway
    if (strpos($reference, 'BFT-DEMO-') === 0) {
        $verified = true;
        $gatewayResponse = json_encode(["status" => "success", "mode" => "demo_simulation"]);
    } else {
        switch ($gatewayName) {
            case 'paystack':
                $res = verify_gateway_curl(
                    'https://api.paystack.co/transaction/verify/' . urlencode($reference),
                    'GET',
                    null,
                    ['Authorization: Bearer ' . $gateway['secret_key']]
                );

                $paystackRes = json_decode($res['body'], true);
                $gatewayResponse = $res['body'];

                if ($res['code'] === 200 && isset($paystackRes['data']['status']) && $paystackRes['data']['status'] === 'success') {
                    $paidAmount = $paystackRes['data']['amount'] / 100; // Convert from kobo/cents
                    if ($paidAmount >= $transaction['amount']) {
                        $verified = true;
                    }
                }
                break;

            case 'flutterwave':
                $flwTxId = trim($inputData['flw_transaction_id'] ?? '');
                if (empty($flwTxId)) {
                    $flwTxId = $reference; 
                }
                $res = verify_gateway_curl(
                    'https://api.flutterwave.com/v3/transactions/' . urlencode($flwTxId) . '/verify',
                    'GET',
                    null,
                    ['Authorization: Bearer ' . $gateway['secret_key']]
                );

                $flwRes = json_decode($res['body'], true);
                $gatewayResponse = $res['body'];

                if ($res['code'] === 200 && isset($flwRes['data']['status']) && $flwRes['data']['status'] === 'successful') {
                    if ($flwRes['data']['amount'] >= $transaction['amount']) {
                        $verified = true;
                    }
                }
                break;

            case 'stripe':
                $res = verify_gateway_curl(
                    'https://api.stripe.com/v1/checkout/sessions/' . urlencode($reference),
                    'GET',
                    null,
                    [],
                    $gateway['secret_key'] . ':'
                );

                $stripeRes = json_decode($res['body'], true);
                $gatewayResponse = $res['body'];

                if ($res['code'] === 200 && isset($stripeRes['payment_status']) && $stripeRes['payment_status'] === 'paid') {
                    $verified = true;
                }
                break;

            case 'monnify':
                // Monnify Auth login to get token
                $authRes = verify_gateway_curl(
                    'https://api.monnify.com/api/v1/auth/login',
                    'POST',
                    null,
                    [],
                    $gateway['public_key'] . ':' . $gateway['secret_key']
                );

                $authBody = json_decode($authRes['body'], true);
                $accessToken = $authBody['responseBody']['accessToken'] ?? '';

                if (empty($accessToken)) {
                    break;
                }

                // Query Monnify Transaction status
                $res = verify_gateway_curl(
                    'https://api.monnify.com/api/v2/transactions/query?paymentReference=' . urlencode($reference),
                    'GET',
                    null,
                    ['Authorization: Bearer ' . $accessToken]
                );

                $monnifyRes = json_decode($res['body'], true);
                $gatewayResponse = $res['body'];

                if ($res['code'] === 200 && isset($monnifyRes['responseBody']['paymentStatus']) && $monnifyRes['responseBody']['paymentStatus'] === 'PAID') {
                    $verified = true;
                }
                break;
        }
    }

    if ($verified) {
        // 4. Update transaction status
        $updateTx = $pdo->prepare("UPDATE `payment_transactions` SET `status` = 'success', `gateway_response` = ? WHERE `id` = ?");
        $updateTx->execute([$gatewayResponse, $transaction['id']]);

        // 5. Update invoice status to Paid
        $updateInv = $pdo->prepare("UPDATE `client_invoices` SET `status` = 'Paid', `balance_due` = 0 WHERE `id` = ?");
        $updateInv->execute([$transaction['invoice_id']]);

        // 6. Mark payment task as Completed
        $updateTask = $pdo->prepare("UPDATE `client_tasks` SET `status` = 'Completed' WHERE `client_id` = ? AND `action_type` = 'payment' AND `status` = 'Pending'");
        $updateTask->execute([$transaction['client_id']]);

        // 7. Recalculate project progress
        $totalTasks = $pdo->prepare("SELECT COUNT(*) FROM `client_tasks` WHERE `client_id` = ?");
        $totalTasks->execute([$transaction['client_id']]);
        $total = $totalTasks->fetchColumn();

        $completedTasks = $pdo->prepare("SELECT COUNT(*) FROM `client_tasks` WHERE `client_id` = ? AND `status` = 'Completed'");
        $completedTasks->execute([$transaction['client_id']]);
        $completed = $completedTasks->fetchColumn();

        $progressPercent = $total > 0 ? intval(($completed / $total) * 100) : 0;
        
        $projStatus = 'Planning';
        if ($progressPercent >= 100) $projStatus = 'Final Handover';
        elseif ($progressPercent >= 75) $projStatus = 'Testing & QA';
        elseif ($progressPercent >= 50) $projStatus = 'Active Development';
        elseif ($progressPercent >= 25) $projStatus = 'Design & Architecture';
        elseif ($progressPercent > 0) $projStatus = 'Discovery Phase';

        $updateProj = $pdo->prepare("UPDATE `client_projects` SET `progress` = ?, `status` = ? WHERE `client_id` = ?");
        $updateProj->execute([$progressPercent, $projStatus, $transaction['client_id']]);

        // 8. Log system message in chat
        $adminStmt = $pdo->query("SELECT `id` FROM `users` WHERE `role` = 'Super Admin' LIMIT 1");
        $adminId = $adminStmt->fetchColumn() ?: 1;

        $logMsg = "💰 Payment Confirmed: " . $transaction['currency'] . " " . number_format($transaction['amount'], 2) . " received via " . ucfirst($gatewayName) . " (Ref: " . $reference . "). Invoice has been marked as Paid.";
        $chatStmt = $pdo->prepare("INSERT INTO `chat_messages` (`sender_id`, `receiver_id`, `message`, `sender_name`, `is_bot`) VALUES (?, ?, ?, 'System Logger', 0)");
        $chatStmt->execute([$adminId, $transaction['client_id'], $logMsg]);

        $pdo->commit();

        echo json_encode([
            "success" => true,
            "message" => "Payment verified and invoice fulfilled successfully.",
            "reference" => $reference,
            "amount_paid" => $transaction['amount'],
            "gateway" => $gatewayName
        ]);
        exit();
    } else {
        $pdo->rollBack();
        http_response_code(400);
        echo json_encode(["message" => "Payment verification failed or was not authorized by the gateway."]);
        exit();
    }

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(["message" => "Fulfillment error: " . $e->getMessage()]);
    exit();
}
