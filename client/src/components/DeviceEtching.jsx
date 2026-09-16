import React from 'react';

/**
 * Parametric SVG line-art phone etching.
 * Ink-stroke silhouette: rounded-rect body, screen inset, camera dots, hatch shading.
 * No fills — stroke only, inside a double-ruled frame.
 */
export default function DeviceEtching({ width = 180, height = 320 }) {
  const strokeColor = 'var(--color-text-primary)';
  const strokeOpacity = 0.85;

  // Body proportions
  const bodyX = 20;
  const bodyY = 10;
  const bodyW = width - 40;
  const bodyH = height - 20;
  const cornerR = 18;

  // Screen inset
  const screenPad = 10;
  const screenX = bodyX + screenPad;
  const screenY = bodyY + screenPad + 14;
  const screenW = bodyW - screenPad * 2;
  const screenH = bodyH - screenPad * 2 - 28;

  // Camera dots (top center)
  const camY = bodyY + 14;
  const camCx = width / 2;

  // Hatch lines inside screen area
  const hatches = [];
  for (let i = 0; i < 8; i++) {
    const y = screenY + 12 + i * (screenH / 9);
    if (y < screenY + screenH - 4) {
      hatches.push(
        <line
          key={`h${i}`}
          x1={screenX + 6}
          y1={y}
          x2={screenX + screenW - 6}
          y2={y}
          stroke={strokeColor}
          strokeWidth="0.5"
          strokeOpacity={strokeOpacity * 0.35}
          strokeDasharray="3 4"
        />
      );
    }
  }

  return (
    <div className="codex-etching-frame">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ display: 'block' }}
      >
        {/* Phone body */}
        <rect
          x={bodyX}
          y={bodyY}
          width={bodyW}
          height={bodyH}
          rx={cornerR}
          ry={cornerR}
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeOpacity={strokeOpacity}
        />

        {/* Screen inset */}
        <rect
          x={screenX}
          y={screenY}
          width={screenW}
          height={screenH}
          rx={4}
          ry={4}
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeOpacity={strokeOpacity * 0.7}
        />

        {/* Front camera dot */}
        <circle
          cx={camCx}
          cy={camY}
          r={3}
          stroke={strokeColor}
          strokeWidth="1.2"
          strokeOpacity={strokeOpacity}
        />

        {/* Speaker grille */}
        <line
          x1={camCx - 12}
          y1={camY}
          x2={camCx - 8}
          y2={camY}
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeOpacity={strokeOpacity * 0.6}
          strokeLinecap="round"
        />
        <line
          x1={camCx + 8}
          y1={camY}
          x2={camCx + 12}
          y2={camY}
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeOpacity={strokeOpacity * 0.6}
          strokeLinecap="round"
        />

        {/* Rear camera module (top-left of body) */}
        <rect
          x={bodyX + 8}
          y={bodyY + 8}
          width={28}
          height={40}
          rx={6}
          stroke={strokeColor}
          strokeWidth="1"
          strokeOpacity={strokeOpacity * 0.5}
        />
        <circle cx={bodyX + 22} cy={bodyY + 20} r={5} stroke={strokeColor} strokeWidth="1" strokeOpacity={strokeOpacity * 0.6} />
        <circle cx={bodyX + 22} cy={bodyY + 36} r={4} stroke={strokeColor} strokeWidth="1" strokeOpacity={strokeOpacity * 0.5} />

        {/* Hatch shading inside screen */}
        {hatches}

        {/* Side button (volume) */}
        <line
          x1={bodyX + bodyW + 0.5}
          y1={bodyY + 60}
          x2={bodyX + bodyW + 0.5}
          y2={bodyY + 90}
          stroke={strokeColor}
          strokeWidth="2"
          strokeOpacity={strokeOpacity * 0.6}
          strokeLinecap="round"
        />

        {/* Power button */}
        <line
          x1={bodyX + bodyW + 0.5}
          y1={bodyY + 100}
          x2={bodyX + bodyW + 0.5}
          y2={bodyY + 120}
          stroke={strokeColor}
          strokeWidth="2"
          strokeOpacity={strokeOpacity * 0.6}
          strokeLinecap="round"
        />

        {/* Bottom port */}
        <line
          x1={camCx - 8}
          y1={bodyY + bodyH - 6}
          x2={camCx + 8}
          y2={bodyY + bodyH - 6}
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeOpacity={strokeOpacity * 0.5}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
