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
                
                // Get job title for email notification
                $job_title = "Unknown Position";
                try {
                    $jstmt = $pdo->prepare("SELECT `title` FROM `careers` WHERE `id` = ?");
                    $jstmt->execute([$job_id]);
                    $job = $jstmt->fetch(PDO::FETCH_ASSOC);
                    if ($job) {
                        $job_title = $job['title'];
                    }
                } catch (Exception $e) {
                    // Suppress and use fallback
                }

                // Email dispatch to brainfeelstech@gmail.com
                $to = "brainfeelstech@gmail.com";
                $email_subject = "New Job Application: " . $job_title;
                $headers = "MIME-Version: 1.0\r\n";
                $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
                $headers .= "From: no-reply@brainfeelstech.com\r\n";
                $headers .= "Reply-To: " . $email . "\r\n";
                
                $email_body = "
                <html>
                <head>
                    <title>New Job Application Received</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { padding: 20px; border: 1px solid #eee; border-radius: 5px; max-width: 600px; }
                        .header { background-color: #0f172a; color: white; padding: 15px; text-align: center; border-radius: 5px 5px 0 0; }
                        .content { padding: 20px; }
                        .field { margin-bottom: 10px; }
                        .label { font-weight: bold; color: #475569; }
                        .value { margin-left: 10px; }
                        .message-box { background-color: #f8fafc; border-left: 4px solid #10b981; padding: 15px; margin-top: 15px; }
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h2>Brainfeels Tech - New Job Application</h2>
                        </div>
                        <div class='content'>
                            <div class='field'><span class='label'>Job Title:</span><span class='value'>" . htmlspecialchars($job_title) . "</span></div>
                            <div class='field'><span class='label'>Applicant Name:</span><span class='value'>" . htmlspecialchars($name) . "</span></div>
                            <div class='field'><span class='label'>Email:</span><span class='value'>" . htmlspecialchars($email) . "</span></div>
                            <div class='field'><span class='label'>Phone:</span><span class='value'>" . htmlspecialchars($phone) . "</span></div>
                            <div class='field'><span class='label'>Resume File:</span><span class='value'>" . htmlspecialchars($fileName) . "</span></div>
                            <div class='message-box'>
                                <strong>Cover Letter / Message:</strong><br/>
                                " . nl2br(htmlspecialchars($message)) . "
                            </div>
                        </div>
                    </div>
                </body>
                </html>
                ";
                
                @mail($to, $email_subject, $email_body, $headers);
                
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
