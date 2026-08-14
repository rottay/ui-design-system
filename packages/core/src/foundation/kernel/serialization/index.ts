/**
 * @fileoverview Realm-safe canonical JSON serialization.
 *
 * Canonical form is what makes two structurally equal payloads compare equal
 * and hash equal. The tenant-theme compiler builds artifact digests from it and
 * the theming runtime recognises the RSC appearance echo with it, so both a
 * compiler (composition) owner and a runtime (foundation) owner consume this
 * unit. It therefore lives below both, has no DOM, Node builtin or React
 * dependency, and runs identically in Node SSR, Edge and the browser.
 *
 * Canonical form is defined as: recursively key-sorted by UTF-16 code unit,
 * strings trimmed at the edges, `-0` folded to `0`, and every value restricted
 * to the JSON data model. Anything outside that model throws rather than being
 * coerced, because a lossy coercion would let two different payloads share one
 * digest.
 *
 * Canonical form is therefore lossy BY DESIGN, and must never be used to retain
 * a payload. `cloneJsonValueExact` is the byte-preserving counterpart for
 * callers that need to hold a value rather than compare it.
 */

/**
 * Why a value could not be canonicalized. These codes are the stable contract;
 * message text is diagnostic and must not be parsed.
 */
export type CanonicalJsonFailure =
  | 'non-finite-number'
  | 'unsupported-value'
  | 'unsupported-property'
  | 'circular-reference';

const FAILURE_MESSAGES: Readonly<Record<CanonicalJsonFailure, string>> = {
  'non-finite-number': 'Canonical JSON numbers must be finite',
  'unsupported-value': 'Canonical JSON values must be JSON objects, arrays or primitives',
  'unsupported-property': 'Canonical JSON properties must be JSON-serializable',
  'circular-reference': 'Canonical JSON values must not contain circular references',
};

/**
 * Extends `TypeError` because that is what this module threw before the
 * failures were codified; existing `catch` sites that narrow on `TypeError`
 * keep working unchanged.
 */
export class CanonicalJsonError extends TypeError {
  readonly failure: CanonicalJsonFailure;
  /** Location of the offending value, e.g. `$.palette.primary` or `$.scales[2]`. */
  readonly path: string;

  constructor(failure: CanonicalJsonFailure, path: string) {
    super(`${FAILURE_MESSAGES[failure]} (at ${path})`);
    this.name = 'CanonicalJsonError';
    this.failure = failure;
    this.path = path;
  }
}

/**
 * UTF-16 code-unit comparator. Canonical output must not depend on host locale
 * or ICU data, so every ordering that feeds a digest routes through this single
 * comparator rather than `Array.prototype.sort`'s default or `localeCompare`.
 */
export const compareCodeUnits = (left: string, right: string): number =>
  left < right ? -1 : left > right ? 1 : 0;

const PLAIN_OBJECT_TAG = '[object Object]';
const IDENTIFIER_KEY = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

/**
 * The own members ECMA-262 (20.1.3) mandates on `Object.prototype` in every
 * realm. `constructor` is deliberately absent: reaching a `constructor`
 * property -- directly, by destructuring, or through a property descriptor --
 * is the opening hop of the `value.constructor.constructor('...')` evaluator
 * escape, so recognising a plain object must never depend on it.
 */
const OBJECT_PROTOTYPE_MEMBERS = [
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf',
] as const;

/**
 * A prototype that terminates the chain and carries the `Object.prototype`
 * member signature -- true for `Object.prototype` of ANY realm, false for the
 * prototype of any class, `Date`, `Map`, `Set`, `RegExp` or DOM interface,
 * whose own prototype is in turn `Object.prototype` rather than `null`.
 *
 * Both halves are load-bearing. Termination alone would also accept
 * `Object.create(null)` used as a prototype, which is structurally plain but is
 * not an `Object` prototype in any realm. The signature alone would accept
 * anything that borrowed those names.
 *
 * Membership is asked by name; no property is read. No getter runs, and no
 * callable is materialized out of the value under inspection.
 */
function isTerminalObjectPrototype(prototype: object): boolean {
  if (Object.getPrototypeOf(prototype) !== null) return false;

  return OBJECT_PROTOTYPE_MEMBERS.every((member) =>
    Object.prototype.hasOwnProperty.call(prototype, member),
  );
}

/**
 * Whether a value is a plain, canonicalizable JSON object.
 *
 * Deliberately NOT `Object.getPrototypeOf(value) === Object.prototype`. That
 * test is prototype-IDENTITY based and therefore realm-sensitive: an object
 * literal built in another realm (a `node:vm` context, an iframe, a
 * `structuredClone` implementation that allocates in the host realm) carries
 * that realm's `Object.prototype` and would be rejected as if it were a class
 * instance. Recognition here is structural instead -- the immediate prototype
 * must be `null` or a terminal `Object` prototype from any realm.
 *
 * `Object.create(null)` is accepted: it is the most plain object there is, it
 * round-trips through JSON unchanged, and the previous predicate accepted it.
 *
 * A class instance is still rejected, which is the property most easily lost by
 * a looser predicate: its immediate prototype is `Foo.prototype`, whose own
 * prototype is `Object.prototype` rather than `null`. Walking the chain to its
 * terminal member before testing it would accept every class instance, because
 * that terminal member IS a well-formed `Object.prototype`; this predicate
 * tests the IMMEDIATE prototype only.
 */
export function isCanonicalJsonObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') return false;
  // Cross-realm safe by specification, unlike an `instanceof Array` test.
  if (Array.isArray(value)) return false;
  // Rejects exotic and host objects that carry their own `Symbol.toStringTag`.
  if (Object.prototype.toString.call(value) !== PLAIN_OBJECT_TAG) return false;

  const prototype: unknown = Object.getPrototypeOf(value);
  if (prototype === null) return true;
  return typeof prototype === 'object' && isTerminalObjectPrototype(prototype);
}

function childPath(path: string, key: string): string {
  return IDENTIFIER_KEY.test(key) ? `${path}.${key}` : `${path}[${JSON.stringify(key)}]`;
}

/**
 * `ancestors` holds the containers on the CURRENT path, not every container
 * ever seen. A shared sub-object referenced twice is a directed acyclic graph
 * and canonicalizes fine; only a container that contains itself is a cycle.
 */
function normalize(value: unknown, path: string, ancestors: Set<object>): unknown {
  if (value === null || typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.trim();

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new CanonicalJsonError('non-finite-number', path);
    return Object.is(value, -0) ? 0 : value;
  }

  if (Array.isArray(value)) {
    if (ancestors.has(value)) throw new CanonicalJsonError('circular-reference', path);
    ancestors.add(value);
    // An explicit callback: passing `normalize` to `map` would feed the array
    // index in as the path argument.
    const items = value.map((item, index) => normalize(item, `${path}[${index}]`, ancestors));
    ancestors.delete(value);
    return items;
  }

  if (!isCanonicalJsonObject(value)) throw new CanonicalJsonError('unsupported-value', path);
  if (ancestors.has(value)) throw new CanonicalJsonError('circular-reference', path);
  ancestors.add(value);

  const result: Record<string, unknown> = {};
  for (const key of Object.keys(value).sort(compareCodeUnits)) {
    const child = value[key];
    if (
      child === undefined ||
      typeof child === 'function' ||
      typeof child === 'symbol' ||
      typeof child === 'bigint'
    ) {
      throw new CanonicalJsonError('unsupported-property', childPath(path, key));
    }
    result[key] = normalize(child, childPath(path, key), ancestors);
  }

  ancestors.delete(value);
  return result;
}

/**
 * Canonical JSON value tree: recursively key-sorted, edge-trimmed strings,
 * `-0` folded to `0`. Symbol-keyed properties are not part of the JSON data
 * model and are dropped, exactly as `JSON.stringify` drops them.
 */
export function normalizeCanonicalJsonValue(value: unknown): unknown {
  return normalize(value, '$', new Set<object>());
}

/** Stable JSON serialization with recursively sorted keys and normalized edge whitespace. */
export function canonicalizeJsonValue(value: unknown): string {
  return JSON.stringify(normalizeCanonicalJsonValue(value));
}

/**
 * Structural clone that preserves every byte, restricted to the JSON data model.
 *
 * `JSON.parse(canonicalizeJsonValue(value))` is NOT a clone. Canonical form is
 * built for digests and structural comparison, so it deliberately discards
 * information: it trims string edges and reorders keys. A payload whose exact
 * bytes are load-bearing -- CSS whose trailing newline is part of the artifact,
 * a signature input, anything later compared byte-for-byte -- does not survive
 * that round trip. Canonicalize to compare; clone to retain.
 *
 * The JSON model is enforced rather than coerced, for the same reason
 * `normalize` enforces it: a caller retaining an untrusted payload must not
 * silently admit a `Date`, a class instance or a host object that will behave
 * differently later. Holes in arrays are rejected too -- a hole reads back as
 * `undefined` and is skipped by `every`/`map`, so it can hide a missing element
 * from exactly the ordered-comparison checks a verifier depends on.
 *
 * Every property is read exactly once, so an accessor on the input cannot serve
 * one value to a verifier and a different one to the consumer that follows.
 */
function cloneExact(value: unknown, path: string, ancestors: Set<object>): unknown {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new CanonicalJsonError('non-finite-number', path);
    return value;
  }

  if (Array.isArray(value)) {
    if (ancestors.has(value)) throw new CanonicalJsonError('circular-reference', path);
    ancestors.add(value);
    const items: unknown[] = new Array(value.length);
    for (let index = 0; index < value.length; index += 1) {
      const itemPath = `${path}[${index}]`;
      if (!Object.prototype.hasOwnProperty.call(value, index)) {
        throw new CanonicalJsonError('unsupported-property', itemPath);
      }
      items[index] = cloneExact(value[index], itemPath, ancestors);
    }
    ancestors.delete(value);
    return items;
  }

  if (!isCanonicalJsonObject(value)) throw new CanonicalJsonError('unsupported-value', path);
  if (ancestors.has(value)) throw new CanonicalJsonError('circular-reference', path);
  ancestors.add(value);

  const result: Record<string, unknown> = {};
  for (const key of Object.keys(value)) {
    const child = value[key];
    if (
      child === undefined ||
      typeof child === 'function' ||
      typeof child === 'symbol' ||
      typeof child === 'bigint'
    ) {
      throw new CanonicalJsonError('unsupported-property', childPath(path, key));
    }
    result[key] = cloneExact(child, childPath(path, key), ancestors);
  }

  ancestors.delete(value);
  return result;
}

/**
 * Byte-exact deep clone of a JSON value. Throws `CanonicalJsonError` for
 * anything outside the JSON data model. See `cloneExact` for why this is not
 * interchangeable with a canonicalize round trip.
 */
export function cloneJsonValueExact<T>(value: T): T {
  return cloneExact(value, '$', new Set<object>()) as T;
}
