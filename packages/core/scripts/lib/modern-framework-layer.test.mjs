import assert from "node:assert/strict";
import test from "node:test";

import {
  MODERN_FRAMEWORK_LAYER,
  wrapModernFrameworkLayer,
} from "./modern-framework-layer.mjs";

test("places generated Tailwind and DaisyUI layers below first-party DS paint", () => {
  const source =
    "@layer theme, base, components, utilities;\n@layer utilities { .btn { display: flex; } }\n";
  const wrapped = wrapModernFrameworkLayer(source);

  assert.equal(
    wrapped,
    `@layer ${MODERN_FRAMEWORK_LAYER} {\n${source.trimEnd()}\n}`
  );
});

test("is idempotent when vertical bundles are regenerated without rebuilding Tailwind", () => {
  const once = wrapModernFrameworkLayer("@layer utilities { .btn {} }");
  assert.equal(wrapModernFrameworkLayer(`${once}\n`), once);
  assert.equal(once.match(/@layer rottay-framework/g)?.length, 1);
});
