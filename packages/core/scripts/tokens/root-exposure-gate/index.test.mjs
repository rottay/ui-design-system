/**
 * Drills for root-exposure-gate. Every one plants a real defect in the real
 * tree and restores it, because a gate whose drills only ever feed it a fixture
 * proves the fixture, not the tree.
 *
 * The three laws each get a planted red, and the two escape hatches that make
 * the live tree green -- `representativeOnly` channel lists and the written
 * gap adjudication -- each get a control proving they are load-bearing rather
 * than decorative.
 */

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { BASELINE_PATH, CATALOG_PATH, CONTROLS_DIR, collectFindings, countByExposure, isRefinedRoot } from './index.mjs';

const MODULE_URL = new URL('./index.mjs', import.meta.url).href;
const BANNER = /root-exposure-gate OK/;


function expectFinding(findings, fragment, message) {
  assert.ok(
    findings.some((finding) => finding.includes(fragment)),
    `${message}; got ${JSON.stringify(findings, null, 1)}`,
  );
}

/** Plant a mutated catalog, run the gate, restore -- always. */
function withCatalog(mutate, run) {
  const original = readFileSync(CATALOG_PATH, 'utf8');
  try {
    const doc = JSON.parse(original);
    mutate(doc);
    writeFileSync(CATALOG_PATH, `${JSON.stringify(doc, null, 2)}\n`);
    run(collectFindings());
  } finally {
    writeFileSync(CATALOG_PATH, original);
  }
}

function withControl(controlId, mutate, run) {
  const target = join(CONTROLS_DIR, `${controlId}.json`);
  const original = readFileSync(target, 'utf8');
  try {
    const doc = JSON.parse(original);
    mutate(doc);
    writeFileSync(target, `${JSON.stringify(doc, null, 2)}\n`);
    run(collectFindings());
  } finally {
    writeFileSync(target, original);
  }
}

const findRoot = (doc, exposure) => doc.roots.find((root) => root.exposure === exposure);

test('the live tree passes', () => {
  assert.deepEqual(collectFindings(), []);
});

test('the live snapshot is the measured one, not a guess', () => {
  const counts = countByExposure(JSON.parse(readFileSync(CATALOG_PATH, 'utf8')).roots);
  // F4A-6 (K3): entra `tier.page.ink` (--ds-color-text-page) como cabeza
  // interna — internal-head hasta que F4B le de dial, que es lo que hacen sus
  // cinco hermanas de tinta. tenant-dial y gap no se mueven en ese packet.
  // Adjudicacion DT 2026-08-26 (gate-debt, ajena a C5): type.family.mono y
  // type.family.display reclasificados gap->tenant-dial bajo
  // typography.families (medido; calibrado F4B-14) -- 10->8 gaps, 26->28
  // tenant-dial.
  // P0 (2026-08-28): se abrio la ultima fila `frontier`, `palette.status-seeds`
  // (tier Standard), y las 4 raices ramp.seed.{error,info,success,warning}
  // pasaron de gap a tenant-dial. gap BAJA 8->4, la direccion legal. neutral NO
  // acompanio: no tiene semilla en ninguna via, asi que un dial suyo seria una
  // perilla que no mueve nada -- su adjudicacion subio al owner.
  assert.deepEqual(counts, { 'tenant-dial': 32, 'internal-head': 28, gap: 4 });
});

/* ------- LAW 0b: the premise that makes the refined-root discount honest ------ */

test('LAW 0b: every refined root in the live tree carries its derivation evidence', () => {
  const roots = JSON.parse(readFileSync(CATALOG_PATH, 'utf8')).roots;
  const refined = roots.filter((root) => isRefinedRoot(root.rootId));
  /* EL NUMERO NO SE TECLEA DOS VECES. Antes esta linea decia `33` a mano, al
   * lado de un baseline que declara `refinedRootsExcluded` -- dos copias del
   * mismo hecho que pueden divergir en silencio, que es la patologia que este
   * frente persigue. Ahora el drill EXIGE que coincidan: cuando el eje paso
   * crece legitimamente (lote 3B: +3 raices de tier.raised.fg), este drill se
   * pone rojo hasta que la re-ancla del baseline se escriba con su razon. Un
   * solo numero que mover, y el rojo es la señal de que hay que moverlo. */
  const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
  assert.equal(refined.length, baseline.refinedRootsExcluded,
    `el arbol tiene ${refined.length} raices refinadas y el baseline declara ${baseline.refinedRootsExcluded}: `
    + 're-ancla `refinedRootsExcluded` (y su parrafo `reading`) con razon escrita');
  assert.deepEqual(
    refined.filter((root) => !(root.derivationDebt && root.derivation)).map((root) => root.rootId),
    [],
    'a refined root without derivation evidence is a root the filter is silencing',
  );
});

test('LAW 0b: a refined root that loses derivationDebt fails', () => {
  withCatalog(
    (doc) => {
      delete doc.roots.find((root) => isRefinedRoot(root.rootId)).derivationDebt;
    },
    (findings) => expectFinding(findings, 'refined root without derivationDebt', 'the discount needs its premise'),
  );
});

test('LAW 0b: a refined root that loses derivation fails', () => {
  withCatalog(
    (doc) => {
      delete doc.roots.find((root) => isRefinedRoot(root.rootId)).derivation;
    },
    (findings) => expectFinding(findings, 'refined root without derivation', 'the discount needs its premise'),
  );
});

test('LAW 0b: the invariant reaches ONLY refined roots (a parent may lack both)', () => {
  withCatalog(
    (doc) => {
      const parent = doc.roots.find((root) => !isRefinedRoot(root.rootId));
      delete parent.derivationDebt;
      delete parent.derivation;
    },
    (findings) =>
      assert.deepEqual(
        findings.filter((f) => f.includes('refined root without')),
        [],
        'the filter discounts refined roots only, so only they owe the evidence',
      ),
  );
});

/* ---------------- LAW 1: a dial with no owner ---------------- */

test('LAW 1: a tenant-dial root with no governedBy fails', () => {
  withCatalog(
    (doc) => {
      findRoot(doc, 'tenant-dial').governedBy = null;
    },
    (findings) => expectFinding(findings, 'but governedBy is null', 'a dial without an owner must fail'),
  );
});

test('LAW 1: a tenant-dial root pointing at a control that does not exist fails', () => {
  withCatalog(
    (doc) => {
      findRoot(doc, 'tenant-dial').governedBy = 'chrome.imaginary';
    },
    (findings) =>
      expectFinding(findings, 'is not a control in manifest/controls/', 'a ghost owner must fail'),
  );
});

/* ---------------- LAW 2: a knobless head that gains a knob ---------------- */

test('LAW 2: an internal-head whose channel a control starts declaring fails', () => {
  const catalog = JSON.parse(readFileSync(CATALOG_PATH, 'utf8'));
  const head = findRoot(catalog, 'internal-head');
  withControl(
    'token-overrides',
    (doc) => {
      doc.declaredOutputs.channels = [...doc.declaredOutputs.channels, head.channel];
    },
    (findings) =>
      expectFinding(
        findings,
        `${head.rootId}: exposure 'internal-head' but token-overrides declares its head channel`,
        'winning a knob in silence must fail',
      ),
  );
});

test('LAW 2: an internal-head that simply names a control fails', () => {
  withCatalog(
    (doc) => {
      findRoot(doc, 'internal-head').governedBy = 'token-overrides';
    },
    (findings) => expectFinding(findings, 'a governed root is a tenant-dial', 'a governed head is a dial'),
  );
});

/* ---------------- LAW 3: gap, decrease-only and adjudicated ---------------- */

test('LAW 3: a gap whose channel a control declares, with no written adjudication, fails', () => {
  const catalog = JSON.parse(readFileSync(CATALOG_PATH, 'utf8'));
  // Two of the ten gaps ALREADY carry a written adjudication naming
  // `token-overrides` (`ramp.seed.error`, `ramp.seed.neutral`); planting on one
  // of those would be admitted, correctly, and prove nothing. Pick a gap with a
  // real head channel whose note does NOT name the control, and say so.
  const gap = catalog.roots.find(
    (root) =>
      root.exposure === 'gap' &&
      typeof root.channel === 'string' &&
      !String(root.exposureNote ?? '').includes('token-overrides'),
  );
  assert.ok(gap, 'the drill needs an unadjudicated gap to plant on');
  withControl(
    'token-overrides',
    (doc) => {
      doc.declaredOutputs.channels = [...doc.declaredOutputs.channels, gap.channel];
    },
    (findings) =>
      expectFinding(
        findings,
        'exposureNote does not name it',
        'a gap that gained a control without being reclassified must fail',
      ),
  );
});

test('CONTROL: the written gap adjudication is load-bearing, not a shrug', () => {
  /* EL SUJETO SE PLANTA, NO SE TOMA PRESTADO DEL ARBOL. Este drill usaba
   * `ramp.seed.error`, que era el UNICO gap vivo cuyo canal declaraba un
   * control. P0 lo hizo `tenant-dial` y la ley se quedo sin sujeto: medido,
   * ninguno de los 4 gaps restantes tiene su cabeza declarada por un control,
   * asi que el drill habria pasado a verde por AUSENCIA de caso -- que es la
   * peor forma de verde. Se planta el caso en su lugar: un gap cuya cabeza SI
   * declara un control. Asi la ley se prueba aunque el arbol la deje sin
   * ejemplar, que es exactamente lo que acaba de pasar. */
  const declared = '--ds-color-primary';   // lo declara palette.seeds
  withCatalog(
    (doc) => {
      const gap = doc.roots.find((entry) => entry.exposure === 'gap');
      gap.channel = declared;
      gap.exposureNote = 'no reason recorded';
    },
    (findings) =>
      expectFinding(
        findings,
        "exposure 'gap' but palette.seeds declares its head channel --ds-color-primary",
        'the adjudication must be what admits the mention',
      ),
  );
  // Y el CONTROL del control: con la razon que NOMBRA al control, el mismo
  // arbol queda verde. Sin esta mitad, el drill probaria que algo falla, no que
  // la razon escrita es lo que lo admite.
  withCatalog(
    (doc) => {
      const gap = doc.roots.find((entry) => entry.exposure === 'gap');
      gap.channel = declared;
      gap.exposureNote = 'palette.seeds menciona este canal, pero un seed de marca no es una perilla de esta raiz';
    },
    (findings) =>
      assert.deepEqual(
        findings.filter((finding) => /declares its head channel --ds-color-primary/.test(finding)),
        [],
        'nombrar el control en la razon es lo que admite la mencion',
      ),
  );
});

test('LAW 3: gap is decrease-only -- growth fails', () => {
  withCatalog(
    (doc) => {
      const head = findRoot(doc, 'internal-head');
      head.exposure = 'gap';
      doc.reconciliation.byExposure.counts['internal-head'] -= 1;
      doc.reconciliation.byExposure.counts.gap += 1;
    },
    (findings) => expectFinding(findings, 'snapshot: gap moved from 4 to 5', 'gap may never grow'),
  );
});

test('LAW 3: a gap that closes still fails until the snapshot is updated', () => {
  withCatalog(
    (doc) => {
      const gap = doc.roots.find((root) => root.exposure === 'gap');
      gap.exposure = 'tenant-dial';
      gap.governedBy = 'token-overrides';
      doc.reconciliation.byExposure.counts.gap -= 1;
      doc.reconciliation.byExposure.counts['tenant-dial'] += 1;
    },
    (findings) =>
      expectFinding(findings, 'snapshot: gap shrank from 4 to 3', 'good news still has to be written down'),
  );
});

/* ---------------- catalog self-consistency and vocabulary ---------------- */

test('the catalog must agree with its own reconciliation counts', () => {
  withCatalog(
    (doc) => {
      doc.reconciliation.byExposure.counts.gap = 99;
    },
    (findings) => expectFinding(findings, 'but roots[] holds 4', 'a catalog that miscounts itself must fail'),
  );
});

test('an invented exposure is a typo, not a new category', () => {
  withCatalog(
    (doc) => {
      findRoot(doc, 'gap').exposure = 'sometimes';
    },
    (findings) => expectFinding(findings, 'is not one of tenant-dial | internal-head | gap', 'closed vocabulary'),
  );
});

test('a changed reading fails until it is re-read', () => {
  withCatalog(
    (doc) => {
      doc.reconciliation.byExposure.reading = 'something else entirely';
    },
    (findings) => expectFinding(findings, 'the catalog reading changed', 'the reading is part of the snapshot'),
  );
});


/* ── el eje paso: refinar el indice NO mueve el vocabulario ──────────────── */

test('LEY DE REFINAMIENTO: agregar raices-hija de paso no mueve un solo contador', () => {
  const parents = [
    { rootId: 'tier.page.border', exposure: 'gap', channel: '--ds-a' },
    { rootId: 'tier.base.fg', exposure: 'internal-head', channel: '--ds-b' },
    { rootId: 'tier.control.bg', exposure: 'tenant-dial', channel: '--ds-c' },
  ];
  const before = countByExposure(parents);
  assert.deepEqual(before, { 'tenant-dial': 1, 'internal-head': 1, gap: 1 });
  // Refinar el indice: cuatro hijas del padre gap y dos del internal-head.
  const refined = [
    ...parents,
    { rootId: 'tier.page.border.primary', exposure: 'gap', channel: '--ds-a1' },
    { rootId: 'tier.page.border.focus', exposure: 'gap', channel: '--ds-a2' },
    { rootId: 'tier.page.border.secondary', exposure: 'gap', channel: '--ds-a3' },
    { rootId: 'tier.page.border.tertiary', exposure: 'gap', channel: '--ds-a4' },
    { rootId: 'tier.base.fg.muted', exposure: 'internal-head', channel: '--ds-b1' },
    { rootId: 'tier.base.fg.disabled', exposure: 'internal-head', channel: '--ds-b2' },
  ];
  assert.deepEqual(countByExposure(refined), before,
    'una perilla faltante indexada mas fino sigue siendo UNA perilla faltante');
});

test('la excepcion es de CONTEO agregado, no una amnistia: un PADRE nuevo si mueve el contador', () => {
  const base = [{ rootId: 'tier.base.fg', exposure: 'internal-head', channel: '--ds-b' }];
  const withNewParent = [...base, { rootId: 'tier.accent.bg', exposure: 'gap', channel: '--ds-d' }];
  assert.equal(countByExposure(base).gap, 0);
  assert.equal(countByExposure(withNewParent).gap, 1, 'un gap de verdad sigue subiendo el conteo y sigue fallando');
});

test('isRefinedRoot distingue la raiz de nivel de su hija de paso', () => {
  assert.equal(isRefinedRoot('tier.base.fg'), false);
  assert.equal(isRefinedRoot('tier.base.fg.muted'), true);
  assert.equal(isRefinedRoot('state.delta.hover'), false);
  assert.equal(isRefinedRoot('ramp.seed.primary'), false);
  assert.equal(isRefinedRoot(undefined), false);
});

/* ── el guard del entry: importar NO ejecuta el main ─────────────────────── */

test('importar este modulo desde un entry llamado index.mjs NO corre su main', () => {
  /* LA LATENCIA QUEDA DRILLEADA, NO SOLO ARREGLADA. El guard anterior era
   * `process.argv[1].endsWith('index.mjs')` y por la ley folder/index eso es
   * verdadero para CUALQUIER productor del arbol: importar este modulo desde
   * otro le ejecutaba el main, y un fallo habria matado al importador con un
   * `process.exit(1)` ajeno. El entry de prueba se llama `index.mjs` a
   * proposito -- es el nombre que disparaba el defecto. */
  const dir = mkdtempSync(join(tmpdir(), 'guard-drill-'));
  try {
    writeFileSync(join(dir, 'index.mjs'), `await import(${JSON.stringify(MODULE_URL)});\nconsole.log('IMPORT-OK');\n`);
    const run = spawnSync(process.execPath, [join(dir, 'index.mjs')], { encoding: 'utf8' });
    assert.equal(run.status, 0, `el import no debe fallar:\n${run.stderr}`);
    assert.match(run.stdout, /IMPORT-OK/, 'el entry de prueba corrio');
    assert.doesNotMatch(run.stdout, BANNER, 'el main corrio por el solo hecho de importar el modulo');
    assert.doesNotMatch(run.stderr, BANNER);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('el modulo SIGUE corriendo cuando es el entry (el guard no lo desarmo)', () => {
  const run = spawnSync(process.execPath, [fileURLToPath(MODULE_URL)], { encoding: 'utf8' });
  assert.match(`${run.stdout}${run.stderr}`, BANNER, 'el guard endurecido no debe matar la invocacion CLI');
});
