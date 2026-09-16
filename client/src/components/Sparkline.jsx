import React, { useState, useEffect } from 'react';
import api from '../lib/api';

/**
 * Standalone SVG Sparkline built from price history points.
 * Can take a pre-loaded `history` array or fetch for an `itemId`.
 */
export default function Sparkline({
  history: propHistory,
  itemId,
  currentPrice,
  width = 120,
  height = 36,
  showLabel = true,
  strokeDown = 'var(--color-success)',
  strokeUp = 'var(--color-primary)',
}) {
  const [history, setHistory] = useState(propHistory || []);
  const [loading, setLoading] = useState(!propHistory && !!itemId);

  useEffect(() => {
    if (propHistory) {
      setHistory(propHistory);
      setLoading(false);
      return;
    }
    if (!itemId) return;

    let isMounted = true;
    async function loadHistory() {
      try {
        setLoading(true);
        const res = await api.get(`/items/${itemId}/history`);
        if (isMounted) {
          setHistory(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        console.warn(`Could not load price history for item ${itemId}:`, err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadHistory();
    return () => {
      isMounted = false;
    };
  }, [itemId, propHistory]);

  if (loading) {
    return (
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`,
          background: 'var(--color-bg-surface)',
          border: 'var(--border-thin)',
          opacity: 0.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          fontFamily: 'var(--font-mono)',
        }}
      >
        ...
      </div>
    );
  }

  const points =
    history.length > 0
      ? history
      : [{ price: currentPrice || 1000 }, { price: currentPrice || 1000 }];
  const prices = points.map((p) => Number(p && typeof p === 'object' && 'price' in p ? p.price : p));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;

  const pad = 4;
  const coordinates = points.map((pt, idx) => {
    const val = Number(pt && typeof pt === 'object' && 'price' in pt ? pt.price : pt);
    const x = pad + (idx / (points.length - 1 || 1)) * (width - 2 * pad);
    const y = height - pad - ((val - minPrice) / priceRange) * (height - 2 * pad);
    return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
  });

  const polylineStr = coordinates.map((c) => `${c.x},${c.y}`).join(' ');
  const lastCoord = coordinates[coordinates.length - 1];
  const firstPrice = prices[0];
  const lastPrice = prices[prices.length - 1];
  const isDown = lastPrice <= firstPrice;
  const strokeColor = isDown ? strokeDown : strokeUp;

  const deltaPct = Math.abs(Math.round(((lastPrice - firstPrice) / (firstPrice || 1)) * 100));

  return (
    <div className="flex flex-col items-end" style={{ gap: '2px' }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ overflow: 'visible' }}
        aria-label="Price history sparkline"
        role="img"
      >
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={polylineStr}
        />
        {lastCoord && (
          <circle
            cx={lastCoord.x}
            cy={lastCoord.y}
            r="3.5"
            fill={strokeColor}
          />
        )}
      </svg>
      {showLabel && (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: strokeColor,
            fontWeight: 600,
          }}
        >
          {isDown ? '▼' : '▲'} {deltaPct}% (12 wk)
        </span>
      )}
    </div>
  );
}
