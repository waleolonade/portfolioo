import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, LayoutDashboard, Briefcase, MessageSquare, LogOut,
  FileText, Code, LayoutTemplate
} from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('adminToken');
  const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
  const role = user.role || 'Super Admin';

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
    }
  }, [token, navigate]);

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const hasAccess = (tabName) => {
    if (role === 'Super Admin') return true;
    if (role === 'Project Manager' && ['projects', 'chats'].includes(tabName)) return true;
    if (role === 'Support Agent' && ['leads', 'chats'].includes(tabName)) return true;
    if (role === 'Content Editor' && ['cms', 'services', 'careers', 'ai'].includes(tabName)) return true;
    return false;
  };

  const isActive = (path) => location.pathname.startsWith(path);
  const isExactActive = (path) => location.pathname === path;

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar" style={{ overflowY: 'auto' }}>
        <div className="sidebar-title">
          <ShieldCheck size={22} style={{ color: 'var(--primary)' }} />
          <span>Brainfeels CMS</span>
        </div>

        <ul className="sidebar-menu">
          {hasAccess('overview') && (
            <li className={`sidebar-item ${isExactActive('/admin') || isExactActive('/admin/overview') ? 'active' : ''}`} onClick={() => navigate('/admin/overview')}>
              <LayoutDashboard size={18} /> Overview
            </li>
          )}
          
          {hasAccess('projects') && (
            <li className={`sidebar-item ${isActive('/admin/projects') ? 'active' : ''}`} onClick={() => navigate('/admin/projects')}>
              <Briefcase size={18} /> Projects CRUD
            </li>
          )}
          {hasAccess('services') && (
            <li className={`sidebar-item ${isActive('/admin/services') ? 'active' : ''}`} onClick={() => navigate('/admin/services')}>
              <Code size={18} /> Services CRUD
            </li>
          )}
          {hasAccess('leads') && (
            <li className={`sidebar-item ${isActive('/admin/leads') ? 'active' : ''}`} onClick={() => navigate('/admin/leads')}>
              <MessageSquare size={18} /> Lead Center
            </li>
          )}
          {hasAccess('chats') && (
            <li className={`sidebar-item ${isActive('/admin/chats') ? 'active' : ''}`} onClick={() => navigate('/admin/chats')}>
              <MessageSquare size={18} /> Client Chats
            </li>
          )}
          {hasAccess('careers') && (
            <li className={`sidebar-item ${isActive('/admin/careers') ? 'active' : ''}`} onClick={() => navigate('/admin/careers')}>
              <FileText size={18} /> Career Center
            </li>
          )}

          {/* CMS Unified Page Builder */}
          {hasAccess('cms') && (
            <li className={`sidebar-item ${isActive('/admin/cms') ? 'active' : ''}`} onClick={() => navigate('/admin/cms')} style={{ marginTop: '20px' }}>
              <LayoutTemplate size={18} /> Page Builder & CMS
            </li>
          )}

          <li className="sidebar-item sidebar-logout" onClick={logout} style={{ marginTop: 'auto' }}>
            <LogOut size={18} /> Sign Out
          </li>
        </ul>
      </aside>

      {/* Main Panel Content */}
      <main className="admin-main">
        <header className="admin-header">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, textTransform: 'capitalize' }}>
            {location.pathname.replace('/admin/', '').replace('cms/', '').replace('-', ' ')}
          </h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Role: <strong style={{ color: 'var(--primary)' }}>{role}</strong> ({user.username})
            </span>
            <button onClick={() => navigate('/')} className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
              Launch Site
            </button>
          </div>
        </header>

        <div className="admin-content">
           <Outlet />
        </div>
      </main>
    </div>
  );
}
