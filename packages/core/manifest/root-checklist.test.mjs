/**
 * @fileoverview Tests del checklist de raiz.
 *
 * Los oraculos de atribucion y de descarte estan verificados contra fuente:
 * cada caso cita el archivo real del que sale. Los tests de integracion se
 * apoyan en `generated/fanout-facts.json` y en el canon de familias
 * (`family-inventory.json`, 255 filas), que es la autoridad del programa.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, mkdtempSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { INLINE_EXPR } from './fanout-facts.mjs';
import {
  OUTPUT_PATH,
  PACKAGE_ROOT,
  ROOT_PATTERN,
  UNATTRIBUTED_PREFIX,
  CASCADE_ROOTS_DIR,
  CASCADE_ROOTS_REL,
  NOT_MEASURABLE_REASONS,
  ROOT_PROVENANCE,
  lineOfLiteral,
  lineOfRootChannelKey,
  citeLiteral,
  artifactDeclarations,
  classifyManifestRoot,
  loadManifestRoots,
  mergeRoots,
  ownerFamily,
  blankCssComments,
  selectorsAtLine,
  classesInSelectors,
  resolveSite,
  cssPropertyVocabulary,
  toKebab,
  buildGraph,
  closureFrom,
  checklistFor,
  loadCanon,
  loadFacts,
  discoverRoots,
  buildChecklists,
  serialize,
  toMarkdown,
} from './root-checklist.mjs';

/* ─────────────────────────────────────────────────────────────────────────
 * Ayudas sinteticas
 * ───────────────────────────────────────────────────────────────────────── */

function reader(plane, file, line, prop) {
  return { plane, file, line, prop, scalars: [] };
}

function channel(name, readers, extra = {}) {
  return {
    channel: name,
    kind: name.startsWith('--_ds-') ? 'bridge' : 'ds',
    declaredIn: extra.declaredIn ?? [],
    readers,
    planes: [...new Set(readers.map((r) => r.plane))].sort(),
    paints: extra.paints ?? true,
    paintsInModern: extra.paintsInModern ?? true,
  };
}

const MODERN = 'src/foundation/tokens/css/runtime/engines/modern/skin';

/** Fuentes sinteticas: los tests unitarios no leen disco. */
function cache(entries) {
  return new Map(Object.entries(entries));
}

function fakeCanon(overrides = {}) {
  return {
    denominator: 255,
    familyIds: overrides.familyIds ?? new Set(['primitive/display/badge', 'primitive/layout/card']),
    owners: overrides.owners ?? [
      { id: 'primitive/display/badge', owner: 'src/ui/primitives/display/Badge' },
    ],
    bindings: overrides.bindings ?? new Map(),
    classIndex: overrides.classIndex ?? new Map(),
  };
}

/* ─────────────────────────────────────────────────────────────────────────
 * Canon: duenos y clases
 * ───────────────────────────────────────────────────────────────────────── */

test('ownerFamily resuelve por el prefijo sourceOwner mas largo', () => {
  const owners = [
    { id: 'chart/basic/area-chart', owner: 'src/ui/patterns/visualization/charts/families/area-chart' },
    { id: 'pattern/visualization/charts', owner: 'src/ui/patterns/visualization' },
  ].sort((a, b) => b.owner.length - a.owner.length);
  assert.equal(
    ownerFamily(owners, 'src/ui/patterns/visualization/charts/families/area-chart/index.tsx'),
    'chart/basic/area-chart',
    'gana el prefijo mas largo, no el primero',
  );
  assert.equal(ownerFamily(owners, 'src/ui/patterns/visualization/otro/index.tsx'), 'pattern/visualization/charts');
  assert.equal(ownerFamily(owners, 'src/entrypoints/public/index.ts'), null);
});

test('un prefijo solo cuenta en frontera de carpeta', () => {
  const owners = [{ id: 'x', owner: 'src/ui/primitives/display/Badge' }];
  assert.equal(ownerFamily(owners, 'src/ui/primitives/display/BadgeGroup/index.tsx'), null);
  assert.equal(ownerFamily(owners, 'src/ui/primitives/display/Badge/index.tsx'), 'x');
});

/* ─────────────────────────────────────────────────────────────────────────
 * Selector CSS
 * ───────────────────────────────────────────────────────────────────────── */

test('blankCssComments no mueve un offset ni una linea', () => {
  const src = 'a {\n  /* var(--ds-x)\n     sigue */ color: red;\n}\n';
  const out = blankCssComments(src);
  assert.equal(out.length, src.length);
  assert.equal(out.split('\n').length, src.split('\n').length);
  assert.equal(out.includes('var(--ds-x)'), false, 'el var() comentado desaparece');
  assert.ok(out.includes('color: red'));
});

test('selectorsAtLine devuelve el bloque que pinta y descarta at-rules', () => {
  const css = [
    '@media (min-width: 40rem) {',      // 1
    '  .ds-card {',                     // 2
    '    padding: var(--ds-spacing-4);',// 3
    '  }',                              // 4
    '}',                                // 5
    '.ds-badge { gap: 1px; }',          // 6
  ].join('\n');
  assert.deepEqual(selectorsAtLine(css, 3), ['.ds-card']);
  assert.deepEqual(selectorsAtLine(css, 6), ['.ds-badge'], 'un bloque de una sola linea no pierde su selector');
});

test('selectorsAtLine: la pila mas profunda de la linea gana', () => {
  const css = '@media print { .ds-a { color: var(--ds-x); } }';
  assert.deepEqual(selectorsAtLine(css, 1), ['.ds-a']);
});

test('classesInSelectors extrae las clases de un selector compuesto', () => {
  const cls = classesInSelectors(['.ds-card.is-active > .ds-card__body']);
  assert.deepEqual([...cls].sort(), ['ds-card', 'ds-card__body', 'is-active']);
});

/* ─────────────────────────────────────────────────────────────────────────
 * Atribucion (RULING 1)
 * ───────────────────────────────────────────────────────────────────────── */

test('resolveSite 1: una ruta bajo un sourceOwner gana sin mirar nada mas', () => {
  const site = { file: 'src/ui/primitives/display/Badge/engines/modern/index.tsx', line: 52, prop: 'paddingInline' };
  const out = resolveSite(site, fakeCanon(), new Map());
  assert.deepEqual(out, { families: ['primitive/display/badge'], resolvedBy: 'source-owner' });
});

test('resolveSite 2: el selector de clase cruzado con el binding del canon', () => {
  const cache = new Map([['x.css', '.ds-card { gap: 1px; }']]);
  const canon = fakeCanon({
    classIndex: new Map([['ds-card', new Set(['primitive/layout/card', 'primitive/display/badge'])]]),
    bindings: new Map([['x.css', new Set(['primitive/layout/card'])]]),
  });
  const out = resolveSite({ file: 'x.css', line: 1, prop: 'gap' }, canon, cache);
  assert.equal(out.resolvedBy, 'class+binding');
  assert.deepEqual(out.families, ['primitive/layout/card'], 'el cruce descarta la familia que el canon no ata');
});

test('resolveSite 3: solo clase cuando el canon no ata el archivo', () => {
  const cache = new Map([['x.css', '.ds-card { gap: 1px; }']]);
  const canon = fakeCanon({ classIndex: new Map([['ds-card', new Set(['primitive/layout/card'])]]) });
  const out = resolveSite({ file: 'x.css', line: 1, prop: 'gap' }, canon, cache);
  assert.equal(out.resolvedBy, 'class');
  assert.deepEqual(out.families, ['primitive/layout/card']);
});

test('resolveSite 4 y 5: binding univoco y binding multiple', () => {
  const cache = new Map([['x.css', ':root { gap: 1px; }']]);
  const uno = resolveSite({ file: 'x.css', line: 1, prop: 'gap' },
    fakeCanon({ bindings: new Map([['x.css', new Set(['primitive/layout/card'])]]) }), cache);
  assert.equal(uno.resolvedBy, 'binding');
  const varias = resolveSite({ file: 'x.css', line: 1, prop: 'gap' },
    fakeCanon({ bindings: new Map([['x.css', new Set(['b', 'a'])]]) }), cache);
  assert.equal(varias.resolvedBy, 'binding-multi');
  assert.deepEqual(varias.families, ['a', 'b'], 'sale ordenado');
});

test('resolveSite 6: lo que no resuelve cae en un bucket explicito, no se fuerza', () => {
  const cache = new Map([['huerfano.css', ':root { gap: 1px; }']]);
  const out = resolveSite({ file: 'huerfano.css', line: 1, prop: 'gap' }, fakeCanon(), cache);
  assert.equal(out.resolvedBy, 'unattributed');
  assert.deepEqual(out.families, [`${UNATTRIBUTED_PREFIX}/huerfano.css`]);
});

/* ─────────────────────────────────────────────────────────────────────────
 * Vocabulario derivado
 * ───────────────────────────────────────────────────────────────────────── */

test('toKebab: claves JS de estilo y su forma CSS', () => {
  assert.equal(toKebab('paddingInline'), 'padding-inline');
  assert.equal(toKebab('md'), 'md');
  assert.equal(toKebab('WebkitMaskImage'), '-webkit-mask-image');
});

test('cssPropertyVocabulary sale solo de planos CSS', () => {
  const facts = {
    channels: [
      channel('--ds-a', [
        reader('modern-skin-css', `${MODERN}/a.css`, 1, 'padding-inline'),
        reader('modern-skin-css', `${MODERN}/a.css`, 2, '--ds-otro'),
        reader('modern-skin-css', `${MODERN}/a.css`, 3, '@media'),
        reader('modern-skin-css', `${MODERN}/a.css`, 4, INLINE_EXPR),
        reader('tsx-inline-stamp', 'src/ui/primitives/display/Badge/index.tsx', 5, 'md'),
      ]),
    ],
  };
  const vocab = cssPropertyVocabulary(facts);
  assert.deepEqual([...vocab].sort(), ['padding-inline']);
  assert.equal(vocab.has('md'), false);
});

/* ─────────────────────────────────────────────────────────────────────────
 * Grafo (RULING 2)
 * ───────────────────────────────────────────────────────────────────────── */

test('buildGraph: el puente --_ds-* es una arista, no un corte', () => {
  // Fuente real del patron: `--_ds-tag-root-height: var(--ds-tag-xs-height);`
  const facts = {
    channels: [
      channel('--ds-tag-xs-height', [reader('modern-skin-css', `${MODERN}/tag.css`, 68, '--_ds-tag-root-height')]),
      channel('--_ds-tag-root-height', [reader('modern-skin-css', `${MODERN}/tag.css`, 100, 'height')]),
    ],
  };
  const g = buildGraph(facts, fakeCanon(), undefined, cache({ [`${MODERN}/tag.css`]: ':root { height: 1px; }' }));
  assert.deepEqual([...g.edges.get('--ds-tag-xs-height')], ['--_ds-tag-root-height']);
  assert.equal(g.foreign.has('--ds-tag-xs-height'), false, 'ya no se cuenta como corte fuera de alcance');
});

test('buildGraph: una custom property de otro sistema si corta', () => {
  // Los tres cortes reales de --ds-radius-scale son variables DaisyUI.
  const facts = {
    channels: [channel('--ds-raiz', [reader('modern-skin-css', `${MODERN}/b.css`, 1, '--radius-box')])],
  };
  const g = buildGraph(facts, fakeCanon(), undefined, cache({ [`${MODERN}/b.css`]: ':root { --radius-box: 1px; }' }));
  assert.equal(g.edges.has('--ds-raiz'), false);
  assert.equal(g.foreign.get('--ds-raiz'), 1);
});

test('buildGraph: una clave de tabla de lookup se descarta y queda auditable', () => {
  // src/ui/primitives/feedback/Modal/engines/rustic/index.tsx: RADIUS_STYLES
  const facts = {
    channels: [
      channel('--ds-modal-radius-md', [
        reader('tsx-inline-stamp', 'src/ui/primitives/feedback/Modal/engines/rustic/index.tsx', 140, 'md'),
      ]),
      channel('--ds-otro', [reader('modern-skin-css', `${MODERN}/d.css`, 1, 'border-radius')]),
    ],
  };
  const g = buildGraph(facts, fakeCanon(), undefined, cache({ [`${MODERN}/d.css`]: ':root { border-radius: 1px; }' }));
  assert.equal(g.paintSites.has('--ds-modal-radius-md'), false);
  assert.equal(g.lookupKeys.length, 1);
  assert.equal(g.lookupKeys[0].key, 'md');
});

test('buildGraph: un estampado inline con propiedad real SI aterriza', () => {
  const facts = {
    channels: [
      channel('--ds-badge-sm-padding-x', [
        reader('tsx-inline-stamp', 'src/ui/primitives/display/Badge/engines/modern/index.tsx', 52, 'paddingInline'),
      ]),
      channel('--ds-vocab', [reader('modern-skin-css', `${MODERN}/e.css`, 1, 'padding-inline')]),
    ],
  };
  const g = buildGraph(facts, fakeCanon(), undefined, cache({ [`${MODERN}/e.css`]: ':root { padding-inline: 1px; }' }));
  const sites = g.paintSites.get('--ds-badge-sm-padding-x');
  assert.equal(sites.length, 1);
  assert.deepEqual(sites[0].families, ['primitive/display/badge']);
});

test('closureFrom: el cierre estrecho reconstruye el total previo al ensanche', () => {
  const edges = new Map([
    ['--ds-a', new Set(['--ds-b', '--_ds-p'])],
    ['--_ds-p', new Set(['--ds-solo-por-puente'])],
  ]);
  const ancho = closureFrom('--ds-a', edges, true).depth;
  const estrecho = closureFrom('--ds-a', edges, false).depth;
  assert.deepEqual([...ancho.keys()].sort(), ['--_ds-p', '--ds-a', '--ds-b', '--ds-solo-por-puente']);
  assert.deepEqual([...estrecho.keys()].sort(), ['--ds-a', '--ds-b']);
  assert.equal(ancho.size - estrecho.size, 2, 'el delta es derivable por resta');
});

test('closureFrom: sin ciclo infinito', () => {
  const edges = new Map([['--ds-a', new Set(['--ds-b'])], ['--ds-b', new Set(['--ds-a'])]]);
  assert.equal(closureFrom('--ds-a', edges).depth.size, 2);
});

/* ─────────────────────────────────────────────────────────────────────────
 * Checklist
 * ───────────────────────────────────────────────────────────────────────── */

function sampleFacts() {
  return {
    channels: [
      channel('--ds-x-scale', [reader('modern-skin-css', `${MODERN}/f.css`, 2, '--ds-x-gap')]),
      channel('--ds-x-gap', [
        reader('modern-skin-css', `${MODERN}/f.css`, 5, 'gap'),
        reader('modern-skin-css', `${MODERN}/f.css`, 6, 'column-gap'),
        reader('modern-skin-css', `${MODERN}/f.css`, 7, 'gap'),
        reader('modern-skin-css', `${MODERN}/f.css`, 8, '--ds-x-hueco'),
      ]),
      channel('--ds-x-hueco', [], { paints: false, paintsInModern: false, declaredIn: [`${MODERN}/f.css`] }),
    ],
  };
}

const SAMPLE_CSS = cache({
  [`${MODERN}/f.css`]: [
    ':root {',
    '  --ds-x-gap: var(--ds-x-scale);',
    '}',
    '.ds-sample {',
    '  gap: var(--ds-x-gap);',
    '  column-gap: var(--ds-x-gap);',
    '  gap: var(--ds-x-gap);',
    '  --ds-x-hueco: var(--ds-x-gap);',
    '}',
  ].join('\n'),
});

function sampleCanon() {
  return fakeCanon({ bindings: new Map([[`${MODERN}/f.css`, new Set(['primitive/layout/card'])]]) });
}

test('checklistFor: un canal genera UNA entrada por familia, con props y archivos', () => {
  const facts = sampleFacts();
  const canon = sampleCanon();
  const entry = checklistFor('--ds-x-scale', buildGraph(facts, canon, undefined, new Map(SAMPLE_CSS)), new Map(facts.channels.map((c) => [c.channel, c])), canon);

  assert.equal(entry.families.length, 1);
  const fam = entry.families[0];
  assert.equal(fam.family, 'primitive/layout/card');
  assert.equal(fam.manifestFamily, true, 'la familia esta en el canon, asi que cuenta para el denominador');
  assert.equal(fam.channels, 1, 'tres sitios del mismo canal no son tres filas');
  assert.deepEqual(fam.rows[0].props, ['column-gap', 'gap']);
  assert.deepEqual(fam.rows[0].files, [`${MODERN}/f.css`], 'el archivo sobrevive como dato secundario');
});

test('checklistFor: el canal sin pintura es trabajo pendiente, no ruido', () => {
  const facts = sampleFacts();
  const canon = sampleCanon();
  const entry = checklistFor('--ds-x-scale', buildGraph(facts, canon, undefined, new Map(SAMPLE_CSS)), new Map(facts.channels.map((c) => [c.channel, c])), canon);
  assert.equal(entry.summary.channelsInCascade, 3);
  assert.equal(entry.summary.channelsPainting, 1);
  assert.equal(entry.summary.channelsUnreached, 2);
  assert.deepEqual(entry.unreached.map((u) => u.channel).sort(), ['--ds-x-hueco', '--ds-x-scale']);
});

test('checklistFor: el bucket sin familia se cuenta y se lista', () => {
  const facts = sampleFacts();
  const canon = fakeCanon();
  const entry = checklistFor('--ds-x-scale', buildGraph(facts, canon, undefined, new Map(SAMPLE_CSS)), new Map(facts.channels.map((c) => [c.channel, c])), canon);
  assert.equal(entry.summary.unattributedFiles, 1);
  assert.equal(entry.summary.unattributedSites, 3);
  assert.deepEqual(entry.unattributed, [{ file: `${MODERN}/f.css`, sites: 3 }]);
  assert.equal(entry.summary.manifestFamilies, 0);
});

/* ─────────────────────────────────────────────────────────────────────────
 * Integracion contra los hechos y el canon reales
 * ───────────────────────────────────────────────────────────────────────── */

const facts = loadFacts();
const canon = loadCanon();

test('el canon cargado son las 255 filas del manifiesto', () => {
  assert.equal(canon.denominator, 255);
  assert.equal(canon.familyIds.size, 255);
  assert.equal(canon.owners.length, 255);
  assert.ok(canon.classIndex.size > 1000, 'el indice de clases no puede venir vacio');
});

test('discoverRoots: toda raiz automatica es un canal escalar existente', () => {
  const roots = discoverRoots(facts);
  const known = new Set(facts.channels.map((c) => c.channel));
  assert.ok(roots.length > 0);
  for (const r of roots) {
    assert.match(r, ROOT_PATTERN);
    assert.ok(known.has(r));
  }
  assert.deepEqual(roots, [...roots].sort());
});

test('la salida es determinista y coincide con el archivo en disco', () => {
  const a = serialize(buildChecklists(facts, canon));
  const b = serialize(buildChecklists(facts, canon));
  assert.equal(a, b, 'dos corridas dan el mismo byte');
  assert.equal(readFileSync(OUTPUT_PATH, 'utf8'), a, '--check tiene que dar verde');
});

test('el documento no contiene rutas absolutas', () => {
  const text = readFileSync(OUTPUT_PATH, 'utf8');
  assert.equal(text.includes('/Users/'), false);
  assert.equal(text.includes(process.cwd()), false);
});

test('invariante: ninguna propiedad pintada es `?` ni una expresion suelta', () => {
  const doc = JSON.parse(readFileSync(OUTPUT_PATH, 'utf8'));
  for (const root of doc.roots) {
    for (const c of root.channels) {
      for (const s of c.sites) {
        assert.notEqual(s.prop, '?', `${c.channel} en ${s.file}:${s.line}`);
        assert.notEqual(s.prop, INLINE_EXPR);
      }
    }
  }
});

test('invariante: los totales cierran y el numero solo-ds es derivable', () => {
  const doc = JSON.parse(readFileSync(OUTPUT_PATH, 'utf8'));
  for (const root of doc.roots) {
    const s = root.summary;
    assert.equal(s.channelsInCascade, s.channelsPainting + s.channelsUnreached, root.root);
    assert.equal(s.channelsInCascade, s.channelsInCascadeDs + s.channelsInCascadeViaBridge, root.root);
    assert.equal(s.channelsInCascadeDs, s.channelsPaintingDs + s.channelsUnreachedDs, root.root);
    assert.equal(root.bridgeDelta.length, s.channelsInCascadeViaBridge, root.root);
    assert.equal(root.channels.filter((c) => c.edgeKind === 'ds').length, s.channelsInCascadeDs, root.root);
    assert.ok(s.manifestFamilies <= s.manifestDenominator, root.root);
  }
});

test('invariante: el delta puente trae genealogia y todo puente es --_ds-', () => {
  const doc = JSON.parse(readFileSync(OUTPUT_PATH, 'utf8'));
  for (const root of doc.roots) {
    const inCascade = new Set(root.channels.map((c) => c.channel));
    for (const b of root.bridgeDelta) {
      assert.ok(b.parent === null || inCascade.has(b.parent), `${root.root} → ${b.channel} sin padre en la cascada`);
      assert.ok(b.viaBridge === null || b.viaBridge.startsWith('--_ds-'), `${root.root} → ${b.channel}`);
    }
  }
});

test('invariante: toda familia no marcada como del manifiesto es del bucket', () => {
  const doc = JSON.parse(readFileSync(OUTPUT_PATH, 'utf8'));
  for (const root of doc.roots) {
    for (const f of root.families) {
      if (f.manifestFamily) {
        assert.ok(canon.familyIds.has(f.family), `${root.root} → ${f.family}`);
      } else {
        assert.match(f.family, new RegExp(`^${UNATTRIBUTED_PREFIX}/`), `${root.root} → ${f.family}`);
      }
    }
  }
});

test('control: --ds-radius-scale, cifras solo-ds y delta puente', () => {
  const doc = JSON.parse(readFileSync(OUTPUT_PATH, 'utf8'));
  const radius = doc.roots.find((r) => r.root === '--ds-radius-scale');
  assert.ok(radius);
  // Solo-ds reproduce exactamente lo que da el cierre sin aristas puente.
  assert.equal(radius.summary.channelsInCascadeDs, 107);
  assert.equal(radius.summary.channelsPaintingDs, 72);
  assert.equal(radius.summary.channelsInCascadeViaBridge, 9);
  assert.ok(radius.summary.discardedLookupKeys > 0, 'el descarte queda auditable');
});

test('el puente --_ds-button-resolved-radius entra por --ds-radius-lg', () => {
  const doc = JSON.parse(readFileSync(OUTPUT_PATH, 'utf8'));
  const radius = doc.roots.find((r) => r.root === '--ds-radius-scale');
  const row = radius.bridgeDelta.find((b) => b.channel === '--_ds-button-resolved-radius');
  assert.ok(row, 'tiene que estar en el delta');
  assert.equal(row.parent, '--ds-radius-lg');
  assert.equal(row.paints, true);
});

test('toMarkdown rinde las secciones sin romperse', () => {
  const graph = buildGraph(facts, canon);
  const byChannel = new Map(facts.channels.map((c) => [c.channel, c]));
  const md = toMarkdown(checklistFor('--ds-rhythm-scale', graph, byChannel, canon));
  assert.match(md, /^# Checklist de raiz — `--ds-rhythm-scale`/);
  assert.ok(md.includes('## Familias del manifiesto'));
  assert.ok(md.includes('## Canales de la cascada'));
  assert.ok(md.includes('Sin llegar a pintura'));
  assert.equal(md.includes('| ? |'), false);
});

/* ─────────────────────────────────────────────────────────────────────────
 * Segunda fuente de raices: los manifiestos de cascada
 *
 * El patron `-scale` solo alcanza DIALES NUMERICOS. Los ejes autorados
 * (color, familias tipograficas, anatomia, elevacion, tono de sidebar) viven
 * en `cascade/roots/*.json`. Estos tests cubren el descubrimiento, la union,
 * la procedencia y los casos borde declarados.
 * ───────────────────────────────────────────────────────────────────────── */

function tempRootsDir(files) {
  const dir = mkdtempSync(path.join(tmpdir(), 'cascade-roots-'));
  for (const [name, body] of Object.entries(files)) {
    writeFileSync(path.join(dir, name), typeof body === 'string' ? body : `${JSON.stringify(body, null, 2)}\n`);
  }
  return dir;
}

function manifestFile(name, body) {
  const text = typeof body === 'string' ? body : `${JSON.stringify(body, null, 2)}\n`;
  return { name, rel: `${CASCADE_ROOTS_REL}/${name}`, text, doc: JSON.parse(text) };
}

test('lineOfLiteral y lineOfRootChannelKey citan la linea real, 1-based', () => {
  const text = ['{', '  "rootId": "x",', '  "rootChannel": {', '    "channel": "--ds-a"', '  }', '}'].join('\n');
  assert.equal(lineOfLiteral(text, '"rootId"'), 2);
  assert.equal(lineOfRootChannelKey(text), 4);
  assert.equal(lineOfLiteral(text, 'no-esta'), null);
});

test('lineOfRootChannelKey no confunde "channels" con "channel"', () => {
  const text = ['{', '  "channels": [],', '  "rootChannel": {', '    "channel": null', '  }', '}'].join('\n');
  assert.equal(lineOfRootChannelKey(text), 4, 'salta la clave plural y cae en la cabeza real');
});

test('citeLiteral resuelve rutas con y sin el prefijo packages/core', () => {
  const conPrefijo = citeLiteral('packages/core/manifest/fanout-facts.mjs', 'EXCLUDED_PREFIXES = [');
  const sinPrefijo = citeLiteral('manifest/fanout-facts.mjs', 'EXCLUDED_PREFIXES = [');
  assert.equal(conPrefijo, sinPrefijo, 'el prefijo del paquete se normaliza');
  // La cita es relativa al PAQUETE. El prefijo concreto no era la ley: cuando el
  // manifiesto vivia bajo `scripts/`, esta asercion pineaba ese segmento y se
  // volvia falsa al mudarlo. Se exige lo que siempre quiso decir: ni ruta
  // absoluta, ni el prefijo del paquete, y con cita `archivo:linea`.
  assert.match(
    conPrefijo,
    /^(?!\/)(?!packages\/core\/).+:\d+$/,
    'la cita es relativa al paquete, nunca absoluta ni con el prefijo del paquete',
  );
  assert.equal(citeLiteral('src/no/existe.ts', 'x'), null, 'un archivo ausente no revienta');
});

test('classifyManifestRoot: una cabeza --ds-* presente en los hechos es medible', () => {
  const out = classifyManifestRoot(
    manifestFile('shape.radius-scale.json', { rootId: 'shape.radius-scale', rootChannel: { channel: '--ds-radius-scale', emission: [] } }),
    new Set(['--ds-radius-scale']),
  );
  assert.equal(out.measurable, true);
  assert.equal(out.rootChannel, '--ds-radius-scale');
  assert.equal(out.reasonCode, null);
  assert.equal(out.notMeasurableReason, null);
  assert.match(out.declaredAt, new RegExp(`^${CASCADE_ROOTS_REL}/shape\\.radius-scale\\.json:\\d+$`));
});

test('caso borde 1 — rootChannel null: no revienta y declara su motivo', () => {
  const out = classifyManifestRoot(
    manifestFile('responsive.posture.json', {
      rootId: 'responsive.posture',
      rootChannel: { channel: null, headEmptyReason: 'el eje es DATO', emission: [] },
    }),
    new Set(),
  );
  assert.equal(out.measurable, false);
  assert.equal(out.rootChannel, null);
  assert.equal(out.reasonCode, 'no-css-head');
  assert.ok(NOT_MEASURABLE_REASONS.includes(out.reasonCode));
  assert.match(out.notMeasurableReason, /rootChannel\.channel es null/);
  assert.match(out.notMeasurableReason, new RegExp(`${CASCADE_ROOTS_REL}/responsive\\.posture\\.json:\\d+`), 'lleva cita archivo:linea');
  assert.ok(out.evidence.length >= 1);
});

test('caso borde 2 — cabeza que es ATRIBUTO, no custom property', () => {
  const out = classifyManifestRoot(
    manifestFile('chrome.anatomy.json', { rootId: 'chrome.anatomy', rootChannel: { channel: 'data-anatomy-card', emission: [] } }),
    new Set(['--ds-radius-scale']),
  );
  assert.equal(out.measurable, false);
  assert.equal(out.reasonCode, 'attribute-not-custom-property');
  assert.match(out.notMeasurableReason, /ATRIBUTO de raiz/);
  assert.match(out.notMeasurableReason, new RegExp(`${CASCADE_ROOTS_REL}/chrome\\.anatomy\\.json:\\d+`));
});

test('un --ds-* declarado pero ausente de los hechos no se descarta en silencio', () => {
  const out = classifyManifestRoot(
    manifestFile('recipe-profile.json', { rootId: 'recipe-profile', rootChannel: { channel: '--ds-recipe-profile', emission: [] } }),
    new Set(['--ds-radius-scale']),
  );
  assert.equal(out.measurable, false);
  assert.equal(out.reasonCode, 'absent-from-fanout-facts');
  assert.match(out.notMeasurableReason, /no existe como canal en generated\/fanout-facts\.json/);
});

test('loadManifestRoots lee el directorio completo, ordenado y sin escribir nada', () => {
  const dir = tempRootsDir({
    'b.eje.json': { rootId: 'b.eje', rootChannel: { channel: '--ds-b', emission: [] } },
    'a.eje.json': { rootId: 'a.eje', rootChannel: { channel: null, emission: [] } },
    'notas.md': '# no es json',
  });
  try {
    const out = loadManifestRoots(new Set(['--ds-b']), dir, PACKAGE_ROOT, CASCADE_ROOTS_REL);
    assert.deepEqual(out.map((r) => r.rootId), ['a.eje', 'b.eje'], 'orden estable por nombre de archivo');
    assert.deepEqual(out.map((r) => r.measurable), [false, true]);
    assert.deepEqual(readdirSync(dir).sort(), ['a.eje.json', 'b.eje.json', 'notas.md'], 'el directorio queda intacto');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('loadManifestRoots con un directorio ausente devuelve vacio en vez de reventar', () => {
  assert.deepEqual(loadManifestRoots(new Set(), path.join(tmpdir(), 'no-existe-cascade-roots')), []);
});

test('mergeRoots: la union no duplica y la procedencia es exacta', () => {
  const synthetic = {
    channels: [
      { channel: '--ds-radius-scale' },
      { channel: '--ds-type-scale' },
      { channel: '--ds-color-primary' },
      { channel: '--ds-suelto' },
    ],
  };
  const declared = [
    { rootId: 'shape.radius-scale', rootChannel: '--ds-radius-scale', measurable: true },
    { rootId: 'palette.seeds', rootChannel: '--ds-color-primary', measurable: true },
    { rootId: 'responsive.posture', rootChannel: null, measurable: false },
  ];
  const { roots, provenance } = mergeRoots(synthetic, ['--ds-suelto'], declared);

  assert.deepEqual(roots, ['--ds-color-primary', '--ds-radius-scale', '--ds-suelto', '--ds-type-scale']);
  assert.equal(roots.length, new Set(roots).size, 'sin duplicados');
  assert.equal(provenance.get('--ds-radius-scale').discoveredBy, 'both');
  assert.equal(provenance.get('--ds-radius-scale').rootId, 'shape.radius-scale');
  assert.equal(provenance.get('--ds-type-scale').discoveredBy, 'pattern');
  assert.equal(provenance.get('--ds-type-scale').rootId, null);
  assert.equal(provenance.get('--ds-color-primary').discoveredBy, 'manifest');
  assert.equal(provenance.get('--ds-color-primary').rootId, 'palette.seeds');
  assert.equal(provenance.get('--ds-suelto').discoveredBy, 'explicit');
  for (const p of provenance.values()) assert.ok(ROOT_PROVENANCE.includes(p.discoveredBy));
});

test('mergeRoots: una raiz NO medible nunca entra en la lista de raices', () => {
  const synthetic = { channels: [{ channel: '--ds-x-scale' }, { channel: 'data-anatomy-card' }] };
  const declared = [{ rootId: 'chrome.anatomy', rootChannel: 'data-anatomy-card', measurable: false }];
  const { roots } = mergeRoots(synthetic, [], declared);
  assert.deepEqual(roots, ['--ds-x-scale'], 'la cabeza no medible no se cuela por la puerta de atras');
});

test('mergeRoots: el patron sigue midiendo exactamente lo que media', () => {
  const patternOnly = mergeRoots(facts, [], []).roots;
  const conManifiesto = mergeRoots(facts, [], loadManifestRoots(new Set(facts.channels.map((c) => c.channel)))).roots;
  assert.deepEqual(patternOnly, discoverRoots(facts), 'sin manifiestos, la union es el patron puro');
  for (const r of patternOnly) assert.ok(conManifiesto.includes(r), `el ensanche perdio la raiz ${r}`);
  assert.ok(conManifiesto.length > patternOnly.length, 'el manifiesto aporta raices nuevas');
});

/* ─────────────────────────────────────────────────────────────────────────
 * Integracion: manifiestos reales y documento generado
 * ───────────────────────────────────────────────────────────────────────── */

const declaredRoots = loadManifestRoots(new Set(facts.channels.map((c) => c.channel)));

test('los 20 manifiestos de cascada se clasifican todos, sin excepcion', () => {
  const onDisk = readdirSync(CASCADE_ROOTS_DIR).filter((n) => n.endsWith('.json')).sort();
  assert.equal(declaredRoots.length, onDisk.length, 'ni uno se pierde por el camino');
  assert.deepEqual(declaredRoots.map((r) => `${r.rootId}.json`), onDisk, 'rootId y nombre de archivo coinciden');
  for (const r of declaredRoots) {
    assert.equal(typeof r.measurable, 'boolean');
    if (r.measurable) continue;
    assert.ok(NOT_MEASURABLE_REASONS.includes(r.reasonCode), `${r.rootId} → ${r.reasonCode}`);
    assert.equal(typeof r.notMeasurableReason, 'string');
    assert.ok(r.notMeasurableReason.length > 0);
  }
});

test('los casos borde reales estan declarados, no silenciados', () => {
  const doc = JSON.parse(readFileSync(OUTPUT_PATH, 'utf8'));
  const byId = new Map(doc.notMeasurableRoots.map((n) => [n.rootId, n]));

  const posture = byId.get('responsive.posture');
  assert.ok(posture, 'responsive.posture tiene entrada propia');
  assert.equal(posture.rootChannel, null);
  assert.equal(posture.reasonCode, 'no-css-head');

  const anatomy = byId.get('chrome.anatomy');
  assert.ok(anatomy, 'chrome.anatomy tiene entrada propia');
  assert.equal(anatomy.rootChannel, 'data-anatomy-card');
  assert.equal(anatomy.reasonCode, 'attribute-not-custom-property');

  // Ninguno de los dos puede aparecer como raiz con cascada 0 sin explicacion.
  const rootChannels = new Set(doc.roots.map((r) => r.root));
  assert.equal(rootChannels.has('data-anatomy-card'), false);
  assert.equal(doc.roots.some((r) => r.rootId === 'responsive.posture'), false);
  assert.equal(doc.roots.some((r) => r.rootId === 'chrome.anatomy'), false);
});

test('toda cita archivo:linea de una raiz no medible existe en disco', () => {
  const doc = JSON.parse(readFileSync(OUTPUT_PATH, 'utf8'));
  assert.ok(doc.notMeasurableRoots.length > 0);
  for (const n of doc.notMeasurableRoots) {
    assert.ok(n.evidence.length > 0, `${n.rootId} sin evidencia`);
    for (const cite of n.evidence) {
      const m = /^(.+):(\d+)$/.exec(cite);
      assert.ok(m, `${n.rootId} → cita mal formada: ${cite}`);
      const abs = path.join(PACKAGE_ROOT, m[1]);
      assert.ok(existsSync(abs), `${n.rootId} → no existe ${m[1]}`);
      const lines = readFileSync(abs, 'utf8').split('\n');
      assert.ok(Number(m[2]) >= 1 && Number(m[2]) <= lines.length, `${n.rootId} → linea fuera de rango: ${cite}`);
    }
    // La prosa tiene que llevar al menos una de sus propias citas.
    assert.ok(n.evidence.some((c) => n.notMeasurableReason.includes(c)), `${n.rootId} → el motivo no cita nada`);
  }
});

test('cada raiz del documento declara procedencia del vocabulario cerrado', () => {
  const doc = JSON.parse(readFileSync(OUTPUT_PATH, 'utf8'));
  const ids = new Set();
  for (const r of doc.roots) {
    assert.ok(ROOT_PROVENANCE.includes(r.discoveredBy), `${r.root} → ${r.discoveredBy}`);
    if (r.discoveredBy === 'manifest' || r.discoveredBy === 'both') {
      assert.equal(typeof r.rootId, 'string', `${r.root} viene del manifiesto y tiene que traer rootId`);
      assert.ok(r.rootIds.includes(r.rootId));
      assert.equal(ids.has(r.rootId), false, `rootId duplicado: ${r.rootId}`);
      ids.add(r.rootId);
    } else {
      assert.equal(r.rootId, null, `${r.root} no viene del manifiesto`);
      assert.deepEqual(r.rootIds, []);
    }
    if (r.discoveredBy === 'pattern' || r.discoveredBy === 'both') assert.match(r.root, ROOT_PATTERN);
    if (r.discoveredBy === 'manifest') assert.doesNotMatch(r.root, ROOT_PATTERN);
  }
});

test('los totales de raiz cierran entre las dos fuentes', () => {
  const doc = JSON.parse(readFileSync(OUTPUT_PATH, 'utf8'));
  const s = doc.summary;
  const p = s.rootsByProvenance;
  assert.equal(s.roots, doc.roots.length);
  assert.equal(s.roots, p.pattern + p.manifest + p.both + p.explicit);
  assert.equal(s.manifestRootsDeclared, s.manifestRootsMeasurable + s.manifestRootsNotMeasurable);
  assert.equal(s.manifestRootsNotMeasurable, doc.notMeasurableRoots.length);
  assert.equal(s.manifestRootsMeasurable, p.manifest + p.both, 'toda raiz medible del manifiesto es una fila del documento');
  assert.equal(p.pattern + p.both, discoverRoots(facts).length, 'el patron no perdio ni gano una raiz');
  assert.equal(doc.roots.length, new Set(doc.roots.map((r) => r.root)).size, 'sin canales repetidos');
});

test('no se pierde ninguna raiz declarada: cada una es fila o esta justificada', () => {
  const doc = JSON.parse(readFileSync(OUTPUT_PATH, 'utf8'));
  const medidas = new Set(doc.roots.filter((r) => r.rootId).map((r) => r.rootId));
  const justificadas = new Set(doc.notMeasurableRoots.map((n) => n.rootId));
  for (const d of declaredRoots) {
    assert.ok(medidas.has(d.rootId) || justificadas.has(d.rootId), `${d.rootId} desaparecio de la salida`);
    assert.equal(medidas.has(d.rootId) && justificadas.has(d.rootId), false, `${d.rootId} esta en los dos lados`);
  }
});

test('rootSources declara las dos fuentes y sus vocabularios', () => {
  const doc = JSON.parse(readFileSync(OUTPUT_PATH, 'utf8'));
  assert.equal(doc.rootSources.pattern, ROOT_PATTERN.source);
  assert.equal(doc.rootSources.manifest, CASCADE_ROOTS_REL);
  assert.deepEqual(doc.rootSources.provenanceVocabulary, ROOT_PROVENANCE);
  assert.deepEqual(doc.rootSources.notMeasurableVocabulary, NOT_MEASURABLE_REASONS);
  assert.equal(doc.rootPattern, ROOT_PATTERN.source, 'el campo previo sobrevive');
});

test('artifactDeclarations encuentra las declaraciones del corpus excluido', () => {
  const found = artifactDeclarations('--ds-recipe-profile');
  assert.ok(found.length > 0, 'el canal se declara en algun snapshot generado');
  for (const cite of found) {
    assert.match(cite, /^src\/foundation\/tokens\/css\/facade\/artifacts\/[^/]+\/index\.css:\d+$/);
  }
  assert.deepEqual(artifactDeclarations('--ds-canal-que-no-existe'), []);
});

test('control: las raices no-dial que solo el manifiesto alcanza estan medidas', () => {
  const doc = JSON.parse(readFileSync(OUTPUT_PATH, 'utf8'));
  const byId = new Map(doc.roots.filter((r) => r.rootId).map((r) => [r.rootId, r]));
  // Ninguna de estas cabezas termina en `-scale`: antes del ensanche eran invisibles.
  for (const id of ['palette.seeds', 'typography.families', 'surfaces.elevation-posture', 'navigation.sidebar-tone']) {
    const row = byId.get(id);
    assert.ok(row, `${id} tiene que estar medida`);
    assert.equal(row.discoveredBy, 'manifest');
    assert.doesNotMatch(row.root, ROOT_PATTERN);
    assert.ok(row.summary.channelsInCascade >= 1);
  }
});
