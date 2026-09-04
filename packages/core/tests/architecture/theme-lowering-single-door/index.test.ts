/**
 * @fileoverview Fail-closed gate: the theme lowering has exactly one door.
 *
 * C2's whole product is that there is ONE route from a resolved theme to CSS
 * channels. That property is invisible in a diff and easy to lose one import at
 * a time, so it is asserted structurally here: the retired doors must not exist
 * as productive symbols, and no productive source may import or call them.
 *
 * The mutation block at the bottom proves the assertions can fail. A gate that
 * has never been shown to go red is not evidence, and every one of these
 * findings is the exact shape a regression would take.
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

import ts from "typescript";
import { describe, expect, it } from "vitest";

// A .mjs tooling module: this test asserts on its ownership record, which is
// the module's own statement that it is support and not a second door.
import { THEME_LOWERING_OWNERSHIP } from "../../../scripts/libraries/theme-lowering/index.mjs";

const PACKAGE_ROOT = resolve(__dirname, "../../..");
const SRC_ROOT = join(PACKAGE_ROOT, "src");
const SHOWROOM_ROOT = resolve(PACKAGE_ROOT, "../showroom/src");

/** The lowering doors C2 retired. None may survive in productive code. */
const RETIRED_DOORS = [
  "compileBrandTheme",
  "compileBrandThemeDeprecated",
  "themeToBrandTheme",
] as const;

/**
 * `appearanceToVariables` is retired as a public door AND as a productive one.
 * The allowlist that used to record the branding sandbox is gone: that caller
 * now resolves its appearance over a baseline and lowers it through
 * `compileTheme`, so the door has zero productive callers and the exception has
 * no subject left.
 */
const APPEARANCE_DOOR = "appearanceToVariables";
const APPEARANCE_DOOR_KNOWN_CALLERS: readonly string[] = [];

/** The sole lowering, and the only file allowed to define it. */
const LOWERING_OWNER =
  "src/infrastructure/compilers/runtime/theme/runtime/lowering/index.ts";

const TEST_OR_SUPPORT =
  /(?:^|[\\/])(?:tests?|__tests__|__test__|fixtures|_fixtures|__fixtures__|stories)[\\/]|\.(?:test|spec|stories)\.[cm]?tsx?$/u;

function walk(root: string): string[] {
  if (!existsSync(root)) return [];
  const out: string[] = [];
  const visit = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) visit(full);
      else if (/\.[cm]?tsx?$/u.test(entry)) out.push(full);
    }
  };
  visit(root);
  return out;
}

/** Productive sources: no tests, no fixtures, no stories, no declarations. */
function productiveSources(): { path: string; label: string; source: string }[] {
  const rows: { path: string; label: string; source: string }[] = [];
  for (const [root, prefix] of [
    [SRC_ROOT, "src"],
    [SHOWROOM_ROOT, "showroom/src"],
  ] as const) {
    for (const file of walk(root)) {
      const rel = relative(root, file).split(sep).join("/");
      if (TEST_OR_SUPPORT.test(`/${rel}`) || rel.endsWith(".d.ts")) continue;
      rows.push({ path: file, label: `${prefix}/${rel}`, source: readFileSync(file, "utf8") });
    }
  }
  return rows;
}

/**
 * Every name this source DECLARES at module scope, from the TypeScript AST.
 *
 * A regex over `(?:export )?(?:function|const) <name>` was the first version and it
 * was wrong in the one direction that matters: it read a declaration keyword and
 * missed `export const compileTheme = (...) => {}`, which is exactly the shape the
 * retired compiler had. A second door reintroduced as an arrow-const would have
 * passed a gate written to forbid it, so the detection is the compiler's own.
 */
function declaredNames(source: string, file: string): Set<string> {
  const parsed = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const names = new Set<string>();
  for (const statement of parsed.statements) {
    if (ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) {
      if (statement.name) names.add(statement.name.text);
      continue;
    }
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) names.add(declaration.name.text);
      }
    }
  }
  return names;
}

/**
 * Names the module DECLARES here and also exports — an OWNED export.
 *
 * Deliberately not the same question as "does this file's public surface carry
 * the name": a barrel re-exporting the one owner is how a package publishes,
 * and counting it as a definition would make the single-door rule unsatisfiable.
 * A second OWNED export is the defect.
 */
function ownExportedNames(source: string, file: string): Set<string> {
  const parsed = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const names = new Set<string>();
  const exported = (node: ts.Node): boolean =>
    ts.canHaveModifiers(node) &&
    (ts.getModifiers(node) ?? []).some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
  for (const statement of parsed.statements) {
    if (ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) {
      if (statement.name && exported(statement)) names.add(statement.name.text);
      continue;
    }
    if (ts.isVariableStatement(statement) && exported(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) names.add(declaration.name.text);
      }
    }
  }
  return names;
}

/** Names re-exported FROM another module (`export { x } from "..."`). */
function reExportedNames(source: string, file: string): Set<string> {
  const parsed = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const names = new Set<string>();
  for (const statement of parsed.statements) {
    if (
      ts.isExportDeclaration(statement) &&
      statement.moduleSpecifier &&
      statement.exportClause &&
      ts.isNamedExports(statement.exportClause)
    ) {
      for (const element of statement.exportClause.elements) names.add(element.name.text);
    }
  }
  return names;
}

/** Code with comments and string literals removed: an import or a call, only. */
function code(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//gu, "")
    .replace(/\/\/[^\n]*/gu, "")
    .replace(/`(?:\\[\s\S]|[^`\\])*`/gu, "``")
    .replace(/'(?:\\[\s\S]|[^'\\\n])*'/gu, "''")
    .replace(/"(?:\\[\s\S]|[^"\\\n])*"/gu, '""');
}

const SOURCES = productiveSources();

describe("the theme lowering has exactly one productive door", () => {
  it("the retired doors are not defined anywhere in the source tree", () => {
    const definitions: string[] = [];
    for (const { label, path, source } of SOURCES) {
      const declared = declaredNames(source, path);
      for (const door of RETIRED_DOORS) {
        if (declared.has(door)) definitions.push(`${label}: defines ${door}`);
      }
    }
    expect(definitions).toEqual([]);
  });

  it("no productive source imports or calls a retired door", () => {
    const findings: string[] = [];
    for (const { label, source } of SOURCES) {
      const body = code(source);
      for (const door of RETIRED_DOORS) {
        if (new RegExp(`\\b${door}\\b`, "u").test(body)) {
          findings.push(`${label}: references ${door}`);
        }
      }
    }
    expect(findings).toEqual([]);
  });

  it("the appearance door has no productive caller at all", () => {
    const callers = SOURCES.filter(({ label, source }) =>
      label.startsWith("src/") &&
      !label.startsWith("src/infrastructure/compilers/kernel/runtime/appearance/") &&
      new RegExp(`\\b${APPEARANCE_DOOR}\\b`, "u").test(code(source))
    ).map(({ label }) => label);
    expect(callers.sort()).toEqual([...APPEARANCE_DOOR_KNOWN_CALLERS].sort());
  });

  it("exactly one productive source defines compileTheme, in any export form", () => {
    const owners = SOURCES.filter(({ path, source }) =>
      declaredNames(source, path).has("compileTheme")
    ).map(({ label }) => label);
    expect(owners).toEqual([LOWERING_OWNER]);
  });

  it("exactly one productive source OWNS the compileTheme export", () => {
    const owners = SOURCES.filter(({ path, source }) =>
      ownExportedNames(source, path).has("compileTheme")
    ).map(({ label }) => label);
    expect(owners).toEqual([LOWERING_OWNER]);
  });

  it("every other publication of compileTheme is a re-export of that one owner", () => {
    const publishers = SOURCES.filter(({ path, source }) =>
      reExportedNames(source, path).has("compileTheme")
    ).map(({ label }) => label);
    // The package barrel and the server entrypoint, and nothing else: a third
    // publisher would mean a second surface a consumer could reach.
    expect(publishers.sort()).toEqual([
      "src/entrypoints/server/index.ts",
      "src/infrastructure/compilers/runtime/theme/index.ts",
    ]);
  });

  it("the lowering owner imports no other compiler", () => {
    const body = code(readFileSync(join(PACKAGE_ROOT, LOWERING_OWNER), "utf8"));
    expect(body).not.toMatch(/\bcompileBrandTheme\b/u);
    expect(body).not.toMatch(/\bthemeToBrandTheme\b/u);
    expect(body).not.toMatch(/\bappearanceToVariables\b/u);
    expect(body).not.toMatch(/\bcompileTenantThemeConfig\b/u);
  });

  it("exactly one productive source defines the pipeline's resolveTheme", () => {
    const owners = SOURCES.filter(({ path, source }) =>
      declaredNames(source, path).has("resolveTheme")
    ).map(({ label }) => label);
    expect(owners).toEqual([
      "src/infrastructure/compilers/runtime/theme/runtime/resolution/index.ts",
    ]);
  });

  it("the retired compiler owners are physically gone, with no forwarding file", () => {
    for (const gone of [
      "src/infrastructure/compilers/kernel/runtime/brand-theme",
      "src/infrastructure/compilers/facade",
    ]) {
      expect(existsSync(join(PACKAGE_ROOT, gone))).toBe(false);
    }
  });

  it("the test harness over the door is never imported by productive code", () => {
    const importers = SOURCES.filter(({ source }) =>
      /theme-lowering|lowerBrandThemeFixture/u.test(code(source))
    ).map(({ label }) => label);
    expect(importers).toEqual([]);
  });

  it("the tooling adapter declares itself non-productive, with a sunset", () => {
    // The adapter synthesizes a `ThemeResolution` for the one case
    // `resolveTheme` cannot express (a tenant floor with no merged patch), so
    // it has to say out loud that it is support and not a second door. Bound to
    // the exported object rather than to the comment's wording: a comment can
    // be edited without anything noticing.
    const ownership = JSON.parse(
      JSON.stringify(THEME_LOWERING_OWNERSHIP)
    ) as Record<string, unknown>;
    expect(ownership.disposition).toBe("non-productive-support");
    expect(ownership.productiveConsumers).toBe(0);
    expect(typeof ownership.sunset).toBe("string");
    expect(String(ownership.sunset).length).toBeGreaterThan(0);
    // and the count it declares is the count this file measured above
    const importers = SOURCES.filter(({ source }) =>
      /theme-lowering|lowerBrandThemeFixture/u.test(code(source))
    );
    expect(importers).toHaveLength(ownership.productiveConsumers as number);
  });
});

/* -------------------------------------------------------------------------- */
/* governance may not cite the deleted compiler as CURRENT evidence           */
/* -------------------------------------------------------------------------- */

/** Path fragments that name a compiler owner C2 deleted. */
const RETIRED_OWNER_PATHS = /kernel\/runtime\/brand-theme|compilers\/facade/u;

/**
 * The census fields whose values carry a FILE:LINE anchor into the tree as it
 * stood when the census ran. Rebinding one would mean inventing a line number
 * in a file that never had it, which fabricates evidence rather than
 * correcting it, so they are excluded BY NAME and counted rather than waived.
 */
const LINE_ANCHORED_CENSUS = /declaredAt|declarationSites?/u;

/** Every string value in the governance tree, with the keypath that holds it. */
function governanceStrings(): { file: string; path: string; value: string }[] {
  const root = join(PACKAGE_ROOT, "governance");
  const rows: { file: string; path: string; value: string }[] = [];
  const visit = (node: unknown, keyPath: string, file: string): void => {
    if (typeof node === "string") {
      rows.push({ file, path: keyPath, value: node });
      return;
    }
    if (Array.isArray(node)) {
      node.forEach((child, index) => visit(child, `${keyPath}[${index}]`, file));
      return;
    }
    if (node && typeof node === "object") {
      for (const key of Object.keys(node as Record<string, unknown>)) {
        visit(
          (node as Record<string, unknown>)[key],
          keyPath ? `${keyPath}.${key}` : key,
          file
        );
      }
    }
  };
  const walkDir = (dir: string): void => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) walkDir(full);
      else if (entry.endsWith(".json")) {
        visit(JSON.parse(readFileSync(full, "utf8")), "", relative(PACKAGE_ROOT, full));
      }
    }
  };
  walkDir(root);
  return rows;
}

describe("governance cites no deleted compiler as current evidence", () => {
  const hits = governanceStrings().filter((row) => RETIRED_OWNER_PATHS.test(row.value));
  const active = hits.filter((row) => !LINE_ANCHORED_CENSUS.test(row.path));

  it("has ZERO active citations of a deleted compiler owner", () => {
    // The manifest generator is false-green here: it regenerates the fields it
    // owns and never reads the prose, notes, derivations, provenance lists or
    // `emittedBy` rows around them. A citation of an owner that no longer
    // exists is evidence that cannot be checked, so it is scanned explicitly.
    expect(active.map((row) => `${row.file} @ ${row.path}`)).toEqual([]);
  });

  it("the line-anchored census residue only shrinks", () => {
    // 241 at C2 close, all of them `declaredAt` / `declarationSites` values
    // that pair a path with a line number measured against the deleted file.
    expect(hits.length - active.length).toBeLessThanOrEqual(241);
    for (const row of hits) expect(LINE_ANCHORED_CENSUS.test(row.path)).toBe(true);
  });

  it("MUTANT: a planted active citation is caught", () => {
    const planted = [
      { file: "governance/manifest/x/index.json", path: "roots[0].derivation", value: "see compilers/kernel/runtime/brand-theme/index.ts:12" },
      { file: "governance/manifest/x/index.json", path: "entries.--ds-a.declaredAt[0]", value: "compilers/kernel/runtime/brand-theme/index.ts:12" },
    ];
    const plantedActive = planted
      .filter((row) => RETIRED_OWNER_PATHS.test(row.value))
      .filter((row) => !LINE_ANCHORED_CENSUS.test(row.path));
    expect(plantedActive).toHaveLength(1);
    expect(plantedActive[0]?.path).toBe("roots[0].derivation");
  });
});

/* -------------------------------------------------------------------------- */
/* the gate's own mutants: each assertion must be shown to fail               */
/* -------------------------------------------------------------------------- */

describe("planted mutants make the single-door gate go red", () => {
  /** Re-runs one predicate against a source tree with one file substituted. */
  const withPlanted = (label: string, planted: string) =>
    SOURCES.map((row) => (row.label === label ? { ...row, source: planted } : row));

  const referencesDoor = (rows: typeof SOURCES, door: string) =>
    rows.filter(({ source }) => new RegExp(`\\b${door}\\b`, "u").test(code(source)));

  const victim = "src/infrastructure/compilers/runtime/tenant-css/artifact-renderer/index.ts";

  it("a reinstated compileBrandTheme import is caught", () => {
    const planted = `import { compileBrandTheme } from "somewhere";\ncompileBrandTheme({});\n`;
    expect(referencesDoor(withPlanted(victim, planted), "compileBrandTheme")).toHaveLength(1);
    // and the unmutated tree is clean, so the finding came from the mutant
    expect(referencesDoor(SOURCES, "compileBrandTheme")).toHaveLength(0);
  });

  it("a reinstated themeToBrandTheme call is caught", () => {
    const planted = `const brand = themeToBrandTheme(theme);\n`;
    expect(referencesDoor(withPlanted(victim, planted), "themeToBrandTheme")).toHaveLength(1);
    expect(referencesDoor(SOURCES, "themeToBrandTheme")).toHaveLength(0);
  });

  it("a reinstated deprecated alias is caught", () => {
    const planted = `export const compileBrandThemeDeprecated = compileTheme;\n`;
    expect(
      referencesDoor(withPlanted(victim, planted), "compileBrandThemeDeprecated")
    ).toHaveLength(1);
    expect(referencesDoor(SOURCES, "compileBrandThemeDeprecated")).toHaveLength(0);
  });

  it("a second compileTheme definition is caught", () => {
    const planted = `export function compileTheme(a, b) { return { a, b }; }\n`;
    const owners = withPlanted(victim, planted)
      .filter(({ path, source }) => declaredNames(source, path).has("compileTheme"))
      .map(({ label }) => label);
    expect(owners).toHaveLength(2);
  });

  it("a second compileTheme as an EXPORT CONST is caught (the shape the regex missed)", () => {
    // This is the retired compiler's own shape: `export const compileBrandTheme:
    // CompileBrandTheme = (...) => {}`. A keyword-and-name regex reads
    // `export const` and then looks for `function`, so it saw nothing.
    const planted = `export const compileTheme: CompileTheme = (a, b) => ({ a, b });\n`;
    const declaring = withPlanted(victim, planted)
      .filter(({ path, source }) => declaredNames(source, path).has("compileTheme"))
      .map(({ label }) => label);
    expect(declaring).toHaveLength(2);
    const exporting = withPlanted(victim, planted)
      .filter(({ path, source }) => ownExportedNames(source, path).has("compileTheme"))
      .map(({ label }) => label);
    expect(exporting).toHaveLength(2);
    // and the unmutated tree still has exactly one OWNED export
    expect(
      SOURCES.filter(({ path, source }) => ownExportedNames(source, path).has("compileTheme")),
    ).toHaveLength(1);
  });

  it("a retired door reintroduced as an export const is caught", () => {
    const planted = `export const compileBrandTheme = (input) => input;\n`;
    const found = withPlanted(victim, planted)
      .filter(({ path, source }) => declaredNames(source, path).has("compileBrandTheme"))
      .map(({ label }) => label);
    expect(found).toEqual([victim]);
    expect(
      SOURCES.filter(({ path, source }) => declaredNames(source, path).has("compileBrandTheme")),
    ).toHaveLength(0);
  });

  it("a new appearanceToVariables caller is caught", () => {
    const callers = withPlanted(victim, `appearanceToVariables(appearance);\n`)
      .filter(({ label, source }) =>
        label.startsWith("src/") &&
        !label.startsWith("src/infrastructure/compilers/kernel/runtime/appearance/") &&
        new RegExp(`\\b${APPEARANCE_DOOR}\\b`, "u").test(code(source))
      )
      .map(({ label }) => label);
    expect(callers.sort()).not.toEqual([...APPEARANCE_DOOR_KNOWN_CALLERS].sort());
  });

  it("a door named only inside a comment or a string is NOT a finding", () => {
    const planted =
      `// compileBrandTheme used to live here\n` +
      `const note = "compileBrandTheme";\n` +
      `const tpl = \`compileBrandTheme\`;\n`;
    expect(referencesDoor(withPlanted(victim, planted), "compileBrandTheme")).toHaveLength(0);
  });

  it("a productive import of the test harness is caught", () => {
    const planted = `import { lowerBrandThemeFixture } from "@tests/support/theme-lowering";\n`;
    const importers = withPlanted(victim, planted)
      .filter(({ source }) => /theme-lowering|lowerBrandThemeFixture/u.test(code(source)))
      .map(({ label }) => label);
    expect(importers).toEqual([victim]);
  });
});
