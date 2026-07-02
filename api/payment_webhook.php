<?php
/**
 * Payment Webhook Receiver API — Brainfeels Tech
 * Securely processes asynchronous transaction success logs directly from merchants
 * using the Unified Payment Engine factory.
 */
require_once 'db.php';
require_once __DIR__ . '/payment/services/PaymentService.php';

// Log incoming request info for auditing and diagnostics
$rawBody = file_get_contents('php://input');
$headers = getallheaders();

// 1. Detect merchant gateway type
$detectedGateway = null;
if (isset($headers['X-Paystack-Signature'])) {
    $detectedGateway = 'paystack';
} elseif (isset($headers['verif-hash']) || isset($headers['Verif-Hash'])) {
    $detectedGateway = 'flutterwave';
} elseif (isset($headers['Stripe-Signature']) || isset($headers['stripe-signature'])) {
    $detectedGateway = 'stripe';
} elseif (isset($headers['monnify-signature']) || isset($headers['Monnify-Signature'])) {
    $detectedGateway = 'monnify';
}

if (!$detectedGateway) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Unknown merchant source signature headers rejected."]);
    exit();
}

// 2. Insert initial entry into webhook_logs table
$headersJson = json_encode($headers);
$insLog = $pdo->prepare("INSERT INTO `webhook_logs` (`gateway`, `payload`, `headers`, `verified`, `processed`) VALUES (?, ?, ?, 0, 0)");
$insLog->execute([$detectedGateway, $rawBody, $headersJson]);
$logId = $pdo->lastInsertId();

// 3. Fetch gateway configuration from database
$gwStmt = $pdo->prepare("SELECT * FROM `payment_gateways` WHERE `gateway_name` = ? AND `is_enabled` = 1");
$gwStmt->execute([$detectedGateway]);
$gatewayConfig = $gwStmt->fetch(PDO::FETCH_ASSOC);

if (!$gatewayConfig) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Gateway is disabled or not configured."]);
    exit();
}

try {
    // 4. Delegate signature verification to the respective Gateway Adapter
    $gatewayAdapter = PaymentFactory::make($detectedGateway);
    $handlerRes = $gatewayAdapter->webhookHandler($rawBody, $headers, $gatewayConfig);

    if (isset($handlerRes['verified']) && $handlerRes['verified'] === true) {
        // Mark webhook log as verified
        $upLog = $pdo->prepare("UPDATE `webhook_logs` SET `verified` = 1 WHERE `id` = ?");
        $upLog->execute([$logId]);

        if (isset($handlerRes['status']) && $handlerRes['status'] === 'success') {
            $reference = $handlerRes['reference'];
            
            // 5. Trigger Unified Verify Fulfillment flow
            $paymentService = new PaymentService($pdo);
            $verifyRes = $paymentService->verify($reference, $detectedGateway, [
                "flw_transaction_id" => $handlerRes['provider_reference'] ?? ''
            ]);

            if ($verifyRes['success']) {
                // Mark webhook log as fully processed
                $upLog = $pdo->prepare("UPDATE `webhook_logs` SET `processed` = 1 WHERE `id` = ?");
                $upLog->execute([$logId]);

                http_response_code(200);
                echo json_encode(["status" => "success", "message" => "Webhook processed and invoice fulfilled"]);
                exit();
            } else {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => $verifyRes['error']]);
                exit();
            }
        } else {
            // Ignored events (e.g. subscription canceled, customer created, etc.)
            $upLog = $pdo->prepare("UPDATE `webhook_logs` SET `processed` = 1 WHERE `id` = ?");
            $upLog->execute([$logId]);

            http_response_code(200);
            echo json_encode(["status" => "ignored", "message" => "Event type ignored"]);
            exit();
        }
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => $handlerRes['error'] ?? "Cryptographic signature validation failed"]);
        exit();
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Exception during processing: " . $e->getMessage()]);
    exit();
}
