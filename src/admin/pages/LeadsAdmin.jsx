import { useContext } from 'react';
import { AdminContext } from '../AdminContext';
import { Mail, Check, X } from 'lucide-react';

export default function LeadsAdmin() {
  const { inquiries, handleViewInquiry, handleToggleLeadStatus, viewInquiryModal, setViewInquiryModal } = useContext(AdminContext);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Lead Qualification Center</h3>
      </div>
      <div className="card" style={{ padding: '24px' }}>
        {inquiries.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No leads found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px' }}>Name</th>
                  <th style={{ padding: '12px 16px' }}>Email</th>
                  <th style={{ padding: '12px 16px' }}>Subject</th>
                  <th style={{ padding: '12px 16px' }}>Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map(inq => (
                  <tr key={inq.id} style={{ borderBottom: '1px solid var(--border)', backgroundColor: inq.status === 'unread' ? 'rgba(var(--primary-rgb), 0.05)' : 'transparent' }}>
                    <td style={{ padding: '16px' }}>
                      <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: inq.status === 'unread' ? 'var(--primary)' : 'var(--text-muted)' }}></span>
                    </td>
                    <td style={{ padding: '16px', fontWeight: inq.status === 'unread' ? 700 : 400 }}>{inq.name}</td>
                    <td style={{ padding: '16px' }}>{inq.email}</td>
                    <td style={{ padding: '16px' }}>{inq.subject}</td>
                    <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(inq.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: '16px', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button onClick={() => handleViewInquiry && handleViewInquiry(inq)} className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {viewInquiryModal?.open && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="card" style={{ width: '90%', maxWidth: '600px', padding: '30px', position: 'relative' }}>
            <button onClick={() => setViewInquiryModal({ open: false, data: null })} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20}/></button>
            <h3 style={{ marginBottom: '20px' }}>Lead Details</h3>
            <div style={{ marginBottom: '16px' }}>
              <strong>From:</strong> {viewInquiryModal.data.name} ({viewInquiryModal.data.email})<br/>
              <strong>Date:</strong> {new Date(viewInquiryModal.data.created_at).toLocaleString()}
            </div>
            <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
              <strong>Subject:</strong> {viewInquiryModal.data.subject}<br/><br/>
              {viewInquiryModal.data.message}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <a href={`mailto:${viewInquiryModal.data.email}`} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={16}/> Reply</a>
              {handleToggleLeadStatus && (
                <button onClick={() => handleToggleLeadStatus(viewInquiryModal.data)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={16}/> Mark as {viewInquiryModal.data.status === 'unread' ? 'Read' : 'Unread'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
