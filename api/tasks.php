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
        // Fetch receipt layout settings
        $settingsStmt = $pdo->prepare("SELECT `setting_value` FROM `cms_settings` WHERE `setting_key` = 'receipt_settings' LIMIT 1");
        $settingsStmt->execute();
        $receiptSettingsJSON = $settingsStmt->fetchColumn() ?: '{"layout":["header","meta","items","summary","footer"],"show_watermark":true,"tax_rate":0,"payment_terms":"Due upon receipt","custom_notes":"Thank you for choosing Brainfeels Tech. We appreciate your business!","footer_contact":"If you have any questions concerning this invoice, contact our billing department at billing@brainfeels.tech."}';
        $receiptSettings = json_decode($receiptSettingsJSON, true);

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
                "files" => $files,
                "receipt_settings" => $receiptSettings
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
                    "files" => $files,
                    "receipt_settings" => $receiptSettings
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
        $action = isset($inputData['action']) ? trim($inputData['action']) : '';

        // 1. Admin Action: Save dynamic receipt structure layout
        if ($action === 'save_receipt_settings') {
            verify_user_role(['Project Manager', 'Super Admin'], $pdo);
            $settingsData = isset($inputData['settings']) ? $inputData['settings'] : null;
            
            if (!$settingsData) {
                http_response_code(400);
                echo json_encode(["message" => "Settings configurations are required."]);
                exit();
            }

            $settingsJSON = json_encode($settingsData);
            $saveStmt = $pdo->prepare("INSERT INTO `cms_settings` (`setting_key`, `setting_value`) VALUES ('receipt_settings', ?) ON DUPLICATE KEY UPDATE `setting_value` = ?, `updated_at` = CURRENT_TIMESTAMP");
            $saveStmt->execute([$settingsJSON, $settingsJSON]);
            
            echo json_encode(["success" => true, "message" => "Receipt structure layout updated successfully."]);
            exit();
        }

        // 2. Admin Action: Create new invoice
        if ($action === 'invoice_create') {
            verify_user_role(['Project Manager', 'Super Admin'], $pdo);
            $clientId = intval($inputData['client_id']);
            $amount = floatval($inputData['amount']);
            $balance = floatval($inputData['balance_due']);
            $currency = isset($inputData['currency']) ? trim($inputData['currency']) : '$';
            $dueDate = trim($inputData['due_date']);
            $status = trim($inputData['status']);

            if ($clientId <= 0 || $amount < 0) {
                http_response_code(400);
                echo json_encode(["message" => "Invalid billing input details."]);
                exit();
            }

            // Auto-generate invoice code: INV-YYYY-NNN
            $year = date('Y');
            $codeQuery = $pdo->prepare("SELECT `invoice_code` FROM `client_invoices` WHERE `invoice_code` LIKE ? ORDER BY `id` DESC LIMIT 1");
            $codeQuery->execute(["INV-{$year}-%"]);
            $lastCode = $codeQuery->fetchColumn();

            $nextNum = 1;
            if ($lastCode) {
                $parts = explode('-', $lastCode);
                if (count($parts) === 3) {
                    $nextNum = intval($parts[2]) + 1;
                }
            }
            $code = "INV-" . $year . "-" . str_pad($nextNum, 3, '0', STR_PAD_LEFT);

            $stmt = $pdo->prepare("INSERT INTO `client_invoices` (`client_id`, `invoice_code`, `amount`, `balance_due`, `currency`, `status`, `due_date`) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$clientId, $code, $amount, $balance, $currency, $status, $dueDate]);
            
            echo json_encode(["success" => true, "message" => "Invoice generated successfully.", "code" => $code]);
            exit();
        }

        // 3. Admin Action: Edit / Update existing invoice
        if ($action === 'invoice_update') {
            verify_user_role(['Project Manager', 'Super Admin'], $pdo);
            $invId = intval($inputData['invoice_id']);
            $code = trim($inputData['invoice_code']);
            $amount = floatval($inputData['amount']);
            $balance = floatval($inputData['balance_due']);
            $currency = isset($inputData['currency']) ? trim($inputData['currency']) : '$';
            $dueDate = trim($inputData['due_date']);
            $status = trim($inputData['status']);

            if ($invId <= 0 || empty($code) || $amount < 0) {
                http_response_code(400);
                echo json_encode(["message" => "Invalid billing edit details."]);
                exit();
            }

            $stmt = $pdo->prepare("UPDATE `client_invoices` SET `invoice_code` = ?, `amount` = ?, `balance_due` = ?, `currency` = ?, `status` = ?, `due_date` = ? WHERE `id` = ?");
            $stmt->execute([$code, $amount, $balance, $currency, $status, $dueDate, $invId]);
            
            echo json_encode(["success" => true, "message" => "Invoice updated successfully."]);
            exit();
        }

        // 4. Admin Action: Delete invoice
        if ($action === 'invoice_delete') {
            verify_user_role(['Project Manager', 'Super Admin'], $pdo);
            $invId = intval($inputData['invoice_delete_id']);

            if ($invId <= 0) {
                http_response_code(400);
                echo json_encode(["message" => "Invalid invoice deletion ID."]);
                exit();
            }

            $stmt = $pdo->prepare("DELETE FROM `client_invoices` WHERE `id` = ?");
            $stmt->execute([$invId]);
            
            echo json_encode(["success" => true, "message" => "Invoice record removed."]);
            exit();
        }

        // Admin Action: Delete client file/document
        if ($action === 'file_delete') {
            verify_user_role(['Project Manager', 'Super Admin'], $pdo);
            $fileId = intval($inputData['file_id']);

            if ($fileId <= 0) {
                http_response_code(400);
                echo json_encode(["message" => "Invalid file ID for deletion."]);
                exit();
            }

            // Fetch file to get url
            $fileStmt = $pdo->prepare("SELECT * FROM `client_files` WHERE `id` = ?");
            $fileStmt->execute([$fileId]);
            $file = $fileStmt->fetch(PDO::FETCH_ASSOC);

            if (!$file) {
                http_response_code(404);
                echo json_encode(["message" => "File not found."]);
                exit();
            }

            // Delete physical file
            $filePath = '../' . $file['file_url'];
            if (file_exists($filePath)) {
                unlink($filePath);
            }

            // Delete record
            $delStmt = $pdo->prepare("DELETE FROM `client_files` WHERE `id` = ?");
            $delStmt->execute([$fileId]);

            // Add system logger notification
            $systemMsg = "🔧 System Alert: Document '" . $file['filename'] . "' has been deleted by the Admin.";
            $adminStmt = $pdo->query("SELECT `id` FROM `users` WHERE `role` = 'Super Admin' LIMIT 1");
            $adminId = $adminStmt->fetchColumn() ?: 1;

            $logStmt = $pdo->prepare("INSERT INTO `chat_messages` (`sender_id`, `receiver_id`, `message`, `sender_name`, `is_bot`) VALUES (?, ?, ?, 'System Logger', 0)");
            $logStmt->execute([$adminId, $file['client_id'], $systemMsg]);

            echo json_encode(["success" => true, "message" => "File deleted successfully."]);
            exit();
        }

        // Admin Action: Request another document upload
        if ($action === 'file_request') {
            verify_user_role(['Project Manager', 'Super Admin'], $pdo);
            $clientId = intval($inputData['client_id']);
            $category = trim($inputData['category'] ?? 'Specs');
            $reason = trim($inputData['reason'] ?? 'Please provide updated documentation.');

            if ($clientId <= 0 || empty($reason)) {
                http_response_code(400);
                echo json_encode(["message" => "Invalid parameters for requesting file."]);
                exit();
            }

            // Create a pending checklist task for the client
            $taskTitle = "Upload Requested Document (" . $category . ")";
            $taskDesc = $reason;

            $insStmt = $pdo->prepare("INSERT INTO `client_tasks` (`client_id`, `title`, `description`, `status`, `action_type`, `due_date`) VALUES (?, ?, ?, 'Pending', 'upload', 'ASAP')");
            $insStmt->execute([$clientId, $taskTitle, $taskDesc]);

            // Add system log message
            $systemMsg = "🔧 System Alert: Admin has requested a new document upload (" . $category . "). Reason: " . $reason;
            $adminStmt = $pdo->query("SELECT `id` FROM `users` WHERE `role` = 'Super Admin' LIMIT 1");
            $adminId = $adminStmt->fetchColumn() ?: 1;

            $logStmt = $pdo->prepare("INSERT INTO `chat_messages` (`sender_id`, `receiver_id`, `message`, `sender_name`, `is_bot`) VALUES (?, ?, ?, 'System Logger', 0)");
            $logStmt->execute([$adminId, $clientId, $systemMsg]);

            // Re-calculate project progress
            $countStmt = $pdo->prepare("SELECT COUNT(*) FROM `client_tasks` WHERE `client_id` = ?");
            $countStmt->execute([$clientId]);
            $totalTasks = intval($countStmt->fetchColumn());

            $completedStmt = $pdo->prepare("SELECT COUNT(*) FROM `client_tasks` WHERE `client_id` = ? AND `status` = 'Completed'");
            $completedStmt->execute([$clientId]);
            $completedTasks = intval($completedStmt->fetchColumn());

            $baseProgress = 15;
            $progressPercent = $totalTasks > 0 ? ($baseProgress + intval(($completedTasks / $totalTasks) * 85)) : $baseProgress;
            
            $projStatus = "Discovery Phase";
            if ($progressPercent >= 100) $projStatus = "Final Handover";
            elseif ($progressPercent >= 75) $projStatus = "Staging & Review";
            elseif ($progressPercent >= 50) $projStatus = "Core Engineering";
            elseif ($progressPercent >= 30) $projStatus = "Prototype Wireframing";

            $updateProjStmt = $pdo->prepare("UPDATE `client_projects` SET `progress` = ?, `status` = ? WHERE `client_id` = ?");
            $updateProjStmt->execute([$progressPercent, $projStatus, $clientId]);

            echo json_encode(["success" => true, "message" => "File request generated as a checklist task."]);
            exit();
        }

        // 5. Client / Admin Action: Toggle invoice Paid / Pending status
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
            
            // If marking paid, set balance due to 0.00. If pending, restore to invoice amount.
            $newBalanceDue = $newInvStatus === 'Paid' ? 0.00 : floatval($invoice['amount']);

            $updateInv = $pdo->prepare("UPDATE `client_invoices` SET `status` = ?, `balance_due` = ? WHERE `id` = ?");
            $updateInv->execute([$newInvStatus, $newBalanceDue, $invoiceId]);

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
            $adminId = $adminStmt->fetchColumn() ?: 1;

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

        // 6. Checklist task toggle
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
            
            generate_brief_analysis($clientOwnerId, $briefText, $pdo);
        }

        if ($task['action_type'] === 'feedback' && isset($inputData['feedback_text'])) {
            $feedbackText = trim($inputData['feedback_text']);
            $updateProjFeedback = $pdo->prepare("UPDATE `client_projects` SET `feedback_details` = ? WHERE `client_id` = ?");
            $updateProjFeedback->execute([$feedbackText, $clientOwnerId]);
        }

        if ($task['action_type'] === 'payment') {
            $newInvoiceStatus = $newStatus === 'Completed' ? 'Paid' : 'Pending';
            $newBalanceDue = $newStatus === 'Completed' ? 0.00 : 2800.00; // restore mock value
            
            $updateInvoice = $pdo->prepare("UPDATE `client_invoices` SET `status` = ?, `balance_due` = ? WHERE `client_id` = ? AND `invoice_code` = 'INV-2026-095'");
            $updateInvoice->execute([$newInvoiceStatus, $newBalanceDue, $clientOwnerId]);
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
        $adminId = $adminStmt->fetchColumn() ?: 1;

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
    echo json_encode(["message" => "Database exception error: " . $e->getMessage()]);
    exit();
}
