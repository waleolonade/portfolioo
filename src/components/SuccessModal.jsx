import React from 'react';
import { Check, X, Calendar, FileText, Briefcase, DollarSign } from 'lucide-react';

export default function SuccessModal({
  isOpen,
  onClose,
  invoice,
  amountPaid,
  gatewayName,
  reference
}) {
  if (!isOpen || !invoice) return null;

  const currencySymbol = invoice.currency || '$';
  const milestoneName = invoice.milestone_name || 'Project Setup / Milestone payment';
  
  return (
    <>
      <style>{`
        @keyframes smFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes smSlideUp {
          from { transform: scale(0.9) translateY(40px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes smThumbsUp {
          0% { transform: scale(0.3) rotate(-15deg); opacity: 0; }
          50% { transform: scale(1.1) rotate(10deg); }
          70% { transform: scale(0.95) rotate(-5deg); }
          100% { transform: scale(1) rotate(0); opacity: 1; }
        }
        @keyframes smSparkle {
          0%, 100% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 1; }
        }
        .sm-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(11, 15, 25, 0.78);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          padding: 20px;
          animation: smFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .sm-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255,255,255,0.05);
          width: 100%;
          max-width: 480px;
          border-radius: 24px;
          overflow: hidden;
          animation: smSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
          position: relative;
          color: var(--text-primary);
        }
        .sm-header-glow {
          position: absolute;
          top: 0; left: 50%; transform: translateX(-50%);
          width: 80%; height: 140px;
          background: radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0) 70%);
          pointer-events: none;
        }
        .sm-thumbs-container {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 36px;
          position: relative;
        }
        .sm-thumbs-bg {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.08);
          border: 2px dashed rgba(16, 185, 129, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .sm-thumbs-svg {
          width: 55px;
          height: 55px;
          fill: #10b981;
          animation: smThumbsUp 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both;
        }
        .sm-sparkle-1 {
          position: absolute; top: 10px; right: 10px;
          font-size: 1.2rem;
          animation: smSparkle 2s infinite ease-in-out;
        }
        .sm-sparkle-2 {
          position: absolute; bottom: 10px; left: 10px;
          font-size: 1rem;
          animation: smSparkle 2s infinite ease-in-out 1s;
        }
        .sm-receipt-dashed {
          margin: 20px 0;
          border: none;
          border-top: 2px dashed var(--border);
          height: 0;
        }
      `}</style>

      <div className="sm-overlay">
        <div className="sm-card">
          <div className="sm-header-glow" />

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: '16px', right: '16px',
              background: 'var(--bg-tertiary)', border: 'none',
              width: '32px', height: '32px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-secondary)',
              transition: 'var(--transition)', zIndex: 10,
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <X size={16} />
          </button>

          {/* Icon Header */}
          <div className="sm-thumbs-container">
            <div className="sm-thumbs-bg">
              <span className="sm-sparkle-1">✨</span>
              <span className="sm-sparkle-2">⭐</span>
              {/* Thumbs Up SVG */}
              <svg className="sm-thumbs-svg" viewBox="0 0 24 24">
                <path d="M2 21h4V9H2v12zM24 10c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L15.17 1 7.58 8.59C7.22 8.95 7 9.45 7 10v9c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
              </svg>
            </div>
          </div>

          {/* Text Message */}
          <div style={{ textAlign: 'center', padding: '24px 32px 0' }}>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#10b981', margin: 0, letterSpacing: '-0.3px' }}>
              Payment Successful!
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.5 }}>
              Thank you for your payment! We have processed your transaction successfully. An automatic receipt has been added to your ledger profile below.
            </p>
          </div>

          {/* Receipt Box */}
          <div style={{ padding: '0 32px 32px' }}>
            <div className="sm-receipt-dashed" />

            <div style={{
              background: 'var(--bg-primary)',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              padding: '20px 24px',
            }}>
              {/* Brand Label */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.8px' }}>
                  Merchant Brand
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--primary)' }}>
                  Brainfeels Tech
                </span>
              </div>

              {/* Grid details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <FileText size={13} style={{ color: 'var(--text-muted)' }} /> Invoice Code:
                  </span>
                  <span style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                    {invoice.invoice_code}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Briefcase size={13} style={{ color: 'var(--text-muted)' }} /> Paid For:
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', textAlign: 'right', maxWidth: '200px' }}>
                    {milestoneName}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <DollarSign size={13} style={{ color: 'var(--text-muted)' }} /> Amount Paid:
                  </span>
                  <span style={{ fontWeight: 800, color: '#10b981' }}>
                    {currencySymbol}{Number(amountPaid).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                {gatewayName && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Method:</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                      {gatewayName}
                    </span>
                  </div>
                )}

                {reference && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Reference:</span>
                    <span style={{ fontWeight: 500, fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: '0.72rem', wordBreak: 'break-all' }}>
                      {reference}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* CTA Close */}
            <button
              onClick={onClose}
              style={{
                all: 'unset',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '100%', marginTop: '24px',
                padding: '14px 20px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                fontSize: '0.92rem', fontWeight: 800,
                textAlign: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(16,185,129,0.25)',
                transition: 'var(--transition)',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Back to Portal
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
