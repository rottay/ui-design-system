import React from 'react';
import { describe, expect, it } from 'vitest';

import { WaterfallChart } from '..';
import {
  requireChartSemanticPaint,
  resolveChartPaint,
} from '../../../runtime/theming/composition/foundation/paint';
import { renderSurface } from '../../../../../../surfaces/foundation/common/test-utils';

const TONES = requireChartSemanticPaint(resolveChartPaint({ family: 'waterfall' }));

const DATA = [
  { label: 'Revenue', value: 420 },
  { label: 'COGS', value: -200 },
  { label: 'Net', value: 220, type: 'total' as const },
];

function renderWaterfall(props: Record<string, unknown> = {}) {
  return renderSurface(
    <WaterfallChart data={DATA} width={640} height={360} responsive={false} legend {...props} />,
  );
}

function barPaint(container: HTMLElement): Record<string, string | null> {
  const entries = [...container.querySelectorAll('[data-part="bar"]')]
    .map((bar) => [bar.getAttribute('data-status') ?? '', bar.getAttribute('fill')] as const);
  return Object.fromEntries(entries);
}

describe('WaterfallChart semantic tones', () => {
  it('paints each bar through its own tone chain', () => {
    expect(barPaint(renderWaterfall().container)).toEqual({
      increase: TONES.toneFor('increase'),
      decrease: TONES.toneFor('decrease'),
      total: TONES.toneFor('total'),
    });
  });

  it('lets a caller colour win over the chain, per tone', () => {
    const paint = barPaint(renderWaterfall({ decreaseColor: '#aa00cc' }).container);
    expect(paint.decrease).toBe('#aa00cc');
    expect(paint.increase).toBe(TONES.toneFor('increase'));
    expect(paint.total).toBe(TONES.toneFor('total'));
  });

  it('stamps its legend by status, so the tone survives the swatch', () => {
    const { container } = renderWaterfall();
    expect(
      [...container.querySelectorAll('[data-part="legend-swatch"]')]
        .map((swatch) => swatch.getAttribute('data-status')),
    ).toEqual(['increase', 'decrease', 'total']);
  });

  it('declares exactly the three tones it paints', () => {
    expect(TONES.tones).toEqual(['increase', 'decrease', 'total']);
  });

  it('never borrows a categorical slot: a scheme switch leaves the tones alone', () => {
    for (const scheme of ['accessible', 'monochrome', 'vibrant'] as const) {
      const decision = resolveChartPaint({ family: 'waterfall', scheme });
      expect(decision.categorical, scheme).toBeNull();
      expect(requireChartSemanticPaint(decision).toneFor('total'), scheme)
        .toBe(TONES.toneFor('total'));
    }
  });
});
