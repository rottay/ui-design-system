/**
 * @fileoverview The ONE place a ThemeIntent is produced.
 *
 * Three transports, three named producers, one shape. Nothing outside this
 * owner may assemble a `{ vertical, slug, origin, patch }` literal: the
 * architecture gate `theme-lowering-single-door` asserts it.
 *
 * @module Compilers/Theme/Ingress
 * @category Compilers
 * @package @rottay/design-system
 */

export {
  ThemePatchMigrationError,
  documentThemePatch,
  migrateV1,
} from "./foundation/document-patch";
export {
  admitDocument,
  baselineFor,
  documentAnyThemePatch,
  migrateAndAdmitDocument,
  migrateDocumentV1ToV2,
  migrateDocumentV2ToV3,
  projectDecisionsToV1,
  ThemeStyleValidationError,
  admitStyle,
  styleThemePatch,
  v1KeypathOf,
} from "./runtime/document-v2";
export type {
  DecisionProjection,
  DocumentAdmission,
  StyleAdmission,
  UnlitReason,
} from "./runtime/document-v2";
export { authoredThemePatch } from "./foundation/draft-patch";
export { verticalEngine } from "./foundation/engine";
export { staticThemeIntent } from "./presentation/static";
export {
  documentThemeAdmission,
  documentThemeIntent,
} from "./presentation/document";
export type { DocumentThemeIntentInput } from "./presentation/document";
export {
  draftPreviewThemeIntent,
  draftTenantTheme,
  governedTenantTheme,
  previewThemeAdmission,
  previewThemeIntent,
  projectThemeDraft,
  readThemeDraft,
} from "./presentation/preview";
export type {
  DraftPreviewThemeIntentInput,
  PreviewThemeIntentInput,
} from "./presentation/preview";
