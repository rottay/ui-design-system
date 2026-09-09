/**
 * @fileoverview Typography sub-owner: the named ramp, expressed on its own
 * facets and on the type-scale dial.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/typography/scale
 * @category Compilers
 * @package @rottay/design-system
 */

import { setTypeRampVariables } from "../../../../foundation/type-ramp";

/** The addressable facets of a ramp entry; anything else IS the entry. */
const FACETS = [
  "-size",
  "-weight",
  "-line-height",
  "-letter-spacing",
  "-transform",
] as const;
const DIALED = new Set<string>(["-size", "-line-height"]);

function facetOf(channel: string): (typeof FACETS)[number] | undefined {
  return FACETS.find((facet) => channel.endsWith(facet));
}

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
  const entries: string[] = [];
  for (const [channel, value] of Object.entries(table)) {
    const facet = facetOf(channel);
    if (facet === undefined) {
      entries.push(channel.slice("--ds-text-".length));
      continue;
    }
    vars[channel] = DIALED.has(facet)
      ? `calc(${value} * var(--ds-type-scale, 1))`
      : value;
  }
  for (const name of entries) {
    vars[`--ds-text-${name}`] =
      `var(--ds-text-${name}-weight) var(--ds-text-${name}-size)` +
      `/var(--ds-text-${name}-line-height) var(--ds-font-family-base)`;
  }
  return vars;
}
