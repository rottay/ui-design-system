import { readFile, readdir, realpath } from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';

export const CRA11_CENSUS_SCHEMA_VERSION = 2;

const TYPESCRIPT_SOURCE = /\.(?:ts|tsx)$/;
const FACTORY_NAME = /^create[A-Z][A-Za-z0-9]*Config$/;
const ADAPTIVE_NAME = /(?:adaptive|mobile|phone|tablet)/i;
const ADAPTIVE_OWNER = /(?:Adaptive|Mobile|Phone|Tablet)/;
const COMPLETE_ADAPTIVE_OWNERS = new Set(['AdaptiveConfig', 'SurfacePosture']);
const TEST_SOURCE = /(?:^|\/)(?:__tests__|__fixtures__|fixtures|test|tests|stories)(?:\/|$)|\.(?:test|spec|stories)\.[^.]+$/i;
const BUILDER_DEFAULT_SOURCE = /(?:^|\/)(?:builders?|defaults?)(?:\/|$)|\.(?:builder|defaults?)\.[^.]+$/i;
const GENERATED_SOURCE = /(?:^|\/)(?:dist|build|\.next|coverage|test-artifacts|generated)(?:\/|$)/i;
const SKIPPED_DIRECTORY = new Set([
  '.git',
  '.next',
  'build',
  'coverage',
  'dist',
  'node_modules',
  'storybook-static',
  'test-artifacts',
]);

function toPosix(value) {
  return value.split(path.sep).join('/');
}

function normalizeAbsolute(value) {
  return path.normalize(path.resolve(value));
}

function hasExportModifier(node) {
  return node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ?? false;
}

function propertyName(node) {
  if (!node) return undefined;
  if (ts.isIdentifier(node) || ts.isPrivateIdentifier(node) || ts.isNumericLiteral(node)) return node.text;
  if (ts.isStringLiteralLike(node)) return node.text;
  return undefined;
}

/**
 * Exact source span for a property/module string. Never use `pos` or include
 * quotes: CRA-11 mutation edits rely on these byte-stable offsets.
 */
export function stringLiteralContentSpan(sourceFile, literal) {
  if (!ts.isStringLiteralLike(literal)) {
    throw new TypeError('stringLiteralContentSpan requires a StringLiteralLike node');
  }
  return {
    start: literal.getStart(sourceFile) + 1,
    end: literal.getEnd() - 1,
  };
}

function nodeContentSpan(sourceFile, node) {
  if (ts.isStringLiteralLike(node)) return stringLiteralContentSpan(sourceFile, node);
  return { start: node.getStart(sourceFile), end: node.getEnd() };
}

function sourceLocation(sourceFile, node) {
  const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  return { line: position.line + 1, column: position.character + 1 };
}

function stableSite(workspaceRoot, sourceFile, node, extra = {}) {
  return {
    source: toPosix(path.relative(workspaceRoot, sourceFile.fileName)),
    ...sourceLocation(sourceFile, node),
    ...extra,
  };
}

function stableSortSites(sites) {
  return [...new Map(sites.map((site) => [
    `${site.source}\0${site.line}\0${site.column}\0${site.role ?? ''}`,
    site,
  ])).values()].sort((left, right) =>
    left.source.localeCompare(right.source)
    || left.line - right.line
    || left.column - right.column
    || String(left.role ?? '').localeCompare(String(right.role ?? ''))
  );
}

function sourceClass(relative) {
  if (GENERATED_SOURCE.test(relative)) return 'generated';
  if (TEST_SOURCE.test(relative)) return 'test';
  if (BUILDER_DEFAULT_SOURCE.test(relative)) return 'builder-default';
  return 'productive';
}

async function listTypeScriptFiles(root, { sourceDirectory = 'src' } = {}) {
  const start = path.join(root, sourceDirectory);
  const canonicalRoot = await realpath(root);
  const files = [];

  async function visit(directory) {
    const canonicalDirectory = await realpath(directory);
    const relativeCanonical = path.relative(canonicalRoot, canonicalDirectory);
    if (relativeCanonical.startsWith('..') || path.isAbsolute(relativeCanonical)) {
      throw new Error(`CRA-11 source traversal escaped repository root: ${directory}`);
    }

    const entries = await readdir(directory, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      if (entry.name.startsWith('.') || SKIPPED_DIRECTORY.has(entry.name)) continue;
      const absolute = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) {
        const target = await realpath(absolute);
        const relativeTarget = path.relative(canonicalRoot, target);
        if (relativeTarget.startsWith('..') || path.isAbsolute(relativeTarget)) {
          throw new Error(`CRA-11 source symlink escaped repository root: ${absolute}`);
        }
        continue;
      }
      if (entry.isDirectory()) {
        await visit(absolute);
      } else if (TYPESCRIPT_SOURCE.test(entry.name) && !entry.name.endsWith('.d.ts')) {
        files.push(normalizeAbsolute(absolute));
      }
    }
  }

  await visit(start);
  return files.sort((left, right) => left.localeCompare(right));
}

function compilerOptions(repoRoot) {
  const configPath = path.join(repoRoot, 'tsconfig.json');
  const loaded = ts.readConfigFile(configPath, ts.sys.readFile);
  if (loaded.error) {
    throw new Error(ts.flattenDiagnosticMessageText(loaded.error.messageText, '\n'));
  }
  const parsed = ts.parseJsonConfigFileContent(loaded.config, ts.sys, repoRoot, {
    incremental: false,
    noEmit: true,
    tsBuildInfoFile: undefined,
  }, configPath);
  return parsed.options;
}

async function createRepoProgram(repoRoot, {
  sourceDirectory = 'src',
  candidateTerms,
  alwaysIncludeDirectory,
} = {}) {
  let files = await listTypeScriptFiles(repoRoot, { sourceDirectory });
  if (candidateTerms) {
    const alwaysInclude = alwaysIncludeDirectory
      ? normalizeAbsolute(path.join(repoRoot, alwaysIncludeDirectory))
      : undefined;
    const selected = [];
    for (const file of files) {
      if (alwaysInclude && (file === alwaysInclude || file.startsWith(`${alwaysInclude}${path.sep}`))) {
        selected.push(file);
        continue;
      }
      const sourceText = await readFile(file, 'utf8');
      if (candidateTerms.some((term) => sourceText.includes(term))) selected.push(file);
    }
    files = selected;
  }
  const options = {
    ...compilerOptions(repoRoot),
    allowJs: false,
    lib: ['lib.es2020.d.ts'],
    noLib: false,
    skipLibCheck: true,
    types: [],
  };
  const sourceFiles = new Map();
  const sourceTexts = new Map();
  const directories = new Set();
  for (const file of files) {
    const normalized = normalizeAbsolute(file);
    const text = await readFile(normalized, 'utf8');
    sourceTexts.set(normalized, text);
    sourceFiles.set(normalized, ts.createSourceFile(
      normalized,
      text,
      options.target ?? ts.ScriptTarget.Latest,
      true,
      normalized.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    ));
    let directory = path.dirname(normalized);
    const root = normalizeAbsolute(repoRoot);
    while (directory.startsWith(root)) {
      directories.add(directory);
      if (directory === root) break;
      directory = path.dirname(directory);
    }
  }
  const canonical = (value) => ts.sys.useCaseSensitiveFileNames ? value : value.toLowerCase();
  const typescriptLibDirectory = normalizeAbsolute(path.dirname(ts.getDefaultLibFilePath(options)));
  const isTypeScriptLib = (file) => {
    const normalized = normalizeAbsolute(file);
    return path.dirname(normalized) === typescriptLibDirectory
      && /^lib\..+\.d\.ts$/.test(path.basename(normalized));
  };
  const host = {
    directoryExists: (directory) => directories.has(normalizeAbsolute(directory))
      || normalizeAbsolute(directory) === typescriptLibDirectory,
    fileExists: (file) => sourceFiles.has(normalizeAbsolute(file))
      || (isTypeScriptLib(file) && ts.sys.fileExists(file)),
    getCanonicalFileName: canonical,
    getCurrentDirectory: () => normalizeAbsolute(repoRoot),
    getDefaultLibFileName: () => path.join(typescriptLibDirectory, 'lib.es2020.d.ts'),
    getDirectories: (directory) => {
      const normalized = normalizeAbsolute(directory);
      return [...directories]
        .filter((candidate) => path.dirname(candidate) === normalized)
        .map((candidate) => path.basename(candidate))
        .sort((left, right) => left.localeCompare(right));
    },
    getNewLine: () => '\n',
    getSourceFile: (file, languageVersion) => {
      const normalized = normalizeAbsolute(file);
      const local = sourceFiles.get(normalized);
      if (local) return local;
      if (!isTypeScriptLib(normalized)) return undefined;
      const sourceText = ts.sys.readFile(normalized);
      return sourceText === undefined
        ? undefined
        : ts.createSourceFile(normalized, sourceText, languageVersion, true, ts.ScriptKind.TS);
    },
    readFile: (file) => sourceTexts.get(normalizeAbsolute(file))
      ?? (isTypeScriptLib(file) ? ts.sys.readFile(file) : undefined),
    realpath: normalizeAbsolute,
    useCaseSensitiveFileNames: () => ts.sys.useCaseSensitiveFileNames,
    writeFile: () => {},
  };
  const program = ts.createProgram({ rootNames: files, options, host });
  return { files, program, checker: program.getTypeChecker() };
}

function parseErrors(program, workspaceRoot, repository) {
  const errors = [];
  for (const sourceFile of program.getSourceFiles()) {
    if (sourceFile.isDeclarationFile || !normalizeAbsolute(sourceFile.fileName).startsWith(normalizeAbsolute(workspaceRoot))) {
      continue;
    }
    for (const diagnostic of sourceFile.parseDiagnostics) {
      const start = diagnostic.start ?? 0;
      const position = sourceFile.getLineAndCharacterOfPosition(start);
      errors.push({
        code: 'typescript-parse-error',
        repository,
        source: toPosix(path.relative(workspaceRoot, sourceFile.fileName)),
        line: position.line + 1,
        column: position.character + 1,
        detail: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
      });
    }
  }
  return errors;
}

function collectAdaptiveFields(program, checker, designSystemRoot, workspaceRoot) {
  const contractsRoot = normalizeAbsolute(path.join(
    designSystemRoot,
    'packages/core/src/ui/surfaces/foundation/contracts',
  ));
  const fields = [];

  function addMember(sourceFile, owner, member, fieldPath) {
    if (!member.name) return;
    const span = nodeContentSpan(sourceFile, member.name);
    const relative = toPosix(path.relative(workspaceRoot, sourceFile.fileName));
    const location = sourceLocation(sourceFile, member.name);
    const symbol = checker.getSymbolAtLocation(member.name);
    fields.push({
      id: `${owner}.${fieldPath.join('.')}`,
      owner,
      field: fieldPath.at(-1),
      path: fieldPath.join('.'),
      declaration: {
        source: relative,
        ...location,
        offsetStart: span.start,
        offsetEnd: span.end,
      },
      declarationNode: member,
      declarationSymbol: symbol,
      productiveConsumers: [],
      productiveProducers: [],
      builderDefaults: [],
      testOnly: [],
    });
  }

  function visitMembers(sourceFile, owner, members, prefix = [], inheritedAdaptive = false) {
    for (const member of members) {
      if (!ts.isPropertySignature(member) || !member.name) continue;
      const name = propertyName(member.name);
      if (!name) continue;
      const fieldPath = [...prefix, name];
      const selected = inheritedAdaptive
        || COMPLETE_ADAPTIVE_OWNERS.has(owner)
        || ADAPTIVE_OWNER.test(owner)
        || ADAPTIVE_NAME.test(name);
      if (selected) addMember(sourceFile, owner, member, fieldPath);
      if (member.type && ts.isTypeLiteralNode(member.type)) {
        visitMembers(sourceFile, owner, member.type.members, fieldPath, selected);
      }
    }
  }

  for (const sourceFile of program.getSourceFiles()) {
    const absolute = normalizeAbsolute(sourceFile.fileName);
    if (sourceFile.isDeclarationFile || (!absolute.startsWith(`${contractsRoot}${path.sep}`) && absolute !== contractsRoot)) {
      continue;
    }
    for (const statement of sourceFile.statements) {
      if (!hasExportModifier(statement)) continue;
      if (ts.isInterfaceDeclaration(statement)) {
        visitMembers(sourceFile, statement.name.text, statement.members);
      } else if (ts.isTypeAliasDeclaration(statement)) {
        function visitPublicType(node) {
          if (ts.isTypeLiteralNode(node)) visitMembers(sourceFile, statement.name.text, node.members);
          else ts.forEachChild(node, visitPublicType);
        }
        visitPublicType(statement.type);
      }
    }
  }

  fields.sort((left, right) =>
    left.id.localeCompare(right.id)
    || left.declaration.source.localeCompare(right.declaration.source)
    || left.declaration.line - right.declaration.line
  );
  return fields;
}

function canonicalPropertySymbol(checker, symbol) {
  if (!symbol) return undefined;
  if (symbol.flags & ts.SymbolFlags.Alias) {
    try {
      return checker.getAliasedSymbol(symbol);
    } catch {
      return symbol;
    }
  }
  return symbol;
}

function isTypePosition(node) {
  let current = node;
  while (current.parent) {
    current = current.parent;
    if (ts.isTypeNode(current) || ts.isInterfaceDeclaration(current) || ts.isTypeAliasDeclaration(current)) return true;
    if (ts.isExpression(current) || ts.isStatement(current) || ts.isSourceFile(current)) return false;
  }
  return false;
}

function isSimpleWrite(node) {
  const parent = node.parent;
  return ts.isBinaryExpression(parent)
    && parent.left === node
    && parent.operatorToken.kind === ts.SyntaxKind.EqualsToken;
}

function symbolForObjectBinding(checker, node, name) {
  const pattern = node.parent;
  const declaration = pattern.parent;
  let objectType;
  if (ts.isVariableDeclaration(declaration) && declaration.initializer) {
    objectType = checker.getTypeAtLocation(declaration.initializer);
  } else if (ts.isParameter(declaration) && declaration.type) {
    objectType = checker.getTypeFromTypeNode(declaration.type);
  }
  return objectType?.getProperty(name);
}

function symbolForObjectProperty(checker, node) {
  const direct = checker.getSymbolAtLocation(node.name);
  const name = propertyName(node.name);
  const contextual = name && ts.isObjectLiteralExpression(node.parent)
    ? checker.getContextualType(node.parent)?.getProperty(name)
    : undefined;
  return contextual ?? direct;
}

function collectFieldOccurrences(program, checker, fields, workspaceRoot, analysisErrors) {
  const symbolToFields = new Map();
  const declarationToFields = new Map();
  function declarationKey(declaration) {
    const sourceFile = declaration.getSourceFile();
    return `${normalizeAbsolute(sourceFile.fileName)}\0${declaration.getStart(sourceFile)}`;
  }
  for (const field of fields) {
    const symbol = canonicalPropertySymbol(checker, field.declarationSymbol);
    if (symbol) {
      const existing = symbolToFields.get(symbol) ?? [];
      existing.push(field);
      symbolToFields.set(symbol, existing);
    }
    const key = declarationKey(field.declarationNode);
    const declarations = declarationToFields.get(key) ?? [];
    declarations.push(field);
    declarationToFields.set(key, declarations);
  }

  function fieldsForSymbol(symbol) {
    const canonical = canonicalPropertySymbol(checker, symbol);
    const matches = new Set(symbolToFields.get(canonical) ?? []);
    for (const declaration of canonical?.declarations ?? []) {
      for (const field of declarationToFields.get(declarationKey(declaration)) ?? []) matches.add(field);
    }
    return [...matches];
  }

  function adaptiveFieldsForType(type) {
    const matches = new Set();
    const variants = type.isUnionOrIntersection?.() ? type.types : [type];
    for (const variant of variants) {
      for (const symbol of checker.getPropertiesOfType(variant)) {
        for (const field of fieldsForSymbol(symbol)) matches.add(field.id);
      }
    }
    return [...matches].sort((left, right) => left.localeCompare(right));
  }

  function record(sourceFile, node, matches, role) {
    if (matches.length === 0 || isTypePosition(node)) return;
    const relative = toPosix(path.relative(workspaceRoot, sourceFile.fileName));
    const classification = sourceClass(relative);
    if (classification === 'generated') return;
    const site = stableSite(workspaceRoot, sourceFile, node, { role });
    for (const field of matches) {
      if (classification === 'test') field.testOnly.push(site);
      else if (classification === 'builder-default') field.builderDefaults.push(site);
      else if (role === 'read' || role === 'transport-read') field.productiveConsumers.push(site);
      else field.productiveProducers.push(site);
    }
  }

  for (const sourceFile of program.getSourceFiles()) {
    if (sourceFile.isDeclarationFile || !normalizeAbsolute(sourceFile.fileName).startsWith(normalizeAbsolute(workspaceRoot))) {
      continue;
    }
    function visit(node) {
      if (ts.isPropertyAccessExpression(node)) {
        record(
          sourceFile,
          node.name,
          fieldsForSymbol(checker.getSymbolAtLocation(node.name)),
          isSimpleWrite(node) ? 'write' : 'read',
        );
      } else if (ts.isElementAccessExpression(node) && node.argumentExpression && ts.isStringLiteralLike(node.argumentExpression)) {
        const name = node.argumentExpression.text;
        const symbol = checker.getTypeAtLocation(node.expression).getProperty(name);
        record(sourceFile, node.argumentExpression, fieldsForSymbol(symbol), isSimpleWrite(node) ? 'write' : 'read');
      } else if (ts.isElementAccessExpression(node)) {
        const candidates = adaptiveFieldsForType(checker.getTypeAtLocation(node.expression));
        if (candidates.length > 0) {
          analysisErrors.push({
            code: 'opaque-adaptive-field-access',
            repository: 'ui-design-system',
            ...stableSite(workspaceRoot, sourceFile, node),
            detail: `computed adaptive access could reference: ${candidates.join(', ')}`,
          });
        }
      } else if (ts.isBindingElement(node) && ts.isObjectBindingPattern(node.parent)) {
        const nameNode = node.propertyName ?? node.name;
        const name = propertyName(nameNode);
        if (name) record(sourceFile, nameNode, fieldsForSymbol(symbolForObjectBinding(checker, node, name)), 'read');
      } else if (ts.isPropertyAssignment(node) || ts.isShorthandPropertyAssignment(node)) {
        record(sourceFile, node.name, fieldsForSymbol(symbolForObjectProperty(checker, node)), 'write');
      } else if (ts.isJsxAttribute(node)) {
        record(sourceFile, node.name, fieldsForSymbol(checker.getSymbolAtLocation(node.name)), 'write');
      }
      ts.forEachChild(node, visit);
    }
    visit(sourceFile);
  }

  const functionInfos = new Map();
  const functionLikeWithBody = (node) => (
    ts.isFunctionDeclaration(node)
    || ts.isFunctionExpression(node)
    || ts.isArrowFunction(node)
    || ts.isMethodDeclaration(node)
    || ts.isGetAccessorDeclaration(node)
    || ts.isSetAccessorDeclaration(node)
  ) && Boolean(node.body);
  const encodePath = (segments) => segments.join('\u0001');
  const decodePath = (encoded) => encoded.split('\u0001');
  const addSummaryPath = (info, parameterIndex, segments) => {
    if (segments.length === 0) return false;
    const encoded = encodePath(segments);
    const summary = info.summary[parameterIndex];
    if (summary.has(encoded)) return false;
    summary.add(encoded);
    return true;
  };

  for (const sourceFile of program.getSourceFiles()) {
    const relative = toPosix(path.relative(workspaceRoot, sourceFile.fileName));
    if (sourceFile.isDeclarationFile || sourceClass(relative) !== 'productive') continue;
    function visitFunctions(node) {
      if (functionLikeWithBody(node)) {
        functionInfos.set(node, {
          node,
          sourceFile,
          aliases: new Map(),
          summary: node.parameters.map(() => new Set()),
          callEdges: [],
        });
      }
      ts.forEachChild(node, visitFunctions);
    }
    visitFunctions(sourceFile);
  }

  function aliasSymbol(identifier) {
    return ts.isIdentifier(identifier) ? checker.getSymbolAtLocation(identifier) : undefined;
  }

  function setAlias(info, identifier, root) {
    const symbol = aliasSymbol(identifier);
    if (!symbol) return false;
    const existing = info.aliases.get(symbol);
    if (existing && existing.parameterIndex === root.parameterIndex && encodePath(existing.path) === encodePath(root.path)) {
      return false;
    }
    info.aliases.set(symbol, root);
    return true;
  }

  function expressionRoot(info, rawExpression) {
    const expression = unwrapExpression(rawExpression);
    if (ts.isIdentifier(expression)) {
      return info.aliases.get(checker.getSymbolAtLocation(expression));
    }
    if (ts.isPropertyAccessExpression(expression)) {
      const root = expressionRoot(info, expression.expression);
      return root ? { parameterIndex: root.parameterIndex, path: [...root.path, expression.name.text] } : undefined;
    }
    if (
      ts.isElementAccessExpression(expression)
      && expression.argumentExpression
      && ts.isStringLiteralLike(expression.argumentExpression)
    ) {
      const root = expressionRoot(info, expression.expression);
      return root
        ? { parameterIndex: root.parameterIndex, path: [...root.path, expression.argumentExpression.text] }
        : undefined;
    }
    if (
      ts.isBinaryExpression(expression)
      && (
        expression.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken
        || expression.operatorToken.kind === ts.SyntaxKind.BarBarToken
      )
    ) {
      return expressionRoot(info, expression.left) ?? expressionRoot(info, expression.right);
    }
    if (ts.isConditionalExpression(expression)) {
      const whenTrue = expressionRoot(info, expression.whenTrue);
      const whenFalse = expressionRoot(info, expression.whenFalse);
      if (
        whenTrue
        && whenFalse
        && whenTrue.parameterIndex === whenFalse.parameterIndex
        && encodePath(whenTrue.path) === encodePath(whenFalse.path)
      ) return whenTrue;
      return whenTrue ?? whenFalse;
    }
    return undefined;
  }

  function bindPattern(info, pattern, root, { consumes }) {
    let changed = false;
    if (ts.isIdentifier(pattern)) return setAlias(info, pattern, root);
    if (!ts.isObjectBindingPattern(pattern)) return false;
    for (const element of pattern.elements) {
      if (element.dotDotDotToken) continue;
      const name = propertyName(element.propertyName ?? element.name);
      if (!name) continue;
      const nested = { parameterIndex: root.parameterIndex, path: [...root.path, name] };
      if (consumes) changed = addSummaryPath(info, root.parameterIndex, nested.path) || changed;
      changed = bindPattern(info, element.name, nested, { consumes }) || changed;
    }
    return changed;
  }

  function implementationForCall(call) {
    let signature;
    try {
      signature = checker.getResolvedSignature(call);
    } catch {
      return undefined;
    }
    const declaration = signature?.declaration;
    if (declaration && functionInfos.has(declaration)) return declaration;
    const callee = unwrapExpression(call.expression);
    const symbolNode = ts.isPropertyAccessExpression(callee) ? callee.name : callee;
    const symbol = canonicalPropertySymbol(checker, checker.getSymbolAtLocation(symbolNode));
    for (const candidate of [symbol?.valueDeclaration, ...(symbol?.declarations ?? [])]) {
      if (candidate && functionInfos.has(candidate)) return candidate;
      if (
        candidate
        && ts.isVariableDeclaration(candidate)
        && candidate.initializer
        && functionInfos.has(candidate.initializer)
      ) return candidate.initializer;
    }
    return undefined;
  }

  for (const info of functionInfos.values()) {
    info.node.parameters.forEach((parameter, parameterIndex) => {
      bindPattern(info, parameter.name, { parameterIndex, path: [] }, {
        consumes: ts.isObjectBindingPattern(parameter.name),
      });
    });

    const declarations = [];
    function collectDeclarations(node) {
      if (ts.isVariableDeclaration(node) && node.initializer) declarations.push(node);
      ts.forEachChild(node, collectDeclarations);
    }
    collectDeclarations(info.node.body);
    let aliasesChanged = true;
    while (aliasesChanged) {
      aliasesChanged = false;
      for (const declaration of declarations) {
        const root = expressionRoot(info, declaration.initializer);
        if (!root) continue;
        aliasesChanged = bindPattern(info, declaration.name, root, {
          consumes: ts.isObjectBindingPattern(declaration.name),
        }) || aliasesChanged;
      }
    }

    function collectReadsAndEdges(node) {
      if (
        (ts.isPropertyAccessExpression(node)
          || (ts.isElementAccessExpression(node)
            && node.argumentExpression
            && ts.isStringLiteralLike(node.argumentExpression)))
        && !isSimpleWrite(node)
      ) {
        const root = expressionRoot(info, node);
        if (root) addSummaryPath(info, root.parameterIndex, root.path);
      }
      if (ts.isCallExpression(node)) {
        const callee = implementationForCall(node);
        if (callee) {
          node.arguments.forEach((argument, parameterIndex) => {
            const root = expressionRoot(info, argument);
            if (root) info.callEdges.push({
              callerParameterIndex: root.parameterIndex,
              prefix: root.path,
              callee,
              calleeParameterIndex: parameterIndex,
            });
          });
        }
      }
      ts.forEachChild(node, collectReadsAndEdges);
    }
    collectReadsAndEdges(info.node.body);
  }

  let summariesChanged = true;
  while (summariesChanged) {
    summariesChanged = false;
    for (const info of functionInfos.values()) {
      for (const edge of info.callEdges) {
        const calleeInfo = functionInfos.get(edge.callee);
        const calleeSummary = calleeInfo?.summary[edge.calleeParameterIndex];
        if (!calleeSummary) continue;
        for (const encoded of calleeSummary) {
          summariesChanged = addSummaryPath(
            info,
            edge.callerParameterIndex,
            [...edge.prefix, ...decodePath(encoded)],
          ) || summariesChanged;
        }
      }
    }
  }

  function typeVariants(type) {
    return type?.isUnionOrIntersection?.() ? type.types.flatMap(typeVariants) : type ? [type] : [];
  }

  function fieldsForTypePath(type, segments, location) {
    const matches = new Set();
    let currentTypes = typeVariants(type);
    for (const segment of segments) {
      const nextTypes = [];
      const symbols = new Set();
      for (const currentType of currentTypes) {
        const symbol = currentType.getProperty(segment);
        if (symbol) symbols.add(symbol);
      }
      for (const symbol of symbols) {
        for (const field of fieldsForSymbol(symbol)) matches.add(field);
        nextTypes.push(...typeVariants(checker.getTypeOfSymbolAtLocation(
          symbol,
          symbol.valueDeclaration ?? symbol.declarations?.[0] ?? location,
        )));
      }
      currentTypes = nextTypes;
      if (currentTypes.length === 0) break;
    }
    return [...matches];
  }

  for (const sourceFile of program.getSourceFiles()) {
    const relative = toPosix(path.relative(workspaceRoot, sourceFile.fileName));
    if (sourceFile.isDeclarationFile || sourceClass(relative) !== 'productive') continue;
    function visitTransportCalls(node) {
      if (ts.isCallExpression(node)) {
        const callee = implementationForCall(node);
        const calleeInfo = callee ? functionInfos.get(callee) : undefined;
        if (calleeInfo) {
          node.arguments.forEach((argument, parameterIndex) => {
            const summary = calleeInfo.summary[parameterIndex];
            if (!summary || summary.size === 0) return;
            const argumentExpression = unwrapExpression(argument);
            const argumentType = checker.getTypeAtLocation(argumentExpression);
            const matches = new Set();
            for (const encoded of summary) {
              for (const field of fieldsForTypePath(argumentType, decodePath(encoded), argumentExpression)) {
                matches.add(field);
              }
            }
            record(sourceFile, argumentExpression, [...matches], 'transport-read');
          });
        }
      }
      ts.forEachChild(node, visitTransportCalls);
    }
    visitTransportCalls(sourceFile);
  }

  return fields.map((field) => ({
    id: field.id,
    owner: field.owner,
    field: field.field,
    path: field.path,
    declaration: field.declaration,
    productiveConsumers: stableSortSites(field.productiveConsumers),
    productiveProducers: stableSortSites(field.productiveProducers),
    builderDefaults: stableSortSites(field.builderDefaults),
    testOnly: stableSortSites(field.testOnly),
    status: field.productiveConsumers.length > 0 ? 'productive-consumer' : 'type-only',
  }));
}

function localDeclarations(sourceFile) {
  const declarations = new Map();
  for (const statement of sourceFile.statements) {
    if (ts.isFunctionDeclaration(statement) && statement.name) {
      declarations.set(statement.name.text, statement);
    } else if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) declarations.set(declaration.name.text, declaration);
      }
    }
  }
  return declarations;
}

function unwrapExpression(expression) {
  let current = expression;
  while (
    ts.isParenthesizedExpression(current)
    || ts.isAsExpression(current)
    || ts.isTypeAssertionExpression(current)
    || ts.isSatisfiesExpression(current)
    || ts.isNonNullExpression(current)
  ) current = current.expression;
  return current;
}

function finalizeFactories(definitions, calls, edges) {
  const live = new Set([...calls.entries()].filter(([, sites]) => sites.length > 0).map(([id]) => id));
  let changed = true;
  while (changed) {
    changed = false;
    for (const key of edges.keys()) {
      const [caller, target] = key.split('\0');
      if (live.has(caller) && !live.has(target)) {
        live.add(target);
        changed = true;
      }
    }
  }

  return definitions.map((definition) => {
    const factoryCallers = [];
    for (const [key, sites] of edges) {
      const [caller, target] = key.split('\0');
      if (target !== definition.id) continue;
      for (const site of sites) factoryCallers.push({ ...site, factory: caller });
    }
    return {
      id: definition.id,
      repository: definition.repository,
      name: definition.name,
      localName: definition.localName,
      declaration: {
        source: definition.source,
        line: definition.line,
        column: definition.column,
      },
      productiveCallers: stableSortSites(calls.get(definition.id) ?? []),
      factoryCallers: stableSortSites(factoryCallers),
      status: live.has(definition.id) ? 'live' : 'dead',
    };
  }).sort((left, right) => left.id.localeCompare(right.id));
}

async function createSyntaxRepository(repository, repoRoot, workspaceRoot) {
  const files = await listTypeScriptFiles(repoRoot);
  const fileSet = new Set(files.map(normalizeAbsolute));
  const candidateText = new Map();
  const pending = [];
  const namedFactorySource = /create[A-Z][A-Za-z0-9]*Config/;
  const namespaceImportSource = /import\s+\*\s+as\s+[A-Za-z_$][\w$]*/;
  const computedCallSource = /\[[^\]'"`]+\]\s*\(/;
  for (const absolute of files) {
    const sourceText = await readFile(absolute, 'utf8');
    if (
      namedFactorySource.test(sourceText)
      || (namespaceImportSource.test(sourceText) && computedCallSource.test(sourceText))
    ) {
      candidateText.set(normalizeAbsolute(absolute), sourceText);
      pending.push(normalizeAbsolute(absolute));
    }
  }

  function targetFromFiles(sourceAbsolute, specifier) {
    let base;
    if (specifier.startsWith('.')) {
      base = path.resolve(path.dirname(sourceAbsolute), specifier);
    } else if (specifier.startsWith('@/')) {
      base = path.join(repoRoot, 'src', specifier.slice(2));
    } else if (specifier.startsWith('@ui/')) {
      base = path.join(repoRoot, 'src/ui', specifier.slice(4));
    } else if (specifier.startsWith('@types/')) {
      base = path.join(repoRoot, 'src/foundation/contracts', specifier.slice(7));
    } else {
      return undefined;
    }
    return [
      base,
      `${base}.ts`,
      `${base}.tsx`,
      path.join(base, 'index.ts'),
      path.join(base, 'index.tsx'),
    ].map(normalizeAbsolute).find((candidate) => fileSet.has(candidate));
  }

  const records = new Map();
  const analysisErrors = [];
  while (pending.length > 0) {
    const absolute = pending.shift();
    if (records.has(absolute)) continue;
    const sourceText = candidateText.get(absolute) ?? await readFile(absolute, 'utf8');
    const sourceFile = ts.createSourceFile(
      absolute,
      sourceText,
      ts.ScriptTarget.Latest,
      true,
      absolute.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );
    for (const diagnostic of sourceFile.parseDiagnostics) {
      const start = diagnostic.start ?? 0;
      const position = sourceFile.getLineAndCharacterOfPosition(start);
      analysisErrors.push({
        code: 'typescript-parse-error',
        repository,
        source: toPosix(path.relative(workspaceRoot, absolute)),
        line: position.line + 1,
        column: position.character + 1,
        detail: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
      });
    }
    records.set(normalizeAbsolute(absolute), {
      absolute: normalizeAbsolute(absolute),
      sourceFile,
      localFactories: new Map(),
      imports: new Map(),
      namespaceImports: new Map(),
      aliases: new Map(),
      destructuredAliases: new Map(),
      exports: new Map(),
      starExports: [],
      containerFactories: new Map(),
    });

    for (const statement of sourceFile.statements) {
      if (
        (!ts.isImportDeclaration(statement) && !ts.isExportDeclaration(statement))
        || !statement.moduleSpecifier
        || !ts.isStringLiteralLike(statement.moduleSpecifier)
      ) continue;
      let relevant = ts.isExportDeclaration(statement) && !statement.exportClause;
      if (ts.isExportDeclaration(statement) && statement.exportClause && ts.isNamedExports(statement.exportClause)) {
        relevant = statement.exportClause.elements.some((element) =>
          FACTORY_NAME.test(element.name.text) || FACTORY_NAME.test(element.propertyName?.text ?? '')
        );
      }
      if (ts.isImportDeclaration(statement) && statement.importClause?.namedBindings) {
        const bindings = statement.importClause.namedBindings;
        relevant = ts.isNamespaceImport(bindings)
          || bindings.elements.some((element) => FACTORY_NAME.test(element.propertyName?.text ?? element.name.text));
      }
      if (!relevant) continue;
      const target = targetFromFiles(absolute, statement.moduleSpecifier.text);
      if (target && !records.has(target)) pending.push(target);
    }
  }
  return { repository, repoRoot, workspaceRoot, records, analysisErrors };
}

function syntaxModuleTarget(syntaxRepo, sourceRecord, specifier) {
  let base;
  if (specifier.startsWith('.')) {
    base = path.resolve(path.dirname(sourceRecord.absolute), specifier);
  } else if (specifier.startsWith('@/')) {
    base = path.join(syntaxRepo.repoRoot, 'src', specifier.slice(2));
  } else if (specifier.startsWith('@ui/')) {
    base = path.join(syntaxRepo.repoRoot, 'src/ui', specifier.slice(4));
  } else if (specifier.startsWith('@types/')) {
    base = path.join(syntaxRepo.repoRoot, 'src/foundation/contracts', specifier.slice(7));
  } else {
    return undefined;
  }
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    path.join(base, 'index.ts'),
    path.join(base, 'index.tsx'),
  ].map(normalizeAbsolute);
  return candidates.find((candidate) => syntaxRepo.records.has(candidate));
}

function buildSyntaxFactoryGraph(syntaxRepo) {
  const definitions = [];
  const seenDefinitions = new Set();

  function addDefinition(record, exportedName, localName, declaration) {
    if (!FACTORY_NAME.test(exportedName)) return;
    const sourceFile = record.sourceFile;
    const key = `${record.absolute}\0${declaration.getStart(sourceFile)}\0${exportedName}`;
    if (seenDefinitions.has(key)) return;
    seenDefinitions.add(key);
    const relative = toPosix(path.relative(syntaxRepo.repoRoot, record.absolute));
    const id = `${syntaxRepo.repository}:${relative}:${exportedName}`;
    const nameNode = declaration.name && ts.isIdentifier(declaration.name) ? declaration.name : declaration;
    const definition = {
      id,
      repository: syntaxRepo.repository,
      name: exportedName,
      localName,
      source: toPosix(path.relative(syntaxRepo.workspaceRoot, record.absolute)),
      ...sourceLocation(sourceFile, nameNode),
      declaration,
      container: declaration,
    };
    definitions.push(definition);
    const localIds = record.localFactories.get(localName) ?? new Set();
    localIds.add(id);
    record.localFactories.set(localName, localIds);
    const containerIds = record.containerFactories.get(declaration) ?? new Set();
    containerIds.add(id);
    record.containerFactories.set(declaration, containerIds);
    return id;
  }

  for (const record of syntaxRepo.records.values()) {
    const locals = localDeclarations(record.sourceFile);
    for (const statement of record.sourceFile.statements) {
      if (ts.isImportDeclaration(statement) && statement.importClause && ts.isStringLiteralLike(statement.moduleSpecifier)) {
        const module = statement.moduleSpecifier.text;
        const bindings = statement.importClause.namedBindings;
        if (bindings && ts.isNamedImports(bindings)) {
          for (const element of bindings.elements) {
            record.imports.set(element.name.text, {
              module,
              importedName: element.propertyName?.text ?? element.name.text,
            });
          }
        } else if (bindings && ts.isNamespaceImport(bindings)) {
          record.namespaceImports.set(bindings.name.text, module);
        }
      }

      if (ts.isFunctionDeclaration(statement) && statement.name && hasExportModifier(statement)) {
        const id = addDefinition(record, statement.name.text, statement.name.text, statement);
        if (id) record.exports.set(statement.name.text, { ids: new Set([id]) });
      } else if (ts.isVariableStatement(statement)) {
        for (const declaration of statement.declarationList.declarations) {
          if (ts.isIdentifier(declaration.name) && declaration.initializer) {
            record.aliases.set(declaration.name.text, declaration.initializer);
          } else if (ts.isObjectBindingPattern(declaration.name) && declaration.initializer) {
            for (const element of declaration.name.elements) {
              if (!ts.isIdentifier(element.name)) continue;
              const importedName = propertyName(element.propertyName ?? element.name);
              if (importedName) record.destructuredAliases.set(element.name.text, {
                expression: declaration.initializer,
                importedName,
              });
            }
          }
          if (hasExportModifier(statement) && ts.isIdentifier(declaration.name)) {
            const id = addDefinition(record, declaration.name.text, declaration.name.text, declaration);
            if (id) record.exports.set(declaration.name.text, { ids: new Set([id]) });
          }
        }
      } else if (ts.isExportDeclaration(statement)) {
        const module = statement.moduleSpecifier && ts.isStringLiteralLike(statement.moduleSpecifier)
          ? statement.moduleSpecifier.text
          : undefined;
        if (!statement.exportClause) {
          if (module) record.starExports.push(module);
          continue;
        }
        if (!ts.isNamedExports(statement.exportClause)) continue;
        for (const element of statement.exportClause.elements) {
          const exportedName = element.name.text;
          const importedName = element.propertyName?.text ?? exportedName;
          if (module) {
            record.exports.set(exportedName, { module, importedName });
            continue;
          }
          const declaration = locals.get(importedName);
          const id = declaration
            ? addDefinition(record, exportedName, importedName, declaration)
            : undefined;
          if (id) record.exports.set(exportedName, { ids: new Set([id]) });
          else record.exports.set(exportedName, { localName: importedName });
        }
      }
    }
  }

  definitions.sort((left, right) => left.id.localeCompare(right.id));
  return definitions;
}

function analyzeSyntaxFactoryCalls({
  syntaxRepo,
  definitions,
  designSystemFactoriesByName,
  allDefinitions,
  calls,
  edges,
  analysisErrors,
}) {
  function packageIds(module, importedName) {
    if (!module.startsWith('@rottay/design-system')) return new Set();
    return new Set(designSystemFactoriesByName.get(importedName) ?? []);
  }

  function resolveModuleExport(record, module, exportedName, seen) {
    const external = packageIds(module, exportedName);
    if (external.size) return external;
    const target = syntaxModuleTarget(syntaxRepo, record, module);
    if (!target) return new Set();
    return resolveExport(syntaxRepo.records.get(target), exportedName, seen);
  }

  function resolveExport(record, exportedName, seen = new Set()) {
    const key = `${record.absolute}\0export\0${exportedName}`;
    if (seen.has(key)) return new Set();
    seen.add(key);
    const descriptor = record.exports.get(exportedName);
    if (descriptor?.ids) return new Set(descriptor.ids);
    if (descriptor?.module) return resolveModuleExport(record, descriptor.module, descriptor.importedName, seen);
    if (descriptor?.localName) return resolveLocal(record, descriptor.localName, seen);
    const resolved = new Set();
    for (const module of record.starExports) {
      for (const id of resolveModuleExport(record, module, exportedName, new Set(seen))) resolved.add(id);
    }
    return resolved;
  }

  function resolveLocal(record, name, seen = new Set()) {
    const key = `${record.absolute}\0local\0${name}`;
    if (seen.has(key)) return new Set();
    seen.add(key);
    const direct = record.localFactories.get(name);
    if (direct?.size) return new Set(direct);
    const imported = record.imports.get(name);
    if (imported) return resolveModuleExport(record, imported.module, imported.importedName, seen);
    const destructured = record.destructuredAliases.get(name);
    if (destructured) {
      return resolveMember(record, destructured.expression, destructured.importedName, seen);
    }
    const initializer = record.aliases.get(name);
    if (initializer) return resolveExpression(record, initializer, seen);
    return new Set();
  }

  function namespaceSpecifier(record, expression) {
    const unwrapped = unwrapExpression(expression);
    return ts.isIdentifier(unwrapped) ? record.namespaceImports.get(unwrapped.text) : undefined;
  }

  function resolveMember(record, base, member, seen) {
    const module = namespaceSpecifier(record, base);
    if (module) return resolveModuleExport(record, module, member, seen);
    return new Set();
  }

  function resolveExpression(record, rawExpression, seen = new Set()) {
    const expression = unwrapExpression(rawExpression);
    if (ts.isIdentifier(expression)) return resolveLocal(record, expression.text, seen);
    if (ts.isPropertyAccessExpression(expression)) {
      return resolveMember(record, expression.expression, expression.name.text, seen);
    }
    if (
      ts.isElementAccessExpression(expression)
      && expression.argumentExpression
      && ts.isStringLiteralLike(expression.argumentExpression)
    ) {
      return resolveMember(record, expression.expression, expression.argumentExpression.text, seen);
    }
    return new Set();
  }

  function enclosingFactories(record, node) {
    let current = node.parent;
    while (current && !ts.isSourceFile(current)) {
      const ids = record.containerFactories.get(current);
      if (ids?.size) return ids;
      current = current.parent;
    }
    return new Set();
  }

  function referenceRole(node) {
    const immediateParent = node.parent;
    if (
      (ts.isImportSpecifier(immediateParent) || ts.isExportSpecifier(immediateParent))
      || ts.isNamespaceImport(immediateParent)
      || ((ts.isVariableDeclaration(immediateParent) || ts.isFunctionDeclaration(immediateParent)) && immediateParent.name === node)
      || ((ts.isPropertyAccessExpression(immediateParent) || ts.isPropertyAssignment(immediateParent)) && immediateParent.name === node)
    ) return 'declaration-or-member-name';
    let outer = node;
    while (
      outer.parent
      && (
        ts.isParenthesizedExpression(outer.parent)
        || ts.isAsExpression(outer.parent)
        || ts.isTypeAssertionExpression(outer.parent)
        || ts.isSatisfiesExpression(outer.parent)
        || ts.isNonNullExpression(outer.parent)
      )
      && outer.parent.expression === outer
    ) outer = outer.parent;
    const parent = outer.parent;
    if (
      (ts.isPropertyAccessExpression(parent) || ts.isElementAccessExpression(parent))
      && parent.expression === outer
    ) return 'nested-member';
    if (ts.isCallExpression(parent) && parent.expression === outer) return 'call';
    if (ts.isVariableDeclaration(parent) && parent.initializer === outer) return 'alias';
    return 'opaque';
  }

  for (const record of syntaxRepo.records.values()) {
    const relative = toPosix(path.relative(syntaxRepo.workspaceRoot, record.absolute));
    if (GENERATED_SOURCE.test(relative)) continue;
    function visit(node) {
      if (ts.isCallExpression(node)) {
        const callee = unwrapExpression(node.expression);
        if (
          ts.isElementAccessExpression(callee)
          && namespaceSpecifier(record, callee.expression)
          && (!callee.argumentExpression || !ts.isStringLiteralLike(callee.argumentExpression))
        ) {
          analysisErrors.push({
            code: 'opaque-factory-namespace-call',
            repository: syntaxRepo.repository,
            ...stableSite(syntaxRepo.workspaceRoot, record.sourceFile, callee),
            detail: 'namespace factory calls require a static StringLiteral member',
          });
        }
        const targets = resolveExpression(record, callee);
        const callerFactories = enclosingFactories(record, node);
        for (const target of targets) {
          if (!allDefinitions.has(target)) continue;
          const site = stableSite(syntaxRepo.workspaceRoot, record.sourceFile, node, {
            repository: syntaxRepo.repository,
          });
          if (callerFactories.size > 0) {
            for (const caller of callerFactories) {
              const key = `${caller}\0${target}`;
              const records = edges.get(key) ?? [];
              records.push(site);
              edges.set(key, records);
            }
          } else if (sourceClass(relative) === 'productive') {
            const records = calls.get(target) ?? [];
            records.push(site);
            calls.set(target, records);
          }
        }
      }
      if (
        ts.isIdentifier(node)
        || ts.isPropertyAccessExpression(node)
        || ts.isElementAccessExpression(node)
      ) {
        const role = referenceRole(node);
        if (role === 'opaque' && !isTypePosition(node)) {
          const targets = resolveExpression(record, node);
          if (targets.size > 0) {
            analysisErrors.push({
              code: 'opaque-factory-reference',
              repository: syntaxRepo.repository,
              ...stableSite(syntaxRepo.workspaceRoot, record.sourceFile, node),
              detail: `factory value escapes static call graph: ${[...targets].sort().join(', ')}`,
            });
          }
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(record.sourceFile);
  }
}

export async function buildCra11Census({ designSystemRoot, workspaceRoot = path.dirname(designSystemRoot) }) {
  const repositories = [
    { name: 'ui-design-system', root: path.join(designSystemRoot, 'packages/core') },
    { name: 'app-bithire', root: path.join(workspaceRoot, 'app-bithire') },
    { name: 'app-platform', root: path.join(workspaceRoot, 'app-platform') },
    { name: 'app-evnto', root: path.join(workspaceRoot, 'app-evnto') },
  ];
  const analysisErrors = [];
  const contractProgram = await createRepoProgram(repositories[0].root, {
    sourceDirectory: 'src/ui/surfaces/foundation/contracts',
  });
  const contractSeed = collectAdaptiveFields(
    contractProgram.program,
    contractProgram.checker,
    designSystemRoot,
    workspaceRoot,
  );
  const adaptiveTerms = [...new Set(contractSeed.flatMap((field) => [
    ...(ADAPTIVE_NAME.test(field.field) ? [field.field] : []),
    field.owner,
  ]))]
    .sort((left, right) => left.localeCompare(right));
  const designSystemProgram = await createRepoProgram(repositories[0].root, {
    candidateTerms: adaptiveTerms,
    alwaysIncludeDirectory: 'src/ui/surfaces',
  });
  analysisErrors.push(...parseErrors(designSystemProgram.program, workspaceRoot, repositories[0].name));
  const rawFields = collectAdaptiveFields(
    designSystemProgram.program,
    designSystemProgram.checker,
    designSystemRoot,
    workspaceRoot,
  );
  const fields = collectFieldOccurrences(
    designSystemProgram.program,
    designSystemProgram.checker,
    rawFields,
    workspaceRoot,
    analysisErrors,
  );
  const fieldIds = new Map();
  for (const field of fields) {
    const declarations = fieldIds.get(field.id) ?? [];
    declarations.push(field.declaration);
    fieldIds.set(field.id, declarations);
  }
  for (const [id, declarations] of fieldIds) {
    if (declarations.length < 2) continue;
    const [first] = declarations;
    analysisErrors.push({
      code: 'duplicate-adaptive-field-id',
      repository: 'ui-design-system',
      source: first.source,
      line: first.line,
      column: first.column,
      detail: `${id} has ${declarations.length} public declarations`,
    });
  }

  const definitions = [];
  const allDefinitions = new Map();
  const designSystemFactoriesByName = new Map();
  const calls = new Map();
  const edges = new Map();

  const designSystemSyntax = await createSyntaxRepository(
    repositories[0].name,
    repositories[0].root,
    workspaceRoot,
  );
  analysisErrors.push(...designSystemSyntax.analysisErrors);
  const designSystemDefinitions = buildSyntaxFactoryGraph(designSystemSyntax);
  for (const definition of designSystemDefinitions) {
    definitions.push(definition);
    allDefinitions.set(definition.id, definition);
    const ids = designSystemFactoriesByName.get(definition.name) ?? [];
    ids.push(definition.id);
    designSystemFactoriesByName.set(definition.name, ids);
  }
  analyzeSyntaxFactoryCalls({
    syntaxRepo: designSystemSyntax,
    definitions: designSystemDefinitions,
    designSystemFactoriesByName,
    allDefinitions,
    calls,
    edges,
    analysisErrors,
  });

  for (const repository of repositories.slice(1)) {
    const syntaxRepo = await createSyntaxRepository(repository.name, repository.root, workspaceRoot);
    analysisErrors.push(...syntaxRepo.analysisErrors);
    const repositoryDefinitions = buildSyntaxFactoryGraph(syntaxRepo);
    for (const definition of repositoryDefinitions) {
      definitions.push(definition);
      allDefinitions.set(definition.id, definition);
    }
    analyzeSyntaxFactoryCalls({
      syntaxRepo,
      definitions: repositoryDefinitions,
      allDefinitions,
      designSystemFactoriesByName,
      calls,
      edges,
      analysisErrors,
    });
  }
  const factories = finalizeFactories(definitions, calls, edges);
  const typeOnlyFields = fields.filter((field) => field.status === 'type-only').map((field) => field.id);
  const deadFactories = factories.filter((factory) => factory.status === 'dead').map((factory) => factory.id);
  const orderedErrors = analysisErrors.sort((left, right) =>
    left.repository.localeCompare(right.repository)
    || left.source.localeCompare(right.source)
    || left.line - right.line
    || left.column - right.column
    || left.code.localeCompare(right.code)
  );

  const repositoryFactorySummaries = repositories.map((repository) => {
    const scoped = factories.filter((factory) => factory.repository === repository.name);
    return {
      repository: repository.name,
      total: scoped.length,
      live: scoped.filter((factory) => factory.status === 'live').length,
      dead: scoped.filter((factory) => factory.status === 'dead').length,
    };
  });
  const acceptance = {
    zeroTypeOnlyAdaptiveFields: typeOnlyFields.length === 0,
    zeroDeadConfigFactories: deadFactories.length === 0,
    zeroAnalysisErrors: orderedErrors.length === 0,
  };

  return {
    schemaVersion: CRA11_CENSUS_SCHEMA_VERSION,
    generatedBy: 'packages/core/scripts/cra-11-adaptive-contract-census.mjs',
    source: 'typescript-ast-productive-source-census',
    scope: {
      adaptiveDeclarations: 'ui-design-system/packages/core/src/ui/surfaces/foundation/contracts',
      adaptiveConsumers: 'ui-design-system/packages/core/src (complete ui/surfaces plus AST-selected adaptive references; types/builders/tests/artifacts excluded from productive consumers)',
      consumerEvidence: [
        'declaration-identity property reads through aliases/destructuring and ES2020 collection callbacks',
        'typed object transport through productive local call summaries, including multi-hop forwarding',
      ],
      factoryRepositories: repositories.map((repository) => repository.name),
    },
    summary: {
      adaptiveFields: fields.length,
      adaptiveFieldsWithProductiveConsumers: fields.length - typeOnlyFields.length,
      typeOnlyAdaptiveFields: typeOnlyFields.length,
      configFactories: factories.length,
      liveConfigFactories: factories.length - deadFactories.length,
      deadConfigFactories: deadFactories.length,
      analysisErrors: orderedErrors.length,
    },
    adaptiveContract: {
      typeOnlyFields,
      fields,
    },
    configFactories: {
      deadFactories,
      repositories: repositoryFactorySummaries,
      factories,
    },
    analysisErrors: orderedErrors,
    acceptance: {
      ...acceptance,
      pass: Object.values(acceptance).every(Boolean),
    },
  };
}

export function serializeCra11Census(census) {
  return `${JSON.stringify(census, null, 2)}\n`;
}
