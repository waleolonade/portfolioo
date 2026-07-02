<?php
/**
 * Payment Initialization API
 * Creates payment transactions and initializes with the selected gateway, with automatic failover chain.
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

try {
    // Instantiate Unified Payment Service
    $paymentService = new PaymentService($pdo);
    
    // Initialize transaction with automatic gateway failovers
    $responseData = $paymentService->initialize($invoiceId, $user, $gatewayName);
    
    echo json_encode($responseData);
    exit();
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(["message" => $e->getMessage()]);
    exit();
}
