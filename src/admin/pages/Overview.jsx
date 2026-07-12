import { useContext, useState, useEffect } from 'react';
import { 
  Briefcase, Code, MessageSquare, FileText, BarChart3, 
  ArrowUpRight, Zap, Settings, PlusCircle, AlertCircle, 
  Activity, CheckCircle2, ShieldCheck, TrendingUp, Clock
} from 'lucide-react';
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

  // Stat cards with target completion indicators
  const statCards = [
    {
      title: 'Showcase Items',
      value: stats?.totalProjects || 0,
      icon: Briefcase,
      color: 'indigo',
      percent: '84% target',
      progress: 84
    },
    {
      title: 'Core Services',
      value: stats?.totalServices || 0,
      icon: Code,
      color: 'teal',
      percent: 'Fully active',
      progress: 100
    },
    {
      title: 'Qualified Leads',
      value: stats?.totalLeads || 0,
      icon: MessageSquare,
      color: 'amber',
      percent: '+18% this wk',
      progress: 72
    },
    {
      title: 'Open Vacancies',
      value: stats?.totalJobs || 0,
      icon: FileText,
      color: 'blue',
      percent: '3 active hiring',
      progress: 45
    }
  ];

  // Simulated live activity logs
  const activityLogs = [
    { type: 'cms', text: 'Services Page template updated by Admin', time: '10 mins ago', icon: Code, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20' },
    { type: 'lead', text: 'New inquiry received from Sarah Jenkins (Fintech Corp)', time: '2 hours ago', icon: MessageSquare, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' },
    { type: 'media', text: 'Resume document doc_resume.pdf uploaded successfully', time: '3 hours ago', icon: FileText, color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/20' },
    { type: 'project', text: 'Flagship project "Fraud Detection Pipeline" details modified', time: '1 day ago', icon: Briefcase, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20' }
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Premium Dashboard Greeting Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 top-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="z-10 flex-grow">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold tracking-widest uppercase bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded">
              CMS Node Control
            </span>
            <span className="text-[10px] font-bold tracking-widest uppercase bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Operational
            </span>
          </div>
          
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">{getGreeting()}, {name}!</h1>
          <p className="text-xs md:text-sm text-slate-300 mt-1.5 font-medium max-w-lg">
            Manage your portfolios, client inquiries, dynamic layouts, and CMS assets securely.
          </p>
        </div>
        
        <div className="z-10 flex gap-2.5 shrink-0">
          <button 
            onClick={() => navigate('/admin/cms')} 
            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20"
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
              className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl flex flex-col gap-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-none mb-1">
                    {card.value}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {card.title}
                  </span>
                </div>
                
                <div className={`p-3 rounded-xl shrink-0 ${
                  card.color === 'indigo' ? 'bg-indigo-500/10 text-indigo-500' :
                  card.color === 'teal' ? 'bg-teal-500/10 text-teal-500' :
                  card.color === 'amber' ? 'bg-amber-500/10 text-amber-500' :
                  'bg-blue-500/10 text-blue-500'
                }`}>
                  <Icon size={20} />
                </div>
              </div>

              {/* Progress visual bar */}
              <div className="flex flex-col gap-1.5 mt-1">
                <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      card.color === 'indigo' ? 'bg-indigo-500' :
                      card.color === 'teal' ? 'bg-teal-500' :
                      card.color === 'amber' ? 'bg-amber-500' :
                      'bg-blue-500'
                    }`}
                    style={{ width: `${card.progress}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold">
                  <span>Usage Rate</span>
                  <span>{card.percent}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics, Activity, and Actions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Chart */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <BarChart3 size={16} className="text-indigo-500" /> Visitor Conversion Metrics
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">Daily client conversion trend over the past week</p>
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-500 font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
              <TrendingUp size={10} /> +12.4%
            </span>
          </div>
          
          <div className="relative w-full h-52 mt-2">
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
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl shadow-sm flex flex-col gap-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
              <Zap size={16} className="text-amber-500" /> Quick Operations
            </h3>
            
            <div className="flex flex-col gap-3.5">
              <button 
                onClick={() => navigate('/admin/projects')}
                className="w-full flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800/60 hover:border-indigo-500/20 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/10 rounded-xl transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <PlusCircle size={15} className="text-indigo-500" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Create New Project</span>
                </div>
                <ArrowUpRight size={14} className="text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              <button 
                onClick={() => navigate('/admin/leads')}
                className="w-full flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800/60 hover:border-teal-500/20 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-teal-50/20 dark:hover:bg-teal-950/10 rounded-xl transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare size={15} className="text-teal-500" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Review Lead Inbox</span>
                </div>
                <ArrowUpRight size={14} className="text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              <button 
                onClick={() => navigate('/admin/services')}
                className="w-full flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800/60 hover:border-amber-500/20 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-amber-50/20 dark:hover:bg-amber-950/10 rounded-xl transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <Settings size={15} className="text-amber-500" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Customize Services Page</span>
                </div>
                <ArrowUpRight size={14} className="text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>

          <div className="text-[10px] text-center text-slate-400 font-semibold">
            System status healthy.
          </div>
        </div>
      </div>

      {/* Recent Activity Logs Section (restructured detail) */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-6">
          <Activity size={16} className="text-indigo-500" /> Recent Administrative Activity
        </h3>

        <div className="flex flex-col gap-4">
          {activityLogs.map((log, idx) => {
            const LogIcon = log.icon;
            return (
              <div key={idx} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/40">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`p-2.5 rounded-lg shrink-0 ${log.color}`}>
                    <LogIcon size={15} />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                    {log.text}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 text-slate-400 text-[10px] font-semibold">
                  <Clock size={11} />
                  <span>{log.time}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
