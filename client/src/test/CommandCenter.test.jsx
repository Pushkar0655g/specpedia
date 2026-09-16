import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CommandCenter from '../components/CommandCenter';

const mockItems = [
  { id: 1, name: 'iPhone 15 Pro', brand: 'Apple', price: 134900, specs: {} },
  { id: 2, name: 'Galaxy S24 Ultra', brand: 'Samsung', price: 129999, specs: {} },
  { id: 3, name: 'Pixel 8 Pro', brand: 'Google', price: 106999, specs: {} },
];

describe('CommandCenter component', () => {
  it('renders all initial items when query is empty', () => {
    render(<CommandCenter items={mockItems} onSelectItem={() => {}} onClose={() => {}} />);
    expect(screen.getByText('iPhone 15 Pro')).toBeInTheDocument();
    expect(screen.getByText('Galaxy S24 Ultra')).toBeInTheDocument();
    expect(screen.getByText('Pixel 8 Pro')).toBeInTheDocument();
  });

  it('filters items based on user input', () => {
    render(<CommandCenter items={mockItems} onSelectItem={() => {}} onClose={() => {}} />);
    const input = screen.getByPlaceholderText(/Search devices/i);
    fireEvent.change(input, { target: { value: 'Apple' } });

    expect(screen.getByText('iPhone 15 Pro')).toBeInTheDocument();
    expect(screen.queryByText('Galaxy S24 Ultra')).not.toBeInTheDocument();
  });

  it('navigates with keyboard and selects with Enter', () => {
    const onSelectItem = vi.fn();
    const onClose = vi.fn();
    render(<CommandCenter items={mockItems} onSelectItem={onSelectItem} onClose={onClose} />);

    const input = screen.getByPlaceholderText(/Search devices/i);
    // Arrow down moves to index 1 (Galaxy S24 Ultra)
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onSelectItem).toHaveBeenCalledWith(mockItems[1]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onSelectItem and onClose when an item is clicked', () => {
    const onSelectItem = vi.fn();
    const onClose = vi.fn();
    render(<CommandCenter items={mockItems} onSelectItem={onSelectItem} onClose={onClose} />);

    fireEvent.click(screen.getByText('Pixel 8 Pro'));
    expect(onSelectItem).toHaveBeenCalledWith(mockItems[2]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
