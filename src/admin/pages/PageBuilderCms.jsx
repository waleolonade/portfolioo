import { useContext, useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminContext } from '../AdminContext';
import { PRESET_THEMES, COMPONENT_PALETTE } from '../constants';
import { API_BASE_URL } from '../../config';
import {
  Sparkles, Layout, Share2, MessageCircle, MessageSquare, Palette, Globe, LayoutTemplate,
  Save, GripVertical, Eye, EyeOff, ArrowUp, ArrowDown, Plus, Trash2,
  Upload, X, Terminal, Play, RotateCcw, Code, Image as ImageIcon,
  Copy, Settings, Undo2, Redo2, Monitor, Tablet, Smartphone, History,
  Wand2, Search, FolderOpen, Layers, ChevronDown, ChevronUp, ChevronLeft, ChevronRight
} from 'lucide-react';

/* ═══════════════════════════════════════════════
   Shared: Image Uploader with Drag & Drop
   ═══════════════════════════════════════════════ */
function ImageUploader({ label, value, onChange, hint, onOpenLibrary }) {
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
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label className="form-label">{label}</label>}
      <div onDrop={e => { e.preventDefault(); setDragActive(false); upload(e.dataTransfer?.files?.[0]); }}
        onDragOver={e => { e.preventDefault(); setDragActive(true); }} onDragLeave={() => setDragActive(false)}
        onClick={() => fileRef.current?.click()}
        style={{ border: `2px dashed ${dragActive ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 'var(--radius-md)',
          padding: value ? 10 : '24px 16px', textAlign: 'center', cursor: 'pointer',
          background: dragActive ? 'rgba(59,130,246,.06)' : 'var(--bg-secondary)', transition: 'all .2s' }}>
        <input ref={fileRef} type="file" accept="image/*" onChange={e => upload(e.target.files?.[0])} style={{ display: 'none' }} />
        {uploading ? <span className="cms-spinner" /> : value ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src={value} alt="" style={{ width: 60, height: 40, objectFit: 'contain', borderRadius: 6, border: '1px solid var(--border)', background: '#fff' }} />
            <span style={{ flex: 1, textAlign: 'left', fontSize: '.75rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>{value.split('/').pop()}</span>
            <button type="button" onClick={e => { e.stopPropagation(); onChange(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={14} /></button>
          </div>
        ) : (
          <><Upload size={22} style={{ color: 'var(--text-muted)', marginBottom: 4 }} /><p style={{ fontSize: '.82rem', color: 'var(--text-secondary)', margin: '0 0 2px' }}><strong>Click to upload</strong> or drag & drop</p><p style={{ fontSize: '.68rem', color: 'var(--text-muted)', margin: 0 }}>PNG, JPG, SVG, WebP · Max 5 MB</p></>
        )}
      </div>
      {onOpenLibrary && <button type="button" onClick={onOpenLibrary} style={{ fontSize: '.75rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', marginTop: 4, textDecoration: 'underline' }}>Browse Media Library</button>}
      {error && <p style={{ color: '#ef4444', fontSize: '.78rem', marginTop: 4 }}>{error}</p>}
      <input type="text" className="form-control" placeholder="Or paste URL…" value={value || ''} onChange={e => onChange(e.target.value)} style={{ marginTop: 6, fontSize: '.78rem' }} />
      {hint && <small style={{ color: 'var(--text-muted)', marginTop: 3, display: 'block' }}>{hint}</small>}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Shared: Code Panel with Line Numbers
   ═══════════════════════════════════════════════ */
function CodePanel({ value, onChange, language, minHeight = 260 }) {
  const taRef = useRef(null); const lnRef = useRef(null);
  const lines = (value || '\n').split('\n');
  const langColor = language === 'css' ? '#8b5cf6' : language === 'js' ? '#eab308' : '#06b6d4';
  const sync = () => { if (lnRef.current && taRef.current) lnRef.current.scrollTop = taRef.current.scrollTop; };
  const onKey = (e) => {
    if (e.key === 'Tab') { e.preventDefault(); const s = e.target.selectionStart; const end = e.target.selectionEnd;
      const nv = value.substring(0, s) + '  ' + value.substring(end); onChange(nv);
      requestAnimationFrame(() => { e.target.selectionStart = e.target.selectionEnd = s + 2; }); }
  };
  return (
    <div style={{ borderRadius: 0, overflow: 'hidden' }}>
      <div style={{ background: '#161b22', padding: '4px 14px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #30363d' }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: langColor }} />
        <span style={{ fontSize: '.7rem', color: '#8b96a3ff', fontFamily: 'monospace' }}>{language.toUpperCase()} · {lines.length} lines</span>
      </div>
      <div style={{ display: 'flex', fontFamily: "'Cascadia Code','Fira Code',Consolas,monospace", fontSize: 12.5, lineHeight: 1.65 }}>
        <div ref={lnRef} style={{ width: 42, background: '#0d1117', color: '#484f58', padding: '10px 6px 10px 0', textAlign: 'right', overflowY: 'hidden', userSelect: 'none', borderRight: '1px solid #21262d' }}>
          {lines.map((_, i) => <div key={i}>{i + 1}</div>)}
        </div>
        <textarea ref={taRef} value={value} onChange={e => onChange(e.target.value)} onScroll={sync} onKeyDown={onKey} spellCheck={false}
          style={{ flex: 1, background: '#0d1117', color: '#e6edf3', border: 'none', outline: 'none', padding: 10, resize: 'vertical', minHeight, lineHeight: 'inherit', fontFamily: 'inherit', fontSize: 'inherit', tabSize: 2 }} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Modal: Media Library Browser
   ═══════════════════════════════════════════════ */
function MediaLibraryModal({ open, onClose, onSelect, mediaLibrary, mediaLoading, loadMedia, deleteMedia }) {
  const [search, setSearch] = useState('');
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { if (open) loadMedia(); }, [open, loadMedia]);

  const filteredMedia = search ? mediaLibrary.filter(m => (m.original_name || m.filename).toLowerCase().includes(search.toLowerCase())) : mediaLibrary;

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    const fd = new FormData(); fd.append('file', file);
    try {
      const res = await fetch(`${API_BASE_URL}/upload.php`, {
        method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }, body: fd
      });
      const d = await res.json();
      if (d.success) loadMedia();
    } catch { /* ignore error during upload */ }
    finally { setUploading(false); }
  };

  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-primary)', borderRadius: 16, width: '90vw', maxWidth: 900, maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid var(--border)' }}>
        {/* Header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.1rem' }}><FolderOpen size={20} style={{ color: 'var(--primary)' }} /> Media Library</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>
        {/* Toolbar */}
        <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Search media…" value={search} onChange={e => setSearch(e.target.value)} className="form-control" style={{ paddingLeft: 32, fontSize: '.85rem' }} />
          </div>
          <button onClick={() => fileRef.current?.click()} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '.82rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            {uploading ? <span className="cms-spinner" /> : <><Upload size={14} /> Upload</>}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={e => handleUpload(e.target.files?.[0])} style={{ display: 'none' }} />
        </div>
        {/* Grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {mediaLoading ? <div style={{ textAlign: 'center', padding: 40 }}><span className="cms-spinner" /></div> :
            filteredMedia.length === 0 ? <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No media files. Upload to get started.</p> :
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
              {filteredMedia.map(m => (
                <div key={m.id} style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', cursor: 'pointer', transition: 'all .2s', position: 'relative' }}
                  onClick={() => { onSelect(m.url); onClose(); }}>
                  <img src={m.url} alt={m.original_name} style={{ width: '100%', height: 100, objectFit: 'cover', display: 'block', background: '#f8fafc' }} />
                  <div style={{ padding: '6px 8px' }}>
                    <p style={{ fontSize: '.68rem', color: 'var(--text-muted)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.original_name || m.filename}</p>
                    <p style={{ fontSize: '.6rem', color: 'var(--text-muted)', margin: 0 }}>{(m.file_size / 1024).toFixed(0)} KB</p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); deleteMedia(parseInt(m.id)); }} title="Delete" style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,.5)', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 4px', cursor: 'pointer', fontSize: '.65rem' }}>✕</button>
                </div>
              ))}
            </div>
          }
        </div>
        <div style={{ padding: '10px 24px', borderTop: '1px solid var(--border)', fontSize: '.75rem', color: 'var(--text-muted)' }}>{filteredMedia.length} file{filteredMedia.length !== 1 ? 's' : ''}</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Modal: Section Settings Panel
   ═══════════════════════════════════════════════ */
function SectionSettingsPanel({ section, idx, onUpdate, onClose }) {
  const s = section.settings || {};
  const set = (key, val) => onUpdate(idx, { [key]: val });
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 9998, display: 'flex', justifyContent: 'flex-end', backdropFilter: 'blur(3px)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 380, maxWidth: '95vw', background: 'var(--bg-primary)', height: '100vh', overflowY: 'auto', borderLeft: '1px solid var(--border)', padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}><Settings size={18} style={{ color: 'var(--primary)' }} /> Section Settings</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>
        <p style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--primary)', marginBottom: 20, padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 8 }}>{section.name}</p>

        {/* Background */}
        <h5 style={{ fontSize: '.82rem', fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--text-muted)' }}>Background</h5>
        <div className="form-group"><label style={{ fontSize: '.8rem' }}>Color</label>
          <div style={{ display: 'flex', gap: 8 }}><input type="color" value={s.bg_color || '#ffffff'} onChange={e => set('bg_color', e.target.value)} style={{ width: 36, height: 36, padding: 2, cursor: 'pointer', borderRadius: 6 }} /><input type="text" className="form-control" value={s.bg_color || ''} onChange={e => set('bg_color', e.target.value)} placeholder="transparent" /></div>
        </div>
        <div className="form-group"><label style={{ fontSize: '.8rem' }}>Image URL</label><input type="text" className="form-control" value={s.bg_image || ''} onChange={e => set('bg_image', e.target.value)} placeholder="https://…" /></div>
        <div className="form-group"><label style={{ fontSize: '.8rem' }}>Overlay Opacity</label><input type="range" min="0" max="1" step="0.05" value={s.bg_overlay || 0} onChange={e => set('bg_overlay', parseFloat(e.target.value))} style={{ width: '100%' }} /><span style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{Math.round((s.bg_overlay || 0) * 100)}%</span></div>

        {/* Spacing */}
        <h5 style={{ fontSize: '.82rem', fontWeight: 700, margin: '24px 0 10px', textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--text-muted)' }}>Spacing</h5>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group"><label style={{ fontSize: '.8rem' }}>Padding Top</label><input type="number" className="form-control" value={s.padding_top ?? 60} onChange={e => set('padding_top', parseInt(e.target.value) || 0)} /></div>
          <div className="form-group"><label style={{ fontSize: '.8rem' }}>Padding Bottom</label><input type="number" className="form-control" value={s.padding_bottom ?? 60} onChange={e => set('padding_bottom', parseInt(e.target.value) || 0)} /></div>
        </div>
        <div className="form-group"><label style={{ fontSize: '.8rem' }}>Max Width</label>
          <select className="form-control" value={s.max_width || 'full'} onChange={e => set('max_width', e.target.value)}>
            <option value="full">Full Width</option><option value="contained">Contained (1200px)</option><option value="narrow">Narrow (800px)</option>
          </select>
        </div>

        {/* Animation */}
        <h5 style={{ fontSize: '.82rem', fontWeight: 700, margin: '24px 0 10px', textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--text-muted)' }}>Animation</h5>
        <div className="form-group">
          <select className="form-control" value={s.animation || 'none'} onChange={e => set('animation', e.target.value)}>
            <option value="none">None</option><option value="fade-in">Fade In</option><option value="slide-up">Slide Up</option><option value="slide-left">Slide Left</option><option value="zoom-in">Zoom In</option>
          </select>
        </div>

        {/* Schedule */}
        <h5 style={{ fontSize: '.82rem', fontWeight: 700, margin: '24px 0 10px', textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--text-muted)' }}>Visibility Schedule</h5>
        <div className="form-group"><label style={{ fontSize: '.8rem' }}>Show After</label><input type="datetime-local" className="form-control" value={s.schedule_start || ''} onChange={e => set('schedule_start', e.target.value)} /></div>
        <div className="form-group"><label style={{ fontSize: '.8rem' }}>Hide After</label><input type="datetime-local" className="form-control" value={s.schedule_end || ''} onChange={e => set('schedule_end', e.target.value)} /></div>

        {/* Custom CSS */}
        <h5 style={{ fontSize: '.82rem', fontWeight: 700, margin: '24px 0 10px', textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--text-muted)' }}>Advanced</h5>
        <div className="form-group"><label style={{ fontSize: '.8rem' }}>CSS Class Name</label><input type="text" className="form-control" value={s.custom_css_class || ''} onChange={e => set('custom_css_class', e.target.value)} placeholder="my-custom-class" /></div>
        <div className="form-group"><label style={{ fontSize: '.8rem' }}>Custom CSS</label><textarea className="form-control" rows={4} style={{ fontFamily: 'monospace', fontSize: '.8rem' }} value={s.custom_css || ''} onChange={e => set('custom_css', e.target.value)} placeholder=".my-custom-class { ... }" /></div>

        <button onClick={onClose} className="btn btn-primary" style={{ width: '100%', marginTop: 20, padding: 12 }}>Done</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN: PageBuilderCms (Enterprise Edition)
   ═══════════════════════════════════════════════ */
export default function PageBuilderCms() {
  const navigate = useNavigate();

  // Redirect to login if token is missing
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const {
    handleSaveCms, brandAssets, setBrandAssets, headerBuilder, setHeaderBuilder,
    footerBuilder, setFooterBuilder, socialManagement, handleSocialNetworkChange,
    whatsappHub, setWhatsappHub, themeCustomizer, setThemeCustomizer, layout, setLayout,
    seoVisibility, setSeoVisibility, showFeedback, customCode, setCustomCode, footerLogo, setFooterLogo,
    addSection, duplicateSection, deleteSection, updateSectionSettings, updateSectionContent,
    undo, redo, canUndo, canRedo, pushUndo, adminFetch,
    mediaLibrary, mediaLoading, loadMedia, deleteMedia,
    revisions, revisionsLoading, loadRevisions, restoreRevision,
    templates, saveTemplate, loadTemplate, deleteTemplate,
    cmsForm, setCmsForm
  } = useContext(AdminContext);

  const [activeTab, setActiveTab] = useState('layout');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  /* Testimonials State */
  const [testimonials, setTestimonials] = useState([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null); // null, 'new', or testimonial object
  const [testimonialForm, setTestimonialForm] = useState({
    id: '', client_name: '', client_role: '', company_name: '', text: '', rating: 5, image_url: ''
  });

  const loadTestimonialsList = useCallback(async () => {
    setTestimonialsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/testimonials.php`);
      const data = await res.json();
      setTestimonials(data || []);
    } catch (err) {
      console.error(err);
      showFeedback('error', 'Failed to load testimonials list');
    } finally {
      setTestimonialsLoading(false);
    }
  }, [showFeedback]);

  useEffect(() => {
    loadTestimonialsList();
  }, [loadTestimonialsList]);

  const handleSaveTestimonial = async (e) => {
    if (e) e.preventDefault();
    if (!testimonialForm.client_name || !testimonialForm.client_role || !testimonialForm.company_name || !testimonialForm.text) {
      showFeedback('error', 'Please fill in all required fields.');
      return;
    }
    try {
      const isEdit = editingTestimonial !== 'new';
      const url = isEdit
        ? `${API_BASE_URL}/testimonials.php?id=${testimonialForm.id}`
        : `${API_BASE_URL}/testimonials.php`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await adminFetch(url, {
        method,
        body: JSON.stringify(testimonialForm)
      });

      if (res.ok) {
        showFeedback('success', `Testimonial ${isEdit ? 'updated' : 'created'} successfully.`);
        setEditingTestimonial(null);
        loadTestimonialsList();
        // Broadcast change to preview iframe
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage({ type: 'TESTIMONIALS_UPDATED' }, '*');
        }
      } else {
        throw new Error(res.data.message || 'Failed to save testimonial.');
      }
    } catch (err) {
      showFeedback('error', err.message);
    }
  };

  const handleDeleteTestimonial = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      const res = await adminFetch(`${API_BASE_URL}/testimonials.php?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showFeedback('success', 'Testimonial deleted successfully.');
        loadTestimonialsList();
        // Broadcast change to preview iframe
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage({ type: 'TESTIMONIALS_UPDATED' }, '*');
        }
      } else {
        throw new Error(res.data.message || 'Failed to delete testimonial.');
      }
    } catch (err) {
      showFeedback('error', err.message);
    }
  };

  /* Drag state */
  const [dragIdx, setDragIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);

  /* Modals */
  const [settingsPanel, setSettingsPanel] = useState(null); // idx
  const [mediaModal, setMediaModal] = useState({ open: false, onSelect: null });
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [revisionsOpen, setRevisionsOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [editHtmlIdx, setEditHtmlIdx] = useState(null);
  const [aiPromptText, setAiPromptText] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);

  // Live Preview Message Broadcaster
  const iframeRef = useRef(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;

    const cmsPayload = {
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
      cms_templates: JSON.stringify(templates),
      seo_title: seoVisibility?.meta_title || '',
      seo_description: seoVisibility?.meta_description || ''
    };

    try {
      iframeRef.current.contentWindow.postMessage({
        type: 'CMS_LIVE_PREVIEW',
        cms: cmsPayload
      }, '*');
    } catch (e) {
      console.error('Failed to postMessage to preview iframe:', e);
    }
  }, [
    cmsForm, layout, brandAssets, headerBuilder, footerBuilder,
    socialManagement, whatsappHub, themeCustomizer, seoVisibility,
    customCode, footerLogo, templates, iframeLoaded
  ]);

  const handlePublish = async (e) => {
    if (e) e.preventDefault();
    setPublishing(true);
    try {
      await handleSaveCms(e);
    } catch (err) {
      console.error(err);
    } finally {
      setPublishing(false);
    }
  };

  const refreshIframe = () => {
    if (iframeRef.current) {
      setIframeLoading(true);
      iframeRef.current.src = `${window.location.origin}${window.location.pathname}`;
    }
  };

  /* Code Editor */
  const [codeTab, setCodeTab] = useState('css');
  const [consoleLog, setConsoleLog] = useState([]);
  const ts = () => new Date().toLocaleTimeString('en-GB', { hour12: false });

  /* Drag handlers */
  const onDragStart = (i) => setDragIdx(i);
  const onDragOver = (e, i) => { e.preventDefault(); setOverIdx(i); };
  const onDragEnd = () => { setDragIdx(null); setOverIdx(null); };
  const onDrop = (i) => {
    if (dragIdx === null || dragIdx === i) { setDragIdx(null); setOverIdx(null); return; }
    pushUndo(layout);
    const next = [...layout]; const [moved] = next.splice(dragIdx, 1);
    next.splice(i, 0, moved); setLayout(next);
    setDragIdx(null); setOverIdx(null);
  };
  const moveSection = (i, dir) => {
    const j = i + dir; if (j < 0 || j >= layout.length) return;
    pushUndo(layout); const next = [...layout]; [next[i], next[j]] = [next[j], next[i]]; setLayout(next);
  };
  const toggleVis = (i) => {
    pushUndo(layout); const next = [...layout]; next[i] = { ...next[i], visible: !next[i].visible }; setLayout(next);
  };

  /* Code Editor */
  const applyCode = () => {
    try {
      let el = document.getElementById('cms-live-css');
      if (!el) { el = document.createElement('style'); el.id = 'cms-live-css'; document.head.appendChild(el); }
      el.innerHTML = customCode.custom_css || '';
      let oldJs = document.getElementById('cms-live-js'); if (oldJs) oldJs.remove();
      if (customCode.custom_js) { const s = document.createElement('script'); s.id = 'cms-live-js'; s.textContent = customCode.custom_js; document.head.appendChild(s); }
      let oldH = document.getElementById('cms-live-html'); if (oldH) oldH.remove();
      if (customCode.custom_head_html) { const d = document.createElement('div'); d.id = 'cms-live-html'; d.innerHTML = customCode.custom_head_html; document.head.appendChild(d); }
      setConsoleLog(p => [...p, { time: ts(), type: 'success', msg: 'Code applied successfully.' }]);
    } catch (err) { setConsoleLog(p => [...p, { time: ts(), type: 'error', msg: err.message }]); }
  };
  const resetCode = () => {
    ['cms-live-css', 'cms-live-js', 'cms-live-html'].forEach(id => document.getElementById(id)?.remove());
    setCustomCode({ custom_css: '', custom_js: '', custom_head_html: '' });
    setConsoleLog(p => [...p, { time: ts(), type: 'info', msg: 'All custom code cleared.' }]);
  };

  /* Theme */
  const shuffleArray = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const installTheme = (theme) => {
    setThemeCustomizer({ theme_class: theme.theme_class || 'theme-quantum', font_family_heading: theme.font_family_heading, font_family_body: theme.font_family_body, color_primary: theme.color_primary, color_secondary: theme.color_secondary, color_accent: theme.color_accent, color_bg_light: theme.color_bg_light, color_bg_dark: theme.color_bg_dark, color_text_light: theme.color_text_light, color_text_dark: theme.color_text_dark, border_radius: theme.border_radius });
    const builtins = layout.filter(s => s.type === 'builtin');
    const customs = layout.filter(s => s.type !== 'builtin');
    const heroIdx = builtins.findIndex(l => l.id === 'hero');
    let hero = null, rest = [...builtins];
    if (heroIdx !== -1) hero = rest.splice(heroIdx, 1)[0];
    let shuffled = shuffleArray(rest);
    if (hero) shuffled.unshift(hero);
    setLayout([...shuffled, ...customs]);
    showFeedback('success', `Theme "${theme.name}" applied with randomized layout!`);
  };

  /* AI Generator */
  const handleAiGenerate = async (typeHint) => {
    setAiGenerating(true);
    const prompt = typeHint || aiPromptText;
    try {
      const res = await adminFetch(`${API_BASE_URL}/ai_helper.php?task=section_generate`, {
        method: 'POST', body: JSON.stringify({ prompt })
      });
      if (res.ok && res.data.success) {
        const r = res.data.result;
        addSection({ type: 'custom_html', id: `ai_${Date.now()}`, name: r.name || 'AI Section', html_content: r.html || '', css_content: r.css || '' });
      } else showFeedback('error', 'AI generation failed.');
    } catch (e) { showFeedback('error', e.message); }
    finally { setAiGenerating(false); setAiPromptText(''); }
  };

  /* Section label */
  const sectionLabel = (s) => s.name || ({ hero: 'Hero Banner', trusted_by: 'Trusted By', intro: 'Who We Are', services: 'Services', projects: 'Projects', github: 'GitHub Repos', tech_stack: 'Tech Stack', why_us: 'Why Choose Us', process: 'Process', testimonials: 'Testimonials', cta_block: 'Call to Action', contact: 'Contact' }[s.id] || s.id);
  const sectionIcon = (s) => s.type === 'custom_html' ? '🧩' : s.type === 'ai' ? '✨' : ({ hero: '🎯', trusted_by: '🏢', intro: '📋', services: '⚙️', projects: '🖼️', github: '🐙', tech_stack: '🛠️', why_us: '✅', process: '🔄', testimonials: '💬', cta_block: '📣', contact: '✉️' }[s.id] || '📄');

  /* Tabs */
  const tabs = [
    { id: 'layout', label: 'Homepage Builder', icon: <LayoutTemplate size={15} /> },
    { id: 'branding', label: 'Brand Identity', icon: <Sparkles size={15} /> },
    { id: 'header', label: 'Header Builder', icon: <Layout size={15} /> },
    { id: 'footer', label: 'Footer Builder', icon: <Layout size={15} /> },
    { id: 'social', label: 'Social Center', icon: <Share2 size={15} /> },
    { id: 'whatsapp', label: 'WhatsApp Hub', icon: <MessageCircle size={15} /> },
    { id: 'theme', label: 'Theme Customizer', icon: <Palette size={15} /> },
    { id: 'testimonials', label: 'Testimonials Manager', icon: <MessageSquare size={15} /> },
    { id: 'code', label: 'Developer IDE', icon: <Terminal size={15} /> },
    { id: 'seo', label: 'SEO & Visibility', icon: <Globe size={15} /> }
  ];

  const deviceWidths = { desktop: '100%', tablet: 768, mobile: 375 };

  return (
    <div className="customizer-container">
      <style>{`
        @keyframes cms-spin{to{transform:rotate(360deg)}}.cms-spinner{display:inline-block;width:16px;height:16px;border:2.5px solid var(--border);border-top-color:var(--primary);border-radius:50%;animation:cms-spin .7s linear infinite}
        @keyframes cms-glow{0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,.35)}50%{box-shadow:0 0 0 6px rgba(99,102,241,0)}}
        .drag-over-line{position:relative}.drag-over-line::before{content:'';position:absolute;top:-2px;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--primary),#8b5cf6);border-radius:2px;animation:cms-glow 1s ease infinite;z-index:2}
        .section-card{transition:all .15s}.section-card:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,.06)}.section-card.dragging{opacity:.3;transform:scale(.97)}
        .cms-code-tab{padding:7px 16px;border:none;cursor:pointer;font-size:.78rem;font-weight:600;border-radius:6px 6px 0 0;transition:all .15s}.cms-code-tab.active{background:#0d1117;color:#e6edf3}.cms-code-tab:not(.active){background:#161b22;color:#8b949e}
        .palette-item{border:1px solid var(--border);border-radius:10px;padding:12px;cursor:pointer;transition:all .15s;background:var(--bg-primary)}.palette-item:hover{border-color:var(--primary);transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,.06)}
        @keyframes fadeSlide{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}.fade-slide{animation:fadeSlide .2s ease}

        /* NEW Customizer split-pane styles */
        .customizer-container {
          display: flex;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background-color: var(--bg-primary);
          color: var(--text-primary);
        }
        .customizer-sidebar {
          width: 380px;
          height: 100%;
          flex-shrink: 0;
          border-right: 1px solid var(--border);
          background-color: var(--bg-secondary);
          display: flex;
          flex-direction: column;
          box-shadow: 2px 0 10px rgba(0,0,0,0.05);
          z-index: 10;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .customizer-sidebar.collapsed {
          width: 0;
          overflow: hidden;
          border-right: none;
        }
        .customizer-header {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: var(--bg-tertiary);
        }
        .customizer-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .customizer-title {
          margin: 0;
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .customizer-back-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          border-radius: 50%;
          transition: background 0.15s;
        }
        .customizer-back-btn:hover {
          background: var(--border);
          color: var(--text-primary);
        }
        .customizer-theme-info {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 8px 12px;
          font-size: 0.78rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .customizer-theme-info-text {
          color: var(--text-muted);
        }
        .customizer-theme-info-name {
          font-weight: 700;
          color: var(--text-primary);
        }
        .customizer-theme-change-btn {
          color: var(--primary);
          cursor: pointer;
          font-weight: 600;
          border: none;
          background: none;
          font-size: 0.75rem;
          text-decoration: underline;
        }
        .customizer-sections-list {
          flex: 1;
          overflow-y: auto;
          padding: 0;
          margin: 0;
        }
        .customizer-section {
          border-bottom: 1px solid var(--border);
        }
        .customizer-section-header {
          width: 100%;
          padding: 14px 20px;
          background: var(--bg-secondary);
          border: none;
          text-align: left;
          font-weight: 600;
          font-size: 0.85rem;
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.15s;
        }
        .customizer-section-header:hover {
          background: var(--bg-tertiary);
          color: var(--primary);
        }
        .customizer-section-header.active {
          background: var(--bg-tertiary);
          color: var(--primary);
          border-left: 3px solid var(--primary);
        }
        .customizer-section-content {
          padding: 20px;
          background: var(--bg-primary);
          border-top: 1px solid var(--border);
        }
        .customizer-footer {
          padding: 10px 16px;
          border-top: 1px solid var(--border);
          background: var(--bg-tertiary);
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 48px;
        }
        .customizer-footer-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
          padding: 6px;
          border-radius: 4px;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .customizer-footer-btn:hover {
          color: var(--text-primary);
          background: var(--border);
        }
        .customizer-device-toggles {
          display: flex;
          gap: 4px;
        }
        .customizer-device-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
          padding: 6px 10px;
          border-radius: 4px;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .customizer-device-btn:hover, .customizer-device-btn.active {
          color: var(--primary);
          background: var(--bg-secondary);
        }
        .preview-pane {
          flex: 1;
          background-color: #1a1a1a;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          height: 100%;
        }
        .preview-pane-header {
          width: 100%;
          height: 44px;
          background: #111;
          border-bottom: 1px solid #333;
          display: flex;
          align-items: center;
          padding: 0 16px;
          color: #888;
          font-size: 0.78rem;
          justify-content: space-between;
        }
        .preview-pane-url-bar {
          flex: 1;
          max-width: 600px;
          background: #252525;
          border-radius: 20px;
          padding: 4px 16px;
          color: #ccc;
          font-family: monospace;
          font-size: 0.75rem;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin: 0 auto;
        }
        .preview-pane-body {
          flex: 1;
          width: 100%;
          height: calc(100% - 44px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          overflow: hidden;
        }
        .iframe-container {
          height: 100%;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: #fff;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
        }
        .device-desktop {
          width: 100%;
          height: 100%;
          border-radius: 0;
          border: none;
        }
        .device-tablet {
          width: 768px;
          height: 95%;
          border-radius: 24px;
          border: 12px solid #000;
        }
        .device-mobile {
          width: 375px;
          height: 90%;
          border-radius: 36px;
          border: 12px solid #000;
        }
        .iframe-loading-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.4);
          backdrop-filter: blur(1.5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          color: #fff;
          font-weight: 500;
          font-size: 0.9rem;
        }
      `}</style>

      {/* Sidebar Panel */}
      <div className={`customizer-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Sidebar Header */}
        <div className="customizer-header">
          <div className="customizer-header-row">
            <button onClick={() => navigate('/admin/overview')} className="customizer-back-btn" title="Exit Customizer">
              <X size={18} />
            </button>
            <h1 className="customizer-title">
              <Sparkles size={16} style={{ color: 'var(--primary)' }} />
              Theme Customizer
            </h1>
            <button onClick={handlePublish} className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '.8rem', display: 'flex', alignItems: 'center', gap: 6 }} disabled={publishing}>
              {publishing ? <span className="cms-spinner" /> : <Save size={13} />}
              {publishing ? 'Publishing...' : 'Publish'}
            </button>
          </div>
          
          <div className="customizer-theme-info">
            <span className="customizer-theme-info-text">
              Active Theme: <strong className="customizer-theme-info-name">{PRESET_THEMES.find(t => t.theme_class === themeCustomizer.theme_class)?.name || 'Quantum Slate'}</strong>
            </span>
            <button onClick={() => { setActiveTab('theme'); setSidebarCollapsed(false); }} className="customizer-theme-change-btn">
              Change
            </button>
          </div>
        </div>

        {/* Sidebar Accordions / Settings List */}
        <div className="customizer-sections-list">
          {tabs.map(tab => (
            <div key={tab.id} className="customizer-section">
              <button className={`customizer-section-header ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(activeTab === tab.id ? null : tab.id)}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {tab.icon}
                  {tab.label}
                </span>
                {activeTab === tab.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              
              {activeTab === tab.id && (
                <div className="customizer-section-content">
                  
                  {/* ════════════ HOMEPAGE BUILDER ════════════ */}
                  {tab.id === 'layout' && (
                    <div className="fade-slide">
                      {/* Toolbar */}
                      <div className="card" style={{ padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <button onClick={() => setPaletteOpen(true)} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '.75rem', display: 'flex', alignItems: 'center', gap: 4 }}><Plus size={12} /> Add Section</button>
                        <button onClick={undo} disabled={!canUndo} className="btn btn-outline" style={{ padding: '6px 8px', opacity: canUndo ? 1 : .35 }} title="Undo"><Undo2 size={13} /></button>
                        <button onClick={redo} disabled={!canRedo} className="btn btn-outline" style={{ padding: '6px 8px', opacity: canRedo ? 1 : .35 }} title="Redo"><Redo2 size={13} /></button>
                        <button onClick={() => { setRevisionsOpen(true); loadRevisions(); }} className="btn btn-outline" style={{ padding: '6px 10px', fontSize: '.72rem', display: 'flex', alignItems: 'center', gap: 4 }}><History size={12} /> Revisions</button>
                        <button onClick={() => setTemplatesOpen(true)} className="btn btn-outline" style={{ padding: '6px 10px', fontSize: '.72rem', display: 'flex', alignItems: 'center', gap: 4 }}><Layers size={12} /> Templates</button>
                      </div>

                      {/* Section List */}
                      <div className="card" style={{ padding: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                          <div>
                            <h4 style={{ margin: 0, fontSize: '.85rem', display: 'flex', alignItems: 'center', gap: 6 }}><LayoutTemplate size={16} style={{ color: 'var(--primary)' }} /> Homepage Sections</h4>
                          </div>
                          <span style={{ fontSize: '.68rem', color: 'var(--text-muted)', padding: '2px 6px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>{layout.length} total</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {layout.map((sect, idx) => (
                            <div key={sect.id + idx} draggable onDragStart={() => onDragStart(idx)} onDragOver={e => onDragOver(e, idx)} onDrop={() => onDrop(idx)} onDragEnd={onDragEnd}
                              className={`section-card ${dragIdx === idx ? 'dragging' : ''} ${overIdx === idx && dragIdx !== null && dragIdx !== idx ? 'drag-over-line' : ''}`}
                              style={{ padding: '8px 10px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: `1px solid ${overIdx === idx && dragIdx !== null && dragIdx !== idx ? 'var(--primary)' : 'var(--border)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: sect.visible ? 1 : .45, cursor: 'grab' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                                <GripVertical size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                                <span style={{ fontSize: '.85rem', flexShrink: 0 }}>{sectionIcon(sect)}</span>
                                <div style={{ minWidth: 0 }}>
                                  <span style={{ fontWeight: 600, fontSize: '.78rem', color: sect.visible ? 'var(--text-primary)' : 'var(--text-muted)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{idx + 1}. {sectionLabel(sect)}</span>
                                  <span style={{ fontSize: '.62rem', color: 'var(--text-muted)' }}>{sect.type === 'builtin' ? 'Built-in' : sect.type === 'custom_html' ? 'Custom HTML' : 'AI Generated'}</span>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                                {sect.type === 'custom_html' && <button onClick={e => { e.stopPropagation(); setEditHtmlIdx(idx); }} className="btn btn-outline" style={{ padding: '3px 5px' }} title="Edit HTML"><Code size={11} /></button>}
                                <button onClick={e => { e.stopPropagation(); setSettingsPanel(idx); }} className="btn btn-outline" style={{ padding: '3px 5px' }} title="Settings"><Settings size={11} /></button>
                                <button onClick={e => { e.stopPropagation(); moveSection(idx, -1); }} disabled={idx === 0} className="btn btn-outline" style={{ padding: '3px 5px', opacity: idx === 0 ? .3 : 1 }} title="Up"><ArrowUp size={11} /></button>
                                <button onClick={e => { e.stopPropagation(); moveSection(idx, 1); }} disabled={idx === layout.length - 1} className="btn btn-outline" style={{ padding: '3px 5px', opacity: idx === layout.length - 1 ? .3 : 1 }} title="Down"><ArrowDown size={11} /></button>
                                <button onClick={e => { e.stopPropagation(); duplicateSection(idx); }} className="btn btn-outline" style={{ padding: '3px 5px' }} title="Duplicate"><Copy size={11} /></button>
                                <button onClick={e => { e.stopPropagation(); toggleVis(idx); }} className="btn btn-outline" style={{ padding: '3px 5px' }} title="Toggle Visibility">{sect.visible ? <Eye size={11} /> : <EyeOff size={11} />}</button>
                                {sect.type !== 'builtin' && <button onClick={e => { e.stopPropagation(); if (confirm(`Delete "${sectionLabel(sect)}"?`)) deleteSection(idx); }} className="btn btn-outline" style={{ padding: '3px 5px', color: '#ef4444' }} title="Delete"><Trash2 size={11} /></button>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* AI Section Generator */}
                      <div className="card" style={{ padding: 14, marginTop: 12 }}>
                        <h4 style={{ margin: '0 0 8px', fontSize: '.82rem', display: 'flex', alignItems: 'center', gap: 6 }}><Wand2 size={14} style={{ color: 'var(--primary)' }} /> AI Section Generator</h4>
                        <p style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginBottom: 8 }}>Describe the section you want and AI will generate styled HTML for you.</p>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <input type="text" className="form-control" placeholder='e.g. "Pricing table"' value={aiPromptText} onChange={e => setAiPromptText(e.target.value)} onKeyDown={e => e.key === 'Enter' && aiPromptText && handleAiGenerate()} style={{ flex: 1, fontSize: '.75rem', padding: '6px 10px' }} />
                          <button onClick={() => aiPromptText && handleAiGenerate()} className="btn btn-primary" disabled={aiGenerating || !aiPromptText} style={{ padding: '6px 12px', fontSize: '.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                            {aiGenerating ? <span className="cms-spinner" /> : <><Wand2 size={11} /> Generate</>}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ════════════ BRANDING ════════════ */}
                  {tab.id === 'branding' && (
                    <div className="fade-slide" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div className="form-group" style={{ marginBottom: 12 }}><label className="form-label" style={{ fontSize: '.8rem' }}>Logo Type</label><select className="form-control" style={{ fontSize: '.8rem', padding: '8px 10px' }} value={brandAssets.logo_type || 'text'} onChange={e => setBrandAssets(p => ({ ...p, logo_type: e.target.value }))}><option value="text">Text Logo</option><option value="image">Image Logo</option><option value="both">Text + Image Logo</option></select></div>
                      {['text', 'both'].includes(brandAssets.logo_type || 'text') && (
                        <>
                          <div className="form-group" style={{ marginBottom: 12 }}><label className="form-label" style={{ fontSize: '.8rem' }}>Brand Title Text</label><input type="text" className="form-control" style={{ fontSize: '.8rem', padding: '8px 10px' }} value={brandAssets.logo_text || ''} onChange={e => setBrandAssets(p => ({ ...p, logo_text: e.target.value }))} /></div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                              <label style={{ fontSize: '.72rem' }}>Text (Light Mode)</label>
                              <div style={{ display: 'flex', gap: 4 }}>
                                <input type="color" value={brandAssets.logo_color_light || '#000000'} onChange={e => setBrandAssets(p => ({ ...p, logo_color_light: e.target.value }))} style={{ width: 28, height: 28, padding: 1, cursor: 'pointer', borderRadius: 4, border: '1px solid var(--border)' }} />
                                <input type="text" className="form-control" style={{ fontSize: '.7rem', padding: '4px 6px' }} value={brandAssets.logo_color_light || ''} onChange={e => setBrandAssets(p => ({ ...p, logo_color_light: e.target.value }))} placeholder="Inherit" />
                              </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                              <label style={{ fontSize: '.72rem' }}>Text (Dark Mode)</label>
                              <div style={{ display: 'flex', gap: 4 }}>
                                <input type="color" value={brandAssets.logo_color_dark || '#ffffff'} onChange={e => setBrandAssets(p => ({ ...p, logo_color_dark: e.target.value }))} style={{ width: 28, height: 28, padding: 1, cursor: 'pointer', borderRadius: 4, border: '1px solid var(--border)' }} />
                                <input type="text" className="form-control" style={{ fontSize: '.7rem', padding: '4px 6px' }} value={brandAssets.logo_color_dark || ''} onChange={e => setBrandAssets(p => ({ ...p, logo_color_dark: e.target.value }))} placeholder="Inherit" />
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                      {['image', 'both'].includes(brandAssets.logo_type) && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <ImageUploader label="Logo — Light Mode" value={brandAssets.logo_url_light || ''} onChange={v => setBrandAssets(p => ({ ...p, logo_url_light: v }))} onOpenLibrary={() => setMediaModal({ open: true, onSelect: v => setBrandAssets(p => ({ ...p, logo_url_light: v })) })} />
                          <ImageUploader label="Logo — Dark Mode" value={brandAssets.logo_url_dark || ''} onChange={v => setBrandAssets(p => ({ ...p, logo_url_dark: v }))} onOpenLibrary={() => setMediaModal({ open: true, onSelect: v => setBrandAssets(p => ({ ...p, logo_url_dark: v })) })} />
                          <ImageUploader label="Sticky / Scroll Logo" value={brandAssets.sticky_logo_url || ''} onChange={v => setBrandAssets(p => ({ ...p, sticky_logo_url: v }))} />
                          <div>
                            <label className="form-label" style={{ marginBottom: 4, fontSize: '.8rem' }}>Logo Dimensions</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                              <div className="form-group" style={{ marginBottom: 0 }}><label style={{ fontSize: '.72rem' }}>Width (px)</label><input type="number" className="form-control" style={{ fontSize: '.8rem', padding: '6px 8px' }} value={brandAssets.logo_width || 180} onChange={e => setBrandAssets(p => ({ ...p, logo_width: e.target.value }))} /></div>
                              <div className="form-group" style={{ marginBottom: 0 }}><label style={{ fontSize: '.72rem' }}>Height (px)</label><input type="number" className="form-control" style={{ fontSize: '.8rem', padding: '6px 8px' }} value={brandAssets.logo_height || 45} onChange={e => setBrandAssets(p => ({ ...p, logo_height: e.target.value }))} /></div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="form-group" style={{ marginBottom: 12 }}><label className="form-label" style={{ fontSize: '.8rem' }}>Tagline</label><input type="text" className="form-control" style={{ fontSize: '.8rem', padding: '8px 10px' }} value={brandAssets.tagline || ''} onChange={e => setBrandAssets(p => ({ ...p, tagline: e.target.value }))} /></div>
                      <ImageUploader label="Favicon" value={brandAssets.favicon_url || ''} onChange={v => setBrandAssets(p => ({ ...p, favicon_url: v }))} hint="32×32 or 64×64 px" onOpenLibrary={() => setMediaModal({ open: true, onSelect: v => setBrandAssets(p => ({ ...p, favicon_url: v })) })} />
                    </div>
                  )}

                  {/* ════════════ HEADER ════════════ */}
                  {tab.id === 'header' && (
                    <div className="fade-slide" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div className="form-group" style={{ marginBottom: 12 }}><label className="form-label" style={{ fontSize: '.8rem' }}>Layout</label><select className="form-control" style={{ fontSize: '.8rem', padding: '8px 10px' }} value={headerBuilder.layout_type || 'classic'} onChange={e => setHeaderBuilder(p => ({ ...p, layout_type: e.target.value }))}><option value="classic">Classic</option><option value="centered">Centered</option></select></div>
                      <div className="form-group" style={{ marginBottom: 12 }}><label className="form-label" style={{ fontSize: '.8rem' }}>CTA Button Text</label><input type="text" className="form-control" style={{ fontSize: '.8rem', padding: '8px 10px' }} value={headerBuilder.cta_text || ''} onChange={e => setHeaderBuilder(p => ({ ...p, cta_text: e.target.value }))} /></div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '.8rem' }}><input type="checkbox" checked={headerBuilder.is_sticky || false} onChange={e => setHeaderBuilder(p => ({ ...p, is_sticky: e.target.checked }))} /> Sticky Header</label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '.8rem' }}><input type="checkbox" checked={headerBuilder.is_transparent || false} onChange={e => setHeaderBuilder(p => ({ ...p, is_transparent: e.target.checked }))} /> Transparent (Until Scroll)</label>
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label" style={{ fontSize: '.8rem' }}>CTA Link</label><input type="text" className="form-control" style={{ fontSize: '.8rem', padding: '8px 10px' }} value={headerBuilder.cta_link || ''} onChange={e => setHeaderBuilder(p => ({ ...p, cta_link: e.target.value }))} /></div>
                    </div>
                  )}

                  {/* ════════════ FOOTER ════════════ */}
                  {tab.id === 'footer' && (
                    <div className="fade-slide" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <h5 style={{ fontSize: '.8rem', fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}><ImageIcon size={12} style={{ color: 'var(--primary)' }} /> Separate Footer Logo</h5>
                      <ImageUploader label="Footer Logo" value={footerLogo.footer_logo_url || ''} onChange={v => setFooterLogo(p => ({ ...p, footer_logo_url: v }))} onOpenLibrary={() => setMediaModal({ open: true, onSelect: v => setFooterLogo(p => ({ ...p, footer_logo_url: v })) })} />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                        <div className="form-group" style={{ marginBottom: 0 }}><label style={{ fontSize: '.72rem' }}>Width</label><input type="number" className="form-control" style={{ fontSize: '.8rem', padding: '6px 8px' }} value={footerLogo.footer_logo_width || 140} onChange={e => setFooterLogo(p => ({ ...p, footer_logo_width: parseInt(e.target.value) || 140 }))} /></div>
                        <div className="form-group" style={{ marginBottom: 0 }}><label style={{ fontSize: '.72rem' }}>Height</label><input type="number" className="form-control" style={{ fontSize: '.8rem', padding: '6px 8px' }} value={footerLogo.footer_logo_height || 40} onChange={e => setFooterLogo(p => ({ ...p, footer_logo_height: parseInt(e.target.value) || 40 }))} /></div>
                      </div>
                      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '8px 0' }} />
                      <div className="form-group" style={{ marginBottom: 12 }}><label className="form-label" style={{ fontSize: '.8rem' }}>Copyright Text</label><input type="text" className="form-control" style={{ fontSize: '.8rem', padding: '8px 10px' }} value={footerBuilder?.copyright_text || ''} onChange={e => setFooterBuilder(p => ({ ...p, copyright_text: e.target.value }))} /></div>
                      <div className="form-group" style={{ marginBottom: 12 }}><label className="form-label" style={{ fontSize: '.8rem' }}>Columns</label><select className="form-control" style={{ fontSize: '.8rem', padding: '8px 10px' }} value={footerBuilder?.columns_count || 4} onChange={e => setFooterBuilder(p => ({ ...p, columns_count: parseInt(e.target.value) }))}><option value={2}>2</option><option value={3}>3</option><option value={4}>4</option></select></div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', marginBottom: 8, fontSize: '.8rem' }}><input type="checkbox" checked={footerBuilder?.newsletter_enabled || false} onChange={e => setFooterBuilder(p => ({ ...p, newsletter_enabled: e.target.checked }))} /> Enable Newsletter</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, opacity: footerBuilder?.newsletter_enabled ? 1 : .4 }}>
                        <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label" style={{ fontSize: '.8rem' }}>Newsletter Title</label><input type="text" className="form-control" style={{ fontSize: '.8rem', padding: '8px 10px' }} value={footerBuilder?.newsletter_title || ''} onChange={e => setFooterBuilder(p => ({ ...p, newsletter_title: e.target.value }))} disabled={!footerBuilder?.newsletter_enabled} /></div>
                        <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label" style={{ fontSize: '.8rem' }}>Placeholder</label><input type="text" className="form-control" style={{ fontSize: '.8rem', padding: '8px 10px' }} value={footerBuilder?.newsletter_placeholder || ''} onChange={e => setFooterBuilder(p => ({ ...p, newsletter_placeholder: e.target.value }))} disabled={!footerBuilder?.newsletter_enabled} /></div>
                      </div>
                    </div>
                  )}

                  {/* ════════════ SOCIAL ════════════ */}
                  {tab.id === 'social' && (
                    <div className="fade-slide" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {socialManagement?.networks?.map((net, idx) => (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 6, backgroundColor: 'var(--bg-secondary)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontWeight: 600, fontSize: '.8rem' }}><input type="checkbox" checked={net.enabled} onChange={e => handleSocialNetworkChange(net.name, 'enabled', e.target.checked)} />{net.name}</label>
                          <input type="text" className="form-control" placeholder={`https://${net.name.toLowerCase()}.com/…`} value={net.url} onChange={e => handleSocialNetworkChange(net.name, 'url', e.target.value)} disabled={!net.enabled} style={{ fontSize: '.75rem', padding: '6px 10px' }} />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ════════════ WHATSAPP ════════════ */}
                  {tab.id === 'whatsapp' && (
                    <div className="fade-slide" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontWeight: 700, fontSize: '.8rem', marginBottom: 6 }}><input type="checkbox" checked={whatsappHub?.widget_enabled || false} onChange={e => setWhatsappHub(p => ({ ...p, widget_enabled: e.target.checked }))} /> Enable Widget</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, opacity: whatsappHub?.widget_enabled ? 1 : .4 }}>
                        <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label" style={{ fontSize: '.8rem' }}>Widget Title</label><input type="text" className="form-control" style={{ fontSize: '.8rem', padding: '8px 10px' }} value={whatsappHub?.widget_title || ''} onChange={e => setWhatsappHub(p => ({ ...p, widget_title: e.target.value }))} disabled={!whatsappHub?.widget_enabled} /></div>
                        <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label" style={{ fontSize: '.8rem' }}>Subtitle</label><input type="text" className="form-control" style={{ fontSize: '.8rem', padding: '8px 10px' }} value={whatsappHub?.widget_subtitle || ''} onChange={e => setWhatsappHub(p => ({ ...p, widget_subtitle: e.target.value }))} disabled={!whatsappHub?.widget_enabled} /></div>
                        <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label" style={{ fontSize: '.8rem' }}>Phone Number</label><input type="text" className="form-control" style={{ fontSize: '.8rem', padding: '8px 10px' }} value={whatsappHub?.number || ''} onChange={e => setWhatsappHub(p => ({ ...p, number: e.target.value }))} disabled={!whatsappHub?.widget_enabled} placeholder="14155552671" /></div>
                      </div>
                    </div>
                  )}

                  {/* ════════════ THEME ════════════ */}
                  {tab.id === 'theme' && (
                    <div className="fade-slide" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <p style={{ fontSize: '.75rem', color: 'var(--text-muted)', margin: 0 }}>Select a preset theme or customize manual colors.</p>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 220, overflowY: 'auto', paddingRight: 4 }}>
                        {PRESET_THEMES.map((theme, i) => (
                          <div key={i} style={{ border: themeCustomizer.theme_class === theme.theme_class ? '2px solid var(--primary)' : '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', backgroundColor: 'var(--bg-secondary)', transition: 'all .2s', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ height: 16, background: `linear-gradient(90deg, ${theme.color_primary}, ${theme.color_secondary})` }} />
                            <div style={{ padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                              <div style={{ minWidth: 0 }}>
                                <h5 style={{ fontSize: '.78rem', fontWeight: 700, margin: 0 }}>{theme.name}</h5>
                              </div>
                              <button onClick={() => installTheme(theme)} className="btn btn-outline" style={{ padding: '3px 8px', fontSize: '.68rem' }}>Apply</button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <h5 style={{ fontSize: '.8rem', fontWeight: 700, margin: '8px 0 2px' }}>Manual Colors</h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {[['Primary', 'color_primary'], ['Secondary', 'color_secondary'], ['Accent', 'color_accent']].map(([lbl, key]) => (
                          <div className="form-group" key={key} style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontSize: '.75rem' }}>{lbl}</label>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <input type="color" value={themeCustomizer[key] || '#000'} onChange={e => setThemeCustomizer({ ...themeCustomizer, [key]: e.target.value })} style={{ width: 28, height: 28, padding: 1, cursor: 'pointer', borderRadius: 4 }} />
                              <input type="text" value={themeCustomizer[key] || ''} onChange={e => setThemeCustomizer({ ...themeCustomizer, [key]: e.target.value })} className="form-control" style={{ fontSize: '.8rem', padding: '4px 6px' }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ════════════ DEVELOPER IDE ════════════ */}
                  {tab.id === 'code' && (
                    <div className="fade-slide" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
                        <button onClick={applyCode} style={{ flex: 1, padding: '6px 12px', fontSize: '.75rem', background: '#238636', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontWeight: 600 }}><Play size={11} /> Apply</button>
                        <button onClick={resetCode} style={{ flex: 1, padding: '6px 12px', fontSize: '.75rem', background: '#21262d', color: '#c9d1d9', border: '1px solid #30363d', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}><RotateCcw size={11} /> Reset</button>
                      </div>
                      <div style={{ border: '1px solid #30363d', borderRadius: 8, overflow: 'hidden', background: '#0d1117' }}>
                        <div style={{ background: '#161b22', display: 'flex', gap: 2, padding: '0 4px', borderBottom: '1px solid #30363d' }}>
                          {[{ id: 'css', label: 'CSS', c: '#8b5cf6' }, { id: 'js', label: 'JS', c: '#eab308' }, { id: 'html', label: 'Head HTML', c: '#06b6d4' }].map(t => (
                            <button key={t.id} onClick={() => setCodeTab(t.id)} className={`cms-code-tab ${codeTab === t.id ? 'active' : ''}`} style={{ marginTop: 4, padding: '5px 8px', fontSize: '.7rem' }}>
                              <span style={{ width: 5, height: 5, borderRadius: '50%', background: t.c, display: 'inline-block', marginRight: 4, verticalAlign: 'middle' }} />{t.label}
                            </button>
                          ))}
                        </div>
                        {codeTab === 'css' && <CodePanel value={customCode.custom_css} onChange={v => setCustomCode(p => ({ ...p, custom_css: v }))} language="css" minHeight={150} />}
                        {codeTab === 'js' && <CodePanel value={customCode.custom_js} onChange={v => setCustomCode(p => ({ ...p, custom_js: v }))} language="js" minHeight={150} />}
                        {codeTab === 'html' && <CodePanel value={customCode.custom_head_html} onChange={v => setCustomCode(p => ({ ...p, custom_head_html: v }))} language="html" minHeight={150} />}
                      </div>
                      <div style={{ border: '1px solid #30363d', borderRadius: 8, overflow: 'hidden' }}>
                        <div style={{ background: '#010409', padding: '4px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #21262d' }}>
                          <span style={{ fontSize: '.68rem', color: '#8b949e', fontWeight: 700, fontFamily: 'monospace' }}>CONSOLE</span>
                          {consoleLog.length > 0 && <button onClick={() => setConsoleLog([])} style={{ background: 'none', border: 'none', color: '#8b949e', fontSize: '.65rem', cursor: 'pointer', textDecoration: 'underline' }}>Clear</button>}
                        </div>
                        <div style={{ background: '#0d1117', minHeight: 50, maxHeight: 100, overflowY: 'auto' }}>
                          {consoleLog.length === 0 ? <p style={{ color: '#484f58', fontSize: '.68rem', fontFamily: 'monospace', textAlign: 'center', padding: '12px 10px', margin: 0 }}>Test your styles/scripts.</p>
                          : consoleLog.map((e, i) => <div key={i} style={{ padding: '3px 10px', fontSize: '.68rem', fontFamily: 'monospace', borderBottom: '1px solid #21262d', color: e.type === 'error' ? '#f85149' : e.type === 'success' ? '#3fb950' : '#79c0ff', display: 'flex', gap: 6 }}><span style={{ color: '#484f58' }}>[{e.time}]</span><span>{e.msg}</span></div>)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ════════════ SEO ════════════ */}
                  {tab.id === 'seo' && (
                    <div className="fade-slide" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div className="form-group" style={{ marginBottom: 12 }}><label className="form-label" style={{ fontSize: '.8rem' }}>Meta Title</label><input type="text" className="form-control" style={{ fontSize: '.8rem', padding: '8px 10px' }} value={seoVisibility?.meta_title || ''} onChange={e => setSeoVisibility(p => ({ ...p, meta_title: e.target.value }))} /><small style={{ color: 'var(--text-muted)', fontSize: '.68rem' }}>Under 60 characters.</small></div>
                      <div className="form-group" style={{ marginBottom: 12 }}><label className="form-label" style={{ fontSize: '.8rem' }}>Meta Description</label><textarea className="form-control" style={{ fontSize: '.8rem', padding: '8px 10px' }} rows={3} value={seoVisibility?.meta_description || ''} onChange={e => setSeoVisibility(p => ({ ...p, meta_description: e.target.value }))} /><small style={{ color: 'var(--text-muted)', fontSize: '.68rem' }}>150–160 characters.</small></div>
                      <ImageUploader label="OG Share Image" value={seoVisibility?.og_image || ''} onChange={v => setSeoVisibility(p => ({ ...p, og_image: v }))} hint="1200 × 630 px" onOpenLibrary={() => setMediaModal({ open: true, onSelect: v => setSeoVisibility(p => ({ ...p, og_image: v })) })} />
                      <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label" style={{ fontSize: '.8rem' }}>Robots.txt</label><textarea className="form-control" style={{ fontSize: '.8rem', padding: '8px 10px', fontFamily: 'monospace' }} rows={3} value={seoVisibility?.robots_txt || ''} onChange={e => setSeoVisibility(p => ({ ...p, robots_txt: e.target.value }))} /></div>
                    </div>
                  )}

                  {/* ════════════ TESTIMONIALS MANAGER ════════════ */}
                  {tab.id === 'testimonials' && (
                    <div className="fade-slide" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {editingTestimonial === null ? (
                        <>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, borderBottom: '1px solid var(--border)', paddingBottom: 14 }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                              <label className="form-label" style={{ fontSize: '.8rem' }}>Section Title</label>
                              <input 
                                type="text" 
                                className="form-control" 
                                style={{ fontSize: '.8rem', padding: '8px 10px' }} 
                                value={cmsForm.home_testimonials_title || ''} 
                                onChange={e => setCmsForm(prev => ({ ...prev, home_testimonials_title: e.target.value }))}
                                placeholder="Client Testimonials" 
                              />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                              <label className="form-label" style={{ fontSize: '.8rem' }}>Section Subtitle</label>
                              <textarea 
                                className="form-control" 
                                style={{ fontSize: '.8rem', padding: '8px 10px' }} 
                                rows={3}
                                value={cmsForm.home_testimonials_subtitle || ''} 
                                onChange={e => setCmsForm(prev => ({ ...prev, home_testimonials_subtitle: e.target.value }))}
                                placeholder="Read what VP level engineering managers and CTOs say..." 
                              />
                            </div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4 style={{ margin: 0, fontSize: '.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Testimonial Cards</h4>
                            <button 
                              type="button"
                              onClick={() => {
                                setEditingTestimonial('new');
                                setTestimonialForm({ id: '', client_name: '', client_role: '', company_name: '', text: '', rating: 5, image_url: '' });
                              }} 
                              className="btn btn-primary" 
                              style={{ padding: '6px 12px', fontSize: '.75rem', display: 'flex', alignItems: 'center', gap: 4 }}
                            >
                              <Plus size={12} /> Add New
                            </button>
                          </div>

                          {testimonialsLoading ? (
                            <div style={{ textAlign: 'center', padding: 20 }}><span className="cms-spinner" /></div>
                          ) : testimonials.length === 0 ? (
                            <p style={{ fontSize: '.78rem', color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>No testimonials found. Click "Add New" to create one.</p>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              {testimonials.map(t => (
                                <div 
                                  key={t.id} 
                                  style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between', 
                                    padding: '10px 12px', 
                                    backgroundColor: 'var(--bg-secondary)', 
                                    borderRadius: 'var(--radius-sm)', 
                                    border: '1px solid var(--border)' 
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                                    <img 
                                      src={t.image_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80'} 
                                      alt="" 
                                      style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', background: 'var(--border)' }} 
                                    />
                                    <div style={{ minWidth: 0 }}>
                                      <strong style={{ fontSize: '.78rem', color: 'var(--text-primary)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {t.client_name}
                                      </strong>
                                      <span style={{ fontSize: '.68rem', color: 'var(--text-muted)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {t.client_role} at {t.company_name}
                                      </span>
                                    </div>
                                  </div>
                                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                                    <button 
                                      type="button"
                                      onClick={() => {
                                        setEditingTestimonial(t);
                                        setTestimonialForm({
                                          id: t.id,
                                          client_name: t.client_name,
                                          client_role: t.client_role,
                                          company_name: t.company_name,
                                          text: t.text,
                                          rating: parseInt(t.rating) || 5,
                                          image_url: t.image_url || ''
                                        });
                                      }} 
                                      className="btn btn-outline" 
                                      style={{ padding: '4px 6px' }}
                                    >
                                      <Settings size={12} />
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={() => handleDeleteTestimonial(t.id)} 
                                      className="btn btn-outline" 
                                      style={{ padding: '4px 6px', color: '#ef4444' }}
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <form onSubmit={handleSaveTestimonial} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <h4 style={{ margin: 0, fontSize: '.85rem', fontWeight: 700 }}>
                              {editingTestimonial === 'new' ? 'Create Testimonial' : 'Edit Testimonial'}
                            </h4>
                            <button 
                              type="button" 
                              onClick={() => setEditingTestimonial(null)} 
                              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '.75rem', textDecoration: 'underline' }}
                            >
                              Back to list
                            </button>
                          </div>

                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontSize: '.78rem' }}>Client Name *</label>
                            <input 
                              type="text" 
                              className="form-control" 
                              style={{ fontSize: '.8rem', padding: '8px 10px' }} 
                              value={testimonialForm.client_name} 
                              onChange={e => setTestimonialForm(p => ({ ...p, client_name: e.target.value }))}
                              placeholder="e.g., Jane Doe"
                              required 
                            />
                          </div>

                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontSize: '.78rem' }}>Client Role *</label>
                            <input 
                              type="text" 
                              className="form-control" 
                              style={{ fontSize: '.8rem', padding: '8px 10px' }} 
                              value={testimonialForm.client_role} 
                              onChange={e => setTestimonialForm(p => ({ ...p, client_role: e.target.value }))}
                              placeholder="e.g., Engineering Manager"
                              required 
                            />
                          </div>

                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontSize: '.78rem' }}>Company *</label>
                            <input 
                              type="text" 
                              className="form-control" 
                              style={{ fontSize: '.8rem', padding: '8px 10px' }} 
                              value={testimonialForm.company_name} 
                              onChange={e => setTestimonialForm(p => ({ ...p, company_name: e.target.value }))}
                              placeholder="e.g., Tech Corp"
                              required 
                            />
                          </div>

                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontSize: '.78rem' }}>Star Rating *</label>
                            <select 
                              className="form-control" 
                              style={{ fontSize: '.8rem', padding: '8px 10px' }} 
                              value={testimonialForm.rating} 
                              onChange={e => setTestimonialForm(p => ({ ...p, rating: parseInt(e.target.value) || 5 }))}
                            >
                              <option value={5}>5 Stars</option>
                              <option value={4}>4 Stars</option>
                              <option value={3}>3 Stars</option>
                              <option value={2}>2 Stars</option>
                              <option value={1}>1 Star</option>
                            </select>
                          </div>

                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontSize: '.78rem' }}>Review Text *</label>
                            <textarea 
                              className="form-control" 
                              style={{ fontSize: '.8rem', padding: '8px 10px' }} 
                              rows={4}
                              value={testimonialForm.text} 
                              onChange={e => setTestimonialForm(p => ({ ...p, text: e.target.value }))}
                              placeholder="Describe their experience..."
                              required 
                            />
                          </div>

                          <ImageUploader 
                            label="Passport Picture" 
                            value={testimonialForm.image_url} 
                            onChange={url => setTestimonialForm(p => ({ ...p, image_url: url }))} 
                            onOpenLibrary={() => setMediaModal({ open: true, onSelect: url => setTestimonialForm(p => ({ ...p, image_url: url })) })} 
                            hint="Square aspect ratio, e.g., 120×120 px"
                          />

                          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                            <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '8px 16px', fontSize: '.8rem' }}>
                              Save Card
                            </button>
                            <button type="button" onClick={() => setEditingTestimonial(null)} className="btn btn-outline" style={{ flex: 1, padding: '8px 16px', fontSize: '.8rem' }}>
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}

                </div>
              )}
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="customizer-footer">
          <button onClick={() => setSidebarCollapsed(true)} className="customizer-footer-btn" title="Collapse Sidebar">
            <ChevronLeft size={16} />
          </button>
          
          <div className="customizer-device-toggles">
            {[{ d: 'desktop', icon: <Monitor size={14} /> },
              { d: 'tablet', icon: <Tablet size={14} /> },
              { d: 'mobile', icon: <Smartphone size={14} /> }
            ].map(dd => (
              <button key={dd.d} onClick={() => setPreviewDevice(dd.d)} className={`customizer-device-btn ${previewDevice === dd.d ? 'active' : ''}`} title={`${dd.d} Preview`}>
                {dd.icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Expand Sidebar Button when Collapsed */}
      {sidebarCollapsed && (
        <button onClick={() => setSidebarCollapsed(false)} style={{ position: 'fixed', bottom: 12, left: 12, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} title="Expand Sidebar">
          <ChevronRight size={18} />
        </button>
      )}

      {/* Live Preview Pane (Right side) */}
      <div className="preview-pane">
        <div className="preview-pane-header">
          <div style={{ width: 60 }} />
          <div className="preview-pane-url-bar">
            {window.location.origin + window.location.pathname}
          </div>
          <div style={{ width: 60, display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={refreshIframe} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Refresh Preview">
              <RotateCcw size={13} />
            </button>
          </div>
        </div>
        
        <div className="preview-pane-body">
          <div className={`iframe-container device-${previewDevice}`}>
            {iframeLoading && (
              <div className="iframe-loading-overlay">
                <span className="cms-spinner" style={{ marginRight: 8 }} />
                Loading Preview...
              </div>
            )}
            <iframe
              ref={iframeRef}
              src={`${window.location.origin}${window.location.pathname}`}
              onLoad={() => {
                setIframeLoading(false);
                setIframeLoaded(prev => !prev);
              }}
              style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }}
              title="WordPress Live Preview Frame"
            />
          </div>
        </div>
      </div>

      {/* MODALS */}
      {paletteOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 9998, display: 'flex', justifyContent: 'flex-end', backdropFilter: 'blur(3px)' }} onClick={() => setPaletteOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: 420, maxWidth: '95vw', background: 'var(--bg-primary)', height: '100vh', overflowY: 'auto', borderLeft: '1px solid var(--border)', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}><Plus size={18} style={{ color: 'var(--primary)' }} /> Add Section</h3>
              <button onClick={() => setPaletteOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>
            {COMPONENT_PALETTE.map((cat, ci) => (
              <div key={ci} style={{ marginBottom: 24 }}>
                <h5 style={{ fontSize: '.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '.5px', marginBottom: 10, fontWeight: 700 }}>{cat.category}</h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {cat.items.map((item, ii) => (
                    <div key={ii} className="palette-item" onClick={() => {
                      if (item.type === 'ai') {
                        const prompt = item.id.replace('ai_', '');
                        handleAiGenerate(prompt);
                        setPaletteOpen(false);
                      } else {
                        addSection({ type: item.type, id: item.id, name: item.name, html_content: item.type === 'custom_html' ? '<div style="padding:40px;text-align:center;">\n  <h2>New Section</h2>\n  <p>Edit this content in the section editor.</p>\n</div>' : '' });
                        setPaletteOpen(false);
                      }
                    }}>
                      <span style={{ fontSize: '1.3rem', display: 'block', marginBottom: 6 }}>{item.icon}</span>
                      <p style={{ fontWeight: 700, fontSize: '.82rem', margin: '0 0 2px', color: 'var(--text-primary)' }}>{item.name}</p>
                      <p style={{ fontSize: '.68rem', color: 'var(--text-muted)', margin: 0 }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {settingsPanel !== null && layout[settingsPanel] && (
        <SectionSettingsPanel section={layout[settingsPanel]} idx={settingsPanel} onUpdate={updateSectionSettings} onClose={() => setSettingsPanel(null)} />
      )}

      <MediaLibraryModal open={mediaModal.open} onClose={() => setMediaModal({ open: false, onSelect: null })} onSelect={mediaModal.onSelect || (() => {})} mediaLibrary={mediaLibrary} mediaLoading={mediaLoading} loadMedia={loadMedia} deleteMedia={deleteMedia} />

      {editHtmlIdx !== null && layout[editHtmlIdx] && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }} onClick={() => setEditHtmlIdx(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#0d1117', borderRadius: 12, width: '90vw', maxWidth: 1000, maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #30363d' }}>
            <div style={{ padding: '12px 20px', borderBottom: '1px solid #30363d', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#010409' }}>
              <h3 style={{ margin: 0, color: '#e6edf3', fontSize: '.95rem', display: 'flex', alignItems: 'center', gap: 8 }}><Code size={16} /> Edit: {sectionLabel(layout[editHtmlIdx])}</h3>
              <button onClick={() => setEditHtmlIdx(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b949e' }}><X size={18} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <div style={{ borderBottom: '1px solid #30363d' }}><div style={{ padding: '4px 16px', fontSize: '.72rem', color: '#8b949e', fontWeight: 700, fontFamily: 'monospace', background: '#161b22' }}>HTML</div><CodePanel value={layout[editHtmlIdx].html_content || ''} onChange={v => updateSectionContent(editHtmlIdx, 'html_content', v)} language="html" minHeight={180} /></div>
              <div style={{ borderBottom: '1px solid #30363d' }}><div style={{ padding: '4px 16px', fontSize: '.72rem', color: '#8b949e', fontWeight: 700, fontFamily: 'monospace', background: '#161b22' }}>CSS</div><CodePanel value={layout[editHtmlIdx].css_content || ''} onChange={v => updateSectionContent(editHtmlIdx, 'css_content', v)} language="css" minHeight={140} /></div>
              <div><div style={{ padding: '4px 16px', fontSize: '.72rem', color: '#8b949e', fontWeight: 700, fontFamily: 'monospace', background: '#161b22' }}>JAVASCRIPT</div><CodePanel value={layout[editHtmlIdx].js_content || ''} onChange={v => updateSectionContent(editHtmlIdx, 'js_content', v)} language="js" minHeight={100} /></div>
            </div>
            <div style={{ padding: '10px 20px', borderTop: '1px solid #30363d', background: '#010409', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setEditHtmlIdx(null)} style={{ padding: '8px 20px', background: '#238636', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '.85rem' }}>Done</button>
            </div>
          </div>
        </div>
      )}

      {revisionsOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)' }} onClick={() => setRevisionsOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-primary)', borderRadius: 14, width: 520, maxWidth: '90vw', maxHeight: '70vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}><History size={18} style={{ color: 'var(--primary)' }} /> Revision History</h3>
              <button onClick={() => setRevisionsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
              {revisionsLoading ? <div style={{ textAlign: 'center', padding: 30 }}><span className="cms-spinner" /></div> :
                revisions.length === 0 ? <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 30 }}>No revisions yet. They are created each time you publish.</p> :
                revisions.map(rev => (
                  <div key={rev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
                    <div><p style={{ margin: 0, fontWeight: 600, fontSize: '.85rem' }}>{rev.description}</p><p style={{ margin: 0, fontSize: '.72rem', color: 'var(--text-muted)' }}>{new Date(rev.created_at).toLocaleString()}</p></div>
                    <button onClick={() => { restoreRevision(rev.id); setRevisionsOpen(false); }} className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '.78rem' }}>Restore</button>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}

      {templatesOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)' }} onClick={() => setTemplatesOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-primary)', borderRadius: 14, width: 520, maxWidth: '90vw', maxHeight: '70vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}><Layers size={18} style={{ color: 'var(--primary)' }} /> Layout Templates</h3>
              <button onClick={() => setTemplatesOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>
            <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8 }}>
              <input type="text" className="form-control" placeholder="Template name…" value={templateName} onChange={e => setTemplateName(e.target.value)} style={{ flex: 1 }} />
              <button onClick={() => { if (templateName.trim()) { saveTemplate(templateName.trim()); setTemplateName(''); } }} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '.82rem' }} disabled={!templateName.trim()}>Save Current</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
              {templates.length === 0 ? <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 30 }}>No templates saved yet.</p> :
                templates.map(tmpl => (
                  <div key={tmpl.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
                    <div><p style={{ margin: 0, fontWeight: 600, fontSize: '.85rem' }}>{tmpl.name}</p><p style={{ margin: 0, fontSize: '.72rem', color: 'var(--text-muted)' }}>{tmpl.layout?.length || 0} sections · {new Date(tmpl.created_at).toLocaleDateString()}</p></div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => { loadTemplate(tmpl); setTemplatesOpen(false); }} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '.78rem' }}>Load</button>
                      <button onClick={() => deleteTemplate(tmpl.id)} className="btn btn-outline" style={{ padding: '6px 8px', color: '#ef4444' }}><Trash2 size={13} /></button>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
