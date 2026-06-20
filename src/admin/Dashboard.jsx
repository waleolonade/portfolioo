import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, LayoutDashboard, Briefcase, MessageSquare, LogOut, Plus, 
  Edit, Trash2, Mail, Check, AlertCircle, ExternalLink, Calendar, X, 
  Settings, Users, Sparkles, Code, FileText, ChevronRight, BarChart3, HelpCircle
} from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // overview, cms, projects, services, leads, careers, ai
  const [projects, setProjects] = useState([]);
  const [services, setServices] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [careers, setCareers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [cmsForm, setCmsForm] = useState({});
  const [stats, setStats] = useState({ totalProjects: 0, totalServices: 0, totalLeads: 0, totalJobs: 0 });
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ success: null, error: null });
  const navigate = useNavigate();

  // Modals
  const [projectModal, setProjectModal] = useState({ open: false, mode: 'create', data: null });
  const [serviceModal, setServiceModal] = useState({ open: false, mode: 'create', data: null });
  const [careerModal, setCareerModal] = useState({ open: false, mode: 'create', data: null });
  const [viewInquiryModal, setViewInquiryModal] = useState({ open: false, data: null });

  // AI Helper States
  const [aiPrompt, setAiPrompt] = useState({ title: '', category: 'Website Development' });
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Form States for CRUD
  const [projectForm, setProjectForm] = useState({
    id: '', title: '', category: 'Website Development', client_name: '', completion_date: '',
    summary: '', challenge: '', solution: '', results_metric: '', image_url: '', project_url: '', github_url: '', tech_stack: ''
  });

  const [serviceForm, setServiceForm] = useState({
    id: '', name: '', description: '', benefits: '', features: '', icon_name: 'Code',
    basic_price: 0, standard_price: 0, premium_price: 0
  });

  const [careerForm, setCareerForm] = useState({
    id: '', title: '', location: '', type: 'Full-time', salary: '', description: '', requirements: ''
  });

  const token = localStorage.getItem('adminToken');
  const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
  const role = user.role || 'Super Admin';

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }
    
    // Automatically set default allowed tab based on role
    if (role === 'Project Manager') setActiveTab('projects');
    if (role === 'Content Editor') setActiveTab('cms');
    if (role === 'Support Agent') setActiveTab('leads');
    
    loadAllDashboardData();
  }, [token, navigate]);

  const showFeedback = (type, msg) => {
    setFeedback({ success: type === 'success' ? msg : null, error: type === 'error' ? msg : null });
    setTimeout(() => setFeedback({ success: null, error: null }), 4500);
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const adminFetch = (url, options = {}) => {
    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    return fetch(url, {
      ...options,
      headers: { ...authHeaders, ...options.headers }
    }).then(res => {
      if (res.status === 401) {
        logout();
        throw new Error('Session expired. Please sign in again.');
      }
      return res.json().then(data => ({ ok: res.ok, status: res.status, data }));
    });
  };

  const loadAllDashboardData = async () => {
    setLoading(true);
    try {
      const [resProjects, resServices, resCMS, resInquiries, resCareers, resApps] = await Promise.all([
        fetch(`${API_BASE_URL}/projects.php`).then(res => res.json()),
        fetch(`${API_BASE_URL}/services.php`).then(res => res.json()),
        fetch(`${API_BASE_URL}/cms.php`).then(res => res.json()),
        adminFetch(`${API_BASE_URL}/inquiries.php`),
        fetch(`${API_BASE_URL}/careers.php`).then(res => res.json()),
        adminFetch(`${API_BASE_URL}/careers.php?applications=1`)
      ]);

      setProjects(resProjects || []);
      setServices(resServices || []);
      setCmsForm(resCMS || {});
      setCareers(resCareers || []);
      
      if (resInquiries.ok) setInquiries(resInquiries.data || []);
      if (resApps.ok) setApplications(resApps.data || []);

      setStats({
        totalProjects: (resProjects || []).length,
        totalServices: (resServices || []).length,
        totalLeads: (resInquiries.data || []).length,
        totalJobs: (resCareers || []).length
      });

    } catch (err) {
      showFeedback('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // RBAC Tab Access Helper
  const hasAccess = (tabName) => {
    if (role === 'Super Admin') return true;
    if (role === 'Project Manager' && tabName === 'projects') return true;
    if (role === 'Support Agent' && tabName === 'leads') return true;
    if (role === 'Content Editor' && ['cms', 'services', 'careers', 'ai'].includes(tabName)) return true;
    return false;
  };

  // --- CMS Page Builder ---
  const handleCmsChange = (e) => {
    const { name, value } = e.target;
    setCmsForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveCms = async (e) => {
    e.preventDefault();
    try {
      const res = await adminFetch(`${API_BASE_URL}/cms.php`, {
        method: 'POST',
        body: JSON.stringify(cmsForm)
      });
      if (res.ok) {
        showFeedback('success', 'CMS settings updated successfully.');
        loadAllDashboardData();
      } else {
        throw new Error(res.data.message || 'Failed to save settings.');
      }
    } catch (err) {
      showFeedback('error', err.message);
    }
  };

  // --- PROJECTS CRUD ---
  const handleProjectFormChange = (e) => {
    const { name, value } = e.target;
    setProjectForm(prev => ({ ...prev, [name]: value }));
  };

  const openProjModal = (mode, data = null) => {
    if (mode === 'edit' && data) {
      setProjectForm(data);
      setProjectModal({ open: true, mode: 'edit', data });
    } else {
      setProjectForm({ id: '', title: '', category: 'Website Development', client_name: '', completion_date: '', summary: '', challenge: '', solution: '', results_metric: '', image_url: '', project_url: '', github_url: '', tech_stack: '' });
      setProjectModal({ open: true, mode: 'create', data: null });
    }
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    const isEdit = projectModal.mode === 'edit';
    const endpoint = isEdit ? `${API_BASE_URL}/projects.php?id=${projectForm.id}` : `${API_BASE_URL}/projects.php`;
    try {
      const res = await adminFetch(endpoint, {
        method: isEdit ? 'PUT' : 'POST',
        body: JSON.stringify(projectForm)
      });
      if (res.ok) {
        showFeedback('success', 'Project case study updated successfully.');
        setProjectModal({ open: false, mode: 'create', data: null });
        loadAllDashboardData();
      } else {
        throw new Error(res.data.message || 'Execution error.');
      }
    } catch (err) {
      showFeedback('error', err.message);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Delete this case study?')) return;
    try {
      const res = await adminFetch(`${API_BASE_URL}/projects.php?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showFeedback('success', 'Project removed.');
        loadAllDashboardData();
      }
    } catch (err) {
      showFeedback('error', err.message);
    }
  };

  // --- SERVICES CRUD ---
  const handleServiceFormChange = (e) => {
    const { name, value } = e.target;
    setServiceForm(prev => ({ ...prev, [name]: value }));
  };

  const openServModal = (mode, data = null) => {
    if (mode === 'edit' && data) {
      setServiceForm(data);
      setServiceModal({ open: true, mode: 'edit', data });
    } else {
      setServiceForm({ id: '', name: '', description: '', benefits: '', features: '', icon_name: 'Code', basic_price: 0, standard_price: 0, premium_price: 0 });
      setServiceModal({ open: true, mode: 'create', data: null });
    }
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    const isEdit = serviceModal.mode === 'edit';
    const endpoint = isEdit ? `${API_BASE_URL}/services.php?id=${serviceForm.id}` : `${API_BASE_URL}/services.php`;
    try {
      const res = await adminFetch(endpoint, {
        method: isEdit ? 'PUT' : 'POST',
        body: JSON.stringify(serviceForm)
      });
      if (res.ok) {
        showFeedback('success', 'Service updated successfully.');
        setServiceModal({ open: false, mode: 'create', data: null });
        loadAllDashboardData();
      } else {
        throw new Error(res.data.message || 'Execution error.');
      }
    } catch (err) {
      showFeedback('error', err.message);
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Delete this service permanently?')) return;
    try {
      const res = await adminFetch(`${API_BASE_URL}/services.php?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showFeedback('success', 'Service deleted.');
        loadAllDashboardData();
      }
    } catch (err) {
      showFeedback('error', err.message);
    }
  };

  // --- CAREERS CRUD ---
  const handleCareerFormChange = (e) => {
    const { name, value } = e.target;
    setCareerForm(prev => ({ ...prev, [name]: value }));
  };

  const openJobModal = (mode, data = null) => {
    if (mode === 'edit' && data) {
      setCareerForm(data);
      setCareerModal({ open: true, mode: 'edit', data });
    } else {
      setCareerForm({ id: '', title: '', location: '', type: 'Full-time', salary: '', description: '', requirements: '' });
      setCareerModal({ open: true, mode: 'create', data: null });
    }
  };

  const handleSaveCareer = async (e) => {
    e.preventDefault();
    const isEdit = careerModal.mode === 'edit';
    const endpoint = isEdit ? `${API_BASE_URL}/careers.php?id=${careerForm.id}` : `${API_BASE_URL}/careers.php`;
    try {
      const res = await adminFetch(endpoint, {
        method: isEdit ? 'PUT' : 'POST',
        body: JSON.stringify(careerForm)
      });
      if (res.ok) {
        showFeedback('success', 'Job posting updated.');
        setCareerModal({ open: false, mode: 'create', data: null });
        loadAllDashboardData();
      } else {
        throw new Error(res.data.message || 'Execution error.');
      }
    } catch (err) {
      showFeedback('error', err.message);
    }
  };

  const handleDeleteCareer = async (id) => {
    if (!window.confirm('Delete this job listing?')) return;
    try {
      const res = await adminFetch(`${API_BASE_URL}/careers.php?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showFeedback('success', 'Job removed.');
        loadAllDashboardData();
      }
    } catch (err) {
      showFeedback('error', err.message);
    }
  };

  // --- LEADS MANAGEMENT ---
  const handleViewInquiry = async (inq) => {
    setViewInquiryModal({ open: true, data: inq });
    if (inq.status === 'unread') {
      try {
        await adminFetch(`${API_BASE_URL}/inquiries.php?id=${inq.id}`, {
          method: 'PUT',
          body: JSON.stringify({ status: 'read' })
        });
        loadAllDashboardData();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleToggleLeadStatus = async (inq) => {
    const nextStatus = inq.status === 'unread' ? 'read' : 'unread';
    try {
      const res = await adminFetch(`${API_BASE_URL}/inquiries.php?id=${inq.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        showFeedback('success', `Lead status updated to ${nextStatus}.`);
        loadAllDashboardData();
      }
    } catch (err) {
      showFeedback('error', err.message);
    }
  };

  const handleDeleteLead = async (id) => {
    if (!window.confirm('Delete this lead record permanently?')) return;
    try {
      const res = await adminFetch(`${API_BASE_URL}/inquiries.php?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showFeedback('success', 'Lead record removed.');
        setViewInquiryModal({ open: false, data: null });
        loadAllDashboardData();
      }
    } catch (err) {
      showFeedback('error', err.message);
    }
  };

  // --- AI STUDIO ---
  const handleGenerateDesc = () => {
    if (!aiPrompt.title) {
      showFeedback('error', 'Please enter a project title.');
      return;
    }
    setAiLoading(true);
    setAiResult('');
    
    adminFetch(`${API_BASE_URL}/ai_helper.php?task=description`, {
      method: 'POST',
      body: JSON.stringify({ title: aiPrompt.title, category: aiPrompt.category })
    })
      .then(res => {
        if (res.ok) setAiResult(res.data.result);
        else throw new Error(res.data.message || 'Failed to generate.');
      })
      .catch(err => showFeedback('error', err.message))
      .finally(() => setAiLoading(false));
  };

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-title">
          <ShieldCheck size={22} style={{ color: 'var(--primary)' }} />
          <span>Brainfeels CMS</span>
        </div>

        <ul className="sidebar-menu">
          {hasAccess('overview') && (
            <li className={`sidebar-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
              <LayoutDashboard size={18} /> Overview
            </li>
          )}
          {hasAccess('cms') && (
            <li className={`sidebar-item ${activeTab === 'cms' ? 'active' : ''}`} onClick={() => setActiveTab('cms')}>
              <Settings size={18} /> Page Builder
            </li>
          )}
          {hasAccess('projects') && (
            <li className={`sidebar-item ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}>
              <Briefcase size={18} /> Projects CRUD
            </li>
          )}
          {hasAccess('services') && (
            <li className={`sidebar-item ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')}>
              <Code size={18} /> Services CRUD
            </li>
          )}
          {hasAccess('leads') && (
            <li className={`sidebar-item ${activeTab === 'leads' ? 'active' : ''}`} onClick={() => setActiveTab('leads')}>
              <MessageSquare size={18} /> Lead Center
            </li>
          )}
          {hasAccess('careers') && (
            <li className={`sidebar-item ${activeTab === 'careers' ? 'active' : ''}`} onClick={() => setActiveTab('careers')}>
              <FileText size={18} /> Career Center
            </li>
          )}
          {hasAccess('ai') && (
            <li className={`sidebar-item ${activeTab === 'ai' ? 'active' : ''}`} onClick={() => setActiveTab('ai')}>
              <Sparkles size={18} /> AI Studio
            </li>
          )}

          <li className="sidebar-item sidebar-logout" onClick={logout} style={{ marginTop: 'auto' }}>
            <LogOut size={18} /> Sign Out
          </li>
        </ul>
      </aside>

      {/* Main Panel Content */}
      <main className="admin-main">
        <header className="admin-header">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            {activeTab === 'overview' && 'System Analytics'}
            {activeTab === 'cms' && 'CMS Content Builder'}
            {activeTab === 'projects' && 'Project Case Studies'}
            {activeTab === 'services' && 'Manage Services'}
            {activeTab === 'leads' && 'Lead Qualification Center'}
            {activeTab === 'careers' && 'Recruitment Coordinator'}
            {activeTab === 'ai' && 'Generative AI Studio'}
          </h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Role: <strong style={{ color: 'var(--primary)' }}>{role}</strong> ({user.username})
            </span>
            <button onClick={() => navigate('/')} className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
              Launch Site
            </button>
          </div>
        </header>

        <div className="admin-content">
          {/* Status feedback alerts */}
          {feedback.success && (
            <div style={{ display: 'flex', gap: '10px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '12px 20px', borderRadius: 'var(--radius-sm)', marginBottom: '24px', fontSize: '0.9rem' }}>
              <Check size={18} /> <span>{feedback.success}</span>
            </div>
          )}
          {feedback.error && (
            <div style={{ display: 'flex', gap: '10px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '12px 20px', borderRadius: 'var(--radius-sm)', marginBottom: '24px', fontSize: '0.9rem' }}>
              <AlertCircle size={18} /> <span>{feedback.error}</span>
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              Synchronizing SQL database records...
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW & CHARTS */}
              {activeTab === 'overview' && (
                <div>
                  <div className="stats-grid">
                    <div className="card stat-card">
                      <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)' }}><Briefcase size={22} /></div>
                      <div className="stat-info"><span className="stat-value">{stats.totalProjects}</span><span className="stat-label">Showcase Items</span></div>
                    </div>
                    <div className="card stat-card">
                      <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(13, 148, 136, 0.1)', color: 'var(--secondary)' }}><Code size={22} /></div>
                      <div className="stat-info"><span className="stat-value">{stats.totalServices}</span><span className="stat-label">Core Services</span></div>
                    </div>
                    <div className="card stat-card">
                      <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent)' }}><MessageSquare size={22} /></div>
                      <div className="stat-info"><span className="stat-value">{stats.totalLeads}</span><span className="stat-label">Qualified Leads</span></div>
                    </div>
                    <div className="card stat-card">
                      <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--info)' }}><FileText size={22} /></div>
                      <div className="stat-info"><span className="stat-value">{stats.totalJobs}</span><span className="stat-label">Open Vacancies</span></div>
                    </div>
                  </div>

                  {/* SVG Chart Panel */}
                  <div className="card" style={{ padding: '24px', textAlign: 'left', marginBottom: '30px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <BarChart3 size={18} /> Visitor Conversion Metrics (Weekly)
                    </h3>
                    
                    {/* SVG Graphic Polyline Chart */}
                    <div style={{ position: 'relative', width: '100%', height: '200px' }}>
                      <svg viewBox="0 0 700 200" style={{ width: '100%', height: '100%' }}>
                        <grid stroke="var(--border)" strokeDasharray="5 5" />
                        <line x1="50" y1="180" x2="650" y2="180" stroke="var(--border)" strokeWidth="2" />
                        <line x1="50" y1="20" x2="50" y2="180" stroke="var(--border)" strokeWidth="2" />
                        
                        {/* Traffic curve */}
                        <polyline
                          fill="none"
                          stroke="var(--primary)"
                          strokeWidth="3"
                          points="50,160 150,130 250,90 350,110 450,70 550,50 650,30"
                        />
                        
                        {/* Interactive dots */}
                        <circle cx="50" cy="160" r="5" fill="var(--primary)" />
                        <circle cx="150" cy="130" r="5" fill="var(--primary)" />
                        <circle cx="250" cy="90" r="5" fill="var(--primary)" />
                        <circle cx="350" cy="110" r="5" fill="var(--primary)" />
                        <circle cx="450" cy="70" r="5" fill="var(--primary)" />
                        <circle cx="550" cy="50" r="5" fill="var(--primary)" />
                        <circle cx="650" cy="30" r="5" fill="var(--primary)" />

                        {/* Chart labels */}
                        <text x="50" y="195" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Mon</text>
                        <text x="150" y="195" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Tue</text>
                        <text x="250" y="195" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Wed</text>
                        <text x="350" y="195" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Thu</text>
                        <text x="450" y="195" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Fri</text>
                        <text x="550" y="195" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Sat</text>
                        <text x="650" y="195" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Sun</text>
                        
                        <text x="30" y="165" fill="var(--text-muted)" fontSize="10" textAnchor="end">200</text>
                        <text x="30" y="115" fill="var(--text-muted)" fontSize="10" textAnchor="end">500</text>
                        <text x="30" y="35" fill="var(--text-muted)" fontSize="10" textAnchor="end">900</text>
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CMS builder */}
              {activeTab === 'cms' && (
                <div className="card" style={{ padding: '32px', textAlign: 'left' }}>
                  <form onSubmit={handleSaveCms}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>Homepage Copywriting</h3>
                    <div className="form-group">
                      <label className="form-label">Hero Title</label>
                      <input type="text" name="home_hero_title" value={cmsForm.home_hero_title || ''} onChange={handleCmsChange} className="form-control" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Hero Subtitle</label>
                      <textarea name="home_hero_subtitle" value={cmsForm.home_hero_subtitle || ''} onChange={handleCmsChange} className="form-control" />
                    </div>

                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '40px', marginBottom: '20px' }}>Company Information</h3>
                    <div className="form-group">
                      <label className="form-label">About Story</label>
                      <textarea name="company_story" value={cmsForm.company_story || ''} onChange={handleCmsChange} className="form-control" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mission statement</label>
                      <textarea name="company_mission" value={cmsForm.company_mission || ''} onChange={handleCmsChange} className="form-control" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Vision statement</label>
                      <textarea name="company_vision" value={cmsForm.company_vision || ''} onChange={handleCmsChange} className="form-control" />
                    </div>

                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '40px', marginBottom: '20px' }}>Contact & Social Connections</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div className="form-group">
                        <label className="form-label">Email</label>
                        <input type="email" name="contact_email" value={cmsForm.contact_email || ''} onChange={handleCmsChange} className="form-control" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Phone</label>
                        <input type="text" name="contact_phone" value={cmsForm.contact_phone || ''} onChange={handleCmsChange} className="form-control" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Address</label>
                      <input type="text" name="contact_address" value={cmsForm.contact_address || ''} onChange={handleCmsChange} className="form-control" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">WhatsApp Link</label>
                      <input type="url" name="whatsapp_link" value={cmsForm.whatsapp_link || ''} onChange={handleCmsChange} className="form-control" />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ padding: '12px 28px', marginTop: '20px' }}>
                      Save Content Changes
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 3: PROJECTS CRUD */}
              {activeTab === 'projects' && (
                <div style={{ textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Showcase Item Records</h3>
                    <button onClick={() => openProjModal('create')} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                      <Plus size={16} /> Add Case Study
                    </button>
                  </div>

                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Image</th>
                          <th>Project Title</th>
                          <th>Category</th>
                          <th>Client</th>
                          <th>Metrics Result</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projects.map(proj => (
                          <tr key={proj.id}>
                            <td><img src={proj.image_url} style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} onError={e => e.target.src='https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=80&q=80'} /></td>
                            <td><strong>{proj.title}</strong></td>
                            <td><span className="badge badge-primary">{proj.category}</span></td>
                            <td>{proj.client_name || 'N/A'}</td>
                            <td><span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{proj.results_metric || 'N/A'}</span></td>
                            <td>
                              <div className="actions-cell">
                                <button onClick={() => openProjModal('edit', proj)} className="btn btn-outline" style={{ padding: '6px', color: 'var(--primary)' }}><Edit size={14} /></button>
                                <button onClick={() => handleDeleteProject(proj.id)} className="btn btn-outline" style={{ padding: '6px', color: 'var(--error)' }}><Trash2 size={14} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: SERVICES CRUD */}
              {activeTab === 'services' && (
                <div style={{ textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Service Plans</h3>
                    <button onClick={() => openServModal('create')} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                      <Plus size={16} /> Add Service
                    </button>
                  </div>

                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Basic Price</th>
                          <th>Standard Price</th>
                          <th>Premium Price</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {services.map(serv => (
                          <tr key={serv.id}>
                            <td><strong>{serv.name}</strong></td>
                            <td>${parseFloat(serv.basic_price).toLocaleString()}</td>
                            <td>${parseFloat(serv.standard_price).toLocaleString()}</td>
                            <td>${parseFloat(serv.premium_price).toLocaleString()}</td>
                            <td>
                              <div className="actions-cell">
                                <button onClick={() => openServModal('edit', serv)} className="btn btn-outline" style={{ padding: '6px', color: 'var(--primary)' }}><Edit size={14} /></button>
                                <button onClick={() => handleDeleteService(serv.id)} className="btn btn-outline" style={{ padding: '6px', color: 'var(--error)' }}><Trash2 size={14} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 5: LEADS CENTER */}
              {activeTab === 'leads' && (
                <div style={{ textAlign: 'left' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '24px' }}>Inbound Sales Leads</h3>

                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Sender</th>
                          <th>Category Type</th>
                          <th>AI Quality Score</th>
                          <th>Date</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inquiries.length === 0 ? (
                          <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No leads registered.</td></tr>
                        ) : (
                          inquiries.map(inq => (
                            <tr key={inq.id}>
                              <td>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <strong>{inq.name}</strong>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inq.email}</span>
                                </div>
                              </td>
                              <td><span className="badge">{inq.type.toUpperCase()}</span></td>
                              <td>
                                <span style={{
                                  fontWeight: 700,
                                  color: inq.ai_score >= 70 ? 'var(--success)' : (inq.ai_score >= 40 ? 'var(--accent)' : 'var(--error)')
                                }}>
                                  {inq.ai_score}/100
                                </span>
                              </td>
                              <td>{new Date(inq.created_at).toLocaleDateString()}</td>
                              <td>
                                <span style={{
                                  display: 'inline-block',
                                  padding: '2px 8px',
                                  borderRadius: '10px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  backgroundColor: inq.status === 'unread' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                  color: inq.status === 'unread' ? 'var(--error)' : 'var(--success)'
                                }}>
                                  {inq.status}
                                </span>
                              </td>
                              <td>
                                <div className="actions-cell">
                                  <button onClick={() => handleViewInquiry(inq)} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Read</button>
                                  <button onClick={() => handleToggleLeadStatus(inq)} className="btn btn-outline" style={{ padding: '6px 10px', fontSize: '0.8rem' }}>Toggle Status</button>
                                  <button onClick={() => handleDeleteLead(inq.id)} className="btn btn-outline" style={{ padding: '6px', color: 'var(--error)' }}><Trash2 size={14} /></button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 6: CAREERS */}
              {activeTab === 'careers' && (
                <div style={{ textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Open Vacancies</h3>
                    <button onClick={() => openJobModal('create')} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                      <Plus size={16} /> Add Opening
                    </button>
                  </div>

                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Job Title</th>
                          <th>Location</th>
                          <th>Type</th>
                          <th>Salary</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {careers.map(job => (
                          <tr key={job.id}>
                            <td><strong>{job.title}</strong></td>
                            <td>{job.location}</td>
                            <td><span className="badge">{job.type}</span></td>
                            <td>{job.salary || 'N/A'}</td>
                            <td>
                              <div className="actions-cell">
                                <button onClick={() => openJobModal('edit', job)} className="btn btn-outline" style={{ padding: '6px', color: 'var(--primary)' }}><Edit size={14} /></button>
                                <button onClick={() => handleDeleteCareer(job.id)} className="btn btn-outline" style={{ padding: '6px', color: 'var(--error)' }}><Trash2 size={14} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '40px', marginBottom: '20px' }}>Inbound CV Applications</h3>
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Applicant</th>
                          <th>Phone</th>
                          <th>Target Role</th>
                          <th>Resume</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applications.length === 0 ? (
                          <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No applications received.</td></tr>
                        ) : (
                          applications.map(app => (
                            <tr key={app.id}>
                              <td>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <strong>{app.applicant_name}</strong>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.applicant_email}</span>
                                </div>
                              </td>
                              <td>{app.applicant_phone}</td>
                              <td><span className="badge badge-primary">{app.job_title}</span></td>
                              <td>
                                <a href={`${API_BASE_URL}/${app.cv_url}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontWeight: 700 }}>
                                  Open PDF <ExternalLink size={12} />
                                </a>
                              </td>
                              <td>{new Date(app.created_at).toLocaleDateString()}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 7: AI STUDIO */}
              {activeTab === 'ai' && (
                <div className="card" style={{ padding: '32px', textAlign: 'left' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={18} style={{ color: 'var(--primary)' }} /> Generative AI Copilot
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '32px' }}>
                    Generate detailed, optimized case study paragraphs automatically based on your initial parameters.
                  </p>

                  <div className="form-group">
                    <label className="form-label">Project Title</label>
                    <input 
                      type="text" 
                      value={aiPrompt.title} 
                      onChange={e => setAiPrompt(prev => ({ ...prev, title: e.target.value }))} 
                      className="form-control" 
                      placeholder="e.g. Amazon Cloud Migration" 
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '28px' }}>
                    <label className="form-label">Category</label>
                    <select 
                      value={aiPrompt.category} 
                      onChange={e => setAiPrompt(prev => ({ ...prev, category: e.target.value }))} 
                      className="form-control"
                    >
                      <option>Website Development</option>
                      <option>Mobile App Development</option>
                      <option>UI/UX Design</option>
                      <option>Backend Development & API Integration</option>
                      <option>E-commerce Solutions</option>
                      <option>Software & Web Applications</option>
                      <option>Networking & IT Solutions</option>
                      <option>Maintenance & Support</option>
                    </select>
                  </div>

                  <button 
                    type="button" 
                    onClick={handleGenerateDesc} 
                    className="btn btn-primary" 
                    disabled={aiLoading}
                    style={{ marginBottom: '30px' }}
                  >
                    {aiLoading ? 'Generating Paragraphs...' : 'Generate Case Study Details'}
                  </button>

                  {aiResult && (
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px', color: 'var(--primary)' }}>Generated Result:</h4>
                      <div style={{ 
                        backgroundColor: 'var(--bg-primary)', 
                        padding: '20px', 
                        borderRadius: 'var(--radius-sm)', 
                        fontSize: '0.925rem', 
                        lineHeight: 1.6, 
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)'
                      }}>
                        {aiResult}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* MODAL: PROJECT CREATE/EDIT */}
      {projectModal.open && (
        <div className="modal-backdrop" onClick={() => setProjectModal({ open: false, mode: 'create', data: null })}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ textAlign: 'left' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                {projectModal.mode === 'edit' ? 'Edit Case Study' : 'Create Case Study'}
              </h3>
              <button onClick={() => setProjectModal({ open: false, mode: 'create', data: null })} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSaveProject}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Project Title</label>
                  <input type="text" name="title" value={projectForm.title} onChange={handleProjectFormChange} className="form-control" required />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select name="category" value={projectForm.category} onChange={handleProjectFormChange} className="form-control">
                      <option>Website Development</option>
                      <option>Mobile App Development</option>
                      <option>UI/UX Design</option>
                      <option>Backend Development & API Integration</option>
                      <option>E-commerce Solutions</option>
                      <option>Software & Web Applications</option>
                      <option>Networking & IT Solutions</option>
                      <option>Maintenance & Support</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Client Name</label>
                    <input type="text" name="client_name" value={projectForm.client_name} onChange={handleProjectFormChange} className="form-control" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">Completion Date</label>
                    <input type="text" name="completion_date" value={projectForm.completion_date} onChange={handleProjectFormChange} className="form-control" placeholder="e.g. March 2026" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Results Metric</label>
                    <input type="text" name="results_metric" value={projectForm.results_metric} onChange={handleProjectFormChange} className="form-control" placeholder="e.g. Latency dropped to < 5ms" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Brief Summary</label>
                  <textarea name="summary" value={projectForm.summary} onChange={handleProjectFormChange} className="form-control" required />
                </div>

                <div className="form-group">
                  <label className="form-label">The Challenge</label>
                  <textarea name="challenge" value={projectForm.challenge} onChange={handleProjectFormChange} className="form-control" required />
                </div>

                <div className="form-group">
                  <label className="form-label">The Solution</label>
                  <textarea name="solution" value={projectForm.solution} onChange={handleProjectFormChange} className="form-control" required />
                </div>

                <div className="form-group">
                  <label className="form-label">Featured Image URL</label>
                  <input type="url" name="image_url" value={projectForm.image_url} onChange={handleProjectFormChange} className="form-control" required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">Live Project URL</label>
                    <input type="url" name="project_url" value={projectForm.project_url} onChange={handleProjectFormChange} className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">GitHub URL</label>
                    <input type="url" name="github_url" value={projectForm.github_url} onChange={handleProjectFormChange} className="form-control" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Tech Stack (Comma separated)</label>
                  <input type="text" name="tech_stack" value={projectForm.tech_stack || ''} onChange={handleProjectFormChange} className="form-control" placeholder="e.g. React, Node.js, MySQL" />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setProjectModal({ open: false, mode: 'create', data: null })} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Case Study</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SERVICE CREATE/EDIT */}
      {serviceModal.open && (
        <div className="modal-backdrop" onClick={() => setServiceModal({ open: false, mode: 'create', data: null })}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ textAlign: 'left' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                {serviceModal.mode === 'edit' ? 'Edit Service' : 'Create Service'}
              </h3>
              <button onClick={() => setServiceModal({ open: false, mode: 'create', data: null })} style={{ border: 'none', background: 'none' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSaveService}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Service Name</label>
                  <input type="text" name="name" value={serviceForm.name} onChange={handleServiceFormChange} className="form-control" required />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea name="description" value={serviceForm.description} onChange={handleServiceFormChange} className="form-control" required />
                </div>

                <div className="form-group">
                  <label className="form-label">Benefits (Comma separated list)</label>
                  <input type="text" name="benefits" value={serviceForm.benefits} onChange={handleServiceFormChange} className="form-control" placeholder="Speed, Scale, Security" required />
                </div>

                <div className="form-group">
                  <label className="form-label">Features (Comma separated list)</label>
                  <input type="text" name="features" value={serviceForm.features} onChange={handleServiceFormChange} className="form-control" placeholder="Next.js build, SEO check" required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Basic Price ($)</label>
                    <input type="number" name="basic_price" value={serviceForm.basic_price} onChange={handleServiceFormChange} className="form-control" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Standard Price ($)</label>
                    <input type="number" name="standard_price" value={serviceForm.standard_price} onChange={handleServiceFormChange} className="form-control" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Premium Price ($)</label>
                    <input type="number" name="premium_price" value={serviceForm.premium_price} onChange={handleServiceFormChange} className="form-control" required />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setServiceModal({ open: false, mode: 'create', data: null })} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Service</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CAREER CREATE/EDIT */}
      {careerModal.open && (
        <div className="modal-backdrop" onClick={() => setCareerModal({ open: false, mode: 'create', data: null })}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ textAlign: 'left' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                {careerModal.mode === 'edit' ? 'Edit Job Opening' : 'Create Job Opening'}
              </h3>
              <button onClick={() => setCareerModal({ open: false, mode: 'create', data: null })} style={{ border: 'none', background: 'none' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSaveCareer}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Job Title</label>
                  <input type="text" name="title" value={careerForm.title} onChange={handleCareerFormChange} className="form-control" required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input type="text" name="location" value={careerForm.location} onChange={handleCareerFormChange} className="form-control" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select name="type" value={careerForm.type} onChange={handleCareerFormChange} className="form-control">
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Contract</option>
                      <option>Remote</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Salary Range</label>
                  <input type="text" name="salary" value={careerForm.salary} onChange={handleCareerFormChange} className="form-control" placeholder="e.g. $80,000 - $100,000" />
                </div>

                <div className="form-group">
                  <label className="form-label">Role Description</label>
                  <textarea name="description" value={careerForm.description} onChange={handleCareerFormChange} className="form-control" required />
                </div>

                <div className="form-group">
                  <label className="form-label">Requirements</label>
                  <textarea name="requirements" value={careerForm.requirements} onChange={handleCareerFormChange} className="form-control" required />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setCareerModal({ open: false, mode: 'create', data: null })} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Job</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW LEADS DETAILS */}
      {viewInquiryModal.open && viewInquiryModal.data && (
        <div className="modal-backdrop" onClick={() => setViewInquiryModal({ open: false, data: null })}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ textAlign: 'left' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Lead Specifications</h3>
              <button onClick={() => setViewInquiryModal({ open: false, data: null })} style={{ border: 'none', background: 'none' }}><X size={20} /></button>
            </div>
            
            <div className="modal-body">
              <div style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Name</span>
                    <strong>{viewInquiryModal.data.name}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Email</span>
                    <strong>{viewInquiryModal.data.email}</strong>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Company</span>
                    <strong>{viewInquiryModal.data.company || 'N/A'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Phone</span>
                    <strong>{viewInquiryModal.data.phone || 'N/A'}</strong>
                  </div>
                </div>

                {viewInquiryModal.data.type === 'quote' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Target Budget</span>
                      <strong style={{ color: 'var(--primary)' }}>{viewInquiryModal.data.budget}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Target Timeline</span>
                      <strong style={{ color: 'var(--primary)' }}>{viewInquiryModal.data.timeline}</strong>
                    </div>
                  </div>
                )}

                {viewInquiryModal.data.type === 'booking' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Booking Date</span>
                      <strong style={{ color: 'var(--secondary)' }}>{viewInquiryModal.data.booking_date}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Booking Time</span>
                      <strong style={{ color: 'var(--secondary)' }}>{viewInquiryModal.data.booking_time}</strong>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Requirements & Message:</span>
                <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-sm)', fontSize: '0.925rem', whiteSpace: 'pre-wrap' }}>
                  {viewInquiryModal.data.message}
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => handleDeleteLead(viewInquiryModal.data.id)} className="btn btn-outline" style={{ color: 'var(--error)' }}>Remove Record</button>
              <button onClick={() => setViewInquiryModal({ open: false, data: null })} className="btn btn-primary">Close</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
