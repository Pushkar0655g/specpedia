import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Lexicon from '../components/Lexicon';
import MarketChronicle from '../components/MarketChronicle';
import Scriptorium from '../components/Scriptorium';

// Mock API
vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }, ref) => {
      const { initial, animate, exit, whileInView, viewport, transition, ...rest } = props;
      return <div ref={ref} {...rest}>{children}</div>;
    }),
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock ChatModal to easily verify "Ask the Oracle more" opens it with prompt
vi.mock('../components/ChatModal', () => ({
  default: ({ onClose, initialQuery, initialPrompt }) => {
    return (
      <div role="dialog" aria-label="Mock Chat Modal">
        <span>Oracle Query: {initialPrompt || initialQuery}</span>
        <button onClick={onClose}>Close Oracle</button>
      </div>
    );
  },
}));

import api from '../lib/api';

const mockLexiconTerms = [
  {
    term: 'AMOLED',
    definition: 'Active-matrix OLED screens where each pixel produces its own light for infinite contrast.',
  },
  {
    term: 'IP68',
    definition: 'Dust-tight seal resistant to continuous water submersion past 1 meter.',
  },
  {
    term: 'LTPO',
    definition: 'Low-Temperature Polycrystalline Oxide display allowing dynamic refresh rates down to 1Hz.',
  },
];

const mockMovers = {
  fallers: [
    {
      id: 1,
      name: 'OnePlus 12',
      slug: 'oneplus-12',
      brand: 'OnePlus',
      price: 64999,
      lastWeekPrice: 69999,
      diff: -5000,
      deltaPercent: -7.1,
      history: [69999, 67999, 64999],
    },
  ],
  risers: [
    {
      id: 2,
      name: 'Pixel 8 Pro',
      slug: 'pixel-8-pro',
      brand: 'Google',
      price: 106999,
      lastWeekPrice: 99999,
      diff: 7000,
      deltaPercent: 7.0,
      history: [99999, 102999, 106999],
    },
  ],
};

describe('Content Sections', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    global.IntersectionObserver = class {
      constructor(callback) {
        this.callback = callback;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    };

    window.matchMedia = window.matchMedia || function() {
      return {
        matches: false,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
    };
  });

  describe('The Lexicon (/lexicon)', () => {
    it('renders terms, A-Z anchor letters, and handles expand/collapse', async () => {
      api.get.mockResolvedValueOnce({ data: mockLexiconTerms });

      render(
        <MemoryRouter>
          <Lexicon />
        </MemoryRouter>
      );

      // Wait for lexicon terms to load
      await waitFor(() => {
        expect(screen.getByText('AMOLED')).toBeInTheDocument();
      });

      expect(screen.getByText('IP68')).toBeInTheDocument();
      expect(screen.getByText('LTPO')).toBeInTheDocument();

      // Check A-Z rune anchor buttons (A, I, L)
      expect(screen.getByRole('button', { name: 'A' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'I' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'L' })).toBeInTheDocument();

      // Explanation is visible
      expect(screen.getByText(/Active-matrix OLED screens/i)).toBeInTheDocument();

      // Click "Ask Oracle more" chip for AMOLED
      const oracleChips = screen.getAllByRole('button', { name: /Ask Oracle more/i });
      fireEvent.click(oracleChips[0]);

      // Chat modal should open with query pre-filled
      expect(screen.getByRole('dialog', { name: 'Mock Chat Modal' })).toBeInTheDocument();
      expect(screen.getByText(/Oracle Query: Explain AMOLED like I'm twelve/i)).toBeInTheDocument();
    });
  });

  describe('Price Trends (Section on Home)', () => {
    it('renders fallers and risers columns with deltas and sparklines', async () => {
      api.get.mockResolvedValueOnce({ data: mockMovers });

      render(
        <MemoryRouter>
          <MarketChronicle />
        </MemoryRouter>
      );

      // Wait for movers to load
      await waitFor(() => {
        expect(screen.getByText(/Price Trends/i)).toBeInTheDocument();
      });

      // Check Fallers column
      expect(screen.getByText(/Top Price Drops/i)).toBeInTheDocument();
      expect(screen.getByText('OnePlus 12')).toBeInTheDocument();
      expect(screen.getByText(/▼ 7.1%/i)).toBeInTheDocument();

      // Check Risers column
      expect(screen.getByText(/Top Price Increases/i)).toBeInTheDocument();
      expect(screen.getByText('Pixel 8 Pro')).toBeInTheDocument();
      expect(screen.getByText(/▲ 7%/i)).toBeInTheDocument();

      // Check that sparkline svgs are rendered
      const sparklines = screen.getAllByLabelText(/Price history sparkline/i);
      expect(sparklines.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('About SpecPedia (/about)', () => {
    it('renders the illuminated manuscript layout with core prose sections and roadmap', () => {
      render(
        <MemoryRouter>
          <Scriptorium />
        </MemoryRouter>
      );

      // Main header
      expect(screen.getByText('About SpecPedia')).toBeInTheDocument();

      // Core prose headings / sections
      expect(screen.getByText(/The Problem: Spec-Sheet Overload/i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: /How SpecPedia Helps/i })).toBeInTheDocument();
      expect(screen.getByText(/How Oracle Works: Retrieve → Ground → Verdict/i)).toBeInTheDocument();
      expect(screen.getByText(/Our Principles/i)).toBeInTheDocument();
      expect(screen.getByText(/Built With: Modern Web Engineering/i)).toBeInTheDocument();

      // Marginalia pull quotes
      expect(screen.getByText(/Clarity in specifications empowers confident decisions/i)).toBeInTheDocument();
      expect(screen.getByText(/Every device evaluated on hardware merits/i)).toBeInTheDocument();

      // Roadmap
      expect(screen.getByText('Roadmap')).toBeInTheDocument();
      expect(screen.getByText(/Electronics & Computing/i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: 'Automobiles' })).toBeInTheDocument();
    });
  });
});
