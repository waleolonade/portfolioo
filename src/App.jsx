import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TrustedBy from './components/TrustedBy';
import QuickIntro from './components/QuickIntro';
import Services from './components/Services';
import Projects from './components/Projects';
import GithubShowcase from './components/GithubShowcase';
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
import CareersPage from './pages/CareersPage';
import ClientPortal from './pages/ClientPortal';

// Admin
import Login from './admin/Login';
import Dashboard from './admin/Dashboard';
import './App.css';

const SECTION_COMPONENTS = {
  hero: Hero,
  trusted_by: TrustedBy,
  intro: QuickIntro,
  services: Services,
  projects: Projects,
  github: GithubShowcase,
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
  { id: 'github', visible: true },
  { id: 'tech_stack', visible: true },
  { id: 'why_us', visible: true },
  { id: 'process', visible: true },
  { id: 'testimonials', visible: true },
  { id: 'cta_block', visible: true },
  { id: 'contact', visible: true }
];

export const CmsContext = React.createContext({ cms: {}, reloadCms: () => {} });

// Public Landing Page Component in exact requested flow order
function LandingPage() {
  const { cms } = React.useContext(CmsContext);
  const [layout, setLayout] = useState(DEFAULT_LAYOUT);

  useEffect(() => {
    if (cms && cms.homepage_layout) {
      try {
        const parsed = JSON.parse(cms.homepage_layout);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLayout(parsed);
        }
      } catch (e) {
        console.error('Failed to parse layout configuration', e);
      }
    }
  }, [cms]);

  return (
    <div className="page-container">
      <Navbar cms={cms} />
      <main style={{ flexGrow: 1 }}>
        {layout.map((section) => {
          if (!section.visible) return null;
          const Component = SECTION_COMPONENTS[section.id];
          return Component ? <Component key={section.id} cms={cms} /> : null;
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
      } catch(e) {
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
      } catch(e) {
        return {};
      }
    })();

    const seoVisibility = (() => {
      if (!cms.cms_seo_visibility) return {};
      try {
        return typeof cms.cms_seo_visibility === 'string' 
          ? JSON.parse(cms.cms_seo_visibility) 
          : cms.cms_seo_visibility;
      } catch(e) {
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
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/portal" element={<ClientPortal />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<Dashboard />} />
          
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
