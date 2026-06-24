import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function Projects({ cms = {} }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);

  useEffect(() => {
    fetch(`${API_BASE_URL}/projects.php`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load portfolio items.');
        return res.json();
      })
      .then(data => {
        setProjects(data || []);
        
        // Extract unique categories
        const cats = ['All', ...new Set((data || []).map(p => p.category))];
        setCategories(cats);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filteredProjects = activeCategory === 'All'
    ? projects
    : projects.filter(p => p.category === activeCategory);

  return (
    <section id="projects" className="section">
      <div className="container">
        <h2 className="section-title">{cms.home_projects_title || 'Featured Engagements'}</h2>
        <p className="section-subtitle">
          {cms.home_projects_subtitle || 'Explore a selection of our engineering projects, showing how we solve complex data, deployment, and backend scaling challenges.'}
        </p>
        
        {/* Category Filters */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '40px'
        }}>
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setActiveCategory(cat)}
              className={`btn ${activeCategory === cat ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '8px 20px', fontSize: '0.875rem' }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <div className="spinner" style={{
              width: '30px',
              height: '30px',
              border: '3px solid var(--border)',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }} />
            <p>Loading projects database...</p>
            <style>{`
              @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--error)' }}>
            <p>{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredProjects.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <Layers size={40} style={{ marginBottom: '12px', strokeWidth: 1.5 }} />
            <p>No projects found in this category.</p>
          </div>
        )}

        {/* Projects Grid */}
        <div className="grid grid-3">
          {filteredProjects.map((project) => (
            <article key={project.id} className="project-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="project-img-wrapper" style={{ position: 'relative' }}>
                <img
                  src={project.image_url || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80'}
                  alt={project.title}
                  className="project-img"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>
              <div className="project-content" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between', padding: '24px', textAlign: 'left' }}>
                <div>
                  <span className="project-category" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', display: 'block', marginBottom: '8px' }}>
                    {project.category}
                  </span>
                  <h3 className="project-title" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text-primary)', lineHeight: 1.25 }}>
                    {project.title}
                  </h3>
                  <p className="project-desc" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                    {project.summary || project.description}
                  </p>

                  {/* Tech stack badges */}
                  {project.tech_stack && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
                      {project.tech_stack.split(',').map((tech, tIdx) => (
                        <span 
                          key={tIdx} 
                          style={{ 
                            fontSize: '0.7rem', 
                            padding: '3px 8px', 
                            borderRadius: '4px',
                            backgroundColor: 'rgba(var(--primary-rgb), 0.05)',
                            border: '1px solid rgba(var(--primary-rgb), 0.1)',
                            color: 'var(--primary)',
                            fontWeight: 600
                          }}
                        >
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <Link 
                  to={`/portfolio/${project.id}`} 
                  className="btn btn-primary" 
                  style={{ width: '100%', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.85rem', padding: '10px 16px', gap: '8px', cursor: 'pointer' }}
                >
                  View Details
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
