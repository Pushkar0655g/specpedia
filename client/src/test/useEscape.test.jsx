import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import useEscape from '../hooks/useEscape';

function TestComponent({ onClose }) {
  useEscape(onClose);
  return <div>Modal Content</div>;
}

describe('useEscape hook', () => {
  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn();
    render(<TestComponent onClose={onClose} />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when other keys are pressed', () => {
    const onClose = vi.fn();
    render(<TestComponent onClose={onClose} />);

    fireEvent.keyDown(window, { key: 'Enter' });
    fireEvent.keyDown(window, { key: 'ArrowDown' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('removes listener when unmounted', () => {
    const onClose = vi.fn();
    const { unmount } = render(<TestComponent onClose={onClose} />);

    unmount();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });
});
