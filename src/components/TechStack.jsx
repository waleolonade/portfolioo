import React from 'react';
import { Layout, Server, Database, Settings } from 'lucide-react';

export default function TechStack({ cms = {} }) {
  const stackCategories = [
    {
      title: "Frontend Engineering",
      icon: <Layout size={18} />,
      color: '#6366f1',
      items: ["React", "React Native", "Expo", "Next.js", "JavaScript (ES6+)", "HTML5 & CSS3", "Tailwind CSS"]
    },
    {
      title: "Backend Development",
      icon: <Server size={18} />,
      color: '#14b8a6',
      items: ["Node.js", "Express", "PHP", "Laravel", "RESTful APIs", "JWT Auth", "HMAC Signatures"]
    },
    {
      title: "Database Engines",
      icon: <Database size={18} />,
      color: '#f59e0b',
      items: ["MySQL", "PostgreSQL", "SQLite", "Redis Caching", "Firebase Realtime"]
    },
    {
      title: "DevOps & Tooling",
      icon: <Settings size={18} />,
      color: '#8b5cf6',
      items: ["Git / GitHub", "Docker", "AWS (VPC, EC2)", "Google Cloud (GCP)", "Terraform IaC", "CI/CD Pipelines"]
    }
  ];

  return (
    <section id="tech-stack" className="section" style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: '12px' }}>
            {cms.home_tech_stack_subtitle || 'Technologies'}
          </span>
          <h2 className="section-title" style={{ marginBottom: '16px' }}>{cms.home_tech_stack_title || 'Core Technology Stack'}</h2>
          <p className="section-subtitle" style={{ marginBottom: 0 }}>
            Industry-leading frameworks and modern database engines powering resilient digital solutions.
          </p>
        </div>

        <div className="ts-grid">
          {stackCategories.map((cat, idx) => (
            <div key={idx} className="ts-card" style={{ '--ts-color': cat.color }}>
              <div className="ts-card-header">
                <div className="ts-icon" style={{ background: `${cat.color}15`, color: cat.color, border: `1px solid ${cat.color}25` }}>
                  {cat.icon}
                </div>
                <h3 className="ts-card-title">{cat.title}</h3>
              </div>
              <div className="ts-badges">
                {cat.items.map((item, itemIdx) => (
                  <span key={itemIdx} className="ts-badge">{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .ts-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }
        @media (max-width: 700px) {
          .ts-grid { grid-template-columns: 1fr; }
        }
        .ts-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 28px 24px;
          transition: all 0.35s ease;
        }
        .ts-card:hover {
          border-color: var(--ts-color, var(--primary));
          transform: translateY(-3px);
          box-shadow: 0 12px 32px -8px rgba(0,0,0,0.1);
        }
        .ts-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        .ts-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .ts-card-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .ts-badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .ts-badge {
          font-size: 0.82rem;
          padding: 6px 14px;
          border-radius: 50px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          font-weight: 600;
          transition: all 0.2s ease;
        }
        .ts-badge:hover {
          border-color: var(--ts-color, var(--primary));
          color: var(--text-primary);
        }
      `}</style>
    </section>
  );
}
