/**
 * @fileoverview The v2 document owner: adapter, migration, admission.
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
} from "./foundation/adapter";
export { migrateDocumentV1ToV2 } from "./foundation/migrate";
export {
  admitDocument,
  documentAnyThemePatch,
  migrateAndAdmitDocument,
  type DocumentAdmission,
} from "./presentation/admission";
