#!/usr/bin/env node
/**
 * root-membership — QUE canal pertenece a QUE raiz de la cascada, persistido.
 *
 * POR QUE EXISTE. El catalogo de cascada publica CUANTOS canales regenera cada
 * raiz (`roots[].collapsesLegacy.total`, asi renombrado por esta misma cohorte) y nunca CUALES. La cohorte 0 midio el
 * agujero: 3.378 de 3.656 filas del inventario emiten canal y no se les puede
 * atribuir raiz sin inventarla, y por eso R2 -- la clase productiva del frente
 * -- quedo en 26 por construccion. Este artefacto es esa membresia.
 *
 * NO RECONSTRUYE LA DE F4A: LA CONSTRUYE DE NUEVO. Dos razones medidas.
 * (i) El clasificador constructivo de F4A no existe como script -- ningun
 * archivo del paquete lo implementa -- y el sustituto obvio, el alcance
 * transitivo del grafo CSS, no reproduce sus totales ni de lejos (error medido
 * de 0% a 1536%, 15 raices con alcance cero, 15.251 contra 3.310). Falla por
 * construccion: el alcance CSS mide derivacion YA EXISTENTE, y la premisa del
 * frente es que la mayoria todavia no deriva.
 * (ii) Y aunque existiera no serviria: `method.classes` define la clase A como
 * "sale de otro canal por referencia, DUPLICADO, mezcla o calc", y `duplicado`
 * es coincidencia de valor -- el criterio que el owner prohibio. Reconstruirlo
 * habria metido el criterio prohibido en los cimientos, escondido detras de una
 * coincidencia numerica.
 *
 * LA IGUALDAD DE VALOR NO ES EVIDENCIA DE NADA, y aca no aparece ni una vez.
 * Las tres vias se apoyan en autoria explicita: el catalogo declara una cabeza,
 * el autor del skin declara un fallback, o un humano adjudica un owner por
 * escrito. Ninguna mira lo que un canal vale.
 *
 * LAS TRES VIAS, en precedencia fail-closed:
 *
 *   V1 `head-exact` -- el canal ES `roots[].channel`. Sin adjudicacion.
 *
 *   V2 `declared-fallback` -- REGLA DE FILA PINEADA. El grafo de
 *      `css-edges.json` v2 apunta las referencias anidadas a SU REFERENCIA
 *      PADRE, nunca al head (es el atajo que el contrato prohibe), de modo que
 *      en `--ds-spacing-xxs: var(--ds-density-spacing-xxs, var(--ds-spacing-2))`
 *      el edge es {from: --ds-spacing-2, to: --ds-density-spacing-xxs} y el
 *      canal DECLARADO (--ds-spacing-xxs) NO aparece en el edge. Por lo tanto
 *      esta via atribuye el PRIMARIO GUARDADO (`to`, que es `guardPrimary`), no
 *      el canal declarado: lo que el autor declaro es "si `to` no esta puesto,
 *      manda `from`", y eso los pone en la misma familia. Un canal se atribuye
 *      por V2 si y solo si el conjunto de raices que lo guardan tiene
 *      EXACTAMENTE UN elemento; dos o mas es ambiguo y cae a null.
 *
 *   V3 `governed-owner-table` -- `manifest/cascade/owner-tiers.json`, autorada
 *      por el DT. Si el archivo no existe, V3 no atribuye nada y eso es
 *      LEGITIMO, no un fallo: un owner sin adjudicar es un resultado valido y
 *      jamas hay presion de cobertura sobre la tabla.
 *
 *      ADMISION POR CONCORDANCIA, NO POR OWNER UNICO. Un canal lo escriben con
 *      frecuencia varios slots de owners distintos: medido, solo 598 de 1610
 *      canales tienen exactamente uno. Exigir owner unico habria puesto el
 *      techo de V3 en 408 de los 1279 canales sin raiz (32%); admitir varios
 *      owners cuando TODOS estan adjudicados y TODOS coinciden en tier lo pone
 *      en 1109 (87%). La concordancia no afloja nada: si un solo owner
 *      contribuyente no esta adjudicado, o si dos adjudicados discrepan de
 *      tier, el canal queda null con la discrepancia nombrada. Lo que se
 *      rechaza es el desacuerdo, no la pluralidad.
 *
 * REGLA DE CABEZA COMPARTIDA (generalidad, no reparto). Cuando N raices
 * declaran la misma cabeza, la cabeza pertenece a la raiz MAS GENERAL y las
 * demas la REFERENCIAN. La generalidad no se opina: la declara el contrato --
 * `BrandPalette.borderColor` se documenta en fuente como "The unqualified
 * separator token components fall back to", y un fallback incondicional es por
 * definicion el nivel base. Un canal con dos duenos no tiene dueno: la primera
 * cohorte que lo colapse tendria dos leyes aplicables y elegiria una en
 * silencio. Si el conjunto en disputa no contiene exactamente un reclamante de
 * tier `base`, la regla NO resuelve y el canal queda null -- fail-closed.
 *
 * CONTRATO CLI (identico a cascade-extract y slot-inventory):
 *   node index.mjs            -> --check  (DEFECTO, FAIL-CLOSED)
 *   node index.mjs --check    -> recomputa, compara byte a byte, exit 1 si difiere
 *   node index.mjs --write    -> escribe OUT
 * `buildMembership()` es PURA. Importar este modulo no escribe nada.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { packageRoot as findPackageRoot } from '../../lib/repo-root/index.mjs';
import { buildInventory } from '../slot-inventory/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const CORE_ROOT = findPackageRoot(HERE);
export const OUT_PATH = join(CORE_ROOT, 'manifest/generated/root-membership.json');
export const CATALOG_PATH = join(CORE_ROOT, 'manifest/cascade/root-catalog.json');
export const EDGES_PATH = join(CORE_ROOT, 'manifest/cascade/extracted/css-edges.json');
export const OWNER_TIERS_PATH = join(CORE_ROOT, 'manifest/cascade/owner-tiers.json');

/** Vocabulario CERRADO de via. Una via nueva es un cambio de contrato. */
export const VIAS = Object.freeze(['head-exact', 'declared-fallback', 'governed-owner-table']);

/** Las clases de edge que expresan "si el primario no esta, manda el fallback". */
export const FALLBACK_EDGE_CLASSES = Object.freeze(['decl-fallback', 'leaf-fallback']);

/** Los 6 tiers del catalogo. NO se funden con los 8 SEMANTIC_SURFACE_ROLES. */
export const CATALOG_TIERS = Object.freeze(['base', 'page', 'control', 'raised', 'overlay', 'accent']);

/**
 * El unico tier declarado como general. `base` es el nivel incondicional: es a
 * donde cae un componente que no califica su superficie.
 */
export const MOST_GENERAL_TIER = 'base';

export const GENERALITY_EVIDENCE =
  'src/foundation/contracts/composition/tenants/themes/index.ts -- BrandPalette.borderColor: '
  + '"The unqualified separator token components fall back to"; BrandPalette.textPrimaryColor: '
  + '"Global reading ink used on the tenant canvas and neutral surfaces."';

/** `tier.raised.border` -> {family:'tier', tier:'raised', property:'border'} */
export function decomposeRootId(rootId) {
  const parts = String(rootId).split('.');
  /* Tres partes es la raiz de nivel (`tier.base.fg`); CUATRO es la misma raiz
   * refinada por su paso (`tier.base.fg.secondary`). Las dos son del mismo
   * nivel y la regla de generalidad tiene que verlo: si solo se reconociera la
   * de tres, una cabeza compartida entre raices de paso quedaria sin resolver
   * por no encontrarle tier a ninguna reclamante. */
  if (parts[0] === 'tier' && (parts.length === 3 || parts.length === 4)) {
    return { family: 'tier', tier: parts[1], property: parts[2], step: parts[3] ?? null };
  }
  return { family: parts[0], tier: null, property: parts.slice(1).join('.'), step: null };
}

/**
 * GRAMATICA DE OWNER, PINEADA. El owner de un slot es su ruta MENOS la hoja.
 *
 * Se elige este corte y no otro por dos razones medidas. Primero, tamano: la
 * ruta de slot da 270 owners distintos contra 554 si se tokeniza el nombre del
 * canal, y es una tabla que un humano puede adjudicar por lotes. Segundo,
 * autoridad: es el nivel del que habla la ley del owner ("una vertical decide
 * su seed"), no el nombre que el compilador termina emitiendo. Los tokens
 * internos de la hoja camelCase (`itemBgHover` -> item/bg/hover) NO entran al
 * owner: viajan como `property`/`state` de la fila.
 */
export function ownerOfSlotPath(slotPath) {
  const parts = String(slotPath).split('.');
  return parts.length > 1 ? parts.slice(0, -1).join('.') : String(slotPath);
}

/** Vocabulario cerrado de propiedad, en orden de preferencia (mas larga primero). */
export const PROPERTY_TOKENS = Object.freeze({
  background: 'bg', bg: 'bg', tint: 'bg',
  foreground: 'fg', fg: 'fg', color: 'fg', ink: 'fg',
  border: 'border', shadow: 'shadow', ring: 'ring', scrim: 'scrim',
  radius: 'radius', padding: 'padding', gap: 'gap',
  height: 'height', width: 'width', size: 'size',
  opacity: 'opacity', blur: 'blur',
  weight: 'weight', family: 'family', tracking: 'tracking', leading: 'leading',
  duration: 'duration', easing: 'easing',
});

/** Vocabulario cerrado de estado. Sale del grupo `estados` del catalogo. */
export const STATE_TOKENS = Object.freeze([
  'hover', 'active', 'focus', 'disabled', 'selected', 'pressed', 'checked', 'expanded', 'rest', 'visited',
]);

const CAMEL = /[A-Z]?[a-z0-9]+|[A-Z]+(?![a-z])/g;

/** `itemBgHover` -> {property:'bg', state:'hover', rest:['item']} */
export function decomposeLeaf(leaf) {
  const tokens = String(leaf).match(CAMEL)?.map((token) => token.toLowerCase()) ?? [];
  let state = null;
  if (tokens.length > 0 && STATE_TOKENS.includes(tokens[tokens.length - 1])) state = tokens.pop();
  for (let index = tokens.length - 1; index >= 0; index -= 1) {
    const property = PROPERTY_TOKENS[tokens[index]];
    if (property) return { property, state, rest: tokens.slice(0, index) };
  }
  return { property: null, state, rest: tokens };
}

/**
 * Cabeza -> raiz, con la regla de generalidad aplicada y su evidencia.
 * Devuelve tambien las raices que quedan REFERENCIANDO la cabeza: la relacion
 * se escribe, no se borra.
 */
export function resolveHeads(catalog) {
  const claims = new Map();
  for (const root of catalog.roots ?? []) {
    if (!root.channel) continue;
    if (!claims.has(root.channel)) claims.set(root.channel, []);
    claims.get(root.channel).push(root);
  }
  const resolved = new Map();
  const unresolved = [];
  for (const [channel, roots] of claims) {
    if (roots.length === 1) {
      resolved.set(channel, { rootId: roots[0].rootId, shared: false, references: [] });
      continue;
    }
    const general = roots.filter((root) => decomposeRootId(root.rootId).tier === MOST_GENERAL_TIER);
    if (general.length === 1) {
      resolved.set(channel, {
        rootId: general[0].rootId,
        shared: true,
        references: roots.filter((root) => root.rootId !== general[0].rootId).map((root) => root.rootId).sort(),
        generalityEvidence: GENERALITY_EVIDENCE,
      });
      continue;
    }
    unresolved.push({
      channel,
      claimedBy: roots.map((root) => root.rootId).sort(),
      reason: general.length === 0
        ? `ningun reclamante es tier "${MOST_GENERAL_TIER}": la regla de generalidad no resuelve`
        : `${general.length} reclamantes de tier "${MOST_GENERAL_TIER}": la regla de generalidad no desempata`,
    });
  }
  return { resolved, unresolved };
}

/** Canal guardado -> raices que lo guardan por fallback declarado. */
export function fallbackIndex(edges, resolvedHeads) {
  const guarded = new Map();
  for (const edge of edges) {
    if (!FALLBACK_EDGE_CLASSES.includes(edge.edgeClass)) continue;
    const head = resolvedHeads.get(edge.from);
    if (!head) continue;
    if (!guarded.has(edge.to)) guarded.set(edge.to, new Map());
    const byRoot = guarded.get(edge.to);
    if (!byRoot.has(head.rootId)) {
      byRoot.set(head.rootId, {
        fallbackFrom: edge.from,
        site: `${edge.file}:${edge.line}`,
        edgeClass: edge.edgeClass,
        guardPrimary: edge.guardPrimary ?? null,
      });
    }
  }
  return guarded;
}

export function readOwnerTiers(path = OWNER_TIERS_PATH) {
  if (!existsSync(path)) return { present: false, byOwner: new Map(), formFailures: [] };
  const table = JSON.parse(readFileSync(path, 'utf8'));
  const rows = Array.isArray(table) ? table : (table.rows ?? []);
  const byOwner = new Map();
  const formFailures = [];
  for (const [index, row] of rows.entries()) {
    const where = `owner-tiers.json[${index}]`;
    if (!row?.ownerPath) { formFailures.push(`${where}: sin ownerPath`); continue; }
    if (!CATALOG_TIERS.includes(row.tier)) {
      formFailures.push(`${where} (${row.ownerPath}): tier "${row.tier}" fuera del vocabulario cerrado (${CATALOG_TIERS.join(' | ')})`);
      continue;
    }
    if (typeof row.reason !== 'string' || row.reason.trim() === '') {
      formFailures.push(`${where} (${row.ownerPath}): reason vacia`);
      continue;
    }
    if (byOwner.has(row.ownerPath)) { formFailures.push(`${where}: ownerPath duplicado ${row.ownerPath}`); continue; }
    byOwner.set(row.ownerPath, row);
  }
  return { present: true, byOwner, formFailures };
}

export const OWNER_STEP_RULES_PATH = join(CORE_ROOT, 'manifest/cascade/owner-step-rules.json');

/**
 * EL TERCER INDICE: `step`. PREPARADO E INACTIVO hasta que el DT adjudique.
 *
 * La cohorte 2 midio la asimetria que lo obliga: el catalogo indexa raices por
 * `tier x propiedad`, y los temas autoran `tier x propiedad x PASO` -- 8 tintas
 * y 6 bordes declarados en `BrandPalette` contra UNA sola raiz de tinta por
 * nivel. Por eso 627 filas caen en `value-shift` sobre `tier.*.{fg,border}`:
 * su decision es de otro paso y la unica raiz disponible carga el primario.
 *
 * ESTE MECANISMO NO INVENTA NADA Y HOY NO HACE NADA. Sin
 * `manifest/cascade/owner-step-rules.json` -- la segunda tabla autorada, misma
 * disciplina que `owner-tiers` -- `step` sale `null` y `rootId` no se toca. Y
 * cuando la tabla exista, el refinamiento SOLO ocurre si la raiz refinada
 * EXISTE en el catalogo: una regla que apunte a una raiz inexistente deja la
 * fila en su raiz padre y lo declara. Nunca se fabrica una raiz desde una
 * tabla.
 *
 * Y LA IGUALDAD DE VALOR SIGUE PROHIBIDA COMO RUTA. El paso lo decide la tabla
 * (owner x propiedad -> paso), jamas el parecido entre un literal y el valor de
 * un canal. La identidad de valor resuelto es VERIFICACION posterior (la ley
 * cero-delta de `resolved-map-diff`), nunca evidencia de ruteo.
 */
export const STEP_VOCABULARY = Object.freeze({
  fg: Object.freeze(['primary', 'secondary', 'page', 'muted', 'tertiary', 'disabled', 'inverse', 'on-primary']),
  border: Object.freeze(['primary', 'secondary', 'default', 'tertiary', 'subtle', 'focus']),
});

export function readOwnerStepRules(path = OWNER_STEP_RULES_PATH) {
  if (!existsSync(path)) return { present: false, byKey: new Map(), formFailures: [] };
  const table = JSON.parse(readFileSync(path, 'utf8'));
  const rows = Array.isArray(table) ? table : (table.rows ?? []);
  const byKey = new Map();
  const formFailures = [];
  for (const [index, row] of rows.entries()) {
    const where = `owner-step-rules.json[${index}]`;
    if (!row?.ownerPath) { formFailures.push(`${where}: sin ownerPath`); continue; }
    const vocabulary = STEP_VOCABULARY[row.property];
    if (!vocabulary) {
      formFailures.push(`${where} (${row.ownerPath}): propiedad "${row.property}" fuera de {${Object.keys(STEP_VOCABULARY).join(' | ')}}`);
      continue;
    }
    if (typeof row.leaf !== 'string' || row.leaf.trim() === '') {
      formFailures.push(`${where} (${row.ownerPath}|${row.property}): leaf vacia`);
      continue;
    }
    if (!vocabulary.includes(row.step)) {
      formFailures.push(`${where} (${row.ownerPath}|${row.property}|${row.leaf}): paso "${row.step}" fuera del vocabulario autorado (${vocabulary.join(' | ')})`);
      continue;
    }
    if (typeof row.reason !== 'string' || row.reason.trim() === '') {
      formFailures.push(`${where} (${row.ownerPath}|${row.property}|${row.leaf}): reason vacia`);
      continue;
    }
    const key = stepRuleKey(row.ownerPath, row.property, row.leaf);
    if (byKey.has(key)) { formFailures.push(`${where}: clave duplicada ${key}`); continue; }
    byKey.set(key, row);
  }
  return { present: true, byKey, formFailures };
}

/** La clave de la tabla del DT: owner x propiedad x HOJA. */
export const stepRuleKey = (ownerPath, property, leaf) => `${ownerPath}|${property}|${leaf}`;

export const leafOfSlotPath = (slotPath) => String(slotPath).split('.').pop();

/**
 * Refina `tier.<nivel>.<prop>` a `tier.<nivel>.<prop>.<paso>`.
 *
 * LA CLAVE ES `owner x propiedad x HOJA` (decision del DT, 2026-08-27): el
 * censo de la fase A mostro que en las celdas grandes el numero de hojas casi
 * iguala al de posiciones, porque **los nombres de hoja YA son el paso** --
 * `bodyColor`, `headerColor`, `mutedColor`, `placeholderColor`. Adjudicar por
 * hoja es adjudicar la decision real; por (owner, propiedad) habria obligado a
 * un solo paso por familia entera.
 *
 * CONCORDANCIA, la misma disciplina que el tier. Un canal lo escriben varios
 * slots; el paso se aplica solo si TODOS sus contribuyentes tienen regla y
 * TODAS coinciden. Un contribuyente sin adjudicar, o dos pasos en desacuerdo,
 * dejan el canal en su raiz PADRE con la discrepancia nombrada. Lo que se
 * rechaza es el desacuerdo, no la pluralidad.
 *
 * Y LA RAIZ REFINADA TIENE QUE EXISTIR. Una regla que apunte a una raiz que el
 * catalogo no declara deja la fila en su padre y lo declara: jamas se fabrica
 * una raiz desde una tabla.
 */
export function refineWithStep({ rootId, contributors, stepRules, rootExists }) {
  if (!stepRules?.present) return { rootId, step: null, stepNote: 'la tabla owner-step-rules no existe todavia' };
  const parts = String(rootId ?? '').split('.');
  if (parts.length !== 3 || parts[0] !== 'tier' || !STEP_VOCABULARY[parts[2]]) {
    return { rootId, step: null, stepNote: 'la raiz no es un tier.<nivel>.<fg|border> refinable' };
  }
  const property = parts[2];
  const steps = new Set();
  const missing = [];
  for (const slotPath of contributors) {
    const key = stepRuleKey(ownerOfSlotPath(slotPath), property, leafOfSlotPath(slotPath));
    const rule = stepRules.byKey.get(key);
    if (!rule) { missing.push(key); continue; }
    steps.add(rule.step);
  }
  if (missing.length > 0) {
    return { rootId, step: null, stepNote: `sin adjudicar: ${[...new Set(missing)].slice(0, 3).join(', ')}` };
  }
  if (steps.size === 0) return { rootId, step: null, stepNote: 'ningun contribuyente aporta regla' };
  if (steps.size > 1) {
    return { rootId, step: null, stepNote: `los contribuyentes discrepan de paso: ${[...steps].sort().join(' vs ')}` };
  }
  const [step] = [...steps];
  const refined = `${rootId}.${step}`;
  if (!rootExists(refined)) return { rootId, step: null, stepNote: `la tabla pide ${refined} y esa raiz no existe en el catalogo` };
  return { rootId: refined, step, stepNote: null };
}

export const sha256 = (text) => createHash('sha256').update(text).digest('hex');

export async function buildMembership({
  coreRoot = CORE_ROOT,
  inventory: injectedInventory = null,
  catalog: injectedCatalog = null,
  edges: injectedEdges = null,
  ownerTiers: injectedOwnerTiers = null,
  stepRules: injectedStepRules = null,
} = {}) {
  const catalog = injectedCatalog
    ?? JSON.parse(readFileSync(join(coreRoot, 'manifest/cascade/root-catalog.json'), 'utf8'));
  const edgesDoc = injectedEdges
    ?? JSON.parse(readFileSync(join(coreRoot, 'manifest/cascade/extracted/css-edges.json'), 'utf8'));
  /* El inventario se CALCULA, no se lee del artefacto: en la fase B el
   * inventario consulta esta membresia, y leer su JSON aca crearia un ciclo
   * entre dos artefactos generados. Llamar a su funcion pura no lo crea. */
  const inventory = injectedInventory ?? (await buildInventory({ coreRoot, membership: 'none' }));
  const table = injectedOwnerTiers ?? readOwnerTiers(join(coreRoot, 'manifest/cascade/owner-tiers.json'));
  const stepRules = injectedStepRules ?? readOwnerStepRules(join(coreRoot, 'manifest/cascade/owner-step-rules.json'));

  const { resolved, unresolved } = resolveHeads(catalog);
  const guarded = fallbackIndex(edgesDoc.edges ?? [], resolved);
  const rootById = new Map((catalog.roots ?? []).map((root) => [root.rootId, root]));

  /* Canal -> slots que lo emiten, y de ahi los owners. Es la unica direccion
   * en la que el inventario entra: para poblar `contributingSlots` y el censo
   * de owners que el DT adjudica. */
  const slotsOf = new Map();
  for (const row of inventory.rows) {
    for (const channel of row.emitsChannels) {
      if (!slotsOf.has(channel)) slotsOf.set(channel, []);
      slotsOf.get(channel).push(row);
    }
  }

  const rows = [];
  for (const channel of [...slotsOf.keys()].sort()) {
    const contributors = slotsOf.get(channel);
    const owners = [...new Set(contributors.map((row) => ownerOfSlotPath(row.slotPath)))].sort();
    const leaves = contributors.map((row) => decomposeLeaf(row.slotPath.split('.').pop()));
    const property = leaves.find((leaf) => leaf.property)?.property ?? null;
    const state = leaves.find((leaf) => leaf.state)?.state ?? null;

    const head = resolved.get(channel);
    if (head) {
      const root = rootById.get(head.rootId);
      rows.push({
        channel,
        rootId: head.rootId,
        via: 'head-exact',
        evidence: {
          catalogHead: channel,
          sharedHead: head.shared,
          ...(head.shared ? { referencesHead: head.references, generalityEvidence: head.generalityEvidence } : {}),
          coincidenceGuard: 'no-value-match-used',
        },
        tier: decomposeRootId(head.rootId).tier,
        property: property ?? decomposeRootId(head.rootId).property,
        state,
        owners,
        contributingSlots: contributors.map((row) => row.slotId).sort(),
        rootExposure: root?.exposure ?? null,
        rootHasDerivationLaw: Boolean(root?.derivationDebt && root?.derivation),
      });
      continue;
    }

    const byRoot = guarded.get(channel);
    if (byRoot && byRoot.size === 1) {
      const [rootId, evidence] = [...byRoot.entries()][0];
      const root = rootById.get(rootId);
      rows.push({
        channel,
        rootId,
        via: 'declared-fallback',
        evidence: { ...evidence, coincidenceGuard: 'no-value-match-used' },
        tier: decomposeRootId(rootId).tier,
        property: property ?? decomposeRootId(rootId).property,
        state,
        owners,
        contributingSlots: contributors.map((row) => row.slotId).sort(),
        rootExposure: root?.exposure ?? null,
        rootHasDerivationLaw: Boolean(root?.derivationDebt && root?.derivation),
      });
      continue;
    }

    const adjudications = owners.map((owner) => table.byOwner.get(owner) ?? null);
    const missing = owners.filter((owner, index) => adjudications[index] === null);
    const tiers = [...new Set(adjudications.filter(Boolean).map((row) => row.tier))].sort();
    if (missing.length === 0 && tiers.length === 1 && property) {
      const rootId = `tier.${tiers[0]}.${property}`;
      const root = rootById.get(rootId);
      if (root) {
        rows.push({
          channel,
          rootId,
          via: 'governed-owner-table',
          evidence: {
            ownerPaths: owners,
            tier: tiers[0],
            reasons: adjudications.map((row) => row.reason),
            propertyFromLeaf: property,
            concordance: owners.length === 1 ? 'owner-unico' : `${owners.length} owners concuerdan en tier`,
            coincidenceGuard: 'no-value-match-used',
          },
          tier: tiers[0],
          property,
          state,
          owners,
          contributingSlots: contributors.map((row) => row.slotId).sort(),
          rootExposure: root?.exposure ?? null,
          rootHasDerivationLaw: Boolean(root?.derivationDebt && root?.derivation),
        });
        continue;
      }
    }

    rows.push({
      channel,
      rootId: null,
      via: null,
      evidence: {
        whyNotV1: 'el canal no es cabeza declarada de ninguna raiz',
        whyNotV2: byRoot
          ? `guardado por ${byRoot.size} raices distintas: ambiguo`
          : 'ningun fallback declarado lo guarda desde una cabeza',
        whyNotV3: !table.present
          ? 'la tabla owner-tiers.json no existe todavia'
          : missing.length > 0
            ? `owners sin adjudicar: ${missing.join(', ')}`
            : tiers.length > 1
              ? `los owners contribuyentes discrepan de tier: ${tiers.join(' vs ')}`
              : !property
                ? 'la hoja no decodifica una propiedad del vocabulario cerrado'
                : `no existe la raiz tier.${tiers[0]}.${property} en el catalogo`,
        coincidenceGuard: 'no-value-match-used',
      },
      tier: null,
      property,
      state,
      owners,
      contributingSlots: contributors.map((row) => row.slotId).sort(),
      rootExposure: null,
      rootHasDerivationLaw: false,
    });
  }

  /* EL TERCER INDICE, aplicado uniformemente y al final. Da igual por que via
   * la fila gano su raiz: si esa raiz es refinable y la tabla adjudica el paso
   * de TODOS sus contribuyentes, la fila baja un escalon. La VIA no cambia: el
   * paso refina la raiz, no re-atribuye la evidencia. */
  const rootExists = (id) => rootById.has(id);
  for (const row of rows) {
    if (!row.rootId) { row.step = null; row.stepNote = 'sin raiz que refinar'; continue; }
    const refined = refineWithStep({
      rootId: row.rootId,
      contributors: row.contributingSlots.map((slotId) => slotId.slice(slotId.indexOf(':') + 1)),
      stepRules,
      rootExists,
    });
    if (refined.rootId !== row.rootId) {
      row.parentRootId = row.rootId;
      row.rootId = refined.rootId;
      const refinedRoot = rootById.get(refined.rootId);
      row.rootExposure = refinedRoot?.exposure ?? row.rootExposure;
      row.rootHasDerivationLaw = Boolean(refinedRoot?.derivationDebt && refinedRoot?.derivation);
      row.evidence = { ...row.evidence, stepFrom: 'owner-step-rules.json (owner x propiedad x hoja, por concordancia)' };
    }
    row.step = refined.step;
    row.stepNote = refined.stepNote;
  }

  const tally = (pick) => rows.reduce((acc, row) => {
    const key = String(pick(row));
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  /* Censo de owners: la lista que el DT adjudica. Cuenta CANALES SIN RAIZ por
   * owner, que es exactamente lo que una fila de la tabla desbloquearia. */
  const byOwner = {};
  for (const row of rows) {
    for (const owner of row.owners) {
      if (!byOwner[owner]) byOwner[owner] = { channels: 0, unattributed: 0, properties: {} };
      byOwner[owner].channels += 1;
      if (row.rootId === null) {
        byOwner[owner].unattributed += 1;
        const key = row.property ?? 'sin-propiedad';
        byOwner[owner].properties[key] = (byOwner[owner].properties[key] ?? 0) + 1;
      }
    }
  }
  const byOwnerSorted = Object.fromEntries(
    Object.entries(byOwner).sort((a, b) => b[1].unattributed - a[1].unattributed || a[0].localeCompare(b[0])),
  );

  /* PISO DE ACEPTACION DE R2 (mejora Fable): filas del inventario que ganan
   * raiz por V1/V2 y cuya raiz tiene deuda de derivacion CON ley citada. Es la
   * cota INFERIOR de R2 en la fase B, computada sin adjudicar nada. */
  const attributedByEvidence = new Map(
    rows.filter((row) => row.via === 'head-exact' || row.via === 'declared-fallback').map((row) => [row.channel, row]),
  );
  let r2Floor = 0;
  const r2FloorRoots = new Set();
  for (const slot of inventory.rows) {
    const hits = [...new Set(slot.emitsChannels.map((channel) => attributedByEvidence.get(channel)?.rootId).filter(Boolean))];
    if (hits.length !== 1) continue;
    const root = rootById.get(hits[0]);
    if (root?.derivationDebt && root?.derivation) { r2Floor += 1; r2FloorRoots.add(hits[0]); }
  }

  return {
    generated: true,
    generator: 'scripts/tokens/root-membership/index.mjs',
    schemaVersion: 1,
    law: {
      unit: 'un CANAL --ds-* emitido por al menos un slot autorado de los tres brand themes',
      vias: VIAS,
      v2RowRule: 'un canal se atribuye por declared-fallback si y solo si el conjunto de raices que lo guardan por fallback declarado tiene EXACTAMENTE UN elemento. El grafo v2 apunta la referencia anidada a su REFERENCIA PADRE, asi que lo atribuido es el PRIMARIO GUARDADO (edge.to === guardPrimary), no el canal declarado, que no aparece en el edge.',
      v3AdmissionRule: 'concordancia, no owner unico: un canal se atribuye por tabla si TODOS sus owners contribuyentes estan adjudicados y TODOS coinciden en tier. Un owner sin adjudicar o dos tiers en desacuerdo dejan el canal en null con la discrepancia nombrada. Medido: exigir owner unico habria puesto el techo en 408 de 1279 canales sin raiz; la concordancia lo pone en 1109.',
      ownerGrammar: 'owner = ruta de slot MENOS la hoja. Los tokens internos de la hoja camelCase viajan como property/state, nunca como owner. 270 owners contra 554 si se tokenizara el nombre del canal.',
      sharedHead: 'generalidad, no reparto: la cabeza compartida pertenece a la raiz de tier base y las demas la REFERENCIAN. Si no hay exactamente un reclamante base, la regla no resuelve y el canal queda null.',
      coincidenceLaw: 'la igualdad de valor NO es evidencia de nada y no aparece en ninguna via. Ninguna fila puede justificar su raiz por coincidencia textual.',
      collapsesLegacy: 'este artefacto NO se reconcilia con roots[].collapsesLegacy.total: esa cifra es salida de un clasificador que no existe, no reproduce por ninguna via disponible, incluye `duplicado` (criterio prohibido) y esta medida sobre otro denominador y otro arbol.',
    },
    provenance: {
      catalog: 'manifest/cascade/root-catalog.json',
      catalogRoots: (catalog.roots ?? []).length,
      edges: 'manifest/cascade/extracted/css-edges.json',
      inventory: 'scripts/tokens/slot-inventory/index.mjs (funcion pura, no el artefacto: leerlo crearia un ciclo)',
      ownerTiers: table.present ? 'manifest/cascade/owner-tiers.json' : 'AUSENTE — V3 no atribuye nada, y es legitimo',
      ownerTiersFormFailures: table.formFailures,
      ownerStepRules: stepRules.present ? 'manifest/cascade/owner-step-rules.json' : 'AUSENTE',
      ownerStepRulesFormFailures: stepRules.formFailures,
    },
    stats: {
      rows: rows.length,
      byVia: tally((row) => row.via ?? 'unattributed'),
      byTier: tally((row) => row.tier ?? 'sin-tier'),
      byProperty: tally((row) => row.property ?? 'sin-propiedad'),
      withRoot: rows.filter((row) => row.rootId !== null).length,
      withoutRoot: rows.filter((row) => row.rootId === null).length,
      sharedHeadsResolved: [...resolved.values()].filter((head) => head.shared).length,
      sharedHeadsUnresolved: unresolved.length,
      ownersCensused: Object.keys(byOwnerSorted).length,
      ownersAdjudicated: table.byOwner.size,
      stepRulesPresent: stepRules.present,
      stepRulesAdjudicated: stepRules.byKey.size,
      rowsRefinedByStep: rows.filter((row) => row.step !== null).length,
      byStep: tally((row) => row.step ?? 'sin-paso'),
      r2Floor,
      r2FloorRoots: [...r2FloorRoots].sort(),
    },
    sharedHeads: {
      resolved: [...resolved.entries()]
        .filter(([, head]) => head.shared)
        .map(([channel, head]) => ({ channel, rootId: head.rootId, references: head.references })),
      unresolved,
    },
    byOwner: byOwnerSorted,
    rows,
  };
}

export const serialize = (doc) => `${JSON.stringify(doc, null, 2)}\n`;

export function withDigest(doc) {
  const { digest, ...rest } = doc;
  return { ...rest, digest: sha256(serialize({ ...rest, digest: null })) };
}

async function main(argv) {
  const flags = argv.slice(2);
  const mode = flags.length === 0 ? '--check' : flags[0];
  if (flags.length > 1 || !['--check', '--write'].includes(mode)) {
    console.error('uso: node scripts/tokens/root-membership/index.mjs [--check|--write]');
    process.exit(2);
  }
  const doc = withDigest(await buildMembership());
  if (doc.provenance.ownerStepRulesFormFailures.length > 0) {
    console.error('root-membership: FAIL — owner-step-rules.json tiene errores de forma:');
    for (const failure of doc.provenance.ownerStepRulesFormFailures) console.error(`  - ${failure}`);
    process.exit(1);
  }
  if (doc.provenance.ownerTiersFormFailures.length > 0) {
    console.error('root-membership: FAIL — owner-tiers.json tiene errores de forma:');
    for (const failure of doc.provenance.ownerTiersFormFailures) console.error(`  - ${failure}`);
    process.exit(1);
  }
  const text = serialize(doc);
  if (mode === '--write') {
    mkdirSync(dirname(OUT_PATH), { recursive: true });
    writeFileSync(OUT_PATH, text);
    console.log(`root-membership: escrito ${OUT_PATH} — ${doc.stats.rows} canales, ${doc.stats.withRoot} con raiz, digest ${doc.digest.slice(0, 12)}`);
    return;
  }
  let current = null;
  try { current = readFileSync(OUT_PATH, 'utf8'); } catch { current = null; }
  if (current === null) { console.error(`root-membership: FAIL — ${OUT_PATH} no existe. Corre --write.`); process.exit(1); }
  if (current !== text) { console.error('root-membership: FAIL — la membresia no coincide con el arbol. Corre --write y revisa el diff.'); process.exit(1); }
  console.log(`root-membership: OK — ${doc.stats.rows} canales, ${doc.stats.withRoot} con raiz, digest ${doc.digest.slice(0, 12)}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv).catch((error) => { console.error(`root-membership: ${error?.message ?? error}`); process.exit(1); });
}
