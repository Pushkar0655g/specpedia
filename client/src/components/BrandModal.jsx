import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function BrandModal({ brand, onSelectItem, onClose }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (brand) {
      fetch(`${API}/api/items?brand=${encodeURIComponent(brand)}`)
        .then(res => res.json())
        .then(data => { 
          // Ensure we only get mobiles (category_id 1) for this modal
          const mobiles = data.filter(item => item.category_id === 1);
          setItems(mobiles); 
          setLoading(false); 
        })
        .catch(err => { console.error(err); setLoading(false); });
    }
  }, [brand]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-[var(--bg-elevated)] border border-[var(--border)] w-full max-w-4xl max-h-[80vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[var(--bg-elevated)] p-6 border-b border-[var(--border)] flex justify-between items-center z-10">
          <h2 className="text-3xl font-extrabold uppercase tracking-tight text-[var(--text-primary)]">
            {brand} <span className="text-[var(--text-muted)] text-sm font-mono-tech">({items.length} Models)</span>
          </h2>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--accent)] text-2xl">×</button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-[var(--bg)] animate-pulse"></div>)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[var(--border)] border border-[var(--border)]">
              {items.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => onSelectItem(item)}
                  className="bg-[var(--bg)] p-6 hover:bg-[var(--bg-elevated)] cursor-pointer transition-colors group"
                >
                  <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">{item.name}</h3>
                  <p className="text-[var(--text-secondary)] text-sm mt-1 line-clamp-2">{item.description}</p>
                  <div className="mt-4 text-[var(--accent)] font-mono-tech text-sm">₹{item.price.toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}