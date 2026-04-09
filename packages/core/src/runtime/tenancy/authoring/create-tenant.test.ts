/**
 * @fileoverview Tests for createTenantConfig -- verifies personality merging,
 * density projection, and structural token generation from minimal input.
 */

import { describe, it, expect } from 'vitest';
import { createTenantConfig, type TenantCreationConfig } from './create-tenant';
import { resolvePersonalityPreset, type PersonalityPreset } from './personality-presets';

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
    expect(config.engine).toBe('classic');
    expect(config.theme).toBe('base');
    expect(config.plan).toBe('starter');
    expect(config.features).toEqual([]);
    expect(config.branding.companyName).toBe('ACME Corp');
    expect(config.branding.primaryColor).toBe('#3B82F6');
  });

  it('should apply personality preset', () => {
    const config = createTenantConfig({
      ...minimalConfig,
      personality: 'formal',
    });

    expect(config.personality).toBeDefined();
    expect(config.personality!.animation!.entrance).toBe('fade');
    expect(config.personality!.animation!.intensity).toBeLessThan(0.5);
    expect(config.personality!.card!.showBorder).toBe(true);
  });

  it('should apply density settings', () => {
    const compact = createTenantConfig({
      ...minimalConfig,
      density: 'compact',
    });
    expect(compact.tokenOverrides?.densityScale).toBe(0.95);
    expect(compact.personality!.card!.paddingDensity).toBe('compact');

    const spacious = createTenantConfig({
      ...minimalConfig,
      density: 'spacious',
    });
    expect(spacious.tokenOverrides?.densityScale).toBe(1.1);
    expect(spacious.personality!.card!.paddingDensity).toBe('spacious');
    expect(spacious.tokenOverrides?.borderRadius).toBeDefined();
  });

  it('should not add tokenOverrides for comfortable density', () => {
    const config = createTenantConfig({
      ...minimalConfig,
      density: 'comfortable',
    });
    expect(config.tokenOverrides).toBeUndefined();
  });

  it('should pass through optional fields', () => {
    const config = createTenantConfig({
      ...minimalConfig,
      secondaryColor: '#10B981',
      logo: 'https://example.com/logo.png',
      engine: 'modern',
      plan: 'enterprise',
      features: ['analytics', 'export-pdf'],
      domain: 'acme.example.com',
    });

    expect(config.branding.secondaryColor).toBe('#10B981');
    expect(config.branding.logo).toBe('https://example.com/logo.png');
    expect(config.engine).toBe('modern');
    expect(config.plan).toBe('enterprise');
    expect(config.features).toEqual(['analytics', 'export-pdf']);
    expect(config.domain).toBe('acme.example.com');
  });

  it('should default personality to neutral', () => {
    const config = createTenantConfig(minimalConfig);
    const neutralTokens = resolvePersonalityPreset('neutral');

    expect(config.personality!.animation!.intensity).toBe(neutralTokens.animation!.intensity);
    expect(config.personality!.animation!.entrance).toBe(neutralTokens.animation!.entrance);
  });
});
