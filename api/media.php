<?php
require_once 'db.php';
require_once 'auth_helper.php';

$method = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'GET';

switch ($method) {

    /* ═══════════════ GET: List all media ═══════════════ */
    case 'GET':
        verify_user_role(['Content Editor', 'Super Admin', 'Project Manager'], $pdo);
        
        $search = isset($_GET['search']) ? trim($_GET['search']) : '';
        $folder = isset($_GET['folder']) ? trim($_GET['folder']) : '';
        $type   = isset($_GET['type']) ? trim($_GET['type']) : '';
        
        $sql = "SELECT * FROM cms_media WHERE 1=1";
        $params = [];
        
        if ($search !== '') {
            $sql .= " AND (original_name LIKE ? OR filename LIKE ?)";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }
        if ($folder !== '') {
            $sql .= " AND folder = ?";
            $params[] = $folder;
        }
        if ($type !== '') {
            $sql .= " AND mime_type LIKE ?";
            $params[] = "$type%";
        }
        
        $sql .= " ORDER BY uploaded_at DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $media = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(["success" => true, "media" => $media]);
        break;

    /* ═══════════════ DELETE: Remove media file ═══════════════ */
    case 'DELETE':
        verify_user_role(['Content Editor', 'Super Admin'], $pdo);
        
        $input = json_decode(file_get_contents('php://input'), true);
        $id = isset($input['id']) ? intval($input['id']) : 0;
        
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(["message" => "Invalid media ID."]);
            exit();
        }
        
        // Fetch file info
        $stmt = $pdo->prepare("SELECT * FROM cms_media WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$row) {
            http_response_code(404);
            echo json_encode(["message" => "Media not found."]);
            exit();
        }
        
        // Delete physical file
        $filePath = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . $row['filename'];
        if (file_exists($filePath)) {
            unlink($filePath);
        }
        
        // Delete from database
        $del = $pdo->prepare("DELETE FROM cms_media WHERE id = ?");
        $del->execute([$id]);
        
        echo json_encode(["success" => true, "message" => "Media deleted."]);
        break;

    /* ═══════════════ POST: Save revision / Get revisions ═══════════════ */
    case 'POST':
        verify_user_role(['Content Editor', 'Super Admin'], $pdo);
        
        $action = isset($_GET['action']) ? trim($_GET['action']) : '';
        
        if ($action === 'save_revision') {
            $input = json_decode(file_get_contents('php://input'), true);
            $data = isset($input['revision_data']) ? $input['revision_data'] : '';
            $desc = isset($input['description']) ? trim($input['description']) : 'Auto-save';
            
            if (empty($data)) {
                http_response_code(400);
                echo json_encode(["message" => "No revision data provided."]);
                exit();
            }
            
            // Save the revision
            $stmt = $pdo->prepare("INSERT INTO cms_revisions (revision_data, description) VALUES (?, ?)");
            $stmt->execute([$data, $desc]);
            $newId = $pdo->lastInsertId();
            
            // Keep only the latest 30 revisions
            $cleanup = $pdo->query("SELECT COUNT(*) FROM cms_revisions")->fetchColumn();
            if ($cleanup > 30) {
                $pdo->exec("DELETE FROM cms_revisions WHERE id NOT IN (SELECT id FROM (SELECT id FROM cms_revisions ORDER BY created_at DESC LIMIT 30) AS latest)");
            }
            
            echo json_encode(["success" => true, "id" => $newId, "message" => "Revision saved."]);
            
        } elseif ($action === 'list_revisions') {
            $stmt = $pdo->query("SELECT id, description, created_at FROM cms_revisions ORDER BY created_at DESC LIMIT 30");
            $revisions = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["success" => true, "revisions" => $revisions]);
            
        } elseif ($action === 'get_revision') {
            $input = json_decode(file_get_contents('php://input'), true);
            $id = isset($input['id']) ? intval($input['id']) : 0;
            $stmt = $pdo->prepare("SELECT * FROM cms_revisions WHERE id = ?");
            $stmt->execute([$id]);
            $rev = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$rev) {
                http_response_code(404);
                echo json_encode(["message" => "Revision not found."]);
                exit();
            }
            echo json_encode(["success" => true, "revision" => $rev]);
            
        } elseif ($action === 'delete_revision') {
            $input = json_decode(file_get_contents('php://input'), true);
            $id = isset($input['id']) ? intval($input['id']) : 0;
            $stmt = $pdo->prepare("DELETE FROM cms_revisions WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(["success" => true, "message" => "Revision deleted."]);
            
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Unknown action. Use: save_revision, list_revisions, get_revision, delete_revision"]);
        }
        break;
    
    default:
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed."]);
        break;
}
