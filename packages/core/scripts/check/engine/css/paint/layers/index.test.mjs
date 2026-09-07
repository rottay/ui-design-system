import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import postcss from "postcss";
import {
  CANONICAL_LAYER_ORDER,
  HEADER_CLAIM_DEBT,
  INLINE_STYLE_ESCAPE_CEILINGS,
  auditInlineStyleEscapes,
  countInlineStyleEscapes,
  auditHeaderLayerClaims,
  auditSingleEntrypoint,
  auditCascadeEntrypoint,
  buildSkinTierIndex,
  markerTier,
  resolveSkinTier,
  rosterMountedCss,
  skinTierCensus,
  RETIRED_ENTRYPOINT_DIRS,
} from "./index.mjs";
import { packageRoot as findPackageRoot } from '../../../../../libraries/repo-root/index.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const gate = join(scriptDir, "index.mjs");
const cssRoot = join(findPackageRoot(scriptDir), "src/foundation/tokens/css");
const canonical =
  "@layer theme, base, rottay-framework, rottay-reset, rottay-tokens, rottay-motion, rottay-components, rottay-engines, rottay-structures, rottay-surfaces, rottay-personality, rottay-responsive, components, utilities;";

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
    "runtime/engines/modern/framework-token-projection/index.css"
  );
  const paintPath = join(cssRoot, "runtime/engines/modern/theme/index.css");
  const bridgePath = join(
    cssRoot,
    "runtime/engines/modern/framework-bridge/index.css"
  );
  const projection = postcss.parse(readFileSync(projectionPath, "utf8"));
  const paint = postcss.parse(readFileSync(paintPath, "utf8"));
  const bridgeCss = readFileSync(bridgePath, "utf8");
  const bridge = postcss.parse(bridgeCss);

  projection.walkRules((rule) =>
    assert.equal(rule.selector, "[data-engine='modern']")
  );
  projection.walkDecls((declaration) => {
    assert.doesNotMatch(declaration.prop, /^--ds-/);
    assert.match(declaration.value.trim(), /^var\(--ds-[a-z0-9-]+\)$/);
  });
  paint.walkDecls((declaration) =>
    assert.doesNotMatch(declaration.prop, /^--/)
  );
  bridge.walkRules((rule) =>
    assert.match(rule.selector, /\[data-engine='modern'\]/)
  );
  bridge.walkDecls((declaration) =>
    assert.doesNotMatch(declaration.prop, /^--/)
  );
  assert.doesNotMatch(bridgeCss, /\.divider(?:\b|-horizontal\b|-vertical\b)/);
  assert.doesNotMatch(bridgeCss, /\.inline-flex\.flex-row|\[style\*=["']gap["']\]/);
});

test("canonical order must precede imports", () => {
  const missing = fixture(
    "@import './runtime/engines/modern/skin/button/index.css' layer(rottay-engines);\n"
  );
  const late = fixture(
    "@import './runtime/engines/modern/skin/button/index.css' layer(rottay-engines);\n" +
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
    `${canonical}\n@import './runtime/engines/modern/skin/button/index.css';\n`
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
      "@import './foundation/base/properties/index.css';",
      "@import './foundation/monochrome/index.css' layer(rottay-tokens);",
      "@import './foundation/animations/index.css' layer(rottay-motion);",
      "@import './presentation/components/skin/card.css' layer(rottay-components);",
      "@import './runtime/engines/modern/skin/card/index.css' layer(rottay-engines);",
      "@import './facade/artifacts/bithire/index.css';",
      "@import './runtime/personality/index.css' layer(rottay-personality);",
      "@import './foundation/responsive/index.css' layer(rottay-responsive);",
      "@import './foundation/responsive/language-arabic-root/index.css';",
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

test("the monochrome channel is owned by rottay-tokens, and only that exact channel", () => {
  // The monochrome scale authors `--ds-*` tokens, so rottay-tokens owns it.
  // Ownership must be enforced in both directions -- escaping the cascade and
  // claiming the wrong owner both fail -- and it must be scoped to this exact
  // channel rather than a broad `foundation/` catch-all that would silently
  // adopt any future sibling.
  const unlayered = fixture(
    `${canonical}\n@import './foundation/monochrome/index.css';\n`
  );
  const wrong = fixture(
    `${canonical}\n@import './foundation/monochrome/index.css' layer(rottay-components);\n`
  );
  const sibling = fixture(
    `${canonical}\n@import './foundation/monochrome-legacy/index.css' layer(rottay-tokens);\n`
  );
  try {
    const escaped = run(unlayered.entry);
    assert.equal(escaped.status, 1, escaped.stdout);
    assert.match(
      escaped.stderr,
      /unlayered first-party import: \.\/foundation\/monochrome\/index\.css; expected layer\(rottay-tokens\)/
    );

    const misplaced = run(wrong.entry);
    assert.equal(misplaced.status, 1, misplaced.stdout);
    assert.match(
      misplaced.stderr,
      /wrong cascade owner: \.\/foundation\/monochrome\/index\.css uses layer\(rottay-components\); expected layer\(rottay-tokens\)/
    );

    // A prefix-sibling is NOT the monochrome channel: it has no declared owner
    // and stays a defect even though it names the layer the real channel uses.
    const undeclared = run(sibling.entry);
    assert.equal(undeclared.status, 1, undeclared.stdout);
    assert.match(
      undeclared.stderr,
      /first-party import has no cascade owner: \.\/foundation\/monochrome-legacy\/index\.css/
    );
  } finally {
    unlayered.cleanup();
    wrong.cleanup();
    sibling.cleanup();
  }
});

test("tenant artifacts and the Arabic root floor cannot be demoted into a named layer", () => {
  const tenant = fixture(
    `${canonical}\n@import './facade/artifacts/bithire/index.css' layer(rottay-components);\n`
  );
  const arabic = fixture(
    `${canonical}\n@import './foundation/responsive/language-arabic-root/index.css' layer(rottay-responsive);\n`
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

test("obsolete paint bridges cannot re-enter the entrypoint", () => {
  const css = readFileSync(
    join(cssRoot, "facade/entrypoints/base/index.css"),
    "utf8"
  );
  assert.doesNotMatch(css, /(?:patterns|collapse|personality)-paint\.css/);
});

// EXCISED (SEV-2): "universal tenant border floors are absent from authored
// extensions". Its whole corpus was the three `facade/artifacts/<slug>/_source/
// extension.css` files, which are deleted in this tranche, so it threw at
// collection with ENOENT rather than proving anything. The claim it carried —
// no second authored source reinstates a fleet-wide `*, ::after, ::before,
// ::backdrop, ::file-selector-button { border-color }` floor — is now
// unconditional under law G2 of `scripts/check/verticals/single-author/index.mjs`:
// there is no authored extension left to declare a floor in. The three
// matching `UNREACHABLE_BY_DESIGN` rows were dropped from the gate in the same
// edit, because a stale entry there is itself a gate failure.
test("reduced-motion authority exists in both OS and runtime policy seams", () => {
  const transitions = readFileSync(
    join(cssRoot, "foundation/animations/transitions/index.css"),
    "utf8"
  );
  const personality = readFileSync(
    join(cssRoot, "runtime/personality/index.css"),
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

test("both-halves-ship: the real tree has no undeclared orphan", async () => {
  const { auditGovernedFilesAreReachable } = await import(
    "./index.mjs"
  );
  assert.deepEqual(auditGovernedFilesAreReachable(), []);
});

/**
 * A synthetic root has no first-party roster, and the reachability audit fails
 * CLOSED without one. Each fixture therefore writes the roster shape it needs
 * and the files that roster mounts, so the drill exercises the real code path
 * instead of a bypass.
 */
function rosterFixture(root, slug = "fixture") {
  const rosterPath = join(root, "roster.ts");
  writeFileSync(
    rosterPath,
    [
      "export const FIRST_PARTY_VERTICAL_ROSTER = Object.freeze([",
      `    entry(${slug}BrandTheme, {`,
      '      fontPacks: ["fixture-text"],',
      "    }),",
      "  ]);",
      "",
    ].join("\n")
  );
  mkdirSync(join(root, `facade/artifacts/${slug}`), { recursive: true });
  writeFileSync(join(root, `facade/artifacts/${slug}/index.css`), ":root{--ds-t:1}");
  mkdirSync(join(root, "foundation/typography/font-packs/fixture-text"), {
    recursive: true,
  });
  writeFileSync(
    join(root, "foundation/typography/font-packs/fixture-text/index.css"),
    "@font-face{font-family:F;src:local(F)}"
  );
  return rosterPath;
}

test("both-halves-ship: an orphaned governed file FAILS the gate", async () => {
  const { auditGovernedFilesAreReachable } = await import(
    "./index.mjs"
  );
  const root = mkdtempSync(join(tmpdir(), "css-reachability-"));
  try {
    mkdirSync(join(root, "facade/entrypoints/base"), { recursive: true });
    mkdirSync(join(root, "presentation/components/live"), { recursive: true });
    mkdirSync(join(root, "presentation/components/live-paint"), { recursive: true });
    writeFileSync(
      join(root, "facade/entrypoints/base/index.css"),
      '@import "../../../presentation/components/live/index.css" layer(rottay-components);'
    );
    writeFileSync(join(root, "presentation/components/live/index.css"), ".a{color:red}");
    // The exact shape of the 2026-07-25 defect: a split half nothing imports.
    writeFileSync(
      join(root, "presentation/components/live-paint/index.css"),
      ".a{background:red}"
    );

    const rosterPath = rosterFixture(root);
    const failures = auditGovernedFilesAreReachable({
      cssRoot: root,
      allowlist: new Map(),
      rosterPath,
    });
    assert.equal(failures.length, 1, failures.join("\n"));
    assert.match(failures[0], /live-paint\/index\.css is imported by no entrypoint/);

    // Declaring it silences the gate; that is the intended escape hatch.
    assert.deepEqual(
      auditGovernedFilesAreReachable({
        cssRoot: root,
        allowlist: new Map([
          ["presentation/components/live-paint/index.css", "tombstone"],
        ]),
        rosterPath,
      }),
      []
    );

    // An unreadable roster must not downgrade every roster-mounted artifact to
    // "unreachable" and then let the allowlist explain it away.
    const closed = auditGovernedFilesAreReachable({
      cssRoot: root,
      allowlist: new Map(),
      rosterPath: join(root, "absent-roster.ts"),
    });
    assert.equal(closed.length, 1, closed.join("\n"));
    assert.match(closed[0], /first-party roster is unreadable/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("both-halves-ship: a stale unreachable-by-design entry FAILS", async () => {
  const { auditGovernedFilesAreReachable } = await import(
    "./index.mjs"
  );
  const root = mkdtempSync(join(tmpdir(), "css-reachability-stale-"));
  try {
    mkdirSync(join(root, "facade/entrypoints/base"), { recursive: true });
    mkdirSync(join(root, "presentation/components/live"), { recursive: true });
    writeFileSync(
      join(root, "facade/entrypoints/base/index.css"),
      '@import "../../../presentation/components/live/index.css" layer(rottay-components);'
    );
    writeFileSync(join(root, "presentation/components/live/index.css"), ".a{color:red}");

    const failures = auditGovernedFilesAreReachable({
      cssRoot: root,
      allowlist: new Map([
        ["presentation/components/live/index.css", "claims to be unreachable"],
      ]),
      rosterPath: rosterFixture(root),
    });
    assert.equal(failures.length, 1, failures.join("\n"));
    assert.match(failures[0], /stale unreachable-by-design entry/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// ── WO-CAN-03: tier order, entrypoint derivation, header truthfulness ────────

test("the canonical order puts structures and surfaces after engines", () => {
  const order = CANONICAL_LAYER_ORDER.replace(/^@layer\s+/, "")
    .replace(/;$/, "")
    .split(",")
    .map((name) => name.trim());
  for (const [lower, higher] of [
    ["rottay-components", "rottay-engines"],
    ["rottay-engines", "rottay-structures"],
    ["rottay-structures", "rottay-surfaces"],
    ["rottay-surfaces", "rottay-responsive"],
  ]) {
    assert.ok(
      order.indexOf(lower) >= 0 && order.indexOf(lower) < order.indexOf(higher),
      `${lower} must sort before ${higher}`
    );
  }
});

test("a shared skin is layered by the tier marker its own selectors carry", () => {
  const dir = mkdtempSync(join(tmpdir(), "css-marker-tier-"));
  try {
    const surface = join(dir, "surface.css");
    const structure = join(dir, "structure.css");
    const plain = join(dir, "plain.css");
    writeFileSync(surface, ".ds-surface.ds-report { color: red; }\n");
    writeFileSync(structure, ".ds-structure.ds-column-menu { color: red; }\n");
    writeFileSync(plain, ".rottay-button { color: red; }\n");
    assert.equal(markerTier(surface), "rottay-surfaces");
    assert.equal(markerTier(structure), "rottay-structures");
    assert.equal(markerTier(plain), "rottay-components");
    // A marker that only ever appears inside a comment is not an anatomy claim.
    writeFileSync(plain, "/* .ds-surface.ds-x */\n.rottay-button { color: red; }\n");
    assert.equal(markerTier(plain), "rottay-components");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("single-entrypoint: the real tree has exactly one canon", () => {
  assert.deepEqual(auditSingleEntrypoint(), []);
});

test("single-entrypoint: a resurrected directory FAILS", () => {
  const dir = mkdtempSync(join(tmpdir(), "css-single-entry-"));
  try {
    // Composed, never written literally: the tail form is itself a resolution
    // the death proof reads, so a literal `"styles/index.css"` here would trip
    // the gate this drill exists to exercise.
    const retiredDir = RETIRED_ENTRYPOINT_DIRS[0];
    const entrypointDir = join(dir, "src/foundation/tokens/css/facade/entrypoints");
    mkdirSync(join(entrypointDir, "base"), { recursive: true });
    mkdirSync(join(entrypointDir, retiredDir), { recursive: true });
    writeFileSync(join(entrypointDir, "base/index.css"), `${canonical}\n`);
    writeFileSync(join(entrypointDir, `${retiredDir}/index.css`), `${canonical}\n`);

    const failures = auditSingleEntrypoint({
      cssRoot: join(dir, "src/foundation/tokens/css"),
      packageRoot: dir,
      repoRoot: dir,
    });

    assert.ok(
      failures.some((failure) => /retired entrypoint directory is back: facade\/entrypoints\/styles/.test(failure)),
      failures.join("\n")
    );
    assert.ok(
      failures.some((failure) => /expected exactly one entrypoint/.test(failure)),
      failures.join("\n")
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("single-entrypoint: a consumer still resolving a retired path FAILS", () => {
  // Deleting the directories without repointing the consumers is not a
  // migration, and a readdir-only check would certify exactly that.
  const dir = mkdtempSync(join(tmpdir(), "css-dead-consumer-"));
  try {
    const entrypointDir = join(dir, "src/foundation/tokens/css/facade/entrypoints");
    mkdirSync(join(entrypointDir, "base"), { recursive: true });
    writeFileSync(join(entrypointDir, "base/index.css"), `${canonical}\n`);
    // Composed, never written literally: this file is itself inside the scan,
    // so a literal planted path would make the drill trip its own gate.
    const retired = `facade/entrypoints/${RETIRED_ENTRYPOINT_DIRS[0]}/index.css`;
    mkdirSync(join(dir, "scripts/thing"), { recursive: true });
    writeFileSync(
      join(dir, "scripts/thing/index.mjs"),
      [
        `/* ${retired} is prose here, not a resolution */`,
        `const styles = join(CSS_ROOT, '${retired}');`,
        "",
      ].join("\n")
    );

    const failures = auditSingleEntrypoint({
      cssRoot: join(dir, "src/foundation/tokens/css"),
      packageRoot: dir,
      repoRoot: dir,
    });

    assert.equal(failures.length, 1, failures.join("\n"));
    assert.match(failures[0], /scripts\/thing\/index\.mjs:2 still resolves a retired entrypoint/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("single-entrypoint: a composed bare retired slug is caught, a roster slug is not", () => {
  // The shape that survived the first migration: nothing writes the retired
  // path, the consumer ITERATES the entrypoint slugs and joins each onto the
  // entrypoint directory. `MarkdownView.pass1-premium.test.tsx` did exactly
  // this and read a deleted file while both earlier shapes reported clean.
  const dir = mkdtempSync(join(tmpdir(), "css-slug-consumer-"));
  try {
    const entrypointDir = join(dir, "src/foundation/tokens/css/facade/entrypoints");
    mkdirSync(join(entrypointDir, "base"), { recursive: true });
    writeFileSync(join(entrypointDir, "base/index.css"), `${canonical}\n`);
    mkdirSync(join(dir, "src/thing"), { recursive: true });
    const retiredDir = RETIRED_ENTRYPOINT_DIRS[0];
    writeFileSync(
      join(dir, "src/thing/index.ts"),
      [
        "const ENTRY = 'facade/entrypoints';",
        `for (const entry of ['base', '${retiredDir}'] as const) {`,
        "  readFileSync(join(ENTRY, entry, 'index.css'), 'utf8');",
        "}",
        // The vertical roster names the SAME three slugs and is not an
        // entrypoint reference: a bare slug on its own must never fire.
        "const roster = ['rottay', 'bithire', 'evnto'];",
        "",
      ].join("\n")
    );

    const failures = auditSingleEntrypoint({
      cssRoot: join(dir, "src/foundation/tokens/css"),
      packageRoot: dir,
      repoRoot: dir,
    });

    assert.equal(failures.length, 1, failures.join("\n"));
    assert.match(failures[0], /src\/thing\/index\.ts:2 still resolves a retired entrypoint/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("single-entrypoint: a .storybook consumer is inside the scan", () => {
  // `.storybook/preview.tsx` imported the retired entrypoint and
  // `build-storybook` is a main-branch CI step, so a scan limited to
  // src/scripts/tests certified a deletion that broke the build.
  const dir = mkdtempSync(join(tmpdir(), "css-storybook-consumer-"));
  try {
    const entrypointDir = join(dir, "src/foundation/tokens/css/facade/entrypoints");
    mkdirSync(join(entrypointDir, "base"), { recursive: true });
    writeFileSync(join(entrypointDir, "base/index.css"), `${canonical}\n`);
    mkdirSync(join(dir, ".storybook"), { recursive: true });
    const retired = `facade/entrypoints/${RETIRED_ENTRYPOINT_DIRS[0]}/index.css`;
    writeFileSync(
      join(dir, ".storybook/preview.tsx"),
      [`import "../src/foundation/tokens/css/${retired}";`, ""].join("\n")
    );

    const failures = auditSingleEntrypoint({
      cssRoot: join(dir, "src/foundation/tokens/css"),
      packageRoot: dir,
      repoRoot: dir,
    });

    assert.equal(failures.length, 1, failures.join("\n"));
    assert.match(failures[0], /\.storybook\/preview\.tsx:1 still resolves a retired entrypoint/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("single-entrypoint: a showroom consumer is inside the scan", () => {
  const dir = mkdtempSync(join(tmpdir(), "css-showroom-consumer-"));
  try {
    const entrypointDir = join(dir, "core/src/foundation/tokens/css/facade/entrypoints");
    mkdirSync(join(entrypointDir, "base"), { recursive: true });
    writeFileSync(join(entrypointDir, "base/index.css"), `${canonical}\n`);
    mkdirSync(join(dir, "packages/showroom/src/app"), { recursive: true });
    const retired = `facade/entrypoints/${RETIRED_ENTRYPOINT_DIRS[0]}/index.css`;
    writeFileSync(
      join(dir, "packages/showroom/src/app/layout.tsx"),
      [`import "@rottay/design-system/src/foundation/tokens/css/${retired}";`, ""].join("\n")
    );

    const failures = auditSingleEntrypoint({
      cssRoot: join(dir, "core/src/foundation/tokens/css"),
      packageRoot: join(dir, "core"),
      repoRoot: dir,
    });

    assert.equal(failures.length, 1, failures.join("\n"));
    assert.match(
      failures[0],
      /packages\/showroom\/src\/app\/layout\.tsx:1 still resolves a retired entrypoint/
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a first-party import that resolves to nothing FAILS as a dangling import", () => {
  // `markerTier` used to answer `rottay-components` for a path that does not
  // exist, so a dangling import claiming a higher tier was reported as an
  // ordinary wrong-owner and one claiming `rottay-components` was reported as
  // correct. Both directions must now be a named resolution failure.
  const missing = fixture(
    [
      canonical,
      '@import "../../../presentation/components/skin/does-not-exist/index.css" layer(rottay-components);',
      "",
    ].join("\n")
  );
  try {
    const failures = auditCascadeEntrypoint(missing.entry);
    assert.equal(failures.length, 1, failures.join("\n"));
    assert.match(failures[0], /first-party import does not resolve/);
    assert.ok(
      !failures.some((failure) => /wrong cascade owner/.test(failure)),
      "a dangling import must not be reported as a tier mismatch"
    );
  } finally {
    missing.cleanup();
  }
  // Shaped exactly like a real shared skin, and still not on disk: the answer
  // is `null`, never a defaulted `rottay-components`.
  assert.equal(
    resolveSkinTier(join(tmpdir(), "skin/does-not-exist/index.css")),
    null
  );
});

test("skin tiering is derived from the owning family, not from the sheet's marker", () => {
  // The F-16 defect: a structure whose skin never emits `.ds-structure` was
  // classified into `rottay-components`, BELOW the engine it exists to
  // override. The resolver reads the family that owns the sheet, so the answer
  // does not depend on the sheet's markup habits.
  const dir = mkdtempSync(join(tmpdir(), "css-skin-tier-"));
  try {
    const componentsDir = join(dir, "src/components/structures/shell/widget-rail");
    mkdirSync(componentsDir, { recursive: true });
    writeFileSync(
      join(componentsDir, "index.tsx"),
      "export const WidgetRail = () => <div className=\"ds-widget-rail\" />;\n"
    );
    const inventory = join(dir, "inventory.json");
    writeFileSync(
      inventory,
      JSON.stringify({
        rows: [
          {
            id: "structure/shell/widget-rail",
            sourceOwner: "packages/core/src/components/structures/shell/widget-rail",
          },
        ],
      })
    );

    const skinDir = join(dir, "skin/widget-rail");
    mkdirSync(skinDir, { recursive: true });
    // No `.ds-structure` marker anywhere: the marker would say components.
    writeFileSync(join(skinDir, "index.css"), ".ds-widget-rail { color: red; }\n");

    const index = buildSkinTierIndex(inventory, dir);
    assert.equal(markerTier(join(skinDir, "index.css")), "rottay-components");
    assert.equal(resolveSkinTier(join(skinDir, "index.css"), index).tier, "rottay-structures");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a family that moves tier retiers its skin with no roster edit", () => {
  const dir = mkdtempSync(join(tmpdir(), "css-skin-relocate-"));
  try {
    const skinDir = join(dir, "skin/widget-rail");
    mkdirSync(skinDir, { recursive: true });
    writeFileSync(join(skinDir, "index.css"), ".ds-widget-rail { color: red; }\n");
    const inventory = join(dir, "inventory.json");
    const write = (root) => {
      mkdirSync(join(dir, `src/components/${root}/shell/widget-rail`), { recursive: true });
      writeFileSync(
        inventory,
        JSON.stringify({
          rows: [
            {
              id: "family/shell/widget-rail",
              sourceOwner: `packages/core/src/components/${root}/shell/widget-rail`,
            },
          ],
        })
      );
    };
    write("structures");
    assert.equal(
      resolveSkinTier(join(skinDir, "index.css"), buildSkinTierIndex(inventory, dir)).tier,
      "rottay-structures"
    );
    write("surfaces");
    assert.equal(
      resolveSkinTier(join(skinDir, "index.css"), buildSkinTierIndex(inventory, dir)).tier,
      "rottay-surfaces"
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("every shared skin the entrypoint binds agrees with its owning family", () => {
  const rows = skinTierCensus();
  // 157 -> 156 (WO-CAN-04): `skin/oauth-transition/index.css` left the package
  // with the surface it painted -- 2,277 lines, 13 `var(--ds-` reads and its
  // own `--rh-*` namespace. The count is a census floor, not a target: it must
  // move down with a real removal and must never be raised to absorb a new
  // shared skin that skipped tier review.
  assert.equal(rows.length, 156);
  const mismatched = rows.filter((row) => row.bound !== row.tier);
  assert.deepEqual(mismatched, [], JSON.stringify(mismatched, null, 2));
  // Nothing is classified by a route that reads no source at all.
  const unowned = rows.filter((row) => row.via === "unresolvable");
  assert.deepEqual(unowned, []);
});

test("the tier resolver, not the marker, is what places a structure above the engines", () => {
  // Five live sheets stamp `.ds-surface` because they paint INSIDE a surface
  // root while belonging to a structure family. The marker is reported beside
  // the answer and never produces it.
  const rows = skinTierCensus();
  const disagreeing = rows
    .filter((row) => row.marker && row.marker !== row.tier)
    .map((row) => row.skin.replace(/.*skin\//, ""));
  assert.deepEqual(disagreeing.sort(), [
    "collection-shell/index.css",
    "layout-header/index.css",
    "layout-sidebar/index.css",
    "surface-section-card/index.css",
    "surface-states/index.css",
  ]);
  for (const row of rows.filter((entry) => entry.tier !== "rottay-components")) {
    assert.notEqual(row.via, "engine-agnostic-default", row.skin);
  }
});

test("single-entrypoint: the tail form is caught, the artifact tail is not", () => {
  const dir = mkdtempSync(join(tmpdir(), "css-tail-consumer-"));
  try {
    const entrypointDir = join(dir, "src/foundation/tokens/css/facade/entrypoints");
    mkdirSync(join(entrypointDir, "base"), { recursive: true });
    writeFileSync(join(entrypointDir, "base/index.css"), `${canonical}\n`);
    mkdirSync(join(dir, "scripts/worklist"), { recursive: true });
    const retiredDir = RETIRED_ENTRYPOINT_DIRS[0];
    writeFileSync(
      join(dir, "scripts/worklist/index.mjs"),
      [
        "const ENTRY_DIR = join(CSS_ROOT, 'facade/entrypoints');",
        `for (const name of ['base/index.css', '${retiredDir}/index.css']) {}`,
        // The compiled tenant artifact has the same three slugs, and it is the
        // thing the retired entrypoints were REPLACED by, so it must not trip.
        "const artifact = join(artifactsDir, 'rottay/index.css');",
        "",
      ].join("\n")
    );

    const failures = auditSingleEntrypoint({
      cssRoot: join(dir, "src/foundation/tokens/css"),
      packageRoot: dir,
      repoRoot: dir,
    });

    assert.equal(failures.length, 1, failures.join("\n"));
    assert.match(failures[0], /scripts\/worklist\/index\.mjs:2 still resolves a retired entrypoint/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("single-entrypoint: every retired name is covered by the scan", () => {
  assert.deepEqual([...RETIRED_ENTRYPOINT_DIRS].sort(), [
    "bithire",
    "evnto",
    "rottay",
    "styles",
  ]);
});

test("roster-mounted CSS is what the build mounts without an @import", () => {
  // The tenant artifact and the font packs reach the bundle by roster lookup,
  // never through the import graph. Reading the roster is what keeps them
  // governed after the vertical entrypoints that used to import them are gone.
  const mounted = rosterMountedCss();

  assert.ok(mounted, "roster must be readable");
  for (const slug of ["rottay", "bithire", "evnto"]) {
    assert.ok(mounted.has(`facade/artifacts/${slug}/index.css`), slug);
  }
  assert.ok(
    mounted.has("foundation/typography/font-packs/geometric-display/index.css"),
    "evnto selects geometric-display; it is not an unselected pack"
  );
  assert.equal(
    mounted.has("foundation/typography/font-packs/editorial-text/index.css"),
    false,
    "no vertical selects editorial-text"
  );
});

test("roster-mounted CSS fails CLOSED when the roster cannot be read", () => {
  const dir = mkdtempSync(join(tmpdir(), "css-roster-"));
  try {
    assert.equal(rosterMountedCss(join(dir, "absent.ts")), null);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("header-layer-claim: the real tree has no undeclared false header", () => {
  assert.deepEqual(auditHeaderLayerClaims(), []);
});

test("header-layer-claim: a planted false header FAILS and a fixed one goes stale", () => {
  const dir = mkdtempSync(join(tmpdir(), "css-header-claim-"));
  try {
    const entrypointDir = join(dir, "facade/entrypoints/base");
    mkdirSync(entrypointDir, { recursive: true });
    mkdirSync(join(dir, "runtime/engines/modern/skin/planted"), {
      recursive: true,
    });
    const planted = join(dir, "runtime/engines/modern/skin/planted/index.css");
    writeFileSync(
      join(entrypointDir, "index.css"),
      `${canonical}\n@import "../../../runtime/engines/modern/skin/planted/index.css" layer(rottay-engines);\n`
    );

    writeFileSync(
      planted,
      "/**\n * Planted skin.\n *\n * DELIBERATELY UNLAYERED (P-47).\n */\n.x { color: red; }\n"
    );
    assert.ok(
      auditHeaderLayerClaims({ cssRoot: dir, debt: new Map() }).some((failure) =>
        /claims "deliberately unlayered" but is imported into layer\(rottay-engines\)/.test(
          failure
        )
      )
    );

    writeFileSync(
      planted,
      "/**\n * Planted skin.\n *\n * LAYER: `layer(rottay-surfaces)`.\n */\n.x { color: red; }\n"
    );
    assert.ok(
      auditHeaderLayerClaims({ cssRoot: dir, debt: new Map() }).some((failure) =>
        /claims layer\(rottay-surfaces\) but is imported into layer\(rottay-engines\)/.test(
          failure
        )
      )
    );

    writeFileSync(
      planted,
      "/**\n * Planted skin.\n *\n * LAYER: `layer(rottay-engines)`.\n */\n.x { color: red; }\n"
    );
    assert.deepEqual(auditHeaderLayerClaims({ cssRoot: dir, debt: new Map() }), []);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("header-layer-claim debt is decrease-only and every entry is real", () => {
  const failures = auditHeaderLayerClaims();
  assert.deepEqual(
    failures.filter((failure) => failure.startsWith("stale header-claim debt")),
    []
  );
  // The debt list may never shelve this WO's own work. Its write set is the
  // one entrypoint plus the headers of the PRODUCTIVE engine; classic and
  // rustic are frozen, so their headers are declared debt, not deliverables.
  for (const rel of HEADER_CLAIM_DEBT.keys()) {
    assert.ok(
      !rel.startsWith("facade/entrypoints/") &&
        !rel.startsWith("runtime/engines/modern/"),
      `${rel}: the debt list only covers headers outside the WO-CAN-03 write set`
    );
  }

  // And the freeze must stay visible as a freeze: every engine row in the debt
  // belongs to an engine this WO was not allowed to touch.
  const engineRows = [...HEADER_CLAIM_DEBT.keys()].filter((rel) =>
    rel.startsWith("runtime/engines/")
  );
  assert.ok(engineRows.length > 0, "the rustic freeze is recorded, not silent");
  assert.ok(
    engineRows.every((rel) => rel.startsWith("runtime/engines/rustic/")),
    engineRows.filter((rel) => !rel.startsWith("runtime/engines/rustic/")).join("\n")
  );
});

test("inline-style-escape: the pinned ceilings match the real tree exactly", () => {
  assert.deepEqual(auditInlineStyleEscapes(), []);
});

test("inline-style-escape: the ratchet bites in BOTH directions", () => {
  const dir = mkdtempSync(join(tmpdir(), "inline-style-ratchet-"));
  try {
    for (const tier of INLINE_STYLE_ESCAPE_CEILINGS.keys()) {
      mkdirSync(join(dir, tier), { recursive: true });
      writeFileSync(join(dir, tier, "index.tsx"), "<div />;\n");
    }
    const below = auditInlineStyleEscapes({ componentsRoot: dir });
    assert.equal(below.length, INLINE_STYLE_ESCAPE_CEILINGS.size);
    assert.ok(below.every((failure) => /below the ceiling/.test(failure)));

    for (const [tier, ceiling] of INLINE_STYLE_ESCAPE_CEILINGS) {
      writeFileSync(
        join(dir, tier, "index.tsx"),
        "<div style={{}} />;\n".repeat(ceiling + 1)
      );
    }
    const above = auditInlineStyleEscapes({ componentsRoot: dir });
    assert.equal(above.length, INLINE_STYLE_ESCAPE_CEILINGS.size);
    assert.ok(above.every((failure) => /ceiling/.test(failure)));
    assert.ok(above.every((failure) => !/below the ceiling/.test(failure)));

    // Tests and stories are not shipped paint and must not count.
    for (const tier of INLINE_STYLE_ESCAPE_CEILINGS.keys()) {
      mkdirSync(join(dir, tier, "tests"), { recursive: true });
      writeFileSync(
        join(dir, tier, "tests", "index.tsx"),
        "<div style={{}} />;\n"
      );
      writeFileSync(
        join(dir, tier, "scene.stories.tsx"),
        "<div style={{}} />;\n"
      );
    }
    for (const [tier, ceiling] of INLINE_STYLE_ESCAPE_CEILINGS) {
      assert.equal(
        countInlineStyleEscapes(tier, { componentsRoot: dir }),
        ceiling + 1
      );
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
