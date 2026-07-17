import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const designSystemRoot = path.resolve(scriptDirectory, '../../..');
const workspaceRoot = path.dirname(designSystemRoot);
const EXPECTED_SCREEN_FACTORIES = Object.freeze({
  'app-platform': [],
  'app-evnto': [
    'createBarDashboardConfig',
    'createControlRoomConfig',
    'createInventoryDashboardConfig',
    'createProductDetailConfig',
    'createSchedulingCalendarConfig',
    'createSettingsConfig',
    'createStaffCommandConfig',
    'createStaffDetailConfig',
  ],
});

async function sourceFiles(root) {
  const files = [];
  async function visit(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) await visit(absolute);
      else if (/\.(?:ts|tsx)$/.test(entry.name) && !entry.name.endsWith('.d.ts')) {
        files.push({ absolute, relative: path.relative(root, absolute).split(path.sep).join('/') });
      }
    }
  }
  await visit(root);
  return files;
}

function hasExportModifier(node) {
  return node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ?? false;
}

function collectScreenFactories(parsedFiles) {
  const definitions = [];
  for (const file of parsedFiles) {
    if (!file.relative.includes('/screens/') || /(?:^|\/)__tests__(?:\/|$)|\.(?:test|spec)\./.test(file.relative)) {
      continue;
    }
    const localDefinitions = new Map();
    for (const statement of file.source.statements) {
      if (ts.isFunctionDeclaration(statement) && statement.name && hasExportModifier(statement)) {
        if (/^create[A-Z][A-Za-z0-9]*Config$/.test(statement.name.text)) {
          definitions.push({ name: statement.name.text, localName: statement.name.text, source: file.relative });
        }
      }
      if (ts.isFunctionDeclaration(statement) && statement.name) {
        localDefinitions.set(statement.name.text, statement.name.text);
      }
      if (ts.isVariableStatement(statement)) {
        for (const declaration of statement.declarationList.declarations) {
          if (!ts.isIdentifier(declaration.name)) continue;
          localDefinitions.set(declaration.name.text, declaration.name.text);
          if (hasExportModifier(statement) && /^create[A-Z][A-Za-z0-9]*Config$/.test(declaration.name.text)) {
            definitions.push({ name: declaration.name.text, localName: declaration.name.text, source: file.relative });
          }
        }
      }
    }
    for (const statement of file.source.statements) {
      if (!ts.isExportDeclaration(statement) || statement.moduleSpecifier || !statement.exportClause) continue;
      if (!ts.isNamedExports(statement.exportClause)) continue;
      for (const element of statement.exportClause.elements) {
        const exportedName = element.name.text;
        const localName = element.propertyName?.text ?? exportedName;
        if (/^create[A-Z][A-Za-z0-9]*Config$/.test(exportedName) && localDefinitions.has(localName)) {
          definitions.push({ name: exportedName, localName, source: file.relative });
        }
      }
    }
  }
  return definitions.sort((left, right) => left.name.localeCompare(right.name));
}

function callSites(parsedFiles, factory) {
  const sites = [];
  const byAbsolute = new Map(parsedFiles.map((file) => [path.normalize(file.absolute), file]));
  for (const file of parsedFiles) {
    if (/(?:^|\/)__tests__(?:\/|$)|\.(?:test|spec|stories)\./.test(file.relative)) continue;
    const aliases = new Set();
    const namespaces = new Set();

    if (file.relative === factory.source) aliases.add(factory.localName);
    for (const statement of file.source.statements) {
      if (!ts.isImportDeclaration(statement) || !statement.importClause?.namedBindings) continue;
      if (!ts.isStringLiteralLike(statement.moduleSpecifier) || !statement.moduleSpecifier.text.startsWith('.')) {
        continue;
      }
      const target = resolveRelativeModule(file.absolute, statement.moduleSpecifier.text)
        .map((candidate) => byAbsolute.get(path.normalize(candidate)))
        .find(Boolean);
      if (target?.relative !== factory.source) continue;

      const bindings = statement.importClause.namedBindings;
      if (ts.isNamedImports(bindings)) {
        for (const element of bindings.elements) {
          if ((element.propertyName?.text ?? element.name.text) === factory.name) {
            aliases.add(element.name.text);
          }
        }
      } else if (ts.isNamespaceImport(bindings)) {
        namespaces.add(bindings.name.text);
      }
    }

    let changed = true;
    while (changed) {
      changed = false;
      for (const statement of file.source.statements) {
        if (!ts.isVariableStatement(statement)) continue;
        for (const declaration of statement.declarationList.declarations) {
          if (
            ts.isIdentifier(declaration.name) &&
            declaration.initializer &&
            ts.isIdentifier(declaration.initializer) &&
            aliases.has(declaration.initializer.text) &&
            !aliases.has(declaration.name.text)
          ) {
            aliases.add(declaration.name.text);
            changed = true;
          }
        }
      }
    }

    function visit(node) {
      const isDirectAlias = ts.isCallExpression(node) && ts.isIdentifier(node.expression) && aliases.has(node.expression.text);
      const isNamespaceAlias =
        ts.isCallExpression(node) &&
        ts.isPropertyAccessExpression(node.expression) &&
        ts.isIdentifier(node.expression.expression) &&
        namespaces.has(node.expression.expression.text) &&
        node.expression.name.text === factory.name;
      if (isDirectAlias || isNamespaceAlias) {
        const position = file.source.getLineAndCharacterOfPosition(node.getStart(file.source));
        sites.push(`${file.relative}:${position.line + 1}`);
      }
      ts.forEachChild(node, visit);
    }
    visit(file.source);
  }
  return sites;
}

function parseFixture(relative, sourceText) {
  return {
    absolute: path.join('/fixture', relative),
    relative,
    source: ts.createSourceFile(relative, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS),
  };
}

test('factory drain catches indirect exports, const factories, and aliased productive calls', () => {
  const indirect = parseFixture(
    'features/example/screens/config.ts',
    'const build = () => ({}); export { build as createAliasConfig };',
  );
  const deadConst = parseFixture(
    'features/example/screens/dead.ts',
    'export const createDeadConfig = () => ({});',
  );
  const caller = parseFixture(
    'features/example/screens/index.ts',
    "import { createAliasConfig as makeConfig } from './config'; makeConfig();",
  );
  const collision = parseFixture(
    'features/unrelated/screens/index.ts',
    'const makeConfig = () => ({}); makeConfig();',
  );
  const parsed = [indirect, deadConst, caller, collision];
  const factories = collectScreenFactories(parsed);

  assert.deepEqual(factories.map(({ name, localName }) => ({ name, localName })), [
    { name: 'createAliasConfig', localName: 'build' },
    { name: 'createDeadConfig', localName: 'createDeadConfig' },
  ]);
  assert.equal(callSites(parsed, factories[0]).length, 1);
  assert.equal(callSites(parsed, factories[1]).length, 0);
});

function resolveRelativeModule(sourcePath, specifier) {
  const base = path.resolve(path.dirname(sourcePath), specifier);
  return [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    `${base}.jsx`,
    `${base}.mjs`,
    `${base}.cjs`,
    path.join(base, 'index.ts'),
    path.join(base, 'index.tsx'),
    path.join(base, 'index.js'),
    path.join(base, 'index.mjs'),
  ];
}

test('Platform and Evnto have no dead screen config factories or dangling relative modules', async () => {
  for (const [app, expected] of Object.entries(EXPECTED_SCREEN_FACTORIES)) {
    const root = path.join(workspaceRoot, app, 'src');
    const files = await sourceFiles(root);
    const parsedFiles = await Promise.all(files.map(async (file) => ({
      ...file,
      source: ts.createSourceFile(
        file.relative,
        await readFile(file.absolute, 'utf8'),
        ts.ScriptTarget.Latest,
        true,
        file.relative.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
      ),
    })));
    const factories = collectScreenFactories(parsedFiles);
    assert.deepEqual(factories.map((factory) => factory.name), expected, `${app} screen factory inventory drift`);
    for (const factory of factories) {
      assert.ok(callSites(parsedFiles, factory).length > 0, `${app}:${factory.name} has no production call site`);
    }

    const dangling = [];
    for (const file of parsedFiles) {
      for (const statement of file.source.statements) {
        const moduleSpecifier =
          (ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement)) &&
          statement.moduleSpecifier &&
          ts.isStringLiteralLike(statement.moduleSpecifier)
            ? statement.moduleSpecifier.text
            : undefined;
        if (!moduleSpecifier?.startsWith('.')) continue;
        const candidates = resolveRelativeModule(file.absolute, moduleSpecifier);
        if (!candidates.some((candidate) => existsSync(candidate))) {
          dangling.push(`${file.relative} -> ${moduleSpecifier}`);
        }
      }
    }
    assert.deepEqual(dangling, [], `${app} has dangling relative TypeScript modules`);
  }
});
