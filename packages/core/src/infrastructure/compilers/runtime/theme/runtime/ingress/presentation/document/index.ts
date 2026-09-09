/**
 * @fileoverview The persisted-document ingress: a customer's stored theme.
 *
 * @module Compilers/Theme/Ingress/Presentation/Document
 * @category Compilers
 * @package @rottay/design-system
 */

import type { ThemeIntent } from "@/foundation/contracts/composition/tenants/themes/intent";
import {
  isTenantThemeDocumentV2,
  type TenantThemeDocumentAny,
} from "@/contracts/theme/presentation/document";
import type { FirstPartyVerticalId } from "@/foundation/contracts/kernel/verticals";
import type { TenantThemeVerticalEnvelope } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import { admitDocument, type DocumentAdmission } from "../../runtime/document-v2";

/** What a stored document needs to name a compile. */
export interface DocumentThemeIntentInput {
  /** The first-party vertical this tenant is rendered as. */
  vertical: FirstPartyVerticalId;
  /** The tenant the compile is for; the scope the artifact is written against. */
  slug: string;
  /**
   * The document the tenant persisted, in either version.
   *
   * v2 `{ version: 2, plan, decisions, overrides? }` is the shape app-platform
   * writes from day one; v1 stays accepted so no stored row has to be rewritten
   * before its migration lands.
   */
  document: TenantThemeDocumentAny;
  /**
   * The envelope ranges a profile default is clamped into, when the caller
   * publishes under a narrowed envelope rather than the registered one. The
   * door applies the vertical's own ranges when it is absent.
   */
  ranges?: TenantThemeVerticalEnvelope["ranges"];
}

/**
 * The entitlement a document carries, or none.
 *
 * A v2 document states its `plan`; a v1 document has no such field and gets no
 * invented one. D-02: a defaulted plan is an entitlement nobody granted, so the
 * tier station declines to judge an intent that names no plan rather than
 * guessing the cheapest.
 */
function entitlementOf(
  document: TenantThemeDocumentAny
): Pick<ThemeIntent, "entitlement"> {
  return isTenantThemeDocumentV2(document)
    ? { entitlement: { plan: document.plan } }
    : {};
}

/**
 * The intent a persisted `TenantThemeDocument` compiles under.
 *
 * The migration's mode argument is not a parameter here on purpose: it is the
 * baseline's, and the baseline is the vertical's. See `documentThemePatch`.
 */
export function documentThemeIntent(input: DocumentThemeIntentInput): ThemeIntent {
  return documentThemeAdmission(input).intent;
}

/**
 * The same admission, with the report a writer needs.
 *
 * `documentThemeIntent` returns an intent because that is what the compiler
 * takes. A surface that must TELL the tenant which of its decisions moved
 * nothing needs more than the patch, and reconstructing that by diffing the
 * patch would be a second, weaker answer to a question the door already
 * answered.
 */
export function documentThemeAdmission(
  input: DocumentThemeIntentInput
): { intent: ThemeIntent; admission: DocumentAdmission } {
  const admission = admitDocument({
    vertical: input.vertical,
    document: input.document,
    ranges: input.ranges,
  });
  return {
    intent: {
      vertical: input.vertical,
      slug: input.slug,
      origin: "tenant-document",
      patch: admission.patch,
      ...entitlementOf(input.document),
      ledger: admission.ledger,
    },
    admission,
  };
}
