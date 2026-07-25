import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  censusBoundaryCategories,
  censusNativeReconstructions,
  censusRawSharedChrome,
  censusSupplierImports,
  censusTenantStyleBranches,
  stripCssComments,
  stripTsComments,
} from "./application-boundary-gate.mjs";

const baseline = JSON.parse(
  readFileSync(
    new URL("./application-boundary-gate.baseline.json", import.meta.url),
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

test("every executable boundary category has an owner and removal reason", () => {
  const categories = censusBoundaryCategories();
  for (const [category, current] of Object.entries(categories)) {
    const entries = baseline.categories?.[category] ?? {};
    assert.equal(
      Object.keys(entries).length,
      current.size,
      `${category} baseline must match the current distinct census`
    );
    for (const [id, entry] of Object.entries(entries)) {
      assert.ok(entry.owner?.trim(), `${category}: ${id} is missing owner`);
      assert.ok(
        entry.reason?.trim(),
        `${category}: ${id} is missing removal reason`
      );
    }
  }
});
