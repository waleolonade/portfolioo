import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Search, ArrowRight, BookOpen, Star, GitFork, Code2, ExternalLink } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function PortfolioPage() {
  const [viewMode, setViewMode] = useState('cases'); // cases, github
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);

  // GitHub state
  const [repos, setRepos] = useState([]);
  const [reposLoading, setReposLoading] = useState(false);
  const [reposError, setReposError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch(`${API_BASE_URL}/projects.php`)
      .then(res => res.json())
      .then(data => {
        const list = data || [];
        setProjects(list);
        const cats = ['All', ...new Set(list.map(p => p.category))];
        setCategories(cats);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load portfolio list', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (viewMode === 'github' && repos.length === 0) {
      setReposLoading(true);
      fetch('https://api.github.com/users/waleolonade/repos?sort=updated&per_page=30')
        .then(res => {
          if (!res.ok) throw new Error('Failed to retrieve GitHub projects.');
          return res.json();
        })
        .then(data => {
          const publicRepos = (data || []).filter(repo => !repo.fork);
          setRepos(publicRepos);
          setReposLoading(false);
        })
        .catch(err => {
          setReposError(err.message);
          setReposLoading(false);
        });
    }
  }, [viewMode, repos.length]);

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                          p.summary.toLowerCase().includes(search.toLowerCase()) ||
                          p.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredRepos = repos.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) || 
                          (r.description && r.description.toLowerCase().includes(search.toLowerCase())) ||
                          (r.language && r.language.toLowerCase().includes(search.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="page-container">
      <Navbar />
      <main style={{ flexGrow: 1, padding: '40px 0' }}>
        <div className="container">
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Our Work
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '8px', marginBottom: '16px', textAlign: 'left' }}>
            Case Study Archives
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '40px', maxWidth: '650px', textAlign: 'left' }}>
            Explore how we solve hard scaling and structural bottlenecks for digital platforms, mobile tools, and zero-trust cloud gates.
          </p>

          {/* View mode switcher */}
          <div style={{
            display: 'flex',
            gap: '12px',
            borderBottom: '1px solid var(--border)',
            marginBottom: '32px',
            paddingBottom: '8px'
          }}>
            <button 
              onClick={() => { setViewMode('cases'); setSearch(''); }}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: viewMode === 'cases' ? '2px solid var(--primary)' : '2px solid transparent',
                color: viewMode === 'cases' ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '1rem',
                padding: '8px 16px',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
            >
              Case Studies
            </button>
            <button 
              onClick={() => { setViewMode('github'); setSearch(''); }}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: viewMode === 'github' ? '2px solid var(--primary)' : '2px solid transparent',
                color: viewMode === 'github' ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '1rem',
                padding: '8px 16px',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
            >
              GitHub Repositories
            </button>
          </div>

          {/* Search & Filter tools */}
          <div style={{
            display: 'flex',
            gap: '20px',
            marginBottom: '40px',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            {/* Search Input */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="form-control"
                placeholder={viewMode === 'cases' ? "Search case studies by stack or title..." : "Search repositories..."}
                style={{ paddingLeft: '40px' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>

            {/* Category tabs (only for cases) */}
            {viewMode === 'cases' && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {categories.map((cat, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveCategory(cat)}
                    className={`btn ${activeCategory === cat ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '6px 16px', fontSize: '0.85rem' }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RENDERING CASES */}
          {viewMode === 'cases' && (
            <>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                  Loading portfolio database...
                </div>
              ) : filteredProjects.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                  No case studies match your query parameters.
                </div>
              ) : (
                <div className="grid grid-3">
                  {filteredProjects.map(project => (
                    <article key={project.id} className="project-card" style={{ textAlign: 'left' }}>
                      <div className="project-img-wrapper">
                        <img
                          src={project.image_url}
                          alt={project.title}
                          className="project-img"
                          onError={e => e.target.src = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80'}
                        />
                      </div>
                      <div className="project-content" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', padding: '24px' }}>
                        <div>
                          <span className="project-category" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', display: 'block', marginBottom: '8px' }}>
                            {project.category}
                          </span>
                          <h3 className="project-title" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text-primary)', lineHeight: 1.25 }}>
                            {project.title}
                          </h3>
                          <p className="project-desc" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                            {project.summary}
                          </p>
                          
                          {/* Tech stack badges */}
                          {project.tech_stack && (
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
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
                        
                        <div>
                          {project.results_metric && (
                            <div style={{
                              padding: '10px 14px',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: 'rgba(var(--secondary-rgb), 0.06)',
                              borderLeft: '3px solid var(--secondary)',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              color: 'var(--secondary)',
                              marginBottom: '16px'
                            }}>
                              Result: {project.results_metric}
                            </div>
                          )}
                          
                          <Link to={`/portfolio/${project.id}`} className="project-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700, cursor: 'pointer' }}>
                            Read Case Study <ArrowRight size={14} />
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}

          {/* RENDERING GITHUB REPOS */}
          {viewMode === 'github' && (
            <>
              {reposLoading ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                  Loading GitHub projects...
                </div>
              ) : reposError ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                  {reposError}
                </div>
              ) : filteredRepos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                  No repositories match your search query.
                </div>
              ) : (
                <div className="grid grid-3">
                  {filteredRepos.map(repo => (
                    <div 
                      key={repo.id} 
                      className="card" 
                      style={{ 
                        textAlign: 'left', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        height: '100%', 
                        justifyContent: 'space-between',
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <span style={{ 
                            fontSize: '0.75rem', 
                            fontWeight: 700, 
                            color: 'var(--primary)', 
                            backgroundColor: 'rgba(var(--primary-rgb), 0.08)',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            textTransform: 'uppercase'
                          }}>
                            Public Repo
                          </span>
                          <a 
                            href={repo.html_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ color: 'var(--text-muted)' }}
                            className="project-link"
                          >
                            <ExternalLink size={14} />
                          </a>
                        </div>

                        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                          {repo.name}
                        </h3>
                        
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
                          {repo.description || 'No description provided. Click the link above or below to browse the source files.'}
                        </p>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '14px', marginTop: 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          {repo.language && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Code2 size={12} style={{ color: 'var(--primary)' }} /> {repo.language}
                            </span>
                          )}
                          
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Star size={12} style={{ fill: '#eab308', stroke: '#eab308' }} /> {repo.stargazers_count}
                          </span>
                          
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <GitFork size={12} /> {repo.forks_count}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
}
