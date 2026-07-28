/**
 * Build the CSS-var -> BrandTheme-field map mechanically.
 *
 * The compiler maps TS fields to CSS vars through several hand-written tables;
 * inverting them by reading is how the wrong field gets edited. Instead: set one
 * leaf at a time to a sentinel, recompile, and record which channels emit the
 * sentinel VERBATIM. Verbatim is also the AD-1 capability test — a field that
 * transforms its input cannot hold an extension value unchanged.
 *
 * Emits r1p/theme-paths.json: { <slug>: { <var>: [{path, controls}] } }
 */
import { writeFileSync } from 'node:fs';
import { loadSource, CORE_SPECIFIERS } from './source-loader.mjs';

const SENTINELS = ['#010203', '__W1_PROBE__', '424242'];

function leafPaths(node, prefix = [], out = []) {
  if (node === null || typeof node !== 'object') return out;
  for (const [key, value] of Object.entries(node)) {
    const path = [...prefix, key];
    if (value !== null && typeof value === 'object') leafPaths(value, path, out);
    else if (typeof value === 'string' || typeof value === 'number') out.push(path);
  }
  return out;
}

function getAt(obj, path) {
  return path.reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
}

function setAt(obj, path, value) {
  let node = obj;
  for (const key of path.slice(0, -1)) node = node[key];
  node[path.at(-1)] = value;
}

const m = await loadSource(CORE_SPECIFIERS);
const { compileBrandTheme } = m.compiler;
const THEMES = {
  bithire: m.bithire.bithireBrandTheme,
  evnto: m.evnto.evntoBrandTheme,
  rottay: m.platform.rottayBrandTheme,
};

const result = {};
for (const [slug, theme] of Object.entries(THEMES)) {
  const base = compileBrandTheme({ brandTheme: theme, tenantSlug: slug }).cssVariables;
  const paths = leafPaths(theme).filter((p) => p[0] !== 'id' && p[0] !== 'name');
  const byVar = {};
  let probed = 0;
  for (const path of paths) {
    const original = getAt(theme, path);
    for (const sentinel of SENTINELS) {
      if (String(original) === sentinel) continue;
      const clone = structuredClone(theme);
      setAt(clone, path, sentinel);
      let vars;
      try {
        vars = compileBrandTheme({ brandTheme: clone, tenantSlug: slug }).cssVariables;
      } catch {
        continue;
      }
      const verbatim = Object.keys(vars).filter((k) => vars[k] === sentinel && base[k] !== sentinel);
      const changed = Object.keys({ ...base, ...vars }).filter((k) => base[k] !== vars[k]);
      if (verbatim.length === 0) continue;
      for (const name of verbatim) {
        (byVar[name] ||= []).push({
          path: path.join('.'),
          controls: changed.length,
          controlsVars: changed,
          sentinel,
        });
      }
      break;
    }
    probed += 1;
  }
  for (const name of Object.keys(byVar)) {
    byVar[name].sort((a, b) => a.controls - b.controls || a.path.localeCompare(b.path));
  }
  result[slug] = { leafPathCount: probed, compiledVarCount: Object.keys(base).length, byVar };
  console.log(`${slug}: ${probed} leaf paths probed, ${Object.keys(byVar).length}/${Object.keys(base).length} compiled vars reachable verbatim`);
}

writeFileSync(
  '/private/tmp/rottay-design-platform-independent-audit-round-3/r1p/theme-paths.json',
  JSON.stringify(result, null, 2)
);
