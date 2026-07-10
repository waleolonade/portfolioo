import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Code, Smartphone, ShoppingCart, Zap, Shield, Users, Server, Globe, Bell, CreditCard, Lock, Search, Activity, Box } from 'lucide-react';

const platforms = [
  { id: 'web', label: 'Web App', icon: Code, basePrice: 2000 },
  { id: 'mobile', label: 'Mobile App', icon: Smartphone, basePrice: 3500 },
  { id: 'ecommerce', label: 'E-Commerce', icon: ShoppingCart, basePrice: 2500 }
];

const complexities = [
  { id: 'standard', label: 'Standard', multiplier: 1 },
  { id: 'premium', label: 'Premium', multiplier: 1.5 },
  { id: 'custom', label: 'Custom', multiplier: 2.5 }
];

const featureList = [
  { id: 'stripe', label: 'Stripe Payments', icon: CreditCard, price: 500 },
  { id: 'roles', label: 'User Roles', icon: Users, price: 400 },
  { id: 'seo', label: 'SEO Optimization', icon: Globe, price: 300 },
  { id: 'auth', label: 'Social Auth', icon: Lock, price: 250 },
  { id: 'push', label: 'Push Notifications', icon: Bell, price: 350 },
  { id: 'dashboard', label: 'Admin Dashboard', icon: Activity, price: 800 },
  { id: 'api', label: 'Custom API', icon: Server, price: 1000 },
  { id: 'search', label: 'Advanced Search', icon: Search, price: 450 },
  { id: 'inventory', label: 'Inventory Sync', icon: Box, price: 600 },
  { id: 'security', label: 'Advanced Security', icon: Shield, price: 700 }
];

export default function ProjectEstimator() {
  const [platform, setPlatform] = useState(platforms[0]);
  const [complexity, setComplexity] = useState(complexities[0]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);

  const toggleFeature = (feat) => {
    if (selectedFeatures.find((f) => f.id === feat.id)) {
      setSelectedFeatures(selectedFeatures.filter((f) => f.id !== feat.id));
    } else {
      setSelectedFeatures([...selectedFeatures, feat]);
    }
  };

  const calculateTotal = () => {
    let base = platform.basePrice * complexity.multiplier;
    let featTotal = selectedFeatures.reduce((acc, feat) => acc + feat.price, 0);
    return base + featTotal;
  };

  const totalCost = calculateTotal();

  return (
    <div className="mx-auto w-full max-w-6xl rounded-[2.5rem] border border-[var(--border)] bg-[var(--bg-secondary)] p-6 shadow-xl lg:p-12">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-black tracking-tight text-[var(--text-primary)] sm:text-4xl">Interactive Project Estimator</h2>
        <p className="mt-4 text-[var(--text-secondary)]">Configure your project requirements to get an instant cost estimate.</p>
      </div>

      <div className="grid gap-12 lg:grid-cols-[1fr_350px]">
        {/* Left Side - Configuration */}
        <div className="space-y-12">
          
          {/* Platform Tab Segmented Control */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
              <Zap size={16} /> 1. Select Platform
            </h3>
            <div className="relative flex w-full flex-wrap gap-2 rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-2 sm:flex-nowrap">
              {platforms.map((p) => {
                const isActive = platform.id === p.id;
                const Icon = p.icon;
                return (
                  <button
                    key={p.id}
                    onClick={() => setPlatform(p)}
                    className={`relative flex flex-1 items-center justify-center gap-2 rounded-xl py-3 px-4 text-sm font-bold transition-colors ${
                      isActive ? 'text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="platformTab"
                        className="absolute inset-0 rounded-xl bg-[var(--primary)] shadow-md"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <Icon size={16} /> {p.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Complexity Segmented Control */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
              <Activity size={16} /> 2. Project Complexity
            </h3>
            <div className="relative flex w-full flex-wrap gap-2 rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-2 sm:flex-nowrap">
              {complexities.map((c) => {
                const isActive = complexity.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setComplexity(c)}
                    className={`relative flex flex-1 items-center justify-center gap-2 rounded-xl py-3 px-4 text-sm font-bold transition-colors ${
                      isActive ? 'text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="complexityTab"
                        className="absolute inset-0 rounded-xl bg-[var(--accent)] shadow-md"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feature Grid */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
              <Box size={16} /> 3. Select Features
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {featureList.map((feat) => {
                const isSelected = selectedFeatures.some((f) => f.id === feat.id);
                const Icon = feat.icon;
                return (
                  <button
                    key={feat.id}
                    onClick={() => toggleFeature(feat)}
                    className={`group relative flex flex-col items-center justify-center gap-3 rounded-2xl border p-4 text-center transition-all duration-300 ${
                      isSelected
                        ? 'border-[var(--primary)] bg-[var(--primary)]/10 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]'
                        : 'border-[var(--border)] bg-[var(--bg-primary)] hover:border-[var(--primary)]/50 hover:bg-[var(--bg-secondary)]'
                    }`}
                  >
                    <div
                      className={`absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
                        isSelected
                          ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
                          : 'border-[var(--text-muted)] bg-transparent'
                      }`}
                    >
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                    <Icon
                      size={24}
                      className={`transition-colors ${
                        isSelected ? 'text-[var(--primary)]' : 'text-[var(--text-muted)] group-hover:text-[var(--primary)]'
                      }`}
                    />
                    <div>
                      <p className={`text-sm font-bold transition-colors ${isSelected ? 'text-[var(--primary)]' : 'text-[var(--text-primary)]'}`}>
                        {feat.label}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-[var(--text-muted)]">+${feat.price}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Side - Configuration Summary Sidebar */}
        <div className="h-full">
          <div className="sticky top-28 flex flex-col overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--bg-primary)] shadow-2xl">
            <div className="bg-[var(--text-primary)] p-6 text-center text-[var(--bg-primary)] transition-colors">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Estimated Total</p>
              <h3 className="mt-2 text-4xl font-black">${totalCost.toLocaleString()}</h3>
            </div>
            
            <div className="flex flex-col gap-6 p-6">
              <h4 className="text-sm font-bold uppercase tracking-[0.1em] text-[var(--text-primary)]">Configuration Summary</h4>
              
              <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b border-[var(--border)] pb-3">
                  <span className="text-[var(--text-secondary)]">Platform</span>
                  <span className="font-bold text-[var(--text-primary)]">{platform.label}</span>
                </div>
                <div className="flex justify-between border-b border-[var(--border)] pb-3">
                  <span className="text-[var(--text-secondary)]">Complexity</span>
                  <span className="font-bold text-[var(--text-primary)]">{complexity.label}</span>
                </div>
                
                <div>
                  <span className="mb-2 block text-[var(--text-secondary)]">Included Features:</span>
                  {selectedFeatures.length === 0 ? (
                    <p className="text-xs italic text-[var(--text-muted)]">No additional features selected.</p>
                  ) : (
                    <ul className="space-y-2">
                      {selectedFeatures.map((f) => (
                        <li key={f.id} className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-2 font-medium text-[var(--text-primary)]">
                            <Check size={12} className="text-[var(--primary)]" /> {f.label}
                          </span>
                          <span className="font-bold text-[var(--text-secondary)]">+${f.price}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <button className="mt-4 flex w-full justify-center rounded-xl bg-[var(--primary)] py-4 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-[var(--primary-hover)]">
                Request Formal Quote
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
