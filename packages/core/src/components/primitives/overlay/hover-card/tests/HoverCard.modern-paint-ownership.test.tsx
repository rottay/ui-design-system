/**
 * HoverCard modern engine — skin paint ownership & logical align (K4-A).
 *
 * Falsification of the "0 inline, 0 Daisy" inventory claim found two static
 * chrome values inline (`padding: 16; width: 288`) and two Tailwind utilities
 * (`relative inline-block`) on the trigger. K4-A drained them into the
 * unlayered skin `hover-card.css` on family-local `--ds-hover-card-*`
 * channels, and made `align: start/end` logical along the inline axis: the
 * shared runtime's `-start`/`-end` are physical, so under `dir="rtl"` a
 * `top|bottom-*` placement mirrors (the inline-axis sides align on the block
 * axis and do not mirror). WO-INV-01 then made the SIDE logical, so an
 * inline side is `inline-start`/`inline-end` and CSS -- not this engine --
 * mirrors it; `left`/`right` survive as deprecated aliases.
 */
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

import { I18nProvider } from '@/infrastructure/runtime/i18n';

import ModernHoverCard from '../engines/modern';

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
    expect(surface.style.zIndex).toBe('');
    expect(surface.style.getPropertyValue('--ds-hover-card-layer')).toBe('var(--ds-z-index-popover)');
  });

  it('drops the `relative inline-block` utilities from the trigger', () => {
    const { container } = render(
      <ModernHoverCard content={<div>Card</div>} trigger={<span>Hover</span>} />,
    );
    const trigger = container.querySelector('[data-part="trigger"]') as HTMLElement;

    expect(trigger.className).toContain('ds-hover-card--modern');
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
      <I18nProvider locale="ar" fallbackLocale="en">
        <ModernHoverCard open side="bottom" align="start" content={<div>Card</div>} trigger={<span>Hover</span>} />
      </I18nProvider>,
    );
    expect(lastPlacement()).toBe('bottom-end');
  });

  it('mirrors top-end to top-start inside a dir="rtl" subtree', () => {
    render(
      <I18nProvider locale="ar" fallbackLocale="en">
        <ModernHoverCard open side="top" align="end" content={<div>Card</div>} trigger={<span>Hover</span>} />
      </I18nProvider>,
    );
    expect(lastPlacement()).toBe('top-start');
  });

  it('does NOT mirror block-axis alignment (an inline side keeps -start in both directions)', () => {
    render(
      <I18nProvider locale="ar" fallbackLocale="en">
        <ModernHoverCard open side="inline-start" align="start" content={<div>Card</div>} trigger={<span>Hover</span>} />
      </I18nProvider>,
    );
    expect(lastPlacement()).toBe('inline-start-start');
    cleanup();

    // The counter-factual: the alignment suffix is identical under LTR, which
    // is what "does not mirror" means. The SIDE is what the direction moves,
    // and CSS moves it -- not this engine.
    render(
      <ModernHoverCard open side="inline-start" align="start" content={<div>Card</div>} trigger={<span>Hover</span>} />,
    );
    expect(lastPlacement()).toBe('inline-start-start');
  });

  it('accepts the deprecated physical side as an alias of the logical one', () => {
    render(
      <ModernHoverCard open side="left" align="start" content={<div>Card</div>} trigger={<span>Hover</span>} />,
    );
    expect(lastPlacement()).toBe('inline-start-start');
    cleanup();

    render(
      <ModernHoverCard open side="right" align="end" content={<div>Card</div>} trigger={<span>Hover</span>} />,
    );
    expect(lastPlacement()).toBe('inline-end-end');
  });
});
