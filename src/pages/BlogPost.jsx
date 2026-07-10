import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ArrowLeft, Calendar, User, Clock, Eye, Heart, MessageCircle } from 'lucide-react';
import { mockPosts } from './BlogPage';

export default function BlogPost() {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const found = mockPosts.find(p => p.id === id);
    setPost(found);
  }, [id]);

  if (!post) {
    return (
      <div className="page-container min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center text-slate-500">Loading post...</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-container flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-20">
        <div className="container max-w-4xl">
          
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-500 transition-colors mb-8">
            <ArrowLeft size={16} /> Back to Blog
          </Link>

          {/* Article Header */}
          <header className="mb-12">
            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-500 text-xs font-bold rounded-full mb-6 inline-block">
              {post.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 dark:text-slate-400 font-medium py-4 border-y border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-500 font-bold">
                  {post.author.charAt(0)}
                </div>
                <span>{post.author}</span>
              </div>
              <span className="flex items-center gap-1.5"><Calendar size={16} /> {post.date}</span>
              <span className="flex items-center gap-1.5"><Clock size={16} /> {post.readTime}</span>
              <span className="flex items-center gap-1.5 ml-auto"><Eye size={16} /> {post.views} Views</span>
            </div>
          </header>

          {/* Featured Image */}
          <div className="w-full h-64 md:h-96 rounded-2xl overflow-hidden mb-12 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          </div>

          {/* Article Content */}
          <article className="prose prose-lg dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 mb-16">
            {post.content.split('\n').map((para, i) => {
              if (para.trim().startsWith('##')) {
                return <h2 key={i} className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">{para.replace('##', '').trim()}</h2>;
              }
              if (para.trim()) {
                return <p key={i} className="mb-4 leading-relaxed">{para.trim()}</p>;
              }
              return null;
            })}
          </article>

          {/* Footer tags & interactions */}
          <footer className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400">
                  #{tag}
                </span>
              ))}
            </div>
            
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 hover:border-red-200 dark:hover:border-red-900 transition-colors text-sm font-bold text-slate-600 dark:text-slate-400">
                <Heart size={18} /> {post.likes}
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-500 hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors text-sm font-bold text-slate-600 dark:text-slate-400">
                <MessageCircle size={18} /> Discuss
              </button>
            </div>
          </footer>

        </div>
      </main>
      
      <Footer />
    </div>
  );
}
