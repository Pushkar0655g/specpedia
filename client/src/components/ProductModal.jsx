import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatModal from './ChatModal';
import axios from 'axios';
import { getBrandGradient } from '../utils/brandGradients';

export default function ProductModal({ item, onClose }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [tooltip, setTooltip] = useState({ key: null, text: null, loading: false });

  const explainSpec = async (key, value) => {
    if (tooltip.key === key) {
      setTooltip({ key: null, text: null, loading: false }); // Toggle close
      return;
    }
    setTooltip({ key, text: null, loading: true });
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/ai/chat`, {
        message: `Explain what "${key}: ${value}" means on a smartphone in exactly 1 simple sentence.`
      });
      setTooltip({ key, text: res.data.reply, loading: false });
    } catch (err) {
      setTooltip({ key, text: "Could not fetch explanation.", loading: false });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 30, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 30, opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-[var(--bg-elevated)] border border-[var(--border)] max-w-2xl w-full relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient Header */}
        <div className={`h-48 bg-gradient-to-br ${getBrandGradient(item.brand)} relative flex items-end p-6`}>
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl z-10">×</button>
          <div className="bg-black/40 backdrop-blur-sm px-3 py-1 text-xs font-mono-tech text-white uppercase tracking-widest border border-white/20">
            {item.brand}
          </div>
        </div>

        <div className="p-8">
          <h2 className="text-4xl font-extrabold uppercase tracking-tight mb-3">{item.name}</h2>
          <p className="text-[var(--text-secondary)] mb-8">{item.description}</p>
          
          <div className="text-3xl font-bold text-[var(--text-primary)] font-mono mb-10 border-t border-b border-[var(--border)] py-4">
            ₹{item.price.toLocaleString('en-IN')}
          </div>

          <div className="grid grid-cols-2 gap-0 mb-8 border border-[var(--border)]">
            {Object.entries(item.specs).map(([key, value]) => (
              <div key={key} className="p-4 border-r border-b border-[var(--border)] relative">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-[var(--text-muted)] font-mono uppercase">{key}</span>
                  <button onClick={() => explainSpec(key, value)} className="text-[var(--text-muted)] hover:text-[var(--accent)] text-[10px] border border-[var(--border)] rounded-full w-4 h-4 flex items-center justify-center">?</button>
                </div>
                <div className="text-[var(--text-primary)] font-bold uppercase">{value}</div>
                
                {/* Tooltip */}
                {tooltip.key === key && (
                  <div className="absolute left-0 right-0 top-full z-20 bg-black border border-[var(--accent)] p-2 text-xs text-[var(--text-secondary)] normal-case font-sans shadow-2xl">
                    {tooltip.loading ? 'Thinking...' : tooltip.text}
                  </div>
                )}
              </div>
            ))}
          </div>

          <button 
            onClick={() => setIsChatOpen(true)}
            className="w-full py-4 bg-[var(--accent)] text-[var(--accent-contrast)] font-extrabold uppercase tracking-wider text-sm hover:opacity-80 transition-opacity flex items-center justify-center gap-2"
          >
            <span>⚡</span> Ask AI About This Product
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {isChatOpen && <ChatModal item={item} onClose={() => setIsChatOpen(false)} />}
      </AnimatePresence>
    </motion.div>
  );
}