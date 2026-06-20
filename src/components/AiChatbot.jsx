import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Check } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function AiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hi! I am the Brainfeels AI Copilot, trained on our 15-year React Native & Web engineering background. Ask me anything about our tech stacks, pricing, or bookings!', time: 'Now' }
  ]);
  const [input, setInput] = useState('');
  const [awaitingEmail, setAwaitingEmail] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const quickPrompts = [
    'What is your core tech stack?',
    'What are your service rates?',
    'How do I schedule a meeting?'
  ];

  const handleSend = (textToSend) => {
    if (!textToSend.trim()) return;

    const userMsg = { sender: 'user', text: textToSend, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      let replyText = '';
      const textLower = textToSend.toLowerCase();

      if (awaitingEmail) {
        // Parse email and save lead
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const matches = textToSend.match(emailRegex) || textToSend.split(' ').find(w => w.includes('@'));
        
        if (matches) {
          const email = Array.isArray(matches) ? matches[0] : matches;
          replyText = `Excellent! I have recorded your email (${email}) in our leads center. Our Project Manager will reach out to you within 24 hours to coordinate.`;
          setAwaitingEmail(false);
          
          // Save lead to inquiries database
          fetch(`${API_BASE_URL}/inquiries.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: 'AI Chatbot Lead',
              email: email,
              subject: 'Lead captured via AI Chatbot',
              message: `AI qualified lead. User was interested in developer details. Input thread: "${textToSend}"`,
              type: 'contact'
            })
          }).catch(err => console.error('Failed to log chatbot lead', err));
        } else {
          replyText = "That doesn't look like a valid email address. Please type a valid email (e.g. name@company.com) so we can schedule the briefing.";
        }
      } else if (textLower.includes('stack') || textLower.includes('technology') || textLower.includes('framework')) {
        replyText = "Marcus Vance and the Brainfeels group specialize in React Native & Expo for native iOS/Android, React/Next.js for web architectures, Node.js API backends, and AWS/GCP Terraform deployments.";
      } else if (textLower.includes('rate') || textLower.includes('price') || textLower.includes('cost') || textLower.includes('fee')) {
        replyText = "We offer flexible package rates: Website Development starts at $1,200, Mobile App Development starts at $3,500, UI/UX Design starts at $600, and Maintenance & Support plans start at $300/month.";
      } else if (textLower.includes('schedule') || textLower.includes('meeting') || textLower.includes('briefing') || textLower.includes('call') || textLower.includes('book')) {
        replyText = "You can schedule a video briefing immediately using our Booking tab in the contact section below! Or, share your email here and I will log it in our dashboard so we can schedule it manually.";
        setAwaitingEmail(true);
      } else {
        replyText = "That sounds like an interesting engineering requirement! Let's arrange a brief video call. Please enter your email address below, and our team will get in touch.";
        setAwaitingEmail(true);
      }

      const aiMsg = { sender: 'ai', text: replyText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setMessages(prev => [...prev, aiMsg]);
    }, 1000);
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000 }}>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary)',
            color: 'white',
            border: 'none',
            boxShadow: 'var(--shadow-lg), 0 0 15px rgba(var(--primary-rgb), 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'var(--transition)'
          }}
          className="btn-primary"
        >
          <MessageSquare size={24} />
        </button>
      )}

      {/* Expandable Chat Bubble */}
      {isOpen && (
        <div style={{
          width: '350px',
          height: '480px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg), 0 10px 25px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'modalEnter 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          textAlign: 'left'
        }}>
          {/* Chat Header */}
          <div style={{
            padding: '16px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-tertiary)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} style={{ color: 'var(--primary)' }} />
              <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>Brainfeels AI Copilot</strong>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Thread */}
          <div style={{
            flexGrow: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%'
                }}
              >
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '12px',
                  borderTopRightRadius: msg.sender === 'user' ? '2px' : '12px',
                  borderTopLeftRadius: msg.sender === 'user' ? '12px' : '2px',
                  backgroundColor: msg.sender === 'user' ? 'var(--primary)' : 'var(--bg-tertiary)',
                  color: msg.sender === 'user' ? 'white' : 'var(--text-primary)',
                  fontSize: '0.85rem',
                  lineHeight: 1.4
                }}>
                  {msg.text}
                </div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px', textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                  {msg.time}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Chips */}
          <div style={{
            padding: '8px 16px',
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            borderTop: '1px solid var(--border)',
            backgroundColor: 'var(--bg-primary)'
          }} className="no-scrollbar">
            {quickPrompts.map((prompt, idx) => (
              <button 
                key={idx}
                onClick={() => handleSend(prompt)}
                className="btn btn-outline"
                style={{ 
                  padding: '4px 10px', 
                  fontSize: '0.75rem', 
                  borderRadius: '12px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  flexShrink: 0
                }}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Form Input */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }} 
            style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px', alignItems: 'center' }}
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              className="form-control"
              placeholder={awaitingEmail ? "Type your email address..." : "Ask AI Copilot..."}
              style={{ fontSize: '0.85rem', padding: '8px 12px' }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '8px' }}>
              <Send size={14} />
            </button>
          </form>

        </div>
      )}
    </div>
  );
}
