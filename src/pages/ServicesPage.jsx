import React, { useEffect, useContext } from 'react';
import './ServicesPage.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CmsContext } from '../CmsContext';

const ServicesPage = () => {
  const { cms } = useContext(CmsContext) || {};

  const portfolio = React.useMemo(() => {
    if (cms && cms.james_whitfield_portfolio_data) {
      try {
        return JSON.parse(cms.james_whitfield_portfolio_data);
      } catch (e) {
        console.error('Failed to parse portfolio data', e);
      }
    }
    return null;
  }, [cms]);

  const techStack = portfolio?.techStack || [
    { name: 'TypeScript', years: '8y' },
    { name: 'Go', years: '6y' },
    { name: 'Python', years: '10y' },
    { name: 'React / Next.js', years: '7y' },
    { name: 'Node.js', years: '9y' },
    { name: 'Kafka', years: '5y' },
    { name: 'PostgreSQL', years: '10y' },
    { name: 'MongoDB', years: '6y' },
    { name: 'Docker / K8s', years: '6y' },
    { name: 'AWS', years: '8y' },
    { name: 'GraphQL', years: '5y' },
    { name: 'gRPC', years: '4y' },
    { name: 'Redis', years: '7y' },
    { name: 'Terraform', years: '4y' },
  ];

  const projects = portfolio?.projects || [
    {
      id: 1,
      title: 'Fraud Detection Pipeline',
      year: '2024 · Prod',
      metrics: [
        { icon: 'fa-bolt', value: '120ms', label: 'p99' },
        { icon: 'fa-check-circle', value: '99.97%', label: 'uptime' },
        { icon: 'fa-dollar-sign', value: '$2.4M', label: 'prevented' },
      ],
      description: 'Real‑time fraud scoring service processing 50k+ events/sec with rules engine + ML.',
      tech: ['Go', 'Kafka', 'Redis', 'Flink', 'TF Serving', 'K8s'],
      links: [
        { label: 'Demo', icon: 'fa-external-link-alt', url: '#' },
        { label: 'Source', icon: 'fa-github', url: '#' },
        { label: 'Case Study', icon: 'fa-file-alt', url: '#' },
      ],
    },
    {
      id: 2,
      title: 'API Gateway · Mesh',
      year: '2023 · OSS',
      metrics: [
        { icon: 'fa-code-branch', value: '2.8k', label: 'stars' },
        { icon: 'fa-users', value: '400+', label: 'deployments' },
        { icon: 'fa-clock', value: '85%', label: 'faster routing' },
      ],
      description: 'Pluggable gateway supporting REST, GraphQL, gRPC with rate limiting & circuit breakers.',
      tech: ['Go', 'gRPC', 'Envoy', 'OTel', 'Redis', 'JWT'],
      links: [
        { label: 'Demo', icon: 'fa-external-link-alt', url: '#' },
        { label: 'GitHub', icon: 'fa-github', url: '#' },
        { label: 'Docs', icon: 'fa-book', url: '#' },
      ],
    },
    {
      id: 3,
      title: 'CarePlatform · Health Tech',
      year: '2022 · HIPAA',
      metrics: [
        { icon: 'fa-user-md', value: '1.2M', label: 'records' },
        { icon: 'fa-shield-alt', value: 'SOC2', label: 'Type II' },
        { icon: 'fa-sync', value: '99.95%', label: 'avail.' },
      ],
      description: 'FHIR‑compliant platform unifying EMR data from 30+ hospital systems.',
      tech: ['Python', 'Django', 'PostgreSQL', 'Redis', 'Celery', 'FHIR', 'AWS'],
      links: [
        { label: 'Demo', icon: 'fa-external-link-alt', url: '#' },
        { label: 'Source', icon: 'fa-github', url: '#' },
      ],
    },
    {
      id: 4,
      title: 'DevEx · Internal Portal',
      year: '2021 · Platform',
      metrics: [
        { icon: 'fa-clock', value: '65%', label: 'faster onboarding' },
        { icon: 'fa-tools', value: '200+', label: 'services' },
        { icon: 'fa-smile', value: '4.8/5', label: 'satisfaction' },
      ],
      description: 'Self‑service environment provisioning, service templates, and automated docs.',
      tech: ['TS', 'React', 'Next.js', 'Node', 'GraphQL', 'Terraform', 'K8s', 'ArgoCD'],
      links: [
        { label: 'Demo', icon: 'fa-external-link-alt', url: '#' },
        { label: 'Source', icon: 'fa-github', url: '#' },
      ],
    },
  ];

  const experiences = portfolio?.experiences || [
    {
      period: '2021 — Present',
      title: 'Staff Software Engineer',
      company: 'FinSecure Inc.',
      highlights: [
        'Led architecture of fraud detection platform serving 50k+ TPS.',
        'Mentored 8 engineers across 3 teams; introduced RFC process.',
        'Reduced cloud costs by 32% through right‑sizing.',
      ],
    },
    {
      period: '2017 — 2021',
      title: 'Senior Software Engineer',
      company: 'HealthData Labs',
      highlights: [
        'Architected HIPAA‑compliant platform serving 1.2M+ records.',
        'Built event‑driven ETL pipeline reducing sync latency 24h → 5min.',
        'Led monolith → microservices migration (12 services, Kafka).',
      ],
    },
    {
      period: '2014 — 2017',
      title: 'Software Engineer',
      company: 'CloudScale Systems',
      highlights: [
        'Developed core features for multi‑tenant SaaS analytics platform.',
        'Designed RESTful APIs serving 10k+ concurrent users.',
        'Introduced automated testing and CI/CD (Jenkins → GitHub Actions).',
      ],
    },
  ];

  const bioInfo = {
    name: portfolio?.bioInfo?.name || 'James',
    lastName: portfolio?.bioInfo?.lastName || 'Whitfield',
    badge: portfolio?.bioInfo?.badge || '✦ Staff Software Engineer',
    role: portfolio?.bioInfo?.role || '10+ years · Distributed Systems · API Design · Tech Leadership',
    bio: portfolio?.bioInfo?.bio || 'I architect and build high‑scale systems that handle millions of requests per day. Passionate about clean abstractions, team mentorship, and turning business requirements into reliable, maintainable software.',
    stats: portfolio?.bioInfo?.stats || [
      { number: '10+', label: 'Years Exp.' },
      { number: '8', label: 'Products' },
      { number: '12', label: 'Team Lead' },
      { number: '3', label: 'Patents' }
    ],
    socials: portfolio?.bioInfo?.socials || {
      github: '#',
      linkedin: '#',
      twitter: '#',
      dev: '#'
    },
    contact: portfolio?.bioInfo?.contact || {
      email: 'james@example.com',
      linkedin: '#',
      resume: '#'
    },
    avatarUrl: portfolio?.bioInfo?.avatarUrl || ''
  };

  useEffect(() => {
    console.log(`%c ${bioInfo.name} ${bioInfo.lastName} · ${bioInfo.badge.replace('✦ ', '')} `, 'background:#3b82f6;color:white;font-size:1.2rem;padding:0.5rem 1rem;border-radius:8px;');
    console.log('🚀 ' + bioInfo.role);
    console.log('⌨️ Press "p" to list all projects in console.');

    const handleKeyPress = (e) => {
      if (e.key === 'p' && !e.ctrlKey && !e.metaKey) {
        const projCards = document.querySelectorAll('.project-card h3');
        console.log('📦 Projects:');
        projCards.forEach((p, i) => console.log(`  ${i+1}. ${p.textContent.trim()}`));
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [bioInfo.name, bioInfo.lastName, bioInfo.badge, bioInfo.role]);

  const handleLinkClick = (e, url) => {
    if (url === '#') {
      e.preventDefault();
      alert('🔗 Placeholder — replace with your actual URL.');
    } else {
      console.log(`[Analytics] Outbound: ${url}`);
    }
  };

  return (
    <div className="page-container flex min-h-screen flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] relative">
      <Navbar cms={cms} />
      
      <main className="relative z-10 flex-grow pt-24">
        <div className="services-container">
          {/* ===== HERO ===== */}
          <header className="hero-grid">
            <div className="hero-left">
              <div className="badge">{bioInfo.badge}</div>
              <h1>{bioInfo.name} <span className="highlight">{bioInfo.lastName}</span></h1>
              <div className="title-role">
                <span>{bioInfo.role.split(' · ')[0]}</span> · {bioInfo.role.split(' · ').slice(1).join(' · ')}
              </div>
              <p className="bio">{bioInfo.bio}</p>
              <div className="hero-stats">
                {bioInfo.stats.map((stat, idx) => (
                  <div key={idx} className="stat">
                    <span className="number">{stat.number}</span>
                    <span className="label">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="hero-right">
              <div className="avatar">
                {bioInfo.avatarUrl ? (
                  <img src={bioInfo.avatarUrl} alt={`${bioInfo.name} ${bioInfo.lastName}`} />
                ) : (
                  (bioInfo.name?.[0] || 'J') + (bioInfo.lastName?.[0] || 'W')
                )}
              </div>
              <div className="social-links">
                <a href={bioInfo.socials.github} onClick={(e) => handleLinkClick(e, bioInfo.socials.github)} target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-github"></i>
                </a>
                <a href={bioInfo.socials.linkedin} onClick={(e) => handleLinkClick(e, bioInfo.socials.linkedin)} target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-linkedin-in"></i>
                </a>
                <a href={bioInfo.socials.twitter} onClick={(e) => handleLinkClick(e, bioInfo.socials.twitter)} target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-x-twitter"></i>
                </a>
                <a href={bioInfo.socials.dev} onClick={(e) => handleLinkClick(e, bioInfo.socials.dev)} target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-dev"></i>
                </a>
              </div>
            </div>
          </header>

          {/* ===== TECH STACK ===== */}
          <section className="tech-section">
            <div className="section-title"><i className="fas fa-cubes"></i> Core Competencies</div>
            <div className="divider"></div>
            <div className="tech-grid">
              {techStack.map((tech, index) => (
                <span key={index} className="tech-item">
                  {tech.name}
                  {tech.years && <span className="years"> ({tech.years})</span>}
                </span>
              ))}
            </div>
          </section>

          {/* ===== PROJECTS ===== */}
          <section className="projects-section">
            <div className="section-title"><i className="fas fa-rocket"></i> Flagship Projects</div>
            <div className="divider"></div>

            {projects.map((project) => (
              <div key={project.id} className="project-card">
                <div className="meta">
                  <h3>
                    <i className="fas fa-star" style={{ color: '#fbbf24', fontSize: '0.85rem', marginRight: '8px', verticalAlign: 'middle' }}></i>
                    {project.title}
                  </h3>
                  <span className="year-tag">{project.year}</span>
                </div>
                 {project.metrics && project.metrics.length > 0 && (
                   <div className="metrics-grid">
                     {project.metrics.map((metric, idx) => (
                       <div key={idx} className="metric-box">
                         <div className="metric-header">
                           <i className={`fas ${metric.icon}`}></i>
                           <strong className="metric-value">{metric.value}</strong>
                         </div>
                         <span className="metric-label">{metric.label}</span>
                       </div>
                     ))}
                   </div>
                 )}
                <p>{project.description}</p>
                 {project.tech && project.tech.length > 0 && (
                   <div className="tech-used">
                     {project.tech.map((t, idx) => (
                       <span key={idx}>{t}</span>
                     ))}
                   </div>
                 )}
                 {project.links && project.links.length > 0 && (
                   <div className="links">
                     {project.links.map((link, idx) => (
                       <a
                         key={idx}
                         href={link.url}
                         onClick={(e) => handleLinkClick(e, link.url)}
                         target="_blank"
                         rel="noopener noreferrer"
                       >
                         <i className={`fas ${link.icon}`}></i> {link.label}
                       </a>
                     ))}
                   </div>
                 )}
              </div>
            ))}
          </section>

          {/* ===== EXPERIENCE ===== */}
          <section className="experience-section">
            <div className="section-title"><i className="fas fa-briefcase"></i> Experience</div>
            <div className="divider"></div>
            <div className="timeline">
              {experiences.map((exp, index) => (
                <div key={index} className="timeline-item">
                  <div className="period">{exp.period}</div>
                  <div className="details">
                    <h4>{exp.title} <span className="company">· {exp.company}</span></h4>
                    {exp.highlights && exp.highlights.length > 0 && (
                      <ul>
                        {exp.highlights.map((point, idx) => (
                          <li key={idx}>{point}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ===== CONTACT ===== */}
          <section className="contact-section">
            <h2>Let's build something <span>impactful</span></h2>
            <p>I'm open to senior/principal engineering roles, consulting, or technical advisory.</p>
            <div className="contact-actions">
              <a href={`mailto:${bioInfo.contact.email}`} className="btn-primary">
                <i className="fas fa-envelope"></i> {bioInfo.contact.email}
              </a>
              <a href={bioInfo.contact.linkedin} onClick={(e) => handleLinkClick(e, bioInfo.contact.linkedin)} className="btn-secondary">
                <i className="fab fa-linkedin"></i> LinkedIn
              </a>
              <a href={bioInfo.contact.resume} onClick={(e) => handleLinkClick(e, bioInfo.contact.resume)} className="btn-secondary">
                <i className="fas fa-file-pdf"></i> Resume
              </a>
            </div>
          </section>
        </div>
      </main>

      <Footer cms={cms} />
    </div>
  );
};

export default ServicesPage;