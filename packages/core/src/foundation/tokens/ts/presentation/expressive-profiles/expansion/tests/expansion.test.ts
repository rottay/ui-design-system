/**
 * Expansion laws (C1b): deterministic, key-order-stable, vocabulary-bounded
 * output; frontier and slot-less values expand to nothing; the type table's
 * two projections (DB channel rows vs static role overlay) can never drift.
 */
import { describe, expect, it } from 'vitest';

import type { ExpressiveAxes } from '../..';
import { expandExpressiveProfiles, expressiveTypeRoleOverlay } from '..';

const FULL_AXES: ExpressiveAxes = {
  type: 'editorial',
  geometry: 'soft',
  edge: 'ruled',
  material: 'paper',
  elevation: 'soft-depth',
  motif: 'contour',
  icon: 'duotone',
  density: 'spacious',
  motion: { intensity: 0.7, durationScale: 1.1, ambient: 'subtle' },
};

/**
 * Closed prefixes the expansion may write. Anything outside this list is a
 * functional or foreign channel and a review-stopping defect: expressive
 * profiles must never touch palette, state, focus, wash or form-control
 * affordances.
 */
const ALLOWED_KEY_PATTERN =
  /^--ds-(type-[a-z-]+|letter-spacing-heading|table-header-(letter-spacing|text-transform)|(select|menu)-group-text-transform|page-header-(eyebrow-text-transform|bg)|edge-(hairline|standard|emphasis)-width|edge-standard-style|material-(canvas|card|panel|overlay|raised)-(texture|highlight)|elevation-lift-strength|shadow-(tint|key-strength|ambient-strength)|divider-(width|style))$/;

describe('expandExpressiveProfiles', () => {
  it('is deterministic with stable key order', () => {
    const first = expandExpressiveProfiles(FULL_AXES);
    const second = expandExpressiveProfiles(FULL_AXES);
    expect(second).toEqual(first);
    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
    const keys = Object.keys(first.variables);
    expect(keys).toEqual([...keys].sort());
  });

  it('expands nothing for an empty axis set', () => {
    const expansion = expandExpressiveProfiles({});
    expect(expansion.variables).toEqual({});
    expect(expansion.fieldDefaults).toEqual({});
  });

  it('keeps every emitted channel inside the closed expressive vocabulary', () => {
    for (const type of ['technical', 'editorial', 'humanist', 'geometric'] as const) {
      for (const edge of [
        'borderless-shadow',
        'hairline',
        'outlined',
        'ruled',
        'inset-double',
      ] as const) {
        const expansion = expandExpressiveProfiles({
          type,
          edge,
          geometry: 'sharp',
          material: 'luminous',
          elevation: 'dramatic',
          motif: 'micro-grid',
        });
        for (const key of Object.keys(expansion.variables)) {
          expect(key, key).toMatch(ALLOWED_KEY_PATTERN);
        }
        for (const value of Object.values(expansion.variables)) {
          expect(value).not.toMatch(/[{};<>[\]@\\]|url\s*\(|!\s*important/i);
        }
      }
    }
  });

  it('pins the boundaries: icon is frontier, slot-less motifs expand to nothing', () => {
    const icon = expandExpressiveProfiles({ icon: 'duotone' });
    expect(icon.variables).toEqual({});
    expect(icon.fieldDefaults).toEqual({});
    for (const motif of ['dots', 'deco-fan', 'ambient-orbs'] as const) {
      expect(expandExpressiveProfiles({ motif }).variables).toEqual({});
    }
    // `none` states the posture explicitly through material, not motif rows.
    expect(expandExpressiveProfiles({ motif: 'none' }).variables).toEqual({});
  });

  it('projects the type table identically into channels and the role overlay', () => {
    for (const type of ['technical', 'editorial', 'humanist', 'geometric'] as const) {
      const variables = expandExpressiveProfiles({ type }).variables;
      const overlay = expressiveTypeRoleOverlay({ type })!;
      if (overlay.display?.letterSpacing !== undefined) {
        expect(variables['--ds-type-display-letter-spacing']).toBe(
          overlay.display.letterSpacing
        );
      }
      if (overlay.label?.textTransform !== undefined) {
        expect(variables['--ds-type-label-text-transform']).toBe(
          overlay.label.textTransform
        );
      }
      if (overlay.label?.letterSpacing !== undefined) {
        expect(variables['--ds-type-label-letter-spacing']).toBe(
          overlay.label.letterSpacing
        );
      }
      if (overlay.numeric?.fontVariantNumeric !== undefined) {
        expect(variables['--ds-type-numeric-font-variant-numeric']).toBe(
          overlay.numeric.fontVariantNumeric
        );
      }
    }
  });

  it('maps field defaults without ever emitting their channels as variables', () => {
    const expansion = expandExpressiveProfiles(FULL_AXES);
    expect(expansion.fieldDefaults).toEqual({
      typePairing: 'editorial',
      buttonStyle: 'soft',
      radiusScale: 1.15,
      density: 'spacious',
      motion: { intensity: 0.7, durationScale: 1.1, ambient: 'subtle' },
      elevation: 'soft',
    });
    // Field-backed channels stay with their single shared posture emitter.
    expect(expansion.variables['--ds-radius-button']).toBeUndefined();
    expect(expansion.variables['--ds-density-mode-factor']).toBeUndefined();
    expect(expansion.variables['--ds-motion-intensity']).toBeUndefined();
    expect(expansion.variables['--ds-elevation-1']).toBeUndefined();
    expect(expansion.variables['--ds-radius-scale']).toBeUndefined();
  });
});
