<?php
require_once 'db.php';
require_once 'auth_helper.php';

// Verify token and get username
$username = verify_admin_token();

try {
    // Get user details
    $userStmt = $pdo->prepare("SELECT `id`, `username`, `role` FROM `users` WHERE `username` = ?");
    $userStmt->execute([$username]);
    $currentUser = $userStmt->fetch(PDO::FETCH_ASSOC);

    if (!$currentUser) {
        http_response_code(401);
        echo json_encode(["message" => "Invalid user token session."]);
        exit();
    }

    $currentUserId = intval($currentUser['id']);
    $currentUserRole = $currentUser['role'];

    $method = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'GET';

    if ($method === 'GET') {
        if ($currentUserRole === 'Client') {
            // Clients fetch their own chat history (both sent by them and sent to them)
            $stmt = $pdo->prepare("
                SELECT m.*, u.username as sender_username 
                FROM `chat_messages` m
                JOIN `users` u ON m.sender_id = u.id
                WHERE m.sender_id = ? OR m.receiver_id = ?
                ORDER BY m.created_at ASC
            ");
            $stmt->execute([$currentUserId, $currentUserId]);
            $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($messages);
            exit();
        } else {
            // Admins/Support fetch either a specific client's chat OR a list of all chats
            $clientId = isset($_GET['client_id']) ? intval($_GET['client_id']) : 0;
            
            if ($clientId > 0) {
                // Fetch messages for a specific client
                $stmt = $pdo->prepare("
                    SELECT m.*, u.username as sender_username 
                    FROM `chat_messages` m
                    JOIN `users` u ON m.sender_id = u.id
                    WHERE m.sender_id = ? OR m.receiver_id = ?
                    ORDER BY m.created_at ASC
                ");
                $stmt->execute([$clientId, $clientId]);
                $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($messages);
                exit();
            } else {
                // Get summary of all clients with active conversations
                $stmt = $pdo->query("
                    SELECT u.id as client_id, u.username as client_username, p.project_code,
                           (SELECT message FROM `chat_messages` WHERE sender_id = u.id OR receiver_id = u.id ORDER BY created_at DESC LIMIT 1) as last_message,
                           (SELECT created_at FROM `chat_messages` WHERE sender_id = u.id OR receiver_id = u.id ORDER BY created_at DESC LIMIT 1) as last_message_time
                    FROM `users` u
                    LEFT JOIN `client_projects` p ON p.client_id = u.id
                    WHERE u.role = 'Client'
                    ORDER BY last_message_time DESC
                ");
                $conversations = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($conversations);
                exit();
            }
        }
    } elseif ($method === 'POST') {
        $inputData = json_decode(file_get_contents('php://input'), true);
        $messageText = isset($inputData['message']) ? trim($inputData['message']) : '';
        $isBot = isset($inputData['is_bot']) ? intval($inputData['is_bot']) : 0;
        $receiverId = isset($inputData['receiver_id']) ? intval($inputData['receiver_id']) : null;

        if (empty($messageText)) {
            http_response_code(400);
            echo json_encode(["message" => "Message content is required."]);
            exit();
        }

        if ($currentUserRole === 'Client') {
            // Save client's message
            $stmt = $pdo->prepare("INSERT INTO `chat_messages` (`sender_id`, `receiver_id`, `message`, `sender_name`, `is_bot`) VALUES (?, NULL, ?, ?, ?)");
            $stmt->execute([$currentUserId, $messageText, $username, 0]);
            $insertedId = $pdo->lastInsertId();

            // If message is sent to AI bot, generate AI chatbot response immediately
            if ($isBot) {
                // Determine chatbot reply text dynamically based on client project and tasks
                $replyText = "";
                $textLower = strtolower($messageText);

                // Fetch progress
                $projStmt = $pdo->prepare("SELECT * FROM `client_projects` WHERE `client_id` = ? LIMIT 1");
                $projStmt->execute([$currentUserId]);
                $project = $projStmt->fetch(PDO::FETCH_ASSOC);
                $progressVal = $project ? $project['progress'] : 15;
                $statusVal = $project ? $project['status'] : "Planning";

                // Fetch pending tasks
                $taskStmt = $pdo->prepare("SELECT * FROM `client_tasks` WHERE `client_id` = ? AND `status` = 'Pending'");
                $taskStmt->execute([$currentUserId]);
                $pendingTasks = $taskStmt->fetchAll(PDO::FETCH_ASSOC);

                if ($textLower === 'hi' || $textLower === 'hello' || $textLower === 'hey') {
                    $replyText = "Hello! I am your Brainfeels Project Assistant. How can I help you today? You can ask me about your active tasks, project status, or rate details.";
                } elseif (strpos($textLower, 'status') !== false || strpos($textLower, 'progress') !== false || strpos($textLower, 'stage') !== false) {
                    $replyText = "Your project is currently in the **" . $statusVal . "** stage. It is **" . $progressVal . "% complete**. The target delivery date is set for " . ($project ? $project['target_date'] : "TBD") . ".";
                } elseif (strpos($textLower, 'task') !== false || strpos($textLower, 'todo') !== false || strpos($textLower, 'checklist') !== false) {
                    if (count($pendingTasks) > 0) {
                        $replyText = "You have **" . count($pendingTasks) . "** pending task(s) in your checklist:\n";
                        foreach ($pendingTasks as $idx => $t) {
                            $replyText .= "\n" . ($idx + 1) . ". **" . $t['title'] . "** (Due: " . $t['due_date'] . ")";
                        }
                        $replyText .= "\n\nYou can mark these tasks as complete using the checkboxes in the portal!";
                    } else {
                        $replyText = "Fantastic news! You have completed all checklist tasks. Our engineering team is currently working on the development. I'll let you know if we need anything else.";
                    }
                } elseif (strpos($textLower, 'rate') !== false || strpos($textLower, 'price') !== false || strpos($textLower, 'cost') !== false) {
                    $replyText = "Brainfeels Tech offers competitive rates: Websites start at $1,200, Custom Mobile Apps start at $3,500, and UI/UX projects start at $600. Check the Services tab for detailed billing models!";
                } else {
                    $replyText = "I've recorded that requirement! I will notify Marcus and our project engineers so they can inspect this and reply in detail. Feel free to leave any design assets or specifications in the checklist.";
                }

                // Find admin user ID to associate
                $adminStmt = $pdo->query("SELECT `id` FROM `users` WHERE `role` = 'Super Admin' LIMIT 1");
                $adminId = $adminStmt->fetchColumn();
                if (!$adminId) $adminId = 1;

                // Save bot's reply
                $botStmt = $pdo->prepare("INSERT INTO `chat_messages` (`sender_id`, `receiver_id`, `message`, `sender_name`, `is_bot`) VALUES (?, ?, ?, 'Brainfeels AI Copilot', 1)");
                $botStmt->execute([$adminId, $currentUserId, $replyText]);
            }

            echo json_encode(["success" => true, "message" => "Message sent."]);
            exit();
        } else {
            // Admin sending message to a client
            if (!$receiverId) {
                http_response_code(400);
                echo json_encode(["message" => "Receiver client ID is required for administrative replies."]);
                exit();
            }

            $stmt = $pdo->prepare("INSERT INTO `chat_messages` (`sender_id`, `receiver_id`, `message`, `sender_name`, `is_bot`) VALUES (?, ?, ?, ?, 0)");
            $stmt->execute([$currentUserId, $receiverId, $messageText, $username]);
            
            echo json_encode(["success" => true, "message" => "Admin reply sent successfully."]);
            exit();
        }
    } else {
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed."]);
        exit();
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Database chat error: " . $e->getMessage()]);
    exit();
}
