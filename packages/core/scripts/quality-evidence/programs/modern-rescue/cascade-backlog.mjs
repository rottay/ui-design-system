#!/usr/bin/env node
/**
 * cascade-backlog.mjs — WO-CRA-23 cascade, generated half (phase-3 backlog).
 *
 * The owner's checklist: which variable must exist, in which primitives, and
 * what it costs to put it there. Per adjudication, the backlog IS the diff
 * between the generated reach and the authored prescription — and it is
 * GENERATED, never hand-maintained.
 *
 * HOMONYM LAW (correction by the adjudicator, verified): the naive diff by
 * literal channelId compares two vocabularies head-on (prescription is 100%
 * --_ds-* sockets; generated reach is mostly --ds-* channels) and produces
 * total misalignment that means nothing. The correct rule is by stem:
 *     stem(channelId) = channelId without the --ds- / --_ds- prefix.
 * A prescribed socket --_ds-X is:
 *     CLASS A: the dial already reaches the homonym --ds-X. Only the socket
 *              is missing at the skin read site:
 *              var(--_ds-X, var(--ds-X, <literal>)). Mechanical, one line.
 *     CLASS B: the dial does not reach even the homonym. The socket AND the
 *              channel wiring to the root are both missing. Design work.
 *
 * PLANE LAW (declared, not hidden): the transitive reach comes from the CSS
 * plane ONLY. The plane vocabulary is closed and has THREE names, the same
 * three cascade-extract publishes: `css` (scanned) and the two unscanned TS
 * planes `ts-compilers` (explicit `vars["--ds-X"]` writes in a compiler body)
 * and `ts-chrome-variables` (the mapping table whose VALUES are the channel
 * names, most of them computed and therefore invisible to any literal grep).
 * A CLASS B can in truth be class A through either unscanned TS plane — the
 * artefact says so on every file.
 *
 * The producer criterion is FUNCTIONAL, not postal: a file counts when the
 * running compilation emits the channel through it. `chrome-variables` is
 * imported by both compilers, so it produces and therefore counts; that it
 * sits outside a compiler folder is phase-3 placement debt, never a discount.
 * `radius-dial` is a ROOT of `ts-compilers`, not a fourth plane.
 *
 * Inputs:
 *   - manifest/cascade/roots/<id>.json            (authored: terminalReach)
 *   - manifest/cascade/extracted/css-edges.json   (GENERATED, cascade-extract)
 *
 * Output: manifest/cascade/backlog/<controlId>.json + backlog/index.json
 * (generated: true). Never hand-edit; regenerate.
 *
 * Usage: node cascade-backlog.mjs [controlId ...]  (default: all roots present)
 */
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOTS = join(HERE, "manifest/cascade/roots");
const EDGES_FILE = join(HERE, "manifest/cascade/extracted/css-edges.json");
const OUT_DIR = join(HERE, "manifest/cascade/backlog");

const HOMONYM_LAW =
  "stem = channelId sin el prefijo --ds-/--_ds-. El diff literal por channelId compara dos vocabularios distintos de frente (prescripcion 100% --_ds-*, alcance generado mayoria --ds-*) y da desalineacion total que no significa nada; la regla correcta es por homonimo.";
const PLANE_VOCABULARY = ["css", "ts-compilers", "ts-chrome-variables"];
const PLANE_LAW =
  'El alcance transitivo sale del plano CSS unicamente. El vocabulario de planos es CERRADO y tiene TRES nombres (planeVocabulary: css, ts-compilers, ts-chrome-variables); planesNotScanned: ts-compilers, ts-chrome-variables. Una CLASE B puede ser en realidad CLASE A por cualquiera de los dos planos TS no escaneados; se declara, no se calla. CRITERIO FUNCIONAL, no postal: un archivo cuenta como productor cuando la compilacion en ejecucion emite el canal a traves de el. ts-compilers = escrituras explicitas vars["--ds-X"] en el cuerpo del compilador (108 ocurrencias, 97 canales distintos en brand-theme 92 / appearance 6 / appearance-posture 10, mas 46 sitios de escritura templada; censo por ENUMERACION de fuente: 552 canales distintos = 183 literales + 378 interpolados). ts-chrome-variables = la tabla de mapeo de chrome-variables/index.ts, cuyos VALORES son los nombres de canal (censo por grep 1477: 477 como valor de tabla -- 352 derivados por 28 llamadas chromeVariableMap mas 125 literales -- y 1000 como clave de escritura directa; censo por ENUMERACION 1671 = 1154 literales + 546 interpolados, que es el que se usa para cobertura). Solape entre los dos planos TS: 8 canales, no 1 -- el 1 salia de comparar censos por grep. Union de semillas TS: 2215. Entra POR NOMBRE PROPIO y no diluido dentro de ts-compilers porque son figuras distintas y mezclarlas hace la cifra agregada no auditable por partes. Que chrome-variables viva fuera de las carpetas del compilador es DEUDA DE FASE 3 de ubicacion, no razon para descontarlo. radius-dial no es un plano: es una raiz de ts-compilers. COBERTURA (denominador 4547 canales leidos en el arbol de skin del motor modern, sembrando las 18 raices del manifiesto, variante generosa): solo-css 1490 = 32,8%; +ts-compilers 2438 = 53,6%; +ts-chrome-variables 2344 = 51,6%; UNION 2894 = 63,6%. Variante estricta: 25,9 / 47,4 / 47,7 / 60,8%. 1653 canales de U no tienen productor en NINGUN plano. Cifras y metodo completos en cascade-extract.mjs -> stats.coverage; son COTA INFERIOR por 3 emisiones interpoladas sin enumerador.';
const CLASS_LAW = {
  A: "el dial YA alcanza el homonimo --ds-X; falta solo abrir el socket en el sitio de lectura del skin: var(--_ds-X, var(--ds-X, literal)). Trabajo mecanico, una linea por sitio.",
  B: "el dial NO alcanza ni el homonimo; hacen falta el socket Y cablear el canal a la raiz. Trabajo de diseno.",
};

const stem = (ch) =>
  ch.startsWith("--_ds-")
    ? ch.slice(6)
    : ch.startsWith("--ds-")
      ? ch.slice(5)
      : ch.replace(/^--/, "");

const extracted = JSON.parse(readFileSync(EDGES_FILE, "utf8"));
/* leaf reads by channel: regular-property sites (border-radius: var(--ds-x))
   where a class-A socket gets opened. */
const leafReadsByChannel = new Map();
for (const r of extracted.leafReads ?? []) {
  for (const ch of r.channels) {
    if (!leafReadsByChannel.has(ch)) leafReadsByChannel.set(ch, []);
    leafReadsByChannel.get(ch).push(r);
  }
}
/* full adjacency, both top-level and fallback jumps: a fallback chain is
   reach too (var(--ds-x, var(--ds-y)) puts y under the dial when x unsets). */
const adj = new Map();
for (const e of extracted.edges) {
  if (!adj.has(e.from)) adj.set(e.from, []);
  adj.get(e.from).push(e);
}

function reachableFrom(seed) {
  const seen = new Set();
  const queue = [seed];
  while (queue.length) {
    const c = queue.pop();
    for (const e of adj.get(c) ?? []) {
      if (!seen.has(e.to)) {
        seen.add(e.to);
        queue.push(e.to);
      }
    }
  }
  return seen;
}

const controlIds = process.argv.slice(2).length
  ? process.argv.slice(2)
  : readdirSync(ROOTS)
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.slice(0, -5))
      .sort();

const rollup = [];
mkdirSync(OUT_DIR, { recursive: true });

for (const controlId of controlIds) {
  const root = JSON.parse(readFileSync(join(ROOTS, `${controlId}.json`), "utf8"));
  const rootChannel = root.rootChannel?.channel ?? null;
  const prescribed = root.terminalReach ?? [];

  if (!rootChannel) {
    const out = {
      generated: true,
      generator: "cascade-backlog.mjs",
      schemaVersion: 1,
      controlId,
      tier: root.tier,
      notComputable:
        "rootChannel null: landing fuera del plano css (runtimeLanding). Enmienda de rules.mjs pedida al adjudicador; el backlog se genera cuando el root exista.",
      homonymLaw: HOMONYM_LAW,
      planeVocabulary: PLANE_VOCABULARY,
      planeLaw: PLANE_LAW,
    };
    writeFileSync(join(OUT_DIR, `${controlId}.json`), JSON.stringify(out, null, 2) + "\n");
    rollup.push({ controlId, tier: root.tier, notComputable: true });
    console.log(`${controlId}: NOT_COMPUTABLE (rootChannel null)`);
    continue;
  }

  const reach = reachableFrom(rootChannel);
  // Roots whose first hop is attribute selection (chrome.anatomy) declare it
  // as LIVE derivations: the extracted graph keys those edges by the var()
  // they read, not by the attribute, so the BFS from rootChannel alone sees
  // nothing. Seed the reach with every LIVE derivation target — EXCEPT
  // literal-pin (declared OUTSIDE the dial by R8) and toIsPattern (a map-level
  // fold pattern, not a literal channel).
  for (const d of root.derivations ?? []) {
    if (d.state !== "LIVE") continue;
    if (d.rule?.kind === "literal-pin") continue;
    if (d.toIsPattern) continue;
    if (!d.to || reach.has(d.to)) continue;
    for (const ch of reachableFrom(d.to)) reach.add(ch);
    reach.add(d.to);
  }
  const reachByStem = new Map();
  for (const ch of reach) {
    const s = stem(ch);
    if (!reachByStem.has(s)) reachByStem.set(s, []);
    reachByStem.get(s).push(ch);
  }

  const families = new Map();
  let classA = 0;
  let classB = 0;
  for (const t of prescribed) {
    const s = stem(t.channelId);
    const homonyms = reachByStem.get(s) ?? [];
    const cls = homonyms.length ? "A" : "B";
    if (cls === "A") classA++;
    else classB++;
    const readers = [];
    if (homonyms.length) {
      const seen = new Set();
      for (const h of homonyms) {
        // skin read sites first (leaf declarations: where the socket opens)
        for (const r of leafReadsByChannel.get(h) ?? []) {
          const key = `${r.file}:${r.line}:${r.property}`;
          if (seen.has(key)) continue;
          seen.add(key);
          readers.push({
            file: r.file,
            line: r.line,
            via: r.property,
            kind: "leaf-read",
          });
        }
        // then channel-to-channel readers (the channel feeds other channels)
        for (const e of adj.get(h) ?? []) {
          const key = `${e.file}:${e.line}`;
          if (seen.has(key)) continue;
          seen.add(key);
          readers.push({
            file: e.file,
            line: e.line,
            via: e.to,
            kind: "channel-reader",
          });
        }
      }
      readers.sort(
        (a, b) => a.file.localeCompare(b.file) || a.line - b.line
      );
    }
    const entry = {
      socket: t.channelId,
      state: t.state ?? null,
      stem: s,
      class: cls,
      homonym: homonyms[0] ?? null,
      ...(homonyms.length > 1 ? { homonymAliases: homonyms.slice(1) } : {}),
      ...(readers.length ? { homonymReaders: readers } : {}),
    };
    if (!families.has(t.familyId)) families.set(t.familyId, []);
    families.get(t.familyId).push(entry);
  }

  const out = {
    generated: true,
    generator: "cascade-backlog.mjs",
    schemaVersion: 1,
    controlId,
    tier: root.tier,
    rootChannel,
    homonymLaw: HOMONYM_LAW,
    planeVocabulary: PLANE_VOCABULARY,
    planeLaw: PLANE_LAW,
    classLaw: CLASS_LAW,
    seedLaw:
      "alcance = BFS desde rootChannel MAS los 'to' de las derivations LIVE del root autorado (primer salto por seleccion de atributo, p.ej. chrome.anatomy: el grafo extraido clavea esas aristas por la var() leida, no por el atributo). Se excluyen literal-pin (fuera del dial, R8) y toIsPattern (pliegue a nivel de mapa, no canal literal).",
    inputs: {
      prescription: `manifest/cascade/roots/${controlId}.json (terminalReach, autorado)`,
      reach: "manifest/cascade/extracted/css-edges.json (cascade-extract.mjs, plano CSS)",
    },
    reach: {
      channels: [...reach].filter((c) => c.startsWith("--ds-")).length,
      sockets: [...reach].filter((c) => c.startsWith("--_ds-")).length,
      bare: [...reach].filter((c) => !c.startsWith("--ds-") && !c.startsWith("--_ds-")).length,
    },
    totals: { prescribed: prescribed.length, classA, classB },
    families: [...families.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([familyId, sockets]) => ({ familyId, sockets })),
  };
  writeFileSync(join(OUT_DIR, `${controlId}.json`), JSON.stringify(out, null, 2) + "\n");
  rollup.push({
    controlId,
    tier: root.tier,
    rootChannel,
    prescribed: prescribed.length,
    classA,
    classB,
  });
  console.log(
    `${controlId}: prescritos ${prescribed.length} -> A ${classA} / B ${classB} (alcance: ${out.reach.channels} --ds-, ${out.reach.sockets} --_ds-, ${out.reach.bare} sin prefijo)`
  );
}

const index = {
  generated: true,
  generator: "cascade-backlog.mjs",
  schemaVersion: 1,
  homonymLaw: HOMONYM_LAW,
  planeVocabulary: PLANE_VOCABULARY,
  planeLaw: PLANE_LAW,
  classLaw: CLASS_LAW,
  totals: {
    controls: rollup.length,
    prescribed: rollup.reduce((n, r) => n + (r.prescribed ?? 0), 0),
    classA: rollup.reduce((n, r) => n + (r.classA ?? 0), 0),
    classB: rollup.reduce((n, r) => n + (r.classB ?? 0), 0),
    notComputable: rollup.filter((r) => r.notComputable).length,
  },
  controls: rollup,
};
writeFileSync(join(OUT_DIR, "index.json"), JSON.stringify(index, null, 2) + "\n");
console.log(
  `rollup: ${index.totals.prescribed} prescritos -> A ${index.totals.classA} / B ${index.totals.classB} en ${index.totals.controls} controles (${index.totals.notComputable} no computables) -> ${join(OUT_DIR, "index.json")}`
);
/* ================= PRODUCERS DRAFT v2 (encargo C, backlog REAL) =================
 * Correccion del adjudicador aplicada: el universo NO se recalcula — se lee
 * de /private/tmp/_backlog_real.txt (1021 huerfanos que caen a LITERAL sin
 * raiz viva en la cadena) y /private/tmp/_ya_canonico.txt (835 con nivel-2
 * vivo en el fallback = forma canonica de tres niveles, CERO trabajo).
 * Los 835 son CONTROL NEGATIVO: salen con confidence "n/a" y
 * skip "already-canonical"; si este generador propone productor para alguno,
 * el generador esta mal.
 * Clasificacion: primero vocabulario del stem; los compuestos sin sufijo
 * reconocible se clasifican por la PROPIEDAD CSS del readSite (ley de
 * detectores), nunca al reves.
 * families/** es ENTRADA INTOCABLE (condicion Fable): este script solo LEE.
 */
const BACKLOG_FILE = "/private/tmp/_backlog_real.txt";
const CANONICAL_FILE = "/private/tmp/_ya_canonico.txt";
const readList = (p) =>
  readFileSync(p, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("--"));
const backlogReal = readList(BACKLOG_FILE);
const yaCanonico = readList(CANONICAL_FILE);
const canonicoSet = new Set(yaCanonico);
const overlapLists = backlogReal.filter((c) => canonicoSet.has(c));

/* readSites por canal: lecturas hoja (con propiedad) + refs en declaraciones
   de canal dentro de los dos arboles de skin */
const SKIN_TREES = [
  "packages/core/src/foundation/tokens/css/runtime/engines/modern/skin/",
  "packages/core/src/foundation/tokens/css/presentation/components/skin/",
];
const inSkin = (f) => SKIN_TREES.some((t) => f.startsWith(t));
const skinRead = new Map(); // channel -> [{file,line,property}]
for (const r of extracted.leafReads ?? []) {
  if (!inSkin(r.file)) continue;
  for (const ch of r.channels) {
    if (!skinRead.has(ch)) skinRead.set(ch, []);
    skinRead.get(ch).push({ file: r.file, line: r.line, property: r.property });
  }
}
for (const e of extracted.edges) {
  if (!inSkin(e.file)) continue;
  if (!skinRead.has(e.from)) skinRead.set(e.from, []);
  skinRead.get(e.from).push({ file: e.file, line: e.line, property: `(declara ${e.to})` });
}

/* familyId por archivo de skin (anatomy.sourceBindings; SOLO LECTURA) */
const familyByFile = new Map();
{
  const { readdirSync } = await import("node:fs");
  const walk = (dir, out = []) => {
    for (const en of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, en.name);
      if (en.isDirectory()) walk(p, out);
      else if (en.isFile() && en.name.endsWith(".json")) out.push(p);
    }
    return out;
  };
  for (const f of walk(join(HERE, "manifest/families"))) {
    try {
      const d = JSON.parse(readFileSync(f, "utf8"));
      for (const b of d.anatomy?.sourceBindings ?? []) {
        if (typeof b === "string" && b.endsWith(".css") && !familyByFile.has(b))
          familyByFile.set(b, d.familyId);
      }
    } catch { /* familia con json roto la acusa el gate, no este script */ }
  }
}

/* fallback completo (parentesis balanceados) del canal en un sitio */
import { existsSync as existsSyncFs } from "node:fs";
const REPO_ROOT = join(HERE, "../../../../../..");
const literalAt = (site, channel) => {
  const abs = join(REPO_ROOT, site.file);
  if (!existsSyncFs(abs)) return null;
  const lines = readFileSync(abs, "utf8").split("\n");
  const window = lines.slice(Math.max(0, site.line - 1), site.line + 5).join("\n");
  let from = 0;
  for (;;) {
    const hit = window.indexOf("var(", from);
    if (hit === -1) return null;
    let j = hit + 4;
    let depth = 1;
    while (j < window.length && depth > 0) {
      if (window[j] === "(") depth++;
      else if (window[j] === ")") depth--;
      j++;
    }
    if (depth !== 0) return null;
    const inner = window.slice(hit + 4, j - 1);
    from = j;
    let d = 0;
    let comma = -1;
    for (let k = 0; k < inner.length; k++) {
      if (inner[k] === "(") d++;
      else if (inner[k] === ")") d--;
      else if (inner[k] === "," && d === 0) { comma = k; break; }
    }
    const name = (comma === -1 ? inner : inner.slice(0, comma)).trim();
    if (name !== channel) continue;
    if (comma === -1) return null;
    const text = inner.slice(comma + 1).trim();
    const isLiteral = /^-?(?:\d+\.?\d*|\.\d+)(px|rem|em|%|ms|s)$/.test(text);
    return { text, isLiteral };
  }
};

const RAMP_BASE = { "6px": "--ds-radius-sm", "8px": "--ds-radius-md", "12px": "--ds-radius-lg", "16px": "--ds-radius-xl" };
const CONTROL_MARKER = /option|item|cell|field|trigger|control|chip|input|button|option|tab|row/;

/* reglas por STEM (fuertes) */
const STEM_RULES = [
  { re: /radius/, root: "shape.radius-scale", dial: "--ds-radius-scale", prop: /radius/, domain: "radius" },
  { re: /font-size/, root: "typography.scale", dial: "--ds-type-scale", prop: /font-size/, domain: "type-size" },
  { re: /duration|transition/, root: "motion.dial", dial: "--ds-motion-duration-scale", prop: /duration|transition/, domain: "motion-time" },
  // ortogonalidad rhythm/density (tenant-theme:529-543): lo INTERNO de un
  // control es densidad; las RELACIONES de layout son rhythm.
  { re: /(option|item|cell|field|trigger|control|chip|input|button|tab|row).*(gap|padding|inset|size|height|basis)/, root: "density.mode", dial: "--ds-density-effective-scale", prop: /gap|padding|inset|margin|height|size|width|basis/, domain: "control-space", maxConfidence: "medium" },
  { re: /gap|padding|inset(?!-double)|spacing|margin/, root: "spacing.rhythm", dial: "--ds-rhythm-scale", prop: /gap|padding|inset|margin|top|left|right|bottom/, domain: "layout-space" },
  { re: /font-family/, root: "typography.families", alias: "--ds-font-family-base", prop: /font-family/, domain: "type-family" },
  { re: /text-transform/, root: "profiles.expressive", alias: "--ds-type-label-text-transform", prop: /text-transform/, domain: "type-transform" },
  { re: /shadow|elevation/, root: "surfaces.elevation-posture", alias: "--ds-elevation-2", prop: /shadow/, domain: "elevation", maxConfidence: "medium" },
  { re: /primary/, root: "palette.seeds", alias: "--ds-color-primary", prop: /color|background|border|fill/, domain: "color", maxConfidence: "medium" },
  { re: /error|danger/, root: "palette.seeds", alias: "--ds-color-error", prop: /color|background|border|fill/, domain: "color", maxConfidence: "medium" },
  { re: /success/, root: "palette.seeds", alias: "--ds-color-success", prop: /color|background|border|fill/, domain: "color", maxConfidence: "medium" },
  { re: /warning/, root: "palette.seeds", alias: "--ds-color-warning", prop: /color|background|border|fill/, domain: "color", maxConfidence: "medium" },
  { re: /info/, root: "palette.seeds", alias: "--ds-color-info", prop: /color|background|border|fill/, domain: "color", maxConfidence: "medium" },
];

/* reglas por PROPIEDAD del readSite (para los 391 compuestos y lo que el stem
   no resuelve). Se evaluan SOLO si ninguna regla de stem aplico. */
const PROP_RULES = [
  { re: /^border-radius$/, root: "shape.radius-scale", dial: "--ds-radius-scale", domain: "radius" },
  { re: /^font-size$/, root: "typography.scale", dial: "--ds-type-scale", domain: "type-size" },
  { re: /duration|^transition$|^animation$/, root: "motion.dial", dial: "--ds-motion-duration-scale", domain: "motion-time" },
  { re: /^line-height$/, root: "typography.scale", dial: "--ds-type-scale", domain: "line-height", maxConfidence: "low" },
  { re: /^(gap|row-gap|column-gap|padding|padding-.+|margin|margin-.+|inset|inset-.+|top|left|right|bottom)$/, root: null, domain: "space-split" }, // se decide density vs rhythm por CONTROL_MARKER en el stem
  { re: /^(width|min-width|max-width|height|min-height|max-height|flex-basis|inline-size|block-size)$/, root: "density.mode", dial: "--ds-density-effective-scale", domain: "control-space", maxConfidence: "medium" },
  { re: /^box-shadow$/, root: "surfaces.elevation-posture", alias: "--ds-elevation-2", domain: "elevation", maxConfidence: "low" },
  { re: /^(filter|backdrop-filter)$/, root: "surfaces.effect-intensity", dial: "--ds-effect-intensity", domain: "effect", maxConfidence: "low" },
  { re: /^opacity$/, root: "surfaces.effect-intensity", dial: "--ds-effect-intensity", domain: "effect", maxConfidence: "low" },
  { re: /^(color|background|background-color|border-color|fill|stroke|outline-color|caret-color)$/, root: "palette.seeds", domain: "color-nombre-compuesto", maxConfidence: "low" },
];

/* literales legitimos / pisos no gobernados (lista del adjudicador + clases
   de exclusion del manifiesto). letter-spacing-heading es la EXCEPCION
   gobernada (typography.pairing emite --ds-letter-spacing-heading,
   appearance-posture:116-117) y NO cae aqui. */
const LEGIT_LITERAL = /content|cursor|appearance|animation-name|touch-target|scrollbar|safe-area|z-index|^z-|transform(?!.*text)|tracking|letter-spacing(?!.*heading)/;

const rank = { high: 0, medium: 1, low: 2 };
const rows = [];
const unmatched = [];
const excluded = [];

for (const ch of backlogReal) {
  const sites = skinRead.get(ch) ?? [];
  const s = stem(ch);
  if (LEGIT_LITERAL.test(s)) {
    excluded.push({ channel: ch, reason: "literal legitimo o piso no gobernado (adjudicador: transform/letter-spacing/tracking/z-index; manifiesto: content/cursor/touch-target/scrollbar/safe-area)", readSites: sites });
    continue;
  }
  let rule = STEM_RULES.find((r) => r.re.test(s));
  let via = "stem";
  if (!rule && sites.length) {
    const prop = sites.find((x) => !x.property.startsWith("("))?.property ?? sites[0].property;
    rule = PROP_RULES.find((r) => r.re.test(prop));
    via = rule ? `propiedad:${prop}` : null;
    if (rule?.domain === "space-split") {
      rule = CONTROL_MARKER.test(s)
        ? { root: "density.mode", dial: "--ds-density-effective-scale", domain: "control-space", maxConfidence: "medium" }
        : { root: "spacing.rhythm", dial: "--ds-rhythm-scale", domain: "layout-space", maxConfidence: "low" };
    }
    if (rule?.domain === "color-nombre-compuesto") {
      // color sin token semantico deducible: alias al brazo compartido mas
      // cercano es juicio de diseno -> cola de adjudicacion directa
      unmatched.push({ channel: ch, reason: `color sin semantico deducible (via ${via}); alias target es decision de diseno`, readSites: sites });
      continue;
    }
  }
  if (!rule) {
    unmatched.push({ channel: ch, reason: "ninguna raiz se deduce del stem ni de la propiedad del readSite; cola de adjudicacion", readSites: sites });
    continue;
  }
  const lit = sites.length ? literalAt(sites[0], ch) : null;
  const propMatch = sites.some((x) => rule.prop?.test(x.property));
  let formula = null;
  let confidence = "low";
  if (rule.dial && lit?.isLiteral) {
    if (rule.domain === "radius" && RAMP_BASE[lit.text]) {
      formula = `${ch}: var(${RAMP_BASE[lit.text]}, ${lit.text})`;
      confidence = propMatch || via.startsWith("propiedad") ? "high" : "medium";
    } else {
      formula = `${ch}: calc(${lit.text} * var(${rule.dial}, 1))`;
      confidence = propMatch || via.startsWith("propiedad") ? "high" : "medium";
    }
  } else if (rule.alias) {
    formula = lit ? `${ch}: var(${rule.alias}, ${lit.text})` : `${ch}: var(${rule.alias})`;
    confidence = propMatch && lit ? "medium" : "low";
  } else {
    unmatched.push({ channel: ch, reason: `raiz ${rule.root} deducida (via ${via}) pero sin literal de fallback ni alias seguro`, readSites: sites });
    continue;
  }
  if (rule.maxConfidence && rank[confidence] < rank[rule.maxConfidence])
    confidence = rule.maxConfidence;
  rows.push({
    channel: ch,
    familyId: sites.length ? familyByFile.get(sites[0].file) ?? null : null,
    rootId: rule.root,
    formula,
    readSites: sites,
    confidence,
    classifiedVia: via,
  });
}

/* control negativo: los 835 ya-canonicos NUNCA reciben productor */
const proposedForCanonical = rows.filter((r) => canonicoSet.has(r.channel));
const skippedCanonical = yaCanonico.map((ch) => ({
  channel: ch,
  familyId: (skinRead.get(ch)?.[0] && familyByFile.get(skinRead.get(ch)[0].file)) ?? null,
  rootId: null,
  formula: null,
  readSites: skinRead.get(ch) ?? [],
  confidence: "n/a",
  skip: "already-canonical",
}));

rows.sort((a, b) => rank[a.confidence] - rank[b.confidence] || a.channel.localeCompare(b.channel));

const draft = {
  generated: true,
  generator: "cascade-backlog.mjs (seccion producers v2)",
  schemaVersion: 1,
  sourceLists: { backlog: BACKLOG_FILE, alreadyCanonical: CANONICAL_FILE },
  orphanLaw:
    "backlog real = huerfano que CAE A LITERAL sin raiz viva en la cadena var() (parseo con anidamiento, no regex de una linea). Los 835 con nivel-2 vivo en el fallback son la forma canonica de tres niveles: el dial YA llega, cero trabajo.",
  formulaLaw:
    "resto exacto + dial vivo: calc(<literal actual> * var(--dial, 1)) (radius-dial/index.ts:55-62). PROHIBIDO calc(var(--ds-radius-md) * var(--ds-radius-scale)): doble escala (radius-dial/index.ts:29-34). Literal igual a base de rampa (6/8/12/16px) -> alias var(--ds-radius-*, lit).",
  predicateLaw:
    "primero el vocabulario del stem; los compuestos se clasifican por la PROPIEDAD CSS del readSite (ley de detectores). high = deduccion directa con literal; medium = juicio corroborado; low = cola de adjudicacion. Los colores de nombre compuesto sin semantico deducible van a unmatched: el alias target es decision de diseno, no se inventa.",
  planeVocabulary: PLANE_VOCABULARY,
  planeLaw: PLANE_LAW,
  negativeControl: {
    canonical: yaCanonico.length,
    proposedForCanonical: proposedForCanonical.length,
    verdict: proposedForCanonical.length === 0 ? "PASS" : "FAIL — el generador propuso productor para un canal ya canonico",
  },
  stats: {
    backlogReal: backlogReal.length,
    rows: rows.length,
    high: rows.filter((r) => r.confidence === "high").length,
    medium: rows.filter((r) => r.confidence === "medium").length,
    low: rows.filter((r) => r.confidence === "low").length,
    unmatched: unmatched.length,
    excludedLegitLiteral: excluded.length,
    skippedCanonical: skippedCanonical.length,
    listOverlap: overlapLists.length,
    classifiedByProperty: rows.filter((r) => r.classifiedVia.startsWith("propiedad")).length,
  },
  rows,
  unmatched,
  excluded,
  skippedCanonical,
};
writeFileSync(join(OUT_DIR, "producers.draft.json"), JSON.stringify(draft, null, 2) + "\n");
console.log(
  `producers v2: backlog real ${backlogReal.length} -> ${rows.length} filas (high ${draft.stats.high} / medium ${draft.stats.medium} / low ${draft.stats.low}; por propiedad ${draft.stats.classifiedByProperty}), ${unmatched.length} unmatched, ${excluded.length} excluidos, ${skippedCanonical.length} skip-canonical | control negativo: ${draft.negativeControl.verdict} | solape listas: ${overlapLists.length}`
);
