import { useContext } from 'react';
import { Briefcase, Code, MessageSquare, FileText, BarChart3, ArrowUpRight, Zap, Settings, PlusCircle } from 'lucide-react';
import { AdminContext } from '../AdminContext';
import { useNavigate } from 'react-router-dom';

export default function Overview() {
  const { stats } = useContext(AdminContext);
  const navigate = useNavigate();

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning';
    if (hr < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
  const name = user.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : 'Admin';

  const statCards = [
    {
      title: 'Showcase Items',
      value: stats?.totalProjects || 0,
      icon: Briefcase,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'rgba(99, 102, 241, 0.1)',
      textColor: 'text-indigo-500',
      borderColor: 'hover:border-indigo-500/30'
    },
    {
      title: 'Core Services',
      value: stats?.totalServices || 0,
      icon: Code,
      color: 'from-teal-500 to-teal-600',
      bgColor: 'rgba(20, 184, 166, 0.1)',
      textColor: 'text-teal-500',
      borderColor: 'hover:border-teal-500/30'
    },
    {
      title: 'Qualified Leads',
      value: stats?.totalLeads || 0,
      icon: MessageSquare,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      textColor: 'text-amber-500',
      borderColor: 'hover:border-amber-500/30'
    },
    {
      title: 'Open Vacancies',
      value: stats?.totalJobs || 0,
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'rgba(59, 130, 246, 0.1)',
      textColor: 'text-blue-500',
      borderColor: 'hover:border-blue-500/30'
    }
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="z-10">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">{getGreeting()}, {name}!</h1>
          <p className="text-xs md:text-sm text-slate-300 mt-1.5 font-medium">Welcome back to Brainfeels CMS dashboard. Here's what's happening today.</p>
        </div>
        <div className="z-10 flex gap-2.5">
          <button 
            onClick={() => navigate('/admin/cms')} 
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
          >
            <Settings size={14} /> Page Builder
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx} 
              className={`p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl flex items-center gap-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 ${card.borderColor}`}
            >
              <div className="p-3.5 rounded-xl shrink-0" style={{ backgroundColor: card.bgColor, color: 'var(--primary)' }}>
                <Icon className={`${card.textColor}`} size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-none mb-1">{card.value}</span>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{card.title}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics & Quick Actions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Chart */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <BarChart3 size={16} className="text-indigo-500" /> Visitor Conversion Metrics
            </h3>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-500 font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
              +12.4% <ArrowUpRight size={10} />
            </span>
          </div>
          
          <div className="relative w-full h-48">
            <svg viewBox="0 0 700 200" className="w-full h-full">
              <defs>
                <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Gridlines */}
              <line x1="50" y1="20" x2="650" y2="20" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="4 4" />
              <line x1="50" y1="73" x2="650" y2="73" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="4 4" />
              <line x1="50" y1="126" x2="650" y2="126" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="4 4" />
              <line x1="50" y1="180" x2="650" y2="180" stroke="var(--border)" strokeWidth="1" />
              
              {/* Shaded Area Under Polyline */}
              <path
                d="M50,180 L50,160 L150,130 L250,90 L350,110 L450,70 L550,50 L650,30 L650,180 Z"
                fill="url(#chart-area-grad)"
              />

              {/* Data Path Line */}
              <polyline
                fill="none"
                stroke="var(--primary)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="50,160 150,130 250,90 350,110 450,70 550,50 650,30"
              />
              
              <circle cx="50" cy="160" r="5" fill="var(--bg-secondary)" stroke="var(--primary)" strokeWidth="2.5" />
              <circle cx="150" cy="130" r="5" fill="var(--bg-secondary)" stroke="var(--primary)" strokeWidth="2.5" />
              <circle cx="250" cy="90" r="5" fill="var(--bg-secondary)" stroke="var(--primary)" strokeWidth="2.5" />
              <circle cx="350" cy="110" r="5" fill="var(--bg-secondary)" stroke="var(--primary)" strokeWidth="2.5" />
              <circle cx="450" cy="70" r="5" fill="var(--bg-secondary)" stroke="var(--primary)" strokeWidth="2.5" />
              <circle cx="550" cy="50" r="5" fill="var(--bg-secondary)" stroke="var(--primary)" strokeWidth="2.5" />
              <circle cx="650" cy="30" r="5" fill="var(--bg-secondary)" stroke="var(--primary)" strokeWidth="2.5" />

              <text x="50" y="196" fill="var(--text-muted)" fontSize="9" fontWeight="600" textAnchor="middle">Mon</text>
              <text x="150" y="196" fill="var(--text-muted)" fontSize="9" fontWeight="600" textAnchor="middle">Tue</text>
              <text x="250" y="196" fill="var(--text-muted)" fontSize="9" fontWeight="600" textAnchor="middle">Wed</text>
              <text x="350" y="196" fill="var(--text-muted)" fontSize="9" fontWeight="600" textAnchor="middle">Thu</text>
              <text x="450" y="196" fill="var(--text-muted)" fontSize="9" fontWeight="600" textAnchor="middle">Fri</text>
              <text x="550" y="196" fill="var(--text-muted)" fontSize="9" fontWeight="600" textAnchor="middle">Sat</text>
              <text x="650" y="196" fill="var(--text-muted)" fontSize="9" fontWeight="600" textAnchor="middle">Sun</text>
              
              <text x="42" y="163" fill="var(--text-muted)" fontSize="9" fontWeight="600" textAnchor="end">200</text>
              <text x="42" y="113" fill="var(--text-muted)" fontSize="9" fontWeight="600" textAnchor="end">500</text>
              <text x="42" y="33" fill="var(--text-muted)" fontSize="9" fontWeight="600" textAnchor="end">900</text>
            </svg>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-6">
              <Zap size={16} className="text-amber-500" /> Administrative Quick Actions
            </h3>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => navigate('/admin/projects')}
                className="w-full flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 hover:border-indigo-500/20 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/10 rounded-xl transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <PlusCircle size={15} className="text-indigo-500" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Create New Case Study</span>
                </div>
                <ArrowUpRight size={14} className="text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              <button 
                onClick={() => navigate('/admin/leads')}
                className="w-full flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 hover:border-teal-500/20 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-teal-50/20 dark:hover:bg-teal-950/10 rounded-xl transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare size={15} className="text-teal-500" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Review Inbox Inquiries</span>
                </div>
                <ArrowUpRight size={14} className="text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              <button 
                onClick={() => navigate('/admin/services')}
                className="w-full flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 hover:border-amber-500/20 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-amber-50/20 dark:hover:bg-amber-950/10 rounded-xl transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <Settings size={15} className="text-amber-500" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Manage Service Pricing</span>
                </div>
                <ArrowUpRight size={14} className="text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>

          <div className="text-[10px] text-center text-slate-400 font-semibold mt-4">
            Authorized admin credentials active.
          </div>
        </div>
      </div>
    </div>
  );
}
