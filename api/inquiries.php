<?php
require_once 'db.php';
require_once 'auth_helper.php';

$method = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'GET';

switch ($method) {
    case 'GET':
        // Secure Route
        verify_admin_token();
        
        try {
            $stmt = $pdo->query("SELECT * FROM `inquiries` ORDER BY `created_at` DESC");
            $inquiries = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($inquiries);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Failed to fetch inquiries: " . $e->getMessage()]);
        }
        break;
        
    case 'POST':
        // Public Route - Contact form submissions
        $inputData = json_decode(file_get_contents('php://input'), true);
        
        $name = isset($inputData['name']) ? trim($inputData['name']) : '';
        $email = isset($inputData['email']) ? trim($inputData['email']) : '';
        $subject = isset($inputData['subject']) ? trim($inputData['subject']) : '';
        $message = isset($inputData['message']) ? trim($inputData['message']) : '';
        
        if (empty($name) || empty($email) || empty($subject) || empty($message)) {
            http_response_code(400);
            echo json_encode(["message" => "All contact fields (name, email, subject, message) are required."]);
            exit();
        }
        
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(["message" => "Invalid email address format."]);
            exit();
        }
        
        try {
            $stmt = $pdo->prepare("INSERT INTO `inquiries` (`name`, `email`, `subject`, `message`) VALUES (?, ?, ?, ?)");
            $stmt->execute([$name, $email, $subject, $message]);
            
            echo json_encode([
                "success" => true,
                "message" => "Your message has been sent successfully. We will get back to you soon!"
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Failed to send message: " . $e->getMessage()]);
        }
        break;
        
    case 'PUT':
        // Secure Route - Update status (e.g. mark as read)
        verify_admin_token();
        
        $inputData = json_decode(file_get_contents('php://input'), true);
        
        $id = isset($_GET['id']) ? intval($_GET['id']) : (isset($inputData['id']) ? intval($inputData['id']) : 0);
        $status = isset($inputData['status']) ? trim($inputData['status']) : 'read';
        
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(["message" => "Invalid inquiry ID."]);
            exit();
        }
        
        try {
            $stmt = $pdo->prepare("UPDATE `inquiries` SET `status` = ? WHERE `id` = ?");
            $stmt->execute([$status, $id]);
            
            echo json_encode([
                "success" => true,
                "message" => "Inquiry status updated successfully."
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Failed to update inquiry: " . $e->getMessage()]);
        }
        break;
        
    case 'DELETE':
        // Secure Route - Delete inquiry
        verify_admin_token();
        
        $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
        
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(["message" => "Invalid inquiry ID."]);
            exit();
        }
        
        try {
            $stmt = $pdo->prepare("DELETE FROM `inquiries` WHERE `id` = ?");
            $stmt->execute([$id]);
            
            echo json_encode([
                "success" => true,
                "message" => "Inquiry deleted successfully."
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Failed to delete inquiry: " . $e->getMessage()]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed."]);
        break;
}
