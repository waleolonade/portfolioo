import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Lock, ArrowRight, UserCheck, Menu, X } from 'lucide-react';
import { CmsContext } from '../App';

export default function Navbar({ cms = {} }) {
  const contextCms = useContext(CmsContext) || {};
  const activeCms = (cms && Object.keys(cms).length > 0) ? cms : (contextCms.cms || {});
  
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isAdminLoggedIn = !!localStorage.getItem('adminToken');

  const brandAssets = (() => {
    try {
      return typeof activeCms.cms_brand_assets === 'string'
        ? JSON.parse(activeCms.cms_brand_assets)
        : activeCms.cms_brand_assets || {};
    } catch (e) {
      return {};
    }
  })();

  const headerBuilder = (() => {
    try {
      return typeof activeCms.cms_header_builder === 'string'
        ? JSON.parse(activeCms.cms_header_builder)
        : activeCms.cms_header_builder || {};
    } catch (e) {
      return {};
    }
  })();

  const logoText = brandAssets.logo_text || activeCms.site_logo_text || 'Brainfeels Tech';
  const logoIcon = logoText.charAt(0);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark-theme');
    } else {
      root.classList.remove('dark-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Detect scroll for navbar transitions
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';
  const closeMenu = () => setMobileOpen(false);

  // Logo rendering engine based on type selection (text, image, both)
  const renderLogo = () => {
    const isDark = theme === 'dark';
    const logoSrc = isDark ? (brandAssets.logo_url_dark || brandAssets.logo_url_light) : brandAssets.logo_url_light;
    const showImg = brandAssets.logo_type === 'image' || brandAssets.logo_type === 'both';
    const showText = brandAssets.logo_type === 'text' || brandAssets.logo_type === 'both' || !logoSrc;

    return (
      <Link to="/" className="logo-text flex align-center" onClick={closeMenu}>
        {showImg && logoSrc ? (
          <img 
            src={logoSrc} 
            alt={logoText} 
            style={{ 
              width: brandAssets.logo_width ? `${brandAssets.logo_width}px` : 'auto', 
              height: brandAssets.logo_height ? `${brandAssets.logo_height}px` : '40px',
              objectFit: 'contain'
            }} 
          />
        ) : (
          showText && (
            <>
              <span className="logo-icon">{logoIcon}</span>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                <span>{logoText}</span>
                {brandAssets.show_tagline && brandAssets.tagline && (
                  <span style={{ fontSize: '0.65rem', fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '0.05em', marginTop: '2px' }}>
                    {brandAssets.tagline}
                  </span>
                )}
              </div>
            </>
          )
        )}
      </Link>
    );
  };

  const isSticky = headerBuilder.is_sticky !== false;
  const isTransparent = headerBuilder.is_transparent && !scrolled;
  const layoutType = headerBuilder.layout_type || 'classic';
  
  // Visibility flags for elements
  const isLogoVisible = headerBuilder.elements?.find(e => e.id === 'logo')?.visible !== false;
  const isNavVisible = headerBuilder.elements?.find(e => e.id === 'nav_links')?.visible !== false;
  const isCtaVisible = headerBuilder.elements?.find(e => e.id === 'cta_button')?.visible !== false;
  const isToggleVisible = headerBuilder.elements?.find(e => e.id === 'theme_toggle')?.visible !== false;

  const renderNavLinks = (className = 'nav-links') => (
    <ul className={className}>
      <li><Link to="/" className={`nav-link ${isActive('/')}`} onClick={closeMenu}>Home</Link></li>
      <li><Link to="/about" className={`nav-link ${isActive('/about')}`} onClick={closeMenu}>About</Link></li>
      <li><Link to="/services" className={`nav-link ${isActive('/services')}`} onClick={closeMenu}>Services</Link></li>
      <li><Link to="/portfolio" className={`nav-link ${isActive('/portfolio')}`} onClick={closeMenu}>Portfolio</Link></li>
      <li><Link to="/careers" className={`nav-link ${isActive('/careers')}`} onClick={closeMenu}>Careers</Link></li>
      <li>
        <Link to="/portal" className={`nav-link ${isActive('/portal')}`} onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <UserCheck size={14} /> Client Portal
        </Link>
      </li>
    </ul>
  );

  const renderActions = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {isToggleVisible && (
        <button onClick={toggleTheme} className="btn btn-outline nav-theme-btn" aria-label="Toggle theme">
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
      )}
      
      {isCtaVisible && (
        isAdminLoggedIn ? (
          <Link to="/admin" className="btn btn-primary nav-admin-btn">
            Dashboard <ArrowRight size={14} />
          </Link>
        ) : (
          <a href={headerBuilder.cta_link || '#/contact'} className="btn btn-primary nav-admin-btn">
            {headerBuilder.cta_text || 'Get a Free Quote'}
          </a>
        )
      )}
    </div>
  );

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''} ${isSticky ? 'navbar--sticky' : ''}`} style={{
      position: isSticky ? 'sticky' : 'relative',
      backgroundColor: isTransparent ? 'transparent' : scrolled ? 'rgba(var(--bg-secondary-rgb), 0.85)' : 'var(--bg-secondary)',
      borderBottom: isTransparent ? 'none' : '1px solid var(--border)',
      boxShadow: isTransparent ? 'none' : scrolled ? '0 1px 12px rgba(0,0,0,0.08)' : 'none',
      transition: 'all 0.3s ease'
    }}>
      <div className="container">
        {/* Layout Switcher */}
        {layoutType === 'classic' && (
          <div className="nav-container nav-classic">
            {isLogoVisible && renderLogo()}
            {isNavVisible && renderNavLinks()}
            {renderActions()}
            
            {/* Mobile Hamburger */}
            <div className="mobile-nav-toggle-wrapper">
              <button onClick={toggleTheme} className="btn btn-outline nav-theme-btn" style={{ marginRight: '8px' }}>
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              </button>
              <button onClick={() => setMobileOpen(!mobileOpen)} className="btn btn-outline nav-theme-btn" aria-label="Toggle menu">
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        )}

        {layoutType === 'centered' && (
          <div className="nav-container-centered" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div style={{ width: '120px' }}></div> {/* balance the right actions */}
              <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
                {isLogoVisible && renderLogo()}
              </div>
              <div style={{ width: '180px', display: 'flex', justifyContent: 'flex-end' }}>
                {renderActions()}
              </div>
            </div>
            {isNavVisible && (
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%', borderTop: '1px solid var(--border)', paddingTop: '8px' }} className="desktop-only-flex">
                {renderNavLinks('nav-links nav-links-centered')}
              </div>
            )}
            
            {/* Mobile Hamburger */}
            <div className="mobile-nav-toggle-wrapper" style={{ position: 'absolute', top: '15px', right: '10px' }}>
              <button onClick={toggleTheme} className="btn btn-outline nav-theme-btn" style={{ marginRight: '8px' }}>
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              </button>
              <button onClick={() => setMobileOpen(!mobileOpen)} className="btn btn-outline nav-theme-btn" aria-label="Toggle menu">
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        )}

        {layoutType === 'minimal' && (
          <div className="nav-container nav-minimal">
            {isLogoVisible && renderLogo()}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {isToggleVisible && (
                <button onClick={toggleTheme} className="btn btn-outline nav-theme-btn" aria-label="Toggle theme">
                  {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                </button>
              )}
              {isCtaVisible && (
                <a href={headerBuilder.cta_link || '#/contact'} className="btn btn-primary nav-admin-btn desktop-only">
                  {headerBuilder.cta_text || 'Get a Free Quote'}
                </a>
              )}
              <button onClick={() => setMobileOpen(!mobileOpen)} className="btn btn-outline nav-theme-btn" aria-label="Toggle menu">
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile & Minimal Sidebar Drawer Menu */}
      <div className={`mobile-nav-overlay ${mobileOpen ? 'open' : ''}`} onClick={closeMenu}>
        <div className="mobile-nav-drawer" onClick={e => e.stopPropagation()}>
          <div className="mobile-nav-header">
            <span className="logo-text">{isLogoVisible && renderLogo()}</span>
            <button onClick={closeMenu} className="btn btn-outline" style={{ padding: '6px' }}><X size={18} /></button>
          </div>
          
          {renderNavLinks('mobile-nav-links')}

          <div className="mobile-nav-footer" style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
            {isAdminLoggedIn ? (
              <Link to="/admin" className="btn btn-primary" onClick={closeMenu} style={{ width: '100%' }}>
                Admin Dashboard
              </Link>
            ) : (
              <Link to="/admin/login" className="btn btn-outline" onClick={closeMenu} style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <Lock size={14} /> Admin Access
              </Link>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .logo-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: white;
          font-size: 0.85rem;
          font-weight: 800;
          margin-right: 8px;
        }
        .navbar--scrolled {
          box-shadow: 0 1px 12px rgba(0,0,0,0.08);
        }
        .nav-theme-btn {
          padding: 8px !important;
          border-radius: 50% !important;
          width: 36px;
          height: 36px;
        }
        .nav-admin-btn {
          padding: 8px 16px !important;
          font-size: 0.82rem !important;
          border-radius: 8px !important;
        }
        .nav-links-centered {
          gap: 40px !important;
        }
        .desktop-only-flex {
          display: flex;
        }
        @media (max-width: 768px) {
          .desktop-only-flex, .desktop-only {
            display: none !important;
          }
          .nav-container-centered {
            flex-direction: row !important;
            justify-content: space-between !important;
          }
          .nav-container-centered > div {
            width: auto !important;
            justify-content: flex-start !important;
          }
        }
      `}</style>
    </nav>
  );
}
