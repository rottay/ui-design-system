/**
 * THE LOWERING AND THE RESOLVER ARE NOT ON THIS BARREL.
 *
 * They used to be, and this barrel is re-exported by
 * `infrastructure/compilers/index.ts`, which the ROOT package entrypoint
 * re-exports in turn -- so `compileTheme`, `resolveTheme` and
 * `THEME_ENGINE_ADAPTERS` were public from `@rottay/design-system` as well as
 * from `/server`. Closing only `/server` would have been cosmetic: the same
 * three names on the root entrypoint are the same complete second route with no
 * admission on it (F-24).
 *
 * Every productive caller inside the package already reached them at their own
 * owners -- `./runtime/lowering`, `./runtime/resolution`,
 * `./presentation/adapters` -- so nothing internal is inconvenienced, and
 * `theme-lowering-single-door` asserts the lowering keeps exactly one owner.
 *
 * `baselineFor` stays: it names a vertical's own Theme and lowers nothing.
 */
export { baselineFor } from "./runtime/resolution";
export {
  ThemePatchMigrationError,
  admitDocument,
  authoredThemePatch,
  documentThemeAdmission,
  documentThemeIntent,
  documentThemePatch,
  draftPreviewThemeIntent,
  migrateAndAdmitDocument,
  migrateDocumentV1ToV2,
  migrateV1,
  previewThemeAdmission,
  previewThemeIntent,
  staticThemeIntent,
  verticalEngine,
} from "./runtime/ingress";
export type {
  DecisionProjection,
  DocumentAdmission,
  DocumentThemeIntentInput,
  DraftPreviewThemeIntentInput,
  PreviewThemeIntentInput,
  UnlitReason,
} from "./runtime/ingress";
export { compileThemeIntent } from "./facade/runtime/compile";
/**
 * The door's refusal, published so a surface can tell one apart from a crash.
 *
 * An authoring surface must keep rendering while an author types, and the only
 * way to do that without compiling around the admission is to CATCH its named
 * refusal. A caller that cannot name the error has to catch everything, which
 * is how a real bug gets rendered as an invalid draft.
 */
export { ThemeAdmissionError } from "./facade/foundation/admission";
export type {
  RefusedThemeCompilation,
  ThemeAdmissionIssue,
} from "./facade/foundation/admission";
export type {
  CompileThemeIntentOptions,
  ThemeIntentCompilation,
} from "./facade/runtime/compile";
export {
  containerScope,
  emitBaseRule,
  emitDeclarations,
  emitModeRule,
  emitRule,
  emitThemeCss,
  firstPartyScope,
  tenantArtifactScope,
} from "./runtime/emission";
export {
  EngineControlUnsupportedError,
  assertEngineSupportsActivatedControls,
  controlsActivatedBy,
  defineEngineAdapter,
  registerEngineAdapter,
  resolveAdapter,
} from "./presentation/adapters";
export type { EngineAdapterDefinition } from "./presentation/adapters";
export {
  engineVisualOf,
  firstPartyEngineVisual,
} from "./facade/presentation/engine-visual";
export type {
  ThemeIntent,
  ThemeIntentOrigin,
} from "@/foundation/contracts/composition/tenants/themes/intent";
export type {
  TenantStatusSeedAuthorship,
  ThemeFloors,
  ThemeProvenance,
  ThemeResolution,
} from "@/foundation/contracts/composition/tenants/themes/resolved";
export type {
  ThemeCompilation,
  ThemeCompilationModeBlock,
  ThemeCompilationRuntime,
} from "@/foundation/contracts/composition/tenants/themes/compiled";
export type { EmissionScope } from "@/foundation/contracts/composition/tenants/themes/emission";
export type {
  ControlId,
  EngineAdapter,
  EngineChannelCarrier,
  EngineChannelEvidence,
  EngineControlDeclaration,
  EngineEvidence,
  EnginePosture,
  EngineProjection,
  EngineProjectionMode,
  EngineSeeds,
  EngineThemeCompilation,
  EngineVisualDeclaration,
} from "@/foundation/contracts/composition/tenants/themes/engine-adapter";
