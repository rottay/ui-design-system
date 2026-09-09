/**
 * @fileoverview The common profile-expansion station: one expansion of a
 * selected experience profile into effective document fields, before either
 * preview or publication reads a single authorship fact off the document.
 *
 * The artifact terminal used to run this expansion privately, on a REPLACEMENT
 * document it built for itself, while the preview producer sent the profile
 * selection alone. One stored document therefore compiled to two different
 * results depending on which door it entered (RT05): publication added the
 * profile's fonts, `--ds-motion-intensity` and `--ds-radius-scale`; preview
 * showed the tenant none of them.
 *
 * What this station writes is a DEFAULT, never an authorship fact: every field
 * it fills is claimed as `profile-derived` by the selection that caused it, so
 * a Standard tenant that selects a profile can never be judged as having
 * authored the Pro decisions those defaults happen to touch (I-P0, I-T4).
 *
 * @module Compilers/Theme/Ingress/Foundation/ProfileExpansion
 * @category Compilers
 * @package @rottay/design-system
 */

import type { TenantAppearanceGeneral } from "@/foundation/contracts/composition/tenants/themes";
import type { TenantThemeDocument } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import type { FirstPartyVerticalId } from "@/foundation/contracts/kernel/verticals";
import type { DecisionProvenanceClaim } from "@/foundation/contracts/composition/tenants/themes/provenance";
import type { ThemeDecisionId } from "@/contracts/theme/foundation/decisions";
import { themeControl } from "@/contracts/theme/runtime/catalog";
import { getTenantThemeVerticalEnvelope } from "@/contracts/theme/runtime/envelopes";
import {
  resolveExpressiveAxes,
  sanitizeExpressiveOverrides,
} from "@/foundation/tokens/ts/presentation/expressive-profiles";
import { expandExpressiveProfiles } from "@/foundation/tokens/ts/presentation/expressive-profiles/expansion";
import { THEME_DECISION_DOMAIN_SCHEMA } from "@/infrastructure/compilers/kernel/foundation/schemas/tenant-theme/decisions";
import {
  EXPRESSIVE_FIELD_DEFAULT_KEYS,
  applyExpressiveFieldDefaults,
  type ExpressiveClampRanges,
  type ExpressiveFieldDefaultKey,
} from "./foundation/field-defaults";

export interface ProfileExpansionInput {
  readonly vertical: FirstPartyVerticalId;
  /** The v1 authoring shape both transports reach the lowering through. */
  readonly document: TenantThemeDocument;
  /**
   * The clamp bounds a profile default may not cross. Omitted, the station
   * reads the vertical's registered envelope, which is the same law the
   * artifact terminal applies.
   */
  readonly ranges?: ExpressiveClampRanges;
}

export interface ProfileExpansion {
  /** The effective document; the SAME reference when nothing was filled. */
  readonly document: TenantThemeDocument;
  readonly general: TenantAppearanceGeneral | undefined;
  /** What the expansion filled, as `profile-derived` provenance claims. */
  readonly claims: readonly DecisionProvenanceClaim<ThemeDecisionId>[];
}

/** Which decision a filled field belongs to, and the member it fills. */
const DECISION_BY_FIELD: Readonly<
  Record<ExpressiveFieldDefaultKey, ThemeDecisionId>
> = Object.freeze({
  typePairing: "typography.pairing",
  buttonStyle: "shape.button-style",
  radiusScale: "shape.radius-scale",
  density: "density.mode",
  "motion.intensity": "motion.dial",
  "motion.durationScale": "motion.dial",
  "motion.ambient": "motion.dial",
  elevation: "surfaces.elevation-posture",
});

/**
 * The Theme-space leaves a decision writes, read from the catalog keypath and
 * from no second table. A `{a,b}` row states one leaf per member.
 */
function brandThemeLeaves(id: ThemeDecisionId): readonly string[] {
  const keypath = themeControl(id).keypath.brandTheme;
  if (keypath === null) return [];
  const brace = keypath.match(/^(.*)\{([^}]*)\}(.*)$/);
  return brace
    ? brace[2]
        .split(",")
        .map((member) => `${brace[1]}${member.trim()}${brace[3]}`)
    : [keypath];
}

/** The v1 transport path of a defaultable field, from the catalog column. */
function documentPathOf(
  document: TenantThemeDocument,
  field: ExpressiveFieldDefaultKey
): string {
  const keypath = themeControl(DECISION_BY_FIELD[field]).keypath.document;
  const root =
    document.mode === "simple" ? "$.appearance" : "$.visualFoundation.general";
  if (keypath === null) return `${root}.${field}`;
  const tail = keypath.replace(/^appearance\.general\./u, "");
  const brace = tail.match(/^(.*)\{[^}]*\}(.*)$/);
  return brace
    ? `${root}.${brace[1]}${field.slice(field.indexOf(".") + 1)}${brace[2]}`
    : `${root}.${tail}`;
}

/**
 * Why a SUPPLIED value the row's closed vocabulary does not admit may not be
 * defaulted over, or `undefined` when every supplied field is admissible.
 *
 * Present is not truthy: a station that read `""`, `null`, `false` or `0` as
 * "unset" replaced the tenant's own value with the profile's, so a preview
 * painted what publication refused at the identical keypath. Ranged dials are
 * deliberately absent -- their bounds are the vertical envelope's to refuse by
 * name, and this station must not pre-empt that owner. The door refuses; this
 * owner only measures, because a station below the door does not throw its
 * refusals.
 */
export function authoredFieldRefusal(
  document: TenantThemeDocument
): string | undefined {
  const general = generalOf(document);
  for (const field of EXPRESSIVE_FIELD_DEFAULT_KEYS) {
    const value = valueOf(general, field);
    if (value === undefined) continue;
    const id = DECISION_BY_FIELD[field];
    const domain = THEME_DECISION_DOMAIN_SCHEMA[id];
    if (domain?.kind !== "enum") continue;
    if (domain.values.includes(value as string)) continue;
    return (
      `${documentPathOf(document, field)} ${JSON.stringify(value)} is outside ` +
      `the "${id}" domain ${domain.values.join(" | ")}; a profile default ` +
      "fills an ABSENT field, never a supplied one"
    );
  }
  return undefined;
}

function leafOf(field: ExpressiveFieldDefaultKey): string {
  const leaves = brandThemeLeaves(DECISION_BY_FIELD[field]);
  const member = field.includes(".") ? field.slice(field.indexOf(".") + 1) : "";
  const leaf = member
    ? leaves.find((candidate) => candidate.endsWith(`.${member}`))
    : leaves[0];
  if (!leaf) {
    throw new Error(
      `profile expansion: the catalog states no Theme keypath for ${JSON.stringify(
        field
      )}`
    );
  }
  return leaf;
}

function valueOf(
  general: TenantAppearanceGeneral | undefined,
  field: ExpressiveFieldDefaultKey
): unknown {
  switch (field) {
    case "typePairing":
      return general?.typography?.typePairing;
    case "buttonStyle":
      return general?.shape?.buttonStyle;
    case "radiusScale":
      return general?.shape?.radiusScale;
    case "density":
      return general?.density;
    case "motion.intensity":
      return general?.motion?.intensity;
    case "motion.durationScale":
      return general?.motion?.durationScale;
    case "motion.ambient":
      return general?.motion?.ambient;
    case "elevation":
      return general?.surfaces?.elevation;
  }
}

function generalOf(
  document: TenantThemeDocument
): TenantAppearanceGeneral | undefined {
  return document.mode === "simple"
    ? document.appearance
    : document.visualFoundation.general;
}

function withGeneral(
  document: TenantThemeDocument,
  general: TenantAppearanceGeneral | undefined
): TenantThemeDocument {
  if (document.mode === "simple") {
    return { ...document, appearance: general ?? {} };
  }
  return {
    ...document,
    visualFoundation: {
      ...document.visualFoundation,
      ...(general ? { general } : {}),
    },
  };
}

/**
 * Fill the fields a selected experience profile defaults, once, for every
 * door.
 *
 * Idempotent by construction: the underlying application only writes a field
 * the tenant left empty, so a document that already carries its profile's
 * defaults comes back by identity with no claims.
 */
export function expandProfileDefaults(
  input: ProfileExpansionInput
): ProfileExpansion {
  const general = generalOf(input.document);
  const axes = resolveExpressiveAxes(
    general?.experienceProfile,
    sanitizeExpressiveOverrides(
      input.document.mode === "advanced"
        ? input.document.visualFoundation.advanced?.profiles
        : undefined
    )
  );
  const { fieldDefaults } = expandExpressiveProfiles(axes);
  const ranges =
    input.ranges ?? getTenantThemeVerticalEnvelope(input.vertical)?.ranges;
  const applied = applyExpressiveFieldDefaults(general, fieldDefaults, ranges);
  if (applied.general === general) {
    return { document: input.document, general, claims: [] };
  }

  const byDecision = new Map<ThemeDecisionId, ExpressiveFieldDefaultKey[]>();
  for (const field of applied.filled) {
    const id = DECISION_BY_FIELD[field];
    const fields = byDecision.get(id);
    if (fields) fields.push(field);
    else byDecision.set(id, [field]);
  }
  const claims = [...byDecision].map(([id, fields]) => ({
    ref: { kind: "decision", id } as const,
    provenance: "profile-derived" as const,
    authoredValue:
      fields.length === 1
        ? valueOf(applied.general, fields[0])
        : Object.fromEntries(
            fields.map((field) => [
              field.slice(field.indexOf(".") + 1),
              valueOf(applied.general, field),
            ])
          ),
    leaves: fields.map((field) => ({
      leaf: leafOf(field),
      specificity: "expansion-derived" as const,
    })),
  }));

  return {
    document: withGeneral(input.document, applied.general),
    general: applied.general,
    claims,
  };
}
