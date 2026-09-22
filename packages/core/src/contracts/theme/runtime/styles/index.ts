/**
 * @fileoverview Reusable styles: a published, immutable, digest-pinned set of
 * FORM decisions a tenant inherits by naming it.
 *
 * A style owns form; the tenant owns brand. The partition below states which of
 * the 29 catalog rows a style may author and refuses the rest at registration,
 * and the ledger keeps a style's leaves at `preset-inherited` rank, so an
 * explicit tenant decision always outranks an inherited one without any station
 * having to compare values.
 *
 * @module Contracts/Theme/Styles
 * @category Types
 * @package @rottay/design-system
 */

export {
  ThemeStyleReferenceError,
  defineThemeStyle,
  themeStyleDigest,
  type ThemeStyleDocument,
  type ThemeStyleManifest,
  type ThemeStyleRecord,
} from "./foundation/document";
export {
  THEME_STYLE_CLASSES,
  THEME_STYLE_CLASS_BY_DECISION,
  THEME_STYLE_NON_EMITTING_DECISIONS,
  assertStyleAuthorable,
  assertStyleEmitsSomething,
  type ThemeStyleClass,
} from "./runtime/partition";
export {
  THEME_STYLE_RANGED_DIALS,
  themeStyleClearanceIssues,
  type ThemeStyleClearanceIssue,
  type ThemeStyleEnvelope,
} from "./runtime/clearance";
export {
  THEME_STYLE_IDS,
  THEME_STYLE_REGISTRY,
  themeStyleKey,
  themeStyleVersions,
  type ThemeStyleId,
} from "./composition/registry";
export {
  assertThemeStyleReference,
  resolveThemeStyle,
  type ThemeStyleReference,
} from "./presentation/reference";
