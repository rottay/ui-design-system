/**
 * Drills del read-without-producer-ratchet.
 *
 * Dos plantan CSS real en el corpus (un nombre nuevo sin productor, y ese mismo
 * nombre con productor) y los demas plantan la ROTURA DEL CLASIFICADOR, que es
 * lo que los invariantes de forma existen para cazar: un contador puede estar
 * verde y estar contando mal.
 *
 * El CSS plantado NO se escribe en el arbol real: `collectSkinFiles()` acepta
 * una raiz, y el drill arma una sandbox de tmpdir con la unica carpeta
 * `engines/modern/skin/` que le importa.
 */

import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { collectSkinFiles } from '../../../libraries/engine/skins/files/index.mjs';
import { collectAuthoredStylesheets, collectChannelProducers, collectDeclaredChannels } from '../../../libraries/tokens/producers/index.mjs';
import {
  BASELINE_PATH,
  classifyReadClass,
  classifyReadWithoutProducer,
  collectComponentInlineFiles,
  collectFindings,
  collectModernSkinFiles,
  collectSharedPaintFiles,
  readClassFindings,
  shapeFailures,
} from './index.mjs';

const PRODUCERS = collectChannelProducers().producers;

function expectFinding(findings, fragment, message) {
  assert.ok(
    findings.some((finding) => finding.includes(fragment)),
    `${message}; got ${JSON.stringify(findings, null, 1)}`,
  );
}

/** Planta `css` bajo un `engines/modern/skin/` sandbox y suma lo hallado al corpus real. */
function withPlantedModernCss(css, run) {
  const sandbox = mkdtempSync(join(tmpdir(), 'read-without-producer-drill-'));
  const skinDir = join(sandbox, 'src/foundation/tokens/css/runtime/engines/modern/skin');
  mkdirSync(skinDir, { recursive: true });
  writeFileSync(join(skinDir, '__read-without-producer-drill.css'), css);
  try {
    run([...collectModernSkinFiles(), ...collectModernSkinFiles(collectSkinFiles(sandbox))]);
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
}

test('the live tree matches its baseline', () => {
  assert.deepEqual(collectFindings(), []);
});

test('the pinned debt is the measured debt, not a guess', () => {
  const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
  const result = classifyReadWithoutProducer();
  assert.equal(result.debt.length, baseline.debt);
  assert.equal(result.denominator.length, baseline.denominator);
  assert.equal(result.produced, baseline.produced);
});

test('the corpus is Modern only: no frozen-engine skin file is ever read', () => {
  const files = collectModernSkinFiles();
  assert.ok(files.length > 0, 'un corpus vacio nunca es un pase');
  for (const file of files) {
    assert.ok(!file.includes('/engines/classic/'), `classic esta congelado: ${file}`);
    assert.ok(!file.includes('/engines/rustic/'), `rustic esta congelado: ${file}`);
  }
});

test('a NEW name with no producer grows the debt and fails', () => {
  withPlantedModernCss(
    '.ds-read-drill { color: var(--ds-read-without-producer-drill-orphan, #ff0000); }\n',
    (files) => {
      const result = classifyReadWithoutProducer(files, PRODUCERS);
      assert.ok(result.debt.includes('--ds-read-without-producer-drill-orphan'));
      expectFinding(
        collectFindings({ files }),
        'debt GREW from',
        'un nombre que nadie escribe tiene que subir el contador y enrojecer',
      );
    },
  );
});

test('the same name WITH a producer does not grow the debt', () => {
  // El control que prueba que el rojo de arriba lo causa la FALTA DE PRODUCTOR
  // y no la aparicion del nombre.
  const name = '--ds-read-without-producer-drill-orphan';
  withPlantedModernCss(`.ds-read-drill { color: var(${name}, #ff0000); }\n`, (files) => {
    const findings = collectFindings({
      files,
      producers: new Set([...PRODUCERS, name]),
    });
    assert.equal(
      findings.filter((finding) => finding.includes('debt GREW')).length,
      0,
      `darle productor al nombre no puede subir el contador; got ${JSON.stringify(findings)}`,
    );
  });
});

test('INJECTION: un nombre que solo vive dentro de un comentario CSS no entra al denominador', () => {
  const name = '--ds-read-without-producer-injection';
  withPlantedModernCss(`/* .ds-x { color: var(${name}); } */\n.ds-y { color: var(--ds-color-primary); }\n`, (files) => {
    const result = classifyReadWithoutProducer(files, PRODUCERS);
    assert.ok(!result.denominator.includes(name), 'un comentario no es pintura');
  });
  // El control que impide que el drill pase por no medir nada.
  withPlantedModernCss(`.ds-x { color: var(${name}); }\n`, (files) => {
    const result = classifyReadWithoutProducer(files, PRODUCERS);
    assert.ok(result.denominator.includes(name), 'fuera del comentario el mismo nombre si entra');
  });
});

test('SHAPE: a name that HAS a producer can never be reported as debt', () => {
  const broken = {
    denominator: ['--ds-color-primary'],
    producedNames: new Set(['--ds-color-primary']),
    debt: ['--ds-color-primary'],
    produced: 0,
  };
  expectFinding(
    shapeFailures(broken, PRODUCERS).failures,
    'has a producer and must never be counted as debt',
    'el invariante tiene que cazar un clasificador que declara deudora a una raiz producida',
  );
});

test('SHAPE: an empty corpus is never a pass', () => {
  expectFinding(
    shapeFailures({ denominator: [], debt: [], produced: 0 }, PRODUCERS).failures,
    'resolved to zero read names',
    'un corpus vacio tiene que fallar en vez de reportar cero deuda',
  );
});

test('the producer set is the SHARED one, not a second measurement', () => {
  // La misma pregunta que responde el arma transitiva de cascade-wiring: si
  // este gate midiera su propio conjunto, dos numeros del mismo runner
  // discreparian sobre que es una raiz.
  const { declared, compiled, producers } = collectChannelProducers();
  assert.ok(declared.size > 0, 'el CSS autorado declara canales');
  assert.ok(compiled.size > 0, 'los derivadores de familia emiten canales');
  assert.equal(producers.size, new Set([...declared, ...compiled]).size);
});

/** Corre `collectFindings` contra una copia del baseline editada por `edit`. */
function withEditedBaseline(edit, run) {
  const sandbox = mkdtempSync(join(tmpdir(), 'read-without-producer-residue-'));
  const path = join(sandbox, 'index.json');
  const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
  edit(baseline);
  writeFileSync(path, JSON.stringify(baseline));
  try {
    run(path);
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
}

const RESIDUE = JSON.parse(readFileSync(BASELINE_PATH, 'utf8')).namedResidue['list-toolbar'];
const CHANNELS = collectChannelProducers();

for (const arm of ['readWithoutProducer', 'kernelAuthorableWithoutRest']) {
  test(`RESIDUE ${arm}: an unpinned residue name fails as growth`, () => {
    const [name] = Object.keys(RESIDUE[arm]);
    withEditedBaseline(
      (baseline) => delete baseline.namedResidue['list-toolbar'][arm][name],
      (baselinePath) =>
        expectFinding(
          collectFindings({ baselinePath, channelProducers: CHANNELS }),
          `residue list-toolbar.${arm} GREW: ${name}`,
          'un residuo que nadie pino tiene que enrojecer',
        ),
    );
  });
}

test('RESIDUE readWithoutProducer: every pinned name that gains a producer fails as a silent fix', () => {
  const names = Object.keys(RESIDUE.readWithoutProducer);
  assert.ok(names.length > 0, 'un arma sin residuo pineado no prueba nada');
  for (const name of names) {
    expectFinding(
      collectFindings({ producers: new Set([...CHANNELS.producers, name]), channelProducers: CHANNELS }),
      `residue list-toolbar.readWithoutProducer: ${name} is no longer residue`,
      'dar productor a un residuo pineado sin el checkpoint del owner tiene que enrojecer',
    );
  }
});

test('RESIDUE kernelAuthorableWithoutRest: a pinned name that gains a rest declaration fails as a silent fix', () => {
  const [name] = Object.keys(RESIDUE.kernelAuthorableWithoutRest);
  const declared = new Set([...CHANNELS.declared, name]);
  expectFinding(
    collectFindings({ channelProducers: { ...CHANNELS, declared } }),
    `residue list-toolbar.kernelAuthorableWithoutRest: ${name} is no longer residue`,
    'declarar el reposo de un residuo pineado sin el checkpoint del owner tiene que enrojecer',
  );
});

/* Los 17 despines de 2026-09-23 (residueNote): cada nombre tiene productor hoy y,
 * sin pin, perderlo lo devuelve al residuo como crecimiento. */
const RULED_EXITS = [
  '--ds-filter-chip-radius',
  '--ds-toolbar-compact-padding',
  '--ds-toolbar-control-gap',
  '--ds-toolbar-control-radius',
  '--ds-toolbar-controls-gap',
  '--ds-toolbar-controls-radius',
  '--ds-toolbar-filter-strip-padding',
  '--ds-toolbar-icon-radius',
  '--ds-toolbar-min-height',
  '--ds-toolbar-mobile-actions-radius',
  '--ds-toolbar-mobile-rail-radius',
  '--ds-toolbar-phone-filter-strip-padding',
  '--ds-toolbar-phone-padding',
  '--ds-toolbar-saved-views-radius',
  '--ds-toolbar-sheen-opacity',
  '--ds-toolbar-title-gap',
  '--ds-toolbar-title-letter-spacing',
];

test('RESIDUE ruled exits: a despinned name that loses its producer fails as growth', () => {
  assert.equal(RULED_EXITS.length, 17);
  for (const name of RULED_EXITS) {
    assert.ok(!(name in RESIDUE.readWithoutProducer), `${name} ya no esta pineado`);
    assert.ok(CHANNELS.producers.has(name), `${name} tiene productor en el arbol vivo`);
    const producers = new Set([...CHANNELS.producers].filter((produced) => produced !== name));
    expectFinding(
      collectFindings({ producers, channelProducers: { ...CHANNELS, producers } }),
      `residue list-toolbar.readWithoutProducer GREW: ${name}`,
      'un nombre despineado que vuelve a quedarse sin productor tiene que enrojecer',
    );
  }
});

test('RESIDUE language scope: --ds-toolbar-title-letter-spacing fails on growth and on a silent re-pin', () => {
  const name = '--ds-toolbar-title-letter-spacing';
  assert.ok(!(name in RESIDUE.readWithoutProducer), 'el residuo de idioma salio con su checkpoint');
  const producers = new Set([...CHANNELS.producers].filter((produced) => produced !== name));
  expectFinding(
    collectFindings({ producers, channelProducers: { ...CHANNELS, producers } }),
    `residue list-toolbar.readWithoutProducer GREW: ${name}`,
    'perder el productor de la raiz tiene que enrojecer',
  );
  withEditedBaseline(
    (baseline) => {
      baseline.namedResidue['list-toolbar'].readWithoutProducer[name] = 'drill';
    },
    (baselinePath) =>
      expectFinding(
        collectFindings({ baselinePath, channelProducers: CHANNELS }),
        `residue list-toolbar.readWithoutProducer: ${name} is no longer residue`,
        'volver a pinearlo con productor vivo tiene que enrojecer',
      ),
  );
});

/* ── Las clases de lectura fuera del skin Modern ─────────────────────────── */

/* WO-EVI-03 found eleven; code-block's seven left through the ledger's exits,
   followed by the family's three unrouted siblings, then voice-input's and
   loading-overlay's three. */
const EVI_03_REMAINING = Object.freeze({
  '--ds-size-touch-target': ['sharedPaint', 'WO-FAM-11'],
});

const EXITS = Object.freeze({
  '--ds-code-block-copy-bg-hover': 'sharedPaint',
  '--ds-code-block-copied-frame': 'sharedPaint',
  '--ds-code-block-copied-ink': 'sharedPaint',
  '--ds-code-block-motion-duration': 'sharedPaint',
  '--ds-code-block-selection-bg': 'sharedPaint',
  '--ds-code-block-gutter-ink': 'componentInline',
  '--ds-code-block-header-bg': 'componentInline',
  '--ds-code-block-copy-bg-pressed': 'sharedPaint',
  '--ds-code-block-copy-ink-hover': 'sharedPaint',
  '--ds-code-block-focus-ring': 'sharedPaint',
  '--ds-voice-input-focus-ring': 'sharedPaint',
  '--ds-loading-overlay-scrim-opacity': 'sharedPaint',
  '--ds-export-button-toast-duration': 'sharedPaint',
  '--ds-kbd-font-family': 'sharedPaint',
  '--ds-control-size-sm': 'sharedPaint',
  '--ds-control-size-md': 'sharedPaint',
  '--ds-overlay-backdrop-filter': 'sharedPaint',
});

/* The two ways a name leaves the names ledger. EXITS: the read was retired and
 * the name must stay unproduced, or the exit was hiding a producer. TEMPLATE_EXITS:
 * the name was ALWAYS produced -- the chrome compiler's card templates emit it --
 * and the census only learned to see it in 664104285; those leave by GAINING a
 * visible producer, which is the opposite event and is checked as such. */
const TEMPLATE_EXITS = Object.freeze({
  '--ds-workspace-card-icon-bg': 'sharedPaint',
  '--ds-workspace-card-icon-border': 'sharedPaint',
  '--ds-workspace-card-icon-color': 'sharedPaint',
  '--ds-collection-card-depth': 'sharedPaint',
  '--ds-collection-card-gap': 'sharedPaint',
  '--ds-collection-card-glass-bg': 'sharedPaint',
  '--ds-collection-card-grid-bg': 'sharedPaint',
  '--ds-collection-card-grid-size': 'sharedPaint',
  '--ds-collection-card-hover-transform': 'sharedPaint',
  '--ds-collection-card-min-height': 'sharedPaint',
  '--ds-collection-card-overlay': 'sharedPaint',
  '--ds-collection-card-sheen': 'sharedPaint',
  '--ds-collection-card-transition': 'sharedPaint',
  '--ds-metric-card-body-color': 'sharedPaint',
  '--ds-metric-card-footer-bg': 'sharedPaint',
  '--ds-metric-card-footer-border': 'sharedPaint',
  '--ds-metric-card-footer-color': 'sharedPaint',
  '--ds-metric-card-gap': 'sharedPaint',
  '--ds-metric-card-glass-bg': 'sharedPaint',
  '--ds-metric-card-grid-bg': 'sharedPaint',
  '--ds-metric-card-grid-line': 'sharedPaint',
  '--ds-metric-card-grid-size': 'sharedPaint',
  '--ds-metric-card-hover-transform': 'sharedPaint',
  '--ds-metric-card-overlay': 'sharedPaint',
  '--ds-metric-card-status-bg': 'sharedPaint',
  '--ds-metric-card-status-border': 'sharedPaint',
  '--ds-metric-card-status-color': 'sharedPaint',
  '--ds-metric-card-transition': 'sharedPaint',
});

/* PRODUCED_EXITS: the read stays and the name gained a NEW producer (the palette
 * deriver, 91cf964ab; its ledger exit row landed in 7120887d4). */
const PRODUCED_EXITS = Object.freeze({
  '--ds-color-border-hover': 'sharedPaint',
});

const readBaseline = () => JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));

/** Planta archivos en una sandbox con forma de paquete y devuelve su raiz. */
function withSandbox(files, run) {
  const sandbox = mkdtempSync(join(tmpdir(), 'read-without-producer-class-drill-'));
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(join(sandbox, path, '..'), { recursive: true });
    writeFileSync(join(sandbox, path), text);
  }
  try {
    run(sandbox);
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
}

const AGNOSTIC_SKIN = 'src/foundation/tokens/css/presentation/components/skin/__rwp-drill/index.css';
const COMPONENT_TSX = 'src/components/primitives/display/__rwp-drill/index.tsx';
const ORPHAN = '--ds-read-without-producer-class-drill-orphan';

function plantedFindings(sandbox, { producers = PRODUCERS } = {}) {
  return collectFindings({
    producers,
    sharedFiles: [...collectSharedPaintFiles(), ...collectSharedPaintFiles(sandbox)],
    inlineFiles: [...collectComponentInlineFiles(), ...collectComponentInlineFiles(sandbox)],
  });
}

test('BLIND SPOT: the Modern-only corpus cannot see the remaining WO-EVI-03 rows, the read classes see every one', () => {
  const modern = new Set(classifyReadWithoutProducer().denominator);
  const shared = classifyReadClass(collectSharedPaintFiles(), 'css', PRODUCERS);
  const inline = classifyReadClass(collectComponentInlineFiles(), 'script', PRODUCERS);
  for (const [name, [cls]] of Object.entries(EVI_03_REMAINING)) {
    assert.ok(!modern.has(name), `${name} would not be a blind spot if the Modern skin read it`);
    const measured = cls === 'sharedPaint' ? shared : inline;
    assert.ok(measured.debt[name], `${name} must be measured as ${cls} debt`);
  }
});

test('the remaining WO-EVI-03 rows are named one by one in the ledger, each with its owner or proposal', () => {
  const classes = readBaseline().readClasses;
  for (const [name, [cls, wo]] of Object.entries(EVI_03_REMAINING)) {
    const row = classes[cls].names[name];
    assert.ok(row, `${name} must be a ${cls} ledger row`);
    assert.equal(row.owner ?? row.ownerProposal, wo, `${name} is routed to ${wo}`);
    assert.match(row.evidence ?? '', /WO-EVI-03/, `${name} cites the measurement that found it`);
  }
});

test('the 46 exits are gone from the tree and the ledger, each written down with its disposition and mover', () => {
  const classes = readBaseline().readClasses;
  const shared = classifyReadClass(collectSharedPaintFiles(), 'css', PRODUCERS);
  const inline = classifyReadClass(collectComponentInlineFiles(), 'script', PRODUCERS);
  assert.deepEqual(
    Object.keys(classes.exits.rows).sort(),
    [...Object.keys(EXITS), ...Object.keys(TEMPLATE_EXITS), ...Object.keys(PRODUCED_EXITS)].sort()
  );
  for (const [name, cls] of Object.entries(EXITS)) {
    assert.ok(!classes.sharedPaint.names[name] && !classes.componentInline.names[name], `${name} is no longer a row`);
    assert.ok(!shared.debt[name] && !inline.debt[name], `${name} is no longer read without a producer`);
    assert.ok(!PRODUCERS.has(name), `${name} left by losing its read, not by gaining a producer`);
    const exit = classes.exits.rows[name];
    assert.equal(exit.class, cls);
    assert.ok(exit.disposition?.trim() && exit.mover?.trim(), `${name} carries its disposition and mover`);
  }
  for (const [name, cls] of Object.entries(TEMPLATE_EXITS)) {
    assert.ok(!classes.sharedPaint.names[name] && !classes.componentInline.names[name], `${name} is no longer a row`);
    assert.ok(!shared.debt[name] && !inline.debt[name], `${name} is no longer read without a producer`);
    assert.ok(PRODUCERS.has(name), `${name} left by GAINING its visible producer (the template, 664104285)`);
    const exit = classes.exits.rows[name];
    assert.equal(exit.class, cls);
    assert.ok(exit.disposition?.trim() && exit.mover?.trim(), `${name} carries its disposition and mover`);
  }
  for (const [name, cls] of Object.entries(PRODUCED_EXITS)) {
    assert.ok(!classes.sharedPaint.names[name] && !classes.componentInline.names[name], `${name} is no longer a row`);
    assert.ok(!shared.debt[name] && !inline.debt[name], `${name} is no longer read without a producer`);
    assert.ok(PRODUCERS.has(name), `${name} left by GAINING a producer (the palette deriver, 91cf964ab)`);
    const exit = classes.exits.rows[name];
    assert.equal(exit.class, cls);
    assert.ok(exit.disposition?.trim() && exit.mover?.trim(), `${name} carries its disposition and mover`);
    assert.match(exit.disposition, /^produced:/, `${name} is written down as a produced exit`);
    assert.match(exit.mover, /91cf964ab/, `${name} names the commit that added its producer`);
  }
});

test('an exit is not a pin: reading an exited name again is anonymous growth', () => {
  const name = '--ds-code-block-copied-ink';
  withSandbox({ [AGNOSTIC_SKIN]: `.ds-drill { color: var(${name}); }\n` }, (sandbox) => {
    expectFinding(plantedFindings(sandbox), `sharedPaint GREW: ${name}`, 'the exits record does not exempt the name');
  });
});

test('the read classes never read a frozen engine, and never double-count the Modern skin', () => {
  const modern = new Set(collectModernSkinFiles());
  for (const file of [...collectSharedPaintFiles(), ...collectComponentInlineFiles()]) {
    assert.ok(!/\/engines\/(?:classic|rustic)\//.test(file), `frozen engine in a read class: ${file}`);
    assert.ok(!modern.has(file), `the Modern skin is its own class: ${file}`);
  }
});

test('sharedPaint: an unproduced read in the agnostic skin is anonymous and fails', () => {
  withSandbox({ [AGNOSTIC_SKIN]: `.ds-drill { color: var(${ORPHAN}, #ff0000); }\n` }, (sandbox) => {
    expectFinding(plantedFindings(sandbox), `sharedPaint GREW: ${ORPHAN}`, 'the agnostic skin paints under Modern');
    // El control: el mismo nombre con productor no enrojece.
    const produced = plantedFindings(sandbox, { producers: new Set([...PRODUCERS, ORPHAN]) });
    assert.deepEqual(produced, [], 'with a producer the planted read is not debt');
  });
});

test('sharedPaint: a frozen-engine read stays out, and the same read one folder over is caught', () => {
  const frozen = 'src/foundation/tokens/css/runtime/engines/classic/skin/__rwp-drill/index.css';
  withSandbox({ [frozen]: `.ds-drill { color: var(${ORPHAN}); }\n` }, (sandbox) => {
    assert.deepEqual(plantedFindings(sandbox), [], 'classic is frozen');
  });
  withSandbox({ 'src/foundation/tokens/css/foundation/__rwp-drill/index.css': `:root { --x: var(${ORPHAN}); }\n` }, (sandbox) => {
    expectFinding(plantedFindings(sandbox), `sharedPaint GREW: ${ORPHAN}`, 'foundation CSS paints under Modern');
  });
});

test('componentInline: an unproduced inline read fails; a commented one does not; an interpolated one moves prefixSites', () => {
  withSandbox({ [COMPONENT_TSX]: `export const s = { color: 'var(${ORPHAN}, red)' };\n` }, (sandbox) => {
    expectFinding(plantedFindings(sandbox), `componentInline GREW: ${ORPHAN}`, 'an inline read paints like a skin read');
  });
  withSandbox(
    { [COMPONENT_TSX]: `// color: var(${ORPHAN})\n/* var(${ORPHAN}) */\nexport const s = 1;\n` },
    (sandbox) => assert.deepEqual(plantedFindings(sandbox), [], 'a comment is not paint'),
  );
  withSandbox({ [COMPONENT_TSX]: 'export const s = (k) => `var(--ds-drill-${k})`;\n' }, (sandbox) => {
    expectFinding(plantedFindings(sandbox), 'componentInline prefixSites GREW', 'an interpolated name cannot hide');
  });
  withSandbox({ 'src/components/primitives/display/__rwp-drill/tests/x.test.tsx': `const s = 'var(${ORPHAN})';\n` }, (sandbox) => {
    assert.deepEqual(plantedFindings(sandbox), [], 'a test is not productive paint');
  });
});

test('a NEW reader of an already-pinned unproduced name is growth, not coverage', () => {
  const name = '--ds-loading-overlay-z';
  withSandbox({ [AGNOSTIC_SKIN]: `.ds-drill { color: var(${name}); }\n` }, (sandbox) => {
    expectFinding(
      plantedFindings(sandbox),
      `sharedPaint GREW: src/foundation/tokens/css/presentation/components/skin/__rwp-drill/index.css is a new reader of the unproduced ${name}`,
      'the ledger pins reads, not just names',
    );
  });
});

test('a row whose read gained a producer fails until it is deleted (decrease-only)', () => {
  const name = '--ds-export-button-toast-z';
  const findings = collectFindings({ producers: new Set([...PRODUCERS, name]) });
  expectFinding(findings, `sharedPaint SHRANK: ${name} is no longer a read without producer`, 'a silent fix must be written down');
});

test('LEDGER SHAPE: a row with no owner field, or a null owner with no proposal field, fails', () => {
  const measured = { denominator: 1, debt: { [ORPHAN]: ['src/x.css'] }, prefixSites: 0 };
  expectFinding(
    readClassFindings('sharedPaint', measured, { names: { [ORPHAN]: { readers: ['src/x.css'], family: 'x' } } }),
    'carries no owner field',
    'every row states its owner',
  );
  expectFinding(
    readClassFindings('sharedPaint', measured, { names: { [ORPHAN]: { readers: ['src/x.css'], family: 'x', owner: null } } }),
    'has a null owner and no ownerProposal field',
    'an unowned row states its proposal (or null while unrouted)',
  );
  expectFinding(readClassFindings('sharedPaint', measured, undefined), 'carries no `names` ledger', 'a missing ledger is red');
  expectFinding(
    readClassFindings('sharedPaint', { denominator: 0, debt: {}, prefixSites: 0 }, { names: {} }),
    'resolved to zero read names',
    'an empty corpus is never a pass',
  );
});

function withAuthoredReadFixture(selector, run) {
  const sandbox = mkdtempSync(join(tmpdir(), 'producer-selector-contract-'));
  const skin = join(sandbox, 'src/foundation/tokens/css/runtime/engines/modern/skin/probe/index.css');
  try {
    mkdirSync(join(skin, '..'), { recursive: true });
    writeFileSync(skin, `${selector} { --ds-fixture-read: #123456; }\n.ds-probe { color: var(--ds-fixture-read); }\n`);
    const files = collectModernSkinFiles(collectSkinFiles(sandbox));
    const producers = collectDeclaredChannels(files);
    run(classifyReadWithoutProducer(files, producers), producers);
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
}

test('FIXTURE CONTRACT: an authored root declaration reaches the Modern reader', (t) => {
  withAuthoredReadFixture(':root', (result, producers) => {
    t.diagnostic(JSON.stringify(result));
    assert.ok(producers.has('--ds-fixture-read'));
    assert.deepEqual(result.denominator, ['--ds-fixture-read']);
    assert.equal(result.produced, 1);
    assert.deepEqual(result.debt, []);
  });
});

test('FIXTURE CONTRACT: a disjoint sibling declaration gives the Modern reader no value', (t) => {
  withAuthoredReadFixture('.ds-unrelated', (result, producers) => {
    t.diagnostic(JSON.stringify(result));
    assert.ok(producers.has('--ds-fixture-read'), 'the declaration exists; only selector reach differs');
    assert.deepEqual(result.denominator, ['--ds-fixture-read']);
    assert.deepEqual(result.debt, ['--ds-fixture-read'], 'same-file ownership and name membership cannot prove selector reach');
    assert.equal(result.produced, 0);
  });
});


const READ_REACH_CASES = [
  ['root literal', ':root { --ds-semantic-read: red; }', true, true],
  ['matched literal', '.ds-probe { --ds-semantic-read: red; }', true, false],
  ['disjoint literal', '.ds-unrelated { --ds-semantic-read: red; }', false, false],
  ['broken root value', ':root { --ds-semantic-read: var(--ds-missing); }', false, false],
  ['root fallback value', ':root { --ds-semantic-read: var(--ds-missing, red); }', true, true],
  ['root dependency', ':root { --ds-leaf: red; --ds-semantic-read: var(--ds-leaf); }', true, true],
  ['later broken root', ':root { --ds-semantic-read: red; --ds-semantic-read: var(--ds-missing); }', false, false],
  ['root cycle', ':root { --ds-semantic-read: var(--ds-semantic-read, red); }', false, false],
];
for (const [label, css, cssExpected, inlineExpected] of READ_REACH_CASES) {
  test(`SEMANTIC CONTRACT: all read classes ${label}`, () => {
    const modernPath = 'src/foundation/tokens/css/runtime/engines/modern/skin/probe/index.css';
    const rootPath = 'src/foundation/tokens/css/foundation/base/probe/index.css';
    const fixture = Object.fromEntries([
      [rootPath, css],
      [modernPath, '.ds-probe { color: var(--ds-semantic-read); }'],
      [AGNOSTIC_SKIN, '.ds-probe { color: var(--ds-semantic-read); }'],
      [COMPONENT_TSX, "export const style = { color: 'var(--ds-semantic-read)' };"],
    ]);
    withSandbox(fixture, (sandbox) => {
      const producers = collectDeclaredChannels(collectAuthoredStylesheets(sandbox));
      const modern = classifyReadWithoutProducer(collectModernSkinFiles(collectSkinFiles(sandbox)), producers);
      const shared = classifyReadClass([join(sandbox, AGNOSTIC_SKIN)], 'css', producers);
      const inline = classifyReadClass(collectComponentInlineFiles(sandbox), 'script', producers);
      assert.equal(modern.debt.includes('--ds-semantic-read'), !cssExpected);
      assert.equal(Boolean(Reflect.get(shared.debt, '--ds-semantic-read')), !cssExpected);
      assert.equal(Boolean(Reflect.get(inline.debt, '--ds-semantic-read')), !inlineExpected);
      assert.deepEqual(shapeFailures(modern, producers).failures, []);
    });
  });
}

test('SEMANTIC CONTRACT: producer credit is checked at every selector site', () => {
  withSandbox(Object.fromEntries([
    [AGNOSTIC_SKIN, '.ds-probe { --ds-semantic-read: red; color: var(--ds-semantic-read); } .ds-unrelated { color: var(--ds-semantic-read); }'],
  ]), (sandbox) => {
    const files = collectSharedPaintFiles(sandbox);
    const producers = collectDeclaredChannels(files);
    const measured = classifyReadClass(files, 'css', producers);
    assert.deepEqual(Reflect.get(measured.debt, '--ds-semantic-read'), [AGNOSTIC_SKIN]);
  });
});

test('SEMANTIC CONTRACT: a frozen root declaration cannot produce Modern/shared/inline paint', () => {
  const frozenPath = 'src/foundation/tokens/css/runtime/engines/classic/skin/probe/index.css';
  const modernPath = 'src/foundation/tokens/css/runtime/engines/modern/skin/probe/index.css';
  withSandbox(Object.fromEntries([
    [frozenPath, ':root { --ds-semantic-read: red; }'],
    [modernPath, '.ds-probe { color: var(--ds-semantic-read); }'],
    [AGNOSTIC_SKIN, '.ds-probe { color: var(--ds-semantic-read); }'],
    [COMPONENT_TSX, "export const style = { color: 'var(--ds-semantic-read)' };"],
  ]), (sandbox) => {
    const producers = collectDeclaredChannels(collectAuthoredStylesheets(sandbox));
    assert.ok(producers.has('--ds-semantic-read'));
    assert.deepEqual(classifyReadWithoutProducer(collectModernSkinFiles(collectSkinFiles(sandbox)), producers).debt, ['--ds-semantic-read']);
    assert.deepEqual(Reflect.get(classifyReadClass(collectSharedPaintFiles(sandbox), 'css', producers).debt, '--ds-semantic-read'), [AGNOSTIC_SKIN]);
    assert.deepEqual(Reflect.get(classifyReadClass(collectComponentInlineFiles(sandbox), 'script', producers).debt, '--ds-semantic-read'), [COMPONENT_TSX]);
  });
});

test('SEMANTIC CONTRACT: name-only compiler/producer membership cannot supply a value', () => {
  withSandbox(Object.fromEntries([[AGNOSTIC_SKIN, '.ds-probe { color: var(--ds-semantic-read); }']]), (sandbox) => {
    const files = collectSharedPaintFiles(sandbox);
    assert.deepEqual(Reflect.get(classifyReadClass(files, 'css', new Set(['--ds-semantic-read'])).debt, '--ds-semantic-read'), [AGNOSTIC_SKIN]);
  });
});


test('SEMANTIC CONTRACT: unsupported CSS read sites remain in the denominator as unproven', () => {
  withSandbox(Object.fromEntries([
    [AGNOSTIC_SKIN, ':root { --ds-semantic-read: red; } @supports (color: var(--ds-semantic-read)) { .ds-probe { color: var(--ds-semantic-read); } }'],
  ]), (sandbox) => {
    const files = collectSharedPaintFiles(sandbox);
    const producers = collectDeclaredChannels(files);
    const measured = classifyReadClass(files, 'css', producers);
    assert.equal(measured.denominator, 1);
    assert.deepEqual(Reflect.get(measured.debt, '--ds-semantic-read'), [AGNOSTIC_SKIN]);
  });
});

test('SEMANTIC CONTRACT: actual authored collector excludes comment/generated/test producers', () => {
  const rootPath = 'src/foundation/tokens/css/foundation/base/probe/index.css';
  withSandbox(Object.fromEntries([
    [rootPath, '/* :root { --ds-comment-only: red; } */ .ds-unrelated { --ds-disjoint-only: red; } :root { --ds-broken-only: var(--ds-missing); --ds-real-only: red; }'],
    ['src/components/generated/probe/index.css', ':root { --ds-generated-only: red; }'],
    ['src/components/tests/probe/index.css', ':root { --ds-test-only: red; }'],
    [AGNOSTIC_SKIN, '.ds-probe { color: var(--ds-comment-only); background: var(--ds-generated-only); border-color: var(--ds-test-only); fill: var(--ds-disjoint-only); stroke: var(--ds-broken-only); outline-color: var(--ds-real-only); }'],
  ]), (sandbox) => {
    const producers = collectDeclaredChannels(collectAuthoredStylesheets(sandbox));
    assert.equal(producers.has('--ds-comment-only'), false);
    assert.equal(producers.has('--ds-generated-only'), false);
    assert.equal(producers.has('--ds-test-only'), false);
    assert.equal(producers.has('--ds-disjoint-only'), true);
    assert.equal(producers.has('--ds-broken-only'), true);
    const measured = classifyReadClass([join(sandbox, AGNOSTIC_SKIN)], 'css', producers);
    assert.deepEqual(Object.keys(measured.debt).sort(), ['--ds-broken-only', '--ds-comment-only', '--ds-disjoint-only', '--ds-generated-only', '--ds-test-only']);
  });
});


test('SEMANTIC CONTRACT: inline orphan/comment/interpolated/nonproductive controls retain their boundaries', () => {
  const cases = [
    ["export const style = { color: 'var(--ds-inline-orphan)' };", 1, 0, true],
    ['// var(--ds-inline-orphan)\n/* var(--ds-inline-orphan) */\nexport const style = {};', 0, 0, false],
    ['export const style = (key) => `var(--ds-inline-${key})`;', 0, 1, false],
  ];
  for (const [source, denominator, prefixes, debt] of cases) {
    withSandbox(Object.fromEntries([[COMPONENT_TSX, source]]), (sandbox) => {
      const measured = classifyReadClass(collectComponentInlineFiles(sandbox), 'script', collectDeclaredChannels(collectAuthoredStylesheets(sandbox)));
      assert.equal(measured.denominator, denominator);
      assert.equal(measured.prefixSites, prefixes);
      assert.equal(Boolean(Reflect.get(measured.debt, '--ds-inline-orphan')), debt);
    });
  }
  withSandbox(Object.fromEntries([
    ['src/components/primitives/display/probe/tests/index.test.tsx', "export const style = 'var(--ds-inline-orphan)';"],
    ['src/components/primitives/display/probe/engines/classic/index.tsx', "export const style = 'var(--ds-inline-orphan)';"],
  ]), (sandbox) => assert.deepEqual(collectComponentInlineFiles(sandbox), []));
});

test('SEMANTIC CONTRACT: a frozen reader stays out and its productive neighbor stays visible', () => {
  const frozen = 'src/foundation/tokens/css/runtime/engines/rustic/skin/probe/index.css';
  const productive = 'src/foundation/tokens/css/foundation/probe/index.css';
  withSandbox(Object.fromEntries([
    [frozen, '.ds-probe { color: var(--ds-frozen-only); }'],
    [productive, ':root { --other: var(--ds-productive-only); }'],
  ]), (sandbox) => {
    const files = collectSharedPaintFiles(sandbox);
    const measured = classifyReadClass(files, 'css', collectDeclaredChannels(collectAuthoredStylesheets(sandbox)));
    assert.deepEqual(Object.keys(measured.debt), ['--ds-productive-only']);
    assert.deepEqual(Reflect.get(measured.debt, '--ds-productive-only'), [productive]);
  });
});


const ADVERSARIAL_READ_CASES = [
  ['separate indirect cycle recovers', ':root { --ds-a: var(--ds-b); --ds-b: var(--ds-a); --ds-semantic-read: var(--ds-a, red); }', true],
  ['unselected cyclic fallback does not poison consumer', ':root { --ds-leaf: red; --ds-loop: var(--ds-loop); --ds-semantic-read: var(--ds-leaf, var(--ds-loop)); }', true],
  ['cycle without fallback remains invalid', ':root { --ds-loop: var(--ds-loop); --ds-semantic-read: var(--ds-loop); }', false],
  ['fallback references preserve cycle refusal', ':root { --ds-leaf: red; --ds-semantic-read: var(--ds-leaf, var(--ds-semantic-read)); }', false],
  ['possible media invalidation survives empty reader conditions', ':root { --ds-semantic-read: red; } @media print { :root { --ds-semantic-read: var(--missing); } }', false],
  ['possible supports invalidation survives empty reader conditions', ':root { --ds-semantic-read: red; } @supports (display: grid) { :root { --ds-semantic-read: var(--missing); } }', false],
  ['possible conditional values all resolve', ':root { --ds-semantic-read: red; } @media print { :root { --ds-semantic-read: blue; } }', true],
  ['anonymous important invalid beats unlayered important valid', '@layer { :root { --ds-semantic-read: var(--missing) !important; } } :root { --ds-semantic-read: red !important; }', false],
  ['anonymous important valid beats unlayered important invalid', '@layer { :root { --ds-semantic-read: red !important; } } :root { --ds-semantic-read: var(--missing) !important; }', true],
  ['earlier anonymous important winner stays valid', '@layer { :root { --ds-semantic-read: red !important; } } @layer { :root { --ds-semantic-read: var(--missing) !important; } }', true],
  ['separate anonymous important layers keep first invalid winner', '@layer { :root { --ds-semantic-read: var(--missing) !important; } } @layer { :root { --ds-semantic-read: red !important; } }', false],
  ['named layer order stays unresolved', '@layer alpha { :root { --ds-semantic-read: red; } } @layer beta { :root { --ds-semantic-read: var(--missing); } }', false],
];
for (const [label, css, expected] of ADVERSARIAL_READ_CASES) {
  test(`ADVERSARIAL CONTRACT: all read classes ${label}`, () => {
    const root = 'src/foundation/tokens/css/foundation/base/probe/index.css';
    const modern = 'src/foundation/tokens/css/runtime/engines/modern/skin/probe/index.css';
    const paint = '.ds-probe { color: var(--ds-semantic-read); }';
    withSandbox(Object.fromEntries([
      [root, css], [modern, paint], [AGNOSTIC_SKIN, paint],
      [COMPONENT_TSX, "export const style = { color: 'var(--ds-semantic-read)' };"]
    ]), (sandbox) => {
      const producers = collectDeclaredChannels(collectAuthoredStylesheets(sandbox));
      const skin = classifyReadWithoutProducer(collectModernSkinFiles(collectSkinFiles(sandbox)), producers);
      const shared = classifyReadClass([join(sandbox, AGNOSTIC_SKIN)], 'css', producers);
      const inline = classifyReadClass(collectComponentInlineFiles(sandbox), 'script', producers);
      assert.equal(skin.debt.includes('--ds-semantic-read'), !expected);
      assert.equal(Reflect.has(shared.debt, '--ds-semantic-read'), !expected);
      assert.equal(Reflect.has(inline.debt, '--ds-semantic-read'), !expected);
    });
  });
}

const CONTENDER_LAYOUTS = ['conditional', 'cross-file', 'named-layer'];
const CONTENDER_VALUES = [
  ['cycle participant', 'var(--ds-semantic-read)', 'var(--branch, red)', false],
  ['separate cycle recovery', 'var(--branch)', 'var(--branch, red)', true],
  ['all valid alternatives', 'green', 'var(--branch, red)', true],
  ['fallback cycle participant', 'var(--valid, var(--ds-semantic-read))', 'var(--branch, red)', false],
  ['primary bypass of separate cycle', 'var(--branch)', 'var(--valid, var(--branch))', true],
];
for (const layout of CONTENDER_LAYOUTS) {
  for (const [label, value, terminal, expected] of CONTENDER_VALUES) {
    test(`CONTENDER CONTRACT: all read classes ${layout} ${label}`, () => {
      const base = 'src/foundation/tokens/css/foundation/base/a/index.css';
      const other = 'src/foundation/tokens/css/foundation/base/z/index.css';
      const modern = 'src/foundation/tokens/css/runtime/engines/modern/skin/probe/index.css';
      const root = `:root { --ds-semantic-read: ${terminal}; --valid: blue; }`;
      const first = ':root { --branch: blue; }';
      const later = `:root { --branch: ${value}; }`;
      const css = layout === 'named-layer'
        ? `${root} @layer alpha { ${first} } @layer beta { ${later} }`
        : `${root} ${first} ${layout === 'conditional' ? `@media print { ${later} }` : ''}`;
      const paint = '.ds-probe { color: var(--ds-semantic-read); }';
      withSandbox(Object.fromEntries([
        [base, css], [other, layout === 'cross-file' ? later : ''],
        [modern, paint], [AGNOSTIC_SKIN, paint],
        [COMPONENT_TSX, "export const style = { color: 'var(--ds-semantic-read)' };"],
      ]), (sandbox) => {
        const producers = collectDeclaredChannels(collectAuthoredStylesheets(sandbox));
        const skin = classifyReadWithoutProducer(collectModernSkinFiles(collectSkinFiles(sandbox)), producers);
        const shared = classifyReadClass([join(sandbox, AGNOSTIC_SKIN)], 'css', producers);
        const inline = classifyReadClass(collectComponentInlineFiles(sandbox), 'script', producers);
        assert.equal(skin.debt.includes('--ds-semantic-read'), !expected);
        assert.equal(Reflect.has(shared.debt, '--ds-semantic-read'), !expected);
        assert.equal(Reflect.has(inline.debt, '--ds-semantic-read'), !expected);
        assert.deepEqual(shapeFailures(skin, producers).failures, []);
      });
    });
  }
}
