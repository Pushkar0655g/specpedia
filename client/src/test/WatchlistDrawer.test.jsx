import React, { act } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WatchlistDrawer from '../components/WatchlistDrawer';
import WatchlistContext from '../context/WatchlistContext';

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn().mockResolvedValue({
      data: [
        { price: 32000, recorded_at: '2026-08-01T00:00:00Z' },
        { price: 31000, recorded_at: '2026-08-08T00:00:00Z' },
        { price: 29999, recorded_at: '2026-08-15T00:00:00Z' },
      ],
    }),
    post: vi.fn().mockResolvedValue({ data: { success: true } }),
    delete: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
}));

describe('WatchlistDrawer', () => {
  it('does not render when isWatchlistDrawerOpen is false', () => {
    const mockContext = {
      isWatchlistDrawerOpen: false,
      setIsWatchlistDrawerOpen: vi.fn(),
      watchlist: [],
      loading: false,
      removeFromWatchlist: vi.fn(),
      updateTargetPrice: vi.fn(),
      logout: vi.fn(),
      user: { email: 'scholar@alexandria.io' },
    };

    const { container } = render(
      <WatchlistContext.Provider value={mockContext}>
        <WatchlistDrawer />
      </WatchlistContext.Provider>
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders empty ledger state when watchlist is empty and open', () => {
    const mockContext = {
      isWatchlistDrawerOpen: true,
      setIsWatchlistDrawerOpen: vi.fn(),
      watchlist: [],
      loading: false,
      removeFromWatchlist: vi.fn(),
      updateTargetPrice: vi.fn(),
      logout: vi.fn(),
      user: { email: 'scholar@alexandria.io' },
    };

    render(
      <WatchlistContext.Provider value={mockContext}>
        <WatchlistDrawer />
      </WatchlistContext.Provider>
    );

    expect(screen.getByText(/No Saved Devices/i)).toBeInTheDocument();
    expect(screen.getByText(/Signed in as scholar@alexandria.io/i)).toBeInTheDocument();
  });

  it('renders items, current prices, and triggers target price updates', async () => {
    const updateTargetPrice = vi.fn();
    const removeFromWatchlist = vi.fn();

    const mockItems = [
      {
        itemId: 101,
        name: 'Pixel 9 Pro',
        brand: 'Google',
        price: 99999,
        targetPrice: 90000,
        notifiedAt: null,
      },
    ];

    const mockContext = {
      isWatchlistDrawerOpen: true,
      setIsWatchlistDrawerOpen: vi.fn(),
      watchlist: mockItems,
      loading: false,
      removeFromWatchlist,
      updateTargetPrice,
      logout: vi.fn(),
      user: { email: 'scholar@alexandria.io' },
    };

    await act(async () => {
      render(
        <WatchlistContext.Provider value={mockContext}>
          <WatchlistDrawer />
        </WatchlistContext.Provider>
      );
    });

    expect(screen.getByText('Pixel 9 Pro')).toBeInTheDocument();
    expect(screen.getByText('Google')).toBeInTheDocument();
    expect(screen.getByText('₹99,999')).toBeInTheDocument();

    // Verify target alert input
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveValue(90000);

    await act(async () => {
      fireEvent.change(input, { target: { value: '88000' } });
      fireEvent.blur(input);
    });

    expect(updateTargetPrice).toHaveBeenCalledWith(101, 88000);
  });
});
