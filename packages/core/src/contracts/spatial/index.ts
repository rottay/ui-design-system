/**
 * Supplier-neutral spatial runtime contracts.
 *
 * This boundary deliberately contains no React, browser, Three or R3F types.
 * WebGL2 is the only certified backend in protocol version 1; WebGPU must not
 * appear here until its own parity, fallback and context-loss gates pass.
 */

export const SPATIAL_SCENE_MODULE_VERSION = 1 as const;

export type SpatialMode =
  | 'static'
  | 'reduced'
  | 'live-low'
  | 'live-high';

export type SpatialLiveMode = Extract<
  SpatialMode,
  'live-low' | 'live-high'
>;

export type SpatialBackend = 'none' | 'webgl2';
export type SpatialCapability = 'unknown' | SpatialBackend;
export type SpatialContextState = 'ready' | 'lost' | 'error';

export type SpatialPurpose =
  | 'explanation'
  | 'workspace'
  | 'pictogram'
  | 'ambient';

export type SpatialInteraction =
  | 'none'
  | 'inspect'
  | 'navigate'
  | 'manipulate';

export type SpatialQuality = 'auto' | 'low' | 'high';
export type SpatialPointer = 'coarse' | 'fine';
export type SpatialPower = 'constrained' | 'normal';
export type SpatialPowerPreference = 'default' | 'high-performance';

/** Bounded renderer posture. Scene modules cannot supply or widen it. */
export interface SpatialQualityBudget {
  readonly quality: Exclude<SpatialQuality, 'auto'>;
  readonly maxDpr: number;
  readonly antialias: boolean;
  readonly powerPreference: SpatialPowerPreference;
}

/**
 * Pure policy input assembled by the React/browser host.
 *
 * Every environmental field is optional so hostile/incomplete JSON can reach
 * the resolver safely. Missing evidence is conservative and never activates a
 * live backend.
 */
export interface SpatialPolicyInput {
  readonly enabled?: boolean;
  readonly hydrated?: boolean;
  readonly capability?: SpatialCapability;
  readonly contextState?: SpatialContextState;
  readonly lease?: boolean;
  readonly visible?: boolean;
  readonly inView?: boolean;
  readonly reduce?: boolean;
  readonly phone?: boolean;
  readonly tablet?: boolean;
  readonly pointer?: SpatialPointer;
  readonly power?: SpatialPower;
  readonly quality?: SpatialQuality;
  readonly adaptiveLow?: boolean;
  /** The host has validated all required fallback and scene-contract inputs. */
  readonly contractReady?: boolean;
}

export type SpatialResolutionReason =
  | 'disabled'
  | 'not-hydrated'
  | 'contract-not-ready'
  | 'page-hidden'
  | 'offscreen'
  | 'reduced-motion'
  | 'capability-unknown'
  | 'webgl2-unsupported'
  | 'context-error'
  | 'context-lost'
  | 'context-busy'
  | 'phone'
  | 'coarse-pointer'
  | 'constrained-power'
  | 'eligible-low'
  | 'eligible-high';

/** One deterministic decision consumed by every renderer adapter. */
export interface SpatialResolution {
  readonly mode: SpatialMode;
  readonly backend: SpatialBackend;
  readonly reason: SpatialResolutionReason;
  readonly shouldLoad: boolean;
  readonly shouldMount: boolean;
  readonly shouldRun: boolean;
  readonly budget: SpatialQualityBudget | null;
}

/**
 * Structural lazy-module protocol. `TScene` stays opaque here so the pure
 * contract never imports React; the React host narrows it to ComponentType.
 */
export interface SpatialSceneModuleContract<TScene = unknown> {
  readonly version: typeof SPATIAL_SCENE_MODULE_VERSION;
  readonly backend: Exclude<SpatialBackend, 'none'>;
  readonly Scene: TScene;
}
