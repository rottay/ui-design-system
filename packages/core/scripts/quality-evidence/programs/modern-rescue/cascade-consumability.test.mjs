/**
 * Drills de la cerca de consumibilidad (PRE_F4B lote A, path A9).
 *
 * N14 exige que `validateInventory()` falle por las TRES vias que un sello
 * puede romperse -- digest, vocabulario y membresia -- y no solo por una. Cada
 * drill planta su propio mundo en `mkdtempSync(tmpdir())`: la cerca real y los
 * 42 artefactos reales no se tocan en ningun momento.
 */

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  assertConsumable,
  buildConsumability,
  DERIVABLE_STATES,
  OUT_PATH,
  PLANE_VOCABULARY,
  serialize,
  STATE_VOCABULARY,
  validateInventory,
} from './cascade-consumability.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(HERE, 'cascade-consumability.mjs');

/** A whole fixture world: substrate, both downstream dirs, and the fence. */
function withFence(run, { backlogVocabulary = ['css', 'ts-compilers', 'ts-chrome-variables'] } = {}) {
  const sandbox = mkdtempSync(join(tmpdir(), 'cascade-consumability-drill-'));
  try {
    const substratePath = join(sandbox, 'css-edges.json');
    writeFileSync(substratePath, '{"schemaVersion":2}\n');
    const materializedDir = join(sandbox, 'materialized');
    const backlogDir = join(sandbox, 'backlog');
    mkdirSync(materializedDir, { recursive: true });
    mkdirSync(backlogDir, { recursive: true });
    writeFileSync(join(materializedDir, 'alpha.json'), JSON.stringify({ controlId: 'alpha' }));
    writeFileSync(join(backlogDir, 'alpha.json'), JSON.stringify({ planeVocabulary: backlogVocabulary }));
    const dirs = { substratePath, materializedDir, backlogDir, manifestRel: 'fixture/cascade' };
    const inventoryPath = join(sandbox, 'consumability.json');
    writeFileSync(inventoryPath, serialize(buildConsumability(dirs)));
    run({ ...dirs, inventoryPath, sandbox });
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
}

const mutate = (inventoryPath, edit) => {
  const inventory = JSON.parse(readFileSync(inventoryPath, 'utf8'));
  edit(inventory);
  writeFileSync(inventoryPath, serialize(inventory));
};

/* ------------------------------------------------------- the happy path --- */

test('a correctly BLOCKED inventory validates clean: the fence passes for doing its job', () => {
  withFence((dirs) => {
    assert.deepEqual(validateInventory(dirs), []);
    const inventory = JSON.parse(readFileSync(dirs.inventoryPath, 'utf8'));
    assert.equal(inventory.stats.consumable, 0);
    assert.equal(inventory.outputs.length, 2);
    assert.deepEqual(
      inventory.outputs.map((entry) => entry.state).sort(),
      ['UNREPRODUCIBLE_BLOCKED', 'UNVERIFIED_PRODUCER_IMPURE'],
    );
  });
});

test('`CONSUMABLE` is not in the vocabulary, and the derivable states are the two conservative ones', () => {
  assert.ok(!STATE_VOCABULARY.includes('CONSUMABLE'));
  assert.deepEqual(DERIVABLE_STATES, ['UNVERIFIED_PRODUCER_IMPURE', 'UNREPRODUCIBLE_BLOCKED']);
  assert.deepEqual(PLANE_VOCABULARY, ['css', 'ts-compilers', 'ts-chrome-variables', 'tsx-inline-stamp']);
});

/* --------------------------------------------------------- N14, 3 ways --- */

test('N14a validateInventory fails when a DIGEST no longer covers the outputs', () => {
  withFence((dirs) => {
    mutate(dirs.inventoryPath, (inventory) => {
      inventory.digests.membership = createHash('sha256').update('tampered').digest('hex');
    });
    const findings = validateInventory(dirs);
    assert.ok(findings.some((f) => f.includes('membership digest')), findings.join(' | '));
  });
  withFence((dirs) => {
    mutate(dirs.inventoryPath, (inventory) => {
      inventory.outputs[0].state = 'STALE_OWN_INPUTS';
    });
    const findings = validateInventory(dirs);
    assert.ok(findings.some((f) => f.includes('states digest')), findings.join(' | '));
  });
  withFence((dirs) => {
    mutate(dirs.inventoryPath, (inventory) => {
      inventory.outputs[1].declaredPlaneVocabulary = ['css'];
    });
    const findings = validateInventory(dirs);
    assert.ok(findings.some((f) => f.includes('declaredVocabularies digest')), findings.join(' | '));
  });
});

test('N14b validateInventory fails when the sealed VOCABULARY is not the current one', () => {
  withFence((dirs) => {
    mutate(dirs.inventoryPath, (inventory) => {
      inventory.planeVocabulary = ['css', 'ts-compilers', 'ts-chrome-variables'];
    });
    const findings = validateInventory(dirs);
    assert.ok(findings.some((f) => f.includes('planeVocabulary')), findings.join(' | '));
  });
});

test('N14c validateInventory fails on MEMBERSHIP drift in both directions', () => {
  withFence((dirs) => {
    writeFileSync(join(dirs.materializedDir, 'appeared.json'), '{}');
    const findings = validateInventory(dirs);
    assert.ok(
      findings.some((f) => f.includes('appeared.json') && f.includes('not enumerated')),
      findings.join(' | '),
    );
  });
  withFence((dirs) => {
    rmSync(join(dirs.backlogDir, 'alpha.json'));
    const findings = validateInventory(dirs);
    assert.ok(
      findings.some((f) => f.includes('does not exist on disk')),
      findings.join(' | '),
    );
  });
});

test('N14d validateInventory refuses a CONSUMABLE claim and a silent output', () => {
  withFence((dirs) => {
    mutate(dirs.inventoryPath, (inventory) => {
      inventory.outputs[0].state = 'CONSUMABLE';
      inventory.digests.states = createHash('sha256')
        .update(JSON.stringify(inventory.outputs.map((e) => [e.path, e.state])))
        .digest('hex');
    });
    const findings = validateInventory(dirs);
    assert.ok(findings.some((f) => f.includes('claims CONSUMABLE')), findings.join(' | '));
  });
  withFence((dirs) => {
    mutate(dirs.inventoryPath, (inventory) => {
      inventory.outputs[0].reason = '';
      inventory.outputs[0].blockedFor = [];
    });
    const findings = validateInventory(dirs);
    assert.ok(findings.some((f) => f.includes('silence is not acceptance')), findings.join(' | '));
  });
});

test('N14e validateInventory fails when the sealed SUBSTRATE digest drifts', () => {
  withFence((dirs) => {
    writeFileSync(dirs.substratePath, '{"schemaVersion":2,"moved":true}\n');
    const findings = validateInventory(dirs);
    assert.ok(findings.some((f) => f.includes('sealed substrate digest')), findings.join(' | '));
  });
});

/* --------------------------------------------------- the observable law --- */

test('declaredPlaneVocabulary is read only where the field EXISTS; absence is its own observable', () => {
  withFence((dirs) => {
    const inventory = JSON.parse(readFileSync(dirs.inventoryPath, 'utf8'));
    const materialized = inventory.outputs.find((e) => e.path.includes('/materialized/'));
    const backlog = inventory.outputs.find((e) => e.path.includes('/backlog/'));
    assert.equal(materialized.declaredPlaneVocabulary, null);
    assert.equal(materialized.vocabularyObservable, 'absent', 'absence is recorded, never invented');
    assert.deepEqual(backlog.declaredPlaneVocabulary, ['css', 'ts-compilers', 'ts-chrome-variables']);
    assert.equal(backlog.vocabularyObservable, 'superseded', 'three planes against the current four');
  });
  withFence(
    (dirs) => {
      const inventory = JSON.parse(readFileSync(dirs.inventoryPath, 'utf8'));
      const backlog = inventory.outputs.find((e) => e.path.includes('/backlog/'));
      assert.equal(backlog.vocabularyObservable, 'current');
    },
    { backlogVocabulary: ['css', 'ts-compilers', 'ts-chrome-variables', 'tsx-inline-stamp'] },
  );
});

test('the staleness split is DIAGNOSIS with provenance, never generated state', () => {
  withFence((dirs) => {
    const inventory = JSON.parse(readFileSync(dirs.inventoryPath, 'utf8'));
    const census = inventory.authoredCensus;
    assert.equal(census.isComputed, false);
    assert.match(census.source, /d09d3a7ae85e6f05b1d055c829c6fe5757e7c91518bd38e24e39ee0b5d86498f/);
    assert.ok(census.recipe.length > 0);
    assert.equal(census.staleAgainstOwnInputs.count, 6);
    assert.equal(census.staleOnlyWithFreshSubstrate.count, 3);
    assert.equal(census.identicalUnderBothRuns.count, 11);
    for (const entry of inventory.outputs) {
      assert.ok(!['STALE_OWN_INPUTS', 'STALE_SUBSTRATE'].includes(entry.state));
    }
  });
});

/* ------------------------------------------------------- the two APIs --- */

test('assertConsumable THROWS for a fenced path while validateInventory PASSES on the same fence', () => {
  withFence((dirs) => {
    assert.deepEqual(validateInventory(dirs), []);
    const inventory = JSON.parse(readFileSync(dirs.inventoryPath, 'utf8'));
    const fenced = inventory.outputs[0].path;
    assert.throws(
      () => assertConsumable([fenced], { inventoryPath: dirs.inventoryPath }),
      /must not be consumed/,
    );
    assert.equal(assertConsumable(['some/unfenced/path.json'], { inventoryPath: dirs.inventoryPath }), true);
  });
});

/* -------------------------------------------------- purity + determinism --- */

test('N13 --check is PURE for the fence too, and an unknown flag exits 2', () => {
  const before = { mtime: statSync(OUT_PATH).mtimeMs, bytes: readFileSync(OUT_PATH) };
  execFileSync(process.execPath, [SCRIPT, '--check'], { stdio: 'pipe' });
  execFileSync(process.execPath, [SCRIPT], { stdio: 'pipe' });
  const after = { mtime: statSync(OUT_PATH).mtimeMs, bytes: readFileSync(OUT_PATH) };
  assert.equal(after.mtime, before.mtime);
  assert.ok(before.bytes.equals(after.bytes));
  let code = 0;
  try {
    execFileSync(process.execPath, [SCRIPT, '--bogus'], { stdio: 'pipe' });
  } catch (error) {
    code = error.status;
  }
  assert.equal(code, 2);
});

test('buildConsumability is deterministic on the same tree', () => {
  withFence((dirs) => {
    assert.equal(serialize(buildConsumability(dirs)), serialize(buildConsumability(dirs)));
  });
});

/* ================================== P0-5: LIVE observation, not self-hash === */

test('P0-5 a wrong state for the directory fails EVEN with every digest recomputed', () => {
  withFence((dirs) => {
    mutate(dirs.inventoryPath, (inventory) => {
      const backlog = inventory.outputs.find((e) => e.namespace === 'backlog');
      backlog.state = 'STALE_OWN_INPUTS';
      // recompute every digest so the ONLY thing left wrong is the state
      inventory.digests.states = createHash('sha256')
        .update(JSON.stringify(inventory.outputs.map((e) => [e.path, e.state])))
        .digest('hex');
    });
    const findings = validateInventory(dirs);
    assert.ok(
      findings.some((f) => f.includes('must carry UNREPRODUCIBLE_BLOCKED')),
      findings.join(' | '),
    );
    assert.ok(
      findings.some((f) => f.includes('which this writer may not derive')),
      findings.join(' | '),
    );
  });
});

test('P0-5 mutating the DOWNSTREAM ARTIFACT after the fence was cut is detected', () => {
  withFence((dirs) => {
    assert.deepEqual(validateInventory(dirs), []);
    // the fence recorded `superseded`; the artifact now declares the current
    // four-plane vocabulary. Only a LIVE read can see that.
    writeFileSync(
      join(dirs.backlogDir, 'alpha.json'),
      JSON.stringify({ planeVocabulary: PLANE_VOCABULARY }),
    );
    const findings = validateInventory(dirs);
    assert.ok(
      findings.some((f) => f.includes('vocabularyObservable') || f.includes('declaredPlaneVocabulary')),
      findings.join(' | '),
    );
  });
});

test('P0-5 producer, purity and evidence are checked against the namespace, not trusted', () => {
  withFence((dirs) => {
    mutate(dirs.inventoryPath, (inventory) => {
      const backlog = inventory.outputs.find((e) => e.namespace === 'backlog');
      backlog.producer = 'cascade-materialize.mjs';
      backlog.producerPurity = 'pure';
      backlog.purityEvidence = 'trust me';
    });
    const findings = validateInventory(dirs);
    for (const field of ['producer', 'producerPurity', 'purityEvidence']) {
      assert.ok(findings.some((f) => f.includes(field)), `${field}: ${findings.join(' | ')}`);
    }
  });
});

test('P0-5 a DUPLICATE path is rejected', () => {
  withFence((dirs) => {
    mutate(dirs.inventoryPath, (inventory) => {
      inventory.outputs.push({ ...inventory.outputs[0] });
    });
    const findings = validateInventory(dirs);
    assert.ok(findings.some((f) => f.includes('enumerated more than once')), findings.join(' | '));
  });
});

test('P0-5 an extra NON-JSON member of a fenced namespace is not silently skipped', () => {
  withFence((dirs) => {
    writeFileSync(join(dirs.backlogDir, 'notes.txt'), 'stray');
    const findings = validateInventory(dirs);
    assert.ok(findings.some((f) => f.includes('notes.txt')), findings.join(' | '));
    // and once the fence is re-cut it is STILL flagged: membership is exact,
    // and an unexpected member needs a ruling rather than a regeneration.
    writeFileSync(dirs.inventoryPath, serialize(buildConsumability(dirs)));
    const after = validateInventory(dirs);
    assert.ok(after.some((f) => f.includes('non-JSON member')), after.join(' | '));
  });
});

/* ======================================== P1-3: fail-closed for unknowns === */

test('P1-3 assertConsumable BLOCKS an unknown path inside a fenced namespace', () => {
  withFence((dirs) => {
    assert.throws(
      () => assertConsumable(['manifest/cascade/backlog/never-sealed.json'], { inventoryPath: dirs.inventoryPath }),
      /UNKNOWN_MEMBER/,
      'a member nobody sealed is the dangerous case, not the safe one',
    );
    assert.throws(
      () => assertConsumable(['manifest/cascade/materialized/ghost.json'], { inventoryPath: dirs.inventoryPath }),
      /UNKNOWN_MEMBER/,
    );
    assert.equal(
      assertConsumable(['packages/core/manifest/index.json'], { inventoryPath: dirs.inventoryPath }),
      true,
      'outside both namespaces is genuinely out of scope',
    );
  });
});
