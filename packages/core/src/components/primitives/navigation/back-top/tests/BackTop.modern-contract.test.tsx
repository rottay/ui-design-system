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
import { I18nProvider } from '@/infrastructure/runtime/i18n';

const SKIN = readFileSync(
  resolve(__dirname, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/back-top/index.css'),
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
  it('computes initial visibility eagerly for the default window target', () => {
    // Mount-time scroll position decides the first paint without any scroll
    // pass: a visibilityHeight={0} trigger (or a window already scrolled past
    // the threshold) must not wait for the listener effect's first run.
    Object.defineProperty(document.documentElement, 'scrollTop', {
      configurable: true,
      writable: true,
      value: 500,
    });
    const scrolled = render(<BackTop visibilityHeight={300} />);
    expect(screen.getByRole('button', { name: 'Back to top' })).toBeInTheDocument();
    scrolled.unmount();

    Object.defineProperty(document.documentElement, 'scrollTop', {
      configurable: true,
      writable: true,
      value: 0,
    });
    const atTop = render(<BackTop visibilityHeight={0} onClick={() => {}} />);
    // visibilityHeight={0} means "always visible" — even at scrollTop 0.
    expect(screen.getByRole('button', { name: 'Back to top' })).toBeInTheDocument();
    atTop.unmount();

    const hidden = render(<BackTop visibilityHeight={300} />);
    expect(screen.queryByRole('button', { name: 'Back to top' })).toBeNull();
    hidden.unmount();
  });

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
    expect(SKIN).toContain('inset-inline-end: 2rem;');
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
    expect(screen.getByRole('button')).toHaveAccessibleName('Top');
  });

  it('scrolls the window to top on click and reports onClick', async () => {
    const scrollTo = vi.fn();
    Object.defineProperty(window, 'scrollTo', { configurable: true, writable: true, value: scrollTo });
    const handleClick = vi.fn();
    scrollWindowTo(600);
    render(<BackTop visibilityHeight={0} onClick={handleClick} />);

    fireEvent.click(screen.getByRole('button', { name: 'Back to top' }));
    expect(handleClick).toHaveBeenCalledTimes(1);
    // Retargeted (R2 lane E): the destination is the contract's own `duration`, not the user
    // agent's `behavior: 'smooth'` cadence, which it could never honor.
    await vi.waitFor(() => {
      expect(scrollTo).toHaveBeenCalled();
      expect(scrollTo.mock.calls.at(-1)?.[0]?.top).toBe(0);
    });
  });

  it('consumer inline style still merges', () => {
    render(<BackTop visibilityHeight={0} style={{ backgroundColor: 'rgb(1, 2, 3)' }} />);
    const button = screen.getByRole('button', { name: 'Back to top' });
    expect(button.style.backgroundColor).toBe('rgb(1, 2, 3)');
  });
});

describe('BackTop modern contract: visible-label accessible name (WCAG 2.5.3)', () => {
  it('names the button from visible text children instead of the fixed label', () => {
    render(<BackTop visibilityHeight={0}>Go up</BackTop>);
    const button = screen.getByRole('button', { name: 'Go up' });
    expect(button).not.toHaveAttribute('aria-label');
    expect(button.getAttribute('data-part')).toBe('trigger');
  });

  it('names the button from nested visible text', () => {
    render(
      <BackTop visibilityHeight={0}>
        <span>
          Back <strong>up</strong>
        </span>
      </BackTop>
    );
    expect(screen.getByRole('button')).toHaveAccessibleName('Back up');
  });

  it.each([
    ['the default glyph', undefined],
    ['a symbol-only glyph', <span>^</span>],
    ['an arrow character', '↑'],
    ['icon-only markup', <svg aria-hidden="true" />],
    ['text hidden from assistive technology', <span aria-hidden="true">Top</span>],
    ['text in a hidden element', <span hidden>Top</span>],
  ])('keeps the localized default name for %s', (_case, content) => {
    render(<BackTop visibilityHeight={0}>{content}</BackTop>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Back to top');
    expect(button).toHaveAccessibleName('Back to top');
  });

  it('prefers visible text over the catalog label and keeps the catalog default otherwise', async () => {
    render(
      <I18nProvider locale="es" fallbackLocale="en">
        <BackTop visibilityHeight={0}>Subir</BackTop>
        <BackTop visibilityHeight={0} />
      </I18nProvider>
    );
    expect(await screen.findByRole('button', { name: 'Subir' })).not.toHaveAttribute('aria-label');
    expect(await screen.findByRole('button', { name: 'Volver arriba' })).toHaveAttribute('aria-label', 'Volver arriba');
  });

  it('keeps the scroll journey, onClick and focus return with text children', async () => {
    const scrollTo = vi.fn();
    Object.defineProperty(window, 'scrollTo', { configurable: true, writable: true, value: scrollTo });
    const handleClick = vi.fn();
    scrollWindowTo(600);
    render(
      <BackTop visibilityHeight={0} onClick={handleClick}>
        Go up
      </BackTop>
    );

    const button = screen.getByRole('button', { name: 'Go up' });
    button.focus();
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(document.body);
    await vi.waitFor(() => {
      expect(scrollTo.mock.calls.at(-1)?.[0]?.top).toBe(0);
    });
  });
});
