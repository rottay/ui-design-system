/**
 * @fileoverview Injective change-detection keys for render-cheap effect guards.
 *
 * WHY THIS EXISTS. Several runtime effects avoid `JSON.stringify` on every
 * render by folding the fields they read into a short string and comparing
 * that instead. The folding was done by concatenation -- `values.join('|')`,
 * `` `${k}=${v}` ``, or in one case bare `a + b + c` with no separator at all.
 * Concatenation is not injective, so two DIFFERENT inputs can produce the SAME
 * key, and an effect guarded by that key then does not re-run. The DOM keeps
 * the previous tenant's values and nothing reports an error.
 *
 * These are not theoretical. A separator only works if it cannot occur in the
 * data, and every one of these keys carries values that can contain it:
 *
 *   - font stacks are user data and routinely contain punctuation, so
 *     `fontFamilyBase = 'A|B'` with `fontFamilyHeading` unset produces the
 *     same `join('|')` as `fontFamilyBase = 'A'` with `fontFamilyHeading = 'B'`;
 *   - a variable map encoded as `` `${name}=${value}` `` joined by `|` cannot
 *     tell `{ '--a': 'b|--c=d' }` (ONE entry) from `{ '--a': 'b', '--c': 'd' }`
 *     (TWO entries) -- same key, different DOM;
 *   - and an unseparated `a + b + c` collides whenever a boundary can slide,
 *     which for adjacent free-text fields is always.
 *
 * THE ENCODING. Every part is LENGTH-PREFIXED and TYPE-TAGGED, and the tuple
 * records its own arity:
 *
 *     changeKey('A|B', undefined)  ->  2#s3:A|Bu
 *     changeKey('A', 'B')          ->  2#s1:As1:B
 *
 * A length prefix cannot be forged by the data it precedes, so no value can
 * impersonate a boundary and no boundary can slide. The arity keeps tuples of
 * different length apart, which is what separates a one-entry map from a
 * two-entry one. The output is a decodable serialization rather than a hash:
 * injectivity is structural, not probabilistic, so there is no collision
 * probability to reason about and a key that differs is genuinely a change.
 *
 * These keys are for change detection ONLY. They are not identifiers, not
 * cache keys shared across processes, and not stable across a change to this
 * encoding -- a key is only ever compared against another key produced by the
 * same build.
 *
 * @module Runtime/Foundation/ChangeKey
 * @package @rottay/design-system
 */

/** A scalar an effect can read directly out of config. */
export type ChangeKeyPart = string | number | boolean | null | undefined;

/**
 * Tags distinguish the inhabited types from each other, so `undefined`, `null`,
 * `false`, the empty string and the number 0 are four different keys rather
 * than four spellings of "nothing". An effect that treats them differently --
 * and `?? fallback` versus `|| fallback` versus a truthiness guard all do --
 * must be able to see the difference.
 */
function encodePart(part: ChangeKeyPart): string {
  if (part === undefined) return 'u';
  if (part === null) return 'n';
  if (typeof part === 'boolean') return part ? 'T' : 'F';
  if (typeof part === 'number') {
    const digits = String(part);
    return `d${digits.length}:${digits}`;
  }
  return `s${part.length}:${part}`;
}

/**
 * Folds an ordered tuple of scalars into an injective key.
 *
 * Order is significant and is the CALLER's contract: pass the same fields in
 * the same order on every render, exactly as the previous `join('|')` sites
 * did. What changes is that the result can no longer collide.
 */
export function changeKey(...parts: readonly ChangeKeyPart[]): string {
  let encoded = '';
  for (const part of parts) encoded += encodePart(part);
  return `${parts.length}#${encoded}`;
}

/**
 * Folds a string map into an injective key.
 *
 * Keys are SORTED, so two maps that differ only in insertion order fold to the
 * same key and do not re-run the effect -- object key order is not observable
 * to the DOM, so treating it as a change would be a spurious re-run. Absent
 * and empty are kept distinct: a caller that stopped passing a map at all is
 * not the same as one that passed an empty one, because only the first leaves
 * the previous claims to be released by somebody else.
 */
export function changeKeyOfMap(
  map: Readonly<Record<string, string | undefined>> | undefined | null,
): string {
  if (map === undefined) return 'u';
  if (map === null) return 'n';

  const names = Object.keys(map).sort();
  const parts: ChangeKeyPart[] = [];
  for (const name of names) {
    parts.push(name, map[name]);
  }
  return changeKey(...parts);
}
