import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CmsContext } from '../App';
import { 
  ShieldCheck, LayoutDashboard, Briefcase, MessageSquare, LogOut, Plus, 
  Edit, Trash2, Mail, Check, AlertCircle, ExternalLink, Calendar, X, 
  Settings, Users, Sparkles, Code, FileText, ChevronRight, BarChart3, HelpCircle
} from 'lucide-react';
import { API_BASE_URL } from '../config';

const DEFAULT_LAYOUT = [
  { id: 'hero', name: 'Hero Banner', visible: true },
  { id: 'trusted_by', name: 'Trusted By Marquee', visible: true },
  { id: 'intro', name: 'Who We Are / What We Do', visible: true },
  { id: 'services', name: 'Our Core Services', visible: true },
  { id: 'projects', name: 'Featured Engagements', visible: true },
  { id: 'github', name: 'Open Source Repositories', visible: true },
  { id: 'tech_stack', name: 'Core Technology Stack', visible: true },
  { id: 'why_us', name: 'Why Brainfeels Tech', visible: true },
  { id: 'process', name: 'Our Engineering Process', visible: true },
  { id: 'testimonials', name: 'Client Testimonials', visible: true },
  { id: 'cta_block', name: 'Start a Conversation', visible: true },
  { id: 'contact', name: 'Quick Message & Estimator', visible: true }
];

export default function Dashboard() {
  const { reloadCms } = useContext(CmsContext) || {};
  const [activeTab, setActiveTab] = useState('overview'); // overview, cms, projects, services, leads, careers, ai
  const [projects, setProjects] = useState([]);
  const [services, setServices] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [careers, setCareers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [cmsForm, setCmsForm] = useState({});
  const [layout, setLayout] = useState([]);
  const [expandedSection, setExpandedSection] = useState(null);
  const [cmsSubTab, setCmsSubTab] = useState('layout'); // layout, branding, header, footer, social, whatsapp, theme, seo
  
  // Custom Customizer Sub-States
  const [brandAssets, setBrandAssets] = useState({
    logo_text: 'Brainfeels Tech',
    logo_type: 'text',
    logo_url_light: '',
    logo_url_dark: '',
    favicon_url: '/favicon.svg',
    symbol_url: '',
    logo_width: 180,
    logo_height: 45,
    mobile_logo_url: '',
    sticky_logo_url: '',
    show_tagline: false,
    tagline: 'Innovative Software Engineering'
  });
  const [headerBuilder, setHeaderBuilder] = useState({
    layout_type: 'classic',
    is_sticky: true,
    is_transparent: false,
    elements: [
      { id: 'logo', visible: true },
      { id: 'nav_links', visible: true },
      { id: 'cta_button', visible: true },
      { id: 'theme_toggle', visible: true }
    ],
    cta_text: 'Get a Free Quote',
    cta_link: '#/contact'
  });
  const [footerBuilder, setFooterBuilder] = useState({
    layout_type: 'grid',
    columns_count: 4,
    copyright_text: '© 2026 Brainfeels Tech. All rights reserved.',
    legal_links: [
      { label: 'Privacy Policy', url: '#/privacy' },
      { label: 'Terms of Service', url: '#/terms' }
    ],
    newsletter_enabled: true,
    newsletter_title: 'Subscribe to our Newsletter',
    newsletter_placeholder: 'Enter your email address',
    map_iframe_url: '',
    map_enabled: true
  });
  const [socialManagement, setSocialManagement] = useState({
    networks: [
      { name: 'Facebook', url: '', enabled: false, show_badge: false },
      { name: 'Twitter', url: '', enabled: false, show_badge: false },
      { name: 'LinkedIn', url: '', enabled: false, show_badge: false },
      { name: 'GitHub', url: '', enabled: false, show_badge: false },
      { name: 'Instagram', url: '', enabled: false, show_badge: false }
    ]
  });
  const [whatsappHub, setWhatsappHub] = useState({
    widget_enabled: true,
    widget_title: 'Need Help? Chat with Us',
    widget_subtitle: 'We usually respond in a few minutes',
    agents: []
  });
  const [themeCustomizer, setThemeCustomizer] = useState({
    font_family_heading: 'Inter',
    font_family_body: 'Outfit',
    color_primary: '#0f172a',
    color_secondary: '#3b82f6',
    color_bg_light: '#ffffff',
    color_bg_dark: '#0f172a',
    color_text_light: '#1e293b',
    color_text_dark: '#f8fafc',
    color_accent: '#f59e0b',
    border_radius: 8
  });
  const [seoVisibility, setSeoVisibility] = useState({
    robots_txt: 'User-agent: *\nDisallow: /api/\nAllow: /',
    og_title: '',
    og_description: '',
    og_image: '',
    company_schema: ''
  });
  const [agentForm, setAgentForm] = useState({
    id: '', name: '', phone: '', department: 'Technical', welcome_message: '', avatar: '', is_online: true
  });
  const [editingAgentIndex, setEditingAgentIndex] = useState(-1);

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

  const networks = socialManagement.networks || [];
  const agents = whatsappHub.agents || [];

  const handleSocialNetworkChange = (netName, field, value) => {
    setSocialManagement(prev => {
      const currentNetworks = prev.networks || [];
      const updatedNetworks = currentNetworks.map(n => {
        if (n.name.toLowerCase() === netName.toLowerCase()) {
          return { ...n, [field]: value };
        }
        return n;
      });
      
      const exists = currentNetworks.some(n => n.name.toLowerCase() === netName.toLowerCase());
      if (!exists) {
        updatedNetworks.push({
          name: netName,
          url: field === 'url' ? value : '',
          enabled: field === 'enabled' ? value : false,
          show_badge: field === 'show_badge' ? value : false
        });
      }
      
      return { ...prev, networks: updatedNetworks };
    });
  };

  const handleSaveAgent = () => {
    if (!agentForm.name || !agentForm.phone) {
      showFeedback('error', 'Agent Name and WhatsApp Phone Number are required.');
      return;
    }
    
    setWhatsappHub(prev => {
      const currentAgents = [...(prev.agents || [])];
      if (editingAgentIndex > -1) {
        currentAgents[editingAgentIndex] = {
          ...currentAgents[editingAgentIndex],
          name: agentForm.name,
          phone: agentForm.phone,
          department: agentForm.department,
          welcome_message: agentForm.welcome_message,
          avatar: agentForm.avatar,
          is_online: agentForm.is_online
        };
      } else {
        currentAgents.push({
          id: Date.now().toString(),
          name: agentForm.name,
          phone: agentForm.phone,
          department: agentForm.department,
          welcome_message: agentForm.welcome_message,
          avatar: agentForm.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=40&q=80',
          is_online: agentForm.is_online
        });
      }
      return { ...prev, agents: currentAgents };
    });
    
    setEditingAgentIndex(-1);
    setAgentForm({
      id: '',
      name: '',
      phone: '',
      department: 'Technical',
      welcome_message: '',
      avatar: '',
      is_online: true
    });
    showFeedback('success', editingAgentIndex > -1 ? 'Agent updated successfully.' : 'Agent added successfully.');
  };

  const handleEditAgent = (index) => {
    const agent = agents[index];
    if (agent) {
      setAgentForm({
        id: agent.id || '',
        name: agent.name || '',
        phone: agent.phone || '',
        department: agent.department || 'Technical',
        welcome_message: agent.welcome_message || '',
        avatar: agent.avatar || '',
        is_online: agent.is_online !== false
      });
      setEditingAgentIndex(index);
    }
  };

  const handleDeleteAgent = (index) => {
    if (window.confirm('Are you sure you want to remove this support agent?')) {
      setWhatsappHub(prev => {
        const currentAgents = [...(prev.agents || [])];
        currentAgents.splice(index, 1);
        return { ...prev, agents: currentAgents };
      });
      showFeedback('success', 'Agent removed successfully.');
      if (editingAgentIndex === index) {
        setEditingAgentIndex(-1);
        setAgentForm({ id: '', name: '', phone: '', department: 'Technical', welcome_message: '', avatar: '', is_online: true });
      }
    }
  };

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
      if (resCMS && resCMS.homepage_layout) {
        try {
          const parsed = JSON.parse(resCMS.homepage_layout);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setLayout(parsed);
          } else {
            setLayout(DEFAULT_LAYOUT);
          }
        } catch (e) {
          setLayout(DEFAULT_LAYOUT);
        }
      } else {
        setLayout(DEFAULT_LAYOUT);
      }

      if (resCMS) {
        const parseSetting = (key, defaultVal) => {
          if (!resCMS[key]) return defaultVal;
          try {
            return typeof resCMS[key] === 'string' ? JSON.parse(resCMS[key]) : resCMS[key];
          } catch(e) {
            return defaultVal;
          }
        };
        
        setBrandAssets(parseSetting('cms_brand_assets', brandAssets));
        setHeaderBuilder(parseSetting('cms_header_builder', headerBuilder));
        setFooterBuilder(parseSetting('cms_footer_builder', footerBuilder));
        setSocialManagement(parseSetting('cms_social_management', socialManagement));
        setWhatsappHub(parseSetting('cms_whatsapp_hub', whatsappHub));
        setThemeCustomizer(parseSetting('cms_theme_customizer', themeCustomizer));
        setSeoVisibility(parseSetting('cms_seo_visibility', seoVisibility));
      }

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
  const moveSection = (index, direction) => {
    const newLayout = [...layout];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newLayout.length) return;
    
    // Swap elements
    const temp = newLayout[index];
    newLayout[index] = newLayout[targetIndex];
    newLayout[targetIndex] = temp;
    
    setLayout(newLayout);
  };

  const toggleSectionVisibility = (index) => {
    const newLayout = [...layout];
    newLayout[index].visible = !newLayout[index].visible;
    setLayout(newLayout);
  };

  const handleCmsChange = (e) => {
    const { name, value } = e.target;
    setCmsForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveCms = async (e) => {
    if (e) e.preventDefault();
    try {
      const payload = {
        ...cmsForm,
        homepage_layout: JSON.stringify(layout),
        cms_brand_assets: JSON.stringify(brandAssets),
        cms_header_builder: JSON.stringify(headerBuilder),
        cms_footer_builder: JSON.stringify(footerBuilder),
        cms_social_management: JSON.stringify(socialManagement),
        cms_whatsapp_hub: JSON.stringify(whatsappHub),
        cms_theme_customizer: JSON.stringify(themeCustomizer),
        cms_seo_visibility: JSON.stringify(seoVisibility)
      };
      const res = await adminFetch(`${API_BASE_URL}/cms.php`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showFeedback('success', 'CMS settings updated successfully.');
        loadAllDashboardData();
        if (typeof reloadCms === 'function') reloadCms();
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Enterprise Site Builder</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                          Customize headers, footers, social platforms, live theme settings, and SEO visibility parameters.
                        </p>
                      </div>
                      <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>
                        Publish Customizer Changes
                      </button>
                    </div>

                    {/* Customizer Sub-Tabs Navigation */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', flexWrap: 'wrap' }}>
                      {[
                        { id: 'layout', label: 'Homepage Layout' },
                        { id: 'branding', label: 'Brand Identity' },
                        { id: 'header', label: 'Header Builder' },
                        { id: 'footer', label: 'Footer Builder' },
                        { id: 'social', label: 'Social Center' },
                        { id: 'whatsapp', label: 'WhatsApp Hub' },
                        { id: 'theme', label: 'Theme Customizer' },
                        { id: 'seo', label: 'SEO & Visibility' }
                      ].map(sub => (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => setCmsSubTab(sub.id)}
                          className={`btn ${cmsSubTab === sub.id ? 'btn-primary' : 'btn-outline'}`}
                          style={{ padding: '6px 14px', fontSize: '0.825rem', borderRadius: '20px' }}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>

                    {/* SUB-TAB 1: HOMEPAGE LAYOUT SECTION ORDER */}
                    {cmsSubTab === 'layout' && (
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Homepage Sections Order & Visibility
                        </h4>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '10px' }}>
                          {layout.map((sect, idx) => {
                            const isExpanded = expandedSection === sect.id;
                            return (
                              <div key={sect.id} style={{ 
                                border: '1px solid var(--border)', 
                                borderRadius: 'var(--radius-sm)', 
                                backgroundColor: 'var(--bg-secondary)',
                                overflow: 'hidden',
                                transition: 'var(--transition)'
                              }}>
                                <div style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'space-between', 
                                  padding: '16px 20px', 
                                  backgroundColor: isExpanded ? 'rgba(var(--primary-rgb), 0.03)' : 'transparent',
                                  borderBottom: isExpanded ? '1px solid var(--border)' : 'none'
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', width: '20px' }}>
                                      {idx + 1}
                                    </span>
                                    <span style={{ fontWeight: 700, color: sect.visible ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                                      {sect.name} {!sect.visible && <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--error)', marginLeft: '6px' }}>(Hidden)</span>}
                                    </span>
                                  </div>
                                  
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <button 
                                      type="button" 
                                      onClick={() => moveSection(idx, -1)} 
                                      disabled={idx === 0} 
                                      className="btn btn-outline" 
                                      style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                                    >
                                      ▲ Up
                                    </button>
                                    <button 
                                      type="button" 
                                      onClick={() => moveSection(idx, 1)} 
                                      disabled={idx === layout.length - 1} 
                                      className="btn btn-outline" 
                                      style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                                    >
                                      ▼ Down
                                    </button>
                                    
                                    <button 
                                      type="button" 
                                      onClick={() => toggleSectionVisibility(idx)} 
                                      className="btn btn-outline" 
                                      style={{ 
                                        padding: '6px 12px', 
                                        fontSize: '0.8rem', 
                                        backgroundColor: sect.visible ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                                        color: sect.visible ? 'var(--success)' : 'var(--error)',
                                        borderColor: sect.visible ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'
                                      }}
                                    >
                                      {sect.visible ? 'Visible' : 'Hidden'}
                                    </button>
 
                                    <button 
                                      type="button" 
                                      onClick={() => setExpandedSection(isExpanded ? null : sect.id)} 
                                      className="btn btn-primary" 
                                      style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                                    >
                                      {isExpanded ? 'Collapse' : 'Customize Text'}
                                    </button>
                                  </div>
                                </div>
 
                                {isExpanded && (
                                  <div style={{ padding: '24px', backgroundColor: 'var(--bg-primary)', borderTop: 'none' }}>
                                    {sect.id === 'hero' && (
                                      <>
                                        <div className="form-group">
                                          <label className="form-label">Hero Title</label>
                                          <input type="text" name="home_hero_title" value={cmsForm.home_hero_title || ''} onChange={handleCmsChange} className="form-control" />
                                        </div>
                                        <div className="form-group">
                                          <label className="form-label">Hero Subtitle</label>
                                          <textarea name="home_hero_subtitle" value={cmsForm.home_hero_subtitle || ''} onChange={handleCmsChange} className="form-control" rows={3} />
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                          <div className="form-group">
                                            <label className="form-label">Primary CTA Label</label>
                                            <input type="text" name="home_hero_cta_primary" value={cmsForm.home_hero_cta_primary || ''} onChange={handleCmsChange} className="form-control" />
                                          </div>
                                          <div className="form-group">
                                            <label className="form-label">Secondary CTA Label</label>
                                            <input type="text" name="home_hero_cta_secondary" value={cmsForm.home_hero_cta_secondary || ''} onChange={handleCmsChange} className="form-control" />
                                          </div>
                                        </div>
                                      </>
                                    )}
 
                                    {sect.id === 'trusted_by' && (
                                      <>
                                        <div className="form-group">
                                          <label className="form-label">Trusted By Headline</label>
                                          <input type="text" name="home_trusted_by_title" value={cmsForm.home_trusted_by_title || ''} onChange={handleCmsChange} className="form-control" />
                                        </div>
                                        <div className="form-group">
                                          <label className="form-label">Certified Stacks Subtitle</label>
                                          <input type="text" name="home_trusted_by_subtitle" value={cmsForm.home_trusted_by_subtitle || ''} onChange={handleCmsChange} className="form-control" />
                                        </div>
                                      </>
                                    )}
 
                                    {sect.id === 'intro' && (
                                      <>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                          <div className="form-group">
                                            <label className="form-label">Section Eyebrow</label>
                                            <input type="text" name="home_intro_title" value={cmsForm.home_intro_title || ''} onChange={handleCmsChange} className="form-control" />
                                          </div>
                                          <div className="form-group">
                                            <label className="form-label">Section Title</label>
                                            <input type="text" name="home_intro_subtitle" value={cmsForm.home_intro_subtitle || ''} onChange={handleCmsChange} className="form-control" />
                                          </div>
                                        </div>
                                        <div className="form-group">
                                          <label className="form-label">Who We Are Description</label>
                                          <textarea name="home_intro_description" value={cmsForm.home_intro_description || ''} onChange={handleCmsChange} className="form-control" rows={4} />
                                        </div>
                                      </>
                                    )}
 
                                    {sect.id === 'services' && (
                                      <>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                          <div className="form-group">
                                            <label className="form-label">Services Title</label>
                                            <input type="text" name="home_services_title" value={cmsForm.home_services_title || ''} onChange={handleCmsChange} className="form-control" />
                                          </div>
                                          <div className="form-group">
                                            <label className="form-label">Services Eyebrow</label>
                                            <input type="text" name="home_services_subtitle" value={cmsForm.home_services_subtitle || ''} onChange={handleCmsChange} className="form-control" />
                                          </div>
                                        </div>
                                        <div className="form-group">
                                          <label className="form-label">Services Description</label>
                                          <textarea name="home_services_description" value={cmsForm.home_services_description || ''} onChange={handleCmsChange} className="form-control" rows={3} />
                                        </div>
                                      </>
                                    )}
 
                                    {sect.id === 'projects' && (
                                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div className="form-group">
                                          <label className="form-label">Projects Title</label>
                                          <input type="text" name="home_projects_title" value={cmsForm.home_projects_title || ''} onChange={handleCmsChange} className="form-control" />
                                        </div>
                                        <div className="form-group">
                                          <label className="form-label">Projects Subtitle</label>
                                          <input type="text" name="home_projects_subtitle" value={cmsForm.home_projects_subtitle || ''} onChange={handleCmsChange} className="form-control" />
                                        </div>
                                      </div>
                                    )}
 
                                    {sect.id === 'github' && (
                                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div className="form-group">
                                          <label className="form-label">Github Title</label>
                                          <input type="text" name="home_github_title" value={cmsForm.home_github_title || ''} onChange={handleCmsChange} className="form-control" />
                                        </div>
                                        <div className="form-group">
                                          <label className="form-label">Github Subtitle</label>
                                          <input type="text" name="home_github_subtitle" value={cmsForm.home_github_subtitle || ''} onChange={handleCmsChange} className="form-control" />
                                        </div>
                                      </div>
                                    )}
 
                                    {sect.id === 'tech_stack' && (
                                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div className="form-group">
                                          <label className="form-label">Tech Stack Title</label>
                                          <input type="text" name="home_tech_stack_title" value={cmsForm.home_tech_stack_title || ''} onChange={handleCmsChange} className="form-control" />
                                        </div>
                                        <div className="form-group">
                                          <label className="form-label">Tech Stack Subtitle</label>
                                          <input type="text" name="home_tech_stack_subtitle" value={cmsForm.home_tech_stack_subtitle || ''} onChange={handleCmsChange} className="form-control" />
                                        </div>
                                      </div>
                                    )}
 
                                    {sect.id === 'why_us' && (
                                      <>
                                        <div className="form-group">
                                          <label className="form-label">Why Choose Us Title</label>
                                          <input type="text" name="home_why_us_title" value={cmsForm.home_why_us_title || ''} onChange={handleCmsChange} className="form-control" />
                                        </div>
                                        <div className="form-group">
                                          <label className="form-label">Why Choose Us Description</label>
                                          <textarea name="home_why_us_subtitle" value={cmsForm.home_why_us_subtitle || ''} onChange={handleCmsChange} className="form-control" rows={3} />
                                        </div>
                                      </>
                                    )}
 
                                    {sect.id === 'process' && (
                                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div className="form-group">
                                          <label className="form-label">Process Title</label>
                                          <input type="text" name="home_process_title" value={cmsForm.home_process_title || ''} onChange={handleCmsChange} className="form-control" />
                                        </div>
                                        <div className="form-group">
                                          <label className="form-label">Process Subtitle</label>
                                          <input type="text" name="home_process_subtitle" value={cmsForm.home_process_subtitle || ''} onChange={handleCmsChange} className="form-control" />
                                        </div>
                                      </div>
                                    )}
 
                                    {sect.id === 'testimonials' && (
                                      <>
                                        <div className="form-group">
                                          <label className="form-label">Testimonials Title</label>
                                          <input type="text" name="home_testimonials_title" value={cmsForm.home_testimonials_title || ''} onChange={handleCmsChange} className="form-control" />
                                        </div>
                                        <div className="form-group">
                                          <label className="form-label">Testimonials Subtitle</label>
                                          <textarea name="home_testimonials_subtitle" value={cmsForm.home_testimonials_subtitle || ''} onChange={handleCmsChange} className="form-control" rows={3} />
                                        </div>
                                      </>
                                    )}
 
                                    {sect.id === 'cta_block' && (
                                      <>
                                        <div className="form-group">
                                          <label className="form-label">CTA Block Title</label>
                                          <input type="text" name="home_cta_title" value={cmsForm.home_cta_title || ''} onChange={handleCmsChange} className="form-control" />
                                        </div>
                                        <div className="form-group">
                                          <label className="form-label">CTA Block Subtitle</label>
                                          <textarea name="home_cta_subtitle" value={cmsForm.home_cta_subtitle || ''} onChange={handleCmsChange} className="form-control" rows={3} />
                                        </div>
                                      </>
                                    )}
 
                                    {sect.id === 'contact' && (
                                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div className="form-group">
                                          <label className="form-label">Quick Message Title</label>
                                          <input type="text" name="home_contact_title" value={cmsForm.home_contact_title || ''} onChange={handleCmsChange} className="form-control" />
                                        </div>
                                        <div className="form-group">
                                          <label className="form-label">Cost Estimator Title</label>
                                          <input type="text" name="home_contact_subtitle" value={cmsForm.home_contact_subtitle || ''} onChange={handleCmsChange} className="form-control" />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* SUB-TAB 2: BRAND IDENTITY */}
                    {cmsSubTab === 'branding' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Company Brand Assets
                        </h4>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                          <div className="form-group">
                            <label className="form-label">Logo Display Formula</label>
                            <select 
                              value={brandAssets.logo_type || 'text'} 
                              onChange={(e) => setBrandAssets(prev => ({ ...prev, logo_type: e.target.value }))}
                              className="form-control"
                            >
                              <option value="text">Text Logo Only</option>
                              <option value="image">Image Logo Only</option>
                              <option value="both">Both Text & Image Symbol</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label className="form-label">Favicon Path / URL</label>
                            <input 
                              type="text" 
                              value={brandAssets.favicon_url || ''} 
                              onChange={(e) => setBrandAssets(prev => ({ ...prev, favicon_url: e.target.value }))}
                              className="form-control"
                            />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                          <div className="form-group">
                            <label className="form-label">Company Brand Title Text</label>
                            <input 
                              type="text" 
                              value={brandAssets.logo_text || ''} 
                              onChange={(e) => setBrandAssets(prev => ({ ...prev, logo_text: e.target.value }))}
                              className="form-control"
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Symbol / Icon Mark URL</label>
                            <input 
                              type="text" 
                              value={brandAssets.symbol_url || ''} 
                              onChange={(e) => setBrandAssets(prev => ({ ...prev, symbol_url: e.target.value }))}
                              className="form-control"
                              placeholder="e.g. /favicon.svg"
                            />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                          <div className="form-group">
                            <label className="form-label">Light Mode Brand Logo URL</label>
                            <input 
                              type="text" 
                              value={brandAssets.logo_url_light || ''} 
                              onChange={(e) => setBrandAssets(prev => ({ ...prev, logo_url_light: e.target.value }))}
                              className="form-control"
                              placeholder="Supports direct image URLs or relative paths"
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Dark Mode Brand Logo URL</label>
                            <input 
                              type="text" 
                              value={brandAssets.logo_url_dark || ''} 
                              onChange={(e) => setBrandAssets(prev => ({ ...prev, logo_url_dark: e.target.value }))}
                              className="form-control"
                              placeholder="If blank, uses light mode logo"
                            />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                          <div className="form-group">
                            <label className="form-label">Logo Width Scaling (px)</label>
                            <input 
                              type="number" 
                              value={brandAssets.logo_width || 180} 
                              onChange={(e) => setBrandAssets(prev => ({ ...prev, logo_width: parseInt(e.target.value) || 180 }))}
                              className="form-control"
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Logo Height Scaling (px)</label>
                            <input 
                              type="number" 
                              value={brandAssets.logo_height || 45} 
                              onChange={(e) => setBrandAssets(prev => ({ ...prev, logo_height: parseInt(e.target.value) || 45 }))}
                              className="form-control"
                            />
                          </div>
                          <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginTop: '24px' }}>
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
                              <input 
                                type="checkbox" 
                                checked={!!brandAssets.show_tagline} 
                                onChange={(e) => setBrandAssets(prev => ({ ...prev, show_tagline: e.target.checked }))}
                              /> Show Tagline Under Text Logo
                            </label>
                          </div>
                        </div>

                        {brandAssets.show_tagline && (
                          <div className="form-group">
                            <label className="form-label">Company Brand Tagline</label>
                            <input 
                              type="text" 
                              value={brandAssets.tagline || ''} 
                              onChange={(e) => setBrandAssets(prev => ({ ...prev, tagline: e.target.value }))}
                              className="form-control"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* SUB-TAB 3: HEADER BUILDER */}
                    {cmsSubTab === 'header' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Navigation Header Settings
                        </h4>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                          <div className="form-group">
                            <label className="form-label">Header Preset Layout</label>
                            <select 
                              value={headerBuilder.layout_type || 'classic'} 
                              onChange={(e) => setHeaderBuilder(prev => ({ ...prev, layout_type: e.target.value }))}
                              className="form-control"
                            >
                              <option value="classic">Classic (Logo left, links center, CTA right)</option>
                              <option value="centered">Centered (Logo center, links & actions aligned)</option>
                              <option value="minimal">Minimal (Logo left, full menu drawer hamburger right)</option>
                            </select>
                          </div>
                          <div style={{ display: 'flex', gap: '20px', marginTop: '32px' }}>
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                              <input 
                                type="checkbox" 
                                checked={headerBuilder.is_sticky !== false} 
                                onChange={(e) => setHeaderBuilder(prev => ({ ...prev, is_sticky: e.target.checked }))}
                              /> Sticky on scroll
                            </label>
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                              <input 
                                type="checkbox" 
                                checked={!!headerBuilder.is_transparent} 
                                onChange={(e) => setHeaderBuilder(prev => ({ ...prev, is_transparent: e.target.checked }))}
                              /> Transparent header overlay (Home Hero)
                            </label>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                          <div className="form-group">
                            <label className="form-label">CTA Button Label</label>
                            <input 
                              type="text" 
                              value={headerBuilder.cta_text || ''} 
                              onChange={(e) => setHeaderBuilder(prev => ({ ...prev, cta_text: e.target.value }))}
                              className="form-control"
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">CTA Button Link</label>
                            <input 
                              type="text" 
                              value={headerBuilder.cta_link || ''} 
                              onChange={(e) => setHeaderBuilder(prev => ({ ...prev, cta_link: e.target.value }))}
                              className="form-control"
                              placeholder="e.g. #/contact or /portal"
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label" style={{ marginBottom: '12px' }}>Active Header Elements</label>
                          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                            {(headerBuilder.elements || []).map((el, index) => (
                              <label key={el.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                                <input 
                                  type="checkbox" 
                                  checked={el.visible !== false} 
                                  onChange={(e) => {
                                    const updatedElements = [...headerBuilder.elements];
                                    updatedElements[index] = { ...el, visible: e.target.checked };
                                    setHeaderBuilder(prev => ({ ...prev, elements: updatedElements }));
                                  }}
                                />
                                {el.id === 'logo' && 'Company Logo'}
                                {el.id === 'nav_links' && 'Navigation links'}
                                {el.id === 'cta_button' && 'CTA Action Button'}
                                {el.id === 'theme_toggle' && 'Theme Toggle Button'}
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SUB-TAB 4: FOOTER BUILDER */}
                    {cmsSubTab === 'footer' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Footer Customizer settings
                        </h4>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                          <div className="form-group">
                            <label className="form-label">Columns Count Matrix (1 - 6)</label>
                            <select 
                              value={footerBuilder.columns_count || 4} 
                              onChange={(e) => setFooterBuilder(prev => ({ ...prev, columns_count: parseInt(e.target.value) || 4 }))}
                              className="form-control"
                            >
                              <option value="1">1 Column (Brand Details Only)</option>
                              <option value="2">2 Columns (Brand + Navigation)</option>
                              <option value="3">3 Columns (Brand + Navigation + Services)</option>
                              <option value="4">4 Columns (Standard: Brand + Nav + Services + Contact HQ)</option>
                              <option value="5">5 Columns (Standard + Business Hours)</option>
                              <option value="6">6 Columns (Standard + Business Hours + Live Map Location)</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label className="form-label">Copyright Notice Text</label>
                            <input 
                              type="text" 
                              value={footerBuilder.copyright_text || ''} 
                              onChange={(e) => setFooterBuilder(prev => ({ ...prev, copyright_text: e.target.value }))}
                              className="form-control"
                            />
                          </div>
                        </div>

                        <div style={{ border: '1px dashed var(--border)', padding: '20px', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>Newsletter Subscription</strong>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
                              <input 
                                type="checkbox" 
                                checked={footerBuilder.newsletter_enabled !== false} 
                                onChange={(e) => setFooterBuilder(prev => ({ ...prev, newsletter_enabled: e.target.checked }))}
                              /> Enable Newsletter Bar
                            </label>
                          </div>

                          {footerBuilder.newsletter_enabled !== false && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                              <div className="form-group" style={{ margin: 0 }}>
                                <label className="form-label">Newsletter Title</label>
                                <input 
                                  type="text" 
                                  value={footerBuilder.newsletter_title || ''} 
                                  onChange={(e) => setFooterBuilder(prev => ({ ...prev, newsletter_title: e.target.value }))}
                                  className="form-control"
                                />
                              </div>
                              <div className="form-group" style={{ margin: 0 }}>
                                <label className="form-label">Input Placeholder</label>
                                <input 
                                  type="text" 
                                  value={footerBuilder.newsletter_placeholder || ''} 
                                  onChange={(e) => setFooterBuilder(prev => ({ ...prev, newsletter_placeholder: e.target.value }))}
                                  className="form-control"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <div style={{ border: '1px dashed var(--border)', padding: '20px', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>Embedded Location Map</strong>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
                              <input 
                                type="checkbox" 
                                checked={footerBuilder.map_enabled !== false} 
                                onChange={(e) => setFooterBuilder(prev => ({ ...prev, map_enabled: e.target.checked }))}
                              /> Embed Google Map
                            </label>
                          </div>

                          {footerBuilder.map_enabled !== false && (
                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label">Google Maps Iframe Source URL (Embed URL)</label>
                              <input 
                                type="text" 
                                value={footerBuilder.map_iframe_url || ''} 
                                onChange={(e) => setFooterBuilder(prev => ({ ...prev, map_iframe_url: e.target.value }))}
                                className="form-control"
                                placeholder="Paste the src attribute of Google Maps iframe embed"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* SUB-TAB 5: SOCIAL CENTER */}
                    {cmsSubTab === 'social' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Social Media Integrations (20+ Platforms)
                        </h4>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                          {[
                            'Facebook', 'Twitter', 'LinkedIn', 'GitHub', 'Instagram', 'YouTube', 'TikTok',
                            'Reddit', 'Pinterest', 'Telegram', 'WhatsApp', 'Slack', 'Discord', 'Behance',
                            'Dribbble', 'Medium', 'Twitch', 'Spotify', 'Apple Podcasts', 'Snapchat'
                          ].map(netName => {
                            const config = networks.find(n => n.name.toLowerCase() === netName.toLowerCase()) || { url: '', enabled: false, show_badge: false };
                            return (
                              <div key={netName} style={{ border: '1px solid var(--border)', padding: '16px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{netName}</strong>
                                  <div style={{ display: 'flex', gap: '10px' }}>
                                    <label style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                                      <input 
                                        type="checkbox" 
                                        checked={!!config.enabled} 
                                        onChange={(e) => handleSocialNetworkChange(netName, 'enabled', e.target.checked)}
                                      /> Active
                                    </label>
                                    <label style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                                      <input 
                                        type="checkbox" 
                                        checked={!!config.show_badge} 
                                        onChange={(e) => handleSocialNetworkChange(netName, 'show_badge', e.target.checked)}
                                      /> Badge
                                    </label>
                                  </div>
                                </div>
                                <input 
                                  type="url" 
                                  placeholder={`${netName} profile link`} 
                                  value={config.url || ''} 
                                  onChange={(e) => handleSocialNetworkChange(netName, 'url', e.target.value)}
                                  className="form-control"
                                  style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* SUB-TAB 6: WHATSAPP HUB */}
                    {cmsSubTab === 'whatsapp' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          WhatsApp Departmental Multi-Agent Routing
                        </h4>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                          <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                              <input 
                                type="checkbox" 
                                checked={whatsappHub.widget_enabled !== false} 
                                onChange={(e) => setWhatsappHub(prev => ({ ...prev, widget_enabled: e.target.checked }))}
                              /> Enable Floating WhatsApp Widget
                            </label>
                          </div>
                          <div></div>
                        </div>

                        {whatsappHub.widget_enabled !== false && (
                          <>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                              <div className="form-group">
                                <label className="form-label">Widget Card Title</label>
                                <input 
                                  type="text" 
                                  value={whatsappHub.widget_title || ''} 
                                  onChange={(e) => setWhatsappHub(prev => ({ ...prev, widget_title: e.target.value }))}
                                  className="form-control"
                                />
                              </div>
                              <div className="form-group">
                                <label className="form-label">Widget Card Subtitle</label>
                                <input 
                                  type="text" 
                                  value={whatsappHub.widget_subtitle || ''} 
                                  onChange={(e) => setWhatsappHub(prev => ({ ...prev, widget_subtitle: e.target.value }))}
                                  className="form-control"
                                />
                              </div>
                            </div>

                            {/* CRUD Agent Editor Form */}
                            <div style={{ border: '1px dashed var(--border)', padding: '24px', borderRadius: '12px', backgroundColor: 'var(--bg-primary)' }}>
                              <h5 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px', color: 'var(--primary)' }}>
                                {editingAgentIndex > -1 ? 'Edit Support Agent Record' : 'Configure New Support Agent'}
                              </h5>
                              
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
                                <div className="form-group" style={{ margin: 0 }}>
                                  <label className="form-label">Agent Full Name</label>
                                  <input 
                                    type="text" 
                                    value={agentForm.name} 
                                    onChange={(e) => setAgentForm(prev => ({ ...prev, name: e.target.value }))}
                                    className="form-control"
                                    placeholder="e.g. John Doe"
                                  />
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                  <label className="form-label">WhatsApp Number (with Country Code, no +)</label>
                                  <input 
                                    type="text" 
                                    value={agentForm.phone} 
                                    onChange={(e) => setAgentForm(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
                                    className="form-control"
                                    placeholder="e.g. 2348061657738"
                                  />
                                </div>
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
                                <div className="form-group" style={{ margin: 0 }}>
                                  <label className="form-label">Department Badge</label>
                                  <select 
                                    value={agentForm.department} 
                                    onChange={(e) => setAgentForm(prev => ({ ...prev, department: e.target.value }))}
                                    className="form-control"
                                  >
                                    <option>Technical</option>
                                    <option>Sales</option>
                                    <option>HR</option>
                                    <option>Billing</option>
                                    <option>Support</option>
                                  </select>
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                  <label className="form-label">Avatar Image URL</label>
                                  <input 
                                    type="text" 
                                    value={agentForm.avatar} 
                                    onChange={(e) => setAgentForm(prev => ({ ...prev, avatar: e.target.value }))}
                                    className="form-control"
                                    placeholder="Unsplash URL or relative image path"
                                  />
                                </div>
                              </div>

                              <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label className="form-label">Prefilled Message Template</label>
                                <input 
                                  type="text" 
                                  value={agentForm.welcome_message} 
                                  onChange={(e) => setAgentForm(prev => ({ ...prev, welcome_message: e.target.value }))}
                                  className="form-control"
                                  placeholder="e.g. Hello Technical support, I have a question regarding integrations"
                                />
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                                  <input 
                                    type="checkbox" 
                                    checked={!!agentForm.is_online} 
                                    onChange={(e) => setAgentForm(prev => ({ ...prev, is_online: e.target.checked }))}
                                  /> Mark agent as Online
                                </label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                  {editingAgentIndex > -1 && (
                                    <button 
                                      type="button" 
                                      onClick={() => {
                                        setEditingAgentIndex(-1);
                                        setAgentForm({ id: '', name: '', phone: '', department: 'Technical', welcome_message: '', avatar: '', is_online: true });
                                      }}
                                      className="btn btn-outline"
                                      style={{ padding: '6px 16px', fontSize: '0.85rem' }}
                                    >Cancel</button>
                                  )}
                                  <button 
                                    type="button" 
                                    onClick={handleSaveAgent}
                                    className="btn btn-primary"
                                    style={{ padding: '6px 20px', fontSize: '0.85rem' }}
                                  >
                                    {editingAgentIndex > -1 ? 'Update Agent' : 'Add Agent'}
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Active Agents Table */}
                            <div style={{ marginTop: '16px' }}>
                              <h5 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>Configured Support Agents</h5>
                              <div className="table-responsive" style={{ margin: 0 }}>
                                <table className="table">
                                  <thead>
                                    <tr>
                                      <th>Agent</th>
                                      <th>Phone</th>
                                      <th>Department</th>
                                      <th>Status</th>
                                      <th>Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {agents.length === 0 ? (
                                      <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No support agents defined.</td></tr>
                                    ) : (
                                      agents.map((agent, index) => (
                                        <tr key={agent.id || index}>
                                          <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                              <img src={agent.avatar} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} onError={e => e.target.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=40&q=80'} />
                                              <strong>{agent.name}</strong>
                                            </div>
                                          </td>
                                          <td>+{agent.phone}</td>
                                          <td><span className="badge badge-primary">{agent.department}</span></td>
                                          <td>
                                            <span style={{ 
                                              color: agent.is_online !== false ? 'var(--success)' : 'var(--error)',
                                              fontWeight: 700
                                            }}>{agent.is_online !== false ? 'Online' : 'Offline'}</span>
                                          </td>
                                          <td>
                                            <div className="actions-cell">
                                              <button type="button" onClick={() => handleEditAgent(index)} className="btn btn-outline" style={{ padding: '6px', color: 'var(--primary)' }}><Edit size={14} /></button>
                                              <button type="button" onClick={() => handleDeleteAgent(index)} className="btn btn-outline" style={{ padding: '6px', color: 'var(--error)' }}><Trash2 size={14} /></button>
                                            </div>
                                          </td>
                                        </tr>
                                      ))
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* SUB-TAB 7: THEME CUSTOMIZER */}
                    {cmsSubTab === 'theme' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Visual Styling Theme Builder
                        </h4>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                          <div className="form-group">
                            <label className="form-label">Heading Font Family (Google Fonts)</label>
                            <select 
                              value={themeCustomizer.font_family_heading || 'Inter'}
                              onChange={(e) => handleThemeCustomizerChange('font_family_heading', e.target.value)}
                              className="form-control"
                            >
                              <option>Inter</option>
                              <option>Outfit</option>
                              <option>Plus Jakarta Sans</option>
                              <option>Montserrat</option>
                              <option>Playfair Display</option>
                              <option>Poppins</option>
                              <option>Roboto</option>
                              <option>Lora</option>
                              <option>Space Grotesk</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label className="form-label">Body Font Family (Google Fonts)</label>
                            <select 
                              value={themeCustomizer.font_family_body || 'Outfit'}
                              onChange={(e) => handleThemeCustomizerChange('font_family_body', e.target.value)}
                              className="form-control"
                            >
                              <option>Inter</option>
                              <option>Outfit</option>
                              <option>Plus Jakarta Sans</option>
                              <option>Montserrat</option>
                              <option>Roboto</option>
                              <option>Poppins</option>
                              <option>Open Sans</option>
                            </select>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                          <div className="form-group">
                            <label className="form-label">Primary Branding Color</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input 
                                type="color" 
                                value={themeCustomizer.color_primary || '#0f172a'}
                                onChange={(e) => handleThemeCustomizerChange('color_primary', e.target.value)}
                                style={{ width: '40px', height: '40px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                              />
                              <input 
                                type="text" 
                                value={themeCustomizer.color_primary || '#0f172a'} 
                                onChange={(e) => handleThemeCustomizerChange('color_primary', e.target.value)}
                                className="form-control"
                                style={{ flexGrow: 1 }}
                              />
                            </div>
                          </div>
                          <div className="form-group">
                            <label className="form-label">Secondary Action Color</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input 
                                type="color" 
                                value={themeCustomizer.color_secondary || '#3b82f6'}
                                onChange={(e) => handleThemeCustomizerChange('color_secondary', e.target.value)}
                                style={{ width: '40px', height: '40px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                              />
                              <input 
                                type="text" 
                                value={themeCustomizer.color_secondary || '#3b82f6'} 
                                onChange={(e) => handleThemeCustomizerChange('color_secondary', e.target.value)}
                                className="form-control"
                                style={{ flexGrow: 1 }}
                              />
                            </div>
                          </div>
                          <div className="form-group">
                            <label className="form-label">Accent Highlight Color</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input 
                                type="color" 
                                value={themeCustomizer.color_accent || '#f59e0b'}
                                onChange={(e) => handleThemeCustomizerChange('color_accent', e.target.value)}
                                style={{ width: '40px', height: '40px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                              />
                              <input 
                                type="text" 
                                value={themeCustomizer.color_accent || '#f59e0b'} 
                                onChange={(e) => handleThemeCustomizerChange('color_accent', e.target.value)}
                                className="form-control"
                                style={{ flexGrow: 1 }}
                              />
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                          <div className="form-group">
                            <label className="form-label">Background (Light Mode)</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input 
                                type="color" 
                                value={themeCustomizer.color_bg_light || '#ffffff'}
                                onChange={(e) => handleThemeCustomizerChange('color_bg_light', e.target.value)}
                                style={{ width: '40px', height: '40px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                              />
                              <input 
                                type="text" 
                                value={themeCustomizer.color_bg_light || '#ffffff'} 
                                onChange={(e) => handleThemeCustomizerChange('color_bg_light', e.target.value)}
                                className="form-control"
                                style={{ flexGrow: 1 }}
                              />
                            </div>
                          </div>
                          <div className="form-group">
                            <label className="form-label">Background (Dark Mode)</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input 
                                type="color" 
                                value={themeCustomizer.color_bg_dark || '#0f172a'}
                                onChange={(e) => handleThemeCustomizerChange('color_bg_dark', e.target.value)}
                                style={{ width: '40px', height: '40px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                              />
                              <input 
                                type="text" 
                                value={themeCustomizer.color_bg_dark || '#0f172a'} 
                                onChange={(e) => handleThemeCustomizerChange('color_bg_dark', e.target.value)}
                                className="form-control"
                                style={{ flexGrow: 1 }}
                              />
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                          <div className="form-group">
                            <label className="form-label">Body Text (Light Mode)</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input 
                                type="color" 
                                value={themeCustomizer.color_text_light || '#1e293b'}
                                onChange={(e) => handleThemeCustomizerChange('color_text_light', e.target.value)}
                                style={{ width: '40px', height: '40px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                              />
                              <input 
                                type="text" 
                                value={themeCustomizer.color_text_light || '#1e293b'} 
                                onChange={(e) => handleThemeCustomizerChange('color_text_light', e.target.value)}
                                className="form-control"
                                style={{ flexGrow: 1 }}
                              />
                            </div>
                          </div>
                          <div className="form-group">
                            <label className="form-label">Body Text (Dark Mode)</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input 
                                type="color" 
                                value={themeCustomizer.color_text_dark || '#f8fafc'}
                                onChange={(e) => handleThemeCustomizerChange('color_text_dark', e.target.value)}
                                style={{ width: '40px', height: '40px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                              />
                              <input 
                                type="text" 
                                value={themeCustomizer.color_text_dark || '#f8fafc'} 
                                onChange={(e) => handleThemeCustomizerChange('color_text_dark', e.target.value)}
                                className="form-control"
                                style={{ flexGrow: 1 }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Global Border Radius: <strong>{themeCustomizer.border_radius || 8}px</strong></label>
                          <input 
                            type="range" 
                            min="0" 
                            max="24" 
                            value={themeCustomizer.border_radius || 8} 
                            onChange={(e) => handleThemeCustomizerChange('border_radius', parseInt(e.target.value) || 0)}
                            style={{ width: '100%', accentColor: 'var(--primary)' }}
                          />
                        </div>
                      </div>
                    )}

                    {/* SUB-TAB 8: SEO & VISIBILITY */}
                    {cmsSubTab === 'seo' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          SEO Optimization & Open Graph Parameters
                        </h4>

                        <div className="form-group">
                          <label className="form-label">Open Graph (Social Share) Title</label>
                          <input 
                            type="text" 
                            value={seoVisibility.og_title || ''} 
                            onChange={(e) => handleSeoVisibilityChange('og_title', e.target.value)}
                            className="form-control"
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Open Graph Description</label>
                          <textarea 
                            value={seoVisibility.og_description || ''} 
                            onChange={(e) => handleSeoVisibilityChange('og_description', e.target.value)}
                            className="form-control"
                            rows={2}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Open Graph Preview Image URL</label>
                          <input 
                            type="text" 
                            value={seoVisibility.og_image || ''} 
                            onChange={(e) => handleSeoVisibilityChange('og_image', e.target.value)}
                            className="form-control"
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Robots.txt Content Rules</label>
                          <textarea 
                            value={seoVisibility.robots_txt || 'User-agent: *\nDisallow: /api/\nAllow: /'} 
                            onChange={(e) => handleSeoVisibilityChange('robots_txt', e.target.value)}
                            className="form-control"
                            rows={3}
                            style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Google Structured Schema Markup (JSON-LD)</label>
                          <textarea 
                            value={seoVisibility.company_schema || ''} 
                            onChange={(e) => handleSeoVisibilityChange('company_schema', e.target.value)}
                            className="form-control"
                            rows={6}
                            style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                            placeholder="Place Google Local Business schema JSON here..."
                          />
                        </div>
                      </div>
                    )}

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                      <button type="submit" className="btn btn-primary" style={{ padding: '12px 32px' }}>
                        Publish CMS Settings
                      </button>
                    </div>
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
