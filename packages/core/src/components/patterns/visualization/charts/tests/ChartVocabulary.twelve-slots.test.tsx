import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { FunnelChart, PieChart } from '..';
import { resolveChartSeriesPaint } from '../runtime/chart-engine/foundation/grammar/palette';
import {
  CHART_CATEGORICAL_SIZE,
  materializeChartPaint,
  resolveChartPaint,
} from '../runtime/theming/composition/foundation/paint';
import { renderSurface } from '../../../../surfaces/foundation/common/test-utils';

const SCHEMES = ['accessible', 'default', 'monochrome', 'pastel', 'vibrant'] as const;

/** One past the vocabulary, so the wrap is observed rather than assumed. */
const SERIES_COUNT = CHART_CATEGORICAL_SIZE + 1;

const DATA = Array.from({ length: SERIES_COUNT }, (_, index) => ({
  label: `Category ${index + 1}`,
  value: 120 - index * 6,
}));

const SKIN_CSS = readFileSync(
  join(
    __dirname,
    '../../../../../foundation/tokens/css/presentation/components/skin/chart-foundation/index.css',
  ),
  'utf8',
);

describe('the twelve-slot categorical vocabulary reaches every output path', () => {
  it('paints inline-fill marks from slots 1..12 and wraps only after the twelfth', () => {
    const palette = resolveChartSeriesPaint('default');
    const { container } = renderSurface(
      <FunnelChart data={DATA} width={480} height={460} responsive={false} animate={false} />,
    );

    const fills = [...container.querySelectorAll('[data-part="segment"]')]
      .map((mark) => mark.getAttribute('fill'));

    expect(fills).toHaveLength(SERIES_COUNT);
    expect(fills).toEqual(DATA.map((_, index) => palette[index % CHART_CATEGORICAL_SIZE]));
    expect(new Set(fills.slice(0, CHART_CATEGORICAL_SIZE)).size).toBe(CHART_CATEGORICAL_SIZE);
    expect(fills[10]).toBe(palette[10]);
    expect(fills[11]).toBe(palette[11]);
    expect(fills[12]).toBe(fills[0]);
  });

  it('stamps slots 11 and 12 on class-painted marks, and the skin bridges them', () => {
    const { container } = renderSurface(
      <PieChart data={DATA} width={420} height={420} responsive={false} animate={false} />,
    );

    const marks = [...container.querySelectorAll('[data-part="pie-slice-mark"]')]
      .map((mark) => mark.getAttribute('data-series-index'));

    expect(marks).toEqual(DATA.map((_, index) => String(index % CHART_CATEGORICAL_SIZE)));
    expect(marks).toContain('10');
    expect(marks).toContain('11');

    // A stamped slot with no bridge declaration paints nothing at all.
    for (const scheme of SCHEMES) {
      for (const slot of [11, 12]) {
        expect(SKIN_CSS, `${scheme} slot ${slot}`).toContain(
          `--ds-chart-paint-${slot}: var(--ds-chart-category-${slot}, var(--ds-chart-series-${slot}, var(--ds-chart-${scheme}-${slot},`,
        );
      }
    }

    // ...and a bridged channel nothing binds paints nothing either: the skin
    // must route the stamped index to the bridge for every slot, not just ten.
    for (const [index, part] of [
      [10, 'pie-slice-mark'],
      [11, 'pie-slice-mark'],
      [10, 'scatter-point-mark'],
      [11, 'scatter-point-mark'],
    ] as const) {
      expect(SKIN_CSS, `${part} slot ${index + 1}`)
        .toContain(`[data-part='${part}'][data-series-index='${index}']`);
    }
  });

  it('keeps a legend entry, and its non-colour label, for every series including the wrap', () => {
    const { container } = renderSurface(
      <PieChart data={DATA} width={420} height={420} responsive={false} animate={false} />,
    );

    const items = [...container.querySelectorAll('[data-part="legend-item"]')];
    expect(items).toHaveLength(SERIES_COUNT);

    items.forEach((item, index) => {
      expect(item.querySelector('[data-part="legend-swatch"]')?.getAttribute('data-series-index'))
        .toBe(String(index % CHART_CATEGORICAL_SIZE));
      expect(item.querySelector('[data-part="legend-label"]')?.textContent)
        .toBe(`Category ${index + 1}`);
    });
  });

  it('materializes twelve slots for the export path, in either mode', () => {
    const owner = document.createElement('div');
    document.body.appendChild(owner);
    try {
      const decision = resolveChartPaint({ family: 'pie-chart', scheme: 'accessible' });

      // No stylesheet at all: the audited light literals are the terminal tier.
      expect(materializeChartPaint(decision, owner).resolved).toHaveLength(CHART_CATEGORICAL_SIZE);

      // The mode-aware channel is what a dark root redefines, and slots 11 and
      // 12 read it exactly as slots 1-10 do.
      for (const [mode, eleven, twelve] of [
        ['light', '#a53426', '#6d5a24'],
        ['dark', '#ff8872', '#c0a76f'],
      ] as const) {
        owner.style.setProperty('--ds-chart-accessible-11', eleven);
        owner.style.setProperty('--ds-chart-accessible-12', twelve);
        const resolved = materializeChartPaint(decision, owner).resolved;
        expect(resolved, mode).toHaveLength(CHART_CATEGORICAL_SIZE);
        expect(resolved[10], mode).toBe(eleven);
        expect(resolved[11], mode).toBe(twelve);
        expect(resolved[10], mode).not.toBe(resolved[0]);
        expect(resolved[11], mode).not.toBe(resolved[1]);
      }
    } finally {
      owner.remove();
    }
  });
});
