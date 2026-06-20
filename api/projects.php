<?php
require_once 'db.php';
require_once 'auth_helper.php';

$method = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'GET';

switch ($method) {
    case 'GET':
        try {
            if (isset($_GET['id'])) {
                $stmt = $pdo->prepare("SELECT * FROM `projects` WHERE `id` = ?");
                $stmt->execute([intval($_GET['id'])]);
                $project = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($project) {
                    echo json_encode($project);
                } else {
                    http_response_code(404);
                    echo json_encode(["message" => "Project not found."]);
                }
            } else {
                $stmt = $pdo->query("SELECT * FROM `projects` ORDER BY `created_at` DESC");
                $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($projects);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Failed to fetch projects: " . $e->getMessage()]);
        }
        break;
        
    case 'POST':
        // Secure Route
        verify_admin_token();
        
        $inputData = json_decode(file_get_contents('php://input'), true);
        
        $title = isset($inputData['title']) ? trim($inputData['title']) : '';
        $category = isset($inputData['category']) ? trim($inputData['category']) : '';
        $summary = isset($inputData['summary']) ? trim($inputData['summary']) : (isset($inputData['description']) ? trim($inputData['description']) : '');
        $challenge = isset($inputData['challenge']) ? trim($inputData['challenge']) : '';
        $solution = isset($inputData['solution']) ? trim($inputData['solution']) : '';
        $client_name = isset($inputData['client_name']) ? trim($inputData['client_name']) : '';
        $completion_date = isset($inputData['completion_date']) ? trim($inputData['completion_date']) : '';
        $results_metric = isset($inputData['results_metric']) ? trim($inputData['results_metric']) : '';
        $image_url = isset($inputData['image_url']) ? trim($inputData['image_url']) : '';
        $project_url = isset($inputData['project_url']) ? trim($inputData['project_url']) : '';
        $github_url = isset($inputData['github_url']) ? trim($inputData['github_url']) : '';
        $tech_stack = isset($inputData['tech_stack']) ? trim($inputData['tech_stack']) : '';
        
        if (empty($title) || empty($category) || empty($summary) || empty($image_url)) {
            http_response_code(400);
            echo json_encode(["message" => "Title, category, summary, and image URL are required fields."]);
            exit();
        }
        
        try {
            $stmt = $pdo->prepare("INSERT INTO `projects` (`title`, `category`, `client_name`, `completion_date`, `summary`, `challenge`, `solution`, `results_metric`, `image_url`, `project_url`, `github_url`, `tech_stack`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$title, $category, $client_name, $completion_date, $summary, $challenge, $solution, $results_metric, $image_url, $project_url, $github_url, $tech_stack]);
            
            $newId = $pdo->lastInsertId();
            echo json_encode([
                "success" => true,
                "message" => "Project created successfully.",
                "id" => $newId
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Failed to create project: " . $e->getMessage()]);
        }
        break;
        
    case 'PUT':
        // Secure Route
        verify_admin_token();
        
        $inputData = json_decode(file_get_contents('php://input'), true);
        
        $id = isset($_GET['id']) ? intval($_GET['id']) : (isset($inputData['id']) ? intval($inputData['id']) : 0);
        $title = isset($inputData['title']) ? trim($inputData['title']) : '';
        $category = isset($inputData['category']) ? trim($inputData['category']) : '';
        $summary = isset($inputData['summary']) ? trim($inputData['summary']) : (isset($inputData['description']) ? trim($inputData['description']) : '');
        $challenge = isset($inputData['challenge']) ? trim($inputData['challenge']) : '';
        $solution = isset($inputData['solution']) ? trim($inputData['solution']) : '';
        $client_name = isset($inputData['client_name']) ? trim($inputData['client_name']) : '';
        $completion_date = isset($inputData['completion_date']) ? trim($inputData['completion_date']) : '';
        $results_metric = isset($inputData['results_metric']) ? trim($inputData['results_metric']) : '';
        $image_url = isset($inputData['image_url']) ? trim($inputData['image_url']) : '';
        $project_url = isset($inputData['project_url']) ? trim($inputData['project_url']) : '';
        $github_url = isset($inputData['github_url']) ? trim($inputData['github_url']) : '';
        $tech_stack = isset($inputData['tech_stack']) ? trim($inputData['tech_stack']) : '';
        
        if ($id <= 0 || empty($title) || empty($category) || empty($summary) || empty($image_url)) {
            http_response_code(400);
            echo json_encode(["message" => "Invalid ID or missing required fields."]);
            exit();
        }
        
        try {
            // Check if project exists
            $stmt = $pdo->prepare("SELECT id FROM `projects` WHERE `id` = ?");
            $stmt->execute([$id]);
            if (!$stmt->fetchColumn()) {
                http_response_code(404);
                echo json_encode(["message" => "Project not found to update."]);
                exit();
            }
            
            $stmt = $pdo->prepare("UPDATE `projects` SET `title` = ?, `category` = ?, `client_name` = ?, `completion_date` = ?, `summary` = ?, `challenge` = ?, `solution` = ?, `results_metric` = ?, `image_url` = ?, `project_url` = ?, `github_url` = ?, `tech_stack` = ? WHERE `id` = ?");
            $stmt->execute([$title, $category, $client_name, $completion_date, $summary, $challenge, $solution, $results_metric, $image_url, $project_url, $github_url, $tech_stack, $id]);
            
            echo json_encode([
                "success" => true,
                "message" => "Project updated successfully."
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Failed to update project: " . $e->getMessage()]);
        }
        break;
        
    case 'DELETE':
        // Secure Route
        verify_admin_token();
        
        $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
        
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(["message" => "Invalid project ID."]);
            exit();
        }
        
        try {
            // Check if project exists
            $stmt = $pdo->prepare("SELECT id FROM `projects` WHERE `id` = ?");
            $stmt->execute([$id]);
            if (!$stmt->fetchColumn()) {
                http_response_code(404);
                echo json_encode(["message" => "Project not found to delete."]);
                exit();
            }
            
            $stmt = $pdo->prepare("DELETE FROM `projects` WHERE `id` = ?");
            $stmt->execute([$id]);
            
            echo json_encode([
                "success" => true,
                "message" => "Project deleted successfully."
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Failed to delete project: " . $e->getMessage()]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed."]);
        break;
}
