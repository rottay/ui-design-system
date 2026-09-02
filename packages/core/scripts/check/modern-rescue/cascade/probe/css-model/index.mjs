/**
 * index.mjs — sheet assembly and the DECLARED, NARROW cascade model of
 * leg 1.
 *
 * SCOPE DECLARATION, read this before trusting any number this module emits.
 * Leg 1 does NOT adjudicate the cascade. Re-implementing selector matching,
 * specificity, `@layer` ordering and unlayered precedence in JavaScript would
 * be a second, unverified browser — exactly the false green this probe exists
 * to kill. What leg 1 resolves is one narrow, mechanically decidable slice:
 *
 *   THE ROOT ENVIRONMENT = custom-property declarations whose selector is
 *   root-equivalent (`:root`, `html`, `:host`, or a comma list containing one)
 *   AND whose at-rule stack contains no conditional rule (`@media`,
 *   `@supports`, `@container`). `@layer` blocks are allowed and their order is
 *   honoured.
 *
 * Every declaration of a probed channel that falls OUTSIDE that slice is kept
 * and reported as a COMPETING declaration. It is never dropped silently. A
 * channel with competing declarations is handed to leg 2, which is the only
 * authority on who wins.
 *
 * ARTIFACT MASK is the one cascade fact leg 1 does decide, because it needs no
 * matching at all: tenant artifacts are imported WITHOUT `layer(...)`
 * (facade/entrypoints/{rottay,bithire,evnto}.css), and an unlayered
 * declaration beats every layered one regardless of specificity. So a channel
 * redeclared inside `facade/artifacts/<tenant>/index.css` is MASKED under that
 * tenant: the edit in presentation/components is dead paint there.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { parseStylesheet, varReferences } from "../css-parsing/index.mjs";
import { repoRoot as findRepoRoot } from '../../../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = findRepoRoot(HERE);
export const CORE_ROOT = join(REPO_ROOT, "packages/core");
export const CSS_ROOT = join(CORE_ROOT, "src/foundation/tokens/css");

export const ENTRYPOINTS = {
  base: join(CSS_ROOT, "facade/entrypoints/base.css"),
  rottay: join(CSS_ROOT, "facade/entrypoints/rottay.css"),
  bithire: join(CSS_ROOT, "facade/entrypoints/bithire.css"),
  evnto: join(CSS_ROOT, "facade/entrypoints/evnto.css"),
};

const ROOT_EQUIVALENT = new Set([":root", "html", ":host", ":host(*)"]);

/**
 * File reader. `rev` selects a git revision; without it the working tree is
 * read. Both are cached. A file absent at the requested revision is reported,
 * never invented.
 */
export function makeReader({ rev = null, cwd = REPO_ROOT } = {}) {
  const cache = new Map();
  const missing = new Set();
  return {
    rev,
    missing,
    read(abs) {
      if (cache.has(abs)) return cache.get(abs);
      let text = null;
      if (rev) {
        const rel = relative(cwd, abs);
        try {
          text = execFileSync("git", ["show", `${rev}:${rel}`], {
            cwd,
            encoding: "utf8",
            maxBuffer: 64 * 1024 * 1024,
            stdio: ["ignore", "pipe", "pipe"],
          });
        } catch {
          text = null;
        }
      } else if (existsSync(abs)) {
        text = readFileSync(abs, "utf8");
      }
      if (text === null) missing.add(abs);
      cache.set(abs, text);
      return text;
    },
  };
}

function resolveImport(spec, fromAbs) {
  if (!spec) return null;
  if (spec.startsWith(".") || spec.startsWith("/")) {
    return resolve(dirname(fromAbs), spec);
  }
  // bare specifier: walk up looking for node_modules
  let dir = dirname(fromAbs);
  for (let i = 0; i < 12; i += 1) {
    const cand = join(dir, "node_modules", spec);
    if (existsSync(cand)) return cand;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

/**
 * Walk the @import graph of an entrypoint and return the ordered file list
 * with the layer each file lands in (null = unlayered = wins over every
 * layer).
 *
 * `unresolved` lists bare specifiers we could not locate. They are REPORTED,
 * not silently skipped — narrowing a set in silence is a program-law
 * violation.
 */
export function buildSheet(entryAbs, reader) {
  const files = [];
  const unresolved = [];
  let layerOrder = [];
  const seen = new Set();

  const walk = (abs, layer) => {
    if (seen.has(abs)) return;
    seen.add(abs);
    const text = reader.read(abs);
    if (text === null) {
      unresolved.push({ file: abs, reason: "not readable at this revision" });
      return;
    }
    const parsed = parseStylesheet(text, abs);
    for (const st of parsed.layerStatements) {
      if (layerOrder.length === 0 && st.names.length > 1) layerOrder = st.names;
    }
    // CSS requires @import to precede every other rule, so an importing file's
    // OWN declarations land after everything it pulls in. Emit children first.
    for (const imp of parsed.imports) {
      const target = resolveImport(imp.spec, abs);
      if (!target || reader.read(target) === null) {
        unresolved.push({
          from: relative(REPO_ROOT, abs),
          spec: imp.spec,
          line: imp.line,
          reason: target ? "not readable" : "bare specifier not resolved",
        });
        continue;
      }
      // an @import inside a layered file inherits that layer
      const nested = imp.layer === null ? layer : imp.layer || layer;
      walk(target, nested);
    }
    files.push({ abs, rel: relative(REPO_ROOT, abs), layer, text, parsed });
  };
  walk(entryAbs, null);
  return { files, layerOrder, unresolved };
}

function layerRank(layer, layerOrder) {
  if (layer === null || layer === undefined) return Number.MAX_SAFE_INTEGER;
  const base = layer.split(".")[0];
  const idx = layerOrder.indexOf(base);
  return idx < 0 ? layerOrder.length : idx;
}

function selectorList(sel) {
  if (!sel) return [];
  return sel
    .split(",")
    .map((s) => s.trim().replace(/\s+/g, " "))
    .filter(Boolean);
}

function isRootEquivalent(sel) {
  return selectorList(sel).some((s) => ROOT_EQUIVALENT.has(s));
}

function isConditional(atStack) {
  return atStack.some((a) => a.name !== "layer");
}

/**
 * Flatten a sheet into an ordered declaration index.
 * Every declaration keeps its file, line, selector, at-rule stack, layer and
 * document order, so nothing has to be re-derived downstream.
 */
export function indexDeclarations(sheet) {
  const out = [];
  sheet.files.forEach((f, fileIndex) => {
    f.parsed.declarations.forEach((d, k) => {
      out.push({
        ...d,
        rel: f.rel,
        layer: f.layer,
        layerRank: layerRank(f.layer, sheet.layerOrder),
        fileIndex,
        order: k,
        isCustom: d.prop.startsWith("--"),
        isArtifact: f.rel.includes("/facade/artifacts/"),
      });
    });
  });
  return out;
}

/**
 * Build the root environment plus the competing-declaration ledger.
 *
 * Winner rule inside the admitted slice (this is CSS cascade restricted to
 * equal specificity, which is what root-equivalent selectors give us):
 *   unlayered beats layered; later layer beats earlier; within one layer the
 *   later document position wins.
 */
export function buildRootEnvironment(decls) {
  const env = new Map();
  const winner = new Map();
  const competing = new Map();

  for (const d of decls) {
    if (!d.isCustom) continue;
    const admitted = isRootEquivalent(d.selector) && !isConditional(d.atStack);
    if (!admitted) {
      if (!competing.has(d.prop)) competing.set(d.prop, []);
      competing.get(d.prop).push(d);
      continue;
    }
    const prev = winner.get(d.prop);
    if (
      !prev ||
      d.layerRank > prev.layerRank ||
      (d.layerRank === prev.layerRank &&
        (d.fileIndex > prev.fileIndex ||
          (d.fileIndex === prev.fileIndex && d.order > prev.order)))
    ) {
      if (prev) {
        if (!competing.has(d.prop)) competing.set(d.prop, []);
        competing.get(d.prop).push(prev);
      }
      winner.set(d.prop, d);
    } else {
      if (!competing.has(d.prop)) competing.set(d.prop, []);
      competing.get(d.prop).push(d);
    }
  }
  for (const [name, d] of winner) env.set(name, d.value);
  return { env, winner, competing };
}

/**
 * Which tenants mask a channel, i.e. redeclare it inside an unlayered
 * artifact. Mechanical, no selector matching needed: the artifact import
 * carries no layer(), so it outranks every layered declaration.
 */
export function artifactMask(
  channels,
  tenants = ["rottay", "bithire", "evnto"],
  { artifactDir = join(CSS_ROOT, "facade/artifacts") } = {},
) {
  const mask = new Map();
  for (const tenant of tenants) {
    const abs = join(artifactDir, tenant, "index.css");
    if (!existsSync(abs)) continue;
    const parsed = parseStylesheet(readFileSync(abs, "utf8"), abs);
    const declared = new Map();
    for (const d of parsed.declarations) {
      if (d.prop.startsWith("--")) declared.set(d.prop, d);
    }
    for (const ch of channels) {
      if (!declared.has(ch)) continue;
      if (!mask.has(ch)) mask.set(ch, []);
      const d = declared.get(ch);
      mask.get(ch).push({
        tenant,
        line: d.line,
        value: d.value,
        rel: relative(REPO_ROOT, abs),
      });
    }
  }
  return mask;
}

/**
 * Reading sites: the non-custom property declarations that a channel actually
 * reaches, following custom-property hops. This is the END of the chain and it
 * is where a double application of a dial becomes visible — the channel alone
 * looks innocent.
 *
 * `maxDepth` bounds the reverse walk; the depth used is reported by the caller
 * so the set is a declared lower bound, never a silent narrowing.
 */
export function findReadingSites(decls, channels, { maxDepth = 6, filter = null } = {}) {
  const readers = new Map(); // channel -> declarations referencing it
  for (const d of decls) {
    if (d.isArtifact) continue;
    if (!d.value.includes("var(")) continue;
    for (const ref of new Set(varReferences(d.value))) {
      if (!readers.has(ref)) readers.set(ref, []);
      readers.get(ref).push(d);
    }
  }

  const sites = new Map(); // channel -> [{ decl, hops }]
  for (const ch of channels) {
    const found = [];
    const seenDecl = new Set();
    let frontier = [{ name: ch, hops: [] }];
    const visitedNames = new Set([ch]);
    for (let depth = 0; depth < maxDepth && frontier.length; depth += 1) {
      const nextFrontier = [];
      for (const node of frontier) {
        for (const d of readers.get(node.name) || []) {
          const key = `${d.rel}:${d.line}:${d.prop}`;
          if (d.isCustom) {
            if (visitedNames.has(d.prop)) continue;
            visitedNames.add(d.prop);
            nextFrontier.push({ name: d.prop, hops: [...node.hops, d.prop] });
            continue;
          }
          if (seenDecl.has(key)) continue;
          if (filter && !filter(d)) continue;
          seenDecl.add(key);
          found.push({ decl: d, hops: node.hops });
        }
      }
      frontier = nextFrontier;
    }
    sites.set(ch, found);
  }
  return sites;
}

export { isRootEquivalent, isConditional, layerRank };


/**
 * Build a side from in-memory sources instead of the on-disk import graph.
 * Used by the test suite so the negative controls are deterministic and never
 * depend on the state of the working tree.
 *
 * `sources` is [{ rel, layer, text }] in cascade order; `layer: null` means
 * unlayered, which is how the tenant artifacts actually enter.
 */
export function sheetFromSources(sources, layerOrder = []) {
  const files = sources.map((s) => ({
    abs: s.rel,
    rel: s.rel,
    layer: s.layer ?? null,
    text: s.text,
    parsed: parseStylesheet(s.text, s.rel),
  }));
  let order = layerOrder;
  for (const f of files) {
    for (const st of f.parsed.layerStatements) {
      if (order.length === 0 && st.names.length > 1) order = st.names;
    }
  }
  return { files, layerOrder: order, unresolved: [] };
}
