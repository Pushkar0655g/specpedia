import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CommandCenter({ items, onSelectItem, onClose }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = items.filter(item => 
    item.name.toLowerCase().includes(query.toLowerCase()) || 
    item.brand.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 6);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-start justify-center pt-[15vh] p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: -20, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: -20, opacity: 0 }}
        className="bg-[var(--bg-elevated)] border border-[var(--border)] w-full max-w-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search phones or brands..."
          className="w-full bg-transparent px-6 py-4 text-lg text-[var(--text-primary)] outline-none border-b border-[var(--border)] font-mono-tech"
        />
        <div className="max-h-[300px] overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map(item => (
              <div 
                key={item.id} 
                onClick={() => { onSelectItem(item); onClose(); }}
                className="px-6 py-3 hover:bg-[var(--bg)] cursor-pointer flex justify-between items-center group"
              >
                <div>
                  <span className="text-[var(--text-primary)] group-hover:text-[var(--accent)] block">{item.name}</span>
                  <span className="text-xs text-[var(--text-muted)] font-mono-tech uppercase">{item.brand}</span>
                </div>
                <span className="text-[var(--text-muted)] font-mono-tech text-sm">₹{item.price.toLocaleString('en-IN')}</span>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-[var(--text-muted)] text-sm">No results found.</div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}