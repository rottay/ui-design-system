/**
 * @fileoverview The resolved token document: a compile projected onto typed,
 * numeric leaves that a non-CSS consumer can act on.
 *
 * @module Contracts/Theme/Runtime/Compilation
 * @category Types
 * @package @rottay/design-system
 *
 * A compile has three projections, and this contract types the third. The
 * artifact carries channel TEXT with its references intact; `ThemeCompilation.
 * runtime` carries personality, overrides and profile names and no channels at
 * all; this document carries the channels, resolved and evaluated against a
 * declared environment. It duplicates neither: it is the only one a renderer
 * with no CSS engine can read.
 *
 * It is a projection OF a `ThemeCompilation`, never a field ON one. The
 * compiled contract lives under `foundation/`, which ranks below this owner and
 * may not import it, so the separation is structural rather than a convention a
 * later packet could quietly drop.
 *
 * The leaf shapes are copied from the motion contracts: the unit lives in the
 * field name and the value is a number, because "render adapters are
 * responsible for converting them to any supplier-specific unit".
 */

import type { FlatThemeMode } from "@/foundation/contracts/composition/tenants/themes";
import type { EngineName } from "@/foundation/contracts/kernel/engine-identity";
import type { FirstPartyVerticalId } from "@/foundation/contracts/kernel/verticals";

/**
 * A custom-property name.
 *
 * Restated here rather than imported from the lowering: `contracts/` ranks
 * above `infrastructure/` and may not import it. A template literal needs no
 * import, so the restatement is the original's own form rather than a weaker
 * alias.
 */
export type TokenChannelName = `--ds-${string}`;

export type TokenEmissionMode = FlatThemeMode;

/**
 * The axes that actually move a `:root` document.
 *
 * Density is deliberately absent. `--ds-density-effective-scale` is determined
 * by compiled channels at `:root` -- the artifact is written unlayered and
 * outranks the layered static block that declares the mode factor -- so a
 * per-density root document would report values the browser never paints. The
 * density dial stays a runtime factor the consumer applies, exactly as a
 * resolved motion recipe hands the renderer numbers and lets it apply the dials.
 */
export interface TokenEmissionEnvironment {
  readonly mode: TokenEmissionMode;
  /** The `rem` denominator. Declared, never guessed from a viewport. */
  readonly rootFontSizePx: number;
}

/**
 * Everything the document's identity needs that a `ThemeCompilation` does not
 * carry.
 *
 * The lowering product has no vertical, no slug, no engine, no digest and no
 * compiler version -- "scope belongs to emission", and the version owner sits
 * above the emission tier and cannot be imported downward. The tenant artifact
 * format already takes exactly this shape for exactly this reason; a second
 * projection of the same compile takes it too rather than inventing the fields.
 */
export interface ThemeTokenProvenance {
  /** Stamped by the caller; the version owner sits ABOVE the emission tier. */
  readonly compilerVersion: string;
  /** The same digest the CSS artifact banner carries. */
  readonly digest: string;
}

export interface ThemeTokenIdentity extends ThemeTokenProvenance {
  readonly vertical: FirstPartyVerticalId;
  readonly slug: string;
  readonly engine: EngineName;
}

export interface ThemeTokenDocument extends ThemeTokenIdentity {
  readonly formatVersion: 1;
  readonly environment: TokenEmissionEnvironment;
  readonly tokens: Readonly<Record<TokenChannelName, ThemeTokenLeaf>>;
  /** Never silently dropped: a refusal is recorded, not omitted. */
  readonly unresolved: readonly UnresolvedToken[];
}

export type ThemeTokenLeaf =
  | {
      readonly kind: "color";
      readonly srgb: readonly [number, number, number];
      readonly alpha: number;
    }
  | {
      readonly kind: "length";
      readonly value: number;
      readonly unit: "px" | "rem" | "em" | "%";
    }
  | { readonly kind: "time"; readonly ms: number }
  | { readonly kind: "number"; readonly value: number }
  | { readonly kind: "angle"; readonly deg: number }
  | { readonly kind: "keyword"; readonly value: string }
  | { readonly kind: "css"; readonly css: string; readonly reason: CssTypedLeafReason };

export type UnresolvedTokenReason =
  | "missing"
  | "cycle"
  | "guaranteed-invalid"
  | "depth"
  | "unevaluable"
  | "unit-mix";

export interface UnresolvedToken {
  readonly channel: TokenChannelName;
  readonly reason: UnresolvedTokenReason;
  /** The immediate property that sank it, when one is nameable. */
  readonly cause: TokenChannelName | null;
}

/**
 * The closed roster of value types with no numeric decomposition a non-CSS
 * consumer could act on. A leaf stays CSS-typed for one of these reasons or it
 * is not CSS-typed at all.
 */
export const CSS_TYPED_LEAF_REASONS = Object.freeze([
  "shadow-list",
  "gradient",
  "filter",
  "transition-shorthand",
  "font-family-stack",
  "transform",
] as const);
export type CssTypedLeafReason = (typeof CSS_TYPED_LEAF_REASONS)[number];

export const UNRESOLVED_TOKEN_REASONS = Object.freeze([
  "missing",
  "cycle",
  "guaranteed-invalid",
  "depth",
  "unevaluable",
  "unit-mix",
] as const);

export const TOKEN_EMISSION_BOUNDS = Object.freeze({
  maxResolutionDepth: 32,
  /**
   * Pinned from the emitter's own first green run across the three first-party
   * verticals, rounded up to the next 0.005, and decrease-only from there. An
   * offline classifier's census is an expected range, not a ceiling.
   */
  maxCssTypedLeafRatio: 0.115,
  /** `gamutMapToSrgb` is a mapping, not an identity. Per 8-bit channel. */
  oklabSrgbChannelTolerance: 1 / 255,
  /** sRGB-space mixes are exact after rounding; no tolerance is granted. */
  srgbChannelTolerance: 0,
} as const);
