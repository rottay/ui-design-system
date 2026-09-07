/**
 * @fileoverview The persisted-document ingress: a customer's stored theme.
 *
 * @module Compilers/Theme/Ingress/Presentation/Document
 * @category Compilers
 * @package @rottay/design-system
 */

import type { ThemeIntent } from "@/foundation/contracts/composition/tenants/themes/intent";
import type { TenantThemeDocumentAny } from "@/contracts/theme/presentation/document";
import type { FirstPartyVerticalId } from "@/foundation/contracts/kernel/verticals";
import {
  admitDocument,
  documentAnyThemePatch,
  type DocumentAdmission,
} from "../../runtime/document-v2";

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
}

/**
 * The intent a persisted `TenantThemeDocument` compiles under.
 *
 * The migration's mode argument is not a parameter here on purpose: it is the
 * baseline's, and the baseline is the vertical's. See `documentThemePatch`.
 */
export function documentThemeIntent(input: DocumentThemeIntentInput): ThemeIntent {
  return {
    vertical: input.vertical,
    slug: input.slug,
    origin: "tenant-document",
    patch: documentAnyThemePatch({
      vertical: input.vertical,
      document: input.document,
    }),
  };
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
  });
  return {
    intent: {
      vertical: input.vertical,
      slug: input.slug,
      origin: "tenant-document",
      patch: admission.patch,
    },
    admission,
  };
}
