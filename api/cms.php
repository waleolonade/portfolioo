<?php
require_once 'db.php';
require_once 'auth_helper.php';

$method = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'GET';

switch ($method) {
    case 'GET':
        try {
            $stmt = $pdo->query("SELECT `setting_key`, `setting_value` FROM `cms_settings`");
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $settings = [];
            foreach ($rows as $row) {
                $settings[$row['setting_key']] = $row['setting_value'];
            }
            
            echo json_encode($settings);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Failed to fetch settings: " . $e->getMessage()]);
        }
        break;
        
    case 'POST':
    case 'PUT':
        // Secure Route: Allowed for Content Editor
        verify_user_role(['Content Editor'], $pdo);
        
        $inputData = json_decode(file_get_contents('php://input'), true);
        
        if (!is_array($inputData)) {
            http_response_code(400);
            echo json_encode(["message" => "Invalid inputs. Expected key-value object."]);
            exit();
        }
        
        try {
            $pdo->beginTransaction();
            
            $stmt = $pdo->prepare("INSERT INTO `cms_settings` (`setting_key`, `setting_value`) 
                                   VALUES (?, ?) 
                                   ON DUPLICATE KEY UPDATE `setting_value` = ?");
                                   
            foreach ($inputData as $key => $value) {
                // Ensure key is trimmed and valid
                $trimmedKey = trim($key);
                $trimmedValue = trim($value);
                if (!empty($trimmedKey)) {
                    $stmt->execute([$trimmedKey, $trimmedValue, $trimmedValue]);
                }
            }
            
            $pdo->commit();
            echo json_encode([
                "success" => true,
                "message" => "CMS configurations saved successfully."
            ]);
        } catch (PDOException $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(["message" => "Failed to save CMS settings: " . $e->getMessage()]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed."]);
        break;
}
