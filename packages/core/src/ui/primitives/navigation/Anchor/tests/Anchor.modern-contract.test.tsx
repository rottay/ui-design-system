/**
 * Anchor modern-engine contract tests (K3-C pass 1).
 *
 * The K3-C falsification found: (1) the accent bar was a PHYSICAL
 * `border-l-2` and the nested indent a physical `ml-4` -- both stranded on
 * the wrong side under `dir="rtl"`; (2) the engine docblock still spoke of
 * the legacy Hermes/Titan/Apollo engine names; (3) click scrolling was
 * unconditionally `behavior: 'smooth'`, ignoring prefers-reduced-motion;
 * (4) the active link carried no `aria-current`; (5) the root had no
 * first-party class at all, so the sticky/flex structure could not be
 * skin-owned. These tests pin the new contract.
 */
import React from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Anchor, Link } from '../engines/modern';

const SKIN = readFileSync(
  resolve(__dirname, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/anchor.css'),
  'utf8',
);

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Anchor modern contract: anatomy', () => {
  it('root carries the minted class pair with direction/affix stamps, no structure utilities', () => {
    const { container } = render(
      <Anchor direction="horizontal">
        <Link href="#a" title="A" />
      </Anchor>
    );
    const root = container.querySelector('[data-part="root"]') as HTMLElement;
    expect(root.className).toContain('rottay-anchor');
    expect(root.className).toContain('rottay-anchor--modern');
    expect(root.getAttribute('data-direction')).toBe('horizontal');
    expect(root.getAttribute('data-affix')).toBe('true');
    expect(root.className).not.toMatch(/sticky|top-0|flex|gap-2/);
  });

  it('keeps the affix top offset inline (runtime value)', () => {
    const { container } = render(
      <Anchor affix offsetTop={80}>
        <Link href="#a" title="A" />
      </Anchor>
    );
    const root = container.querySelector('[data-part="root"]') as HTMLElement;
    expect(root.style.top).toBe('80px');
  });

  it('link uses a skin-owned logical accent width, never physical border utilities', () => {
    render(
      <Anchor>
        <Link href="#a" title="A" />
      </Anchor>
    );
    const link = screen.getByText('A');
    expect(link).toHaveAttribute('data-part', 'item');
    expect(SKIN).toContain('border-inline-start-width: 2px');
    expect(link.className).not.toContain('border-s-2');
    expect(link.className).not.toContain('border-l-2');
    // Rhythm/typography utilities are skin-owned now.
    expect(link.className).not.toMatch(/py-1|px-3|text-sm|transition-colors|block|font-medium/);
  });

  it('stamps selection so the skin owns transparent and selected border paint', () => {
    render(
      <Anchor activeKey="#a">
        <Link href="#a" title="A" />
        <Link href="#b" title="B" />
      </Anchor>
    );
    expect(screen.getByText('A')).toHaveAttribute('data-selected', 'true');
    expect(screen.getByText('B')).toHaveAttribute('data-selected', 'false');
    expect(SKIN).toMatch(/\[data-selected='false'\]\s*\{[^}]*border-color:\s*transparent/);
  });

  it('nested children render inside data-part="nested" (skin owns the logical indent)', () => {
    const { container } = render(
      <Anchor>
        <Link href="#a" title="A">
          <Link href="#a-1" title="A1" />
        </Link>
      </Anchor>
    );
    const nested = container.querySelector('[data-part="nested"]') as HTMLElement;
    expect(nested).toBeTruthy();
    expect(nested.className ?? '').not.toMatch(/ml-4|ms-4/);
    expect(nested.contains(screen.getByText('A1'))).toBe(true);
  });
});

describe('Anchor modern contract: state and motion', () => {
  it('stamps data-selected and aria-current on the active link only', () => {
    render(
      <Anchor activeKey="#a">
        <Link href="#a" title="A" />
        <Link href="#b" title="B" />
      </Anchor>
    );
    const active = screen.getByText('A');
    const idle = screen.getByText('B');
    expect(active.getAttribute('data-selected')).toBe('true');
    expect(active.getAttribute('aria-current')).toBe('location');
    expect(idle.getAttribute('data-selected')).toBe('false');
    expect(idle.getAttribute('aria-current')).toBeNull();
  });

  it('click scrolls with smooth behavior when reduced motion is not requested', () => {
    const scrollIntoView = vi.fn();
    const target = document.createElement('section');
    target.id = 'target-smooth';
    target.scrollIntoView = scrollIntoView;
    document.body.appendChild(target);

    render(
      <Anchor>
        <Link href="#target-smooth" title="Go" />
      </Anchor>
    );
    fireEvent.click(screen.getByText('Go'));
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    target.remove();
  });

  it('click scrolls with behavior auto under prefers-reduced-motion', () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      onchange: null,
      dispatchEvent: vi.fn(),
    }));

    const scrollIntoView = vi.fn();
    const target = document.createElement('section');
    target.id = 'target-reduced';
    target.scrollIntoView = scrollIntoView;
    document.body.appendChild(target);

    render(
      <Anchor>
        <Link href="#target-reduced" title="Go" />
      </Anchor>
    );
    fireEvent.click(screen.getByText('Go'));
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto' });

    target.remove();
    window.matchMedia = originalMatchMedia;
  });
});
