import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import React from 'react';
import { describe, expect, it } from 'vitest';

import { ScatterChart } from '..';
import type { ChartColorScheme } from '../../../contracts';
import { CHART_FAMILY_REGISTRY } from '../../../foundation/registry';
import { resolveChartSeriesPaint } from '../../../runtime/chart-engine/foundation/grammar/palette';
import {
  CHART_CATEGORICAL_SIZE,
  materializeChartPaint,
  resolveChartPaint,
} from '../../../runtime/theming/composition/foundation/paint';
import { renderSurface } from '../../../../../../surfaces/foundation/common/test-utils';

const SCHEMES = ['accessible', 'default', 'monochrome', 'pastel', 'vibrant'] as const;

/** One past the vocabulary, so the wrap is observed rather than assumed. */
const POINTS = Array.from({ length: CHART_CATEGORICAL_SIZE + 1 }, (_, index) => ({
  x: index + 1,
  y: (index + 1) * 2,
  label: `Point ${index + 1}`,
}));

/**
 * Scatter is the one categorical family whose marks carry NO inline paint: the
 * skin routes `data-part`/`data-series-index` to `--ds-chart-mark-color`, which
 * reads the `--ds-chart-paint-N` bridge declared inside the stamped scope's
 * block. So the mark's paint is the pair (stamped scope, slot index), and both
 * halves are read here rather than a `fill` attribute.
 */
const SKIN_CSS = readFileSync(
  join(
    __dirname,
    '../../../../../../../foundation/tokens/css/presentation/components/skin/chart-foundation/index.css',
  ),
  'utf8',
);

/** `--ds-chart-paint-N` as the skin declares it inside one scheme's block. */
function bridgeSlotsOf(scheme: string): Record<number, string> {
  const block = new RegExp(`\\[data-chart-color-scheme='${scheme}'\\]\\s*\\{([^}]*)\\}`, 'u')
    .exec(SKIN_CSS);
  const slots: Record<number, string> = {};
  for (const declaration of (block?.[1] ?? '').matchAll(/--ds-chart-paint-(\d+):\s*([^;]+);/gu)) {
    slots[Number(declaration[1])] = declaration[2]!.trim();
  }
  return slots;
}

function scopeOf(container: HTMLElement): string | null {
  return container.querySelector('[data-chart-color-scheme]')
    ?.getAttribute('data-chart-color-scheme') ?? null;
}

function slotIndexesOf(container: HTMLElement): (number | null)[] {
  return [...container.querySelectorAll('[data-part="scatter-point-mark"]')].map((mark) => {
    const index = mark.getAttribute('data-series-index');
    return index === null ? null : Number(index);
  });
}

/** The expression each mark resolves: its slot inside the stamped scope's block. */
function paintsOf(container: HTMLElement): (string | undefined)[] {
  const slots = bridgeSlotsOf(scopeOf(container) ?? '');
  return slotIndexesOf(container).map((index) => (index === null ? undefined : slots[index + 1]));
}

function renderWithScheme(colorScheme?: ChartColorScheme, extra: Record<string, unknown> = {}) {
  return renderSurface(
    <ScatterChart
      data={POINTS}
      width={520}
      height={400}
      responsive={false}
      animate={false}
      {...(colorScheme === undefined ? {} : { colorScheme })}
      {...extra}
    />,
  );
}

describe('ScatterChart governed colorScheme input', () => {
  it('selects each scheme own twelve-slot table', () => {
    for (const scheme of SCHEMES) {
      const palette = resolveChartSeriesPaint(scheme);
      const { container, unmount } = renderWithScheme(scheme);

      expect(paintsOf(container), scheme).toEqual(
        POINTS.map((_, index) => palette[index % CHART_CATEGORICAL_SIZE]),
      );
      unmount();
    }
  });

  // Distinct tables are what make the input observable at all: a scheme that
  // resolved to the same expressions as another would be an inert prop.
  it('gives the five schemes five distinct slot-1 expressions', () => {
    const slotOne = SCHEMES.map((scheme) => {
      const { container, unmount } = renderWithScheme(scheme);
      const paint = paintsOf(container)[0];
      unmount();
      return paint;
    });

    expect(new Set(slotOne).size).toBe(SCHEMES.length);
  });

  it('reaches boundary slots 9, 10, 11 and 12, then wraps on the thirteenth', () => {
    const palette = resolveChartSeriesPaint('vibrant');
    const { container } = renderWithScheme('vibrant');
    const paints = paintsOf(container);

    for (const slot of [9, 10, 11, 12]) {
      expect(paints[slot - 1], `slot ${slot}`).toBe(palette[slot - 1]);
    }
    expect(new Set(paints.slice(0, CHART_CATEGORICAL_SIZE)).size).toBe(CHART_CATEGORICAL_SIZE);
    expect(slotIndexesOf(container)[CHART_CATEGORICAL_SIZE]).toBe(0);
    expect(paints[CHART_CATEGORICAL_SIZE]).toBe(paints[0]);
  });

  it('stamps the resolved scheme on the renderer root so the skin bridge agrees', () => {
    const { container } = renderWithScheme('monochrome');

    expect(scopeOf(container)).toBe('monochrome');
  });

  /**
   * An out-of-domain scheme is refused at the type level (ChartPaint.contract
   * R-2); this pins what a JS caller would still reach. MEASURED DIVERGENCE
   * from the inline-painted families: the resolver stamps the requested name
   * verbatim rather than coercing it, so its slot CHAIN is the default table
   * exactly as funnel/gantt read it, but the skin declares no bridge block for
   * that scope and a bridge-painted mark therefore falls back to the skin's own
   * per-slot literal instead. That pass-through lives in the shared resolver,
   * not in this family.
   */
  it('keeps the default slot chain but reaches no bridge block outside the domain', () => {
    const palette = resolveChartSeriesPaint('default');
    const decision = resolveChartPaint({
      family: 'scatter',
      scheme: 'rainbow' as ChartColorScheme,
    });
    const { container } = renderWithScheme('rainbow' as ChartColorScheme);

    expect(decision.categorical?.paintFor(0)).toBe(palette[0]);
    expect(scopeOf(container)).toBe('rainbow');
    expect(bridgeSlotsOf('rainbow')).toEqual({});
    expect(slotIndexesOf(container)).toEqual(
      POINTS.map((_, index) => index % CHART_CATEGORICAL_SIZE),
    );
  });

  it('materializes twelve slots in either mode', () => {
    const owner = document.createElement('div');
    document.body.appendChild(owner);
    try {
      const decision = resolveChartPaint({ family: 'scatter', scheme: 'accessible' });

      expect(materializeChartPaint(decision, owner).resolved).toHaveLength(CHART_CATEGORICAL_SIZE);

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
      }
    } finally {
      owner.remove();
    }
  });
});

/**
 * The measured divergence from the funnel/gantt mirror. Scatter is the one
 * categorical family whose registry row declares `honoursColorsProp: false`
 * (its own header records the drop as deliberate), so `colors` is not a
 * precedence tier here and the family deliberately does not pass it to the
 * resolver. The remaining chain is scheme > token > default.
 */
describe('ScatterChart colors/colorScheme precedence', () => {
  const OVERRIDE = ['#111111', '#222222', '#333333'];

  it('keeps the registry row that refuses the override', () => {
    expect(CHART_FAMILY_REGISTRY.scatter.honoursColorsProp).toBe(false);
  });

  it('leaves the decision unoverridden even when colors is supplied', () => {
    expect(
      resolveChartPaint({ family: 'scatter', scheme: 'monochrome', override: OVERRIDE })
        .overridden,
    ).toBe(false);
  });

  it('lets colorScheme decide while colors is present', () => {
    const { container } = renderWithScheme('pastel', { colors: [...OVERRIDE] });

    expect(scopeOf(container)).toBe('pastel');
    expect(paintsOf(container)[0]).toBe(resolveChartSeriesPaint('pastel')[0]);
  });

  // Per-point `color` was dropped by the same W5 migration, so no datum tier
  // can pre-empt the scheme either.
  it('lets colorScheme decide while a per-point colour is present', () => {
    const data = POINTS.map((point, index) => (
      index === 1 ? { ...point, color: '#abcdef' } : point
    ));
    const { container } = renderWithScheme('vibrant', { data });
    const paints = paintsOf(container);

    expect(paints[1]).toBe(resolveChartSeriesPaint('vibrant')[1]);
    expect(paints).not.toContain('#abcdef');
  });
});

/* ---- type-level refusals for the new governed input ------------------ */

/* An out-of-domain scheme name is refused at the boundary, so the runtime
 * fallback above is unreachable from TypeScript. */
// @ts-expect-error scheme outside the governed domain
const refusedScheme = <ScatterChart data={POINTS} colorScheme="rainbow" />;

/* The input is the governed union, not an open string. */
// @ts-expect-error an arbitrary string is not a governed scheme
const refusedWidening = <ScatterChart data={POINTS} colorScheme={'default' as string} />;

void refusedScheme;
void refusedWidening;
