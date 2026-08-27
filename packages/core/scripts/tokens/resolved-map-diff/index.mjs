#!/usr/bin/env node
/**
 * resolved-map-diff — el instrumento de la ley CERO-DELTA RESUELTO.
 *
 * POR QUE LA LEY VIEJA DEJO DE SERVIR. Las cohortes 0 y 1 aceptaron con
 * byte-identidad de los cuatro artifacts, y era la ley correcta: no tocaban un
 * solo tema. En el momento en que el frente empieza a colapsar, esa ley se
 * vuelve imposible de cumplir por construccion, y no por un defecto sino por
 * como funciona el compilador: un slot colapsado viaja al artefacto COMO TEXTO
 * `var()`, no como su valor resuelto. Esta linea ya existe hoy en el arbol:
 *
 *     src/foundation/tokens/css/facade/artifacts/bithire/index.css:1349
 *       --ds-color-info-ink: var(--ds-color-info-300);
 *
 * y hay 656 lineas mas como ella en ese solo artefacto. Colapsar `#14283B` a
 * `var(--ds-color-text-primary)` cambia esa linea SIEMPRE. El valor que el
 * usuario ve no cambia; los bytes si.
 *
 * LA LEY QUE LA REEMPLAZA. Lo que una cohorte de colapso debe preservar es el
 * MAPA RESUELTO: para cada (tema, modo, canal), sustituir las cadenas
 * `var(--x, fallback)` hasta llegar a un literal, y comparar ese literal antes
 * y despues. El diff de bytes del artefacto deja de ser el criterio de
 * aceptacion y pasa a ser el REGISTRO de lo que se colapso.
 *
 * Y ES MAS FUERTE DONDE IMPORTA. La byte-identidad afirma que un texto generado
 * no cambio; esta afirma que lo que el navegador pinta no cambio. Es mas debil
 * solo en lo que dejo de aplicar.
 *
 * COMO SE RESUELVE, y donde se planta. La sustitucion es iterativa con tope y
 * con deteccion de ciclo: `var(--a)` -> valor de `--a` -> ... hasta literal.
 * Un canal que no resuelve queda marcado (`unresolved`) con su motivo --
 * `missing` (nadie lo declara), `cycle`, o `depth` -- y NUNCA se lo hace pasar
 * por literal. Un resolvedor que devuelve el texto crudo cuando se pierde
 * declararia iguales dos mapas que difieren.
 *
 * FALLBACKS. `var(--x, F)` usa F solo si `--x` no resuelve. Es la semantica de
 * CSS y es la que hace que un colapso hacia una cabeza no emitida se vea: cae
 * al fallback, el resuelto cambia, y el diff lo dice.
 *
 * CLI:
 *   `--check`  (defecto, fail-closed) recomputa y compara byte a byte con el
 *              mapa pineado. **Es la ley cero-delta hecha continua**: cualquier
 *              edicion de tema que mueva un valor resuelto lo enrojece, y una
 *              que solo colapse forma lo deja verde.
 *   `--write`  re-pinea el mapa.
 *   `--against <archivo>` diffea el mapa actual contra un snapshot y nombra
 *              CADA canal que se movio, con su antes y su despues.
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { packageRoot as findPackageRoot } from '../../lib/repo-root/index.mjs';
import { loadArm, scopesOf } from '../purity/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const CORE_ROOT = findPackageRoot(HERE);
export const OUT_PATH = join(CORE_ROOT, 'manifest/generated/resolved-map.json');

/** Tope de sustitucion. Una cadena mas larga que esto es un defecto, no un dato. */
export const MAX_DEPTH = 32;

const VAR_CALL = /var\(\s*(--[\w-]+)\s*(?:,([\s\S]*))?\)/;

/** Parte `var(--x, resto)` respetando parentesis balanceados en el fallback. */
export function splitVar(text) {
  const start = text.indexOf('var(');
  if (start === -1) return null;
  let depth = 0;
  for (let index = start + 3; index < text.length; index += 1) {
    if (text[index] === '(') depth += 1;
    else if (text[index] === ')') {
      depth -= 1;
      if (depth === 0) {
        const inner = text.slice(start + 4, index);
        const comma = splitTopLevelComma(inner);
        return {
          before: text.slice(0, start),
          name: (comma ? inner.slice(0, comma) : inner).trim(),
          fallback: comma === null ? null : inner.slice(comma + 1).trim(),
          after: text.slice(index + 1),
        };
      }
    }
  }
  return null;
}

function splitTopLevelComma(text) {
  let depth = 0;
  for (let index = 0; index < text.length; index += 1) {
    if (text[index] === '(') depth += 1;
    else if (text[index] === ')') depth -= 1;
    else if (text[index] === ',' && depth === 0) return index;
  }
  return null;
}

/**
 * Resuelve un valor contra un scope, por CADENA y no por conjunto global.
 *
 * DEFECTO PROPIO, CORREGIDO ACA. La primera version marcaba ciclo cuando un
 * canal ya sustituido volvia a aparecer, y eso convirtio en "ciclo" a 36 casos
 * que no lo son: un valor puede nombrar el mismo canal dos veces sin ninguna
 * circularidad --
 *   --ds-table-row-focus-shadow:
 *     inset 0 0 0 1px color-mix(in srgb, var(--ds-color-primary) 28%, transparent),
 *     0 4px 14px color-mix(in srgb, var(--ds-color-primary) 8%, transparent)
 * es dos referencias independientes al mismo color, no un bucle. Un ciclo es
 * que resolver un canal lleve DE VUELTA a ese mismo canal, y eso solo se ve
 * con la cadena abierta, no con la lista de todo lo visto.
 *
 * Por eso la resolucion es recursiva con un conjunto `visiting` que viaja por
 * la RAMA: cada referencia se resuelve con su propia copia, dos hermanas no se
 * estorban, y un canal que se referencia a si mismo -- directa o
 * transitivamente -- se marca `cycle` y jamas se hace pasar por literal.
 */
export function resolveValue(raw, scope, { maxDepth = MAX_DEPTH, visiting = new Set(), depth = 0 } = {}) {
  let text = String(raw);
  let unresolved = null;
  for (let guard = 0; guard <= maxDepth; guard += 1) {
    if (depth > maxDepth) return { value: text.trim(), unresolved: { channel: null, reason: 'depth' } };
    const parsed = splitVar(text);
    if (!parsed) return { value: text.trim(), unresolved };
    const { name, fallback } = parsed;
    if (visiting.has(name)) {
      // La rama vuelve sobre si misma: se corta y se declara, nunca se aplana.
      return { value: text.trim(), unresolved: unresolved ?? { channel: name, reason: 'cycle' } };
    }
    const declared = scope[name];
    if (declared !== undefined) {
      const inner = resolveValue(declared, scope, {
        maxDepth, depth: depth + 1, visiting: new Set([...visiting, name]),
      });
      if (inner.unresolved && !unresolved) unresolved = inner.unresolved;
      text = `${parsed.before}${inner.value}${parsed.after}`;
      continue;
    }
    if (fallback !== null) { text = `${parsed.before}${fallback}${parsed.after}`; continue; }
    return { value: text.trim(), unresolved: unresolved ?? { channel: name, reason: 'missing' } };
  }
  return { value: text.trim(), unresolved: unresolved ?? { channel: null, reason: 'depth' } };
}

export function resolveScope(scope, options) {
  const resolved = {};
  const unresolved = [];
  for (const [channel, raw] of Object.entries(scope)) {
    const outcome = resolveValue(raw, scope, options);
    resolved[channel] = outcome.value;
    if (outcome.unresolved) unresolved.push({ channel, ...outcome.unresolved });
  }
  return { resolved, unresolved };
}

export async function buildResolvedMap({ coreRoot = CORE_ROOT, arm = null } = {}) {
  const loaded = arm ?? (await loadArm({ coreRoot }));
  const themes = {};
  const unresolvedAll = [];
  for (const [vertical, theme] of Object.entries(loaded.themes)) {
    const scopes = scopesOf(loaded.compile({ brandTheme: theme, tenantSlug: vertical }));
    themes[vertical] = {};
    for (const [scopeName, scope] of Object.entries(scopes)) {
      const { resolved, unresolved } = resolveScope(scope);
      themes[vertical][scopeName] = Object.fromEntries(Object.entries(resolved).sort(([a], [b]) => (a < b ? -1 : 1)));
      for (const item of unresolved) unresolvedAll.push({ vertical, scope: scopeName, ...item });
    }
  }
  return {
    generated: true,
    generator: 'scripts/tokens/resolved-map-diff/index.mjs',
    schemaVersion: 1,
    law: {
      statement: 'CERO-DELTA RESUELTO: una cohorte de colapso preserva este mapa. El diff de bytes del artefacto deja de ser criterio y pasa a ser el registro de lo colapsado.',
      why: 'un slot colapsado viaja al artefacto como texto var(), no como su valor resuelto: la byte-identidad es imposible por construccion en cuanto el frente colapsa.',
      unresolvedLaw: 'un canal que no resuelve se marca con su motivo (missing | cycle | depth) y jamas se lo hace pasar por literal.',
      fallbackLaw: 'var(--x, F) usa F solo si --x no resuelve, que es la semantica de CSS y lo que hace visible un colapso hacia una cabeza no emitida.',
      maxDepth: MAX_DEPTH,
    },
    stats: {
      verticals: Object.keys(themes).length,
      scopes: Object.values(themes).reduce((sum, scopes) => sum + Object.keys(scopes).length, 0),
      channels: Object.values(themes).reduce((sum, scopes) => sum + Object.values(scopes).reduce((inner, map) => inner + Object.keys(map).length, 0), 0),
      unresolved: unresolvedAll.length,
      unresolvedByReason: unresolvedAll.reduce((acc, item) => { acc[item.reason] = (acc[item.reason] ?? 0) + 1; return acc; }, {}),
    },
    unresolved: unresolvedAll,
    themes,
  };
}

/** Diff canal a canal entre dos mapas resueltos. Nombra cada movimiento. */
export function diffMaps(before, after) {
  const moved = [];
  const verticals = new Set([...Object.keys(before.themes ?? {}), ...Object.keys(after.themes ?? {})]);
  for (const vertical of [...verticals].sort()) {
    const scopes = new Set([...Object.keys(before.themes?.[vertical] ?? {}), ...Object.keys(after.themes?.[vertical] ?? {})]);
    for (const scope of [...scopes].sort()) {
      const from = before.themes?.[vertical]?.[scope] ?? {};
      const to = after.themes?.[vertical]?.[scope] ?? {};
      for (const channel of [...new Set([...Object.keys(from), ...Object.keys(to)])].sort()) {
        if (from[channel] === to[channel]) continue;
        moved.push({ vertical, scope, channel, before: from[channel] ?? null, after: to[channel] ?? null });
      }
    }
  }
  return moved;
}

export const serialize = (doc) => `${JSON.stringify(doc, null, 2)}\n`;
export const sha256 = (text) => createHash('sha256').update(text).digest('hex');
export function withDigest(doc) {
  const { digest, ...rest } = doc;
  return { ...rest, digest: sha256(serialize({ ...rest, digest: null })) };
}

async function main(argv) {
  const flags = argv.slice(2);
  const mode = flags.length === 0 ? '--check' : flags[0];
  if (!['--check', '--write', '--against'].includes(mode)) {
    console.error('uso: node scripts/tokens/resolved-map-diff/index.mjs [--check|--write|--against <snapshot>]');
    process.exit(2);
  }
  const doc = withDigest(await buildResolvedMap());
  const text = serialize(doc);
  if (mode === '--write') {
    mkdirSync(dirname(OUT_PATH), { recursive: true });
    writeFileSync(OUT_PATH, text);
    console.log(`resolved-map-diff: escrito — ${doc.stats.channels} canales resueltos, ${doc.stats.unresolved} sin resolver, digest ${doc.digest.slice(0, 12)}`);
    return;
  }
  if (mode === '--against') {
    const snapshot = flags[1];
    if (!snapshot) { console.error('--against exige la ruta de un snapshot'); process.exit(2); }
    const moved = diffMaps(JSON.parse(readFileSync(snapshot, 'utf8')), doc);
    if (moved.length === 0) { console.log('resolved-map-diff: CERO-DELTA RESUELTO — ningun canal se movio'); return; }
    console.error(`resolved-map-diff: ${moved.length} canales movieron su valor resuelto:`);
    for (const item of moved.slice(0, 60)) console.error(`  ${item.vertical}/${item.scope} ${item.channel}: ${item.before} -> ${item.after}`);
    if (moved.length > 60) console.error(`  ... y ${moved.length - 60} mas`);
    process.exit(1);
  }
  let current = null;
  try { current = readFileSync(OUT_PATH, 'utf8'); } catch { current = null; }
  if (current === null) { console.error(`resolved-map-diff: FAIL — ${OUT_PATH} no existe. Corre --write.`); process.exit(1); }
  if (current !== text) {
    const moved = diffMaps(JSON.parse(current), doc);
    console.error(`resolved-map-diff: FAIL — el mapa resuelto se movio (${moved.length} canales).`);
    for (const item of moved.slice(0, 30)) console.error(`  ${item.vertical}/${item.scope} ${item.channel}: ${item.before} -> ${item.after}`);
    process.exit(1);
  }
  console.log(`resolved-map-diff: OK — ${doc.stats.channels} canales, cero-delta resuelto contra el pin`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv).catch((error) => { console.error(`resolved-map-diff: ${error?.message ?? error}`); process.exit(1); });
}
