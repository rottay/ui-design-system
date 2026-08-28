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
 * `lib/engine/skin-files/`, el mismo que consumen el token-audit y
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
 *
 *   (b) UN FALLBACK FUNCIONAL QUE ALCANZA RAIZ CUENTA COMO CABLEADO, aunque la
 *       raiz venga envuelta: `var(--ds-x, color-mix(in srgb, var(--ds-raiz) 8%,
 *       transparent))` esta cableado. Por eso el fallback se lee como TEXTO
 *       hasta el parentesis balanceado y se busca la raiz dentro, en vez de
 *       exigir que el fallback sea un `var()` pelado. Exigir la forma pelada
 *       declararia deuda a la pintura que ya obedece la ley.
 *
 * Y DOS INVARIANTES DE FORMA, que el gate se comprueba a si mismo: ningun
 * nombre de la deuda puede ser destino de fallback (rompe (a)) y ninguno puede
 * tener un fallback que alcance raiz (rompe (b)). Si el clasificador se rompe,
 * el gate lo dice en vez de reportar un numero plausible.
 *
 * Usage: node scripts/engine/cascade-wiring-ratchet/index.mjs
 * Exit 0 = la deuda es exactamente la del baseline. Exit 1 = se movio.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { collectSkinFiles } from '../../lib/engine/skin-files/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const BASELINE_PATH = join(HERE, 'cascade-wiring-ratchet.baseline.json');

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
    yield { name: match[1], fallback: comma >= 0 ? inner.slice(comma + 1) : null };
  }
}

const DS_IN_FALLBACK = /var\(\s*(--ds-[a-zA-Z0-9_-]+)/g;

/** La clasificacion completa, en una pasada sobre el corpus. */
export function classifyCascadeWiring(files = collectSkinFiles()) {
  const read = new Set();
  const fallbackTargets = new Set();
  const reachesRoot = new Set();

  for (const file of files) {
    const text = stripComments(readFileSync(file, 'utf8'));
    for (const call of varCalls(text)) {
      if (!call.name.startsWith('--ds-')) continue;
      read.add(call.name);
      if (!call.fallback) continue;
      let found = false;
      for (const target of call.fallback.matchAll(DS_IN_FALLBACK)) {
        fallbackTargets.add(target[1]);
        found = true;
      }
      if (found) reachesRoot.add(call.name);
    }
  }

  // Regla (a): el denominador excluye los destinos.
  const denominator = [...read].filter((name) => !fallbackTargets.has(name)).sort();
  // Regla (b): cableado = algun sitio de lectura alcanza raiz.
  const debt = denominator.filter((name) => !reachesRoot.has(name));

  return {
    files: files.length,
    read: read.size,
    roots: fallbackTargets.size,
    fallbackTargets,
    reachesRoot,
    denominator,
    wired: denominator.length - debt.length,
    debt,
  };
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
  return { failures };
}

export function collectFindings({ baselinePath = BASELINE_PATH, files } = {}) {
  const findings = [];
  const result = classifyCascadeWiring(files);
  findings.push(...shapeFailures(result).failures);

  if (!existsSync(baselinePath)) return ['cascade-wiring-ratchet.baseline.json is missing'];
  let baseline;
  try {
    baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
  } catch {
    return ['cascade-wiring-ratchet.baseline.json is not valid JSON'];
  }

  const pinned = baseline.debt;
  if (typeof pinned !== 'number') {
    findings.push(
      `cascade-wiring-ratchet.baseline.json does not pin a numeric debt (got ${JSON.stringify(pinned ?? null)})`,
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
        'lower `debt` in scripts/engine/cascade-wiring-ratchet/cascade-wiring-ratchet.baseline.json ' +
        '(decrease-only means the baseline follows the tree DOWN, never up)',
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
      `(${result.wired} reach a root; ${result.roots} roots/ramps excluded from the denominator; ` +
      `${result.files} skin files)`,
  );
}

/* El guard nombra el ARCHIVO, no el nombre del entry. La forma anterior era
 * `process.argv[1].endsWith('index.mjs')`, verdadera para CUALQUIER entry del
 * arbol: por la ley folder/index todo productor se llama `index.mjs`, asi que
 * importar este modulo desde otro productor le ejecutaba el main -- y un fallo
 * habria matado al importador con un `process.exit(1)` ajeno. Latente hasta el
 * 2026-08-28 solo porque nadie lo importaba todavia. */
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
