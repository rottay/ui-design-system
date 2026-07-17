'use client';

/** Optional spatial lifecycle host. Scene graph and Three remain app-owned. */
export { SpatialExperience } from '../../../infrastructure/runtime/spatial/facade/react';
export { SPATIAL_SCENE_MODULE_VERSION } from '../../../foundation/contracts/kernel/spatial';
export type {
  SpatialExperienceEvent,
  SpatialExperienceLabels,
  SpatialExperienceProps,
  SpatialPerformanceSample,
  SpatialSceneLoader,
  SpatialSceneModule,
  SpatialSceneRuntimeProps,
} from '../../../infrastructure/runtime/spatial/facade/react';
export type {
  SpatialBackend,
  SpatialInteraction,
  SpatialLiveMode,
  SpatialMode,
  SpatialPurpose,
  SpatialQuality,
  SpatialQualityBudget,
  SpatialResolutionReason,
} from '../../../foundation/contracts/kernel/spatial';
