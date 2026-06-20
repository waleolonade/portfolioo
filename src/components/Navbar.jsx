import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Lock, ArrowRight, UserCheck, Menu, X } from 'lucide-react';

export default function Navbar({ cms = {} }) {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isAdminLoggedIn = !!localStorage.getItem('adminToken');
  
  const logoText = cms.site_logo_text || 'Brainfeels Tech';
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

  // Detect scroll for navbar background transition
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

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container nav-container">
        <Link to="/" className="logo-text" onClick={closeMenu}>
          <span className="logo-icon">{logoIcon}</span>
          {logoText}
        </Link>

        {/* Desktop Nav Links */}
        <ul className="nav-links">
          <li><Link to="/" className={`nav-link ${isActive('/')}`}>Home</Link></li>
          <li><Link to="/about" className={`nav-link ${isActive('/about')}`}>About</Link></li>
          <li><Link to="/services" className={`nav-link ${isActive('/services')}`}>Services</Link></li>
          <li><Link to="/portfolio" className={`nav-link ${isActive('/portfolio')}`}>Portfolio</Link></li>
          <li><Link to="/careers" className={`nav-link ${isActive('/careers')}`}>Careers</Link></li>
          <li>
            <Link to="/portal" className={`nav-link ${isActive('/portal')}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <UserCheck size={14} /> Client Portal
            </Link>
          </li>
          
          <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '12px' }}>
            <button onClick={toggleTheme} className="btn btn-outline nav-theme-btn" aria-label="Toggle theme">
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            
            {isAdminLoggedIn ? (
              <Link to="/admin" className="btn btn-primary nav-admin-btn">
                Dashboard <ArrowRight size={14} />
              </Link>
            ) : (
              <Link to="/admin/login" className="btn btn-outline nav-admin-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={14} /> Admin
              </Link>
            )}
          </li>
        </ul>

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

      {/* Mobile Nav Menu Slider */}
      <div className={`mobile-nav-overlay ${mobileOpen ? 'open' : ''}`} onClick={closeMenu}>
        <div className="mobile-nav-drawer" onClick={e => e.stopPropagation()}>
          <div className="mobile-nav-header">
            <span className="logo-text"><span className="logo-icon">{logoIcon}</span> {logoText}</span>
            <button onClick={closeMenu} className="btn btn-outline" style={{ padding: '6px' }}><X size={18} /></button>
          </div>
          
          <ul className="mobile-nav-links">
            <li><Link to="/" className={`mobile-nav-link ${isActive('/')}`} onClick={closeMenu}>Home</Link></li>
            <li><Link to="/about" className={`mobile-nav-link ${isActive('/about')}`} onClick={closeMenu}>About</Link></li>
            <li><Link to="/services" className={`mobile-nav-link ${isActive('/services')}`} onClick={closeMenu}>Services</Link></li>
            <li><Link to="/portfolio" className={`mobile-nav-link ${isActive('/portfolio')}`} onClick={closeMenu}>Portfolio</Link></li>
            <li><Link to="/careers" className={`mobile-nav-link ${isActive('/careers')}`} onClick={closeMenu}>Careers</Link></li>
            <li>
              <Link to="/portal" className={`mobile-nav-link ${isActive('/portal')}`} onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck size={16} /> Client Portal
              </Link>
            </li>
          </ul>

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
      `}</style>
    </nav>
  );
}
