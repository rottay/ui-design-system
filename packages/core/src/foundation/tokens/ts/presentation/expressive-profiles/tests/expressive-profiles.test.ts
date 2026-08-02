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
  clampDensityIntoExpressiveEnvelope,
  clampIntoExpressiveEnvelope,
  EXPERIENCE_PROFILE_ENVELOPES,
  EXPERIENCE_PROFILES,
  EXPRESSIVE_A11Y_FLOORS,
  EXPRESSIVE_EDGE_PROFILES,
  EXPRESSIVE_ELEVATION_PROFILES,
  EXPRESSIVE_GEOMETRY_PROFILES,
  EXPRESSIVE_ICON_PROFILES,
  EXPRESSIVE_MATERIAL_PROFILES,
  EXPRESSIVE_MOTIF_PROFILES,
  EXPRESSIVE_PROFILE_SCHEMA_VERSION,
  EXPRESSIVE_TYPE_PROFILES,
  resolveExpressiveAxes,
  type ExpressiveAxes,
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
      // Widen to the declared contract: per-profile literals omit optional
      // axes, and the vocabulary sweep must read them as optional, not absent.
      const axes: ExpressiveAxes = profile.axes;
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

  it('keeps every published composition inside its OWN envelope and the a11y floors', () => {
    for (const profile of EXPERIENCE_PROFILES) {
      const envelope = EXPERIENCE_PROFILE_ENVELOPES[profile.id];
      expect(envelope, profile.id).toBeDefined();
      const defaults = expandExpressiveProfiles(profile.axes).fieldDefaults;
      if (defaults.radiusScale !== undefined) {
        expect(defaults.radiusScale).toBeGreaterThanOrEqual(envelope.radiusScale.min);
        expect(defaults.radiusScale).toBeLessThanOrEqual(envelope.radiusScale.max);
      }
      if (defaults.density !== undefined) {
        expect(envelope.densityModes).toContain(defaults.density);
      }
      if (defaults.motion?.intensity !== undefined) {
        expect(defaults.motion.intensity).toBeLessThanOrEqual(
          envelope.motionIntensityMax
        );
      }
      // Envelope itself must sit inside the global floors.
      expect(envelope.radiusScale.min).toBeGreaterThanOrEqual(
        EXPRESSIVE_A11Y_FLOORS.radiusScale.min
      );
      expect(envelope.radiusScale.max).toBeLessThanOrEqual(
        EXPRESSIVE_A11Y_FLOORS.radiusScale.max
      );
      expect(envelope.typeScale.min).toBeGreaterThanOrEqual(
        EXPRESSIVE_A11Y_FLOORS.typeScaleMin
      );
      expect(envelope.edgeWidthMaxPx).toBeLessThanOrEqual(
        EXPRESSIVE_A11Y_FLOORS.edgeWidthMaxPx
      );
    }
    // The expansion's edge rows respect every profile's edge cap and the
    // absolute floor cap — no posture can paint decoration-grade borders.
    for (const edge of EXPRESSIVE_EDGE_PROFILES) {
      const variables = expandExpressiveProfiles({ edge }).variables;
      for (const [channel, value] of Object.entries(variables)) {
        if (!channel.includes('width')) continue;
        const px = Number.parseFloat(value);
        expect(px, `${edge} ${channel}`).toBeLessThanOrEqual(
          EXPRESSIVE_A11Y_FLOORS.edgeWidthMaxPx
        );
      }
    }
  });

  it('clamps dials into (profile envelope ∩ floors) without reordering precedence', () => {
    // An explicit editorial-tenant override of radiusScale 0.75 bends toward
    // sharp but cannot break the editorial posture floor of 1.0.
    expect(
      clampIntoExpressiveEnvelope('rottay/management-editorial@1', 'radiusScale', 0.75)
    ).toBe(1.0);
    // The technical posture caps pillowy radii at 1.0.
    expect(
      clampIntoExpressiveEnvelope('rottay/bithire-technical@1', 'radiusScale', 1.25)
    ).toBe(1.0);
    // No profile selected → only the global floors bound the dial.
    expect(clampIntoExpressiveEnvelope(undefined, 'radiusScale', 0.5)).toBe(
      EXPRESSIVE_A11Y_FLOORS.radiusScale.min
    );
    expect(
      clampIntoExpressiveEnvelope('rottay/bithire-technical@1', 'motionIntensity', 0.9)
    ).toBe(0.6);
    // Density admission demotes to the nearest admitted posture.
    expect(
      clampDensityIntoExpressiveEnvelope('rottay/bithire-technical@1', 'spacious')
    ).toBe('normal');
    expect(
      clampDensityIntoExpressiveEnvelope('rottay/management-editorial@1', 'spacious')
    ).toBe('spacious');
    expect(clampDensityIntoExpressiveEnvelope(undefined, 'compact')).toBe('compact');
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
