/**
 * Build vertical CSS bundles
 *
 * Creates per-vertical dist artifacts with a dual static scope:
 *   dist/platform.css = base tokens + modern engine + platform/rottay baseline
 *   dist/bithire.css  = base tokens + modern engine + bithire baseline
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
 * --check regenerates the bundles in memory and diffs them against those files,
 * byte for byte, instead of writing.
 *
 * Usage:
 *   node scripts/build-vertical-css.mjs           # write dist/ and styles/ bundles
 *   node scripts/build-vertical-css.mjs --check    # fail if any styles/*.css is stale
 *
 * Run after build:modern-css so dist/modern-engine.css exists; both modes fail
 * loudly (exit 1) if it is missing.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const srcCss = resolve(root, 'src/tokens/css');
const dist = resolve(root, 'dist');
const styles = resolve(root, 'styles');
const check = process.argv.includes('--check');
let stale = 0;

function readFile(path) {
  if (!existsSync(path)) {
    console.error(`  ERROR: Missing file: ${path}`);
    process.exit(1);
  }
  return readFileSync(path, 'utf-8');
}

function unwrapRegisteredCustomProperties(css) {
  return css.replace(
    /@layer base \{\n  @property --radialprogress \{\n    syntax: "<percentage>";\n    inherits: true;\n    initial-value: 0%;\n  \}\n\}\n/g,
    '@property --radialprogress {\n  syntax: "<percentage>";\n  inherits: true;\n  initial-value: 0%;\n}\n',
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
      let content = readFileSync(fullPath, 'utf-8');
      // Recursively resolve nested relative imports
      content = resolveImports(content, dirname(fullPath));
      if (layerDirective) {
        const layerName = layerDirective.replace('layer(', '').replace(')', '');
        return `@layer ${layerName} {\n${content}\n}`;
      }
      return content;
    }
  );
}

function firstDiff(a, b) {
  const al = a.split('\n');
  const bl = b.split('\n');
  const max = Math.max(al.length, bl.length);
  for (let i = 0; i < max; i += 1) {
    if (al[i] !== bl[i]) {
      return `  line ${i + 1}:\n    committed: ${JSON.stringify(al[i])}\n    generated: ${JSON.stringify(bl[i])}`;
    }
  }
  return '  (files differ only in trailing content/length)';
}

/** Compare an in-memory bundle against the committed file at root-relative relPath. */
function compareToDisk(relPath, expected) {
  const path = resolve(root, relPath);
  const current = existsSync(path) ? readFileSync(path, 'utf-8') : '';
  if (current !== expected) {
    stale += 1;
    console.error(`✗ ${relPath} is out of sync with its build inputs.`);
    console.error(firstDiff(current, expected));
    return;
  }
  console.log(`✓ ${relPath} is up to date.`);
}

// Read precompiled modern engine CSS
const modernEnginePath = resolve(dist, 'modern-engine.css');
if (!existsSync(modernEnginePath)) {
  console.error(`  ERROR: dist/modern-engine.css does not exist: ${modernEnginePath}`);
  console.error('  Run `pnpm -C packages/core build:modern-css` first, then retry.');
  process.exit(1);
}
const modernEngine = unwrapRegisteredCustomProperties(readFile(modernEnginePath));
if (!check) {
  writeFileSync(modernEnginePath, modernEngine);
}

// Read tenant-free base CSS and resolve its imports
const baseCssPath = resolve(srcCss, 'foundation/base.css');
let baseCss = readFile(baseCssPath);
baseCss = resolveImports(baseCss, dirname(baseCssPath));

// Vertical definitions: name -> tenant CSS artifact file
const verticals = [
  { name: 'platform', tenantFile: 'artifacts/rottay/index.css' },
  { name: 'bithire', tenantFile: 'artifacts/bithire/index.css' },
  { name: 'evnto',   tenantFile: 'artifacts/evnto/index.css' },
];

if (!check) {
  mkdirSync(styles, { recursive: true });
}

for (const { name, tenantFile } of verticals) {
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
  const bundle = [
    `/* @rottay/design-system - ${name} vertical bundle */`,
    `/* Generated by build-vertical-css.mjs */`,
    `/* Structure: base tokens + modern engine + ${name} tenant (unlayered, wins by specificity) */`,
    '',
    baseCss,
    '',
    `/* === Modern Engine (DaisyUI + Tailwind utilities) === */`,
    modernEngine,
    '',
    `/* === ${name} tenant overrides (unlayered, wins by specificity + source order) === */`,
    tenantCss,
  ].join('\n');

  // Verify no cross-tenant or cross-provider-root contamination.
  const otherTenants = verticals.filter(v => v.name !== name);
  for (const other of otherTenants) {
    const otherSlug = other.name === 'platform' ? 'rottay' : other.name;
    const forbiddenOwners = [
      `data-tenant='${otherSlug}'`,
      `data-tenant="${otherSlug}"`,
      `data-vertical='${other.name}'`,
      `data-vertical="${other.name}"`,
    ];
    // Only flag ownership selectors outside comments.
    const lines = bundle.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('/*') || line.startsWith('*')) continue; // Skip comments
      const forbiddenOwner = forbiddenOwners.find((owner) => line.includes(owner));
      if (forbiddenOwner) {
        throw new Error(`Cross-vertical contamination: ${name}.css contains ${forbiddenOwner} at line ${i + 1}`);
      }
    }
  }

  if (check) {
    compareToDisk(`styles/${name}.css`, bundle);
    if (name === 'platform') {
      compareToDisk('styles/rottay.css', bundle);
    }
  } else {
    const sizeKB = Math.round(bundle.length / 1024);
    writeFileSync(resolve(dist, `${name}.css`), bundle);
    writeFileSync(resolve(styles, `${name}.css`), bundle);
    if (name === 'platform') {
      writeFileSync(resolve(styles, 'rottay.css'), bundle);
    }
    console.log(`  -> dist/${name}.css (${sizeKB}KB)`);
  }
}

// === Emit dist/styles.css (all-tenants development/Storybook bundle) ===
if (!check) console.log('Building dist/styles.css ...');

// Concatenate all tenant artifact CSS (replaces the removed tenants/index.css barrel)
const allTenantsCss = [
  'artifacts/rottay/index.css',
  'artifacts/bithire/index.css',
  'artifacts/evnto/index.css',
].map((f) => {
  const p = resolve(srcCss, f);
  return readFile(p);
}).join('\n');

const stylesBundle = [
  `/* @rottay/design-system - full CSS bundle (all tenants) */`,
  `/* Generated by build-vertical-css.mjs */`,
  `/* Structure: base tokens + modern engine + all tenants (unlayered, wins by specificity) */`,
  `/* Production apps should use styles/platform, styles/bithire, or styles/evnto instead. */`,
  '',
  baseCss,
  '',
  `/* === Modern Engine (DaisyUI + Tailwind utilities) === */`,
  modernEngine,
  '',
  `/* === All tenant overrides (unlayered, wins by specificity + source order) === */`,
  allTenantsCss,
].join('\n');

if (check) {
  compareToDisk('styles/index.css', stylesBundle);
  compareToDisk('styles/modern.css', modernEngine);
} else {
  writeFileSync(resolve(dist, 'styles.css'), stylesBundle);
  writeFileSync(resolve(styles, 'index.css'), stylesBundle);
  writeFileSync(resolve(styles, 'modern.css'), modernEngine);
  console.log(`  -> dist/styles.css (${Math.round(stylesBundle.length / 1024)}KB)`);
}

if (!check) console.log('Done. All vertical bundles are dual-scoped and isolated.');

if (check && stale > 0) {
  console.error(`\n${stale} vertical bundle(s) are stale or hand-edited. Regenerate with:\n  pnpm -C packages/core build:vertical-css`);
  process.exit(1);
}
