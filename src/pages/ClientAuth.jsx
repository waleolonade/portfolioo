import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, LogIn, AlertCircle, ArrowLeft, Terminal, Shield } from 'lucide-react';
import { API_BASE_URL } from '../config';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ClientAuth({ onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [regStep, setRegStep] = useState(1); // 1: Credentials, 2: Project Details
  
  // Credentials
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Project Details
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectBudget, setProjectBudget] = useState('4000');
  const [currency, setCurrency] = useState('$');
  const [projectStack, setProjectStack] = useState('web_app');
  const [targetDate, setTargetDate] = useState('');

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Set default target date dynamically on load
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 45);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    setTargetDate(`${months[futureDate.getMonth()]} ${futureDate.getDate()}, ${futureDate.getFullYear()}`);

    // If client already logged in, redirect directly to portal
    if (localStorage.getItem('clientToken')) {
      navigate('/portal');
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!username || !password) {
      setError('Username and password fields are required.');
      return;
    }

    if (isRegister) {
      if (regStep === 1) {
        if (!email.trim() || !email.includes('@')) {
          setError('Please provide a valid client email address for invoicing and OTP access.');
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          return;
        }
        if (username.length < 3) {
          setError('Username must be at least 3 characters.');
          return;
        }
        // Move to step 2
        setRegStep(2);
        return;
      }

      if (!projectTitle.trim()) {
        setError('Project Title is required.');
        return;
      }
    }

    setLoading(true);

    const endpoint = isRegister ? 'register.php' : 'auth.php';
    const payload = isRegister 
      ? { 
          username: username.trim(), 
          password, 
          email: email.trim(), 
          project_title: projectTitle.trim(), 
          project_desc: projectDesc.trim(), 
          project_budget: parseFloat(projectBudget) || 4000, 
          currency, 
          project_stack: projectStack,
          target_date: targetDate
        }
      : { username: username.trim(), password };

    fetch(`${API_BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json().then(data => ({ status: res.status, data })))
      .then(({ status: statusCode, data }) => {
        if (statusCode !== 200 && statusCode !== 201) {
          throw new Error(data.message || 'Authentication request failed.');
        }

        // Save token and user details
        localStorage.setItem('clientToken', data.token);
        localStorage.setItem('clientUser', JSON.stringify(data.user));

        setSuccess(isRegister ? 'Workspace created successfully! Redirecting...' : 'Access granted! Redirecting...');
        
        setTimeout(() => {
          if (onAuthSuccess) {
            onAuthSuccess(data.token, data.user);
          } else {
            navigate('/portal');
          }
        }, 1200);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  return (
    <div className="page-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />
      
      <main style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', position: 'relative' }}>
        {/* Animated background glow */}
        <div style={{ position: 'absolute', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(var(--primary-rgb), 0.15) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 0 }} />

        <div className="card" style={{
          width: '100%',
          maxWidth: '420px',
          padding: '40px 32px',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--border)',
          backgroundColor: 'rgba(var(--bg-secondary-rgb), 0.8)',
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.1)',
          borderRadius: '24px',
          textAlign: 'left',
          position: 'relative',
          zIndex: 1
        }}>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(var(--primary-rgb), 0.2), rgba(var(--primary-rgb), 0.05))',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(var(--primary-rgb), 0.2)'
            }}>
              {isRegister ? <UserPlus size={28} /> : <LogIn size={28} />}
            </div>
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, textAlign: 'center', marginBottom: '6px', color: 'var(--text-primary)' }}>
            {isRegister 
              ? (regStep === 1 ? 'Create Workspace' : 'Project Specs') 
              : 'Client Portal Login'}
          </h2>
          
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '30px' }}>
            {isRegister 
              ? (regStep === 1 ? 'Step 1 of 2: Secure credentials' : 'Step 2 of 2: Scope & details') 
              : 'Sign in to access your project dashboard.'}
          </p>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              color: 'var(--error)',
              padding: '12px 14px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '0.85rem',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              color: 'var(--success)',
              padding: '12px 14px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '0.85rem',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <Terminal size={16} style={{ flexShrink: 0 }} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {(!isRegister || regStep === 1) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>Workspace Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="form-control"
                    placeholder="e.g. logistics_corp"
                    style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}
                    disabled={loading}
                    required
                  />
                </div>

                {isRegister && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>Notification Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-control"
                      placeholder="client@company.com"
                      style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}
                      disabled={loading}
                      required
                    />
                  </div>
                )}

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Security Password</label>
                    {!isRegister && <span style={{ fontSize: '0.75rem', color: 'var(--primary)', cursor: 'pointer' }}>Forgot?</span>}
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-control"
                    placeholder="••••••••"
                    style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}
                    disabled={loading}
                    required
                  />
                </div>

                {isRegister && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="form-control"
                      placeholder="••••••••"
                      style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}
                      disabled={loading}
                      required
                    />
                  </div>
                )}
              </div>
            )}

            {isRegister && regStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>Project Title</label>
                  <input
                    type="text"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    className="form-control"
                    placeholder="e.g. Fintech App"
                    style={{ padding: '10px 14px', borderRadius: '8px' }}
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>Platform Stack</label>
                  <select
                    value={projectStack}
                    onChange={(e) => setProjectStack(e.target.value)}
                    className="form-control"
                    style={{ padding: '10px 14px', borderRadius: '8px' }}
                    disabled={loading}
                  >
                    <option value="web_app">Next.js Web App</option>
                    <option value="mobile_app">React Native Mobile App</option>
                    <option value="backend">Node.js API</option>
                    <option value="php_site">PHP Website</option>
                    <option value="fullstack">Full-Stack System</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1.5 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>Budget</label>
                    <input
                      type="number"
                      value={projectBudget}
                      onChange={(e) => setProjectBudget(e.target.value)}
                      className="form-control"
                      placeholder="4000"
                      style={{ padding: '10px 14px', borderRadius: '8px' }}
                      disabled={loading}
                      required
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="form-control"
                      style={{ padding: '10px 14px', borderRadius: '8px' }}
                      disabled={loading}
                    >
                      <option value="$">USD</option>
                      <option value="₦">NGN</option>
                      <option value="€">EUR</option>
                      <option value="£">GBP</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>Target Date</label>
                  <input
                    type="text"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="form-control"
                    placeholder="August 15, 2026"
                    style={{ padding: '10px 14px', borderRadius: '8px' }}
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            )}

            <div style={{ marginTop: '28px', display: 'flex', gap: '12px' }}>
              {isRegister && regStep === 2 && (
                <button
                  type="button"
                  onClick={() => setRegStep(1)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '10px',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  disabled={loading}
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all"
                style={{
                  flex: 2,
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '0.95rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                }}
                disabled={loading}
              >
                {loading 
                  ? 'Processing...' 
                  : isRegister 
                    ? (regStep === 1 ? 'Continue to Specs' : 'Create Workspace') 
                    : 'Secure Sign In'}
              </button>
            </div>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <button
              onClick={() => { setError(null); setIsRegister(!isRegister); setRegStep(1); }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.color = 'var(--primary)'}
              onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}
            >
              {isRegister 
                ? 'Already have an account? Log in' 
                : 'Need a new workspace? Register here'}
            </button>
          </div>
          
          <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', opacity: 0.8 }}>
            <Shield size={12} />
            <span>End-to-End Encrypted via SHA-256</span>
          </div>

        </div>
      </main>

    </div>
  );
}
