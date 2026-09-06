#!/usr/bin/env node
/**
 * Computed-style probe for the DS tier cascade (WO-CAN-03, closes the F-16
 * acceptance clause "a structure token beats an engine token without inline").
 *
 * The layer statement in `facade/entrypoints/base/index.css` is a claim about
 * how a browser will sort the shipped bundle. Only a browser can settle it, so
 * this probe resolves the real base graph, loads it in Chromium, and reads
 * `getComputedStyle`. It asserts three things, and it can fail on each:
 *
 *   1. a `rottay-structures` rule at (0,1,0) beats a `rottay-engines` rule at
 *      (0,4,0) on the same element -- the tier wins without inline and without
 *      a specificity race;
 *   2. the same holds for `rottay-surfaces`;
 *   3. the NEGATIVE control: `rottay-components` (the engine-agnostic base
 *      coat) still LOSES to `rottay-engines`, so the probe is not simply
 *      reporting that later source order wins.
 *
 * Falsifiability is proved, not claimed (`--self-check`): the same three
 * subjects are re-run against the same bundle with the canonical statement
 * replaced by the REVERSED tier order. Every subject must then FLIP -- the
 * engine value on the two tier subjects, the component value on the control.
 * A probe that stays green there is reading source order, not the statement.
 *
 * Usage: node scripts/check/engine/css/paint/layers/layers.cascade-tier-order.probe.mjs
 */
import { createRequire } from "node:module";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { CANONICAL_LAYER_ORDER } from "./index.mjs";
import { packageRoot as findPackageRoot } from "../../../../../libraries/repo-root/index.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = findPackageRoot(here);
const cssRoot = resolve(packageRoot, "src/foundation/tokens/css");
const selfCheck = process.argv.includes("--self-check");

const IMPORT_RE = /@import\s+(['"])(\.[^'"]+)\1\s*(?:layer\(([^)]*)\))?\s*;/g;

function resolveImports(css, baseDir) {
  return css.replace(IMPORT_RE, (match, _quote, specifier, layer) => {
    const full = resolve(baseDir, specifier);
    if (!existsSync(full)) return `/* unresolved: ${specifier} */`;
    const content = resolveImports(readFileSync(full, "utf8"), dirname(full));
    return layer ? `@layer ${layer.trim()} {\n${content}\n}` : content;
  });
}

// Package imports (antd's reset) cannot be fetched in a data page and are not
// what this probe measures; every first-party file is inlined above.
function bundleBase() {
  const entry = resolve(cssRoot, "facade/entrypoints/base/index.css");
  return resolveImports(readFileSync(entry, "utf8"), dirname(entry)).replace(
    /@import\s+(['"])[^.][^'"]*\1[^;]*;/g,
    ""
  );
}

const PROBE_CSS = `
@layer rottay-engines {
  .probe.probe.probe.probe { border-radius: 99px; }
  .control.control { border-radius: 99px; }
}
@layer rottay-structures {
  .probe-structure { border-radius: 3px; }
}
@layer rottay-surfaces {
  .probe-surface { border-radius: 5px; }
}
@layer rottay-components {
  .control { border-radius: 7px; }
}
`;

const MARKUP = `
<div class="probe probe-structure" id="structure"></div>
<div class="probe probe-surface" id="surface"></div>
<div class="control" id="control"></div>
`;

async function measure(css) {
  const showroomRequire = createRequire(
    resolve(packageRoot, "../showroom/package.json")
  );
  const { chromium } = showroomRequire("@playwright/test");
  // The resolved base graph is ~5 MB, which no in-page payload can carry, so
  // the page loads it the way a consumer does: as a linked stylesheet.
  const dir = mkdtempSync(join(tmpdir(), "cascade-tier-order-"));
  writeFileSync(join(dir, "bundle.css"), css);
  writeFileSync(
    join(dir, "probe.html"),
    `<!doctype html><html data-tenant="rottay" data-ds-root data-vertical="rottay"><head><link rel="stylesheet" href="./bundle.css"></head><body>${MARKUP}</body></html>`
  );
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(120_000);
    await page.goto(pathToFileURL(join(dir, "probe.html")).href, {
      waitUntil: "load",
      timeout: 120_000,
    });
    // `return promise` inside try/finally lets the finally close the browser
    // before the evaluation settles, so the result is awaited here.
    const measured = await page.evaluate(() =>
      Object.fromEntries(
        ["structure", "surface", "control"].map((id) => [
          id,
          getComputedStyle(document.getElementById(id)).borderTopLeftRadius,
        ])
      )
    );
    return measured;
  } finally {
    await browser.close();
    rmSync(dir, { recursive: true, force: true });
  }
}

const base = bundleBase();
if (!base.includes(CANONICAL_LAYER_ORDER)) {
  console.error("cascade-tier-order: FAIL - resolved base lost the canonical layer statement");
  process.exit(1);
}

const failures = [];
const layered = await measure(`${base}\n${PROBE_CSS}`);
if (layered.structure !== "3px") {
  failures.push(
    `rottay-structures at (0,1,0) must beat rottay-engines at (0,4,0); got ${layered.structure}`
  );
}
if (layered.surface !== "5px") {
  failures.push(
    `rottay-surfaces at (0,1,0) must beat rottay-engines at (0,4,0); got ${layered.surface}`
  );
}
if (layered.control !== "99px") {
  failures.push(
    `negative control: rottay-components must still LOSE to rottay-engines; got ${layered.control}`
  );
}

if (selfCheck) {
  const reversed = CANONICAL_LAYER_ORDER.replace(
    "rottay-components, rottay-engines, rottay-structures, rottay-surfaces",
    "rottay-surfaces, rottay-structures, rottay-engines, rottay-components"
  );
  if (reversed === CANONICAL_LAYER_ORDER) {
    failures.push("self-check: could not build the reversed tier order");
  }
  const flipped = await measure(
    `${base.replace(CANONICAL_LAYER_ORDER, reversed)}\n${PROBE_CSS}`
  );
  for (const [id, value, expected] of [
    ["structure", flipped.structure, "99px"],
    ["surface", flipped.surface, "99px"],
    ["control", flipped.control, "7px"],
  ]) {
    if (value !== expected) {
      failures.push(
        `self-check: with the tier order reversed, ${id} must become ${expected}; got ${value}`
      );
    }
  }
  console.log("self-check (reversed tier order):", JSON.stringify(flipped));
}

console.log("measured:", JSON.stringify(layered));
if (failures.length > 0) {
  console.error(
    `cascade-tier-order: FAIL\n${failures.map((f) => `- ${f}`).join("\n")}`
  );
  process.exit(1);
}
console.log("cascade-tier-order: PASS");
