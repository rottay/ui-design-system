#!/usr/bin/env node

/**
 * variant-parity — el canon ESTRUCTURAL de los 3 themes, medido en la FUENTE.
 *
 * Hermano de `mirror-parity`, no extension suya, y la diferencia es de
 * PROCEDENCIA: mirror-parity mide el ARTEFACTO compilado (el espejo de salida)
 * y por eso necesita un build fresco; este productor mide las tres FUENTES
 * `.ts` y corre sin build. Nunca importa `dist/` ni lee un artefacto.
 *
 * Responde UNA pregunta: cada slot del universo canonico, ¿tiene POSICION en
 * los tres temas, o hay divergencia SILENCIOSA?
 *
 *   slot        una hoja de decision autorada, con la identidad que le da el
 *               walk lexico de mirror-parity (`authoredLeafPaths`). Esa unidad
 *               ya esta falsada en F4A-0: 1820/1503/397, union 2613,
 *               interseccion 345. NO se inventa otra: el walk se IMPORTA.
 *   posicion    `authored` (la hoja esta autorada) o `placeholder` (docblock
 *               `@placeholder` explicito). La ausencia SIN placeholder es
 *               SILENCIO, y el silencio es lo que el frente F4A elimina.
 *   divergente  slot del universo sin posicion completa en los 3 temas.
 *
 * El indice linea->ruta que usa el lexer de tags NO es un segundo walk: la
 * identidad de las hojas sigue saliendo de `authoredLeafPaths`. Este indice
 * solo dice "que ruta esta abierta en esta linea" para poder colgar un tag del
 * alcance correcto, y se cruza contra el set de hojas de aquel.
 *
 * Usage:
 *   node manifest/variant-parity/index.mjs            escribe el artefacto
 *   node manifest/variant-parity/index.mjs --check    regenera en memoria,
 *                                                     compara bytes y corre el
 *                                                     trinquete
 */

import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  TENANTS,
  PACKAGE_ROOT,
  sourcePath,
  provenanceOf,
  authoredLeafPaths,
  blankComments,
} from '../mirror-parity/index.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const OUTPUT_PATH = path.join(HERE, '..', 'generated', 'variant-parity.json');
export const BASELINE_PATH = path.join(HERE, 'variant-parity.baseline.json');

/* ═══════════════════════════════════════════════════════════════════════════
 * A.1 — la lista de metadato, ENUMERADA
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Las 36 hojas de metadato, por nombre. La adjudicacion A.1 dice que la regla
 * es una LISTA, no un numero: "una resta sin sustraendo nombrado no es una
 * regla". Derivadas con la regla de F4A-0 §A.1 fila 1 (id + name + prosa +
 * booleanos) sobre el walk EVALUADO, y traducidas a la ruta lexica de este
 * corpus.
 *
 * Las dos entradas con `via` son de otra clase y estan anotadas a proposito:
 * evnto NO autora su motion — escribe `motion: EVNTO_CANONICAL_MOTION`, un
 * preset congelado de `foundation/presets/policy/experience-baselines/`. El
 * objeto evaluado ve esas dos hojas; la fuente de evnto no las tiene. Su
 * guarda anti-rename no puede ser la ruta (no existe): es la referencia al
 * preset, que si esta en la fuente.
 *
 * GOBERNADA: solo crece con adjudicacion escrita del DT.
 */
export const METADATA_EXCLUSION = [
  { tenant: 'bithire', path: 'CAPABILITIES.engineBridge.note' },
  { tenant: 'bithire', path: 'CAPABILITIES.responsive.note' },
  { tenant: 'bithire', path: 'CHARTS.animateOnMount' },
  { tenant: 'bithire', path: 'CHARTS.showDots' },
  { tenant: 'bithire', path: 'CHARTS.useGradientFill' },
  { tenant: 'bithire', path: 'CHROME.card.hoverTint' },
  { tenant: 'bithire', path: 'CHROME.card.showBorder' },
  { tenant: 'bithire', path: 'MOTION.countUpEnabled' },
  { tenant: 'bithire', path: 'MOTION.useSpring' },
  { tenant: 'bithire', path: 'THEME.id' },
  { tenant: 'bithire', path: 'THEME.name' },
  { tenant: 'evnto', path: 'CAPABILITIES.engineBridge.note' },
  { tenant: 'evnto', path: 'CAPABILITIES.expressive.note' },
  { tenant: 'evnto', path: 'CAPABILITIES.recipes.note' },
  { tenant: 'evnto', path: 'CAPABILITIES.responsive.note' },
  { tenant: 'evnto', path: 'CHARTS.animateOnMount' },
  { tenant: 'evnto', path: 'CHARTS.showDots' },
  { tenant: 'evnto', path: 'CHARTS.useGradientFill' },
  { tenant: 'evnto', path: 'CHROME.card.hoverTint' },
  { tenant: 'evnto', path: 'CHROME.card.showBorder' },
  { tenant: 'evnto', path: 'MOTION.countUpEnabled', via: 'EVNTO_CANONICAL_MOTION' },
  { tenant: 'evnto', path: 'MOTION.useSpring', via: 'EVNTO_CANONICAL_MOTION' },
  { tenant: 'evnto', path: 'THEME.id' },
  { tenant: 'evnto', path: 'THEME.name' },
  { tenant: 'rottay', path: 'CAPABILITIES.engineBridge.note' },
  { tenant: 'rottay', path: 'CAPABILITIES.expressive.note' },
  { tenant: 'rottay', path: 'CAPABILITIES.responsive.note' },
  { tenant: 'rottay', path: 'CHARTS.animateOnMount' },
  { tenant: 'rottay', path: 'CHARTS.showDots' },
  { tenant: 'rottay', path: 'CHARTS.useGradientFill' },
  { tenant: 'rottay', path: 'CHROME.card.hoverTint' },
  { tenant: 'rottay', path: 'CHROME.card.showBorder' },
  { tenant: 'rottay', path: 'MOTION.countUpEnabled' },
  { tenant: 'rottay', path: 'MOTION.useSpring' },
  { tenant: 'rottay', path: 'THEME.id' },
  { tenant: 'rottay', path: 'THEME.name' },
];

/** Denominador de pintura publicado. CITADO de F4A-0, no recomputado aqui:
 *  este harness no toca `dist/` y la cifra 3726 es del walk EVALUADO. */
export const PAINT_DENOMINATOR = {
  value: 3690,
  derivation: '3726 hojas evaluadas (F4A-0, walk del objeto, 2 scopes) - 36 metadato enumerado',
  unit: 'hoja-evaluada',
  warning:
    'Unidad EVALUADA, citada de F4A-0. NO es la unidad lexica de este artefacto '
    + '(1820/1503/397). No se fusionan.',
};

/* ═══════════════════════════════════════════════════════════════════════════
 * Gramatica de tags (§4 del brief) — vocabulario CERRADO
 * ═══════════════════════════════════════════════════════════════════════════ */

export const DOMICILES = ['seed', 'baseline', 'derived', 'pro-expert', 'unassigned'];

/** Clase de contenido esperada por domicilio. En F4A-2 se REPORTA, no bloquea:
 *  la validacion semantica contra el registro de diales es endurecimiento
 *  declarado de F4A-close. */
export const GOVERNOR_CLASS = {
  seed: 'dial',
  baseline: 'razon-falsable',
  derived: 'funcion-o-raiz',
  'pro-expert': 'capability',
  unassigned: 'capability-o-gap',
};

/** Cada docblock del texto, con su linea de apertura, su linea de cierre y sus
 *  tags. Solo `/** ... *​/`: un `//` NUNCA es un tag (las fuentes ya tienen
 *  banners de seccion y notas de esqueleto que no son gobierno). */
export function parseDocblocks(text) {
  const lines = text.split('\n');
  const blocks = [];
  let open = null;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (open === null && /^\s*\/\*\*/.test(line)) {
      open = { start: i + 1, body: [line] };
      if (/\*\//.test(line.replace(/^\s*\/\*\*/, ''))) { open.end = i + 1; blocks.push(finishBlock(open)); open = null; }
      continue;
    }
    if (open !== null) {
      open.body.push(line);
      if (/\*\//.test(line)) { open.end = i + 1; blocks.push(finishBlock(open)); open = null; }
    }
  }
  return blocks;
}

function finishBlock(open) {
  const tags = { domicile: null, governor: null, placeholder: null };
  const malformed = [];
  let governorLines = 0;
  for (let k = 0; k < open.body.length; k += 1) {
    const raw = open.body[k];
    const m = raw.match(/@(domicile|governor|placeholder)\b(.*)$/);
    if (!m) continue;
    const name = m[1];
    const value = m[2].replace(/\*\/\s*$/, '').trim();
    if (name === 'governor') {
      governorLines += 1;
      // Una linea: si la siguiente linea del docblock no arranca otro tag y
      // trae texto, el governor se derramo y eso es FAIL de forma.
      const next = open.body[k + 1] ?? '';
      const nextIsText = /^\s*\*\s+\S/.test(next) && !/@(domicile|governor|placeholder)\b/.test(next) && !/\*\//.test(next.trim());
      if (nextIsText) malformed.push({ tag: 'governor', line: open.start + k, reason: 'governor multilinea' });
    }
    if (tags[name] !== null) malformed.push({ tag: name, line: open.start + k, reason: `@${name} repetido en el mismo docblock` });
    tags[name] = value;
  }
  return { start: open.start, end: open.end, tags, malformed, governorLines };
}

/** Indice linea -> ruta abierta. NO es un segundo walk de hojas: la identidad
 *  de las hojas la da `authoredLeafPaths`. Esto solo permite colgar un tag del
 *  alcance correcto. Se corre sobre el texto SIN comentarios (reusa
 *  `blankComments` de mirror-parity) para que una llave dentro de un comentario
 *  no mueva el nivel. */
export function pathIndex(text) {
  const clean = blankComments(text);
  const lines = clean.split('\n');
  const perLine = [];
  const stack = [];
  let root = null;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    perLine[i + 1] = { path: root ? [root, ...stack].join('.') : null, opens: null };
    const constOpen = line.match(/^const\s+([A-Za-z0-9_$]+)\s*(?::[^=]*)?=\s*\{/);
    if (constOpen) {
      root = normalizeRoot(constOpen[1]);
      stack.length = 0;
      perLine[i + 1].opens = root;
      continue;
    }
    if (root === null) continue;
    const keyOpen = line.match(/^\s*['"`]?([A-Za-z0-9_$-]+)['"`]?\s*:\s*\{\s*$/);
    if (keyOpen) {
      perLine[i + 1].opens = [root, ...stack, keyOpen[1]].join('.');
      stack.push(keyOpen[1]);
      continue;
    }
    const leaf = line.match(/^\s*['"`]?([A-Za-z0-9_$-]+)['"`]?\s*:\s*[^{]/);
    if (leaf) { perLine[i + 1].opens = [root, ...stack, leaf[1]].join('.'); continue; }
    if (/^\s*\}/.test(line)) { if (stack.length) stack.pop(); else root = null; }
  }
  return perLine;
}

/** Misma normalizacion de raiz que `authoredLeafPaths`: el const de esqueleto
 *  se llama `<tenant>BrandTheme` y se normaliza a THEME para que la
 *  comparacion mida estructura y no el nombre del tenant. */
function normalizeRoot(name) {
  return /BrandTheme$/.test(name) ? 'THEME' : name;
}

/** Lo que un docblock cubre: la primera declaracion que le sigue. */
export function scopeOfBlock(block, index) {
  for (let line = block.end + 1; line < index.length; line += 1) {
    const at = index[line];
    if (!at) continue;
    if (at.opens) return at.opens;
  }
  return null;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Analisis por tema
 * ═══════════════════════════════════════════════════════════════════════════ */

export function analyzeSource({ tenant, text }) {
  const leaves = authoredLeafPaths(text, tenant);
  const index = pathIndex(text);
  const blocks = parseDocblocks(text);
  const failures = [];
  const tags = [];
  const placeholders = [];

  for (const block of blocks) {
    for (const bad of block.malformed) {
      failures.push(`${tenant}:${bad.line}: ${bad.reason}`);
    }
    const { domicile, governor, placeholder } = block.tags;
    if (domicile === null && governor === null && placeholder === null) continue;

    if (domicile !== null && !DOMICILES.includes(domicile)) {
      failures.push(`${tenant}:${block.start}: @domicile desconocido "${domicile}" (cerrado: ${DOMICILES.join(' | ')})`);
      continue;
    }
    if (domicile !== null && (governor === null || governor === '')) {
      failures.push(`${tenant}:${block.start}: @domicile ${domicile} sin @governor (es obligatorio y de una linea)`);
      continue;
    }
    if (placeholder !== null) {
      if (placeholder === '') { failures.push(`${tenant}:${block.start}: @placeholder sin ruta`); continue; }
      if (domicile !== 'unassigned') {
        failures.push(`${tenant}:${block.start}: @placeholder exige @domicile unassigned (trae "${domicile ?? 'ninguno'}")`);
        continue;
      }
      if (leaves.has(placeholder)) {
        failures.push(`${tenant}:${block.start}: @placeholder ${placeholder} contradictorio — ${tenant} SI autora ese slot`);
        continue;
      }
      placeholders.push({ tenant, slot: placeholder, governor, line: block.start });
      tags.push({ tenant, slot: placeholder, kind: 'placeholder', domicile, governor, governorClass: GOVERNOR_CLASS[domicile], line: block.start });
      continue;
    }
    const scope = scopeOfBlock(block, index);
    if (scope === null) { failures.push(`${tenant}:${block.start}: docblock con tags que no cubre ninguna declaracion`); continue; }
    tags.push({ tenant, scope, kind: 'scope', domicile, governor, governorClass: GOVERNOR_CLASS[domicile], line: block.start });
  }

  // Cobertura: la hoja la cubre el scope MAS CERCANO. Dos scopes con tags a la
  // misma distancia = ambiguo = FAIL.
  const scopeTags = tags.filter((t) => t.kind === 'scope');
  const covered = new Map();
  const metaOfTenant = new Set(METADATA_EXCLUSION.filter((m) => m.tenant === tenant).map((m) => m.path));
  for (const leaf of leaves) {
    const applicable = scopeTags.filter((t) => leaf === t.scope || leaf.startsWith(`${t.scope}.`));
    if (applicable.length === 0) continue;
    const deepest = Math.max(...applicable.map((t) => t.scope.split('.').length));
    const winners = applicable.filter((t) => t.scope.split('.').length === deepest);
    if (winners.length > 1) {
      failures.push(
        `${tenant}: alcance ambiguo para ${leaf}: ${winners.length} docblocks con @domicile a la misma cercania `
        + `(lineas ${winners.map((w) => w.line).join(', ')})`,
      );
      continue;
    }
    covered.set(leaf, winners[0]);
  }

  const paintLeaves = [...leaves].filter((p) => !metaOfTenant.has(p));
  return {
    tenant,
    leaves,
    tags,
    placeholders,
    failures,
    coveredCount: [...covered.keys()].filter((p) => !metaOfTenant.has(p)).length,
    paintLeafCount: paintLeaves.length,
  };
}

/** La guarda anti-rename de la lista de metadato: si un path enumerado dejo de
 *  existir en su fuente, la lista quedo mentira y eso es FAIL. Las entradas con
 *  `via` se verifican por su referencia al preset, que es lo que la fuente
 *  realmente tiene. */
export function metadataGuard(perTenant, rawText) {
  const failures = [];
  for (const entry of METADATA_EXCLUSION) {
    const analysis = perTenant[entry.tenant];
    if (!analysis) { failures.push(`metadato: tema desconocido ${entry.tenant}`); continue; }
    if (entry.via) {
      if (!rawText[entry.tenant].includes(entry.via)) {
        failures.push(
          `metadato: ${entry.tenant} ${entry.path} se declaraba via ${entry.via} y esa referencia ya no esta `
          + 'en la fuente — alguien la inlineo y la lista quedo mentira',
        );
      }
      continue;
    }
    if (!analysis.leaves.has(entry.path)) {
      failures.push(`metadato: ${entry.tenant} ${entry.path} ya no existe en la fuente — la lista quedo mentira`);
    }
  }
  return failures;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * El documento
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * `enforceMetadata` existe para los fixtures: la lista de metadato es una
 * afirmacion sobre las TRES fuentes reales, y correrla contra un corpus
 * sintetico daria 36 fallas que no dicen nada. La guarda igual tiene dientes
 * donde importa — `build()` la corre siempre sobre el corpus real y el test de
 * integracion la muta para verlo fallar.
 */
export function buildDoc({ sources, provenance, enforceMetadata = true }) {
  const tenants = Object.keys(sources);
  const perTenant = {};
  for (const tenant of tenants) perTenant[tenant] = analyzeSource({ tenant, text: sources[tenant] });

  const failures = tenants.flatMap((t) => perTenant[t].failures);
  if (enforceMetadata) failures.push(...metadataGuard(perTenant, sources));

  const positions = {};
  for (const tenant of tenants) {
    const map = new Map();
    for (const leaf of perTenant[tenant].leaves) map.set(leaf, 'authored');
    for (const ph of perTenant[tenant].placeholders) map.set(ph.slot, 'placeholder');
    positions[tenant] = map;
  }
  const universe = [...new Set(tenants.flatMap((t) => [...positions[t].keys()]))].sort();
  const complete = universe.filter((slot) => tenants.every((t) => positions[t].has(slot)));
  const exclusive = Object.fromEntries(
    tenants.map((t) => [t, universe.filter((s) => positions[t].has(s) && tenants.filter((x) => x !== t).every((x) => !positions[x].has(s))).length]),
  );

  const untagged = tenants.reduce((sum, t) => sum + (perTenant[t].paintLeafCount - perTenant[t].coveredCount), 0);

  return {
    $generatedBy: 'manifest/variant-parity/index.mjs',
    $regenerate: 'node manifest/variant-parity/index.mjs',
    $warning:
      'Mide la FUENTE de los 3 themes, no el artefacto compilado. Hermano de mirror-parity '
      + '(que mide el artefacto): distinta procedencia, distinta unidad, nunca se fusionan.',
    provenance,
    metadataExclusion: {
      law: 'A.1: la regla es una LISTA ENUMERADA, no un numero. Solo crece con adjudicacion escrita del DT.',
      count: METADATA_EXCLUSION.length,
      entries: METADATA_EXCLUSION,
      paintDenominator: PAINT_DENOMINATOR,
    },
    tagRegistry: {
      law: 'Vocabulario CERRADO: ' + DOMICILES.join(' | ') + '. @governor obligatorio, de una linea.',
      count: tenants.reduce((s, t) => s + perTenant[t].tags.length, 0),
      entries: tenants.flatMap((t) => perTenant[t].tags),
    },
    matrix: {
      unit: 'authored-decision-leaf-path (importada de mirror-parity/authoredLeafPaths)',
      leaves: Object.fromEntries(tenants.map((t) => [t, perTenant[t].leaves.size])),
      universe: universe.length,
      union: universe.length,
      intersection: complete.length,
      positions: Object.fromEntries(tenants.map((t) => [t, {
        authored: perTenant[t].leaves.size,
        placeholder: perTenant[t].placeholders.length,
        absent: universe.length - positions[t].size,
      }])),
      exclusive,
      paintLeaves: Object.fromEntries(tenants.map((t) => [t, perTenant[t].paintLeafCount])),
      taggedPaintLeaves: Object.fromEntries(tenants.map((t) => [t, perTenant[t].coveredCount])),
    },
    ratchet: {
      law: 'decrease-only: el baseline sigue al arbol HACIA ABAJO, nunca hacia arriba.',
      divergentSlots: universe.length - complete.length,
      untaggedAuthoredLeaves: untagged,
    },
    failures,
  };
}

export const serialize = (doc) => `${JSON.stringify(doc, null, 2)}\n`;

export function readSources(root = PACKAGE_ROOT) {
  const sources = {};
  for (const tenant of TENANTS) sources[tenant] = readFileSync(path.join(root, sourcePath(tenant)), 'utf8');
  return sources;
}

export function build(root = PACKAGE_ROOT) {
  return buildDoc({
    sources: readSources(root),
    provenance: {
      sources: TENANTS.map((t) => provenanceOf(sourcePath(t))),
      mtimeExcluded: 'Se registra sha256 y no mtime: el mtime cambia con un clon o un touch.',
    },
  });
}

/** Anti-vacio duro: nunca un "0 tags, todo verde" silencioso. */
export function emptinessFailures(doc) {
  const out = [];
  if (doc.matrix.universe === 0) out.push('anti-vacio: el universo de slots esta vacio');
  for (const [tenant, n] of Object.entries(doc.matrix.leaves)) {
    if (n === 0) out.push(`anti-vacio: la fuente de ${tenant} no aporto ni una hoja`);
  }
  if (doc.metadataExclusion.count === 0) out.push('anti-vacio: la lista de metadato esta vacia');
  return out;
}

export function evaluate(doc, baseline) {
  const findings = [...doc.failures, ...emptinessFailures(doc)];
  for (const key of ['divergentSlots', 'untaggedAuthoredLeaves']) {
    const pinned = baseline?.[key];
    if (typeof pinned !== 'number') { findings.push(`variant-parity.baseline.json no pinea un ${key} numerico`); continue; }
    const now = doc.ratchet[key];
    if (now > pinned) findings.push(`${key} GREW from ${pinned} to ${now}: aparecio divergencia o se perdio cobertura`);
    else if (now < pinned) {
      findings.push(
        `${key} SHRANK from ${pinned} to ${now} -- buena noticia que igual hay que escribir: `
        + `lower \`${key}\` in manifest/variant-parity/variant-parity.baseline.json (decrease-only)`,
      );
    }
  }
  return findings;
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  const doc = build();
  const text = serialize(doc);
  const baseline = existsSync(BASELINE_PATH) ? JSON.parse(readFileSync(BASELINE_PATH, 'utf8')) : null;
  if (process.argv.includes('--check')) {
    const current = existsSync(OUTPUT_PATH) ? readFileSync(OUTPUT_PATH, 'utf8') : null;
    const findings = evaluate(doc, baseline);
    if (current !== text) findings.unshift('generated/variant-parity.json desactualizado — corre `node manifest/variant-parity/index.mjs`');
    if (findings.length > 0) {
      console.error('variant-parity FAILED:');
      for (const f of findings) console.error(`  - ${f}`);
      process.exit(1);
    }
    console.log(
      `variant-parity OK — ${doc.matrix.universe} slots, ${doc.matrix.intersection} con posicion en los 3, `
      + `${doc.ratchet.divergentSlots} divergentes, ${doc.ratchet.untaggedAuthoredLeaves} hojas sin tag `
      + `(${doc.tagRegistry.count} tags leidos)`,
    );
  } else {
    writeFileSync(OUTPUT_PATH, text);
    console.log(`variant-parity: generated/variant-parity.json escrito (${doc.matrix.universe} slots, ${doc.ratchet.divergentSlots} divergentes)`);
  }
}
