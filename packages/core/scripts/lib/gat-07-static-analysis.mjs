import { createHash } from 'node:crypto';
import { posix } from 'node:path';
import postcss from 'postcss';
import ts from 'typescript';

const sha256 = (value) => createHash('sha256').update(value).digest('hex');

function scriptKind(fileName) {
  return fileName.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
}

function parseSource(text, fileName = 'source.tsx') {
  const source = ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true, scriptKind(fileName));
  if (source.parseDiagnostics.length > 0) {
    const diagnostic = source.parseDiagnostics[0];
    const position = source.getLineAndCharacterOfPosition(diagnostic.start ?? 0);
    throw new SyntaxError(
      `${fileName}:${position.line + 1}:${position.character + 1}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ')}`,
    );
  }
  return source;
}

function unwrap(node) {
  let expression = node;
  while (
    expression &&
    (ts.isParenthesizedExpression(expression) ||
      ts.isAsExpression(expression) ||
      ts.isTypeAssertionExpression(expression) ||
      ts.isNonNullExpression(expression) ||
      ts.isSatisfiesExpression(expression))
  ) {
    expression = expression.expression;
  }
  return expression ?? null;
}

function sourceLine(source, node) {
  return source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
}

function buildBindings(source) {
  const bindings = new Map();
  const add = (name, entry) => {
    const values = bindings.get(name) ?? [];
    values.push(entry);
    bindings.set(name, values);
  };
  function addBindingName(name, entry) {
    if (ts.isIdentifier(name)) {
      add(name.text, entry);
      return;
    }
    if (!ts.isObjectBindingPattern(name) && !ts.isArrayBindingPattern(name)) return;
    for (const element of name.elements) {
      if (!ts.isBindingElement(element)) continue;
      addBindingName(element.name, {
        ...entry,
        initializer: element.initializer ?? null,
        declaration: element,
      });
    }
  }
  function visit(node) {
    if (ts.isVariableDeclaration(node) || ts.isParameter(node)) {
      addBindingName(node.name, {
        kind: ts.isParameter(node) ? 'parameter' : 'variable',
        initializer: node.initializer ?? null,
        declaration: node,
      });
    } else if (ts.isImportSpecifier(node)) {
      const declaration = node.parent.parent.parent;
      add(node.name.text, {
        kind: 'import',
        importedName: node.propertyName?.text ?? node.name.text,
        typeOnly: Boolean(node.isTypeOnly || node.parent.parent.isTypeOnly),
        importSource: ts.isImportDeclaration(declaration) && ts.isStringLiteralLike(declaration.moduleSpecifier)
          ? declaration.moduleSpecifier.text
          : null,
        initializer: null,
        declaration: node,
      });
    } else if (ts.isNamespaceImport(node)) {
      const declaration = node.parent.parent;
      add(node.name.text, {
        kind: 'namespace-import',
        importedName: '*',
        typeOnly: Boolean(node.parent.isTypeOnly),
        importSource: ts.isImportDeclaration(declaration) && ts.isStringLiteralLike(declaration.moduleSpecifier)
          ? declaration.moduleSpecifier.text
          : null,
        initializer: null,
        declaration: node,
      });
    } else if (ts.isImportClause(node) && node.name) {
      const declaration = node.parent;
      add(node.name.text, {
        kind: 'default-import',
        importedName: 'default',
        typeOnly: Boolean(node.isTypeOnly),
        importSource: ts.isImportDeclaration(declaration) && ts.isStringLiteralLike(declaration.moduleSpecifier)
          ? declaration.moduleSpecifier.text
          : null,
        initializer: null,
        declaration: node,
      });
    } else if (ts.isFunctionDeclaration(node) && node.name) {
      add(node.name.text, { kind: 'function', initializer: node, declaration: node });
    }
    ts.forEachChild(node, visit);
  }
  visit(source);

  return bindings;
}

function uniqueBinding(bindings, name) {
  const entries = bindings.get(name);
  return entries?.length === 1 ? entries[0] : null;
}

function combineStrings(left, right, limit = 128) {
  const combined = new Set();
  for (const a of left) {
    for (const b of right) {
      combined.add(`${a}${b}`);
      if (combined.size > limit) return null;
    }
  }
  return combined;
}

function normalizedModulePath(path) {
  return posix.normalize(path.replaceAll('\\', '/'));
}

function countDeprecated(text) {
  return [...text.matchAll(/@deprecated\b/g)].length;
}

function typedRecordProgram(records) {
  const options = {
    allowJs: false,
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Node10,
    noEmit: true,
    skipLibCheck: true,
    target: ts.ScriptTarget.ES2022,
  };
  const defaultHost = ts.createCompilerHost(options, true);
  const recordByFile = new Map();
  const virtualDirectories = new Set(['/']);
  for (const record of records) {
    parseSource(record.text, record.path);
    const normalized = normalizedModulePath(record.path);
    const fileName = normalized.startsWith('/') ? normalized : `/${normalized}`;
    recordByFile.set(fileName, record);
    let directory = posix.dirname(fileName);
    while (!virtualDirectories.has(directory)) {
      virtualDirectories.add(directory);
      if (directory === '/') break;
      directory = posix.dirname(directory);
    }
  }
  const normalizeFile = (fileName) => {
    const normalized = normalizedModulePath(fileName);
    return normalized.startsWith('/') ? normalized : `/${normalized}`;
  };
  const host = {
    ...defaultHost,
    directoryExists: (directory) =>
      virtualDirectories.has(normalizeFile(directory)) || Boolean(defaultHost.directoryExists?.(directory)),
    fileExists: (fileName) => recordByFile.has(normalizeFile(fileName)) || defaultHost.fileExists(fileName),
    getCurrentDirectory: () => '/',
    getSourceFile: (fileName, languageVersion, onError, shouldCreateNewSourceFile) => {
      const record = recordByFile.get(normalizeFile(fileName));
      return record
        ? ts.createSourceFile(normalizeFile(fileName), record.text, languageVersion, true, scriptKind(fileName))
        : defaultHost.getSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile);
    },
    readFile: (fileName) => recordByFile.get(normalizeFile(fileName))?.text ?? defaultHost.readFile(fileName),
    realpath: (fileName) => normalizeFile(fileName),
  };
  const program = ts.createProgram({ rootNames: [...recordByFile.keys()], options, host });
  return { checker: program.getTypeChecker(), program, recordByFile };
}

function isDeclarationOrModuleEdge(node) {
  if (node.parent?.name === node && ts.isDeclaration(node.parent)) return true;
  let current = node.parent;
  while (current && !ts.isStatement(current)) {
    if (
      ts.isImportClause(current) || ts.isImportSpecifier(current) || ts.isNamespaceImport(current) ||
      ts.isExportSpecifier(current)
    ) {
      return true;
    }
    current = current.parent;
  }
  return Boolean(current && (ts.isImportDeclaration(current) || ts.isExportDeclaration(current)));
}

function isUnusedContainmentExclusion(node, source) {
  // Shape: `{ governedField: _binding, ...rest }` where `_binding` is never
  // read afterwards. The governed name must be the PROPERTY side of the
  // binding element and the local binding an underscore-prefixed identifier
  // with exactly one occurrence in the file (its own declaration).
  const parent = node.parent;
  if (!parent || !ts.isBindingElement(parent) || parent.propertyName !== node) return false;
  if (!ts.isIdentifier(parent.name) || !parent.name.text.startsWith('_')) return false;
  const bindingName = parent.name.text;
  let occurrences = 0;
  const count = (candidate) => {
    if (ts.isIdentifier(candidate) && candidate.text === bindingName) occurrences += 1;
    if (occurrences <= 1) ts.forEachChild(candidate, count);
  };
  count(source);
  return occurrences === 1;
}

function isTypeOnlyPosition(node) {
  let current = node.parent;
  while (current && !ts.isStatement(current)) {
    if (ts.isTypeNode(current)) return true;
    current = current.parent;
  }
  return false;
}

function directCallForSymbolReference(node) {
  let expression = node;
  if (
    expression.parent && ts.isPropertyAccessExpression(expression.parent) &&
    expression.parent.name === expression
  ) {
    expression = expression.parent;
  }
  while (
    expression.parent &&
    (ts.isParenthesizedExpression(expression.parent) || ts.isAsExpression(expression.parent) ||
      ts.isTypeAssertionExpression(expression.parent) || ts.isNonNullExpression(expression.parent) ||
      ts.isSatisfiesExpression(expression.parent)) &&
    expression.parent.expression === expression
  ) {
    expression = expression.parent;
  }
  return expression.parent && ts.isCallExpression(expression.parent) && expression.parent.expression === expression
    ? expression.parent
    : null;
}

/**
 * Analyze the bounded Phase-0 claim families through TypeScript symbols.
 *
 * Only direct, checker-resolved value references are static evidence. Passing a
 * governed symbol through a helper/container, or addressing it through a
 * computed/reflection surface, is deliberately classified for review and never
 * promoted into executable evidence.
 */
export function analyzeClaimSourceRecords(records) {
  const { checker, program, recordByFile } = typedRecordProgram(records);
  const extensionRuntimeFiles = new Set();
  const extensionHelperFiles = new Set();
  const hookCallFiles = new Set();
  const showroomOverrideFiles = new Set();
  const potentialConsumerFiles = {
    'component-extensions': new Set(),
    'surface-profile-overrides': new Set(),
  };
  const potentialConsumers = [];
  const containmentExclusions = [];
  const unsupportedReferences = [];
  const findingKeys = new Set();
  let profileDeclarations = 0;
  let extensionDeprecations = 0;
  let profileDeprecations = 0;

  const definitionSpecs = [
    {
      claimId: 'component-extensions',
      name: 'ComponentExtensions',
      pathSuffix: '/src/foundation/contracts/kernel/tokens/extensions/index.ts',
      role: 'claim-type',
    },
    {
      claimId: 'component-extensions',
      name: 'ExtensionHelpers',
      pathSuffix: '/src/foundation/contracts/kernel/tokens/extensions/index.ts',
      role: 'extension-helper',
    },
    {
      claimId: 'component-extensions',
      name: 'extensions',
      pathSuffix: '/src/foundation/contracts/runtime/engine/index.ts',
      role: 'extension-runtime-field',
      acceptsDeclaration: (declaration) =>
        ts.isPropertySignature(declaration) &&
        ts.isInterfaceDeclaration(declaration.parent) && declaration.parent.name.text === 'EngineAwareProps',
    },
    {
      claimId: 'surface-profile-overrides',
      name: 'SurfaceVisualOverrides',
      pathSuffix: '/src/ui/surfaces/foundation/contracts/index.ts',
      role: 'claim-type',
    },
    {
      claimId: 'surface-profile-overrides',
      name: 'useSurfaceProfileDefaultsWithOverrides',
      pathSuffix: '/src/ui/surfaces/runtime/profile-defaults/overrides/index.ts',
      role: 'surface-hook',
    },
    {
      claimId: 'surface-profile-overrides',
      name: 'profileOverrides',
      pathSuffix: '/src/ui/surfaces/foundation/contracts/index.ts',
      role: 'surface-runtime-field',
      acceptsDeclaration: (declaration, source) =>
        ts.isPropertySignature(declaration) && declaration.type?.getText(source).includes('SurfaceVisualOverrides'),
    },
  ];
  const canonicalSymbols = new Map();
  const canonicalDeclarationNames = new Set();
  const rootSymbol = (symbol) => {
    let current = symbol;
    const seen = new Set();
    while (current && (current.flags & ts.SymbolFlags.Alias) && !seen.has(current)) {
      seen.add(current);
      const next = checker.getAliasedSymbol(current);
      if (!next || next === current) break;
      current = next;
    }
    return current ?? null;
  };
  const rootedSymbols = (symbol) => {
    const canonical = rootSymbol(symbol);
    if (!canonical) return [];
    const roots = typeof checker.getRootSymbols === 'function' ? checker.getRootSymbols(canonical) : [];
    return [...new Set([canonical, ...roots.map(rootSymbol).filter(Boolean)])];
  };
  const canonicalSpecForSymbol = (symbol) => {
    for (const candidate of rootedSymbols(symbol)) {
      const spec = canonicalSymbols.get(candidate);
      if (spec) return spec;
    }
    return null;
  };
  for (const spec of definitionSpecs) {
    const source = program.getSourceFiles().find((candidate) => candidate.fileName.endsWith(spec.pathSuffix));
    if (!source) continue;
    function collect(node) {
      if (
        ts.isIdentifier(node) && node.text === spec.name &&
        node.parent?.name === node && ts.isDeclaration(node.parent) &&
        (!spec.acceptsDeclaration || spec.acceptsDeclaration(node.parent, source))
      ) {
        const symbol = rootSymbol(checker.getSymbolAtLocation(node));
        if (symbol) {
          canonicalSymbols.set(symbol, spec);
          canonicalDeclarationNames.add(node);
        }
      }
      ts.forEachChild(node, collect);
    }
    collect(source);
  }

  const addFinding = (list, claimId, record, source, node, reason, symbol = null) => {
    const line = sourceLine(source, node);
    const key = `${list === unsupportedReferences ? 'unsupported' : 'potential'}:${record.path}:${node.getStart(source)}:${reason}`;
    if (findingKeys.has(key)) return;
    findingKeys.add(key);
    const finding = {
      claimId,
      path: record.path,
      line,
      reason,
      expression: node.getText(source),
      ...(symbol ? { symbol } : {}),
    };
    list.push(finding);
    if (list === potentialConsumers) potentialConsumerFiles[claimId].add(record.path);
  };

  const boundedComputedStrings = (node) => {
    const expression = unwrap(node);
    if (!expression) return null;
    if (ts.isStringLiteralLike(expression)) return new Set([expression.text]);
    if (ts.isBinaryExpression(expression) && expression.operatorToken.kind === ts.SyntaxKind.PlusToken) {
      const left = boundedComputedStrings(expression.left);
      const right = boundedComputedStrings(expression.right);
      return left && right ? combineStrings(left, right, 16) : null;
    }
    if (ts.isConditionalExpression(expression)) {
      const whenTrue = boundedComputedStrings(expression.whenTrue);
      const whenFalse = boundedComputedStrings(expression.whenFalse);
      if (!whenTrue || !whenFalse || whenTrue.size + whenFalse.size > 16) return null;
      return new Set([...whenTrue, ...whenFalse]);
    }
    if (ts.isTemplateExpression(expression)) {
      let values = new Set([expression.head.text]);
      for (const span of expression.templateSpans) {
        const substitutions = boundedComputedStrings(span.expression);
        if (!substitutions) return null;
        values = combineStrings(values, substitutions, 16);
        if (!values) return null;
        values = new Set([...values].map((value) => `${value}${span.literal.text}`));
      }
      return values;
    }
    return null;
  };

  const governedClaimForVocabulary = (value) => value === 'extensions'
    ? 'component-extensions'
    : value === 'profileOverrides' ||
      ['SurfaceVisualOverrides', 'useSurfaceProfileDefaultsWithOverrides'].includes(value)
    ? 'surface-profile-overrides'
    : ['ComponentExtensions', 'ExtensionHelpers'].includes(value)
    ? 'component-extensions'
    : null;

  const directFieldName = (node) => {
    const parent = node.parent;
    if (!parent) return null;
    if (ts.isPropertyAccessExpression(parent) && parent.name === node) return node.text;
    if (ts.isJsxAttribute(parent) && parent.name === node) return node.getText();
    if (
      (ts.isPropertyAssignment(parent) || ts.isShorthandPropertyAssignment(parent) || ts.isBindingElement(parent)) &&
      (parent.name === node || parent.propertyName === node)
    ) {
      return ts.isIdentifier(node) || ts.isStringLiteralLike(node) ? node.text : null;
    }
    return null;
  };

  const contextualFieldSymbol = (node, name) => {
    const parent = node.parent;
    let type = null;
    if (
      parent &&
      (ts.isPropertyAssignment(parent) || ts.isShorthandPropertyAssignment(parent)) &&
      ts.isObjectLiteralExpression(parent.parent)
    ) {
      type = checker.getContextualType(parent.parent);
    } else if (parent && ts.isBindingElement(parent)) {
      const pattern = parent.parent;
      const owner = pattern.parent;
      if (ts.isVariableDeclaration(owner) && owner.initializer) {
        type = checker.getTypeAtLocation(owner.initializer);
      } else if (ts.isParameter(owner)) {
        type = checker.getTypeAtLocation(owner);
      }
    }
    return type ? checker.getPropertyOfType(checker.getApparentType(type), name) : null;
  };

  for (const source of program.getSourceFiles()) {
    const record = recordByFile.get(source.fileName);
    if (!record) continue;
    const normalized = record.path.replaceAll('\\', '/');
    const isExtensionDefinition = normalized.endsWith('/src/foundation/contracts/kernel/tokens/extensions/index.ts');
    const isEngineDefinition = normalized.endsWith('/src/foundation/contracts/runtime/engine/index.ts');
    const isSurfaceTypes = normalized.endsWith('/src/ui/surfaces/foundation/contracts/index.ts');
    const isSurfaceDefinition =
      isSurfaceTypes ||
      normalized.endsWith('/src/ui/surfaces/runtime/profile-defaults/overrides/index.ts') ||
      normalized.endsWith('/src/ui/surfaces/index.ts');
    if (isExtensionDefinition || isEngineDefinition) extensionDeprecations += countDeprecated(record.text);
    if (isSurfaceDefinition) profileDeprecations += countDeprecated(record.text);

    function visit(node) {
      const governedFieldName = directFieldName(node);
      let directFieldSpec = null;
      if (governedFieldName && !canonicalDeclarationNames.has(node) && !isTypeOnlyPosition(node)) {
        directFieldSpec = canonicalSpecForSymbol(checker.getSymbolAtLocation(node)) ??
          canonicalSpecForSymbol(contextualFieldSymbol(node, governedFieldName));
        if (!['extension-runtime-field', 'surface-runtime-field'].includes(directFieldSpec?.role)) {
          directFieldSpec = null;
        }
      }
      if (directFieldSpec && isUnusedContainmentExclusion(node, source)) {
        // A destructuring exclusion (`extensions: _extensions`) whose binding is
        // never read keeps the governed field OUT of a DOM/props spread. That is
        // containment of the deprecated channel, not runtime consumption; the
        // zero-consumption floor stays intact only if this shape never counts.
        addFinding(
          containmentExclusions,
          directFieldSpec.claimId,
          record,
          source,
          node,
          'unused underscore exclusion binding (containment, not consumption)',
          directFieldSpec.name,
        );
      } else if (directFieldSpec) {
        addFinding(
          potentialConsumers,
          directFieldSpec.claimId,
          record,
          source,
          node,
          'checker-resolved direct governed field reference',
          directFieldSpec.name,
        );
        if (directFieldSpec.role === 'extension-runtime-field') extensionRuntimeFiles.add(record.path);
        if (directFieldSpec.role === 'surface-runtime-field' && record.kind === 'showroom') {
          showroomOverrideFiles.add(record.path);
        }
      }
      if (isSurfaceTypes && ts.isPropertySignature(node)) {
        const propertyName = ts.isIdentifier(node.name) || ts.isStringLiteralLike(node.name) ? node.name.text : null;
        if (propertyName === 'profileOverrides' && node.type?.getText(source).includes('SurfaceVisualOverrides')) {
          profileDeclarations += 1;
        }
      }
      if (!directFieldSpec && ts.isIdentifier(node) && !isDeclarationOrModuleEdge(node) && !isTypeOnlyPosition(node)) {
        const spec = canonicalSpecForSymbol(checker.getSymbolAtLocation(node));
        if (spec) {
          const directCall = directCallForSymbolReference(node);
          addFinding(
            potentialConsumers,
            spec.claimId,
            record,
            source,
            node,
            directCall ? 'checker-resolved direct call/reference' : 'opaque governed-symbol transport requires review',
            spec.name,
          );
          if (!directCall) {
            addFinding(
              unsupportedReferences,
              spec.claimId,
              record,
              source,
              node,
              'opaque governed-symbol transport',
              spec.name,
            );
          }
          if (spec.role === 'extension-helper') extensionHelperFiles.add(record.path);
          if (
            spec.role === 'surface-hook' && directCall &&
            record.kind === 'core' && normalized.includes('/src/ui/surfaces/')
          ) {
            hookCallFiles.add(record.path);
          }
        }
      }

      if (!isTypeOnlyPosition(node)) {
        const isComputedVocabularyExpression =
          ts.isStringLiteralLike(node) || ts.isBinaryExpression(node) ||
          ts.isConditionalExpression(node) || ts.isTemplateExpression(node);
        const values = isComputedVocabularyExpression ? boundedComputedStrings(node) : null;
        const parent = node.parent;
        const isDirectPropertyName = Boolean(directFieldSpec) || Boolean(parent) &&
          (ts.isPropertyAssignment(parent) || ts.isMethodDeclaration(parent) ||
            ts.isGetAccessorDeclaration(parent) || ts.isSetAccessorDeclaration(parent) ||
            ts.isBindingElement(parent)) && (parent.name === node || parent.propertyName === node);
        if (!isDirectPropertyName && (!parent || !ts.isImportDeclaration(parent))) {
          for (const value of values ?? []) {
            const governed = governedClaimForVocabulary(value);
            if (governed) {
              addFinding(
                unsupportedReferences,
                governed,
                record,
                source,
                node,
                'computed/reflection governed vocabulary',
              );
            }
          }
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
  }

  const sorted = (set) => [...set].sort();
  const sortedFindings = (findings, claimId) => findings
    .filter((finding) => finding.claimId === claimId)
    .sort((left, right) => left.path.localeCompare(right.path) || left.line - right.line || left.reason.localeCompare(right.reason));
  return {
    'component-extensions': {
      staticallyResolvedExtensionRuntimeReferences: extensionRuntimeFiles.size,
      staticallyResolvedExtensionRuntimeReferenceFiles: sorted(extensionRuntimeFiles),
      staticallyResolvedExtensionHelperReferences: extensionHelperFiles.size,
      staticallyResolvedExtensionHelperReferenceFiles: sorted(extensionHelperFiles),
      staticallyResolvedPotentialConsumers: potentialConsumerFiles['component-extensions'].size,
      potentialConsumers: sortedFindings(potentialConsumers, 'component-extensions'),
      containmentExclusions: sortedFindings(containmentExclusions, 'component-extensions'),
      unsupportedGovernedReferences: sortedFindings(unsupportedReferences, 'component-extensions').length,
      unsupportedReferences: sortedFindings(unsupportedReferences, 'component-extensions'),
      registeredExecutableEvidence: 0,
      deprecatedMarkers: extensionDeprecations,
    },
    'surface-profile-overrides': {
      profileOverrideDeclarations: profileDeclarations,
      staticallyResolvedSurfaceHookCalls: hookCallFiles.size,
      staticallyResolvedSurfaceHookCallFiles: sorted(hookCallFiles),
      staticallyResolvedShowroomProfileOverrideReferences: showroomOverrideFiles.size,
      staticallyResolvedShowroomProfileOverrideReferenceFiles: sorted(showroomOverrideFiles),
      staticallyResolvedPotentialConsumers: potentialConsumerFiles['surface-profile-overrides'].size,
      potentialConsumers: sortedFindings(potentialConsumers, 'surface-profile-overrides'),
      containmentExclusions: sortedFindings(containmentExclusions, 'surface-profile-overrides'),
      unsupportedGovernedReferences: sortedFindings(unsupportedReferences, 'surface-profile-overrides').length,
      unsupportedReferences: sortedFindings(unsupportedReferences, 'surface-profile-overrides'),
      registeredExecutableEvidence: 0,
      deprecatedMarkers: profileDeprecations,
    },
  };
}

function literalState(node) {
  const expression = unwrap(node);
  if (!expression) return { kind: 'nonLiteral', reason: 'missing initializer' };
  if (ts.isStringLiteralLike(expression) || ts.isNumericLiteral(expression)) {
    return { kind: 'literal', value: expression.text };
  }
  if (expression.kind === ts.SyntaxKind.TrueKeyword) return { kind: 'literal', value: true };
  if (expression.kind === ts.SyntaxKind.FalseKeyword) return { kind: 'literal', value: false };
  if (expression.kind === ts.SyntaxKind.NullKeyword) return { kind: 'literal', value: null };
  return { kind: 'nonLiteral', reason: expression.getText() };
}

/**
 * Conservatively reject executable writes through the authored registry or
 * any statically derived object capability. Read-only projections remain
 * allowed; calls receiving a capability must be a fixed, proven read surface.
 */
function registryCapabilityMutationFindings(text, fileName, variableName) {
  const record = { path: fileName, kind: 'registry', text };
  const { checker, program, recordByFile } = typedRecordProgram([record]);
  const source = program.getSourceFiles().find((candidate) => recordByFile.has(candidate.fileName));
  if (!source) return [];

  let registryDeclaration = null;
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.name.text === variableName) {
        registryDeclaration ??= declaration;
      }
    }
  }
  if (!registryDeclaration || !ts.isIdentifier(registryDeclaration.name)) return [];
  const registrySymbol = checker.getSymbolAtLocation(registryDeclaration.name);
  if (!registrySymbol) return [];

  const capabilitySymbols = new Set([registrySymbol]);
  const symbolFor = (node) => ts.isIdentifier(node) ? checker.getSymbolAtLocation(node) : null;
  const addBindingSymbols = (name) => {
    let changed = false;
    function add(node) {
      if (ts.isIdentifier(node)) {
        const symbol = checker.getSymbolAtLocation(node);
        if (symbol && !capabilitySymbols.has(symbol)) {
          capabilitySymbols.add(symbol);
          changed = true;
        }
        return;
      }
      if (ts.isObjectBindingPattern(node) || ts.isArrayBindingPattern(node)) {
        for (const element of node.elements) {
          if (ts.isBindingElement(element)) add(element.name);
        }
      }
    }
    add(name);
    return changed;
  };

  const isUnshadowedGlobal = (node, expected) => {
    if (!ts.isIdentifier(node) || node.text !== expected) return false;
    const symbol = checker.getSymbolAtLocation(node);
    return !symbol?.declarations?.some((declaration) => declaration.getSourceFile() === source);
  };
  const directBuiltinMember = (node) => {
    const expression = unwrap(node);
    if (!expression || !ts.isPropertyAccessExpression(expression)) return null;
    const owner = unwrap(expression.expression);
    for (const globalName of ['Object', 'Reflect', 'JSON']) {
      if (owner && isUnshadowedGlobal(owner, globalName)) return `${globalName}.${expression.name.text}`;
    }
    return null;
  };

  const provenReadCalls = new Set([
    'Object.entries', 'Object.getOwnPropertyDescriptor', 'Object.getOwnPropertyDescriptors',
    'Object.getOwnPropertyNames', 'Object.getOwnPropertySymbols', 'Object.getPrototypeOf',
    'Object.hasOwn', 'Object.is', 'Object.isExtensible', 'Object.isFrozen', 'Object.isSealed',
    'Object.keys', 'Object.values', 'Reflect.get', 'Reflect.getOwnPropertyDescriptor',
    'Reflect.getPrototypeOf', 'Reflect.has', 'Reflect.isExtensible', 'Reflect.ownKeys',
    'JSON.stringify',
  ]);
  const mutatingCalls = new Set([
    'Object.assign', 'Object.defineProperties', 'Object.defineProperty', 'Object.freeze',
    'Object.preventExtensions', 'Object.seal', 'Object.setPrototypeOf', 'Reflect.defineProperty',
    'Reflect.deleteProperty', 'Reflect.preventExtensions', 'Reflect.set', 'Reflect.setPrototypeOf',
  ]);
  const capabilityReadMethods = new Set([
    'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'valueOf',
  ]);

  function localFunctionFor(node) {
    const expression = unwrap(node);
    if (!expression || !ts.isIdentifier(expression)) return null;
    const symbol = checker.getSymbolAtLocation(expression);
    for (const declaration of symbol?.declarations ?? []) {
      if (ts.isFunctionDeclaration(declaration)) return declaration;
      if (
        ts.isVariableDeclaration(declaration) && declaration.initializer &&
        (ts.isArrowFunction(declaration.initializer) || ts.isFunctionExpression(declaration.initializer))
      ) {
        return declaration.initializer;
      }
    }
    return null;
  }

  function derivesCapability(node, seen = new Set()) {
    const expression = unwrap(node);
    if (!expression || seen.has(expression)) return false;
    const nextSeen = new Set(seen).add(expression);
    if (ts.isIdentifier(expression)) return capabilitySymbols.has(symbolFor(expression));
    if (ts.isPropertyAccessExpression(expression) || ts.isElementAccessExpression(expression)) {
      return derivesCapability(expression.expression, nextSeen);
    }
    if (ts.isConditionalExpression(expression)) {
      return derivesCapability(expression.whenTrue, nextSeen) || derivesCapability(expression.whenFalse, nextSeen);
    }
    if (ts.isBinaryExpression(expression) && expression.operatorToken.kind === ts.SyntaxKind.CommaToken) {
      return derivesCapability(expression.right, nextSeen);
    }
    if (ts.isArrayLiteralExpression(expression)) {
      return expression.elements.some((element) => derivesCapability(element, nextSeen));
    }
    if (ts.isObjectLiteralExpression(expression)) {
      return expression.properties.some((property) =>
        ts.isSpreadAssignment(property)
          ? derivesCapability(property.expression, nextSeen)
          : ts.isPropertyAssignment(property)
          ? derivesCapability(property.initializer, nextSeen)
          : ts.isShorthandPropertyAssignment(property)
          ? derivesCapability(property.name, nextSeen)
          : false);
    }
    if (ts.isCallExpression(expression)) {
      const builtin = directBuiltinMember(expression.expression);
      if (builtin === 'Reflect.get') return derivesCapability(expression.arguments[0], nextSeen);
      if (builtin === 'Object.values' || builtin === 'Object.entries') {
        return derivesCapability(expression.arguments[0], nextSeen);
      }
      if (builtin === 'Object.assign') return derivesCapability(expression.arguments[0], nextSeen);
      if (['Object.freeze', 'Object.preventExtensions', 'Object.seal'].includes(builtin)) {
        return derivesCapability(expression.arguments[0], nextSeen);
      }
      if (builtin || isUnshadowedGlobal(unwrap(expression.expression), 'structuredClone')) return false;
      const fn = localFunctionFor(expression.expression);
      if (fn) {
        if (ts.isBlock(fn.body)) {
          let returnsCapability = false;
          function inspect(current) {
            if (returnsCapability) return;
            if (current !== fn.body && ts.isFunctionLike(current)) return;
            if (ts.isReturnStatement(current) && current.expression && derivesCapability(current.expression, nextSeen)) {
              returnsCapability = true;
              return;
            }
            ts.forEachChild(current, inspect);
          }
          inspect(fn.body);
          if (returnsCapability) return true;
        } else if (derivesCapability(fn.body, nextSeen)) {
          return true;
        }
      }
      return expression.arguments.some((argument) => derivesCapability(argument, nextSeen));
    }
    return false;
  }

  let changed = true;
  while (changed) {
    changed = false;
    function collectAliases(node) {
      if (node !== registryDeclaration && ts.isVariableDeclaration(node) && node.initializer) {
        if (derivesCapability(node.initializer)) changed = addBindingSymbols(node.name) || changed;
      } else if (
        ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
        ts.isIdentifier(unwrap(node.left)) && derivesCapability(node.right)
      ) {
        const symbol = checker.getSymbolAtLocation(unwrap(node.left));
        if (symbol && symbol !== registrySymbol && !capabilitySymbols.has(symbol)) {
          capabilitySymbols.add(symbol);
          changed = true;
        }
      }
      ts.forEachChild(node, collectAliases);
    }
    collectAliases(source);
  }

  const findings = [];
  const findingKeys = new Set();
  const addFinding = (node, reason) => {
    const key = `${node.getStart(source)}:${reason}`;
    if (findingKeys.has(key)) return;
    findingKeys.add(key);
    findings.push({
      line: sourceLine(source, node),
      reason,
      expression: node.getText(source),
    });
  };
  const capabilityRootOfWrite = (node) => {
    const expression = unwrap(node);
    if (!expression) return false;
    if (ts.isIdentifier(expression)) return checker.getSymbolAtLocation(expression) === registrySymbol;
    if (ts.isPropertyAccessExpression(expression) || ts.isElementAccessExpression(expression)) {
      return derivesCapability(expression.expression);
    }
    if (ts.isArrayLiteralExpression(expression)) return expression.elements.some(capabilityRootOfWrite);
    if (ts.isObjectLiteralExpression(expression)) {
      return expression.properties.some((property) =>
        ts.isPropertyAssignment(property) ? capabilityRootOfWrite(property.initializer) : false);
    }
    return false;
  };

  function inspectMutations(node) {
    if (
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind >= ts.SyntaxKind.FirstAssignment &&
      node.operatorToken.kind <= ts.SyntaxKind.LastAssignment &&
      capabilityRootOfWrite(node.left)
    ) {
      addFinding(node, `registry capability mutation via ${node.operatorToken.getText(source)}`);
    } else if (
      (ts.isPrefixUnaryExpression(node) || ts.isPostfixUnaryExpression(node)) &&
      [ts.SyntaxKind.PlusPlusToken, ts.SyntaxKind.MinusMinusToken].includes(node.operator) &&
      capabilityRootOfWrite(node.operand)
    ) {
      addFinding(node, 'registry capability mutation via update expression');
    } else if (ts.isDeleteExpression(node) && capabilityRootOfWrite(node.expression)) {
      addFinding(node, 'registry capability mutation via delete');
    } else if (ts.isCallExpression(node)) {
      const builtin = directBuiltinMember(node.expression);
      if (mutatingCalls.has(builtin)) {
        if (derivesCapability(node.arguments[0])) {
          addFinding(node, `registry capability passed to mutator ${builtin}`);
        }
      } else if (
        provenReadCalls.has(builtin) ||
        isUnshadowedGlobal(unwrap(node.expression), 'structuredClone')
      ) {
        // Fixed read surfaces do not mutate their registry argument.
      } else {
        const callee = unwrap(node.expression);
        if (
          callee && (ts.isPropertyAccessExpression(callee) || ts.isElementAccessExpression(callee)) &&
          derivesCapability(callee.expression)
        ) {
          const method = ts.isPropertyAccessExpression(callee) ? callee.name.text : '<computed>';
          if (!capabilityReadMethods.has(method)) {
            addFinding(node, `unproven method ${method} invoked on registry capability`);
          }
        } else if (node.arguments.some((argument) => derivesCapability(argument))) {
          addFinding(node, 'registry capability passed to unproven call');
        }
      }
    }
    ts.forEachChild(node, inspectMutations);
  }
  inspectMutations(source);
  return findings.sort((left, right) => left.line - right.line || left.reason.localeCompare(right.reason));
}

/** Extract registry facts while preserving absent vs literal vs non-literal. */
export function extractRegistryFactsFromText(text, fileName, variableName, fields) {
  const source = parseSource(text, fileName);
  const topLevel = [];
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.name.text === variableName) {
        topLevel.push({ declaration, statement });
      }
    }
  }
  if (topLevel.length === 0) {
    throw new Error(`${fileName}: cannot find exact top-level object variable ${variableName}`);
  }
  const selected = topLevel[0];
  const typeAnnotation = selected.declaration.type?.getText(source) ?? null;
  const readonlyTypeAnnotation = /^Readonly\s*</.test(typeAnnotation ?? '');
  const registry = unwrap(selected.declaration.initializer);
  if (!registry || !ts.isObjectLiteralExpression(registry)) {
    const modifiers = ts.canHaveModifiers(selected.statement) ? ts.getModifiers(selected.statement) : undefined;
    return {
      facts: {},
      unresolvedEntries: [{
        line: sourceLine(source, selected.declaration),
        reason: `${variableName} initializer must be a direct object literal`,
      }],
      declaration: {
        line: sourceLine(source, selected.declaration),
        topLevel: true,
        exported: Boolean(modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)),
        evidenceKind: 'authoredInitializerProjection',
        typeAnnotation,
        readonlyTypeAnnotation,
      },
    };
  }

  const facts = {};
  const unresolvedEntries = [];
  const seenRegistryKeys = new Set();
  if (topLevel.length !== 1) {
    for (const duplicate of topLevel.slice(1)) {
      unresolvedEntries.push({
        line: sourceLine(source, duplicate.declaration),
        reason: `duplicate top-level ${variableName} declaration`,
      });
    }
  }

  const directPropertyName = (name) =>
    name && (ts.isIdentifier(name) || ts.isStringLiteralLike(name)) ? name.text : null;
  for (const property of registry.properties) {
    if (ts.isSpreadAssignment(property)) {
      unresolvedEntries.push({ line: sourceLine(source, property), reason: 'registry spread is not authored-literal evidence' });
      continue;
    }
    const key = directPropertyName(property.name);
    if (!key) {
      unresolvedEntries.push({ line: sourceLine(source, property), reason: 'computed registry key is not authored-literal evidence' });
      continue;
    }
    if (seenRegistryKeys.has(key)) {
      facts[key] = { state: 'nonLiteralEntry', reason: `duplicate authored registry key ${key}` };
      unresolvedEntries.push({ line: sourceLine(source, property), reason: `duplicate authored registry key ${key}` });
      continue;
    }
    seenRegistryKeys.add(key);
    const entry = ts.isPropertyAssignment(property) ? unwrap(property.initializer) : null;
    if (!entry || !ts.isObjectLiteralExpression(entry)) {
      facts[key] = { state: 'nonLiteralEntry', reason: property.getText(source) };
      unresolvedEntries.push({ line: sourceLine(source, property), reason: `registry entry ${key} must be a direct object literal` });
      continue;
    }
    for (const member of entry.properties) {
      if (ts.isSpreadAssignment(member)) {
        unresolvedEntries.push({ line: sourceLine(source, member), reason: `${key} registry entry contains a spread` });
      } else if (!directPropertyName(member.name)) {
        unresolvedEntries.push({ line: sourceLine(source, member), reason: `${key} registry entry contains a computed key` });
      }
    }
    facts[key] = {};
    for (const field of fields) {
      const matching = entry.properties.filter((member) =>
        !ts.isSpreadAssignment(member) && directPropertyName(member.name) === field);
      if (matching.length === 0) {
        facts[key][field] = { kind: 'absent' };
        continue;
      }
      if (matching.length !== 1 || !ts.isPropertyAssignment(matching[0])) {
        facts[key][field] = { kind: 'nonLiteral', reason: `ambiguous/non-data ${field} property` };
        unresolvedEntries.push({ line: sourceLine(source, matching[0]), reason: `${key}.${field} is not a unique data property` });
        continue;
      }
      const state = literalState(matching[0].initializer);
      facts[key][field] = state;
      if (state.kind !== 'literal') {
        unresolvedEntries.push({ line: sourceLine(source, matching[0]), reason: `${key}.${field} is not a literal authored value` });
      }
    }
  }

  unresolvedEntries.push(...registryCapabilityMutationFindings(text, fileName, variableName));

  const declarationModifiers = ts.canHaveModifiers(selected.statement) ? ts.getModifiers(selected.statement) : undefined;
  return {
    facts,
    unresolvedEntries: unresolvedEntries.sort((a, b) => a.line - b.line || a.reason.localeCompare(b.reason)),
    declaration: {
      line: sourceLine(source, selected.declaration),
      topLevel: true,
      exported: Boolean(declarationModifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)),
      evidenceKind: 'authoredInitializerProjection',
      typeAnnotation,
      readonlyTypeAnnotation,
    },
  };
}

/** Collect only exact data-part sinks with statically provable values. */
export function collectDataPartStampsFromText(text, fileName = 'source.tsx') {
  const source = parseSource(text, fileName);
  const bindings = buildBindings(source);
  const stamps = [];
  const unresolved = [];

  function finiteStaticPartValues(node, seen = new Set(), followConstBindings = false) {
    const expression = unwrap(node);
    if (!expression || seen.has(expression)) return null;
    const nextSeen = new Set(seen).add(expression);
    if (ts.isStringLiteralLike(expression)) return new Set([expression.text]);
    if (ts.isConditionalExpression(expression)) {
      const left = finiteStaticPartValues(expression.whenTrue, nextSeen, followConstBindings);
      const right = finiteStaticPartValues(expression.whenFalse, nextSeen, followConstBindings);
      if (!left || !right || left.size + right.size > 16) return null;
      return new Set([...left, ...right]);
    }
    if (
      ts.isBinaryExpression(expression) &&
      expression.operatorToken.kind === ts.SyntaxKind.PlusToken
    ) {
      const left = finiteStaticPartValues(expression.left, nextSeen, followConstBindings);
      const right = finiteStaticPartValues(expression.right, nextSeen, followConstBindings);
      return left && right ? combineStrings(left, right, 16) : null;
    }
    if (ts.isTemplateExpression(expression)) {
      let values = new Set([expression.head.text]);
      for (const span of expression.templateSpans) {
        const substitutions = finiteStaticPartValues(span.expression, nextSeen, followConstBindings);
        if (!substitutions) return null;
        values = combineStrings(values, substitutions, 16);
        if (!values) return null;
        values = new Set([...values].map((value) => `${value}${span.literal.text}`));
      }
      return values;
    }
    if (followConstBindings && ts.isIdentifier(expression)) {
      const binding = uniqueBinding(bindings, expression.text);
      const declarationList = binding?.declaration?.parent;
      if (
        binding?.kind === 'variable' && binding.initializer &&
        declarationList && ts.isVariableDeclarationList(declarationList) &&
        (declarationList.flags & ts.NodeFlags.Const) !== 0
      ) {
        return finiteStaticPartValues(binding.initializer, nextSeen, true);
      }
    }
    return null;
  }

  function unresolvedSink(node, syntax, expression, candidateParts = [], provenance = null) {
    unresolved.push({
      path: fileName,
      line: sourceLine(source, node),
      syntax,
      expression: expression?.getText?.(source) ?? String(expression ?? '<missing>'),
      candidateParts: [...new Set(candidateParts)].sort(),
      ...(provenance ? { provenance } : {}),
    });
  }

  function addCanonicalStamp(node, valueNode, syntax, sinkKind, provenance) {
    const values = finiteStaticPartValues(valueNode);
    if (!values || values.size === 0) {
      unresolvedSink(node, `${syntax}-dynamic-value`, valueNode, [], provenance);
      return;
    }
    const staticValues = [...values].sort();
    for (const part of staticValues) {
      if (!/^[a-z0-9][a-z0-9-]*$/i.test(part)) {
        unresolvedSink(node, `${syntax}-invalid-value`, valueNode, [part], provenance);
        continue;
      }
      stamps.push({
        part,
        path: fileName,
        line: sourceLine(source, node),
        syntax,
        sinkKind,
        provenance,
        staticValues,
      });
    }
  }

  function resolvedImportPath(specifier) {
    if (!specifier.startsWith('.')) return specifier;
    return posix.normalize(posix.join(posix.dirname(normalizedModulePath(fileName)), specifier))
      .replace(/\.(?:ts|tsx|mts|cts)$/, '');
  }

  const normalizedSourcePath = normalizedModulePath(fileName);
  const sourceRootIndex = normalizedSourcePath.indexOf('/src/');
  const sourcePackageRoot = sourceRootIndex >= 0 ? normalizedSourcePath.slice(0, sourceRootIndex) : null;

  function canonicalSourceModule(resolved, suffixes) {
    return Boolean(sourcePackageRoot) && suffixes.some((suffix) => resolved === `${sourcePackageRoot}${suffix}`);
  }

  function canonicalSourceOrAliasModule(resolved, suffixes) {
    return canonicalSourceModule(resolved, suffixes) ||
      suffixes.some((suffix) => resolved === suffix.replace(/^\/src/, '@'));
  }

  function canonicalForwarder(tagName) {
    if (!ts.isIdentifier(tagName)) return null;
    const binding = uniqueBinding(bindings, tagName.text);
    const exactModuleSuffixes = {
      Box: [
        '/src/ui/primitives/layout',
        '/src/ui/primitives/layout/index',
        '/src/ui/primitives/layout/Box',
      ],
      Stack: [
        '/src/ui/primitives/layout',
        '/src/ui/primitives/layout/index',
        '/src/ui/primitives/layout/Stack',
      ],
      Text: [
        '/src/ui/primitives/display',
        '/src/ui/primitives/display/index',
        '/src/ui/primitives/display/Typography',
      ],
    };
    if (
      binding?.kind !== 'import' || binding.typeOnly ||
      !Object.hasOwn(exactModuleSuffixes, binding.importedName)
    ) return null;
    const resolved = resolvedImportPath(binding.importSource ?? '');
    const commonBarrel = resolved === '@rottay/design-system' || resolved === '@/ui/primitives' ||
      canonicalSourceModule(resolved, ['/src/ui/primitives', '/src/ui/primitives/index']);
    const exactModule = canonicalSourceOrAliasModule(
      resolved,
      exactModuleSuffixes[binding.importedName],
    );
    if (!commonBarrel && !exactModule) return null;
    return {
      canonicalComponent: binding.importedName,
      localName: tagName.text,
      importSource: binding.importSource,
      resolvedModule: resolved,
    };
  }

  function jsxSink(attribute) {
    const opening = attribute.parent?.parent;
    const tagName = opening?.tagName;
    if (!tagName) return null;
    if (ts.isIdentifier(tagName) && /^[a-z]/.test(tagName.text)) {
      return {
        sinkKind: 'intrinsic-dom',
        provenance: { tagName: tagName.text },
      };
    }
    const forwarder = canonicalForwarder(tagName);
    return forwarder
      ? { sinkKind: 'canonical-forwarder', provenance: forwarder }
      : null;
  }

  function canonicalStampHelper(call) {
    const callee = unwrap(call.expression);
    if (!callee || !ts.isIdentifier(callee)) return null;
    const binding = uniqueBinding(bindings, callee.text);
    if (
      binding?.kind !== 'import' || binding.typeOnly || binding.importedName !== 'stampDataPart' ||
      !canonicalSourceModule(
        resolvedImportPath(binding.importSource ?? ''),
        ['/src/infrastructure/runtime/dom/foundation/data-part'],
      )
    ) {
      return null;
    }
    return {
      localName: callee.text,
      importSource: binding.importSource,
      resolvedModule: resolvedImportPath(binding.importSource ?? ''),
    };
  }

  function spreadDataPartEvidence(node, seen = new Set()) {
    const expression = unwrap(node);
    if (!expression || seen.has(expression)) return null;
    const nextSeen = new Set(seen).add(expression);
    if (ts.isIdentifier(expression)) {
      const binding = uniqueBinding(bindings, expression.text);
      const declarationList = binding?.declaration?.parent;
      if (
        binding?.kind === 'variable' && binding.initializer &&
        declarationList && ts.isVariableDeclarationList(declarationList) &&
        (declarationList.flags & ts.NodeFlags.Const) !== 0
      ) {
        return spreadDataPartEvidence(binding.initializer, nextSeen);
      }
      return null;
    }
    if (ts.isConditionalExpression(expression)) {
      const left = spreadDataPartEvidence(expression.whenTrue, nextSeen);
      const right = spreadDataPartEvidence(expression.whenFalse, nextSeen);
      if (!left && !right) return null;
      return { candidateParts: [...new Set([...(left?.candidateParts ?? []), ...(right?.candidateParts ?? [])])].sort() };
    }
    if (ts.isObjectLiteralExpression(expression)) {
      const candidateParts = [];
      let relevant = false;
      for (const property of expression.properties) {
        if (ts.isSpreadAssignment(property)) {
          const nested = spreadDataPartEvidence(property.expression, nextSeen);
          if (nested) {
            relevant = true;
            candidateParts.push(...nested.candidateParts);
          }
          continue;
        }
        const names = ts.isIdentifier(property.name) || ts.isStringLiteralLike(property.name)
          ? new Set([property.name.text])
          : ts.isComputedPropertyName(property.name)
          ? finiteStaticPartValues(property.name.expression, new Set(), true)
          : null;
        if (!names?.has('data-part')) continue;
        relevant = true;
        if (ts.isPropertyAssignment(property)) {
          const values = finiteStaticPartValues(property.initializer);
          if (values) candidateParts.push(...values);
        }
      }
      return relevant ? { candidateParts: [...new Set(candidateParts)].sort() } : null;
    }
    if (ts.isCallExpression(expression)) {
      const callee = unwrap(expression.expression);
      if (
        callee && ts.isPropertyAccessExpression(callee) &&
        ts.isIdentifier(unwrap(callee.expression)) && unwrap(callee.expression).text === 'Object' &&
        !uniqueBinding(bindings, 'Object')
      ) {
        const inputs = callee.name.text === 'assign'
          ? expression.arguments
          : ['freeze', 'preventExtensions', 'seal'].includes(callee.name.text)
          ? expression.arguments.slice(0, 1)
          : [];
        const evidence = inputs.map((input) => spreadDataPartEvidence(input, nextSeen)).filter(Boolean);
        if (evidence.length > 0) {
          return {
            candidateParts: [...new Set(evidence.flatMap((item) => item.candidateParts))].sort(),
          };
        }
      }
    }
    return null;
  }

  function isReactOwner(node) {
    const owner = unwrap(node);
    if (!owner || !ts.isIdentifier(owner)) return false;
    const binding = uniqueBinding(bindings, owner.text);
    return Boolean(
      binding && !binding.typeOnly && binding.importSource === 'react' &&
      ['default-import', 'namespace-import'].includes(binding.kind),
    );
  }

  function resolveRawCallable(node, seen = new Set()) {
    const expression = unwrap(node);
    if (!expression || seen.has(expression)) return null;
    const nextSeen = new Set(seen).add(expression);
    if (ts.isIdentifier(expression)) {
      const binding = uniqueBinding(bindings, expression.text);
      if (
        binding?.kind === 'import' && !binding.typeOnly &&
        binding.importSource === 'react' && ['createElement', 'cloneElement'].includes(binding.importedName)
      ) {
        return { surface: `react.${binding.importedName}`, propsIndex: 1 };
      }
      if (
        binding?.kind === 'import' && !binding.typeOnly &&
        ['react/jsx-runtime', 'react/jsx-dev-runtime'].includes(binding.importSource) &&
        ['jsx', 'jsxs', 'jsxDEV'].includes(binding.importedName)
      ) {
        return { surface: `react-runtime.${binding.importedName}`, propsIndex: 1 };
      }
      const declarationList = binding?.declaration?.parent;
      if (
        binding?.kind === 'variable' && binding.initializer &&
        declarationList && ts.isVariableDeclarationList(declarationList) &&
        (declarationList.flags & ts.NodeFlags.Const) !== 0
      ) {
        return resolveRawCallable(binding.initializer, nextSeen);
      }
      return null;
    }
    if (!ts.isPropertyAccessExpression(expression)) return null;
    const method = expression.name.text;
    if (method === 'createElement' && isReactOwner(expression.expression)) {
      return { surface: 'react.createElement', propsIndex: 1 };
    }
    if (method === 'cloneElement' && isReactOwner(expression.expression)) {
      return { surface: 'react.cloneElement', propsIndex: 1 };
    }
    if (method === 'setAttribute') {
      return { surface: 'element.setAttribute', attributeNameIndex: 0 };
    }
    if (method === 'setAttributeNS') {
      return { surface: 'element.setAttributeNS', attributeNameIndex: 1 };
    }
    if (method === 'attr') {
      return { surface: 'attribute.attr', attributeNameIndex: 0, propsIndex: 0 };
    }
    if (method === 'attrs') {
      return { surface: 'attribute.attrs', propsIndex: 0 };
    }
    return null;
  }

  function staticArgumentList(node, seen = new Set()) {
    const expression = unwrap(node);
    if (!expression || seen.has(expression)) return null;
    const nextSeen = new Set(seen).add(expression);
    if (ts.isArrayLiteralExpression(expression) && expression.elements.every((element) => !ts.isSpreadElement(element))) {
      return [...expression.elements];
    }
    if (ts.isIdentifier(expression)) {
      const binding = uniqueBinding(bindings, expression.text);
      const declarationList = binding?.declaration?.parent;
      if (
        binding?.kind === 'variable' && binding.initializer &&
        declarationList && ts.isVariableDeclarationList(declarationList) &&
        (declarationList.flags & ts.NodeFlags.Const) !== 0
      ) {
        return staticArgumentList(binding.initializer, nextSeen);
      }
    }
    return null;
  }

  function rawDataPartCallEvidence(call) {
    const callee = unwrap(call.expression);
    let callable = null;
    let args = [...call.arguments];
    if (
      callee && ts.isPropertyAccessExpression(callee) && callee.name.text === 'apply' &&
      ts.isIdentifier(unwrap(callee.expression)) && unwrap(callee.expression).text === 'Reflect' &&
      !uniqueBinding(bindings, 'Reflect')
    ) {
      callable = resolveRawCallable(args[0]);
      args = staticArgumentList(args[2]);
    } else if (
      callee && ts.isPropertyAccessExpression(callee) &&
      ['call', 'apply'].includes(callee.name.text)
    ) {
      callable = resolveRawCallable(callee.expression);
      args = callee.name.text === 'call'
        ? args.slice(1)
        : staticArgumentList(args[1]);
    } else {
      callable = resolveRawCallable(callee);
    }
    if (!callable || !args) return null;
    if (Number.isInteger(callable.attributeNameIndex)) {
      const names = finiteStaticPartValues(args[callable.attributeNameIndex], new Set(), true);
      if (names?.has('data-part')) {
        return { surface: callable.surface, source: 'static-attribute-name', candidateParts: [] };
      }
    }
    if (Number.isInteger(callable.propsIndex)) {
      const evidence = spreadDataPartEvidence(args[callable.propsIndex]);
      if (evidence) {
        return { surface: callable.surface, source: 'static-props-bag', candidateParts: evidence.candidateParts };
      }
    }
    return null;
  }

  function visitCanonical(node) {
    if (ts.isJsxAttribute(node) && node.name.getText(source) === 'data-part') {
      const sink = jsxSink(node);
      const valueNode = node.initializer && ts.isJsxExpression(node.initializer)
        ? node.initializer.expression
        : node.initializer;
      if (!sink) {
        const values = finiteStaticPartValues(valueNode);
        unresolvedSink(
          node,
          'jsx-custom-unproven-forwarder',
          node,
          values ? [...values] : [],
          { tagName: node.parent?.parent?.tagName?.getText(source) ?? '<unknown>' },
        );
      } else {
        addCanonicalStamp(
          node,
          valueNode,
          sink.sinkKind === 'intrinsic-dom' ? 'jsx-intrinsic' : 'jsx-canonical-forwarder',
          sink.sinkKind,
          sink.provenance,
        );
      }
    } else if (ts.isJsxSpreadAttribute(node)) {
      const evidence = spreadDataPartEvidence(node.expression);
      if (evidence) {
        unresolvedSink(
          node,
          'jsx-spread-data-part',
          node.expression,
          evidence.candidateParts,
          { source: 'static-spread-bag' },
        );
      }
    } else if (ts.isCallExpression(node)) {
      const helper = canonicalStampHelper(node);
      if (helper) {
        addCanonicalStamp(
          node,
          node.arguments[1],
          'canonical-data-part-helper',
          'canonical-helper',
          helper,
        );
      } else {
        const rawEvidence = rawDataPartCallEvidence(node);
        if (rawEvidence) {
          unresolvedSink(
            node,
            'raw-attribute-call',
            node,
            rawEvidence.candidateParts,
            { method: rawEvidence.surface, source: rawEvidence.source },
          );
        }
      }
    }
    ts.forEachChild(node, visitCanonical);
  }
  visitCanonical(source);
  return { stamps, unresolved };

}

const REQUIRED_FLOOR_TARGETS = ['*', '::after', '::before', '::backdrop', '::file-selector-button'];

function selectorEndsWithTarget(selector, target) {
  const normalized = selector.replace(/\s+/g, ' ').trim();
  return target === '*'
    ? /(?:^|\s)>?\s*\*$/.test(normalized)
    : normalized.endsWith(target);
}

function tenantSlugsFromRule(rule) {
  const selectors = [];
  let current = rule;
  while (current) {
    if (current.type === 'rule') selectors.push(current.selector);
    current = current.parent;
  }
  const tenants = new Set();
  for (const selector of selectors) {
    for (const match of selector.matchAll(/\[data-tenant\s*=\s*(['"]?)([a-z0-9_-]+)\1\]/gi)) tenants.add(match[2]);
  }
  return tenants;
}

/** Parse authored tenant extension CSS and enumerate universal border-floor owners. */
export function analyzeTenantFloorCssRecords(records) {
  const floors = [];
  const parseErrors = [];
  for (const record of records) {
    let root;
    try {
      root = postcss.parse(record.text, { from: record.path });
    } catch (error) {
      parseErrors.push({ path: record.path, message: error.reason ?? error.message });
      continue;
    }
    root.walkRules((rule) => {
      const selectors = postcss.list.comma(rule.selector);
      const hasAllTargets = REQUIRED_FLOOR_TARGETS.every((target) =>
        selectors.some((selector) => selectorEndsWithTarget(selector, target)),
      );
      if (!hasAllTargets) return;
      const declarations = [];
      rule.walkDecls(/^border-color$/i, (declaration) => declarations.push(declaration));
      if (declarations.length === 0) return;
      const tenants = tenantSlugsFromRule(rule);
      floors.push({
        path: record.path,
        line: rule.source?.start?.line ?? 0,
        tenants: tenants.size > 0 ? [...tenants].sort() : ['<global>'],
        selector: rule.selector,
        values: declarations.map((declaration) => declaration.value),
      });
    });
  }
  const owners = [...new Set(floors.flatMap((floor) => floor.tenants))].sort();
  return { owners, floors, parseErrors };
}

function typescriptComments(text, fileName) {
  const source = parseSource(text, fileName);
  const comments = [];
  const seen = new Set();
  const addRanges = (ranges = []) => {
    for (const range of ranges) {
      const key = `${range.pos}:${range.end}`;
      if (seen.has(key)) continue;
      seen.add(key);
      comments.push({
        text: text.slice(range.pos, range.end),
        line: source.getLineAndCharacterOfPosition(range.pos).line + 1,
        pos: range.pos,
        end: range.end,
      });
    }
  };
  function visit(node) {
    addRanges(ts.getLeadingCommentRanges(text, node.getFullStart()));
    addRanges(ts.getTrailingCommentRanges(text, node.end));
    ts.forEachChild(node, visit);
  }
  visit(source);
  addRanges(ts.getTrailingCommentRanges(text, source.end));
  const merged = [];
  for (const comment of comments.sort((left, right) => left.pos - right.pos)) {
    const previous = merged.at(-1);
    const gap = previous ? text.slice(previous.end, comment.pos) : '';
    if (
      previous?.text.trimStart().startsWith('//') && comment.text.trimStart().startsWith('//') &&
      /^[\t ]*\r?\n[\t ]*$/.test(gap)
    ) {
      previous.text = `${previous.text} ${comment.text}`;
      previous.end = comment.end;
    } else {
      merged.push({ ...comment });
    }
  }
  return merged.map(({ text: commentText, line }) => ({ text: commentText, line }));
}

const INLINE_HIGH_RISK_TERMS = /\binline (?:styles?|css)\b/i;
const INLINE_ABSOLUTE_TERMS = /\b(?:only|exclusiv(?:e|ely)|entire(?:ly)?|all)\b/i;
const TENANT_QUANTIFIER_TERMS = /\b(?:all|every|each) tenants?\b/i;
const TENANT_FLOOR_TERMS = /\b(?:floor|border)\b/i;

function fixedPolicyClauses(text) {
  return text.replace(/\s+/g, ' ').split(/[.;]+/).map((clause) => clause.trim()).filter(Boolean);
}

function containsHighRiskInlineClaim(text) {
  return fixedPolicyClauses(text).some((clause) =>
    INLINE_HIGH_RISK_TERMS.test(clause) && INLINE_ABSOLUTE_TERMS.test(clause));
}

function containsHighRiskTenantClaim(text) {
  return fixedPolicyClauses(text).some((clause) =>
    TENANT_QUANTIFIER_TERMS.test(clause) && TENANT_FLOOR_TERMS.test(clause));
}

/** Scan actual comments across a dynamic corpus. */
export function findStaleClaimsInRecords(records) {
  const staleInline = [];
  const evidencedInline = [];
  const falseTenantFloor = [];
  const parseErrors = [];
  for (const record of records) {
    let comments = [];
    try {
      if (record.kind === 'css') {
        const root = postcss.parse(record.text, { from: record.path });
        root.walkComments((comment) => comments.push({ text: comment.text, line: comment.source?.start?.line ?? 0 }));
      } else {
        comments = typescriptComments(record.text, record.path);
      }
    } catch (error) {
      parseErrors.push({ path: record.path, message: error.reason ?? error.message });
      continue;
    }
    for (const comment of comments) {
      if (containsHighRiskInlineClaim(comment.text)) {
        staleInline.push({ path: record.path, line: comment.line, policy: 'inline-absolute-language' });
      }
      if (containsHighRiskTenantClaim(comment.text)) {
        falseTenantFloor.push({ path: record.path, line: comment.line, policy: 'fleet-wide-floor-language' });
      }
    }
  }
  return { staleInline, evidencedInline, falseTenantFloor, parseErrors };
}

const CLAIM_VOCABULARY = {
  'component-extensions': /component-extensions|ComponentExtensions|ExtensionHelpers|EngineAwareProps\.extensions|\bextension (?:system|handlers?|hooks?)\b/i,
  'surface-profile-overrides': /surface-profile-overrides|SurfaceVisualOverrides|useSurfaceProfileDefaultsWithOverrides|profileOverrides|per-instance visual (?:overrides?|customization)/i,
};

function normalizeBlock(lines) {
  return lines.map((line) => line.trimEnd()).join('\n').trim();
}

function markdownBlocks(text) {
  const lines = text.replaceAll('\r\n', '\n').split('\n');
  const blocks = [];
  let buffer = [];
  let start = 1;
  let fenced = false;
  const flush = () => {
    const text = normalizeBlock(buffer);
    if (text) blocks.push({ line: start, text });
    buffer = [];
  };
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.trimStart().startsWith('```')) {
      if (!fenced) {
        flush();
        start = index + 1;
        fenced = true;
        buffer.push(line);
      } else {
        buffer.push(line);
        flush();
        fenced = false;
      }
      continue;
    }
    if (fenced) {
      buffer.push(line);
      continue;
    }
    if (line.startsWith('|') || /^#{1,6}\s/.test(line) || /^<!-- GAT07-CLAIM /.test(line)) {
      flush();
      blocks.push({ line: index + 1, text: line.trimEnd() });
      start = index + 2;
      continue;
    }
    if (!line.trim()) {
      flush();
      start = index + 2;
      continue;
    }
    if (buffer.length === 0) start = index + 1;
    buffer.push(line);
  }
  flush();
  return blocks;
}

/** Build the sealed, generated-contract inventory for public-claim documentation. */
export function buildClaimDocumentationInventory(records, canonicalMarkers, canonicalTemplates = {}) {
  const documents = {};
  for (const record of records) {
    const blocks = markdownBlocks(record.text);
    const selected = [];
    const selectedKeys = new Set();
    for (const claimId of Object.keys(CLAIM_VOCABULARY)) {
      const marker = canonicalMarkers[claimId];
      const templates = Array.isArray(canonicalTemplates[claimId])
        ? canonicalTemplates[claimId]
        : canonicalTemplates[claimId]
        ? [canonicalTemplates[claimId]]
        : [];
      const matching = blocks.filter((block) =>
        CLAIM_VOCABULARY[claimId].test(block.text) || block.text === marker || templates.includes(block.text));
      for (const block of matching) {
        const key = `${claimId}:${block.line}:${block.text}`;
        if (selectedKeys.has(key)) continue;
        selectedKeys.add(key);
        selected.push({ claimId, line: block.line, sha256: sha256(block.text), text: block.text });
      }
    }
    documents[record.path] = {
      claims: [...record.claims].sort(),
      blocks: selected.sort((a, b) => a.claimId.localeCompare(b.claimId) || a.sha256.localeCompare(b.sha256)),
    };
  }
  return { schemaVersion: 2, algorithm: 'gat07-generated-claim-contract-v2', documents };
}

export function validateClaimDocumentationInventory(actual, allowlist, canonicalMarkers, canonicalTemplates = {}) {
  const errors = [];
  if (allowlist?.schemaVersion !== 2 || allowlist?.algorithm !== 'gat07-generated-claim-contract-v2') {
    return { ok: false, errors: ['claim documentation allowlist schema/algorithm is invalid'] };
  }
  const actualPaths = Object.keys(actual.documents).sort();
  const expectedPaths = Object.keys(allowlist.documents ?? {}).sort();
  if (actualPaths.join('\0') !== expectedPaths.join('\0')) errors.push('claim documentation allowlist path set drifted');
  for (const path of actualPaths) {
    const document = actual.documents[path];
    const expected = allowlist.documents?.[path];
    if (!expected) continue;
    if (document.claims.join('\0') !== [...expected.claims].sort().join('\0')) errors.push(`${path}: claim family set drifted`);
    for (const claimId of document.claims) {
      const marker = canonicalMarkers[claimId];
      const templates = Array.isArray(canonicalTemplates[claimId])
        ? canonicalTemplates[claimId]
        : canonicalTemplates[claimId]
        ? [canonicalTemplates[claimId]]
        : [];
      const markerHash = sha256(marker);
      if (!document.blocks.some((block) => block.claimId === claimId && block.sha256 === markerHash)) {
        errors.push(`${path}: missing canonical marker for ${claimId}`);
      }
      for (const template of templates) {
        const templateHash = sha256(template);
        if (!document.blocks.some((block) => block.claimId === claimId && block.sha256 === templateHash)) {
          errors.push(`${path}: missing generated contract template for ${claimId}`);
        }
      }
    }
    for (const block of document.blocks) {
      const templates = Array.isArray(canonicalTemplates[block.claimId])
        ? canonicalTemplates[block.claimId]
        : canonicalTemplates[block.claimId]
        ? [canonicalTemplates[block.claimId]]
        : [];
      if (!document.claims.includes(block.claimId)) {
        errors.push(`${path}: line ${block.line}: governed ${block.claimId} vocabulary is outside this document's declared claim scope`);
      } else if (block.text !== canonicalMarkers[block.claimId] && !templates.includes(block.text)) {
        errors.push(`${path}: line ${block.line}: governed ${block.claimId} vocabulary is outside its generated contract block`);
      }
    }
    const actualHashes = document.blocks.map(({ claimId, sha256: hash }) => `${claimId}:${hash}`).sort();
    const expectedHashes = (expected.blocks ?? []).map(({ claimId, sha256: hash }) => `${claimId}:${hash}`).sort();
    if (actualHashes.join('\0') !== expectedHashes.join('\0')) {
      errors.push(`${path}: public-claim block hash set drifted; review and update the positive allowlist`);
    }
  }
  return { ok: errors.length === 0, errors };
}
