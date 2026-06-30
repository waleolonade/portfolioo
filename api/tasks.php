<?php
require_once 'db.php';
require_once 'auth_helper.php';
require_once 'ai_brief_analyzer.php';

// Verify token and get username
$username = verify_admin_token();

try {
    // Get user details
    $userStmt = $pdo->prepare("SELECT `id`, `username`, `role` FROM `users` WHERE `username` = ?");
    $userStmt->execute([$username]);
    $currentUser = $userStmt->fetch(PDO::FETCH_ASSOC);

    if (!$currentUser) {
        http_response_code(401);
        echo json_encode(["message" => "Invalid user session."]);
        exit();
    }

    $currentUserId = intval($currentUser['id']);
    $currentUserRole = $currentUser['role'];

    $method = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'GET';

    if ($method === 'GET') {
        if ($currentUserRole === 'Client') {
            // Fetch project details
            $projStmt = $pdo->prepare("SELECT * FROM `client_projects` WHERE `client_id` = ? LIMIT 1");
            $projStmt->execute([$currentUserId]);
            $project = $projStmt->fetch(PDO::FETCH_ASSOC);

            // Fetch checklist tasks
            $taskStmt = $pdo->prepare("SELECT * FROM `client_tasks` WHERE `client_id` = ? ORDER BY `id` ASC");
            $taskStmt->execute([$currentUserId]);
            $tasks = $taskStmt->fetchAll(PDO::FETCH_ASSOC);

            // Fetch invoices
            $invoiceStmt = $pdo->prepare("SELECT * FROM `client_invoices` WHERE `client_id` = ? ORDER BY `id` ASC");
            $invoiceStmt->execute([$currentUserId]);
            $invoices = $invoiceStmt->fetchAll(PDO::FETCH_ASSOC);

            // Fetch files
            $fileStmt = $pdo->prepare("SELECT * FROM `client_files` WHERE `client_id` = ? ORDER BY `id` DESC");
            $fileStmt->execute([$currentUserId]);
            $files = $fileStmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                "project" => $project,
                "tasks" => $tasks,
                "invoices" => $invoices,
                "files" => $files
            ]);
            exit();
        } else {
            // For Admin: fetch details of a specific client's project & tasks & invoices & files
            $clientId = isset($_GET['client_id']) ? intval($_GET['client_id']) : 0;
            
            if ($clientId > 0) {
                $projStmt = $pdo->prepare("SELECT * FROM `client_projects` WHERE `client_id` = ? LIMIT 1");
                $projStmt->execute([$clientId]);
                $project = $projStmt->fetch(PDO::FETCH_ASSOC);

                $taskStmt = $pdo->prepare("SELECT * FROM `client_tasks` WHERE `client_id` = ? ORDER BY `id` ASC");
                $taskStmt->execute([$clientId]);
                $tasks = $taskStmt->fetchAll(PDO::FETCH_ASSOC);

                $invoiceStmt = $pdo->prepare("SELECT * FROM `client_invoices` WHERE `client_id` = ? ORDER BY `id` ASC");
                $invoiceStmt->execute([$clientId]);
                $invoices = $invoiceStmt->fetchAll(PDO::FETCH_ASSOC);

                $fileStmt = $pdo->prepare("SELECT * FROM `client_files` WHERE `client_id` = ? ORDER BY `id` DESC");
                $fileStmt->execute([$clientId]);
                $files = $fileStmt->fetchAll(PDO::FETCH_ASSOC);

                echo json_encode([
                    "project" => $project,
                    "tasks" => $tasks,
                    "invoices" => $invoices,
                    "files" => $files
                ]);
                exit();
            } else {
                http_response_code(400);
                echo json_encode(["message" => "Client ID is required for administrative lookup."]);
                exit();
            }
        }
    } elseif ($method === 'POST') {
        $inputData = json_decode(file_get_contents('php://input'), true);
        
        // Handle invoice toggle if invoice_id is supplied
        $invoiceId = isset($inputData['invoice_id']) ? intval($inputData['invoice_id']) : 0;
        if ($invoiceId > 0) {
            $invStmt = $pdo->prepare("SELECT * FROM `client_invoices` WHERE `id` = ?");
            $invStmt->execute([$invoiceId]);
            $invoice = $invStmt->fetch(PDO::FETCH_ASSOC);

            if (!$invoice) {
                http_response_code(404);
                echo json_encode(["message" => "Invoice not found."]);
                exit();
            }

            $newInvStatus = $invoice['status'] === 'Paid' ? 'Pending' : 'Paid';
            $clientOwnerId = intval($invoice['client_id']);

            $updateInv = $pdo->prepare("UPDATE `client_invoices` SET `status` = ? WHERE `id` = ?");
            $updateInv->execute([$newInvStatus, $invoiceId]);

            // Update payment task status accordingly
            $payTaskStmt = $pdo->prepare("UPDATE `client_tasks` SET `status` = ? WHERE `client_id` = ? AND `action_type` = 'payment'");
            $payTaskStmt->execute([$newInvStatus === 'Paid' ? 'Completed' : 'Pending', $clientOwnerId]);

            // Re-calculate project progress
            $countStmt = $pdo->prepare("SELECT COUNT(*) FROM `client_tasks` WHERE `client_id` = ?");
            $countStmt->execute([$clientOwnerId]);
            $totalTasks = intval($countStmt->fetchColumn());

            $completedStmt = $pdo->prepare("SELECT COUNT(*) FROM `client_tasks` WHERE `client_id` = ? AND `status` = 'Completed'");
            $completedStmt->execute([$clientOwnerId]);
            $completedTasks = intval($completedStmt->fetchColumn());

            $baseProgress = 15;
            $progressPercent = $totalTasks > 0 ? ($baseProgress + intval(($completedTasks / $totalTasks) * 85)) : $baseProgress;
            
            $projStatus = "Discovery Phase";
            if ($progressPercent >= 100) $projStatus = "Final Handover";
            elseif ($progressPercent >= 75) $projStatus = "Staging & Review";
            elseif ($progressPercent >= 50) $projStatus = "Core Engineering";
            elseif ($progressPercent >= 30) $projStatus = "Prototype Wireframing";

            $updateProjStmt = $pdo->prepare("UPDATE `client_projects` SET `progress` = ?, `status` = ? WHERE `client_id` = ?");
            $updateProjStmt->execute([$progressPercent, $projStatus, $clientOwnerId]);

            $systemMsg = "🔧 System Alert: Invoice '" . $invoice['invoice_code'] . "' status has been marked as " . $newInvStatus . " by the Admin. Project progress updated to " . $progressPercent . "% (" . $projStatus . ").";
            
            $adminStmt = $pdo->query("SELECT `id` FROM `users` WHERE `role` = 'Super Admin' LIMIT 1");
            $adminId = $adminStmt->fetchColumn();
            if (!$adminId) $adminId = 1;

            $logStmt = $pdo->prepare("INSERT INTO `chat_messages` (`sender_id`, `receiver_id`, `message`, `sender_name`, `is_bot`) VALUES (?, ?, ?, 'System Logger', 0)");
            $logStmt->execute([$adminId, $clientOwnerId, $systemMsg]);

            echo json_encode([
                "success" => true,
                "message" => "Invoice status updated.",
                "new_status" => $newInvStatus,
                "progress" => $progressPercent,
                "project_status" => $projStatus
            ]);
            exit();
        }

        // Handle checklist task toggle
        $taskId = isset($inputData['task_id']) ? intval($inputData['task_id']) : 0;
        if ($taskId <= 0) {
            http_response_code(400);
            echo json_encode(["message" => "Task ID or Invoice ID is required."]);
            exit();
        }

        // Verify task ownership
        if ($currentUserRole === 'Client') {
            $taskStmt = $pdo->prepare("SELECT * FROM `client_tasks` WHERE `id` = ? AND `client_id` = ?");
            $taskStmt->execute([$taskId, $currentUserId]);
        } else {
            $taskStmt = $pdo->prepare("SELECT * FROM `client_tasks` WHERE `id` = ?");
            $taskStmt->execute([$taskId]);
        }

        $task = $taskStmt->fetch(PDO::FETCH_ASSOC);

        if (!$task) {
            http_response_code(404);
            echo json_encode(["message" => "Task not found or access denied."]);
            exit();
        }

        $newStatus = $task['status'] === 'Completed' ? 'Pending' : 'Completed';
        $clientOwnerId = intval($task['client_id']);

        // Update task status
        $updateStmt = $pdo->prepare("UPDATE `client_tasks` SET `status` = ? WHERE `id` = ?");
        $updateStmt->execute([$newStatus, $taskId]);

        // Process dynamic brief, feedback, or payment status changes in database
        if ($task['action_type'] === 'brief' && isset($inputData['brief_text'])) {
            $briefText = trim($inputData['brief_text']);
            $updateProjBrief = $pdo->prepare("UPDATE `client_projects` SET `description` = ? WHERE `client_id` = ?");
            $updateProjBrief->execute([$briefText, $clientOwnerId]);
            
            // Invoke the advanced 15-year Prompt Architect brief analyzer
            generate_brief_analysis($clientOwnerId, $briefText, $pdo);
        }

        if ($task['action_type'] === 'feedback' && isset($inputData['feedback_text'])) {
            $feedbackText = trim($inputData['feedback_text']);
            $updateProjFeedback = $pdo->prepare("UPDATE `client_projects` SET `feedback_details` = ? WHERE `client_id` = ?");
            $updateProjFeedback->execute([$feedbackText, $clientOwnerId]);
        }

        if ($task['action_type'] === 'payment') {
            $newInvoiceStatus = $newStatus === 'Completed' ? 'Paid' : 'Pending';
            $updateInvoice = $pdo->prepare("UPDATE `client_invoices` SET `status` = ? WHERE `client_id` = ? AND `invoice_code` = 'INV-2026-095'");
            $updateInvoice->execute([$newInvoiceStatus, $clientOwnerId]);
        }

        // Get count of completed tasks to calculate overall project progress dynamically
        $countStmt = $pdo->prepare("SELECT COUNT(*) FROM `client_tasks` WHERE `client_id` = ?");
        $countStmt->execute([$clientOwnerId]);
        $totalTasks = intval($countStmt->fetchColumn());

        $completedStmt = $pdo->prepare("SELECT COUNT(*) FROM `client_tasks` WHERE `client_id` = ? AND `status` = 'Completed'");
        $completedStmt->execute([$clientOwnerId]);
        $completedTasks = intval($completedStmt->fetchColumn());

        // Calculate progress percentage
        $baseProgress = 15;
        $progressPercent = $totalTasks > 0 ? ($baseProgress + intval(($completedTasks / $totalTasks) * 85)) : $baseProgress;

        // Determine project phase status string
        $projStatus = "Discovery Phase";
        if ($progressPercent >= 100) $projStatus = "Final Handover";
        elseif ($progressPercent >= 75) $projStatus = "Staging & Review";
        elseif ($progressPercent >= 50) $projStatus = "Core Engineering";
        elseif ($progressPercent >= 30) $projStatus = "Prototype Wireframing";

        // Update project status in db
        $updateProjStmt = $pdo->prepare("UPDATE `client_projects` SET `progress` = ?, `status` = ? WHERE `client_id` = ?");
        $updateProjStmt->execute([$progressPercent, $projStatus, $clientOwnerId]);

        // Get system message logger
        $systemMsg = "🔧 System Alert: Task '" . $task['title'] . "' has been marked as " . $newStatus . ". Project progress updated to " . $progressPercent . "% (" . $projStatus . ").";
        
        $adminStmt = $pdo->query("SELECT `id` FROM `users` WHERE `role` = 'Super Admin' LIMIT 1");
        $adminId = $adminStmt->fetchColumn();
        if (!$adminId) $adminId = 1;

        $logStmt = $pdo->prepare("INSERT INTO `chat_messages` (`sender_id`, `receiver_id`, `message`, `sender_name`, `is_bot`) VALUES (?, ?, ?, 'System Logger', 0)");
        $logStmt->execute([$adminId, $clientOwnerId, $systemMsg]);

        echo json_encode([
            "success" => true,
            "message" => "Task status updated successfully.",
            "new_status" => $newStatus,
            "progress" => $progressPercent,
            "project_status" => $projStatus
        ]);
        exit();
    } else {
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed."]);
        exit();
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Database task error: " . $e->getMessage()]);
    exit();
}
