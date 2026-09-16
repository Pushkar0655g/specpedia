import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import DeviceEtching from './DeviceEtching';
import PriceSparkline from './PriceSparkline';
import { useWatchlist } from '../context/WatchlistContext';
import api from '../lib/api';
import { supabase } from '../lib/supabase';
import { computeCodexScore } from '../lib/scoring';

// Client-side explain cache (shared)
const clientExplainCache = new Map();

export default function DeviceFolio({ onCompareStage }) {
  const { slug } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [tooltip, setTooltip] = useState({ key: null, text: null, loading: false });
  const { isItemWatched, toggleWatchlist } = useWatchlist();

  // Fetch item by slug
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);

    api.get('/items', { params: { slug } })
      .then(res => {
        const data = res.data;
        if (!data || (Array.isArray(data) && data.length === 0)) {
          setError('Device not found.');
          setLoading(false);
          return;
        }
        const itemData = Array.isArray(data) ? data[0] : data;
        setItem(itemData);
        setLoading(false);

        // Fetch price history
        if (itemData.id) {
          api.get(`/items/${itemData.id}/history`)
            .then(r => setHistory(Array.isArray(r.data) ? r.data : []))
            .catch(() => setHistory([]));

          // Fetch similar items (same brand, price ±15%)
          api.get('/items')
            .then(r => {
              const all = Array.isArray(r.data) ? r.data : [];
              const price = Number(itemData.price);
              const candidates = all.filter(i =>
                i.id !== itemData.id &&
                (i.brand === itemData.brand || (Math.abs(Number(i.price) - price) / price) <= 0.15)
              );
              setSimilar(candidates.slice(0, 4));
            })
            .catch(() => setSimilar([]));
        }
      })
      .catch(async (err) => {
        console.warn('API lookup failed, checking Supabase directly:', err.message);
        try {
          const { data, error: sbErr } = await supabase
            .from('items')
            .select('*')
            .eq('slug', slug)
            .maybeSingle();

          if (sbErr) throw sbErr;
          if (!data) {
            setError('Device not found.');
            setLoading(false);
            return;
          }
          const enriched = { ...data, codexScore: computeCodexScore(data) };
          setItem(enriched);
          setLoading(false);

          // Fetch similar directly
          const { data: simData } = await supabase
            .from('items')
            .select('*')
            .eq('category_id', 1)
            .limit(10);
          if (simData) {
            setSimilar(simData.filter(i => i.id !== data.id).slice(0, 4));
          }
        } catch (fallbackErr) {
          console.error('Failed to load device:', fallbackErr);
          setError('Could not load device details.');
          setLoading(false);
        }
      });
  }, [slug]);

  // SEO
  useEffect(() => {
    if (item) {
      document.title = `${item.name} — SpecPedia`;

      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = item.description || `${item.name} specifications and analysis`;

      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = `${window.location.origin}/device/${item.slug || slug}`;
    }

    return () => {
      document.title = 'SpecPedia';
    };
  }, [item, slug]);

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
      const res = await api.post('/ai/explain', { key, value: String(value) });
      const explanation = res.data.explanation;
      clientExplainCache.set(cacheKey, explanation);
      setTooltip({ key, text: explanation, loading: false });
    } catch (_err) {
      setTooltip({ key, text: 'Explanation unavailable right now.', loading: false });
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 'var(--space-12) var(--space-6)', paddingTop: '120px' }}>
        <div className="codex-folio-grid">
          <div className="codex-skeleton" style={{ height: '400px' }} />
          <div>
            <div className="codex-skeleton" style={{ height: '40px', marginBottom: 'var(--space-4)' }} />
            <div className="codex-skeleton" style={{ height: '200px' }} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="codex-404">
        <div style={{ width: '60px', height: '4px', background: 'var(--color-primary)', marginBottom: 'var(--space-6)' }} />
        <h1>Device Not Found</h1>
        <p>{error || 'This device could not be found.'}</p>
        <Link to="/" className="codex-btn" style={{ fontSize: 'var(--text-base)', padding: 'var(--space-4) var(--space-8)' }}>
          Return to Catalog
        </Link>
      </div>
    );
  }

  const quality = item.codexScore?.quality ?? 50;
  const value = item.codexScore?.value ?? 50;
  const score = item.codexScore?.score ?? 50;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{ paddingTop: '80px', background: 'var(--color-bg-primary)', minHeight: '100vh' }}
    >
      {/* Two-column spread */}
      <div className="codex-folio-grid">
        {/* ═══ LEFT PLATE ═══ */}
        <div>
          {/* Device Etching */}
          <DeviceEtching />

          {/* Price seal + score seals */}
          <div className="flex flex-col items-center" style={{ gap: 'var(--space-4)', marginTop: 'var(--space-6)' }}>
            <div className="codex-price-seal">
              ₹{item.price.toLocaleString('en-IN')}
            </div>

            <div className="codex-seal-pair">
              <span className="codex-quality-seal" title="Quality: absolute spec tier">
                Q·{quality}
              </span>
              <span className="codex-value-seal" title="Value: spec-per-rupee index">
                V·{value}
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3" style={{ marginTop: 'var(--space-2)' }}>
              <button
                type="button"
                aria-label={`Bookmark ${item.name}`}
                aria-pressed={isItemWatched(item.id)}
                onClick={() => toggleWatchlist(item)}
                className="codex-btn-secondary"
                style={{
                  padding: 'var(--space-2) var(--space-4)',
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill={isItemWatched(item.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                {isItemWatched(item.id) ? 'Watched' : 'Bookmark'}
              </button>

              {onCompareStage && (
                <button
                  type="button"
                  onClick={() => onCompareStage(item)}
                  className="codex-chip"
                  style={{ fontSize: 'var(--text-xs)', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}
                >
                  ⚔️ Add to compare
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ═══ RIGHT PAGE ═══ */}
        <div>
          <div className="codex-chapter-line">
            Item #{item.id} · Smartphones
          </div>

          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            fontWeight: 800,
            letterSpacing: '0.02em',
            lineHeight: 1.1,
            marginBottom: 'var(--space-4)',
          }}>
            {item.name}
          </h1>

          {item.description && (
            <p
              className="codex-dropcap"
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.7,
                marginBottom: 'var(--space-6)',
              }}
            >
              {item.description}
            </p>
          )}

          {/* Spec Ledger */}
          {item.specs && (
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <h3 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-sm)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--color-text-muted)',
                marginBottom: 'var(--space-3)',
              }}>
                Specification Ledger
              </h3>
              {Object.entries(item.specs).map(([key, val]) => (
                <div key={key} className="codex-spec-row" style={{ position: 'relative' }}>
                  <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                    <span className="codex-spec-key">{key}</span>
                    <button
                      className={`codex-explain-rune ${tooltip.key === key ? 'is-active' : ''}`}
                      onClick={() => explainSpec(key, val)}
                      title="Explain this spec"
                      aria-label={`Explain ${key}`}
                    >
                      ?
                    </button>
                  </div>
                  <span className="codex-spec-value">{val}</span>

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
          )}

          {/* Codex Score Breakdown */}
          <div style={{
            padding: 'var(--space-5)',
            background: 'var(--color-bg-surface)',
            border: 'var(--border-thin)',
            marginBottom: 'var(--space-6)',
          }}>
            <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-3)' }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                textTransform: 'uppercase',
                color: 'var(--color-accent)',
                letterSpacing: '0.1em',
                fontWeight: 700,
              }}>
                SpecPedia Score: {score}/100
              </span>
              <div className="codex-seal-pair">
                <span className="codex-quality-seal">Q·{quality}</span>
                <span className="codex-value-seal">V·{value}</span>
              </div>
            </div>

            {(item.codexScore?.breakdown || []).map(b => (
              <div key={b.label} style={{ marginBottom: 'var(--space-2)' }}>
                <div className="flex justify-between items-baseline" style={{ marginBottom: '2px' }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                    {b.label}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-primary)' }}>
                    {b.points} <span style={{ color: 'var(--color-text-muted)' }}>/ {b.max}</span>
                  </span>
                </div>
                <div style={{ height: '6px', background: 'var(--color-bg-primary)', border: '1px solid var(--color-border-heavy)', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, (b.points / b.max) * 100)}%`, height: '100%', background: 'var(--color-primary)' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Price History Sparkline */}
          <PriceSparkline history={history} />
        </div>
      </div>

      {/* ═══ BOTTOM RAIL — Similar Entries ═══ */}
      {similar.length > 0 && (
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '0 var(--space-6) var(--space-12)',
        }}>
          <h3 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-lg)',
            fontWeight: 700,
            marginBottom: 'var(--space-4)',
          }}>
            Similar Devices
          </h3>
          <div className="codex-similar-rail">
            {similar.map(s => (
              <Link
                key={s.id}
                to={`/device/${s.slug}`}
                className="codex-card codex-similar-card"
                style={{ textDecoration: 'none', color: 'inherit', padding: 'var(--space-4)' }}
              >
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                }}>{s.brand}</span>
                <h4 style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 700,
                  marginTop: 'var(--space-1)',
                  marginBottom: 'var(--space-2)',
                }}>{s.name}</h4>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-primary)' }}>
                  ₹{s.price.toLocaleString('en-IN')}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
