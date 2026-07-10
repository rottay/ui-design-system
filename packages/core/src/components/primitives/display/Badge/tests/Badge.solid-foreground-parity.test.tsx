/**
 * @fileoverview A solid badge's foreground is derived from its fill, in every
 * engine (P-55).
 *
 * The rustic engine read a flat `--ds-badge-text-color, #ffffff` for its solid
 * foreground while modern read `--ds-color-primary-foreground` and classic read
 * antd's `colorTextLightSolid`. On rottay, whose primary badge fill is white,
 * that flat near-white was a 1.18:1 label. The three engines now share one
 * per-variant on-primary map, so a tenant with a light fill gets a legible label
 * in all three.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { VARIANT_SOLID_TEXT_COLOR_MAP } from '../Badge.types';

describe('the solid-badge foreground is background-aware, and shared', () => {
  it('names an on-primary foreground for every solid variant', () => {
    // A flat #fff here is the defect. Each brand-coloured fill reads an
    // on-primary token; `default` is a neutral surface, so it reads primary text.
    for (const variant of ['primary', 'secondary', 'success', 'warning', 'error', 'info'] as const) {
      expect(VARIANT_SOLID_TEXT_COLOR_MAP[variant]).toMatch(/on-primary|primary-foreground/);
    }
    expect(VARIANT_SOLID_TEXT_COLOR_MAP.default).toBe('var(--ds-color-text-primary)');
  });

  it('the rustic engine reads the shared map, not a flat literal', () => {
    const rustic = readFileSync(join(__dirname, '../engines/rustic.tsx'), 'utf-8');
    expect(rustic).toContain('VARIANT_SOLID_TEXT_COLOR_MAP[variant');
    expect(rustic, 'the flat #ffffff foreground is back').not.toContain(
      "'var(--ds-badge-text-color, #ffffff)'"
    );
  });

  it('the modern engine paints the same per-variant foreground', () => {
    // The two engines must not diverge again. Modern keeps its own table for
    // now; this asserts the values match the shared map value for value, so a
    // future edit to one that forgets the other turns red.
    const modern = readFileSync(join(__dirname, '../engines/modern.tsx'), 'utf-8');
    const solidColors = [...modern.matchAll(/(default|primary|secondary|success|warning|error|info):\s*\{[^}]*?solidColor:\s*'([^']+)'/g)];
    expect(solidColors.length).toBeGreaterThanOrEqual(7);
    for (const [, variant, color] of solidColors) {
      expect(color, `modern ${variant} diverged from the shared solid foreground`).toBe(
        VARIANT_SOLID_TEXT_COLOR_MAP[variant]
      );
    }
  });
});
