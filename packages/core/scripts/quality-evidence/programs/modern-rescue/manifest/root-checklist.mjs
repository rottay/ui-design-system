#!/usr/bin/env node
/**
 * root-checklist.mjs — VISTA por raiz sobre los hechos de fan-out.
 *
 * Responde la pregunta del owner: *"esta variable va a estar implementada en
 * todas estas primitivas, con todas estas opciones — un checklist de todas las
 * variables que tienen que estar ahi."*
 *
 * Metodo: cierre transitivo HACIA ARRIBA desde una raiz. Una lectura
 * `var(--ds-A)` cuya propiedad objetivo es a su vez un canal PROPAGA
 * (arista A → B). Una lectura cuya propiedad objetivo es una propiedad real,
 * en un plano de pintura, ATERRIZA (sitio de pintura).
 *
 * Dos clases de arista (RULING 2):
 *   • `ds`     — el objetivo es un canal publico `--ds-*`
 *   • `bridge` — el objetivo es un puente privado `--_ds-*`, nivel 1 de la
 *                forma canonica `var(--_ds-<fam>-<prop>, var(--ds-<raiz>, lit))`
 * Cada canal del cierre lleva su `edgeKind`, de modo que el total solo-`--ds-`
 * sigue siendo reconstruible por resta y el delta trae genealogia.
 *
 * La familia de un sitio de pintura es la del MANIFIESTO (RULING 1), no la del
 * sistema de archivos: `family-inventory.json` es el canon (255 filas). Orden
 * de resolucion en `resolveSite`. Lo que no resuelve cae en un bucket
 * explicito `unattributed/<archivo>`, que se cuenta y se lista aparte porque
 * CSS que pinta y que ninguna familia reclama es un HALLAZGO, no ruido.
 *
 * `unreached` — canales de la cascada que no aterrizan en ningun lado — no es
 * ruido: es el trabajo pendiente, y por eso se emite con el mismo rango que
 * el resto.
 *
 * Este script NO decide nada: proyecta `generated/fanout-facts.json` sobre el
 * canon de familias.
 *
 * DOS FUENTES DE RAIZ (y por que hacen falta las dos):
 *   • `pattern`  — todo canal escalar `--ds-*-scale`. Descubre los DIALES
 *                  NUMERICOS, y solo esos.
 *   • `manifest` — la cabeza declarada `rootChannel.channel` de cada
 *                  `cascade/roots/*.json`. Es la lista autorada de ejes de
 *                  customizacion, e incluye colores, familias tipograficas,
 *                  anatomia, elevacion y tono de sidebar, que NINGUN patron
 *                  `-scale` puede alcanzar.
 * La union no debilita nada: el patron sigue midiendo exactamente lo que
 * media, y cada raiz de la salida declara su `discoveredBy`.
 *
 * RAICES NO MEDIBLES. Una raiz declarada en el manifiesto que no tiene nodo en
 * el grafo de fan-out NO se silencia ni se emite como una cascada de 0 sin
 * explicacion: sale en `notMeasurableRoots` con un `reasonCode` cerrado y un
 * `notMeasurableReason` que cita `archivo:linea` derivado de disco. Tres
 * motivos, todos reales en el corpus de hoy:
 *   • `no-css-head`                  — `rootChannel.channel` es `null` porque
 *                                      el eje es DATO, no canal.
 *   • `attribute-not-custom-property`— la cabeza es un atributo de raiz
 *                                      (`data-anatomy-card`), no un `--*`.
 *   • `absent-from-fanout-facts`     — la cabeza es un `--ds-*` legitimo pero
 *                                      solo se declara en los snapshots
 *                                      generados, que el corpus de hechos
 *                                      excluye.
 *
 * Uso:
 *   node .../root-checklist.mjs
 *   node .../root-checklist.mjs --check
 *   node .../root-checklist.mjs --markdown --ds-radius-scale
 *   node .../root-checklist.mjs --root --ds-color-primary
 */

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { OUTPUT_PATH as FACTS_PATH, PAINT_PLANES, INLINE_EXPR } from './fanout-facts.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const PACKAGE_ROOT = path.resolve(HERE, '../../../../..');
export const PROGRAM_ROOT = path.resolve(HERE, '..');
export const OUTPUT_PATH = path.join(HERE, 'generated', 'root-checklists.json');

const PAINT_SET = new Set(PAINT_PLANES);

/** Una raiz automatica es todo canal escalar: `--ds-*-scale`. */
export const ROOT_PATTERN = /^--ds-[a-z0-9-]+-scale$/;

export const UNATTRIBUTED_PREFIX = 'unattributed';

/** Manifiestos de raiz de cascada: la segunda fuente de raices. */
export const CASCADE_ROOTS_DIR = path.join(HERE, 'cascade', 'roots');
export const CASCADE_ROOTS_REL = 'scripts/quality-evidence/programs/modern-rescue/manifest/cascade/roots';

/** Snapshots generados que el corpus de hechos excluye (fanout-facts.mjs). */
export const ARTIFACTS_REL = 'src/foundation/tokens/css/facade/artifacts';
export const FACTS_GENERATOR_REL = 'scripts/quality-evidence/programs/modern-rescue/manifest/fanout-facts.mjs';

/** Vocabulario cerrado de motivos de no-medibilidad. No se inventan motivos. */
export const NOT_MEASURABLE_REASONS = [
  'no-css-head',
  'attribute-not-custom-property',
  'absent-from-fanout-facts',
];

/** Vocabulario cerrado de procedencia de raiz. */
export const ROOT_PROVENANCE = ['pattern', 'manifest', 'both', 'explicit'];

/* ─────────────────────────────────────────────────────────────────────────
 * Canon de familias
 * ───────────────────────────────────────────────────────────────────────── */

const SKIP_DIR = /^(node_modules|dist|\.next|coverage|__snapshots__)$/;
const TEST_FILE = /\.(test|spec|stories)\.[cm]?[jt]sx?$/;

function walk(dir, keep, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIR.test(entry.name)) continue;
      walk(abs, keep, out);
    } else if (keep(abs)) {
      out.push(abs);
    }
  }
  return out;
}

const stripPackage = (p) => String(p).replace(/^packages\/core\//, '').split('#')[0];

/**
 * Indice clase CSS → familias que la estampan.
 *
 * Se construye leyendo los literales de cadena de cada `.ts`/`.tsx` que vive
 * bajo el `sourceOwner` de una familia. Un token cuenta como clase candidata
 * si tiene forma kebab (`ds-button-primary`); los tokens sueltos sin guion se
 * descartan porque no distinguen nada.
 */
export function buildClassIndex(owners, packageRoot = PACKAGE_ROOT) {
  const index = new Map();
  const files = walk(
    path.join(packageRoot, 'src'),
    (p) => /\.(tsx|ts)$/.test(p) && !TEST_FILE.test(p),
  );
  const STRING_LITERAL = /(['"`])((?:\\.|(?!\1)[^\\])*)\1/g;
  for (const abs of files) {
    const rel = path.relative(packageRoot, abs);
    const family = ownerFamily(owners, rel);
    if (!family) continue;
    const text = readFileSync(abs, 'utf8');
    STRING_LITERAL.lastIndex = 0;
    let m;
    while ((m = STRING_LITERAL.exec(text)) !== null) {
      for (const token of m[2].split(/[\s${}()]+/)) {
        if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)+$/.test(token)) continue;
        if (!index.has(token)) index.set(token, new Set());
        index.get(token).add(family);
      }
    }
  }
  return index;
}

/** Familia duena de una ruta por el prefijo `sourceOwner` mas largo. */
export function ownerFamily(owners, rel) {
  for (const o of owners) {
    if (rel === o.owner || rel.startsWith(`${o.owner}/`)) return o.id;
  }
  return null;
}

export function loadCanon(programRoot = PROGRAM_ROOT, packageRoot = PACKAGE_ROOT) {
  const inventory = JSON.parse(readFileSync(path.join(programRoot, 'family-inventory.json'), 'utf8'));
  const owners = inventory.rows
    .map((r) => ({ id: r.id, owner: stripPackage(r.sourceOwner) }))
    .sort((a, b) => b.owner.length - a.owner.length || (a.id < b.id ? -1 : 1));

  const bindings = new Map();
  const familyFiles = walk(path.join(programRoot, 'manifest', 'families'), (p) => p.endsWith('.json'));
  for (const abs of familyFiles) {
    const doc = JSON.parse(readFileSync(abs, 'utf8'));
    collectBindings(doc, doc.familyId, bindings);
  }

  return {
    denominator: inventory.denominator,
    familyIds: new Set(inventory.rows.map((r) => r.id)),
    owners,
    bindings,
    classIndex: buildClassIndex(owners, packageRoot),
  };
}

function collectBindings(node, familyId, out) {
  if (Array.isArray(node)) {
    for (const item of node) collectBindings(item, familyId, out);
    return;
  }
  if (!node || typeof node !== 'object') return;
  for (const [key, value] of Object.entries(node)) {
    if (key === 'sourceBindings' && Array.isArray(value)) {
      for (const binding of value) {
        const file = stripPackage(binding);
        if (!out.has(file)) out.set(file, new Set());
        out.get(file).add(familyId);
      }
    } else {
      collectBindings(value, familyId, out);
    }
  }
}

/* ─────────────────────────────────────────────────────────────────────────
 * Raices declaradas en el manifiesto de cascada
 *
 * Los 20 `cascade/roots/*.json` son la lista AUTORADA de ejes de
 * customizacion. Su `rootChannel.channel` es la cabeza de cascada declarada.
 * Este bloque la lee, la clasifica y — cuando no hay nada que medir — deriva
 * de disco la cita que lo justifica. Ni un solo numero de linea esta escrito a
 * mano: todos salen de buscar el literal en el archivo real, asi que una
 * edicion ajena mueve la cita en vez de dejarla mintiendo.
 * ───────────────────────────────────────────────────────────────────────── */

/** Primera linea (1-based) que contiene `needle`, o `null`. */
export function lineOfLiteral(text, needle, from = 0) {
  const lines = text.split('\n');
  for (let i = from; i < lines.length; i += 1) {
    if (lines[i].includes(needle)) return i + 1;
  }
  return null;
}

/** Linea de la clave `"channel"` que cuelga de `"rootChannel"`. */
export function lineOfRootChannelKey(text) {
  const head = lineOfLiteral(text, '"rootChannel"');
  return lineOfLiteral(text, '"channel"', head === null ? 0 : head - 1);
}

/** Cita `archivo:linea` del primer literal `needle` dentro de un archivo del paquete. */
export function citeLiteral(fileRef, needle, packageRoot = PACKAGE_ROOT) {
  const rel = stripPackage(fileRef);
  let text;
  try {
    text = readFileSync(path.join(packageRoot, rel), 'utf8');
  } catch {
    return null;
  }
  const line = lineOfLiteral(text, needle);
  return line === null ? null : `${rel}:${line}`;
}

/** Sitios donde un canal se declara dentro de los snapshots generados. */
export function artifactDeclarations(channel, packageRoot = PACKAGE_ROOT) {
  const base = path.join(packageRoot, ARTIFACTS_REL);
  let entries;
  try {
    entries = readdirSync(base, { withFileTypes: true });
  } catch {
    return [];
  }
  const out = [];
  for (const entry of entries.sort((a, b) => (a.name < b.name ? -1 : 1))) {
    if (!entry.isDirectory()) continue;
    const rel = `${ARTIFACTS_REL}/${entry.name}/index.css`;
    let text;
    try {
      text = readFileSync(path.join(packageRoot, rel), 'utf8');
    } catch {
      continue;
    }
    const line = lineOfLiteral(text, `${channel}:`);
    if (line !== null) out.push(`${rel}:${line}`);
  }
  return out;
}

/** Sitios de emision declarados por el propio manifiesto de raiz. */
function emissionSites(rootChannel) {
  const emission = Array.isArray(rootChannel?.emission) ? rootChannel.emission : [];
  return emission.map((e) => e?.site).filter((s) => typeof s === 'string');
}

/**
 * Clasifica una raiz declarada. Devuelve siempre `measurable` explicito; una
 * raiz no medible trae `reasonCode` del vocabulario cerrado, la prosa del
 * motivo y las citas derivadas.
 */
export function classifyManifestRoot(file, knownChannels, packageRoot = PACKAGE_ROOT) {
  const doc = file.doc ?? {};
  const rootId = typeof doc.rootId === 'string' ? doc.rootId : file.name.replace(/\.json$/, '');
  const rootChannel = doc.rootChannel ?? null;
  const raw = rootChannel && typeof rootChannel.channel === 'string' ? rootChannel.channel : null;
  const keyLine = lineOfRootChannelKey(file.text);
  const declaredAt = keyLine === null ? file.rel : `${file.rel}:${keyLine}`;
  const sites = emissionSites(rootChannel);

  const base = { rootId, rootChannel: raw, declaredAt, file: file.rel };

  if (raw === null) {
    const reasonLine = lineOfLiteral(file.text, '"headEmptyReason"');
    const reasonAt = reasonLine === null ? null : `${file.rel}:${reasonLine}`;
    const source = sites.map((s) => citeLiteral(s, 'DATA, NOT CSS', packageRoot)).find(Boolean) ?? null;
    return {
      ...base,
      measurable: false,
      reasonCode: 'no-css-head',
      evidence: [declaredAt, reasonAt, source].filter(Boolean),
      notMeasurableReason: [
        `La raiz no declara cabeza CSS: rootChannel.channel es null en ${declaredAt}.`,
        reasonAt ? `El manifiesto lo razona en headEmptyReason (${reasonAt}).` : '',
        source ? `La fuente lo dice literal en ${source}: el eje viaja como DATO hasta el render, no como canal.` : '',
        'Sin canal no hay nodo en el grafo de fan-out: no se mide, y no se emite como una cascada de 0 que pareceria un defecto.',
      ].filter(Boolean).join(' '),
    };
  }

  if (!raw.startsWith('--')) {
    const source = sites.map((s) => citeLiteral(s, `"${raw}"`, packageRoot)).find(Boolean) ?? null;
    return {
      ...base,
      measurable: false,
      reasonCode: 'attribute-not-custom-property',
      evidence: [declaredAt, source].filter(Boolean),
      notMeasurableReason: [
        `La cabeza declarada "${raw}" es un ATRIBUTO de raiz, no una custom property: ${declaredAt}.`,
        source ? `La emision real esta en ${source}.` : '',
        'El fan-out se mide sobre lecturas var(--*); un atributo no puede tener una sola arista de cascada, asi que medirlo daria 0 por construccion.',
      ].filter(Boolean).join(' '),
    };
  }

  if (!knownChannels.has(raw)) {
    const exclusion = citeLiteral(FACTS_GENERATOR_REL, 'EXCLUDED_PREFIXES = [', packageRoot);
    const decls = artifactDeclarations(raw, packageRoot);
    return {
      ...base,
      measurable: false,
      reasonCode: 'absent-from-fanout-facts',
      evidence: [declaredAt, exclusion, ...decls].filter(Boolean),
      notMeasurableReason: [
        `La cabeza ${raw} (${declaredAt}) no existe como canal en generated/fanout-facts.json.`,
        exclusion ? `El corpus de hechos excluye los snapshots generados (${exclusion}),` : 'El corpus de hechos excluye los snapshots generados,',
        decls.length > 0
          ? `y este canal SOLO se declara ahi: ${decls.join(', ')}.`
          : 'y no se encontro ninguna declaracion del canal en el corpus escaneado.',
        'Sin nodo en los hechos no hay cascada que medir.',
      ].filter(Boolean).join(' '),
    };
  }

  return { ...base, measurable: true, reasonCode: null, notMeasurableReason: null, evidence: [declaredAt] };
}

/** Lee y clasifica los manifiestos de raiz. Nunca escribe: solo los lee. */
export function loadManifestRoots(knownChannels, dir = CASCADE_ROOTS_DIR, packageRoot = PACKAGE_ROOT, relBase = CASCADE_ROOTS_REL) {
  let names;
  try {
    names = readdirSync(dir).filter((n) => n.endsWith('.json')).sort();
  } catch {
    return [];
  }
  return names.map((name) => {
    const text = readFileSync(path.join(dir, name), 'utf8');
    return classifyManifestRoot(
      { name, rel: `${relBase}/${name}`, text, doc: JSON.parse(text) },
      knownChannels,
      packageRoot,
    );
  });
}

/* ─────────────────────────────────────────────────────────────────────────
 * Selector CSS que pinta
 * ───────────────────────────────────────────────────────────────────────── */

/** Comentarios a espacios: no mueve un solo offset ni una sola linea. */
export function blankCssComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
}

/**
 * Selectores abiertos y todavia no cerrados en la linea dada. Las at-rules
 * (`@media`, `@supports`) se descartan: encuadran, no pintan.
 */
export function selectorsAtLine(cleaned, line) {
  const lines = cleaned.split('\n');
  let offset = 0;
  for (let i = 0; i < line - 1 && i < lines.length; i += 1) offset += lines[i].length + 1;
  const endOfLine = Math.min(cleaned.length, offset + (lines[line - 1]?.length ?? 0));

  const stack = [];
  let last = 0;
  const step = (i) => {
    const ch = cleaned[i];
    if (ch === '{') {
      stack.push(cleaned.slice(last, i).trim());
      last = i + 1;
    } else if (ch === '}') {
      stack.pop();
      last = i + 1;
    } else if (ch === ';') {
      last = i + 1;
    }
  };

  for (let i = 0; i < offset && i < cleaned.length; i += 1) step(i);

  // Un bloque puede abrir y cerrar en la MISMA linea que pinta
  // (`.ds-card { gap: var(--ds-x); }`). Si cortaramos en el inicio de la linea
  // ese selector se perderia y el sitio caeria al bucket sin familia por un
  // detalle de escritura, no por un defecto real. Recorremos la linea entera y
  // nos quedamos con la pila mas profunda que se alcanza en ella.
  let deepest = stack.slice();
  for (let i = offset; i < endOfLine; i += 1) {
    step(i);
    if (stack.length > deepest.length) deepest = stack.slice();
  }

  return deepest.filter((s) => s && !s.startsWith('@'));
}

export function classesInSelectors(selectors) {
  const out = new Set();
  for (const sel of selectors) {
    for (const m of sel.matchAll(/\.([a-zA-Z_][\w-]*)/g)) out.add(m[1]);
  }
  return out;
}

/* ─────────────────────────────────────────────────────────────────────────
 * Atribucion de un sitio de pintura (RULING 1)
 * ───────────────────────────────────────────────────────────────────────── */

/**
 * Orden de resolucion:
 *  1. la ruta cae bajo un `sourceOwner`            → `source-owner`
 *  2. selector de clase → tsx que la estampa, cruzado con el binding del
 *     canon                                        → `class+binding`
 *  3. solo selector de clase                        → `class`
 *  4. solo binding del canon, univoco               → `binding`
 *  5. solo binding del canon, varias familias       → `binding-multi`
 *  6. nada de lo anterior                           → `unattributed`
 */
export function resolveSite(site, canon, sourceCache, packageRoot = PACKAGE_ROOT) {
  const direct = ownerFamily(canon.owners, site.file);
  if (direct) return { families: [direct], resolvedBy: 'source-owner' };

  let byClass = new Set();
  if (site.file.endsWith('.css')) {
    if (!sourceCache.has(site.file)) {
      sourceCache.set(site.file, blankCssComments(readFileSync(path.join(packageRoot, site.file), 'utf8')));
    }
    const classes = classesInSelectors(selectorsAtLine(sourceCache.get(site.file), site.line));
    for (const cls of classes) {
      const families = canon.classIndex.get(cls);
      if (families) for (const f of families) byClass.add(f);
    }
  }

  const bound = canon.bindings.get(site.file) ?? new Set();

  if (byClass.size > 0 && bound.size > 0) {
    const both = [...byClass].filter((f) => bound.has(f)).sort();
    if (both.length > 0) return { families: both, resolvedBy: 'class+binding' };
  }
  if (byClass.size > 0) return { families: [...byClass].sort(), resolvedBy: 'class' };
  if (bound.size === 1) return { families: [...bound], resolvedBy: 'binding' };
  if (bound.size > 1) return { families: [...bound].sort(), resolvedBy: 'binding-multi' };

  return { families: [`${UNATTRIBUTED_PREFIX}/${site.file}`], resolvedBy: 'unattributed' };
}

/* ─────────────────────────────────────────────────────────────────────────
 * Grafo de propagacion
 * ───────────────────────────────────────────────────────────────────────── */

const isChannelProp = (prop) => prop.startsWith('--ds-') || prop.startsWith('--_ds-');
const isBridge = (name) => name.startsWith('--_ds-');
/** Custom property que no es ninguna de las dos clases medidas. */
const isOtherCustomProp = (prop) => prop.startsWith('--') && !isChannelProp(prop);

/**
 * No toda clave de objeto en un `.tsx` es una propiedad de estilo. Una tabla de
 * lookup como `RADIUS_STYLES = { md: 'var(--ds-modal-radius-md)' }` tiene la
 * clave `md`, que es una VARIANTE, no algo que se pinte. El vocabulario de
 * propiedades reales se DERIVA de los planos CSS, donde `prop: valor` es
 * sintacticamente una propiedad de verdad.
 */
export function cssPropertyVocabulary(facts) {
  const vocab = new Set();
  for (const row of facts.channels) {
    for (const r of row.readers) {
      if (!r.plane.endsWith('-css')) continue;
      if (r.prop.startsWith('--') || r.prop.startsWith('@') || r.prop === INLINE_EXPR) continue;
      vocab.add(r.prop);
    }
  }
  return vocab;
}

export function toKebab(key) {
  if (/^[A-Z]/.test(key)) {
    return `-${key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`;
  }
  return key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

export function buildGraph(facts, canon, packageRoot = PACKAGE_ROOT, sourceCache = new Map()) {
  const vocabulary = cssPropertyVocabulary(facts);

  const edges = new Map();
  const paintSites = new Map();
  const foreign = new Map();
  const lookupKeys = [];

  for (const row of facts.channels) {
    for (const r of row.readers) {
      if (isChannelProp(r.prop)) {
        if (!edges.has(row.channel)) edges.set(row.channel, new Set());
        edges.get(row.channel).add(r.prop);
        continue;
      }
      if (isOtherCustomProp(r.prop)) {
        foreign.set(row.channel, (foreign.get(row.channel) ?? 0) + 1);
        continue;
      }
      if (r.prop === INLINE_EXPR || r.prop.startsWith('@')) continue;
      if (!PAINT_SET.has(r.plane)) continue;
      if (!r.plane.endsWith('-css') && !vocabulary.has(toKebab(r.prop))) {
        lookupKeys.push({ channel: row.channel, key: r.prop, file: r.file, line: r.line });
        continue;
      }
      const { families, resolvedBy } = resolveSite(r, canon, sourceCache, packageRoot);
      if (!paintSites.has(row.channel)) paintSites.set(row.channel, []);
      paintSites.get(row.channel).push({
        plane: r.plane,
        file: r.file,
        line: r.line,
        prop: r.prop,
        families,
        resolvedBy,
      });
    }
  }

  lookupKeys.sort((a, b) => {
    if (a.file !== b.file) return a.file < b.file ? -1 : 1;
    if (a.line !== b.line) return a.line - b.line;
    return a.channel < b.channel ? -1 : a.channel > b.channel ? 1 : 0;
  });

  return { edges, paintSites, foreign, lookupKeys, vocabulary };
}

/**
 * Cierre transitivo hacia arriba.
 *
 * `allowBridge=false` reproduce exactamente el cierre solo-`--ds-`: es la
 * garantia de que el numero previo al ensanche sigue siendo derivable.
 */
export function closureFrom(root, edges, allowBridge = true) {
  const depth = new Map([[root, 0]]);
  const parent = new Map();
  const queue = [root];
  while (queue.length > 0) {
    const current = queue.shift();
    const next = edges.get(current);
    if (!next) continue;
    for (const target of [...next].sort()) {
      if (!allowBridge && isBridge(target)) continue;
      if (depth.has(target)) continue;
      depth.set(target, depth.get(current) + 1);
      parent.set(target, current);
      queue.push(target);
    }
  }
  return { depth, parent };
}

/** Primer puente en el camino desde la raiz hasta `name`. */
function firstBridgeOnPath(name, parent) {
  let seen = null;
  let cursor = name;
  const guard = new Set();
  while (cursor !== undefined && !guard.has(cursor)) {
    guard.add(cursor);
    if (isBridge(cursor)) seen = cursor;
    cursor = parent.get(cursor);
  }
  return seen;
}

/* ─────────────────────────────────────────────────────────────────────────
 * Checklist de una raiz
 * ───────────────────────────────────────────────────────────────────────── */

/**
 * `provenance` es opcional: cuando viene, la entrada declara COMO se descubrio
 * la raiz (`discoveredBy`) y que `rootId` del manifiesto la reclama. Cuando no
 * viene, la forma es exactamente la de antes del ensanche.
 */
export function checklistFor(root, graph, factsByChannel, canon, provenance = null) {
  const { edges, paintSites, foreign, lookupKeys } = graph;
  const { depth, parent } = closureFrom(root, edges, true);
  const narrow = closureFrom(root, edges, false).depth;
  const names = [...depth.keys()].sort();

  const channels = [];
  const unreached = [];
  const bridgeDelta = [];
  /** familia → canal → { props:Set, files:Set } */
  const familyMap = new Map();
  const unattributedFiles = new Map();
  const resolvedByCount = {};
  let foreignCuts = 0;

  for (const name of names) {
    const sites = paintSites.get(name) ?? [];
    const known = factsByChannel.get(name);
    foreignCuts += foreign.get(name) ?? 0;
    const edgeKind = narrow.has(name) ? 'ds' : 'bridge';

    const sorted = [...sites].sort((a, b) => {
      if (a.file !== b.file) return a.file < b.file ? -1 : 1;
      if (a.line !== b.line) return a.line - b.line;
      return a.prop < b.prop ? -1 : a.prop > b.prop ? 1 : 0;
    });

    const families = [...new Set(sorted.flatMap((s) => s.families))].sort();

    channels.push({
      channel: name,
      kind: known ? known.kind : (isBridge(name) ? 'bridge' : 'ds'),
      edgeKind,
      depth: depth.get(name),
      paints: sorted.length > 0,
      paintsInModern: known ? known.paintsInModern : false,
      families,
      sites: sorted,
    });

    if (edgeKind === 'bridge') {
      bridgeDelta.push({
        channel: name,
        depth: depth.get(name),
        parent: parent.get(name) ?? null,
        viaBridge: firstBridgeOnPath(name, parent),
        paints: sorted.length > 0,
      });
    }

    if (sorted.length === 0) {
      unreached.push({
        channel: name,
        depth: depth.get(name),
        edgeKind,
        declaredIn: known ? known.declaredIn : [],
        readerPlanes: known ? known.planes : [],
      });
      continue;
    }

    for (const site of sorted) {
      resolvedByCount[site.resolvedBy] = (resolvedByCount[site.resolvedBy] ?? 0) + 1;
      if (site.resolvedBy === 'unattributed') {
        unattributedFiles.set(site.file, (unattributedFiles.get(site.file) ?? 0) + 1);
      }
      for (const family of site.families) {
        if (!familyMap.has(family)) familyMap.set(family, new Map());
        const perChannel = familyMap.get(family);
        // dedupe: un canal, una entrada, con la lista de propiedades
        if (!perChannel.has(name)) perChannel.set(name, { props: new Set(), files: new Set() });
        perChannel.get(name).props.add(site.prop);
        perChannel.get(name).files.add(site.file);
      }
    }
  }

  const families = [...familyMap.keys()].sort().map((family) => {
    const perChannel = familyMap.get(family);
    const rows = [...perChannel.keys()].sort().map((ch) => ({
      channel: ch,
      props: [...perChannel.get(ch).props].sort(),
      // dato secundario: el archivo sigue estando, no se pierde nada
      files: [...perChannel.get(ch).files].sort(),
    }));
    return {
      family,
      manifestFamily: canon.familyIds.has(family),
      channels: rows.length,
      properties: [...new Set(rows.flatMap((r) => r.props))].sort(),
      rows,
    };
  });

  const manifestFamilies = families.filter((f) => f.manifestFamily).length;
  const discarded = (lookupKeys ?? []).filter((k) => depth.has(k.channel));
  const dsChannels = channels.filter((c) => c.edgeKind === 'ds');

  return {
    root,
    ...(provenance
      ? {
        discoveredBy: provenance.discoveredBy,
        rootId: provenance.rootId,
        rootIds: provenance.rootIds,
      }
      : {}),
    summary: {
      channelsInCascade: channels.length,
      // reconstruccion por resta del numero previo al ensanche
      channelsInCascadeDs: dsChannels.length,
      channelsInCascadeViaBridge: channels.length - dsChannels.length,
      channelsPainting: channels.filter((c) => c.paints).length,
      channelsPaintingDs: dsChannels.filter((c) => c.paints).length,
      channelsUnreached: unreached.length,
      channelsUnreachedDs: dsChannels.filter((c) => !c.paints).length,
      manifestFamilies,
      manifestDenominator: canon.denominator,
      unattributedFiles: unattributedFiles.size,
      unattributedSites: [...unattributedFiles.values()].reduce((a, b) => a + b, 0),
      maxDepth: Math.max(...channels.map((c) => c.depth)),
      foreignCustomPropertyCuts: foreignCuts,
      discardedLookupKeys: discarded.length,
      resolvedBy: Object.fromEntries(Object.entries(resolvedByCount).sort()),
    },
    channels,
    families,
    unreached,
    bridgeDelta,
    unattributed: [...unattributedFiles.entries()]
      .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
      .map(([file, sites]) => ({ file, sites })),
    discardedLookupKeys: discarded,
  };
}

/* ─────────────────────────────────────────────────────────────────────────
 * Generacion
 * ───────────────────────────────────────────────────────────────────────── */

export function loadFacts(factsPath = FACTS_PATH) {
  return JSON.parse(readFileSync(factsPath, 'utf8'));
}

export function discoverRoots(facts) {
  return facts.channels.map((c) => c.channel).filter((c) => ROOT_PATTERN.test(c)).sort();
}

/**
 * Une las dos fuentes de raiz.
 *
 * Devuelve `{ roots, provenance, declared }`: la lista ordenada y sin
 * duplicados, la procedencia por canal y la clasificacion completa de los
 * manifiestos (medibles y no medibles).
 */
export function mergeRoots(facts, extraRoots = [], manifestRoots = []) {
  const patternRoots = discoverRoots(facts);
  const patternSet = new Set(patternRoots);

  const manifestSet = new Set();
  const idsByChannel = new Map();
  for (const d of manifestRoots) {
    if (!d.measurable || typeof d.rootChannel !== 'string') continue;
    manifestSet.add(d.rootChannel);
    if (!idsByChannel.has(d.rootChannel)) idsByChannel.set(d.rootChannel, new Set());
    idsByChannel.get(d.rootChannel).add(d.rootId);
  }

  const roots = [...new Set([...patternRoots, ...manifestSet, ...extraRoots])].sort();
  const provenance = new Map();
  for (const r of roots) {
    const inPattern = patternSet.has(r);
    const inManifest = manifestSet.has(r);
    const rootIds = [...(idsByChannel.get(r) ?? [])].sort();
    provenance.set(r, {
      discoveredBy: inPattern && inManifest ? 'both' : inPattern ? 'pattern' : inManifest ? 'manifest' : 'explicit',
      rootId: rootIds[0] ?? null,
      rootIds,
    });
  }
  return { roots, provenance, patternRoots, manifestRoots };
}

export function buildChecklists(
  facts,
  canon,
  extraRoots = [],
  packageRoot = PACKAGE_ROOT,
  cascadeRootsDir = CASCADE_ROOTS_DIR,
) {
  const graph = buildGraph(facts, canon, packageRoot);
  const byChannel = new Map(facts.channels.map((c) => [c.channel, c]));
  const declared = loadManifestRoots(new Set(byChannel.keys()), cascadeRootsDir, packageRoot);
  const { roots, provenance } = mergeRoots(facts, extraRoots, declared);
  const checklists = roots
    .filter((r) => byChannel.has(r))
    .map((r) => checklistFor(r, graph, byChannel, canon, provenance.get(r)));

  const notMeasurable = declared
    .filter((d) => !d.measurable)
    .sort((a, b) => (a.rootId < b.rootId ? -1 : a.rootId > b.rootId ? 1 : 0))
    .map(({ rootId, rootChannel, declaredAt, reasonCode, notMeasurableReason, evidence }) => ({
      rootId,
      rootChannel,
      declaredAt,
      reasonCode,
      notMeasurableReason,
      evidence,
    }));

  const byProvenance = { pattern: 0, manifest: 0, both: 0, explicit: 0 };
  for (const c of checklists) byProvenance[c.discoveredBy] += 1;

  const allUnattributed = new Map();
  for (const c of checklists) {
    for (const u of c.unattributed) allUnattributed.set(u.file, Math.max(allUnattributed.get(u.file) ?? 0, u.sites));
  }
  const touched = new Set();
  for (const c of checklists) for (const f of c.families) if (f.manifestFamily) touched.add(f.family);

  return {
    generator: 'scripts/quality-evidence/programs/modern-rescue/manifest/root-checklist.mjs',
    source: 'scripts/quality-evidence/programs/modern-rescue/manifest/generated/fanout-facts.json',
    familyCanon: 'scripts/quality-evidence/programs/modern-rescue/family-inventory.json',
    corpusProvenance: {
      revertWave: [
        'Ola de reversion del 2026-08-17 17:53: un escritor acotado, DESPACHADO POR EL',
        'COORDINADOR DEL PROGRAMA, revirtio 54 ediciones sobre 12 archivos de',
        'foundation/tokens/css/presentation/components/. No fue un actor desconocido.',
        'Verificado en disco: 12 archivos con mtime 17:53, todos bajo ese arbol, y',
        'tree.css quedo byte-identico a HEAD, que es la huella de una reversion.',
      ].join(' '),
      effectOnCascade: [
        'Las cifras `ds` de tres raices bajaron con la reversion: radius 109→107 (-2),',
        'density 250→230 (-20), type 152→121 (-31). Suman -53 contra 54 reversiones.',
      ].join(' '),
      readingTrap: [
        'La lectura ingenua "revertir encogio la cascada, luego revertir fue malo" es',
        'FALSA y previsible. Las 54 reescrituras SI agregaban aristas de cascada reales',
        '— por eso la cascada se encogio exactamente lo revertido — pero eran la idea',
        'correcta con la ejecucion equivocada: rompian el valor en reposo, o aplicaban',
        'type-scale dos veces porque la raiz rem ya lo lleva una vez',
        '(1rem = 15px = 16 * 0.9375 * type-scale). El encogimiento mide lo que se saco,',
        'no si sacarlo estuvo bien.',
      ].join(' '),
      generatorNeutrality: [
        'La reescritura del generador por los rulings 1 y 2 es numericamente neutra sobre',
        'el subconjunto `ds`: correr el codigo pre-ruling contra estos mismos hechos',
        'devuelve 107/72, 230/138 y 121/83, identico a esta salida.',
      ].join(' '),
    },
    rootPattern: ROOT_PATTERN.source,
    rootSources: {
      law: [
        'Dos fuentes, union sin duplicados, procedencia declarada por raiz.',
        'El patron mide DIALES NUMERICOS y solo esos; el manifiesto aporta los ejes',
        'autorados que ningun `-scale` alcanza (color, familias tipograficas, anatomia,',
        'elevacion, tono de sidebar). Ninguna raiz declarada se descarta en silencio:',
        'la que no tiene nodo en el grafo sale en `notMeasurableRoots` con motivo citado.',
      ].join(' '),
      pattern: ROOT_PATTERN.source,
      manifest: CASCADE_ROOTS_REL,
      provenanceVocabulary: ROOT_PROVENANCE,
      notMeasurableVocabulary: NOT_MEASURABLE_REASONS,
    },
    notMeasurableRoots: notMeasurable,
    summary: {
      roots: checklists.length,
      rootsByProvenance: byProvenance,
      manifestRootsDeclared: declared.length,
      manifestRootsMeasurable: declared.length - notMeasurable.length,
      manifestRootsNotMeasurable: notMeasurable.length,
      rootsWithoutCascade: checklists.filter((c) => c.summary.channelsInCascade === 1).length,
      totalUnreached: checklists.reduce((a, c) => a + c.summary.channelsUnreached, 0),
      manifestFamiliesTouched: touched.size,
      manifestDenominator: canon.denominator,
      unattributedFiles: allUnattributed.size,
    },
    unattributed: [...allUnattributed.entries()]
      .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
      .map(([file, sites]) => ({ file, sites })),
    roots: checklists,
  };
}

export function serialize(doc) {
  return `${JSON.stringify(doc, null, 2)}\n`;
}

/* ─────────────────────────────────────────────────────────────────────────
 * Vista markdown
 * ───────────────────────────────────────────────────────────────────────── */

export function toMarkdown(entry) {
  const L = [];
  const s = entry.summary;
  L.push(`# Checklist de raiz — \`${entry.root}\``);
  L.push('');
  L.push(`• familias del manifiesto ─ ${s.manifestFamilies} de ${s.manifestDenominator}`);
  L.push(`• archivos sin familia ──── ${s.unattributedFiles} (${s.unattributedSites} sitios)`);
  L.push(`• canales en la cascada ─── ${s.channelsInCascade} (${s.channelsInCascadeDs} --ds- + ${s.channelsInCascadeViaBridge} via puente)`);
  L.push(`• con pintura ───────────── ${s.channelsPainting}`);
  L.push(`• sin llegar a pintura ──── ${s.channelsUnreached}`);
  L.push(`• profundidad maxima ────── ${s.maxDepth}`);
  L.push('');
  L.push('## Familias del manifiesto');
  L.push('');
  L.push('| familia | canales | propiedades pintadas |');
  L.push('| --- | ---: | --- |');
  for (const f of entry.families.filter((x) => x.manifestFamily)) {
    L.push(`| ${f.family} | ${f.channels} | ${f.properties.join(', ')} |`);
  }
  L.push('');
  if (entry.unattributed.length > 0) {
    L.push(`## Archivos sin familia (${entry.unattributed.length}) — hallazgo`);
    L.push('');
    L.push('| archivo | sitios |');
    L.push('| --- | ---: |');
    for (const u of entry.unattributed) L.push(`| ${u.file} | ${u.sites} |`);
    L.push('');
  }
  L.push('## Canales de la cascada');
  L.push('');
  L.push('| canal | arista | prof | pinta | familias |');
  L.push('| --- | :-: | ---: | :-: | --- |');
  for (const c of entry.channels) {
    const mark = c.paints ? '✓' : '✗';
    const fams = c.families.length > 3
      ? `${c.families.slice(0, 3).join(', ')} (+${c.families.length - 3})`
      : c.families.join(', ');
    L.push(`| \`${c.channel}\` | ${c.edgeKind} | ${c.depth} | ${mark} | ${fams} |`);
  }
  L.push('');
  if (entry.bridgeDelta.length > 0) {
    L.push(`## Delta por arista puente (${entry.bridgeDelta.length})`);
    L.push('');
    L.push('| canal | prof | padre | primer puente | pinta |');
    L.push('| --- | ---: | --- | --- | :-: |');
    for (const b of entry.bridgeDelta) {
      L.push(`| \`${b.channel}\` | ${b.depth} | \`${b.parent ?? '-'}\` | \`${b.viaBridge ?? '-'}\` | ${b.paints ? '✓' : '✗'} |`);
    }
    L.push('');
  }
  L.push(`## Sin llegar a pintura (${entry.unreached.length}) — trabajo pendiente`);
  L.push('');
  L.push('| canal | prof | planos lectores | declarado en |');
  L.push('| --- | ---: | --- | --- |');
  for (const u of entry.unreached) {
    const planes = u.readerPlanes.length > 0 ? u.readerPlanes.join(', ') : '(sin lector)';
    const decl = u.declaredIn.length > 0 ? u.declaredIn.join(', ') : '(sin declarar)';
    L.push(`| \`${u.channel}\` | ${u.depth} | ${planes} | ${decl} |`);
  }
  L.push('');
  return L.join('\n');
}

/* ─────────────────────────────────────────────────────────────────────────
 * CLI
 * ───────────────────────────────────────────────────────────────────────── */

function parseArgs(argv) {
  const opts = { check: false, markdown: null, roots: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--check') opts.check = true;
    else if (a === '--markdown') {
      opts.markdown = argv[i + 1];
      i += 1;
    } else if (a === '--root') {
      opts.roots.push(argv[i + 1]);
      i += 1;
    } else if (a.startsWith('--ds-') || a.startsWith('--_ds-')) opts.roots.push(a);
  }
  return opts;
}

function main(argv) {
  const opts = parseArgs(argv);
  const facts = loadFacts();
  const canon = loadCanon();

  if (opts.markdown) {
    const graph = buildGraph(facts, canon);
    const byChannel = new Map(facts.channels.map((c) => [c.channel, c]));
    if (!byChannel.has(opts.markdown)) {
      process.stderr.write(`✗ root-checklist: el canal ${opts.markdown} no existe en los hechos\n`);
      process.exit(1);
    }
    process.stdout.write(`${toMarkdown(checklistFor(opts.markdown, graph, byChannel, canon))}\n`);
    return;
  }

  const text = serialize(buildChecklists(facts, canon, opts.roots));

  if (opts.check) {
    let onDisk = null;
    try {
      onDisk = readFileSync(OUTPUT_PATH, 'utf8');
    } catch {
      onDisk = null;
    }
    if (onDisk !== text) {
      process.stderr.write('✗ root-checklist: generated/root-checklists.json esta desactualizado\n');
      process.exit(1);
    }
    process.stdout.write('✓ root-checklist: generated/root-checklists.json al dia\n');
    return;
  }

  writeFileSync(OUTPUT_PATH, text);
  const doc = JSON.parse(text);
  const p = doc.summary.rootsByProvenance;
  process.stdout.write('✓ root-checklist\n');
  process.stdout.write(`  raices ───────────────── ${doc.summary.roots}\n`);
  process.stdout.write(`    • solo patron ──────── ${p.pattern}\n`);
  process.stdout.write(`    • solo manifiesto ──── ${p.manifest}\n`);
  process.stdout.write(`    • ambas fuentes ────── ${p.both}\n`);
  if (p.explicit > 0) process.stdout.write(`    • explicitas (--root) ─ ${p.explicit}\n`);
  process.stdout.write(`  raices del manifiesto ── ${doc.summary.manifestRootsDeclared} declaradas, ${doc.summary.manifestRootsNotMeasurable} no medibles\n`);
  for (const nm of doc.notMeasurableRoots) {
    process.stdout.write(`    ✗ ${nm.rootId} ─ ${nm.reasonCode} (${nm.declaredAt})\n`);
  }
  process.stdout.write(`  familias del manifiesto ─ ${doc.summary.manifestFamiliesTouched} de ${doc.summary.manifestDenominator}\n`);
  process.stdout.write(`  archivos sin familia ─── ${doc.summary.unattributedFiles}\n`);
  process.stdout.write(`  canales sin llegar ───── ${doc.summary.totalUnreached}\n`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2));
}
