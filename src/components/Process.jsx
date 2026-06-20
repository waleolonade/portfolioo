import React from 'react';
import { Search, Map, Layout, Code2, ShieldAlert, Rocket } from 'lucide-react';

export default function Process() {
  const steps = [
    { icon: <Search size={20} />, title: "Discovery", desc: "We analyze project parameters, compile objectives, and establish estimate projections.", color: '#6366f1' },
    { icon: <Map size={20} />, title: "Planning", desc: "Technical design blueprints, database schemas, and API endpoint integration maps.", color: '#14b8a6' },
    { icon: <Layout size={20} />, title: "Design", desc: "User interface prototypes, interactive Figma wireframes, and UX accessibility checks.", color: '#f59e0b' },
    { icon: <Code2 size={20} />, title: "Development", desc: "Sprint execution with typed codebases, backend layers, and mobile module deployment.", color: '#8b5cf6' },
    { icon: <ShieldAlert size={20} />, title: "Testing", desc: "Unit checks, API load tests, performance benchmarks, and security audits.", color: '#ec4899' },
    { icon: <Rocket size={20} />, title: "Deployment", desc: "Production cloud orchestration, search indexing, and CI/CD pipeline setup.", color: '#3b82f6' }
  ];

  return (
    <section id="process" className="section" style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: '12px' }}>
            How We Work
          </span>
          <h2 className="section-title" style={{ marginBottom: '16px' }}>Our Engineering Process</h2>
          <p className="section-subtitle" style={{ marginBottom: 0 }}>
            Six structured phases to guarantee zero-regression deployments and reliable timelines.
          </p>
        </div>

        <div className="process-timeline">
          {steps.map((step, idx) => (
            <div key={idx} className="process-step" style={{ '--step-color': step.color }}>
              <div className="process-number-col">
                <div className="process-number" style={{ background: `${step.color}15`, border: `2px solid ${step.color}40`, color: step.color }}>
                  {String(idx + 1).padStart(2, '0')}
                </div>
                {idx < steps.length - 1 && <div className="process-line" />}
              </div>
              <div className="process-card">
                <div className="process-icon" style={{ background: `${step.color}12`, color: step.color }}>
                  {step.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>{step.title}</h3>
                  <p style={{ fontSize: '0.87rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{step.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .process-timeline {
          max-width: 700px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
        }
        .process-step {
          display: flex;
          gap: 24px;
        }
        .process-number-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 48px;
          flex-shrink: 0;
        }
        .process-number {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: 800;
          flex-shrink: 0;
        }
        .process-line {
          width: 2px;
          flex-grow: 1;
          background: linear-gradient(to bottom, var(--border), transparent);
          min-height: 20px;
        }
        .process-card {
          flex-grow: 1;
          display: flex;
          gap: 16px;
          align-items: flex-start;
          padding: 0 0 32px;
        }
        .process-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        @media (max-width: 600px) {
          .process-step { gap: 16px; }
          .process-card { flex-direction: column; gap: 12px; }
        }
      `}</style>
    </section>
  );
}
