/**
 * @fileoverview Unit tests for the canonical density presets and resolver.
 * Proves the two-mode enum resolves the design-language §3 token-backed values.
 */

import { describe, expect, it } from 'vitest';

import {
  DENSITY_PRESETS,
  DEFAULT_DENSITY_MODE,
  normalizeDensityMode,
  resolveDensityStyleVars,
  type DensityMode,
} from '../ts/base/density';

describe('density presets (design-language §3)', () => {
  it('defaults to comfortable', () => {
    expect(DEFAULT_DENSITY_MODE).toBe('comfortable');
  });

  it('exposes exactly the two canonical modes', () => {
    expect(Object.keys(DENSITY_PRESETS).sort()).toEqual(['comfortable', 'compact']);
  });

  it('resolves the comfortable preset (0.98 / 0.875rem 1rem / 1rem / md)', () => {
    const preset = DENSITY_PRESETS.comfortable;
    expect(preset.scale).toBe(0.98);
    expect(preset.cellPadding).toContain('0.875rem 1rem');
    expect(preset.cardPadding).toContain('1rem');
    expect(preset.metricPreset).toBe('md');
    // Token-driven: each value is a var() handle, not a bare literal.
    expect(preset.cellPadding.startsWith('var(--ds-density-cell-padding-comfortable')).toBe(true);
    expect(preset.cardPadding.startsWith('var(--ds-density-card-padding-comfortable')).toBe(true);
  });

  it('resolves the compact preset (0.90 / 0.5rem 0.75rem / 0.75rem / sm)', () => {
    const preset = DENSITY_PRESETS.compact;
    expect(preset.scale).toBe(0.9);
    expect(preset.cellPadding).toContain('0.5rem 0.75rem');
    expect(preset.cardPadding).toContain('0.75rem');
    expect(preset.metricPreset).toBe('sm');
    expect(preset.cellPadding.startsWith('var(--ds-density-cell-padding-compact')).toBe(true);
    expect(preset.cardPadding.startsWith('var(--ds-density-card-padding-compact')).toBe(true);
  });

  it('emits distinct cell padding per mode', () => {
    expect(DENSITY_PRESETS.comfortable.cellPadding).not.toBe(DENSITY_PRESETS.compact.cellPadding);
  });

  it('normalizes any density-like string to a canonical mode (spacious -> comfortable)', () => {
    expect(normalizeDensityMode('compact')).toBe('compact');
    expect(normalizeDensityMode('comfortable')).toBe('comfortable');
    expect(normalizeDensityMode('spacious')).toBe('comfortable');
    expect(normalizeDensityMode('normal')).toBe('comfortable');
    expect(normalizeDensityMode(undefined)).toBe('comfortable');
    expect(normalizeDensityMode(null)).toBe('comfortable');
  });

  it('resolveDensityStyleVars carries the mode preset as CSS custom properties', () => {
    const modes: DensityMode[] = ['comfortable', 'compact'];
    for (const mode of modes) {
      const vars = resolveDensityStyleVars(mode) as unknown as Record<string, string>;
      expect(vars['--ds-density-cell-padding']).toBe(DENSITY_PRESETS[mode].cellPadding);
      expect(vars['--ds-density-card-padding']).toBe(DENSITY_PRESETS[mode].cardPadding);
      expect(vars['--ds-density-scale']).toBe(String(DENSITY_PRESETS[mode].scale));
    }
  });
});
