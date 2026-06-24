import { ArrowRight } from 'lucide-react';

export default function CtaBlock({ cms = {} }) {
  const scrollToContact = () => {
    const el = document.getElementById('contact');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="cta-premium-section">
      {/* Animated background shapes for mesh gradient effect */}
      <div className="cta-bg-shape cta-bg-shape--1" />
      <div className="cta-bg-shape cta-bg-shape--2" />
      <div className="cta-bg-shape cta-bg-shape--3" />

      <div className="container" style={{ position: 'relative', zIndex: 1, padding: '0 20px' }}>
        <div className="cta-container-inner">
          <span className="cta-eyebrow">Let's Build Together</span>
          <h2 className="cta-headline">{cms.home_cta_title || 'Ready to Build Your Next\nDigital Product?'}</h2>
          <p className="cta-desc">
            {cms.home_cta_subtitle || 'Get in touch with our engineering team today. We\'ll map your requirements and deliver a detailed prototype cost estimate — completely free.'}
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={scrollToContact} className="btn cta-btn-primary">
              Start Your Project <ArrowRight size={16} />
            </button>
            <a href={cms.whatsapp_link || 'https://wa.me/2348061657738'} target="_blank" rel="noopener noreferrer" className="btn cta-btn-outline">
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>

      <style>{`
        .cta-premium-section {
          position: relative;
          overflow: hidden;
          padding: 100px 0;
          background-color: var(--bg-primary, #ffffff);
        }
        .cta-bg-shape {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(80px);
          opacity: 0.15;
          z-index: 0;
        }
        .cta-bg-shape--1 {
          width: 500px;
          height: 500px;
          top: -150px;
          left: -100px;
          background: var(--primary, #4f46e5);
          animation: float 10s ease-in-out infinite alternate;
        }
        .cta-bg-shape--2 {
          width: 400px;
          height: 400px;
          bottom: -100px;
          right: -50px;
          background: var(--secondary, #0d9488);
          animation: float 12s ease-in-out infinite alternate-reverse;
        }
        .cta-bg-shape--3 {
          width: 300px;
          height: 300px;
          top: 30%;
          left: 50%;
          transform: translateX(-50%);
          background: var(--accent, #f59e0b);
          animation: pulse 8s ease-in-out infinite;
          opacity: 0.1;
        }
        @keyframes float {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(40px, 40px) scale(1.1); }
        }
        @keyframes pulse {
          0% { transform: scale(1) translateX(-50%); opacity: 0.08; }
          50% { transform: scale(1.1) translateX(-45%); opacity: 0.15; }
          100% { transform: scale(1) translateX(-50%); opacity: 0.08; }
        }
        .cta-container-inner {
          position: relative;
          text-align: center;
          background: rgba(128, 128, 128, 0.03);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(128, 128, 128, 0.1);
          padding: 60px 40px;
          border-radius: 24px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.03);
          max-width: 800px;
          margin: 0 auto;
        }
        .cta-eyebrow {
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--primary, #4f46e5);
          display: block;
          margin-bottom: 16px;
        }
        .cta-headline {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          margin: 0 0 20px;
          line-height: 1.2;
          color: var(--text-primary, #1e293b);
          white-space: pre-line;
        }
        .cta-desc {
          font-size: 1.15rem;
          color: var(--text-secondary, #64748b);
          max-width: 600px;
          margin: 0 auto 36px;
          line-height: 1.6;
        }
        .cta-btn-primary {
          background: var(--primary, #4f46e5) !important;
          color: #ffffff !important;
          border: none !important;
          padding: 14px 32px !important;
          font-weight: 700 !important;
          border-radius: 12px !important;
          font-size: 0.95rem !important;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .cta-btn-primary:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 12px 24px rgba(79, 70, 229, 0.25) !important;
        }
        .cta-btn-outline {
          background: transparent !important;
          color: var(--text-primary, #1e293b) !important;
          border: 2px solid var(--border, #e2e8f0) !important;
          padding: 14px 32px !important;
          font-weight: 700 !important;
          border-radius: 12px !important;
          font-size: 0.95rem !important;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .cta-btn-outline:hover {
          border-color: var(--primary, #4f46e5) !important;
          background: rgba(79, 70, 229, 0.05) !important;
        }
        @media (max-width: 768px) {
          .cta-container-inner {
            padding: 40px 20px;
          }
          .cta-headline {
            font-size: 2.2rem;
          }
        }
      `}</style>
    </section>
  );
}
