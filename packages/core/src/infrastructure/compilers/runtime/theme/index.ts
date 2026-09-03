export { resolveTheme } from "./runtime/resolution";
export { compileTheme } from "./runtime/lowering";
export {
  containerScope,
  emitThemeCss,
  firstPartyScope,
  tenantArtifactScope,
} from "./runtime/emission";
export { resolveAdapter, THEME_ENGINE_ADAPTERS } from "./presentation/adapters";
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
  EnginePosture,
  EngineProjection,
  EngineProjectionMode,
  EngineSeeds,
  EngineThemeCompilation,
} from "@/foundation/contracts/composition/tenants/themes/engine-adapter";
