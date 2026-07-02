<?php
/**
 * Payment Gateways Management API
 * Handles: OTP generation/verification, gateway CRUD (Super Admin only)
 * 
 * GET    — Fetch enabled gateways (public keys only, for client portal)
 * POST   — Various actions: send_otp, verify_otp, update_gateway, toggle_gateway, get_admin_gateways
 */
require_once 'db.php';
require_once 'auth_helper.php';

$method = $_SERVER['REQUEST_METHOD'];

// ─── GET: Return enabled gateways with public keys only (for client-facing checkout) ───
if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT `id`, `gateway_name`, `display_name`, `public_key`, `is_enabled`, `is_live_mode` FROM `payment_gateways` WHERE `is_enabled` = 1");
        $gateways = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Mark each gateway as configured or not (frontend uses this for UX only)
        foreach ($gateways as &$gw) {
            $gw['is_configured'] = !empty($gw['public_key']) ? 1 : 0;
            // Never expose public_key value in list — frontend only needs is_configured flag
            // public_key is provided during payment initialization, not here
            unset($gw['public_key']);
        }

        echo json_encode(["success" => true, "gateways" => $gateways]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["message" => "Error fetching gateways: " . $e->getMessage()]);
    }
    exit();
}

// ─── POST: Admin actions (OTP + gateway management) ───
if ($method === 'POST') {
    $inputData = json_decode(file_get_contents('php://input'), true);
    $action = $inputData['action'] ?? '';

    // ── Send OTP to Admin Email ──
    if ($action === 'send_otp') {
        $user = verify_user_role(['Super Admin'], $pdo);
        
        // Get admin email
        $emailStmt = $pdo->prepare("SELECT `email` FROM `users` WHERE `id` = ?");
        $emailStmt->execute([$user['id']]);
        $adminEmail = $emailStmt->fetchColumn();

        if (empty($adminEmail)) {
            http_response_code(400);
            echo json_encode(["message" => "No email configured for this admin account. Please update your profile."]);
            exit();
        }

        // Generate 6-digit OTP
        $otpCode = str_pad(random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
        $expiresAt = date('Y-m-d H:i:s', strtotime('+10 minutes'));

        // Invalidate any previous unused OTPs for this user
        $pdo->prepare("UPDATE `admin_otp_codes` SET `is_used` = 1 WHERE `user_id` = ? AND `is_used` = 0")->execute([$user['id']]);

        // Store OTP
        $otpStmt = $pdo->prepare("INSERT INTO `admin_otp_codes` (`user_id`, `otp_code`, `purpose`, `expires_at`) VALUES (?, ?, 'gateway_access', ?)");
        $otpStmt->execute([$user['id'], $otpCode, $expiresAt]);

        // Attempt to send email (will work in production with SMTP configured)
        $subject = "Brainfeels Tech — Payment Gateway Access OTP";
        $emailBody = "Your security verification code is: $otpCode\n\nThis code expires in 10 minutes.\nDo not share this code with anyone.\n\n— Brainfeels Tech Security";
        $headers = "From: security@brainfeels.tech\r\nContent-Type: text/plain; charset=UTF-8";
        
        $emailSent = @mail($adminEmail, $subject, $emailBody, $headers);

        // In development mode, also return the OTP in the response
        $response = [
            "success" => true, 
            "message" => "OTP sent to " . substr($adminEmail, 0, 3) . "***" . substr($adminEmail, strpos($adminEmail, '@')),
            "email_delivered" => $emailSent
        ];

        // Dev mode: always include OTP in response (mail() requires SMTP config in production)
        $response["dev_otp"] = $otpCode;

        echo json_encode($response);
        exit();
    }

    // ── Get Admin Email ──
    if ($action === 'get_admin_email') {
        $user = verify_user_role(['Super Admin'], $pdo);
        echo json_encode(["success" => true, "email" => $user['email']]);
        exit();
    }

    // ── Update Admin Email ──
    if ($action === 'update_admin_email') {
        $user = verify_user_role(['Super Admin'], $pdo);
        $newEmail = trim($inputData['email'] ?? '');

        if (empty($newEmail) || !filter_var($newEmail, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(["message" => "A valid email address is required."]);
            exit();
        }

        $updateStmt = $pdo->prepare("UPDATE `users` SET `email` = ? WHERE `id` = ?");
        $updateStmt->execute([$newEmail, $user['id']]);

        echo json_encode(["success" => true, "message" => "Admin email updated to $newEmail."]);
        exit();
    }

    // ── Verify OTP ──
    if ($action === 'verify_otp') {
        $user = verify_user_role(['Super Admin'], $pdo);
        $otpInput = trim($inputData['otp_code'] ?? '');

        if (empty($otpInput)) {
            http_response_code(400);
            echo json_encode(["message" => "OTP code is required."]);
            exit();
        }

        // Find valid OTP
        $otpStmt = $pdo->prepare("SELECT * FROM `admin_otp_codes` WHERE `user_id` = ? AND `otp_code` = ? AND `is_used` = 0 AND `expires_at` > NOW() ORDER BY `id` DESC LIMIT 1");
        $otpStmt->execute([$user['id'], $otpInput]);
        $otpRecord = $otpStmt->fetch(PDO::FETCH_ASSOC);

        if (!$otpRecord) {
            http_response_code(401);
            echo json_encode(["message" => "Invalid or expired OTP code."]);
            exit();
        }

        // Generate session token (valid for 30 minutes)
        $sessionToken = bin2hex(random_bytes(32));
        $updateOtp = $pdo->prepare("UPDATE `admin_otp_codes` SET `is_used` = 1, `session_token` = ? WHERE `id` = ?");
        $updateOtp->execute([$sessionToken, $otpRecord['id']]);

        echo json_encode([
            "success" => true,
            "message" => "OTP verified successfully. Access granted.",
            "session_token" => $sessionToken
        ]);
        exit();
    }

    // ── Get All Gateways (Admin — requires OTP session) ──
    if ($action === 'get_admin_gateways') {
        $user = verify_user_role(['Super Admin'], $pdo);
        $sessionToken = trim($inputData['session_token'] ?? '');

        if (!validateOtpSession($pdo, $user['id'], $sessionToken)) {
            http_response_code(403);
            echo json_encode(["message" => "Invalid or expired security session. Please re-verify with OTP."]);
            exit();
        }

        $stmt = $pdo->query("SELECT `id`, `gateway_name`, `display_name`, `public_key`, `secret_key`, `callback_url`, `webhook_secret`, `is_enabled`, `is_live_mode`, `updated_at` FROM `payment_gateways` ORDER BY `id` ASC");
        $gateways = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Mask secret keys for display (show last 4 characters)
        foreach ($gateways as &$gw) {
            if (!empty($gw['secret_key'])) {
                $gw['secret_key_masked'] = str_repeat('•', max(0, strlen($gw['secret_key']) - 4)) . substr($gw['secret_key'], -4);
            } else {
                $gw['secret_key_masked'] = '';
            }
        }

        echo json_encode(["success" => true, "gateways" => $gateways]);
        exit();
    }

    // ── Update Gateway Configuration ──
    if ($action === 'update_gateway') {
        $user = verify_user_role(['Super Admin'], $pdo);
        $sessionToken = trim($inputData['session_token'] ?? '');

        if (!validateOtpSession($pdo, $user['id'], $sessionToken)) {
            http_response_code(403);
            echo json_encode(["message" => "Invalid or expired security session. Please re-verify with OTP."]);
            exit();
        }

        $gatewayName = trim($inputData['gateway_name'] ?? '');
        $publicKey = trim($inputData['public_key'] ?? '');
        $secretKey = trim($inputData['secret_key'] ?? '');
        $callbackUrl = trim($inputData['callback_url'] ?? '');
        $webhookSecret = trim($inputData['webhook_secret'] ?? '');
        $isEnabled = intval($inputData['is_enabled'] ?? 0);
        $isLiveMode = intval($inputData['is_live_mode'] ?? 0);

        if (empty($gatewayName)) {
            http_response_code(400);
            echo json_encode(["message" => "Gateway name is required."]);
            exit();
        }

        // Check if gateway exists
        $checkStmt = $pdo->prepare("SELECT `id`, `secret_key` FROM `payment_gateways` WHERE `gateway_name` = ?");
        $checkStmt->execute([$gatewayName]);
        $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);

        if (!$existing) {
            http_response_code(404);
            echo json_encode(["message" => "Gateway not found."]);
            exit();
        }

        // If secret_key is all dots/bullets, keep the existing one (user didn't change it)
        if (preg_match('/^[•·.]+$/', $secretKey) || $secretKey === '') {
            $secretKey = $existing['secret_key'];
        }

        $updateStmt = $pdo->prepare("UPDATE `payment_gateways` SET `public_key` = ?, `secret_key` = ?, `callback_url` = ?, `webhook_secret` = ?, `is_enabled` = ?, `is_live_mode` = ? WHERE `gateway_name` = ?");
        $updateStmt->execute([$publicKey, $secretKey, $callbackUrl, $webhookSecret, $isEnabled, $isLiveMode, $gatewayName]);

        echo json_encode(["success" => true, "message" => ucfirst($gatewayName) . " configuration updated successfully."]);
        exit();
    }

    // ── Toggle Gateway Enabled/Disabled ──
    if ($action === 'toggle_gateway') {
        $user = verify_user_role(['Super Admin'], $pdo);
        $sessionToken = trim($inputData['session_token'] ?? '');

        if (!validateOtpSession($pdo, $user['id'], $sessionToken)) {
            http_response_code(403);
            echo json_encode(["message" => "Invalid or expired security session. Please re-verify with OTP."]);
            exit();
        }

        $gatewayName = trim($inputData['gateway_name'] ?? '');
        if (empty($gatewayName)) {
            http_response_code(400);
            echo json_encode(["message" => "Gateway name is required."]);
            exit();
        }

        $stmt = $pdo->prepare("UPDATE `payment_gateways` SET `is_enabled` = NOT `is_enabled` WHERE `gateway_name` = ?");
        $stmt->execute([$gatewayName]);

        echo json_encode(["success" => true, "message" => ucfirst($gatewayName) . " toggled."]);
        exit();
    }

    http_response_code(400);
    echo json_encode(["message" => "Invalid action."]);
    exit();
}

http_response_code(405);
echo json_encode(["message" => "Method not allowed."]);
exit();

// ── Helper: Validate OTP Session Token ──
function validateOtpSession($pdo, $userId, $sessionToken) {
    if (empty($sessionToken)) return false;
    
    $stmt = $pdo->prepare("SELECT * FROM `admin_otp_codes` WHERE `user_id` = ? AND `session_token` = ? AND `is_used` = 1 AND `expires_at` > DATE_SUB(NOW(), INTERVAL 30 MINUTE) ORDER BY `id` DESC LIMIT 1");
    $stmt->execute([$userId, $sessionToken]);
    return $stmt->fetch(PDO::FETCH_ASSOC) !== false;
}
