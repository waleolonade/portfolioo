import React, { useState, useEffect, useContext } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { CmsContext } from '../App';

export default function WhatsAppFloating() {
  const { cms } = useContext(CmsContext);
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const whatsappHub = (() => {
    try {
      return typeof cms.cms_whatsapp_hub === 'string'
        ? JSON.parse(cms.cms_whatsapp_hub)
        : cms.cms_whatsapp_hub || {};
    } catch (e) {
      return {};
    }
  })();

  useEffect(() => {
    // Show tooltip after 5 seconds to invite action
    const timer = setTimeout(() => {
      if (!isOpen) {
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 6000); // hide after 6s
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [isOpen]);

  const widgetEnabled = whatsappHub.widget_enabled !== false;
  const widgetTitle = whatsappHub.widget_title || 'Need Help? Chat with Us';
  const widgetSubtitle = whatsappHub.widget_subtitle || 'We usually respond in a few minutes';
  const agents = whatsappHub.agents || [];

  if (!widgetEnabled) return null;

  const handleAgentClick = (agent) => {
    const text = encodeURIComponent(agent.welcome_message || 'Hello, I need assistance.');
    const url = `https://wa.me/${agent.phone}?text=${text}`;
    window.open(url, '_blank');
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', left: '24px', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      
      {/* Agents Selector Overlay Card */}
      {isOpen && (
        <div className="whatsapp-card" style={{
          width: '320px',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
          overflow: 'hidden',
          marginBottom: '16px',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          textAlign: 'left'
        }}>
          {/* Header */}
          <div style={{
            backgroundColor: '#128C7E',
            padding: '20px',
            color: 'white',
            position: 'relative'
          }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{widgetTitle}</h4>
            <p style={{ fontSize: '0.75rem', opacity: 0.9, margin: '4px 0 0' }}>{widgetSubtitle}</p>
            <button 
              onClick={() => setIsOpen(false)} 
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                opacity: 0.8,
                padding: '4px'
              }}
              onMouseOver={e => e.currentTarget.style.opacity = '1'}
              onMouseOut={e => e.currentTarget.style.opacity = '0.8'}
              aria-label="Close panel"
            >
              <X size={18} />
            </button>
          </div>

          {/* Agents List */}
          <div style={{ padding: '12px 0', maxHeight: '300px', overflowY: 'auto' }}>
            {agents.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No active support agents configured.
              </div>
            ) : (
              agents.map((agent) => (
                <div 
                  key={agent.id}
                  onClick={() => handleAgentClick(agent)}
                  className="whatsapp-agent-row"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 20px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                >
                  {/* Avatar wrapper */}
                  <div style={{ position: 'relative' }}>
                    <img 
                      src={agent.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80'} 
                      alt={agent.name}
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                      onError={e => e.target.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                    />
                    {agent.is_online !== false && (
                      <span style={{
                        position: 'absolute',
                        bottom: '2px',
                        right: '2px',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: '#25D366',
                        border: '2px solid var(--bg-secondary)'
                      }} />
                    )}
                  </div>

                  {/* Agent Metadata */}
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{agent.name}</strong>
                      <span style={{ 
                        fontSize: '0.65rem', 
                        fontWeight: 700, 
                        color: 'var(--primary)', 
                        backgroundColor: 'rgba(var(--primary-rgb), 0.08)',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>{agent.department}</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                      {agent.is_online !== false ? 'Online • Ready to assist' : 'Offline'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Floating Activator Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setShowTooltip(false);
          }}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: isOpen ? '#1f2937' : '#25D366',
            color: 'white',
            border: 'none',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2), 0 0 15px rgba(37, 211, 102, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            outline: 'none'
          }}
          onMouseOver={e => {
            e.currentTarget.style.transform = 'scale(1.08)';
            if (!isOpen) setShowTooltip(true);
          }}
          onMouseOut={e => {
            e.currentTarget.style.transform = 'scale(1)';
            setShowTooltip(false);
          }}
          className="whatsapp-float-btn"
          aria-label="Toggle WhatsApp Help Center"
        >
          {/* Pulsing glow ring around it */}
          {!isOpen && (
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
          )}
          {isOpen ? <X size={24} /> : <MessageCircle size={28} style={{ fill: 'currentColor' }} />}
        </button>

        {showTooltip && !isOpen && (
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
            Need help? Chat with us
          </div>
        )}
      </div>

      <style>{`
        @keyframes whatsapp-pulse {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .whatsapp-agent-row:hover {
          background-color: rgba(var(--primary-rgb), 0.04);
        }
      `}</style>
    </div>
  );
}
