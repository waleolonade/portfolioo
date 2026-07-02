<?php
/**
 * Payment Webhook Receiver API — Brainfeels Tech
 * Securely processes asynchronous transaction success logs directly from merchants:
 * Paystack, Flutterwave, Stripe, Monnify.
 */
require_once 'db.php';

// Log incoming request info for auditing and diagnostics
$rawBody = file_get_contents('php://input');
$headers = getallheaders();

// Helper to log webhook debug reports
function log_webhook_debug($msg) {
    error_log("[Webhook Audit] " . $msg);
}

// Fetch all enabled gateway settings
$gwStmt = $pdo->query("SELECT * FROM `payment_gateways` WHERE `is_enabled` = 1");
$enabledGateways = $gwStmt->fetchAll(PDO::FETCH_ASSOC);

$gatewaysMap = [];
foreach ($enabledGateways as $gw) {
    $gatewaysMap[$gw['gateway_name']] = $gw;
}

$detectedGateway = null;
$reference = null;
$verified = false;

// ─── 1. DETECT GATEWAY AND VERIFY CRYPTOGRAPHIC SIGNATURE ───

// A. PAYSTACK
if (isset($headers['X-Paystack-Signature'])) {
    $detectedGateway = 'paystack';
    $paystackGw = $gatewaysMap['paystack'] ?? null;
    if ($paystackGw && !empty($paystackGw['secret_key'])) {
        $expectedSignature = hash_hmac('sha512', $rawBody, $paystackGw['secret_key']);
        if (hash_equals($expectedSignature, $headers['X-Paystack-Signature'])) {
            $payload = json_decode($rawBody, true);
            if (isset($payload['event']) && $payload['event'] === 'charge.success') {
                $reference = $payload['data']['reference'] ?? null;
                $verified = ($payload['data']['status'] === 'success');
            }
        } else {
            log_webhook_debug("Paystack signature validation mismatch.");
        }
    }
}

// B. FLUTTERWAVE
elseif (isset($headers['verif-hash']) || isset($headers['Verif-Hash'])) {
    $detectedGateway = 'flutterwave';
    $flwGw = $gatewaysMap['flutterwave'] ?? null;
    $sentHash = $headers['verif-hash'] ?? $headers['Verif-Hash'];
    // Check configured webhook secret hash
    if ($flwGw && !empty($flwGw['webhook_secret']) && hash_equals($flwGw['webhook_secret'], $sentHash)) {
        $payload = json_decode($rawBody, true);
        if (isset($payload['event']) && $payload['event'] === 'charge.completed') {
            $reference = $payload['data']['tx_ref'] ?? null;
            $verified = ($payload['data']['status'] === 'successful');
        }
    } else {
        log_webhook_debug("Flutterwave webhook signature hash mismatch.");
    }
}

// C. STRIPE
elseif (isset($headers['Stripe-Signature']) || isset($headers['stripe-signature'])) {
    $detectedGateway = 'stripe';
    $stripeGw = $gatewaysMap['stripe'] ?? null;
    if ($stripeGw && !empty($stripeGw['webhook_secret'])) {
        $sigHeader = $headers['Stripe-Signature'] ?? $headers['stripe-signature'];
        
        // Manual simple Stripe signature parsing for zero-dependency implementation
        // Format: t=12323,v1=sha256_hash,v0=sha256_hash
        $sigParts = explode(',', $sigHeader);
        $timestamp = null;
        $v1Signature = null;
        foreach ($sigParts as $part) {
            $subParts = explode('=', $part, 2);
            if (count($subParts) === 2) {
                if (trim($subParts[0]) === 't') {
                    $timestamp = trim($subParts[1]);
                } elseif (trim($subParts[0]) === 'v1') {
                    $v1Signature = trim($subParts[1]);
                }
            }
        }
        
        if ($timestamp && $v1Signature) {
            $signedPayload = $timestamp . '.' . $rawBody;
            $computedSig = hash_hmac('sha256', $signedPayload, $stripeGw['webhook_secret']);
            if (hash_equals($computedSig, $v1Signature)) {
                $payload = json_decode($rawBody, true);
                if (isset($payload['type']) && $payload['type'] === 'checkout.session.completed') {
                    $reference = $payload['data']['object']['client_reference_id'] ?? null;
                    $verified = ($payload['data']['object']['payment_status'] === 'paid');
                }
            } else {
                log_webhook_debug("Stripe webhook computed signature mismatch.");
            }
        }
    }
}

// D. MONNIFY
elseif (isset($headers['monnify-signature']) || isset($headers['Monnify-Signature'])) {
    $detectedGateway = 'monnify';
    $monnifyGw = $gatewaysMap['monnify'] ?? null;
    $sentSig = $headers['monnify-signature'] ?? $headers['Monnify-Signature'];
    if ($monnifyGw && !empty($monnifyGw['secret_key'])) {
        $expectedSig = hash_hmac('sha512', $rawBody, $monnifyGw['secret_key']);
        if (hash_equals($expectedSig, $sentSig)) {
            $payload = json_decode($rawBody, true);
            if (isset($payload['eventType']) && $payload['eventType'] === 'SUCCESSFUL_TRANSACTION') {
                $reference = $payload['eventData']['paymentReference'] ?? null;
                $verified = ($payload['eventData']['paymentStatus'] === 'PAID');
            }
        } else {
            log_webhook_debug("Monnify webhook signature mismatch.");
        }
    }
}

// ─── 2. PROCESS TRANSACTION AND FULFILL INVOICE ───

if ($verified && !empty($reference)) {
    // Start database transaction with row write locking
    $pdo->beginTransaction();
    try {
        $txStmt = $pdo->prepare("SELECT * FROM `payment_transactions` WHERE `reference` = ? FOR UPDATE");
        $txStmt->execute([$reference]);
        $transaction = $txStmt->fetch(PDO::FETCH_ASSOC);

        if (!$transaction) {
            log_webhook_debug("Webhook transaction reference not found: " . $reference);
            $pdo->rollBack();
            http_response_code(404);
            echo json_encode(["status" => "ignored", "message" => "Transaction not found"]);
            exit();
        }

        // If already succeeded, exit gracefully (idempotent)
        if ($transaction['status'] === 'success') {
            $pdo->commit();
            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Already processed"]);
            exit();
        }

        // Update transaction status
        $updateTx = $pdo->prepare("UPDATE `payment_transactions` SET `status` = 'success', `gateway_response` = ? WHERE `id` = ?");
        $updateTx->execute([$rawBody, $transaction['id']]);

        // Update invoice to Paid
        $updateInv = $pdo->prepare("UPDATE `client_invoices` SET `status` = 'Paid', `balance_due` = 0 WHERE `id` = ?");
        $updateInv->execute([$transaction['invoice_id']]);

        // Mark client workspace tasks complete
        $updateTask = $pdo->prepare("UPDATE `client_tasks` SET `status` = 'Completed' WHERE `client_id` = ? AND `action_type` = 'payment' AND `status` = 'Pending'");
        $updateTask->execute([$transaction['client_id']]);

        // Recalculate client progress index
        $totalStmt = $pdo->prepare("SELECT COUNT(*) FROM `client_tasks` WHERE `client_id` = ?");
        $totalStmt->execute([$transaction['client_id']]);
        $total = $totalStmt->fetchColumn();

        $completedStmt = $pdo->prepare("SELECT COUNT(*) FROM `client_tasks` WHERE `client_id` = ? AND `status` = 'Completed'");
        $completedStmt->execute([$transaction['client_id']]);
        $completed = $completedStmt->fetchColumn();

        $progressPercent = $total > 0 ? intval(($completed / $total) * 100) : 0;
        
        $projStatus = 'Planning';
        if ($progressPercent >= 100) $projStatus = 'Final Handover';
        elseif ($progressPercent >= 75) $projStatus = 'Testing & QA';
        elseif ($progressPercent >= 50) $projStatus = 'Active Development';
        elseif ($progressPercent >= 25) $projStatus = 'Design & Architecture';
        elseif ($progressPercent > 0) $projStatus = 'Discovery Phase';

        $updateProj = $pdo->prepare("UPDATE `client_projects` SET `progress` = ?, `status` = ? WHERE `client_id` = ?");
        $updateProj->execute([$progressPercent, $projStatus, $transaction['client_id']]);

        // Insert webhook system log in portal chat stream
        $adminStmt = $pdo->query("SELECT `id` FROM `users` WHERE `role` = 'Super Admin' LIMIT 1");
        $adminId = $adminStmt->fetchColumn() ?: 1;

        $logMsg = "⚡ Webhook confirmed: " . $transaction['currency'] . " " . number_format($transaction['amount'], 2) . " verified via " . ucfirst($detectedGateway) . " callback (Ref: " . $reference . "). Invoice marked as Paid.";
        
        $chatStmt = $pdo->prepare("INSERT INTO `chat_messages` (`sender_id`, `receiver_id`, `message`, `sender_name`, `is_bot`) VALUES (?, ?, ?, 'System Webhook', 0)");
        $chatStmt->execute([$adminId, $transaction['client_id'], $logMsg]);

        $pdo->commit();
        
        http_response_code(200);
        echo json_encode(["status" => "success", "message" => "Webhook processed and invoice fulfilled"]);
        exit();

    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        log_webhook_debug("Fulfillment database error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database error occurred"]);
        exit();
    }
}

// Signature mismatch or invalid event
http_response_code(400);
echo json_encode(["status" => "error", "message" => "Invalid payload signature or event type rejected"]);
exit();
