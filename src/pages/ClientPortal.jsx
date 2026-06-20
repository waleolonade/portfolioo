import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  FolderOpen, DollarSign, Download, MessageSquare, Send, CheckCircle, 
  Clock, FileText, ArrowUpRight 
} from 'lucide-react';

export default function ClientPortal() {
  const [messages, setMessages] = useState([
    { sender: 'team', text: 'Hello, the Route Optimization API endpoints are fully deployed to the staging environment. Please review the docs and let us know your feedback.', time: '09:30 AM' },
    { sender: 'client', text: 'Thanks Marcus! I will inspect the API and test response payloads in Postman today.', time: '10:15 AM' }
  ]);
  const [inputMsg, setInputMsg] = useState('');

  const activeProject = {
    name: 'Hyperion Logistics optimization',
    progress: 75,
    milestone: 'Staging API Verification',
    due: 'July 15, 2026',
    hours: '142 hrs logged'
  };

  const files = [
    { name: 'Architecture_System_Specs.pdf', size: '2.4 MB', category: 'Specs' },
    { name: 'Staging_API_Postman_Collection.json', size: '420 KB', category: 'API Docs' },
    { name: 'Service_Level_Agreement_Executed.pdf', size: '1.8 MB', category: 'Contracts' }
  ];

  const invoices = [
    { id: 'INV-2026-089', date: 'June 01, 2026', amount: '$4,000.00', status: 'Paid' },
    { id: 'INV-2026-095', date: 'June 18, 2026', amount: '$4,000.00', status: 'Pending' }
  ];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    
    const clientMsg = { sender: 'client', text: inputMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, clientMsg]);
    setInputMsg('');
    
    // Auto simulated response from team after 1.5 seconds
    setTimeout(() => {
      const responseMsg = { 
        sender: 'team', 
        text: 'Received! Our engineers will review this message and respond within operational hours.', 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      };
      setMessages(prev => [...prev, responseMsg]);
    }, 1500);
  };

  return (
    <div className="page-container">
      <Navbar />
      <main style={{ flexGrow: 1, padding: '40px 0', textAlign: 'left' }}>
        <div className="container">
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }} className="portal-header-responsive">
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Client Workspace
              </span>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '8px' }}>
                Welcome, Logistics Logistics
              </h1>
            </div>
            <div className="badge badge-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              Project Code: #HL-094
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px' }} className="portal-grid">
            
            {/* Left Column: Progress & Invoices */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              
              {/* Project Card */}
              <div className="card" style={{ padding: '28px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FolderOpen size={20} style={{ color: 'var(--primary)' }} /> Project Delivery Status
                </h3>
                
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>{activeProject.name}</strong>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)' }}>{activeProject.progress}% Complete</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', borderRadius: '4px', backgroundColor: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                    <div style={{ width: `${activeProject.progress}%`, height: '100%', backgroundColor: 'var(--primary)', borderRadius: '4px', transition: 'width 0.8s ease' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', borderTop: '1px solid var(--border)', paddingTop: '20px' }} className="stats-row">
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Current Milestone</span>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{activeProject.milestone}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Target Release</span>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{activeProject.due}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Engineering Hours</span>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{activeProject.hours}</strong>
                  </div>
                </div>
              </div>

              {/* Asset Files Card */}
              <div className="card" style={{ padding: '28px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FileText size={20} style={{ color: 'var(--secondary)' }} /> Project Files & Assets
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {files.map((file, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className="badge" style={{ fontSize: '0.7rem' }}>{file.category}</span>
                        <div>
                          <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block' }}>{file.name}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{file.size}</span>
                        </div>
                      </div>
                      <button onClick={() => alert(`Initiating mock download: ${file.name}`)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--primary)' }}>
                        <Download size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Invoices Card */}
              <div className="card" style={{ padding: '28px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <DollarSign size={20} style={{ color: 'var(--accent)' }} /> Invoice Records
                </h3>
                
                <div className="table-responsive" style={{ border: 'none', margin: 0 }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Invoice ID</th>
                        <th>Issue Date</th>
                        <th>Billing Value</th>
                        <th>Payment Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv, idx) => (
                        <tr key={idx}>
                          <td><strong>{inv.id}</strong></td>
                          <td>{inv.date}</td>
                          <td>{inv.amount}</td>
                          <td>
                            <span style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              backgroundColor: inv.status === 'Paid' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                              color: inv.status === 'Paid' ? 'var(--success)' : 'var(--accent)'
                            }}>
                              {inv.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Right Column: Live Chat Widget */}
            <div className="card" style={{ padding: '28px', height: '580px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MessageSquare size={20} style={{ color: 'var(--primary)' }} /> Engineering Channel
              </h3>
              
              {/* Messages thread */}
              <div style={{
                flexGrow: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                padding: '10px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-primary)',
                marginBottom: '16px'
              }}>
                {messages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    style={{
                      alignSelf: msg.sender === 'client' ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: msg.sender === 'client' ? 'var(--primary)' : 'var(--bg-secondary)',
                      color: msg.sender === 'client' ? 'white' : 'var(--text-primary)',
                      border: msg.sender === 'client' ? 'none' : '1px solid var(--border)',
                      fontSize: '0.9rem',
                      lineHeight: 1.4
                    }}>
                      {msg.text}
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px', textAlign: msg.sender === 'client' ? 'right' : 'left' }}>
                      {msg.time}
                    </span>
                  </div>
                ))}
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={inputMsg}
                  onChange={e => setInputMsg(e.target.value)}
                  className="form-control"
                  placeholder="Ask a question or request deploy review..."
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '10px' }}>
                  <Send size={16} />
                </button>
              </form>
            </div>

          </div>

        </div>
      </main>
      <Footer />
      <style>{`
        @media (max-width: 768px) {
          .portal-header-responsive {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px !important;
          }
          .portal-grid {
            grid-template-columns: 1fr !important;
          }
          .stats-row {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
        }
      `}</style>
    </div>
  );
}
