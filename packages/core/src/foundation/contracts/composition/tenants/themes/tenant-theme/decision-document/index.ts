/**
 * @fileoverview The v2 tenant theme document: `{ version, plan, decisions, overrides? }`.
 *
 * The discriminant is `version`, not v1's `schemaVersion`, so no v1 reader can
 * narrow a v2 payload. v2 admits no raw `--ds-*` override at all (D-03).
 *
 * @module Contracts/Tenants/Themes/TenantTheme/DecisionDocument
 * @category Types
 * @package @rottay/design-system
 */

import {
  CHROME_ANATOMY_FAMILIES,
  EXPRESSIVE_AXIS_KEYS,
  MOTION_DIAL_KEYS,
  PALETTE_SEED_ROLES,
  PALETTE_STATUS_SEED_ROLES,
  TENANT_THEME_FONT_PACK_IDS,
  THEME_DECISION_IDS,
  THEME_DECISION_TIER_BY_ID,
  THEME_PLANS,
  THEME_PLAN_TIERS,
  TYPOGRAPHY_FAMILY_ROLES,
  type SanctionedOverrides,
  type ThemeDecisionId,
  type ThemeDecisions,
  type ThemePlan,
} from "./decisions";
import type { TenantThemeDocument } from "..";

/**
 * The decision contract travels with the document, so a writer needs ONE
 * subpath to name a v2 document and the decisions it may carry.
 */
export * from "./decisions";

/** The only document version this contract introduces. */
export const TENANT_THEME_DOCUMENT_VERSION_V2 = 2 as const;

/** The persisted v2 document. Identity columns stay on the row, as in v1. */
export interface TenantThemeDocumentV2 {
  version: typeof TENANT_THEME_DOCUMENT_VERSION_V2;
  plan: ThemePlan;
  decisions: Partial<ThemeDecisions>;
  overrides?: SanctionedOverrides;
}

/** The v1 union, named so a migration can say which side it is on. */
export type TenantThemeDocumentV1 = TenantThemeDocument;

/**
 * Every document shape the door accepts.
 *
 * `TenantThemeDocument` is deliberately NOT widened to this union: it is the
 * v1 name and ~45 modules narrow it on `schemaVersion`/`mode`. Widening an
 * INPUT position is compatible for every caller; widening the shared alias
 * would not be.
 */
export type TenantThemeDocumentAny =
  | TenantThemeDocumentV1
  | TenantThemeDocumentV2;

/** Refusals carry the offending name, never a generic "invalid document". */
export class TenantThemeDocumentV2Error extends Error {
  constructor(message: string) {
    super(`TenantThemeDocument v2: ${message}`);
    this.name = "TenantThemeDocumentV2Error";
  }
}

/**
 * Structural predicate, on the discriminant alone.
 *
 * Deliberately not a validator: a caller asks "which shape is this" before it
 * asks "is it well formed", and conflating the two is how an invalid v2
 * document ends up being read as v1.
 */
export function isTenantThemeDocumentV2(
  document: unknown
): document is TenantThemeDocumentV2 {
  return (
    typeof document === "object" &&
    document !== null &&
    !Array.isArray(document) &&
    (document as { version?: unknown }).version ===
      TENANT_THEME_DOCUMENT_VERSION_V2
  );
}

const DECISION_ID_SET = new Set<string>(THEME_DECISION_IDS);

/**
 * Validates a v2 document fail-closed and returns it narrowed.
 *
 * Every refusal names what it refused:
 *   1. a `plan` outside {@link THEME_PLANS};
 *   2. a decision id outside the 29 of the kit;
 *   3. a decision whose tier the plan does not entitle (D-02: the plan decides
 *      what the tenant may activate);
 *   4. a key inside a decision's value that the decision does not own -- the
 *      map-valued rows are CLOSED here, so `palette.seeds` cannot smuggle
 *      `foreground`, `border`, `status`, `dark` or `backgroundMode` into the
 *      v1 palette it projects onto;
 *   5. a `fontPackId` outside the registered set;
 *   6. sanctioned overrides under a plan that does not entitle them, and
 *      `anatomy` inside an override, which belongs to `chrome.anatomy`.
 *
 * NUMERIC BOUNDS AND REGISTRY IDS ARE NOT CHECKED HERE. A vertical envelope
 * narrows the numeric ranges and the registries own their ids, so the compiler
 * that consults both clamps and resolves them fail-closed. This validator owns
 * the KEY SETS, which nothing downstream re-derives.
 */
export function assertTenantThemeDocumentV2(
  document: unknown
): TenantThemeDocumentV2 {
  if (!isTenantThemeDocumentV2(document)) {
    throw new TenantThemeDocumentV2Error(
      `expected \`version: ${TENANT_THEME_DOCUMENT_VERSION_V2}\``
    );
  }
  const candidate = document as unknown as Record<string, unknown>;
  for (const key of Object.keys(candidate)) {
    if (!["version", "plan", "decisions", "overrides"].includes(key)) {
      throw new TenantThemeDocumentV2Error(`unsupported field "${key}"`);
    }
  }
  const plan = candidate.plan;
  if (!THEME_PLANS.includes(plan as ThemePlan)) {
    throw new TenantThemeDocumentV2Error(
      `unsupported plan ${JSON.stringify(plan)}; the enum is ${THEME_PLANS.join(
        " | "
      )}`
    );
  }
  const decisions = candidate.decisions;
  if (
    decisions === null ||
    typeof decisions !== "object" ||
    Array.isArray(decisions)
  ) {
    throw new TenantThemeDocumentV2Error(`\`decisions\` must be an object`);
  }
  const entitled = THEME_PLAN_TIERS[plan as ThemePlan];
  for (const id of Object.keys(decisions)) {
    if (!DECISION_ID_SET.has(id)) {
      throw new TenantThemeDocumentV2Error(
        `unsupported decision "${id}"; the catalog is closed at ${THEME_DECISION_IDS.length} ids`
      );
    }
    const tier = THEME_DECISION_TIER_BY_ID[id as ThemeDecisionId];
    if (!entitled.includes(tier)) {
      throw new TenantThemeDocumentV2Error(
        `decision "${id}" is tier ${tier}; plan ${String(plan)} entitles ${entitled.join(
          " | "
        )}`
      );
    }
    assertDecisionShape(
      id as ThemeDecisionId,
      (decisions as Record<string, unknown>)[id]
    );
  }
  const overrides = candidate.overrides;
  if (overrides !== undefined) {
    if (
      overrides === null ||
      typeof overrides !== "object" ||
      Array.isArray(overrides)
    ) {
      throw new TenantThemeDocumentV2Error(`\`overrides\` must be an object`);
    }
    for (const key of Object.keys(overrides)) {
      if (key !== "chrome") {
        throw new TenantThemeDocumentV2Error(
          `unsupported override group "${key}"; D-03 sanctions \`chrome.<family>.<channel>\` only`
        );
      }
    }
    const chrome = (overrides as { chrome?: unknown }).chrome;
    assertNoRawChannelNames(chrome, "overrides.chrome");
    assertOverrideEntitlement(chrome, plan as ThemePlan);
  }
  return document;
}

/**
 * The map-valued decisions, and the exact keys each one owns.
 *
 * Every row here projects onto a v1 object whose own schema is WIDER than the
 * decision: `general.palette` also accepts `foreground`, `border`, `status`,
 * `backgroundMode` and `dark`. Copying an untrusted decision value into it
 * without this table is how a Standard `palette.seeds` authors inks, borders
 * and the Pro mode selection under another decision's name.
 */
const DECISION_KEY_SETS: Partial<
  Record<ThemeDecisionId, readonly string[]>
> = Object.freeze({
  "palette.seeds": PALETTE_SEED_ROLES,
  "palette.status-seeds": PALETTE_STATUS_SEED_ROLES,
  "typography.families": TYPOGRAPHY_FAMILY_ROLES,
  "motion.dial": MOTION_DIAL_KEYS,
  "profiles.expressive": EXPRESSIVE_AXIS_KEYS,
  "chrome.anatomy": CHROME_ANATOMY_FAMILIES,
});

/** What a key that is not the decision's own most likely belongs to. */
const KEY_REDIRECTS: Readonly<Record<string, string>> = Object.freeze({
  foreground: "inks are derived from the seeds (kit rows 1, 4), never authored",
  border: "borders are derived from the seeds (kit rows 1, 4), never authored",
  status: 'status seeds are the `palette.status-seeds` decision (kit row 2)',
  backgroundMode: 'the mode is the `palette.dark-mode` decision (kit row 5)',
  dark: "per-mode seeds enter as per-mode SanctionedOverrides, which the kit has not opened yet (kit row 5)",
  anatomy: 'anatomy is the `chrome.anatomy` decision (kit row 28)',
});

function shapeRefusal(id: ThemeDecisionId, key: string): never {
  const redirect = KEY_REDIRECTS[key];
  throw new TenantThemeDocumentV2Error(
    `unsupported key "${key}" in decision "${id}"` +
      (redirect ? `; ${redirect}` : "")
  );
}

/**
 * Closes one decision's value against the keys it owns.
 *
 * Scalar rows have no shape to close: their domain is an enum or a number and
 * belongs to the compiler and the vertical envelope.
 */
function assertDecisionShape(id: ThemeDecisionId, value: unknown): void {
  const allowed = DECISION_KEY_SETS[id];
  if (!allowed) return;
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new TenantThemeDocumentV2Error(
      `decision "${id}" must be an object of ${allowed.join(" | ")}`
    );
  }
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) shapeRefusal(id, key);
  }
  if (id === "typography.families") assertFontPackIds(value);
}

/**
 * Row 6 is a REGISTERED domain, so an unknown pack is refused here by name.
 *
 * The adapter reads the pack manifest to project a font reference; without this
 * an unregistered id reached it as an undefined manifest entry and the door
 * failed with a TypeError instead of telling the writer which ids exist.
 */
function assertFontPackIds(families: object): void {
  for (const [role, packId] of Object.entries(families)) {
    if (packId === undefined) continue;
    if (!TENANT_THEME_FONT_PACK_IDS.includes(packId as never)) {
      throw new TenantThemeDocumentV2Error(
        `unsupported fontPackId ${JSON.stringify(packId)} for role "${role}"; ` +
          `the registered packs are ${TENANT_THEME_FONT_PACK_IDS.join(" | ")}`
      );
    }
  }
}

/**
 * Sanctioned overrides are Pro (kit section 3), and never carry an anatomy.
 *
 * The migration lifts `anatomy` out of chrome into the `chrome.anatomy`
 * decision; letting it back in through the override path would give one control
 * two owners and route a Pro row past the plan check.
 */
function assertOverrideEntitlement(chrome: unknown, plan: ThemePlan): void {
  if (chrome === null || typeof chrome !== "object" || Array.isArray(chrome)) {
    if (chrome !== undefined) {
      throw new TenantThemeDocumentV2Error(
        "`overrides.chrome` must be an object of `<family>.<channel>`"
      );
    }
    return;
  }
  const families = Object.keys(chrome);
  if (families.length === 0) return;
  // Anatomy is refused BEFORE the tier gate: it is wrong under every plan, and
  // a Pro tenant would otherwise be told nothing while a Standard one was told
  // only that its plan is too low.
  for (const family of families) {
    const fields = (chrome as Record<string, unknown>)[family];
    if (
      fields !== null &&
      typeof fields === "object" &&
      !Array.isArray(fields) &&
      Object.prototype.hasOwnProperty.call(fields, "anatomy")
    ) {
      throw new TenantThemeDocumentV2Error(
        `unsupported key "anatomy" in overrides.chrome.${family}; ${KEY_REDIRECTS.anatomy}`
      );
    }
  }
  if (!THEME_PLAN_TIERS[plan].includes("pro")) {
    throw new TenantThemeDocumentV2Error(
      `sanctioned overrides are tier pro; plan ${plan} entitles ${THEME_PLAN_TIERS[
        plan
      ].join(" | ")}`
    );
  }
}

/**
 * D-03 enforced structurally, at every depth.
 *
 * The type already forbids a `--ds-*` key, but a document arrives as untrusted
 * JSON from a database row: the type protects the author, this walk protects
 * against the row. A raw channel name is refused with the exact path it was
 * found at, so the writer is told which key to remove.
 */
function assertNoRawChannelNames(value: unknown, path: string): void {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    if (key.startsWith("--")) {
      throw new TenantThemeDocumentV2Error(
        `raw channel "${key}" at ${path}; v2 accepts no \`--ds-*\` override (D-03)`
      );
    }
    assertNoRawChannelNames(child, `${path}.${key}`);
  }
}

/** The decisions a document activates, in kit row order. */
export function activatedDecisionIds(
  document: TenantThemeDocumentV2
): readonly ThemeDecisionId[] {
  return THEME_DECISION_IDS.filter(
    (id) => document.decisions[id] !== undefined
  );
}
