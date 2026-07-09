#!/usr/bin/env node
/**
 * engine-token-audit — the modern-engine motion/token ratchet (WO-ENG-01..12 gate).
 *
 * Counts the motion + token literals the Quiet Premium spec (engines/modern/README.md
 * section 12) drives to zero, and enforces a DECREASE-ONLY ratchet: no counter may rise above
 * its recorded baseline. WO-ENG-01 seeds the motion counters, WO-ENG-03 the depth counters,
 * WO-ENG-07 the scale counters (radius-scale-declarations, fallback-parity), WO-ENG-04 the
 * interaction-state counters (dark-focus-ring-defects, inline-state-literals), WO-ENG-06 the
 * color-purity counters (modernHexLiterals, modernRgbaLiterals); later WOs extend this file
 * with the remaining section-12 counters (gradient/glass/glow usage, theme.css lines,
 * cross-engine layout).
 *
 * Usage:
 *   node scripts/engine-token-audit.mjs            # print the current counts
 *   node scripts/engine-token-audit.mjs --check    # exit 1 if any counter rose above baseline
 *   node scripts/engine-token-audit.mjs --update-baseline   # rewrite the baseline to current
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const componentsDir = join(root, "src/components");
const baselinePath = join(here, "engine-token-audit.baseline.json");

/** Collect every modern-engine component source file (`engines/modern.tsx` or `engines/modern/*.tsx`). */
function modernFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...modernFiles(full));
    } else if (/engines\/modern(\/[^/]+)?\.tsx?$/.test(full.replace(/\\/g, "/"))) {
      out.push(full);
    }
  }
  return out;
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
    } else if (/engines\/modern(\/[^/]+)?\.(tsx?|css)$/.test(full.replace(/\\/g, "/"))) {
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
  return text.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
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
 */
function countColorLiterals(files) {
  let hex = 0;
  let rgba = 0;
  const hexRe = /(?<!&)#[0-9a-fA-F]{3,8}\b/g;
  const rgbaRe = /\brgba?\(/g;
  for (const file of files) {
    const text = stripBlockComments(readFileSync(file, "utf8"));
    hex += (text.match(hexRe) || []).length;
    rgba += (text.match(rgbaRe) || []).length;
  }
  return { hex, rgba };
}

/** The motion token names components consume that the canon must define (else they resolve to fallbacks). */
const ORPHAN_MOTION_NAMES = [
  "--ds-motion-duration-fast",
  "--ds-motion-duration-slow",
  "--ds-motion-base",
  "--ds-motion-gentle",
  "--ds-motion-easing-ease-in-out",
];

function countMotionLiterals(files) {
  let cubicBezier = 0;
  let rawDuration = 0;
  let orphanTokens = 0;
  const cubicRe = /cubic-bezier\(/g;
  // Forbidden = INTERACTION-motion literals (< 1s). Milliseconds are always interaction
  // durations; seconds are counted only when < 1s. Durations >= 1s are loop/shimmer/spinner
  // tempos that legitimately sit outside the 120/200/320 canon and are allowlisted.
  const msRe = /\b\d+(?:\.\d+)?ms\b/g;
  const sRe = /(?<![\w.])(\d*\.?\d+)s(?![\w])/g;
  const orphanRe = new RegExp(
    ORPHAN_MOTION_NAMES.map((n) => n.replace(/[-]/g, "\\-")).join("|"),
    "g",
  );
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    cubicBezier += (text.match(cubicRe) || []).length;
    rawDuration += (text.match(msRe) || []).length;
    for (const m of text.matchAll(sRe)) {
      if (Number(m[1]) < 1) rawDuration += 1; // sub-second seconds are interaction durations
    }
    orphanTokens += (text.match(orphanRe) || []).length;
  }
  return { cubicBezier, rawDuration, orphanTokens };
}

const tokensCssDir = join(root, "src/tokens/css");
const artifactsDir = join(tokensCssDir, "artifacts");

/** Recursively collect every `.css` file under a directory. */
function cssFilesUnder(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...cssFilesUnder(full));
    else if (full.endsWith(".css")) out.push(full);
  }
  return out;
}

/** NTSC perceived luminance (0-255) of a 6-digit hex color. */
function luminanceHex(hex) {
  const n = Number.parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
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
    ...cssFilesUnder(join(tokensCssDir, "foundation")),
    ...cssFilesUnder(join(tokensCssDir, "engines")),
  ];
  let scales = 0;
  for (const f of files) {
    const t = readFileSync(f, "utf8");
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
    const file = join(artifactsDir, slug, "index.css");
    if (!existsSync(file)) continue;
    const css = readFileSync(file, "utf8");
    const bg = css.match(/--ds-color-bg-primary:\s*(#[0-9a-fA-F]{6})/);
    if (!bg || luminanceHex(bg[1]) >= 128) continue; // not a dark-surface tenant
    // Split off the light-mode counterpart block (a POSITIVE light selector, not the
    // dark block's own `:not([data-theme='light'])` scope) so only the dark region
    // is scanned.
    const lightIdx = css.search(/(?<!:not\()\[data-theme=['"]light['"]\]|(?<!:not\()\.light(?=[\s,{])/);
    const darkRegion = lightIdx >= 0 ? css.slice(0, lightIdx) : css;
    const depthToken = /--ds-(?:elevation-[1-5]|shadow-(?:xs|sm|md|lg|xl|2xl)|card-shadow(?:-hover|-elevated)?):\s*([^;]+);/g;
    for (const m of darkRegion.matchAll(depthToken)) {
      const val = m[1].trim();
      if (val === "none") continue;
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
    ...cssFilesUnder(join(tokensCssDir, "foundation")),
    ...cssFilesUnder(join(tokensCssDir, "engines")),
  ];
  let scales = 0;
  for (const f of files) {
    const t = readFileSync(f, "utf8");
    if (
      /--ds-radius-sm:\s*(?!var\()[^;]*(?:px|rem)/.test(t) &&
      /--ds-radius-md:\s*(?!var\()[^;]*(?:px|rem)/.test(t)
    ) {
      scales += 1;
    }
  }
  return scales;
}

const foundationDir = join(tokensCssDir, "foundation");

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
    if (text[i] === "{") {
      let depth = 1;
      let j = i + 1;
      while (j < text.length && depth > 0) {
        if (text[j] === "{") depth += 1;
        else if (text[j] === "}") depth -= 1;
        j += 1;
      }
      const content = text.slice(i + 1, j - 1);
      const prevClose = text.lastIndexOf("}", i - 1);
      const selStart = prevClose === -1 ? 0 : prevClose + 1;
      const selector = text
        .slice(selStart, i)
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .trim();
      if (selector === ":root") {
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
  const priorityFile = join(foundationDir, "themes/default.css");
  const rest = cssFilesUnder(foundationDir).filter((f) => f !== priorityFile);
  for (const f of [priorityFile, ...rest]) {
    if (!existsSync(f)) continue;
    const text = readFileSync(f, "utf8");
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
  const unit = m[2] || "";
  if (unit === "rem") return ["px", num * 16];
  if (unit === "s") return ["ms", num * 1000];
  if (unit === "") return ["num", num];
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
  const srcDir = join(root, "src");
  let violations = 0;

  function walk(dir) {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const rel = full.slice(srcDir.length + 1).replace(/\\/g, "/");
      if (rel.startsWith("tokens/css/artifacts/") || rel.startsWith("tokens/css/legacy/")) continue;
      if (statSync(full).isDirectory()) {
        walk(full);
        continue;
      }
      if (!/\.(tsx?|css)$/.test(full)) continue;
      if (/__tests__|\.(test|spec|stories)\./.test(rel)) continue;
      const text = readFileSync(full, "utf8");
      for (const m of text.matchAll(usageRe)) {
        const token = m[1];
        const fallback = m[2].trim();
        if (fallback.includes("$") || fallback.includes("`") || fallback.includes("{")) continue; // dynamic, not a literal
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
  if (v === "transparent") return true;
  const hex = /^#([0-9a-f]{6})$/.exec(v);
  if (hex) return luminanceHex("#" + hex[1]) < 96;
  const hex3 = /^#([0-9a-f]{3})$/.exec(v);
  if (hex3) {
    const [r, g, b] = hex3[1].split("").map((c) => parseInt(c + c, 16));
    return r * 0.299 + g * 0.587 + b * 0.114 < 96;
  }
  const rgb = /^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)\s*(?:[,/]\s*([\d.]+%?))?\s*\)$/.exec(v);
  if (rgb) {
    const [r, g, b] = [rgb[1], rgb[2], rgb[3]].map(Number);
    let alpha = 1;
    if (rgb[4] !== undefined) alpha = rgb[4].endsWith("%") ? Number(rgb[4].slice(0, -1)) / 100 : Number(rgb[4]);
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
    const file = join(artifactsDir, slug, "index.css");
    if (!existsSync(file)) continue;
    const css = readFileSync(file, "utf8");
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
        if (varRef[1] === "--ds-color-primary") val = resolvePrimary() ?? val;
        else {
          const inner = darkRegion.match(new RegExp(`${varRef[1]}:\\s*([^;]+);`));
          val = inner ? inner[1].trim() : (varRef[2] ? varRef[2].trim() : val);
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
  "primitives/inputs/Button/engines/modern.tsx",
  "primitives/inputs/Input/engines/modern.tsx",
  "primitives/inputs/Select/engines/modern.tsx",
  "primitives/navigation/Tabs/engines/modern.tsx",
];

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
    const full = join(componentsDir, rel);
    if (!existsSync(full)) continue;
    const text = readFileSync(full, "utf8");
    count += (text.match(scaleRe) || []).length;
    count += (text.match(shadowLiteralRe) || []).length;
  }
  return count;
}

/**
 * Count render-layer files that CONSUME each sanctioned premium effect family
 * (spec section 5): gradient (surface-tint + accent), glass (overlay backdrops),
 * signal-glow. Scans src/components + src/motion (the render layer) and requires
 * a real `var(--ds-<family>...)` usage, so token definitions (premium.css), the
 * compiler, the useTokens() catalog, tenant artifacts, and comment mentions do
 * not count. The premium layer measured 1/0/0 (gradient/glass/glow) dead at the
 * 2026-07-06 baseline; WO-ENG-05 wires each family to > 0 sanctioned consumers
 * (enforced as a floor via MIN below).
 */
function countEffectConsumers() {
  const roots = [componentsDir, join(root, "src/motion")];
  const families = {
    gradient: /var\(\s*--ds-gradient-/,
    glass: /var\(\s*--ds-glass-/,
    glow: /var\(\s*--ds-shadow-glow-/,
  };
  const counts = { gradient: 0, glass: 0, glow: 0 };
  function walk(dir) {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const rel = full.replace(/\\/g, "/");
      if (statSync(full).isDirectory()) {
        walk(full);
        continue;
      }
      if (!/\.tsx?$/.test(full)) continue;
      if (/__tests__|\.(test|spec|stories)\./.test(rel)) continue;
      const text = readFileSync(full, "utf8");
      for (const [fam, re] of Object.entries(families)) {
        if (re.test(text)) counts[fam] += 1;
      }
    }
  }
  for (const r of roots) walk(r);
  return counts;
}

const files = modernFiles(componentsDir);
const motion = countMotionLiterals(files);
const effects = countEffectConsumers();
const colorFiles = modernColorFiles(componentsDir);
const color = countColorLiterals(colorFiles);

const counters = {
  "motion.cubicBezierLiterals": motion.cubicBezier,
  "motion.rawDurationLiterals": motion.rawDuration,
  "motion.orphanMotionTokens": motion.orphanTokens,
  "depth.shadowScales": countShadowScales(),
  "depth.darkPureBlackElevations": countDarkPureBlackElevations(),
  "scale.radiusScaleDeclarations": countRadiusScaleDeclarations(),
  "scale.fallbackParityViolations": countFallbackParityViolations(),
  "state.darkFocusRingDefects": countDarkFocusRingDefects(),
  "state.inlineStateLiterals": countInlineStateLiterals(),
  "effects.gradientConsumers": effects.gradient,
  "effects.glassConsumers": effects.glass,
  "effects.glowConsumers": effects.glow,
  "color.modernHexLiterals": color.hex,
  "color.modernRgbaLiterals": color.rgba,
  // Later WOs extend here: theme.css lines, cross-engine layout, ...
};

/** Invariants checked for exact equality (not just decrease-only) in --check. */
const EXACT = {
  // One elevation source of truth: the foundation ramp, with --ds-shadow-* aliases.
  "depth.shadowScales": 1,
  // One radius source of truth: foundation/themes/default.css.
  "scale.radiusScaleDeclarations": 1,
  // No dark-blind focus ring survives on any dark-surface tenant (audit 3.4).
  "state.darkFocusRingDefects": 0,
};

/**
 * Invariants checked as a MINIMUM floor (counter must be >= value) in --check.
 * Unlike the decrease-only ratchet, these are keys where a HIGHER value is
 * healthy: the number of sanctioned premium-effect consumers (spec section 5,
 * the 1/0/0 dead layer now wired). Keys here are exempt from the decrease-only
 * "risen above baseline" check.
 */
const MIN = {
  "effects.gradientConsumers": 1,
  "effects.glassConsumers": 1,
  "effects.glowConsumers": 1,
};

const mode = process.argv.includes("--check")
  ? "check"
  : process.argv.includes("--update-baseline")
    ? "update"
    : "report";

if (mode === "update") {
  writeFileSync(baselinePath, JSON.stringify(counters, null, 2) + "\n");
  console.log("engine-token-audit: baseline updated");
  console.log(counters);
  process.exit(0);
}

console.log("engine-token-audit — modern engine files:", files.length);
for (const [k, v] of Object.entries(counters)) console.log(`  ${k}: ${v}`);

if (mode === "check") {
  if (!existsSync(baselinePath)) {
    console.error("engine-token-audit --check: no baseline (run --update-baseline first)");
    process.exit(1);
  }
  const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
  const risen = [];
  for (const [k, v] of Object.entries(counters)) {
    if (k in MIN) continue; // floor-governed (higher is healthy), not ceiling-governed
    const base = baseline[k] ?? Infinity;
    if (v > base) risen.push(`${k}: ${v} > baseline ${base}`);
  }
  const invariant = [];
  for (const [k, expected] of Object.entries(EXACT)) {
    if (counters[k] !== expected) invariant.push(`${k}: ${counters[k]} != required ${expected}`);
  }
  const belowFloor = [];
  for (const [k, min] of Object.entries(MIN)) {
    if ((counters[k] ?? 0) < min) belowFloor.push(`${k}: ${counters[k]} < required >= ${min}`);
  }
  if (risen.length || invariant.length || belowFloor.length) {
    console.error("engine-token-audit --check FAILED:");
    for (const r of risen) console.error("  - rose above baseline: " + r);
    for (const r of invariant) console.error("  - invariant broken: " + r);
    for (const r of belowFloor) console.error("  - below required floor: " + r);
    process.exit(1);
  }
  console.log("engine-token-audit --check OK (all counters within baseline; invariants and floors hold)");
}
