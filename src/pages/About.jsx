import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Target, Eye, ShieldAlert, Award, Compass, Users } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function About() {
  const [team, setTeam] = useState([]);
  const [cms, setCms] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Load CMS & Team
    Promise.all([
      fetch(`${API_BASE_URL}/cms.php`).then(res => res.json()),
      fetch(`${API_BASE_URL}/team.php`).then(res => res.json())
    ])
      .then(([cmsData, teamData]) => {
        setCms(cmsData || {});
        setTeam(teamData || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load About page datasets', err);
        setLoading(false);
      });
  }, []);

  const milestones = [
    { year: '2023', title: 'Agency Founded', desc: 'Brainfeels Tech was established in San Francisco to engineer decoupled cloud platforms.' },
    { year: '2024', title: 'Fintech Breakthrough', desc: 'Successfully deployed zero-latency trading gateways for Fintech Corp, scaling trade capacity.' },
    { year: '2025', title: 'Global Remote Expansion', desc: 'Recruited top engineering assets across US and Europe, enabling 24/7 client coverage.' },
    { year: '2026', title: 'Digital Agency Platform Launch', desc: 'Bootstrapped unified CMS structures and custom portal systems for fleet management.' }
  ];

  return (
    <div className="page-container">
      <Navbar />
      <main style={{ flexGrow: 1, padding: '40px 0' }}>
        
        {/* Intro */}
        <section className="container" style={{ textAlign: 'left', marginBottom: '60px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Who We Are
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '8px', marginBottom: '24px' }}>
            Driving Technical Credibility
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '800px' }}>
            {cms.company_story || 'Brainfeels Tech is a multi-disciplinary software engineering agency. We build and deploy custom React architectures, native Expo mobile frameworks, and secure zero-trust network gates.'}
          </p>
        </section>

        {/* Mission & Vision */}
        <section style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '60px 0' }}>
          <div className="container grid grid-2" style={{ gap: '40px' }}>
            <div className="card" style={{ display: 'flex', gap: '20px', textAlign: 'left', alignItems: 'flex-start' }}>
              <div style={{ color: 'var(--primary)', padding: '10px', borderRadius: '10px', backgroundColor: 'rgba(var(--primary-rgb), 0.08)' }}>
                <Target size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Our Mission</h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                  {cms.company_mission || 'To deliver robust, scalable digital assets that increase enterprise productivity and guarantee security.'}
                </p>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', gap: '20px', textAlign: 'left', alignItems: 'flex-start' }}>
              <div style={{ color: 'var(--secondary)', padding: '10px', borderRadius: '10px', backgroundColor: 'rgba(var(--secondary-rgb), 0.08)' }}>
                <Eye size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Our Vision</h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                  {cms.company_vision || 'To be the leading global tech agency powering zero-trust cloud pipelines and premium React platforms.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Milestones timeline */}
        <section className="container section" style={{ textAlign: 'left' }}>
          <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '40px' }}>Company Milestones</h2>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            borderLeft: '2px solid var(--border)',
            paddingLeft: '24px',
            marginLeft: '8px',
            gap: '30px'
          }}>
            {milestones.map((m, idx) => (
              <div key={idx} style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '-33px',
                  top: '4px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-primary)',
                  border: '3px solid var(--primary)',
                  zIndex: 2
                }} />
                
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', display: 'block', marginBottom: '4px' }}>
                  {m.year}
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  {m.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '600px' }}>
                  {m.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Team Members */}
        <section style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', padding: '80px 0' }}>
          <div className="container">
            <h2 className="section-title">Core Engineering Talents</h2>
            <p className="section-subtitle">Meet the software developers, database managers, and cloud architects guiding client executions.</p>

            {loading ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading team profiles...</div>
            ) : (
              <div className="grid grid-2">
                {team.map(member => (
                  <div key={member.id} className="card" style={{ display: 'flex', gap: '24px', textAlign: 'left', alignItems: 'center' }} className="team-row-responsive">
                    <img
                      src={member.image_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'}
                      alt={member.name}
                      style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }}
                      onError={e => e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'}
                    />
                    <div style={{ flexGrow: 1 }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{member.name}</h3>
                      <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                        {member.position}
                      </span>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>{member.bio}</p>
                      
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {member.skills && member.skills.split(',').map((skill, sIdx) => (
                          <span key={sIdx} className="badge" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

      </main>
      <Footer />
      <style>{`
        @media (max-width: 768px) {
          .team-row-responsive {
            flex-direction: column !important;
            text-align: center !important;
            align-items: center !important;
          }
        }
      `}</style>
    </div>
  );
}
