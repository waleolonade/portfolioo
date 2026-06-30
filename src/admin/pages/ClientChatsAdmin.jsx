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
  const [rightTab, setRightTab] = useState('chat'); // 'chat', 'invoices', 'files', 'receipt_settings'
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const chatContainerRef = useRef(null);
  const isFirstLoadRef = useRef(true);
  const adminJustSentRef = useRef(false);

  const [receiptSettings, setReceiptSettings] = useState(null);

  // Create Invoice states
  const [newInvoiceCode, setNewInvoiceCode] = useState('');
  const [newInvoiceAmount, setNewInvoiceAmount] = useState('');
  const [newInvoiceBalance, setNewInvoiceBalance] = useState('');
  const [newInvoiceCurrency, setNewInvoiceCurrency] = useState('$');
  const [newInvoiceDueDate, setNewInvoiceDueDate] = useState('');
  const [newInvoiceStatus, setNewInvoiceStatus] = useState('Pending');

  // Edit Invoice states
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);
  const [editInvoiceCode, setEditInvoiceCode] = useState('');
  const [editInvoiceAmount, setEditInvoiceAmount] = useState('');
  const [editInvoiceBalance, setEditInvoiceBalance] = useState('');
  const [editInvoiceCurrency, setEditInvoiceCurrency] = useState('$');
  const [editInvoiceDueDate, setEditInvoiceDueDate] = useState('');
  const [editInvoiceStatus, setEditInvoiceStatus] = useState('Pending');

  // Request new file states
  const [requestFileCategory, setRequestFileCategory] = useState('Specs');
  const [requestFileReason, setRequestFileReason] = useState('');

  // Admin file upload states
  const [adminUploadCategory, setAdminUploadCategory] = useState('Specs');
  const [adminSelectedFile, setAdminSelectedFile] = useState(null);

  // Edit Project Target Date states
  const [editingTargetDate, setEditingTargetDate] = useState(false);
  const [newTargetDate, setNewTargetDate] = useState('');

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
        setReceiptSettings(data.receipt_settings || null);
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

  // Create new invoice record
  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!newInvoiceAmount || !newInvoiceDueDate || !selectedClientId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/tasks.php`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          action: 'invoice_create',
          client_id: selectedClientId,
          amount: parseFloat(newInvoiceAmount),
          balance_due: parseFloat(newInvoiceBalance || 0),
          currency: newInvoiceCurrency,
          due_date: newInvoiceDueDate,
          status: newInvoiceStatus
        })
      });
      if (res.ok) {
        setNewInvoiceCode('');
        setNewInvoiceAmount('');
        setNewInvoiceBalance('');
        setNewInvoiceCurrency('$');
        setNewInvoiceDueDate('');
        setNewInvoiceStatus('Pending');
        fetchClientProjectData(selectedClientId);
      }
    } catch (err) {
      console.error('Error creating invoice:', err);
    }
  };

  // Update existing invoice record
  const handleUpdateInvoice = async (e) => {
    e.preventDefault();
    if (!editInvoiceCode || !editInvoiceAmount || !editInvoiceDueDate || !editingInvoiceId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/tasks.php`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          action: 'invoice_update',
          invoice_id: editingInvoiceId,
          invoice_code: editInvoiceCode,
          amount: parseFloat(editInvoiceAmount),
          balance_due: parseFloat(editInvoiceBalance || 0),
          currency: editInvoiceCurrency,
          due_date: editInvoiceDueDate,
          status: editInvoiceStatus
        })
      });
      if (res.ok) {
        setEditingInvoiceId(null);
        fetchClientProjectData(selectedClientId);
      }
    } catch (err) {
      console.error('Error updating invoice:', err);
    }
  };

  // Delete invoice record
  const handleDeleteInvoice = async (invoiceId) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/tasks.php`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          action: 'invoice_delete',
          invoice_delete_id: invoiceId
        })
      });
      if (res.ok) {
        if (editingInvoiceId === invoiceId) setEditingInvoiceId(null);
        fetchClientProjectData(selectedClientId);
      }
    } catch (err) {
      console.error('Error deleting invoice:', err);
    }
  };

  // Delete client file
  const handleDeleteClientFile = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this document from the repository?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/tasks.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          action: 'file_delete',
          file_id: fileId
        })
      });
      if (res.ok) {
        fetchClientProjectData(selectedClientId);
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete file.");
      }
    } catch (err) {
      console.error("Error deleting file:", err);
    }
  };

  // Request new file upload from client
  const handleRequestFile = async (e) => {
    e.preventDefault();
    if (!requestFileReason.trim() || !selectedClientId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/tasks.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          action: 'file_request',
          client_id: selectedClientId,
          category: requestFileCategory,
          reason: requestFileReason
        })
      });
      if (res.ok) {
        setRequestFileReason('');
        alert("Upload request has been sent to client as a new checklist task!");
        fetchClientProjectData(selectedClientId);
      } else {
        const data = await res.json();
        alert(data.message || "Failed to submit request.");
      }
    } catch (err) {
      console.error("Error requesting file:", err);
    }
  };

  // Save Dynamic Receipt Settings
  const handleUpdateReceiptSetting = async (key, value) => {
    if (!receiptSettings) return;
    const updated = { ...receiptSettings, [key]: value };
    setReceiptSettings(updated);
    
    try {
      await fetch(`${API_BASE_URL}/tasks.php`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          action: 'save_receipt_settings',
          settings: updated
        })
      });
    } catch (err) {
      console.error('Error saving receipt settings:', err);
    }
  };

  // Rearrange receipt layout sections
  const handleMoveLayoutSection = async (index, direction) => {
    if (!receiptSettings || !receiptSettings.layout) return;
    const layout = [...receiptSettings.layout];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= layout.length) return;
    
    const temp = layout[index];
    layout[index] = layout[targetIndex];
    layout[targetIndex] = temp;
    
    await handleUpdateReceiptSetting('layout', layout);
  };

  // Admin upload file to client workspace
  const handleAdminFileUploadSubmit = async (e) => {
    e.preventDefault();
    if (!adminSelectedFile || !selectedClientId) return;

    const formData = new FormData();
    formData.append('file', adminSelectedFile);
    formData.append('category', adminUploadCategory);
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
        setAdminSelectedFile(null);
        // Reset file input element visually
        const fileInput = document.getElementById('admin_file_input');
        if (fileInput) fileInput.value = '';
        
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

  // Update Project Target Date
  const handleUpdateTargetDate = async (e) => {
    e.preventDefault();
    if (!newTargetDate.trim() || !selectedClientId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/tasks.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          action: 'project_update_target_date',
          client_id: selectedClientId,
          target_date: newTargetDate
        })
      });
      if (res.ok) {
        setEditingTargetDate(false);
        fetchClientProjectData(selectedClientId);
        fetchClientChat(selectedClientId);
      } else {
        const data = await res.json();
        alert(data.message || "Failed to update target date.");
      }
    } catch (err) {
      console.error("Error updating target date:", err);
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
                    {!editingTargetDate ? (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                        <span>Stage: <strong>{project.status}</strong></span>
                        <span>|</span>
                        <span>Target: <strong>{project.target_date}</strong></span>
                        <button 
                          type="button" 
                          onClick={() => {
                            setEditingTargetDate(true);
                            setNewTargetDate(project.target_date || '');
                          }}
                          style={{ padding: '1px 6px', fontSize: '0.65rem', cursor: 'pointer', background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--primary)', marginLeft: '4px' }}
                        >
                          Edit
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleUpdateTargetDate} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target:</label>
                        <input 
                          type="text" 
                          value={newTargetDate} 
                          onChange={(e) => setNewTargetDate(e.target.value)} 
                          className="form-control" 
                          style={{ padding: '2px 6px', fontSize: '0.75rem', width: '130px', margin: 0 }} 
                          required 
                        />
                        <button type="submit" className="btn btn-primary" style={{ padding: '2px 8px', fontSize: '0.7rem', margin: 0 }}>Save</button>
                        <button type="button" onClick={() => setEditingTargetDate(false)} className="btn btn-outline" style={{ padding: '2px 8px', fontSize: '0.7rem', margin: 0 }}>Cancel</button>
                      </form>
                    )}
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

                  <button
                    onClick={() => setRightTab('receipt_settings')}
                    style={{
                      padding: '8px 12px',
                      border: 'none',
                      background: 'none',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      color: rightTab === 'receipt_settings' ? 'var(--primary)' : 'var(--text-muted)',
                      borderBottom: rightTab === 'receipt_settings' ? '2px solid var(--primary)' : '2px solid transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Sparkles size={14} /> Receipt Designer
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
                  <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {/* Invoice Lists */}
                    <div>
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
                              <div style={{ flexGrow: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <strong>{inv.invoice_code}</strong>
                                  <span className={`status-badge ${inv.status === 'Paid' ? 'status-paid' : 'status-pending'}`} style={{ padding: '2px 6px', fontSize: '0.65rem', borderRadius: '10px' }}>
                                    {inv.status}
                                  </span>
                                </div>
                                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                  Amount: <strong>{inv.currency || '$'}{parseFloat(inv.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong> | Balance Due: <strong style={{ color: parseFloat(inv.balance_due) > 0 ? 'var(--accent)' : 'var(--success)' }}>{inv.currency || '$'}{parseFloat(inv.balance_due || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                                </span>
                                <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                  Due: {inv.due_date}
                                </span>
                              </div>
                              
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                  onClick={() => handleToggleInvoiceStatus(inv.id)}
                                  className={`btn ${inv.status === 'Paid' ? 'btn-primary' : 'btn-outline'}`}
                                  style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                                >
                                  Toggle Status
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingInvoiceId(inv.id);
                                    setEditInvoiceCode(inv.invoice_code);
                                    setEditInvoiceAmount(inv.amount);
                                    setEditInvoiceBalance(inv.balance_due);
                                    setEditInvoiceCurrency(inv.currency || '$');
                                    setEditInvoiceDueDate(inv.due_date);
                                    setEditInvoiceStatus(inv.status);
                                  }}
                                  className="btn btn-outline"
                                  style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteInvoice(inv.id)}
                                  className="btn btn-outline"
                                  style={{ padding: '2px 8px', fontSize: '0.7rem', color: 'red', borderColor: 'rgba(255,0,0,0.2)' }}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No invoice logs generated.</p>
                        )}
                      </div>
                    </div>

                    {/* Invoice Edit Form */}
                    {editingInvoiceId && (
                      <form onSubmit={handleUpdateInvoice} style={{ padding: '12px', border: '1px dashed var(--primary)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h6 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>Edit Invoice</h6>
                          <button type="button" onClick={() => setEditingInvoiceId(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem' }}>Cancel</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <div>
                            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Code</label>
                            <input type="text" value={editInvoiceCode} onChange={(e) => setEditInvoiceCode(e.target.value)} className="form-control" style={{ width: '100%', padding: '4px', fontSize: '0.75rem' }} required />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Due Date</label>
                            <input type="text" value={editInvoiceDueDate} onChange={(e) => setEditInvoiceDueDate(e.target.value)} className="form-control" style={{ width: '100%', padding: '4px', fontSize: '0.75rem' }} required />
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                          <div>
                            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Amount</label>
                            <input type="number" step="0.01" value={editInvoiceAmount} onChange={(e) => setEditInvoiceAmount(e.target.value)} className="form-control" style={{ width: '100%', padding: '4px', fontSize: '0.75rem' }} required />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Balance Due</label>
                            <input type="number" step="0.01" value={editInvoiceBalance} onChange={(e) => setEditInvoiceBalance(e.target.value)} className="form-control" style={{ width: '100%', padding: '4px', fontSize: '0.75rem' }} required />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Currency</label>
                            <select value={editInvoiceCurrency} onChange={(e) => setEditInvoiceCurrency(e.target.value)} className="form-control" style={{ width: '100%', padding: '4px', fontSize: '0.75rem' }}>
                              <option value="$">USD ($)</option>
                              <option value="₦">NGN (₦)</option>
                              <option value="€">EUR (€)</option>
                              <option value="£">GBP (£)</option>
                              <option value="C$">CAD (C$)</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Status</label>
                            <select value={editInvoiceStatus} onChange={(e) => setEditInvoiceStatus(e.target.value)} className="form-control" style={{ width: '100%', padding: '4px', fontSize: '0.75rem' }}>
                              <option value="Pending">Pending</option>
                              <option value="Paid">Paid</option>
                            </select>
                          </div>
                        </div>
                        <button type="submit" className="btn" style={{ padding: '6px', fontSize: '0.75rem', width: '100%', marginTop: '4px' }}>Save Invoice Updates</button>
                      </form>
                    )}

                    {/* Invoice Create Form */}
                    {!editingInvoiceId && (
                      <form onSubmit={handleCreateInvoice} style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <h6 style={{ fontSize: '0.8rem', fontWeight: 700, margin: 0 }}>Create New Invoice</h6>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <div>
                            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Code</label>
                            <input type="text" value="Auto-generated" className="form-control" style={{ width: '100%', padding: '4px', fontSize: '0.75rem', backgroundColor: 'rgba(0,0,0,0.05)', cursor: 'not-allowed' }} disabled />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Due Date</label>
                            <input type="text" placeholder="e.g. July 20, 2026" value={newInvoiceDueDate} onChange={(e) => setNewInvoiceDueDate(e.target.value)} className="form-control" style={{ width: '100%', padding: '4px', fontSize: '0.75rem' }} required />
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                          <div>
                            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Amount</label>
                            <input type="number" step="0.01" placeholder="0.00" value={newInvoiceAmount} onChange={(e) => setNewInvoiceAmount(e.target.value)} className="form-control" style={{ width: '100%', padding: '4px', fontSize: '0.75rem' }} required />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Balance Due</label>
                            <input type="number" step="0.01" placeholder="0.00" value={newInvoiceBalance} onChange={(e) => setNewInvoiceBalance(e.target.value)} className="form-control" style={{ width: '100%', padding: '4px', fontSize: '0.75rem' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Currency</label>
                            <select value={newInvoiceCurrency} onChange={(e) => setNewInvoiceCurrency(e.target.value)} className="form-control" style={{ width: '100%', padding: '4px', fontSize: '0.75rem' }}>
                              <option value="$">USD ($)</option>
                              <option value="₦">NGN (₦)</option>
                              <option value="€">EUR (€)</option>
                              <option value="£">GBP (£)</option>
                              <option value="C$">CAD (C$)</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Status</label>
                            <select value={newInvoiceStatus} onChange={(e) => setNewInvoiceStatus(e.target.value)} className="form-control" style={{ width: '100%', padding: '4px', fontSize: '0.75rem' }}>
                              <option value="Pending">Pending</option>
                              <option value="Paid">Paid</option>
                            </select>
                          </div>
                        </div>
                        <button type="submit" className="btn" style={{ padding: '6px', fontSize: '0.75rem', width: '100%', marginTop: '4px' }}>Create Invoice</button>
                      </form>
                    )}

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

                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <a 
                                  href={`${API_BASE_URL.replace('/api', '')}/${file.file_url}`} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  download
                                  style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center' }}
                                >
                                  <Download size={14} />
                                </a>
                                <button
                                  onClick={() => handleDeleteClientFile(file.id)}
                                  className="btn btn-outline"
                                  style={{ padding: '2px 6px', fontSize: '0.65rem', color: 'red', borderColor: 'rgba(255,0,0,0.2)', margin: 0 }}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No client uploads found.</p>
                        )}
                      </div>
                    </div>

                    {/* Admin Document Uploader Form */}
                    <form onSubmit={handleAdminFileUploadSubmit} style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <h6 style={{ fontSize: '0.8rem', fontWeight: 700, margin: 0 }}>Upload Document & Publish Asset</h6>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div>
                          <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Choose Category</label>
                          <select value={adminUploadCategory} onChange={(e) => setAdminUploadCategory(e.target.value)} className="form-control" style={{ width: '100%', padding: '4px', fontSize: '0.75rem' }}>
                            <option value="Specs">Specs</option>
                            <option value="API Docs">API Docs</option>
                            <option value="Contracts">Contracts</option>
                            <option value="AI Analysis">AI Analysis</option>
                            <option value="Deliverable">Deliverable</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Select File</label>
                          <input 
                            id="admin_file_input"
                            type="file" 
                            onChange={(e) => setAdminSelectedFile(e.target.files[0])} 
                            className="form-control" 
                            style={{ width: '100%', padding: '3px', fontSize: '0.75rem' }} 
                            required 
                          />
                        </div>
                      </div>
                      <button type="submit" className="btn btn-primary" style={{ padding: '6px', fontSize: '0.75rem', marginTop: '4px' }} disabled={loading}>
                        {loading ? 'Uploading...' : 'Upload & Publish Asset'}
                      </button>
                    </form>

                    {/* Request New Document Form */}
                    <form onSubmit={handleRequestFile} style={{ padding: '12px', border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <h6 style={{ fontSize: '0.8rem', fontWeight: 700, margin: 0 }}>Request Document Upload</h6>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px' }}>
                        <div>
                          <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Category</label>
                          <select value={requestFileCategory} onChange={(e) => setRequestFileCategory(e.target.value)} className="form-control" style={{ width: '100%', padding: '4px', fontSize: '0.75rem' }}>
                            <option value="Specs">Specs</option>
                            <option value="API Docs">API Docs</option>
                            <option value="Contracts">Contracts</option>
                            <option value="Assets">Assets</option>
                            <option value="Mockup Feedback">Mockup Feedback</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Reason / Instruction</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Please upload your company high-res logo assets." 
                            value={requestFileReason} 
                            onChange={(e) => setRequestFileReason(e.target.value)} 
                            className="form-control" 
                            style={{ width: '100%', padding: '4px', fontSize: '0.75rem' }} 
                            required 
                          />
                        </div>
                      </div>
                      <button type="submit" className="btn" style={{ padding: '6px', fontSize: '0.75rem', marginTop: '4px' }}>
                        Send Upload Request
                      </button>
                    </form>

                  </div>
                )}

                {/* Tab 4: Receipt Settings / Designer */}
                {rightTab === 'receipt_settings' && (
                  <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h5 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>Receipt PDF Structure & Layout Designer</h5>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                      Rearrange receipt layout sections, customize tax rates, set payment terms, and manage the security watermark.
                    </p>

                    {/* Watermark toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-secondary)' }}>
                      <input 
                        type="checkbox" 
                        id="show_watermark"
                        checked={receiptSettings?.show_watermark ?? true}
                        onChange={(e) => handleUpdateReceiptSetting('show_watermark', e.target.checked)}
                      />
                      <label htmlFor="show_watermark" style={{ fontSize: '0.8rem', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}>
                        Enable Security Background Watermark
                      </label>
                    </div>

                    {/* Section Layout Re-ordering */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Section Layout Order (Click arrows to rearrange)</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {receiptSettings?.layout?.map((section, idx) => (
                          <div 
                            key={section}
                            style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center', 
                              padding: '8px 12px', 
                              border: '1px solid var(--border)', 
                              borderRadius: 'var(--radius-sm)', 
                              backgroundColor: 'var(--bg-secondary)',
                              fontSize: '0.8rem'
                            }}
                          >
                            <span style={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                              {section === 'header' && '🏛️ Header & Billing Profile'}
                              {section === 'meta' && '👥 Client Billing Info & Status Seal'}
                              {section === 'items' && '📋 Itemized Milestones & Description'}
                              {section === 'summary' && '💰 Subtotal, Tax & Balance Due'}
                              {section === 'footer' && '📝 Custom Footer Terms & Notes'}
                            </span>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button 
                                onClick={() => handleMoveLayoutSection(idx, -1)}
                                disabled={idx === 0}
                                className="btn btn-outline"
                                style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                              >
                                ▲
                              </button>
                              <button 
                                onClick={() => handleMoveLayoutSection(idx, 1)}
                                disabled={idx === (receiptSettings?.layout?.length ?? 5) - 1}
                                className="btn btn-outline"
                                style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                              >
                                ▼
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tax rate and Payment Terms */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>Tax Rate (%)</label>
                        <input 
                          type="number" 
                          step="0.01"
                          value={receiptSettings?.tax_rate ?? 0}
                          onChange={(e) => handleUpdateReceiptSetting('tax_rate', parseFloat(e.target.value || 0))}
                          className="form-control"
                          style={{ width: '100%', padding: '6px', fontSize: '0.8rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>Payment Terms</label>
                        <input 
                          type="text" 
                          value={receiptSettings?.payment_terms ?? ''}
                          onChange={(e) => handleUpdateReceiptSetting('payment_terms', e.target.value)}
                          className="form-control"
                          style={{ width: '100%', padding: '6px', fontSize: '0.8rem' }}
                        />
                      </div>
                    </div>

                    {/* Custom notes */}
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>Custom Receipt Note</label>
                      <textarea 
                        rows={2}
                        value={receiptSettings?.custom_notes ?? ''}
                        onChange={(e) => handleUpdateReceiptSetting('custom_notes', e.target.value)}
                        className="form-control"
                        style={{ width: '100%', padding: '6px', fontSize: '0.8rem', resize: 'vertical' }}
                      />
                    </div>

                    {/* Footer Contact Info */}
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>Footer Contact Line</label>
                      <input 
                        type="text" 
                        value={receiptSettings?.footer_contact ?? ''}
                        onChange={(e) => handleUpdateReceiptSetting('footer_contact', e.target.value)}
                        className="form-control"
                        style={{ width: '100%', padding: '6px', fontSize: '0.8rem' }}
                      />
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
