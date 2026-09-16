import React from 'react';
import { motion } from 'framer-motion';
import useEscape from '../hooks/useEscape';

export const CHIP_TIERS = [
  { id: 'flagship', label: 'Flagship (≥80)', min: 80, max: 100 },
  { id: 'upper-mid', label: 'Upper-mid (60–79)', min: 60, max: 79 },
  { id: 'mid', label: 'Mid (40–59)', min: 40, max: 59 },
  { id: 'entry', label: 'Entry (<40)', min: 0, max: 39 },
];

export const DISPLAY_TYPES = ['AMOLED', 'OLED', 'pOLED', 'LCD'];
export const BATTERY_OPTIONS = [
  { label: 'Any battery', value: '' },
  { label: '4000+ mAh', value: '4000' },
  { label: '4500+ mAh', value: '4500' },
  { label: '5000+ mAh', value: '5000' },
  { label: '5500+ mAh', value: '5500' },
];

export default function IndexerDrawer({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onReset,
  minPossiblePrice = 0,
  maxPossiblePrice = 200000,
}) {
  useEscape(onClose);

  if (!isOpen) return null;

  const { minPrice, maxPrice, tiers = [], minBattery = '', displays = [] } = filters;

  const handleMinPriceChange = (e) => {
    const val = e.target.value;
    onFilterChange({ ...filters, minPrice: val ? Number(val) : '' });
  };

  const handleMaxPriceChange = (e) => {
    const val = e.target.value;
    onFilterChange({ ...filters, maxPrice: val ? Number(val) : '' });
  };

  const handleTierToggle = (tierId) => {
    const next = tiers.includes(tierId)
      ? tiers.filter((t) => t !== tierId)
      : [...tiers, tierId];
    onFilterChange({ ...filters, tiers: next });
  };

  const handleDisplayToggle = (display) => {
    const next = displays.includes(display)
      ? displays.filter((d) => d !== display)
      : [...displays, display];
    onFilterChange({ ...filters, displays: next });
  };

  const handleBatteryChange = (e) => {
    onFilterChange({ ...filters, minBattery: e.target.value });
  };

  // Compute visual range percentage for visual bar
  const currentMin = minPrice !== '' && minPrice !== undefined ? Number(minPrice) : minPossiblePrice;
  const currentMax = maxPrice !== '' && maxPrice !== undefined ? Number(maxPrice) : maxPossiblePrice;
  const rangeSpan = Math.max(maxPossiblePrice - minPossiblePrice, 1);
  const leftPct = Math.max(0, Math.min(100, ((currentMin - minPossiblePrice) / rangeSpan) * 100));
  const rightPct = Math.max(0, Math.min(100, ((maxPossiblePrice - currentMax) / rangeSpan) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-label="Filter Devices Drawer">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"
        aria-hidden="true"
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="absolute inset-y-0 right-0 max-w-md w-full flex flex-col shadow-2xl z-10"
        style={{
          background: 'var(--color-bg-primary)',
          borderLeft: 'var(--border-thick)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6"
          style={{ borderBottom: 'var(--border-thin)', background: 'var(--color-bg-surface)' }}
        >
          <div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--color-text-muted)',
              }}
            >
              Filter Devices
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-2xl)',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
              }}
            >
              Filters
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="codex-modal-close"
            aria-label="Close filters drawer"
            style={{ fontSize: '20px' }}
          >
            ×
          </button>
        </div>

        {/* Filter Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Price Range */}
          <div>
            <label
              htmlFor="min-price-input"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-sm)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                display: 'block',
                marginBottom: 'var(--space-2)',
              }}
            >
              Price Range (₹)
            </label>
            <div className="grid grid-cols-2 gap-3" style={{ marginBottom: 'var(--space-3)' }}>
              <div>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>MINIMUM</span>
                <input
                  id="min-price-input"
                  type="number"
                  placeholder={String(minPossiblePrice)}
                  value={minPrice}
                  onChange={handleMinPriceChange}
                  className="codex-input w-full"
                  style={{ padding: '6px 8px', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)' }}
                  aria-label="Minimum price in rupees"
                />
              </div>
              <div>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>MAXIMUM</span>
                <input
                  id="max-price-input"
                  type="number"
                  placeholder={String(maxPossiblePrice)}
                  value={maxPrice}
                  onChange={handleMaxPriceChange}
                  className="codex-input w-full"
                  style={{ padding: '6px 8px', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)' }}
                  aria-label="Maximum price in rupees"
                />
              </div>
            </div>

            {/* Visual Range Bar */}
            <div
              className="relative w-full h-2 rounded-full overflow-hidden"
              style={{ background: 'var(--color-border-light)', marginTop: '8px' }}
              aria-hidden="true"
            >
              <div
                className="absolute top-0 bottom-0"
                style={{
                  left: `${leftPct}%`,
                  right: `${rightPct}%`,
                  background: 'var(--color-accent)',
                  transition: 'left 0.15s ease, right 0.15s ease',
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-[var(--color-text-muted)] mt-1">
              <span>₹{minPossiblePrice.toLocaleString('en-IN')}</span>
              <span>₹{maxPossiblePrice.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Chip Tier Checkboxes */}
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-sm)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 'var(--space-3)',
              }}
            >
              Chip Silicon Tier (Quality Score)
            </h3>
            <div className="space-y-2">
              {CHIP_TIERS.map((tier) => {
                const checked = tiers.includes(tier.id);
                return (
                  <label
                    key={tier.id}
                    className="flex items-center gap-3 cursor-pointer select-none p-2 rounded transition-colors hover:bg-[var(--color-bg-surface-2)]"
                    style={{ border: 'var(--border-subtle)' }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleTierToggle(tier.id)}
                      className="accent-[var(--color-accent)] w-4 h-4 cursor-pointer"
                    />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-primary)' }}>
                      {tier.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Battery Minimum Select */}
          <div>
            <label
              htmlFor="indexer-battery-select"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-sm)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                display: 'block',
                marginBottom: 'var(--space-2)',
              }}
            >
              Minimum Battery Capacity
            </label>
            <select
              id="indexer-battery-select"
              value={minBattery}
              onChange={handleBatteryChange}
              className="codex-input w-full"
              style={{
                padding: '8px 12px',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                cursor: 'pointer',
              }}
            >
              {BATTERY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Display Type Checkboxes */}
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-sm)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 'var(--space-3)',
              }}
            >
              Display Technology
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {DISPLAY_TYPES.map((dt) => {
                const checked = displays.includes(dt);
                return (
                  <label
                    key={dt}
                    className="flex items-center gap-2 cursor-pointer select-none p-2 rounded transition-colors hover:bg-[var(--color-bg-surface-2)]"
                    style={{ border: 'var(--border-subtle)' }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleDisplayToggle(dt)}
                      className="accent-[var(--color-accent)] w-4 h-4 cursor-pointer"
                    />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-primary)' }}>
                      {dt}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          className="p-4 flex items-center justify-between"
          style={{
            borderTop: 'var(--border-thin)',
            background: 'var(--color-bg-surface)',
          }}
        >
          <button
            type="button"
            onClick={onReset}
            className="codex-btn-outline"
            style={{ fontSize: 'var(--text-xs)', padding: '6px 14px' }}
          >
            Clear Filters
          </button>
          <button
            type="button"
            onClick={onClose}
            className="codex-btn"
            style={{ fontSize: 'var(--text-xs)', padding: '6px 18px' }}
          >
            Apply Filters
          </button>
        </div>
      </motion.div>
    </div>
  );
}
