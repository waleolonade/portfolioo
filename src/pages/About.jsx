import React, { useEffect, useContext, useMemo } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CmsContext } from '../CmsContext';
import { motion } from 'framer-motion';
import { 
  Award, Briefcase, GraduationCap, Code2, 
  Terminal, Shield, Zap, Download, Calendar, 
  CheckCircle, Globe, Coffee, Flame, Heart, User,
  Smartphone, Cpu, Activity
} from 'lucide-react';

/* ═══════════════════════════════════════════════
   DEFAULT FALLBACK DATA
   ═══════════════════════════════════════════════ */

const defaultSkills = [
  { 
    category: 'Frontend Architecture', 
    items: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Redux Toolkit'] 
  },
  { 
    category: 'Backend Systems', 
    items: ['Node.js', 'Express', 'PHP', 'Laravel', 'Python', 'RESTful APIs'] 
  },
  { 
    category: 'Database & Caching', 
    items: ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Firebase'] 
  },
  { 
    category: 'Cloud & Infrastructure', 
    items: ['Git/GitHub', 'Docker', 'AWS (S3, EC2)', 'Vercel', 'Linux', 'Nginx'] 
  }
];

const defaultExperience = [
  {
    role: 'Senior Full Stack Engineer',
    company: 'Brainfeels Tech',
    date: '2021 - Present',
    desc: 'Leading engineering squads to develop high-throughput enterprise systems, payment integrations, and beautiful cloud-native web portals.',
    tech: ['React', 'Node.js', 'AWS', 'MySQL', 'WebSockets']
  },
  {
    role: 'Frontend Architect',
    company: 'Digital Solutions Inc.',
    date: '2018 - 2021',
    desc: 'Led transition to micro-frontends. Reduced bundle sizes by 45% and improved SEO and client retention by designing fluid web dashboards.',
    tech: ['Vue.js', 'TypeScript', 'Tailwind CSS', 'Sass']
  },
  {
    role: 'Web Developer',
    company: 'Creative Agency',
    date: '2015 - 2018',
    desc: 'Customized web themes, built customized admin CRM panels, and built custom PHP frameworks for medium-scale businesses.',
    tech: ['PHP', 'WordPress', 'MySQL', 'jQuery']
  }
];

const defaultFeaturedProjects = [
  {
    name: 'Daniel Abiodun Adeoye',
    description: 'Full-stack developer specializing in React ecosystems, secure Node.js APIs, and performance-tuned databases.',
    icon: <Smartphone size={26} />
  },
  {
    name: 'Sarah Johnson',
    description: 'UI/UX designer crafting intuitive user journeys, interactive prototypes, and premium digital layouts.',
    icon: <Globe size={26} />
  },
  {
    name: 'Michael Chen',
    description: 'DevOps architect focused on Dockerized pipelines, AWS cloud load scaling, and continuous deployment streams.',
    icon: <Terminal size={26} />
  },
  {
    name: 'Emily Rodriguez',
    description: 'Lead analytics engineer handling database normalization, Redis caching layers, and search indexes.',
    icon: <Coffee size={26} />
  }
];


/* ═══════════════════════════════════════════════
   REUSABLE CARD COMPONENT
   Matches the left-accent card style from ProjectDetails
   ═══════════════════════════════════════════════ */

function AccentCard({ label, children, accentColor = 'var(--secondary)', className = '' }) {
  return (
    <div
      className={`rounded-[3px] ${className}`}
      style={{
        backgroundColor: 'rgba(var(--secondary-rgb, 99,102,241), 0.04)',
        borderLeft: `4px solid ${accentColor}`,
        padding: '24px',
      }}
    >
      {label && (
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: accentColor,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            display: 'block',
            marginBottom: '8px',
          }}
        >
          {label}
        </span>
      )}
      {children}
    </div>
  );
}


/* ═══════════════════════════════════════════════
   MAIN COMPONENT: ABOUT
   ═══════════════════════════════════════════════ */

export default function About() {
  const { cms } = useContext(CmsContext);

  const aboutPage = useMemo(() => {
    if (cms && cms.about_page_content) {
      try {
        return typeof cms.about_page_content === 'string'
          ? JSON.parse(cms.about_page_content)
          : cms.about_page_content;
      } catch (e) {
        console.error('Failed to parse about_page_content:', e);
      }
    }
    return null;
  }, [cms]);

  const displayCompanyStory = cms?.company_story || 'Brainfeels Tech is a multi-disciplinary software engineering agency. We build websites, mobile apps, and digital solutions that drive growth. We specialize in turning ideas into powerful, secure, and scalable products.';
  const displayCompanyMission = cms?.company_mission || 'To deliver robust, scalable digital assets that increase enterprise productivity and guarantee security.';
  const displayCompanyVision = cms?.company_vision || 'To be the leading global tech agency powering zero-trust cloud pipelines and premium React platforms.';

  const displayHeroBio = (aboutPage?.hero_bio && aboutPage.hero_bio.trim()) 
    ? aboutPage.hero_bio 
    : 'I have spent years building custom Web Applications, APIs, and responsive Frontend layers. From full scale web systems to local business sites, I design components with absolute precision.';

  const displayExperienceYears = (aboutPage?.experience_years && aboutPage.experience_years.trim()) 
    ? aboutPage.experience_years : '10+';
  const displayProjectsBuilt = (aboutPage?.projects_built && aboutPage.projects_built.trim()) 
    ? aboutPage.projects_built : '100+';
  const displayHappyClients = (aboutPage?.happy_clients && aboutPage.happy_clients.trim()) 
    ? aboutPage.happy_clients : '100%';
  const displayGitCommits = (aboutPage?.git_commits && aboutPage.git_commits.trim()) 
    ? aboutPage.git_commits : '2.4k+';

  const displaySkills = aboutPage?.skills || defaultSkills;
  const displayExperience = aboutPage?.experience || defaultExperience;
  const displayTeam = aboutPage?.featured_projects || defaultFeaturedProjects;

  const displayStats = useMemo(() => [
    { label: 'Years Exp.', value: displayExperienceYears, icon: <Calendar size={22} className="text-indigo-500" /> },
    { label: 'Products', value: displayProjectsBuilt, icon: <Flame size={22} className="text-amber-500" /> },
    { label: 'Team Lead', value: displayHappyClients, icon: <Heart size={22} className="text-rose-500" /> },
    { label: 'Patents', value: displayGitCommits, icon: <Code2 size={22} className="text-teal-500" /> }
  ], [displayExperienceYears, displayProjectsBuilt, displayHappyClients, displayGitCommits]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  /* Accent colors matching the project card palette */
  const accentBlue = '#4f6ef7';
  const accentTeal = '#14b8a6';
  const accentAmber = '#f59e0b';
  const accentPurple = '#8b5cf6';
  const accentIndigo = '#6366f1';


  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300 relative overflow-hidden">
      
      {/* Decorative background blurs */}
      <div className="absolute top-1/4 -left-36 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-2/3 -right-36 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <Navbar />
      
      <main className="flex-grow pt-28 pb-20 relative z-10">
        <div className="container max-w-6xl mx-auto px-4 md:px-6">
          
          {/* ════════════ HERO HEADER SECTION ════════════ */}

          <motion.div 
            className="flex flex-col lg:flex-row items-center gap-12 mb-20"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-full lg:w-1/2 flex flex-col justify-center">
              <span className="px-3.5 py-1.5 text-xs font-bold tracking-widest uppercase bg-indigo-500/10 text-indigo-500 rounded-[3px] mb-6 inline-block w-fit">
                About the Company
              </span>
              
              <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
                Architecting premium <br/>
                <span className="text-blue-600 dark:text-blue-500">
                  Digital Solutions
                </span>
              </h1>
              
              <p className="text-base md:text-lg text-slate-800 dark:text-slate-300 mb-8 leading-[1.8] pr-4">
                {displayHeroBio}
              </p>
              
              <div className="flex flex-wrap gap-4">
                <a 
                  href="#contact" 
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[3px] text-sm font-bold shadow-md shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95"
                >
                  Start a Project
                </a>
                
                <a 
                  href="#/portal" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-[3px] text-sm font-bold shadow-sm transition-all hover:scale-105"
                >
                  Client Portal
                </a>
              </div>
            </div>

            {/* Right Side: Corporate System Dashboard Visual */}
            <div className="w-full lg:w-1/2 flex justify-center items-center">
              <div className="w-full max-w-md bg-slate-900 rounded-[3px] shadow-2xl p-6 relative overflow-hidden font-mono text-xs text-slate-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 mb-4 select-none">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                  </div>
                  <span className="text-slate-500 text-[10px]">brainfeels_nodes.sys</span>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Activity size={10} className="animate-pulse" />
                    <span className="text-[10px]">ONLINE</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-950 rounded-[3px]">
                      <span className="text-slate-500 block text-[9px] mb-1">API LATENCY</span>
                      <span className="text-blue-400 text-base font-bold">12.4ms</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-[3px]">
                      <span className="text-slate-500 block text-[9px] mb-1">CPU LOAD</span>
                      <span className="text-teal-400 text-base font-bold">14.8%</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-[3px] space-y-2">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">DEPLOY PIPELINE</span>
                      <span className="text-emerald-400">SUCCESS</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-500 to-teal-400 h-full w-[94%]" />
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 space-y-1">
                    <div>$ git status</div>
                    <div className="text-slate-400"># On branch production</div>
                    <div className="text-slate-400"># Your branch is up to date with 'origin/production'.</div>
                    <div className="text-indigo-400">nothing to commit, working tree clean</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>


          {/* ════════════ STATS SUMMARY COUNTERS ════════════ */}

          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-40"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            {displayStats.map((stat, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <AccentCard
                  accentColor={[accentIndigo, accentAmber, accentTeal, accentPurple][idx]}
                  className="flex flex-col items-center text-center"
                >
                  <div className="p-3 bg-white/60 dark:bg-slate-800/50 rounded-[3px] mb-4">
                    {stat.icon}
                  </div>
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1 tracking-tight">
                    {stat.value}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    {stat.label}
                  </span>
                </AccentCard>
              </motion.div>
            ))}
          </motion.div>


          {/* ════════════ STEP-BY-STEP COMPANY JOURNEY ════════════ */}

          <div className="flex flex-col gap-16 mt-16">
            
            {/* ─── STEP 01: COMPANY STORY ─── */}

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <AccentCard label="Step 01 / Company Overview" accentColor={accentIndigo}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mt-2">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                      <Briefcase className="text-indigo-500" size={24} /> Company Story
                    </h2>
                    
                    <p className="font-bold text-slate-900 dark:text-white text-lg mb-3">
                      Brainfeels Tech
                    </p>
                    
                    <p className="text-slate-800 dark:text-slate-300 text-base leading-[1.8] mb-6">
                      {displayCompanyStory}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <AccentCard label="Our Mission" accentColor={accentBlue}>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{displayCompanyMission}</p>
                      </AccentCard>
                      <AccentCard label="Our Vision" accentColor={accentTeal}>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{displayCompanyVision}</p>
                      </AccentCard>
                    </div>
                  </div>

                  {/* Corporate Config Code Mock */}
                  <div className="w-full">
                    <div className="bg-slate-900 rounded-[3px] shadow-2xl overflow-hidden font-mono text-xs md:text-sm text-slate-300">
                      <div className="bg-slate-950 px-4 py-3.5 border-b border-slate-800/60 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 rounded-full bg-rose-500/80 inline-block"></span>
                          <span className="w-3.5 h-3.5 rounded-full bg-amber-500/80 inline-block"></span>
                          <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/80 inline-block"></span>
                        </div>
                        <span className="text-slate-500 text-xs select-none">brainfeels.json</span>
                        <div className="w-10"></div>
                      </div>
                      
                      <div className="p-6 overflow-x-auto leading-relaxed flex gap-4">
                        <div className="text-slate-600 select-none text-right pr-2 border-r border-slate-800/50 flex flex-col gap-0.5">
                          <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span><span>10</span><span>11</span><span>12</span>
                        </div>
                        
                        <div className="whitespace-pre text-slate-300">
                          <div>&#123;</div>
                          <div>  "name": <span className="text-emerald-400">"Brainfeels Tech"</span>,</div>
                          <div>  "focus": <span className="text-emerald-400">"Enterprise Web & Mobile App Development"</span>,</div>
                          <div>  "deliveryType": <span className="text-emerald-400">"Premium Digital Assets"</span>,</div>
                          <div>  "standards": [</div>
                          <div>    <span className="text-teal-400">"Clean Code"</span>,</div>
                          <div>    <span className="text-teal-400">"Semantic HTML"</span>,</div>
                          <div>    <span className="text-teal-400">"Secure Queries"</span></div>
                          <div>  ],</div>
                          <div>  "activeNodes": <span className="text-amber-400">12</span>,</div>
                          <div>  "globalReach": <span className="text-indigo-400">true</span></div>
                          <div>&#125;</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </AccentCard>
            </motion.div>


            {/* ─── STEP 02: WORK STANDARDS ─── */}

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <AccentCard label="Step 02 / Engineering Philosophy" accentColor={accentTeal}>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-3 mt-1">
                  <CheckCircle className="text-teal-500" size={24} /> Engineering Standards
                </h2>
                
                <p className="text-slate-800 dark:text-slate-300 text-base mb-8 max-w-2xl leading-[1.8]">
                  Commitment to premium engineering. Every module, asset, and query is crafted to satisfy the highest industry specifications.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {[
                    { title: "Clean & Documented Git Commits", desc: "Every commit is isolated, atomic, and thoroughly described to maintain absolute version tracing.", color: accentIndigo },
                    { title: "SEO & Accessibility Best Practices", desc: "Crafting semantic, standards-compliant HTML structures for maximum browser reach and crawler accessibility.", color: accentTeal },
                    { title: "Responsive Grid & Flex Layouts", desc: "Pixel-perfect, fluid layouts optimized to look stunning on standard, tablet, and mobile dimensions.", color: accentAmber },
                    { title: "Secure SQL Prepared Statements", desc: "Strict input sanitization, parametrized queries, and password encryptions to block security vectors.", color: accentPurple }
                  ].map((std, sIdx) => (
                    <AccentCard key={sIdx} accentColor={std.color}>
                      <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 block mb-2">0{sIdx + 1}</span>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2 leading-snug">{std.title}</h3>
                      <p className="text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed">{std.desc}</p>
                    </AccentCard>
                  ))}
                </div>
              </AccentCard>
            </motion.div>


            {/* ─── STEP 03: CORE TECH STACK ─── */}

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <AccentCard label="Step 03 / Core Stack" accentColor={accentAmber}>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-3 mt-1">
                  <Code2 className="text-amber-500" size={24} /> Tech Stack & Capabilities
                </h2>
                
                <p className="text-slate-800 dark:text-slate-300 text-base mb-8 max-w-2xl leading-[1.8]">
                  A modern stack focused on speed, efficiency, and reliability. Hand-picked tools for scaling frontend apps and database systems.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {displaySkills.map((skillGroup, idx) => (
                    <AccentCard key={idx} accentColor={accentAmber}>
                      <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 flex items-center gap-2 mb-3">
                        <span className="w-5 h-5 rounded-[3px] bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-[10px]">{idx + 1}</span>
                        {skillGroup.category}
                      </h3>
                      
                      <div className="flex flex-wrap gap-2">
                        {skillGroup.items.map((skill, sIdx) => (
                          <span 
                            key={sIdx} 
                            className="px-3 py-1.5 bg-white/60 dark:bg-slate-800/60 hover:bg-indigo-500/10 hover:text-indigo-600 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-[3px] shadow-sm transition-all duration-200 cursor-default"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </AccentCard>
                  ))}
                </div>
              </AccentCard>
            </motion.div>


            {/* ─── STEP 04: MEET THE EXPERT TEAM ─── */}

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <AccentCard label="Step 04 / Our Team" accentColor={accentPurple}>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-3 mt-1">
                  <Globe className="text-purple-500" size={24} /> Meet Our Expert Team
                </h2>
                
                <p className="text-slate-800 dark:text-slate-300 text-base mb-8 max-w-2xl leading-[1.8]">
                  A multi-disciplinary group of software developers, product designers, and systems architects dedicated to building resilient software.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {displayTeam.map((member, idx) => (
                    <AccentCard
                      key={idx}
                      accentColor={[accentPurple, accentBlue, accentTeal, accentAmber][idx % 4]}
                      className="group hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-11 h-11 rounded-[3px] flex items-center justify-center flex-shrink-0 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                          {member.icon || <User size={20} />}
                        </div>
                        
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors text-sm">
                            {member.name}
                          </h3>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold mt-0.5">Engineer</span>
                        </div>
                      </div>
                      
                      <p className="text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed">
                        {member.description}
                      </p>
                    </AccentCard>
                  ))}
                </div>
              </AccentCard>
            </motion.div>


            {/* ─── STEP 05: TRACK RECORD & TIMELINE ─── */}

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <AccentCard label="Step 05 / Company Milestones" accentColor={accentIndigo}>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-8 flex items-center gap-3 mt-1">
                  <Briefcase className="text-indigo-500" size={24} /> Track Record & Milestones
                </h2>

                <div className="flex flex-col gap-5">
                  {displayExperience.map((exp, idx) => (
                    <AccentCard
                      key={idx}
                      accentColor={[accentIndigo, accentBlue, accentTeal][idx % 3]}
                    >
                      {/* Row 1: Role + Date */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                          {exp.role}
                        </h3>
                        <span className="flex items-center gap-1.5 px-3.5 py-1 bg-white/70 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-[3px] w-fit flex-shrink-0">
                          <Calendar size={12} /> {exp.date}
                        </span>
                      </div>

                      {/* Row 2: Company */}
                      <h4 className="text-indigo-600 dark:text-indigo-400 font-bold text-sm mb-3">
                        {exp.company}
                      </h4>

                      {/* Row 3: Description */}
                      <p className="text-slate-800 dark:text-slate-300 text-sm leading-[1.8] mb-4">
                        {exp.desc}
                      </p>

                      {/* Row 4: Tech tags */}
                      <div className="flex flex-wrap gap-2">
                        {exp.tech?.map((t, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-slate-800/60 px-2.5 py-1 rounded-[3px]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </AccentCard>
                  ))}
                </div>
              </AccentCard>
            </motion.div>

          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}