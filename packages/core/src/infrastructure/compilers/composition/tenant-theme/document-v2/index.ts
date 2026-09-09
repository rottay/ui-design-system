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
import { getTenantThemeVerticalEnvelope } from "@/contracts/theme/runtime/envelopes";
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
  type DocumentAdmission,
} from "@/infrastructure/compilers/runtime/theme";
import {
  TenantThemeValidationError,
  assembleTenantThemeArtifact,
} from "..";
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
  // ONE admission. The intent it returns carries the document's plan, so the
  // tier station judges the publish exactly as it judges the preview; the
  // report it returns is the same one the editor was shown.
  const { intent, admission } = documentThemeAdmission({
    vertical: input.verticalKey,
    slug: input.slug,
    document: input.document,
  });
  const ledger = documentV2Ledger({ document: input.document, admission });
  try {
    const { artifact } = assembleTenantThemeArtifact({
      intent,
      identity,
      verticalEnvelope,
      document: admission.effective,
      ledger,
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
