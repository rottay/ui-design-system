/**
 * @fileoverview The v2 document owner: projection, migration, admission.
 *
 * @module Compilers/Theme/Ingress/Runtime/DocumentV2
 * @category Compilers
 * @package @rottay/design-system
 */

export {
  projectDecisionsToV1,
  v1KeypathOf,
  type DecisionProjection,
  type UnlitReason,
} from "./foundation/projection";
export {
  migrateDocumentV1ToV2,
  migrateDocumentV2ToV3,
} from "./foundation/migrate";
export {
  ThemeStyleValidationError,
  admitStyle,
  styleThemePatch,
  type StyleAdmission,
} from "./runtime/style";
export {
  admitDocument,
  baselineFor,
  documentAnyThemePatch,
  migrateAndAdmitDocument,
  type DocumentAdmission,
} from "./presentation/admission";
