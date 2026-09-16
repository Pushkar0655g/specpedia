import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatModal from './ChatModal';
import api from '../lib/api';
import { useWatchlist } from '../context/WatchlistContext';
import useEscape from '../hooks/useEscape';

// Module-level client-side cache
const clientExplainCache = new Map();

export default function ProductModal({ item, onClose, onCompareStage }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [tooltip, setTooltip] = useState({ key: null, text: null, loading: false });
  const { isItemWatched, toggleWatchlist } = useWatchlist();

  useEscape(onClose);

  const explainSpec = async (key, value) => {
    if (tooltip.key === key) {
      setTooltip({ key: null, text: null, loading: false });
      return;
    }

    const cacheKey = `${key}:${String(value)}`;
    if (clientExplainCache.has(cacheKey)) {
      setTooltip({ key, text: clientExplainCache.get(cacheKey), loading: false });
      return;
    }

    setTooltip({ key, text: null, loading: true });
    try {
      const res = await api.post('/ai/explain', {
        key,
        value: String(value)
      });
      const explanation = res.data.explanation;
      clientExplainCache.set(cacheKey, explanation);
      setTooltip({ key, text: explanation, loading: false });
    } catch (_err) {
      setTooltip({ key, text: "Explanation unavailable right now.", loading: false });
    }
  };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ padding: 'var(--space-4)', background: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full relative overflow-hidden"
        style={{
          maxWidth: '700px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'var(--color-bg-surface)',
          border: 'var(--border-thick)',
          boxShadow: 'var(--shadow-hard-lg)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start" style={{
          padding: 'var(--space-8)',
          paddingBottom: 'var(--space-6)',
          borderBottom: 'var(--border-thick)',
        }}>
          <div>
            <div className="flex items-center gap-3">
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
              }}>
                {item.brand}
              </span>
              {item.last_verified_at && (
                <span
                  className="codex-verified-stamp"
                  aria-label="Verified MMXXV"
                >
                  VERIFIED · MMXXV
                </span>
              )}
            </div>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-3xl)',
              fontWeight: 700,
              letterSpacing: '0.02em',
              marginTop: 'var(--space-1)',
            }}>
              {item.name}
            </h2>
            <p
              className="codex-dropcap"
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--text-sm)',
                marginTop: 'var(--space-2)',
                lineHeight: 1.6,
              }}
            >
              {item.description}
            </p>
            <button
              type="button"
              onClick={() => onCompareStage?.(item)}
              className="codex-chip"
              style={{
                fontSize: 'var(--text-xs)',
                marginTop: 'var(--space-3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-1)',
              }}
            >
              ⚔️ Add to compare
            </button>
          </div>
          <div className="flex items-center" style={{ gap: 'var(--space-2)', marginLeft: 'var(--space-4)' }}>
            <button
              type="button"
              aria-label={`Bookmark ${item.name}`}
              aria-pressed={isItemWatched(item.id)}
              onClick={() => toggleWatchlist(item)}
              className="codex-btn-secondary"
              style={{
                padding: 'var(--space-2) var(--space-3)',
                minHeight: '36px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                color: isItemWatched(item.id) ? 'var(--color-accent)' : 'inherit',
                fontSize: 'var(--text-xs)',
                fontFamily: 'var(--font-mono)',
              }}
              title={isItemWatched(item.id) ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill={isItemWatched(item.id) ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              <span>{isItemWatched(item.id) ? 'Watched' : 'Bookmark'}</span>
            </button>
            <button
              onClick={onClose}
              className="codex-modal-close"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
        </div>

        <div style={{ padding: 'var(--space-8)' }}>
          {/* Price */}
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-3xl)',
            fontWeight: 700,
            marginBottom: 'var(--space-6)',
            color: 'var(--color-primary)',
          }}>
            ₹{item.price.toLocaleString('en-IN')}
          </div>

          {/* The Codex Score Section */}
          <div
            style={{
              marginBottom: 'var(--space-8)',
              padding: 'var(--space-5)',
              background: 'var(--color-bg-primary)',
              border: 'var(--border-thin)',
              boxShadow: 'var(--shadow-hard-sm)',
            }}
          >
            <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-4)' }}>
              <div>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    color: 'var(--color-accent)',
                    letterSpacing: '0.1em',
                    fontWeight: 700,
                  }}
                >
                  Algorithmic Assessment
                </span>
                <h3
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'var(--text-xl)',
                    fontWeight: 700,
                    marginTop: '2px',
                  }}
                >
                  SpecPedia Score
                </h3>
              </div>
              <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                <span className="codex-quality-seal" style={{ fontSize: '11px', padding: '2px 6px' }} title="Quality: absolute spec tier">
                  Q·{item.codexScore?.quality ?? 50}
                </span>
                <span className="codex-value-seal" style={{ fontSize: '11px', padding: '2px 6px' }} title="Value: spec-per-rupee index">
                  V·{item.codexScore?.value ?? 50}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                  = {item.codexScore?.score ?? 50}
                </span>
              </div>
            </div>

            {/* Breakdown Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {(item.codexScore?.breakdown || [
                { label: 'Battery', points: 85, max: 100, note: 'Endurance capacity rating' },
                { label: 'Silicon', points: 80, max: 100, note: 'Processor architecture tier' },
                { label: 'Display', points: 85, max: 100, note: 'Refresh rate and panel quality' },
              ]).map((b) => (
                <div key={b.label}>
                  <div className="flex justify-between items-baseline" style={{ marginBottom: '4px' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 600,
                      }}
                    >
                      {b.label}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 700,
                        color: 'var(--color-primary)',
                      }}
                    >
                      {b.points} <span style={{ color: 'var(--color-text-muted)' }}>/ {b.max}</span>
                    </span>
                  </div>

                  {/* Horizontal Segmented Bar */}
                  <div
                    style={{
                      height: '8px',
                      background: 'var(--color-bg-surface)',
                      border: '1px solid var(--color-border-heavy)',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(100, Math.max(0, (b.points / b.max) * 100))}%`,
                        height: '100%',
                        background: 'var(--color-primary)',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>

                  {/* Marginalia Note */}
                  <p
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--color-text-muted)',
                      fontStyle: 'italic',
                      marginTop: '3px',
                    }}
                  >
                    Note: {b.note}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Specs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
            {Object.entries(item.specs).map(([key, value]) => (
              <div key={key} style={{
                padding: 'var(--space-4)',
                background: 'var(--color-bg-primary)',
                border: 'var(--border-thin)',
                position: 'relative',
              }}>
                <div className="flex items-center" style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}>
                    {key}
                  </span>
                  <button
                    onClick={() => explainSpec(key, value)}
                    style={{
                      width: '18px',
                      height: '18px',
                      border: 'var(--border-thin)',
                      background: tooltip.key === key ? 'var(--color-accent)' : 'transparent',
                      color: tooltip.key === key ? '#000' : 'var(--color-text-muted)',
                      fontSize: '10px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    ?
                  </button>
                </div>
                <div style={{
                  color: 'var(--color-text-primary)',
                  fontWeight: 600,
                  fontSize: 'var(--text-sm)',
                }}>
                  {value}
                </div>

                {/* Tooltip */}
                {tooltip.key === key && (
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: '100%',
                    zIndex: 20,
                    marginTop: '2px',
                    background: 'var(--color-bg-surface)',
                    border: 'var(--border-thin)',
                    padding: 'var(--space-3)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-secondary)',
                    fontFamily: 'var(--font-mono)',
                    boxShadow: 'var(--shadow-hard-sm)',
                  }}>
                    {tooltip.loading ? 'Explaining…' : tooltip.text}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={() => setIsChatOpen(true)}
            className="codex-btn w-full"
            style={{ fontSize: 'var(--text-base)' }}
          >
            Ask Oracle about this device
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {isChatOpen && <ChatModal item={item} onClose={() => setIsChatOpen(false)} />}
      </AnimatePresence>
    </motion.div>
  );
}