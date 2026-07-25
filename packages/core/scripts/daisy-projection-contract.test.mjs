/**
 * Executable Modern/DaisyUI projection contract (Phase 3).
 *
 * Pins the adapter to the EXACT installed daisyui version: the projection file
 * must write the complete supported theme-variable set of that version and
 * nothing else; no source or generated vertical artifact may carry Daisy-4
 * legacy names; daisy variables remain implementation details sourced from
 * canonical `--ds-*` values through the single projection adapter.
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE = join(HERE, "..");
const require = createRequire(import.meta.url);

const PINNED_DAISY_VERSION = "5.5.19";

/** Theme-level contract of daisyui@5.5.19 (derived from its @property list). */
const SUPPORTED_THEME_VARIABLES = [
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
];

/** Daisy-4 legacy names with no effect in the installed version. */
const OBSOLETE_NAME_PATTERN = /--(rounded-[a-z]+|animation-[a-z]+|btn-focus-scale|tab-[a-z-]+)\s*:/g;

const PROJECTION_PATH = join(
  CORE,
  "src/foundation/tokens/css/runtime/engines/modern/framework-token-projection.css"
);
const SOURCE_ROOT = join(CORE, "src");

function* walkFiles(root) {
  for (const entry of readdirSync(root)) {
    const absolute = join(root, entry);
    const info = statSync(absolute);
    if (info.isDirectory()) {
      if (entry === "node_modules" || entry === "dist") continue;
      yield* walkFiles(absolute);
    } else {
      yield absolute;
    }
  }
}

test("the installed daisyui version matches the pinned projection contract", () => {
  const manifest = require("daisyui/package.json");
  assert.equal(
    manifest.version,
    PINNED_DAISY_VERSION,
    `daisyui version changed (${manifest.version}); re-derive SUPPORTED_THEME_VARIABLES from the new version's @property contract and update the pin deliberately`
  );
});

test("the projection writes the complete supported set and nothing else", () => {
  const projection = readFileSync(PROJECTION_PATH, "utf8");
  const written = new Set(
    [...projection.matchAll(/^\s*(--[a-z][a-z0-9-]*)\s*:/gm)].map((m) => m[1])
  );
  const missing = SUPPORTED_THEME_VARIABLES.filter((name) => !written.has(name));
  const extra = [...written].filter(
    (name) => !SUPPORTED_THEME_VARIABLES.includes(name)
  );
  assert.deepEqual(missing, [], "projection is missing supported daisy variables");
  assert.deepEqual(extra, [], "projection writes names outside the supported set");
  for (const line of projection.split("\n")) {
    const match = line.match(/^\s*--[a-z][a-z0-9-]*\s*:\s*(.+);/);
    if (match) {
      assert.match(
        match[1],
        /var\(--ds-/,
        `projection value must source a canonical --ds-* token: ${line.trim()}`
      );
    }
  }
});

test("no source or generated vertical artifact carries Daisy-4 legacy names", () => {
  const artifactRoot = join(CORE, "src/foundation/tokens/css/facade/artifacts");
  const offenders = [];
  for (const vertical of readdirSync(artifactRoot)) {
    for (const candidate of [
      join(artifactRoot, vertical, "index.css"),
      join(artifactRoot, vertical, "_source/extension.css"),
    ]) {
      if (!existsSync(candidate)) continue;
      const source = readFileSync(candidate, "utf8");
      const hits = [...source.matchAll(OBSOLETE_NAME_PATTERN)].map((m) => m[0]);
      if (hits.length > 0) offenders.push(`${vertical}: ${hits.join(", ")}`);
    }
  }
  assert.deepEqual(offenders, [], "Daisy-4 legacy names present");
});

test("the projection is the only source authority that declares Daisy variables", () => {
  const supplierNames = SUPPORTED_THEME_VARIABLES.map((name) =>
    name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  ).join("|");
  const declarationPattern = new RegExp(
    `^\\s*(?:${supplierNames})\\s*:`,
    "m"
  );
  const offenders = [];

  for (const file of walkFiles(SOURCE_ROOT)) {
    if (!file.endsWith(".css") || file === PROJECTION_PATH) continue;
    const source = readFileSync(file, "utf8");
    if (declarationPattern.test(source)) {
      offenders.push(file.slice(CORE.length + 1));
    }
  }

  assert.deepEqual(
    offenders,
    [],
    "Daisy variables must be declared only by framework-token-projection.css"
  );
});

test("runtime code cannot write Daisy variables or export a Daisy color compiler", () => {
  const offenders = [];
  const runtimeWritePattern =
    /(?:setProperty|safeSetProperty)\(\s*['"`]--(?:color-|radius-|size-|border\b|depth\b|noise\b)/;
  const publicCompilerPattern =
    /\b(?:buildDaisyUiColorOverrides|DaisyUiColorOverrides)\b/;

  for (const file of walkFiles(SOURCE_ROOT)) {
    if (!/\.(?:ts|tsx)$/.test(file)) continue;
    const source = readFileSync(file, "utf8");
    if (runtimeWritePattern.test(source) || publicCompilerPattern.test(source)) {
      offenders.push(file.slice(CORE.length + 1));
    }
  }

  assert.deepEqual(
    offenders,
    [],
    "Daisy must remain a private CSS projection, never a runtime/public authority"
  );
});
