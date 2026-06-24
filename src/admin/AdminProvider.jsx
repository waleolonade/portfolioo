import { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { CmsContext } from '../CmsContext';
import { AdminContext } from './AdminContext';

const DEFAULT_LAYOUT = [
  { id: 'hero', name: 'Hero Banner', type: 'builtin', visible: true, settings: {} },
  { id: 'trusted_by', name: 'Trusted By Marquee', type: 'builtin', visible: true, settings: {} },
  { id: 'intro', name: 'Who We Are / What We Do', type: 'builtin', visible: true, settings: {} },
  { id: 'services', name: 'Our Core Services', type: 'builtin', visible: true, settings: {} },
  { id: 'projects', name: 'Featured Engagements', type: 'builtin', visible: true, settings: {} },

  { id: 'tech_stack', name: 'Core Technology Stack', type: 'builtin', visible: true, settings: {} },
  { id: 'why_us', name: 'Why Brainfeels Tech', type: 'builtin', visible: true, settings: {} },
  { id: 'process', name: 'Our Engineering Process', type: 'builtin', visible: true, settings: {} },
  { id: 'testimonials', name: 'Client Testimonials', type: 'builtin', visible: true, settings: {} },
  { id: 'cta_block', name: 'Start a Conversation', type: 'builtin', visible: true, settings: {} },
  { id: 'contact', name: 'Quick Message & Estimator', type: 'builtin', visible: true, settings: {} }
];

const DEFAULT_SECTION_SETTINGS = {
  bg_color: '', bg_image: '', bg_overlay: '', 
  padding_top: 60, padding_bottom: 60,
  max_width: 'full', custom_css_class: '', custom_css: '',
  animation: 'none',
  schedule_start: '', schedule_end: ''
};

export const AdminProvider = ({ children }) => {
  const { reloadCms } = useContext(CmsContext) || {};
  const [projects, setProjects] = useState([]);
  const [services, setServices] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [careers, setCareers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [cmsForm, setCmsForm] = useState({});
  const [layout, setLayout] = useState([]);
  const [expandedSection, setExpandedSection] = useState(null);
  
  // Custom Customizer Sub-States
  const [brandAssets, setBrandAssets] = useState({
    logo_text: 'Brainfeels Tech', logo_type: 'text', logo_url_light: '', logo_url_dark: '',
    favicon_url: '/favicon.svg', symbol_url: '', logo_width: 180, logo_height: 45,
    mobile_logo_url: '', sticky_logo_url: '', show_tagline: false, tagline: 'Innovative Software Engineering'
  });
  const [headerBuilder, setHeaderBuilder] = useState({
    layout_type: 'classic', is_sticky: true, is_transparent: false,
    elements: [{ id: 'logo', visible: true }, { id: 'nav_links', visible: true }, { id: 'cta_button', visible: true }, { id: 'theme_toggle', visible: true }],
    cta_text: 'Get a Free Quote', cta_link: '#/contact'
  });
  const [footerBuilder, setFooterBuilder] = useState({
    layout_type: 'grid', columns_count: 4, copyright_text: '© 2026 Brainfeels Tech. All rights reserved.',
    legal_links: [{ label: 'Privacy Policy', url: '#/privacy' }, { label: 'Terms of Service', url: '#/terms' }],
    newsletter_enabled: true, newsletter_title: 'Subscribe to our Newsletter', newsletter_placeholder: 'Enter your email address', map_iframe_url: '', map_enabled: true
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
    widget_enabled: true, widget_title: 'Need Help? Chat with Us', widget_subtitle: 'We usually respond in a few minutes', agents: []
  });
  const [themeCustomizer, setThemeCustomizer] = useState({
    theme_class: 'theme-quantum',
    font_family_heading: 'Inter', font_family_body: 'Outfit', color_primary: '#0f172a', color_secondary: '#3b82f6',
    color_bg_light: '#ffffff', color_bg_dark: '#0f172a', color_text_light: '#1e293b', color_text_dark: '#f8fafc', color_accent: '#f59e0b', border_radius: 8
  });
  const [seoVisibility, setSeoVisibility] = useState({
    robots_txt: 'User-agent: *\nDisallow: /api/\nAllow: /', og_title: '', og_description: '', og_image: '', company_schema: ''
  });
  const [customCode, setCustomCode] = useState({
    custom_css: '', custom_js: '', custom_head_html: ''
  });
  const [footerLogo, setFooterLogo] = useState({
    footer_logo_url: '', footer_logo_width: 140, footer_logo_height: 40
  });
  const [agentForm, setAgentForm] = useState({ id: '', name: '', phone: '', department: 'Technical', welcome_message: '', avatar: '', is_online: true });
  const [editingAgentIndex, setEditingAgentIndex] = useState(-1);

  // ── NEW: Media Library State ──
  const [mediaLibrary, setMediaLibrary] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false);

  // ── NEW: Revision History State ──
  const [revisions, setRevisions] = useState([]);
  const [revisionsLoading, setRevisionsLoading] = useState(false);

  // ── NEW: Templates (stored in cms_settings as JSON) ──
  const [templates, setTemplates] = useState([]);

  // ── NEW: Undo / Redo ──
  const undoStackRef = useRef([]);
  const redoStackRef = useRef([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

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

  const showFeedback = useCallback((type, msg) => {
    setFeedback({ success: type === 'success' ? msg : null, error: type === 'error' ? msg : null });
    setTimeout(() => setFeedback({ success: null, error: null }), 4500);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  }, [navigate]);

  const adminFetch = useCallback((url, options = {}) => {
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
  }, [token, logout]);

  /* ═══════════════ Undo / Redo ═══════════════ */
  const pushUndo = useCallback((currentLayout) => {
    undoStackRef.current = [...undoStackRef.current.slice(-29), JSON.stringify(currentLayout)];
    redoStackRef.current = [];
    setCanUndo(true);
    setCanRedo(false);
  }, []);

  const undo = useCallback(() => {
    if (undoStackRef.current.length === 0) return;
    const prev = undoStackRef.current.pop();
    redoStackRef.current.push(JSON.stringify(layout));
    setLayout(JSON.parse(prev));
    setCanUndo(undoStackRef.current.length > 0);
    setCanRedo(true);
  }, [layout]);

  const redo = useCallback(() => {
    if (redoStackRef.current.length === 0) return;
    const next = redoStackRef.current.pop();
    undoStackRef.current.push(JSON.stringify(layout));
    setLayout(JSON.parse(next));
    setCanRedo(redoStackRef.current.length > 0);
    setCanUndo(true);
  }, [layout]);

  /* ═══════════════ Layout mutators (with undo) ═══════════════ */
  const updateLayout = useCallback((newLayout) => {
    pushUndo(layout);
    setLayout(newLayout);
  }, [layout, pushUndo]);

  const addSection = useCallback((sectionConfig) => {
    const id = sectionConfig.id && sectionConfig.type !== 'builtin'
      ? `${sectionConfig.id}_${Date.now()}`
      : sectionConfig.id || `custom_${Date.now()}`;
    const exists = sectionConfig.type === 'builtin' && layout.some(s => s.id === id);
    if (exists) {
      showFeedback('error', `"${sectionConfig.name}" already exists. Remove it first or duplicate.`);
      return;
    }
    const newSection = {
      id,
      name: sectionConfig.name || 'New Section',
      type: sectionConfig.type || 'custom_html',
      visible: true,
      settings: { ...DEFAULT_SECTION_SETTINGS },
      html_content: sectionConfig.html_content || '',
      css_content: sectionConfig.css_content || '',
      js_content: sectionConfig.js_content || ''
    };
    pushUndo(layout);
    setLayout(prev => [...prev, newSection]);
    showFeedback('success', `"${newSection.name}" added to homepage.`);
  }, [layout, pushUndo, showFeedback]);

  const duplicateSection = useCallback((idx) => {
    const src = layout[idx];
    if (!src) return;
    const dup = {
      ...JSON.parse(JSON.stringify(src)),
      id: `${src.id}_copy_${Date.now()}`,
      name: `${src.name} (Copy)`
    };
    pushUndo(layout);
    const next = [...layout];
    next.splice(idx + 1, 0, dup);
    setLayout(next);
    showFeedback('success', `"${src.name}" duplicated.`);
  }, [layout, pushUndo, showFeedback]);

  const deleteSection = useCallback((idx) => {
    const src = layout[idx];
    if (!src) return;
    pushUndo(layout);
    setLayout(prev => prev.filter((_, i) => i !== idx));
    showFeedback('success', `"${src.name}" removed.`);
  }, [layout, pushUndo, showFeedback]);

  const updateSectionSettings = useCallback((idx, newSettings) => {
    pushUndo(layout);
    setLayout(prev => prev.map((s, i) => i === idx ? { ...s, settings: { ...s.settings, ...newSettings } } : s));
  }, [layout, pushUndo]);

  const updateSectionContent = useCallback((idx, field, value) => {
    setLayout(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  }, []);

  /* ═══════════════ Media Library ═══════════════ */
  const loadMedia = useCallback(async (search = '') => {
    setMediaLoading(true);
    try {
      const qs = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await adminFetch(`${API_BASE_URL}/media.php${qs}`);
      if (res.ok && res.data.success) setMediaLibrary(res.data.media || []);
    } catch { /* silent */ }
    finally { setMediaLoading(false); }
  }, [adminFetch]);

  const deleteMedia = useCallback(async (id) => {
    try {
      const res = await adminFetch(`${API_BASE_URL}/media.php`, {
        method: 'DELETE', body: JSON.stringify({ id })
      });
      if (res.ok) {
        setMediaLibrary(prev => prev.filter(m => m.id !== id));
        showFeedback('success', 'Media file deleted.');
      }
    } catch { showFeedback('error', 'Failed to delete media.'); }
  }, [adminFetch, showFeedback]);

  /* ═══════════════ Revisions ═══════════════ */
  const loadRevisions = useCallback(async () => {
    setRevisionsLoading(true);
    try {
      const res = await adminFetch(`${API_BASE_URL}/media.php?action=list_revisions`, { method: 'POST', body: '{}' });
      if (res.ok && res.data.success) setRevisions(res.data.revisions || []);
    } catch { /* silent */ }
    finally { setRevisionsLoading(false); }
  }, [adminFetch]);

  const saveRevision = useCallback(async (description = 'Auto-save') => {
    try {
      const revData = JSON.stringify({ layout, themeCustomizer, brandAssets, customCode });
      await adminFetch(`${API_BASE_URL}/media.php?action=save_revision`, {
        method: 'POST', body: JSON.stringify({ revision_data: revData, description })
      });
    } catch { /* non-critical */ }
  }, [layout, themeCustomizer, brandAssets, customCode, adminFetch]);

  const restoreRevision = useCallback(async (id) => {
    try {
      const res = await adminFetch(`${API_BASE_URL}/media.php?action=get_revision`, {
        method: 'POST', body: JSON.stringify({ id })
      });
      if (res.ok && res.data.success) {
        const data = JSON.parse(res.data.revision.revision_data);
        pushUndo(layout);
        if (data.layout) setLayout(data.layout);
        if (data.themeCustomizer) setThemeCustomizer(data.themeCustomizer);
        if (data.brandAssets) setBrandAssets(data.brandAssets);
        if (data.customCode) setCustomCode(data.customCode);
        showFeedback('success', 'Revision restored. Save to publish.');
      }
    } catch { showFeedback('error', 'Failed to restore revision.'); }
  }, [layout, pushUndo, adminFetch, showFeedback]);

  /* ═══════════════ Templates ═══════════════ */
  const saveTemplate = useCallback((name) => {
    const tmpl = {
      id: `tmpl_${Date.now()}`,
      name,
      layout: JSON.parse(JSON.stringify(layout)),
      theme: JSON.parse(JSON.stringify(themeCustomizer)),
      created_at: new Date().toISOString()
    };
    setTemplates(prev => [...prev, tmpl]);
    showFeedback('success', `Template "${name}" saved.`);
  }, [layout, themeCustomizer, showFeedback]);

  const loadTemplate = useCallback((tmpl) => {
    pushUndo(layout);
    if (tmpl.layout) setLayout(tmpl.layout);
    if (tmpl.theme) setThemeCustomizer(tmpl.theme);
    showFeedback('success', `Template "${tmpl.name}" applied. Save to publish.`);
  }, [layout, pushUndo, showFeedback]);

  const deleteTemplate = useCallback((id) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    showFeedback('success', 'Template deleted.');
  }, [showFeedback]);

  /* ═══════════════ Data Loading ═══════════════ */
  const loadAllDashboardData = useCallback(async () => {
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
      
      // Parse layout — migrate old format to new
      if (resCMS && resCMS.homepage_layout) {
        try {
          const parsed = JSON.parse(resCMS.homepage_layout);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Migrate: ensure all sections have type, settings, etc.
            const migrated = parsed.map(s => ({
              ...s,
              type: s.type || 'builtin',
              name: s.name || s.id,
              settings: s.settings || {},
              html_content: s.html_content || '',
              css_content: s.css_content || '',
              js_content: s.js_content || ''
            }));
            setLayout(migrated);
          } else setLayout(DEFAULT_LAYOUT);
        } catch {
          setLayout(DEFAULT_LAYOUT);
        }
      } else {
        setLayout(DEFAULT_LAYOUT);
      }

      if (resCMS) {
        const parseSetting = (key, defaultVal) => {
          if (!resCMS[key]) return defaultVal;
          try { return typeof resCMS[key] === 'string' ? JSON.parse(resCMS[key]) : resCMS[key]; }
          catch { return defaultVal; }
        };
        
        // Define clean defaults to avoid referencing state variables in useCallback dependency array
        const defaultBrand = { logo_text: 'Brainfeels Tech', logo_type: 'text', logo_url_light: '', logo_url_dark: '', favicon_url: '/favicon.svg', symbol_url: '', logo_width: 180, logo_height: 45, mobile_logo_url: '', sticky_logo_url: '', show_tagline: false, tagline: 'Innovative Software Engineering' };
        const defaultHeader = { layout_type: 'classic', is_sticky: true, is_transparent: false, elements: [{ id: 'logo', visible: true }, { id: 'nav_links', visible: true }, { id: 'cta_button', visible: true }, { id: 'theme_toggle', visible: true }], cta_text: 'Get a Free Quote', cta_link: '#/contact' };
        const defaultFooter = { layout_type: 'grid', columns_count: 4, copyright_text: '© 2026 Brainfeels Tech. All rights reserved.', legal_links: [{ label: 'Privacy Policy', url: '#/privacy' }, { label: 'Terms of Service', url: '#/terms' }], newsletter_enabled: true, newsletter_title: 'Subscribe to our Newsletter', newsletter_placeholder: 'Enter your email address', map_iframe_url: '', map_enabled: true };
        const defaultSocial = { networks: [{ name: 'Facebook', url: '', enabled: false, show_badge: false }, { name: 'Twitter', url: '', enabled: false, show_badge: false }, { name: 'LinkedIn', url: '', enabled: false, show_badge: false }, { name: 'GitHub', url: '', enabled: false, show_badge: false }, { name: 'Instagram', url: '', enabled: false, show_badge: false }] };
        const defaultWhatsapp = { widget_enabled: true, widget_title: 'Need Help? Chat with Us', widget_subtitle: 'We usually respond in a few minutes', agents: [] };
        const defaultTheme = { theme_class: 'theme-quantum', font_family_heading: 'Inter', font_family_body: 'Outfit', color_primary: '#0f172a', color_secondary: '#3b82f6', color_bg_light: '#ffffff', color_bg_dark: '#0f172a', color_text_light: '#1e293b', color_text_dark: '#f8fafc', color_accent: '#f59e0b', border_radius: 8 };
        const defaultSeo = { robots_txt: 'User-agent: *\nDisallow: /api/\nAllow: /', og_title: '', og_description: '', og_image: '', company_schema: '' };

        setBrandAssets(parseSetting('cms_brand_assets', defaultBrand));
        setHeaderBuilder(parseSetting('cms_header_builder', defaultHeader));
        setFooterBuilder(parseSetting('cms_footer_builder', defaultFooter));
        setSocialManagement(parseSetting('cms_social_management', defaultSocial));
        setWhatsappHub(parseSetting('cms_whatsapp_hub', defaultWhatsapp));
        setThemeCustomizer(parseSetting('cms_theme_customizer', defaultTheme));
        setSeoVisibility(parseSetting('cms_seo_visibility', defaultSeo));
        setCustomCode(parseSetting('cms_custom_code', { custom_css: '', custom_js: '', custom_head_html: '' }));
        setFooterLogo(parseSetting('cms_footer_logo', { footer_logo_url: '', footer_logo_width: 140, footer_logo_height: 40 }));
        setTemplates(parseSetting('cms_templates', []));
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
  }, [adminFetch, showFeedback]);

  useEffect(() => {
    if (token) {
      const timer = setTimeout(() => {
        loadAllDashboardData();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [token, loadAllDashboardData]);

  const handleSaveCms = async (e) => {
    if (e) e.preventDefault();
    try {
      // Auto-save a revision before saving
      await saveRevision('Auto-save before publish');

      const payload = {
        ...cmsForm,
        homepage_layout: JSON.stringify(layout),
        cms_brand_assets: JSON.stringify(brandAssets),
        cms_header_builder: JSON.stringify(headerBuilder),
        cms_footer_builder: JSON.stringify(footerBuilder),
        cms_social_management: JSON.stringify(socialManagement),
        cms_whatsapp_hub: JSON.stringify(whatsappHub),
        cms_theme_customizer: JSON.stringify(themeCustomizer),
        cms_seo_visibility: JSON.stringify(seoVisibility),
        cms_custom_code: JSON.stringify(customCode),
        cms_footer_logo: JSON.stringify(footerLogo),
        cms_templates: JSON.stringify(templates)
      };
      const res = await adminFetch(`${API_BASE_URL}/cms.php`, {
        method: 'POST', body: JSON.stringify(payload)
      });
      if (res.ok) {
        showFeedback('success', 'CMS settings published successfully.');
        loadAllDashboardData();
        if (typeof reloadCms === 'function') reloadCms();
      } else {
        throw new Error(res.data.message || 'Failed to save settings.');
      }
    } catch (err) {
      showFeedback('error', err.message);
    }
  };

  const handleSaveProject = async (e) => {
    if (e) e.preventDefault();
    try {
      const isEdit = projectModal.mode === 'edit';
      const url = isEdit 
        ? `${API_BASE_URL}/projects.php?id=${projectForm.id}`
        : `${API_BASE_URL}/projects.php`;
      const method = isEdit ? 'PUT' : 'POST';
      
      const res = await adminFetch(url, {
        method,
        body: JSON.stringify(projectForm)
      });
      
      if (res.ok) {
        showFeedback('success', `Project ${isEdit ? 'updated' : 'created'} successfully.`);
        setProjectModal({ open: false, mode: 'create', data: null });
        loadAllDashboardData();
      } else {
        throw new Error(res.data.message || 'Failed to save project.');
      }
    } catch (err) {
      showFeedback('error', err.message);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await adminFetch(`${API_BASE_URL}/projects.php?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showFeedback('success', 'Project deleted successfully.');
        loadAllDashboardData();
      } else {
        throw new Error(res.data.message || 'Failed to delete project.');
      }
    } catch (err) {
      showFeedback('error', err.message);
    }
  };

  const handleSaveCareer = async (e) => {
    if (e) e.preventDefault();
    try {
      const isEdit = careerModal.mode === 'edit';
      const url = isEdit 
        ? `${API_BASE_URL}/careers.php?id=${careerForm.id}`
        : `${API_BASE_URL}/careers.php`;
      const method = isEdit ? 'PUT' : 'POST';
      
      const res = await adminFetch(url, {
        method,
        body: JSON.stringify(careerForm)
      });
      
      if (res.ok) {
        showFeedback('success', `Career listing ${isEdit ? 'updated' : 'created'} successfully.`);
        setCareerModal({ open: false, mode: 'create', data: null });
        loadAllDashboardData();
      } else {
        throw new Error(res.data.message || 'Failed to save career listing.');
      }
    } catch (err) {
      showFeedback('error', err.message);
    }
  };

  const handleDeleteCareer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this career listing?')) return;
    try {
      const res = await adminFetch(`${API_BASE_URL}/careers.php?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showFeedback('success', 'Career listing deleted.');
        loadAllDashboardData();
      } else {
        throw new Error(res.data.message || 'Failed to delete career listing.');
      }
    } catch (err) {
      showFeedback('error', err.message);
    }
  };

  const handleSaveService = async (e) => {
    if (e) e.preventDefault();
    try {
      const isEdit = serviceModal.mode === 'edit';
      const url = isEdit 
        ? `${API_BASE_URL}/services.php?id=${serviceForm.id}`
        : `${API_BASE_URL}/services.php`;
      const method = isEdit ? 'PUT' : 'POST';
      
      const res = await adminFetch(url, {
        method,
        body: JSON.stringify(serviceForm)
      });
      
      if (res.ok) {
        showFeedback('success', `Service ${isEdit ? 'updated' : 'created'} successfully.`);
        setServiceModal({ open: false, mode: 'create', data: null });
        loadAllDashboardData();
      } else {
        throw new Error(res.data.message || 'Failed to save service.');
      }
    } catch (err) {
      showFeedback('error', err.message);
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      const res = await adminFetch(`${API_BASE_URL}/services.php?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showFeedback('success', 'Service deleted successfully.');
        loadAllDashboardData();
      } else {
        throw new Error(res.data.message || 'Failed to delete service.');
      }
    } catch (err) {
      showFeedback('error', err.message);
    }
  };

  const handleSocialNetworkChange = (netName, field, value) => {
    setSocialManagement(prev => {
      const currentNetworks = prev.networks || [];
      const updatedNetworks = currentNetworks.map(n => {
        if (n.name.toLowerCase() === netName.toLowerCase()) return { ...n, [field]: value };
        return n;
      });
      const exists = currentNetworks.some(n => n.name.toLowerCase() === netName.toLowerCase());
      if (!exists) {
        updatedNetworks.push({ name: netName, url: field === 'url' ? value : '', enabled: field === 'enabled' ? value : false, show_badge: field === 'show_badge' ? value : false });
      }
      return { ...prev, networks: updatedNetworks };
    });
  };

  return (
    <AdminContext.Provider value={{
      projects, setProjects, services, setServices, inquiries, setInquiries, careers, setCareers,
      applications, setApplications, cmsForm, setCmsForm, layout, setLayout, expandedSection, setExpandedSection,
      brandAssets, setBrandAssets, headerBuilder, setHeaderBuilder, footerBuilder, setFooterBuilder,
      socialManagement, setSocialManagement, whatsappHub, setWhatsappHub, themeCustomizer, setThemeCustomizer,
      seoVisibility, setSeoVisibility, customCode, setCustomCode, footerLogo, setFooterLogo,
      agentForm, setAgentForm, editingAgentIndex, setEditingAgentIndex,
      // NEW: Layout mutators
      updateLayout, addSection, duplicateSection, deleteSection, updateSectionSettings, updateSectionContent,
      // NEW: Undo / Redo
      undo, redo, canUndo, canRedo, pushUndo,
      // NEW: Media Library
      mediaLibrary, setMediaLibrary, mediaLoading, loadMedia, deleteMedia,
      // NEW: Revisions
      revisions, revisionsLoading, loadRevisions, saveRevision, restoreRevision,
      // NEW: Templates
      templates, setTemplates, saveTemplate, loadTemplate, deleteTemplate,
      // Existing
      stats, loading, feedback, showFeedback, loadAllDashboardData, adminFetch, handleSaveCms, handleSocialNetworkChange,
      projectModal, setProjectModal, serviceModal, setServiceModal, careerModal, setCareerModal, viewInquiryModal, setViewInquiryModal,
      aiPrompt, setAiPrompt, aiResult, setAiResult, aiLoading, setAiLoading,
      projectForm, setProjectForm, serviceForm, setServiceForm, careerForm, setCareerForm,
      handleSaveProject, handleDeleteProject, handleSaveCareer, handleDeleteCareer,
      handleSaveService, handleDeleteService
    }}>
      {children}
    </AdminContext.Provider>
  );
};
