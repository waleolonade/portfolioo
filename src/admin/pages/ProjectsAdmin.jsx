import { useContext, useState, useRef, useEffect } from 'react';
import { AdminContext } from '../AdminContext';
import { API_BASE_URL } from '../../config';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Globe, 
  Calendar, 
  User, 
  Layers, 
  TrendingUp, 
  Image as ImageIcon, 
  Link2, 
  X,
  FileText,
  Upload,
  Search,
  FolderOpen,
  Sparkles,
  Wand2
} from 'lucide-react';

const GithubIcon = ({ size = 16, className = "", style = {} }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    style={style}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const CATEGORIES = [
  'Website Development',
  'Mobile App Development',
  'UI/UX Design',
  'Backend Development & API Integration',
  'E-commerce Solutions',
  'Software & Web Applications',
  'Networking & IT Solutions',
  'Maintenance & Support'
];

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
    setUploading(true); 
    setError('');
    const fd = new FormData(); 
    fd.append('file', file);
    try {
      const res = await fetch(`${API_BASE_URL}/upload.php`, {
        method: 'POST', 
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }, 
        body: fd
      });
      const d = await res.json();
      if (d.success) { 
        onChange(d.url); 
      } else {
        setError(d.message || 'Upload failed');
      }
    } catch { 
      setError('Network error'); 
    } finally { 
      setUploading(false); 
    }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem', display: 'block', marginBottom: 6, color: 'var(--text-primary)' }}>{label}</label>}
      <div 
        onDrop={e => { e.preventDefault(); setDragActive(false); upload(e.dataTransfer?.files?.[0]); }}
        onDragOver={e => { e.preventDefault(); setDragActive(true); }} 
        onDragLeave={() => setDragActive(false)}
        onClick={() => fileRef.current?.click()}
        style={{ 
          border: `2px dashed ${dragActive ? 'var(--primary)' : 'var(--border)'}`, 
          borderRadius: 'var(--radius-md)',
          padding: value ? 12 : '30px 16px', 
          textAlign: 'center', 
          cursor: 'pointer',
          background: dragActive ? 'rgba(59,130,246,.06)' : 'var(--bg-secondary)', 
          transition: 'all .2s' 
        }}
      >
        <input ref={fileRef} type="file" accept="image/*" onChange={e => upload(e.target.files?.[0])} style={{ display: 'none' }} />
        {uploading ? (
          <div className="cms-spinner" style={{ margin: '10px auto' }} />
        ) : value ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src={value} alt="" style={{ width: 80, height: 50, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)', background: '#fff' }} />
            <span style={{ flex: 1, textAlign: 'left', fontSize: '.75rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>{value.split('/').pop()}</span>
            <button 
              type="button" 
              onClick={e => { e.stopPropagation(); onChange(''); }} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <>
            <Upload size={24} style={{ color: 'var(--text-muted)', marginBottom: 6, marginLeft: 'auto', marginRight: 'auto', display: 'block' }} />
            <p style={{ fontSize: '.82rem', color: 'var(--text-secondary)', margin: '0 0 2px' }}><strong>Click to upload</strong> or drag & drop</p>
            <p style={{ fontSize: '.68rem', color: 'var(--text-muted)', margin: 0 }}>PNG, JPG, SVG, WebP · Max 5 MB</p>
          </>
        )}
      </div>
      {onOpenLibrary && (
        <button 
          type="button" 
          onClick={onOpenLibrary} 
          style={{ 
            fontSize: '.75rem', 
            color: 'var(--primary)', 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            marginTop: 6, 
            textDecoration: 'underline',
            padding: 0
          }}
        >
          Browse Media Library
        </button>
      )}
      {error && <p style={{ color: '#ef4444', fontSize: '.78rem', marginTop: 4 }}>{error}</p>}
      <input 
        type="text" 
        className="form-control" 
        placeholder="Or paste external URL…" 
        value={value || ''} 
        onChange={e => onChange(e.target.value)} 
        style={{ marginTop: 8, fontSize: '.78rem' }} 
      />
      {hint && <small style={{ color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>{hint}</small>}
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
    const fd = new FormData(); 
    fd.append('file', file);
    try {
      const res = await fetch(`${API_BASE_URL}/upload.php`, {
        method: 'POST', 
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }, 
        body: fd
      });
      const d = await res.json();
      if (d.success) loadMedia();
    } catch { /* ignore error during upload */ }
    finally { setUploading(false); }
  };

  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-primary)', borderRadius: 16, width: '90vw', maxWidth: 900, maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid var(--border)' }}>
        {/* Header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 800 }}><FolderOpen size={20} style={{ color: 'var(--primary)' }} /> Media Library</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>
        {/* Toolbar */}
        <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Search media by filename..." value={search} onChange={e => setSearch(e.target.value)} className="form-control" style={{ paddingLeft: 32, fontSize: '.85rem' }} />
          </div>
          <button onClick={() => fileRef.current?.click()} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '.82rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            {uploading ? <span className="cms-spinner" /> : <><Upload size={14} /> Upload Image</>}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={e => handleUpload(e.target.files?.[0])} style={{ display: 'none' }} />
        </div>
        {/* Grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {mediaLoading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><span className="cms-spinner" /></div> :
            filteredMedia.length === 0 ? <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No media files. Upload an image to get started.</p> :
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
              {filteredMedia.map(m => (
                <div key={m.id} style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', cursor: 'pointer', transition: 'all .2s', position: 'relative', background: 'var(--bg-secondary)' }}
                  onClick={() => { onSelect(m.url); onClose(); }}>
                  <img src={m.url} alt={m.original_name} style={{ width: '100%', height: 100, objectFit: 'cover', display: 'block', background: '#f8fafc' }} />
                  <div style={{ padding: '6px 8px' }}>
                    <p style={{ fontSize: '.68rem', color: 'var(--text-primary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.original_name || m.filename}</p>
                    <p style={{ fontSize: '.6rem', color: 'var(--text-muted)', margin: 0 }}>{(m.file_size / 1024).toFixed(0)} KB</p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); deleteMedia(parseInt(m.id)); }} title="Delete" style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,.6)', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 6px', cursor: 'pointer', fontSize: '.65rem' }}>✕</button>
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
   MAIN: ProjectsAdmin Component
   ═══════════════════════════════════════════════ */
export default function ProjectsAdmin() {
  const { 
    projects, projectModal, setProjectModal, projectForm, setProjectForm, 
    handleSaveProject, handleDeleteProject, adminFetch,
    mediaLibrary, mediaLoading, loadMedia, deleteMedia
  } = useContext(AdminContext);

  const [activeFormTab, setActiveFormTab] = useState('basic');
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setProjectForm(prev => ({ ...prev, [name]: value }));
  };

  const openModal = (mode, data = null) => {
    setActiveFormTab('basic');
    if (mode === 'edit' && data) {
      setProjectForm({
        id: data.id || '',
        title: data.title || '',
        category: data.category || 'Website Development',
        client_name: data.client_name || '',
        completion_date: data.completion_date || '',
        summary: data.summary || '',
        challenge: data.challenge || '',
        solution: data.solution || '',
        results_metric: data.results_metric || '',
        image_url: data.image_url || '',
        project_url: data.project_url || '',
        github_url: data.github_url || '',
        tech_stack: data.tech_stack || ''
      });
      setProjectModal({ open: true, mode: 'edit', data });
    } else {
      setProjectForm({
        id: '',
        title: '',
        category: 'Website Development',
        client_name: '',
        completion_date: '',
        summary: '',
        challenge: '',
        solution: '',
        results_metric: '',
        image_url: '',
        project_url: '',
        github_url: '',
        tech_stack: ''
      });
      setProjectModal({ open: true, mode: 'create', data: null });
    }
  };

  // AI Description Generator Helper
  const handleAiGenerate = async () => {
    if (!projectForm.title) {
      alert('Please fill out the Project Title first.');
      return;
    }
    setAiGenerating(true);
    try {
      const res = await adminFetch(`${API_BASE_URL}/ai_helper.php?task=description`, {
        method: 'POST',
        body: JSON.stringify({
          title: projectForm.title,
          category: projectForm.category
        })
      });
      if (res.ok && res.data.success) {
        const result = res.data.result;
        const cleaned = result.replace(/^Brainfeels AI: Project Description Generator\n\n/, '');
        
        setProjectForm(prev => ({
          ...prev,
          challenge: prev.challenge || `To engineer a secure, highly scalable solution for ${projectForm.title} that meets performance thresholds under high-concurrency workloads.`,
          solution: prev.solution || cleaned
        }));
      } else {
        alert('AI Generation failed: ' + (res.data?.message || 'Unknown error'));
      }
    } catch (e) {
      alert('AI Generation error: ' + e.message);
    } finally {
      setAiGenerating(false);
    }
  };

  // Form submit handler with validation and tab redirection
  const onSubmit = (e) => {
    e.preventDefault();
    if (!projectForm.title) {
      setActiveFormTab('basic');
      alert('Project Title is required.');
      return;
    }
    if (!projectForm.category) {
      setActiveFormTab('basic');
      alert('Category is required.');
      return;
    }
    if (!projectForm.summary) {
      setActiveFormTab('details');
      alert('Summary / Brief Intro is required.');
      return;
    }
    if (!projectForm.image_url) {
      setActiveFormTab('media');
      alert('Project Image is required.');
      return;
    }
    handleSaveProject(e);
  };

  return (
    <div className="projects-admin-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Project Case Studies</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Create and manage the case studies displayed on the public portfolio page.
          </p>
        </div>
        <button onClick={() => openModal('create')} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Add New Project
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
        {projects.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-lg)' }}>
            <FileText size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <h4 style={{ fontWeight: 700, marginBottom: '6px' }}>No Case Studies Found</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Publish your first development project to build company authority.
            </p>
            <button onClick={() => openModal('create')} className="btn btn-outline" style={{ fontSize: '0.85rem' }}>
              Create a Case Study
            </button>
          </div>
        ) : (
          projects.map(proj => (
            <div key={proj.id} className="admin-project-card">
              <div 
                style={{ 
                  height: '180px', 
                  backgroundColor: 'var(--bg-secondary)', 
                  borderBottom: '1px solid var(--border)',
                  backgroundImage: `url(${proj.image_url || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80'})`, 
                  backgroundSize: 'cover', 
                  backgroundPosition: 'center',
                  position: 'relative'
                }} 
              >
                <span className="card-category-badge">{proj.category}</span>
              </div>
              <div className="card-body">
                <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  {proj.title}
                </h4>
                
                <div className="meta-info-row">
                  {proj.client_name && (
                    <span><User size={12} /> {proj.client_name}</span>
                  )}
                  {proj.completion_date && (
                    <span><Calendar size={12} /> {proj.completion_date}</span>
                  )}
                </div>

                <p className="summary-text">{proj.summary}</p>
                
                {proj.tech_stack && (
                  <div className="tech-tags-wrapper">
                    {proj.tech_stack.split(',').map((tech, tIdx) => (
                      <span key={tIdx} className="tech-tag">{tech.trim()}</span>
                    ))}
                  </div>
                )}

                {proj.results_metric && (
                  <div className="result-metric-box">
                    <TrendingUp size={14} /> <strong>Result:</strong> {proj.results_metric}
                  </div>
                )}

                <div className="card-actions">
                  <div className="link-icons">
                    {proj.project_url && (
                      <a href={proj.project_url} target="_blank" rel="noreferrer" title="Live Site"><Globe size={16} /></a>
                    )}
                    {proj.github_url && (
                      <a href={proj.github_url} target="_blank" rel="noreferrer" title="GitHub Repo"><GithubIcon size={16} /></a>
                    )}
                  </div>

                  <div className="buttons">
                    <button onClick={() => openModal('edit', proj)} className="btn btn-outline edit-btn">
                      <Edit size={13} /> Edit
                    </button>
                    <button onClick={() => handleDeleteProject(proj.id)} className="btn btn-outline delete-btn">
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upgraded Multi-field Form Modal */}
      {projectModal.open && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
             <div className="modal-header">
               <h3 style={{ fontWeight: 800 }}>{projectModal.mode === 'edit' ? 'Edit Case Study' : 'Create Case Study'}</h3>
               <button onClick={() => setProjectModal({open: false})} className="close-btn">
                 <X size={20} />
               </button>
             </div>
             
             {/* Tab Navigation */}
             <div className="modal-tabs" style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', padding: '0 24px' }}>
               <button 
                 type="button" 
                 onClick={() => setActiveFormTab('basic')}
                 style={{
                   padding: '14px 20px',
                   background: 'none',
                   border: 'none',
                   borderBottom: `2px solid ${activeFormTab === 'basic' ? 'var(--primary)' : 'transparent'}`,
                   color: activeFormTab === 'basic' ? 'var(--primary)' : 'var(--text-secondary)',
                   fontWeight: activeFormTab === 'basic' ? '700' : '500',
                   cursor: 'pointer',
                   fontSize: '0.85rem'
                 }}
               >
                 Basic Info
               </button>
               <button 
                 type="button" 
                 onClick={() => setActiveFormTab('details')}
                 style={{
                   padding: '14px 20px',
                   background: 'none',
                   border: 'none',
                   borderBottom: `2px solid ${activeFormTab === 'details' ? 'var(--primary)' : 'transparent'}`,
                   color: activeFormTab === 'details' ? 'var(--primary)' : 'var(--text-secondary)',
                   fontWeight: activeFormTab === 'details' ? '700' : '500',
                   cursor: 'pointer',
                   fontSize: '0.85rem'
                 }}
               >
                 Case Study Details
               </button>
               <button 
                 type="button" 
                 onClick={() => setActiveFormTab('media')}
                 style={{
                   padding: '14px 20px',
                   background: 'none',
                   border: 'none',
                   borderBottom: `2px solid ${activeFormTab === 'media' ? 'var(--primary)' : 'transparent'}`,
                   color: activeFormTab === 'media' ? 'var(--primary)' : 'var(--text-secondary)',
                   fontWeight: activeFormTab === 'media' ? '700' : '500',
                   cursor: 'pointer',
                   fontSize: '0.85rem'
                 }}
               >
                 Media & Links
               </button>
             </div>
             
             <form onSubmit={onSubmit} className="modal-form" style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
               
               {/* TAB 1: Basic Info */}
               {activeFormTab === 'basic' && (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="fade-slide">
                   <div className="form-row">
                     <div className="form-group flex-2">
                       <label>Project Title *</label>
                       <input 
                         type="text" 
                         name="title" 
                         value={projectForm.title} 
                         onChange={handleFormChange} 
                         className="form-control" 
                         placeholder="e.g. Hyperion Route Optimization App"
                         required 
                       />
                     </div>
                     
                     <div className="form-group flex-1">
                       <label>Category *</label>
                       <select 
                         name="category" 
                         value={projectForm.category} 
                         onChange={handleFormChange} 
                         className="form-control"
                         required
                       >
                         {CATEGORIES.map((cat, idx) => (
                           <option key={idx} value={cat}>{cat}</option>
                         ))}
                       </select>
                     </div>
                   </div>

                   <div className="form-row">
                     <div className="form-group">
                       <label>Client Name</label>
                       <input 
                         type="text" 
                         name="client_name" 
                         value={projectForm.client_name} 
                         onChange={handleFormChange} 
                         className="form-control" 
                         placeholder="e.g. Fintech Growth Corp"
                       />
                     </div>
                     
                     <div className="form-group">
                       <label>Completion Date</label>
                       <input 
                         type="text" 
                         name="completion_date" 
                         value={projectForm.completion_date} 
                         onChange={handleFormChange} 
                         className="form-control" 
                         placeholder="e.g. March 2026"
                       />
                     </div>
                   </div>

                   <div className="form-row">
                     <div className="form-group flex-2">
                       <label>Technology Stack (Comma separated)</label>
                       <input 
                         type="text" 
                         name="tech_stack" 
                         value={projectForm.tech_stack} 
                         onChange={handleFormChange} 
                         className="form-control" 
                         placeholder="e.g. React Native, SQLite, Expo, Node.js"
                       />
                     </div>
                     
                     <div className="form-group flex-1">
                       <label>Results Metric (KPI/Outcome)</label>
                       <input 
                         type="text" 
                         name="results_metric" 
                         value={projectForm.results_metric} 
                         onChange={handleFormChange} 
                         className="form-control" 
                         placeholder="e.g. Latency reduced to < 5ms"
                       />
                     </div>
                   </div>
                 </div>
               )}

               {/* TAB 2: Case Study Details */}
               {activeFormTab === 'details' && (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="fade-slide">
                   <div className="form-group">
                     <label>Summary / Brief Intro (List view snippet) *</label>
                     <textarea 
                       name="summary" 
                       value={projectForm.summary} 
                       onChange={handleFormChange} 
                       className="form-control" 
                       rows="2"
                       placeholder="A short 1-2 sentence introduction of the project goals."
                       required 
                     />
                   </div>

                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                     <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Challenge & Solution Narrative</h4>
                     <button 
                       type="button" 
                       onClick={handleAiGenerate}
                       disabled={aiGenerating || !projectForm.title}
                       className="btn btn-outline"
                       style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.78rem' }}
                     >
                       {aiGenerating ? (
                         <span className="cms-spinner" />
                       ) : (
                         <><Wand2 size={13} /> Auto-Generate with AI</>
                       )}
                     </button>
                   </div>

                   <div className="form-row">
                     <div className="form-group">
                       <label>The Challenge (Problem Statement)</label>
                       <textarea 
                         name="challenge" 
                         value={projectForm.challenge} 
                         onChange={handleFormChange} 
                         className="form-control" 
                         rows="4"
                         placeholder="Explain the technical bottleneck, operational issues, or custom client request..."
                       />
                     </div>
                     
                     <div className="form-group">
                       <label>Our Solution (How we solved it)</label>
                       <textarea 
                         name="solution" 
                         value={projectForm.solution} 
                         onChange={handleFormChange} 
                         className="form-control" 
                         rows="4"
                         placeholder="Describe the architecture design, tools used, and implementation details..."
                       />
                     </div>
                   </div>
                 </div>
               )}

               {/* TAB 3: Media & Links */}
               {activeFormTab === 'media' && (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="fade-slide">
                   <ImageUploader 
                     label="Case Study Cover Image *"
                     value={projectForm.image_url} 
                     onChange={val => setProjectForm(prev => ({ ...prev, image_url: val }))}
                     hint="Recommended: 1200×800 px. Upload or browse the CMS media library."
                     onOpenLibrary={() => setMediaModalOpen(true)}
                   />

                   <div className="form-row" style={{ marginTop: '10px' }}>
                     <div className="form-group">
                       <label>Live URL (Project Link)</label>
                       <input 
                         type="url" 
                         name="project_url" 
                         value={projectForm.project_url} 
                         onChange={handleFormChange} 
                         className="form-control" 
                         placeholder="https://example.com"
                       />
                     </div>
                     
                     <div className="form-group">
                       <label>GitHub Repository URL</label>
                       <input 
                         type="url" 
                         name="github_url" 
                         value={projectForm.github_url} 
                         onChange={handleFormChange} 
                         className="form-control" 
                         placeholder="https://github.com/..."
                       />
                     </div>
                   </div>
                 </div>
               )}

               <div className="modal-footer" style={{ marginTop: '12px' }}>
                 <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>
                   {projectModal.mode === 'edit' ? 'Update Case Study' : 'Publish Case Study'}
                 </button>
                 <button type="button" onClick={() => setProjectModal({open: false})} className="btn btn-outline" style={{ padding: '10px 20px' }}>
                   Cancel
                 </button>
               </div>
             </form>
          </div>
        </div>
      )}

      {/* Media Library Modal integration */}
      <MediaLibraryModal 
        open={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSelect={val => setProjectForm(prev => ({ ...prev, image_url: val }))}
        mediaLibrary={mediaLibrary}
        mediaLoading={mediaLoading}
        loadMedia={loadMedia}
        deleteMedia={deleteMedia}
      />

      <style>{`
        .admin-project-card {
          background-color: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .admin-project-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
        }
        .card-category-badge {
          position: absolute;
          bottom: 12px;
          left: 12px;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(4px);
          color: white;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .admin-project-card .card-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          text-align: left;
        }
        .meta-info-row {
          display: flex;
          gap: 16px;
          margin-bottom: 12px;
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .meta-info-row span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .summary-text {
          font-size: 0.88rem;
          line-height: 1.5;
          color: var(--text-secondary);
          margin-bottom: 14px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .tech-tags-wrapper {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 14px;
        }
        .tech-tag {
          font-size: 0.7rem;
          padding: 2px 8px;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border);
          color: var(--text-primary);
          border-radius: 4px;
          font-weight: 600;
        }
        .result-metric-box {
          display: flex;
          align-items: center;
          gap: 8px;
          background-color: rgba(16, 185, 129, 0.06);
          border-left: 3px solid #10b981;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 0.82rem;
          color: #065f46;
          margin-bottom: 16px;
        }
        .card-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
          border-top: 1px solid var(--border);
          padding-top: 14px;
        }
        .link-icons {
          display: flex;
          gap: 10px;
        }
        .link-icons a {
          color: var(--text-muted);
          transition: color 0.2s ease;
        }
        .link-icons a:hover {
          color: var(--secondary);
        }
        .card-actions .buttons {
          display: flex;
          gap: 6px;
        }
        .edit-btn, .delete-btn {
          padding: 6px 12px !important;
          font-size: 0.78rem !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 4px !important;
        }
        .delete-btn {
          color: #ef4444 !important;
          border-color: rgba(239, 68, 68, 0.3) !important;
        }
        .delete-btn:hover {
          background-color: rgba(239, 68, 68, 0.05) !important;
          border-color: #ef4444 !important;
        }

        /* --- Modal Styles --- */
        .admin-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        }
        .admin-modal-card {
          background-color: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
          width: 100%;
          max-width: 760px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border);
        }
        .modal-header h3 {
          font-size: 1.3rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0;
        }
        .close-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s ease, color 0.2s ease;
        }
        .close-btn:hover {
          background-color: var(--bg-secondary);
          color: var(--text-primary);
        }
        .modal-form {
          padding: 24px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
          text-align: left;
        }
        .form-row {
          display: flex;
          gap: 16px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }
        .flex-2 { flex: 2; }
        .flex-1 { flex: 1; }
        .form-group label {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          border-top: 1px solid var(--border);
          padding: 20px 24px;
        }

        /* --- Animations & Utilities --- */
        @keyframes cms-spin { to { transform: rotate(360deg); } }
        .cms-spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2.5px solid var(--border);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: cms-spin .7s linear infinite;
        }
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-slide {
          animation: fadeSlide .2s ease;
        }

        @media (max-width: 640px) {
          .form-row {
            flex-direction: column;
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
}
