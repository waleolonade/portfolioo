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

// Public Landing Page Component in exact requested flow order
function LandingPage() {
  const [cms, setCms] = useState({});
  const [layout, setLayout] = useState(DEFAULT_LAYOUT);

  useEffect(() => {
    fetch(`${API_BASE_URL}/cms.php`)
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === 'object') {
          setCms(data);
          if (data.homepage_layout) {
            try {
              const parsed = JSON.parse(data.homepage_layout);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setLayout(parsed);
              }
            } catch (e) {
              console.error('Failed to parse layout configuration', e);
            }
          }
        }
      })
      .catch(err => console.error('Failed to load CMS settings', err));
  }, []);

  // Update dynamic page head details
  useEffect(() => {
    if (cms.seo_title) {
      document.title = cms.seo_title;
    }
    if (cms.site_favicon_url) {
      let faviconLink = document.querySelector("link[rel~='icon']");
      if (!faviconLink) {
        faviconLink = document.createElement('link');
        faviconLink.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(faviconLink);
      }
      faviconLink.href = cms.site_favicon_url.startsWith('http') || cms.site_favicon_url.startsWith('data:')
        ? cms.site_favicon_url 
        : cms.site_favicon_url; // It's served from public directory or root
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
  return (
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
  );
}

export default App;
