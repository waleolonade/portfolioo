import React, { useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Code, Compass, HeartHandshake, HelpCircle,
  Server, ShoppingCart, Smartphone, Terminal, Zap, Loader2, Mail,
  CheckCircle, Layers
} from 'lucide-react';

import { CmsContext } from '../CmsContext';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { API_BASE_URL } from '../config';

// ----------------------------------------------------------------------
// Constants & Configuration
// ----------------------------------------------------------------------
const gradientColors = [
  ['#6366f1', '#818cf8'], // Indigo
  ['#14b8a6', '#2dd4bf'], // Teal
  ['#f59e0b', '#fbbf24'], // Amber
  ['#8b5cf6', '#a78bfa'], // Violet
  ['#ec4899', '#f472b6'], // Pink
  ['#3b82f6', '#60a5fa'], // Blue
  ['#10b981', '#34d399'], // Emerald
  ['#f43f5e', '#fb7185'], // Rose
];

const iconMap = {
  Code: <Code size={28} />,
  Smartphone: <Smartphone size={28} />,
  Compass: <Compass size={28} />,
  Zap: <Zap size={28} />,
  ShoppingCart: <ShoppingCart size={28} />,
  Terminal: <Terminal size={28} />,
  Server: <Server size={28} />,
  HeartHandshake: <HeartHandshake size={28} />
};

// ----------------------------------------------------------------------
// Animation Variants
// ----------------------------------------------------------------------
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 70, damping: 16 }
  }
};

// ----------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------
export default function ServicesPage() {
  const navigate = useNavigate();
  const { cms } = useContext(CmsContext) || {};
  
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const pageTitle = cms?.home_services_title || cms?.services_page_title || 'Our Core Services';
  const pageSubtitle = cms?.home_services_description || cms?.services_page_subtitle || 'Comprehensive digital solutions designed to help businesses grow, scale, and operate efficiently.';

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `${pageTitle} | ${cms?.site_logo_text || 'Brainfeels Tech'}`;

    let isMounted = true;

    const fetchServices = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/services.php`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        if (isMounted && Array.isArray(data)) {
          setServices(data);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchServices();
    return () => { isMounted = false; };
  }, [pageTitle, cms]);

  const handleContactService = (serviceName) => {
    navigate('/contact', {
      state: {
        prefilledService: serviceName,
        prefilledMessage: `Hello, I am interested in the ${serviceName} service. Let's discuss my project.`
      }
    });
  };

  const parseBenefits = (str) => {
    if (!str) return [];
    return str.split(',').map(s => s.trim()).filter(Boolean).slice(0, 4);
  };

  return (
    <div className="page-container flex min-h-screen flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] relative">
      
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[var(--primary)]/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[var(--accent)]/5 blur-[150px]" />
      </div>

      <Navbar />

      <main className="relative z-10 flex-grow pt-32 pb-24 container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ═══════════════════ Hero Section ═══════════════════ */}
        <section className="mx-auto mb-20 max-w-4xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--primary)]/20 bg-[var(--primary)]/5 text-[var(--primary)] text-xs font-semibold tracking-widest uppercase mb-6"
          >
            <Layers size={13} />
            Our Expertise
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, type: "spring" }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-5 leading-tight text-transparent bg-clip-text bg-gradient-to-br from-[var(--text-primary)] via-[var(--text-primary)] to-[var(--text-secondary)]"
          >
            {pageTitle}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed"
          >
            {pageSubtitle}
          </motion.p>
        </section>

        {/* ═══════════════════ Services Grid ═══════════════════ */}
        <section className="mb-24">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-32"
              >
                <Loader2 className="w-12 h-12 text-[var(--primary)] animate-spin mb-4" />
                <p className="text-sm font-semibold tracking-widest uppercase text-[var(--text-secondary)]">
                  Loading Capabilities...
                </p>
              </motion.div>
            ) : services.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
                className="flex flex-col items-center justify-center py-28 px-6 relative overflow-hidden rounded-[3rem] border border-[var(--border)] bg-gradient-to-b from-[var(--bg-secondary)] to-[var(--bg-primary)] shadow-2xl group"
              >
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute top-[-50%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[var(--primary)]/5 blur-[80px] pointer-events-none"
                />
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  className="absolute bottom-[-50%] right-[-10%] w-[400px] h-[400px] rounded-full bg-[var(--accent)]/5 blur-[80px] pointer-events-none"
                />
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-tr from-[var(--primary)]/10 to-[var(--accent)]/10 border border-[var(--primary)]/20 flex items-center justify-center mb-8 text-[var(--primary)]"
                >
                  <Terminal size={40} className="drop-shadow-md" />
                </motion.div>
                <h3 className="relative z-10 text-3xl sm:text-4xl font-black mb-4 text-[var(--text-primary)] tracking-tight">
                  No Services Found
                </h3>
                <p className="relative z-10 text-[var(--text-secondary)] text-center max-w-lg mb-10 text-lg leading-relaxed font-medium">
                  We are currently updating our service offerings. Please check back later or contact us directly to discuss your project needs.
                </p>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/contact')}
                  className="btn btn-primary relative z-10 flex items-center gap-2"
                  style={{ padding: '14px 32px', borderRadius: '10px' }}
                >
                  <Mail size={18} /> 
                  Contact Us Now
                </motion.button>
              </motion.div>
            ) : (
              <motion.div 
                key="grid"
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {services.map((service, index) => {
                  const [color1, color2] = gradientColors[index % gradientColors.length];
                  const benefits = parseBenefits(service.benefits);
                  
                  return (
                    <motion.div
                      key={service.id || index}
                      variants={cardVariants}
                      whileHover={{ y: -8 }}
                      className="group relative flex flex-col overflow-hidden cursor-pointer"
                      style={{ '--card-accent': color1 }}
                      onClick={() => handleContactService(service.name)}
                    >
                      {/* Card base layer */}
                      <div className="absolute inset-0 bg-[var(--bg-secondary)] border border-[var(--border)] transition-all duration-500 group-hover:border-transparent" />
                      
                      {/* Gradient border glow on hover */}
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{ 
                          background: `linear-gradient(135deg, ${color1}30, transparent 40%, transparent 60%, ${color2}25)`,
                          padding: '1px',
                          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                          maskComposite: 'exclude',
                          WebkitMaskComposite: 'xor'
                        }}
                      />

                      {/* Ambient glow behind card */}
                      <div 
                        className="absolute -inset-1 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none blur-xl -z-10"
                        style={{ background: `radial-gradient(ellipse at 50% 80%, ${color1}18, transparent 70%)` }}
                      />

                      {/* ─── Card Content ─── */}
                      <div className="relative z-10 flex flex-col items-center h-full p-8 pb-6 text-center">
                        
                        {/* Icon */}
                        <div className="relative mb-5">
                          <div 
                            className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg mx-auto"
                            style={{
                              background: `linear-gradient(135deg, ${color1}18, ${color2}12)`,
                              color: color1,
                              border: `1px solid ${color1}25`
                            }}
                          >
                            {iconMap[service.icon_name] || <HelpCircle size={28} />}
                          </div>
                          {/* Pulse dot */}
                          <div 
                            className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-[var(--bg-secondary)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{ backgroundColor: color1 }}
                          />
                          {/* Number badge */}
                          <span 
                            className="absolute -top-2 -left-2 text-[10px] font-bold tracking-widest px-2.5 py-0.5 rounded-full border transition-colors duration-300"
                            style={{ 
                              color: color1,
                              borderColor: `${color1}25`,
                              backgroundColor: `${color1}08`
                            }}
                          >
                            {String(index + 1).padStart(2, '0')}
                          </span>
                        </div>

                        {/* Service Name */}
                        <h3 className="text-xl font-bold text-[var(--text-primary)] leading-tight transition-colors duration-300 group-hover:text-[var(--primary)] mb-4">
                          {service.name}
                        </h3>
                        
                        {/* Optional uploaded image */}
                        {service.image_url && (
                          <div className="w-full h-48 mb-5 overflow-hidden relative group-hover:shadow-md transition-all duration-300">
                            <img 
                              src={service.image_url} 
                              alt={service.name} 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                            />
                            <div 
                              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                              style={{ background: `linear-gradient(to top, ${color1}30, transparent 60%)` }}
                            />
                          </div>
                        )}

                        {/* Description */}
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-5">
                          {service.description}
                        </p>

                        {/* Benefits List */}
                        {benefits.length > 0 && (
                          <div className="flex flex-col gap-2.5 mb-6 items-center">
                            {benefits.map((benefit, bIdx) => (
                              <div key={bIdx} className="flex items-center gap-2.5">
                                <CheckCircle size={14} style={{ color: color1, flexShrink: 0 }} />
                                <span className="text-xs text-[var(--text-secondary)] font-medium leading-snug">{benefit}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Flex spacer */}
                        <div className="flex-grow" />

                        {/* Footer CTA */}
                        <div className="pt-5 border-t border-[var(--border)] mt-2 w-full">
                          <div className="flex items-center justify-center gap-3">
                            <span className="text-sm font-semibold text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors duration-300">
                              Get Started
                            </span>
                            <div 
                              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                              style={{ 
                                backgroundColor: `${color1}12`,
                                color: color1
                              }}
                            >
                              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

      </main>
      
      <Footer />
    </div>
  );
}