/**
 * Server-safe, supplier-neutral spatial policy and scene-module contract.
 *
 * No React, browser, Three or R3F runtime is reachable from this entrypoint.
 */
export {
  SPATIAL_QUALITY_BUDGETS,
  downgradeSpatialMode,
  isSpatialSceneModule,
  resolveSpatialPolicy,
  resolveSpatialQualityBudget,
} from '../../../../infrastructure/runtime/spatial';
export { SPATIAL_SCENE_MODULE_VERSION } from '../../../../foundation/contracts/kernel/spatial';
export type {
  SpatialBackend,
  SpatialCapability,
  SpatialContextState,
  SpatialInteraction,
  SpatialLiveMode,
  SpatialMode,
  SpatialPointer,
  SpatialPolicyInput,
  SpatialPower,
  SpatialPowerPreference,
  SpatialPurpose,
  SpatialQuality,
  SpatialQualityBudget,
  SpatialResolution,
  SpatialResolutionReason,
  SpatialSceneModuleContract,
} from '../../../../foundation/contracts/kernel/spatial';
