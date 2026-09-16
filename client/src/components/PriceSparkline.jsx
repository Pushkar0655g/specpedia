import React from 'react';

/**
 * Inline SVG sparkline from price history data points.
 * Shows min/max mono labels and "12-week chronicle" caption.
 */
export default function PriceSparkline({ history = [], width = 280, height = 60 }) {
  if (!history || history.length < 2) {
    return (
      <div className="codex-sparkline-container">
        <p className="codex-sparkline-caption">No price chronicle available</p>
      </div>
    );
  }

  const prices = history.map(h => Number(h.price));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice || 1;

  const padX = 4;
  const padY = 6;
  const plotW = width - padX * 2;
  const plotH = height - padY * 2;

  const points = prices.map((p, i) => {
    const x = padX + (i / (prices.length - 1)) * plotW;
    const y = padY + plotH - ((p - minPrice) / range) * plotH;
    return `${x},${y}`;
  }).join(' ');

  // Find min/max positions for labels
  const minIdx = prices.indexOf(minPrice);
  const maxIdx = prices.indexOf(maxPrice);
  const minX = padX + (minIdx / (prices.length - 1)) * plotW;
  const maxX = padX + (maxIdx / (prices.length - 1)) * plotW;

  return (
    <div className="codex-sparkline-container">
      <svg
        width={width}
        height={height + 20}
        viewBox={`0 0 ${width} ${height + 20}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={`Price history: ₹${minPrice.toLocaleString('en-IN')} to ₹${maxPrice.toLocaleString('en-IN')}`}
        style={{ display: 'block', margin: '0 auto' }}
      >
        {/* Grid lines */}
        <line x1={padX} y1={padY} x2={padX} y2={padY + plotH} stroke="var(--color-border-light)" strokeWidth="0.5" />
        <line x1={padX} y1={padY + plotH} x2={padX + plotW} y2={padY + plotH} stroke="var(--color-border-light)" strokeWidth="0.5" />

        {/* Sparkline */}
        <polyline
          points={points}
          stroke="var(--color-primary)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          fill="none"
        />

        {/* Min label */}
        <text
          x={Math.max(padX + 4, Math.min(minX, width - 50))}
          y={padY + plotH + 14}
          fontFamily="var(--font-mono)"
          fontSize="9"
          fill="var(--color-text-muted)"
        >
          ▼ ₹{minPrice.toLocaleString('en-IN')}
        </text>

        {/* Max label */}
        <text
          x={Math.max(padX + 4, Math.min(maxX, width - 50))}
          y={padY - 1}
          fontFamily="var(--font-mono)"
          fontSize="9"
          fill="var(--color-accent)"
        >
          ▲ ₹{maxPrice.toLocaleString('en-IN')}
        </text>
      </svg>
      <p className="codex-sparkline-caption">12-week chronicle</p>
    </div>
  );
}
