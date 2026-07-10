import {
    ArrowRight,
    Bookmark,
    Calendar,
    Code2,
    ExternalLink,
    GitFork,
    Search,
    SlidersHorizontal,
    Star,
    TrendingUp,
    User
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { API_BASE_URL } from '../config';

const GithubIcon = ({ size = 16, className = "", style = {} }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    style={style}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);


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
        const cats = ['All', ...new Set(list.map(p => p.category).filter(Boolean))];
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
    const titleMatch = p.title?.toLowerCase().includes(search.toLowerCase());
    const summaryMatch = p.summary?.toLowerCase().includes(search.toLowerCase());
    const categoryMatch = p.category?.toLowerCase().includes(search.toLowerCase());
    const stackMatch = p.tech_stack?.toLowerCase().includes(search.toLowerCase());
    const matchesSearch = titleMatch || summaryMatch || categoryMatch || stackMatch;
    
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredRepos = repos.filter(r => {
    const nameMatch = r.name?.toLowerCase().includes(search.toLowerCase());
    const descMatch = r.description?.toLowerCase().includes(search.toLowerCase());
    const langMatch = r.language?.toLowerCase().includes(search.toLowerCase());
    return nameMatch || descMatch || langMatch;
  });

  return (
    <div className="page-container">
      <Navbar />
      
      <main style={{ flexGrow: 1 }}>
        {/* Header Section */}
        <section className="portfolio-header">
          <div className="container">
            <span className="badge-pill">Our Work</span>
            <h1 className="header-title">Case Study Archives</h1>
            <p className="header-desc">
              Explore how we solve hard scaling, user-experience, and structural bottlenecks for digital platforms, mobile tools, and backend databases.
            </p>
          </div>
        </section>

        <section className="container section" style={{ paddingTop: '20px' }}>
          {/* View mode switcher */}
          <div className="switcher-tabs">
            <button 
              onClick={() => { setViewMode('cases'); setSearch(''); }}
              className={`switcher-tab ${viewMode === 'cases' ? 'active' : ''}`}
            >
              Client Case Studies
            </button>
            <button 
              onClick={() => { setViewMode('github'); setSearch(''); }}
              className={`switcher-tab ${viewMode === 'github' ? 'active' : ''}`}
            >
              GitHub Open Source
            </button>
          </div>

          {/* Search & Filter tools */}
          <div className="filters-container">
            {/* Search Input */}
            <div className="search-wrapper">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="form-control search-input"
                placeholder={viewMode === 'cases' ? "Search case studies by stack or title..." : "Search repositories..."}
              />
              <Search size={18} className="search-icon" />
            </div>

            {/* Category tabs (only for cases) */}
            {viewMode === 'cases' && categories.length > 1 && (
              <div className="category-chips">
                <span className="filter-label"><SlidersHorizontal size={14} /> Filter:</span>
                {categories.map((cat, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveCategory(cat)}
                    className={`category-chip ${activeCategory === cat ? 'active' : ''}`}
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
                <div className="portfolio-state-message">
                  <div className="spinner"></div>
                  <p>Loading case studies...</p>
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="portfolio-state-message text-muted">
                  <Bookmark size={36} />
                  <p>No case studies match your query parameters.</p>
                </div>
              ) : (
                <div className="grid grid-3" style={{ gap: '30px' }}>
                  {filteredProjects.map(project => (
                    <article key={project.id} className="case-study-card">
                      <div className="card-img-container">
                        <img
                          src={project.image_url || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80'}
                          alt={project.title}
                          onError={e => e.target.src = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80'}
                        />
                        <span className="card-badge">{project.category}</span>
                      </div>
                      
                      <div className="card-content">
                        <div>
                          <div className="card-meta">
                            {project.client_name && (
                              <span><User size={12} /> {project.client_name}</span>
                            )}
                            {project.completion_date && (
                              <span><Calendar size={12} /> {project.completion_date}</span>
                            )}
                          </div>
                          
                          <h3 className="card-title">{project.title}</h3>
                          <p className="card-description">{project.summary}</p>
                          
                          {project.tech_stack && (
                            <div className="card-tags">
                              {project.tech_stack.split(',').map((tech, tIdx) => (
                                <span key={tIdx} className="card-tag">{tech.trim()}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div style={{ marginTop: '20px' }}>
                          {project.results_metric && (
                            <div className="card-metric">
                              <TrendingUp size={14} style={{ color: '#10b981' }} />
                              <span>{project.results_metric}</span>
                            </div>
                          )}
                          
                          <Link to={`/portfolio/${project.id}`} className="card-cta-link">
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
                <div className="portfolio-state-message">
                  <div className="spinner"></div>
                  <p>Loading GitHub repositories...</p>
                </div>
              ) : reposError ? (
                <div className="portfolio-state-message text-muted">
                  <p>{reposError}</p>
                </div>
              ) : filteredRepos.length === 0 ? (
                <div className="portfolio-state-message text-muted">
                  <p>No repositories match your search query.</p>
                </div>
              ) : (
                <div className="grid grid-3" style={{ gap: '30px' }}>
                  {filteredRepos.map(repo => (
                    <div key={repo.id} className="github-repo-card">
                      <div>
                        <div className="repo-header">
                          <span className="repo-badge">Public Repo</span>
                          <a 
                            href={repo.html_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="repo-ext-link"
                          >
                            <ExternalLink size={14} />
                          </a>
                        </div>

                        <h3 className="repo-title">{repo.name}</h3>
                        <p className="repo-desc">
                          {repo.description || 'No description provided. Click the link above or below to browse the source files.'}
                        </p>
                      </div>

                      <div className="repo-footer">
                        {repo.language && (
                          <span className="repo-lang">
                            <Code2 size={12} /> {repo.language}
                          </span>
                        )}
                        
                        <div className="repo-stats">
                          <span className="repo-stat">
                            <Star size={12} className="star-icon" /> {repo.stargazers_count}
                          </span>
                          
                          <span className="repo-stat">
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

        </section>
      </main>

      <Footer />

      <style>{`
        /* --- Premium Styling --- */
        .badge-pill {
          display: inline-block;
          padding: 6px 14px;
          border-radius: 20px;
          background: rgba(59, 130, 246, 0.1);
          color: var(--secondary);
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 20px;
        }
        .portfolio-header {
          padding: 80px 0 60px 0;
          text-align: center;
          background: rgba(59, 130, 246, 0.03);
          border-bottom: 1px solid var(--border);
        }
        .header-title {
          font-size: 3rem;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.02em;
          margin-bottom: 20px;
        }
        .header-desc {
          font-size: 1.15rem;
          line-height: 1.7;
          color: var(--text-secondary);
          max-width: 700px;
          margin: 0 auto;
        }
        .section-pre {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--secondary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          display: block;
        }

        /* --- Tabs --- */
        .switcher-tabs {
          display: flex;
          gap: 8px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 35px;
          padding-bottom: 4px;
        }
        .switcher-tab {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-weight: 700;
          font-size: 1.05rem;
          padding: 10px 20px;
          cursor: pointer;
          position: relative;
          transition: color 0.3s ease;
        }
        .switcher-tab:hover {
          color: var(--primary);
        }
        .switcher-tab.active {
          color: var(--primary);
        }
        .switcher-tab.active::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 0;
          right: 0;
          height: 3px;
          background-color: var(--primary);
          border-radius: 4px;
        }

        /* --- Filters & Search --- */
        .filters-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 40px;
          flex-wrap: wrap;
        }
        .search-wrapper {
          position: relative;
          width: 100%;
          max-width: 380px;
        }
        .search-input {
          padding-left: 42px !important;
          border-radius: 10px !important;
        }
        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }
        .category-chips {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .filter-label {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 6px;
          margin-right: 6px;
        }
        .category-chip {
          background: none;
          border: 1px solid var(--border);
          color: var(--text-secondary);
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .category-chip:hover {
          background-color: var(--bg-secondary);
          color: var(--text-primary);
        }
        .category-chip.active {
          background-color: var(--primary);
          border-color: var(--primary);
          color: white;
        }

        /* --- Case Study Cards --- */
        .case-study-card {
          background-color: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          text-align: left;
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .case-study-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 30px rgba(0,0,0,0.06);
          border-color: rgba(var(--primary-rgb), 0.2);
        }
        .card-img-container {
          position: relative;
          height: 220px;
          overflow: hidden;
          background-color: var(--bg-secondary);
        }
        .card-img-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }
        .case-study-card:hover .card-img-container img {
          transform: scale(1.04);
        }
        .card-badge {
          position: absolute;
          bottom: 16px;
          left: 16px;
          background-color: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(6px);
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .card-content {
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          flex-grow: 1;
        }
        .card-meta {
          display: flex;
          gap: 16px;
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 12px;
          font-weight: 500;
        }
        .card-meta span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .card-title {
          font-size: 1.3rem;
          font-weight: 800;
          line-height: 1.25;
          margin-bottom: 10px;
          color: var(--text-primary);
        }
        .card-description {
          font-size: 0.9rem;
          line-height: 1.5;
          color: var(--text-secondary);
          margin-bottom: 20px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .card-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 20px;
        }
        .card-tag {
          font-size: 0.72rem;
          padding: 3px 10px;
          border-radius: 6px;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border);
          color: var(--text-primary);
          font-weight: 600;
        }
        .card-metric {
          background-color: rgba(16, 185, 129, 0.05);
          border-left: 3px solid #10b981;
          padding: 10px 14px;
          border-radius: 6px;
          font-size: 0.82rem;
          font-weight: 600;
          color: #065f46;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .card-cta-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-weight: 700;
          color: var(--primary);
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.2s ease;
        }
        .card-cta-link:hover {
          color: var(--secondary);
        }

        /* --- GitHub Repo Cards --- */
        .github-repo-card {
          background-color: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          text-align: left;
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
          transition: all 0.3s ease;
        }
        .github-repo-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.05);
          border-color: var(--secondary);
        }
        .repo-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }
        .repo-badge {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--primary);
          background-color: rgba(var(--primary-rgb), 0.08);
          padding: 3px 10px;
          border-radius: 20px;
          text-transform: uppercase;
        }
        .repo-ext-link {
          color: var(--text-muted);
          transition: color 0.2s ease;
        }
        .repo-ext-link:hover {
          color: var(--primary);
        }
        .repo-title {
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 8px;
          word-break: break-all;
        }
        .repo-desc {
          font-size: 0.88rem;
          line-height: 1.5;
          color: var(--text-secondary);
          margin-bottom: 20px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .repo-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--border);
          padding-top: 14px;
          font-size: 0.8rem;
        }
        .repo-lang {
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 5px;
          font-weight: 600;
        }
        .repo-stats {
          display: flex;
          gap: 14px;
          color: var(--text-muted);
        }
        .repo-stat {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .star-icon {
          fill: #eab308;
          stroke: #eab308;
        }

        /* --- General Loader --- */
        .portfolio-state-message {
          grid-column: 1 / -1;
          padding: 80px 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid var(--border);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 992px) {
          .header-title {
            font-size: 2.5rem;
          }
        }
        @media (max-width: 768px) {
          .filters-container {
            flex-direction: column;
            align-items: flex-start;
          }
          .search-wrapper {
            max-width: 100%;
          }
          .header-title {
            font-size: 2.1rem;
          }
        }
      `}</style>
    </div>
  );
}
