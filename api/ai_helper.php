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
            
        case 'section_generate':
            $prompt = isset($inputData['prompt']) ? trim($inputData['prompt']) : '';
            $sectionType = 'custom';
            
            // Detect section type from prompt
            $promptLower = strtolower($prompt);
            if (strpos($promptLower, 'hero') !== false || strpos($promptLower, 'banner') !== false) $sectionType = 'hero';
            elseif (strpos($promptLower, 'pricing') !== false || strpos($promptLower, 'plan') !== false || strpos($promptLower, 'tier') !== false) $sectionType = 'pricing';
            elseif (strpos($promptLower, 'faq') !== false || strpos($promptLower, 'question') !== false) $sectionType = 'faq';
            elseif (strpos($promptLower, 'testimonial') !== false || strpos($promptLower, 'review') !== false) $sectionType = 'testimonials';
            elseif (strpos($promptLower, 'cta') !== false || strpos($promptLower, 'call to action') !== false) $sectionType = 'cta';
            elseif (strpos($promptLower, 'team') !== false || strpos($promptLower, 'member') !== false) $sectionType = 'team';
            elseif (strpos($promptLower, 'feature') !== false || strpos($promptLower, 'benefit') !== false) $sectionType = 'features';
            elseif (strpos($promptLower, 'stats') !== false || strpos($promptLower, 'counter') !== false || strpos($promptLower, 'number') !== false) $sectionType = 'stats';
            
            $html = '';
            $css = '';
            $sectionName = 'AI Generated Section';
            
            switch ($sectionType) {
                case 'hero':
                    $sectionName = 'AI Hero Banner';
                    $html = '<div class="ai-hero-section">
  <div class="ai-hero-content">
    <span class="ai-hero-badge">✨ Welcome to the Future</span>
    <h1 class="ai-hero-title">Build Something <span class="ai-gradient-text">Extraordinary</span></h1>
    <p class="ai-hero-desc">Transform your ideas into powerful digital experiences with cutting-edge technology and creative innovation.</p>
    <div class="ai-hero-actions">
      <a href="#/contact" class="ai-btn-primary">Get Started →</a>
      <a href="#/portfolio" class="ai-btn-outline">View Portfolio</a>
    </div>
    <div class="ai-hero-stats">
      <div><strong>500+</strong><span>Projects</span></div>
      <div><strong>98%</strong><span>Satisfaction</span></div>
      <div><strong>24/7</strong><span>Support</span></div>
    </div>
  </div>
</div>';
                    $css = '.ai-hero-section{text-align:center;padding:100px 40px;background:linear-gradient(135deg,#0f0c29,#302b63,#24243e);color:#fff;position:relative;overflow:hidden}
.ai-hero-section::before{content:"";position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:radial-gradient(circle,rgba(99,102,241,.15) 0%,transparent 50%);animation:ai-pulse 8s ease-in-out infinite}
@keyframes ai-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}
.ai-hero-badge{display:inline-block;padding:8px 20px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);border-radius:50px;font-size:.85rem;margin-bottom:24px;backdrop-filter:blur(10px)}
.ai-hero-title{font-size:3.5rem;font-weight:800;line-height:1.15;margin:0 0 20px;max-width:700px;margin-left:auto;margin-right:auto}
.ai-gradient-text{background:linear-gradient(135deg,#6366f1,#ec4899,#f59e0b);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.ai-hero-desc{font-size:1.15rem;color:rgba(255,255,255,.75);max-width:550px;margin:0 auto 32px;line-height:1.7}
.ai-hero-actions{display:flex;gap:16px;justify-content:center;margin-bottom:48px;flex-wrap:wrap}
.ai-btn-primary{padding:14px 32px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;border-radius:12px;font-weight:700;transition:transform .2s,box-shadow .2s}
.ai-btn-primary:hover{transform:translateY(-2px);box-shadow:0 12px 30px rgba(99,102,241,.4)}
.ai-btn-outline{padding:14px 32px;border:2px solid rgba(255,255,255,.3);color:#fff;text-decoration:none;border-radius:12px;font-weight:600;transition:all .2s}
.ai-btn-outline:hover{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.5)}
.ai-hero-stats{display:flex;gap:48px;justify-content:center;flex-wrap:wrap}
.ai-hero-stats div{text-align:center}
.ai-hero-stats strong{display:block;font-size:1.8rem;background:linear-gradient(135deg,#6366f1,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.ai-hero-stats span{font-size:.8rem;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:1px}';
                    break;
                    
                case 'pricing':
                    $sectionName = 'AI Pricing Table';
                    $html = '<div class="ai-pricing-section">
  <div class="ai-section-header"><span class="ai-label">Pricing</span><h2>Simple, Transparent Pricing</h2><p>Choose the plan that fits your needs. No hidden fees.</p></div>
  <div class="ai-pricing-grid">
    <div class="ai-pricing-card">
      <h3>Starter</h3><p class="ai-price"><span class="ai-currency">$</span>29<span class="ai-period">/mo</span></p>
      <ul><li>✓ 5 Projects</li><li>✓ Basic Analytics</li><li>✓ Email Support</li><li>✗ Custom Domain</li></ul>
      <a href="#/contact" class="ai-pricing-btn">Get Started</a>
    </div>
    <div class="ai-pricing-card ai-popular">
      <div class="ai-popular-badge">Most Popular</div>
      <h3>Professional</h3><p class="ai-price"><span class="ai-currency">$</span>79<span class="ai-period">/mo</span></p>
      <ul><li>✓ Unlimited Projects</li><li>✓ Advanced Analytics</li><li>✓ Priority Support</li><li>✓ Custom Domain</li></ul>
      <a href="#/contact" class="ai-pricing-btn ai-btn-pop">Get Started</a>
    </div>
    <div class="ai-pricing-card">
      <h3>Enterprise</h3><p class="ai-price"><span class="ai-currency">$</span>199<span class="ai-period">/mo</span></p>
      <ul><li>✓ Everything in Pro</li><li>✓ Dedicated Manager</li><li>✓ SLA Guarantee</li><li>✓ API Access</li></ul>
      <a href="#/contact" class="ai-pricing-btn">Contact Sales</a>
    </div>
  </div>
</div>';
                    $css = '.ai-pricing-section{padding:80px 40px;text-align:center}
.ai-section-header{margin-bottom:48px}.ai-section-header h2{font-size:2.2rem;font-weight:800;margin:8px 0}.ai-section-header p{color:#64748b;font-size:1.05rem}
.ai-label{display:inline-block;padding:4px 14px;background:linear-gradient(135deg,rgba(99,102,241,.1),rgba(139,92,246,.1));color:#6366f1;border-radius:20px;font-size:.8rem;font-weight:700;text-transform:uppercase;letter-spacing:1px}
.ai-pricing-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;max-width:960px;margin:0 auto}
.ai-pricing-card{border:1px solid #e2e8f0;border-radius:16px;padding:36px 28px;text-align:left;position:relative;transition:transform .2s,box-shadow .2s;background:var(--bg-primary,#fff)}
.ai-pricing-card:hover{transform:translateY(-4px);box-shadow:0 20px 40px rgba(0,0,0,.08)}
.ai-pricing-card h3{font-size:1.15rem;font-weight:700;margin:0 0 8px}
.ai-price{font-size:2.8rem;font-weight:800;margin:16px 0 24px;color:var(--text-primary,#0f172a)}
.ai-currency{font-size:1.4rem;vertical-align:super;margin-right:2px}.ai-period{font-size:.9rem;color:#94a3b8;font-weight:400}
.ai-pricing-card ul{list-style:none;padding:0;margin:0 0 28px}
.ai-pricing-card li{padding:8px 0;font-size:.92rem;border-bottom:1px solid #f1f5f9;color:var(--text-secondary,#475569)}
.ai-pricing-btn{display:block;text-align:center;padding:12px;border:2px solid #e2e8f0;border-radius:10px;text-decoration:none;font-weight:700;color:var(--text-primary,#0f172a);transition:all .2s}
.ai-pricing-btn:hover{border-color:#6366f1;color:#6366f1}
.ai-popular{border:2px solid #6366f1;box-shadow:0 8px 24px rgba(99,102,241,.15)}
.ai-popular-badge{position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:4px 18px;border-radius:20px;font-size:.75rem;font-weight:700}
.ai-btn-pop{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff!important;border-color:#6366f1}
.ai-btn-pop:hover{transform:translateY(-1px);box-shadow:0 8px 20px rgba(99,102,241,.3)}';
                    break;
                    
                case 'faq':
                    $sectionName = 'AI FAQ Section';
                    $html = '<div class="ai-faq-section">
  <div class="ai-section-header"><span class="ai-label">FAQ</span><h2>Frequently Asked Questions</h2><p>Find answers to common questions below.</p></div>
  <div class="ai-faq-list">
    <details class="ai-faq-item"><summary>What services do you offer?</summary><p>We provide comprehensive digital solutions including web development, mobile app development, UI/UX design, backend API engineering, and IT infrastructure consulting.</p></details>
    <details class="ai-faq-item"><summary>How long does a typical project take?</summary><p>Project timelines vary based on complexity. A standard website takes 4-6 weeks, while complex web applications may take 8-16 weeks. We provide detailed timelines during our initial consultation.</p></details>
    <details class="ai-faq-item"><summary>Do you provide ongoing support?</summary><p>Yes! We offer maintenance and support packages that include security updates, performance monitoring, bug fixes, and feature enhancements.</p></details>
    <details class="ai-faq-item"><summary>What is your pricing model?</summary><p>We offer flexible pricing including fixed-price projects, hourly consulting, and retainer-based partnerships. Contact us for a free quote tailored to your needs.</p></details>
    <details class="ai-faq-item"><summary>Can you work with my existing team?</summary><p>Absolutely. We seamlessly integrate with existing development teams, providing specialized expertise where needed while maintaining your established workflows.</p></details>
  </div>
</div>';
                    $css = '.ai-faq-section{padding:80px 40px;max-width:760px;margin:0 auto}
.ai-faq-list{display:flex;flex-direction:column;gap:12px}
.ai-faq-item{border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;transition:all .2s;background:var(--bg-primary,#fff)}
.ai-faq-item[open]{border-color:#6366f1;box-shadow:0 4px 16px rgba(99,102,241,.1)}
.ai-faq-item summary{padding:18px 24px;cursor:pointer;font-weight:700;font-size:1rem;list-style:none;display:flex;justify-content:space-between;align-items:center;color:var(--text-primary,#0f172a)}
.ai-faq-item summary::after{content:"+";font-size:1.4rem;color:#6366f1;transition:transform .2s}
.ai-faq-item[open] summary::after{content:"−"}
.ai-faq-item summary::-webkit-details-marker{display:none}
.ai-faq-item p{padding:0 24px 18px;margin:0;color:#64748b;line-height:1.7;font-size:.92rem}';
                    break;
                    
                case 'testimonials':
                    $sectionName = 'AI Testimonials';
                    $html = '<div class="ai-testimonials-section">
  <div class="ai-section-header"><span class="ai-label">Testimonials</span><h2>What Our Clients Say</h2></div>
  <div class="ai-testimonials-grid">
    <div class="ai-testimonial-card"><div class="ai-stars">★★★★★</div><p>"Exceptional quality and attention to detail. The team delivered beyond our expectations and on schedule."</p><div class="ai-author"><strong>Sarah Johnson</strong><span>CEO, TechFlow Inc</span></div></div>
    <div class="ai-testimonial-card"><div class="ai-stars">★★★★★</div><p>"Professional, responsive, and incredibly skilled. They transformed our outdated platform into a modern powerhouse."</p><div class="ai-author"><strong>Michael Chen</strong><span>CTO, DataSync</span></div></div>
    <div class="ai-testimonial-card"><div class="ai-stars">★★★★★</div><p>"The best investment we made this year. ROI exceeded 300% within the first quarter of launch."</p><div class="ai-author"><strong>Emma Williams</strong><span>VP Marketing, GrowthLab</span></div></div>
  </div>
</div>';
                    $css = '.ai-testimonials-section{padding:80px 40px;text-align:center}
.ai-testimonials-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;max-width:1000px;margin:24px auto 0}
.ai-testimonial-card{border:1px solid #e2e8f0;border-radius:16px;padding:32px 24px;text-align:left;background:var(--bg-primary,#fff);transition:transform .2s}
.ai-testimonial-card:hover{transform:translateY(-3px)}
.ai-stars{color:#f59e0b;font-size:1.1rem;margin-bottom:16px;letter-spacing:2px}
.ai-testimonial-card p{color:#475569;line-height:1.7;font-size:.95rem;margin:0 0 20px;font-style:italic}
.ai-author strong{display:block;font-size:.9rem;color:var(--text-primary,#0f172a)}.ai-author span{font-size:.8rem;color:#94a3b8}';
                    break;
                    
                case 'cta':
                    $sectionName = 'AI Call to Action';
                    $html = '<div class="ai-cta-section">
  <h2>Ready to Build Something Amazing?</h2>
  <p>Let\'s turn your vision into reality. Get a free consultation today.</p>
  <div class="ai-cta-actions">
    <a href="#/contact" class="ai-cta-btn-primary">Start Your Project →</a>
    <a href="#/portfolio" class="ai-cta-btn-secondary">See Our Work</a>
  </div>
</div>';
                    $css = '.ai-cta-section{padding:80px 40px;text-align:center;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border-radius:24px;margin:20px;position:relative;overflow:hidden}
.ai-cta-section::before{content:"";position:absolute;inset:0;background:url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'1.5\' fill=\'rgba(255,255,255,.1)\'/%3E%3C/svg%3E")}
.ai-cta-section h2{font-size:2.4rem;font-weight:800;margin:0 0 16px;position:relative}
.ai-cta-section p{font-size:1.1rem;opacity:.85;margin:0 0 32px;position:relative}
.ai-cta-actions{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;position:relative}
.ai-cta-btn-primary{padding:14px 32px;background:#fff;color:#6366f1;text-decoration:none;border-radius:12px;font-weight:700;transition:transform .2s}
.ai-cta-btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.2)}
.ai-cta-btn-secondary{padding:14px 32px;border:2px solid rgba(255,255,255,.4);color:#fff;text-decoration:none;border-radius:12px;font-weight:600}';
                    break;
                
                case 'stats':
                    $sectionName = 'AI Statistics Counter';
                    $html = '<div class="ai-stats-section">
  <div class="ai-section-header"><span class="ai-label">By The Numbers</span><h2>Our Track Record</h2></div>
  <div class="ai-stats-grid">
    <div class="ai-stat-card"><div class="ai-stat-number">500+</div><div class="ai-stat-label">Projects Delivered</div></div>
    <div class="ai-stat-card"><div class="ai-stat-number">98%</div><div class="ai-stat-label">Client Satisfaction</div></div>
    <div class="ai-stat-card"><div class="ai-stat-number">50+</div><div class="ai-stat-label">Team Members</div></div>
    <div class="ai-stat-card"><div class="ai-stat-number">12+</div><div class="ai-stat-label">Years Experience</div></div>
  </div>
</div>';
                    $css = '.ai-stats-section{padding:80px 40px;text-align:center}
.ai-stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:24px;max-width:900px;margin:32px auto 0}
.ai-stat-card{padding:36px 24px;border-radius:16px;background:linear-gradient(135deg,rgba(99,102,241,.05),rgba(139,92,246,.05));border:1px solid rgba(99,102,241,.1);transition:transform .2s}
.ai-stat-card:hover{transform:translateY(-3px)}
.ai-stat-number{font-size:2.8rem;font-weight:800;background:linear-gradient(135deg,#6366f1,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:8px}
.ai-stat-label{font-size:.85rem;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:1px}';
                    break;
                    
                case 'team':
                    $sectionName = 'AI Team Members';
                    $html = '<div class="ai-team-section">
  <div class="ai-section-header"><span class="ai-label">Our Team</span><h2>Meet the Experts</h2><p>Talented professionals driving innovation.</p></div>
  <div class="ai-team-grid">
    <div class="ai-team-card"><div class="ai-team-avatar" style="background:linear-gradient(135deg,#6366f1,#8b5cf6)">JD</div><h4>John Doe</h4><p>Lead Developer</p></div>
    <div class="ai-team-card"><div class="ai-team-avatar" style="background:linear-gradient(135deg,#ec4899,#f43f5e)">AS</div><h4>Anna Smith</h4><p>UI/UX Designer</p></div>
    <div class="ai-team-card"><div class="ai-team-avatar" style="background:linear-gradient(135deg,#f59e0b,#f97316)">MJ</div><h4>Mike Johnson</h4><p>Backend Architect</p></div>
    <div class="ai-team-card"><div class="ai-team-avatar" style="background:linear-gradient(135deg,#10b981,#059669)">EW</div><h4>Emily Wilson</h4><p>Project Manager</p></div>
  </div>
</div>';
                    $css = '.ai-team-section{padding:80px 40px;text-align:center}
.ai-team-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:24px;max-width:900px;margin:32px auto 0}
.ai-team-card{padding:32px 20px;border-radius:16px;border:1px solid #e2e8f0;background:var(--bg-primary,#fff);transition:transform .2s}
.ai-team-card:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,.06)}
.ai-team-avatar{width:72px;height:72px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:1.2rem;margin:0 auto 16px}
.ai-team-card h4{margin:0 0 4px;font-size:1rem}.ai-team-card p{margin:0;color:#94a3b8;font-size:.85rem}';
                    break;
                    
                case 'features':
                    $sectionName = 'AI Features Grid';
                    $html = '<div class="ai-features-section">
  <div class="ai-section-header"><span class="ai-label">Features</span><h2>Why Choose Us</h2><p>Everything you need to succeed in the digital world.</p></div>
  <div class="ai-features-grid">
    <div class="ai-feature-card"><div class="ai-feature-icon">🚀</div><h4>Lightning Fast</h4><p>Optimized performance with sub-second load times.</p></div>
    <div class="ai-feature-card"><div class="ai-feature-icon">🔒</div><h4>Secure by Design</h4><p>Enterprise-grade security built into every layer.</p></div>
    <div class="ai-feature-card"><div class="ai-feature-icon">📱</div><h4>Mobile First</h4><p>Responsive designs that work on every device.</p></div>
    <div class="ai-feature-card"><div class="ai-feature-icon">⚡</div><h4>Scalable</h4><p>Architecture that grows with your business needs.</p></div>
    <div class="ai-feature-card"><div class="ai-feature-icon">🎨</div><h4>Beautiful Design</h4><p>Modern aesthetics that captivate your audience.</p></div>
    <div class="ai-feature-card"><div class="ai-feature-icon">🤝</div><h4>24/7 Support</h4><p>Dedicated support team always ready to help.</p></div>
  </div>
</div>';
                    $css = '.ai-features-section{padding:80px 40px;text-align:center}
.ai-features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;max-width:1000px;margin:32px auto 0}
.ai-feature-card{padding:32px 24px;border-radius:16px;border:1px solid #e2e8f0;text-align:left;background:var(--bg-primary,#fff);transition:transform .2s,box-shadow .2s}
.ai-feature-card:hover{transform:translateY(-3px);box-shadow:0 12px 24px rgba(0,0,0,.06)}
.ai-feature-icon{font-size:2rem;margin-bottom:16px;display:inline-block;padding:12px;background:linear-gradient(135deg,rgba(99,102,241,.08),rgba(139,92,246,.08));border-radius:12px}
.ai-feature-card h4{margin:0 0 8px;font-size:1.05rem;font-weight:700;color:var(--text-primary,#0f172a)}
.ai-feature-card p{margin:0;color:#64748b;font-size:.9rem;line-height:1.6}';
                    break;
                    
                default:
                    $sectionName = 'AI Custom Section';
                    $html = '<div class="ai-custom-section">
  <div class="ai-section-header"><h2>' . htmlspecialchars($prompt ?: 'Custom Section') . '</h2><p>AI-generated section based on your prompt.</p></div>
  <div class="ai-custom-content">
    <p>This section was generated based on your prompt: "' . htmlspecialchars($prompt) . '". You can edit the HTML, CSS, and JavaScript to fully customize this block to match your exact needs.</p>
  </div>
</div>';
                    $css = '.ai-custom-section{padding:60px 40px;text-align:center;max-width:800px;margin:0 auto}
.ai-custom-content{padding:24px;border:1px dashed #e2e8f0;border-radius:12px;margin-top:24px}
.ai-custom-content p{color:#64748b;line-height:1.7}';
                    break;
            }
            
            echo json_encode([
                "success" => true,
                "result" => [
                    "name" => $sectionName,
                    "html" => $html,
                    "css" => $css,
                    "type" => $sectionType
                ]
            ]);
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
