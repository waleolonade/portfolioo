import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';

const mockFaqs = [
  {
    category: 'General',
    questions: [
      { q: 'What services do you offer?', a: 'We specialize in full-stack web development, cross-platform mobile apps, cloud architecture, and UI/UX design.' },
      { q: 'Where are you located?', a: 'We are a fully remote team with developers and designers distributed globally across the US, Europe, and Africa.' },
      { q: 'Do you work with startups?', a: 'Yes! We love working with early-stage startups to help build their MVPs and scale them to production.' }
    ]
  },
  {
    category: 'Process & Timeline',
    questions: [
      { q: 'How long does a typical project take?', a: 'A standard website takes 2-4 weeks. Complex enterprise web apps take 2-4 months depending on the feature set.' },
      { q: 'What is your development methodology?', a: 'We use an Agile approach with 2-week sprints, regular demo calls, and continuous integration/continuous deployment (CI/CD).' },
      { q: 'Will I be updated during the project?', a: 'Absolutely. We set up a shared Slack channel and a Notion dashboard so you can track progress in real-time.' }
    ]
  },
  {
    category: 'Pricing & Billing',
    questions: [
      { q: 'How do you structure your pricing?', a: 'We offer fixed-price contracts for clearly defined scopes, and monthly retainers for ongoing development and support.' },
      { q: 'What is your payment schedule?', a: 'Typically, we require a 50% upfront deposit to begin work, 25% at a major milestone, and the final 25% before launch.' },
      { q: 'Do you offer refunds?', a: 'Since our work involves custom engineering time, deposits are non-refundable once the sprint has commenced.' }
    ]
  },
  {
    category: 'Technical',
    questions: [
      { q: 'What tech stack do you use?', a: 'Our primary stack is React/Next.js for frontend, Node.js or PHP/Laravel for backend, and PostgreSQL/MySQL for databases. We deploy on AWS or Vercel.' },
      { q: 'Do you provide the source code?', a: 'Yes. Upon final payment, 100% of the intellectual property and source code is transferred to you.' },
      { q: 'Will my app be scalable?', a: 'Yes, we architect our solutions using modern cloud-native principles, ensuring they can handle thousands of concurrent users.' }
    ]
  }
];

export default function FAQPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const categories = ['All', ...mockFaqs.map(c => c.category)];

  const toggleFaq = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  const filteredFaqs = mockFaqs.map(group => {
    // If category doesn't match and not "All", exclude
    if (activeCategory !== 'All' && group.category !== activeCategory) {
      return { ...group, questions: [] };
    }
    // Filter questions by search
    const filteredQuestions = group.questions.filter(q => 
      q.q.toLowerCase().includes(search.toLowerCase()) || 
      q.a.toLowerCase().includes(search.toLowerCase())
    );
    return { ...group, questions: filteredQuestions };
  }).filter(group => group.questions.length > 0);

  return (
    <div className="page-container flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-20">
        <div className="container max-w-4xl">
          
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
              Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-teal-400">Questions</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Everything you need to know about the product and billing.
            </p>
          </motion.div>

          {/* Search Box */}
          <div className="relative max-w-2xl mx-auto mb-12">
            <input
              type="text"
              placeholder="Search for answers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:border-indigo-500 shadow-xl shadow-slate-200/50 dark:shadow-none text-lg"
            />
            <Search className="absolute left-4 top-4 text-slate-400" size={24} />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center items-center gap-2 mb-12">
            {categories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  activeCategory === cat 
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md' 
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-500/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* FAQ Accordions */}
          <div className="space-y-8">
            {filteredFaqs.map((group, gIdx) => (
              <motion.div 
                key={gIdx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: gIdx * 0.1 }}
              >
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
                  {group.category}
                </h2>
                <div className="space-y-3">
                  {group.questions.map((item, qIdx) => {
                    const id = `${gIdx}-${qIdx}`;
                    const isOpen = expandedId === id;
                    
                    return (
                      <div key={qIdx} className={`border rounded-xl bg-white dark:bg-slate-900 overflow-hidden transition-colors ${isOpen ? 'border-indigo-500 shadow-md' : 'border-slate-200 dark:border-slate-800'}`}>
                        <button 
                          onClick={() => toggleFaq(id)}
                          className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <span className={`font-bold pr-4 ${isOpen ? 'text-indigo-500' : 'text-slate-800 dark:text-slate-200'}`}>
                            {item.q}
                          </span>
                          <span className={`shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-500' : 'text-slate-400'}`}>
                            <ChevronDown size={20} />
                          </span>
                        </button>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="px-5 pb-5 text-slate-600 dark:text-slate-400 leading-relaxed"
                            >
                              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                {item.a}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}

            {filteredFaqs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-500">No FAQs found matching "{search}".</p>
              </div>
            )}
          </div>

          {/* CTA Section */}
          <div className="mt-20 bg-indigo-50 dark:bg-indigo-500/10 rounded-3xl p-8 md:p-12 text-center border border-indigo-100 dark:border-indigo-500/20">
            <MessageSquare className="mx-auto text-indigo-500 mb-4" size={40} />
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Still have questions?</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-lg mx-auto">
              If you couldn't find the answer you're looking for, feel free to reach out to our team. We'll respond within 24 hours.
            </p>
            <a href="#contact" className="inline-flex items-center justify-center px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-1">
              Contact Support
            </a>
          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
}
