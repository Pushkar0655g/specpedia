import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import IndexerDrawer from '../components/IndexerDrawer';
import Home from '../components/Home';

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
  }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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
  {
    id: 2,
    category_id: 1,
    name: 'Pergamon Budget Lite',
    slug: 'pergamon-budget-lite',
    brand: 'Samsung',
    price: 19999,
    specs: {
      processor: 'Exynos 1380',
      battery: '5000 mAh',
      display: 'AMOLED 90Hz',
    },
    codexScore: { quality: 55, value: 80, score: 65, breakdown: [] },
  },
];

describe('IndexerDrawer Component', () => {
  it('renders filter controls when open and handles inputs', () => {
    const onFilterChange = vi.fn();
    const onReset = vi.fn();
    const onClose = vi.fn();
    const filters = {
      minPrice: '',
      maxPrice: '',
      tiers: [],
      minBattery: '',
      displays: [],
    };

    render(
      <IndexerDrawer
        isOpen={true}
        onClose={onClose}
        filters={filters}
        onFilterChange={onFilterChange}
        onReset={onReset}
        minPossiblePrice={10000}
        maxPossiblePrice={100000}
      />
    );

    expect(screen.getByText("Filters")).toBeInTheDocument();

    // Min price input
    const minInput = screen.getByLabelText(/Minimum price in rupees/i);
    fireEvent.change(minInput, { target: { value: '25000' } });
    expect(onFilterChange).toHaveBeenCalledWith(expect.objectContaining({ minPrice: 25000 }));

    // Max price input
    const maxInput = screen.getByLabelText(/Maximum price in rupees/i);
    fireEvent.change(maxInput, { target: { value: '80000' } });
    expect(onFilterChange).toHaveBeenCalledWith(expect.objectContaining({ maxPrice: 80000 }));

    // Battery select
    const batterySelect = screen.getByLabelText(/Minimum battery capacity/i);
    fireEvent.change(batterySelect, { target: { value: '5000' } });
    expect(onFilterChange).toHaveBeenCalledWith(expect.objectContaining({ minBattery: '5000' }));

    // Clear Filters / Reset button
    const clearBtn = screen.getByRole('button', { name: /Clear Filters/i });
    fireEvent.click(clearBtn);
    expect(onReset).toHaveBeenCalled();
  });
});

describe('Archive Three-View Reading Room Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Mock window matchMedia
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

    // Mock IntersectionObserver
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
      if (url === '/items/brands') return Promise.resolve({ data: [{ brand: 'Apple', count: 1 }, { brand: 'Samsung', count: 1 }] });
      if (url === '/items/stats') return Promise.resolve({ data: { deviceCount: 2, brandCount: 2 } });
      if (url === '/items/movers') return Promise.resolve({ data: { fallers: [], risers: [] } });
      return Promise.resolve({ data: [] });
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('persists view choice to localStorage and switches between views', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Home />
      </MemoryRouter>
    );

    // Wait for catalog to load
    await waitFor(() => {
      expect(screen.getByText('Pharos Flagship I')).toBeInTheDocument();
    });

    // Default view is Folio Grid
    expect(screen.getByRole('button', { name: 'Folio Grid' })).toHaveAttribute('aria-pressed', 'true');

    // Click Ledger view
    const ledgerBtn = screen.getByRole('button', { name: 'Ledger' });
    fireEvent.click(ledgerBtn);

    expect(localStorage.getItem('codex-view')).toBe('Ledger');
    expect(ledgerBtn).toHaveAttribute('aria-pressed', 'true');

    // Verify Ledger manuscript table rendered
    expect(screen.getByRole('table', { name: /Archive Manuscript Ledger/i })).toBeInTheDocument();
    expect(screen.getByText('A18 Pro')).toBeInTheDocument();
  });

  it('navigates to device folio when pressing Enter on a ledger row', async () => {
    localStorage.setItem('codex-view', 'Ledger');

    render(
      <MemoryRouter initialEntries={['/']}>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('table', { name: /Archive Manuscript Ledger/i })).toBeInTheDocument();
    });

    const pharosRow = screen.getByRole('button', { name: /View details for Pharos Flagship I/i });
    expect(pharosRow).toBeInTheDocument();

    fireEvent.keyDown(pharosRow, { key: 'Enter' });

    expect(mockNavigate).toHaveBeenCalledWith('/device/pharos-flagship-i');
  });

  it('renders Stacks view with brand shelves and book-spines when selected', async () => {
    localStorage.setItem('codex-view', 'Stacks');

    render(
      <MemoryRouter initialEntries={['/']}>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('region', { name: /Device Catalog Shelves/i })).toBeInTheDocument();
    });

    // Should display brand shelves for Apple and Samsung
    expect(screen.getByRole('heading', { level: 3, name: 'Apple' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Samsung' })).toBeInTheDocument();

    // Clicking a book spine navigates to device
    const spineCard = screen.getByRole('button', { name: /Pharos Flagship I/i });
    expect(spineCard).toBeInTheDocument();
    fireEvent.click(spineCard);
    expect(mockNavigate).toHaveBeenCalledWith('/device/pharos-flagship-i');
  });

  it('filters catalog and synchronizes URL query params', async () => {
    // Start with URL having min=50000
    render(
      <MemoryRouter initialEntries={['/?min=50000']}>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Pharos Flagship I')).toBeInTheDocument();
    });

    // Samsung phone is ₹19999, so it should be excluded when min=50000
    expect(screen.queryByText('Pergamon Budget Lite')).not.toBeInTheDocument();

    // The active wax filter tag should be visible
    expect(screen.getByText(/Min ₹50,000/i)).toBeInTheDocument();
  });
});
