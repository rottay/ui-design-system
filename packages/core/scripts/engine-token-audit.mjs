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
 *   node scripts/engine-token-audit.mjs --update-baseline   # rewrite the baseline to current
 *   node scripts/engine-token-audit.mjs --coverage # write the token-coverage report (informational)
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
// WO-GAT-04 (accessibility CI, proposal P-10): APCA is the perceptually-accurate contrast model
// (the successor to WCAG-2 ratios) used by the `a11y.apcaPairings` counter below. `apca-w3` is a
// ROOT devDependency (this script resolves it via Node's upward node_modules walk to the repo
// root, whichever workspace CWD invokes it). This is ADDITIVE gate machinery: it does NOT touch
// the shipped WCAG validator at src/_internal/a11y/contrast/index.ts (a published /server API).
import { calcAPCA } from "apca-w3";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const componentsDir = join(root, "src/components");
const baselinePath = join(here, "engine-token-audit.baseline.json");

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
    } else if (engineRe.test(full.replace(/\\/g, "/"))) {
      out.push(full);
    }
  }
  return out;
}

/** Collect every modern-engine component source file (`engines/modern.tsx` or `engines/modern/*.tsx`). */
function modernFiles(dir) {
  return collectEngineFiles(dir, "modern");
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
 *
 * The scan itself lives in `countColorLiteralsInText()` (per-text, below), factored out so the
 * WO-GAT-02 `--coverage` report can reuse the EXACT same detection rule per file instead of
 * forking a second regex that could drift from this counter's definition of "a color literal".
 * Callers must pass text already run through `stripBlockComments()`.
 */
function countColorLiteralsInText(strippedText) {
  const hexRe = /(?<!&)#[0-9a-fA-F]{3,8}\b/g;
  const rgbaRe = /\brgba?\(/g;
  return {
    hex: (strippedText.match(hexRe) || []).length,
    rgba: (strippedText.match(rgbaRe) || []).length,
  };
}

/** Aggregate `countColorLiteralsInText()` across a file list -- see that function's doc for the
 * counting method. */
function countColorLiterals(files) {
  let hex = 0;
  let rgba = 0;
  for (const file of files) {
    const text = stripBlockComments(readFileSync(file, "utf8"));
    const perFile = countColorLiteralsInText(text);
    hex += perFile.hex;
    rgba += perFile.rgba;
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
  const orphanRe = new RegExp(
    ORPHAN_MOTION_NAMES.map((n) => n.replace(/[-]/g, "\\-")).join("|"),
    "g",
  );
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    const perFile = countMotionLiteralsInText(text);
    cubicBezier += perFile.cubicBezier;
    rawDuration += perFile.rawDuration;
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

/* ============================================================================
   theme.css drain gate (WO-ENG-08, spec section 8): every remaining selector
   in modern/theme.css must be proven-consumed by a real modern-engine class
   render, or it is dead DaisyUI-mapping weight the drain must remove.
   ============================================================================ */

const themeCssPath = join(tokensCssDir, "engines/modern/theme.css");
/** WO-GAT-02: the classic/rustic counterparts of `themeCssPath`, scanned by the same shared
 * `auditEngineTheme()` helper (see below) -- never a second scan implementation. */
const classicThemeCssPath = join(tokensCssDir, "engines/classic/theme.css");
const rusticThemeCssPath = join(tokensCssDir, "engines/rustic/theme.css");

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
    addTokensFromContent(m[1].replace(/\$\{[^}]*\}/g, " "), set);
  }
}

/** Given the index of an opening `{`, return the index just past its
 * matching `}` (brace-depth matching). */
function matchBrace(text, openIdx) {
  let depth = 1;
  let j = openIdx + 1;
  while (j < text.length && depth > 0) {
    if (text[j] === "{") depth += 1;
    else if (text[j] === "}") depth -= 1;
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
  const re = new RegExp(`\\b(?:const|let|var)\\s+${name}\\b\\s*(?::[^=;]+)?=\\s*`, "g");
  const m = re.exec(text);
  if (!m) return null;
  let k = re.lastIndex;
  let depth = 0;
  while (k < text.length) {
    const c = text[k];
    if (c === "(" || c === "[" || c === "{") depth += 1;
    else if (c === ")" || c === "]" || c === "}") {
      if (depth === 0) break;
      depth -= 1;
    } else if (c === ";" && depth === 0) break;
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
    if (text[i] === "{") stack.push(i);
    else if (text[i] === "}") {
      const start = stack.pop();
      if (start !== undefined) ranges.push({ start: start + 1, end: i });
    }
  }
  return ranges;
}

/**
 * The class tokens every modern-engine component (`engines/modern.tsx` /
 * `engines/modern/*.tsx`) actually renders -- the theme.css gate's ground
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
const JS_KEYWORDS = new Set([
  "true", "false", "null", "undefined", "this", "typeof", "void",
]);

function buildConsumedClassSet(files) {
  const consumed = new Set();
  for (const file of files) {
    const text = stripBlockComments(readFileSync(file, "utf8"));

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
  "active", "disabled", "selected", "completed", "error", "success",
  "warning", "info", "checked", "open", "closed", "expanded", "collapsed",
  "hidden", "visible", "loading", "focused", "hovered", "pressed", "empty",
]);

/** Binary-searchable char-offset -> 1-based line-number index. */
function buildLineIndex(text) {
  const offsets = [0];
  for (let k = 0; k < text.length; k++) if (text[k] === "\n") offsets.push(k + 1);
  return (charIdx) => {
    let lo = 0, hi = offsets.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (offsets[mid] <= charIdx) lo = mid; else hi = mid - 1;
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
    if (text[i] === "{") {
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
        if (text[j] === "{") depth += 1;
        else if (text[j] === "}") depth -= 1;
        j += 1;
      }
      rules.push({ selector, bodyStart: i + 1, bodyEnd: j - 1, selStart: trimmedStart, ruleEnd: j });
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
    return { lineCount: 0, unreferencedSelectors: 0, unreferenced: [], consumedSize: 0, allowlisted: 0 };
  }
  const raw = readFileSync(themeFile, "utf8");
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
      if (rule.selector === "[data-tenant]") continue; // root engine-token block (modern)
      if (/^@keyframes\b/.test(rule.selector)) continue; // opaque, exempt
      if (/^@media\b/.test(rule.selector)) {
        walk(rule.bodyStart, rule.bodyEnd);
        continue;
      }
      const tokens = rule.selector.split(",").flatMap((part) => selectorClassTokens(part));
      if (tokens.length === 0) continue; // pure element/attribute hook (e.g. classic's `html[data-tenant]` root), not a class selector
      if (
        allowlistPrefixes.length > 0 &&
        tokens.every((t) => allowlistPrefixes.some((p) => t.startsWith(p)))
      ) {
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
      if (matched.length === 0) {
        unreferencedCount += 1;
        unreferenced.push({ selector: rule.selector, line: lineOf(rule.selStart) });
      } else if (process.env.DEBUG_REFERENCED) {
        referencedDebug.push({ selector: rule.selector, line: lineOf(rule.selStart), matched });
      }
    }
  }
  walk(0, stripped.length);
  if (process.env.DEBUG_REFERENCED) {
    console.log(`\n--- DEBUG referenced (${referencedDebug.length}) in ${themeFile} ---`);
    for (const r of referencedDebug) {
      console.log(`  line ${r.line}: ${r.selector.replace(/\s+/g, " ")}  <-- [${r.matched.join(", ")}]`);
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
    const lines = readFileSync(file, "utf8").split("\n");
    for (const line of lines) {
      literalRe.lastIndex = 0;
      let m;
      while ((m = literalRe.exec(line))) {
        const raw = m[2];
        if (raw === "auto") continue;
        const num = Number(raw);
        if (num === 0 || num === -1) continue;
        const commentIdx = line.indexOf("//");
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
  { name: "flexDirection", re: /flexDirection:\s*['"]([a-zA-Z-]+)['"]/g },
  { name: "gridTemplateColumns", re: /gridTemplateColumns:\s*([`'"])((?:(?!\1).)*)\1/g },
];

/**
 * Components with a verified-legitimate per-engine layout axis, declared in
 * the component's own contract/types file (spec section 10's "explicitly
 * declares a layout axis as engine-themable" exception) -- format
 * `"<component-dir-relative-to-src/components>:<patternName>"`. Each entry
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
  "primitives/inputs/Toggle:flexDirection",
]);

/**
 * Collect every `engines/{classic,modern,rustic}` triad under `src/components`
 * (flat `engines/classic.tsx` or folder `engines/classic/index.tsx`, same
 * two shapes `modernFiles()` above recognizes), keyed by the component's
 * directory path relative to `componentsDir` (e.g. `patterns/data/stats-grid`).
 * A component missing any one of the three engine files is skipped -- there
 * is nothing to compare it against.
 */
function findEngineTriads(dir, base) {
  const out = new Map();
  function walk(current) {
    for (const entry of readdirSync(current)) {
      const full = join(current, entry);
      if (!statSync(full).isDirectory()) continue;
      if (entry === "engines") {
        const rel = dirname(full.slice(base.length + 1));
        const engineFile = (name) => {
          for (const ext of [".tsx", ".ts"]) {
            const flat = join(full, `${name}${ext}`);
            if (existsSync(flat)) return flat;
          }
          const folderIndex = join(full, name, "index.tsx");
          return existsSync(folderIndex) ? folderIndex : null;
        };
        const classic = engineFile("classic");
        const modern = engineFile("modern");
        const rustic = engineFile("rustic");
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
    values.add((m[2] !== undefined ? m[2] : m[1]).replace(/\s+/g, " ").trim());
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
    const classicText = readFileSync(triad.classic, "utf8");
    const modernText = readFileSync(triad.modern, "utf8");
    const rusticText = readFileSync(triad.rustic, "utf8");
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
   engines under packages/core/src/components/ for visibility, reusing the exact same literal-
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
    const rel = full.replace(/\\/g, "/");
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
    const raw = readFileSync(file, "utf8");
    const stripped = stripBlockComments(raw);
    const rel = file.slice(root.length + 1).replace(/\\/g, "/");

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
  lines.push("# Token coverage report (WO-GAT-02)");
  lines.push("");
  lines.push(`Generated: ${coverage.generatedAt}`);
  lines.push("");
  lines.push(
    "Informational only -- this report is NOT a blocking gate. The blocking gates remain the",
  );
  lines.push(
    "modern-scoped counters in `node scripts/engine-token-audit.mjs --check` (motion/color/etc).",
  );
  lines.push(
    "This report lists, per component source file across ALL engines, which `--ds-*` custom",
  );
  lines.push(
    "properties it consumes and how many hardcoded literals (motion/hex/rgba, using the exact",
  );
  lines.push("same detection rules as the blocking counters) it still carries.");
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- Files scanned: ${coverage.filesScanned}`);
  lines.push(`- Unique \`--ds-*\` tokens consumed: ${coverage.tokensConsumedUnique}`);
  lines.push(`- Hardcoded literals outstanding: ${coverage.literalsOutstandingTotal}`);
  lines.push("");
  lines.push(`## Top ${topLiterals.length} files by outstanding literals`);
  lines.push("");
  lines.push("| File | cubic-bezier | raw duration | hex | rgba | total |");
  lines.push("| --- | --- | --- | --- | --- | --- |");
  for (const f of topLiterals) {
    lines.push(
      `| ${f.file} | ${f.literals.cubicBezier} | ${f.literals.rawDuration} | ${f.literals.hex} | ${f.literals.rgba} | ${f.literals.total} |`,
    );
  }
  lines.push("");
  lines.push(
    "Full per-file detail (including files with zero outstanding literals and their full",
  );
  lines.push("consumed-token list) is in the sibling `token-coverage.json`.");
  lines.push("");
  return lines.join("\n");
}

const repoRoot = resolve(root, "..", "..");
const gatesDir = join(repoRoot, "test-artifacts", "gates");

/** Write the `--coverage` mode artifacts (JSON + Markdown) to `test-artifacts/gates/`. */
function writeCoverageArtifacts(coverage) {
  if (!existsSync(gatesDir)) mkdirSync(gatesDir, { recursive: true });
  const jsonPath = join(gatesDir, "token-coverage.json");
  writeFileSync(jsonPath, JSON.stringify(coverage, null, 2) + "\n");
  const mdPath = join(gatesDir, "token-coverage.md");
  writeFileSync(mdPath, renderCoverageMarkdown(coverage));
  return { jsonPath, mdPath };
}

/* ============================================================================
   APCA contrast gate (WO-GAT-04, proposal P-10, axis 2): evaluate a DOCUMENTED
   list of text/surface token pairings across every first-party palette with
   APCA (Accessible Perceptual Contrast Algorithm) Lc values, and count pairings
   below their threshold as failures. Decrease-only ratchet, like every other
   counter here. This is ADDITIVE to — never a replacement for — the shipped
   WCAG-2 validator at src/_internal/a11y/contrast/index.ts (a published /server
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
  { id: "body-text-on-page-bg", kind: "body", text: "--ds-color-text-primary", bg: "--ds-color-bg-primary" },
  { id: "text-on-card-surface", kind: "body", text: "--ds-color-text-primary", bg: "--ds-color-bg-elevated" },
  // Low-emphasis text (|Lc| >= 45): muted/secondary copy — timestamps, hints, help text
  { id: "muted-text-on-page-bg", kind: "ui", text: "--ds-color-text-muted", bg: "--ds-color-bg-primary" },
  // Primary button label on its own fill (|Lc| >= 45)
  { id: "primary-button-label", kind: "ui", text: "--ds-button-primary-color", bg: "--ds-button-primary-bg" },
  // Badge tone label on its own tone fill (|Lc| >= 45) — the 5 gallery tones
  { id: "badge-primary", kind: "ui", text: "--ds-badge-primary-color", bg: "--ds-badge-primary-bg" },
  { id: "badge-secondary", kind: "ui", text: "--ds-badge-secondary-color", bg: "--ds-badge-secondary-bg" },
  { id: "badge-success", kind: "ui", text: "--ds-badge-success-color", bg: "--ds-badge-success-bg" },
  { id: "badge-warning", kind: "ui", text: "--ds-badge-warning-color", bg: "--ds-badge-warning-bg" },
  { id: "badge-error", kind: "ui", text: "--ds-badge-error-color", bg: "--ds-badge-error-bg" },
  // Semantic status color used AS text on the page ground (|Lc| >= 45)
  { id: "semantic-success-text", kind: "ui", text: "--ds-color-success", bg: "--ds-color-bg-primary" },
  { id: "semantic-info-text", kind: "ui", text: "--ds-color-info", bg: "--ds-color-bg-primary" },
  { id: "semantic-warning-text", kind: "ui", text: "--ds-color-warning", bg: "--ds-color-bg-primary" },
  { id: "semantic-error-text", kind: "ui", text: "--ds-color-error", bg: "--ds-color-bg-primary" },
];

/**
 * The first-party palettes, each on the surface its WO-ENG-02 gallery renders.
 * `theme` selects which artifact block is the default (rottay is dark-first;
 * bithire/evnto are light-first), so the resolver reads the block that actually
 * paints, not the opposite-scheme override.
 */
const APCA_PALETTES = [
  { id: "default", kind: "foundation", file: join(foundationDir, "themes/default.css"), theme: "dark" },
  { id: "rottay", kind: "artifact", tenant: "rottay", file: join(artifactsDir, "rottay/index.css"), theme: "dark" },
  { id: "bithire", kind: "artifact", tenant: "bithire", file: join(artifactsDir, "bithire/index.css"), theme: "light" },
  { id: "evnto", kind: "artifact", tenant: "evnto", file: join(artifactsDir, "evnto/index.css"), theme: "light" },
];

/** Extract only the DIRECT (brace-depth-0) `--name: value;` declarations from a
 * rule body, skipping any nested rule (e.g. the `*, ::after { border-color }`
 * reset that tenant blocks carry) — those set inherited properties, not the
 * root token scale. */
function apcaTopLevelDecls(body) {
  const out = [];
  let depth = 0;
  let seg = "";
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (c === "{") { depth += 1; seg = ""; continue; }
    if (c === "}") { if (depth > 0) depth -= 1; seg = ""; continue; }
    if (depth !== 0) continue;
    if (c === ";") {
      const m = /(--[a-zA-Z0-9-]+)\s*:\s*([\s\S]+)/.exec(seg);
      if (m) out.push([m[1], m[2].trim()]);
      seg = "";
    } else {
      seg += c;
    }
  }
  return out;
}

/** True when `selector` is the tenant's ROOT token block for its DEFAULT theme:
 * `html[data-tenant='T']` with only attached qualifiers (`:not(...)`, `.class`,
 * `[data-theme=...]`) and NO descendant/`:where(...)` scoping, and NOT scoped to
 * the OPPOSITE scheme (a non-negated `.dark`/`[data-theme='dark']` for a
 * light-default tenant, or `.light`/`[data-theme='light']` for a dark-default
 * one). The opposite-scheme override block is thereby excluded. */
function apcaBlockMatchesDefault(selector, tenant, defaultTheme) {
  const compact = selector.replace(/\s+/g, "");
  const rootRe = new RegExp(
    `^html\\[data-tenant=['"]${tenant}['"]\\](?::not\\([^)]*\\)|\\.[A-Za-z0-9_-]+|\\[data-theme=['"][^'"]*['"]\\])*$`,
  );
  if (!rootRe.test(compact)) return false;
  const opp = defaultTheme === "light" ? "dark" : "light";
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
  const str = raw.trim().replace(/\s*!important\s*$/i, "");
  const kw = { white: "#ffffff", black: "#000000" };
  if (Object.prototype.hasOwnProperty.call(kw, str.toLowerCase())) return kw[str.toLowerCase()];
  if (/^#[0-9a-fA-F]{6}$/.test(str)) return str;
  if (/^#[0-9a-fA-F]{3}$/.test(str)) return str;
  if (/^#[0-9a-fA-F]{8}$/.test(str)) return str.slice(7).toLowerCase() === "ff" ? "#" + str.slice(1, 7) : null;
  if (/^#[0-9a-fA-F]{4}$/.test(str)) return str[4].toLowerCase() === "f" ? "#" + str.slice(1, 4) : null;
  const m = /^rgba?\(\s*([0-9.]+)\s*[,\s]\s*([0-9.]+)\s*[,\s]\s*([0-9.]+)\s*(?:[,/]\s*([0-9.]+%?)\s*)?\)$/.exec(str);
  if (m) {
    let a = 1;
    if (m[4] !== undefined) a = m[4].endsWith("%") ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
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
  const value = raw.trim().replace(/\s*!important\s*$/i, "");
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
  const foundationText = existsSync(APCA_PALETTES[0].file) ? readFileSync(APCA_PALETTES[0].file, "utf8") : "";
  const foundationDefs = apcaCollectDecls(foundationText, (sel) => sel.trim() === ":root");
  const results = [];
  let failures = 0;
  let skipped = 0;
  for (const pal of APCA_PALETTES) {
    let defs;
    if (pal.kind === "foundation") {
      defs = foundationDefs;
    } else {
      const text = existsSync(pal.file) ? readFileSync(pal.file, "utf8") : "";
      const artDefs = apcaCollectDecls(text, (sel) => apcaBlockMatchesDefault(sel, pal.tenant, pal.theme));
      defs = new Map([...foundationDefs, ...artDefs]); // artifact overrides foundation
    }
    for (const pair of APCA_PAIRINGS) {
      const textColor = apcaResolveColor(pair.text, defs);
      const bgColor = apcaResolveColor(pair.bg, defs);
      const threshold = pair.kind === "body" ? APCA_BODY_MIN : APCA_UI_MIN;
      if (!textColor || !bgColor) {
        skipped += 1;
        results.push({
          palette: pal.id, pair: pair.id, kind: pair.kind, threshold, status: "skip",
          textToken: pair.text, bgToken: pair.bg, textColor, bgColor,
        });
        continue;
      }
      const lcRaw = calcAPCA(textColor, bgColor);
      const absLc = Math.abs(typeof lcRaw === "number" ? lcRaw : Number(lcRaw) || 0);
      const pass = absLc >= threshold;
      if (!pass) failures += 1;
      results.push({
        palette: pal.id, pair: pair.id, kind: pair.kind, threshold,
        textToken: pair.text, bgToken: pair.bg, textColor, bgColor,
        lc: Number(absLc.toFixed(1)), status: pass ? "pass" : "FAIL",
      });
    }
  }
  return { failures, skipped, evaluated: results.length - skipped, results };
}

/** Render the APCA evidence Markdown (written by --apca-report; also the shape
 * printed in report mode). */
function renderApcaMarkdown(apca) {
  const lines = [];
  lines.push("# APCA contrast pairings (WO-GAT-04)");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("");
  lines.push(
    `Thresholds: body-text |Lc| >= ${APCA_BODY_MIN}; large-text/UI |Lc| >= ${APCA_UI_MIN}. ` +
      `Failures (below threshold): ${apca.failures}. Skipped (unresolvable, counted): ${apca.skipped}. ` +
      `Evaluated: ${apca.evaluated}.`,
  );
  lines.push("");
  lines.push("| Palette | Pairing | Kind | Text | Bg | Lc | Floor | Status |");
  lines.push("| --- | --- | --- | --- | --- | --- | --- | --- |");
  for (const r of apca.results) {
    lines.push(
      `| ${r.palette} | ${r.pair} | ${r.kind} | ${r.textColor ?? r.textToken} | ${r.bgColor ?? r.bgToken} | ${r.lc ?? "—"} | ${r.threshold} | ${r.status} |`,
    );
  }
  lines.push("");
  return lines.join("\n");
}

const files = modernFiles(componentsDir);
const motion = countMotionLiterals(files);
const effects = countEffectConsumers();
const colorFiles = modernColorFiles(componentsDir);
const color = countColorLiterals(colorFiles);
const themeCssAudit = auditThemeCss(files);
const classicFiles = collectEngineFiles(componentsDir, "classic");
const rusticFiles = collectEngineFiles(componentsDir, "rustic");
const classicThemeAudit = auditEngineTheme(classicThemeCssPath, classicFiles, {
  // "ant-" (Ant Design 5.x component classes), "anticon" (Ant Design's icon-font class -- no
  // hyphen after "ant"), "slick-" (react-slick, vendored internally by antd's Carousel). All
  // three are externally-consumed runtime classes, never written literally in DS source -- see
  // auditEngineTheme's doc comment for how this list was derived from the measured baseline.
  allowlistPrefixes: ["ant-", "anticon", "slick-"],
});
const rusticThemeAudit = auditEngineTheme(rusticThemeCssPath, rusticFiles);
const crossEngineLayoutDivergences = countCrossEngineLayoutDivergences();
const apca = evaluateApcaPairings();

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
  "themeCss.unreferencedSelectors": themeCssAudit.unreferencedSelectors,
  "themeCss.lineCount": themeCssAudit.lineCount,
  // WO-GAT-02: classic/rustic dead-selector counters, generalized from WO-ENG-08's modern scan
  // (`auditEngineTheme`, shared). Decrease-only, no hard target -- draining classic/rustic CSS
  // is future work; these counters only stop further growth. Classic's near-total .ant-*
  // allowlisting (see auditEngineTheme's doc comment) is reported separately, not counted here.
  "themeCss.deadSelectorsClassic": classicThemeAudit.unreferencedSelectors,
  "themeCss.deadSelectorsRustic": rusticThemeAudit.unreferencedSelectors,
  "content.magicZIndex": countMagicZIndex(files),
  "layout.crossEngineDivergences": crossEngineLayoutDivergences,
  // WO-GAT-04 (accessibility CI, proposal P-10): APCA text/surface pairings below their Lc
  // threshold, across the foundation + rottay/bithire/evnto palettes. Decrease-only, no hard
  // target (dark-surface saturated status colors and low-emphasis muted text sit below the bar
  // today; a future color WO ratchets them down). Skip count (unresolvable pairs) is reported,
  // not gated — see evaluateApcaPairings(). Threshold + pairing list documented at APCA_PAIRINGS.
  "a11y.apcaPairings": apca.failures,
  // Later WOs extend here: responsive counters (WO-ENG-12), ...
};

/** Invariants checked for exact equality (not just decrease-only) in --check. */
const EXACT = {
  // One elevation source of truth: the foundation ramp, with --ds-shadow-* aliases.
  "depth.shadowScales": 1,
  // Layout is a component-layer concern; no undeclared modern-vs-siblings axis
  // divergence survives (WO-ENG-10, spec section 10). See
  // countCrossEngineLayoutDivergences()'s doc comment for this counter's
  // precise (intentionally narrow) detection scope and known blind spots.
  "layout.crossEngineDivergences": 0,
  // One radius source of truth: foundation/themes/default.css.
  "scale.radiusScaleDeclarations": 1,
  // No dark-blind focus ring survives on any dark-surface tenant (audit 3.4).
  "state.darkFocusRingDefects": 0,
  // Every remaining theme.css selector is consumer-proven (WO-ENG-08, spec section 8).
  "themeCss.unreferencedSelectors": 0,
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
    : process.argv.includes("--coverage")
      ? "coverage"
      : process.argv.includes("--apca-report")
        ? "apca-report"
        : "report";

if (mode === "update") {
  writeFileSync(baselinePath, JSON.stringify(counters, null, 2) + "\n");
  console.log("engine-token-audit: baseline updated");
  console.log(counters);
  process.exit(0);
}

if (mode === "coverage") {
  const coverage = buildTokenCoverage();
  const { jsonPath, mdPath } = writeCoverageArtifacts(coverage);
  console.log("engine-token-audit --coverage: wrote");
  console.log(`  ${jsonPath}`);
  console.log(`  ${mdPath}`);
  console.log(
    `engine-token-audit — token coverage: ${coverage.filesScanned} files scanned, ${coverage.tokensConsumedUnique} unique --ds-* tokens consumed, ${coverage.literalsOutstandingTotal} hardcoded literals outstanding`,
  );
  process.exit(0);
}

if (mode === "apca-report") {
  // WO-GAT-04 evidence: persist the full APCA pairing table to test-artifacts/gates/gat-04/.
  const outDir = join(gatesDir, "gat-04");
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  const jsonPath = join(outDir, "apca-report.json");
  const mdPath = join(outDir, "apca-report.md");
  writeFileSync(
    jsonPath,
    JSON.stringify(
      { generatedAt: new Date().toISOString(), thresholds: { body: APCA_BODY_MIN, ui: APCA_UI_MIN }, ...apca },
      null,
      2,
    ) + "\n",
  );
  writeFileSync(mdPath, renderApcaMarkdown(apca));
  console.log("engine-token-audit --apca-report: wrote");
  console.log(`  ${jsonPath}`);
  console.log(`  ${mdPath}`);
  console.log(
    `engine-token-audit — APCA pairings: ${apca.failures} below threshold, ${apca.skipped} skipped (unresolvable), ${apca.evaluated} evaluated`,
  );
  process.exit(0);
}

console.log("engine-token-audit — modern engine files:", files.length);
for (const [k, v] of Object.entries(counters)) console.log(`  ${k}: ${v}`);

// WO-GAT-02: one-line token-coverage summary, appended to both report and --check output
// (computed unconditionally so --check callers see it too; the coverage report itself is
// informational and never gates -- see buildTokenCoverage()'s doc comment).
const coverageSummary = buildTokenCoverage();
console.log(
  `engine-token-audit — token coverage: ${coverageSummary.filesScanned} files scanned, ${coverageSummary.tokensConsumedUnique} unique --ds-* tokens consumed, ${coverageSummary.literalsOutstandingTotal} hardcoded literals outstanding`,
);

// WO-GAT-04: one-line APCA summary, appended to both report and --check output.
console.log(
  `engine-token-audit — APCA contrast: ${apca.failures} pairings below threshold (body>=${APCA_BODY_MIN}/ui>=${APCA_UI_MIN}), ${apca.skipped} skipped (unresolvable), ${apca.evaluated} evaluated across ${APCA_PALETTES.length} palettes`,
);

if (mode === "report") {
  console.log("\nengine-token-audit — APCA pairing detail:");
  console.log("  palette   pairing                 kind  Lc     floor  status");
  for (const r of apca.results) {
    const lc = r.status === "skip" ? "  skip" : String(r.lc).padStart(5);
    console.log(
      `  ${r.palette.padEnd(9)} ${r.pair.padEnd(23)} ${r.kind.padEnd(4)}  ${lc}  ${String(r.threshold).padStart(4)}   ${r.status}`,
    );
  }
}

if (mode === "report") {
  console.log(
    `\nengine-token-audit — theme.css consumed-class set: ${themeCssAudit.consumedSize} tokens`,
  );
  console.log(
    `engine-token-audit — theme.css unreferenced selectors (${themeCssAudit.unreferenced.length}):`,
  );
  for (const u of themeCssAudit.unreferenced) {
    console.log(`  line ${u.line}: ${u.selector.replace(/\s+/g, " ")}`);
  }
  console.log(
    `\nengine-token-audit — classic/theme.css: ${classicThemeAudit.consumedSize} consumed classes, ${classicThemeAudit.allowlisted} externally-consumed (ant-/anticon/slick-) allowlisted, ${classicThemeAudit.unreferencedSelectors} dead:`,
  );
  for (const u of classicThemeAudit.unreferenced) {
    console.log(`  line ${u.line}: ${u.selector.replace(/\s+/g, " ")}`);
  }
  console.log(
    `\nengine-token-audit — rustic/theme.css: ${rusticThemeAudit.consumedSize} consumed classes, ${rusticThemeAudit.unreferencedSelectors} dead:`,
  );
  for (const u of rusticThemeAudit.unreferenced) {
    console.log(`  line ${u.line}: ${u.selector.replace(/\s+/g, " ")}`);
  }
}

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
