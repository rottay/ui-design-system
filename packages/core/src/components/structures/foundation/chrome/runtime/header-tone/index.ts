/**
 * @fileoverview The header tone contract: one closed tone domain for the header
 * families, resolved once.
 * @module Structures/Foundation/Chrome/Runtime/HeaderTone
 * @category StructureFoundation
 * @package @rottay/design-system
 *
 * @remarks
 * WHAT WAS DUPLICATED, MEASURED. `getVariantTone` existed twice — at
 * `structures/headers/form/index.tsx:132` and `structures/headers/edit/index.tsx:145` —
 * with byte-identical bodies: the same `secondary` arm, the same 10 % / 18 % / 78 %
 * mixes, the same three facets. Each copy carried one of this cut's two source colour
 * literals. The CSS half of the same duplication was already extracted, and
 * `skin/header-hero-shared/index.css` says so in its own header.
 *
 * WHERE THE TWO DID NOT AGREE, and therefore what is NOT unified here. The admitted
 * domains differ, and unifying them would have widened two public props:
 *
 *   - `FormHeaderProps.colorVariant` admits 5 tones — no `error`
 *   - `EditHeaderProps.colorVariant` admits 6 — `error` included
 *   - `EditHeaderProps.status.color` admits 5 — no `primary`
 *
 * So the contract's domain is the UNION, and each family keeps its own narrower
 * prop union. A family widens its own public surface deliberately or not at all;
 * an extraction is not a place to do it by accident.
 *
 * WHAT MOVED, AND WHERE IT WENT. The tone VALUES are not here. A tone is paint, and
 * paint belongs in the skin: the badge and the pill stamp `data-variant` from this
 * resolver and `skin/header-hero-shared` / `skin/edit-header` key the three tone
 * channels on it, over the `--ds-header-tone-*` channels the `header` chrome deriver
 * produces. Relocating the `color-mix(...)` strings into this file would have moved
 * the literal out of the family-cut gate's reach without removing it.
 *
 * `VARIANT_TOKEN_MAP` is not carried over. Both copies mapped every key to itself,
 * so the indirection decided nothing.
 */

/**
 * The tone vocabulary the header families share, as a closed domain.
 *
 * The order is the order the skin declares its rules in, so the two can be read
 * against each other.
 */
export const HEADER_TONES = [
  'secondary',
  'primary',
  'success',
  'warning',
  'info',
  'error',
] as const;

export type HeaderTone = (typeof HEADER_TONES)[number];

/**
 * The resting tone. Both families defaulted to `secondary`, and the skin declares
 * the secondary facets on the part itself rather than behind a `data-variant` rule,
 * so an unstamped part still renders this tone.
 */
export const DEFAULT_HEADER_TONE: HeaderTone = 'secondary';

/** The tone a slot paints, with the shared default applied in one place. */
export function resolveHeaderTone(tone?: HeaderTone | null): HeaderTone {
  return tone == null ? DEFAULT_HEADER_TONE : tone;
}

/**
 * The anatomy attribute a toned header part stamps, so the skin decides the paint.
 *
 * `data-variant` is the governed attribute for a family's closed variant domain;
 * the tone is exactly that domain for these parts.
 */
export function headerToneAttributes(tone?: HeaderTone | null): { 'data-variant': HeaderTone } {
  return { 'data-variant': resolveHeaderTone(tone) };
}
