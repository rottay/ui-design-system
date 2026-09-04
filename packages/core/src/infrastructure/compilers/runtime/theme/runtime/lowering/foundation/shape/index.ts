/**
 * @fileoverview Shape hygiene for compiled inputs: drop absent leaves before they lower.
 *
 * @module Compilers/Theme/Lowering/Foundation/shape
 * @category Compilers
 * @package @rottay/design-system
 */

/**
 * Drop own-enumerable keys whose value is `undefined` before a spread.
 *
 * The ISO bridge materializes COMPLETE containers, so a resolved `Theme` lowered
 * back through the governed intake carries role keys that are present with the
 * value `undefined`. A plain spread copies those keys and stomps the layer below
 * it — the engine defaults inside the role emitter, and the authored label case
 * in its caller — after which `String(undefined)` ships the literal text
 * "undefined" as a CSS value. Compacting the spread SOURCE (never the guards,
 * never the precedence order) is what makes the two lowerings agree: an authored
 * value still wins, and a key that carries no value simply does not participate.
 */
export function omitUndefined<T extends object>(source: T | undefined): Partial<T> {
  if (source === undefined) return {};
  const compacted: Partial<T> = {};
  // Entries, not computed reads. `T extends object` includes functions, so
  // `source[key]` is indistinguishable from a capability escape
  // (`obj[k].constructor` reaching `Function`) to the dependency-honesty
  // analyser that guards this package's runtime edges. `Object.entries` walks
  // the same own enumerable string keys in the same order and hands over the
  // values directly. Same compaction, nothing left to prove.
  for (const [key, value] of Object.entries(source as Record<string, unknown>)) {
    if (value !== undefined) compacted[key as keyof T] = value as T[keyof T];
  }
  return compacted;
}
