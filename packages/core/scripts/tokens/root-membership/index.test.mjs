import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CATALOG_TIERS,
  MOST_GENERAL_TIER,
  VIAS,
  buildMembership,
  decomposeLeaf,
  decomposeRootId,
  fallbackIndex,
  ownerOfSlotPath,
  readOwnerTiers,
  resolveHeads,
} from './index.mjs';

/* ── árbol sintético ────────────────────────────────────────────────────── */

const CATALOG = {
  roots: [
    // Cabeza compartida por cuatro tiers: el caso real de --ds-color-border.
    { rootId: 'tier.base.border', channel: '--ds-shared-border', exposure: 'internal-head', derivationDebt: true, derivation: 'la base manda' },
    { rootId: 'tier.control.border', channel: '--ds-shared-border', exposure: 'internal-head', derivationDebt: true, derivation: 'x' },
    { rootId: 'tier.raised.border', channel: '--ds-shared-border', exposure: 'gap', derivationDebt: false, derivation: null },
    // Cabeza simple.
    { rootId: 'tier.page.bg', channel: '--ds-page-bg', exposure: 'tenant-dial', derivationDebt: true, derivation: 'el fondo de pagina deriva' },
    // Segunda cabeza simple, para fabricar ambigüedad de fallback.
    { rootId: 'tier.raised.bg', channel: '--ds-raised-bg', exposure: 'internal-head', derivationDebt: true, derivation: 'y' },
    // Disputa que la regla NO puede resolver: dos reclamantes y ninguno base.
    { rootId: 'tier.control.fg', channel: '--ds-tie', exposure: 'internal-head', derivationDebt: true, derivation: 'z' },
    { rootId: 'tier.overlay.fg', channel: '--ds-tie', exposure: 'internal-head', derivationDebt: true, derivation: 'z' },
  ],
};

const EDGES = {
  edges: [
    // --ds-guarded-one cae a la cabeza compartida: UNA sola raíz tras resolver.
    { from: '--ds-shared-border', to: '--ds-guarded-one', edgeClass: 'decl-fallback', guardPrimary: '--ds-guarded-one', file: 'a.css', line: 10 },
    // --ds-guarded-two lo guardan DOS raíces distintas: ambiguo.
    { from: '--ds-page-bg', to: '--ds-guarded-two', edgeClass: 'leaf-fallback', guardPrimary: '--ds-guarded-two', file: 'b.css', line: 20 },
    { from: '--ds-raised-bg', to: '--ds-guarded-two', edgeClass: 'leaf-fallback', guardPrimary: '--ds-guarded-two', file: 'c.css', line: 30 },
    // Un edge que NO es de fallback no debe atribuir nada.
    { from: '--ds-page-bg', to: '--ds-plain-decl', edgeClass: 'decl', file: 'd.css', line: 40 },
  ],
};

const INVENTORY = {
  rows: [
    { slotId: 'demo:THEME.chrome.sidebar.bg', slotPath: 'THEME.chrome.sidebar.bg', authoredValue: '#ffffff', emitsChannels: ['--ds-page-bg'] },
    { slotId: 'demo:THEME.chrome.card.borderHover', slotPath: 'THEME.chrome.card.borderHover', authoredValue: '#ffffff', emitsChannels: ['--ds-guarded-one'] },
    { slotId: 'demo:THEME.chrome.misc.bg', slotPath: 'THEME.chrome.misc.bg', authoredValue: '#101010', emitsChannels: ['--ds-guarded-two'] },
    { slotId: 'demo:THEME.chrome.misc.color', slotPath: 'THEME.chrome.misc.color', authoredValue: '#202020', emitsChannels: ['--ds-plain-decl'] },
    { slotId: 'demo:THEME.palette.borderColor', slotPath: 'THEME.palette.borderColor', authoredValue: '#303030', emitsChannels: ['--ds-shared-border'] },
    { slotId: 'demo:THEME.palette.tieColor', slotPath: 'THEME.palette.tieColor', authoredValue: '#404040', emitsChannels: ['--ds-tie'] },
  ],
};

const build = (over = {}) => buildMembership({
  inventory: INVENTORY,
  catalog: CATALOG,
  edges: EDGES,
  ownerTiers: { present: false, byOwner: new Map(), formFailures: [] },
  ...over,
});

const rowFor = (doc, channel) => doc.rows.find((row) => row.channel === channel);

/* ── 1. regla de generalidad ────────────────────────────────────────────── */

test('una cabeza compartida pertenece al tier base y las demas la REFERENCIAN', async () => {
  const doc = await build();
  const row = rowFor(doc, '--ds-shared-border');
  assert.equal(row.rootId, 'tier.base.border');
  assert.equal(row.via, 'head-exact');
  assert.equal(row.evidence.sharedHead, true);
  assert.deepEqual(row.evidence.referencesHead, ['tier.control.border', 'tier.raised.border']);
  assert.ok(row.evidence.generalityEvidence.includes('unqualified separator'));
  assert.equal(doc.stats.sharedHeadsResolved, 1);
});

test('una disputa SIN reclamante base no se resuelve: null con motivo', async () => {
  const doc = await build();
  const row = rowFor(doc, '--ds-tie');
  assert.equal(row.rootId, null);
  assert.equal(doc.stats.sharedHeadsUnresolved, 1);
  assert.match(doc.sharedHeads.unresolved[0].reason, /ningun reclamante es tier "base"/);
});

test('la regla de generalidad reconoce la raiz de PASO como del mismo nivel', () => {
  // Una cabeza compartida entre raices de paso tiene que resolver a la base:
  // si `decomposeRootId` solo entendiera raices de tres partes, no le
  // encontraria tier a ninguna reclamante y quedaria sin resolver.
  const catalog = { roots: [
    { rootId: 'tier.base.fg.secondary', channel: '--ds-x' },
    { rootId: 'tier.control.fg.secondary', channel: '--ds-x' },
    { rootId: 'tier.page.fg.secondary', channel: '--ds-x' },
  ] };
  const { resolved, unresolved } = resolveHeads(catalog);
  assert.equal(unresolved.length, 0);
  assert.equal(resolved.get('--ds-x').rootId, 'tier.base.fg.secondary');
  assert.deepEqual(resolved.get('--ds-x').references, ['tier.control.fg.secondary', 'tier.page.fg.secondary']);
  assert.equal(decomposeRootId('tier.base.fg.secondary').tier, 'base');
  assert.equal(decomposeRootId('tier.base.fg.secondary').step, 'secondary');
});

/* ── 2. V2: la regla de fila pineada ────────────────────────────────────── */

test('V2 atribuye el primario guardado cuando UNA sola raiz lo guarda', async () => {
  const doc = await build();
  const row = rowFor(doc, '--ds-guarded-one');
  assert.equal(row.via, 'declared-fallback');
  assert.equal(row.rootId, 'tier.base.border');
  assert.equal(row.evidence.fallbackFrom, '--ds-shared-border');
  assert.equal(row.evidence.site, 'a.css:10');
});

test('V2 NO atribuye cuando dos raices guardan el mismo canal', async () => {
  const doc = await build();
  const row = rowFor(doc, '--ds-guarded-two');
  assert.equal(row.rootId, null);
  assert.equal(row.via, null);
  assert.match(row.evidence.whyNotV2, /guardado por 2 raices distintas/);
});

test('un edge que no es de fallback no atribuye nada', async () => {
  const doc = await build();
  const row = rowFor(doc, '--ds-plain-decl');
  assert.equal(row.rootId, null);
  assert.match(row.evidence.whyNotV2, /ningun fallback declarado/);
  // y el índice lo confirma en aislamiento
  const { resolved } = resolveHeads(CATALOG);
  assert.equal(fallbackIndex(EDGES.edges, resolved).has('--ds-plain-decl'), false);
});

/* ── 3. anti-coincidencia, como PROPIEDAD ───────────────────────────────── */

test('ninguna evidencia repite un valor autorado de sus slots contribuyentes', async () => {
  const doc = await build();
  const valueOf = new Map(INVENTORY.rows.map((row) => [row.slotId, row.authoredValue]));
  for (const row of doc.rows) {
    const values = row.contributingSlots.map((slotId) => valueOf.get(slotId)).filter(Boolean);
    const evidence = JSON.stringify(row.evidence);
    for (const value of values) {
      assert.ok(!evidence.includes(value), `la evidencia de ${row.channel} repite el valor ${value}`);
    }
  }
});

test('dos canales con slots del MISMO valor y raices distintas no se juntan', async () => {
  const doc = await build();
  // Los slots de --ds-page-bg y --ds-guarded-one autoran ambos '#ffffff'.
  const a = rowFor(doc, '--ds-page-bg');
  const b = rowFor(doc, '--ds-guarded-one');
  assert.notEqual(a.rootId, b.rootId);
  assert.equal(a.via, 'head-exact');
  assert.equal(b.via, 'declared-fallback');
  for (const row of doc.rows) assert.equal(row.evidence.coincidenceGuard, 'no-value-match-used');
});

/* ── 4. V3 ausente es legítimo; la tabla se valida por forma ────────────── */

test('sin tabla owner-tiers, V3 no atribuye nada y no es un fallo', async () => {
  const doc = await build();
  assert.equal(doc.stats.ownersAdjudicated, 0);
  assert.equal(doc.stats.byVia['governed-owner-table'], undefined);
  assert.deepEqual(doc.provenance.ownerTiersFormFailures, []);
  assert.match(rowFor(doc, '--ds-guarded-two').evidence.whyNotV3, /no existe todavia/);
});

test('con tabla, V3 atribuye por owner unico + propiedad de la hoja', async () => {
  const table = {
    present: true,
    byOwner: new Map([['THEME.chrome.misc', { ownerPath: 'THEME.chrome.misc', tier: 'raised', reason: 'panel interno' }]]),
    formFailures: [],
  };
  const doc = await build({ ownerTiers: table });
  const row = rowFor(doc, '--ds-guarded-two');
  assert.equal(row.via, 'governed-owner-table');
  assert.equal(row.rootId, 'tier.raised.bg');
  assert.equal(row.evidence.concordance, 'owner-unico');
  assert.equal(row.evidence.propertyFromLeaf, 'bg');
});

/* La admision de V3 es por CONCORDANCIA. Los tres drills van juntos: uno prueba
 * que la pluralidad se admite, y los otros dos que el desacuerdo y la ausencia
 * no. Solo el primero seria una regla floja; solo los otros dos, una regla que
 * techa el frente en un tercio de la masa. */

test('V3 admite VARIOS owners cuando todos concuerdan en tier', async () => {
  const inventory = { rows: [
    { slotId: 'demo:THEME.chrome.a.bg', slotPath: 'THEME.chrome.a.bg', authoredValue: '#010101', emitsChannels: ['--ds-multi'] },
    { slotId: 'demo:THEME.chrome.b.bg', slotPath: 'THEME.chrome.b.bg', authoredValue: '#020202', emitsChannels: ['--ds-multi'] },
  ] };
  const table = { present: true, formFailures: [], byOwner: new Map([
    ['THEME.chrome.a', { ownerPath: 'THEME.chrome.a', tier: 'raised', reason: 'tarjeta' }],
    ['THEME.chrome.b', { ownerPath: 'THEME.chrome.b', tier: 'raised', reason: 'tarjeta hermana' }],
  ]) };
  const doc = await build({ inventory, ownerTiers: table });
  const row = rowFor(doc, '--ds-multi');
  assert.equal(row.via, 'governed-owner-table');
  assert.equal(row.rootId, 'tier.raised.bg');
  assert.equal(row.evidence.concordance, '2 owners concuerdan en tier');
});

test('V3 RECHAZA cuando dos owners adjudicados discrepan de tier', async () => {
  const inventory = { rows: [
    { slotId: 'demo:THEME.chrome.a.bg', slotPath: 'THEME.chrome.a.bg', authoredValue: '#010101', emitsChannels: ['--ds-multi'] },
    { slotId: 'demo:THEME.chrome.b.bg', slotPath: 'THEME.chrome.b.bg', authoredValue: '#020202', emitsChannels: ['--ds-multi'] },
  ] };
  const table = { present: true, formFailures: [], byOwner: new Map([
    ['THEME.chrome.a', { ownerPath: 'THEME.chrome.a', tier: 'raised', reason: 'tarjeta' }],
    ['THEME.chrome.b', { ownerPath: 'THEME.chrome.b', tier: 'page', reason: 'chrome de pagina' }],
  ]) };
  const doc = await build({ inventory, ownerTiers: table });
  const row = rowFor(doc, '--ds-multi');
  assert.equal(row.rootId, null);
  assert.match(row.evidence.whyNotV3, /discrepan de tier: page vs raised/);
});

test('V3 RECHAZA cuando un owner contribuyente no esta adjudicado', async () => {
  const inventory = { rows: [
    { slotId: 'demo:THEME.chrome.a.bg', slotPath: 'THEME.chrome.a.bg', authoredValue: '#010101', emitsChannels: ['--ds-multi'] },
    { slotId: 'demo:THEME.chrome.b.bg', slotPath: 'THEME.chrome.b.bg', authoredValue: '#020202', emitsChannels: ['--ds-multi'] },
  ] };
  const table = { present: true, formFailures: [], byOwner: new Map([
    ['THEME.chrome.a', { ownerPath: 'THEME.chrome.a', tier: 'raised', reason: 'tarjeta' }],
  ]) };
  const doc = await build({ inventory, ownerTiers: table });
  const row = rowFor(doc, '--ds-multi');
  assert.equal(row.rootId, null);
  assert.match(row.evidence.whyNotV3, /owners sin adjudicar: THEME\.chrome\.b/);
});

test('el gate de forma de la tabla nombra la fila mala', async (t) => {
  const { writeFileSync, mkdtempSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const dir = mkdtempSync(join(tmpdir(), 'owner-tiers-'));
  const path = join(dir, 'owner-tiers.json');
  writeFileSync(path, JSON.stringify({ rows: [
    { ownerPath: 'A', tier: 'inventado', reason: 'x' },
    { ownerPath: 'B', tier: 'raised', reason: '  ' },
    { ownerPath: 'C', tier: 'base', reason: 'ok' },
    { ownerPath: 'C', tier: 'page', reason: 'duplicado' },
  ] }));
  const table = readOwnerTiers(path);
  assert.equal(table.byOwner.size, 1);
  assert.equal(table.formFailures.length, 3);
  assert.match(table.formFailures[0], /tier "inventado" fuera del vocabulario cerrado/);
  assert.match(table.formFailures[1], /reason vacia/);
  assert.match(table.formFailures[2], /ownerPath duplicado C/);
});

/* ── 5. gramáticas pineadas ─────────────────────────────────────────────── */

test('la gramatica de owner corta en la hoja, no en los tokens del camelCase', () => {
  assert.equal(ownerOfSlotPath('THEME.chrome.sidebar.itemBgHover'), 'THEME.chrome.sidebar');
  assert.equal(ownerOfSlotPath('OVERLAY.palette.borderColor'), 'OVERLAY.palette');
  assert.equal(ownerOfSlotPath('THEME'), 'THEME');
});

test('la hoja camelCase entrega propiedad y estado del vocabulario cerrado', () => {
  assert.deepEqual(decomposeLeaf('itemBgHover'), { property: 'bg', state: 'hover', rest: ['item'] });
  assert.deepEqual(decomposeLeaf('borderColor'), { property: 'fg', state: null, rest: ['border'] });
  assert.deepEqual(decomposeLeaf('bg'), { property: 'bg', state: null, rest: [] });
  assert.equal(decomposeLeaf('barThickness').property, null);
});

test('rootId se descompone en familia/tier/propiedad', () => {
  assert.deepEqual(decomposeRootId('tier.raised.border'), { family: 'tier', tier: 'raised', property: 'border', step: null });
  assert.deepEqual(decomposeRootId('tier.raised.border.subtle'), { family: 'tier', tier: 'raised', property: 'border', step: 'subtle' });
  assert.deepEqual(decomposeRootId('state.delta.hover'), { family: 'state', tier: null, property: 'delta.hover', step: null });
});

test('los vocabularios son cerrados y no cambian por accidente', () => {
  assert.deepEqual(VIAS, ['head-exact', 'declared-fallback', 'governed-owner-table']);
  assert.deepEqual(CATALOG_TIERS, ['base', 'page', 'control', 'raised', 'overlay', 'accent']);
  assert.equal(MOST_GENERAL_TIER, 'base');
});

/* ── 6. el árbol REAL ───────────────────────────────────────────────────── */

test('sobre el arbol real: ninguna via fuera del vocabulario y toda fila con su guarda', async () => {
  const doc = await buildMembership();
  assert.ok(doc.stats.sharedHeadsResolved >= 1);
  for (const row of doc.rows) {
    assert.ok(row.via === null || VIAS.includes(row.via), `via invalida: ${row.via}`);
    assert.equal(row.evidence.coincidenceGuard, 'no-value-match-used');
  }
  assert.ok(doc.stats.r2Floor > 26, `el piso de R2 (${doc.stats.r2Floor}) tiene que superar el R2 de hoy`);
});

/* ── 10. el TERCER ÍNDICE (`step`) — preparado e INACTIVO ────────────────── */

test('sin tabla owner-step-rules, el refinamiento no toca nada y lo declara', async () => {
  const { refineWithStep } = await import('./index.mjs');
  const out = refineWithStep({
    rootId: 'tier.base.fg', contributors: ['CHROME.card.color'],
    stepRules: { present: false, byKey: new Map() }, rootExists: () => true,
  });
  assert.equal(out.rootId, 'tier.base.fg');
  assert.equal(out.step, null);
  assert.match(out.stepNote, /no existe todavia/);
});

test('con tabla, refina SOLO si la raiz refinada existe en el catalogo', async () => {
  const { refineWithStep } = await import('./index.mjs');
  const stepRules = { present: true, byKey: new Map([['CHROME.card|fg|headerColor', { ownerPath: 'CHROME.card', property: 'fg', leaf: 'headerColor', step: 'secondary', reason: 'cabecera de tarjeta' }]]) };
  const ok = refineWithStep({ rootId: 'tier.base.fg', contributors: ['CHROME.card.headerColor'], stepRules, rootExists: (id) => id === 'tier.base.fg.secondary' });
  assert.equal(ok.rootId, 'tier.base.fg.secondary');
  assert.equal(ok.step, 'secondary');
  const missing = refineWithStep({ rootId: 'tier.base.fg', contributors: ['CHROME.card.headerColor'], stepRules, rootExists: () => false });
  assert.equal(missing.rootId, 'tier.base.fg', 'jamas se fabrica una raiz desde una tabla');
  assert.match(missing.stepNote, /esa raiz no existe en el catalogo/);
});

test('CONCORDANCIA de paso: un contribuyente sin regla, o dos pasos en desacuerdo, no refinan', async () => {
  const { refineWithStep } = await import('./index.mjs');
  const stepRules = { present: true, byKey: new Map([
    ['A|fg|color', { ownerPath: 'A', property: 'fg', leaf: 'color', step: 'muted', reason: 'x' }],
    ['A|fg|otro', { ownerPath: 'A', property: 'fg', leaf: 'otro', step: 'muted', reason: 'x' }],
    ['B|fg|color', { ownerPath: 'B', property: 'fg', leaf: 'color', step: 'primary', reason: 'y' }],
  ]) };
  const exists = () => true;
  // pluralidad concordante: SI refina
  const ok = refineWithStep({ rootId: 'tier.base.fg', contributors: ['A.color', 'A.otro'], stepRules, rootExists: exists });
  assert.equal(ok.rootId, 'tier.base.fg.muted');
  // desacuerdo: NO
  const clash = refineWithStep({ rootId: 'tier.base.fg', contributors: ['A.color', 'B.color'], stepRules, rootExists: exists });
  assert.equal(clash.rootId, 'tier.base.fg');
  assert.match(clash.stepNote, /discrepan de paso: muted vs primary/);
  // sin adjudicar: NO
  const missing = refineWithStep({ rootId: 'tier.base.fg', contributors: ['A.color', 'Z.color'], stepRules, rootExists: exists });
  assert.match(missing.stepNote, /sin adjudicar: Z\|fg\|color/);
  // raiz no refinable
  assert.match(refineWithStep({ rootId: 'elevation.ladder', contributors: ['A.color'], stepRules, rootExists: exists }).stepNote, /no es un tier/);
});

test('el gate de forma de owner-step-rules nombra la fila mala', async () => {
  const { readOwnerStepRules, STEP_VOCABULARY } = await import('./index.mjs');
  const { writeFileSync, mkdtempSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const path = join(mkdtempSync(join(tmpdir(), 'step-rules-')), 'owner-step-rules.json');
  writeFileSync(path, JSON.stringify({ rows: [
    { ownerPath: 'A', property: 'shadow', leaf: 'x', step: 'primary', reason: 'x' },
    { ownerPath: 'B', property: 'fg', leaf: '  ', step: 'muted', reason: 'x' },
    { ownerPath: 'C', property: 'fg', leaf: 'color', step: 'inventado', reason: 'x' },
    { ownerPath: 'E', property: 'fg', leaf: 'color', step: 'muted', reason: ' ' },
    { ownerPath: 'D', property: 'border', leaf: 'border', step: 'subtle', reason: 'ok' },
    { ownerPath: 'D', property: 'border', leaf: 'border', step: 'focus', reason: 'duplicada' },
  ] }));
  const table = readOwnerStepRules(path);
  assert.equal(table.byKey.size, 1);
  assert.equal(table.formFailures.length, 5);
  assert.match(table.formFailures[0], /propiedad "shadow" fuera/);
  assert.match(table.formFailures[1], /leaf vacia/);
  assert.match(table.formFailures[2], /paso "inventado" fuera del vocabulario autorado/);
  assert.match(table.formFailures[3], /reason vacia/);
  assert.match(table.formFailures[4], /clave duplicada D\|border\|border/);
  // El vocabulario sale de BrandPalette; nada se inventa.
  assert.equal(STEP_VOCABULARY.fg.length, 8);
  assert.equal(STEP_VOCABULARY.border.length, 6);
});

test('el mecanismo esta ACTIVO y su artefacto lo declara', async () => {
  const { readFileSync } = await import('node:fs');
  const doc = JSON.parse(readFileSync(new URL('../../../manifest/generated/root-membership.json', import.meta.url), 'utf8'));
  assert.equal(doc.stats.stepRulesPresent, true);
  assert.ok(doc.stats.stepRulesAdjudicated > 0);
  assert.ok(doc.stats.rowsRefinedByStep > 0);
  for (const row of doc.rows) {
    if (row.step === null) continue;
    assert.equal(row.rootId.split('.').length, 4, 'una fila con paso vive en una raiz refinada');
    assert.ok(row.parentRootId, 'y declara de que raiz padre vino');
  }
});
