#!/usr/bin/env node
/**
 * @fileoverview HECHO GENERADO: paridad de espejo entre los tres temas de
 * primera parte (rottay / bithire / evnto).
 *
 * El owner fijo como ley que los tres temas de marca "tienen que ser espejos".
 * Este generador mide, sin opinar, cuanta superficie comparten realmente.
 *
 * ───────────────────────────────────────────────────────────────────────────
 * ADVERTENCIA DE PROCEDENCIA — leela antes de citar una cifra
 * ───────────────────────────────────────────────────────────────────────────
 * `src/foundation/tokens/css/facade/artifacts/<tenant>/index.css` son
 * SNAPSHOTS GENERADOS por `build:vertical-css`, no fuente. Toda cifra de la
 * seccion `surface`, `valueParity` y `cascade` mide el ARTEFACTO, es decir el
 * resultado del compilador sobre las fuentes en el momento en que se
 * regeneraron por ultima vez. NO mide las fuentes `.ts`.
 *
 * La cifra derivada de fuente vive aparte, en `sourceSkeleton`, y nunca se
 * fusiona con las anteriores: son unidades distintas (un canal CSS no es una
 * hoja de decision autorada) y momentos distintos (el artefacto puede estar
 * atrasado respecto de la fuente).
 *
 * ───────────────────────────────────────────────────────────────────────────
 * DOS TRAMPAS QUE ESTE ARCHIVO EVITA A PROPOSITO
 * ───────────────────────────────────────────────────────────────────────────
 * 1. No se cuentan OCURRENCIAS, se cuenta IDENTIDAD de canal. Un `grep -c`
 *    sobre el artefacto mide el metodo de escritura, no la poblacion: los tres
 *    archivos declaran el mismo canal varias veces en scopes distintos. El
 *    campo `occurrenceTrap` deja las dos cifras a la vista para que nadie
 *    vuelva a confundirlas.
 * 2. No se compara valor contra valor a ciegas. Rottay es dark-first y
 *    bithire/evnto son light-first, asi que el bloque "modo por defecto" de
 *    uno es oscuro y el del otro claro. La paridad de valor se mide por ROL de
 *    scope (`base` / `default-mode` / `overlay-mode` / `reduced-motion`), que
 *    es la pregunta de espejo correcta: no "escriben el mismo literal" sino
 *    "autoran la misma ranura".
 *
 * Uso:
 *   node mirror-parity.mjs            regenera generated/mirror-parity/index.json
 *   node mirror-parity.mjs --check    falla si el archivo esta desactualizado
 */

import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { packageRoot as findPackageRoot } from '../../../../libraries/repo-root/index.mjs';
import {
  buildChecklists,
  loadCanon,
  loadFacts,
  serialize as serializeChecklists,
} from '../root-checklists/index.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
/** The programme folder stays under `scripts/`; only the manifest graduated. */
export const PACKAGE_ROOT = findPackageRoot(HERE);
export const PROGRAM_ROOT = path.resolve(PACKAGE_ROOT, 'scripts/check/modern-rescue');
/** `generated/` lives at the manifest ROOT; only this producer moved. */
export const MANIFEST_ROOT = path.join(PACKAGE_ROOT, 'governance/manifest');
export const OUTPUT_PATH = path.join(PACKAGE_ROOT, 'artifacts/generated/manifest/themes/parity/compiled/index.json');

/** Los tres verticales de primera parte, en orden fijo y declarado. */
export const TENANTS = ['rottay', 'bithire', 'evnto'];

const ARTIFACT_DIR = 'src/foundation/tokens/css/facade/artifacts';
const SOURCE_DIR = 'src/foundation/tokens/ts/presentation/brand-themes';

export const artifactPath = (tenant) => `${ARTIFACT_DIR}/${tenant}/index.css`;
export const sourcePath = (tenant) => `${SOURCE_DIR}/${tenant}/index.ts`;

/* ═══════════════════════════════════════════════════════════════════════════
 * Lectura
 * ═══════════════════════════════════════════════════════════════════════════ */

const read = (rel) => readFileSync(path.join(PACKAGE_ROOT, rel), 'utf8');

/**
 * Procedencia de un archivo leido.
 *
 * Se registra el sha256 del contenido y NO el mtime: el mtime cambia con un
 * `touch` o un clon nuevo y romperia `--check` sin que el contenido se haya
 * movido, mientras que el hash identifica la revision exacta de la que salio
 * la cifra. Esa es la propiedad que se pidio ("de que revision salio"), y el
 * hash la da mejor que la fecha.
 */
export function provenanceOf(rel) {
  const text = read(rel);
  return {
    file: rel,
    bytes: Buffer.byteLength(text, 'utf8'),
    lines: text.split('\n').length,
    sha256: createHash('sha256').update(text).digest('hex'),
  };
}

/** Blanquea comentarios `/* *​/` conservando offsets y numeros de linea. */
export function blankComments(src) {
  let out = '';
  let i = 0;
  while (i < src.length) {
    if (src[i] === '/' && src[i + 1] === '*') {
      const end = src.indexOf('*/', i + 2);
      const stop = end === -1 ? src.length : end + 2;
      for (let j = i; j < stop; j += 1) out += src[j] === '\n' ? '\n' : ' ';
      i = stop;
      continue;
    }
    out += src[i];
    i += 1;
  }
  return out;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Rol de scope
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Rol normalizado de un bloque, insensible a comillas y al modo concreto.
 *
 * • `default-mode`   el bloque `:not([data-theme=X]):not(.X)` — el modo que el
 *                    tema ES. Oscuro en rottay, claro en bithire/evnto.
 * • `overlay-mode`   el bloque del modo contrario.
 * • `reduced-motion` dentro de `@media (prefers-reduced-motion: reduce)`.
 * • `base`           el bloque de tenant sin condicion de modo.
 */
export function scopeRole(selector, inReducedMotion) {
  if (inReducedMotion) return 'reduced-motion';
  const s = selector.replace(/["']/g, "'");
  if (/:not\(\s*\[data-theme=/.test(s)) return 'default-mode';
  if (/\[data-theme='(light|dark)'\]/.test(s) || /\.(light|dark)\b/.test(s)) return 'overlay-mode';
  return 'base';
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Declaraciones de un artefacto
 * ═══════════════════════════════════════════════════════════════════════════ */

const CHANNEL_PROP = /^--ds-[a-z0-9-]+$/;

/**
 * Extrae las declaraciones `--ds-*` de un artefacto.
 *
 * Recorre el archivo como un flujo de sentencias, no con una expresion regular
 * sobre el texto: una declaracion es el token que precede al primer `:` de una
 * sentencia dentro de un bloque. Asi una lectura `var(--ds-x)` en el VALOR de
 * otra declaracion nunca se confunde con una declaracion propia, que es
 * exactamente el error que convierte un conteo de identidad en un conteo de
 * ocurrencias.
 *
 * @returns {Map<string, Array<{role: string, value: string}>>}
 */
export function declarationsOf(cssText) {
  const src = blankComments(cssText);
  const out = new Map();

  const stack = [];
  let buf = '';
  let pendingSelector = '';
  let reducedDepth = -1;

  const flush = () => {
    const stmt = buf.trim();
    buf = '';
    if (stack.length === 0 || !stmt) return;
    const colon = stmt.indexOf(':');
    if (colon < 0) return;
    const prop = stmt.slice(0, colon).trim();
    if (!CHANNEL_PROP.test(prop)) return;
    const value = stmt.slice(colon + 1).trim().replace(/\s+/g, ' ');
    const role = scopeRole(stack[stack.length - 1], reducedDepth !== -1);
    if (!out.has(prop)) out.set(prop, []);
    out.get(prop).push({ role, value });
  };

  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i];
    if (ch === '{') {
      const selector = (pendingSelector + buf).trim();
      if (selector.startsWith('@media') && /prefers-reduced-motion/.test(selector) && reducedDepth === -1) {
        reducedDepth = stack.length;
      }
      stack.push(selector);
      pendingSelector = '';
      buf = '';
    } else if (ch === '}') {
      flush();
      stack.pop();
      if (reducedDepth === stack.length) reducedDepth = -1;
      buf = '';
    } else if (ch === ';') {
      flush();
    } else {
      buf += ch;
    }
  }
  return out;
}

/** Cifra de la trampa: ocurrencias de escritura frente a identidad de canal. */
export function occurrenceCount(cssText) {
  return (blankComments(cssText).match(/(^|[{;])\s*--ds-[a-z0-9-]+\s*:/g) ?? []).length;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * El PISO del design system
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Sitios de declaracion con numero de linea.
 *
 * `declarationsOf` agrupa por canal y anota el ROL de scope, que es la
 * pregunta correcta para un artefacto de tenant. Para el piso la pregunta es
 * otra —de que archivo y de que linea sale la declaracion que decide la
 * clase— asi que la lectura se hace aparte y en orden de aparicion. Es el
 * mismo recorrido de sentencias (no una expresion regular sobre el texto), de
 * modo que una lectura `var(--ds-x)` dentro de un valor nunca se confunde con
 * una declaracion de `--ds-x`.
 *
 * @returns {Array<{channel: string, value: string, line: number}>}
 */
export function declarationSites(cssText) {
  const src = blankComments(cssText);
  const out = [];

  let depth = 0;
  let buf = '';
  let line = 1;
  let stmtLine = 1;

  const flush = () => {
    const stmt = buf.trim();
    buf = '';
    if (depth === 0 || !stmt) return;
    const colon = stmt.indexOf(':');
    if (colon < 0) return;
    const prop = stmt.slice(0, colon).trim();
    if (!CHANNEL_PROP.test(prop)) return;
    out.push({ channel: prop, value: stmt.slice(colon + 1).trim().replace(/\s+/g, ' '), line: stmtLine });
  };

  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i];
    if (ch === '\n') line += 1;
    if (!buf.trim() && !/\s/.test(ch)) stmtLine = line;
    if (ch === '{') {
      depth += 1;
      buf = '';
    } else if (ch === '}') {
      flush();
      depth -= 1;
      buf = '';
    } else if (ch === ';') {
      flush();
    } else {
      buf += ch;
    }
  }
  return out;
}

/**
 * Un valor es DERIVADO cuando su forma delega en otro canal o lo calcula.
 *
 * No se pregunta por el nombre del canal ni por una lista escrita a mano: se
 * pregunta por la FORMA del valor que el piso escribio. `var(`, `calc(` y
 * `color-mix(` son las tres formas con las que el design system deja pasar un
 * dial; cualquier otra cosa es un literal en reposo.
 */
export const DERIVED_VALUE = /var\(|calc\(|color-mix\(/;

export const FLOOR_DIR = 'src/foundation/tokens/css';
export const FLOOR_EXCLUDED = `${ARTIFACT_DIR}/`;

/** Los `.css` del piso, en orden estable y sin los artefactos de tenant. */
export function floorFiles() {
  const walk = (rel) => {
    const abs = path.join(PACKAGE_ROOT, rel);
    const out = [];
    for (const entry of readdirSync(abs, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
      const child = `${rel}/${entry.name}`;
      if (child.startsWith(FLOOR_EXCLUDED)) continue;
      if (entry.isDirectory()) out.push(...walk(child));
      else if (entry.name.endsWith('.css')) out.push(child);
    }
    return out;
  };
  return walk(FLOOR_DIR);
}

/**
 * Indice del piso: que declara el design system y con que forma.
 *
 * ───────────────────────────────────────────────────────────────────────────
 * POR QUE EXISTE ESTE INDICE
 * ───────────────────────────────────────────────────────────────────────────
 * `cascadeSeverance` excluia del reparto TODO canal que ademas fuera raiz de
 * cascada, con una justificacion escrita sobre un DIAL: que un tenant fije su
 * propio `--ds-radius-scale: 1.25` es el mecanismo funcionando, no un corte.
 * Para un dial la justificacion es correcta. El problema es que la exclusion
 * se generalizo y la justificacion no: de las raices del checklist solo una
 * parte son diales numericos, y el resto son canales que el PISO deriva.
 *
 * El discriminador no puede ser el nombre ni una lista curada. Es QUE HACE EL
 * PISO con ese canal:
 *
 *   el piso lo declara LITERAL  → que el tema lo fije es el contrato. La
 *                                 semilla es del tema. Legitimo.
 *   el piso lo declara DERIVADO → congelarlo en el tema CORTA una derivacion
 *                                 que el sistema posee, y todo lector de ese
 *                                 canal pierde el dial. Es un corte, y se
 *                                 cuenta como tal.
 *   el piso NO lo declara       → no hay derivacion que cortar: la semilla es
 *                                 del tema por construccion. Legitimo.
 *
 * El indice registra tambien el TAMANO y el HASH del piso medido, para que un
 * cambio de piso —un archivo nuevo, una derivacion que pasa a literal— se vea
 * como un movimiento de esta evidencia y no como un ruido sin causa.
 */
export function readFloorCorpus() {
  const files = floorFiles();
  const sites = new Map();
  const digest = createHash('sha256');
  for (const file of files) {
    const text = read(file);
    digest.update(`${file}\u0000${createHash('sha256').update(text).digest('hex')}\n`);
    for (const site of declarationSites(text)) {
      if (!sites.has(site.channel)) sites.set(site.channel, []);
      sites.get(site.channel).push({ file, line: site.line, value: site.value });
    }
  }
  return {
    dir: FLOOR_DIR,
    excludes: FLOOR_EXCLUDED,
    excludeReason: 'Los artefactos de tenant son la SALIDA que se esta juzgando; incluirlos haria que el piso se explicara a si mismo.',
    files: files.length,
    channels: sites.size,
    sha256: digest.digest('hex'),
    sites,
  };
}

/**
 * Que hace el piso con un canal: `derived`, `literal` o `absent`.
 *
 * Basta UN sitio derivado para que la clase sea `derived`: si el design
 * system deriva ese canal en algun lado, congelarlo en el tema apaga esa
 * derivacion para el scope en el que el tema gana.
 */
export function floorVerdict(floor, channel) {
  const sites = floor.sites.get(channel);
  if (!sites || sites.length === 0) return { kind: 'absent', site: null };
  const derived = sites.find((s) => DERIVED_VALUE.test(s.value));
  return derived ? { kind: 'derived', site: derived } : { kind: 'literal', site: sites[0] };
}

/** La autoridad ya fue validada y propagada por root-checklists. */
export function tenantSeedAuthority(checklistRoot) {
  if (checklistRoot?.rootAuthority !== 'tenant-seed') return null;
  return { kind: 'tenant-seed', rootId: checklistRoot.rootId };
}

/** Valores efectivos por modo; una declaracion base alcanza ambos modos. */
export function effectiveRoleValues(entries) {
  const valuesByRole = new Map();
  for (const entry of entries) {
    if (!valuesByRole.has(entry.role)) valuesByRole.set(entry.role, new Set());
    valuesByRole.get(entry.role).add(entry.value);
  }
  for (const [role, values] of valuesByRole) {
    if (values.size > 1) throw new Error(`mirror-parity: declaraciones divergentes en el mismo rol (${role})`);
  }
  const last = new Map([...valuesByRole].map(([role, values]) => [role, [...values][0]]));
  const out = [];
  for (const role of ['default-mode', 'overlay-mode']) {
    const value = last.has(role) ? last.get(role) : last.get('base');
    if (value !== undefined) out.push({ role, value });
  }
  if (last.has('reduced-motion')) out.push({ role: 'reduced-motion', value: last.get('reduced-motion') });
  return out;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Superficie: union, interseccion y los seis bolsones del diagrama de Venn
 * ═══════════════════════════════════════════════════════════════════════════ */

const sorted = (it) => [...it].sort();

/**
 * Interseccion por pares, con el porcentaje sobre la union del PAR.
 *
 * La cifra de los tres esta acotada por el tema mas delgado: si un vertical
 * autora 430 canales y otro 1282, la interseccion triple no puede pasar de
 * 430 por aritmetica, y leerla sin este desglose confundiria "espejos rotos"
 * con "un tema mucho mas chico que los otros". Las dos cosas son hallazgos,
 * pero no son el mismo hallazgo.
 */
export function pairwise(sets) {
  const out = {};
  for (let i = 0; i < TENANTS.length; i += 1) {
    for (let j = i + 1; j < TENANTS.length; j += 1) {
      const a = sets[TENANTS[i]];
      const b = sets[TENANTS[j]];
      const shared = [...a].filter((x) => b.has(x)).length;
      const union = new Set([...a, ...b]).size;
      out[`${TENANTS[i]}+${TENANTS[j]}`] = {
        shared,
        union,
        pctOfUnion: Number(((shared / union) * 100).toFixed(1)),
        pctOfSmaller: Number(((shared / Math.min(a.size, b.size)) * 100).toFixed(1)),
      };
    }
  }
  return out;
}

export function surfaceParity(byTenant) {
  const [a, b, c] = TENANTS;
  const sets = Object.fromEntries(TENANTS.map((t) => [t, new Set(byTenant[t].keys())]));
  const union = sorted(new Set([...sets[a], ...sets[b], ...sets[c]]));
  const all = union.filter((ch) => TENANTS.every((t) => sets[t].has(ch)));

  const bucket = (present, absent) =>
    union.filter((ch) => present.every((t) => sets[t].has(ch)) && absent.every((t) => !sets[t].has(ch)));

  return {
    declares: Object.fromEntries(TENANTS.map((t) => [t, sets[t].size])),
    union: union.length,
    intersection: all.length,
    intersectionPct: Number(((all.length / union.length) * 100).toFixed(1)),
    intersectionPctOfSmallest: Number(((all.length / Math.min(...TENANTS.map((t) => sets[t].size))) * 100).toFixed(1)),
    pairwise: pairwise(sets),
    venn: {
      [`only-${a}`]: bucket([a], [b, c]),
      [`only-${b}`]: bucket([b], [a, c]),
      [`only-${c}`]: bucket([c], [a, b]),
      [`${a}+${b}-not-${c}`]: bucket([a, b], [c]),
      [`${a}+${c}-not-${b}`]: bucket([a, c], [b]),
      [`${b}+${c}-not-${a}`]: bucket([b, c], [a]),
      'all-three': all,
    },
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Paridad de valor entre los canales que los tres declaran
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Firma role→valores de un canal en un tenant, estable y comparable. */
export function valueSignature(entries) {
  const byRole = new Map();
  for (const { role, value } of entries) {
    if (!byRole.has(role)) byRole.set(role, []);
    byRole.get(role).push(value);
  }
  return sorted(byRole.keys()).map((r) => `${r}=${byRole.get(r).join('|')}`).join(' ');
}

/** Conjunto de roles en los que un canal esta autorado. */
const roleSet = (entries) => sorted(new Set(entries.map((e) => e.role))).join(',');

/**
 * Divergencia de valor, deliberadamente SEPARADA de la de presencia.
 *
 * Que dos temas declaren el mismo canal con valores distintos es un espejo
 * LEGITIMO: es la marca haciendo su trabajo. Que uno lo declare y el otro no,
 * no lo es. Por eso las dos cifras no se promedian ni se suman.
 */
export function valueParity(byTenant, common) {
  let identicalValue = 0;
  let divergentValue = 0;
  let identicalRoles = 0;
  let divergentRoles = 0;
  const divergentRoleChannels = [];

  for (const ch of common) {
    const sigs = TENANTS.map((t) => valueSignature(byTenant[t].get(ch)));
    if (sigs.every((s) => s === sigs[0])) identicalValue += 1;
    else divergentValue += 1;

    const roles = TENANTS.map((t) => roleSet(byTenant[t].get(ch)));
    if (roles.every((r) => r === roles[0])) identicalRoles += 1;
    else {
      divergentRoles += 1;
      divergentRoleChannels.push({
        channel: ch,
        roles: Object.fromEntries(TENANTS.map((t, i) => [t, roles[i]])),
      });
    }
  }

  return {
    commonChannels: common.length,
    identicalValue,
    divergentValue,
    identicalRoleShape: identicalRoles,
    divergentRoleShape: divergentRoles,
    divergentRoleShapeChannels: divergentRoleChannels,
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Cascada: DECLARADO no es CORTADO
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Lee los canales que una declaracion consulta.
 *
 * @returns {string[]} nombres leidos, en orden de aparicion
 */
export function readsOf(value) {
  return [...value.matchAll(/var\(\s*(--[a-zA-Z0-9_-]+)/g)].map((m) => m[1]);
}

/** Clasifica cortes y derivaciones por modo efectivo. */
export function cascadeSeverance(checklists, byTenant, floor) {
  const rootRecords = new Map(checklists.roots.map((r) => [r.root, r]));
  const roots = new Set(rootRecords.keys());
  const universe = new Set();
  for (const r of checklists.roots) for (const c of r.channels) universe.add(c.channel);
  const cascadeChannels = sorted(universe);

  /** Lectores afectados en los modos donde la raiz esta congelada. */
  const readersWithin = (decls, channel, frozenRoles) => {
    const out = [];
    for (const [other, entries] of decls) {
      if (other === channel) continue;
      const roles = effectiveRoleValues(entries)
        .filter((e) => frozenRoles.has(e.role) && readsOf(e.value).includes(channel))
        .map((e) => e.role);
      if (roles.length > 0) out.push({ channel: other, roles });
    }
    return out.sort((a, b) => (a.channel < b.channel ? -1 : 1));
  };

  const perTenant = {};
  for (const tenant of TENANTS) {
    const decls = byTenant[tenant];
    const declared = cascadeChannels.filter((c) => decls.has(c));
    const subject = declared.filter((c) => !roots.has(c));

    const rootPinned = [];
    const rootFrozen = [];
    for (const channel of declared.filter((c) => roots.has(c))) {
      const entries = decls.get(channel);
      const values = [...new Set(entries.map((e) => `${e.role}=${e.value}`))];
      const effective = effectiveRoleValues(entries);
      const authority = tenantSeedAuthority(rootRecords.get(channel));
      if (authority) {
        rootPinned.push({ channel, reason: 'tenant-seed', values, authority });
        continue;
      }
      const verdict = floorVerdict(floor, channel);
      const liveRoles = effective.filter((e) => readsOf(e.value).length > 0).map((e) => e.role);
      const frozenRoles = effective.filter((e) => readsOf(e.value).length === 0).map((e) => e.role);
      if (verdict.kind === 'derived' && frozenRoles.length > 0) {
        const readerRoles = readersWithin(decls, channel, new Set(frozenRoles));
        rootFrozen.push({
          channel,
          values,
          frozenRoles,
          liveRoles,
          mixed: liveRoles.length > 0,
          readers: readerRoles.map((r) => r.channel),
          readerRoles,
          readerCount: readerRoles.length,
          floor: verdict.site,
        });
        continue;
      }
      if (liveRoles.length > 0) {
        rootPinned.push({ channel, reason: 'tenant-parametric', values, liveRoles });
        continue;
      }
      rootPinned.push({
        channel,
        reason: verdict.kind === 'literal' ? 'floor-literal' : 'floor-absent',
        values,
        floor: verdict.site,
      });
    }

    const severs = [];
    const reDerives = [];
    for (const channel of subject) {
      const entries = decls.get(channel);
      const effective = effectiveRoleValues(entries);
      const withVar = effective.filter((e) => readsOf(e.value).length > 0);
      const severedRoles = effective.filter((e) => readsOf(e.value).length === 0).map((e) => e.role);
      if (withVar.length === 0) {
        severs.push({
          channel,
          values: [...new Set(entries.map((e) => `${e.role}=${e.value}`))],
          severedRoles,
        });
        continue;
      }
      const readsByRole = effective
        .map((e) => ({ role: e.role, reads: sorted(new Set(readsOf(e.value))) }))
        .filter((e) => e.reads.length > 0);
      const reads = sorted(new Set(readsByRole.flatMap((e) => e.reads)));
      reDerives.push({
        channel,
        reads,
        readsByRole,
        severedRoles,
        reachesRoot: reads.some((r) => roots.has(r)),
        mixed: severedRoles.length > 0,
      });
    }

    // Una re-derivacion puede leer un canal que el MISMO artefacto corta; en
    // ese caso el dial tampoco llega. Se mide aparte en vez de suponerlo.
    //
    // El conjunto de canales cortados incluye `rootFrozen`: una raiz congelada
    // esta tan muerta como un canal cortado, y omitirla era exactamente el
    // punto ciego que la exclusion generalizada creaba. `reachesRoot` se
    // conserva con su significado literal —lee un nombre de raiz— y la
    // pregunta util se publica aparte como `reachesLiveRoot`: lee una raiz que
    // este tenant NO congelo.
    const cutRoles = new Map();
    const addCutRoles = (channel, roles) => {
      if (!cutRoles.has(channel)) cutRoles.set(channel, new Set());
      for (const role of roles) cutRoles.get(channel).add(role);
    };
    for (const s of severs) addCutRoles(s.channel, s.severedRoles);
    for (const r of reDerives) addCutRoles(r.channel, r.severedRoles);
    for (const f of rootFrozen) addCutRoles(f.channel, f.frozenRoles);
    for (const r of reDerives) {
      r.liveRootRoles = r.readsByRole
        .filter(({ role, reads }) => reads.some((x) => roots.has(x) && !cutRoles.get(x)?.has(role)))
        .map((x) => x.role);
      r.blockedRoles = r.readsByRole
        .filter(({ role, reads }) => reads.length > 0 && reads.every((x) => cutRoles.get(x)?.has(role)))
        .map((x) => x.role);
      r.reachesLiveRoot = r.liveRootRoles.length > 0;
      r.blockedUpstream = r.blockedRoles.length > 0;
    }
    const partiallySevered = reDerives
      .filter((r) => r.severedRoles.length > 0)
      .map((r) => ({ channel: r.channel, severedRoles: r.severedRoles }));

    perTenant[tenant] = {
      declaredInCascade: declared.length,
      severedTotal: severs.length + rootFrozen.length + partiallySevered.length,
      rootPinned: {
        count: rootPinned.length,
        byReason: Object.fromEntries(
          ['tenant-seed', 'tenant-parametric', 'floor-literal', 'floor-absent']
            .map((k) => [k, rootPinned.filter((p) => p.reason === k).length]),
        ),
        channels: rootPinned,
      },
      rootFrozen: {
        count: rootFrozen.length,
        readerEdges: rootFrozen.reduce((a, f) => a + f.readerCount, 0),
        readerRoleEdges: rootFrozen.reduce((a, f) => a + f.readerRoles.reduce((n, r) => n + r.roles.length, 0), 0),
        distinctReaders: new Set(rootFrozen.flatMap((f) => f.readers)).size,
        mixedRoleValues: rootFrozen.filter((f) => f.mixed).length,
        channels: rootFrozen,
      },
      severs: { count: severs.length, channels: severs },
      partiallySevered: {
        count: partiallySevered.length,
        roleEdges: partiallySevered.reduce((n, x) => n + x.severedRoles.length, 0),
        channels: partiallySevered,
      },
      reDerives: {
        count: reDerives.length,
        reachingRoot: reDerives.filter((r) => r.reachesRoot).length,
        reachingLiveRoot: reDerives.filter((r) => r.reachesLiveRoot).length,
        mixedRoleValues: reDerives.filter((r) => r.mixed).length,
        blockedUpstream: reDerives.filter((r) => r.blockedUpstream).length,
        blockedUpstreamRoles: reDerives.reduce((n, r) => n + r.blockedRoles.length, 0),
        channels: reDerives,
      },
    };
  }

  return {
    universe: cascadeChannels.length,
    roots: roots.size,
    partition: 'declaredInCascade = rootPinned + rootFrozen + severs + reDerives, por tenant',
    exclusionRule: [
      'Una raiz declarada por el tema queda fuera del reparto severs/reDerives, pero NO fuera de la medicion.',
      'Una semilla continua Standard autorada por tenant es rootPinned por autoridad del manifest.',
      'Fuera de esa autoridad, piso DERIVADO + al menos un modo sin var() = rootFrozen;',
      'piso LITERAL, piso AUSENTE o todos los modos parametricos = rootPinned.',
    ].join(' '),
    severityRule: 'severedTotal = severs + rootFrozen + partiallySevered. El bloqueo se decide por modo efectivo; un canal mixto corta sólo los modos literales.',
    roleModel: 'Una declaracion base alcanza default-mode y overlay-mode; cada declaracion especifica de modo la reemplaza. reduced-motion se mide aparte.',
    rootAuthoritySource: 'artifacts/generated/manifest/cascade/coverage/index.json#roots[].rootAuthority',
    floorCorpus: {
      dir: floor.dir,
      excludes: floor.excludes,
      excludeReason: floor.excludeReason,
      files: floor.files,
      channels: floor.channels,
      sha256: floor.sha256,
      derivedForms: 'var( | calc( | color-mix(',
      note: 'Tamano y hash del piso medido. Si el piso cambia, esta cifra se mueve y la clasificacion de raices se vuelve a discutir con evidencia.',
    },
    perTenant,
  };
}

/**
 * Recuento de canales de cascada declarados, sin juicio de severidad.
 *
 * Se conserva SEPARADO de `cascadeSeverance` a proposito: es la cifra de
 * presencia, util para saber donde mirar, y explicitamente NO una cifra de
 * defecto. Un lector que solo vea esta seccion no puede concluir nada sobre la
 * cascada, y el campo `notSeverity` se lo dice.
 */
export function cascadePresence(checklists, byTenant) {
  const sets = Object.fromEntries(TENANTS.map((t) => [t, new Set(byTenant[t].keys())]));
  const roots = [];
  for (const root of checklists.roots) {
    const cascade = root.channels.map((c) => c.channel);
    const declaredByAny = cascade.filter((ch) => TENANTS.some((t) => sets[t].has(ch)));
    if (declaredByAny.length === 0 && cascade.length === 0) continue;
    roots.push({
      root: root.root,
      channelsInCascade: cascade.length,
      declaredByAny: declaredByAny.length,
      declaredByAll: cascade.filter((ch) => TENANTS.every((t) => sets[t].has(ch))).length,
      byTenant: Object.fromEntries(TENANTS.map((t) => [t, cascade.filter((ch) => sets[t].has(ch)).length])),
      channels: declaredByAny.map((ch) => ({ channel: ch, tenants: TENANTS.filter((t) => sets[t].has(ch)) })),
    });
  }
  const ever = new Set();
  for (const r of roots) for (const c of r.channels) ever.add(c.channel);
  return {
    notSeverity: 'Presencia, NO severidad. Un canal declarado puede re-derivar y dejar pasar el dial. La severidad esta en `cascadeSeverance`.',
    distinctChannelsDeclared: ever.size,
    roots,
  };
}

/**
 * Canales con mas de una declaracion en el mismo artefacto.
 *
 * ESTO NO ES DUPLICACION. `--ds-table-cell-font-size` aparece dos veces en
 * bithire (0.8125rem y 0.875rem) porque son el bloque claro y el oscuro: es la
 * variante de modo, el mecanismo funcionando. La cifra se publica con este
 * nombre y esta nota para que nadie lea "830 canales" como "830 duplicados".
 * La paridad de valor de este mismo documento ya compara por ROL de scope
 * justamente por esto.
 */
export function multiDeclaration(byTenant) {
  const out = {};
  for (const tenant of TENANTS) {
    const multi = [...byTenant[tenant].entries()].filter(([, e]) => e.length > 1);
    const distinctRoles = multi.filter(([, e]) => new Set(e.map((x) => x.role)).size === e.length);
    // El mismo rol dos veces SI es otra cosa: la segunda declaracion pisa a la
    // primera dentro del mismo scope. Se lista aparte, con valores, porque
    // cuando los valores difieren es un pisado real y no una variante.
    const sameRole = multi
      .filter(([, e]) => new Set(e.map((x) => x.role)).size !== e.length)
      .map(([channel, e]) => {
        // El pisado solo es real si DENTRO de un mismo rol hay dos valores
        // distintos. Comparar entre roles marcaria como pisado a la variante
        // claro/oscuro, que es justo lo contrario de un defecto.
        const perRole = new Map();
        for (const x of e) {
          if (!perRole.has(x.role)) perRole.set(x.role, new Set());
          perRole.get(x.role).add(x.value);
        }
        return {
          channel,
          declarations: e.map((x) => `${x.role}=${x.value}`),
          valuesDifferWithinRole: [...perRole.values()].some((v) => v.size > 1),
        };
      });

    out[tenant] = {
      channelsDeclaredMoreThanOnce: multi.length,
      allInDistinctRoles: distinctRoles.length,
      sameRoleTwice: multi.length - distinctRoles.length,
      sameRoleTwiceChannels: sameRole,
    };
  }
  return {
    notDuplication: 'Variante de modo (claro/oscuro), no duplicacion. Ver `valueParity`, que compara por rol de scope.',
    perTenant: out,
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Cifra derivada de fuente — SEPARADA, otra unidad, otro momento
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Hojas de decision autoradas en una fuente `.ts` de tema.
 *
 * Las fuentes NO nombran canales `--ds-*`: los nombres los inventa
 * `compileBrandTheme`. Por eso la unidad de fuente no puede ser el canal, y es
 * la RUTA DE HOJA del objeto autorado (`palette.accent.strong`). Comparar esta
 * cifra con la del artefacto seria comparar peras con manzanas; se publica
 * aparte justamente para que no se haga.
 *
 * La extraccion es lexica y no ejecuta el modulo: recorre las declaraciones
 * `const NOMBRE = { ... }` de nivel superior y anota la ruta de toda clave cuyo
 * valor no es otro objeto literal.
 */
export function authoredLeafPaths(tsText, tenant = null) {
  const src = tsText;
  const leaves = new Set();

  /**
   * El const de esqueleto se llama `<tenant>BrandTheme`, asi que su nombre
   * nunca coincidiria entre temas y cada una de sus hojas contaria como
   * exclusiva por un detalle de nomenclatura. Se normaliza a `THEME` para que
   * la comparacion mida estructura y no el nombre del tenant.
   */
  const canonicalRoot = (name) => (/^[a-z]+BrandTheme$/.test(name) ? 'THEME' : name);

  const isIdent = (c) => /[A-Za-z0-9_$]/.test(c);
  const decl = /^(?:export\s+)?const\s+([A-Za-z0-9_$]+)\s*(?::[^=]*)?=\s*\{/gm;

  let m;
  while ((m = decl.exec(src)) !== null) {
    const rootName = canonicalRoot(m[1]);
    let i = decl.lastIndex - 1; // en la llave de apertura
    const pathStack = [];
    let depth = 0;
    let key = null;
    let token = '';

    while (i < src.length) {
      const ch = src[i];

      // comentarios
      if (ch === '/' && src[i + 1] === '/') { i = src.indexOf('\n', i); if (i === -1) break; continue; }
      if (ch === '/' && src[i + 1] === '*') { const e = src.indexOf('*/', i + 2); i = e === -1 ? src.length : e + 2; continue; }

      // cadenas
      if (ch === "'" || ch === '"' || ch === '`') {
        const quote = ch;
        let j = i + 1;
        while (j < src.length && !(src[j] === quote && src[j - 1] !== '\\')) j += 1;
        token += src.slice(i, j + 1);
        i = j + 1;
        continue;
      }

      if (ch === '{') {
        depth += 1;
        if (depth > 1) pathStack.push(key ?? '?');
        key = null;
        token = '';
        i += 1;
        continue;
      }
      if (ch === '}') {
        if (key !== null && token.trim()) leaves.add([rootName, ...pathStack, key].join('.'));
        key = null;
        token = '';
        depth -= 1;
        if (depth === 0) break;
        pathStack.pop();
        i += 1;
        continue;
      }
      if (ch === '[') { // arreglo o clave computada: opaco
        let j = i, d = 0;
        do { if (src[j] === '[') d += 1; else if (src[j] === ']') d -= 1; j += 1; } while (j < src.length && d > 0);
        token += src.slice(i, j);
        i = j;
        continue;
      }
      if (ch === '(') {
        let j = i, d = 0;
        do { if (src[j] === '(') d += 1; else if (src[j] === ')') d -= 1; j += 1; } while (j < src.length && d > 0);
        token += src.slice(i, j);
        i = j;
        continue;
      }
      if (ch === ':' && key === null) {
        key = token.trim().replace(/^['"`]|['"`]$/g, '');
        token = '';
        i += 1;
        continue;
      }
      if (ch === ',') {
        if (key !== null && token.trim()) leaves.add([rootName, ...pathStack, key].join('.'));
        key = null;
        token = '';
        i += 1;
        continue;
      }
      token += isIdent(ch) || ch === '.' || ch === '-' ? ch : ch;
      i += 1;
    }
  }
  return leaves;
}

export function sourceSkeletonParity(byTenantLeaves) {
  const [a, b, c] = TENANTS;
  const union = sorted(new Set(TENANTS.flatMap((t) => [...byTenantLeaves[t]])));
  const all = union.filter((p) => TENANTS.every((t) => byTenantLeaves[t].has(p)));
  const onlyIn = (t) => union.filter((p) => byTenantLeaves[t].has(p) && TENANTS.filter((x) => x !== t).every((x) => !byTenantLeaves[x].has(p)));
  return {
    unit: 'authored-decision-leaf-path',
    note: 'Unidad distinta de la del artefacto. NUNCA fusionar con `surface`.',
    authors: Object.fromEntries(TENANTS.map((t) => [t, byTenantLeaves[t].size])),
    union: union.length,
    intersection: all.length,
    intersectionPct: Number(((all.length / union.length) * 100).toFixed(1)),
    intersectionPctOfSmallest: Number(((all.length / Math.min(...TENANTS.map((t) => byTenantLeaves[t].size))) * 100).toFixed(1)),
    pairwise: pairwise(byTenantLeaves),
    exclusive: Object.fromEntries(TENANTS.map((t) => [t, onlyIn(t).length])),
    exclusiveSamples: Object.fromEntries(TENANTS.map((t) => [t, onlyIn(t).slice(0, 12)])),
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Ensamblado
 * ═══════════════════════════════════════════════════════════════════════════ */

export function build() {
  const artifactText = Object.fromEntries(TENANTS.map((t) => [t, read(artifactPath(t))]));
  const sourceText = Object.fromEntries(TENANTS.map((t) => [t, read(sourcePath(t))]));
  const byTenant = Object.fromEntries(TENANTS.map((t) => [t, declarationsOf(artifactText[t])]));

  const surface = surfaceParity(byTenant);
  // Built in memory, not read from disk. The coverage artifact is gitignored
  // and mirror-parity does not own it, so this bare read (the sibling read at
  // the tracked output below IS guarded) made a generator depend on an artifact
  // a clean checkout does not have -- and it threw an uncaught ENOENT there.
  const checklists = JSON.parse(serializeChecklists(buildChecklists(loadFacts(), loadCanon())));

  return {
    $generatedBy: 'scripts/generate/tokens/manifest/mirror-parity/index.mjs',
    $regenerate: 'node scripts/generate/tokens/manifest/mirror-parity/index.mjs',
    $warning: [
      'Los artefactos `facade/artifacts/<tenant>/index.css` son SNAPSHOTS GENERADOS por',
      '`build:vertical-css`, no fuente. Las secciones `surface`, `valueParity` y `cascade`',
      'miden el artefacto en la revision indicada en `provenance`, no las fuentes `.ts`.',
      'La cifra de fuente vive aparte en `sourceSkeleton` y es de OTRA unidad: no se fusiona.',
    ].join(' '),
    provenance: {
      artifacts: TENANTS.map((t) => provenanceOf(artifactPath(t))),
      sources: TENANTS.map((t) => provenanceOf(sourcePath(t))),
      mtimeExcluded: 'Se registra sha256 y no mtime: el mtime cambia con un clon o un touch y rompe --check sin que el contenido se mueva.',
    },
    occurrenceTrap: Object.fromEntries(
      TENANTS.map((t) => [t, { occurrences: occurrenceCount(artifactText[t]), distinctChannels: byTenant[t].size }]),
    ),
    surface,
    valueParity: valueParity(byTenant, surface.venn['all-three']),
    cascadePresence: cascadePresence(checklists, byTenant),
    cascadeSeverance: cascadeSeverance(checklists, byTenant, readFloorCorpus()),
    multiDeclaration: multiDeclaration(byTenant),
    sourceSkeleton: sourceSkeletonParity(
      Object.fromEntries(TENANTS.map((t) => [t, authoredLeafPaths(sourceText[t], t)])),
    ),
  };
}

export const serialize = (doc) => `${JSON.stringify(doc, null, 2)}\n`;

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  const text = serialize(build());
  if (process.argv.includes('--check')) {
    let current = null;
    try { current = readFileSync(OUTPUT_PATH, 'utf8'); } catch { /* no existe */ }
    if (current !== text) {
      console.error('✗ mirror-parity: generated/mirror-parity/index.json desactualizado — corre `node scripts/generate/tokens/manifest/mirror-parity/index.mjs`');
      process.exit(1);
    }
    console.log('✓ mirror-parity: generated/mirror-parity/index.json al dia');
  } else {
    writeFileSync(OUTPUT_PATH, text);
    console.log(`✓ mirror-parity: ${path.relative(PACKAGE_ROOT, OUTPUT_PATH)} escrito`);
  }
}
