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

/**
 * The ramp's entries and facet channels, stated literally so every channel
 * this sub-owner emits is nameable from source. They restate the foundation
 * ramp exactly; the family suite fails if the two ever disagree.
 */
export const TYPE_SCALE_ENTRIES = [
  "detail",
  "body",
  "emphasis",
  "title",
  "display",
  "eyebrow",
] as const;
export const TYPE_SCALE_FACET_CHANNELS: ReadonlySet<string> = new Set<string>([
  "--ds-text-detail-size",
  "--ds-text-detail-weight",
  "--ds-text-detail-line-height",
  "--ds-text-detail-letter-spacing",
  "--ds-text-body-size",
  "--ds-text-body-weight",
  "--ds-text-body-line-height",
  "--ds-text-body-letter-spacing",
  "--ds-text-emphasis-size",
  "--ds-text-emphasis-weight",
  "--ds-text-emphasis-line-height",
  "--ds-text-emphasis-letter-spacing",
  "--ds-text-title-size",
  "--ds-text-title-weight",
  "--ds-text-title-line-height",
  "--ds-text-title-letter-spacing",
  "--ds-text-display-size",
  "--ds-text-display-weight",
  "--ds-text-display-line-height",
  "--ds-text-display-letter-spacing",
  "--ds-text-eyebrow-size",
  "--ds-text-eyebrow-weight",
  "--ds-text-eyebrow-line-height",
  "--ds-text-eyebrow-letter-spacing",
  "--ds-text-eyebrow-transform",
]);

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
  for (const [channel, value] of Object.entries(table)) {
    const facet = facetOf(channel);
    if (facet === undefined) continue;
    if (TYPE_SCALE_FACET_CHANNELS.has(channel))
      vars[channel] = DIALED.has(facet)
        ? `calc(${value} * var(--ds-type-scale, 1))`
        : value;
  }
  for (const name of TYPE_SCALE_ENTRIES) {
    vars[`--ds-text-${name}`] =
      `var(--ds-text-${name}-weight) var(--ds-text-${name}-size)` +
      `/var(--ds-text-${name}-line-height) var(--ds-font-family-base)`;
  }
  return vars;
}
