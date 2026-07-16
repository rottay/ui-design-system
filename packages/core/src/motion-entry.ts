'use client';

/** Focused semantic motion policy boundary. */
export {
  MOTION_PROFILE_DEFAULTS,
  MOTION_PROFILE_ENVELOPES,
  MotionProvider,
  normalizeTenantMotionDial,
  resolveMotionPolicy,
  resolveMotionRecipe,
  useMotionPolicy,
  useMotionPreference,
  useMotionRecipe,
} from './runtime/motion';
export type {
  MotionContextValue,
  MotionProviderProps,
} from './runtime/motion';
export {
  MOTION_DIAL_BOUNDS,
  MOTION_RECIPE_NAMES,
} from './contracts/motion';
export type {
  AmbientMotion,
  MotionCompositorProperty,
  MotionCurve,
  MotionPolicy,
  MotionPolicyInput,
  MotionPointer,
  MotionPower,
  MotionRecipeName,
  MotionRecipeResolveOptions,
  NormalizedTenantMotionDial,
  ResolvedMotionRecipe,
  TenantMotionDial,
} from './contracts/motion';
export type { MotionProfile } from './contracts/verticals';
