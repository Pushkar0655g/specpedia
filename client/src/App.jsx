import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './components/Home';
import DeviceFolio from './components/DeviceFolio';
import Lexicon from './components/Lexicon';
import Scriptorium from './components/Scriptorium';
import NotFound from './components/NotFound';
import Footer from './components/Footer';
import WatchlistDrawer from './components/WatchlistDrawer';
import AuthModal from './components/AuthModal';
import useScrollProgress from './hooks/useScrollProgress';
import { WatchlistProvider, useWatchlist } from './context/WatchlistContext';

function AppContent() {
  const { isAuthModalOpen, setIsAuthModalOpen } = useWatchlist();
  const scrollProgress = useScrollProgress();

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>
      {/* Ink Scroll Progress Bar */}
      <div
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Scroll reading progress"
        className="fixed top-0 left-0 right-0 h-[3px] z-[60] origin-left pointer-events-none"
        style={{
          background: 'var(--color-accent)',
          transform: `scaleX(${scrollProgress})`,
          transition: 'transform 0.06s linear',
        }}
      />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/device/:slug" element={<DeviceFolio />} />
          <Route path="/lexicon" element={<Lexicon />} />
          <Route path="/about" element={<Scriptorium />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />

      <AnimatePresence>
        <WatchlistDrawer />
      </AnimatePresence>

      <AnimatePresence>
        {isAuthModalOpen && (
          <AuthModal onClose={() => setIsAuthModalOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <WatchlistProvider>
      <AppContent />
    </WatchlistProvider>
  );
}

export default App;