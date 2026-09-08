#!/usr/bin/env node
/**
 * slot-inventory — el JOIN de la normalizacion profunda: slot de fuente TS
 * <-> canal emitido <-> raiz del catalogo de cascada.
 *
 * POR QUE EXISTE. El frente de normalizacion tenia tres capas y ninguna union.
 * Las fuentes clasifican cada slot con `@domicile`/`@governor`
 * (`scripts/generate/tokens/manifest/variant-parity/index.mjs` ya lo parsea); el catalogo de cascada
 * clasifica RAICES (`governance/manifest/cascade/catalog/index.json`); y entre las dos vive
 * el canal `--ds-*` que nadie ata a ninguna. Sin esa union, "clasificar los
 * candidatos de colapso" no es una tarea mecanica: es una opinion.
 *
 * COMO SE MIDE EL CANAL: POR DIFERENCIA, NO POR LECTURA DE CODIGO. Para cada
 * hoja evaluada del tema se compila el tema DOS veces con el UNICO lowering que
 * existe (`compileTheme` de dist) -- una tal cual y otra con esa sola hoja
 * cambiada a un centinela unico -- y se declaran emitidos los canales cuyo
 * valor se movio. Es el metodo que no puede mentir: no interpreta al
 * compilador, lo interroga. Y NO nace un segundo emisor, que seria un STOP del
 * programa: el compilador es el de dist, bajo prueba de frescura.
 *
 * LA IGUALDAD DE VALOR NUNCA ES EVIDENCIA. Ni para atribuir raiz, ni para
 * clasificar variante. Dos slots comparten raiz cuando el CATALOGO les da el
 * mismo `rootId`, jamas cuando comparten un hex: `#ffffff` es fondo de card,
 * tinta sobre primary, fondo de modal y velo de overlay a la vez, y fusionarlos
 * seria destruir cuatro decisiones para ahorrar tres literales. La regla R3
 * exige ademas que el tema haya autorado el NOMBRE del stop de un control; el
 * valor resuelto de ese stop no clasifica nada.
 *
 * ATRIBUCION DE RAIZ, FAIL-CLOSED. El catalogo publica CUANTOS canales
 * regenera cada raiz (`collapsesLegacy.total`), nunca CUALES: la salida por canal del
 * clasificador constructivo de F4A no quedo persistida en ningun artefacto.
 * Por eso este inventario atribuye raiz SOLO donde el canal ES la cabeza
 * declarada de una raiz (`roots[].channel`), y deja `rootId: null` con motivo
 * escrito en todo lo demas. Cuatro cabezas las reclaman dos o mas raices
 * (`--ds-color-text-primary`, `--ds-color-border`): esas tambien caen a null
 * por ambiguedad. Un canal sin raiz no puede clasificar R2 ni R3 y cae a R5,
 * que es la cola de adjudicacion -- inventar la raiz seria exactamente el
 * defecto que este archivo existe para evitar.
 *
 * CONTRATO CLI (identico a cascade-extract):
 *   node index.mjs            -> --check  (DEFECTO, FAIL-CLOSED)
 *   node index.mjs --check    -> recomputa, compara byte a byte, exit 1 si difiere, NUNCA escribe
 *   node index.mjs --write    -> escribe OUT
 *   cualquier otra bandera    -> exit 2 con uso
 * `buildInventory()` es PURA: lee y devuelve el objeto. Importar este modulo no
 * escribe nada.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { packageRoot as findPackageRoot } from '../../../../libraries/repo-root/index.mjs';
import { readThemeCatalogRecords, CATALOG_SOURCE } from '../../../../libraries/theme-catalog/index.mjs';
import { isRefinedRoot } from '../roots/exposure/index.mjs';
import { assertDistFresh } from '../../../../package/artifacts/freshness/index.mjs';
import {
  LOWERING_EXPORT,
  LOWERING_MODULE,
  loadBrandThemeLowering,
} from '../../../../libraries/theme-lowering/index.mjs';
import {
  DOMICILES,
  METADATA_EXCLUSION,
  analyzeSource,
  readSources,
} from '../../../../../scripts/generate/tokens/manifest/variant-parity/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const CORE_ROOT = findPackageRoot(HERE);
/** Generated slot inventory consumed by manifest checks. */
export const OUT_PATH = join(CORE_ROOT, 'artifacts/generated/manifest/cascade/slots/index.json');
export const BASELINE_PATH = join(HERE, 'baseline/index.json');
export const CATALOG_PATH = join(CORE_ROOT, 'governance/manifest/cascade/catalog/index.json');
/* La unica lista de controles desde WO-CAT-02: el catalogo tipado. La vista de
 * manifest que reemplaza era una proyeccion generada de la misma poblacion y ya
 * no esta en la ruta de lectura de ningun gate. */
export const CONTROLS_DIR = CATALOG_SOURCE;

export const VERTICALS = Object.freeze(['rottay', 'bithire', 'evnto']);

/**
 * De la ruta del objeto EVALUADO a la ruta de slot que usan los docblocks.
 *
 * Las fuentes no autoran un objeto: autoran varias constantes (`const CHROME =
 * {...}`) que el tema compone al final, y `pathIndex` las indexa por el nombre
 * de la constante. El objeto evaluado, en cambio, tiene los campos de
 * `FirstPartyBrandTheme`. Este mapa es la unica traduccion entre las dos, y su
 * cobertura se VERIFICA (`unmappedTagScopes`) en vez de suponerse.
 */
const FIELD_TO_SLOT_ROOT = Object.freeze({
  palette: 'PALETTE',
  typography: 'TYPOGRAPHY',
  surfaces: 'SURFACES',
  motion: 'MOTION',
  charts: 'CHARTS',
  chrome: 'CHROME',
  capabilities: 'CAPABILITIES',
  recipes: 'RECIPES',
  expressive: 'EXPRESSIVE',
  responsive: 'RESPONSIVE',
});

export function jsPathToSlot(path) {
  return slotCandidates(path)[0];
}

/**
 * Las rutas de slot POSIBLES para una hoja evaluada, en orden de preferencia.
 *
 * Hay DOS, y suponer una sola fue un defecto medido: la misma familia puede
 * autorarse en una constante propia (`const TYPOGRAPHY = {...}` -> scope
 * `TYPOGRAPHY.x`) o en linea dentro del literal del tema (-> scope
 * `THEME.typography.x`), y los tres temas mezclan las dos formas. Se prueban
 * ambas contra el indice de tags y gana la coincidencia MAS ESPECIFICA; asi
 * ninguna hoja pierde su domicilio por donde eligio vivir su familia.
 */
export function slotCandidates(path) {
  const overlay = path.match(/^modes\.(light|dark)\.(.+)$/);
  if (overlay) return [`OVERLAY.${overlay[2]}`, `THEME.${path}`];
  const [head, ...rest] = path.split('.');
  const mapped = FIELD_TO_SLOT_ROOT[head];
  if (mapped) return [[mapped, ...rest].join('.'), `THEME.${path}`];
  return [`THEME.${path}`];
}

/** Hojas del objeto evaluado. Un `undefined` no es hoja: no se autoro nada. */
export function evaluatedLeaves(value, prefix, out) {
  if (value === undefined) return out;
  if (value === null || typeof value !== 'object') { out.push(prefix); return out; }
  if (Array.isArray(value)) {
    value.forEach((item, index) => evaluatedLeaves(item, `${prefix}[${index}]`, out));
    return out;
  }
  for (const key of Object.keys(value)) {
    evaluatedLeaves(value[key], prefix ? `${prefix}.${key}` : key, out);
  }
  return out;
}

function segmentsOf(path) {
  return path.split('.').flatMap((segment) => {
    const indexed = segment.match(/^(.*?)((?:\[\d+\])+)$/);
    if (!indexed) return [segment];
    const indices = [...indexed[2].matchAll(/\[(\d+)\]/g)].map((m) => Number(m[1]));
    return [indexed[1], ...indices];
  });
}

export function readAt(root, path) {
  return segmentsOf(path).reduce((node, segment) => (node == null ? undefined : node[segment]), root);
}

/** Escribe una hoja sobre una COPIA estructural; el original nunca se toca. */
export function withLeaf(root, path, next) {
  const copy = structuredClone(root);
  const segments = segmentsOf(path);
  const last = segments.pop();
  let node = copy;
  for (const segment of segments) node = node[segment];
  node[last] = next;
  return copy;
}

const HEX = /^#[0-9a-fA-F]{3,8}$/;
const DIMENSION = /^-?[\d.]+(px|rem|em|%|vh|vw|dvh|ms|s|deg)$/;
const COLOR_FN = /^(rgba?|hsla?|oklch|color-mix)\s*\(/;
const VAR_REF = /var\(\s*--/;
const CALC = /\b(calc|clamp|min|max)\s*\(/;

/**
 * La forma del valor autorado. `expression` GANA a `var-reference` a
 * proposito: `calc(13px * var(--ds-type-scale))` lee la cascada Y lleva un
 * literal adentro, y llamarlo simplemente referencia esconde el literal que la
 * cohorte de colapso tiene que ver. Quien necesite el otro hecho lo tiene en
 * `readsVar`, que viaja aparte en cada fila.
 */
export function valueKind(value) {
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value !== 'string') return 'other';
  if (CALC.test(value)) return 'expression';
  if (VAR_REF.test(value)) return 'var-reference';
  if (HEX.test(value)) return 'hex';
  if (COLOR_FN.test(value)) return 'color-fn';
  if (DIMENSION.test(value)) return 'dimension';
  return 'string';
}

export const readsVar = (value) => typeof value === 'string' && VAR_REF.test(value);

/**
 * Centinela UNICO por slot y del mismo tipo que el valor original.
 *
 * Del mismo tipo porque un compilador que parsea colores puede tirar sobre una
 * cadena arbitraria y perderiamos el slot; unico porque dos slots con el mismo
 * centinela producirian el mismo diff y no se podrian separar.
 */
export function sentinelFor(value, ordinal) {
  if (typeof value === 'number') return 987654 + ordinal / 10000;
  if (typeof value === 'boolean') return !value;
  if (typeof value !== 'string') return `__SLOT_SENTINEL_${ordinal}__`;
  if (HEX.test(value)) {
    const body = (0x100000 + (ordinal % 0xefffff)).toString(16).slice(0, 6);
    return `#${body}`;
  }
  const unit = value.match(DIMENSION);
  if (unit) return `${900000 + ordinal}${unit[1]}`;
  if (COLOR_FN.test(value)) return `rgba(${ordinal % 256}, ${(ordinal * 7) % 256}, ${(ordinal * 13) % 256}, 0.987)`;
  return `__SLOT_SENTINEL_${ordinal}__`;
}

/** Aplana la salida del compilador a `scope|canal` para poder diffear. */
export function flattenCompiled(compiled) {
  const flat = {};
  for (const [name, value] of Object.entries(compiled?.cssVariables ?? {})) flat[`base|${name}`] = String(value);
  for (const block of compiled?.modeBlocks ?? []) {
    const vars = block.variables ?? block.cssVariables ?? {};
    for (const [name, value] of Object.entries(vars)) flat[`${block.mode}|${name}`] = String(value);
  }
  for (const [name, value] of Object.entries(compiled?.personality ?? {})) flat[`personality|${name}`] = String(value);
  for (const [name, value] of Object.entries(compiled?.tokenOverrides ?? {})) flat[`override|${name}`] = String(value);
  return flat;
}

export function diffKeys(before, after) {
  const moved = [];
  for (const key of Object.keys(before)) if (before[key] !== after[key]) moved.push(key);
  for (const key of Object.keys(after)) if (!(key in before)) moved.push(key);
  return moved.sort();
}

/**
 * LA MEMBRESIA PERSISTIDA, o el modo sin ella.
 *
 * DOS MODOS EXPLICITOS, NUNCA UN FALLBACK SILENCIOSO. La cadena corre
 * `root-membership` ANTES que este inventario, y ese productor a su vez llama a
 * `buildInventory()` para saber que canal emite cada slot. Si este archivo
 * leyera la membresia incondicionalmente, la primera corrida sobre un arbol
 * limpio se quedaria esperando un artefacto que todavia no existe -- un ciclo
 * en tiempo de ejecucion. Por eso el modo se ELIGE y se declara en
 * `provenance.membershipSource`:
 *   - `membership: 'none'` -> atribucion por cabeza declarada del catalogo
 *     unicamente. Es el modo que usa `root-membership` para construirse.
 *   - por defecto (CLI) -> lee `artifacts/generated/manifest/cascade/membership/index.json` y
 *     FALLA CERRADO si no esta. Un inventario que degrada a cabezas-solo sin
 *     decirlo publicaria 107 filas con raiz y pareceria sano.
 */
export function membershipIndex(membership) {
  const byChannel = new Map();
  for (const row of membership?.rows ?? []) {
    if (row.rootId) byChannel.set(row.channel, { rootId: row.rootId, via: row.via });
  }
  return byChannel;
}

/**
 * Cabeza declarada -> raiz. Fail-closed: una cabeza reclamada por dos raices no
 * atribuye ninguna (`null` con motivo), porque elegir seria inventar.
 */
export function headChannelIndex(catalog) {
  const claims = new Map();
  for (const root of catalog.roots ?? []) {
    if (!root.channel) continue;
    if (!claims.has(root.channel)) claims.set(root.channel, []);
    claims.get(root.channel).push(root.rootId);
  }
  const index = new Map();
  const ambiguous = new Map();
  for (const [channel, roots] of claims) {
    if (roots.length === 1) index.set(channel, roots[0]);
    else ambiguous.set(channel, roots.sort());
  }
  return { index, ambiguous };
}

/**
 * Lee la membresia persistida. FALLA CERRADO si no esta: el modo sin membresia
 * existe, pero se pide por nombre (`membership: 'none'`), nunca por accidente.
 */
export function readMembership(path) {
  if (!existsSync(path)) {
    throw new Error(
      `slot-inventory: ${path} no existe. La cadena corre root-membership ANTES que este `
      + "inventario. Si de verdad querias el modo sin membresia, pedilo por nombre: "
      + "buildInventory({ membership: 'none' }).",
    );
  }
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function readControls(controlsDir = CONTROLS_DIR) {
  const byId = new Map();
  for (const control of readThemeCatalogRecords(controlsDir)) {
    byId.set(control.controlId, control);
  }
  return byId;
}

/** Tags por tema, resueltos al slot MAS ESPECIFICO que cubre cada hoja. */
export function tagIndexFor(analysis) {
  const scopes = analysis.tags
    .filter((tag) => tag.kind === 'scope' && typeof tag.scope === 'string')
    .map((tag) => ({ scope: tag.scope, domicile: tag.domicile, governor: tag.governor, line: tag.line }));
  scopes.sort((a, b) => b.scope.length - a.scope.length);
  return scopes;
}

export function resolveTag(scopes, slotPaths) {
  const candidates = Array.isArray(slotPaths) ? slotPaths : [slotPaths];
  let best = null;
  for (const slotPath of candidates) {
    for (const entry of scopes) {
      if (slotPath !== entry.scope && !slotPath.startsWith(`${entry.scope}.`)) continue;
      if (best === null || entry.scope.length > best.entry.scope.length) best = { entry, slotPath };
      break;
    }
  }
  return best;
}

const METADATA_SET = new Set(METADATA_EXCLUSION.map((entry) => `${entry.tenant}|${entry.path}`));

/**
 * Las cinco reglas del diseno, EN ORDEN, primera que matchea gana.
 * Cada veredicto viaja con la evidencia que lo sostiene; ninguna evidencia
 * puede ser una igualdad de valor.
 */
export function classify({ domicile, valueKindOf, rootId, root, control, authoredValue, emitsChannels, overrideTokens }) {
  if (domicile === 'derived' && (valueKindOf === 'var-reference' || valueKindOf === 'expression')) {
    return { rule: 'R1', verdict: 'already-collapsed', evidence: { collapsedAs: valueKindOf } };
  }
  if (rootId && root && root.derivationDebt === true && root.derivation) {
    return {
      rule: 'R2',
      verdict: 'collapse',
      evidence: { rootId, rootDerivation: root.derivation, coincidenceGuard: 'no-value-match-used' },
    };
  }
  if (rootId && root && root.exposure === 'tenant-dial' && root.governedBy && control) {
    const vocabulary = control?.domain?.enumValues ?? [];
    const named = typeof authoredValue === 'string' && vocabulary.includes(authoredValue);
    if (named) {
      return {
        rule: 'R3',
        verdict: 'variant',
        evidence: { rootId, governedBy: root.governedBy, stopName: authoredValue, coincidenceGuard: 'stop-name-authored-not-resolved-value' },
      };
    }
  }
  if (domicile === 'pro-expert') {
    return { rule: 'R4', verdict: 'pro-expert', evidence: { basis: 'domicile' } };
  }
  const allowlisted = emitsChannels.filter((channel) => overrideTokens.has(channel.split('|')[1]));
  if (allowlisted.length > 0) {
    return { rule: 'R4', verdict: 'pro-expert', evidence: { basis: 'tenant-override-allowlist', channels: allowlisted } };
  }
  return {
    rule: 'R5',
    verdict: 'adjudicate',
    evidence: {
      whyNotR2: rootId ? 'la raiz no tiene deuda de derivacion con ley citada' : 'sin raiz atribuible',
      whyNotR3: rootId ? 'el tema no autora un nombre de stop de un control gobernante' : 'sin raiz atribuible',
    },
  };
}

/**
 * EL LEDGER SE VERIFICA, O NO ES UN LEDGER.
 *
 * `BASELINE_PATH` existia desde la cohorte 0 y **nadie lo leia**: estaba
 * declarado y no aparecia en ninguna otra linea del productor. Cuatro de sus
 * cinco cifras no las miraba ningun gate -- solo un drill del
 * normalization-contract-gate acoplaba `unassignedRows` -- y por eso
 * `rowsWithoutRootAttribution` derivo de 1707 a 1467 entre la cohorte 1 y P1
 * sin que nada enrojeciera. El frente viene persiguiendo esa clase de defecto
 * ("un numero sin productor envejece en silencio") y la tenia adentro de casa.
 *
 * LA UNIDAD SE LEE DEL BASELINE, NO SE ADIVINA. `rowsWithoutRootAttribution`
 * no es "las filas sin raiz": es exactamente
 * `stats.byRootAttribution["no-persisted-membership"]`, que es la unidad que su
 * propia razon pinea. Medir otra cosa con el mismo nombre es como se rompio la
 * cifra la primera vez.
 *
 * LA LEY ES DECRECE-SOLO CON RE-ANCLA GOBERNADA, la misma del archivo y la
 * misma del normalization-contract-gate: un contador que SUBE es hallazgo real
 * y falla sin escape; uno que BAJA falla tambien, con la instruccion de bajar
 * el baseline en el MISMO commit y con razon escrita. Las dos direcciones
 * fallan porque un ledger que se actualiza solo deja de ser un ancla.
 */
export function measureLedger(doc, literalPinsOnDeclaredHead) {
  return {
    rows: doc.stats.rows,
    unassignedRows: doc.stats.byDomicile?.unassigned ?? 0,
    untaggedRows: doc.stats.byDomicile?.untagged ?? 0,
    rowsWithoutRootAttribution: doc.stats.byRootAttribution?.['no-persisted-membership'] ?? 0,
    expressionsCarryingLiteral: doc.stats.expressionsCarryingLiteral ?? 0,
    literalPinsOnDeclaredHead,
  };
}

/**
 * `literalPinsOnDeclaredHead` no sale del inventario: cuenta pines literales
 * del CSS autorado cuyo canal es cabeza declarada de una raiz. Se recomputa de
 * sus dos fuentes para que el ledger no dependa de que alguien lo copie a mano.
 *
 * SE MIDE SOBRE LAS RAICES NO REFINADAS, y eso NO es una eleccion nueva: es la
 * ley que el DT adjudico en la cohorte 2A para `root-exposure-gate`, aplicada a
 * un contador que es anterior a ella. Una raiz de paso
 * (`tier.<nivel>.<fg|border>.<paso>`) es la MISMA decision indexada mas fino,
 * asi que sus cabezas no son cabezas nuevas.
 *
 * EL PREDICADO SE IMPORTA, NO SE COPIA. `isRefinedRoot` tiene UNA definicion, en
 * el gate que la adjudico. En el lote LEDGER-GATE quedo duplicada aqui byte a
 * byte porque importarla era inseguro: el guard de entry de ese modulo corria su
 * main con solo importarlo. Arreglado el guard (lote HYGIENE, 2026-08-28), la
 * duplicacion no tiene excusa -- dos copias de una regla adjudicada divergen en
 * silencio, que es la clase de defecto que este frente persigue.
 *
 * MEDIDO, y por eso importa: contando TODAS las cabezas el contador da 24
 * contra un ancla de 20, y los 4 de diferencia son
 * `--ds-color-text-{secondary,tertiary,muted,disabled}` -- canales que se
 * volvieron cabeza cuando el eje paso creo `tier.*.fg.{secondary,tertiary,
 * muted,disabled}`. Ni un solo pin literal del CSS cambio: lo que crecio fue el
 * vocabulario de raices. Un contador que sube porque el catalogo crece no mide
 * deuda, mide catalogo -- la misma patologia de `collapsesLegacy`. Con el
 * filtro de nivel el contador vuelve a 20, que es su ancla vigente.
 */
export function countLiteralPinsOnDeclaredHead({ edges, catalog }) {
  const heads = new Set(
    (catalog.roots ?? [])
      .filter((root) => root.channel && !isRefinedRoot(root.rootId))
      .map((root) => root.channel),
  );
  return (edges.literalPins ?? []).filter((pin) => heads.has(pin.channel)).length;
}

/** Compara el ledger vivo contra su ancla. Falla en las DOS direcciones. */
export function evaluateLedger(live, baseline) {
  const failures = [];
  if (!baseline?.counters) return ['[ledger] el baseline no existe o no tiene `counters`'];
  for (const [name, value] of Object.entries(live)) {
    const anchored = baseline.counters[name]?.value;
    if (anchored === undefined) {
      failures.push(`[ledger] ${name} no esta anclado en baseline/index.json (vive ${value})`);
      continue;
    }
    if (value > anchored) {
      failures.push(`[ledger] ${name}: ${anchored} -> ${value} SUBIO — es hallazgo real; se arregla la fuente, JAMAS el ancla`);
    } else if (value < anchored) {
      failures.push(`[ledger] ${name}: ${anchored} -> ${value} bajo — baja el ancla en el MISMO commit, con razon escrita`);
    }
  }
  for (const name of Object.keys(baseline.counters)) {
    if (!(name in live)) failures.push(`[ledger] el baseline ancla ${name}, que el productor ya no mide`);
  }
  return failures;
}

export { isRefinedRoot };

export const sha256 = (text) => createHash('sha256').update(text).digest('hex');

/**
 * Carga el compilador y los temas desde `dist/`, con prueba de frescura.
 *
 * FALLA CERRADO SI dist ESTA VIEJO. El inventario mide el compilador REAL; un
 * dist rancio produciria un mapa slot->canal silenciosamente equivocado, que es
 * peor que no tener mapa. Es la misma puerta que usa el resolution-probe y por
 * la misma razon.
 */
export async function loadCompiledArm({ coreRoot = CORE_ROOT, importModule = (spec) => import(spec) } = {}) {
  const freshness = assertDistFresh({
    packageRoot: coreRoot,
    stampPath: join(coreRoot, 'dist/build-stamp.json'),
  });
  if (!freshness?.ok) {
    throw new Error(
      'slot-inventory: dist/ esta rancio o su frescura no esta probada:\n  '
      + `${(freshness?.failures ?? ['la prueba de frescura no devolvio nada']).join('\n  ')}`,
    );
  }
  const themesPath = join(coreRoot, 'dist/foundation/tokens/ts/presentation/brand-themes/index.js');
  const themes = await importModule(pathToFileURL(themesPath).href);
  const { compile } = await loadBrandThemeLowering({ coreRoot, importModule });
  return {
    compile,
    themes: {
      rottay: themes.rottayBrandTheme,
      bithire: themes.bithireBrandTheme,
      evnto: themes.evntoBrandTheme,
    },
    provenance: {
      compilerModule: LOWERING_MODULE,
      compilerExport: LOWERING_EXPORT,
      themesModule: 'dist/foundation/tokens/ts/presentation/brand-themes/index.js',
      freshnessProven: true,
    },
  };
}

/**
 * Las cuatro entradas son inyectables para que los drills corran sobre arboles
 * SINTETICOS: un gate cuyo unico banco de pruebas es el arbol real solo puede
 * probar que hoy pasa, nunca que sabe fallar.
 */
export async function buildInventory({
  coreRoot = CORE_ROOT,
  arm = null,
  catalog: injectedCatalog = null,
  controls: injectedControls = null,
  sources: injectedSources = null,
  overrideTokens: injectedOverrides = null,
  membership: injectedMembership = undefined,
} = {}) {
  const loaded = arm ?? (await loadCompiledArm({ coreRoot }));
  const catalog = injectedCatalog
    ?? JSON.parse(readFileSync(join(coreRoot, 'governance/manifest/cascade/catalog/index.json'), 'utf8'));
  const { index: headIndex, ambiguous } = headChannelIndex(catalog);
  const rootById = new Map((catalog.roots ?? []).map((root) => [root.rootId, root]));
  const controls = injectedControls ?? readControls();
  const overrideTokens = injectedOverrides ?? (await loadOverrideTokens(coreRoot));
  const sources = injectedSources ?? readSources(coreRoot);
  const membership = injectedMembership === undefined
    ? readMembership(join(coreRoot, 'artifacts/generated/manifest/cascade/membership/index.json'))
    : injectedMembership;
  const membershipSource = membership === 'none' || membership === null
    ? 'catalog-heads-only'
    : 'artifacts/generated/manifest/cascade/membership/index.json';
  const byChannel = membershipSource === 'catalog-heads-only'
    ? new Map()
    : membershipIndex(membership);

  const rows = [];
  const unmappedTagScopes = [];
  const compileFailures = [];

  for (const vertical of Object.keys(loaded.themes)) {
    const theme = loaded.themes[vertical];
    const analysis = analyzeSource({ tenant: vertical, text: sources[vertical] });
    const scopes = tagIndexFor(analysis);
    const covered = new Set();

    const baseline = flattenCompiled(loaded.compile({ brandTheme: theme, vertical, tenantSlug: vertical }));
    const leaves = evaluatedLeaves(theme, '', []);

    leaves.forEach((jsPath, ordinal) => {
      const candidates = slotCandidates(jsPath);
      const authoredValue = readAt(theme, jsPath);
      const match = resolveTag(scopes, candidates);
      const tag = match?.entry ?? null;
      const slotPath = match?.slotPath ?? candidates[0];
      // `covered` registra TODO scope que cubre esta hoja, no solo el que gana
      // por especificidad: un contenedor tageado cuyos hijos llevan un tag mas
      // fino SI cubre hojas, y contarlo como huerfano seria un falso hallazgo.
      for (const entry of scopes) {
        if (candidates.some((candidate) => candidate === entry.scope || candidate.startsWith(`${entry.scope}.`))) {
          covered.add(entry.scope);
        }
      }

      let emitted = [];
      try {
        const mutated = withLeaf(theme, jsPath, sentinelFor(authoredValue, ordinal + 1));
        const after = flattenCompiled(loaded.compile({ brandTheme: mutated, vertical, tenantSlug: vertical }));
        emitted = diffKeys(baseline, after);
      } catch (error) {
        compileFailures.push({ vertical, slotPath, reason: String(error?.message ?? error).slice(0, 200) });
      }

      const channelNames = [...new Set(emitted.map((key) => key.split('|')[1]))];
      let rootId = null;
      let rootAttribution;
      let headRootIds = [];
      if (membershipSource !== 'catalog-heads-only') {
        /* La membresia ya resolvio cabezas compartidas, fallbacks declarados y
         * la tabla adjudicada. Aca solo queda la ambiguedad PROPIA del slot: un
         * slot que mueve canales de dos raices distintas no pertenece a una. */
        const attributed = channelNames.map((channel) => byChannel.get(channel)).filter(Boolean);
        headRootIds = [...new Set(attributed.map((entry) => entry.rootId))].sort();
        if (headRootIds.length === 1) {
          rootId = headRootIds[0];
          rootAttribution = attributed.find((entry) => entry.rootId === rootId).via;
        } else if (headRootIds.length > 1) {
          rootAttribution = 'slot-spans-several-roots';
        } else if (channelNames.length === 0) {
          rootAttribution = 'emits-no-channel';
        } else {
          rootAttribution = 'no-persisted-membership';
        }
      } else {
        const heads = channelNames.filter((channel) => headIndex.has(channel));
        const ambiguousHeads = channelNames.filter((channel) => ambiguous.has(channel));
        headRootIds = [...new Set(heads.map((channel) => headIndex.get(channel)))].sort();
        if (heads.length === 1) {
          rootId = headIndex.get(heads[0]);
          rootAttribution = 'head-channel-exact';
        } else if (heads.length > 1) {
          rootAttribution = 'multiple-head-channels';
        } else if (ambiguousHeads.length > 0) {
          rootAttribution = 'head-channel-claimed-by-several-roots';
        } else if (channelNames.length === 0) {
          rootAttribution = 'emits-no-channel';
        } else {
          rootAttribution = 'no-persisted-membership';
        }
      }

      const root = rootId ? rootById.get(rootId) : null;
      const control = root?.governedBy ? controls.get(root.governedBy) : null;
      const kind = valueKind(authoredValue);
      const domicile = tag?.domicile ?? null;

      const decision = classify({
        domicile,
        valueKindOf: kind,
        rootId,
        root,
        control,
        authoredValue,
        emitsChannels: emitted,
        overrideTokens,
      });

      rows.push({
        slotId: `${vertical}:${slotPath}`,
        vertical,
        slotPath,
        evaluatedPath: jsPath,
        authoredValue: typeof authoredValue === 'string' ? authoredValue : JSON.stringify(authoredValue),
        valueKind: kind,
        readsVar: readsVar(authoredValue),
        currentDomicile: domicile,
        governor: tag?.governor ?? null,
        taggedAtLine: tag?.line ?? null,
        isMetadata: candidates.some((candidate) => METADATA_SET.has(`${vertical}|${candidate}`)),
        emitsChannels: channelNames.sort(),
        emitsScoped: emitted,
        rootId,
        headRootIds,
        rootAttribution,
        rule: decision.rule,
        verdict: decision.verdict,
        evidence: decision.evidence,
      });
    });

    for (const entry of scopes) {
      if (!covered.has(entry.scope)) {
        unmappedTagScopes.push({ vertical, scope: entry.scope, domicile: entry.domicile, line: entry.line });
      }
    }
  }

  rows.sort((a, b) => (a.slotId < b.slotId ? -1 : a.slotId > b.slotId ? 1 : 0));

  const tally = (pick) => rows.reduce((acc, row) => {
    const key = String(pick(row));
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const literalKinds = new Set(['hex', 'color-fn', 'dimension', 'number']);
  const literalSeeds = rows.filter((row) => row.currentDomicile === 'seed' && literalKinds.has(row.valueKind));
  const distinctLiteralValues = new Set(literalSeeds.map((row) => row.authoredValue.toLowerCase()));

  return {
    generated: true,
    generator: 'scripts/check/tokens/cascade/slots/index.mjs',
    schemaVersion: 1,
    law: {
      unit: 'un SLOT autorado del objeto evaluado del tema; el slotId es (vertical, keypath) y NO es posicional',
      channelMethod: 'diferencial: compile(tema) vs compile(tema con esa sola hoja en centinela unico), con compileTheme de dist bajo prueba de frescura. Un solo lowering; jamas un segundo emisor.',
      rootMethod: 'atribucion SOLO por cabeza declarada (roots[].channel). El catalogo publica cuantos canales regenera cada raiz, nunca cuales: la salida por canal del clasificador de F4A no quedo persistida. Sin cabeza exacta, rootId es null con motivo.',
      coincidenceLaw: 'la igualdad de valor NO es evidencia de nada. Ninguna fila puede justificar su veredicto por coincidencia textual, y R3 exige el NOMBRE del stop autorado, jamas su valor resuelto.',
      rules: 'R1 ya-colapsado | R2 colapsable por raiz con deuda de derivacion | R3 variante por vocabulario cerrado nombrado | R4 pro/expert | R5 cola de adjudicacion. En orden; la primera que matchea gana.',
    },
    provenance: {
      ...loaded.provenance,
      membershipSource,
      catalog: 'governance/manifest/cascade/catalog/index.json',
      catalogRoots: (catalog.roots ?? []).length,
      tagParser: 'scripts/generate/tokens/manifest/variant-parity/index.mjs (parseDocblocks + pathIndex + analyzeSource)',
      domicileVocabulary: DOMICILES,
    },
    stats: {
      rows: rows.length,
      byVertical: tally((row) => row.vertical),
      byDomicile: tally((row) => row.currentDomicile ?? 'untagged'),
      byValueKind: tally((row) => row.valueKind),
      rowsReadingVar: rows.filter((row) => row.readsVar).length,
      expressionsCarryingLiteral: rows.filter(
        (row) => row.valueKind === 'expression' && /(?<![\w.-])\d/.test(row.authoredValue),
      ).length,
      byRule: tally((row) => row.rule),
      byVerdict: tally((row) => row.verdict),
      byRootAttribution: tally((row) => row.rootAttribution),
      rowsWithRoot: rows.filter((row) => row.rootId !== null).length,
      rowsEmittingNoChannel: rows.filter((row) => row.emitsChannels.length === 0).length,
      channelEmissions: rows.reduce((sum, row) => sum + row.emitsChannels.length, 0),
      distinctChannelsReached: new Set(rows.flatMap((row) => row.emitsChannels)).size,
      metadataRows: rows.filter((row) => row.isMetadata).length,
      /* El denominador de pintura RECOMPUTADO sobre el arbol de hoy: hojas
       * evaluadas menos el roster de metadatos enumerado en
       * scripts/generate/tokens/manifest/variant-parity/index.mjs (METADATA_EXCLUSION). Las dos cifras
       * congeladas del programa (3693 y 3690) son fotos de arboles anteriores;
       * esta se recomputa en cada corrida y por eso no puede envejecer en
       * silencio. */
      paintDenominator: rows.length - rows.filter((row) => row.isMetadata).length,
      metadataRosterSize: METADATA_EXCLUSION.length,
      metadataRosterUnmatched: METADATA_EXCLUSION.filter(
        (entry) => !rows.some((row) => row.isMetadata && row.vertical === entry.tenant),
      ).length,
      literalSeedRows: literalSeeds.length,
      distinctLiteralSeedValues: distinctLiteralValues.size,
      unmappedTagScopes: unmappedTagScopes.length,
      compileFailures: compileFailures.length,
    },
    unmappedTagScopes,
    compileFailures,
    rows,
  };
}

async function loadOverrideTokens(coreRoot) {
  const module = await import(pathToFileURL(join(coreRoot, 'dist/server.js')).href).catch(() => null);
  const tokens = module?.TENANT_THEME_OVERRIDE_TOKENS;
  if (Array.isArray(tokens) && tokens.length > 0) return new Set(tokens);
  // Fail-closed: sin allowlist, R4-por-allowlist no clasifica nada y las filas
  // caen a R5. Nunca se adivina el conjunto.
  return new Set();
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
    console.error('uso: node scripts/check/tokens/cascade/slots/index.mjs [--check|--write]');
    process.exit(2);
  }
  const doc = withDigest(await buildInventory());
  const text = serialize(doc);
  if (mode === '--write') {
    mkdirSync(dirname(OUT_PATH), { recursive: true });
    writeFileSync(OUT_PATH, text);
    console.log(`slot-inventory: escrito ${OUT_PATH} — ${doc.stats.rows} filas, digest ${doc.digest.slice(0, 12)}`);
    return;
  }
  let current = null;
  try { current = readFileSync(OUT_PATH, 'utf8'); } catch { current = null; }
  if (current === null) {
    console.error(`slot-inventory: FAIL — ${OUT_PATH} no existe. Corre --write.`);
    process.exit(1);
  }
  if (current !== text) {
    console.error('slot-inventory: FAIL — el inventario no coincide con el arbol. Corre --write y revisa el diff.');
    process.exit(1);
  }
  /* El ledger se verifica DESPUES de la identidad byte a byte: si el artefacto
   * ya divergio, el ledger no agrega informacion y el mensaje seria ruido. */
  const pins = countLiteralPinsOnDeclaredHead({
    edges: JSON.parse(readFileSync(join(CORE_ROOT, 'artifacts/generated/manifest/cascade/edges/index.json'), 'utf8')),
    catalog: JSON.parse(readFileSync(join(CORE_ROOT, 'governance/manifest/cascade/catalog/index.json'), 'utf8')),
  });
  const live = measureLedger(doc, pins);
  let baseline = null;
  try { baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8')); } catch { baseline = null; }
  const ledgerFailures = evaluateLedger(live, baseline);
  if (ledgerFailures.length > 0) {
    console.error('slot-inventory: FAIL — el ledger no coincide con su ancla:');
    for (const failure of ledgerFailures) console.error(`  - ${failure}`);
    process.exit(1);
  }
  console.log(`slot-inventory: OK — ${doc.stats.rows} filas, digest ${doc.digest.slice(0, 12)}, ledger 6/6 en su ancla`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv).catch((error) => {
    console.error(`slot-inventory: ${error?.message ?? error}`);
    process.exit(1);
  });
}
