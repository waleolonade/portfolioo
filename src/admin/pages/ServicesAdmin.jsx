import { useContext, useState, useRef } from 'react';
import { AdminContext } from '../AdminContext';
import { API_BASE_URL } from '../../config';
import { 
  Plus, 
  Edit, 
  Trash2, 
  X,
  FileText,
  Code,
  Laptop,
  Smartphone,
  Server,
  Database,
  Shield,
  Globe,
  Cloud,
  Palette,
  Cpu,
  Zap,
  Settings,
  CheckCircle,
  TrendingUp,
  DollarSign,
  Wand2,
  List,
  Upload
} from 'lucide-react';

const ICON_MAP = {
  Code,
  Laptop,
  Smartphone,
  Server,
  Database,
  Shield,
  Globe,
  Cloud,
  Palette,
  Cpu,
  Zap,
  Settings
};

const AVAILABLE_ICONS = Object.keys(ICON_MAP);

const ServiceIcon = ({ name, size = 20, className = "", style = {} }) => {
  const IconComponent = ICON_MAP[name] || Code;
  return <IconComponent size={size} className={className} style={style} />;
};

/* ═══════════════════════════════════════════════
   Shared: Image Uploader with Drag & Drop
   ═══════════════════════════════════════════════ */
function ImageUploader({ label, value, onChange, hint }) {
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
      {error && <p style={{ color: '#ef4444', fontSize: '.78rem', marginTop: 4 }}>{error}</p>}
      <input type="text" className="form-control" placeholder="Or paste URL…" value={value || ''} onChange={e => onChange(e.target.value)} style={{ marginTop: 6, fontSize: '.78rem' }} />
      {hint && <small style={{ color: 'var(--text-muted)', marginTop: 3, display: 'block' }}>{hint}</small>}
    </div>
  );
}

export default function ServicesAdmin() {
  const { 
    services, serviceModal, setServiceModal, serviceForm, setServiceForm, 
    handleSaveService, handleDeleteService, adminFetch 
  } = useContext(AdminContext);

  const [activeFormTab, setActiveFormTab] = useState('basic');
  const [aiGenerating, setAiGenerating] = useState(false);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setServiceForm(prev => ({ ...prev, [name]: value }));
  };

  const selectIcon = (iconName) => {
    setServiceForm(prev => ({ ...prev, icon_name: iconName }));
  };

  const openModal = (mode, data = null) => {
    setActiveFormTab('basic');
    if (mode === 'edit' && data) {
      setServiceForm({
        id: data.id || '',
        name: data.name || '',
        description: data.description || '',
        benefits: data.benefits || '',
        features: data.features || '',
        icon_name: data.icon_name || 'Code',
        image_url: data.image_url || '',
        basic_price: data.basic_price || 0,
        standard_price: data.standard_price || 0,
        premium_price: data.premium_price || 0
      });
      setServiceModal({ open: true, mode: 'edit', data });
    } else {
      setServiceForm({
        id: '',
        name: '',
        description: '',
        benefits: '',
        features: '',
        icon_name: 'Code',
        image_url: '',
        basic_price: 0,
        standard_price: 0,
        premium_price: 0
      });
      setServiceModal({ open: true, mode: 'create', data: null });
    }
  };

  // AI Service Content Assistant
  const handleAiGenerate = async () => {
    if (!serviceForm.name) {
      alert('Please fill out the Service Name first.');
      return;
    }
    setAiGenerating(true);
    try {
      const res = await adminFetch(`${API_BASE_URL}/ai_helper.php?task=description`, {
        method: 'POST',
        body: JSON.stringify({
          title: serviceForm.name,
          category: serviceForm.icon_name === 'Smartphone' ? 'Mobile App Development' : 'Website Development'
        })
      });
      if (res.ok && res.data.success) {
        const result = res.data.result;
        const cleanedDesc = result.replace(/^Brainfeels AI: Project Description Generator\n\n/, '');
        
        const lowerName = serviceForm.name.toLowerCase();
        let features = '';
        let benefits = '';
        
        if (lowerName.includes('web') || lowerName.includes('site') || lowerName.includes('front')) {
          features = 'Custom React frontend development, Responsive CSS layouts, Speed & Lighthouse SEO optimization, CMS content integration';
          benefits = 'Establish brand authority, Reach customers on all devices, Lower server hosting overhead, Easily update headings & text';
        } else if (lowerName.includes('app') || lowerName.includes('mobile') || lowerName.includes('ios')) {
          features = 'React Native & Expo architecture, SQLite offline database caching, Secure device GPS tracking, Batch push notification alerts';
          benefits = 'Native user experience on iOS & Android, Keep field operators sync\'d, Boost app engagement, Scalable offline performance';
        } else if (lowerName.includes('api') || lowerName.includes('back') || lowerName.includes('integrat')) {
          features = 'High-throughput RESTful endpoints, Redis performance cache layers, Secure JWT authorization keys, CORS & security headers';
          benefits = 'Guarantee transaction integrity, Handle up to 5000 requests/sec, Protect user authentication, Modular microservices layout';
        } else if (lowerName.includes('security') || lowerName.includes('network') || lowerName.includes('support')) {
          features = 'Zero-trust VPC networks, Tailored firewall policies, Automated health check logs, VPN tunnel setup';
          benefits = 'Ensure full data isolation, Minimize downtime to 99.99%, Immediate anomaly notifications, Safe remote access';
        } else {
          features = 'Modern modular codebase components, Custom admin panel configuration, Agile development sprint cycles, Comprehensive testing suite';
          benefits = 'Accelerate development delivery, Adapt to evolving workloads, Secure intellectual property, Save admin overhead hours';
        }
        
        setServiceForm(prev => ({
          ...prev,
          description: prev.description || cleanedDesc,
          features: prev.features || features,
          benefits: prev.benefits || benefits
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

  const onSubmit = (e) => {
    e.preventDefault();
    if (!serviceForm.name) {
      setActiveFormTab('basic');
      alert('Service Name is required.');
      return;
    }
    if (!serviceForm.description) {
      setActiveFormTab('basic');
      alert('Service Description is required.');
      return;
    }
    if (!serviceForm.features) {
      setActiveFormTab('details');
      alert('Features list is required.');
      return;
    }
    if (!serviceForm.benefits) {
      setActiveFormTab('details');
      alert('Benefits list is required.');
      return;
    }
    handleSaveService(e);
  };

  return (
    <div className="services-admin-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Services Directory</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Configure the software engineering, consulting, and agency services displayed to clients.
          </p>
        </div>
        <button onClick={() => openModal('create')} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Add New Service
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
        {services.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-lg)' }}>
            <FileText size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <h4 style={{ fontWeight: 700, marginBottom: '6px' }}>No Services Configured</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Add your first software agency service capability.
            </p>
            <button onClick={() => openModal('create')} className="btn btn-outline" style={{ fontSize: '0.85rem' }}>
              Configure a Service
            </button>
          </div>
        ) : (
          services.map(service => (
            <div key={service.id} className="admin-service-card">
              <div className="card-header-bar">
                <div className="service-icon-wrapper">
                  <ServiceIcon name={service.icon_name} size={22} />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="price-tag-badge">${parseFloat(service.basic_price).toLocaleString()}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>Starting</span>
                </div>
              </div>
              
              <div className="card-body">
                <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  {service.name}
                </h4>
                
                <p className="description-text">{service.description}</p>
                
                {service.features && (
                  <div className="lists-section">
                    <strong className="section-label"><List size={11} /> Features</strong>
                    <ul className="bullet-list">
                      {service.features.split(',').slice(0, 3).map((f, idx) => (
                        <li key={idx}>✓ {f.trim()}</li>
                      ))}
                      {service.features.split(',').length > 3 && (
                        <li style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>+ {service.features.split(',').length - 3} more</li>
                      )}
                    </ul>
                  </div>
                )}

                <div className="card-actions">
                  <div className="buttons">
                    <button onClick={() => openModal('edit', service)} className="btn btn-outline edit-btn">
                      <Edit size={13} /> Edit
                    </button>
                    <button onClick={() => handleDeleteService(service.id)} className="btn btn-outline delete-btn">
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
      {serviceModal.open && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
             <div className="modal-header">
               <h3 style={{ fontWeight: 800 }}>{serviceModal.mode === 'edit' ? 'Edit Service' : 'Create Service'}</h3>
               <button onClick={() => setServiceModal({open: false})} className="close-btn">
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
                 Features & Benefits
               </button>
               <button 
                 type="button" 
                 onClick={() => setActiveFormTab('pricing')}
                 style={{
                   padding: '14px 20px',
                   background: 'none',
                   border: 'none',
                   borderBottom: `2px solid ${activeFormTab === 'pricing' ? 'var(--primary)' : 'transparent'}`,
                   color: activeFormTab === 'pricing' ? 'var(--primary)' : 'var(--text-secondary)',
                   fontWeight: activeFormTab === 'pricing' ? '700' : '500',
                   cursor: 'pointer',
                   fontSize: '0.85rem'
                 }}
               >
                 Pricing Tiers
               </button>
             </div>
             
             <form onSubmit={onSubmit} className="modal-form" style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
               
               {/* TAB 1: Basic Info */}
               {activeFormTab === 'basic' && (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="fade-slide">
                   <div className="form-group">
                     <label>Service Name *</label>
                     <input 
                       type="text" 
                       name="name" 
                       value={serviceForm.name} 
                       onChange={handleFormChange} 
                       className="form-control" 
                       placeholder="e.g. Enterprise Web Applications"
                       required 
                     />
                   </div>

                   <div className="form-group">
                     <label style={{ marginBottom: '8px' }}>Select Service Icon *</label>
                     <div className="icon-selector-grid">
                       {AVAILABLE_ICONS.map(ico => (
                         <button
                           key={ico}
                           type="button"
                           onClick={() => selectIcon(ico)}
                           className={`icon-selector-btn ${serviceForm.icon_name === ico ? 'selected' : ''}`}
                           title={ico}
                         >
                           <ServiceIcon name={ico} size={18} />
                           <span style={{ fontSize: '0.65rem', marginTop: '4px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%' }}>{ico}</span>
                         </button>
                       ))}
                     </div>
                   </div>

                   <ImageUploader 
                     label="Service Cover Image (Optional)" 
                     value={serviceForm.image_url} 
                     onChange={(url) => setServiceForm(prev => ({ ...prev, image_url: url }))} 
                     hint="Upload an image to display on the service card."
                   />

                   <div className="form-group">
                     <label>Service Description *</label>
                     <textarea 
                       name="description" 
                       value={serviceForm.description} 
                       onChange={handleFormChange} 
                       className="form-control" 
                       rows="4"
                       placeholder="Describe the service scope, technologies, and target clients..."
                       required 
                     />
                   </div>
                 </div>
               )}

               {/* TAB 2: Features & Benefits */}
               {activeFormTab === 'details' && (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="fade-slide">
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Lists Narrative</h4>
                     <button 
                       type="button" 
                       onClick={handleAiGenerate}
                       disabled={aiGenerating || !serviceForm.name}
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

                   <div className="form-group">
                     <label>Key Features * (Comma separated)</label>
                     <textarea 
                       name="features" 
                       value={serviceForm.features} 
                       onChange={handleFormChange} 
                       className="form-control" 
                       rows="3"
                       placeholder="e.g. Custom React frontend, High-throughput API nodes, Secure DB storage"
                       required 
                     />
                     <small style={{ color: 'var(--text-muted)' }}>Specify the technical components delivered with this package.</small>
                   </div>

                   <div className="form-group">
                     <label>Client Benefits * (Comma separated)</label>
                     <textarea 
                       name="benefits" 
                       value={serviceForm.benefits} 
                       onChange={handleFormChange} 
                       className="form-control" 
                       rows="3"
                       placeholder="e.g. Scale customer reach, Secure proprietary algorithms, Establish business trust"
                       required 
                     />
                     <small style={{ color: 'var(--text-muted)' }}>Specify the business value or outcome advantages client gains.</small>
                   </div>
                 </div>
               )}

               {/* TAB 3: Pricing Models */}
               {activeFormTab === 'pricing' && (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="fade-slide">
                   <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                     Set estimation price structures. If a tier doesn't apply, set it to 0.
                   </p>
                   <div className="form-row">
                     <div className="form-group">
                       <label>Starting Price (Basic) *</label>
                       <div style={{ position: 'relative' }}>
                         <DollarSign size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                         <input 
                           type="number" 
                           name="basic_price" 
                           value={serviceForm.basic_price} 
                           onChange={handleFormChange} 
                           className="form-control" 
                           style={{ paddingLeft: '30px' }}
                           required
                         />
                       </div>
                     </div>

                     <div className="form-group">
                       <label>Standard Price</label>
                       <div style={{ position: 'relative' }}>
                         <DollarSign size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                         <input 
                           type="number" 
                           name="standard_price" 
                           value={serviceForm.standard_price} 
                           onChange={handleFormChange} 
                           className="form-control" 
                           style={{ paddingLeft: '30px' }}
                         />
                       </div>
                     </div>

                     <div className="form-group">
                       <label>Premium Price</label>
                       <div style={{ position: 'relative' }}>
                         <DollarSign size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                         <input 
                           type="number" 
                           name="premium_price" 
                           value={serviceForm.premium_price} 
                           onChange={handleFormChange} 
                           className="form-control" 
                           style={{ paddingLeft: '30px' }}
                         />
                       </div>
                     </div>
                   </div>
                 </div>
               )}

               <div className="modal-footer" style={{ marginTop: '12px' }}>
                 <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>
                   {serviceModal.mode === 'edit' ? 'Update Service' : 'Publish Service'}
                 </button>
                 <button type="button" onClick={() => setServiceModal({open: false})} className="btn btn-outline" style={{ padding: '10px 20px' }}>
                   Cancel
                 </button>
               </div>
             </form>
          </div>
        </div>
      )}

      <style>{`
        .admin-service-card {
          background-color: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .admin-service-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
        }
        .card-header-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 20px 0;
        }
        .service-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(59, 130, 246, 0.08);
          color: var(--primary);
          border: 1px solid rgba(59, 130, 246, 0.15);
        }
        .price-tag-badge {
          background: rgba(16, 185, 129, 0.08);
          color: #059669;
          font-weight: 700;
          font-size: 0.95rem;
          padding: 4px 10px;
          border-radius: 20px;
          border: 1px solid rgba(16, 185, 129, 0.15);
          display: inline-block;
        }
        .admin-service-card .card-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          text-align: left;
        }
        .description-text {
          font-size: 0.88rem;
          line-height: 1.5;
          color: var(--text-secondary);
          margin-bottom: 16px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .lists-section {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 10px 14px;
          margin-bottom: 16px;
        }
        .section-label {
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 6px;
        }
        .bullet-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 0.8rem;
          color: var(--text-primary);
        }
        .card-actions {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          margin-top: auto;
          border-top: 1px solid var(--border);
          padding-top: 14px;
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
          max-width: 700px;
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

        /* --- Icon Selector --- */
        .icon-selector-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 8px;
          max-height: 140px;
          overflow-y: auto;
          border: 1px solid var(--border);
          padding: 10px;
          border-radius: var(--radius-md);
          background: var(--bg-secondary);
        }
        .icon-selector-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 8px 4px;
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: 6px;
          cursor: pointer;
          color: var(--text-secondary);
          transition: all 0.2s ease;
        }
        .icon-selector-btn:hover {
          border-color: var(--primary);
          color: var(--primary);
          background: rgba(59, 130, 246, 0.04);
        }
        .icon-selector-btn.selected {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
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
          .icon-selector-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
