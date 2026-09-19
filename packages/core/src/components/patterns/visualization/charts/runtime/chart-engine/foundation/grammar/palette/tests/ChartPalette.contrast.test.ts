import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { contrastRatio } from '@/foundation/kernel/color/contrast';
import { hexToOklab } from '@/foundation/kernel/color/oklch';

import type { ChartPersonalityTokens } from '@/foundation/contracts';
import { themanagementmiamiFlatTheme } from '@tests/fixtures/brand-themes/themanagementmiami';
import {
  CHART_CATEGORICAL_SIZE,
  resolveChartSeriesPaint,
} from '..';

const PATTERNS_CSS = readFileSync(
  join(__dirname, '../../../../../../../../../../foundation/tokens/css/presentation/components/patterns/index.css'),
  'utf8',
);

const SCHEMES = ['accessible', 'default', 'monochrome', 'pastel', 'vibrant'] as const satisfies readonly NonNullable<ChartPersonalityTokens['colorScheme']>[];

const REPRESENTATIVE_SURFACES = Object.freeze({
  light: Object.freeze({
    'bithire/card': '#ffffff',
    'bithire/plot': '#f7fafd',
    'themanagementmiami/card': '#fffefb',
    'themanagementmiami/plot': '#f8f1e5',
  }),
  dark: Object.freeze({
    'bithire/card': '#151d2b',
    'bithire/plot': '#111925',
    'themanagementmiami/card': '#1b1814',
    'themanagementmiami/plot': '#211d18',
  }),
});


function readModeColors(scheme: typeof SCHEMES[number]): { light: string[]; dark: string[] } {
  const light: string[] = [];
  const dark: string[] = [];

  for (let index = 1; index <= CHART_CATEGORICAL_SIZE; index += 1) {
    const declaration = new RegExp(
      `--ds-chart-${scheme}-${index}:\\s*(#[0-9a-f]{6})`,
      'gi',
    );
    const matches = [...PATTERNS_CSS.matchAll(declaration)];

    expect(matches, `${scheme}-${index} must have exactly one light and one dark declaration`).toHaveLength(2);
    light.push(matches[0]![1]!.toLowerCase());
    dark.push(matches[1]![1]!.toLowerCase());
  }

  return { light, dark };
}

/** The pre-extension vocabulary. Slots above it are the derived extension. */
const PRE_EXTENSION_SIZE = 10;

const distance = (a: string, b: string): number => {
  const first = hexToOklab(a);
  const second = hexToOklab(b);
  return Math.hypot(first.l - second.l, first.a - second.a, first.b - second.b);
};

/** The tightest separation the scheme's own audited ten already accept. */
function baselineSeparation(colors: readonly string[]): number {
  const audited = colors.slice(0, PRE_EXTENSION_SIZE);
  return Math.min(
    ...audited.flatMap((color, index) =>
      audited.filter((_, other) => other !== index).map((peer) => distance(color, peer)),
    ),
  );
}

describe('Chart grammar foundation palette non-text contrast', () => {
  it('preserves personality selection and tenant/DB category precedence', () => {
    // D6-2c-ii (2026-09-15): tenant-document compiles over neutral + preset, and
    // no preset decides a chart scheme, so the bithire leg of this selection has
    // no subject left (measured: `charts` is `{}`). The selection half is carried
    // by the customer fixture below, which still authors one; the vertical's lost
    // one-blue decision is pinned in `charts/tests/bithire-chart-palette`.
    expect(themanagementmiamiFlatTheme.charts?.colorScheme).toBe('default');

    for (const scheme of SCHEMES) {
      const colors = readModeColors(scheme);
      const paint = resolveChartSeriesPaint(scheme);

      expect(paint).toHaveLength(CHART_CATEGORICAL_SIZE);
      for (let index = 1; index <= CHART_CATEGORICAL_SIZE; index += 1) {
        expect(paint[index - 1]).toBe(
          `var(--ds-chart-category-${index}, var(--ds-chart-series-${index}, var(--ds-chart-${scheme}-${index}, ${colors.light[index - 1]})))`,
        );
      }
    }
  });

  it('derives slots 11 and 12 rather than repeating an existing slot', () => {
    for (const scheme of SCHEMES) {
      const colors = readModeColors(scheme);

      for (const mode of ['light', 'dark'] as const) {
        const palette = colors[mode];
        expect(new Set(palette).size, `${scheme}/${mode} must declare twelve distinct values`)
          .toBe(CHART_CATEGORICAL_SIZE);

        // A derived slot is at least as separable as the tightest pair the
        // audited ten already ship, so neither one is slot 1 or slot 2 warmed
        // over. The floor is the scheme's own, because `monochrome` is a
        // single-hue ladder and `accessible` is a wheel.
        const floor = baselineSeparation(palette);
        for (let slot = PRE_EXTENSION_SIZE + 1; slot <= CHART_CATEGORICAL_SIZE; slot += 1) {
          const derived = palette[slot - 1]!;
          const nearest = Math.min(
            ...palette.filter((_, index) => index !== slot - 1).map((peer) => distance(derived, peer)),
          );
          expect(
            nearest,
            `${scheme}/${mode} slot ${slot} (${derived}) must separate at least as well as the audited ten (${floor.toFixed(4)})`,
          ).toBeGreaterThanOrEqual(floor);
        }
      }
    }
  });

  it('keeps every bounded scheme at or above WCAG 3:1 on Bithire/TMM light and dark surfaces', () => {
    for (const scheme of SCHEMES) {
      const colors = readModeColors(scheme);

      for (const mode of ['light', 'dark'] as const) {
        for (const color of colors[mode]) {
          for (const [surfaceName, surface] of Object.entries(REPRESENTATIVE_SURFACES[mode])) {
            expect(
              contrastRatio(color, surface),
              `${scheme}/${mode} ${color} must clear 3:1 against ${surfaceName} ${surface}`,
            ).toBeGreaterThanOrEqual(3);
          }
        }
      }
    }
  });
});
