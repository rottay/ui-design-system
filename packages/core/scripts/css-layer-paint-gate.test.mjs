import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import postcss from "postcss";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const gate = join(scriptDir, "css-layer-paint-gate.mjs");
const cssRoot = join(scriptDir, "..", "src/foundation/tokens/css");
const canonical =
  "@layer theme, base, rottay-framework, rottay-reset, rottay-tokens, rottay-motion, rottay-components, rottay-engines, rottay-personality, rottay-responsive, components, utilities;";

function fixture(source) {
  const dir = mkdtempSync(join(tmpdir(), "css-cascade-contract-"));
  const entry = join(dir, "entry.css");
  writeFileSync(entry, source);
  return {
    entry,
    cleanup: () => rmSync(dir, { recursive: true, force: true }),
  };
}

function run(entry) {
  return spawnSync(
    process.execPath,
    [gate, ...(entry ? ["--entry", entry] : [])],
    { encoding: "utf8" }
  );
}

test("real entrypoints satisfy the deterministic cascade contract", () => {
  const result = run();
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test("Modern projects framework tokens from canonical DS authority before paint", () => {
  const projectionPath = join(
    cssRoot,
    "runtime/engines/modern/framework-token-projection.css"
  );
  const paintPath = join(cssRoot, "runtime/engines/modern/theme.css");
  const bridgePath = join(
    cssRoot,
    "runtime/engines/modern/framework-bridge.css"
  );
  const projection = postcss.parse(readFileSync(projectionPath, "utf8"));
  const paint = postcss.parse(readFileSync(paintPath, "utf8"));
  const bridgeCss = readFileSync(bridgePath, "utf8");
  const bridge = postcss.parse(bridgeCss);

  projection.walkRules((rule) => assert.equal(rule.selector, "[data-tenant]"));
  projection.walkDecls((declaration) => {
    assert.doesNotMatch(declaration.prop, /^--ds-/);
    assert.match(declaration.value.trim(), /^var\(--ds-[a-z0-9-]+\)$/);
  });
  paint.walkDecls((declaration) =>
    assert.doesNotMatch(declaration.prop, /^--/)
  );
  bridge.walkRules((rule) => assert.match(rule.selector, /\[data-tenant\]/));
  bridge.walkDecls((declaration) =>
    assert.doesNotMatch(declaration.prop, /^--/)
  );
  assert.doesNotMatch(bridgeCss, /\.divider(?:\b|-horizontal\b|-vertical\b)/);
  assert.doesNotMatch(bridgeCss, /\.inline-flex\.flex-row|\[style\*=["']gap["']\]/);
});

test("canonical order must precede imports", () => {
  const missing = fixture(
    "@import './runtime/engines/modern/skin/button.css' layer(rottay-engines);\n"
  );
  const late = fixture(
    "@import './runtime/engines/modern/skin/button.css' layer(rottay-engines);\n" +
      canonical
  );
  try {
    assert.equal(run(missing.entry).status, 1);
    const result = run(late.entry);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /before imports/);
  } finally {
    missing.cleanup();
    late.cleanup();
  }
});

test("first-party paint cannot escape or use the wrong layer", () => {
  const unlayered = fixture(
    `${canonical}\n@import './runtime/engines/modern/skin/button.css';\n`
  );
  const wrong = fixture(
    `${canonical}\n@import './presentation/components/skin/card.css' layer(rottay-engines);\n`
  );
  try {
    const escaped = run(unlayered.entry);
    assert.equal(escaped.status, 1);
    assert.match(escaped.stderr, /unlayered first-party import/);
    const misplaced = run(wrong.entry);
    assert.equal(misplaced.status, 1);
    assert.match(misplaced.stderr, /wrong cascade owner/);
  } finally {
    unlayered.cleanup();
    wrong.cleanup();
  }
});

test("every owned channel maps to its canonical layer and root authorities stay unlayered", () => {
  const f = fixture(
    [
      canonical,
      "@import './foundation/base/index.css' layer(rottay-tokens);",
      "@import './foundation/base/properties.css';",
      "@import './foundation/animations/index.css' layer(rottay-motion);",
      "@import './presentation/components/skin/card.css' layer(rottay-components);",
      "@import './runtime/engines/modern/skin/card.css' layer(rottay-engines);",
      "@import './facade/artifacts/bithire/index.css';",
      "@import './runtime/personality.css' layer(rottay-personality);",
      "@import './foundation/responsive/index.css' layer(rottay-responsive);",
      "@import './foundation/responsive/language-arabic-root.css';",
      "",
    ].join("\n")
  );
  try {
    const result = run(f.entry);
    assert.equal(result.status, 0, result.stderr || result.stdout);
  } finally {
    f.cleanup();
  }
});

test("tenant artifacts and the Arabic root floor cannot be demoted into a named layer", () => {
  const tenant = fixture(
    `${canonical}\n@import './facade/artifacts/bithire/index.css' layer(rottay-components);\n`
  );
  const arabic = fixture(
    `${canonical}\n@import './foundation/responsive/language-arabic-root.css' layer(rottay-responsive);\n`
  );
  try {
    for (const entry of [tenant.entry, arabic.entry]) {
      const result = run(entry);
      assert.equal(result.status, 1);
      assert.match(result.stderr, /root paint authority must remain unlayered/);
    }
  } finally {
    tenant.cleanup();
    arabic.cleanup();
  }
});

test("obsolete paint bridges cannot re-enter either entrypoint", () => {
  for (const entry of [
    "facade/entrypoints/base.css",
    "facade/entrypoints/styles.css",
  ]) {
    const css = readFileSync(join(cssRoot, entry), "utf8");
    assert.doesNotMatch(css, /(?:patterns|collapse|personality)-paint\.css/);
  }
});

test("universal tenant border floors are absent from authored extensions", () => {
  const artifactRoot = join(cssRoot, "facade/artifacts");
  for (const slug of ["rottay", "bithire", "evnto"]) {
    const extension = readFileSync(
      join(artifactRoot, slug, "_source/extension.css"),
      "utf8"
    );
    assert.doesNotMatch(
      extension,
      /\*\s*,\s*::after\s*,\s*::before\s*,\s*::backdrop\s*,\s*::file-selector-button\s*\{[\s\S]*?border-color/,
      `${slug}: universal border floor must not return`
    );
  }
});

test("reduced-motion authority exists in both OS and runtime policy seams", () => {
  const transitions = readFileSync(
    join(cssRoot, "foundation/animations/transitions.css"),
    "utf8"
  );
  const personality = readFileSync(
    join(cssRoot, "runtime/personality.css"),
    "utf8"
  );
  const tokens = [
    "--ds-motion-instant",
    "--ds-motion-fast",
    "--ds-motion-normal",
    "--ds-motion-slow",
    "--ds-motion-glacial",
    "--ds-motion-rearrange",
    "--ds-motion-resize",
  ];

  for (const token of tokens) {
    assert.match(transitions, new RegExp(`${token}: 0s !important;`));
    assert.match(personality, new RegExp(`${token}: 0s !important;`));
  }
});
