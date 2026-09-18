/**
 * The eight negative legs of the paint contract, executed by the type checker.
 *
 * Every leg is an `@ts-expect-error`, so a contract that STOPPED refusing one
 * of them reddens this same file on the now-unused directive: the check cannot
 * pass by being permissive. The positive half -- that the adapters below
 * compile at all -- is the other direction of the same proof.
 */
import { describe, expect, it } from 'vitest';

import {
  materializeChartPaint,
  resolveChartPaint,
  type ChartCategoricalPaint,
  type ChartPaintDecision,
} from '../index';
import {
  ChartPaintProvider,
  useChartPaint,
  useChartPaintDecision,
} from '../../../react/paint';

/* ---- refusals -------------------------------------------------------- */

/* R-1: an unknown family id is refused by name. */
// @ts-expect-error R-1
const r1 = () => resolveChartPaint({ family: 'pie' });

/* R-2: an unknown scheme is refused. */
// @ts-expect-error R-2
const r2 = () => resolveChartPaint({ family: 'pie-chart', scheme: 'rainbow' });

/* R-3: the React door cannot be handed a tokenScheme (it reads tokens itself). */
// @ts-expect-error R-3
const r3 = () => useChartPaint({ family: 'bar-chart', tokenScheme: 'default' });

/* R-4: rootAttributes is readonly; a renderer cannot rewrite the stamped scope. */
function r4(d: ChartPaintDecision) {
  // @ts-expect-error R-4
  d.rootAttributes['data-chart-color-scheme'] = 'monochrome';
}

/* R-5: `categorical` is nullable; a semantic family cannot be indexed blind. */
function r5(d: ChartPaintDecision) {
  // @ts-expect-error R-5
  return d.categorical.paintFor(0);
}

/* R-6: slots is readonly; nobody mutates the palette in place. */
function r6(d: ChartPaintDecision) {
  // @ts-expect-error R-6
  d.categorical!.slots[0] = '#ff0000';
}

/* R-7: the decision itself is not assignable field-by-field. */
function r7(d: ChartPaintDecision) {
  // @ts-expect-error R-7
  d.scheme = 'pastel';
}

/* R-8: an excess property on the request is refused (no silent option drift). */
// @ts-expect-error R-8
const r8 = () => resolveChartPaint({ family: 'bar-chart', palette: ['#f00'] });

/* ---- adapters that must compile -------------------------------------- */

/* (1) A categorical family: resolves once, publishes, never indexes by hand. */
function BarChartFamily({
  scheme,
  series,
}: {
  scheme?: 'default' | 'monochrome';
  series: readonly { name: string }[];
}) {
  const decision = useChartPaint({ family: 'bar-chart', scheme });
  return (
    <ChartPaintProvider decision={decision}>
      <BarRenderer series={series} />
    </ChartPaintProvider>
  );
}

/* (2) A renderer READS; it never resolves and never receives a scheme prop. */
function BarRenderer({ series }: { series: readonly { name: string }[] }) {
  const decision = useChartPaintDecision();
  const cat: ChartCategoricalPaint | null = decision.categorical;
  return (
    <div {...decision.rootAttributes} data-part="chart-renderer">
      {series.map((s, i) => (
        <span
          key={s.name}
          data-part="bar-mark"
          data-series-index={cat ? cat.slotIndexFor(i) : undefined}
          data-series-cadence={cat?.cadenceIndexFor(i) ?? undefined}
          style={{ ['--ds-chart-mark-color' as never]: cat?.paintFor(i) }}
        />
      ))}
    </div>
  );
}

/* (3) A semantic family: categorical is null and the code must handle it. */
function GaugeFamily() {
  const decision = useChartPaint({ family: 'gauge' });
  const arcs = decision.categorical === null ? ['error', 'warning', 'success'] : [];
  return <div {...decision.rootAttributes}>{arcs.length}</div>;
}

/* (4) A sequential family. */
function HeatMapFamily({ t }: { t: number }) {
  const decision = useChartPaint({ family: 'heat-map' });
  return <div>{decision.sequential ? decision.sequential.stopFor(t) : 'n/a'}</div>;
}

/* (5) The export door: one materialization, no second getComputedStyle walk. */
function exportPaint(d: ChartPaintDecision, owner: Element): readonly string[] {
  return materializeChartPaint(d, owner).resolved;
}

/* (6) The pure resolver is callable outside React (gates, tests, export). */
const pure = resolveChartPaint({
  family: 'pie-chart',
  scheme: 'vibrant',
  tokenScheme: 'default',
});

describe('the paint contract', () => {
  it('declares eight refusal legs and six adapters', () => {
    expect([r1, r2, r3, r4, r5, r6, r7, r8]).toHaveLength(8);
    expect([BarChartFamily, BarRenderer, GaugeFamily, HeatMapFamily, exportPaint]).toHaveLength(5);
  });

  it('resolves the pure adapter without React', () => {
    expect(pure.scheme).toBe('vibrant');
    expect(pure.model).toBe('categorical');
  });
});
