<?php
require_once 'db.php';

$method = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'GET';

if ($method === 'POST') {
    $inputData = json_decode(file_get_contents('php://input'), true);
    $email = isset($inputData['email']) ? trim($inputData['email']) : '';

    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["message" => "Please provide a valid email address."]);
        exit();
    }

    try {
        $stmt = $pdo->prepare("SELECT id FROM `newsletter_subscribers` WHERE `email` = ?");
        $stmt->execute([$email]);
        if ($stmt->fetchColumn()) {
            echo json_encode(["success" => true, "message" => "You are already subscribed!"]);
            exit();
        }

        $stmt = $pdo->prepare("INSERT INTO `newsletter_subscribers` (`email`) VALUES (?)");
        $stmt->execute([$email]);
        
        // Send Notification Email
        $to = $email;
        $subject = "Welcome to Brainfeels Tech - Premium Engineering Insights";
        
        $headers  = "MIME-Version: 1.0\r\n";
        $headers .= "Content-type: text/html; charset=UTF-8\r\n";
        $headers .= "From: Brainfeels Tech <hello@brainfeelstech.com>\r\n";
        
        $htmlMessage = '
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: "Inter", -apple-system, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
                .header { background: linear-gradient(135deg, #0f172a, #3b82f6); padding: 40px 20px; text-align: center; color: white; }
                .header h1 { margin: 0; font-size: 28px; font-weight: 800; }
                .content { padding: 40px 30px; line-height: 1.6; }
                .content h2 { color: #0f172a; font-size: 22px; margin-top: 0; }
                .feature-box { background-color: #f1f5f9; border-left: 4px solid #3b82f6; padding: 15px 20px; margin: 25px 0; border-radius: 0 8px 8px 0; }
                .feature-box h3 { margin: 0 0 10px 0; font-size: 16px; color: #3b82f6; text-transform: uppercase; letter-spacing: 0.05em; }
                .feature-box ul { margin: 0; padding-left: 20px; }
                .feature-box li { margin-bottom: 8px; }
                .footer { background-color: #f8fafc; text-align: center; padding: 20px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
                .btn { display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Brainfeels Tech</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Advanced Engineering Insights</p>
                </div>
                <div class="content">
                    <h2>Subscription Confirmed!</h2>
                    <p>Hello,</p>
                    <p>Thank you for subscribing to our newsletter. You are now part of an exclusive group of engineers, founders, and tech leaders who receive our latest updates directly.</p>
                    
                    <div class="feature-box">
                        <h3>What to Expect</h3>
                        <ul>
                            <li><strong>Cloud Architecture Breakdown:</strong> Deep dives into scalable deployments and zero-trust security.</li>
                            <li><strong>Advanced React Patterns:</strong> Frontend micro-animations, premium UI/UX case studies, and performance optimization.</li>
                            <li><strong>Exclusive Tooling:</strong> Early access to our open-source boilerplates and IT automation scripts.</li>
                        </ul>
                    </div>
                    
                    <p>We are committed to delivering high-value technical content. Stay tuned for our next dispatch!</p>
                    
                    <div style="text-align: center;">
                        <a href="http://localhost:5173/portfolio" class="btn">Explore Our Case Studies</a>
                    </div>
                </div>
                <div class="footer">
                    &copy; ' . date('Y') . ' Brainfeels Tech. All rights reserved.<br>
                    You received this email because you opted in on our website.<br>
                    Lagos, Nigeria.
                </div>
            </div>
        </body>
        </html>
        ';
        
        // Use @ to suppress warning if sendmail is not configured on local XAMPP
        @mail($to, $subject, $htmlMessage, $headers);
        
        echo json_encode([
            "success" => true,
            "message" => "Thank you for subscribing to our newsletter!"
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Failed to subscribe: " . $e->getMessage()]);
    }
} else if ($method === 'GET') {
    require_once 'auth_helper.php';
    verify_admin_token();
    
    try {
        $stmt = $pdo->query("SELECT * FROM `newsletter_subscribers` ORDER BY `created_at` DESC");
        $subscribers = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($subscribers);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Failed to fetch subscribers: " . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed."]);
}
