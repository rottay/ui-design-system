/**
 * NON-PRODUCTIVE SUPPORT. The scripts layer's single reader of the engine
 * roster.
 *
 * The roster is spelled exactly once, in
 * `src/foundation/contracts/kernel/engine-identity/index.ts`. A pre-build `.mjs`
 * cannot import that TypeScript leaf, so this module PARSES it rather than
 * restating it: a second enumeration in a script is the drift `engine-wiring`
 * refuses in source, and a script is not exempt from it.
 *
 * Every export fails closed. A contract that stops declaring `ENGINE_NAMES` or
 * `PRIMARY_ENGINE`, or that declares them in a shape this parser does not
 * recognise, throws here instead of yielding a silently short roster.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { packageRoot as findPackageRoot } from '../../repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = findPackageRoot(HERE);

export const ENGINE_IDENTITY_SOURCE = join(
  CORE_ROOT,
  'src/foundation/contracts/kernel/engine-identity/index.ts'
);

function readIdentitySource() {
  try {
    return readFileSync(ENGINE_IDENTITY_SOURCE, 'utf8');
  } catch (error) {
    throw new Error(
      `engine roster: cannot read the identity contract at ${ENGINE_IDENTITY_SOURCE}: ${error.message}`
    );
  }
}

function parseRoster(source) {
  const match = /export const ENGINE_NAMES = \[([^\]]*)\] as const;/.exec(source);
  if (!match) {
    throw new Error(
      'engine roster: the identity contract no longer declares `export const ENGINE_NAMES = [...] as const;`'
    );
  }
  const names = [...match[1].matchAll(/'([a-z][a-z0-9-]*)'/g)].map((m) => m[1]);
  if (names.length < 2) {
    throw new Error(
      `engine roster: parsed ${names.length} engine name(s) from the identity contract; a roster of fewer than two is a parse failure, not a roster`
    );
  }
  if (new Set(names).size !== names.length) {
    throw new Error(`engine roster: the parsed roster repeats a name: ${names.join(', ')}`);
  }
  return names;
}

function parseNamedEngine(source, symbol) {
  const pattern = new RegExp(
    `export const ${symbol}(?:: EngineName)? = '([a-z][a-z0-9-]*)'`
  );
  const match = pattern.exec(source);
  if (!match) {
    throw new Error(`engine roster: the identity contract no longer declares \`${symbol}\``);
  }
  return match[1];
}

const SOURCE = readIdentitySource();

/** The closed roster, in the contract's own order. */
export const ENGINE_NAMES = Object.freeze(parseRoster(SOURCE));

/**
 * The two named engines, read from the contract and kept module-local: a script
 * may DERIVE the default, never DECLARE a second one. `engine-wiring` keeps
 * `export const PRIMARY_ENGINE` unique to the identity contract, and this module
 * is on its declared reader list precisely because it parses that declaration.
 */
const PRIMARY_ENGINE = parseNamedEngine(SOURCE, 'PRIMARY_ENGINE');
const EXTENSION_ENGINE = parseNamedEngine(SOURCE, 'EXTENSION_ENGINE');

for (const [symbol, value] of [
  ['PRIMARY_ENGINE', PRIMARY_ENGINE],
  ['EXTENSION_ENGINE', EXTENSION_ENGINE],
]) {
  if (!ENGINE_NAMES.includes(value)) {
    throw new Error(
      `engine roster: ${symbol} is "${value}", which is not on the parsed roster ${ENGINE_NAMES.join(', ')}`
    );
  }
}

/** The engines a component may ship a physical implementation for. */
export const IMPLEMENTED_ENGINE_NAMES = Object.freeze(
  ENGINE_NAMES.filter((name) => name !== EXTENSION_ENGINE)
);

/** Shipped for compatibility, frozen, and refused at every admission door. */
export const FROZEN_ENGINE_NAMES = Object.freeze(
  ENGINE_NAMES.filter((name) => name !== PRIMARY_ENGINE && name !== EXTENSION_ENGINE)
);

/** Selectable by a tenant, an intent or a runtime. */
export const ADMITTED_ENGINE_NAMES = Object.freeze(
  ENGINE_NAMES.filter((name) => !FROZEN_ENGINE_NAMES.includes(name))
);

/**
 * The engine order the published cascade artifacts were generated in: the
 * productive engine first, then the frozen ones in reverse roster order.
 *
 * It is a derived permutation, never a second roster, and
 * `assertCascadeEngineOrder` pins it against the published artifact so a roster
 * change cannot silently renumber 9 779 emission rows.
 */
export const CASCADE_ENGINE_ORDER = Object.freeze([
  PRIMARY_ENGINE,
  ...IMPLEMENTED_ENGINE_NAMES.filter((name) => name !== PRIMARY_ENGINE).reverse(),
]);

/**
 * Fail closed if the derived cascade order stopped matching the order the
 * published producers manifest carries.
 */
export function assertCascadeEngineOrder(
  manifestPath = join(CORE_ROOT, 'artifacts/generated/manifest/cascade/producers/index.json')
) {
  const published = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const scopes = new Set();
  const walk = (node) => {
    if (Array.isArray(node)) {
      for (const child of node) walk(child);
      return;
    }
    if (!node || typeof node !== 'object') return;
    for (const [key, value] of Object.entries(node)) {
      if (key === 'engineScope' && Array.isArray(value) && value.length > 1) {
        scopes.add(value.join('+'));
      }
      walk(value);
    }
  };
  walk(published);
  const derived = CASCADE_ENGINE_ORDER.join('+');
  const foreign = [...scopes].filter((scope) => scope !== derived);
  if (foreign.length > 0) {
    throw new Error(
      `engine roster: the published producers manifest carries multi-engine scope order(s) ${foreign.join(
        ' | '
      )}, but the derived cascade order is ${derived}`
    );
  }
  return derived;
}
