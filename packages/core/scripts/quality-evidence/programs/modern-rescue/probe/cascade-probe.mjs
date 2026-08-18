#!/usr/bin/env node
/**
 * cascade-probe.mjs — la pata SIMBOLICA de la sonda de cascada.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * POR QUE EXISTE
 * ─────────────────────────────────────────────────────────────────────────────
 * El programa reescribe canales CSS de literal a `var(--raiz, literal)`. Con
 * los diales en su valor por defecto esa reescritura es BYTE-EQUIVALENTE: el
 * pixel no cambia. Por lo tanto NINGUNA captura visual puede probar que la
 * reescritura se hizo bien — la verificacion sighted no es debil para esta
 * clase de edicion, es CIEGA. Esta sonda la reemplaza por dos oraculos
 * mecanicos que no necesitan navegador.
 *
 *   ORACULO 1 · EQUIVALENCIA EN REPOSO
 *     Con todos los diales en su valor por defecto, el valor evaluado ANTES y
 *     DESPUES de la reescritura debe ser identico, comparado como cantidad
 *     tipada (1rem == 16px; 1.5 != 1.5rem). Si difiere → FAIL.
 *
 *   ORACULO 2 · LA DERIVADA
 *     Al perturbar un dial, el valor PINTADO debe seguir exactamente la
 *     formula declarada. Se mide el exponente de respuesta
 *          e = ln(v(k) / v(1)) / ln(k)
 *     en DOS factores independientes (k = 1.25 y k = 1.5), que deben coincidir.
 *       e = 0 → el dial no llega a esta pintura.
 *       e = 1 → el dial se aplica exactamente una vez.  (la ley)
 *       e ≥ 2 → el dial se aplica dos veces → DOBLE ESCALADO.
 *     La ley NO es "la derivada no debe cambiar": una reescritura correcta
 *     SUBE la derivada de 0 a 1 (ese es su proposito). La ley es que el dial
 *     se aplique EXACTAMENTE UNA VEZ de punta a punta — la condicion (iii) del
 *     programa: los escalares del ramp destino deben ser DISJUNTOS de los que
 *     ya aplica el lector.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CUATRO VEREDICTOS
 * ─────────────────────────────────────────────────────────────────────────────
 *   PASS                    la edicion llega a pintura y el dial se aplica 1 vez.
 *   FAIL                    rompe reposo, o el dial se aplica ≥2 veces.
 *   MASKED                  la edicion es correcta pero NUNCA llega a pintura:
 *                           nadie lee el canal, o un declarador posterior lo pisa.
 *                           MASKED NO ES PASS. Confundirlos es el falso verde
 *                           numero uno del programa.
 *   REQUIRES-ADJUDICATION   la edicion es indistinguible, por medios mecanicos,
 *                           de una edicion incorrecta: la raiz nueva es
 *                           ESTATICA (no hay ningun dial en su cadena), asi que
 *                           reposo y derivada coinciden con los de cualquier
 *                           otra raiz del mismo valor. Solo cambia el NOMBRE, y
 *                           el nombre es semantica, no aritmetica. La sonda no
 *                           emite PASS silencioso en este caso.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SUPUESTOS DECLARADOS (ninguno es una adivinanza silenciosa)
 * ─────────────────────────────────────────────────────────────────────────────
 *   • rem → px con la raiz DERIVADA DE LA CADENA, nunca con un 16 fijo.
 *     `runtime/engines/classic/theme.css:22` declara
 *         html[data-tenant] { font-size: var(--ds-font-size-base) }
 *     y ese archivo lo importa `runtime/engines/index.css:24` para TODOS los
 *     engines, dentro del bundle `facade/entrypoints/base.css`.
 *     `foundation/themes/default.css:610` define
 *         --ds-font-size-base: calc(var(--ds-font-size-base-base) * var(--ds-type-scale, 1))
 *     sobre una base de 0.9375rem. De ahi salen DOS hechos, y el segundo es el
 *     que una raiz fija vuelve invisible:
 *       1) la raiz en reposo es 15px (0.9375 × 16), no 16px. Todo `1rem`
 *          literal vale 15px;
 *       2) `rem` YA LLEVA `--ds-type-scale` UNA VEZ, porque la raiz misma se
 *          multiplica por el dial: raiz_px = 16 × 0.9375 × type-scale. Es un
 *          punto fijo. Por eso `0.75rem → var(--ds-font-size-xs, 0.75rem)` es
 *          DOBLE ESCALADO (exponente 1 → 2) aunque en reposo valga lo mismo.
 *     La raiz se re-deriva bajo CADA perturbacion de dial; derivarla una vez
 *     en reposo dejaria la segunda aplicacion fuera de la medicion.
 *     `CSS_INITIAL_ROOT_PX = 16` es el valor inicial de CSS y se usa SOLO
 *     (a) para resolver la propia declaracion de font-size de la raiz, que se
 *     resuelve contra el heredado, y (b) como ULTIMO RECURSO si la cadena no
 *     resuelve — y en ese caso `rootFontSize.derived` es `false` y el motivo
 *     viaja en `rootFontSize.reason` y se imprime en el CLI. Nunca es un 16
 *     silencioso.
 *   • La raiz del documento se modela con `data-tenant` estampado
 *     (`DOCUMENT_ROOT_CONTEXT`), porque `TenantProvider` lo estampa en <html>
 *     en produccion. Sin ese atributo la regla `html[data-tenant]` no casa y
 *     la sonda mediria un documento que no existe.
 *   • `em` y `%` NO se convierten salvo que se pase `emBasis` / `percentBasis`
 *     explicitos. Sin base, el resultado es UNRESOLVED. Nunca se adivina un
 *     numero.
 *   • Entrypoint de cascada: `facade/entrypoints/base.css`. Es el bundle
 *     tenant-free y declara el orden canonico de @layer.
 *   • `facade/artifacts/**` queda EXCLUIDO por diseno: son snapshots
 *     generados, no fuente. Su enmascaramiento es asunto de la pata Chromium,
 *     no de esta.
 *   • Reglas condicionales (@media / @supports / @container) y selectores con
 *     pseudo-clases de estado (:hover, :focus, :has, ::before, combinadores de
 *     hermano) quedan EXCLUIDOS del reposo y se CUENTAN en `sheet.stats`.
 *     Excluir sin contar seria mentir; se reporta cuanto se dejo afuera.
 *   • @import no relativo (p.ej. `antd/dist/reset.css`) se salta y se cuenta.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * API
 * ─────────────────────────────────────────────────────────────────────────────
 *   loadSheet({ entrypoint })          → sheet
 *   evaluate(channel, { sheet, overrides, context })
 *                                      → { value, chain, status }
 *                                        status: 'ok' | 'unresolved' | 'unread'
 *   findReadingSites(sheet, channel)   → [ site ]
 *   restEquivalence({ before, after, channel })
 *   derivative({ sheet, channel, dial, points })
 *   adjudicate({ before, after, channel, planted })  → veredicto
 *
 *   plantDeclaration / plantNewRule    → siembran defectos en una COPIA EN
 *                                        MEMORIA. Esta sonda jamas escribe en
 *                                        el arbol real.
 *
 * CLI
 *   --verify   <canal>=<esperado>
 *   --derivative <canal> --dial <nombre>=<v1>,<v2>
 *   --adjudicate <canal> --new-value '<texto>'
 */

import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve as resolvePath, relative } from "node:path";
import { fileURLToPath } from "node:url";

const PROBE_DIR = dirname(fileURLToPath(import.meta.url));
export const CORE_ROOT = resolvePath(PROBE_DIR, "../../../../..");
export const CSS_ROOT = resolvePath(CORE_ROOT, "src/foundation/tokens/css");
export const DEFAULT_ENTRYPOINT = resolvePath(
  CSS_ROOT,
  "facade/entrypoints/base.css",
);

/**
 * Valor INICIAL de CSS para el font-size de la raiz. No es "la raiz rem": es
 * el punto de partida contra el que se resuelve la propia declaracion de
 * font-size de <html>, y el ultimo recurso declarado cuando esa declaracion
 * no existe o no resuelve. La raiz efectiva la calcula `deriveRootFontSize()`.
 */
export const CSS_INITIAL_ROOT_PX = 16;

/** Rutas excluidas de la cascada simbolica (snapshots generados). */
const EXCLUDED_PATH_FRAGMENTS = ["/facade/artifacts/"];

const NUM_TOL = 1e-9;
const EXP_TOL = 1e-6;

/* ═══════════════════════════════════════════════════════════════════════════
   1 · LECTOR DE FUENTE — comentarios, lineas
   ═══════════════════════════════════════════════════════════════════════════ */

/** Reemplaza comentarios por espacios conservando saltos de linea (y offsets). */
function stripComments(src) {
  let out = "";
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === "/" && src[i + 1] === "*") {
      let j = src.indexOf("*/", i + 2);
      if (j < 0) j = src.length - 2;
      const seg = src.slice(i, j + 2);
      out += seg.replace(/[^\n]/g, " ");
      i = j + 2;
    } else if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < src.length && src[j] !== c) {
        if (src[j] === "\\") j += 1;
        j += 1;
      }
      out += src.slice(i, j + 1);
      i = j + 1;
    } else {
      out += c;
      i += 1;
    }
  }
  return out;
}

function buildLineIndex(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] === "\n") starts.push(i + 1);
  }
  return (offset) => {
    let lo = 0;
    let hi = starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (starts[mid] <= offset) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   2 · PARSER DE SELECTORES + ESPECIFICIDAD
   ═══════════════════════════════════════════════════════════════════════════ */

const SUPPORTED_FUNCTIONAL_PSEUDOS = new Set(["where", "is", "not", "matches"]);
const SUPPORTED_BARE_PSEUDOS = new Set(["root"]);

/** Corta un texto por `sep` respetando (), [] y comillas. */
function splitTopLevel(text, sep) {
  const parts = [];
  let depth = 0;
  let quote = null;
  let cur = "";
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (quote) {
      cur += c;
      if (c === "\\") {
        cur += text[i + 1] ?? "";
        i += 1;
      } else if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'") {
      quote = c;
      cur += c;
      continue;
    }
    if (c === "(" || c === "[") depth += 1;
    if (c === ")" || c === "]") depth -= 1;
    if (c === sep && depth === 0) {
      parts.push(cur);
      cur = "";
      continue;
    }
    cur += c;
  }
  parts.push(cur);
  return parts;
}

function parseCompound(text) {
  const simples = [];
  let i = 0;
  let supported = true;
  const unsupportedReasons = [];
  const spec = [0, 0, 0];

  while (i < text.length) {
    const c = text[i];
    if (c === "*") {
      simples.push({ kind: "universal" });
      i += 1;
    } else if (c === "#") {
      let j = i + 1;
      while (j < text.length && /[\w-]/.test(text[j])) j += 1;
      simples.push({ kind: "id", value: text.slice(i + 1, j) });
      spec[0] += 1;
      i = j;
    } else if (c === ".") {
      let j = i + 1;
      while (j < text.length && /[\w-]/.test(text[j])) j += 1;
      simples.push({ kind: "class", value: text.slice(i + 1, j) });
      spec[1] += 1;
      i = j;
    } else if (c === "[") {
      let depth = 0;
      let j = i;
      let quote = null;
      for (; j < text.length; j += 1) {
        const ch = text[j];
        if (quote) {
          if (ch === "\\") j += 1;
          else if (ch === quote) quote = null;
          continue;
        }
        if (ch === '"' || ch === "'") quote = ch;
        else if (ch === "[") depth += 1;
        else if (ch === "]") {
          depth -= 1;
          if (depth === 0) break;
        }
      }
      const inner = text.slice(i + 1, j);
      const m = /^\s*([\w-]+)\s*(?:([~^|$*]?=)\s*(.+?)\s*(?:\s+[iIsS])?\s*)?$/.exec(
        inner,
      );
      if (!m) {
        supported = false;
        unsupportedReasons.push(`attr:${inner}`);
      } else {
        const raw = m[3];
        const value =
          raw == null
            ? null
            : /^['"]/.test(raw)
              ? raw.slice(1, -1)
              : raw.trim();
        simples.push({
          kind: "attr",
          name: m[1],
          op: m[2] ?? null,
          value,
        });
      }
      spec[1] += 1;
      i = j + 1;
    } else if (c === ":") {
      if (text[i + 1] === ":") {
        supported = false;
        unsupportedReasons.push("pseudo-element");
        let j = i + 2;
        while (j < text.length && /[\w-]/.test(text[j])) j += 1;
        i = j;
        continue;
      }
      let j = i + 1;
      while (j < text.length && /[\w-]/.test(text[j])) j += 1;
      const name = text.slice(i + 1, j).toLowerCase();
      if (text[j] === "(") {
        let depth = 0;
        let k = j;
        let quote = null;
        for (; k < text.length; k += 1) {
          const ch = text[k];
          if (quote) {
            if (ch === "\\") k += 1;
            else if (ch === quote) quote = null;
            continue;
          }
          if (ch === '"' || ch === "'") quote = ch;
          else if (ch === "(") depth += 1;
          else if (ch === ")") {
            depth -= 1;
            if (depth === 0) break;
          }
        }
        const arg = text.slice(j + 1, k);
        if (!SUPPORTED_FUNCTIONAL_PSEUDOS.has(name)) {
          supported = false;
          unsupportedReasons.push(`pseudo:${name}()`);
        } else {
          const inner = parseSelectorList(arg);
          if (!inner.supported) {
            supported = false;
            unsupportedReasons.push(...inner.unsupportedReasons);
          }
          simples.push({ kind: "functional", name, inner });
          if (name !== "where") {
            const best = inner.selectors.reduce(
              (acc, s) =>
                compareSpecificity(s.specificity, acc) > 0 ? s.specificity : acc,
              [0, 0, 0],
            );
            spec[0] += best[0];
            spec[1] += best[1];
            spec[2] += best[2];
          }
        }
        i = k + 1;
      } else {
        if (!SUPPORTED_BARE_PSEUDOS.has(name)) {
          supported = false;
          unsupportedReasons.push(`pseudo:${name}`);
        } else {
          simples.push({ kind: "pseudo", name });
          spec[1] += 1;
        }
        i = j;
      }
    } else if (/[\w-]/.test(c)) {
      let j = i;
      while (j < text.length && /[\w-]/.test(text[j])) j += 1;
      simples.push({ kind: "tag", value: text.slice(i, j).toLowerCase() });
      spec[2] += 1;
      i = j;
    } else {
      supported = false;
      unsupportedReasons.push(`char:${c}`);
      i += 1;
    }
  }
  return { simples, specificity: spec, supported, unsupportedReasons };
}

function compareSpecificity(a, b) {
  for (let i = 0; i < 3; i += 1) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

/** Parte un selector complejo en compounds + combinadores. */
function parseComplex(text) {
  const tokens = [];
  let cur = "";
  let depth = 0;
  let quote = null;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (quote) {
      cur += c;
      if (c === "\\") {
        cur += text[i + 1] ?? "";
        i += 1;
      } else if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'") {
      quote = c;
      cur += c;
      continue;
    }
    if (c === "(" || c === "[") depth += 1;
    if (c === ")" || c === "]") depth -= 1;
    if (depth === 0 && (c === ">" || c === "+" || c === "~")) {
      tokens.push({ type: "compound", text: cur.trim() });
      tokens.push({ type: "combinator", value: c });
      cur = "";
      continue;
    }
    if (depth === 0 && /\s/.test(c)) {
      if (cur.trim()) {
        tokens.push({ type: "compound", text: cur.trim() });
        tokens.push({ type: "combinator", value: " " });
        cur = "";
      }
      continue;
    }
    cur += c;
  }
  if (cur.trim()) tokens.push({ type: "compound", text: cur.trim() });

  // colapsa combinadores duplicados (" " seguido de ">")
  const cleaned = [];
  for (const t of tokens) {
    if (
      t.type === "combinator" &&
      cleaned.length &&
      cleaned[cleaned.length - 1].type === "combinator"
    ) {
      if (t.value !== " ") cleaned[cleaned.length - 1] = t;
      continue;
    }
    if (t.type === "combinator" && cleaned.length === 0) continue;
    cleaned.push(t);
  }
  while (cleaned.length && cleaned[cleaned.length - 1].type === "combinator") {
    cleaned.pop();
  }

  const compounds = [];
  const combinators = [];
  let supported = true;
  const unsupportedReasons = [];
  const spec = [0, 0, 0];
  for (const t of cleaned) {
    if (t.type === "combinator") {
      if (t.value === "+" || t.value === "~") {
        supported = false;
        unsupportedReasons.push(`combinator:${t.value}`);
      }
      combinators.push(t.value);
    } else {
      const compound = parseCompound(t.text);
      if (!compound.supported) {
        supported = false;
        unsupportedReasons.push(...compound.unsupportedReasons);
      }
      compounds.push(compound);
      spec[0] += compound.specificity[0];
      spec[1] += compound.specificity[1];
      spec[2] += compound.specificity[2];
    }
  }
  return {
    text,
    compounds,
    combinators,
    specificity: spec,
    supported,
    unsupportedReasons,
  };
}

function parseSelectorList(text) {
  const selectors = [];
  let supported = true;
  const unsupportedReasons = [];
  for (const part of splitTopLevel(text, ",")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const complex = parseComplex(trimmed);
    if (!complex.supported) {
      supported = false;
      unsupportedReasons.push(...complex.unsupportedReasons);
    }
    selectors.push(complex);
  }
  return { selectors, supported, unsupportedReasons };
}

/* ═══════════════════════════════════════════════════════════════════════════
   3 · MATCHING contra un contexto de elementos
   ═══════════════════════════════════════════════════════════════════════════ */

/** Un elemento: { isRoot, tag, id, classes:Set, attrs:Map }. */
export function makeElement({
  isRoot = false,
  tag = null,
  id = null,
  classes = [],
  attrs = {},
} = {}) {
  return {
    isRoot,
    tag: tag ? tag.toLowerCase() : isRoot ? "html" : null,
    id,
    classes: new Set(classes),
    attrs: new Map(Object.entries(attrs)),
  };
}

export const ROOT_ELEMENT = makeElement({ isRoot: true, tag: "html" });
export const ROOT_CONTEXT = [ROOT_ELEMENT];

/**
 * La raiz REAL del documento en produccion: `TenantProvider` estampa
 * `data-tenant` en <html>, y `runtime/engines/classic/theme.css` cuelga de
 * `html[data-tenant]` el font-size que fija la base de `rem`. Sin el atributo
 * esa regla no casa y la sonda estaria midiendo un documento inexistente.
 * `ROOT_ELEMENT` se conserva sin atributos porque es el entorno de
 * propiedades personalizadas que usan las pruebas de cascada; la base de
 * `rem` se deriva SIEMPRE contra este contexto.
 */
export const DOCUMENT_ROOT_ELEMENT = makeElement({
  isRoot: true,
  tag: "html",
  attrs: { "data-tenant": "" },
});
export const DOCUMENT_ROOT_CONTEXT = [DOCUMENT_ROOT_ELEMENT];

function elementKey(el) {
  return [
    el.isRoot ? "root" : "el",
    el.tag ?? "",
    el.id ?? "",
    [...el.classes].sort().join("."),
    [...el.attrs.entries()]
      .map(([k, v]) => `${k}=${v ?? ""}`)
      .sort()
      .join("&"),
  ].join("|");
}

function contextKey(ctx) {
  return ctx.map(elementKey).join(">>");
}

function matchAttr(el, simple) {
  if (!el.attrs.has(simple.name)) return false;
  if (simple.op == null) return true;
  const actual = el.attrs.get(simple.name);
  if (actual == null) return false;
  const want = simple.value;
  switch (simple.op) {
    case "=":
      return actual === want;
    case "^=":
      return actual.startsWith(want);
    case "$=":
      return actual.endsWith(want);
    case "*=":
      return actual.includes(want);
    case "~=":
      return actual.split(/\s+/).includes(want);
    case "|=":
      return actual === want || actual.startsWith(`${want}-`);
    default:
      return false;
  }
}

function matchCompound(el, compound) {
  for (const simple of compound.simples) {
    switch (simple.kind) {
      case "universal":
        break;
      case "tag":
        if (el.tag !== simple.value) return false;
        break;
      case "id":
        if (el.id !== simple.value) return false;
        break;
      case "class":
        if (!el.classes.has(simple.value)) return false;
        break;
      case "attr":
        if (!matchAttr(el, simple)) return false;
        break;
      case "pseudo":
        if (simple.name === "root" && !el.isRoot) return false;
        break;
      case "functional": {
        const anyMatch = simple.inner.selectors.some((s) =>
          matchComplexAtSelf(el, s),
        );
        if (simple.name === "not") {
          if (anyMatch) return false;
        } else if (!anyMatch) return false;
        break;
      }
      default:
        return false;
    }
  }
  return true;
}

/** Para :is()/:where()/:not() solo evaluamos el compound sobre el propio elemento. */
function matchComplexAtSelf(el, complex) {
  if (complex.compounds.length !== 1) return false;
  return matchCompound(el, complex.compounds[0]);
}

/**
 * ¿El selector complejo matchea el elemento `ctx[targetIdx]` dado el linaje
 * `ctx[0..targetIdx]`? Solo descendiente (" ") e hijo (">").
 */
function matchComplex(complex, ctx, targetIdx) {
  const compounds = complex.compounds;
  if (compounds.length === 0) return false;
  if (!matchCompound(ctx[targetIdx], compounds[compounds.length - 1])) {
    return false;
  }
  let elemIdx = targetIdx;
  for (let ci = compounds.length - 2; ci >= 0; ci -= 1) {
    const comb = complex.combinators[ci];
    if (comb === ">") {
      elemIdx -= 1;
      if (elemIdx < 0 || !matchCompound(ctx[elemIdx], compounds[ci])) {
        return false;
      }
    } else {
      let found = -1;
      for (let k = elemIdx - 1; k >= 0; k -= 1) {
        if (matchCompound(ctx[k], compounds[ci])) {
          found = k;
          break;
        }
      }
      if (found < 0) return false;
      elemIdx = found;
    }
  }
  return true;
}

/* ═══════════════════════════════════════════════════════════════════════════
   4 · PARSER DE HOJA + @import / @layer
   ═══════════════════════════════════════════════════════════════════════════ */

function findMatchingBrace(text, openIdx) {
  let depth = 0;
  let quote = null;
  for (let i = openIdx; i < text.length; i += 1) {
    const c = text[i];
    if (quote) {
      if (c === "\\") i += 1;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'") quote = c;
    else if (c === "{") depth += 1;
    else if (c === "}") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function findPreludeEnd(text, start) {
  let quote = null;
  let paren = 0;
  for (let i = start; i < text.length; i += 1) {
    const c = text[i];
    if (quote) {
      if (c === "\\") i += 1;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'") quote = c;
    else if (c === "(") paren += 1;
    else if (c === ")") paren -= 1;
    else if (paren === 0 && (c === "{" || c === ";")) return { idx: i, ch: c };
  }
  return { idx: -1, ch: null };
}

function parseDeclarations(body, bodyOffset, lineAt) {
  const decls = [];
  const chunks = splitTopLevel(body, ";");
  let pos = 0;
  for (const chunk of chunks) {
    const chunkStart = pos;
    pos += chunk.length + 1; // +1 por el separador consumido
    const trimmed = chunk.trim();
    if (!trimmed) continue;
    const lead = chunk.length - chunk.replace(/^\s+/, "").length;
    const colon = splitTopLevel(trimmed, ":");
    if (colon.length < 2) continue;
    const prop = colon[0].trim();
    if (!prop || /[{}]/.test(prop)) continue;
    let value = colon.slice(1).join(":").trim();
    let important = false;
    const bang = /!\s*important\s*$/i.exec(value);
    if (bang) {
      important = true;
      value = value.slice(0, bang.index).trim();
    }
    decls.push({
      property: prop,
      value,
      important,
      line: lineAt(bodyOffset + chunkStart + lead),
    });
  }
  return decls;
}

function isExcludedPath(file) {
  const normalized = file.split("\\").join("/");
  return EXCLUDED_PATH_FRAGMENTS.some((frag) => normalized.includes(frag));
}

function parseImportPrelude(prelude) {
  const urlMatch =
    /@import\s+url\(\s*(['"]?)([^'")]+)\1\s*\)/i.exec(prelude) ??
    /@import\s+(['"])([^'"]+)\1/i.exec(prelude);
  if (!urlMatch) return null;
  const layerMatch = /layer\(\s*([\w.-]+)\s*\)/i.exec(prelude);
  const bareLayer = /\blayer\b(?!\s*\()/i.test(prelude);
  return {
    href: urlMatch[2],
    layer: layerMatch ? layerMatch[1] : bareLayer ? "<anonymous>" : null,
  };
}

function ingestFile(file, sheet, state) {
  if (sheet.seenFiles.has(file)) {
    sheet.stats.duplicateImports += 1;
    return;
  }
  sheet.seenFiles.add(file);
  if (isExcludedPath(file)) {
    sheet.stats.excludedArtifactFiles += 1;
    return;
  }
  if (!existsSync(file)) {
    sheet.stats.missingFiles.push(relative(CORE_ROOT, file));
    return;
  }
  const raw = readFileSync(file, "utf8");
  const text = stripComments(raw);
  const lineAt = buildLineIndex(text);
  sheet.stats.files += 1;
  parseBlock(text, 0, text.length, file, lineAt, sheet, state);
}

function registerLayer(sheet, path) {
  if (!path || path === "<anonymous>") return;
  if (!sheet.layerOrder.includes(path)) sheet.layerOrder.push(path);
}

function parseBlock(text, start, end, file, lineAt, sheet, state) {
  let i = start;
  while (i < end) {
    while (i < end && /\s/.test(text[i])) i += 1;
    if (i >= end) break;
    if (text[i] === "}") {
      i += 1;
      continue;
    }
    if (text[i] === "@") {
      const nameMatch = /^@([\w-]+)/.exec(text.slice(i, i + 64));
      const name = nameMatch ? nameMatch[1].toLowerCase() : "";
      const { idx, ch } = findPreludeEnd(text, i);
      if (idx < 0) break;
      const prelude = text.slice(i, idx).trim();
      if (ch === ";") {
        if (name === "import") {
          const imp = parseImportPrelude(prelude);
          if (!imp) {
            sheet.stats.unparsedImports += 1;
          } else if (!/^[.\/]/.test(imp.href)) {
            sheet.stats.externalImportsSkipped.push(imp.href);
          } else {
            const target = resolvePath(dirname(file), imp.href);
            const nextLayers = imp.layer
              ? [...state.layers, imp.layer]
              : state.layers;
            registerLayer(sheet, nextLayers.join("."));
            ingestFile(target, sheet, { ...state, layers: nextLayers });
          }
        } else if (name === "layer") {
          const names = prelude
            .replace(/^@layer\s*/i, "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          for (const n of names) {
            registerLayer(sheet, [...state.layers, n].join("."));
          }
        }
        i = idx + 1;
        continue;
      }
      // bloque
      const close = findMatchingBrace(text, idx);
      if (close < 0) break;
      if (name === "layer") {
        const names = prelude
          .replace(/^@layer\s*/i, "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        const layerName = names[0] ?? "<anonymous>";
        const nextLayers = [...state.layers, layerName];
        registerLayer(sheet, nextLayers.join("."));
        parseBlock(text, idx + 1, close, file, lineAt, sheet, {
          ...state,
          layers: nextLayers,
        });
      } else if (name === "media" || name === "supports" || name === "container") {
        sheet.stats.conditionalBlocks += 1;
        parseBlock(text, idx + 1, close, file, lineAt, sheet, {
          ...state,
          conditional: true,
          conditions: [...state.conditions, prelude],
        });
      } else {
        sheet.stats.skippedAtRules[name] =
          (sheet.stats.skippedAtRules[name] ?? 0) + 1;
      }
      i = close + 1;
      continue;
    }
    // regla calificada
    const braceIdx = text.indexOf("{", i);
    if (braceIdx < 0 || braceIdx >= end) break;
    const close = findMatchingBrace(text, braceIdx);
    if (close < 0) break;
    const selectorText = text.slice(i, braceIdx).trim();
    const body = text.slice(braceIdx + 1, close);
    const parsed = parseSelectorList(selectorText);
    const decls = parseDeclarations(body, braceIdx + 1, lineAt);
    const layerPath = state.layers.join(".");
    sheet.rules.push({
      file,
      relFile: relative(CORE_ROOT, file),
      line: lineAt(i),
      selectorText,
      selectors: parsed.selectors,
      supported: parsed.supported && !state.conditional,
      unsupportedReasons: state.conditional
        ? [...parsed.unsupportedReasons, "conditional-at-rule"]
        : parsed.unsupportedReasons,
      conditional: state.conditional,
      conditions: state.conditions,
      layerPath,
      decls,
    });
    if (!parsed.supported) {
      sheet.stats.unsupportedSelectorRules += 1;
      for (const r of new Set(parsed.unsupportedReasons)) {
        sheet.stats.unsupportedSelectorReasons[r] =
          (sheet.stats.unsupportedSelectorReasons[r] ?? 0) + 1;
      }
    }
    i = close + 1;
  }
}

function emptyStats() {
  return {
    files: 0,
    duplicateImports: 0,
    excludedArtifactFiles: 0,
    missingFiles: [],
    externalImportsSkipped: [],
    unparsedImports: 0,
    conditionalBlocks: 0,
    skippedAtRules: {},
    unsupportedSelectorRules: 0,
    unsupportedSelectorReasons: {},
  };
}

export function loadSheet({ entrypoint = DEFAULT_ENTRYPOINT } = {}) {
  const sheet = {
    entrypoint,
    layerOrder: [],
    rules: [],
    seenFiles: new Set(),
    stats: emptyStats(),
  };
  ingestFile(entrypoint, sheet, {
    layers: [],
    conditional: false,
    conditions: [],
  });
  reindex(sheet);
  return sheet;
}

/* ═══════════════════════════════════════════════════════════════════════════
   5 · INDICE + CASCADA
   ═══════════════════════════════════════════════════════════════════════════ */

export function reindex(sheet) {
  const declIndex = new Map();
  const customProps = new Set();
  for (let ri = 0; ri < sheet.rules.length; ri += 1) {
    const rule = sheet.rules[ri];
    for (let di = 0; di < rule.decls.length; di += 1) {
      const d = rule.decls[di];
      if (!declIndex.has(d.property)) declIndex.set(d.property, []);
      declIndex.get(d.property).push({ ruleIdx: ri, declIdx: di });
      if (d.property.startsWith("--")) customProps.add(d.property);
    }
  }
  sheet.declIndex = declIndex;
  sheet.customProps = customProps;
  sheet.matchCache = new Map();
  sheet.dependentsCache = null;
  sheet.readingSiteCache = new Map();
  // La raiz de `rem` depende de la cascada; si la cascada cambia, la raiz
  // cacheada deja de ser valida.
  sheet.rootFontSizeCache = new Map();
  return sheet;
}

function layerRank(sheet, layerPath) {
  if (!layerPath) return Number.POSITIVE_INFINITY; // unlayered gana
  const idx = sheet.layerOrder.indexOf(layerPath);
  return idx < 0 ? sheet.layerOrder.length : idx;
}

function ruleMatchesAt(sheet, ruleIdx, ctx, ctxKey, targetIdx) {
  const key = `${ruleIdx}|${targetIdx}|${ctxKey}`;
  const cached = sheet.matchCache.get(key);
  if (cached !== undefined) return cached;
  const rule = sheet.rules[ruleIdx];
  let best = null;
  if (rule.supported) {
    for (const sel of rule.selectors) {
      if (!sel.supported) continue;
      if (matchComplex(sel, ctx, targetIdx)) {
        if (!best || compareSpecificity(sel.specificity, best) > 0) {
          best = sel.specificity;
        }
      }
    }
  }
  sheet.matchCache.set(key, best);
  return best;
}

/** Clave de cascada: [importante, rank de capa, especificidad, orden]. */
function betterDecl(a, b) {
  if (!b) return true;
  if (a.important !== b.important) return a.important;
  const ra = a.important ? -a.layerRank : a.layerRank;
  const rb = b.important ? -b.layerRank : b.layerRank;
  if (ra !== rb) return ra > rb;
  const cmp = compareSpecificity(a.specificity, b.specificity);
  if (cmp !== 0) return cmp > 0;
  return a.order > b.order;
}

/**
 * Declaracion ganadora de `prop` para el elemento ctx[targetIdx] (sin herencia).
 */
function winningDeclAt(sheet, prop, ctx, ctxKey, targetIdx) {
  const candidates = sheet.declIndex.get(prop);
  if (!candidates) return null;
  let best = null;
  for (const { ruleIdx, declIdx } of candidates) {
    const spec = ruleMatchesAt(sheet, ruleIdx, ctx, ctxKey, targetIdx);
    if (!spec) continue;
    const rule = sheet.rules[ruleIdx];
    const decl = rule.decls[declIdx];
    const cand = {
      ruleIdx,
      declIdx,
      important: decl.important,
      layerRank: layerRank(sheet, rule.layerPath),
      specificity: spec,
      order: ruleIdx * 10000 + declIdx,
      value: decl.value,
      origin: {
        file: rule.relFile,
        line: decl.line,
        selector: rule.selectorText,
        layer: rule.layerPath || "<unlayered>",
      },
    };
    if (betterDecl(cand, best)) best = cand;
  }
  return best;
}

/** Con herencia: sube por el linaje hasta encontrar un declarador. */
export function resolveCustomProperty(sheet, prop, ctx, overrides) {
  if (overrides && Object.prototype.hasOwnProperty.call(overrides, prop)) {
    return {
      value: String(overrides[prop]),
      origin: { file: "<override>", line: 0, selector: ":root", layer: "<override>" },
      overridden: true,
    };
  }
  const ctxKey = contextKey(ctx);
  for (let idx = ctx.length - 1; idx >= 0; idx -= 1) {
    const win = winningDeclAt(sheet, prop, ctx, ctxKey, idx);
    if (win) return { value: win.value, origin: win.origin, decl: win };
  }
  return null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   6 · SUSTITUCION DE var()
   ═══════════════════════════════════════════════════════════════════════════ */

class Unresolved extends Error {
  constructor(reason, detail) {
    super(reason);
    this.reason = reason;
    this.detail = detail ?? null;
  }
}

/** Encuentra las referencias var(--x) de primer nivel en un texto. */
export function varRefs(text) {
  const refs = [];
  const re = /var\(\s*(--[\w-]+)/g;
  let m;
  while ((m = re.exec(text))) refs.push(m[1]);
  return refs;
}

function findVarCall(text, from) {
  const idx = text.indexOf("var(", from);
  if (idx < 0) return null;
  let depth = 0;
  let quote = null;
  for (let i = idx + 3; i < text.length; i += 1) {
    const c = text[i];
    if (quote) {
      if (c === "\\") i += 1;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'") quote = c;
    else if (c === "(") depth += 1;
    else if (c === ")") {
      depth -= 1;
      if (depth === 0) {
        const inner = text.slice(idx + 4, i);
        const parts = splitTopLevel(inner, ",");
        const name = parts[0].trim();
        const fallback =
          parts.length > 1 ? parts.slice(1).join(",").trim() : null;
        return { start: idx, end: i + 1, name, fallback };
      }
    }
  }
  return null;
}

/**
 * Expande recursivamente todos los var() de `text`.
 * Devuelve { text, chain, dialCandidates, multiplicative }.
 *   chain            — pasos de expansion, en orden.
 *   dialCandidates   — toda propiedad custom vista en la cadena.
 *   multiplicative   — subconjunto usado como FACTOR de un `*` o `/` dentro de
 *                      la cadena. Ese es el detector estructural de "dial":
 *                      no hay lista hardcodeada de nombres en ningun lado.
 */
export function substitute(sheet, text, ctx, overrides, state) {
  const st = state ?? {
    stack: [],
    chain: [],
    dialCandidates: new Set(),
    multiplicative: new Set(),
    fallbacks: new Map(),
    depth: 0,
  };
  if (st.depth > 200) throw new Unresolved("expansion-depth-exceeded");

  for (const ref of multiplicativeRefs(text)) st.multiplicative.add(ref);

  let out = text;
  let cursor = 0;
  for (;;) {
    const call = findVarCall(out, cursor);
    if (!call) break;
    st.dialCandidates.add(call.name);
    if (call.fallback != null && !st.fallbacks.has(call.name)) {
      st.fallbacks.set(call.name, call.fallback);
    }
    if (st.stack.includes(call.name)) {
      throw new Unresolved("cycle", [...st.stack, call.name].join(" → "));
    }
    const resolved = resolveCustomProperty(sheet, call.name, ctx, overrides);
    let replacement;
    if (resolved) {
      st.chain.push({
        property: call.name,
        value: resolved.value,
        origin: resolved.origin,
      });
      st.stack.push(call.name);
      st.depth += 1;
      replacement = substitute(sheet, resolved.value, ctx, overrides, st);
      st.depth -= 1;
      st.stack.pop();
    } else if (call.fallback != null) {
      st.chain.push({
        property: call.name,
        value: `<undefined → fallback ${call.fallback}>`,
        origin: { file: "<fallback>", line: 0, selector: "", layer: "" },
      });
      st.depth += 1;
      replacement = substitute(sheet, call.fallback, ctx, overrides, st);
      st.depth -= 1;
    } else {
      throw new Unresolved("undefined-custom-property", call.name);
    }
    out = `${out.slice(0, call.start)}${replacement}${out.slice(call.end)}`;
    cursor = call.start + replacement.length;
  }
  if (!state) {
    return { text: out, state: st };
  }
  return out;
}

/** var(--x) que aparece como operando de `*` o `/` en el texto dado. */
export function multiplicativeRefs(text) {
  const found = new Set();
  const re = /var\(\s*(--[\w-]+)/g;
  let m;
  while ((m = re.exec(text))) {
    const name = m[1];
    const before = text.slice(0, m.index).replace(/\s+$/, "");
    if (/[*/]$/.test(before)) {
      found.add(name);
      continue;
    }
    const call = findVarCall(text, m.index);
    if (call) {
      const after = text.slice(call.end).replace(/^\s+/, "");
      if (/^[*/]/.test(after)) found.add(name);
    }
  }
  return found;
}

/* ═══════════════════════════════════════════════════════════════════════════
   7 · EVALUADOR NUMERICO — calc / clamp / min / max
   ═══════════════════════════════════════════════════════════════════════════ */

function tokenizeValue(text) {
  const tokens = [];
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (/\s/.test(c)) {
      i += 1;
      continue;
    }
    const numMatch = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/.exec(
      text.slice(i),
    );
    const isSignedOperator =
      (c === "+" || c === "-") &&
      i > 0 &&
      /\s/.test(text[i - 1]) &&
      /\s/.test(text[i + 1] ?? " ");
    if (numMatch && !(isSignedOperator && numMatch[0].length === 1)) {
      let j = i + numMatch[0].length;
      const unitMatch = /^(%|[a-zA-Z]+)/.exec(text.slice(j));
      const unit = unitMatch ? unitMatch[0] : "";
      j += unit.length;
      tokens.push({ t: "num", n: Number(numMatch[0]), unit });
      i = j;
      continue;
    }
    if (c === "(" || c === ")" || c === ",") {
      tokens.push({ t: c });
      i += 1;
      continue;
    }
    if ("+-*/".includes(c)) {
      tokens.push({ t: "op", v: c });
      i += 1;
      continue;
    }
    const identMatch = /^[a-zA-Z_][\w-]*/.exec(text.slice(i));
    if (identMatch) {
      const j = i + identMatch[0].length;
      if (text[j] === "(") {
        tokens.push({ t: "fn", name: identMatch[0].toLowerCase() });
        tokens.push({ t: "(" });
        i = j + 1;
      } else {
        tokens.push({ t: "ident", v: identMatch[0] });
        i = j;
      }
      continue;
    }
    tokens.push({ t: "other", v: c });
    i += 1;
  }
  return tokens;
}

function normalizeQuantity(tok, opts) {
  const { n, unit } = tok;
  if (unit === "" ) return { n, unit: "" };
  if (unit === "px") return { n, unit: "px" };
  if (unit === "rem") {
    // La base viene del llamador. Toda ruta ligada a una hoja la DERIVA
    // (`evaluate` / `evaluateSite`); el inicial CSS solo cubre la aritmetica
    // pura, sin hoja, donde no hay cadena que resolver.
    const rootPx = opts.remPx ?? CSS_INITIAL_ROOT_PX;
    return { n: n * rootPx, unit: "px" };
  }
  if (unit === "em") {
    if (opts.emBasis != null) return { n: n * opts.emBasis, unit: "px" };
    throw new Unresolved("em-without-basis", `${n}em`);
  }
  if (unit === "%") {
    if (opts.percentBasis != null) {
      return { n: (n / 100) * opts.percentBasis, unit: "px" };
    }
    throw new Unresolved("percent-without-basis", `${n}%`);
  }
  return { n, unit };
}

function qAdd(a, b, sign) {
  if (a.unit === b.unit) return { n: a.n + sign * b.n, unit: a.unit };
  if (a.n === 0 && a.unit === "") return { n: sign * b.n, unit: b.unit };
  if (b.n === 0 && b.unit === "") return { n: a.n, unit: a.unit };
  throw new Unresolved("unit-mismatch", `${a.unit || "<number>"} vs ${b.unit || "<number>"}`);
}

function qMul(a, b) {
  if (a.unit && b.unit) {
    throw new Unresolved("unit-product", `${a.unit} * ${b.unit}`);
  }
  return { n: a.n * b.n, unit: a.unit || b.unit };
}

function qDiv(a, b) {
  if (b.unit) throw new Unresolved("unit-divisor", b.unit);
  if (b.n === 0) throw new Unresolved("division-by-zero");
  return { n: a.n / b.n, unit: a.unit };
}

function qCompare(a, b) {
  if (a.unit !== b.unit) {
    if (a.n === 0 && a.unit === "") return -Math.sign(b.n);
    if (b.n === 0 && b.unit === "") return Math.sign(a.n);
    throw new Unresolved("unit-mismatch", `${a.unit} vs ${b.unit}`);
  }
  return a.n - b.n;
}

class ExprParser {
  constructor(tokens, opts) {
    this.tokens = tokens;
    this.i = 0;
    this.opts = opts;
  }
  peek() {
    return this.tokens[this.i];
  }
  next() {
    return this.tokens[this.i++];
  }
  expect(t) {
    const tok = this.next();
    if (!tok || tok.t !== t) throw new Unresolved("parse-error", `expected ${t}`);
    return tok;
  }
  parseExpr() {
    let left = this.parseTerm();
    for (;;) {
      const tok = this.peek();
      if (tok && tok.t === "op" && (tok.v === "+" || tok.v === "-")) {
        this.next();
        const right = this.parseTerm();
        left = qAdd(left, right, tok.v === "+" ? 1 : -1);
      } else break;
    }
    return left;
  }
  parseTerm() {
    let left = this.parseUnary();
    for (;;) {
      const tok = this.peek();
      if (tok && tok.t === "op" && (tok.v === "*" || tok.v === "/")) {
        this.next();
        const right = this.parseUnary();
        left = tok.v === "*" ? qMul(left, right) : qDiv(left, right);
      } else break;
    }
    return left;
  }
  parseUnary() {
    const tok = this.peek();
    if (tok && tok.t === "op" && (tok.v === "-" || tok.v === "+")) {
      this.next();
      const inner = this.parseUnary();
      return tok.v === "-" ? { n: -inner.n, unit: inner.unit } : inner;
    }
    return this.parsePrimary();
  }
  parsePrimary() {
    const tok = this.next();
    if (!tok) throw new Unresolved("parse-error", "unexpected end");
    if (tok.t === "num") return normalizeQuantity(tok, this.opts);
    if (tok.t === "(") {
      const v = this.parseExpr();
      this.expect(")");
      return v;
    }
    if (tok.t === "fn") {
      this.expect("(");
      const name = tok.name;
      const args = [];
      if (this.peek() && this.peek().t !== ")") {
        args.push(this.parseExpr());
        while (this.peek() && this.peek().t === ",") {
          this.next();
          args.push(this.parseExpr());
        }
      }
      this.expect(")");
      switch (name) {
        case "calc":
          if (args.length !== 1) throw new Unresolved("parse-error", "calc arity");
          return args[0];
        case "min":
          return args.reduce((a, b) => (qCompare(a, b) <= 0 ? a : b));
        case "max":
          return args.reduce((a, b) => (qCompare(a, b) >= 0 ? a : b));
        case "clamp": {
          if (args.length !== 3) throw new Unresolved("parse-error", "clamp arity");
          const [lo, val, hi] = args;
          const upper = qCompare(val, hi) <= 0 ? val : hi;
          return qCompare(lo, upper) >= 0 ? lo : upper;
        }
        default:
          throw new Unresolved("unsupported-function", name);
      }
    }
    if (tok.t === "ident") throw new Unresolved("non-numeric-keyword", tok.v);
    throw new Unresolved("parse-error", JSON.stringify(tok));
  }
}

/** Corta por espacios respetando parentesis, corchetes y comillas. */
function splitTopLevelWhitespace(text) {
  const parts = [];
  let depth = 0;
  let quote = null;
  let cur = "";
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (quote) {
      cur += c;
      if (c === "\\") {
        cur += text[i + 1] ?? "";
        i += 1;
      } else if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'") {
      quote = c;
      cur += c;
      continue;
    }
    if (c === "(" || c === "[") depth += 1;
    if (c === ")" || c === "]") depth -= 1;
    if (depth === 0 && /\s/.test(c)) {
      if (cur) parts.push(cur);
      cur = "";
      continue;
    }
    cur += c;
  }
  if (cur) parts.push(cur);
  return parts;
}

function tryParseScalar(text, opts) {
  const tokens = tokenizeValue(text);
  if (tokens.length === 0) return null;
  const parser = new ExprParser(tokens, opts);
  let q;
  try {
    q = parser.parseExpr();
  } catch (err) {
    if (err instanceof Unresolved) {
      if (
        err.reason === "parse-error" ||
        err.reason === "non-numeric-keyword" ||
        err.reason === "unsupported-function"
      ) {
        return null;
      }
      throw err;
    }
    throw err;
  }
  if (parser.i !== tokens.length) return null;
  return { n: q.n, unit: q.unit };
}

/**
 * Evalua un texto YA sustituido.
 *   { kind:'quantity' }  un escalar tipado
 *   { kind:'list' }      varios escalares separados por espacio (shorthand
 *                        `padding: A B`): se comparan COMPONENTE A COMPONENTE,
 *                        nunca como texto — un shorthand es aritmetica, no
 *                        una cadena.
 *   { kind:'text' }      keyword, color, font-stack, lista con comas…
 * Si es numerico pero no evaluable → lanza Unresolved. Nunca adivina.
 */
export function evaluateLiteral(text, opts = {}) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return { kind: "text", text: normalized };
  const scalar = tryParseScalar(normalized, opts);
  if (scalar) return { kind: "quantity", n: scalar.n, unit: scalar.unit };
  // Solo una coma de PRIMER NIVEL descarta el shorthand numerico. Las comas
  // dentro de clamp()/min()/max() no lo hacen: `0 calc(1rem * clamp(a,b,c))`
  // sigue siendo un shorthand de dos componentes.
  if (splitTopLevel(normalized, ",").length === 1) {
    const parts = splitTopLevelWhitespace(normalized);
    if (parts.length > 1) {
      const items = parts.map((p) => tryParseScalar(p, opts));
      if (items.every(Boolean)) {
        return { kind: "list", items, text: normalized };
      }
    }
  }
  return { kind: "text", text: normalized };
}

/** Serie de escalares de un valor, o null si no es numerico. */
export function scalarSeries(value) {
  if (!value) return null;
  if (value.kind === "quantity") return [{ n: value.n, unit: value.unit }];
  if (value.kind === "list") return value.items;
  return null;
}

function formatQ(q) {
  const n = Math.abs(q.n) < 1e-12 ? 0 : q.n;
  const s = Number(n.toFixed(6)).toString();
  return q.unit ? `${s}${q.unit}` : s;
}

export function formatValue(v) {
  if (!v) return "<none>";
  if (v.kind === "quantity") return formatQ(v);
  if (v.kind === "list") return v.items.map(formatQ).join(" ");
  return v.text;
}

function quantitiesEqual(a, b) {
  if (a.unit !== b.unit) return false;
  const scale = Math.max(1, Math.abs(a.n), Math.abs(b.n));
  return Math.abs(a.n - b.n) <= NUM_TOL * scale;
}

export function valuesEqual(a, b) {
  if (!a || !b) return false;
  const sa = scalarSeries(a);
  const sb = scalarSeries(b);
  if (sa && sb) {
    if (sa.length !== sb.length) return false;
    return sa.every((q, i) => quantitiesEqual(q, sb[i]));
  }
  if (sa || sb) return false;
  return a.text === b.text;
}

/* ═══════════════════════════════════════════════════════════════════════════
   7b · LA BASE DE `rem` — DERIVADA, NUNCA SUPUESTA
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * deriveRootFontSize(sheet, { overrides, rootContext })
 *   → { px, derived, origin, expression, expandedText, reason }
 *
 * La base de `rem` no es una constante del proyecto: es el font-size GANADOR
 * de la cascada sobre el elemento raiz del documento. Se pregunta con el mismo
 * motor de cascada que usa el resto de la sonda (`winningDeclAt`), no con una
 * heuristica de texto sobre el selector: si una capa posterior pisa el
 * font-size de la raiz, la sonda lo ve.
 *
 * Dos reglas de resolucion, ambas de CSS:
 *   • un `rem` DENTRO de la propia declaracion de la raiz se resuelve contra
 *     el valor heredado, que en la raiz es el inicial (16px). De ahi
 *     0.9375rem → 15px, y no una recursion;
 *   • lo mismo para `em` y `%` en esa declaracion.
 *
 * `overrides` entra sin filtrar: la raiz se re-deriva bajo cada perturbacion
 * de dial. Ese es el punto entero — la raiz lleva `--ds-type-scale`, asi que
 * congelarla en reposo esconderia exactamente la segunda aplicacion que la
 * sonda existe para encontrar.
 *
 * Si no hay declaracion, o no resuelve, o no es una longitud positiva, se
 * devuelve el inicial de CSS con `derived: false` y un `reason` legible. El
 * ultimo recurso se DECLARA; no se silencia.
 */
export function deriveRootFontSize(
  sheet,
  { overrides = {}, rootContext = DOCUMENT_ROOT_CONTEXT } = {},
) {
  const initial = {
    px: CSS_INITIAL_ROOT_PX,
    derived: false,
    origin: null,
    expression: null,
    expandedText: null,
    referenced: new Set(),
    multiplicative: new Set(),
    fallbacks: new Map(),
  };
  if (!sheet) {
    return { ...initial, reason: "no-sheet" };
  }
  const ctxKey = contextKey(rootContext);
  let win = null;
  for (let idx = rootContext.length - 1; idx >= 0 && !win; idx -= 1) {
    win = winningDeclAt(sheet, "font-size", rootContext, ctxKey, idx);
  }
  if (!win) {
    return { ...initial, reason: "no-root-font-size-declaration" };
  }
  const selfOpts = {
    remPx: CSS_INITIAL_ROOT_PX,
    emBasis: CSS_INITIAL_ROOT_PX,
    percentBasis: CSS_INITIAL_ROOT_PX,
  };
  let expandedText = null;
  try {
    const expanded = substitute(sheet, win.value, rootContext, overrides);
    expandedText = expanded.text;
    const v = evaluateLiteral(expanded.text, selfOpts);
    if (v.kind === "quantity" && v.unit === "px" && Number.isFinite(v.n) && v.n > 0) {
      return {
        px: v.n,
        derived: true,
        origin: win.origin,
        expression: win.value,
        expandedText,
        reason: null,
        // Los diales de la CADENA DE LA RAIZ. `--ds-type-scale` vive aqui y
        // casi nunca aparece en la cadena propia del canal medido: todo valor
        // en `rem` lo recibe por la raiz, no por su texto. Sin exportarlos, un
        // canal en rem quedaria con el dial "sin default conocido" y la sonda
        // se saltaria la medicion que tiene que hacer.
        referenced: expanded.state.dialCandidates,
        multiplicative: expanded.state.multiplicative,
        fallbacks: expanded.state.fallbacks,
      };
    }
    return {
      ...initial,
      origin: win.origin,
      expression: win.value,
      expandedText,
      reason: `root-font-size-not-a-positive-length: ${formatValue(v)}`,
    };
  } catch (err) {
    if (err instanceof Unresolved) {
      return {
        ...initial,
        origin: win.origin,
        expression: win.value,
        expandedText,
        reason: `root-font-size-unresolved: ${err.reason}${err.detail ? ` (${err.detail})` : ""}`,
      };
    }
    throw err;
  }
}

function overridesKey(overrides) {
  const entries = Object.entries(overrides ?? {});
  if (entries.length === 0) return "";
  return entries
    .map(([k, v]) => `${k}=${String(v)}`)
    .sort()
    .join(";");
}

/**
 * Memo por hoja. `reindex()` la limpia, asi que sembrar un defecto invalida
 * la raiz cacheada automaticamente: una siembra que cambie el font-size de la
 * raiz no puede quedar midiendose contra la raiz vieja.
 */
export function rootFontSize(sheet, { overrides = {}, rootContext = DOCUMENT_ROOT_CONTEXT } = {}) {
  if (!sheet) return deriveRootFontSize(null);
  if (!sheet.rootFontSizeCache) sheet.rootFontSizeCache = new Map();
  const key = `${contextKey(rootContext)}|${overridesKey(overrides)}`;
  const hit = sheet.rootFontSizeCache.get(key);
  if (hit) return hit;
  const value = deriveRootFontSize(sheet, { overrides, rootContext });
  sheet.rootFontSizeCache.set(key, value);
  return value;
}

/* ═══════════════════════════════════════════════════════════════════════════
   8 · API PUBLICA — evaluate
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * evaluate(channel, { sheet, overrides, context })
 *   → { value, chain, status }
 *
 * status:
 *   'ok'          evaluado a una cantidad o a un texto normalizado
 *   'unresolved'  no se pudo evaluar; `reason` dice por que. NUNCA un numero
 *                 adivinado.
 *   'unread'      la propiedad no la lee ninguna declaracion de pintura de la
 *                 hoja: la edicion no puede llegar a pixel. Esto NO es PASS.
 */
export function evaluate(channel, options = {}) {
  const {
    sheet,
    overrides = {},
    context = ROOT_CONTEXT,
    emBasis = null,
    percentBasis = null,
    checkReadership = true,
    rootContext = DOCUMENT_ROOT_CONTEXT,
  } = options;
  if (!sheet) throw new Error("evaluate() requiere { sheet }");

  // La base de `rem` se deriva BAJO LOS MISMOS overrides. No es un preambulo
  // decorativo: de aqui sale la primera aplicacion de `--ds-type-scale`.
  const root = rootFontSize(sheet, { overrides, rootContext });

  const isCustom = channel.startsWith("--");
  let text;
  let origin = null;
  if (isCustom) {
    const resolved = resolveCustomProperty(sheet, channel, context, overrides);
    if (!resolved) {
      return {
        value: null,
        chain: [],
        status: "unresolved",
        reason: "undefined-custom-property",
        detail: channel,
        rootFontSize: root,
      };
    }
    text = resolved.value;
    origin = resolved.origin;
  } else {
    text = channel;
  }

  let expanded;
  try {
    expanded = substitute(sheet, text, context, overrides);
  } catch (err) {
    if (err instanceof Unresolved) {
      return {
        value: null,
        chain: [],
        status: "unresolved",
        reason: err.reason,
        detail: err.detail,
        origin,
        rootFontSize: root,
      };
    }
    throw err;
  }

  let value;
  try {
    value = evaluateLiteral(expanded.text, {
      emBasis,
      percentBasis,
      remPx: root.px,
    });
  } catch (err) {
    if (err instanceof Unresolved) {
      return {
        value: null,
        chain: expanded.state.chain,
        status: "unresolved",
        reason: err.reason,
        detail: err.detail,
        origin,
        rootFontSize: root,
      };
    }
    throw err;
  }

  const result = {
    value,
    chain: [
      { property: channel, value: text, origin },
      ...expanded.state.chain,
    ],
    status: "ok",
    expandedText: expanded.text,
    referenced: expanded.state.dialCandidates,
    multiplicative: expanded.state.multiplicative,
    fallbacks: expanded.state.fallbacks,
    rootFontSize: root,
  };

  if (isCustom && checkReadership) {
    const sites = findReadingSites(sheet, channel);
    if (sites.length === 0) {
      result.status = "unread";
      result.reason = "no-reading-site";
    }
    result.readingSites = sites;
  }
  return result;
}

/* ═══════════════════════════════════════════════════════════════════════════
   9 · SITIOS DE LECTURA
   ═══════════════════════════════════════════════════════════════════════════ */

function dependentsGraph(sheet) {
  if (sheet.dependentsCache) return sheet.dependentsCache;
  const dependents = new Map();
  for (const rule of sheet.rules) {
    for (const decl of rule.decls) {
      if (!decl.property.startsWith("--")) continue;
      for (const ref of varRefs(decl.value)) {
        if (!dependents.has(ref)) dependents.set(ref, new Set());
        dependents.get(ref).add(decl.property);
      }
    }
  }
  sheet.dependentsCache = dependents;
  return dependents;
}

/** Cierre transitivo: toda propiedad custom cuya cadena puede alcanzar `channel`. */
export function dependentClosure(sheet, channel) {
  const dependents = dependentsGraph(sheet);
  const seen = new Set([channel]);
  const queue = [channel];
  while (queue.length) {
    const cur = queue.pop();
    for (const dep of dependents.get(cur) ?? []) {
      if (!seen.has(dep)) {
        seen.add(dep);
        queue.push(dep);
      }
    }
  }
  return seen;
}

/**
 * Sintetiza un contexto de elementos que satisface un selector complejo, para
 * poder EVALUAR la regla sin navegador. Para :is()/:where() toma la primera
 * alternativa; :not() se ignora (no se agregan sus rasgos).
 */
export function synthesizeContext(complex) {
  const elements = [];
  for (const compound of complex.compounds) {
    const el = {
      isRoot: false,
      tag: null,
      id: null,
      classes: [],
      attrs: {},
    };
    const apply = (simples) => {
      for (const s of simples) {
        if (s.kind === "tag") el.tag = s.value;
        else if (s.kind === "id") el.id = s.value;
        else if (s.kind === "class") el.classes.push(s.value);
        else if (s.kind === "attr") el.attrs[s.name] = s.value ?? "";
        else if (s.kind === "pseudo" && s.name === "root") el.isRoot = true;
        else if (s.kind === "functional" && s.name !== "not") {
          const first = s.inner.selectors[0];
          if (first && first.compounds.length === 1) {
            apply(first.compounds[0].simples);
          }
        }
      }
    };
    apply(compound.simples);
    elements.push(makeElement(el));
  }
  if (elements.length === 0) return ROOT_CONTEXT;
  if (!elements[0].isRoot) return [ROOT_ELEMENT, ...elements];
  return elements;
}

/**
 * Toda declaracion de PINTURA (propiedad no-custom) cuyo valor referencia el
 * canal o cualquier propiedad que dependa transitivamente de el.
 * El canal se descubre por el grafo, no por una lista escrita a mano.
 */
export function findReadingSites(sheet, channel) {
  const cached = sheet.readingSiteCache.get(channel);
  if (cached) return cached;
  const closure = dependentClosure(sheet, channel);
  const sites = [];
  for (let ri = 0; ri < sheet.rules.length; ri += 1) {
    const rule = sheet.rules[ri];
    if (!rule.supported) continue;
    for (let di = 0; di < rule.decls.length; di += 1) {
      const decl = rule.decls[di];
      if (decl.property.startsWith("--")) continue;
      const refs = varRefs(decl.value);
      if (!refs.some((r) => closure.has(r))) continue;
      const selector = rule.selectors.find((s) => s.supported);
      if (!selector) continue;
      sites.push({
        ruleIdx: ri,
        declIdx: di,
        property: decl.property,
        value: decl.value,
        file: rule.relFile,
        line: decl.line,
        selector: rule.selectorText,
        layer: rule.layerPath || "<unlayered>",
        context: synthesizeContext(selector),
      });
    }
  }
  sheet.readingSiteCache.set(channel, sites);
  return sites;
}

export function evaluateSite(sheet, site, overrides = {}, opts = {}) {
  // `rem` se resuelve contra la raiz del DOCUMENTO, no contra el elemento del
  // sitio — y se re-deriva bajo los overrides de esta medicion.
  const root = rootFontSize(sheet, {
    overrides,
    rootContext: opts.rootContext ?? DOCUMENT_ROOT_CONTEXT,
  });
  try {
    const expanded = substitute(sheet, site.value, site.context, overrides);
    const value = evaluateLiteral(expanded.text, { remPx: root.px, ...opts });
    return {
      status: "ok",
      value,
      rootFontSize: root,
      expandedText: expanded.text,
      referenced: expanded.state.dialCandidates,
      multiplicative: expanded.state.multiplicative,
      fallbacks: expanded.state.fallbacks,
      chain: expanded.state.chain,
    };
  } catch (err) {
    if (err instanceof Unresolved) {
      return {
        status: "unresolved",
        reason: err.reason,
        detail: err.detail,
        rootFontSize: root,
      };
    }
    throw err;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   10 · ORACULO 1 — EQUIVALENCIA EN REPOSO
   ═══════════════════════════════════════════════════════════════════════════ */

export function restEquivalence({ before, after, channel, overrides = {} }) {
  const sites = findReadingSites(after, channel);
  const channelBefore = evaluate(channel, {
    sheet: before,
    overrides,
    checkReadership: false,
  });
  const channelAfter = evaluate(channel, {
    sheet: after,
    overrides,
    checkReadership: false,
  });
  /**
   * `equal` es TRIVALENTE a proposito:
   *   true   ambos evaluan y coinciden
   *   false  difieren, o uno evalua y el otro no
   *   null   INDETERMINADO: ninguno de los dos evalua, por la MISMA causa.
   *          Un sitio indeterminado no es evidencia a favor ni en contra; es
   *          un punto ciego y se reporta como tal, nunca se cuenta como PASS
   *          ni se disfraza de FAIL.
   */
  const siteResults = sites.map((site) => {
    const b = evaluateSite(before, site, overrides);
    const a = evaluateSite(after, site, overrides);
    let equal;
    if (b.status === "ok" && a.status === "ok") {
      equal = valuesEqual(b.value, a.value);
    } else if (b.status !== "ok" && a.status !== "ok") {
      equal =
        b.reason === a.reason && String(b.detail) === String(a.detail)
          ? null
          : false;
    } else {
      equal = false;
    }
    return { site, before: b, after: a, equal };
  });
  const equalChannel =
    channelBefore.status !== "unresolved" &&
    channelAfter.status !== "unresolved" &&
    valuesEqual(channelBefore.value, channelAfter.value);
  const indeterminate = siteResults.filter((r) => r.equal === null);
  return {
    channel: { before: channelBefore, after: channelAfter, equal: equalChannel },
    sites: siteResults,
    indeterminate,
    equal: equalChannel && siteResults.every((r) => r.equal !== false),
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   11 · ORACULO 2 — LA DERIVADA
   ═══════════════════════════════════════════════════════════════════════════ */

const DEFAULT_FACTORS = [1.25, 1.5];

function dialDefaultQuantity(sheet, dial, ctx, fallbacks) {
  const resolved = resolveCustomProperty(sheet, dial, ctx, {});
  if (resolved) {
    const r = evaluate(dial, { sheet, context: ctx, checkReadership: false });
    if (r.status === "ok" && r.value.kind === "quantity") return r.value;
    return null;
  }
  // Sin declarador: el default efectivo es el fallback escrito en la cadena.
  // Si tampoco esta ahi, se mira la CADENA DE LA RAIZ de `rem`: un canal en
  // rem recibe `--ds-type-scale` por la raiz, no por su propio texto, y ese
  // dial tiene que ser medible igual.
  const fb = fallbacks?.get(dial) ?? rootFontSize(sheet).fallbacks?.get(dial);
  if (fb == null) return null;
  try {
    const expanded = substitute(sheet, fb, ctx, {});
    const v = evaluateLiteral(expanded.text, {
      remPx: rootFontSize(sheet).px,
    });
    return v.kind === "quantity" ? v : null;
  } catch {
    return null;
  }
}

function quantityText(q) {
  return q.unit ? `${q.n}${q.unit}` : String(q.n);
}

/**
 * Mide el exponente de respuesta de un sitio (o del canal) frente a un dial.
 *   e = ln(v(k)/v(1)) / ln(k), medido en dos factores independientes.
 * Devuelve `exponent` solo si ambos factores coinciden; si no, marca
 * `nonMultiplicative` con las dos razones observadas. Nunca redondea a la
 * historia mas conveniente.
 */
export function measureExponent({
  sheet,
  site,
  channel,
  dial,
  factors = DEFAULT_FACTORS,
  fallbacks = null,
  baseOverrides = {},
}) {
  const ctx = site ? site.context : ROOT_CONTEXT;
  const evalAt = (overrides) =>
    site
      ? evaluateSite(sheet, site, overrides)
      : evaluate(channel, {
          sheet,
          overrides,
          context: ctx,
          checkReadership: false,
        });

  const baseline = evalAt(baseOverrides);
  if (baseline.status !== "ok") {
    return { status: "skipped", reason: "baseline-unresolved" };
  }
  const baseSeries = scalarSeries(baseline.value);
  if (!baseSeries) {
    return { status: "skipped", reason: "baseline-not-numeric" };
  }
  const fb = fallbacks ?? baseline.fallbacks ?? null;
  const dialDefault = dialDefaultQuantity(sheet, dial, ctx, fb);
  if (!dialDefault) {
    return { status: "skipped", reason: "dial-default-unknown" };
  }
  if (dialDefault.n === 0) {
    return { status: "skipped", reason: "dial-default-zero" };
  }

  // Exponentes por COMPONENTE: un shorthand `padding: A B` puede mover solo
  // una de sus partes, y esa parte no se puede promediar con la otra.
  const points = [];
  const perFactorExponents = [];
  for (const k of factors) {
    const perturbed = {
      ...baseOverrides,
      [dial]: quantityText({ n: dialDefault.n * k, unit: dialDefault.unit }),
    };
    const r = evalAt(perturbed);
    if (r.status !== "ok") {
      return { status: "skipped", reason: "perturbed-unresolved", factor: k };
    }
    const series = scalarSeries(r.value);
    if (!series || series.length !== baseSeries.length) {
      return { status: "skipped", reason: "shape-changed-under-perturbation" };
    }
    const exps = [];
    for (let i = 0; i < series.length; i += 1) {
      if (series[i].unit !== baseSeries[i].unit) {
        return { status: "skipped", reason: "unit-changed-under-perturbation" };
      }
      if (baseSeries[i].n === 0) {
        exps.push(series[i].n === 0 ? 0 : NaN);
        continue;
      }
      const ratio = series[i].n / baseSeries[i].n;
      exps.push(ratio <= 0 ? NaN : Math.log(ratio) / Math.log(k));
    }
    points.push({ factor: k, value: r.value });
    perFactorExponents.push(exps);
  }

  const first = perFactorExponents[0];
  const last = perFactorExponents[perFactorExponents.length - 1];
  const usable = first.map((e, i) => Number.isFinite(e) && Number.isFinite(last[i]));
  if (!usable.some(Boolean)) {
    return { status: "skipped", reason: "no-measurable-component" };
  }
  const agree = first.every(
    (e, i) => !usable[i] || Math.abs(e - last[i]) <= 1e-6,
  );
  if (!agree) {
    return {
      status: "non-multiplicative",
      dial,
      baseline: baseline.value,
      dialDefault,
      points,
      componentExponents: perFactorExponents,
    };
  }
  // El exponente del sitio es el MAXIMO de sus componentes medibles: si una
  // sola parte del shorthand recibe el dial dos veces, el sitio esta roto.
  let e = 0;
  for (let i = 0; i < first.length; i += 1) {
    if (usable[i] && Math.abs(first[i]) > Math.abs(e)) e = first[i];
  }
  const rounded = Math.round(e);
  const integral = Math.abs(e - rounded) <= EXP_TOL;
  return {
    status: "ok",
    dial,
    baseline: baseline.value,
    dialDefault,
    points,
    componentExponents: first,
    exponent: e,
    integralExponent: integral ? rounded : null,
    integral,
  };
}

/**
 * derivative() — modo directo: un canal, un dial, dos puntos explicitos.
 * Reporta el valor en cada punto y el factor observado frente al declarado.
 */
export function derivative({
  sheet,
  channel,
  dial,
  points,
  expectedExponent = null,
  context = ROOT_CONTEXT,
  site = null,
}) {
  const [v1, v2] = points;
  const evalAt = (overrides) =>
    site
      ? evaluateSite(sheet, site, overrides)
      : evaluate(channel, {
          sheet,
          overrides,
          context,
          checkReadership: false,
        });
  const r1 = evalAt({ [dial]: String(v1) });
  const r2 = evalAt({ [dial]: String(v2) });
  if (r1.status !== "ok" || r2.status !== "ok") {
    return { status: "unresolved", reason: "site-unresolved", at: [r1, r2] };
  }
  const s1 = scalarSeries(r1.value);
  const s2 = scalarSeries(r2.value);
  if (!s1 || !s2 || s1.length !== s2.length) {
    return { status: "unresolved", reason: "non-numeric", at: [r1, r2] };
  }
  const dialRatio = Number(v2) / Number(v1);
  // Componente que mas se mueve: un shorthand puede escalar solo una parte.
  let observedFactor = 1;
  for (let i = 0; i < s1.length; i += 1) {
    if (s1[i].n === 0) continue;
    const f = s2[i].n / s1[i].n;
    if (Math.abs(Math.log(Math.abs(f) || 1)) > Math.abs(Math.log(Math.abs(observedFactor) || 1))) {
      observedFactor = f;
    }
  }
  const exponent =
    dialRatio > 0 && observedFactor > 0
      ? Math.log(observedFactor) / Math.log(dialRatio)
      : NaN;
  const expectedFactor =
    expectedExponent == null ? null : dialRatio ** expectedExponent;
  return {
    status: "ok",
    dial,
    points: [
      { dialValue: v1, value: r1.value },
      { dialValue: v2, value: r2.value },
    ],
    dialRatio,
    observedFactor,
    expectedFactor,
    exponent,
    matchesDeclared:
      expectedFactor == null
        ? null
        : Math.abs(observedFactor - expectedFactor) <=
          1e-9 * Math.max(1, Math.abs(expectedFactor)),
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   12 · SIEMBRA EN MEMORIA (jamas toca el arbol real)
   ═══════════════════════════════════════════════════════════════════════════ */

export function cloneSheet(sheet) {
  const copy = {
    entrypoint: sheet.entrypoint,
    layerOrder: [...sheet.layerOrder],
    rules: sheet.rules.map((r) => ({
      ...r,
      decls: r.decls.map((d) => ({ ...d })),
    })),
    seenFiles: new Set(sheet.seenFiles),
    stats: sheet.stats,
  };
  return reindex(copy);
}

/**
 * Reemplaza IN MEMORIA el valor de la declaracion GANADORA de `property`
 * (en :root por defecto). Devuelve un handle para poder comprobar despues si
 * esa misma declaracion sigue siendo la ganadora.
 */
export function plantDeclaration(sheet, { property, value, context = ROOT_CONTEXT }) {
  const ctxKey = contextKey(context);
  let win = null;
  for (let idx = context.length - 1; idx >= 0 && !win; idx -= 1) {
    win = winningDeclAt(sheet, property, context, ctxKey, idx);
  }
  if (!win) {
    throw new Error(`plantDeclaration: ${property} no tiene declarador`);
  }
  const previous = sheet.rules[win.ruleIdx].decls[win.declIdx].value;
  sheet.rules[win.ruleIdx].decls[win.declIdx].value = value;
  reindex(sheet);
  return {
    ruleIdx: win.ruleIdx,
    declIdx: win.declIdx,
    property,
    previous,
    planted: value,
  };
}

/** Agrega una regla nueva al FINAL de la cascada (sin capa → gana a todo). */
export function plantNewRule(
  sheet,
  { selector = ":root", declarations, layerPath = "", file = "<planted>" },
) {
  const parsed = parseSelectorList(selector);
  const rule = {
    file,
    relFile: file,
    line: 0,
    selectorText: selector,
    selectors: parsed.selectors,
    supported: parsed.supported,
    unsupportedReasons: parsed.unsupportedReasons,
    conditional: false,
    conditions: [],
    layerPath,
    decls: Object.entries(declarations).map(([property, value]) => ({
      property,
      value,
      important: false,
      line: 0,
    })),
  };
  sheet.rules.push(rule);
  reindex(sheet);
  return { ruleIdx: sheet.rules.length - 1, rule };
}

/* ═══════════════════════════════════════════════════════════════════════════
   13 · VEREDICTO
   ═══════════════════════════════════════════════════════════════════════════ */

export const VERDICT = {
  PASS: "PASS",
  FAIL: "FAIL",
  MASKED: "MASKED",
  ADJUDICATE: "REQUIRES-ADJUDICATION",
};

/**
 * adjudicate({ before, after, channel, planted })
 *
 * Orden de decision (importa):
 *   1 MASKED · la edicion no llega:
 *       1a nadie lee el canal (canal muerto), o
 *       1b la declaracion sembrada no es la ganadora de la cascada.
 *   2 FAIL   · rompe la equivalencia en reposo.
 *   3 FAIL   · algun dial se aplica dos o mas veces (exponente ≥ 2).
 *   4 REQUIRES-ADJUDICATION · la cadena nueva no contiene NINGUN dial
 *       (ninguna propiedad usada como factor multiplicativo). Reposo y
 *       derivada son entonces identicos a los de cualquier raiz del mismo
 *       valor: solo cambia el nombre, y el nombre no es aritmetica.
 *   5 PASS   · llega a pintura, reposo identico, dial aplicado exactamente
 *              una vez.
 */
export function adjudicate({ before, after, channel, planted = null, factors }) {
  const findings = [];
  const sites = findReadingSites(after, channel);

  // ── 1a canal muerto
  if (sites.length === 0) {
    return {
      verdict: VERDICT.MASKED,
      reason: "dead-channel",
      detail: `ninguna declaracion de pintura lee ${channel} (ni directa ni transitivamente)`,
      sites: [],
      findings,
    };
  }

  // ── 1b la reescritura no gana la cascada
  if (planted) {
    const ctxKey = contextKey(ROOT_CONTEXT);
    const win = winningDeclAt(after, channel, ROOT_CONTEXT, ctxKey, 0);
    if (!win || win.ruleIdx !== planted.ruleIdx || win.declIdx !== planted.declIdx) {
      return {
        verdict: VERDICT.MASKED,
        reason: "rewrite-not-winning",
        detail: win
          ? `gana ${win.origin.file}:${win.origin.line} (${win.origin.layer}) con \`${win.value}\``
          : "no hay declarador ganador",
        winner: win ? win.origin : null,
        sites,
        findings,
      };
    }
  }

  // ── 2 equivalencia en reposo
  const rest = restEquivalence({ before, after, channel });
  // Los sitios indeterminados son puntos ciegos declarados, no evidencia.
  for (const ind of rest.indeterminate) {
    findings.push({
      kind: "blind-spot",
      site: `${ind.site.file}:${ind.site.line}`,
      property: ind.site.property,
      reason: ind.before.reason,
      detail: ind.before.detail,
    });
  }
  if (!rest.equal) {
    const broken = rest.sites.filter((r) => r.equal === false);
    return {
      verdict: VERDICT.FAIL,
      reason: "rest-equivalence",
      detail: rest.channel.equal
        ? `${broken.length} sitio(s) de pintura cambian en reposo`
        : `${channel}: ${formatValue(rest.channel.before.value)} → ${formatValue(rest.channel.after.value)}`,
      rest,
      sites,
      findings,
    };
  }

  // ── 3/4 derivada, dial por dial, sitio por sitio
  //
  // RELEVANCIA. Solo las propiedades de la CADENA PROPIA del canal pueden
  // decidir el veredicto de ESTA reescritura. Un clamp que satura en un dial
  // vecino del mismo shorthand, o un doble escalado que ya existia antes de
  // tocar nada, se reportan como hallazgo pero no condenan la edicion: seria
  // culpar al cambio de un defecto que no introdujo.
  const channelEval = evaluate(channel, {
    sheet: after,
    checkReadership: false,
  });
  const channelRefs = channelEval.referenced ?? new Set();

  // EL DIAL QUE VIAJA EN `rem` NO SE AGREGA AQUI, a proposito. La raiz es
  // `calc(0.9375rem * var(--ds-type-scale, 1))`, asi que todo valor en rem
  // lleva el dial de tipografia una vez — ANTES y DESPUES de la reescritura.
  // Esa aplicacion ya esta contada donde importa: `measureExponent` la mide,
  // porque la raiz se re-deriva bajo cada perturbacion, y por eso una segunda
  // aplicacion sale como exponente 2 y no como 1. Meterlo ademas en el conjunto
  // de candidatos "propios" del canal convertiria en PASS un caso que es
  // REQUIRES-ADJUDICATION: una reescritura hacia una raiz ESTATICA en rem
  // pareceria tener un dial vivo propio cuando no lo tiene. Un dial que ya
  // estaba antes no puede ser la evidencia de que la reescritura acerto.

  const measurements = [];
  let sawDial = false;
  let sawLiveDial = false;
  const doubles = [];
  const nonMultiplicative = [];

  for (const site of sites) {
    const afterEval = evaluateSite(after, site, {});
    if (afterEval.status !== "ok") continue;
    const dials = [...(afterEval.multiplicative ?? [])].filter((d) =>
      afterEval.referenced.has(d),
    );
    const candidates = [...(afterEval.referenced ?? [])];
    for (const cand of candidates) {
      if (cand === channel) continue;
      const isDial = dials.includes(cand);
      const relevant = channelRefs.has(cand);
      const mAfter = measureExponent({
        sheet: after,
        site,
        dial: cand,
        factors,
        fallbacks: afterEval.fallbacks,
      });
      const mBefore = measureExponent({
        sheet: before,
        site,
        dial: cand,
        factors,
        fallbacks: afterEval.fallbacks,
      });
      if (isDial && relevant) sawDial = true;
      if (mAfter.status === "non-multiplicative") {
        const entry = { site, dial: cand, relevant, measurement: mAfter };
        if (relevant && mBefore.status === "ok") nonMultiplicative.push(entry);
        else
          findings.push({
            kind: "non-multiplicative-elsewhere",
            site: `${site.file}:${site.line}`,
            property: site.property,
            dial: cand,
          });
        continue;
      }
      if (mAfter.status !== "ok") continue;
      measurements.push({ site, dial: cand, isDial, relevant, after: mAfter, before: mBefore });
      if (isDial && relevant && mAfter.integral && mAfter.integralExponent >= 1) {
        sawLiveDial = true;
      }
      if (mAfter.integral && mAfter.integralExponent >= 2) {
        const eBefore = mBefore.status === "ok" ? mBefore.integralExponent : null;
        const raisedByRewrite = eBefore == null || mAfter.integralExponent > eBefore;
        const entry = {
          site,
          dial: cand,
          exponentAfter: mAfter.integralExponent,
          exponentBefore: eBefore,
          measurement: mAfter,
        };
        if (raisedByRewrite) doubles.push(entry);
        else
          findings.push({
            kind: "pre-existing-double-application",
            site: `${site.file}:${site.line}`,
            property: site.property,
            dial: cand,
            exponent: mAfter.integralExponent,
          });
      }
    }
  }

  if (doubles.length > 0) {
    const d = doubles[0];
    return {
      verdict: VERDICT.FAIL,
      reason: "double-application",
      detail:
        `${d.dial} se aplica ${d.exponentAfter} veces en ` +
        `${d.site.file}:${d.site.line} (${d.site.property})` +
        (d.exponentBefore != null
          ? ` — antes de la reescritura se aplicaba ${d.exponentBefore} vez/veces`
          : ""),
      doubles,
      measurements,
      sites,
      findings,
    };
  }

  if (nonMultiplicative.length > 0) {
    return {
      verdict: VERDICT.ADJUDICATE,
      reason: "non-multiplicative-response",
      detail:
        `la respuesta al dial ${nonMultiplicative[0].dial} no es multiplicativa; ` +
        "las dos razones observadas no coinciden y NO se redondean",
      nonMultiplicative,
      measurements,
      sites,
      findings,
    };
  }

  if (!sawDial || !sawLiveDial) {
    return {
      verdict: VERDICT.ADJUDICATE,
      reason: "static-root-role-undecidable",
      detail:
        `la cadena nueva de ${channel} no contiene ningun dial vivo ` +
        "(ninguna propiedad usada como factor multiplicativo que mueva la pintura). " +
        "Reposo y derivada son identicos a los de cualquier raiz del mismo valor: " +
        "la eleccion del nombre es semantica y no la puede decidir esta pata.",
      measurements,
      sites,
      findings,
    };
  }

  return {
    verdict: VERDICT.PASS,
    reason: "one-application",
    detail: `${sites.length} sitio(s) de pintura; dial aplicado exactamente una vez`,
    measurements,
    sites,
    findings,
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   14 · CLI
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Banderas que SIEMPRE consumen el argumento siguiente, aunque empiece con
 * `--`. Sin esto `--verify --ds-x=1rem` se leeria como dos banderas: los
 * nombres de canal CSS empiezan por `--` igual que las opciones.
 */
const VALUE_FLAGS = new Set([
  "verify",
  "derivative",
  "dial",
  "adjudicate",
  "new-value",
  "expect-exponent",
  "entrypoint",
]);

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const eq = a.indexOf("=");
      const name = eq > 0 ? a.slice(2, eq) : a.slice(2);
      if (eq > 0 && VALUE_FLAGS.has(name)) {
        out[name] = a.slice(eq + 1);
      } else if (VALUE_FLAGS.has(name)) {
        if (i + 1 < argv.length) out[name] = argv[++i];
        else out[name] = true;
      } else if (eq > 0) {
        out[name] = a.slice(eq + 1);
      } else if (argv[i + 1] && !argv[i + 1].startsWith("--")) {
        out[name] = argv[++i];
      } else out[name] = true;
    } else out._.push(a);
  }
  return out;
}

function printChain(chain, indent = "  ") {
  for (const step of chain) {
    const o = step.origin;
    const where = o && o.file ? ` ← ${o.file}:${o.line} [${o.layer}]` : "";
    console.log(`${indent}├ ${step.property}: ${step.value}${where}`);
  }
}

function cliVerify(args, sheet) {
  const spec = String(args.verify);
  const eq = spec.indexOf("=");
  if (eq < 0) {
    console.error("uso: --verify <canal>=<esperado>");
    return 2;
  }
  const channel = spec.slice(0, eq).trim();
  const expectedText = spec.slice(eq + 1).trim();
  const got = evaluate(channel, { sheet });
  // El texto esperado se interpreta con LA MISMA raiz que el canal medido: si
  // no, un `--verify --ds-x=0.75rem` compararia 12px contra 11.25px y la sonda
  // condenaria una cadena sana.
  const expected = evaluateLiteral(expectedText, {
    remPx: rootFontSize(sheet).px,
  });
  printRootFontSize(sheet);
  console.log(`canal      ${channel}`);
  console.log(`esperado   ${formatValue(expected)}`);
  console.log(`obtenido   ${got.status === "ok" || got.status === "unread" ? formatValue(got.value) : `UNRESOLVED (${got.reason}${got.detail ? `: ${got.detail}` : ""})`}`);
  if (got.chain.length) {
    console.log("cadena");
    printChain(got.chain);
  }
  if (got.status === "unresolved") {
    console.log("\nveredicto  UNRESOLVED — no se adivina ningun numero.");
    return 1;
  }
  if (got.status === "unread") {
    console.log(
      "\nveredicto  MASKED — el canal evalua, pero NINGUNA declaracion de pintura lo lee.",
    );
    return 1;
  }
  const ok = valuesEqual(got.value, expected);
  console.log(`\nveredicto  ${ok ? VERDICT.PASS : VERDICT.FAIL}`);
  return ok ? 0 : 1;
}

function cliDerivative(args, sheet) {
  const channel = String(args.derivative);
  const dialSpec = String(args.dial ?? "");
  const eq = dialSpec.indexOf("=");
  if (eq < 0) {
    console.error("uso: --derivative <canal> --dial <nombre>=<v1>,<v2>");
    return 2;
  }
  const dial = dialSpec.slice(0, eq).trim();
  printRootFontSize(sheet);
  const pts = dialSpec
    .slice(eq + 1)
    .split(",")
    .map((s) => s.trim());
  if (pts.length !== 2) {
    console.error("el dial necesita exactamente dos puntos: <v1>,<v2>");
    return 2;
  }
  const expected = args["expect-exponent"] != null ? Number(args["expect-exponent"]) : null;

  console.log(`canal      ${channel}`);
  console.log(`dial       ${dial}: ${pts[0]} → ${pts[1]}`);

  const sites = findReadingSites(sheet, channel);
  console.log(`sitios de lectura: ${sites.length}`);
  if (sites.length === 0) {
    console.log(
      `\nveredicto  ${VERDICT.MASKED} — nadie lee ${channel}; la derivada no puede llegar a pixel.`,
    );
    return 1;
  }

  const chanD = derivative({ sheet, channel, dial, points: pts, expectedExponent: expected });
  if (chanD.status === "ok") {
    console.log(
      `\ncanal      ${formatValue(chanD.points[0].value)} → ${formatValue(chanD.points[1].value)}  ` +
        `factor observado ${chanD.observedFactor.toFixed(6)}  exponente ${chanD.exponent.toFixed(6)}`,
    );
  } else {
    console.log("\ncanal      UNRESOLVED");
  }

  let worst = 0;
  for (const site of sites) {
    const d = derivative({
      sheet,
      channel,
      dial,
      points: pts,
      expectedExponent: expected,
      site,
    });
    if (d.status !== "ok") {
      console.log(
        `  · ${site.file}:${site.line} ${site.property} — no medible (${d.reason})`,
      );
      continue;
    }
    const e = d.exponent;
    const mark = Math.abs(e - Math.round(e)) > EXP_TOL ? "?" : Math.round(e) >= 2 ? "✗" : "✓";
    if (mark === "✗") worst = 1;
    console.log(
      `  ${mark} ${site.file}:${site.line} ${site.property}  ` +
        `${formatValue(d.points[0].value)} → ${formatValue(d.points[1].value)}  ` +
        `factor ${d.observedFactor.toFixed(6)}` +
        (d.expectedFactor != null ? ` (declarado ${d.expectedFactor.toFixed(6)})` : "") +
        `  exponente ${e.toFixed(6)}`,
    );
  }
  console.log(
    `\nveredicto  ${worst ? `${VERDICT.FAIL} — doble aplicacion del dial` : "sin doble aplicacion detectada"}`,
  );
  return worst;
}

function cliAdjudicate(args, sheet) {
  const channel = String(args.adjudicate);
  const newValue = args["new-value"];
  if (typeof newValue !== "string") {
    console.error("uso: --adjudicate <canal> --new-value '<texto>'");
    return 2;
  }
  const after = cloneSheet(sheet);
  const planted = plantDeclaration(after, { property: channel, value: newValue });
  const result = adjudicate({ before: sheet, after, channel, planted });
  console.log(`canal      ${channel}`);
  console.log(`antes      ${planted.previous}`);
  console.log(`despues    ${planted.planted}`);
  console.log(`sitios     ${result.sites.length}`);
  console.log(`\nveredicto  ${result.verdict}  (${result.reason})`);
  console.log(`           ${result.detail}`);
  return result.verdict === VERDICT.PASS ? 0 : 1;
}

function cliStats(sheet) {
  const s = sheet.stats;
  console.log("─ hoja simbolica ─────────────────────────────────────────────");
  console.log(`entrypoint                  ${relative(CORE_ROOT, sheet.entrypoint)}`);
  console.log(`archivos parseados          ${s.files}`);
  console.log(`reglas                      ${sheet.rules.length}`);
  console.log(`propiedades custom          ${sheet.customProps.size}`);
  console.log(`capas declaradas            ${sheet.layerOrder.length}`);
  console.log(`artifacts excluidos         ${s.excludedArtifactFiles}  (facade/artifacts/**)`);
  console.log(`bloques condicionales       ${s.conditionalBlocks}  (excluidos del reposo)`);
  console.log(`reglas con selector no sop. ${s.unsupportedSelectorRules}`);
  console.log(`@import externos salteados  ${s.externalImportsSkipped.length}`);
  console.log(`archivos ausentes           ${s.missingFiles.length}`);
  printRootFontSize(sheet);
}

/**
 * La raiz de `rem` se IMPRIME siempre, derivada o no. Cuando cae al inicial de
 * CSS lo dice con todas las letras y con el motivo: un 16 silencioso es
 * exactamente el defecto que esta sonda tuvo.
 */
function printRootFontSize(sheet, indent = "") {
  const root = rootFontSize(sheet);
  if (root.derived) {
    console.log(
      `${indent}raiz rem (derivada)         ${root.px}px  ` +
        `← ${root.origin.file}:${root.origin.line} ` +
        `\`${root.origin.selector} { font-size: ${root.expression} }\``,
    );
    console.log(`${indent}                            expandido: ${root.expandedText}`);
  } else {
    console.log(
      `${indent}raiz rem  NO DERIVADA       ${root.px}px = inicial de CSS, ULTIMO RECURSO`,
    );
    console.log(`${indent}                            motivo: ${root.reason}`);
  }
}

async function main(argv) {
  const args = parseArgs(argv);
  const sheet = loadSheet({
    entrypoint: args.entrypoint ? resolvePath(args.entrypoint) : DEFAULT_ENTRYPOINT,
  });
  if (args.stats) {
    cliStats(sheet);
    return 0;
  }
  if (args.verify) return cliVerify(args, sheet);
  if (args.derivative) return cliDerivative(args, sheet);
  if (args.adjudicate) return cliAdjudicate(args, sheet);
  console.log(
    [
      "cascade-probe — pata simbolica de la sonda de cascada",
      "",
      "  --stats",
      "  --verify <canal>=<esperado>",
      "  --derivative <canal> --dial <nombre>=<v1>,<v2> [--expect-exponent <n>]",
      "  --adjudicate <canal> --new-value '<texto>'",
      "",
      "rem → px con la raiz DERIVADA de la cadena (--stats la imprime).",
      "em y % requieren base explicita.",
      "facade/artifacts/** excluido: son snapshots generados.",
    ].join("\n"),
  );
  return 0;
}

const invokedDirectly =
  process.argv[1] && resolvePath(process.argv[1]) === resolvePath(fileURLToPath(import.meta.url));
if (invokedDirectly) {
  main(process.argv.slice(2))
    .then((code) => {
      process.exitCode = code;
    })
    .catch((err) => {
      console.error(err);
      process.exitCode = 2;
    });
}
