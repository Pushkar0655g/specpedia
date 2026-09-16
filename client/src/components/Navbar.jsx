import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ChatModal from './ChatModal';
import { useTheme } from '../theme/ThemeContext';
import { useWatchlist } from '../context/WatchlistContext';
import useEscape from '../hooks/useEscape';
import SealMark from './SealMark';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { toggleTheme, isMidnight } = useTheme();
  const { user, watchlist, setIsWatchlistDrawerOpen, setIsAuthModalOpen } = useWatchlist();

  // Close mobile drawer on Escape key
  useEscape(() => {
    if (menuOpen) setMenuOpen(false);
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on resize to desktop
  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { label: 'Catalog', href: '#archive' },
    { label: 'Oracle', href: '#oracle' },
    { label: 'Price Trends', href: '#chronicle' },
    { label: 'Glossary', href: '/lexicon' },
    { label: 'About', href: '/about' },
  ];

  const handleNavClick = (href) => {
    setMenuOpen(false);
    if (href.startsWith('/')) {
      navigate(href);
    } else {
      if (location.pathname !== '/') {
        navigate(`/${href}`);
      } else {
        const id = href.replace('#', '');
        const el = document.getElementById(id) || document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const ThemeIcon = () => isMidnight ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );

  return (
    <>
      <nav
        style={{
          background: scrolled ? 'var(--color-bg-primary)' : 'transparent',
          borderBottom: scrolled ? 'var(--border-thick)' : '4px solid transparent',
          transition: 'background 0.3s ease, border-color 0.3s ease',
        }}
        className="fixed top-0 left-0 w-full z-40"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between"
          style={{ padding: 'var(--space-4) var(--space-6)', minHeight: '64px' }}
        >
          {/* Logo */}
          <a href="/" className="font-heading" style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-3xl)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            textDecoration: 'none',
            letterSpacing: '0.02em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}>
            <SealMark variant="colour" size={30} />
            <span>Spec<span style={{ color: 'var(--color-primary)' }}>Pedia</span></span>
          </a>

          {/* Desktop Nav Links & Theme Toggle */}
          <div className="hidden md:flex items-center" style={{ gap: 'var(--space-6)' }}>
            {navLinks.map(link => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href)}
                className="codex-nav-link"
              >
                {link.label}
              </button>
            ))}

            {/* Watchlist / Sign in button */}
            {user ? (
              <button
                onClick={() => setIsWatchlistDrawerOpen(true)}
                className="codex-btn-secondary"
                style={{
                  padding: 'var(--space-2) var(--space-4)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  minHeight: '38px',
                  fontSize: 'var(--text-xs)',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.04em',
                }}
                aria-label={`View watchlist containing ${watchlist.length} items`}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                <span>Watchlist ({watchlist.length})</span>
              </button>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="codex-btn-secondary"
                style={{
                  padding: 'var(--space-2) var(--space-4)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  minHeight: '38px',
                  fontSize: 'var(--text-xs)',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.04em',
                }}
              >
                Sign in
              </button>
            )}

            {/* Sun / Moon Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="codex-btn-secondary"
              style={{
                padding: 'var(--space-2) var(--space-3)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '38px',
              }}
              aria-label={`Switch to ${isMidnight ? 'parchment' : 'midnight'} theme`}
              title={`Switch to ${isMidnight ? 'Parchment' : 'Midnight'} Theme`}
            >
              <ThemeIcon />
            </button>

            <button
              onClick={() => setIsChatOpen(true)}
              className="codex-btn"
              style={{ padding: 'var(--space-2) var(--space-5)', fontSize: 'var(--text-xs)' }}
            >
              Ask Oracle
            </button>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex md:hidden items-center" style={{ gap: 'var(--space-2)' }}>
            {user ? (
              <button
                onClick={() => setIsWatchlistDrawerOpen(true)}
                className="codex-btn-secondary"
                style={{
                  padding: 'var(--space-2)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '38px',
                  gap: '4px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                }}
                aria-label={`Watchlist (${watchlist.length})`}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                <span>{watchlist.length}</span>
              </button>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="codex-btn-secondary"
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  minHeight: '38px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                Sign in
              </button>
            )}
            <button
              onClick={toggleTheme}
              className="codex-btn-secondary"
              style={{
                padding: 'var(--space-2)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '38px',
                minWidth: '38px',
              }}
              aria-label={`Switch to ${isMidnight ? 'parchment' : 'midnight'} theme`}
            >
              <ThemeIcon />
            </button>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 'var(--space-2)',
                color: 'var(--color-text-primary)',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square">
                {menuOpen ? (
                  <>
                    <line x1="4" y1="4" x2="20" y2="20" />
                    <line x1="20" y1="4" x2="4" y2="20" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[45]"
              style={{ background: 'rgba(0,0,0,0.3)' }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Mobile Navigation"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 right-0 h-full z-[46]"
              style={{
                width: '280px',
                background: 'var(--color-bg-primary)',
                borderLeft: 'var(--border-thick)',
                padding: 'var(--space-8) var(--space-6)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)',
              }}
            >
              <div style={{ marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', fontWeight: 700 }}>
                  Navigation
                </span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="codex-modal-close"
                  aria-label="Close navigation"
                >
                  ×
                </button>
              </div>
              {navLinks.map(link => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'var(--text-lg)',
                    color: 'var(--color-text-primary)',
                    background: 'none',
                    border: 'none',
                    borderBottom: 'var(--border-subtle)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    padding: 'var(--space-4) 0',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  {link.label}
                </button>
              ))}

              {/* Mobile Watchlist Link */}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  if (user) {
                    setIsWatchlistDrawerOpen(true);
                  } else {
                    setIsAuthModalOpen(true);
                  }
                }}
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'var(--text-lg)',
                  color: 'var(--color-text-primary)',
                  background: 'none',
                  border: 'none',
                  borderBottom: 'var(--border-subtle)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  padding: 'var(--space-4) 0',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>{user ? `Watchlist (${watchlist.length})` : 'Sign in'}</span>
                <span style={{ fontSize: 'var(--text-sm)' }}>🔖</span>
              </button>

              <div style={{ marginTop: 'var(--space-4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                  Theme: {isMidnight ? 'Midnight' : 'Parchment'}
                </span>
                <button
                  onClick={toggleTheme}
                  className="codex-btn-secondary"
                  style={{ padding: 'var(--space-2)', minHeight: '36px' }}
                >
                  <ThemeIcon />
                </button>
              </div>

              <button
                onClick={() => { setMenuOpen(false); setIsChatOpen(true); }}
                className="codex-btn"
                style={{ marginTop: 'var(--space-6)', textAlign: 'center', width: '100%' }}
              >
                Ask Oracle
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isChatOpen && <ChatModal onClose={() => setIsChatOpen(false)} />}
      </AnimatePresence>
    </>
  );
}