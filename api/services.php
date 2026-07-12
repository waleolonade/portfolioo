<?php
require_once 'db.php';
require_once 'auth_helper.php';

$method = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'GET';

switch ($method) {
    case 'GET':
        try {
            if (isset($_GET['id'])) {
                $stmt = $pdo->prepare("SELECT * FROM `services` WHERE `id` = ?");
                $stmt->execute([intval($_GET['id'])]);
                $service = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($service) {
                    echo json_encode($service);
                } else {
                    http_response_code(404);
                    echo json_encode(["message" => "Service not found."]);
                }
            } else {
                $stmt = $pdo->query("SELECT * FROM `services` ORDER BY `id` ASC");
                $services = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($services);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Failed to fetch services: " . $e->getMessage()]);
        }
        break;
        
    case 'POST':
        // Secure Route: Allowed for Super Admin and Content Editor
        verify_user_role(['Content Editor'], $pdo);
        
        $inputData = json_decode(file_get_contents('php://input'), true);
        
        $name = isset($inputData['name']) ? trim($inputData['name']) : '';
        $description = isset($inputData['description']) ? trim($inputData['description']) : '';
        $benefits = isset($inputData['benefits']) ? trim($inputData['benefits']) : '';
        $features = isset($inputData['features']) ? trim($inputData['features']) : '';
        $icon_name = isset($inputData['icon_name']) ? trim($inputData['icon_name']) : 'Code';
        $image_url = isset($inputData['image_url']) ? trim($inputData['image_url']) : '';
        $basic_price = isset($inputData['basic_price']) ? floatval($inputData['basic_price']) : 0.00;
        $standard_price = isset($inputData['standard_price']) ? floatval($inputData['standard_price']) : 0.00;
        $premium_price = isset($inputData['premium_price']) ? floatval($inputData['premium_price']) : 0.00;
        
        if (empty($name) || empty($description) || empty($benefits) || empty($features)) {
            http_response_code(400);
            echo json_encode(["message" => "Name, description, benefits, and features are required fields."]);
            exit();
        }
        
        try {
            $stmt = $pdo->prepare("INSERT INTO `services` (`name`, `description`, `benefits`, `features`, `icon_name`, `image_url`, `basic_price`, `standard_price`, `premium_price`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$name, $description, $benefits, $features, $icon_name, $image_url, $basic_price, $standard_price, $premium_price]);
            
            echo json_encode([
                "success" => true,
                "message" => "Service created successfully.",
                "id" => $pdo->lastInsertId()
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Failed to create service: " . $e->getMessage()]);
        }
        break;
        
    case 'PUT':
        // Secure Route: Allowed for Super Admin and Content Editor
        verify_user_role(['Content Editor'], $pdo);
        
        $inputData = json_decode(file_get_contents('php://input'), true);
        
        $id = isset($_GET['id']) ? intval($_GET['id']) : (isset($inputData['id']) ? intval($inputData['id']) : 0);
        $name = isset($inputData['name']) ? trim($inputData['name']) : '';
        $description = isset($inputData['description']) ? trim($inputData['description']) : '';
        $benefits = isset($inputData['benefits']) ? trim($inputData['benefits']) : '';
        $features = isset($inputData['features']) ? trim($inputData['features']) : '';
        $icon_name = isset($inputData['icon_name']) ? trim($inputData['icon_name']) : 'Code';
        $image_url = isset($inputData['image_url']) ? trim($inputData['image_url']) : '';
        $basic_price = isset($inputData['basic_price']) ? floatval($inputData['basic_price']) : 0.00;
        $standard_price = isset($inputData['standard_price']) ? floatval($inputData['standard_price']) : 0.00;
        $premium_price = isset($inputData['premium_price']) ? floatval($inputData['premium_price']) : 0.00;
        
        if ($id <= 0 || empty($name) || empty($description) || empty($benefits) || empty($features)) {
            http_response_code(400);
            echo json_encode(["message" => "Invalid ID or missing required fields."]);
            exit();
        }
        
        try {
            $stmt = $pdo->prepare("UPDATE `services` SET `name` = ?, `description` = ?, `benefits` = ?, `features` = ?, `icon_name` = ?, `image_url` = ?, `basic_price` = ?, `standard_price` = ?, `premium_price` = ? WHERE `id` = ?");
            $stmt->execute([$name, $description, $benefits, $features, $icon_name, $image_url, $basic_price, $standard_price, $premium_price, $id]);
            
            echo json_encode([
                "success" => true,
                "message" => "Service updated successfully."
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Failed to update service: " . $e->getMessage()]);
        }
        break;
        
    case 'DELETE':
        // Secure Route: Allowed for Super Admin and Content Editor
        verify_user_role(['Content Editor'], $pdo);
        
        $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
        
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(["message" => "Invalid service ID."]);
            exit();
        }
        
        try {
            $stmt = $pdo->prepare("DELETE FROM `services` WHERE `id` = ?");
            $stmt->execute([$id]);
            
            echo json_encode([
                "success" => true,
                "message" => "Service deleted successfully."
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Failed to delete service: " . $e->getMessage()]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed."]);
        break;
}
