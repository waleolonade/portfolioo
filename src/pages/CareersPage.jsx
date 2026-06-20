import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Briefcase, MapPin, DollarSign, Send, CheckCircle, AlertCircle, UploadCloud } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function CareersPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeJobId, setActiveJobId] = useState(null); // ID for application form modal
  const [expandedJobId, setExpandedJobId] = useState(null); // Accordion toggle

  // Form state
  const [formData, setFormData] = useState({
    applicant_name: '',
    applicant_email: '',
    applicant_phone: '',
    message: '',
    cv: null
  });
  
  const [status, setStatus] = useState({ submitting: false, success: null, error: null });

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch(`${API_BASE_URL}/careers.php`)
      .then(res => res.json())
      .then(data => {
        setJobs(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load careers list', err);
        setLoading(false);
      });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, cv: e.target.files[0] }));
  };

  const handleApplySubmit = (e) => {
    e.preventDefault();
    if (!formData.cv) {
      setStatus({ submitting: false, success: null, error: 'Please upload your PDF resume.' });
      return;
    }

    setStatus({ submitting: true, success: null, error: null });

    // Use FormData for file upload compatibility
    const data = new FormData();
    data.append('job_id', activeJobId);
    data.append('applicant_name', formData.applicant_name);
    data.append('applicant_email', formData.applicant_email);
    data.append('applicant_phone', formData.applicant_phone);
    data.append('message', formData.message);
    data.append('cv', formData.cv);

    fetch(`${API_BASE_URL}/careers.php?apply=1`, {
      method: 'POST',
      body: data // No Content-Type header needed; browser sets boundary parameter automatically
    })
      .then(res => res.json().then(data => ({ status: res.status, data })))
      .then(({ status: statusCode, data }) => {
        if (statusCode >= 400) {
          throw new Error(data.message || 'Application submission failed.');
        }
        setStatus({ submitting: false, success: data.message, error: null });
        setFormData({ applicant_name: '', applicant_email: '', applicant_phone: '', message: '', cv: null });
        setTimeout(() => setActiveJobId(null), 3000); // Close modal on success
      })
      .catch(err => {
        setStatus({ submitting: false, success: null, error: err.message });
      });
  };

  return (
    <div className="page-container">
      <Navbar />
      <main style={{ flexGrow: 1, padding: '40px 0', textAlign: 'left' }}>
        <div className="container">
          
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Join Brainfeels Tech
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '8px', marginBottom: '16px' }}>
            Build What Matters
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '40px', maxWidth: '600px' }}>
            We recruit highly focused engineers, UI creators, and cloud systems operators. Explore our active positions below.
          </p>

          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
              Loading job vacancies...
            </div>
          ) : jobs.length === 0 ? (
            <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No openings are currently active. Follow us on social media for future listings.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {jobs.map(job => (
                <div key={job.id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
                  
                  {/* Job Accordion Header */}
                  <div 
                    onClick={() => setExpandedJobId(expandedJobId === job.id ? null : job.id)}
                    style={{
                      padding: '24px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      backgroundColor: 'var(--bg-secondary)',
                      transition: 'var(--transition)'
                    }}
                    className="job-header-hover"
                  >
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                        {job.title}
                      </h3>
                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={14} /> {job.location}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Briefcase size={14} /> {job.type}
                        </span>
                        {job.salary && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <DollarSign size={14} /> {job.salary}
                          </span>
                        )}
                      </div>
                    </div>
                    <span style={{ fontSize: '1.5rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                      {expandedJobId === job.id ? '−' : '+'}
                    </span>
                  </div>

                  {/* Job Accordion Body */}
                  {expandedJobId === job.id && (
                    <div style={{ padding: '24px', borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)' }}>
                      <div style={{ marginBottom: '20px' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Role Specifications</h4>
                        <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                          {job.description}
                        </p>
                      </div>

                      <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Requirements</h4>
                        <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                          {job.requirements}
                        </p>
                      </div>

                      <button onClick={() => {
                        setActiveJobId(job.id);
                        setStatus({ submitting: false, success: null, error: null });
                      }} className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.875rem' }}>
                        Apply for Position
                      </button>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}

        </div>
      </main>

      {/* MODAL: APPLICATION WIZARD */}
      {activeJobId && (
        <div className="modal-backdrop" onClick={() => setActiveJobId(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Submit Application</h3>
              <button onClick={() => setActiveJobId(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
            </div>
            
            <form onSubmit={handleApplySubmit}>
              <div className="modal-body">
                {status.success && (
                  <div style={{ display: 'flex', gap: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '0.85rem' }}>
                    <CheckCircle size={16} /> <span>{status.success}</span>
                  </div>
                )}
                
                {status.error && (
                  <div style={{ display: 'flex', gap: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '0.85rem' }}>
                    <AlertCircle size={16} /> <span>{status.error}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label" htmlFor="app_name">Full Name</label>
                  <input
                    type="text"
                    id="app_name"
                    name="applicant_name"
                    value={formData.applicant_name}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Jane Doe"
                    disabled={status.submitting}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="app_email">Email Address</label>
                  <input
                    type="email"
                    id="app_email"
                    name="applicant_email"
                    value={formData.applicant_email}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="jane@example.com"
                    disabled={status.submitting}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="app_phone">Phone Number</label>
                  <input
                    type="tel"
                    id="app_phone"
                    name="applicant_phone"
                    value={formData.applicant_phone}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="+1 (555) 012-3456"
                    disabled={status.submitting}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Upload Resume (PDF format)</label>
                  <div style={{
                    border: '2px dashed var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    backgroundColor: 'var(--bg-primary)'
                  }} className="upload-box-hover">
                    <UploadCloud size={28} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      {formData.cv ? formData.cv.name : 'Click to select or drop PDF file'}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Max size 5MB</span>
                    <input
                      type="file"
                      accept=".pdf,.docx"
                      onChange={handleFileChange}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        opacity: 0,
                        cursor: 'pointer'
                      }}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="app_msg">Cover Message</label>
                  <textarea
                    id="app_msg"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Briefly state your suitability for the role..."
                    rows="3"
                    disabled={status.submitting}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setActiveJobId(null)} className="btn btn-outline" disabled={status.submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={status.submitting}>
                  {status.submitting ? 'Uploading...' : 'Submit Application'}
                  <Send size={14} style={{ marginLeft: '6px' }} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
