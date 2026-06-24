import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (localStorage.getItem('adminToken')) {
      navigate('/admin');
    }
  }, [navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please provide both username and password.');
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`${API_BASE_URL}/auth.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
      .then(res => res.json().then(data => ({ status: res.status, data })))
      .then(({ status: statusCode, data }) => {
        if (statusCode !== 200) {
          throw new Error(data.message || 'Authentication failed.');
        }
        
        // Save token and user details to localStorage
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        
        // Redirect to admin dashboard
        navigate('/admin');
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary)',
      padding: '24px',
      position: 'relative'
    }}>
      
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
        <ArrowLeft size={16} /> Back to Website
      </Link>

      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '40px 32px', textAlign: 'center' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'rgba(var(--primary-rgb), 0.1)',
          color: 'var(--primary)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px'
        }}>
          <ShieldCheck size={28} />
        </div>
        
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Admin Portal</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '32px' }}>
          Authenticate to access project configurations and client inquiries database.
        </p>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--error)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '24px',
            fontSize: '0.85rem',
            textAlign: 'left'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-control"
              placeholder="e.g. admin"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label className="form-label" htmlFor="password">Password</label>
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

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <Lock size={16} style={{ marginLeft: '6px' }} />
          </button>
        </form>
        
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '24px' }}>
          Default Credentials: admin / adminpassword
        </p>
      </div>
    </div>
  );
}
