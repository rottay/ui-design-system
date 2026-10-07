/**
 * Injectivity contract for effect change-detection keys.
 *
 * THE DEFECT THESE PIN. Runtime effects skipped their own re-run when a folded
 * key matched the previous render's. The folding was concatenation -- values
 * joined with `|`, entries spelled `` `${k}=${v}` ``, or in one case a bare
 * `a + b + c` with no separator at all -- so two DIFFERENT inputs could fold to
 * the SAME key. The effect then did not re-run: the DOM kept the previous
 * tenant's values, no claim was released, no error was reported, and the only
 * symptom was a stale document.
 *
 * Every drill below is a pair of inputs that MUST fold apart. The first two
 * are the exact reproduced collisions.
 */

import { describe, it, expect } from 'vitest';

import { changeKey, changeKeyOfMap } from '..';

describe('changeKey', () => {
  it('DRILL: a font value containing the old separator does not collide', () => {
    // `[b.fontFamilyBase, b.fontFamilyHeading].join('|')` folded both of these
    // to "A|B". Font stacks are tenant data; the separator is not reserved.
    const oneFieldCarryingTheSeparator = changeKey('A|B', undefined);
    const twoSeparateFields = changeKey('A', 'B');

    expect(oneFieldCarryingTheSeparator).not.toBe(twoSeparateFields);
  });

  it('DRILL: an unseparated concatenation boundary cannot slide', () => {
    // `visualAuthority + brandingKey + ...` had no separator at all, so any
    // boundary between two free-text fields could move.
    expect(changeKey('provider', 'compiled')).not.toBe(changeKey('providercom', 'piled'));
  });

  it('keeps absent, null, empty and false apart', () => {
    // `?? fallback`, `|| fallback` and a truthiness guard all read these
    // differently, so a key that conflates them hides a real input change.
    const keys = [
      changeKey(undefined),
      changeKey(null),
      changeKey(''),
      changeKey(false),
      changeKey(0),
      changeKey('0'),
    ];

    expect(new Set(keys).size).toBe(keys.length);
  });

  it('distinguishes arity, so a dropped trailing field is a change', () => {
    expect(changeKey('a')).not.toBe(changeKey('a', undefined));
  });

  it('is stable for equal input', () => {
    expect(changeKey('a', 1, true, null)).toBe(changeKey('a', 1, true, null));
  });
});

describe('changeKeyOfMap', () => {
  it('DRILL: one entry carrying the delimiters does not collide with two entries', () => {
    // The reproduced appearance-vars collision:
    //   Object.entries(v).map(([k, v]) => `${k}=${v}`).join('|')
    // folded both of these to "--a=b|--c=d".
    const oneEntry = changeKeyOfMap({ '--a': 'b|--c=d' });
    const twoEntries = changeKeyOfMap({ '--a': 'b', '--c': 'd' });

    expect(oneEntry).not.toBe(twoEntries);
  });

  it('DRILL: a value that impersonates a key boundary does not collide', () => {
    expect(changeKeyOfMap({ '--a': 'b=c' })).not.toBe(changeKeyOfMap({ '--a=b': 'c' }));
  });

  it('folds insertion order away, because the DOM cannot observe it', () => {
    expect(changeKeyOfMap({ '--a': '1', '--b': '2' })).toBe(
      changeKeyOfMap({ '--b': '2', '--a': '1' }),
    );
  });

  it('keeps an absent map apart from an empty one', () => {
    // Only the first leaves previously claimed variables for somebody else to
    // release; conflating them skips the release.
    expect(changeKeyOfMap(undefined)).not.toBe(changeKeyOfMap({}));
    expect(changeKeyOfMap(null)).not.toBe(changeKeyOfMap({}));
  });

  it('DRILL: dropping one entry from a rerender changes the key', () => {
    // The rerender case: the claimed set shrinks, so the effect MUST re-run to
    // release what is no longer declared.
    const before = changeKeyOfMap({ '--a': '1', '--b': '2' });
    const after = changeKeyOfMap({ '--a': '1' });

    expect(before).not.toBe(after);
  });

  it('DRILL: changing one value of many changes the key', () => {
    expect(changeKeyOfMap({ '--a': '1', '--b': '2' })).not.toBe(
      changeKeyOfMap({ '--a': '1', '--b': '3' }),
    );
  });
});
