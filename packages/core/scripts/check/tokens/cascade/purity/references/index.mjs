#!/usr/bin/env node
/**
 * purity — puede esta fila colapsar sin mover un valor resuelto?
 *
 * POR QUE EXISTE. El scouting de la cohorte 2 midio que de 850 filas R2 de
 * color/superficie solo una parte se puede colapsar sin cambiar lo que el
 * usuario ve, y esas cifras se citaron sin productor. Esta es la clase D1 del
 * programa apareciendo por tercera vez, y el remedio es siempre el mismo: la
 * cifra la emite un artefacto re-corrible o no se cita.
 *
 * LAS TRES CLASES, y la tercera es una LEY, no una categoria mas:
 *
 *   `pure`      la cabeza de la raiz ya emite EXACTAMENTE ese valor en ese
 *               tema y ese modo. Reemplazar el literal por `var(cabeza)` no
 *               mueve nada resuelto. Es la unica clase colapsable.
 *
 *   `value-shift` la cabeza emite OTRO valor. Colapsar aplastaria la decision
 *               de la hoja contra la de la raiz: no es un colapso, es un cambio
 *               de diseno disfrazado.
 *
 *   `head-not-emitted`  **STOP.** La cabeza de la raiz no se emite en ese modo.
 *               Un `var()` hacia ella no resolveria a nada y caeria al fallback
 *               -- o a la nada. Medido en el scouting: 230 filas apuntan a seis
 *               cabezas que ningun tema emite (`--ds-surface-control`,
 *               `--ds-material-raised-foreground`, `--ds-surface-card`,
 *               `--ds-material-overlay-background`,
 *               `--ds-material-overlay-foreground`, `--ds-focus-ring`), y
 *               coinciden con los `channelStatus` `por-crear` / `solo-artefacto`
 *               del catalogo. Esta clase protege a las raices del eje paso, que
 *               van a nacer en su mayoria con la cabeza sin emitir.
 *
 * UN SOLO LOWERING. Compila con `compileTheme` de `dist/` bajo prueba de
 * frescura, igual que `slot-inventory` y `root-membership`. Un segundo emisor
 * seria STOP del programa.
 *
 * ESTE MODULO ADEMAS ES LIBRERIA. `resolved-map-diff` importa de aca `loadArm` y
 * `scopesOf` (`resolved-map-diff/index.mjs:69`) en vez de abrir un segundo brazo
 * de compilacion -- que es precisamente lo que el parrafo de arriba prohibe.
 * Consecuencia practica: cambiar la firma o la semantica de esos dos exports
 * mueve el instrumento del cero-delta resuelto, no solo el censo de pureza.
 *
 * LA COMPARACION DE VALORES AQUI ES LEGITIMA Y ESTA ACOTADA. No decide
 * pertenencia -- la raiz de cada fila viene de la membresia, que se construyo
 * sin mirar un solo valor. Decide si el colapso hacia esa raiz ya adjudicada
 * seria inocuo. Es verificacion post-hoc, jamas ruteo.
 *
 * CLI: `--check` (defecto, fail-closed) | `--write`.
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { packageRoot as findPackageRoot } from '../../../../../libraries/repo-root/index.mjs';
import { assertDistFresh } from '../../../../../package/artifacts/freshness/index.mjs';
import { loadBrandThemeLowering } from '../../../../../libraries/theme-lowering/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const CORE_ROOT = findPackageRoot(HERE);
export const OUT_PATH = join(CORE_ROOT, 'artifacts/generated/manifest/cascade/purity/index.json');

export const CLASSES = Object.freeze(['pure', 'value-shift', 'head-not-emitted', 'no-root']);

/**
 * LA COMPARACION ES STRING-EXACTA. El `trim` SE QUEDA -- es whitespace de
 * bordes, que ningun navegador distingue; el `toLowerCase` SE FUE.
 *
 * POR QUE, con la historia completa. Bajar el caso sobre-declaraba `pure`:
 * decia que `#53697E` autorado y `#53697e` emitido por la cabeza son el mismo
 * valor, y para el colapso NO lo son -- el `--against` del cero-delta resuelto
 * es caso-exacto y los frena. La clase cobro dos veces en produccion: en el
 * sub-lote 1 de 2B se nombro la deuda ("purity normaliza caso y sobre-declara
 * pure; remedio durable: alinear a string-exacto con drill"), la 2B plena la
 * reafirmo, y en PALETA P1 se volvio ley del eje ("lo que depende del caso no
 * colapsa ni se retira") tras cazar `bithire:PALETTE.linkColor`.
 *
 * POBLACION MEDIDA Y ADJUDICADA (2026-08-28): 43 filas dejan de ser `pure`
 * (200 -> 157), TODAS hex-case y todas de bithire -- el unico tema que mezcla
 * las dos convenciones en volumen (277 cabezas hex mayuscula contra 65
 * minuscula; rottay 462/5 y evnto 75/28 autoran parejo y no tienen con que
 * chocar). Es RECLASIFICACION del instrumento, no regresion: las 43 ya eran
 * incolapsables, solo que el censo no lo mostraba.
 *
 * NO CONFUNDIR CON LA CAPA DE EMISION. `bithire:PALETTE.borderFocusColor` NO
 * esta entre las 43 y no debe estarlo: su cabeza `--ds-color-border-focus`
 * emite `#3a6fb0` minuscula, byte-identica a lo autorado. Su caso-hex vive en
 * la capa de emision (la sonda de ausencia de P1), no aca. Dos capas, dos
 * veredictos, los dos correctos.
 */
export const normalise = (value) => String(value).trim();

/** Modo del slot: la superposicion se autora bajo `OVERLAY.`. */
export const modeOfSlot = (slotPath) => (String(slotPath).startsWith('OVERLAY.') ? 'overlay' : 'base');

/**
 * Aplana un tema compilado a `{ base, <mode> }`, donde cada modo YA lleva la
 * base por debajo: una superposicion que no re-declara un canal lo hereda, y
 * comparar contra el modo pelado daria `head-not-emitted` falsos.
 */
export function scopesOf(compiled) {
  const base = { ...(compiled.cssVariables ?? {}) };
  const scopes = { base };
  for (const block of compiled.modeBlocks ?? []) {
    scopes[block.mode] = { ...base, ...(block.variables ?? block.cssVariables ?? {}) };
  }
  return scopes;
}

export function classify({ row, headChannel, scope }) {
  if (!row.rootId) return { klass: 'no-root', headValue: null };
  if (!headChannel) return { klass: 'no-root', headValue: null };
  const headValue = scope?.[headChannel];
  if (headValue === undefined) return { klass: 'head-not-emitted', headValue: null };
  if (normalise(headValue) === normalise(row.authoredValue)) return { klass: 'pure', headValue };
  return { klass: 'value-shift', headValue };
}

/** El delta de bytes que el reemplazo costaria en la fuente TS. */
export const replacementDelta = (authoredValue, headChannel) =>
  JSON.stringify(`var(${headChannel})`).length - JSON.stringify(authoredValue).length;

export async function loadArm({ coreRoot = CORE_ROOT, importModule = (spec) => import(spec) } = {}) {
  const freshness = assertDistFresh({ packageRoot: coreRoot, stampPath: join(coreRoot, 'dist/build-stamp.json') });
  if (!freshness?.ok) {
    throw new Error(`purity: dist/ esta rancio o su frescura no esta probada:\n  ${(freshness?.failures ?? ['sin prueba']).join('\n  ')}`);
  }
  const themes = await importModule(pathToFileURL(join(coreRoot, 'dist/foundation/tokens/ts/presentation/brand-themes/index.js')).href);
  const { compile } = await loadBrandThemeLowering({ coreRoot, importModule });
  return {
    compile,
    themes: { rottay: themes.rottayBrandTheme, bithire: themes.bithireBrandTheme, evnto: themes.evntoBrandTheme },
  };
}

export async function buildPurity({ coreRoot = CORE_ROOT, arm = null, inventory = null, catalog = null } = {}) {
  const loaded = arm ?? (await loadArm({ coreRoot }));
  const rows = (inventory ?? JSON.parse(readFileSync(join(coreRoot, 'artifacts/generated/manifest/cascade/slots/index.json'), 'utf8'))).rows;
  const cat = catalog ?? JSON.parse(readFileSync(join(coreRoot, 'governance/manifest/cascade/catalog/index.json'), 'utf8'));
  const headOf = new Map((cat.roots ?? []).filter((root) => root.channel).map((root) => [root.rootId, root.channel]));

  const scopes = {};
  for (const [vertical, theme] of Object.entries(loaded.themes)) {
    scopes[vertical] = scopesOf(loaded.compile({ brandTheme: theme, tenantSlug: vertical }));
  }
  const overlayNameOf = (vertical) => Object.keys(scopes[vertical]).find((name) => name !== 'base') ?? 'base';

  const out = [];
  for (const row of rows) {
    if (!row.rootId) continue;
    const headChannel = headOf.get(row.rootId) ?? null;
    const scopeName = modeOfSlot(row.slotPath) === 'overlay' ? overlayNameOf(row.vertical) : 'base';
    const verdict = classify({ row, headChannel, scope: scopes[row.vertical][scopeName] });
    out.push({
      slotId: row.slotId,
      vertical: row.vertical,
      rootId: row.rootId,
      rule: row.rule,
      scope: scopeName,
      headChannel,
      headEmitted: verdict.klass !== 'head-not-emitted',
      class: verdict.klass,
      replacementDeltaBytes: headChannel ? replacementDelta(row.authoredValue, headChannel) : null,
    });
  }
  out.sort((a, b) => (a.slotId < b.slotId ? -1 : a.slotId > b.slotId ? 1 : 0));

  const tally = (list, pick) => list.reduce((acc, item) => {
    const key = String(pick(item)); acc[key] = (acc[key] ?? 0) + 1; return acc;
  }, {});
  const pure = out.filter((item) => item.class === 'pure');
  const headless = out.filter((item) => item.class === 'head-not-emitted');

  return {
    generated: true,
    generator: 'scripts/check/tokens/cascade/purity/references/index.mjs',
    schemaVersion: 1,
    law: {
      unit: 'una fila del inventario CON raiz atribuida',
      classes: CLASSES,
      stopLaw: 'head-not-emitted es STOP, no una categoria mas: un var() hacia una cabeza que nadie emite no resuelve.',
      scopeLaw: 'cada modo se compara con la base por debajo; comparar contra la superposicion pelada produce head-not-emitted falsos.',
      valueLaw: 'la comparacion de valores NO decide pertenencia -- la raiz viene de la membresia, construida sin mirar valores. Decide si el colapso hacia esa raiz seria inocuo: verificacion post-hoc, jamas ruteo.',
    },
    stats: {
      rows: out.length,
      byClass: tally(out, (item) => item.class),
      byVertical: tally(out, (item) => item.vertical),
      pureByRoot: tally(pure, (item) => item.rootId),
      headlessByChannel: tally(headless, (item) => item.headChannel),
      collapsibleReplacementBytes: pure.reduce((sum, item) => sum + (item.replacementDeltaBytes ?? 0), 0),
      collapsibleBytesByVertical: pure.reduce((acc, item) => {
        acc[item.vertical] = (acc[item.vertical] ?? 0) + (item.replacementDeltaBytes ?? 0); return acc;
      }, {}),
      pureByRule: tally(pure, (item) => item.rule),
    },
    rows: out,
  };
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
  if (flags.length > 1 || !['--check', '--write'].includes(mode)) {
    console.error('uso: node scripts/check/tokens/cascade/purity/references/index.mjs [--check|--write]');
    process.exit(2);
  }
  const doc = withDigest(await buildPurity());
  const text = serialize(doc);
  if (mode === '--write') {
    mkdirSync(dirname(OUT_PATH), { recursive: true });
    writeFileSync(OUT_PATH, text);
    console.log(`purity: escrito — ${doc.stats.rows} filas, ${JSON.stringify(doc.stats.byClass)}, digest ${doc.digest.slice(0, 12)}`);
    return;
  }
  let current = null;
  try { current = readFileSync(OUT_PATH, 'utf8'); } catch { current = null; }
  if (current === null) { console.error(`purity: FAIL — ${OUT_PATH} no existe. Corre --write.`); process.exit(1); }
  if (current !== text) { console.error('purity: FAIL — el censo no coincide con el arbol. Corre --write y revisa el diff.'); process.exit(1); }
  console.log(`purity: OK — ${doc.stats.rows} filas, ${JSON.stringify(doc.stats.byClass)}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv).catch((error) => { console.error(`purity: ${error?.message ?? error}`); process.exit(1); });
}
