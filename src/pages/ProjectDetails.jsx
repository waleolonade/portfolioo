import { ArrowLeft, Award, ExternalLink, Target } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { API_BASE_URL } from '../config';

export default function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch(`${API_BASE_URL}/projects.php?id=${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Case study not found or server error.');
        return res.json();
      })
      .then(data => {
        setProject(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="page-container">
        <Navbar />
        <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--text-muted)' }}>
          Loading case study details...
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="page-container">
        <Navbar />
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
          <p style={{ color: 'var(--error)' }}>{error || 'Project not found.'}</p>
          <Link to="/portfolio" className="btn btn-primary">Back to Portfolio</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-container">
      <Navbar />
      
      <main style={{ flexGrow: 1, padding: '40px 0', textAlign: 'left' }}>
        <div className="container">
          
          {/* Breadcrumb / Back button */}
          <Link to="/portfolio" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '32px' }}>
            <ArrowLeft size={16} /> Back to Showcase
          </Link>

          {/* Header metadata grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '40px', marginBottom: '50px' }} className="project-details-grid">
            <div>
              <span className="project-category">{project.category}</span>
              <h1 style={{ fontSize: '3rem', fontWeight: 800, marginTop: '8px', marginBottom: '20px', lineHeight: 1.15 }}>
                {project.title}
              </h1>
              <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {project.summary}
              </p>
            </div>

            {/* Sidebar metadata block */}
            <div className="card" style={{ padding: '28px', alignSelf: 'start' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                Engagement Info
              </h3>
              
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.925rem' }}>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Client:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{project.client_name || 'Brainfeels Client'}</strong>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Completion:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{project.completion_date || 'Ongoing'}</strong>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Category:</span>
                  <strong style={{ color: 'var(--primary)' }}>{project.category}</strong>
                </li>
                
                {project.project_url && (
                  <li style={{ borderTop: '1px solid var(--border)', paddingTop: '14px', marginTop: '4px' }}>
                    <a href={project.project_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ width: '100%', fontSize: '0.85rem' }}>
                      Launch Live Project <ExternalLink size={14} />
                    </a>
                  </li>
                )}
                {project.github_url && (
                  <li>
                    <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ width: '100%', fontSize: '0.85rem' }}>
                      Inspect Source Code
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Main image */}
          <div style={{
            width: '100%',
            height: '480px',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            border: '1px solid var(--border)',
            marginBottom: '60px'
          }} className="project-detail-banner">
            <img
              src={project.image_url}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => e.target.src = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80'}
            />
          </div>

          {/* Case study analysis grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '50px' }} className="project-details-grid">
            
            {/* Analysis details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Target size={20} style={{ color: 'var(--error)' }} /> The Challenge
                </h2>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '1rem' }}>
                  {project.challenge || 'Details regarding the operational issues, latency parameters, or database integrity issues client had before project launch.'}
                </p>
              </div>

              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Award size={20} style={{ color: 'var(--success)' }} /> The Solution
                </h2>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '1rem' }}>
                  {project.solution || 'Our engineering response, detailing frontend component routing, cloud orchestration pipelines, or secure API integrations we built.'}
                </p>
              </div>
            </div>

            {/* Metrics and CTA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              
              {/* Highlight Metric */}
              {project.results_metric && (
                <div className="card" style={{
                  backgroundColor: 'rgba(var(--secondary-rgb), 0.04)',
                  borderColor: 'var(--secondary)',
                  borderLeft: '4px solid var(--secondary)',
                  padding: '24px'
                }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                    Measurable Result
                  </span>
                  <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                    {project.results_metric}
                  </p>
                </div>
              )}
              
              <div className="card" style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '10px' }}>Have a similar technical block?</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
                  Let us design a high-throughput, secure architecture customized for your workload requirements.
                </p>
                <Link to="/contact" className="btn btn-primary" style={{ width: '100%', fontSize: '0.85rem' }}>
                  Book Engineer Meeting
                </Link>
              </div>
            </div>

          </div>

        </div>
      </main>

      <Footer />
      <style>{`
        @media (max-width: 768px) {
          .project-details-grid {
            grid-template-columns: 1fr !important;
            gap: 30px !important;
          }
          .project-detail-banner {
            height: 250px !important;
          }
        }
      `}</style>
    </div>
  );
}
