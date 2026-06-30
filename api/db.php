<?php
// Database Configuration
$host = 'localhost';
$username = 'root';
$password = '';
$dbname = 'brainfeels_portfolio';

// Headers for JSON API and CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS requests
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // 1. Connect without database to create it if it doesn't exist
    $pdo = new PDO("mysql:host=$host", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbname` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    
    // 2. Connect to the database
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Check if table users exists to prevent wiping data on every import
    $tableExists = false;
    try {
        $result = $pdo->query("SELECT 1 FROM `users` LIMIT 1");
        $tableExists = ($result !== false);
    } catch (Exception $e) {
        $tableExists = false;
    }

    $forceMigrate = isset($_GET['migrate']) || isset($_GET['seed']) || (php_sapi_name() === 'cli' && in_array('--force', $argv ?? []));

    if (!$tableExists || $forceMigrate) {
        // 3. Drop tables in correct dependency order to force fresh migrations & seeding
        $pdo->exec("SET FOREIGN_KEY_CHECKS = 0;");
        $pdo->exec("DROP TABLE IF EXISTS `applications`;");
        $pdo->exec("DROP TABLE IF EXISTS `careers`;");
        $pdo->exec("DROP TABLE IF EXISTS `inquiries`;");
        $pdo->exec("DROP TABLE IF EXISTS `team_members`;");
        $pdo->exec("DROP TABLE IF EXISTS `testimonials`;");
        $pdo->exec("DROP TABLE IF EXISTS `services`;");
        $pdo->exec("DROP TABLE IF EXISTS `project_images`;");
        $pdo->exec("DROP TABLE IF EXISTS `projects`;");
        $pdo->exec("DROP TABLE IF EXISTS `users`;");
        $pdo->exec("DROP TABLE IF EXISTS `cms_settings`;");
        $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");
    
    // 4. Create Tables
    
    // Users (multi-role)
    $pdo->exec("CREATE TABLE `users` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `username` VARCHAR(50) UNIQUE NOT NULL,
        `password` VARCHAR(255) NOT NULL,
        `role` VARCHAR(50) NOT NULL DEFAULT 'Super Admin',
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    
    // Projects (Case Study layout)
    $pdo->exec("CREATE TABLE `projects` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `title` VARCHAR(100) NOT NULL,
        `category` VARCHAR(50) NOT NULL,
        `client_name` VARCHAR(100) DEFAULT '',
        `completion_date` VARCHAR(50) DEFAULT '',
        `summary` TEXT NOT NULL,
        `challenge` TEXT NOT NULL,
        `solution` TEXT NOT NULL,
        `results_metric` VARCHAR(150) DEFAULT '',
        `image_url` VARCHAR(255) NOT NULL,
        `project_url` VARCHAR(255) DEFAULT '',
        `github_url` VARCHAR(255) DEFAULT '',
        `tech_stack` VARCHAR(255) DEFAULT '',
        `is_published` TINYINT(1) DEFAULT 1,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    
    // Project Images Gallery
    $pdo->exec("CREATE TABLE `project_images` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `project_id` INT NOT NULL,
        `image_url` VARCHAR(255) NOT NULL,
        `is_featured` TINYINT(1) DEFAULT 0,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // Services
    $pdo->exec("CREATE TABLE `services` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `name` VARCHAR(100) NOT NULL,
        `description` TEXT NOT NULL,
        `benefits` TEXT NOT NULL,
        `features` TEXT NOT NULL,
        `icon_name` VARCHAR(50) NOT NULL,
        `basic_price` DECIMAL(10,2) DEFAULT 0.00,
        `standard_price` DECIMAL(10,2) DEFAULT 0.00,
        `premium_price` DECIMAL(10,2) DEFAULT 0.00,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // Testimonials
    $pdo->exec("CREATE TABLE `testimonials` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `client_name` VARCHAR(100) NOT NULL,
        `client_role` VARCHAR(100) NOT NULL,
        `company_name` VARCHAR(100) NOT NULL,
        `rating` INT NOT NULL DEFAULT 5,
        `text` TEXT NOT NULL,
        `image_url` VARCHAR(255) DEFAULT '',
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // Team Members
    $pdo->exec("CREATE TABLE `team_members` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `name` VARCHAR(100) NOT NULL,
        `position` VARCHAR(100) NOT NULL,
        `bio` TEXT NOT NULL,
        `skills` VARCHAR(255) DEFAULT '',
        `image_url` VARCHAR(255) DEFAULT '',
        `social_links` TEXT DEFAULT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // Inquiries (leads, quotes, and bookings)
    $pdo->exec("CREATE TABLE `inquiries` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `type` VARCHAR(50) NOT NULL DEFAULT 'contact', -- contact, quote, booking
        `name` VARCHAR(100) NOT NULL,
        `email` VARCHAR(100) NOT NULL,
        `phone` VARCHAR(50) DEFAULT '',
        `company` VARCHAR(100) DEFAULT '',
        `budget` VARCHAR(50) DEFAULT '',
        `timeline` VARCHAR(50) DEFAULT '',
        `subject` VARCHAR(150) NOT NULL,
        `message` TEXT NOT NULL,
        `status` VARCHAR(20) DEFAULT 'unread',
        `ai_score` INT DEFAULT 50,
        `booking_date` VARCHAR(50) DEFAULT '',
        `booking_time` VARCHAR(50) DEFAULT '',
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // Careers listings
    $pdo->exec("CREATE TABLE `careers` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `title` VARCHAR(100) NOT NULL,
        `location` VARCHAR(100) NOT NULL,
        `type` VARCHAR(50) NOT NULL, -- Full-time, Contract, etc.
        `salary` VARCHAR(100) DEFAULT '',
        `description` TEXT NOT NULL,
        `requirements` TEXT NOT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // Job applications
    $pdo->exec("CREATE TABLE `applications` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `job_id` INT NOT NULL,
        `applicant_name` VARCHAR(100) NOT NULL,
        `applicant_email` VARCHAR(100) NOT NULL,
        `applicant_phone` VARCHAR(50) NOT NULL,
        `cv_url` VARCHAR(255) NOT NULL,
        `message` TEXT NOT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (`job_id`) REFERENCES `careers`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // CMS dynamic configurations
    $pdo->exec("CREATE TABLE `cms_settings` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `setting_key` VARCHAR(100) UNIQUE NOT NULL,
        `setting_value` LONGTEXT NOT NULL,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // 5. Seeds
    $pwdAdmin = password_hash('adminpassword', PASSWORD_DEFAULT);
    $pwdEditor = password_hash('editorpassword', PASSWORD_DEFAULT);
    $pwdPM = password_hash('pmpassword', PASSWORD_DEFAULT);
    $pwdAgent = password_hash('agentpassword', PASSWORD_DEFAULT);
    
    // Insert Role-based Users
    $userInsert = $pdo->prepare("INSERT INTO `users` (`username`, `password`, `role`) VALUES (?, ?, ?)");
    $userInsert->execute(['admin', $pwdAdmin, 'Super Admin']);
    $userInsert->execute(['editor', $pwdEditor, 'Content Editor']);
    $userInsert->execute(['pm', $pwdPM, 'Project Manager']);
    $userInsert->execute(['agent', $pwdAgent, 'Support Agent']);

    // Seed the EXACT 8 Services from Brainfeels Tech flyers
    $pdo->exec("INSERT INTO `services` (`name`, `description`, `benefits`, `features`, `icon_name`, `basic_price`, `standard_price`, `premium_price`) VALUES 
        ('Website Development', 'Transforming ideas into robust web platforms, including business websites, corporate sites, law firms, e-commerce, and school portals.', 'Establishes online credibility, reaches local & global customers, increases leads conversions.', 'Business websites, E-commerce platforms, School portals, Law firm websites, Logistics websites.', 'Code', 1200, 2800, 5500),
        ('Mobile App Development', 'Delivering cross-platform native mobile applications built on React Native & Expo frameworks for iOS and Android.', 'Direct mobile client outreach, offline capabilities, secure app store releases.', 'Android apps, iOS apps, cross-platform solutions.', 'Smartphone', 3500, 7000, 15000),
        ('UI/UX Design', 'Crafting modern, user-centric interface layouts, wireframes, and interactive visual prototypes.', 'Reduces user churn rate, clarifies conversion flows, establishes visual hierarchy.', 'User Interface Design, User Experience Optimization, Interactive Prototypes.', 'Compass', 600, 1500, 3500),
        ('Backend Development & API Integration', 'Engineering high-throughput, secure RESTful API backends using PHP, Node.js, and database scaling.', 'Guarantees transaction integrity, connects external CRM integrations, scalable pipelines.', 'PHP Development, Node.js Development, SQL Databases setup, API Integration.', 'Zap', 1800, 4000, 9000),
        ('E-commerce Solutions', 'Deploying complete online storefronts, shopping carts, and custom e-commerce management suites.', 'Direct merchant billing, online sales channels, dynamic inventory management.', 'Online stores, payment gateway integrations, product catalogs, order tracking systems.', 'ShoppingCart', 1500, 3500, 7500),
        ('Software & Web Applications', 'Building bespoke web applications, school management portals, booking engines, and tools.', 'Saves employee hours, eliminates licensing fees, increases efficiency.', 'Result checker systems, school management setups, booking systems, business automation tools.', 'Terminal', 2500, 5500, 12000),
        ('Networking & IT Solutions', 'Enforcing corporate network setups, network isolation infrastructure, and configurations.', 'Protects proprietary server data, minimizes downtime, configures server firewalls.', 'Network infrastructure, system configuration, IT support services, business automations.', 'Server', 1000, 2500, 6000),
        ('Maintenance & Support', 'Delivering continuous server updates, application security patches, and priority support logs.', 'Guarantees runtime performance, prevents security vulnerability exploits, 24/7 coverage.', 'Technical support, security updates, routine system maintenance.', 'HeartHandshake', 300, 800, 2000)
    ");

    // Insert Testimonials
    $pdo->exec("INSERT INTO `testimonials` (`client_name`, `client_role`, `company_name`, `rating`, `text`, `image_url`) VALUES 
        ('Sarah Jenkins', 'VP of Engineering', 'Fintech Growth Corp', 5, 'Brainfeels Tech delivered our quantum trading portal three weeks ahead of schedule. The cloud integration runs flawlessly and is fully audited.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80'),
        ('David Kalu', 'CTO', 'Logistics Logistics', 5, 'The mobile application built using Expo handles offline data delivery perfectly. Customer feedback has been outstanding since the app store launch.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80')
    ");

    // Insert Team Members
    $pdo->exec("INSERT INTO `team_members` (`name`, `position`, `bio`, `skills`, `image_url`, `social_links`) VALUES 
        ('Marcus Vance', 'Founder & Chief Architect', 'Marcus leads development with 15+ years experience building cloud architectures and enterprise software systems.', 'Go, Rust, AWS, Architecture, Kubernetes', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', '{\"linkedin\":\"https://linkedin.com\",\"github\":\"https://github.com\"}'),
        ('Amara Sterling', 'Lead Frontend Developer', 'Amara focuses on crafting pixel-perfect, premium user experiences and interactive React animations.', 'React, Next.js, Framer Motion, CSS, UI/UX', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80', '{\"linkedin\":\"https://linkedin.com\",\"github\":\"https://github.com\"}')
    ");

    // Insert Careers
    $pdo->exec("INSERT INTO `careers` (`title`, `location`, `type`, `salary`, `description`, `requirements`) VALUES 
        ('Senior Backend Engineer', 'San Francisco (Hybrid)', 'Full-time', '$120,000 - $150,000', 'Work on designing high-throughput APIs and scalable database configurations.', '5+ years experience with Node.js or Go; expert SQL database performance tuning; cloud deployment knowledge.'),
        ('Junior React Engineer', 'Remote (US/Canada)', 'Full-time', '$65,000 - $85,000', 'Support building new client portals, dynamic portfolio managers, and responsive widgets.', 'Solid React/JS skills; understanding of state management; responsive CSS layouts.')
    ");

    // Insert Projects with detailed Case Study details
    $pdo->exec("INSERT INTO `projects` (`title`, `category`, `client_name`, `completion_date`, `summary`, `challenge`, `solution`, `results_metric`, `image_url`, `project_url`, `github_url`, `tech_stack`) VALUES 
        ('Quantum Trade Gateway', 'Backend Development & API Integration', 'Fintech Growth Corp', 'March 2026', 'A high-frequency algorithmic trade execution gateway deployed globally on AWS.', 
        'The client experienced latency spikes of up to 400ms during trading peaks, causing slippage and failed transactions.',
        'We re-engineered the message pipeline using Node.js clustering, Redis caching, and isolated VPC networks, orchestrating deployments with Terraform.',
        'Latency dropped to < 5ms under load, increasing client trade success by 42%.',
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80', 'https://example.com/trade-gateway', 'https://github.com/example/trade-gateway', 'Node.js, Redis, AWS, Terraform, Docker'),
        
        ('Hyperion Logistics App', 'Mobile App Development', 'Logistics Logistics', 'January 2026', 'A multi-stop route optimization mobile application for fleet drivers.',
        'Drivers lost connection in rural areas, losing GPS data coordinates and route logs.',
        'We implemented robust SQLite local database sync with Expo filesystem caching, sending logs batch-wise when internet reconnects.',
        'Saved drivers over 150 hours of paperwork and improved delivery completion times by 28%.',
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80', 'https://example.com/logistics', 'https://github.com/example/logistics', 'React Native, SQLite, Expo, Node.js, Express')
    ");
    
    // Associate project images
    $pdo->exec("INSERT INTO `project_images` (`project_id`, `image_url`, `is_featured`) VALUES 
        (1, 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80', 1),
        (1, 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80', 0),
        (2, 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80', 1)
    ");

    // Insert Initial CMS settings
    $settings = [
        'homepage_layout' => '[{"id":"hero","visible":true},{"id":"trusted_by","visible":true},{"id":"intro","visible":true},{"id":"services","visible":true},{"id":"projects","visible":true},{"id":"github","visible":true},{"id":"tech_stack","visible":true},{"id":"why_us","visible":true},{"id":"process","visible":true},{"id":"testimonials","visible":true},{"id":"cta_block","visible":true},{"id":"contact","visible":true}]',
        'site_logo_text' => 'Brainfeels Tech',
        'site_favicon_url' => '/favicon.svg',
        'home_hero_title' => 'Transform Your Ideas Into Powerful Digital Solutions',
        'home_hero_subtitle' => 'Professional Website Development, Mobile App Development, UI/UX Design, Networking & IT Solutions',
        'home_hero_cta_primary' => 'View Our Work',
        'home_hero_cta_secondary' => 'Get a Free Quote',
        'home_trusted_by_title' => 'Trusted by 20+ clients & engineering teams',
        'home_trusted_by_subtitle' => 'Certified Stacks',
        'home_intro_title' => 'Who We Are',
        'home_intro_subtitle' => 'What We Do',
        'home_intro_description' => 'Brainfeels Tech is a multi-disciplinary software engineering agency. We design, deploy, and maintain high-performance digital products for businesses globally. By leveraging modern frameworks and strict cloud orchestration, we guarantee rapid delivery and seamless operational scaling.',
        'home_services_title' => 'Our Core Services',
        'home_services_subtitle' => 'What We Do',
        'home_services_description' => 'Comprehensive digital solutions designed to help businesses grow, scale, and operate efficiently.',
        'home_projects_title' => 'Featured Engagements',
        'home_projects_subtitle' => 'Our Case Studies',
        'home_github_title' => 'Open Source Repositories',
        'home_github_subtitle' => 'Check our active Github repos',
        'home_tech_stack_title' => 'Core Technology Stack',
        'home_tech_stack_subtitle' => 'Technologies',
        'home_why_us_title' => 'Why Brainfeels Tech',
        'home_why_us_subtitle' => 'We build resilient digital products designed to accelerate operations with zero downtime anomalies.',
        'home_process_title' => 'Our Work Process',
        'home_process_subtitle' => '6 structured engineering phases',
        'home_testimonials_title' => 'Client Testimonials',
        'home_testimonials_subtitle' => 'Read what VP level engineering managers and CTOs say about our deployment speed and technical execution.',
        'home_cta_title' => 'Start a Conversation',
        'home_cta_subtitle' => 'Contact our engineers directly, request a dynamic project cost estimate, or schedule a video briefing.',
        'home_contact_title' => 'Quick Message',
        'home_contact_subtitle' => 'Cost Estimator',
        'company_story' => 'Brainfeels Tech is a multi-disciplinary software engineering agency. We build websites, mobile apps, and digital solutions that drive growth. We specialize in turning ideas into powerful, secure, and scalable products.',
        'company_mission' => 'To deliver robust, scalable digital assets that increase enterprise productivity and guarantee security.',
        'company_vision' => 'To be the leading global tech agency powering zero-trust cloud pipelines and premium React platforms.',
        'contact_email' => 'brainfeelstech@gmail.com',
        'contact_phone' => '08061657738',
        'contact_address' => 'Lagos, Nigeria',
        'whatsapp_link' => 'https://wa.me/2348061657738',
        'seo_title' => 'Brainfeels Tech | Next-Gen Digital Solutions Agency',
        'seo_description' => 'Professional Website Development, Mobile App Development, UI/UX Design, Networking & IT Solutions by Brainfeels Tech.',
        'cms_brand_assets' => '{"logo_text":"Brainfeels Tech","logo_type":"text","logo_url_light":"","logo_url_dark":"","favicon_url":"/favicon.svg","symbol_url":"","logo_width":180,"logo_height":45,"mobile_logo_url":"","sticky_logo_url":"","show_tagline":false,"tagline":"Innovative Software Engineering"}',
        'cms_header_builder' => '{"layout_type":"classic","is_sticky":true,"is_transparent":false,"elements":[{"id":"logo","visible":true},{"id":"nav_links","visible":true},{"id":"cta_button","visible":true},{"id":"theme_toggle","visible":true}],"cta_text":"Get a Free Quote","cta_link":"#/contact"}',
        'cms_footer_builder' => '{"layout_type":"grid","columns_count":4,"copyright_text":"© 2026 Brainfeels Tech. All rights reserved.","legal_links":[{"label":"Privacy Policy","url":"#/privacy"},{"label":"Terms of Service","url":"#/terms"}],"newsletter_enabled":true,"newsletter_title":"Subscribe to our Newsletter","newsletter_placeholder":"Enter your email address","map_iframe_url":"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.7285587786487!2d3.3792053147702047!3d6.428913995348638!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8b2ae68280c1%3A0xdc9e87a397c7ed87!2sLagos!5e0!3m2!1sen!2sng!4v1625000000000!5m2!1sen!2sng","map_enabled":true}',
        'cms_social_management' => '{"networks":[{"name":"Facebook","url":"https://facebook.com/brainfeelstech","enabled":true,"show_badge":true},{"name":"Twitter","url":"https://twitter.com/brainfeelstech","enabled":true,"show_badge":true},{"name":"LinkedIn","url":"https://linkedin.com/company/brainfeelstech","enabled":true,"show_badge":true},{"name":"GitHub","url":"https://github.com/waleolonade/portfolioo","enabled":true,"show_badge":true},{"name":"Instagram","url":"https://instagram.com/brainfeelstech","enabled":true,"show_badge":true},{"name":"YouTube","url":"https://youtube.com/brainfeelstech","enabled":false,"show_badge":false}]}',
        'cms_whatsapp_hub' => '{"widget_enabled":true,"widget_title":"Need Help? Chat with Us","widget_subtitle":"We usually respond in a few minutes","agents":[{"id":"1","name":"Technical Support","phone":"2348061657738","department":"Technical","welcome_message":"Hello, I need technical support.","avatar":"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80","is_online":true},{"id":"2","name":"Sales & Inquiries","phone":"2348061657738","department":"Sales","welcome_message":"Hello, I want to get a free quote.","avatar":"https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80","is_online":true},{"id":"3","name":"Billing & Payments","phone":"2348061657738","department":"Billing","welcome_message":"Hello, I have a question about billing.","avatar":"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80","is_online":true}]}',
        'cms_theme_customizer' => '{"font_family_heading":"Inter","font_family_body":"Outfit","color_primary":"#0f172a","color_secondary":"#3b82f6","color_bg_light":"#ffffff","color_bg_dark":"#0f172a","color_text_light":"#1e293b","color_text_dark":"#f8fafc","color_accent":"#f59e0b","border_radius":8}',
        'cms_seo_visibility' => '{"robots_txt":"User-agent: *\\nDisallow: /api/\\nAllow: /","og_title":"Brainfeels Tech | Custom Web & Mobile App Development","og_description":"We build websites, mobile apps, and IT solutions that scale.","og_image":"https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80","company_schema":"{\\n  \\\"@context\\\": \\\"https://schema.org\\\",\\n  \\\"@type\\\": \\\"ProfessionalService\\\",\\n  \\\"name\\\": \\\"Brainfeels Tech\\\",\\n  \\\"image\\\": \\\"https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80\\\",\\n  \\\"@id\\\": \\\"\\\",\\n  \\\"url\\\": \\\"http://localhost:5173/\\\",\\n  \\\"telephone\\\": \\\"08061657738\\\",\\n  \\\"address\\\": {\\n    \\\"@type\\\": \\\"PostalAddress\\\",\\n    \\\"streetAddress\\\": \\\"Lagos, Nigeria\\\",\\n    \\\"addressLocality\\\": \\\"Lagos\\\",\\n    \\\"addressCountry\\\": \\\"NG\\\"\\n  }\\n}"}',
        'receipt_settings' => '{"layout":["header","meta","items","summary","footer"],"show_watermark":true,"tax_rate":0,"payment_terms":"Due upon receipt","custom_notes":"Thank you for choosing Brainfeels Tech. We appreciate your business!","footer_contact":"If you have any questions concerning this invoice, contact our billing department at billing@brainfeels.tech."}'
    ];
    
    $settingInsert = $pdo->prepare("INSERT INTO `cms_settings` (`setting_key`, `setting_value`) VALUES (?, ?)");
    foreach ($settings as $key => $val) {
        $settingInsert->execute([$key, $val]);
    }
    }

    // === Always ensure new tables exist (non-destructive) ===
    $pdo->exec("CREATE TABLE IF NOT EXISTS `newsletter_subscribers` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `email` VARCHAR(255) NOT NULL UNIQUE,
        `status` VARCHAR(50) DEFAULT 'active',
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    $pdo->exec("CREATE TABLE IF NOT EXISTS `cms_media` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `filename` VARCHAR(255) NOT NULL,
        `original_name` VARCHAR(255) NOT NULL,
        `url` VARCHAR(500) NOT NULL,
        `mime_type` VARCHAR(100) NOT NULL,
        `file_size` INT NOT NULL DEFAULT 0,
        `folder` VARCHAR(100) NOT NULL DEFAULT 'general',
        `uploaded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    $pdo->exec("CREATE TABLE IF NOT EXISTS `cms_revisions` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `revision_data` LONGTEXT NOT NULL,
        `description` VARCHAR(255) NOT NULL DEFAULT 'Auto-save',
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // Client Portal Tables
    $pdo->exec("CREATE TABLE IF NOT EXISTS `client_projects` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `client_id` INT NOT NULL,
        `title` VARCHAR(255) NOT NULL,
        `description` TEXT DEFAULT NULL,
        `progress` INT NOT NULL DEFAULT 0,
        `status` VARCHAR(50) NOT NULL DEFAULT 'Planning',
        `target_date` VARCHAR(100) DEFAULT '',
        `project_code` VARCHAR(50) DEFAULT '',
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (`client_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    $pdo->exec("CREATE TABLE IF NOT EXISTS `client_tasks` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `client_id` INT NOT NULL,
        `title` VARCHAR(255) NOT NULL,
        `description` TEXT DEFAULT NULL,
        `status` VARCHAR(50) NOT NULL DEFAULT 'Pending',
        `action_type` VARCHAR(100) DEFAULT '',
        `due_date` VARCHAR(100) DEFAULT '',
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (`client_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    $pdo->exec("CREATE TABLE IF NOT EXISTS `chat_messages` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `sender_id` INT NOT NULL,
        `receiver_id` INT DEFAULT NULL,
        `message` TEXT NOT NULL,
        `sender_name` VARCHAR(100) NOT NULL,
        `is_bot` TINYINT(1) DEFAULT 0,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    $pdo->exec("CREATE TABLE IF NOT EXISTS `client_invoices` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `client_id` INT NOT NULL,
        `invoice_code` VARCHAR(50) NOT NULL,
        `amount` DECIMAL(10,2) NOT NULL,
        `balance_due` DECIMAL(10,2) DEFAULT 0.00,
        `currency` VARCHAR(10) DEFAULT '$',
        `status` VARCHAR(20) NOT NULL DEFAULT 'Pending',
        `due_date` VARCHAR(50) NOT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (`client_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    $pdo->exec("CREATE TABLE IF NOT EXISTS `client_files` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `client_id` INT NOT NULL,
        `filename` VARCHAR(255) NOT NULL,
        `file_url` VARCHAR(255) NOT NULL,
        `file_size` VARCHAR(50) NOT NULL,
        `category` VARCHAR(50) NOT NULL DEFAULT 'Document',
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (`client_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // Add optional columns to client_projects and client_invoices
    try {
        $pdo->exec("ALTER TABLE `client_invoices` ADD `balance_due` DECIMAL(10,2) DEFAULT 0.00;");
    } catch (Exception $e) {}
    try {
        $pdo->exec("ALTER TABLE `client_invoices` ADD `currency` VARCHAR(10) DEFAULT '$';");
    } catch (Exception $e) {}
    try {
        $pdo->exec("ALTER TABLE `client_projects` ADD `brief_details` TEXT DEFAULT NULL;");
    } catch (Exception $e) {}
    try {
        $pdo->exec("ALTER TABLE `client_projects` ADD `feedback_details` TEXT DEFAULT NULL;");
    } catch (Exception $e) {}

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection/initialization failed: " . $e->getMessage()]);
    exit();
}
