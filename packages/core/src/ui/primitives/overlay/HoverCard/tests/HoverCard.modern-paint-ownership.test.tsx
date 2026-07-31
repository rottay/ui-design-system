/**
 * HoverCard modern engine — skin paint ownership & logical align (K4-A).
 *
 * Falsification of the "0 inline, 0 Daisy" inventory claim found two static
 * chrome values inline (`padding: 16; width: 288`) and two Tailwind utilities
 * (`relative inline-block`) on the trigger. K4-A drained them into the
 * unlayered skin `hover-card.css` on family-local `--ds-hover-card-*`
 * channels, and made `align: start/end` logical along the inline axis: the
 * shared runtime's `-start`/`-end` are physical, so under `dir="rtl"` a
 * `top|bottom-*` placement mirrors (left/right sides align on the block axis
 * and do not mirror).
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import React from 'react';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const useOverlayPositionSpy = vi.fn(
  (_args: unknown): { strategy: string; style: Record<string, never>; anchorAttrs: Record<string, never> } => ({
    strategy: 'js',
    style: {},
    anchorAttrs: {},
  })
);

vi.mock('../../../runtime/overlay/positioning', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    useOverlayPosition: (args: unknown) => useOverlayPositionSpy(args),
  };
});

import ModernHoverCard from '../engines/modern';

const here = dirname(fileURLToPath(import.meta.url));
// Comments are stripped so header prose cannot false-green the rule pins.
const SKIN = readFileSync(
  join(here, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/hover-card.css'),
  'utf8'
).replace(/\/\*[\s\S]*?\*\//g, '');

afterEach(() => {
  cleanup();
  useOverlayPositionSpy.mockClear();
});

function lastPlacement(): string {
  const lastCall = useOverlayPositionSpy.mock.calls.at(-1)?.[0] as { placement: string };
  return lastCall.placement;
}

describe('HoverCard modern engine — chrome is skin-owned', () => {
  it('keeps width/padding out of the surface element style', () => {
    render(
      <ModernHoverCard open content={<div>Card</div>} trigger={<span>Hover</span>} />,
    );
    const surface = document.querySelector('[data-part="surface"]') as HTMLElement;

    expect(surface.style.width).toBe('');
    expect(surface.style.padding).toBe('');
    expect(surface.style.zIndex).toBe('var(--ds-z-popover)');
  });

  it('drops the `relative inline-block` utilities from the trigger', () => {
    const { container } = render(
      <ModernHoverCard content={<div>Card</div>} trigger={<span>Hover</span>} />,
    );
    const trigger = container.querySelector('[data-part="trigger"]') as HTMLElement;

    expect(trigger.className).toContain('rottay-hover-card--modern');
    expect(trigger.className).not.toMatch(/\brelative\b/);
    expect(trigger.className).not.toMatch(/\binline-block\b/);
  });
});

describe('HoverCard modern engine — align mirrors along the inline axis', () => {
  it('passes bottom-start through unchanged in LTR', () => {
    render(
      <ModernHoverCard open side="bottom" align="start" content={<div>Card</div>} trigger={<span>Hover</span>} />,
    );
    expect(lastPlacement()).toBe('bottom-start');
  });

  it('mirrors bottom-start to bottom-end inside a dir="rtl" subtree', () => {
    render(
      <div dir="rtl">
        <ModernHoverCard open side="bottom" align="start" content={<div>Card</div>} trigger={<span>Hover</span>} />
      </div>,
    );
    expect(lastPlacement()).toBe('bottom-end');
  });

  it('mirrors top-end to top-start inside a dir="rtl" subtree', () => {
    render(
      <div dir="rtl">
        <ModernHoverCard open side="top" align="end" content={<div>Card</div>} trigger={<span>Hover</span>} />
      </div>,
    );
    expect(lastPlacement()).toBe('top-start');
  });

  it('does NOT mirror block-axis alignment (side=left stays left-start)', () => {
    render(
      <div dir="rtl">
        <ModernHoverCard open side="left" align="start" content={<div>Card</div>} trigger={<span>Hover</span>} />
      </div>,
    );
    expect(lastPlacement()).toBe('left-start');
  });
});

describe('HoverCard modern engine — the skin owns the drained paint', () => {
  it('owns the trigger positioning context', () => {
    expect(SKIN).toMatch(/\.rottay-hover-card--modern\[data-part='trigger'\]\s*\{[^}]*position: relative;[^}]*display: inline-block;/);
  });

  it('owns the card chrome with the shipped values as fallbacks', () => {
    expect(SKIN).toContain('inline-size: var(--ds-hover-card-width, 18rem);');
    expect(SKIN).toContain('padding: var(--ds-hover-card-padding, var(--ds-spacing-4, 1rem));');
  });

  it('shares the lane overlay material register with Dropdown (Pass-2 coherence)', () => {
    expect(SKIN).toContain('color-mix(in srgb, var(--ds-color-primary) 5%, transparent)');
    expect(SKIN).toContain('linear-gradient(var(--ds-elevation-surface-3), var(--ds-elevation-surface-3))');
    expect(SKIN).toContain('var(--ds-surface-card)');
    expect(SKIN).toContain('var(--ds-hover-card-border-color, color-mix(in srgb, var(--ds-color-border) 86%, var(--ds-color-primary) 14%))');
    expect(SKIN).toContain('var(--ds-hover-card-shadow, var(--ds-elevation-3))');
    expect(SKIN).toContain('var(--ds-hover-card-radius, var(--ds-radius-xl, 16px))');
    expect(SKIN).not.toContain('background: var(--ds-surface-card);');
  });
});
