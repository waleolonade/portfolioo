<?php
require_once 'db.php';
require_once 'auth_helper.php';

$method = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'GET';

switch ($method) {
    case 'GET':
        // Secure Route
        verify_admin_token();
        
        try {
            $stmt = $pdo->query("SELECT * FROM `inquiries` ORDER BY `created_at` DESC");
            $inquiries = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($inquiries);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Failed to fetch inquiries: " . $e->getMessage()]);
        }
        break;
        
    case 'POST':
        // Public Route - Contact form, booking, and quote submissions
        $inputData = json_decode(file_get_contents('php://input'), true);
        
        $type = isset($inputData['type']) ? trim($inputData['type']) : 'contact';
        $name = isset($inputData['name']) ? trim($inputData['name']) : '';
        $email = isset($inputData['email']) ? trim($inputData['email']) : '';
        $phone = isset($inputData['phone']) ? trim($inputData['phone']) : '';
        $company = isset($inputData['company']) ? trim($inputData['company']) : '';
        $budget = isset($inputData['budget']) ? trim($inputData['budget']) : '';
        $timeline = isset($inputData['timeline']) ? trim($inputData['timeline']) : '';
        $subject = isset($inputData['subject']) ? trim($inputData['subject']) : '';
        $message = isset($inputData['message']) ? trim($inputData['message']) : '';
        $booking_date = isset($inputData['booking_date']) ? trim($inputData['booking_date']) : '';
        $booking_time = isset($inputData['booking_time']) ? trim($inputData['booking_time']) : '';
        
        if (empty($name) || empty($email) || empty($subject) || empty($message)) {
            http_response_code(400);
            echo json_encode(["message" => "All contact fields (name, email, subject, message) are required."]);
            exit();
        }
        
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(["message" => "Invalid email address format."]);
            exit();
        }
        
        try {
            $stmt = $pdo->prepare("INSERT INTO `inquiries` (`type`, `name`, `email`, `phone`, `company`, `budget`, `timeline`, `subject`, `message`, `booking_date`, `booking_time`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$type, $name, $email, $phone, $company, $budget, $timeline, $subject, $message, $booking_date, $booking_time]);
            
            // Email dispatch to brainfeelstech@gmail.com
            $to = "brainfeelstech@gmail.com";
            $email_subject = "New " . ucfirst($type) . " Inquiry: " . $subject;
            $headers = "MIME-Version: 1.0\r\n";
            $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
            $headers .= "From: no-reply@brainfeelstech.com\r\n";
            $headers .= "Reply-To: " . $email . "\r\n";
            
            $email_body = "
            <html>
            <head>
                <title>New Inquiry Received</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { padding: 20px; border: 1px solid #eee; border-radius: 5px; max-width: 600px; }
                    .header { background-color: #0f172a; color: white; padding: 15px; text-align: center; border-radius: 5px 5px 0 0; }
                    .content { padding: 20px; }
                    .field { margin-bottom: 10px; }
                    .label { font-weight: bold; color: #475569; }
                    .value { margin-left: 10px; }
                    .message-box { background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 15px; margin-top: 15px; }
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>
                        <h2>Brainfeels Tech - New Inquiry Notification</h2>
                    </div>
                    <div class='content'>
                        <div class='field'><span class='label'>Type:</span><span class='value'>" . htmlspecialchars(ucfirst($type)) . "</span></div>
                        <div class='field'><span class='label'>Name:</span><span class='value'>" . htmlspecialchars($name) . "</span></div>
                        <div class='field'><span class='label'>Email:</span><span class='value'>" . htmlspecialchars($email) . "</span></div>
                        " . (!empty($phone) ? "<div class='field'><span class='label'>Phone:</span><span class='value'>" . htmlspecialchars($phone) . "</span></div>" : "") . "
                        " . (!empty($company) ? "<div class='field'><span class='label'>Company:</span><span class='value'>" . htmlspecialchars($company) . "</span></div>" : "") . "
                        " . (!empty($budget) ? "<div class='field'><span class='label'>Budget:</span><span class='value'>" . htmlspecialchars($budget) . "</span></div>" : "") . "
                        " . (!empty($timeline) ? "<div class='field'><span class='label'>Timeline:</span><span class='value'>" . htmlspecialchars($timeline) . "</span></div>" : "") . "
                        " . (!empty($booking_date) ? "<div class='field'><span class='label'>Booking Date:</span><span class='value'>" . htmlspecialchars($booking_date) . "</span></div>" : "") . "
                        " . (!empty($booking_time) ? "<div class='field'><span class='label'>Booking Time:</span><span class='value'>" . htmlspecialchars($booking_time) . "</span></div>" : "") . "
                        <div class='field'><span class='label'>Subject:</span><span class='value'>" . htmlspecialchars($subject) . "</span></div>
                        <div class='message-box'>
                            <strong>Message:</strong><br/>
                            " . nl2br(htmlspecialchars($message)) . "
                        </div>
                    </div>
                </div>
            </body>
            </html>
            ";
            
            @mail($to, $email_subject, $email_body, $headers);
            
            // Client Auto-Responder Email
            $client_to = $email;
            $client_subject = "We received your request - Brainfeels Tech";
            $client_headers = "MIME-Version: 1.0\r\n";
            $client_headers .= "Content-Type: text/html; charset=UTF-8\r\n";
            $client_headers .= "From: Brainfeels Tech <no-reply@brainfeelstech.com>\r\n";
            
            $typeFormatted = ucfirst($type);
            $client_email_body = "
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Inter', sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
                    .header { background: linear-gradient(135deg, #0f172a, #3b82f6); padding: 40px 20px; text-align: center; color: white; }
                    .header h2 { margin: 0; font-size: 24px; font-weight: 800; }
                    .content { padding: 40px 30px; line-height: 1.6; }
                    .footer { background-color: #f8fafc; text-align: center; padding: 20px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>
                        <h2>Brainfeels Tech</h2>
                    </div>
                    <div class='content'>
                        <p>Hi " . htmlspecialchars($name) . ",</p>
                        <p>Thank you for reaching out to us. We have successfully received your <strong>" . $typeFormatted . "</strong> request.</p>
                        <p>Our engineering team will review the details you provided and get back to you shortly, typically within 24 hours.</p>
                        <p>If you have any urgent questions, feel free to reply directly to this email or chat with us on WhatsApp.</p>
                        <br>
                        <p>Best Regards,<br><strong>Brainfeels Tech Team</strong></p>
                    </div>
                    <div class='footer'>
                        &copy; " . date('Y') . " Brainfeels Tech. All rights reserved.<br>
                        Lagos, Nigeria
                    </div>
                </div>
            </body>
            </html>
            ";
            
            @mail($client_to, $client_subject, $client_email_body, $client_headers);
            
            echo json_encode([
                "success" => true,
                "message" => "Your message has been sent successfully. We will get back to you soon!"
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Failed to send message: " . $e->getMessage()]);
        }
        break;
        
    case 'PUT':
        // Secure Route - Update status (e.g. mark as read)
        verify_admin_token();
        
        $inputData = json_decode(file_get_contents('php://input'), true);
        
        $id = isset($_GET['id']) ? intval($_GET['id']) : (isset($inputData['id']) ? intval($inputData['id']) : 0);
        $status = isset($inputData['status']) ? trim($inputData['status']) : 'read';
        
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(["message" => "Invalid inquiry ID."]);
            exit();
        }
        
        try {
            $stmt = $pdo->prepare("UPDATE `inquiries` SET `status` = ? WHERE `id` = ?");
            $stmt->execute([$status, $id]);
            
            echo json_encode([
                "success" => true,
                "message" => "Inquiry status updated successfully."
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Failed to update inquiry: " . $e->getMessage()]);
        }
        break;
        
    case 'DELETE':
        // Secure Route - Delete inquiry
        verify_admin_token();
        
        $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
        
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(["message" => "Invalid inquiry ID."]);
            exit();
        }
        
        try {
            $stmt = $pdo->prepare("DELETE FROM `inquiries` WHERE `id` = ?");
            $stmt->execute([$id]);
            
            echo json_encode([
                "success" => true,
                "message" => "Inquiry deleted successfully."
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Failed to delete inquiry: " . $e->getMessage()]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed."]);
        break;
}
