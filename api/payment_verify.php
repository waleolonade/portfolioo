<?php
/**
 * Payment Verification API
 * Verifies payment status with the respective gateway and fulfills the invoice.
 */
require_once 'db.php';
require_once 'auth_helper.php';
require_once __DIR__ . '/payment/services/PaymentService.php';

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

if (empty($reference) || empty($gatewayName)) {
    http_response_code(400);
    echo json_encode(["message" => "Payment reference and gateway are required."]);
    exit();
}

try {
    $paymentService = new PaymentService($pdo);
    $res = $paymentService->verify($reference, $gatewayName, $inputData);
    
    if ($res['success']) {
        // Query details to trigger client notification
        $txStmt = $pdo->prepare("SELECT `client_id`, `invoice_id`, `amount` FROM `payment_transactions` WHERE `reference` = ? LIMIT 1");
        $txStmt->execute([$reference]);
        $txRow = $txStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($txRow) {
            $txClientId = intval($txRow['client_id']);
            $txInvId = intval($txRow['invoice_id']);
            
            $invStmt = $pdo->prepare("SELECT `invoice_code` FROM `client_invoices` WHERE `id` = ? LIMIT 1");
            $invStmt->execute([$txInvId]);
            $invCode = $invStmt->fetchColumn() ?: "Invoice";
            
            create_notification($txClientId, "Payment Received", "Your payment of " . number_format($txRow['amount'], 2) . " for invoice {$invCode} via " . ucfirst($gatewayName) . " was received.", $pdo);
        }

        echo json_encode([
            "success" => true,
            "message" => "Payment verified and invoice fulfilled successfully.",
            "reference" => $reference,
            "amount_paid" => $res['amount'] ?? 0.00,
            "gateway" => $gatewayName
        ]);
        exit();
    } else {
        http_response_code(400);
        echo json_encode(["message" => $res['error']]);
        exit();
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Verification error: " . $e->getMessage()]);
    exit();
}
