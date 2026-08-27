#!/usr/bin/env node
/**
 * normalization-contract-gate — la puerta ejecutable del frente de
 * NORMALIZACION PROFUNDA. Es lo que la directiva del owner exige ANTES de
 * cualquier colapso masivo, y su trabajo no es medir el avance sino impedir el
 * retroceso: que no vuelvan a entrar literales que sombreen una seed ni
 * duplicaciones de una decision superior.
 *
 * LAS CINCO LEYES, y como se comprueba cada una CONTRA LO QUE HOY EXISTE. La
 * arquitectura se preaudito cuando `FirstPartySeedSchema` era una pieza
 * propuesta; hoy el frente tiene inventario, membresia y tabla de owners. Donde
 * una ley asumia una pieza que no se construyo, esta implementado el chequeo
 * EQUIVALENTE sobre los artefactos reales y la sustitucion se declara en
 * `reconciliation` del baseline, nunca en silencio.
 *
 *   L1 CONTRATO TIPADO EQUIVALENTE. `tsc` ya obliga a los tres temas a
 *      satisfacer `FirstPartyBrandTheme`. Lo que `tsc` NO puede ver es que
 *      alguien relaje el contrato mismo, y ese es el unico agujero que este
 *      gate cubre: las 10 claves de FIRST_PARTY_BRAND_THEME_REQUIRED_KEYS
 *      siguen declaradas `readonly` y sin `?`, y `BrandCapabilityCatalog` sigue
 *      siendo `Record` y no `Partial<Record>`. Un contrato relajado compila
 *      perfecto y deja de exigir nada.
 *
 *   L2 MISMA SUPERFICIE SEMANTICA. Todo slot con domicilio del vocabulario
 *      cerrado y con `@governor` no vacio -- eso ya lo hace variant-parity. Lo
 *      que este gate agrega es el ENDURECIMIENTO que F4A-close declaro y nunca
 *      ejecuto: `GOVERNOR_CLASS` dice de si mismo "En F4A-2 se REPORTA, no
 *      bloquea". Aca pasa a bloquear, pero NO como se enuncio.
 *
 *      POR QUE NO EXIJO QUE UN `seed` NOMBRE UN DIAL. Medido: 115 slots seed
 *      tienen governors legitimos y bien escritos que declaran que NO hay dial
 *      ("seed de personalidad de charts: el compilador la copia a
 *      chartPersonality...", "mixta medida en linea compartida...", "sin
 *      coincidencia medida con raiz ni canal vivo..."). Un gate que exigiera el
 *      prefijo `dial:` castigaria 115 declaraciones honestas y premiaria al que
 *      escribe la palabra magica. La forma FALSABLE de la misma ley es la
 *      inversa: un governor no puede nombrar autoridad que no existe. Si dice
 *      `dial: X`, X tiene que ser uno de los 20 controles; si nombra un canal
 *      `--ds-*`, ese canal tiene que existir. Lo que se prohibe es la mentira,
 *      no el silencio.
 *
 *   L3 `unassigned` DECRECE-SOLO desde su ancla. Ninguna cohorte mete un slot
 *      en unassigned; sacarlo es el unico movimiento permitido.
 *
 *   L4 DETECTOR DE RE-INTRODUCCION, las dos formas que el owner nombra:
 *      (a) LITERAL QUE SOMBREA UNA SEED. Un `literalPin` del CSS autorado cuyo
 *          canal pertenece -- segun la MEMBRESIA, que es la pieza que la
 *          cohorte 1 construyo y que la arquitectura no tenia -- a una raiz que
 *          YA tiene ley de derivacion citada. La cohorte 0 solo pudo aproximar
 *          esto con 20 pines sobre cabezas declaradas; con membresia son 152.
 *      (b) DUPLICACION DE DECISION SUPERIOR. Ver la nota de forma abajo.
 *
 *   L5 PRECEDENCIA TENANT-LAST INTACTA. El conjunto sobreescribible por tenant
 *      no se achica: el allowlist sigue componiendo 290 nombres (67 literales +
 *      8x20 de superficie + 9x7 de tipografia) y los 20 controles conservan su
 *      puerta DB. Es la ley que protege contra la clase anti-puerta de la
 *      decision 19: una vertical no puede congelar el resultado terminal de un
 *      control publico.
 *
 * LA NOTA DE FORMA OBLIGATORIA SOBRE L4(b), Y POR QUE ES UN TRINQUETE.
 * El diseno de la cohorte 1 enuncio la ley como "dos slots del mismo tema, la
 * misma raiz y el mismo modo con valores que difieren -> falla". Medido sobre
 * el arbol: eso da 127 grupos y 1.688 slots, es decir casi todo el corpus, y no
 * porque el corpus este roto sino porque esa coordenada es demasiado gruesa --
 * `buttonDefault.bg` y `buttonError.bg` comparten la raiz `tier.control.bg` y
 * DEBEN diferir. Refinada a la coordenada real de decision (tema, raiz,
 * propiedad, estado, modo) siguen siendo 214 grupos y 1.495 slots, y la razon
 * es la misma y es estructural: un corpus que todavia no colapso ES una masa de
 * decisiones repetidas. Esa es la premisa del frente, no su defecto.
 *
 * Por lo tanto L4(b) es un TRINQUETE DECRECE-SOLO sobre esa poblacion, no un
 * "debe ser cero". Cumple exactamente lo que el owner pidio -- impedir VOLVER a
 * introducir duplicacion -- sin exigir que el frente este terminado para que su
 * propia puerta pueda estar verde. Un grupo nuevo la enrojece; uno que se
 * colapsa la baja.
 *
 * Y LA COMPARACION DE VALORES SOLO PREGUNTA SI DIFIEREN. Es la unica aparicion
 * legitima de una igualdad de valor en todo el frente, y esta acotada por
 * construccion: el eje de agrupamiento es la RAIZ, que sale de la membresia;
 * el valor no decide pertenencia, solo dice si el grupo ya tomo dos posiciones.
 * Dos slots de raices DISTINTAS que comparten `#ffffff` no forman grupo y no se
 * miran nunca -- eso es lo que prueba el drill de anti-coincidencia, y por eso
 * va apareado con el de duplicacion-real: uno solo de los dos siempre se puede
 * satisfacer con un detector roto.
 *
 * CONTRATO CLI: `--check` (defecto, fail-closed) | `--write-baseline` re-ancla
 * SOLO a la baja y exige `--reason`. `analyse()` es PURA.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { packageRoot as findPackageRoot } from '../../lib/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const CORE_ROOT = findPackageRoot(HERE);
export const BASELINE_PATH = join(HERE, 'normalization-contract-gate.baseline.json');

export const LAWS = Object.freeze(['L1', 'L2', 'L3', 'L4a', 'L4b', 'L5']);

/** Las 10 claves que `FirstPartyBrandTheme` angosta a requeridas. */
export const REQUIRED_THEME_KEYS = Object.freeze([
  'id', 'name', 'appearance', 'modes', 'palette', 'typography', 'surfaces', 'charts', 'chrome', 'capabilities',
]);

export const ALLOWLIST_COMPOSITION = Object.freeze({ literals: 67, surfaceRoles: 8, surfaceFacets: 20, typeRoles: 9, typeFacets: 7 });
export const ALLOWLIST_TOTAL = ALLOWLIST_COMPOSITION.literals
  + ALLOWLIST_COMPOSITION.surfaceRoles * ALLOWLIST_COMPOSITION.surfaceFacets
  + ALLOWLIST_COMPOSITION.typeRoles * ALLOWLIST_COMPOSITION.typeFacets;

const modeOf = (slotPath) => (String(slotPath).startsWith('OVERLAY.') ? 'overlay' : 'base');

/** L1: el contrato no se relajo. Se lee el texto, porque `tsc` no ve esto. */
export function checkContractShape(contractSource) {
  const findings = [];
  const block = contractSource.match(/export interface FirstPartyBrandTheme extends BrandTheme \{([\s\S]*?)\n\}/);
  if (!block) return [{ law: 'L1', detail: 'no encuentro la declaracion de FirstPartyBrandTheme' }];
  for (const key of REQUIRED_THEME_KEYS) {
    const declaration = new RegExp(`readonly ${key}(\\??):`).exec(block[1]);
    if (!declaration) findings.push({ law: 'L1', detail: `FirstPartyBrandTheme ya no declara readonly ${key}` });
    else if (declaration[1] === '?') findings.push({ law: 'L1', detail: `FirstPartyBrandTheme relajo ${key} a opcional` });
  }
  if (/BrandCapabilityCatalog\s*=\s*Readonly<\s*Partial</.test(contractSource)) {
    findings.push({ law: 'L1', detail: 'BrandCapabilityCatalog se relajo a Partial<Record>: una clave faltante deja de ser error de tipo' });
  }
  if (!/BrandCapabilityCatalog\s*=\s*Readonly<\s*\n?\s*Record</.test(contractSource)) {
    findings.push({ law: 'L1', detail: 'BrandCapabilityCatalog ya no es Readonly<Record<...>>' });
  }
  return findings;
}

/**
 * L2: un governor no puede nombrar autoridad inexistente.
 * El comodin de prosa (`--ds-stats-grid-*`) NO es un canal: es un prefijo de
 * concatenacion, y contarlo fue un falso positivo medido de 24 casos.
 */
export function checkGovernorAuthorities(rows, { controlIds, knownChannels }) {
  const findings = [];
  for (const row of rows) {
    const governor = row.governor ?? '';
    for (const match of governor.matchAll(/dial:\s*([a-z][\w.-]*)/g)) {
      const id = match[1].replace(/[.,;]+$/, '');
      if (!controlIds.has(id)) {
        findings.push({ law: 'L2', detail: `${row.slotId}: el governor nombra "dial: ${id}" y no existe un control con ese id` });
      }
    }
    for (const match of governor.matchAll(/(--_?ds-[a-z0-9-]+)(\*)?/g)) {
      if (match[2] || match[1].endsWith('-')) continue;
      if (!knownChannels.has(match[1])) {
        findings.push({ law: 'L2', detail: `${row.slotId}: el governor nombra el canal ${match[1]}, que no existe en ninguna capa` });
      }
    }
  }
  return findings;
}

/** L4(a): literal del CSS autorado sobre un canal cuya raiz ya sabe derivar. */
export function findShadowingPins({ literalPins, membershipByChannel, rootById }) {
  const shadows = [];
  for (const pin of literalPins) {
    const member = membershipByChannel.get(pin.channel);
    if (!member?.rootId) continue;
    const root = rootById.get(member.rootId);
    if (!root?.derivationDebt || !root?.derivation) continue;
    shadows.push({ channel: pin.channel, rootId: member.rootId, via: member.via, site: `${pin.file}:${pin.line}` });
  }
  return shadows;
}

/**
 * L4(b): grupos (tema, raiz, propiedad, estado, modo) que ya tomaron dos
 * posiciones. El valor solo responde "difieren?"; nunca decide pertenencia.
 */
export function findDivergentGroups(rows, membershipByChannel) {
  const groups = new Map();
  for (const row of rows) {
    if (!row.rootId) continue;
    const facet = row.emitsChannels.map((channel) => membershipByChannel.get(channel)).find(Boolean);
    const key = [row.vertical, row.rootId, facet?.property ?? 'sin-propiedad', facet?.state ?? 'sin-estado', modeOf(row.slotPath)].join('|');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  const divergent = [];
  for (const [key, members] of groups) {
    if (members.length < 2) continue;
    const positions = new Set(members.map((row) => row.authoredValue));
    if (positions.size < 2) continue;
    divergent.push({ key, slots: members.length, positions: positions.size });
  }
  divergent.sort((a, b) => b.slots - a.slots || a.key.localeCompare(b.key));
  return divergent;
}

export function analyse({ inventory, membership, catalog, literalPins, controlIds, controlsWithDbDoor, allowlistTotal, contractSource, knownChannels }) {
  const membershipByChannel = new Map((membership.rows ?? []).map((row) => [row.channel, row]));
  const rootById = new Map((catalog.roots ?? []).map((root) => [root.rootId, root]));
  const rows = inventory.rows ?? [];

  const findings = [...checkContractShape(contractSource)];

  const domiciles = new Set(['seed', 'derived', 'pro-expert', 'unassigned']);
  for (const row of rows) {
    if (row.currentDomicile === null) continue;
    if (!domiciles.has(row.currentDomicile)) {
      findings.push({ law: 'L2', detail: `${row.slotId}: domicilio "${row.currentDomicile}" fuera del vocabulario cerrado` });
    }
    if (!String(row.governor ?? '').trim()) {
      findings.push({ law: 'L2', detail: `${row.slotId}: domicilio ${row.currentDomicile} sin @governor` });
    }
  }
  const governorFindings = checkGovernorAuthorities(rows, { controlIds, knownChannels });

  const shadows = findShadowingPins({ literalPins, membershipByChannel, rootById });
  const divergent = findDivergentGroups(rows, membershipByChannel);

  if (allowlistTotal !== ALLOWLIST_TOTAL) {
    findings.push({ law: 'L5', detail: `el allowlist de tenant compone ${allowlistTotal} nombres y la ley pina ${ALLOWLIST_TOTAL}: la superficie sobreescribible se movio` });
  }
  if (controlsWithDbDoor !== controlIds.size) {
    findings.push({ law: 'L5', detail: `${controlIds.size - controlsWithDbDoor} de ${controlIds.size} controles perdieron su puerta DB (ingress.dbTenantThemePath)` });
  }

  return {
    findings,
    counters: {
      unassignedSlots: rows.filter((row) => row.currentDomicile === 'unassigned').length,
      governorsNamingMissingAuthority: governorFindings.length,
      shadowingLiteralPins: shadows.length,
      divergentGroups: divergent.length,
      divergentSlots: divergent.reduce((sum, group) => sum + group.slots, 0),
    },
    governorFindings,
    shadows,
    divergent,
  };
}

/* ── carga desde el árbol ─────────────────────────────────────────────────── */

export function readTree(coreRoot = CORE_ROOT) {
  const read = (relative) => JSON.parse(readFileSync(join(coreRoot, relative), 'utf8'));
  const inventory = read('manifest/generated/slot-inventory.json');
  const membership = read('manifest/generated/root-membership.json');
  const catalog = read('manifest/cascade/root-catalog.json');
  const edges = read('manifest/cascade/extracted/css-edges.json');
  const contractSource = readFileSync(
    join(coreRoot, 'src/foundation/contracts/composition/tenants/themes/index.ts'), 'utf8');
  const tenantSource = readFileSync(
    join(coreRoot, 'src/foundation/contracts/composition/tenants/themes/tenant-theme/index.ts'), 'utf8');

  const controlsDir = join(coreRoot, 'manifest/controls');
  const controlIds = new Set();
  let controlsWithDbDoor = 0;
  for (const file of readdirSync(controlsDir).sort()) {
    if (!file.endsWith('.json')) continue;
    const control = JSON.parse(readFileSync(join(controlsDir, file), 'utf8'));
    controlIds.add(control.controlId);
    if (control?.ingress?.dbTenantThemePath) controlsWithDbDoor += 1;
  }

  /* El allowlist se COMPONE, no se cuenta a ojo: 67 literales mas dos productos
   * cartesianos. Si alguien borra un rol o una faceta, el total cae y L5 lo ve. */
  const sliceOf = (name) => {
    const match = new RegExp(`${name}\\s*=\\s*\\[(.*?)\\] as const`, 's').exec(tenantSource);
    return match ? (match[1].match(/"[\w-]+"/g) ?? []).length : 0;
  };
  const start = tenantSource.indexOf('TENANT_THEME_OVERRIDE_TOKENS = [');
  const end = tenantSource.indexOf('] as const', start);
  const literals = (tenantSource.slice(start, end).match(/"--[\w-]+"/g) ?? []).length;
  const allowlistTotal = literals
    + sliceOf('TENANT_SEMANTIC_SURFACE_ROLES') * sliceOf('TENANT_SEMANTIC_SURFACE_FACETS')
    + sliceOf('TENANT_SEMANTIC_TYPOGRAPHY_ROLES') * sliceOf('TENANT_SEMANTIC_TYPOGRAPHY_FACETS');

  const knownChannels = new Set([
    ...edges.literalPins.map((pin) => pin.channel),
    ...edges.edges.map((edge) => edge.to),
    ...edges.edges.map((edge) => edge.from),
    ...inventory.rows.flatMap((row) => row.emitsChannels),
    ...(catalog.roots ?? []).map((root) => root.channel).filter(Boolean),
  ]);

  return {
    inventory, membership, catalog, literalPins: edges.literalPins,
    controlIds, controlsWithDbDoor, allowlistTotal, contractSource, knownChannels,
  };
}

export function readBaseline(path = BASELINE_PATH) {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf8'));
}

/**
 * Decrece-solo, sin excepcion tacita: subir es regresion y bajar tambien falla,
 * con la instruccion de bajar el ancla en el MISMO commit que movio el numero.
 */
export function evaluate(result, baseline) {
  /* DOS REGIMENES, y la diferencia no es de gusto: es lo que hoy vale cero.
   * `findings` son las leyes que YA se sostienen en el arbol -- el contrato sin
   * relajar (L1), el vocabulario de domicilio y el governor presente (L2
   * estructural), la superficie tenant intacta (L5) -- y por eso cualquier
   * hallazgo ahi es una regresion y falla duro, sin ancla que lo amortigue.
   * Los CONTADORES son deuda preexistente medida: governors que nombran
   * autoridad inexistente (10), literales que sombrean (152), grupos que ya
   * tomaron dos posiciones (214). Esos no pueden ser cero hoy -- el frente
   * existe justamente para bajarlos -- asi que se gobiernan por trinquete. Un
   * gate que exigiera cero en la deuda seria un gate permanentemente rojo, que
   * es lo mismo que no tener gate. */
  const failures = result.findings.map((finding) => `[${finding.law}] ${finding.detail}`);
  if (!baseline) return { failures: [...failures, '[baseline] no existe normalization-contract-gate.baseline.json'], drift: [] };
  const drift = [];
  for (const [name, value] of Object.entries(result.counters)) {
    const anchored = baseline.counters?.[name]?.value;
    if (anchored === undefined) { drift.push(`${name}: sin ancla en el baseline`); continue; }
    if (value > anchored) drift.push(`${name}: ${anchored} -> ${value} SUBIO — es regresion o cobertura nueva; se arregla la fuente, no el ancla`);
    else if (value < anchored) drift.push(`${name}: ${anchored} -> ${value} bajo — baja el ancla en el MISMO commit, con razon escrita`);
  }
  return { failures, drift };
}

function render(result) {
  const lines = [];
  for (const [name, value] of Object.entries(result.counters)) lines.push(`  ${name.padEnd(34)} ${value}`);
  return lines.join('\n');
}

async function main(argv) {
  const flags = argv.slice(2);
  const mode = flags.length === 0 ? '--check' : flags[0];
  if (!['--check', '--write-baseline'].includes(mode)) {
    console.error('uso: node scripts/tokens/normalization-contract-gate/index.mjs [--check|--write-baseline --reason "..."]');
    process.exit(2);
  }
  const result = analyse(readTree());
  if (mode === '--write-baseline') {
    const reasonIndex = flags.indexOf('--reason');
    const reason = reasonIndex >= 0 ? flags[reasonIndex + 1] : null;
    if (!reason) { console.error('--write-baseline exige --reason "por que se mueve el ancla"'); process.exit(2); }
    const previous = readBaseline();
    for (const [name, value] of Object.entries(result.counters)) {
      const anchored = previous?.counters?.[name]?.value;
      if (anchored !== undefined && value > anchored) {
        console.error(`normalization-contract-gate: me niego a re-anclar HACIA ARRIBA ${name} (${anchored} -> ${value}). Un hallazgo nuevo se arregla en la fuente.`);
        process.exit(1);
      }
    }
    const doc = {
      schemaVersion: 1,
      law: previous?.law ?? 'decrece-solo, sin excepcion tacita. Jamas se re-ancla un hallazgo nuevo.',
      counters: Object.fromEntries(Object.entries(result.counters).map(([name, value]) => [
        name, { value, reason: previous?.counters?.[name]?.reason ?? reason },
      ])),
      /* La deuda va ENUMERADA, no solo contada: un numero que baja sin decir
       * cual caso se cerro no es auditable, y un caso que reaparece con otro
       * nombre no se veria en el total. */
      namedDebt: {
        governorsNamingMissingAuthority: result.governorFindings.map((finding) => finding.detail),
        shadowingLiteralPins: result.shadows.map((shadow) => `${shadow.channel} -> ${shadow.rootId} (${shadow.via}) @ ${shadow.site}`),
        divergentGroupsTop: result.divergent.slice(0, 15).map((group) => `${group.key}: ${group.slots} slots, ${group.positions} posiciones`),
      },
      lastMove: reason,
    };
    writeFileSync(BASELINE_PATH, `${JSON.stringify(doc, null, 2)}\n`);
    console.log(`normalization-contract-gate: ancla escrita\n${render(result)}`);
    return;
  }
  const { failures, drift } = evaluate(result, readBaseline());
  if (failures.length > 0 || drift.length > 0) {
    console.error('normalization-contract-gate: FAIL');
    for (const failure of failures) console.error(`  - ${failure}`);
    for (const item of drift) console.error(`  - [ratchet] ${item}`);
    process.exit(1);
  }
  console.log(`normalization-contract-gate: OK — las 5 leyes se sostienen\n${render(result)}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv).catch((error) => { console.error(`normalization-contract-gate: ${error?.message ?? error}`); process.exit(1); });
}
