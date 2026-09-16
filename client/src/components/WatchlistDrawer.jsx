import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWatchlist } from '../context/WatchlistContext';
import api from '../lib/api';
import useEscape from '../hooks/useEscape';
import Sparkline from './Sparkline';

/**
 * Individual watched item row styled in codex-card theme
 */
function WatchlistRow({ entry, onRemove, onUpdateTarget }) {
  const [targetVal, setTargetVal] = useState(
    entry.targetPrice ? String(entry.targetPrice) : ''
  );
  const [savedBadge, setSavedBadge] = useState(false);

  useEffect(() => {
    setTargetVal(entry.targetPrice ? String(entry.targetPrice) : '');
  }, [entry.targetPrice]);

  const handleBlurOrSubmit = () => {
    const num = targetVal.trim() ? parseFloat(targetVal) : null;
    if (num !== entry.targetPrice) {
      onUpdateTarget(entry.itemId, num);
      setSavedBadge(true);
      setTimeout(() => setSavedBadge(false), 2000);
    }
  };

  const currentPrice = Number(entry.price || entry.item?.price || 0);

  return (
    <div
      className="codex-card"
      style={{
        padding: 'var(--space-4)',
        background: 'var(--color-bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}
    >
      {/* Header: Brand & Name & Remove button */}
      <div className="flex justify-between items-start">
        <div>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            {entry.brand || entry.item?.brand}
          </span>
          <h4
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-base)',
              fontWeight: 700,
              lineHeight: 1.2,
              marginTop: '2px',
            }}
          >
            {entry.name || entry.item?.name}
          </h4>
        </div>
        <button
          onClick={() => onRemove(entry.itemId)}
          className="codex-modal-close"
          style={{ width: '28px', height: '28px', fontSize: '18px' }}
          aria-label={`Remove ${entry.name} from watchlist`}
          title="Remove from watchlist"
        >
          ×
        </button>
      </div>

      {/* Price & Sparkline */}
      <div className="flex justify-between items-center" style={{ marginTop: 'var(--space-1)' }}>
        <div>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--color-text-muted)',
              display: 'block',
            }}
          >
            Current Price
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-lg)',
              fontWeight: 700,
              color: 'var(--color-primary)',
            }}
          >
            ₹{currentPrice.toLocaleString('en-IN')}
          </span>
        </div>
        <Sparkline itemId={entry.itemId} currentPrice={currentPrice} />
      </div>

      {/* Target Price Alert Input */}
      <div
        style={{
          borderTop: 'var(--border-thin)',
          paddingTop: 'var(--space-3)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-1)',
        }}
      >
        <div className="flex justify-between items-center">
          <label
            htmlFor={`target-input-${entry.itemId}`}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--color-text-secondary)',
            }}
          >
            Alert me under ₹
          </label>
          {savedBadge && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: '#2E7D32',
                fontWeight: 700,
              }}
            >
              Saved ✓
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <input
            id={`target-input-${entry.itemId}`}
            type="number"
            value={targetVal}
            onChange={(e) => setTargetVal(e.target.value)}
            onBlur={handleBlurOrSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleBlurOrSubmit();
              }
            }}
            placeholder={currentPrice ? String(Math.round(currentPrice * 0.95)) : '50000'}
            style={{
              flex: 1,
              padding: 'var(--space-1) var(--space-3)',
              background: 'var(--color-bg-surface)',
              border: 'var(--border-thin)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-primary)',
              outline: 'none',
            }}
          />
          <button
            type="button"
            onClick={handleBlurOrSubmit}
            className="codex-btn-secondary"
            style={{
              padding: 'var(--space-1) var(--space-3)',
              fontSize: 'var(--text-xs)',
              minHeight: 'auto',
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WatchlistDrawer() {
  const {
    isWatchlistDrawerOpen,
    setIsWatchlistDrawerOpen,
    watchlist,
    loading,
    removeFromWatchlist,
    updateTargetPrice,
    logout,
    user,
  } = useWatchlist();

  useEscape(() => {
    if (isWatchlistDrawerOpen) setIsWatchlistDrawerOpen(false);
  });

  if (!isWatchlistDrawerOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50"
        style={{ background: 'rgba(0,0,0,0.45)' }}
        onClick={() => setIsWatchlistDrawerOpen(false)}
      />

      {/* Right Drawer */}
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label="Your Watchlist"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.28, ease: 'easeOut' }}
        className="fixed top-0 right-0 h-full z-[51] flex flex-col"
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'var(--color-bg-surface)',
          borderLeft: 'var(--border-thick)',
          boxShadow: 'var(--shadow-hard-lg)',
        }}
      >
        {/* Drawer Header */}
        <div
          className="flex justify-between items-center"
          style={{
            padding: 'var(--space-6)',
            borderBottom: 'var(--border-thick)',
            background: 'var(--color-bg-primary)',
          }}
        >
          <div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-accent)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontWeight: 700,
              }}
            >
              Saved Devices
            </span>
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-2xl)',
                fontWeight: 700,
                marginTop: 'var(--space-1)',
              }}
            >
              Price Watchlist ({watchlist.length})
            </h3>
          </div>
          <button
            onClick={() => setIsWatchlistDrawerOpen(false)}
            className="codex-modal-close"
            aria-label="Close watchlist drawer"
          >
            ×
          </button>
        </div>

        {/* User Status Bar */}
        <div
          className="flex justify-between items-center"
          style={{
            padding: 'var(--space-2) var(--space-6)',
            borderBottom: 'var(--border-thin)',
            background: 'var(--color-bg-surface)',
            fontSize: 'var(--text-xs)',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text-secondary)',
          }}
        >
          <span className="truncate max-w-[240px]">Signed in as {user?.email}</span>
          <button
            onClick={logout}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-accent)',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '11px',
            }}
          >
            Sign out
          </button>
        </div>

        {/* Drawer Content */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
              <p style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-secondary)' }}>
                Loading saved devices...
              </p>
            </div>
          ) : watchlist.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: 'var(--space-12) var(--space-4)',
                border: 'var(--border-thin)',
                background: 'var(--color-bg-primary)',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: 'var(--space-3)' }}>🏷️</div>
              <h4
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'var(--text-lg)',
                  fontWeight: 700,
                  marginBottom: 'var(--space-2)',
                }}
              >
                No Saved Devices
              </h4>
              <p
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.5,
                }}
              >
                Tap the bookmark icon on any smartphone card or device folio to monitor weekly price trends and set drop alerts.
              </p>
            </div>
          ) : (
            watchlist.map((entry) => (
              <WatchlistRow
                key={entry.itemId}
                entry={entry}
                onRemove={removeFromWatchlist}
                onUpdateTarget={updateTargetPrice}
              />
            ))
          )}
        </div>
      </motion.aside>
    </>
  );
}
