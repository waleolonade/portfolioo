import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Check } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [faqOpen, setFaqOpen] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch(`${API_BASE_URL}/services.php`)
      .then(res => res.json())
      .then(data => {
        setServices(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load services', err);
        setLoading(false);
      });
  }, []);

  const toggleFaq = (idx) => {
    setFaqOpen(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const processSteps = [
    { title: '1. Discovery & Quote', desc: 'Identify core technical bottlenecks, define business goals, and compile a budget estimation.' },
    { title: '2. Architecture Blueprinting', desc: 'Design structural layouts, database entities schemas, and API gateway maps.' },
    { title: '3. Agile Engineering Sprint', desc: 'Execute sprint cycles writing modular codebase components with automated testing.' },
    { title: '4. Penetration Audit', desc: 'Run zero-trust security checks, API token stress checks, and CORS configuration audits.' },
    { title: '5. Production Orchestration', desc: 'Configure cloud VPC instances, setup sitemap indexes, and deploy via automated git CI/CD pipelines.' }
  ];



  const faqs = [
    { q: 'How long does a standard web deployment take?', a: 'Simple MVPs are delivered within 2 weeks. Custom enterprise database applications typically take 4 to 8 weeks depending on integration parameters.' },
    { q: 'Can we edit content ourselves after launch?', a: 'Yes! The Brainfeels Tech CMS allows editing services, projects, team profiles, and global page headings directly from the admin panel without touching code.' },
    { q: 'Do you offer post-deployment maintenance?', a: 'Yes, we provide monthly SLAs covering server health monitoring, security patches, database backups, and styling updates.' }
  ];

  return (
    <div className="page-container">
      <Navbar />
      <main style={{ flexGrow: 1, padding: '40px 0' }}>
        
        {/* Core Services List */}
        <section className="container">
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            What We Deliver
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '8px', marginBottom: '40px' }}>
            Tailored Engineering Packages
          </h1>

          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading services...</div>
          ) : (
            <div className="grid grid-2" style={{ gap: '30px', marginBottom: '60px' }}>
              {services.map(service => (
                <div key={service.id} className="card" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)' }}>
                    {service.name}
                  </h2>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{service.description}</p>
                  
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--primary)', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                      Key Features
                    </strong>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      {service.features && service.features.split(',').map((f, fIdx) => (
                        <li key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Check size={14} style={{ color: 'var(--success)' }} /> {f.trim()}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Starting price:</span>
                    <strong style={{ fontSize: '1.2rem', color: 'var(--secondary)' }}>${parseFloat(service.basic_price).toLocaleString()}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Work Process flow */}
        <section style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '60px 0' }}>
          <div className="container" style={{ textAlign: 'left' }}>
            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '32px' }}>Our Deployment Protocol</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
              {processSteps.map((step, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)' }}>{step.title}</span>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>



        {/* FAQ Accordion */}
        <section style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', padding: '60px 0' }}>
          <div className="container" style={{ maxWidth: '720px', textAlign: 'left' }}>
            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '32px' }}>Frequently Asked Questions</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {faqs.map((faq, idx) => (
                <div key={idx} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', backgroundColor: 'var(--bg-primary)' }}>
                  <button 
                    onClick={() => toggleFaq(idx)}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      fontSize: '0.95rem'
                    }}
                  >
                    <span>{faq.q}</span>
                    <span>{faqOpen[idx] ? '−' : '+'}</span>
                  </button>
                  {faqOpen[idx] && (
                    <div style={{ padding: '0 20px 16px', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
