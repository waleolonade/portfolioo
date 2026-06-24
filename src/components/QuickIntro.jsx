import { FileCode2, Layers, Palette, ShieldCheck, Cpu, Globe } from 'lucide-react';

export default function QuickIntro({ cms = {} }) {
  const strengths = [
    {
      icon: <FileCode2 size={22} />,
      title: "Clean Code Standards",
      desc: "Every repository follows strict typing, thorough documentation, and modular conventions that scale.",
      color: '#6366f1'
    },
    {
      icon: <Layers size={22} />,
      title: "Scalable Architecture",
      desc: "Decoupled micro-services, load balancers, and containerized deployments built for enterprise growth.",
      color: '#14b8a6'
    },
    {
      icon: <Palette size={22} />,
      title: "Premium UI/UX",
      desc: "Beautiful interfaces with glassmorphism, responsive grids, and hardware-accelerated animations.",
      color: '#f59e0b'
    },
    {
      icon: <ShieldCheck size={22} />,
      title: "Security-First",
      desc: "Zero-trust controls, JWT authorization gates, encrypted data pipelines, and CORS protection.",
      color: '#8b5cf6'
    },
    {
      icon: <Cpu size={22} />,
      title: "Performance Tuned",
      desc: "Optimized database queries, CDN delivery, lazy loading, and sub-second response times.",
      color: '#ec4899'
    },
    {
      icon: <Globe size={22} />,
      title: "Global Deployment",
      desc: "Cloud-native deploys on AWS, GCP, and DigitalOcean with CI/CD pipeline automation.",
      color: '#3b82f6'
    }
  ];

  return (
    <section className="section" style={{ backgroundColor: 'var(--bg-primary)', borderTop: '1px solid var(--border)', padding: '80px 0' }}>
      <div className="container">
        <div className="qi-header">
          <span className="qi-eyebrow">{cms.home_intro_title || 'Who We Are'}</span>
          <h2 className="qi-title">{cms.home_intro_subtitle || 'Architecting the Future of Digital Innovation'}</h2>
          <p className="qi-subtitle">
            {cms.home_intro_description || 'Brainfeels Tech is a premier software engineering agency dedicated to crafting high-performance, future-proof digital solutions. We partner with forward-thinking businesses globally to design, develop, and deploy enterprise-grade applications. By combining cutting-edge technology stacks with robust cloud infrastructure, we deliver secure, scalable, and seamless digital experiences that drive measurable business growth.'}
          </p>
        </div>

        <div className="qi-grid">
          {strengths.map((item, idx) => (
            <div key={idx} className="qi-card" style={{ '--qi-accent': item.color }}>
              <div className="qi-icon-wrap" style={{ 
                background: `${item.color}12`, 
                border: `1px solid ${item.color}20`,
                color: item.color 
              }}>
                {item.icon}
              </div>
              <h3 className="qi-card-title">{item.title}</h3>
              <p className="qi-card-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .qi-header {
          max-width: 700px;
          margin-bottom: 52px;
        }
        .qi-eyebrow {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--primary);
          text-transform: uppercase;
          letter-spacing: 0.12em;
          display: block;
          margin-bottom: 12px;
        }
        .qi-title {
          font-size: 2.2rem;
          font-weight: 800;
          line-height: 1.2;
          letter-spacing: -0.025em;
          color: var(--text-primary);
          margin-bottom: 16px;
        }
        .qi-subtitle {
          font-size: 1.05rem;
          color: var(--text-secondary);
          line-height: 1.7;
          text-align: justify;
          text-justify: inter-word;
        }
        .qi-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        @media (max-width: 900px) {
          .qi-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .qi-grid { grid-template-columns: 1fr; }
          .qi-header { text-align: center; }
        }
        .qi-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 28px 24px;
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: left;
        }
        .qi-card:hover {
          transform: translateY(-4px);
          border-color: var(--qi-accent, var(--primary));
          box-shadow: 0 12px 32px -8px rgba(0,0,0,0.12), 0 0 0 1px var(--qi-accent, var(--primary));
        }
        .qi-icon-wrap {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
          transition: transform 0.3s ease;
        }
        .qi-card:hover .qi-icon-wrap {
          transform: scale(1.08) rotate(-2deg);
        }
        .qi-card-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 8px;
        }
        .qi-card-desc {
          font-size: 0.87rem;
          color: var(--text-secondary);
          line-height: 1.55;
        }
      `}</style>
    </section>
  );
}
