import { useState, useEffect } from 'react';
import {
  ShieldCheck, CreditCard, Lock, Unlock, Eye, EyeOff, Key,
  CheckCircle2, XCircle, ToggleLeft, ToggleRight, Save, Send,
  AlertTriangle, Globe, Zap, Shield
} from 'lucide-react';
import { API_BASE_URL } from '../../config';

const GATEWAY_THEMES = {
  paystack: { color: '#00C3F7', gradient: 'linear-gradient(135deg, #00C3F7 0%, #0A6F96 100%)', icon: '💳', tagline: 'Nigerian & African Payments', badge: '🇳🇬 Recommended for Nigeria' },
  flutterwave: { color: '#F5A623', gradient: 'linear-gradient(135deg, #F5A623 0%, #E8720C 100%)', icon: '🦋', tagline: 'Pan-African Payment Gateway', badge: '🌍 Recommended for Africa' },
  stripe: { color: '#635BFF', gradient: 'linear-gradient(135deg, #635BFF 0%, #4C3FD4 100%)', icon: '💎', tagline: 'International Payments', badge: '🌐 Recommended for International' },
  monnify: { color: '#0066F5', gradient: 'linear-gradient(135deg, #0066F5 0%, #003D91 100%)', icon: '🏦', tagline: 'Nigerian Bank Transfers & USSD', badge: '🇳🇬 Bank Transfer Specialist' }
};

export default function PaymentGatewaysAdmin() {
  const adminToken = localStorage.getItem('adminToken');

  // OTP Gate states
  const [otpStep, setOtpStep] = useState('locked'); // locked, otp_sent, verified
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');
  const [otpError, setOtpError] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [sessionToken, setSessionToken] = useState('');

  // Gateway states
  const [gateways, setGateways] = useState([]);
  const [editingGateway, setEditingGateway] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showSecrets, setShowSecrets] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // ─── OTP: Send ───
  const handleSendOtp = async () => {
    setOtpLoading(true);
    setOtpError('');
    setOtpMessage('');
    setDevOtp('');
    try {
      const res = await fetch(`${API_BASE_URL}/payment_gateways.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({ action: 'send_otp' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOtpStep('otp_sent');
        setOtpMessage(data.message);
        if (data.dev_otp) setDevOtp(data.dev_otp);
      } else {
        setOtpError(data.message || 'Failed to send OTP.');
      }
    } catch (err) {
      setOtpError('Network error. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  // ─── OTP: Verify ───
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode.trim()) return;
    setOtpLoading(true);
    setOtpError('');
    try {
      const res = await fetch(`${API_BASE_URL}/payment_gateways.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({ action: 'verify_otp', otp_code: otpCode })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSessionToken(data.session_token);
        setOtpStep('verified');
        fetchGateways(data.session_token);
      } else {
        setOtpError(data.message || 'Invalid OTP.');
      }
    } catch (err) {
      setOtpError('Network error.');
    } finally {
      setOtpLoading(false);
    }
  };

  // ─── Fetch Gateways (Admin — with secrets) ───
  const fetchGateways = async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/payment_gateways.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({ action: 'get_admin_gateways', session_token: token || sessionToken })
      });
      const data = await res.json();
      if (data.success) {
        setGateways(data.gateways);
      }
    } catch (err) {
      console.error('Failed to fetch gateways:', err);
    }
  };

  // ─── Save Gateway Config ───
  const handleSaveGateway = async (gatewayName) => {
    setSaving(true);
    setSaveMessage('');
    try {
      const res = await fetch(`${API_BASE_URL}/payment_gateways.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({
          action: 'update_gateway',
          session_token: sessionToken,
          gateway_name: gatewayName,
          ...editForm
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSaveMessage(data.message);
        setEditingGateway(null);
        fetchGateways();
      } else {
        setSaveMessage(data.message || 'Save failed.');
      }
    } catch (err) {
      setSaveMessage('Network error.');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(''), 4000);
    }
  };

  // ─── Toggle Gateway ───
  const handleToggleGateway = async (gatewayName) => {
    try {
      const res = await fetch(`${API_BASE_URL}/payment_gateways.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({ action: 'toggle_gateway', session_token: sessionToken, gateway_name: gatewayName })
      });
      if (res.ok) fetchGateways();
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  // ─── Start editing a gateway ───
  const startEditing = (gw) => {
    setEditingGateway(gw.gateway_name);
    setEditForm({
      public_key: gw.public_key || '',
      secret_key: gw.secret_key || '',
      callback_url: gw.callback_url || '',
      webhook_secret: gw.webhook_secret || '',
      is_enabled: gw.is_enabled,
      is_live_mode: gw.is_live_mode
    });
  };

  // ════════════════════════════════════════════════════════
  // RENDER: OTP SECURITY GATE
  // ════════════════════════════════════════════════════════
  if (otpStep !== 'verified') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', padding: '40px' }}>
        <div className="card" style={{
          maxWidth: '480px', width: '100%', padding: '48px 40px', textAlign: 'center',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
        }}>
          {/* Shield Icon */}
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(139,92,246,0.15) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <Shield size={36} style={{ color: 'var(--primary)' }} />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>
            Payment Gateway Security
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '32px', lineHeight: 1.5 }}>
            This section contains sensitive API keys and credentials.
            High-level verification is required before access is granted.
          </p>

          {otpStep === 'locked' && (
            <div>
              <button
                onClick={handleSendOtp}
                disabled={otpLoading}
                className="btn btn-primary"
                style={{ padding: '14px 32px', fontSize: '0.95rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
              >
                {otpLoading ? (
                  <><span className="spinner" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }}></span> Sending OTP...</>
                ) : (
                  <><Lock size={18} /> Request Security Access</>
                )}
              </button>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '16px' }}>
                A 6-digit verification code will be sent to your admin email.
              </p>
            </div>
          )}

          {otpStep === 'otp_sent' && (
            <div>
              {otpMessage && (
                <div style={{ padding: '12px 16px', backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '0.85rem', color: '#10b981' }}>
                  <CheckCircle2 size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                  {otpMessage}
                </div>
              )}

              {devOtp && (
                <div style={{ padding: '12px 16px', backgroundColor: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '0.85rem', color: '#f59e0b' }}>
                  <AlertTriangle size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                  Dev Mode OTP: <strong style={{ letterSpacing: '4px', fontSize: '1.1rem' }}>{devOtp}</strong>
                </div>
              )}

              <form onSubmit={handleVerifyOtp}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit code"
                    className="form-control"
                    style={{ textAlign: 'center', fontSize: '1.3rem', letterSpacing: '8px', fontWeight: 700, padding: '14px' }}
                    maxLength={6}
                    autoFocus
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={otpCode.length !== 6 || otpLoading}
                  className="btn btn-primary"
                  style={{ padding: '14px 32px', fontSize: '0.95rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                >
                  {otpLoading ? 'Verifying...' : <><Unlock size={18} /> Verify & Access</>}
                </button>
              </form>

              <button onClick={handleSendOtp} disabled={otpLoading} style={{ marginTop: '16px', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}>
                Resend OTP
              </button>
            </div>
          )}

          {otpError && (
            <div style={{ padding: '12px 16px', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-sm)', marginTop: '16px', fontSize: '0.85rem', color: '#ef4444' }}>
              <XCircle size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
              {otpError}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════
  // RENDER: GATEWAY CONFIGURATION DASHBOARD
  // ════════════════════════════════════════════════════════
  return (
    <div style={{ padding: '0' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <CreditCard size={24} style={{ color: 'var(--primary)' }} /> Payment Gateways
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Configure API keys and enable/disable payment providers for client checkout.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', backgroundColor: 'rgba(16,185,129,0.1)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16,185,129,0.3)' }}>
          <ShieldCheck size={16} style={{ color: '#10b981' }} />
          <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>OTP Verified</span>
        </div>
      </div>

      {saveMessage && (
        <div style={{ padding: '12px 16px', backgroundColor: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '0.85rem', color: 'var(--primary)' }}>
          {saveMessage}
        </div>
      )}

      {/* Gateway Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
        {gateways.map((gw) => {
          const theme = GATEWAY_THEMES[gw.gateway_name] || { color: '#888', gradient: 'linear-gradient(135deg, #888, #555)', icon: '💳', tagline: 'Payment Gateway', badge: '' };
          const isEditing = editingGateway === gw.gateway_name;

          return (
            <div key={gw.gateway_name} className="card" style={{
              padding: '0', overflow: 'hidden',
              border: gw.is_enabled ? `2px solid ${theme.color}33` : '1px solid var(--border)',
              transition: 'all 0.3s ease',
              opacity: gw.is_enabled ? 1 : 0.7
            }}>
              {/* Card Header */}
              <div style={{
                background: theme.gradient,
                padding: '20px 24px',
                color: '#fff',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '2rem' }}>{theme.icon}</span>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>{gw.display_name}</h3>
                    <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>{theme.tagline}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleGateway(gw.gateway_name)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff' }}
                  title={gw.is_enabled ? 'Disable' : 'Enable'}
                >
                  {gw.is_enabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} style={{ opacity: 0.5 }} />}
                </button>
              </div>

              {/* Card Body */}
              <div style={{ padding: '20px 24px' }}>
                {/* Status Badges */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700,
                    backgroundColor: gw.is_enabled ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                    color: gw.is_enabled ? '#10b981' : '#ef4444'
                  }}>
                    {gw.is_enabled ? '● Active' : '○ Disabled'}
                  </span>
                  <span style={{
                    padding: '3px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700,
                    backgroundColor: gw.is_live_mode ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                    color: gw.is_live_mode ? '#ef4444' : '#f59e0b'
                  }}>
                    {gw.is_live_mode ? '🔴 LIVE' : '🟡 TEST'}
                  </span>
                  {theme.badge && (
                    <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 600, backgroundColor: 'rgba(59,130,246,0.08)', color: 'var(--primary)' }}>
                      {theme.badge}
                    </span>
                  )}
                </div>

                {!isEditing ? (
                  /* View Mode */
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      <div style={{ marginBottom: '6px' }}>
                        <Key size={12} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                        Public Key: <strong style={{ color: 'var(--text-primary)' }}>{gw.public_key ? gw.public_key.substring(0, 20) + '...' : 'Not configured'}</strong>
                      </div>
                      <div style={{ marginBottom: '6px' }}>
                        <Lock size={12} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                        Secret Key: <strong style={{ color: 'var(--text-primary)' }}>{gw.secret_key_masked || 'Not configured'}</strong>
                      </div>
                      {gw.callback_url && (
                        <div style={{ marginBottom: '6px' }}>
                          <Globe size={12} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                          Callback: <strong style={{ color: 'var(--text-primary)' }}>{gw.callback_url.substring(0, 30)}...</strong>
                        </div>
                      )}
                    </div>
                    <button onClick={() => startEditing(gw)} className="btn btn-outline" style={{ width: '100%', padding: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Key size={14} /> Configure Keys
                    </button>
                  </div>
                ) : (
                  /* Edit Mode */
                  <div>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Public Key</label>
                      <input type="text" className="form-control" value={editForm.public_key || ''} onChange={(e) => setEditForm(prev => ({ ...prev, public_key: e.target.value }))} placeholder="pk_test_xxxxx or FLWPUBK-xxxxx" style={{ fontSize: '0.8rem', padding: '8px 12px' }} />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        Secret Key
                        <button type="button" onClick={() => setShowSecrets(prev => ({ ...prev, [gw.gateway_name]: !prev[gw.gateway_name] }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: 0 }}>
                          {showSecrets[gw.gateway_name] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </label>
                      <input type={showSecrets[gw.gateway_name] ? 'text' : 'password'} className="form-control" value={editForm.secret_key || ''} onChange={(e) => setEditForm(prev => ({ ...prev, secret_key: e.target.value }))} placeholder="sk_test_xxxxx or FLWSECK-xxxxx" style={{ fontSize: '0.8rem', padding: '8px 12px' }} />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Callback URL</label>
                      <input type="text" className="form-control" value={editForm.callback_url || ''} onChange={(e) => setEditForm(prev => ({ ...prev, callback_url: e.target.value }))} placeholder="https://yourdomain.com/callback" style={{ fontSize: '0.8rem', padding: '8px 12px' }} />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                        {gw.gateway_name === 'monnify' ? 'Contract Code' : 'Webhook Secret'}
                      </label>
                      <input type="text" className="form-control" value={editForm.webhook_secret || ''} onChange={(e) => setEditForm(prev => ({ ...prev, webhook_secret: e.target.value }))} placeholder={gw.gateway_name === 'monnify' ? 'Contract code from Monnify' : 'whsec_xxxxx'} style={{ fontSize: '0.8rem', padding: '8px 12px' }} />
                    </div>

                    {/* Mode Toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', padding: '10px 14px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {editForm.is_live_mode ? '🔴 Live Mode' : '🟡 Test/Sandbox Mode'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditForm(prev => ({ ...prev, is_live_mode: prev.is_live_mode ? 0 : 1 }))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: editForm.is_live_mode ? '#ef4444' : '#f59e0b' }}
                      >
                        {editForm.is_live_mode ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleSaveGateway(gw.gateway_name)}
                        disabled={saving}
                        className="btn btn-primary"
                        style={{ flex: 1, padding: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        <Save size={14} /> {saving ? 'Saving...' : 'Save Configuration'}
                      </button>
                      <button onClick={() => setEditingGateway(null)} className="btn btn-outline" style={{ padding: '10px 16px', fontSize: '0.85rem' }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Updated timestamp */}
              {gw.updated_at && (
                <div style={{ padding: '8px 24px 12px', fontSize: '0.7rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>
                  Last updated: {new Date(gw.updated_at).toLocaleString()}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Supported Payment Methods Summary */}
      <div className="card" style={{ padding: '24px', marginTop: '24px' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={18} style={{ color: 'var(--accent)' }} /> Supported Payment Methods
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
          {[
            { icon: '💳', name: 'Debit/Credit Cards', gateways: 'All' },
            { icon: '🏦', name: 'Bank Transfers', gateways: 'Paystack, Flutterwave, Monnify' },
            { icon: '📱', name: 'USSD', gateways: 'Paystack, Flutterwave, Monnify' },
            { icon: '🏧', name: 'Virtual Accounts', gateways: 'Monnify, Flutterwave' },
            { icon: '', name: 'Apple Pay', gateways: 'Stripe' },
            { icon: '🔗', name: 'Google Pay', gateways: 'Stripe' },
            { icon: '📲', name: 'Mobile Money', gateways: 'Flutterwave' },
            { icon: '🌍', name: 'International', gateways: 'Stripe, Flutterwave' }
          ].map((pm, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '1.2rem' }}>{pm.icon}</span>
              <div>
                <strong style={{ fontSize: '0.8rem', display: 'block', color: 'var(--text-primary)' }}>{pm.name}</strong>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{pm.gateways}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CSS for spinner animation */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
