export { resolveTheme } from "./runtime/resolution";
export { compileTheme } from "./runtime/lowering";
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
  THEME_ENGINE_ADAPTERS,
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
