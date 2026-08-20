#!/usr/bin/env node
/**
 * red-inventory-gate — the sealed inventory of checkpoint-generated reds.
 *
 * A source-plane tranche cannot repair a failure whose only operand is a
 * generated build output: regenerating the first-party CSS artifacts is a
 * generated-plane wave with its own sighted review. Those failures are
 * therefore SEALED here, by exact identity and exact failure shape, so a source
 * tranche can be certified green-modulo-the-seal without the seal ever becoming
 * a place to hide a new failure.
 *
 * What this gate proves, all fail-closed:
 *   1. schema — the ledger is a closed, fully typed row set (unknown key,
 *      missing field, empty string, duplicate id, unknown class or surface is
 *      red);
 *   2. seal — the row set agrees with SEALED_RED_IDENTITIES below on id, class,
 *      surface, failure-shape digest and reported-identity digest, so adding,
 *      removing, renaming, class-flipping, re-pointing at another test or
 *      shape-drifting a row stays red unless this file is edited as well. That
 *      reviewed pair edit is the same discipline the engine-token baseline
 *      uses: the data file alone can never move the law.
 *   3. identity — every row still names a test that exists in the authored
 *      source, by exact authored title literal, so silently deleting or
 *      renaming a sealed red is red rather than quietly draining the inventory.
 *      Two fields are needed because parameterised titles differ between source
 *      and report: `titleSource` is the literal as authored (it may carry
 *      `$slug`, `%s` or `${rel}` placeholders) and `test` is the full reported
 *      identity a run emits. The law binds them: `test` must end with the
 *      static tail of `titleSource`, so neither field can drift alone;
 *   4. non-executability — every row's declared operands live under a
 *      generated-output root. A row that claims non-executability while naming
 *      an authored source file is red: that failure WOULD be repairable in the
 *      source plane, so sealing it would be a false exemption.
 *
 * What this gate deliberately does NOT do: it does not execute the census
 * surfaces, so `--check` alone is not evidence that a sealed row is still red.
 * Liveness is reconciled by `--reconcile <observation.json>` against a census
 * observation set; in CI the surfaces run under their own blocking manifest rows
 * (`first-party-artifacts-source-staleness`, `vertical-css-source-staleness`,
 * the census rows), and this gate bounds what they are allowed to report.
 *
 * Usage:
 *   node scripts/ci/red-inventory-gate/index.mjs
 *   node scripts/ci/red-inventory-gate/index.mjs --check [--quiet]
 *   node scripts/ci/red-inventory-gate/index.mjs --reconcile <observation.json>
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { packageRoot as findPackageRoot } from '../../lib/repo-root/index.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const coreRoot = findPackageRoot(here);
const inventoryPath = join(here, 'red-inventory.json');

/** The closed class vocabulary. A class names WHY the red is not executable here. */
export const RED_CLASSES = Object.freeze({
  'generated-artifact-byte-staleness':
    'a committed generated CSS artifact no longer equals what the authored source renders',
  'generated-artifact-projection-staleness':
    'a committed generated artifact no longer carries the compiled variable projection',
  'generated-artifact-missing-channel':
    'a committed generated artifact predates a channel the compiler now emits',
  'generated-artifact-residue':
    'a committed generated artifact still carries bytes its authored source no longer mints',
  'dist-resolution-required':
    'the assertion resolves a published dist file, so only a build can satisfy it',
});

/**
 * The closed surface vocabulary: the command that OBSERVES a row's failure.
 * Recorded as argv so a reconciliation producer cannot invent a surface.
 */
export const RED_SURFACES = Object.freeze({
  census1: Object.freeze([
    'pnpm', 'exec', 'vitest', 'run',
    'src/foundation/tokens/__tests__', 'src/infrastructure/compilers',
  ]),
  census2: Object.freeze(['pnpm', 'exec', 'vitest', 'run', 'src/tooling']),
  staleness: Object.freeze(['node', '--test', 'scripts/verticals/css-staleness-gate/index.mjs']),
});

/**
 * Roots whose contents are generated build output, relative to packages/core.
 * `_source/` is excluded on purpose: it was an authored second author, and a
 * row may not claim non-executability against authored bytes.
 */
export const GENERATED_OPERAND_ROOTS = Object.freeze([
  'dist/',
  'styles/',
  'src/foundation/tokens/css/facade/artifacts/',
]);

/** Roots that are authored source: naming one is a refutation, not a proof. */
export const AUTHORED_SOURCE_ROOTS = Object.freeze([
  'scripts/',
  'src/foundation/contracts/',
  'src/foundation/presets/',
  'src/foundation/tokens/ts/',
  'src/graphics/',
  'src/infrastructure/',
  'src/tooling/',
  'src/ui/',
]);

/** Every proof kind, with the operand shape it asserts. */
export const NON_EXECUTABILITY_KINDS = Object.freeze({
  'generated-operand':
    'the committed generated file the assertion compares against',
  'dist-resolution':
    'the published dist file the assertion resolves, which no source edit creates',
});

const REQUIRED_ROW_KEYS = Object.freeze([
  'id', 'class', 'surface', 'file', 'test', 'titleSource', 'failureShape', 'reason', 'owner', 'proof',
]);
const REQUIRED_PROOF_KEYS = Object.freeze(['kind', 'operands']);
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Placeholders a parameterised authored title may carry. */
const TITLE_PLACEHOLDER = /\$\{[^}]*\}|\$[A-Za-z_][\w.]*|%[sdifjo#%]/g;

/** Digest a failure shape into the short form the seal pins. */
export function failureShapeDigest(shape) {
  return createHash('sha256').update(String(shape), 'utf8').digest('hex').slice(0, 16);
}

/** Digest the reported identity (file + full test name) the seal pins. */
export function identityDigest(file, test) {
  return createHash('sha256').update(`${file}\n${test}`, 'utf8').digest('hex').slice(0, 16);
}

/**
 * The part of an authored title that survives parameter substitution: the text
 * after the last placeholder. A title with no placeholder is its own tail.
 */
export function staticTitleTail(titleSource) {
  const text = String(titleSource);
  let end = 0;
  for (const match of text.matchAll(TITLE_PLACEHOLDER)) {
    end = match.index + match[0].length;
  }
  return text.slice(end);
}

/**
 * The sealed constitution: the exactly-15 checkpoint-generated reds, pinned by
 * id, class, observing surface, failure-shape digest and reported-identity
 * digest (`identityDigest(file, test)`). Every entry was measured from a real
 * run of its surface — census1 reported 9 failures in 4 files, census2 reported
 * 2 in 2, the staleness gate reported 4 of 5 — and no row was authored by hand:
 * the ledger was produced from those reports and every declared failure shape
 * was verified to be a substring of the observed message. This table and
 * red-inventory.json must be edited together.
 */
export const SEALED_RED_IDENTITIES = Object.freeze([
  {
    id: 'artifact-bytes-rottay',
    class: 'generated-artifact-byte-staleness',
    surface: 'census1',
    shape: '77c5b35290c8c55a',
    identity: '5787a73f6d74107c',
  },
  {
    id: 'artifact-bytes-bithire',
    class: 'generated-artifact-byte-staleness',
    surface: 'census1',
    shape: '77c5b35290c8c55a',
    identity: '0a3d16375650396b',
  },
  {
    id: 'artifact-bytes-evnto',
    class: 'generated-artifact-byte-staleness',
    surface: 'census1',
    shape: '77c5b35290c8c55a',
    identity: '8fa519d134b9157a',
  },
  {
    id: 'artifact-parity-rottay',
    class: 'generated-artifact-projection-staleness',
    surface: 'census1',
    shape: 'e3fccf973e46217f',
    identity: 'f653af51213a532d',
  },
  {
    id: 'artifact-parity-bithire',
    class: 'generated-artifact-projection-staleness',
    surface: 'census1',
    shape: 'e3fccf973e46217f',
    identity: 'f33a380abee1fadd',
  },
  {
    id: 'artifact-parity-evnto',
    class: 'generated-artifact-projection-staleness',
    surface: 'census1',
    shape: 'e3fccf973e46217f',
    identity: 'f650536f7d50f0d3',
  },
  {
    id: 'artifact-tone-channel-bithire',
    class: 'generated-artifact-missing-channel',
    surface: 'census1',
    shape: 'd56ac8854909ab4d',
    identity: '2be84375f0363caf',
  },
  {
    id: 'dist-styles-default',
    class: 'dist-resolution-required',
    surface: 'census1',
    shape: '2c7cb928bae1938d',
    identity: '0fc1a358e0d15861',
  },
  {
    id: 'dist-styles-rottay',
    class: 'dist-resolution-required',
    surface: 'census1',
    shape: 'ef86e92ab2f5e9f3',
    identity: '85494cd704e887e3',
  },
  {
    id: 'artifact-rt-residue-bithire',
    class: 'generated-artifact-residue',
    surface: 'census2',
    shape: 'b40fdca73895ed40',
    identity: 'ac6f0622a29684f3',
  },
  {
    id: 'artifact-dual-scope-rottay',
    class: 'generated-artifact-missing-channel',
    surface: 'census2',
    shape: 'e3fccf973e46217f',
    identity: 'bf761d6df4bef28a',
  },
  {
    id: 'styles-bundle-rottay',
    class: 'generated-artifact-byte-staleness',
    surface: 'staleness',
    shape: 'dcb6192a0260d70b',
    identity: '65034c019e2d9f90',
  },
  {
    id: 'styles-bundle-bithire',
    class: 'generated-artifact-byte-staleness',
    surface: 'staleness',
    shape: '8253ba49d98b696d',
    identity: '58b26c8db080b3fb',
  },
  {
    id: 'styles-bundle-evnto',
    class: 'generated-artifact-byte-staleness',
    surface: 'staleness',
    shape: 'd1f275e509b6f986',
    identity: '6e95c041df2d78a2',
  },
  {
    id: 'styles-bundle-index',
    class: 'generated-artifact-byte-staleness',
    surface: 'staleness',
    shape: '82544fdcdf4ff17b',
    identity: '4343e0cc64e08dd8',
  },
]);

function isPlainObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Parse and fully validate the ledger text. Never throws: adversarial or
 * malformed input becomes errors, so a broken ledger cannot read as an empty
 * one.
 */
export function parseRedInventory(text) {
  const errors = [];
  let document;
  try {
    document = JSON.parse(text);
  } catch (error) {
    return { rows: [], errors: [`inventory is not parseable JSON: ${error.message}`] };
  }
  if (!isPlainObject(document)) {
    return { rows: [], errors: ['inventory must be a plain JSON object'] };
  }
  for (const key of Object.keys(document)) {
    if (!['schemaVersion', '_comment', 'rows'].includes(key)) {
      errors.push(`unknown inventory key: ${key}`);
    }
  }
  if (document.schemaVersion !== 1) {
    errors.push(`inventory schemaVersion must be 1; got ${JSON.stringify(document.schemaVersion)}`);
  }
  if (!Array.isArray(document.rows)) {
    errors.push('inventory rows must be an array');
    return { rows: [], errors };
  }

  const rows = [];
  const seen = new Set();
  document.rows.forEach((row, index) => {
    const label = `row ${index + 1}`;
    if (!isPlainObject(row)) {
      errors.push(`${label} must be a plain object`);
      return;
    }
    for (const key of Object.keys(row)) {
      if (!REQUIRED_ROW_KEYS.includes(key)) errors.push(`${label} has an unknown key: ${key}`);
    }
    for (const key of REQUIRED_ROW_KEYS) {
      if (!Object.hasOwn(row, key)) errors.push(`${label} is missing ${key}`);
    }
    for (const key of REQUIRED_ROW_KEYS.filter((entry) => entry !== 'proof')) {
      if (Object.hasOwn(row, key) && !nonEmptyString(row[key])) {
        errors.push(`${label}.${key} must be a non-empty string`);
      }
    }
    const name = nonEmptyString(row.id) ? row.id : label;
    if (nonEmptyString(row.id)) {
      if (!ID_PATTERN.test(row.id)) errors.push(`${name}.id must be kebab-case`);
      if (seen.has(row.id)) errors.push(`duplicate inventory id: ${row.id}`);
      seen.add(row.id);
    }
    if (nonEmptyString(row.class) && !Object.hasOwn(RED_CLASSES, row.class)) {
      errors.push(`${name}.class is not a known class: ${row.class}`);
    }
    if (nonEmptyString(row.surface) && !Object.hasOwn(RED_SURFACES, row.surface)) {
      errors.push(`${name}.surface is not a known surface: ${row.surface}`);
    }
    if (!isPlainObject(row.proof)) {
      errors.push(`${name}.proof must be a plain object`);
    } else {
      for (const key of Object.keys(row.proof)) {
        if (!REQUIRED_PROOF_KEYS.includes(key)) errors.push(`${name}.proof has an unknown key: ${key}`);
      }
      if (!nonEmptyString(row.proof.kind) || !Object.hasOwn(NON_EXECUTABILITY_KINDS, row.proof.kind)) {
        errors.push(`${name}.proof.kind is not a known proof kind: ${JSON.stringify(row.proof.kind)}`);
      }
      if (!Array.isArray(row.proof.operands) || row.proof.operands.length === 0) {
        errors.push(`${name}.proof.operands must be a non-empty array`);
      } else if (!row.proof.operands.every((operand) => nonEmptyString(operand))) {
        errors.push(`${name}.proof.operands must contain non-empty strings`);
      }
    }
    rows.push(row);
  });

  return { rows, errors };
}

/**
 * Compare the ledger against the sealed constitution. Addition, removal,
 * rename, class flip, surface move and failure-shape drift are each a distinct
 * error so the receipt names what actually changed.
 */
export function evaluateInventorySeal(rows, sealed = SEALED_RED_IDENTITIES) {
  const errors = [];
  if (rows.length !== sealed.length) {
    errors.push(`inventory must hold exactly ${sealed.length} rows; got ${rows.length}`);
  }
  const sealedById = new Map(sealed.map((entry) => [entry.id, entry]));
  const rowsById = new Map();
  for (const row of rows) if (nonEmptyString(row.id)) rowsById.set(row.id, row);

  for (const [id, row] of rowsById) {
    const pin = sealedById.get(id);
    if (!pin) {
      errors.push(`inventory row is not sealed: ${id}`);
      continue;
    }
    if (row.class !== pin.class) {
      errors.push(`sealed class flipped: ${id} sealed=${pin.class} ledger=${row.class}`);
    }
    if (row.surface !== pin.surface) {
      errors.push(`sealed surface moved: ${id} sealed=${pin.surface} ledger=${row.surface}`);
    }
    const digest = failureShapeDigest(row.failureShape ?? '');
    if (digest !== pin.shape) {
      errors.push(`sealed failure shape drifted: ${id} sealed=${pin.shape} ledger=${digest}`);
    }
    const identity = identityDigest(row.file ?? '', row.test ?? '');
    if (identity !== pin.identity) {
      errors.push(`sealed test identity drifted: ${id} sealed=${pin.identity} ledger=${identity}`);
    }
  }
  for (const id of sealedById.keys()) {
    if (!rowsById.has(id)) errors.push(`sealed row disappeared from the inventory: ${id}`);
  }
  return errors;
}

/**
 * Prove each row's non-executability claim from its operands. Passing an
 * explicit `exists` keeps the law testable without planting repository files.
 */
export function evaluateNonExecutability(rows, options = {}) {
  const {
    generatedRoots = GENERATED_OPERAND_ROOTS,
    authoredRoots = AUTHORED_SOURCE_ROOTS,
    exists = null,
  } = options;
  const errors = [];
  for (const row of rows) {
    const id = nonEmptyString(row.id) ? row.id : '<unnamed row>';
    const operands = Array.isArray(row.proof?.operands) ? row.proof.operands : [];
    for (const operand of operands) {
      if (typeof operand !== 'string' || operand.length === 0) continue;
      const authored = authoredRoots.find((prefix) => operand.startsWith(prefix));
      if (authored) {
        errors.push(
          `${id} claims non-executability against authored source: ${operand} (under ${authored})`,
        );
        continue;
      }
      if (!generatedRoots.some((prefix) => operand.startsWith(prefix))) {
        errors.push(`${id} operand is under no known generated root: ${operand}`);
        continue;
      }
      if (row.proof.kind === 'generated-operand' && exists && !exists(operand)) {
        errors.push(`${id} names a generated operand that does not exist: ${operand}`);
      }
    }
  }
  return errors;
}

/**
 * Prove every sealed red still names a live test identity. `readFile` returns
 * the file text or null when the path is absent. The authored literal must be
 * present in the file, and the reported full name must end with that literal's
 * static tail, so a rename cannot leave one field pointing at the other's test.
 */
export function evaluateSourceIdentities(rows, readFile) {
  const errors = [];
  for (const row of rows) {
    const id = nonEmptyString(row.id) ? row.id : '<unnamed row>';
    if (!nonEmptyString(row.file) || !nonEmptyString(row.test) || !nonEmptyString(row.titleSource)) {
      continue;
    }
    const text = readFile(row.file);
    if (text === null) {
      errors.push(`${id} names a test file that does not exist: ${row.file}`);
      continue;
    }
    if (!text.includes(row.titleSource)) {
      errors.push(
        `${id} test title is absent from ${row.file}: ${JSON.stringify(row.titleSource)}`,
      );
    }
    const tail = staticTitleTail(row.titleSource);
    if (!row.test.endsWith(tail)) {
      errors.push(
        `${id} reported name does not end with the authored title tail ${JSON.stringify(tail)}`,
      );
    }
  }
  return errors;
}

/**
 * Reconcile the ledger against an observation set: the failing identities a
 * real run of the surfaces reported. Observations carry ONLY failures, so a
 * sealed row missing from them is a row that is no longer red.
 */
export function evaluateObservationReconciliation(rows, observations) {
  const errors = [];
  if (!Array.isArray(observations)) {
    return ['observation set must be an array of failing identities'];
  }
  const key = (entry) => `${entry.surface}\0${entry.file}\0${entry.test}`;
  const rowsByKey = new Map();
  for (const row of rows) rowsByKey.set(key(row), row);
  const observedKeys = new Set();

  observations.forEach((observation, index) => {
    if (!isPlainObject(observation)) {
      errors.push(`observation ${index + 1} must be a plain object`);
      return;
    }
    for (const field of ['surface', 'file', 'test', 'message']) {
      if (!nonEmptyString(observation[field])) {
        errors.push(`observation ${index + 1} is missing ${field}`);
        return;
      }
    }
    if (!Object.hasOwn(RED_SURFACES, observation.surface)) {
      errors.push(`observation ${index + 1} names an unknown surface: ${observation.surface}`);
      return;
    }
    const identity = key(observation);
    observedKeys.add(identity);
    const row = rowsByKey.get(identity);
    if (!row) {
      errors.push(
        `observed failure has no inventory row: [${observation.surface}] ${observation.file} > ${observation.test}`,
      );
      return;
    }
    if (!observation.message.includes(row.failureShape)) {
      errors.push(
        `${row.id} failure shape no longer matches the observed failure: expected ${JSON.stringify(row.failureShape)}`,
      );
    }
  });

  for (const [identity, row] of rowsByKey) {
    if (!observedKeys.has(identity)) {
      errors.push(`inventory row is not red in the observation set: ${row.id}`);
    }
  }
  return errors;
}

function readCoreFile(relativePath) {
  const path = join(coreRoot, relativePath);
  return existsSync(path) ? readFileSync(path, 'utf8') : null;
}

function report(rows) {
  process.stdout.write('red-inventory-gate — sealed checkpoint-generated reds\n');
  process.stdout.write(`  rows: ${rows.length}\n`);
  const bySurface = new Map();
  for (const row of rows) bySurface.set(row.surface, (bySurface.get(row.surface) ?? 0) + 1);
  for (const surface of Object.keys(RED_SURFACES)) {
    process.stdout.write(`  ${surface}: ${bySurface.get(surface) ?? 0}\n`);
  }
  for (const row of rows) {
    process.stdout.write(`  - [${row.class}] ${row.id}\n`);
  }
}

function main(argv) {
  const known = new Set(['--check', '--quiet', '--reconcile']);
  const flags = argv.filter((argument) => argument.startsWith('--'));
  for (const flag of flags) {
    if (!known.has(flag)) {
      process.stderr.write(`[red-inventory-gate] unknown flag: ${flag}\n`);
      process.exitCode = 1;
      return;
    }
  }
  const check = flags.includes('--check');
  const quiet = flags.includes('--quiet');
  const reconcileIndex = argv.indexOf('--reconcile');
  const observationPath = reconcileIndex >= 0 ? argv[reconcileIndex + 1] : null;
  if (reconcileIndex >= 0 && (!observationPath || observationPath.startsWith('--'))) {
    process.stderr.write('[red-inventory-gate] --reconcile requires an observation JSON path\n');
    process.exitCode = 1;
    return;
  }

  if (!existsSync(inventoryPath)) {
    process.stderr.write(`[red-inventory-gate] inventory is missing: ${inventoryPath}\n`);
    process.exitCode = 1;
    return;
  }
  const { rows, errors: schemaErrors } = parseRedInventory(readFileSync(inventoryPath, 'utf8'));
  const errors = [...schemaErrors];
  if (schemaErrors.length === 0) {
    errors.push(...evaluateInventorySeal(rows));
    errors.push(...evaluateSourceIdentities(rows, readCoreFile));
    errors.push(
      ...evaluateNonExecutability(rows, {
        exists: (operand) => existsSync(join(coreRoot, operand)),
      }),
    );
  }

  if (observationPath) {
    if (!existsSync(observationPath)) {
      errors.push(`observation set is missing: ${observationPath}`);
    } else {
      let observations = null;
      try {
        const document = JSON.parse(readFileSync(observationPath, 'utf8'));
        observations = isPlainObject(document) ? document.observations : document;
      } catch (error) {
        errors.push(`observation set is not parseable JSON: ${error.message}`);
      }
      if (observations !== null) {
        errors.push(...evaluateObservationReconciliation(rows, observations));
      }
    }
  }

  if (!quiet && (!check || errors.length > 0)) report(rows);

  if (errors.length > 0) {
    process.stderr.write('[red-inventory-gate] FAILED:\n');
    for (const error of errors) process.stderr.write(`  - ${error}\n`);
    process.exitCode = 1;
    return;
  }
  if (!quiet) {
    process.stdout.write(
      `[red-inventory-gate] PASS (${rows.length} sealed rows${observationPath ? ', observation set reconciled' : ''})\n`,
    );
  }
}

const isCli = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) main(process.argv.slice(2));
