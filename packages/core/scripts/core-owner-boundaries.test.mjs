import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

const SCRIPT_DIRECTORY = dirname(fileURLToPath(import.meta.url));
const SOURCE_ROOT = resolve(SCRIPT_DIRECTORY, '../src');

function parse(relativePath) {
  const path = resolve(SOURCE_ROOT, relativePath);
  return ts.createSourceFile(
    path,
    readFileSync(path, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    relativePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
}

function exportedNames(sourceFile, moduleSpecifier) {
  const names = new Set();
  for (const statement of sourceFile.statements) {
    if (!ts.isExportDeclaration(statement)) continue;
    if (!statement.moduleSpecifier || !ts.isStringLiteralLike(statement.moduleSpecifier)) continue;
    if (statement.moduleSpecifier.text !== moduleSpecifier) continue;
    if (!statement.exportClause || !ts.isNamedExports(statement.exportClause)) continue;
    for (const element of statement.exportClause.elements) names.add(element.name.text);
  }
  return names;
}

function moduleSpecifiers(sourceFile) {
  return sourceFile.statements
    .filter((statement) => ts.isExportDeclaration(statement))
    .map((statement) => statement.moduleSpecifier)
    .filter((specifier) => specifier && ts.isStringLiteralLike(specifier))
    .map((specifier) => specifier.text);
}

function assertStarExport(relativePath, moduleSpecifier) {
  const sourceFile = parse(relativePath);
  assert(
    sourceFile.statements.some((statement) => (
      ts.isExportDeclaration(statement)
      && statement.exportClause === undefined
      && statement.moduleSpecifier
      && ts.isStringLiteralLike(statement.moduleSpecifier)
      && statement.moduleSpecifier.text === moduleSpecifier
    )),
    `${relativePath} must preserve the root export chain through ${moduleSpecifier}`,
  );
}

test('Collapse owns its public token hook without an infrastructure-to-UI re-export', () => {
  const expectedNames = [
    'UseCollapseTokensOptions',
    'UseCollapseTokensResult',
    'useCollapseTokens',
  ];
  const collapseOwner = parse('ui/primitives/layout/Collapse/index.ts');
  const layoutOwner = parse('ui/primitives/layout/index.ts');

  for (const name of expectedNames) {
    assert(
      exportedNames(collapseOwner, './runtime/tokens').has(name),
      `Collapse owner must export ${name}`,
    );
    assert(
      exportedNames(layoutOwner, './Collapse').has(name),
      `layout owner must forward ${name}`,
    );
  }

  const hookFacade = parse('infrastructure/runtime/facade/react-hooks/index.ts');
  const facadeText = hookFacade.getFullText();
  assert(!facadeText.includes('useCollapseTokens'));
  assert(
    moduleSpecifiers(hookFacade).every((specifier) => !specifier.includes('/ui/')),
    'infrastructure hook facade must not re-export UI owners',
  );

  assertStarExport('ui/primitives/index.ts', './layout');
  assertStarExport('ui/index.ts', './primitives');
  assertStarExport('index.ts', './ui');
});

test('onboarding stays a WizardSurface configuration, not a second authored surface owner', () => {
  const experience = parse('ui/surfaces/presentation/pages/experience/index.ts');
  const experienceSpecifiers = moduleSpecifiers(experience);
  assert(
    experienceSpecifiers.every((specifier) => specifier.startsWith('./')),
    'experience barrel must not reach across page-domain owners',
  );
  assert(
    experienceSpecifiers.every((specifier) => !specifier.split('/').includes('onboarding')),
    'experience barrel must not appropriate onboarding as a page-domain owner',
  );

  assertStarExport('ui/surfaces/presentation/pages/forms/index.ts', './wizard');
  assertStarExport('ui/surfaces/presentation/pages/index.ts', './forms');

  assert.equal(
    existsSync(resolve(SOURCE_ROOT, 'ui/surfaces/presentation/pages/forms/wizard/onboarding')),
    false,
    'onboarding must not exist as an authored owner below the wizard surface',
  );

  const forms = parse('ui/surfaces/presentation/pages/forms/index.ts');
  assert(
    moduleSpecifiers(forms).every((specifier) => !specifier.includes('onboarding')),
    'forms barrel must not re-export an onboarding owner',
  );
});

test('retired collection-workspace editorial kit barrel stays deleted', () => {
  assert.equal(
    existsSync(resolve(SOURCE_ROOT, 'ui/structures/_kits/collection-workspace/index.ts')),
    false,
  );
});

test('WithChildrenProps remains an alias of the canonical WithChildren contract', () => {
  const sourceFile = parse('foundation/contracts/composition/components/index.ts');
  const aliases = sourceFile.statements.filter((statement) => (
    ts.isTypeAliasDeclaration(statement) && statement.name.text === 'WithChildrenProps'
  ));
  const duplicateInterfaces = sourceFile.statements.filter((statement) => (
    ts.isInterfaceDeclaration(statement) && statement.name.text === 'WithChildrenProps'
  ));

  assert.equal(duplicateInterfaces.length, 0);
  assert.equal(aliases.length, 1);
  assert(ts.isTypeReferenceNode(aliases[0].type));
  assert(ts.isIdentifier(aliases[0].type.typeName));
  assert.equal(aliases[0].type.typeName.text, 'WithChildren');

  const importsCanonicalType = sourceFile.statements.some((statement) => (
    ts.isImportDeclaration(statement)
    && statement.moduleSpecifier
    && ts.isStringLiteralLike(statement.moduleSpecifier)
    && statement.moduleSpecifier.text === '../../kernel/common'
    && statement.importClause?.isTypeOnly
    && statement.importClause.namedBindings
    && ts.isNamedImports(statement.importClause.namedBindings)
    && statement.importClause.namedBindings.elements.some((element) => element.name.text === 'WithChildren')
  ));
  assert(importsCanonicalType, 'WithChildrenProps must alias kernel/common.WithChildren');
});

function importSpecifiers(sourceFile) {
  return sourceFile.statements
    .filter((statement) => ts.isImportDeclaration(statement))
    .map((statement) => statement.moduleSpecifier)
    .filter((specifier) => specifier && ts.isStringLiteralLike(specifier))
    .map((specifier) => specifier.text);
}

function resolveSourceModule(importerRelativePath, specifier) {
  let base;
  if (specifier.startsWith('.')) {
    base = resolve(dirname(resolve(SOURCE_ROOT, importerRelativePath)), specifier);
  } else if (specifier.startsWith('@/')) {
    base = resolve(SOURCE_ROOT, specifier.slice(2));
  } else {
    return null;
  }
  const candidates = ['.ts', '.tsx']
    .map((extension) => [`${base}${extension}`, `${base}/index${extension}`])
    .flat();
  const found = candidates.find((candidate) => existsSync(candidate));
  return found ? relative(SOURCE_ROOT, found).split(sep).join('/') : null;
}

/** Fail-closed barrel shape: named export clauses only; star/namespace exports are rejected. */
function isNamedOnlyBarrel(sourceFile) {
  return sourceFile.statements.length > 0 && sourceFile.statements.every((statement) => (
    ts.isExportDeclaration(statement)
    && statement.exportClause !== undefined
    && ts.isNamedExports(statement.exportClause)
  ));
}

/** Parses in-memory source text; fixtures never touch the real tree. */
function parseText(fileName, text) {
  return ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

test('root-attributes seam: one registry leaf, a consuming presentation leaf, a pure facade, narrow claimants', () => {
  const FAMILY = 'infrastructure/runtime/foundation/root-attributes';
  const FACADE = `${FAMILY}/index.ts`;
  const REGISTRY_LEAF = `${FAMILY}/registry/index.ts`;
  const PRESENTATION_LEAF = `${FAMILY}/presentation/index.ts`;

  // (a) The ownership leaf imports and re-exports nothing: one WeakMap, one
  // claimChannel, zero module specifiers.
  const registry = parse(REGISTRY_LEAF);
  assert.deepEqual(moduleSpecifiers(registry), [], 'registry leaf must re-export no module');
  assert.deepEqual(importSpecifiers(registry), [], 'registry leaf must import no module');

  // (b) The presentation leaf's ONLY module edge is the registry leaf.
  const presentation = parse(PRESENTATION_LEAF);
  assert.deepEqual(moduleSpecifiers(presentation), [], 'presentation leaf must re-export no module');
  assert.deepEqual(
    importSpecifiers(presentation),
    ['../registry'],
    'presentation leaf must import only ../registry',
  );

  // (c) The facade is a pure barrel over exactly the two leaves, carrying the
  // exact 8-name surface: 6 values + 2 types, nothing more, nothing less.
  const facade = parse(FACADE);
  assert(
    isNamedOnlyBarrel(facade),
    'root-attributes facade must be a pure barrel of NAMED exports (no export *)',
  );

  // The named-only check must BITE: in-memory fixtures (no tree mutation)
  // prove star/namespace exports are rejected while the named shape passes.
  assert(
    !isNamedOnlyBarrel(parseText('star-registry.fixture.ts', "export * from './registry';\n")),
    'a star export from ./registry must be rejected',
  );
  assert(
    !isNamedOnlyBarrel(parseText('star-presentation.fixture.ts', "export * from './presentation';\n")),
    'a star export from ./presentation must be rejected',
  );
  assert(
    !isNamedOnlyBarrel(parseText('namespace.fixture.ts', "export * as registry from './registry';\n")),
    'a namespace export must be rejected',
  );
  assert(
    isNamedOnlyBarrel(parseText('named.fixture.ts', "export { claimRootAttribute } from './registry';\n")),
    'a named re-export must pass',
  );
  assert.deepEqual(
    [...new Set(moduleSpecifiers(facade))].sort(),
    ['./presentation', './registry'],
    'root-attributes facade must barrel exactly ./registry and ./presentation',
  );
  const facadeNames = new Set([
    ...exportedNames(facade, './registry'),
    ...exportedNames(facade, './presentation'),
  ]);
  assert.deepEqual(
    [...facadeNames].sort(),
    [
      'ReleaseRootAttribute',
      'RootAttributeSetClaim',
      'claimRootAttribute',
      'claimRootAttributeSet',
      'claimRootClass',
      'claimRootStyleProperty',
      'composeRootAttributeReleases',
      'outstandingRootClaims',
    ],
    'root-attributes facade must carry the exact 8-name surface',
  );

  // (d) The public wrapper draws from ONE source, the registry leaf.
  const wrapper = parse('entrypoints/public/runtime/root-attributes/index.ts');
  const wrapperSpecifiers = [...moduleSpecifiers(wrapper), ...importSpecifiers(wrapper)];
  assert.equal(wrapperSpecifiers.length, 1, 'public root-attributes wrapper must have exactly one specifier');
  assert.equal(
    resolveSourceModule('entrypoints/public/runtime/root-attributes/index.ts', wrapperSpecifiers[0]),
    REGISTRY_LEAF,
    'public root-attributes wrapper must resolve to the registry leaf',
  );

  // (e) Attribute-only claimants narrow to the registry leaf; theming, the one
  // style/class consumer, draws from both leaves and never from the facade.
  const attributeOnlyClaimants = [
    'infrastructure/runtime/i18n/runtime/context/provider/index.tsx',
    'infrastructure/runtime/tenant/composition/react/provider/index.tsx',
    'infrastructure/runtime/engines/composition/react/provider/index.tsx',
  ];
  for (const claimant of attributeOnlyClaimants) {
    const targets = importSpecifiers(parse(claimant))
      .filter((specifier) => specifier.includes('root-attributes'))
      .map((specifier) => resolveSourceModule(claimant, specifier));
    assert(
      targets.length > 0 && targets.every((target) => target === REGISTRY_LEAF),
      `${claimant} must claim attributes from the registry leaf only`,
    );
  }
  const theming = 'infrastructure/runtime/theming/composition/react/provider/index.tsx';
  const themingTargets = importSpecifiers(parse(theming))
    .filter((specifier) => specifier.includes('root-attributes'))
    .map((specifier) => resolveSourceModule(theming, specifier));
  assert.deepEqual(
    themingTargets.slice().sort(),
    [PRESENTATION_LEAF, REGISTRY_LEAF].sort(),
    'theming provider must import the registry and presentation leaves directly',
  );
  assert(
    !themingTargets.includes(FACADE),
    'theming provider must not import the root-attributes facade',
  );
});
