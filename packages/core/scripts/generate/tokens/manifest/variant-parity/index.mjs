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
 *               `@placeholder` explicito, que cubre POR PREFIJO: `P` y todo lo
 *               que cuelgue de `P.`). La ausencia SIN placeholder es SILENCIO,
 *               y el silencio es lo que el frente F4A elimina.
 *   divergente  slot del universo sin posicion completa en los 3 temas. Queda
 *               INFORMATIVO (F4A-close): ya no es el gate; su ultimo valor
 *               (33) es observacion historica, no pin.
 *
 * F4A-close (real-keypath-parity, ruling DT + independent audit ACCEPT_WITH_BINDING_CORRECTIONS)
 * agrega una TERCERA disposicion, `declared-absent` (`@absent <hoja exacta>` +
 * `@governor`), y mueve el gate de SLOT a PAR (tema,slot). El universo de
 * pares es `temas x universo` (3 x 2559 = 7677 hoy). Cada par tiene EXACTAMENTE
 * una disposicion: `authored`, `placeholder`, `declared-absent`, o SILENCIO (el
 * unico defecto). `@absent` es por HOJA EXACTA — el prefijo esta PROHIBIDO
 * (una afirmacion de familia es la forma que F4A-3c retiro por no probada) — y
 * exige que la ruta pertenezca al universo de hojas autoradas por ALGUN tema
 * (nunca el propio). `silentPairs` es el gate nuevo, objetivo 0.
 * `placeholderPairs` es decrease-only aparte: taparlo con un placeholder
 * bajaria `silentPairs` pero subiria `placeholderPairs`, y el ratchet lo
 * enrojece — el regimen honesto es el unico que pasa.
 *
 * El indice linea->ruta que usa el lexer de tags NO es un segundo walk: la
 * identidad de las hojas sigue saliendo de `authoredLeafPaths`. Este indice
 * solo dice "que ruta esta abierta en esta linea" para poder colgar un tag del
 * alcance correcto, y se cruza contra el set de hojas de aquel.
 *
 * Usage:
 *   node scripts/generate/tokens/manifest/variant-parity/index.mjs            escribe el artefacto
 *   node scripts/generate/tokens/manifest/variant-parity/index.mjs --check    regenera en memoria,
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
export const OUTPUT_PATH = path.join(PACKAGE_ROOT, 'artifacts/generated/manifest/themes/parity/source/index.json');
export const BASELINE_PATH = path.join(HERE, 'baseline/index.json');

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

/* ═══════════════════════════════════════════════════════════════════════════
 * Gramatica de tags (§4 del brief) — vocabulario CERRADO
 * ═══════════════════════════════════════════════════════════════════════════ */

export const DOMICILES = ['seed', 'derived', 'pro-expert', 'unassigned'];

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
  const tags = { domicile: null, governor: null, placeholder: null, absent: null };
  const malformed = [];
  let governorLines = 0;
  for (let k = 0; k < open.body.length; k += 1) {
    const raw = open.body[k];
    const m = raw.match(/@(domicile|governor|placeholder|absent)\b(.*)$/);
    if (!m) continue;
    const name = m[1];
    const value = m[2].replace(/\*\/\s*$/, '').trim();
    if (name === 'governor') {
      governorLines += 1;
      // Una linea: si la siguiente linea del docblock no arranca otro tag y
      // trae texto, el governor se derramo y eso es FAIL de forma.
      const next = open.body[k + 1] ?? '';
      const nextIsText = /^\s*\*\s+\S/.test(next) && !/@(domicile|governor|placeholder|absent)\b/.test(next) && !/\*\//.test(next.trim());
      if (nextIsText) malformed.push({ tag: 'governor', line: open.start + k, reason: 'governor multilinea' });
    }
    if (tags[name] !== null) malformed.push({ tag: name, line: open.start + k, reason: `@${name} repetido en el mismo docblock` });
    tags[name] = value;
  }
  return { start: open.start, end: open.end, tags, malformed, governorLines };
}

/** Indice linea -> ruta abierta. NO es un segundo walk de hojas: la identidad
 *  de las hojas la da `authoredLeafPaths`. Esto solo dice que ruta esta abierta
 *  en cada linea, para poder colgar un tag del alcance correcto, y se cruza
 *  contra el set de aquel.
 *
 *  El nivel se lleva contando LLAVES, caracter a caracter, no reconociendo el
 *  comienzo de la linea. La version anterior bajaba la pila solo cuando la
 *  linea EMPEZABA con `}` y por eso se rompia con la forma que el corpus usa de
 *  verdad:
 *
 *      shadowActive: "var(--ds-shadow-button-rest)", bg: '#FFFFFF', … },
 *
 *  Contenido y cierre en la misma linea: la pila no bajaba nunca y las rutas se
 *  acumulaban (`CHROME.controls.buttonPrimary.…​.alert` donde iba `CHROME.alert`).
 *  Medido antes del arreglo: 594 rutas incoherentes en rottay (31 %), 63 en
 *  evnto (15 %), 0 en bithire — que salia limpio solo porque cierra todas sus
 *  llaves en linea propia. El latente no se veia porque `scopeOfBlock` solo
 *  consulta este indice cuando hay un docblock CON tags, y hoy no hay ninguno.
 *
 *  Corre sobre el texto sin comentarios (`blankComments` de mirror-parity) para
 *  que una llave comentada no mueva el nivel, y saltea las llaves dentro de
 *  strings: hoy el corpus no tiene ninguna, y el test planta una para que siga
 *  siendo verdad.
 */
export function pathIndex(text) {
  const clean = blankComments(text);
  const lines = clean.split('\n');
  const perLine = [];
  const stack = [];      // nombres de los niveles abiertos, alineados con las llaves
  let root = null;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    perLine[i + 1] = { path: root ? [root, ...stack].join('.') : null, opens: null };

    // F4A-8 (defecto medido por el worker, radio cero sobre los contadores):
    // el esqueleto del tema es `export const rottayBrandTheme: … = {` — sin el
    // `export` opcional la raiz quedaba null y NINGUNA hoja THEME.* podia
    // recibir tag (scopeOfBlock devolvia null).
    const constOpen = line.match(/^(?:export\s+)?const\s+([A-Za-z0-9_$]+)\s*(?::[^=]*)?=\s*\{/);
    let j = 0;
    if (constOpen) {
      root = normalizeRoot(constOpen[1]);
      stack.length = 0;
      perLine[i + 1].opens = root;
      j = line.indexOf('{') + 1;   // esa llave ya la conto el const
    }

    let pendingKey = null;         // la ultima clave vista antes de una `{`
    let token = '';
    let quote = null;

    for (; j < line.length; j += 1) {
      const ch = line[j];
      if (quote !== null) {
        if (ch === '\\') { j += 1; continue; }
        if (ch === quote) quote = null;
        continue;
      }
      // `blankComments` limpia los bloques `/* */`, no los `//` de linea: sin
      // esto, `// Semantic ramp:` entra como clave y produce rutas como
      // `PALETTE.// Semantic`.
      if (ch === '/' && line[j + 1] === '/') break;
      if (ch === "'" || ch === '"' || ch === '`') { quote = ch; token = ''; continue; }
      if (ch === ':') {
        pendingKey = token.trim().replace(/^['"`]|['"`]$/g, '') || null;
        // La ruta se anota AQUI, con la pila tal como esta en la posicion de la
        // clave. Anotarla al final de la linea la calcularia con la pila ya
        // cerrada: `…, shadowActive: "x", bg: '#FFF' },` daria
        // `CHROME.controls.shadowActive` en vez de
        // `CHROME.controls.buttonPrimary.shadowActive`.
        if (pendingKey !== null && root !== null && perLine[i + 1].opens === null) {
          // F4A-8: la composicion por spread inline (`clave: { ...A, ...B },`)
          // CABLEA planos, no autora un sub-arbol — anotarla abria rutas
          // fantasma (`THEME.surfaces` en evnto) que ninguna hoja tiene.
          // La llave se sigue contando para el NIVEL; solo no se anota ruta.
          const resto = line.slice(j + 1);
          if (!/^\s*\{\s*\.\.\./.test(resto)) {
            perLine[i + 1].opens = [root, ...stack, pendingKey].join('.');
          }
        }
        token = '';
        continue;
      }
      if (ch === ',') { pendingKey = null; token = ''; continue; }
      if (ch === '{') {
        if (root === null) { token = ''; continue; }
        // `opens` ya quedo anotado en el `:` de esta clave, con la misma pila.
        stack.push(pendingKey);
        pendingKey = null; token = '';
        continue;
      }
      if (ch === '}') {
        if (stack.length > 0) stack.pop();
        else root = null;
        pendingKey = null; token = '';
        continue;
      }
      token += ch;
    }

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
  const absentCandidates = [];

  for (const block of blocks) {
    for (const bad of block.malformed) {
      failures.push(`${tenant}:${bad.line}: ${bad.reason}`);
    }
    const { domicile, governor, placeholder, absent } = block.tags;
    if (domicile === null && governor === null && placeholder === null && absent === null) continue;

    if (absent !== null) {
      if (domicile !== null || placeholder !== null) {
        failures.push(`${tenant}:${block.start}: @absent no se combina con @domicile/@placeholder en el mismo docblock`);
        continue;
      }
      if (absent === '') { failures.push(`${tenant}:${block.start}: @absent sin ruta`); continue; }
      if (governor === null || governor === '') {
        failures.push(`${tenant}:${block.start}: @absent ${absent} sin @governor (es obligatorio y de una linea)`);
        continue;
      }
      // Contradiccion: `@absent` declara que ESTE tema no autora la hoja. Si
      // la autora, es mentira — a diferencia de `@placeholder`, aca la
      // igualdad es EXACTA (nunca prefijo): `@absent CHROME.table` no puede
      // taparse detras de que el tema autore `CHROME.table.bg`.
      if (leaves.has(absent)) {
        failures.push(`${tenant}:${block.start}: @absent ${absent} contradictorio — ${tenant} SI autora esa hoja`);
        continue;
      }
      absentCandidates.push({ slot: absent, governor, line: block.start });
      continue;
    }

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
      // Contradiccion EXTENDIDA (F4A-4): un placeholder cubre por PREFIJO, asi
      // que contradice si el tema autora la hoja exacta O cualquier hoja que
      // cuelgue de ella. Es lo que fuerza el ciclo de vida: cuando una
      // reescritura F4A-5..15 hace que el tema autore algo bajo P, el
      // placeholder P tiene que borrarse en ESE lote o el gate lo dice.
      const autoradas = [...leaves].filter((h) => h === placeholder || h.startsWith(`${placeholder}.`));
      if (autoradas.length > 0) {
        failures.push(
          `${tenant}:${block.start}: @placeholder ${placeholder} contradictorio — ${tenant} SI autora `
          + `${autoradas.length} hoja(s) bajo esa ruta (p.ej. ${autoradas[0]})`,
        );
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

  // Validaciones de @absent que necesitan el conjunto COMPLETO de placeholders
  // del mismo tema (por eso corren DESPUES del loop, no inline: un
  // @placeholder puede aparecer en el texto despues del @absent que cubre).
  const absences = [];
  const seenAbsent = new Set();
  for (const cand of absentCandidates) {
    if (seenAbsent.has(cand.slot)) {
      failures.push(`${tenant}:${cand.line}: @absent ${cand.slot} duplicado en este tema`);
      continue;
    }
    const coveredByPlaceholder = placeholders.some((p) => cand.slot === p.slot || cand.slot.startsWith(`${p.slot}.`));
    if (coveredByPlaceholder) {
      failures.push(`${tenant}:${cand.line}: @absent ${cand.slot} ya cubierta por @placeholder de este mismo tema`);
      continue;
    }
    seenAbsent.add(cand.slot);
    absences.push({ tenant, slot: cand.slot, governor: cand.governor, line: cand.line });
    tags.push({ tenant, slot: cand.slot, kind: 'absent', governor: cand.governor, line: cand.line });
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
    absences,
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

  // El universo son las hojas autoradas por algun tema, mas los slots que solo
  // existen como placeholder (huerfanos: nadie cuelga nada de esa ruta).
  const authoredUniverse = new Set(tenants.flatMap((t) => [...perTenant[t].leaves]));
  const phSlots = tenants.flatMap((t) => perTenant[t].placeholders.map((p) => p.slot));
  const orphanPlaceholders = phSlots.filter(
    (p) => ![...authoredUniverse].some((h) => h === p || h.startsWith(`${p}.`)),
  );
  const universe = [...new Set([...authoredUniverse, ...orphanPlaceholders])].sort();

  // Validacion GLOBAL de @absent (sólo se puede hacer aca, con el universo ya
  // ensamblado de los 3 temas): la ruta debe pertenecer al universo de hojas
  // AUTORADAS, por igualdad EXACTA — nunca prefijo. Un `@absent` que no cita
  // una hoja que ALGUN tema autora es un hallazgo, no una hoja legitima.
  for (const tenant of tenants) {
    for (const abs of perTenant[tenant].absences) {
      if (!authoredUniverse.has(abs.slot)) {
        failures.push(
          `${tenant}:${abs.line}: @absent ${abs.slot} no pertenece al universo de hojas autoradas `
          + '(ninguna fuente lo autora como hoja exacta; los prefijos de familia no son validos)',
        );
      }
    }
  }

  // COBERTURA POR PREFIJO (F4A-4, adjudicada): un `@placeholder P` da posicion
  // `placeholder` a TODO slot del universo que sea `P` o cuelgue de `P.`. Sin
  // esto, un placeholder de familia creaba un slot virtual y dejaba las hojas
  // ausentes contadas como divergentes — el reves de lo que declara.
  const positions = {};
  for (const tenant of tenants) {
    const map = new Map();
    for (const leaf of perTenant[tenant].leaves) map.set(leaf, 'authored');
    for (const ph of perTenant[tenant].placeholders) {
      for (const slot of universe) {
        if (slot === ph.slot || slot.startsWith(`${ph.slot}.`)) {
          if (!map.has(slot)) map.set(slot, 'placeholder');
        }
      }
    }
    positions[tenant] = map;
  }
  const complete = universe.filter((slot) => tenants.every((t) => positions[t].has(slot)));
  // Dos intersecciones, dos preguntas distintas: la AUTORADA (hojas que los 3
  // autoran — el ancla de F4A-0, 345) y la DEL DOCUMENTO (slots con posicion
  // en los 3, placeholders incluidos — la que se mueve con F4A-4; 2613 − 787
  // = 1826 cierra con la divergencia). No se fusionan.
  const completeAuthored = universe.filter((slot) => tenants.every((t) => positions[t].get(slot) === 'authored'));
  // Los exclusivos igual: se miden sobre hojas AUTORADAS (el ancla 1061/788/2),
  // no sobre posiciones — con placeholders en juego, "lo tengo de alguna forma"
  // no es "lo autoro".
  const exclusive = Object.fromEntries(
    tenants.map((t) => [t, universe.filter((s) => perTenant[t].leaves.has(s) && tenants.filter((x) => x !== t).every((x) => !perTenant[x].leaves.has(s))).length]),
  );

  const untagged = tenants.reduce((sum, t) => sum + (perTenant[t].paintLeafCount - perTenant[t].coveredCount), 0);

  // F4A-close: gate NUEVO, por PAR (tema,slot), no por slot. `disposition`
  // EXTIENDE `positions` (authored+placeholder, sin tocar) con la tercera
  // forma `declared-absent`. `positions` queda intacta y sigue alimentando
  // `divergentSlots`, que pasa a informativo — el gate real es `silentPairs`.
  const disposition = {};
  for (const tenant of tenants) {
    const map = new Map(positions[tenant]);
    for (const abs of perTenant[tenant].absences) {
      if (!map.has(abs.slot)) map.set(abs.slot, 'declared-absent');
    }
    disposition[tenant] = map;
  }
  const placeholderPairs = tenants.reduce(
    (sum, t) => sum + [...disposition[t].values()].filter((v) => v === 'placeholder').length,
    0,
  );
  const declaredAbsentPairs = tenants.reduce((sum, t) => sum + perTenant[t].absences.length, 0);
  // Silencio = par sin NINGUNA disposicion. Es el UNICO defecto del gate nuevo.
  const silentPairs = tenants.reduce((sum, t) => sum + (universe.length - disposition[t].size), 0);

  return {
    $generatedBy: 'scripts/generate/tokens/manifest/variant-parity/index.mjs',
    $regenerate: 'node scripts/generate/tokens/manifest/variant-parity/index.mjs',
    $warning:
      'Mide la FUENTE de los 3 themes, no el artefacto compilado. Hermano de mirror-parity '
      + '(que mide el artefacto): distinta procedencia, distinta unidad, nunca se fusionan.',
    provenance,
    metadataExclusion: {
      law: 'The exclusion is an explicit list of non-paint leaves.',
      count: METADATA_EXCLUSION.length,
      entries: METADATA_EXCLUSION,
      paintDenominator: {
        value: tenants.reduce((sum, tenant) => sum + perTenant[tenant].paintLeafCount, 0),
        unit: 'authored-paint-leaf',
        derivation: 'sum(matrix.paintLeaves)',
      },
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
      intersection: completeAuthored.length,
      // INFORMATIVO (F4A-close): positionIntersection/divergentSlots ya no son
      // el gate; se conservan congelados por continuidad historica (A4/§7.4).
      positionIntersection: complete.length,
      positions: Object.fromEntries(tenants.map((t) => [t, {
        authored: perTenant[t].leaves.size,
        placeholder: [...positions[t].values()].filter((v) => v === 'placeholder').length,
        // Renombrado de `absent` (F4A-13) a `silent`: ese campo SIEMPRE midio
        // "sin ninguna posicion", nunca la nueva disposicion `@absent`. El
        // nombre viejo quedaba ambiguo apenas existe un `declared-absent` real.
        silent: universe.length - positions[t].size,
      }])),
      exclusive,
      orphanPlaceholders: [...new Set(orphanPlaceholders)].sort(),
      paintLeaves: Object.fromEntries(tenants.map((t) => [t, perTenant[t].paintLeafCount])),
      taggedPaintLeaves: Object.fromEntries(tenants.map((t) => [t, perTenant[t].coveredCount])),
      declaredAbsent: Object.fromEntries(tenants.map((t) => [t, perTenant[t].absences.length])),
    },
    ratchet: {
      law: 'decrease-only: each parity counter must stay equal or decrease; '
        + 'divergentSlots is informative and the remaining counters are gated.',
      silentPairs,
      placeholderPairs,
      declaredAbsentPairs,
      untaggedAuthoredLeaves: untagged,
      divergentSlots: universe.length - complete.length,
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
  // Divergent slots are informative; uncovered and unclassified pairs are gated.
  for (const key of ['silentPairs', 'placeholderPairs', 'untaggedAuthoredLeaves']) {
    const pinned = baseline?.[key];
    if (typeof pinned !== 'number') { findings.push(`baseline/index.json no pinea un ${key} numerico`); continue; }
    const now = doc.ratchet[key];
    if (now > pinned) findings.push(`${key} GREW from ${pinned} to ${now}: aparecio divergencia o se perdio cobertura`);
    else if (now < pinned) {
      findings.push(
        `${key} SHRANK from ${pinned} to ${now} -- buena noticia que igual hay que escribir: `
        + `lower \`${key}\` in scripts/generate/tokens/manifest/variant-parity/baseline/index.json (decrease-only)`,
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
    if (current !== text) findings.unshift('generated/variant-parity/index.json desactualizado — corre `node scripts/generate/tokens/manifest/variant-parity/index.mjs`');
    if (findings.length > 0) {
      console.error('variant-parity FAILED:');
      for (const f of findings) console.error(`  - ${f}`);
      process.exit(1);
    }
    console.log(
      `variant-parity OK — ${doc.matrix.universe} slots (${doc.matrix.universe * TENANTS.length} pares), `
      + `${doc.ratchet.silentPairs} silenciosos, ${doc.ratchet.placeholderPairs} con placeholder, `
      + `${doc.ratchet.untaggedAuthoredLeaves} hojas sin tag (${doc.tagRegistry.count} tags leidos)`,
    );
  } else {
    writeFileSync(OUTPUT_PATH, text);
    console.log(
      `variant-parity: generated/variant-parity/index.json escrito (${doc.matrix.universe} slots, `
      + `${doc.ratchet.silentPairs} pares silenciosos, ${doc.ratchet.placeholderPairs} pares con placeholder)`,
    );
  }
}
