import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatModal from './ChatModal';
import { CustomCursor } from './PremiumUI'; // Assuming you made this file

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-md border-b border-gray-900' : 'bg-transparent'}`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-6 h-6 bg-[#14F195] rounded-sm flex items-center justify-center">
              <span className="text-black font-mono text-xs font-extrabold">S</span>
            </div>
            <span className="font-mono-tech text-sm font-bold tracking-tight uppercase">SpecPedia</span>
          </div>

          {/* Center Nav (Hidden on mobile) */}
          <div className="hidden md:flex items-center gap-8 text-xs font-mono-tech uppercase tracking-widest text-gray-500">
            <a
              href="#categories"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="hover:text-[#14F195] transition-colors"
            >
              Categories
            </a>
            <a
              href="#compare"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('compare')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="hover:text-[#14F195] transition-colors"
            >
              Compare
            </a>
            <a
              href="#docs"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('docs')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="hover:text-[#14F195] transition-colors"
            >
              Docs
            </a>
          </div>

          {/* Global AI Search Button */}
          <button 
            onClick={() => setIsChatOpen(true)}
            className="group flex items-center gap-2 bg-[#111111] border border-gray-800 px-4 py-2 text-xs font-mono-tech uppercase tracking-widest hover:border-[#14F195] hover:text-[#14F195] transition-colors rounded-sm"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            Ask AI
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isChatOpen && <ChatModal onClose={() => setIsChatOpen(false)} />}
      </AnimatePresence>
    </>
  );
}