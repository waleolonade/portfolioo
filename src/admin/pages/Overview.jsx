import { useContext } from 'react';
import { Briefcase, Code, MessageSquare, FileText, BarChart3 } from 'lucide-react';
import { AdminContext } from '../AdminContext';

export default function Overview() {
  const { stats } = useContext(AdminContext);

  return (
    <div>
      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)' }}><Briefcase size={22} /></div>
          <div className="stat-info"><span className="stat-value">{stats?.totalProjects || 0}</span><span className="stat-label">Showcase Items</span></div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(13, 148, 136, 0.1)', color: 'var(--secondary)' }}><Code size={22} /></div>
          <div className="stat-info"><span className="stat-value">{stats?.totalServices || 0}</span><span className="stat-label">Core Services</span></div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent)' }}><MessageSquare size={22} /></div>
          <div className="stat-info"><span className="stat-value">{stats?.totalLeads || 0}</span><span className="stat-label">Qualified Leads</span></div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--info)' }}><FileText size={22} /></div>
          <div className="stat-info"><span className="stat-value">{stats?.totalJobs || 0}</span><span className="stat-label">Open Vacancies</span></div>
        </div>
      </div>

      {/* SVG Chart Panel */}
      <div className="card" style={{ padding: '24px', textAlign: 'left', marginBottom: '30px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={18} /> Visitor Conversion Metrics (Weekly)
        </h3>
        
        <div style={{ position: 'relative', width: '100%', height: '200px' }}>
          <svg viewBox="0 0 700 200" style={{ width: '100%', height: '100%' }}>
            <line x1="50" y1="180" x2="650" y2="180" stroke="var(--border)" strokeWidth="2" />
            <line x1="50" y1="20" x2="50" y2="180" stroke="var(--border)" strokeWidth="2" />
            
            <polyline
              fill="none"
              stroke="var(--primary)"
              strokeWidth="3"
              points="50,160 150,130 250,90 350,110 450,70 550,50 650,30"
            />
            
            <circle cx="50" cy="160" r="5" fill="var(--primary)" />
            <circle cx="150" cy="130" r="5" fill="var(--primary)" />
            <circle cx="250" cy="90" r="5" fill="var(--primary)" />
            <circle cx="350" cy="110" r="5" fill="var(--primary)" />
            <circle cx="450" cy="70" r="5" fill="var(--primary)" />
            <circle cx="550" cy="50" r="5" fill="var(--primary)" />
            <circle cx="650" cy="30" r="5" fill="var(--primary)" />

            <text x="50" y="195" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Mon</text>
            <text x="150" y="195" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Tue</text>
            <text x="250" y="195" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Wed</text>
            <text x="350" y="195" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Thu</text>
            <text x="450" y="195" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Fri</text>
            <text x="550" y="195" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Sat</text>
            <text x="650" y="195" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Sun</text>
            
            <text x="30" y="165" fill="var(--text-muted)" fontSize="10" textAnchor="end">200</text>
            <text x="30" y="115" fill="var(--text-muted)" fontSize="10" textAnchor="end">500</text>
            <text x="30" y="35" fill="var(--text-muted)" fontSize="10" textAnchor="end">900</text>
          </svg>
        </div>
      </div>
    </div>
  );
}
