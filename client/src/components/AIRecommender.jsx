import React, { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../lib/api';
import OracleSeal from './OracleSeal';

export default function AIRecommender({ onSelectItem }) {
  const [mode, setMode] = useState('presets');
  const [budget, setBudget] = useState('50000');
  const [p1, setP1] = useState('Camera');
  const [p2, setP2] = useState('Battery');
  const [p3, setP3] = useState('Display');
  const [freeText, setFreeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [reasoningOpen, setReasoningOpen] = useState(false);

  const priorities = ['Camera', 'Battery', 'Gaming', 'Display', 'Software', 'Build Quality', 'Fast Charging'];

  const getRecommendation = async () => {
    setLoading(true);
    setResult(null);
    setReasoningOpen(false);

    const payload =
      mode === 'presets'
        ? { budget: Number(budget), priorities: [p1, p2, p3] }
        : { freeText: freeText.trim() };

    try {
      const res = await api.post('/ai/recommend', payload);
      setResult({
        picks: res.data.picks || [],
        reasoning: res.data.reasoning || '',
      });
    } catch (error) {
      console.error('Recommendation failed:', error);
      setResult({
        picks: [],
        reasoning: "We couldn't complete that request. Try rephrasing or adjusting your budget and priorities.",
        error: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="oracle" className="max-w-6xl mx-auto codex-deckle-top" style={{
      padding: 'var(--space-12) var(--space-6)',
    }}>
      {/* Section Header */}
      <div style={{ marginBottom: 'var(--space-10)' }}>
        <h2 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'var(--text-3xl)',
          fontWeight: 700,
          letterSpacing: '0.02em',
          marginBottom: 'var(--space-3)',
        }}>
          Oracle
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-base)' }}>
          Describe your budget and priorities in plain language. Oracle matches them against real catalog specifications and explains every pick.
        </p>
      </div>

      {/* ── Inscription Panel ── */}
      <div style={{
        maxWidth: '800px',
        background: 'var(--color-bg-surface)',
        border: 'var(--border-thick)',
        boxShadow: 'var(--shadow-hard-lg)',
        padding: 'var(--space-8)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Astrolabe Watermark & Candle Glow */}
        <div className="codex-astrolabe-container" aria-hidden="true">
          <div className="codex-astrolabe-glow" />
          <svg
            className="codex-astrolabe-svg"
            viewBox="0 0 320 320"
            fill="none"
            stroke="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Concentric rings */}
            <circle cx="160" cy="160" r="148" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="160" cy="160" r="132" strokeWidth="2" />
            <circle cx="160" cy="160" r="105" strokeWidth="1" />
            <circle cx="160" cy="160" r="78" strokeWidth="1.5" />
            <circle cx="160" cy="160" r="45" strokeWidth="1" strokeDasharray="2 2" />
            <circle cx="160" cy="160" r="16" strokeWidth="2" />
            {/* 12 Radial Ticks */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <line
                key={deg}
                x1="160"
                y1="16"
                x2="160"
                y2="42"
                strokeWidth="1.5"
                transform={`rotate(${deg} 160 160)`}
              />
            ))}
            {/* Cardinal axis cross lines */}
            <line x1="160" y1="12" x2="160" y2="308" strokeWidth="0.75" strokeDasharray="4 4" />
            <line x1="12" y1="160" x2="308" y2="160" strokeWidth="0.75" strokeDasharray="4 4" />
          </svg>
        </div>

        {/* Inscription Content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Panel Title */}
          <h3 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-2xl)',
            fontWeight: 700,
            marginBottom: 'var(--space-6)',
            color: 'var(--color-text-primary)',
          }}>
            Your requirements
          </h3>

        {/* Mode Toggle */}
        <div className="flex" style={{ gap: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
          <button
            onClick={() => setMode('presets')}
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              padding: 'var(--space-2) var(--space-5)',
              border: 'var(--border-thin)',
              cursor: 'pointer',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              transition: 'all 0.15s ease',
              background: mode === 'presets' ? 'var(--color-primary)' : 'transparent',
              color: mode === 'presets' ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)',
              boxShadow: mode === 'presets' ? 'var(--shadow-hard-sm)' : 'none',
            }}
          >
            Guided presets
          </button>
          <button
            onClick={() => setMode('text')}
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              padding: 'var(--space-2) var(--space-5)',
              border: 'var(--border-thin)',
              cursor: 'pointer',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              transition: 'all 0.15s ease',
              background: mode === 'text' ? 'var(--color-primary)' : 'transparent',
              color: mode === 'text' ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)',
              boxShadow: mode === 'text' ? 'var(--shadow-hard-sm)' : 'none',
            }}
          >
            Describe in your own words
          </button>
        </div>

        {mode === 'presets' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Budget */}
            <div>
              <label style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
                display: 'block',
                marginBottom: 'var(--space-2)',
                letterSpacing: '0.04em',
              }}>
                Budget:{' '}
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                  ₹{Number(budget).toLocaleString('en-IN')}
                </span>
              </label>
              <input
                type="range" min="15000" max="150000" step="5000"
                value={budget} onChange={(e) => setBudget(e.target.value)}
                style={{ width: '100%', accentColor: 'var(--color-primary)' }}
              />
            </div>

            {/* Priorities */}
            <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 'var(--space-4)' }}>
              {[
                { label: 'Priority I', value: p1, setter: setP1 },
                { label: 'Priority II', value: p2, setter: setP2 },
                { label: 'Priority III', value: p3, setter: setP3 },
              ].map(({ label, value, setter }) => (
                <div key={label}>
                  <label style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    color: 'var(--color-text-muted)',
                    display: 'block',
                    marginBottom: 'var(--space-2)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}>
                    {label}
                  </label>
                  <select
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    className="codex-input"
                    style={{ fontSize: 'var(--text-sm)' }}
                  >
                    {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <textarea
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            placeholder="e.g., I need a phone under ₹50k with strong low-light camera and all-day battery life."
            className="codex-input"
            style={{ minHeight: '140px', resize: 'vertical' }}
          />
        )}

        {/* Submit */}
        <button
          onClick={getRecommendation}
          disabled={loading}
          className="codex-btn w-full"
          style={{ marginTop: 'var(--space-8)', fontSize: 'var(--text-base)' }}
        >
          {loading ? 'Analyzing spec sheets…' : 'Get recommendations'}
        </button>
        </div>
      </div>

      {/* ── Loading State ── */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            maxWidth: '800px',
            marginTop: 'var(--space-6)',
            background: 'var(--color-bg-surface)',
            border: 'var(--border-thick)',
            padding: 'var(--space-8)',
            textAlign: 'center',
          }}
          className="codex-loading"
        >
          <div className="flex justify-center" style={{ marginBottom: 'var(--space-4)' }}>
            <OracleSeal size={40} thinking={true} />
          </div>
          <p style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-lg)',
            color: 'var(--color-text-secondary)',
            letterSpacing: '0.04em',
          }}>
            Analyzing spec sheets…
          </p>
          <div className="flex justify-center" style={{ gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
            {[0, 1, 2].map(i => (
              <motion.span
                key={i}
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                style={{
                  width: '8px',
                  height: '8px',
                  background: 'var(--color-accent)',
                  border: '1px solid var(--color-border-heavy)',
                  display: 'inline-block',
                }}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Oracle's Verdict ── */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            maxWidth: '800px',
            marginTop: 'var(--space-8)',
            background: 'var(--color-bg-surface)',
            border: result.error ? '4px solid var(--color-error)' : 'var(--border-thick)',
            boxShadow: 'var(--shadow-hard-md)',
            padding: 'var(--space-8)',
            position: 'relative',
          }}
        >
          {/* Close */}
          <button
            onClick={() => setResult(null)}
            className="codex-modal-close"
            style={{
              position: 'absolute',
              top: 'var(--space-4)',
              right: 'var(--space-4)',
              fontSize: '24px',
            }}
            aria-label="Dismiss verdict"
          >
            ×
          </button>

          {/* Title */}
          <div className="flex items-center gap-3" style={{ marginBottom: 'var(--space-6)' }}>
            {!result.error && <OracleSeal size={32} />}
            <h3 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-2xl)',
              fontWeight: 700,
              color: result.error ? 'var(--color-error)' : 'var(--color-text-primary)',
            }}>
              {result.error ? "We couldn't complete that request" : "Recommended for you"}
            </h3>
          </div>

          {/* If error, show message */}
          {result.error && (
            <div className="codex-marginalia" style={{ marginBottom: 'var(--space-6)' }}>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-error)' }}>
                {result.reasoning}
              </p>
            </div>
          )}

          {/* 3 Picks Cards Grid */}
          {!result.error && result.picks && result.picks.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
              {result.picks.map((item) => (
                <div
                  key={item.id}
                  className="codex-card flex flex-col justify-between"
                  style={{
                    background: 'var(--color-bg-primary)',
                    padding: 'var(--space-5)',
                  }}
                >
                  <div>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                    }}>
                      {item.brand}
                    </span>
                    <h4 style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: 'var(--text-base)',
                      fontWeight: 700,
                      marginTop: 'var(--space-1)',
                      marginBottom: 'var(--space-2)',
                    }}>
                      {item.name}
                    </h4>
                    <p style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.6,
                      marginBottom: 'var(--space-4)',
                    }}>
                      {item.reason}
                    </p>
                  </div>

                  <div>
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-base)',
                      fontWeight: 700,
                      color: 'var(--color-primary)',
                      marginBottom: 'var(--space-3)',
                    }}>
                      ₹{item.price.toLocaleString('en-IN')}
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelectItem(item)}
                      className="codex-btn w-full"
                      style={{
                        background: 'var(--color-accent)',
                        color: '#000',
                        fontSize: 'var(--text-xs)',
                        padding: 'var(--space-2) var(--space-3)',
                        minHeight: '36px',
                        border: '2px solid #000',
                      }}
                    >
                      View details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reasoning Accordion */}
          {!result.error && result.reasoning && (
            <div>
              <button
                onClick={() => setReasoningOpen(!reasoningOpen)}
                className="codex-accordion-header"
                style={{ width: '100%' }}
              >
                <span>Why these picks?</span>
                <span style={{
                  transform: reasoningOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                  fontSize: '18px',
                }}>
                  ▾
                </span>
              </button>
              {reasoningOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-secondary)',
                    padding: 'var(--space-4) 0',
                    lineHeight: 1.6,
                  }}
                >
                  <p>{result.reasoning}</p>
                </motion.div>
              )}
            </div>
          )}

          {/* Trust Disclaimer */}
          <div
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              textAlign: 'center',
              marginTop: 'var(--space-6)',
              paddingTop: 'var(--space-4)',
              borderTop: 'var(--border-subtle)',
            }}
          >
            Oracle responses are AI-generated. Verify critical specifications before purchase.
          </div>
        </motion.div>
      )}
    </section>
  );
}