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

/** The sole resolution, and the only file allowed to define `resolveTheme`. */
const RESOLUTION_OWNER =
  "src/infrastructure/compilers/runtime/theme/runtime/resolution/index.ts";

/**
 * The one productive caller allowed to hand `resolveTheme` its options, and
 * the only two keys it may pass.
 *
 * The retired shape was `resolveTheme(baseline, intent?)`: it returned before
 * `assertThemeIntent` ran, so the one arm nobody declared was also the one arm
 * nothing validated. The admitted shape is
 * `resolveTheme(intent, { baseline, vertical })`: the intent is validated
 * first, always, and each theme by `assertThemeBaseline`.
 *
 * `baseline` is the EFFECTIVE baseline: the intent's own carried `.baseline`,
 * falling back to the derivation. `vertical` is the vertical's ORIGINAL
 * baseline and is the derivation, full stop (owner ruling R32 Q1, 2026-10-04).
 * The derivation is `baselineFor(<intent>.vertical, <intent>.slug)` over the
 * SAME intent the call resolves: the neutral foundation plus the preset of a
 * vertical from the closed first-party roster. So no caller can hand the
 * resolver a Theme of its own through either key, and `vertical` cannot become
 * a second way to author a look: it has no carried arm, no fallback and no
 * other producer. Keyed on the door and not on the ingress owner: the three
 * intent producers may not pass options. Both censuses assert EXACT equality,
 * so a door that stops passing an option turns the gate red and the exception
 * is deleted with it (the `APPEARANCE_DOOR_KNOWN_CALLERS` precedent).
 */
const RESOLVE_THEME_OPTIONS_CALLER = COMPILE_DOOR;
const RESOLVE_THEME_OPTION_KEYS: readonly string[] = ["baseline", "vertical"];
const RESOLVE_THEME_BASELINE_PRODUCER = "baselineFor";

/** The one option that is the derivation and nothing else. */
const RESOLVE_THEME_VERTICAL_OPTION = "vertical";

/** The intent members the derivation reads, in argument order. */
const RESOLVE_THEME_DERIVATION_ARGUMENTS: readonly string[] = ["vertical", "slug"];

/**
 * The member an intent uses to CARRY a baseline of its own.
 *
 * Re-anchored over D6-CORE-01 (`9d7294e33`, 2026-09-15), which made the door
 * `baseline: target.baseline ?? baselineFor(target.vertical, target.slug)`.
 * The census pinned the pre-D6 shape -- a bare `baselineFor(...)` call -- so
 * every arm that reads it went red on the landed tree rather than on a defect.
 *
 * The widening is exactly one form and no wider: a nullish coalescing whose
 * FALLBACK is still the derivation and whose carried arm is still the intent's
 * own `.baseline`. D6-CORE-01's reason is that an intent opened on a tenant's
 * already customized theme must resolve over THAT baseline; composing its patch
 * over the preset instead drops every leaf the draft carried but did not move.
 * A carried arm that is anything else, a fallback that is not `baselineFor`,
 * and `||` in place of `??` all stay findings -- the mutants below hold each.
 * The widening belongs to `baseline` alone: `vertical` has no carried arm.
 */
const RESOLVE_THEME_CARRIED_BASELINE = "baseline";

/** The identifiers a binding name declares, through any destructuring. */
function bindingNames(name: ts.BindingName): string[] {
  if (ts.isIdentifier(name)) return [name.text];
  return name.elements.flatMap((element) =>
    ts.isOmittedExpression(element) ? [] : bindingNames(element.name)
  );
}

/**
 * What a `const` in the enclosing function binds an identifier to.
 *
 * The door names its derivation once and passes it twice, so an option value
 * may be an identifier -- but only one this resolves: a plain `const` with an
 * initializer, declared in a block of the function that makes the call. The
 * walk stops at the NEAREST scope that declares the name, so a shadowing
 * binding is judged instead of the one it hides, and at the first function
 * boundary, so a module constant, an import or a closure capture is not a
 * binding. `let`, `var`, a parameter, a destructuring, a loop or catch
 * variable and a missing declaration are each a fault: every one is a value
 * the gate cannot read off the call's own function.
 */
function constBindingOf(
  reference: ts.Identifier
): { readonly initializer: ts.Expression } | { readonly fault: string } {
  const name = reference.text;
  for (let scope: ts.Node | undefined = reference.parent; scope; scope = scope.parent) {
    if (ts.isBlock(scope)) {
      for (const statement of scope.statements) {
        if (
          (ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) &&
          statement.name?.text === name
        ) {
          return { fault: "is bound to a declaration, not a const" };
        }
        if (!ts.isVariableStatement(statement)) continue;
        const list = statement.declarationList;
        for (const declaration of list.declarations) {
          if (!bindingNames(declaration.name).includes(name)) continue;
          if ((list.flags & ts.NodeFlags.BlockScoped) !== ts.NodeFlags.Const) {
            return { fault: "is rebindable: it is not bound by const" };
          }
          if (!ts.isIdentifier(declaration.name)) return { fault: "is bound by a destructuring" };
          if (!declaration.initializer) return { fault: "is bound without an initializer" };
          return { initializer: declaration.initializer };
        }
      }
      continue;
    }
    if (
      (ts.isForStatement(scope) || ts.isForOfStatement(scope) || ts.isForInStatement(scope)) &&
      scope.initializer &&
      ts.isVariableDeclarationList(scope.initializer) &&
      scope.initializer.declarations.some((declaration) =>
        bindingNames(declaration.name).includes(name)
      )
    ) {
      return { fault: "is a loop variable" };
    }
    if (
      ts.isCatchClause(scope) &&
      scope.variableDeclaration &&
      bindingNames(scope.variableDeclaration.name).includes(name)
    ) {
      return { fault: "is a catch variable" };
    }
    if (ts.isFunctionLike(scope)) {
      return scope.parameters.some((parameter) => bindingNames(parameter.name).includes(name))
        ? { fault: "is a parameter" }
        : { fault: "has no const binding in the function that makes the call" };
    }
  }
  return { fault: "has no const binding in the function that makes the call" };
}

/**
 * Why a value is NOT the derivation, or `undefined` when it is.
 *
 * The derivation is `baselineFor(<intent>.vertical, <intent>.slug)` and
 * nothing else: exactly two arguments, both read off the identifier the same
 * `resolveTheme` call resolves. Pinning the callee alone admitted
 * `baselineFor("rottay", target.slug)` and `baselineFor(options.vertical, ...)`
 * -- a hard-coded vertical and a caller-chosen one, each a derivation by name
 * and a foreign theme in fact. An identifier is read through its `const`
 * binding, one level deep.
 */
function baselineDerivationFault(node: ts.Expression, intent: string | undefined): string | undefined {
  let derived = node;
  if (ts.isIdentifier(node)) {
    const binding = constBindingOf(node);
    if ("fault" in binding) return `${node.text} ${binding.fault}`;
    derived = binding.initializer;
  }
  if (
    !ts.isCallExpression(derived) ||
    !ts.isIdentifier(derived.expression) ||
    derived.expression.text !== RESOLVE_THEME_BASELINE_PRODUCER
  ) {
    return `is not produced by ${RESOLVE_THEME_BASELINE_PRODUCER} (${ts.SyntaxKind[derived.kind]})`;
  }
  if (intent === undefined) {
    return "is derived for a call whose intent is not an identifier";
  }
  const readsIntent =
    derived.arguments.length === RESOLVE_THEME_DERIVATION_ARGUMENTS.length &&
    derived.arguments.every(
      (argument, index) =>
        ts.isPropertyAccessExpression(argument) &&
        ts.isIdentifier(argument.expression) &&
        argument.expression.text === intent &&
        argument.name.text === RESOLVE_THEME_DERIVATION_ARGUMENTS[index]
    );
  return readsIntent
    ? undefined
    : `is not ${RESOLVE_THEME_BASELINE_PRODUCER}(${RESOLVE_THEME_DERIVATION_ARGUMENTS.map(
        (member) => `${intent}.${member}`
      ).join(", ")})`;
}

/** The intent's own carried baseline: the only admitted left arm of the `??`. */
const isCarriedBaseline = (node: ts.Expression, intent: string | undefined): boolean =>
  ts.isPropertyAccessExpression(node) &&
  ts.isIdentifier(node.expression) &&
  node.expression.text === intent &&
  node.name.text === RESOLVE_THEME_CARRIED_BASELINE;

/**
 * Why one option's value is not admitted, or `undefined` when it is.
 *
 * `vertical` is the derivation. `baseline` is the derivation, or the intent's
 * carried baseline falling back to it. Nothing else, for either key.
 */
function resolveThemeOptionFault(
  key: string,
  value: ts.Expression,
  intent: string | undefined
): string | undefined {
  if (
    key !== RESOLVE_THEME_VERTICAL_OPTION &&
    ts.isBinaryExpression(value) &&
    value.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken &&
    isCarriedBaseline(value.left, intent)
  ) {
    return baselineDerivationFault(value.right, intent);
  }
  return baselineDerivationFault(value, intent);
}

/**
 * `ThemeResolution.verticalBaseline`: where the admitted `vertical` lands.
 *
 * One writer, the resolver; one reader, the lowering, and inside it one
 * function, the radius divisor. A second writer is a resolution assembled
 * without the door, carrying a yardstick nothing validated. A second reader is
 * the vertical's original theme becoming a source of paint, which is the free
 * customization door the ruling refuses.
 */
const VERTICAL_BASELINE_FIELD = "verticalBaseline";
const VERTICAL_BASELINE_READER = "verticalRadiusBaseline";

/** The name a property-like node declares, when it is statically known. */
const staticPropertyName = (name: ts.PropertyName | ts.BindingName | undefined): string | undefined =>
  name === undefined
    ? undefined
    : ts.isIdentifier(name) || ts.isStringLiteralLike(name)
      ? name.text
      : ts.isComputedPropertyName(name) && ts.isStringLiteralLike(name.expression)
        ? name.expression.text
        : undefined;

/** The named function a node sits in, or `<module>`. */
function enclosingFunctionName(node: ts.Node): string {
  for (let scope: ts.Node | undefined = node.parent; scope; scope = scope.parent) {
    if (ts.isFunctionDeclaration(scope) || ts.isMethodDeclaration(scope)) {
      return staticPropertyName(scope.name) ?? "<anonymous>";
    }
    if (
      (ts.isArrowFunction(scope) || ts.isFunctionExpression(scope)) &&
      ts.isVariableDeclaration(scope.parent) &&
      ts.isIdentifier(scope.parent.name)
    ) {
      return scope.parent.name.text;
    }
  }
  return "<module>";
}

/**
 * Every productive source that WRITES the field (an object-literal member) and
 * every one that READS it (a property or element access, or a destructuring),
 * the readers with the function that does the reading. An assignment through a
 * property access counts as a reader on purpose: both lists are held to exact
 * equality, so it is a finding either way.
 */
function verticalBaselineCensus(rows: typeof SOURCES): { writers: string[]; readers: string[] } {
  const writers = new Set<string>();
  const readers = new Set<string>();
  for (const { path, source, label } of rows) {
    if (!source.includes(VERTICAL_BASELINE_FIELD)) continue;
    const parsed = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true);
    const visit = (node: ts.Node): void => {
      if (
        ts.isObjectLiteralElementLike(node) &&
        ts.isObjectLiteralExpression(node.parent) &&
        staticPropertyName(node.name) === VERTICAL_BASELINE_FIELD
      ) {
        writers.add(label);
      }
      const read =
        (ts.isPropertyAccessExpression(node) && node.name.text === VERTICAL_BASELINE_FIELD) ||
        (ts.isElementAccessExpression(node) &&
          ts.isStringLiteralLike(node.argumentExpression) &&
          node.argumentExpression.text === VERTICAL_BASELINE_FIELD) ||
        (ts.isBindingElement(node) &&
          staticPropertyName(node.propertyName ?? node.name) === VERTICAL_BASELINE_FIELD);
      if (read) readers.add(`${label}#${enclosingFunctionName(node)}`);
      ts.forEachChild(node, visit);
    };
    visit(parsed);
  }
  return { writers: [...writers].sort(), readers: [...readers].sort() };
}

/**
 * The options the door itself takes from ITS callers. `engine` and nothing
 * else: a door that accepted a baseline or a vertical theme would hand every
 * caller the option the resolver's arity law reserves for the door.
 */
const COMPILE_DOOR_OPTIONS = "CompileThemeIntentOptions";
const COMPILE_DOOR_OPTION_KEYS: readonly string[] = ["engine"];

/**
 * The admission stations, by the symbol each one owns.
 *
 * Every one of these was a private function inside `compileTenantTheme` before
 * WO-CAT-03, which is why the DB transport had a policy the preview and draft
 * transports did not. The census below asserts that each name is DECLARED in
 * exactly one productive source, and that the source is the owner named here --
 * a second declaration anywhere is a second policy.
 *
 * Each station carries its owner rather than inheriting one, because S19-A01
 * (`d47c874aa`, 2026-09-19) moved `isSafeVisualValue` OUT of the admission and
 * down to `kernel/foundation/schemas/tenant-theme`: preview, intent and
 * publication each needed the value grammar, and an admission-owned copy is
 * what a second grammar is born from. Its structural repair (`d5a3e1a74`) kept
 * it there. The station is still pinned to exactly one owner and still
 * exactly-once -- what moved is WHICH owner, not how strong the assertion is.
 */
const ADMISSION_STATIONS: readonly {
  readonly station: string;
  readonly owner?: string;
}[] = [
  { station: "tierIssues" },
  { station: "admitEngine" },
  { station: "envelopeIssues" },
  { station: "contrastIssues" },
  { station: "chartCategoryIssues" },
  { station: "limitIssues" },
  {
    station: "isSafeVisualValue",
    owner: "src/infrastructure/compilers/kernel/foundation/schemas/tenant-theme/index.ts",
  },
  { station: "themeChannelDelta" },
];

/** Every station name, for the sweeps that only care that it is a station. */
const ADMISSION_STATION_NAMES: readonly string[] = ADMISSION_STATIONS.map(
  ({ station }) => station
);

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
  "src/infrastructure/compilers/runtime/theme/facade/foundation/admission/contracts/issues/index.ts";

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
 * Local names that bind `resolveTheme` in a source: the bare identifier plus
 * every import specifier whose original name is `resolveTheme`. A property
 * access (`resolution.resolveTheme(...)`) evades this census;
 * `resolveThemeBindingCensus` closes it by counting who binds the name at all.
 */
function resolveThemeLocalNames(parsed: ts.SourceFile): Set<string> {
  const names = new Set<string>(["resolveTheme"]);
  for (const statement of parsed.statements) {
    if (!ts.isImportDeclaration(statement)) continue;
    const bindings = statement.importClause?.namedBindings;
    if (!bindings || !ts.isNamedImports(bindings)) continue;
    for (const element of bindings.elements) {
      if ((element.propertyName ?? element.name).text === "resolveTheme") {
        names.add(element.name.text);
      }
    }
  }
  return names;
}

/** Every call of `resolveTheme` in this source, under its own name or an import alias. */
function resolveThemeCalls(source: string, file: string): ts.CallExpression[] {
  // An alias still imports the name, so a source that never spells it has no call.
  if (!source.includes("resolveTheme")) return [];
  const parsed = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const names = resolveThemeLocalNames(parsed);
  const calls: ts.CallExpression[] = [];
  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && names.has(node.expression.text)) {
      calls.push(node);
    }
    ts.forEachChild(node, visit);
  };
  visit(parsed);
  return calls;
}

/**
 * Findings for the options one `resolveTheme` call passes.
 *
 * The argument is unwrapped through every branch of a conditional; each branch
 * must be an object literal whose keys are within the allowlist, each value
 * admitted for ITS key. A shorthand is read as the identifier it names. A
 * spread, a method, a computed key and a key outside the allowlist are a value
 * the door did not derive, which is a fourth origin. The keys of every literal
 * reached are collected for the exact-equality half.
 */
function resolveThemeOptionFindings(
  node: ts.Expression,
  label: string,
  intent: string | undefined,
  keySets: string[][]
): string[] {
  if (ts.isParenthesizedExpression(node)) {
    return resolveThemeOptionFindings(node.expression, label, intent, keySets);
  }
  if (ts.isConditionalExpression(node)) {
    return [
      ...resolveThemeOptionFindings(node.whenTrue, label, intent, keySets),
      ...resolveThemeOptionFindings(node.whenFalse, label, intent, keySets),
    ];
  }
  if (!ts.isObjectLiteralExpression(node)) {
    return [`${label}: resolveTheme options are not an object literal (${ts.SyntaxKind[node.kind]})`];
  }
  const findings: string[] = [];
  const keys: string[] = [];
  for (const property of node.properties) {
    if (!ts.isPropertyAssignment(property) && !ts.isShorthandPropertyAssignment(property)) {
      findings.push(`${label}: resolveTheme options carry a ${ts.SyntaxKind[property.kind]}`);
      continue;
    }
    const key =
      ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)
        ? property.name.text
        : undefined;
    if (key === undefined || !RESOLVE_THEME_OPTION_KEYS.includes(key)) {
      findings.push(
        `${label}: resolveTheme option ${key ?? ts.SyntaxKind[property.name.kind]} is outside ${RESOLVE_THEME_OPTION_KEYS.join(", ")}`
      );
      continue;
    }
    keys.push(key);
    const value = ts.isPropertyAssignment(property) ? property.initializer : property.name;
    const fault = resolveThemeOptionFault(key, value, intent);
    if (fault !== undefined) findings.push(`${label}: resolveTheme ${key} ${fault}`);
  }
  keySets.push(keys.sort());
  return findings;
}

/**
 * The arity law over a source tree: one argument anywhere, two only at the
 * declared caller and only in the admitted shape, more than two nowhere. The
 * callers that passed options, and the keys each options literal carried, are
 * returned for the exact-equality half.
 */
function resolveThemeArityCensus(
  rows: typeof SOURCES
): { findings: string[]; optionCallers: string[]; optionKeys: string[][] } {
  const findings: string[] = [];
  const optionCallers = new Set<string>();
  const optionKeys: string[][] = [];
  for (const { path, source, label } of rows) {
    for (const call of resolveThemeCalls(source, path)) {
      const arity = call.arguments.length;
      if (arity === 1) continue;
      if (arity !== 2) {
        findings.push(`${label}: resolveTheme called with ${arity} arguments`);
        continue;
      }
      if (label !== RESOLVE_THEME_OPTIONS_CALLER) {
        findings.push(`${label}: resolveTheme called with options outside the declared caller`);
        continue;
      }
      optionCallers.add(label);
      const [intent, options] = call.arguments;
      findings.push(
        ...resolveThemeOptionFindings(
          options!,
          label,
          intent && ts.isIdentifier(intent) ? intent.text : undefined,
          optionKeys
        )
      );
    }
  }
  return { findings, optionCallers: [...optionCallers].sort(), optionKeys };
}

/** The members an options interface declares, from its owner's AST. */
function interfaceMembers(source: string, file: string, name: string): string[] {
  const parsed = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  for (const statement of parsed.statements) {
    if (ts.isInterfaceDeclaration(statement) && statement.name.text === name) {
      return statement.members.map((member) =>
        member.name && (ts.isIdentifier(member.name) || ts.isStringLiteral(member.name))
          ? member.name.text
          : ts.SyntaxKind[member.kind]
      );
    }
  }
  return [];
}

/**
 * Findings for how the resolver treats a supplied `vertical`, on its own AST.
 *
 * `options.vertical` may be compared or handed to a call, never recorded on
 * the resolution as it arrives; and one of those calls must be
 * `assertThemeBaseline` under the option's own label. The options are never
 * read whole, so no member reaches the resolution without being named here.
 */
const RESOLVE_THEME_VERTICAL_LABEL = "resolveTheme: options.vertical";

function resolverVerticalFindings(source: string, file: string): string[] {
  const parsed = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const resolver = parsed.statements.find(
    (statement): statement is ts.FunctionDeclaration =>
      ts.isFunctionDeclaration(statement) && statement.name?.text === "resolveTheme"
  );
  if (!resolver?.body) return ["resolveTheme is not a function declaration with a body"];
  const options = resolver.parameters[1]?.name;
  if (!options || !ts.isIdentifier(options)) {
    return ["resolveTheme does not name its options parameter"];
  }
  const findings: string[] = [];
  let validated = false;
  const visit = (node: ts.Node): void => {
    if (ts.isIdentifier(node) && node.text === options.text) {
      const access = node.parent;
      if (!ts.isPropertyAccessExpression(access) || access.expression !== node) {
        findings.push(`options are read whole (${ts.SyntaxKind[access.kind]})`);
      } else if (access.name.text === RESOLVE_THEME_VERTICAL_OPTION) {
        const use = access.parent;
        if (ts.isCallExpression(use) && use.arguments.includes(access)) {
          const [, label] = use.arguments;
          if (
            ts.isIdentifier(use.expression) &&
            use.expression.text === "assertThemeBaseline" &&
            use.arguments[0] === access &&
            label !== undefined &&
            ts.isStringLiteralLike(label) &&
            label.text === RESOLVE_THEME_VERTICAL_LABEL
          ) {
            validated = true;
          }
        } else if (
          !ts.isBinaryExpression(use) ||
          (use.operatorToken.kind !== ts.SyntaxKind.ExclamationEqualsEqualsToken &&
            use.operatorToken.kind !== ts.SyntaxKind.EqualsEqualsEqualsToken)
        ) {
          findings.push(`options.vertical is used unvalidated (${ts.SyntaxKind[use.kind]})`);
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(resolver.body);
  if (!validated) {
    findings.push(`options.vertical never reaches assertThemeBaseline as "${RESOLVE_THEME_VERTICAL_LABEL}"`);
  }
  return findings;
}

/** The members `ResolveThemeOptions` declares, from the resolution owner's AST. */
const resolveThemeOptionMembers = (source: string, file: string): string[] =>
  interfaceMembers(source, file, "ResolveThemeOptions");

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

/** An identifier used as a VALUE: not a member name, not the name a declaration introduces, not a type. */
function isValueReference(node: ts.Identifier): boolean {
  const parent = node.parent;
  if (ts.isPropertyAccessExpression(parent) && parent.name === node) return false;
  if (ts.isPropertyAssignment(parent) && parent.name === node) return false;
  if (
    (ts.isVariableDeclaration(parent) ||
      ts.isParameter(parent) ||
      ts.isFunctionDeclaration(parent) ||
      ts.isImportSpecifier(parent) ||
      ts.isExportSpecifier(parent) ||
      ts.isPropertySignature(parent) ||
      ts.isMethodDeclaration(parent)) &&
    parent.name === node
  ) {
    return false;
  }
  if (ts.isImportSpecifier(parent) || ts.isExportSpecifier(parent)) return false;
  if (ts.isBindingElement(parent)) return false;
  if (ts.isTypeReferenceNode(parent) || ts.isQualifiedName(parent) || ts.isTypeQueryNode(parent)) return false;
  return true;
}

const ASSIGNMENT_OPERATORS: ReadonlySet<ts.SyntaxKind> = new Set(
  Array.from(
    { length: ts.SyntaxKind.LastAssignment - ts.SyntaxKind.FirstAssignment + 1 },
    (_, index) => ts.SyntaxKind.FirstAssignment + index
  )
);

/**
 * Is this access chain written to: an assignment target, `++`/`--`, `delete`,
 * a slot of a destructuring pattern that is itself assigned, or a loop head?
 */
function isWritten(access: ts.Expression): boolean {
  let top: ts.Node = access;
  while (
    (ts.isPropertyAccessExpression(top.parent) || ts.isElementAccessExpression(top.parent)) &&
    top.parent.expression === top
  ) {
    top = top.parent;
  }
  // `[x.a] = ...`, `({ k: x.a } = ...)`, `[...x.a] = ...`: the pattern is the target.
  while (
    ts.isArrayLiteralExpression(top.parent) ||
    ts.isObjectLiteralExpression(top.parent) ||
    ts.isSpreadElement(top.parent) ||
    ts.isSpreadAssignment(top.parent) ||
    ts.isParenthesizedExpression(top.parent) ||
    (ts.isPropertyAssignment(top.parent) && top.parent.initializer === top)
  ) {
    top = top.parent;
  }
  const use = top.parent;
  return (
    ((ts.isForOfStatement(use) || ts.isForInStatement(use)) && use.initializer === top) ||
    (ts.isBinaryExpression(use) && use.left === top && ASSIGNMENT_OPERATORS.has(use.operatorToken.kind)) ||
    ((ts.isPrefixUnaryExpression(use) || ts.isPostfixUnaryExpression(use)) &&
      (use.operator === ts.SyntaxKind.PlusPlusToken || use.operator === ts.SyntaxKind.MinusMinusToken)) ||
    ts.isDeleteExpression(use)
  );
}

/**
 * The derivation is only a derivation if nothing touches it.
 *
 * `baselineDerivationFault` reads the `const` the option names and stops. It
 * does not see `Object.assign(vertical, options.theme)` on the line between the
 * binding and the call, `target = other` in the same place, or a local
 * `const baselineFor = ...` shadowing the import: each leaves the pinned text
 * intact and hands the resolver a theme the door did not derive. So, in the
 * function that makes the call:
 *   - every value the options literal names (other than the intent) is
 *     referenced ONLY inside that literal;
 *   - the intent is referenced only as the call's first argument or as the
 *     object of a member READ;
 *   - `baselineFor` is bound in the file exactly once, by an un-aliased import
 *     specifier from the ingress owner, the specifier resolved against the
 *     importing file.
 */
const RESOLVE_THEME_PRODUCER_DIRECTORY = resolve(PACKAGE_ROOT, INGRESS_OWNER);

/** Does this module specifier, written in this file, name this owner directory? */
function namesModule(specifier: string, importer: string, directory: string): boolean {
  const target = specifier.startsWith(".")
    ? resolve(importer, "..", specifier)
    : specifier.startsWith("@/")
      ? join(SRC_ROOT, specifier.slice(2))
      : undefined;
  return (
    target !== undefined &&
    target.replace(/\.[cm]?[jt]sx?$/u, "").replace(/[\\/]index$/u, "") === directory
  );
}

/** A declaration that introduces a name `isValueReference` reads as a use. */
const declaresName = (node: ts.Identifier): boolean => {
  const parent = node.parent;
  return (
    (ts.isClassDeclaration(parent) ||
      ts.isClassExpression(parent) ||
      ts.isFunctionExpression(parent) ||
      ts.isEnumDeclaration(parent) ||
      ts.isModuleDeclaration(parent) ||
      ts.isNamespaceImport(parent) ||
      ts.isImportClause(parent) ||
      ts.isImportEqualsDeclaration(parent)) &&
    parent.name === node
  );
};

function derivationHygieneFindings(source: string, file: string, label: string): string[] {
  const parsed = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const findings: string[] = [];
  const producerBindings: string[] = [];
  const bind = (node: ts.Node): void => {
    if (ts.isIdentifier(node) && node.text === RESOLVE_THEME_BASELINE_PRODUCER) {
      const parent = node.parent;
      if (ts.isImportSpecifier(parent)) {
        const from = parent.parent.parent.parent.moduleSpecifier;
        producerBindings.push(
          parent.propertyName === undefined &&
            ts.isStringLiteral(from) &&
            namesModule(from.text, file, RESOLVE_THEME_PRODUCER_DIRECTORY)
            ? "import"
            : "foreign import"
        );
      } else if (
        declaresName(node) ||
        (!isValueReference(node) && !(ts.isPropertyAccessExpression(parent) || ts.isPropertyAssignment(parent)))
      ) {
        producerBindings.push(ts.SyntaxKind[parent.kind]);
      }
    }
    ts.forEachChild(node, bind);
  };
  bind(parsed);
  if (producerBindings.join() !== "import") {
    findings.push(
      `${label}: ${RESOLVE_THEME_BASELINE_PRODUCER} is bound by [${producerBindings.join(", ")}], not by one import from the ingress owner`
    );
  }
  const names = resolveThemeLocalNames(parsed);
  const visit = (node: ts.Node): void => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      names.has(node.expression.text) &&
      node.arguments.length === 2
    ) {
      const [intent, options] = node.arguments;
      let scope: ts.Node | undefined = node.parent;
      while (scope && !ts.isFunctionLike(scope)) scope = scope.parent;
      if (!scope || !intent || !options || !ts.isIdentifier(intent)) {
        findings.push(`${label}: resolveTheme options are passed outside a function, or for an intent that is not an identifier`);
      } else {
        const derived = new Set<string>();
        const collect = (inner: ts.Node): void => {
          if (
            ts.isIdentifier(inner) &&
            isValueReference(inner) &&
            inner.text !== intent.text &&
            inner.text !== RESOLVE_THEME_BASELINE_PRODUCER
          ) {
            derived.add(inner.text);
          }
          ts.forEachChild(inner, collect);
        };
        collect(options);
        const within = (inner: ts.Node): boolean => {
          for (let up: ts.Node | undefined = inner; up && up !== scope; up = up.parent) {
            if (up === options) return true;
          }
          return false;
        };
        const check = (inner: ts.Node): void => {
          if (ts.isIdentifier(inner) && isValueReference(inner)) {
            if (derived.has(inner.text) && !within(inner)) {
              findings.push(`${label}: ${inner.text} is touched between its derivation and the call, or after it (${ts.SyntaxKind[inner.parent.kind]})`);
            }
            if (inner.text === intent.text && inner !== intent) {
              const access = inner.parent;
              if (!ts.isPropertyAccessExpression(access) || access.expression !== inner || isWritten(access)) {
                findings.push(`${label}: the intent ${inner.text} is used as anything but a member read (${ts.SyntaxKind[access.kind]})`);
              }
            }
          }
          ts.forEachChild(inner, check);
        };
        check(scope);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(parsed);
  return findings;
}

/**
 * Who can reach `resolveTheme` at all.
 *
 * The arity census reads calls spelled `name(...)`. A second caller that binds
 * the function any other way never reaches it: a namespace import, a re-export
 * under another name, `const resolve = resolveTheme`, `resolveTheme.call(...)`,
 * `resolveTheme(...args)`. Each passes options from outside the door with zero
 * findings. So the BINDING is censused, not only the call: one productive
 * source may bind the name, and there every reference is the callee of a call
 * that spreads nothing and the name is never exported again.
 */
const RESOLUTION_OWNER_DIRECTORY = resolve(PACKAGE_ROOT, RESOLUTION_OWNER, "..");

/** Does this module specifier, written in this file, name the resolution owner? */
const isResolutionModule = (specifier: string, importer: string): boolean =>
  namesModule(specifier, importer, RESOLUTION_OWNER_DIRECTORY);

function resolveThemeBindingCensus(rows: typeof SOURCES): { binders: string[]; findings: string[] } {
  const binders = new Set<string>();
  const findings: string[] = [];
  for (const { path, source, label } of rows) {
    if (label === RESOLUTION_OWNER) continue;
    if (!source.includes("resolveTheme") && !source.includes("resolution")) continue;
    const parsed = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true);
    const visit = (node: ts.Node): void => {
      if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
        const from = node.moduleSpecifier;
        const ofResolution = from !== undefined && ts.isStringLiteral(from) && isResolutionModule(from.text, path);
        const named = ts.isImportDeclaration(node) ? node.importClause?.namedBindings : node.exportClause;
        const typeOnly = ts.isImportDeclaration(node) ? node.importClause?.isTypeOnly === true : node.isTypeOnly;
        if (named && (ts.isNamedImports(named) || ts.isNamedExports(named))) {
          if (named.elements.some((element) => (element.propertyName ?? element.name).text === "resolveTheme")) {
            binders.add(label);
          }
          // The admitted binder publishing the name is a second caller's route in:
          // the binder census cannot see who imports an alias from the door.
          if (
            label === RESOLVE_THEME_OPTIONS_CALLER &&
            ts.isNamedExports(named) &&
            named.elements.some((element) =>
              resolveThemeLocalNames(parsed).has((element.propertyName ?? element.name).text)
            )
          ) {
            findings.push(`${label}: re-exports resolveTheme (${ts.SyntaxKind[node.kind]})`);
          }
        } else if (ofResolution && !typeOnly) {
          // `import * as`, `export *`, `export * as`, a default or side-effect import
          binders.add(label);
          findings.push(`${label}: binds the resolution module whole (${ts.SyntaxKind[node.kind]})`);
        }
      }
      if (
        ts.isCallExpression(node) &&
        (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
          (ts.isIdentifier(node.expression) && node.expression.text === "require")) &&
        node.arguments[0] !== undefined &&
        ts.isStringLiteralLike(node.arguments[0]) &&
        isResolutionModule(node.arguments[0].text, path)
      ) {
        binders.add(label);
        findings.push(`${label}: loads the resolution module dynamically`);
      }
      ts.forEachChild(node, visit);
    };
    visit(parsed);
    const names = resolveThemeLocalNames(parsed);
    const references = (node: ts.Node): void => {
      if (ts.isIdentifier(node) && names.has(node.text) && isValueReference(node)) {
        const use = node.parent;
        if (!ts.isCallExpression(use) || use.expression !== node) {
          findings.push(`${label}: resolveTheme is referenced without being called (${ts.SyntaxKind[use.kind]})`);
        } else if (use.arguments.some((argument) => ts.isSpreadElement(argument))) {
          findings.push(`${label}: resolveTheme is called with spread arguments`);
        }
      }
      ts.forEachChild(node, references);
    };
    if (source.includes("resolveTheme")) references(parsed);
  }
  return { binders: [...binders].sort(), findings };
}

/**
 * An option surface is every declaration of the name, and nothing inherited.
 *
 * `interfaceMembers` returns the FIRST declaration's own members. A second
 * `interface ResolveThemeOptions { ... }` merges into it, and `extends` adds
 * members without writing one: both widen the surface under an unchanged pin.
 */
function optionSurface(source: string, file: string, name: string): { members: string[]; heritage: string[]; declarations: number } {
  const parsed = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const members: string[] = [];
  const heritage: string[] = [];
  let declarations = 0;
  const visit = (node: ts.Node): void => {
    if ((ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) && node.name.text === name) {
      declarations += 1;
      if (ts.isInterfaceDeclaration(node)) {
        for (const clause of node.heritageClauses ?? []) heritage.push(clause.getText(parsed));
        for (const member of node.members) {
          members.push(
            member.name && (ts.isIdentifier(member.name) || ts.isStringLiteral(member.name))
              ? member.name.text
              : ts.SyntaxKind[member.kind]
          );
        }
      } else {
        heritage.push("type alias");
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(parsed);
  return { members, heritage, declarations };
}

/**
 * The type each parameter of a named function is annotated with, as written,
 * across EVERY declaration of the name: an overload is a signature too.
 */
function parameterTypes(source: string, file: string, name: string): string[] {
  const parsed = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  return parsed.statements
    .filter(
      (statement): statement is ts.FunctionDeclaration =>
        ts.isFunctionDeclaration(statement) && statement.name?.text === name
    )
    .flatMap((declaration) =>
      declaration.parameters.map((parameter) => parameter.type?.getText(parsed) ?? "<untyped>")
    );
}

/** One row of the census, by its label. */
const censusRow = (label: string) => SOURCES.find((row) => row.label === label)!;

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
    expect(owners).toEqual([RESOLUTION_OWNER]);
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
      /theme-lowering|lowerFlatThemeFixture/u.test(code(source))
    ).map(({ label }) => label);
    expect(importers).toEqual([]);
  });

  /* ---------------------------------------------------------------------- */
  /* C4 · the ingress above the lowering also has exactly one door           */
  /* ---------------------------------------------------------------------- */

  it("resolveTheme takes one argument everywhere, and options only at the declared caller, in the admitted shape of `baseline` and `vertical`", () => {
    // The retired shape, `resolveTheme(baseline, intent?)`, returned before
    // `assertThemeIntent` ran: the only unvalidated ingress was also the only
    // one nobody had declared. The admitted shape validates the intent first,
    // always, and each theme through `assertThemeBaseline`; the door derives
    // both from the neutral foundation and the preset via `baselineFor`, so no
    // caller hands the resolver a Theme by hand. The exact-equality halves
    // keep the exception honest: a door that stops passing an option deletes it.
    const { findings, optionCallers, optionKeys } = resolveThemeArityCensus(SOURCES);
    expect(findings).toEqual([]);
    expect(optionCallers).toEqual([RESOLVE_THEME_OPTIONS_CALLER]);
    expect(optionKeys).toEqual([[...RESOLVE_THEME_OPTION_KEYS]]);
  });

  it("the resolver declares exactly `baseline` and `vertical` as its option surface", () => {
    // A fourth origin would be born as a new key (`intent`, `skipAdmission`);
    // the call-site check catches its use, this pin catches its declaration.
    const owner = SOURCES.find(({ label }) => label === RESOLUTION_OWNER);
    expect(owner, `${RESOLUTION_OWNER} must be in the census`).toBeDefined();
    expect(resolveThemeOptionMembers(owner!.source, owner!.path)).toEqual([
      ...RESOLVE_THEME_OPTION_KEYS,
    ]);
  });

  it("the resolver validates a supplied `vertical` by name before it records it", () => {
    // The option's law is "validated like `baseline`": the supplied value goes
    // through `assertThemeBaseline` under the option's own label, and the
    // resolution never records `options.vertical` itself.
    const owner = SOURCES.find(({ label }) => label === RESOLUTION_OWNER);
    expect(resolverVerticalFindings(owner!.source, owner!.path)).toEqual([]);
  });

  it("`verticalBaseline` has one writer, the resolver, and one reader, the radius divisor", () => {
    expect(verticalBaselineCensus(SOURCES)).toEqual({
      writers: [RESOLUTION_OWNER],
      readers: [`${LOWERING_OWNER}#${VERTICAL_BASELINE_READER}`],
    });
  });

  it("the door takes exactly `engine` from its own callers", () => {
    const door = SOURCES.find(({ label }) => label === COMPILE_DOOR);
    expect(door, `${COMPILE_DOOR} must be in the census`).toBeDefined();
    expect(interfaceMembers(door!.source, door!.path, COMPILE_DOOR_OPTIONS)).toEqual([
      ...COMPILE_DOOR_OPTION_KEYS,
    ]);
  });

  it("nothing touches the derivation, the intent or the producer between the binding and the call", () => {
    expect(derivationHygieneFindings(censusRow(COMPILE_DOOR).source, censusRow(COMPILE_DOOR).path, COMPILE_DOOR)).toEqual([]);
  });

  it("the door is the only productive source that binds resolveTheme, and it only calls it", () => {
    expect(resolveThemeBindingCensus(SOURCES)).toEqual({ binders: [COMPILE_DOOR], findings: [] });
  });

  it("each option surface is one interface, inheriting nothing, and each function takes exactly it", () => {
    expect(optionSurface(censusRow(RESOLUTION_OWNER).source, censusRow(RESOLUTION_OWNER).path, "ResolveThemeOptions")).toEqual({
      members: [...RESOLVE_THEME_OPTION_KEYS],
      heritage: [],
      declarations: 1,
    });
    expect(optionSurface(censusRow(COMPILE_DOOR).source, censusRow(COMPILE_DOOR).path, COMPILE_DOOR_OPTIONS)).toEqual({
      members: [...COMPILE_DOOR_OPTION_KEYS],
      heritage: [],
      declarations: 1,
    });
    expect(parameterTypes(censusRow(RESOLUTION_OWNER).source, censusRow(RESOLUTION_OWNER).path, "resolveTheme")).toEqual(["ThemeIntent", "ResolveThemeOptions"]);
    expect(parameterTypes(censusRow(COMPILE_DOOR).source, censusRow(COMPILE_DOOR).path, "compileThemeIntent")).toEqual(["ThemeIntent", COMPILE_DOOR_OPTIONS]);
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
    for (const { station, owner } of ADMISSION_STATIONS) {
      const owners = SOURCES.filter(({ path, source }) =>
        declaredNames(source, path).has(station)
      ).map(({ label }) => label);
      expect(owners, `${station} owners`).toHaveLength(1);
      expect(owners[0], `${station} owner`).toContain(owner ?? ADMISSION_OWNER);
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
    for (const station of ADMISSION_STATION_NAMES) {
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
      /theme-lowering|lowerFlatThemeFixture/u.test(code(source))
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
    const planted = `import { lowerFlatThemeFixture } from "@tests/support/theme-lowering";\n`;
    const importers = withPlanted(victim, planted)
      .filter(({ source }) => /theme-lowering|lowerFlatThemeFixture/u.test(code(source)))
      .map(({ label }) => label);
    expect(importers).toEqual([victim]);
  });

  /* ---------------------------------------------------------------------- */
  /* C4 · the ingress laws go red on the exact shapes they retired          */
  /* ---------------------------------------------------------------------- */

  /** A private copy of the door, calling the resolver with the given second argument. */
  const doorCalling = (options: string) =>
    `const resolveOver = (target) => resolveTheme(target, ${options});\n`;

  /** A conditional at the door, with one branch mutated. */
  const doorConditional = (branch: string) =>
    doorCalling(`baselineSource === "brand-theme" ? {} : ${branch}`);

  /** The derivation as the door binds it. */
  const DERIVATION = "const vertical = baselineFor(target.vertical, target.slug);";

  /** The options as the door passes them. */
  const ADMITTED = "{ baseline: target.baseline ?? vertical, vertical }";

  /** A private copy of the door's real body, with its binding and its options mutated apart. */
  const doorResolving = (options: string, binding: string = DERIVATION, parameters = "target") =>
    `const resolveOver = (${parameters}) => {\n  ${binding}\n  return resolveTheme(target, ${options});\n};\n`;

  const censusOver = (planted: string) =>
    resolveThemeArityCensus(withPlanted(COMPILE_DOOR, planted));

  it("the unmutated tree has zero arity findings and exactly the declared options caller", () => {
    const { findings, optionCallers, optionKeys } = resolveThemeArityCensus(SOURCES);
    expect(findings).toEqual([]);
    expect(optionCallers).toEqual([RESOLVE_THEME_OPTIONS_CALLER]);
    expect(optionKeys).toEqual([[...RESOLVE_THEME_OPTION_KEYS]]);
  });

  it("the private copy of the door is admitted, so every finding below is the mutant's", () => {
    expect(censusOver(doorResolving(ADMITTED))).toEqual({
      findings: [],
      optionCallers: [RESOLVE_THEME_OPTIONS_CALLER],
      optionKeys: [[...RESOLVE_THEME_OPTION_KEYS]],
    });
  });

  it("a reinstated two-argument resolveTheme outside the declared caller is caught", () => {
    const planted = `resolveTheme(baseline, { origin: "preview", patch });\n`;
    const { findings } = resolveThemeArityCensus(withPlanted(victim, planted));
    expect(findings).toEqual([
      `${victim}: resolveTheme called with options outside the declared caller`,
    ]);
  });

  it("an import alias of resolveTheme does not evade the arity census", () => {
    const planted =
      `import { resolveTheme as resolve } from "../../theme/runtime/resolution";\n` +
      `resolve(intent, {});\n`;
    const { findings } = resolveThemeArityCensus(withPlanted(victim, planted));
    expect(findings).toEqual([
      `${victim}: resolveTheme called with options outside the declared caller`,
    ]);
  });

  it("a third key beside baseline and vertical at the door is caught", () => {
    for (const [options, named] of [
      ["{ baseline: target.baseline ?? vertical, vertical, skipAdmission: true }", "skipAdmission"],
      ["{ baseline: target.baseline ?? vertical, vertical, style }", "style"],
      ['{ baseline: target.baseline ?? vertical, vertical, "tenant": vertical }', "tenant"],
      ['{ baseline: target.baseline ?? vertical, vertical, ["vertical"]: theme }', "ComputedPropertyName"],
    ] as const) {
      const { findings, optionCallers } = censusOver(doorResolving(options));
      expect(findings, options).toEqual([
        `${COMPILE_DOOR}: resolveTheme option ${named} is outside baseline, vertical`,
      ]);
      expect(optionCallers).toEqual([RESOLVE_THEME_OPTIONS_CALLER]);
    }
  });

  it("a vertical that is not the derivation is caught", () => {
    for (const [options, fault] of [
      // the intent's carried theme: the customized baseline posing as the original
      ["{ baseline: target.baseline ?? vertical, vertical: target.baseline }", "is not produced by baselineFor (PropertyAccessExpression)"],
      // the carried arm `baseline` is allowed and `vertical` is not
      ["{ baseline: target.baseline ?? vertical, vertical: target.baseline ?? vertical }", "is not produced by baselineFor (BinaryExpression)"],
      ["{ baseline: target.baseline ?? vertical, vertical: target.baseline ?? baselineFor(target.vertical, target.slug) }", "is not produced by baselineFor (BinaryExpression)"],
      // a theme, another producer, a caller's option
      ["{ baseline: target.baseline ?? vertical, vertical: theme }", "theme has no const binding in the function that makes the call"],
      ["{ baseline: target.baseline ?? vertical, vertical: pickBaseline(target) }", "is not produced by baselineFor (CallExpression)"],
      ["{ baseline: target.baseline ?? vertical, vertical: options.vertical }", "is not produced by baselineFor (PropertyAccessExpression)"],
      ["{ baseline: target.baseline ?? vertical, vertical: options?.vertical ?? vertical }", "is not produced by baselineFor (BinaryExpression)"],
      ["{ baseline: target.baseline ?? vertical, vertical: cond ? vertical : theme }", "is not produced by baselineFor (ConditionalExpression)"],
    ] as const) {
      expect(censusOver(doorResolving(options)).findings, options).toEqual([
        `${COMPILE_DOOR}: resolveTheme vertical ${fault}`,
      ]);
    }
  });

  it("a vertical bound to anything but the derivation is caught through its binding", () => {
    for (const [binding, fault] of [
      ["const vertical = pickTheme(target);", "is not produced by baselineFor (CallExpression)"],
      ["const vertical = target.baseline;", "is not produced by baselineFor (PropertyAccessExpression)"],
      ["const original = baselineFor(target.vertical, target.slug); const vertical = original;", "is not produced by baselineFor (Identifier)"],
    ] as const) {
      // `baseline` falls back to the same binding, so the one defect is reported once per key.
      expect(censusOver(doorResolving(ADMITTED, binding)).findings, binding).toEqual([
        `${COMPILE_DOOR}: resolveTheme baseline ${fault}`,
        `${COMPILE_DOOR}: resolveTheme vertical ${fault}`,
      ]);
    }
  });

  it("a derivation over a hard-coded or foreign vertical is caught", () => {
    const fault = "is not baselineFor(target.vertical, target.slug)";
    for (const binding of [
      // hard-coded: every tenant measured against one product's dial
      'const vertical = baselineFor("rottay", target.slug);',
      "const vertical = baselineFor(target.vertical, \"acme\");",
      // foreign: a caller's option, another intent, a third argument, the arguments swapped
      "const vertical = baselineFor(options.vertical, target.slug);",
      "const vertical = baselineFor(other.vertical, target.slug);",
      "const vertical = baselineFor(target.vertical, other.slug);",
      "const vertical = baselineFor(target.vertical, target.slug, options.style);",
      "const vertical = baselineFor(target.slug, target.vertical);",
      "const vertical = baselineFor(target.vertical);",
      "const vertical = baselineFor(target.intent.vertical, target.intent.slug);",
    ]) {
      expect(censusOver(doorResolving(ADMITTED, binding)).findings, binding).toEqual([
        `${COMPILE_DOOR}: resolveTheme baseline ${fault}`,
        `${COMPILE_DOOR}: resolveTheme vertical ${fault}`,
      ]);
    }
    // and written inline, without the binding
    expect(
      censusOver(
        doorResolving('{ baseline: target.baseline ?? vertical, vertical: baselineFor("rottay", target.slug) }')
      ).findings
    ).toEqual([`${COMPILE_DOOR}: resolveTheme vertical ${fault}`]);
  });

  it("a vertical the gate cannot read off a const of the calling function is caught", () => {
    const derivation = "baselineFor(target.vertical, target.slug)";
    for (const [planted, fault] of [
      [doorResolving(ADMITTED, `let vertical = ${derivation};`), "vertical is rebindable: it is not bound by const"],
      [doorResolving(ADMITTED, `var vertical = ${derivation};`), "vertical is rebindable: it is not bound by const"],
      [doorResolving(ADMITTED, "", "target, vertical"), "vertical is a parameter"],
      [doorResolving(ADMITTED, "", "target, { vertical }"), "vertical is a parameter"],
      [doorResolving(ADMITTED, "const { vertical } = sources;"), "vertical is bound by a destructuring"],
      [doorResolving(ADMITTED, ""), "vertical has no const binding in the function that makes the call"],
      // a module constant: not derived for THIS intent
      [`${DERIVATION}\n${doorResolving(ADMITTED, "")}`, "vertical has no const binding in the function that makes the call"],
      // a shadow between the derivation and the call
      [
        `const resolveOver = (target) => {\n  ${DERIVATION}\n  {\n    let vertical = draft;\n` +
          `    return resolveTheme(target, ${ADMITTED});\n  }\n};\n`,
        "vertical is rebindable: it is not bound by const",
      ],
      [
        `const resolveOver = (target) => {\n  ${DERIVATION}\n  for (const vertical of themes) {\n` +
          `    return resolveTheme(target, ${ADMITTED});\n  }\n};\n`,
        "vertical is a loop variable",
      ],
      // a closure: the derivation belongs to another function
      [
        `const resolveOver = (target) => {\n  ${DERIVATION}\n` +
          `  return (() => resolveTheme(target, ${ADMITTED}))();\n};\n`,
        "vertical has no const binding in the function that makes the call",
      ],
    ] as const) {
      expect(censusOver(planted).findings, planted).toEqual([
        `${COMPILE_DOOR}: resolveTheme baseline ${fault}`,
        `${COMPILE_DOOR}: resolveTheme vertical ${fault}`,
      ]);
    }
  });

  it("a derivation for an intent the call does not name is caught", () => {
    const planted =
      `const resolveOver = (target) => {\n  ${DERIVATION}\n` +
      `  return resolveTheme(pick(target), ${ADMITTED});\n};\n`;
    const { findings } = censusOver(planted);
    expect(findings).toHaveLength(2);
    expect(findings[1]).toContain("vertical is derived for a call whose intent is not an identifier");
  });

  it("a door that drops one of the two options fails the exact-equality half", () => {
    for (const [options, keys] of [
      ["{ baseline: target.baseline ?? vertical }", [["baseline"]]],
      ["{ vertical }", [["vertical"]]],
      ["{}", [[]]],
      [`fast ? {} : ${ADMITTED}`, [[], ["baseline", "vertical"]]],
      ["{ baseline: target.baseline ?? vertical, vertical, vertical: vertical }", [["baseline", "vertical", "vertical"]]],
    ] as const) {
      const { findings, optionKeys } = censusOver(doorResolving(options));
      expect(findings, options).toEqual([]);
      expect(optionKeys, options).toEqual(keys);
      expect(optionKeys, options).not.toEqual([[...RESOLVE_THEME_OPTION_KEYS]]);
    }
  });

  it("a second writer of verticalBaseline is caught", () => {
    for (const planted of [
      // a resolution assembled without the door, carrying its own yardstick
      `const resolution = { theme, provenance, verticalBaseline: theme };\ncompileTheme(resolution, adapter);\n`,
      `const resolution = { theme, provenance, verticalBaseline };\n`,
      `const resolution = { ...resolved, "verticalBaseline": style };\n`,
      `const resolution = { ...resolved, ["verticalBaseline"]: style };\n`,
    ]) {
      expect(verticalBaselineCensus(withPlanted(victim, planted)).writers, planted).toEqual(
        [RESOLUTION_OWNER, victim].sort()
      );
    }
    // an assignment is a property access: it lands in the reader census
    expect(
      verticalBaselineCensus(withPlanted(victim, `resolution.verticalBaseline = style;\n`)).readers
    ).toEqual([`${LOWERING_OWNER}#${VERTICAL_BASELINE_READER}`, `${victim}#<module>`].sort());
  });

  it("a second reader of verticalBaseline is caught, in another file and in the lowering itself", () => {
    const declared = `${LOWERING_OWNER}#${VERTICAL_BASELINE_READER}`;
    for (const [planted, reader] of [
      [`function paint(resolution) { return resolution.verticalBaseline.palette; }\n`, "paint"],
      [`const paint = (resolution) => resolution["verticalBaseline"];\n`, "paint"],
      [`function paint({ verticalBaseline }) { return verticalBaseline; }\n`, "paint"],
      [`const { verticalBaseline: original } = resolution;\n`, "<module>"],
    ] as const) {
      expect(verticalBaselineCensus(withPlanted(victim, planted)).readers, planted).toEqual(
        [declared, `${victim}#${reader}`].sort()
      );
    }
    // the lowering reading it for anything but the radius divisor
    const lowering = SOURCES.find(({ label }) => label === LOWERING_OWNER)!;
    const widened =
      `${lowering.source}\nfunction verticalPalette(resolution) { return resolution.verticalBaseline?.palette; }\n`;
    expect(verticalBaselineCensus(withPlanted(LOWERING_OWNER, widened)).readers).toEqual(
      [declared, `${LOWERING_OWNER}#verticalPalette`].sort()
    );
  });

  it("verticalBaseline named only in a comment, a string or a type is NOT a finding", () => {
    const planted =
      `// resolution.verticalBaseline is the vertical's own baseline\n` +
      `const note = "verticalBaseline: theme";\n` +
      `interface Carried { readonly verticalBaseline?: Theme }\n`;
    expect(verticalBaselineCensus(withPlanted(victim, planted))).toEqual(
      verticalBaselineCensus(SOURCES)
    );
  });

  it("a door that takes a baseline or a vertical from its own callers is caught", () => {
    for (const member of ["vertical?: Theme", "baseline?: Theme", "verticalBaseline?: Theme"]) {
      const planted =
        `export interface CompileThemeIntentOptions {\n  engine?: EngineName;\n  ${member};\n}\n`;
      const members = interfaceMembers(planted, "index.ts", COMPILE_DOOR_OPTIONS);
      expect(members, member).toEqual(["engine", member.split("?")[0]]);
      expect(members, member).not.toEqual([...COMPILE_DOOR_OPTION_KEYS]);
    }
  });

  it("a resolver that records or merges an unvalidated vertical is caught", () => {
    const resolver = (body: string) =>
      `export function resolveTheme(intent, options) {\n  assertThemeIntent(intent);\n${body}}\n`;
    const validated =
      `  if (options.vertical !== undefined) {\n` +
      `    assertThemeBaseline(options.vertical, "resolveTheme: options.vertical");\n` +
      `    verticalBaseline = ownedBaseline(options.vertical, intent.slug);\n  }\n`;
    expect(resolverVerticalFindings(resolver(validated), "index.ts")).toEqual([]);
    const unvalidated = 'options.vertical never reaches assertThemeBaseline as "resolveTheme: options.vertical"';
    for (const [body, findings] of [
      // the shape this law was written against
      [
        "  return { theme, verticalBaseline: options.vertical ?? baseline };\n",
        ["options.vertical is used unvalidated (BinaryExpression)", unvalidated],
      ],
      [
        `${validated}  return { theme, verticalBaseline: options.vertical };\n`,
        ["options.vertical is used unvalidated (PropertyAssignment)"],
      ],
      // validated under the baseline's label: the refusal would not name the option
      [
        `  assertThemeBaseline(options.vertical, "resolveTheme");\n`,
        [unvalidated],
      ],
      // validated, but something else is checked
      [
        `  assertThemeBaseline(baseline, "resolveTheme: options.vertical");\n  use(options.vertical);\n`,
        [unvalidated],
      ],
      // the options read whole: every member, declared or not, reaches the resolution
      [
        `${validated}  return { theme, ...options };\n`,
        ["options are read whole (SpreadAssignment)"],
      ],
      [
        `${validated}  const { vertical } = options;\n  return { theme, verticalBaseline: vertical };\n`,
        ["options are read whole (VariableDeclaration)"],
      ],
    ] as const) {
      expect(resolverVerticalFindings(resolver(body), "index.ts"), body).toEqual(findings);
    }
  });

  it("an identifier as the door's second argument is caught", () => {
    const { findings } = resolveThemeArityCensus(withPlanted(COMPILE_DOOR, doorCalling("options")));
    expect(findings).toHaveLength(1);
    expect(findings[0]).toContain("not an object literal (Identifier)");
  });

  it("a spread inside the door's options is caught", () => {
    const { findings } = resolveThemeArityCensus(
      withPlanted(COMPILE_DOOR, doorCalling("{ ...options }"))
    );
    expect(findings).toHaveLength(1);
    expect(findings[0]).toContain("carry a SpreadAssignment");
  });

  it("a baseline the door did not derive through baselineFor is caught", () => {
    for (const branch of ["{ baseline: theme }", "{ baseline: pickBaseline(target) }", "{ baseline }"]) {
      const { findings } = resolveThemeArityCensus(
        withPlanted(COMPILE_DOOR, doorConditional(branch))
      );
      expect(findings, branch).toHaveLength(1);
    }
  });

  it("the carried-baseline fallback D6-CORE-01 opened is admitted, and nothing wider", () => {
    // The `??` arm re-anchored over `9d7294e33`. Each mutant below breaks ONE
    // half of the admitted shape, so the widening cannot be read as "any binary
    // expression ending in baselineFor" or "any fallback off `target.baseline`".
    const admitted = "{ baseline: target.baseline ?? baselineFor(target.vertical, target.slug) }";
    expect(
      resolveThemeArityCensus(withPlanted(COMPILE_DOOR, doorConditional(admitted))).findings
    ).toEqual([]);
    for (const branch of [
      // the fallback is not the derivation
      "{ baseline: target.baseline ?? pickBaseline(target) }",
      "{ baseline: target.baseline ?? theme }",
      // the carried arm is not the intent's own baseline
      "{ baseline: fallbackTheme ?? baselineFor(target.vertical, target.slug) }",
      "{ baseline: target.theme ?? baselineFor(target.vertical, target.slug) }",
      // `||` coerces where `??` does not: an empty-but-present baseline would
      // silently fall through to the preset
      "{ baseline: target.baseline || baselineFor(target.vertical, target.slug) }",
      // the arms reversed: the derivation would only run when it is NOT needed
      "{ baseline: baselineFor(target.vertical, target.slug) ?? target.baseline }",
      // the carried arm is another intent's baseline
      "{ baseline: other.baseline ?? baselineFor(target.vertical, target.slug) }",
      // the fallback is derived for another vertical
      "{ baseline: target.baseline ?? baselineFor(other.vertical, target.slug) }",
      '{ baseline: target.baseline ?? baselineFor("rottay", target.slug) }',
    ]) {
      const { findings } = resolveThemeArityCensus(
        withPlanted(COMPILE_DOOR, doorConditional(branch))
      );
      expect(findings, branch).toHaveLength(1);
    }
  });

  it("three arguments at the door are caught", () => {
    const { findings } = resolveThemeArityCensus(
      withPlanted(COMPILE_DOOR, doorCalling("{}, extra"))
    );
    expect(findings).toEqual([`${COMPILE_DOOR}: resolveTheme called with 3 arguments`]);
  });

  it("a resolution owner declaring a third option member is caught", () => {
    const planted =
      `export interface ResolveThemeOptions {\n` +
      `  readonly baseline: Theme;\n` +
      `  readonly vertical?: Theme;\n` +
      `  readonly skipAdmission?: boolean;\n` +
      `}\n`;
    const mutated = withPlanted(RESOLUTION_OWNER, planted).find(
      ({ label }) => label === RESOLUTION_OWNER
    );
    const members = resolveThemeOptionMembers(mutated!.source, mutated!.path);
    expect(members).toEqual(["baseline", "vertical", "skipAdmission"]);
    expect(members).not.toEqual([...RESOLVE_THEME_OPTION_KEYS]);
  });

  it("a door that stops passing options fails the exact-equality half", () => {
    const { findings, optionCallers, optionKeys } = resolveThemeArityCensus(
      withPlanted(COMPILE_DOOR, `const resolveOver = (target) => resolveTheme(target);\n`)
    );
    expect(findings).toEqual([]);
    expect(optionCallers).toEqual([]);
    expect(optionKeys).toEqual([]);
    expect(optionCallers).not.toEqual([RESOLVE_THEME_OPTIONS_CALLER]);
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

  /* ---------------------------------------------------------------------- */
  /* what goes AROUND the pin: the derivation, the binding, the surface     */
  /* ---------------------------------------------------------------------- */

  const INGRESS_IMPORT = `import { baselineFor } from "../../../runtime/ingress";\n`;
  const RESOLUTION_IMPORT = `import { resolveTheme } from "../../../runtime/resolution";\n`;
  const CALL = "return resolveTheme(target, { baseline: target.baseline ?? vertical, vertical });";
  const doorWith = (body: string, head = INGRESS_IMPORT, parameters = "target") =>
    `${head}${RESOLUTION_IMPORT}const resolveOver = (${parameters}) => {\n${body}\n};\n`;
  const hygiene = (planted: string) =>
    derivationHygieneFindings(planted, censusRow(COMPILE_DOOR).path, COMPILE_DOOR);

  it("the door's own shape, and its inlined and renamed forms, are admitted", () => {
    for (const planted of [
      doorWith(`  ${DERIVATION}\n  ${CALL}`),
      doorWith("  return resolveTheme(target, { baseline: target.baseline ?? baselineFor(target.vertical, target.slug), vertical: baselineFor(target.vertical, target.slug) });"),
      doorWith("  const original = baselineFor(target.vertical, target.slug);\n  return resolveTheme(target, { baseline: target.baseline ?? original, vertical: original });"),
    ]) {
      expect(hygiene(planted), planted).toEqual([]);
    }
  });

  it("a derivation mutated between its binding and the call is caught", () => {
    for (const [touch, kind] of [
      ["Object.assign(vertical, options.theme);", "CallExpression"],
      ["vertical.surfaces.radiusScale = options.radius;", "PropertyAccessExpression"],
      ["patchInPlace(vertical);", "CallExpression"],
      ["const alias = vertical;", "VariableDeclaration"],
    ] as const) {
      expect(hygiene(doorWith(`  ${DERIVATION}\n  ${touch}\n  ${CALL}`)), touch).toEqual([
        `${COMPILE_DOOR}: vertical is touched between its derivation and the call, or after it (${kind})`,
      ]);
    }
  });

  it("an intent reassigned, written or handed away around the derivation is caught", () => {
    for (const [touch, kind] of [
      ["target = other;", "BinaryExpression"],
      ['target.vertical = "rottay";', "PropertyAccessExpression"],
      ["delete target.baseline;", "PropertyAccessExpression"],
      ["Object.assign(target, other);", "CallExpression"],
    ] as const) {
      expect(hygiene(doorWith(`  ${DERIVATION}\n  ${touch}\n  ${CALL}`)), touch).toEqual([
        `${COMPILE_DOOR}: the intent target is used as anything but a member read (${kind})`,
      ]);
    }
  });

  it("an intent written through a destructuring target or a loop head is caught", () => {
    for (const touch of [
      '[target.vertical] = ["rottay"];',
      '({ vertical: target.vertical } = other);',
      "[...target.patch] = layers;",
      'for (target.vertical of ["rottay"]) break;',
      "for (target.slug in slugs) break;",
    ]) {
      expect(hygiene(doorWith(`  ${touch}\n  ${DERIVATION}\n  ${CALL}`)), touch).toEqual([
        `${COMPILE_DOOR}: the intent target is used as anything but a member read (PropertyAccessExpression)`,
      ]);
    }
    // a member READ inside a literal or a loop source is not a write
    for (const read of [
      "const pair = [target.vertical, target.slug];",
      "for (const key of target.keys) audit(key);",
    ]) {
      expect(hygiene(doorWith(`  ${read}\n  ${DERIVATION}\n  ${CALL}`)), read).toEqual([]);
    }
  });

  it("a producer module that only ends like the ingress owner, or a local class of its name, is caught", () => {
    for (const [planted, bound] of [
      [doorWith(`  ${DERIVATION}\n  ${CALL}`, `import { baselineFor } from "./fake/runtime/ingress";\n`), "foreign import"],
      [doorWith(`  ${DERIVATION}\n  ${CALL}`, `import { baselineFor } from "@/fake/runtime/ingress";\n`), "foreign import"],
      [doorWith(`  class baselineFor {}\n  ${DERIVATION}\n  ${CALL}`), "import, ClassDeclaration"],
      [doorWith(`  ${DERIVATION}\n  ${CALL}`, `${INGRESS_IMPORT}import * as baselineFor from "./local";\n`), "import, NamespaceImport"],
    ] as const) {
      expect(hygiene(planted), planted).toEqual([
        `${COMPILE_DOOR}: baselineFor is bound by [${bound}], not by one import from the ingress owner`,
      ]);
    }
    // the owner named by its index file or its alias is the same module
    for (const head of [
      `import { baselineFor } from "../../../runtime/ingress/index";\n`,
      `import { baselineFor } from "@/infrastructure/compilers/runtime/theme/runtime/ingress";\n`,
    ]) {
      expect(hygiene(doorWith(`  ${DERIVATION}\n  ${CALL}`, head)), head).toEqual([]);
    }
  });

  it("a door that exports resolveTheme again is caught, locally or from the resolution module, under any alias", () => {
    const door = censusRow(COMPILE_DOOR).source;
    for (const [exported, kind] of [
      ["export { resolveTheme };", "ExportDeclaration"],
      ["export { resolveTheme as resolveIntent };", "ExportDeclaration"],
      ['export { resolveTheme as resolveIntent } from "../../../runtime/resolution";', "ExportDeclaration"],
      ['export { resolveTheme } from "../../../runtime/resolution";', "ExportDeclaration"],
    ] as const) {
      expect(
        resolveThemeBindingCensus(withPlanted(COMPILE_DOOR, `${door}\n${exported}\n`)),
        exported
      ).toEqual({
        binders: [COMPILE_DOOR],
        findings: [`${COMPILE_DOOR}: re-exports resolveTheme (${kind})`],
      });
    }
    // an import alias exported under the alias
    const aliased = door.replace(/\bresolveTheme\b/gu, "resolve").replace(
      "import { resolve }",
      "import { resolveTheme as resolve }"
    );
    expect(resolveThemeBindingCensus(withPlanted(COMPILE_DOOR, aliased))).toEqual({
      binders: [COMPILE_DOOR],
      findings: [],
    });
    expect(
      resolveThemeBindingCensus(withPlanted(COMPILE_DOOR, `${aliased}\nexport { resolve as resolveIntent };\n`)).findings
    ).toEqual([`${COMPILE_DOOR}: re-exports resolveTheme (ExportDeclaration)`]);
    // the other export forms are references that are not calls
    for (const [exported, kind] of [
      ["export default resolveTheme;", "ExportAssignment"],
      ["export const resolveIntent = resolveTheme;", "VariableDeclaration"],
    ] as const) {
      expect(
        resolveThemeBindingCensus(withPlanted(COMPILE_DOOR, `${door}\n${exported}\n`)).findings,
        exported
      ).toEqual([`${COMPILE_DOOR}: resolveTheme is referenced without being called (${kind})`]);
    }
  });

  it("a second signature of the door, or of the resolver, is read as part of its surface", () => {
    const overloaded =
      "export function compileThemeIntent(intent: ThemeIntent, options?: CompileThemeIntentOptions): R;\n" +
      "export function compileThemeIntent(intent: ThemeIntent, options?: CompileThemeIntentOptions & { vertical?: Theme }): R;\n" +
      "export function compileThemeIntent(intent: ThemeIntent, options?: CompileThemeIntentOptions): R { return run(intent, options); }\n";
    expect(parameterTypes(overloaded, "index.ts", "compileThemeIntent")).toEqual([
      "ThemeIntent",
      "CompileThemeIntentOptions",
      "ThemeIntent",
      "CompileThemeIntentOptions & { vertical?: Theme }",
      "ThemeIntent",
      "CompileThemeIntentOptions",
    ]);
  });

  it("a baselineFor that is not the ingress owner's import is caught", () => {
    for (const [planted, bound] of [
      [doorWith(`  const baselineFor = () => options.theme;\n  ${DERIVATION}\n  ${CALL}`), "import, VariableDeclaration"],
      [doorWith(`  ${DERIVATION}\n  ${CALL}`, INGRESS_IMPORT, "target, baselineFor"), "import, Parameter"],
      [doorWith(`  ${DERIVATION}\n  ${CALL}`, `import { baselineFor } from "./local";\n`), "foreign import"],
      [doorWith(`  ${DERIVATION}\n  ${CALL}`, `import { pick as baselineFor } from "../../../runtime/ingress";\n`), "foreign import"],
      [doorWith(`  ${DERIVATION}\n  ${CALL}`, ""), ""],
    ] as const) {
      expect(hygiene(planted), planted).toEqual([
        `${COMPILE_DOOR}: baselineFor is bound by [${bound}], not by one import from the ingress owner`,
      ]);
    }
  });

  it("a second binder of resolveTheme is caught, however it spells the call", () => {
    const resolution = "@/infrastructure/compilers/runtime/theme/runtime/resolution";
    for (const [planted, findings] of [
      [`import { resolveTheme } from "${resolution}";\nresolveTheme(...[intent, { baseline: theme, vertical: theme }]);\n`,
        [`${victim}: resolveTheme is called with spread arguments`]],
      [`import { resolveTheme } from "${resolution}";\nconst resolve = resolveTheme;\nresolve(intent, { vertical: theme });\n`,
        [`${victim}: resolveTheme is referenced without being called (VariableDeclaration)`]],
      [`import { resolveTheme } from "${resolution}";\nresolveTheme.call(undefined, intent, { vertical: theme });\n`,
        [`${victim}: resolveTheme is referenced without being called (PropertyAccessExpression)`]],
      [`import { resolveTheme as resolve } from "${resolution}";\nrun(resolve);\n`,
        [`${victim}: resolveTheme is referenced without being called (CallExpression)`]],
      [`import * as resolution from "${resolution}";\nresolution.resolveTheme(intent, { vertical: theme });\n`,
        [`${victim}: binds the resolution module whole (ImportDeclaration)`]],
      [`export * from "${resolution}";\n`, [`${victim}: binds the resolution module whole (ExportDeclaration)`]],
      [`export { resolveTheme as resolveIntent } from "${resolution}";\n`, []],
      [`const load = () => import("${resolution}");\n`, [`${victim}: loads the resolution module dynamically`]],
      // one argument, bound by name: no finding of its own, and still a second binder
      [`import { resolveTheme } from "${resolution}";\nresolveTheme(intent);\n`, []],
    ] as const) {
      expect(resolveThemeBindingCensus(withPlanted(victim, planted)), planted).toEqual({
        binders: [COMPILE_DOOR, victim].sort(),
        findings,
      });
    }
  });

  it("the options TYPE, and another module called `resolution`, are NOT a binding", () => {
    for (const planted of [
      `import type { ResolveThemeOptions } from "@/infrastructure/compilers/runtime/theme/runtime/resolution";\n`,
      `export type { ResolveThemeOptions } from "@/infrastructure/compilers/runtime/theme/runtime/resolution";\n`,
      `export * from "./resolution";\n`,
      `// resolveTheme(intent, options) is the door's\nconst note = "resolveTheme";\n`,
    ]) {
      expect(resolveThemeBindingCensus(withPlanted(victim, planted)), planted).toEqual({
        binders: [COMPILE_DOOR],
        findings: [],
      });
    }
  });

  it("an option surface widened without writing a member in the pinned interface is caught", () => {
    const pinned = "export interface ResolveThemeOptions {\n  readonly baseline: Theme;\n  readonly vertical?: Theme;\n}\n";
    expect(optionSurface(pinned, "index.ts", "ResolveThemeOptions")).toEqual({
      members: ["baseline", "vertical"], heritage: [], declarations: 1,
    });
    expect(
      optionSurface(pinned.replace("ResolveThemeOptions {", "ResolveThemeOptions extends More {"), "index.ts", "ResolveThemeOptions").heritage
    ).toEqual(["extends More"]);
    expect(
      optionSurface(`${pinned}export interface ResolveThemeOptions { readonly skipAdmission?: boolean }\n`, "index.ts", "ResolveThemeOptions")
    ).toEqual({ members: ["baseline", "vertical", "skipAdmission"], heritage: [], declarations: 2 });
    expect(
      optionSurface("export type ResolveThemeOptions = Base & { style?: Theme };\n", "index.ts", "ResolveThemeOptions").heritage
    ).toEqual(["type alias"]);
    expect(
      parameterTypes(
        "export function compileThemeIntent(intent: ThemeIntent, options?: CompileThemeIntentOptions & { vertical?: Theme }, extra?: Theme) {}\n",
        "index.ts",
        "compileThemeIntent"
      )
    ).toEqual(["ThemeIntent", "CompileThemeIntentOptions & { vertical?: Theme }", "Theme"]);
  });
});
