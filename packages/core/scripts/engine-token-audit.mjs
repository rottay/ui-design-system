#!/usr/bin/env node
/**
 * engine-token-audit — the modern-engine motion/token ratchet (WO-ENG-01..12 gate).
 *
 * Counts the motion + token literals the Quiet Premium spec (engines/modern/README.md
 * section 12) drives to zero, and enforces a DECREASE-ONLY ratchet: no counter may rise above
 * its recorded baseline. WO-ENG-01 seeds the motion counters, WO-ENG-03 the depth counters,
 * WO-ENG-07 the scale counters (radius-scale-declarations, fallback-parity), WO-ENG-04 the
 * interaction-state counters (dark-focus-ring-defects, inline-state-literals), WO-ENG-06 the
 * color-purity counters (modernHexLiterals, modernRgbaLiterals), WO-ENG-08 the theme.css
 * drain counter (unreferencedSelectors), WO-ENG-09 the content-integrity counter
 * (content.magicZIndex), WO-ENG-10 the cross-engine layout counter; later WOs extend this
 * file with the remaining section-12 counters (responsive).
 *
 * WO-GAT-02 (package-side quality gates, proposal P-14) extends this same file rather than
 * forking a second script: (1) generalizes WO-ENG-08's modern-only theme.css dead-selector scan
 * into a shared `auditEngineTheme()` helper reused by two new decrease-only counters,
 * `themeCss.deadSelectorsClassic` and `themeCss.deadSelectorsRustic`, over the classic/rustic
 * engine theme files (classic allowlists `.ant-*` Ant Design runtime classes by prefix -- see
 * `auditEngineTheme`'s doc comment); (2) adds a `--coverage` mode/report (informational, not
 * gated) listing per-component-file `--ds-*` token consumption vs. hardcoded literals, plus a
 * one-line summary appended to `--check`/report output.
 *
 * Usage:
 *   node scripts/engine-token-audit.mjs            # print the current counts
 *   node scripts/engine-token-audit.mjs --check    # exit 1 if any counter rose above baseline
 *   node scripts/engine-token-audit.mjs --update-baseline   # tighten existing ceilings only
 *   node scripts/engine-token-audit.mjs --coverage # write the token-coverage report (informational)
 *   node scripts/engine-token-audit.mjs --current-json # emit current counters for reviewed tooling
 *   node scripts/engine-token-audit.mjs --check --quiet     # concise CI output
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync, renameSync } from 'node:fs';
import { countArc09PaintInFile } from './lib/inline-paint-counter.mjs';
import { countPremiumEffectConsumers } from './lib/effect-consumer-counter.mjs';
import { countMotionRecipeConsumers } from './lib/motion-recipe-consumer-counter.mjs';
import { countSkinExemptionBreaches } from './lib/skin-exemption-audit.mjs';
import { countRuntimeSvgPaintByFile } from './lib/runtime-svg-paint-counter.mjs';
import { countEmbeddedCssPaintByFile, countEmbeddedCssPaintInFile } from './lib/embedded-css-paint-counter.mjs';
import { ARC09_INLINE_PAINT_FILES, collectFleetInlinePaintSourceFiles } from './lib/fleet-inline-paint-census.mjs';
import { collectSourceFiles as collectRuntimeSvgSourceFiles } from './runtime-svg-paint-census.mjs';
import { countDeadParts } from './skin-dead-part-audit.mjs';
import {
  evaluateBaselineTightening,
  evaluateZeroLockCheck,
  summarizeZeroLocks,
} from './lib/zero-lock-policy.mjs';
import {
  ENGINE_TOKEN_EXACT as EXACT,
  ENGINE_TOKEN_MINIMUM as MIN,
} from './lib/engine-token-governance.mjs';
import postcss from 'postcss';
import { resolve, dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
// WO-GAT-04 (accessibility CI, proposal P-10): APCA is the perceptually-accurate contrast model
// (the successor to WCAG-2 ratios) used by the `a11y.apcaPairings` counter below. `apca-w3` is a
// ROOT devDependency (this script resolves it via Node's upward node_modules walk to the repo
// root, whichever workspace CWD invokes it). This is ADDITIVE gate machinery: it does NOT touch
// the shipped WCAG validator at src/foundation/kernel/accessibility/branding-contrast/index.ts (a published /server API).
import { calcAPCA } from 'apca-w3';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const componentsDir = join(root, 'src/ui');
const baselinePath = join(here, 'engine-token-audit.baseline.json');
const quiet = process.argv.includes('--quiet');

function argumentValue(name) {
  const prefix = `${name}=`;
  const inline = process.argv.find((arg) => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

/**
 * Collect every `engines/<engineName>.tsx` or `engines/<engineName>/*.tsx` component source
 * file under `dir`. Generalized (WO-GAT-02) from the modern-only file walk so the classic/
 * rustic dead-selector counters below can build their consumed-class sets from the SAME shared
 * scan helpers (`buildConsumedClassSet`, `auditEngineTheme`) that WO-ENG-08 built for modern --
 * one selector-scan implementation, three engine callers, per the ratchet law (never fork a
 * second scan).
 */
function collectEngineFiles(dir, engineName) {
  const out = [];
  const engineRe = new RegExp(`engines/${engineName}(/[^/]+)?\\.tsx?$`);
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...collectEngineFiles(full, engineName));
    } else if (engineRe.test(full.replace(/\\/g, '/'))) {
      out.push(full);
    }
  }
  return out;
}

/** Collect every modern-engine component source file (`engines/modern/index.tsx`). */
function modernFiles(dir) {
  return collectEngineFiles(dir, 'modern');
}

/**
 * Collect the color-purity file set (WO-ENG-06, spec section 6): every modern-engine
 * source file, `.tsx`/`.ts` OR `.css` -- the spec names the target as any `engines/modern*`
 * path ending in `.tsx`, `.ts`, or `.css`.
 * Today every modern-engine file is `.tsx` (one `.ts`); no `.css` sibling exists yet under an
 * `engines/modern/` path, so this currently returns the same set as modernFiles(), but the
 * `.css` branch is included so a future modern-engine stylesheet is covered automatically
 * instead of silently escaping the ratchet.
 */
function modernColorFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...modernColorFiles(full));
    } else if (/engines\/modern(\/[^/]+)?\.(tsx?|css)$/.test(full.replace(/\\/g, '/'))) {
      out.push(full);
    }
  }
  return out;
}

/** Strips `/* ... *\/` block comments (replacing their content with spaces, so offsets/line
 * counts are unaffected) before color-literal counting. JSDoc `@example` blocks on several
 * patterns (EnvironmentToggle, CalendarView, TenantPreview, Rate, ColorPicker) illustrate a
 * free-form `color`/`primaryColor` prop with a sample hex; that sample documents a prop SHAPE
 * for arbitrary consumer data, not a hardcoded engine chrome color, and a comment is never a
 * rendered color regardless. Line comments (`//`) are deliberately NOT stripped: no exemption
 * found in this codebase needed it, and naively stripping `//` risks eating real code that
 * follows a `//` inside a string (e.g. a URL). */
function stripBlockComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
}

/**
 * Count hardcoded hex and rgba/rgb color literals across the color-purity file set (WO-ENG-06,
 * spec section 6: "Zero hardcoded colors in engine component files"). Counting method:
 *  - hex: `#` + 3, 4, 6, or 8 hex digits at a word boundary, EXCLUDING a `#` immediately
 *    preceded by `&` -- that is an HTML numeric character entity (`&#10003;` a checkmark,
 *    `&#171;`/`&#187;` guillemets, `&#9654;`/`&#9660;` triangles -- literal glyph content in a
 *    few components, never a color) and would otherwise false-positive (`&#10003;` reads as
 *    hex digits 1/0/0/0/3).
 *  - rgba: `rgb(` or `rgba(` as a literal function call.
 *  - Both are counted after stripBlockComments() removes comment content (see above).
 *  - NOT exempted -- counts as real, tracked residual: hex/rgba used as color-MATH
 *    inputs/outputs over arbitrary, non-token data. Two concrete cases, both left in place and
 *    documented in the WO-ENG-06 report rather than routed through a token:
 *      1. TenantPreview's mixColor()/hexToRgb()/getContrastColor() helpers interpolate a
 *         TENANT-SUPPLIED brand hex toward true white/black to derive a live preview palette,
 *         then display the literal computed hex in a tooltip (`title={`${step}: ${color}`}`) --
 *         the value must be a real hex string, and "true white"/"true black" are
 *         theme-invariant interpolation endpoints, not chrome that should shift with branding.
 *      2. ColorPicker's toRgbString() conversion and its native `<input type="color">`
 *         defaultValue -- the DOM color input's value attribute requires a literal `#rrggbb`
 *         string; `var(--ds-color-*)` is not a valid value there.
 *  - Data URIs are exempt implicitly: this codebase's modern-engine files contain none, so no
 *    special-case was needed, but a `data:` URI hex/rgba (e.g. inside an inlined SVG or base64
 *    image) would be a false positive the same way HTML entities are, not a real color.
 * Target: 0 / 0. Current documented residual: 13 hex (TenantPreview 12 + ColorPicker 1) + 1
 * rgba (ColorPicker) -- see the WO-ENG-06 report for the full per-file accounting.
 *
 * The scan itself lives in `countColorLiteralsInText()` (per-text, below), factored out so the
 * WO-GAT-02 `--coverage` report can reuse the EXACT same detection rule per file instead of
 * forking a second regex that could drift from this counter's definition of "a color literal".
 * Callers must pass text already run through `stripBlockComments()`.
 */
/**
 * Attributes whose value is text a user reads, not a colour a component paints.
 * A hex inside one of these is copy. WO-ENG-06 changed `placeholder="#000000"`
 * to `placeholder="#RRGGBB"` to lower this counter, which lowered the counter
 * and changed what the ColorPicker shows the user; its test had been red ever
 * since. A counter that cannot tell a style from a string will be paid in copy.
 */
const CONTENT_ATTRIBUTE_RE =
  /\b(?:placeholder|aria-label|aria-placeholder|title|alt)\s*=\s*(?:"[^"]*"|'[^']*'|\{`[^`]*`\})/g;

/**
 * Class names DaisyUI actually paints, verified against the `daisyui@5.5.19`
 * package source rather than this repo's theme.css, which can be stale.
 *
 * DaisyUI is TENANTED -- a bare `.alert` computes each tenant's own
 * `--color-base-200`, which every artifact declares unlayered -- so a class here
 * is not a white-label defect. It is residue: `modern` is documented as the
 * Rottay-native premium skin, and every one of these files makes that sentence
 * less true. Decrease-only, so the residue can only shrink.
 */
const DAISY_PAINTED_CLASSES = [
  'alert',
  'skeleton',
  'step',
  'steps',
  'link',
  'breadcrumbs',
  'rating',
  'range',
  'progress',
  'radial-progress',
  'stat-title',
  'stat-value',
  'carousel',
  'carousel-item',
  'timeline',
  'timeline-middle',
  'timeline-start',
  'toast',
  'toast-top',
  'toast-bottom',
  'modal',
  'modal-open',
  'modal-box',
  'modal-backdrop',
  'modal-action',
];

/** Engine files that render at least one DaisyUI class in a real `className`. */
function countDaisyClassConsumers(files) {
  const painted = new Set(DAISY_PAINTED_CLASSES);
  let consumers = 0;
  for (const file of files) {
    const text = stripBlockComments(readFileSync(file, 'utf8'));
    // Only literal class strings assigned to className, never a doc comment and
    // never `Array.prototype.join`.
    const attrs = text.matchAll(/className=(?:\{?\s*)?(?:`([^`]*)`|"([^"]*)"|'([^']*)')/g);
    let hit = false;
    for (const m of attrs) {
      const value = m[1] ?? m[2] ?? m[3] ?? '';
      for (const token of value.split(/[\s${}]+/)) {
        if (painted.has(token)) {
          hit = true;
          break;
        }
      }
      if (hit) break;
    }
    if (hit) consumers += 1;
  }
  return consumers;
}

function countColorLiteralsInText(strippedText) {
  const withoutContentAttributes = strippedText.replace(CONTENT_ATTRIBUTE_RE, '');
  const hexRe = /(?<!&)#[0-9a-fA-F]{3,8}\b/g;
  const rgbaRe = /\brgba?\(/g;
  return {
    hex: (withoutContentAttributes.match(hexRe) || []).length,
    rgba: (withoutContentAttributes.match(rgbaRe) || []).length,
  };
}

/** Aggregate `countColorLiteralsInText()` across a file list -- see that function's doc for the
 * counting method. */
function countColorLiterals(files) {
  let hex = 0;
  let rgba = 0;
  for (const file of files) {
    const text = stripBlockComments(readFileSync(file, 'utf8'));
    const perFile = countColorLiteralsInText(text);
    hex += perFile.hex;
    rgba += perFile.rgba;
  }
  return { hex, rgba };
}

/** The motion token names components consume that the canon must define (else they resolve to fallbacks). */
const ORPHAN_MOTION_NAMES = [
  '--ds-motion-duration-fast',
  '--ds-motion-duration-slow',
  '--ds-motion-base',
  '--ds-motion-gentle',
  '--ds-motion-easing-ease-in-out',
];

/**
 * Per-text motion-literal scan (cubic-bezier + raw interaction durations), factored out of
 * `countMotionLiterals()` so the WO-GAT-02 `--coverage` report can reuse the EXACT same
 * detection rules per file instead of forking a second regex set (see
 * `countColorLiteralsInText` above for the same rationale).
 */
function countMotionLiteralsInText(text) {
  let cubicBezier = 0;
  let rawDuration = 0;
  const cubicRe = /cubic-bezier\(/g;
  // Forbidden = INTERACTION-motion literals (< 1s). Milliseconds are always interaction
  // durations; seconds are counted only when < 1s. Durations >= 1s are loop/shimmer/spinner
  // tempos that legitimately sit outside the 120/200/320 canon and are allowlisted.
  const msRe = /\b\d+(?:\.\d+)?ms\b/g;
  const sRe = /(?<![\w.])(\d*\.?\d+)s(?![\w])/g;
  cubicBezier += (text.match(cubicRe) || []).length;
  rawDuration += (text.match(msRe) || []).length;
  for (const m of text.matchAll(sRe)) {
    if (Number(m[1]) < 1) rawDuration += 1; // sub-second seconds are interaction durations
  }
  return { cubicBezier, rawDuration };
}

function countMotionLiterals(files) {
  let cubicBezier = 0;
  let rawDuration = 0;
  let orphanTokens = 0;
  const orphanRe = new RegExp(ORPHAN_MOTION_NAMES.map((n) => n.replace(/[-]/g, '\\-')).join('|'), 'g');
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    const perFile = countMotionLiteralsInText(text);
    cubicBezier += perFile.cubicBezier;
    rawDuration += perFile.rawDuration;
    orphanTokens += (text.match(orphanRe) || []).length;
  }
  return { cubicBezier, rawDuration, orphanTokens };
}

const tokensCssDir = join(root, 'src/foundation/tokens/css');
const artifactsDir = join(tokensCssDir, 'facade/artifacts');

/** Recursively collect every `.css` file under a directory. */
function cssFilesUnder(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...cssFilesUnder(full));
    else if (full.endsWith('.css')) out.push(full);
  }
  return out;
}

/** NTSC perceived luminance (0-255) of a 6-digit hex color. */
function luminanceHex(hex) {
  const n = Number.parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255;
  return r * 0.299 + g * 0.587 + b * 0.114;
}

/**
 * Count elevation/shadow SCALE definition sites at the foundation/engine layer
 * (tenant artifacts are surface-adaptive overrides of the one scale, not scales).
 * The single source of truth is one --ds-elevation-* ramp defined with literal
 * box-shadow values; --ds-shadow-* must be var() aliases of it. A parallel
 * --ds-shadow-* ramp defined with literal values counts as a second scale.
 * Target: exactly 1.
 */
function countShadowScales() {
  const files = [
    ...cssFilesUnder(join(tokensCssDir, 'foundation')),
    ...cssFilesUnder(join(tokensCssDir, 'runtime/engines')),
  ];
  let scales = 0;
  for (const f of files) {
    const t = readFileSync(f, 'utf8');
    if (/--ds-elevation-1:\s*(?!var\()[^;]*(?:rgba?\(|px|none)/.test(t)) scales += 1;
    if (/--ds-shadow-(?:sm|md|lg):\s*(?!var\()[^;]*(?:rgba?\(|px)/.test(t)) scales += 1;
  }
  return scales;
}

/**
 * Count depth declarations that resolve to a pure-black-only value in the dark
 * region of a dark-surface tenant artifact. Covers the elevation ramp AND the
 * tokens components actually consume for depth (--ds-shadow-xs..2xl,
 * --ds-card-shadow / -hover / -elevated), since a pure-black value on any of them
 * renders flat on a dark canvas. A dark-surface depth token must carry a hairline
 * highlight (white) and/or a primary glow — in practice by aliasing the dark
 * --ds-elevation-* ramp. Target: 0.
 */
function countDarkPureBlackElevations() {
  if (!existsSync(artifactsDir)) return 0;
  let count = 0;
  for (const slug of readdirSync(artifactsDir)) {
    const file = join(artifactsDir, slug, 'index.css');
    if (!existsSync(file)) continue;
    const css = readFileSync(file, 'utf8');
    const bg = css.match(/--ds-color-bg-primary:\s*(#[0-9a-fA-F]{6})/);
    if (!bg || luminanceHex(bg[1]) >= 128) continue; // not a dark-surface tenant
    // Split off the light-mode counterpart block (a POSITIVE light selector, not the
    // dark block's own `:not([data-theme='light'])` scope) so only the dark region
    // is scanned.
    const lightIdx = css.search(/(?<!:not\()\[data-theme=['"]light['"]\]|(?<!:not\()\.light(?=[\s,{])/);
    const darkRegion = lightIdx >= 0 ? css.slice(0, lightIdx) : css;
    const depthToken =
      /--ds-(?:elevation-[1-5]|shadow-(?:xs|sm|md|lg|xl|2xl)|card-shadow(?:-hover|-elevated)?):\s*([^;]+);/g;
    for (const m of darkRegion.matchAll(depthToken)) {
      const val = m[1].trim();
      if (val === 'none') continue;
      const hasHighlight = /255/.test(val) || /color-mix|var\(--ds-color-primary/.test(val);
      const isBlackShadow = /rgba?\(\s*0\s*,\s*0\s*,\s*0/.test(val);
      if (isBlackShadow && !hasHighlight) count += 1;
    }
  }
  return count;
}

/**
 * Count radius SCALE definition sites at the foundation/engine layer (tenant
 * artifacts and legacy tenant files are tenant-specific overrides, not scales
 * - same convention as countShadowScales). The single source of truth is
 * foundation/themes/default.css's literal --ds-radius-sm/md/lg/xl/full block;
 * every other consumer (including the component-specific --ds-radius-button/
 * -card/... aliases in foundation/base/borders.css) must reference it via
 * var(), never redeclare the literal scale. A "declaration site" requires TWO
 * core scale keys (sm AND md) defined with a literal px/rem value in the same
 * file, to avoid flagging a lone component-specific alias. Target: exactly 1.
 */
function countRadiusScaleDeclarations() {
  const files = [
    ...cssFilesUnder(join(tokensCssDir, 'foundation')),
    ...cssFilesUnder(join(tokensCssDir, 'runtime/engines')),
  ];
  let scales = 0;
  for (const f of files) {
    const t = readFileSync(f, 'utf8');
    if (/--ds-radius-sm:\s*(?!var\()[^;]*(?:px|rem)/.test(t) && /--ds-radius-md:\s*(?!var\()[^;]*(?:px|rem)/.test(t)) {
      scales += 1;
    }
  }
  return scales;
}

const foundationDir = join(tokensCssDir, 'foundation');

/**
 * Extract `--name: value;` declarations from the unscoped `:root { ... }`
 * blocks of a CSS file (skips dark-mode/tenant/@media-nested `:root` overrides
 * so only the base scale is captured - a nested block reads as a DIFFERENT
 * selector, e.g. "@media (...) {" or "html.dark", never bare ":root").
 */
function rootScopedDeclarations(text) {
  const out = [];
  const declRe = /(--[a-zA-Z0-9-]+)\s*:\s*([^;]+);/g;
  let i = 0;
  while (i < text.length) {
    if (text[i] === '{') {
      let depth = 1;
      let j = i + 1;
      while (j < text.length && depth > 0) {
        if (text[j] === '{') depth += 1;
        else if (text[j] === '}') depth -= 1;
        j += 1;
      }
      const content = text.slice(i + 1, j - 1);
      const prevClose = text.lastIndexOf('}', i - 1);
      const selStart = prevClose === -1 ? 0 : prevClose + 1;
      const selector = text
        .slice(selStart, i)
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .trim();
      if (selector === ':root') {
        for (const m of content.matchAll(declRe)) out.push([m[1], m[2].trim()]);
      }
      i = j;
    } else {
      i += 1;
    }
  }
  return out;
}

/** Build a name -> raw-value map from every foundation CSS file's base :root block.
 * `themes/default.css` is read first and wins ties: it is the file the CSS entrypoint
 * imports LAST among the foundation layer (entrypoints/styles.css), so for any name
 * declared in more than one foundation file, its value is the one that actually wins
 * the cascade (e.g. base/spacing.css's semantic --ds-spacing-xs..xl ladder duplicates
 * different values than default.css's - default.css is the one real pages render). */
function buildTokenDefinitions() {
  const defs = new Map();
  const priorityFile = join(foundationDir, 'themes/default.css');
  const rest = cssFilesUnder(foundationDir).filter((f) => f !== priorityFile);
  for (const f of [priorityFile, ...rest]) {
    if (!existsSync(f)) continue;
    const text = readFileSync(f, 'utf8');
    for (const [name, raw] of rootScopedDeclarations(text)) {
      if (!defs.has(name)) defs.set(name, raw);
    }
  }
  return defs;
}

/** Follow a `var(--name, fallback)` chain (any `--` custom property, prefixed
 * or not - the DS-prefixed aliases in transitions.css point at unprefixed
 * legacy names) to its concrete literal value. Returns null if it bottoms out
 * on an undefined name with no fallback, or on a cycle. */
function resolveToken(name, defs, seen = new Set()) {
  if (seen.has(name)) return null;
  seen.add(name);
  const raw = defs.get(name);
  if (raw === undefined) return null;
  const m = /^var\(\s*(--[a-zA-Z0-9-]+)\s*(?:,\s*([\s\S]*))?\)$/.exec(raw);
  if (!m) return raw;
  const [, inner, fallback] = m;
  const resolved = resolveToken(inner, defs, seen);
  if (resolved !== null) return resolved;
  return fallback !== undefined ? fallback.trim() : null;
}

/** Normalize a simple scalar CSS value (px/rem/em/ms/s/bare number) to a
 * [unit, number] bucket for comparison; returns null for anything else
 * (colors, multi-value shorthands, keywords, cubic-bezier, ...) - those are
 * out of scope for this check (see module doc). */
function normalizeScalar(value) {
  const m = /^(-?\d*\.?\d+)(px|rem|em|ms|s)?$/.exec(value.trim());
  if (!m) return null;
  const num = Number(m[1]);
  const unit = m[2] || '';
  if (unit === 'rem') return ['px', num * 16];
  if (unit === 's') return ['ms', num * 1000];
  if (unit === '') return ['num', num];
  return [unit, num];
}

/**
 * Count `var(--ds-token, fallback)` usages across packages/core/src where the
 * fallback is a simple numeric scalar (px/rem/em/ms/s/bare) that disagrees
 * with the token's foundation-defined value. Scoped to scalar fallbacks only:
 * color/gradient fallbacks are tenant-branded (no single "correct" value) and
 * multi-value shorthands (e.g. modal header padding `16px 24px` vs a
 * single-value token) need per-component design judgment, not a mechanical
 * check - both are intentionally out of scope here, not silently "passing".
 * SVG presentation-attribute usages (D3 `.attr('rx', 'var(...)')`) are
 * excluded: those are DOM attributes, not CSS property values, so CSS
 * fallback-parity doesn't apply the same way. Target: 0 (decrease-only ratchet).
 */
function countFallbackParityViolations() {
  const defs = buildTokenDefinitions();
  const usageRe = /var\(\s*(--ds-[a-zA-Z0-9-]+)\s*,\s*([^,()]+)\)/g;
  const srcDir = join(root, 'src');
  let violations = 0;

  function walk(dir) {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const rel = full.slice(srcDir.length + 1).replace(/\\/g, '/');
      if (rel.startsWith('foundation/tokens/css/facade/artifacts/') || rel.startsWith('foundation/tokens/css/facade/legacy/')) continue;
      if (statSync(full).isDirectory()) {
        walk(full);
        continue;
      }
      if (!/\.(tsx?|css)$/.test(full)) continue;
      if (/__tests__|\.(test|spec|stories)\./.test(rel)) continue;
      const text = readFileSync(full, 'utf8');
      for (const m of text.matchAll(usageRe)) {
        const token = m[1];
        const fallback = m[2].trim();
        if (fallback.includes('$') || fallback.includes('`') || fallback.includes('{')) continue; // dynamic, not a literal
        const precedingContext = text.slice(Math.max(0, m.index - 40), m.index);
        if (/\.attr\(\s*['"][a-zA-Z-]+['"]\s*,\s*['"]?$/.test(precedingContext)) continue; // SVG attribute, not CSS
        const fallbackNorm = normalizeScalar(fallback);
        if (fallbackNorm === null) continue; // not a simple scalar (color, shorthand, keyword)
        const resolved = resolveToken(token, defs);
        if (resolved === null) continue; // undefined token: a different defect (orphan name), not parity
        const resolvedNorm = normalizeScalar(resolved);
        if (resolvedNorm === null) continue; // token itself isn't a simple scalar (color, composite)
        if (resolvedNorm[0] !== fallbackNorm[0]) continue; // incomparable units, don't guess
        if (Math.abs(resolvedNorm[1] - fallbackNorm[1]) > 1e-6) violations += 1;
      }
    }
  }
  walk(srcDir);
  return violations;
}

/**
 * Decide whether a resolved focus-ring color is "dark-blind": too dark or too
 * faint to read as a >=3:1 ring against a dark canvas (#0A0A0C-class surfaces).
 * - hex: perceived luminance below ~96/255 is too dark to see on a dark canvas.
 * - rgb()/rgba(): near-black channels (all < 60), or alpha below 0.35, disappear.
 * - keywords (white), color-mix(...var(--ds-color-primary...)), and light hex
 *   pass (a light/saturated ring is exactly what the contract requires).
 */
function isDarkBlindFocusColor(value) {
  const v = value.trim().toLowerCase();
  if (v === 'transparent') return true;
  const hex = /^#([0-9a-f]{6})$/.exec(v);
  if (hex) return luminanceHex('#' + hex[1]) < 96;
  const hex3 = /^#([0-9a-f]{3})$/.exec(v);
  if (hex3) {
    const [r, g, b] = hex3[1].split('').map((c) => parseInt(c + c, 16));
    return r * 0.299 + g * 0.587 + b * 0.114 < 96;
  }
  const rgb = /^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)\s*(?:[,/]\s*([\d.]+%?))?\s*\)$/.exec(v);
  if (rgb) {
    const [r, g, b] = [rgb[1], rgb[2], rgb[3]].map(Number);
    let alpha = 1;
    if (rgb[4] !== undefined) alpha = rgb[4].endsWith('%') ? Number(rgb[4].slice(0, -1)) / 100 : Number(rgb[4]);
    if (alpha < 0.35) return true;
    if (r < 60 && g < 60 && b < 60) return true;
    return false;
  }
  // named "white"/"whitesmoke"/etc. and color-mix / var-driven values are treated
  // as visible (the dark override is expected to be light/saturated).
  return false;
}

/**
 * Count dark-surface tenant artifacts whose EFFECTIVE dark focus-ring color is
 * dark-blind (WO-ENG-04 interaction-state contract). The audit-3.4 defect is a
 * focus ring that resolves near-black / low-alpha on a dark canvas, so no ring
 * is visible. For each dark-surface tenant (default --ds-color-bg-primary is
 * dark) the effective ring color is the dark region's --ds-focus-ring-color, or,
 * when absent, the inherited default var(--ds-color-primary) — resolved one hop
 * to that region's --ds-color-primary. A dark-blind result counts. Target: 0.
 */
function countDarkFocusRingDefects() {
  if (!existsSync(artifactsDir)) return 0;
  let count = 0;
  for (const slug of readdirSync(artifactsDir)) {
    const file = join(artifactsDir, slug, 'index.css');
    if (!existsSync(file)) continue;
    const css = readFileSync(file, 'utf8');
    const bg = css.match(/--ds-color-bg-primary:\s*(#[0-9a-fA-F]{6})/);
    if (!bg || luminanceHex(bg[1]) >= 128) continue; // not a dark-surface tenant
    const lightIdx = css.search(/(?<!:not\()\[data-theme=['"]light['"]\]|(?<!:not\()\.light(?=[\s,{])/);
    const darkRegion = lightIdx >= 0 ? css.slice(0, lightIdx) : css;
    const resolvePrimary = () => {
      const p = darkRegion.match(/--ds-color-primary:\s*([^;]+);/);
      return p ? p[1].trim() : null;
    };
    let val;
    const explicit = darkRegion.match(/--ds-focus-ring-color:\s*([^;]+);/);
    if (explicit) {
      val = explicit[1].trim();
      const varRef = /^var\(\s*(--[a-zA-Z0-9-]+)\s*(?:,\s*([^)]+))?\)$/.exec(val);
      if (varRef) {
        if (varRef[1] === '--ds-color-primary') val = resolvePrimary() ?? val;
        else {
          const inner = darkRegion.match(new RegExp(`${varRef[1]}:\\s*([^;]+);`));
          val = inner ? inner[1].trim() : varRef[2] ? varRef[2].trim() : val;
        }
      }
    } else {
      // No dark override: the ring inherits the foundation default
      // var(--ds-color-primary); resolve it in this dark region.
      val = resolvePrimary();
      if (val === null) continue; // no dark primary literal to test
    }
    if (val && isDarkBlindFocusColor(val)) count += 1;
  }
  return count;
}

/**
 * Flagship interactive components whose modern engines must consume the state
 * contract tokens (press scale, focus ring, elevation), not inline literals.
 */
const FLAGSHIP_STATE_FILES = [
  'primitives/inputs/Button/engines/modern/index.tsx',
  'primitives/inputs/Input/engines/modern/index.tsx',
  'primitives/inputs/Select/engines/modern/index.tsx',
  'primitives/navigation/Tabs/engines/modern/index.tsx',
];

function requireUiSource(relativePath, owner) {
  const full = join(componentsDir, relativePath);
  if (!existsSync(full) || !statSync(full).isFile()) {
    throw new Error(`${owner} requires canonical UI source: ${relativePath}`);
  }
  return full;
}

/**
 * Count inline per-component interaction-state literals in the flagship modern
 * engines (WO-ENG-04): a hardcoded press/scale factor (`scale(0.98)` — not
 * `scale(var(...))`) or a focus/hover box-shadow / outline carrying a hardcoded
 * color literal (rgb/rgba/hex) instead of a token. These are the values that
 * must live in the tokenized state contract. Target: 0 (decrease-only ratchet).
 */
function countInlineStateLiterals() {
  const scaleRe = /scale\(\s*0?\.\d+\s*\)/g; // scale(0.98) / scale(.98), not scale(var(...))
  const shadowLiteralRe =
    /(?:box-?shadow|boxShadow|outline)\s*:?\s*['"]?[^;'"\n]*(?:rgba?\([^)]*\)|#[0-9a-fA-F]{3,8}\b)/gi;
  let count = 0;
  for (const rel of FLAGSHIP_STATE_FILES) {
    const full = requireUiSource(rel, 'inline-state audit');
    const text = readFileSync(full, 'utf8');
    count += (text.match(scaleRe) || []).length;
    count += (text.match(shadowLiteralRe) || []).length;
  }
  return count;
}

/**
 * WO-ARC-09: inline PAINT that has not yet moved to an unlayered skin.
 *
 * The paint migration's positive "no inline paint" gate (Fable advisory Q4).
 * Counts paint property NAMES inside `style={{ … }}` object literals in the
 * migratable files of the six workspace-tier components — the modern + rustic
 * engine files plus the five engine-agnostic files (the two structures and the
 * three shared data-table files). classic is excluded BY CONSTRUCTION: Ant
 * Design keeps its own paint, so a classic `style={{}}` is not a migration
 * target. Per file, decrease-only; each component's checkpoint drives its files
 * to 0 (data-table's virtual-offset transform is the one documented residual,
 * handled at that checkpoint).
 *
 * Paint vs layout is decided by the property-NAME class, never by a value regex
 * (that is the axis `inlineStateLiterals` gets wrong in both directions). The
 * counted names are background*, border*, outline*, color, boxShadow,
 * textShadow, fill, stroke, accentColor, filter, backdropFilter and transform
 * (a state transform is paint — ARC-07 moved `translateY(0)` into CSS). Layout
 * (size/padding/margin/flex/grid/position/zIndex/display/overflow), the ARC-08
 * container contract (containerType/containerName), runtime-measured dynamics
 * (column widths, virtual offsets) and the two residuals ARC-07 kept (opacity,
 * animation) are NOT paint names, so they never enter the count. `borderCollapse`
 * and `borderSpacing` match `border*` but are table box-model layout, so they
 * are subtracted back out.
 *
 * Bounding to `style={{}}` spans (not a whole-file regex like fixedWidthLiterals)
 * matters here: `filter:` and `transform:` are also data-table/filter-panel
 * config keys, and only the ones inside an inline style object are paint.
 */
/** Per-file `arc09.inlinePaint.<path>` counters, spread into the counter map. */
function arc09InlinePaintCounters() {
  const out = {};
  for (const rel of ARC09_INLINE_PAINT_FILES) {
    const full = requireUiSource(rel, 'ARC-09 inline-paint audit');
    out[`arc09.inlinePaint.${rel}`] = countArc09PaintInFile(readFileSync(full, 'utf8'), full);
  }
  return out;
}

/**
 * Per-file `fleet.inlinePaint.<path>` counters for the WO-SKIN lane: every
 * TypeScript source admitted by the historical skin-census law below
 * primitives/patterns/structures/surfaces, including files currently at zero.
 * That law intentionally retains the already-baselined `story-helpers.tsx` and
 * `test-utils.tsx` files (7 sites total); it excludes actual test/story catalog
 * files, classic engines and the thirteen ARC-09-owned paths. Decrease-only,
 * using the exact lexer ARC-09 uses. Dynamic enumeration means a new file cannot
 * bypass the ratchet and a deleted file cannot silently remove its key;
 * reverse-presence checking below owns the latter half.
 */
function fleetInlinePaintCounters() {
  const sourceFiles = collectFleetInlinePaintSourceFiles(componentsDir);
  const out = {
    'fleet.inlinePaint.filesScanned': sourceFiles.length,
  };
  let total = 0;
  for (const file of sourceFiles) {
    const rel = relative(componentsDir, file).replaceAll('\\', '/');
    const count = countArc09PaintInFile(readFileSync(file, 'utf8'), file);
    out[`fleet.inlinePaint.${rel}`] = count;
    total += count;
  }
  out['fleet.inlinePaint.total'] = total;
  return out;
}

/**
 * Per-file runtime-SVG paint ratchet for the whole productive component tree.
 *
 * The inline-paint lexer cannot see D3 setters, intrinsic SVG JSX attributes,
 * or DOM `setAttribute` writes. The AST counter covers those channels over the
 * whole productive component tree and intentionally emits a key for every source
 * file, including current zeros: a new file or a reintroduced site therefore
 * cannot hide behind a stale, hand-maintained renderer list. `count` includes
 * computed property names classified fail-closed as possible paint. The
 * aggregate unclassified counter catches a refactor from a literal paint name
 * to a computed alias even when that file's total site count stays unchanged.
 *
 * Canvas paint is a separate channel. Structural SVG values (`none`,
 * `currentColor`, local paint-server references and nullish removals) are
 * reported separately so the checkpoint can prove their disposition without
 * misrepresenting them as authored colour decisions.
 */
function runtimeSvgPaintCounters() {
  const sourceFiles = collectRuntimeSvgSourceFiles(componentsDir, {
    productionOnly: true,
  });
  const result = countRuntimeSvgPaintByFile(sourceFiles);
  const out = {
    // These two sentinels make collector deletion/collapse observable even when
    // every per-file key would otherwise disappear from the current map.
    'runtimeSvgPaint.filesScanned': Object.keys(result.files).length,
    'runtimeSvgPaint.total': result.total,
    'runtimeSvgPaint.unclassified': result.unclassified,
    'runtimeSvgPaint.ignoredStructural': result.ignoredStructural,
  };

  for (const [file, counts] of Object.entries(result.files)) {
    const rel = relative(componentsDir, file).replaceAll('\\', '/');
    out[`runtimeSvgPaint.${rel}`] = counts.count;
  }
  return out;
}

/**
 * Per-file ratchet for source-authored paint declarations inside real injected
 * CSS strings/templates. This is intentionally separate from JavaScript inline
 * paint and runtime SVG/D3 paint: one channel cannot pay down another. Every
 * productive component source emits a key, including current zeros; parse
 * failures and computed CSS property names count fail-closed.
 */
function embeddedCssPaintCounters() {
  const sourceFiles = collectRuntimeSvgSourceFiles(componentsDir, {
    productionOnly: true,
  });
  const result = countEmbeddedCssPaintByFile(sourceFiles);
  const out = {
    'embeddedCssPaint.filesScanned': Object.keys(result.files).length,
    'embeddedCssPaint.total': result.total,
    'embeddedCssPaint.classifiedPaint': result.classifiedPaint,
    'embeddedCssPaint.unclassified': result.unclassified,
    'embeddedCssPaint.parseFailures': result.parseFailures,
    'embeddedCssPaint.dynamicProperties': result.dynamicProperties,
    'embeddedCssPaint.unknownSinks': result.unknownSinks,
  };
  for (const [file, counts] of Object.entries(result.files)) {
    const rel = relative(componentsDir, file).replaceAll('\\', '/');
    out[`embeddedCssPaint.${rel}`] = counts.count;
  }
  return out;
}

/**
 * Count render-owned files that CONSUME each sanctioned premium effect family
 * (spec section 5): gradient (surface-tint + accent), glass (overlay backdrops),
 * signal-glow. Stage 1 moved component paint from TSX into unlayered skin CSS,
 * so the consumer set is now src/ui + src/graphics/motion + source skin files.
 * Only the source skins are scanned (never their two entrypoint imports or
 * generated bundles), and the helper de-duplicates paths. In CSS, only values
 * of painted declarations count; custom-property definitions/aliases do not.
 * The compiler, useTokens() catalog, tenant artifacts, and token-definition
 * sheets remain outside the consumer set. The premium layer measured 1/0/0
 * (gradient/glass/glow) dead at the 2026-07-06 baseline; WO-ENG-05 wires each
 * family to > 0 sanctioned consumers (enforced as a floor via MIN below).
 */
function countEffectConsumers() {
  const roots = [componentsDir, join(root, 'src/graphics/motion')];
  const sourceFiles = [];
  function walk(dir) {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const rel = full.replace(/\\/g, '/');
      if (statSync(full).isDirectory()) {
        walk(full);
        continue;
      }
      if (!/\.tsx?$/.test(full)) continue;
      if (/__tests__|\.(test|spec|stories)\./.test(rel)) continue;
      sourceFiles.push(full);
    }
  }
  for (const r of roots) walk(r);
  return countPremiumEffectConsumers({
    sourceFiles,
    skinFiles: collectSkinFiles(),
  });
}

/**
 * Count DISTINCT src/ui components consuming the motion recipe canon
 * (WO-CRA-15): a production TS/TSX file calling `useMotionRecipe*(...)`. A
 * component's several engine files collapse to one owner, so the MIN floor
 * reads "at least N components", never "at least N files". Like the effect
 * floors, this is a wiring signal, not proof the motion renders; the
 * reduced-motion unit contracts and visual specs own that.
 */
function countRecipeConsumers() {
  const sourceFiles = [];
  function walk(dir) {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const rel = full.replace(/\\/g, '/');
      if (statSync(full).isDirectory()) {
        walk(full);
        continue;
      }
      if (!/\.tsx?$/.test(full)) continue;
      if (/__tests__|\.(test|spec|stories)\./.test(rel)) continue;
      sourceFiles.push(full);
    }
  }
  walk(componentsDir);
  return countMotionRecipeConsumers({ sourceFiles, componentsDir });
}

/* ============================================================================
   theme.css drain gate (WO-ENG-08, spec section 8): every remaining selector
   in modern/theme.css must be proven-consumed by a real modern-engine class
   render, or it is dead DaisyUI-mapping weight the drain must remove.
   ============================================================================ */

const themeCssPath = join(tokensCssDir, 'runtime/engines/modern/theme.css');
/** WO-GAT-02: the classic/rustic counterparts of `themeCssPath`, scanned by the same shared
 * `auditEngineTheme()` helper (see below) -- never a second scan implementation. */
const classicThemeCssPath = join(tokensCssDir, 'runtime/engines/classic/theme.css');
const rusticThemeCssPath = join(tokensCssDir, 'runtime/engines/rustic/theme.css');

/** Split already-unwrapped string content on whitespace and add every
 * class-shaped token to `set`. */
function addTokensFromContent(content, set) {
  for (const tok of content.split(/\s+/)) {
    if (/^[A-Za-z][A-Za-z0-9_-]*$/.test(tok)) set.add(tok);
  }
}

/**
 * Extract class-name-shaped tokens out of every quoted string ("...", '...')
 * and template-literal static segment (`...`, with `${...}` interpolations
 * blanked out) found WITHIN `text`, adding each to `set`. `text` must be raw
 * source text that still contains the quote/backtick delimiters (e.g. a
 * `className={...}` expression body) -- for content that has ALREADY been
 * unwrapped from its quotes (e.g. a regex capture group), call
 * `addTokensFromContent` directly instead, or this finds nothing (there are
 * no quote characters left to match).
 */
function extractClassTokens(text, set) {
  const stringRe = /"([^"\n]*)"|'([^'\n]*)'/g;
  for (const m of text.matchAll(stringRe)) {
    addTokensFromContent(m[1] !== undefined ? m[1] : m[2], set);
  }
  const templateRe = /`([^`]*)`/g;
  for (const m of text.matchAll(templateRe)) {
    addTokensFromContent(m[1].replace(/\$\{[^}]*\}/g, ' '), set);
  }
}

/** Given the index of an opening `{`, return the index just past its
 * matching `}` (brace-depth matching). */
function matchBrace(text, openIdx) {
  let depth = 1;
  let j = openIdx + 1;
  while (j < text.length && depth > 0) {
    if (text[j] === '{') depth += 1;
    else if (text[j] === '}') depth -= 1;
    j += 1;
  }
  return j;
}

/**
 * Resolve a same-file `const/let/var NAME = <RHS>;` (optionally with a `:
 * Type` annotation between the name and `=`) to its RHS source text, via a
 * balanced `(){}[]`-depth scan out to the terminating top-level `;`. Used to
 * follow a bare `className={someLocal}` identifier back to its definition
 * (e.g. Avatar's `const containerClass = \`avatar ${status ? 'online' : ''}
 * ${className}\`;`, referenced later as `className={containerClass}` --
 * one hop, no `.join(` involved, so the join-block scan alone would miss
 * it). Returns null if no such same-file declaration exists.
 */
function findVarRHS(text, name) {
  const re = new RegExp(`\\b(?:const|let|var)\\s+${name}\\b\\s*(?::[^=;]+)?=\\s*`, 'g');
  const m = re.exec(text);
  if (!m) return null;
  let k = re.lastIndex;
  let depth = 0;
  while (k < text.length) {
    const c = text[k];
    if (c === '(' || c === '[' || c === '{') depth += 1;
    else if (c === ')' || c === ']' || c === '}') {
      if (depth === 0) break;
      depth -= 1;
    } else if (c === ';' && depth === 0) break;
    k += 1;
  }
  return text.slice(re.lastIndex, k);
}

/** Every `{...}` range in `text` (content between a `{` and its matching
 * `}`), via a brace stack -- used to find the smallest enclosing block
 * around a `.join(` call. */
function collectBraceRanges(text) {
  const stack = [];
  const ranges = [];
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '{') stack.push(i);
    else if (text[i] === '}') {
      const start = stack.pop();
      if (start !== undefined) ranges.push({ start: start + 1, end: i });
    }
  }
  return ranges;
}

/**
 * The class tokens every modern-engine component
 * (`engines/modern/index.tsx`) actually renders -- the theme.css gate's ground
 * truth for "has a consumer." Scoped extraction, NOT a whole-file string
 * scan: an earlier whole-file version measurably leaked non-class prose
 * into the consumed set (a `// ... "completed" ...` line comment in
 * Stepper, and the UI status string `'File selected'` in FormBuilder both
 * produced clean-looking but bogus class tokens -- "completed" and
 * "selected" -- that then falsely "proved" a consumer for otherwise-dead
 * theme.css selectors). Four scoped passes per file instead:
 *  1. `className="..."` / `className='...'` (also bare `class=`) -- direct
 *     literal.
 *  2. `className={...}` / `class={...}` (balanced-brace-scanned) -- covers
 *     ternaries and inline arrays written directly in the JSX attribute.
 *  3. Every bare identifier referenced inside one of those `{...}`
 *     expressions is resolved one hop against a same-file `const/let/var`
 *     declaration (`findVarRHS`) -- covers a local built earlier in the
 *     component and referenced by name (e.g. Avatar's `const containerClass
 *     = \`avatar ${status ? 'online' : ''} ${className}\`;`, later
 *     `className={containerClass}`).
 *  4. The smallest enclosing `{...}` block around every `.join(` call --
 *     covers the `[...].filter(Boolean).join(' ')` idiom even when it sits
 *     inside a helper function several hops from the JSX `className={...}`
 *     site (e.g. FloatButton's `getFloatButtonClassName()` builds
 *     `btn-primary`/`btn-ghost`/`btn-circle` through two chained
 *     const-ternary locals before the array join -- scoping to the
 *     function's own block picks up those locals without pulling in
 *     unrelated text from sibling components in the same file).
 */
/** JS literals/keywords that can appear as a bare identifier inside a
 * `className={...}` expression but are never a same-file variable
 * declaration worth resolving. */
const JS_KEYWORDS = new Set(['true', 'false', 'null', 'undefined', 'this', 'typeof', 'void']);

function buildConsumedClassSet(files) {
  const consumed = new Set();
  for (const file of files) {
    const text = stripBlockComments(readFileSync(file, 'utf8'));

    const attrStringRe = /class(?:Name)?\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
    for (const m of text.matchAll(attrStringRe)) {
      addTokensFromContent(m[1] !== undefined ? m[1] : m[2], consumed);
    }

    const attrBraceRe = /class(?:Name)?\s*=\s*\{/g;
    let am;
    while ((am = attrBraceRe.exec(text))) {
      const openIdx = attrBraceRe.lastIndex - 1;
      const endIdx = matchBrace(text, openIdx);
      const exprText = text.slice(openIdx + 1, endIdx - 1);
      extractClassTokens(exprText, consumed);
      const seenIdents = new Set();
      for (const im of exprText.matchAll(/[A-Za-z_$][\w$]*/g)) {
        const ident = im[0];
        if (JS_KEYWORDS.has(ident) || seenIdents.has(ident)) continue;
        seenIdents.add(ident);
        const rhs = findVarRHS(text, ident);
        if (rhs) extractClassTokens(rhs, consumed);
      }
    }

    const braceRanges = collectBraceRanges(text);
    const joinIdxs = [...text.matchAll(/\.join\(/g)].map((m) => m.index);
    if (joinIdxs.length > 0) {
      const seen = new Set();
      for (const idx of joinIdxs) {
        let best = null;
        for (const r of braceRanges) {
          if (r.start <= idx && idx <= r.end) {
            if (!best || r.end - r.start < best.end - best.start) best = r;
          }
        }
        if (best) {
          const key = `${best.start}:${best.end}`;
          if (!seen.has(key)) {
            seen.add(key);
            extractClassTokens(text.slice(best.start, best.end), consumed);
          }
        }
      }
    }
  }
  return consumed;
}

/**
 * Generic UI state/status words that are real, common CSS class MODIFIERS
 * (DaisyUI and this codebase both use bare `.active`/`.disabled` as state
 * hooks) but are ALSO common non-class prose: status enums (`status ===
 * 'error'`), UI copy ("File selected"), aria attribute values, etc. Proven
 * leak sources (WO-ENG-08 investigation): "completed" only ever appears
 * inside a `//` line comment in Stepper (never stripped -- matches this
 * script's existing stripBlockComments convention of not touching `//`,
 * see its module doc), and "selected" only ever appears inside the UI
 * string `'File selected'` in FormBuilder -- neither is a class anywhere.
 * "active"/"disabled" ARE genuinely rendered as bare classes elsewhere
 * (AutoComplete, Mentions, Cascader, Dropdown, file-manager), so they
 * correctly belong in the consumed set -- the risk isn't that these words
 * are never real, it's that a GLOBAL consumed-set means "active" being
 * real for Menu/Tabs can wrongly "prove" a consumer for an unrelated dead
 * selector like `.calendar-day.active` that merely happens to share the
 * modifier. Selector classification below only lets one of these words
 * stand in for a whole compound selector when there is no more specific
 * sibling class token to check instead -- it never removes a word from the
 * consumed set itself, so a selector whose ONLY class token is one of
 * these (e.g. a hypothetical bare `.active { ... }`) is still evaluated
 * fairly via the fallback branch.
 */
const GENERIC_MODIFIER_TOKENS = new Set([
  'active',
  'disabled',
  'selected',
  'completed',
  'error',
  'success',
  'warning',
  'info',
  'checked',
  'open',
  'closed',
  'expanded',
  'collapsed',
  'hidden',
  'visible',
  'loading',
  'focused',
  'hovered',
  'pressed',
  'empty',
]);

/** Binary-searchable char-offset -> 1-based line-number index. */
function buildLineIndex(text) {
  const offsets = [0];
  for (let k = 0; k < text.length; k++) if (text[k] === '\n') offsets.push(k + 1);
  return (charIdx) => {
    let lo = 0,
      hi = offsets.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (offsets[mid] <= charIdx) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  };
}

/** Split `text[start, end)` into top-level CSS rules (selector text + body
 * offsets), via brace-depth matching -- generic enough to recurse into an
 * `@media` rule's body as its own set of top-level rules. */
function parseCssRules(text, start, end) {
  const rules = [];
  let selStart = start;
  let i = start;
  while (i < end) {
    if (text[i] === '{') {
      const rawSlice = text.slice(selStart, i);
      const selector = rawSlice.trim();
      // Report the offset of the selector text itself (skip the leading
      // whitespace/blanked-comment run between the previous rule's `}` and
      // this one), so line numbers point at the visible selector, not at
      // the gap/comment-banner before it.
      const leadingWs = rawSlice.length - rawSlice.trimStart().length;
      const trimmedStart = selStart + leadingWs;
      let depth = 1;
      let j = i + 1;
      while (j < end && depth > 0) {
        if (text[j] === '{') depth += 1;
        else if (text[j] === '}') depth -= 1;
        j += 1;
      }
      rules.push({
        selector,
        bodyStart: i + 1,
        bodyEnd: j - 1,
        selStart: trimmedStart,
        ruleEnd: j,
      });
      selStart = j;
      i = j;
    } else {
      i += 1;
    }
  }
  return rules;
}

/** Every `.class` token referenced anywhere in a (possibly comma-separated)
 * selector, ignoring combinators, elements, pseudo-classes, and attribute
 * selectors (e.g. `label.input input, [data-tenant] .avatar.placeholder >
 * div` yields `["input", "avatar", "placeholder"]`). */
function selectorClassTokens(selector) {
  return [...selector.matchAll(/\.([A-Za-z_-][A-Za-z0-9_-]*)/g)].map((m) => m[1]);
}

/**
 * Walk an engine theme.css file (`themeFile`) and classify every selector as:
 *  - exempt (the bare `[data-tenant]` engine-token root block, `@keyframes`,
 *    or any selector with NO class token at all -- a pure element/attribute
 *    hook like `[data-tenant] select` / `input[type="color"]` / classic's
 *    `html[data-tenant]` root scope, which is not a "class hook" this gate
 *    drains and is proven-consumed separately by direct source inspection,
 *    not by this mechanical counter)
 *  - allowlisted (WO-GAT-02: every class token on the selector starts with one of
 *    `opts.allowlistPrefixes`. For classic this is `["ant-", "anticon", "slick-"]` -- NOT just
 *    `.ant-*`: investigation while measuring the baseline found classic/theme.css also targets
 *    `.anticon` (Ant Design's icon-font class -- no hyphen after "ant", so it needs its own
 *    prefix entry, not just "ant-") and `.slick-*` (react-slick, the carousel library antd's
 *    `Carousel` wraps internally). All three are rendered by antd (or its vendored
 *    dependencies) at runtime and never appear literally in DS `className`/`class` output, so
 *    the consumed-class heuristic below can neither prove nor disprove them -- they are
 *    tallied separately in `allowlisted` and NEVER reported dead. A first pass allowlisting
 *    only "ant-" measured 29 "dead" selectors for classic; 18 of those were actually `anticon`/
 *    `slick-*` compound selectors (e.g. `.ant-carousel .slick-dots li.slick-active button`) --
 *    alive via antd, not dead -- which is why the prefix list is broadened here instead of left
 *    as a single string.)
 *  - referenced (>= 1 class token appears in the consumed-class set)
 *  - unreferenced (every class token is absent from the consumed-class set)
 * `@media` bodies are recursed into so each nested selector is judged on its
 * own rather than the whole media query being treated as one opaque unit.
 *
 * Generalized (WO-GAT-02) from the modern-only `auditThemeCss()` below (WO-ENG-08's original
 * scan target) -- this is the ONE shared selector-scan implementation for all three engines;
 * never fork a second one. `consumerFiles` is that engine's own component file set (see
 * `collectEngineFiles`), so "consumed" always means "rendered by THIS engine's source", never
 * a different engine's.
 */
function auditEngineTheme(themeFile, consumerFiles, opts = {}) {
  const allowlistPrefixes = opts.allowlistPrefixes ?? [];
  if (!existsSync(themeFile)) {
    return {
      lineCount: 0,
      unreferencedSelectors: 0,
      unreferenced: [],
      consumedSize: 0,
      allowlisted: 0,
    };
  }
  const raw = readFileSync(themeFile, 'utf8');
  const lineCount = (raw.match(/\n/g) || []).length;
  const stripped = stripBlockComments(raw);
  const lineOf = buildLineIndex(raw);
  const consumed = buildConsumedClassSet(consumerFiles);

  const unreferenced = [];
  const referencedDebug = [];
  let unreferencedCount = 0;
  let allowlistedCount = 0;

  function walk(start, end) {
    for (const rule of parseCssRules(stripped, start, end)) {
      if (!rule.selector) continue;
      if (rule.selector === '[data-tenant]') continue; // root engine-token block (modern)
      if (/^@keyframes\b/.test(rule.selector)) continue; // opaque, exempt
      if (/^@media\b/.test(rule.selector)) {
        walk(rule.bodyStart, rule.bodyEnd);
        continue;
      }
      const tokens = rule.selector.split(',').flatMap((part) => selectorClassTokens(part));
      if (tokens.length === 0) continue; // pure element/attribute hook (e.g. classic's `html[data-tenant]` root), not a class selector
      if (allowlistPrefixes.length > 0 && tokens.every((t) => allowlistPrefixes.some((p) => t.startsWith(p)))) {
        allowlistedCount += 1; // e.g. classic's ant-/anticon/slick- families -- externally consumed, never dead
        continue;
      }
      // Prefer specific (non-generic-modifier) tokens when the selector has
      // any: a generic word riding along with a dead anchor class (e.g.
      // `.calendar-day.selected` when `.calendar-day` itself is unreferenced
      // everywhere else) should not alone prove a consumer. Falls back to
      // the full token set when EVERY token is a generic modifier, so a
      // selector with no specific anchor at all is still judged fairly.
      const specific = tokens.filter((t) => !GENERIC_MODIFIER_TOKENS.has(t));
      const checkSet = specific.length > 0 ? specific : tokens;
      const matched = checkSet.filter((t) => consumed.has(t));
      // EVERY specific token must be live, not merely one of them. `.join .btn`
      // read as referenced because `btn` is rendered elsewhere while no component
      // renders `join` at all; `.toast .alert-success` read as referenced because
      // `toast` is live via Notification and Message while `alert-success` is
      // rendered by nobody. A compound selector only matches when all of its
      // parts do, so a counter that accepts one of them is measuring a different
      // question than the one it is named after.
      if (matched.length < checkSet.length) {
        unreferencedCount += 1;
        unreferenced.push({
          selector: rule.selector,
          line: lineOf(rule.selStart),
        });
      } else if (process.env.DEBUG_REFERENCED) {
        referencedDebug.push({
          selector: rule.selector,
          line: lineOf(rule.selStart),
          matched,
        });
      }
    }
  }
  walk(0, stripped.length);
  if (process.env.DEBUG_UNREFERENCED) {
    for (const r of unreferenced) console.log(`${themeFile}:${r.line}  ${r.selector}`);
  }
  if (process.env.DEBUG_REFERENCED) {
    console.log(`\n--- DEBUG referenced (${referencedDebug.length}) in ${themeFile} ---`);
    for (const r of referencedDebug) {
      console.log(`  line ${r.line}: ${r.selector.replace(/\s+/g, ' ')}  <-- [${r.matched.join(', ')}]`);
    }
  }

  return {
    lineCount,
    unreferencedSelectors: unreferencedCount,
    unreferenced,
    consumedSize: consumed.size,
    allowlisted: allowlistedCount,
  };
}

/** Modern-engine caller of `auditEngineTheme()` (WO-ENG-08's original scan target). Kept as a
 * named function so the existing call site/output shape below is unchanged. */
function auditThemeCss(files) {
  return auditEngineTheme(themeCssPath, files);
}

/* ============================================================================
   Content-integrity gate (WO-ENG-09, spec section 9): "Overlay layering uses
   a tokenized z-index scale; tooltips/callouts must not land on top of
   unrelated content."
   ============================================================================ */

/**
 * Count numeric `zIndex` (JS/inline-style, camelCase) and `z-index` (raw CSS,
 * kebab-case) literals in modern-engine component files that are NOT sourced
 * from the tokenized overlay-stack scale (`var(--ds-z-*)`, minted in
 * `foundation/themes/default.css` as short aliases onto the pre-existing
 * canonical `--ds-z-index-*` scale). A literal is tokenized when its value is
 * a `var(--ds-z-...)` reference; this function's regex only ever matches a
 * BARE digit (or `auto`) immediately after `zIndex:`/`z-index:`, so any such
 * reference already can't match -- no separate "is it var()-sourced" check is
 * needed.
 *
 * Exemptions (spec-directed):
 *  - `0` and `-1`: the CSS defaults for "no stacking context" / "just behind
 *    this element's own sibling" (e.g. Popover's decorative arrow, drawn one
 *    step behind the popover body it belongs to) -- not a page-level overlay
 *    layering decision.
 *  - `auto`: the CSS keyword default: never a magic number.
 *  - A literal with a trailing same-line `//` comment is treated as
 *    documented (e.g. "local stacking context, not a page overlay") and
 *    exempted -- still visible to a human reviewer, just not counted as
 *    undocumented magic-number debt.
 *
 * Deliberately narrow, like the other single-purpose counters in this file:
 * a zIndex driven by a variable/expression (e.g. `zIndex: zBase + 1`, or a
 * value buried inside a quoted `var(--x, var(--y, 1070))` fallback-chain
 * string) is a DIFFERENT defect shape (an opaque default or a dead-token
 * fallback) that this regex will not see either -- WO-ENG-09 fixed every
 * such case found in the overlay/tooltip/callout/modal/drawer/dropdown
 * family by inspection, not by relying on this counter to find them.
 *
 * Baseline measured at WO-ENG-09 implementation time (after routing the
 * overlay/tooltip/callout/modal/drawer/dropdown engines through
 * `var(--ds-z-*)`); target 0; decrease-only. The residual at that baseline
 * is sticky/local-stacking usage (data-table column pinning + sticky header,
 * the Table primitive, filter/menu/select-family floating popups) that
 * WO-ENG-09 left untouched -- out of its named file scope -- for a later pass.
 */
function countMagicZIndex(files) {
  const literalRe = /\b(?:zIndex|z-index)\s*:\s*(['"]?)(-?\d+|auto)\1/g;
  let count = 0;
  for (const file of files) {
    const lines = readFileSync(file, 'utf8').split('\n');
    for (const line of lines) {
      literalRe.lastIndex = 0;
      let m;
      while ((m = literalRe.exec(line))) {
        const raw = m[2];
        if (raw === 'auto') continue;
        const num = Number(raw);
        if (num === 0 || num === -1) continue;
        const commentIdx = line.indexOf('//');
        if (commentIdx !== -1 && commentIdx > m.index) continue; // documented inline
        count += 1;
      }
    }
  }
  return count;
}

/* ============================================================================
   Cross-engine layout contract (WO-ENG-10, spec section 10): "Layout belongs
   to the component layer; engines theme, they do not re-layout." The
   StatsGrid defect (modern stacked stats vertically via a responsive
   auto-fill/minmax grid while classic/rustic rendered a fixed `columns`-track
   horizontal grid) is the shape this counter detects: the modern engine
   declaring an explicit structural layout-axis value that CONTRADICTS an
   agreeing classic+rustic pair.
   ============================================================================ */

/**
 * Structural layout-axis inline-style properties this gate compares, as raw
 * per-occurrence source text. Scoped to the two properties that actually
 * flip a component's rendered arrangement (row-vs-column axis, explicit
 * column/track count) -- `flexWrap`/`gridTemplateRows` and gap/padding
 * values are cosmetic-wrapping or spacing theming (spec section 10 exempts
 * these explicitly), not orientation/axis divergences, so they are not
 * scored here.
 *
 * KNOWN BLIND SPOT: several modern engines express layout via Tailwind/
 * DaisyUI utility classes in `className` (`grid grid-cols-7`, `flex-col`)
 * rather than inline `style={{ ... }}` objects (e.g. Calendar, DatePicker,
 * List, Descriptions). This regex-over-inline-styles heuristic cannot see
 * className-based axis declarations. The WO-ENG-10 sweep (2026-07-09)
 * manually reviewed every className-based case alongside the inline-style
 * ones and found no real divergence beyond StatsGrid; a future className-
 * aware extension would need to parse Tailwind grid-cols-N / flex-row /
 * flex-col tokens the same way, but is not implemented here.
 */
const LAYOUT_AXIS_PATTERNS = [
  { name: 'flexDirection', re: /flexDirection:\s*['"]([a-zA-Z-]+)['"]/g },
  {
    name: 'gridTemplateColumns',
    re: /gridTemplateColumns:\s*([`'"])((?:(?!\1).)*)\1/g,
  },
];

/**
 * Components with a verified-legitimate per-engine layout axis, declared in
 * the component's own contract/types file (spec section 10's "explicitly
 * declares a layout axis as engine-themable" exception) -- format
 * `"<component-dir-relative-to-src/ui>:<patternName>"`. Each entry
 * here must correspond to a comment in that component's `*.types.ts` (or
 * engine file) recording the same declaration, so the exemption is
 * discoverable from the component contract, not just this script.
 *
 * `primitives/inputs/Toggle:flexDirection` -- the WO-ENG-10 sweep (2026-07-09)
 * confirmed by direct read that all three engines implement `labelPlacement`
 * ('start' -> row-reverse, 'end' -> row) identically (see
 * `Toggle.types.ts`'s `labelPlacement` doc). This is NOT an actual
 * divergence: classic/rustic write the ternary in the VALUE position
 * (`flexDirection: labelPlacement === 'start' ? 'row-reverse' : 'row'`)
 * while modern writes it at the whole-object position
 * (`...(labelPlacement === 'start' ? { flexDirection: 'row-reverse', ... } :
 * { ... })`) -- both produce the same two possible values, but this script's
 * regex-over-source-text extraction only resolves a literal immediately
 * following `flexDirection:`, so it can see modern's `'row-reverse'` literal
 * but not classic/rustic's ternary-in-value-position one. Properly parsing
 * arbitrary ternary expressions would need a real JS/TS parser, which is out
 * of proportion to this narrow gate -- allowlisted instead of over-engineering
 * the regex.
 */
const LAYOUT_AXIS_EXCEPTIONS = new Set([
  'primitives/inputs/Toggle:flexDirection',
]);

/**
 * Collect every `engines/{classic,modern,rustic}` triad under `src/ui`
 * (folder `engines/classic/index.tsx`, same canonical shape
 * `modernFiles()` above recognizes), keyed by the component's
 * directory path relative to `componentsDir` (for example,
 * `patterns/data/stats-grid`).
 * A component missing any one of the three engine files is skipped -- there
 * is nothing to compare it against.
 */
function findEngineTriads(dir, base) {
  const out = new Map();
  function walk(current) {
    for (const entry of readdirSync(current)) {
      const full = join(current, entry);
      if (!statSync(full).isDirectory()) continue;
      if (entry === 'engines') {
        const rel = dirname(full.slice(base.length + 1));
        const engineFile = (name) => {
          for (const ext of ['.tsx', '.ts']) {
            const flat = join(full, `${name}${ext}`);
            if (existsSync(flat)) return flat;
          }
          const folderIndex = join(full, name, 'index.tsx');
          return existsSync(folderIndex) ? folderIndex : null;
        };
        const classic = engineFile('classic');
        const modern = engineFile('modern');
        const rustic = engineFile('rustic');
        if (classic && modern && rustic) out.set(rel, { classic, modern, rustic });
      } else {
        walk(full);
      }
    }
  }
  walk(dir);
  return out;
}

/** Every raw-text match for a layout-axis pattern in a file's source text, as a sorted, de-duped array. */
function extractLayoutAxisValues(text, re) {
  const values = new Set();
  re.lastIndex = 0;
  let m;
  while ((m = re.exec(text))) {
    values.add((m[2] !== undefined ? m[2] : m[1]).replace(/\s+/g, ' ').trim());
  }
  return [...values].sort();
}

/**
 * Count components where the modern engine declares an explicit
 * flexDirection/gridTemplateColumns value that DISAGREES with a
 * classic+rustic consensus (both siblings declare the SAME explicit value
 * for the same axis). Deliberately a narrow, high-precision proxy rather
 * than an exhaustive layout-parity checker:
 *  - Requires all three engines to have a NON-EMPTY value for the axis
 *    before comparing. Classic frequently wraps an Ant Design component
 *    whose own bundled CSS implements the layout internally (no inline
 *    declaration in classic's file at all), and plain stacked `<div>`s
 *    already lay out vertically via normal block flow with no inline
 *    `flexDirection` needed -- neither is a divergence, and requiring all
 *    three non-empty avoids flagging them (the WO-ENG-10 sweep manually
 *    verified this empty-vs-nonempty shape component-by-component and
 *    found no real defect hiding behind it).
 *  - Only flags MODERN as the outlier against an agreeing classic+rustic
 *    pair -- this mirrors the actual StatsGrid defect shape (classic and
 *    rustic already agreed with each other on a fixed `columns`-track grid;
 *    modern alone substituted a different, responsive one). A case where
 *    CLASSIC is the lone outlier against an agreeing modern+rustic pair
 *    (e.g. a differently-tuned pixel threshold) is gap/sizing theming, not
 *    an axis divergence, and is not counted.
 *  - `LAYOUT_AXIS_EXCEPTIONS` lets a reviewed, contract-documented
 *    engine-themable axis opt out by name.
 * Target: 0.
 */
function countCrossEngineLayoutDivergences() {
  const triads = findEngineTriads(componentsDir, componentsDir);
  let count = 0;
  const detail = [];
  for (const [rel, triad] of triads) {
    const classicText = readFileSync(triad.classic, 'utf8');
    const modernText = readFileSync(triad.modern, 'utf8');
    const rusticText = readFileSync(triad.rustic, 'utf8');
    for (const { name, re } of LAYOUT_AXIS_PATTERNS) {
      if (LAYOUT_AXIS_EXCEPTIONS.has(`${rel}:${name}`)) continue;
      const c = extractLayoutAxisValues(classicText, re);
      const m = extractLayoutAxisValues(modernText, re);
      const r = extractLayoutAxisValues(rusticText, re);
      if (c.length === 0 || m.length === 0 || r.length === 0) continue;
      const cKey = JSON.stringify(c);
      const rKey = JSON.stringify(r);
      const mKey = JSON.stringify(m);
      if (cKey === rKey && mKey !== cKey) {
        count += 1;
        detail.push(`${rel} (${name}): classic/rustic=${cKey} modern=${mKey}`);
      }
    }
  }
  if (process.env.DEBUG_LAYOUT) {
    for (const d of detail) console.log(`  layout divergence: ${d}`);
  }
  return count;
}

/* ============================================================================
   Token-coverage report (WO-GAT-02, proposal P-14): informational visibility into which
   --ds-* tokens each component file consumes vs. what it still hardcodes. NOT a blocking
   gate -- the blocking gates remain the modern-scoped counters above; this report covers ALL
   engines under packages/core/src/ui/ for visibility, reusing the exact same literal-
   detection rules (`countMotionLiteralsInText`, `countColorLiteralsInText`) so its numbers can
   never drift from what the blocking counters themselves count.
   ============================================================================ */

/** Every `.ts`/`.tsx` component source file, across all engines, excluding tests/stories (same
 * exclusion convention as the other per-file walks in this script -- e.g.
 * `countFallbackParityViolations`). */
function collectCoverageFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...collectCoverageFiles(full));
      continue;
    }
    if (!/\.tsx?$/.test(full)) continue;
    const rel = full.replace(/\\/g, '/');
    if (/__tests__|\.(test|spec|stories)\./.test(rel)) continue;
    out.push(full);
  }
  return out;
}

const DS_TOKEN_RE = /var\(\s*(--ds-[a-zA-Z0-9-]+)/g;

/**
 * Build the WO-GAT-02 token-coverage report: for every component source file, the set of
 * `--ds-*` custom properties it consumes (`var(--ds-...)`) and the hardcoded literal counts
 * the existing motion/color counters find (cubic-bezier, raw duration, hex, rgba). Cheap enough
 * (~1,000 small source files) to compute on every `--check`/report run for the one-line
 * summary; `--coverage` mode additionally persists the full detail to disk.
 */
function buildTokenCoverage() {
  const coverageFiles = collectCoverageFiles(componentsDir);
  const allTokens = new Set();
  const fileReports = [];
  let literalsOutstandingTotal = 0;

  for (const file of coverageFiles) {
    const raw = readFileSync(file, 'utf8');
    const stripped = stripBlockComments(raw);
    const rel = file.slice(root.length + 1).replace(/\\/g, '/');

    const tokens = new Set();
    for (const m of raw.matchAll(DS_TOKEN_RE)) tokens.add(m[1]);
    for (const t of tokens) allTokens.add(t);

    const motionLit = countMotionLiteralsInText(raw);
    const colorLit = countColorLiteralsInText(stripped);
    const literalsTotal = motionLit.cubicBezier + motionLit.rawDuration + colorLit.hex + colorLit.rgba;
    literalsOutstandingTotal += literalsTotal;

    fileReports.push({
      file: rel,
      dsTokensConsumed: [...tokens].sort(),
      literals: {
        cubicBezier: motionLit.cubicBezier,
        rawDuration: motionLit.rawDuration,
        hex: colorLit.hex,
        rgba: colorLit.rgba,
        total: literalsTotal,
      },
    });
  }

  fileReports.sort((a, b) => a.file.localeCompare(b.file));

  return {
    generatedAt: new Date().toISOString(),
    filesScanned: fileReports.length,
    tokensConsumedUnique: allTokens.size,
    literalsOutstandingTotal,
    files: fileReports,
  };
}

/** Render the human-readable Markdown summary written by `--coverage` mode. */
function renderCoverageMarkdown(coverage) {
  const topLiterals = coverage.files
    .filter((f) => f.literals.total > 0)
    .slice()
    .sort((a, b) => b.literals.total - a.literals.total)
    .slice(0, 25);

  const lines = [];
  lines.push('# Token coverage report (WO-GAT-02)');
  lines.push('');
  lines.push(`Generated: ${coverage.generatedAt}`);
  lines.push('');
  lines.push('Informational only -- this report is NOT a blocking gate. The blocking gates remain the');
  lines.push('modern-scoped counters in `node scripts/engine-token-audit.mjs --check` (motion/color/etc).');
  lines.push('This report lists, per component source file across ALL engines, which `--ds-*` custom');
  lines.push('properties it consumes and how many hardcoded literals (motion/hex/rgba, using the exact');
  lines.push('same detection rules as the blocking counters) it still carries.');
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Files scanned: ${coverage.filesScanned}`);
  lines.push(`- Unique \`--ds-*\` tokens consumed: ${coverage.tokensConsumedUnique}`);
  lines.push(`- Hardcoded literals outstanding: ${coverage.literalsOutstandingTotal}`);
  lines.push('');
  lines.push(`## Top ${topLiterals.length} files by outstanding literals`);
  lines.push('');
  lines.push('| File | cubic-bezier | raw duration | hex | rgba | total |');
  lines.push('| --- | --- | --- | --- | --- | --- |');
  for (const f of topLiterals) {
    lines.push(
      `| ${f.file} | ${f.literals.cubicBezier} | ${f.literals.rawDuration} | ${f.literals.hex} | ${f.literals.rgba} | ${f.literals.total} |`
    );
  }
  lines.push('');
  lines.push('Full per-file detail (including files with zero outstanding literals and their full');
  lines.push('consumed-token list) is in the sibling `token-coverage.json`.');
  lines.push('');
  return lines.join('\n');
}

const repoRoot = resolve(root, '..', '..');
const gatesDir = join(repoRoot, 'test-artifacts', 'gates');

/** Write the `--coverage` mode artifacts (JSON + Markdown) to `test-artifacts/gates/`. */
function writeCoverageArtifacts(coverage) {
  if (!existsSync(gatesDir)) mkdirSync(gatesDir, { recursive: true });
  const jsonPath = join(gatesDir, 'token-coverage.json');
  writeFileSync(jsonPath, JSON.stringify(coverage, null, 2) + '\n');
  const mdPath = join(gatesDir, 'token-coverage.md');
  writeFileSync(mdPath, renderCoverageMarkdown(coverage));
  return { jsonPath, mdPath };
}

/* ============================================================================
   APCA contrast gate (WO-GAT-04, proposal P-10, axis 2): evaluate a DOCUMENTED
   list of text/surface token pairings across every first-party palette with
   APCA (Accessible Perceptual Contrast Algorithm) Lc values, and count pairings
   below their threshold as failures. Decrease-only ratchet, like every other
   counter here. This is ADDITIVE to — never a replacement for — the shipped
   WCAG-2 validator at src/foundation/kernel/accessibility/branding-contrast/index.ts (a published /server
   API). APCA is the perceptually accurate successor: WCAG-2 ratios are known to
   mis-rank contrast (over-rating light-on-dark, under-rating dark-on-light),
   which the P-05 hostile-tenant palettes make actively misleading.

   ── THRESHOLDS (documented, fixed by proposal P-10) ────────────────────────
   APCA Lc is signed (polarity: negative = light text on dark bg). We compare
   the ABSOLUTE Lc against a floor:
     - body-text pairs:      |Lc| >= 60   (primary reading text)
     - large-text / UI pairs: |Lc| >= 45   (component labels, low-emphasis text,
                                            status accents)
   These map to the APCA bronze-tier guidance (60 = fluent body minimum at
   normal sizes; 45 = large/bold/UI minimum). We deliberately do NOT chase the
   90/75 silver tiers here — the gate's job is to catch the dark-blind and
   wash-out failures, and to ratchet them down, not to fail the whole system
   against an aspirational bar.

   ── PALETTES ───────────────────────────────────────────────────────────────
   The SAME pairing list is resolved against each first-party palette on its
   OWN default surface (the one TenantPaletteSurface renders in the WO-ENG-02
   galleries): the foundation defaults (dark) and the three tenant artifacts
   (rottay dark, bithire light, evnto light). Each artifact's tokens are merged
   OVER the foundation defaults (artifact wins — mirroring the real cascade,
   where html[data-tenant=…] overrides :root), then `var(--x)` chains are
   followed to a concrete color.

   ── SKIP-WITH-COUNT ────────────────────────────────────────────────────────
   A pairing whose text OR bg resolves to a non-static value — `color-mix()`, an
   unresolved `var()` (no definition, no fallback), a non-opaque rgba()/#rrggbbaa
   (APCA needs an opaque pair; compositing needs a known backdrop), or a keyword
   we do not map — is SKIPPED and COUNTED (reported), never silently dropped. At
   the WO-GAT-04 baseline every documented pairing resolves to opaque hex, so the
   skip count is 0; a pairing that STARTS skipping later is a visible signal in
   the report that a token was changed to a non-static form (which would also
   quietly shrink the evaluated set), not an invisible hole in the gate.
   ============================================================================ */

const APCA_BODY_MIN = 60; // body-text pairs
const APCA_UI_MIN = 45; // large-text / UI / low-emphasis pairs

/**
 * The documented text/surface token pairings. `kind` selects the threshold.
 * Each pairing names the TWO `--ds-*` tokens (text foreground, then surface
 * background) exactly as the components consume them; the resolver follows
 * their `var()` chains per palette. The list mirrors what the WO-ENG-02
 * flagship galleries actually render: body/muted copy on the page ground, body
 * copy on the elevated card surface, the primary button label on its own fill,
 * the five badge tones the gallery renders (fg on own tone bg — self-contained,
 * surface-independent), and each semantic status color used AS text on the page
 * ground (the status-message/label pattern).
 */
const APCA_PAIRINGS = [
  // Body-reading text (|Lc| >= 60)
  {
    id: 'body-text-on-page-bg',
    kind: 'body',
    text: '--ds-color-text-primary',
    bg: '--ds-color-bg-primary',
  },
  {
    id: 'text-on-card-surface',
    kind: 'body',
    text: '--ds-color-text-primary',
    bg: '--ds-color-bg-elevated',
  },
  // Low-emphasis text (|Lc| >= 45): muted/secondary copy — timestamps, hints, help text
  {
    id: 'muted-text-on-page-bg',
    kind: 'ui',
    text: '--ds-color-text-muted',
    bg: '--ds-color-bg-primary',
  },
  // Primary button label on its own fill (|Lc| >= 45)
  {
    id: 'primary-button-label',
    kind: 'ui',
    text: '--ds-button-primary-color',
    bg: '--ds-button-primary-bg',
  },
  // Badge tone label on its own tone fill (|Lc| >= 45) — the 5 gallery tones
  {
    id: 'badge-primary',
    kind: 'ui',
    text: '--ds-badge-primary-color',
    bg: '--ds-badge-primary-bg',
  },
  {
    id: 'badge-secondary',
    kind: 'ui',
    text: '--ds-badge-secondary-color',
    bg: '--ds-badge-secondary-bg',
  },
  {
    id: 'badge-success',
    kind: 'ui',
    text: '--ds-badge-success-color',
    bg: '--ds-badge-success-bg',
  },
  {
    id: 'badge-warning',
    kind: 'ui',
    text: '--ds-badge-warning-color',
    bg: '--ds-badge-warning-bg',
  },
  {
    id: 'badge-error',
    kind: 'ui',
    text: '--ds-badge-error-color',
    bg: '--ds-badge-error-bg',
  },
  // Semantic status color used AS text on the page ground (|Lc| >= 45)
  {
    id: 'semantic-success-text',
    kind: 'ui',
    text: '--ds-color-success',
    bg: '--ds-color-bg-primary',
  },
  {
    id: 'semantic-info-text',
    kind: 'ui',
    text: '--ds-color-info',
    bg: '--ds-color-bg-primary',
  },
  {
    id: 'semantic-warning-text',
    kind: 'ui',
    text: '--ds-color-warning',
    bg: '--ds-color-bg-primary',
  },
  {
    id: 'semantic-error-text',
    kind: 'ui',
    text: '--ds-color-error',
    bg: '--ds-color-bg-primary',
  },
];

/**
 * The first-party palettes, each on the surface its WO-ENG-02 gallery renders.
 * `theme` selects which artifact block is the default (rottay is dark-first;
 * bithire/evnto are light-first), so the resolver reads the block that actually
 * paints, not the opposite-scheme override.
 */
const APCA_PALETTES = [
  {
    id: 'default',
    kind: 'foundation',
    file: join(foundationDir, 'themes/default.css'),
    theme: 'dark',
  },
  {
    id: 'rottay',
    kind: 'artifact',
    tenant: 'rottay',
    file: join(artifactsDir, 'rottay/index.css'),
    theme: 'dark',
  },
  {
    id: 'bithire',
    kind: 'artifact',
    tenant: 'bithire',
    file: join(artifactsDir, 'bithire/index.css'),
    theme: 'light',
  },
  {
    id: 'evnto',
    kind: 'artifact',
    tenant: 'evnto',
    file: join(artifactsDir, 'evnto/index.css'),
    theme: 'light',
  },
];

/** Extract only the DIRECT (brace-depth-0) `--name: value;` declarations from a
 * rule body, skipping any nested rule (e.g. the `*, ::after { border-color }`
 * reset that tenant blocks carry) — those set inherited properties, not the
 * root token scale. */
function apcaTopLevelDecls(body) {
  const out = [];
  let depth = 0;
  let seg = '';
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (c === '{') {
      depth += 1;
      seg = '';
      continue;
    }
    if (c === '}') {
      if (depth > 0) depth -= 1;
      seg = '';
      continue;
    }
    if (depth !== 0) continue;
    if (c === ';') {
      const m = /(--[a-zA-Z0-9-]+)\s*:\s*([\s\S]+)/.exec(seg);
      if (m) out.push([m[1], m[2].trim()]);
      seg = '';
    } else {
      seg += c;
    }
  }
  return out;
}

/** True when `selector` is the tenant's ROOT token block for its DEFAULT theme:
 * the historical `html[data-tenant='T']` root or its dual-scope
 * `:is(html[data-tenant='T'], :where([data-ds-root][data-vertical='V']))`
 * projection, followed only by attached qualifiers (`:not(...)`, `.class`,
 * `[data-theme=...]`). Descendant scoping and the OPPOSITE scheme are rejected. */
function apcaBlockMatchesDefault(selector, tenant, defaultTheme) {
  const compact = selector.replace(/\s+/g, '');
  const escapedTenant = tenant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const tenantRoot = `html\\[data-tenant=['"]${escapedTenant}['"]\\]`;
  const verticalRoot = `:where\\(\\[data-ds-root\\]\\[data-vertical=['"][A-Za-z0-9_-]+['"]\\]\\)`;
  // Vertical artifacts are dual-scoped: the historical tenant root and an
  // embeddable vertical root share one :is() rule. The APCA evaluator follows
  // the tenant branch, but must admit that mechanically equivalent wrapper;
  // otherwise every artifact silently falls back to foundation colours.
  const root = `(?:${tenantRoot}|:is\\(${tenantRoot},${verticalRoot}\\))`;
  const rootRe = new RegExp(
    `^${root}(?::not\\([^)]*\\)|\\.[A-Za-z0-9_-]+|\\[data-theme=['"][^'"]*['"]\\])*$`
  );
  if (!rootRe.test(compact)) return false;
  const opp = defaultTheme === 'light' ? 'dark' : 'light';
  const oppClass = new RegExp(`(?<!:not\\()\\.${opp}(?![A-Za-z0-9_-])`);
  const oppAttr = new RegExp(`(?<!:not\\()\\[data-theme=['"]${opp}['"]\\]`);
  if (oppClass.test(compact) || oppAttr.test(compact)) return false;
  return true;
}

/** Build a name -> raw-value map from every top-level rule of `cssText` whose
 * selector satisfies `matchSelector`, in source order (LAST wins — matching the
 * cascade, where a later same-scope block overrides an earlier one). */
function apcaCollectDecls(cssText, matchSelector) {
  const stripped = stripBlockComments(cssText);
  const defs = new Map();
  for (const rule of parseCssRules(stripped, 0, stripped.length)) {
    if (!rule.selector || !matchSelector(rule.selector)) continue;
    const body = stripped.slice(rule.bodyStart, rule.bodyEnd);
    for (const [n, v] of apcaTopLevelDecls(body)) defs.set(n, v);
  }
  return defs;
}

/** Parse a concrete CSS color literal to an OPAQUE color string calcAPCA
 * accepts (`#rrggbb` or `rgb(r, g, b)`), or null when it is not a static opaque
 * color (color-mix / gradient / non-opaque alpha / var-bearing / unmapped
 * keyword) — the "skip-with-count" cases. */
function apcaParseColor(raw) {
  const str = raw.trim().replace(/\s*!important\s*$/i, '');
  const kw = { white: '#ffffff', black: '#000000' };
  if (Object.prototype.hasOwnProperty.call(kw, str.toLowerCase())) return kw[str.toLowerCase()];
  if (/^#[0-9a-fA-F]{6}$/.test(str)) return str;
  if (/^#[0-9a-fA-F]{3}$/.test(str)) return str;
  if (/^#[0-9a-fA-F]{8}$/.test(str)) return str.slice(7).toLowerCase() === 'ff' ? '#' + str.slice(1, 7) : null;
  if (/^#[0-9a-fA-F]{4}$/.test(str)) return str[4].toLowerCase() === 'f' ? '#' + str.slice(1, 4) : null;
  const m = /^rgba?\(\s*([0-9.]+)\s*[,\s]\s*([0-9.]+)\s*[,\s]\s*([0-9.]+)\s*(?:[,/]\s*([0-9.]+%?)\s*)?\)$/.exec(str);
  if (m) {
    let a = 1;
    if (m[4] !== undefined) a = m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
    if (!(a >= 1)) return null; // non-opaque needs compositing — skip
    return `rgb(${Math.round(+m[1])}, ${Math.round(+m[2])}, ${Math.round(+m[3])})`;
  }
  return null; // color-mix(), gradients, unresolved var(), unmapped keyword
}

/** Resolve a `--ds-*` token to a concrete opaque color within `defs`, following
 * `var(--x, fallback)` chains; null when it bottoms out on an undefined name or
 * a non-static value (see apcaParseColor). */
function apcaResolveColor(name, defs, seen = new Set()) {
  if (seen.has(name)) return null;
  seen.add(name);
  const raw = defs.get(name);
  if (raw === undefined) return null;
  return apcaResolveValue(raw, defs, seen);
}

function apcaResolveValue(raw, defs, seen) {
  const value = raw.trim().replace(/\s*!important\s*$/i, '');
  const varM = /^var\(\s*(--[a-zA-Z0-9-]+)\s*(?:,\s*([\s\S]+))?\)$/.exec(value);
  if (varM) {
    const inner = apcaResolveColor(varM[1], defs, new Set(seen));
    if (inner) return inner;
    return varM[2] !== undefined ? apcaResolveValue(varM[2].trim(), defs, seen) : null;
  }
  return apcaParseColor(value);
}

/**
 * Evaluate every APCA_PAIRINGS pair against every APCA_PALETTES palette. Returns
 * the failure count (pairs whose |Lc| is below their threshold), the skip count
 * (unresolvable pairs), and a per-evaluation detail list for the report/evidence.
 */
function evaluateApcaPairings() {
  const foundationText = existsSync(APCA_PALETTES[0].file) ? readFileSync(APCA_PALETTES[0].file, 'utf8') : '';
  const foundationDefs = apcaCollectDecls(foundationText, (sel) => sel.trim() === ':root');
  const results = [];
  let failures = 0;
  let skipped = 0;
  for (const pal of APCA_PALETTES) {
    let defs;
    if (pal.kind === 'foundation') {
      defs = foundationDefs;
    } else {
      const text = existsSync(pal.file) ? readFileSync(pal.file, 'utf8') : '';
      const artDefs = apcaCollectDecls(text, (sel) => apcaBlockMatchesDefault(sel, pal.tenant, pal.theme));
      defs = new Map([...foundationDefs, ...artDefs]); // artifact overrides foundation
    }
    for (const pair of APCA_PAIRINGS) {
      const textColor = apcaResolveColor(pair.text, defs);
      const bgColor = apcaResolveColor(pair.bg, defs);
      const threshold = pair.kind === 'body' ? APCA_BODY_MIN : APCA_UI_MIN;
      if (!textColor || !bgColor) {
        skipped += 1;
        results.push({
          palette: pal.id,
          pair: pair.id,
          kind: pair.kind,
          threshold,
          status: 'skip',
          textToken: pair.text,
          bgToken: pair.bg,
          textColor,
          bgColor,
        });
        continue;
      }
      const lcRaw = calcAPCA(textColor, bgColor);
      const absLc = Math.abs(typeof lcRaw === 'number' ? lcRaw : Number(lcRaw) || 0);
      const pass = absLc >= threshold;
      if (!pass) failures += 1;
      results.push({
        palette: pal.id,
        pair: pair.id,
        kind: pair.kind,
        threshold,
        textToken: pair.text,
        bgToken: pair.bg,
        textColor,
        bgColor,
        lc: Number(absLc.toFixed(1)),
        status: pass ? 'pass' : 'FAIL',
      });
    }
  }
  return { failures, skipped, evaluated: results.length - skipped, results };
}

/** Render the APCA evidence Markdown (written by --apca-report; also the shape
 * printed in report mode). */
function renderApcaMarkdown(apca) {
  const lines = [];
  lines.push('# APCA contrast pairings (WO-GAT-04)');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');
  lines.push(
    `Thresholds: body-text |Lc| >= ${APCA_BODY_MIN}; large-text/UI |Lc| >= ${APCA_UI_MIN}. ` +
      `Failures (below threshold): ${apca.failures}. Skipped (unresolvable, counted): ${apca.skipped}. ` +
      `Evaluated: ${apca.evaluated}.`
  );
  lines.push('');
  lines.push('| Palette | Pairing | Kind | Text | Bg | Lc | Floor | Status |');
  lines.push('| --- | --- | --- | --- | --- | --- | --- | --- |');
  for (const r of apca.results) {
    lines.push(
      `| ${r.palette} | ${r.pair} | ${r.kind} | ${r.textColor ?? r.textToken} | ${r.bgColor ?? r.bgToken} | ${
        r.lc ?? '—'
      } | ${r.threshold} | ${r.status} |`
    );
  }
  lines.push('');
  return lines.join('\n');
}

const files = modernFiles(componentsDir);
const motion = countMotionLiterals(files);
const effects = countEffectConsumers();
const colorFiles = modernColorFiles(componentsDir);
const color = countColorLiterals(colorFiles);
const themeCssAudit = auditThemeCss(files);
const classicFiles = collectEngineFiles(componentsDir, 'classic');
const rusticFiles = collectEngineFiles(componentsDir, 'rustic');
const classicThemeAudit = auditEngineTheme(classicThemeCssPath, classicFiles, {
  // "ant-" (Ant Design 5.x component classes), "anticon" (Ant Design's icon-font class -- no
  // hyphen after "ant"), "slick-" (react-slick, vendored internally by antd's Carousel). All
  // three are externally-consumed runtime classes, never written literally in DS source -- see
  // auditEngineTheme's doc comment for how this list was derived from the measured baseline.
  allowlistPrefixes: ['ant-', 'anticon', 'slick-'],
});
const rusticThemeAudit = auditEngineTheme(rusticThemeCssPath, rusticFiles);
const crossEngineLayoutDivergences = countCrossEngineLayoutDivergences();
const apca = evaluateApcaPairings();

/* ============================================================================
   Off-canon vocabulary gate (WO-ARC-01, proposal P-13): the component API
   normalization sweep drives two duplication shapes to zero across every
   packages/core/src/ui/**\/*.types.ts file:
    - an undocumented raw 'small' | 'middle' | 'large' union on a type-alias declaration line
      -- the antd-style spelling a Size-derived canonical type plus a `@deprecated`-marked
      `Legacy*Size` alias replaces (e.g. TreeSelect.types.ts's `TreeSelectSize = Extract<Size,
      'sm'|'md'|'lg'>` paired with `LegacyTreeSelectSize = 'small'|'middle'|'large'`). A
      declaration whose immediately-preceding JSDoc block carries `@deprecated` is a sanctioned
      one-release compatibility alias and is exempt; an undocumented raw union is the
      violation this counter targets.
    - a size-vocabulary type name (`export type <Name>Size = ...` / `export type ModalSize =
      ...`) declared -- not merely re-exported -- in more than one components-tree file (the
      `ButtonSize` / `ModalSize` duplication the WO's research found). `ModalSize` collapsed to
      one declaration in contracts/common with both Modal families re-exporting it (`export
      type { ModalSize }`, not a second `= ...` assignment), so a re-export never counts.
   Target: 0 for both. Decrease-only.
   ============================================================================ */

/** Every `.types.ts` file under `packages/core/src/ui/**`. */
function collectTypesFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...collectTypesFiles(full));
    else if (full.endsWith('.types.ts')) out.push(full);
  }
  return out;
}

/**
 * True when a `@deprecated` JSDoc tag appears anywhere in the comment block immediately
 * preceding source line index `declIndex` in `lines` -- walked upward through `*`-prefixed
 * comment-body lines and the block's own `/**` opener; stops (no exemption) at the first line
 * that is neither the opener nor a `*`-prefixed body line, so a declaration with no JSDoc
 * directly above it is never exempted by an unrelated comment further up the file.
 */
function precededByDeprecatedTag(lines, declIndex) {
  let sawDeprecated = false;
  let j = declIndex - 1;
  while (j >= 0) {
    const line = lines[j];
    if (/@deprecated/.test(line)) sawDeprecated = true;
    if (/^\s*\/\*\*/.test(line)) break; // reached the JSDoc block's opening line
    if (line.trim() !== '' && !line.trim().startsWith('*')) break; // no JSDoc directly above
    j -= 1;
  }
  return sawDeprecated;
}

/**
 * Count undocumented raw `'small' | 'middle' | 'large'` union literals on a `export type <Name>
 * = ...` declaration line, across every `.types.ts` file under
 * packages/core/src/ui/**. Scoped to type-alias declaration lines (not e.g. a
 * `Record<...>` value map like `SPACE_SIZE_MAP`, which legitimately stays keyed by the legacy
 * spelling internally) -- see this gate's module doc for the exemption rule.
 */
function countRawAntdSizeUnions(files) {
  let count = 0;
  for (const file of files) {
    const lines = readFileSync(file, 'utf8').split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!/^\s*export type \w+\s*=/.test(line)) continue;
      if (!(/'small'/.test(line) && /'middle'/.test(line) && /'large'/.test(line))) continue;
      if (precededByDeprecatedTag(lines, i)) continue;
      count += 1;
    }
  }
  return count;
}

/**
 * Count size-vocabulary type names (any `export type <Name> = ...` where `<Name>` ends in
 * `Size`, e.g. `ButtonSize`, `ModalSize`) DECLARED -- not merely re-exported via `export type {
 * Name }` -- in more than one packages/core/src/ui/**\/*.types.ts file. Each name's
 * site count beyond the first is a duplicate (a name declared 3 times contributes 2).
 */
function countDuplicateSizeVocabDeclarations(files) {
  const declRe = /^export type (\w*Size)\s*=/;
  const sitesByName = new Map();
  for (const file of files) {
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      const m = declRe.exec(line.trim());
      if (!m) continue;
      const name = m[1];
      if (!sitesByName.has(name)) sitesByName.set(name, []);
      sitesByName.get(name).push(file);
    }
  }
  let duplicates = 0;
  for (const sites of sitesByName.values()) {
    if (sites.length > 1) duplicates += sites.length - 1;
  }
  return duplicates;
}

const typesFiles = collectTypesFiles(componentsDir);
const rawAntdSizeUnions = countRawAntdSizeUnions(typesFiles);
const duplicateSizeVocabDeclarations = countDuplicateSizeVocabDeclarations(typesFiles);

// ---------------------------------------------------------------------------
// WO-ENG-12 — responsive counters (spec section 13)
// ---------------------------------------------------------------------------

/**
 * The content box a 360px viewport actually offers: 360 minus the capture
 * route's page padding (2 x 24) and card padding (2 x 16), minus the card
 * borders. A `width`/`min-width` literal at or above this cannot fit on a
 * phone no matter what its ancestors do — it is a horizontal-overflow source
 * by arithmetic, not by taste.
 *
 * The threshold is deliberately NOT a smaller, rounder number. A control-sized
 * literal (a 48px table checkbox column, a 32px close button, a 20px chevron)
 * fits a phone and is not a responsive defect; counting it would bury the real
 * defect class in noise and invite the counter to be gamed rather than fixed.
 */
const RESPONSIVE_WIDTH_THRESHOLD_PX = 278;

/**
 * Literals exempt from the counter, each with the reason it cannot overflow.
 * Keyed by `<path from src/>:<px>` — every modern skin file is named
 * `modern.tsx`, so a basename key would silently exempt unrelated components.
 *
 * The only sanctioned reason is the one below: a panel rendered in a portal and
 * anchored to the VIEWPORT is bounded by 360px, not by the 278px content box, so
 * a width under 360 fits a phone. An exemption is a claim a reviewer can check —
 * never add one to silence an in-flow fixed width; make that width intrinsic.
 */
const FIXED_WIDTH_EXEMPTIONS = new Set([
  // Popover content: portaled, viewport-anchored, 300 < 360.
  'src/ui/patterns/data/list-toolbar/engines/modern/index.tsx:300',
  // Hover overlay: portaled, viewport-anchored, 288 < 360.
  'src/ui/primitives/overlay/HoverCard/engines/modern/index.tsx:288',
  // Calendar panel: portaled, viewport-anchored, 288 < 360.
  'src/ui/primitives/inputs/DatePicker/engines/modern/index.tsx:288',
]);

/**
 * Fixed-width literals across the modern skin files and the modern engine
 * theme.css. `max-width` is never counted: it is an upper bound, which is the
 * fix, not the defect. Decrease-only; target 0 above the allowlist.
 */
function countFixedWidthLiterals(skinFiles, modernThemeCss) {
  let count = 0;

  const tally = (file, value) => {
    if (value < RESPONSIVE_WIDTH_THRESHOLD_PX) return;
    const fromSrc = file.slice(file.indexOf(`${sep}src${sep}`) + 1);
    if (FIXED_WIDTH_EXEMPTIONS.has(`${fromSrc}:${value}`)) return;
    count += 1;
  };

  // Inline styles: `width: '180px'` / `minWidth: 180` (the numeric form is px in React).
  const inlineQuoted = /\b(?:minWidth|width)\s*:\s*(['"])(\d+)px\1/g;
  const inlineNumeric = /\b(?:minWidth|width)\s*:\s*(\d+)\s*[,}]/g;
  for (const file of skinFiles) {
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(inlineQuoted)) tally(file, Number(match[2]));
    for (const match of source.matchAll(inlineNumeric)) tally(file, Number(match[1]));
  }

  // Stylesheet declarations: `width: 180px` / `min-width: 180px`.
  if (existsSync(modernThemeCss)) {
    const css = readFileSync(modernThemeCss, 'utf8');
    for (const match of css.matchAll(/(?:^|[\s;{])(?:min-)?width\s*:\s*(\d+)px/gm)) {
      tally(modernThemeCss, Number(match[1]));
    }
  }

  return count;
}

/**
 * Capture cells (component x tenant palette) that still overflow a 360px
 * viewport, read from the probe baseline the showroom responsive spec owns
 * (`e2e/responsive/overflow-baseline.json`). The browser probe measures;
 * this counter is what makes the measurement a blocking, decrease-only ratchet
 * in the same place as every other section-12 number. A missing file counts 0 —
 * the spec bootstraps it on first run.
 */
function countResponsiveOverflowCells() {
  const baselineFile = join(here, '../../showroom/e2e/responsive/overflow-baseline.json');
  if (!existsSync(baselineFile)) {
    // Never return 0 for a missing file: a vacuous zero would report a green
    // ratchet for a gate that is not wired at all.
    throw new Error(`responsive overflow baseline missing at ${baselineFile}`);
  }
  const parsed = JSON.parse(readFileSync(baselineFile, 'utf8'));
  return Array.isArray(parsed.overflowing) ? parsed.overflowing.length : 0;
}

/* ============================================================================
   Compositor-only motion gate (WO-CRA-06, choreography layer, spec section 2
   "animate transform/opacity only"): flags `transition`/`animation` targeting
   a layout property (top, left, width, height, margin, padding, and their
   -top/-right/-bottom/-left edges) in modern-engine component source.
   Reflow-triggering properties are the opposite of what makes CSS motion
   cheap; `transform`/`opacity` are compositor-only and belong on every
   animated node instead. Two shapes are scanned, both narrowly:
    - inline `transition`/`transitionProperty` string values naming the
      property as the first token of a (possibly comma-separated) segment
      -- the CSS transition shorthand's own grammar (`<property> <duration>
      <easing> ...`), so a duration/easing token that merely CONTAINS one of
      these words never matches.
    - `@keyframes` block bodies (this codebase's established inline
      `<style>` template-literal pattern -- see Modal/Drawer/Toast/Dropdown/
      ContextMenu) whose steps declare the property.
   Does NOT trace an `animation-name` reference to a keyframe defined in a
   SEPARATE file (e.g. the shared foundation keyframes.css/transitions.css):
   every keyframe in those two foundation files was verified compositor-only
   by hand when this counter was introduced (WO-CRA-06); a modern-engine
   file's OWN inline `@keyframes` block is what this counter watches going
   forward. One count per defect SITE (a transition declaration or a
   keyframes block), not per property token within it. Decrease-only
   ratchet; target 0 in any file a future WO's own remit touches.
   ============================================================================ */

const LAYOUT_PROPERTY_TOKENS_KEBAB = [
  'top',
  'left',
  'width',
  'height',
  'margin',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
];

/** Same token set, camelCase (JS inline-style property names). */
const LAYOUT_PROPERTY_TOKENS_CAMEL = [
  'top',
  'left',
  'width',
  'height',
  'margin',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'padding',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
];

/** Count `@keyframes NAME { ... }` block bodies in `text` that declare one of LAYOUT_PROPERTY_TOKENS_KEBAB. */
function countLayoutPropertyKeyframes(text) {
  let count = 0;
  const kfRe = /@keyframes\s+[\w-]+\s*\{/g;
  const propRe = new RegExp(`(?:^|[\\s;{])(?:${LAYOUT_PROPERTY_TOKENS_KEBAB.join('|')})\\s*:`, 'i');
  let m;
  while ((m = kfRe.exec(text))) {
    const bodyStart = kfRe.lastIndex; // just past the opening `{`
    const bodyEnd = matchBrace(text, bodyStart - 1);
    const body = text.slice(bodyStart, bodyEnd - 1);
    if (propRe.test(body)) count += 1;
    kfRe.lastIndex = bodyEnd;
  }
  return count;
}

/**
 * Count `transition`/`transitionProperty` inline-style STRING VALUES in
 * `text` that name one of LAYOUT_PROPERTY_TOKENS_CAMEL as the transitioned
 * property (the first whitespace-separated token of a comma-separated
 * segment -- the CSS transition shorthand's own grammar, or the whole
 * segment for `transitionProperty`'s bare property list).
 */
function countLayoutPropertyTransitions(text) {
  let count = 0;
  const transRe = /transition(?:Property)?\s*:\s*(['"`])((?:(?!\1)[\s\S])*)\1/g;
  let m;
  while ((m = transRe.exec(text))) {
    const segments = m[2].split(',');
    for (const seg of segments) {
      const firstToken = seg.trim().split(/\s+/)[0] || '';
      if (LAYOUT_PROPERTY_TOKENS_CAMEL.includes(firstToken)) {
        count += 1;
        break; // one count per transition declaration, not per segment
      }
    }
  }
  return count;
}

/** Aggregate both shapes across a file list. See module doc above this section. */
function countCompositorOnlyViolations(fileList) {
  let count = 0;
  for (const file of fileList) {
    const text = readFileSync(file, 'utf8');
    count += countLayoutPropertyKeyframes(text) + countLayoutPropertyTransitions(text);
  }
  return count;
}

/**
 * WO-TOK-02 (perceptual color ramp derivation): counts per-step
 * `--ds-color-{role}-{50..900}` ramp hex hand-authored in any first-party
 * artifact's `_source/extension.css`, beyond the sanctioned seeds
 * (BrandTheme `.ts` palette fields) and `dark*` overrides. `compileBrandTheme`
 * (deriveTenantColorRamps) now derives this ramp mechanically per tenant
 * surface, so a hand-authored ramp step here is drift, not intent: it either
 * duplicates (redundant, will silently rot out of sync) or -- because the
 * extension's selector always has equal-or-higher specificity than the
 * compiled block's -- shadows the derivation outright. Decrease-only,
 * target 0. rottay's dark-default block is the one accepted, documented
 * exception (WO-TOK-01/WO-ENG-22: its compiled block is scoped to the
 * explicit light toggle, not its default surface, so the derivation cannot
 * yet reach rottay's shipped default rendering -- see roadmap/tokens.md
 * WO-TOK-02 for the full rationale); bithire's and evnto's default (light)
 * blocks were drained in this WO and must stay at 0.
 */
function countHandAuthoredRampHex() {
  const slugs = ['bithire', 'evnto', 'rottay'];
  const rampDecl =
    /--ds-color-(?:primary|secondary|accent|success|warning|error|info)-(?:50|100|200|300|400|500|600|700|800|900):\s*#[0-9a-fA-F]{3,8}\s*;/g;

  let count = 0;
  for (const slug of slugs) {
    const extensionPath = join(artifactsDir, slug, '_source/extension.css');
    if (!existsSync(extensionPath)) continue;
    const text = readFileSync(extensionPath, 'utf8');
    const matches = text.match(rampDecl);
    count += matches ? matches.length : 0;
  }
  return count;
}

const counters = {
  'motion.cubicBezierLiterals': motion.cubicBezier,
  'motion.rawDurationLiterals': motion.rawDuration,
  'motion.orphanMotionTokens': motion.orphanTokens,
  // WO-CRA-06 (choreography layer): compositor-only law. See this counter's
  // module doc (search "Compositor-only motion gate") for exact scope.
  'motion.compositorOnlyViolations': countCompositorOnlyViolations(files),
  // WO-CRA-15 (motion recipe canon adoption): distinct src/ui components whose
  // production source consumes useMotionRecipe*/useMotionRecipePresentation.
  // MIN floor: the recipe canon must never regress to zero functional
  // consumers again (audit MOT-02). See countRecipeConsumers() for scope.
  'motion.recipeConsumers': countRecipeConsumers(),
  'depth.shadowScales': countShadowScales(),
  'depth.darkPureBlackElevations': countDarkPureBlackElevations(),
  'scale.radiusScaleDeclarations': countRadiusScaleDeclarations(),
  'scale.fallbackParityViolations': countFallbackParityViolations(),
  'state.darkFocusRingDefects': countDarkFocusRingDefects(),
  'state.inlineStateLiterals': countInlineStateLiterals(),
  // NOT the authority on whether the effect renders. This is a MIN floor over
  // the number of FILES that mention var(--ds-gradient-surface); it stayed green
  // while rottay's card face measured a top-to-bottom luminance delta of exactly
  // 0.000. The pixel gate is packages/showroom/e2e/visual/effects.spec.ts, which
  // decodes a screenshot. Keep this floor: it still catches a component that
  // stops reading the token entirely.
  'effects.gradientConsumers': effects.gradient,
  'effects.glassConsumers': effects.glass,
  'effects.glowConsumers': effects.glow,
  // WO-TOK-03 verdict 2026-07-10: DaisyUI stays; the residue is ratcheted.
  'daisy.classConsumers': countDaisyClassConsumers(files),
  'color.modernHexLiterals': color.hex,
  'color.modernRgbaLiterals': color.rgba,
  'color.handAuthoredRampSteps': countHandAuthoredRampHex(),
  'themeCss.unreferencedSelectors': themeCssAudit.unreferencedSelectors,
  'themeCss.lineCount': themeCssAudit.lineCount,
  // WO-GAT-02: classic/rustic dead-selector counters, generalized from WO-ENG-08's modern scan
  // (`auditEngineTheme`, shared). Decrease-only, no hard target -- draining classic/rustic CSS
  // is future work; these counters only stop further growth. Classic's near-total .ant-*
  // allowlisting (see auditEngineTheme's doc comment) is reported separately, not counted here.
  'themeCss.deadSelectorsClassic': classicThemeAudit.unreferencedSelectors,
  'themeCss.deadSelectorsRustic': rusticThemeAudit.unreferencedSelectors,
  'content.magicZIndex': countMagicZIndex(files),
  'layout.crossEngineDivergences': crossEngineLayoutDivergences,
  // WO-GAT-04 (accessibility CI, proposal P-10): APCA text/surface pairings below their Lc
  // threshold, across the foundation + rottay/bithire/evnto palettes. Decrease-only, no hard
  // target (dark-surface saturated status colors and low-emphasis muted text sit below the bar
  // today; a future color WO ratchets them down). Skip count (unresolvable pairs) is reported,
  // not gated — see evaluateApcaPairings(). Threshold + pairing list documented at APCA_PAIRINGS.
  'a11y.apcaPairings': apca.failures,
  // WO-ENG-12 (spec section 13). Both decrease-only. fixedWidthLiterals is a
  // static scan; overflowCells reflects what the browser actually measured at
  // 360px and is owned by packages/showroom/e2e/responsive/.
  'responsive.fixedWidthLiterals': countFixedWidthLiterals(files, themeCssPath),
  'responsive.overflowCells': countResponsiveOverflowCells(),
  // WO-ARC-01 (component API normalization, proposal P-13): the offcanon-vocabulary gate --
  // see this file's "Off-canon vocabulary gate" module doc above for the counting method and
  // the @deprecated exemption rule. Both decrease-only.
  'vocabulary.rawAntdSizeUnions': rawAntdSizeUnions,
  'vocabulary.duplicateSizeDeclarations': duplicateSizeVocabDeclarations,
  // WO-ARC-05: a skin adapts to its container, not to the window. Decrease-only,
  // and the baseline is 0 -- so the first viewport breakpoint added to a skin
  // fails the build, which is the point.
  'responsive.viewportMqInSkins': countViewportMediaQueriesInSkins(),
  // WO-SKIN-03: a skin that does not PARSE loads no rules at all, and every
  // other signal stays green -- the counter reads source text, tsc never sees
  // CSS, and the unit suites assert the DOM. A stray `*/` inside a header
  // comment silently voided an entire migrated skin this way. Exact-0.
  'skins.parseErrors': countSkinParseErrors(),
  // WO-SKIN-03: a skin nobody imports paints nothing, and it fails exactly as
  // quietly as one that does not parse -- a dead agent left nine of them behind
  // this batch. Every skin must reach BOTH entrypoints: foundation/base.css
  // (which feeds the per-tenant bundles the apps actually load) and
  // entrypoints/styles.css (which feeds dist/styles.css). Exact-0.
  'skins.unwired': countUnwiredSkins(),
  // WO-SKIN-06: sites whose PAINT VALUE is runtime data (a tenant's chosen hex, a
  // per-datum chart colour, a per-user identity colour) cannot live in a skin. They
  // are NOT pending work -- carrying them as debt that can never reach 0 is a lie in
  // the ratchet, and it sends migration agents chasing an impossible zero. Each is
  // declared with concrete per-file channel FLOORS in roadmap/skin-exemptions.json.
  // Inline and runtime-SVG floors are summed separately across families before
  // comparison; malformed configuration, globs, missing files and files migrated
  // below either sum all breach this exact-0 gate.
  // This proves aggregate per-file cardinality only. The checkpoint contract plus its
  // focused and visual tests prove that the remaining sites are the intended expressions
  // and still render correctly; this counter does not infer source-site identity.
  'skins.exemptionsBreached': countSkinExemptionBreaches({
    exemptionsPath: join(repoRoot, 'roadmap/skin-exemptions.json'),
    componentsDir,
  }),
  // WO-SKIN-06 (P-79): the THIRD way a skin silently paints nothing. It parses
  // (skins.parseErrors) and it is imported (skins.unwired), but every one of its
  // selectors anchors on a `[data-part='X']` the source never stamps -- because
  // Grid/Card drop a consumer's data-part, or the part was renamed, or it is a
  // typo. tsc accepts it, the counter does not read attributes, and the rule
  // reaches nobody. Static, exact-0: every part a skin selects for must be
  // stamped somewhere in the components tree.
  'skins.deadParts': countDeadParts(),
  // WO-ARC-09: per-file inline-paint ratchet over the six workspace-tier
  // components' migratable files. Decrease-only; each checkpoint's exit is its
  // files at 0. See countArc09PaintInFile()'s doc for the paint-vs-layout rule.
  ...arc09InlinePaintCounters(),
  ...fleetInlinePaintCounters(),
  ...runtimeSvgPaintCounters(),
  ...embeddedCssPaintCounters(),
};

/**
 * Adversarial fixture seam used only by WO-GAT-07's end-to-end evasion drills.
 *
 * The fixture is parsed by the same production counters as the real component
 * tree, then added to two existing completed-zero keys. This avoids a toy
 * duplicate scanner and avoids adding test-only counters to the 2,922-key
 * baseline. Normal runs have no fixture and therefore no behavior change.
 */
const evasionFixture = argumentValue('--gat07-evasion-fixture');
let evasionProbe = null;
if (evasionFixture) {
  const fixturePath = resolve(evasionFixture);
  if (!existsSync(fixturePath) || !statSync(fixturePath).isFile()) {
    throw new Error(`WO-GAT-07 evasion fixture does not exist: ${fixturePath}`);
  }
  const fixtureText = readFileSync(fixturePath, 'utf8');
  evasionProbe = {
    fixture: fixturePath,
    inlinePaint: countArc09PaintInFile(fixtureText, fixturePath),
    embeddedCssPaint: countEmbeddedCssPaintInFile(fixtureText, fixturePath),
  };
  counters['arc09.inlinePaint.primitives/display/Table/engines/modern/index.tsx'] +=
    evasionProbe.inlinePaint;
  counters['embeddedCssPaint.primitives/display/Table/engines/modern/index.tsx'] +=
    evasionProbe.embeddedCssPaint;
}

/**
 * WO-ARC-05: viewport media queries inside the engine SKIN stylesheets.
 *
 * A design system renders the same component at rail width, half width and full
 * width inside one viewport. A viewport media query cannot tell those apart, so
 * `@container` is the sanctioned mechanism for a skin that must adapt to its box.
 * This counts only width-conditioned `@media` rules -- `prefers-reduced-motion`,
 * `pointer: coarse` and `prefers-color-scheme` are answers to the user and the
 * device, not to a box, and they are not what this gate is about.
 *
 * Decrease-only. Baseline measured at 0: the two skins that exist adapt through
 * their tokens and their anatomy, not through a breakpoint.
 */
/**
 * WO-SKIN-03: every skin stylesheet must parse.
 *
 * The migration's whole premise is that paint removed from a component is paint
 * a skin now carries. If the skin fails to parse, the browser drops it and the
 * component ships unpainted -- and nothing else in the chain notices: the
 * inline-paint counter reads the component's source, `tsc` does not read CSS,
 * and jsdom suites assert the DOM, not the stylesheet. Only a pixel diff would
 * catch it, and only for a state some baseline happens to photograph.
 *
 * Exact-0: the first unparseable skin fails the build.
 */
function countSkinParseErrors() {
  let errors = 0;
  for (const file of collectSkinFiles()) {
    try {
      postcss.parse(readFileSync(file, 'utf8'), { from: file });
    } catch (err) {
      errors += 1;
      console.error(`  - skin does not parse: ${file.replace(root + sep, '')} -- ${err.message}`);
    }
  }
  return errors;
}

/**
 * WO-SKIN-03: every skin stylesheet must be imported by BOTH entrypoints.
 *
 * A skin file that exists but is imported nowhere is bytes on disk: the browser
 * never sees it, the component it was written for ships unpainted, and every
 * other signal stays green (the counter reads the component's TSX, `tsc` does
 * not read CSS, jsdom does not read stylesheets). The two entrypoints are not
 * interchangeable -- `facade/entrypoints/base.css` is inlined into the
 * per-tenant bundles (dist/platform.css, dist/bithire.css) that the apps
 * actually load, while `facade/entrypoints/styles.css` feeds dist/styles.css. A skin wired into only
 * one of them is dark for half the fleet.
 *
 * Exact-0: the first unwired skin fails the build.
 */
function countUnwiredSkins() {
  const entrypoints = ['src/foundation/tokens/css/facade/entrypoints/base.css', 'src/foundation/tokens/css/facade/entrypoints/styles.css'].map((rel) => ({
    rel,
    css: readFileSync(join(root, rel), 'utf8'),
  }));

  let unwired = 0;
  for (const file of collectSkinFiles()) {
    // The import specifier every entrypoint uses, e.g. `engines/modern/skin/toast.css`
    // or `components/skin/toast-compounds.css` -- matched as a path suffix so the
    // relative prefix (`../`) does not matter.
    const specifier = file
      .slice(file.indexOf(`${sep}tokens${sep}css${sep}`) + `${sep}tokens${sep}css${sep}`.length)
      .split(sep)
      .join('/');
    for (const { rel, css } of entrypoints) {
      const imported = new RegExp(`@import\\s+['"][^'"]*${specifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`).test(
        css
      );
      if (!imported) {
        unwired += 1;
        console.error(`  - skin is not imported by ${rel}: ${specifier}`);
      }
    }
  }
  return unwired;
}

/** Every unlayered skin stylesheet: the per-engine homes plus the agnostic one. */
function collectSkinFiles() {
  const skins = [];
  const walk = (dir) => {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.endsWith('.css') && full.includes(`${sep}skin${sep}`)) skins.push(full);
    }
  };
  walk(join(root, 'src/foundation/tokens/css/runtime/engines'));
  walk(join(root, 'src/foundation/tokens/css/presentation/components/skin'));
  return skins;
}

function countViewportMediaQueriesInSkins() {
  const skins = [];
  const walk = (dir) => {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.endsWith('.css') && full.includes(`${sep}skin${sep}`)) skins.push(full);
    }
  };
  walk(join(root, 'src/foundation/tokens/css/runtime/engines'));
  // WO-ARC-09: the engine-agnostic skin home for structures + shared files.
  walk(join(root, 'src/foundation/tokens/css/presentation/components/skin'));

  let count = 0;
  for (const file of skins) {
    const css = readFileSync(file, 'utf8');
    for (const match of css.matchAll(/@media([^{]*)\{/g)) {
      const condition = match[1];
      if (/\b(min-width|max-width|width)\b/.test(condition)) count += 1;
    }
  }
  return count;
}

const mode = process.argv.includes('--current-json')
  ? 'current-json'
  : process.argv.includes('--check')
  ? 'check'
  : process.argv.includes('--update-baseline')
  ? 'update'
  : process.argv.includes('--coverage')
  ? 'coverage'
  : process.argv.includes('--apca-report')
  ? 'apca-report'
  : 'report';

if (mode === 'update') {
  if (evasionFixture) {
    console.error('engine-token-audit: --update-baseline cannot run with --gat07-evasion-fixture');
    process.exit(1);
  }
  if (!existsSync(baselinePath)) {
    console.error('engine-token-audit: baseline initialization requires an explicit reviewed file, not --update-baseline');
    process.exit(1);
  }
  const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
  const tightening = evaluateBaselineTightening({ baseline, candidate: counters, exact: EXACT, minimum: MIN });
  if (!tightening.ok) {
    console.error('engine-token-audit --update-baseline REFUSED (updates may only tighten existing counters):');
    for (const error of tightening.errors) console.error(`  - ${error}`);
    process.exit(1);
  }
  const temporaryPath = `${baselinePath}.tmp-${process.pid}`;
  writeFileSync(temporaryPath, JSON.stringify(counters, null, 2) + '\n');
  renameSync(temporaryPath, baselinePath);
  const locks = summarizeZeroLocks(counters, { exact: EXACT, minimum: MIN });
  if (!locks.ok) throw new Error(`cannot summarize tightened baseline: ${locks.errors.join('; ')}`);
  console.log(
    `engine-token-audit: baseline tightened atomically (${locks.counters} counters; ${locks.zeroLocked} zero-locked; ${locks.positiveOrdinaryCeilings} decrease-only ceilings; ${locks.positiveExactInvariants} positive exact invariants; ${locks.positiveMinimumFloors} positive minimum floors)`,
  );
  process.exit(0);
}

if (mode === 'coverage') {
  const coverage = buildTokenCoverage();
  const { jsonPath, mdPath } = writeCoverageArtifacts(coverage);
  console.log('engine-token-audit --coverage: wrote');
  console.log(`  ${jsonPath}`);
  console.log(`  ${mdPath}`);
  console.log(
    `engine-token-audit — token coverage: ${coverage.filesScanned} files scanned, ${coverage.tokensConsumedUnique} unique --ds-* tokens consumed, ${coverage.literalsOutstandingTotal} hardcoded literals outstanding`
  );
  process.exit(0);
}

if (mode === 'apca-report') {
  // WO-GAT-04 evidence: persist the full APCA pairing table to test-artifacts/gates/gat-04/.
  const outDir = join(gatesDir, 'gat-04');
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  const jsonPath = join(outDir, 'apca-report.json');
  const mdPath = join(outDir, 'apca-report.md');
  writeFileSync(
    jsonPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        thresholds: { body: APCA_BODY_MIN, ui: APCA_UI_MIN },
        ...apca,
      },
      null,
      2
    ) + '\n'
  );
  writeFileSync(mdPath, renderApcaMarkdown(apca));
  console.log('engine-token-audit --apca-report: wrote');
  console.log(`  ${jsonPath}`);
  console.log(`  ${mdPath}`);
  console.log(
    `engine-token-audit — APCA pairings: ${apca.failures} below threshold, ${apca.skipped} skipped (unresolvable), ${apca.evaluated} evaluated`
  );
  process.exit(0);
}

if (mode === 'current-json') {
  process.stdout.write(`${JSON.stringify(counters, null, 2)}\n`);
  // Let Node drain stdout naturally. An immediate process.exit() truncates
  // piped JSON at the platform's 64 KiB high-water mark, which made the
  // path-relocation tool parse an incomplete object once the corpus grew.
  process.exitCode = 0;
}

if (!quiet) {
  console.log('engine-token-audit — modern engine files:', files.length);
  for (const [k, v] of Object.entries(counters)) console.log(`  ${k}: ${v}`);
}

// WO-GAT-02: one-line token-coverage summary, appended to both report and --check output
// (computed unconditionally so --check callers see it too; the coverage report itself is
// informational and never gates -- see buildTokenCoverage()'s doc comment).
const coverageSummary = buildTokenCoverage();
if (!quiet) {
  console.log(
    `engine-token-audit — token coverage: ${coverageSummary.filesScanned} files scanned, ${coverageSummary.tokensConsumedUnique} unique --ds-* tokens consumed, ${coverageSummary.literalsOutstandingTotal} hardcoded literals outstanding`
  );
}

// WO-GAT-04: one-line APCA summary, appended to both report and --check output.
if (!quiet) {
  console.log(
    `engine-token-audit — APCA contrast: ${apca.failures} pairings below threshold (body>=${APCA_BODY_MIN}/ui>=${APCA_UI_MIN}), ${apca.skipped} skipped (unresolvable), ${apca.evaluated} evaluated across ${APCA_PALETTES.length} palettes`
  );
}

if (mode === 'report') {
  console.log('\nengine-token-audit — APCA pairing detail:');
  console.log('  palette   pairing                 kind  Lc     floor  status');
  for (const r of apca.results) {
    const lc = r.status === 'skip' ? '  skip' : String(r.lc).padStart(5);
    console.log(
      `  ${r.palette.padEnd(9)} ${r.pair.padEnd(23)} ${r.kind.padEnd(4)}  ${lc}  ${String(r.threshold).padStart(4)}   ${
        r.status
      }`
    );
  }
}

if (mode === 'report') {
  console.log(`\nengine-token-audit — theme.css consumed-class set: ${themeCssAudit.consumedSize} tokens`);
  console.log(`engine-token-audit — theme.css unreferenced selectors (${themeCssAudit.unreferenced.length}):`);
  for (const u of themeCssAudit.unreferenced) {
    console.log(`  line ${u.line}: ${u.selector.replace(/\s+/g, ' ')}`);
  }
  console.log(
    `\nengine-token-audit — classic/theme.css: ${classicThemeAudit.consumedSize} consumed classes, ${classicThemeAudit.allowlisted} externally-consumed (ant-/anticon/slick-) allowlisted, ${classicThemeAudit.unreferencedSelectors} dead:`
  );
  for (const u of classicThemeAudit.unreferenced) {
    console.log(`  line ${u.line}: ${u.selector.replace(/\s+/g, ' ')}`);
  }
  console.log(
    `\nengine-token-audit — rustic/theme.css: ${rusticThemeAudit.consumedSize} consumed classes, ${rusticThemeAudit.unreferencedSelectors} dead:`
  );
  for (const u of rusticThemeAudit.unreferenced) {
    console.log(`  line ${u.line}: ${u.selector.replace(/\s+/g, ' ')}`);
  }
}

if (mode === 'check') {
  if (!existsSync(baselinePath)) {
    console.error('engine-token-audit --check: no baseline (initialization requires an explicit reviewed baseline file)');
    process.exit(1);
  }
  const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
  const policy = evaluateZeroLockCheck({ baseline, current: counters, exact: EXACT, minimum: MIN });
  if (!policy.ok) {
    console.error('engine-token-audit --check FAILED:');
    for (const error of policy.errors) console.error(`  - ${error}`);
    if (evasionProbe) console.error(`  - WO-GAT-07 evasion fixture result: ${JSON.stringify(evasionProbe)}`);
    process.exit(1);
  }
  const locks = summarizeZeroLocks(baseline, { exact: EXACT, minimum: MIN });
  if (!locks.ok) {
    console.error(`engine-token-audit --check FAILED:\n  - ${locks.errors.join('\n  - ')}`);
    process.exit(1);
  }
  console.log(
    `engine-token-audit --check OK (${locks.counters} counters; ${locks.zeroLocked} completed zeros locked exactly; ${locks.positiveOrdinaryCeilings} decrease-only ceilings; ${locks.positiveExactInvariants} positive exact invariants; ${locks.positiveMinimumFloors} positive minimum floors)`,
  );
}
