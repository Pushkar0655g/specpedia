import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../lib/api';
import useEscape from '../hooks/useEscape';
import { formatAIResponse } from './ChatModal';
import OracleSeal from './OracleSeal';

export default function CompareModal({ ids, onClose, onSelectItem: _onSelectItem }) {
  const [itemA, setItemA] = useState(null);
  const [itemB, setItemB] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verdict, setVerdict] = useState(null);
  const [verdictLoading, setVerdictLoading] = useState(false);

  useEscape(onClose);

  useEffect(() => {
    if (!ids || ids.length < 2) return;
    setLoading(true);
    setError(null);

    Promise.all([
      api.get(`/items/${ids[0]}`).then((r) => r.data),
      api.get(`/items/${ids[1]}`).then((r) => r.data),
    ])
      .then(([a, b]) => {
        setItemA(a);
        setItemB(b);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load items for comparison:', err);
        setError('Could not retrieve both devices for comparison.');
        setLoading(false);
      });
  }, [ids]);

  const requestVerdict = async () => {
    if (!itemA || !itemB) return;
    setVerdictLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        message: 'Compare these two devices and give a Final Verdict.',
        context: {
          name: `${itemA.name} vs ${itemB.name}`,
          specs: {
            [itemA.name]: itemA.specs,
            [itemB.name]: itemB.specs,
          },
        },
      });
      setVerdict(res.data.reply);
    } catch (err) {
      console.error('Verdict failed:', err);
      setVerdict('Comparison summary unavailable right now.');
    } finally {
      setVerdictLoading(false);
    }
  };

  const specKeys = Array.from(
    new Set([
      ...Object.keys(itemA?.specs || {}),
      ...Object.keys(itemB?.specs || {}),
    ])
  );

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ padding: 'var(--space-4)', background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full relative overflow-hidden"
        style={{
          maxWidth: '900px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'var(--color-bg-surface)',
          border: 'var(--border-thick)',
          boxShadow: 'var(--shadow-hard-lg)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex justify-between items-center"
          style={{
            padding: 'var(--space-6) var(--space-8)',
            borderBottom: 'var(--border-thick)',
            background: 'var(--color-bg-surface)',
          }}
        >
          <div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-accent)',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                fontWeight: 700,
              }}
            >
              Side-by-Side Comparison
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-2xl)',
                fontWeight: 700,
                marginTop: 'var(--space-1)',
              }}
            >
              Device Comparison
            </h2>
          </div>
          <button
            onClick={onClose}
            className="codex-modal-close"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 'var(--space-8)' }}>
          {loading ? (
            <div className="grid grid-cols-2" style={{ gap: 'var(--space-6)' }}>
              <div className="codex-skeleton" style={{ height: '300px' }} />
              <div className="codex-skeleton" style={{ height: '300px' }} />
            </div>
          ) : error ? (
            <div
              style={{
                padding: 'var(--space-8)',
                textAlign: 'center',
                color: 'var(--color-error)',
                fontFamily: 'var(--font-heading)',
              }}
            >
              {error}
            </div>
          ) : itemA && itemB ? (
            <div>
              {/* Product Header Cards */}
              <div
                className="grid grid-cols-2"
                style={{ gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}
              >
                {[itemA, itemB].map((item, idx) => (
                  <div
                    key={item.id}
                    className="codex-card flex flex-col justify-between"
                    style={{
                      background: 'var(--color-bg-primary)',
                      padding: 'var(--space-5)',
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-text-muted)',
                          textTransform: 'uppercase',
                        }}
                      >
                        Slot {idx === 0 ? 'I' : 'II'} · {item.brand}
                      </span>
                      <h3
                        style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: 'var(--text-xl)',
                          fontWeight: 700,
                          marginTop: 'var(--space-1)',
                          marginBottom: 'var(--space-2)',
                        }}
                      >
                        {item.name}
                      </h3>
                    </div>
                    <div>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 'var(--text-2xl)',
                          fontWeight: 700,
                          color: 'var(--color-primary)',
                        }}
                      >
                        ₹{item.price.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Spec Comparison Table */}
              <div
                style={{
                  border: 'var(--border-thick)',
                  background: 'var(--color-bg-primary)',
                  marginBottom: 'var(--space-8)',
                }}
              >
                <div
                  className="grid grid-cols-3"
                  style={{
                    padding: 'var(--space-3) var(--space-4)',
                    background: 'var(--color-bg-surface-2)',
                    borderBottom: 'var(--border-thin)',
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  <div>Specification</div>
                  <div>{itemA.name}</div>
                  <div>{itemB.name}</div>
                </div>

                {specKeys.map((key) => {
                  const valA = String(itemA.specs?.[key] || '—');
                  const valB = String(itemB.specs?.[key] || '—');
                  const differs = valA.toLowerCase() !== valB.toLowerCase();

                  return (
                    <div
                      key={key}
                      className="grid grid-cols-3 items-center"
                      style={{
                        padding: 'var(--space-3) var(--space-4)',
                        borderBottom: 'var(--border-subtle)',
                        borderLeft: differs ? '4px solid var(--color-accent)' : '4px solid transparent',
                        background: differs ? 'var(--color-bg-surface)' : 'transparent',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                      }}
                    >
                      <div style={{ fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                        {key}
                      </div>
                      <div style={{ color: 'var(--color-text-primary)', fontWeight: differs ? 600 : 400 }}>
                        {valA}
                      </div>
                      <div style={{ color: 'var(--color-text-primary)', fontWeight: differs ? 600 : 400 }}>
                        {valB}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Oracle Verdict Action */}
              <div className="text-center" style={{ marginBottom: 'var(--space-6)' }}>
                {verdictLoading ? (
                  <div className="flex items-center justify-center gap-3" style={{ padding: 'var(--space-3) 0' }}>
                    <OracleSeal size={24} thinking={true} />
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-sm)', color: 'var(--color-primary)' }}>
                      Analyzing comparison…
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={requestVerdict}
                    disabled={verdictLoading}
                    className="codex-btn"
                    style={{ minWidth: '240px' }}
                  >
                    Get AI comparison summary
                  </button>
                )}
              </div>

              {/* Verdict Display */}
              {verdict && (
                <div
                  className="codex-marginalia"
                  style={{
                    border: 'var(--border-thick)',
                    borderLeft: '6px solid var(--color-primary)',
                    padding: 'var(--space-6)',
                  }}
                >
                  <h4
                    className="flex items-center gap-2.5"
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: 'var(--text-lg)',
                      fontWeight: 700,
                      marginBottom: 'var(--space-3)',
                      color: 'var(--color-primary)',
                    }}
                  >
                    <OracleSeal size={24} />
                    <span>AI Comparison Summary</span>
                  </h4>
                  <div style={{ fontSize: 'var(--text-sm)' }}>
                    {formatAIResponse(verdict)}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </motion.div>
    </motion.div>
  );
}
