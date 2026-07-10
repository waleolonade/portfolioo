import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { Check, X, ArrowRight, Shield, Zap, Headphones, Globe } from 'lucide-react';
import ProjectEstimator from '../components/ProjectEstimator';

const pricingPlans = [
  {
    name: 'Starter',
    description: 'Perfect for small businesses and personal portfolios.',
    price: '999',
    interval: 'One Time',
    features: [
      { name: 'Custom Domain Setup', included: true },
      { name: '5 Pages Custom Design', included: true },
      { name: 'Mobile Responsive Layout', included: true },
      { name: 'Basic SEO Optimization', included: true },
      { name: '1 Month Free Support', included: true },
      { name: 'E-Commerce Integration', included: false },
      { name: 'Custom Backend API', included: false }
    ],
    highlight: false,
    cta: 'Start Building',
    icon: <Globe className="text-teal-500" size={32} />
  },
  {
    name: 'Professional',
    description: 'Ideal for growing companies needing custom functionality.',
    price: '2,499',
    interval: 'One Time',
    features: [
      { name: 'Everything in Starter', included: true },
      { name: 'Up to 15 Pages Custom Design', included: true },
      { name: 'Content Management System (CMS)', included: true },
      { name: 'E-Commerce Setup (up to 100 products)', included: true },
      { name: 'Advanced SEO & Analytics', included: true },
      { name: '6 Months Free Support', included: true },
      { name: 'Custom Backend API', included: false }
    ],
    highlight: true,
    cta: 'Get Started',
    icon: <Zap className="text-indigo-500" size={32} />
  },
  {
    name: 'Enterprise',
    description: 'Full-scale custom applications and dedicated servers.',
    price: 'Custom',
    interval: 'Billed Monthly',
    features: [
      { name: 'Everything in Professional', included: true },
      { name: 'Unlimited Pages & Products', included: true },
      { name: 'Custom Backend API & Microservices', included: true },
      { name: 'Mobile App Development (iOS/Android)', included: true },
      { name: 'Dedicated Account Manager', included: true },
      { name: '24/7 Priority Support', included: true },
      { name: 'Cloud Infrastructure & DevOps', included: true }
    ],
    highlight: false,
    cta: 'Contact Sales',
    icon: <Shield className="text-amber-500" size={32} />
  }
];

export default function PricingPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="page-container flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-20">
        <div className="container max-w-6xl">
          
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
              Simple, Transparent <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-teal-400">Pricing</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              No hidden fees. Choose the best plan for your business needs and scale as you grow.
            </p>
          </motion.div>

          <div className="mb-32">
            <ProjectEstimator />
          </div>

          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Or choose a pre-packaged plan</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Standardized packages for rapid deployment.</p>
          </div>

          {/* Pricing Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-5xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {pricingPlans.map((plan, idx) => (
              <motion.div 
                key={idx}
                variants={itemVariants}
                className={`relative rounded-3xl p-8 bg-white dark:bg-slate-900 border transition-all duration-300 flex flex-col h-full ${
                  plan.highlight 
                    ? 'border-indigo-500 shadow-2xl shadow-indigo-500/20 md:-translate-y-4 md:scale-105 z-10' 
                    : 'border-slate-200 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-none hover:border-indigo-500/50'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-gradient-to-r from-indigo-500 to-teal-400 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-md">
                    Most Popular
                  </div>
                )}
                
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{plan.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{plan.description}</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    {plan.icon}
                  </div>
                </div>

                <div className="mb-8">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                    {plan.price !== 'Custom' ? '$' : ''}{plan.price}
                  </span>
                  <span className="text-sm font-medium text-slate-400 ml-2">/ {plan.interval}</span>
                </div>

                <div className="flex-grow">
                  <ul className="space-y-4">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3 text-sm">
                        {feature.included ? (
                          <Check size={18} className="text-teal-500 shrink-0 mt-0.5" />
                        ) : (
                          <X size={18} className="text-slate-300 dark:text-slate-600 shrink-0 mt-0.5" />
                        )}
                        <span className={feature.included ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600 line-through'}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                  <button className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                    plan.highlight
                      ? 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                      : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700'
                  }`}>
                    {plan.cta} <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* FAQ or Guarantee section */}
          <motion.div 
            className="mt-24 text-center max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="inline-flex items-center justify-center p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-full mb-6">
              <Headphones className="text-indigo-500" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Need a Custom Quote?</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              If your project requires extensive custom features, legacy system integration, or a dedicated engineering team, contact us for a personalized estimate.
            </p>
            <a href="#contact" className="inline-flex items-center gap-2 px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:shadow-lg transition-all hover:-translate-y-1">
              Talk to an Expert
            </a>
          </motion.div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
}
