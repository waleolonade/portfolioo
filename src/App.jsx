import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { CmsContext } from './CmsContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TrustedBy from './components/TrustedBy';
import QuickIntro from './components/QuickIntro';
import Services from './components/Services';
import Projects from './components/Projects';

import TechStack from './components/TechStack';
import WhyChooseUs from './components/WhyChooseUs';
import Testimonials from './components/Testimonials';
import Process from './components/Process';
import CtaBlock from './components/CtaBlock';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AiChatbot from './components/AiChatbot';
import WhatsAppFloating from './components/WhatsAppFloating';
import { API_BASE_URL } from './config';

// Pages
import About from './pages/About';
import ServicesPage from './pages/ServicesPage';
import PortfolioPage from './pages/PortfolioPage';
import ProjectDetails from './pages/ProjectDetails';
import ClientPortal from './pages/ClientPortal';
import BlogPage from './pages/BlogPage';
import BlogPost from './pages/BlogPost';
import PricingPage from './pages/PricingPage';
import FAQPage from './pages/FAQPage';
import ContactPage from './pages/ContactPage';

// Admin Pages
import Login from './admin/Login';
import AdminLayout from './admin/AdminLayout';
import { AdminProvider } from './admin/AdminProvider';
import Overview from './admin/pages/Overview';
import ProjectsAdmin from './admin/pages/ProjectsAdmin';
import ServicesAdmin from './admin/pages/ServicesAdmin';
import LeadsAdmin from './admin/pages/LeadsAdmin';
import CareersAdmin from './admin/pages/CareersAdmin';
import PageBuilderCms from './admin/pages/PageBuilderCms';
import ClientChatsAdmin from './admin/pages/ClientChatsAdmin';
import PaymentGatewaysAdmin from './admin/pages/PaymentGatewaysAdmin';


const SECTION_COMPONENTS = {
  hero: Hero,
  trusted_by: TrustedBy,
  intro: QuickIntro,
  services: Services,
  projects: Projects,

  tech_stack: TechStack,
  why_us: WhyChooseUs,
  process: Process,
  testimonials: Testimonials,
  cta_block: CtaBlock,
  contact: Contact
};

const DEFAULT_LAYOUT = [
  { id: 'hero', visible: true },
  { id: 'trusted_by', visible: true },
  { id: 'intro', visible: true },
  { id: 'services', visible: true },
  { id: 'projects', visible: true },

  { id: 'tech_stack', visible: true },
  { id: 'why_us', visible: true },
  { id: 'process', visible: true },
  { id: 'testimonials', visible: true },
  { id: 'cta_block', visible: true },
  { id: 'contact', visible: true }
];

// CmsContext is imported from ./CmsContext at the top

/* ═══════════════ Custom HTML Section Renderer ═══════════════ */
function CustomHtmlSection({ section }) {
  const ref = React.useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    // Inject CSS
    const styleId = `custom-css-${section.id}`;
    let styleEl = document.getElementById(styleId);
    if (!styleEl) { styleEl = document.createElement('style'); styleEl.id = styleId; document.head.appendChild(styleEl); }
    styleEl.innerHTML = section.css_content || '';
    // Inject JS
    if (section.js_content) {
      try { new Function(section.js_content)(); } catch(e) { console.error('Custom section JS error:', e); }
    }
    return () => { document.getElementById(styleId)?.remove(); };
  }, [section.css_content, section.js_content, section.id]);

  return <div ref={ref} dangerouslySetInnerHTML={{ __html: section.html_content || '' }} />;
}

/* ═══════════════ Animated Section Wrapper ═══════════════ */
function AnimatedSection({ section, children }) {
  const ref = React.useRef(null);
  const s = section.settings || {};
  const anim = s.animation || 'none';
  const [visible, setVisible] = useState(anim === 'none');
  const [prevAnim, setPrevAnim] = useState(anim);

  if (anim !== prevAnim) {
    setPrevAnim(anim);
    setVisible(anim === 'none');
  }

  useEffect(() => {
    if (anim === 'none') return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [anim]);

  const animStyles = {
    'fade-in': { opacity: visible ? 1 : 0, transition: 'opacity 0.8s ease' },
    'slide-up': { opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(40px)', transition: 'opacity 0.7s ease, transform 0.7s ease' },
    'slide-left': { opacity: visible ? 1 : 0, transform: visible ? 'translateX(0)' : 'translateX(40px)', transition: 'opacity 0.7s ease, transform 0.7s ease' },
    'zoom-in': { opacity: visible ? 1 : 0, transform: visible ? 'scale(1)' : 'scale(0.92)', transition: 'opacity 0.6s ease, transform 0.6s ease' }
  };

  const wrapperStyle = {
    ...(anim !== 'none' ? animStyles[anim] || {} : {}),
    paddingTop: s.padding_top != null ? s.padding_top : undefined,
    paddingBottom: s.padding_bottom != null ? s.padding_bottom : undefined,
    maxWidth: s.max_width === 'contained' ? 1200 : s.max_width === 'narrow' ? 800 : undefined,
    marginLeft: (s.max_width === 'contained' || s.max_width === 'narrow') ? 'auto' : undefined,
    marginRight: (s.max_width === 'contained' || s.max_width === 'narrow') ? 'auto' : undefined,
    position: 'relative'
  };

  const bgStyle = {};
  if (s.bg_color) bgStyle.backgroundColor = s.bg_color;
  if (s.bg_image) {
    bgStyle.backgroundImage = `url(${s.bg_image})`;
    bgStyle.backgroundSize = 'cover'; bgStyle.backgroundPosition = 'center';
  }

  return (
    <div ref={ref} className={s.custom_css_class || ''} style={bgStyle}>
      {s.bg_overlay > 0 && <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${s.bg_overlay})`, pointerEvents: 'none' }} />}
      {s.custom_css && <style>{s.custom_css}</style>}
      <div style={wrapperStyle}>{children}</div>
    </div>
  );
}

function LandingPage() {
  const { cms } = React.useContext(CmsContext);

  const layout = React.useMemo(() => {
    if (cms && cms.homepage_layout) {
      try {
        const parsed = JSON.parse(cms.homepage_layout);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(s => ({
            ...s, type: s.type || 'builtin', settings: s.settings || {}
          }));
        }
      } catch (err) {
        console.error('Failed to parse layout configuration', err);
      }
    }
    return DEFAULT_LAYOUT;
  }, [cms]);

  const themeObj = React.useMemo(() => {
    if (!cms.cms_theme_customizer) return {};
    try {
      return typeof cms.cms_theme_customizer === 'string' 
        ? JSON.parse(cms.cms_theme_customizer) 
        : cms.cms_theme_customizer;
    } catch {
      return {};
    }
  }, [cms.cms_theme_customizer]);
  const themeClass = themeObj.theme_class || 'theme-quantum';

  // Check visibility scheduling
  const isSectionVisible = (section) => {
    if (!section.visible) return false;
    const s = section.settings || {};
    const now = new Date();
    if (s.schedule_start && new Date(s.schedule_start) > now) return false;
    if (s.schedule_end && new Date(s.schedule_end) < now) return false;
    return true;
  };

  return (
    <div className={`page-container ${themeClass}`}>
      <Navbar cms={cms} />
      <main style={{ flexGrow: 1 }}>
        {layout.map((section, idx) => {
          if (section.id === 'services') return null; // Completely remove services section from homepage
          if (!isSectionVisible(section)) return null;
          
          // Built-in component
          if (section.type === 'builtin' || !section.type) {
            const Component = SECTION_COMPONENTS[section.id];
            if (!Component) return null;
            return (
              <AnimatedSection key={section.id + idx} section={section}>
                <Component cms={cms} />
              </AnimatedSection>
            );
          }
          
          // Custom HTML section
          if (section.type === 'custom_html') {
            return (
              <AnimatedSection key={section.id + idx} section={section}>
                <CustomHtmlSection section={section} />
              </AnimatedSection>
            );
          }
          
          return null;
        })}
      </main>
      <Footer cms={cms} />
    </div>
  );
}
function App() {
  const [cms, setCms] = useState({});

  const reloadCms = () => {
    fetch(`${API_BASE_URL}/cms.php`)
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === 'object') {
          setCms(data);
        }
      })
      .catch(err => console.error('Failed to load CMS settings', err));
  };

  useEffect(() => {
    reloadCms();
  }, []);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'CMS_LIVE_PREVIEW') {
        setCms(event.data.cms);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Update dynamic page head details, schema markup, theme variables, and fonts
  useEffect(() => {
    if (!cms || Object.keys(cms).length === 0) return;
    
    // 1. Theme Variables & Fonts Customizer Injection
    const themeObj = (() => {
      if (!cms.cms_theme_customizer) return {};
      try {
        return typeof cms.cms_theme_customizer === 'string' 
          ? JSON.parse(cms.cms_theme_customizer) 
          : cms.cms_theme_customizer;
      } catch {
        return {};
      }
    })();
    
    const fontBody = themeObj.font_family_body || 'Outfit';
    const fontHeading = themeObj.font_family_heading || 'Inter';
    
    // Inject google font stylesheet
    const fontId = 'dynamic-google-fonts';
    let fontLink = document.getElementById(fontId);
    if (!fontLink) {
      fontLink = document.createElement('link');
      fontLink.id = fontId;
      fontLink.rel = 'stylesheet';
      document.head.appendChild(fontLink);
    }
    const queryBody = fontBody.replace(/\s+/g, '+');
    const queryHeading = fontHeading.replace(/\s+/g, '+');
    fontLink.href = `https://fonts.googleapis.com/css2?family=${queryBody}:wght@300;400;500;600;700;800&family=${queryHeading}:wght@300;400;500;600;700;800&display=swap`;

    // Inject dynamic CSS style tag
    const themeStyleId = 'dynamic-theme-customizer';
    let themeStyle = document.getElementById(themeStyleId);
    if (!themeStyle) {
      themeStyle = document.createElement('style');
      themeStyle.id = themeStyleId;
      document.head.appendChild(themeStyle);
    }
    
    themeStyle.innerHTML = `
      :root {
        ${themeObj.color_primary ? `--primary: ${themeObj.color_primary}; --primary-hover: ${themeObj.color_primary}e6;` : ''}
        ${themeObj.color_secondary ? `--secondary: ${themeObj.color_secondary}; --secondary-hover: ${themeObj.color_secondary}e6;` : ''}
        ${themeObj.color_accent ? `--accent: ${themeObj.color_accent};` : ''}
        ${themeObj.color_bg_light ? `--bg-primary: ${themeObj.color_bg_light};` : ''}
        ${themeObj.color_text_light ? `--text-primary: ${themeObj.color_text_light};` : ''}
        ${themeObj.border_radius !== undefined ? `
          --radius-sm: ${themeObj.border_radius / 2}px;
          --radius-md: ${themeObj.border_radius}px;
          --radius-lg: ${themeObj.border_radius * 1.5}px;
        ` : ''}
        --font-sans: '${fontBody}', system-ui, -apple-system, sans-serif;
      }
      
      .dark-theme {
        ${themeObj.color_bg_dark ? `--bg-primary: ${themeObj.color_bg_dark};` : ''}
        ${themeObj.color_text_dark ? `--text-primary: ${themeObj.color_text_dark};` : ''}
      }
      
      h1, h2, h3, h4, h5, h6, .logo-text, .section-title {
        font-family: '${fontHeading}', '${fontBody}', system-ui, sans-serif !important;
      }
    `;

    // 2. SEO & Favicon Updates
    const brandAssets = (() => {
      if (!cms.cms_brand_assets) return {};
      try {
        return typeof cms.cms_brand_assets === 'string' 
          ? JSON.parse(cms.cms_brand_assets) 
          : cms.cms_brand_assets;
      } catch {
        return {};
      }
    })();

    const seoVisibility = (() => {
      if (!cms.cms_seo_visibility) return {};
      try {
        return typeof cms.cms_seo_visibility === 'string' 
          ? JSON.parse(cms.cms_seo_visibility) 
          : cms.cms_seo_visibility;
      } catch {
        return {};
      }
    })();

    // Set document title
    document.title = cms.seo_title || 'Brainfeels Tech | Next-Gen Digital Solutions Agency';
    
    // Set meta description
    let metaDesc = document.querySelector("meta[name='description']");
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = cms.seo_description || 'Professional Website Development, Mobile App Development, UI/UX Design, Networking & IT Solutions';

    // Favicon update
    const faviconUrl = brandAssets.favicon_url || cms.site_favicon_url || '/favicon.svg';
    if (faviconUrl) {
      let faviconLink = document.querySelector("link[rel~='icon']");
      if (!faviconLink) {
        faviconLink = document.createElement('link');
        faviconLink.rel = 'icon';
        document.head.appendChild(faviconLink);
      }
      faviconLink.href = faviconUrl;
    }

    // OG Title
    let ogTitle = document.querySelector("meta[property='og:title']");
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.content = seoVisibility.og_title || cms.seo_title || '';

    // OG Description
    let ogDesc = document.querySelector("meta[property='og:description']");
    if (!ogDesc) {
      ogDesc = document.createElement('meta');
      ogDesc.setAttribute('property', 'og:description');
      document.head.appendChild(ogDesc);
    }
    ogDesc.content = seoVisibility.og_description || cms.seo_description || '';

    // OG Image
    let ogImg = document.querySelector("meta[property='og:image']");
    if (!ogImg) {
      ogImg = document.createElement('meta');
      ogImg.setAttribute('property', 'og:image');
      document.head.appendChild(ogImg);
    }
    ogImg.content = seoVisibility.og_image || '';

    // Structured JSON Schema
    const schemaId = 'company-schema-json';
    let schemaScript = document.getElementById(schemaId);
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = schemaId;
      schemaScript.type = 'application/ld+json';
      document.head.appendChild(schemaScript);
    }
    schemaScript.textContent = seoVisibility.company_schema || '';

    // 3. Custom Code Injection (from Developer IDE in CMS)
    const customCodeObj = (() => {
      if (!cms.cms_custom_code) return {};
      try {
        return typeof cms.cms_custom_code === 'string' ? JSON.parse(cms.cms_custom_code) : cms.cms_custom_code;
      } catch { return {}; }
    })();

    // Inject custom CSS
    const customCssId = 'cms-custom-css';
    let customCssEl = document.getElementById(customCssId);
    if (!customCssEl) { customCssEl = document.createElement('style'); customCssEl.id = customCssId; document.head.appendChild(customCssEl); }
    customCssEl.innerHTML = customCodeObj.custom_css || '';

    // Inject custom JS (recreate each time to re-execute)
    const customJsId = 'cms-custom-js';
    let existingJs = document.getElementById(customJsId);
    if (existingJs) existingJs.remove();
    if (customCodeObj.custom_js) {
      const jsEl = document.createElement('script');
      jsEl.id = customJsId;
      jsEl.textContent = customCodeObj.custom_js;
      document.head.appendChild(jsEl);
    }

    // Inject custom head HTML
    const customHtmlId = 'cms-custom-head-html';
    let existingHtml = document.getElementById(customHtmlId);
    if (existingHtml) existingHtml.remove();
    if (customCodeObj.custom_head_html) {
      const htmlWrapper = document.createElement('div');
      htmlWrapper.id = customHtmlId;
      htmlWrapper.innerHTML = customCodeObj.custom_head_html;
      document.head.appendChild(htmlWrapper);
    }
  }, [cms]);

  return (
    <CmsContext.Provider value={{ cms, reloadCms }}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/portfolio/:id" element={<ProjectDetails />} />
          <Route path="/portal" element={<ClientPortal />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/contact" element={<ContactPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/cms" element={<AdminProvider><PageBuilderCms /></AdminProvider>} />
          <Route path="/admin" element={<AdminProvider><AdminLayout /></AdminProvider>}>
            <Route index element={<Overview />} />
            <Route path="overview" element={<Overview />} />
            <Route path="projects" element={<ProjectsAdmin />} />
            <Route path="services" element={<ServicesAdmin />} />
            <Route path="leads" element={<LeadsAdmin />} />
            <Route path="chats" element={<ClientChatsAdmin />} />
            <Route path="careers" element={<CareersAdmin />} />
            <Route path="payments" element={<PaymentGatewaysAdmin />} />
          </Route>
          
          {/* Catch-all redirect to Landing */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
        
        {/* Floating AI Assistant Copilot */}
        <AiChatbot />

        {/* Floating WhatsApp Quick Connect */}
        <WhatsAppFloating />
      </Router>
    </CmsContext.Provider>
  );
}

export default App;
