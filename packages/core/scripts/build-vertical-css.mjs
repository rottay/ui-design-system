/**
 * Build vertical CSS bundles
 *
 * Creates per-vertical dist artifacts with a dual static scope:
 *   dist/platform.css = base tokens + modern engine + platform/rottay baseline
 *   dist/bithire.css  = BitHire font packs + base tokens + modern engine + bithire baseline
 *   dist/evnto.css    = base tokens + modern engine + evnto baseline
 *   dist/styles.css   = base tokens + modern engine + all file-owned vertical baselines
 *
 * Each vertical bundle includes ONLY its own baseline. Its generated selectors
 * support both the legacy html[data-tenant] root and nested data-ds-root +
 * data-vertical providers. Cross-vertical contamination fails the build.
 *
 * Vertical CSS is placed UNLAYERED at the end of each bundle. The generated
 * :is(legacy, :where(provider-root)) selector takes its specificity from the
 * legacy arm, so it still wins over DaisyUI defaults together with later source
 * order. A @layer wrapper is intentionally NOT used.
 *
 * styles/{index,modern,platform,rottay,bithire,evnto}.css are committed to git.
 * They are the gate-checked source-of-truth mirrors; the npm tarball ships the
 * dist/ copies only (package.json `files` excludes styles/). dist and styles
 * copies are written from the same in-memory bundle, so each shipped dist file
 * is byte-identical to its committed mirror. dist/modern-engine.css is the
 * shipping target of the ./styles/modern export and therefore receives the
 * SAME guarded bundle as styles/modern.css (engine + reduced-motion guard).
 * --check regenerates the bundles in memory and diffs them against the
 * committed files (plus dist/modern-engine.css), byte for byte, without
 * writing.
 *
 * Usage:
 *   node scripts/build-vertical-css.mjs           # write dist/ and styles/ bundles
 *   node scripts/build-vertical-css.mjs --check    # fail if any styles/*.css is stale
 *
 * Run after build:modern-css so dist/modern-engine.css exists; both modes fail
 * loudly (exit 1) if it is missing.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { wrapModernFrameworkLayer } from "./lib/modern-framework-layer.mjs";

// Spring precompute inputs (TASK S item 2). Imported from dist, like
// build-vertical-artifacts.mjs, so this script runs after `tsc && vite build`
// (build:vertical-css sequences it).
import { springLinearEasing } from "../dist/infrastructure/compilers/kernel/foundation/motion/spring-easing/index.js";
import { bithireBrandTheme } from "../dist/foundation/tokens/ts/presentation/brand-themes/bithire/index.js";
import { evntoBrandTheme } from "../dist/foundation/tokens/ts/presentation/brand-themes/evnto/index.js";
import { rottayBrandTheme } from "../dist/foundation/tokens/ts/presentation/brand-themes/platform/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const srcCss = resolve(root, "src/foundation/tokens/css");
const dist = resolve(root, "dist");
const styles = resolve(root, "styles");
const check = process.argv.includes("--check");
let stale = 0;

function readFile(path) {
  if (!existsSync(path)) {
    console.error(`  ERROR: Missing file: ${path}`);
    process.exit(1);
  }
  return readFileSync(path, "utf-8");
}

function unwrapRegisteredCustomProperties(css) {
  return css.replace(
    /@layer base \{\n  @property --radialprogress \{\n    syntax: "<percentage>";\n    inherits: true;\n    initial-value: 0%;\n  \}\n\}\n/g,
    '@property --radialprogress {\n  syntax: "<percentage>";\n  inherits: true;\n  initial-value: 0%;\n}\n'
  );
}

/**
 * Resolve all relative @import directives by inlining file contents.
 * Handles `layer()` wrapping and recursive imports.
 * Skips package imports (e.g., 'antd/dist/reset.css') - those stay as-is.
 */
function resolveImports(css, baseDir) {
  return css.replace(
    /@import\s+['"](\.[^'"]+)['"]\s*(layer\([^)]+\))?\s*;/g,
    (match, importPath, layerDirective) => {
      const fullPath = resolve(baseDir, importPath);
      if (!existsSync(fullPath)) {
        console.warn(`  [warn] Cannot resolve: ${importPath}`);
        return `/* unresolved: ${match} */`;
      }
      let content = readFileSync(fullPath, "utf-8");
      // Recursively resolve nested relative imports
      content = resolveImports(content, dirname(fullPath));
      if (layerDirective) {
        const layerName = layerDirective.replace("layer(", "").replace(")", "");
        return `@layer ${layerName} {\n${content}\n}`;
      }
      return content;
    }
  );
}

function firstDiff(a, b) {
  const al = a.split("\n");
  const bl = b.split("\n");
  const max = Math.max(al.length, bl.length);
  for (let i = 0; i < max; i += 1) {
    if (al[i] !== bl[i]) {
      return `  line ${i + 1}:\n    committed: ${JSON.stringify(
        al[i]
      )}\n    generated: ${JSON.stringify(bl[i])}`;
    }
  }
  return "  (files differ only in trailing content/length)";
}

/** Compare an in-memory bundle against the committed file at root-relative relPath. */
function compareToDisk(relPath, expected) {
  const path = resolve(root, relPath);
  const current = existsSync(path) ? readFileSync(path, "utf-8") : "";
  if (current !== expected) {
    stale += 1;
    console.error(`✗ ${relPath} is out of sync with its build inputs.`);
    console.error(firstDiff(current, expected));
    return;
  }
  console.log(`✓ ${relPath} is up to date.`);
}

// Read precompiled modern engine CSS
const modernEnginePath = resolve(dist, "modern-engine.css");
if (!existsSync(modernEnginePath)) {
  console.error(
    `  ERROR: dist/modern-engine.css does not exist: ${modernEnginePath}`
  );
  console.error(
    "  Run `pnpm -C packages/core build:modern-css` first, then retry."
  );
  process.exit(1);
}
// dist/modern-engine.css is the raw postcss output right after build:modern-css
// and the guarded shipping bundle after a previous run of this script. Strip a
// previously appended guard before use so tenant bundles never embed it twice
// and re-runs stay byte-stable.
const GUARD_HEADER =
  "/* === Global reduced-motion guard (sourced from runtime/personality.css) === */";
let modernEngineRaw = readFile(modernEnginePath);
const priorGuardIndex = modernEngineRaw.indexOf(`\n\n${GUARD_HEADER}`);
if (priorGuardIndex !== -1) {
  modernEngineRaw = modernEngineRaw.slice(0, priorGuardIndex);
}
const modernEngine = wrapModernFrameworkLayer(
  unwrapRegisteredCustomProperties(modernEngineRaw)
);

// The engine-only styles/modern.css bundle must carry the same global
// reduced-motion guard the tenant bundles inherit from base.css. base.css pulls
// runtime/personality.css (layer rottay-personality); its tail section holds the
// `@media (prefers-reduced-motion: reduce)` wildcard plus the
// html[data-ds-motion='reduced'] runtime seam. Extract that guard region from
// the same source file so the standalone bundle neutralizes animation and
// transition under reduced motion instead of relying on a tenant baseline.
const personalityCss = readFile(resolve(srcCss, "runtime/personality.css"));
const reducedMotionGuardStart = personalityCss.indexOf(
  "@media (prefers-reduced-motion: reduce)"
);
if (reducedMotionGuardStart === -1) {
  console.error(
    "  ERROR: reduced-motion guard not found in runtime/personality.css"
  );
  process.exit(1);
}
const reducedMotionGuard = personalityCss
  .slice(reducedMotionGuardStart)
  .trimEnd();
if (
  !reducedMotionGuard.includes("animation-duration: 0.01ms") ||
  !/html\[data-ds-motion=(["'])reduced\1\]/.test(reducedMotionGuard)
) {
  console.error(
    "  ERROR: reduced-motion guard in runtime/personality.css is missing its wildcard or runtime seam"
  );
  process.exit(1);
}
const modernBundle = [
  modernEngine,
  "",
  GUARD_HEADER,
  reducedMotionGuard,
  "",
].join("\n");

// Read tenant-free base CSS and resolve its imports
const baseCssPath = resolve(srcCss, "facade/entrypoints/base.css");
let baseCss = readFile(baseCssPath);
baseCss = resolveImports(baseCss, dirname(baseCssPath));

// Vertical definitions: name -> tenant CSS artifact file
const verticals = [
  {
    name: "platform",
    tenantFile: "facade/artifacts/rottay/index.css",
    fontPacks: [],
  },
  {
    name: "bithire",
    tenantFile: "facade/artifacts/bithire/index.css",
    // First-party vertical identity is file-owned. Customer tenant themes can
    // still replace the semantic font-family channels through their DB theme.
    fontPacks: ["humanist-text", "grotesk-display", "plex-mono"],
  },
  {
    name: "evnto",
    tenantFile: "facade/artifacts/evnto/index.css",
    fontPacks: [],
  },
];

function fontPackBundle(fontPacks) {
  return fontPacks
    .map((fontPack) => {
      const fontPackPath = resolve(
        srcCss,
        `foundation/typography/font-packs/${fontPack}/index.css`
      );
      // Source packs colocate their assets. Shipped vertical CSS lives at the
      // dist root while build-font-packs copies assets to dist/fonts, so the
      // generated URL must follow the production artifact layout.
      return readFile(fontPackPath).replaceAll("url('./", "url('./fonts/");
    })
    .join("\n");
}

// --ds-motion-spring precompute (TASK S item 2). The base --ds-motion-spring
// (foundation/animations/transitions.css) is a cubic-bezier approximation. The
// tenant-artifact path already emits a generated linear() for
// --ds-motion-spring-gentle, but NOT for the primary --ds-motion-spring: that
// only rides the runtime tokenOverrides path (visual-config generateTenantCss),
// which the static first-party artifact build does not render. Here the
// first-party build derives the primary spring from each theme's own
// tension/friction and injects a tenant-scoped override, honoring useSpring --
// bithire (useSpring: false) is skipped and keeps the foundation default. The
// eligibility test mirrors isSpringEligible() in the brand-theme compiler; the
// selector mirrors the tenant artifact's own :is(...) root so the override lands
// on the same element as the tenant's other tokens. Injected UNLAYERED after the
// tenant CSS, so it wins the base :root cubic-bezier by specificity + source
// order.
const BRAND_THEMES = {
  platform: rottayBrandTheme,
  bithire: bithireBrandTheme,
  evnto: evntoBrandTheme,
};

function springOverrideBlock(name) {
  const motion = BRAND_THEMES[name]?.motion;
  if (
    !motion ||
    typeof motion.springTension !== "number" ||
    typeof motion.springFriction !== "number" ||
    motion.useSpring === false
  ) {
    return null;
  }
  const slug = name === "platform" ? "rottay" : name;
  const easing = springLinearEasing(
    motion.springTension,
    motion.springFriction
  );
  return [
    `/* === ${name} spring easing (precomputed linear() from the BrandTheme, useSpring) === */`,
    `:is(html[data-tenant='${slug}'], :where([data-ds-root][data-vertical='${name}'])) {`,
    `  --ds-motion-spring: ${easing};`,
    `}`,
  ].join("\n");
}

if (!check) {
  mkdirSync(styles, { recursive: true });
}

for (const { name, tenantFile, fontPacks } of verticals) {
  if (!check) console.log(`Building dist/${name}.css ...`);

  // Read and resolve the tenant-specific CSS
  const tenantPath = resolve(srcCss, tenantFile);
  let tenantCss = readFile(tenantPath);
  tenantCss = resolveImports(tenantCss, dirname(tenantPath));

  // Vertical CSS is kept UNLAYERED intentionally:
  // 1. :is(legacy, :where(provider-root)) keeps the legacy arm's specificity
  // 2. Source order: tenant CSS comes after modern-engine.css (DaisyUI + Tailwind)
  // Both guarantees together ensure tenant --color-* values always override DaisyUI defaults.
  // A layered copy (@layer rottay-tenants) is NOT needed and was removed to save ~10-50KB per bundle.
  const springBlock = springOverrideBlock(name);
  const verticalFontPacks = fontPackBundle(fontPacks);
  const bundle = [
    `/* @rottay/design-system - ${name} vertical bundle */`,
    `/* Generated by build-vertical-css.mjs */`,
    `/* Structure: first-party fonts + base tokens + modern engine + ${name} tenant (unlayered, wins by specificity) */`,
    "",
    ...(verticalFontPacks
      ? ["/* === First-party vertical font packs === */", verticalFontPacks, ""]
      : []),
    baseCss,
    "",
    `/* === Modern Engine (DaisyUI + Tailwind utilities) === */`,
    modernEngine,
    "",
    `/* === ${name} tenant overrides (unlayered, wins by specificity + source order) === */`,
    tenantCss,
    ...(springBlock ? ["", springBlock] : []),
  ].join("\n");

  // Verify no cross-tenant or cross-provider-root contamination.
  const otherTenants = verticals.filter((v) => v.name !== name);
  for (const other of otherTenants) {
    const otherSlug = other.name === "platform" ? "rottay" : other.name;
    const forbiddenOwners = [
      `data-tenant='${otherSlug}'`,
      `data-tenant="${otherSlug}"`,
      `data-vertical='${other.name}'`,
      `data-vertical="${other.name}"`,
    ];
    // Only flag ownership selectors outside comments.
    const lines = bundle.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith("/*") || line.startsWith("*")) continue; // Skip comments
      const forbiddenOwner = forbiddenOwners.find((owner) =>
        line.includes(owner)
      );
      if (forbiddenOwner) {
        throw new Error(
          `Cross-vertical contamination: ${name}.css contains ${forbiddenOwner} at line ${
            i + 1
          }`
        );
      }
    }
  }

  if (check) {
    compareToDisk(`styles/${name}.css`, bundle);
    if (name === "platform") {
      compareToDisk("styles/rottay.css", bundle);
    }
  } else {
    const sizeKB = Math.round(bundle.length / 1024);
    writeFileSync(resolve(dist, `${name}.css`), bundle);
    writeFileSync(resolve(styles, `${name}.css`), bundle);
    if (name === "platform") {
      writeFileSync(resolve(styles, "rottay.css"), bundle);
    }
    console.log(`  -> dist/${name}.css (${sizeKB}KB)`);
  }
}

// === Emit dist/styles.css (all-tenants development/Storybook bundle) ===
if (!check) console.log("Building dist/styles.css ...");

// Concatenate all tenant artifact CSS (replaces the removed tenants/index.css barrel)
const allTenantsCss = [
  "facade/artifacts/rottay/index.css",
  "facade/artifacts/bithire/index.css",
  "facade/artifacts/evnto/index.css",
]
  .map((f) => {
    const p = resolve(srcCss, f);
    return readFile(p);
  })
  .join("\n");

// Each per-tenant spring override is scoped to its own tenant root, so the
// all-tenants bundle can carry every eligible one without cross-tenant bleed.
const allSpringBlocks = verticals
  .map((v) => springOverrideBlock(v.name))
  .filter(Boolean)
  .join("\n\n");

// The development/Storybook bundle can render every first-party vertical, so
// it also carries the union of their declared font packs. Deduplication keeps a
// future shared pack from being emitted more than once.
const allFontPacks = fontPackBundle([
  ...new Set(verticals.flatMap((vertical) => vertical.fontPacks)),
]);

const stylesBundle = [
  `/* @rottay/design-system - full CSS bundle (all tenants) */`,
  `/* Generated by build-vertical-css.mjs */`,
  `/* Structure: base tokens + modern engine + all tenants (unlayered, wins by specificity) */`,
  `/* Production apps should use styles/platform, styles/bithire, or styles/evnto instead. */`,
  "",
  ...(allFontPacks
    ? ["/* === First-party vertical font packs === */", allFontPacks, ""]
    : []),
  baseCss,
  "",
  `/* === Modern Engine (DaisyUI + Tailwind utilities) === */`,
  modernEngine,
  "",
  `/* === All tenant overrides (unlayered, wins by specificity + source order) === */`,
  allTenantsCss,
  ...(allSpringBlocks
    ? [
        "",
        `/* === Precomputed spring easings (per-tenant, useSpring) === */`,
        allSpringBlocks,
      ]
    : []),
].join("\n");

if (check) {
  compareToDisk("styles/index.css", stylesBundle);
  compareToDisk("styles/modern.css", modernBundle);
  // dist/modern-engine.css ships as the ./styles/modern export target, so the
  // reduced-motion guard must be present in the dist copy, byte-equal to the
  // committed mirror.
  compareToDisk("dist/modern-engine.css", modernBundle);
} else {
  writeFileSync(resolve(dist, "styles.css"), stylesBundle);
  writeFileSync(resolve(styles, "index.css"), stylesBundle);
  writeFileSync(resolve(styles, "modern.css"), modernBundle);
  writeFileSync(modernEnginePath, modernBundle);
  console.log(
    `  -> dist/styles.css (${Math.round(stylesBundle.length / 1024)}KB)`
  );
}

if (!check)
  console.log("Done. All vertical bundles are dual-scoped and isolated.");

if (check && stale > 0) {
  console.error(
    `\n${stale} vertical bundle(s) are stale or hand-edited. Regenerate with:\n  pnpm -C packages/core build:vertical-css`
  );
  process.exit(1);
}
