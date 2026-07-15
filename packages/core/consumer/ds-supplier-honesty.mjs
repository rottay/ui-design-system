#!/usr/bin/env node

// Canonical app-side supplier gate. Copies committed in app repos are generated
// distribution artifacts and are verified byte-for-byte when this CLI is installed.

import { existsSync, readFileSync, readdirSync, realpathSync } from "node:fs";
import { basename, dirname, extname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import typescript from "typescript";

const cliPath = fileURLToPath(import.meta.url);
const scriptDir = dirname(cliPath);
const DS_PACKAGE = "@rottay/design-system";
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const LEGACY_CONTRACTLESS_VERSIONS = Object.freeze({
  "app-platform": "2.17.0",
  "app-bithire": "2.19.0",
  "app-evnto": "2.8.24",
});
const runtimeAnalysisCache = new Map();
const runtimeTypeContexts = new Map();

function runtimeCompilerOptions(ts, files = []) {
  const options = {
    allowJs: true,
    checkJs: false,
    jsx: ts.JsxEmit.Preserve,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    noLib: false,
    noResolve: false,
    skipLibCheck: true,
    target: ts.ScriptTarget.Latest,
  };
  const firstFile = files[0];
  const configPath = firstFile && ts.findConfigFile(dirname(firstFile), ts.sys.fileExists);
  if (configPath) {
    const loaded = ts.readConfigFile(configPath, ts.sys.readFile);
    if (!loaded.error) {
      const parsed = ts.parseJsonConfigFileContent(loaded.config, ts.sys, dirname(configPath));
      if (parsed.options.baseUrl !== undefined) options.baseUrl = parsed.options.baseUrl;
      if (parsed.options.paths !== undefined) options.paths = parsed.options.paths;
      if (parsed.options.rootDirs !== undefined) options.rootDirs = parsed.options.rootDirs;
    }
  }
  return options;
}

function runtimeCompilerHost(ts, options, overlay = null) {
  const baseHost = ts.createCompilerHost(options);
  const defaultLibDirectory = resolve(dirname(baseHost.getDefaultLibFileName(options)));
  const overlayPath = overlay && resolve(overlay.fileName);
  const sameAsOverlay = (candidate) => overlay && (
    candidate === overlay.fileName || resolve(candidate) === overlayPath
  );
  const standardLibraryFile = (candidate) => {
    const absolute = resolve(candidate);
    return dirname(absolute) === defaultLibDirectory && /^lib\..*\.d\.ts$/.test(basename(absolute));
  };
  const localFile = (candidate) => (
    sameAsOverlay(candidate) || standardLibraryFile(candidate) ||
    (!candidate.split(sep).join("/").includes("/node_modules/") && baseHost.fileExists(candidate))
  );
  return {
    ...baseHost,
    fileExists: localFile,
    getSourceFile: (candidate, languageVersion, onError, shouldCreateNewSourceFile) => {
      if (sameAsOverlay(candidate)) return overlay.sourceFile;
      if (!localFile(candidate)) return undefined;
      return baseHost.getSourceFile(candidate, languageVersion, onError, shouldCreateNewSourceFile);
    },
    readFile: (candidate) => {
      if (sameAsOverlay(candidate)) return overlay.source;
      return localFile(candidate) ? baseHost.readFile(candidate) : undefined;
    },
    writeFile: () => {},
  };
}

function runtimeTypeContextFor(fileName) {
  return runtimeTypeContexts.get(resolve(fileName));
}

function readRecordValue(value, key) {
  if (typeof value !== "object" || value === null) return undefined;
  return Reflect.get(value, key);
}

function arrayValueAt(values, integer) {
  if (!Array.isArray(values) || !Number.isInteger(integer)) return undefined;
  const normalized = integer < 0 ? values.length + integer : integer;
  if (normalized < 0 || normalized >= values.length) return undefined;
  return values.slice(normalized, normalized + 1)[0];
}

function primeRuntimeTypeContext(ts, files) {
  const roots = [...new Set(files.map((file) => resolve(file)))];
  if (roots.length === 0) return null;
  const rootSources = new Map(roots.map((file) => [file, readFileSync(file, "utf8")]));
  const existing = runtimeTypeContexts.get(roots[0]);
  if (
    existing && existing.rootSources?.size === rootSources.size &&
    roots.every((file) => (
      runtimeTypeContexts.get(file) === existing && existing.rootSources.get(file) === rootSources.get(file)
    ))
  ) return existing;
  const options = runtimeCompilerOptions(ts, roots);
  const program = ts.createProgram(roots, options, runtimeCompilerHost(ts, options));
  const context = { checker: program.getTypeChecker(), program, rootSources };
  for (const sourceFile of program.getSourceFiles()) {
    runtimeTypeContexts.set(resolve(sourceFile.fileName), context);
  }
  return context;
}

function packageRoot(specifier) {
  if (!specifier || specifier.startsWith(".") || specifier.startsWith("/") || specifier.startsWith("node:")) return null;
  const parts = specifier.split("/");
  return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
}

function isProductionSource(path) {
  const normalized = path.split(sep).join("/");
  return (
    SOURCE_EXTENSIONS.has(extname(path)) &&
    !normalized.includes("/tests/") &&
    !normalized.includes("/__tests__/") &&
    !/\.(?:test|spec|stories)\.[cm]?[jt]sx?$/.test(normalized) &&
    !normalized.endsWith(".d.ts")
  );
}

function walk(root) {
  const files = [];
  const pending = [root];
  while (pending.length > 0) {
    const current = pending.pop();
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      if (["node_modules", ".git", ".next", "dist"].includes(entry.name)) continue;
      const path = resolve(current, entry.name);
      if (entry.isDirectory()) pending.push(path);
      else if (entry.isFile() && isProductionSource(path)) files.push(path);
    }
  }
  return files.sort();
}

function dsEntrypoint(specifier) {
  if (specifier === DS_PACKAGE) return ".";
  return specifier.startsWith(`${DS_PACKAGE}/`) ? `./${specifier.slice(DS_PACKAGE.length + 1)}` : null;
}

function addEvidence(map, key, evidence) {
  const values = map.get(key) ?? [];
  values.push(evidence);
  map.set(key, values);
}

function runtimeScriptKind(ts, fileName) {
  if (/\.tsx$/i.test(fileName)) return ts.ScriptKind.TSX;
  if (/\.jsx$/i.test(fileName)) return ts.ScriptKind.JSX;
  if (/\.(?:js|mjs|cjs)$/i.test(fileName)) return ts.ScriptKind.JS;
  return ts.ScriptKind.TS;
}

function requiresCallableComputedAnalysis(ts, sourceFile) {
  let required = false;
  function unwrap(expression) {
    let current = expression;
    while (
      ts.isParenthesizedExpression(current) || ts.isAsExpression(current) ||
      ts.isTypeAssertionExpression(current) || ts.isNonNullExpression(current) ||
      ts.isSatisfiesExpression(current)
    ) current = current.expression;
    return current;
  }
  function staticallyNamed(expression) {
    if (!expression) return false;
    const current = unwrap(expression);
    if (ts.isStringLiteralLike(current) || ts.isNumericLiteral(current)) return true;
    if (
      ts.isBinaryExpression(current) && current.operatorToken.kind === ts.SyntaxKind.PlusToken
    ) return staticallyNamed(current.left) && staticallyNamed(current.right);
    if (ts.isTemplateExpression(current)) {
      return current.templateSpans.every((span) => staticallyNamed(span.expression));
    }
    return false;
  }
  function visit(node) {
    if (required) return;
    if (
      ts.isElementAccessExpression(node) && !staticallyNamed(node.argumentExpression)
    ) {
      required = true;
      return;
    }
    if (
      ts.isBindingElement(node) && node.propertyName && ts.isComputedPropertyName(node.propertyName) &&
      !staticallyNamed(node.propertyName.expression)
    ) {
      required = true;
      return;
    }
    if (ts.isCallExpression(node) && node.arguments.length >= 2) {
      const callee = unwrap(node.expression);
      if (
        (ts.isPropertyAccessExpression(callee) || ts.isElementAccessExpression(callee)) &&
        !staticallyNamed(node.arguments[1])
      ) {
        const owner = unwrap(callee.expression);
        const methodExpression = ts.isElementAccessExpression(callee)
          ? unwrap(callee.argumentExpression)
          : null;
        const method = ts.isPropertyAccessExpression(callee)
          ? callee.name.text
          : (methodExpression && ts.isStringLiteralLike(methodExpression) ? methodExpression.text : null);
        if (
          ts.isIdentifier(owner) &&
          ((owner.text === 'Object' && method === 'getOwnPropertyDescriptor') ||
           (owner.text === 'Reflect' && ['get', 'getOwnPropertyDescriptor'].includes(method)))
        ) {
          required = true;
          return;
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return required;
}

function runtimeImportClauseHasValue(ts, clause) {
  if (!clause) return true;
  if (clause.isTypeOnly) return false;
  if (clause.name || (clause.namedBindings && ts.isNamespaceImport(clause.namedBindings))) return true;
  const elements = clause.namedBindings?.elements ?? [];
  return elements.length === 0 || elements.some((element) => !element.isTypeOnly);
}

function runtimeExportClauseHasValue(ts, declaration) {
  if (declaration.isTypeOnly) return false;
  if (!declaration.exportClause || ts.isNamespaceExport(declaration.exportClause)) return true;
  const elements = declaration.exportClause.elements;
  return elements.length === 0 || elements.some((element) => !element.isTypeOnly);
}

function createLexicalSymbolResolver(ts, sourceFile, checker) {
  const scopeBindings = new Map([[sourceFile, new Map()]]);
  const bindingKeys = new WeakMap();

  function isScope(node) {
    return (
      ts.isSourceFile(node) || ts.isFunctionLike(node) || ts.isBlock(node) ||
      ts.isCaseBlock(node) || ts.isCatchClause(node) || ts.isModuleBlock(node) ||
      ts.isForStatement(node) || ts.isForInStatement(node) || ts.isForOfStatement(node) ||
      ts.isClassStaticBlockDeclaration(node)
    );
  }
  function bindingsFor(scope) {
    let bindings = scopeBindings.get(scope);
    if (!bindings) {
      bindings = new Map();
      scopeBindings.set(scope, bindings);
    }
    return bindings;
  }
  function registerBinding(name, scope) {
    if (ts.isIdentifier(name)) {
      const key = checker.getSymbolAtLocation(name) ?? { declarations: [name.parent] };
      bindingKeys.set(name, key);
      bindingsFor(scope).set(name.text, key);
      return;
    }
    if (ts.isObjectBindingPattern(name) || ts.isArrayBindingPattern(name)) {
      for (const element of name.elements) {
        if (ts.isBindingElement(element)) registerBinding(element.name, scope);
      }
    }
  }
  function nearestVarScope(scope) {
    let current = scope;
    while (current && !ts.isSourceFile(current) && !ts.isFunctionLike(current)) current = current.parent;
    return current ?? sourceFile;
  }
  function visit(node, enclosingScope) {
    if (ts.isFunctionDeclaration(node) && node.name) registerBinding(node.name, enclosingScope);
    if (ts.isClassDeclaration(node) && node.name) registerBinding(node.name, enclosingScope);
    if (ts.isEnumDeclaration(node)) registerBinding(node.name, enclosingScope);
    if (ts.isModuleDeclaration(node) && ts.isIdentifier(node.name)) registerBinding(node.name, enclosingScope);
    if (ts.isImportEqualsDeclaration(node) && !node.isTypeOnly) registerBinding(node.name, enclosingScope);
    if (ts.isImportDeclaration(node) && node.importClause && !node.importClause.isTypeOnly) {
      const clause = node.importClause;
      if (clause.name) registerBinding(clause.name, enclosingScope);
      if (clause.namedBindings && ts.isNamespaceImport(clause.namedBindings)) {
        registerBinding(clause.namedBindings.name, enclosingScope);
      } else if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
        for (const element of clause.namedBindings.elements) {
          if (!element.isTypeOnly) registerBinding(element.name, enclosingScope);
        }
      }
    }

    const scope = node !== sourceFile && isScope(node) ? node : enclosingScope;
    if (scope !== enclosingScope) bindingsFor(scope);
    if (ts.isFunctionExpression(node) && node.name) registerBinding(node.name, scope);
    if (ts.isFunctionLike(node)) {
      for (const parameter of node.parameters) registerBinding(parameter.name, scope);
    }
    if (ts.isCatchClause(node) && node.variableDeclaration) {
      registerBinding(node.variableDeclaration.name, scope);
    }
    if (ts.isVariableDeclaration(node)) {
      const declarationList = node.parent;
      const blockScoped = ts.isVariableDeclarationList(declarationList) && (
        declarationList.flags & ts.NodeFlags.BlockScoped
      ) !== 0;
      registerBinding(node.name, blockScoped ? scope : nearestVarScope(scope));
    }
    ts.forEachChild(node, (child) => visit(child, scope));
  }

  visit(sourceFile, sourceFile);
  return (identifier) => {
    const ownBinding = bindingKeys.get(identifier);
    if (ownBinding) return ownBinding;
    let current = identifier.parent;
    while (current) {
      const binding = scopeBindings.get(current)?.get(identifier.text);
      if (binding) return binding;
      current = current.parent;
    }
    return checker.getSymbolAtLocation(identifier);
  };
}

function createRuntimeAnalysisProgram(ts, source, fileName) {
  const shared = runtimeTypeContextFor(fileName);
  if (shared) {
    const sharedSourceFile = shared.program.getSourceFile(resolve(fileName));
    if (sharedSourceFile) {
      return {
        checker: shared.checker,
        sourceFile: sharedSourceFile,
        symbolAt: createLexicalSymbolResolver(ts, sharedSourceFile, shared.checker),
      };
    }
  }
  const options = runtimeCompilerOptions(ts, [resolve(fileName)]);
  const sourceFile = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    runtimeScriptKind(ts, fileName),
  );
  if (
    !requiresCallableComputedAnalysis(ts, sourceFile) &&
    !/\b(?:require|module|Function|eval|createRequire|globalThis|global|window|Reflect|process)\b/.test(source)
  ) {
    const checker = { getSymbolAtLocation: () => undefined };
    return { checker, sourceFile, symbolAt: createLexicalSymbolResolver(ts, sourceFile, checker) };
  }
  const host = runtimeCompilerHost(ts, options, { fileName, source, sourceFile });
  const program = ts.createProgram([fileName], options, host);
  const checker = program.getTypeChecker();
  const programSourceFile = program.getSourceFile(fileName) ?? sourceFile;
  return {
    checker,
    sourceFile: programSourceFile,
    symbolAt: createLexicalSymbolResolver(ts, programSourceFile, checker),
  };
}

function analyzeRuntimeModuleEdges(source, fileName, ts) {
  const typeContext = runtimeTypeContextFor(fileName);
  const cached = runtimeAnalysisCache.get(fileName);
  if (
    cached?.source === source && cached.typescript === ts && cached.typeContext === typeContext
  ) return cached.analysis;

  if (!/\.(?:[cm]?[jt]sx?)$/i.test(fileName)) {
    const analysis = {
      edges: [],
      sourceFile: ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true),
    };
    runtimeAnalysisCache.set(fileName, { analysis, source, typeContext, typescript: ts });
    return analysis;
  }

  const { checker, sourceFile, symbolAt } = createRuntimeAnalysisProgram(ts, source, fileName);
  const edges = [];
  const createRequireSymbols = new Set();
  const nodeModuleObjectSymbols = new Set();
  const globalAliasSymbols = new Set();
  const globalAliasAssignments = [];
  const globalFactorySymbols = new Set();
  const globalFactoryNodes = new Set();
  const globalFactoryAssignments = [];
  const localFunctionBindings = new Map();
  const parameterSafetyCache = new WeakMap();
  const loaderNames = new Set(['require', 'module', 'createRequire', 'eval', 'Function', 'process']);
  const toolingModuleSpecifiers = new Set(['module', 'node:module']);
  const globalContainerNames = new Set(['globalThis', 'global', 'window']);
  const globalContainerRootProperties = new Set([
    ...globalContainerNames, 'frames', 'parent', 'self', 'top',
  ]);
  const safeDescriptorMethods = new Set(['defineProperty', 'getOwnPropertyDescriptor', 'hasOwn']);
  const safeReflectMethods = new Set([
    'defineProperty', 'deleteProperty', 'get', 'getOwnPropertyDescriptor',
    'getPrototypeOf', 'has', 'isExtensible', 'ownKeys', 'preventExtensions',
    'set', 'setPrototypeOf',
  ]);
  const reflectExtractionMethods = new Set(['get', 'getOwnPropertyDescriptor']);
  const safeGlobalEventConstructors = new Set([
    'FocusEvent', 'KeyboardEvent', 'MouseEvent', 'UIEvent', 'WheelEvent',
  ]);
  const safeProcessDataProperties = new Set([
    'allowedNodeEnvironmentFlags', 'arch', 'argv', 'config', 'connected',
    'debugPort', 'env', 'execArgv', 'execPath', 'exitCode', 'features', 'pid', 'platform',
    'ppid', 'release', 'stderr', 'stdin', 'stdout', 'title', 'version', 'versions',
  ]);
  const safeProcessCallMethods = new Set([
    'abort', 'addListener', 'chdir', 'cpuUsage', 'cwd', 'disconnect', 'emit',
    'emitWarning', 'exit', 'getActiveResourcesInfo', 'getegid', 'geteuid',
    'getgid', 'getgroups', 'getuid', 'hasUncaughtExceptionCaptureCallback',
    'hrtime', 'kill', 'memoryUsage', 'nextTick', 'off', 'on', 'once',
    'removeAllListeners', 'removeListener', 'resourceUsage', 'send', 'setegid',
    'seteuid', 'setgid', 'setgroups', 'setuid', 'setUncaughtExceptionCaptureCallback',
    'umask', 'uptime',
  ]);

  function location(node) {
    const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
    return `${fileName}:${position.line + 1}:${position.character + 1}`;
  }

  function unresolved(node, kind) {
    throw new Error(
      `unresolved runtime module edge (${kind}) at ${location(node)}; ` +
      'only literal ESM, import("literal"), TypeScript import=require("literal"), ' +
      'or direct unshadowed require("literal") are allowed; loader transport is forbidden',
    );
  }

  function sourceDeclared(identifier) {
    const symbol = symbolAt(identifier);
    return Boolean(symbol && (symbol.declarations ?? []).some(
      (declaration) => declaration.getSourceFile() === sourceFile,
    ));
  }

  function unshadowed(identifier, name) {
    return identifier.text === name && !sourceDeclared(identifier);
  }

  function unwrapRuntimeExpression(expression) {
    let current = expression;
    while (
      ts.isParenthesizedExpression(current) || ts.isAsExpression(current) ||
      ts.isTypeAssertionExpression(current) || ts.isNonNullExpression(current) ||
      ts.isSatisfiesExpression(current)
    ) current = current.expression;
    return current;
  }

  function staticStringText(expression, resolvingSymbols = new Set()) {
    if (!expression) return null;
    const current = unwrapRuntimeExpression(expression);
    if (ts.isStringLiteralLike(current)) return current.text;
    if (ts.isIdentifier(current)) {
      const symbol = symbolAt(current);
      if (!symbol || resolvingSymbols.has(symbol)) return null;
      const declarations = symbol.declarations ?? [];
      if (declarations.length !== 1) return null;
      const declaration = declarations[0];
      if (
        declaration.getSourceFile() !== sourceFile ||
        !ts.isVariableDeclaration(declaration) || !ts.isIdentifier(declaration.name) ||
        !declaration.initializer || !ts.isVariableDeclarationList(declaration.parent) ||
        !(declaration.parent.flags & ts.NodeFlags.Const)
      ) return null;
      resolvingSymbols.add(symbol);
      const value = staticStringText(declaration.initializer, resolvingSymbols);
      resolvingSymbols.delete(symbol);
      return value;
    }
    if (
      ts.isBinaryExpression(current) && current.operatorToken.kind === ts.SyntaxKind.PlusToken
    ) {
      const left = staticStringText(current.left, resolvingSymbols);
      const right = staticStringText(current.right, resolvingSymbols);
      return left === null || right === null ? null : left + right;
    }
    if (ts.isTemplateExpression(current)) {
      let value = current.head.text;
      for (const span of current.templateSpans) {
        const expressionValue = staticStringText(span.expression, resolvingSymbols);
        if (expressionValue === null) return null;
        value += expressionValue + span.literal.text;
      }
      return value;
    }
    return null;
  }

  function staticPropertyText(expression) {
    if (!expression) return null;
    const current = unwrapRuntimeExpression(expression);
    if (ts.isNumericLiteral(current)) return current.text;
    return staticStringText(current);
  }

  function propertyText(expression) {
    if (ts.isPropertyAccessExpression(expression)) return expression.name.text;
    if (ts.isElementAccessExpression(expression) && expression.argumentExpression) {
      return staticPropertyText(expression.argumentExpression);
    }
    return null;
  }

  function runtimeIdentifier(identifier) {
    for (let current = identifier.parent; current && current !== sourceFile; current = current.parent) {
      if (ts.isTypeNode(current)) return false;
    }
    const parent = identifier.parent;
    if (ts.isPropertyAccessExpression(parent) && parent.name === identifier) return false;
    if (ts.isQualifiedName(parent) && parent.right === identifier) return false;
    if (
      (ts.isPropertyAssignment(parent) || ts.isMethodDeclaration(parent) ||
       ts.isPropertyDeclaration(parent) || ts.isPropertySignature(parent) ||
       ts.isMethodSignature(parent) || ts.isGetAccessorDeclaration(parent) ||
       ts.isSetAccessorDeclaration(parent)) &&
      parent.name === identifier
    ) return false;
    if (
      (ts.isVariableDeclaration(parent) || ts.isParameter(parent) ||
       ts.isFunctionDeclaration(parent) || ts.isFunctionExpression(parent) ||
       ts.isClassDeclaration(parent) || ts.isClassExpression(parent) ||
       ts.isInterfaceDeclaration(parent) || ts.isTypeAliasDeclaration(parent) ||
       ts.isEnumDeclaration(parent) || ts.isModuleDeclaration(parent) ||
       ts.isImportClause(parent) || ts.isNamespaceImport(parent) ||
       ts.isImportEqualsDeclaration(parent)) &&
      parent.name === identifier
    ) return false;
    if (ts.isBindingElement(parent) && (parent.name === identifier || parent.propertyName === identifier)) {
      return false;
    }
    if (
      (ts.isImportSpecifier(parent) || ts.isExportSpecifier(parent)) &&
      (parent.name === identifier || parent.propertyName === identifier)
    ) return false;
    if (
      (ts.isLabeledStatement(parent) || ts.isBreakOrContinueStatement(parent)) &&
      parent.label === identifier
    ) return false;
    return true;
  }

  function directRequireCall(node) {
    return ts.isCallExpression(node) && ts.isIdentifier(node.expression) &&
      unshadowed(node.expression, 'require');
  }

  function directNodeModuleRequire(expression) {
    return directRequireCall(expression) && expression.arguments.length === 1 &&
      ts.isStringLiteralLike(expression.arguments[0]) &&
      ['module', 'node:module'].includes(expression.arguments[0].text);
  }

  function localFunction(node) {
    return Boolean(node) && (
      ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node)
    );
  }

  function factoryInitializer(expression) {
    let current = expression;
    while (
      ts.isParenthesizedExpression(current) || ts.isAsExpression(current) ||
      ts.isTypeAssertionExpression(current) || ts.isNonNullExpression(current) ||
      ts.isSatisfiesExpression(current)
    ) current = current.expression;
    if (localFunction(current)) return current;
    if (
      ts.isCallExpression(current) && ts.isIdentifier(current.expression) &&
      current.expression.text === 'useCallback' && localFunction(current.arguments[0])
    ) return current.arguments[0];
    return null;
  }

  function rememberAuthorityBindings(node) {
    if (ts.isFunctionDeclaration(node) && node.name) {
      const symbol = symbolAt(node.name);
      globalFactoryAssignments.push({ node, symbol });
      if (symbol) localFunctionBindings.set(symbol, node);
    }
    if (
      ts.isImportDeclaration(node) && ts.isStringLiteralLike(node.moduleSpecifier) &&
      ['module', 'node:module'].includes(node.moduleSpecifier.text) &&
      node.importClause && !node.importClause.isTypeOnly
    ) {
      if (node.importClause.name) nodeModuleObjectSymbols.add(symbolAt(node.importClause.name));
      const bindings = node.importClause.namedBindings;
      if (bindings && ts.isNamespaceImport(bindings)) {
        nodeModuleObjectSymbols.add(symbolAt(bindings.name));
      } else if (bindings && ts.isNamedImports(bindings)) {
        for (const element of bindings.elements) {
          if (!element.isTypeOnly && (element.propertyName ?? element.name).text === 'createRequire') {
            createRequireSymbols.add(symbolAt(element.name));
          }
        }
      }
    } else if (ts.isImportEqualsDeclaration(node) && !node.isTypeOnly) {
      const reference = node.moduleReference;
      if (
        ts.isExternalModuleReference(reference) && reference.expression &&
        ts.isStringLiteralLike(reference.expression) &&
        ['module', 'node:module'].includes(reference.expression.text)
      ) nodeModuleObjectSymbols.add(symbolAt(node.name));
    } else if (ts.isVariableDeclaration(node) && node.initializer) {
      if (ts.isIdentifier(node.name)) {
        const symbol = symbolAt(node.name);
        globalAliasAssignments.push({ symbol, value: node.initializer });
        const factory = factoryInitializer(node.initializer);
        if (factory) {
          globalFactoryAssignments.push({ node: factory, symbol });
          if (symbol) localFunctionBindings.set(symbol, factory);
        }
      }
      if (ts.isIdentifier(node.name) && directNodeModuleRequire(node.initializer)) {
        nodeModuleObjectSymbols.add(symbolAt(node.name));
      } else if (ts.isObjectBindingPattern(node.name) && directNodeModuleRequire(node.initializer)) {
        for (const element of node.name.elements) {
          if (
            !element.dotDotDotToken && ts.isIdentifier(element.name) &&
            (element.propertyName ?? element.name).text === 'createRequire'
          ) createRequireSymbols.add(symbolAt(element.name));
        }
      }
    } else if (
      ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
      ts.isIdentifier(node.left)
    ) {
      const symbol = symbolAt(node.left);
      globalAliasAssignments.push({ symbol, value: node.right });
      const factory = factoryInitializer(node.right);
      if (factory) globalFactoryAssignments.push({ node: factory, symbol });
    }
    ts.forEachChild(node, rememberAuthorityBindings);
  }

  rememberAuthorityBindings(sourceFile);

  function globalContainerExpression(expression) {
    let current = expression;
    while (
      ts.isParenthesizedExpression(current) || ts.isAsExpression(current) ||
      ts.isTypeAssertionExpression(current) || ts.isNonNullExpression(current) ||
      ts.isSatisfiesExpression(current)
    ) current = current.expression;
    if (ts.isIdentifier(current)) {
      return globalAliasSymbols.has(symbolAt(current)) ||
        [...globalContainerNames].some((name) => unshadowed(current, name));
    }
    if (
      (ts.isPropertyAccessExpression(current) || ts.isElementAccessExpression(current)) &&
      globalContainerRootProperties.has(propertyText(current))
    ) return globalContainerExpression(current.expression);
    if (
      ts.isCallExpression(current) && ts.isIdentifier(current.expression) &&
      globalFactorySymbols.has(symbolAt(current.expression))
    ) return true;
    if (
      ts.isBinaryExpression(current) &&
      [ts.SyntaxKind.BarBarToken, ts.SyntaxKind.QuestionQuestionToken].includes(current.operatorToken.kind)
    ) return globalContainerExpression(current.left) || globalContainerExpression(current.right);
    if (ts.isConditionalExpression(current)) {
      return globalContainerExpression(current.whenTrue) || globalContainerExpression(current.whenFalse);
    }
    return false;
  }

  function functionReturnsGlobal(node) {
    if (ts.isArrowFunction(node) && !ts.isBlock(node.body)) {
      return globalContainerExpression(node.body);
    }
    let returnsGlobal = false;
    function walk(current) {
      if (returnsGlobal || (current !== node.body && localFunction(current))) return;
      if (ts.isReturnStatement(current)) {
        if (current.expression && globalContainerExpression(current.expression)) returnsGlobal = true;
        return;
      }
      ts.forEachChild(current, walk);
    }
    if (node.body) walk(node.body);
    return returnsGlobal;
  }

  let aliasesChanged = true;
  while (aliasesChanged) {
    aliasesChanged = false;
    for (const factory of globalFactoryAssignments) {
      if (
        factory.symbol && !globalFactorySymbols.has(factory.symbol) &&
        functionReturnsGlobal(factory.node)
      ) {
        globalFactorySymbols.add(factory.symbol);
        globalFactoryNodes.add(factory.node);
        aliasesChanged = true;
      }
    }
    for (const assignment of globalAliasAssignments) {
      if (
        assignment.symbol && !globalAliasSymbols.has(assignment.symbol) &&
        globalContainerExpression(assignment.value)
      ) {
        globalAliasSymbols.add(assignment.symbol);
        aliasesChanged = true;
      }
    }
  }

  function directBuiltinMethodCall(expression, ownerName, methodName) {
    const call = unwrapRuntimeExpression(expression);
    if (!ts.isCallExpression(call)) return false;
    const member = unwrapRuntimeExpression(call.expression);
    if (
      !(ts.isPropertyAccessExpression(member) || ts.isElementAccessExpression(member)) ||
      propertyText(member) !== methodName
    ) return false;
    const owner = unwrapRuntimeExpression(member.expression);
    return ts.isIdentifier(owner) && unshadowed(owner, ownerName);
  }

  function runtimeNode(node) {
    for (let current = node.parent; current && current !== sourceFile; current = current.parent) {
      if (ts.isTypeNode(current)) return false;
    }
    return true;
  }

  function bindingPropertyText(node) {
    const property = node.propertyName ?? node.name;
    if (ts.isIdentifier(property) || ts.isStringLiteralLike(property) || ts.isNumericLiteral(property)) return property.text;
    if (ts.isComputedPropertyName(property)) return staticPropertyText(property.expression);
    return null;
  }

  function flowSymbol(expression) {
    const value = unwrapRuntimeExpression(expression);
    return ts.isIdentifier(value) ? symbolAt(value) : null;
  }

  function conditionProvesNonCallable(condition, targetSymbol, truthy) {
    const value = unwrapRuntimeExpression(condition);
    if (ts.isPrefixUnaryExpression(value) && value.operator === ts.SyntaxKind.ExclamationToken) {
      return conditionProvesNonCallable(value.operand, targetSymbol, !truthy);
    }
    if (!ts.isBinaryExpression(value)) return false;
    if (
      value.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ||
      value.operatorToken.kind === ts.SyntaxKind.BarBarToken
    ) {
      const isAnd = value.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken;
      const bothOperandsAreKnown = (isAnd && truthy) || (!isAnd && !truthy);
      const left = conditionProvesNonCallable(value.left, targetSymbol, truthy);
      const right = conditionProvesNonCallable(value.right, targetSymbol, truthy);
      return bothOperandsAreKnown ? left || right : left && right;
    }
    const equality = [
      ts.SyntaxKind.EqualsEqualsToken, ts.SyntaxKind.EqualsEqualsEqualsToken,
      ts.SyntaxKind.ExclamationEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken,
    ];
    if (!equality.includes(value.operatorToken.kind)) return false;
    const left = unwrapRuntimeExpression(value.left);
    const right = unwrapRuntimeExpression(value.right);
    const typeOf = ts.isTypeOfExpression(left) ? left : (ts.isTypeOfExpression(right) ? right : null);
    const literal = ts.isStringLiteralLike(left) ? left : (ts.isStringLiteralLike(right) ? right : null);
    if (!typeOf || !literal || flowSymbol(typeOf.expression) !== targetSymbol) return false;
    const operatorIsEquality = [
      ts.SyntaxKind.EqualsEqualsToken, ts.SyntaxKind.EqualsEqualsEqualsToken,
    ].includes(value.operatorToken.kind);
    const comparisonMatches = operatorIsEquality ? truthy : !truthy;
    return (literal.text === "object" && comparisonMatches) ||
      (literal.text === "function" && !comparisonMatches);
  }

  function statementCannotCompleteNormally(statement) {
    if (
      ts.isReturnStatement(statement) || ts.isThrowStatement(statement) ||
      ts.isContinueStatement(statement) || ts.isBreakStatement(statement)
    ) return true;
    if (ts.isBlock(statement)) {
      return statement.statements.some((child) => statementCannotCompleteNormally(child));
    }
    return ts.isIfStatement(statement) && Boolean(statement.elseStatement) &&
      statementCannotCompleteNormally(statement.thenStatement) &&
      statementCannotCompleteNormally(statement.elseStatement);
  }

  function flowSymbolRuntimeWrites(targetSymbol) {
    const writes = [];
    const assignmentTargetContainsTarget = (node) => {
      const target = unwrapRuntimeExpression(node);
      if (ts.isIdentifier(target)) return symbolAt(target) === targetSymbol;
      if (ts.isArrayLiteralExpression(target)) {
        return target.elements.some((element) => assignmentTargetContainsTarget(element));
      }
      if (ts.isObjectLiteralExpression(target)) {
        return target.properties.some((property) => {
          if (ts.isShorthandPropertyAssignment(property)) return symbolAt(property.name) === targetSymbol;
          if (ts.isPropertyAssignment(property)) return assignmentTargetContainsTarget(property.initializer);
          if (ts.isSpreadAssignment(property)) return assignmentTargetContainsTarget(property.expression);
          return false;
        });
      }
      if (ts.isBinaryExpression(target) && target.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
        return assignmentTargetContainsTarget(target.left);
      }
      return false;
    };
    const visit = (node) => {
      if (
        ts.isBinaryExpression(node) &&
        node.operatorToken.kind >= ts.SyntaxKind.FirstAssignment &&
        node.operatorToken.kind <= ts.SyntaxKind.LastAssignment &&
        assignmentTargetContainsTarget(node.left)
      ) {
        writes.push(node);
      }
      if (
        (ts.isPrefixUnaryExpression(node) || ts.isPostfixUnaryExpression(node)) &&
        [ts.SyntaxKind.PlusPlusToken, ts.SyntaxKind.MinusMinusToken].includes(node.operator) &&
        assignmentTargetContainsTarget(node.operand)
      ) {
        writes.push(node);
      }
      if (
        (ts.isForInStatement(node) || ts.isForOfStatement(node)) &&
        !ts.isVariableDeclarationList(node.initializer) &&
        assignmentTargetContainsTarget(node.initializer)
      ) writes.push(node);
      ts.forEachChild(node, visit);
    };
    visit(sourceFile);
    return writes;
  }

  function nearestFlowFunction(node) {
    let current = node;
    while (current && current !== sourceFile) {
      if (ts.isFunctionLike(current)) return current;
      current = current.parent;
    }
    return sourceFile;
  }

  function flowGuardRemainsValid(targetSymbol, expression, guard, checkpoint) {
    const expressionFunction = nearestFlowFunction(expression);
    const writes = flowSymbolRuntimeWrites(targetSymbol).filter((write) => (
      nearestFlowFunction(write) !== expressionFunction || write.end > checkpoint
    ));
    if (writes.length === 0) return true;
    if (writes.some((write) => nearestFlowFunction(write) !== expressionFunction)) return false;
    if (
      writes.some((write) => (
        ts.isBinaryExpression(write) && write.left.pos <= expression.pos && expression.end <= write.left.end
      ))
    ) return false;
    if (writes.some((write) => write.pos >= checkpoint && write.end <= expression.pos)) return false;
    let current = expression.parent;
    let repeatedBetweenGuardAndAccess = false;
    while (current && current !== guard && current !== guard.parent) {
      if (
        ts.isForStatement(current) || ts.isForInStatement(current) || ts.isForOfStatement(current) ||
        ts.isWhileStatement(current) || ts.isDoStatement(current)
      ) repeatedBetweenGuardAndAccess = true;
      current = current.parent;
    }
    return !repeatedBetweenGuardAndAccess;
  }

  function runtimeFlowProvesNonCallable(expression) {
    const targetSymbol = flowSymbol(expression);
    if (!targetSymbol) return false;
    let current = unwrapRuntimeExpression(expression);
    while (current.parent && current.parent !== sourceFile) {
      const parent = current.parent;
      if (ts.isFunctionLike(parent)) return false;
      if (ts.isIfStatement(parent)) {
        if (
          current === parent.thenStatement &&
          conditionProvesNonCallable(parent.expression, targetSymbol, true) &&
          flowGuardRemainsValid(targetSymbol, expression, parent, parent.expression.end)
        ) return true;
        if (
          current === parent.elseStatement &&
          conditionProvesNonCallable(parent.expression, targetSymbol, false) &&
          flowGuardRemainsValid(targetSymbol, expression, parent, parent.expression.end)
        ) return true;
      }
      if (ts.isConditionalExpression(parent)) {
        if (
          current === parent.whenTrue &&
          conditionProvesNonCallable(parent.condition, targetSymbol, true) &&
          flowGuardRemainsValid(targetSymbol, expression, parent, parent.condition.end)
        ) return true;
        if (
          current === parent.whenFalse &&
          conditionProvesNonCallable(parent.condition, targetSymbol, false) &&
          flowGuardRemainsValid(targetSymbol, expression, parent, parent.condition.end)
        ) return true;
      }
      if (ts.isBlock(parent)) {
        const statementIndex = parent.statements.indexOf(current);
        if (statementIndex >= 0) {
          for (let index = statementIndex - 1; index >= 0; index -= 1) {
            const guard = arrayValueAt(parent.statements, index);
            if (!guard) continue;
            if (
              ts.isIfStatement(guard) &&
              statementCannotCompleteNormally(guard.thenStatement) &&
              conditionProvesNonCallable(guard.expression, targetSymbol, false) &&
              flowGuardRemainsValid(targetSymbol, expression, guard, guard.end)
            ) return true;
          }
        }
      }
      current = parent;
    }
    return false;
  }

  function standardLibraryCallableType(type) {
    const symbol = type?.aliasSymbol ?? type?.symbol;
    if (!["Function", "CallableFunction", "NewableFunction"].includes(symbol?.name)) return false;
    return (symbol.declarations ?? []).some((declaration) => (
      declaration.getSourceFile().fileName.split(sep).join("/").includes("/typescript/lib/lib.")
    ));
  }

  function typePotentiallyCallable(type, seen = new Set()) {
    if (!type || seen.has(type)) return true;
    seen.add(type);
    if (type.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown | ts.TypeFlags.NonPrimitive)) return true;
    if (type.intrinsicName === "error" || standardLibraryCallableType(type)) return true;
    if (
      checker.getSignaturesOfType(type, ts.SignatureKind.Call).length > 0 ||
      checker.getSignaturesOfType(type, ts.SignatureKind.Construct).length > 0
    ) return true;
    if (type.flags & ts.TypeFlags.TypeParameter) {
      const constraint = checker.getBaseConstraintOfType(type);
      return !constraint || constraint === type || typePotentiallyCallable(constraint, seen);
    }
    return Array.isArray(type.types) && type.types.some((part) => typePotentiallyCallable(part, seen));
  }

  function typeNodeProvesNonCallable(node) {
    if (!node || typeof checker.getTypeFromTypeNode !== "function") return false;
    return !typePotentiallyCallable(checker.getTypeFromTypeNode(node));
  }

  function expressionAnnotationProvesNonCallable(expression, resolvingSymbols = new Set()) {
    let current = expression;
    while (
      ts.isParenthesizedExpression(current) || ts.isNonNullExpression(current) ||
      ts.isSatisfiesExpression(current)
    ) current = current.expression;
    if (ts.isAsExpression(current) || ts.isTypeAssertionExpression(current)) {
      return expressionAnnotationProvesNonCallable(current.expression, resolvingSymbols);
    }
    if (ts.isObjectLiteralExpression(current) || ts.isArrayLiteralExpression(current)) return true;
    const value = unwrapRuntimeExpression(current);
    const symbol = ts.isIdentifier(value)
      ? symbolAt(value)
      : (ts.isPropertyAccessExpression(value)
        ? checker.getSymbolAtLocation(value.name)
        : (ts.isElementAccessExpression(value)
          ? checker.getSymbolAtLocation(value.argumentExpression) ?? checker.getSymbolAtLocation(value)
          : null));
    if (!symbol || resolvingSymbols.has(symbol)) return false;
    resolvingSymbols.add(symbol);
    const proven = (symbol.declarations ?? []).some((declaration) => {
      if (
        !(ts.isVariableDeclaration(declaration) || ts.isParameter(declaration) ||
          ts.isPropertyDeclaration(declaration) || ts.isPropertySignature(declaration))
      ) return false;
      if (declaration.type) return typeNodeProvesNonCallable(declaration.type);
      return ts.isVariableDeclaration(declaration) && declaration.initializer &&
        expressionAnnotationProvesNonCallable(declaration.initializer, resolvingSymbols);
    });
    resolvingSymbols.delete(symbol);
    return proven;
  }

  function callableExpression(expression, resolvingSymbols = new Set()) {
    if (!expression || typeof checker.getTypeAtLocation !== 'function') return false;
    let runtimeValue = expression;
    while (
      ts.isParenthesizedExpression(runtimeValue) || ts.isNonNullExpression(runtimeValue) ||
      ts.isSatisfiesExpression(runtimeValue)
    ) runtimeValue = runtimeValue.expression;
    if (ts.isAsExpression(runtimeValue) || ts.isTypeAssertionExpression(runtimeValue)) {
      return callableExpression(runtimeValue.expression, resolvingSymbols);
    }
    if (runtimeFlowProvesNonCallable(runtimeValue)) return false;
    if (ts.isIdentifier(runtimeValue)) {
      const symbol = symbolAt(runtimeValue);
      if (symbol && !resolvingSymbols.has(symbol)) {
        resolvingSymbols.add(symbol);
        const initializerCarriesCapability = (symbol.declarations ?? []).some((declaration) => (
          (ts.isVariableDeclaration(declaration) || ts.isParameter(declaration) ||
           ts.isPropertyDeclaration(declaration)) && declaration.initializer &&
          callableExpression(declaration.initializer, resolvingSymbols)
        ));
        resolvingSymbols.delete(symbol);
        if (initializerCarriesCapability) return true;
      }
    }
    if (expressionAnnotationProvesNonCallable(expression)) return false;
    return typePotentiallyCallable(checker.getTypeAtLocation(unwrapRuntimeExpression(expression)));
  }

  function bindingSourceExpression(node) {
    const pattern = node.parent;
    const owner = pattern?.parent;
    if (
      (ts.isVariableDeclaration(owner) || ts.isParameter(owner)) && owner.name === pattern
    ) return owner.initializer ?? null;
    return null;
  }

  function unsupportedConstructorAccess(node) {
    if (!runtimeNode(node)) return false;
    if (
      (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) &&
      propertyText(node) === 'constructor'
    ) return true;
    if (
      ts.isElementAccessExpression(node) && propertyText(node) === null &&
      callableExpression(node.expression)
    ) return true;
    if (
      ts.isBindingElement(node) && ts.isObjectBindingPattern(node.parent) &&
      bindingPropertyText(node) === 'constructor'
    ) return true;
    if (
      ts.isBindingElement(node) && ts.isObjectBindingPattern(node.parent) &&
      node.propertyName && ts.isComputedPropertyName(node.propertyName) && bindingPropertyText(node) === null &&
      callableExpression(bindingSourceExpression(node))
    ) return true;
    if (!ts.isCallExpression(node)) return false;
    const descriptorAccess = (
      directBuiltinMethodCall(node, 'Object', 'getOwnPropertyDescriptor') ||
      directBuiltinMethodCall(node, 'Reflect', 'get') ||
      directBuiltinMethodCall(node, 'Reflect', 'getOwnPropertyDescriptor')
    );
    if (!descriptorAccess) return false;
    const property = staticPropertyText(node.arguments[1]);
    return property === 'constructor' || (
      property === null && callableExpression(node.arguments[0])
    );
  }

  function safeProcessUse(identifier) {
    let value = identifier;
    while (
      (ts.isParenthesizedExpression(value.parent) || ts.isAsExpression(value.parent) ||
       ts.isTypeAssertionExpression(value.parent) || ts.isNonNullExpression(value.parent) ||
       ts.isSatisfiesExpression(value.parent)) && value.parent.expression === value
    ) value = value.parent;
    const member = value.parent;
    if (
      !(ts.isPropertyAccessExpression(member) || ts.isElementAccessExpression(member)) ||
      member.expression !== value
    ) return false;
    const property = propertyText(member);
    if (safeProcessDataProperties.has(property)) return true;
    return safeProcessCallMethods.has(property) &&
      ts.isCallExpression(member.parent) && member.parent.expression === member;
  }

  function assertProductionRuntimeSpecifier(node, specifier) {
    if (toolingModuleSpecifiers.has(specifier)) {
      unresolved(node, 'tooling-only node:module runtime edge');
    }
  }

  function addEdge(specifier, kind, node, clause = null) {
    edges.push({ clause, kind, node, specifier });
  }

  function safeGlobalContainerUse(identifier, active = new Set()) {
    let value = identifier;
    while (true) {
      const next = value.parent;
      if (
        (ts.isParenthesizedExpression(next) || ts.isAsExpression(next) ||
         ts.isTypeAssertionExpression(next) || ts.isNonNullExpression(next) ||
         ts.isSatisfiesExpression(next)) && next.expression === value
      ) {
        value = next;
        continue;
      }
      if (
        (
          ts.isBinaryExpression(next) &&
          [ts.SyntaxKind.BarBarToken, ts.SyntaxKind.QuestionQuestionToken].includes(next.operatorToken.kind)
        ) || ts.isConditionalExpression(next)
      ) {
        value = next;
        continue;
      }
      if (
        (ts.isPropertyAccessExpression(next) || ts.isElementAccessExpression(next)) &&
        next.expression === value && globalContainerRootProperties.has(propertyText(next))
      ) {
        value = next;
        continue;
      }
      break;
    }
    const parent = value.parent;
    if (
      ts.isArrowFunction(parent) && parent.body === value && globalFactoryNodes.has(parent)
    ) return true;
    if (ts.isReturnStatement(parent) && parent.expression === value) {
      for (let current = parent.parent; current; current = current.parent) {
        if (localFunction(current)) return globalFactoryNodes.has(current);
      }
    }
    if (
      ts.isVariableDeclaration(parent) && parent.initializer === value &&
      ts.isIdentifier(parent.name) && globalAliasSymbols.has(symbolAt(parent.name))
    ) return true;
    if (
      ts.isBinaryExpression(parent) && parent.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
      parent.right === value && ts.isIdentifier(parent.left) &&
      globalAliasSymbols.has(symbolAt(parent.left))
    ) return true;
    if (ts.isParameter(parent) && parent.initializer === value && localFunction(parent.parent)) {
      const index = parent.parent.parameters.indexOf(parent);
      return localParameterAcceptsGlobal(parent.parent, index, new Set());
    }
    if (ts.isPropertyAssignment(parent) && parent.initializer === value) {
      const property = (
        ts.isIdentifier(parent.name) || ts.isStringLiteralLike(parent.name)
      ) ? parent.name.text : null;
      const literal = parent.parent;
      const construct = literal.parent;
      if (
        property === 'view' && ts.isObjectLiteralExpression(literal) &&
        ts.isNewExpression(construct) && construct.arguments?.includes(literal) &&
        ts.isIdentifier(construct.expression) &&
        safeGlobalEventConstructors.has(construct.expression.text) &&
        unshadowed(construct.expression, construct.expression.text)
      ) return true;
    }
    if (ts.isTypeOfExpression(parent)) {
      return true;
    }
    if (ts.isPrefixUnaryExpression(parent) && parent.operator === ts.SyntaxKind.ExclamationToken) {
      return true;
    }
    if (
      (ts.isPropertyAccessExpression(parent) || ts.isElementAccessExpression(parent)) &&
      parent.expression === value
    ) {
      const property = propertyText(parent);
      return property !== null && !loaderNames.has(property) && property !== 'Reflect';
    }
    if (
      ts.isBinaryExpression(parent) &&
      [
        ts.SyntaxKind.EqualsEqualsToken, ts.SyntaxKind.EqualsEqualsEqualsToken,
        ts.SyntaxKind.ExclamationEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken,
      ].includes(parent.operatorToken.kind)
    ) return true;
    if (
      ts.isBinaryExpression(parent) && parent.left === value &&
      parent.operatorToken.kind === ts.SyntaxKind.InstanceOfKeyword
    ) return true;
    if (ts.isCallExpression(parent) && parent.arguments.includes(value)) {
      const callee = parent.expression;
      const method = (
        (ts.isPropertyAccessExpression(callee) || ts.isElementAccessExpression(callee)) &&
        ts.isIdentifier(callee.expression) && unshadowed(callee.expression, 'Object')
      ) ? propertyText(callee) : null;
      if (method && safeDescriptorMethods.has(method)) {
        const property = parent.arguments[1];
        return Boolean(
          property && ts.isStringLiteralLike(property) &&
          !loaderNames.has(property.text) && property.text !== 'Reflect',
        );
      }
      if (ts.isIdentifier(parent.expression)) {
        const fn = localFunctionBindings.get(symbolAt(parent.expression));
        const index = parent.arguments.indexOf(value);
        if (fn && index >= 0) return localParameterAcceptsGlobal(fn, index, active);
      }
      return false;
    }
    return false;
  }

  function localParameterAcceptsGlobal(fn, index, active) {
    let cache = parameterSafetyCache.get(fn);
    if (!cache) {
      cache = new Map();
      parameterSafetyCache.set(fn, cache);
    }
    if (cache.has(index)) return cache.get(index);
    if (active.has(fn)) return false;
    const parameter = arrayValueAt(fn.parameters, index);
    if (!parameter || !ts.isIdentifier(parameter.name)) return false;
    const symbol = symbolAt(parameter.name);
    if (!symbol) return false;
    const nextActive = new Set(active).add(fn);
    let safe = true;
    function inspect(current) {
      if (!safe || (current !== fn.body && localFunction(current))) return;
      if (
        ts.isIdentifier(current) && runtimeIdentifier(current) && symbolAt(current) === symbol &&
        !safeGlobalContainerUse(current, nextActive)
      ) safe = false;
      ts.forEachChild(current, inspect);
    }
    if (fn.body) inspect(fn.body);
    cache.set(index, safe);
    return safe;
  }

  function hookDependencyUse(identifier) {
    const array = identifier.parent;
    if (!ts.isArrayLiteralExpression(array)) return false;
    const call = array.parent;
    if (!ts.isCallExpression(call) || !call.arguments.includes(array)) return false;
    const callee = call.expression;
    const name = ts.isIdentifier(callee) ? callee.text : propertyText(callee);
    return ['useCallback', 'useEffect', 'useLayoutEffect', 'useMemo'].includes(name);
  }

  function safeReflectUse(identifier) {
    const member = identifier.parent;
    if (
      !(ts.isPropertyAccessExpression(member) || ts.isElementAccessExpression(member)) ||
      member.expression !== identifier
    ) return false;
    const method = propertyText(member);
    if (!method || !safeReflectMethods.has(method)) return false;
    const call = member.parent;
    if (!ts.isCallExpression(call) || call.expression !== member) return false;

    const target = call.arguments[0];
    if (!target || globalContainerExpression(target)) return false;
    let currentTarget = target;
    while (
      ts.isParenthesizedExpression(currentTarget) || ts.isAsExpression(currentTarget) ||
      ts.isTypeAssertionExpression(currentTarget) || ts.isNonNullExpression(currentTarget) ||
      ts.isSatisfiesExpression(currentTarget)
    ) currentTarget = currentTarget.expression;
    if (
      directNodeModuleRequire(currentTarget) ||
      (ts.isIdentifier(currentTarget) && nodeModuleObjectSymbols.has(symbolAt(currentTarget)))
    ) return false;

    if (reflectExtractionMethods.has(method)) {
      const property = call.arguments[1];
      if (!property) return false;
      if (
        ts.isStringLiteralLike(property) &&
        (loaderNames.has(property.text) || property.text === 'Reflect')
      ) return false;
    }
    return true;
  }

  function nodeModuleObjectUseAllowed(identifier) {
    const parent = identifier.parent;
    if (
      (ts.isPropertyAccessExpression(parent) || ts.isElementAccessExpression(parent)) &&
      parent.expression === identifier
    ) {
      const property = propertyText(parent);
      return property !== null && property !== 'createRequire';
    }
    return false;
  }

  function visit(node) {
    if (unsupportedConstructorAccess(node)) {
      unresolved(node, 'constructor property capability');
    } else if (ts.isImportDeclaration(node)) {
      if (runtimeImportClauseHasValue(ts, node.importClause)) {
        if (!ts.isStringLiteralLike(node.moduleSpecifier)) unresolved(node, 'ESM import');
        assertProductionRuntimeSpecifier(node, node.moduleSpecifier.text);
        addEdge(node.moduleSpecifier.text, 'import', node, node.importClause ?? null);
      }
    } else if (ts.isExportDeclaration(node)) {
      if (runtimeExportClauseHasValue(ts, node) && node.moduleSpecifier) {
        if (!ts.isStringLiteralLike(node.moduleSpecifier)) unresolved(node, 'ESM export');
        assertProductionRuntimeSpecifier(node, node.moduleSpecifier.text);
        addEdge(node.moduleSpecifier.text, 'export', node, node.exportClause ?? null);
      }
    } else if (ts.isImportEqualsDeclaration(node) && !node.isTypeOnly) {
      const reference = node.moduleReference;
      if (ts.isExternalModuleReference(reference)) {
        if (!reference.expression || !ts.isStringLiteralLike(reference.expression)) {
          unresolved(node, 'TypeScript import=require');
        }
        assertProductionRuntimeSpecifier(node, reference.expression.text);
        addEdge(reference.expression.text, 'import-equals', node);
      }
    } else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      if (node.arguments.length < 1 || !ts.isStringLiteralLike(node.arguments[0])) {
        unresolved(node, 'dynamic import');
      }
      assertProductionRuntimeSpecifier(node, node.arguments[0].text);
      addEdge(node.arguments[0].text, 'dynamic-import', node);
    } else if (directRequireCall(node)) {
      if (node.arguments.length !== 1 || !ts.isStringLiteralLike(node.arguments[0])) {
        unresolved(node, 'direct require');
      }
      assertProductionRuntimeSpecifier(node, node.arguments[0].text);
      addEdge(node.arguments[0].text, 'require', node);
    } else if (
      ts.isCallExpression(node) && ts.isIdentifier(node.expression) &&
      globalFactorySymbols.has(symbolAt(node.expression)) && !safeGlobalContainerUse(node)
    ) {
      unresolved(node, 'global container factory result transport');
    } else if (
      (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) &&
      propertyText(node) === 'createRequire' &&
      (
        (ts.isIdentifier(node.expression) && nodeModuleObjectSymbols.has(symbolAt(node.expression))) ||
        directNodeModuleRequire(node.expression)
      )
    ) {
      unresolved(node, 'createRequire capability');
    } else if (ts.isIdentifier(node) && runtimeIdentifier(node)) {
      const symbol = symbolAt(node);
      if (createRequireSymbols.has(symbol)) unresolved(node, 'createRequire capability transport');
      if (nodeModuleObjectSymbols.has(symbol) && !nodeModuleObjectUseAllowed(node)) {
        unresolved(node, 'node:module capability transport');
      }
      if (globalAliasSymbols.has(symbol) && !safeGlobalContainerUse(node)) {
        unresolved(node, 'global loader container transport');
      }
      if (
        globalFactorySymbols.has(symbol) &&
        !(ts.isCallExpression(node.parent) && node.parent.expression === node) &&
        !hookDependencyUse(node)
      ) unresolved(node, 'global container factory transport');
      if (unshadowed(node, 'require')) {
        const parent = node.parent;
        if (!(ts.isCallExpression(parent) && parent.expression === node)) {
          unresolved(node, 'require capability transport');
        }
      } else if (unshadowed(node, 'module')) {
        unresolved(node, 'module capability transport');
      } else if (unshadowed(node, 'eval')) {
        unresolved(node, 'eval capability transport');
      } else if (unshadowed(node, 'Function')) {
        unresolved(node, 'Function constructor capability transport');
      } else if (unshadowed(node, 'process') && !safeProcessUse(node)) {
        unresolved(node, 'process capability transport');
      } else if (unshadowed(node, 'Reflect') && !safeReflectUse(node)) {
        unresolved(node, 'Reflect capability transport');
      } else if (
        [...globalContainerNames].some((name) => unshadowed(node, name)) &&
        !safeGlobalContainerUse(node)
      ) {
        unresolved(node, 'global loader container transport');
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  const analysis = { edges, sourceFile };
  runtimeAnalysisCache.set(fileName, { analysis, source, typeContext, typescript: ts });
  return analysis;
}
export function scanAppSuppliers({ appRoot, contract, typescript }) {
  const directSuppliers = new Map();
  const dsSymbols = new Map();
  const files = walk(resolve(appRoot, "src"));
  primeRuntimeTypeContext(typescript, files);

  function isSupplier(specifier) {
    const root = packageRoot(specifier);
    return Boolean(
      contract.supplierPackages.includes(root) ||
      root?.startsWith("d3-") ||
      root?.startsWith("@react-three/")
    );
  }

  for (const file of files) {
    const source = readFileSync(file, "utf8");
    const displayFile = relative(appRoot, file).split(sep).join("/");
    const analysis = analyzeRuntimeModuleEdges(source, file, typescript);

    function recordModule(specifier, clause) {
      const root = packageRoot(specifier);
      if (root && isSupplier(specifier)) addEvidence(directSuppliers, root, displayFile);

      const entrypoint = dsEntrypoint(specifier);
      if (!entrypoint) return;
      const symbols = dsSymbols.get(entrypoint) ?? new Map();
      const recordSymbol = (symbol) => addEvidence(symbols, symbol, displayFile);
      if (!clause) recordSymbol("*");
      else if (typescript.isImportClause(clause)) {
        if (clause.name) recordSymbol("default");
        if (clause.namedBindings && typescript.isNamespaceImport(clause.namedBindings)) recordSymbol("*");
        else if (clause.namedBindings && typescript.isNamedImports(clause.namedBindings)) {
          for (const element of clause.namedBindings.elements) {
            if (!element.isTypeOnly) recordSymbol((element.propertyName ?? element.name).text);
          }
        }
      } else if (typescript.isNamedExports(clause)) {
        for (const element of clause.elements) {
          if (!element.isTypeOnly) recordSymbol((element.propertyName ?? element.name).text);
        }
      } else recordSymbol("*");
      dsSymbols.set(entrypoint, symbols);
    }

    for (const edge of analysis.edges) {
      recordModule(
        edge.specifier,
        edge.kind === "import" || edge.kind === "export" ? edge.clause : null,
      );
    }
  }
  return { directSuppliers, dsSymbols };
}

export function inferRenderedSuppliers(dsSymbols, contract) {
  const required = new Map();
  const errors = [];
  for (const [entrypoint, symbols] of dsSymbols) {
    const definition = readRecordValue(contract.entrypoints, entrypoint);
    if (!definition) {
      if ((contract.nonRuntimeEntrypoints ?? []).includes(entrypoint)) continue;
      errors.push(`unknown design-system entrypoint ${entrypoint}`);
      continue;
    }
    const knownExports = new Set(definition.exports ?? []);
    for (const [symbol, files] of symbols) {
      if (symbol !== "*" && !knownExports.has(symbol)) {
        errors.push(`unknown design-system runtime symbol ${entrypoint}#${symbol} in ${files[0]}`);
        continue;
      }
      const suppliers = new Set(definition.wildcard ?? []);
      if (symbol === "*") {
        Object.values(definition.symbols ?? {}).flat().forEach((supplier) => suppliers.add(supplier));
      } else {
        const symbolSuppliers = readRecordValue(definition.symbols, symbol);
        (Array.isArray(symbolSuppliers) ? symbolSuppliers : []).forEach((supplier) => suppliers.add(supplier));
      }
      for (const supplier of suppliers) addEvidence(required, supplier, `${files[0]} (${entrypoint}#${symbol})`);
    }
  }
  return { required, errors };
}

function isPathInside(path, parent) {
  const childRelative = relative(parent, path);
  return childRelative === "" || (childRelative !== ".." && !childRelative.startsWith(`..${sep}`));
}

export function inspectInstalledDesignSystem(appRoot) {
  try {
    const packageDirectory = resolve(appRoot, "node_modules", ...DS_PACKAGE.split("/"));
    const manifestPath = resolve(packageDirectory, "package.json");
    if (!existsSync(manifestPath)) throw Object.assign(new Error("missing package manifest"), { code: "ENOENT" });
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    if (manifest.name !== DS_PACKAGE) {
      throw new Error(`unexpected installed package at ${packageDirectory}: ${manifest.name ?? "(unnamed)"}`);
    }
    const installedRealPath = realpathSync(packageDirectory);
    const appRealPath = realpathSync(appRoot);
    if (!isPathInside(installedRealPath, appRealPath)) {
      throw new Error(
        `${DS_PACKAGE} resolves outside the app workspace (${installedRealPath}); ` +
        "filesystem/workspace producer links cannot certify an app",
      );
    }
    const contract = resolve(packageDirectory, "supplier-contract.json");
    const cli = resolve(packageDirectory, "consumer/ds-supplier-honesty.mjs");
    return {
      packageDirectory,
      installedRealPath,
      version: manifest.version,
      contract,
      cli,
      hasContract: existsSync(contract),
      hasCli: existsSync(cli),
    };
  } catch (error) {
    if (error?.code === "ENOENT") {
      throw new Error(`${DS_PACKAGE} is not installed from the app manifest`);
    }
    throw error;
  }
}

export function resolveInstalledContractMode(appRoot, installed) {
  if (installed.hasContract !== installed.hasCli) {
    throw new Error(
      `installed ${DS_PACKAGE}@${installed.version} is incomplete: ` +
      `supplier-contract=${installed.hasContract}, supplier-cli=${installed.hasCli}`,
    );
  }
  if (installed.hasContract && installed.hasCli) return "installed-canonical";
  const appName = basename(appRoot);
  const legacyVersion = LEGACY_CONTRACTLESS_VERSIONS[appName];
  if (legacyVersion === installed.version) {
    return `generated-snapshot-legacy-${installed.version}`;
  }
  throw new Error(
    `installed ${DS_PACKAGE}@${installed.version} has no canonical supplier contract/CLI; ` +
    `contractless fallback is allowed only for ${appName}@${legacyVersion ?? "(none)"}`,
  );
}

function resolveContract(appRoot) {
  const packagedContract = resolve(scriptDir, "../supplier-contract.json");
  const snapshot = resolve(appRoot, "scripts/ds-supplier-contract.snapshot.json");
  const path = existsSync(packagedContract) ? packagedContract : snapshot;
  if (!existsSync(path)) throw new Error(`missing DS supplier contract: ${path}`);
  return { path, contract: JSON.parse(readFileSync(path, "utf8")) };
}

function validateContractShape(contract) {
  const errors = [];
  if (
    contract.schemaVersion !== 1 ||
    !Array.isArray(contract.supplierPackages) ||
    !Array.isArray(contract.nonRuntimeEntrypoints) ||
    !contract.entrypoints
  ) {
    errors.push("invalid supplier contract envelope");
  }
  for (const [entrypoint, definition] of Object.entries(contract.entrypoints ?? {})) {
    if (
      !Array.isArray(definition.exports) ||
      !definition.symbols ||
      typeof definition.symbols !== "object" ||
      !Array.isArray(definition.supplierFreeExports)
    ) {
      errors.push(`invalid supplier contract entry ${entrypoint}`);
      continue;
    }
    const exported = new Set(definition.exports);
    const classified = new Set(definition.supplierFreeExports);
    for (const [symbol, suppliers] of Object.entries(definition.symbols)) {
      if (!exported.has(symbol)) errors.push(`supplier contract maps non-exported symbol ${entrypoint}#${symbol}`);
      if (classified.has(symbol)) errors.push(`supplier contract classifies ${entrypoint}#${symbol} as both coupled and supplier-free`);
      classified.add(symbol);
      for (const supplier of suppliers) {
        if (!contract.supplierPackages.includes(supplier)) errors.push(`supplier contract maps unknown package ${supplier}`);
      }
    }
    for (const symbol of definition.supplierFreeExports) {
      if (!exported.has(symbol)) errors.push(`supplier contract marks non-exported symbol ${entrypoint}#${symbol} supplier-free`);
    }
    for (const symbol of exported) {
      if (!classified.has(symbol)) errors.push(`supplier contract leaves ${entrypoint}#${symbol} unclassified`);
    }
  }
  if (JSON.stringify(contract.entrypoints?.["./icons"]?.wildcard ?? []) !== JSON.stringify(["lucide-react"])) {
    errors.push("./icons must retain its governed lucide-react wildcard");
  }
  if (errors.length > 0) throw new Error(`invalid DS supplier contract:\n- ${errors.join("\n- ")}`);
}

export function runSupplierHonesty(appRoot = process.cwd()) {
  const absoluteAppRoot = resolve(appRoot);
  const manifest = JSON.parse(readFileSync(resolve(absoluteAppRoot, "package.json"), "utf8"));
  const { path: contractPath, contract } = resolveContract(absoluteAppRoot);
  validateContractShape(contract);
  const installed = inspectInstalledDesignSystem(absoluteAppRoot);
  const contractMode = resolveInstalledContractMode(absoluteAppRoot, installed);
  if (contractMode === "installed-canonical") {
    if (JSON.stringify(JSON.parse(readFileSync(installed.contract, "utf8"))) !== JSON.stringify(contract)) {
      throw new Error("app supplier-contract snapshot differs from the installed design-system contract");
    }
    if (realpathSync(installed.cli) !== realpathSync(cliPath) && readFileSync(installed.cli, "utf8") !== readFileSync(cliPath, "utf8")) {
      throw new Error("app supplier CLI snapshot differs from the installed canonical CLI");
    }
  }

  const { directSuppliers, dsSymbols } = scanAppSuppliers({ appRoot: absoluteAppRoot, contract, typescript });
  const inferred = inferRenderedSuppliers(dsSymbols, contract);
  const errors = [...inferred.errors];
  const required = new Map([...directSuppliers, ...inferred.required]);
  for (const [supplier, evidence] of required) {
    if (!Object.hasOwn(manifest.dependencies ?? {}, supplier)) {
      const location = Object.hasOwn(manifest.devDependencies ?? {}, supplier) ? "devDependencies only" : "undeclared";
      errors.push(`${supplier} is ${location}; required by ${evidence[0]}`);
    }
  }
  if (errors.length > 0) {
    throw new Error(`DS supplier honesty failed for ${manifest.name ?? absoluteAppRoot}:\n- ${errors.join("\n- ")}`);
  }
  return {
    app: manifest.name,
    contract: contractMode,
    contractPath,
    directSuppliers: [...directSuppliers.keys()].sort(),
    renderedSuppliers: [...inferred.required.keys()].sort(),
  };
}

function argumentValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? arrayValueAt(process.argv, index + 1) : undefined;
}

const invokedAsScript = process.argv[1] && realpathSync(process.argv[1]) === realpathSync(cliPath);
if (invokedAsScript) {
  try {
    console.log(JSON.stringify(runSupplierHonesty(argumentValue("--app-root") ?? process.cwd()), null, 2));
  } catch (error) {
    console.error(error?.stack ?? error);
    process.exitCode = 1;
  }
}
