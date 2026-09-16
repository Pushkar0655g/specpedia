import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import useEscape from '../hooks/useEscape';

export default function CommandCenter({ items, onSelectItem, onClose }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEscape(onClose);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = items.filter(item =>
    item.name.toLowerCase().includes(query.toLowerCase()) ||
    item.brand.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 6);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (filtered.length > 0 ? (prev + 1) % filtered.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (filtered.length > 0 ? (prev - 1 + filtered.length) % filtered.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        onSelectItem(filtered[selectedIndex]);
        onClose();
      }
    }
  };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-start justify-center"
      style={{ padding: 'var(--space-4)', paddingTop: '18vh', background: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="w-full overflow-hidden"
        style={{
          maxWidth: '520px',
          background: 'var(--color-bg-surface)',
          border: 'var(--border-thick)',
          boxShadow: 'var(--shadow-hard-lg)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search devices… (↑↓ to navigate, Enter to select)"
          aria-label="Search devices"
          style={{
            width: '100%',
            background: 'transparent',
            padding: 'var(--space-5)',
            fontSize: 'var(--text-base)',
            fontFamily: 'var(--font-body)',
            color: 'var(--color-text-primary)',
            outline: 'none',
            border: 'none',
            borderBottom: 'var(--border-thick)',
          }}
        />
        <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
          {filtered.length > 0 ? (
            filtered.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => { onSelectItem(item); onClose(); }}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`codex-command-row group ${selectedIndex === idx ? 'is-selected' : ''}`}
                style={{
                  background: selectedIndex === idx ? 'var(--color-bg-surface-2)' : 'transparent',
                }}
              >
                <div>
                  <span style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 600,
                    color: selectedIndex === idx ? 'var(--color-primary)' : 'var(--color-text-primary)',
                    display: 'block',
                    transition: 'color 0.15s ease',
                  }}
                  className="group-hover:!text-[#7A3E2C]"
                  >
                    {item.name}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-muted)',
                  }}>
                    {item.brand}
                  </span>
                </div>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-muted)',
                }}>
                  ₹{item.price.toLocaleString('en-IN')}
                </span>
              </button>
            ))
          ) : (
            <div style={{
              padding: 'var(--space-8) var(--space-5)',
              textAlign: 'center',
              color: 'var(--color-text-muted)',
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-mono)',
            }}>
              {query ? 'No matching devices.' : 'Start typing to search…'}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}