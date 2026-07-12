<?php
require_once 'db.php';
require_once 'auth_helper.php';

header('Content-Type: application/json');

// 1. Ensure client_notifications table exists
try {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `client_notifications` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `client_id` INT NOT NULL,
            `title` VARCHAR(255) NOT NULL,
            `message` TEXT NOT NULL,
            `read_status` TINYINT DEFAULT 0,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Database setup error: " . $e->getMessage()]);
    exit();
}

$username = verify_admin_token();

try {
    // Get user details
    $userStmt = $pdo->prepare("SELECT `id`, `role` FROM `users` WHERE `username` = ?");
    $userStmt->execute([$username]);
    $currentUser = $userStmt->fetch(PDO::FETCH_ASSOC);

    if (!$currentUser) {
        http_response_code(401);
        echo json_encode(["message" => "Invalid session."]);
        exit();
    }

    $currentUserId = intval($currentUser['id']);
    $currentUserRole = $currentUser['role'];

    $method = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'GET';

    if ($method === 'GET') {
        // Clients fetch their own notifications. PM/Support can fetch notifications for a client if query param is set.
        $targetClientId = ($currentUserRole === 'Client') ? $currentUserId : (isset($_GET['client_id']) ? intval($_GET['client_id']) : 0);
        
        if ($targetClientId <= 0) {
            echo json_encode([]);
            exit();
        }

        $stmt = $pdo->prepare("SELECT * FROM `client_notifications` WHERE `client_id` = ? ORDER BY `created_at` DESC LIMIT 50");
        $stmt->execute([$targetClientId]);
        $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($notifications);
        exit();
    }

    if ($method === 'POST') {
        // Create notification
        $input = json_decode(file_get_contents('php://input'), true);
        $clientId = isset($input['client_id']) ? intval($input['client_id']) : 0;
        $title = isset($input['title']) ? trim($input['title']) : '';
        $message = isset($input['message']) ? trim($input['message']) : '';

        if ($clientId <= 0 || empty($title) || empty($message)) {
            http_response_code(400);
            echo json_encode(["message" => "client_id, title, and message are required."]);
            exit();
        }

        $stmt = $pdo->prepare("INSERT INTO `client_notifications` (`client_id`, `title`, `message`) VALUES (?, ?, ?)");
        $stmt->execute([$clientId, $title, $message]);
        $insertId = $pdo->lastInsertId();

        // Trigger real-time broadcast via WebSocket server (port 8090) if running
        $socketPayload = json_encode([
            "type" => "notification",
            "client_id" => $clientId,
            "id" => $insertId,
            "title" => $title,
            "message" => $message,
            "created_at" => date('Y-m-d H:i:s')
        ]);

        // Attempt a quick connection to socket server to broadcast
        $fp = @fsockopen("127.0.0.1", 8090, $errno, $errstr, 0.5);
        if ($fp) {
            // Write standard WebSocket frame payload or broadcast message
            // Since this is a simple local broadcast channel, we prefix with a custom signature or write raw JSON
            fwrite($fp, "BROADCAST_JSON:" . $socketPayload . "\n");
            fclose($fp);
        }

        echo json_encode([
            "success" => true,
            "message" => "Notification created successfully.",
            "id" => $insertId
        ]);
        exit();
    }

    if ($method === 'PUT') {
        // Mark all or a specific notification as read
        $input = json_decode(file_get_contents('php://input'), true);
        $notificationId = isset($input['id']) ? intval($input['id']) : 0;

        if ($notificationId > 0) {
            // Specific notification
            $stmt = $pdo->prepare("UPDATE `client_notifications` SET `read_status` = 1 WHERE `id` = ? AND (`client_id` = ? OR ? = 'Super Admin')");
            $stmt->execute([$notificationId, $currentUserId, $currentUserRole]);
        } else {
            // All notifications for client
            $stmt = $pdo->prepare("UPDATE `client_notifications` SET `read_status` = 1 WHERE `client_id` = ?");
            $stmt->execute([$currentUserId]);
        }

        echo json_encode(["success" => true, "message" => "Notifications updated."]);
        exit();
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Notifications operation failed: " . $e->getMessage()]);
}
