import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Home from '../components/Home';
import { ThemeProvider } from '../theme/ThemeContext';

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

// Mock WatchlistContext
vi.mock('../context/WatchlistContext', () => ({
  useWatchlist: () => ({
    isItemWatched: () => false,
    toggleWatchlist: vi.fn(),
    watchlist: [],
    loading: false,
    isWatchlistDrawerOpen: false,
    setIsWatchlistDrawerOpen: vi.fn(),
  }),
}));

import api from '../lib/api';

const mockMobiles = [
  {
    id: 1,
    category_id: 1,
    name: 'Pharos Flagship I',
    slug: 'pharos-flagship-i',
    brand: 'Apple',
    price: 89999,
    specs: {
      processor: 'A18 Pro',
      battery: '4400 mAh',
      display: 'LTPO OLED 120Hz',
    },
    codexScore: { quality: 85, value: 70, score: 78, breakdown: [] },
  },
];

describe('SpecPedia Rebranding Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

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

    global.IntersectionObserver = class {
      constructor(callback) {
        this.callback = callback;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    };

    api.get.mockImplementation((url) => {
      if (url === '/items') return Promise.resolve({ data: mockMobiles });
      if (url === '/items/brands') return Promise.resolve({ data: [{ brand: 'Apple', count: 1 }] });
      if (url === '/items/stats') return Promise.resolve({ data: { deviceCount: 1, brandCount: 1 } });
      if (url === '/items/movers') return Promise.resolve({ data: { fallers: [], risers: [] } });
      return Promise.resolve({ data: [] });
    });
  });

  it('renders "Spec" and "Pedia" in Navbar logo wordmark', () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <Navbar onOpenCommand={() => {}} onOpenCompare={() => {}} />
        </MemoryRouter>
      </ThemeProvider>
    );

    // Navbar should have "Spec" and "Pedia"
    const navLogo = screen.getByRole('link', { name: /SpecPedia/i });
    expect(navLogo).toBeInTheDocument();
    expect(navLogo.textContent).toContain('Spec');
    expect(navLogo.textContent).toContain('Pedia');

    // Navbar should render the SealMark wax seal image
    const sealImg = navLogo.querySelector('img.seal-mark');
    expect(sealImg).toBeInTheDocument();
    expect(sealImg).toHaveAttribute('src', '/seals/seal-colour.svg');

    // Button should say "Ask Oracle"
    expect(screen.getByRole('button', { name: /Ask Oracle/i })).toBeInTheDocument();
  });

  it('renders Home with zero occurrences of "Spec Codex", "codex entries", or "the codex"', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Pharos Flagship I')).toBeInTheDocument();
    });

    const bodyText = document.body.textContent || '';

    // Must have 0 occurrences of old branding strings in rendered user text
    expect(bodyText).not.toMatch(/Spec Codex/i);
    expect(bodyText).not.toMatch(/codex entries/i);
    expect(bodyText).not.toMatch(/the codex/i);

    // Must have new branding and professional copy
    expect(screen.getByText(/Specs,/i)).toBeInTheDocument();
    expect(screen.getByText(/reimagined\./i)).toBeInTheDocument();
    expect(screen.getByText(/AI-POWERED PRODUCT ENCYCLOPEDIA/i)).toBeInTheDocument();
  });
});
