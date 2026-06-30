import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ClientAuth from './ClientAuth';
import { 
  FolderOpen, DollarSign, Download, MessageSquare, Send, 
  FileText, CheckCircle2, Circle, LogOut, ArrowRight, Clock, 
  Sparkles, Upload, ShieldCheck, RefreshCw
} from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function ClientPortal() {
  const [token, setToken] = useState(localStorage.getItem('clientToken') || null);
  const [clientUser, setClientUser] = useState(JSON.parse(localStorage.getItem('clientUser') || 'null'));
  
  // Data States
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [files, setFiles] = useState([]);
  
  // UI States
  const [activeTab, setActiveTab] = useState('admin'); // 'admin' or 'bot'
  const [inputMsg, setInputMsg] = useState('');
  const [taskInputs, setTaskInputs] = useState({ briefText: '', feedbackText: '' });
  const [loading, setLoading] = useState(false);
  const [uploadingTaskId, setUploadingTaskId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const chatContainerRef = useRef(null);
  const isFirstLoadRef = useRef(true);
  const clientJustSentRef = useRef(false);

  // Authenticate user successfully
  const handleAuthSuccess = (newToken, newUser) => {
    setToken(newToken);
    setClientUser(newUser);
  };

  // Logout client
  const handleLogout = () => {
    localStorage.removeItem('clientToken');
    localStorage.removeItem('clientUser');
    setToken(null);
    setClientUser(null);
  };

  // Fetch Project & Tasks & Invoices & Files
  const fetchData = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/tasks.php`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      const data = await res.json();
      if (data.project) setProject(data.project);
      if (data.tasks) setTasks(data.tasks);
      if (data.invoices) setInvoices(data.invoices);
      if (data.files) setFiles(data.files);
    } catch (err) {
      console.error('Error fetching portal data:', err);
    }
  };

  // Fetch Chat Messages
  const fetchMessages = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/chat.php`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  // Initialize and Poll
  useEffect(() => {
    if (token) {
      fetchData();
      fetchMessages();

      // Poll chat messages every 3 seconds for simulated real-time response
      const interval = setInterval(() => {
        fetchMessages();
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [token]);

  // Reset first load flag on tab switch
  useEffect(() => {
    isFirstLoadRef.current = true;
  }, [activeTab]);

  // Scroll Chat container to bottom ONLY on first load or when sending message
  useEffect(() => {
    if (chatContainerRef.current && messages.length > 0) {
      const container = chatContainerRef.current;
      if (isFirstLoadRef.current || clientJustSentRef.current) {
        container.scrollTop = container.scrollHeight;
        isFirstLoadRef.current = false;
        clientJustSentRef.current = false;
      }
    }
  }, [messages, activeTab]);

  // Handle Task Action (Completing tasks on backend)
  const handleExecuteTask = async (taskId, actionType) => {
    setUploadingTaskId(taskId);
    
    // Simulate slight engineering delay for premium micro-experience
    setTimeout(async () => {
      try {
        const payload = { task_id: taskId };
        if (actionType === 'brief') {
          payload.brief_text = taskInputs.briefText;
        } else if (actionType === 'feedback') {
          payload.feedback_text = taskInputs.feedbackText;
        }

        const res = await fetch(`${API_BASE_URL}/tasks.php`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          // Reset inputs and re-fetch dashboard
          setTaskInputs(prev => ({ ...prev, briefText: '', feedbackText: '' }));
          await fetchData();
          await fetchMessages();
        }
      } catch (err) {
        console.error('Error completing task:', err);
      } finally {
        setUploadingTaskId(null);
      }
    }, 1000);
  };

  // Handle file uploads (Specs, general, briefs)
  const handleFileUpload = async (e, taskId = 0, category = 'Document') => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    const formData = new FormData();
    formData.append('file', uploadedFile);
    formData.append('category', category);
    if (taskId > 0) {
      formData.append('task_id', taskId);
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/upload_file.php`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        await fetchData();
        await fetchMessages();
      } else {
        const errData = await res.json();
        alert(errData.message || 'File upload failed.');
      }
    } catch (err) {
      console.error('File upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const msgToSend = inputMsg;
    setInputMsg('');
    clientJustSentRef.current = true;

    // Pre-inject client message locally for latency-free aesthetics
    const localMessage = {
      sender_id: clientUser.id,
      message: msgToSend,
      sender_name: clientUser.username,
      is_bot: 0,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, localMessage]);

    try {
      const res = await fetch(`${API_BASE_URL}/chat.php`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          message: msgToSend, 
          is_bot: activeTab === 'bot' ? 1 : 0 
        })
      });

      if (res.ok) {
        fetchMessages();
        if (activeTab === 'bot') {
          // Immediately poll chatbot response
          setTimeout(() => {
            fetchMessages();
          }, 1000);
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchData(), fetchMessages()]);
    setTimeout(() => setRefreshing(false), 500);
  };

  // Filter messages based on active tab channel
  const filteredMessages = messages.filter(msg => {
    const isBotSenderOrRecipient = msg.is_bot === 1 || msg.sender_name === 'Brainfeels AI Copilot';
    if (activeTab === 'bot') {
      return isBotSenderOrRecipient || (msg.sender_id === clientUser?.id && msg.message.toLowerCase().includes('/bot'));
    } else {
      return !isBotSenderOrRecipient;
    }
  });

  // Return Auth screen if token is missing
  if (!token || !clientUser) {
    return <ClientAuth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="page-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />
      
      <main style={{ flexGrow: 1, padding: '40px 0', textAlign: 'left' }}>
        <div className="container">
          
          {/* Header Panel */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }} className="portal-header-responsive">
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Client Workspace
              </span>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '8px' }}>
                Welcome, {clientUser.username}
              </h1>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                onClick={handleManualRefresh} 
                className="btn btn-outline" 
                style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                disabled={refreshing}
              >
                <RefreshCw size={14} className={refreshing ? 'spin-anim' : ''} />
                Refresh
              </button>
              
              <div className="badge badge-primary" style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: 700 }}>
                Project: {project ? project.project_code : 'Loading...'}
              </div>
              
              <button 
                onClick={handleLogout} 
                className="btn btn-outline" 
                style={{ color: 'var(--error)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <LogOut size={14} /> Log Out
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px' }} className="portal-grid">
            
            {/* Left Column: Progress, Interactive Tasks & Documents */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              
              {/* Project Card */}
              <div className="card" style={{ padding: '28px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FolderOpen size={20} style={{ color: 'var(--primary)' }} /> Project Delivery Status
                </h3>
                
                {project ? (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>{project.title}</strong>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)' }}>{project.progress}% Complete</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', borderRadius: '4px', backgroundColor: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                      <div style={{ width: `${project.progress}%`, height: '100%', backgroundColor: 'var(--primary)', borderRadius: '4px', transition: 'width 0.8s ease' }} />
                    </div>
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)' }}>Loading active project parameters...</p>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', borderTop: '1px solid var(--border)', paddingTop: '20px' }} className="stats-row">
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Current Phase</span>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{project ? project.status : 'Loading...'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Target Release</span>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{project ? project.target_date : 'Loading...'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Environment</span>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--success)' }}>Staging Online</strong>
                  </div>
                </div>
              </div>

              {/* Checklist Card (User Performs tasks here!) */}
              <div className="card" style={{ padding: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ShieldCheck size={20} style={{ color: 'var(--success)' }} /> Action Items Checklist
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Perform actions to push milestones
                  </span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {tasks.length > 0 ? (
                    tasks.map((task) => (
                      <div 
                        key={task.id} 
                        style={{ 
                          padding: '20px', 
                          border: '1px solid var(--border)', 
                          borderRadius: 'var(--radius-md)', 
                          backgroundColor: task.status === 'Completed' ? 'rgba(16, 185, 129, 0.03)' : 'var(--bg-secondary)',
                          position: 'relative'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                          <button 
                            onClick={() => handleExecuteTask(task.id, task.action_type)}
                            disabled={uploadingTaskId === task.id || loading}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: task.status === 'Completed' ? 'var(--success)' : 'var(--text-muted)' }}
                          >
                            {task.status === 'Completed' ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                          </button>
                          
                          <div style={{ flexGrow: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <strong style={{ fontSize: '1rem', color: 'var(--text-primary)', textDecoration: task.status === 'Completed' ? 'line-through' : 'none' }}>
                                {task.title}
                              </strong>
                              <span className="badge" style={{ fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={10} /> {task.due_date}
                              </span>
                            </div>
                            
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '6px', marginBottom: '12px' }}>
                              {task.description}
                            </p>

                            {/* Interactive Task Execution Options */}
                            {task.status === 'Pending' && (
                              <div style={{ marginTop: '14px', borderTop: '1px dashed var(--border)', paddingTop: '14px' }}>
                                
                                {task.action_type === 'brief' && (
                                  <div>
                                    <textarea
                                      value={taskInputs.briefText}
                                      onChange={(e) => setTaskInputs(prev => ({ ...prev, briefText: e.target.value }))}
                                      placeholder="Provide details about your project features, branding, target audience..."
                                      className="form-control"
                                      style={{ height: '80px', fontSize: '0.85rem', marginBottom: '10px' }}
                                    />
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                      <button
                                        onClick={() => handleExecuteTask(task.id, 'brief')}
                                        disabled={!taskInputs.briefText.trim() || uploadingTaskId === task.id || loading}
                                        className="btn btn-primary"
                                        style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                                      >
                                        Submit Requirements Text
                                      </button>
                                      
                                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>or</span>
                                      
                                      <label className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '0.8rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                                        <Upload size={14} /> Upload Specification PDF
                                        <input 
                                          type="file" 
                                          onChange={(e) => handleFileUpload(e, task.id, 'Specs')} 
                                          style={{ display: 'none' }} 
                                          disabled={loading}
                                        />
                                      </label>
                                    </div>
                                  </div>
                                )}

                                {task.action_type === 'upload' && (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                      <strong>Instruction / Request Reason:</strong>
                                      <span style={{ display: 'block', padding: '6px 10px', marginTop: '4px', backgroundColor: 'rgba(255,255,255,0.03)', borderLeft: '3px solid var(--accent)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                                        {task.description}
                                      </span>
                                    </p>
                                    <label className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', width: 'fit-content', margin: 0 }}>
                                      <Upload size={14} /> Upload Requested Document
                                      <input 
                                        type="file" 
                                        onChange={(e) => handleFileUpload(e, task.id, 'Specs')} 
                                        style={{ display: 'none' }} 
                                        disabled={loading}
                                      />
                                    </label>
                                  </div>
                                )}

                                {task.action_type === 'mockup' && (
                                  <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                      onClick={() => alert('Launching mockup dashboard in staging environment (mock preview)...')}
                                      className="btn btn-outline"
                                      style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                                    >
                                      View Mockups
                                    </button>
                                    <button
                                      onClick={() => handleExecuteTask(task.id, 'mockup')}
                                      disabled={uploadingTaskId === task.id || loading}
                                      className="btn btn-primary"
                                      style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                                    >
                                      {uploadingTaskId === task.id ? 'Approving...' : 'Approve Design Layout'}
                                    </button>
                                  </div>
                                )}

                                {task.action_type === 'payment' && (
                                  <div>
                                    <button
                                      onClick={() => handleExecuteTask(task.id, 'payment')}
                                      disabled={uploadingTaskId === task.id || loading}
                                      className="btn btn-primary"
                                      style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                                    >
                                      <DollarSign size={14} /> {uploadingTaskId === task.id ? 'Processing...' : 'Simulate Deposit Payment'}
                                    </button>
                                  </div>
                                )}

                                {task.action_type === 'feedback' && (
                                  <div>
                                    <input
                                      type="text"
                                      value={taskInputs.feedbackText}
                                      onChange={(e) => setTaskInputs(prev => ({ ...prev, feedbackText: e.target.value }))}
                                      placeholder="Type your final review comments..."
                                      className="form-control"
                                      style={{ fontSize: '0.85rem', marginBottom: '10px' }}
                                    />
                                    <button
                                      onClick={() => handleExecuteTask(task.id, 'feedback')}
                                      disabled={!taskInputs.feedbackText.trim() || uploadingTaskId === task.id || loading}
                                      className="btn btn-primary"
                                      style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                                    >
                                      {uploadingTaskId === task.id ? 'Submitting...' : 'Signoff Project'}
                                    </button>
                                  </div>
                                )}

                              </div>
                            )}
                            
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: 'var(--text-muted)' }}>Loading checklist guidelines...</p>
                  )}
                </div>
              </div>

              {/* Asset Files Card */}
              <div className="card" style={{ padding: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={20} style={{ color: 'var(--secondary)' }} /> Project Files & Assets
                  </h3>
                  
                  {/* File Upload Trigger */}
                  <label className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                    <Upload size={12} /> Upload File
                    <input 
                      type="file" 
                      onChange={(e) => handleFileUpload(e, 0, 'General')} 
                      style={{ display: 'none' }} 
                      disabled={loading}
                    />
                  </label>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {files.length > 0 ? (
                    files.map((file, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-primary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span className="badge" style={{ fontSize: '0.7rem' }}>{file.category}</span>
                          <div>
                            <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block' }}>{file.filename}</strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{file.file_size}</span>
                          </div>
                        </div>
                        <a 
                          href={`${API_BASE_URL.replace('/api', '')}/${file.file_url}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          download
                          style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--primary)', display: 'flex', alignItems: 'center' }}
                        >
                          <Download size={18} />
                        </a>
                      </div>
                    ))
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No workspace files uploaded.</p>
                  )}
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
                        <th>Balance Due</th>
                        <th>Payment Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.length > 0 ? (
                        invoices.map((inv, idx) => (
                          <tr key={idx}>
                            <td><strong>{inv.invoice_code}</strong></td>
                            <td>{inv.created_at ? new Date(inv.created_at).toLocaleDateString() : 'N/A'}</td>
                            <td>{inv.currency || '$'}{parseFloat(inv.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td style={{ color: parseFloat(inv.balance_due) > 0 ? 'var(--accent)' : 'var(--success)', fontWeight: 'bold' }}>
                              {inv.currency || '$'}{parseFloat(inv.balance_due || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
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
                            <td>
                              <a 
                                href={`${API_BASE_URL}/download_receipt.php?invoice_id=${inv.id}&token=${token}`}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-outline"
                                style={{ padding: '4px 10px', fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '4px', margin: 0 }}
                              >
                                <Download size={12} /> Receipt PDF
                              </a>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No invoices found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Right Column: Dynamic Live Chat & Chatbot panel */}
            <div className="card" style={{ padding: '28px', height: '620px', display: 'flex', flexDirection: 'column' }}>
              
              {/* Channel Tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '20px', gap: '10px' }}>
                <button
                  onClick={() => setActiveTab('admin')}
                  style={{
                    padding: '10px 16px',
                    border: 'none',
                    background: 'none',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    color: activeTab === 'admin' ? 'var(--primary)' : 'var(--text-muted)',
                    borderBottom: activeTab === 'admin' ? '2px solid var(--primary)' : '2px solid transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <MessageSquare size={16} /> Admin Support
                </button>

                <button
                  onClick={() => setActiveTab('bot')}
                  style={{
                    padding: '10px 16px',
                    border: 'none',
                    background: 'none',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    color: activeTab === 'bot' ? 'var(--primary)' : 'var(--text-muted)',
                    borderBottom: activeTab === 'bot' ? '2px solid var(--primary)' : '2px solid transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Sparkles size={16} style={{ color: 'var(--accent)' }} /> AI Copilot Chatbot
                </button>
              </div>
              
              {/* Messages thread */}
              <div 
                ref={chatContainerRef}
                style={{
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
                }}
              >
                {filteredMessages.length > 0 ? (
                  filteredMessages.map((msg, idx) => {
                    const isSystemLog = msg.sender_name === 'System Logger';
                    const isCurrentUser = msg.sender_id === clientUser.id;
                    
                    if (isSystemLog) {
                      return (
                        <div key={idx} style={{ alignSelf: 'center', margin: '6px 0', maxWidth: '90%' }}>
                          <div style={{
                            padding: '6px 12px',
                            borderRadius: '16px',
                            backgroundColor: 'rgba(59, 130, 246, 0.05)',
                            border: '1px dashed rgba(59, 130, 246, 0.2)',
                            color: 'var(--secondary)',
                            fontSize: '0.75rem',
                            textAlign: 'center',
                            fontWeight: 600
                          }}>
                            {msg.message}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div 
                        key={idx} 
                        style={{
                          alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
                          maxWidth: '85%',
                          textAlign: 'left'
                        }}
                      >
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px', marginLeft: '4px' }}>
                          {msg.sender_name}
                        </span>
                        <div style={{
                          padding: '10px 14px',
                          borderRadius: '12px',
                          borderTopRightRadius: isCurrentUser ? '2px' : '12px',
                          borderTopLeftRadius: isCurrentUser ? '12px' : '2px',
                          backgroundColor: isCurrentUser ? 'var(--primary)' : 'var(--bg-secondary)',
                          color: isCurrentUser ? 'white' : 'var(--text-primary)',
                          border: isCurrentUser ? 'none' : '1px solid var(--border)',
                          fontSize: '0.85rem',
                          lineHeight: 1.4,
                          whiteSpace: 'pre-line'
                        }}>
                          {msg.message}
                        </div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px', textAlign: isCurrentUser ? 'right' : 'left' }}>
                          {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                    {activeTab === 'bot' ? (
                      <>
                        <Sparkles size={28} style={{ color: 'var(--accent)', marginBottom: '10px' }} />
                        <p style={{ fontSize: '0.85rem' }}>Ask the AI project assistant about your tasks, project progress or rate details.</p>
                      </>
                    ) : (
                      <>
                        <MessageSquare size={28} style={{ color: 'var(--primary)', marginBottom: '10px' }} />
                        <p style={{ fontSize: '0.85rem' }}>No messages in direct line. Send a message to coordinate with Marcus Vance.</p>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={inputMsg}
                  onChange={e => setInputMsg(e.target.value)}
                  className="form-control"
                  placeholder={activeTab === 'bot' ? "Ask AI Copilot (e.g. 'project status', 'pending tasks')..." : "Message Marcus Vance..."}
                  style={{ fontSize: '0.875rem' }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 14px' }}>
                  <Send size={16} />
                </button>
              </form>
            </div>

          </div>

        </div>
      </main>
      
      <Footer />
      <style>{`
        .spin-anim {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
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
