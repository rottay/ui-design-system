import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildInventory,
  classify,
  diffKeys,
  evaluatedLeaves,
  headChannelIndex,
  countLiteralPinsOnDeclaredHead,
  evaluateLedger,
  isRefinedRoot,
  measureLedger,
  readsVar,
  resolveTag,
  sentinelFor,
  slotCandidates,
  valueKind,
  withLeaf,
} from './index.mjs';

/* ── el arbol sintetico ─────────────────────────────────────────────────── */

const SYNTHETIC_CATALOG = {
  roots: [
    {
      rootId: 'tier.page.bg',
      channel: '--ds-page-bg',
      exposure: 'tenant-dial',
      governedBy: 'demo.tone',
      derivationDebt: true,
      derivation: 'el fondo de pagina deriva del nivel base',
    },
    {
      rootId: 'shape.button',
      channel: '--ds-button-radius',
      exposure: 'tenant-dial',
      governedBy: 'demo.shape',
      derivationDebt: false,
      derivation: null,
    },
    // Dos raices reclaman la misma cabeza: nadie la atribuye.
    { rootId: 'tier.a.fg', channel: '--ds-shared-ink', exposure: 'internal-head', governedBy: null, derivationDebt: true, derivation: 'x' },
    { rootId: 'tier.b.fg', channel: '--ds-shared-ink', exposure: 'internal-head', governedBy: null, derivationDebt: true, derivation: 'x' },
  ],
};

const SYNTHETIC_CONTROLS = new Map([
  ['demo.tone', { controlId: 'demo.tone', domain: { kind: 'closed-enum', enumValues: ['subtle', 'strong'] } }],
  ['demo.shape', { controlId: 'demo.shape', domain: { kind: 'closed-enum', enumValues: ['sharp', 'pill'] } }],
]);

/** Compilador de juguete: cada hoja emite el canal que su nombre declara. */
function syntheticArm(themes) {
  return {
    themes,
    provenance: { compilerModule: 'synthetic', compilerExport: 'synthetic', themesModule: 'synthetic', freshnessProven: false },
    compile({ brandTheme }) {
      return {
        cssVariables: {
          '--ds-page-bg': String(brandTheme.chrome?.sidebar?.bg ?? ''),
          '--ds-button-radius': String(brandTheme.chrome?.controls?.radius ?? ''),
          '--ds-shared-ink': String(brandTheme.palette?.textPrimaryColor ?? ''),
          '--ds-untraced': String(brandTheme.surfaces?.mystery ?? ''),
        },
        modeBlocks: [],
        personality: {},
        tokenOverrides: {},
      };
    },
  };
}

const THEME_SOURCE = `
export const demoBrandTheme: FirstPartyBrandTheme = {
  chrome: {
    sidebar: {
      /**
       * @domicile seed
       * @governor dial: demo.tone
       */
      bg: '#ffffff',
    },
    controls: {
      /**
       * @domicile seed
       * @governor dial: demo.shape
       */
      radius: '#ffffff',
    },
  },
  palette: {
    /**
     * @domicile seed
     * @governor none
     */
    textPrimaryColor: '#111111',
  },
  surfaces: {
    /**
     * @domicile derived
     * @governor deriva de: --ds-mystery
     */
    mystery: 'var(--ds-mystery)',
  },
};
`;

const THEME_OBJECT = {
  chrome: { sidebar: { bg: '#ffffff' }, controls: { radius: '#ffffff' } },
  palette: { textPrimaryColor: '#111111' },
  surfaces: { mystery: 'var(--ds-mystery)' },
};

/**
 * Los drills sinteticos corren el modo `catalog-heads-only` A PROPOSITO y por
 * nombre: es un modo de produccion vivo (el que usa `root-membership` para
 * construirse) y es el unico en el que estas aserciones de cabeza compartida y
 * de atribucion por cabeza tienen sujeto. El modo con membresia tiene sus
 * propios drills mas abajo.
 */
async function buildSynthetic({ theme = THEME_OBJECT, catalog = SYNTHETIC_CATALOG, membership = 'none' } = {}) {
  return buildInventory({
    arm: syntheticArm({ demo: theme }),
    catalog,
    controls: SYNTHETIC_CONTROLS,
    sources: { demo: THEME_SOURCE },
    overrideTokens: new Set(),
    membership,
  });
}

const rowFor = (doc, slotId) => doc.rows.find((row) => row.slotId === slotId);

/* ── 1. la fila esperada del slot plantado ──────────────────────────────── */

test('un slot plantado produce su fila, con canal medido y raiz atribuida', async () => {
  const doc = await buildSynthetic();
  const row = rowFor(doc, 'demo:THEME.chrome.sidebar.bg');
  assert.ok(row, 'la fila del slot plantado tiene que existir');
  assert.deepEqual(row.emitsChannels, ['--ds-page-bg']);
  assert.equal(row.rootId, 'tier.page.bg');
  assert.equal(row.rootAttribution, 'head-channel-exact');
  assert.equal(row.rule, 'R2');
  assert.equal(row.verdict, 'collapse');
  assert.equal(row.currentDomicile, 'seed');
  assert.equal(row.evidence.coincidenceGuard, 'no-value-match-used');
});

/* ── 2. cambiar de raiz mueve la fila: el --check no puede pasar igual ──── */

test('si el catalogo mueve la cabeza a otra raiz, la fila cambia (el --check falla)', async () => {
  const before = await buildSynthetic();
  const moved = structuredClone(SYNTHETIC_CATALOG);
  moved.roots[0].rootId = 'tier.page.bg.RENOMBRADA';
  const after = await buildSynthetic({ catalog: moved });
  const a = rowFor(before, 'demo:THEME.chrome.sidebar.bg');
  const b = rowFor(after, 'demo:THEME.chrome.sidebar.bg');
  assert.equal(a.rootId, 'tier.page.bg');
  assert.equal(b.rootId, 'tier.page.bg.RENOMBRADA');
  assert.notEqual(JSON.stringify(before.rows), JSON.stringify(after.rows));
});

/* ── 3. D3: el VALOR RESUELTO de un stop no clasifica R3 ────────────────── */

test('D3 — un literal igual al valor resuelto de un stop NO clasifica R3', () => {
  const root = { exposure: 'tenant-dial', governedBy: 'demo.tone', derivationDebt: false, derivation: null };
  const control = { domain: { enumValues: ['subtle', 'strong'] } };
  // `#DC2626` puede ser EXACTAMENTE lo que el stop `strong` resuelve; da igual.
  const resolved = classify({
    domicile: 'seed', valueKindOf: 'hex', rootId: 'tier.page.bg', root, control,
    authoredValue: '#DC2626', emitsChannels: [], overrideTokens: new Set(),
  });
  assert.equal(resolved.rule, 'R5', 'el valor resuelto jamas es evidencia de variante');

  const named = classify({
    domicile: 'seed', valueKindOf: 'string', rootId: 'tier.page.bg', root, control,
    authoredValue: 'strong', emitsChannels: [], overrideTokens: new Set(),
  });
  assert.equal(named.rule, 'R3');
  assert.equal(named.evidence.stopName, 'strong');
  assert.equal(named.evidence.coincidenceGuard, 'stop-name-authored-not-resolved-value');
});

/* ── 4. anti-coincidencia: mismo valor, raices distintas, sin fusion ────── */

test('dos slots con el MISMO valor y raices distintas no comparten veredicto por el valor', async () => {
  const doc = await buildSynthetic();
  const bg = rowFor(doc, 'demo:THEME.chrome.sidebar.bg');
  const radius = rowFor(doc, 'demo:THEME.chrome.controls.radius');
  assert.equal(bg.authoredValue, radius.authoredValue, 'el arbol planta el mismo #ffffff en los dos');
  assert.notEqual(bg.rootId, radius.rootId);
  assert.notEqual(bg.rule, radius.rule, 'la coincidencia textual no los junta');
  // La propiedad de verdad, no una busqueda de subcadena: ninguna evidencia
  // repite el valor autorado de su propia fila -- salvo R3, donde ese valor ES
  // el nombre del stop y por eso es evidencia legitima.
  for (const row of doc.rows) {
    if (row.rule === 'R3') continue;
    assert.ok(
      !JSON.stringify(row.evidence).includes(row.authoredValue),
      `la evidencia de ${row.slotId} repite su propio valor autorado`,
    );
  }
  for (const row of doc.rows) {
    if (row.rule !== 'R2' && row.rule !== 'R3') continue;
    assert.ok(row.evidence.coincidenceGuard, `${row.slotId} clasifica ${row.rule} sin declarar su guarda`);
  }
});

/* ── 5. cabeza reclamada por dos raices: fail-closed, nunca elige ───────── */

test('una cabeza reclamada por dos raices no atribuye ninguna', async () => {
  const doc = await buildSynthetic();
  const row = rowFor(doc, 'demo:THEME.palette.textPrimaryColor');
  assert.equal(row.rootId, null);
  assert.equal(row.rootAttribution, 'head-channel-claimed-by-several-roots');
  assert.equal(row.rule, 'R5', 'sin raiz atribuible cae a la cola de adjudicacion');
});

/* ── 6. R1: lo ya colapsado se reconoce y no vuelve al backlog ──────────── */

test('R1 reconoce el slot ya colapsado', async () => {
  const doc = await buildSynthetic();
  const row = rowFor(doc, 'demo:THEME.surfaces.mystery');
  assert.equal(row.currentDomicile, 'derived');
  assert.equal(row.rule, 'R1');
  assert.equal(row.verdict, 'already-collapsed');
});

/* ── 7. un canal sin raiz declarada no inventa atribucion ───────────────── */

test('un canal que ninguna raiz encabeza queda sin raiz, con motivo escrito', async () => {
  const doc = await buildSynthetic();
  const row = rowFor(doc, 'demo:THEME.surfaces.mystery');
  assert.deepEqual(row.emitsChannels, ['--ds-untraced']);
  assert.equal(row.rootId, null);
  assert.equal(row.rootAttribution, 'no-persisted-membership');
});

/* ── 8. helpers puros ───────────────────────────────────────────────────── */

test('el centinela conserva el tipo y es unico por slot', () => {
  assert.match(sentinelFor('#0C0C0E', 1), /^#[0-9a-f]{6}$/);
  assert.notEqual(sentinelFor('#0C0C0E', 1), sentinelFor('#0C0C0E', 2));
  assert.match(sentinelFor('20px', 5), /px$/);
  assert.equal(typeof sentinelFor(1.25, 3), 'number');
  assert.equal(sentinelFor(true, 4), false);
});

test('withLeaf no muta el original', () => {
  const original = { a: { b: '1' } };
  const next = withLeaf(original, 'a.b', '2');
  assert.equal(original.a.b, '1');
  assert.equal(next.a.b, '2');
});

test('valueKind separa referencia de literal', () => {
  assert.equal(valueKind('var(--ds-x)'), 'var-reference');
  assert.equal(valueKind('calc(13px * var(--ds-type-scale))'), 'expression');
  assert.equal(readsVar('calc(13px * var(--ds-type-scale))'), true, 'la expresion tambien declara que lee la cascada');
  assert.equal(readsVar('20px'), false);
  assert.equal(valueKind('#ffffff'), 'hex');
  assert.equal(valueKind('20px'), 'dimension');
  assert.equal(valueKind('rgba(0,0,0,.5)'), 'color-fn');
  assert.equal(valueKind(1.5), 'number');
});

test('slotCandidates ofrece las dos formas de autoria y resolveTag toma la mas especifica', () => {
  assert.deepEqual(slotCandidates('typography.fontFamily'), ['TYPOGRAPHY.fontFamily', 'THEME.typography.fontFamily']);
  assert.deepEqual(slotCandidates('modes.dark.palette.x'), ['OVERLAY.palette.x', 'THEME.modes.dark.palette.x']);
  const scopes = [
    { scope: 'THEME.typography.fontFamily', domicile: 'seed', governor: 'g', line: 2 },
    { scope: 'TYPOGRAPHY', domicile: 'derived', governor: 'g', line: 1 },
  ].sort((a, b) => b.scope.length - a.scope.length);
  const match = resolveTag(scopes, slotCandidates('typography.fontFamily'));
  assert.equal(match.entry.scope, 'THEME.typography.fontFamily');
});

test('headChannelIndex separa la cabeza unica de la disputada', () => {
  const { index, ambiguous } = headChannelIndex(SYNTHETIC_CATALOG);
  assert.equal(index.get('--ds-page-bg'), 'tier.page.bg');
  assert.deepEqual(ambiguous.get('--ds-shared-ink'), ['tier.a.fg', 'tier.b.fg']);
});

test('diffKeys ve el canal nuevo y el movido', () => {
  assert.deepEqual(diffKeys({ a: '1', b: '2' }, { a: '9', b: '2', c: '3' }), ['a', 'c']);
});

test('evaluatedLeaves ignora undefined y desciende arrays', () => {
  assert.deepEqual(evaluatedLeaves({ a: 1, b: undefined, c: [2, 3] }, '', []), ['a', 'c[0]', 'c[1]']);
});

/* ── 9. cobertura del mapeo sobre el arbol REAL ─────────────────────────── */

test('todo scope tageado del arbol real cubre al menos una hoja evaluada', async () => {
  const doc = await buildInventory();
  assert.equal(doc.stats.unmappedTagScopes, 0, JSON.stringify(doc.unmappedTagScopes.slice(0, 5)));
  assert.equal(doc.stats.compileFailures, 0);
  assert.equal(doc.stats.metadataRows, doc.stats.metadataRosterSize);
});


/* ── 10. el modo CON membresía ───────────────────────────────────────────── */

test('con membresia, la fila toma la raiz y la via que la membresia ya resolvio', async () => {
  const membership = { rows: [
    { channel: '--ds-page-bg', rootId: 'tier.page.bg', via: 'governed-owner-table' },
    { channel: '--ds-untraced', rootId: 'tier.raised.bg', via: 'declared-fallback' },
  ] };
  const doc = await buildSynthetic({ membership });
  assert.equal(doc.provenance.membershipSource, 'manifest/generated/root-membership.json');
  const bg = doc.rows.find((row) => row.slotId === 'demo:THEME.chrome.sidebar.bg');
  assert.equal(bg.rootId, 'tier.page.bg');
  assert.equal(bg.rootAttribution, 'governed-owner-table');
  const mystery = doc.rows.find((row) => row.slotId === 'demo:THEME.surfaces.mystery');
  assert.equal(mystery.rootId, 'tier.raised.bg');
  assert.equal(mystery.rootAttribution, 'declared-fallback');
});

test('un slot que abarca DOS raices no se atribuye a ninguna', async () => {
  const membership = { rows: [
    { channel: '--ds-page-bg', rootId: 'tier.page.bg', via: 'head-exact' },
    { channel: '--ds-button-radius', rootId: 'shape.button', via: 'head-exact' },
  ] };
  const theme = { ...THEME_OBJECT, chrome: { sidebar: { bg: '#ffffff' }, controls: { radius: '#ffffff' } } };
  // Un solo slot que mueve los dos canales: se planta cambiando el compilador.
  const arm = {
    themes: { demo: theme },
    provenance: { compilerModule: 'synthetic', compilerExport: 'synthetic', themesModule: 'synthetic', freshnessProven: false },
    compile: ({ brandTheme }) => ({
      cssVariables: {
        '--ds-page-bg': String(brandTheme.chrome?.sidebar?.bg ?? ''),
        '--ds-button-radius': String(brandTheme.chrome?.sidebar?.bg ?? ''),
      },
      modeBlocks: [], personality: {}, tokenOverrides: {},
    }),
  };
  const doc = await buildInventory({
    arm, catalog: SYNTHETIC_CATALOG, controls: SYNTHETIC_CONTROLS,
    sources: { demo: THEME_SOURCE }, overrideTokens: new Set(), membership,
  });
  const row = doc.rows.find((item) => item.slotId === 'demo:THEME.chrome.sidebar.bg');
  assert.equal(row.rootId, null);
  assert.equal(row.rootAttribution, 'slot-spans-several-roots');
  assert.equal(row.rule, 'R5');
});

test('el modo sin membresia se pide por nombre: leerla por accidente es imposible', async () => {
  const { readMembership } = await import('./index.mjs');
  assert.throws(() => readMembership('/no/existe/root-membership.json'), /no existe/);
  const doc = await buildSynthetic();
  assert.equal(doc.provenance.membershipSource, 'catalog-heads-only');
});

/* ── 11. el LEDGER cableado: falla en las dos direcciones ────────────────── */

const LEDGER_BASE = { counters: Object.fromEntries(
  ['rows', 'unassignedRows', 'untaggedRows', 'rowsWithoutRootAttribution',
   'expressionsCarryingLiteral', 'literalPinsOnDeclaredHead'].map((n) => [n, { value: 10 }]),
) };
const ledgerLive = (over = {}) => ({
  rows: 10, unassignedRows: 10, untaggedRows: 10, rowsWithoutRootAttribution: 10,
  expressionsCarryingLiteral: 10, literalPinsOnDeclaredHead: 10, ...over,
});

test('LEDGER — un contador que SUBE falla, y el mensaje prohibe re-anclar', () => {
  const failures = evaluateLedger(ledgerLive({ rowsWithoutRootAttribution: 11 }), LEDGER_BASE);
  assert.equal(failures.length, 1);
  assert.match(failures[0], /rowsWithoutRootAttribution: 10 -> 11 SUBIO/);
  assert.match(failures[0], /JAMAS el ancla/);
});

test('LEDGER — un contador que BAJA tambien falla, con la instruccion de re-anclar', () => {
  const failures = evaluateLedger(ledgerLive({ untaggedRows: 9 }), LEDGER_BASE);
  assert.equal(failures.length, 1);
  assert.match(failures[0], /untaggedRows: 10 -> 9 bajo/);
  assert.match(failures[0], /MISMO commit/);
});

test('LEDGER — baseline ausente o corrupto: FAIL cerrado', () => {
  assert.deepEqual(evaluateLedger(ledgerLive(), null), ['[ledger] el baseline no existe o no tiene `counters`']);
  assert.deepEqual(evaluateLedger(ledgerLive(), {}), ['[ledger] el baseline no existe o no tiene `counters`']);
});

test('LEDGER — un contador sin ancla, y un ancla sin contador, se ven los dos', () => {
  const extra = evaluateLedger({ ...ledgerLive(), inventado: 1 }, LEDGER_BASE);
  assert.ok(extra.some((f) => /inventado no esta anclado/.test(f)));
  const { rows, ...sinRows } = ledgerLive();
  const missing = evaluateLedger(sinRows, LEDGER_BASE);
  assert.ok(missing.some((f) => /el baseline ancla rows, que el productor ya no mide/.test(f)));
});

test('LEDGER — sin desvio, cero fallos', () => {
  assert.deepEqual(evaluateLedger(ledgerLive(), LEDGER_BASE), []);
});

test('LEDGER — la unidad de rowsWithoutRootAttribution es la que su razon pinea', async () => {
  const { readFileSync } = await import('node:fs');
  const doc = JSON.parse(readFileSync(new URL('../../../manifest/generated/slot-inventory.json', import.meta.url), 'utf8'));
  const live = measureLedger(doc, 0);
  assert.equal(live.rowsWithoutRootAttribution, doc.stats.byRootAttribution['no-persisted-membership'],
    'medir otra cosa con el mismo nombre es como se rompio la cifra la primera vez');
  assert.equal(live.rows, doc.stats.rows);
});

test('LEDGER — los pines se cuentan sobre raices NO REFINADAS (ley de la cohorte 2A)', () => {
  const edges = { literalPins: [
    { channel: '--ds-color-text-primary' },   // cabeza de nivel
    { channel: '--ds-color-text-muted' },     // cabeza SOLO de una raiz de paso
  ] };
  const catalog = { roots: [
    { rootId: 'tier.base.fg', channel: '--ds-color-text-primary' },
    { rootId: 'tier.base.fg.muted', channel: '--ds-color-text-muted' },
  ] };
  assert.equal(countLiteralPinsOnDeclaredHead({ edges, catalog }), 1,
    'una raiz de paso es la misma decision indexada mas fino: su cabeza no es una cabeza nueva');
  assert.equal(isRefinedRoot('tier.base.fg.muted'), true);
  assert.equal(isRefinedRoot('tier.base.fg'), false);
  assert.equal(isRefinedRoot('ramp.seed.primary'), false);
});

test('LEDGER — el arbol real esta en su ancla, contador por contador', async () => {
  const { readFileSync } = await import('node:fs');
  const url = (p) => new URL(p, import.meta.url);
  const doc = JSON.parse(readFileSync(url('../../../manifest/generated/slot-inventory.json'), 'utf8'));
  const pins = countLiteralPinsOnDeclaredHead({
    edges: JSON.parse(readFileSync(url('../../../manifest/cascade/extracted/css-edges.json'), 'utf8')),
    catalog: JSON.parse(readFileSync(url('../../../manifest/cascade/root-catalog.json'), 'utf8')),
  });
  const baseline = JSON.parse(readFileSync(url('./slot-inventory.baseline.json'), 'utf8'));
  assert.deepEqual(evaluateLedger(measureLedger(doc, pins), baseline), []);
});
