import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { 
  Award, Briefcase, GraduationCap, Code2, 
  Terminal, Shield, Zap, CheckCircle2, Download, ExternalLink, Calendar
} from 'lucide-react';

// Mock Data
const skills = [
  { category: 'Frontend', items: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'] },
  { category: 'Backend', items: ['Node.js', 'Express', 'PHP', 'Laravel', 'Python'] },
  { category: 'Database', items: ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis'] },
  { category: 'DevOps & Tools', items: ['Git', 'Docker', 'AWS', 'Vercel', 'Linux'] }
];

const experience = [
  {
    role: 'Senior Full Stack Engineer',
    company: 'Brainfeels Tech',
    date: '2021 - Present',
    desc: 'Leading a team of developers building high-performance enterprise applications, scalable APIs, and pixel-perfect UIs for global clients.',
    tech: ['React', 'Node.js', 'AWS', 'MySQL']
  },
  {
    role: 'Frontend Developer',
    company: 'Digital Solutions Inc.',
    date: '2018 - 2021',
    desc: 'Developed responsive web applications and dashboards. Improved frontend performance by 40% through code splitting and lazy loading.',
    tech: ['Vue.js', 'JavaScript', 'Sass']
  },
  {
    role: 'Web Developer',
    company: 'Creative Agency',
    date: '2015 - 2018',
    desc: 'Created dynamic WordPress sites and custom PHP applications for small to medium-sized businesses.',
    tech: ['PHP', 'WordPress', 'jQuery']
  }
];

const education = [
  {
    degree: 'B.S. Computer Science',
    school: 'University of Technology',
    date: '2011 - 2015',
    desc: 'Specialized in Software Engineering and Database Systems. Graduated with Honors.'
  }
];

const certificates = [
  { title: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', date: '2023', icon: <Zap /> },
  { title: 'Meta Front-End Developer Professional', issuer: 'Coursera / Meta', date: '2022', icon: <Code2 /> },
  { title: 'Advanced React Patterns', issuer: 'Frontend Masters', date: '2021', icon: <Terminal /> },
  { title: 'Cybersecurity Fundamentals', issuer: 'CompTIA', date: '2020', icon: <Shield /> }
];

export default function About() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <div className="page-container flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-20">
        <div className="container max-w-5xl">
          
          {/* Header */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-teal-400">Me</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              A passionate engineer crafting scalable, beautiful, and secure digital experiences.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Left Column: Biography & Skills */}
            <motion.div 
              className="lg:col-span-1 flex flex-col gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Biography */}
              <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-teal-400" />
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Terminal size={20} className="text-indigo-500" /> Biography
                </h2>
                <div className="prose dark:prose-invert prose-sm">
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                    I am a highly skilled Full Stack Developer with over a decade of experience in building modern web and mobile applications. My journey started with simple scripts and has evolved into architecting complex, cloud-native enterprise solutions.
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                    I specialize in the JavaScript/TypeScript ecosystem (React, Next.js, Node.js) and robust backend systems (PHP, MySQL). I believe in writing clean code, designing intuitive user interfaces, and ensuring rock-solid security.
                  </p>
                  <a href="/resume.pdf" download className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-lg text-sm font-bold transition-colors mt-2">
                    <Download size={16} /> Download CV
                  </a>
                </div>
              </motion.div>

              {/* Skills */}
              <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Code2 size={20} className="text-teal-500" /> Core Skills
                </h2>
                <div className="flex flex-col gap-6">
                  {skills.map((skillGroup, idx) => (
                    <div key={idx}>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">{skillGroup.category}</h3>
                      <div className="flex flex-wrap gap-2">
                        {skillGroup.items.map((skill, sIdx) => (
                          <span key={sIdx} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-full shadow-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column: Timeline & Credentials */}
            <motion.div 
              className="lg:col-span-2 flex flex-col gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Experience Timeline */}
              <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                  <Briefcase className="text-indigo-500" /> Work Experience
                </h2>
                <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 md:ml-4 space-y-12">
                  {experience.map((exp, idx) => (
                    <div key={idx} className="relative pl-8 md:pl-10">
                      <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-500" />
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{exp.role}</h3>
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold rounded-full w-fit">
                          <Calendar size={12} /> {exp.date}
                        </span>
                      </div>
                      <h4 className="text-indigo-500 font-semibold text-sm mb-3">{exp.company}</h4>
                      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
                        {exp.desc}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {exp.tech.map((t, i) => (
                          <span key={i} className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/50 px-2 py-1 rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Education */}
              <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                  <GraduationCap className="text-teal-500" /> Education
                </h2>
                <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 md:ml-4 space-y-8">
                  {education.map((edu, idx) => (
                    <div key={idx} className="relative pl-8 md:pl-10">
                      <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-teal-500" />
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{edu.degree}</h3>
                        <span className="text-slate-500 dark:text-slate-400 text-xs font-bold">{edu.date}</span>
                      </div>
                      <h4 className="text-teal-500 font-semibold text-sm mb-3">{edu.school}</h4>
                      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                        {edu.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Certificates & Awards */}
              <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Award className="text-amber-500" /> Certificates & Awards
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {certificates.map((cert, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-slate-50/50 dark:bg-slate-800/20 hover:border-indigo-500/30 transition-colors">
                      <div className="p-2.5 bg-white dark:bg-slate-800 text-indigo-500 dark:text-indigo-400 shadow-sm rounded-lg border border-slate-100 dark:border-slate-700">
                        {cert.icon}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">{cert.title}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{cert.issuer}</p>
                        <span className="text-[10px] font-bold text-slate-400 mt-2 block">{cert.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

            </motion.div>
          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
}
