/**
 * Registry law for the expressive-profile vocabulary (C1b): closed ids,
 * closed axis values, every published composition inside every global bound,
 * fail-closed resolution, and hostile-input sanitation. Few and falsifiable —
 * each case states a property a future row cannot silently violate.
 */
import { describe, expect, it } from 'vitest';

import { MOTION_DIAL_BOUNDS } from '@/foundation/contracts/runtime/motion';
import { TENANT_THEME_RADIUS_SCALE_BOUNDS } from '@/foundation/contracts/composition/tenants/themes/tenant-theme';
import {
  EXPERIENCE_PROFILES,
  EXPRESSIVE_EDGE_PROFILES,
  EXPRESSIVE_ELEVATION_PROFILES,
  EXPRESSIVE_GEOMETRY_PROFILES,
  EXPRESSIVE_ICON_PROFILES,
  EXPRESSIVE_MATERIAL_PROFILES,
  EXPRESSIVE_MOTIF_PROFILES,
  EXPRESSIVE_PROFILE_SCHEMA_VERSION,
  EXPRESSIVE_TYPE_PROFILES,
  resolveExpressiveAxes,
  sanitizeExpressiveOverrides,
  validateExperienceProfileSelection,
} from '..';
import { expandExpressiveProfiles } from '../expansion';

const ID_PATTERN = /^[a-z0-9-]+\/[a-z0-9-]+@[0-9]+$/;

describe('experience profile registry', () => {
  it('keeps ids unique, namespaced and version-suffixed', () => {
    const ids = EXPERIENCE_PROFILES.map((profile) => profile.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const profile of EXPERIENCE_PROFILES) {
      expect(profile.id).toMatch(ID_PATTERN);
      expect(profile.schemaVersion).toBe(EXPRESSIVE_PROFILE_SCHEMA_VERSION);
      expect(profile.description.length).toBeGreaterThan(0);
    }
  });

  it('keeps every composition inside the closed vocabularies and global bounds', () => {
    for (const profile of EXPERIENCE_PROFILES) {
      const axes = profile.axes;
      if (axes.type) expect(EXPRESSIVE_TYPE_PROFILES).toContain(axes.type);
      if (axes.geometry) {
        expect(EXPRESSIVE_GEOMETRY_PROFILES).toContain(axes.geometry);
      }
      if (axes.edge) expect(EXPRESSIVE_EDGE_PROFILES).toContain(axes.edge);
      if (axes.material) {
        expect(EXPRESSIVE_MATERIAL_PROFILES).toContain(axes.material);
      }
      if (axes.elevation) {
        expect(EXPRESSIVE_ELEVATION_PROFILES).toContain(axes.elevation);
      }
      if (axes.motif) expect(EXPRESSIVE_MOTIF_PROFILES).toContain(axes.motif);
      if (axes.icon) expect(EXPRESSIVE_ICON_PROFILES).toContain(axes.icon);
      if (axes.motion?.intensity !== undefined) {
        expect(axes.motion.intensity).toBeGreaterThanOrEqual(
          MOTION_DIAL_BOUNDS.intensity.min
        );
        expect(axes.motion.intensity).toBeLessThanOrEqual(
          MOTION_DIAL_BOUNDS.intensity.max
        );
      }
      if (axes.motion?.durationScale !== undefined) {
        expect(axes.motion.durationScale).toBeGreaterThanOrEqual(
          MOTION_DIAL_BOUNDS.durationScale.min
        );
        expect(axes.motion.durationScale).toBeLessThanOrEqual(
          MOTION_DIAL_BOUNDS.durationScale.max
        );
      }
      // A composition's geometry default must sit inside the GLOBAL radius
      // bounds on its own; vertical envelopes additionally clamp at compile.
      const geometryDefault = expandExpressiveProfiles(axes).fieldDefaults
        .radiusScale;
      if (geometryDefault !== undefined) {
        expect(geometryDefault).toBeGreaterThanOrEqual(
          TENANT_THEME_RADIUS_SCALE_BOUNDS.min
        );
        expect(geometryDefault).toBeLessThanOrEqual(
          TENANT_THEME_RADIUS_SCALE_BOUNDS.max
        );
      }
    }
  });

  it('fails closed on malformed, unknown and version-foreign selections', () => {
    expect(validateExperienceProfileSelection(undefined).ok).toBe(true);
    expect(validateExperienceProfileSelection('SELECT *;').reason).toBe(
      'malformed-id'
    );
    expect(validateExperienceProfileSelection('rottay/ghost@9').reason).toBe(
      'unknown-id'
    );
    expect(
      validateExperienceProfileSelection('rottay/bithire-technical@1', 2)
        .reason
    ).toBe('unsupported-schema-version');
    expect(validateExperienceProfileSelection(undefined, 2).reason).toBe(
      'unsupported-schema-version'
    );
  });

  it('sanitizes hostile overrides fail-closed per axis', () => {
    expect(sanitizeExpressiveOverrides(undefined)).toBeUndefined();
    expect(sanitizeExpressiveOverrides('paper')).toBeUndefined();
    expect(sanitizeExpressiveOverrides({})).toBeUndefined();
    expect(
      sanitizeExpressiveOverrides({
        material: 'velvet',
        elevation: 'orbital',
        unknownAxis: 'x',
      })
    ).toBeUndefined();
    expect(
      sanitizeExpressiveOverrides({ material: 'paper', elevation: 'orbital' })
    ).toEqual({ material: 'paper' });
  });

  it('resolves overrides above the experience composition, per axis', () => {
    const axes = resolveExpressiveAxes('rottay/management-editorial@1', {
      edge: 'inset-double',
    });
    expect(axes.edge).toBe('inset-double');
    expect(axes.material).toBe('paper');
    expect(axes.motif).toBe('contour');
    // Unknown id fails closed to overrides-only.
    const fallback = resolveExpressiveAxes('rottay/ghost@9', {
      geometry: 'sharp',
    });
    expect(fallback.geometry).toBe('sharp');
    expect(fallback.material).toBeUndefined();
    // A foreign selection-contract version rejects the entire authored
    // envelope, including otherwise valid overrides.
    expect(
      resolveExpressiveAxes(
        'rottay/management-editorial@1',
        { edge: 'outlined' },
        2,
      )
    ).toEqual({});
  });
});
