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
 * FALLBACKS (semantica CORREGIDA 2026-08-27, correccion pre-2B pedida por independent code audit
 * via owner; caso ciclo-miembro reproducido por la postauditoría). La regla
 * de CSS es mas fina que "declarada o no": una custom property cuyo valor
 * computado es GUARANTEED-INVALID se comporta, para el var() que la consume,
 * como si no existiera -- el fallback ENGANCHA. Y son guaranteed-invalid tres
 * cosas: (a) la que nadie declara; (b) la declarada con la palabra `initial`
 * (css-cascade: initial en una custom property la deja guaranteed-invalid);
 * (c) la declarada cuya propia cadena de var() no resuelve (IACVT: invalida en
 * computed-value time, y la regla especial de custom properties la convierte en
 * guaranteed-invalid, NO en inherit). Matiz de ciclos: el miembro DE un ciclo
 * es guaranteed-invalid AUNQUE su var() lleve fallback (las aristas del grafo
 * las crea el primer argumento de cada var(); el fallback no es escape) --
 * solo el CONSUMIDOR EXTERNO del ciclo engancha el suyo. La version anterior a
 * este lote sustituia el texto parcial de (c) y dejaba el fallback sin
 * enganchar: declaraba pintado algo que el navegador no pinta. La excepcion
 * deliberada es `depth`: es la guarda del instrumento, no una invalidez real,
 * y JAMAS engancha un fallback (engancharlo esconderia la guarda).
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

import { packageRoot as findPackageRoot } from '../../../../libraries/repo-root/index.mjs';
import { loadArm, scopesOf } from '../purity/references/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const CORE_ROOT = findPackageRoot(HERE);
export const OUT_PATH = join(CORE_ROOT, 'artifacts/generated/manifest/cascade/values/index.json');

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
 * Por eso la resolucion es recursiva con una PILA ORDENADA `visiting` que viaja
 * por la RAMA: cada referencia se resuelve con su propia copia, dos hermanas no
 * se estorban, y un canal que se referencia a si mismo -- directa o
 * transitivamente -- se marca `cycle` y jamas se hace pasar por literal.
 *
 * CICLO Y FALLBACK (postauditoría independiente, sonda ejecutable): por
 * css-variables-1 §3.1 las aristas del grafo las crea el PRIMER argumento de
 * cada var() (el fallback no es escape), asi que TODA custom property que
 * participa del ciclo computa a guaranteed-invalid y SU PROPIO FALLBACK ES
 * IRRELEVANTE. Los miembros son las propiedades desde la primera aparicion del
 * nombre revisitado hasta el tope de la pila: esos niveles devuelven invalidez
 * SIN enganchar fallback. Solo los niveles EXTERNOS al ciclo (consumidores)
 * enganchan el suyo. La version anterior enganchaba tambien en el miembro y el
 * ciclo desaparecia del instrumento (`--a: var(--b, 1); --b: var(--a, 2)`
 * "resolvia" 1 y 2 sin dejar registro).
 */
/** `initial` (ASCII case-insensitive) deja la custom property guaranteed-invalid. */
export function isGuaranteedInvalid(raw) {
  return typeof raw === 'string' && raw.trim().toLowerCase() === 'initial';
}

export function resolveValue(raw, scope, { maxDepth = MAX_DEPTH, visiting = [], depth = 0, self = undefined } = {}) {
  let text = String(raw);
  let unresolved = null;
  for (let guard = 0; guard <= maxDepth; guard += 1) {
    if (depth > maxDepth) return { value: text.trim(), unresolved: { channel: null, reason: 'depth' } };
    const parsed = splitVar(text);
    if (!parsed) return { value: text.trim(), unresolved };
    const { name, fallback } = parsed;
    const revisit = visiting.indexOf(name);
    if (revisit !== -1) {
      /* La rama vuelve sobre si misma: ciclo. Los miembros son las propiedades
       * desde la primera aparicion de `name` en la pila hasta el tope; se
       * devuelven para que cada nivel superior decida si ES miembro (no
       * engancha) o consumidor externo (engancha si tiene fallback). */
      return { value: text.trim(), unresolved: { channel: name, reason: 'cycle', members: visiting.slice(revisit) } };
    }
    const declared = scope[name];
    if (declared !== undefined && !isGuaranteedInvalid(declared)) {
      const inner = resolveValue(declared, scope, {
        maxDepth, depth: depth + 1, visiting: [...visiting, name], self: name,
      });
      if (inner.unresolved && inner.unresolved.reason === 'depth') {
        /* Guarda del instrumento, no invalidez real: se registra y se sigue
         * con el mejor texto, pero NUNCA se engancha el fallback. */
        if (!unresolved) unresolved = inner.unresolved;
        text = `${parsed.before}${inner.value}${parsed.after}`;
        continue;
      }
      if (inner.unresolved?.reason === 'cycle'
          && Array.isArray(inner.unresolved.members) && inner.unresolved.members.includes(self)) {
        /* Este nivel ES miembro del ciclo: guaranteed-invalid por spec y su
         * propio fallback es irrelevante. Se propaga la invalidez intacta. */
        return { value: text.trim(), unresolved: unresolved ?? inner.unresolved };
      }
      if (inner.unresolved) {
        /* IACVT transitiva (o consumidor EXTERNO de un ciclo): la declarada
         * computa a guaranteed-invalid y el fallback del sitio ENGANCHA. Sin
         * fallback, el consumidor hereda la causa raiz (missing|cycle|guaranteed-invalid). */
        if (fallback !== null) { text = `${parsed.before}${fallback}${parsed.after}`; continue; }
        return { value: text.trim(), unresolved: unresolved ?? { channel: name, reason: inner.unresolved.reason } };
      }
      text = `${parsed.before}${inner.value}${parsed.after}`;
      continue;
    }
    /* No declarada, o declarada con `initial` (guaranteed-invalid por spec):
     * para el var() que la consume es como si no existiera. */
    if (fallback !== null) { text = `${parsed.before}${fallback}${parsed.after}`; continue; }
    const reason = declared === undefined ? 'missing' : 'guaranteed-invalid';
    return { value: text.trim(), unresolved: unresolved ?? { channel: name, reason } };
  }
  return { value: text.trim(), unresolved: unresolved ?? { channel: null, reason: 'depth' } };
}

export function resolveScope(scope, options) {
  const resolved = {};
  const unresolved = [];
  for (const [channel, raw] of Object.entries(scope)) {
    const outcome = resolveValue(raw, scope, { ...options, self: channel });
    resolved[channel] = outcome.value;
    if (isGuaranteedInvalid(raw)) {
      /* La propia declaracion es guaranteed-invalid: se declara con el canal
       * que falla (el externo), nunca se la hace pasar por literal usable. */
      unresolved.push({ channel, reason: 'guaranteed-invalid', cause: null });
    } else if (outcome.unresolved) {
      /* ATRIBUCION (correccion pre-2B): `channel` es el canal EXTERNO que no
       * resolvio y `cause` la variable inmediata que lo hundio. La version
       * anterior pisaba `channel` con la causa y perdia al reclamante: 251
       * entradas con 99 tuplas distintas. */
      unresolved.push({ channel, reason: outcome.unresolved.reason, cause: outcome.unresolved.channel ?? null });
    }
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
    generator: 'scripts/check/tokens/cascade/resolution/index.mjs',
    schemaVersion: 2,
    law: {
      statement: 'CERO-DELTA RESUELTO: una cohorte de colapso preserva este mapa. El diff de bytes del artefacto deja de ser criterio y pasa a ser el registro de lo colapsado.',
      why: 'un slot colapsado viaja al artefacto como texto var(), no como su valor resuelto: la byte-identidad es imposible por construccion en cuanto el frente colapsa.',
      unresolvedLaw: 'un canal que no resuelve se marca con su motivo (missing | cycle | depth | guaranteed-invalid), CON el canal externo que falla y su causa inmediata, y jamas se lo hace pasar por literal.',
      fallbackLaw: 'var(--x, F) usa F cuando --x no esta declarada, es ciclica, o es invalida en computed-value time por su propia cadena de var() (IACVT → guaranteed-invalid, semantica CSS de custom properties); `--x: initial` ES guaranteed-invalid. La guarda depth del instrumento NUNCA engancha un fallback: es una guarda, no una invalidez real.',
      againstLaw: '--against compara valores Y el conjunto unresolved (canal externo + motivo + causa): un colapso que rompe o repara una resolucion sin mover su valor igual FALLA aqui.',
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

/**
 * Diff del CONJUNTO unresolved entre dos mapas. Un colapso que rompe o repara
 * una resolucion puede dejar el valor pintado identico (p.ej. el fallback ya
 * era el literal): comparar solo valores lo declararia cero-delta mintiendo.
 * Multi-set sobre (vertical, scope, canal externo, motivo, causa).
 */
export function diffUnresolved(before, after) {
  const key = (item) => JSON.stringify([item.vertical, item.scope, item.channel, item.reason, item.cause ?? null]);
  const tally = (list) => {
    const map = new Map();
    for (const item of list ?? []) {
      const itemKey = key(item);
      const entry = map.get(itemKey);
      map.set(itemKey, { item, count: (entry?.count ?? 0) + 1 });
    }
    return map;
  };
  const beforeTally = tally(before.unresolved);
  const afterTally = tally(after.unresolved);
  const added = [];
  const removed = [];
  for (const [itemKey, entry] of afterTally) {
    const delta = entry.count - (beforeTally.get(itemKey)?.count ?? 0);
    for (let index = 0; index < delta; index += 1) added.push(entry.item);
  }
  for (const [itemKey, entry] of beforeTally) {
    const delta = entry.count - (afterTally.get(itemKey)?.count ?? 0);
    for (let index = 0; index < delta; index += 1) removed.push(entry.item);
  }
  return { added, removed };
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
    console.error('uso: node scripts/check/tokens/cascade/resolution/index.mjs [--check|--write|--against <snapshot>]');
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
    const beforeDoc = JSON.parse(readFileSync(snapshot, 'utf8'));
    const moved = diffMaps(beforeDoc, doc);
    const drift = diffUnresolved(beforeDoc, doc);
    if (moved.length === 0 && drift.added.length === 0 && drift.removed.length === 0) {
      console.log('resolved-map-diff: CERO-DELTA RESUELTO — ningun canal se movio y el conjunto unresolved quedo intacto');
      return;
    }
    if (moved.length > 0) {
      console.error(`resolved-map-diff: ${moved.length} canales movieron su valor resuelto:`);
      for (const item of moved.slice(0, 60)) console.error(`  ${item.vertical}/${item.scope} ${item.channel}: ${item.before} -> ${item.after}`);
      if (moved.length > 60) console.error(`  ... y ${moved.length - 60} mas`);
    }
    if (drift.added.length > 0 || drift.removed.length > 0) {
      console.error(`resolved-map-diff: el conjunto unresolved se movio (+${drift.added.length}/-${drift.removed.length}):`);
      for (const item of drift.added.slice(0, 60)) console.error(`  + ${item.vertical}/${item.scope} ${item.channel} (${item.reason}, causa: ${item.cause ?? '—'})`);
      for (const item of drift.removed.slice(0, 60)) console.error(`  - ${item.vertical}/${item.scope} ${item.channel} (${item.reason}, causa: ${item.cause ?? '—'})`);
      if (drift.added.length + drift.removed.length > 120) console.error('  ... y mas');
    }
    process.exit(1);
  }
  let current = null;
  try { current = readFileSync(OUT_PATH, 'utf8'); } catch { current = null; }
  if (current === null) { console.error(`resolved-map-diff: FAIL — ${OUT_PATH} no existe. Corre --write.`); process.exit(1); }
  if (current !== text) {
    const beforeDoc = JSON.parse(current);
    const moved = diffMaps(beforeDoc, doc);
    const drift = diffUnresolved(beforeDoc, doc);
    console.error(`resolved-map-diff: FAIL — el mapa resuelto se movio (${moved.length} canales, unresolved +${drift.added.length}/-${drift.removed.length}).`);
    for (const item of moved.slice(0, 30)) console.error(`  ${item.vertical}/${item.scope} ${item.channel}: ${item.before} -> ${item.after}`);
    for (const item of drift.added.slice(0, 15)) console.error(`  +unresolved ${item.vertical}/${item.scope} ${item.channel} (${item.reason}, causa: ${item.cause ?? '—'})`);
    for (const item of drift.removed.slice(0, 15)) console.error(`  -unresolved ${item.vertical}/${item.scope} ${item.channel} (${item.reason}, causa: ${item.cause ?? '—'})`);
    process.exit(1);
  }
  console.log(`resolved-map-diff: OK — ${doc.stats.channels} canales, cero-delta resuelto contra el pin`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv).catch((error) => { console.error(`resolved-map-diff: ${error?.message ?? error}`); process.exit(1); });
}
