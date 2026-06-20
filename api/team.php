<?php
require_once 'db.php';
require_once 'auth_helper.php';

$method = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'GET';

switch ($method) {
    case 'GET':
        try {
            if (isset($_GET['id'])) {
                $stmt = $pdo->prepare("SELECT * FROM `team_members` WHERE `id` = ?");
                $stmt->execute([intval($_GET['id'])]);
                $member = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($member) {
                    // Decode social links JSON if necessary
                    if ($member['social_links']) {
                        $member['social_links'] = json_decode($member['social_links'], true);
                    }
                    echo json_encode($member);
                } else {
                    http_response_code(404);
                    echo json_encode(["message" => "Team member not found."]);
                }
            } else {
                $stmt = $pdo->query("SELECT * FROM `team_members` ORDER BY `id` ASC");
                $members = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Decode social links JSON for each member
                foreach ($members as &$m) {
                    if ($m['social_links']) {
                        $m['social_links'] = json_decode($m['social_links'], true);
                    }
                }
                echo json_encode($members);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Failed to fetch team members: " . $e->getMessage()]);
        }
        break;
        
    case 'POST':
        verify_user_role(['Content Editor'], $pdo);
        
        $inputData = json_decode(file_get_contents('php://input'), true);
        
        $name = isset($inputData['name']) ? trim($inputData['name']) : '';
        $position = isset($inputData['position']) ? trim($inputData['position']) : '';
        $bio = isset($inputData['bio']) ? trim($inputData['bio']) : '';
        $skills = isset($inputData['skills']) ? trim($inputData['skills']) : '';
        $image_url = isset($inputData['image_url']) ? trim($inputData['image_url']) : '';
        $social_links = isset($inputData['social_links']) ? $inputData['social_links'] : null;
        
        if (empty($name) || empty($position) || empty($bio)) {
            http_response_code(400);
            echo json_encode(["message" => "Name, position, and bio are required fields."]);
            exit();
        }
        
        // Encode social links as JSON
        $socialJson = $social_links ? json_encode($social_links) : null;
        
        try {
            $stmt = $pdo->prepare("INSERT INTO `team_members` (`name`, `position`, `bio`, `skills`, `image_url`, `social_links`) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$name, $position, $bio, $skills, $image_url, $socialJson]);
            
            echo json_encode([
                "success" => true,
                "message" => "Team member created successfully.",
                "id" => $pdo->lastInsertId()
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Failed to create team member: " . $e->getMessage()]);
        }
        break;
        
    case 'PUT':
        verify_user_role(['Content Editor'], $pdo);
        
        $inputData = json_decode(file_get_contents('php://input'), true);
        
        $id = isset($_GET['id']) ? intval($_GET['id']) : (isset($inputData['id']) ? intval($inputData['id']) : 0);
        $name = isset($inputData['name']) ? trim($inputData['name']) : '';
        $position = isset($inputData['position']) ? trim($inputData['position']) : '';
        $bio = isset($inputData['bio']) ? trim($inputData['bio']) : '';
        $skills = isset($inputData['skills']) ? trim($inputData['skills']) : '';
        $image_url = isset($inputData['image_url']) ? trim($inputData['image_url']) : '';
        $social_links = isset($inputData['social_links']) ? $inputData['social_links'] : null;
        
        if ($id <= 0 || empty($name) || empty($position) || empty($bio)) {
            http_response_code(400);
            echo json_encode(["message" => "Invalid ID or missing required fields."]);
            exit();
        }
        
        $socialJson = $social_links ? json_encode($social_links) : null;
        
        try {
            $stmt = $pdo->prepare("UPDATE `team_members` SET `name` = ?, `position` = ?, `bio` = ?, `skills` = ?, `image_url` = ?, `social_links` = ? WHERE `id` = ?");
            $stmt->execute([$name, $position, $bio, $skills, $image_url, $socialJson, $id]);
            
            echo json_encode([
                "success" => true,
                "message" => "Team member updated successfully."
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Failed to update team member: " . $e->getMessage()]);
        }
        break;
        
    case 'DELETE':
        verify_user_role(['Content Editor'], $pdo);
        
        $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
        
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(["message" => "Invalid team member ID."]);
            exit();
        }
        
        try {
            $stmt = $pdo->prepare("DELETE FROM `team_members` WHERE `id` = ?");
            $stmt->execute([$id]);
            
            echo json_encode([
                "success" => true,
                "message" => "Team member deleted successfully."
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Failed to delete team member: " . $e->getMessage()]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed."]);
        break;
}
