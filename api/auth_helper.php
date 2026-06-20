<?php
function verify_admin_token() {
    $secretKey = 'brainfeels_secret_key_9988';
    
    // Get Authorization header
    $headers = apache_request_headers();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    
    // Support lowercase or HTTP_AUTHORIZATION fallback
    if (empty($authHeader)) {
        if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
        } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        }
    }
    
    if (empty($authHeader)) {
        http_response_code(401);
        echo json_encode(["message" => "Access denied. Token missing."]);
        exit();
    }
    
    // Extract token (remove "Bearer " prefix if present)
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $token = $matches[1];
    } else {
        $token = $authHeader;
    }
    
    // Decode and verify token
    $decoded = base64_decode($token);
    if (!$decoded) {
        http_response_code(401);
        echo json_encode(["message" => "Access denied. Invalid token format."]);
        exit();
    }
    
    $parts = explode('.', $decoded);
    if (count($parts) !== 3) {
        http_response_code(401);
        echo json_encode(["message" => "Access denied. Malformed token."]);
        exit();
    }
    
    $username = $parts[0];
    $expiry = intval($parts[1]);
    $signature = $parts[2];
    
    // Check expiration
    if (time() > $expiry) {
        http_response_code(401);
        echo json_encode(["message" => "Access denied. Token expired."]);
        exit();
    }
    
    // Verify signature
    $tokenPayload = $username . '.' . $expiry;
    $expectedSignature = hash_hmac('sha256', $tokenPayload, $secretKey);
    
    if (!hash_equals($expectedSignature, $signature)) {
        http_response_code(401);
        echo json_encode(["message" => "Access denied. Invalid signature."]);
        exit();
    }
    
    return $username; // Token is valid, return the authenticated user's name
}

function verify_user_role($allowedRoles, $pdo) {
    $username = verify_admin_token();
    
    try {
        $stmt = $pdo->prepare("SELECT `id`, `username`, `role` FROM `users` WHERE `username` = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            http_response_code(401);
            echo json_encode(["message" => "Access denied. User not found."]);
            exit();
        }
        
        if ($user['role'] === 'Super Admin') {
            return $user; // Super Admin bypasses all checks
        }
        
        if (!in_array($user['role'], $allowedRoles)) {
            http_response_code(403);
            echo json_encode(["message" => "Permission denied. You do not have the required access role."]);
            exit();
        }
        
        return $user;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Database authentication error: " . $e->getMessage()]);
        exit();
    }
}
