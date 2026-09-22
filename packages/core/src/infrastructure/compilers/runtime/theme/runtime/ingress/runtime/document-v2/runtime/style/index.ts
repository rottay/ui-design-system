/**
 * @fileoverview The style station: resolve the reference a document names,
 * validate the VALUES it carries, underlay what is still absent, and say which
 * leaves the style ended up causing.
 *
 * WHY THE VALUES ARE CHECKED HERE. Every value check in the theme path reads
 * the TENANT's decisions: the document contract closes the tenant's key sets,
 * the generated schema closes the tenant's domains, and the publish terminal's
 * envelope refusal walks the tenant's document. A style enters after
 * projection, so without this station its values would reach the patch with no
 * domain check, no registry check and no envelope check at all -- a style
 * declaring `shape.radius-scale: 9` would compile.
 *
 * It lives in the ingress rather than with the style contract for two
 * independently sufficient reasons: the contract owner cannot import the
 * generated schema (it is under `infrastructure/**`, which the catalog fence
 * forbids) and cannot import the vertical envelopes either (they are its
 * unranked peer). This owner already holds both edges.
 *
 * NOTHING IS CLAMPED, HERE OR ANYWHERE. A style is authored content inherited
 * by many tenants, so it sits on the refuse side of the line between "the
 * tenant asked for something this vertical forbids" and "this vertical narrows
 * a default". A clamped style leaf would carry a ledger entry saying the style
 * owns it while the effective value is neither the style's nor anyone's.
 *
 * @module Compilers/Theme/Ingress/Runtime/DocumentV2/Runtime/Style
 * @category Compilers
 * @package @rottay/design-system
 */

import {
  EXPRESSIVE_AXIS_KEYS,
  THEME_DECISION_IDS,
  type ThemeDecisionId,
  type ThemePlan,
} from "@/contracts/theme/foundation/decisions";
import type { TenantThemeDocumentVersioned } from "@/contracts/theme/presentation/document";
import {
  TENANT_THEME_VERTICAL_ENVELOPES,
  getTenantThemeVerticalEnvelope,
} from "@/contracts/theme/runtime/envelopes";
import {
  ThemeStyleReferenceError,
  resolveThemeStyle,
  themeStyleClearanceIssues,
  type ThemeStyleEnvelope,
  type ThemeStyleRecord,
  type ThemeStyleReference,
} from "@/contracts/theme/runtime/styles";
import { assertThemeDecisionDomains } from "@/infrastructure/compilers/kernel/foundation/schemas/tenant-theme/decisions";
import { assertExpressiveOverrides } from "@/foundation/tokens/ts/presentation/expressive-profiles";
import { validateRecipeProfileSelection } from "@/foundation/tokens/ts/presentation/recipe-profiles";
import { themeControl } from "@/contracts/theme/runtime/catalog";
import type { FirstPartyVerticalId } from "@/foundation/contracts/kernel/verticals";
import type {
  TenantThemeDocument,
  TenantThemeValidationIssue,
  TenantThemeVerticalEnvelope,
} from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import type { ThemeLayerPatch } from "@/foundation/contracts/composition/tenants/themes/iso";
import { documentThemePatch } from "../../../../foundation/document-patch";
import { styleProvenanceClaim } from "../../../../foundation/provenance";
import type { DecisionProvenanceClaim } from "@/foundation/contracts/composition/tenants/themes/provenance";
import { projectDecisionsToV1 } from "../../foundation/projection";

/** What the station answers with when a document names a style. */
export interface StyleAdmission {
  readonly ref: ThemeStyleReference;
  readonly record: ThemeStyleRecord;
  /** The effective document, style leaves underlaid where nothing filled them. */
  readonly document: TenantThemeDocument;
  /** ONE entry, at `preset-inherited`, over the leaves the underlay wrote. */
  readonly claim: DecisionProvenanceClaim<ThemeDecisionId>;
}

/**
 * Admit the style a document names, or refuse it by name.
 *
 * ORDER IS LOAD-BEARING. The underlay runs on the document the profile
 * expansion has ALREADY filled, and fills only what is still absent, because
 * the expansion fills only fields that are `=== undefined`: underlaying first
 * would make the expansion never fire for any row the style supplied, so the
 * ledger would report `profile-derived` beating `preset-inherited` while the
 * effective document carried the style's value. The two answers would disagree
 * silently, on exactly the axis the rank law exists to settle.
 */
export function admitStyle(input: {
  readonly vertical: FirstPartyVerticalId;
  readonly plan: ThemePlan;
  readonly style: ThemeStyleReference;
  /** The document after projection AND profile expansion. */
  readonly document: TenantThemeDocument;
  /** A caller-narrowed envelope, where the door carries one. */
  readonly ranges?: TenantThemeVerticalEnvelope["ranges"];
}): StyleAdmission {
  const record = resolveThemeStyle(input.style);
  assertStyleAdmitsVertical(record, input.vertical);
  assertStyleValues(record);
  assertStyleClears(record, input.vertical, input.ranges);

  const written = new Map<ThemeDecisionId, unknown>();
  let document = input.document;
  for (const id of THEME_DECISION_IDS) {
    const value = record.document.decisions[id];
    if (value === undefined) continue;
    const underlaid = underlayRow(document, input.plan, id, value);
    if (underlaid === document) continue;
    document = underlaid;
    written.set(id, value);
  }
  return {
    ref: record.ref as ThemeStyleReference,
    record,
    document,
    claim: styleProvenanceClaim({
      ref: record.ref,
      authoredValue: record.document.decisions,
      written,
    }),
  };
}

/**
 * The style's Theme-space patch, for the draft door's `carriedFrom`.
 *
 * It is NOT the underlay: the underlay writes v1 document keypaths and a
 * `carriedFrom` is a `Theme`. The patch is produced by running the style's
 * decisions through the SAME projection and the SAME `documentThemePatch` the
 * admission uses, so a draft measures against exactly the baseline the compile
 * door will produce.
 */
export function styleThemePatch(input: {
  readonly vertical: FirstPartyVerticalId;
  readonly plan: ThemePlan;
  readonly style: ThemeStyleReference;
}): ThemeLayerPatch {
  const record = resolveThemeStyle(input.style);
  assertStyleAdmitsVertical(record, input.vertical);
  assertStyleValues(record);
  assertStyleClears(record, input.vertical);
  return documentThemePatch({
    vertical: input.vertical,
    document: projectStyle(input.plan, record.document.decisions),
  });
}

/** The v1 projection of a decision map, through the one projection owner. */
function projectStyle(
  plan: ThemePlan,
  decisions: Partial<Record<ThemeDecisionId, unknown>>
): TenantThemeDocument {
  return projectDecisionsToV1({
    version: 2,
    plan,
    decisions,
  } as TenantThemeDocumentVersioned).v1;
}

/**
 * Write one style row into the document wherever it is STILL absent.
 *
 * Same `=== undefined` discipline, at the same v1 keypaths, through the same
 * projection the tenant's own decisions take -- no second keypath table, and
 * the projection owns none either. Returns the input by identity when the row
 * wrote nothing, which is what tells the caller the style did not cause it.
 */
function underlayRow(
  document: TenantThemeDocument,
  plan: ThemePlan,
  id: ThemeDecisionId,
  value: unknown
): TenantThemeDocument {
  const projected = projectStyle(plan, { [id]: value });
  const merged = fillAbsent(
    document as unknown as Record<string, unknown>,
    projected as unknown as Record<string, unknown>,
    ["schemaVersion", "mode"]
  );
  return merged === null
    ? document
    : (merged as unknown as TenantThemeDocument);
}

/**
 * A structural fill: copy every leaf of `source` the `target` does not have.
 *
 * `null` is the answer for "nothing to write", so an underlay that changed
 * nothing is distinguishable from one that wrote an identical value.
 */
function fillAbsent(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
  skip: readonly string[] = []
): Record<string, unknown> | null {
  let next: Record<string, unknown> | null = null;
  for (const [key, value] of Object.entries(source)) {
    if (skip.includes(key) || value === undefined) continue;
    const held = target[key];
    if (isRecord(value)) {
      // A branch the document already holds as a SCALAR is the tenant's answer
      // at that keypath, whatever shape the style states there. Descending into
      // it would replace a value with a subtree, which is a write, not a fill.
      if (held !== undefined && !isRecord(held)) continue;
      const child = fillAbsent(isRecord(held) ? held : {}, value);
      if (child === null) continue;
      next ??= { ...target };
      next[key] = child;
      continue;
    }
    if (held !== undefined) continue;
    next ??= { ...target };
    next[key] = value;
  }
  return next;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * A style declares which verticals may inherit it, and a vertical it excluded
 * may not select it.
 *
 * The exclusion is the remedy for a MEASURED functional incompatibility -- a
 * dial the vertical's envelope refuses -- so a tenant on that vertical naming
 * the style is naming content its own envelope would not admit. Refusing here
 * rather than letting the clearance below fail is what makes the refusal name
 * the decision (`this style is not published for you`) instead of a dial.
 */
function assertStyleAdmitsVertical(
  record: ThemeStyleRecord,
  vertical: FirstPartyVerticalId
): void {
  const { verticals } = record.manifest;
  if (verticals === "all") return;
  if ((verticals as readonly string[]).includes(vertical)) return;
  const reason = record.manifest.exclusionReasons?.[vertical];
  throw new ThemeStyleReferenceError(
    `style ${JSON.stringify(record.manifest.id)} is not published for ${vertical}; ` +
      `it declares ${(verticals as readonly string[]).join(" | ")}` +
      (reason ? ` (${reason})` : "")
  );
}

/**
 * The VALUES a style carries, against the same owners a tenant's own values
 * answer to, plus the four rows the generated schema deliberately skips.
 */
function assertStyleValues(record: ThemeStyleRecord): void {
  const decisions = record.document.decisions as Record<string, unknown>;
  const name = JSON.stringify(record.manifest.id);
  assertThemeDecisionDomains(decisions);
  assertExpressiveOverrides(
    decisions["profiles.expressive"],
    '$.style.decisions["profiles.expressive"]'
  );
  assertRecordKeys(name, decisions, "motion.dial");
  assertRecordKeys(name, decisions, "chrome.anatomy");
  assertExpressiveAxisKeys(name, decisions["profiles.expressive"]);
  const recipe = decisions["recipe-profile"];
  if (recipe !== undefined) {
    // The catalog names `RECIPE_PROFILE_REGISTRY`, which has no export
    // anywhere; the real authority is the recipe-profile registry's own
    // validator, so membership resolves against it rather than against a name.
    const verdict = validateRecipeProfileSelection(recipe as string);
    if (!verdict.ok) {
      throw new ThemeStyleReferenceError(
        `style ${name} sets recipe-profile ${JSON.stringify(recipe)}, which is ${verdict.reason}`
      );
    }
  }
}

/** A `record` row reaches only the keys the catalog declares for it. */
function assertRecordKeys(
  name: string,
  decisions: Record<string, unknown>,
  id: ThemeDecisionId
): void {
  const value = decisions[id];
  if (value === undefined) return;
  const domain = themeControl(id).domain;
  if (domain.kind !== "record") return;
  if (!isRecord(value)) {
    throw new ThemeStyleReferenceError(
      `style ${name} sets ${JSON.stringify(id)} to ${JSON.stringify(value)}; it is a record of ${domain.keys.join(" | ")}`
    );
  }
  for (const key of Object.keys(value)) {
    if ((domain.keys as readonly string[]).includes(key)) continue;
    throw new ThemeStyleReferenceError(
      `style ${name} sets ${JSON.stringify(id)}.${key}, which the catalog does not declare; its keys are ${domain.keys.join(" | ")}`
    );
  }
}

/** The expressive axes are the registry's; an unknown axis is refused by name. */
function assertExpressiveAxisKeys(name: string, value: unknown): void {
  if (!isRecord(value)) return;
  for (const axis of Object.keys(value)) {
    if ((EXPRESSIVE_AXIS_KEYS as readonly string[]).includes(axis)) continue;
    throw new ThemeStyleReferenceError(
      `style ${name} sets profiles.expressive.${axis}, which is not an expressive axis; the axes are ${EXPRESSIVE_AXIS_KEYS.join(" | ")}`
    );
  }
}

/**
 * The envelope clearance, in both its forms.
 *
 * STATIC: the style must clear every vertical its manifest declares -- the
 * intersection of their ranges -- because a style is published once and
 * inherited by all of them. A style that cannot is refused rather than narrowed:
 * the remedy is to exclude that vertical with a written D-28 reason, which is
 * what makes the exclusion mechanism a real one.
 *
 * REQUEST-TIME: a caller that hands a publish terminal a NARROWED envelope
 * hands the same one here, and that envelope is unknowable at publication time.
 * The refusal it earns is emitted in the SAME shape and code
 * `envelopeDialIssues` emits, so preview and publish refuse it identically.
 */
function assertStyleClears(
  record: ThemeStyleRecord,
  vertical: FirstPartyVerticalId,
  ranges?: TenantThemeVerticalEnvelope["ranges"]
): void {
  const declared = declaredEnvelopes(record);
  const issues = themeStyleClearanceIssues({
    styleId: record.manifest.id,
    document: record.document,
    envelopes: declared,
  });
  if (issues.length > 0) {
    throw new ThemeStyleReferenceError(issues[0].message);
  }
  if (ranges === undefined) return;
  const narrowed = themeStyleClearanceIssues({
    styleId: record.manifest.id,
    document: record.document,
    envelopes: [{ verticalKey: vertical, ranges }],
  });
  if (narrowed.length === 0) return;
  throw new ThemeStyleValidationError(
    narrowed.map((issue) => ({
      code: "invalid_value" as const,
      path: `$.style.decisions[${JSON.stringify(issue.decision)}]`,
      message: `Value exceeds the ${issue.verticalKey} envelope`,
    }))
  );
}

/** The envelopes a publication declares it must clear, `"all"` or a list. */
function declaredEnvelopes(record: ThemeStyleRecord): ThemeStyleEnvelope[] {
  const verticals =
    record.manifest.verticals === "all"
      ? (Object.keys(TENANT_THEME_VERTICAL_ENVELOPES) as FirstPartyVerticalId[])
      : record.manifest.verticals;
  return verticals.flatMap((verticalKey) => {
    const envelope = getTenantThemeVerticalEnvelope(verticalKey);
    return envelope
      ? [
          {
            verticalKey,
            ranges: envelope.ranges,
            allowAnatomyVariants: envelope.advanced?.allowAnatomyVariants,
          },
        ]
      : [];
  });
}

/**
 * A request-time style refusal, carrying the issue list a door contracted for.
 *
 * It is not `TenantThemeValidationError`: that owner lives in the publish
 * terminal, which this door sits BELOW. The terminal re-raises it as its own,
 * so preview and publish emit the identical issue.
 */
export class ThemeStyleValidationError extends Error {
  readonly issues: readonly TenantThemeValidationIssue[];

  constructor(issues: readonly TenantThemeValidationIssue[]) {
    super(issues.map((issue) => `${issue.path}: ${issue.message}`).join("; "));
    this.name = "ThemeStyleValidationError";
    this.issues = issues;
  }
}
