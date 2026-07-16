/**
 * Supplier-neutral semantic motion contracts.
 *
 * Public time values are always milliseconds. Render adapters are responsible
 * for converting them to any supplier-specific unit.
 */

import type { MotionProfile } from '../verticals';

export const MOTION_DIAL_BOUNDS = Object.freeze({
  intensity: Object.freeze({ min: 0, max: 1 }),
  durationScale: Object.freeze({ min: 0.5, max: 1.5 }),
} as const);

export type AmbientMotion = 'off' | 'subtle';
export type MotionPointer = 'coarse' | 'fine';
export type MotionPower = 'normal' | 'constrained';
/** Supplier-neutral transition identity selected by the vertical envelope. */
export type MotionCurve =
  | 'settled'
  | 'ease-out'
  | 'spring-gentle'
  | 'spring-tactile';

/** The complete, deliberately bounded tenant-owned motion surface. */
export interface TenantMotionDial {
  intensity?: number;
  durationScale?: number;
  ambient?: AmbientMotion;
}

export interface NormalizedTenantMotionDial {
  intensity: number;
  durationScale: number;
  ambient: AmbientMotion;
}

export interface MotionPolicyInput {
  profile: MotionProfile;
  tenantDial?: TenantMotionDial | unknown;
  reduce?: boolean;
  pointer?: MotionPointer;
  power?: MotionPower;
  visible?: boolean;
}

/** One resolved authority shared by CSS, component and renderer adapters. */
export interface MotionPolicy extends NormalizedTenantMotionDial {
  profile: MotionProfile;
  reduce: boolean;
  pointer: MotionPointer;
  power: MotionPower;
  visible: boolean;
  /** Maximum number of simultaneous continuous effects in this viewport. */
  maxContinuousLoops: 0 | 1;
  /** Active progress/state motion; never available on coarse/reduced/hidden. */
  allowContinuousMotion: boolean;
  /** Decorative motion is additionally controlled by the tenant ambient dial. */
  allowAmbientMotion: boolean;
  allowHoverEffects: boolean;
}

export const MOTION_RECIPE_NAMES = [
  'feedback.press',
  'feedback.confirm',
  'state.change',
  'overlay.modal',
  'overlay.sheet',
  'navigation.route',
  'navigation.shared-record',
  'collection.insert',
  'collection.reorder',
  'ai.thinking',
  'ai.tool-running',
  'ai.artifact-ready',
] as const;

export type MotionRecipeName = (typeof MOTION_RECIPE_NAMES)[number];

export interface MotionRecipeResolveOptions {
  /** Live recipes loop only while their underlying operation is active. */
  active?: boolean;
  /** Used only to calculate a bounded total stagger. */
  itemCount?: number;
}

/** Only compositor-safe properties may be named by a public recipe. */
export type MotionCompositorProperty = 'opacity' | 'transform';

export interface ResolvedMotionRecipe {
  name: MotionRecipeName;
  /** `final` means consumers render the settled state without interpolation. */
  state: 'animated' | 'final';
  /** Vertical-owned curve identity; adapters map it to their renderer. */
  curve: MotionCurve;
  properties: readonly MotionCompositorProperty[];
  durations: Readonly<{
    enterMs: number;
    exitMs: number;
    settleMs: number;
    cycleMs: number;
  }>;
  distances: Readonly<{
    xPx: number;
    yPx: number;
    scaleFrom: number;
  }>;
  stagger: Readonly<{
    stepMs: number;
    totalMs: number;
  }>;
  continuous: Readonly<{
    enabled: boolean;
    /** Concurrent loop budget, not an animation iteration count. */
    maxContinuousLoops: 0 | 1;
  }>;
}
