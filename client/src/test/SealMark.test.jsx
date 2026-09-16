import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SealMark from '../components/SealMark';
import { ThemeContext } from '../theme/ThemeContext';

describe('SealMark Component', () => {
  it('renders colour variant by default with seal-colour.svg', () => {
    render(<SealMark />);
    const img = screen.getByRole('img', { name: 'SpecPedia seal' });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/seals/seal-colour.svg');
    expect(img).toHaveAttribute('width', '32');
    expect(img).toHaveAttribute('height', '32');
    expect(img).toHaveClass('seal-mark');
    expect(img).not.toHaveClass('seal-spin');
  });

  it('supports custom size and direct variants', () => {
    render(<SealMark variant="favicon" size={48} />);
    const img = screen.getByRole('img', { name: 'SpecPedia seal' });
    expect(img).toHaveAttribute('src', '/seals/seal-favicon.svg');
    expect(img).toHaveAttribute('width', '48');
    expect(img).toHaveAttribute('height', '48');
  });

  it('renders decorative mode correctly without accessible image role', () => {
    const { container } = render(<SealMark decorative />);
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('alt', '');
    expect(img).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies seal-spin class when spin prop is true', () => {
    render(<SealMark spin={true} />);
    const img = screen.getByRole('img', { name: 'SpecPedia seal' });
    expect(img).toHaveClass('seal-spin');
  });

  it('resolves mono variant to seal-ink.svg under codex theme or default', () => {
    render(
      <ThemeContext.Provider value={{ theme: 'codex' }}>
        <SealMark variant="mono" />
      </ThemeContext.Provider>
    );
    const img = screen.getByRole('img', { name: 'SpecPedia seal' });
    expect(img).toHaveAttribute('src', '/seals/seal-ink.svg');
  });

  it('resolves mono variant to seal-parchment.svg under midnight theme', () => {
    render(
      <ThemeContext.Provider value={{ theme: 'midnight' }}>
        <SealMark variant="mono" />
      </ThemeContext.Provider>
    );
    const img = screen.getByRole('img', { name: 'SpecPedia seal' });
    expect(img).toHaveAttribute('src', '/seals/seal-parchment.svg');
  });
});
