/**
 * WO-INV-01 -- an unsupported placement is a REFUSAL, and a refusal has to be
 * audible.
 *
 * `Tooltip.frozen-placement-reach.test.tsx` pins where a logical spelling
 * LANDS inside a frozen engine: on the `top` row, never on an inline edge.
 * That is the documented production posture and it stays. What it cannot pin
 * is whether the caller is ever TOLD, and until this file the answer was no:
 * a logical placement handed to Classic or Rustic painted `top` in silence,
 * indistinguishable from a caller who asked for `top`.
 *
 * The disposition is now stated at the shared boundary -- the engine router
 * every Tooltip passes through, frozen and Modern alike, which already refuses
 * a missing engine declaration and a declared implementation absence by name:
 *
 *   - in development the boundary THROWS, naming the engine, the spelling it
 *     cannot honor and the physical spelling that works;
 *   - in production nothing changes: the frozen engine's own `top` fallback
 *     stands, deterministically, exactly as documented;
 *   - a physical spelling is untouched in either mode, and the Modern engine
 *     -- which implements the logical vocabulary -- is never refused.
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

import { Tooltip } from '..';
import type { TooltipPlacement } from '../contracts';

const LOGICAL_PLACEMENTS = [
  'inline-start',
  'inline-start-start',
  'inline-start-end',
  'inline-end',
  'inline-end-start',
  'inline-end-end',
] as const satisfies readonly TooltipPlacement[];

/** The physical spelling each refusal must name, per the published alias table. */
const PHYSICAL_SPELLING: Record<(typeof LOGICAL_PLACEMENTS)[number], string> = {
  'inline-start': 'left',
  'inline-start-start': 'left-start',
  'inline-start-end': 'left-end',
  'inline-end': 'right',
  'inline-end-start': 'right-start',
  'inline-end-end': 'right-end',
};

const FROZEN_ENGINES = ['classic', 'rustic'] as const;

function renderTooltip(
  engine: 'classic' | 'modern' | 'rustic',
  placement: TooltipPlacement
): void {
  render(
    <I18nProvider locale="en">
      <Tooltip engine={engine} content="Body" placement={placement} visible>
        <button type="button">Trigger</button>
      </Tooltip>
    </I18nProvider>
  );
}

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe('development: the boundary refuses a placement the frozen engine cannot honor', () => {
  for (const engine of FROZEN_ENGINES) {
    it.each(LOGICAL_PLACEMENTS)(
      `${engine} + %s throws, naming the engine and the spelling that works`,
      (placement) => {
        // React logs the render error on its way out; the throw is the assertion.
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        try {
          expect(() => renderTooltip(engine, placement)).toThrow(
            new RegExp(
              `Tooltip: .*${engine}.*"${placement}".*"${PHYSICAL_SPELLING[placement]}"`,
              's'
            )
          );
        } finally {
          consoleError.mockRestore();
        }
      }
    );
  }
});

describe('development: what the boundary does NOT refuse', () => {
  it.each(['left', 'left-start', 'left-end', 'right', 'right-start', 'right-end'] as const)(
    'rustic + %s is admitted and keeps its physical edge',
    async (placement) => {
      renderTooltip('rustic', placement);

      const style = ((await screen.findByRole('tooltip', { hidden: true })) as HTMLElement).style;
      expect(style.getPropertyValue(placement.startsWith('left') ? 'right' : 'left')).toBe('100%');
    }
  );

  it.each(LOGICAL_PLACEMENTS)('modern + %s is admitted: it implements them', async (placement) => {
    renderTooltip('modern', placement);

    expect(await screen.findByText('Trigger')).toBeInTheDocument();
  });
});

describe('production: the documented posture is unchanged', () => {
  it.each(LOGICAL_PLACEMENTS)(
    'rustic + %s still resolves to the top row, without a crash',
    async (placement) => {
      vi.stubEnv('NODE_ENV', 'production');

      renderTooltip('rustic', placement);

      const style = ((await screen.findByRole('tooltip', { hidden: true })) as HTMLElement).style;
      expect(style.bottom).toBe('100%');
      expect(style.left).toBe('50%');
      expect(style.right).toBe('');
      expect(style.top).toBe('');
    }
  );

  it('classic + a logical spelling still resolves to antd top, without a crash', async () => {
    vi.stubEnv('NODE_ENV', 'production');

    renderTooltip('classic', 'inline-end');

    expect((await screen.findByTestId('antd-tooltip')).getAttribute('data-antd-placement')).toBe(
      'top'
    );
  });
});
