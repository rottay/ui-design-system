/**
 * @fileoverview The fixture roster, and the rule that keeps it honest.
 *
 * A fixture is an element shape plus the properties to read off it. The shape
 * is not invented: it is read back off the CSS, because the selectors state
 * exactly what an element must carry to be matched. `.ds-card.ds-card--modern[data-part='root'][data-radius='md']`
 * is a complete specification of a DOM node.
 *
 * THE FAILURE MODE THIS CLOSES. A fixture whose classes stop matching still
 * produces readings — the browser returns the initial value for every property
 * and the run looks green. That is a lying counter. So every fixture declares
 * `requiresSelectors`, and `validateFixture` asserts each string occurs
 * verbatim in the CSS about to be measured. A fixture that no longer matches is
 * reported as `unmatched`, and its readings are withheld rather than published
 * as zeros.
 *
 * DETERMINISM OVER COVERAGE. Six fixtures, hand-derived and self-verifying,
 * beat a generated hundred that two runs disagree about. Two of the six are
 * positive controls that read a dial with no indirection: if they do not move
 * when the dial turns, every 'inert' verdict in the same run is void.
 *
 * @module Tooling/ResolutionProbe/Foundation/Roster
 */

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

/** @type {{note: string, fixtures: Array<object>}} */
const ROSTER = JSON.parse(readFileSync(resolve(HERE, 'fixtures.json'), 'utf-8'));

export const ROSTER_NOTE = ROSTER.note;

/** Every fixture, in declared order. Frozen: a run must not mutate the roster. */
export const FIXTURES = Object.freeze(
  ROSTER.fixtures.map((fixture) => Object.freeze({ ...fixture })),
);

export const FIXTURE_IDS = Object.freeze(FIXTURES.map((fixture) => fixture.id));

export function getFixtures(ids) {
  if (!ids || ids.length === 0) return FIXTURES;
  const known = new Map(FIXTURES.map((fixture) => [fixture.id, fixture]));
  return ids.map((id) => {
    const fixture = known.get(id);
    if (!fixture) throw new Error(`unknown fixture: ${id} (known: ${FIXTURE_IDS.join(', ')})`);
    return fixture;
  });
}

/**
 * Checks a fixture's declared selectors against the CSS that will be measured.
 *
 * Verbatim substring match, deliberately. A parsed match would tolerate
 * whitespace and ordering differences that change nothing for the reader but
 * hide the case this guard exists for: the selector was renamed or dropped.
 *
 * @returns {{matched: boolean, missing: string[]}}
 */
export function validateFixture(fixture, css) {
  const missing = (fixture.requiresSelectors ?? []).filter(
    (selector) => !css.includes(selector),
  );
  return { matched: missing.length === 0, missing };
}

/** Every property this roster reads, deduplicated and sorted. */
export function declaredProperties(fixtures = FIXTURES) {
  const properties = new Set();
  for (const fixture of fixtures) {
    for (const target of fixture.targets) {
      for (const property of target.properties) properties.add(property);
    }
  }
  return [...properties].sort();
}

/**
 * Every `fixtureId/targetId` key this roster can actually produce.
 *
 * A negative-control BINDING or a causal `--bind` flag names a target by this
 * exact key. Before this existed, nothing stopped a binding from naming a
 * fixture/target pair the roster had never declared — the key just produced
 * no rows, and an entry scoped to `declared-targets` that names a target
 * absent from EVERY measured scope would fail its own guard eventually, but
 * only downstream and never by naming the fabrication itself.
 */
export const KNOWN_TARGET_KEYS = Object.freeze(
  FIXTURES.flatMap((fixture) => fixture.targets.map((target) => `${fixture.id}/${target.id}`)),
);

/**
 * Fails closed, naming every key that is not a real fixture/target pair.
 *
 * @param {string[]} keys
 * @param {{context?: string}} [options]
 */
export function assertKnownTargetKeys(keys, { context = 'a binding' } = {}) {
  const known = new Set(KNOWN_TARGET_KEYS);
  const unknown = [...new Set(keys)].filter((key) => !known.has(key));
  if (unknown.length > 0) {
    throw new Error(
      `resolution-probe: ${context} names a fixture/target pair this roster does not declare: ` +
        `${unknown.join(', ')}. A binding must name a real "fixtureId/targetId" from ` +
        `FIXTURE_IDS, never one the harness merely wishes existed. Known keys: ` +
        `${KNOWN_TARGET_KEYS.join(', ')}.`,
    );
  }
}

/**
 * Finds real roster fixtures that read every declared control channel on one
 * target. These are the only fixtures eligible to prove control liveness: a
 * radius, colour or unrelated geometry movement on the same fixture cannot
 * certify a rhythm channel.
 */
export function directControlFixtureIds({ fixtures = FIXTURES, channels }) {
  const required = [...new Set(channels ?? [])];
  if (required.length === 0) return [];
  return fixtures
    .filter((fixture) =>
      fixture.targets.some((target) =>
        required.every((channel) => target.properties.includes(channel)),
      ),
    )
    .map((fixture) => fixture.id);
}
