'use client';

/** Optional spatial lifecycle host. Scene graph and Three remain app-owned. */
export { SpatialExperience } from './runtime/spatial-react';
export { SPATIAL_SCENE_MODULE_VERSION } from './contracts/spatial';
export type {
  SpatialExperienceEvent,
  SpatialExperienceLabels,
  SpatialExperienceProps,
  SpatialPerformanceSample,
  SpatialSceneLoader,
  SpatialSceneModule,
  SpatialSceneRuntimeProps,
} from './runtime/spatial-react';
export type {
  SpatialBackend,
  SpatialInteraction,
  SpatialLiveMode,
  SpatialMode,
  SpatialPurpose,
  SpatialQuality,
  SpatialQualityBudget,
  SpatialResolutionReason,
} from './contracts/spatial';
