import { useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AdminContext } from '../AdminContext';
import { CmsContext } from '../../CmsContext';
import { API_BASE_URL } from '../../config';
import { 
  Save, 
  Plus, 
  Trash2, 
  Globe, 
  Briefcase, 
  Award, 
  Sliders, 
  Code,
  FileCode,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Undo,
  Redo,
  Mail,
  Link,
  Zap,
  Info,
  CheckCircle,
  Upload,
  X
} from 'lucide-react';

function ImageUploader({ label, value, onChange, hint, accept = "image/*", isDoc = false }) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);
  const upload = async (file) => {
    if (!file) return;
    setUploading(true); setError('');
    const fd = new FormData(); fd.append('file', file);
    try {
      const res = await fetch(`${API_BASE_URL}/upload.php`, {
        method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }, body: fd
      });
      const d = await res.json();
      if (d.success) { onChange(d.url); } else setError(d.message || 'Upload failed');
    } catch { setError('Network error'); } finally { setUploading(false); }
  };

  const isPdf = value && value.toLowerCase().endsWith('.pdf');
  const isWord = value && value.toLowerCase().match(/\.(docx|doc)$/);

  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label className="form-label">{label}</label>}
      <div onDrop={e => { e.preventDefault(); setDragActive(false); upload(e.dataTransfer?.files?.[0]); }}
        onDragOver={e => { e.preventDefault(); setDragActive(true); }} onDragLeave={() => setDragActive(false)}
        onClick={() => fileRef.current?.click()}
        style={{ border: `2px dashed ${dragActive ? 'var(--primary)' : 'var(--border)'}`, borderRadius: '8px',
          padding: value ? 12 : '24px 16px', textAlign: 'center', cursor: 'pointer',
          background: dragActive ? 'rgba(59,130,246,.06)' : 'var(--bg-secondary)', transition: 'all .2s' }}>
        <input ref={fileRef} type="file" accept={accept} onChange={e => upload(e.target.files?.[0])} style={{ display: 'none' }} />
        {uploading ? <span className="cms-spinner" /> : value ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {isPdf || isWord ? (
              <div style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--primary)' }}>
                <FileCode size={24} />
              </div>
            ) : (
              <img src={value} alt="" style={{ width: 60, height: 40, objectFit: 'contain', borderRadius: 6, border: '1px solid var(--border)', background: '#fff' }} />
            )}
            <span style={{ flex: 1, textAlign: 'left', fontSize: '.75rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>{value.split('/').pop()}</span>
            <button type="button" onClick={e => { e.stopPropagation(); onChange(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={14} /></button>
          </div>
        ) : (
          <><Upload size={22} style={{ color: 'var(--text-muted)', marginBottom: 4 }} /><p style={{ fontSize: '.82rem', color: 'var(--text-secondary)', margin: '0 0 2px' }}><strong>Click to upload</strong> or drag & drop</p><p style={{ fontSize: '.68rem', color: 'var(--text-muted)', margin: 0 }}>{isDoc ? 'PDF, DOC, DOCX · Max 5 MB' : 'PNG, JPG, SVG, WebP · Max 5 MB'}</p></>
        )}
      </div>
      {error && <p style={{ color: '#ef4444', fontSize: '.78rem', marginTop: 4 }}>{error}</p>}
      <input type="text" className="form-control" placeholder="Or paste URL…" value={value || ''} onChange={e => onChange(e.target.value)} style={{ marginTop: 6, fontSize: '.78rem' }} />
      {hint && <small style={{ color: 'var(--text-muted)', marginTop: 3, display: 'block' }}>{hint}</small>}
    </div>
  );
}

export default function ServicesAdmin() {
  const { adminFetch } = useContext(AdminContext);
  const { cms, reloadCms } = useContext(CmsContext) || {};
  
  const [activeTab, setActiveTab] = useState('profile');
  const [saveLoading, setSaveLoading] = useState(false);
  const [feedback, setFeedback] = useState({ success: null, error: null });

  // Default initial template data
  const defaultPortfolio = {
    bioInfo: {
      name: 'James',
      lastName: 'Whitfield',
      badge: '✦ Staff Software Engineer',
      role: '10+ years · Distributed Systems · API Design · Tech Leadership',
      bio: 'I architect and build high‑scale systems that handle millions of requests per day. Passionate about clean abstractions, team mentorship, and turning business requirements into reliable, maintainable software.',
      stats: [
        { number: '10+', label: 'Years Exp.' },
        { number: '8', label: 'Products' },
        { number: '12', label: 'Team Lead' },
        { number: '3', label: 'Patents' }
      ],
      socials: { github: '#', linkedin: '#', twitter: '#', dev: '#' },
      contact: { email: 'james@example.com', linkedin: '#', resume: '#' }
    },
    techStack: [
      { name: 'TypeScript', years: '8y' },
      { name: 'Go', years: '6y' },
      { name: 'Python', years: '10y' },
      { name: 'React / Next.js', years: '7y' },
      { name: 'Node.js', years: '9y' },
      { name: 'Kafka', years: '5y' },
      { name: 'PostgreSQL', years: '10y' },
      { name: 'MongoDB', years: '6y' },
      { name: 'Docker / K8s', years: '6y' },
      { name: 'AWS', years: '8y' },
      { name: 'GraphQL', years: '5y' },
      { name: 'gRPC', years: '4y' },
      { name: 'Redis', years: '7y' },
      { name: 'Terraform', years: '4y' }
    ],
    projects: [
      {
        id: 1,
        title: 'Fraud Detection Pipeline',
        year: '2024 · Prod',
        metrics: [
          { icon: 'fa-bolt', value: '120ms', label: 'p99' },
          { icon: 'fa-check-circle', value: '99.97%', label: 'uptime' },
          { icon: 'fa-dollar-sign', value: '$2.4M', label: 'prevented' }
        ],
        description: 'Real‑time fraud scoring service processing 50k+ events/sec with rules engine + ML.',
        tech: ['Go', 'Kafka', 'Redis', 'Flink', 'TF Serving', 'K8s'],
        links: [
          { label: 'Demo', icon: 'fa-external-link-alt', url: '#' },
          { label: 'Source', icon: 'fa-github', url: '#' },
          { label: 'Case Study', icon: 'fa-file-alt', url: '#' }
        ]
      },
      {
        id: 2,
        title: 'API Gateway · Mesh',
        year: '2023 · OSS',
        metrics: [
          { icon: 'fa-code-branch', value: '2.8k', label: 'stars' },
          { icon: 'fa-users', value: '400+', label: 'deployments' },
          { icon: 'fa-clock', value: '85%', label: 'faster routing' }
        ],
        description: 'Pluggable gateway supporting REST, GraphQL, gRPC with rate limiting & circuit breakers.',
        tech: ['Go', 'gRPC', 'Envoy', 'OTel', 'Redis', 'JWT'],
        links: [
          { label: 'Demo', icon: 'fa-external-link-alt', url: '#' },
          { label: 'GitHub', icon: 'fa-github', url: '#' },
          { label: 'Docs', icon: 'fa-book', url: '#' }
        ]
      }
    ],
    experiences: [
      {
        period: '2021 — Present',
        title: 'Staff Software Engineer',
        company: 'FinSecure Inc.',
        highlights: [
          'Led architecture of fraud detection platform serving 50k+ TPS.',
          'Mentored 8 engineers across 3 teams; introduced RFC process.',
          'Reduced cloud costs by 32% through right‑sizing.'
        ]
      },
      {
        period: '2017 — 2021',
        title: 'Senior Software Engineer',
        company: 'HealthData Labs',
        highlights: [
          'Architected HIPAA‑compliant platform serving 1.2M+ records.',
          'Built event‑driven ETL pipeline reducing sync latency 24h → 5min.',
          'Led monolith → microservices migration (12 services, Kafka).'
        ]
      }
    ]
  };

  // State holding all forms loaded from CMS or default
  const [portfolioData, setPortfolioData] = useState(defaultPortfolio);
  const [jsonText, setJsonText] = useState(JSON.stringify(defaultPortfolio, null, 2));

  // Undo / Redo Stacks
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Load from CMS settings on mount or cms update
  useEffect(() => {
    if (cms && cms.james_whitfield_portfolio_data) {
      try {
        const parsed = JSON.parse(cms.james_whitfield_portfolio_data);
        setPortfolioData(parsed);
        setJsonText(JSON.stringify(parsed, null, 2));
        setUndoStack([]);
        setRedoStack([]);
      } catch (e) {
        console.error('Failed parsing loaded CMS data', e);
      }
    }
  }, [cms]);

  const showFeedback = (type, msg) => {
    setFeedback({ success: type === 'success' ? msg : null, error: type === 'error' ? msg : null });
    setTimeout(() => setFeedback({ success: null, error: null }), 4500);
  };

  // Push to Undo stack before updating state
  const pushStateToHistory = useCallback((newState) => {
    setUndoStack(prev => [...prev, JSON.stringify(portfolioData)]);
    setRedoStack([]); // Clear redo stack on new action
  }, [portfolioData]);

  // Undo Action
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, JSON.stringify(portfolioData)]);
    
    const parsed = JSON.parse(previous);
    setPortfolioData(parsed);
    setJsonText(JSON.stringify(parsed, null, 2));
    showFeedback('success', 'Undo successful');
  };

  // Redo Action
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, JSON.stringify(portfolioData)]);
    
    const parsed = JSON.parse(next);
    setPortfolioData(parsed);
    setJsonText(JSON.stringify(parsed, null, 2));
    showFeedback('success', 'Redo successful');
  };

  // Listen to keyboard undo/redo shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoStack, redoStack, portfolioData]);

  // Helper to commit updates and push history
  const updatePortfolioState = (updater) => {
    pushStateToHistory(portfolioData);
    setPortfolioData(prev => {
      const updated = updater(prev);
      setJsonText(JSON.stringify(updated, null, 2));
      return updated;
    });
  };

  // Re-order Lists Helper
  const moveItemInArray = (listName, index, direction) => {
    if (direction === 'up' && index === 0) return;
    updatePortfolioState(prev => {
      const list = [...prev[listName]];
      if (direction === 'up' && index > 0) {
        [list[index - 1], list[index]] = [list[index], list[index - 1]];
      } else if (direction === 'down' && index < list.length - 1) {
        [list[index + 1], list[index]] = [list[index], list[index + 1]];
      }
      return { ...prev, [listName]: list };
    });
  };

  // Profile Field Handlers
  const handleBioChange = (field, value) => {
    updatePortfolioState(prev => ({
      ...prev,
      bioInfo: {
        ...prev.bioInfo,
        [field]: value
      }
    }));
  };

  const handleNestedBioChange = (parentField, field, value) => {
    updatePortfolioState(prev => ({
      ...prev,
      bioInfo: {
        ...prev.bioInfo,
        [parentField]: {
          ...prev.bioInfo[parentField],
          [field]: value
        }
      }
    }));
  };

  // Tech Stack Handlers
  const handleTechChange = (index, field, value) => {
    updatePortfolioState(prev => {
      const list = [...prev.techStack];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, techStack: list };
    });
  };

  const addTech = () => {
    updatePortfolioState(prev => ({
      ...prev,
      techStack: [...prev.techStack, { name: '', years: '' }]
    }));
  };

  const removeTech = (index) => {
    updatePortfolioState(prev => ({
      ...prev,
      techStack: prev.techStack.filter((_, i) => i !== index)
    }));
  };

  // Projects Handlers
  const handleProjectChange = (index, field, value) => {
    updatePortfolioState(prev => {
      const list = [...prev.projects];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, projects: list };
    });
  };

  const addProject = () => {
    updatePortfolioState(prev => {
      const newProj = {
        id: Date.now(),
        title: 'New Project API',
        year: `${new Date().getFullYear()} · Dev`,
        metrics: [
          { icon: 'fa-bolt', value: '100ms', label: 'latency' },
          { icon: 'fa-check-circle', value: '99.9%', label: 'uptime' }
        ],
        description: 'Provide a brief summary of the flagship project.',
        tech: ['TypeScript', 'Node.js'],
        links: [{ label: 'Demo', icon: 'fa-external-link-alt', url: '#' }]
      };
      return { ...prev, projects: [...prev.projects, newProj] };
    });
  };

  const removeProject = (index) => {
    updatePortfolioState(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  // Project Nested Array Editors
  const addProjectMetric = (projIndex) => {
    updatePortfolioState(prev => {
      const list = [...prev.projects];
      list[projIndex].metrics = [...(list[projIndex].metrics || []), { icon: 'fa-bolt', value: '', label: '' }];
      return { ...prev, projects: list };
    });
  };

  const removeProjectMetric = (projIndex, metricIndex) => {
    updatePortfolioState(prev => {
      const list = [...prev.projects];
      list[projIndex].metrics = list[projIndex].metrics.filter((_, mI) => mI !== metricIndex);
      return { ...prev, projects: list };
    });
  };

  const handleProjectMetricChange = (projIndex, metricIndex, field, value) => {
    updatePortfolioState(prev => {
      const list = [...prev.projects];
      const metrics = [...list[projIndex].metrics];
      metrics[metricIndex] = { ...metrics[metricIndex], [field]: value };
      list[projIndex].metrics = metrics;
      return { ...prev, projects: list };
    });
  };

  const addProjectLink = (projIndex) => {
    updatePortfolioState(prev => {
      const list = [...prev.projects];
      list[projIndex].links = [...(list[projIndex].links || []), { label: '', icon: 'fa-external-link-alt', url: '' }];
      return { ...prev, projects: list };
    });
  };

  const removeProjectLink = (projIndex, linkIndex) => {
    updatePortfolioState(prev => {
      const list = [...prev.projects];
      list[projIndex].links = list[projIndex].links.filter((_, lI) => lI !== linkIndex);
      return { ...prev, projects: list };
    });
  };

  const handleProjectLinkChange = (projIndex, linkIndex, field, value) => {
    updatePortfolioState(prev => {
      const list = [...prev.projects];
      const links = [...list[projIndex].links];
      links[linkIndex] = { ...links[linkIndex], [field]: value };
      list[projIndex].links = links;
      return { ...prev, projects: list };
    });
  };

  // Experiences Handlers
  const handleExpChange = (index, field, value) => {
    updatePortfolioState(prev => {
      const list = [...prev.experiences];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, experiences: list };
    });
  };

  const addExperience = () => {
    updatePortfolioState(prev => {
      const newExp = {
        period: '2026',
        title: 'Lead Software Engineer',
        company: 'Innovate LLC',
        highlights: ['Delivered highly concurrent systems.']
      };
      return { ...prev, experiences: [...prev.experiences, newExp] };
    });
  };

  const removeExperience = (index) => {
    updatePortfolioState(prev => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== index)
    }));
  };

  // Experience Bullet Highlights List
  const addExpHighlight = (expIndex) => {
    updatePortfolioState(prev => {
      const list = [...prev.experiences];
      list[expIndex].highlights = [...(list[expIndex].highlights || []), ''];
      return { ...prev, experiences: list };
    });
  };

  const removeExpHighlight = (expIndex, highlightIdx) => {
    updatePortfolioState(prev => {
      const list = [...prev.experiences];
      list[expIndex].highlights = list[expIndex].highlights.filter((_, hI) => hI !== highlightIdx);
      return { ...prev, experiences: list };
    });
  };

  const handleExpHighlightChange = (expIndex, highlightIdx, value) => {
    updatePortfolioState(prev => {
      const list = [...prev.experiences];
      const highlights = [...list[expIndex].highlights];
      highlights[highlightIdx] = value;
      list[expIndex].highlights = highlights;
      return { ...prev, experiences: list };
    });
  };

  // Raw JSON direct editing
  const handleJsonChange = (e) => {
    const txt = e.target.value;
    setJsonText(txt);
    try {
      const parsed = JSON.parse(txt);
      setPortfolioData(parsed);
    } catch {
      // Don't commit invalid JSON syntax directly to inputs
    }
  };

  // Save/Publish
  const savePortfolioSettings = async () => {
    try {
      JSON.parse(jsonText); // Ensure JSON is valid
    } catch (e) {
      showFeedback('error', 'Cannot save: JSON syntax error: ' + e.message);
      return;
    }

    setSaveLoading(true);
    try {
      const payload = {
        james_whitfield_portfolio_data: JSON.stringify(portfolioData)
      };
      const res = await adminFetch(`${API_BASE_URL}/cms.php`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showFeedback('success', 'James Whitfield portfolio settings saved successfully.');
        setUndoStack([]);
        setRedoStack([]);
        if (typeof reloadCms === 'function') reloadCms();
      } else {
        throw new Error(res.data?.message || 'Save failed.');
      }
    } catch (err) {
      showFeedback('error', err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>Services Page Customizer</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Configure and re-arrange the flagship projects, competencies, and timeline structure of James Whitfield on the services page.
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Undo/Redo Buttons */}
          <div style={{ display: 'flex', gap: '6px', borderRight: '1px solid var(--border)', paddingRight: '12px', marginRight: '6px' }}>
            <button 
              onClick={handleUndo} 
              className="btn btn-outline" 
              style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
              disabled={undoStack.length === 0}
              title="Undo (Ctrl+Z)"
            >
              <Undo size={14} />
            </button>
            <button 
              onClick={handleRedo} 
              className="btn btn-outline" 
              style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
              disabled={redoStack.length === 0}
              title="Redo (Ctrl+Y)"
            >
              <Redo size={14} />
            </button>
          </div>

          <button 
            onClick={savePortfolioSettings} 
            className="btn btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}
            disabled={saveLoading}
          >
            {saveLoading ? <span className="cms-spinner" /> : <Save size={16} />}
            {saveLoading ? 'Saving...' : 'Save & Publish'}
          </button>
        </div>
      </div>

      {feedback.success && <div className="alert alert-success" style={{ marginBottom: 20 }}>{feedback.success}</div>}
      {feedback.error && <div className="alert alert-danger" style={{ marginBottom: 20 }}>{feedback.error}</div>}

      {/* Tabs */}
      <div className="customizer-tabs" style={{ display: 'flex', gap: 12, borderBottom: '1px solid var(--border)', marginBottom: 24, paddingBottom: 10 }}>
        <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')} style={{ padding: '8px 16px', background: activeTab === 'profile' ? 'var(--primary)' : 'none', color: activeTab === 'profile' ? '#fff' : 'inherit', border: 'none', cursor: 'pointer', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 6 }}><Globe size={14} /> Profile & Hero</button>
        <button className={`tab-btn ${activeTab === 'tech' ? 'active' : ''}`} onClick={() => setActiveTab('tech')} style={{ padding: '8px 16px', background: activeTab === 'tech' ? 'var(--primary)' : 'none', color: activeTab === 'tech' ? '#fff' : 'inherit', border: 'none', cursor: 'pointer', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 6 }}><Code size={14} /> Core Competencies</button>
        <button className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')} style={{ padding: '8px 16px', background: activeTab === 'projects' ? 'var(--primary)' : 'none', color: activeTab === 'projects' ? '#fff' : 'inherit', border: 'none', cursor: 'pointer', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 6 }}><Award size={14} /> Flagship Projects</button>
        <button className={`tab-btn ${activeTab === 'exp' ? 'active' : ''}`} onClick={() => setActiveTab('exp')} style={{ padding: '8px 16px', background: activeTab === 'exp' ? 'var(--primary)' : 'none', color: activeTab === 'exp' ? '#fff' : 'inherit', border: 'none', cursor: 'pointer', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 6 }}><Briefcase size={14} /> Experience Timeline</button>
        <button className={`tab-btn ${activeTab === 'json' ? 'active' : ''}`} onClick={() => setActiveTab('json')} style={{ padding: '8px 16px', background: activeTab === 'json' ? 'var(--primary)' : 'none', color: activeTab === 'json' ? '#fff' : 'inherit', border: 'none', cursor: 'pointer', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 6 }}><FileCode size={14} /> Developer JSON</button>
      </div>

      {/* Editor Content */}
      <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: 24 }}>
        
        {/* Profile/Hero Tab */}
        {activeTab === 'profile' && (
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: 16 }}>Profile Hero & Stats</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input type="text" className="form-control" value={portfolioData.bioInfo?.name || ''} onChange={e => handleBioChange('name', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input type="text" className="form-control" value={portfolioData.bioInfo?.lastName || ''} onChange={e => handleBioChange('lastName', e.target.value)} />
              </div>
            </div>
            
            <div className="form-group" style={{ marginTop: 14 }}>
              <label className="form-label">Title Badge Text</label>
              <input type="text" className="form-control" value={portfolioData.bioInfo?.badge || ''} onChange={e => handleBioChange('badge', e.target.value)} />
            </div>

            <div className="form-group" style={{ marginTop: 14 }}>
              <label className="form-label">Sub-title / Role Tagline</label>
              <input type="text" className="form-control" value={portfolioData.bioInfo?.role || ''} onChange={e => handleBioChange('role', e.target.value)} />
            </div>

            <div className="form-group" style={{ marginTop: 14 }}>
              <label className="form-label">Biography Summary</label>
              <textarea className="form-control" rows={4} value={portfolioData.bioInfo?.bio || ''} onChange={e => handleBioChange('bio', e.target.value)} />
            </div>

            <div className="form-group" style={{ marginTop: 14 }}>
              <ImageUploader 
                label="Passport Photo / Profile Picture"
                value={portfolioData.bioInfo?.avatarUrl || ''}
                onChange={val => handleBioChange('avatarUrl', val)}
                hint="Upload a professional square portrait. Will render in the circular avatar slot."
              />
            </div>

            {/* Social Links Sub-section */}
            <h5 style={{ fontWeight: 700, marginTop: 28, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}><Link size={16} /> Social Handles</h5>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">GitHub Link / Username</label>
                <input type="text" className="form-control" value={portfolioData.bioInfo?.socials?.github || ''} onChange={e => handleNestedBioChange('socials', 'github', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">LinkedIn Link / Profile</label>
                <input type="text" className="form-control" value={portfolioData.bioInfo?.socials?.linkedin || ''} onChange={e => handleNestedBioChange('socials', 'linkedin', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Twitter / X Handle</label>
                <input type="text" className="form-control" value={portfolioData.bioInfo?.socials?.twitter || ''} onChange={e => handleNestedBioChange('socials', 'twitter', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Dev.to Profile Link</label>
                <input type="text" className="form-control" value={portfolioData.bioInfo?.socials?.dev || ''} onChange={e => handleNestedBioChange('socials', 'dev', e.target.value)} />
              </div>
            </div>

            {/* Contact details */}
            <h5 style={{ fontWeight: 700, marginTop: 28, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={16} /> Contact Details & Call-to-actions</h5>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Contact Email Address</label>
                <input type="text" className="form-control" value={portfolioData.bioInfo?.contact?.email || ''} onChange={e => handleNestedBioChange('contact', 'email', e.target.value)} />
              </div>
              <div className="form-group">
                <ImageUploader 
                  label="Resume / Curriculum Vitae Document"
                  value={portfolioData.bioInfo?.contact?.resume || ''}
                  onChange={val => handleNestedBioChange('contact', 'resume', val)}
                  hint="Upload your professional CV (PDF, DOC, or DOCX) for clients to download."
                  accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  isDoc={true}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tech Stack Competencies Tab */}
        {activeTab === 'tech' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h4 style={{ fontWeight: 700, margin: 0 }}>Core Competency Tags</h4>
              <button className="btn btn-outline" onClick={addTech} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.8rem' }}><Plus size={12} /> Add Tech Badge</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {portfolioData.techStack?.map((tech, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'center', backgroundColor: 'var(--bg-primary)', padding: '10px 14px', borderRadius: 6, border: '1px solid var(--border)' }}>
                  {/* Reorder Buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <button 
                      onClick={() => moveItemInArray('techStack', idx, 'up')} 
                      style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'not-allowed' : 'pointer', color: idx === 0 ? 'var(--text-muted)' : 'var(--text-primary)' }}
                      disabled={idx === 0}
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button 
                      onClick={() => moveItemInArray('techStack', idx, 'down')} 
                      style={{ background: 'none', border: 'none', cursor: idx === portfolioData.techStack.length - 1 ? 'not-allowed' : 'pointer', color: idx === portfolioData.techStack.length - 1 ? 'var(--text-muted)' : 'var(--text-primary)' }}
                      disabled={idx === portfolioData.techStack.length - 1}
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>

                  <input type="text" className="form-control" placeholder="Technology Name (e.g. Go)" value={tech.name} onChange={e => handleTechChange(idx, 'name', e.target.value)} style={{ flex: 3 }} />
                  <input type="text" className="form-control" placeholder="Years (e.g. 6y)" value={tech.years} onChange={e => handleTechChange(idx, 'years', e.target.value)} style={{ flex: 1 }} />
                  
                  <button className="btn btn-outline" onClick={() => removeTech(idx)} style={{ color: '#ef4444', border: '1px solid #ef4444', padding: 8 }}><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Flagship Projects Tab */}
        {activeTab === 'projects' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h4 style={{ fontWeight: 700, margin: 0 }}>Flagship Projects Editor</h4>
              <button className="btn btn-outline" onClick={addProject} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.8rem' }}><Plus size={12} /> Add Project Card</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {portfolioData.projects?.map((proj, idx) => (
                <div key={proj.id || idx} style={{ border: '1px solid var(--border)', padding: 20, borderRadius: 8, backgroundColor: 'var(--bg-primary)' }}>
                  
                  {/* Project Title Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {/* Reorder Buttons */}
                      <button 
                        onClick={() => moveItemInArray('projects', idx, 'up')} 
                        className="btn btn-outline"
                        style={{ padding: 4, cursor: idx === 0 ? 'not-allowed' : 'pointer' }}
                        disabled={idx === 0}
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button 
                        onClick={() => moveItemInArray('projects', idx, 'down')} 
                        className="btn btn-outline"
                        style={{ padding: 4, cursor: idx === portfolioData.projects.length - 1 ? 'not-allowed' : 'pointer' }}
                        disabled={idx === portfolioData.projects.length - 1}
                      >
                        <ArrowDown size={14} />
                      </button>
                      <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--primary)' }}>Project #{idx + 1}: {proj.title || 'New Project'}</span>
                    </div>

                    <button className="btn btn-outline" onClick={() => removeProject(idx)} style={{ color: '#ef4444', border: '1px solid #ef4444', padding: '6px 12px', fontSize: '.75rem', display: 'flex', alignItems: 'center', gap: 4 }}><Trash2 size={12} /> Delete Card</button>
                  </div>
                  
                  {/* Basic Metadata */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                    <div className="form-group">
                      <label className="form-label">Project Title</label>
                      <input type="text" className="form-control" value={proj.title} onChange={e => handleProjectChange(idx, 'title', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Year / Status Tag</label>
                      <input type="text" className="form-control" value={proj.year} onChange={e => handleProjectChange(idx, 'year', e.target.value)} />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: 12 }}>
                    <label className="form-label">Description text</label>
                    <textarea className="form-control" rows={3} value={proj.description} onChange={e => handleProjectChange(idx, 'description', e.target.value)} />
                  </div>

                  {/* Dynamic Metrics Section */}
                  <div style={{ marginTop: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}><Zap size={13} /> Performance Metrics</span>
                      <button className="btn btn-outline" onClick={() => addProjectMetric(idx)} style={{ fontSize: '.72rem', padding: '4px 8px' }}><Plus size={10} /> Add Metric</button>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {proj.metrics?.map((metric, mIdx) => (
                        <div key={mIdx} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          <input type="text" className="form-control" placeholder="Icon (e.g. fa-bolt)" value={metric.icon} onChange={e => handleProjectMetricChange(idx, mIdx, 'icon', e.target.value)} style={{ flex: 1, fontSize: '.8rem' }} />
                          <input type="text" className="form-control" placeholder="Value (e.g. 120ms)" value={metric.value} onChange={e => handleProjectMetricChange(idx, mIdx, 'value', e.target.value)} style={{ flex: 1, fontSize: '.8rem' }} />
                          <input type="text" className="form-control" placeholder="Label (e.g. p99)" value={metric.label} onChange={e => handleProjectMetricChange(idx, mIdx, 'label', e.target.value)} style={{ flex: 1, fontSize: '.8rem' }} />
                          <button className="btn btn-outline" onClick={() => removeProjectMetric(idx, mIdx)} style={{ color: '#ef4444', border: '1px solid #ef4444', padding: 6 }}><Trash2 size={12} /></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tech stack tags */}
                  <div className="form-group" style={{ marginTop: 16 }}>
                    <label className="form-label">Technologies Used (comma separated)</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Go, Kafka, Redis, K8s" 
                      value={proj.tech?.join(', ') || ''} 
                      onChange={e => handleProjectChange(idx, 'tech', e.target.value.split(',').map(t => t.trim()).filter(Boolean))} 
                    />
                  </div>

                  {/* Dynamic Links Section */}
                  <div style={{ marginTop: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}><Link size={13} /> Project Links</span>
                      <button className="btn btn-outline" onClick={() => addProjectLink(idx)} style={{ fontSize: '.72rem', padding: '4px 8px' }}><Plus size={10} /> Add Link</button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {proj.links?.map((lnk, lIdx) => (
                        <div key={lIdx} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          <input type="text" className="form-control" placeholder="Label (e.g. GitHub)" value={lnk.label} onChange={e => handleProjectLinkChange(idx, lIdx, 'label', e.target.value)} style={{ flex: 1, fontSize: '.8rem' }} />
                          <input type="text" className="form-control" placeholder="Icon (e.g. fa-github)" value={lnk.icon} onChange={e => handleProjectLinkChange(idx, lIdx, 'icon', e.target.value)} style={{ flex: 1, fontSize: '.8rem' }} />
                          <input type="text" className="form-control" placeholder="Target URL" value={lnk.url} onChange={e => handleProjectLinkChange(idx, lIdx, 'url', e.target.value)} style={{ flex: 2, fontSize: '.8rem' }} />
                          <button className="btn btn-outline" onClick={() => removeProjectLink(idx, lIdx)} style={{ color: '#ef4444', border: '1px solid #ef4444', padding: 6 }}><Trash2 size={12} /></button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience Timeline Tab */}
        {activeTab === 'exp' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h4 style={{ fontWeight: 700, margin: 0 }}>Work Experience Timeline</h4>
              <button className="btn btn-outline" onClick={addExperience} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.8rem' }}><Plus size={12} /> Add Experience Card</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {portfolioData.experiences?.map((exp, idx) => (
                <div key={idx} style={{ border: '1px solid var(--border)', padding: 20, borderRadius: 8, backgroundColor: 'var(--bg-primary)' }}>
                  
                  {/* Title and reorder controls */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <button 
                        onClick={() => moveItemInArray('experiences', idx, 'up')} 
                        className="btn btn-outline"
                        style={{ padding: 4, cursor: idx === 0 ? 'not-allowed' : 'pointer' }}
                        disabled={idx === 0}
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button 
                        onClick={() => moveItemInArray('experiences', idx, 'down')} 
                        className="btn btn-outline"
                        style={{ padding: 4, cursor: idx === portfolioData.experiences.length - 1 ? 'not-allowed' : 'pointer' }}
                        disabled={idx === portfolioData.experiences.length - 1}
                      >
                        <ArrowDown size={14} />
                      </button>
                      <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--primary)' }}>Role #{idx + 1}: {exp.title || 'New Job'}</span>
                    </div>

                    <button className="btn btn-outline" onClick={() => removeExperience(idx)} style={{ color: '#ef4444', border: '1px solid #ef4444', padding: '6px 12px', fontSize: '.75rem', display: 'flex', alignItems: 'center', gap: 4 }}><Trash2 size={12} /> Delete Card</button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                      <label className="form-label">Period / Years</label>
                      <input type="text" className="form-control" placeholder="e.g. 2021 — Present" value={exp.period} onChange={e => handleExpChange(idx, 'period', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Job Title</label>
                      <input type="text" className="form-control" value={exp.title} onChange={e => handleExpChange(idx, 'title', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Company Name</label>
                      <input type="text" className="form-control" value={exp.company} onChange={e => handleExpChange(idx, 'company', e.target.value)} />
                    </div>
                  </div>

                  {/* Bullet Highlights Section */}
                  <div style={{ marginTop: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}><Briefcase size={13} /> Key Highlights / Achievements</span>
                      <button className="btn btn-outline" onClick={() => addExpHighlight(idx)} style={{ fontSize: '.72rem', padding: '4px 8px' }}><Plus size={10} /> Add Bullet Point</button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {exp.highlights?.map((highlight, hIdx) => (
                        <div key={hIdx} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          <input type="text" className="form-control" placeholder="Highlight point..." value={highlight} onChange={e => handleExpHighlightChange(idx, hIdx, e.target.value)} style={{ flex: 1, fontSize: '.85rem' }} />
                          <button className="btn btn-outline" onClick={() => removeExpHighlight(idx, hIdx)} style={{ color: '#ef4444', border: '1px solid #ef4444', padding: 6 }}><Trash2 size={12} /></button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

        {/* Developer JSON Tab */}
        {activeTab === 'json' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', fontSize: '.85rem', marginBottom: 12 }}>
              <AlertTriangle size={16} style={{ color: 'var(--accent)' }} />
              <span>Advanced Mode: Edit the JSON structure representing your portfolio profile. Validations will trigger on publish to ensure data integrity. Supports Ctrl+Z/Ctrl+Y undo/redo stack.</span>
            </div>
            <textarea 
              className="form-control" 
              rows={22} 
              style={{ fontFamily: 'monospace', fontSize: '.85rem', lineHeight: '1.4' }}
              value={jsonText} 
              onChange={handleJsonChange} 
            />
          </div>
        )}

      </div>
    </div>
  );
}
