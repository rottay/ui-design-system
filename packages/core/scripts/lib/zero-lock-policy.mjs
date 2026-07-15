/**
 * Total, fail-closed baseline policy for engine-token-audit (WO-GAT-07).
 *
 * Counter maps are deliberately JSON-shaped: a plain/null-prototype object
 * containing enumerable own string data properties whose values are
 * non-negative safe integers. Exotic objects are rejected as data instead of
 * being observed through getters/proxy traps or silently treated as empty.
 */
import { types as utilTypes } from 'node:util';

function safeDisplay(value) {
  try {
    return String(value);
  } catch {
    return '<unprintable>';
  }
}

function inspectCounterMap(name, value) {
  const errors = [];
  const entries = [];
  const keys = new Set();

  try {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      return { errors: [`${name} must be a plain or null-prototype object`], entries, keys };
    }
    if (utilTypes.isProxy(value)) {
      return { errors: [`${name} must not be a Proxy`], entries, keys };
    }

    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      return { errors: [`${name} must be a plain or null-prototype object`], entries, keys };
    }

    const ownKeys = Reflect.ownKeys(value);
    const descriptors = Object.getOwnPropertyDescriptors(value);
    for (const key of ownKeys) {
      if (typeof key !== 'string') {
        errors.push(`${name} contains a symbol counter key`);
        continue;
      }
      const descriptor = descriptors[key];
      if (!descriptor || !descriptor.enumerable || !Object.hasOwn(descriptor, 'value')) {
        errors.push(`${name}.${key || '<empty>'} must be an enumerable own data property`);
        continue;
      }
      keys.add(key);
      const count = descriptor.value;
      entries.push([key, count]);
      if (!key.trim()) errors.push(`${name} contains an empty counter key`);
      if (!Number.isSafeInteger(count) || count < 0) {
        errors.push(`${name}.${key} must be a non-negative safe integer; got ${safeDisplay(count)}`);
      }
    }
  } catch (error) {
    errors.push(`${name} could not be inspected safely: ${error instanceof Error ? error.message : safeDisplay(error)}`);
  }

  return { errors, entries, keys };
}

function inspectPolicyMaps({ baseline, subjectName, subject, exact, minimum }) {
  const inspected = {
    baseline: inspectCounterMap('baseline', baseline),
    subject: inspectCounterMap(subjectName, subject),
    exact: inspectCounterMap('exact', exact),
    minimum: inspectCounterMap('minimum', minimum),
  };
  const errors = Object.values(inspected).flatMap((entry) => entry.errors);
  if (errors.length > 0) return { inspected, errors };

  for (const key of [...inspected.subject.keys].filter((key) => !inspected.baseline.keys.has(key)).sort()) {
    const value = inspected.subject.entries.find(([entry]) => entry === key)?.[1];
    errors.push(`counter has no baseline: ${key}=${value}`);
  }
  for (const key of [...inspected.baseline.keys].filter((key) => !inspected.subject.keys.has(key)).sort()) {
    errors.push(`baseline counter disappeared: ${key}`);
  }

  for (const key of [...inspected.exact.keys].sort()) {
    if (inspected.minimum.keys.has(key)) errors.push(`counter cannot be both exact and minimum-governed: ${key}`);
    if (!inspected.baseline.keys.has(key)) errors.push(`exact invariant has no baseline counter: ${key}`);
    if (!inspected.subject.keys.has(key)) errors.push(`exact invariant has no ${subjectName} counter: ${key}`);
  }
  for (const key of [...inspected.minimum.keys].sort()) {
    if (!inspected.baseline.keys.has(key)) errors.push(`minimum floor has no baseline counter: ${key}`);
    if (!inspected.subject.keys.has(key)) errors.push(`minimum floor has no ${subjectName} counter: ${key}`);
  }

  return { inspected, errors };
}

function entryMap(inspected) {
  return new Map(inspected.entries);
}

/** Validate a normal audit check without throwing for adversarial input. */
export function evaluateZeroLockCheck({ baseline, current, exact = {}, minimum = {} } = {}) {
  const { inspected, errors } = inspectPolicyMaps({
    baseline,
    subjectName: 'current',
    subject: current,
    exact,
    minimum,
  });
  if (errors.length > 0) return { ok: false, errors };

  const baselineValues = entryMap(inspected.baseline);
  const currentValues = entryMap(inspected.subject);
  const exactValues = entryMap(inspected.exact);
  const minimumValues = entryMap(inspected.minimum);

  for (const [key, required] of exactValues) {
    const count = currentValues.get(key);
    if (count !== required) errors.push(`exact invariant broken: ${key}=${count}; required ${required}`);
    if (baselineValues.get(key) !== required) {
      errors.push(`exact baseline drift: ${key} baseline=${baselineValues.get(key)}; required ${required}`);
    }
  }

  for (const [key, required] of minimumValues) {
    const count = currentValues.get(key);
    if (count < required) errors.push(`below minimum floor: ${key}=${count}; required >=${required}`);
    if (baselineValues.get(key) < required) {
      errors.push(`minimum baseline drift: ${key} baseline=${baselineValues.get(key)}; required >=${required}`);
    }
  }

  for (const [key, count] of currentValues) {
    if (exactValues.has(key) || minimumValues.has(key)) continue;
    const ceiling = baselineValues.get(key);
    if (count > ceiling) errors.push(`ceiling regression: ${key}=${count}; baseline=${ceiling}`);
    if (count === 0 && ceiling > 0) {
      errors.push(`completed zero retains slack: ${key}=0; baseline=${ceiling} must be tightened to 0`);
    }
  }

  return { ok: errors.length === 0, errors };
}

/** Validate the candidate written by --update-baseline without throwing. */
export function evaluateBaselineTightening({ baseline, candidate, exact = {}, minimum = {} } = {}) {
  const { inspected, errors } = inspectPolicyMaps({
    baseline,
    subjectName: 'candidate',
    subject: candidate,
    exact,
    minimum,
  });
  if (errors.length > 0) {
    return {
      ok: false,
      errors: errors.map((error) => error.startsWith('counter has no baseline:')
        ? error.replace('counter has no baseline:', 'new counter requires an explicit reviewed baseline entry:')
        : error.startsWith('baseline counter disappeared:')
        ? error.replace('baseline counter disappeared:', 'baseline counter cannot be deleted by update:')
        : error),
    };
  }

  const baselineValues = entryMap(inspected.baseline);
  const candidateValues = entryMap(inspected.subject);
  const exactValues = entryMap(inspected.exact);
  const minimumValues = entryMap(inspected.minimum);

  for (const [key, count] of candidateValues) {
    const previous = baselineValues.get(key);
    if (count > previous) errors.push(`baseline update would absorb an increase: ${key} ${previous} -> ${count}`);
  }
  for (const [key, required] of exactValues) {
    const count = candidateValues.get(key);
    if (count !== required) errors.push(`candidate breaks exact invariant: ${key}=${count}; required ${required}`);
    if (baselineValues.get(key) !== required) {
      errors.push(`exact baseline drift: ${key} baseline=${baselineValues.get(key)}; required ${required}`);
    }
  }
  for (const [key, required] of minimumValues) {
    const count = candidateValues.get(key);
    if (count < required) errors.push(`candidate falls below minimum floor: ${key}=${count}; required >=${required}`);
    if (baselineValues.get(key) < required) {
      errors.push(`minimum baseline drift: ${key} baseline=${baselineValues.get(key)}; required >=${required}`);
    }
  }

  return { ok: errors.length === 0, errors };
}

/**
 * Categorize baseline values by governance mode. Invalid input is represented
 * as a structured failure rather than throwing.
 */
export function summarizeZeroLocks(baseline, { exact = {}, minimum = {} } = {}) {
  const baselineMap = inspectCounterMap('baseline', baseline);
  const exactMap = inspectCounterMap('exact', exact);
  const minimumMap = inspectCounterMap('minimum', minimum);
  const errors = [...baselineMap.errors, ...exactMap.errors, ...minimumMap.errors];
  for (const key of exactMap.keys) {
    if (minimumMap.keys.has(key)) errors.push(`counter cannot be both exact and minimum-governed: ${key}`);
    if (!baselineMap.keys.has(key)) errors.push(`exact invariant has no baseline counter: ${key}`);
  }
  for (const key of minimumMap.keys) {
    if (!baselineMap.keys.has(key)) errors.push(`minimum floor has no baseline counter: ${key}`);
  }
  const empty = {
    counters: 0,
    zeroLocked: 0,
    positiveGoverned: 0,
    ordinaryCeilings: 0,
    positiveOrdinaryCeilings: 0,
    exactInvariants: 0,
    positiveExactInvariants: 0,
    minimumFloors: 0,
    positiveMinimumFloors: 0,
  };
  if (errors.length > 0) return { ok: false, errors, ...empty };

  const values = entryMap(baselineMap);
  const positive = (keys) => [...keys].filter((key) => values.get(key) > 0).length;
  const ordinaryKeys = new Set([...baselineMap.keys].filter(
    (key) => !exactMap.keys.has(key) && !minimumMap.keys.has(key),
  ));
  return {
    ok: true,
    errors: [],
    counters: baselineMap.entries.length,
    zeroLocked: baselineMap.entries.filter(([, value]) => value === 0).length,
    positiveGoverned: baselineMap.entries.filter(([, value]) => value > 0).length,
    ordinaryCeilings: ordinaryKeys.size,
    positiveOrdinaryCeilings: positive(ordinaryKeys),
    exactInvariants: exactMap.keys.size,
    positiveExactInvariants: positive(exactMap.keys),
    minimumFloors: minimumMap.keys.size,
    positiveMinimumFloors: positive(minimumMap.keys),
  };
}
