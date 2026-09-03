import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { packageRoot as findPackageRoot } from "../../../../libraries/repo-root/index.mjs";
import {
  censusApplicationReaches,
  censusBoundaryCategories,
  censusDsModuleBoundary,
  censusDsSpecifiers,
  classifyDsSpecifier,
  declaredExportSubpaths,
  evaluateObligations,
  tally,
  censusNativeReconstructions,
  censusRawSharedChrome,
  censusSupplierImports,
  censusTenantStyleBranches,
  censusUndocumentedDsWrites,
  diffCensus,
  stripCssComments,
  stripTsComments,
} from "./index.mjs";

const CORE_ROOT = findPackageRoot(dirname(fileURLToPath(import.meta.url)));

const baseline = JSON.parse(
  readFileSync(
    new URL("./baseline/index.json", import.meta.url),
    "utf8"
  )
);

test("native reconstruction scans production markup without counting comments", () => {
  const source = stripTsComments(`
    const callback = "https://example.test/callback";
    // <button type="button">comment only</button>
    /* <input /> */
    export function Example() {
      return <button type="button">Real</button>;
    }
  `);

  assert.match(source, /https:\/\/example\.test\/callback/);
  assert.deepEqual(censusNativeReconstructions(source), ["<button"]);
});

test("supplier detection covers subpaths, dynamic imports and require", () => {
  const source = stripTsComments(`
    import { Button } from "antd/es";
    const recipes = import("tailwind-variants/lite");
    const daisy = require("daisyui");
    import { Button as DsButton } from "@rottay/design-system";
  `);

  assert.deepEqual(censusSupplierImports(source), [
    "antd/es",
    "tailwind-variants/lite",
    "daisyui",
  ]);
});

test("shared-chrome census distinguishes tokenized declarations from literals", () => {
  const literalSource = stripCssComments(`
    .literal {
      color: #fff;
      border-radius: 0.75rem;
      transition: opacity 180ms ease;
      font-family: Inter, sans-serif;
      box-shadow: 0 2px 8px rgb(0 0 0 / 20%);
    }
  `);
  const tokenizedSource = stripCssComments(`
    .tokenized {
      color: var(--ds-color-text-primary);
      border-radius: var(--ds-radius-md);
      transition: opacity var(--ds-motion-calm) var(--ds-ease-standard);
      font-family: var(--ds-font-family-base);
      box-shadow: var(--ds-shadow-md);
    }
  `);

  assert.deepEqual(censusRawSharedChrome(literalSource), [
    "color:#fff",
    "color:rgb",
    "radius-literal",
    "raw-duration",
    "font-family-literal",
    "shadow-literal",
  ]);
  assert.deepEqual(censusRawSharedChrome(tokenizedSource), []);
});

test("tenant style branch rejects concrete tenant identity but permits generic scope", () => {
  assert.deepEqual(
    censusTenantStyleBranches(`
      html[data-tenant] .shell {}
      html[data-tenant="customer-a"] .shell {}
      [data-account-tenant='customer-b'] .card {}
    `),
    [
      '[data-tenant="customer-a"]',
      "[data-account-tenant='customer-b']",
    ]
  );
});

test("undocumented DS writes ignore shipped names and comment ghosts", () => {
  const shipped = new Set(["--ds-known-hook"]);
  const source = `
    .known { --ds-known-hook: var(--ds-spacing-2); }
    /* .ghost { --ds-comment-only: 1px; } */
    .unknown {
      --ds-empty-state-card-padding-block: var(--ds-spacing-6);
      --ds-empty-state-card-padding-inline: var(--ds-spacing-4);
    }
  `;

  assert.deepEqual(censusUndocumentedDsWrites(source, shipped), [
    "--ds-empty-state-card-padding-block",
    "--ds-empty-state-card-padding-inline",
  ]);
});

test("every executable boundary category has an owner and removal reason", () => {
  const categories = censusBoundaryCategories();
  for (const [category, current] of Object.entries(categories)) {
    const entries = baseline.categories?.[category] ?? {};
    for (const [id, entry] of Object.entries(entries)) {
      assert.ok(entry.owner?.trim(), `${category}: ${id} is missing owner`);
      assert.ok(
        entry.reason?.trim(),
        `${category}: ${id} is missing removal reason`
      );
    }
  }
});

test("boundary categories match baseline identity and count, not just cardinality", () => {
  // The obligation ledger is consulted here for the same reason the gate
  // consults it: an id it carries is recorded debt with an owner and an exact
  // count, not unbaselined growth. It is NOT a second baseline -- the exact
  // count is re-asserted below, and an id in both files is an error.
  const ledger = JSON.parse(
    readFileSync(new URL("./obligations/index.json", import.meta.url), "utf8"),
  );
  const obliged = new Map((ledger.obligations ?? []).map((entry) => [entry.id, entry.count]));
  const categories = censusBoundaryCategories();
  for (const [category, current] of Object.entries(categories)) {
    const entries = baseline.categories?.[category] ?? {};
    const { added, grown } = diffCensus(current, entries);
    const problems = [
      ...added
        .filter(({ id, count }) => obliged.get(id) !== count)
        .map(({ id, count }) => `new: ${id} (x${count})`),
      ...grown.map(({ id, from, to }) => `grew: ${id} ${from} -> ${to}`),
    ];
    assert.deepEqual(
      problems,
      [],
      `${category} has unbaselined boundary growth:\n${problems.join("\n")}`
    );
  }
  // Non-vacuity: the ledger really did absorb something, so an empty `problems`
  // above cannot come from an empty census.
  assert.equal(obliged.size, 10);
  assert.ok(categories["raw-shared-chrome-literals"].size > 100);
});

test("private-anatomy reaches match baseline identity and count", () => {
  const current = censusApplicationReaches();
  const { added, grown } = diffCensus(current, baseline.reaches);
  const problems = [
    ...added.map(({ id, count }) => `new: ${id} (x${count})`),
    ...grown.map(({ id, from, to }) => `grew: ${id} ${from} -> ${to}`),
  ];
  assert.deepEqual(
    problems,
    [],
    `private-anatomy reaches has unbaselined growth:\n${problems.join("\n")}`
  );
});

test("diffCensus counterfactual: a path rename with unchanged cardinality is still caught", () => {
  const baselineEntries = {
    "app/src/components/a/styles/index.css :: radius-literal": {
      count: 2,
      owner: "a",
      reason: "x",
    },
    "app/src/components/b/styles/index.css :: radius-literal": {
      count: 3,
      owner: "b",
      reason: "x",
    },
  };
  const renamed = new Map([
    ["app/src/ui/a/styles/index.css :: radius-literal", 2],
    ["app/src/ui/b/styles/index.css :: radius-literal", 3],
  ]);

  assert.equal(renamed.size, Object.keys(baselineEntries).length);
  assert.equal(
    [...renamed.values()].reduce((a, b) => a + b, 0),
    Object.values(baselineEntries).reduce((a, entry) => a + entry.count, 0)
  );

  const { added, grown, removed } = diffCensus(renamed, baselineEntries);
  assert.deepEqual(grown, []);
  assert.deepEqual(removed, [
    "app/src/components/a/styles/index.css :: radius-literal",
    "app/src/components/b/styles/index.css :: radius-literal",
  ]);
  assert.deepEqual(added, [
    { id: "app/src/ui/a/styles/index.css :: radius-literal", count: 2 },
    { id: "app/src/ui/b/styles/index.css :: radius-literal", count: 3 },
  ]);
});

/* -------------------------------------------------------------------------- */
/* corpus honesty                                                             */
/* -------------------------------------------------------------------------- */

/**
 * The gate hardcoded a sibling-of-workspace corpus path and never read
 * `APP_BITHIRE_ROOT`, the variable `ci.yml` exports for exactly this purpose.
 * On a runner that path does not exist, and `existsSync(root) -> continue`
 * emptied all six censuses, so the gate printed a tighten opportunity and
 * exited 0. It had never run against a corpus in CI, and neither had its drill:
 * every corpus-dependent assertion in this file iterates over empty maps when
 * the corpus is absent.
 *
 * These drills run the real gate in the GitHub Actions layout, so "the corpus
 * is missing" is a planted condition rather than an accident of where the
 * developer happens to have checked things out.
 */
function ciTopology({ corpus = true } = {}) {
  // realpath: on macOS `tmpdir()` is a symlink, and the gate's own
  // invoked-directly guard compares `process.argv[1]` to its module URL. A
  // symlinked path makes that comparison false, so `main()` never runs and the
  // fixture would report a silent exit 0 that has nothing to do with the gate.
  const workspace = realpathSync(mkdtempSync(join(tmpdir(), "ds-boundary-ci-")));
  const core = join(workspace, "packages/core");
  mkdirSync(core, { recursive: true });
  writeFileSync(join(workspace, "pnpm-workspace.yaml"), "packages:\n  - 'packages/*'\n");
  writeFileSync(join(workspace, "package.json"), JSON.stringify({ name: "workspace-root" }));
  cpSync(join(CORE_ROOT, "package.json"), join(core, "package.json"));
  cpSync(join(CORE_ROOT, "scripts"), join(core, "scripts"), { recursive: true });
  for (const relative of [
    "src/foundation/tokens/css",
    "src/infrastructure/compilers",
  ]) {
    const source = join(CORE_ROOT, relative);
    if (existsSync(source)) cpSync(source, join(core, relative), { recursive: true });
  }
  const corpusRoot = join(workspace, ".corpora/app-bithire");
  if (corpus) {
    mkdirSync(join(corpusRoot, "src/components/thing/styles"), { recursive: true });
    writeFileSync(
      join(corpusRoot, "src/components/thing/styles/index.css"),
      ".thing { color: var(--ds-color-text); }\n",
    );
  }
  return {
    workspace,
    corpusRoot,
    gate: join(core, "scripts/check/boundaries/components/imports/index.mjs"),
  };
}

function runGate(gate, args, env = {}) {
  const inherited = { ...process.env };
  delete inherited.APP_BITHIRE_ROOT;
  const result = spawnSync(process.execPath, [gate, ...args], {
    encoding: "utf8",
    cwd: dirname(gate),
    env: { ...inherited, ...env },
  });
  return { status: result.status, output: `${result.stdout ?? ""}${result.stderr ?? ""}` };
}

test("N1: with no corpus and no env, the gate exits 1 instead of censusing nothing", () => {
  // THE mutant. This is green at HEAD and is the whole point of the cohort.
  const planted = ciTopology({ corpus: false });
  const result = runGate(planted.gate, ["--check"]);
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /corpus missing/);
  assert.doesNotMatch(result.output, /OK — no new boundary violations/);
});

test("P1/P2: the GitHub Actions layout resolves through APP_BITHIRE_ROOT", () => {
  const planted = ciTopology();
  const without = runGate(planted.gate, ["--check"]);
  assert.equal(without.status, 1, "without the env there is no corpus at the sibling path");

  assert.match(without.output, /corpus missing/);

  // With the env exported, the gate resolves the runner's checkout and censuses
  // it. The exit code is deliberately NOT asserted here: this fixture corpus is
  // not the pinned one, so the repository's obligation ledger correctly reports
  // its entries as drained. The claim under test is RESOLUTION.
  const withEnv = runGate(planted.gate, ["--check"], { APP_BITHIRE_ROOT: planted.corpusRoot });
  assert.match(withEnv.output, /corpus .*\.corpora[/\\]app-bithire/);
  assert.doesNotMatch(withEnv.output, /corpus missing/);

  // Explicit --app-root outranks the environment, including a broken one.
  const explicit = runGate(planted.gate, ["--check", "--app-root", planted.corpusRoot], {
    APP_BITHIRE_ROOT: join(planted.workspace, "does-not-exist"),
  });
  assert.match(explicit.output, /corpus .*\.corpora[/\\]app-bithire/);
  assert.doesNotMatch(explicit.output, /corpus missing/);
});

test("N2/N3: an explicit but broken root fails; it never falls back", () => {
  const planted = ciTopology();
  const missing = runGate(planted.gate, ["--check"], {
    APP_BITHIRE_ROOT: join(planted.workspace, "nowhere"),
  });
  assert.equal(missing.status, 1);
  assert.match(missing.output, /corpus missing/);

  const notADirectory = join(planted.workspace, "a-file");
  writeFileSync(notADirectory, "");
  const wrongKind = runGate(planted.gate, ["--check"], { APP_BITHIRE_ROOT: notADirectory });
  assert.equal(wrongKind.status, 1);
});

test("P3: the corpus path and its SHA are printed on every run", () => {
  const planted = ciTopology();
  const result = runGate(planted.gate, ["--check"], { APP_BITHIRE_ROOT: planted.corpusRoot });
  assert.match(result.output, /application-boundary-gate: corpus /);
  assert.match(result.output, /corpus SHA (?:[0-9a-f]{40}|unavailable \(no \.git)/);
});

test("P4: baseline keys are stable when the corpus is mounted somewhere else", () => {
  // The ids are keyed on the logical prefix, not on the absolute mount point,
  // so relocating a checkout does not rewrite 178 baseline ids.
  const first = ciTopology();
  const second = ciTopology();
  const idsFrom = (output) => output.split("\n").filter((line) => line.includes("::")).sort();
  const a = runGate(first.gate, ["--app-root", first.corpusRoot]);
  const b = runGate(second.gate, ["--app-root", second.corpusRoot]);
  assert.deepEqual(idsFrom(a.output), idsFrom(b.output));
});

/* -------------------------------------------------------------------------- */
/* ds-module-boundary                                                         */
/* -------------------------------------------------------------------------- */

const DECLARED = ["./", ".", "./icons", "./marks", "./icons/presets/*", "./charts/renderers"];

test("P5/P6/P7: every declared subpath is public, including through a pattern key", () => {
  for (const specifier of [
    "@rottay/design-system",
    "@rottay/design-system/icons",
    "@rottay/design-system/marks",
    "@rottay/design-system/charts/renderers",
    "@rottay/design-system/icons/presets/bithire",
  ]) {
    assert.equal(classifyDsSpecifier(specifier, DECLARED), "public", specifier);
  }
  // The classifier reads the LIVE map: a subpath synthesised from the package's
  // own exports at run time is public, so it is not a hardcoded list.
  const manifest = JSON.parse(readFileSync(join(CORE_ROOT, "package.json"), "utf8"));
  const live = declaredExportSubpaths(manifest.exports);
  assert.ok(live.length > 5, "the package must declare a real exports map");
  for (const key of live) {
    if (key.includes("*")) continue;
    assert.equal(
      classifyDsSpecifier(`@rottay/design-system${key.slice(1)}`, live),
      "public",
      key,
    );
  }
});

test("N11/N12/N13: deep reaches and undeclared subpaths are violations", () => {
  assert.equal(classifyDsSpecifier("@rottay/design-system/dist/index.js", DECLARED), "deep-reach");
  assert.equal(
    classifyDsSpecifier("@rottay/design-system/src/components/primitives/button", DECLARED),
    "deep-reach",
  );
  assert.equal(
    classifyDsSpecifier("@rottay/design-system/node_modules/x", DECLARED),
    "deep-reach",
  );
  assert.equal(
    classifyDsSpecifier("@rottay/design-system/icons/presets/nonexistent", DECLARED),
    "public",
    "a declared pattern key covers its own shape",
  );
  assert.equal(
    classifyDsSpecifier("@rottay/design-system/invented", DECLARED),
    "undeclared-subpath",
  );
  assert.equal(classifyDsSpecifier("react", DECLARED), null, "a foreign package is not our business");
});

test("P8: a commented-out deep import never legalizes and never accuses", () => {
  const source = [
    "// import x from '@rottay/design-system/dist/index.js';",
    "/* import y from '@rottay/design-system/src/a'; */",
    "import { Button } from '@rottay/design-system';",
  ].join("\n");
  assert.deepEqual(censusDsSpecifiers(source, DECLARED), []);
  assert.deepEqual(
    censusDsSpecifiers("import x from '@rottay/design-system/dist/index.js';", DECLARED).map((f) => f.verdict),
    ["deep-reach"],
    "and an uncommented one IS reported, or the assertion above is vacuous",
  );
});

test("the live corpus has zero ds-module-boundary sites, so the ceiling is 0 by measurement", () => {
  assert.deepEqual([...tally(censusDsModuleBoundary()).keys()], []);
  assert.deepEqual(baseline.categories["ds-module-boundary"], {});
  assert.ok(
    typeof baseline.categoryDefinitions["ds-module-boundary"] === "string"
      && baseline.categoryDefinitions["ds-module-boundary"].length > 40,
    "a category without a written definition is a number nobody can review",
  );
});

/* -------------------------------------------------------------------------- */
/* obligations                                                                */
/* -------------------------------------------------------------------------- */

const obligations = JSON.parse(
  readFileSync(new URL("./obligations/index.json", import.meta.url), "utf8"),
);

test("P9/P10/P12: the ledger is complete, disjoint from the baseline, and reproduces exactly", () => {
  assert.equal(obligations.obligations.length, 10);
  const baselined = new Set(
    Object.values(baseline.categories).flatMap((entries) => Object.keys(entries)),
  );
  for (const entry of obligations.obligations) {
    for (const field of ["id", "category", "owner", "reason", "measuredAt", "expiresWhen"]) {
      assert.ok(
        typeof entry[field] === "string" && entry[field].trim().length > 0,
        `${entry.id}: ${field} is empty`,
      );
    }
    assert.equal(typeof entry.count, "number");
    assert.equal(baselined.has(entry.id), false, `${entry.id} is also in the decrease-only baseline`);
  }
  // And the ten reproduce against the live corpus at the pinned SHA.
  const live = censusBoundaryCategories()["raw-shared-chrome-literals"];
  for (const entry of obligations.obligations) {
    assert.equal(live.get(entry.id), entry.count, entry.id);
  }
  // The baseline is unchanged in that category: 178 in, 178 out.
  assert.equal(Object.keys(baseline.categories["raw-shared-chrome-literals"]).length, 178);
});

test("N5/N6: an obligation count is exact in BOTH directions", () => {
  const ledger = { corpusPin: "abc", obligations: [{ id: "x", category: "c", count: 20, owner: "o", reason: "r", measuredAt: "abc", expiresWhen: "corpus-pin-change" }] };
  const grew = evaluateObligations(ledger, new Map([["x", 21]]), "abc");
  assert.match(grew.failures.join(""), /count mismatch for x: expected 20, measured 21/);
  const shrank = evaluateObligations(ledger, new Map([["x", 19]]), "abc");
  assert.match(shrank.failures.join(""), /count mismatch for x: expected 20, measured 19/);
  const exact = evaluateObligations(ledger, new Map([["x", 20]]), "abc");
  assert.deepEqual(exact.failures, []);
  assert.equal(exact.consumed.has("x"), true);
});

test("N7/N8: moving the corpus pin invalidates every obligation", () => {
  const ledger = { corpusPin: "abc", obligations: [{ id: "x", category: "c", count: 1, owner: "o", reason: "r", measuredAt: "abc", expiresWhen: "corpus-pin-change" }] };
  const moved = evaluateObligations(ledger, new Map([["x", 1]]), "def");
  assert.match(moved.failures.join(""), /corpus pin moved from abc to def/);
  // And an unresolvable SHA is a failure, never an "unknown" that continues.
  const unknown = evaluateObligations(ledger, new Map([["x", 1]]), null);
  assert.match(unknown.failures.join(""), /corpus SHA could not be resolved/);
});

test("N9: draining an obligation is loud, not a silent pass", () => {
  const ledger = { corpusPin: "abc", obligations: [{ id: "x", category: "c", count: 1, owner: "o", reason: "r", measuredAt: "abc", expiresWhen: "corpus-pin-change" }] };
  const drained = evaluateObligations(ledger, new Map(), "abc");
  assert.match(drained.failures.join(""), /drained; delete the entry: x/);
});

test("N10: an entry missing its metadata is rejected, not skipped", () => {
  const ledger = { corpusPin: "abc", obligations: [{ id: "x", category: "c", count: 1, measuredAt: "abc", expiresWhen: "corpus-pin-change" }] };
  const incomplete = evaluateObligations(ledger, new Map([["x", 1]]), "abc");
  assert.match(incomplete.failures.join(""), /is missing owner/);
  assert.match(incomplete.failures.join(""), /is missing reason/);
});
