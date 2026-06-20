import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function CtaBlock() {
  const scrollToContact = () => {
    const el = document.getElementById('contact');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="cta-premium-section">
      {/* Animated background shapes */}
      <div className="cta-bg-shape cta-bg-shape--1" />
      <div className="cta-bg-shape cta-bg-shape--2" />
      <div className="cta-bg-shape cta-bg-shape--3" />

      <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <span className="cta-eyebrow">Let's Build Together</span>
        <h2 className="cta-headline">Ready to Build Your Next<br />Digital Product?</h2>
        <p className="cta-desc">
          Get in touch with our engineering team today. We'll map your requirements and deliver a detailed prototype cost estimate — completely free.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={scrollToContact} className="btn cta-btn-white">
            Start Your Project <ArrowRight size={16} />
          </button>
          <a href="https://wa.me/2348061657738" target="_blank" rel="noopener noreferrer" className="btn cta-btn-outline">
            Chat on WhatsApp
          </a>
        </div>
      </div>

      <style>{`
        .cta-premium-section {
          position: relative;
          overflow: hidden;
          padding: 80px 0;
          background: linear-gradient(135deg, #4f46e5, #0d9488);
          color: white;
        }
        .cta-bg-shape {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }
        .cta-bg-shape--1 {
          width: 300px;
          height: 300px;
          top: -80px;
          left: -80px;
          background: rgba(255,255,255,0.06);
        }
        .cta-bg-shape--2 {
          width: 200px;
          height: 200px;
          bottom: -60px;
          right: -40px;
          background: rgba(255,255,255,0.04);
        }
        .cta-bg-shape--3 {
          width: 120px;
          height: 120px;
          top: 40%;
          right: 20%;
          background: rgba(255,255,255,0.03);
        }
        .cta-eyebrow {
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          opacity: 0.75;
          display: block;
          margin-bottom: 16px;
        }
        .cta-headline {
          font-size: clamp(1.8rem, 4vw, 2.5rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          margin: 0 0 20px;
          line-height: 1.2;
        }
        .cta-desc {
          font-size: 1.1rem;
          opacity: 0.9;
          max-width: 560px;
          margin: 0 auto 36px;
          line-height: 1.6;
        }
        .cta-btn-white {
          background: white !important;
          color: #4f46e5 !important;
          border: none !important;
          padding: 14px 32px !important;
          font-weight: 700 !important;
          border-radius: 10px !important;
          font-size: 0.95rem !important;
          transition: all 0.3s ease !important;
        }
        .cta-btn-white:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.2) !important;
        }
        .cta-btn-outline {
          background: transparent !important;
          color: white !important;
          border: 2px solid rgba(255,255,255,0.4) !important;
          padding: 14px 32px !important;
          font-weight: 700 !important;
          border-radius: 10px !important;
          font-size: 0.95rem !important;
          transition: all 0.3s ease !important;
        }
        .cta-btn-outline:hover {
          border-color: white !important;
          background: rgba(255,255,255,0.1) !important;
        }
      `}</style>
    </section>
  );
}
