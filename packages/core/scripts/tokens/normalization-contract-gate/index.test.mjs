import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ALLOWLIST_TOTAL,
  REQUIRED_THEME_KEYS,
  analyse,
  buildBaselineDoc,
  checkContractShape,
  checkGovernorAuthorities,
  evaluate,
  findDivergentGroups,
  findShadowingPins,
  readTree,
} from './index.mjs';

/* ── el árbol sintético ─────────────────────────────────────────────────── */

const CONTRACT_OK = `
export interface FirstPartyBrandTheme extends BrandTheme {
${REQUIRED_THEME_KEYS.map((key) => `  readonly ${key}: unknown;`).join('\n')}
}
export type BrandCapabilityCatalog = Readonly<
  Record<BrandCapabilityId, BrandCapabilityDisposition>
>;
`;

const CATALOG = {
  roots: [
    { rootId: 'tier.control.bg', channel: '--ds-control-bg', derivationDebt: true, derivation: 'el relleno de control deriva del nivel' },
    { rootId: 'tier.raised.bg', channel: '--ds-raised-bg', derivationDebt: true, derivation: 'la tarjeta deriva del nivel elevado' },
    { rootId: 'tier.page.bg', channel: '--ds-page-bg', derivationDebt: false, derivation: null },
  ],
};

const MEMBERSHIP = { rows: [
  { channel: '--ds-control-bg', rootId: 'tier.control.bg', via: 'head-exact', property: 'bg', state: null },
  { channel: '--ds-raised-bg', rootId: 'tier.raised.bg', via: 'head-exact', property: 'bg', state: null },
  { channel: '--ds-page-bg', rootId: 'tier.page.bg', via: 'head-exact', property: 'bg', state: null },
] };

const slot = (over) => ({
  slotId: `demo:${over.slotPath}`, vertical: 'demo', currentDomicile: 'seed',
  governor: 'dial: density.mode', authoredValue: '#ffffff', emitsChannels: [], rootId: null, ...over,
});

/** Dos slots de raíces DISTINTAS que comparten `#ffffff`. */
const COINCIDENCE_ROWS = [
  slot({ slotPath: 'CHROME.button.bg', rootId: 'tier.control.bg', emitsChannels: ['--ds-control-bg'], authoredValue: '#ffffff' }),
  slot({ slotPath: 'CHROME.card.bg', rootId: 'tier.raised.bg', emitsChannels: ['--ds-raised-bg'], authoredValue: '#ffffff' }),
];

/** Dos slots de la MISMA coordenada con valores que difieren. */
const DUPLICATION_ROWS = [
  ...COINCIDENCE_ROWS,
  slot({ slotPath: 'CHROME.input.bg', rootId: 'tier.control.bg', emitsChannels: ['--ds-control-bg'], authoredValue: '#101010' }),
];

const tree = (over = {}) => ({
  inventory: { rows: COINCIDENCE_ROWS },
  membership: MEMBERSHIP,
  catalog: CATALOG,
  literalPins: [],
  controlIds: new Set(['density.mode', 'palette.seeds']),
  controlsWithDbDoor: 2,
  allowlistTotal: ALLOWLIST_TOTAL,
  contractSource: CONTRACT_OK,
  knownChannels: new Set(['--ds-control-bg', '--ds-raised-bg', '--ds-page-bg']),
  ...over,
});

/* ── 1. el par que no se puede satisfacer con un detector roto ──────────── */

test('ANTI-COINCIDENCIA: dos slots de raices DISTINTAS con el mismo #ffffff no forman grupo', () => {
  const result = analyse(tree());
  assert.equal(result.counters.divergentGroups, 0);
  assert.equal(result.counters.divergentSlots, 0);
  assert.deepEqual(result.findings, []);
});

test('DUPLICACION REAL: dos slots de la MISMA coordenada con valores distintos forman grupo', () => {
  const result = analyse(tree({ inventory: { rows: DUPLICATION_ROWS } }));
  assert.equal(result.counters.divergentGroups, 1);
  assert.equal(result.counters.divergentSlots, 2);
  assert.match(result.divergent[0].key, /^demo\|tier\.control\.bg\|bg\|sin-estado\|base$/);
});

test('DUPLICACION REAL enrojece el trinquete: el grupo nuevo hace FALLAR el --check', () => {
  const baseline = { counters: {
    unassignedSlots: { value: 0 }, governorsNamingMissingAuthority: { value: 0 },
    shadowingLiteralPins: { value: 0 }, divergentGroups: { value: 0 }, divergentSlots: { value: 0 },
  } };
  const clean = evaluate(analyse(tree()), baseline);
  assert.deepEqual(clean.failures, []);
  assert.deepEqual(clean.drift, []);
  const dirty = evaluate(analyse(tree({ inventory: { rows: DUPLICATION_ROWS } })), baseline);
  assert.ok(dirty.drift.some((item) => /divergentGroups: 0 -> 1 SUBIO/.test(item)), JSON.stringify(dirty.drift));
});

/* ── 2. D3: el detector lee IGUALDAD de valor, jamás su contenido ───────── */

test('D3 — el veredicto es invariante bajo una biyeccion de valores: el contenido no decide nada', () => {
  const before = findDivergentGroups(DUPLICATION_ROWS, new Map(MEMBERSHIP.rows.map((row) => [row.channel, row])));
  // `#DC2626` puede ser EXACTAMENTE el valor resuelto del stop `crimson` de un
  // control gobernado. Da igual: sustituir cada valor por otro, preservando
  // solo el patron de igualdad, no puede mover un solo grupo.
  const bijection = { '#ffffff': '#DC2626', '#101010': '#0A0A0A' };
  const permuted = DUPLICATION_ROWS.map((row) => ({ ...row, authoredValue: bijection[row.authoredValue] }));
  const after = findDivergentGroups(permuted, new Map(MEMBERSHIP.rows.map((row) => [row.channel, row])));
  assert.deepEqual(after, before, 'el detector cambio de opinion por el CONTENIDO de un valor');
});

test('D3 — colapsar dos valores distintos en uno SI cambia el veredicto (la igualdad si cuenta)', () => {
  const collapsed = DUPLICATION_ROWS.map((row) => ({ ...row, authoredValue: '#ffffff' }));
  const groups = findDivergentGroups(collapsed, new Map(MEMBERSHIP.rows.map((row) => [row.channel, row])));
  assert.equal(groups.length, 0, 'si las dos posiciones coinciden, el grupo deja de divergir');
});

/* ── 3. L1: el contrato relajado no compila menos, pero el gate lo ve ───── */

test('L1 — relajar una clave requerida a opcional falla', () => {
  const relaxed = CONTRACT_OK.replace('readonly palette: unknown;', 'readonly palette?: unknown;');
  const findings = checkContractShape(relaxed);
  assert.equal(findings.length, 1);
  assert.match(findings[0].detail, /relajo palette a opcional/);
});

test('L1 — borrar una clave requerida falla', () => {
  const cut = CONTRACT_OK.replace('  readonly chrome: unknown;\n', '');
  assert.match(checkContractShape(cut)[0].detail, /ya no declara readonly chrome/);
});

test('L1 — BrandCapabilityCatalog degradado a Partial falla', () => {
  const partial = CONTRACT_OK.replace('Readonly<\n  Record<', 'Readonly<\n  Partial<Record<');
  const findings = checkContractShape(partial);
  assert.ok(findings.some((finding) => /Partial<Record>/.test(finding.detail)), JSON.stringify(findings));
});

test('L1 — el contrato intacto no produce hallazgos', () => {
  assert.deepEqual(checkContractShape(CONTRACT_OK), []);
});

/* ── 4. L2: la ley prohibe la mentira, no el silencio ───────────────────── */

test('L2 — un governor que NO nombra dial es legitimo y no falla', () => {
  const rows = [slot({ slotPath: 'CHARTS.colorScheme', governor: 'seed de personalidad de charts: el compilador la copia a chartPersonality' })];
  assert.deepEqual(checkGovernorAuthorities(rows, { controlIds: new Set(['density.mode']), knownChannels: new Set() }), []);
});

test('L2 — un governor que nombra un dial inexistente falla', () => {
  const rows = [slot({ slotPath: 'PALETTE.x', governor: 'dial: tenant-dial (tinta de pagina)' })];
  const findings = checkGovernorAuthorities(rows, { controlIds: new Set(['density.mode']), knownChannels: new Set() });
  assert.equal(findings.length, 1);
  assert.match(findings[0].detail, /"dial: tenant-dial" y no existe un control/);
});

test('L2 — un governor que nombra un canal inexistente falla, pero un PREFIJO de prosa no', () => {
  const known = new Set(['--ds-color-primary']);
  const bad = checkGovernorAuthorities(
    [slot({ slotPath: 'A.b', governor: 'deriva de: --ds-color-error-hover' })],
    { controlIds: new Set(), knownChannels: known },
  );
  assert.equal(bad.length, 1);
  const wildcard = checkGovernorAuthorities(
    [slot({ slotPath: 'A.c', governor: 'baja a canal --ds-stats-grid-* (chromeToVariables)' })],
    { controlIds: new Set(), knownChannels: known },
  );
  assert.deepEqual(wildcard, [], 'un prefijo de concatenacion no es un canal: fue un falso positivo medido de 24 casos');
});

test('L2 estructural — un domicilio fuera del vocabulario o sin governor falla duro', () => {
  const rows = [
    slot({ slotPath: 'A.d', currentDomicile: 'inventado' }),
    slot({ slotPath: 'A.e', governor: '   ' }),
  ];
  const result = analyse(tree({ inventory: { rows } }));
  assert.equal(result.findings.filter((finding) => finding.law === 'L2').length, 2);
});

/* ── 5. L4(a): sombra medida contra la MEMBRESÍA ────────────────────────── */

test('L4(a) — un literal sobre canal cuya raiz ya sabe derivar es sombra; si la raiz no sabe, no lo es', () => {
  const byChannel = new Map(MEMBERSHIP.rows.map((row) => [row.channel, row]));
  const byRoot = new Map(CATALOG.roots.map((root) => [root.rootId, root]));
  const shadows = findShadowingPins({
    literalPins: [
      { channel: '--ds-control-bg', file: 'a.css', line: 1 },
      { channel: '--ds-page-bg', file: 'b.css', line: 2 },
      { channel: '--ds-desconocido', file: 'c.css', line: 3 },
    ],
    membershipByChannel: byChannel, rootById: byRoot,
  });
  assert.equal(shadows.length, 1);
  assert.equal(shadows[0].rootId, 'tier.control.bg');
});

/* ── 6. L5: la superficie del tenant no se achica ───────────────────────── */

test('L5 — achicar el allowlist falla', () => {
  const result = analyse(tree({ allowlistTotal: ALLOWLIST_TOTAL - 1 }));
  assert.ok(result.findings.some((finding) => finding.law === 'L5' && /superficie sobreescribible se movio/.test(finding.detail)));
});

test('L5 — un control que pierde su puerta DB falla (clase anti-puerta, decision 19)', () => {
  const result = analyse(tree({ controlsWithDbDoor: 1 }));
  assert.ok(result.findings.some((finding) => finding.law === 'L5' && /perdieron su puerta DB/.test(finding.detail)));
});

/* ── 7. el trinquete no admite la subida ni por la puerta de escritura ──── */

test('el trinquete falla en las DOS direcciones y nombra la instruccion', () => {
  const baseline = { counters: {
    unassignedSlots: { value: 0 }, governorsNamingMissingAuthority: { value: 0 },
    shadowingLiteralPins: { value: 5 }, divergentGroups: { value: 0 }, divergentSlots: { value: 0 },
  } };
  const { drift } = evaluate(analyse(tree()), baseline);
  assert.ok(drift.some((item) => /shadowingLiteralPins: 5 -> 0 bajo/.test(item)));
  assert.ok(drift.some((item) => /MISMO commit/.test(item)));
});

/* ── 8. el árbol REAL ───────────────────────────────────────────────────── */

test('sobre el arbol real: las leyes duras se sostienen y el ancla coincide', async () => {
  const result = analyse(readTree());
  assert.deepEqual(result.findings, [], JSON.stringify(result.findings.slice(0, 5)));
  const baseline = JSON.parse(
    (await import('node:fs')).readFileSync(new URL('./normalization-contract-gate.baseline.json', import.meta.url), 'utf8'),
  );
  for (const [name, value] of Object.entries(result.counters)) {
    assert.equal(value, baseline.counters[name].value, `${name} se movio respecto del ancla`);
  }
  // L3: el ancla de `unassigned` es la MISMA que la del inventario. Dos anclas
  // que se separan es como el frente pierde una ley sin que nadie lo note.
  const inventoryBaseline = JSON.parse(
    (await import('node:fs')).readFileSync(new URL('../slot-inventory/slot-inventory.baseline.json', import.meta.url), 'utf8'),
  );
  assert.equal(result.counters.unassignedSlots, inventoryBaseline.counters.unassignedRows.value);
});

/* ── la puerta hacia arriba: gobernada, no abierta ───────────────────────── */

test('la unica subida legal es la RE-ATRIBUCION, y se pide por nombre', () => {
  // El drill vive sobre `evaluate`, que es donde la ley se aplica al leer: una
  // subida SIEMPRE es un fallo del --check. La bandera --reattribution solo
  // existe en la puerta de ESCRITURA, y por eso el gate nunca se vuelve
  // permisivo: re-anclar exige un acto explicito y con razon escrita.
  const baseline = { counters: Object.fromEntries(
    ['unassignedSlots', 'governorsNamingMissingAuthority', 'shadowingLiteralPins', 'divergentGroups', 'divergentSlots']
      .map((name) => [name, { value: 0 }]),
  ) };
  const result = { findings: [], governorFindings: [], counters: {
    unassignedSlots: 0, governorsNamingMissingAuthority: 0,
    shadowingLiteralPins: 5, divergentGroups: 0, divergentSlots: 0,
  } };
  const { drift } = evaluate(result, baseline);
  assert.ok(drift.some((item) => /shadowingLiteralPins: 0 -> 5 SUBIO/.test(item)),
    'el --check no tiene puerta de escape: una subida siempre se ve');
});

test('el ancla registra QUE CLASE de movimiento la produjo', async () => {
  const { readFileSync } = await import('node:fs');
  const baseline = JSON.parse(readFileSync(new URL('./normalization-contract-gate.baseline.json', import.meta.url), 'utf8'));
  assert.ok(baseline.lastMove, 'toda ancla lleva su razon');
  if (baseline.lastMoveKind === 're-atribucion (subida autorizada por nombre)') {
    assert.match(baseline.lastMove, /re-atribucion|RE-ATRIBUCION/i,
      'una subida autorizada tiene que decir en su razon por que no es regresion');
  }
});

/* ── la puerta escribe la razon DEL MOVIMIENTO, no la vieja ──────────────── */

const doorFixture = (counters) => ({
  result: { counters, findings: [], governorFindings: [], shadows: [], divergent: [] },
  previous: { counters: {
    unassignedSlots: { value: 10, reason: 'VIEJA unassigned' },
    divergentGroups: { value: 20, reason: 'VIEJA divergentGroups: solo pueden bajar' },
  } },
});

test('PUERTA — el contador que SE MUEVE recibe la razon del movimiento', () => {
  /* Antes la puerta conservaba SIEMPRE la razon anterior, asi que tras una
   * re-ancla el contador quedaba con el valor nuevo y la explicacion del viejo:
   * una fila que se contradice a si misma. Paso de verdad en el lote 3B --
   * `divergentGroups` quedo en 242 con una razon terminada en "solo pueden
   * bajar" y hubo que reescribirla a mano al commitear. Una puerta que exige un
   * hand-edit para no mentir no esta cerrada. */
  const { result, previous } = doorFixture({ unassignedSlots: 10, divergentGroups: 24 });
  const doc = buildBaselineDoc({ result, previous, reason: 'RAZON DEL MOVIMIENTO', reattribution: true });
  assert.equal(doc.counters.divergentGroups.value, 24);
  assert.equal(doc.counters.divergentGroups.reason, 'RAZON DEL MOVIMIENTO');
  assert.doesNotMatch(doc.counters.divergentGroups.reason, /solo pueden bajar/,
    'la razon vieja describia el valor viejo');
});

test('PUERTA — los contadores QUIETOS conservan la suya: pisarlas seria el mismo defecto al reves', () => {
  const { result, previous } = doorFixture({ unassignedSlots: 10, divergentGroups: 24 });
  const doc = buildBaselineDoc({ result, previous, reason: 'RAZON DEL MOVIMIENTO', reattribution: true });
  assert.equal(doc.counters.unassignedSlots.value, 10);
  assert.equal(doc.counters.unassignedSlots.reason, 'VIEJA unassigned', 'no se movio: su historia no cambio');
});

test('PUERTA — vale en las DOS direcciones, y un contador nuevo estrena razon', () => {
  const { result, previous } = doorFixture({ unassignedSlots: 8, divergentGroups: 20, inventado: 3 });
  const doc = buildBaselineDoc({ result, previous, reason: 'MOVIMIENTO', reattribution: false });
  assert.equal(doc.counters.unassignedSlots.reason, 'MOVIMIENTO', 'bajar tambien es moverse');
  assert.equal(doc.counters.divergentGroups.reason, 'VIEJA divergentGroups: solo pueden bajar');
  assert.equal(doc.counters.inventado.reason, 'MOVIMIENTO', 'un contador sin ancla previa estrena la razon');
  assert.equal(doc.lastMoveKind, 'decrece-solo');
});
