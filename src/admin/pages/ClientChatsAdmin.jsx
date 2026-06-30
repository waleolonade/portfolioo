import { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Send, User, Clock, ArrowRight, ShieldCheck, 
  CheckCircle, Circle, RefreshCw, Folder, FileText, DollarSign, 
  Download, Upload, Sparkles 
} from 'lucide-react';
import { API_BASE_URL } from '../../config';

export default function ClientChatsAdmin() {
  const adminToken = localStorage.getItem('adminToken');
  const [conversations, setConversations] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [selectedClientName, setSelectedClientName] = useState('');
  
  // Active selection states
  const [messages, setMessages] = useState([]);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [files, setFiles] = useState([]);
  
  // UI States
  const [rightTab, setRightTab] = useState('chat'); // 'chat', 'invoices', 'files'
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const chatContainerRef = useRef(null);
  const isFirstLoadRef = useRef(true);
  const adminJustSentRef = useRef(false);

  // Fetch all active client conversations
  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/chat.php`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  };

  // Fetch specific client's chat history
  const fetchClientChat = async (clientId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/chat.php?client_id=${clientId}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Error fetching client chat:', err);
    }
  };

  // Fetch specific client's project, task checklist, invoices, and files
  const fetchClientProjectData = async (clientId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/tasks.php?client_id=${clientId}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProject(data.project);
        setTasks(data.tasks);
        setInvoices(data.invoices || []);
        setFiles(data.files || []);
      }
    } catch (err) {
      console.error('Error fetching client project:', err);
    }
  };

  // Initialize and load conversation directory
  useEffect(() => {
    fetchConversations();
  }, []);

  // Poll active client details
  useEffect(() => {
    if (selectedClientId) {
      fetchClientChat(selectedClientId);
      fetchClientProjectData(selectedClientId);

      // Start polling for messages
      const interval = setInterval(() => {
        fetchClientChat(selectedClientId);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [selectedClientId]);

  // Reset first load when selected client changes
  useEffect(() => {
    isFirstLoadRef.current = true;
  }, [selectedClientId]);

  // Scroll chat container to bottom ONLY on client change or admin sent reply
  useEffect(() => {
    if (chatContainerRef.current && messages.length > 0) {
      const container = chatContainerRef.current;
      if (isFirstLoadRef.current || adminJustSentRef.current) {
        container.scrollTop = container.scrollHeight;
        isFirstLoadRef.current = false;
        adminJustSentRef.current = false;
      }
    }
  }, [messages, selectedClientId]);

  const handleSelectClient = (client) => {
    setSelectedClientId(client.client_id);
    setSelectedClientName(client.client_username);
    setMessages([]);
    setProject(null);
    setTasks([]);
    setInvoices([]);
    setFiles([]);
    setRightTab('chat');
  };

  // Send reply to client
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedClientId) return;

    const text = replyText;
    setReplyText('');
    adminJustSentRef.current = true;

    // Pre-insert reply for latency-free experience
    const localReply = {
      sender_id: 9999, // placeholder admin id
      message: text,
      sender_name: 'Admin',
      is_bot: 0,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, localReply]);

    try {
      const res = await fetch(`${API_BASE_URL}/chat.php`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          message: text,
          receiver_id: selectedClientId
        })
      });

      if (res.ok) {
        fetchClientChat(selectedClientId);
        fetchConversations();
      }
    } catch (err) {
      console.error('Error sending reply:', err);
    }
  };

  // Toggle checklist tasks
  const handleToggleTaskAdmin = async (taskId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/tasks.php`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ task_id: taskId })
      });
      if (res.ok) {
        fetchClientProjectData(selectedClientId);
        fetchClientChat(selectedClientId);
      }
    } catch (err) {
      console.error('Error toggling task as admin:', err);
    }
  };

  // Toggle invoices paid/pending status
  const handleToggleInvoiceStatus = async (invoiceId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/tasks.php`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ invoice_id: invoiceId })
      });
      if (res.ok) {
        fetchClientProjectData(selectedClientId);
        fetchClientChat(selectedClientId);
      }
    } catch (err) {
      console.error('Error updating invoice status:', err);
    }
  };

  // Admin upload file to client workspace
  const handleAdminFileUpload = async (e, category = 'Deliverable') => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile || !selectedClientId) return;

    const formData = new FormData();
    formData.append('file', uploadedFile);
    formData.append('category', category);
    formData.append('client_id', selectedClientId);

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/upload_file.php`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${adminToken}`
        },
        body: formData
      });

      if (res.ok) {
        await fetchClientProjectData(selectedClientId);
        await fetchClientChat(selectedClientId);
      } else {
        const errData = await res.json();
        alert(errData.message || 'File upload failed.');
      }
    } catch (err) {
      console.error('Error admin uploading file:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchConversations();
    if (selectedClientId) {
      await Promise.all([fetchClientChat(selectedClientId), fetchClientProjectData(selectedClientId)]);
    }
    setTimeout(() => setRefreshing(false), 500);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px', height: 'calc(100vh - 120px)' }}>
      
      {/* Sidebar: Conversation List */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '16px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={16} /> Client Chats
          </h4>
          <button 
            onClick={handleManualRefresh} 
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
            disabled={refreshing}
          >
            <RefreshCw size={14} className={refreshing ? 'spin-anim' : ''} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {conversations.length > 0 ? (
            conversations.map((conv) => {
              const isSelected = selectedClientId === conv.client_id;
              return (
                <div 
                  key={conv.client_id}
                  onClick={() => handleSelectClient(conv)}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                    border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                    textAlign: 'left'
                  }}
                  className="conversation-item"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {conv.client_username}
                    </strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {conv.project_code || 'No code'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>
                    {conv.last_message || 'No messages yet'}
                  </p>
                </div>
              );
            })
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
              No registered client conversations.
            </p>
          )}
        </div>
      </div>

      {/* Main Workspace */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {selectedClientId ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '20px', flexGrow: 1, height: '100%' }}>
            
            {/* Left Box: Active Messages */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '20px', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--border)', marginBottom: '16px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                    Chat with {selectedClientName}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Admin Response Stream | Polling (3s)
                  </span>
                </div>
                <span className="badge badge-primary">{project ? project.project_code : ''}</span>
              </div>

              {/* Chat Messages */}
              <div 
                ref={chatContainerRef}
                style={{
                  flexGrow: 1,
                  overflowY: 'auto',
                  padding: '12px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-primary)',
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                {messages.map((msg, idx) => {
                  const isSystemLog = msg.sender_name === 'System Logger';
                  const isCurrentAdmin = msg.sender_name !== selectedClientName && !isSystemLog;
                  
                  if (isSystemLog) {
                    return (
                      <div key={idx} style={{ alignSelf: 'center', margin: '4px 0', maxWidth: '90%' }}>
                        <div style={{
                          padding: '4px 10px',
                          borderRadius: '16px',
                          backgroundColor: 'rgba(59, 130, 246, 0.05)',
                          border: '1px dashed rgba(59, 130, 246, 0.2)',
                          color: 'var(--secondary)',
                          fontSize: '0.75rem',
                          textAlign: 'center'
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
                        alignSelf: isCurrentAdmin ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                        textAlign: 'left'
                      }}
                    >
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px', marginLeft: '4px' }}>
                        {msg.sender_name} {msg.is_bot === 1 ? '(AI Response)' : ''}
                      </span>
                      <div style={{
                        padding: '10px 14px',
                        borderRadius: '12px',
                        borderTopRightRadius: isCurrentAdmin ? '2px' : '12px',
                        borderTopLeftRadius: isCurrentAdmin ? '12px' : '2px',
                        backgroundColor: isCurrentAdmin ? 'var(--primary)' : 'var(--bg-secondary)',
                        color: isCurrentAdmin ? 'white' : 'var(--text-primary)',
                        border: isCurrentAdmin ? 'none' : '1px solid var(--border)',
                        fontSize: '0.85rem',
                        lineHeight: 1.4,
                        whiteSpace: 'pre-line'
                      }}>
                        {msg.message}
                      </div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px', textAlign: isCurrentAdmin ? 'right' : 'left' }}>
                        {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Message Typing Panel */}
              <form onSubmit={handleSendReply} style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="form-control"
                  placeholder={`Reply to ${selectedClientName}...`}
                  style={{ fontSize: '0.875rem' }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 16px' }}>
                  <Send size={16} />
                </button>
              </form>
            </div>

            {/* Right Box: Upgraded Tabbed Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
              
              {/* Project Title Card */}
              <div className="card" style={{ padding: '16px', textAlign: 'left' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Folder size={16} style={{ color: 'var(--primary)' }} /> Workspace Parameters
                </h4>
                {project ? (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{project.title}</strong>
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{project.progress}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
                      <div style={{ width: `${project.progress}%`, height: '100%', backgroundColor: 'var(--primary)' }} />
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Current Stage: <strong>{project.status}</strong> | Target: <strong>{project.target_date}</strong>
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Loading parameters...</p>
                )}
              </div>

              {/* Tabs Menu */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, padding: '20px', overflowY: 'auto' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '16px', gap: '10px' }}>
                  <button
                    onClick={() => setRightTab('chat')}
                    style={{
                      padding: '8px 12px',
                      border: 'none',
                      background: 'none',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      color: rightTab === 'chat' ? 'var(--primary)' : 'var(--text-muted)',
                      borderBottom: rightTab === 'chat' ? '2px solid var(--primary)' : '2px solid transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <ShieldCheck size={14} /> Checklist
                  </button>

                  <button
                    onClick={() => setRightTab('invoices')}
                    style={{
                      padding: '8px 12px',
                      border: 'none',
                      background: 'none',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      color: rightTab === 'invoices' ? 'var(--primary)' : 'var(--text-muted)',
                      borderBottom: rightTab === 'invoices' ? '2px solid var(--primary)' : '2px solid transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <DollarSign size={14} /> Invoices
                  </button>

                  <button
                    onClick={() => setRightTab('files')}
                    style={{
                      padding: '8px 12px',
                      border: 'none',
                      background: 'none',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      color: rightTab === 'files' ? 'var(--primary)' : 'var(--text-muted)',
                      borderBottom: rightTab === 'files' ? '2px solid var(--primary)' : '2px solid transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <FileText size={14} /> Brief & Files
                  </button>
                </div>

                {/* Tab 1: Checklist Control */}
                {rightTab === 'chat' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
                    {tasks.length > 0 ? (
                      tasks.map((task) => (
                        <div 
                          key={task.id}
                          style={{ 
                            padding: '12px', 
                            border: '1px solid var(--border)', 
                            borderRadius: 'var(--radius-sm)', 
                            backgroundColor: 'var(--bg-secondary)',
                            fontSize: '0.85rem' 
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                            <button 
                              onClick={() => handleToggleTaskAdmin(task.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: task.status === 'Completed' ? 'var(--success)' : 'var(--text-muted)' }}
                            >
                              {task.status === 'Completed' ? <CheckCircle size={18} /> : <Circle size={18} />}
                            </button>
                            
                            <div style={{ flexGrow: 1 }}>
                              <strong style={{ color: 'var(--text-primary)', textDecoration: task.status === 'Completed' ? 'line-through' : 'none' }}>
                                {task.title}
                              </strong>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                                Action: {task.action_type} | Due: {task.due_date}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No milestones generated.</p>
                    )}
                  </div>
                )}

                {/* Tab 2: Billing & Invoices */}
                {rightTab === 'invoices' && (
                  <div style={{ textAlign: 'left' }}>
                    <h5 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px' }}>Client Invoices</h5>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {invoices.length > 0 ? (
                        invoices.map((inv) => (
                          <div 
                            key={inv.id}
                            style={{ 
                              padding: '12px', 
                              border: '1px solid var(--border)', 
                              borderRadius: 'var(--radius-sm)', 
                              backgroundColor: 'var(--bg-secondary)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              fontSize: '0.85rem'
                            }}
                          >
                            <div>
                              <strong>{inv.invoice_code}</strong>
                              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                Amount: ${parseFloat(inv.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} | Due: {inv.due_date}
                              </span>
                            </div>
                            
                            <button
                              onClick={() => handleToggleInvoiceStatus(inv.id)}
                              className={`btn ${inv.status === 'Paid' ? 'btn-primary' : 'btn-outline'}`}
                              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                            >
                              {inv.status === 'Paid' ? 'Paid' : 'Mark Paid'}
                            </button>
                          </div>
                        ))
                      ) : (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No invoice logs generated.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Tab 3: Brief & File Repository */}
                {rightTab === 'files' && (
                  <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {/* Project Brief Panel */}
                    <div>
                      <h5 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '6px' }}>Project Brief Summary</h5>
                      <div style={{ padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-secondary)', fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'pre-line' }}>
                        {project?.brief_details || 'No textual project brief specifications submitted yet.'}
                      </div>
                    </div>

                    {/* Project Feedback Panel */}
                    <div>
                      <h5 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '6px' }}>Client Signoff Feedback</h5>
                      <div style={{ padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-secondary)', fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'pre-line' }}>
                        {project?.feedback_details || 'No final signoff reviews submitted yet.'}
                      </div>
                    </div>

                    {/* Files List and Upload Panel */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h5 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>Client Documents</h5>
                        
                        <label className="btn btn-outline" style={{ padding: '2px 8px', fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', margin: 0 }}>
                          <Upload size={12} /> Upload File
                          <input 
                            type="file" 
                            onChange={(e) => handleAdminFileUpload(e, 'Deliverable')} 
                            style={{ display: 'none' }} 
                            disabled={loading}
                          />
                        </label>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {files.length > 0 ? (
                          files.map((file) => (
                            <div 
                              key={file.id}
                              style={{ 
                                padding: '10px', 
                                border: '1px solid var(--border)', 
                                borderRadius: 'var(--radius-sm)', 
                                backgroundColor: 'var(--bg-secondary)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '0.8rem' 
                              }}
                            >
                              <div>
                                <span className="badge" style={{ fontSize: '0.65rem', marginRight: '6px' }}>{file.category}</span>
                                <strong>{file.filename}</strong>
                                <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                  Size: {file.file_size}
                                </span>
                              </div>

                              <a 
                                href={`${API_BASE_URL.replace('/api', '')}/${file.file_url}`} 
                                target="_blank" 
                                rel="noreferrer" 
                                download
                                style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center' }}
                              >
                                <Download size={14} />
                              </a>
                            </div>
                          ))
                        ) : (
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No client uploads found.</p>
                        )}
                      </div>
                    </div>

                  </div>
                )}

              </div>

            </div>

          </div>
        ) : (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, padding: '40px', color: 'var(--text-muted)' }}>
            <User size={48} style={{ marginBottom: '14px', opacity: 0.5 }} />
            <h4>Select a Client Conversation</h4>
            <p style={{ fontSize: '0.85rem' }}>Select a client from the left panel to start messaging and manage their milestones.</p>
          </div>
        )}
      </div>

      <style>{`
        .spin-anim {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
