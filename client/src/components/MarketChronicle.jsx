import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import Sparkline from './Sparkline';

/**
 * The Market Chronicle — this week in the bazaar
 * Displays top 5 fallers (price drops, green ink ▼) and top 5 risers (price rises, primary ink ▲)
 * with inline SVG sparklines linking to folios.
 */
export default function MarketChronicle() {
  const [movers, setMovers] = useState({ risers: [], fallers: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const unrollRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    async function loadMovers() {
      try {
        setLoading(true);
        const res = await api.get('/items/movers');
        if (isMounted) {
          setMovers(res.data || { risers: [], fallers: [] });
        }
      } catch (err) {
        if (isMounted) setError('Could not load price trends.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadMovers();
    return () => {
      isMounted = false;
    };
  }, []);

  // IntersectionObserver for .codex-unroll
  useEffect(() => {
    const el = unrollRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-unrolled');
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="chronicle"
      ref={unrollRef}
      className="codex-unroll max-w-6xl mx-auto codex-deckle-top"
      style={{
        padding: 'var(--space-12) var(--space-6)',
      }}
      aria-label="Price Trends"
    >
      {/* Chronicle Header */}
      <div className="text-center" style={{ marginBottom: 'var(--space-10)' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
          }}
        >
          Weekly Price Changes
        </span>
        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)',
            fontWeight: 700,
            letterSpacing: '0.02em',
            marginTop: 'var(--space-2)',
            color: 'var(--color-text-primary)',
          }}
        >
          Price Trends
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            marginTop: 'var(--space-2)',
          }}
        >
          Track the largest smartphone price drops and increases over the last 7 days.
        </p>
      </div>

      {loading ? (
        /* Quill Loading Skeletons */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 bg-[var(--color-bg-surface)] border-[var(--border-thin)] shadow-[var(--shadow-hard-sm)] space-y-4">
            <div className="h-5 w-32 bg-[var(--color-border-light)] mb-4" />
            <div className="codex-quill-skeleton">
              <div className="codex-quill-line" />
              <div className="codex-quill-line" />
              <div className="codex-quill-line" />
            </div>
          </div>
          <div className="p-6 bg-[var(--color-bg-surface)] border-[var(--border-thin)] shadow-[var(--shadow-hard-sm)] space-y-4">
            <div className="h-5 w-32 bg-[var(--color-border-light)] mb-4" />
            <div className="codex-quill-skeleton">
              <div className="codex-quill-line" />
              <div className="codex-quill-line" />
              <div className="codex-quill-line" />
            </div>
          </div>
        </div>
      ) : error ? (
        <p className="text-center font-mono text-sm text-[var(--color-text-muted)]">{error}</p>
      ) : (
        /* Two Ruled Columns: Fallers and Risers */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Column 1: Fallers (Price Drops: Good News) */}
          <div
            className="p-6"
            style={{
              background: 'var(--color-bg-surface)',
              border: 'var(--border-thick)',
              boxShadow: 'var(--shadow-hard-sm)',
            }}
          >
            <div
              className="flex items-center justify-between pb-3 mb-4"
              style={{ borderBottom: '2px solid var(--color-success)' }}
            >
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'var(--text-lg)',
                  fontWeight: 700,
                  color: 'var(--color-success)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>▼</span> Top Price Drops
              </h3>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--color-text-muted)',
                }}
              >
                7-day delta
              </span>
            </div>

            <div className="divide-y divide-[var(--color-border-subtle)]">
              {(movers.fallers || []).map((item) => {
                const delta = Math.abs(item.deltaPercent ?? item.pctChange ?? 0);
                return (
                  <div
                    key={item.id}
                    className="py-3 flex items-center justify-between gap-3 group transition-colors hover:bg-[var(--color-bg-surface-2)] px-2 rounded"
                  >
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/device/${item.slug}`}
                        className="block font-heading font-bold text-sm text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-success)] transition-colors"
                        title={item.name}
                      >
                        {item.name}
                      </Link>
                      <span className="font-mono text-xs text-[var(--color-text-muted)]">
                        ₹{Number(item.price).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span
                        className="font-mono font-bold text-xs"
                        style={{ color: 'var(--color-success)' }}
                      >
                        ▼ {delta}%
                      </span>
                      <Sparkline
                        history={item.history}
                        currentPrice={item.price}
                        width={90}
                        height={28}
                        showLabel={false}
                        strokeDown="var(--color-success)"
                      />
                    </div>
                  </div>
                );
              })}
              {(!movers.fallers || movers.fallers.length === 0) && (
                <p className="py-4 text-center font-mono text-xs text-[var(--color-text-muted)]">
                  No major price drops recorded this week.
                </p>
              )}
            </div>
          </div>

          {/* Column 2: Risers (Price Increases) */}
          <div
            className="p-6"
            style={{
              background: 'var(--color-bg-surface)',
              border: 'var(--border-thick)',
              boxShadow: 'var(--shadow-hard-sm)',
            }}
          >
            <div
              className="flex items-center justify-between pb-3 mb-4"
              style={{ borderBottom: '2px solid var(--color-primary)' }}
            >
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'var(--text-lg)',
                  fontWeight: 700,
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>▲</span> Top Price Increases
              </h3>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--color-text-muted)',
                }}
              >
                7-day delta
              </span>
            </div>

            <div className="divide-y divide-[var(--color-border-subtle)]">
              {(movers.risers || []).map((item) => {
                const delta = Math.abs(item.deltaPercent ?? item.pctChange ?? 0);
                return (
                  <div
                    key={item.id}
                    className="py-3 flex items-center justify-between gap-3 group transition-colors hover:bg-[var(--color-bg-surface-2)] px-2 rounded"
                  >
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/device/${item.slug}`}
                        className="block font-heading font-bold text-sm text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-primary)] transition-colors"
                        title={item.name}
                      >
                        {item.name}
                      </Link>
                      <span className="font-mono text-xs text-[var(--color-text-muted)]">
                        ₹{Number(item.price).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span
                        className="font-mono font-bold text-xs"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        ▲ {delta}%
                      </span>
                      <Sparkline
                        history={item.history}
                        currentPrice={item.price}
                        width={90}
                        height={28}
                        showLabel={false}
                        strokeUp="var(--color-primary)"
                      />
                    </div>
                  </div>
                );
              })}
              {(!movers.risers || movers.risers.length === 0) && (
                <p className="py-4 text-center font-mono text-xs text-[var(--color-text-muted)]">
                  No major price increases recorded this week.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
