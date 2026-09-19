import { describe, expect, it } from 'vitest';

import type { ChartPersonalityTokens } from '@/foundation/contracts';
import {
  CHART_CATEGORICAL_SIZE,
  resolveChartSeriesPaint,
} from '..';

const SCHEMES = ['accessible', 'default', 'monochrome', 'pastel', 'vibrant'] as const satisfies readonly NonNullable<ChartPersonalityTokens['colorScheme']>[];

/**
 * Audited light literals embedded as the stylesheet-free terminal tier. Slots
 * 1-10 are the exact values the pre-seam runtime produced when no tenant token
 * and no scheme channel were present, so equality here is the standalone
 * byte-identity pin for the consumption-expression migration -- and now also
 * the pin proving the twelve-slot extension changed none of them. Slots 11 and
 * 12 are the derived extension; their governed provenance is asserted in
 * ChartPalette.contrast, which measures them against the ten.
 */
const LIGHT_LITERALS: Record<typeof SCHEMES[number], readonly string[]> = {
  accessible: [
    '#2f6b9a', '#a23b72', '#1f7a55', '#9a5700', '#355cb5', '#7a4595',
    '#5f6368', '#006d77', '#9b4a5a', '#4d6a00', '#a53426', '#6d5a24',
  ],
  default: [
    '#0f766e', '#8c6d46', '#b24d3a', '#296f68', '#735838', '#963f31',
    '#3d756f', '#7d6140', '#a04435', '#5e5a52', '#366916', '#716901',
  ],
  monochrome: [
    '#2c5587', '#3a6fb0', '#21528b', '#4b78ad', '#315f97', '#103968',
    '#526f91', '#37699f', '#274b77', '#5a789a', '#123b5b', '#355c81',
  ],
  pastel: [
    '#527aa3', '#9b557a', '#3d8065', '#9a652b', '#5c6fb0', '#80628f',
    '#686868', '#3b777c', '#95606a', '#62752e', '#a64e41', '#857449',
  ],
  vibrant: [
    '#006b63', '#a12b68', '#007a4d', '#a65000', '#244fc0', '#702a91',
    '#4e545b', '#00727b', '#a3364f', '#486900', '#006db3', '#614805',
  ],
};

/**
 * Minimal spec-faithful var() chain evaluator: a reference resolves to the
 * nearest defined custom property, else to its fallback expression. Enough to
 * prove chain ORDER without a browser.
 */
function resolveExpression(expression: string, tokens: Readonly<Record<string, string>>): string {
  const trimmed = expression.trim();
  if (!trimmed.startsWith('var(')) return trimmed;

  const body = trimmed.slice(4, -1);
  let depth = 0;
  let splitAt = -1;
  for (let index = 0; index < body.length; index += 1) {
    const char = body[index];
    if (char === '(') depth += 1;
    else if (char === ')') depth -= 1;
    else if (char === ',' && depth === 0) {
      splitAt = index;
      break;
    }
  }
  const name = (splitAt === -1 ? body : body.slice(0, splitAt)).trim();
  const fallback = splitAt === -1 ? undefined : body.slice(splitAt + 1);

  const defined = tokens[name];
  if (defined !== undefined) return resolveExpression(defined, tokens);
  if (fallback !== undefined) return resolveExpression(fallback, tokens);
  return '';
}

describe('resolveChartSeriesPaint chain resolution', () => {
  it('is byte-identical to the audited light literals when no token is defined', () => {
    for (const scheme of SCHEMES) {
      const paint = resolveChartSeriesPaint(scheme);
      expect(paint).toHaveLength(CHART_CATEGORICAL_SIZE);
      paint.forEach((expression, index) => {
        expect(resolveExpression(expression, {})).toBe(LIGHT_LITERALS[scheme][index]);
      });
    }
  });

  it('resolves the mode-aware scheme channel above the literal', () => {
    const paint = resolveChartSeriesPaint('accessible');
    expect(resolveExpression(paint[0] as string, {
      '--ds-chart-accessible-1': '#7db7e8',
    })).toBe('#7db7e8');
  });

  it('resolves the generated tenant series palette above the scheme channel', () => {
    const paint = resolveChartSeriesPaint('default');
    expect(resolveExpression(paint[2] as string, {
      '--ds-chart-default-3': '#b24d3a',
      '--ds-chart-series-3': '#123456',
    })).toBe('#123456');
  });

  it('resolves the authored tenant category channel above everything', () => {
    const paint = resolveChartSeriesPaint('vibrant');
    expect(resolveExpression(paint[9] as string, {
      '--ds-chart-vibrant-10': '#486900',
      '--ds-chart-series-10': '#123456',
      '--ds-chart-category-10': '#654321',
    })).toBe('#654321');
  });

  it('only ever consumes the reserved series channel, never defines it', () => {
    for (const scheme of SCHEMES) {
      for (const expression of resolveChartSeriesPaint(scheme)) {
        for (const match of expression.matchAll(/--ds-chart-series-\d+/g)) {
          const before = expression.slice(Math.max(0, (match.index ?? 0) - 4), match.index);
          expect(before).toBe('var(');
        }
      }
    }
  });


  it('carries twelve slots, and the first ten are the byte-identical pre-extension values', () => {
    const PRE_EXTENSION_SIZE = 10;
    expect(CHART_CATEGORICAL_SIZE).toBe(12);
    for (const scheme of SCHEMES) {
      const paint = resolveChartSeriesPaint(scheme);
      expect(paint).toHaveLength(12);
      for (let index = 0; index < PRE_EXTENSION_SIZE; index += 1) {
        expect(paint[index]).toBe(
          `var(--ds-chart-category-${index + 1}, var(--ds-chart-series-${index + 1}, var(--ds-chart-${scheme}-${index + 1}, ${LIGHT_LITERALS[scheme][index]})))`,
        );
      }
    }
  });

  it('gives slots 11 and 12 the same four-tier chain as slots 1-10', () => {
    for (const scheme of SCHEMES) {
      const paint = resolveChartSeriesPaint(scheme);
      for (const slot of [11, 12]) {
        expect(paint[slot - 1]).toBe(
          `var(--ds-chart-category-${slot}, var(--ds-chart-series-${slot}, var(--ds-chart-${scheme}-${slot}, ${LIGHT_LITERALS[scheme][slot - 1]})))`,
        );
        expect(
          resolveExpression(paint[slot - 1] as string, { [`--ds-chart-${scheme}-${slot}`]: '#abcdef' }),
        ).toBe('#abcdef');
        expect(
          resolveExpression(paint[slot - 1] as string, { [`--ds-chart-series-${slot}`]: '#123456' }),
        ).toBe('#123456');
        expect(
          resolveExpression(paint[slot - 1] as string, { [`--ds-chart-category-${slot}`]: '#654321' }),
        ).toBe('#654321');
      }
    }
  });

  it('never repeats slot 1 or slot 2 at the boundary indices 9, 10, 11 and 12', () => {
    for (const scheme of SCHEMES) {
      const paint = resolveChartSeriesPaint(scheme);
      for (const slot of [9, 10, 11, 12]) {
        expect(paint[slot - 1]).not.toBe(paint[0]);
        expect(paint[slot - 1]).not.toBe(paint[1]);
      }
      expect(new Set(paint).size).toBe(CHART_CATEGORICAL_SIZE);
    }
  });

  it('falls back to the default scheme for an unknown scheme value', () => {
    expect(resolveChartSeriesPaint(undefined)).toEqual(resolveChartSeriesPaint('default'));
  });
});
