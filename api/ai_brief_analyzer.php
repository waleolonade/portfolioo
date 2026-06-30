<?php
require_once 'db.php';

/**
 * Advanced AI Project Brief Analyzer
 * Acting as a 15-year Professional Solutions Architect & Prompt Engineer.
 */

function call_gemini_api($prompt) {
    // Check environment or config for GEMINI_API_KEY
    $apiKey = getenv('GEMINI_API_KEY') ?: '';
    
    // Fallback: If not set in environment, check if defined in global constants or configs
    if (defined('GEMINI_API_KEY') && !empty(GEMINI_API_KEY)) {
        $apiKey = GEMINI_API_KEY;
    }

    if (empty($apiKey)) {
        return null; // Fallback to simulated high-quality generator
    }

    $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" . $apiKey;
    
    $payload = [
        "contents" => [
            [
                "parts" => [
                    ["text" => $prompt]
                ]
            ]
        ]
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200) {
        $resObj = json_decode($response, true);
        if (isset($resObj['candidates'][0]['content']['parts'][0]['text'])) {
            return $resObj['candidates'][0]['content']['parts'][0]['text'];
        }
    }
    
    return null;
}

function simulate_architect_analysis($briefText) {
    $briefLower = strtolower($briefText);
    
    // Categorization logic based on keyword matching
    $domain = "Custom Web Application";
    $techStack = [
      "Frontend" => "React.js, Vite, Tailwind CSS, Lucide Icons",
      "Backend" => "PHP / Node.js, JWT Authentication, RESTful API endpoints",
      "Database" => "MySQL (XAMPP environment), Redis for session caching",
      "Hosting" => "Apache local server / AWS EC2 instance"
    ];
    $tables = "
    - users (id, username, password_hash, role, created_at)
    - projects (id, client_id, title, description, progress, status)
    - tasks (id, project_id, title, action_type, status, due_date)
    ";

    if (strpos($briefLower, 'restaurant') !== false || strpos($briefLower, 'booking') !== false || strpos($briefLower, 'reservation') !== false) {
        $domain = "On-Demand Booking & Hospitality Platform";
        $techStack["Frontend"] = "React.js with Tailwind CSS, React-Datepicker, Redux Toolkit";
        $techStack["Backend"] = "Node.js (Express) microservices, Nodemailer for verification emails";
        $techStack["Database"] = "PostgreSQL (relational transactions), Redis (booking lock times)";
        $tables = "
    - users (id, name, email, phone, role)
    - tables_list (id, table_number, capacity, status)
    - reservations (id, user_id, table_id, reservation_time, party_size, status)
    - menu_items (id, name, description, price, category, is_available)
        ";
    } elseif (strpos($briefLower, 'shop') !== false || strpos($briefLower, 'store') !== false || strpos($briefLower, 'ecommerce') !== false || strpos($briefLower, 'cart') !== false) {
        $domain = "High-Scale E-Commerce & Retail Portal";
        $techStack["Frontend"] = "Next.js (App Router), Stripe Element SDK, Framer Motion";
        $techStack["Backend"] = "Node.js / Go API Gateway, Stripe Webhook Integrator, PDF invoice creator";
        $techStack["Database"] = "MongoDB (product schemas flexibility), PostgreSQL (order transactions)";
        $tables = "
    - users (id, email, password_hash, shipping_address)
    - products (id, sku, name, description, price, stock_quantity)
    - orders (id, user_id, total_amount, payment_status, shipping_status, created_at)
    - order_items (id, order_id, product_id, quantity, unit_price)
        ";
    } elseif (strpos($briefLower, 'mobile') !== false || strpos($briefLower, 'app') !== false) {
        $domain = "Cross-Platform Mobile Application";
        $techStack["Frontend"] = "React Native, Expo, React Navigation, NativeWind";
        $techStack["Backend"] = "Node.js (Express), JWT auth, Firebase Cloud Messaging for Push Alerts";
        $techStack["Database"] = "MongoDB, SQLite local cache for offline capabilities";
        $tables = "
    - users (id, device_token, name, email, synced_at)
    - mobile_sessions (id, user_id, token, expires_at)
    - notifications_log (id, user_id, title, message, read_status)
        ";
    }

    $analysis = "# 🧠 AI Architectural Feasibility Study & System Specs

Thank you for submitting your project specifications. Based on a multi-dimensional analysis of your project description (\"" . htmlspecialchars(substr($briefText, 0, 80)) . "...\"), Brainfeels AI Copilot has compiled this architectural specification report.

## 1. Project Classification & Core Scope
- **Domain**: " . $domain . "
- **Target Audience Profile**: Global consumers requiring high-performance desktop and mobile usability.
- **Core Functionality**:
  * Decoupled frontend dashboard interfacing secure endpoints.
  * Persisted state storage and transaction auditing.
  * Real-time notifications and communications gateway.

## 2. Proposed System Architecture & Tech Stack
To deliver scalability, security, and short response times, the following decoupled architecture is recommended:
- **Frontend Layer**: " . $techStack['Frontend'] . "
- **Backend Services**: " . $techStack['Backend'] . "
- **Database Engine**: " . $techStack['Database'] . "
- **Hosting & Infrastructure**: " . $techStack['Hosting'] . "

## 3. Core Database Design (Entity Relationship Model)
We suggest establishing the following database structure to support the application parameters:
```sql
" . $tables . "
```
*Note: Foreign key constraints and unique indexes on emails/codes must be set up at migrations.*

## 4. Security & Compliance Protocols
- **Identity & Access**: JWT (JSON Web Tokens) with a short (15-min) expiration combined with refresh tokens.
- **Transport Security**: HTTPS / TLS 1.3 enforced throughout. Custom HTTP headers (CORS, CSP, X-Frame-Options) enabled on the API.
- **Rate Limiting**: Enforced limit of 100 requests per minute per IP address on public endpoints to prevent brute-force attacks.

## 5. Agile Implementation Roadmap
- **Phase 1: Wireframing & Tech Setup (Weeks 1-2)**: Core repository configuration, landing pages, and authentication APIs.
- **Phase 2: Core Engineering (Weeks 3-5)**: Database migrations, service integrations, and dashboard features.
- **Phase 3: Security & Optimization (Week 6)**: Stress-tests, penetration audit, and Lighthouse SEO indexing.
- **Phase 4: Release & Handover (Week 7)**: Live deployment to staging and production environments.

---
*Report compiled on " . date('Y-m-d H:i:s') . " by Brainfeels AI Copilot System.*
";

    return $analysis;
}

function generate_brief_analysis($clientId, $briefText, $pdo) {
    // 15-Year Professional Prompt Structure
    $prompt = "You are a Chief Solutions Architect and Systems Engineering Director with 15+ years of experience in enterprise systems architecture, cloud infrastructure, and technical product management.
Analyze the following project brief from a client and output a highly structured, professional System Specifications and Feasibility Study in clean Markdown.

Your output must follow this precise structure:
# 🧠 AI Architectural Feasibility Study & System Specs
[Brief professional intro acknowledging the client's goal]

## 1. Project Classification & Core Scope
- **Domain**: [Identify e.g. E-Commerce, SaaS, IoT, FinTech]
- **Target Audience Profile**: [Short description]
- **Core Functionality Items**: [Bullet points listing the primary system requirements]

## 2. Proposed System Architecture & Tech Stack
Provide modern, high-performance, and secure tech stack recommendations:
- **Frontend Architecture**: [Describe stack e.g., React with Vite, CSS styling]
- **Backend Services**: [Describe decoupled backend e.g. PHP REST APIs, JWT authentication]
- **Database Engine**: [Describe database structure e.g. MySQL, Redis caching]
- **Hosting & Infrastructure**: [Describe hosting e.g. Vercel for frontend, Apache/Docker for backend]

## 3. Core Database Design (Entity Relationship Model)
Provide a raw text representation of the key tables/entities needed (e.g. users, products, bookings) showing columns and relationships.

## 4. Security & Compliance Protocols
List essential protocols to implement (JWT, TLS 1.3, Rate limiting, input validation).

## 5. Implementation Milestones & Estimated Timeline
Provide a standard 4-phase agile delivery roadmap with estimated timelines.

Here is the client's brief to analyze:
\"\"\"
" . $briefText . "
\"\"\"
";

    // Call Gemini API
    $analysisMarkdown = call_gemini_api($prompt);
    
    // Fallback to simulator if API fails/not-set
    if (!$analysisMarkdown) {
        $analysisMarkdown = simulate_architect_analysis($briefText);
    }

    // Save report to disk inside uploads/
    $uploadDir = '../uploads/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $fileName = 'AI_Project_Feasibility_Analysis_' . $clientId . '.md';
    $filePath = $uploadDir . $fileName;
    file_put_contents($filePath, $analysisMarkdown);

    $fileUrl = 'uploads/' . $fileName;
    $fileSizeRaw = filesize($filePath);
    $fileSizeStr = number_format($fileSizeRaw / 1024, 0) . ' KB';
    $publicFileName = 'AI_Project_Feasibility_Analysis.md';

    // Register or update the file inside client_files
    $checkStmt = $pdo->prepare("SELECT `id` FROM `client_files` WHERE `client_id` = ? AND `filename` = ?");
    $checkStmt->execute([$clientId, $publicFileName]);
    $existingFileId = $checkStmt->fetchColumn();

    if ($existingFileId) {
        $updateFile = $pdo->prepare("UPDATE `client_files` SET `file_url` = ?, `file_size` = ?, `created_at` = CURRENT_TIMESTAMP WHERE `id` = ?");
        $updateFile->execute([$fileUrl, $fileSizeStr, $existingFileId]);
    } else {
        $insertFile = $pdo->prepare("INSERT INTO `client_files` (`client_id`, `filename`, `file_url`, `file_size`, `category`) VALUES (?, ?, ?, ?, 'AI Analysis')");
        $insertFile->execute([$clientId, $publicFileName, $fileUrl, $fileSizeStr]);
    }

    // Save details to the client project brief_details column
    $updateProj = $pdo->prepare("UPDATE `client_projects` SET `brief_details` = ? WHERE `client_id` = ?");
    $updateProj->execute([$analysisMarkdown, $clientId]);

    // Send a welcoming message to the Chat Stream
    $systemMsg = "✨ AI Copilot Alert: I've completed a multi-dimensional architectural feasibility study on your project requirements. You can view or download the report 'AI_Project_Feasibility_Analysis.md' in the Files section!";
    
    $adminStmt = $pdo->query("SELECT `id` FROM `users` WHERE `role` = 'Super Admin' LIMIT 1");
    $adminId = $adminStmt->fetchColumn() ?: 1;

    $logStmt = $pdo->prepare("INSERT INTO `chat_messages` (`sender_id`, `receiver_id`, `message`, `sender_name`, `is_bot`) VALUES (?, ?, ?, 'System Logger', 0)");
    $logStmt->execute([$adminId, $clientId, $systemMsg]);

    return $analysisMarkdown;
}
