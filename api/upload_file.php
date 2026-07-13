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

    $method = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'POST';

    if ($method !== 'POST') {
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed. Only POST is supported."]);
        exit();
    }

    // Check if file is uploaded
    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(["message" => "No file uploaded or upload error occurred."]);
        exit();
    }

    $file = $_FILES['file'];
    $fileName = basename($file['name']);
    $fileTmp = $file['tmp_name'];
    $fileSizeRaw = $file['size'];

    // Determine target client ID
    // If Admin uploads, they must specify client_id. If Client uploads, it is their own ID.
    $clientId = $currentUserRole === 'Client' ? $currentUserId : (isset($_POST['client_id']) ? intval($_POST['client_id']) : 0);
    
    if ($clientId <= 0) {
        http_response_code(400);
        echo json_encode(["message" => "Target client ID is required for administrative uploads."]);
        exit();
    }

    // Verify upload folder
    $uploadDir = '../uploads/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    // Generate unique file name
    $fileExt = pathinfo($fileName, PATHINFO_EXTENSION);
    $sanitizedBase = preg_replace("/[^a-zA-Z0-9_\-]/", "_", pathinfo($fileName, PATHINFO_FILENAME));
    $newFileName = $sanitizedBase . '_' . time() . '.' . $fileExt;
    $targetPath = $uploadDir . $newFileName;

    // Move file
    if (!move_uploaded_file($fileTmp, $targetPath)) {
        http_response_code(500);
        echo json_encode(["message" => "Failed to save file to directory."]);
        exit();
    }

    // Format size
    if ($fileSizeRaw >= 1048576) {
        $fileSizeStr = number_format($fileSizeRaw / 1048576, 1) . ' MB';
    } else {
        $fileSizeStr = number_format($fileSizeRaw / 1024, 0) . ' KB';
    }

    $category = isset($_POST['category']) ? trim($_POST['category']) : 'Document';
    $fileUrl = 'uploads/' . $newFileName;

    // Insert file record
    $insertStmt = $pdo->prepare("INSERT INTO `client_files` (`client_id`, `filename`, `file_url`, `file_size`, `category`) VALUES (?, ?, ?, ?, ?)");
    $insertStmt->execute([$clientId, $fileName, $fileUrl, $fileSizeStr, $category]);
    $newFileId = $pdo->lastInsertId();

    // Trigger notification
    $uploader = $currentUserRole === 'Client' ? 'You' : 'Admin';
    create_notification($clientId, "Document Uploaded", "{$uploader} uploaded file '{$fileName}' under category '{$category}'.", $pdo);

    // System message logs
    $senderName = $currentUserRole === 'Client' ? 'Client' : 'Admin';
    $systemMsg = "🔧 System Alert: File '" . $fileName . "' (" . $fileSizeStr . ") has been uploaded by the " . $senderName . ".";
    
    $adminStmt = $pdo->query("SELECT `id` FROM `users` WHERE `role` = 'Super Admin' LIMIT 1");
    $adminId = $adminStmt->fetchColumn();
    if (!$adminId) $adminId = 1;

    $logStmt = $pdo->prepare("INSERT INTO `chat_messages` (`sender_id`, `receiver_id`, `message`, `sender_name`, `is_bot`) VALUES (?, ?, ?, 'System Logger', 0)");
    $logStmt->execute([$adminId, $clientId, $systemMsg]);

    // Check if task completion was requested
    $taskId = isset($_POST['task_id']) ? intval($_POST['task_id']) : 0;
    if ($taskId > 0) {
        // Complete the task on the database
        $updateTask = $pdo->prepare("UPDATE `client_tasks` SET `status` = 'Completed' WHERE `id` = ? AND `client_id` = ?");
        $updateTask->execute([$taskId, $clientId]);

        // If it was the project brief task, update the project details description
        $taskCheckStmt = $pdo->prepare("SELECT `action_type` FROM `client_tasks` WHERE `id` = ?");
        $taskCheckStmt->execute([$taskId]);
        $actionType = $taskCheckStmt->fetchColumn();

        if ($actionType === 'brief') {
            $briefDescription = "A brief document has been uploaded: " . $fileName;
            $updateProjBrief = $pdo->prepare("UPDATE `client_projects` SET `description` = ? WHERE `client_id` = ?");
            $updateProjBrief->execute([$briefDescription, $clientId]);
            
            // Invoke the advanced 15-year Prompt Architect brief analyzer
            generate_brief_analysis($clientId, "Uploaded specifications file: " . $fileName . ". Analyze this document upload in the context of the client portal workspace.", $pdo);
        }

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
    }

    echo json_encode([
        "success" => true,
        "message" => "File uploaded successfully.",
        "file" => [
            "id" => $newFileId,
            "filename" => $fileName,
            "file_url" => $fileUrl,
            "file_size" => $fileSizeStr,
            "category" => $category
        ]
    ]);
    exit();

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Database upload error: " . $e->getMessage()]);
    exit();
}