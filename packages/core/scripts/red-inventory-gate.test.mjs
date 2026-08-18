/**
 * Drills for red-inventory-gate. Every mutation runs against FIXTURE JSON, not
 * the live ledger, so a drill can never rewrite the sealed inventory. The final
 * drills read the shipped ledger read-only and prove it satisfies every law.
 *
 * Run: node --test scripts/red-inventory-gate.test.mjs
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  evaluateInventorySeal,
  evaluateNonExecutability,
  evaluateObservationReconciliation,
  evaluateSourceIdentities,
  failureShapeDigest,
  identityDigest,
  parseRedInventory,
  RED_CLASSES,
  RED_SURFACES,
  SEALED_RED_IDENTITIES,
  staticTitleTail,
} from './red-inventory-gate.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const coreRoot = resolve(here, '..');

const SHAPE = 'is stale or hand-edited';

function fixtureRow(overrides = {}) {
  return {
    id: 'fixture-generated-rottay',
    class: 'generated-artifact-byte-staleness',
    surface: 'census1',
    file: 'src/foundation/tokens/__tests__/fixture.test.ts',
    test: 'fixture artifact matches the committed artifact',
    titleSource: 'matches the committed artifact',
    failureShape: SHAPE,
    reason: 'the committed artifact predates the authored source',
    owner: 'modern-rescue/generated-plane',
    proof: {
      kind: 'generated-operand',
      operands: ['src/foundation/tokens/css/facade/artifacts/rottay/index.css'],
    },
    ...overrides,
  };
}

function fixtureLedger(rows) {
  return JSON.stringify({ schemaVersion: 1, rows });
}

function fixtureSeal(rows) {
  return rows.map((row) => ({
    id: row.id,
    class: row.class,
    surface: row.surface,
    shape: failureShapeDigest(row.failureShape),
    identity: identityDigest(row.file, row.test),
  }));
}

function observationFor(row, message = `${SHAPE} (regenerate)`) {
  return { surface: row.surface, file: row.file, test: row.test, message };
}

test('a well-formed ledger parses with no schema error', () => {
  const { rows, errors } = parseRedInventory(fixtureLedger([fixtureRow()]));
  assert.deepEqual(errors, []);
  assert.equal(rows.length, 1);
});

test('malformed ledger text can never read as an empty inventory', () => {
  for (const [label, text] of [
    ['not json', '{'],
    ['array document', '[]'],
    ['null document', 'null'],
    ['string document', '"rows"'],
  ]) {
    const { rows, errors } = parseRedInventory(text);
    assert.equal(rows.length, 0, label);
    assert.ok(errors.length > 0, `${label} must be red`);
  }
});

test('schema drills are each individually red', () => {
  const drills = [
    ['unknown top-level key', JSON.stringify({ schemaVersion: 1, rows: [fixtureRow()], extra: 1 }), /unknown inventory key: extra/],
    ['wrong schemaVersion', JSON.stringify({ schemaVersion: 2, rows: [fixtureRow()] }), /schemaVersion must be 1/],
    ['rows not an array', JSON.stringify({ schemaVersion: 1, rows: {} }), /rows must be an array/],
    ['unknown row key', fixtureLedger([{ ...fixtureRow(), note: 'x' }]), /unknown key: note/],
    ['missing field', fixtureLedger([(() => { const row = fixtureRow(); delete row.owner; return row; })()]), /is missing owner/],
    ['missing titleSource', fixtureLedger([(() => { const row = fixtureRow(); delete row.titleSource; return row; })()]), /is missing titleSource/],
    ['empty field', fixtureLedger([fixtureRow({ reason: '   ' })]), /reason must be a non-empty string/],
    ['non-kebab id', fixtureLedger([fixtureRow({ id: 'Fixture_Row' })]), /id must be kebab-case/],
    ['duplicate id', fixtureLedger([fixtureRow(), fixtureRow()]), /duplicate inventory id/],
    ['unknown class', fixtureLedger([fixtureRow({ class: 'looks-fine' })]), /is not a known class/],
    ['unknown surface', fixtureLedger([fixtureRow({ surface: 'census9' })]), /is not a known surface/],
    ['proof not an object', fixtureLedger([fixtureRow({ proof: 'generated' })]), /proof must be a plain object/],
    ['unknown proof kind', fixtureLedger([fixtureRow({ proof: { kind: 'trust-me', operands: ['styles/index.css'] } })]), /not a known proof kind/],
    ['empty operands', fixtureLedger([fixtureRow({ proof: { kind: 'generated-operand', operands: [] } })]), /operands must be a non-empty array/],
  ];
  for (const [label, text, pattern] of drills) {
    const { errors } = parseRedInventory(text);
    assert.ok(
      errors.some((error) => pattern.test(error)),
      `${label} must be red; got ${JSON.stringify(errors)}`,
    );
  }
});

test('the seal reddens on add, remove, rename, class flip, surface move and shape drift', () => {
  const rows = [fixtureRow(), fixtureRow({ id: 'fixture-generated-bithire' })];
  const sealed = fixtureSeal(rows);

  assert.deepEqual(evaluateInventorySeal(rows, sealed), []);

  const added = [...rows, fixtureRow({ id: 'fixture-generated-evnto' })];
  const addedErrors = evaluateInventorySeal(added, sealed);
  assert.ok(addedErrors.some((error) => /must hold exactly 2 rows; got 3/.test(error)));
  assert.ok(addedErrors.some((error) => /not sealed: fixture-generated-evnto/.test(error)));

  const removedErrors = evaluateInventorySeal([rows[0]], sealed);
  assert.ok(removedErrors.some((error) => /disappeared from the inventory: fixture-generated-bithire/.test(error)));

  const renamed = [rows[0], { ...rows[1], id: 'fixture-generated-bithire-2' }];
  const renamedErrors = evaluateInventorySeal(renamed, sealed);
  assert.ok(renamedErrors.some((error) => /not sealed: fixture-generated-bithire-2/.test(error)));
  assert.ok(renamedErrors.some((error) => /disappeared from the inventory: fixture-generated-bithire/.test(error)));

  const flipped = [{ ...rows[0], class: 'dist-resolution-required' }, rows[1]];
  assert.ok(evaluateInventorySeal(flipped, sealed).some((error) => /class flipped/.test(error)));

  const moved = [{ ...rows[0], surface: 'census2' }, rows[1]];
  assert.ok(evaluateInventorySeal(moved, sealed).some((error) => /surface moved/.test(error)));

  const drifted = [{ ...rows[0], failureShape: `${SHAPE} maybe` }, rows[1]];
  assert.ok(evaluateInventorySeal(drifted, sealed).some((error) => /failure shape drifted/.test(error)));

  const repointed = [{ ...rows[0], test: `${rows[0].test} byte-for-byte` }, rows[1]];
  assert.ok(
    evaluateInventorySeal(repointed, sealed).some((error) => /test identity drifted/.test(error)),
    'a sealed row must not be silently re-pointed at a different reported identity',
  );
  const relocated = [{ ...rows[0], file: 'src/foundation/tokens/__tests__/other.test.ts' }, rows[1]];
  assert.ok(evaluateInventorySeal(relocated, sealed).some((error) => /test identity drifted/.test(error)));
});

test('the static title tail is what survives parameter substitution', () => {
  assert.equal(staticTitleTail('is in sync with its build inputs'), 'is in sync with its build inputs');
  assert.equal(staticTitleTail('${rel} is in sync with its build inputs'), ' is in sync with its build inputs');
  assert.equal(staticTitleTail('$subpath — all condition keys resolve'), ' — all condition keys resolve');
  assert.equal(staticTitleTail('%s emits the tail'), ' emits the tail');
  assert.equal(staticTitleTail('$a middle $b end'), ' end');
});

test('non-executability refuses an authored operand and an unrooted operand', () => {
  assert.deepEqual(evaluateNonExecutability([fixtureRow()]), []);

  const authored = fixtureRow({
    proof: { kind: 'generated-operand', operands: ['src/ui/primitives/inputs/Button/index.tsx'] },
  });
  assert.ok(
    evaluateNonExecutability([authored]).some((error) => /claims non-executability against authored source/.test(error)),
    'an authored operand refutes the exemption instead of granting it',
  );

  const unrooted = fixtureRow({
    proof: { kind: 'generated-operand', operands: ['somewhere/else/index.css'] },
  });
  assert.ok(evaluateNonExecutability([unrooted]).some((error) => /under no known generated root/.test(error)));

  const missing = fixtureRow({
    proof: { kind: 'generated-operand', operands: ['styles/nowhere.css'] },
  });
  assert.ok(
    evaluateNonExecutability([missing], { exists: () => false }).some((error) => /does not exist/.test(error)),
  );
  assert.deepEqual(evaluateNonExecutability([missing], { exists: () => true }), []);
});

test('a sealed red must still name a live test identity', () => {
  const row = fixtureRow();
  assert.deepEqual(
    evaluateSourceIdentities([row], () => `describe('x', () => { it('${row.titleSource}', () => {}); });`),
    [],
  );
  assert.ok(
    evaluateSourceIdentities([row], () => null).some((error) => /test file that does not exist/.test(error)),
  );
  assert.ok(
    evaluateSourceIdentities([row], () => 'it("something else", () => {});').some((error) =>
      /test title is absent/.test(error),
    ),
    'renaming the underlying test drains the inventory silently unless this is red',
  );
});

test('the identity law accepts a parameterised authored title and still binds both fields', () => {
  const parameterised = fixtureRow({
    test: "public CSS export surface './styles/default' — all condition keys resolve to existing dist file",
    titleSource: '$subpath — all condition keys resolve to existing dist file',
  });
  const source = () => `it.each(SUBPATHS)('${parameterised.titleSource}', () => {});`;
  assert.deepEqual(evaluateSourceIdentities([parameterised], source), []);

  const mismatched = { ...parameterised, test: 'public CSS export surface resolves every subpath' };
  assert.ok(
    evaluateSourceIdentities([mismatched], source).some((error) =>
      /reported name does not end with the authored title tail/.test(error),
    ),
    'a reported name unrelated to the authored literal must not satisfy the row',
  );
});

test('m10: an unledgered failing identity is red', () => {
  const row = fixtureRow();
  const errors = evaluateObservationReconciliation(
    [row],
    [observationFor(row), { surface: 'census1', file: 'src/new.test.ts', test: 'brand new failure', message: 'boom' }],
  );
  assert.ok(errors.some((error) => /observed failure has no inventory row: \[census1\] src\/new.test.ts > brand new failure/.test(error)));
});

test('m11: ledgering an identity that is no longer red is red', () => {
  const row = fixtureRow();
  const errors = evaluateObservationReconciliation([row], []);
  assert.ok(errors.some((error) => /not red in the observation set: fixture-generated-rottay/.test(error)));
});

test('reconciliation reddens when the observed failure changes shape', () => {
  const row = fixtureRow();
  const errors = evaluateObservationReconciliation([row], [observationFor(row, 'a completely different failure')]);
  assert.ok(errors.some((error) => /failure shape no longer matches the observed failure/.test(error)));
});

test('reconciliation is identity-exact: a longer title is a different identity', () => {
  const row = fixtureRow();
  const longer = observationFor({ ...row, test: `${row.test} under reduced motion` });
  const errors = evaluateObservationReconciliation([row], [longer]);
  assert.ok(
    errors.some((error) => /observed failure has no inventory row/.test(error)),
    'a superstring title must not satisfy the sealed row',
  );
  assert.ok(errors.some((error) => /not red in the observation set/.test(error)));
});

test('an adversarial observation set cannot pass as reconciled', () => {
  const row = fixtureRow();
  assert.deepEqual(evaluateObservationReconciliation([row], {}), [
    'observation set must be an array of failing identities',
  ]);
  assert.ok(
    evaluateObservationReconciliation([row], [{ surface: 'census1', file: 'a', test: 'b' }]).some((error) =>
      /is missing message/.test(error),
    ),
  );
  assert.ok(
    evaluateObservationReconciliation([row], [{ ...observationFor(row), surface: 'nowhere' }]).some((error) =>
      /unknown surface/.test(error),
    ),
  );
});

test('the shipped ledger satisfies every law it is sealed by', () => {
  const { rows, errors } = parseRedInventory(readFileSync(join(here, 'red-inventory.json'), 'utf8'));
  assert.deepEqual(errors, []);
  assert.equal(rows.length, 15, 'the measured checkpoint inventory is exactly 15 rows');
  assert.equal(rows.length, SEALED_RED_IDENTITIES.length);
  assert.deepEqual(evaluateInventorySeal(rows), []);
  assert.deepEqual(
    evaluateSourceIdentities(rows, (relativePath) => {
      const path = join(coreRoot, relativePath);
      return existsSync(path) ? readFileSync(path, 'utf8') : null;
    }),
    [],
  );
  assert.deepEqual(
    evaluateNonExecutability(rows, { exists: (operand) => existsSync(join(coreRoot, operand)) }),
    [],
  );
});

test('the shipped ledger only uses declared classes and surfaces', () => {
  const { rows } = parseRedInventory(readFileSync(join(here, 'red-inventory.json'), 'utf8'));
  for (const row of rows) {
    assert.ok(Object.hasOwn(RED_CLASSES, row.class), row.class);
    assert.ok(Object.hasOwn(RED_SURFACES, row.surface), row.surface);
  }
});
