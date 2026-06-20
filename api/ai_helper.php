<?php
require_once 'db.php';
require_once 'auth_helper.php';

$method = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'GET';

if ($method === 'POST') {
    // Secure Route: Allowed for PM, Editor, Super Admin (Verify role)
    verify_user_role(['Project Manager', 'Content Editor', 'Support Agent'], $pdo);
    
    $task = isset($_GET['task']) ? trim($_GET['task']) : '';
    $inputData = json_decode(file_get_contents('php://input'), true);
    
    switch ($task) {
        case 'description':
            $title = isset($inputData['title']) ? trim($inputData['title']) : 'Project';
            $category = isset($inputData['category']) ? trim($inputData['category']) : 'General';
            
            // Build rich simulated AI generation
            $desc = "Brainfeels AI: Project Description Generator\n\n";
            if (stripos($category, 'design') !== false || stripos($category, 'ux') !== false) {
                $desc .= "The " . $title . " design system was meticulously crafted based on exhaustive UX research and Figma wireframing. We developed interactive mockups, custom icon families, and unified HSL color tokens to establish brand consistency. This client-facing interface has reduced user flow complexity, resulting in a 35% decrease in drop-off rate.";
            } elseif (stripos($category, 'mobile') !== false || stripos($category, 'app') !== false) {
                $desc .= "Developed on React Native and Expo framework, the " . $title . " mobile app offers clients native speed and offline reliability. We integrated a local SQLite caching mechanism alongside a secure GPS tracker, enabling field operations synchronization. Data is automatically batched and pushed to the cloud once network connectivity is restored.";
            } elseif (stripos($category, 'backend') !== false || stripos($category, 'api') !== false) {
                $desc .= "The " . $title . " architecture leverages high-throughput RESTful API endpoints built on a secure backend. Using JWT tokens, HMAC signature verification, and Redis caching layers, we guaranteed transaction integrity. The system effortlessly handles up to 5,000 requests per second under peak stress tests.";
            } elseif (stripos($category, 'networking') !== false || stripos($category, 'support') !== false) {
                $desc .= "Designed to guarantee enterprise network isolation, " . $title . " integrates zero-trust secure VPC gates, customized firewall tables, and VPN tunnels. We configured automated server health checks and alert daemon reporting to immediately isolate anomalies, resulting in a 99.99% system uptime record.";
            } elseif (stripos($category, 'custom') !== false || stripos($category, 'software') !== false) {
                $desc .= "The " . $title . " custom software suite integrates multiple departmental logs into a unified dashboard, automating client onboarding and billing operations. Operating with role-based dashboard managers and encrypted exports, this tool saved the client hundreds of administrative hours annually.";
            } else {
                // Falls back to website / general web development
                $desc .= "The " . $title . " platform leverages modern decoupled architectures. By deploying a React-based frontend alongside a secure RESTful API, we guaranteed rapid loading times, optimal SEO compliance, and cross-device responsive layout designs. Performance scores reached 95+ on standard Lighthouse performance checks.";
            }
            
            echo json_encode(["success" => true, "result" => $desc]);
            break;
            
        case 'blog':
            $topic = isset($inputData['topic']) ? trim($inputData['topic']) : 'Tech Innovation';
            
            $blog = "## " . $topic . "\n\n";
            $blog .= "### Introduction\nIn modern tech engineering, keeping pace with infrastructure improvements is vital. This article breaks down how modern tech architectures are shifting from heavy monolithic setups to highly modular, decoupled serverless frameworks.\n\n";
            $blog .= "### Key Engineering Priorities\n1. **Decoupled Architecture**: Splitting frontend visual layouts from backend database API pipelines increases resilience.\n2. **Automated Auditing**: Incorporating continuous verification and security gates prevents critical codebase drift.\n3. **SEO optimization**: Incorporating metadata parameters directly inside the initial builds speeds up crawlers.\n\n";
            $blog .= "### Conclusion\nDeploying scalable software assets requires systematic workflows. By using automated developer tools, engineering groups can focus on feature sets without worrying about deployment regressions.";
            
            echo json_encode(["success" => true, "result" => $blog]);
            break;
            
        case 'seo':
            $title = isset($inputData['title']) ? trim($inputData['title']) : '';
            $description = isset($inputData['description']) ? trim($inputData['description']) : '';
            
            $audit = [
                "title_check" => [
                    "status" => strlen($title) >= 30 && strlen($title) <= 60 ? "Excellent" : "Needs Work",
                    "suggestion" => "Aim for 30-60 characters (Current: " . strlen($title) . "). Include key keywords."
                ],
                "description_check" => [
                    "status" => strlen($description) >= 120 && strlen($description) <= 160 ? "Excellent" : "Needs Work",
                    "suggestion" => "Aim for 120-160 characters (Current: " . strlen($description) . "). Include a strong call to action."
                ],
                "recommendation" => "Verify that Open Graph Meta Tags (og:title, og:description) are loaded inside the header index.html template."
            ];
            
            echo json_encode(["success" => true, "result" => $audit]);
            break;
            
        default:
            http_response_code(400);
            echo json_encode(["message" => "Unknown AI task specified."]);
            break;
    }
} else {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed. Only POST supported."]);
}
