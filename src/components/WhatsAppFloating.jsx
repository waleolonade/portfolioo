import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function WhatsAppFloating() {
  const [whatsappLink, setWhatsappLink] = useState('https://wa.me/2348061657738');
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/cms.php`)
      .then(res => res.json())
      .then(data => {
        if (data && data.whatsapp_link) {
          setWhatsappLink(data.whatsapp_link);
        }
      })
      .catch(err => console.error('Failed to load whatsapp link', err));

    // Show tooltip after 5 seconds to invite action
    const timer = setTimeout(() => {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 6000); // hide after 6s
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ position: 'fixed', bottom: '24px', left: '24px', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '8px' }}>
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#25D366',
          color: 'white',
          border: 'none',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2), 0 0 15px rgba(37, 211, 102, 0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative'
        }}
        onMouseOver={e => {
          e.currentTarget.style.transform = 'scale(1.1)';
          setShowTooltip(true);
        }}
        onMouseOut={e => {
          e.currentTarget.style.transform = 'scale(1)';
          setShowTooltip(false);
        }}
        className="whatsapp-float-btn"
        aria-label="Chat on WhatsApp"
      >
        {/* Pulsing glow ring around it */}
        <span style={{
          position: 'absolute',
          top: '-4px',
          left: '-4px',
          right: '-4px',
          bottom: '-4px',
          borderRadius: '50%',
          border: '2px solid #25D366',
          opacity: 0.6,
          animation: 'whatsapp-pulse 2s infinite',
          pointerEvents: 'none'
        }} />
        <MessageCircle size={28} style={{ fill: 'currentColor' }} />
      </a>

      {showTooltip && (
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          fontSize: '0.825rem',
          padding: '8px 16px',
          borderRadius: '20px',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-md)',
          whiteSpace: 'nowrap',
          animation: 'fadeIn 0.2s ease-out',
          fontWeight: 600
        }}>
          Chat on WhatsApp
        </div>
      )}

      <style>{`
        @keyframes whatsapp-pulse {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
