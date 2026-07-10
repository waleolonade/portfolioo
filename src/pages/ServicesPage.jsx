import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Star, Shield, Server, Code, Laptop, Smartphone, Database, Globe, Cloud, Palette, Cpu, Zap, Settings, LayoutTemplate, Terminal } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CmsContext } from '../CmsContext';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { API_BASE_URL } from '../config';

const ICON_MAP = { Code, Laptop, Smartphone, Server, Database, Shield, Globe, Cloud, Palette, Cpu, Zap, Settings, LayoutTemplate, Terminal };

const getIcon = (name) => {
  return ICON_MAP[name] || Terminal;
};

export default function ServicesPage() {
  const navigate = useNavigate();
  const { cms } = useContext(CmsContext) || {};
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState('USD');
  const [exchangeRate, setExchangeRate] = useState(1);

  // Fully CMS controlled text strings
  const pageTitle = cms?.services_page_title || 'Engineering Excellence';
  const pageSubtitle = cms?.services_page_subtitle || 'We deliver dependable digital products that scale with your business goals and user expectations.';
  const pageBadge = cms?.services_page_badge || 'Our Capabilities';
  const ctaTitle = cms?.services_page_cta_title || 'Ready to build your next digital product?';
  const ctaDesc = cms?.services_page_cta_desc || 'Let us help you define the right scope, timeline, and roadmap for your next launch.';
  const ctaBtn1 = cms?.services_page_cta_btn1 || 'Schedule a Call';
  const ctaBtn2 = cms?.services_page_cta_btn2 || 'View Portfolio';

  useEffect(() => {
    const initCurrency = async () => {
      try {
        const ipRes = await fetch('https://ipapi.co/currency/');
        const detectedCurrency = (await ipRes.text()).trim();
        
        if (detectedCurrency && detectedCurrency.length === 3) {
          setCurrency(detectedCurrency);
          if (detectedCurrency !== 'USD') {
            const rateRes = await fetch('https://open.er-api.com/v6/latest/USD');
            const rateData = await rateRes.json();
            if (rateData && rateData.rates && rateData.rates[detectedCurrency]) {
              setExchangeRate(rateData.rates[detectedCurrency]);
            }
          }
        }
      } catch (err) {
        console.error("Currency detection failed:", err);
      }
    };
    initCurrency();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `${pageTitle} | ${cms?.site_logo_text || 'Brainfeels Tech'}`;

    setLoading(true);
    fetch(`${API_BASE_URL}/services.php`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Parse the comma-separated strings from the DB into arrays
          const parsedServices = data.map(item => ({
            ...item,
            featuresList: item.features ? item.features.split(',').map(s => s.trim()).filter(Boolean) : [],
            benefitsList: item.benefits ? item.benefits.split(',').map(s => s.trim()).filter(Boolean) : [],
            basicPrice: Number(item.basic_price || 0),
            standardPrice: Number(item.standard_price || 0),
            premiumPrice: Number(item.premium_price || 0),
          }));
          setServices(parsedServices);
        }
      })
      .catch((error) => {
        console.error('Failed to load services:', error);
      })
      .finally(() => setLoading(false));
  }, [pageTitle, cms]);

  const formatPrice = (usdPrice) => {
    if (!usdPrice) return formatPrice(0);
    const converted = usdPrice * exchangeRate;
    return new Intl.NumberFormat(undefined, { 
      style: 'currency', 
      currency: currency,
      maximumFractionDigits: 0
    }).format(converted);
  };

  const handleContact = (service) => {
    navigate('/contact', {
      state: {
        prefilledService: service.name,
        prefilledMessage: `Hi, I am interested in your ${service.name} service. Please share next steps and availability.`
      }
    });
  };

  return (
    <div className="page-container flex min-h-screen flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-x-hidden">
      {/* Background Globs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute left-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[var(--primary)]/15 blur-[150px]" />
        <div className="absolute right-[-20%] top-[20%] h-[400px] w-[400px] rounded-full bg-[var(--accent)]/10 blur-[150px]" />
        <div className="absolute left-[20%] bottom-[-20%] h-[600px] w-[600px] rounded-full bg-[var(--secondary)]/15 blur-[150px]" />
      </div>

      <Navbar />

      <main className="relative z-10 flex-grow pt-32 pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Dynamic Hero Section */}
          <section className="mx-auto mb-24 max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/20 bg-[var(--primary)]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)] shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)] backdrop-blur-md"
            >
              <span className="h-2 w-2 rounded-full bg-[var(--primary)] animate-pulse" />
              {pageBadge}
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-8 text-5xl font-black tracking-tight text-[var(--text-primary)] sm:text-6xl lg:text-7xl"
            >
              {pageTitle}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-8 mx-auto max-w-2xl text-lg leading-relaxed text-[var(--text-secondary)] sm:text-xl"
            >
              {pageSubtitle}
            </motion.p>
          </section>

          {/* Services Grid Linked to Database */}
          {loading ? (
            <div className="py-24 text-center">
              <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--primary)]" />
              <p className="text-sm font-medium text-[var(--text-secondary)] tracking-widest uppercase">Loading services...</p>
            </div>
          ) : (
            <div className="grid gap-12 lg:grid-cols-2">
              {services.length > 0 ? (
                services.map((service, idx) => {
                  const Icon = getIcon(service.icon_name);
                  return (
                    <motion.article
                      key={service.id}
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: idx * 0.1, ease: 'easeOut' }}
                      className="group relative flex flex-col overflow-hidden rounded-2xl bg-[var(--primary)] text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                    >
                      <div className="flex flex-grow flex-col p-8 sm:p-10">
                        {/* Header: Icon & Title */}
                        <div className="mb-6 flex items-start gap-6">
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white shadow-inner transition-transform duration-500 group-hover:scale-110">
                            <Icon size={32} />
                          </div>
                          <div>
                            <h2 className="text-3xl font-black tracking-tight text-white">
                              {service.name}
                            </h2>
                            <p className="mt-2 text-sm leading-relaxed text-white/90">
                              {service.description}
                            </p>
                          </div>
                        </div>

                        {/* Pricing Tiers if available */}
                        <div className="mb-8 grid grid-cols-3 gap-3 rounded-xl bg-black/20 p-3">
                          <div className="rounded-lg bg-white/10 p-3 text-center transition-colors group-hover:bg-white/20">
                            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/70">Basic</p>
                            <p className="mt-1 text-lg font-bold text-white">{formatPrice(service.basicPrice)}</p>
                          </div>
                          <div className="rounded-lg bg-white/10 p-3 text-center transition-colors group-hover:bg-white/20">
                            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/70">Standard</p>
                            <p className="mt-1 text-lg font-bold text-white">{formatPrice(service.standardPrice)}</p>
                          </div>
                          <div className="rounded-lg bg-white/10 p-3 text-center transition-colors group-hover:bg-white/20">
                            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/70">Premium</p>
                            <p className="mt-1 text-lg font-bold text-white">{formatPrice(service.premiumPrice)}</p>
                          </div>
                        </div>

                        {/* Two Column Layout for Features & Benefits */}
                        <div className="mb-8 grid gap-6 sm:grid-cols-2 flex-grow">
                          {/* Features */}
                          {service.featuresList && service.featuresList.length > 0 && (
                            <div className="flex flex-col">
                              <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white/90">
                                <Code size={14} className="text-white" /> Core Features
                              </h3>
                              <ul className="space-y-3">
                                {service.featuresList.map((feature, i) => (
                                  <li key={i} className="flex items-start gap-3 text-sm font-medium text-white/80">
                                    <span className="mt-0.5 flex shrink-0 items-center justify-center text-white">
                                      <CheckCircle2 size={16} />
                                    </span>
                                    <span className="leading-tight">{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Benefits */}
                          {service.benefitsList && service.benefitsList.length > 0 && (
                            <div className="flex flex-col">
                              <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white/90">
                                <Star size={14} className="text-[#fbbf24]" /> Client Benefits
                              </h3>
                              <ul className="space-y-3">
                                {service.benefitsList.map((benefit, i) => (
                                  <li key={i} className="flex items-start gap-3 text-sm font-medium text-white/80">
                                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
                                      <Shield size={10} />
                                    </span>
                                    <span className="leading-tight">{benefit}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Action Button */}
                        <button
                          onClick={() => handleContact(service)}
                          className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-4 text-sm font-bold text-[var(--primary)] transition-all duration-300 hover:bg-slate-100 hover:shadow-lg group-hover:gap-4"
                        >
                          Request a Quote <ArrowRight size={16} />
                        </button>
                      </div>
                    </motion.article>
                  );
                })
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-[var(--border)] bg-[var(--bg-secondary)] py-32 px-8 text-center"
                >
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--bg-primary)] text-[var(--text-muted)]">
                    <Database size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-[var(--text-primary)]">No services configured yet</h3>
                  <p className="mt-2 text-lg text-[var(--text-secondary)] max-w-md">The admin needs to configure service offerings in the dashboard before they appear here.</p>
                </motion.div>
              )}
            </div>
          )}

          {/* Dynamic CTA Section */}
          <section className="mt-24 mb-12">
            <div className="relative overflow-hidden rounded-[3rem] border border-[var(--border)] bg-[var(--text-primary)] p-12 text-center shadow-2xl lg:p-20">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, var(--primary) 0%, transparent 70%)' }} />
              
              <div className="relative z-10 mx-auto max-w-3xl">
                <h2 className="text-4xl font-black tracking-tight text-[var(--bg-primary)] sm:text-5xl lg:text-6xl">{ctaTitle}</h2>
                <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[var(--bg-primary)]/70">{ctaDesc}</p>
                
                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <button
                    onClick={() => navigate('/contact', { state: { prefilledService: 'scoping', prefilledMessage: 'Hi, I would like to book a call regarding a new project.' } })}
                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-8 py-4 text-sm font-bold text-white shadow-[0_0_30px_rgba(var(--primary-rgb),0.4)] transition-transform hover:scale-105"
                  >
                    {ctaBtn1}
                    <ArrowRight size={16} />
                  </button>
                  <button
                    onClick={() => navigate('/portfolio')}
                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-[var(--bg-primary)]/20 bg-white/5 px-8 py-4 text-sm font-bold text-[var(--bg-primary)] backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white"
                  >
                    {ctaBtn2}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}