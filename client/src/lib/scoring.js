/**
 * SpecPedia — Deterministic Explainable Value Scoring Engine (Client)
 * Pure function with zero randomness and zero AI dependencies.
 *
 * Returns { quality, value, score, breakdown }
 */

export const CHIP_TIERS = {
  'A18 Pro': 98,
  'Snapdragon 8 Elite': 98,
  'Snapdragon 8 Gen 3': 90,
  'Tensor G4': 85,
  'Dimensity 9400': 95,
  'Snapdragon 7 Gen 3': 70,
  'Dimensity 7200': 60,
  'Snapdragon 695': 40,
  default: 55,
};

export function extractBatteryMah(item) {
  const specsStr = typeof item.specs?.battery === 'string' ? item.specs.battery : '';
  const descStr = typeof item.description === 'string' ? item.description : '';
  const combined = `${specsStr} ${descStr}`;
  const match = combined.match(/(\d{4,5})\s*mAh/i);
  if (match) {
    return parseInt(match[1], 10);
  }
  return 4500;
}

export function scoreBattery(mah) {
  if (mah <= 3000) return 50;
  if (mah <= 4000) {
    return Math.round(50 + ((mah - 3000) / 1000) * 20);
  }
  if (mah <= 5000) {
    return Math.round(70 + ((mah - 4000) / 1000) * 15);
  }
  if (mah <= 6000) {
    return Math.round(85 + ((mah - 5000) / 1000) * 15);
  }
  return 100;
}

export function scoreChip(item) {
  const chipStr = (item.specs?.chip || item.specs?.processor || item.description || '').toLowerCase();

  for (const [tierName, points] of Object.entries(CHIP_TIERS)) {
    if (tierName === 'default') continue;
    if (chipStr.includes(tierName.toLowerCase())) {
      return { points, name: tierName };
    }
  }

  return { points: CHIP_TIERS.default, name: item.specs?.chip || 'Standard SoC' };
}

export function scoreDisplay(item) {
  const displayStr = `${item.specs?.display || ''} ${item.description || ''}`.toLowerCase();
  let points = 60;
  const tags = [];

  if (displayStr.includes('144hz') || displayStr.includes('165hz')) {
    points += 25;
    tags.push('144Hz+');
  } else if (displayStr.includes('120hz') || displayStr.includes('promotion') || displayStr.includes('fluid')) {
    points += 20;
    tags.push('120Hz');
  } else if (displayStr.includes('90hz')) {
    points += 10;
    tags.push('90Hz');
  }

  if (displayStr.includes('amoled') || displayStr.includes('oled') || displayStr.includes('super retina') || displayStr.includes('ltpo')) {
    points += 15;
    tags.push('OLED/AMOLED');
  }

  const sizeMatch = displayStr.match(/(\d+\.\d+)["\\s-]*inch/i);
  if (sizeMatch && parseFloat(sizeMatch[1]) >= 6.6) {
    points += 5;
  }

  points = Math.min(100, points);
  return { points, note: tags.join(' ') || 'Standard Display' };
}

export function computePricePercentile(price) {
  const safePrice = Math.max(10000, Number(price) || 30000);
  const minPrice = 10000;
  const maxPrice = 160000;
  const logP = Math.log(safePrice / minPrice);
  const logMax = Math.log(maxPrice / minPrice);
  const rawRatio = Math.min(1.0, Math.max(0, logP / logMax));
  return 0.35 + rawRatio * 0.65;
}

export function computeCodexScore(item, pricePercentile) {
  if (!item || typeof item !== 'object') {
    return {
      quality: 50,
      value: 50,
      score: 50,
      breakdown: [
        { label: 'Battery', points: 50, max: 100, note: 'Unknown capacity' },
        { label: 'Silicon', points: 55, max: 100, note: 'Standard SoC' },
        { label: 'Display', points: 60, max: 100, note: 'Standard panel' },
      ],
    };
  }

  const mah = extractBatteryMah(item);
  const batteryPoints = scoreBattery(mah);
  const chipResult = scoreChip(item);
  const chipPoints = chipResult.points;
  const displayResult = scoreDisplay(item);
  const displayPoints = displayResult.points;

  const quality = Math.round(batteryPoints * 0.3 + chipPoints * 0.4 + displayPoints * 0.3);
  const pctile = pricePercentile != null ? pricePercentile : computePricePercentile(item.price);
  const rawValueScore = (quality / pctile) * 0.62;
  const rawValue = Math.min(100, Math.max(10, Math.round(rawValueScore)));
  const qualityCapped = Math.round(rawValue * Math.pow(quality / 100, 0.85));
  const value = Math.min(qualityCapped, quality + 10);
  const score = Math.min(100, Math.max(0, Math.round(0.65 * quality + 0.35 * value)));

  const breakdown = [
    { label: 'Battery', points: batteryPoints, max: 100, note: `${mah} mAh endurance rating` },
    { label: 'Silicon', points: chipPoints, max: 100, note: `${chipResult.name} grade silicon` },
    { label: 'Display', points: displayPoints, max: 100, note: displayResult.note },
  ];

  return { quality, value, score, breakdown };
}

export default computeCodexScore;
