/**
 * The base environment: the static token layer's `:root` projection.
 *
 * WHY IT EXISTS. A compiled theme is not self-closed. Resolving a first-party
 * compilation against itself plus its declared fallbacks leaves roughly two
 * channels in five unresolvable, because the properties they read are declared
 * by the static DS token layer -- which is not compiled per tenant. The token
 * emitter therefore resolves against `compilation ⊃ base environment`, and this
 * module is the one producer of that second half.
 *
 * WHAT IT PROJECTS, and why the input is the committed bundle. The vertical's
 * CSS bundle is fonts + base tokens + modern engine + the tenant artifact, in
 * that order, and the artifact is written UNLAYERED so it outranks every layer
 * above it. The base environment is everything BEFORE the artifact: the part a
 * compilation legitimately sits on top of. Taking the committed mirror as the
 * input is what keeps the producer and the freshness gate reading one text
 * instead of two reconstructions of it.
 *
 * WHAT COUNTS AS THE ROOT. A declaration enters the projection when its rule
 * has an arm that can match the document root at the named mode, and it is not
 * inside a conditional at-rule. Container-scoped arms (`:not(:root)`), language
 * scopes and print/motion queries are excluded by construction: they describe
 * something other than the root document, and a projection that swallowed them
 * would report values the root never carries.
 *
 * THE WINNER is decided the way the browser decides it: cascade layer first
 * (an unlayered declaration outranks every layer), then selector specificity,
 * then source order.
 */

import { createHash } from 'node:crypto';
import { join } from 'node:path';

import postcss from 'postcss';

export const BASE_ENVIRONMENT_MODES = Object.freeze(['light', 'dark']);

export const BASE_ENVIRONMENT_DIR = 'artifacts/generated/tokens/base-environment';

export const baseEnvironmentPath = (coreRoot, vertical, mode) =>
  join(coreRoot, BASE_ENVIRONMENT_DIR, vertical, mode, 'index.json');

export const verticalBundlePath = (coreRoot, vertical) =>
  join(coreRoot, `artifacts/generated/css/verticals/${vertical}/index.css`);

/** The marker `css-build` writes ahead of the unlayered tenant artifact. */
export const tenantSectionMarker = (vertical) => `/* === ${vertical} tenant overrides`;

/**
 * Everything the bundle declares BEFORE its tenant artifact.
 *
 * A bundle with no marker is a defect rather than a bundle with no artifact:
 * projecting the whole text would fold the compilation into its own closure and
 * make every channel resolve against itself.
 */
export function staticBundleOf(bundleCss, vertical) {
  const marker = tenantSectionMarker(vertical);
  const cut = bundleCss.indexOf(marker);
  if (cut === -1) {
    throw new Error(
      `base-environment: the ${vertical} bundle carries no tenant-artifact marker; refusing to project the compilation into its own closure.`,
    );
  }
  return bundleCss.slice(0, cut);
}

/* ── selector reading ────────────────────────────────────────────────────── */

/** Split at top-level commas, respecting brackets and parentheses. */
function splitArms(selector) {
  const arms = [];
  let depth = 0;
  let current = '';
  for (const character of selector) {
    if (character === '(' || character === '[') depth += 1;
    else if (character === ')' || character === ']') depth -= 1;
    if (character === ',' && depth === 0) {
      arms.push(current.trim());
      current = '';
      continue;
    }
    current += character;
  }
  arms.push(current.trim());
  return arms.filter((arm) => arm.length > 0);
}

/** The top-level pieces of one compound: `:root`, `html`, `.dark`, `[a=b]`, `:is(...)`. */
function piecesOf(compound) {
  const pieces = [];
  let depth = 0;
  let current = '';
  for (const character of compound) {
    const starts = depth === 0 && ':.#['.includes(character);
    if (starts && current.length > 0) {
      pieces.push(current);
      current = '';
    }
    if (character === '(' || character === '[') depth += 1;
    else if (character === ')' || character === ']') depth -= 1;
    current += character;
  }
  if (current.length > 0) pieces.push(current);
  return pieces;
}

const DARK_MARKERS = [/^\.dark$/i, /^\[data-theme\s*[~|^$*]?=\s*["']?dark["']?\]$/i];
const LIGHT_MARKERS = [/^\[data-theme\s*[~|^$*]?=\s*["']?light["']?\]$/i];

/**
 * Read one compound: does it name the document root, and does it condition on a
 * colour mode? `null` means the compound describes something other than a root.
 */
function readCompound(compound) {
  const text = compound.trim();
  if (text.length === 0) return null;
  // A combinator means the subject has an ancestor, so the subject is not the
  // root. The root is always a single compound.
  if (/[\s>+~]/.test(stripGroups(text))) return null;
  let root = false;
  let mode = 'any';
  for (const piece of piecesOf(text)) {
    if (piece === ':root' || piece.toLowerCase() === 'html') {
      root = true;
      continue;
    }
    if (piece.startsWith(':is(') || piece.startsWith(':where(')) {
      const inner = splitArms(piece.slice(piece.indexOf('(') + 1, piece.lastIndexOf(')')));
      const read = inner.map((arm) => readCompound(arm));
      if (read.some((entry) => entry !== null && entry.root)) root = true;
      const modes = read.map((entry) => (entry === null ? 'reject' : entry.mode));
      // Every arm conditions on the same mode -> the group does too. A group
      // whose arms disagree conditions on nothing this projection can read.
      if (modes.every((entry) => entry === 'dark')) mode = narrow(mode, 'dark');
      else if (modes.every((entry) => entry === 'light')) mode = narrow(mode, 'light');
      else if (modes.some((entry) => entry === 'reject') && read.every((entry) => entry === null)) return null;
      continue;
    }
    if (DARK_MARKERS.some((marker) => marker.test(piece))) {
      mode = narrow(mode, 'dark');
      continue;
    }
    if (LIGHT_MARKERS.some((marker) => marker.test(piece))) {
      mode = narrow(mode, 'light');
      continue;
    }
    if (piece === ':not(:root)') return null;
    // Anything else -- a component class, a density scope, a language scope --
    // is a narrower subject than the root document.
    return null;
  }
  return root ? { root, mode } : null;
}

function narrow(current, next) {
  if (current === 'any') return next;
  return current === next ? current : 'conflict';
}

/** Blank bracketed and parenthesised groups so a combinator scan sees top level only. */
function stripGroups(text) {
  let depth = 0;
  let out = '';
  for (const character of text) {
    if (character === '(' || character === '[') depth += 1;
    if (depth === 0) out += character;
    if (character === ')' || character === ']') depth -= 1;
  }
  return out;
}

/** (id, class, type) specificity of one compound, the parts this projection can see. */
function specificityOf(compound) {
  const stripped = stripGroups(compound);
  const ids = (stripped.match(/#[\w-]+/g) ?? []).length;
  const classes =
    (stripped.match(/\.[\w-]+/g) ?? []).length +
    (compound.match(/\[[^\]]*\]/g) ?? []).length +
    (stripped.match(/:(?!:)(?!is\b|where\b|not\b)[\w-]+/g) ?? []).length;
  const types = /^[a-z]/i.test(stripped) ? 1 : 0;
  return ids * 10000 + classes * 100 + types;
}

/* ── the projection ──────────────────────────────────────────────────────── */

/** The declared layer order of the bundle, lowest first. Unlayered ranks above all. */
function declaredLayers(css) {
  const statement = css.replace(/\/\*[\s\S]*?\*\//g, '').match(/@layer\s+([^;{]+);/);
  if (!statement) return [];
  return statement[1].split(',').map((name) => name.trim());
}

const CONDITIONAL_AT_RULES = new Set(['media', 'supports', 'container']);

export function projectBaseEnvironment(bundleCss, { vertical, mode }) {
  if (!BASE_ENVIRONMENT_MODES.includes(mode)) {
    throw new Error(`base-environment: ${JSON.stringify(mode)} is not a declared mode.`);
  }
  const css = staticBundleOf(bundleCss, vertical);
  const layers = declaredLayers(css);
  const rank = (name) => {
    const index = layers.indexOf(name);
    return index === -1 ? layers.length : index;
  };
  const ast = postcss.parse(css);
  const winners = new Map();
  let order = 0;
  ast.walkDecls((declaration) => {
    order += 1;
    if (!declaration.prop.startsWith('--')) return;
    if (declaration.parent?.type !== 'rule') return;
    let layerRank = layers.length;
    let conditional = false;
    for (let node = declaration.parent; node && node.type !== 'root'; node = node.parent) {
      if (node.type !== 'atrule') continue;
      if (node.name === 'layer') {
        layerRank = Math.min(layerRank, rank(node.params.trim()));
        continue;
      }
      if (!CONDITIONAL_AT_RULES.has(node.name)) continue;
      // The one conditional that still describes the root document.
      const colourScheme = /prefers-color-scheme\s*:\s*(light|dark)/.exec(node.params);
      if (node.name === 'media' && colourScheme && colourScheme[1] === mode) continue;
      conditional = true;
    }
    if (conditional) return;
    let best = null;
    for (const arm of splitArms(declaration.parent.selector)) {
      const read = readCompound(arm);
      if (!read) continue;
      if (read.mode !== 'any' && read.mode !== mode) continue;
      const weight = specificityOf(arm) + (read.mode === mode ? 1 : 0);
      if (best === null || weight > best) best = weight;
    }
    if (best === null) return;
    const key = [layerRank, best, order];
    const held = winners.get(declaration.prop);
    if (!held || outranks(key, held.key)) {
      winners.set(declaration.prop, { key, value: declaration.value.trim() });
    }
  });
  const channels = {};
  for (const name of [...winners.keys()].sort()) channels[name] = winners.get(name).value;
  return { vertical, mode, channels, digest: digestOf({ vertical, mode, channels }) };
}

function outranks(candidate, held) {
  for (let index = 0; index < candidate.length; index += 1) {
    if (candidate[index] !== held[index]) return candidate[index] > held[index];
  }
  return false;
}

export const serializeBaseEnvironment = (document) => `${JSON.stringify(document, null, 2)}\n`;

export function digestOf({ vertical, mode, channels }) {
  return createHash('sha256')
    .update(JSON.stringify({ vertical, mode, channels }))
    .digest('hex');
}

/** The document as it is committed: generator provenance beside the projection. */
export function baseEnvironmentDocument(bundleCss, { vertical, mode }) {
  const projected = projectBaseEnvironment(bundleCss, { vertical, mode });
  return {
    generated: true,
    generator: 'scripts/libraries/tokens/base-environment/index.mjs',
    formatVersion: 1,
    vertical: projected.vertical,
    mode: projected.mode,
    channelCount: Object.keys(projected.channels).length,
    digest: projected.digest,
    channels: projected.channels,
  };
}
