<?php
require_once 'db.php';
require_once 'auth_helper.php';

$method = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'GET';

if ($method !== 'POST') {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed."]);
    exit();
}

// Secure Route: Content Editor or Super Admin
verify_user_role(['Content Editor', 'Super Admin'], $pdo);

// Create uploads directory if it doesn't exist
$uploadDir = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR;
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    $errorMsg = 'No file uploaded.';
    if (isset($_FILES['file'])) {
        $phpErrors = [
            UPLOAD_ERR_INI_SIZE   => 'File exceeds server max upload size.',
            UPLOAD_ERR_FORM_SIZE  => 'File exceeds form max size.',
            UPLOAD_ERR_PARTIAL    => 'File was only partially uploaded.',
            UPLOAD_ERR_NO_FILE    => 'No file was uploaded.',
            UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder on server.',
            UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk.',
        ];
        $errorMsg = $phpErrors[$_FILES['file']['error']] ?? 'Unknown upload error.';
    }
    http_response_code(400);
    echo json_encode(["message" => $errorMsg]);
    exit();
}

$file = $_FILES['file'];

// Validate file type
$allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/svg+xml',
    'image/webp', 'image/x-icon', 'image/vnd.microsoft.icon'
];

if (!in_array($file['type'], $allowedTypes)) {
    http_response_code(400);
    echo json_encode(["message" => "Invalid file type. Allowed: JPG, PNG, GIF, SVG, WebP, ICO"]);
    exit();
}

// Max 5MB
if ($file['size'] > 5 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode(["message" => "File too large. Maximum size is 5 MB."]);
    exit();
}

// Generate safe unique filename
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'ico'];
if (!in_array($ext, $allowedExtensions)) {
    http_response_code(400);
    echo json_encode(["message" => "Invalid file extension."]);
    exit();
}

$safeName = 'img_' . bin2hex(random_bytes(8)) . '.' . $ext;
$destination = $uploadDir . $safeName;
$folder = isset($_POST['folder']) ? trim($_POST['folder']) : 'general';

if (move_uploaded_file($file['tmp_name'], $destination)) {
    // Build the public URL for the uploaded file
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'];
    $scriptDir = dirname($_SERVER['SCRIPT_NAME']);
    $projectRoot = rtrim(dirname($scriptDir), '/\\');
    if ($projectRoot === '' || $projectRoot === '\\') {
        $projectRoot = '';
    }
    $url = $protocol . '://' . $host . $projectRoot . '/uploads/' . $safeName;

    // Register in cms_media table
    $mediaId = null;
    try {
        $stmt = $pdo->prepare("INSERT INTO cms_media (filename, original_name, url, mime_type, file_size, folder) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$safeName, $file['name'], $url, $file['type'], $file['size'], $folder]);
        $mediaId = $pdo->lastInsertId();
    } catch (Exception $e) {
        // Table might not exist yet — non-fatal, file is still uploaded
    }

    echo json_encode([
        "success"  => true,
        "url"      => $url,
        "filename" => $safeName,
        "original_name" => $file['name'],
        "size"     => $file['size'],
        "mime_type" => $file['type'],
        "media_id" => $mediaId
    ]);
} else {
    http_response_code(500);
    echo json_encode(["message" => "Failed to save uploaded file."]);
}
