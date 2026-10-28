/**
 * cascade-wiring-ratchet — cuanta pintura todavia NO llega a una raiz.
 *
 * ARCHITECTURE §1.6 declara la ley de la cascada: un canal de componente
 * resuelve por fallback encadenado
 *
 *     var(--ds-<componente>-<canal>, var(--ds-<raiz>))
 *
 * y "a per-component channel with no path to any root is debt, and the orphan
 * count is a decrease-only ratchet". Este gate ES ese contador. No existia:
 * habia censos de canales y de literales, pero ninguno clasificaba la pintura
 * POR NOMBRE contra la ley del fallback.
 *
 * UN SOLO WALKER. El corpus lo da `collectSkinFiles()` de
 * `libraries/engine/skins/files/`, el mismo que consumen el token-audit y
 * literal-ownership-gate. No hay una segunda medicion del corpus en este
 * archivo, a proposito: dos walkers son dos verdades.
 *
 * LAS DOS REGLAS DE CONSTRUCCION (roadmap §5), que son lo que hace honesto al
 * contador:
 *
 *   (a) LAS RAICES Y RAMPAS QUEDAN FUERA DEL DENOMINADOR. Un nombre que es
 *       DESTINO de fallback es a donde la cascada llega, no deuda que la
 *       cascada deba. Contarlos seria peor que ruido: recablear bien -- darle
 *       a un canal huerfano un fallback a raiz -- mete esa raiz en el corpus y
 *       SUBIRIA el contador. Un ratchet que sube cuando arreglas algo no mide
 *       lo que dice medir.
 *       La exclusion del denominador tambien se reconoce por PERTENENCIA: un
 *       nombre declarado en `foundation/base` (las escalas raiz) -- y fuera de
 *       ahi a lo sumo re-declarado por un tema en `foundation/themes` -- es
 *       raiz aunque ningun skin lo nombre como destino de fallback. Sin esto,
 *       leer una raiz pelada (`z-index: var(--ds-z-fixed)`) la contaba como
 *       canal de componente huerfano. Un canal de componente declarado con un
 *       literal NO entra por aca: no es raiz y sigue siendo deuda (§1.6).
 *
 *   (b) UN FALLBACK FUNCIONAL QUE ALCANZA RAIZ CUENTA COMO CABLEADO, aunque la
 *       raiz venga envuelta: `var(--ds-x, color-mix(in srgb, var(--ds-raiz) 8%,
 *       transparent))` esta cableado. Por eso el fallback se lee como TEXTO
 *       hasta el parentesis balanceado y se busca la raiz dentro, en vez de
 *       exigir que el fallback sea un `var()` pelado. Exigir la forma pelada
 *       declararia deuda a la pintura que ya obedece la ley.
 *
 * El credito directo y transitivo exige valor producido y alcance de selector;
 * mencionar un destino o pertenecer al censo no prueba terminacion.
 *
 * Y DOS INVARIANTES DE FORMA, que el gate se comprueba a si mismo: ningun
 * nombre de la deuda puede ser destino de fallback (rompe (a)) y ninguno puede
 * tener un fallback que alcance raiz (rompe (b)). Si el clasificador se rompe,
 * el gate lo dice en vez de reportar un numero plausible.
 *
 * Usage: node scripts/check/engine/cascade-wiring/index.mjs
 * Exit 0 = la deuda es exactamente la del baseline. Exit 1 = se movio.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import postcss from 'postcss';

import { collectSkinFiles } from '../../../libraries/engine/skins/files/index.mjs';
import { collectAuthoredStylesheets, collectChannelProducers } from '../../../libraries/tokens/producers/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const BASELINE_PATH = join(HERE, 'baseline/index.json');

const stripComments = (source) => source.replace(/\/\*[\s\S]*?\*\//g, '');

/**
 * Cada `var(--ds-…)` del texto, con su fallback como TEXTO crudo hasta el
 * parentesis balanceado. Balanceado y no regex porque el fallback puede
 * contener `color-mix(...)` con sus propias comas: partir por la primera coma
 * cortaria el argumento en dos y perderia la raiz de adentro.
 */
export function* varCalls(text) {
  const opener = /var\(\s*(--[a-zA-Z0-9_-]+)/g;
  let match;
  while ((match = opener.exec(text))) {
    let index = opener.lastIndex;
    let depth = 1;
    while (index < text.length && depth > 0) {
      const char = text[index];
      if (char === '(') depth += 1;
      else if (char === ')') depth -= 1;
      index += 1;
    }
    const inner = text.slice(match.index + 'var('.length, index - 1);
    let comma = -1;
    let nested = 0;
    for (let i = 0; i < inner.length; i += 1) {
      const char = inner[i];
      if (char === '(') nested += 1;
      else if (char === ')') nested -= 1;
      else if (char === ',' && nested === 0) { comma = i; break; }
    }
    yield { name: match[1], fallback: comma >= 0 ? inner.slice(comma + 1) : null, start: match.index, end: index };
  }
}

const DS_IN_FALLBACK = /var\(\s*(--ds-[a-zA-Z0-9_-]+)/g;

const DECLARATION = /(--ds-[a-zA-Z0-9_-]+)\s*:/g;
const FOUNDATION_BASE = '/tokens/css/foundation/base/';
const FOUNDATION_THEMES = '/tokens/css/foundation/themes/';

/**
 * Las raices por PERTENENCIA de la regla (a): cada nombre con al menos una
 * declaracion autorada en `foundation/base` y ninguna fuera de `foundation/base`
 * o `foundation/themes` (un tema puede re-declarar el valor de una raiz; un
 * archivo de componente que la declara la convierte en canal, y queda fuera).
 * Lee el mismo corpus autorado que el censo de productores.
 */
export function collectFoundationBaseRoots(stylesheets = collectAuthoredStylesheets()) {
  const inBase = new Set();
  const outside = new Set();
  for (const file of stylesheets) {
    const posix = file.split('\\').join('/');
    const owner = posix.includes(FOUNDATION_BASE) ? 'base' : posix.includes(FOUNDATION_THEMES) ? 'theme' : 'other';
    for (const match of stripComments(readFileSync(file, 'utf8')).matchAll(DECLARATION)) {
      if (owner === 'base') inBase.add(match[1]);
      else if (owner === 'other') outside.add(match[1]);
    }
  }
  return new Set([...inBase].filter((name) => !outside.has(name)));
}

const ROOT_SELECTOR = /^(?::root|html)$/;
const FROZEN = /\/engines\/(?:classic|rustic)\//;
const engineOf = (file = '') => /\/engines\/(modern|classic|rustic)\//.exec(file.split('\\').join('/'))?.at(1) ?? 'shared';
const realmOf = (site) => site.realm ?? (FROZEN.test(site.file ?? '') ? engineOf(site.file) : 'modern');
const INVALID_TERMINAL = /^(?:initial|inherit|unset|revert|revert-layer)$/i;

/** Bounded static proof: exact selector arms or document-root inheritance. */
export function collectProductionEvidence(files, eligibleNames, { excludeFrozen = false } = {}) {
  const roots = new Set();
  for (const file of files) {
    const path = file.split('\\').join('/');
    const at = path.lastIndexOf('/src/');
    if (at >= 0) roots.add(path.slice(0, at));
  }
  const authored = new Set(files.filter((file) => file.endsWith('.css')));
  for (const root of roots) {
    for (const file of collectAuthoredStylesheets(root)) authored.add(file);
  }
  const declarations = new Map();
  const sites = new Map();
  const fallbacks = new Map();
  for (const file of [...authored].sort()) {
    if (excludeFrozen && FROZEN.test(file.split('\\').join('/'))) continue;
    const reads = [];
    const ast = postcss.parse(readFileSync(file, 'utf8'), { from: file });
    const layerIds = new Map();
    ast.walkAtRules('layer', (node) => layerIds.set(node, layerIds.size));
    let order = 0;
    ast.walkDecls((decl) => {
      order += 1;
      if (decl.parent.type !== 'rule' || decl.parent.parent.type === 'rule') return;
      const conditions = [];
      const layers = [];
      for (let node = decl.parent.parent; node && node.type !== 'root'; node = node.parent) {
        if (node.type !== 'atrule') return;
        if (node.name === 'layer') layers.unshift({
          id: node.params || `@anonymous:${file}:${layerIds.get(node)}`,
          anonymous: !node.params && node.parent.type === 'root',
          order: layerIds.get(node),
        });
        else conditions.unshift(`@${node.name} ${node.params}`);
      }
      if (conditions.some((condition) => /keyframes\b/.test(condition))) return;
      for (const selector of postcss.list.comma(decl.parent.selector)) {
        const site = { file, engine: engineOf(file), selector: selector.trim(), conditions,
          layer: layers.length ? JSON.stringify(layers.map((layer) => layer.id)) : null,
          anonymousLayer: layers.length === 1 && layers.at(0).anonymous,
          layerOrder: layers.at(0)?.order, order };
        if (decl.prop.startsWith('--')) {
          const rows = declarations.get(decl.prop) ?? [];
          rows.push({ ...site, value: decl.value.trim(), important: Boolean(decl.important) });
          declarations.set(decl.prop, rows);
        }
        for (const call of varCalls(stripComments(decl.value))) {
          if (!call.name.startsWith('--ds-')) continue;
          reads.push({ ...call, site });
          if (call.fallback !== null) {
            const rows = fallbacks.get(call.name) ?? [];
            rows.push({ site, value: call.fallback });
            fallbacks.set(call.name, rows);
          }
        }
      }
    });
    sites.set(file, reads);
  }
  const contextKey = (site) => JSON.stringify([site.selector, site.conditions, realmOf(site)]);
  const sameScope = (left, right) => contextKey(left) === contextKey(right);
  const reachable = (row, site) =>
    (row.engine === 'shared' || row.engine === realmOf(site)) &&
    (row.selector === site.selector || ROOT_SELECTOR.test(row.selector));
  const active = (row, site) =>
    row.conditions.every((condition, index) => condition === site.conditions.at(index));
  const winnersCache = new Map();
  const winners = (name, site) => {
    const key = `${name}\0${contextKey(site)}`;
    if (winnersCache.has(key)) return winnersCache.get(key);
    const reachableRows = (declarations.get(name) ?? []).filter((row) => reachable(row, site));
    let rows = reachableRows.filter((row) => active(row, site));
    if (rows.length === 0) return [];
    const possible = reachableRows.filter((row) => !active(row, site));
    const local = rows.filter((row) => row.selector === site.selector ||
      (ROOT_SELECTOR.test(row.selector) && ROOT_SELECTOR.test(site.selector ?? '')));
    if (local.length > 0) rows = local;
    const important = rows.some((row) => row.important);
    if (important) rows = rows.filter((row) => row.important);
    const layered = rows.filter((row) => row.layer !== null);
    const unlayered = rows.filter((row) => row.layer === null);
    if (important && layered.length > 0) rows = layered;
    else if (!important && unlayered.length > 0) rows = unlayered;
    const groups = new Map();
    for (const row of rows) {
      const group = `${row.file}\0${row.layer}`;
      const held = groups.get(group);
      const specificity = row.selector === ':root' ? 1 : 0;
      const heldSpecificity = held?.selector === ':root' ? 1 : 0;
      if (!held || specificity > heldSpecificity ||
          (specificity === heldSpecificity && row.order > held.order)) groups.set(group, row);
    }
    const contenders = [...groups.values()];
    const known = contenders.filter((row) => !row.anonymousLayer || !contenders.some((other) =>
      other.anonymousLayer && other.file === row.file &&
      (important ? other.layerOrder < row.layerOrder : other.layerOrder > row.layerOrder)));
    // Unknown condition states and unresolved import/named-layer order retain every contender.
    const result = [...known, ...possible];
    winnersCache.set(key, result);
    return result;
  };
  const cyclicCache = new Map();
  const cyclic = (name, site) => {
    const key = `${name}\0${contextKey(site)}`;
    if (cyclicCache.has(key)) return cyclicCache.get(key);
    const computedSite = (row, context) => ({ ...row, conditions: context.conditions, realm: realmOf(context) });
    const result = winners(name, site).some((origin) => {
      const originSite = computedSite(origin, site);
      const target = `${name}\0${contextKey(originSite)}`;
      const visited = new Set();
      const returnsToTarget = (currentName, currentSite) => {
        const outgoing = new Map();
        for (const row of winners(currentName, currentSite)) {
          const scope = computedSite(row, currentSite);
          const node = `${currentName}\0${contextKey(scope)}`;
          if (node === target) return true;
          const group = outgoing.get(node) ?? { scope, dependencies: [] };
          group.dependencies.push(...varCalls(row.value));
          outgoing.set(node, group);
        }
        for (const [node, group] of outgoing) {
          if (visited.has(node)) continue;
          visited.add(node);
          if (group.dependencies.some((call) => returnsToTarget(call.name, group.scope))) return true;
        }
        return false;
      };
      return [...varCalls(origin.value)].some((call) => returnsToTarget(call.name, originSite));
    });
    cyclicCache.set(key, result);
    return result;
  };
  const producedCache = new Map();
  const produced = (name, site) => {
    if (site.unproven) return false;
    const key = `${name}\0${contextKey(site)}`;
    if (producedCache.has(key)) return producedCache.get(key);
    if ((eligibleNames && name.startsWith('--ds-') && !eligibleNames.has(name)) || cyclic(name, site)) return false;
    const rows = winners(name, site);
    const valid = rows.length > 0 && rows.every((row) => evaluate(row.value, { ...row, conditions: site.conditions, realm: realmOf(site) }, false).valid);
    producedCache.set(key, valid);
    return valid;
  };
  const evaluate = (value, site, followReads, path = new Set()) => {
    if (!value.trim() || INVALID_TERMINAL.test(value.trim())) return { valid: false, rooted: false };
    let end = -1;
    let rooted = false;
    for (const call of varCalls(value)) {
      if (call.start < end) continue;
      end = call.end;
      if (value.at(end - 1) !== ')') return { valid: false, rooted: false };
      if (produced(call.name, site)) { rooted = true; continue; }
      const key = `${call.name}\0${contextKey(site)}`;
      let resolved = { valid: false, rooted: false };
      if (call.fallback !== null) resolved = evaluate(call.fallback, site, followReads, path);
      if (!resolved.valid && followReads && !path.has(key)) {
        const next = new Set(path).add(key);
        for (const edge of fallbacks.get(call.name) ?? []) {
          if (!sameScope(edge.site, site)) continue;
          const candidate = evaluate(edge.value, site, true, next);
          if (candidate.valid && candidate.rooted) { resolved = candidate; break; }
        }
      }
      if (!resolved.valid) return { valid: false, rooted: false };
      rooted ||= resolved.rooted;
    }
    return { valid: true, rooted };
  };
  return {
    sites,
    hasProducedValue: (name, site = { selector: null, conditions: [] }) => produced(name, site),
    reachesProducedValue: (value, site) => {
      const result = evaluate(value, site, true);
      return result.valid && result.rooted;
    },
  };
}

/** La clasificacion completa, en una pasada sobre el corpus. */
export function classifyCascadeWiring(files = collectSkinFiles(), producers, baseRoots) {
  const producerSet = producers ?? collectChannelProducers().producers;
  const foundationBaseRoots = baseRoots ?? collectFoundationBaseRoots();
  const production = collectProductionEvidence(files, producerSet);
  const read = new Set();
  const productiveReads = new Set();
  const fallbackTargets = new Set();
  const reachesRoot = new Set();
  const fallbackEdges = new Map();

  for (const file of files) {
    const text = stripComments(readFileSync(file, 'utf8'));
    for (const call of varCalls(text)) {
      if (!call.name.startsWith('--ds-')) continue;
      read.add(call.name);
      if (!FROZEN.test(file.split('\\').join('/'))) productiveReads.add(call.name);
      if (!call.fallback) continue;
      for (const target of call.fallback.matchAll(DS_IN_FALLBACK)) {
        fallbackTargets.add(target[1]);
        const edges = fallbackEdges.get(call.name) ?? new Set();
        edges.add(target[1]);
        fallbackEdges.set(call.name, edges);
      }
    }
  }

  for (const file of files) {
    for (const call of production.sites.get(file) ?? []) {
      if (realmOf(call.site) !== 'modern' && productiveReads.has(call.name)) continue;
      if (call.fallback && production.reachesProducedValue(call.fallback, call.site)) reachesRoot.add(call.name);
    }
  }

  // Regla (a): el denominador excluye los destinos y las raices por pertenencia.
  const ownedRoots = [...read].filter((name) => !fallbackTargets.has(name) && foundationBaseRoots.has(name)).sort();
  const ownedRootSet = new Set(ownedRoots);
  const denominator = [...read].filter((name) => !fallbackTargets.has(name) && !ownedRootSet.has(name)).sort();
  // Regla (b): cableado = algun sitio de lectura alcanza raiz.
  const debt = denominator.filter((name) => !reachesRoot.has(name));
  const transitivelyUnwired = denominator.filter((name) => !reachesRoot.has(name));

  return {
    files: files.length,
    read: read.size,
    roots: fallbackTargets.size,
    fallbackTargets,
    ownedRoots,
    fallbackEdges,
    reachesRoot,
    denominator,
    wired: denominator.length - debt.length,
    debt,
    transitivelyUnwired,
  };
}

/** A name set is an eligibility census; only source-bound value evidence is terminal proof. */
export function reachesTerminalRoot(name, edges, production) {
  const seen = new Set([name]);
  const queue = [...(edges.get(name) ?? [])];
  while (queue.length > 0) {
    const next = queue.shift();
    if (seen.has(next)) continue;
    seen.add(next);
    if (production?.hasProducedValue?.(next)) return true;
    for (const target of edges.get(next) ?? []) queue.push(target);
  }
  return false;
}

/** Los dos invariantes de forma. Un clasificador roto no puede pasar por sano. */
export function shapeFailures(result) {
  const failures = [];
  const denominatorSet = new Set(result.denominator);
  for (const name of result.debt) {
    // Invariante de la regla (a): una raiz/rampa es a donde la cascada LLEGA.
    // Contarla como deuda es el error que hace subir el contador cuando alguien
    // recablea bien, que es justo lo que este ratchet existe para no hacer.
    if (result.fallbackTargets?.has(name)) {
      failures.push(`shape: ${name} is a fallback destination (root/ramp) and must never be counted as debt`);
    }
    if (result.ownedRoots?.includes(name)) {
      failures.push(`shape: ${name} is a foundation-base root and must never be counted as debt`);
    }
    // Invariante de la regla (b): si alcanza raiz, esta cableado. Contarlo como
    // deuda declararia deudora a la pintura que ya obedece la ley.
    if (result.reachesRoot?.has(name)) {
      failures.push(`shape: ${name} has a fallback that reaches a root and must never be counted as debt`);
    }
    if (!denominatorSet.has(name)) {
      failures.push(`shape: ${name} is counted as debt but is not in the denominator`);
    }
  }
  if (result.debt.length > result.denominator.length) {
    failures.push('shape: the debt set is larger than the denominator it comes from');
  }
  // Ambos contadores requieren terminacion producida: ninguno puede acreditar
  // una cadena que el otro declara rota.
  const transitiveSet = new Set(result.transitivelyUnwired ?? []);
  for (const name of result.debt) {
    if (!transitiveSet.has(name)) {
      failures.push(
        `shape: ${name} is debt under rule (b) but is reported transitively wired -- the transitive walk cannot be laxer than the direct rule`,
      );
    }
  }
  for (const name of transitiveSet) {
    if (!denominatorSet.has(name)) {
      failures.push(`shape: ${name} is counted as transitively unwired but is not in the denominator`);
    }
  }
  return { failures };
}

export function collectFindings({ baselinePath = BASELINE_PATH, files } = {}) {
  const findings = [];
  const result = classifyCascadeWiring(files);
  findings.push(...shapeFailures(result).failures);

  if (!existsSync(baselinePath)) return ['baseline/index.json is missing'];
  let baseline;
  try {
    baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
  } catch {
    return ['baseline/index.json is not valid JSON'];
  }

  const pinned = baseline.debt;
  if (typeof pinned !== 'number') {
    findings.push(
      `baseline/index.json does not pin a numeric debt (got ${JSON.stringify(pinned ?? null)})`,
    );
    return findings;
  }

  if (result.debt.length > pinned) {
    findings.push(
      `debt GREW from ${pinned} to ${result.debt.length}: a component channel with no path to any root ` +
        'was added. Wire it to a root (var(--ds-x, var(--ds-root))) instead of raising the baseline',
    );
  } else if (result.debt.length < pinned) {
    findings.push(
      `debt SHRANK from ${pinned} to ${result.debt.length} -- good news that still has to be written down: ` +
        'lower `debt` in scripts/check/engine/cascade-wiring/baseline/index.json ' +
        '(decrease-only means the baseline follows the tree DOWN, never up)',
    );
  }
  const pinnedTransitive = baseline.transitivelyUnwired;
  if (typeof pinnedTransitive !== 'number') {
    findings.push(
      `baseline/index.json does not pin a numeric transitivelyUnwired (got ${JSON.stringify(pinnedTransitive ?? null)})`,
    );
  } else if (result.transitivelyUnwired.length > pinnedTransitive) {
    findings.push(
      `transitivelyUnwired GREW from ${pinnedTransitive} to ${result.transitivelyUnwired.length}: a fallback chain that used to land on a produced root now dies on a name nobody writes. ` +
        'Give it a producer instead of raising the baseline',
    );
  } else if (result.transitivelyUnwired.length < pinnedTransitive) {
    findings.push(
      `transitivelyUnwired SHRANK from ${pinnedTransitive} to ${result.transitivelyUnwired.length} -- good news that still has to be written down: ` +
        'lower `transitivelyUnwired` in scripts/check/engine/cascade-wiring/baseline/index.json',
    );
  }
  if (typeof baseline.denominator === 'number' && baseline.denominator !== result.denominator.length) {
    findings.push(
      `denominator moved from ${baseline.denominator} to ${result.denominator.length}; re-read the census ` +
        'before touching `debt`',
    );
  }
  return findings;
}

function main() {
  const findings = collectFindings();
  const result = classifyCascadeWiring();
  if (findings.length > 0) {
    console.error('cascade-wiring-ratchet FAILED:');
    for (const finding of findings) console.error(`  - ${finding}`);
    process.exit(1);
  }
  console.log(
    `cascade-wiring-ratchet OK -- ${result.debt.length} names still unwired of ${result.denominator.length} ` +
      `(${result.wired} reach a root; ${result.roots} roots/ramps and ${result.ownedRoots.length} foundation-base roots excluded from the denominator; ` +
      `${result.files} skin files)`,
  );
  console.log(
    `  transitive: ${result.transitivelyUnwired.length} of ${result.denominator.length} names never reach a PRODUCED root ` +
      '(source-bound value and selector proof required)',
  );
}

/* El guard nombra el ARCHIVO, no el nombre del entry. La forma anterior era
 * `process.argv[1].endsWith('index.mjs')`, verdadera para CUALQUIER entry del
 * arbol: por la ley folder/index todo productor se llama `index.mjs`, asi que
 * importar este modulo desde otro productor le ejecutaba el main -- y un fallo
 * habria matado al importador con un `process.exit(1)` ajeno. Latente hasta el
 * 2026-08-28 solo porque nadie lo importaba todavia. */
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
