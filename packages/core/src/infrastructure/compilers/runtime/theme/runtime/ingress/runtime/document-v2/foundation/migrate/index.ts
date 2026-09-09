/**
 * @fileoverview `migrate v1 -> v2`: total, and fail-closed by name.
 *
 * TOTAL means DEFINED ON EVERY v1 DOCUMENT: each one either becomes a v2
 * document or is refused with the exact field that could not be carried. It
 * does NOT mean every v1 field survives, and it does NOT re-derive v1's own
 * schema: a key v1 never declared is dropped here and refused by the lowering,
 * which is where that refusal already lives and is asserted by this owner's
 * tests. Two v1 surfaces have no v2 counterpart by decision, not by omission:
 *
 *   - `advanced.tokenOverrides` — raw `--ds-*` authorship, retired by D-03. A
 *     token whose value IS a decision (a brand seed, a status seed, the effect
 *     dial) is carried as that decision; every other token is refused by its
 *     own name, because silently dropping it would change a published tenant's
 *     paint without telling anyone.
 *   - `palette.dark` — per-mode seeds. The kit admits per-mode adjustment only
 *     as per-mode `SanctionedOverrides`, which do not exist yet, so a document
 *     carrying dark seeds is refused rather than flattened into the light ones.
 *
 * THE PLAN IS DERIVED, NEVER GUESSED. A v1 row carries no plan, so the
 * migration computes the MINIMUM plan that entitles what the document actually
 * activates: `standard` unless a Pro-tier decision or a sanctioned override is
 * present, in which case `pro`. A migration that defaulted to `pro` would grant
 * an entitlement the row never had.
 *
 * @module Compilers/Theme/Ingress/Runtime/DocumentV2/Foundation/Migrate
 * @category Compilers
 * @package @rottay/design-system
 */

import type { TenantAppearanceGeneral } from "@/foundation/contracts/composition/tenants/themes";
import type {
  TenantThemeAdvancedAppearance,
  TenantThemeChrome,
  TenantThemeDocument,
  TenantVisualFoundation,
} from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import {
  CHROME_ANATOMY_FAMILIES,
  THEME_DECISION_TIER_BY_ID,
  type ThemeDecisionId,
  type ThemeDecisions,
  type ThemePlan,
} from "@/contracts/theme/presentation/document";
import {
  TENANT_THEME_DOCUMENT_VERSION_V2,
  assertTenantThemeDocumentV2,
  type SanctionedOverrides,
  type TenantThemeDocumentV2,
} from "@/contracts/theme/presentation/document";
import { ThemePatchMigrationError } from "../../../../foundation/document-patch";

/**
 * The v1 raw tokens that ARE a decision, and which one.
 *
 * Deliberately short. A token is on this list only when the decision it feeds
 * carries the same meaning at the same granularity; a token that merely
 * touches the same family is refused, because "close enough" is how a
 * migration quietly repaints a live tenant.
 */
const TOKEN_TO_SEED: Readonly<
  Record<string, readonly ["seeds" | "status", string]>
> = Object.freeze({
  "--ds-color-primary": ["seeds", "primary"],
  "--ds-color-secondary": ["seeds", "secondary"],
  "--ds-color-accent": ["seeds", "accent"],
  "--ds-color-bg-primary": ["seeds", "background"],
  "--ds-color-bg": ["seeds", "background"],
  "--ds-color-background": ["seeds", "background"],
  "--ds-color-success": ["status", "success"],
  "--ds-color-warning": ["status", "warning"],
  "--ds-color-error": ["status", "error"],
  "--ds-color-info": ["status", "info"],
});

/** The anatomy families, read from the contract that owns them (F-70). */
const ANATOMY_FAMILIES = CHROME_ANATOMY_FAMILIES;

function generalOf(document: TenantThemeDocument): TenantAppearanceGeneral | undefined {
  return document.mode === "simple"
    ? document.appearance
    : document.visualFoundation?.general;
}

function foundationOf(
  document: TenantThemeDocument
): TenantVisualFoundation | undefined {
  return document.mode === "advanced" ? document.visualFoundation : undefined;
}

function migrateGeneralDecisions(
  general: TenantAppearanceGeneral | undefined,
  decisions: Partial<ThemeDecisions>,
  refuse: (reason: string) => void
): void {
  if (!general) return;
  const palette = general.palette;
  if (palette) {
    if (palette.dark !== undefined) {
      refuse(
        "v1 general.palette.dark has no v2 counterpart; per-mode seeds enter as " +
          "per-mode SanctionedOverrides, which the kit has not opened yet"
      );
    }
    const seeds = {
      primary: palette.primary,
      secondary: palette.secondary,
      accent: palette.accent,
      background: palette.background,
    };
    if (Object.values(seeds).some((value) => value !== undefined)) {
      decisions["palette.seeds"] = prune(seeds);
    }
    if (palette.status) decisions["palette.status-seeds"] = prune(palette.status);
    if (palette.backgroundMode) {
      decisions["palette.dark-mode"] = palette.backgroundMode;
    }
    for (const key of ["foreground", "border"] as const) {
      if (palette[key] !== undefined) {
        refuse(
          `v1 general.palette.${key} has no v2 counterpart; inks and borders are ` +
            "derived from the seeds, never authored (kit rows 1 and 4)"
        );
      }
    }
  }
  const typography = general.typography;
  if (typography) {
    if (typography.typePairing) {
      decisions["typography.pairing"] = typography.typePairing;
    }
    if (typography.scale !== undefined) {
      decisions["typography.scale"] = typography.scale;
    }
    for (const key of ["fontFamilyBase", "fontFamilyHeading"] as const) {
      if (typography[key] !== undefined) {
        refuse(
          `v1 general.typography.${key} has no v2 counterpart; row 6 closes the ` +
            "domain to a registered fontPackId, never a free stack"
        );
      }
    }
  }
  if (general.shape?.buttonStyle) {
    decisions["shape.button-style"] = general.shape.buttonStyle;
  }
  if (general.shape?.radiusScale !== undefined) {
    decisions["shape.radius-scale"] = general.shape.radiusScale;
  }
  if (general.density) decisions["density.mode"] = general.density;
  if (general.rhythm) decisions["spacing.rhythm"] = general.rhythm;
  if (general.motion) decisions["motion.dial"] = general.motion;
  if (general.surfaces?.elevation) {
    decisions["surfaces.elevation-posture"] = general.surfaces.elevation;
  }
  if (general.surfaces?.effectIntensity !== undefined) {
    decisions["surfaces.effect-intensity"] = general.surfaces.effectIntensity;
  }
  if (general.navigation?.sidebarTone) {
    decisions["navigation.sidebar-tone"] = general.navigation.sidebarTone;
  }
  if (general.experienceProfile) {
    decisions["experience.profile"] = general.experienceProfile;
  }
}

function migrateTokenOverrides(
  overrides: TenantThemeAdvancedAppearance["tokenOverrides"],
  decisions: Partial<ThemeDecisions>,
  refuse: (reason: string) => void
): void {
  for (const [token, value] of Object.entries(overrides ?? {})) {
    if (value === undefined) continue;
    if (token === "--ds-effect-intensity") {
      decisions["surfaces.effect-intensity"] = Number(value);
      continue;
    }
    const seed = TOKEN_TO_SEED[token];
    if (!seed) {
      refuse(
        `v1 tokenOverride "${token}" has no v2 decision; raw --ds-* authorship is ` +
          "retired by D-03. Express it as a decision, or as a sanctioned " +
          "chrome.<family>.<channel> override"
      );
      continue;
    }
    const [group, role] = seed;
    const id: ThemeDecisionId =
      group === "seeds" ? "palette.seeds" : "palette.status-seeds";
    decisions[id] = { ...(decisions[id] ?? {}), [role]: String(value) } as never;
  }
}

function migrateChrome(
  chrome: TenantThemeChrome | undefined,
  decisions: Partial<ThemeDecisions>,
  refuse: (reason: string) => void
): SanctionedOverrides | undefined {
  if (!chrome) return undefined;
  const anatomy: Record<string, string> = {};
  const remaining: Record<string, unknown> = {};
  for (const [family, fields] of Object.entries(chrome)) {
    if (fields === undefined) continue;
    const { anatomy: variant, ...rest } = fields as Record<string, unknown>;
    if (variant !== undefined) {
      if (ANATOMY_FAMILIES.includes(family as (typeof ANATOMY_FAMILIES)[number])) {
        anatomy[family] = variant as string;
      } else {
        refuse(
          `v1 chrome.${family}.anatomy has no v2 counterpart; row 28 closes the ` +
            `anatomy decision at ${ANATOMY_FAMILIES.join(", ")}`
        );
      }
    }
    if (Object.keys(rest).length > 0) remaining[family] = rest;
  }
  if (Object.keys(anatomy).length > 0) {
    decisions["chrome.anatomy"] = anatomy as ThemeDecisions["chrome.anatomy"];
  }
  return Object.keys(remaining).length > 0
    ? { chrome: remaining as TenantThemeChrome }
    : undefined;
}

function prune<T extends object>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, v]) => v !== undefined)
  ) as T;
}

/** The minimum plan that entitles everything the document activates. */
function minimumPlan(
  decisions: Partial<ThemeDecisions>,
  overrides: SanctionedOverrides | undefined
): ThemePlan {
  if (overrides) return "pro";
  const ids = Object.keys(decisions) as ThemeDecisionId[];
  return ids.some((id) => THEME_DECISION_TIER_BY_ID[id] === "pro")
    ? "pro"
    : "standard";
}

/**
 * What a v1 document expresses in v2 terms, and what it cannot express.
 *
 * Capture and refusal are separated because they answer to different owners:
 * the migration refuses a document it cannot carry whole, while the ingress
 * gate still admits that document and has to record the authorship it DOES
 * carry. Folding them together made one inexpressible field erase every
 * decision the same document authored.
 */
export interface V1DecisionCapture {
  readonly decisions: Partial<ThemeDecisions>;
  readonly overrides: SanctionedOverrides | undefined;
  /** The fields with no v2 counterpart, in traversal order. Never partial. */
  readonly unmigratable: readonly string[];
}

/**
 * Reads every decision a v1 document expresses, and names what it does not.
 *
 * It derives no plan: a plan is an entitlement, and inventing one for a row
 * that never carried it is exactly what D-02 forbids.
 */
export function captureV1Decisions(
  document: TenantThemeDocument
): V1DecisionCapture {
  const unmigratable: string[] = [];
  const refuse = (reason: string): void => {
    unmigratable.push(reason);
  };
  if (document.schemaVersion !== 1) {
    return {
      decisions: {},
      overrides: undefined,
      unmigratable: [`unsupported schemaVersion ${String(document.schemaVersion)}`],
    };
  }
  if (document.mode !== "simple" && document.mode !== "advanced") {
    return {
      decisions: {},
      overrides: undefined,
      unmigratable: ["unsupported document mode"],
    };
  }
  const decisions: Partial<ThemeDecisions> = {};
  migrateGeneralDecisions(generalOf(document), decisions, refuse);

  const foundation = foundationOf(document);
  const advanced = foundation?.advanced;
  migrateTokenOverrides(advanced?.tokenOverrides, decisions, refuse);
  const overrides = migrateChrome(advanced?.chrome, decisions, refuse);
  if (advanced?.profiles) {
    // v1 types every expressive axis as an open `string`. The closed axis
    // vocabularies are re-resolved fail-closed by the expressive-profile
    // registry the compiler already consults, so this migration carries the
    // value rather than becoming a second authority over the same domain.
    decisions["profiles.expressive"] =
      advanced.profiles as ThemeDecisions["profiles.expressive"];
  }
  if (advanced?.responsivePosture) {
    decisions["responsive.posture"] =
      advanced.responsivePosture as ThemeDecisions["responsive.posture"];
  }
  if (foundation?.recipeProfile) {
    decisions["recipe-profile"] = foundation.recipeProfile;
  }
  return { decisions, overrides, unmigratable };
}

/**
 * Migrates one v1 document to v2, or refuses it by name.
 *
 * The result is re-validated STRUCTURALLY through
 * {@link assertTenantThemeDocumentV2}: version, plan, ids, tiers, decision key
 * sets, override entitlement and the D-03 walk. That is not a compile: a
 * migration is only proven against the lowering by admitting it, which
 * `migrateAndAdmitDocument` in the admission owner does and its tests assert
 * byte-for-byte against the v1 original.
 */
export function migrateDocumentV1ToV2(
  document: TenantThemeDocument
): TenantThemeDocumentV2 {
  const { decisions, overrides, unmigratable } = captureV1Decisions(document);
  if (unmigratable.length > 0) {
    throw new ThemePatchMigrationError(unmigratable[0]);
  }
  return assertTenantThemeDocumentV2({
    version: TENANT_THEME_DOCUMENT_VERSION_V2,
    plan: minimumPlan(decisions, overrides),
    decisions,
    ...(overrides ? { overrides } : {}),
  });
}
