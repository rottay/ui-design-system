import React from 'react';
import { useChartPaint, resolveChartPaint, type ChartPaintDecision } from './contract';

/* R-1: an unknown family id is refused by name. */
// @ts-expect-error R-1
const r1 = resolveChartPaint({ family: 'pie' });

/* R-2: an unknown scheme is refused. */
// @ts-expect-error R-2
const r2 = resolveChartPaint({ family: 'pie-chart', scheme: 'rainbow' });

/* R-3: the React door cannot be handed a tokenScheme (it reads tokens itself). */
// @ts-expect-error R-3
const r3 = () => useChartPaint({ family: 'bar-chart', tokenScheme: 'default' });

/* R-4: rootAttributes is readonly; a renderer cannot rewrite the stamped scope. */
export function r4(d: ChartPaintDecision) {
  // @ts-expect-error R-4
  d.rootAttributes['data-chart-color-scheme'] = 'monochrome';
}

/* R-5: `categorical` is nullable; a semantic family cannot be indexed blind. */
export function r5(d: ChartPaintDecision) {
  // @ts-expect-error R-5
  return d.categorical.paintFor(0);
}

/* R-6: slots is readonly; nobody mutates the palette in place. */
export function r6(d: ChartPaintDecision) {
  // @ts-expect-error R-6
  d.categorical!.slots[0] = '#ff0000';
}

/* R-7: the decision itself is not assignable field-by-field. */
export function r7(d: ChartPaintDecision) {
  // @ts-expect-error R-7
  d.scheme = 'pastel';
}

/* R-8: an excess property on the request is refused (no silent option drift). */
// @ts-expect-error R-8
const r8 = resolveChartPaint({ family: 'bar-chart', palette: ['#f00'] });

export const used = [r1, r2, r3, r8];
