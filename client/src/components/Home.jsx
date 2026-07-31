import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductModal from './ProductModal';
import BrandModal from './BrandModal';
import AIRecommender from './AIRecommender';
import CommandCenter from './CommandCenter';
import { CustomCursor, MagneticButton } from './PremiumUI';
import { getBrandGradient } from '../utils/brandGradients';

const fallbackBrands = ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Vivo', 'Oppo', 'Nothing', 'Motorola', 'Asus'];
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Home() {
  const [items, setItems] = useState([]);
  const [brands, setBrands] = useState(fallbackBrands.map(b => ({ name: b })));
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [isCmdOpen, setIsCmdOpen] = useState(false);

  useEffect(() => {
    const handleKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCmdOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    fetch(`${API}/api/items`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setItems(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
      
    fetch(`${API}/api/items/brands`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setBrands(data); })
      .catch(err => console.error(err));
  }, []);

  const mobiles = items.filter(i => i.category_id === 1);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] relative" style={{ backgroundImage: `linear-gradient(to right, var(--grid-line) 1px, transparent 1px), linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px)`, backgroundSize: '40px 40px' }}>
      <CustomCursor />

      {/* === HERO SECTION (Replayable Cinematic Logo) === */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[var(--bg)] via-[var(--bg)]/70 to-[var(--bg)]"></div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 flex flex-col items-center">
          <motion.span 
            initial={{ opacity: 0, y: 10 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.5 }}
            className="inline-block px-3 py-1 mb-16 text-[10px] font-bold tracking-[0.2em] border border-[var(--border)] text-[var(--text-secondary)] font-mono-tech uppercase bg-[var(--bg-elevated)]/50 backdrop-blur-sm"
          >
            // Press Cmd + K to Search
          </motion.span>
          
          {/* 1. FLYING BRAND NAME (SpecPedia) */}
          <div className="flex mb-4 overflow-hidden pb-4">
            {"SpecPedia".split("").map((letter, i) => (
              <motion.span
                key={i}
                initial={{ y: -150, opacity: 0, rotate: 10 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                transition={{ duration: 0.8, delay: i * 0.08, type: "spring", stiffness: 150, damping: 12 }}
                className="font-display text-5xl md:text-7xl font-bold text-shimmer"
              >
                {letter}
              </motion.span>
            ))}
          </div>

          {/* 2. BEAUTIFUL TAGLINE (Specs. Reimagined.) */}
          <motion.h1 
            initial={{ opacity: 0, scale: 0.8, filter: "blur(15px)" }} 
            whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }} 
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 1.2, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-sans text-6xl md:text-[9rem] font-extrabold tracking-tighter uppercase leading-[0.85] mb-10 bg-clip-text text-transparent bg-gradient-to-b from-[var(--text-primary)] to-[var(--text-secondary)]"
          >
            Specs.<br/>Reimagined.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="text-[var(--text-secondary)] text-lg max-w-xl mx-auto mb-12 font-light"
          >
            The Ultimate Product Encyclopedia. Explore 100+ smartphones with AI-driven insights and real-time spec comparisons.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.8, delay: 1.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <MagneticButton 
              onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}
              className="bg-[var(--accent)] text-[var(--accent-contrast)] font-bold px-10 py-4 uppercase tracking-wider text-xs hover:opacity-80 transition-opacity"
            >
              Browse Mobiles →
            </MagneticButton>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[var(--text-muted)] text-[10px] font-mono-tech uppercase tracking-widest"
        >
          Scroll to Explore
        </motion.div>
      </section>

      {/* TOP BRANDS MARQUEE */}
      <section className="border-y border-[var(--border)] py-12 overflow-hidden bg-[var(--bg-elevated)]">
        <div className="text-center mb-8">
          <h2 className="text-xs font-mono-tech uppercase tracking-widest text-[var(--text-muted)]">Click a brand to explore</h2>
        </div>
        <div className="relative flex overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[var(--bg-elevated)] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[var(--bg-elevated)] to-transparent z-10 pointer-events-none"></div>
          
          <motion.div animate={{ x: ['0%', '-50%'] }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }} className="flex gap-16 shrink-0 pr-16">
            {[...brands, ...brands].map((brand, i) => (
              <span key={i} onClick={() => setSelectedBrand(brand.name)} className="text-4xl md:text-5xl font-extrabold text-[var(--text-muted)] opacity-20 hover:opacity-100 hover:text-[var(--accent)] transition-all duration-500 uppercase tracking-tighter whitespace-nowrap cursor-pointer">{brand.name}</span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* AI RECOMMENDER */}
      <AIRecommender onSelectItem={setSelectedItem} />

      {/* PRODUCT GRID */}
      <div id="products" className="max-w-7xl mx-auto px-6 py-32">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--border)]">{[...Array(6)].map((_, i) => <div key={i} className="h-[250px] bg-[var(--bg-elevated)] animate-pulse"></div>)}</div>
        ) : (
          <section className="mb-32">
            <div className="flex items-center gap-6 mb-10">
              <span className="text-[var(--accent)] font-mono-tech text-sm">01</span>
              <h2 className="text-3xl font-extrabold uppercase text-[var(--text-primary)] tracking-tight">Mobiles</h2>
              <div className="h-px flex-grow bg-[var(--border)]"></div>
              <span className="text-xs text-[var(--text-muted)] font-mono-tech uppercase">{mobiles.length} Items</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--border)] border border-[var(--border)]">
              {mobiles.map((item, index) => (
                <motion.div key={item.id} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.3, delay: index * 0.01 }} onClick={() => setSelectedItem(item)} className="bg-[var(--bg-elevated)] group cursor-pointer transition-all duration-200 hover:bg-[var(--bg)] relative overflow-hidden flex flex-col">
                  
                  <div className={`h-24 bg-gradient-to-br ${getBrandGradient(item.brand)} relative`}>
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
                    <span className="absolute bottom-2 left-2 text-[10px] font-mono-tech text-white/80 uppercase tracking-widest bg-black/40 px-2 py-1 backdrop-blur-sm">{item.brand}</span>
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--accent)] transition-colors uppercase tracking-tight mt-1">{item.name}</h3>
                    <p className="text-[var(--text-secondary)] text-sm mb-6 min-h-[40px] flex-grow">{item.description}</p>
                    <div className="flex justify-between items-center pt-4 border-t border-[var(--border)] mt-auto">
                      <span className="text-xl font-bold text-[var(--text-primary)] font-mono-tech">₹{item.price.toLocaleString('en-IN')}</span>
                      <span className="text-[var(--text-muted)] text-[10px] font-mono-tech uppercase tracking-widest group-hover:text-[var(--accent)] transition-colors">[ View ]</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* THE ROADMAP / MISSION SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-32 border-t border-[var(--border)]">
        <div className="text-center mb-20">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl md:text-6xl font-extrabold uppercase tracking-tighter mb-4">The Road Ahead</motion.h2>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">We are on a mission to catalog the world's technology. The journey has just begun.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--border)] border border-[var(--border)]">
          {[
            { id: 2, name: 'Electronics', desc: 'Laptops, Wearables & Audio', quote: 'Cataloging the future of personal computing and seamless connectivity.', gradient: 'from-blue-900/40 via-transparent to-transparent' },
            { id: 3, name: 'Automobiles', desc: 'Cars, EVs & Super vehicles', quote: 'Driving the EV revolution and documenting the machines that move us.', gradient: 'from-orange-900/40 via-transparent to-transparent' },
            { id: 5, name: 'Firearms', desc: 'Pistols, Rifles & Tactical Gear', quote: 'Precision engineering for the modern era of defense and sport.', gradient: 'from-green-900/40 via-transparent to-transparent' }
          ].map((cat, index) => (
            <motion.div key={cat.id} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }} className={`bg-[var(--bg-elevated)] p-12 flex flex-col justify-between min-h-[300px] hover:bg-[var(--bg)] transition-colors group relative overflow-hidden bg-gradient-to-b ${cat.gradient}`}>
              <div className="relative z-10">
                <span className="text-xs font-mono-tech text-[var(--text-muted)] uppercase tracking-widest">0{cat.id}</span>
                <h3 className="text-3xl font-extrabold uppercase tracking-tight mt-2 text-[var(--text-primary)]">{cat.name}</h3>
                <p className="text-[var(--text-secondary)] mt-2">{cat.desc}</p>
                <p className="text-[var(--text-muted)] mt-8 text-sm italic">"{cat.quote}"</p>
              </div>
              <div className="mt-8 flex items-center gap-2 relative z-10">
                <span className="w-2 h-2 bg-[var(--accent)] rounded-full animate-pulse"></span>
                <span className="text-xs font-mono-tech text-[var(--accent)] uppercase tracking-widest">In Development</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* MODALS (Z-Index Fixed) */}
      <AnimatePresence>
        {selectedItem && <ProductModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {selectedBrand && <BrandModal brand={selectedBrand} onSelectItem={setSelectedItem} onClose={() => setSelectedBrand(null)} />}
      </AnimatePresence>
      
      {/* Command Center sits at z-[60], Modals at z-[70] so clicking a search result closes search and opens modal cleanly */}
      <AnimatePresence>
        {isCmdOpen && <CommandCenter items={items} onSelectItem={setSelectedItem} onClose={() => setIsCmdOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}