/**
 * @fileoverview Built-in vertical preset registry — first-party Rottay
 * presets bundled with the DS.
 *
 * @description
 * Contains preset definitions for the three first-party Rottay products
 * (`evnto`, `bithire`, `rottay`). Each vertical captures the full
 * personality, engine preference, and surface defaults for a product
 * domain.
 *
 * WHAT THIS REGISTRY IS NOT. It used to carry a `suggestedPalette` per
 * vertical, and all seven of those seed colours disagreed with the shipped
 * BrandTheme: evnto seeded orange/cyan against a black/sand editorial theme,
 * bithire seeded purple against a blue theme, platform seeded indigo against
 * a white-on-dark one. Nothing consumed the field, so the disagreement was
 * invisible — but it made this file a second colour authority that a future
 * reader could reasonably have believed. Colour comes from the BrandTheme
 * source and nowhere else; this registry owns personality, engine posture and
 * surface defaults only.
 *
 * These are **bundled defaults**, not the only verticals the DS supports.
 * Custom verticals can be registered at runtime via the open-ended
 * `VerticalKey = string & {}` type so product teams can introduce new
 * verticals without waiting for a DS release. The three presets here
 * exist because Rottay's own apps use them and they serve as documented
 * baselines for testing, Storybook, and CI.
 *
 * Personality values are sourced from:
 * - Product profiles: `runtime/product-profiles/registry.ts`
 * - Tenant configs: `runtime/tenant/foundation/configuration/registry/`
 *
 * The vertical personality represents the "industry baseline" that sits
 * between `DEFAULT_PERSONALITY` and the product profile in the merge
 * chain.
 */

import type { FirstPartyVerticalId, VerticalKey } from "@/foundation/contracts/kernel/verticals";
import type { VerticalPreset } from "@/foundation/contracts/composition/tenants";

import { BITHIRE_PRESET_SOURCE } from "./bithire";
import { EVNTO_PRESET_SOURCE } from "./evnto";
import { ROTTAY_PRESET_SOURCE } from "./rottay";

/**
 * The manifest beside a vertical's decision document: its provenance and the
 * written reason of every sanctioned override, keyed by chrome path
 * (`chrome.<family>.<channel>`). Closed: a leaf without a reason and a reason
 * without a leaf are both refused by `preset-without-derivable-values`.
 */
export interface VerticalThemePresetManifest {
  readonly workOrder: string;
  readonly vertical: FirstPartyVerticalId;
  /** The vertical seat of the kit, never a customer plan. */
  readonly plan: "internal";
  readonly publishedOn: string;
  readonly provenance: Readonly<Record<string, string>>;
  readonly overrideReasons: Readonly<Record<string, string>>;
}

/**
 * A first-party vertical as DECISIONS (WO-DER-06). The document stays
 * `unknown` at this tier on purpose -- its type lives in `contracts/`, which
 * `foundation/` may not reach -- and is validated by the door every other
 * origin takes.
 */
export interface VerticalThemePreset {
  readonly vertical: FirstPartyVerticalId;
  readonly plan: "internal";
  readonly document: unknown;
  readonly manifest: VerticalThemePresetManifest;
}

const FIRST_PARTY_THEME_VERTICALS: readonly FirstPartyVerticalId[] = ["rottay", "bithire", "evnto"];

function defineVerticalThemePreset(source: { readonly document: unknown; readonly manifest: unknown }): VerticalThemePreset {
  const manifest = source.manifest as VerticalThemePresetManifest;
  if (!FIRST_PARTY_THEME_VERTICALS.includes(manifest.vertical)) {
    throw new Error(
      `[design-system] vertical theme preset names ${JSON.stringify(manifest.vertical)}, which is not a first-party vertical`
    );
  }
  if (manifest.plan !== "internal") {
    throw new Error(
      `[design-system] vertical theme preset ${manifest.vertical} must sit on the internal seat, not plan ${JSON.stringify(manifest.plan)}`
    );
  }
  return Object.freeze({ vertical: manifest.vertical, plan: manifest.plan, document: source.document, manifest });
}

/**
 * The three first-party verticals as DECISIONS: one v2 document per vertical,
 * on the internal seat, with every sanctioned override carrying a written
 * reason. BitHire is the provisional WO-DER-07 pick; rottay and evnto are
 * structural-neutral until their identity program.
 */
export const VERTICAL_THEME_PRESETS: Readonly<Record<FirstPartyVerticalId, VerticalThemePreset>> =
  Object.freeze({
    rottay: defineVerticalThemePreset(ROTTAY_PRESET_SOURCE),
    bithire: defineVerticalThemePreset(BITHIRE_PRESET_SOURCE),
    evnto: defineVerticalThemePreset(EVNTO_PRESET_SOURCE),
  });

export function getVerticalThemePreset(key: VerticalKey): VerticalThemePreset | undefined {
  return (VERTICAL_THEME_PRESETS as Readonly<Record<string, VerticalThemePreset>>)[key];
}

/**
 * Registry of all known vertical presets.
 *
 * Values are intentionally derived from the existing product profiles and
 * tenant configurations that have been battle-tested across the three
 * Rottay applications.
 *
 * Verticals are the DS-owned fallback layer for domains. Real tenants should
 * reference these presets, not duplicate them one by one.
 */
export const VERTICAL_REGISTRY: Readonly<Record<string, VerticalPreset>> = {
  /**
   * Evnto - Event management platform
   *
   * Derived from: events.organizer product profile + evnto tenant personality
   * Personality: expressive, slideUp entrance, spring physics, comfortable layout
   */
  evnto: {
    key: "evnto",
    label: "Evnto",
    description:
      "Event management vertical with expressive animations, comfortable layout, and live-status presentation.",
    engine: "modern",
    motionProfile: "expressive",
    density: "comfortable",
    defaultProductProfile: "events.organizer",
    features: ["events", "ticketing", "check-in", "analytics"],
    surfaceDefaults: {
      listView: "table",
      density: "comfortable",
      schedulerView: "week",
    },
  },

  /**
   * BitHire - Tech recruitment platform
   *
   * Derived from: recruiting.operator product profile + bithire tenant personality
   * Personality: editorial, fade entrance, no spring, comfortable people-first layout
   */
  bithire: {
    key: "bithire",
    label: "BitHire",
    description:
      "Recruiting vertical with editorial aesthetics, comfortable density, and people-first workflows.",
    engine: "modern",
    motionProfile: "calm",
    density: "comfortable",
    defaultProductProfile: "recruiting.operator",
    features: ["recruiting", "candidates", "interviews", "offers"],
    surfaceDefaults: {
      listView: "table",
      density: "comfortable",
      schedulerView: "week",
    },
  },

  /**
   * Rottay - Admin portal / neutral core baseline
   *
   * Derived from: rottay.admin product profile + rottay tenant personality
   * Personality: neutral, fade entrance, precise animations, compact density
   * Engine: modern is the flagship target; classic remains a supported engine path
   *
   * The key is `rottay`, not `platform`. Slug, registry key and
   * theme id are one fact — see FIRST_PARTY_VERTICAL_ROSTER in
   * `foundation/presets/verticals/roster`. The old `platform` key
   * disagreed with both the `rottay` slug the rules key on and the `rottay`
   * theme id, which is what forced every consumer touching both halves to
   * carry two spellings.
   */
  rottay: {
    key: "rottay",
    label: "Rottay",
    description:
      "Admin vertical with sharp aesthetics, compact density, and operational dashboard defaults.",
    engine: "modern",
    motionProfile: "precise",
    density: "compact",
    defaultProductProfile: "rottay.admin",
    features: ["admin", "settings", "users", "billing"],
    surfaceDefaults: {
      listView: "table",
      density: "compact",
      schedulerView: "month",
    },
  },
};

/**
 * Resolves a vertical preset by key.
 *
 * Returns undefined for unknown keys so callers can decide their own
 * fallback strategy (unlike product profiles which always fall back to
 * a default). Verticals are optional -- the system works fine without one.
 */
export function getVerticalPreset(
  key: VerticalKey
): VerticalPreset | undefined {
  // Unlike product profiles, verticals are optional. Callers can choose to
  // continue without one instead of forcing a DS-owned fallback.
  return VERTICAL_REGISTRY[key];
}
