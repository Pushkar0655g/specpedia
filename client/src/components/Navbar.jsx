import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatModal from './ChatModal';
import ThemeSwitcher from '../theme/ThemeSwitcher';

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
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${scrolled ? 'bg-[var(--bg-elevated)]/80 backdrop-blur-md border-b border-[var(--border)]' : 'bg-transparent'}`}
      >
        {/* Navbar is now just a floating right-aligned bar */}
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-end items-center gap-4">
          <div className="hidden sm:block">
            <ThemeSwitcher />
          </div>
          <button 
            onClick={() => setIsChatOpen(true)}
            className="group flex items-center gap-2 bg-[var(--bg-elevated)] border border-[var(--border)] px-4 py-2 text-xs font-mono-tech uppercase tracking-widest hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors rounded-sm"
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
        {isChatOpen && <ChatModal onClose={() => setIsChatOpen(null)} />}
      </AnimatePresence>
    </>
  );
}