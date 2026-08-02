#!/usr/bin/env node
/**
 * Deterministic CSS cascade gate (DS-A001).
 *
 * Tailwind v4 and Rottay share one named layer order. First-party paint must
 * live in its owning DS layer, except for the deliberately unlayered root
 * authorities: the document-wide @property registry, compiled tenant
 * artifacts, and the Arabic root typography floor. Tenant artifacts are the
 * final authored authority for the channels in their coverage declaration;
 * putting them in a named layer would make unlayered application paint win.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(scriptDir, "..");

export const CANONICAL_LAYER_ORDER =
  "@layer theme, base, rottay-framework, rottay-reset, rottay-tokens, rottay-motion, rottay-components, rottay-engines, rottay-personality, rottay-responsive, components, utilities;";

const args = process.argv.slice(2);
const entryArgs = [];
for (let index = 0; index < args.length; index += 1) {
  if (args[index] === "--entry") entryArgs.push(resolve(args[index + 1]));
}

const entrypoints = entryArgs.length
  ? entryArgs
  : [
      resolve(
        packageRoot,
        "src/foundation/tokens/css/facade/entrypoints/base.css"
      ),
      resolve(
        packageRoot,
        "src/foundation/tokens/css/facade/entrypoints/styles.css"
      ),
    ];

const modernFrameworkProjection = resolve(
  packageRoot,
  "src/foundation/tokens/css/runtime/engines/modern/framework-token-projection.css"
);
const modernThemePaint = resolve(
  packageRoot,
  "src/foundation/tokens/css/runtime/engines/modern/theme.css"
);
const modernFrameworkBridge = resolve(
  packageRoot,
  "src/foundation/tokens/css/runtime/engines/modern/framework-bridge.css"
);
const engineIndex = resolve(
  packageRoot,
  "src/foundation/tokens/css/runtime/engines/index.css"
);

const MODERN_FRAMEWORK_TOKEN_PROPERTIES = new Set([
  "--color-primary",
  "--color-primary-content",
  "--color-secondary",
  "--color-secondary-content",
  "--color-accent",
  "--color-accent-content",
  "--color-neutral",
  "--color-neutral-content",
  "--color-base-100",
  "--color-base-200",
  "--color-base-300",
  "--color-base-content",
  "--color-success",
  "--color-success-content",
  "--color-warning",
  "--color-warning-content",
  "--color-error",
  "--color-error-content",
  "--color-info",
  "--color-info-content",
  "--radius-selector",
  "--radius-field",
  "--radius-box",
  "--size-selector",
  "--size-field",
  "--border",
  "--depth",
  "--noise",
]);

const DIRECT_DS_TOKEN_REFERENCE = /^var\(--ds-[a-z0-9-]+\)$/;

const IMPORT_RE = /@import\s+(['"])([^'"]+)\1\s*(?:layer\(([^)]*)\))?\s*;/g;
const UNLAYERED_REGISTRIES = new Set(["foundation/base/properties.css"]);
const UNLAYERED_ROOT_AUTHORITIES = new Set([
  "foundation/responsive/language-arabic-root.css",
]);
const PAINT_BRIDGE_RE = /(?:patterns|collapse|personality)-paint\.css$/;

function normalizedSpecifier(specifier) {
  return specifier
    .replaceAll("\\", "/")
    .replace(/^(?:\.\.\/)+/, "")
    .replace(/^\.\//, "");
}

function expectedLayer(specifier) {
  const normalized = normalizedSpecifier(specifier);
  if (
    normalized.includes("presentation/components/") ||
    normalized.includes("runtime/bridges/")
  ) {
    return "rottay-components";
  }
  if (normalized.includes("runtime/engines/")) return "rottay-engines";
  if (normalized.includes("runtime/personality")) return "rottay-personality";
  if (normalized.includes("foundation/responsive/")) return "rottay-responsive";
  if (normalized.includes("foundation/animations/")) return "rottay-motion";
  if (
    normalized.includes("foundation/base/") ||
    normalized.includes("foundation/themes/")
  )
    return "rottay-tokens";
  return null;
}

export function auditCascadeEntrypoint(path) {
  const failures = [];
  if (!existsSync(path)) return [`entrypoint does not exist: ${path}`];

  const css = readFileSync(path, "utf8");
  const orderIndex = css.indexOf(CANONICAL_LAYER_ORDER);
  const firstImport = css.search(/@import\s/);
  if (orderIndex < 0)
    failures.push("missing canonical Tailwind + Rottay layer order");
  if (firstImport >= 0 && (orderIndex < 0 || orderIndex > firstImport)) {
    failures.push("canonical layer order must be established before imports");
  }

  for (const match of css.matchAll(IMPORT_RE)) {
    const specifier = match[2];
    const layer = match[3]?.trim() || null;
    if (!specifier.startsWith(".")) continue;

    const normalized = normalizedSpecifier(specifier);
    if (PAINT_BRIDGE_RE.test(normalized)) {
      failures.push(`obsolete paint bridge import: ${specifier}`);
      continue;
    }

    if (UNLAYERED_REGISTRIES.has(normalized)) {
      if (layer)
        failures.push(
          `document-wide registry must remain unlayered: ${specifier}`
        );
      continue;
    }

    if (
      UNLAYERED_ROOT_AUTHORITIES.has(normalized) ||
      normalized.includes("facade/artifacts/") ||
      normalized.startsWith("artifacts/")
    ) {
      if (layer) {
        failures.push(
          `root paint authority must remain unlayered: ${specifier}`
        );
      }
      continue;
    }

    const expected = expectedLayer(specifier);
    if (!expected) {
      failures.push(`first-party import has no cascade owner: ${specifier}`);
      continue;
    }
    if (!layer) {
      failures.push(
        `unlayered first-party import: ${specifier}; expected layer(${expected})`
      );
      continue;
    }
    if (layer !== expected) {
      failures.push(
        `wrong cascade owner: ${specifier} uses layer(${layer}); expected layer(${expected})`
      );
    }
  }
  return failures;
}

/**
 * Files under the CSS root that no entrypoint imports, each with the reason
 * it is allowed to sit outside the cascade. Anything unreachable and NOT
 * listed here is a defect: the gate can otherwise certify a layered/unlayered
 * split forever while one half silently reaches no bundle, which is exactly
 * how patterns-paint.css lost 246 declarations between 2026-07-25 and
 * 2026-08-02 without a single gate complaining.
 */
export const UNREACHABLE_BY_DESIGN = new Map([
  ["facade/artifacts/bithire/_source/extension.css", "declared build input to the bithire artifact generator"],
  ["facade/artifacts/evnto/_source/extension.css", "declared build input to the evnto artifact generator"],
  ["facade/artifacts/rottay/_source/extension.css", "declared build input to the rottay artifact generator"],
  ["foundation/typography/font-packs/editorial-display/index.css", "font pack no vertical currently selects"],
  ["foundation/typography/font-packs/editorial-text/index.css", "font pack no vertical currently selects"],
  ["foundation/typography/font-packs/geometric-display/index.css", "font pack no vertical currently selects"],
  ["presentation/components/index.css", "alternative component aggregator, not on the shipped entrypoint path"],
  ["presentation/components/patterns-paint.css", "tombstone: migrated into patterns.css 2026-08-02, whole-file RETIRE_PROPOSED"],
  ["runtime/bridges/collapse-paint.css", "tombstone: migrated into collapse.css, retained for downstream source maps"],
  ["runtime/engines/modern/compiled.css", "build product of build:modern-css"],
]);

const CSS_ROOT = resolve(packageRoot, "src/foundation/tokens/css");

export function collectReachable(entry, root, seen = new Set()) {
  const full = resolve(entry);
  if (seen.has(full) || !existsSync(full)) return seen;
  seen.add(full);
  for (const match of readFileSync(full, "utf8").matchAll(IMPORT_RE)) {
    if (!match[2].startsWith(".")) continue;
    collectReachable(resolve(dirname(full), match[2]), root, seen);
  }
  return seen;
}

function collectCss(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (entry.name !== "tests" && entry.name !== "__tests__") {
        collectCss(resolve(dir, entry.name), out);
      }
    } else if (entry.name.endsWith(".css")) {
      out.push(resolve(dir, entry.name));
    }
  }
  return out;
}

/**
 * Both halves of every split must ship. A file this gate governs is only
 * allowed to be unreachable from every entrypoint if it says why.
 */
export function auditGovernedFilesAreReachable({
  cssRoot = CSS_ROOT,
  entrypoints: entries,
  allowlist = UNREACHABLE_BY_DESIGN,
} = {}) {
  const failures = [];
  if (!existsSync(cssRoot)) return [`css root does not exist: ${cssRoot}`];

  const entryDir = resolve(cssRoot, "facade/entrypoints");
  const roots =
    entries ??
    (existsSync(entryDir)
      ? readdirSync(entryDir)
          .filter((name) => name.endsWith(".css"))
          .map((name) => resolve(entryDir, name))
      : []);
  if (roots.length === 0) return [`no entrypoints found under ${entryDir}`];

  const reachable = new Set();
  for (const root of roots) collectReachable(root, cssRoot, reachable);

  for (const file of collectCss(cssRoot)) {
    const key = relative(cssRoot, file).replaceAll("\\", "/");
    const declared = allowlist.has(key);
    if (reachable.has(file)) {
      if (declared) {
        failures.push(
          `stale unreachable-by-design entry: ${key} IS imported; remove it from UNREACHABLE_BY_DESIGN`
        );
      }
      continue;
    }
    if (!declared) {
      failures.push(
        `governed file reaches no bundle: ${key} is imported by no entrypoint. Either import it from an entrypoint under its cascade owner, or declare it in UNREACHABLE_BY_DESIGN with the reason.`
      );
    }
  }
  return failures;
}

export function auditModernThemeOwnership({
  projectionPath = modernFrameworkProjection,
  paintPath = modernThemePaint,
  bridgePath = modernFrameworkBridge,
  indexPath = engineIndex,
} = {}) {
  const failures = [];
  for (const path of [projectionPath, paintPath, bridgePath, indexPath]) {
    if (!existsSync(path)) failures.push(`modern ownership file missing: ${path}`);
  }
  if (failures.length > 0) return failures;

  const projectionCss = readFileSync(projectionPath, "utf8");
  const paintCss = readFileSync(paintPath, "utf8");
  const bridgeCss = readFileSync(bridgePath, "utf8");
  const indexCss = readFileSync(indexPath, "utf8");
  const projectionRoot = postcss.parse(projectionCss, { from: projectionPath });
  const paintRoot = postcss.parse(paintCss, { from: paintPath });
  const bridgeRoot = postcss.parse(bridgeCss, { from: bridgePath });

  projectionRoot.walkRules((rule) => {
    if (rule.selector !== "[data-tenant]") {
      failures.push(
        `modern framework projection has non-tenant selector: ${rule.selector}`
      );
    }
  });
  projectionRoot.walkDecls((declaration) => {
    if (!MODERN_FRAMEWORK_TOKEN_PROPERTIES.has(declaration.prop)) {
      failures.push(
        `modern framework projection owns a non-framework token: ${declaration.prop}`
      );
    }
    if (!DIRECT_DS_TOKEN_REFERENCE.test(declaration.value.trim())) {
      failures.push(
        `modern framework projection must directly reference one canonical --ds-* token: ${declaration.prop}: ${declaration.value}`
      );
    }
  });
  paintRoot.walkDecls((declaration) => {
    if (declaration.prop.startsWith("--")) {
      failures.push(
        `modern theme paint redefines a token: ${declaration.prop}`
      );
    }
  });
  bridgeRoot.walkRules((rule) => {
    if (!rule.selector.includes("[data-tenant]")) {
      failures.push(
        `modern framework bridge has unscoped selector: ${rule.selector}`
      );
    }
  });
  bridgeRoot.walkDecls((declaration) => {
    if (declaration.prop.startsWith("--")) {
      failures.push(
        `modern framework bridge redefines a token: ${declaration.prop}`
      );
    }
  });

  for (const [label, css] of [
    ["theme paint", paintCss],
    ["framework bridge", bridgeCss],
  ]) {
    if (/\.divider(?:\b|-horizontal\b|-vertical\b)/.test(css)) {
      failures.push(`${label} resurrects generic Daisy divider ownership`);
    }
    if (/\.inline-flex\.flex-row|\[style\*=["']gap["']\]/.test(css)) {
      failures.push(`${label} resurrects global Space utility hacks`);
    }
  }

  const projectionImport = indexCss.indexOf(
    "@import './modern/framework-token-projection.css';"
  );
  const paintImport = indexCss.indexOf("@import './modern/theme.css';");
  const bridgeImport = indexCss.indexOf(
    "@import './modern/framework-bridge.css';"
  );
  if (
    projectionImport < 0 ||
    paintImport < 0 ||
    bridgeImport < 0 ||
    projectionImport > paintImport ||
    paintImport > bridgeImport
  ) {
    failures.push(
      "modern ownership order must be framework token projection, theme paint, framework bridge"
    );
  }

  return failures;
}

// Importable: the audits above are exported for drills, so the CLI body only
// runs when this file IS the process entry.
const isCli =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

const failures = !isCli
  ? []
  : entrypoints.flatMap((entry) =>
      auditCascadeEntrypoint(entry).map((failure) => `${entry}: ${failure}`)
    );
if (isCli) {
  failures.push(
    ...auditModernThemeOwnership().map(
      (failure) => `modern-theme-ownership: ${failure}`
    )
  );
  // Reachability is a property of the real tree, so it is skipped when the
  // caller pointed --entry at a synthetic fixture.
  if (entryArgs.length === 0) {
    failures.push(
      ...auditGovernedFilesAreReachable().map(
        (failure) => `both-halves-ship: ${failure}`
      )
    );
  }
}

if (isCli && failures.length > 0) {
  console.error(
    `css-layer-paint-gate: FAIL\n${failures
      .map((failure) => `- ${failure}`)
      .join("\n")}`
  );
  process.exit(1);
}

if (isCli) {
  console.log(
    `css-layer-paint-gate: PASS (${entrypoints.length} entrypoint${
      entrypoints.length === 1 ? "" : "s"
    })`
  );
}
