/**
 * @fileoverview The drill for decision 19's gate.
 *
 * The gate exists to prove a fix, so the drill holds the two cases the owner
 * actually ruled on -- FROZEN, as fixtures -- and watches the judgement fire on
 * them. If the tree is ever "fixed" by weakening the rule instead of the source,
 * drills 1 and 2 go red.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { analyse, measure, readRootAliases, restatesRootAlias, selfCancelling } from './index.mjs';

const DIALS = new Set(['--ds-effect-intensity', '--ds-type-scale']);

test('drill 1 [before]: the base carries the factor and bithire freezes the product -- glass-blur', () => {
  const base = { '--ds-glass-blur': ['calc(12px * var(--ds-effect-intensity))'] };
  const artifacts = { rottay: {}, bithire: { '--ds-glass-blur': ['12px'] }, evnto: {} };
  const findings = analyse(base, artifacts, DIALS);
  assert.equal(findings.length, 1, 'exactly the frozen vertical is named');
  assert.deepEqual(
    { v: findings[0].vertical, c: findings[0].channel, d: findings[0].dial },
    { v: 'bithire', c: '--ds-glass-blur', d: '--ds-effect-intensity' }
  );
  assert.ok(findings[0].dialCarriedBy.includes('base'), 'and the counterfactual is cited');
});

test('drill 2 [before]: the PEER carries the factor, not the base -- input-md-font-size', () => {
  /* The base component layer writes a raw rem, which carries no scale at all
   * (the scale lives at each `--ds-font-size-*` definition site). Only rottay's
   * reference reaches the dial. A gate that read the base alone would see
   * nothing here -- and this is the case the owner ruled on. */
  const base = {
    '--ds-input-md-font-size': ['0.875rem'],
    '--ds-font-size-sm': ['calc(var(--ds-font-size-sm-base) * var(--ds-type-scale, 1))'],
  };
  const artifacts = {
    rottay: { '--ds-input-md-font-size': ['var(--ds-font-size-sm)'] },
    bithire: { '--ds-input-md-font-size': ['13px'] },
    evnto: {},
  };
  const findings = analyse(base, artifacts, DIALS);
  assert.equal(findings.length, 1, 'bithire only: evnto declares nothing, so it freezes nothing');
  assert.equal(findings[0].vertical, 'bithire');
  assert.deepEqual(findings[0].dialCarriedBy, ['rottay'], 'the peer is the counterfactual, not the base');
});

test('drill 3: a SEED is not an anti-door -- the law protects it by name', () => {
  const base = { '--ds-badge-error-bg': ['#EF4444'] };
  const artifacts = { rottay: { '--ds-badge-error-bg': ['#DC2626'] }, bithire: {}, evnto: {} };
  assert.deepEqual(analyse(base, artifacts, DIALS), [], 'no dial multiplies it, so nothing was frozen');
});

test('drill 4: expressing the seed CAUSALLY clears the finding -- the shape the fix must take', () => {
  const base = { '--ds-input-md-font-size': ['0.875rem'] };
  const artifacts = {
    rottay: {},
    bithire: { '--ds-input-md-font-size': ['calc(13px * var(--ds-type-scale, 1))'] },
    evnto: {},
  };
  assert.deepEqual(analyse(base, artifacts, DIALS), [], 'own seed kept, dial restored');
});

test('drill 5 [after]: neither ruled case survives in the real tree', () => {
  const { findings } = measure();
  const ruled = [
    { vertical: 'bithire', channel: '--ds-glass-blur', dial: '--ds-effect-intensity' },
    { vertical: 'bithire', channel: '--ds-input-md-font-size', dial: '--ds-type-scale' },
  ];
  for (const r of ruled) {
    const hit = findings.find((f) => f.vertical === r.vertical && f.channel === r.channel && f.dial === r.dial);
    assert.equal(hit, undefined, `${r.channel} still freezes ${r.dial} on ${r.vertical}`);
  }
});

test('drill 6: the inventory is decrease-only and the exception list is the owner’s alone', async () => {
  const { readFileSync } = await import('node:fs');
  const { dirname, join } = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const here = dirname(fileURLToPath(import.meta.url));
  const inventory = JSON.parse(readFileSync(join(here, 'inventory/index.json'), 'utf8'));
  const { findings } = measure();
  const key = (f) => `${f.vertical}|${f.channel}|${f.dial}`;
  const reproduced = new Set(findings.map(key));
  for (const entry of inventory.pending) {
    assert.ok(reproduced.has(key(entry)), `${key(entry)} no longer reproduces: retire it, do not keep it`);
  }
  /* La ley del inventario: `exceptions` solo cambia por ruling de owner documentado.
   * Se pinea la lista EXACTA, no su tamaño, para que agregar una segunda excepcion
   * sin ruling sea rojo. Hoy hay una, escrita por el owner en la decision 20. */
  assert.equal(inventory.exceptions.length, 1, 'exactamente una excepcion del owner');
  const [granted] = inventory.exceptions;
  assert.deepEqual(
    { v: granted.vertical, c: granted.channel, d: granted.dial, by: granted.grantedBy, r: granted.ruling },
    { v: 'bithire', c: '--ds-badge-radius', d: '--ds-radius-scale', by: 'owner', r: 'decision-20' }
  );
  const listed = new Set([...inventory.pending, ...inventory.exceptions].map(key));
  for (const f of findings) assert.ok(listed.has(key(f)), `${key(f)} is unlisted -- the gate must fail, not the drill`);
});

test('drill 7 [prueba negativa de la excepcion]: un pill no escala, y por eso queda fuera', () => {
  /* La excepcion del owner (decision 20) dice que --ds-badge-radius se queda en
   * var(--ds-radius-full). Esta prueba lo sostiene por el lado que importa: aunque
   * shape.radius-scale se mueva, el canal sigue resolviendo al centinela pill, y el
   * gate NO lo reporta como anti-puerta. Si alguien "corrigiera" el badge a
   * calc(9999px * var(--ds-radius-scale)) creyendo cerrar un pendiente, la primera
   * mitad de este drill se cae. */
  const base = {
    '--ds-radius-full': ['9999px'],
    '--ds-radius-md': ['calc(var(--ds-radius-md-base) * var(--ds-radius-scale, 1))'],
    '--ds-radius-md-base': ['8px'],
    '--ds-badge-radius': ['var(--ds-radius-full)'],
  };
  const artifacts = {
    rottay: { '--ds-badge-radius': ['var(--ds-radius-md)'] },
    bithire: { '--ds-badge-radius': ['var(--ds-radius-full)'] },
    evnto: {},
  };
  const dials = new Set(['--ds-radius-scale']);

  // El canal del pill no lleva el factor -- por diseño, y con el dial movido sigue sin llevarlo.
  assert.equal(base['--ds-badge-radius'][0], 'var(--ds-radius-full)');
  assert.ok(!base['--ds-radius-full'][0].includes('--ds-radius-scale'), 'el pill es un centinela, no una geometria');

  // El gate SI lo ve (por eso hizo falta una excepcion y no un silencio)...
  const findings = analyse(base, artifacts, dials);
  const hit = findings.find((f) => f.vertical === 'bithire' && f.channel === '--ds-badge-radius');
  assert.ok(hit, 'el gate lo detecta: la excepcion es visible, no una regla debilitada');

  // ...y el dial conserva autoridad donde SI hay geometria real.
  assert.ok(base['--ds-radius-md'][0].includes('--ds-radius-scale'), 'radius-scale gobierna los radios con geometria');
});

test('drill 8 [F-07]: a calc() that divides and multiplies by the same dial is refused', () => {
  /* The exact string the Standard geometry control shipped as, across all three
   * verticals: the dial is textually present inside the calc(), which is what
   * the reachability rule reads, and the product is 9px at every dial position.
   * Presence is not causality, and this clause is the difference. */
  const dials = new Set(['--ds-radius-scale']);
  const cancelled = selfCancelling(
    {
      bithire: {
        '--ds-button-md-radius': [
          'calc(9px / var(--ds-radius-scale) * var(--ds-radius-scale, 1))',
        ],
      },
    },
    dials
  );
  assert.equal(cancelled.length, 1, 'the self-cancelling product is named');
  assert.deepEqual(
    { c: cancelled[0].channel, d: cancelled[0].dial, s: cancelled[0].scope },
    { c: '--ds-button-md-radius', d: '--ds-radius-scale', s: 'bithire' }
  );
});

test('drill 9 [F-07]: normalizing against a LITERAL baseline is not a cancellation', () => {
  /* The shape the fix takes. The divisor is the vertical's own dial position, a
   * compile-time constant, so the corner still moves with the tenant's dial. A
   * clause that flagged every `/` beside a `*` would forbid the repair. */
  const dials = new Set(['--ds-radius-scale']);
  assert.deepEqual(
    selfCancelling(
      { bithire: { '--ds-button-md-radius': ['calc(9px / 1.25 * var(--ds-radius-scale, 1))'] } },
      dials
    ),
    []
  );
});

test('drill 10 [F-07]: the real tree carries no self-cancelling dial', () => {
  const { cancellations } = measure();
  assert.deepEqual(cancellations, [], 'a dial that cancels itself is present and inert');
});

/* The scope re-resolution alias law: an artifact restates a root alias with its
 * root text so the alias resolves again in the vertical scope. */

const CONSOLE_BG = '--ds-command-home-console-bg';
const OVERLAY = '--ds-workspace-shell-overlay';
const TEXTURE = '--ds-material-canvas-texture';
const CONSOLE_BG_ROW =
  'repeating-linear-gradient(90deg, var(--ds-command-home-grid-line) 0 1px, transparent 1px 30px), ' +
  'var(--ds-workspace-shell-overlay, transparent), var(--ds-surface-card-bg)';
const OVERLAY_ROW = 'var(--ds-material-canvas-texture, transparent)';
const TEXTURE_SEED =
  'repeating-linear-gradient(0deg, color-mix(in srgb, var(--ds-color-text-primary) calc(2% * var(--ds-effect-intensity, 1)), transparent) 0 1px, transparent 1px 3px)';
const ALIAS_DIALS = new Set(['--ds-effect-intensity']);
const ALIAS_TABLE = new Map([[CONSOLE_BG, CONSOLE_BG_ROW]]);
const named = (findings) => findings.map((f) => `${f.vertical}|${f.channel}|${f.dial}`);

function restatedTree(row = CONSOLE_BG_ROW) {
  return {
    base: { [OVERLAY]: [OVERLAY_ROW] },
    artifacts: {
      rottay: { [CONSOLE_BG]: [row] },
      bithire: { [CONSOLE_BG]: [row], [OVERLAY]: [OVERLAY_ROW], [TEXTURE]: [TEXTURE_SEED] },
      evnto: { [CONSOLE_BG]: [row] },
    },
  };
}

test('drill 11 [alias law]: a root alias restated with its root text is not vertical-authored', () => {
  const { base, artifacts } = restatedTree();
  assert.deepEqual(
    named(analyse(base, artifacts, ALIAS_DIALS)),
    [`evnto|${CONSOLE_BG}|--ds-effect-intensity`, `rottay|${CONSOLE_BG}|--ds-effect-intensity`],
    'without the table the restatement reads as a freeze: the false positive, reproduced'
  );
  assert.deepEqual(analyse(base, artifacts, ALIAS_DIALS, ALIAS_TABLE), [], 'with the table nothing was frozen');

  const liveTable = readRootAliases();
  const liveRow = liveTable.get(CONSOLE_BG);
  assert.ok(liveRow?.includes(`var(${OVERLAY}`), 'the live row reads the overlay link');
  const live = restatedTree(liveRow);
  assert.deepEqual(analyse(live.base, live.artifacts, ALIAS_DIALS, liveTable), [], 'the live table admits this tree');
  assert.deepEqual(
    named(analyse(live.base, live.artifacts, ALIAS_DIALS)),
    [`evnto|${CONSOLE_BG}|--ds-effect-intensity`, `rottay|${CONSOLE_BG}|--ds-effect-intensity`],
    'and with no table passed nothing is admitted: the default is the empty table, never the live one'
  );
  assert.deepEqual(
    analyse(live.base, live.artifacts, ALIAS_DIALS),
    analyse(live.base, live.artifacts, ALIAS_DIALS, new Map())
  );
});

test('drill 12 [alias law]: a vertical that genuinely drops the factor stays red, table or not', () => {
  const dropped = restatedTree();
  dropped.artifacts.evnto[CONSOLE_BG] = [CONSOLE_BG_ROW.replace('var(--ds-workspace-shell-overlay, transparent)', 'transparent')];
  assert.deepEqual(named(analyse(dropped.base, dropped.artifacts, ALIAS_DIALS, ALIAS_TABLE)), [
    `evnto|${CONSOLE_BG}|--ds-effect-intensity`,
  ]);

  const twice = restatedTree();
  twice.artifacts.evnto[CONSOLE_BG] = [CONSOLE_BG_ROW, 'var(--ds-surface-card-bg)'];
  assert.deepEqual(
    named(analyse(twice.base, twice.artifacts, ALIAS_DIALS, ALIAS_TABLE)),
    [`evnto|${CONSOLE_BG}|--ds-effect-intensity`],
    'one authored text beside the restatement is still authored'
  );

  /* The base carries the factor through a link; the vertical restates the alias
   * and freezes the LINK. The alias is skipped and the frozen link is named. */
  const base = { [CONSOLE_BG]: [CONSOLE_BG_ROW], [OVERLAY]: [OVERLAY_ROW], [TEXTURE]: [TEXTURE_SEED] };
  const artifacts = {
    rottay: {},
    bithire: {},
    evnto: { [CONSOLE_BG]: [CONSOLE_BG_ROW], [OVERLAY]: ['none'] },
  };
  const table = new Map([[CONSOLE_BG, CONSOLE_BG_ROW], [OVERLAY, OVERLAY_ROW]]);
  const findings = analyse(base, artifacts, ALIAS_DIALS, table);
  assert.deepEqual(named(findings), [`evnto|${OVERLAY}|--ds-effect-intensity`]);
  assert.deepEqual(findings[0].dialCarriedBy, ['base', 'rottay', 'bithire']);
});

test('drill 13 [alias law]: a literal row launders nothing', () => {
  /* Drill 1 again, with a table whose row is the frozen literal itself. */
  const blurBase = { '--ds-glass-blur': ['calc(12px * var(--ds-effect-intensity))'] };
  const blurArtifacts = { rottay: {}, bithire: { '--ds-glass-blur': ['12px'] }, evnto: {} };
  assert.deepEqual(
    named(analyse(blurBase, blurArtifacts, DIALS, new Map([['--ds-glass-blur', '12px']]))),
    ['bithire|--ds-glass-blur|--ds-effect-intensity']
  );

  /* Drill 2 again: the base text IS a literal and the vertical restates it. */
  const sizeBase = {
    '--ds-input-md-font-size': ['0.875rem'],
    '--ds-font-size-sm': ['calc(var(--ds-font-size-sm-base) * var(--ds-type-scale, 1))'],
  };
  const sizeArtifacts = {
    rottay: { '--ds-input-md-font-size': ['var(--ds-font-size-sm)'] },
    bithire: { '--ds-input-md-font-size': ['0.875rem'] },
    evnto: {},
  };
  assert.deepEqual(
    named(analyse(sizeBase, sizeArtifacts, DIALS, new Map([['--ds-input-md-font-size', '0.875rem']]))),
    ['bithire|--ds-input-md-font-size|--ds-type-scale']
  );
  for (const literal of ['12px', '0.875rem', 'none', 'calc(12px * 1)', 'var(12px)']) {
    assert.ok(!restatesRootAlias('--x', [literal], {}, new Map([['--x', literal]])), `${literal} reads no channel`);
  }
});

test('drill 14 [alias law]: a restatement that shadows another base text is judged as authored', () => {
  /* The row is non-literal and the vertical text equals it, but the base also
   * states the channel WITH the factor: restating the row there drops it. */
  const row = 'var(--ds-blur-seed)';
  const base = { '--ds-glass-blur': [row, 'calc(12px * var(--ds-effect-intensity))'], '--ds-blur-seed': ['12px'] };
  const artifacts = { rottay: {}, bithire: { '--ds-glass-blur': [row] }, evnto: {} };
  assert.deepEqual(named(analyse(base, artifacts, DIALS, new Map([['--ds-glass-blur', row]]))), [
    'bithire|--ds-glass-blur|--ds-effect-intensity',
  ]);
  assert.ok(restatesRootAlias('--ds-glass-blur', [row], { '--ds-glass-blur': [row] }, new Map([['--ds-glass-blur', row]])));
  assert.ok(!restatesRootAlias('--ds-glass-blur', [row], {}, new Map()), 'no row, no admission');
  assert.ok(!restatesRootAlias('--ds-glass-blur', [row], {}, new Map([['--ds-glass-blur-2', row]])), 'another name’s row');
});

test('drill 15 [alias law]: the live table is read, and the real restatements pass by form', async () => {
  const { mkdtempSync, readFileSync, rmSync, writeFileSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { dirname, join } = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const table = readRootAliases();
  assert.ok(table.size > 1000, `the generated table was read: ${table.size} rows`);
  const row = table.get(CONSOLE_BG);
  assert.ok(row && /var\(\s*--/.test(row), 'the reviewed alias is tabled and non-literal');
  const artifactsDir = join(
    dirname(fileURLToPath(import.meta.url)),
    '../../../../../src/foundation/tokens/css/facade/artifacts'
  );
  for (const vertical of ['rottay', 'bithire', 'evnto']) {
    const css = readFileSync(join(artifactsDir, vertical, 'index.css'), 'utf8');
    const declared = css.split('\n').filter((line) => line.trim().startsWith(`${CONSOLE_BG}:`));
    assert.ok(declared.length > 0, `${vertical} restates ${CONSOLE_BG}`);
    for (const line of declared) {
      assert.equal(line.trim(), `${CONSOLE_BG}: ${row};`, `${vertical} restates the root text byte-equal`);
    }
  }
  assert.deepEqual(
    measure().findings.filter((f) => f.channel === CONSOLE_BG),
    [],
    'and the live tree no longer names the restatement'
  );

  assert.equal(readRootAliases(join(tmpdir(), 'dial-authority-no-such-table.ts')).size, 0);
  const directory = mkdtempSync(join(tmpdir(), 'dial-authority-alias-'));
  try {
    const head = 'export const ROOT_ALIASES: readonly (readonly [name: string, value: string])[] = [\n';
    const good = join(directory, 'good.ts');
    writeFileSync(good, `${head}  ["--x", "var(--y)"],\n];\n`);
    assert.equal(readRootAliases(good).get('--x'), 'var(--y)');
    const duplicated = join(directory, 'duplicated.ts');
    writeFileSync(duplicated, `${head}  ["--x", "var(--y)"],\n  ["--x", "12px"],\n];\n`);
    assert.equal(readRootAliases(duplicated).size, 0, 'two texts for one name admit nothing');
    const broken = join(directory, 'broken.ts');
    writeFileSync(broken, `${head}  ["--x", "var(--y)"],\n  ["--z", unquoted],\n];\n`);
    assert.equal(readRootAliases(broken).size, 0, 'a row that does not parse admits nothing');
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
