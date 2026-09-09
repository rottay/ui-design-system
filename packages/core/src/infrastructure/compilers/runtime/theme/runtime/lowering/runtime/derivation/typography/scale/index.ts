/**
 * @fileoverview Typography sub-owner: the named ramp, expressed on its own
 * facets and on the type-scale dial.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/typography/scale
 * @category Compilers
 * @package @rottay/design-system
 */

import { setTypeRampVariables } from "../../../../foundation/type-ramp";

const DIALED_FACET = /-(size|line-height)$/;
const COMPOSITE = /^--ds-text-([a-z0-9-]+)$/;

/**
 * The ramp, derived rather than fixed.
 *
 * Every entry used to be emitted as a literal triple, identical for every
 * tenant, plus a `font` shorthand that repeated those same literals -- so the
 * ramp was the one type surface a tenant's own `typography.scale` could not
 * move, and the shorthand could drift from the facets beside it. Here the
 * size and leading facets carry the dial and the shorthand is re-expressed on
 * the facets, which leaves the ramp with exactly one authority per entry.
 */
export function deriveTypeScaleChannels(): Record<string, string> {
  const table: Record<string, string> = {};
  setTypeRampVariables(table);

  const vars: Record<string, string> = {};
  const composites: string[] = [];
  for (const [channel, value] of Object.entries(table)) {
    const composite = COMPOSITE.exec(channel);
    if (composite) {
      composites.push(composite[1]);
      continue;
    }
    vars[channel] = DIALED_FACET.test(channel)
      ? `calc(${value} * var(--ds-type-scale, 1))`
      : value;
  }
  for (const name of composites) {
    vars[`--ds-text-${name}`] =
      `var(--ds-text-${name}-weight) var(--ds-text-${name}-size)` +
      `/var(--ds-text-${name}-line-height) var(--ds-font-family-base)`;
  }
  return vars;
}
