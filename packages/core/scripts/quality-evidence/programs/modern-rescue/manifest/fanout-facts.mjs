#!/usr/bin/env node
/**
 * fanout-facts.mjs — GENERADOR DE HECHOS del fan-out de canales CSS.
 *
 * Ley del programa: los hechos se generan, las decisiones se autoran.
 * Este script SOLO genera hechos. No decide, no adjudica, no arregla nada.
 *
 * Pregunta que responde, canal por canal (`--ds-*`):
 *   • quien lo DECLARA
 *   • quien lo LEE (`var(--ds-...)`), en que archivo/linea/declaracion
 *   • en que PLANO cae cada lectura (lista cerrada)
 *   • si esa lectura llega o no a pintura (`paints`, `paintsInModern`)
 *   • que escalares multiplican en la misma declaracion (`scalars`)
 *
 * Uso:
 *   node scripts/quality-evidence/programs/modern-rescue/manifest/fanout-facts.mjs
 *   node scripts/quality-evidence/programs/modern-rescue/manifest/fanout-facts.mjs --check
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { packageRoot as findPackageRoot } from '../../../../lib/repo-root/index.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const PACKAGE_ROOT = findPackageRoot(HERE);
export const OUTPUT_PATH = path.join(HERE, 'generated', 'fanout-facts.json');

/* ─────────────────────────────────────────────────────────────────────────
 * Vocabulario cerrado de planos. NO se inventan planos: un sitio que no cae
 * en ninguno de estos se emite en `unclassified`.
 * ───────────────────────────────────────────────────────────────────────── */

export const PLANES = [
  'modern-skin-css',
  'presentation-css',
  'foundation-css',
  'runtime-css',
  'facade-entrypoints-css',
  'classic-css',
  'rustic-css',
  'tsx-inline-stamp',
  'graphics-tsx',
  'infrastructure-tsx',
  'ts-token-mirror',
  'ts-token-utils',
  'ts-other',
];

/** Planos que efectivamente pintan. */
export const PAINT_PLANES = [
  'modern-skin-css',
  'presentation-css',
  'foundation-css',
  'runtime-css',
  'facade-entrypoints-css',
  'classic-css',
  'rustic-css',
  'tsx-inline-stamp',
  'graphics-tsx',
  'infrastructure-tsx',
  'ts-token-utils',
];

/**
 * Planos que pintan en modern. `runtime-css` y `facade-entrypoints-css` son la
 * capa comun que el skin modern consume, asi que cuentan. `tsx-inline-stamp`
 * solo cuenta cuando el archivo vive bajo un `engines/modern/`.
 */
export const MODERN_PAINT_PLANES = [
  'modern-skin-css',
  'presentation-css',
  'foundation-css',
  'runtime-css',
  'facade-entrypoints-css',
  'tsx-inline-stamp',
  'graphics-tsx',
  'infrastructure-tsx',
  'ts-token-utils',
];

const PAINT_SET = new Set(PAINT_PLANES);
const MODERN_SET = new Set(MODERN_PAINT_PLANES);

/* ─────────────────────────────────────────────────────────────────────────
 * Descubrimiento de archivos
 * ───────────────────────────────────────────────────────────────────────── */

const SCAN_ROOT = 'src';
const SCAN_EXTENSIONS = new Set(['.css', '.ts', '.tsx']);

/** Snapshots generados: nunca son fuente de hechos. */
const EXCLUDED_PREFIXES = ['src/foundation/tokens/css/facade/artifacts/'];

/** Directorios que no se escanean nunca. */
const EXCLUDED_DIR_NAMES = new Set([
  'node_modules',
  'dist',
  'build',
  'coverage',
  '.turbo',
  '.next',
  '__snapshots__',
]);

/** Segmentos de ruta que marcan material de test/fixture/story. */
const EXCLUDED_PATH_SEGMENTS = new Set([
  'test',
  'tests',
  '__tests__',
  'fixture',
  'fixtures',
  '__fixtures__',
  'stories',
  '__stories__',
  'story',
  '__mocks__',
  'mocks',
]);

/** Basenames de test/fixture/story. */
const EXCLUDED_BASENAME = /\.(test|spec|stories|story|fixture|fixtures|mock|mocks|bench|e2e)\.[cm]?[jt]sx?$|\.(test|spec|stories|fixture)\.css$/;

export function isExcludedPath(relPath) {
  for (const prefix of EXCLUDED_PREFIXES) {
    if (relPath.startsWith(prefix)) return true;
  }
  const parts = relPath.split('/');
  const base = parts[parts.length - 1];
  for (let i = 0; i < parts.length - 1; i += 1) {
    if (EXCLUDED_PATH_SEGMENTS.has(parts[i])) return true;
  }
  if (EXCLUDED_BASENAME.test(base)) return true;
  return false;
}

export function listSourceFiles(packageRoot = PACKAGE_ROOT) {
  const out = [];
  const walk = (absDir) => {
    let entries;
    try {
      entries = readdirSync(absDir, { withFileTypes: true });
    } catch {
      return;
    }
    // Orden estable, independiente del filesystem.
    entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
    for (const entry of entries) {
      const abs = path.join(absDir, entry.name);
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) {
        if (EXCLUDED_DIR_NAMES.has(entry.name)) continue;
        walk(abs);
        continue;
      }
      if (!entry.isFile()) {
        try {
          if (!statSync(abs).isFile()) continue;
        } catch {
          continue;
        }
      }
      const ext = path.extname(entry.name);
      if (!SCAN_EXTENSIONS.has(ext)) continue;
      const rel = path.relative(packageRoot, abs).split(path.sep).join('/');
      if (isExcludedPath(rel)) continue;
      out.push(rel);
    }
  };
  walk(path.join(packageRoot, SCAN_ROOT));
  out.sort();
  return out;
}

/* ─────────────────────────────────────────────────────────────────────────
 * Clasificacion de plano (primera coincidencia gana)
 * ───────────────────────────────────────────────────────────────────────── */

const CSS_MODERN = 'src/foundation/tokens/css/runtime/engines/modern/';
const CSS_PRESENTATION = 'src/foundation/tokens/css/presentation/';
const CSS_FOUNDATION = 'src/foundation/tokens/css/foundation/';
const CSS_CLASSIC = 'src/foundation/tokens/css/runtime/engines/classic/';
const CSS_RUSTIC = 'src/foundation/tokens/css/runtime/engines/rustic/';
const CSS_RUNTIME = 'src/foundation/tokens/css/runtime/';
const CSS_RUNTIME_ENGINES = 'src/foundation/tokens/css/runtime/engines/';
const CSS_FACADE_ENTRYPOINTS = 'src/foundation/tokens/css/facade/entrypoints/';
const UI_ROOT = 'src/ui/';
const GRAPHICS_ROOT = 'src/graphics/';
const INFRASTRUCTURE_ROOT = 'src/infrastructure/';
const TS_COMPONENTS = 'src/foundation/tokens/ts/runtime/components/';

/** @returns {string|null} nombre de plano, o null si el sitio no cae en ninguno. */
export function classifyPlane(relPath) {
  const ext = path.extname(relPath);

  if (ext === '.css') {
    if (relPath.startsWith(CSS_MODERN)) return 'modern-skin-css';
    if (relPath.startsWith(CSS_PRESENTATION)) return 'presentation-css';
    if (relPath.startsWith(CSS_FOUNDATION)) return 'foundation-css';
    if (relPath.startsWith(CSS_CLASSIC)) return 'classic-css';
    if (relPath.startsWith(CSS_RUSTIC)) return 'rustic-css';
    // runtime/** que NO cuelga de engines/: personality.css, bridges/*
    if (relPath.startsWith(CSS_RUNTIME) && !relPath.startsWith(CSS_RUNTIME_ENGINES)) {
      return 'runtime-css';
    }
    // facade/entrypoints/** es fuente; facade/artifacts/** sigue excluido antes de llegar aca.
    if (relPath.startsWith(CSS_FACADE_ENTRYPOINTS)) return 'facade-entrypoints-css';
    return null;
  }

  if (ext === '.tsx') {
    if (relPath.startsWith(UI_ROOT)) return 'tsx-inline-stamp';
    if (relPath.startsWith(GRAPHICS_ROOT)) return 'graphics-tsx';
    // maquinaria del motor (component-factory y compania): modern pinta a traves de ella
    if (relPath.startsWith(INFRASTRUCTURE_ROOT)) return 'infrastructure-tsx';
    return null;
  }

  if (ext === '.ts') {
    if (relPath.startsWith(TS_COMPONENTS)) {
      const tail = relPath.slice(TS_COMPONENTS.length);
      const segments = tail.split('/');
      // `token-utils/` como subcarpeta en cualquier nivel bajo components/
      if (segments.slice(0, -1).includes('token-utils')) return 'ts-token-utils';
      return 'ts-token-mirror';
    }
    return 'ts-other';
  }

  return null;
}

export function isModernPaintReader(plane, relPath) {
  if (!MODERN_SET.has(plane)) return false;
  if (plane !== 'tsx-inline-stamp') return true;
  return relPath.includes('/engines/modern/');
}

/* ─────────────────────────────────────────────────────────────────────────
 * Limpieza de comentarios (preservando offsets, y por tanto lineas)
 * ───────────────────────────────────────────────────────────────────────── */

function blankRun(text, from, to) {
  let out = '';
  for (let i = from; i < to; i += 1) out += text[i] === '\n' ? '\n' : ' ';
  return out;
}

/** Reemplaza `/* ... *\/` por espacios del mismo largo. */
export function stripCssComments(source) {
  let out = '';
  let i = 0;
  while (i < source.length) {
    if (source[i] === '/' && source[i + 1] === '*') {
      let end = source.indexOf('*/', i + 2);
      if (end === -1) end = source.length;
      else end += 2;
      out += blankRun(source, i, end);
      i = end;
      continue;
    }
    out += source[i];
    i += 1;
  }
  return out;
}

/**
 * Limpia comentarios JS/TS y devuelve tambien los tramos de string literal
 * (comillas simples, dobles y template), que son la unidad de "declaracion"
 * de una lectura en TS/TSX.
 *
 * @returns {{ cleaned: string, strings: Array<{start:number,end:number}> }}
 *          `start`/`end` delimitan el CONTENIDO interior del literal.
 */
export function stripTsComments(source) {
  const chars = source.split('');
  const strings = [];
  let i = 0;
  const n = source.length;

  const blank = (from, to) => {
    for (let k = from; k < to; k += 1) {
      if (chars[k] !== '\n') chars[k] = ' ';
    }
  };

  while (i < n) {
    const ch = source[i];

    if (ch === '/' && source[i + 1] === '/') {
      let end = source.indexOf('\n', i);
      if (end === -1) end = n;
      blank(i, end);
      i = end;
      continue;
    }

    if (ch === '/' && source[i + 1] === '*') {
      let end = source.indexOf('*/', i + 2);
      end = end === -1 ? n : end + 2;
      blank(i, end);
      i = end;
      continue;
    }

    if (ch === "'" || ch === '"' || ch === '`') {
      const quote = ch;
      let j = i + 1;
      while (j < n) {
        if (source[j] === '\\') {
          j += 2;
          continue;
        }
        if (source[j] === quote) break;
        if (quote !== '`' && source[j] === '\n') break; // string sin cerrar
        j += 1;
      }
      strings.push({ start: i + 1, end: Math.min(j, n) });
      i = Math.min(j + 1, n);
      continue;
    }

    i += 1;
  }

  return { cleaned: chars.join(''), strings };
}

/* ─────────────────────────────────────────────────────────────────────────
 * Indice de lineas
 * ───────────────────────────────────────────────────────────────────────── */

function buildLineStarts(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] === '\n') starts.push(i + 1);
  }
  return starts;
}

function lineAt(lineStarts, offset) {
  let lo = 0;
  let hi = lineStarts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (lineStarts[mid] <= offset) lo = mid;
    else hi = mid - 1;
  }
  return lo + 1;
}

/* ─────────────────────────────────────────────────────────────────────────
 * Declaraciones y escalares
 * ───────────────────────────────────────────────────────────────────────── */

function normalizeDecl(text) {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Limites de declaracion en CSS: una declaracion arranca despues del ultimo
 * `;`, `{` o `}` y termina en el proximo.
 */
export function cssDeclarationSpanAt(cleaned, offset) {
  let start = 0;
  for (let i = offset; i >= 0; i -= 1) {
    const c = cleaned[i];
    if (c === ';' || c === '{' || c === '}') {
      start = i + 1;
      break;
    }
  }
  let end = cleaned.length;
  for (let i = offset; i < cleaned.length; i += 1) {
    const c = cleaned[i];
    if (c === ';' || c === '{' || c === '}') {
      end = i;
      break;
    }
  }
  return { start, end, inString: false };
}

export function cssDeclarationAt(cleaned, offset) {
  const span = cssDeclarationSpanAt(cleaned, offset);
  return cleaned.slice(span.start, span.end);
}

const CSS_IN_JS_BREAK = new Set([';', '{', '}']);

/**
 * Declaracion en TS/TSX: el literal de string que contiene la lectura. Si el
 * literal a su vez es CSS-in-JS (trae `;`, `{` o `}`), se recorta al segmento
 * que contiene la lectura. Sin literal contenedor, cae a la linea, y entonces
 * `inString` queda en false: no hay posicion de valor de propiedad que leer.
 */
export function tsDeclarationSpanAt(cleaned, strings, offset, lineStarts) {
  let span = null;
  for (const s of strings) {
    if (offset >= s.start && offset < s.end) {
      if (!span || s.end - s.start < span.end - span.start) span = s;
    }
  }

  if (!span) {
    const line = lineAt(lineStarts, offset);
    const start = lineStarts[line - 1];
    const end = line < lineStarts.length ? lineStarts[line] : cleaned.length;
    return { start, end, inString: false };
  }

  let segStart = span.start;
  for (let i = offset; i >= span.start; i -= 1) {
    if (CSS_IN_JS_BREAK.has(cleaned[i])) {
      segStart = i + 1;
      break;
    }
  }
  let segEnd = span.end;
  for (let i = offset; i < span.end; i += 1) {
    if (CSS_IN_JS_BREAK.has(cleaned[i])) {
      segEnd = i;
      break;
    }
  }
  // `inString` solo es cierto cuando el literal entero es la declaracion: si
  // hubo recorte, la clave JS de afuera ya no gobierna este segmento.
  return { start: segStart, end: segEnd, inString: segStart === span.start };
}

export function tsDeclarationAt(cleaned, strings, offset, lineStarts) {
  const span = tsDeclarationSpanAt(cleaned, strings, offset, lineStarts);
  return cleaned.slice(span.start, span.end);
}

/* ─────────────────────────────────────────────────────────────────────────
 * Propiedad pintada
 *
 * Es el dato que convierte los hechos en un grafo: si la propiedad objetivo
 * es a su vez un canal `--ds-*`, la lectura PROPAGA (arista canal → canal);
 * si es una propiedad real, la lectura ATERRIZA (sitio de pintura).
 * Nunca se emite `?`: cuando el `var()` no esta en una posicion de valor de
 * propiedad reconocible, la respuesta honesta es `inline-expr`.
 * ───────────────────────────────────────────────────────────────────────── */

export const INLINE_EXPR = 'inline-expr';

/**
 * Nombre de propiedad valido. El guion bajo es obligatorio en el alfabeto: los
 * puentes privados se llaman `--_ds-*`, y rechazarlos hacia que toda
 * declaracion `--_ds-x: var(--ds-y)` cayera en `inline-expr` y se descartara
 * en silencio, borrando la arista.
 */
const PROP_NAME = /^-{0,2}[a-zA-Z_][a-zA-Z0-9_-]*$/;
const JS_KEY_CHAR = /[A-Za-z0-9_$-]/;

/** Nombre de propiedad a partir del lado izquierdo de un `prop: valor`. */
function propFromLeft(left) {
  const trimmed = left.trim();
  if (trimmed.startsWith('@')) {
    const m = trimmed.match(/^@[a-zA-Z-]+/);
    return m ? m[0] : null;
  }
  return PROP_NAME.test(trimmed) ? trimmed : null;
}

/** Clave JS inmediatamente anterior a un literal: `paddingInline: '...'`. */
function jsKeyBefore(cleaned, literalStart) {
  let i = literalStart - 2; // saltea la comilla de apertura
  while (i >= 0 && /\s/.test(cleaned[i])) i -= 1;
  if (i < 0 || cleaned[i] !== ':') return null;
  i -= 1;
  while (i >= 0 && /\s/.test(cleaned[i])) i -= 1;
  if (i < 0) return null;

  const quote = cleaned[i];
  if (quote === "'" || quote === '"' || quote === '`') {
    const open = cleaned.lastIndexOf(quote, i - 1);
    if (open === -1) return null;
    const key = cleaned.slice(open + 1, i);
    return key.length > 0 ? key : null;
  }

  let end = i + 1;
  while (i >= 0 && JS_KEY_CHAR.test(cleaned[i])) i -= 1;
  const key = cleaned.slice(i + 1, end);
  return key.length > 0 ? key : null;
}

/**
 * @returns {string} nombre de propiedad, at-rule (`@media`), o `inline-expr`.
 */
export function propertyForRead(cleaned, span, offset, isCss) {
  const text = cleaned.slice(span.start, span.end);
  const rel = offset - span.start;

  // El primer `:` de la declaracion es el que separa propiedad de valor.
  const colon = text.indexOf(':');
  if (colon !== -1 && colon < rel) {
    const name = propFromLeft(text.slice(0, colon));
    if (name) return name;
  }

  if (isCss) return INLINE_EXPR;
  if (!span.inString) return INLINE_EXPR;
  return jsKeyBefore(cleaned, span.start) ?? INLINE_EXPR;
}

const SCALE_CHANNEL = /--ds-[a-z0-9-]+-scale\b/g;

/**
 * Escalares que MULTIPLICAN en la declaracion: canales `--ds-*-scale` /
 * `*-effective-scale` que aparecen dentro de un `calc(...)` que contiene `*`.
 */
export function scalarsInDeclaration(decl) {
  const found = new Set();
  let idx = decl.indexOf('calc(');
  while (idx !== -1) {
    let depth = 0;
    let end = decl.length;
    for (let i = idx + 4; i < decl.length; i += 1) {
      if (decl[i] === '(') depth += 1;
      else if (decl[i] === ')') {
        depth -= 1;
        if (depth === 0) {
          end = i + 1;
          break;
        }
      }
    }
    const span = decl.slice(idx, end);
    if (span.includes('*')) {
      SCALE_CHANNEL.lastIndex = 0;
      let m;
      while ((m = SCALE_CHANNEL.exec(span)) !== null) found.add(m[0]);
    }
    idx = decl.indexOf('calc(', idx + 5);
  }
  return [...found].sort();
}

/* ─────────────────────────────────────────────────────────────────────────
 * Deteccion de lecturas y declaraciones de canal
 * ───────────────────────────────────────────────────────────────────────── */

/**
 * El barrido sigue DOS clases de canal:
 *  • `--ds-*`  canal publico
 *  • `--_ds-*` puente privado, nivel 1 de la forma canonica de tres niveles
 *              `var(--_ds-<familia>-<prop>, var(--ds-<raiz>, <literal>))`
 * Cortar en el puente dejaria los hechos ciegos a la forma objetivo del
 * programa. Cada canal lleva su `kind` para que el total solo-`--ds-` siga
 * siendo reconstruible por resta.
 */
const VAR_READ = /var\(\s*(--_?ds-[a-z0-9-]+)/g;
const CHANNEL_DECL = /(?<![\w-])(--_?ds-[a-z0-9-]+)(?=\s*['"`]?\s*:)/g;

/** Clase de un canal segun su prefijo. */
export const channelKind = (name) => (name.startsWith('--_ds-') ? 'bridge' : 'ds');

/* ─────────────────────────────────────────────────────────────────────────
 * Generacion
 * ───────────────────────────────────────────────────────────────────────── */

/**
 * `decl` se emite SOLO cuando la declaracion contiene `calc(`: ahi el texto es
 * la evidencia de por que `scalars` dice lo que dice, y sin el la condicion
 * (iii) del programa no se puede auditar a ojo. En el resto de los casos
 * `file` + `line` + `scalars` bastan, y el texto se recupera con
 * `sed -n '<line>p' <file>`. Es una regla de peso del artefacto, no de hechos:
 * ningun conteo depende de ella.
 */
export function keepsDecl(decl) {
  return decl.includes('calc(');
}

function emitReader(r) {
  const row = { plane: r.plane, file: r.file, line: r.line, prop: r.prop };
  if (keepsDecl(r.decl)) row.decl = r.decl;
  row.scalars = r.scalars;
  return row;
}

export function buildFacts(packageRoot = PACKAGE_ROOT) {
  const files = listSourceFiles(packageRoot);

  /** @type {Map<string,{declaredIn:Set<string>, readers:Map<string,object>}>} */
  const channels = new Map();
  const unclassified = [];

  const ensure = (channel) => {
    let entry = channels.get(channel);
    if (!entry) {
      entry = { declaredIn: new Set(), readers: new Map() };
      channels.set(channel, entry);
    }
    return entry;
  };

  for (const rel of files) {
    const source = readFileSync(path.join(packageRoot, rel), 'utf8');
    if (!source.includes('--ds-')) continue;

    const isCss = path.extname(rel) === '.css';
    let cleaned;
    let strings = [];
    if (isCss) {
      cleaned = stripCssComments(source);
    } else {
      const res = stripTsComments(source);
      cleaned = res.cleaned;
      strings = res.strings;
    }

    const lineStarts = buildLineStarts(cleaned);
    const plane = classifyPlane(rel);

    // Declaraciones de canal
    CHANNEL_DECL.lastIndex = 0;
    let dm;
    while ((dm = CHANNEL_DECL.exec(cleaned)) !== null) {
      ensure(dm[1]).declaredIn.add(rel);
    }

    // Lecturas
    VAR_READ.lastIndex = 0;
    let rm;
    while ((rm = VAR_READ.exec(cleaned)) !== null) {
      const channel = rm[1];
      const offset = rm.index + rm[0].indexOf(channel);
      const line = lineAt(lineStarts, offset);
      const span = isCss
        ? cssDeclarationSpanAt(cleaned, offset)
        : tsDeclarationSpanAt(cleaned, strings, offset, lineStarts);
      const decl = normalizeDecl(cleaned.slice(span.start, span.end));
      const prop = propertyForRead(cleaned, span, offset, isCss);

      if (plane === null) {
        const row = { channel, file: rel, line, prop };
        if (keepsDecl(decl)) row.decl = decl;
        unclassified.push(row);
        continue;
      }

      const scalars = scalarsInDeclaration(decl);
      const entry = ensure(channel);
      const key = `${plane}|${rel}|${line}|${prop}|${decl}`;
      if (!entry.readers.has(key)) {
        entry.readers.set(key, { plane, file: rel, line, prop, decl, scalars });
      }
    }
  }

  const channelRows = [...channels.keys()].sort().map((channel) => {
    const entry = channels.get(channel);
    const readers = [...entry.readers.values()].sort((a, b) => {
      if (a.plane !== b.plane) return a.plane < b.plane ? -1 : 1;
      if (a.file !== b.file) return a.file < b.file ? -1 : 1;
      if (a.line !== b.line) return a.line - b.line;
      return a.decl < b.decl ? -1 : a.decl > b.decl ? 1 : 0;
    });
    const planes = [...new Set(readers.map((r) => r.plane))].sort();
    const paints = readers.some((r) => PAINT_SET.has(r.plane));
    const paintsInModern = readers.some((r) => isModernPaintReader(r.plane, r.file));
    return {
      channel,
      kind: channelKind(channel),
      declaredIn: [...entry.declaredIn].sort(),
      planes,
      paints,
      paintsInModern,
      readers: readers.map((r) => emitReader(r)),
    };
  });

  unclassified.sort((a, b) => {
    if (a.file !== b.file) return a.file < b.file ? -1 : 1;
    if (a.line !== b.line) return a.line - b.line;
    return a.channel < b.channel ? -1 : a.channel > b.channel ? 1 : 0;
  });

  const readersByPlane = {};
  for (const plane of PLANES) readersByPlane[plane] = 0;
  const channelsByPlane = {};
  for (const plane of PLANES) channelsByPlane[plane] = 0;
  for (const row of channelRows) {
    for (const r of row.readers) readersByPlane[r.plane] += 1;
    for (const p of row.planes) channelsByPlane[p] += 1;
  }

  return {
    generator: 'scripts/quality-evidence/programs/modern-rescue/manifest/fanout-facts.mjs',
    scanRoot: SCAN_ROOT,
    planes: PLANES,
    paintPlanes: PAINT_PLANES,
    modernPaintPlanes: MODERN_PAINT_PLANES,
    summary: {
      filesScanned: files.length,
      channels: channelRows.length,
      channelsDs: channelRows.filter((c) => c.kind === 'ds').length,
      channelsBridge: channelRows.filter((c) => c.kind === 'bridge').length,
      channelsWithoutReaders: channelRows.filter((c) => c.readers.length === 0).length,
      channelsPaintsFalse: channelRows.filter((c) => !c.paints).length,
      channelsPaintsInModernFalse: channelRows.filter((c) => !c.paintsInModern).length,
      readers: channelRows.reduce((acc, c) => acc + c.readers.length, 0),
      readersByPlane,
      channelsByPlane,
      unclassifiedReads: unclassified.length,
    },
    channels: channelRows,
    unclassified,
  };
}

export function serialize(facts) {
  return `${JSON.stringify(facts, null, 2)}\n`;
}

function main(argv) {
  const check = argv.includes('--check');
  const text = serialize(buildFacts());

  if (check) {
    let onDisk = null;
    try {
      onDisk = readFileSync(OUTPUT_PATH, 'utf8');
    } catch {
      onDisk = null;
    }
    if (onDisk === null) {
      process.stderr.write(
        '✗ fanout-facts: falta generated/fanout-facts.json — corre el generador sin --check\n',
      );
      process.exit(1);
    }
    if (onDisk !== text) {
      process.stderr.write(
        '✗ fanout-facts: generated/fanout-facts.json esta desactualizado — corre el generador sin --check\n',
      );
      process.exit(1);
    }
    process.stdout.write('✓ fanout-facts: generated/fanout-facts.json al dia\n');
    return;
  }

  writeFileSync(OUTPUT_PATH, text, 'utf8');
  const facts = JSON.parse(text);
  const s = facts.summary;
  process.stdout.write(
    [
      `✓ fanout-facts → ${path.relative(PACKAGE_ROOT, OUTPUT_PATH)}`,
      `  archivos escaneados ─ ${s.filesScanned}`,
      `  canales ───────────── ${s.channels}`,
      `  lecturas ──────────── ${s.readers}`,
      `  paints=false ──────── ${s.channelsPaintsFalse}`,
      `  paintsInModern=false ─ ${s.channelsPaintsInModernFalse}`,
      `  sin clasificar ────── ${s.unclassifiedReads}`,
      '',
    ].join('\n'),
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main(process.argv.slice(2));
}
