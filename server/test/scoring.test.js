import { describe, it, expect } from 'vitest';
import {
  computeCodexScore,
  scoreBattery,
  scoreChip,
  CHIP_TIERS,
} from '../src/lib/scoring.js';

describe('Codex Value Scoring Engine', () => {
  describe('Battery monotonicity', () => {
    it('bigger battery yields greater than or equal points', () => {
      const capacities = [2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 7000];
      let previousPoints = -1;

      for (const cap of capacities) {
        const points = scoreBattery(cap);
        expect(points).toBeGreaterThanOrEqual(previousPoints);
        previousPoints = points;
      }
    });

    it('reaches maximum 100 points at or above 6000 mAh', () => {
      expect(scoreBattery(6000)).toBe(100);
      expect(scoreBattery(7000)).toBe(100);
    });
  });

  describe('Silicon Chip tiers', () => {
    it('maps known chips to their explicit tier scores', () => {
      expect(scoreChip({ specs: { chip: 'Snapdragon 8 Elite' } }).points).toBe(98);
      expect(scoreChip({ specs: { chip: 'A18 Pro' } }).points).toBe(98);
      expect(scoreChip({ specs: { chip: 'Dimensity 9400' } }).points).toBe(95);
      expect(scoreChip({ specs: { chip: 'Snapdragon 695' } }).points).toBe(40);
    });

    it('falls back to default tier 55 for unknown silicon', () => {
      const result = scoreChip({ specs: { chip: 'Quantum Core X99' } });
      expect(result.points).toBe(CHIP_TIERS.default);
      expect(result.points).toBe(55);
    });
  });

  describe('Quality monotonicity', () => {
    it('higher chip tier produces higher or equal quality', () => {
      const baseItem = (chip) => ({
        price: 30000,
        specs: { chip, battery: '5000 mAh', display: '120Hz AMOLED 6.7-inch' },
      });

      const lowQ = computeCodexScore(baseItem('Snapdragon 695'));
      const midQ = computeCodexScore(baseItem('Snapdragon 7 Gen 3'));
      const highQ = computeCodexScore(baseItem('Snapdragon 8 Elite'));

      expect(lowQ.quality).toBeLessThan(midQ.quality);
      expect(midQ.quality).toBeLessThan(highQ.quality);
    });

    it('higher battery produces higher or equal quality', () => {
      const baseItem = (battery) => ({
        price: 30000,
        specs: { chip: 'Snapdragon 7 Gen 3', battery, display: '120Hz AMOLED' },
      });

      const small = computeCodexScore(baseItem('3000 mAh'));
      const big = computeCodexScore(baseItem('6000 mAh'));

      expect(small.quality).toBeLessThanOrEqual(big.quality);
    });
  });

  describe('Value capping by quality curve', () => {
    it('quality-40 item never exceeds value 65', () => {
      // Snapdragon 695 = 40 chip points, with weak battery and display → low quality
      const item = {
        price: 8000, // very cheap to maximize raw value
        specs: { chip: 'Snapdragon 695', battery: '3000 mAh', display: '60Hz LCD' },
      };

      const result = computeCodexScore(item);
      // quality should be around 47 (40*.4 + 50*.3 + 60*.3)
      expect(result.quality).toBeLessThanOrEqual(50);
      expect(result.value).toBeLessThanOrEqual(65);
    });

    it('entry-level phone does not display triple-digit value', () => {
      const item = {
        price: 5000,
        specs: { chip: 'Snapdragon 695', battery: '4000 mAh', display: '90Hz LCD' },
      };

      const result = computeCodexScore(item);
      expect(result.value).toBeLessThanOrEqual(99);
      // Value is hard-capped at quality + 10
      expect(result.value).toBeLessThanOrEqual(result.quality + 10);
    });
  });

  describe('Score clamping and return shape', () => {
    it('clamps blended score strictly between 0 and 100', () => {
      const ultraBudget = {
        price: 5000,
        specs: { chip: 'A18 Pro', battery: '7000 mAh', display: '144Hz AMOLED 6.8-inch' },
      };
      const ultraExpensive = {
        price: 300000,
        specs: { chip: 'Snapdragon 695', battery: '2000 mAh', display: '60Hz LCD' },
      };

      const budgetScore = computeCodexScore(ultraBudget);
      const expensiveScore = computeCodexScore(ultraExpensive);

      expect(budgetScore.score).toBeGreaterThanOrEqual(0);
      expect(budgetScore.score).toBeLessThanOrEqual(100);

      expect(expensiveScore.score).toBeGreaterThanOrEqual(0);
      expect(expensiveScore.score).toBeLessThanOrEqual(100);
    });

    it('returns quality, value, score, and breakdown', () => {
      const item = {
        name: 'Test Phone',
        price: 30000,
        specs: { chip: 'Snapdragon 8 Gen 3', battery: '5000 mAh', display: '120Hz AMOLED' },
      };

      const result = computeCodexScore(item);
      expect(typeof result.quality).toBe('number');
      expect(typeof result.value).toBe('number');
      expect(typeof result.score).toBe('number');
      expect(Array.isArray(result.breakdown)).toBe(true);
    });

    it('is completely pure and deterministic across repeated runs', () => {
      const item = {
        name: 'OnePlus 13R',
        brand: 'OnePlus',
        price: 42999,
        specs: {
          chip: 'Snapdragon 8 Gen 3',
          battery: '6000 mAh',
          display: '120Hz LTPO AMOLED 6.78-inch',
        },
      };

      const run1 = computeCodexScore(item);
      const run2 = computeCodexScore(item);

      expect(run1.score).toBe(run2.score);
      expect(run1.quality).toBe(run2.quality);
      expect(run1.value).toBe(run2.value);
      expect(run1.breakdown).toEqual(run2.breakdown);
    });

    it('provides all 3 breakdown rows with correct label, points, and max', () => {
      const item = {
        name: 'Galaxy S25 Ultra',
        price: 129999,
        specs: {
          chip: 'Snapdragon 8 Elite',
          battery: '5000 mAh',
          display: '120Hz Dynamic AMOLED',
        },
      };

      const { breakdown } = computeCodexScore(item);
      expect(breakdown).toHaveLength(3);

      const labels = breakdown.map((b) => b.label);
      expect(labels).toContain('Battery');
      expect(labels).toContain('Silicon');
      expect(labels).toContain('Display');

      breakdown.forEach((b) => {
        expect(b.points).toBeGreaterThanOrEqual(0);
        expect(b.points).toBeLessThanOrEqual(b.max);
        expect(b.max).toBe(100);
        expect(typeof b.note).toBe('string');
      });
    });
  });
});
