import type {
  MotionCompositorProperty,
  MotionCurve,
  MotionPolicy,
  MotionRecipeName,
  MotionRecipeResolveOptions,
  ResolvedMotionRecipe,
} from '@/foundation/contracts/runtime/motion';

const COMPOSITOR_PROPERTIES = Object.freeze([
  'opacity',
  'transform',
] as const satisfies readonly MotionCompositorProperty[]);

interface RecipeDefinition {
  enterMs: number;
  exitMs: number;
  settleMs: number;
  cycleMs: number;
  xPx: number;
  yPx: number;
  scaleFrom: number;
  staggerStepMs: number;
  staggerMaxMs: number;
  live: boolean;
}

const RECIPE_DEFINITIONS = Object.freeze({
  'feedback.press': {
    enterMs: 80, exitMs: 64, settleMs: 80, cycleMs: 0,
    xPx: 0, yPx: 0, scaleFrom: 0.98,
    staggerStepMs: 0, staggerMaxMs: 0, live: false,
  },
  'feedback.confirm': {
    enterMs: 120, exitMs: 96, settleMs: 180, cycleMs: 0,
    xPx: 0, yPx: 2, scaleFrom: 0.985,
    staggerStepMs: 0, staggerMaxMs: 0, live: false,
  },
  // Hover is the quietest state explanation: opacity/transform only, faster
  // than press so the pointer never feels ahead of the surface.
  'feedback.hover': {
    enterMs: 96, exitMs: 120, settleMs: 96, cycleMs: 0,
    xPx: 0, yPx: -1, scaleFrom: 1,
    staggerStepMs: 0, staggerMaxMs: 0, live: false,
  },
  // Focus must appear immediately for keyboard users; the settle exists only
  // so the ring's opacity ramp reads as placed rather than popped.
  'feedback.focus': {
    enterMs: 80, exitMs: 80, settleMs: 80, cycleMs: 0,
    xPx: 0, yPx: 0, scaleFrom: 1,
    staggerStepMs: 0, staggerMaxMs: 0, live: false,
  },
  // Error feedback is a bounded lateral shake substitute: one compositor-safe
  // offset-and-return, never a loop, slightly longer settle so the state
  // change registers before the user retries.
  'feedback.error': {
    enterMs: 140, exitMs: 112, settleMs: 220, cycleMs: 0,
    xPx: 3, yPx: 0, scaleFrom: 1,
    staggerStepMs: 0, staggerMaxMs: 0, live: false,
  },
  // Progressive disclosure: content reveals downward with a small travel so
  // the spatial origin of the new region is legible.
  'disclosure.reveal': {
    enterMs: 200, exitMs: 160, settleMs: 200, cycleMs: 0,
    xPx: 0, yPx: 6, scaleFrom: 0.99,
    staggerStepMs: 24, staggerMaxMs: 96, live: false,
  },
  'state.change': {
    enterMs: 180, exitMs: 144, settleMs: 200, cycleMs: 0,
    xPx: 0, yPx: 2, scaleFrom: 1,
    staggerStepMs: 0, staggerMaxMs: 0, live: false,
  },
  'overlay.modal': {
    enterMs: 280, exitMs: 220, settleMs: 320, cycleMs: 0,
    xPx: 0, yPx: 8, scaleFrom: 0.98,
    staggerStepMs: 0, staggerMaxMs: 0, live: false,
  },
  'overlay.sheet': {
    enterMs: 320, exitMs: 250, settleMs: 320, cycleMs: 0,
    xPx: 0, yPx: 16, scaleFrom: 1,
    staggerStepMs: 0, staggerMaxMs: 0, live: false,
  },
  'navigation.route': {
    enterMs: 280, exitMs: 220, settleMs: 320, cycleMs: 0,
    xPx: 8, yPx: 0, scaleFrom: 1,
    staggerStepMs: 0, staggerMaxMs: 0, live: false,
  },
  'navigation.shared-record': {
    enterMs: 320, exitMs: 250, settleMs: 320, cycleMs: 0,
    xPx: 16, yPx: 0, scaleFrom: 0.99,
    staggerStepMs: 0, staggerMaxMs: 0, live: false,
  },
  'collection.insert': {
    enterMs: 200, exitMs: 160, settleMs: 280, cycleMs: 0,
    xPx: 0, yPx: 8, scaleFrom: 0.99,
    staggerStepMs: 30, staggerMaxMs: 240, live: false,
  },
  'collection.reorder': {
    enterMs: 280, exitMs: 220, settleMs: 320, cycleMs: 0,
    xPx: 0, yPx: 4, scaleFrom: 1,
    staggerStepMs: 30, staggerMaxMs: 240, live: false,
  },
  'ai.thinking': {
    enterMs: 180, exitMs: 144, settleMs: 200, cycleMs: 1200,
    xPx: 0, yPx: 2, scaleFrom: 0.99,
    staggerStepMs: 40, staggerMaxMs: 240, live: true,
  },
  'ai.tool-running': {
    enterMs: 180, exitMs: 144, settleMs: 200, cycleMs: 1000,
    xPx: 0, yPx: 2, scaleFrom: 0.99,
    staggerStepMs: 40, staggerMaxMs: 240, live: true,
  },
  'ai.artifact-ready': {
    enterMs: 500, exitMs: 375, settleMs: 500, cycleMs: 0,
    xPx: 0, yPx: 8, scaleFrom: 0.98,
    staggerStepMs: 40, staggerMaxMs: 280, live: false,
  },
} as const satisfies Record<MotionRecipeName, RecipeDefinition>);

const MAX_TOTAL_STAGGER_MS = 320;
const PHONE_DISTANCE_CAP_PX = 12;
const MAX_FINITE_DURATION_MS = 500;

const PROFILE_RECIPE_STYLE = Object.freeze({
  precise: Object.freeze({ curve: 'spring-gentle' as const, maxDistancePx: 16 }),
  calm: Object.freeze({ curve: 'ease-out' as const, maxDistancePx: 2 }),
  expressive: Object.freeze({ curve: 'spring-tactile' as const, maxDistancePx: 6 }),
} satisfies Record<MotionPolicy['profile'], { curve: MotionCurve; maxDistancePx: number }>);

function scaledMs(value: number, durationScale: number): number {
  return Math.max(0, Math.round(value * durationScale));
}

function scaledFiniteMs(value: number, durationScale: number): number {
  return Math.min(scaledMs(value, durationScale), MAX_FINITE_DURATION_MS);
}

function scaledDistance(value: number, intensity: number, cap: number): number {
  const result = Math.max(-cap, Math.min(cap, value * intensity));
  return Math.round(result * 100) / 100;
}

function normalizedItemCount(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return 0;
  return Math.min(Math.floor(value), 10_000);
}

/**
 * Resolve a semantic recipe to immutable, deterministic compositor geometry.
 * Layout properties are absent by construction. Reduced, hidden and
 * power-constrained policies return the settled state immediately.
 */
export function resolveMotionRecipe(
  name: MotionRecipeName,
  policy: MotionPolicy,
  options: MotionRecipeResolveOptions = {},
): ResolvedMotionRecipe {
  const definition = RECIPE_DEFINITIONS[name];
  const finalOnly =
    policy.reduce || !policy.visible || policy.power === 'constrained' || policy.intensity <= 0;
  const itemCount = normalizedItemCount(options.itemCount);

  if (finalOnly) {
    return {
      name,
      state: 'final',
      curve: 'settled',
      properties: COMPOSITOR_PROPERTIES,
      durations: Object.freeze({ enterMs: 0, exitMs: 0, settleMs: 0, cycleMs: 0 }),
      distances: Object.freeze({ xPx: 0, yPx: 0, scaleFrom: 1 }),
      stagger: Object.freeze({ stepMs: 0, totalMs: 0 }),
      continuous: Object.freeze({ enabled: false, maxContinuousLoops: 0 }),
    };
  }

  const profileStyle = PROFILE_RECIPE_STYLE[policy.profile];
  const distanceCap = Math.min(
    profileStyle.maxDistancePx,
    policy.pointer === 'coarse' ? PHONE_DISTANCE_CAP_PX : Number.POSITIVE_INFINITY,
  );
  const staggerStepMs = scaledMs(definition.staggerStepMs, policy.durationScale);
  const staggerCapMs = Math.min(
    scaledMs(definition.staggerMaxMs, policy.durationScale),
    MAX_TOTAL_STAGGER_MS,
  );
  const totalMs = Math.min(Math.max(itemCount - 1, 0) * staggerStepMs, staggerCapMs);
  const continuousEnabled =
    definition.live &&
    options.active === true &&
    policy.allowContinuousMotion &&
    policy.maxContinuousLoops > 0;

  return {
    name,
    state: 'animated',
    curve: profileStyle.curve,
    properties: COMPOSITOR_PROPERTIES,
    durations: Object.freeze({
      enterMs: scaledFiniteMs(definition.enterMs, policy.durationScale),
      exitMs: scaledFiniteMs(definition.exitMs, policy.durationScale),
      settleMs: scaledFiniteMs(definition.settleMs, policy.durationScale),
      cycleMs: continuousEnabled
        ? scaledMs(definition.cycleMs, policy.durationScale)
        : 0,
    }),
    distances: Object.freeze({
      xPx: scaledDistance(definition.xPx, policy.intensity, distanceCap),
      yPx: scaledDistance(definition.yPx, policy.intensity, distanceCap),
      scaleFrom:
        Math.round((1 - (1 - definition.scaleFrom) * policy.intensity) * 10_000) /
        10_000,
    }),
    stagger: Object.freeze({ stepMs: staggerStepMs, totalMs }),
    continuous: Object.freeze({
      enabled: continuousEnabled,
      maxContinuousLoops: continuousEnabled ? policy.maxContinuousLoops : 0,
    }),
  };
}
