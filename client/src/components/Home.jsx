import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ProductModal from './ProductModal';
import ChatModal from './ChatModal';
import { CustomCursor, MagneticButton } from './PremiumUI';

const categoryConfig = {
  1: { name: 'Mobiles' },
  2: { name: 'Laptops' },
  3: { name: 'Cars' },
  4: { name: 'Motorcycles' },
  5: { name: 'Guns' }
};

export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [compareItem, setCompareItem] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/items')
      .then(res => res.json())
      .then(data => { setItems(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category_id]) acc[item.category_id] = [];
    acc[item.category_id].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-black text-white relative">
      <CustomCursor />

      {/* === HERO SECTION === */}
      <section className="relative min-h-screen flex items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1620207418302-439b387441b0?q=80&w=2574&auto=format&fit=crop" className="w-full h-full object-cover opacity-20" alt="SpecPedia Background" />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/70 to-black"></div>
          <div className="absolute inset-0 grid-bg opacity-50"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <motion.span 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-block px-3 py-1 mb-8 text-[10px] font-bold tracking-[0.2em] border border-gray-800 text-gray-400 font-mono-tech uppercase bg-black/50 backdrop-blur-sm"
          >
            // The Ultimate Product Encyclopedia
          </motion.span>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-[9rem] font-extrabold tracking-tighter uppercase leading-[0.85] mb-8"
          >
            Specs.<br/>Reimagined.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="text-gray-500 text-lg max-w-xl mx-auto mb-12 font-light"
          >
            Explore 250+ products with AI-driven insights. Compare specs, chat with data, and experience the future of product research.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <MagneticButton
              onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}
              className="bg-[#14F195] text-black font-bold px-10 py-4 uppercase tracking-wider text-xs hover:bg-white transition-colors"
            >
              Browse Database →
            </MagneticButton>
            <MagneticButton
              onClick={() => alert('Welcome to SpecPedia! Scroll down to explore our database of 50 premium products. Click any card to view specs and chat with AI.')}
              className="border border-gray-800 text-white font-bold px-10 py-4 uppercase tracking-wider text-xs hover:border-[#14F195] hover:text-[#14F195] transition-colors"
            >
              How it Works
            </MagneticButton>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-600 text-[10px] font-mono-tech uppercase tracking-widest"
        >
          Scroll to Explore
        </motion.div>
      </section>

      {/* === MARQUEE === */}
      <div id="categories" className="border-y border-gray-900 overflow-hidden py-8 bg-[#050505]">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center mx-4">
              {Object.values(categoryConfig).map(cat => (
                <span key={cat.name} className="text-4xl font-extrabold text-gray-900 mx-8 hover:text-[#14F195] transition-colors uppercase font-mono-tech">
                  {cat.name} <span className="text-gray-800">/</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div
          onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}
          className="bg-black p-8 border-b border-gray-900 flex items-center justify-center group cursor-pointer hover:bg-[#111111] transition-colors"
        >
          <h3 className="text-2xl font-extrabold uppercase text-gray-500 group-hover:text-[#14F195] transition-colors">
            View All →
          </h3>
        </div>
      </div>

      <span id="compare" className="block pt-24 -mt-24"></span>

      {/* === PRODUCT GRID === */}
      <div id="products" className="max-w-7xl mx-auto px-6 py-32">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-900">
            {[...Array(6)].map((_, i) => <div key={i} className="h-[250px] bg-[#0a0a0a] animate-pulse"></div>)}
          </div>
        ) : (
          Object.keys(groupedItems).map(catId => (
            <section key={catId} className="mb-32">
              <div className="flex items-center gap-6 mb-10">
                <span className="text-[#14F195] font-mono-tech text-sm">0{catId}</span>
                <h2 className="text-3xl font-extrabold uppercase text-white tracking-tight">
                  {categoryConfig[catId]?.name}
                </h2>
                <div className="h-px flex-grow bg-gray-900"></div>
                <span className="text-xs text-gray-600 font-mono-tech uppercase">{groupedItems[catId].length} Items</span>
              </div>
              
              {/* Grid with gap-px and bg-gray-900 creates a clean 1px border system */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-900 border border-gray-900">
                {groupedItems[catId].map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => setSelectedItem(item)}
                    className="bg-[#0a0a0a] p-8 group cursor-pointer transition-all duration-200 hover:bg-[#111111] relative overflow-hidden"
                  >
                    {/* Hover gradient line at top */}
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#14F195] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#14F195] transition-colors uppercase tracking-tight">
                      {item.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-8 min-h-[40px] font-light">{item.description}</p>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-gray-900">
                      <span className="text-xl font-bold text-white font-mono-tech">
                        ₹{item.price.toLocaleString('en-IN')}
                      </span>
                      <div className="flex gap-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCompareItem(item);
                          }}
                          className="text-gray-600 text-[10px] font-mono-tech uppercase tracking-widest hover:text-white transition-colors"
                        >
                          [ Compare ]
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem(item);
                          }}
                          className="text-gray-700 text-[10px] font-mono-tech uppercase tracking-widest group-hover:text-[#14F195] transition-colors"
                        >
                          [ View Details ]
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      <section id="docs" className="max-w-7xl mx-auto px-6 py-24">
        <div className="rounded-[2rem] border border-gray-900 bg-[#050505] p-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-4xl font-extrabold uppercase tracking-tight text-white">Docs</h2>
              <p className="mt-4 max-w-2xl text-gray-500">
                Learn how to browse product categories, compare specs, and use the AI assistant to answer questions with data-backed detail.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="#products" className="rounded-full bg-[#14F195] px-6 py-3 text-xs font-bold uppercase tracking-widest text-black transition hover:bg-white">
                Explore Products
              </a>
              <button
                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                className="rounded-full border border-gray-800 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:border-[#14F195] hover:text-[#14F195]"
              >
                Start Comparing
              </button>
            </div>
          </div>
        </div>
      </section>

      {selectedItem && <ProductModal item={selectedItem} onClose={() => setSelectedItem(null)} />}

      {compareItem && (
        <ChatModal
          item={compareItem}
          initialPrompt={`Compare the ${compareItem.name} with `}
          onClose={() => setCompareItem(null)}
        />
      )}
    </div>
  );
}