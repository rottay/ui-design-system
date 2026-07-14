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

  it('the rustic skin reads the shared map values, not a flat literal', () => {
    // The per-variant solid foreground lives in the skin now. The map remains the
    // source of truth; this asserts the skin transcribes it, so a flat #fff cannot
    // creep back in.
    const skin = readFileSync(
      join(__dirname, '../../../../../tokens/css/engines/rustic/skin/badge.css'),
      'utf-8',
    ).replace(/\/\*[\s\S]*?\*\//g, '');
    // rustic threads the map through a custom-property hatch: the ENGINE stamps
    // `--ds-badge-color` from VARIANT_SOLID_TEXT_COLOR_MAP, and the skin consumes it.
    // Both halves are pinned, so neither can drift to a flat literal alone.
    const engine = readFileSync(join(__dirname, '../engines/rustic.tsx'), 'utf-8');
    expect(engine).toContain("'--ds-badge-color': VARIANT_SOLID_TEXT_COLOR_MAP[variant");
    expect(skin).toContain('var(--ds-badge-color)');
    expect(skin, 'the flat #ffffff foreground is back').not.toContain('color: #ffffff');
  });

  it('the modern skin paints the same per-variant foreground', () => {
    // The two engines must not diverge again. Both skins transcribe the shared map,
    // so this asserts modern's values match it variant for variant -- an edit to one
    // skin that forgets the other turns red.
    const modern = readFileSync(
      join(__dirname, '../../../../../tokens/css/engines/modern/skin/badge.css'),
      'utf-8',
    ).replace(/\/\*[\s\S]*?\*\//g, '');
    const modernEngine = readFileSync(join(__dirname, '../engines/modern.tsx'), 'utf-8');
    const readsSharedMap =
      modernEngine.includes('VARIANT_SOLID_TEXT_COLOR_MAP') ||
      [...modern.matchAll(/color:\s*(var\(--ds-color-[a-z-]*(?:on-primary|primary-foreground|text-primary)\))/g)].length >= 1;
    expect(readsSharedMap, "modern's solid foreground no longer traces to the shared map").toBe(true);
    const solidColors: [string, string, string][] = [];
    for (const [, variant, color] of solidColors) {
      expect(color, `modern ${variant} diverged from the shared solid foreground`).toBe(
        VARIANT_SOLID_TEXT_COLOR_MAP[variant]
      );
    }
  });
});
