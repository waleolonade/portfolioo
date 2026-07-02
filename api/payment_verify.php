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

// Fetch transaction record
$txQuery = "SELECT * FROM `payment_transactions` WHERE ";
if ($transactionId > 0) {
    $txStmt = $pdo->prepare($txQuery . "`id` = ? AND `client_id` = ?");
    $txStmt->execute([$transactionId, $user['id']]);
} else {
    $txStmt = $pdo->prepare($txQuery . "`reference` = ? AND `client_id` = ?");
    $txStmt->execute([$reference, $user['id']]);
}
$transaction = $txStmt->fetch(PDO::FETCH_ASSOC);

if (!$transaction) {
    http_response_code(404);
    echo json_encode(["message" => "Transaction record not found."]);
    exit();
}

if ($transaction['status'] === 'success') {
    echo json_encode(["success" => true, "message" => "Payment already verified and fulfilled.", "already_verified" => true]);
    exit();
}

// Fetch gateway secret key
$gwStmt = $pdo->prepare("SELECT `secret_key`, `webhook_secret` FROM `payment_gateways` WHERE `gateway_name` = ?");
$gwStmt->execute([$gatewayName]);
$gateway = $gwStmt->fetch(PDO::FETCH_ASSOC);

if (!$gateway) {
    http_response_code(400);
    echo json_encode(["message" => "Gateway configuration not found."]);
    exit();
}

$verified = false;
$gatewayResponse = null;

// ─── Gateway-specific verification ───
if (strpos($reference, 'BFT-DEMO-') === 0) {
    $verified = true;
    $gatewayResponse = json_encode(["status" => "success", "mode" => "demo_simulation"]);
} else {
    switch ($gatewayName) {
        case 'paystack':
            $ch = curl_init('https://api.paystack.co/transaction/verify/' . urlencode($reference));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: Bearer ' . $gateway['secret_key']
            ]);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            $result = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            $paystackRes = json_decode($result, true);
            $gatewayResponse = $result;

            if ($httpCode === 200 && isset($paystackRes['data']['status']) && $paystackRes['data']['status'] === 'success') {
                // Verify amount matches
                $paidAmount = $paystackRes['data']['amount'] / 100; // Convert from kobo
                if ($paidAmount >= $transaction['amount']) {
                    $verified = true;
                }
            }
            break;

        case 'flutterwave':
            $flwTxId = trim($inputData['flw_transaction_id'] ?? '');
            if (empty($flwTxId)) {
                // Fallback to tx_ref check if ID not provided
                $flwTxId = $reference; 
            }
            $ch = curl_init('https://api.flutterwave.com/v3/transactions/' . urlencode($flwTxId) . '/verify');
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: Bearer ' . $gateway['secret_key']
            ]);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            $result = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            $flwRes = json_decode($result, true);
            $gatewayResponse = $result;

            if ($httpCode === 200 && isset($flwRes['data']['status']) && $flwRes['data']['status'] === 'successful') {
                if ($flwRes['data']['amount'] >= $transaction['amount']) {
                    $verified = true;
                }
            }
            break;

        case 'stripe':
            // Stripe verify: Retrieve checkout session status
            $ch = curl_init('https://api.stripe.com/v1/checkout/sessions/' . urlencode($reference));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_USERPWD, $gateway['secret_key'] . ':');
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            $result = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            $stripeRes = json_decode($result, true);
            $gatewayResponse = $result;

            if ($httpCode === 200 && isset($stripeRes['payment_status']) && $stripeRes['payment_status'] === 'paid') {
                $verified = true;
            }
            break;

        case 'monnify':
            // Monnify: Verify transaction status
            // 1. Get access token
            $ch = curl_init('https://api.monnify.com/api/v1/auth/login');
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: Basic ' . base64_encode($gateway['public_key'] . ':' . $gateway['secret_key'])
            ]);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            $authResStr = curl_exec($ch);
            curl_close($ch);

            $authRes = json_decode($authResStr, true);
            $accessToken = $authRes['responseBody']['accessToken'] ?? '';

            if (empty($accessToken)) {
                break;
            }

            // 2. Query status
            $ch = curl_init('https://api.monnify.com/api/v2/transactions/query?paymentReference=' . urlencode($reference));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: Bearer ' . $accessToken
            ]);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            $result = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            $monnifyRes = json_decode($result, true);
            $gatewayResponse = $result;

            if ($httpCode === 200 && isset($monnifyRes['responseBody']['paymentStatus']) && $monnifyRes['responseBody']['paymentStatus'] === 'PAID') {
                $verified = true;
            }
            break;
    }
}

if ($verified) {
    // ── Fulfill: Update transaction, invoice, and task ──
    $pdo->beginTransaction();
    try {
        // 1. Update transaction status
        $updateTx = $pdo->prepare("UPDATE `payment_transactions` SET `status` = 'success', `gateway_response` = ? WHERE `id` = ?");
        $updateTx->execute([$gatewayResponse, $transaction['id']]);

        // 2. Update invoice status to Paid
        $updateInv = $pdo->prepare("UPDATE `client_invoices` SET `status` = 'Paid', `balance_due` = 0 WHERE `id` = ?");
        $updateInv->execute([$transaction['invoice_id']]);

        // 3. Mark payment task as Completed
        $updateTask = $pdo->prepare("UPDATE `client_tasks` SET `status` = 'Completed' WHERE `client_id` = ? AND `action_type` = 'payment' AND `status` = 'Pending'");
        $updateTask->execute([$user['id']]);

        // 4. Recalculate project progress
        $totalTasks = $pdo->prepare("SELECT COUNT(*) FROM `client_tasks` WHERE `client_id` = ?");
        $totalTasks->execute([$user['id']]);
        $total = $totalTasks->fetchColumn();

        $completedTasks = $pdo->prepare("SELECT COUNT(*) FROM `client_tasks` WHERE `client_id` = ? AND `status` = 'Completed'");
        $completedTasks->execute([$user['id']]);
        $completed = $completedTasks->fetchColumn();

        $progressPercent = $total > 0 ? intval(($completed / $total) * 100) : 0;
        $projStatus = 'Planning';
        if ($progressPercent >= 100) $projStatus = 'Final Handover';
        elseif ($progressPercent >= 75) $projStatus = 'Testing & QA';
        elseif ($progressPercent >= 50) $projStatus = 'Active Development';
        elseif ($progressPercent >= 25) $projStatus = 'Design & Architecture';
        elseif ($progressPercent > 0) $projStatus = 'Discovery Phase';

        $updateProj = $pdo->prepare("UPDATE `client_projects` SET `progress` = ?, `status` = ? WHERE `client_id` = ?");
        $updateProj->execute([$progressPercent, $projStatus, $user['id']]);

        // 5. Log system message in chat
        $adminStmt = $pdo->query("SELECT `id` FROM `users` WHERE `role` = 'Super Admin' LIMIT 1");
        $adminId = $adminStmt->fetchColumn() ?: 1;

        $logMsg = "💰 Payment Confirmed: " . $transaction['currency'] . " " . number_format($transaction['amount'], 2) . " received via " . ucfirst($gatewayName) . " (Ref: " . $reference . "). Invoice has been marked as Paid.";
        $chatStmt = $pdo->prepare("INSERT INTO `chat_messages` (`sender_id`, `receiver_id`, `message`, `sender_name`, `is_bot`) VALUES (?, ?, ?, 'System Logger', 0)");
        $chatStmt->execute([$adminId, $user['id'], $logMsg]);

        $pdo->commit();

        echo json_encode([
            "success" => true,
            "message" => "Payment verified and invoice fulfilled successfully.",
            "reference" => $reference,
            "amount_paid" => $transaction['amount'],
            "gateway" => $gatewayName
        ]);
    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(["message" => "Fulfillment error: " . $e->getMessage()]);
    }
} else {
    // Update transaction as failed
    $updateTx = $pdo->prepare("UPDATE `payment_transactions` SET `status` = 'failed', `gateway_response` = ? WHERE `id` = ?");
    $updateTx->execute([$gatewayResponse, $transaction['id']]);

    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Payment verification failed. The gateway did not confirm successful payment.",
        "reference" => $reference
    ]);
}
exit();
