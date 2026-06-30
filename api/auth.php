<?php
require_once 'db.php';

$method = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'POST';

if ($method === 'POST') {
    // Read JSON inputs
    $inputData = json_decode(file_get_contents('php://input'), true);
    
    $usernameInput = isset($inputData['username']) ? trim($inputData['username']) : '';
    $passwordInput = isset($inputData['password']) ? trim($inputData['password']) : '';
    
    if (empty($usernameInput) || empty($passwordInput)) {
        http_response_code(400);
        echo json_encode(["message" => "Username and password are required."]);
        exit();
    }
    
    try {
        $stmt = $pdo->prepare("SELECT * FROM `users` WHERE `username` = ?");
        $stmt->execute([$usernameInput]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user && password_verify($passwordInput, $user['password'])) {
            // Generate a simple token (username + timestamp + signature)
            $secretKey = 'brainfeels_secret_key_9988';
            $expiry = time() + (3600 * 24); // Valid for 24 hours
            $tokenPayload = $user['username'] . '.' . $expiry;
            $signature = hash_hmac('sha256', $tokenPayload, $secretKey);
            $token = base64_encode($tokenPayload . '.' . $signature);
            
            echo json_encode([
                "success" => true,
                "message" => "Login successful",
                "token" => $token,
                "user" => [
                    "id" => $user['id'],
                    "username" => $user['username'],
                    "role" => $user['role']
                ]
            ]);
            exit();
        } else {
            http_response_code(401);
            echo json_encode(["message" => "Invalid username or password."]);
            exit();
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Authentication failed: " . $e->getMessage()]);
        exit();
    }
} else {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed. Only POST is supported."]);
    exit();
}
