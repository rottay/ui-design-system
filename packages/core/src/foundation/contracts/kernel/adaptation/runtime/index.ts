/**
 * @fileoverview Resolution of an `adapt` slot at the postures in force.
 *
 * @module Contracts/Kernel/Adaptation/Runtime
 * @category Types
 * @package @rottay/design-system
 */

import type { Adapt, ResolvedPosture } from '../foundation';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

function mergeLayer<A extends object>(target: A, layer: Partial<A> | undefined): A {
  if (!layer) return target;
  const merged: Record<string, unknown> = { ...(target as Record<string, unknown>) };
  for (const [key, value] of Object.entries(layer)) {
    if (value === undefined) continue;
    const current = merged[key];
    merged[key] =
      isPlainObject(current) && isPlainObject(value) ? mergeLayer(current, value) : value;
  }
  return merged as A;
}

/**
 * The adaptation in force at a posture.
 *
 * Layers apply in a fixed order: the family base, the family's own posture
 * defaults, then the application's `adapt`. Within each source the container
 * entry applies after the viewport entry, because the box is the more specific
 * fact. Objects merge key by key; arrays and scalars replace.
 */
export function resolveAdaptation<A extends object>(
  base: A,
  posture: ResolvedPosture,
  adapt?: Adapt<Partial<A>>,
  familyDefaults?: Adapt<Partial<A>>,
): A {
  const layers: Array<Partial<A> | undefined> = [
    familyDefaults?.[posture.viewport],
    posture.container ? familyDefaults?.[posture.container] : undefined,
    adapt?.[posture.viewport],
    posture.container ? adapt?.[posture.container] : undefined,
  ];
  return layers.reduce<A>((resolved, layer) => mergeLayer(resolved, layer), base);
}
