/**
 * @fileoverview Damped-spring -> CSS `linear()` easing generator.
 *
 * `BrandMotion.springTension`/`springFriction` (contracts/themes) follow the
 * tension/friction/mass=1 convention (mass is not an exposed field; 1 is the
 * implicit default the numeric ranges in first-party BrandThemes are tuned
 * against). This module numerically integrates that mass-spring-damper
 * system and samples its position curve into a CSS `linear()` easing
 * function: `linear()` stops are output progress (unbounded -- values above
 * 1 encode overshoot) against evenly spaced elapsed-time fractions, which is
 * exactly a spring's displacement-over-settle-time shape.
 */

export interface SpringLinearEasingOptions {
  /** Number of intervals sampled across the settle duration. Emits steps+1 stops. */
  steps?: number;
  /** Oscillator mass. BrandMotion carries no mass field; 1 matches the tension/friction convention. */
  mass?: number;
  /** Hard cap (ms) on simulated settle time, so a lightly-damped spring cannot produce an unbounded sample run. */
  maxDurationMs?: number;
  /** Displacement-from-rest (fraction of the 0..1 travel) below which the spring is considered settled. */
  restDisplacementThreshold?: number;
  /** Velocity (progress units / ms) below which the spring is considered settled. */
  restVelocityThreshold?: number;
}

const DEFAULT_STEPS = 24;
const DEFAULT_MASS = 1;
const DEFAULT_MAX_DURATION_MS = 3000;
const DEFAULT_REST_DISPLACEMENT = 0.001;
const DEFAULT_REST_VELOCITY = 0.001;
/** Integration step, in seconds, for the semi-implicit Euler simulation below. */
const SIM_DT_SECONDS = 0.001;
const ROUND_DECIMALS = 4;

interface SpringSimulation {
  durationMs: number;
  /** Position samples at 1ms resolution, index 0 = t=0. Values can exceed 1 while overshooting. */
  samples: number[];
}

/**
 * Semi-implicit (symplectic) Euler integration of a unit-target
 * mass-spring-damper system: position settles at 1, starting at rest at 0.
 * Runs at a fixed 1ms step until both displacement-from-target and velocity
 * fall under their rest thresholds, or `maxDurationMs` elapses.
 */
function simulateSpring(
  tension: number,
  friction: number,
  options: Required<
    Pick<SpringLinearEasingOptions, 'mass' | 'maxDurationMs' | 'restDisplacementThreshold' | 'restVelocityThreshold'>
  >,
): SpringSimulation {
  const { maxDurationMs, restDisplacementThreshold, restVelocityThreshold } = options;
  const mass = options.mass > 0 ? options.mass : DEFAULT_MASS;

  // A non-positive tension never accelerates toward the target; simulating it
  // would just loop to the maxDurationMs cap. Treat it as an instant step so
  // callers get a valid (if degenerate) curve instead of a 3-second stall.
  if (tension <= 0) {
    return { durationMs: 0, samples: [0, 1] };
  }

  let position = 0;
  let velocity = 0;
  const samples: number[] = [position];
  let elapsedMs = 0;

  while (elapsedMs < maxDurationMs) {
    const springForce = -tension * (position - 1);
    const dampingForce = -friction * velocity;
    const acceleration = (springForce + dampingForce) / mass;
    velocity += acceleration * SIM_DT_SECONDS;
    position += velocity * SIM_DT_SECONDS;
    elapsedMs += 1;
    samples.push(position);

    const settled =
      Math.abs(position - 1) < restDisplacementThreshold && Math.abs(velocity) < restVelocityThreshold;
    if (settled) break;
  }

  return { durationMs: elapsedMs, samples };
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/**
 * Derive a CSS `linear()` easing function string from a tension/friction
 * spring pair, resampled to `steps` evenly-spaced stops across the spring's
 * own settle duration. The final stop is forced to exactly `1` so a
 * transition/animation using this easing always lands precisely on its end
 * value regardless of the rest-threshold approximation.
 */
export function springLinearEasing(
  tension: number,
  friction: number,
  options: SpringLinearEasingOptions = {},
): string {
  const {
    steps = DEFAULT_STEPS,
    mass = DEFAULT_MASS,
    maxDurationMs = DEFAULT_MAX_DURATION_MS,
    restDisplacementThreshold = DEFAULT_REST_DISPLACEMENT,
    restVelocityThreshold = DEFAULT_REST_VELOCITY,
  } = options;

  const { durationMs, samples } = simulateSpring(tension, friction, {
    mass,
    maxDurationMs,
    restDisplacementThreshold,
    restVelocityThreshold,
  });

  const stops: number[] = [];
  for (let i = 0; i <= steps; i += 1) {
    if (i === steps) {
      stops.push(1);
      continue;
    }
    const t = (i / steps) * durationMs;
    const idx = Math.min(samples.length - 1, Math.round(t));
    stops.push(roundTo(samples[idx], ROUND_DECIMALS));
  }

  return `linear(${stops.join(', ')})`;
}

/**
 * Widens the damping ratio relative to a tenant's primary spring so a
 * "gentle" companion curve settles without the primary curve's overshoot --
 * for chrome that wants the spring's shape without its emphasis (e.g. a
 * nested panel reveal vs. a hero modal entrance). Multiplies friction only;
 * tension (and therefore overall speed) is unchanged.
 */
const GENTLE_FRICTION_MULTIPLIER = 1.6;

export function springLinearEasingGentle(
  tension: number,
  friction: number,
  options: SpringLinearEasingOptions = {},
): string {
  return springLinearEasing(tension, friction * GENTLE_FRICTION_MULTIPLIER, options);
}
