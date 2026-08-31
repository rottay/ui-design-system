/**
 * @fileoverview Pins the density.mode identity-factor law (F9, WO-CRA-23 R1):
 * `appearancePostureToVariables` must never declare `--ds-density-mode-factor`
 * for the identity posture (comfortable/normal), because the compiled
 * artifact selector outranks `:root[data-density]` in
 * `foundation/base/density.css` and a declared `1` would permanently clobber
 * that lower-specificity authority. A non-identity posture (compact/spacious)
 * is a real tenant choice and must still win, static or DB.
 */
import { describe, expect, it } from 'vitest';

import { DENSITY_MODE_FACTOR_VARIABLE } from '@/foundation/tokens/ts/foundation/base/density';

import { appearancePostureToVariables } from '../index';

describe('appearancePostureToVariables — density.mode identity law', () => {
  it('leaves --ds-density-mode-factor undeclared for the identity postures', () => {
    expect(
      appearancePostureToVariables({ density: 'comfortable' })[DENSITY_MODE_FACTOR_VARIABLE],
    ).toBeUndefined();
    expect(
      appearancePostureToVariables({ density: 'normal' })[DENSITY_MODE_FACTOR_VARIABLE],
    ).toBeUndefined();
  });

  it('declares --ds-density-mode-factor for a real non-identity posture', () => {
    expect(
      appearancePostureToVariables({ density: 'compact' })[DENSITY_MODE_FACTOR_VARIABLE],
    ).toBe('0.85');
    expect(
      appearancePostureToVariables({ density: 'spacious' })[DENSITY_MODE_FACTOR_VARIABLE],
    ).toBe('1.15');
  });

  it('leaves the channel absent entirely when no density posture is authored', () => {
    expect(
      Object.prototype.hasOwnProperty.call(
        appearancePostureToVariables({}),
        DENSITY_MODE_FACTOR_VARIABLE,
      ),
    ).toBe(false);
  });
});
