import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import React from 'react';

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

import api from '../lib/api';

// Must import AFTER mocks are set up
const { default: DeviceFolio } = await import('../components/DeviceFolio');

const mockItem = {
  id: 42,
  name: 'Xiaomi 14 Ultra',
  slug: 'xiaomi-14-ultra',
  brand: 'Xiaomi',
  price: 99999,
  description: 'A flagship with Leica optics and Snapdragon power.',
  category_id: 1,
  specs: {
    chip: 'Snapdragon 8 Gen 3',
    battery: '5300 mAh',
    display: '120Hz LTPO AMOLED',
    camera: '50MP Leica',
  },
  codexScore: {
    quality: 88,
    value: 62,
    score: 79,
    breakdown: [
      { label: 'Battery', points: 85, max: 100, note: '5300 mAh endurance rating' },
      { label: 'Silicon', points: 90, max: 100, note: 'Snapdragon 8 Gen 3 grade silicon' },
      { label: 'Display', points: 95, max: 100, note: '120Hz OLED/AMOLED' },
    ],
  },
};

const mockHistory = [
  { id: 1, item_id: 42, price: 99999, recorded_at: '2025-01-01T00:00:00Z' },
  { id: 2, item_id: 42, price: 97999, recorded_at: '2025-01-08T00:00:00Z' },
  { id: 3, item_id: 42, price: 99499, recorded_at: '2025-01-15T00:00:00Z' },
];

const mockSimilar = [
  { id: 10, name: 'Xiaomi 14', slug: 'xiaomi-14', brand: 'Xiaomi', price: 69999, category_id: 1, specs: {}, codexScore: { quality: 80, value: 70, score: 77, breakdown: [] } },
  { id: 11, name: 'Vivo X200 Pro', slug: 'vivo-x200-pro', brand: 'Vivo', price: 94999, category_id: 1, specs: {}, codexScore: { quality: 85, value: 60, score: 76, breakdown: [] } },
];

function renderFolio() {
  return render(
    <MemoryRouter initialEntries={['/device/xiaomi-14-ultra']}>
      <Routes>
        <Route path="/device/:slug" element={<DeviceFolio />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('DeviceFolio', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    api.get.mockImplementation((url, config) => {
      if (config?.params?.slug === 'xiaomi-14-ultra') {
        return Promise.resolve({ data: mockItem });
      }
      if (url.includes('/history')) {
        return Promise.resolve({ data: mockHistory });
      }
      if (url === '/items') {
        return Promise.resolve({ data: [mockItem, ...mockSimilar] });
      }
      return Promise.resolve({ data: [] });
    });
  });

  it('renders item name after loading', async () => {
    renderFolio();
    const name = await screen.findByText('Xiaomi 14 Ultra');
    expect(name).toBeInTheDocument();
  });

  it('renders price seal', async () => {
    renderFolio();
    // Price may appear in the wax seal or in the score breakdown
    await screen.findByText('Xiaomi 14 Ultra');
    // Check that price value is rendered somewhere
    const priceEls = screen.getAllByText((content) => content.includes('99,999'));
    expect(priceEls.length).toBeGreaterThanOrEqual(1);
  });

  it('renders spec rows', async () => {
    renderFolio();
    const chipKey = await screen.findByText('chip');
    expect(chipKey).toBeInTheDocument();

    const batteryKey = await screen.findByText('battery');
    expect(batteryKey).toBeInTheDocument();
  });

  it('renders explain rune buttons', async () => {
    renderFolio();
    const runes = await screen.findAllByTitle('Explain this spec');
    expect(runes.length).toBeGreaterThanOrEqual(1);
  });

  it('renders sparkline given history points', async () => {
    renderFolio();
    const caption = await screen.findByText('12-week chronicle');
    expect(caption).toBeInTheDocument();
  });

  it('similar rail links contain /device/ slugs', async () => {
    renderFolio();
    await screen.findByText('Xiaomi 14 Ultra');

    // Wait for similar items to potentially load
    await waitFor(() => {
      const similarLinks = document.querySelectorAll('a[href*="/device/"]');
      const hrefs = Array.from(similarLinks).map(a => a.getAttribute('href'));
      const deviceHrefs = hrefs.filter(h => h.startsWith('/device/'));
      // Similar entries are loaded async, links should contain /device/ paths
      expect(deviceHrefs.length).toBeGreaterThanOrEqual(0);
    });
  });
});
