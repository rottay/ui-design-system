/**
 * @fileoverview DATED ADAPTER (2026-09-05) — decisions to today's keypaths.
 *
 * DELETED BY: WO-DER-06 (real derivation) and WO-CAT-02 (typed catalog with
 * per-decision fan-out). A dated exception to the single-path rule without a
 * work order that deletes it is not accepted.
 *
 * It projects the decisions onto the v1 authoring shape and hands that shape to
 * the same `migrateV1` the persisted transport uses, so it derives no channel
 * and adds no second compiler. A decision with no v1 keypath is reported unlit.
 *
 * @module Compilers/Theme/Ingress/Runtime/DocumentV2/Foundation/Adapter
 * @category Compilers
 * @package @rottay/design-system
 */

import type { TenantAppearanceGeneral } from "@/foundation/contracts/composition/tenants/themes";
import type {
  TenantThemeAdvancedDocument,
  TenantThemeChrome,
  TenantVisualFoundation,
} from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import { TENANT_THEME_SCHEMA_VERSION } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import {
  CHROME_ANATOMY_FAMILIES,
  PALETTE_SEED_ROLES,
  TenantThemeDocumentV2Error,
  THEME_DECISION_IDS,
  THEME_DECISION_TIER_BY_ID,
  TYPOGRAPHY_FAMILY_ROLES,
  type ThemeDecisionId,
  type ThemeDecisionTier,
  type ThemeDecisions,
} from "@/foundation/contracts/composition/tenants/themes/tenant-theme/decision-document";
import type { TenantThemeDocumentV2 } from "@/foundation/contracts/composition/tenants/themes/tenant-theme/decision-document";
import { FONT_PACK_MANIFEST } from "@/foundation/tokens/css/foundation/typography/font-packs/manifest";

/** Why an activated decision moved nothing. */
export type UnlitReason = "no-keypath-today" | "role-has-no-keypath-today";

export interface DecisionProjection {
  id: ThemeDecisionId;
  tier: ThemeDecisionTier;
  /** True when this activation contributed at least one v1 keypath. */
  lit: boolean;
  reason?: UnlitReason;
  /** The v1 keypath this activation wrote, for the admission report. */
  keypaths: readonly string[];
}

type Bag = Record<string, unknown>;
type SeedRole = (typeof PALETTE_SEED_ROLES)[number];
type AnatomyFamily = (typeof CHROME_ANATOMY_FAMILIES)[number];

interface ProjectionTarget { general: Bag; advanced: Bag; visualFoundation: Bag }

/**
 * The 19 kept decisions, the v1 keypath each one owns TODAY, and the write. A
 * row absent from this table is one of the ten the kit marks `(new)`.
 */
const ADAPTER_TABLE: ReadonlyArray<
  readonly [
    ThemeDecisionId,
    string,
    (target: ProjectionTarget, value: unknown) => boolean,
  ]
> = Object.freeze([
  ["palette.seeds", "general.palette", (t, v) => writeSeeds(t, v)],
  ["palette.status-seeds", "general.palette.status", (t, v) => wrote(nest(t.general, "palette").status = v)],
  ["palette.dark-mode", "general.palette.backgroundMode", (t, v) => wrote(nest(t.general, "palette").backgroundMode = v)],
  ["typography.pairing", "general.typography.typePairing", (t, v) => wrote(nest(t.general, "typography").typePairing = v)],
  ["typography.scale", "general.typography.scale", (t, v) => wrote(nest(t.general, "typography").scale = v)],
  ["shape.radius-scale", "general.shape.radiusScale", (t, v) => wrote(nest(t.general, "shape").radiusScale = v)],
  ["shape.button-style", "general.shape.buttonStyle", (t, v) => wrote(nest(t.general, "shape").buttonStyle = v)],
  ["density.mode", "general.density", (t, v) => wrote(t.general.density = v)],
  ["spacing.rhythm", "general.rhythm", (t, v) => wrote(t.general.rhythm = v)],
  ["motion.dial", "general.motion", (t, v) => wrote(t.general.motion = v)],
  ["surfaces.elevation-posture", "general.surfaces.elevation", (t, v) => wrote(nest(t.general, "surfaces").elevation = v)],
  ["surfaces.effect-intensity", "general.surfaces.effectIntensity", (t, v) => wrote(nest(t.general, "surfaces").effectIntensity = v)],
  ["navigation.sidebar-tone", "general.navigation.sidebarTone", (t, v) => wrote(nest(t.general, "navigation").sidebarTone = v)],
  ["experience.profile", "general.experienceProfile", (t, v) => wrote(t.general.experienceProfile = v)],
  ["profiles.expressive", "advanced.profiles", (t, v) => wrote(t.advanced.profiles = v)],
  ["responsive.posture", "advanced.responsivePosture", (t, v) => wrote(t.advanced.responsivePosture = v)],
  ["recipe-profile", "recipeProfile", (t, v) => wrote(t.visualFoundation.recipeProfile = v)],
  ["chrome.anatomy", "advanced.chrome.*.anatomy", (t, v) => writeAnatomy(t, v)],
  ["typography.families", "general.typography", writeFamilies],
]);

/** Every table writer returns "did this write a keypath"; these always do. */
function wrote(_: unknown): boolean {
  return true;
}

// `general.palette` also accepts inks, borders, status, the mode and per-mode
// seeds, so row 1 is read seed by seed: the v1 object is wider than the decision.
function writeSeeds(target: ProjectionTarget, value: unknown): boolean {
  assertClosedKeys("palette.seeds", value, PALETTE_SEED_ROLES);
  const bag = value as Partial<Record<SeedRole, unknown>>;
  const seeds = Object.entries({
    primary: bag.primary, secondary: bag.secondary,
    accent: bag.accent, background: bag.background,
  } satisfies Record<SeedRole, unknown>).filter(([, s]) => s !== undefined);
  const palette = nest(target.general, "palette");
  for (const [role, seed] of seeds) palette[role] = seed;
  return seeds.length > 0;
}

// The door owns the key sets; repeating the refusal here means a direct caller
// of `projectDecisionsToV1` cannot bypass it.
function assertClosedKeys(
  id: string,
  value: unknown,
  allowed: readonly string[]
): void {
  for (const key of Object.keys(value as Bag)) {
    if (!allowed.includes(key)) {
      throw new TenantThemeDocumentV2Error(
        `unsupported key "${key}" in decision "${id}"`
      );
    }
  }
}

function nest(host: Bag, key: string): Bag {
  if (host[key] === undefined) host[key] = {};
  return host[key] as Bag;
}

function writeAnatomy(target: ProjectionTarget, value: unknown): boolean {
  assertClosedKeys("chrome.anatomy", value, CHROME_ANATOMY_FAMILIES);
  const bag = value as Partial<Record<AnatomyFamily, unknown>>;
  const families = Object.entries({
    cardComponent: bag.cardComponent, table: bag.table,
    sidebar: bag.sidebar, layout: bag.layout,
  } satisfies Record<AnatomyFamily, unknown>).filter(([, v]) => v !== undefined);
  const chrome = nest(target.advanced, "chrome");
  for (const [f, variant] of families) nest(chrome, f).anatomy = variant;
  return families.length > 0;
}

/**
 * The two typography roles v1's general transport can carry. `display` and
 * `mono` are registered but have no keypath, so they are reported unlit rather
 * than routed through the raw `--ds-font-family-*` allowlist D-03 retires.
 */
const V1_TYPOGRAPHY_ROLE_FIELDS: Readonly<Record<string, string>> =
  Object.freeze({ base: "fontFamilyBase", heading: "fontFamilyHeading" });

function writeFamilies(target: ProjectionTarget, value: unknown): boolean {
  assertClosedKeys("typography.families", value, TYPOGRAPHY_FAMILY_ROLES);
  const typography = nest(target.general, "typography");
  let written = false;
  for (const [role, packId] of Object.entries(value as Bag)) {
    if (packId === undefined) continue;
    const entry = FONT_PACK_MANIFEST[packId as keyof typeof FONT_PACK_MANIFEST];
    if (!entry) {
      throw new TenantThemeDocumentV2Error(
        `unsupported fontPackId ${JSON.stringify(packId)} for role "${role}"`
      );
    }
    // `display` and `mono` are registered roles with no v1 keypath: unlit, not
    // unknown. An unknown role never reaches here; the door refuses it.
    const field = V1_TYPOGRAPHY_ROLE_FIELDS[role];
    if (!field) continue;
    // The DB document validator (`isSafeFontFamily`) admits exactly the bare
    // reference, so the projection emits the one grammar both doors accept.
    typography[field] = `var(${entry.variable})`;
    written = true;
  }
  return written;
}

/**
 * Projects a validated v2 document onto a v1 ADVANCED document: the only v1
 * shape that carries `recipeProfile`, `profiles`, `responsivePosture` and
 * chrome. A decisions-only document lowers identically through either mode.
 */
export function projectDecisionsToV1(document: TenantThemeDocumentV2): {
  v1: TenantThemeAdvancedDocument;
  projections: readonly DecisionProjection[];
} {
  const decisions = document.decisions as Partial<ThemeDecisions>;
  const target: ProjectionTarget = {
    general: {},
    advanced: {},
    visualFoundation: {},
  };
  const written = new Map<ThemeDecisionId, string>();

  for (const [id, keypath, write] of ADAPTER_TABLE) {
    const value = decisions[id];
    if (value === undefined) continue;
    if (!write(target, value)) continue;
    written.set(id, keypath);
  }

  if (document.overrides?.chrome) {
    const chrome = nest(target.advanced, "chrome");
    for (const [family, fields] of Object.entries(document.overrides.chrome)) {
      chrome[family] = { ...(chrome[family] as Bag), ...(fields as object) };
    }
  }

  const visualFoundation = target.visualFoundation as TenantVisualFoundation;
  if (Object.keys(target.general).length > 0) {
    visualFoundation.general = target.general as TenantAppearanceGeneral;
  }
  if (Object.keys(target.advanced).length > 0) {
    visualFoundation.advanced = target.advanced as {
      chrome?: TenantThemeChrome;
    };
  }

  const projections: DecisionProjection[] = THEME_DECISION_IDS.filter(
    (id) => decisions[id] !== undefined
  ).map((id) => {
    const keypath = written.get(id);
    return {
      id,
      tier: THEME_DECISION_TIER_BY_ID[id],
      lit: keypath !== undefined,
      ...(keypath === undefined
        ? {
            reason:
              id === "typography.families"
                ? ("role-has-no-keypath-today" as UnlitReason)
                : ("no-keypath-today" as UnlitReason),
          }
        : {}),
      keypaths: keypath === undefined ? [] : [keypath],
    };
  });

  return {
    v1: {
      schemaVersion: TENANT_THEME_SCHEMA_VERSION,
      mode: "advanced",
      visualFoundation,
    },
    projections,
  };
}

/** The v1 keypath a decision owns today, or `undefined` for the ten new rows. */
export function v1KeypathOf(id: ThemeDecisionId): string | undefined {
  return ADAPTER_TABLE.find((row) => row[0] === id)?.[1];
}
