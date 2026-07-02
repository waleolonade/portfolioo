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
      
      <main style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', position: 'relative' }}>
        {/* Back button */}
        <Link to="/" style={{
          position: 'absolute',
          top: '24px',
          left: '24px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.9rem',
          fontWeight: 600,
          color: 'var(--text-secondary)'
        }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="card" style={{
          width: '100%',
          maxWidth: '460px',
          padding: '40px 32px',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--border)',
          backgroundColor: 'rgba(var(--bg-secondary-rgb), 0.7)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
          textAlign: 'left'
        }}>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              backgroundColor: 'rgba(var(--primary-rgb), 0.1)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {isRegister ? <UserPlus size={28} /> : <LogIn size={28} />}
            </div>
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, textAlign: 'center', marginBottom: '8px', letterSpacing: '-0.3px' }}>
            {isRegister 
              ? (regStep === 1 ? 'Register Workspace (1/2)' : 'Project Details (2/2)') 
              : 'Client Login'}
          </h2>
          
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '28px', lineHeight: 1.45 }}>
            {isRegister 
              ? (regStep === 1 
                  ? 'Set up secure credentials for your digital workspace.' 
                  : 'Specify your build category, target dates, and scope budget.') 
              : 'Sign in to access your project workspace, files, and chat.'}
          </p>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              color: 'var(--error)',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '24px',
              fontSize: '0.82rem',
              lineHeight: 1.4,
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
              borderRadius: 'var(--radius-sm)',
              marginBottom: '24px',
              fontSize: '0.82rem',
              lineHeight: 1.4,
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <Terminal size={16} style={{ flexShrink: 0 }} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* ════ STEP 1: CREDENTIALS ════ */}
            {(!isRegister || regStep === 1) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="username">Workspace Username</label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="form-control"
                    placeholder="e.g. logistics_corp"
                    disabled={loading}
                    required
                  />
                </div>

                {isRegister && (
                  <div className="form-group">
                    <label className="form-label" htmlFor="email">Notification Email</label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-control"
                      placeholder="client@company.com"
                      disabled={loading}
                      required
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label" htmlFor="password">Security Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-control"
                    placeholder="••••••••"
                    disabled={loading}
                    required
                  />
                </div>

                {isRegister && (
                  <div className="form-group">
                    <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="form-control"
                      placeholder="••••••••"
                      disabled={loading}
                      required
                    />
                  </div>
                )}
              </div>
            )}

            {/* ════ STEP 2: PROJECT SPECS ════ */}
            {isRegister && regStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="projectTitle">Project Title</label>
                  <input
                    type="text"
                    id="projectTitle"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    className="form-control"
                    placeholder="e.g. Logistics Portal App"
                    disabled={loading}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="projectStack">Platform Category / Stack</label>
                  <select
                    id="projectStack"
                    value={projectStack}
                    onChange={(e) => setProjectStack(e.target.value)}
                    className="form-control"
                    style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', padding: '10px' }}
                    disabled={loading}
                  >
                    <option value="web_app">Next.js / React Web App</option>
                    <option value="mobile_app">Expo / React Native Mobile App</option>
                    <option value="backend">Node.js Backend / API</option>
                    <option value="php_site">PHP / Laravel Website</option>
                    <option value="fullstack">Full-Stack Application</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1.5 }}>
                    <label className="form-label" htmlFor="projectBudget">Project Budget</label>
                    <input
                      type="number"
                      id="projectBudget"
                      value={projectBudget}
                      onChange={(e) => setProjectBudget(e.target.value)}
                      className="form-control"
                      placeholder="4000"
                      disabled={loading}
                      required
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="form-label" htmlFor="currency">Currency</label>
                    <select
                      id="currency"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="form-control"
                      style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', padding: '10px' }}
                      disabled={loading}
                    >
                      <option value="$">USD ($)</option>
                      <option value="₦">NGN (₦)</option>
                      <option value="€">EUR (€)</option>
                      <option value="£">GBP (£)</option>
                      <option value="C$">CAD (C$)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="targetDate">Target Launch Date</label>
                  <input
                    type="text"
                    id="targetDate"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="form-control"
                    placeholder="August 15, 2026"
                    disabled={loading}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="projectDesc">Short Description (Optional)</label>
                  <textarea
                    id="projectDesc"
                    value={projectDesc}
                    onChange={(e) => setProjectDesc(e.target.value)}
                    className="form-control"
                    placeholder="Brief description of your business goal..."
                    rows={2}
                    style={{ fontSize: '0.85rem', resize: 'vertical' }}
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            <div style={{ marginTop: '24px', display: 'flex', gap: '10px' }}>
              {isRegister && regStep === 2 && (
                <button
                  type="button"
                  onClick={() => setRegStep(1)}
                  className="btn btn-outline"
                  style={{ flex: 1, padding: '12px', fontWeight: 700 }}
                  disabled={loading}
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 2, padding: '12px', fontWeight: 700 }}
                disabled={loading}
              >
                {loading 
                  ? 'Processing...' 
                  : isRegister 
                    ? (regStep === 1 ? 'Next: Project Details' : 'Create Workspace') 
                    : 'Sign In'}
              </button>
            </div>
          </form>

          <div style={{ marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '20px', textAlign: 'center' }}>
            <button
              onClick={() => { setError(null); setIsRegister(!isRegister); setRegStep(1); }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {isRegister ? 'Already have a project? Log in here' : 'New Client? Register project workspace'}
            </button>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <Shield size={12} />
            <span>Encrypted with SHA-256 signatures</span>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
