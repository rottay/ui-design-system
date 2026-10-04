// Chart facade parity drill.
//
// WHAT THIS PROVES. The eighteen chart family components have one public door:
// the package root. `src/index.ts` reaches them through a chain of `export *`
// links that ends at the charts barrel, and the charts barrel takes them from
// the ONE owner that declares them (`charts/families`). This drill asserts that
// whole shape from source on every run: the barrel publishes exactly the 18
// canonical names, as VALUES, under their canonical names, from that owner, and
// no link of the chain re-points one of them.
//
// WHY THE SHAPE AND NOT JUST THE NAME SET. A name-set comparison is a false
// green for every one of these:
//
//   • `export { BarChart as AreaChart, AreaChart as BarChart, ... }` — the name
//     SET is exactly right and every import resolves; the components are simply
//     swapped. Set equality cannot see an alias.
//   • a correct name list pointed at the WRONG module.
//   • `export type { AreaChart, ... }` — a type-only clause publishes no value.
//   • `export * from "./families"` alongside the good list — an unbounded
//     surface with no name list to check.
//   • `export const AreaChart = ...` — an exported local declaration is not an
//     `ExportDeclaration` at all.
//   • the same name twice — a `Set` deduplicates it back to a clean 18.
//   • a named export of a chart name in a link of the chain — a named export
//     wins over `export *`, so the door would publish something else under the
//     canonical name while the barrel stays perfect.
//
// So the drill checks the shape: in the charts barrel, exactly one non-type-only
// `ExportDeclaration` carries chart families, with exactly the expected module
// specifier, no aliases, no type-only members and no duplicates; the barrel
// declares nothing locally and never stars the families owner; and every link
// of the root door carries exactly one value `export *` to the next link and
// binds none of the 18 names itself. Each clause has a permanent planted
// negative below; a canary that stops failing means its clause stopped being
// enforced.
//
// WHAT IT DOES NOT SEE. Two different `export *` of one link that both carry
// the same name make that name ambiguous; the type checker reports that, not
// this parser-only walk.
//
// TECHNIQUE. Parser-only AST walk (`ts.createSourceFile`): no program, no type
// checker, no module resolution.
//
// Hermetic: every planted negative parses a synthetic in-memory source string.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { loadTypeScript } from '../../../libraries/taxonomy/roots/index.mjs';
import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = findPackageRoot(scriptDir);

/** The root door, link by link: each file and the specifier it must star-export. */
const DOOR_LINKS = Object.freeze([
  Object.freeze({ file: 'src/index.ts', star: './components' }),
  Object.freeze({ file: 'src/components/index.ts', star: './patterns' }),
  Object.freeze({ file: 'src/components/patterns/index.ts', star: './visualization' }),
  Object.freeze({ file: 'src/components/patterns/visualization/index.ts', star: './charts' }),
]);
const DOOR_FILE = resolve(packageRoot, DOOR_LINKS[0].file);
const FACADE_FILE = resolve(packageRoot, 'src/components/patterns/visualization/charts/index.ts');
const INVENTORY_FILE = resolve(
  packageRoot,
  'scripts/check/modern-rescue/family-inventory/index.json',
);

/**
 * The ONE module the charts barrel may take the families from. It is the
 * families owner's own barrel, not the eighteen sibling folders below it.
 */
const EXPECTED_SPECIFIER = './families';

const EXPECTED_EXPORT_COUNT = 18;

/**
 * Inspects how the charts barrel publishes the chart families and reports every
 * violation, in a deterministic order: statement-scan findings in source order,
 * then the declaration-count check, then (only when there is exactly one
 * candidate declaration) the module specifier, the per-element checks in
 * element order, duplicates, and finally the parity of the published name set
 * against the inventory.
 *
 * A declaration is a candidate when it is a value export that names the
 * families owner or carries one of the expected names. The barrel publishes the
 * rest of the chart surface too; those declarations are not this drill's.
 *
 * Parser-only. `problems` is empty exactly when the publication is well formed.
 */
function inspectChartFacade(ts, fileName, sourceText, expectedNames) {
  const source = ts.createSourceFile(fileName, sourceText, ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);
  const problems = [];
  const candidates = [];
  const fromFamilies = (statement) => Boolean(statement.moduleSpecifier
    && ts.isStringLiteral(statement.moduleSpecifier)
    && statement.moduleSpecifier.text === EXPECTED_SPECIFIER);
  const carriesFamily = (clause) => clause.elements.some((element) =>
    expectedNames.has(element.name.text) || (element.propertyName && expectedNames.has(element.propertyName.text)));

  for (const statement of source.statements) {
    if (ts.isExportAssignment(statement)) {
      problems.push('export assignment (export default / export =) is forbidden');
      continue;
    }
    if (ts.isExportDeclaration(statement)) {
      const clause = statement.exportClause;
      if (!clause) {
        // `export * from "./families"` — an unbounded surface with no name list to check.
        if (fromFamilies(statement)) problems.push('export-star of the families owner is forbidden');
        continue;
      }
      if (ts.isNamespaceExport(clause)) {
        if (fromFamilies(statement) || expectedNames.has(clause.name.text)) {
          problems.push('namespace re-export (export * as ns) of the families owner is forbidden');
        }
        continue;
      }
      if (statement.isTypeOnly) {
        // A type-only clause publishes no value, so it cannot publish a family
        // even though its name list reads identically to a value clause.
        if (carriesFamily(clause)) problems.push('type-only export declaration is forbidden');
        continue;
      }
      if (fromFamilies(statement) || carriesFamily(clause)) candidates.push(statement);
      continue;
    }
    // Anything else carrying an `export` modifier is a local declaration the
    // barrel published itself. The barrel re-exports; it declares nothing.
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
      // it actually binds. When they differ the barrel is asserting something
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

/**
 * Inspects one link of the root door: it must carry exactly one value
 * `export *` from the next link, and bind none of the expected names itself.
 */
function inspectDoorLink(ts, fileName, sourceText, star, expectedNames) {
  const source = ts.createSourceFile(fileName, sourceText, ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);
  const problems = [];
  let stars = 0;

  for (const statement of source.statements) {
    if (ts.isExportDeclaration(statement)) {
      const clause = statement.exportClause;
      const specifier = statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier)
        ? statement.moduleSpecifier.text
        : null;
      if (!clause) {
        if (specifier === star && !statement.isTypeOnly) stars += 1;
        continue;
      }
      if (ts.isNamespaceExport(clause)) {
        if (expectedNames.has(clause.name.text)) {
          problems.push(`the door binds ${clause.name.text} itself: namespace re-export`);
        }
        continue;
      }
      for (const element of clause.elements) {
        if (!expectedNames.has(element.name.text)) continue;
        const bound = element.propertyName ? `${element.propertyName.text} as ${element.name.text}` : element.name.text;
        problems.push(`the door binds ${element.name.text} itself: export { ${bound} }${specifier ? ` from "${specifier}"` : ''}`);
      }
      continue;
    }
    const modifiers = ts.canHaveModifiers(statement) ? (ts.getModifiers(statement) ?? []) : [];
    if (!modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)) continue;
    for (const name of localDeclarationNames(ts, statement)) {
      if (expectedNames.has(name)) problems.push(`the door binds ${name} itself: exported local declaration`);
    }
  }

  if (stars !== 1) problems.push(`expected exactly 1 value export-star from "${star}", found ${stars}`);
  return problems;
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
 * Builds a synthetic charts barrel from a list of clause element texts. Every
 * canary starts from the well-formed shape and mutates exactly one thing, so a
 * canary failure names one cause. The surrounding declarations are the ones a
 * real barrel carries beside the families; they must stay invisible.
 */
function facadeSource(elements, { specifier = EXPECTED_SPECIFIER, typeOnly = false, extra = '' } = {}) {
  const keyword = typeOnly ? 'export type' : 'export';
  return [
    "export type { ChartBaseProps } from './contracts';",
    "export { useChartDimensions } from './runtime';",
    `${keyword} {\n${elements.map((element) => `  ${element},`).join('\n')}\n} from "${specifier}";`,
    `export type { AreaChartProps } from "${EXPECTED_SPECIFIER}";`,
    extra,
  ].join('\n');
}

const ts = loadTypeScript();
const { names: EXPECTED_NAMES, rowCount: CHART_ROW_COUNT } = loadChartFamilyNames();
const CANONICAL = [...EXPECTED_NAMES].sort();

test('the inventory still declares exactly 18 chart-layer families', () => {
  assert.equal(CHART_ROW_COUNT, EXPECTED_EXPORT_COUNT, `expected 18 chart-layer inventory rows, found ${CHART_ROW_COUNT}`);
  assert.equal(CANONICAL.length, EXPECTED_EXPORT_COUNT);
});

test('the real charts barrel takes exactly the 18 canonical components from the families owner, aliasless and as values', () => {
  const sourceText = readFileSync(FACADE_FILE, 'utf8');
  const { problems, names } = inspectChartFacade(ts, FACADE_FILE, sourceText, EXPECTED_NAMES);

  assert.deepEqual(problems, [], `the live charts barrel violates its shape: ${problems.join(' | ')}`);
  assert.deepEqual([...names].sort(), CANONICAL);
  assert.equal(names.length, EXPECTED_EXPORT_COUNT);
});

test('the real root door reaches the charts barrel through one export-star per link and binds no family itself', () => {
  for (const link of DOOR_LINKS) {
    const file = resolve(packageRoot, link.file);
    const problems = inspectDoorLink(ts, file, readFileSync(file, 'utf8'), link.star, EXPECTED_NAMES);
    assert.deepEqual(problems, [], `${link.file}: ${problems.join(' | ')}`);
  }
  assert.equal(
    resolve(dirname(resolve(packageRoot, DOOR_LINKS.at(-1).file)), DOOR_LINKS.at(-1).star, 'index.ts'),
    FACADE_FILE,
    'the last link of the door must be the charts barrel this drill inspects',
  );
  for (let index = 1; index < DOOR_LINKS.length; index += 1) {
    const previous = DOOR_LINKS[index - 1];
    assert.equal(
      resolve(dirname(resolve(packageRoot, previous.file)), previous.star, 'index.ts'),
      resolve(packageRoot, DOOR_LINKS[index].file),
      `${previous.file} does not star-export ${DOOR_LINKS[index].file}`,
    );
  }
});

test('the real root door keeps its client directive', () => {
  const sourceText = readFileSync(DOOR_FILE, 'utf8');
  assert.match(sourceText, /^\s*["']use client["'];/, 'the door that publishes the chart families is a client boundary and must open with the directive');
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
  const wrong = './runtime';
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
    facadeSource(CANONICAL, { extra: `export * from "${EXPECTED_SPECIFIER}";\n` }),
    EXPECTED_NAMES,
  );

  assert.deepEqual(problems, ['export-star of the families owner is forbidden']);
});

test('planted negative: a namespace re-export bolted onto a correct list', () => {
  const { problems } = inspectChartFacade(
    ts,
    'fixture.ts',
    facadeSource(CANONICAL, { extra: `export * as charts from "${EXPECTED_SPECIFIER}";\n` }),
    EXPECTED_NAMES,
  );

  assert.deepEqual(problems, ['namespace re-export (export * as ns) of the families owner is forbidden']);
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
    `export { ${first.join(', ')} } from "${EXPECTED_SPECIFIER}";`,
    `export { ${second.join(', ')} } from "${EXPECTED_SPECIFIER}";`,
    '',
  ].join('\n');

  const { problems } = inspectChartFacade(ts, 'fixture.ts', sourceText, EXPECTED_NAMES);

  assert.deepEqual(problems, ['expected exactly 1 value export declaration, found 2']);
});

test('planted negative: a local re-export with no module specifier', () => {
  const sourceText = `export { ${CANONICAL.join(', ')} };\n`;
  const { problems } = inspectChartFacade(ts, 'fixture.ts', sourceText, EXPECTED_NAMES);

  assert.deepEqual(problems, ['export declaration must re-export from a module specifier']);
});

test('planted negative: a second value declaration that takes a helper from the families owner', () => {
  const { problems } = inspectChartFacade(
    ts,
    'fixture.ts',
    facadeSource(CANONICAL, { extra: `export { makeChart } from "${EXPECTED_SPECIFIER}";\n` }),
    EXPECTED_NAMES,
  );

  assert.deepEqual(problems, ['expected exactly 1 value export declaration, found 2']);
});

test('planted negative: a family listed again from another module', () => {
  const { problems } = inspectChartFacade(
    ts,
    'fixture.ts',
    facadeSource(CANONICAL, { extra: 'export { AreaChart } from "./runtime";\n' }),
    EXPECTED_NAMES,
  );

  assert.deepEqual(problems, ['expected exactly 1 value export declaration, found 2']);
});

// ---------------------------------------------------------------------------
// The door: a link of the chain is where a perfect barrel can still be undone.
// ---------------------------------------------------------------------------

const LINK = "export * from './next';\nexport * from './sibling';\nexport { useThing } from './thing';\n";

test('control: a well-formed door link passes', () => {
  assert.deepEqual(inspectDoorLink(ts, 'link.ts', LINK, './next', EXPECTED_NAMES), []);
});

test('planted negative: a door link that swaps a family behind its canonical name', () => {
  const problems = inspectDoorLink(
    ts,
    'link.ts',
    `${LINK}export { BarChart as AreaChart } from './next';\n`,
    './next',
    EXPECTED_NAMES,
  );

  assert.deepEqual(problems, ['the door binds AreaChart itself: export { BarChart as AreaChart } from "./next"']);
});

test('planted negative: a door link that re-publishes a family as a type, a local or a namespace', () => {
  const problems = inspectDoorLink(
    ts,
    'link.ts',
    `${LINK}export type { AreaChart } from './next';\nexport const BarChart = null;\nexport * as PieChart from './next';\n`,
    './next',
    EXPECTED_NAMES,
  );

  assert.deepEqual(problems, [
    'the door binds AreaChart itself: export { AreaChart } from "./next"',
    'the door binds BarChart itself: exported local declaration',
    'the door binds PieChart itself: namespace re-export',
  ]);
});

test('planted negative: a door link that drops, duplicates or type-narrows its export-star', () => {
  const dropped = "export * from './sibling';\n";
  const typed = "export type * from './next';\n";
  const twice = "export * from './next';\nexport * from './next';\n";
  const named = `export { ${CANONICAL.join(', ')} } from './next';\n`;

  assert.deepEqual(inspectDoorLink(ts, 'link.ts', dropped, './next', EXPECTED_NAMES),
    ['expected exactly 1 value export-star from "./next", found 0']);
  assert.deepEqual(inspectDoorLink(ts, 'link.ts', typed, './next', EXPECTED_NAMES),
    ['expected exactly 1 value export-star from "./next", found 0']);
  assert.deepEqual(inspectDoorLink(ts, 'link.ts', twice, './next', EXPECTED_NAMES),
    ['expected exactly 1 value export-star from "./next", found 2']);
  assert.equal(inspectDoorLink(ts, 'link.ts', named, './next', EXPECTED_NAMES).length, EXPECTED_EXPORT_COUNT + 1);
});

test('control: the synthetic well-formed facade passes the same detector', () => {
  // Proves the canaries fail for the reason claimed and not because the
  // synthetic-source path is broken in general.
  const { problems, names } = inspectChartFacade(ts, 'fixture.ts', facadeSource(CANONICAL), EXPECTED_NAMES);

  assert.deepEqual(problems, []);
  assert.deepEqual([...names].sort(), CANONICAL);
});
