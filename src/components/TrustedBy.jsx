const techs = [
  { name: 'React', color: '#61DAFB' },
  { name: 'React Native', color: '#61DAFB' },
  { name: 'Node.js', color: '#68A063' },
  { name: 'PHP', color: '#8993BE' },
  { name: 'MySQL', color: '#F29111' },
  { name: 'AWS', color: '#FF9900' },
  { name: 'Laravel', color: '#FF2D20' },
  { name: 'Expo', color: '#000020' }
];

const partners = [
  'Fintech Growth Corp',
  'Logistics Logistics',
  'CyberShield Ltd',
  'HealthStream Systems',
  'Global Retail LLC',
  'EduTech Africa',
  'PayBridge Systems'
];

export default function TrustedBy({ cms = {} }) {
  return (
    <section className="trusted-by-section">
      <div className="container">
        {/* Marquee Partners Row */}
        <div className="trusted-header">
          <div className="trusted-divider" />
          <span className="trusted-label">{cms.home_trusted_by_title || 'Trusted by 20+ clients & engineering teams'}</span>
          <div className="trusted-divider" />
        </div>

        <div className="marquee-wrapper">
          <div className="marquee-track">
            {[...partners, ...partners].map((name, idx) => (
              <span key={idx} className="marquee-item">{name}</span>
            ))}
          </div>
        </div>

        {/* Certified Stack Badges */}
        <div className="certified-stack">
          <span className="certified-label">{cms.home_trusted_by_subtitle || 'Certified Stacks'}</span>
          <div className="certified-badges">
            {techs.map((tech, idx) => (
              <span key={idx} className="certified-badge" style={{ '--badge-color': tech.color }}>
                <span className="certified-dot" style={{ background: tech.color }} />
                {tech.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .trusted-by-section {
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border);
          padding: 40px 0;
          overflow: hidden;
        }
        .trusted-header {
          display: flex;
          align-items: center;
          gap: 16px;
          justify-content: center;
          margin-bottom: 24px;
        }
        .trusted-divider {
          height: 1px;
          flex: 1;
          max-width: 120px;
          background: var(--border);
        }
        .trusted-label {
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--primary);
          text-transform: uppercase;
          letter-spacing: 0.12em;
          white-space: nowrap;
        }

        /* Marquee */
        .marquee-wrapper {
          overflow: hidden;
          mask-image: linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%);
          margin-bottom: 28px;
        }
        .marquee-track {
          display: flex;
          gap: 48px;
          animation: marqueeScroll 30s linear infinite;
          width: max-content;
        }
        .marquee-item {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: -0.02em;
          white-space: nowrap;
          opacity: 0.55;
          transition: opacity 0.3s;
        }
        .marquee-item:hover {
          opacity: 0.9;
        }
        @keyframes marqueeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* Certified Badges */
        .certified-stack {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
          padding-top: 20px;
          border-top: 1px dashed var(--border);
          max-width: 700px;
          margin: 0 auto;
        }
        .certified-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .certified-badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .certified-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          padding: 5px 14px;
          border-radius: 50px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .certified-badge:hover {
          border-color: var(--badge-color, var(--primary));
          box-shadow: 0 0 12px var(--badge-color, var(--primary))22;
        }
        .certified-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        @media (max-width: 600px) {
          .trusted-header {
            flex-direction: column;
            gap: 8px;
          }
          .trusted-divider { display: none; }
          .certified-stack {
            flex-direction: column;
          }
        }
      `}</style>
    </section>
  );
}
