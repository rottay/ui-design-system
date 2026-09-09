/**
 * @fileoverview Elevation sub-owner: the stacking bands.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/elevation/z-index
 * @category Compilers
 * @package @rottay/design-system
 */

/**
 * One band per stacking role, 100 apart so an overlay manager can order
 * siblings inside a band without leaving it.
 *
 * These numbers are the SAME ones `foundation/base/z-index/index.css` declares
 * at rest; `../tests` pins the two against each other so the pair cannot
 * drift into the five competing vocabularies this scale replaced. The compiler
 * emits them so a compiled tenant block carries the whole stack, not just the
 * single band a tenant happened to raise -- a tenant that lifts the tooltip
 * band must be able to see the toast band it now sits above.
 */
export const Z_INDEX_BANDS: Readonly<Record<string, number>> = Object.freeze({
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  overlay: 1300,
  drawer: 1400,
  modal: 1500,
  popover: 1600,
  tooltip: 1700,
  notification: 1800,
  max: 9999,
});

export function deriveZIndexBands(): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [band, value] of Object.entries(Z_INDEX_BANDS)) {
    vars[`--ds-z-index-${band}`] = String(value);
  }
  return vars;
}
