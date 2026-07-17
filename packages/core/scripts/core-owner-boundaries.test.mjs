import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
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

test('OnboardingSurface stays public through the forms owner, not experience', () => {
  const experience = parse('ui/surfaces/presentation/pages/experience/index.ts');
  assert(
    moduleSpecifiers(experience).every((specifier) => specifier.startsWith('./')),
    'experience barrel must not reach across page-domain owners',
  );

  assertStarExport(
    'ui/surfaces/presentation/pages/forms/index.ts',
    './wizard/onboarding',
  );
  assertStarExport('ui/surfaces/presentation/pages/index.ts', './forms');
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
