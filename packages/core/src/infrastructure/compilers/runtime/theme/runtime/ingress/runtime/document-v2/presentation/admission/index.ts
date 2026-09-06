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

import type { ThemePatch } from "@/foundation/contracts/composition/tenants/themes/iso";
import type { FirstPartyVerticalId } from "@/foundation/contracts/kernel/verticals";
import {
  assertTenantThemeDocumentV2,
  isTenantThemeDocumentV2,
  type TenantThemeDocumentAny,
  type TenantThemeDocumentV2,
} from "@/foundation/contracts/composition/tenants/themes/tenant-theme/decision-document";
import { documentThemePatch } from "../../../../foundation/document-patch";
import { projectDecisionsToV1, type DecisionProjection } from "../../foundation/adapter";
import { migrateDocumentV1ToV2 } from "../../foundation/migrate";

export interface DocumentAdmission {
  /** `1` for the persisted v1 transport, `2` for the decision document. */
  version: 1 | 2;
  patch: ThemePatch;
  /** Empty for v1: a v1 document has no decision ids to report against. */
  decisions: readonly DecisionProjection[];
  /** Activated decisions that moved no keypath today, in kit row order. */
  unlit: readonly DecisionProjection[];
}

/**
 * Admits a document of either version and reports what it moved.
 *
 * The v2 path validates, projects onto the v1 authoring shape, and hands that
 * shape to the SAME `documentThemePatch` the v1 path uses -- one lowering, one
 * default-mode reader, one roster lookup.
 */
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
    };
  }
  const document = assertTenantThemeDocumentV2(input.document);
  const { v1, projections } = projectDecisionsToV1(document);
  return {
    version: 2,
    patch: documentThemePatch({ vertical: input.vertical, document: v1 }),
    decisions: projections,
    unlit: projections.filter((projection) => !projection.lit),
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
}): ThemePatch {
  return admitDocument(input).patch;
}
