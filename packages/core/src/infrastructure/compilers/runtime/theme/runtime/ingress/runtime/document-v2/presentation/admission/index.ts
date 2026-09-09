/**
 * @fileoverview One door for both document versions, and the report it emits.
 *
 * ACCEPTED IS NOT THE SAME AS LIT, and this owner is where the difference is
 * recorded instead of being lost. A v2 document may activate a decision whose
 * family cut has not landed: the door accepts it, the patch simply carries
 * nothing for it, and the admission names it as `unlit` with a reason. The
 * alternative -- refusing a decision the catalog publishes -- would force
 * app-platform to re-write documents every time a cut lands, which is exactly
 * the coupling the consumer contract exists to remove.
 *
 * @module Compilers/Theme/Ingress/Runtime/DocumentV2/Presentation/Admission
 * @category Compilers
 * @package @rottay/design-system
 */

import type { ThemeLayerPatch } from "@/foundation/contracts/composition/tenants/themes/iso";
import type { FirstPartyVerticalId } from "@/foundation/contracts/kernel/verticals";
import {
  assertTenantThemeDocumentV2,
  isTenantThemeDocumentV2,
  type TenantThemeDocumentAny,
  type TenantThemeDocumentV2,
} from "@/contracts/theme/presentation/document";
import { assertThemeDecisionDomains } from "@/infrastructure/compilers/kernel/foundation/schemas/tenant-theme/decisions";
import { assertExpressiveOverrides } from "@/foundation/tokens/ts/presentation/expressive-profiles";
import { documentThemePatch } from "../../../../foundation/document-patch";
import {
  documentProvenanceLedger,
  type ThemeProvenanceLedger,
} from "../../../../foundation/provenance";
import type { TenantThemeDocument } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import { projectDecisionsToV1, type DecisionProjection } from "../../foundation/projection";
import {
  captureV1Decisions,
  migrateDocumentV1ToV2,
} from "../../foundation/migrate";

export interface DocumentAdmission {
  /** `1` for the persisted v1 transport, `2` for the decision document. */
  version: 1 | 2;
  patch: ThemeLayerPatch;
  /** Empty for v1: a v1 document has no decision ids to report against. */
  decisions: readonly DecisionProjection[];
  /** Activated decisions that moved no keypath today, in kit row order. */
  unlit: readonly DecisionProjection[];
  /**
   * Which raw selection caused each effective leaf, captured HERE and never
   * re-derived. Empty is a real answer ("this document authored nothing the
   * ledger models"), never a missing one.
   */
  ledger: ThemeProvenanceLedger;
}

/**
 * Admits a document of either version and reports what it moved.
 *
 * The v2 path validates, projects onto the v1 authoring shape, and hands that
 * shape to the SAME `documentThemePatch` the v1 path uses -- one lowering, one
 * default-mode reader, one roster lookup.
 */
/**
 * What a v1 row authored, read through the ONE owner that can say so.
 *
 * The migration is the only reader that knows `general.typography.typePairing`
 * was the authored dial and the font families are its expansion, so the v1
 * decisions are ITS answer rather than a second v1 -> decision table. Where it
 * cannot express the document -- a v1 that authors a font stack, a raw token
 * override or per-mode seeds is legal v1 and inexpressible v2 -- the document
 * is still admissible here, so the capture is read rather than the migration:
 * every decision the row DOES express is recorded, and the field that has no
 * v2 counterpart is named by the migration door, which is the door that
 * refuses. A v1 row carries no plan and none is invented for it.
 *
 * Chrome is claimed at the V1 transport path, not the migrated `overrides.`
 * one, so a refusal points at what the author actually wrote.
 */
function v1Ledger(document: TenantThemeDocument): ThemeProvenanceLedger {
  const chrome =
    document.mode === "advanced"
      ? document.visualFoundation?.advanced?.chrome
      : undefined;
  const chromeTransportPrefix = "visualFoundation.advanced.chrome";
  const { decisions } = captureV1Decisions(document);
  return documentProvenanceLedger({
    decisions: decisions as Record<string, unknown>,
    chrome,
    chromeTransportPrefix,
  });
}

export function admitDocument(input: {
  vertical: FirstPartyVerticalId;
  document: TenantThemeDocumentAny;
}): DocumentAdmission {
  if (!isTenantThemeDocumentV2(input.document)) {
    return {
      version: 1,
      patch: documentThemePatch({
        vertical: input.vertical,
        document: input.document,
      }),
      decisions: [],
      unlit: [],
      ledger: v1Ledger(input.document),
    };
  }
  const document = assertTenantThemeDocumentV2(input.document);
  // The contract closed the key sets; the generated schema closes the VALUES of
  // every domain the catalog states in full. Two owners, one table.
  assertThemeDecisionDomains(document.decisions);
  // A `record` domain's VALUES are its family contract's, which is why the
  // generated schema skips the row. Skipping it here too is what let seven
  // invalid axes through both public producers and be dropped in silence.
  assertExpressiveOverrides(
    document.decisions["profiles.expressive"],
    '$.decisions["profiles.expressive"]'
  );
  const { v1, projections } = projectDecisionsToV1(document);
  return {
    version: 2,
    patch: documentThemePatch({ vertical: input.vertical, document: v1 }),
    decisions: projections,
    unlit: projections.filter((projection) => !projection.lit),
    ledger: documentProvenanceLedger({
      decisions: document.decisions as Record<string, unknown>,
      chrome: document.overrides?.chrome,
      chromeTransportPrefix: "overrides.chrome",
    }),
  };
}

/**
 * Migrates a v1 document and admits the result through the SAME door a publish
 * uses, so the migrated document is proven to reach a patch rather than only to
 * be well formed. It does not run the merge: whether that patch survives
 * `compileThemeIntent` is asserted by this owner's tests, which compare the
 * migrated document's emitted CSS against the v1 original byte for byte.
 */
export function migrateAndAdmitDocument(input: {
  vertical: FirstPartyVerticalId;
  document: TenantThemeDocumentAny;
}): DocumentAdmission & { migrated: TenantThemeDocumentV2 } {
  const migrated = isTenantThemeDocumentV2(input.document)
    ? assertTenantThemeDocumentV2(input.document)
    : migrateDocumentV1ToV2(input.document);
  return {
    ...admitDocument({ vertical: input.vertical, document: migrated }),
    migrated,
  };
}

/** The patch alone, for the producers that only name an intent. */
export function documentAnyThemePatch(input: {
  vertical: FirstPartyVerticalId;
  document: TenantThemeDocumentAny;
}): ThemeLayerPatch {
  return admitDocument(input).patch;
}
