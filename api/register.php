<?php
require_once 'db.php';

$method = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'POST';

if ($method === 'POST') {
    // Read JSON inputs
    $inputData = json_decode(file_get_contents('php://input'), true);
    
    $usernameInput = isset($inputData['username']) ? trim($inputData['username']) : '';
    $passwordInput = isset($inputData['password']) ? trim($inputData['password']) : '';
    
    if (empty($usernameInput) || empty($passwordInput)) {
        http_response_code(400);
        echo json_encode(["message" => "Username and password are required."]);
        exit();
    }

    if (strlen($usernameInput) < 3) {
        http_response_code(400);
        echo json_encode(["message" => "Username must be at least 3 characters long."]);
        exit();
    }

    if (strlen($passwordInput) < 6) {
        http_response_code(400);
        echo json_encode(["message" => "Password must be at least 6 characters long."]);
        exit();
    }
    
    try {
        // Check if username is taken
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM `users` WHERE `username` = ?");
        $stmt->execute([$usernameInput]);
        if ($stmt->fetchColumn() > 0) {
            http_response_code(409);
            echo json_encode(["message" => "Username is already registered."]);
            exit();
        }

        // Insert new user as Client
        $hashedPassword = password_hash($passwordInput, PASSWORD_DEFAULT);
        $insertStmt = $pdo->prepare("INSERT INTO `users` (`username`, `password`, `role`) VALUES (?, ?, 'Client')");
        $insertStmt->execute([$usernameInput, $hashedPassword]);
        $newUserId = $pdo->lastInsertId();

        // Seed a default project for the Client
        $projCode = 'BF-' . rand(1000, 9999);
        $projectStmt = $pdo->prepare("INSERT INTO `client_projects` (`client_id`, `title`, `description`, `progress`, `status`, `target_date`, `project_code`) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $projectStmt->execute([
            $newUserId,
            "Interactive Web Application Development",
            "Initial setup and workspace configuration for " . htmlspecialchars($usernameInput) . "'s project. A detailed specification document is pending your submission.",
            15,
            "Discovery Phase",
            date('F d, Y', strtotime('+45 days')),
            $projCode
        ]);
        $newProjectId = $pdo->lastInsertId();

        // Seed default checklist tasks
        $tasks = [
            [
                "title" => "Upload and Submit Project Brief",
                "description" => "Provide detailed project requirements, design preferences, and functional specifications to kick off engineering.",
                "action_type" => "brief",
                "due_date" => "Within 3 days"
            ],
            [
                "title" => "Review and Approve UI Mockups",
                "description" => "Inspect visual layouts and wireframes, and leave feedback in the chat channel to confirm structural designs.",
                "action_type" => "mockup",
                "due_date" => "Within 7 days"
            ],
            [
                "title" => "Submit Setup Deposit Payment",
                "description" => "Process payment of the invoice to officially schedule the milestones for execution.",
                "action_type" => "payment",
                "due_date" => "Within 10 days"
            ],
            [
                "title" => "Final Signoff & Feedback",
                "description" => "Perform final review of the staging deployment and complete project sign-off.",
                "action_type" => "feedback",
                "due_date" => "At project completion"
            ]
        ];

        $taskStmt = $pdo->prepare("INSERT INTO `client_tasks` (`client_id`, `title`, `description`, `action_type`, `due_date`, `status`) VALUES (?, ?, ?, ?, ?, 'Pending')");
        foreach ($tasks as $t) {
            $taskStmt->execute([
                $newUserId,
                $t['title'],
                $t['description'],
                $t['action_type'],
                $t['due_date']
            ]);
        }

        // Seed initial Invoices
        $invoiceStmt = $pdo->prepare("INSERT INTO `client_invoices` (`client_id`, `invoice_code`, `amount`, `balance_due`, `currency`, `status`, `due_date`) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $invoiceStmt->execute([$newUserId, 'INV-2026-089', 1200.00, 0.00, '$', 'Paid', 'June 10, 2026']);
        $invoiceStmt->execute([$newUserId, 'INV-2026-095', 2800.00, 2800.00, '$', 'Pending', 'July 15, 2026']);

        // Seed initial Files
        $fileStmt = $pdo->prepare("INSERT INTO `client_files` (`client_id`, `filename`, `file_url`, `file_size`, `category`) VALUES (?, ?, ?, ?, ?)");
        $fileStmt->execute([$newUserId, 'Architecture_System_Specs.pdf', 'uploads/Architecture_System_Specs.pdf', '2.4 MB', 'Specs']);
        $fileStmt->execute([$newUserId, 'Staging_API_Postman_Collection.json', 'uploads/Staging_API_Postman_Collection.json', '420 KB', 'API Docs']);
        $fileStmt->execute([$newUserId, 'Service_Level_Agreement_Executed.pdf', 'uploads/Service_Level_Agreement_Executed.pdf', '1.8 MB', 'Contracts']);

        // Seed initial welcoming chat message from Marcus (Admin)
        $chatStmt = $pdo->prepare("INSERT INTO `chat_messages` (`sender_id`, `receiver_id`, `message`, `sender_name`, `is_bot`) VALUES (?, ?, ?, ?, ?)");
        // Find admin user ID to associate
        $adminStmt = $pdo->query("SELECT `id` FROM `users` WHERE `role` = 'Super Admin' LIMIT 1");
        $adminId = $adminStmt->fetchColumn();
        if (!$adminId) $adminId = 1; // Fallback to 1

        $welcomeMessage = "Hi " . htmlspecialchars($usernameInput) . "! Welcome to Brainfeels Tech. I'm Marcus Vance, your Chief Architect. I've set up your project workspace (" . $projCode . "). Feel free to submit your project requirements below or ask any questions in this chat!";
        $chatStmt->execute([
            $adminId,
            $newUserId,
            $welcomeMessage,
            "Marcus Vance",
            0
        ]);

        // Generate token payload (username + expiry + signature)
        $secretKey = 'brainfeels_secret_key_9988';
        $expiry = time() + (3600 * 24); // Valid for 24 hours
        $tokenPayload = $usernameInput . '.' . $expiry;
        $signature = hash_hmac('sha256', $tokenPayload, $secretKey);
        $token = base64_encode($tokenPayload . '.' . $signature);
        
        echo json_encode([
            "success" => true,
            "message" => "Registration successful",
            "token" => $token,
            "user" => [
                "id" => $newUserId,
                "username" => $usernameInput,
                "role" => "Client"
            ]
        ]);
        exit();
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Registration failed: " . $e->getMessage()]);
        exit();
    }
} else {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed. Only POST is supported."]);
    exit();
}
