// Node unit test (no browser) pinning the showroom's studio drafts to the
// governed transport (WO-DER-08).
//
// A studio draft travels as the governed `Theme`. `FlatTheme` is the lowering's
// READ VIEW -- the shape the editor reads leaf by leaf -- and never the shape a
// draft is authored, stored or serialized as. The two pages here are the DS's
// own reference studio consumers, so as long as either one authored its draft
// as a flat literal the contract's sentence ("no productive owner returns it as
// an authored draft") was true of the package and false of the tree.
//
// Two claims, and the second is the one that makes the first safe:
//   1. SOURCE  -- neither page names the flat type, each builds its draft
//      through the published `governedTenantTheme` lift, and the editable one
//      holds `Theme` in state (no union with the read view).
//   2. BEHAVIOR -- the migrated draft compiles to exactly what the flat literal
//      compiled to, through the same door the studio itself uses, including the
//      refusal the page's own values produce. A file written by the superseded
//      flat writer still imports onto those same bytes, which is the migration
//      path for drafts exported before the move.
//
// The literals are EXTRACTED from the page sources rather than copied here, so
// this measures the drafts the pages actually ship.
//
// Run: node --test packages/showroom/e2e/diagnostics/studio-draft-transport.unit.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

import {
  compileThemeIntent,
  containerScope,
  deserializeThemeDraft,
  draftPreviewThemeIntent,
  emitThemeCss,
  governedTenantTheme,
  readThemeDraft,
  serializeFlatTheme,
  serializeThemeDraft,
  ThemeAdmissionError,
} from '@rottay/design-system';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '../..');

/** Every showroom page that hands a draft to `PatternBrandStudio`. */
const STUDIO_PAGES = [
  {
    label: 'playground/theme-builder',
    path: 'src/app/(docs)/playground/theme-builder/page.tsx',
    draft: 'INITIAL_BRAND_THEME',
    // The editable page: it holds the draft in state and receives `onChange`.
    stateful: true,
  },
  {
    label: 'probe/brand-studio',
    path: 'src/app/probe/brand-studio/page.tsx',
    draft: 'CAPTURE_BRAND_THEME',
    stateful: false,
  },
];

function parse(relativePath) {
  const absolute = join(ROOT, relativePath);
  const source = readFileSync(absolute, 'utf8');
  return {
    source,
    sourceFile: ts.createSourceFile(absolute, source, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TSX),
  };
}

function collect(node, predicate, found = []) {
  if (predicate(node)) found.push(node);
  // Block body on purpose: `forEachChild` stops at the first truthy return, so
  // returning the accumulator here would visit exactly one child.
  node.forEachChild((child) => {
    collect(child, predicate, found);
  });
  return found;
}

function variableDeclarationsNamed(sourceFile, name) {
  return collect(
    sourceFile,
    (n) => ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.name.text === name,
  );
}

function importsFrom(sourceFile, moduleSpecifier) {
  return collect(
    sourceFile,
    (n) =>
      ts.isImportDeclaration(n) &&
      ts.isStringLiteral(n.moduleSpecifier) &&
      n.moduleSpecifier.text === moduleSpecifier,
  );
}

function namedBindings(importDeclaration) {
  const named = importDeclaration.importClause?.namedBindings;
  if (!named || !ts.isNamedImports(named)) return [];
  return named.elements.map((element) => element.name.text);
}

/** The object literal a `governedTenantTheme(...)` call lifts, as live data. */
function liftedLiteral(sourceFile, draftName) {
  const declarations = variableDeclarationsNamed(sourceFile, draftName);
  assert.equal(declarations.length, 1, `expected exactly 1 declaration of ${draftName}`);
  const [declaration] = declarations;
  const initializer = declaration.initializer;
  assert.ok(
    initializer && ts.isCallExpression(initializer) && ts.isIdentifier(initializer.expression),
    `${draftName} must be initialized by a call expression`,
  );
  assert.equal(
    initializer.expression.text,
    'governedTenantTheme',
    `${draftName} must be built through the published governed lift`,
  );
  assert.equal(initializer.arguments.length, 1, 'the lift takes exactly one draft');
  const [argument] = initializer.arguments;
  assert.ok(ts.isObjectLiteralExpression(argument), 'the lift takes an object literal');
  // The literal is pure data (no identifiers, no calls), so it evaluates as
  // written. That is what makes this test measure the shipped draft.
  const evaluate = new Function(`return (${argument.getText(sourceFile)});`);
  return { declaration, value: evaluate() };
}

/** The families the door's discriminant reads as governed wrappers. */
const GOVERNED_FAMILIES = ['motion', 'charts', 'recipes', 'expressive', 'responsive'];

const SCOPE = containerScope('ds-studio-transport-probe');
const SLUG = 'studio-draft';
const VERTICAL = 'bithire';

/**
 * What the studio's own compile path produces for a draft: the emitted CSS, or
 * the door's named refusal. `PatternBrandStudio` reads every draft through
 * `readThemeDraft` and compiles through `draftPreviewThemeIntent`, and catches
 * `ThemeAdmissionError` so a refused draft still renders -- so a refusal is an
 * OUTCOME here, not a test failure.
 */
function outcome(draft) {
  try {
    const intent = draftPreviewThemeIntent({
      vertical: VERTICAL,
      slug: SLUG,
      draft: readThemeDraft(draft),
    });
    return `css:${emitThemeCss(compileThemeIntent(intent).compiled, SCOPE)}`;
  } catch (error) {
    if (!(error instanceof ThemeAdmissionError)) throw error;
    return `refused:${error.message}`;
  }
}

/** The same draft with the one dial its vertical envelope refuses removed. */
function admissible(flat) {
  const surfaces = { ...(flat.surfaces ?? {}) };
  delete surfaces.effectIntensity;
  return { ...flat, surfaces };
}

for (const page of STUDIO_PAGES) {
  test(`${page.label}: the draft names no flat type`, () => {
    const { source } = parse(page.path);
    assert.equal(
      /\bFlatTheme\b/u.test(source),
      false,
      'a studio draft must not name the lowering read view anywhere in the page',
    );
  });

  test(`${page.label}: the draft is a governed Theme built through the published lift`, () => {
    const { sourceFile } = parse(page.path);
    const { declaration } = liftedLiteral(sourceFile, page.draft);

    assert.ok(declaration.type && ts.isTypeReferenceNode(declaration.type), 'the draft is annotated');
    assert.equal(
      declaration.type.typeName.getText(sourceFile),
      'Theme',
      `${page.draft} must be typed as the governed Theme`,
    );

    const rootImports = importsFrom(sourceFile, '@rottay/design-system');
    assert.ok(
      rootImports.some((declaration) => namedBindings(declaration).includes('governedTenantTheme')),
      'the lift comes from the package root, not a deep import',
    );
    const serverImports = importsFrom(sourceFile, '@rottay/design-system/server');
    assert.ok(
      serverImports.some(
        (declaration) =>
          declaration.importClause?.isTypeOnly && namedBindings(declaration).includes('Theme'),
      ),
      'Theme is imported as a type from the server entry',
    );
  });

  test(`${page.label}: the lift yields a governed draft the studio does not lift again`, () => {
    const { sourceFile } = parse(page.path);
    const { value } = liftedLiteral(sourceFile, page.draft);
    const governed = governedTenantTheme(value);

    // Every governed family carries the wrapper the door discriminates on, so
    // `readThemeDraft` -- the studio's single reader -- passes it through by
    // identity instead of taking the superseded flat arm.
    for (const family of GOVERNED_FAMILIES) {
      const slot = governed[family];
      assert.ok(slot && typeof slot === 'object', `${family} is a governed slot`);
      assert.ok(
        'value' in slot || 'disposition' in slot,
        `${family} carries the governed wrapper`,
      );
    }
    assert.equal(readThemeDraft(governed), governed, 'a governed draft passes through unlifted');
  });

  test(`${page.label}: the migration preserves the compiled outcome exactly`, () => {
    const { sourceFile } = parse(page.path);
    const { value } = liftedLiteral(sourceFile, page.draft);

    // The flat literal IS the pre-migration transport: this equality is the
    // claim that the page renders what it rendered before the move, refusal
    // included.
    assert.equal(outcome(governedTenantTheme(value)), outcome(value));

    // ... and the equality is not vacuous on a refusal: with the one dial the
    // bithire envelope refuses removed, the same pair agrees on real bytes
    // carrying the draft's own authored colour.
    const open = admissible(value);
    const compiled = outcome(governedTenantTheme(open));
    assert.equal(compiled, outcome(open));
    assert.ok(compiled.startsWith('css:'), 'the admissible variant compiles');
    assert.ok(
      compiled.toLowerCase().includes(value.palette.primaryColor.toLowerCase()),
      'the emitted block carries the draft primary colour',
    );
  });

  test(`${page.label}: the draft round-trips through the governed file export`, () => {
    const { sourceFile } = parse(page.path);
    const { value } = liftedLiteral(sourceFile, page.draft);
    const open = admissible(value);
    const governed = governedTenantTheme(open);
    const expected = outcome(governed);

    const written = serializeThemeDraft(governed);
    const restored = deserializeThemeDraft(written);
    // The equality is on what a FILE carries, not on in-memory key presence:
    // JSON drops the `undefined` half of every governed wrapper, so the file is
    // a fixed point -- writing the draft read back yields the same bytes --
    // and the wrapper vocabulary the door discriminates on survives the trip.
    assert.equal(serializeThemeDraft(restored), written, 'the governed file is a fixed point');
    const onDisk = JSON.parse(written);
    for (const family of GOVERNED_FAMILIES) {
      const keys = Object.keys(onDisk[family] ?? {});
      assert.ok(keys.length > 0, `${family} keeps a governed key on disk`);
      assert.ok(
        keys.every((key) => key === 'value' || key === 'disposition'),
        `${family} carries only the wrapper vocabulary on disk`,
      );
    }
    assert.equal(outcome(restored), expected);

    // The migration path: a file written by the SUPERSEDED flat writer -- every
    // draft exported before this move -- still imports through the same reader
    // and lands on the same bytes.
    const fromFlatFile = deserializeThemeDraft(serializeFlatTheme(open));
    assert.equal(outcome(fromFlatFile), expected);

    // Negative control: one moved leaf moves the bytes, so the equalities above
    // cannot be an artifact of the emitter ignoring the draft.
    const moved = governedTenantTheme({
      ...open,
      palette: { ...open.palette, primaryColor: '#123456' },
    });
    assert.notEqual(outcome(moved), expected);
  });
}

const STATEFUL_PAGE = STUDIO_PAGES.find((page) => page.stateful);

test(`${STATEFUL_PAGE.label}: the draft is held in state as the governed Theme`, () => {
  const { sourceFile } = parse(STATEFUL_PAGE.path);
  const useStateCalls = collect(
    sourceFile,
    (n) => ts.isCallExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === 'useState',
  );
  assert.equal(useStateCalls.length, 1, 'exactly one useState holds the draft');
  const [call] = useStateCalls;
  assert.equal(call.typeArguments?.length, 1, 'the state names exactly one type');
  const [stateType] = call.typeArguments;
  assert.ok(ts.isTypeReferenceNode(stateType), 'the state type is not a union');
  assert.equal(
    stateType.typeName.getText(sourceFile),
    'Theme',
    'the state is the governed Theme, never a union with the read view',
  );
  assert.ok(
    ts.isIdentifier(call.arguments[0]) && call.arguments[0].text === STATEFUL_PAGE.draft,
    'the state is seeded with the lifted draft',
  );
});
