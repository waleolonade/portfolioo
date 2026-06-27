import {
    ArrowRight,
    Code,
    Compass,
    HeartHandshake, HelpCircle,
    Server,
    ShoppingCart,
    Smartphone,
    Terminal,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const iconMap = {
  Code: <Code size={24} />,
  Smartphone: <Smartphone size={24} />,
  Compass: <Compass size={24} />,
  Zap: <Zap size={24} />,
  ShoppingCart: <ShoppingCart size={24} />,
  Terminal: <Terminal size={24} />,
  Server: <Server size={24} />,
  HeartHandshake: <HeartHandshake size={24} />
};

// Solid color for each service card icon
const gradientColors = [
  ['#6366f1', '#818cf8'],
  ['#14b8a6', '#2dd4bf'],
  ['#f59e0b', '#fbbf24'],
  ['#8b5cf6', '#a78bfa'],
  ['#ec4899', '#f472b6'],
  ['#3b82f6', '#60a5fa'],
  ['#10b981', '#34d399'],
  ['#f43f5e', '#fb7185'],
];

const fallbackServices = [
  { id: 'f1', icon_name: 'Code', name: "Website Development", description: "Business websites, e-commerce platforms, corporate sites, law firms, school portals, construction & logistics websites." },
  { id: 'f2', icon_name: 'Smartphone', name: "Mobile App Development", description: "Android & iOS apps, cross-platform solutions built on React Native & Expo for seamless mobile experiences." },
  { id: 'f3', icon_name: 'Compass', name: "UI/UX Design", description: "User interface design, user experience optimization, interactive prototypes and wireframes." },
  { id: 'f4', icon_name: 'Zap', name: "Backend Development & API Integration", description: "PHP, Node.js development, SQL databases, API integration, high-throughput secure RESTful backends." },
  { id: 'f5', icon_name: 'ShoppingCart', name: "E-commerce Solutions", description: "Online stores, payment gateway integration, product management, order tracking systems." },
  { id: 'f6', icon_name: 'Terminal', name: "Software & Web Applications", description: "Result checker systems, school management portals, booking systems, business automation tools." },
  { id: 'f7', icon_name: 'Server', name: "Networking & IT Solutions", description: "Network infrastructure, system configuration, IT support services, business automations." },
  { id: 'f8', icon_name: 'HeartHandshake', name: "Maintenance & Support", description: "Technical support, security updates, routine system maintenance, 24/7 coverage." }
];

export default function Services({ cms = {} }) {
  const [services, setServices] = useState(fallbackServices);
  const [hoveredIdx, setHoveredIdx] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/services.php`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setServices(data);
        }
      })
      .catch(err => {
        console.error('Failed to load services dynamically, running on static presets.', err);
      });
  }, []);

  return (
    <section id="services" className="section" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <span style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            color: 'var(--primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            display: 'block',
            marginBottom: '12px'
          }}>{cms.home_services_subtitle || 'What We Do'}</span>
          <h2 className="section-title" style={{ marginBottom: '16px' }}>{cms.home_services_title || 'Our Core Services'}</h2>
          <p className="section-subtitle" style={{ marginBottom: 0 }}>
            {cms.home_services_description || 'Comprehensive digital solutions designed to help businesses grow, scale, and operate efficiently.'}
          </p>
        </div>
        
        <div className="services-grid-premium">
          {services.map((service, index) => {
            const [color1, color2] = gradientColors[index % gradientColors.length];
            const isHovered = hoveredIdx === index;
            
            return (
              <div
                key={service.id || index}
                className="service-card-premium"
                onMouseEnter={() => setHoveredIdx(index)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  '--card-accent': color1,
                  '--card-accent-light': color2,
                }}
              >
                {/* Gradient glow on hover */}
                <div className="service-card-glow" style={{
                  background: `${color1}15`,
                  opacity: isHovered ? 1 : 0
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div className="service-icon-wrapper" style={{
                    background: `${color1}18`,
                    border: `1px solid ${color1}25`,
                    color: color1
                  }}>
                    {iconMap[service.icon_name] || <HelpCircle size={24} />}
                  </div>
                  <h3 className="service-card-title">{service.name}</h3>
                  <p className="service-card-desc">{service.description}</p>
                </div>

                <Link to="/services" className="service-card-link" style={{ '--link-color': color1 }}>
                  Learn More <ArrowRight size={14} />
                </Link>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <Link to="/services" className="btn btn-primary" style={{ padding: '14px 32px', borderRadius: '10px' }}>
            Explore All Services <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <style>{`
        .services-grid-premium {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        @media (max-width: 1024px) {
          .services-grid-premium {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 600px) {
          .services-grid-premium {
            grid-template-columns: 1fr;
          }
        }
        .service-card-premium {
          position: relative;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 28px 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 260px;
          overflow: hidden;
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: default;
        }
        .service-card-premium:hover {
          transform: translateY(-6px);
          border-color: var(--card-accent, var(--primary));
          box-shadow: 0 20px 40px -12px rgba(0,0,0,0.15), 0 0 0 1px var(--card-accent, var(--primary));
        }
        .service-card-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }
        .service-icon-wrapper {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          transition: transform 0.3s ease;
        }
        .service-card-premium:hover .service-icon-wrapper {
          transform: scale(1.08);
        }
        .service-card-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 10px;
          line-height: 1.3;
        }
        .service-card-desc {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.55;
          margin-bottom: 16px;
        }
        .service-card-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--link-color, var(--primary));
          margin-top: auto;
          position: relative;
          z-index: 1;
          transition: gap 0.3s ease;
        }
        .service-card-link:hover {
          gap: 10px;
        }
      `}</style>
    </section>
  );
}
