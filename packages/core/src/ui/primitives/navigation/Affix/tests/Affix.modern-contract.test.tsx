/**
 * Affix modern-engine contract tests (K3-C pass 1).
 *
 * The K3-C falsification found the family's whitelabel story broken twice:
 * the engine docblock taught `bg-white shadow-lg` on children (hardcoded
 * surface, removed in this pass), and the affixed state painted no surface
 * at all -- the only affixed chrome was a box-shadow in the 17-line skin,
 * with the transition living in the engine as a `transition-all
 * duration-200` raw utility. These tests pin:
 *
 *  - no `transition-*`/`duration-*` utility survives on the affix root in
 *    either mode (the skin owns the affixed transition);
 *  - the affixed inline style carries position/offsets only -- never
 *    background/shadow paint (the skin owns the affixed surface);
 *  - the `data-sticky` contract and z-index class mapping are unchanged.
 */
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import ModernAffix from '../engines/modern';

function createRect(overrides: Partial<DOMRect> = {}): DOMRect {
  return {
    top: 0,
    bottom: 48,
    left: 16,
    right: 216,
    width: 200,
    height: 48,
    x: 16,
    y: 0,
    toJSON: () => ({}),
    ...overrides,
  } as DOMRect;
}

describe('Affix modern contract: paint ownership', () => {
  let placeholderRect = createRect({ top: 4, bottom: 52 });

  beforeEach(() => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback) => {
      callback(1000);
      return 1;
    });
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => placeholderRect);
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1440 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 900 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('simple sticky mode carries no transition utilities', () => {
    render(
      <ModernAffix offsetTop={0}>
        <span>Sticky bar</span>
      </ModernAffix>
    );
    const affix = screen.getByText('Sticky bar').parentElement as HTMLElement;
    expect(affix.className).not.toMatch(/transition-all|duration-\d+/);
    expect(affix.className).toContain('rottay-affix');
    expect(affix.className).toContain('rottay-affix--modern');
  });

  it('advanced mode affixes with position-only inline style (surface is skin-owned)', async () => {
    const handleChange = vi.fn();
    placeholderRect = createRect({ top: 4, bottom: 52, left: 12, right: 212, width: 200, height: 48 });

    render(
      <ModernAffix offsetTop={8} onChange={handleChange}>
        <span>Sticky bar</span>
      </ModernAffix>
    );
    const affix = (await screen.findByText('Sticky bar')).parentElement as HTMLElement;

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith(true);
    });
    expect(affix.getAttribute('data-sticky')).toBe('true');
    expect(affix.className).not.toMatch(/transition-all|duration-\d+/);
    // Position/offset channels stay inline (runtime-measured)...
    expect(affix.style.position).toBe('fixed');
    expect(affix.style.top).toBe('8px');
    // ...but the affixed SURFACE never lands inline: the skin owns it.
    expect(affix.style.background).toBe('');
    expect(affix.style.backgroundColor).toBe('');
    expect(affix.style.boxShadow).toBe('');
  });
});
