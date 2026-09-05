/**
 * @fileoverview Seed provenance vocabulary and the tenant seed derivations.
 *
 * @module Compilers/Theme/Lowering/Foundation/seeds
 * @category Compilers
 * @package @rottay/design-system
 */

import type { BrandPalette } from "@/foundation/contracts/composition/tenants/themes";
import { isTenantAuthoredField } from "@/foundation/contracts/composition/tenants/themes/iso";
import type { TenantAuthoredPaths } from "@/foundation/contracts/composition/tenants/themes/iso";
import { PRODUCER_RANK } from "@/infrastructure/compilers/kernel/foundation/css/chrome-variables";
import { deriveInteractionFloor } from "@/infrastructure/compilers/kernel/foundation/css/color-math/interaction-floor";
import { derivePrimarySemantics } from "@/infrastructure/compilers/kernel/foundation/css/color-math/palette-derivations";
import { ON_TONE_ROLES } from "@/infrastructure/compilers/kernel/foundation/css/color-math/readable-ink";
import type { OnToneRole } from "@/infrastructure/compilers/kernel/foundation/css/color-math/readable-ink";

/** The Theme field a tenant sets to re-seed the primary family. */
export const PRIMARY_SEED_FIELD = "palette.primaryColor";

/**
 * Every channel the primary seed derives, mapped to the Theme leaves that
 * SHADOW it -- the explicit statements that name the same channel directly.
 *
 * The key set is not hand-authored law: it is exactly the union of what
 * `derivePrimarySemantics` and `deriveInteractionFloor` emit for a seed, and
 * a test asserts that. This table only records, per channel, WHICH field an
 * author would use to overrule the derivation. `--ds-button-primary-color`
 * carries two because its emitter falls back from `.color` to `.text`, so both
 * spellings are the same statement about the same channel.
 */
export const SEED_SHADOWING_FIELDS: Readonly<
  Record<string, readonly string[]>
> = {
  "--ds-button-primary-bg": ["chrome.controls.buttonPrimary.bg"],
  "--ds-button-primary-bg-hover": ["chrome.controls.buttonPrimary.bgHover"],
  "--ds-button-primary-border": ["chrome.controls.buttonPrimary.border"],
  "--ds-button-primary-color": [
    "chrome.controls.buttonPrimary.color",
    "chrome.controls.buttonPrimary.text",
  ],
  "--ds-input-border-focus": ["chrome.controls.input.borderFocus"],
  "--ds-input-shadow-focus": ["chrome.controls.input.shadowFocus"],
  "--ds-color-primary-foreground": ["palette.primaryForegroundColor"],
  "--ds-color-border-focus": ["palette.borderFocusColor"],
  "--ds-color-link": ["palette.linkColor"],
  "--ds-color-link-hover": ["palette.linkHoverColor"],
};

/**
 * The sibling of `SEED_SHADOWING_FIELDS` for the status-tint family.
 *
 * Deliberately a separate table, not an extension of `SEED_SHADOWING_FIELDS`:
 * that table is documented AND test-closed
 * (`provenance-acceptance.test.ts`) as exactly the union of what
 * `derivePrimarySemantics`/`deriveInteractionFloor` emit for ONE seed,
 * `palette.primaryColor`. The fifteen channels below derive from FOUR
 * different seeds (`palette.{success,warning,error,info}Color`), so folding
 * them into the primary table would make that documentation false and widen
 * the primary family's own closure fixture to absorb channels it does not
 * own.
 *
 * The key set is exactly what `deriveStatusTintFloor` emits when every tone
 * is seeded -- asserted executably, same pattern as the primary table.
 */
export const STATUS_SEED_SHADOWING_FIELDS: Readonly<
  Record<string, readonly string[]>
> = {
  "--ds-color-success-bg": ["palette.successBgColor"],
  "--ds-color-success-border": ["palette.successBorderColor"],
  "--ds-color-alpha-success-10": ["palette.alphaSuccess10"],
  "--ds-color-alpha-success-20": ["palette.alphaSuccess20"],
  "--ds-color-warning-bg": ["palette.warningBgColor"],
  "--ds-color-warning-border": ["palette.warningBorderColor"],
  "--ds-color-alpha-warning-10": ["palette.alphaWarning10"],
  "--ds-color-alpha-warning-20": ["palette.alphaWarning20"],
  "--ds-color-error-bg": ["palette.errorBgColor"],
  "--ds-color-error-border": ["palette.errorBorderColor"],
  "--ds-color-alpha-error-10": ["palette.alphaError10"],
  "--ds-color-alpha-error-20": ["palette.alphaError20"],
  "--ds-color-info-bg": ["palette.infoBgColor"],
  "--ds-color-info-border": ["palette.infoBorderColor"],
  "--ds-color-alpha-info-10": ["palette.alphaInfo10"],
};

/**
 * The four status seed fields, the sibling of `PRIMARY_SEED_FIELD`
 * for the status-tint family. Derived from `ON_TONE_ROLES` rather than
 * hand-listed so the closed vocabulary this feeds
 * (`CONSULTED_PROVENANCE_FIELDS`, `iso/index.ts`) cannot silently drift from
 * the roles `deriveStatusTintFloor`/`applyTenantStatusSeedDerivations`
 * actually iterate.
 */
export const STATUS_SEED_FIELDS: readonly string[] = ON_TONE_ROLES.map(
  (role) => `palette.${role}Color`
);

const CUSTOM_PROPERTY_NAME = /--[a-z0-9-]+/gi;

const BAKED_COLOR = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\(/i;

/**
 * Does this value bake a colour OF ITS OWN, or does it only point at one?
 *
 * The distinction decides whether a tenant's seed may replace an assembled
 * value. `var(--ds-button-primary-bg)` and `var(--ds-control-on-brand)` bake
 * nothing: they resolve THROUGH channels this same derivation re-seeds, so
 * they already carry the tenant's brand and rewriting them would change bytes
 * without changing a pixel. `var(--ds-material-control-border-active, #3A6FB0)`
 * does bake one -- the vertical's blue survives in the fallback no matter what
 * the tenant seeds -- so it is genuinely stale and must be re-derived.
 *
 * Custom-property NAMES are stripped before the test because a channel name is
 * a reference, never a colour; what remains is only literal values, including
 * the ones hiding in a `var()` fallback.
 */
function bakesItsOwnColor(value: string): boolean {
  return BAKED_COLOR.test(value.replace(CUSTOM_PROPERTY_NAME, ""));
}

/** What one compiled block needs to know about its tenant's authorship. */
interface TenantSeedProvenance {
  readonly authoredPaths: TenantAuthoredPaths;
  /** "" for the base block, "modes.<mode>." for a mode overlay block. */
  readonly modePrefix: string;
  /** Whether the seed THIS block compiles from is the tenant's own. */
  readonly seedIsTenantAuthored: boolean;
}

/**
 * Re-derive the primary family a TENANT seed owns, over an assembled block.
 *
 * A tenant that sets its primary colour and nothing else must get a sidebar,
 * a focus ring and a link colour that are ITS brand, not the vertical's. Today
 * the vertical baseline's concrete leaves sit in the assembled map and outrank
 * the derivation purely because they were written later, which is a
 * white-label defect: a BASELINE_LEAF cannot beat a TENANT_DERIVED value.
 *
 * Three guards keep the repair from becoming a repaint:
 *
 *  1. No provenance, or a seed this block did not get from the tenant, and the
 *     function returns without touching a byte. Every static first-party
 *     compile takes this path.
 *  2. A tenant leaf that names the channel directly (`SEED_SHADOWING_FIELDS`)
 *     is TENANT_LEAF and outranks the tenant's own seed, so the derivation
 *     skips it.
 *  3. A value that bakes no colour of its own already tracks the seed, so it
 *     is left exactly as assembled -- the indirection survives.
 *
 * The values themselves come from the SAME two owners the unseeded path uses,
 * called with the same arguments. There is no second derivation and no
 * arithmetic here.
 */
export function applyTenantSeedDerivations(
  vars: Record<string, string>,
  effectivePrimary: string | undefined,
  provenance: TenantSeedProvenance | undefined
): void {
  if (!provenance || !provenance.seedIsTenantAuthored) return;
  const derived: Record<string, string> = {
    ...derivePrimarySemantics({ primary: effectivePrimary }),
    ...deriveInteractionFloor(effectivePrimary).variables,
  };
  for (const [channel, derivedValue] of Object.entries(derived)) {
    const currentRank = (SEED_SHADOWING_FIELDS[channel] ?? []).some((field) =>
      isTenantAuthoredField(
        provenance.authoredPaths,
        field,
        provenance.modePrefix
      )
    )
      ? PRODUCER_RANK.tenantLeaf
      : PRODUCER_RANK.baselineLeaf;
    if (PRODUCER_RANK.tenantDerived <= currentRank) continue;
    const current = vars[channel];
    if (current !== undefined && !bakesItsOwnColor(current)) continue;
    vars[channel] = derivedValue;
  }
}

/**
 * The sibling of `applyTenantSeedDerivations` for the four status
 * tones: re-derive the bg/border/alpha family a TENANT's own status seed
 * owns, over an assembled block.
 *
 * Same defect as the primary family, one tier down: a DB tenant that sets
 * only `palette.status.success` (lowered to `palette.successColor` before
 * this compiler runs -- `ingress/foundation/document-patch`, the same door the seed
 * passthrough already uses) must get a `-bg`/`-border`/alpha family derived
 * from ITS seed, not left resolving to the vertical baseline's baked-in
 * literal. `deriveStatusTintFloor` alone cannot fix this: it merges under
 * `setExtendedPaletteVariables`, whose unconditional "write when present"
 * then re-applies the MERGED theme's `successBgColor` -- which for a tenant
 * on bithire is still bithire's own green, because a tenant's silence on a
 * channel resolves to the baseline's leaf, not to "absent".
 *
 * Four independent seeds, so each tone is considered on its own rather than
 * as one family. Same three guards as `applyTenantSeedDerivations`, per tone:
 *
 *  1. No provenance, or THIS tone's seed is not the tenant's own (checked the
 *     same way the primary family checks `PRIMARY_SEED_FIELD`: the mode's own
 *     restatement, or inheritance from the base when the overlay does not
 *     restate it) -- the tone is skipped entirely.
 *  2. A tenant leaf that names the channel directly
 *     (`STATUS_SEED_SHADOWING_FIELDS`) is TENANT_LEAF and outranks the
 *     tenant's own seed.
 *  3. A value that bakes no colour of its own is left exactly as assembled.
 */
export function applyTenantStatusSeedDerivations(
  vars: Record<string, string>,
  effectivePalette: BrandPalette | undefined,
  provenance:
    | {
        authoredPaths: TenantAuthoredPaths;
        /** "" for the base block, "modes.<mode>." for a mode overlay block. */
        modePrefix: string;
        /**
         * Per tone: is the seed THIS block compiles from genuinely the
         * tenant's own -- computed by the caller from the RAW tenant patch
         * value, never from `authoredPaths` membership alone.
         * `collectPatchAuthoredPaths` enumerates a keypath the moment it
         * exists as an object key, even when its value is `undefined`
         * (`document-patch`'s `paletteFields()` always constructs all four
         * status-color keys on its returned object, tenant-set or not), so
         * `authoredPaths.has("...palette.errorColor")` can be true for a
         * tenant that never touched error at all. Measured: a document that
         * only sets `backgroundMode` moves rottay's LIGHT overlay's own
         * authored `alphaError10` literal, with no tenant seed in sight,
         * unless this guard reads the real value instead of the Set.
         */
        toneSeedIsTenantAuthored: Readonly<Record<OnToneRole, boolean>>;
      }
    | undefined
): void {
  if (!provenance || !effectivePalette) return;
  const { authoredPaths, modePrefix, toneSeedIsTenantAuthored } = provenance;
  for (const role of ON_TONE_ROLES) {
    if (!toneSeedIsTenantAuthored[role]) continue;
    const channel = `--ds-color-${role}`;
    const derived: Record<string, string> = {
      [`${channel}-bg`]: `var(${channel}-50)`,
      [`${channel}-border`]: `color-mix(in srgb, var(${channel}) 20%, transparent)`,
      [`--ds-color-alpha-${role}-10`]: `color-mix(in srgb, var(${channel}) 10%, transparent)`,
      ...(role === "info"
        ? {}
        : {
            [`--ds-color-alpha-${role}-20`]: `color-mix(in srgb, var(${channel}) 20%, transparent)`,
          }),
    };
    for (const [derivedChannel, derivedValue] of Object.entries(derived)) {
      const currentRank = (
        STATUS_SEED_SHADOWING_FIELDS[derivedChannel] ?? []
      ).some((field) => isTenantAuthoredField(authoredPaths, field, modePrefix))
        ? PRODUCER_RANK.tenantLeaf
        : PRODUCER_RANK.baselineLeaf;
      if (PRODUCER_RANK.tenantDerived <= currentRank) continue;
      const current = vars[derivedChannel];
      if (current !== undefined && !bakesItsOwnColor(current)) continue;
      vars[derivedChannel] = derivedValue;
    }
  }
}
