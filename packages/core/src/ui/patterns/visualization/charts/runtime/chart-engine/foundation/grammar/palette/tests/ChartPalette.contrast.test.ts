import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import type { ChartPersonalityTokens } from '@/foundation/contracts';
import {
  bithireBrandTheme,
  themanagementmiamiBrandTheme,
} from '@/foundation/tokens/ts/presentation/brand-themes';
import {
  CHART_CATEGORICAL_SIZE,
  resolveChartSeriesVariables,
} from '..';

const PATTERNS_CSS = readFileSync(
  join(__dirname, '../../../../../../../../../../foundation/tokens/css/presentation/components/patterns.css'),
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

function relativeLuminance(hex: string): number {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)
    ?.map((channel) => Number.parseInt(channel, 16) / 255);

  if (!channels || channels.length !== 3) {
    throw new Error(`Expected a six-digit hex color, received: ${hex}`);
  }

  const [red, green, blue] = channels.map((channel) => (
    channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4
  ));

  return (0.2126 * red) + (0.7152 * green) + (0.0722 * blue);
}

function contrastRatio(foreground: string, background: string): number {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

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

describe('Chart grammar foundation palette non-text contrast', () => {
  it('preserves personality selection and tenant/DB category precedence', () => {
    expect(bithireBrandTheme.charts?.colorScheme).toBe('monochrome');
    expect(themanagementmiamiBrandTheme.charts?.colorScheme).toBe('default');

    for (const scheme of SCHEMES) {
      const colors = readModeColors(scheme);
      const variables = resolveChartSeriesVariables(scheme);

      for (let index = 1; index <= CHART_CATEGORICAL_SIZE; index += 1) {
        expect(variables[`--ds-chart-series-${index}`]).toBe(
          `var(--ds-chart-category-${index}, var(--ds-chart-${scheme}-${index}, ${colors.light[index - 1]}))`,
        );
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
