<?php
require_once 'db.php';
require_once 'auth_helper.php';

$method = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'GET';

switch ($method) {
    case 'GET':
        try {
            if (isset($_GET['id'])) {
                $stmt = $pdo->prepare("SELECT * FROM `testimonials` WHERE `id` = ?");
                $stmt->execute([intval($_GET['id'])]);
                $testimonial = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($testimonial) {
                    echo json_encode($testimonial);
                } else {
                    http_response_code(404);
                    echo json_encode(["message" => "Testimonial not found."]);
                }
            } else {
                $stmt = $pdo->query("SELECT * FROM `testimonials` ORDER BY `id` DESC");
                $testimonials = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($testimonials);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Failed to fetch testimonials: " . $e->getMessage()]);
        }
        break;
        
    case 'POST':
        verify_user_role(['Content Editor'], $pdo);
        
        $inputData = json_decode(file_get_contents('php://input'), true);
        
        $client_name = isset($inputData['client_name']) ? trim($inputData['client_name']) : '';
        $client_role = isset($inputData['client_role']) ? trim($inputData['client_role']) : '';
        $company_name = isset($inputData['company_name']) ? trim($inputData['company_name']) : '';
        $rating = isset($inputData['rating']) ? intval($inputData['rating']) : 5;
        $text = isset($inputData['text']) ? trim($inputData['text']) : '';
        $image_url = isset($inputData['image_url']) ? trim($inputData['image_url']) : '';
        
        if (empty($client_name) || empty($client_role) || empty($company_name) || empty($text)) {
            http_response_code(400);
            echo json_encode(["message" => "Client name, role, company, and review text are required fields."]);
            exit();
        }
        
        try {
            $stmt = $pdo->prepare("INSERT INTO `testimonials` (`client_name`, `client_role`, `company_name`, `rating`, `text`, `image_url`) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$client_name, $client_role, $company_name, $rating, $text, $image_url]);
            
            echo json_encode([
                "success" => true,
                "message" => "Testimonial created successfully.",
                "id" => $pdo->lastInsertId()
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Failed to create testimonial: " . $e->getMessage()]);
        }
        break;
        
    case 'PUT':
        verify_user_role(['Content Editor'], $pdo);
        
        $inputData = json_decode(file_get_contents('php://input'), true);
        
        $id = isset($_GET['id']) ? intval($_GET['id']) : (isset($inputData['id']) ? intval($inputData['id']) : 0);
        $client_name = isset($inputData['client_name']) ? trim($inputData['client_name']) : '';
        $client_role = isset($inputData['client_role']) ? trim($inputData['client_role']) : '';
        $company_name = isset($inputData['company_name']) ? trim($inputData['company_name']) : '';
        $rating = isset($inputData['rating']) ? intval($inputData['rating']) : 5;
        $text = isset($inputData['text']) ? trim($inputData['text']) : '';
        $image_url = isset($inputData['image_url']) ? trim($inputData['image_url']) : '';
        
        if ($id <= 0 || empty($client_name) || empty($client_role) || empty($company_name) || empty($text)) {
            http_response_code(400);
            echo json_encode(["message" => "Invalid ID or missing required fields."]);
            exit();
        }
        
        try {
            $stmt = $pdo->prepare("UPDATE `testimonials` SET `client_name` = ?, `client_role` = ?, `company_name` = ?, `rating` = ?, `text` = ?, `image_url` = ? WHERE `id` = ?");
            $stmt->execute([$client_name, $client_role, $company_name, $rating, $text, $image_url, $id]);
            
            echo json_encode([
                "success" => true,
                "message" => "Testimonial updated successfully."
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Failed to update testimonial: " . $e->getMessage()]);
        }
        break;
        
    case 'DELETE':
        verify_user_role(['Content Editor'], $pdo);
        
        $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
        
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(["message" => "Invalid testimonial ID."]);
            exit();
        }
        
        try {
            $stmt = $pdo->prepare("DELETE FROM `testimonials` WHERE `id` = ?");
            $stmt->execute([$id]);
            
            echo json_encode([
                "success" => true,
                "message" => "Testimonial deleted successfully."
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Failed to delete testimonial: " . $e->getMessage()]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed."]);
        break;
}
