import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../lib/api';
import useEscape from '../hooks/useEscape';

export default function BrandModal({ brand, onSelectItem, onClose }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEscape(onClose);

  const loadBrandItems = () => {
    if (!brand) return;
    setLoading(true);
    setError(null);
    api.get('/items', { params: { brand } })
      .then(res => {
        setItems(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching brand items:', err);
        setError('Could not retrieve scrolls for this house from the archive.');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadBrandItems();
  }, [brand]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center"
      style={{ padding: 'var(--space-4)', background: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full relative overflow-hidden"
        style={{
          maxWidth: '800px',
          maxHeight: '80vh',
          overflowY: 'auto',
          background: 'var(--color-bg-surface)',
          border: 'var(--border-thick)',
          boxShadow: 'var(--shadow-hard-lg)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 flex justify-between items-center" style={{
          background: 'var(--color-bg-surface)',
          padding: 'var(--space-5) var(--space-6)',
          borderBottom: 'var(--border-thick)',
        }}>
          <div className="flex items-baseline" style={{ gap: 'var(--space-3)' }}>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-2xl)',
              fontWeight: 700,
              letterSpacing: '0.02em',
            }}>
              {brand}
            </h2>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
            }}>
              {items.length} codex entries
            </span>
          </div>
          <button
            onClick={onClose}
            className="codex-modal-close"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div style={{ padding: 'var(--space-6)' }}>
          {error ? (
            <div style={{
              background: 'var(--color-bg-primary)',
              border: 'var(--border-thick)',
              padding: 'var(--space-8) var(--space-6)',
              textAlign: 'center',
              boxShadow: 'var(--shadow-hard-sm)',
            }}>
              <p style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-base)',
                fontWeight: 700,
                color: 'var(--color-error)',
                marginBottom: 'var(--space-4)',
              }}>
                {error}
              </p>
              <button
                onClick={loadBrandItems}
                className="codex-btn"
                style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-3) var(--space-6)' }}
              >
                Retry Consultation
              </button>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 'var(--space-4)' }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="codex-skeleton" style={{ height: '100px' }} />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div style={{
              padding: 'var(--space-8) var(--space-5)',
              textAlign: 'center',
              color: 'var(--color-text-muted)',
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-mono)',
            }}>
              No tablets found for this manufacturer.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 'var(--space-4)' }}>
              {items.map(item => (
                <div
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectItem(item);
                    }
                  }}
                  className="codex-card cursor-pointer group"
                  style={{ padding: 'var(--space-5)' }}
                >
                  <h3 style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'var(--text-base)',
                    fontWeight: 700,
                    transition: 'color 0.15s ease',
                  }}
                  className="group-hover:!text-[#7A3E2C]"
                  >
                    {item.name}
                  </h3>
                  <p style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: 'var(--text-sm)',
                    marginTop: 'var(--space-1)',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: 1.5,
                  }}>
                    {item.description}
                  </p>
                  <div style={{
                    marginTop: 'var(--space-3)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 700,
                    color: 'var(--color-primary)',
                  }}>
                    ₹{item.price.toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}