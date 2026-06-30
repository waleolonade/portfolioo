import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, LogIn, AlertCircle, ArrowLeft, Terminal, Shield } from 'lucide-react';
import { API_BASE_URL } from '../config';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ClientAuth({ onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
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
      setError('All fields are required.');
      return;
    }

    if (isRegister) {
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
    }

    setLoading(true);

    const endpoint = isRegister ? 'register.php' : 'auth.php';
    const payload = { username, password };

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

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, textAlign: 'center', marginBottom: '8px' }}>
            {isRegister ? 'Register Workspace' : 'Client Login'}
          </h2>
          
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '32px' }}>
            {isRegister 
              ? 'Create a secure client portal account to track progress and chat with our team.' 
              : 'Sign in to access your project files, task list, invoices, and message stream.'}
          </p>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--error)',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '24px',
              fontSize: '0.85rem'
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
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: 'var(--success)',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '24px',
              fontSize: '0.85rem'
            }}>
              <Terminal size={16} style={{ flexShrink: 0 }} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
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

            <div className="form-group" style={{ marginBottom: isRegister ? '16px' : '28px' }}>
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
              <div className="form-group" style={{ marginBottom: '28px' }}>
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

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontWeight: 700 }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : isRegister ? 'Create Workspace' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '20px', textAlign: 'center' }}>
            <button
              onClick={() => { setError(null); setIsRegister(!isRegister); }}
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
