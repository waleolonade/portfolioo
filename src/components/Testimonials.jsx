import React, { useState, useEffect } from 'react';
import { Quote, Star } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/testimonials.php`)
      .then(res => res.json())
      .then(data => {
        setTestimonials(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load testimonials', err);
        setLoading(false);
      });
  }, []);

  if (loading) return null; // Simple load hide, or keep subtle placeholder
  if (testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="section" style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container">
        <h2 className="section-title">Client Testimonials</h2>
        <p className="section-subtitle">
          Read what VP level engineering managers and CTOs say about our deployment speed and technical execution.
        </p>

        <div className="grid grid-2" style={{ gap: '30px' }}>
          {testimonials.map((t) => (
            <div 
              key={t.id} 
              className="card" 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '20px', 
                textAlign: 'left', 
                position: 'relative',
                justifyContent: 'space-between',
                height: '100%'
              }}
            >
              <div style={{ position: 'absolute', top: '24px', right: '24px', color: 'rgba(var(--primary-rgb), 0.1)' }}>
                <Quote size={40} style={{ strokeWidth: 3 }} />
              </div>

              <div>
                <div style={{ display: 'flex', gap: '2px', marginBottom: '14px' }}>
                  {[...Array(parseInt(t.rating || 5))].map((_, starIdx) => (
                    <Star key={starIdx} size={16} style={{ fill: '#eab308', stroke: '#eab308' }} />
                  ))}
                </div>

                <p style={{ 
                  fontSize: '0.975rem', 
                  color: 'var(--text-secondary)', 
                  lineHeight: 1.6, 
                  fontStyle: 'italic',
                  marginBottom: '24px'
                }}>
                  "{t.text}"
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <img 
                  src={t.image_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80'} 
                  alt={t.client_name}
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80';
                  }}
                />
                <div>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)', display: 'block' }}>
                    {t.client_name}
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {t.client_role} at {t.company_name}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
