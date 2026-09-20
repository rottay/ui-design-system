import React from 'react';
import { describe, expect, it } from 'vitest';

import { CalendarHeatMap } from '..';
import type { ChartColorScheme } from '../../../contracts';
import { resolveChartSeriesPaint } from '../../../runtime/chart-engine/foundation/grammar/palette';
import { resolveChartPaint } from '../../../runtime/theming/composition/foundation/paint';
import { renderSurface } from '../../../../../../surfaces/foundation/common/test-utils';

/** Every scheme whose ramp the family and the decision must agree on. */
const AUTHORED_SCHEMES: ChartColorScheme[] = ['accessible', 'monochrome', 'pastel', 'vibrant'];

const DATA = Array.from({ length: 20 }, (_, index) => ({
  date: `2026-01-${String(index + 1).padStart(2, '0')}`,
  value: index + 1,
}));

interface CalendarOverrides {
  readonly colorScheme?: ChartColorScheme;
  readonly colorSteps?: number;
}

function renderCalendar({ colorScheme, colorSteps }: CalendarOverrides = {}) {
  return renderSurface(
    <CalendarHeatMap
      data={DATA}
      startDate="2026-01-01"
      endDate="2026-02-01"
      width={720}
      height={180}
      responsive={false}
      animate={false}
      legend
      {...(colorScheme === undefined ? {} : { colorScheme })}
      {...(colorSteps === undefined ? {} : { colorSteps })}
    />,
  );
}

function rampOf(container: HTMLElement): { low: string; high: string } {
  const legend = container.querySelector('[data-part="legend"]') as HTMLElement | null;
  if (!legend) throw new Error('calendar-heat-map legend not rendered');
  return {
    low: legend.style.getPropertyValue('--_ds-calendar-heatmap-ramp-low').trim(),
    high: legend.style.getPropertyValue('--_ds-calendar-heatmap-ramp-high').trim(),
  };
}

function filledFills(container: HTMLElement): string[] {
  return [...container.querySelectorAll('[data-part="cell"][data-state="filled"]')].map(
    (cell) => cell.getAttribute('fill') ?? '',
  );
}

describe('CalendarHeatMap sequential paint', () => {
  it('resolves the sequential model and stamps the scheme it resolved', () => {
    for (const scheme of AUTHORED_SCHEMES) {
      const { container } = renderCalendar({ colorScheme: scheme });
      const root = container.querySelector('[data-part="chart-renderer"]');

      expect(root?.getAttribute('data-chart-paint-model'), scheme).toBe('sequential');
      expect(root?.getAttribute('data-chart-color-scheme'), scheme).toBe(scheme);
    }
  });

  it('bridges exactly the ramp the decision resolves, for every authored scheme', () => {
    for (const scheme of AUTHORED_SCHEMES) {
      const decision = resolveChartPaint({ family: 'calendar-heat-map', scheme });
      const { container } = renderCalendar({ colorScheme: scheme });

      expect(rampOf(container), scheme).toEqual({
        low: decision.sequential?.stops[0],
        high: decision.sequential?.stops[1],
      });
    }
  });

  // The wall this test used to pin is down (WO-FAM-09 lot 3 / debrief Q1). An
  // unauthored chart stamped the scope `default` while its ramp read the
  // `accessible` table, because the personality hook aliased the two. The
  // scope and the ramp are now one answer, and it is the default table's.
  it('agrees with the decision at the unauthored default scheme too', () => {
    const decision = resolveChartPaint({ family: 'calendar-heat-map', scheme: 'default' });
    const { container } = renderCalendar();
    const { low, high } = rampOf(container);
    const root = container.querySelector('[data-part="chart-renderer"]');

    expect(root?.getAttribute('data-chart-color-scheme')).toBe('default');
    expect(low).toBe(decision.sequential?.stops[0]);
    expect(high).toBe(decision.sequential?.stops[1]);
    expect(high).toBe(resolveChartSeriesPaint('default')[0]);
    expect(high).not.toBe(resolveChartSeriesPaint('accessible')[0]);
  });

  it('quantizes into the decision step count, reserving the first step for empty days', () => {
    const decision = resolveChartPaint({ family: 'calendar-heat-map' });
    const steps = decision.sequential?.steps;
    const { container } = renderCalendar();

    expect(steps).toBe(5);
    expect(new Set(filledFills(container)).size).toBe((steps as number) - 1);
  });

  it('lets a caller step count win over the declared ramp', () => {
    const { container } = renderCalendar({ colorSteps: 4 });

    expect(new Set(filledFills(container)).size).toBe(3);
  });
});
