import React from 'react';
import {
  useChartPaint, useChartPaintDecision, ChartPaintProvider, resolveChartPaint,
  materializeChartPaint,
  type ChartPaintDecision, type ChartCategoricalPaint,
} from './contract';

/* (1) A categorical family: resolves once, publishes, never indexes by hand. */
export function BarChartFamily({ scheme, series }: {
  scheme?: 'default' | 'monochrome'; series: readonly { name: string }[];
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
        <rect
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
export function GaugeFamily() {
  const decision = useChartPaint({ family: 'gauge' });
  const arcs = decision.categorical === null ? ['error', 'warning', 'success'] : [];
  return <div {...decision.rootAttributes}>{arcs.length}</div>;
}

/* (4) A sequential family. */
export function HeatMapFamily({ t }: { t: number }) {
  const decision = useChartPaint({ family: 'heat-map' });
  return <div>{decision.sequential ? decision.sequential.stopFor(t) : 'n/a'}</div>;
}

/* (5) The export door: one materialization, no second getComputedStyle walk. */
export function exportPaint(d: ChartPaintDecision, owner: Element): readonly string[] {
  return materializeChartPaint(d, owner).resolved;
}

/* (6) The pure resolver is callable outside React (gates, tests, export). */
export const pure = resolveChartPaint({ family: 'pie-chart', scheme: 'vibrant', tokenScheme: 'default' });
