import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, User, Clock, ChevronRight, Tag, Bookmark } from 'lucide-react';

export const mockPosts = [
  {
    id: '1',
    title: 'The Future of Serverless Architecture in Enterprise',
    excerpt: 'Exploring how serverless functions and Edge computing are completely changing how we build scalable backends.',
    content: `
      ## The Rise of Edge Computing
      Serverless has evolved beyond traditional cold starts. With the advent of Edge computing (Cloudflare Workers, Vercel Edge), we can now run logic geographically closer to users.
      
      ## Cost Efficiency
      You only pay for what you use. This drastically reduces the overhead for staging environments and unpredictable traffic spikes.
      
      ## Conclusion
      Serverless is no longer just for side projects; it is a vital part of the enterprise ecosystem.
    `,
    author: 'Wale O.',
    date: 'April 12, 2024',
    readTime: '5 min read',
    category: 'Engineering',
    tags: ['Serverless', 'AWS', 'Architecture'],
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    featured: true,
    views: '1.2K',
    likes: 342
  },
  {
    id: '2',
    title: 'Why We Switched from Redux to Zustand',
    excerpt: 'A deep dive into our frontend state management evolution and why simpler is often better.',
    content: `
      ## The Boilerplate Problem
      Redux served us well, but the boilerplate became a burden. Creating actions, reducers, and selectors for every piece of state slowed down feature delivery.
      
      ## Enter Zustand
      Zustand provides a minimalistic, hook-based API that integrates seamlessly with React. It requires almost zero boilerplate and allows for highly optimized re-renders.
      
      ## The Results
      Our bundle size decreased, and developer velocity increased by 30%.
    `,
    author: 'Sarah J.',
    date: 'March 28, 2024',
    readTime: '8 min read',
    category: 'Frontend',
    tags: ['React', 'Zustand', 'State Management'],
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    featured: false,
    views: '856',
    likes: 120
  },
  {
    id: '3',
    title: 'Designing for Dark Mode: Beyond Inverting Colors',
    excerpt: 'Practical UI/UX tips for creating a cohesive dark mode experience that reduces eye strain.',
    content: `
      ## It’s Not Just Black and White
      Pure black (#000000) causes eye strain due to high contrast. Instead, use dark grays (#121212) for backgrounds.
      
      ## Elevate with Lightness
      In dark mode, use lighter shades of gray to indicate elevation, rather than drop shadows which are hard to see.
      
      ## Desaturate Colors
      Primary colors should be desaturated to prevent them from vibrating against dark backgrounds.
    `,
    author: 'Wale O.',
    date: 'February 15, 2024',
    readTime: '4 min read',
    category: 'Design',
    tags: ['UI/UX', 'Dark Mode', 'CSS'],
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    featured: false,
    views: '2.1K',
    likes: 540
  }
];

export default function BlogPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const categories = ['All', ...new Set(mockPosts.map(p => p.category))];
  const featuredPost = mockPosts.find(p => p.featured);
  
  const filteredPosts = mockPosts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                          p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="page-container flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-20">
        <div className="container max-w-6xl">
          
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
              Engineering <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-teal-400">Insights</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Deep dives into software architecture, frontend frameworks, UI/UX design, and agency life.
            </p>
          </motion.div>

          {/* Featured Post */}
          {featuredPost && activeCategory === 'All' && search === '' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-16 group"
            >
              <Link to={`/blog/${featuredPost.id}`} className="block relative rounded-3xl overflow-hidden shadow-2xl h-96 lg:h-[30rem]">
                <img src={featuredPost.image} alt={featuredPost.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
                
                <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
                  <span className="px-3 py-1 bg-indigo-500 text-white text-xs font-bold rounded-full mb-4 inline-block">
                    Featured
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight group-hover:text-indigo-300 transition-colors">
                    {featuredPost.title}
                  </h2>
                  <p className="text-slate-300 mb-6 max-w-3xl line-clamp-2 md:line-clamp-none">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center gap-6 text-sm text-slate-400 font-medium">
                    <span className="flex items-center gap-2"><User size={16} /> {featuredPost.author}</span>
                    <span className="flex items-center gap-2"><Calendar size={16} /> {featuredPost.date}</span>
                    <span className="flex items-center gap-2"><Clock size={16} /> {featuredPost.readTime}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 border-b border-slate-200 dark:border-slate-800 pb-8">
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    activeCategory === cat 
                      ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' 
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-500/50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Search articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:border-indigo-500 text-sm"
              />
              <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            </div>
          </div>

          {/* Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredPosts.filter(p => !p.featured || activeCategory !== 'All' || search !== '').map((post) => (
                <motion.div
                  key={post.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col group"
                >
                  <Link to={`/blog/${post.id}`} className="block relative h-48 overflow-hidden">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-xs font-bold rounded-full shadow-sm text-indigo-500">
                        {post.category}
                      </span>
                    </div>
                  </Link>
                  
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-4 text-xs text-slate-500 font-medium mb-3">
                      <span className="flex items-center gap-1.5"><Calendar size={14} /> {post.date}</span>
                      <span className="flex items-center gap-1.5"><Clock size={14} /> {post.readTime}</span>
                    </div>
                    
                    <Link to={`/blog/${post.id}`}>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-indigo-500 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                    </Link>
                    
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="mt-auto flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-500 text-[10px] font-bold">
                          {post.author.charAt(0)}
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{post.author}</span>
                      </div>
                      <Link to={`/blog/${post.id}`} className="text-sm font-bold text-indigo-500 flex items-center gap-1 group-hover:gap-2 transition-all">
                        Read <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
}
