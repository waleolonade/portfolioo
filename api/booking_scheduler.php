<?php
require_once 'db.php';

// Disable error output in JSON responses, but keep logging enabled
ini_set('display_errors', 0);
header('Content-Type: application/json');

try {
    // 1. Ensure tracking columns exist in the inquiries table
    $columnsToCheck = [
        'reminded_1day' => 'TINYINT DEFAULT 0',
        'reminded_day_of' => 'TINYINT DEFAULT 0',
        'reminded_1hour' => 'TINYINT DEFAULT 0',
        'reminded_30min' => 'TINYINT DEFAULT 0'
    ];

    foreach ($columnsToCheck as $column => $definition) {
        $stmt = $pdo->query("SHOW COLUMNS FROM `inquiries` LIKE '$column'");
        if ($stmt->rowCount() === 0) {
            $pdo->exec("ALTER TABLE `inquiries` ADD COLUMN `$column` $definition");
        }
    }

    // 2. Fetch all upcoming bookings
    $stmt = $pdo->prepare("
        SELECT * FROM `inquiries` 
        WHERE `type` = 'booking' 
          AND `booking_date` IS NOT NULL 
          AND `booking_date` != '' 
          AND `booking_time` IS NOT NULL 
          AND `booking_time` != ''
    ");
    $stmt->execute();
    $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $now = time();
    $remindersSentCount = 0;
    $actionsTaken = [];

    // Admin address
    $admin_email = "brainfeelstech@gmail.com";

    foreach ($bookings as $booking) {
        $bookingString = trim($booking['booking_date']) . ' ' . trim($booking['booking_time']);
        $bookingTime = strtotime($bookingString);
        
        // If date/time parsing failed or booking is in the past, skip
        if ($bookingTime === false || $bookingTime < $now) {
            continue;
        }

        $diff = $bookingTime - $now;
        $bookingId = intval($booking['id']);
        
        // Flags
        $reminded1Day = intval($booking['reminded_1day']);
        $remindedDayOf = intval($booking['reminded_day_of']);
        $reminded1Hour = intval($booking['reminded_1hour']);
        $reminded30Min = intval($booking['reminded_30min']);

        $sendReminder = false;
        $reminderType = '';
        $updateField = '';

        // Check conditions
        if ($diff <= 86400 && $diff > 0 && !$reminded1Day) {
            // 1 Day reminder (within 24 hours)
            $sendReminder = true;
            $reminderType = '1 Day Reminder';
            $updateField = 'reminded_1day';
        } elseif (date('Y-m-d', $bookingTime) === date('Y-m-d', $now) && !$remindedDayOf) {
            // Day of meeting reminder
            $sendReminder = true;
            $reminderType = 'Day of Meeting Reminder';
            $updateField = 'reminded_day_of';
        } elseif ($diff <= 3600 && $diff > 0 && !$reminded1Hour) {
            // 1 Hour reminder
            $sendReminder = true;
            $reminderType = '1 Hour Reminder';
            $updateField = 'reminded_1hour';
        } elseif ($diff <= 1800 && $diff > 0 && !$reminded30Min) {
            // 30 Minutes reminder
            $sendReminder = true;
            $reminderType = '30 Minutes Reminder';
            $updateField = 'reminded_30min';
        }

        if ($sendReminder) {
            // Format dates for email
            $formattedDate = date('l, F j, Y', $bookingTime);
            $formattedTime = date('h:i A', $bookingTime);

            // Send to both user and admin
            $recipients = [
                'user' => $booking['email'],
                'admin' => $admin_email
            ];

            foreach ($recipients as $recipientRole => $toEmail) {
                $subject = "Meeting Reminder: " . $reminderType . " - " . $booking['subject'];
                $headers = "MIME-Version: 1.0\r\n";
                $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
                $headers .= "From: Brainfeels Tech <no-reply@brainfeelstech.com>\r\n";
                
                $titleGreeting = ($recipientRole === 'admin') ? "Hello Admin," : "Hi " . htmlspecialchars($booking['name']) . ",";
                $subMessage = ($recipientRole === 'admin') 
                    ? "This is an automated reminder for your upcoming client briefing session with " . htmlspecialchars($booking['name']) . "."
                    : "This is an automated reminder for your upcoming consultation with the Brainfeels engineering team.";

                $email_body = "
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; color: #1e293b; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
                        .header { background: linear-gradient(135deg, #0f172a, #2563eb); padding: 30px 20px; text-align: center; color: white; }
                        .header h2 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.025em; }
                        .content { padding: 35px 25px; line-height: 1.6; }
                        .alert-badge { display: inline-block; background-color: #eff6ff; color: #2563eb; font-weight: 700; font-size: 11px; padding: 6px 12px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 20px; letter-spacing: 0.05em; }
                        .card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 25px 0; }
                        .card-title { font-weight: 700; color: #475569; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
                        .card-row { display: flex; margin-bottom: 8px; font-size: 14px; }
                        .card-label { width: 100px; font-weight: 600; color: #64748b; }
                        .card-value { font-weight: 700; color: #0f172a; }
                        .footer { background-color: #f8fafc; text-align: center; padding: 20px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h2>Brainfeels Tech</h2>
                        </div>
                        <div class='content'>
                            <span class='alert-badge'>" . $reminderType . "</span>
                            <p style='font-size: 15px; font-weight: 600;'>" . $titleGreeting . "</p>
                            <p style='font-size: 14px; color: #475569;'>" . $subMessage . "</p>
                            
                            <div class='card'>
                                <div class='card-title'>Meeting Schedule Details</div>
                                <div class='card-row'><span class='card-label'>Date:</span><span class='card-value'>" . $formattedDate . "</span></div>
                                <div class='card-row'><span class='card-label'>Time:</span><span class='card-value'>" . $formattedTime . "</span></div>
                                <div class='card-row'><span class='card-label'>Subject:</span><span class='card-value'>" . htmlspecialchars($booking['subject']) . "</span></div>
                            </div>
                            
                            <p style='font-size: 13px; color: #64748b; font-style: italic;'>
                                Note: This briefing will take place online. A video conference link will be shared or active shortly before the start.
                            </p>
                        </div>
                        <div class='footer'>
                            &copy; " . date('Y') . " Brainfeels Tech. All rights reserved.
                        </div>
                    </div>
                </body>
                </html>
                ";

                @mail($toEmail, $subject, $email_body, $headers);
            }

            // Update flags in database
            $updateStmt = $pdo->prepare("UPDATE `inquiries` SET `$updateField` = 1 WHERE `id` = ?");
            $updateStmt->execute([$bookingId]);

            $remindersSentCount++;
            $actionsTaken[] = [
                'booking_id' => $bookingId,
                'client_email' => $booking['email'],
                'reminder' => $reminderType
            ];
        }
    }

    echo json_encode([
        "success" => true,
        "reminders_sent" => $remindersSentCount,
        "details" => $actionsTaken
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Scheduler failed: " . $e->getMessage()
    ]);
}
