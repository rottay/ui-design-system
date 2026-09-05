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
export { authoredThemePatch } from "./foundation/draft-patch";
export { verticalEngine } from "./foundation/engine";
export { staticThemeIntent } from "./presentation/static";
export { documentThemeIntent } from "./presentation/document";
export type { DocumentThemeIntentInput } from "./presentation/document";
export {
  draftPreviewThemeIntent,
  previewThemeIntent,
} from "./presentation/preview";
export type {
  DraftPreviewThemeIntentInput,
  PreviewThemeIntentInput,
} from "./presentation/preview";
