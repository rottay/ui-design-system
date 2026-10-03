/**
 * How many elevation/shadow SCALES one stylesheet defines: 0, 1 or 2.
 *
 * A scale is a DECLARATION -- `--ds-elevation-1` given a literal value, or a
 * `--ds-shadow-sm|md|lg` given one instead of aliasing the elevation ramp. A
 * style-query condition (`@container not style(--ds-elevation-1: none)`) has
 * the same `name: value` shape and declares nothing, so every at-rule prelude
 * is dropped before the text is read.
 */
const AT_RULE_PRELUDE = /@[a-z-]+\b[^{};]*(?=\{)/giu;
const ELEVATION_RAMP = /--ds-elevation-1:\s*(?!var\()[^;]*(?:rgba?\(|px|none)/;
const PARALLEL_SHADOW_RAMP = /--ds-shadow-(?:sm|md|lg):\s*(?!var\()[^;]*(?:rgba?\(|px)/;

export function shadowScaleDefinitions(css) {
  const declarations = css.replace(AT_RULE_PRELUDE, '');
  return Number(ELEVATION_RAMP.test(declarations)) + Number(PARALLEL_SHADOW_RAMP.test(declarations));
}
