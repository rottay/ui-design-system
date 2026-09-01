import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  censusApplicationReaches,
  censusBoundaryCategories,
  censusNativeReconstructions,
  censusRawSharedChrome,
  censusSupplierImports,
  censusTenantStyleBranches,
  censusUndocumentedDsWrites,
  diffCensus,
  stripCssComments,
  stripTsComments,
} from "./index.mjs";

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
  const categories = censusBoundaryCategories();
  for (const [category, current] of Object.entries(categories)) {
    const entries = baseline.categories?.[category] ?? {};
    const { added, grown } = diffCensus(current, entries);
    const problems = [
      ...added.map(({ id, count }) => `new: ${id} (x${count})`),
      ...grown.map(({ id, from, to }) => `grew: ${id} ${from} -> ${to}`),
    ];
    assert.deepEqual(
      problems,
      [],
      `${category} has unbaselined boundary growth:\n${problems.join("\n")}`
    );
  }
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
