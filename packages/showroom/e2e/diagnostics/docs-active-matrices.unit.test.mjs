import { test } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '../..');

const EXPECTED_OWNER_ROSTER = Object.freeze([
  { path: 'src/app/(docs)/foundations/tokens/spacing/page.tsx', axis: 'engine' },
  { path: 'src/app/(docs)/foundations/tokens/colors/page.tsx', axis: 'tenant' },
  { path: 'src/app/(docs)/foundations/tokens/radius/page.tsx', axis: 'engine' },
  { path: 'src/app/(docs)/foundations/tokens/motion/page.tsx', axis: 'engine' },
  { path: 'src/app/(docs)/foundations/tokens/shadows/page.tsx', axis: 'engine' },
  { path: 'src/app/(docs)/foundations/engines/page.tsx', axis: 'engine' },
  { path: 'src/app/(docs)/foundations/themes/theme-preview-grid.tsx', axis: 'tenant' },
]);

const OWNER_META = Object.freeze({
  'src/app/(docs)/foundations/tokens/spacing/page.tsx': Object.freeze({ selector: 'engine', derivedBinding: 'engineLabel', contentProp: 'label', derivedSource: "engine.charAt(0).toUpperCase() + engine.slice(1)" }),
  'src/app/(docs)/foundations/tokens/colors/page.tsx': Object.freeze({ selector: 'tenantSlug', derivedBinding: 'tenantLabel', contentProp: 'label', derivedSource: "tenantSlug === 'bithire' ? 'BitHire' : tenantSlug === 'evnto' ? 'Evnto' : 'Rottay'" }),
  'src/app/(docs)/foundations/tokens/radius/page.tsx': Object.freeze({ selector: 'engine', derivedBinding: 'engineLabel', contentProp: 'label', derivedSource: "engine.charAt(0).toUpperCase() + engine.slice(1)" }),
  'src/app/(docs)/foundations/tokens/motion/page.tsx': Object.freeze({ selector: 'engine', derivedBinding: 'engineLabel', contentProp: 'label', derivedSource: "engine.charAt(0).toUpperCase() + engine.slice(1)" }),
  'src/app/(docs)/foundations/tokens/shadows/page.tsx': Object.freeze({ selector: 'engine', derivedBinding: 'engineLabel', contentProp: 'label', derivedSource: "engine.charAt(0).toUpperCase() + engine.slice(1)" }),
  'src/app/(docs)/foundations/engines/page.tsx': Object.freeze({ selector: 'engine', derivedBinding: 'activeEngine', contentProp: 'engine', derivedSource: 'ENGINES.find((e) => e.name === engine)!' }),
  'src/app/(docs)/foundations/themes/theme-preview-grid.tsx': Object.freeze({ selector: 'tenantSlug', derivedBinding: 'activeTheme', contentProp: 'theme', derivedSource: 'TENANT_THEMES.find((theme) => theme.slug === tenantSlug) ?? TENANT_THEMES[0]' }),
});

const OWNER_ROSTER = Object.freeze(
  EXPECTED_OWNER_ROSTER.map((o) => {
    const contentName =
      o.path === 'src/app/(docs)/foundations/tokens/spacing/page.tsx'
        ? 'EngineSpacingSnapshotContent'
        : o.path === 'src/app/(docs)/foundations/tokens/colors/page.tsx'
          ? 'BrandScalePreviewContent'
          : o.path === 'src/app/(docs)/foundations/tokens/radius/page.tsx'
            ? 'EngineRadiusPreviewContent'
            : o.path === 'src/app/(docs)/foundations/tokens/motion/page.tsx'
              ? 'MotionProfilePreviewContent'
              : o.path === 'src/app/(docs)/foundations/tokens/shadows/page.tsx'
                ? 'EngineShadowPreviewContent'
                : o.path === 'src/app/(docs)/foundations/engines/page.tsx'
                  ? 'EnginePreviewContent'
                  : 'ThemePreviewContent';
    const ownerExport =
      o.path === 'src/app/(docs)/foundations/themes/theme-preview-grid.tsx'
        ? 'ThemePreviewGrid'
        : 'default';
    return Object.freeze({ ...o, contentName, ownerExport, ...OWNER_META[o.path] });
  }),
);

const FORBIDDEN_HELPERS = Object.freeze([
  'getKnownTenantConfig',
  'getShowroomProductProfileKey',
  'getShowroomVerticalKey',
]);
const SHOWROOM_CONTEXT_MODULE = '@/components/showroom-context';
const DESIGN_SYSTEM_MODULE = '@rottay/design-system';

function parse(source, fileName = 'fixture.tsx') {
  return ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
}

function collect(rootNode, predicate) {
  const out = [];
  function visit(node) {
    if (predicate(node)) out.push(node);
    ts.forEachChild(node, visit);
  }
  visit(rootNode);
  return out;
}

function isIdentifier(node, text) {
  return ts.isIdentifier(node) && node.text === text;
}

function importDeclarationsFrom(sourceFile, moduleName) {
  return collect(
    sourceFile,
    (n) =>
      ts.isImportDeclaration(n) &&
      n.moduleSpecifier &&
      ts.isStringLiteral(n.moduleSpecifier) &&
      n.moduleSpecifier.text === moduleName,
  );
}

function namedImportLocalNames(sourceFile, moduleName, originalName) {
  const localNames = [];
  for (const decl of importDeclarationsFrom(sourceFile, moduleName)) {
    const namedBindings = decl.importClause?.namedBindings;
    if (ts.isNamedImports(namedBindings)) {
      for (const spec of namedBindings.elements) {
        const importedOriginal = spec.propertyName ? spec.propertyName.text : spec.name.text;
        if (importedOriginal === originalName) localNames.push(spec.name.text);
      }
    }
  }
  return localNames;
}

function namespaceImportLocalNames(sourceFile, moduleName) {
  const names = [];
  for (const decl of importDeclarationsFrom(sourceFile, moduleName)) {
    const namedBindings = decl.importClause?.namedBindings;
    if (ts.isNamespaceImport(namedBindings)) names.push(namedBindings.name.text);
  }
  return names;
}

function declarationNames(decl) {
  if (ts.isIdentifier(decl.name)) return [decl.name.text];
  if (ts.isObjectBindingPattern(decl.name)) {
    return decl.name.elements.map((el) => (ts.isIdentifier(el.name) ? el.name.text : null)).filter(Boolean);
  }
  if (ts.isArrayBindingPattern(decl.name)) {
    return decl.name.elements
      .map((el) => (ts.isBindingElement(el) && ts.isIdentifier(el.name) ? el.name.text : null))
      .filter(Boolean);
  }
  return [];
}

// Exact structural fingerprint of an expression AST: node kinds plus literal
// and identifier payloads. Whitespace/parens-insensitive, everything else exact.
function canonicalize(node) {
  while (ts.isParenthesizedExpression(node)) node = node.expression;
  let payload = '';
  if (ts.isIdentifier(node) || ts.isStringLiteralLike(node) || ts.isNumericLiteral(node)) {
    payload = JSON.stringify(node.text);
  }
  const children = [];
  ts.forEachChild(node, (child) => children.push(canonicalize(child)));
  return `${ts.SyntaxKind[node.kind]}${payload}(${children.join(',')})`;
}

function canonicalFingerprintOfSource(source) {
  const sf = parse(`const __expected = (${source});`, 'expected.tsx');
  const decl = collect(sf, (n) => ts.isVariableDeclaration(n) && isIdentifier(n.name, '__expected'))[0];
  return canonicalize(decl.initializer);
}

// Fixed point of `const x = <namespace or alias>` chains, so a laundered
// namespace handle is recognized at any depth.
function aliasClosure(sourceFile, rootNames) {
  const handles = new Set(rootNames);
  let changed = true;
  while (changed) {
    changed = false;
    collect(sourceFile, (node) => {
      if (
        ts.isVariableDeclaration(node) &&
        node.initializer &&
        ts.isIdentifier(node.initializer) &&
        ts.isIdentifier(node.name) &&
        handles.has(node.initializer.text) &&
        !handles.has(node.name.text)
      ) {
        handles.add(node.name.text);
        changed = true;
      }
    });
  }
  return handles;
}

function designSystemProviderAliases(sourceFile) {
  const namespaceHandles = aliasClosure(
    sourceFile,
    namespaceImportLocalNames(sourceFile, DESIGN_SYSTEM_MODULE),
  );
  const aliases = new Set();

  function isDSPRef(node) {
    if (isIdentifier(node, 'DesignSystemProvider')) return true;
    if (
      ts.isPropertyAccessExpression(node) &&
      isIdentifier(node.name, 'DesignSystemProvider') &&
      ts.isIdentifier(node.expression) &&
      namespaceHandles.has(node.expression.text)
    ) {
      return true;
    }
    if (
      ts.isElementAccessExpression(node) &&
      ts.isStringLiteral(node.argumentExpression) &&
      node.argumentExpression.text === 'DesignSystemProvider' &&
      ts.isIdentifier(node.expression) &&
      namespaceHandles.has(node.expression.text)
    ) {
      return true;
    }
    return false;
  }

  let changed = true;
  while (changed) {
    changed = false;
    collect(sourceFile, (node) => {
      if (!ts.isVariableDeclaration(node) || !node.initializer || !ts.isIdentifier(node.name)) return;
      const ref =
        isDSPRef(node.initializer) ||
        (ts.isIdentifier(node.initializer) && aliases.has(node.initializer.text));
      if (ref && !aliases.has(node.name.text)) {
        aliases.add(node.name.text);
        changed = true;
      }
    });
  }

  return aliases;
}

function designSystemProviderOccurrences(sourceFile) {
  const namespaceHandles = aliasClosure(
    sourceFile,
    namespaceImportLocalNames(sourceFile, DESIGN_SYSTEM_MODULE),
  );
  const aliases = designSystemProviderAliases(sourceFile);

  return collect(sourceFile, (node) => {
    if (isIdentifier(node, 'DesignSystemProvider')) return true;

    if (
      ts.isPropertyAccessExpression(node) &&
      isIdentifier(node.name, 'DesignSystemProvider') &&
      ts.isIdentifier(node.expression) &&
      namespaceHandles.has(node.expression.text)
    ) {
      return true;
    }

    if (
      ts.isElementAccessExpression(node) &&
      ts.isStringLiteral(node.argumentExpression) &&
      node.argumentExpression.text === 'DesignSystemProvider' &&
      ts.isIdentifier(node.expression) &&
      namespaceHandles.has(node.expression.text)
    ) {
      return true;
    }

    if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) {
      const tagName = node.tagName;
      if (isIdentifier(tagName, 'DesignSystemProvider')) return true;
      if (ts.isIdentifier(tagName) && aliases.has(tagName.text)) return true;
    }

    if (ts.isImportSpecifier(node)) {
      const original = node.propertyName ?? node.name;
      if (isIdentifier(original, 'DesignSystemProvider')) return true;
    }

    return false;
  });
}

function forceEngineOccurrences(sourceFile) {
  return collect(sourceFile, (node) => isIdentifier(node, 'forceEngine'));
}

function isNamespaceHelperAccess(node, namespaces, namespaceAliases) {
  if (ts.isPropertyAccessExpression(node)) {
    const obj = node.expression;
    const prop = node.name;
    if (
      ts.isIdentifier(obj) &&
      (namespaces.includes(obj.text) || namespaceAliases.has(obj.text)) &&
      ts.isIdentifier(prop) &&
      FORBIDDEN_HELPERS.includes(prop.text)
    ) {
      return true;
    }
  }
  if (ts.isElementAccessExpression(node)) {
    const obj = node.expression;
    const arg = node.argumentExpression;
    if (
      ts.isIdentifier(obj) &&
      (namespaces.includes(obj.text) || namespaceAliases.has(obj.text)) &&
      ts.isStringLiteral(arg) &&
      FORBIDDEN_HELPERS.includes(arg.text)
    ) {
      return true;
    }
  }
  return false;
}

// Fail-closed: importing a forbidden helper is a violation even if never called.
function forbiddenHelperImports(sourceFile) {
  const imports = [];
  for (const moduleName of [SHOWROOM_CONTEXT_MODULE, DESIGN_SYSTEM_MODULE]) {
    for (const decl of importDeclarationsFrom(sourceFile, moduleName)) {
      const namedBindings = decl.importClause?.namedBindings;
      if (!ts.isNamedImports(namedBindings)) continue;
      for (const spec of namedBindings.elements) {
        const original = spec.propertyName ? spec.propertyName.text : spec.name.text;
        if (FORBIDDEN_HELPERS.includes(original)) {
          imports.push({ helper: original, local: spec.name.text });
        }
      }
    }
  }
  return imports;
}

function forbiddenHelperCalls(sourceFile) {
  const localBindings = new Map();
  const namespaces = [];

  for (const moduleName of [SHOWROOM_CONTEXT_MODULE, DESIGN_SYSTEM_MODULE]) {
    for (const helper of FORBIDDEN_HELPERS) {
      for (const localName of namedImportLocalNames(sourceFile, moduleName, helper)) {
        localBindings.set(localName, helper);
      }
    }
    namespaces.push(...namespaceImportLocalNames(sourceFile, moduleName));
  }

  const namespaceAliases = aliasClosure(sourceFile, namespaces);
  const helperAliases = new Map();
  let changed = true;
  while (changed) {
    changed = false;
    collect(sourceFile, (node) => {
      if (
        ts.isVariableDeclaration(node) &&
        node.initializer &&
        ts.isIdentifier(node.initializer) &&
        ts.isIdentifier(node.name)
      ) {
        const helper = localBindings.get(node.initializer.text) ?? helperAliases.get(node.initializer.text);
        if (helper !== undefined && !helperAliases.has(node.name.text)) {
          helperAliases.set(node.name.text, helper);
          changed = true;
        }
      }
    });
  }

  const calls = [];
  collect(sourceFile, (node) => {
    if (!ts.isCallExpression(node)) return;
    const callee = node.expression;

    if (ts.isIdentifier(callee)) {
      if (localBindings.has(callee.text)) {
        calls.push({ helper: localBindings.get(callee.text), local: callee.text });
        return;
      }
      if (helperAliases.has(callee.text)) {
        calls.push({ helper: helperAliases.get(callee.text), local: callee.text });
        return;
      }
    }

    if (isNamespaceHelperAccess(callee, namespaces, namespaceAliases)) {
      const helper = ts.isPropertyAccessExpression(callee)
        ? callee.name.text
        : callee.argumentExpression.text;
      calls.push({ helper, local: callee.getText(sourceFile) });
    }
  });

  return calls;
}

// Destructuring a forbidden helper or the provider out of a namespace handle.
function namespaceDestructureViolations(sourceFile) {
  const dsHandles = aliasClosure(sourceFile, namespaceImportLocalNames(sourceFile, DESIGN_SYSTEM_MODULE));
  const scHandles = aliasClosure(sourceFile, namespaceImportLocalNames(sourceFile, SHOWROOM_CONTEXT_MODULE));
  const violations = [];
  collect(sourceFile, (node) => {
    if (!ts.isVariableDeclaration(node) || !node.initializer || !ts.isIdentifier(node.initializer)) return;
    if (!ts.isObjectBindingPattern(node.name)) return;
    const onDS = dsHandles.has(node.initializer.text);
    if (!onDS && !scHandles.has(node.initializer.text)) return;
    for (const el of node.name.elements) {
      const original = el.propertyName
        ? el.propertyName.text
        : ts.isIdentifier(el.name)
          ? el.name.text
          : null;
      if (original && FORBIDDEN_HELPERS.includes(original)) violations.push(original);
      if (onDS && original === 'DesignSystemProvider') violations.push('DesignSystemProvider');
    }
  });
  return violations;
}

// Element access on a namespace handle must use a static, safe literal key:
// non-literal keys and literal helper/provider keys are violations.
function namespaceElementAccessViolations(sourceFile) {
  const dsHandles = aliasClosure(sourceFile, namespaceImportLocalNames(sourceFile, DESIGN_SYSTEM_MODULE));
  const scHandles = aliasClosure(sourceFile, namespaceImportLocalNames(sourceFile, SHOWROOM_CONTEXT_MODULE));
  const violations = [];
  collect(sourceFile, (node) => {
    if (!ts.isElementAccessExpression(node) || !ts.isIdentifier(node.expression)) return;
    const onDS = dsHandles.has(node.expression.text);
    if (!onDS && !scHandles.has(node.expression.text)) return;
    const arg = node.argumentExpression;
    if (!ts.isStringLiteralLike(arg)) {
      violations.push('non-literal key');
      return;
    }
    if (FORBIDDEN_HELPERS.includes(arg.text)) violations.push(arg.text);
    if (onDS && arg.text === 'DesignSystemProvider') violations.push('DesignSystemProvider');
  });
  return violations;
}

function useShowroomBindingInfo(sourceFile) {
  const localNames = namedImportLocalNames(sourceFile, SHOWROOM_CONTEXT_MODULE, 'useShowroom');
  const namespaceNames = namespaceImportLocalNames(sourceFile, SHOWROOM_CONTEXT_MODULE);

  const otherImports = collect(sourceFile, (n) => {
    if (!ts.isImportDeclaration(n) || !n.moduleSpecifier) return false;
    if (!ts.isStringLiteral(n.moduleSpecifier)) return false;
    if (n.moduleSpecifier.text === SHOWROOM_CONTEXT_MODULE) return false;
    const namedBindings = n.importClause?.namedBindings;
    if (!ts.isNamedImports(namedBindings)) return false;
    return namedBindings.elements.some((spec) => {
      const original = spec.propertyName ? spec.propertyName.text : spec.name.text;
      return original === 'useShowroom';
    });
  });

  return { localNames, namespaceNames, otherImports };
}

function getOwnerFunction(sourceFile, ownerExport) {
  if (ownerExport === 'default') {
    const defaultFuncDecl = collect(sourceFile, (n) => {
      if (!ts.isFunctionDeclaration(n)) return false;
      const hasExport = n.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
      const hasDefault = n.modifiers?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword);
      return hasExport && hasDefault;
    })[0];
    if (defaultFuncDecl) return defaultFuncDecl;

    const exportAssignments = collect(sourceFile, (n) => ts.isExportAssignment(n) && n.isExportEquals === false);
    for (const ea of exportAssignments) {
      const expr = ea.expression;
      if (ts.isFunctionExpression(expr) || ts.isArrowFunction(expr)) return expr;
    }
  } else {
    const named = collect(sourceFile, (n) => {
      if (!ts.isFunctionDeclaration(n)) return false;
      const hasExport = n.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
      return hasExport && n.name && isIdentifier(n.name, ownerExport);
    })[0];
    if (named) return named;
  }
  return null;
}

function isInImmediateOwnerScope(node, ownerFn) {
  if (!ownerFn.body) return false;

  let cur = node.parent;
  while (cur && cur !== ownerFn.body) {
    if (ts.isArrowFunction(cur) || ts.isFunctionExpression(cur) || ts.isFunctionDeclaration(cur)) return false;
    cur = cur.parent;
  }
  if (!cur) return false;

  if (ts.isBlock(ownerFn.body)) {
    let stmt = node;
    while (stmt.parent !== ownerFn.body) {
      if (ts.isBlock(stmt.parent)) return false;
      stmt = stmt.parent;
    }
    return stmt.parent === ownerFn.body;
  }

  return true;
}

function useShowroomCallsInOwnerScope(ownerFn, allowedLocalNames) {
  if (!ownerFn.body) return [];
  return collect(ownerFn.body, (node) => {
    if (!ts.isCallExpression(node)) return false;
    if (!ts.isIdentifier(node.expression) || !allowedLocalNames.includes(node.expression.text)) return false;
    return isInImmediateOwnerScope(node, ownerFn);
  });
}

function findSelectorBinding(ownerFn, call, selector) {
  let current = call;
  while (current) {
    if (ts.isVariableDeclaration(current.parent)) {
      const decl = current.parent;
      if (ts.isObjectBindingPattern(decl.name)) {
        const binding = decl.name.elements.find((el) => ts.isIdentifier(el.name) && el.name.text === selector);
        return binding ?? null;
      }
      return null;
    }
    current = current.parent;
  }
  return null;
}

// Bindings nested inside a callback/inner function cannot capture owner-scope
// positions (the derived declaration and the live content prop), so they do
// not shadow the selector for this census.
function isInsideNestedFunction(node, ownerFn) {
  let current = node.parent;
  while (current && current !== ownerFn) {
    if (ts.isArrowFunction(current) || ts.isFunctionExpression(current) || ts.isFunctionDeclaration(current)) return true;
    current = current.parent;
  }
  return false;
}

function allBindingsOfName(ownerFn, name) {
  const bindings = [];
  const push = (node) => {
    if (!isInsideNestedFunction(node, ownerFn)) bindings.push(node);
  };
  collect(ownerFn, (node) => {
    if (ts.isBindingElement(node) && ts.isIdentifier(node.name) && node.name.text === name) {
      push(node);
      return;
    }
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === name) {
      push(node);
      return;
    }
    if (ts.isFunctionDeclaration(node) && node.name && node.name.text === name) {
      push(node);
      return;
    }
    if ((ts.isFunctionExpression(node) || ts.isArrowFunction(node)) && node.name && node.name.text === name) {
      push(node);
      return;
    }
    if (ts.isParameter(node) && ts.isIdentifier(node.name) && node.name.text === name) {
      push(node);
      return;
    }
    if (
      ts.isCatchClause(node) &&
      node.variableDeclaration &&
      ts.isIdentifier(node.variableDeclaration.name) &&
      node.variableDeclaration.name.text === name
    ) {
      push(node.variableDeclaration);
    }
  });
  return bindings;
}

function isOwnerScopeDeclaration(node, ownerFn) {
  if (!ownerFn.body) return false;
  if (!ts.isBlock(ownerFn.body)) return node.parent === ownerFn.body;
  let stmt = node;
  while (stmt.parent !== ownerFn.body) {
    if (!stmt.parent) return false;
    stmt = stmt.parent;
  }
  return stmt.parent === ownerFn.body;
}

function findDerivedBinding(ownerFn, selector, derivedBinding) {
  if (!ownerFn.body || derivedBinding === selector) return null;
  const decls = [];
  collect(ownerFn.body, (node) => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === derivedBinding &&
      isOwnerScopeDeclaration(node, ownerFn)
    ) {
      decls.push(node);
    }
  });
  return decls.length === 1 ? decls[0] : null;
}

function contentInvocations(sourceFile, contentName) {
  return collect(sourceFile, (node) => {
    const tagName = ts.isJsxSelfClosingElement(node)
      ? node.tagName
      : ts.isJsxOpeningElement(node)
        ? node.tagName
        : null;
    return tagName && isIdentifier(tagName, contentName);
  });
}

function assertOwner(sourceFile, { path, axis, contentName, ownerExport, selector, derivedBinding, contentProp, derivedSource }) {
  const errors = [];

  const dsp = designSystemProviderOccurrences(sourceFile);
  if (dsp.length !== 0) {
    errors.push(`expected 0 DesignSystemProvider occurrences, got ${dsp.length}`);
  }

  const fe = forceEngineOccurrences(sourceFile);
  if (fe.length !== 0) errors.push(`expected 0 forceEngine occurrences, got ${fe.length}`);

  const forbidden = forbiddenHelperCalls(sourceFile);
  if (forbidden.length !== 0) {
    errors.push(
      `expected 0 forbidden helper calls, got ${forbidden.length}: ${forbidden
        .map((n) => `${n.helper} as ${n.local}`)
        .join(', ')}`,
    );
  }

  const helperImports = forbiddenHelperImports(sourceFile);
  if (helperImports.length !== 0) {
    errors.push(
      `forbidden helper imports are not allowed: ${helperImports
        .map((n) => `${n.helper} as ${n.local}`)
        .join(', ')}`,
    );
  }

  const nsDestructuring = namespaceDestructureViolations(sourceFile);
  if (nsDestructuring.length !== 0) {
    errors.push(`namespace destructuring of forbidden bindings is not allowed: ${nsDestructuring.join(', ')}`);
  }

  const nsElementAccess = namespaceElementAccessViolations(sourceFile);
  if (nsElementAccess.length !== 0) {
    errors.push(`namespace element access must use static safe literal keys: ${nsElementAccess.join(', ')}`);
  }

  const ownerFn = getOwnerFunction(sourceFile, ownerExport);
  if (!ownerFn) errors.push(`could not find owner export ${ownerExport}`);

  const bindingInfo = useShowroomBindingInfo(sourceFile);
  if (bindingInfo.namespaceNames.length > 0) {
    errors.push(`namespace import of ${SHOWROOM_CONTEXT_MODULE} is not allowed`);
  }
  if (bindingInfo.otherImports.length > 0) {
    errors.push(`useShowroom must be imported only from ${SHOWROOM_CONTEXT_MODULE}`);
  }
  if (bindingInfo.localNames.length === 0) {
    errors.push(`expected a named import of useShowroom from ${SHOWROOM_CONTEXT_MODULE}`);
  }

  if (ownerFn) {
    for (const localName of bindingInfo.localNames) {
      if (allBindingsOfName(ownerFn, localName).length > 0) {
        errors.push(`imported useShowroom binding is shadowed by local declaration ${localName}`);
      }
    }
  }

  const useCalls = ownerFn ? useShowroomCallsInOwnerScope(ownerFn, bindingInfo.localNames) : [];
  if (useCalls.length !== 1) {
    errors.push(`expected exactly 1 useShowroom call in the immediate owner scope, got ${useCalls.length}`);
  }

  const selectorBinding = useCalls.length === 1 ? findSelectorBinding(ownerFn, useCalls[0], selector) : null;
  if (useCalls.length === 1 && !selectorBinding) {
    errors.push(`useShowroom must destructure exactly ${selector}`);
  }

  if (selectorBinding) {
    const selectorDecl = selectorBinding.parent?.parent;
    if (
      selectorBinding.propertyName &&
      !(ts.isIdentifier(selectorBinding.propertyName) && selectorBinding.propertyName.text === selector)
    ) {
      errors.push(`selector ${selector} must be destructured without renaming`);
    }
    if (
      !selectorDecl ||
      !ts.isVariableDeclaration(selectorDecl) ||
      (ts.getCombinedNodeFlags(selectorDecl) & ts.NodeFlags.Const) === 0
    ) {
      errors.push(`selector ${selector} destructuring must be const`);
    }
    if (selectorDecl && ts.isVariableDeclaration(selectorDecl) && selectorDecl.initializer !== useCalls[0]) {
      errors.push(`selector ${selector} initializer must be exactly the useShowroom call`);
    }
    const selectorBindings = allBindingsOfName(ownerFn, selector);
    if (selectorBindings.length !== 1 || selectorBindings[0] !== selectorBinding) {
      errors.push(`selector ${selector} is shadowed or redeclared`);
    }
  }

  let derivedDecl = null;
  if (selectorBinding && derivedBinding !== selector) {
    derivedDecl = findDerivedBinding(ownerFn, selector, derivedBinding);
    if (!derivedDecl) {
      errors.push(`derived binding ${derivedBinding} must be declared in owner scope and depend on ${selector}`);
    } else {
      if ((ts.getCombinedNodeFlags(derivedDecl) & ts.NodeFlags.Const) === 0) {
        errors.push(`derived binding ${derivedBinding} must be const`);
      }
      const derivedBindings = allBindingsOfName(ownerFn, derivedBinding);
      if (derivedBindings.length !== 1 || derivedBindings[0] !== derivedDecl) {
        errors.push(`derived binding ${derivedBinding} is shadowed or redeclared`);
      }
      if (
        !derivedDecl.initializer ||
        canonicalize(derivedDecl.initializer) !== canonicalFingerprintOfSource(derivedSource)
      ) {
        errors.push(`derived binding ${derivedBinding} initializer does not match the expected canonical form`);
      }
    }
  }

  if (ownerFn) {
    const contentDecls = collect(
      sourceFile,
      (n) => ts.isFunctionDeclaration(n) && n.name && isIdentifier(n.name, contentName),
    );
    if (contentDecls.length !== 1 || contentDecls[0].parent !== sourceFile) {
      errors.push(`expected exactly 1 top-level ${contentName} declaration, got ${contentDecls.length}`);
    }

    const returned = soleReturnedExpression(ownerFn);
    const allInvocations = contentInvocations(sourceFile, contentName);
    const ownerInvocations = returned
      ? allInvocations.filter((el) => hasOnlyJsxBetween(el, returned))
      : [];

    if (ownerInvocations.length !== 1) {
      errors.push(
        `expected exactly 1 ${contentName} inside the owner return (not in a callback), got ${ownerInvocations.length}`,
      );
    }

    if (allInvocations.length !== ownerInvocations.length) {
      errors.push(`found ${contentName} outside the owner return or inside a callback (dead code or nested function)`);
    }

    const liveContent = ownerInvocations[0];
    if (liveContent) {
      const targetBinding = derivedBinding || selector;
      const prop = liveContent.attributes?.properties?.find(
        (p) => ts.isJsxAttribute(p) && isIdentifier(p.name, contentProp),
      );
      if (!prop) {
        errors.push(`content invocation missing prop ${contentProp}`);
      } else if (
        !prop.initializer ||
        !ts.isJsxExpression(prop.initializer) ||
        !ts.isIdentifier(prop.initializer.expression) ||
        prop.initializer.expression.text !== targetBinding
      ) {
        errors.push(`content prop ${contentProp} must be exactly {${targetBinding}}`);
      }

      for (const p of liveContent.attributes?.properties ?? []) {
        if (!ts.isJsxAttribute(p)) continue;
        const name = isIdentifier(p.name, 'engine') ? 'engine' : isIdentifier(p.name, 'tenantSlug') ? 'tenantSlug' : null;
        if (name && p.initializer && ts.isStringLiteral(p.initializer)) {
          errors.push(`content invocation uses hardcoded selector ${name}=${p.initializer.text}`);
        }
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `docs-active-matrices invariant violations for ${path}:\n${errors.map((e) => `  - ${e}`).join('\n')}`,
    );
  }
}

function validateRosterIntegrity(roster) {
  const paths = roster.map((o) => o.path);
  if (new Set(paths).size !== paths.length) throw new Error('roster has duplicate paths');

  for (const expected of EXPECTED_OWNER_ROSTER) {
    const found = roster.find((o) => o.path === expected.path && o.axis === expected.axis);
    if (!found) throw new Error(`expected owner ${expected.path} (${expected.axis}) missing or wrong axis`);
  }

  for (const owner of roster) {
    if (!EXPECTED_OWNER_ROSTER.some((e) => e.path === owner.path)) {
      throw new Error(`extra owner ${owner.path} not in expected roster`);
    }
  }
}

function deferredLoadingCallback(sourceFile) {
  const dynamics = collect(
    sourceFile,
    (node) => ts.isCallExpression(node) && isIdentifier(node.expression, 'dynamic'),
  );
  assert.equal(dynamics.length, 1, 'deferred file must contain exactly one dynamic() call');

  const options = dynamics[0].arguments[1];
  assert.ok(ts.isObjectLiteralExpression(options), 'dynamic() second argument must be an object literal');

  const loadingProp = options.properties.find((p) => ts.isPropertyAssignment(p) && isIdentifier(p.name, 'loading'));
  assert.ok(loadingProp, 'dynamic() options must have a loading property');

  const init = loadingProp.initializer;
  assert.ok(ts.isArrowFunction(init) || ts.isFunctionExpression(init), 'loading must be an arrow or function expression');

  return init;
}

// The expression a function actually renders: its single return expression,
// or the implicit arrow body. Multiple returns make it unverifiable.
function soleReturnedExpression(fn) {
  const body = fn.body;
  if (!body) return null;
  if (!ts.isBlock(body)) return body;
  const returns = [];
  (function visit(node) {
    if (
      (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node) || ts.isFunctionExpression(node)) &&
      node !== fn
    ) {
      return;
    }
    if (ts.isReturnStatement(node)) returns.push(node);
    ts.forEachChild(node, visit);
  })(body);
  if (returns.length !== 1) return null;
  return returns[0].expression ?? null;
}

function isDescendantOf(node, root) {
  let current = node.parent;
  while (current) {
    if (current === root) return true;
    current = current.parent;
  }
  return false;
}

// Only pure JSX structure may sit between a live cell and the returned
// expression: no calls, arrays, operators, conditionals or callbacks.
function hasOnlyJsxBetween(node, root) {
  if (node === root) return true;
  let current = node.parent;
  while (current && current !== root) {
    const ok =
      ts.isJsxElement(current) ||
      ts.isJsxFragment(current) ||
      ts.isJsxExpression(current) ||
      ts.isParenthesizedExpression(current);
    if (!ok) return false;
    current = current.parent;
  }
  return current === root;
}

function cardsInLoadingCallback(sourceFile) {
  const loadingCb = deferredLoadingCallback(sourceFile);
  const returned = soleReturnedExpression(loadingCb);
  const dsHandles = aliasClosure(sourceFile, namespaceImportLocalNames(sourceFile, DESIGN_SYSTEM_MODULE));
  const cardLocals = namedImportLocalNames(sourceFile, DESIGN_SYSTEM_MODULE, 'Card');
  const declaredNames = new Set();
  collect(sourceFile, (n) => {
    if ((ts.isFunctionDeclaration(n) || ts.isClassDeclaration(n)) && n.name) declaredNames.add(n.name.text);
    if (ts.isVariableDeclaration(n)) for (const nm of declarationNames(n)) declaredNames.add(nm);
  });

  const resolvesToDsCard = (tagName) => {
    if (ts.isIdentifier(tagName)) {
      return cardLocals.includes(tagName.text) && !declaredNames.has(tagName.text);
    }
    if (ts.isPropertyAccessExpression(tagName)) {
      return (
        isIdentifier(tagName.name, 'Card') &&
        ts.isIdentifier(tagName.expression) &&
        dsHandles.has(tagName.expression.text)
      );
    }
    return false;
  };
  const isCardish = (tagName) => {
    if (resolvesToDsCard(tagName)) return true;
    if (ts.isIdentifier(tagName) && tagName.text === 'Card') return true;
    if (ts.isPropertyAccessExpression(tagName) && isIdentifier(tagName.name, 'Card')) return true;
    return false;
  };

  const all = collect(loadingCb, (node) => {
    const tagName = ts.isJsxSelfClosingElement(node)
      ? node.tagName
      : ts.isJsxOpeningElement(node)
        ? node.tagName
        : null;
    return tagName != null && isCardish(tagName);
  });
  const unresolved = all.filter((c) => !resolvesToDsCard(c.tagName));

  // A valid skeleton Card resolves to the DS Card import and is structurally
  // inside the returned expression, never stored, reused or multiplied.
  const resolved = all.filter((c) => resolvesToDsCard(c.tagName));
  const direct = returned
    ? resolved.filter((c) => hasOnlyJsxBetween(c, returned))
    : [];
  const indirect = resolved.filter((c) => !direct.includes(c));
  return { direct, indirect, unresolved, all, loadingCb };
}

function assertDeferredSkeletonCount1(sourceFile, path) {
  const { direct, indirect, unresolved, all } = cardsInLoadingCallback(sourceFile);

  if (unresolved.length !== 0) {
    throw new Error(
      `expected every skeleton Card in ${path} to resolve to the Card import from ${DESIGN_SYSTEM_MODULE}, got ${unresolved.length} unresolved`,
    );
  }

  if (indirect.length !== 0) {
    throw new Error(
      `expected 0 Cards inside nested/callback functions in ${path} loading placeholder, got ${indirect.length}`,
    );
  }

  if (direct.length !== 1) {
    throw new Error(
      `expected exactly 1 Card whose nearest function ancestor is the loading callback in ${path}, got ${direct.length} (total ${all.length})`,
    );
  }
}
test('active-matrix roster matches the frozen expected set', () => {
  assert.equal(OWNER_ROSTER.length, 7);
  assert.equal(OWNER_ROSTER.filter((o) => o.axis === 'engine').length, 5, 'expected 5 engine-axis owners');
  assert.equal(OWNER_ROSTER.filter((o) => o.axis === 'tenant').length, 2, 'expected 2 tenant-axis owners');
  validateRosterIntegrity(OWNER_ROSTER);
});

test('active-matrix owners have zero local providers and exactly one live cell', () => {
  const actualNested = [];

  for (const owner of OWNER_ROSTER) {
    const fullPath = join(root, owner.path);
    const source = readFileSync(fullPath, 'utf8');
    const sf = parse(source, owner.path);

    const dsp = designSystemProviderOccurrences(sf);
    if (dsp.length > 0) actualNested.push({ path: owner.path, count: dsp.length });

    assertOwner(sf, owner);
  }

  assert.deepEqual(actualNested, [], `expected actualNested=[], got ${JSON.stringify(actualNested)}`);
});

test('theme-preview-grid-deferred renders exactly one skeleton card', () => {
  const path = join(root, 'src/app/(docs)/foundations/themes/theme-preview-grid-deferred.tsx');
  const source = readFileSync(path, 'utf8');
  assertDeferredSkeletonCount1(parse(source, path), path);
});

const ENGINE_OWNER = {
  path: 'fixture-engine.tsx',
  axis: 'engine',
  ownerExport: 'default',
  contentName: 'EngineSpacingSnapshotContent',
  selector: 'engine',
  derivedBinding: 'engineLabel',
  contentProp: 'label',
  derivedSource: "engine.charAt(0).toUpperCase() + engine.slice(1)",
};
const TENANT_OWNER = {
  path: 'fixture-tenant.tsx',
  axis: 'tenant',
  ownerExport: 'default',
  contentName: 'BrandScalePreviewContent',
  selector: 'tenantSlug',
  derivedBinding: 'tenantLabel',
  contentProp: 'label',
  derivedSource: "tenantSlug === 'bithire' ? 'BitHire' : tenantSlug === 'evnto' ? 'Evnto' : 'Rottay'",
};

function engineFixture(body) {
  return `
import { Badge, Box, Card, Flex, Stack, Text } from '@rottay/design-system';
import { useShowroom } from '@/components/showroom-context';
function EngineSpacingSnapshotContent({ label }: { label: string }) {
  return <Card><Text>{label}</Text></Card>;
}
export default function SpacingPage() {
  const { engine } = useShowroom();
  const engineLabel = engine.charAt(0).toUpperCase() + engine.slice(1);
  return ${body};
}
`;
}

function tenantFixture(body) {
  return `
import { Badge, Box, Card, Flex, Stack, Text } from '@rottay/design-system';
import { useShowroom } from '@/components/showroom-context';
function BrandScalePreviewContent({ label }: { label: string }) {
  return <Card><Text>{label}</Text></Card>;
}
export default function ColorsPage() {
  const { tenantSlug } = useShowroom();
  const tenantLabel = tenantSlug === 'bithire' ? 'BitHire' : tenantSlug === 'evnto' ? 'Evnto' : 'Rottay';
  return ${body};
}
`;
}

test('rejects aliased DesignSystemProvider import (DSP as P + <P>)', () => {
  const fixture = `
import { DesignSystemProvider as P, Badge, Box, Card, Flex, Stack, Text } from '@rottay/design-system';
import { useShowroom } from '@/components/showroom-context';
function EngineSpacingSnapshotContent({ label }: { label: string }) {
  return <Card><Text>{label}</Text></Card>;
}
export default function SpacingPage() {
  const { engine } = useShowroom();
  const engineLabel = engine.charAt(0).toUpperCase() + engine.slice(1);
  return <P><EngineSpacingSnapshotContent label={engineLabel} /></P>;
}
`;
  assert.throws(() => assertOwner(parse(fixture, 'alias.tsx'), ENGINE_OWNER), /expected 0 DesignSystemProvider occurrences/);
});

test('rejects namespace DesignSystemProvider import (DS + <DS.DesignSystemProvider>)', () => {
  const fixture = `
import * as DS from '@rottay/design-system';
import { useShowroom } from '@/components/showroom-context';
function EngineSpacingSnapshotContent({ label }: { label: string }) {
  return <DS.Card><Text>{label}</Text></DS.Card>;
}
export default function SpacingPage() {
  const { engine } = useShowroom();
  const engineLabel = engine.charAt(0).toUpperCase() + engine.slice(1);
  return <DS.DesignSystemProvider><EngineSpacingSnapshotContent label={engineLabel} /></DS.DesignSystemProvider>;
}
`;
  assert.throws(() => assertOwner(parse(fixture, 'namespace.tsx'), ENGINE_OWNER), /expected 0 DesignSystemProvider occurrences/);
});

test('rejects hardcoded selector on content invocation', () => {
  const fixture = engineFixture('<EngineSpacingSnapshotContent label={engineLabel} engine="modern" />');
  assert.throws(() => assertOwner(parse(fixture, 'hardcode.tsx'), ENGINE_OWNER), /hardcoded selector engine=modern/);
});

test('rejects wrong-axis selector (tenant owner using engine)', () => {
  const fixture = `
import { Badge, Box, Card, Flex, Stack, Text } from '@rottay/design-system';
import { useShowroom } from '@/components/showroom-context';
function BrandScalePreviewContent({ label }: { label: string }) {
  return <Card><Text>{label}</Text></Card>;
}
export default function ColorsPage() {
  const { engine } = useShowroom();
  const tenantLabel = engine === 'bithire' ? 'BitHire' : engine === 'evnto' ? 'Evnto' : 'Rottay';
  return <BrandScalePreviewContent label={tenantLabel} />;
}
`;
  assert.throws(() => assertOwner(parse(fixture, 'wrong-axis.tsx'), TENANT_OWNER), /useShowroom must destructure exactly tenantSlug/);
});

test('rejects duplicated preview content invocation', () => {
  const fixture = engineFixture(
    '<><EngineSpacingSnapshotContent label={engineLabel} /><EngineSpacingSnapshotContent label={engineLabel} /></>',
  );
  assert.throws(
    () => assertOwner(parse(fixture, 'duplicate.tsx'), ENGINE_OWNER),
    /expected exactly 1 EngineSpacingSnapshotContent inside the owner return/,
  );
});

test('rejects preview content rendered inside a map', () => {
  const fixture = engineFixture(
    '{["Classic","Modern","Rustic"].map((label, i) => <EngineSpacingSnapshotContent key={i} label={engineLabel} />)}',
  );
  assert.throws(
    () => assertOwner(parse(fixture, 'in-map.tsx'), ENGINE_OWNER),
    /expected exactly 1 EngineSpacingSnapshotContent inside the owner return/,
  );
});

test('rejects inert selector (no useShowroom binding)', () => {
  const fixture = `
import { Badge, Box, Card, Flex, Stack, Text } from '@rottay/design-system';
function EngineSpacingSnapshotContent({ label }: { label: string }) {
  return <Card><Text>{label}</Text></Card>;
}
export default function SpacingPage() {
  return <EngineSpacingSnapshotContent label="Modern" />;
}
`;
  assert.throws(() => assertOwner(parse(fixture, 'inert.tsx'), ENGINE_OWNER), /expected a named import of useShowroom/);
});

test('rejects roster missing an owner', () => {
  const incomplete = OWNER_ROSTER.filter((o) => !o.path.includes('engines'));
  assert.throws(() => validateRosterIntegrity(incomplete), /expected owner .*engines.* missing or wrong axis/);
});

test('rejects deferred skeleton rendering three cards', () => {
  const fixture = `
import dynamic from 'next/dynamic';
import { Box, Card, Stack } from '@rottay/design-system';
const ThemePreviewGrid = dynamic(
  () => import('./theme-preview-grid').then((module) => module.ThemePreviewGrid),
  {
    ssr: false,
    loading: () => (
      <Box>
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} style={{ height: 280 }}>
            <Stack spacing="md" />
          </Card>
        ))}
      </Box>
    ),
  },
);
export function ThemePreviewGridDeferred() { return <ThemePreviewGrid />; }
`;
  assert.throws(
    () => assertDeferredSkeletonCount1(parse(fixture, 'skeleton3.tsx'), 'skeleton3.tsx'),
    /expected 0 Cards inside nested\/callback functions/,
  );
});

test('rejects local false useShowroom + dead selector + Content inside dead function', () => {
  const fixture = `
import { Badge, Box, Card, Flex, Stack, Text } from '@rottay/design-system';
function useShowroom() { return { engine: 'modern' }; }
function EngineSpacingSnapshotContent({ label }: { label: string }) {
  return <Card><Text>{label}</Text></Card>;
}
function deadPreview() {
  const { engine } = useShowroom();
  const engineLabel = engine.charAt(0).toUpperCase() + engine.slice(1);
  return <EngineSpacingSnapshotContent label={engineLabel} />;
}
export default function SpacingPage() {
  return <Box>no preview</Box>;
}
`;
  assert.throws(() => assertOwner(parse(fixture, 'local-false.tsx'), ENGINE_OWNER), /expected a named import of useShowroom/);
});

test('rejects forbidden helper executed via named alias', () => {
  const fixture = `
import { Badge, Box, Card, Flex, Stack, Text } from '@rottay/design-system';
import { useShowroom, getShowroomVerticalKey as resolveVertical } from '@/components/showroom-context';
function EngineSpacingSnapshotContent({ label }: { label: string }) {
  return <Card><Text>{label}</Text></Card>;
}
export default function SpacingPage() {
  const { engine } = useShowroom();
  const engineLabel = engine.charAt(0).toUpperCase() + engine.slice(1);
  resolveVertical('rottay');
  return <EngineSpacingSnapshotContent label={engineLabel} />;
}
`;
  assert.throws(
    () => assertOwner(parse(fixture, 'forbidden-alias.tsx'), ENGINE_OWNER),
    /expected 0 forbidden helper calls.*getShowroomVerticalKey/,
  );
});

test('rejects forbidden helper executed via namespace import', () => {
  const fixture = `
import * as DS from '@rottay/design-system';
import { useShowroom } from '@/components/showroom-context';
function EngineSpacingSnapshotContent({ label }: { label: string }) {
  return <DS.Card><Text>{label}</Text></DS.Card>;
}
export default function SpacingPage() {
  const { engine } = useShowroom();
  const engineLabel = engine.charAt(0).toUpperCase() + engine.slice(1);
  DS.getKnownTenantConfig('rottay');
  return <EngineSpacingSnapshotContent label={engineLabel} />;
}
`;
  assert.throws(
    () => assertOwner(parse(fixture, 'forbidden-namespace.tsx'), ENGINE_OWNER),
    /expected 0 forbidden helper calls.*getKnownTenantConfig/,
  );
});

test('rejects skeleton multiplied with [0,1,2].map(<Card/>)', () => {
  const fixture = `
import dynamic from 'next/dynamic';
import { Box, Card, Stack } from '@rottay/design-system';
const ThemePreviewGrid = dynamic(
  () => import('./theme-preview-grid').then((module) => module.ThemePreviewGrid),
  {
    ssr: false,
    loading: () => (
      <Box>
        {[0, 1, 2].map((i) => (
          <Card key={i}>
            <Stack spacing="md" />
          </Card>
        ))}
      </Box>
    ),
  },
);
export function ThemePreviewGridDeferred() { return <ThemePreviewGrid />; }
`;
  assert.throws(
    () => assertDeferredSkeletonCount1(parse(fixture, 'skeleton-map.tsx'), 'skeleton-map.tsx'),
    /expected 0 Cards inside nested\/callback functions/,
  );
});

test('rejects roster with duplicate path', () => {
  const duplicated = [...OWNER_ROSTER, OWNER_ROSTER[0]];
  assert.throws(() => validateRosterIntegrity(duplicated), /roster has duplicate paths/);
});

test('rejects disconnected selector: void selector + literal content label', () => {
  const fixture = `
import { Badge, Box, Card, Flex, Stack, Text } from '@rottay/design-system';
import { useShowroom } from '@/components/showroom-context';
function EngineSpacingSnapshotContent({ label }: { label: string }) {
  return <Card><Text>{label}</Text></Card>;
}
export default function SpacingPage() {
  const { engine } = useShowroom();
  const engineLabel = engine.charAt(0).toUpperCase() + engine.slice(1);
  void engine;
  return <EngineSpacingSnapshotContent label="Modern" />;
}
`;
  assert.throws(
    () => assertOwner(parse(fixture, 'void-literal.tsx'), ENGINE_OWNER),
    /content prop label must be exactly \{engineLabel\}/,
  );
});

test('rejects useShowroom call inside a nested function', () => {
  const fixture = `
import { Badge, Box, Card, Flex, Stack, Text } from '@rottay/design-system';
import { useShowroom } from '@/components/showroom-context';
function EngineSpacingSnapshotContent({ label }: { label: string }) {
  return <Card><Text>{label}</Text></Card>;
}
export default function SpacingPage() {
  function inner() {
    const { engine } = useShowroom();
    const engineLabel = engine.charAt(0).toUpperCase() + engine.slice(1);
    return engineLabel;
  }
  return <EngineSpacingSnapshotContent label={inner()} />;
}
`;
  assert.throws(
    () => assertOwner(parse(fixture, 'nested-hook.tsx'), ENGINE_OWNER),
    /expected exactly 1 useShowroom call in the immediate owner scope/,
  );
});

test('rejects imported useShowroom alias shadowed by local function', () => {
  const fixture = `
import { Badge, Box, Card, Flex, Stack, Text } from '@rottay/design-system';
import { useShowroom as u } from '@/components/showroom-context';
function EngineSpacingSnapshotContent({ label }: { label: string }) {
  return <Card><Text>{label}</Text></Card>;
}
export default function SpacingPage() {
  function u() { return { engine: 'modern' }; }
  const { engine } = u();
  const engineLabel = engine.charAt(0).toUpperCase() + engine.slice(1);
  return <EngineSpacingSnapshotContent label={engineLabel} />;
}
`;
  assert.throws(
    () => assertOwner(parse(fixture, 'alias-shadow.tsx'), ENGINE_OWNER),
    /selector engine is shadowed or redeclared|imported useShowroom binding is shadowed/,
  );
});

test('rejects forbidden helper via namespace element access', () => {
  const fixture = `
import * as DS from '@rottay/design-system';
import { useShowroom } from '@/components/showroom-context';
function EngineSpacingSnapshotContent({ label }: { label: string }) {
  return <DS.Card><Text>{label}</Text></DS.Card>;
}
export default function SpacingPage() {
  const { engine } = useShowroom();
  const engineLabel = engine.charAt(0).toUpperCase() + engine.slice(1);
  DS["getKnownTenantConfig"]('rottay');
  return <EngineSpacingSnapshotContent label={engineLabel} />;
}
`;
  assert.throws(
    () => assertOwner(parse(fixture, 'forbidden-element-access.tsx'), ENGINE_OWNER),
    /expected 0 forbidden helper calls.*getKnownTenantConfig/,
  );
});

test('rejects skeleton multiplied via named callback items.map(renderCard)', () => {
  const fixture = `
import dynamic from 'next/dynamic';
import { Box, Card, Stack } from '@rottay/design-system';
const ThemePreviewGrid = dynamic(
  () => import('./theme-preview-grid').then((module) => module.ThemePreviewGrid),
  {
    ssr: false,
    loading: () => {
      const items = [0, 1, 2];
      function renderCard(i) {
        return (
          <Card key={i}>
            <Stack spacing="md" />
          </Card>
        );
      }
      return <Box>{items.map(renderCard)}</Box>;
    },
  },
);
export function ThemePreviewGridDeferred() { return <ThemePreviewGrid />; }
`;
  assert.throws(
    () => assertDeferredSkeletonCount1(parse(fixture, 'skeleton-named-callback.tsx'), 'skeleton-named-callback.tsx'),
    /expected 0 Cards inside nested\/callback functions/,
  );
});

// Causal mutants for FINAL3 bypasses

test('rejects selector shadowed by owner parameter', () => {
  const fixture = `
import { Badge, Box, Card, Flex, Stack, Text } from '@rottay/design-system';
import { useShowroom } from '@/components/showroom-context';
function EngineSpacingSnapshotContent({ label }: { label: string }) {
  return <Card><Text>{label}</Text></Card>;
}
export default function SpacingPage({ engine }: { engine: string }) {
  const { engine } = useShowroom();
  const engineLabel = engine.charAt(0).toUpperCase() + engine.slice(1);
  return <EngineSpacingSnapshotContent label={engineLabel} />;
}
`;
  assert.throws(
    () => assertOwner(parse(fixture, 'shadow-param.tsx'), ENGINE_OWNER),
    /selector engine is shadowed or redeclared/,
  );
});

test('rejects selector shadowed by local variable binding', () => {
  const fixture = `
import { Badge, Box, Card, Flex, Stack, Text } from '@rottay/design-system';
import { useShowroom } from '@/components/showroom-context';
function EngineSpacingSnapshotContent({ label }: { label: string }) {
  return <Card><Text>{label}</Text></Card>;
}
export default function SpacingPage() {
  const engine = 'modern';
  const { engine } = useShowroom();
  const engineLabel = engine.charAt(0).toUpperCase() + engine.slice(1);
  return <EngineSpacingSnapshotContent label={engineLabel} />;
}
`;
  assert.throws(
    () => assertOwner(parse(fixture, 'shadow-local.tsx'), ENGINE_OWNER),
    /selector engine is shadowed or redeclared/,
  );
});

test('rejects dataflow via homonym in dead function', () => {
  const fixture = `
import { Badge, Box, Card, Flex, Stack, Text } from '@rottay/design-system';
import { useShowroom } from '@/components/showroom-context';
function EngineSpacingSnapshotContent({ label }: { label: string }) {
  return <Card><Text>{label}</Text></Card>;
}
function deadEngine() { return 'Modern'; }
export default function SpacingPage() {
  const { engine } = useShowroom();
  const engineLabel = deadEngine();
  return <EngineSpacingSnapshotContent label={engineLabel} />;
}
`;
  assert.throws(
    () => assertOwner(parse(fixture, 'dead-homonym.tsx'), ENGINE_OWNER),
    /derived binding engineLabel initializer does not match the expected canonical form/,
  );
});

test('rejects dataflow via object literal homonym property', () => {
  const fixture = `
import { Badge, Box, Card, Flex, Stack, Text } from '@rottay/design-system';
import { useShowroom } from '@/components/showroom-context';
function EngineSpacingSnapshotContent({ label }: { label: string }) {
  return <Card><Text>{label}</Text></Card>;
}
export default function SpacingPage() {
  const { engine } = useShowroom();
  const engineLabel = { engine: 'Modern' }.engine;
  return <EngineSpacingSnapshotContent label={engineLabel} />;
}
`;
  assert.throws(
    () => assertOwner(parse(fixture, 'object-homonym.tsx'), ENGINE_OWNER),
    /derived binding engineLabel initializer does not match the expected canonical form/,
  );
});

test('rejects forbidden helper via indirect alias const f=resolve; f()', () => {
  const fixture = `
import { Badge, Box, Card, Flex, Stack, Text } from '@rottay/design-system';
import { useShowroom, getShowroomVerticalKey as resolveVertical } from '@/components/showroom-context';
function EngineSpacingSnapshotContent({ label }: { label: string }) {
  return <Card><Text>{label}</Text></Card>;
}
export default function SpacingPage() {
  const { engine } = useShowroom();
  const engineLabel = engine.charAt(0).toUpperCase() + engine.slice(1);
  const f = resolveVertical;
  f('rottay');
  return <EngineSpacingSnapshotContent label={engineLabel} />;
}
`;
  assert.throws(
    () => assertOwner(parse(fixture, 'helper-indirect-alias.tsx'), ENGINE_OWNER),
    /expected 0 forbidden helper calls.*getShowroomVerticalKey/,
  );
});

test('rejects forbidden helper via namespace alias laundering', () => {
  const fixture = `
import * as DS from '@rottay/design-system';
import { useShowroom } from '@/components/showroom-context';
function EngineSpacingSnapshotContent({ label }: { label: string }) {
  return <DS.Card><Text>{label}</Text></DS.Card>;
}
export default function SpacingPage() {
  const { engine } = useShowroom();
  const engineLabel = engine.charAt(0).toUpperCase() + engine.slice(1);
  const ds = DS;
  ds.getKnownTenantConfig('rottay');
  return <EngineSpacingSnapshotContent label={engineLabel} />;
}
`;
  assert.throws(
    () => assertOwner(parse(fixture, 'helper-namespace-alias.tsx'), ENGINE_OWNER),
    /expected 0 forbidden helper calls.*getKnownTenantConfig/,
  );
});

test('rejects DesignSystemProvider via element-access alias', () => {
  const fixture = `
import * as DS from '@rottay/design-system';
import { useShowroom } from '@/components/showroom-context';
function EngineSpacingSnapshotContent({ label }: { label: string }) {
  return <DS.Card><Text>{label}</Text></DS.Card>;
}
export default function SpacingPage() {
  const { engine } = useShowroom();
  const engineLabel = engine.charAt(0).toUpperCase() + engine.slice(1);
  const P = DS['DesignSystemProvider'];
  return <P><EngineSpacingSnapshotContent label={engineLabel} /></P>;
}
`;
  assert.throws(
    () => assertOwner(parse(fixture, 'dsp-element-access-alias.tsx'), ENGINE_OWNER),
    /expected 0 DesignSystemProvider occurrences/,
  );
});

test('rejects skeleton multiplied via Array(3).fill(<Card/>)', () => {
  const fixture = `
import dynamic from 'next/dynamic';
import { Box, Card, Stack } from '@rottay/design-system';
const ThemePreviewGrid = dynamic(
  () => import('./theme-preview-grid').then((module) => module.ThemePreviewGrid),
  {
    ssr: false,
    loading: () => (
      <Box>
        {Array(3).fill(<Card><Stack spacing="md" /></Card>)}
      </Box>
    ),
  },
);
export function ThemePreviewGridDeferred() { return <ThemePreviewGrid />; }
`;
  assert.throws(
    () => assertDeferredSkeletonCount1(parse(fixture, 'skeleton-fill.tsx'), 'skeleton-fill.tsx'),
    /expected 0 Cards inside nested\/callback functions/,
  );
});

test('rejects skeleton multiplied via array literal of Cards', () => {
  const fixture = `
import dynamic from 'next/dynamic';
import { Box, Card, Stack } from '@rottay/design-system';
const ThemePreviewGrid = dynamic(
  () => import('./theme-preview-grid').then((module) => module.ThemePreviewGrid),
  {
    ssr: false,
    loading: () => (
      <Box>
        {[<Card key={1}><Stack spacing="md" /></Card>, <Card key={2}><Stack spacing="md" /></Card>]}
      </Box>
    ),
  },
);
export function ThemePreviewGridDeferred() { return <ThemePreviewGrid />; }
`;
  assert.throws(
    () => assertDeferredSkeletonCount1(parse(fixture, 'skeleton-array.tsx'), 'skeleton-array.tsx'),
    /expected 0 Cards inside nested\/callback functions/,
  );
});

test('rejects non-const selector destructuring (let { engine })', () => {
  const fixture = `
import { Badge, Box, Card, Flex, Stack, Text } from '@rottay/design-system';
import { useShowroom } from '@/components/showroom-context';
function EngineSpacingSnapshotContent({ label }: { label: string }) {
  return <Card><Text>{label}</Text></Card>;
}
export default function SpacingPage() {
  let { engine } = useShowroom();
  engine = 'rustic';
  const engineLabel = engine.charAt(0).toUpperCase() + engine.slice(1);
  return <EngineSpacingSnapshotContent label={engineLabel} />;
}
`;
  assert.throws(
    () => assertOwner(parse(fixture, 'let-selector.tsx'), ENGINE_OWNER),
    /selector engine destructuring must be const/,
  );
});

test('rejects non-const derived binding (let engineLabel overwritten)', () => {
  const fixture = `
import { Badge, Box, Card, Flex, Stack, Text } from '@rottay/design-system';
import { useShowroom } from '@/components/showroom-context';
function EngineSpacingSnapshotContent({ label }: { label: string }) {
  return <Card><Text>{label}</Text></Card>;
}
export default function SpacingPage() {
  const { engine } = useShowroom();
  let engineLabel = engine.charAt(0).toUpperCase() + engine.slice(1);
  engineLabel = 'Modern';
  return <EngineSpacingSnapshotContent label={engineLabel} />;
}
`;
  assert.throws(
    () => assertOwner(parse(fixture, 'let-derived.tsx'), ENGINE_OWNER),
    /derived binding engineLabel must be const/,
  );
});

test('rejects initializer-local binding of the selector name', () => {
  const fixture = `
import { Badge, Box, Card, Flex, Stack, Text } from '@rottay/design-system';
import { useShowroom } from '@/components/showroom-context';
function EngineSpacingSnapshotContent({ label }: { label: string }) {
  return <Card><Text>{label}</Text></Card>;
}
export default function SpacingPage() {
  const { engine } = useShowroom();
  const engineLabel = (() => {
    const engine = 'modern';
    return engine.charAt(0).toUpperCase() + engine.slice(1);
  })();
  return <EngineSpacingSnapshotContent label={engineLabel} />;
}
`;
  assert.throws(
    () => assertOwner(parse(fixture, 'initializer-local-shadow.tsx'), ENGINE_OWNER),
    /derived binding engineLabel initializer does not match the expected canonical form/,
  );
});

test('rejects two-hop helper alias (resolve -> f -> g)', () => {
  const fixture = `
import { Badge, Box, Card, Flex, Stack, Text } from '@rottay/design-system';
import { useShowroom, getShowroomVerticalKey as resolveVertical } from '@/components/showroom-context';
function EngineSpacingSnapshotContent({ label }: { label: string }) {
  return <Card><Text>{label}</Text></Card>;
}
export default function SpacingPage() {
  const { engine } = useShowroom();
  const engineLabel = engine.charAt(0).toUpperCase() + engine.slice(1);
  const f = resolveVertical;
  const g = f;
  g('rottay');
  return <EngineSpacingSnapshotContent label={engineLabel} />;
}
`;
  assert.throws(
    () => assertOwner(parse(fixture, 'helper-two-hop.tsx'), ENGINE_OWNER),
    /expected 0 forbidden helper calls.*getShowroomVerticalKey/,
  );
  assert.throws(
    () => assertOwner(parse(fixture, 'helper-two-hop.tsx'), ENGINE_OWNER),
    /forbidden helper imports are not allowed.*getShowroomVerticalKey/,
  );
});

test('rejects skeleton Card stored in a variable and reused', () => {
  const fixture = `
import dynamic from 'next/dynamic';
import { Box, Card, Stack } from '@rottay/design-system';
const ThemePreviewGrid = dynamic(
  () => import('./theme-preview-grid').then((module) => module.ThemePreviewGrid),
  {
    ssr: false,
    loading: () => {
      const card = (
        <Card style={{ height: 280 }}>
          <Stack spacing="md" />
        </Card>
      );
      return <Box>{[card, card]}</Box>;
    },
  },
);
export function ThemePreviewGridDeferred() { return <ThemePreviewGrid />; }
`;
  assert.throws(
    () => assertDeferredSkeletonCount1(parse(fixture, 'skeleton-stored.tsx'), 'skeleton-stored.tsx'),
    /expected 0 Cards inside nested\/callback functions/,
  );
});

test('allows a safe namespace import used only for presentational components (DS.Card)', () => {
  const fixture = `
import * as DS from '@rottay/design-system';
import { useShowroom } from '@/components/showroom-context';
function EngineSpacingSnapshotContent({ label }: { label: string }) {
  return <DS.Card><DS.Text>{label}</DS.Text></DS.Card>;
}
export default function SpacingPage() {
  const { engine } = useShowroom();
  const engineLabel = engine.charAt(0).toUpperCase() + engine.slice(1);
  return <DS.Box><EngineSpacingSnapshotContent label={engineLabel} /></DS.Box>;
}
`;
  assert.doesNotThrow(() => assertOwner(parse(fixture, 'safe-namespace.tsx'), ENGINE_OWNER));
});

test('rejects aliased selector destructure ({ tenantSlug: engine })', () => {
  const fixture = `
import { Badge, Box, Card, Flex, Stack, Text } from '@rottay/design-system';
import { useShowroom } from '@/components/showroom-context';
function EngineSpacingSnapshotContent({ label }: { label: string }) {
  return <Card><Text>{label}</Text></Card>;
}
export default function SpacingPage() {
  const { tenantSlug: engine } = useShowroom();
  const engineLabel = engine.charAt(0).toUpperCase() + engine.slice(1);
  return <EngineSpacingSnapshotContent label={engineLabel} />;
}
`;
  assert.throws(
    () => assertOwner(parse(fixture, 'aliased-destructure.tsx'), ENGINE_OWNER),
    /selector engine must be destructured without renaming/,
  );
});

test('rejects selector initializer wrapped in identity(useShowroom())', () => {
  const fixture = `
import { Badge, Box, Card, Flex, Stack, Text } from '@rottay/design-system';
import { useShowroom } from '@/components/showroom-context';
function EngineSpacingSnapshotContent({ label }: { label: string }) {
  return <Card><Text>{label}</Text></Card>;
}
const identity = (v: unknown) => v as { engine: string };
export default function SpacingPage() {
  const { engine } = identity(useShowroom());
  const engineLabel = engine.charAt(0).toUpperCase() + engine.slice(1);
  return <EngineSpacingSnapshotContent label={engineLabel} />;
}
`;
  assert.throws(
    () => assertOwner(parse(fixture, 'identity-hook.tsx'), ENGINE_OWNER),
    /selector engine initializer must be exactly the useShowroom call/,
  );
});

test('rejects derived initializer with comma constant influence', () => {
  const fixture = `
import { Badge, Box, Card, Flex, Stack, Text } from '@rottay/design-system';
import { useShowroom } from '@/components/showroom-context';
function EngineSpacingSnapshotContent({ label }: { label: string }) {
  return <Card><Text>{label}</Text></Card>;
}
export default function SpacingPage() {
  const { engine } = useShowroom();
  const engineLabel = (engine, 'Modern');
  return <EngineSpacingSnapshotContent label={engineLabel} />;
}
`;
  assert.throws(
    () => assertOwner(parse(fixture, 'comma-constant.tsx'), ENGINE_OWNER),
    /derived binding engineLabel initializer does not match the expected canonical form/,
  );
});

test('rejects content multiplied via Array.fill(Content)', () => {
  const fixture = engineFixture(
    '<Box>{Array(2).fill(<EngineSpacingSnapshotContent label={engineLabel} />)}</Box>',
  );
  assert.throws(
    () => assertOwner(parse(fixture, 'content-fill.tsx'), ENGINE_OWNER),
    /expected exactly 1 EngineSpacingSnapshotContent inside the owner return/,
  );
});

test('rejects content gated behind false && <Content/>', () => {
  const fixture = engineFixture(
    '<Box>{false && <EngineSpacingSnapshotContent label={engineLabel} />}</Box>',
  );
  assert.throws(
    () => assertOwner(parse(fixture, 'content-false-and.tsx'), ENGINE_OWNER),
    /expected exactly 1 EngineSpacingSnapshotContent inside the owner return/,
  );
});

test('rejects local homonym content declaration shadowing the live cell', () => {
  const fixture = `
import { Badge, Box, Card, Flex, Stack, Text } from '@rottay/design-system';
import { useShowroom } from '@/components/showroom-context';
function EngineSpacingSnapshotContent({ label }: { label: string }) {
  return <Card><Text>{label}</Text></Card>;
}
export default function SpacingPage() {
  function EngineSpacingSnapshotContent({ label }: { label: string }) {
    return <Box>{label}</Box>;
  }
  const { engine } = useShowroom();
  const engineLabel = engine.charAt(0).toUpperCase() + engine.slice(1);
  return <EngineSpacingSnapshotContent label={engineLabel} />;
}
`;
  assert.throws(
    () => assertOwner(parse(fixture, 'content-homonym.tsx'), ENGINE_OWNER),
    /expected exactly 1 top-level EngineSpacingSnapshotContent declaration/,
  );
});

test('rejects skeleton Card gated behind false && <Card/>', () => {
  const fixture = `
import dynamic from 'next/dynamic';
import { Box, Card, Stack } from '@rottay/design-system';
const ThemePreviewGrid = dynamic(
  () => import('./theme-preview-grid').then((module) => module.ThemePreviewGrid),
  {
    ssr: false,
    loading: () => (
      <Box>
        {false && (
          <Card style={{ height: 280 }}>
            <Stack spacing="md" />
          </Card>
        )}
      </Box>
    ),
  },
);
export function ThemePreviewGridDeferred() { return <ThemePreviewGrid />; }
`;
  assert.throws(
    () => assertDeferredSkeletonCount1(parse(fixture, 'skeleton-false-and.tsx'), 'skeleton-false-and.tsx'),
    /expected 0 Cards inside nested\/callback functions|expected exactly 1 Card/,
  );
});

test('rejects local homonym Card in the skeleton', () => {
  const fixture = `
import dynamic from 'next/dynamic';
import { Box, Stack } from '@rottay/design-system';
function Card({ children, style }: { children?: unknown; style?: unknown }) {
  return <Box style={style}>{children}</Box>;
}
const ThemePreviewGrid = dynamic(
  () => import('./theme-preview-grid').then((module) => module.ThemePreviewGrid),
  {
    ssr: false,
    loading: () => (
      <Box>
        <Card style={{ height: 280 }}>
          <Stack spacing="md" />
        </Card>
      </Box>
    ),
  },
);
export function ThemePreviewGridDeferred() { return <ThemePreviewGrid />; }
`;
  assert.throws(
    () => assertDeferredSkeletonCount1(parse(fixture, 'skeleton-local-card.tsx'), 'skeleton-local-card.tsx'),
    /to resolve to the Card import from @rottay\/design-system/,
  );
});

test('rejects non-literal element access DS[k] (helper key)', () => {
  const fixture = `
import * as DS from '@rottay/design-system';
import { useShowroom } from '@/components/showroom-context';
function EngineSpacingSnapshotContent({ label }: { label: string }) {
  return <DS.Card><DS.Text>{label}</DS.Text></DS.Card>;
}
export default function SpacingPage() {
  const { engine } = useShowroom();
  const engineLabel = engine.charAt(0).toUpperCase() + engine.slice(1);
  const k = 'getKnownTenantConfig';
  DS[k]('rottay');
  return <EngineSpacingSnapshotContent label={engineLabel} />;
}
`;
  assert.throws(
    () => assertOwner(parse(fixture, 'ds-computed-helper.tsx'), ENGINE_OWNER),
    /namespace element access must use static safe literal keys/,
  );
});

test('rejects non-literal element access DS[k] (provider key)', () => {
  const fixture = `
import * as DS from '@rottay/design-system';
import { useShowroom } from '@/components/showroom-context';
function EngineSpacingSnapshotContent({ label }: { label: string }) {
  return <DS.Card><DS.Text>{label}</DS.Text></DS.Card>;
}
export default function SpacingPage() {
  const { engine } = useShowroom();
  const engineLabel = engine.charAt(0).toUpperCase() + engine.slice(1);
  const k = 'DesignSystemProvider';
  const P = DS[k];
  return <P><EngineSpacingSnapshotContent label={engineLabel} /></P>;
}
`;
  assert.throws(
    () => assertOwner(parse(fixture, 'ds-computed-dsp.tsx'), ENGINE_OWNER),
    /namespace element access must use static safe literal keys/,
  );
});

test('allows a safe namespace Card in the skeleton (DS.Card)', () => {
  const fixture = `
import dynamic from 'next/dynamic';
import * as DS from '@rottay/design-system';
const ThemePreviewGrid = dynamic(
  () => import('./theme-preview-grid').then((module) => module.ThemePreviewGrid),
  {
    ssr: false,
    loading: () => (
      <DS.Box>
        <DS.Card style={{ height: 280 }}>
          <DS.Stack spacing="md" />
        </DS.Card>
      </DS.Box>
    ),
  },
);
export function ThemePreviewGridDeferred() { return <ThemePreviewGrid />; }
`;
  assert.doesNotThrow(() =>
    assertDeferredSkeletonCount1(parse(fixture, 'skeleton-safe-namespace.tsx'), 'skeleton-safe-namespace.tsx'),
  );
});

test('rejects namespace destructuring of forbidden helper and provider', () => {
  const helperFixture = `
import * as DS from '@rottay/design-system';
import { useShowroom } from '@/components/showroom-context';
function EngineSpacingSnapshotContent({ label }: { label: string }) {
  return <DS.Card><DS.Text>{label}</DS.Text></DS.Card>;
}
export default function SpacingPage() {
  const { engine } = useShowroom();
  const engineLabel = engine.charAt(0).toUpperCase() + engine.slice(1);
  const { getKnownTenantConfig } = DS;
  return <EngineSpacingSnapshotContent label={engineLabel} />;
}
`;
  assert.throws(
    () => assertOwner(parse(helperFixture, 'ns-destructure-helper.tsx'), ENGINE_OWNER),
    /namespace destructuring of forbidden bindings is not allowed.*getKnownTenantConfig/,
  );

  const dspFixture = helperFixture.replace(
    'const { getKnownTenantConfig } = DS;',
    'const { DesignSystemProvider } = DS;',
  );
  assert.throws(
    () => assertOwner(parse(dspFixture, 'ns-destructure-dsp.tsx'), ENGINE_OWNER),
    /namespace destructuring of forbidden bindings is not allowed.*DesignSystemProvider/,
  );
});
