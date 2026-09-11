/**
 * @fileoverview Tests for createTenantConfig -- verifies personality merging,
 * density projection, and structural token generation from minimal input.
 */

import { describe, it, expect } from 'vitest';
import { createTenantBrandTheme, createTenantConfig, type TenantCreationConfig } from '..';
import {
  resolvePersonalityPreset,
  type PersonalityPreset,
} from '../../../../foundation/personality/presets';

describe('resolvePersonalityPreset', () => {
  it('should return complete personality tokens for each preset', () => {
    const presets: PersonalityPreset[] = ['formal', 'neutral', 'playful', 'expressive'];

    for (const preset of presets) {
      const tokens = resolvePersonalityPreset(preset);
      expect(tokens.animation).toBeDefined();
      expect(tokens.chart).toBeDefined();
      expect(tokens.typography).toBeDefined();
      expect(tokens.accent).toBeDefined();
      expect(tokens.card).toBeDefined();
    }
  });

  it('should return neutral for unknown presets', () => {
    const unknown = resolvePersonalityPreset('unknown-value');
    const neutral = resolvePersonalityPreset('neutral');
    expect(unknown).toEqual(neutral);
  });

  it('formal should have low animation intensity', () => {
    const tokens = resolvePersonalityPreset('formal');
    expect(tokens.animation!.intensity).toBeLessThan(0.5);
    expect(tokens.animation!.entrance).toBe('fade');
    expect(tokens.card!.showBorder).toBe(true);
    expect(tokens.typography!.labelStyle).toBe('uppercase');
  });

  it('playful should have high animation intensity', () => {
    const tokens = resolvePersonalityPreset('playful');
    expect(tokens.animation!.intensity).toBeGreaterThan(1.0);
    expect(tokens.animation!.entrance).toBe('bounce');
    expect(tokens.card!.hoverTint).toBe(true);
    expect(tokens.accent!.badgeShape).toBe('pill');
  });

  it('expressive should use spring animations', () => {
    const tokens = resolvePersonalityPreset('expressive');
    expect(tokens.animation!.useSpring).toBe(true);
    expect(tokens.animation!.entrance).toBe('spring');
    expect(tokens.chart!.tooltipStyle).toBe('glass');
  });
});

describe('createTenantConfig', () => {
  const minimalConfig: TenantCreationConfig = {
    slug: 'acme',
    name: 'ACME Corp',
    primaryColor: '#3B82F6',
  };

  it('should create a valid TenantConfig from minimal input', () => {
    const config = createTenantConfig(minimalConfig);

    expect(config.slug).toBe('acme');
    expect(config.name).toBe('ACME Corp');
    expect(config.theme).toBe('base');
    expect(config.plan).toBe('starter');
    expect(config.features).toEqual([]);
    expect(config.branding.companyName).toBe('ACME Corp');
    expect(config.branding.primaryColor).toBe('#3B82F6');
  });

  it('carries no visual payload at all -- that is the BrandTheme half', () => {
    const config = createTenantConfig({
      ...minimalConfig,
      personality: 'formal',
      density: 'spacious',
    });

    // The five removed fields. A draft's preset and density are BrandTheme
    // channels; the identity config cannot restate them.
    for (const field of ['brandTheme', 'personality', 'tokenOverrides', 'appearance', 'engine']) {
      expect(Object.prototype.hasOwnProperty.call(config, field)).toBe(false);
    }
  });

  it('projects the personality preset onto the BrandTheme channels', () => {
    const theme = createTenantBrandTheme({ ...minimalConfig, personality: 'formal' });

    expect(theme.motion!.entrance).toBe('fade');
    expect(theme.motion!.intensity).toBeLessThan(0.5);
    expect(theme.chrome!.card!.showBorder).toBe(true);
    expect(theme.palette!.primaryColor).toBe('#3B82F6');
  });

  it('projects density onto the BrandTheme surfaces', () => {
    const compact = createTenantBrandTheme({ ...minimalConfig, density: 'compact' });
    expect(compact.surfaces?.densityScale).toBe(0.95);
    expect(compact.chrome!.card!.paddingDensity).toBe('compact');

    const spacious = createTenantBrandTheme({ ...minimalConfig, density: 'spacious' });
    expect(spacious.surfaces?.densityScale).toBe(1.1);
    expect(spacious.chrome!.card!.paddingDensity).toBe('spacious');
    expect(spacious.surfaces?.borderRadius).toBeDefined();
  });

  it('states no density scale for the comfortable baseline', () => {
    const theme = createTenantBrandTheme({ ...minimalConfig, density: 'comfortable' });
    expect(theme.surfaces?.densityScale).toBeUndefined();
  });

  it('should pass through optional fields', () => {
    const config = createTenantConfig({
      ...minimalConfig,
      secondaryColor: '#10B981',
      logo: 'https://example.com/logo.png',
      plan: 'enterprise',
      features: ['analytics', 'export-pdf'],
      domain: 'acme.example.com',
    });

    expect(config.branding.secondaryColor).toBe('#10B981');
    expect(config.branding.logo).toBe('https://example.com/logo.png');
    expect(config.plan).toBe('enterprise');
    expect(config.features).toEqual(['analytics', 'export-pdf']);
    expect(config.domain).toBe('acme.example.com');
  });

  it('should default personality to neutral', () => {
    const theme = createTenantBrandTheme(minimalConfig);
    const neutralTokens = resolvePersonalityPreset('neutral');

    expect(theme.motion!.intensity).toBe(neutralTokens.animation!.intensity);
    expect(theme.motion!.entrance).toBe(neutralTokens.animation!.entrance);
  });

  it.each([
    { slug: 'Bit-Hire', name: 'Acme' },
    { slug: 'acme', name: 'Ｒｏｔｔａｙ' },
    { slug: 'acme', name: 'e\u200bvnto' },
  ])('rejects reserved first-party identity before deriving config', (identity) => {
    expect(() =>
      createTenantConfig({
        ...minimalConfig,
        ...identity,
      }),
    ).toThrow(/reserved/);
  });

  it('allows a distinct customer name on a first-party vertical', () => {
    expect(
      createTenantConfig({
        ...minimalConfig,
        name: 'BitHire Labs',
        vertical: 'bithire',
      }),
    ).toMatchObject({
      slug: 'acme',
      name: 'BitHire Labs',
      vertical: 'bithire',
    });
  });
});
