import React from 'react';
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

// Public Landing Page Component in exact requested flow order
function LandingPage() {
  return (
    <div className="page-container">
      <Navbar />
      <main style={{ flexGrow: 1 }}>
        <Hero />
        <TrustedBy />
        <QuickIntro />
        <Services />
        <Projects />
        <GithubShowcase />
        <TechStack />
        <WhyChooseUs />
        <Process />
        <Testimonials />
        <CtaBlock />
        <Contact />
      </main>
      <Footer />
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
