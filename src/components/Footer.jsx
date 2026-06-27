import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { CmsContext } from '../CmsContext';
import { API_BASE_URL } from '../config';

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

const FacebookIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TwitterIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const InstagramIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const YoutubeIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

const FallbackIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const renderSocialIcon = (name) => {
  const n = name.toLowerCase();
  if (n.includes('github')) return <GithubIcon size={18} />;
  if (n.includes('linkedin')) return <LinkedinIcon size={18} />;
  if (n.includes('facebook')) return <FacebookIcon size={18} />;
  if (n.includes('twitter') || n.includes('x.com')) return <TwitterIcon size={18} />;
  if (n.includes('instagram')) return <InstagramIcon size={18} />;
  if (n.includes('youtube')) return <YoutubeIcon size={18} />;
  return <FallbackIcon size={18} />;
};

export default function Footer({ cms = {} }) {
  const contextCms = useContext(CmsContext) || {};
  const activeCms = (cms && Object.keys(cms).length > 0) ? cms : (contextCms.cms || {});
  
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ loading: false, message: '', type: '' });

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus({ loading: true, message: '', type: '' });

    try {
      const res = await fetch(`${API_BASE_URL}/newsletter.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (res.ok && (data.success || res.status === 200)) {
        setStatus({ loading: false, message: data.message || "Subscribed successfully!", type: 'success' });
        if (data.success) setEmail('');
      } else {
        setStatus({ loading: false, message: data.message || 'Subscription failed.', type: 'error' });
      }
    } catch (err) {
      setStatus({ loading: false, message: 'Network error. Please try again later.', type: 'error' });
    }
  };

  const brandAssets = (() => {
    try {
      return typeof activeCms.cms_brand_assets === 'string' ? JSON.parse(activeCms.cms_brand_assets) : activeCms.cms_brand_assets || {};
    } catch { return {}; }
  })();

  const footerLogoData = (() => {
    try {
      return typeof activeCms.cms_footer_logo === 'string' ? JSON.parse(activeCms.cms_footer_logo) : activeCms.cms_footer_logo || {};
    } catch { return {}; }
  })();

  const logoText = brandAssets.logo_text || activeCms.site_logo_text || 'Brainfeels Tech';
  const logoIcon = logoText.charAt(0);

  const renderFooterLogo = () => {
    const isDark = true;
    const fallbackLogo = isDark ? (brandAssets.logo_url_dark || brandAssets.logo_url_light) : brandAssets.logo_url_light;
    const logoSrc = footerLogoData.footer_logo_url || fallbackLogo;
    const showImg = !!footerLogoData.footer_logo_url || brandAssets.logo_type === 'image' || brandAssets.logo_type === 'both';
    const showText = brandAssets.logo_type === 'text' || brandAssets.logo_type === 'both' || !logoSrc;
    const w = footerLogoData.footer_logo_width || brandAssets.logo_width || 140;
    const h = footerLogoData.footer_logo_height || brandAssets.logo_height || 40;

    return (
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        {showImg && logoSrc && (
          <img src={logoSrc} alt={logoText} style={{ width: w ? `${w}px` : 'auto', height: h ? `${h}px` : '40px', objectFit: 'contain' }} />
        )}
        {showText && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {!(showImg && logoSrc) && (
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '8px', background: 'var(--primary)', color: 'white', fontSize: '0.85rem', fontWeight: 800, marginRight: '8px' }}>
                {logoIcon}
              </span>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
              <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', color: 'var(--primary)', display: 'block' }}>
                {logoText}
              </span>
              {brandAssets.show_tagline && brandAssets.tagline && (
                <span style={{ fontSize: '0.65rem', fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '0.05em', marginTop: '2px' }}>{brandAssets.tagline}</span>
              )}
            </div>
          </div>
        )}
      </Link>
    );
  };

  const footerBuilder = (() => {
    try {
      return typeof activeCms.cms_footer_builder === 'string'
        ? JSON.parse(activeCms.cms_footer_builder)
        : activeCms.cms_footer_builder || {};
    } catch {
      return {};
    }
  })();

  const socialManagement = (() => {
    try {
      return typeof activeCms.cms_social_management === 'string'
        ? JSON.parse(activeCms.cms_social_management)
        : activeCms.cms_social_management || {};
    } catch {
      return {};
    }
  })();

  const columnsCount = footerBuilder.columns_count || 4;
  const isNewsletterEnabled = footerBuilder.newsletter_enabled !== false;
  const isMapEnabled = footerBuilder.map_enabled !== false && !!footerBuilder.map_iframe_url;
  const networks = socialManagement.networks || [];

  return (
    <footer style={{ 
      backgroundColor: 'var(--bg-secondary)', 
      borderTop: '1px solid var(--border)', 
      padding: '60px 0 20px', 
      color: 'var(--text-secondary)' 
    }}>
      <div className="container">
        
        {/* Newsletter Section */}
        {isNewsletterEnabled && (
          <div style={{
            borderBottom: '1px solid var(--border)',
            paddingBottom: '30px',
            marginBottom: '40px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div style={{ textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {footerBuilder.newsletter_title || 'Subscribe to our Newsletter'}
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Get the latest updates, articles and engineering resources.
              </p>
            </div>
            <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '400px', width: '100%' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={footerBuilder.newsletter_placeholder || 'Enter your email address'} 
                  className="form-control"
                  style={{ flexGrow: 1 }}
                  required
                  disabled={status.loading}
                />
                <button className="btn btn-primary" type="submit" disabled={status.loading}>
                  {status.loading ? '...' : 'Subscribe'}
                </button>
              </div>
              {status.message && (
                <div style={{ 
                  fontSize: '0.85rem', 
                  color: status.type === 'success' ? 'var(--primary)' : 'var(--error)',
                  marginTop: '4px'
                }}>
                  {status.message}
                </div>
              )}
            </form>
          </div>
        )}

        {/* Dynamic Column Layout */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: `repeat(auto-fit, minmax(220px, 1fr))`, 
          gap: '40px',
          marginBottom: '40px',
          textAlign: 'left'
        }}>
          
          {/* Column 1: Brand details & Socials (Always visible) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {renderFooterLogo()}
            <p style={{ fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-muted)' }}>
              {activeCms.company_story || 'Brainfeels Tech helps businesses design, develop, and scale high-performance digital products and cloud-native solutions.'}
            </p>
            
            {/* Dynamic Social Icons */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '10px', flexWrap: 'wrap' }}>
              {networks.filter(n => n.enabled).map((net) => (
                <a 
                  key={net.name} 
                  href={net.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  title={net.name}
                  style={{ 
                    color: 'var(--text-muted)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'var(--transition)'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'}
                  onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  {renderSocialIcon(net.name)}
                  {net.show_badge && (
                    <span style={{ 
                      fontSize: '0.55rem', 
                      padding: '1px 4px', 
                      borderRadius: '4px', 
                      backgroundColor: 'var(--primary)', 
                      color: 'white', 
                      fontWeight: 800,
                      lineHeight: 1
                    }}>✓</span>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Navigation (Visible if columns >= 2) */}
          {columnsCount >= 2 && (
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Navigation
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', padding: 0 }}>
                <li><Link to="/" style={{ color: 'var(--text-muted)' }}>Home</Link></li>
                <li><Link to="/about" style={{ color: 'var(--text-muted)' }}>About Us</Link></li>
                <li><Link to="/services" style={{ color: 'var(--text-muted)' }}>Services</Link></li>
                <li><Link to="/portfolio" style={{ color: 'var(--text-muted)' }}>Case Studies</Link></li>
                <li><Link to="/portal" style={{ color: 'var(--text-muted)' }}>Client Portal</Link></li>
              </ul>
            </div>
          )}

          {/* Column 3: Services (Visible if columns >= 3) */}
          {columnsCount >= 3 && (
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Services
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', padding: 0 }}>
                <li><Link to="/services" style={{ color: 'var(--text-muted)' }}>Web Development</Link></li>
                <li><Link to="/services" style={{ color: 'var(--text-muted)' }}>Mobile Apps</Link></li>
                <li><Link to="/services" style={{ color: 'var(--text-muted)' }}>UI/UX Design</Link></li>
                <li><Link to="/services" style={{ color: 'var(--text-muted)' }}>Backend APIs</Link></li>
                <li><Link to="/services" style={{ color: 'var(--text-muted)' }}>IT Solutions</Link></li>
              </ul>
            </div>
          )}

          {/* Column 4: Contact & Map Info (Visible if columns >= 4) */}
          {columnsCount >= 4 && (
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Contact HQ
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem', padding: 0, marginBottom: isMapEnabled ? '16px' : '0' }}>
                <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <MapPin size={16} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ color: 'var(--text-muted)' }}>{activeCms.contact_address || 'Lagos, Nigeria'}</span>
                </li>
                <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Mail size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                  <a href={`mailto:${activeCms.contact_email || 'brainfeelstech@gmail.com'}`} style={{ color: 'var(--text-muted)' }}>{activeCms.contact_email || 'brainfeelstech@gmail.com'}</a>
                </li>
                <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Phone size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                  <a href={`tel:${activeCms.contact_phone || '08061657738'}`} style={{ color: 'var(--text-muted)' }}>{activeCms.contact_phone || '08061657738'}</a>
                </li>
                <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <MessageCircle size={16} style={{ color: '#25D366', flexShrink: 0 }} />
                  <a href={activeCms.whatsapp_link || 'https://wa.me/2348061657738'} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)' }}>WhatsApp Chat</a>
                </li>
              </ul>
              
              {/* Optional embedded map */}
              {isMapEnabled && (
                <div style={{ width: '100%', height: '110px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <iframe 
                    src={footerBuilder.map_iframe_url} 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen="" 
                    loading="lazy"
                    title="HQ Map Location"
                  ></iframe>
                </div>
              )}
            </div>
          )}

          {/* Column 5: Business Hours / Extra Info (Visible if columns >= 5) */}
          {columnsCount >= 5 && (
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Business Hours
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', padding: 0 }}>
                <li style={{ color: 'var(--text-muted)' }}><strong style={{ color: 'var(--text-primary)' }}>Monday - Friday:</strong> 8:00 AM - 6:00 PM</li>
                <li style={{ color: 'var(--text-muted)' }}><strong style={{ color: 'var(--text-primary)' }}>Saturday:</strong> 9:00 AM - 4:00 PM</li>
                <li style={{ color: 'var(--text-muted)' }}><strong style={{ color: 'var(--text-primary)' }}>Sunday:</strong> Closed</li>
                <li style={{ color: 'var(--text-muted)' }}><strong style={{ color: 'var(--text-primary)' }}>Support:</strong> 24/7 Priority Logs</li>
              </ul>
            </div>
          )}

          {/* Column 6: Extra map column if columns count is 6 and map is enabled */}
          {columnsCount >= 6 && (
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Visual Locator
              </h4>
              {isMapEnabled ? (
                <div style={{ width: '100%', height: '150px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <iframe 
                    src={footerBuilder.map_iframe_url} 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen="" 
                    loading="lazy"
                    title="Visual Locator Map"
                  ></iframe>
                </div>
              ) : (
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Location map is disabled or unconfigured.</p>
              )}
            </div>
          )}

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
          <p>{footerBuilder.copyright_text || `© ${new Date().getFullYear()} ${logoText}. All rights reserved.`}</p>
          <div style={{ display: 'flex', gap: '20px' }}>
            {footerBuilder.legal_links ? (
              footerBuilder.legal_links.map((link, idx) => (
                <a key={idx} href={link.url} style={{ color: 'var(--text-muted)' }}>{link.label}</a>
              ))
            ) : (
              <>
                <Link to="/" style={{ color: 'var(--text-muted)' }}>Privacy Policy</Link>
                <Link to="/" style={{ color: 'var(--text-muted)' }}>Terms of Service</Link>
              </>
            )}
            <Link to="/portal" style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>Admin Login</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
