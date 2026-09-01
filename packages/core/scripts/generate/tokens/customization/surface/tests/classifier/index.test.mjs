/**
 * Drills for the contextual TS literal classifier (C2c blocker: reads ≠
 * writers ≠ metadata). Each case pins exactly one classification law with a
 * synthetic source file — the classifier, not a grep, decides.
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import { classifyTsLiterals } from '../../index.mjs';

const PROD = '/repo/src/components/thing/index.ts';
const EMITTER = '/repo/src/infrastructure/compilers/kernel/runtime/x/index.ts';

test('a registry/allowlist literal is METADATA — it cannot keep a writer alive', () => {
  const { reads, writes, metadata } = classifyTsLiterals(
    `export const ALLOWLIST = ['--ds-color-primary', '--ds-color-accent'];`,
    PROD
  );
  assert.equal(reads.size, 0);
  assert.equal(writes.size, 0);
  assert.equal(metadata.get('--ds-color-primary'), 1);
});

test('getPropertyValue IS a read', () => {
  const { reads, metadata } = classifyTsLiterals(
    `const v = getComputedStyle(el).getPropertyValue('--ds-type-scale');`,
    PROD
  );
  assert.equal(reads.get('--ds-type-scale'), 1);
  assert.equal(metadata.size, 0);
});

test('a var() payload in TS IS a read', () => {
  const { reads } = classifyTsLiterals(
    `const style = { background: 'var(--ds-color-bg, #fff)' };`,
    PROD
  );
  assert.equal(reads.get('--ds-color-bg'), 1);
});

test('setProperty IS a write, never a read', () => {
  const { reads, writes } = classifyTsLiterals(
    `el.style.setProperty('--ds-motion-scale', '0.5');`,
    PROD
  );
  assert.equal(writes.get('--ds-motion-scale'), 1);
  assert.equal(reads.size, 0);
});

test('an emission-map KEY in a compiler module IS a write; the same map in product code is metadata', () => {
  const source = `export const MAP = { '--ds-card-bg': value };`;
  const compiler = classifyTsLiterals(source, EMITTER);
  assert.equal(compiler.writes.get('--ds-card-bg'), 1);
  const product = classifyTsLiterals(source, PROD);
  assert.equal(product.writes.size, 0);
  assert.equal(product.metadata.get('--ds-card-bg'), 1);
});

test('comments and docs never count anywhere', () => {
  const { reads, writes, metadata } = classifyTsLiterals(
    `// uses --ds-ghost-token for nothing\n/** and --ds-ghost-token again */\nexport const x = 1;`,
    PROD
  );
  assert.equal(reads.size + writes.size + metadata.size, 0);
});

test('writer and reader of the SAME name stay independent properties', () => {
  const { reads, writes } = classifyTsLiterals(
    `el.style.setProperty('--ds-x-bg', v); const s = 'var(--ds-x-bg)';`,
    PROD
  );
  assert.equal(writes.get('--ds-x-bg'), 1);
  assert.equal(reads.get('--ds-x-bg'), 1);
});

test("element-access assignment style['--ds-x'] = v IS a write", () => {
  const { writes, reads } = classifyTsLiterals(
    `el.style['--ds-panel-bg'] = value;`,
    PROD
  );
  assert.equal(writes.get('--ds-panel-bg'), 1);
  assert.equal(reads.size, 0);
});

test("element-access READ style['--ds-x'] outside an assignment LHS is a read", () => {
  const { reads, writes } = classifyTsLiterals(
    `const v = el.style['--ds-panel-bg'];`,
    PROD
  );
  assert.equal(reads.get('--ds-panel-bg'), 1);
  assert.equal(writes.size, 0);
});

test('var( with whitespace still counts as a read', () => {
  const { reads } = classifyTsLiterals(
    `const s = 'var(  --ds-gap , 4px)';`,
    PROD
  );
  assert.equal(reads.get('--ds-gap'), 1);
});

test('template literal payloads classify like strings', () => {
  const { reads } = classifyTsLiterals(
    'const s = `var(--ds-a) ${x} var( --ds-b)`;',
    PROD
  );
  assert.equal(reads.get('--ds-a'), 1);
  assert.equal(reads.get('--ds-b'), 1);
});

test('an UNREGISTERED helper call is metadata, never a read (declarative registry)', () => {
  const { reads, metadata } = classifyTsLiterals(
    `mysteryHelper('--ds-x-bg');`,
    PROD
  );
  assert.equal(reads.size, 0);
  assert.equal(metadata.get('--ds-x-bg'), 1);
});

/* ── PRE-P0 ítem 1: la puerta gobernada del inventario dead-writers ──────── */

const deadBaseline = (names, over = {}) => ({ schemaVersion: 1, note: 'fixture', names, ...over });

test('DEAD — un nombre NUEVO falla, y manda cablearlo o retirarlo, no ampliar el ancla', async () => {
  const { evaluateDeadBaseline } = await import('../../index.mjs');
  const failures = evaluateDeadBaseline(['--ds-a', '--ds-nuevo'], deadBaseline(['--ds-a']));
  assert.equal(failures.length, 1);
  assert.match(failures[0], /1 NEW dead writer\(s\): --ds-nuevo/);
  assert.match(failures[0], /se les da consumidor o se dejan de emitir, no se amplia el ancla/);
  assert.match(failures[0], /--widen --reason/);
});

test('DEAD — un nombre que SALE tambien falla: una victoria en silencio deja el ancla mintiendo', async () => {
  const { evaluateDeadBaseline } = await import('../../index.mjs');
  /* Antes el check solo miraba hacia arriba. Un writer que consigue consumidor
   * salia de la lista viva y el ancla seguia declarandolo deuda: el numero
   * miente HACIA ARRIBA y nadie se entera. */
  const failures = evaluateDeadBaseline(['--ds-a'], deadBaseline(['--ds-a', '--ds-se-fue']));
  assert.equal(failures.length, 1);
  assert.match(failures[0], /1 nombre\(s\) dejaron de ser dead-writer: --ds-se-fue/);
  assert.match(failures[0], /es una victoria, y se registra/);
  assert.match(failures[0], /MISMO commit/);
});

test('DEAD — los dos movimientos a la vez se ven los DOS, no uno', async () => {
  const { evaluateDeadBaseline } = await import('../../index.mjs');
  const failures = evaluateDeadBaseline(['--ds-a', '--ds-nuevo'], deadBaseline(['--ds-a', '--ds-se-fue']));
  assert.equal(failures.length, 2);
  assert.ok(failures.some((f) => /NEW dead writer/.test(f)));
  assert.ok(failures.some((f) => /dejaron de ser dead-writer/.test(f)));
});

test('DEAD — baseline ausente, sin `names`, o de otra version: FALLA CERRADO', async () => {
  const { evaluateDeadBaseline, DEAD_BASELINE_SCHEMA_VERSION } = await import('../../index.mjs');
  assert.deepEqual(evaluateDeadBaseline([], null), ['dead: el baseline no existe o no tiene `names`']);
  assert.deepEqual(evaluateDeadBaseline([], {}), ['dead: el baseline no existe o no tiene `names`']);
  assert.deepEqual(evaluateDeadBaseline([], { schemaVersion: 1, names: 'x' }), ['dead: el baseline no existe o no tiene `names`']);
  for (const bad of [undefined, null, 999, '1', 0]) {
    const failures = evaluateDeadBaseline([], { schemaVersion: bad, names: [] });
    assert.equal(failures.length, 1, `schemaVersion ${JSON.stringify(bad)} paso en silencio`);
    assert.match(failures[0], /y este censo lee la version 1/);
  }
  assert.equal(DEAD_BASELINE_SCHEMA_VERSION, 1);
  assert.deepEqual(evaluateDeadBaseline(['--ds-a'], deadBaseline(['--ds-a'])), []);
});

test('DEAD/PUERTA — sin razon no escribe; ampliar exige --widen; bajar no', async () => {
  const { buildDeadBaselineDoc } = await import('../../index.mjs');
  const previous = deadBaseline(['--ds-a', '--ds-se-fue']);
  assert.throws(() => buildDeadBaselineDoc({ live: [], previous, reason: '' }), /exige --reason/);
  assert.throws(() => buildDeadBaselineDoc({ live: ['--ds-a', '--ds-nuevo'], previous, reason: 'porque si' }),
    (error) => /me niego a AMPLIAR el inventario de dead-writers en 1 nombre/.test(error.message)
      && /--ds-nuevo/.test(error.message)
      && /Un writer sin consumidor se cablea o se retira/.test(error.message));
  // Bajar no necesita bandera, pero SI razon, y queda registrado como tal.
  const bajada = buildDeadBaselineDoc({ live: ['--ds-a'], previous, reason: 'el writer consiguio consumidor' });
  assert.deepEqual(bajada.names, ['--ds-a']);
  assert.equal(bajada.lastMove, 'el writer consiguio consumidor');
  assert.match(bajada.lastMoveKind, /^decrece-solo: -1 nombre/);
  assert.equal(bajada.schemaVersion, 1);
  // Con la puerta pedida por nombre, la ampliacion se registra COMO ampliacion.
  const subida = buildDeadBaselineDoc({ live: ['--ds-a', '--ds-nuevo'], previous, reason: 'apertura autorizada', widen: true });
  assert.match(subida.lastMoveKind, /ampliacion autorizada por nombre \(--widen\): \+1 nombre\(s\), -1/);
  assert.doesNotMatch(subida.lastMoveKind, /^decrece-solo/, 'lastMoveKind no puede llamar limpieza a una ampliacion');
});

/* ── PRE-P0 ítem 2: el escudo frontier se DERIVA del registro ────────────── */

const FAMILIES = [
  { capability: 'palette.status-seeds', prefixPattern: '--ds-tint-{estado}-{paso}',
    prefixes: ['--ds-tint-success-', '--ds-tint-error-'], source: 'fixture' },
  { capability: 'otra.capacidad', prefixPattern: '--ds-otra-{x}', prefixes: ['--ds-otra-'], source: 'fixture' },
];

test('ESCUDO — solo escuda mientras la capacidad sea frontier', async () => {
  const { buildFrontierShield } = await import('../../index.mjs');
  const rows = [{ id: 'palette.status-seeds', status: 'frontier' }, { id: 'otra.capacidad', status: 'frontier' }];
  const shield = buildFrontierShield(FAMILIES, rows);
  assert.equal(shield.shielded.length, 2);
  assert.equal(shield.covers('--ds-tint-success-8'), true);
  assert.equal(shield.covers('--ds-otra-1'), true);
  assert.equal(shield.covers('--ds-color-primary'), false);
});

test('ESCUDO — flipear la fila a ACTIVE quita el escudo SOLO de esa familia', async () => {
  const { buildFrontierShield } = await import('../../index.mjs');
  /* El drill que pide el lote. Antes el escudo era una lista de prefijos escrita
   * a mano: el dia que la capacidad se abra, seguiria escudando canales de una
   * capacidad ACTIVA -- el censo diria "reservado para una frontera" de algo que
   * ya no lo es, y esos writers quedarian invisibles en vez de contarse. */
  const rows = [{ id: 'palette.status-seeds', status: 'active' }, { id: 'otra.capacidad', status: 'frontier' }];
  const shield = buildFrontierShield(FAMILIES, rows);
  assert.deepEqual(shield.shielded.map((f) => f.capability), ['otra.capacidad'], 'solo la que sigue siendo frontera');
  assert.equal(shield.covers('--ds-tint-success-8'), false, 'la capacidad abierta ya no escuda');
  assert.equal(shield.covers('--ds-otra-1'), true, 'y la otra no se ve afectada');
  assert.deepEqual(shield.families.map((f) => f.capability), ['otra.capacidad']);
});

test('ESCUDO — una familia que nombra una capacidad INEXISTENTE no escuda nada', async () => {
  const { buildFrontierShield } = await import('../../index.mjs');
  // No se escuda contra un fantasma: si la fila no esta, el escudo no aplica.
  const shield = buildFrontierShield(FAMILIES, [{ id: 'otra.capacidad', status: 'frontier' }]);
  assert.equal(shield.covers('--ds-tint-success-8'), false);
  assert.deepEqual(buildFrontierShield(FAMILIES, []).prefixes, []);
  assert.deepEqual(buildFrontierShield(FAMILIES, null).prefixes, []);
});

test('ESCUDO — una capacidad activa deja de ocultar sus canales en el arbol real', async () => {
  const { buildFrontierShield, parseRegistry, FRONTIER_FAMILIES } = await import('../../index.mjs');
  const shield = buildFrontierShield(FRONTIER_FAMILIES, parseRegistry());
  assert.deepEqual(shield.shielded.map((f) => f.capability), []);
  assert.equal(shield.prefixes.length, 0);
  assert.equal(shield.covers('--ds-tint-error-16'), false);
  assert.deepEqual(shield.families.map((f) => f.capability), []);
});

test('dead anchor — la puerta NO re-ancla sobre un ancla ilegible, ni con --widen', async () => {
  const { buildDeadBaselineDoc } = await import('../../index.mjs');
  /* Caso reproducido, y medido mas ancho de lo reportado. Con `previous === null`
   * -- archivo AUSENTE o JSON invalido, que `loadBaselineDead` no distingue --
   * el guard `previous ?` dejaba `added` vacio: no pedia `--widen` y escribia la
   * poblacion ENTERA etiquetada `decrece-solo: -0`. Un bootstrap silencioso
   * disfrazado de limpieza.
   *
   * Y las otras formas eran peor de lo que parecian: lanzaban diciendo "me niego
   * a AMPLIAR" -- que describe mal lo que pasa -- y CON `--widen` escribian
   * igual, lavando el ancla ilegible con una etiqueta plausible. Por eso el
   * drill recorre los dos modos: `widen` no puede ser la llave de esta puerta. */
  const live = ['--ds-a', '--ds-b', '--ds-c'];
  const ilegibles = [
    ['ausente o JSON invalido', null],
    ['sin `names`', { schemaVersion: 1 }],
    ['`names` no es array', { schemaVersion: 1, names: 'x' }],
    ['schemaVersion ajena', { schemaVersion: 999, names: ['--ds-a'] }],
    ['schemaVersion ausente', { names: ['--ds-a'] }],
  ];
  for (const [etiqueta, previous] of ilegibles) {
    for (const widen of [false, true]) {
      assert.throws(
        () => buildDeadBaselineDoc({ live, previous, reason: 'reparo el ancla', widen }),
        /no se re-ancla sobre un archivo que no se entiende/,
        `${etiqueta}${widen ? ' con --widen' : ''} dejo escribir`,
      );
    }
  }
  // La razon sigue siendo lo PRIMERO que se exige: sin ella no se llega ni al ancla.
  assert.throws(() => buildDeadBaselineDoc({ live, previous: null, reason: '' }), /exige --reason/);
  // Y un ancla legible sigue funcionando igual: el remedio no cierra la puerta.
  const ok = buildDeadBaselineDoc({ live, previous: { schemaVersion: 1, names: live }, reason: 'sin movimiento' });
  assert.deepEqual(ok.names, live);
  assert.match(ok.lastMoveKind, /^decrece-solo: -0/);
});

test('dead bootstrap — un bootstrap NO puede entrar por la ruta del decrece-solo', async () => {
  const { buildDeadBaselineDoc } = await import('../../index.mjs');
  /* La aserción que da nombre al defecto: crear el inventario desde cero es un
   * acto deliberado, y la ruta del movimiento es justamente la que menos mira
   * nadie. Si alguna vez se autoriza un bootstrap, sera explicito y con su
   * propia etiqueta -- nunca `decrece-solo: -0`. */
  let escrito = null;
  try { escrito = buildDeadBaselineDoc({ live: ['--ds-a'], previous: null, reason: 'bootstrap' }); } catch { escrito = null; }
  assert.equal(escrito, null, 'la puerta de movimiento no fabrica inventarios');
});
