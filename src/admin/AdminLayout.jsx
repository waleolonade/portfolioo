import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, LayoutDashboard, Briefcase, MessageSquare, LogOut,
  FileText, Code, LayoutTemplate, CreditCard
} from 'lucide-react';
import { motion } from 'framer-motion';

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

  const menuItems = [
    { id: 'overview', path: '/admin/overview', label: 'Overview', icon: LayoutDashboard, exact: true },
    { id: 'projects', path: '/admin/projects', label: 'Projects CRUD', icon: Briefcase },
    { id: 'services', path: '/admin/services', label: 'Services CRUD', icon: Code },
    { id: 'leads', path: '/admin/leads', label: 'Lead Center', icon: MessageSquare },
    { id: 'chats', path: '/admin/chats', label: 'Client Chats', icon: MessageSquare },
    { id: 'careers', path: '/admin/careers', label: 'Career Center', icon: FileText },
    { id: 'cms', path: '/admin/cms', label: 'Page Builder & CMS', icon: LayoutTemplate, customSpacing: true },
    { id: 'payments', path: '/admin/payments', label: 'Payment Gateways', icon: CreditCard, superAdminOnly: true }
  ];

  const activeItems = menuItems.filter(item => {
    if (item.superAdminOnly && role !== 'Super Admin') return false;
    return hasAccess(item.id);
  });

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col p-6 shrink-0 h-screen sticky top-0">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
            <ShieldCheck size={22} />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-slate-800 dark:text-slate-100 text-base leading-tight tracking-tight">Brainfeels</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wider uppercase">Content Studio</span>
          </div>
        </div>

        <ul className="flex flex-col gap-1.5 list-none p-0 m-0">
          {activeItems.map((item) => {
            const Icon = item.icon;
            const isItemActive = item.exact 
              ? (isExactActive('/admin') || isExactActive('/admin/overview')) 
              : isActive(item.path);
            
            return (
              <li 
                key={item.id}
                className={`relative px-4 py-3 rounded-xl flex items-center gap-3 font-semibold text-sm cursor-pointer transition-all ${
                  item.customSpacing ? 'mt-6' : ''
                } ${
                  isItemActive 
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                }`}
                onClick={() => navigate(item.path)}
              >
                {isItemActive && (
                  <motion.div 
                    layoutId="active-nav-indicator"
                    className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-500 rounded-r-full"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon size={18} className={`${isItemActive ? 'text-indigo-500' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                <span className="relative z-10">{item.label}</span>
              </li>
            );
          })}

          <li 
            className="mt-auto px-4 py-3 rounded-xl flex items-center gap-3 font-semibold text-sm cursor-pointer text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/10 transition-colors list-none"
            onClick={logout}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </li>
        </ul>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-grow flex flex-col min-h-screen overflow-y-auto">
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 capitalize">
            {location.pathname.replace('/admin/', '').replace('cms/', '').replace('-', ' ') || 'Overview'}
          </h2>
          
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Role: <strong className="text-indigo-600 dark:text-indigo-400 font-semibold">{role}</strong> ({user.username})
            </span>
            <button 
              onClick={() => navigate('/')} 
              className="px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Launch Site
            </button>
          </div>
        </header>

        <div className="p-8 flex-grow">
           <Outlet />
        </div>
      </main>
    </div>
  );
}

