/**
 * Canonical JSON contract.
 *
 * The cross-realm cases use `node:vm` so the objects under test are built by a
 * genuinely different `Object` constructor -- not a simulation of one. The
 * realm guard at the top of that block asserts the property that makes the rest
 * of the block meaningful: these objects really do fail the prototype-identity
 * test that the predicate used to rely on.
 */
import { createContext, runInContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import {
  CanonicalJsonError,
  canonicalizeJsonValue,
  compareCodeUnits,
  isCanonicalJsonObject,
  normalizeCanonicalJsonValue,
} from '..';

const realm = createContext({});
const inRealm = <T = unknown>(source: string): T => runInContext(`(${source})`, realm) as T;

/** The `failure` code of the thrown error, or `null` when nothing was thrown. */
function failureOf(value: unknown): string | null {
  try {
    canonicalizeJsonValue(value);
    return null;
  } catch (error) {
    return error instanceof CanonicalJsonError ? error.failure : `unexpected:${String(error)}`;
  }
}

describe('cross-realm recognition', () => {
  it('builds objects that genuinely fail the prototype-identity test', () => {
    const foreign = inRealm<object>('{ a: 1 }');

    expect(Object.getPrototypeOf(foreign)).not.toBe(Object.prototype);
    expect(foreign instanceof Object).toBe(false);
  });

  it('canonicalizes a cross-realm object identically to its same-realm twin', () => {
    const foreign = inRealm('{ b: 1, a: "  padded  ", nested: { z: [3, 2, { q: true }], y: null } }');
    const local = { b: 1, a: '  padded  ', nested: { z: [3, 2, { q: true }], y: null } };

    expect(canonicalizeJsonValue(foreign)).toBe(canonicalizeJsonValue(local));
    expect(canonicalizeJsonValue(foreign)).toBe(
      '{"a":"padded","b":1,"nested":{"y":null,"z":[3,2,{"q":true}]}}',
    );
  });

  it('accepts cross-realm arrays and cross-realm null-prototype objects', () => {
    expect(canonicalizeJsonValue(inRealm('[1, { a: 2 }]'))).toBe('[1,{"a":2}]');
    expect(canonicalizeJsonValue(inRealm('Object.assign(Object.create(null), { a: 1 })'))).toBe(
      '{"a":1}',
    );
  });

  it('still rejects cross-realm class instances, Dates and Maps', () => {
    // Realm safety must not degrade into "trust anything from another realm".
    // A predicate that walked the prototype chain to its terminal member would
    // accept the class instance here, because that terminal member IS a
    // well-formed `Object.prototype`.
    expect(failureOf(inRealm('new (class Foo { constructor() { this.a = 1; } })()'))).toBe(
      'unsupported-value',
    );
    expect(failureOf(inRealm('new Date(0)'))).toBe('unsupported-value');
    expect(failureOf(inRealm('new Map([["a", 1]])'))).toBe('unsupported-value');
  });
});

describe('canonical form', () => {
  it('is independent of authored key order', () => {
    const ordered = { alpha: 1, beta: { gamma: 2, delta: 3 }, epsilon: [{ a: 1, b: 2 }] };
    const reversed = { epsilon: [{ b: 2, a: 1 }], beta: { delta: 3, gamma: 2 }, alpha: 1 };

    expect(canonicalizeJsonValue(ordered)).toBe(canonicalizeJsonValue(reversed));
    expect(canonicalizeJsonValue(ordered)).toBe(
      '{"alpha":1,"beta":{"delta":3,"gamma":2},"epsilon":[{"a":1,"b":2}]}',
    );
  });

  it('sorts by UTF-16 code unit rather than host locale collation', () => {
    // `localeCompare` orders "a" before "B"; code units do not. A digest must
    // not depend on which ICU data the host shipped.
    expect(canonicalizeJsonValue({ a: 1, B: 2 })).toBe('{"B":2,"a":1}');
    expect(compareCodeUnits('B', 'a')).toBe(-1);
  });

  it('survives a JSON round-trip unchanged', () => {
    const value = {
      palette: { primary: '#0F766E', accent: null },
      scales: [1, 2.5, -3],
      flags: { on: true, off: false },
      text: 'value',
    };
    const canonical = canonicalizeJsonValue(value);

    expect(canonicalizeJsonValue(JSON.parse(canonical))).toBe(canonical);
    expect(canonicalizeJsonValue(JSON.parse(JSON.stringify(value)))).toBe(canonical);
  });

  it('trims string edges and folds negative zero', () => {
    expect(canonicalizeJsonValue({ a: '  x  ', b: -0, c: [' y '] })).toBe(
      '{"a":"x","b":0,"c":["y"]}',
    );
  });

  it('accepts a null-prototype object and JSON primitives at the root', () => {
    expect(canonicalizeJsonValue(Object.assign(Object.create(null), { b: 1, a: 2 }))).toBe(
      '{"a":2,"b":1}',
    );
    expect(canonicalizeJsonValue('  s  ')).toBe('"s"');
    expect(canonicalizeJsonValue(7)).toBe('7');
    expect(canonicalizeJsonValue(true)).toBe('true');
    expect(canonicalizeJsonValue(null)).toBe('null');
    expect(canonicalizeJsonValue([])).toBe('[]');
  });

  it('treats a repeated reference as a DAG, not a cycle', () => {
    // The cycle guard tracks the current path, not every container it has ever
    // seen. A shared sub-object is legal JSON and must still canonicalize.
    const shared = { a: 1 };

    expect(canonicalizeJsonValue({ left: shared, right: shared })).toBe(
      '{"left":{"a":1},"right":{"a":1}}',
    );
    expect(canonicalizeJsonValue([shared, shared])).toBe('[{"a":1},{"a":1}]');
  });

  it('drops symbol-keyed properties exactly as JSON.stringify does', () => {
    const value = { a: 1, [Symbol('hidden')]: 2 };

    expect(canonicalizeJsonValue(value)).toBe('{"a":1}');
  });

  it('returns a value tree, not a string, from the normalizer', () => {
    expect(normalizeCanonicalJsonValue({ b: 1, a: 2 })).toEqual({ a: 2, b: 1 });
    expect(Object.keys(normalizeCanonicalJsonValue({ b: 1, a: 2 }) as object)).toEqual(['a', 'b']);
  });
});

describe('rejection with stable failure codes', () => {
  it.each([
    ['class instance', new (class Widget {})()],
    ['Date', new Date(0)],
    ['Map', new Map([['a', 1]])],
    ['Set', new Set([1])],
    ['RegExp', /x/],
    ['function', () => undefined],
    ['symbol', Symbol('s')],
    ['bigint', 10n],
    ['undefined', undefined],
    ['boxed String', new String('x')],
  ])('rejects %s at the root as unsupported-value', (_label, value) => {
    expect(failureOf(value)).toBe('unsupported-value');
    expect(isCanonicalJsonObject(value)).toBe(false);
  });

  it('rejects a DOM node', () => {
    expect(failureOf(document.createElement('div'))).toBe('unsupported-value');
  });

  it.each([
    ['NaN', Number.NaN],
    ['Infinity', Number.POSITIVE_INFINITY],
    ['-Infinity', Number.NEGATIVE_INFINITY],
  ])('rejects %s as non-finite-number', (_label, value) => {
    expect(failureOf(value)).toBe('non-finite-number');
    expect(failureOf({ nested: { deep: value } })).toBe('non-finite-number');
  });

  it.each([
    ['undefined', undefined],
    ['function', () => undefined],
    ['symbol', Symbol('s')],
    ['bigint', 10n],
  ])('rejects a %s property as unsupported-property', (_label, value) => {
    expect(failureOf({ key: value })).toBe('unsupported-property');
  });

  it('rejects a self-referencing object as circular-reference', () => {
    const cyclic: Record<string, unknown> = { a: 1 };
    cyclic.self = cyclic;

    expect(failureOf(cyclic)).toBe('circular-reference');
  });

  it('rejects an indirect and an array-mediated cycle as circular-reference', () => {
    const parent: Record<string, unknown> = {};
    const child: Record<string, unknown> = { parent };
    parent.child = child;

    const list: unknown[] = [];
    list.push(list);

    expect(failureOf(parent)).toBe('circular-reference');
    expect(failureOf(list)).toBe('circular-reference');
  });

  it('reports the path of the offending value', () => {
    let thrown: CanonicalJsonError | undefined;
    try {
      canonicalizeJsonValue({ palette: { scales: [1, Number.NaN] } });
    } catch (error) {
      thrown = error as CanonicalJsonError;
    }

    expect(thrown?.failure).toBe('non-finite-number');
    expect(thrown?.path).toBe('$.palette.scales[1]');
    expect(thrown).toBeInstanceOf(TypeError);
  });

  it('quotes a non-identifier key in the reported path', () => {
    let thrown: CanonicalJsonError | undefined;
    try {
      canonicalizeJsonValue({ '--ds-radius-md': undefined });
    } catch (error) {
      thrown = error as CanonicalJsonError;
    }

    expect(thrown?.path).toBe('$["--ds-radius-md"]');
  });
});

describe('isCanonicalJsonObject', () => {
  it('accepts plain objects from this realm, another realm and a null prototype', () => {
    expect(isCanonicalJsonObject({})).toBe(true);
    expect(isCanonicalJsonObject(JSON.parse('{"a":1}'))).toBe(true);
    expect(isCanonicalJsonObject(Object.create(null))).toBe(true);
    expect(isCanonicalJsonObject(Object.create(Object.prototype))).toBe(true);
    expect(isCanonicalJsonObject(inRealm('{ a: 1 }'))).toBe(true);
  });

  it('rejects arrays, null and non-objects', () => {
    expect(isCanonicalJsonObject([])).toBe(false);
    expect(isCanonicalJsonObject(inRealm('[1]'))).toBe(false);
    expect(isCanonicalJsonObject(null)).toBe(false);
    expect(isCanonicalJsonObject('x')).toBe(false);
  });

  it('rejects an object whose prototype chain does not terminate at Object', () => {
    // `Object.create(Object.create(null))` is structurally plain but its
    // immediate prototype is not an `Object` prototype in any realm. Failing
    // closed on it is cheaper than reasoning about what such a chain means.
    expect(isCanonicalJsonObject(Object.create(Object.create(null)))).toBe(false);
  });

  it('rejects an object that brands itself with a foreign toStringTag', () => {
    expect(isCanonicalJsonObject({ [Symbol.toStringTag]: 'Widget', a: 1 })).toBe(false);
  });

  it('ignores an own constructor property masquerading as Object', () => {
    // Plainness is decided from the immediate PROTOTYPE, and no `constructor`
    // is read at any point, so a payload key by that name cannot vote on it.
    expect(isCanonicalJsonObject({ constructor: 'Object' })).toBe(true);
    expect(isCanonicalJsonObject(new (class Widget {})())).toBe(false);

    const spoofed = new (class Widget {})() as Record<string, unknown>;
    spoofed.constructor = function Object() {};
    expect(isCanonicalJsonObject(spoofed)).toBe(false);
  });

  it('rejects class instances at every depth of the prototype chain', () => {
    // The rejection most easily lost by a looser predicate. Each value here has
    // `Object.prototype` as the TERMINAL member of its chain, so only a test of
    // the immediate prototype tells them apart from a literal.
    class Base {}
    class Derived extends Base {}
    class Tagged {
      readonly a = 1;
    }

    expect(isCanonicalJsonObject(new Base())).toBe(false);
    expect(isCanonicalJsonObject(new Derived())).toBe(false);
    expect(isCanonicalJsonObject(new Tagged())).toBe(false);
    expect(isCanonicalJsonObject(Object.create(Tagged.prototype))).toBe(false);
    expect(isCanonicalJsonObject(inRealm('new (class Foo { })()'))).toBe(false);
  });
});
