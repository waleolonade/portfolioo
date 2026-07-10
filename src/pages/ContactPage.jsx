import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageCircle, Calendar as CalendarIcon } from 'lucide-react';

export default function ContactPage() {
  const location = useLocation();
  const [formData, setFormData] = useState({ name: '', email: '', service: '', message: '' });
  const [status, setStatus] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (location.state) {
      setFormData(prev => ({
        ...prev,
        service: location.state.prefilledService || prev.service,
        message: location.state.prefilledMessage || prev.message
      }));
    }
  }, [location.state]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('sending');
    setTimeout(() => {
      setStatus('success');
      setFormData({ name: '', email: '', service: '', message: '' });
      setTimeout(() => setStatus(null), 5000);
    }, 1500);
  };

  return (
    <div className="page-container flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-20">
        <div className="container max-w-6xl">
          
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
              Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-teal-400">Touch</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Ready to start your next project? Reach out to us via form, email, WhatsApp, or schedule a direct consultation.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            
            {/* Left Column: Form */}
            <motion.div 
              className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 relative overflow-hidden"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full pointer-events-none" />
              
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Send a Message</h2>
              
              <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Full Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      required 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      required 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Interested Service</label>
                  <select 
                    name="service" 
                    value={formData.service} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
                  >
                    <option value="">Select a service...</option>
                    <option value="web">Web Application Development</option>
                    <option value="mobile">Mobile App Development</option>
                    <option value="ecommerce">E-Commerce Setup</option>
                    <option value="design">UI/UX Design</option>
                    <option value="other">Other / Consultation</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Message</label>
                  <textarea 
                    name="message" 
                    value={formData.message} 
                    onChange={handleChange} 
                    required 
                    rows="5"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors resize-y"
                    placeholder="Tell us about your project..."
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={status === 'sending'}
                  className="mt-2 w-full py-4 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-400 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
                >
                  {status === 'sending' ? 'Sending...' : <><Send size={18} /> Send Message</>}
                </button>
                
                {status === 'success' && (
                  <div className="p-3 bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 text-teal-600 dark:text-teal-400 rounded-lg text-sm font-bold text-center">
                    Message sent successfully! We will reach out soon.
                  </div>
                )}
              </form>
            </motion.div>

            {/* Right Column: Direct Info, Booking, Map */}
            <motion.div 
              className="flex flex-col gap-8"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {/* Direct Contacts Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a href="mailto:hello@brainfeels.tech" className="flex items-center gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-indigo-500/50 transition-colors group">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email Us</h3>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">hello@brainfeels</p>
                  </div>
                </a>
                
                <a href="tel:+1234567890" className="flex items-center gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-teal-500/50 transition-colors group">
                  <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center text-teal-500 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                    <Phone size={20} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Call Us</h3>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">+1 (234) 567-890</p>
                  </div>
                </a>

                <a href="https://wa.me/1234567890" target="_blank" rel="noreferrer" className="flex items-center gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-green-500/50 transition-colors group">
                  <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-500/10 flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors">
                    <MessageCircle size={20} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">WhatsApp</h3>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Chat instantly</p>
                  </div>
                </a>
                
                <a href="https://calendly.com" target="_blank" rel="noreferrer" className="flex items-center gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-amber-500/50 transition-colors group">
                  <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                    <CalendarIcon size={20} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Booking</h3>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Schedule Call</p>
                  </div>
                </a>
              </div>

              {/* Map & Address */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-2 overflow-hidden shadow-sm">
                <div className="w-full h-48 md:h-56 bg-slate-200 dark:bg-slate-800 rounded-2xl overflow-hidden relative group">
                  <iframe 
                    title="Location Map"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1713430000000!5m2!1sen!2sus" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0, filter: 'grayscale(1) contrast(1.2) opacity(0.8)' }} 
                    allowFullScreen="" 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    className="group-hover:filter-none transition-all duration-700"
                  />
                  {/* Overlay Address Badge */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-white/20 dark:border-slate-700/50 flex items-start gap-3 shadow-lg pointer-events-none">
                    <MapPin className="text-indigo-500 shrink-0 mt-0.5" size={18} />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Global Headquarters</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400">123 Innovation Drive, Tech District, NY 10001</p>
                    </div>
                  </div>
                </div>
              </div>
              
            </motion.div>
          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
}
