/**
 * @fileoverview The persisted-document ingress: a customer's stored theme.
 *
 * @module Compilers/Theme/Ingress/Presentation/Document
 * @category Compilers
 * @package @rottay/design-system
 */

import type { ThemeIntent } from "@/foundation/contracts/composition/tenants/themes/intent";
import type { TenantThemeDocument } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import type { FirstPartyVerticalId } from "@/foundation/contracts/kernel/verticals";
import { documentThemePatch } from "../../foundation/document-patch";

/** What a stored document needs to name a compile. */
export interface DocumentThemeIntentInput {
  /** The first-party vertical this tenant is rendered as. */
  vertical: FirstPartyVerticalId;
  /** The tenant the compile is for; the scope the artifact is written against. */
  slug: string;
  /** The validated, expanded document the tenant persisted. */
  document: TenantThemeDocument;
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
    patch: documentThemePatch({
      vertical: input.vertical,
      document: input.document,
    }),
  };
}
