import React from 'react';
import { Shield, Sparkles, Cpu, BadgeCheck, Users, HelpCircle } from 'lucide-react';

export default function WhyChooseUs({ cms = {} }) {
  const cards = [
    { title: 'Rigorous Engineering', desc: 'Every codebase is built following strict static analysis, unit checks, and clean routing standards.', icon: <Cpu size={20} /> },
    { title: 'Rapid Delivery Cycles', desc: 'Using decoupled micro-architectures enables faster visual prototype deployments and testing loops.', icon: <Sparkles size={20} /> },
    { title: 'Role-Based Security Gates', desc: 'Enforcing zero-trust controls, secure JWT authorizations, and CORS protection natively.', icon: <Shield size={20} /> },
    { title: 'SLA Support Contracts', desc: 'Optional continuous maintenance packages covering performance optimizations and server backups.', icon: <BadgeCheck size={20} /> }
  ];

  return (
    <section className="section" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div className="container">
        <h2 className="section-title">{cms.home_why_us_title || 'Why Brainfeels Tech'}</h2>
        <p className="section-subtitle">{cms.home_why_us_subtitle || 'We build resilient digital products designed to accelerate operations with zero downtime anomalies.'}</p>
        
        <div className="grid grid-2">
          {cards.map((card, idx) => (
            <div key={idx} className="card" style={{ display: 'flex', gap: '20px', textAlign: 'left', alignItems: 'flex-start' }}>
              <div style={{
                color: 'var(--primary)',
                padding: '8px',
                borderRadius: '8px',
                backgroundColor: 'rgba(var(--primary-rgb), 0.06)',
                flexShrink: 0
              }}>
                {card.icon}
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
                  {card.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
