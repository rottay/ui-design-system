/**
 * @fileoverview The v2 publication adapter: a decision document compiles to an
 * artifact WITHOUT being flattened to v1 first.
 *
 * Until this owner existed the artifact terminal spoke v1 only, so a stored v2
 * row had exactly two routes to a compiled artifact and both lost something the
 * admission needs: `hydrateTenantThemeConfig` refused it by schema version, and
 * projecting it to a flat v1 document dropped the `plan` the tier station is
 * judged against together with the raw identity of every selection. This
 * adapter keeps both. It runs the SAME door, the SAME lowering and the SAME
 * artifact assembly as `compileTenantTheme`; what it adds is a v2 entry and the
 * provenance the v1 transport has no field to carry.
 *
 * @module Compilers/TenantTheme/DocumentV2
 * @category Compilers
 * @package @rottay/design-system
 */

import {
  TenantThemeDocumentV2Error,
  isTenantThemeDocumentV2,
  type TenantThemeDocumentV2,
} from "@/contracts/theme/presentation/document";
import { ThemeDecisionDomainError } from "@/infrastructure/compilers/kernel/foundation/schemas/tenant-theme/decisions";
import { themeControl } from "@/contracts/theme/runtime/catalog";
import { THEME_DECISION_IDS } from "@/contracts/theme/foundation/decisions";
import { getTenantThemeVerticalEnvelope } from "@/contracts/theme/runtime/envelopes";
import type { TenantAppearanceGeneral } from "@/foundation/contracts/composition/tenants/themes";
import type { DecisionProvenanceLedger } from "@/foundation/contracts/composition/tenants/themes/provenance";
import type {
  TenantThemeArtifact,
  TenantThemeConfigIdentity,
  TenantThemeVerticalEnvelope,
} from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import type { FirstPartyVerticalId } from "@/foundation/contracts/kernel/verticals";
import { assertTenantIdentityAllowed } from "@/foundation/tokens/ts/presentation/brand-themes";
import { isFirstPartyVerticalId } from "@/foundation/tokens/ts/presentation/brand-themes";
import {
  ThemeAdmissionError,
  documentThemeAdmission,
  documentThemePatch,
  type DocumentAdmission,
} from "@/infrastructure/compilers/runtime/theme";
import { projectDecisionsToV1 } from "@/infrastructure/compilers/runtime/theme/runtime/ingress";
import { expandProfileDefaults } from "@/infrastructure/compilers/runtime/theme/runtime/ingress/foundation/profile-expansion";
import {
  TenantThemeValidationError,
  assembleTenantThemeArtifact,
} from "..";
import {
  ENVELOPE_RANGED_DIALS,
  envelopeDialIssues,
  envelopeShapeIssues,
  type EnvelopeRangedDial,
} from "../foundation/envelope";
import { documentV2Ledger } from "./foundation/ledger";

export interface CompileTenantThemeDocumentV2Input {
  /** The persisted v2 document; v1 belongs to `compileTenantTheme`. */
  readonly document: TenantThemeDocumentV2;
  /** Artifact identity a ThemeIntent does not carry; the digest is over it. */
  readonly tenantId: string;
  readonly slug: string;
  readonly verticalKey: FirstPartyVerticalId;
  readonly rowVersion: number;
  /** As on `compileTenantThemeConfig`: the roster resolves the default. */
  readonly verticalEnvelope?: TenantThemeVerticalEnvelope;
}

export interface TenantThemeDocumentV2Compilation {
  /** The artifact, provenance metadata included and inside its digest. */
  readonly artifact: TenantThemeArtifact;
  /** The door's own report, so a surface never re-derives what it answered. */
  readonly admission: DocumentAdmission;
  /** The effective ledger; it also travels inside the artifact. */
  readonly ledger: DecisionProvenanceLedger;
}

function refuse(code: "invalid_value" | "unsupported_schema_version", path: string, message: string): never {
  throw new TenantThemeValidationError([{ code, path, message }]);
}

/**
 * Which decision authors each ranged dial, read off the catalog's own document
 * keypath so a refusal names what the tenant wrote rather than the v1 field the
 * projection happened to write it to.
 */
const DECISION_BY_DIAL: ReadonlyMap<EnvelopeRangedDial, string> = new Map(
  THEME_DECISION_IDS.flatMap((id) => {
    const keypath = themeControl(id).keypath.document;
    if (keypath === null || !keypath.startsWith("appearance.general.")) return [];
    const tail = keypath.slice("appearance.general.".length);
    const brace = tail.match(/^(.*)\{([^}]*)\}(.*)$/);
    const fields = brace
      ? brace[2].split(",").map((member) => `${brace[1]}${member.trim()}${brace[3]}`)
      : [tail];
    return fields
      .filter((field): field is EnvelopeRangedDial =>
        (ENVELOPE_RANGED_DIALS as readonly string[]).includes(field)
      )
      .map((field): [EnvelopeRangedDial, string] => [field, id]);
  })
);

function dialPath(dial: EnvelopeRangedDial): string {
  const id = DECISION_BY_DIAL.get(dial);
  return id ? `$.decisions[${JSON.stringify(id)}]` : `$.document.${dial}`;
}

/**
 * The ranged dials this document AUTHORS, in the v1 general shape the envelope
 * law reads. A record decision states its dials as members, so the dial's own
 * keypath is what locates the value in both spaces.
 */
function authoredDials(
  document: TenantThemeDocumentV2
): TenantAppearanceGeneral {
  const decisions = document.decisions as Record<string, unknown>;
  const general: Record<string, unknown> = {};
  for (const dial of ENVELOPE_RANGED_DIALS) {
    const id = DECISION_BY_DIAL.get(dial);
    if (id === undefined) continue;
    const authored = decisions[id];
    if (authored === undefined) continue;
    const [group, field] = dial.split(".");
    const value =
      typeof authored === "object" && authored !== null
        ? (authored as Record<string, unknown>)[field]
        : authored;
    if (value === undefined) continue;
    const host = (general[group] ??= {}) as Record<string, unknown>;
    host[field] = value;
  }
  return general as TenantAppearanceGeneral;
}

/**
 * Publish a v2 document.
 *
 * Refusals keep their owners. A domain, tier or cap rejection is the DOOR's and
 * propagates by its own name and issue path, because a route that catches
 * `ThemeAdmissionError` for a preview must catch the identical error for the
 * publish of the same document. Only an untyped throw out of the lowering is
 * translated, into one named document issue, so a caller never receives a 500
 * where it contracted for an issue list.
 */
export function compileTenantThemeDocumentV2(
  input: CompileTenantThemeDocumentV2Input
): TenantThemeDocumentV2Compilation {
  if (!isTenantThemeDocumentV2(input.document)) {
    refuse(
      "unsupported_schema_version",
      "$.document.version",
      "Only TenantThemeDocument version 2 is supported"
    );
  }
  if (!isFirstPartyVerticalId(input.verticalKey)) {
    refuse(
      "invalid_value",
      "$.verticalKey",
      "No first-party ISO theme is registered for this vertical"
    );
  }
  const verticalEnvelope =
    input.verticalEnvelope ?? getTenantThemeVerticalEnvelope(input.verticalKey);
  if (!verticalEnvelope) {
    refuse(
      "invalid_value",
      "$.verticalKey",
      "No code-owned vertical theme envelope is registered"
    );
  }
  if (typeof input.tenantId !== "string" || input.tenantId.length === 0) {
    refuse("invalid_value", "$.tenantId", "Expected a non-empty tenant id");
  }
  if (!Number.isSafeInteger(input.rowVersion) || input.rowVersion < 0) {
    refuse("invalid_value", "$.rowVersion", "Expected a non-negative integer row version");
  }
  assertTenantIdentityAllowed({
    slug: input.slug,
    verticalKey: input.verticalKey,
  });

  const identity: TenantThemeConfigIdentity = {
    tenantId: input.tenantId,
    slug: input.slug,
    verticalKey: input.verticalKey,
    rowVersion: input.rowVersion,
  };
  // The envelope option is the v1 terminal's, so its law has to be the v1
  // terminal's too: an envelope that cannot say what it permits -- wrong shape,
  // unknown version, another vertical's policy, malformed ranges -- is refused
  // here exactly as `compileTenantTheme` refuses it, and a DIRECTLY authored
  // dial outside it is refused by name rather than narrowed. Only a profile's
  // default is narrowed, which the expansion station does. The v1 authoring
  // mode is not among these answers: a decision document does not carry one.
  const envelopeIssues = envelopeShapeIssues(verticalEnvelope, {
    verticalKey: input.verticalKey,
  });
  if (envelopeIssues.length > 0) {
    throw new TenantThemeValidationError(envelopeIssues);
  }
  const authoredIssues = envelopeDialIssues({
    general: authoredDials(input.document),
    ranges: verticalEnvelope.ranges,
    verticalKey: input.verticalKey,
    pathOf: dialPath,
  });
  if (authoredIssues.length > 0) {
    throw new TenantThemeValidationError(authoredIssues);
  }

  try {
    // ONE admission. The intent it returns carries the document's plan, so the
    // tier station judges the publish exactly as it judges the preview; the
    // report it returns is the same one the editor was shown.
    const { intent, admission } = documentThemeAdmission({
      vertical: input.verticalKey,
      slug: input.slug,
      document: input.document,
    });
    // ONE expansion per publish, run by the terminal that publishes -- the same
    // ingress station and the same envelope ranges `compileTenantTheme` runs,
    // over the door's own projection rather than a shape rebuilt here. The door
    // itself does not expand: it belongs to the R1 lot in flight, so the
    // effective document it will one day report is derived here meanwhile.
    const expansion = expandProfileDefaults({
      vertical: input.verticalKey,
      document: projectDecisionsToV1(input.document).v1,
      ranges: verticalEnvelope.ranges,
    });
    const ledger = documentV2Ledger({
      document: input.document,
      admission,
      profileClaims: expansion.claims,
    });
    // The ledger travels ON the intent and nowhere else: `resolveTheme` is the
    // owner that holds the catalog, so it is the only place a stated tier can
    // be checked against the one the catalog declares. The patch is re-lowered
    // from the effective document only when the expansion actually filled
    // something; otherwise the door's own patch is already that document's.
    const { artifact } = assembleTenantThemeArtifact({
      intent: {
        ...intent,
        ...(expansion.claims.length > 0
          ? {
              patch: documentThemePatch({
                vertical: input.verticalKey,
                document: expansion.document,
              }),
            }
          : {}),
        ledger,
      },
      identity,
      verticalEnvelope,
      document: expansion.document,
    });
    return { artifact, admission, ledger };
  } catch (error) {
    // A named refusal from the door carries its own issue path already, and a
    // route that catches it for a preview must catch the identical error for
    // the publish of the same document. Only the lowering's untyped throws are
    // translated below.
    if (
      error instanceof TenantThemeValidationError ||
      error instanceof ThemeAdmissionError ||
      error instanceof ThemeDecisionDomainError ||
      error instanceof TenantThemeDocumentV2Error
    ) {
      throw error;
    }
    refuse(
      "invalid_value",
      "$.document",
      `Rejected by the ISO Theme lowering: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
