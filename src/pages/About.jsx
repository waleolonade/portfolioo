import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Target, 
  Eye, 
  Code, 
  Smartphone, 
  Zap, 
  Shield, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  Settings, 
  ArrowRight, 
  Database, 
  GitBranch, 
  Cpu, 
  Users, 
  MessageSquare,
  HelpCircle,
  Award
} from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function About() {
  const [team, setTeam] = useState([]);
  const [cms, setCms] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Load CMS & Team
    Promise.all([
      fetch(`${API_BASE_URL}/cms.php`).then(res => res.json()),
      fetch(`${API_BASE_URL}/team.php`).then(res => res.json())
    ])
      .then(([cmsData, teamData]) => {
        setCms(cmsData || {});
        setTeam(teamData || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load About page datasets', err);
        setLoading(false);
      });
  }, []);

  const focusAreas = [
    {
      icon: <Code size={24} />,
      title: 'Clean, Maintainable Code',
      desc: 'Written following industry-standard design patterns to ensure long-term scalability and easy handovers.'
    },
    {
      icon: <Shield size={24} />,
      title: 'Secure & Scalable Backends',
      desc: 'Robust databases and API systems engineered to protect data integrity and support massive scale.'
    },
    {
      icon: <Sparkles size={24} />,
      title: 'Intuitive, High-Quality UIs',
      desc: 'Beautiful user interfaces designed with a premium, responsive layout for an exceptional experience.'
    },
    {
      icon: <Cpu size={24} />,
      title: 'Performance-Optimized Apps',
      desc: 'Optimized speed and resources to ensure lightning-fast interactions and zero downtime.'
    }
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Requirement Analysis',
      desc: 'We start by understanding your core business goals, target audience, and detailed requirements.'
    },
    {
      step: '02',
      title: 'System Design',
      desc: 'Our architects plan the database models, APIs, server pipelines, and frontend interface design.'
    },
    {
      step: '03',
      title: 'Development',
      desc: 'Our engineers build clean, maintainable modular code using Git for version control and workflow hygiene.'
    },
    {
      step: '04',
      title: 'Testing & Optimization',
      desc: 'Rigorous checks verify performance limits, responsiveness, edge-case security, and system speed.'
    },
    {
      step: '05',
      title: 'Deployment',
      desc: 'We launch production-ready products on secure, highly scalable cloud architectures.'
    },
    {
      step: '06',
      title: 'Maintenance & Support',
      desc: 'Continuous uptime monitoring, patches, and feature updates to keep your systems at peak performance.'
    }
  ];

  const differentiators = [
    {
      icon: <Sparkles />,
      title: 'Real-World Focus',
      desc: 'We build systems that solve tangible business problems and automate processes, not just write lines of code.'
    },
    {
      icon: <Shield />,
      title: 'Zero-Trust Security',
      desc: 'We prioritize secure routing, strong user authorization, and data encryption by default in every system.'
    },
    {
      icon: <Zap />,
      title: 'Performance Driven',
      desc: 'We build lightweight frontends and database query indexes to deliver rapid load times and smooth actions.'
    },
    {
      icon: <Smartphone />,
      title: 'Mobile-First Mindset',
      desc: 'All layouts are crafted for native-level mobile responsiveness so users get the same premium feel on all screens.'
    },
    {
      icon: <Layers />,
      title: 'System Deep-Dive',
      desc: 'We understand microservices, cloud servers, caching layers, and how full-stack systems talk to each other.'
    },
    {
      icon: <Users />,
      title: 'Radical Transparency',
      desc: 'We collaborate closely with weekly sprint standups, clear status checklists, and developer staging environments.'
    }
  ];

  return (
    <div className="page-container">
      <Navbar cms={cms} />
      
      <main style={{ flexGrow: 1 }}>
        {/* Hero Banner */}
        <section className="about-hero">
          <div className="container">
            <span className="badge-pill">Brand Profile</span>
            <h1 className="hero-title">Engineering the Future of Digital Experiences</h1>
            <p className="hero-desc">
              Brainfeels Tech is a modern software development and digital solutions company focused on building scalable, high-performance web and mobile applications for businesses, startups, and institutions. We combine engineering excellence, user-centered design, and business strategy to deliver solutions that drive growth and efficiency.
            </p>
          </div>
        </section>

        {/* Identity & Focus Area Grid */}
        <section className="container section">
          <div className="grid grid-2" style={{ alignItems: 'center', gap: '50px', marginBottom: '60px' }}>
            <div style={{ textAlign: 'left' }}>
              <span className="section-pre">Who We Are</span>
              <h2 className="section-title" style={{ textAlign: 'left', marginTop: '8px' }}>
                We Are Solution Architects, Not Just Developers
              </h2>
              <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '20px' }}>
                At Brainfeels Tech, we specialize in transforming ambitious concepts into fully functional, production-ready systems using modern technologies and industry-standard practices. We structure code to be clean, scale databases efficiently, and create interfaces that convert.
              </p>
              <div style={{ borderLeft: '4px solid var(--secondary)', paddingLeft: '16px', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                "We don't just build websites; we design complete digital workflows that empower businesses to scale securely and efficiently."
              </div>
            </div>
            
            <div className="grid grid-2" style={{ gap: '20px' }}>
              {focusAreas.map((area, idx) => (
                <div key={idx} className="focus-card">
                  <div className="focus-card-icon">{area.icon}</div>
                  <h3>{area.title}</h3>
                  <p>{area.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Core Services Overview */}
        <section className="bg-secondary-section">
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
              <span className="section-pre">Our Capabilities</span>
              <h2 className="section-title">Comprehensive System Solutions</h2>
              <p className="section-subtitle">We design and support specialized solutions across five core segments.</p>
            </div>

            <div className="grid grid-3" style={{ gap: '30px' }}>
              <div className="service-outline-card">
                <div className="service-outline-header">
                  <Code size={20} className="text-primary" />
                  <h3>Web Development</h3>
                </div>
                <ul>
                  <li>Business & Corporate Websites</li>
                  <li>E-commerce Solutions</li>
                  <li>School Portals & Result Systems</li>
                  <li>Custom Web Applications</li>
                </ul>
              </div>

              <div className="service-outline-card">
                <div className="service-outline-header">
                  <Smartphone size={20} className="text-secondary" />
                  <h3>Mobile App Dev</h3>
                </div>
                <ul>
                  <li>Cross-platform Native Apps (iOS & Android)</li>
                  <li>Real-time Chat & Push Alerts</li>
                  <li>Social Networking Platforms</li>
                  <li>Business & Utility Apps</li>
                </ul>
              </div>

              <div className="service-outline-card">
                <div className="service-outline-header">
                  <Database size={20} className="text-accent" />
                  <h3>Backend & APIs</h3>
                </div>
                <ul>
                  <li>RESTful API Architecture</li>
                  <li>Authentication & Role Access Systems</li>
                  <li>Database Design (MySQL, Query Tuning)</li>
                  <li>Server Logic (Node.js, PHP)</li>
                </ul>
              </div>

              <div className="service-outline-card">
                <div className="service-outline-header">
                  <Layers size={20} className="text-success" />
                  <h3>UI/UX Design</h3>
                </div>
                <ul>
                  <li>Figma-to-Code Conversion</li>
                  <li>Responsive Modern Styling</li>
                  <li>Conversion Flow Optimization</li>
                  <li>Visual Interactive Mockups</li>
                </ul>
              </div>

              <div className="service-outline-card service-outline-wide" style={{ gridColumn: 'span 2' }}>
                <div className="service-outline-header">
                  <Cpu size={20} style={{ color: '#ec4899' }} />
                  <h3>Advanced System Solutions</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }} className="grid-mobile-1">
                  <ul>
                    <li>School Management Systems</li>
                    <li>Enterprise Chat Solutions</li>
                  </ul>
                  <ul>
                    <li>Job & Networking Platforms</li>
                    <li>Map & Location-Aware Apps</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow / Approach */}
        <section className="container section">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span className="section-pre">Our Workflow</span>
            <h2 className="section-title">The Engineering Approach</h2>
            <p className="section-subtitle">Every project at Brainfeels Tech is executed using a structured, predictable 6-phase pipeline.</p>
          </div>

          <div className="workflow-grid">
            {workflowSteps.map((step, idx) => (
              <div key={idx} className="workflow-step-card">
                <div className="workflow-step-num">{step.step}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Technology Stack */}
        <section className="bg-secondary-section">
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
              <span className="section-pre">Technologies We Use</span>
              <h2 className="section-title">Our Core Technology Stack</h2>
              <p className="section-subtitle">We leverage modern, reliable, and standardized frameworks to guarantee product longevity.</p>
            </div>

            <div className="grid grid-5" style={{ gap: '20px' }} className="grid-stack-responsive">
              <div className="stack-card">
                <h4>Frontend</h4>
                <div className="stack-pill">React.js</div>
                <div className="stack-pill">HTML5</div>
                <div className="stack-pill">CSS3</div>
                <div className="stack-pill">JavaScript</div>
              </div>

              <div className="stack-card">
                <h4>Mobile</h4>
                <div className="stack-pill">React Native</div>
                <div className="stack-pill">Expo</div>
                <div className="stack-pill">SQLite</div>
              </div>

              <div className="stack-card">
                <h4>Backend</h4>
                <div className="stack-pill">Node.js</div>
                <div className="stack-pill">Express</div>
                <div className="stack-pill">PHP</div>
              </div>

              <div className="stack-card">
                <h4>Database</h4>
                <div className="stack-pill">MySQL</div>
                <div className="stack-pill">JSON Store</div>
              </div>

              <div className="stack-card">
                <h4>Tools</h4>
                <div className="stack-pill">Git / GitHub</div>
                <div className="stack-pill">REST APIs</div>
                <div className="stack-pill">Postman</div>
              </div>
            </div>
          </div>
        </section>

        {/* What Makes Us Different */}
        <section className="container section">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span className="section-pre">Why Brainfeels Tech</span>
            <h2 className="section-title">What Makes Us Different</h2>
            <p className="section-subtitle">We position our development practices around speed, safety, and business-focused strategy.</p>
          </div>

          <div className="grid grid-3" style={{ gap: '30px' }}>
            {differentiators.map((diff, idx) => (
              <div key={idx} className="diff-card">
                <div className="diff-card-icon">{diff.icon}</div>
                <h3>{diff.title}</h3>
                <p>{diff.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Target Clients & Vision/Mission */}
        <section className="bg-secondary-section">
          <div className="container grid grid-2" style={{ gap: '40px', alignItems: 'stretch' }}>
            <div className="about-panel">
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
                <Users size={28} className="text-secondary" />
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Target Clients</h3>
              </div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.6 }}>
                We engineer scalable products tailored specifically for:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                <span className="client-badge">Startups & MVPs</span>
                <span className="client-badge">Small & Medium Businesses (SMEs)</span>
                <span className="client-badge">Schools & Academic Institutions</span>
                <span className="client-badge">Corporate Organizations</span>
                <span className="client-badge">Digital Product Entrepreneurs</span>
              </div>
            </div>

            <div className="about-panel" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div className="icon-box-primary"><Target size={22} /></div>
                <div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>Mission Statement</h4>
                  <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {cms.company_mission || 'To help businesses and individuals leverage technology by building reliable, efficient, and user-friendly digital products.'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div className="icon-box-secondary"><Eye size={22} /></div>
                <div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>Vision Statement</h4>
                  <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {cms.company_vision || 'To become a leading technology company delivering innovative, scalable, and impactful software solutions across Africa and beyond.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Members */}
        <section className="container section">
          <h2 className="section-title">Core Engineering Talents</h2>
          <p className="section-subtitle">Meet the software developers, database managers, and cloud architects guiding client executions.</p>

          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>Loading team profiles...</div>
          ) : (
            <div className="grid grid-2" style={{ gap: '30px' }}>
              {team.map(member => (
                <div key={member.id} className="team-card">
                  <img
                    src={member.image_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'}
                    alt={member.name}
                    className="team-avatar"
                    onError={e => e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'}
                  />
                  <div style={{ flexGrow: 1, textAlign: 'left' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{member.name}</h3>
                    <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, display: 'block', marginBottom: '10px' }}>
                      {member.position}
                    </span>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.5 }}>{member.bio}</p>
                    
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {member.skills && member.skills.split(',').map((skill, sIdx) => (
                        <span key={sIdx} className="badge" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Call To Action */}
        <section className="container" style={{ paddingBottom: '80px' }}>
          <div className="glass-cta-card">
            <h2>Let's build something powerful together</h2>
            <p>
              Whether you need a website, mobile app, or complete system solution, Brainfeels Tech is ready to bring your ideas to life. Connect with our engineering leads directly.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '30px' }} className="flex-mobile-column">
              <a href="#/contact" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}>
                Start a Conversation <ArrowRight size={16} />
              </a>
              <a href="#/portal" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}>
                Open Client Portal <Award size={16} />
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer cms={cms} />

      <style>{`
        /* --- Premium Styles --- */
        .badge-pill {
          display: inline-block;
          padding: 6px 14px;
          border-radius: 20px;
          background: rgba(59, 130, 246, 0.1);
          color: var(--secondary);
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 20px;
        }
        .about-hero {
          padding: 80px 0 60px 0;
          text-align: center;
          background: radial-gradient(circle at top, rgba(59, 130, 246, 0.05) 0%, transparent 60%);
          border-bottom: 1px solid var(--border);
        }
        .hero-title {
          font-size: 3rem;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.02em;
          max-width: 850px;
          margin: 0 auto 20px auto;
        }
        .hero-desc {
          font-size: 1.15rem;
          line-height: 1.7;
          color: var(--text-secondary);
          max-width: 800px;
          margin: 0 auto;
        }
        .section-pre {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--secondary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          display: block;
        }
        .bg-secondary-section {
          background-color: var(--bg-secondary);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: 80px 0;
        }
        .focus-card {
          background-color: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 24px;
          text-align: left;
          transition: all 0.3s ease;
        }
        .focus-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.05);
          border-color: var(--secondary);
        }
        .focus-card-icon {
          color: var(--secondary);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: rgba(59, 130, 246, 0.08);
          margin-bottom: 16px;
        }
        .focus-card h3 {
          font-size: 1.05rem;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .focus-card p {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin: 0;
        }
        .service-outline-card {
          background-color: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 24px;
          text-align: left;
        }
        .service-outline-header {
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid var(--border);
          padding-bottom: 12px;
          margin-bottom: 16px;
        }
        .service-outline-header h3 {
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0;
        }
        .service-outline-card ul, .service-outline-wide ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .service-outline-card li, .service-outline-wide li {
          font-size: 0.9rem;
          color: var(--text-secondary);
          position: relative;
          padding-left: 18px;
        }
        .service-outline-card li::before, .service-outline-wide li::before {
          content: '•';
          color: var(--secondary);
          position: absolute;
          left: 0;
          font-size: 1.1rem;
          line-height: 1;
        }
        .service-outline-wide {
          grid-column: span 2;
          background-color: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 24px;
          text-align: left;
        }
        .workflow-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
        }
        .workflow-step-card {
          border-left: 2px solid var(--border);
          padding-left: 24px;
          position: relative;
          text-align: left;
        }
        .workflow-step-card::before {
          content: '';
          position: absolute;
          left: -6px;
          top: 0;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: var(--secondary);
        }
        .workflow-step-num {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--secondary);
          margin-bottom: 6px;
        }
        .workflow-step-card h3 {
          font-size: 1.15rem;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .workflow-step-card p {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin: 0;
        }
        .stack-card {
          background-color: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px;
          text-align: center;
        }
        .stack-card h4 {
          font-size: 1rem;
          font-weight: 700;
          border-bottom: 1px solid var(--border);
          padding-bottom: 10px;
          margin-bottom: 14px;
        }
        .stack-pill {
          display: inline-block;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 4px 10px;
          font-size: 0.8rem;
          font-weight: 500;
          margin: 4px;
          color: var(--text-primary);
        }
        .diff-card {
          background-color: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 24px;
          text-align: left;
          transition: all 0.3s ease;
        }
        .diff-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.05);
          border-color: var(--primary);
        }
        .diff-card-icon {
          color: var(--primary);
          margin-bottom: 16px;
        }
        .diff-card h3 {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .diff-card p {
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin: 0;
        }
        .about-panel {
          background-color: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 36px;
          text-align: left;
        }
        .client-badge {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border);
          padding: 6px 14px;
          border-radius: 30px;
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        .icon-box-primary, .icon-box-secondary {
          padding: 10px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .icon-box-primary {
          color: var(--primary);
          background: rgba(var(--primary-rgb), 0.08);
        }
        .icon-box-secondary {
          color: var(--secondary);
          background: rgba(var(--secondary-rgb), 0.08);
        }
        .team-card {
          background-color: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          gap: 24px;
          align-items: center;
        }
        .team-avatar {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--border);
          flex-shrink: 0;
        }
        .glass-cta-card {
          background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.03) 0%, rgba(var(--secondary-rgb), 0.03) 100%);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 50px 30px;
          text-align: center;
        }
        .glass-cta-card h2 {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 12px;
        }
        .glass-cta-card p {
          font-size: 1.05rem;
          color: var(--text-secondary);
          max-width: 650px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* --- Colors Helper --- */
        .text-primary { color: var(--primary); }
        .text-secondary { color: var(--secondary); }
        .text-accent { color: var(--accent); }
        .text-success { color: #10b981; }

        /* --- Media Queries --- */
        @media (max-width: 992px) {
          .workflow-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 24px;
          }
          .hero-title {
            font-size: 2.5rem;
          }
        }
        @media (max-width: 768px) {
          .workflow-grid {
            grid-template-columns: 1fr;
          }
          .grid-stack-responsive {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .grid-mobile-1 {
            grid-template-columns: 1fr !important;
          }
          .team-card {
            flex-direction: column;
            text-align: center !important;
          }
          .team-card div {
            text-align: center !important;
          }
          .team-card div div {
            justify-content: center !important;
          }
          .flex-mobile-column {
            flex-direction: column;
          }
          .service-outline-wide {
            grid-column: span 1 !important;
          }
          .hero-title {
            font-size: 2.1rem;
          }
        }
      `}</style>
    </div>
  );
}
