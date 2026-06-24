import { useContext } from 'react';
import { AdminContext } from '../AdminContext';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function CareersAdmin() {
  const { careers, careerModal, setCareerModal, handleSaveCareer, handleDeleteCareer, careerForm, setCareerForm } = useContext(AdminContext);

  const openModal = (mode, data = null) => {
    if (mode === 'edit' && data) {
      setCareerForm(data);
      setCareerModal({ open: true, mode: 'edit', data });
    } else {
      setCareerForm({ id: '', title: '', location: '', type: 'Full-time', salary: '', description: '', requirements: '' });
      setCareerModal({ open: true, mode: 'create', data: null });
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCareerForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Career Center & Vacancies</h3>
        <button onClick={() => openModal('create')} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Post New Job
        </button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
        {careers.length === 0 ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No open vacancies.</div>
        ) : (
          careers.map(job => (
            <div key={job.id} className="card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>{job.title}</h4>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span>{job.type}</span>
                  <span>&bull;</span>
                  <span>{job.location}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => openModal('edit', job)} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Edit size={14} /> Edit
                </button>
                <button onClick={() => handleDeleteCareer && handleDeleteCareer(job.id)} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem', color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {careerModal?.open && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="card" style={{ width: '90%', maxWidth: '600px', padding: '30px' }}>
            <h3 style={{ marginBottom: '20px' }}>{careerModal.mode === 'edit' ? 'Edit Vacancy' : 'Post Vacancy'}</h3>
            <form onSubmit={handleSaveCareer}>
              <div className="form-group">
                <label>Job Title</label>
                <input type="text" name="title" className="form-control" value={careerForm.title} onChange={handleFormChange} required />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary">Save Changes</button>
                <button type="button" onClick={() => setCareerModal({open: false})} className="btn btn-outline">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
