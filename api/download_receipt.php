<?php
require_once 'db.php';
header("Content-Type: text/html; charset=UTF-8");

// Verify token passed in query parameter (or header)
$token = isset($_GET['token']) ? trim($_GET['token']) : '';
if (empty($token)) {
    // Check Authorization header as fallback
    $headers = apache_request_headers();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $token = $matches[1];
    }
}

if (empty($token)) {
    http_response_code(401);
    echo "<h1>401 Unauthorized</h1><p>Missing session token.</p>";
    exit();
}

try {
    // Decode JWT or verify username
    $_SERVER['HTTP_AUTHORIZATION'] = 'Bearer ' . $token;
    require_once 'auth_helper.php';
    
    $username = verify_admin_token();
    
    // Get user details
    $userStmt = $pdo->prepare("SELECT `id`, `username`, `role` FROM `users` WHERE `username` = ?");
    $userStmt->execute([$username]);
    $currentUser = $userStmt->fetch(PDO::FETCH_ASSOC);

    if (!$currentUser) {
        http_response_code(401);
        echo "<h1>401 Unauthorized</h1><p>Invalid session parameters.</p>";
        exit();
    }

    $currentUserId = intval($currentUser['id']);
    $currentUserRole = $currentUser['role'];

    // Get invoice ID
    $invoiceId = isset($_GET['invoice_id']) ? intval($_GET['invoice_id']) : 0;
    if ($invoiceId <= 0) {
        http_response_code(400);
        echo "<h1>400 Bad Request</h1><p>Invoice ID is required.</p>";
        exit();
    }

    // Fetch invoice from database
    $invStmt = $pdo->prepare("SELECT * FROM `client_invoices` WHERE `id` = ?");
    $invStmt->execute([$invoiceId]);
    $invoice = $invStmt->fetch(PDO::FETCH_ASSOC);

    if (!$invoice) {
        http_response_code(404);
        echo "<h1>404 Not Found</h1><p>Invoice record not found.</p>";
        exit();
    }

    $clientOwnerId = intval($invoice['client_id']);

    // Access control: client can only view their own invoices. Admins can view any.
    if ($currentUserRole === 'Client' && $clientOwnerId !== $currentUserId) {
        http_response_code(403);
        echo "<h1>403 Forbidden</h1><p>Access denied to this billing record.</p>";
        exit();
    }

    // Fetch client's project code
    $projStmt = $pdo->prepare("SELECT * FROM `client_projects` WHERE `client_id` = ? LIMIT 1");
    $projStmt->execute([$clientOwnerId]);
    $project = $projStmt->fetch(PDO::FETCH_ASSOC);

    $clientUsername = $currentUser['username'];
    if ($currentUserRole !== 'Client') {
        $ownerStmt = $pdo->prepare("SELECT `username` FROM `users` WHERE `id` = ?");
        $ownerStmt->execute([$clientOwnerId]);
        $clientUsername = $ownerStmt->fetchColumn() ?: 'Client';
    }

    // Fetch CMS brand settings from database dynamically
    $settingsStmt = $pdo->query("SELECT `setting_key`, `setting_value` FROM `cms_settings`");
    $cmsSettings = $settingsStmt->fetchAll(PDO::FETCH_KEY_PAIR);

    $companyName = isset($cmsSettings['site_logo_text']) ? $cmsSettings['site_logo_text'] : 'Brainfeels Tech';
    $companyEmail = isset($cmsSettings['contact_email']) ? $cmsSettings['contact_email'] : 'billing@brainfeels.tech';
    $companyPhone = isset($cmsSettings['contact_phone']) ? $cmsSettings['contact_phone'] : '08061657738';
    $companyAddress = isset($cmsSettings['contact_address']) ? $cmsSettings['contact_address'] : 'Lagos, Nigeria';
    
    // Parse brand assets
    $brandAssets = [];
    if (isset($cmsSettings['cms_brand_assets'])) {
        $brandAssets = json_decode($cmsSettings['cms_brand_assets'], true);
    }
    $tagline = isset($brandAssets['tagline']) ? $brandAssets['tagline'] : 'Next-Gen Digital Solutions Agency';
    $logoText = isset($brandAssets['logo_text']) ? $brandAssets['logo_text'] : 'Brainfeels Tech';
    
    // Split and style 'Tech' with brand colors
    $styledLogo = htmlspecialchars($logoText);
    if (stripos($styledLogo, 'Tech') !== false) {
        $styledLogo = str_ireplace('Tech', '<span>Tech</span>', $styledLogo);
    }

    // Parse theme color customizers
    $themeSettings = [];
    if (isset($cmsSettings['cms_theme_customizer'])) {
        $themeSettings = json_decode($cmsSettings['cms_theme_customizer'], true);
    }
    $colorPrimary = isset($themeSettings['color_secondary']) ? $themeSettings['color_secondary'] : '#3b82f6';
    $colorDark = isset($themeSettings['color_primary']) ? $themeSettings['color_primary'] : '#0f172a';
    $colorAccent = isset($themeSettings['color_accent']) ? $themeSettings['color_accent'] : '#f59e0b';

    // Format invoice details
    $invoiceCode = htmlspecialchars($invoice['invoice_code']);
    $amount = floatval($invoice['amount']);
    $status = htmlspecialchars($invoice['status']);
    $createdDate = date('F d, Y', strtotime($invoice['created_at']));
    $dueDate = htmlspecialchars($invoice['due_date']);
    $projectCode = $project ? htmlspecialchars($project['project_code']) : 'N/A';
    $projectTitle = $project ? htmlspecialchars($project['title']) : 'General Digital Services';

    // Output a stunning, professional, print-friendly A4 Invoice layout
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Receipt_<?php echo $invoiceCode; ?></title>
    <style>
        :root {
            --primary: <?php echo $colorPrimary; ?>;
            --dark: <?php echo $colorDark; ?>;
            --light: #f8fafc;
            --border: #e2e8f0;
            --text-dark: #334155;
            --text-light: #64748b;
            --success: #10b981;
            --accent: <?php echo $colorAccent; ?>;
        }

        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: var(--text-dark);
            background-color: #fff;
            margin: 0;
            padding: 40px;
            font-size: 14px;
            line-height: 1.6;
        }

        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid var(--border);
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
            background-color: #fff;
            position: relative;
            overflow: hidden;
        }

        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-35deg);
            font-size: 110px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 12px;
            pointer-events: none;
            z-index: 0;
            opacity: 0.04;
            user-select: none;
        }

        .watermark-paid {
            color: var(--success);
        }

        .watermark-pending {
            color: var(--accent);
        }

        .header-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid var(--border);
            padding-bottom: 24px;
            margin-bottom: 30px;
        }

        .logo-area h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 800;
            color: var(--dark);
            letter-spacing: -0.02em;
        }

        .logo-area span {
            color: var(--primary);
        }

        .logo-area p {
            margin: 4px 0 0 0;
            font-size: 12px;
            color: var(--text-light);
        }

        .invoice-details {
            text-align: right;
        }

        .invoice-details h2 {
            margin: 0 0 8px 0;
            font-size: 20px;
            font-weight: 700;
            text-transform: uppercase;
            color: var(--text-light);
        }

        .invoice-details p {
            margin: 4px 0;
            font-size: 12px;
        }

        .meta-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 40px;
        }

        .meta-box h3 {
            margin: 0 0 10px 0;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--text-light);
            border-bottom: 1px solid var(--border);
            padding-bottom: 6px;
        }

        .meta-box p {
            margin: 4px 0;
            font-weight: 600;
            color: var(--dark);
        }

        .meta-box span {
            font-weight: normal;
            color: var(--text-light);
            display: block;
            margin-top: 2px;
        }

        .item-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 40px;
        }

        .item-table th {
            background-color: var(--light);
            text-align: left;
            padding: 12px;
            font-size: 12px;
            text-transform: uppercase;
            color: var(--text-light);
            border-bottom: 2px solid var(--border);
        }

        .item-table td {
            padding: 16px 12px;
            border-bottom: 1px solid var(--border);
            color: var(--text-dark);
        }

        .status-badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
        }

        .status-paid {
            background-color: rgba(16, 185, 129, 0.1);
            color: var(--success);
        }

        .status-pending {
            background-color: rgba(245, 158, 11, 0.1);
            color: var(--accent);
        }

        .summary-section {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 40px;
        }

        .summary-table {
            width: 300px;
            border-collapse: collapse;
        }

        .summary-table td {
            padding: 8px 12px;
        }

        .summary-table tr.total-row td {
            font-size: 18px;
            font-weight: 800;
            color: var(--dark);
            border-top: 2px solid var(--border);
            padding-top: 14px;
        }

        .footer-note {
            text-align: center;
            font-size: 11px;
            color: var(--text-light);
            border-top: 1px dashed var(--border);
            padding-top: 30px;
            margin-top: 50px;
        }

        .print-controls {
            max-width: 800px;
            margin: 20px auto;
            display: flex;
            justify-content: flex-end;
            gap: 12px;
        }

        .btn {
            background-color: var(--primary);
            color: #fff;
            padding: 8px 16px;
            border-radius: 4px;
            text-decoration: none;
            font-weight: 600;
            font-size: 13px;
            border: none;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            transition: opacity 0.2s;
        }

        .btn-outline {
            background-color: transparent;
            color: var(--text-dark);
            border: 1px solid var(--border);
        }

        .btn:hover {
            opacity: 0.9;
        }

        @media print {
            body {
                padding: 0;
            }
            .print-controls {
                display: none;
            }
            .invoice-container {
                box-shadow: none;
                border: none;
                padding: 0;
            }
        }
    </style>
</head>
<body>

    <div class="print-controls">
        <button onclick="window.close()" class="btn btn-outline">Close Window</button>
        <button onclick="window.print()" class="btn">Print / Save PDF</button>
    </div>

    <div class="invoice-container">
        <!-- Watermark -->
        <div class="watermark <?php echo $status === 'Paid' ? 'watermark-paid' : 'watermark-pending'; ?>">
            <?php echo $status; ?>
        </div>

        <!-- Header -->
        <div class="header-section">
            <div class="logo-area">
                <h1><?php echo $styledLogo; ?></h1>
                <p><?php echo htmlspecialchars($tagline); ?></p>
                <p style="font-size: 10px; font-weight: normal; margin-top: 8px;">
                    <?php echo htmlspecialchars($companyAddress); ?><br>
                    Phone: <?php echo htmlspecialchars($companyPhone); ?><br>
                    Email: <?php echo htmlspecialchars($companyEmail); ?>
                </p>
            </div>
            <div class="invoice-details">
                <h2>INVOICE</h2>
                <p><strong>Code:</strong> <?php echo $invoiceCode; ?></p>
                <p><strong>Date Issued:</strong> <?php echo $createdDate; ?></p>
                <p><strong>Due Date:</strong> <?php echo $dueDate; ?></p>
            </div>
        </div>

        <!-- Meta Grid -->
        <div class="meta-grid">
            <div class="meta-box">
                <h3>Billed To:</h3>
                <p><?php echo htmlspecialchars($clientUsername); ?></p>
                <span>Project Code: <?php echo $projectCode; ?></span>
            </div>
            <div class="meta-box" style="text-align: right;">
                <h3>Payment Status:</h3>
                <div>
                    <span class="status-badge <?php echo $status === 'Paid' ? 'status-paid' : 'status-pending'; ?>">
                        <?php echo $status; ?>
                    </span>
                </div>
            </div>
        </div>

        <!-- Items Table -->
        <table class="item-table">
            <thead>
                <tr>
                    <th style="width: 70%;">Description</th>
                    <th style="width: 10%; text-align: center;">Qty</th>
                    <th style="width: 20%; text-align: right;">Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <strong><?php echo $projectTitle; ?></strong>
                        <span style="display: block; font-size: 12px; color: var(--text-light); margin-top: 4px;">
                            <?php 
                            if ($amount <= 1500) {
                                echo "Initial project scoping, requirements discovery and Figma visual mockup designs.";
                            } else {
                                echo "Core engineering milestone development, database modeling, decoupled system integrations, and staging environment setups.";
                            }
                            ?>
                        </span>
                    </td>
                    <td style="text-align: center;">1</td>
                    <td style="text-align: right;">$<?php echo number_format($amount, 2); ?></td>
                </tr>
            </tbody>
        </table>

        <!-- Summary -->
        <div class="summary-section">
            <table class="summary-table">
                <tr>
                    <td style="color: var(--text-light);">Subtotal:</td>
                    <td style="text-align: right;">$<?php echo number_format($amount, 2); ?></td>
                </tr>
                <tr>
                    <td style="color: var(--text-light);">Tax (0.00%):</td>
                    <td style="text-align: right;">$0.00</td>
                </tr>
                <tr class="total-row">
                    <td>Total Due:</td>
                    <td style="text-align: right;">$<?php echo number_format($amount, 2); ?></td>
                </tr>
            </table>
        </div>

        <!-- Footer -->
        <div class="footer-note">
            <p>Thank you for choosing <?php echo htmlspecialchars($companyName); ?>. We appreciate your business!</p>
            <p style="color: var(--text-light); margin-top: 10px;">If you have any questions concerning this invoice, contact our billing department at <?php echo htmlspecialchars($companyEmail); ?>.</p>
        </div>
    </div>

    <script>
        // Auto trigger browser print to compile PDF instantly
        window.onload = function() {
            setTimeout(function() {
                window.print();
            }, 300);
        };
    </script>
</body>
</html>
<?php
} catch (Exception $e) {
    http_response_code(500);
    echo "<h1>500 Internal Server Error</h1><p>" . htmlspecialchars($e->getMessage()) . "</p>";
}
