import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, MapPin, Phone, Send, CheckCircle, AlertCircle, Calendar, 
  Calculator, MessageCircle 
} from 'lucide-react';
import { API_BASE_URL } from '../config';

// Animation variants
const tabVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

export default function Contact({ cms = {} }) {
  const [activeTab, setActiveTab] = useState('message'); // message, quote, booking
  
  // Tab 1: Message Form State
  const [msgForm, setMsgForm] = useState({ name: '', email: '', subject: '', message: '' });
  
  // Tab 2: Quote Form State
  const [quoteForm, setQuoteForm] = useState({
    name: '', email: '', company: '', project_type: 'Website Development',
    budget: '$5,000 - $10,000', timeline: '1 - 3 months', message: ''
  });

  // Tab 3: Booking Form State
  const [bookingForm, setBookingForm] = useState({
    name: '', email: '', subject: 'Project Discussion',
    booking_date: '', booking_time: '', message: ''
  });

  const [status, setStatus] = useState({ submitting: false, success: null, error: null });

  // Derive Quote Estimate calculation on the fly
  const estimate = (() => {
    let base = 1200;
    if (quoteForm.project_type === 'Mobile App Development') base = 3500;
    if (quoteForm.project_type === 'UI/UX Design') base = 600;
    if (quoteForm.project_type === 'Backend Development & API Integration') base = 1800;
    if (quoteForm.project_type === 'E-commerce Solutions') base = 1500;
    if (quoteForm.project_type === 'Software & Web Applications') base = 2500;
    if (quoteForm.project_type === 'Networking & IT Solutions') base = 1000;
    if (quoteForm.project_type === 'Maintenance & Support') base = 300;

    let multiplier = 1.0;
    if (quoteForm.timeline === 'Immediate') multiplier = 1.25;
    if (quoteForm.timeline === '3 - 6 months') multiplier = 0.9;

    return Math.round(base * multiplier);
  })();

  const handleMsgChange = (e) => {
    const { name, value } = e.target;
    setMsgForm(prev => ({ ...prev, [name]: value }));
  };

  const handleQuoteChange = (e) => {
    const { name, value } = e.target;
    setQuoteForm(prev => ({ ...prev, [name]: value }));
  };

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({ ...prev, [name]: value }));
  };

  const submitForm = (endpoint, payload, typeName) => {
    setStatus({ submitting: true, success: null, error: null });

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.message || 'Submission failed.');
        setStatus({ submitting: false, success: data.message, error: null });
        
        // Reset corresponding form
        if (typeName === 'message') setMsgForm({ name: '', email: '', subject: '', message: '' });
        if (typeName === 'quote') setQuoteForm({ name: '', email: '', company: '', project_type: 'Website Development', budget: '$5,000 - $10,000', timeline: '1 - 3 months', message: '' });
        if (typeName === 'booking') setBookingForm({ name: '', email: '', subject: 'Project Discussion', booking_date: '', booking_time: '', message: '' });
      })
      .catch(err => {
        setStatus({ submitting: false, success: null, error: err.message });
      });
  };

  const handleMsgSubmit = (e) => {
    e.preventDefault();
    submitForm(`${API_BASE_URL}/inquiries.php`, { ...msgForm, type: 'contact' }, 'message');
  };

  const handleQuoteSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...quoteForm,
      type: 'quote',
      subject: `Project Estimate: ${quoteForm.project_type}`,
      message: `Project Type: ${quoteForm.project_type}. Budget Range: ${quoteForm.budget}. Timeline: ${quoteForm.timeline}. Details: ${quoteForm.message}. Est: $${estimate}`
    };
    submitForm(`${API_BASE_URL}/inquiries.php`, payload, 'quote');
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...bookingForm,
      type: 'booking',
      message: `Appointment Booking Request for ${bookingForm.booking_date} at ${bookingForm.booking_time}. Notes: ${bookingForm.message}`
    };
    submitForm(`${API_BASE_URL}/inquiries.php`, payload, 'booking');
  };

  // Selection Card Component
  const SelectionCard = ({ label, active, onClick }) => (
    <div 
      onClick={onClick}
      style={{
        padding: '12px 16px',
        border: `2px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
        backgroundColor: active ? 'rgba(var(--primary-rgb), 0.05)' : 'transparent',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        transition: 'all 0.2s',
        textAlign: 'center',
        fontWeight: active ? '600' : '500',
        color: active ? 'var(--primary)' : 'var(--text-secondary)'
      }}
    >
      {label}
    </div>
  );

  return (
    <section id="contact" className="section" style={{ borderTop: '1px solid var(--border)' }}>
      <div className="container">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="section-title">{cms.home_cta_title || 'Start a Conversation'}</h2>
          <p className="section-subtitle">
            {cms.home_cta_subtitle || 'Contact our engineers directly, request a dynamic project cost estimate, or schedule a video briefing.'}
          </p>
        </motion.div>

        {/* Dynamic switcher tabs */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '32px',
          flexWrap: 'wrap'
        }}>
          <button onClick={() => { setActiveTab('message'); setStatus({ submitting: false, success: null, error: null }); }} className={`btn ${activeTab === 'message' ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            <MessageCircle size={14} style={{ marginRight: '6px' }} /> {cms.home_contact_title || 'Quick Message'}
          </button>
          <button onClick={() => { setActiveTab('quote'); setStatus({ submitting: false, success: null, error: null }); }} className={`btn ${activeTab === 'quote' ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            <Calculator size={14} style={{ marginRight: '6px' }} /> {cms.home_contact_subtitle || 'Cost Estimator'}
          </button>
          <button onClick={() => { setActiveTab('booking'); setStatus({ submitting: false, success: null, error: null }); }} className={`btn ${activeTab === 'booking' ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            <Calendar size={14} style={{ marginRight: '6px' }} /> Schedule Briefing
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: '50px', textAlign: 'left' }} className="contact-grid">
          
          {/* Info Card column */}
          <motion.div
            style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, type: "spring", stiffness: 100, damping: 16 }}
          >
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>{cms.contact_hq_name || 'Brainfeels HQ'}</h3>
            
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ color: 'var(--primary)', padding: '8px', borderRadius: '6px', backgroundColor: 'rgba(var(--primary-rgb), 0.06)' }}>
                <MapPin size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{cms.contact_hq_title || 'HQ Location'}</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {cms.contact_address || '100 Tech Hub Boulevard, Suite 400, San Francisco, CA 94107'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ color: 'var(--primary)', padding: '8px', borderRadius: '6px', backgroundColor: 'rgba(var(--primary-rgb), 0.06)' }}>
                <Mail size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{cms.contact_email_title || 'Email Support'}</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {cms.contact_email || 'brainfeelstech@gmail.com'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ color: 'var(--primary)', padding: '8px', borderRadius: '6px', backgroundColor: 'rgba(var(--primary-rgb), 0.06)' }}>
                <Phone size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{cms.contact_phone_title || 'Telephone'}</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {cms.contact_phone || '08061657738'}
                </p>
              </div>
            </div>

            {/* WhatsApp Integration Button */}
            {cms.whatsapp_link && (
              <a 
                href={cms.whatsapp_link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-secondary" 
                style={{ 
                  marginTop: '10px', 
                  backgroundColor: '#25D366', 
                  borderColor: '#25D366', 
                  color: 'white',
                  alignSelf: 'start',
                  fontSize: '0.875rem'
                }}
              >
                <MessageCircle size={16} /> Chat via WhatsApp
              </a>
            )}
          </motion.div>

          {/* Form column */}
          <div className="card" style={{ padding: '32px', overflow: 'hidden', position: 'relative' }}>
            
            {status.error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', gap: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '0.9rem' }}>
                <AlertCircle size={18} /> <span>{status.error}</span>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {status.success ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  style={{ textAlign: 'center', padding: '40px 20px' }}
                >
                  <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                    style={{ color: 'var(--success)', marginBottom: '20px' }}
                  >
                    <CheckCircle size={64} style={{ margin: '0 auto' }} />
                  </motion.div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '10px', color: 'var(--text-primary)' }}>Request Received</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>{status.success} We've sent a confirmation email to your inbox.</p>
                  <button onClick={() => setStatus({ submitting: false, success: null, error: null })} className="btn btn-outline">
                    Send Another Request
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key={activeTab}
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {/* TAB 1: QUICK MESSAGE */}
                  {activeTab === 'message' && (
                    <form onSubmit={handleMsgSubmit}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group">
                          <label className="form-label" htmlFor="msg_name">Your Name</label>
                          <input
                            type="text"
                            id="msg_name"
                            name="name"
                            value={msgForm.name}
                            onChange={handleMsgChange}
                            className="form-control"
                            placeholder="Jane Doe"
                            required
                            disabled={status.submitting}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label" htmlFor="msg_email">Email Address</label>
                          <input
                            type="email"
                            id="msg_email"
                            name="email"
                            value={msgForm.email}
                            onChange={handleMsgChange}
                            className="form-control"
                            placeholder="jane@company.com"
                            required
                            disabled={status.submitting}
                          />
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label" htmlFor="msg_subj">Subject</label>
                        <input
                          type="text"
                          id="msg_subj"
                          name="subject"
                          value={msgForm.subject}
                          onChange={handleMsgChange}
                          className="form-control"
                          placeholder="General inquiry or platform issues..."
                          required
                          disabled={status.submitting}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="msg_text">Message Details</label>
                        <textarea
                          id="msg_text"
                          name="message"
                          value={msgForm.message}
                          onChange={handleMsgChange}
                          className="form-control"
                          placeholder="Provide details of your request..."
                          required
                          disabled={status.submitting}
                          style={{ minHeight: '120px' }}
                        />
                      </div>

                      <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px' }} disabled={status.submitting}>
                        {status.submitting ? 'Sending...' : 'Send Message'} <Send size={16} />
                      </button>
                    </form>
                  )}

                  {/* TAB 2: COST ESTIMATOR */}
                  {activeTab === 'quote' && (
                    <form onSubmit={handleQuoteSubmit}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" htmlFor="q_name">Your Name</label>
                          <input
                            type="text"
                            id="q_name"
                            name="name"
                            value={quoteForm.name}
                            onChange={handleQuoteChange}
                            className="form-control"
                            placeholder="Jane Doe"
                            required
                            disabled={status.submitting}
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" htmlFor="q_email">Email Address</label>
                          <input
                            type="email"
                            id="q_email"
                            name="email"
                            value={quoteForm.email}
                            onChange={handleQuoteChange}
                            className="form-control"
                            placeholder="jane@company.com"
                            required
                            disabled={status.submitting}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Project Type</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                          {['Website Development', 'Mobile App Development', 'UI/UX Design', 'Backend Development & API Integration', 'E-commerce Solutions', 'Networking & IT Solutions'].map(type => (
                            <SelectionCard 
                              key={type} 
                              label={type} 
                              active={quoteForm.project_type === type} 
                              onClick={() => setQuoteForm(prev => ({ ...prev, project_type: type }))} 
                            />
                          ))}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '20px' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Target Budget</label>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {['$1,000 - $5,000', '$5,000 - $10,000', '$10,000 - $25,000', '$25,000+'].map(budget => (
                              <SelectionCard 
                                key={budget} 
                                label={budget} 
                                active={quoteForm.budget === budget} 
                                onClick={() => setQuoteForm(prev => ({ ...prev, budget: budget }))} 
                              />
                            ))}
                          </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Target Timeline</label>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {['Immediate', '1 - 3 months', '3 - 6 months'].map(timeline => (
                              <SelectionCard 
                                key={timeline} 
                                label={timeline} 
                                active={quoteForm.timeline === timeline} 
                                onClick={() => setQuoteForm(prev => ({ ...prev, timeline: timeline }))} 
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="q_msg">Project Requirements Details</label>
                        <textarea
                          id="q_msg"
                          name="message"
                          value={quoteForm.message}
                          onChange={handleQuoteChange}
                          className="form-control"
                          placeholder="Detail database integrations, specific screen requirements, etc."
                          required
                          disabled={status.submitting}
                        />
                      </div>

                      {/* Estimate Result Block */}
                      <motion.div 
                        key={estimate}
                        initial={{ opacity: 0.5, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                          backgroundColor: 'rgba(var(--secondary-rgb), 0.05)',
                          borderLeft: '4px solid var(--secondary)',
                          padding: '16px 20px',
                          borderRadius: 'var(--radius-sm)',
                          marginBottom: '24px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Auto Estimated Budget</span>
                          <strong style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>${estimate.toLocaleString()}</strong>
                        </div>
                        <Calculator size={24} style={{ color: 'var(--secondary)' }} />
                      </motion.div>

                      <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px' }} disabled={status.submitting}>
                        {status.submitting ? 'Generating lead file...' : 'Request Project Quote'}
                      </button>
                    </form>
                  )}

                  {/* TAB 3: APPOINTMENT BOOKING */}
                  {activeTab === 'booking' && (
                    <form onSubmit={handleBookingSubmit}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group">
                          <label className="form-label" htmlFor="b_name">Your Name</label>
                          <input
                            type="text"
                            id="b_name"
                            name="name"
                            value={bookingForm.name}
                            onChange={handleBookingChange}
                            className="form-control"
                            placeholder="Jane Doe"
                            required
                            disabled={status.submitting}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label" htmlFor="b_email">Email Address</label>
                          <input
                            type="email"
                            id="b_email"
                            name="email"
                            value={bookingForm.email}
                            onChange={handleBookingChange}
                            className="form-control"
                            placeholder="jane@company.com"
                            required
                            disabled={status.submitting}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="b_subj">Meeting Topic</label>
                        <input
                          type="text"
                          id="b_subj"
                          name="subject"
                          value={bookingForm.subject}
                          onChange={handleBookingChange}
                          className="form-control"
                          required
                          disabled={status.submitting}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group">
                          <label className="form-label" htmlFor="b_date">Pick Date</label>
                          <div style={{ position: 'relative' }}>
                            <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                            <input
                              type="date"
                              id="b_date"
                              name="booking_date"
                              value={bookingForm.booking_date}
                              onChange={handleBookingChange}
                              className="form-control"
                              style={{ paddingLeft: '40px' }}
                              required
                              disabled={status.submitting}
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label" htmlFor="b_time">Pick Time</label>
                          <input
                            type="time"
                            id="b_time"
                            name="booking_time"
                            value={bookingForm.booking_time}
                            onChange={handleBookingChange}
                            className="form-control"
                            required
                            disabled={status.submitting}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="b_msg">Meeting Agenda (Optional)</label>
                        <textarea
                          id="b_msg"
                          name="message"
                          value={bookingForm.message}
                          onChange={handleBookingChange}
                          className="form-control"
                          placeholder="Topics to discuss or briefing details..."
                          disabled={status.submitting}
                          style={{ minHeight: '100px' }}
                        />
                      </div>

                      <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px' }} disabled={status.submitting}>
                        {status.submitting ? 'Booking meeting room...' : 'Confirm Appointment'}
                      </button>
                    </form>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}
