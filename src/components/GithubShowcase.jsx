import React, { useState, useEffect } from 'react';
import { Star, GitFork, ExternalLink, Code2, BookOpen } from 'lucide-react';
import { API_BASE_URL } from '../config';

const GithubIcon = ({ size = 24, className = "", style = {} }) => (
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

export default function GithubShowcase({ cms = {} }) {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('https://api.github.com/users/waleolonade/repos?sort=updated&per_page=12')
      .then(res => {
        if (!res.ok) throw new Error('Unable to retrieve GitHub repositories.');
        return res.json();
      })
      .then(data => {
        const publicRepos = (data || []).filter(repo => !repo.fork);
        setRepos(publicRepos.slice(0, 8)); // Display top 8 updated repositories
        setLoading(false);
      })
      .catch(err => {
        console.error('GitHub fetch error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <section id="github-showcase" className="section" style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '12px' }}>
          <GithubIcon size={28} className="text-glow" style={{ color: 'var(--primary)' }} />
          <h2 className="section-title" style={{ margin: 0 }}>{cms.home_github_title || 'Open Source Repositories'}</h2>
        </div>
        <p className="section-subtitle" style={{ marginBottom: '40px' }}>
          {cms.home_github_subtitle || 'Direct integration with GitHub showing our latest active repositories, source code architectures, and developer contributions.'}
        </p>

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
            <p>Fetching active repositories...</p>
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            <p>GitHub API rate limit or network issue. View direct repositories here:</p>
            <a 
              href="https://github.com/waleolonade?tab=repositories" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-outline"
              style={{ marginTop: '16px' }}
            >
              Open GitHub Profile <ExternalLink size={14} />
            </a>
          </div>
        )}

        {!loading && !error && repos.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <BookOpen size={40} style={{ marginBottom: '12px', strokeWidth: 1.5 }} />
            <p>No public repositories found.</p>
          </div>
        )}

        {!loading && !error && repos.length > 0 && (
          <>
            <div className="grid grid-3" style={{ marginBottom: '40px' }}>
              {repos.map(repo => (
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
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'var(--transition)'
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

            <div style={{ textAlign: 'center' }}>
              <a 
                href="https://github.com/waleolonade?tab=repositories" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-outline"
                style={{ padding: '12px 28px' }}
              >
                Browse All Repositories on GitHub <GithubIcon size={16} style={{ marginLeft: '6px' }} />
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
