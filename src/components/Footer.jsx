import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';

const GithubIcon = ({ size = 20 }) => (
  <svg 
    viewBox="0 0 24 24" 
    width={size} 
    height={size} 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = ({ size = 20 }) => (
  <svg 
    viewBox="0 0 24 24" 
    width={size} 
    height={size} 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function Footer({ cms = {} }) {
  const logoText = cms.site_logo_text || 'Brainfeels Tech';

  return (
    <footer style={{ 
      backgroundColor: 'var(--bg-secondary)', 
      borderTop: '1px solid var(--border)', 
      padding: '60px 0 20px', 
      color: 'var(--text-secondary)' 
    }}>
      <div className="container">
        
        {/* Multi-column grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '40px',
          marginBottom: '40px',
          textAlign: 'left'
        }}>
          
          {/* Column 1: Company Brand */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <span style={{ 
              fontWeight: 800, 
              fontSize: '1.25rem', 
              letterSpacing: '-0.02em', 
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              display: 'block' 
            }}>
              {logoText}
            </span>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-muted)' }}>
              {cms.company_story || 'Brainfeels Tech helps businesses design, develop, and scale high-performance digital products and cloud-native solutions.'}
            </p>
            <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
              <a href="https://github.com/waleolonade" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)' }}>
                <GithubIcon size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)' }}>
                <LinkedinIcon size={20} />
              </a>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
              <li><Link to="/" style={{ color: 'var(--text-muted)' }}>Home</Link></li>
              <li><Link to="/about" style={{ color: 'var(--text-muted)' }}>About Us</Link></li>
              <li><Link to="/services" style={{ color: 'var(--text-muted)' }}>Services</Link></li>
              <li><Link to="/portfolio" style={{ color: 'var(--text-muted)' }}>Case Studies</Link></li>
              <li><Link to="/careers" style={{ color: 'var(--text-muted)' }}>Careers</Link></li>
              <li><Link to="/portal" style={{ color: 'var(--text-muted)' }}>Client Portal</Link></li>
            </ul>
          </div>

          {/* Column 3: Services Overview */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Services
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
              <li><Link to="/services" style={{ color: 'var(--text-muted)' }}>Web Development</Link></li>
              <li><Link to="/services" style={{ color: 'var(--text-muted)' }}>Mobile Apps</Link></li>
              <li><Link to="/services" style={{ color: 'var(--text-muted)' }}>UI/UX Design</Link></li>
              <li><Link to="/services" style={{ color: 'var(--text-muted)' }}>Backend APIs</Link></li>
              <li><Link to="/services" style={{ color: 'var(--text-muted)' }}>IT Solutions</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Contact HQ
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem' }}>
              <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <MapPin size={16} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                <span style={{ color: 'var(--text-muted)' }}>{cms.contact_address || 'Lagos, Nigeria'}</span>
              </li>
              <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Mail size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <a href={`mailto:${cms.contact_email || 'brainfeelstech@gmail.com'}`} style={{ color: 'var(--text-muted)' }}>{cms.contact_email || 'brainfeelstech@gmail.com'}</a>
              </li>
              <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Phone size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <a href={`tel:${cms.contact_phone || '08061657738'}`} style={{ color: 'var(--text-muted)' }}>{cms.contact_phone || '08061657738'}</a>
              </li>
              <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <MessageCircle size={16} style={{ color: '#25D366', flexShrink: 0 }} />
                <a href={cms.whatsapp_link || 'https://wa.me/2348061657738'} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)' }}>WhatsApp Chat</a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright bar */}
        <div style={{ 
          borderTop: '1px solid var(--border)', 
          paddingTop: '20px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.85rem',
          color: 'var(--text-muted)'
        }}>
          <p>© {new Date().getFullYear()} {logoText}. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link to="/portal" style={{ color: 'var(--text-muted)' }}>Admin Login</Link>
            <Link to="/" style={{ color: 'var(--text-muted)' }}>Privacy Policy</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
