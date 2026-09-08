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
import {
  THEME_LOWERING_OWNERSHIP,
  wrapGovernedFamilies,
} from "../../../scripts/libraries/theme-lowering/index.mjs";
import { liftAuthoredTheme } from "@/infrastructure/compilers/runtime/theme/runtime/lowering/foundation/intake";

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
  // A required source root that is absent used to yield an empty list, and an
  // empty list satisfies every "no productive caller" assertion in this file.
  // Moving `packages/showroom/src` would therefore have retired half this gate
  // in silence, with 0 findings and a green run (audit F-23, the same fail-open
  // shape as the vacuous `if (!distCSS) return`). A missing input is a failure.
  if (!existsSync(root)) {
    throw new Error(
      `single-door gate: required source root is absent: ${root}. `
        + 'An absent root scans nothing, and scanning nothing cannot certify that the door is single.',
    );
  }
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

/**
 * A census that finds nothing satisfies every assertion below for the worst
 * possible reason, so the walk is required to have found BOTH trees. The floors
 * are deliberately low: they exist to catch a census that collapsed, not to pin
 * a file count that legitimate work moves.
 */
const CENSUS_FLOOR: ReadonlyArray<readonly [string, number]> = [
  ["src/", 100],
  ["showroom/src/", 10],
];

/** The single owner allowed to produce a `ThemeIntent`. */
const INGRESS_OWNER =
  "src/infrastructure/compilers/runtime/theme/runtime/ingress/";

/** The only productive sources allowed to select an engine adapter. */
const ADAPTER_SELECTION_OWNERS: readonly string[] = [
  "src/infrastructure/compilers/runtime/theme/facade/runtime/compile/index.ts",
  // The runtime token baseline: it reads the engine's own `tokenBaseline`,
  // which is a property of the adapter and not a compile's engine choice.
  "src/infrastructure/runtime/theming/composition/react/tokens/index.ts",
  // The `custom` fail-closed drill. It resolves an adapter to DEMONSTRATE the
  // refusal and then the registration, which is the registry's own public
  // contract being exercised, not a compile choosing an engine.
  "showroom/src/app/probe/custom-component-pack/page.tsx",
  // The mount door. It does not CHOOSE an adapter -- `resolveEngine` above it
  // already chose the engine -- it asserts that the chosen engine HAS one,
  // before a single child renders. The refusal used to happen only as a side
  // effect of the personality bridge calling `useTokens()` deep inside this
  // tree; WO-CAN-04 deleted that painter, which would have deleted the law
  // with it, so the door is named rather than inherited.
  "src/infrastructure/runtime/bootstrap/facade/react/provider/index.tsx",
];

/** The only productive sources allowed to name the v1 document migration. */
const MIGRATION_IMPORTERS: readonly string[] = [
  "src/infrastructure/compilers/runtime/theme/index.ts",
  "src/infrastructure/compilers/runtime/theme/runtime/ingress/index.ts",
  "src/infrastructure/compilers/runtime/theme/runtime/ingress/foundation/document-patch/index.ts",
];

/** A `ThemeIntentOrigin` written as a literal. */
const ORIGIN_LITERAL = /["'`](?:static-vertical|tenant-document|preview)["'`]/u;

/** The public server entrypoint, and the four names it may never publish. */
const SERVER_ENTRYPOINT = "src/entrypoints/server/index.ts";

/**
 * The complete bypass, spelled out. Each of these four was published from
 * `entrypoints/server` before WO-CAT-03, and together they ARE a second door:
 * `liftAuthoredTheme` builds a resolution, `THEME_ENGINE_ADAPTERS` supplies an
 * adapter, `compileTheme` lowers it, and `resolveTheme` skips the producers.
 * A consumer holding all four never meets tier, engine, envelope, contrast or
 * limits (F-24).
 */
const CLOSED_PUBLIC_NAMES = [
  "compileTheme",
  "resolveTheme",
  "liftAuthoredTheme",
  "THEME_ENGINE_ADAPTERS",
] as const;

/** The word-boundary sweep the acceptance gate runs, in code AND in prose. */
const closedNameHits = (source: string): readonly string[] =>
  CLOSED_PUBLIC_NAMES.filter((name) =>
    new RegExp(`${name}\\b`, "u").test(source)
  );

/** The single admission owner: the only place a policy station may live. */
const ADMISSION_OWNER =
  "src/infrastructure/compilers/runtime/theme/facade/foundation/admission/";

/** The one door that composes resolution, admission and lowering. */
const COMPILE_DOOR =
  "src/infrastructure/compilers/runtime/theme/facade/runtime/compile/index.ts";

/**
 * The admission stations, by the symbol each one owns.
 *
 * Every one of these was a private function inside `compileTenantTheme` before
 * WO-CAT-03, which is why the DB transport had a policy the preview and draft
 * transports did not. The census below asserts that each name is DECLARED in
 * exactly one productive source, and that the source is under the admission
 * owner -- a second declaration anywhere is a second policy.
 */
const ADMISSION_STATIONS = [
  "tierIssues",
  "admitEngine",
  "envelopeIssues",
  "contrastIssues",
  "chartCategoryIssues",
  "limitIssues",
  "isSafeVisualValue",
  "themeChannelDelta",
] as const;

/**
 * `ThemeAdmissionError.measured` — the graded compilation a refusal carries.
 *
 * It is the one field on the refusal that hands an author back the compile the
 * emission stations refused, and it exists for exactly one consumer: the
 * authoring studio, which must paint the draft it is telling the author it
 * cannot publish. A SECOND reader is a publisher reading around the admission:
 * `compileThemeIntent` still throws, so the only way to obtain compiled
 * channels from a refused intent is to catch the named error and read this
 * field. The field's own docblock promises this census; without it the promise
 * was prose.
 *
 * The census admits the definition site because a property sweep cannot help
 * seeing `this.measured = measured`, and naming it is more honest than writing
 * a regex that excludes its own owner.
 */
const MEASURED_FIELD_DEFINITION =
  "src/infrastructure/compilers/runtime/theme/facade/foundation/admission/foundation/issues/index.ts";

/** The sole authoring surface allowed to read the graded compilation. */
const MEASURED_FIELD_READERS: readonly string[] = [
  "src/components/patterns/customization/brand-studio/index.tsx",
];

/** A `.measured` property access, in code only — prose names it constantly. */
const MEASURED_ACCESS = /\.measured\b/u;

/** The retired engine fallback, in the shape every one of its four copies had. */
const ENGINE_FALLBACK = /\?\?\s*PRIMARY_ENGINE/u;

/** Every call of `name` in this source, from the TypeScript AST. */
function callsTo(source: string, file: string, name: string): ts.CallExpression[] {
  const parsed = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const calls: ts.CallExpression[] = [];
  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === name) {
      calls.push(node);
    }
    ts.forEachChild(node, visit);
  };
  visit(parsed);
  return calls;
}

/**
 * Object literals whose own keys are a ThemeIntent's.
 *
 * Keyed on the envelope rather than on a name, because the shape is what a
 * caller reintroduces: `{ origin, patch }` at a call site is the exact literal
 * the two transports each carried before the ingress owner existed.
 */
function intentLiterals(source: string, file: string): ts.ObjectLiteralExpression[] {
  const parsed = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const found: ts.ObjectLiteralExpression[] = [];
  const visit = (node: ts.Node): void => {
    if (ts.isObjectLiteralExpression(node)) {
      const keys = new Set(
        node.properties
          .map((property) =>
            property.name && (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name))
              ? property.name.text
              : undefined
          )
          .filter((key): key is string => key !== undefined)
      );
      if (keys.has("origin") && keys.has("patch")) found.push(node);
    }
    ts.forEachChild(node, visit);
  };
  visit(parsed);
  return found;
}

describe("the theme lowering has exactly one productive door", () => {
  it("the census actually reached both source trees", () => {
    for (const [prefix, floor] of CENSUS_FLOOR) {
      const found = SOURCES.filter(({ label }) => label.startsWith(prefix)).length;
      expect(
        found,
        `${prefix} contributed ${found} productive sources; a collapsed census makes every `
          + "assertion below pass for the wrong reason",
      ).toBeGreaterThanOrEqual(floor);
    }
  });

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

  it("NOTHING re-publishes compileTheme: it is reached at its owner or not at all", () => {
    const publishers = SOURCES.filter(({ path, source }) =>
      reExportedNames(source, path).has("compileTheme")
    ).map(({ label }) => label);
    // Two publishers survived until WO-CAT-03, and both were doors: the
    // `/server` entrypoint, and the `runtime/theme` barrel -- which
    // `infrastructure/compilers/index.ts` re-exports and the ROOT package
    // entrypoint re-exports in turn. Closing only `/server` would have been
    // cosmetic, because `compileTheme` + `resolveTheme` +
    // `THEME_ENGINE_ADAPTERS` were equally public from
    // `@rottay/design-system`, and those three ARE the second route: assemble a
    // resolution, pick an adapter, lower it, and every admission station is
    // skipped (F-24).
    //
    // So the lowering has no publisher at all now. Every productive caller
    // reaches `runtime/lowering` directly, which is one import instead of one
    // door, and a consumer outside the package cannot reach it through any
    // subpath the `exports` map resolves.
    expect(publishers).toEqual([]);
  });

  it("no public entrypoint publishes any of the four bypass names", () => {
    // The `/server` sweep above, widened to every entrypoint under
    // `src/entrypoints/` and to the root barrel. A name reachable from ONE
    // public entrypoint is public.
    const entrypoints = SOURCES.filter(
      ({ label }) =>
        label === "src/index.ts" || /^src\/entrypoints\/[^/]+\/index\.tsx?$/u.test(label)
    );
    expect(entrypoints.length).toBeGreaterThanOrEqual(2);
    const findings = entrypoints
      .filter(({ source }) => closedNameHits(code(source)).length > 0)
      .map(({ label, source }) => `${label}: ${closedNameHits(code(source)).join(", ")}`);
    expect(findings).toEqual([]);
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

  /* ---------------------------------------------------------------------- */
  /* C4 · the ingress above the lowering also has exactly one door           */
  /* ---------------------------------------------------------------------- */

  it("resolveTheme takes exactly ONE argument at every productive call site", () => {
    // The optional second argument was a fourth, unnamed origin: it returned
    // before `assertThemeIntent` ran, so the only unvalidated ingress was also
    // the only one nobody had declared.
    const findings: string[] = [];
    for (const { path, source, label } of SOURCES) {
      for (const call of callsTo(source, path, "resolveTheme")) {
        if (call.arguments.length !== 1) {
          findings.push(`${label}: resolveTheme called with ${call.arguments.length} arguments`);
        }
      }
    }
    expect(findings).toEqual([]);
  });

  it("no productive source outside the ingress owner assembles a ThemeIntent", () => {
    const findings = SOURCES.filter(
      ({ label, source, path }) =>
        !label.startsWith(INGRESS_OWNER) && intentLiterals(source, path).length > 0
    ).map(({ label }) => label);
    expect(findings).toEqual([]);
  });

  it("the ingress owner is the only productive source that names an origin", () => {
    const findings = SOURCES.filter(
      ({ label, source }) =>
        !label.startsWith(INGRESS_OWNER) &&
        ORIGIN_LITERAL.test(code(source))
    ).map(({ label }) => label);
    expect(findings).toEqual([]);
  });

  it("the intent-literal census is not vacuous: the ingress owner HAS literals", () => {
    // Every "no productive source assembles an intent" assertion below is
    // satisfied for free by a detector that finds nothing. The producers are
    // where the literals must be, so the census proves it can see them before
    // it certifies that nobody else has any.
    const producers = SOURCES.filter(
      ({ label, source, path }) =>
        label.startsWith(INGRESS_OWNER) && intentLiterals(source, path).length > 0
    ).map(({ label }) => label);
    expect(producers.length).toBeGreaterThanOrEqual(3);
    for (const label of producers) expect(label).toContain("/presentation/");
  });

  it("the public server entrypoint publishes none of the four bypass names", () => {
    // The acceptance grep of WO-CAT-03, as an executable assertion. It sweeps
    // PROSE as well as code on purpose: a docblock that still tells a reader to
    // call `compileTheme` from `/server` is an instruction to reach a door that
    // is not there.
    const entrypoint = SOURCES.find(({ label }) => label === SERVER_ENTRYPOINT);
    expect(entrypoint, `${SERVER_ENTRYPOINT} must be in the census`).toBeDefined();
    expect(closedNameHits(entrypoint!.source)).toEqual([]);
  });

  it("every admission station is declared exactly once, under the admission owner", () => {
    for (const station of ADMISSION_STATIONS) {
      const owners = SOURCES.filter(({ path, source }) =>
        declaredNames(source, path).has(station)
      ).map(({ label }) => label);
      expect(owners, `${station} owners`).toHaveLength(1);
      expect(owners[0], `${station} owner`).toContain(ADMISSION_OWNER);
    }
  });

  it("the door runs the admission, and is the only productive source that does", () => {
    const callers = SOURCES.filter(
      ({ source, path }) =>
        callsTo(source, path, "admitThemeIntent").length > 0 ||
        callsTo(source, path, "admitThemeCompilation").length > 0
    ).map(({ label }) => label);
    expect(callers).toEqual([COMPILE_DOOR]);
  });

  it("the DB terminal is no longer a second admission", () => {
    // WO-CAT-03's "do NOT": `compileTenantTheme` keeps the artifact -- delta,
    // digest, CSS, scopes -- and decides nothing. It may still NAME the
    // admission's rule to supply the one input the intent cannot carry (the v1
    // document's declared canvas), but it may not declare a station of its own.
    const terminal = SOURCES.find(({ label }) =>
      label.endsWith("compilers/composition/tenant-theme/index.ts")
    );
    expect(terminal, "the DB terminal must be in the census").toBeDefined();
    const declared = declaredNames(terminal!.source, terminal!.path);
    for (const station of ADMISSION_STATIONS) {
      expect(declared.has(station), `${station} redeclared by the terminal`).toBe(false);
    }
  });

  it("the graded compilation on a refusal has exactly one reader", () => {
    // F-27/D-4: `ThemeAdmissionError.measured` is the ONLY way compiled
    // channels leave a refused intent, so who touches it is the whole
    // containment. The expected set is the declared authoring seam plus the
    // class that assigns the field; anything else is a second consumer of a
    // compile the door refused to publish.
    const touching = SOURCES.filter(({ source }) =>
      MEASURED_ACCESS.test(code(source))
    ).map(({ label }) => label);
    expect(touching.sort()).toEqual(
      [MEASURED_FIELD_DEFINITION, ...MEASURED_FIELD_READERS].sort()
    );
  });

  it("the one reader reaches the field only through the named error", () => {
    // The containment is not the field name, it is the guard in front of it: a
    // caller that reads `.measured` off an unnarrowed `catch` binding is
    // reading it off anything that throws.
    for (const label of MEASURED_FIELD_READERS) {
      const reader = SOURCES.find((row) => row.label === label);
      expect(reader, `${label} must be in the census`).toBeDefined();
      expect(
        /instanceof\s+ThemeAdmissionError/u.test(code(reader!.source)),
        `${label} must narrow on ThemeAdmissionError before reading .measured`
      ).toBe(true);
    }
  });

  it("the roster engine fallback exists in exactly one owner, and it is not a fallback", () => {
    // `getFirstPartyVertical(x)?.engine ?? PRIMARY_ENGINE` was written at four
    // sites while the DB door threw for the same question. There is one law now
    // and it refuses.
    const findings = SOURCES.filter(({ source }) =>
      ENGINE_FALLBACK.test(code(source))
    ).map(({ label }) => label);
    expect(findings).toEqual([]);
  });

  it("adapter selection is not distributed across the tree", () => {
    // `resolveAdapter` is the registry's own reader. Every productive compile
    // reaches it through the one facade; a component, a pattern or a terminal
    // calling it directly is a second selection point.
    const callers = SOURCES.filter(
      ({ source, path }) => callsTo(source, path, "resolveAdapter").length > 0
    ).map(({ label }) => label);
    expect(callers.sort()).toEqual([...ADAPTER_SELECTION_OWNERS].sort());
  });

  it("the document migration has exactly one owner and bounded importers", () => {
    const importers = SOURCES.filter(({ source }) =>
      /\bmigrateV1\b/u.test(code(source))
    ).map(({ label }) => label);
    expect(importers.sort()).toEqual([...MIGRATION_IMPORTERS].sort());
  });

  it("the wrap-only lift is not reached from a component, a pattern or the showroom", () => {
    const importers = SOURCES.filter(({ source }) =>
      /\bliftAuthoredTheme\b/u.test(code(source))
    ).map(({ label }) => label);
    for (const label of importers) {
      expect(
        label.startsWith("src/infrastructure/compilers/") ||
          label.startsWith("src/entrypoints/"),
        label
      ).toBe(true);
    }
  });

  it("the tooling adapter's synthesized wrap IS the contract's own lift", () => {
    // WO-CAT-03 closed the public entry point, and `liftAuthoredTheme` had no
    // other consumer, so the bundler shakes it out of every non-entry chunk and
    // the dist-bound adapter has nothing left to bind. It synthesizes the wrap
    // instead -- inside the domain it already declares -- and re-publishing the
    // lift to feed it would re-open the exact route F-24 measured.
    //
    // Two spellings of one wrap is debt only if nothing proves they agree.
    // This does, over the shapes the readers actually hand in: an empty
    // fixture, a sparse one, and one that authors every governed family.
    const fixtures = [
      {},
      { id: "sparse", palette: { primaryColor: "#2F6B9A" } },
      {
        id: "total",
        motion: { intensity: 0.5 },
        charts: { lineStyle: "smooth" },
        recipes: { schemaVersion: 1, profile: "rottay/technical-sharp@1" },
        expressive: { schemaVersion: 1, experienceProfile: "management-editorial" },
        responsive: { schemaVersion: 1, posture: "comfortable" },
      },
    ] as const;
    for (const fixture of fixtures) {
      expect(
        wrapGovernedFamilies(fixture),
        `wrap diverged from liftAuthoredTheme for ${JSON.stringify(fixture)}`
      ).toEqual(liftAuthoredTheme(fixture as never));
    }
  });

  it("the tooling adapter declares itself non-productive, with a closed domain", () => {
    // The adapter synthesizes a `ThemeResolution` for the inputs the productive
    // door cannot NAME -- a mutated roster leaf and a tenant floor applied as
    // posture -- so it has to say out loud that it is support and not a second
    // door. Bound to the exported object rather than to the comment's wording:
    // a comment can be edited without anything noticing.
    //
    // It declares a DOMAIN, not a sunset. The sunset it used to declare ("the
    // readers take a ThemeResolution directly") was debt that could not be
    // paid: moving the synthesis into three readers is three constructors
    // instead of one. A stated permanent domain is the honest record.
    const ownership = JSON.parse(
      JSON.stringify(THEME_LOWERING_OWNERSHIP)
    ) as Record<string, unknown>;
    expect(ownership.disposition).toBe("non-productive-support");
    expect(ownership.productiveConsumers).toBe(0);
    expect(ownership.sunset).toBeUndefined();
    expect(typeof ownership.domain).toBe("string");
    expect(String(ownership.domain).length).toBeGreaterThan(40);
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

  /* ---------------------------------------------------------------------- */
  /* C4 · the ingress laws go red on the exact shapes they retired          */
  /* ---------------------------------------------------------------------- */

  it("a reinstated two-argument resolveTheme is caught", () => {
    const planted = `resolveTheme(baseline, { origin: "preview", patch });\n`;
    const found = withPlanted(victim, planted).flatMap(({ path, source, label }) =>
      callsTo(source, path, "resolveTheme")
        .filter((call) => call.arguments.length !== 1)
        .map(() => label)
    );
    expect(found).toEqual([victim]);
    // and the unmutated tree has none, so the finding came from the mutant
    expect(
      SOURCES.flatMap(({ path, source }) =>
        callsTo(source, path, "resolveTheme").filter((call) => call.arguments.length !== 1)
      )
    ).toHaveLength(0);
  });

  it("a hand-assembled ThemeIntent outside the ingress owner is caught", () => {
    const planted =
      `const intent = { vertical: "rottay", slug: "acme", origin: "preview", patch: {} };\n`;
    const found = withPlanted(victim, planted)
      .filter(
        ({ label, source, path }) =>
          !label.startsWith(INGRESS_OWNER) && intentLiterals(source, path).length > 0
      )
      .map(({ label }) => label);
    expect(found).toEqual([victim]);
  });

  it("the shorter two-key literal — the shape both transports actually had — is caught", () => {
    const planted = `compile(resolveTheme({ origin: "tenant-document", patch }));\n`;
    const found = withPlanted(victim, planted)
      .filter(
        ({ label, source, path }) =>
          !label.startsWith(INGRESS_OWNER) && intentLiterals(source, path).length > 0
      )
      .map(({ label }) => label);
    expect(found).toEqual([victim]);
  });

  it("a second reader of the graded compilation is caught", () => {
    // The exact shape a bypass takes: catch the refusal, keep the compile.
    const planted =
      `const compiled = (error as ThemeAdmissionError).measured?.compiled;\n`;
    const touching = withPlanted(victim, planted)
      .filter(({ source }) => MEASURED_ACCESS.test(code(source)))
      .map(({ label }) => label);
    expect(touching).toContain(victim);
    expect(touching.sort()).not.toEqual(
      [MEASURED_FIELD_DEFINITION, ...MEASURED_FIELD_READERS].sort()
    );
  });

  it("`measured` named only in a comment or a string is NOT a finding", () => {
    const planted =
      `// error.measured carries the graded compile\n` +
      `const note = "error.measured";\n`;
    const touching = withPlanted(victim, planted)
      .filter(({ source }) => MEASURED_ACCESS.test(code(source)))
      .map(({ label }) => label);
    expect(touching.sort()).toEqual(
      [MEASURED_FIELD_DEFINITION, ...MEASURED_FIELD_READERS].sort()
    );
  });

  it("a reinstated roster engine fallback is caught", () => {
    const planted =
      `const engine = getFirstPartyVertical(slug)?.engine ?? PRIMARY_ENGINE;\n`;
    const found = withPlanted(victim, planted)
      .filter(({ source }) => ENGINE_FALLBACK.test(code(source)))
      .map(({ label }) => label);
    expect(found).toEqual([victim]);
    expect(SOURCES.filter(({ source }) => ENGINE_FALLBACK.test(code(source)))).toHaveLength(0);
  });

  it("an extra adapter selection point is caught", () => {
    const planted = `const adapter = resolveAdapter("modern");\n`;
    const callers = withPlanted(victim, planted)
      .filter(({ source, path }) => callsTo(source, path, "resolveAdapter").length > 0)
      .map(({ label }) => label);
    expect(callers).toContain(victim);
    expect(callers.sort()).not.toEqual([...ADAPTER_SELECTION_OWNERS].sort());
  });

  it("a deep import of the document migration is caught", () => {
    const planted = `const envelope = migrateV1(document, "light");\n`;
    const importers = withPlanted(victim, planted)
      .filter(({ source }) => /\bmigrateV1\b/u.test(code(source)))
      .map(({ label }) => label);
    expect(importers).toContain(victim);
    expect(importers.sort()).not.toEqual([...MIGRATION_IMPORTERS].sort());
  });

  it('a planted `origin: "preview"` literal outside the ingress owner is caught', () => {
    // The acceptance mutant of WO-CAT-03, stated as its own case: the shortest
    // shape a second producer takes is one object literal at a call site.
    const planted =
      `const intent = { vertical: "bithire", slug: "acme", origin: "preview", patch: {} };\n` +
      `compileThemeIntent(intent);\n`;
    const found = withPlanted(victim, planted)
      .filter(
        ({ label, source, path }) =>
          !label.startsWith(INGRESS_OWNER) && intentLiterals(source, path).length > 0
      )
      .map(({ label }) => label);
    expect(found).toEqual([victim]);
    // and the unmutated tree has none, so the finding came from the mutant
    expect(
      SOURCES.filter(
        ({ label, source, path }) =>
          !label.startsWith(INGRESS_OWNER) && intentLiterals(source, path).length > 0
      )
    ).toHaveLength(0);
  });

  it("a reinstated public export of the lowering is caught", () => {
    const planted =
      `export { compileTheme } from '../../infrastructure/compilers/runtime/theme';\n`;
    const mutated = withPlanted(SERVER_ENTRYPOINT, planted).find(
      ({ label }) => label === SERVER_ENTRYPOINT
    );
    expect(closedNameHits(mutated!.source)).toEqual(["compileTheme"]);
  });

  it("a reinstated public export of the authoring lift is caught", () => {
    const planted = `export { liftAuthoredTheme } from '../../somewhere';\n`;
    const mutated = withPlanted(SERVER_ENTRYPOINT, planted).find(
      ({ label }) => label === SERVER_ENTRYPOINT
    );
    expect(closedNameHits(mutated!.source)).toEqual(["liftAuthoredTheme"]);
  });

  it("a second declaration of an admission station is caught", () => {
    const planted = `export function envelopeIssues(theme, paths) { return []; }\n`;
    const owners = withPlanted(victim, planted)
      .filter(({ path, source }) => declaredNames(source, path).has("envelopeIssues"))
      .map(({ label }) => label);
    expect(owners).toContain(victim);
    expect(owners).toHaveLength(2);
  });

  it("a second caller of the admission is caught", () => {
    const planted = `admitThemeIntent({ intent, resolution, adapter });\n`;
    const callers = withPlanted(victim, planted)
      .filter(({ source, path }) => callsTo(source, path, "admitThemeIntent").length > 0)
      .map(({ label }) => label);
    expect(callers.sort()).toEqual([COMPILE_DOOR, victim].sort());
  });

  it("an origin named only in a comment or a string is NOT a finding", () => {
    // The origin sweep reads code, not prose: `static-vertical` appears in
    // docblocks all over this tree and none of those is an ingress.
    const planted =
      `// the "preview" origin resolves like a tenant document\n` +
      `/* origin: "static-vertical" */\n`;
    const found = withPlanted(victim, planted)
      .filter(
        ({ label, source }) =>
          !label.startsWith(INGRESS_OWNER) && ORIGIN_LITERAL.test(code(source))
      )
      .map(({ label }) => label);
    expect(found).toEqual([]);
  });
});
