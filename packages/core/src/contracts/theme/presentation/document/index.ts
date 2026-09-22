/**
 * @fileoverview The v2 tenant theme document: `{ version, plan, decisions, overrides? }`.
 *
 * The discriminant is `version`, not v1's `schemaVersion`, so no v1 reader can
 * narrow a v2 payload. v2 admits no raw `--ds-*` override at all (D-03).
 *
 * @module Contracts/Theme/Document
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
} from "@/contracts/theme/foundation/decisions";
import type { TenantThemeDocument } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import {
  assertThemeStyleReference,
  type ThemeStyleReference,
} from "@/contracts/theme/runtime/styles";

/**
 * The decision contract travels with the document, so a writer needs ONE
 * subpath to name a v2 document and the decisions it may carry.
 */
export * from "@/contracts/theme/foundation/decisions";

/** The decision document without a style reference. */
export const TENANT_THEME_DOCUMENT_VERSION_V2 = 2 as const;

/** The decision document that may NAME a reusable style. */
export const TENANT_THEME_DOCUMENT_VERSION_V3 = 3 as const;

/**
 * Every version this contract reads, in ascending order.
 *
 * A NUMERIC version outside this set is refused by name on every door. The set
 * is stated once here because the alternative -- each door narrowing on its own
 * literal -- is what let a v3 row reach the v1 branch and crash inside a
 * refusal helper with a bare TypeError that named neither the version nor the
 * door.
 */
export const TENANT_THEME_DOCUMENT_VERSIONS = Object.freeze([
  TENANT_THEME_DOCUMENT_VERSION_V2,
  TENANT_THEME_DOCUMENT_VERSION_V3,
] as const);

export type TenantThemeDocumentVersion =
  (typeof TENANT_THEME_DOCUMENT_VERSIONS)[number];

/** The persisted v2 document. Identity columns stay on the row, as in v1. */
export interface TenantThemeDocumentV2 {
  version: typeof TENANT_THEME_DOCUMENT_VERSION_V2;
  plan: ThemePlan;
  decisions: Partial<ThemeDecisions>;
  overrides?: SanctionedOverrides;
}

/**
 * The persisted v3 document: v2 plus the style a tenant inherits.
 *
 * `style` is a REFERENCE and never a body. A style names published, immutable,
 * digest-pinned content; a document that could carry the content would be able
 * to forge a plan it never earned, author brand rows the partition refuses, and
 * make "which style is this tenant on" unanswerable from the row.
 *
 * A v3 document without a `style` is a v2 document with a different version
 * number, which is why the admission gains no second branch for it.
 */
export interface TenantThemeDocumentV3 {
  version: typeof TENANT_THEME_DOCUMENT_VERSION_V3;
  plan: ThemePlan;
  decisions: Partial<ThemeDecisions>;
  overrides?: SanctionedOverrides;
  style?: ThemeStyleReference;
}

/** Either decision document, for a station that reads decisions and a plan. */
export type TenantThemeDocumentVersioned =
  | TenantThemeDocumentV2
  | TenantThemeDocumentV3;

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
  | TenantThemeDocumentV2
  | TenantThemeDocumentV3;

/**
 * Refusals carry the offending name, never a generic "invalid document".
 *
 * The version is part of the prefix where one is known, and absent from the
 * version fork itself: a document whose version is not in the supported set has
 * no version this contract can speak for.
 */
export class TenantThemeDocumentError extends Error {
  constructor(message: string, version?: number) {
    super(
      version === undefined
        ? `TenantThemeDocument: ${message}`
        : `TenantThemeDocument v${version}: ${message}`
    );
    this.name = "TenantThemeDocumentError";
  }
}

/** The v2 refusal, kept as its own name so no existing catch site moves. */
export class TenantThemeDocumentV2Error extends TenantThemeDocumentError {
  constructor(message: string) {
    super(message, TENANT_THEME_DOCUMENT_VERSION_V2);
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
  return versionOf(document) === TENANT_THEME_DOCUMENT_VERSION_V2;
}

/** The same predicate for the version that carries a style. */
export function isTenantThemeDocumentV3(
  document: unknown
): document is TenantThemeDocumentV3 {
  return versionOf(document) === TENANT_THEME_DOCUMENT_VERSION_V3;
}

/**
 * "Is this a DECISION document at all", which is the question every station
 * that narrows away from v1 is really asking.
 *
 * Each of those sites used to spell the question as `version === 2`, so every
 * new version had to find them all. They ask this instead, and the version they
 * then handle is the document's own.
 */
export function isTenantThemeDocumentVersioned(
  document: unknown
): document is TenantThemeDocumentVersioned {
  const version = versionOf(document);
  return (
    version !== undefined &&
    (TENANT_THEME_DOCUMENT_VERSIONS as readonly unknown[]).includes(version)
  );
}

function versionOf(document: unknown): unknown {
  if (document === null || typeof document !== "object" || Array.isArray(document)) {
    return undefined;
  }
  return (document as { version?: unknown }).version;
}

/**
 * The version fork: refuse a NUMERIC version outside the supported set, by
 * name, before any door narrows on a shape.
 *
 * WHY IT IS A SEPARATE STATION. A v1 row carries `schemaVersion` and no
 * `version` at all, so it passes through here untouched and is still read as
 * v1. A row that DOES state a version this reader does not know is a rollout
 * event, and it was measured crashing: two of the ingress doors reached the v1
 * branch and threw a bare `TypeError` out of a private refusal helper, naming
 * neither the version nor the door, while a third misdiagnosed it as
 * `schemaVersion undefined`. Fail-closed held; diagnosability did not.
 *
 * Consulted once, ABOVE the v1 branch inside the single admission, so every
 * caller of that admission -- published or not -- earns the identical refusal
 * from one site rather than from a copy per door.
 */
export function assertSupportedDocumentVersion(document: unknown): void {
  const version = versionOf(document);
  if (typeof version !== "number") return;
  if ((TENANT_THEME_DOCUMENT_VERSIONS as readonly unknown[]).includes(version)) {
    return;
  }
  throw new TenantThemeDocumentError(
    `unsupported version ${JSON.stringify(version)}; the supported set is ${TENANT_THEME_DOCUMENT_VERSIONS.join(
      " | "
    )}`
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
  return assertThemeDocument(document, {
    version: TENANT_THEME_DOCUMENT_VERSION_V2,
    keys: V2_KEYS,
  }) as TenantThemeDocumentV2;
}

/**
 * The v3 document, validated by the SAME body: the only differences a version
 * makes here are the literal it narrows on and the key set it closes.
 */
export function assertTenantThemeDocumentV3(
  document: unknown
): TenantThemeDocumentV3 {
  return assertThemeDocument(document, {
    version: TENANT_THEME_DOCUMENT_VERSION_V3,
    keys: V3_KEYS,
  }) as TenantThemeDocumentV3;
}

/**
 * Validate whichever decision document arrived, on its own version.
 *
 * The version fork runs first, so an out-of-set version is refused by name
 * rather than reported as "expected version 2" against a row that never
 * claimed to be one.
 */
export function assertTenantThemeDocumentVersioned(
  document: unknown
): TenantThemeDocumentVersioned {
  assertSupportedDocumentVersion(document);
  return isTenantThemeDocumentV3(document)
    ? assertTenantThemeDocumentV3(document)
    : assertTenantThemeDocumentV2(document);
}

const V2_KEYS = ["version", "plan", "decisions", "overrides"];
const V3_KEYS = [...V2_KEYS, "style"];

function assertThemeDocument(
  document: unknown,
  contract: { version: TenantThemeDocumentVersion; keys: readonly string[] }
): TenantThemeDocumentVersioned {
  const refuse = (message: string): never => {
    throw contract.version === TENANT_THEME_DOCUMENT_VERSION_V2
      ? new TenantThemeDocumentV2Error(message)
      : new TenantThemeDocumentError(message, contract.version);
  };
  if (versionOf(document) !== contract.version) {
    refuse(`expected \`version: ${contract.version}\``);
  }
  const candidate = document as unknown as Record<string, unknown>;
  for (const key of Object.keys(candidate)) {
    if (!contract.keys.includes(key)) {
      refuse(`unsupported field "${key}"`);
    }
  }
  assertStyleReferenceShape(candidate.style);
  const plan = candidate.plan;
  if (!THEME_PLANS.includes(plan as ThemePlan)) {
    refuse(
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
    throw refuse(`\`decisions\` must be an object`);
  }
  const entitled = THEME_PLAN_TIERS[plan as ThemePlan];
  for (const id of Object.keys(decisions as object)) {
    if (!DECISION_ID_SET.has(id)) {
      refuse(
        `unsupported decision "${id}"; the catalog is closed at ${THEME_DECISION_IDS.length} ids`
      );
    }
    const tier = THEME_DECISION_TIER_BY_ID[id as ThemeDecisionId];
    if (!entitled.includes(tier)) {
      refuse(
        `decision "${id}" is tier ${tier}; plan ${String(plan)} entitles ${entitled.join(
          " | "
        )}`
      );
    }
    assertDecisionShape(
      id as ThemeDecisionId,
      (decisions as Record<string, unknown>)[id],
      refuse
    );
  }
  const overrides = candidate.overrides;
  if (overrides !== undefined) {
    if (
      overrides === null ||
      typeof overrides !== "object" ||
      Array.isArray(overrides)
    ) {
      refuse(`\`overrides\` must be an object`);
    }
    for (const key of Object.keys(overrides as object)) {
      if (key !== "chrome") {
        refuse(
          `unsupported override group "${key}"; D-03 sanctions \`chrome.<family>.<channel>\` only`
        );
      }
    }
    const chrome = (overrides as { chrome?: unknown }).chrome;
    assertNoRawChannelNames(chrome, "overrides.chrome", refuse);
    assertOverrideEntitlement(chrome, plan as ThemePlan, refuse);
  }
  return document as TenantThemeDocumentVersioned;
}

/**
 * A `style` on the transport is a REFERENCE, and the key set is what says so.
 *
 * An inline body (`style: { decisions }`) and a supplied digest are refused by
 * the key they carried, not by their value: the digest is the registry's and is
 * never read from a tenant row, and a body would be a second authority over
 * content the registry owns. Resolution is the ingress's -- the registries own
 * their ids -- and this validator owns the key set, exactly as it does for the
 * decisions above.
 */
export function assertStyleReferenceShape(
  style: unknown
): ThemeStyleReference | undefined {
  if (style === undefined) return undefined;
  return assertThemeStyleReference(style, "style");
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

type DocumentRefusal = (message: string) => never;

function shapeRefusal(
  id: ThemeDecisionId,
  key: string,
  refuse: DocumentRefusal
): never {
  const redirect = KEY_REDIRECTS[key];
  return refuse(
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
function assertDecisionShape(
  id: ThemeDecisionId,
  value: unknown,
  refuse: DocumentRefusal
): void {
  const allowed = DECISION_KEY_SETS[id];
  if (!allowed) return;
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    refuse(`decision "${id}" must be an object of ${allowed.join(" | ")}`);
  }
  for (const key of Object.keys(value as object)) {
    if (!allowed.includes(key)) shapeRefusal(id, key, refuse);
  }
  if (id === "typography.families") assertFontPackIds(value as object, refuse);
}

/**
 * Row 6 is a REGISTERED domain, so an unknown pack is refused here by name.
 *
 * The adapter reads the pack manifest to project a font reference; without this
 * an unregistered id reached it as an undefined manifest entry and the door
 * failed with a TypeError instead of telling the writer which ids exist.
 */
function assertFontPackIds(families: object, refuse: DocumentRefusal): void {
  for (const [role, packId] of Object.entries(families)) {
    if (packId === undefined) continue;
    if (!TENANT_THEME_FONT_PACK_IDS.includes(packId as never)) {
      refuse(
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
function assertOverrideEntitlement(
  chrome: unknown,
  plan: ThemePlan,
  refuse: DocumentRefusal
): void {
  if (chrome === null || typeof chrome !== "object" || Array.isArray(chrome)) {
    if (chrome !== undefined) {
      refuse("`overrides.chrome` must be an object of `<family>.<channel>`");
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
      refuse(
        `unsupported key "anatomy" in overrides.chrome.${family}; ${KEY_REDIRECTS.anatomy}`
      );
    }
  }
  if (!THEME_PLAN_TIERS[plan].includes("pro")) {
    refuse(
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
function assertNoRawChannelNames(
  value: unknown,
  path: string,
  refuse: DocumentRefusal
): void {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    if (key.startsWith("--")) {
      refuse(
        `raw channel "${key}" at ${path}; v2 accepts no \`--ds-*\` override (D-03)`
      );
    }
    assertNoRawChannelNames(child, `${path}.${key}`, refuse);
  }
}

/** The decisions a document activates, in kit row order. */
export function activatedDecisionIds(
  document: TenantThemeDocumentVersioned
): readonly ThemeDecisionId[] {
  return THEME_DECISION_IDS.filter(
    (id) => document.decisions[id] !== undefined
  );
}
