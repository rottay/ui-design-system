/**
 * @fileoverview Unit tests for the canonical density presets and resolver.
 * Proves the two-mode enum resolves the design-language §3 token-backed values.
 */

import { describe, expect, it } from 'vitest';

import {
  DENSITY_MODE_FACTORS,
  DENSITY_LOCAL_FACTOR_VARIABLE,
  DENSITY_PRESETS,
  DEFAULT_DENSITY_MODE,
  normalizeDensityMode,
  resolveDensityModeFactor,
  resolveDensityStyleVars,
  resolveEffectiveDensityScale,
  type DensityMode,
} from '../ts/foundation/base/density';

describe('density presets (design-language §3)', () => {
  it('defaults to comfortable', () => {
    expect(DEFAULT_DENSITY_MODE).toBe('comfortable');
  });

  it('exposes exactly the two canonical modes', () => {
    expect(Object.keys(DENSITY_PRESETS).sort()).toEqual(['comfortable', 'compact']);
  });

  it('resolves the comfortable preset (1 / 0.875rem 1rem / 1rem / md)', () => {
    const preset = DENSITY_PRESETS.comfortable;
    expect(preset.modeFactor).toBe(1);
    expect(preset.cellPadding).toContain('0.875rem');
    expect(preset.cellPadding).toContain('calc(1rem');
    expect(preset.cardPadding).toContain('1rem');
    expect(preset.metricPreset).toBe('md');
    // Token-driven: each value is a var() handle, not a bare literal.
    expect(preset.cellPadding.startsWith('var(--ds-density-cell-padding-comfortable')).toBe(true);
    expect(preset.cardPadding.startsWith('var(--ds-density-card-padding-comfortable')).toBe(true);
  });

  it('resolves the compact preset (0.85 / 0.5rem 0.75rem / 0.75rem / sm)', () => {
    const preset = DENSITY_PRESETS.compact;
    expect(preset.modeFactor).toBe(0.85);
    expect(preset.cellPadding).toContain('0.5rem');
    expect(preset.cellPadding).toContain('0.75rem');
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

  it('owns the complete semantic factor vocabulary in one table', () => {
    expect(DENSITY_MODE_FACTORS).toEqual({
      compact: 0.85,
      comfortable: 1,
      normal: 1,
      spacious: 1.15,
    });
    expect(resolveDensityModeFactor('compact')).toBe(0.85);
    expect(resolveDensityModeFactor('normal')).toBe(1);
    expect(resolveDensityModeFactor('spacious')).toBe(1.15);
    expect(resolveDensityModeFactor('invalid')).toBe(1);
    expect(resolveDensityModeFactor('toString')).toBe(1);
  });

  it('composes structural scale and semantic factor with bounded output', () => {
    expect(resolveEffectiveDensityScale(0.9, 'compact')).toBeCloseTo(0.765);
    expect(resolveEffectiveDensityScale(1.125, 'spacious')).toBeCloseTo(1.29375);
    expect(resolveEffectiveDensityScale(Number.NaN, 'compact')).toBe(0.85);
    expect(resolveEffectiveDensityScale(10, 'spacious')).toBe(3);
    expect(resolveEffectiveDensityScale(-10, 'compact')).toBe(0.5);
  });

  it('resolveDensityStyleVars carries the mode preset as CSS custom properties', () => {
    const modes: DensityMode[] = ['comfortable', 'compact'];
    for (const mode of modes) {
      const vars = resolveDensityStyleVars(mode) as unknown as Record<string, string>;
      expect(vars['--ds-density-cell-padding']).toBe(DENSITY_PRESETS[mode].cellPadding);
      expect(vars['--ds-density-card-padding']).toBe(DENSITY_PRESETS[mode].cardPadding);
      expect(vars[DENSITY_LOCAL_FACTOR_VARIABLE]).toBe(
        String(DENSITY_PRESETS[mode].modeFactor),
      );
      expect(vars['--ds-density-mode-factor']).toBeUndefined();
      expect(vars['--ds-density-scale']).toBeUndefined();
    }
  });

  it('scales discrete card/cell presets globally without multiplying local posture twice', () => {
    for (const preset of Object.values(DENSITY_PRESETS)) {
      expect(preset.cellPadding).toContain('--ds-density-global-effective-scale');
      expect(preset.cardPadding).toContain('--ds-density-global-effective-scale');
      expect(preset.cellPadding).not.toContain('--ds-density-local-factor');
      expect(preset.cardPadding).not.toContain('--ds-density-local-factor');
    }
  });
});
