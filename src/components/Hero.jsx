import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Zap, Users, Award, Rocket, ChevronDown } from 'lucide-react';
import { API_BASE_URL } from '../config';

/* ─── Animated Counter Hook ─── */
function useCountUp(target, duration = 2000, startOnMount = true) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!startOnMount) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = performance.now();
          const animate = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration, startOnMount]);

  return { count, ref };
}

/* ─── Typing Animation Hook ─── */
function useTypingEffect(phrases, typingSpeed = 80, pauseTime = 2000) {
  const [displayText, setDisplayText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];
    let timeout;

    if (!isDeleting && charIndex < currentPhrase.length) {
      timeout = setTimeout(() => {
        setDisplayText(currentPhrase.slice(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, typingSpeed);
    } else if (!isDeleting && charIndex === currentPhrase.length) {
      timeout = setTimeout(() => setIsDeleting(true), pauseTime);
    } else if (isDeleting && charIndex > 0) {
      timeout = setTimeout(() => {
        setDisplayText(currentPhrase.slice(0, charIndex - 1));
        setCharIndex(charIndex - 1);
      }, typingSpeed / 2);
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setPhraseIndex((phraseIndex + 1) % phrases.length);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, phraseIndex, phrases, typingSpeed, pauseTime]);

  return displayText;
}

/* ─── Floating Particles Canvas ─── */
function ParticleField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let particles = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    // Create particles
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.5 + 0.1,
        color: Math.random() > 0.5 ? '99, 102, 241' : '20, 184, 166'
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      particles.forEach((p, i) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = canvas.offsetWidth;
        if (p.x > canvas.offsetWidth) p.x = 0;
        if (p.y < 0) p.y = canvas.offsetHeight;
        if (p.y > canvas.offsetHeight) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
        ctx.fill();

        // Draw connections between nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const dx = p.x - particles[j].x;
          const dy = p.y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  );
}

/* ─── HERO COMPONENT ─── */
export default function Hero({ cms = {} }) {
  const typingPhrases = [
    'Websites & Web Apps',
    'Mobile Applications',
    'E-commerce Platforms',
    'School Portals',
    'Custom Software',
    'Backend APIs'
  ];

  const typedText = useTypingEffect(typingPhrases, 70, 1800);

  const stat1 = useCountUp(20, 2000);
  const stat2 = useCountUp(180, 2200);
  const stat3 = useCountUp(8, 1800);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="hero-section">
      <ParticleField />

      {/* Gradient orbs */}
      <div className="hero-orb hero-orb--primary" />
      <div className="hero-orb hero-orb--secondary" />

      <div className="container hero-inner">
        <div className="hero-grid">

          {/* ─── Left Column: Copy ─── */}
          <div className="hero-text-col">
            <div className="hero-badge">
              <Rocket size={14} />
              <span>Building Websites, Mobile Apps & Digital Solutions That Drive Growth</span>
            </div>

            <h1 className="hero-headline">
              {cms.home_hero_title || 'Transform Your Ideas Into Powerful'}{' '}
              <span className="hero-gradient-text">Digital Solutions</span>
            </h1>

            <p className="hero-subline">
              We build{' '}
              <span className="hero-typed-text">
                {typedText}
                <span className="hero-cursor">|</span>
              </span>
            </p>

            <p className="hero-description">
              {cms.home_hero_subtitle || 'Professional Website Development, Mobile App Development, UI/UX Design, Backend APIs, Networking & IT Solutions — tailored for businesses that demand quality.'}
            </p>

            {/* CTAs */}
            <div className="hero-btns-wrapper">
              <button onClick={() => scrollToSection('projects')} className="btn btn-primary hero-cta-primary">
                {cms.home_hero_cta_primary || 'View Our Work'} <ArrowRight size={16} />
              </button>
              <button onClick={() => scrollToSection('contact')} className="btn btn-outline hero-cta-secondary">
                {cms.home_hero_cta_secondary || 'Get a Free Quote'}
              </button>
            </div>

            {/* Trust line */}
            <div className="hero-trust-line">
              <div className="hero-trust-avatars">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=60&q=80" alt="Client" />
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=60&q=80" alt="Client" />
                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=60&q=80" alt="Client" />
              </div>
              <span>{cms.home_trusted_by_title || <>Trusted by <strong>20+ clients</strong> & engineering teams</>}</span>
            </div>
          </div>

          {/* ─── Right Column: Code Terminal Visual ─── */}
          <div className="hero-visual-col">
            <div className="hero-terminal">
              <div className="hero-terminal-bar">
                <div className="hero-terminal-dots">
                  <span style={{ background: '#ef4444' }} />
                  <span style={{ background: '#f59e0b' }} />
                  <span style={{ background: '#22c55e' }} />
                </div>
                <span className="hero-terminal-title">brainfeels-tech — project</span>
              </div>
              <div className="hero-terminal-body">
                <div className="hero-code-line"><span className="code-keyword">const</span> <span className="code-var">project</span> = <span className="code-keyword">await</span> <span className="code-fn">createApp</span>({'{'}</div>
                <div className="hero-code-line hero-code-indent"><span className="code-prop">client</span>: <span className="code-string">"Your Business"</span>,</div>
                <div className="hero-code-line hero-code-indent"><span className="code-prop">stack</span>: [<span className="code-string">"React"</span>, <span className="code-string">"Node.js"</span>, <span className="code-string">"MySQL"</span>],</div>
                <div className="hero-code-line hero-code-indent"><span className="code-prop">features</span>: [</div>
                <div className="hero-code-line hero-code-indent2"><span className="code-string">"responsive_design"</span>,</div>
                <div className="hero-code-line hero-code-indent2"><span className="code-string">"payment_gateway"</span>,</div>
                <div className="hero-code-line hero-code-indent2"><span className="code-string">"admin_dashboard"</span>,</div>
                <div className="hero-code-line hero-code-indent"><span>],</span></div>
                <div className="hero-code-line hero-code-indent"><span className="code-prop">quality</span>: <span className="code-string">"enterprise_grade"</span>,</div>
                <div className="hero-code-line">{'}'});</div>
                <div className="hero-code-line" style={{ marginTop: '8px' }}><span className="code-comment">// ✓ Deployed successfully</span></div>
                <div className="hero-code-line"><span className="code-keyword">console</span>.<span className="code-fn">log</span>(<span className="code-string">"🚀 Project live!"</span>);</div>
              </div>

              {/* Floating tech badges on the terminal */}
              <div className="hero-float-badge hero-float-badge--1">React</div>
              <div className="hero-float-badge hero-float-badge--2">Node.js</div>
              <div className="hero-float-badge hero-float-badge--3">MySQL</div>
              <div className="hero-float-badge hero-float-badge--4">AWS</div>
            </div>
          </div>

        </div>

        {/* ─── Statistics Counter Row ─── */}
        <div className="hero-stats-grid" ref={stat1.ref}>
          <div className="hero-stat-item">
            <div className="hero-stat-icon"><Users size={20} /></div>
            <div>
              <strong className="hero-stat-value">{stat1.count}+</strong>
              <span className="hero-stat-label">Happy Clients</span>
            </div>
          </div>
          <div className="hero-stat-item" ref={stat2.ref}>
            <div className="hero-stat-icon"><Zap size={20} /></div>
            <div>
              <strong className="hero-stat-value">{stat2.count}+</strong>
              <span className="hero-stat-label">Deployments</span>
            </div>
          </div>
          <div className="hero-stat-item" ref={stat3.ref}>
            <div className="hero-stat-icon"><Award size={20} /></div>
            <div>
              <strong className="hero-stat-value">{stat3.count}+</strong>
              <span className="hero-stat-label">Years Experience</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="hero-scroll-indicator" onClick={() => scrollToSection('services')}>
          <ChevronDown size={20} />
        </div>
      </div>

      <style>{`
        .hero-section {
          position: relative;
          min-height: calc(100vh - 72px);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          padding: 60px 0 30px;
          background: var(--bg-primary);
        }
        .hero-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
          z-index: 0;
        }
        .hero-orb--primary {
          width: 500px;
          height: 500px;
          top: -100px;
          right: -100px;
          background: rgba(99, 102, 241, 0.12);
        }
        .hero-orb--secondary {
          width: 400px;
          height: 400px;
          bottom: -50px;
          left: -100px;
          background: rgba(20, 184, 166, 0.08);
        }
        .hero-inner {
          position: relative;
          z-index: 1;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          border-radius: 50px;
          background: rgba(99, 102, 241, 0.08);
          border: 1px solid rgba(99, 102, 241, 0.15);
          color: var(--primary);
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: 24px;
          width: fit-content;
          animation: fadeInDown 0.6s ease-out;
        }
        .hero-headline {
          font-size: clamp(2.2rem, 5vw, 3.5rem);
          font-weight: 800;
          line-height: 1.12;
          letter-spacing: -0.03em;
          margin-bottom: 20px;
          color: var(--text-primary);
          animation: fadeInUp 0.7s ease-out;
        }
        .hero-gradient-text {
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-subline {
          font-size: 1.3rem;
          color: var(--text-secondary);
          margin-bottom: 16px;
          min-height: 2rem;
          animation: fadeInUp 0.8s ease-out;
        }
        .hero-typed-text {
          color: var(--primary);
          font-weight: 700;
        }
        .hero-cursor {
          animation: blink 0.8s infinite;
          color: var(--primary);
          font-weight: 300;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .hero-description {
          font-size: 1.05rem;
          color: var(--text-secondary);
          line-height: 1.7;
          max-width: 560px;
          margin-bottom: 32px;
          animation: fadeInUp 0.9s ease-out;
        }
        .hero-cta-primary {
          padding: 14px 30px !important;
          font-size: 0.95rem !important;
          border-radius: 10px !important;
        }
        .hero-cta-secondary {
          padding: 14px 30px !important;
          font-size: 0.95rem !important;
          border-radius: 10px !important;
        }
        .hero-trust-line {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 32px;
          font-size: 0.85rem;
          color: var(--text-muted);
          animation: fadeInUp 1.1s ease-out;
        }
        .hero-trust-avatars {
          display: flex;
          margin-right: 4px;
        }
        .hero-trust-avatars img {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--bg-primary);
          margin-left: -8px;
        }
        .hero-trust-avatars img:first-child {
          margin-left: 0;
        }
        .hero-trust-line strong {
          color: var(--text-primary);
        }

        /* ─── Code Terminal ─── */
        .hero-visual-col {
          display: flex;
          justify-content: center;
          align-items: center;
          animation: fadeInRight 0.9s ease-out;
        }
        .hero-terminal {
          position: relative;
          width: 100%;
          max-width: 460px;
          border-radius: 16px;
          overflow: visible;
          background: #0c1222;
          border: 1px solid rgba(99, 102, 241, 0.15);
          box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.5), 0 0 40px rgba(99, 102, 241, 0.08);
        }
        .hero-terminal-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: #111827;
          border-bottom: 1px solid #1e293b;
          border-radius: 16px 16px 0 0;
        }
        .hero-terminal-dots {
          display: flex;
          gap: 6px;
        }
        .hero-terminal-dots span {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .hero-terminal-title {
          font-size: 0.72rem;
          color: #64748b;
          font-family: 'Courier New', monospace;
        }
        .hero-terminal-body {
          padding: 20px;
          font-family: 'Courier New', monospace;
          font-size: 0.82rem;
          line-height: 1.7;
          color: #cbd5e1;
        }
        .hero-code-line {
          white-space: nowrap;
        }
        .hero-code-indent { padding-left: 24px; }
        .hero-code-indent2 { padding-left: 48px; }
        .code-keyword { color: #c084fc; }
        .code-var { color: #38bdf8; }
        .code-fn { color: #fbbf24; }
        .code-prop { color: #67e8f9; }
        .code-string { color: #86efac; }
        .code-comment { color: #475569; font-style: italic; }

        /* Floating tech badges */
        .hero-float-badge {
          position: absolute;
          padding: 5px 14px;
          border-radius: 20px;
          font-size: 0.72rem;
          font-weight: 700;
          background: rgba(99, 102, 241, 0.12);
          border: 1px solid rgba(99, 102, 241, 0.2);
          color: #a5b4fc;
          backdrop-filter: blur(8px);
          z-index: 2;
        }
        .hero-float-badge--1 {
          top: -12px;
          right: -20px;
          animation: floatBadge 4s ease-in-out infinite;
          background: rgba(56, 189, 248, 0.12);
          border-color: rgba(56, 189, 248, 0.25);
          color: #7dd3fc;
        }
        .hero-float-badge--2 {
          bottom: 60px;
          right: -28px;
          animation: floatBadge 4.5s ease-in-out infinite 0.5s;
          background: rgba(74, 222, 128, 0.12);
          border-color: rgba(74, 222, 128, 0.25);
          color: #86efac;
        }
        .hero-float-badge--3 {
          bottom: 20px;
          left: -24px;
          animation: floatBadge 3.8s ease-in-out infinite 1s;
          background: rgba(251, 191, 36, 0.12);
          border-color: rgba(251, 191, 36, 0.25);
          color: #fde68a;
        }
        .hero-float-badge--4 {
          top: 30px;
          left: -30px;
          animation: floatBadge 5s ease-in-out infinite 0.3s;
          background: rgba(245, 158, 11, 0.12);
          border-color: rgba(245, 158, 11, 0.25);
          color: #fcd34d;
        }
        @keyframes floatBadge {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        /* ─── Stats Row ─── */
        .hero-stat-item {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .hero-stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(20, 184, 166, 0.08));
          border: 1px solid rgba(99, 102, 241, 0.1);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .hero-stat-value {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--text-primary);
          display: block;
          line-height: 1.1;
        }
        .hero-stat-label {
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        /* Scroll indicator */
        .hero-scroll-indicator {
          margin: 30px auto 0;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          cursor: pointer;
          animation: bounceDown 2s infinite;
          transition: var(--transition);
        }
        .hero-scroll-indicator:hover {
          border-color: var(--primary);
          color: var(--primary);
        }
        @keyframes bounceDown {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }

        /* ─── Animations ─── */
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }

        /* ─── Responsive ─── */
        @media (max-width: 768px) {
          .hero-visual-col {
            order: -1;
          }
          .hero-terminal {
            max-width: 340px;
          }
          .hero-float-badge {
            display: none;
          }
          .hero-badge span {
            font-size: 0.72rem;
          }
          .hero-trust-line {
            flex-direction: column;
            text-align: center;
          }
          .hero-trust-avatars {
            justify-content: center;
          }
        }
      `}</style>
    </section>
  );
}
