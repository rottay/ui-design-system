/**
 * @fileoverview The closed absence-reason vocabulary for a governed family.
 *
 * @module Contracts/Themes/CapabilityAbsence
 * @category Types
 * @package @rottay/design-system
 */

/**
 * Why a capability is not active. Never inferred; always authored.
 *
 * Its own owner BELOW `iso`, and deliberately a LEAF: the merge boundary in
 * `themes/iso` has to REJECT a disposition an ingested document invents, which
 * makes this a runtime value rather than a type. Reading it from the `themes`
 * barrel would give that contract a value edge onto every theme family the
 * barrel names — measured at +68 330 source bytes on the `./runtime/tenant`
 * entrypoint graph, for three strings.
 */
export const BRAND_CAPABILITY_ABSENCE_REASONS = [
  /** A newer authority owns this channel; the field is compatibility-only. */
  "superseded",
  /** The brand deliberately ships nothing here. */
  "not-authored",
  /** No governed profile exists for this brand yet; a decision is pending. */
  "pending-selection",
] as const;

/**
 * Derived from the runtime list rather than restated, because a hand-written
 * union the validator cannot see at runtime is a validator that accepts
 * everything.
 */
export type BrandCapabilityAbsenceReason =
  (typeof BRAND_CAPABILITY_ABSENCE_REASONS)[number];
