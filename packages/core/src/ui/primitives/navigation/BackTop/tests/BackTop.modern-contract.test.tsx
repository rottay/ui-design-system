/**
 * BackTop modern-engine contract tests (K3-C pass 1).
 *
 * The K3-C falsification found: (1) the button carried a 40x40 inline size
 * -- below the 44px coarse-pointer floor -- plus its whole flex centering
 * inline, so the 28-line skin owned only static chrome and painted ZERO
 * interaction states; (2) placement used the PHYSICAL `right-8`, parking
 * the button over the content's scrollbar side in RTL; (3) the aria-label
 * was a hardcoded English string; (4) the default glyph was a hand-rolled
 * inline SVG instead of the governed semantic icon facade. These tests pin
 * the new contract.
 */
import React from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { BackTop } from '../engines/modern';

const SKIN = readFileSync(
  resolve(__dirname, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/back-top.css'),
  'utf8',
);

function scrollWindowTo(top: number) {
  Object.defineProperty(document.documentElement, 'scrollTop', {
    configurable: true,
    writable: true,
    value: top,
  });
  fireEvent.scroll(window);
}

afterEach(() => {
  vi.restoreAllMocks();
  scrollWindowTo(0);
});

describe('BackTop modern contract: anatomy', () => {
  it('stays unmounted below the visibility threshold and mounts above it', () => {
    render(<BackTop visibilityHeight={300} />);
    expect(screen.queryByRole('button')).toBeNull();

    scrollWindowTo(400);
    expect(screen.getByRole('button', { name: 'Back to top' })).toBeInTheDocument();

    scrollWindowTo(100);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('uses skin-owned logical end placement, never physical right placement', () => {
    render(<BackTop visibilityHeight={0} />);
    const button = screen.getByRole('button', { name: 'Back to top' });
    expect(button.className).not.toContain('end-8');
    expect(button.className).not.toContain('right-8');
    expect(SKIN).toContain('inset-inline-end: var(--ds-backtop-inset-inline-end, 2rem)');
    expect(SKIN).not.toMatch(/\bright\s*:/);
    expect(button.className).toContain('rottay-backtop');
    expect(button.className).toContain('rottay-backtop--modern');
    expect(button.getAttribute('data-part')).toBe('trigger');
  });

  it('inlines no sizing or flex centering (the skin owns the 44px frame)', () => {
    render(<BackTop visibilityHeight={0} />);
    const button = screen.getByRole('button', { name: 'Back to top' });
    expect(button.style.width).toBe('');
    expect(button.style.height).toBe('');
    expect(button.style.display).toBe('');
    expect(button.style.cursor).toBe('');
  });

  it('renders the governed semantic navigation-up glyph by default', () => {
    render(<BackTop visibilityHeight={0} />);
    const button = screen.getByRole('button', { name: 'Back to top' });
    const glyph = button.querySelector('svg');
    expect(glyph).toBeTruthy();
    // The semantic facade marks decorative icons so AT skips them.
    expect(glyph?.getAttribute('aria-hidden')).toBe('true');
  });

  it('consumer children replace the default glyph', () => {
    render(
      <BackTop visibilityHeight={0}>
        <span>Top</span>
      </BackTop>
    );
    expect(screen.getByText('Top')).toBeInTheDocument();
  });

  it('scrolls the window to top on click and reports onClick', () => {
    const scrollTo = vi.fn();
    Object.defineProperty(window, 'scrollTo', { configurable: true, writable: true, value: scrollTo });
    const handleClick = vi.fn();
    render(<BackTop visibilityHeight={0} onClick={handleClick} />);

    fireEvent.click(screen.getByRole('button', { name: 'Back to top' }));
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('consumer inline style still merges', () => {
    render(<BackTop visibilityHeight={0} style={{ backgroundColor: 'rgb(1, 2, 3)' }} />);
    const button = screen.getByRole('button', { name: 'Back to top' });
    expect(button.style.backgroundColor).toBe('rgb(1, 2, 3)');
  });
});
