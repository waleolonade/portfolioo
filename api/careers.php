<?php
require_once 'db.php';
require_once 'auth_helper.php';

$method = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'GET';

switch ($method) {
    case 'GET':
        // Check if we are requesting job applications (Secure, allowed for Content Editor/Super Admin/Support Agent)
        if (isset($_GET['applications'])) {
            verify_user_role(['Content Editor', 'Support Agent'], $pdo);
            
            try {
                $query = "SELECT a.*, c.title as job_title FROM `applications` a 
                          JOIN `careers` c ON a.job_id = c.id 
                          ORDER BY a.created_at DESC";
                $stmt = $pdo->query($query);
                $apps = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($apps);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(["message" => "Failed to fetch applications: " . $e->getMessage()]);
            }
            exit();
        }
        
        // Default: Get public job listings
        try {
            if (isset($_GET['id'])) {
                $stmt = $pdo->prepare("SELECT * FROM `careers` WHERE `id` = ?");
                $stmt->execute([intval($_GET['id'])]);
                $job = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($job) {
                    echo json_encode($job);
                } else {
                    http_response_code(404);
                    echo json_encode(["message" => "Job listing not found."]);
                }
            } else {
                $stmt = $pdo->query("SELECT * FROM `careers` ORDER BY `created_at` DESC");
                $jobs = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($jobs);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Failed to fetch jobs: " . $e->getMessage()]);
        }
        break;
        
    case 'POST':
        // Case A: Submit a Job Application (Public, handles multipart file upload)
        if (isset($_GET['apply'])) {
            $job_id = isset($_POST['job_id']) ? intval($_POST['job_id']) : 0;
            $name = isset($_POST['applicant_name']) ? trim($_POST['applicant_name']) : '';
            $email = isset($_POST['applicant_email']) ? trim($_POST['applicant_email']) : '';
            $phone = isset($_POST['applicant_phone']) ? trim($_POST['applicant_phone']) : '';
            $message = isset($_POST['message']) ? trim($_POST['message']) : '';
            
            if ($job_id <= 0 || empty($name) || empty($email) || empty($phone)) {
                http_response_code(400);
                echo json_encode(["message" => "Job ID, name, email, and phone number are required."]);
                exit();
            }
            
            // Check CV file upload
            if (!isset($_FILES['cv']) || $_FILES['cv']['error'] !== UPLOAD_ERR_OK) {
                http_response_code(400);
                echo json_encode(["message" => "A valid PDF resume is required."]);
                exit();
            }
            
            $file = $_FILES['cv'];
            $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            if ($ext !== 'pdf' && $ext !== 'doc' && $ext !== 'docx') {
                http_response_code(400);
                echo json_encode(["message" => "Invalid resume file type. Only PDF or DOCX allowed."]);
                exit();
            }
            
            // Create uploads directory if not exists
            $uploadDir = 'uploads/';
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            
            // Move uploaded file with secure random name
            $fileName = uniqid('cv_', true) . '.' . $ext;
            $destination = $uploadDir . $fileName;
            
            if (!move_uploaded_file($file['tmp_name'], $destination)) {
                http_response_code(500);
                echo json_encode(["message" => "Failed to save the resume file on the server."]);
                exit();
            }
            
            // Save to database
            try {
                $stmt = $pdo->prepare("INSERT INTO `applications` (`job_id`, `applicant_name`, `applicant_email`, `applicant_phone`, `cv_url`, `message`) VALUES (?, ?, ?, ?, ?, ?)");
                $stmt->execute([$job_id, $name, $email, $phone, $destination, $message]);
                
                echo json_encode([
                    "success" => true,
                    "message" => "Your application has been submitted successfully! Our HR team will reach out."
                ]);
            } catch (PDOException $e) {
                // Cleanup file if DB insert fails
                if (file_exists($destination)) unlink($destination);
                http_response_code(500);
                echo json_encode(["message" => "Application failed to write to database: " . $e->getMessage()]);
            }
            exit();
        }
        
        // Case B: Create a Job Listing (Secure, Editor/Admin only)
        verify_user_role(['Content Editor'], $pdo);
        
        $inputData = json_decode(file_get_contents('php://input'), true);
        
        $title = isset($inputData['title']) ? trim($inputData['title']) : '';
        $location = isset($inputData['location']) ? trim($inputData['location']) : '';
        $type = isset($inputData['type']) ? trim($inputData['type']) : 'Full-time';
        $salary = isset($inputData['salary']) ? trim($inputData['salary']) : '';
        $description = isset($inputData['description']) ? trim($inputData['description']) : '';
        $requirements = isset($inputData['requirements']) ? trim($inputData['requirements']) : '';
        
        if (empty($title) || empty($location) || empty($description) || empty($requirements)) {
            http_response_code(400);
            echo json_encode(["message" => "Title, location, description, and requirements are required fields."]);
            exit();
        }
        
        try {
            $stmt = $pdo->prepare("INSERT INTO `careers` (`title`, `location`, `type`, `salary`, `description`, `requirements`) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$title, $location, $type, $salary, $description, $requirements]);
            
            echo json_encode([
                "success" => true,
                "message" => "Job listing created successfully.",
                "id" => $pdo->lastInsertId()
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Failed to create job: " . $e->getMessage()]);
        }
        break;
        
    case 'PUT':
        // Secure Route: Allowed for Super Admin and Content Editor
        verify_user_role(['Content Editor'], $pdo);
        
        $inputData = json_decode(file_get_contents('php://input'), true);
        
        $id = isset($_GET['id']) ? intval($_GET['id']) : (isset($inputData['id']) ? intval($inputData['id']) : 0);
        $title = isset($inputData['title']) ? trim($inputData['title']) : '';
        $location = isset($inputData['location']) ? trim($inputData['location']) : '';
        $type = isset($inputData['type']) ? trim($inputData['type']) : 'Full-time';
        $salary = isset($inputData['salary']) ? trim($inputData['salary']) : '';
        $description = isset($inputData['description']) ? trim($inputData['description']) : '';
        $requirements = isset($inputData['requirements']) ? trim($inputData['requirements']) : '';
        
        if ($id <= 0 || empty($title) || empty($location) || empty($description) || empty($requirements)) {
            http_response_code(400);
            echo json_encode(["message" => "Invalid ID or missing required fields."]);
            exit();
        }
        
        try {
            $stmt = $pdo->prepare("UPDATE `careers` SET `title` = ?, `location` = ?, `type` = ?, `salary` = ?, `description` = ?, `requirements` = ? WHERE `id` = ?");
            $stmt->execute([$title, $location, $type, $salary, $description, $requirements, $id]);
            
            echo json_encode([
                "success" => true,
                "message" => "Job listing updated successfully."
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Failed to update job: " . $e->getMessage()]);
        }
        break;
        
    case 'DELETE':
        // Secure Route: Allowed for Super Admin and Content Editor
        verify_user_role(['Content Editor'], $pdo);
        
        $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
        
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(["message" => "Invalid job listing ID."]);
            exit();
        }
        
        try {
            $stmt = $pdo->prepare("DELETE FROM `careers` WHERE `id` = ?");
            $stmt->execute([$id]);
            
            echo json_encode([
                "success" => true,
                "message" => "Job listing deleted successfully."
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Failed to delete job: " . $e->getMessage()]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed."]);
        break;
}
