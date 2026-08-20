/**
 * fanout-facts.test.mjs — oraculo del generador de hechos de fan-out.
 *
 * Los casos marcados como ORACULO fueron verificados a mano en fuente por el
 * owner antes de escribir el generador. Si uno de ellos se pone rojo, lo que
 * esta mal es el generador (o la fuente cambio), nunca el oraculo.
 *
 *   node --test manifest/fanout-facts/index.test.mjs
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  OUTPUT_PATH,
  PLANES,
  PAINT_PLANES,
  MODERN_PAINT_PLANES,
  buildFacts,
  serialize,
  classifyPlane,
  isExcludedPath,
  isModernPaintReader,
  keepsDecl,
  scalarsInDeclaration,
  cssDeclarationAt,
  cssDeclarationSpanAt,
  tsDeclarationSpanAt,
  propertyForRead,
  INLINE_EXPR,
  stripCssComments,
  stripTsComments,
} from './index.mjs';

const facts = JSON.parse(readFileSync(OUTPUT_PATH, 'utf8'));
const byChannel = new Map(facts.channels.map((c) => [c.channel, c]));

const channel = (name) => {
  const row = byChannel.get(name);
  assert.ok(row, `el canal ${name} debe existir en los hechos generados`);
  return row;
};

const readersOn = (row, plane) => row.readers.filter((r) => r.plane === plane);

/* ── ORACULO 1 ─────────────────────────────────────────────────────────── */

test('ORACULO --ds-button-xs-padding-x: lector modern-skin-css en skin/button.css:342 con escalar de densidad', () => {
  const row = channel('--ds-button-xs-padding-x');
  const modern = readersOn(row, 'modern-skin-css');
  const hit = modern.find(
    (r) =>
      r.file === 'src/foundation/tokens/css/runtime/engines/modern/skin/button.css' &&
      r.line === 342,
  );
  assert.ok(hit, 'debe haber una lectura modern-skin-css en skin/button.css:342');
  assert.ok(
    hit.scalars.includes('--ds-density-effective-scale'),
    `scalars debe contener --ds-density-effective-scale, tiene ${JSON.stringify(hit.scalars)}`,
  );
  // la declaracion tiene calc(, asi que su texto se conserva como evidencia
  assert.ok(hit.decl, 'una lectura con calc() debe conservar su decl');
  assert.ok(hit.decl.includes('calc('));
  assert.ok(hit.decl.includes('--ds-density-effective-scale'));
  assert.equal(row.paints, true);
  assert.equal(row.paintsInModern, true);
});

/* ── ORACULO 2 ─────────────────────────────────────────────────────────── */

test('ORACULO --ds-badge-sm-padding-x: solo estampado inline en el tsx modern, sin skin CSS', () => {
  const row = channel('--ds-badge-sm-padding-x');
  const stamps = readersOn(row, 'tsx-inline-stamp');
  const hit = stamps.find(
    (r) => r.file === 'src/ui/primitives/display/Badge/engines/modern/index.tsx' && r.line === 52,
  );
  assert.ok(hit, 'debe haber un tsx-inline-stamp en Badge/engines/modern/index.tsx:52');
  // sin calc() en la declaracion, el texto no se conserva: file+line+scalars alcanzan
  assert.equal(hit.decl, undefined, 'una lectura sin calc() no debe cargar decl');
  assert.deepEqual(hit.scalars, []);
  assert.equal(
    readersOn(row, 'modern-skin-css').length,
    0,
    'no debe tener ningun lector en modern-skin-css',
  );
  assert.ok(!row.planes.includes('modern-skin-css'));
  assert.equal(row.paints, true, 'el estampado inline es plano de pintura');
  assert.equal(row.paintsInModern, true, 'el tsx vive bajo engines/modern/');
});

/* ── ORACULO 3 ─────────────────────────────────────────────────────────── */

test('ORACULO --ds-modal-margin: lectores solo en ts-token-mirror → paints=false', () => {
  const row = channel('--ds-modal-margin');
  assert.ok(row.readers.length > 0, 'debe tener al menos un lector');
  assert.deepEqual(row.planes, ['ts-token-mirror']);
  assert.equal(row.paints, false);
  assert.equal(row.paintsInModern, false);
});

/* ── ORACULO 4 ─────────────────────────────────────────────────────────── */

test('ORACULO --ds-input-success-message-margin-top: cero lectores → paints=false', () => {
  const row = channel('--ds-input-success-message-margin-top');
  assert.deepEqual(row.readers, []);
  assert.deepEqual(row.planes, []);
  assert.equal(row.paints, false);
  assert.equal(row.paintsInModern, false);
  assert.ok(
    row.declaredIn.includes('src/foundation/tokens/css/presentation/components/input.css'),
    'el canal esta declarado aunque nadie lo lea',
  );
});

/* ── ORACULO 5 ─────────────────────────────────────────────────────────── */

test('ORACULO --ds-card-grid-gap: lector presentation-css en patterns.css:500 con escalar de ritmo', () => {
  const row = channel('--ds-card-grid-gap');
  const hit = readersOn(row, 'presentation-css').find(
    (r) =>
      r.file === 'src/foundation/tokens/css/presentation/components/patterns.css' && r.line === 500,
  );
  assert.ok(hit, 'debe haber una lectura presentation-css en patterns.css:500');
  assert.ok(
    hit.scalars.includes('--ds-rhythm-effective-scale'),
    `scalars debe contener --ds-rhythm-effective-scale, tiene ${JSON.stringify(hit.scalars)}`,
  );
  assert.ok(hit.decl, 'una lectura con calc() debe conservar su decl');
  assert.ok(hit.decl.includes('calc('));
  assert.equal(row.paints, true);
});

/* ── ORACULO 6: determinismo ───────────────────────────────────────────── */

test('ORACULO determinismo: dos corridas seguidas producen bytes identicos', () => {
  const a = serialize(buildFacts());
  const b = serialize(buildFacts());
  assert.equal(a, b, 'dos generaciones consecutivas deben coincidir byte a byte');
  assert.equal(a, readFileSync(OUTPUT_PATH, 'utf8'), 'el archivo en disco debe estar al dia');
});

/* ── Invariantes del vocabulario cerrado ───────────────────────────────── */

test('el vocabulario de planos es cerrado y ningun lector cae fuera', () => {
  const allowed = new Set(PLANES);
  assert.deepEqual(facts.planes, PLANES);
  for (const row of facts.channels) {
    for (const r of row.readers) {
      assert.ok(allowed.has(r.plane), `plano inventado: ${r.plane}`);
    }
  }
});

test('paints y paintsInModern se derivan exactamente de los planos declarados', () => {
  const paintSet = new Set(PAINT_PLANES);
  for (const row of facts.channels) {
    assert.equal(
      row.paints,
      row.readers.some((r) => paintSet.has(r.plane)),
      `${row.channel}: paints no coincide con sus lectores`,
    );
    assert.equal(
      row.paintsInModern,
      row.readers.some((r) => isModernPaintReader(r.plane, r.file)),
      `${row.channel}: paintsInModern no coincide con sus lectores`,
    );
  }
});

test('ts-token-mirror y ts-other son los unicos planos que no pintan', () => {
  assert.deepEqual(
    PLANES.filter((p) => !PAINT_PLANES.includes(p)),
    ['ts-token-mirror', 'ts-other'],
  );
  assert.ok(!MODERN_PAINT_PLANES.includes('classic-css'));
  assert.ok(!MODERN_PAINT_PLANES.includes('rustic-css'));
});

test('runtime-css, facade-entrypoints-css, graphics-tsx e infrastructure-tsx pintan, y cuentan para modern', () => {
  for (const plane of [
    'runtime-css',
    'facade-entrypoints-css',
    'graphics-tsx',
    'infrastructure-tsx',
  ]) {
    assert.ok(PLANES.includes(plane), `${plane} debe estar en el vocabulario`);
    assert.ok(PAINT_PLANES.includes(plane), `${plane} debe ser plano de pintura`);
    assert.ok(MODERN_PAINT_PLANES.includes(plane), `${plane} debe contar para modern`);
    assert.ok(isModernPaintReader(plane, 'src/cualquiera.css'), `${plane} pinta en modern`);
  }
});

/* ── Clasificacion ─────────────────────────────────────────────────────── */

test('classifyPlane mapea cada raiz a su plano', () => {
  const cases = [
    ['src/foundation/tokens/css/runtime/engines/modern/skin/button.css', 'modern-skin-css'],
    ['src/foundation/tokens/css/presentation/components/patterns.css', 'presentation-css'],
    ['src/foundation/tokens/css/foundation/anything.css', 'foundation-css'],
    ['src/foundation/tokens/css/runtime/engines/classic/theme.css', 'classic-css'],
    ['src/foundation/tokens/css/runtime/engines/rustic/theme.css', 'rustic-css'],
    ['src/ui/primitives/display/Badge/engines/modern/index.tsx', 'tsx-inline-stamp'],
    ['src/foundation/tokens/ts/runtime/components/modal/index.ts', 'ts-token-mirror'],
    ['src/foundation/tokens/ts/runtime/components/collapse/token-utils/index.ts', 'ts-token-utils'],
    ['src/foundation/behavior/runtime/interaction-state/index.ts', 'ts-other'],
    ['src/foundation/tokens/css/runtime/personality.css', 'runtime-css'],
    ['src/foundation/tokens/css/runtime/bridges/collapse.css', 'runtime-css'],
    ['src/foundation/tokens/css/facade/entrypoints/base.css', 'facade-entrypoints-css'],
    ['src/graphics/icons/runtime/factory/index.tsx', 'graphics-tsx'],
    ['src/graphics/motion/react/presentation/effects/aurora/index.tsx', 'graphics-tsx'],
    [
      'src/infrastructure/runtime/engines/presentation/component-factory/error-boundary/index.tsx',
      'infrastructure-tsx',
    ],
  ];
  for (const [file, plane] of cases) {
    assert.equal(classifyPlane(file), plane, `${file} → ${plane}`);
  }
});

test('runtime-css excluye lo que cuelga de engines/, que ya tiene su propio plano', () => {
  assert.equal(
    classifyPlane('src/foundation/tokens/css/runtime/engines/modern/skin/button.css'),
    'modern-skin-css',
  );
  assert.equal(classifyPlane('src/foundation/tokens/css/runtime/engines/index.css'), null);
});

test('facade/artifacts sigue excluido pese a que facade/entrypoints ahora es un plano', () => {
  assert.equal(isExcludedPath('src/foundation/tokens/css/facade/artifacts/rottay.css'), true);
  assert.equal(isExcludedPath('src/foundation/tokens/css/facade/entrypoints/base.css'), false);
});

test('classifyPlane devuelve null (unclassified) para sitios fuera del vocabulario', () => {
  // .tsx fuera de ui/, graphics/ e infrastructure/
  assert.equal(classifyPlane('src/tooling/examples/i18n/index.tsx'), null);
  // .css fuera del arbol de tokens
  assert.equal(classifyPlane('src/ui/primitives/display/Badge/badge.css'), null);
});

test('token-utils gana sobre ts-token-mirror y no se cuenta como espejo', () => {
  const utils = 'src/foundation/tokens/ts/runtime/components/collapse/token-utils/index.ts';
  assert.equal(classifyPlane(utils), 'ts-token-utils');
  assert.ok(PAINT_PLANES.includes('ts-token-utils'));
});

test('isModernPaintReader exige engines/modern para el estampado inline', () => {
  assert.equal(
    isModernPaintReader('tsx-inline-stamp', 'src/ui/primitives/display/Badge/engines/modern/index.tsx'),
    true,
  );
  assert.equal(
    isModernPaintReader('tsx-inline-stamp', 'src/ui/primitives/display/Badge/engines/rustic/index.tsx'),
    false,
  );
  assert.equal(isModernPaintReader('rustic-css', 'x.css'), false);
  assert.equal(isModernPaintReader('foundation-css', 'x.css'), true);
});

/* ── Exclusiones ───────────────────────────────────────────────────────── */

test('los artifacts generados y el material de test/fixture/story quedan fuera', () => {
  assert.equal(isExcludedPath('src/foundation/tokens/css/facade/artifacts/rottay.css'), true);
  assert.equal(isExcludedPath('src/tooling/testing/fixtures/tenants/rottay.css'), true);
  assert.equal(isExcludedPath('src/ui/primitives/display/Badge/tests/badge.test.tsx'), true);
  assert.equal(isExcludedPath('src/ui/primitives/display/Badge/Badge.stories.tsx'), true);
  assert.equal(isExcludedPath('src/ui/primitives/display/Badge/engines/modern/index.tsx'), false);

  const offenders = facts.channels
    .flatMap((c) => c.readers.map((r) => r.file))
    .concat(facts.unclassified.map((u) => u.file))
    .filter((f) => isExcludedPath(f));
  assert.deepEqual(offenders.slice(0, 5), [], 'ningun archivo excluido puede aparecer en los hechos');
});

/* ── Escalares ─────────────────────────────────────────────────────────── */

test('scalarsInDeclaration solo reporta escalares que multiplican dentro de calc()', () => {
  assert.deepEqual(
    scalarsInDeclaration('padding-inline: calc(var(--ds-button-xs-padding-x) * var(--ds-density-effective-scale))'),
    ['--ds-density-effective-scale'],
  );
  assert.deepEqual(
    scalarsInDeclaration('--a: calc(var(--ds-card-grid-gap) * var(--ds-rhythm-effective-scale, 1))'),
    ['--ds-rhythm-effective-scale'],
  );
  // sin `*` en el calc: no hay multiplicacion, no hay escalar
  assert.deepEqual(
    scalarsInDeclaration('--a: calc(var(--ds-x) + var(--ds-density-effective-scale))'),
    [],
  );
  // fuera de calc: no cuenta
  assert.deepEqual(scalarsInDeclaration('--a: var(--ds-type-scale)'), []);
  // dos escalares, ordenados
  assert.deepEqual(
    scalarsInDeclaration('--a: calc(var(--ds-x) * var(--ds-rhythm-effective-scale) * var(--ds-density-effective-scale))'),
    ['--ds-density-effective-scale', '--ds-rhythm-effective-scale'],
  );
});

/* ── Parseo ────────────────────────────────────────────────────────────── */

test('los comentarios no producen lectores y no corren las lineas', () => {
  const css = 'a{--x:1}\n/* var(--ds-fantasma) */\nb{color:var(--ds-real)}\n';
  const cleaned = stripCssComments(css);
  assert.ok(!cleaned.includes('--ds-fantasma'));
  assert.ok(cleaned.includes('var(--ds-real)'));
  assert.equal(cleaned.split('\n').length, css.split('\n').length);
  assert.equal(cleaned.length, css.length);

  const ts = "const a = 1; // var(--ds-fantasma)\nconst b = 'var(--ds-real)';\n";
  const out = stripTsComments(ts);
  assert.ok(!out.cleaned.includes('--ds-fantasma'));
  assert.ok(out.cleaned.includes('var(--ds-real)'));
  assert.equal(out.cleaned.length, ts.length);
});

test('cssDeclarationAt recorta a la declaracion, no al bloque ni al archivo', () => {
  const css = '.a{color:var(--ds-uno);background:var(--ds-dos)}';
  const idx = css.indexOf('--ds-dos');
  assert.equal(cssDeclarationAt(css, idx).trim(), 'background:var(--ds-dos)');
});

/* ── Forma del artefacto ───────────────────────────────────────────────── */

test('la salida es determinista en forma: canales y lectores ordenados, rutas relativas', () => {
  const names = facts.channels.map((c) => c.channel);
  assert.deepEqual(names, [...names].sort(), 'los canales deben venir ordenados');
  for (const row of facts.channels) {
    assert.deepEqual(row.declaredIn, [...row.declaredIn].sort());
    assert.deepEqual(row.planes, [...new Set(row.planes)].sort());
    for (const r of row.readers) {
      assert.ok(r.file.startsWith('src/'), `ruta no relativa a packages/core: ${r.file}`);
      assert.ok(!r.file.includes('/Users/'), 'no puede haber rutas absolutas');
      assert.ok(Number.isInteger(r.line) && r.line > 0);
      assert.deepEqual(r.scalars, [...r.scalars].sort());
    }
  }
  assert.ok(!JSON.stringify(facts).includes('/Users/'), 'el JSON no puede filtrar rutas absolutas');
});

/* ── Propiedad pintada ─────────────────────────────────────────────────── */

test('cada lectura trae la propiedad objetivo, y nunca es "?"', () => {
  let inline = 0;
  for (const row of facts.channels) {
    for (const r of row.readers) {
      assert.equal(typeof r.prop, 'string', `${r.file}:${r.line} sin prop`);
      assert.ok(r.prop.length > 0);
      assert.notEqual(r.prop, '?', `${r.file}:${r.line} emitio "?"`);
      if (r.prop === INLINE_EXPR) inline += 1;
    }
  }
  assert.ok(inline > 0, 'inline-expr debe existir como salida honesta');
});

test('el estampado inline resuelve la propiedad JS del objeto de estilo', () => {
  const badge = channel('--ds-badge-sm-padding-x').readers.find(
    (r) => r.file === 'src/ui/primitives/display/Badge/engines/modern/index.tsx' && r.line === 52,
  );
  assert.equal(badge.prop, 'paddingInline');

  const errorBoundary = channel('--ds-color-error-700').readers.find((r) =>
    r.file.includes('component-factory/error-boundary'),
  );
  assert.equal(errorBoundary.plane, 'infrastructure-tsx');
  assert.equal(errorBoundary.prop, 'color');
});

test('propertyForRead distingue propagacion, aterrizaje y expresion suelta', () => {
  const css = (src) => {
    const cleaned = stripCssComments(src);
    const off = cleaned.indexOf('var(--ds-x') + 4;
    return propertyForRead(cleaned, cssDeclarationSpanAt(cleaned, off), off, true);
  };
  // aterriza en una propiedad real
  assert.equal(css('.a{padding-inline:calc(var(--ds-x) * 1px)}'), 'padding-inline');
  // propaga a otro canal: esta es la arista del grafo
  assert.equal(css('.a{--ds-otro: var(--ds-x)}'), '--ds-otro');

  const ts = (src) => {
    const { cleaned, strings } = stripTsComments(src);
    const off = cleaned.indexOf('var(--ds-x') + 4;
    const lineStarts = [0];
    for (let i = 0; i < cleaned.length; i += 1) if (cleaned[i] === '\n') lineStarts.push(i + 1);
    return propertyForRead(
      cleaned,
      tsDeclarationSpanAt(cleaned, strings, off, lineStarts),
      off,
      false,
    );
  };
  assert.equal(ts("const s = { paddingInline: 'var(--ds-x)' };"), 'paddingInline');
  assert.equal(ts("const s = { border: '1px solid var(--ds-x)' };"), 'border');
  assert.equal(ts("const s = { '--ds-otro': 'var(--ds-x)' };"), '--ds-otro');
  // sin posicion de valor de propiedad: inline-expr, jamas "?"
  assert.equal(ts("const s = 'var(--ds-x)';"), INLINE_EXPR);
  assert.equal(ts("f('var(--ds-x)');"), INLINE_EXPR);
});

/* ── Regla de peso: decl solo cuando hay calc() ────────────────────────── */

test('decl se conserva exactamente cuando la declaracion tiene calc(), nunca en otro caso', () => {
  assert.equal(keepsDecl('padding: calc(var(--ds-a) * var(--ds-b-scale))'), true);
  assert.equal(keepsDecl('padding: var(--ds-a)'), false);

  let conCalc = 0;
  let sinCalc = 0;
  for (const row of facts.channels) {
    for (const r of row.readers) {
      if (r.decl === undefined) {
        sinCalc += 1;
      } else {
        conCalc += 1;
        assert.ok(
          r.decl.includes('calc('),
          `${r.file}:${r.line} conserva decl sin tener calc(): ${r.decl}`,
        );
      }
      // el scalars solo puede ser no vacio si hubo calc(, y entonces hay decl
      if (r.scalars.length > 0) {
        assert.ok(
          r.decl !== undefined,
          `${r.file}:${r.line} declara scalars sin evidencia decl`,
        );
      }
    }
  }
  assert.ok(conCalc > 0, 'debe haber lecturas con calc()');
  assert.ok(sinCalc > 0, 'debe haber lecturas sin calc(), que son la mayoria');
});

/* ── Hueco residual del vocabulario ────────────────────────────────────── */

test('el vocabulario no deja hueco: unclassified esta vacio', () => {
  const files = [...new Set(facts.unclassified.map((u) => u.file))].sort();
  assert.deepEqual(
    files,
    [],
    `hueco nuevo en el vocabulario de planos: ${JSON.stringify(files)}`,
  );
  assert.equal(facts.summary.unclassifiedReads, 0);

  // todo lo que alguna vez cayo fuera del vocabulario tiene plano hoy
  const clasificados = new Set(facts.channels.flatMap((c) => c.readers.map((r) => r.file)));
  for (const antes of [
    'src/foundation/tokens/css/runtime/personality.css',
    'src/foundation/tokens/css/runtime/bridges/collapse.css',
    'src/foundation/tokens/css/runtime/bridges/collapse-paint.css',
    'src/foundation/tokens/css/facade/entrypoints/base.css',
    'src/graphics/icons/runtime/factory/index.tsx',
    'src/infrastructure/runtime/engines/presentation/component-factory/error-boundary/index.tsx',
  ]) {
    assert.ok(clasificados.has(antes), `${antes} debe estar clasificado ahora`);
  }
});

test('el sumario cuadra con las filas', () => {
  const s = facts.summary;
  assert.equal(s.channels, facts.channels.length);
  assert.equal(
    s.channelsPaintsFalse,
    facts.channels.filter((c) => !c.paints).length,
  );
  assert.equal(
    s.channelsPaintsInModernFalse,
    facts.channels.filter((c) => !c.paintsInModern).length,
  );
  assert.equal(s.unclassifiedReads, facts.unclassified.length);
  assert.equal(
    s.readers,
    facts.channels.reduce((acc, c) => acc + c.readers.length, 0),
  );
});
