import React from 'react';
import { describe, expect, it } from 'vitest';

import { HeatMap } from '..';
import { resolveChartPaint } from '../../../runtime/theming/composition/foundation/paint';
import { renderSurface } from '../../../../../../surfaces/foundation/common/test-utils';

const DATA = Array.from({ length: 12 }, (_, index) => ({
  x: `C${index % 4}`,
  y: `R${Math.floor(index / 4)}`,
  value: index * 3 + 1,
}));

const DECISION = resolveChartPaint({ family: 'heat-map' });

function renderHeatMap(colorRange?: [string, string]) {
  return renderSurface(
    <HeatMap
      data={DATA}
      width={480}
      height={320}
      responsive={false}
      animate={false}
      legend
      {...(colorRange === undefined ? {} : { colorRange })}
    />,
  );
}

function rampOf(container: HTMLElement): { low: string; high: string } {
  const legend = container.querySelector('[data-part="legend"]') as HTMLElement | null;
  if (!legend) throw new Error('heat-map legend not rendered');
  return {
    low: legend.style.getPropertyValue('--_ds-heatmap-ramp-low').trim(),
    high: legend.style.getPropertyValue('--_ds-heatmap-ramp-high').trim(),
  };
}

function cellColors(container: HTMLElement): string[] {
  return [...container.querySelectorAll('[data-part="cell"]')].map((cell) =>
    (cell as SVGRectElement).style.getPropertyValue('--ds-chart-cell-color').trim(),
  );
}

describe('HeatMap sequential paint', () => {
  it('resolves the sequential model and stamps it on the renderer root', () => {
    const { container } = renderHeatMap();
    const root = container.querySelector('[data-part="chart-renderer"]');

    expect(DECISION.model).toBe('sequential');
    expect(DECISION.categorical).toBeNull();
    expect(root?.getAttribute('data-chart-paint-model')).toBe('sequential');
    // The family declares no `colorScheme` prop, so its scope is the token tier.
    expect(root?.getAttribute('data-chart-color-scheme')).toBe(DECISION.scheme);
  });

  it('interpolates continuously rather than quantizing, as the decision declares', () => {
    const { container } = renderHeatMap();
    const colors = cellColors(container);

    expect(Number.isFinite(DECISION.sequential?.steps)).toBe(false);
    expect(colors).toHaveLength(DATA.length);
    expect(new Set(colors).size).toBe(DATA.length);
  });

  it('bridges the ramp low stop the decision declares', () => {
    expect(rampOf(renderHeatMap().container).low).toBe(DECISION.sequential?.stops[0]);
  });

  // WALL (WO-FAM-09 lot 3 / debrief Q1 class). The high stop is
  // `--ds-color-primary-500`, which is NOT the governed
  // `category > series > scheme-channel > literal` chain the decision resolves,
  // so no tenant palette and no authored scheme reaches this ramp, and a
  // stylesheet-free render falls to an ungoverned literal that belongs to no
  // scheme table. Moving it is a DECLARED repaint of every HeatMap call site
  // (lot 2's class, which covered the categorical families only), not a
  // mechanical adoption. This row is pinned so the move cannot happen silently.
  it('holds its out-of-chain high stop, which the decision does not supply', () => {
    const { high } = rampOf(renderHeatMap().container);

    expect(high).toBe('var(--ds-color-primary-500)');
    expect(high).not.toBe(DECISION.sequential?.stops[1]);
    expect(DECISION.sequential?.stops[1]).toContain('var(--ds-chart-category-1,');
  });

  it('lets a caller range win over the family ramp', () => {
    const { container } = renderHeatMap(['var(--test-low)', 'var(--test-high)']);

    expect(rampOf(container)).toEqual({ low: 'var(--test-low)', high: 'var(--test-high)' });
  });
});
