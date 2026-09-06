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
  documentAnyThemePatch,
  migrateAndAdmitDocument,
  migrateDocumentV1ToV2,
  projectDecisionsToV1,
  v1KeypathOf,
} from "./runtime/document-v2";
export type {
  DecisionProjection,
  DocumentAdmission,
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
  previewThemeAdmission,
  previewThemeIntent,
} from "./presentation/preview";
export type {
  DraftPreviewThemeIntentInput,
  PreviewThemeIntentInput,
} from "./presentation/preview";
