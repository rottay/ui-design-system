// Chart facade parity drill (Modern Rescue, Lane 5).
//
// WHAT THIS PROVES. `entrypoints/public/patterns/charts/index.ts` is the public
// chart facade. Its job is to publish exactly the 18 canonical chart family
// components, as VALUES, under their canonical names, from the ONE owner that
// declares them (`ui/patterns/visualization/charts/families`). This drill
// asserts that whole shape from source on every run, so a future edit to either
// side is caught mechanically instead of by hand-audit.
//
// WHY THE SHAPE AND NOT JUST THE NAME SET. The previous revision of this drill
// compared name sets only, which made it a false green. Every one of these
// passed it while breaking the facade:
//
//   • `export { BarChart as AreaChart, AreaChart as BarChart, ... }` — the name
//     SET is exactly right and every import resolves; the components are simply
//     swapped. Set equality cannot see an alias, because it reads the exported
//     name and an alias is precisely a lie about which local that name binds.
//   • a correct name list pointed at the WRONG module — the extractor never
//     resolved, or even looked at, the module specifier.
//   • `export type { AreaChart, ... }` — a type-only clause publishes no value,
//     yet its names read identically to a value clause.
//   • `export * from "..."` alongside the good list — the extractor collected
//     nothing from an export-star and reported no failure for it, so an
//     unbounded surface could be bolted on invisibly.
//   • `export const CHART_COUNT = 18` — an exported local declaration is not an
//     `ExportDeclaration` at all, so it was not merely tolerated, it was unseen.
//   • the same name twice — `Set` deduplicated it back to a clean 18.
//
// So this drill checks the shape, not a projection of it: exactly one top-level
// non-type-only `ExportDeclaration`, exactly the expected module specifier, an
// element list with no aliases and no type-only members, no duplicates, and no
// other exporting construct anywhere in the file. Each of those clauses has a
// permanent planted-negative canary below; a canary that stops failing means the
// clause it guards has stopped being enforced.
//
// TECHNIQUE. Parser-only AST walk (`ts.createSourceFile`), the same approach as
// `parseModule` in `libraries/taxonomy/roots`: no `ts.createProgram`, no
// type checker, no module resolution. A regex would match today's exact file
// shape and would say nothing about the shapes above, which is the entire point.
//
// Hermetic: every planted negative parses a synthetic in-memory source string.
// Nothing is written to disk and no temp directory is created.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { loadTypeScript } from '../../../libraries/taxonomy/roots/index.mjs';
import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = findPackageRoot(scriptDir);

const FACADE_FILE = resolve(packageRoot, 'src/entrypoints/public/patterns/charts/index.ts');
const INVENTORY_FILE = resolve(
  packageRoot,
  'scripts/quality-evidence/programs/modern-rescue/family-inventory.json',
);

/**
 * The ONE module the facade may re-export from. It is the families owner's own
 * barrel, not the eighteen sibling folders below it: naming the owner once makes
 * the published family set a single fact with a single source, where eighteen
 * independent lines could each drift on their own.
 */
const EXPECTED_SPECIFIER = '../../../../components/patterns/visualization/charts/families';

const EXPECTED_EXPORT_COUNT = 18;

/**
 * Inspects the facade's shape and reports every violation, in a deterministic
 * order: statement-scan findings in source order, then the declaration-count
 * check, then (only when there is exactly one candidate declaration) the module
 * specifier, the per-element checks in element order, duplicates, and finally
 * the parity of the published name set against the inventory.
 *
 * Parser-only. `problems` is empty exactly when the facade is well formed.
 */
function inspectChartFacade(ts, fileName, sourceText, expectedNames) {
  const source = ts.createSourceFile(fileName, sourceText, ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);
  const problems = [];
  const candidates = [];

  for (const statement of source.statements) {
    if (ts.isExportAssignment(statement)) {
      problems.push('export assignment (export default / export =) is forbidden');
      continue;
    }
    if (ts.isExportDeclaration(statement)) {
      const clause = statement.exportClause;
      if (!clause) {
        // `export * from "..."` — an unbounded surface with no name list to check.
        problems.push('export-star declaration is forbidden');
        continue;
      }
      if (ts.isNamespaceExport(clause)) {
        problems.push('namespace re-export (export * as ns) is forbidden');
        continue;
      }
      if (statement.isTypeOnly) {
        // A type-only clause publishes no value, so it cannot be the facade even
        // though its name list reads identically to a value clause.
        problems.push('type-only export declaration is forbidden');
        continue;
      }
      candidates.push(statement);
      continue;
    }
    // Anything else carrying an `export` modifier is a local declaration the
    // facade published itself. The facade re-exports; it declares nothing.
    const modifiers = ts.canHaveModifiers(statement) ? (ts.getModifiers(statement) ?? []) : [];
    if (!modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)) continue;
    for (const name of localDeclarationNames(ts, statement)) {
      problems.push(`exported local declaration ${name} is forbidden`);
    }
  }

  if (candidates.length !== 1) {
    problems.push(`expected exactly 1 value export declaration, found ${candidates.length}`);
    return { problems, names: [] };
  }

  const [declaration] = candidates;
  const specifier = declaration.moduleSpecifier;
  if (!specifier || !ts.isStringLiteral(specifier)) {
    problems.push('export declaration must re-export from a module specifier');
    return { problems, names: [] };
  }
  if (specifier.text !== EXPECTED_SPECIFIER) {
    problems.push(`expected module specifier "${EXPECTED_SPECIFIER}", found "${specifier.text}"`);
  }

  const names = [];
  for (const element of declaration.exportClause.elements) {
    const exportedName = element.name.text;
    if (element.propertyName) {
      // The exported name is what a consumer imports; the property name is what
      // it actually binds. When they differ the facade is asserting something
      // the owner never said, and a name-set check cannot see the difference.
      problems.push(`alias is forbidden: ${element.propertyName.text} as ${exportedName}`);
    }
    if (element.isTypeOnly) {
      problems.push(`type-only export element is forbidden: ${exportedName}`);
      continue;
    }
    names.push(exportedName);
  }

  const seen = new Set();
  for (const name of names) {
    if (seen.has(name)) problems.push(`duplicate export name: ${name}`);
    seen.add(name);
  }

  const missing = [...expectedNames].filter((name) => !seen.has(name));
  const extra = [...seen].filter((name) => !expectedNames.has(name));
  if (missing.length > 0) problems.push(`missing chart components: ${missing.join(', ')}`);
  if (extra.length > 0) {
    problems.push(`exported names with no chart-layer inventory row: ${extra.join(', ')}`);
  }
  if (names.length !== EXPECTED_EXPORT_COUNT) {
    problems.push(`expected exactly ${EXPECTED_EXPORT_COUNT} exported names, found ${names.length}`);
  }

  return { problems, names };
}

/** Names bound by an exported local declaration, for the violation message. */
function localDeclarationNames(ts, statement) {
  if (ts.isVariableStatement(statement)) {
    return statement.declarationList.declarations
      .map((declaration) => (ts.isIdentifier(declaration.name) ? declaration.name.text : '<pattern>'));
  }
  const name = statement.name;
  return [name && ts.isIdentifier(name) ? name.text : '<anonymous>'];
}

/** The canonical chart family component names, derived from the inventory. */
function loadChartFamilyNames() {
  const inventory = JSON.parse(readFileSync(INVENTORY_FILE, 'utf8'));
  const rows = inventory.rows.filter((row) => row.layer === 'chart');
  const names = new Set();
  for (const row of rows) {
    for (const component of row.components) names.add(component);
  }
  return { names, rowCount: rows.length };
}

/**
 * Builds a synthetic facade from a list of clause element texts. Every canary
 * starts from the well-formed shape and mutates exactly one thing, so a canary
 * failure names one cause.
 */
function facadeSource(elements, { specifier = EXPECTED_SPECIFIER, typeOnly = false, extra = '' } = {}) {
  const keyword = typeOnly ? 'export type' : 'export';
  return `"use client";\n\n${keyword} {\n${elements.map((element) => `  ${element},`).join('\n')}\n} from "${specifier}";\n${extra}`;
}

const ts = loadTypeScript();
const { names: EXPECTED_NAMES, rowCount: CHART_ROW_COUNT } = loadChartFamilyNames();
const CANONICAL = [...EXPECTED_NAMES].sort();

test('the inventory still declares exactly 18 chart-layer families', () => {
  assert.equal(CHART_ROW_COUNT, EXPECTED_EXPORT_COUNT, `expected 18 chart-layer inventory rows, found ${CHART_ROW_COUNT}`);
  assert.equal(CANONICAL.length, EXPECTED_EXPORT_COUNT);
});

test('the real chart facade is one aliasless value re-export of exactly the 18 canonical components', () => {
  const sourceText = readFileSync(FACADE_FILE, 'utf8');
  const { problems, names } = inspectChartFacade(ts, FACADE_FILE, sourceText, EXPECTED_NAMES);

  assert.deepEqual(problems, [], `the live facade violates its shape: ${problems.join(' | ')}`);
  assert.deepEqual([...names].sort(), CANONICAL);
  assert.equal(names.length, EXPECTED_EXPORT_COUNT);
});

test('the real chart facade keeps its client directive', () => {
  const sourceText = readFileSync(FACADE_FILE, 'utf8');
  assert.match(sourceText, /^\s*["']use client["'];/, 'the facade is a client boundary and must open with the directive');
});

// ---------------------------------------------------------------------------
// Permanent planted negatives. Each mutates ONE clause of the shape.
// ---------------------------------------------------------------------------

test('planted negative: a missing component and a bogus component', () => {
  const elements = CANONICAL.filter((name) => name !== 'AreaChart').concat('TotallyFakeChart');
  const { problems } = inspectChartFacade(ts, 'fixture.ts', facadeSource(elements), EXPECTED_NAMES);

  assert.deepEqual(problems, [
    'missing chart components: AreaChart',
    'exported names with no chart-layer inventory row: TotallyFakeChart',
  ]);
});

test('planted negative: an alias swap the name set alone cannot see', () => {
  // The published NAME SET is exactly the canonical 18 and every import
  // resolves. Only the two components behind AreaChart and BarChart are
  // crossed. This is the case the previous set-equality drill passed.
  const elements = CANONICAL.map((name) => {
    if (name === 'AreaChart') return 'BarChart as AreaChart';
    if (name === 'BarChart') return 'AreaChart as BarChart';
    return name;
  });
  const { problems, names } = inspectChartFacade(ts, 'fixture.ts', facadeSource(elements), EXPECTED_NAMES);

  assert.deepEqual([...names].sort(), CANONICAL, 'the planted swap must leave the name set intact');
  assert.deepEqual(problems, [
    'alias is forbidden: BarChart as AreaChart',
    'alias is forbidden: AreaChart as BarChart',
  ]);
});

test('planted negative: the right names re-exported from the wrong module', () => {
  const wrong = '../../../../components/patterns/visualization/charts';
  const { problems } = inspectChartFacade(
    ts,
    'fixture.ts',
    facadeSource(CANONICAL, { specifier: wrong }),
    EXPECTED_NAMES,
  );

  assert.deepEqual(problems, [
    `expected module specifier "${EXPECTED_SPECIFIER}", found "${wrong}"`,
  ]);
});

test('planted negative: a whole type-only clause publishes no value', () => {
  const { problems } = inspectChartFacade(
    ts,
    'fixture.ts',
    facadeSource(CANONICAL, { typeOnly: true }),
    EXPECTED_NAMES,
  );

  assert.deepEqual(problems, [
    'type-only export declaration is forbidden',
    'expected exactly 1 value export declaration, found 0',
  ]);
});

test('planted negative: a single type-only element inside a value clause', () => {
  const elements = CANONICAL.map((name) => (name === 'AreaChart' ? 'type AreaChart' : name));
  const { problems } = inspectChartFacade(ts, 'fixture.ts', facadeSource(elements), EXPECTED_NAMES);

  assert.deepEqual(problems, [
    'type-only export element is forbidden: AreaChart',
    'missing chart components: AreaChart',
    `expected exactly ${EXPECTED_EXPORT_COUNT} exported names, found 17`,
  ]);
});

test('planted negative: an export-star bolted onto a correct list', () => {
  const { problems } = inspectChartFacade(
    ts,
    'fixture.ts',
    facadeSource(CANONICAL, { extra: 'export * from "./anything";\n' }),
    EXPECTED_NAMES,
  );

  assert.deepEqual(problems, ['export-star declaration is forbidden']);
});

test('planted negative: a namespace re-export bolted onto a correct list', () => {
  const { problems } = inspectChartFacade(
    ts,
    'fixture.ts',
    facadeSource(CANONICAL, { extra: 'export * as charts from "./anything";\n' }),
    EXPECTED_NAMES,
  );

  assert.deepEqual(problems, ['namespace re-export (export * as ns) is forbidden']);
});

test('planted negative: an exported local declaration alongside a correct list', () => {
  const { problems } = inspectChartFacade(
    ts,
    'fixture.ts',
    facadeSource(CANONICAL, { extra: 'export const CHART_COUNT = 18;\nexport function makeChart() {}\n' }),
    EXPECTED_NAMES,
  );

  assert.deepEqual(problems, [
    'exported local declaration CHART_COUNT is forbidden',
    'exported local declaration makeChart is forbidden',
  ]);
});

test('planted negative: a default export alongside a correct list', () => {
  const { problems } = inspectChartFacade(
    ts,
    'fixture.ts',
    facadeSource(CANONICAL, { extra: 'export default 1;\n' }),
    EXPECTED_NAMES,
  );

  assert.deepEqual(problems, ['export assignment (export default / export =) is forbidden']);
});

test('planted negative: the same component listed twice', () => {
  const elements = [...CANONICAL, 'AreaChart'];
  const { problems, names } = inspectChartFacade(ts, 'fixture.ts', facadeSource(elements), EXPECTED_NAMES);

  assert.equal(new Set(names).size, EXPECTED_EXPORT_COUNT, 'deduplication is exactly what hid this before');
  assert.deepEqual(problems, [
    'duplicate export name: AreaChart',
    `expected exactly ${EXPECTED_EXPORT_COUNT} exported names, found 19`,
  ]);
});

test('planted negative: the 18 names split across two declarations', () => {
  const first = CANONICAL.slice(0, 9);
  const second = CANONICAL.slice(9);
  const sourceText = [
    '"use client";',
    '',
    `export { ${first.join(', ')} } from "${EXPECTED_SPECIFIER}";`,
    `export { ${second.join(', ')} } from "${EXPECTED_SPECIFIER}";`,
    '',
  ].join('\n');

  const { problems } = inspectChartFacade(ts, 'fixture.ts', sourceText, EXPECTED_NAMES);

  assert.deepEqual(problems, ['expected exactly 1 value export declaration, found 2']);
});

test('planted negative: a local re-export with no module specifier', () => {
  const sourceText = `"use client";\n\nexport { ${CANONICAL.join(', ')} };\n`;
  const { problems } = inspectChartFacade(ts, 'fixture.ts', sourceText, EXPECTED_NAMES);

  assert.deepEqual(problems, ['export declaration must re-export from a module specifier']);
});

test('control: the synthetic well-formed facade passes the same detector', () => {
  // Proves the canaries fail for the reason claimed and not because the
  // synthetic-source path is broken in general.
  const { problems, names } = inspectChartFacade(ts, 'fixture.ts', facadeSource(CANONICAL), EXPECTED_NAMES);

  assert.deepEqual(problems, []);
  assert.deepEqual([...names].sort(), CANONICAL);
});
