<?php
/**
 * Workspace Registration API
 * Creates new client workspaces with dynamic project settings, tech stacks, budget allocations, and welcome logs.
 */
require_once 'db.php';

$method = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'POST';

if ($method === 'POST') {
    // Read JSON inputs
    $inputData = json_decode(file_get_contents('php://input'), true);
    
    $usernameInput = isset($inputData['username']) ? trim($inputData['username']) : '';
    $passwordInput = isset($inputData['password']) ? trim($inputData['password']) : '';
    $emailInput    = isset($inputData['email']) ? trim($inputData['email']) : '';
    
    // Project customized fields
    $projectTitle  = isset($inputData['project_title']) && !empty(trim($inputData['project_title'])) ? trim($inputData['project_title']) : 'Interactive Web Application';
    $projectDesc   = isset($inputData['project_desc']) && !empty(trim($inputData['project_desc'])) ? trim($inputData['project_desc']) : '';
    $projectBudget = isset($inputData['project_budget']) && floatval($inputData['project_budget']) > 0 ? floatval($inputData['project_budget']) : 4000.00;
    $currency      = isset($inputData['currency']) && !empty(trim($inputData['currency'])) ? trim($inputData['currency']) : '$';
    $projectStack  = isset($inputData['project_stack']) ? trim($inputData['project_stack']) : 'web_app';
    $targetDate    = isset($inputData['target_date']) && !empty(trim($inputData['target_date'])) ? trim($inputData['target_date']) : date('F d, Y', strtotime('+45 days'));

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
        $insertStmt = $pdo->prepare("INSERT INTO `users` (`username`, `password`, `email`, `role`) VALUES (?, ?, ?, 'Client')");
        $insertStmt->execute([$usernameInput, $hashedPassword, $emailInput]);
        $newUserId = $pdo->lastInsertId();

        // Seed a default project for the Client
        $projCode = 'BF-' . rand(1000, 9999);
        
        $stackLabelMap = [
            'web_app' => 'React Web Application',
            'mobile_app' => 'Expo/React Native Mobile App',
            'backend' => 'Node.js Backend & API',
            'php_site' => 'PHP/Laravel Application',
            'fullstack' => 'Full-Stack Software Solution'
        ];
        $stackLabel = $stackLabelMap[$projectStack] ?? 'Custom Development Workspace';
        
        $fullDescription = $projectDesc ?: "Initial setup and workspace configuration for the {$stackLabel} project. A detailed specification document is pending your submission.";

        $projectStmt = $pdo->prepare("INSERT INTO `client_projects` (`client_id`, `title`, `description`, `progress`, `status`, `target_date`, `project_code`) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $projectStmt->execute([
            $newUserId,
            $projectTitle,
            $fullDescription,
            15,
            "Discovery Phase",
            $targetDate,
            $projCode
        ]);
        $newProjectId = $pdo->lastInsertId();

        // Seed default checklist tasks customized by stack
        $tasks = [];
        if ($projectStack === 'mobile_app') {
            $tasks = [
                [
                    "title" => "Upload and Submit Project Brief",
                    "description" => "Provide detailed mobile app specifications, layout guides, and functional demands to initiate development.",
                    "action_type" => "brief",
                    "due_date" => "Within 3 days"
                ],
                [
                    "title" => "Review & Approve Figma Mobile Wireframes",
                    "description" => "Inspect screen visual maps and layout states, leaving feedback in the chat channel to verify designs.",
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
                    "title" => "Review Staging Build on Expo Go",
                    "description" => "Run the development build inside the Expo Go app or TestFlight and provide comments to confirm frontend functions.",
                    "action_type" => "upload",
                    "due_date" => "Within 21 days"
                ],
                [
                    "title" => "Final Signoff & Feedback",
                    "description" => "Execute final review of the staging deployment and complete project sign-off.",
                    "action_type" => "feedback",
                    "due_date" => "At project completion"
                ]
            ];
        } elseif ($projectStack === 'backend') {
            $tasks = [
                [
                    "title" => "Upload and Submit API Requirements",
                    "description" => "Provide detailed endpoint listings, parameter mappings, and third-party integrations to outline backend plans.",
                    "action_type" => "brief",
                    "due_date" => "Within 3 days"
                ],
                [
                    "title" => "Approve Backend Database Schema",
                    "description" => "Review the proposed relational database models and schema designs in the workspace brief files.",
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
                    "title" => "Test API Endpoints via Postman",
                    "description" => "Execute endpoint triggers on staging servers using the published Postman collection and report bugs.",
                    "action_type" => "upload",
                    "due_date" => "Within 21 days"
                ],
                [
                    "title" => "Final Signoff & Feedback",
                    "description" => "Execute final review of the staging deployment and complete project sign-off.",
                    "action_type" => "feedback",
                    "due_date" => "At project completion"
                ]
            ];
        } elseif ($projectStack === 'php_site') {
            $tasks = [
                [
                    "title" => "Upload and Submit Project Brief",
                    "description" => "Provide detailed project requirements, design preferences, and functional specifications to kick off engineering.",
                    "action_type" => "brief",
                    "due_date" => "Within 3 days"
                ],
                [
                    "title" => "Approve Database Schema & Wireframes",
                    "description" => "Review layout mockups and database structure designs shared by the project manager.",
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
                    "description" => "Execute final review of the staging deployment and complete project sign-off.",
                    "action_type" => "feedback",
                    "due_date" => "At project completion"
                ]
            ];
        } else {
            // Default: Web App / Fullstack
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
                    "title" => "Approve Frontend Component Library",
                    "description" => "Confirm visual layout choices and dashboard components to proceed with backend integration.",
                    "action_type" => "upload",
                    "due_date" => "Within 21 days"
                ],
                [
                    "title" => "Final Signoff & Feedback",
                    "description" => "Execute final review of the staging deployment and complete project sign-off.",
                    "action_type" => "feedback",
                    "due_date" => "At project completion"
                ]
            ];
        }

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

        // Compute invoice breakdown based on total project budget
        $paidAmount = round($projectBudget * 0.30, 2);
        $pendingAmount = round($projectBudget * 0.70, 2);

        // Seed initial Invoices
        $invoiceStmt = $pdo->prepare("INSERT INTO `client_invoices` (`client_id`, `invoice_code`, `amount`, `balance_due`, `currency`, `status`, `due_date`) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $invoiceStmt->execute([$newUserId, 'INV-2026-089', $paidAmount, 0.00, $currency, 'Paid', 'June 10, 2026']);
        $invoiceStmt->execute([$newUserId, 'INV-2026-095', $pendingAmount, $pendingAmount, $currency, 'Pending', 'July 15, 2026']);

        // Seed initial Files
        $fileStmt = $pdo->prepare("INSERT INTO `client_files` (`client_id`, `filename`, `file_url`, `file_size`, `category`) VALUES (?, ?, ?, ?, ?)");
        $fileStmt->execute([$newUserId, 'Architecture_System_Specs.pdf', 'uploads/Architecture_System_Specs.pdf', '2.4 MB', 'Specs']);
        $fileStmt->execute([$newUserId, 'Staging_API_Postman_Collection.json', 'uploads/Staging_API_Postman_Collection.json', '420 KB', 'API Docs']);
        $fileStmt->execute([$newUserId, 'Service_Level_Agreement_Executed.pdf', 'uploads/Service_Level_Agreement_Executed.pdf', '1.8 MB', 'Contracts']);

        // Seed initial welcoming chat message from Marcus (Admin)
        $chatStmt = $pdo->prepare("INSERT INTO `chat_messages` (`sender_id`, `receiver_id`, `message`, `sender_name`, `is_bot`) VALUES (?, ?, ?, ?, ?)");
        $adminStmt = $pdo->query("SELECT `id` FROM `users` WHERE `role` = 'Super Admin' LIMIT 1");
        $adminId = $adminStmt->fetchColumn() ?: 1;

        $welcomeMessage = "Hi " . htmlspecialchars($usernameInput) . "! Welcome to Brainfeels Tech. I'm Marcus Vance, your Chief Architect. I've successfully registered and set up your project workspace ({$projCode}) for your project: \"{$projectTitle}\" ({$stackLabel}). The initial setup deposit invoice (INV-2026-095) for {$currency}" . number_format($pendingAmount, 2) . " is now scheduled. Please upload your project brief specs below or drop a chat if you have any questions!";
        
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
