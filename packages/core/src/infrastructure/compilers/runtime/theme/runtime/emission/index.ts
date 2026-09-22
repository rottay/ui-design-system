/**
 * The emission owner's barrel over `css/` and `artifact/`. It authors nothing.
 *
 * The public import path stays this FOLDER: every productive reader, both
 * `dist/` cascade loaders and the path-keyed paint census address the owner by
 * folder. `tokens/` is reached by its own path, so an artifact consumer does
 * not drag the resolver, the evaluator and the colour kernel over a boundary.
 */

export {
  containerScope,
  emitBaseRule,
  emitDeclarations,
  emitModeRule,
  emitRule,
  emitThemeCss,
  firstPartyScope,
  tenantArtifactScope,
} from "./css";
export type {
  TenantArtifactComposition,
  TenantArtifactModeDelta,
} from "./artifact";
export { emitTenantArtifactCss } from "./artifact";
