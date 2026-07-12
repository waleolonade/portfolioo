import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, LayoutDashboard, Briefcase, MessageSquare, LogOut,
  FileText, Code, LayoutTemplate, CreditCard, User, Globe
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

  // Grouped Navigation Items
  const navigationGroups = [
    {
      title: 'Overview & CMS',
      items: [
        { id: 'overview', path: '/admin/overview', label: 'Dashboard', icon: LayoutDashboard, exact: true },
        { id: 'cms', path: '/admin/cms', label: 'Page Builder', icon: LayoutTemplate }
      ]
    },
    {
      title: 'Content Manager',
      items: [
        { id: 'projects', path: '/admin/projects', label: 'Projects Showcase', icon: Briefcase },
        { id: 'services', path: '/admin/services', label: 'Services Page', icon: Code },
        { id: 'careers', path: '/admin/careers', label: 'Careers Center', icon: FileText }
      ]
    },
    {
      title: 'Operations',
      items: [
        { id: 'leads', path: '/admin/leads', label: 'Leads Hub', icon: MessageSquare },
        { id: 'chats', path: '/admin/chats', label: 'Client Messages', icon: MessageSquare }
      ]
    },
    {
      title: 'Administration',
      items: [
        { id: 'payments', path: '/admin/payments', label: 'Payment Settings', icon: CreditCard, superAdminOnly: true }
      ]
    }
  ];

  const userInitials = user.username ? user.username.substring(0, 2).toUpperCase() : 'AD';

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex flex-col shrink-0 h-screen sticky top-0">
        
        {/* Brand logo header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 shadow-sm border border-indigo-500/20">
            <ShieldCheck size={18} />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm leading-tight tracking-tight">Brainfeels</span>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold tracking-wider uppercase">Content Studio</span>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-grow overflow-y-auto px-4 py-5 flex flex-col gap-5">
          {navigationGroups.map((group, gIdx) => {
            // Filter items based on access privileges
            const visibleItems = group.items.filter(item => {
              if (item.superAdminOnly && role !== 'Super Admin') return false;
              return hasAccess(item.id);
            });

            if (visibleItems.length === 0) return null;

            return (
              <div key={gIdx} className={`flex flex-col gap-1 ${gIdx > 0 ? 'mt-3.5' : ''}`}>
                <span className="px-3 text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                  {group.title}
                </span>
                
                <ul className="flex flex-col gap-0.5 list-none p-0 m-0">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isItemActive = item.exact 
                      ? (isExactActive('/admin') || isExactActive('/admin/overview')) 
                      : isActive(item.path);

                    return (
                      <li 
                        key={item.id}
                        className={`relative px-3 py-2 rounded-xl flex items-center justify-between font-medium text-[13px] cursor-pointer transition-all border ${
                          isItemActive 
                            ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-500/10 dark:border-indigo-500/5 font-semibold shadow-sm' 
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/30'
                        }`}
                        onClick={() => navigate(item.path)}
                      >
                        {isItemActive && (
                          <motion.div 
                            layoutId="active-nav-indicator"
                            className="absolute left-0 top-2 bottom-2 w-0.75 bg-indigo-500 rounded-r-full"
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                          />
                        )}
                        
                        <div className="flex items-center gap-2.5 relative z-10">
                          <Icon size={15} className={`${isItemActive ? 'text-indigo-500' : 'text-slate-400 dark:text-slate-500'}`} />
                          <span>{item.label}</span>
                        </div>

                        {/* Visual badges for specific pages */}
                        {item.id === 'cms' && (
                          <span className="text-[8px] bg-indigo-500/10 text-indigo-500 font-bold px-1 py-0.25 rounded">Core</span>
                        )}
                        {item.id === 'chats' && (
                          <span className="text-[8px] bg-emerald-500/10 text-emerald-500 font-bold px-1 py-0.25 rounded">Live</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Floating User Profile Card */}
        <div className="m-4 p-3 border border-slate-200/60 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/50 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8.5 h-8.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold text-[11px] shrink-0 shadow-sm">
              {userInitials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-850 dark:text-slate-100 truncate leading-none mb-1">
                {user.username || 'Administrator'}
              </span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 truncate font-semibold uppercase tracking-wider">
                {role}
              </span>
            </div>
          </div>
          
          <button 
            onClick={logout} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/10 transition-all"
            title="Sign Out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-grow flex flex-col min-h-screen overflow-y-auto">
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <h2 className="text-xs font-bold text-slate-850 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <User size={14} className="text-indigo-500" />
            {location.pathname.replace('/admin/', '').replace('cms/', '').replace('-', ' ') || 'Overview'}
          </h2>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')} 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm bg-white dark:bg-slate-900"
            >
              <Globe size={12} /> Launch Website
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
