/**
 * Math Utilities
 *
 * Provides common numerical operations for layout calculations,
 * animations, and responsive value transformations.
 */

/**
 * Clamp a value between a minimum and maximum bound.
 *
 * @example
 * ```ts
 * import { clamp } from '@rottay/design-system';
 *
 * clamp(15, 0, 10); // 10
 * clamp(-5, 0, 10); // 0
 * clamp(5, 0, 10);  // 5
 * ```
 *
 * @param value - The value to clamp
 * @param min - Lower bound
 * @param max - Upper bound
 * @returns The clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values by a factor t.
 *
 * @example
 * ```ts
 * import { lerp } from '@rottay/design-system';
 *
 * lerp(0, 100, 0.5); // 50
 * lerp(0, 100, 0);   // 0
 * lerp(0, 100, 1);   // 100
 * ```
 *
 * @param a - Start value
 * @param b - End value
 * @param t - Interpolation factor (0-1)
 * @returns The interpolated value
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1);
}

/**
 * Normalize a value from a [min, max] range to [0, 1].
 *
 * @example
 * ```ts
 * import { normalize } from '@rottay/design-system';
 *
 * normalize(50, 0, 100);  // 0.5
 * normalize(0, 0, 100);   // 0
 * normalize(100, 0, 100); // 1
 * ```
 *
 * @param value - The value to normalize
 * @param min - Range minimum
 * @param max - Range maximum
 * @returns The normalized value (0-1), clamped
 */
export function normalize(value: number, min: number, max: number): number {
  if (max === min) {
    return 0;
  }
  return clamp((value - min) / (max - min), 0, 1);
}

/**
 * Remap a value from one range to another.
 *
 * @example
 * ```ts
 * import { remap } from '@rottay/design-system';
 *
 * remap(50, 0, 100, 0, 1);    // 0.5
 * remap(5, 0, 10, 0, 100);    // 50
 * remap(0.5, 0, 1, -100, 100); // 0
 * ```
 *
 * @param value - The value to remap
 * @param inMin - Input range minimum
 * @param inMax - Input range maximum
 * @param outMin - Output range minimum
 * @param outMax - Output range maximum
 * @returns The remapped value
 */
export function remap(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  const t = normalize(value, inMin, inMax);
  return lerp(outMin, outMax, t);
}

/**
 * Round a number to N decimal places.
 *
 * @example
 * ```ts
 * import { roundTo } from '@rottay/design-system';
 *
 * roundTo(3.14159, 2); // 3.14
 * roundTo(3.14159, 0); // 3
 * roundTo(1.005, 2);   // 1.01
 * ```
 *
 * @param value - The value to round
 * @param decimals - Number of decimal places (must be >= 0)
 * @returns The rounded value
 */
export function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, Math.max(0, Math.round(decimals)));
  return Math.round(value * factor) / factor;
}

/**
 * Generate an array of numbers from start to end (exclusive) with an optional step.
 *
 * @example
 * ```ts
 * import { range } from '@rottay/design-system';
 *
 * range(0, 5);       // [0, 1, 2, 3, 4]
 * range(0, 10, 2);   // [0, 2, 4, 6, 8]
 * range(5, 0, -1);   // [5, 4, 3, 2, 1]
 * ```
 *
 * @param start - Start of range (inclusive)
 * @param end - End of range (exclusive)
 * @param step - Step increment (defaults to 1 or -1 based on direction)
 * @returns Array of numbers
 */
export function range(start: number, end: number, step?: number): number[] {
  const resolvedStep = step ?? (start <= end ? 1 : -1);

  if (resolvedStep === 0) {
    return [];
  }

  if ((resolvedStep > 0 && start >= end) || (resolvedStep < 0 && start <= end)) {
    return [];
  }

  const result: number[] = [];
  if (resolvedStep > 0) {
    for (let i = start; i < end; i += resolvedStep) {
      result.push(i);
    }
  } else {
    for (let i = start; i > end; i += resolvedStep) {
      result.push(i);
    }
  }

  return result;
}
