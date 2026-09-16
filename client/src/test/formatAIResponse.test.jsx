import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { formatAIResponse, formatBold } from '../components/ChatModal';

describe('formatAIResponse and formatBold', () => {
  it('correctly parses bold markers', () => {
    const { container } = render(<div>{formatBold('This is **important** info')}</div>);
    const strong = container.querySelector('strong');
    expect(strong).not.toBeNull();
    expect(strong?.textContent).toBe('important');
  });

  it('handles headings starting with ###', () => {
    const { container } = render(<div>{formatAIResponse('### Historical Overview')}</div>);
    const heading = container.querySelector('h4');
    expect(heading).not.toBeNull();
    expect(heading?.textContent).toBe('Historical Overview');
  });

  it('handles bullet items starting with - or *', () => {
    const markdown = '- First item\n* Second item';
    const { container } = render(<div>{formatAIResponse(markdown)}</div>);
    const items = container.querySelectorAll('li');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toBe('First item');
    expect(items[1].textContent).toBe('Second item');
  });

  it('handles numbered list items', () => {
    const markdown = '1. Apple iPhone\n2. Google Pixel';
    const { container } = render(<div>{formatAIResponse(markdown)}</div>);
    const items = container.querySelectorAll('li');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toBe('Apple iPhone');
    expect(items[1].textContent).toBe('Google Pixel');
  });

  it('normalizes escaped \\n into real line breaks', () => {
    const rawWithEscapedNewlines = 'Line 1\\nLine 2\\nLine 3';
    const { container } = render(<div>{formatAIResponse(rawWithEscapedNewlines)}</div>);
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs.length).toBe(3);
    expect(paragraphs[0].textContent).toBe('Line 1');
    expect(paragraphs[1].textContent).toBe('Line 2');
    expect(paragraphs[2].textContent).toBe('Line 3');
  });

  it('returns null for empty input', () => {
    expect(formatAIResponse('')).toBeNull();
    expect(formatAIResponse(null)).toBeNull();
  });

  it('renders partial-token streaming buffers without crashing', () => {
    // Incomplete half-word
    const halfWord = 'The processor features a Dimens';
    const { container: c1 } = render(<div>{formatAIResponse(halfWord)}</div>);
    expect(c1.textContent).toBe(halfWord);

    // Incomplete bold tag mid-stream
    const halfBold = 'Built with **Snapdragon 8 El';
    const { container: c2 } = render(<div>{formatAIResponse(halfBold)}</div>);
    expect(c2.textContent).toBe(halfBold);

    // Incomplete header tag mid-stream
    const halfHeading = '### Adv';
    const { container: c3 } = render(<div>{formatAIResponse(halfHeading)}</div>);
    expect(c3.textContent).toBe('Adv');
  });
});

