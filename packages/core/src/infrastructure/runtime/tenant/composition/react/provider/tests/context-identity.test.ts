/**
 * @fileoverview The tenant Context has exactly one identity and one owner.
 *
 * Three entrypoints expose the same Context object: the leaf owner
 * (`tenant/foundation/context`), the provider that publishes through it, and
 * the tenant facade that re-exports it. A leaf renderer that only needs
 * `useContext` must be able to reach the identity WITHOUT importing the
 * facade -- the facade drags provider validation, root-attribute claiming,
 * the first-party registry and the whole tenant resolution graph behind it.
 *
 * Identity equality alone cannot detect a reverted import, because the facade
 * re-exports the very same object. The drills below therefore parse every
 * production source with the TypeScript AST: the singleton-owner gate counts
 * only `createContext` calls bound to the react import, and the consumer
 * inventory is DISCOVERED from real ImportDeclarations, then compared against
 * the exact registered set -- a seventh consumer, or a specifier reverted to
 * provider or facade, fails the comparison.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import React from 'react';
import { render } from '@testing-library/react';
import * as ts from 'typescript';
import { afterEach, describe, expect, it } from 'vitest';

import type { TenantConfig, TenantContextValue } from '@/foundation/contracts';
import {
  TenantContext as leafContext,
  useTenantContext as leafUseTenantContext,
} from '../../../../foundation/context';
import {
  TenantContext as providerContext,
  useTenantContext as providerUseTenantContext,
  TenantProvider,
} from '..';
import {
  TenantContext as facadeContext,
  useTenantContext as facadeUseTenantContext,
} from '../../../..';

const here = dirname(fileURLToPath(import.meta.url));
// tests -> provider -> react -> composition -> tenant -> runtime -> infrastructure -> src
const srcRoot = resolve(here, '../../../../../../..');

function readSource(relativeToSrc: string): string {
  return readFileSync(join(srcRoot, relativeToSrc), 'utf8');
}

function tsFilesUnder(directory: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      found.push(...tsFilesUnder(path));
    } else if (/\.tsx?$/.test(entry.name)) {
      found.push(path);
    }
  }
  return found;
}

function parseSource(fileName: string, sourceText: string): ts.SourceFile {
  return ts.createSourceFile(
    fileName,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    fileName.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
}

function bindingNamesOf(name: ts.BindingName, out: Set<string>): void {
  if (ts.isIdentifier(name)) {
    out.add(name.text);
    return;
  }
  for (const element of name.elements) {
    if (!ts.isOmittedExpression(element)) bindingNamesOf(element.name, out);
  }
}

function isFunctionLikeNode(node: ts.Node): node is ts.FunctionLikeDeclaration {
  return (
    ts.isFunctionDeclaration(node) ||
    ts.isFunctionExpression(node) ||
    ts.isArrowFunction(node) ||
    ts.isMethodDeclaration(node) ||
    ts.isConstructorDeclaration(node) ||
    ts.isGetAccessorDeclaration(node) ||
    ts.isSetAccessorDeclaration(node)
  );
}

/**
 * A `var` list carries neither the Let nor the Const flag; there is no
 * NodeFlags.Var member.
 */
function isVarList(list: ts.VariableDeclarationList): boolean {
  return (ts.getCombinedNodeFlags(list) & (ts.NodeFlags.Let | ts.NodeFlags.Const)) === 0;
}

/**
 * Every `var` binding name hoisted to `root`'s own frame. The walk stops at
 * nested function-likes because their `var` declarations hoist to their own
 * frame instead.
 */
function hoistedVarNames(root: ts.Node, out: Set<string>): void {
  const walk = (node: ts.Node): void => {
    if (node !== root && isFunctionLikeNode(node)) return;
    if (ts.isVariableDeclarationList(node) && isVarList(node)) {
      for (const decl of node.declarations) bindingNamesOf(decl.name, out);
    }
    ts.forEachChild(node, walk);
  };
  walk(root);
}

/**
 * Lexical (block-scoped) names one statement contributes: let/const bindings
 * plus function and class declarations. `var` statements contribute nothing
 * here -- they hoist to the nearest function or module frame.
 */
function collectLexicalStatementNames(stmt: ts.Statement, out: Set<string>): void {
  if (ts.isVariableStatement(stmt)) {
    if (isVarList(stmt.declarationList)) return;
    for (const decl of stmt.declarationList.declarations) {
      bindingNamesOf(decl.name, out);
    }
  } else if (
    (ts.isFunctionDeclaration(stmt) || ts.isClassDeclaration(stmt)) &&
    stmt.name
  ) {
    out.add(stmt.name.text);
  }
}

/**
 * The names a node binds in its OWN scope, or null when the node opens no
 * scope. Function frames additionally receive every `var` hoisted from their
 * body; blocks, case blocks, catch clauses and for-initializers receive only
 * lexical names.
 */
function scopeNamesFor(node: ts.Node): Set<string> | null {
  if (isFunctionLikeNode(node)) {
    const names = new Set<string>();
    // A function expression's own name is visible only inside its body. A
    // function declaration's name belongs to the enclosing scope, which the
    // lexical collector of the parent block already registers.
    if (ts.isFunctionExpression(node) && node.name) names.add(node.name.text);
    for (const param of node.parameters) bindingNamesOf(param.name, names);
    if (node.body) hoistedVarNames(node.body, names);
    return names;
  }
  if (ts.isBlock(node) || ts.isModuleBlock(node)) {
    const names = new Set<string>();
    for (const stmt of node.statements) {
      collectLexicalStatementNames(stmt, names);
    }
    return names;
  }
  if (ts.isCaseBlock(node)) {
    const names = new Set<string>();
    for (const clause of node.clauses) {
      for (const stmt of clause.statements) {
        collectLexicalStatementNames(stmt, names);
      }
    }
    return names;
  }
  if (ts.isCatchClause(node) && node.variableDeclaration) {
    const names = new Set<string>();
    bindingNamesOf(node.variableDeclaration.name, names);
    return names;
  }
  if (ts.isForStatement(node) || ts.isForInStatement(node) || ts.isForOfStatement(node)) {
    const init = node.initializer;
    if (init && ts.isVariableDeclarationList(init) && !isVarList(init)) {
      const names = new Set<string>();
      for (const decl of init.declarations) bindingNamesOf(decl.name, names);
      return names;
    }
  }
  return null;
}

/**
 * Counts only the `createContext(...)` calls that are REALLY bound to the
 * react package: a named import specifier (local alias included) called
 * directly, or a default/namespace import accessed as `ns.createContext` or
 * `ns['createContext']`. A callee whose name is redeclared in any frame
 * between use and module top -- lexically or by a hoisted `var` -- is
 * shadowed and does not count, so a local `createContext`, a
 * `factory.createContext()` method, a comment, a string, an import or a type
 * reference can never register.
 */
function countCreateContextCalls(sourceText: string, fileName: string): number {
  const sourceFile = parseSource(fileName, sourceText);

  const localBindings = new Set<string>();
  const namespaces = new Set<string>();
  for (const stmt of sourceFile.statements) {
    if (!ts.isImportDeclaration(stmt) || !ts.isStringLiteral(stmt.moduleSpecifier)) continue;
    if (stmt.moduleSpecifier.text !== 'react') continue;
    const clause = stmt.importClause;
    if (!clause) continue;
    // The default export of react IS the module object: `React.createContext`
    // through `import React from 'react'` is the same binding as through a
    // namespace import.
    if (clause.name) namespaces.add(clause.name.text);
    const named = clause.namedBindings;
    if (named && ts.isNamespaceImport(named)) namespaces.add(named.name.text);
    if (named && ts.isNamedImports(named)) {
      for (const element of named.elements) {
        if ((element.propertyName ?? element.name).text === 'createContext') {
          localBindings.add(element.name.text);
        }
      }
    }
  }

  // Frame 0 is the module frame: its top-level lexical names plus every `var`
  // hoisted out of top-level blocks, loops and try/catch. Imports are never
  // placed in frames, so no frame entry can collide with a registered import.
  const moduleFrame = new Set<string>();
  for (const stmt of sourceFile.statements) {
    collectLexicalStatementNames(stmt, moduleFrame);
  }
  hoistedVarNames(sourceFile, moduleFrame);

  let calls = 0;
  const scopeStack: Array<Set<string>> = [moduleFrame];
  const isShadowed = (name: string): boolean => {
    for (let depth = scopeStack.length - 1; depth >= 0; depth--) {
      if (scopeStack[depth].has(name)) return true;
    }
    return false;
  };
  const countsAs = (name: string, registry: Set<string>): boolean =>
    registry.has(name) && !isShadowed(name);

  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node)) {
      const callee = node.expression;
      if (ts.isIdentifier(callee) && countsAs(callee.text, localBindings)) {
        calls += 1;
      } else if (
        (ts.isPropertyAccessExpression(callee) || ts.isElementAccessExpression(callee)) &&
        ts.isIdentifier(callee.expression) &&
        countsAs(callee.expression.text, namespaces) &&
        ((ts.isPropertyAccessExpression(callee) && callee.name.text === 'createContext') ||
          (ts.isElementAccessExpression(callee) &&
            ts.isStringLiteral(callee.argumentExpression) &&
            callee.argumentExpression.text === 'createContext'))
      ) {
        calls += 1;
      }
    }
    const scope = scopeNamesFor(node);
    if (scope !== null) {
      scopeStack.push(scope);
      ts.forEachChild(node, visit);
      scopeStack.pop();
    } else {
      ts.forEachChild(node, visit);
    }
  };
  visit(sourceFile);
  return calls;
}

interface TenantContextConsumer {
  file: string;
  binding: string;
  specifier: string;
}

/**
 * The three authority roles that may mention the identity without being
 * consumers: the owner that creates it, the provider that publishes and
 * re-exports it, and the facade that re-exports it.
 */
const AUTHORITY_ROLES = new Set([
  'infrastructure/runtime/tenant/foundation/context/index.ts',
  'infrastructure/runtime/tenant/composition/react/provider/index.tsx',
  'infrastructure/runtime/tenant/facade/index.ts',
]);

function isProductionSource(absolutePath: string): boolean {
  const segments = absolutePath.split(sep);
  return (
    !segments.includes('tests') &&
    !segments.includes('__tests__') &&
    !/\.(test|stories)\.tsx?$/.test(absolutePath)
  );
}

/**
 * Discovers every production import of `TenantContext` / `useTenantContext`
 * under src from real ImportDeclarations -- never from a hand-maintained
 * list. The text prefilter only skips files that cannot contain the binding;
 * the inventory itself is AST-derived.
 */
function discoverTenantContextConsumers(): TenantContextConsumer[] {
  const found: TenantContextConsumer[] = [];
  for (const absolute of tsFilesUnder(srcRoot)) {
    if (!isProductionSource(absolute)) continue;
    const file = absolute.slice(srcRoot.length + 1);
    if (AUTHORITY_ROLES.has(file)) continue;
    const source = readFileSync(absolute, 'utf8');
    if (!source.includes('TenantContext')) continue;
    for (const stmt of parseSource(file, source).statements) {
      if (!ts.isImportDeclaration(stmt) || !ts.isStringLiteral(stmt.moduleSpecifier)) continue;
      const named = stmt.importClause?.namedBindings;
      if (!named || !ts.isNamedImports(named)) continue;
      for (const element of named.elements) {
        const imported = (element.propertyName ?? element.name).text;
        if (imported === 'TenantContext' || imported === 'useTenantContext') {
          found.push({ file, binding: imported, specifier: stmt.moduleSpecifier.text });
        }
      }
    }
  }
  return found.sort((a, b) =>
    a.file < b.file ? -1 : a.file > b.file ? 1 :
    a.binding < b.binding ? -1 : a.binding > b.binding ? 1 :
    a.specifier < b.specifier ? -1 : a.specifier > b.specifier ? 1 : 0,
  );
}

afterEach(() => {
  document.documentElement.removeAttribute('data-tenant');
});

describe('TenantContext identity', () => {
  it('is one object and one hook across leaf owner, provider and facade', () => {
    expect(providerContext).toBe(leafContext);
    expect(facadeContext).toBe(leafContext);
    expect(providerUseTenantContext).toBe(leafUseTenantContext);
    expect(facadeUseTenantContext).toBe(leafUseTenantContext);
  });

  it('is created exactly once in the whole tenant tree', () => {
    const owners = tsFilesUnder(join(srcRoot, 'infrastructure/runtime/tenant'))
      .filter(isProductionSource)
      .map((file) => ({
        file: file.slice(srcRoot.length + 1),
        calls: countCreateContextCalls(readFileSync(file, 'utf8'), file),
      }))
      .filter((entry) => entry.calls > 0);

    expect(owners).toEqual([
      {
        file: 'infrastructure/runtime/tenant/foundation/context/index.ts',
        calls: 1,
      },
    ]);
  });

  it('publishes a provider value that a leaf read through the Context object sees', () => {
    const config: TenantConfig = {
      slug: 'context-identity-drill',
      name: 'context-identity-drill',
      theme: 'base',
      plan: 'enterprise',
      features: [],
      branding: { companyName: 'context-identity-drill' },
    };

    let observed: TenantContextValue | null = null;
    function Leaf(): React.ReactElement {
      // Deliberately NOT useTenantContext: this is the leaf read path, the one
      // chart renderers use, and it must work off the imported Context object.
      observed = React.useContext(leafContext);
      return React.createElement('div', { 'data-testid': 'leaf' });
    }

    const view = render(
      React.createElement(TenantProvider, {
        config,
        children: React.createElement(Leaf),
      }),
    );

    expect(view.getByTestId('leaf')).toBeTruthy();
    expect(observed).not.toBeNull();
    expect(observed!.config.slug).toBe('context-identity-drill');
  });

  it('useTenantContext throws the exact contract message outside a provider', () => {
    function Bare(): React.ReactElement {
      leafUseTenantContext();
      return React.createElement('div');
    }

    let caught: unknown;
    try {
      render(React.createElement(Bare));
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(Error);
    expect((caught as Error).message).toBe(
      'useTenantContext must be used within TenantProvider',
    );
  });
});

describe('createContext AST detection', () => {
  it.each([
    [
      'generic call',
      "import { createContext } from 'react';\nexport const C = createContext<TenantContextValue | null>(null);",
    ],
    [
      'non-generic call',
      "import { createContext } from 'react';\nexport const C = createContext(null);",
    ],
    [
      'as-cast call',
      "import { createContext } from 'react';\nexport const C = createContext(null as TenantContextValue | null);",
    ],
    [
      'namespace call',
      "import * as React from 'react';\nexport const C = React.createContext<TenantContextValue | null>(null);",
    ],
    [
      'aliased import call',
      "import { createContext as makeContext } from 'react';\nexport const C = makeContext<TenantContextValue | null>(null);",
    ],
    [
      'namespace element-access call',
      "import * as React from 'react';\nexport const C = React['createContext']<TenantContextValue | null>(null);",
    ],
    [
      'default-import member call',
      "import React from 'react';\nexport const C = React.createContext(null);",
    ],
    [
      'default-import element-access call',
      "import React from 'react';\nexport const C = React['createContext']<TenantContextValue | null>(null);",
    ],
    [
      'module-scope call beside a shadowed inner one',
      "import { createContext } from 'react';\nfunction shaded(createContext: () => null) { createContext(); }\nexport const C = createContext(null);",
    ],
    [
      'module-scope call beside a let-shadowed block',
      "import { createContext } from 'react';\nfunction f() {\n  { const createContext = () => null; createContext(); }\n  return createContext(null);\n}",
    ],
  ])('counts a %s', (_label, source) => {
    expect(countCreateContextCalls(source, 'fixture.ts')).toBe(1);
  });

  it.each([
    [
      'generic form in a comment',
      "import { createContext } from 'react';\n// createContext<TenantContextValue | null>(null) lives in the owner",
    ],
    [
      'non-generic form in a string',
      "import { createContext } from 'react';\nconst doc = 'call createContext(null) once';",
    ],
    [
      'import of the symbol without a call',
      "import { createContext } from 'react';",
    ],
    [
      'type-position reference',
      "import { createContext } from 'react';\ntype Factory = typeof createContext;",
    ],
    [
      'factory method with the same member name',
      "import * as React from 'react';\nconst factory = { createContext: () => null };\nexport const C = factory.createContext();",
    ],
    [
      'parameter shadow of the imported binding',
      "import { createContext } from 'react';\nexport function shaded(createContext: () => null) { return createContext(); }",
    ],
    [
      'block-scope shadow of the imported binding',
      "import { createContext } from 'react';\n{ const createContext = () => null; createContext(); }",
    ],
    [
      'var hoisted out of a nested block shadows the import',
      "import { createContext } from 'react';\nfunction f() {\n  if (false) { var createContext = () => null; }\n  return createContext(null);\n}",
    ],
    [
      'var hoisted over the react namespace',
      "import * as React from 'react';\nfunction f() {\n  { var React = { createContext: () => null }; }\n  return React.createContext(null);\n}",
    ],
    [
      'for-initializer var hoists and shadows the import',
      "import { createContext } from 'react';\nfunction f() {\n  for (var createContext = () => null;;) { break; }\n  return createContext(null);\n}",
    ],
    [
      'local binding that was never imported',
      "const createContext = () => null;\nexport const C = createContext();",
    ],
    [
      'member of a local object that is not the react namespace',
      "const React = { createContext: () => null };\nexport const C = React.createContext(null);",
    ],
  ])('ignores a %s', (_label, source) => {
    expect(countCreateContextCalls(source, 'fixture.ts')).toBe(0);
  });
});

describe('production source predicate', () => {
  it.each([
    ['a tests segment', join('src', 'feature', 'tests', 'index.ts')],
    ['a __tests__ segment', join('src', 'feature', '__tests__', 'index.ts')],
    ['a test file', join('src', 'feature', 'index.test.ts')],
    ['a stories file', join('src', 'feature', 'index.stories.tsx')],
  ])('excludes %s', (_label, path) => {
    expect(isProductionSource(path)).toBe(false);
  });

  it.each([
    ['a plain source file', join('src', 'feature', 'index.ts')],
    ['a tests-like substring that is no segment', join('src', 'testsuite', 'index.ts')],
    ['a __tests__-like substring that is no segment', join('src', '__tests__helpers', 'index.ts')],
  ])('includes %s', (_label, path) => {
    expect(isProductionSource(path)).toBe(true);
  });
});

describe('tenant context consumer inventory', () => {
  const inventory = discoverTenantContextConsumers();

  it('is exactly the six registered live consumers -- a seventh, or a reverted specifier, fails', () => {
    expect(inventory).toEqual([
      // The inventory is sorted by path, and the UI tier now lives under
      // `components/`, which sorts before `infrastructure/`.
      {
        file: 'components/patterns/runtime/adaptive-layout/presentation/react/index.ts',
        binding: 'TenantContext',
        specifier: '@/infrastructure/runtime/tenant/foundation/context',
      },
      {
        file: 'components/patterns/visualization/charts/runtime/chart-engine/runtime/grammar/index.ts',
        binding: 'TenantContext',
        specifier: '@/infrastructure/runtime/tenant/foundation/context',
      },
      {
        file: 'infrastructure/runtime/engines/presentation/adapters/antd/index.tsx',
        binding: 'useTenantContext',
        specifier: '../../../../tenant/foundation/context',
      },
      {
        file: 'infrastructure/runtime/engines/presentation/component-factory/index.tsx',
        binding: 'TenantContext',
        specifier: '../../../tenant/foundation/context',
      },
      {
        file: 'infrastructure/runtime/personality/presentation/resolution/chart-personality/index.ts',
        binding: 'TenantContext',
        specifier: '../../../../tenant/foundation/context',
      },
      {
        file: 'infrastructure/runtime/theming/composition/react/tokens/index.ts',
        binding: 'useTenantContext',
        specifier: '../../../../tenant/foundation/context',
      },
    ]);
  });

  it('leaf consumers read the Context object and never own a createContext call', () => {
    for (const { file } of inventory.filter((c) => c.binding === 'TenantContext')) {
      const source = readSource(file);
      expect(source).toContain('useContext(TenantContext)');
      expect(countCreateContextCalls(source, file)).toBe(0);
    }
  });
});
