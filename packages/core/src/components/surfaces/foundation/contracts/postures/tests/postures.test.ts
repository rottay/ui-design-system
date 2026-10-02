import { describe, expect, it } from 'vitest';

import {
  DEFAULT_SURFACE_POSTURES,
  resolveSurfacePostures,
  type SurfacePostures,
} from '..';

describe('resolveSurfacePostures', () => {
  it('resolves a phone request to the app shell bottom-bar default', () => {
    const resolved = resolveSurfacePostures(undefined, 'phone', 'app-shell');

    expect(resolved.viewport).toBe('phone');
    expect(resolved.navigation).toBe('bottom-bar');
    expect(resolved.primaryAction).toBe('bottom-bar');
    expect(resolved.regions).toEqual({});
  });

  it('resolves a desktop request to the full shell posture', () => {
    const resolved = resolveSurfacePostures(undefined, 'desktop', 'app-shell');

    expect(resolved.navigation).toBe('sidebar');
    expect(resolved.primaryAction).toBe('app-bar');
  });

  it('lets the app hide a region by name without touching other regions', () => {
    const postures: SurfacePostures = {
      phone: { regions: { 'preview-rail': 'hide', 'column-menu': 'hide' } },
    };

    const resolved = resolveSurfacePostures(postures, 'phone', 'list');

    expect(resolved.regions['preview-rail']).toBe('hide');
    expect(resolved.regions['column-menu']).toBe('hide');
    expect(resolved.regions['results']).toBeUndefined();
  });

  it('keeps the app declaration scoped to its band: desktop renders everything', () => {
    const postures: SurfacePostures = {
      phone: { regions: { 'preview-rail': 'hide' } },
    };

    const resolved = resolveSurfacePostures(postures, 'desktop', 'list');

    expect(resolved.regions['preview-rail']).toBeUndefined();
  });

  it('merges the app delta over the family default instead of replacing it', () => {
    const postures: SurfacePostures = {
      phone: { navigation: 'drawer', density: 'compact' },
    };

    const resolved = resolveSurfacePostures(postures, 'phone', 'app-shell');

    expect(resolved.navigation).toBe('drawer');
    expect(resolved.density).toBe('compact');
    // Untouched default fields survive the delta.
    expect(resolved.primaryAction).toBe('bottom-bar');
  });

  it('exposes every family in the defaults table', () => {
    for (const family of ['app-shell', 'list', 'record', 'workspace', 'form'] as const) {
      expect(DEFAULT_SURFACE_POSTURES[family]).toBeDefined();
      for (const viewport of ['phone', 'tablet', 'desktop'] as const) {
        expect(() => resolveSurfacePostures(undefined, viewport, family)).not.toThrow();
      }
    }
  });
});
