/**
 * WO-INV-01 -- the frozen Tooltip engines' placement reach.
 *
 * `TooltipPlacement` carries logical inline sides, but only the Modern engine
 * implements them. The frozen Classic and Rustic engines read the raw prop
 * through a PHYSICAL placement map and resolve a key that map does not contain
 * to `top`.
 *
 * That fallback is a refusal, not partial support, and this file is what makes
 * the difference checkable rather than asserted:
 *
 *   - the physical spellings keep their edge, in both reading directions;
 *   - every one of the six logical spellings lands on `top` -- never on an
 *     inline edge, never mirrored, never a guess;
 *   - the shared `PLACEMENT_MAP` contains the physical vocabulary and nothing
 *     else, so a logical row cannot be slipped in to make a coverage number
 *     move without this file going red.
 *
 * A future lot that unfreezes these engines should delete these tests, not
 * widen them.
 */
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('antd', () => ({
  Tooltip: ({
    children,
    placement,
  }: {
    children?: React.ReactNode;
    placement?: string;
  }) => (
    <div data-testid="antd-tooltip" data-antd-placement={placement}>
      {children}
    </div>
  ),
}));

import { I18nProvider } from '@/infrastructure/runtime/i18n';

import { PLACEMENT_MAP, type TooltipPlacement } from '../contracts';
import ClassicTooltip from '../engines/classic';
import RusticTooltip from '../engines/rustic';

const LOGICAL_PLACEMENTS = [
  'inline-start',
  'inline-start-start',
  'inline-start-end',
  'inline-end',
  'inline-end-start',
  'inline-end-end',
] as const satisfies readonly TooltipPlacement[];

const PHYSICAL_PLACEMENTS = [
  'left',
  'left-start',
  'left-end',
  'right',
  'right-start',
  'right-end',
] as const satisfies readonly TooltipPlacement[];

afterEach(() => {
  cleanup();
});

function renderClassic(placement: TooltipPlacement, locale: 'en' | 'ar'): string | null {
  render(
    <I18nProvider locale={locale}>
      <ClassicTooltip content="Body" placement={placement}>
        <button type="button">Trigger</button>
      </ClassicTooltip>
    </I18nProvider>
  );
  return screen.getByTestId('antd-tooltip').getAttribute('data-antd-placement');
}

function renderRustic(placement: TooltipPlacement, locale: 'en' | 'ar'): CSSStyleDeclaration {
  render(
    <I18nProvider locale={locale}>
      <RusticTooltip content="Body" placement={placement} visible>
        <button type="button">Trigger</button>
      </RusticTooltip>
    </I18nProvider>
  );
  return (screen.getByRole('tooltip', { hidden: true }) as HTMLElement).style;
}

describe('the shared placement map is physical and closed', () => {
  it('has a row for every physical spelling and none for a logical one', () => {
    expect(Object.keys(PLACEMENT_MAP).sort()).toEqual(
      [
        'bottom',
        'bottom-end',
        'bottom-start',
        'left',
        'left-end',
        'left-start',
        'right',
        'right-end',
        'right-start',
        'top',
        'top-end',
        'top-start',
      ].sort()
    );
    for (const placement of LOGICAL_PLACEMENTS) {
      expect(PLACEMENT_MAP[placement]).toBeUndefined();
    }
  });
});

describe('frozen Classic tooltip: physical vocabulary only', () => {
  it.each(PHYSICAL_PLACEMENTS)('%s keeps its antd edge in both directions', (placement) => {
    const expected = {
      left: 'left',
      'left-start': 'leftTop',
      'left-end': 'leftBottom',
      right: 'right',
      'right-start': 'rightTop',
      'right-end': 'rightBottom',
    }[placement];

    expect(renderClassic(placement, 'en')).toBe(expected);
    cleanup();
    expect(renderClassic(placement, 'ar')).toBe(expected);
  });

  it.each(LOGICAL_PLACEMENTS)('%s is refused to top, not resolved to an edge', (placement) => {
    for (const locale of ['en', 'ar'] as const) {
      expect(renderClassic(placement, locale)).toBe('top');
      cleanup();
    }
  });
});

describe('frozen Rustic tooltip: physical vocabulary only', () => {
  it.each([
    ['left', 'right'],
    ['right', 'left'],
  ] as const)('%s anchors on its physical edge in both directions', (placement, offsetEdge) => {
    for (const locale of ['en', 'ar'] as const) {
      const style = renderRustic(placement, locale);
      // `left: right: 100%` puts the bubble to the physical left of the
      // trigger; `right` is the mirror image. Neither moves with the locale.
      expect(style.getPropertyValue(offsetEdge)).toBe('100%');
      expect(style.top).toBe('50%');
      cleanup();
    }
  });

  it.each(LOGICAL_PLACEMENTS)('%s is refused to the top row, not to an inline edge', (placement) => {
    for (const locale of ['en', 'ar'] as const) {
      const style = renderRustic(placement, locale);
      // The `top` row verbatim: above the trigger, centred, with no inline
      // anchor at all.
      expect(style.bottom).toBe('100%');
      expect(style.left).toBe('50%');
      expect(style.right).toBe('');
      expect(style.top).toBe('');
      cleanup();
    }
  });
});
