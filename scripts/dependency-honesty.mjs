#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import {
  constants as fsConstants,
  cpSync,
  existsSync,
  lstatSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { basename, dirname, extname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
export const repositoryRoot = resolve(scriptDir, '..');
export const coreRoot = resolve(repositoryRoot, 'packages/core');
const sourceRoot = resolve(coreRoot, 'src');
const supplierContractPath = resolve(coreRoot, 'supplier-contract.json');
const DESIGN_SYSTEM_PACKAGE = '@rottay/design-system';
const CANONICAL_MOTION_VERSION = '12.42.2';
const CANONICAL_FRAMER_TRANSITIVE_RANGE = `^${CANONICAL_MOTION_VERSION}`;
const RUNTIME_DEPENDENCY_SECTIONS = Object.freeze([
  'dependencies', 'peerDependencies', 'devDependencies', 'optionalDependencies',
]);

const TRACKED_SUPPLIERS = Object.freeze([
  'd3',
  'framer-motion',
  'motion',
  '@phosphor-icons/react',
  '@thesvg/react',
  'lucide-react',
  'three',
  '@react-three/fiber',
  '@react-three/drei',
  'antd',
  '@ant-design/icons',
]);

const WILDCARD_ENTRYPOINT_SUPPLIERS = Object.freeze({
  './icons': Object.freeze(['@phosphor-icons/react', 'lucide-react']),
  './marks': Object.freeze(['@thesvg/react']),
});

const APP_REPOSITORIES = Object.freeze([
  'app-platform',
  'app-bithire',
  'app-evnto',
]);

const SOURCE_EXTENSIONS = Object.freeze(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);

let typescript;
const runtimeAnalysisCaches = new WeakMap();
const runtimeTypeContexts = new WeakMap();

function loadTypeScript() {
  if (typescript) return typescript;
  const requireFromCore = createRequire(resolve(coreRoot, 'package.json'));
  typescript = requireFromCore('typescript');
  return typescript;
}

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
      if (parsed.options.pathsBasePath !== undefined) options.pathsBasePath = parsed.options.pathsBasePath;
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
    (!normalizePath(candidate).includes('/node_modules/') && baseHost.fileExists(candidate))
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

function runtimeTypeContextMap(ts) {
  let contexts = runtimeTypeContexts.get(ts);
  if (!contexts) {
    contexts = new Map();
    runtimeTypeContexts.set(ts, contexts);
  }
  return contexts;
}

function runtimeTypeContextFor(ts, fileName) {
  return runtimeTypeContexts.get(ts)?.get(resolve(fileName));
}

function clearRuntimeAnalysisState(ts = typescript) {
  if (!ts) return;
  runtimeAnalysisCaches.delete(ts);
  runtimeTypeContexts.delete(ts);
}

function primeRuntimeTypeContext(ts, files) {
  const roots = [...new Set(files.map((file) => resolve(file)))];
  const contexts = runtimeTypeContextMap(ts);
  if (roots.length === 0) return null;
  const rootSources = new Map(roots.map((file) => [file, readFileSync(file, 'utf8')]));
  const existing = contexts.get(roots[0]);
  if (
    existing && existing.rootSources?.size === rootSources.size &&
    roots.every((file) => (
      contexts.get(file) === existing && existing.rootSources.get(file) === rootSources.get(file)
    ))
  ) return existing;
  const options = runtimeCompilerOptions(ts, roots);
  const program = ts.createProgram(roots, options, runtimeCompilerHost(ts, options));
  const context = { checker: program.getTypeChecker(), program, rootSources };
  for (const sourceFile of program.getSourceFiles()) {
    contexts.set(resolve(sourceFile.fileName), context);
  }
  return context;
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function readRecordValue(value, key) {
  if (typeof value !== 'object' || value === null) return undefined;
  return Reflect.get(value, key);
}

function arrayValueAt(values, integer) {
  if (!Array.isArray(values) || !Number.isInteger(integer)) return undefined;
  const normalized = integer < 0 ? values.length + integer : integer;
  if (normalized < 0 || normalized >= values.length) return undefined;
  return values.slice(normalized, normalized + 1)[0];
}

function normalizePath(path) {
  return path.split(sep).join('/');
}

function packageRootForSpecifier(specifier) {
  if (!specifier || specifier.startsWith('.') || specifier.startsWith('/') || specifier.startsWith('node:')) {
    return null;
  }
  const parts = specifier.split('/');
  return specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
}

export function supplierFamilyForSpecifier(specifier) {
  const packageRoot = packageRootForSpecifier(specifier);
  if (!packageRoot) return null;
  if (packageRoot === 'd3' || packageRoot.startsWith('d3-')) return 'd3';
  if (packageRoot === 'framer-motion') return 'framer-motion';
  if (packageRoot === 'motion') return 'motion';
  if (packageRoot === '@phosphor-icons/react') return '@phosphor-icons/react';
  if (packageRoot === '@thesvg/react') return '@thesvg/react';
  if (packageRoot === 'lucide-react') return 'lucide-react';
  if (packageRoot === 'three' || packageRoot.startsWith('@react-three/')) return 'three';
  if (packageRoot === 'antd' || packageRoot === '@ant-design/icons') return 'antd';
  return null;
}

function isProductionSource(path) {
  const normalized = normalizePath(path);
  return (
    SOURCE_EXTENSIONS.includes(extname(path)) &&
    !normalized.includes('/tests/') &&
    !normalized.includes('/__tests__/') &&
    !/\.(?:test|spec|stories)\.[cm]?[jt]sx?$/.test(normalized) &&
    !normalized.endsWith('.d.ts') &&
    !normalized.endsWith('/EXAMPLES.tsx')
  );
}

function walkFiles(root, predicate = () => true) {
  if (!existsSync(root)) return [];
  const files = [];
  const pending = [root];
  while (pending.length > 0) {
    const current = pending.pop();
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist' || entry.name === '.next') {
        continue;
      }
      const path = resolve(current, entry.name);
      if (entry.isDirectory()) pending.push(path);
      else if (entry.isFile() && predicate(path)) files.push(path);
    }
  }
  return files.sort();
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

function createRuntimeAnalysisProgram(
  ts,
  source,
  fileName,
  { enforceComputedCapabilities = true, forceBindings = false } = {},
) {
  const shared = runtimeTypeContextFor(ts, fileName);
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
    !forceBindings &&
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

/**
 * Classify runtime module edges with TypeScript binding identities. Alias
 * propagation is a fixed point over symbols, so declaration order cannot hide
 * require/eval/Function/createRequire while local parameters and shadowing do
 * not inherit the meaning of a global merely because they share its name.
 * Computed constructor-capability inference stays enabled by default for core
 * closure and fixture certification. App manifest inventory disables only that
 * inference because ordinary data access is outside import-to-manifest parity.
 */
export function analyzeRuntimeModuleEdges(
  source,
  fileName = 'fixture.ts',
  ts = loadTypeScript(),
  { enforceComputedCapabilities = true } = {},
) {
  let cache = runtimeAnalysisCaches.get(ts);
  if (!cache) {
    cache = new Map();
    runtimeAnalysisCaches.set(ts, cache);
  }
  const typeContext = runtimeTypeContextFor(ts, fileName);
  const cacheKey = `${enforceComputedCapabilities ? 'strict' : 'manifest'}\0${fileName}`;
  const cached = cache.get(cacheKey);
  if (cached?.source === source && cached.typeContext === typeContext) return cached.analysis;

  if (!/\.(?:[cm]?[jt]sx?)$/i.test(fileName)) {
    const analysis = {
      edges: [],
      sourceFile: ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true),
    };
    cache.set(cacheKey, { analysis, source, typeContext });
    return analysis;
  }

  const { checker, sourceFile, symbolAt } = createRuntimeAnalysisProgram(
    ts,
    source,
    fileName,
    { enforceComputedCapabilities },
  );
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
    return (literal.text === 'object' && comparisonMatches) ||
      (literal.text === 'function' && !comparisonMatches);
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
    if (!['Function', 'CallableFunction', 'NewableFunction'].includes(symbol?.name)) return false;
    return (symbol.declarations ?? []).some((declaration) => (
      normalizePath(declaration.getSourceFile().fileName).includes('/typescript/lib/lib.')
    ));
  }

  function typePotentiallyCallable(type, seen = new Set()) {
    if (!type || seen.has(type)) return true;
    seen.add(type);
    if (type.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown | ts.TypeFlags.NonPrimitive)) return true;
    if (type.intrinsicName === 'error' || standardLibraryCallableType(type)) return true;
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

  function typeDefinitelyCallable(type, seen = new Set()) {
    if (!type || seen.has(type)) return false;
    seen.add(type);
    if (type.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown | ts.TypeFlags.NonPrimitive)) return false;
    if (type.intrinsicName === 'error') return false;
    if (
      checker.getSignaturesOfType(type, ts.SignatureKind.Call).length > 0 ||
      checker.getSignaturesOfType(type, ts.SignatureKind.Construct).length > 0
    ) return true;
    if (type.flags & ts.TypeFlags.TypeParameter) {
      const constraint = checker.getBaseConstraintOfType(type);
      return Boolean(constraint && constraint !== type && typeDefinitelyCallable(constraint, seen));
    }
    return false;
  }

  function typeNodeProvesNonCallable(node) {
    if (!node || typeof checker.getTypeFromTypeNode !== 'function') return false;
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

  function definitelyCallableExpression(expression, resolvingSymbols = new Set()) {
    if (!expression) return false;
    let runtimeValue = expression;
    while (
      ts.isParenthesizedExpression(runtimeValue) || ts.isNonNullExpression(runtimeValue) ||
      ts.isSatisfiesExpression(runtimeValue)
    ) runtimeValue = runtimeValue.expression;
    if (ts.isAsExpression(runtimeValue) || ts.isTypeAssertionExpression(runtimeValue)) {
      return definitelyCallableExpression(runtimeValue.expression, resolvingSymbols);
    }
    if (
      ts.isArrowFunction(runtimeValue) || ts.isFunctionExpression(runtimeValue) ||
      ts.isClassExpression(runtimeValue)
    ) return true;
    if (ts.isIdentifier(runtimeValue)) {
      const symbol = symbolAt(runtimeValue);
      if (symbol && !resolvingSymbols.has(symbol)) {
        resolvingSymbols.add(symbol);
        const declaredCallable = (symbol.declarations ?? []).some((declaration) => {
          if (ts.isFunctionDeclaration(declaration) || ts.isClassDeclaration(declaration)) return true;
          return (
            (ts.isVariableDeclaration(declaration) || ts.isParameter(declaration) ||
             ts.isPropertyDeclaration(declaration)) && declaration.initializer &&
            definitelyCallableExpression(declaration.initializer, resolvingSymbols)
          );
        });
        resolvingSymbols.delete(symbol);
        if (declaredCallable) return true;
      }
    }
    return typeof checker.getTypeAtLocation === 'function' &&
      typeDefinitelyCallable(checker.getTypeAtLocation(unwrapRuntimeExpression(expression)));
  }

  function bindingSourceExpression(node) {
    const pattern = node.parent;
    const owner = pattern?.parent;
    if (
      (ts.isVariableDeclaration(owner) || ts.isParameter(owner)) && owner.name === pattern
    ) return owner.initializer ?? null;
    return null;
  }

  function unsupportedConstructorAccess(node, includeOpaqueComputed = true) {
    if (!runtimeNode(node)) return false;
    if (
      (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) &&
      propertyText(node) === 'constructor'
    ) return true;
    if (
      ts.isElementAccessExpression(node) && propertyText(node) === null &&
      (includeOpaqueComputed
        ? callableExpression(node.expression)
        : definitelyCallableExpression(node.expression))
    ) return true;
    if (
      ts.isBindingElement(node) && ts.isObjectBindingPattern(node.parent) &&
      bindingPropertyText(node) === 'constructor'
    ) return true;
    if (
      ts.isBindingElement(node) && ts.isObjectBindingPattern(node.parent) &&
      node.propertyName && ts.isComputedPropertyName(node.propertyName) && bindingPropertyText(node) === null &&
      (includeOpaqueComputed
        ? callableExpression(bindingSourceExpression(node))
        : definitelyCallableExpression(bindingSourceExpression(node)))
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
      property === null && (includeOpaqueComputed
        ? callableExpression(node.arguments[0])
        : definitelyCallableExpression(node.arguments[0]))
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
    if (unsupportedConstructorAccess(node, enforceComputedCapabilities)) {
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
  cache.set(cacheKey, { analysis, source, typeContext });
  return analysis;
}
export function parseModuleSpecifiers(source, fileName = 'fixture.ts') {
  return [...new Set(analyzeRuntimeModuleEdges(source, fileName).edges.map(({ specifier }) => specifier))];
}

function resolveSourceModule(fromFile, specifier, root = sourceRoot) {
  let base;
  if (specifier.startsWith('./') || specifier.startsWith('../')) {
    base = resolve(dirname(fromFile), specifier);
  } else if (specifier.startsWith('@/')) {
    base = resolve(root, specifier.slice(2));
  } else if (specifier === '@ui' || specifier.startsWith('@ui/')) {
    base = resolve(root, 'ui', specifier.slice('@ui'.length + 1));
  } else if (specifier === '@types' || specifier.startsWith('@types/')) {
    base = resolve(root, 'foundation', 'contracts', specifier.slice('@types'.length + 1));
  } else {
    return null;
  }

  const candidates = [
    base,
    ...SOURCE_EXTENSIONS.map((extension) => `${base}${extension}`),
    ...SOURCE_EXTENSIONS.map((extension) => resolve(base, `index${extension}`)),
  ];
  return candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isFile()) ?? null;
}

function collectFileImports(files) {
  const ts = loadTypeScript();
  primeRuntimeTypeContext(ts, files);
  const imports = new Map();
  for (const file of files) {
    const source = readFileSync(file, 'utf8');
    for (const specifier of new Set(
      analyzeRuntimeModuleEdges(source, file, ts, {
        enforceComputedCapabilities: false,
      }).edges.map(({ specifier }) => specifier),
    )) {
      const packageRoot = packageRootForSpecifier(specifier);
      if (!packageRoot) continue;
      const paths = imports.get(packageRoot) ?? [];
      paths.push(normalizePath(relative(repositoryRoot, file)));
      imports.set(packageRoot, paths);
    }
  }
  return imports;
}

function mergeImportMaps(target, source) {
  for (const [packageName, files] of source) {
    const merged = new Set([...(target.get(packageName) ?? []), ...files]);
    target.set(packageName, [...merged].sort());
  }
  return target;
}

function runtimeJavaScriptTarget(value) {
  const targets = [];
  collectExportTargets(value, targets);
  return targets.find((target) => (
    typeof target === 'string' && /^\.\/dist\/[^*]+\.js$/.test(target)
  )) ?? null;
}

function isRuntimeJavaScriptPath(target) {
  return typeof target === 'string' && /\.(?:cjs|mjs|js)$/.test(target) && !target.endsWith('.d.ts');
}

export function collectRuntimeExportConditions(manifest) {
  const entries = [];

  function visit(subpath, value, conditions = []) {
    if (typeof value === 'string') {
      if (!isRuntimeJavaScriptPath(value)) return;
      const conditionSet = new Set(conditions);
      let mode;
      if (conditionSet.has('require') || value.endsWith('.cjs')) mode = 'require';
      else mode = 'import';
      entries.push({ subpath, mode, target: value, conditions: [...conditions] });
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((candidate) => visit(subpath, candidate, conditions));
      return;
    }
    if (!value || typeof value !== 'object') return;
    for (const [condition, candidate] of Object.entries(value)) {
      if (condition === 'types' || condition === 'style') continue;
      visit(subpath, candidate, [...conditions, condition]);
    }
  }

  for (const [subpath, definition] of Object.entries(manifest.exports ?? {})) {
    if (!subpath.includes('*')) visit(subpath, definition);
  }

  const unique = new Map();
  for (const entry of entries) {
    const key = `${entry.subpath}\0${entry.mode}\0${entry.target}`;
    if (!unique.has(key)) unique.set(key, entry);
  }
  return [...unique.values()].sort((a, b) => (
    a.subpath.localeCompare(b.subpath) || a.mode.localeCompare(b.mode) || a.target.localeCompare(b.target)
  ));
}

function directJavaScriptValueExports(path) {
  const ts = loadTypeScript();
  const source = readFileSync(path, 'utf8');
  const sourceFile = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const exports = new Set();
  const hasModifier = (node, kind) => node.modifiers?.some((modifier) => modifier.kind === kind);

  for (const statement of sourceFile.statements) {
    if (ts.isExportAssignment(statement)) {
      exports.add('default');
      continue;
    }
    if (ts.isExportDeclaration(statement) && !statement.isTypeOnly && statement.exportClause && ts.isNamedExports(statement.exportClause)) {
      for (const element of statement.exportClause.elements) {
        if (!element.isTypeOnly) exports.add(element.name.text);
      }
      continue;
    }
    if (!hasModifier(statement, ts.SyntaxKind.ExportKeyword)) continue;
    if (hasModifier(statement, ts.SyntaxKind.DefaultKeyword)) exports.add('default');
    if ((ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) && statement.name) {
      exports.add(statement.name.text);
    } else if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) exports.add(declaration.name.text);
      }
    }
  }
  return [...exports].sort();
}

export function collectSourceEntrypoints(manifest, src = sourceRoot) {
  const entries = new Map();
  for (const [subpath, definition] of Object.entries(manifest.exports ?? {})) {
    if (subpath.includes('*')) continue;
    const target = runtimeJavaScriptTarget(definition);
    if (!target) continue;
    const name = basename(target, '.js');
    const configuredSource = manifest.releaseSync?.sourceEntrypoints?.[subpath];
    const sourceEntry = typeof configuredSource === 'string'
      ? resolve(src, configuredSource)
      : SOURCE_EXTENSIONS
        .map((extension) => resolve(src, `${name}${extension}`))
        .find((candidate) => existsSync(candidate) && statSync(candidate).isFile());
    if (!sourceEntry) {
      throw new Error(`export ${subpath} points to ${target} but source entry ${name} is missing`);
    }
    if (!existsSync(sourceEntry) || !statSync(sourceEntry).isFile()) {
      throw new Error(`export ${subpath} configures missing source entry ${configuredSource}`);
    }
    entries.set(subpath, sourceEntry);
  }
  if (!entries.has('.')) throw new Error('package exports do not expose a JavaScript root entry');
  return entries;
}

export function collectProductiveEntrypoints(manifest, root = coreRoot) {
  const entries = collectSourceEntrypoints(manifest, resolve(root, 'src'));
  for (const condition of collectRuntimeExportConditions(manifest)) {
    let path;
    const configuredSource = manifest.releaseSync?.sourceEntrypoints?.[condition.subpath];
    if (typeof configuredSource === 'string') {
      const candidate = resolve(root, 'src', configuredSource);
      if (existsSync(candidate) && statSync(candidate).isFile()) path = candidate;
    }
    const distMatch = condition.target.match(/^\.\/dist\/([^/]+?)\.(?:cjs|js)$/);
    if (!path && distMatch) {
      path = SOURCE_EXTENSIONS
        .map((extension) => resolve(root, 'src', `${distMatch[1]}${extension}`))
        .find((candidate) => existsSync(candidate) && statSync(candidate).isFile());
    } else if (!path) {
      const candidate = resolve(root, condition.target);
      if (existsSync(candidate) && statSync(candidate).isFile()) path = candidate;
    }
    if (!path) {
      throw new Error(`runtime export ${condition.subpath} (${condition.mode}) cannot be traced from ${condition.target}`);
    }
    entries.set(`export:${condition.subpath}:${condition.mode}`, path);
  }
  const bins = typeof manifest.bin === 'string'
    ? { [manifest.name ?? 'bin']: manifest.bin }
    : (manifest.bin ?? {});
  for (const [name, target] of Object.entries(bins)) {
    const path = resolve(root, target);
    if (!existsSync(path) || !statSync(path).isFile()) {
      throw new Error(`package bin ${name} points to missing file ${target}`);
    }
    entries.set(`bin:${name}`, path);
  }
  return entries;
}

export function traceSourceEntry(entryPath, root = sourceRoot) {
  const ts = loadTypeScript();
  primeRuntimeTypeContext(
    ts,
    walkFiles(root, (file) => SOURCE_EXTENSIONS.includes(extname(file))),
  );
  const visited = new Set();
  const externalImports = new Map();
  const pending = [entryPath];

  while (pending.length > 0) {
    const file = pending.pop();
    if (!file || visited.has(file)) continue;
    visited.add(file);
    const source = readFileSync(file, 'utf8');
    for (const specifier of new Set(
      analyzeRuntimeModuleEdges(source, file, ts).edges.map(({ specifier }) => specifier),
    )) {
      const local = resolveSourceModule(file, specifier, root);
      if (local) {
        // Once a production entrypoint reaches a local file, its filename is
        // irrelevant: bundlers execute it even when it is unfortunately named
        // *.test.*, *.stories.* or EXAMPLES.tsx. Never use discovery filters
        // to truncate the actual runtime closure.
        pending.push(local);
        continue;
      }
      const packageRoot = packageRootForSpecifier(specifier);
      if (!packageRoot) continue;
      const paths = externalImports.get(packageRoot) ?? [];
      paths.push(normalizePath(relative(repositoryRoot, file)));
      externalImports.set(packageRoot, paths);
    }
  }

  return { visited, externalImports };
}

function isPathInside(path, parent) {
  const childRelative = relative(parent, path);
  return childRelative === '' || (childRelative !== '..' && !childRelative.startsWith(`..${sep}`));
}

export function deriveSupplierContract(root = coreRoot) {
  const ts = loadTypeScript();
  const manifest = readJson(resolve(root, 'package.json'));
  const src = resolve(root, 'src');
  const entries = collectSourceEntrypoints(manifest, src);
  const configPath = resolve(root, 'tsconfig.json');
  const config = ts.readConfigFile(configPath, ts.sys.readFile);
  if (config.error) throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, '\n'));
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root, undefined, configPath);
  const program = ts.createProgram({ rootNames: parsed.fileNames, options: parsed.options });
  const checker = program.getTypeChecker();
  const runtimeConditions = collectRuntimeExportConditions(manifest);
  const productiveEntries = collectProductiveEntrypoints(manifest, root);
  const reexportCache = new Map();
  const activeReexports = new Set();
  const entrypoints = {};

  function governedSupplierForSpecifier(specifier) {
    const packageName = packageRootForSpecifier(specifier);
    if (!packageName) return null;
    if (TRACKED_SUPPLIERS.includes(packageName)) return packageName;
    const family = supplierFamilyForSpecifier(packageName);
    return family && TRACKED_SUPPLIERS.includes(family) ? family : null;
  }

  // Reuse the exact program that resolves exported symbols for the runtime-edge
  // scan below. The former derivator built another TypeScript program and then
  // retraced the complete dependency closure once per exported declaration,
  // which made release certification scale with exports x graph size.
  const runtimeContext = {
    checker,
    program,
    rootSources: new Map(parsed.fileNames.map((file) => [resolve(file), readFileSync(file, 'utf8')])),
  };
  const runtimeContexts = runtimeTypeContextMap(ts);
  for (const sourceFile of program.getSourceFiles()) {
    runtimeContexts.set(resolve(sourceFile.fileName), runtimeContext);
  }

  /**
   * Parse each productive source file once, then propagate supplier sets over
   * the reverse graph to a fixed point. A fixed point (rather than caching a
   * recursive DFS result) is required for cycles: A <-> B must expose a
   * supplier reached from either side regardless of traversal order.
   */
  function buildSupplierClosureIndex(seedPaths) {
    const adjacency = new Map();
    const directSuppliers = new Map();
    const pending = [...new Set([...seedPaths].map((file) => resolve(file)))];

    while (pending.length > 0) {
      const file = pending.pop();
      if (!file || adjacency.has(file)) continue;
      const dependencies = new Set();
      const suppliers = new Set();
      adjacency.set(file, dependencies);
      directSuppliers.set(file, suppliers);

      const source = readFileSync(file, 'utf8');
      const specifiers = new Set(
        analyzeRuntimeModuleEdges(source, file, ts).edges.map(({ specifier }) => specifier),
      );
      for (const specifier of specifiers) {
        const local = resolveSourceModule(file, specifier, src);
        if (local) {
          const dependency = resolve(local);
          dependencies.add(dependency);
          if (!adjacency.has(dependency)) pending.push(dependency);
          continue;
        }
        const packageName = packageRootForSpecifier(specifier);
        if (packageName && supplierFamilyForSpecifier(packageName)) suppliers.add(packageName);
      }
    }

    const reverse = new Map([...adjacency.keys()].map((file) => [file, new Set()]));
    for (const [file, dependencies] of adjacency) {
      for (const dependency of dependencies) {
        const parents = reverse.get(dependency) ?? new Set();
        parents.add(file);
        reverse.set(dependency, parents);
      }
    }

    const closures = new Map(
      [...adjacency.keys()].map((file) => [file, new Set(directSuppliers.get(file) ?? [])]),
    );
    const queue = [...adjacency.keys()];
    const queued = new Set(queue);
    while (queue.length > 0) {
      const dependency = queue.shift();
      if (!dependency) continue;
      queued.delete(dependency);
      const dependencySuppliers = closures.get(dependency) ?? new Set();
      for (const parent of reverse.get(dependency) ?? []) {
        const parentSuppliers = closures.get(parent) ?? new Set();
        const before = parentSuppliers.size;
        for (const supplier of dependencySuppliers) parentSuppliers.add(supplier);
        closures.set(parent, parentSuppliers);
        if (parentSuppliers.size !== before && !queued.has(parent)) {
          queue.push(parent);
          queued.add(parent);
        }
      }
    }
    return closures;
  }

  const supplierClosures = buildSupplierClosureIndex(productiveEntries.values());

  function suppliersForDeclarationFile(file) {
    if (!isPathInside(file, src)) return [];
    return [...(supplierClosures.get(resolve(file)) ?? [])].sort();
  }

  function reexportSuppliersForSourceFile(sourceFile) {
    if (reexportCache.has(sourceFile.fileName)) return reexportCache.get(sourceFile.fileName);
    if (activeReexports.has(sourceFile.fileName)) return new Map();
    activeReexports.add(sourceFile.fileName);
    const mapped = new Map();
    const importedBindings = new Map();
    const add = (name, supplier) => {
      if (!supplier) return;
      const suppliers = mapped.get(name) ?? new Set();
      suppliers.add(supplier);
      mapped.set(name, suppliers);
    };
    const addAll = (name, suppliers) => {
      for (const supplier of suppliers ?? []) add(name, supplier);
    };

    const addImported = (name, suppliers) => {
      if (!name) return;
      const current = importedBindings.get(name) ?? new Set();
      for (const supplier of suppliers ?? []) current.add(supplier);
      importedBindings.set(name, current);
    };

    for (const statement of sourceFile.statements) {
      if (
        !ts.isImportDeclaration(statement) ||
        statement.importClause?.isTypeOnly ||
        !ts.isStringLiteralLike(statement.moduleSpecifier)
      ) continue;
      const moduleSpecifier = statement.moduleSpecifier.text;
      const externalSupplier = governedSupplierForSpecifier(moduleSpecifier);
      const moduleSymbol = checker.getSymbolAtLocation(statement.moduleSpecifier);
      let nested = new Map();
      if (!externalSupplier && moduleSymbol) {
        const nestedSource = moduleSymbol.declarations?.find((declaration) => ts.isSourceFile(declaration));
        if (nestedSource && isPathInside(nestedSource.fileName, src)) {
          nested = reexportSuppliersForSourceFile(nestedSource);
        }
      }
      const clause = statement.importClause;
      if (!clause) continue;
      if (clause.name) {
        addImported(clause.name.text, externalSupplier ? [externalSupplier] : nested.get('default'));
      }
      const bindings = clause.namedBindings;
      if (bindings && ts.isNamespaceImport(bindings)) {
        const suppliers = externalSupplier
          ? [externalSupplier]
          : [...new Set([...nested.values()].flatMap((values) => [...values]))];
        addImported(bindings.name.text, suppliers);
      } else if (bindings && ts.isNamedImports(bindings)) {
        for (const element of bindings.elements) {
          if (element.isTypeOnly) continue;
          const importedName = (element.propertyName ?? element.name).text;
          addImported(
            element.name.text,
            externalSupplier ? [externalSupplier] : nested.get(importedName),
          );
        }
      }
    }

    for (const statement of sourceFile.statements) {
      if (
        !ts.isExportDeclaration(statement) ||
        statement.isTypeOnly
      ) continue;
      if (!statement.moduleSpecifier) {
        if (statement.exportClause && ts.isNamedExports(statement.exportClause)) {
          for (const element of statement.exportClause.elements) {
            if (element.isTypeOnly) continue;
            const sourceName = (element.propertyName ?? element.name).text;
            addAll(element.name.text, importedBindings.get(sourceName));
          }
        }
        continue;
      }
      if (!ts.isStringLiteralLike(statement.moduleSpecifier)) continue;
      const moduleSpecifier = statement.moduleSpecifier.text;
      const externalSupplier = governedSupplierForSpecifier(moduleSpecifier);
      const moduleSymbol = checker.getSymbolAtLocation(statement.moduleSpecifier);
      let nested = new Map();
      if (!externalSupplier && moduleSymbol) {
        const nestedSource = moduleSymbol.declarations?.find((declaration) => ts.isSourceFile(declaration));
        if (nestedSource && isPathInside(nestedSource.fileName, src)) {
          nested = reexportSuppliersForSourceFile(nestedSource);
        }
      }

      if (statement.exportClause && ts.isNamedExports(statement.exportClause)) {
        for (const element of statement.exportClause.elements) {
          if (element.isTypeOnly) continue;
          const sourceName = (element.propertyName ?? element.name).text;
          if (externalSupplier) add(element.name.text, externalSupplier);
          else addAll(element.name.text, nested.get(sourceName));
        }
      } else if (statement.exportClause && ts.isNamespaceExport(statement.exportClause)) {
        if (externalSupplier) add(statement.exportClause.name.text, externalSupplier);
        else for (const suppliers of nested.values()) addAll(statement.exportClause.name.text, suppliers);
      } else if (externalSupplier && moduleSymbol) {
        for (const exported of checker.getExportsOfModule(moduleSymbol)) add(exported.name, externalSupplier);
      } else {
        for (const [name, suppliers] of nested) addAll(name, suppliers);
      }
    }

    for (const statement of sourceFile.statements) {
      if (!ts.isExportAssignment(statement) || !ts.isIdentifier(statement.expression)) continue;
      addAll('default', importedBindings.get(statement.expression.text));
    }

    activeReexports.delete(sourceFile.fileName);
    reexportCache.set(sourceFile.fileName, mapped);
    return mapped;
  }

  for (const [subpath, entryPath] of entries) {
    const sourceFile = program.getSourceFile(entryPath);
    if (!sourceFile) throw new Error(`TypeScript program does not contain exported entry ${entryPath}`);
    const moduleSymbol = checker.getSymbolAtLocation(sourceFile) ?? sourceFile.symbol;
    if (!moduleSymbol) throw new Error(`TypeScript cannot resolve module exports for ${entryPath}`);
    const reexportSuppliers = reexportSuppliersForSourceFile(sourceFile);
    const exports = [];
    const symbols = {};
    for (const exported of checker.getExportsOfModule(moduleSymbol).sort((a, b) => a.name.localeCompare(b.name))) {
      const declarations = exported.declarations ?? [];
      const explicitlyTypeOnly = declarations.length > 0 && declarations.every((declaration) => {
        if (ts.isExportSpecifier(declaration)) {
          const exportDeclaration = declaration.parent?.parent;
          return declaration.isTypeOnly || (
            exportDeclaration &&
            ts.isExportDeclaration(exportDeclaration) &&
            exportDeclaration.isTypeOnly
          );
        }
        return false;
      });
      if (explicitlyTypeOnly) continue;
      let target = exported;
      if ((exported.flags & ts.SymbolFlags.Alias) !== 0) {
        try {
          target = checker.getAliasedSymbol(exported);
        } catch {
          target = exported;
        }
      }
      if ((target.flags & ts.SymbolFlags.Value) === 0) continue;
      const name = exported.name;
      exports.push(name);
      const suppliers = new Set();
      for (const declaration of target.declarations ?? []) {
        for (const supplier of suppliersForDeclarationFile(declaration.getSourceFile().fileName)) suppliers.add(supplier);
      }
      for (const supplier of reexportSuppliers.get(name) ?? []) suppliers.add(supplier);
      if (suppliers.size > 0) symbols[name] = [...suppliers].sort();
    }
    const definition = { exports: [...new Set(exports)].sort(), symbols };
    if (WILDCARD_ENTRYPOINT_SUPPLIERS[subpath]) {
      definition.wildcard = [...WILDCARD_ENTRYPOINT_SUPPLIERS[subpath]];
    }
    definition.supplierFreeExports = definition.exports.filter((name) => !Object.hasOwn(symbols, name));
    entrypoints[subpath] = definition;
  }

  const runtimeSubpaths = new Set(runtimeConditions.map((entry) => entry.subpath));
  for (const subpath of [...runtimeSubpaths].sort()) {
    if (Object.hasOwn(entrypoints, subpath)) continue;
    const candidates = runtimeConditions
      .filter((entry) => entry.subpath === subpath)
      .map((entry) => resolve(root, entry.target));
    const entryPath = candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isFile());
    if (!entryPath) throw new Error(`runtime export ${subpath} has no readable package entry`);
    const exports = directJavaScriptValueExports(entryPath);
    const suppliers = [...(supplierClosures.get(resolve(entryPath)) ?? [])]
      .map((packageName) => governedSupplierForSpecifier(packageName))
      .filter(Boolean);
    const symbols = {};
    for (const name of exports) {
      if (suppliers.length > 0) symbols[name] = [...new Set(suppliers)].sort();
    }
    entrypoints[subpath] = {
      exports,
      symbols,
      supplierFreeExports: exports.filter((name) => !Object.hasOwn(symbols, name)),
    };
  }

  return {
    schemaVersion: 1,
    supplierPackages: [...TRACKED_SUPPLIERS].sort(),
    nonRuntimeEntrypoints: Object.keys(manifest.exports ?? {})
      .filter((subpath) => !subpath.includes('*') && !runtimeSubpaths.has(subpath))
      .sort(),
    entrypoints,
  };
}

export function validateSupplierContract(contract, derivedContract) {
  if (JSON.stringify(contract) === JSON.stringify(derivedContract)) return [];
  const errors = [];
  for (const [entrypoint, derived] of Object.entries(derivedContract.entrypoints ?? {})) {
    const actual = contract.entrypoints?.[entrypoint];
    if (!actual) {
      errors.push(`supplier contract is missing exported entrypoint ${entrypoint}`);
      continue;
    }
    for (const symbol of derived.exports ?? []) {
      if (!(actual.exports ?? []).includes(symbol)) errors.push(`supplier contract is missing exported symbol ${entrypoint}#${symbol}`);
      const expected = JSON.stringify(derived.symbols?.[symbol] ?? []);
      const received = JSON.stringify(actual.symbols?.[symbol] ?? []);
      if (expected !== received) errors.push(`supplier contract drift for ${entrypoint}#${symbol}: expected ${expected}, found ${received}`);
    }
    if (JSON.stringify(actual.wildcard ?? []) !== JSON.stringify(derived.wildcard ?? [])) {
      errors.push(`supplier contract wildcard drift for ${entrypoint}`);
    }
  }
  for (const entrypoint of Object.keys(contract.entrypoints ?? {})) {
    if (!derivedContract.entrypoints?.[entrypoint]) errors.push(`supplier contract contains stale entrypoint ${entrypoint}`);
  }
  if (JSON.stringify(contract.supplierPackages) !== JSON.stringify(derivedContract.supplierPackages)) {
    errors.push('supplier contract package catalog drifted from the governed supplier list');
  }
  if (JSON.stringify(contract.nonRuntimeEntrypoints) !== JSON.stringify(derivedContract.nonRuntimeEntrypoints)) {
    errors.push('supplier contract non-runtime entrypoint catalog drifted from package exports');
  }
  return errors.length > 0 ? errors : ['supplier contract serialization differs from the derived contract'];
}

export function validateSupplierDeclarations({ manifest, allImports, rootImports }) {
  const errors = [];
  const peers = manifest.peerDependencies ?? {};
  const dependencies = manifest.dependencies ?? {};
  const optionalDependencies = manifest.optionalDependencies ?? {};
  const peerMeta = manifest.peerDependenciesMeta ?? {};

  for (const [packageName, files] of allImports) {
    const declaredAsPeer = Object.hasOwn(peers, packageName);
    const declaredAsDependency = Object.hasOwn(dependencies, packageName);
    const declaredAsOptionalDependency = Object.hasOwn(optionalDependencies, packageName);
    if (!declaredAsPeer && !declaredAsDependency && !declaredAsOptionalDependency) {
      errors.push(`an exported entry reaches ${packageName} from ${files[0]} but the package does not declare it as a peer or dependency`);
    }
  }

  for (const [packageName, files] of rootImports) {
    if (Object.hasOwn(optionalDependencies, packageName)) {
      errors.push(`root reaches ${packageName} from ${files[0]} but optionalDependencies labels it optional`);
    }
    if (Object.hasOwn(peers, packageName) && peerMeta[packageName]?.optional === true) {
      errors.push(`root reaches ${packageName} from ${files[0]} but peerDependenciesMeta marks it optional`);
    }
  }

  for (const peerName of Object.keys(peers)) {
    if (!allImports.has(peerName)) {
      errors.push(`peer ${peerName} has zero production importers`);
    }
  }

  for (const metaName of Object.keys(peerMeta)) {
    if (!Object.hasOwn(peers, metaName)) {
      errors.push(`peerDependenciesMeta contains ${metaName}, which is not a peerDependency`);
    }
    if (peerMeta[metaName]?.optional === true && rootImports.has(metaName)) {
      errors.push(`root-reachable peer ${metaName} cannot be optional`);
    }
  }

  return errors;
}

export function auditCoreDependencyGraph(root = coreRoot) {
  const manifest = readJson(resolve(root, 'package.json'));
  const src = resolve(root, 'src');
  primeRuntimeTypeContext(
    loadTypeScript(),
    walkFiles(src, (file) => SOURCE_EXTENSIONS.includes(extname(file))),
  );
  const sourceEntrypoints = collectProductiveEntrypoints(manifest, root);
  const entryGraphs = new Map();
  const graphCache = new Map();
  const visited = new Set();
  const allImports = new Map();
  for (const [subpath, entry] of sourceEntrypoints) {
    const graph = graphCache.get(entry) ?? traceSourceEntry(entry, src);
    graphCache.set(entry, graph);
    entryGraphs.set(subpath, graph);
    graph.visited.forEach((file) => visited.add(file));
    mergeImportMaps(allImports, graph.externalImports);
  }
  const rootImports = entryGraphs.get('.')?.externalImports ?? new Map();
  const errors = validateSupplierDeclarations({ manifest, allImports, rootImports });
  // The graph above is now reduced to paths and package names. Drop its strict
  // analysis Program before the independent contract derivator creates its own
  // full TypeScript Program, keeping the core peak bounded as well.
  clearRuntimeAnalysisState();
  errors.push(...validateSupplierContract(readJson(resolve(root, 'supplier-contract.json')), deriveSupplierContract(root)));

  const report = {};
  for (const family of ['d3', 'motion', 'framer-motion', '@phosphor-icons/react', '@thesvg/react', 'lucide-react', 'three', 'antd']) {
    const allFiles = new Set();
    const reachableFiles = new Set();
    for (const [packageName, files] of allImports) {
      if (supplierFamilyForSpecifier(packageName) === family) files.forEach((file) => allFiles.add(file));
    }
    for (const [packageName, files] of rootImports) {
      if (supplierFamilyForSpecifier(packageName) === family) files.forEach((file) => reachableFiles.add(file));
    }
    report[family] = {
      productionImporters: allFiles.size,
      rootReachableImporters: reachableFiles.size,
    };
  }

  return {
    errors,
    report,
    visitedFiles: visited.size,
    entries: Object.fromEntries(
      [...entryGraphs].map(([subpath, graph]) => [subpath, {
        visitedFiles: graph.visited.size,
        packages: [...graph.externalImports.keys()].sort(),
      }]),
    ),
    rootPackages: [...rootImports.keys()].sort(),
  };
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function parseLockIdentities(
  lockText,
  packageNames = ['react', 'react-dom', 'dayjs', 'motion', 'framer-motion'],
) {
  const packagesSection = lockText.match(/(?:^|\n)packages:\n([\s\S]*?)(?:\n(?:snapshots|patchedDependencies):\n|$)/)?.[1] ?? '';
  const result = {};
  for (const packageName of packageNames) {
    const versions = new Set();
    const expression = new RegExp(`^  ['"]?${escapeRegExp(packageName)}@([^:'"(]+)(?:\\([^:]+\\))?['"]?:`, 'gm');
    for (const match of packagesSection.matchAll(expression)) versions.add(match[1]);
    result[packageName] = [...versions].sort();
  }
  return result;
}

export function validateMotionRuntimeContract({ coreManifest, showroomManifest, installedMotion }) {
  const errors = [];
  const workspaces = [
    ['packages/core', coreManifest, ['peerDependencies', 'devDependencies']],
    ['packages/showroom', showroomManifest, ['dependencies']],
  ];

  for (const [workspace, manifest, requiredMotionSections] of workspaces) {
    for (const section of requiredMotionSections) {
      if (manifest[section]?.motion !== CANONICAL_MOTION_VERSION) {
        errors.push(
          `${workspace} ${section}.motion must be pinned to ${CANONICAL_MOTION_VERSION}; ` +
          `found ${manifest[section]?.motion ?? '(none)'}`,
        );
      }
    }
    for (const section of RUNTIME_DEPENDENCY_SECTIONS) {
      if (Object.hasOwn(manifest[section] ?? {}, 'framer-motion')) {
        errors.push(`${workspace} must not declare framer-motion directly in ${section}`);
      }
    }
  }

  if (!installedMotion) {
    errors.push('packages/core does not expose an installed motion identity');
    return errors;
  }
  if (installedMotion.version !== CANONICAL_MOTION_VERSION) {
    errors.push(
      `installed motion must be ${CANONICAL_MOTION_VERSION}; found ${installedMotion.version ?? '(none)'}`,
    );
  }
  if (installedMotion.dependencies?.['framer-motion'] !== CANONICAL_FRAMER_TRANSITIVE_RANGE) {
    errors.push(
      `motion@${CANONICAL_MOTION_VERSION} must own framer-motion transitively at ` +
      `${CANONICAL_FRAMER_TRANSITIVE_RANGE}; found ` +
      `${installedMotion.dependencies?.['framer-motion'] ?? '(none)'}`,
    );
  }

  return errors;
}

export function auditRuntimeIdentities(root = repositoryRoot) {
  const identities = parseLockIdentities(readFileSync(resolve(root, 'pnpm-lock.yaml'), 'utf8'));
  const errors = [];
  for (const [packageName, versions] of Object.entries(identities)) {
    if (versions.length !== 1) {
      errors.push(`${packageName} must have exactly one lock identity; found ${versions.length}: ${versions.join(', ') || '(none)'}`);
    }
  }
  for (const packageName of ['motion', 'framer-motion']) {
    if (identities[packageName]?.[0] !== CANONICAL_MOTION_VERSION) {
      errors.push(
        `${packageName} must resolve to ${CANONICAL_MOTION_VERSION}; found ${identities[packageName]?.join(', ') || '(none)'}`,
      );
    }
  }

  const installedMotionManifestPath = resolve(root, 'packages/core/node_modules/motion/package.json');
  errors.push(...validateMotionRuntimeContract({
    coreManifest: readJson(resolve(root, 'packages/core/package.json')),
    showroomManifest: readJson(resolve(root, 'packages/showroom/package.json')),
    installedMotion: existsSync(installedMotionManifestPath)
      ? readJson(installedMotionManifestPath)
      : null,
  }));

  const resolvedPaths = {};
  const workspacePaths = {};
  const expectedWorkspaces = {
    react: ['packages/core', 'packages/showroom'],
    'react-dom': ['packages/core', 'packages/showroom'],
    dayjs: ['packages/core'],
  };
  for (const packageName of ['react', 'react-dom', 'dayjs']) {
    const paths = new Set();
    workspacePaths[packageName] = {};
    for (const workspace of expectedWorkspaces[packageName]) {
      const packagePath = resolve(root, workspace, 'node_modules', ...packageName.split('/'));
      if (!existsSync(packagePath)) {
        errors.push(`${workspace} does not expose an installed ${packageName} identity`);
        continue;
      }
      const installedPath = realpathSync(packagePath);
      workspacePaths[packageName][workspace] = installedPath;
      paths.add(installedPath);
      const relativeToRepository = relative(realpathSync(root), installedPath);
      if (relativeToRepository === '..' || relativeToRepository.startsWith(`..${sep}`)) {
        errors.push(`${workspace} resolves ${packageName} outside the producer repository: ${installedPath}`);
      }
    }
    resolvedPaths[packageName] = [...paths].sort();
    if (paths.size !== 1) {
      errors.push(`${packageName} must resolve to exactly one installed identity; found ${paths.size}: ${[...paths].join(', ') || '(none)'}`);
    }
  }

  return { errors, identities, resolvedPaths, workspacePaths };
}

export function loadSupplierContract(path = supplierContractPath) {
  const contract = readJson(path);
  const errors = validateSupplierContractShape(contract);
  if (errors.length > 0) throw new Error(`invalid DS supplier contract at ${path}:\n- ${errors.join('\n- ')}`);
  return contract;
}

export function validateSupplierContractShape(contract) {
  const errors = [];
  if (
    contract?.schemaVersion !== 1 ||
    !Array.isArray(contract?.supplierPackages) ||
    !Array.isArray(contract?.nonRuntimeEntrypoints) ||
    !contract?.entrypoints ||
    typeof contract.entrypoints !== 'object'
  ) {
    return ['invalid supplier contract envelope'];
  }
  for (const [entrypoint, definition] of Object.entries(contract.entrypoints)) {
    if (
      !Array.isArray(definition?.exports) ||
      !definition?.symbols ||
      typeof definition.symbols !== 'object' ||
      !Array.isArray(definition.supplierFreeExports)
    ) {
      errors.push(`invalid supplier contract entry ${entrypoint}`);
      continue;
    }
    const exported = new Set(definition.exports);
    const classified = new Set(definition.supplierFreeExports);
    for (const [symbol, suppliers] of Object.entries(definition.symbols)) {
      if (!Array.isArray(suppliers)) {
        errors.push(`supplier contract has a non-array supplier mapping ${entrypoint}#${symbol}`);
        continue;
      }
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
  if (JSON.stringify(contract.entrypoints?.['./icons']?.wildcard ?? []) !== JSON.stringify(['@phosphor-icons/react', 'lucide-react'])) {
    errors.push('./icons must retain its governed functional and compatibility suppliers');
  }
  if (JSON.stringify(contract.entrypoints?.['./marks']?.wildcard ?? []) !== JSON.stringify(['@thesvg/react'])) {
    errors.push('./marks must retain its governed brand/provider supplier');
  }
  return errors;
}

function designSystemEntrypointForSpecifier(specifier) {
  if (specifier === DESIGN_SYSTEM_PACKAGE) return '.';
  if (specifier.startsWith(`${DESIGN_SYSTEM_PACKAGE}/`)) {
    return `./${specifier.slice(DESIGN_SYSTEM_PACKAGE.length + 1)}`;
  }
  return null;
}

function addDesignSystemSymbol(imports, entrypoint, symbol, file) {
  const symbols = imports.get(entrypoint) ?? new Map();
  const files = symbols.get(symbol) ?? [];
  files.push(file);
  symbols.set(symbol, [...new Set(files)].sort());
  imports.set(entrypoint, symbols);
}

export function collectDesignSystemImports(files) {
  const ts = loadTypeScript();
  primeRuntimeTypeContext(ts, files);
  const imports = new Map();
  for (const file of files) {
    const source = readFileSync(file, 'utf8');
    const analysis = analyzeRuntimeModuleEdges(source, file, ts, {
      enforceComputedCapabilities: false,
    });
    const displayPath = normalizePath(relative(repositoryRoot, file));

    function recordDeclaration(specifier, clause) {
      const entrypoint = designSystemEntrypointForSpecifier(specifier);
      if (!entrypoint) return;
      if (!clause) {
        addDesignSystemSymbol(imports, entrypoint, '*', displayPath);
        return;
      }
      if (ts.isImportClause(clause)) {
        if (clause.name) addDesignSystemSymbol(imports, entrypoint, 'default', displayPath);
        const bindings = clause.namedBindings;
        if (!bindings) return;
        if (ts.isNamespaceImport(bindings)) {
          addDesignSystemSymbol(imports, entrypoint, '*', displayPath);
          return;
        }
        for (const element of bindings.elements) {
          if (!element.isTypeOnly) {
            addDesignSystemSymbol(imports, entrypoint, (element.propertyName ?? element.name).text, displayPath);
          }
        }
        return;
      }
      if (ts.isNamedExports(clause)) {
        for (const element of clause.elements) {
          if (!element.isTypeOnly) {
            addDesignSystemSymbol(imports, entrypoint, (element.propertyName ?? element.name).text, displayPath);
          }
        }
      }
    }

    for (const edge of analysis.edges) {
      if (edge.kind === 'import' || edge.kind === 'export') {
        recordDeclaration(edge.specifier, edge.clause);
      } else {
        const entrypoint = designSystemEntrypointForSpecifier(edge.specifier);
        if (entrypoint) addDesignSystemSymbol(imports, entrypoint, '*', displayPath);
      }
    }
  }
  return imports;
}

export function requiredSuppliersForDesignSystemImports(importedDsSymbols, contract = loadSupplierContract()) {
  const contractErrors = validateSupplierContractShape(contract);
  if (contractErrors.length > 0) throw new Error(`invalid DS supplier contract:\n- ${contractErrors.join('\n- ')}`);
  const required = new Map();
  for (const [entrypoint, symbols] of importedDsSymbols) {
    const definition = readRecordValue(contract.entrypoints, entrypoint);
    if (!definition) {
      if ((contract.nonRuntimeEntrypoints ?? []).includes(entrypoint)) continue;
      throw new Error(`unknown design-system entrypoint ${entrypoint}`);
    }
    const knownExports = new Set(definition.exports);
    for (const [symbol, files] of symbols) {
      if (symbol !== '*' && !knownExports.has(symbol)) {
        throw new Error(`unknown design-system runtime symbol ${entrypoint}#${symbol} in ${files[0]}`);
      }
      const suppliers = new Set(definition.wildcard ?? []);
      if (symbol === '*') {
        Object.values(definition.symbols ?? {}).flat().forEach((supplier) => suppliers.add(supplier));
      } else {
        const symbolSuppliers = readRecordValue(definition.symbols, symbol);
        for (const supplier of Array.isArray(symbolSuppliers) ? symbolSuppliers : []) suppliers.add(supplier);
      }
      for (const supplier of suppliers) {
        const evidence = required.get(supplier) ?? [];
        evidence.push({ entrypoint, symbol, file: files[0] });
        required.set(supplier, evidence);
      }
    }
  }
  return required;
}

export function validateAppSupplierManifest({
  manifest,
  importedPackages,
  importedDsSymbols = new Map(),
  contract = loadSupplierContract(),
}) {
  const errors = [];
  const directlyRequired = new Set();
  for (const [packageName, files] of importedPackages) {
    if (!supplierFamilyForSpecifier(packageName)) continue;
    directlyRequired.add(packageName);
    if (!Object.hasOwn(manifest.dependencies ?? {}, packageName)) {
      const location = Object.hasOwn(manifest.devDependencies ?? {}, packageName)
        ? 'devDependencies only'
        : 'undeclared';
      errors.push(`${manifest.name ?? 'app'} imports ${packageName} in ${files[0]} but it is ${location}`);
    }
  }
  for (const [packageName, evidence] of requiredSuppliersForDesignSystemImports(importedDsSymbols, contract)) {
    if (directlyRequired.has(packageName) || Object.hasOwn(manifest.dependencies ?? {}, packageName)) continue;
    const first = evidence[0];
    const location = Object.hasOwn(manifest.devDependencies ?? {}, packageName)
      ? 'devDependencies only'
      : 'undeclared';
    errors.push(
      `${manifest.name ?? 'app'} renders ${DESIGN_SYSTEM_PACKAGE}${first.entrypoint === '.' ? '' : first.entrypoint.slice(1)}#${first.symbol}` +
      ` in ${first.file} but supplier ${packageName} is ${location}`,
    );
  }
  return errors;
}

export function auditAppSupplierManifest(appRoot) {
  const manifest = readJson(resolve(appRoot, 'package.json'));
  const files = walkFiles(resolve(appRoot, 'src'), isProductionSource);
  const importedPackages = collectFileImports(files);
  const importedDsSymbols = collectDesignSystemImports(files);
  const contract = loadSupplierContract();
  const snapshotPath = resolve(appRoot, 'scripts/ds-supplier-contract.snapshot.json');
  const cliSnapshotPath = resolve(appRoot, 'scripts/ds-supplier-honesty.mjs');
  const errors = [];
  if (!existsSync(snapshotPath)) {
    errors.push(`${manifest.name ?? basename(appRoot)} is missing scripts/ds-supplier-contract.snapshot.json`);
  } else if (JSON.stringify(readJson(snapshotPath)) !== JSON.stringify(contract)) {
    errors.push(`${manifest.name ?? basename(appRoot)} supplier-contract snapshot differs from the DS source of truth`);
  }
  if (!existsSync(cliSnapshotPath)) {
    errors.push(`${manifest.name ?? basename(appRoot)} is missing scripts/ds-supplier-honesty.mjs`);
  } else if (readFileSync(cliSnapshotPath, 'utf8') !== readFileSync(resolve(coreRoot, 'consumer/ds-supplier-honesty.mjs'), 'utf8')) {
    errors.push(`${manifest.name ?? basename(appRoot)} supplier CLI snapshot differs from the DS canonical CLI`);
  }
  errors.push(...validateAppSupplierManifest({ manifest, importedPackages, importedDsSymbols, contract }));
  const inferredSuppliers = requiredSuppliersForDesignSystemImports(importedDsSymbols, contract);
  return {
    errors,
    suppliers: Object.fromEntries(
      [...importedPackages]
        .filter(([packageName]) => supplierFamilyForSpecifier(packageName))
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([packageName, files]) => [packageName, new Set(files).size]),
    ),
    renderedSuppliers: Object.fromEntries(
      [...inferredSuppliers].sort(([a], [b]) => a.localeCompare(b)).map(([packageName, evidence]) => [packageName, evidence.length]),
    ),
  };
}

function propertyNameText(ts, name) {
  if (ts.isIdentifier(name) || ts.isStringLiteralLike(name) || ts.isNumericLiteral(name)) return name.text;
  return null;
}

function conditionalObjectLiteral(ts, initializer) {
  let current = initializer;
  while (current && ts.isParenthesizedExpression(current)) current = current.expression;
  if (!current || !ts.isConditionalExpression(current)) return null;
  let branch = current.whenTrue;
  while (branch && ts.isParenthesizedExpression(branch)) branch = branch.expression;
  return branch && ts.isObjectLiteralExpression(branch) ? branch : null;
}

function parseNextAliasEvidence(source) {
  const ts = loadTypeScript();
  const sourceFile = ts.createSourceFile('next.config.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const variables = new Map();
  let localAliasSpreadCount = 0;
  let legacySymlinkIdentifier = false;

  function visit(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
      variables.set(node.name.text, node.initializer);
    }
    if (ts.isSpreadAssignment(node) && ts.isIdentifier(node.expression) && node.expression.text === 'localDsAliases') {
      localAliasSpreadCount += 1;
    }
    if (ts.isIdentifier(node) && node.text === 'dsIsSymlink') legacySymlinkIdentifier = true;
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);

  function readAliasObject(variableName) {
    const object = conditionalObjectLiteral(ts, variables.get(variableName));
    const aliases = new Map();
    const spreads = new Set();
    if (!object) return { aliases, spreads };
    for (const property of object.properties) {
      if (ts.isSpreadAssignment(property) && ts.isIdentifier(property.expression)) {
        spreads.add(property.expression.text);
        continue;
      }
      if (!ts.isPropertyAssignment(property)) continue;
      const name = propertyNameText(ts, property.name);
      if (!name) continue;
      const value = property.initializer;
      if (
        ts.isCallExpression(value) &&
        ts.isPropertyAccessExpression(value.expression) &&
        ts.isIdentifier(value.expression.expression) &&
        value.expression.expression.text === 'path' &&
        value.expression.name.text === 'resolve' &&
        value.arguments.length >= 2 &&
        ts.isIdentifier(value.arguments[0]) &&
        ts.isStringLiteralLike(value.arguments[1])
      ) {
        aliases.set(name, { base: value.arguments[0].text, target: value.arguments[1].text });
      }
    }
    return { aliases, spreads };
  }

  return {
    packageAliases: readAliasObject('localDsPackageAliases'),
    runtimeAliases: readAliasObject('localDsAliases'),
    localAliasSpreadCount,
    legacySymlinkIdentifier,
  };
}

function inspectJavaScriptExecutable(source, fileName) {
  const ts = loadTypeScript();
  const { sourceFile, symbolAt } = createRuntimeAnalysisProgram(
    ts,
    source,
    fileName,
    { forceBindings: true },
  );
  const errors = [];
  const readOnlyBindings = new Map();
  const readOnlyFsMethods = new Set([
    'access', 'accessSync', 'exists', 'existsSync', 'fstat', 'fstatSync',
    'lstat', 'lstatSync', 'read', 'readSync', 'readFile', 'readFileSync',
    'readdir', 'readdirSync', 'readlink', 'readlinkSync', 'realpath',
    'realpathSync', 'stat', 'statSync',
  ]);

  function report(node, detail) {
    const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
    errors.push(`${fileName}:${position.line + 1}:${position.character + 1} ${detail}`);
  }

  function modulePolicy(specifier) {
    if (['child_process', 'node:child_process'].includes(specifier)) return 'child-process';
    if (['fs/promises', 'node:fs/promises'].includes(specifier)) return 'fs-promises';
    if (['fs', 'node:fs'].includes(specifier)) return 'fs';
    return null;
  }

  function runtimeIdentifier(identifier) {
    for (let current = identifier.parent; current && current !== sourceFile; current = current.parent) {
      if (ts.isTypeNode(current)) return false;
    }
    const parent = identifier.parent;
    if (
      (ts.isImportSpecifier(parent) || ts.isExportSpecifier(parent)) &&
      (parent.name === identifier || parent.propertyName === identifier)
    ) return false;
    return true;
  }

  function inspectImport(node) {
    if (!ts.isStringLiteralLike(node.moduleSpecifier)) return;
    const policy = modulePolicy(node.moduleSpecifier.text);
    if (!policy || !runtimeImportClauseHasValue(ts, node.importClause)) return;
    if (policy === 'child-process') {
      report(node, 'violates executable policy: child_process is forbidden in the Platform closure');
      return;
    }
    if (policy === 'fs-promises') {
      report(node, 'violates executable policy: fs/promises capability imports are forbidden');
      return;
    }
    const clause = node.importClause;
    if (!clause || clause.name || !clause.namedBindings || !ts.isNamedImports(clause.namedBindings)) {
      report(node, 'violates executable policy: fs must use direct named read-only imports');
      return;
    }
    let runtimeCount = 0;
    for (const element of clause.namedBindings.elements) {
      if (element.isTypeOnly) continue;
      runtimeCount += 1;
      const imported = (element.propertyName ?? element.name).text;
      if (!readOnlyFsMethods.has(imported)) {
        report(element, `violates executable policy: fs.${imported} is not an approved read-only call`);
        continue;
      }
      if (element.name.text !== imported) {
        report(element, `violates executable policy: aliasing fs.${imported} is forbidden`);
        continue;
      }
      const symbol = symbolAt(element.name);
      if (symbol) readOnlyBindings.set(symbol, imported);
    }
    if (runtimeCount === 0) {
      report(node, 'violates executable policy: runtime fs imports must name a read-only call');
    }
  }

  function literalModuleCall(node) {
    if (!ts.isCallExpression(node) || node.arguments.length < 1 || !ts.isStringLiteralLike(node.arguments[0])) {
      return null;
    }
    if (node.expression.kind === ts.SyntaxKind.ImportKeyword) return node.arguments[0].text;
    if (ts.isIdentifier(node.expression) && node.expression.text === 'require') {
      const symbol = symbolAt(node.expression);
      if (!symbol || !(symbol.declarations ?? []).some(
        (declaration) => declaration.getSourceFile() === sourceFile,
      )) return node.arguments[0].text;
    }
    return null;
  }

  function visit(node) {
    if (ts.isImportDeclaration(node)) {
      inspectImport(node);
    } else if (
      ts.isExportDeclaration(node) && node.moduleSpecifier &&
      ts.isStringLiteralLike(node.moduleSpecifier) && runtimeExportClauseHasValue(ts, node)
    ) {
      const policy = modulePolicy(node.moduleSpecifier.text);
      if (policy) report(node, `violates executable policy: re-exporting ${policy} capabilities is forbidden`);
    } else if (ts.isImportEqualsDeclaration(node) && !node.isTypeOnly) {
      const reference = node.moduleReference;
      if (
        ts.isExternalModuleReference(reference) && reference.expression &&
        ts.isStringLiteralLike(reference.expression) && modulePolicy(reference.expression.text)
      ) report(node, 'violates executable policy: require-style fs/child_process capabilities are forbidden');
    } else if (ts.isCallExpression(node)) {
      const specifier = literalModuleCall(node);
      if (specifier && modulePolicy(specifier)) {
        report(node, 'violates executable policy: fs/child_process must not be loaded through require/import()');
      }
    } else if (ts.isIdentifier(node) && runtimeIdentifier(node)) {
      const symbol = symbolAt(node);
      const imported = symbol && readOnlyBindings.get(symbol);
      if (imported) {
        const parent = node.parent;
        if (!(ts.isCallExpression(parent) && parent.expression === node)) {
          report(node, `violates executable policy: fs.${imported} may only be invoked directly`);
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return [...new Set(errors)];
}
function stripShellToken(token) {
  return token.trim().replace(/^["']|["']$/g, '').replace(/[;,]$/, '');
}

function shellExecutablePath(token, fromDirectory, platformRoot) {
  let value = stripShellToken(token)
    .replace(/\$\{?SCRIPT_DIR\}?/g, fromDirectory)
    .replace(/\$\{?APP_ROOT\}?/g, platformRoot);
  if (/\$|`|\$\(/.test(value)) return null;
  if (!isAbsolute(value)) value = resolve(fromDirectory, value);
  return value;
}

function stripShellComments(source) {
  let result = '';
  let quote = null;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (character === '\\' && quote !== "'") {
      result += character;
      if (index + 1 < source.length) result += source[index += 1];
      continue;
    }
    if (quote) {
      result += character;
      if (character === quote) quote = null;
      continue;
    }
    if (character === "'" || character === '"') {
      quote = character;
      result += character;
      continue;
    }
    const previous = source[index - 1];
    if (character === '#' && (index === 0 || /[\s;&|()]/.test(previous))) {
      while (index < source.length && source[index] !== '\n') index += 1;
      if (index < source.length) result += '\n';
      continue;
    }
    result += character;
  }
  return result;
}

function tokenizeShellCommands(source) {
  const tokens = [];
  const substitutionQuotes = [];
  let word = '';
  let quote = null;
  const flushWord = () => {
    if (!word) return;
    tokens.push({ type: 'word', value: word });
    word = '';
  };
  const pushOperator = (value) => {
    flushWord();
    tokens.push({ type: 'operator', value });
  };

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (quote === "'") {
      if (character === "'") quote = null;
      else word += character;
      continue;
    }
    if (quote === '"') {
      if (character === '"') {
        quote = null;
      } else if (character === '\\') {
        if (index + 1 < source.length) word += source[index += 1];
      } else if (character === '$' && source[index + 1] === '(') {
        pushOperator('$(');
        substitutionQuotes.push('"');
        quote = null;
        index += 1;
      } else {
        word += character;
      }
      continue;
    }
    if (character === "'" || character === '"') {
      quote = character;
      continue;
    }
    if (character === '\\') {
      if (index + 1 < source.length) word += source[index += 1];
      continue;
    }
    if (character === '$' && source[index + 1] === '(') {
      pushOperator('$(');
      substitutionQuotes.push(null);
      index += 1;
      continue;
    }
    if (character === ')' && substitutionQuotes.length > 0) {
      pushOperator(')');
      quote = substitutionQuotes.pop();
      continue;
    }
    if (/\s/.test(character)) {
      flushWord();
      if (character === '\n') tokens.push({ type: 'operator', value: '\n' });
      continue;
    }
    if (';&|()'.includes(character)) {
      const doubled = source[index + 1] === character && ';&|'.includes(character);
      pushOperator(doubled ? character + source[index += 1] : character);
      continue;
    }
    word += character;
  }
  flushWord();
  return tokens;
}

function shellLogicalCommands(source) {
  const commands = [];
  let words = [];
  const flush = () => {
    if (words.length > 0) commands.push(words);
    words = [];
  };
  for (const token of tokenizeShellCommands(source)) {
    if (token.type === 'operator') flush();
    else words.push(token.value);
  }
  flush();
  return commands;
}

const SHELL_CONTROL_PREFIXES = new Set([
  'if', 'then', 'elif', 'else', 'while', 'until', 'do', '!', 'time',
]);
const SHELL_COMMAND_WRAPPERS = new Set(['builtin', 'command', 'exec', 'nohup', 'sudo']);
const SHELL_PACKAGE_MANAGERS = new Set(['pnpm', 'npm', 'yarn', 'bun']);
const SHELL_PRODUCER_MUTATION_COMMANDS = new Set([
  'rm', 'ln', 'mv', 'cp', 'mkdir', 'install', 'touch', 'truncate', 'tee',
]);
const SHELL_PRODUCER_READ_ONLY_COMMANDS = new Set([
  '[', '[[', 'echo', 'printf', 'test',
]);
const SHELL_FIND_MUTATION_ACTIONS = new Set([
  '-delete', '-exec', '-execdir', '-fls', '-fprint', '-fprint0', '-fprintf', '-ok', '-okdir',
]);

function normalizeShellCommand(words) {
  let index = 0;
  while (index < words.length) {
    const token = stripShellToken(words[index]);
    if (/^[A-Za-z_][A-Za-z0-9_]*(?:\+)?=/.test(token)) {
      index += 1;
      continue;
    }
    if (SHELL_CONTROL_PREFIXES.has(token)) {
      index += 1;
      continue;
    }
    const executable = arrayValueAt(token.split('/'), -1);
    if (SHELL_COMMAND_WRAPPERS.has(executable) || executable === 'env') {
      index += 1;
      while (index < words.length) {
        const wrapperArgument = stripShellToken(words[index]);
        if (wrapperArgument === '--') {
          index += 1;
          break;
        }
        if (wrapperArgument.startsWith('-') || /^[A-Za-z_][A-Za-z0-9_]*=/.test(wrapperArgument)) {
          index += 1;
          continue;
        }
        break;
      }
      continue;
    }
    return { executable, arguments: words.slice(index + 1).map(stripShellToken) };
  }
  return null;
}

function inspectShellExecutable(source, fileName, platformRoot) {
  const errors = [];
  const edges = [];
  const producerVariables = new Set();
  const normalizedSource = stripShellComments(source.replace(/\\\r?\n[\t ]*/g, ' '));
  const activeLines = normalizedSource.split(/\r?\n/);
  for (const line of activeLines) {
    const assignment = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (assignment) {
      const value = assignment[2];
      if (
        /(?:ui-design-system|packages\/core)/.test(value) ||
        [...producerVariables].some((name) => new RegExp(`\\$\\{?${name}\\}?`).test(value))
      ) producerVariables.add(assignment[1]);
    }
  }
  const producerReference = (line) => (
    /(?:ui-design-system|packages\/core)/.test(line) ||
    [...producerVariables].some((name) => new RegExp(`\\$\\{?${name}\\}?`).test(line))
  );
  const redirectsIntoProducer = (words) => words.some((word, index) => {
    const match = stripShellToken(word).match(/^\d*(?:>>?|>\||<>)(.*)$/);
    if (!match) return false;
    const target = match[1] || words[index + 1] || '';
    return producerReference(stripShellToken(target));
  });
  for (const line of activeLines) {
    for (const words of shellLogicalCommands(line)) {
      if (!producerReference(words.join(' '))) continue;
      if (redirectsIntoProducer(words)) {
        errors.push(`${fileName} mutates the DS producer through shell redirection`);
        continue;
      }
      const command = normalizeShellCommand(words);
      if (!command) continue;
      if (SHELL_PRODUCER_MUTATION_COMMANDS.has(command.executable)) {
        errors.push(`${fileName} mutates the DS producer through shell tooling`);
        continue;
      }
      if (command.executable === 'find') {
        if (command.arguments.some((argument) => SHELL_FIND_MUTATION_ACTIONS.has(argument))) {
          errors.push(`${fileName} mutates the DS producer through shell tooling`);
        }
        continue;
      }
      if (SHELL_PACKAGE_MANAGERS.has(command.executable) &&
        command.arguments.some((argument) => ['build', 'install', 'rebuild', 'prepare'].includes(argument))
      ) {
        errors.push(`${fileName} builds or installs the DS producer`);
        continue;
      }
      if (!SHELL_PRODUCER_READ_ONLY_COMMANDS.has(command.executable)) {
        errors.push(`${fileName} uses unsupported command ${command.executable} against the DS producer`);
      }
    }

    const commandPatterns = [
      /(?:^|[;&|]\s*)(?:source|\.)\s+((?:"[^"]+"|'[^']+'|[^\s;&|]+))/g,
      /(?:^|[;&|]\s*)(?:node|tsx|bash|sh|zsh)\s+(?:--[^\s]+\s+)*((?:"[^"]+"|'[^']+'|[^\s;&|]+))/g,
      /(?:^|[;&|]\s*)((?:"?\.\.?\/[^\s;&|"']+\.(?:sh|mjs|cjs|js|ts)"?))/g,
    ];
    for (const pattern of commandPatterns) {
      for (const match of line.matchAll(pattern)) {
        const path = shellExecutablePath(match[1], dirname(resolve(platformRoot, fileName)), platformRoot);
        if (path) edges.push(path);
      }
    }
  }
  return { edges: [...new Set(edges)], errors: [...new Set(errors)] };
}

const PLATFORM_LIFECYCLE_SCRIPTS = new Set([
  'dev', 'predev', 'postdev', 'build', 'prebuild', 'postbuild',
  'preinstall', 'install', 'postinstall', 'prepare', 'prepack', 'postpack',
  'prepublish', 'prepublishOnly', 'preversion', 'version', 'postversion',
]);

function packageScriptEdges(command, platformRoot) {
  const shell = inspectShellExecutable(command, 'package.json#scripts', platformRoot);
  const scripts = [];
  for (const match of command.matchAll(/\b(?:pnpm|npm|yarn|bun)(?:\s+run)?\s+([A-Za-z0-9:_-]+)/g)) {
    if (!['install', 'exec', 'dlx', 'run'].includes(match[1])) scripts.push(match[1]);
  }
  return { ...shell, scripts };
}

export function auditPlatformExecutableClosure(platformRoot, packageManifest = readJson(resolve(platformRoot, 'package.json'))) {
  const errors = [];
  const visitedFiles = new Set();
  const visitedScripts = new Set();
  const pendingFiles = [
    resolve(platformRoot, 'scripts/verify-local-ds.mjs'),
    resolve(platformRoot, 'scripts/ds-toggle.sh'),
    resolve(platformRoot, 'next.config.ts'),
  ];
  const pendingScripts = [...PLATFORM_LIFECYCLE_SCRIPTS].filter((name) => packageManifest.scripts?.[name]);

  while (pendingScripts.length > 0) {
    const name = pendingScripts.pop();
    if (visitedScripts.has(name)) continue;
    visitedScripts.add(name);
    const command = packageManifest.scripts?.[name];
    if (!command) continue;
    const result = packageScriptEdges(command, platformRoot);
    errors.push(...result.errors.map((error) => `package script ${name}: ${error}`));
    pendingFiles.push(...result.edges);
    for (const nested of result.scripts) {
      if (packageManifest.scripts?.[nested]) pendingScripts.push(nested);
    }
  }

  while (pendingFiles.length > 0) {
    const absolute = resolve(pendingFiles.pop());
    if (visitedFiles.has(absolute)) continue;
    visitedFiles.add(absolute);
    if (!isPathInside(absolute, platformRoot)) {
      errors.push(`executable boundary escapes app-platform: ${normalizePath(absolute)}`);
      continue;
    }
    if (!existsSync(absolute) || !statSync(absolute).isFile()) {
      errors.push(`referenced executable is missing: ${normalizePath(relative(platformRoot, absolute))}`);
      continue;
    }
    const file = normalizePath(relative(platformRoot, absolute));
    const source = readFileSync(absolute, 'utf8');
    if (/\.(?:sh|bash|zsh)$/.test(absolute)) {
      const result = inspectShellExecutable(source, file, platformRoot);
      errors.push(...result.errors);
      pendingFiles.push(...result.edges);
      continue;
    }
    errors.push(...inspectJavaScriptExecutable(source, file));
    try {
      const localEdges = analyzeRuntimeModuleEdges(source, file).edges
        .map(({ specifier }) => specifier)
        .filter((specifier) => specifier.startsWith('./') || specifier.startsWith('../'));
      for (const specifier of localEdges) {
        const resolved = resolveSourceModule(absolute, specifier, resolve(platformRoot, 'src'));
        if (!resolved) errors.push(`${file} references missing local executable ${specifier}`);
        else pendingFiles.push(resolved);
      }
    } catch (error) {
      errors.push(`${file} has an untraceable executable edge: ${error.message}`);
    }
  }

  return [...new Set(errors)].sort();
}

export function validatePlatformLocalBoundary({ packageManifest, verifierSource, toggleSource, nextConfigSource }) {
  const errors = [];
  const packageScripts = packageManifest.scripts ?? {};
  const scripts = JSON.stringify(packageScripts);
  for (const retired of ['link-local-ds.mjs', 'ensure-local-ds-assets.mjs', 'local-ds-peers.mjs']) {
    if (scripts.includes(retired)) errors.push(`package scripts still invoke retired ${retired}`);
  }
  for (const scriptName of ['dev', 'build']) {
    if (!/^node scripts\/verify-local-ds\.mjs\s*&&/.test(packageScripts[scriptName] ?? '')) {
      errors.push(`package script ${scriptName} must begin with the read-only local DS verifier`);
    }
    const segments = (packageScripts[scriptName] ?? '').split(/\s*&&\s*/).filter(Boolean);
    const final = arrayValueAt(segments, -1) ?? '';
    const middle = segments.slice(1, -1);
    if (scriptName === 'dev' && (segments.length !== 2 || !/^next\s+dev(?:\s|$)/.test(final))) {
      errors.push('package script dev may only run the verifier followed by next dev');
    }
    if (scriptName === 'build') {
      if (!/^next\s+build(?:\s|$)/.test(final)) {
        errors.push('package script build must end with next build');
      }
      for (const segment of middle) {
        if (!/^\.\/scripts\/axiom-deploy-annotation\.sh\s+app-platform$/.test(segment)) {
          errors.push(`package script build inserts an unaudited executable before next build: ${segment}`);
        }
      }
    }
  }
  for (const [scriptName, command] of Object.entries(packageScripts)) {
    if (
      /(?:pnpm|npm|yarn|bun)\b[^\n]*(?:--dir|--prefix|--cwd)\s+[^\s]*(?:ui-design-system|packages\/core)[^\n]*(?:build|install)|(?:pnpm|npm|yarn|bun)\b[^\n]*(?:build|install)[^\n]*(?:ui-design-system|packages\/core)/.test(command)
    ) {
      errors.push(`package script ${scriptName} builds or installs the DS producer`);
    }
    if (/\b(?:rm|ln|mv|cp|mkdir)\b[^\n]*(?:ui-design-system|packages\/core)/.test(command)) {
      errors.push(`package script ${scriptName} mutates the DS producer`);
    }
  }

  for (const [label, source, fileName] of [
    ['verifier', verifierSource, 'scripts/verify-local-ds.mjs'],
    ['next.config.ts', nextConfigSource, 'next.config.ts'],
  ]) {
    errors.push(...inspectJavaScriptExecutable(source, fileName));
    try {
      analyzeRuntimeModuleEdges(source, fileName);
    } catch (error) {
      errors.push(`${label} has an untraceable executable edge: ${error.message}`);
    }
  }
  errors.push(...inspectShellExecutable(
    toggleSource,
    'scripts/ds-toggle.sh',
    resolve(repositoryRoot, '../app-platform'),
  ).errors);
  for (const required of [
    /SCRIPT_DIR=.*BASH_SOURCE/,
    /APP_ROOT=.*SCRIPT_DIR/,
    /ENV_FILE="\$APP_ROOT\/\.env\.local"/,
    /DS_LOCAL_PATH="\$APP_ROOT\/\.\.\/ui-design-system\/packages\/core"/,
  ]) {
    if (!required.test(toggleSource)) errors.push(`toggle is not anchored to the app directory: ${required}`);
  }

  const aliasEvidence = parseNextAliasEvidence(nextConfigSource);
  const expectedPackageAliases = new Map([
    [DESIGN_SYSTEM_PACKAGE, 'dist/index.js'],
    [`${DESIGN_SYSTEM_PACKAGE}/server`, 'dist/server.js'],
    [`${DESIGN_SYSTEM_PACKAGE}/icons`, 'dist/icons.js'],
    [`${DESIGN_SYSTEM_PACKAGE}/commercial`, 'dist/commercial.js'],
    [`${DESIGN_SYSTEM_PACKAGE}/commercial.css`, 'dist/commercial.css'],
    [`${DESIGN_SYSTEM_PACKAGE}/dist/platform.css`, 'dist/platform.css'],
  ]);
  for (const [specifier, target] of expectedPackageAliases) {
    const actual = aliasEvidence.packageAliases.aliases.get(specifier);
    if (actual?.base !== 'localDsRoot' || actual?.target !== target) {
      errors.push(`next.config.ts is missing executable local alias ${specifier} -> ${target}`);
    }
  }
  const expectedRuntimeAliases = new Map([
    ['react', 'react'],
    ['react-dom', 'react-dom'],
    ['d3', 'd3'],
    ['motion', 'motion'],
    ['antd', 'antd'],
    ['@ant-design/icons', '@ant-design/icons'],
    ['lucide-react', 'lucide-react'],
    ['dayjs', 'dayjs'],
  ]);
  for (const [specifier, target] of expectedRuntimeAliases) {
    const actual = aliasEvidence.runtimeAliases.aliases.get(specifier);
    if (actual?.base !== 'appNodeModulesPath' || actual?.target !== target) {
      errors.push(`next.config.ts does not resolve runtime ${specifier} from the consumer`);
    }
  }
  if (!aliasEvidence.runtimeAliases.spreads.has('localDsPackageAliases')) {
    errors.push('localDsAliases does not include the local package entry aliases');
  }
  if (aliasEvidence.localAliasSpreadCount < 2) {
    errors.push('localDsAliases must be wired into both Turbopack and Webpack');
  }
  if (aliasEvidence.legacySymlinkIdentifier) {
    errors.push('next.config.ts still selects the producer through a node_modules symlink');
  }
  return errors;
}

export function auditPlatformLocalBoundary(platformRoot) {
  const retiredFiles = [
    'scripts/link-local-ds.mjs',
    'scripts/ensure-local-ds-assets.mjs',
    'scripts/local-ds-peers.mjs',
  ];
  const errors = retiredFiles
    .filter((path) => existsSync(resolve(platformRoot, path)))
    .map((path) => `retired mutating local-link file still exists: ${path}`);
  errors.push(...validatePlatformLocalBoundary({
    packageManifest: readJson(resolve(platformRoot, 'package.json')),
    verifierSource: readFileSync(resolve(platformRoot, 'scripts/verify-local-ds.mjs'), 'utf8'),
    toggleSource: readFileSync(resolve(platformRoot, 'scripts/ds-toggle.sh'), 'utf8'),
    nextConfigSource: readFileSync(resolve(platformRoot, 'next.config.ts'), 'utf8'),
  }));
  errors.push(...auditPlatformExecutableClosure(platformRoot));
  return errors;
}

function collectExportTargets(value, targets = []) {
  if (typeof value === 'string') targets.push(value);
  else if (Array.isArray(value)) value.forEach((entry) => collectExportTargets(entry, targets));
  else if (value && typeof value === 'object') Object.values(value).forEach((entry) => collectExportTargets(entry, targets));
  return targets;
}

export function assertPackedBuildPrerequisite(root = coreRoot) {
  const manifest = readJson(resolve(root, 'package.json'));
  const concreteTargets = collectExportTargets(manifest.exports)
    .filter((target) => typeof target === 'string' && target.startsWith('./') && !target.includes('*'));
  const binTargets = typeof manifest.bin === 'string' ? [manifest.bin] : Object.values(manifest.bin ?? {});
  const requiredTargets = [...new Set([...concreteTargets, ...binTargets])];
  const missing = requiredTargets.filter((target) => !existsSync(resolve(root, target)));
  if (missing.length > 0) {
    throw new Error(
      `packed-artifact gate requires a completed producer build/package inputs; missing ${missing.join(', ')}`,
    );
  }

  const buildInputs = [
    ...walkFiles(resolve(root, 'src')).filter((path) => (
      // build-vertical-artifacts.mjs deliberately writes these committed
      // projections after Vite, then build-vertical-css consumes them. They
      // are outputs of the same build, not authored inputs that can stale the
      // JS/d.ts entries generated earlier in the pipeline.
      !/\/src\/foundation\/tokens\/css\/facade\/artifacts\/[^/]+\/index\.css$/.test(normalizePath(path))
    )),
    ...[
      'package.json',
      'tsconfig.json',
      'vite.config.ts',
      'postcss.config.mjs',
      'scripts/build-commercial-css.mjs',
      'scripts/build-vertical-artifacts.mjs',
      'scripts/build-vertical-css.mjs',
    ].map((path) => resolve(root, path)).filter(existsSync),
    ...(resolve(root) === resolve(coreRoot)
      ? ['package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml']
        .map((path) => resolve(repositoryRoot, path))
        .filter(existsSync)
      : []),
  ];
  const builtTargets = requiredTargets
    .filter((target) => target.startsWith('./dist/'))
    .map((target) => resolve(root, target));
  if (builtTargets.length === 0) throw new Error('packed-artifact gate found no concrete dist build outputs');
  const newestInput = Math.max(...buildInputs.map((path) => statSync(path).mtimeMs));
  const stale = builtTargets.filter((path) => statSync(path).mtimeMs + 1000 < newestInput);
  if (stale.length > 0) {
    throw new Error(
      'packed-artifact gate refuses stale producer output; run the DS build after the latest source/config change: ' +
      stale.map((path) => normalizePath(relative(root, path))).join(', '),
    );
  }
  return { builtTargets: builtTargets.length, requiredTargets: requiredTargets.length };
}

function packageSpecifier(manifest, subpath) {
  return subpath === '.' ? manifest.name : `${manifest.name}${subpath.slice(1)}`;
}

export function runtimeExportFixtures(manifest) {
  const conditions = collectRuntimeExportConditions(manifest);
  return {
    import: conditions
      .filter((entry) => entry.mode === 'import')
      .map((entry) => ({ ...entry, specifier: packageSpecifier(manifest, entry.subpath) })),
    require: conditions
      .filter((entry) => entry.mode === 'require')
      .map((entry) => ({ ...entry, specifier: packageSpecifier(manifest, entry.subpath) })),
  };
}

function wildcardTargetExists(packageDir, target) {
  const normalized = target.replace(/^\.\//, '');
  const [prefix, suffix] = normalized.split('*');
  const pending = [packageDir];
  while (pending.length > 0) {
    const current = pending.pop();
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const path = resolve(current, entry.name);
      if (entry.isDirectory()) pending.push(path);
      else if (entry.isFile()) {
        const candidate = normalizePath(relative(packageDir, path));
        if (candidate.startsWith(prefix) && candidate.endsWith(suffix)) return true;
      }
    }
  }
  return false;
}

export function validatePackedManifest(manifest, packageDir) {
  const errors = [];
  for (const target of collectExportTargets(manifest.exports)) {
    if (!target.startsWith('./')) {
      errors.push(`export target must be package-relative: ${target}`);
    } else if (target.includes('*')) {
      if (!wildcardTargetExists(packageDir, target)) errors.push(`wildcard export has no packed target: ${target}`);
    } else if (!existsSync(resolve(packageDir, target))) {
      errors.push(`packed export target is missing: ${target}`);
    }
  }
  for (const section of ['dependencies', 'optionalDependencies', 'peerDependencies']) {
    for (const [packageName, range] of Object.entries(manifest[section] ?? {})) {
      if (/^(?:workspace|link|file):/.test(String(range))) {
        errors.push(`${section}.${packageName} leaks a workspace/filesystem reference: ${range}`);
      }
    }
  }
  return errors;
}

function spawnChecked(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? repositoryRoot,
    encoding: 'utf8',
    env: options.env ?? process.env,
    // Supplier packages can ship multi-megabyte, single-line CJS bundles. If
    // Node reports an error from one of them, the default 1 MiB buffer cuts
    // the diagnostic before the actual exception and makes the pack gate
    // impossible to debug.
    maxBuffer: options.maxBuffer ?? 64 * 1024 * 1024,
    stdio: options.stdio ?? 'pipe',
  });
  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(' ')} failed (${result.status ?? 'signal'})\n${result.stdout ?? ''}${result.stderr ?? ''}`,
    );
  }
  return result;
}

function packageHasSymlink(packageDir) {
  const pending = [packageDir];
  while (pending.length > 0) {
    const current = pending.pop();
    for (const entry of readdirSync(current)) {
      const path = resolve(current, entry);
      const stat = lstatSync(path);
      if (stat.isSymbolicLink()) return normalizePath(relative(packageDir, path));
      if (stat.isDirectory()) pending.push(path);
    }
  }
  return null;
}

async function buildNonConsumingFixture(consumerRoot) {
  const entry = resolve(consumerRoot, 'entry.js');
  writeFileSync(
    entry,
    "import { DEFAULT_TENANT_SLUG } from '@rottay/design-system';\nconsole.log(DEFAULT_TENANT_SLUG);\n",
  );
  const vitePath = resolve(coreRoot, 'node_modules/vite/dist/node/index.js');
  if (!existsSync(vitePath)) throw new Error('Vite is not installed in the producer workspace');
  const { build } = await import(pathToFileURL(vitePath).href);
  const result = await build({
    configFile: false,
    root: consumerRoot,
    logLevel: 'silent',
    build: {
      write: false,
      minify: false,
      rollupOptions: {
        input: entry,
        onwarn(warning, warn) {
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
          warn(warning);
        },
        external(id) {
          if (id === '@rottay/design-system' || id.startsWith('@rottay/design-system/')) return false;
          return Boolean(
            supplierFamilyForSpecifier(id) ||
            id === 'react' || id.startsWith('react/') ||
            id === 'react-dom' || id.startsWith('react-dom/') ||
            id === 'dayjs' || id.startsWith('dayjs/')
          );
        },
      },
    },
  });
  const outputs = (Array.isArray(result) ? result : [result]).flatMap((entryResult) => entryResult.output ?? []);
  const supplierImports = new Set();
  let bytes = 0;
  for (const output of outputs) {
    if (output.type !== 'chunk') continue;
    bytes += Buffer.byteLength(output.code);
    for (const imported of [...output.imports, ...output.dynamicImports]) {
      const family = supplierFamilyForSpecifier(imported);
      if (family) supplierImports.add(`${family}:${imported}`);
    }
  }
  if (supplierImports.size > 0) {
    throw new Error(`non-consuming root bundle retained supplier imports: ${[...supplierImports].join(', ')}`);
  }
  return { bytes, supplierImports: [] };
}

async function bundleRuntimeExportFixtures(consumerRoot, fixtures) {
  const inputs = {};
  let index = 0;
  for (const fixture of fixtures.import) {
    const entry = resolve(consumerRoot, `runtime-import-entry-${index}.js`);
    writeFileSync(
      entry,
      `import * as exported from ${JSON.stringify(fixture.specifier)};\n` +
      `console.log(${JSON.stringify(fixture.specifier)}, Object.keys(exported).length);\n`,
    );
    inputs[`import-${index}`] = entry;
    index += 1;
  }
  for (const fixture of fixtures.require) {
    const entry = resolve(consumerRoot, `runtime-require-entry-${index}.cjs`);
    writeFileSync(
      entry,
      `const exported = require(${JSON.stringify(fixture.specifier)});\n` +
      `console.log(${JSON.stringify(fixture.specifier)}, Object.keys(exported).length);\n`,
    );
    inputs[`require-${index}`] = entry;
    index += 1;
  }
  const vitePath = resolve(coreRoot, 'node_modules/vite/dist/node/index.js');
  if (!existsSync(vitePath)) throw new Error('Vite is not installed in the producer workspace');
  const { build } = await import(pathToFileURL(vitePath).href);
  const result = await build({
    configFile: false,
    root: consumerRoot,
    logLevel: 'silent',
    build: {
      write: false,
      minify: false,
      rollupOptions: {
        input: inputs,
        preserveEntrySignatures: 'strict',
        onwarn(warning, warn) {
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
          warn(warning);
        },
        external(id) {
          if (id === DESIGN_SYSTEM_PACKAGE || id.startsWith(`${DESIGN_SYSTEM_PACKAGE}/`)) return false;
          return Boolean(
            supplierFamilyForSpecifier(id) ||
            id === 'react' || id.startsWith('react/') ||
            id === 'react-dom' || id.startsWith('react-dom/') ||
            id === 'dayjs' || id.startsWith('dayjs/') ||
            id === 'typescript' || id.startsWith('typescript/') ||
            id.startsWith('node:')
          );
        },
      },
    },
  });
  const outputs = (Array.isArray(result) ? result : [result]).flatMap((entryResult) => entryResult.output ?? []);
  const entryChunks = outputs.filter((output) => output.type === 'chunk' && output.isEntry);
  const expectedEntries = fixtures.import.length + fixtures.require.length;
  if (entryChunks.length !== expectedEntries) {
    throw new Error(`only ${entryChunks.length}/${expectedEntries} runtime export fixtures bundled`);
  }
  return {
    entries: entryChunks.length,
    bytes: entryChunks.reduce((sum, output) => sum + Buffer.byteLength(output.code), 0),
  };
}

function installedPackageDirectory(fromPackage, packageName) {
  const requireFromPackage = createRequire(resolve(fromPackage, 'package.json'));
  const candidates = [];
  try {
    candidates.push(requireFromPackage.resolve(`${packageName}/package.json`));
  } catch {
    // Some packages intentionally hide package.json behind exports.
  }
  try {
    candidates.push(requireFromPackage.resolve(packageName));
  } catch {
    // The caller decides whether an absent optional package is acceptable.
  }
  for (const candidate of candidates) {
    let current = statSync(candidate).isDirectory() ? candidate : dirname(candidate);
    while (true) {
      const manifestPath = resolve(current, 'package.json');
      if (existsSync(manifestPath) && readJson(manifestPath).name === packageName) {
        return realpathSync(current);
      }
      const parent = dirname(current);
      if (parent === current) break;
      current = parent;
    }
  }
  return null;
}

export function localizeRuntimeFixtureManifest(manifest, installedDependencies) {
  const localized = JSON.parse(JSON.stringify(manifest));
  // These are immutable consumer fixtures. Producer lifecycle hooks are not
  // part of the published runtime contract and must never execute here.
  delete localized.scripts;
  for (const section of ['dependencies', 'optionalDependencies']) {
    for (const packageName of Object.keys(localized[section] ?? {}).sort()) {
      const installedPath = installedDependencies[packageName];
      if (!installedPath) {
        if (section === 'optionalDependencies') {
          delete localized[section][packageName];
          continue;
        }
        throw new Error(`${manifest.name}@${manifest.version} requires unavailable runtime dependency ${packageName}`);
      }
      localized[section][packageName] = pathToFileURL(installedPath).href;
    }
    if (localized[section] && Object.keys(localized[section]).length === 0) delete localized[section];
  }
  return localized;
}

function collectInstalledRuntimeFixtureGraph(producerRoot, directPackageNames) {
  const nodes = new Map();
  const roots = new Map();
  const pending = directPackageNames.sort().map((packageName) => ({
    fromPackage: producerRoot,
    packageName,
    root: true,
  }));

  while (pending.length > 0) {
    const request = pending.shift();
    const packageDir = installedPackageDirectory(request.fromPackage, request.packageName);
    if (!packageDir) {
      throw new Error(`cannot certify packed consumer without installed producer fixture ${request.packageName}`);
    }
    if (request.root) {
      const existing = roots.get(request.packageName);
      if (existing && existing !== packageDir) {
        throw new Error(`packed consumer requires conflicting root identities for ${request.packageName}`);
      }
      roots.set(request.packageName, packageDir);
    }
    if (nodes.has(packageDir)) continue;

    const manifest = readJson(resolve(packageDir, 'package.json'));
    const edges = {};
    nodes.set(packageDir, { edges, manifest, packageDir });
    for (const section of ['dependencies', 'optionalDependencies']) {
      for (const packageName of Object.keys(manifest[section] ?? {}).sort()) {
        const dependencyDir = installedPackageDirectory(packageDir, packageName);
        if (!dependencyDir) {
          if (section === 'optionalDependencies') continue;
          throw new Error(`${manifest.name}@${manifest.version} requires unavailable runtime dependency ${packageName}`);
        }
        edges[packageName] = dependencyDir;
        pending.push({ fromPackage: packageDir, packageName, root: false });
      }
    }
    for (const packageName of Object.keys(manifest.peerDependencies ?? {}).sort()) {
      if (manifest.peerDependenciesMeta?.[packageName]?.optional === true) continue;
      const peerDir = installedPackageDirectory(packageDir, packageName);
      if (!peerDir) {
        throw new Error(`${manifest.name}@${manifest.version} requires unavailable runtime peer ${packageName}`);
      }
      pending.push({ fromPackage: packageDir, packageName, root: true });
    }
  }
  return { nodes, roots };
}

function fixturePackageSlug(node, index) {
  const identity = `${node.manifest.name}-${node.manifest.version}`
    .replace(/^@/, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-');
  return `${String(index).padStart(3, '0')}-${identity}`;
}

function packInstalledRuntimeFixtures({ fixtureRoot, packedManifest, producerRoot }) {
  const runtimeDeclarations = {
    ...(packedManifest.dependencies ?? {}),
    ...(packedManifest.optionalDependencies ?? {}),
    ...(packedManifest.peerDependencies ?? {}),
  };
  const graph = collectInstalledRuntimeFixtureGraph(producerRoot, Object.keys(runtimeDeclarations));
  const orderedNodes = [...graph.nodes.values()].sort((left, right) => (
    `${left.manifest.name}\0${left.manifest.version}\0${left.packageDir}`
      .localeCompare(`${right.manifest.name}\0${right.manifest.version}\0${right.packageDir}`)
  ));
  const stagedPaths = new Map();
  const stagesRoot = resolve(fixtureRoot, 'runtime-stages');
  mkdirSync(stagesRoot, { recursive: true });

  orderedNodes.forEach((node, index) => {
    const bundledDependencies = node.manifest.bundleDependencies ?? node.manifest.bundledDependencies ?? [];
    if (bundledDependencies === true || bundledDependencies.length > 0) {
      throw new Error(
        `${node.manifest.name}@${node.manifest.version} uses bundledDependencies; ` +
        'the offline fixture cannot discard its installed node_modules',
      );
    }
    const stagedPath = resolve(stagesRoot, fixturePackageSlug(node, index));
    const symlink = packageHasSymlink(node.packageDir);
    if (symlink) {
      throw new Error(`${node.manifest.name}@${node.manifest.version} contains an installed symlink: ${symlink}`);
    }
    cpSync(node.packageDir, stagedPath, {
      recursive: true,
      mode: fsConstants.COPYFILE_FICLONE,
      filter(sourcePath) {
        return sourcePath === node.packageDir || basename(sourcePath) !== 'node_modules';
      },
    });
    stagedPaths.set(node.packageDir, stagedPath);
  });

  for (const node of orderedNodes) {
    const installedDependencies = Object.fromEntries(
      Object.entries(node.edges).map(([packageName, packageDir]) => [
        packageName,
        stagedPaths.get(packageDir),
      ]),
    );
    const localized = localizeRuntimeFixtureManifest(node.manifest, installedDependencies);
    writeFileSync(resolve(stagedPaths.get(node.packageDir), 'package.json'), JSON.stringify(localized, null, 2));
  }

  const tarballs = new Map();
  const packsRoot = resolve(fixtureRoot, 'runtime-packs');
  mkdirSync(packsRoot, { recursive: true });
  for (const [packageName, packageDir] of [...graph.roots].sort(([left], [right]) => left.localeCompare(right))) {
    const node = graph.nodes.get(packageDir);
    const packRoot = resolve(packsRoot, fixturePackageSlug(node, tarballs.size));
    mkdirSync(packRoot, { recursive: true });
    spawnChecked('npm', ['pack', '--ignore-scripts', '--pack-destination', packRoot], {
      cwd: stagedPaths.get(packageDir),
      env: {
        ...process.env,
        npm_config_cache: resolve(fixtureRoot, 'npm-cache'),
        npm_config_ignore_scripts: 'true',
        npm_config_offline: 'true',
      },
    });
    const packed = readdirSync(packRoot).filter((file) => file.endsWith('.tgz'));
    if (packed.length !== 1) {
      throw new Error(`expected one local runtime tarball for ${packageName}; found ${packed.length}`);
    }
    tarballs.set(packageName, resolve(packRoot, packed[0]));
  }
  return { stagedPackages: orderedNodes.length, tarballs };
}

function installPackedConsumer({ consumerRoot, tarball, packedManifest, producerRoot, fixtureRoot }) {
  const runtimeFixtures = packInstalledRuntimeFixtures({ fixtureRoot, packedManifest, producerRoot });
  const dependencies = {
    [packedManifest.name]: pathToFileURL(tarball).href,
  };
  for (const [packageName, runtimeTarball] of runtimeFixtures.tarballs) {
    dependencies[packageName] = pathToFileURL(runtimeTarball).href;
  }
  const overrides = Object.fromEntries(
    [...runtimeFixtures.tarballs].map(([packageName, runtimeTarball]) => [
      packageName,
      pathToFileURL(runtimeTarball).href,
    ]),
  );
  writeFileSync(resolve(consumerRoot, 'package.json'), JSON.stringify({
    name: 'packed-consumer',
    private: true,
    type: 'module',
    dependencies,
    pnpm: { overrides },
  }, null, 2));
  spawnChecked(
    'pnpm',
    [
      'install',
      '--offline',
      '--ignore-scripts',
      '--no-frozen-lockfile',
      '--config.auto-install-peers=false',
      '--store-dir',
      resolve(fixtureRoot, 'consumer-store'),
    ],
    {
      cwd: consumerRoot,
      env: { ...process.env, npm_config_offline: 'true' },
    },
  );
  const installedPackage = resolve(consumerRoot, 'node_modules', ...packedManifest.name.split('/'));
  if (!existsSync(installedPackage)) throw new Error('packed tarball was not installed in the consumer fixture');
  const installedRealPath = realpathSync(installedPackage);
  const relativeToProducer = relative(realpathSync(repositoryRoot), installedRealPath);
  if (relativeToProducer !== '..' && !relativeToProducer.startsWith(`..${sep}`)) {
    throw new Error(`packed consumer resolves through the producer workspace: ${installedRealPath}`);
  }
  return { installedPackage, runtimeFixtures };
}

export async function auditPackedArtifact(root = coreRoot) {
  assertPackedBuildPrerequisite(root);

  // pnpm encodes local tarball paths into store filenames. Darwin's default
  // TMPDIR lives under a long `/var/folders/...` prefix, which can push those
  // filenames beyond the filesystem component limit even though the package
  // graph itself is valid. Keep this offline fixture short and isolated.
  const temporaryBase = process.platform === 'darwin' && existsSync('/tmp')
    ? '/tmp'
    : tmpdir();
  const temporaryRoot = mkdtempSync(resolve(temporaryBase, 'rds-pack-'));
  try {
    const packDir = resolve(temporaryRoot, 'pack');
    const extractDir = resolve(temporaryRoot, 'extract');
    mkdirSync(packDir, { recursive: true });
    mkdirSync(extractDir, { recursive: true });
    spawnChecked('pnpm', ['pack', '--pack-destination', packDir], { cwd: root });
    const tarballs = readdirSync(packDir).filter((file) => file.endsWith('.tgz'));
    if (tarballs.length !== 1) throw new Error(`expected one packed tarball; found ${tarballs.length}`);
    const tarball = resolve(packDir, tarballs[0]);
    spawnChecked('tar', ['-xzf', tarball, '-C', extractDir]);
    const extractedPackage = resolve(extractDir, 'package');
    const packedManifest = readJson(resolve(extractedPackage, 'package.json'));
    const errors = validatePackedManifest(packedManifest, extractedPackage);
    const symlink = packageHasSymlink(extractedPackage);
    if (symlink) errors.push(`packed artifact contains a symlink: ${symlink}`);
    if (errors.length > 0) throw new Error(errors.join('\n'));

    const consumerRoot = resolve(temporaryRoot, 'consumer');
    mkdirSync(consumerRoot, { recursive: true });
    const { installedPackage, runtimeFixtures: installedRuntimeFixtures } = installPackedConsumer({
      consumerRoot,
      fixtureRoot: temporaryRoot,
      packedManifest,
      producerRoot: root,
      tarball,
    });

    const fixtureSource = resolve(consumerRoot, 'src/fixture.tsx');
    mkdirSync(dirname(fixtureSource), { recursive: true });
    writeFileSync(
      fixtureSource,
      `import { AreaChart, CountUp, FadeIn, ScaleIn } from ${JSON.stringify(packedManifest.name)};\n` +
      `import { CopyIcon, Icon } from ${JSON.stringify(`${packedManifest.name}/icons`)};\n` +
      `import { BrandMark, CloudServiceMark } from ${JSON.stringify(`${packedManifest.name}/marks`)};\n` +
      `import {\n` +
      `  ChartFrame,\n` +
      `  ChartInsightSummary,\n` +
      `  resolveChartProjection,\n` +
      `  type ChartAlternateProjectionView,\n` +
      `  type ChartDeviceClass,\n` +
      `  type ChartFrameHeadingLevel,\n` +
      `  type ChartFrameProps,\n` +
      `  type ChartFrameStatus,\n` +
      `  type ChartInsightSummaryProps,\n` +
      `  type ChartFullProjectionView,\n` +
      `  type ChartMicroProjectionView,\n` +
      `  type ChartPhoneProjectionView,\n` +
      `  type ChartProjectionSpec,\n` +
      `  type ChartProjectionView,\n` +
      `  type ChartRankedRowsProjectionView,\n` +
      `  type ChartSummaryProjectionView,\n` +
      `  type ChartTopNProjectionView,\n` +
      `} from ${JSON.stringify(`${packedManifest.name}/charts`)};\n` +
      `import {\n` +
      `  CHART_GRAMMARS,\n` +
      `  CHART_GRAMMAR_IDS,\n` +
      `  CHART_GRAMMAR_REGISTRY,\n` +
      `  isChartGrammar,\n` +
      `  isChartGrammarId,\n` +
      `  isChartInsightSpec,\n` +
      `  isChartInsightSummary,\n` +
      `  resolveChartGrammar,\n` +
      `  type ChartAnnotationPosture,\n` +
      `  type ChartAxisPosture,\n` +
      `  type ChartBandInsightSpec,\n` +
      `  type ChartCategoricalPaletteReference,\n` +
      `  type ChartDirectLabelInsightSpec,\n` +
      `  type ChartDivergingPaletteReference,\n` +
      `  type ChartEventInsightSpec,\n` +
      `  type ChartGrammar,\n` +
      `  type ChartGrammarChannels,\n` +
      `  type ChartGrammarId,\n` +
      `  type ChartGrammarMotionPosture,\n` +
      `  type ChartGrammarPosture,\n` +
      `  type ChartGridPosture,\n` +
      `  type ChartInsightProvenance,\n` +
      `  type ChartInsightSpec,\n` +
      `  type ChartInsightSummary as ChartInsightSummarySpec,\n` +
      `  type ChartMarkPosture,\n` +
      `  type ChartSequentialPaletteReference,\n` +
      `  type ChartStatusPaletteReference,\n` +
      `  type ChartTargetInsightSpec,\n` +
      `} from ${JSON.stringify(`${packedManifest.name}/charts/spec`)};\n` +
      `import {\n` +
      `  CHART_DATA_ACCESS_CSV_MIME_TYPE,\n` +
      `  CHART_DATA_ACCESS_PAGE_SIZE_MAX,\n` +
      `  CHART_DATA_ACCESS_SUMMARY_LIMIT,\n` +
      `  ChartDataAccess,\n` +
      `  sanitizeChartDataAccessCsvFilename,\n` +
      `  serializeChartDataAccessCsv,\n` +
      `  type ChartDataAccessCellValue,\n` +
      `  type ChartDataAccessColumn,\n` +
      `  type ChartDataAccessCsvDownload,\n` +
      `  type ChartDataAccessCsvFile,\n` +
      `  type ChartDataAccessLabels,\n` +
      `  type ChartDataAccessPageStatus,\n` +
      `  type ChartDataAccessProps,\n` +
      `  type ChartDataAccessSummaryFact,\n` +
      `} from ${JSON.stringify(`${packedManifest.name}/charts/access`)};\n` +
      `import {\n` +
      `  createSvgLineDatumKey,\n` +
      `  SvgBarRenderer,\n` +
      `  SvgHeatMapRenderer,\n` +
      `  SvgLineRenderer,\n` +
      `  SvgPieRenderer,\n` +
      `  SvgScatterRenderer,\n` +
      `  type ChartActionInteraction,\n` +
      `  type ChartActiveDatum,\n` +
      `  type ChartExploreInteraction,\n` +
      `  type ChartGeometryInsets,\n` +
      `  type ChartInteraction,\n` +
      `  type ChartInteractionMeta,\n` +
      `  type ChartInteractionMode,\n` +
      `  type ChartInteractionPointerType,\n` +
      `  type ChartInteractionReason,\n` +
      `  type ChartStaticInteraction,\n` +
      `  type SvgBarDatum,\n` +
      `  type SvgBarRendererProps,\n` +
      `  type SvgHeatMapDatum,\n` +
      `  type SvgHeatMapRendererProps,\n` +
      `  type SvgLineCurve,\n` +
      `  type SvgLineInteractionDatum,\n` +
      `  type SvgLinePoint,\n` +
      `  type SvgLineRendererProps,\n` +
      `  type SvgLineSeries,\n` +
      `  type SvgLineXType,\n` +
      `  type SvgLineXValue,\n` +
      `  type SvgPieDatum,\n` +
      `  type SvgPieRendererProps,\n` +
      `  type SvgScatterDatum,\n` +
      `  type SvgScatterRendererProps,\n` +
      `  type SvgScatterVariant,\n` +
      `} from ${JSON.stringify(`${packedManifest.name}/charts/renderers`)};\n` +
      `import {\n` +
      `  MOTION_DIAL_BOUNDS,\n` +
      `  MOTION_PROFILE_DEFAULTS,\n` +
      `  MOTION_PROFILE_ENVELOPES,\n` +
      `  MOTION_RECIPE_NAMES,\n` +
      `  MotionProvider,\n` +
      `  normalizeTenantMotionDial,\n` +
      `  resolveMotionPolicy,\n` +
      `  resolveMotionRecipe,\n` +
      `  useMotionPolicy,\n` +
      `  useMotionPreference,\n` +
      `  useMotionRecipe,\n` +
      `  type AmbientMotion,\n` +
      `  type MotionCompositorProperty,\n` +
      `  type MotionContextValue,\n` +
      `  type MotionCurve,\n` +
      `  type MotionPointer,\n` +
      `  type MotionPolicy,\n` +
      `  type MotionPolicyInput,\n` +
      `  type MotionPower,\n` +
      `  type MotionProfile,\n` +
      `  type MotionProviderProps,\n` +
      `  type MotionRecipeName,\n` +
      `  type MotionRecipeResolveOptions,\n` +
      `  type NormalizedTenantMotionDial,\n` +
      `  type ResolvedMotionRecipe,\n` +
      `  type TenantMotionDial,\n` +
      `} from ${JSON.stringify(`${packedManifest.name}/motion`)};\n` +
      `import {\n` +
      `  EFFECT_DEFINITIONS,\n` +
      `  EFFECT_IDS,\n` +
      `  EFFECT_REGISTRY,\n` +
      `  EFFECT_REGISTRY_VERSION,\n` +
      `  EFFECT_RESEARCH_PROVENANCE,\n` +
      `  getEffectDefinition,\n` +
      `  isEffectDefinition,\n` +
      `  isEffectId,\n` +
      `  resolveEffect,\n` +
      `  type EffectAdmission,\n` +
      `  type EffectAriaStrategy,\n` +
      `  type EffectBudget,\n` +
      `  type EffectDefinition,\n` +
      `  type EffectEngine,\n` +
      `  type EffectFallbackDefinition,\n` +
      `  type EffectId,\n` +
      `  type EffectLoop,\n` +
      `  type EffectObservedRuntime,\n` +
      `  type EffectProvenance,\n` +
      `  type EffectPurpose,\n` +
      `  type EffectRenderer,\n` +
      `  type EffectResolution,\n` +
      `  type EffectResolutionMode,\n` +
      `  type EffectResolutionReason,\n` +
      `  type EffectRuntimeContext,\n` +
      `  type EffectTier,\n` +
      `  type EffectVertical,\n` +
      `  type MeasuredEffectBudget,\n` +
      `  type ReferencedEffectProvenance,\n` +
      `  type UnmeasuredEffectBudget,\n` +
      `  type VerifiedEffectProvenance,\n` +
      `} from ${JSON.stringify(`${packedManifest.name}/effects`)};\n` +
      `import {\n` +
      `  SPATIAL_SCENE_MODULE_VERSION as SPATIAL_HOST_MODULE_VERSION,\n` +
      `  SpatialExperience,\n` +
      `  type SpatialExperienceEvent,\n` +
      `  type SpatialExperienceLabels,\n` +
      `  type SpatialExperienceProps,\n` +
      `  type SpatialPerformanceSample,\n` +
      `  type SpatialSceneLoader,\n` +
      `  type SpatialSceneModule,\n` +
      `  type SpatialSceneRuntimeProps,\n` +
      `} from ${JSON.stringify(`${packedManifest.name}/spatial`)};\n` +
      `import {\n` +
      `  SPATIAL_QUALITY_BUDGETS,\n` +
      `  SPATIAL_SCENE_MODULE_VERSION,\n` +
      `  downgradeSpatialMode,\n` +
      `  isSpatialSceneModule,\n` +
      `  resolveSpatialPolicy,\n` +
      `  resolveSpatialQualityBudget,\n` +
      `  type SpatialBackend,\n` +
      `  type SpatialCapability,\n` +
      `  type SpatialContextState,\n` +
      `  type SpatialInteraction,\n` +
      `  type SpatialLiveMode,\n` +
      `  type SpatialMode,\n` +
      `  type SpatialPointer,\n` +
      `  type SpatialPolicyInput,\n` +
      `  type SpatialPower,\n` +
      `  type SpatialPowerPreference,\n` +
      `  type SpatialPurpose,\n` +
      `  type SpatialQuality,\n` +
      `  type SpatialQualityBudget,\n` +
      `  type SpatialResolution,\n` +
      `  type SpatialResolutionReason,\n` +
      `  type SpatialSceneModuleContract,\n` +
      `} from ${JSON.stringify(`${packedManifest.name}/spatial/spec`)};\n` +
      `const chartSpec = {\n` +
      `  desktop: { mode: 'full', rendererId: 'packed.full' },\n` +
      `  phone: { mode: 'summary', rendererId: 'packed.summary', summaryId: 'packed.total' },\n` +
      `} satisfies ChartProjectionSpec;\n` +
      `const chartDevice: ChartDeviceClass = 'phone';\n` +
      `const chartView: ChartProjectionView = resolveChartProjection(chartSpec, chartDevice);\n` +
      `const chartPhoneView: ChartPhoneProjectionView = chartSpec.phone;\n` +
      `const chartFrameProps: Pick<ChartFrameProps, 'projection' | 'renderView' | 'title'> = {\n` +
      `  projection: chartSpec,\n` +
      `  renderView: (view) => view.rendererId,\n` +
      `  title: 'Packed chart',\n` +
      `};\n` +
      `type PackedChartTypes = [\n` +
      `  ChartAlternateProjectionView, ChartFrameHeadingLevel, ChartFrameStatus,\n` +
      `  ChartFullProjectionView, ChartMicroProjectionView, ChartRankedRowsProjectionView,\n` +
      `  ChartSummaryProjectionView, ChartTopNProjectionView,\n` +
      `];\n` +
      `const packedChartTypes = null as unknown as PackedChartTypes;\n` +
      `const chartGrammarId: ChartGrammarId = 'bithire';\n` +
      `const chartGrammar: ChartGrammar = resolveChartGrammar(chartGrammarId);\n` +
      `const chartInsight: ChartInsightSpec = { id: 'target', type: 'target', value: 42, label: 'Target' };\n` +
      `const chartSummary: ChartInsightSummarySpec = { id: 'summary', mode: 'computed', text: 'On target', provenance: { sourceIds: ['packed-source'], methodId: 'packed-method' } };\n` +
      `const chartInsightSummaryProps: ChartInsightSummaryProps = { summary: chartSummary };\n` +
      `type PackedChartSpecTypes = [\n` +
      `  ChartAnnotationPosture, ChartAxisPosture, ChartBandInsightSpec,\n` +
      `  ChartCategoricalPaletteReference, ChartDirectLabelInsightSpec,\n` +
      `  ChartDivergingPaletteReference, ChartEventInsightSpec, ChartGrammarChannels,\n` +
      `  ChartGrammarMotionPosture, ChartGrammarPosture, ChartGridPosture,\n` +
      `  ChartInsightProvenance, ChartMarkPosture, ChartSequentialPaletteReference,\n` +
      `  ChartStatusPaletteReference, ChartTargetInsightSpec,\n` +
      `];\n` +
      `const packedChartSpecTypes = null as unknown as PackedChartSpecTypes;\n` +
      `const chartSpecValues = [CHART_GRAMMARS, CHART_GRAMMAR_IDS, CHART_GRAMMAR_REGISTRY, isChartGrammar, isChartGrammarId, isChartInsightSpec, isChartInsightSummary];\n` +
      `interface PackedAccessRow { readonly id: string; readonly label: string; readonly value: number; }\n` +
      `const accessRows: readonly PackedAccessRow[] = [{ id: 'row-1', label: 'Packed', value: 1 }];\n` +
      `const accessColumns = [\n` +
      `  { id: 'label', label: 'Label', getValue: (row: PackedAccessRow) => row.label },\n` +
      `  { id: 'value', label: 'Value', getValue: (row: PackedAccessRow) => row.value },\n` +
      `] as const satisfies readonly [ChartDataAccessColumn<PackedAccessRow>, ...ChartDataAccessColumn<PackedAccessRow>[]];\n` +
      `const accessSummary = [{ id: 'fact-1', label: 'Total', value: '1' }] satisfies readonly ChartDataAccessSummaryFact[];\n` +
      `const accessLabels: ChartDataAccessLabels = { summaryHeading: 'Summary', openTable: 'Open table', closeTable: 'Close table', exportCsv: 'Export CSV', tableCaption: 'Packed data', previousPage: 'Previous', nextPage: 'Next', emptyTable: 'No data', pageStatus: ({ page, pageCount }) => \`Page \${page} of \${pageCount}\` };\n` +
      `const accessDownload: ChartDataAccessCsvDownload = () => undefined;\n` +
      `const accessProps = { summary: accessSummary, columns: accessColumns, rows: accessRows, getRowKey: (row: PackedAccessRow) => row.id, labels: accessLabels, csvFilename: 'packed.csv', downloadCsv: accessDownload } satisfies ChartDataAccessProps<PackedAccessRow>;\n` +
      `const accessPageStatus: ChartDataAccessPageStatus = { page: 1, pageCount: 1, firstRow: 1, lastRow: 1, totalRows: 1 };\n` +
      `const accessCell: ChartDataAccessCellValue = accessRows.length;\n` +
      `const accessFile: ChartDataAccessCsvFile = { content: serializeChartDataAccessCsv(accessRows, accessColumns), filename: sanitizeChartDataAccessCsvFilename('packed.csv'), mimeType: CHART_DATA_ACCESS_CSV_MIME_TYPE, rowCount: accessRows.length };\n` +
      `const accessValues = [CHART_DATA_ACCESS_CSV_MIME_TYPE, CHART_DATA_ACCESS_PAGE_SIZE_MAX, CHART_DATA_ACCESS_SUMMARY_LIMIT, ChartDataAccess, sanitizeChartDataAccessCsvFilename, serializeChartDataAccessCsv];\n` +
      `const rendererInsets: ChartGeometryInsets = { top: 8, right: 8, bottom: 24, left: 32 };\n` +
      `const barData: readonly SvgBarDatum[] = [{ id: 'bar', category: 'A', value: 1 }];\n` +
      `const heatData: readonly SvgHeatMapDatum[] = [{ id: 'cell', column: 'A', row: 'B', value: 1 }];\n` +
      `const lineX: SvgLineXValue = 'A';\n` +
      `const linePoint: SvgLinePoint = { id: 'point', x: lineX, value: 1 };\n` +
      `const lineSeries: readonly SvgLineSeries[] = [{ id: 'line', label: 'Line', points: [linePoint] }];\n` +
      `const pieData: readonly SvgPieDatum[] = [{ id: 'slice', label: 'Slice', value: 1 }];\n` +
      `const scatterData: readonly SvgScatterDatum[] = [{ id: 'scatter', label: 'Scatter', x: 1, y: 2, size: 3 }];\n` +
      `const lineInteractionDatum: SvgLineInteractionDatum = { series: { id: 'line', label: 'Line' }, point: linePoint };\n` +
      `const lineDatumKey = createSvgLineDatumKey(lineInteractionDatum.series.id, lineInteractionDatum.point.id);\n` +
      `const chartInteractionMeta: ChartInteractionMeta = { input: 'keyboard', reason: 'focus' };\n` +
      `const chartActiveDatum: ChartActiveDatum<SvgLineInteractionDatum> = { key: lineDatumKey, label: 'Line point', datum: lineInteractionDatum };\n` +
      `const chartInteraction: ChartInteraction<SvgLineInteractionDatum> = { mode: 'static' };\n` +
      `type PackedChartInteractionTypes = [\n` +
      `  ChartActionInteraction<SvgLineInteractionDatum>,\n` +
      `  ChartExploreInteraction<SvgLineInteractionDatum>,\n` +
      `  ChartInteractionMode, ChartInteractionPointerType, ChartInteractionReason,\n` +
      `  ChartStaticInteraction,\n` +
      `];\n` +
      `const packedChartInteractionTypes = null as unknown as PackedChartInteractionTypes;\n` +
      `const lineCurve: SvgLineCurve = 'smooth';\n` +
      `const lineXType: SvgLineXType = 'category';\n` +
      `const scatterVariant: SvgScatterVariant = 'bubble';\n` +
      `const barProps = { ariaLabel: 'Bar', data: barData, insets: rendererInsets } satisfies SvgBarRendererProps;\n` +
      `const heatProps = { ariaLabel: 'Heat', data: heatData, insets: rendererInsets } satisfies SvgHeatMapRendererProps;\n` +
      `const lineProps = { ariaLabel: 'Line', series: lineSeries, curve: lineCurve, xType: lineXType, insets: rendererInsets } satisfies SvgLineRendererProps;\n` +
      `const pieProps = { ariaLabel: 'Pie', data: pieData, variant: 'donut', insets: rendererInsets } satisfies SvgPieRendererProps;\n` +
      `const scatterProps = { ariaLabel: 'Scatter', data: scatterData, variant: scatterVariant, insets: rendererInsets } satisfies SvgScatterRendererProps;\n` +
      `const rendererComponents = [SvgBarRenderer, SvgHeatMapRenderer, SvgLineRenderer, SvgPieRenderer, SvgScatterRenderer];\n` +
      `const motionDial = { intensity: 0.4, durationScale: 1, ambient: 'off' } satisfies TenantMotionDial;\n` +
      `const motionInput = { profile: 'calm', tenantDial: motionDial, reduce: false, pointer: 'fine', power: 'normal', visible: true } satisfies MotionPolicyInput;\n` +
      `const motionPolicy: MotionPolicy = resolveMotionPolicy(motionInput);\n` +
      `const motionOptions: MotionRecipeResolveOptions = { active: true, itemCount: 3 };\n` +
      `const motionRecipe: ResolvedMotionRecipe = resolveMotionRecipe('feedback.confirm', motionPolicy, motionOptions);\n` +
      `type PackedMotionTypes = [\n` +
      `  AmbientMotion, MotionCompositorProperty, MotionContextValue, MotionCurve, MotionPointer,\n` +
      `  MotionPower, MotionProfile, MotionProviderProps, MotionRecipeName,\n` +
      `  NormalizedTenantMotionDial,\n` +
      `];\n` +
      `const packedMotionTypes = null as unknown as PackedMotionTypes;\n` +
      `const motionValues = [MOTION_DIAL_BOUNDS, MOTION_PROFILE_DEFAULTS, MOTION_PROFILE_ENVELOPES, MOTION_RECIPE_NAMES, MotionProvider, normalizeTenantMotionDial, useMotionPolicy, useMotionPreference, useMotionRecipe];\n` +
      `const effectId: EffectId = 'glass-card';\n` +
      `const effectContext: EffectRuntimeContext = { reducedMotion: true, pointer: 'coarse' };\n` +
      `const effectResolution: EffectResolution = resolveEffect(effectId, effectContext);\n` +
      `type PackedEffectTypes = [\n` +
      `  EffectAdmission, EffectAriaStrategy, EffectBudget, EffectDefinition, EffectEngine,\n` +
      `  EffectFallbackDefinition, EffectLoop, EffectObservedRuntime, EffectProvenance,\n` +
      `  EffectPurpose, EffectRenderer, EffectResolutionMode, EffectResolutionReason,\n` +
      `  EffectTier, EffectVertical, MeasuredEffectBudget, ReferencedEffectProvenance,\n` +
      `  UnmeasuredEffectBudget, VerifiedEffectProvenance,\n` +
      `];\n` +
      `const packedEffectTypes = null as unknown as PackedEffectTypes;\n` +
      `const effectValues = [EFFECT_DEFINITIONS, EFFECT_IDS, EFFECT_REGISTRY, EFFECT_REGISTRY_VERSION, EFFECT_RESEARCH_PROVENANCE, getEffectDefinition, isEffectDefinition, isEffectId];\n` +
      `const spatialPolicyInput: SpatialPolicyInput = { enabled: true, hydrated: true, capability: 'webgl2', contextState: 'ready', lease: true, visible: true, inView: true, reduce: false, phone: false, tablet: false, pointer: 'fine', power: 'normal', quality: 'auto', adaptiveLow: false, contractReady: true };\n` +
      `const spatialResolution: SpatialResolution = resolveSpatialPolicy(spatialPolicyInput);\n` +
      `const spatialBudget: SpatialQualityBudget | null = resolveSpatialQualityBudget(spatialResolution.mode);\n` +
      `const spatialDowngrade: SpatialMode = downgradeSpatialMode(spatialResolution.mode);\n` +
      `const PackedSpatialScene = (_props: SpatialSceneRuntimeProps) => null;\n` +
      `const spatialModule: SpatialSceneModule = { version: SPATIAL_HOST_MODULE_VERSION, backend: 'webgl2', Scene: PackedSpatialScene };\n` +
      `const spatialContract: SpatialSceneModuleContract<typeof PackedSpatialScene> = spatialModule;\n` +
      `const spatialLoader: SpatialSceneLoader = async () => spatialModule;\n` +
      `const spatialLabels: SpatialExperienceLabels = { controls: 'Packed controls', alternative: 'Packed alternative', retry: 'Retry', pause: 'Pause', resume: 'Resume' };\n` +
      `const spatialProps: SpatialExperienceProps = { id: 'packed-spatial', label: 'Packed spatial', purpose: 'explanation', description: 'Packed spatial fixture', poster: 'Poster', reduced: 'Reduced', alternative: 'Alternative', controls: 'Controls', labels: spatialLabels, loadScene: spatialLoader, interaction: 'inspect' };\n` +
      `const spatialPerformance: SpatialPerformanceSample = { frameTimeMs: 16 };\n` +
      `const spatialEvent: SpatialExperienceEvent = { type: 'mode', id: spatialProps.id, mode: spatialResolution.mode, backend: spatialResolution.backend, reason: spatialResolution.reason };\n` +
      `type PackedSpatialTypes = [SpatialBackend, SpatialCapability, SpatialContextState, SpatialInteraction, SpatialLiveMode, SpatialPointer, SpatialPower, SpatialPowerPreference, SpatialPurpose, SpatialQuality, SpatialResolutionReason];\n` +
      `const packedSpatialTypes = null as unknown as PackedSpatialTypes;\n` +
      `const spatialValues = [SPATIAL_QUALITY_BUDGETS, SPATIAL_SCENE_MODULE_VERSION, SpatialExperience, isSpatialSceneModule(spatialContract), spatialBudget, spatialDowngrade, spatialPerformance, spatialEvent];\n` +
      'console.log(AreaChart, CountUp, FadeIn, ScaleIn, CopyIcon, Icon, BrandMark, CloudServiceMark, ChartFrame, ChartInsightSummary, resolveChartProjection, chartView, chartPhoneView, chartFrameProps, chartInsightSummaryProps, packedChartTypes, chartGrammar, chartInsight, chartSummary, packedChartSpecTypes, chartSpecValues, accessProps, accessPageStatus, accessCell, accessFile, accessValues, rendererComponents, barProps, heatProps, lineProps, pieProps, scatterProps, lineDatumKey, chartInteractionMeta, chartActiveDatum, chartInteraction, packedChartInteractionTypes, motionPolicy, motionRecipe, packedMotionTypes, motionValues, effectResolution, packedEffectTypes, effectValues, spatialProps, packedSpatialTypes, spatialValues);\n',
    );
    writeFileSync(resolve(consumerRoot, 'tsconfig.json'), JSON.stringify({
      compilerOptions: {
        jsx: 'react-jsx',
        lib: ['ES2022', 'DOM'],
        module: 'ESNext',
        moduleResolution: 'Bundler',
        noEmit: true,
        skipLibCheck: true,
        strict: true,
        target: 'ES2022',
      },
      include: ['src/fixture.tsx'],
    }, null, 2));
    spawnChecked('pnpm', ['exec', 'tsc', '--project', 'tsconfig.json'], { cwd: consumerRoot });

    const spatialSpecServerSource = resolve(consumerRoot, 'src/spatial-spec-server.ts');
    writeFileSync(
      spatialSpecServerSource,
      `import {\n` +
      `  SPATIAL_QUALITY_BUDGETS,\n` +
      `  SPATIAL_SCENE_MODULE_VERSION,\n` +
      `  downgradeSpatialMode,\n` +
      `  isSpatialSceneModule,\n` +
      `  resolveSpatialPolicy,\n` +
      `  resolveSpatialQualityBudget,\n` +
      `  type SpatialPolicyInput,\n` +
      `  type SpatialResolution,\n` +
      `  type SpatialSceneModuleContract,\n` +
      `} from ${JSON.stringify(`${packedManifest.name}/spatial/spec`)};\n` +
      `const input: SpatialPolicyInput = { enabled: true, hydrated: true, contractReady: true, visible: true, inView: true, reduce: false, phone: false, tablet: false, pointer: 'fine', power: 'normal', contextState: 'ready', capability: 'webgl2', lease: true, quality: 'auto' };\n` +
      `const resolution: SpatialResolution = resolveSpatialPolicy(input);\n` +
      `const scene = () => null;\n` +
      `const moduleContract: SpatialSceneModuleContract<typeof scene> = { version: SPATIAL_SCENE_MODULE_VERSION, backend: 'webgl2', Scene: scene };\n` +
      `void [SPATIAL_QUALITY_BUDGETS, downgradeSpatialMode(resolution.mode), isSpatialSceneModule(moduleContract), resolveSpatialQualityBudget(resolution.mode)];\n`,
    );
    writeFileSync(resolve(consumerRoot, 'tsconfig.spatial-spec-server.json'), JSON.stringify({
      compilerOptions: {
        lib: ['ES2022'],
        module: 'ESNext',
        moduleResolution: 'Bundler',
        noEmit: true,
        skipLibCheck: false,
        strict: true,
        target: 'ES2022',
        types: [],
      },
      include: ['src/spatial-spec-server.ts'],
    }, null, 2));
    spawnChecked(
      'pnpm',
      ['exec', 'tsc', '--project', 'tsconfig.spatial-spec-server.json'],
      { cwd: consumerRoot },
    );
    const packagedCli = resolve(installedPackage, 'consumer/ds-supplier-honesty.mjs');
    if (!existsSync(packagedCli)) throw new Error('packed supplier CLI is missing from the installed tarball');
    const cliResult = spawnChecked(
      'pnpm',
      ['exec', 'rottay-ds-supplier-honesty', '--app-root', consumerRoot],
      { cwd: consumerRoot },
    );
    const cliReport = JSON.parse(cliResult.stdout);
    const missingFixtureSuppliers = ['@phosphor-icons/react', '@thesvg/react', 'antd', 'd3', 'motion', 'lucide-react']
      .filter((supplier) => !cliReport.renderedSuppliers?.includes(supplier));
    if (missingFixtureSuppliers.length > 0) {
      throw new Error(`packed supplier CLI missed fixture suppliers: ${missingFixtureSuppliers.join(', ')}`);
    }

    // Create this only after the supplier CLI has scanned the positive app
    // fixture: the intentionally-invalid symbol must fail TypeScript, not be
    // misreported as a real consumer import by supplier honesty.
    const negativeEffectSource = resolve(consumerRoot, 'src/effects-internal-negative.ts');
    writeFileSync(
      negativeEffectSource,
      `// @ts-expect-error definition-level resolution is intentionally internal-only.\n` +
      `import { resolveEffectDefinition } from ${JSON.stringify(`${packedManifest.name}/effects`)};\n` +
      `void resolveEffectDefinition;\n`,
    );
    writeFileSync(resolve(consumerRoot, 'tsconfig.effects-negative.json'), JSON.stringify({
      compilerOptions: {
        lib: ['ES2022', 'DOM'],
        module: 'ESNext',
        moduleResolution: 'Bundler',
        noEmit: true,
        skipLibCheck: true,
        strict: true,
        target: 'ES2022',
      },
      include: ['src/effects-internal-negative.ts'],
    }, null, 2));
    spawnChecked(
      'pnpm',
      ['exec', 'tsc', '--project', 'tsconfig.effects-negative.json'],
      { cwd: consumerRoot },
    );

    const exportSpecifiers = Object.keys(packedManifest.exports)
      .filter((subpath) => !subpath.includes('*'))
      .map((subpath) => subpath === '.' ? packedManifest.name : `${packedManifest.name}${subpath.slice(1)}`);
    const resolver = resolve(consumerRoot, 'resolve-exports.mjs');
    writeFileSync(
      resolver,
      `${exportSpecifiers.map((specifier) => `console.log(import.meta.resolve(${JSON.stringify(specifier)}));`).join('\n')}\n`,
    );
    const resolution = spawnChecked(process.execPath, [resolver], { cwd: consumerRoot });
    const resolvedExports = resolution.stdout.trim().split('\n').filter(Boolean);
    if (resolvedExports.length !== exportSpecifiers.length) {
      throw new Error(`only ${resolvedExports.length}/${exportSpecifiers.length} packed exports resolved`);
    }

    const runtimeFixtures = runtimeExportFixtures(packedManifest);
    if (runtimeFixtures.import.length !== 22 || runtimeFixtures.require.length !== 21) {
      throw new Error(
        `packed runtime condition inventory drifted; expected 22 import + 21 require, found ` +
        `${runtimeFixtures.import.length} import + ${runtimeFixtures.require.length} require`,
      );
    }
    const installedContract = readJson(resolve(installedPackage, 'supplier-contract.json'));
    const contractShapeErrors = validateSupplierContractShape(installedContract);
    if (contractShapeErrors.length > 0) {
      throw new Error(`packed supplier contract is invalid:\n- ${contractShapeErrors.join('\n- ')}`);
    }

    const runtimeProbe = resolve(consumerRoot, 'runtime-import-exports-probe.mjs');
    writeFileSync(
      runtimeProbe,
      'const result = {};\n' +
      runtimeFixtures.import
        .map(({ specifier }) => `result[${JSON.stringify(specifier)}] = Object.keys(await import(${JSON.stringify(specifier)})).sort();`)
        .join('\n') +
      '\nconsole.log(JSON.stringify(result));\n',
    );
    const runtimeResult = spawnChecked(process.execPath, [runtimeProbe], { cwd: consumerRoot });
    const importedRuntimeExports = JSON.parse(runtimeResult.stdout.trim());
    if (Object.keys(importedRuntimeExports).length !== runtimeFixtures.import.length) {
      throw new Error(
        `only ${Object.keys(importedRuntimeExports).length}/${runtimeFixtures.import.length} packed import conditions executed`,
      );
    }

    const requireProbe = resolve(consumerRoot, 'runtime-require-exports-probe.cjs');
    writeFileSync(
      requireProbe,
      'try {\n' +
      'const result = {};\n' +
      runtimeFixtures.require
        .map(({ specifier }) => `result[${JSON.stringify(specifier)}] = Object.keys(require(${JSON.stringify(specifier)})).sort();`)
        .join('\n') +
      '\nconsole.log(JSON.stringify(result));\n' +
      '} catch (error) {\n' +
      "console.error(JSON.stringify({ name: error?.name, message: error?.message, code: error?.code, stack: error?.stack }));\n" +
      'process.exitCode = 1;\n' +
      '}\n',
    );
    const requireResult = spawnChecked(process.execPath, [requireProbe], { cwd: consumerRoot });
    const requiredRuntimeExports = JSON.parse(requireResult.stdout.trim());
    if (Object.keys(requiredRuntimeExports).length !== runtimeFixtures.require.length) {
      throw new Error(
        `only ${Object.keys(requiredRuntimeExports).length}/${runtimeFixtures.require.length} packed require conditions executed`,
      );
    }

    for (const [subpath, definition] of Object.entries(installedContract.entrypoints)) {
      const specifier = packageSpecifier(packedManifest, subpath);
      const expected = JSON.stringify([...(definition.exports ?? [])].sort());
      if (!Object.hasOwn(importedRuntimeExports, specifier)) {
        throw new Error(`supplier contract runtime entry ${subpath} was not imported from the packed artifact`);
      }
      const imported = JSON.stringify(importedRuntimeExports[specifier]);
      if (imported !== expected) {
        throw new Error(`supplier contract/runtime export drift for ${subpath}: expected ${expected}, found ${imported}`);
      }
      if (runtimeFixtures.require.some((fixture) => fixture.subpath === subpath)) {
        const required = JSON.stringify(requiredRuntimeExports[specifier]);
        if (required !== expected) {
          throw new Error(`supplier contract/CJS export drift for ${subpath}: expected ${expected}, found ${required}`);
        }
      }
    }

    const runtimeBundles = await bundleRuntimeExportFixtures(consumerRoot, runtimeFixtures);
    const bundle = await buildNonConsumingFixture(consumerRoot);
    return {
      tarball: basename(tarball),
      exportCount: exportSpecifiers.length,
      installedFromTarball: true,
      installedRuntimePackages: installedRuntimeFixtures.tarballs.size,
      stagedRuntimePackages: installedRuntimeFixtures.stagedPackages,
      supplierCli: cliReport.contract,
      typecheckedConsumer: true,
      typecheckedServerSafeSpatialSpec: true,
      executedImportConditions: runtimeFixtures.import.length,
      executedRequireConditions: runtimeFixtures.require.length,
      runtimeBundleEntries: runtimeBundles.entries,
      runtimeBundleBytes: runtimeBundles.bytes,
      nonConsumingBundleBytes: bundle.bytes,
    };
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
}

function formatErrors(title, errors) {
  if (errors.length === 0) return;
  throw new Error(`${title}\n- ${errors.join('\n- ')}`);
}

function resolveAppRoots({ requireApps = false } = {}) {
  const ecosystemRoot = resolve(repositoryRoot, '..');
  const roots = APP_REPOSITORIES
    .map((name) => resolve(ecosystemRoot, name))
    .filter((path) => existsSync(resolve(path, 'package.json')));
  if (requireApps && roots.length !== APP_REPOSITORIES.length) {
    const found = new Set(roots.map((path) => basename(path)));
    throw new Error(`missing app worktrees: ${APP_REPOSITORIES.filter((name) => !found.has(name)).join(', ')}`);
  }
  return roots;
}

export function auditApps({ requireApps = false } = {}) {
  const roots = resolveAppRoots({ requireApps });
  const report = {};
  const errors = [];
  for (const appRoot of roots) {
    let app;
    try {
      app = auditAppSupplierManifest(appRoot);
    } finally {
      // App inventories share parsed ASTs only within one repository. Keeping
      // their caches past this point retains every source tree for no benefit
      // and made `check --require-apps` grow monotonically across the fleet.
      clearRuntimeAnalysisState();
    }
    report[basename(appRoot)] = {
      directImports: app.suppliers,
      renderedThroughDesignSystem: app.renderedSuppliers,
    };
    errors.push(...app.errors);
    if (basename(appRoot) === 'app-platform') {
      errors.push(...auditPlatformLocalBoundary(appRoot));
    }
  }
  return { errors, report, checked: roots.length };
}

async function runCli() {
  const command = process.argv[2] ?? 'check';
  const requireApps = process.argv.includes('--require-apps');
  if (!['check', 'static', 'apps', 'pack', 'contract'].includes(command)) {
    throw new Error(`unknown command ${command}; expected check, static, apps, pack, or contract`);
  }

  if (command === 'contract') {
    const contract = deriveSupplierContract();
    writeFileSync(supplierContractPath, `${JSON.stringify(contract, null, 2)}\n`, 'utf8');
    console.log(`dependency-honesty contract: synced ${Object.keys(contract.entrypoints).length} entrypoints`);
    return;
  }

  const output = {};
  if (command === 'check' || command === 'static') {
    let core;
    try {
      core = auditCoreDependencyGraph();
    } finally {
      // Core uses shared TypeScript Programs for its strict capability/type
      // analysis. The reports below contain only paths and counts, so those
      // Programs must not remain live while app inventories are scanned.
      clearRuntimeAnalysisState();
    }
    formatErrors('core dependency graph is dishonest', core.errors);
    const identities = auditRuntimeIdentities();
    formatErrors('runtime identity gate failed', identities.errors);
    output.core = { visitedFiles: core.visitedFiles, suppliers: core.report };
    output.identities = identities.identities;
  }

  if (command === 'check' || command === 'apps') {
    const apps = auditApps({ requireApps });
    formatErrors('app supplier/local-producer boundary failed', apps.errors);
    output.apps = { checked: apps.checked, suppliers: apps.report };
  }

  if (command === 'check' || command === 'pack') {
    output.pack = await auditPackedArtifact();
  }

  console.log(`dependency-honesty ${command}: OK`);
  console.log(JSON.stringify(output, null, 2));
}

const invokedAsScript = process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (invokedAsScript) {
  runCli().catch((error) => {
    console.error(`dependency-honesty: FAIL\n${error.stack ?? error.message}`);
    process.exitCode = 1;
  });
}
