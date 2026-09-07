import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { packageRoot as findPackageRoot } from '../../repo-root/index.mjs';
import postcss from 'postcss';
import ts from 'typescript';
import { IMPLEMENTED_ENGINE_NAMES } from '../../engine/roster/index.mjs';

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

/**
 * Name of the interface / type-alias / class that physically hosts a governed
 * declaration. Used for declaration identity, so re-hosting a field on another
 * type is detectable without changing the declaration count.
 */
function enclosingTypeName(declaration) {
  for (let current = declaration?.parent; current; current = current.parent) {
    if (
      ts.isInterfaceDeclaration(current) || ts.isTypeAliasDeclaration(current) ||
      ts.isClassDeclaration(current)
    ) {
      return current.name?.text ?? '(anonymous)';
    }
  }
  return '(anonymous)';
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
 * Canonical source owners for the surface-profile-overrides claim.
 *
 * The claim type and its hook live under the structure-chrome foundation; the
 * surfaces tree only re-exports them. These are the ONLY authoritative owners --
 * the pre-relocation `src/components/surfaces/runtime/profile-defaults/**` paths no
 * longer exist and carry no authority.
 */
const SURFACE_PROFILE_CLAIM_TYPE_OWNER = '/src/components/structures/foundation/chrome/contracts/index.ts';
const SURFACE_PROFILE_HOOK_OWNER =
  '/src/components/structures/foundation/chrome/runtime/profile-defaults/overrides/index.ts';

/**
 * Files that DEFINE or re-export the claim rather than consume it. A reference
 * inside one of these is authorship of the contract, not an applied consumer,
 * so they are excluded from the applied-consumer census.
 */
const SURFACE_PROFILE_DEFINITION_SUFFIXES = Object.freeze([
  SURFACE_PROFILE_CLAIM_TYPE_OWNER,
  SURFACE_PROFILE_HOOK_OWNER,
  '/src/components/surfaces/foundation/contracts/index.ts',
  '/src/components/surfaces/index.ts',
]);

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
  // A hook CALL is not an APPLICATION. `hookCallFiles` stays a separate metric:
  // it counts any direct call to the governed hook. `hookApplicationFiles`
  // counts only a call whose SINGLE argument resolves, whole and by exact
  // symbol identity, to one of the canonical `profileOverrides` declarations.
  //
  // A subtree scan of the arguments -- what this analyzer used to do -- is not
  // that test. `hook(flag ? overrides : {})`, `hook(a, overrides)` and
  // `hook({ ...config.visual?.profileOverrides })` all CONTAIN a governed
  // reference while applying nothing the gate can attribute, so containment is
  // never evidence here.
  const hookApplicationFiles = new Set();
  // Application identity: WHICH declaration each consumer applied. The
  // unapplied census is the exact set difference against the declaration
  // roster, so a consumer that silently switches to another owner's field is
  // visible even when the applied roster is byte-identical.
  const applicationRecords = [];
  const appliedDeclarationRecords = new Set();
  // Canonical field symbol -> its declaration record. Application is decided
  // against THIS map by symbol identity, never by name or by subtree presence.
  const profileFieldRecordBySymbol = new Map();
  const profileDeclarationRecords = [];
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
      pathSuffixes: [SURFACE_PROFILE_CLAIM_TYPE_OWNER],
      role: 'claim-type',
    },
    {
      claimId: 'surface-profile-overrides',
      name: 'useSurfaceProfileDefaultsWithOverrides',
      pathSuffixes: [SURFACE_PROFILE_HOOK_OWNER],
      role: 'surface-hook',
    },
    {
      claimId: 'surface-profile-overrides',
      name: 'profileOverrides',
      // The declaring contracts are BOTH the structure-chrome owner and the
      // surfaces facade that re-exports the claim type. Counting only one of
      // them under-reports the declaration census.
      pathSuffixes: [SURFACE_PROFILE_CLAIM_TYPE_OWNER, '/src/components/surfaces/foundation/contracts/index.ts'],
      role: 'surface-runtime-field',
      // Exact TypeScript symbol identity, never a substring of the printed
      // type. `NotSurfaceVisualOverrides` and a same-named local interface both
      // satisfy `includes('SurfaceVisualOverrides')`; neither is the governed
      // contract. A real import/re-export alias DOES root back to it and counts.
      acceptsDeclaration: (declaration, _source, context) =>
        ts.isPropertySignature(declaration) && context.resolvesToClaimType(declaration.type),
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
  const claimTypeSymbols = new Set();
  /**
   * Exact symbol identity for a governed type annotation. Resolves the written
   * type reference to its symbol and roots it through import/re-export aliases,
   * so a genuine alias counts while a look-alike name never does.
   */
  const resolvesToClaimType = (typeNode) => {
    if (!typeNode || !ts.isTypeReferenceNode(typeNode)) return false;
    const nameNode = ts.isQualifiedName(typeNode.typeName) ? typeNode.typeName.right : typeNode.typeName;
    return rootedSymbols(checker.getSymbolAtLocation(nameNode)).some((candidate) => claimTypeSymbols.has(candidate));
  };
  const declarationContext = { resolvesToClaimType };
  const specDeclarationCounts = new Map();
  // `claim-type` specs must be collected before the specs whose acceptance
  // predicate resolves against them.
  for (const spec of [...definitionSpecs].sort((left, right) =>
    Number(right.role === 'claim-type') - Number(left.role === 'claim-type'))) {
    const suffixes = spec.pathSuffixes ?? [spec.pathSuffix];
    for (const suffix of suffixes) {
      const source = program.getSourceFiles().find((candidate) => candidate.fileName.endsWith(suffix));
      if (!source) continue;
      function collect(node) {
        if (
          ts.isIdentifier(node) && node.text === spec.name &&
          node.parent?.name === node && ts.isDeclaration(node.parent) &&
          (!spec.acceptsDeclaration || spec.acceptsDeclaration(node.parent, source, declarationContext))
        ) {
          const symbol = rootSymbol(checker.getSymbolAtLocation(node));
          if (symbol) {
            canonicalSymbols.set(symbol, spec);
            canonicalDeclarationNames.add(node);
            if (spec.role === 'claim-type') claimTypeSymbols.add(symbol);
            if (spec.role === 'surface-runtime-field') {
              // Declaration identity: every accepted PropertySignature is
              // attributable to an owner file and an enclosing type, so a
              // declaration that MOVES between owners, or is re-hosted on a
              // different type, is visible even when the count stays 32.
              // The record is keyed by symbol so an APPLICATION can name the
              // exact declaration it applied.
              const declarationRecord = {
                path: recordByFile.get(source.fileName)?.path ?? source.fileName,
                enclosingType: enclosingTypeName(node.parent),
              };
              profileFieldRecordBySymbol.set(symbol, declarationRecord);
              profileDeclarationRecords.push(declarationRecord);
            }
            specDeclarationCounts.set(spec.role, (specDeclarationCounts.get(spec.role) ?? 0) + 1);
          }
        }
        ts.forEachChild(node, collect);
      }
      collect(source);
    }
  }
  // The declaration census IS the set of governed field declarations the
  // analyzer accepted by exact symbol identity, across every declaring owner.
  profileDeclarations = specDeclarationCounts.get('surface-runtime-field') ?? 0;

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

  /**
   * Strip ONLY the wrappers that are transparent to the value being passed.
   *
   * Parentheses, a non-null assertion, a cast and a `satisfies` change the
   * type or the syntax around an expression without changing WHICH value
   * arrives at the parameter. Nothing else is unwrapped: a conditional, a
   * logical, a comma, a call and an object literal each SELECT or CONSTRUCT a
   * value, so the argument is no longer the governed declaration itself.
   */
  const unwrapApplicationArgument = (node) => {
    let current = node;
    while (
      current &&
      (ts.isParenthesizedExpression(current) || ts.isNonNullExpression(current) ||
        ts.isAsExpression(current) || ts.isTypeAssertionExpression(current) ||
        ts.isSatisfiesExpression(current))
    ) {
      current = current.expression;
    }
    return current;
  };

  /**
   * The declaration a hook argument APPLIES, or null.
   *
   * The COMPLETE argument -- after the transparent unwrapping above -- must
   * itself resolve, by exact symbol identity, to a canonical `profileOverrides`
   * declaration. There is deliberately no subtree search: an argument that
   * merely CONTAINS a governed reference somewhere inside it applies nothing,
   * because the value that actually reaches the parameter is whatever the
   * enclosing conditional/logical/comma/call/object produced instead.
   */
  const appliedDeclarationForArgument = (argument) => {
    const expression = unwrapApplicationArgument(argument);
    if (!expression) return null;
    // Only two shapes can BE the declaration: a property access whose name is
    // the governed field, or an identifier that roots to it through aliases.
    const nameNode = ts.isPropertyAccessExpression(expression)
      ? expression.name
      : ts.isIdentifier(expression)
      ? expression
      : null;
    if (!nameNode || !ts.isIdentifier(nameNode)) return null;
    if (canonicalDeclarationNames.has(nameNode) || isTypeOnlyPosition(nameNode)) return null;
    const symbol = rootSymbol(checker.getSymbolAtLocation(nameNode)) ??
      rootSymbol(contextualFieldSymbol(nameNode, nameNode.text));
    if (!symbol) return null;
    for (const candidate of rootedSymbols(symbol)) {
      const declarationRecord = profileFieldRecordBySymbol.get(candidate);
      if (declarationRecord) return declarationRecord;
    }
    return null;
  };

  for (const source of program.getSourceFiles()) {
    const record = recordByFile.get(source.fileName);
    if (!record) continue;
    const normalized = record.path.replaceAll('\\', '/');
    const isExtensionDefinition = normalized.endsWith('/src/foundation/contracts/kernel/tokens/extensions/index.ts');
    const isEngineDefinition = normalized.endsWith('/src/foundation/contracts/runtime/engine/index.ts');
    const isSurfaceDefinition = SURFACE_PROFILE_DEFINITION_SUFFIXES.some((suffix) => normalized.endsWith(suffix));
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
          // Applied-consumer census: any productive Core file that DIRECTLY
          // calls the hook and is not itself a definition/re-export owner. The
          // former `/src/components/surfaces/` path filter silently dropped the
          // structure-tier `header-surface` consumer.
          if (spec.role === 'surface-hook' && directCall && record.kind === 'core' && !isSurfaceDefinition) {
            hookCallFiles.add(record.path);
            // An APPLICATION is exactly one argument that IS a governed
            // declaration. Zero arguments apply nothing; two or more mean the
            // governed value is one input among several and the analyzer
            // cannot attribute the application, so both are calls only.
            const callArguments = directCall.arguments ?? [];
            const appliedDeclaration = callArguments.length === 1
              ? appliedDeclarationForArgument(callArguments[0])
              : null;
            if (appliedDeclaration) {
              hookApplicationFiles.add(record.path);
              appliedDeclarationRecords.add(appliedDeclaration);
              applicationRecords.push({
                consumerPath: record.path,
                declarationPath: appliedDeclaration.path,
                enclosingType: appliedDeclaration.enclosingType,
              });
            }
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
  // Declaration identity is emitted as a stable, sorted (path, enclosingType)
  // roster so a declaration that moves between owners, or is re-hosted on a
  // different type, is observable even when the declaration count is constant.
  const byDeclarationIdentity = (left, right) =>
    left.path.localeCompare(right.path) || left.enclosingType.localeCompare(right.enclosingType);
  const declarationRecord = ({ path, enclosingType }) => ({ path, enclosingType });
  const sortedDeclarationRecords = profileDeclarationRecords.map(declarationRecord).sort(byDeclarationIdentity);
  // The unapplied census is the EXACT set difference between the declaration
  // roster and the declarations some consumer actually applied -- computed on
  // record identity, which is symbol identity, not on names and not on counts.
  // `declared - applied` is a size; this is the gap itself.
  const unappliedDeclarationRecords = profileDeclarationRecords
    .filter((record) => !appliedDeclarationRecords.has(record))
    .map(declarationRecord)
    .sort(byDeclarationIdentity);
  const appliedDeclarationRoster = [...appliedDeclarationRecords].map(declarationRecord).sort(byDeclarationIdentity);
  const sortedApplicationRecords = [...applicationRecords].sort((left, right) =>
    left.consumerPath.localeCompare(right.consumerPath) ||
    left.declarationPath.localeCompare(right.declarationPath) ||
    left.enclosingType.localeCompare(right.enclosingType));
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
      profileOverrideDeclarationRecords: sortedDeclarationRecords,
      staticallyResolvedSurfaceHookCalls: hookCallFiles.size,
      staticallyResolvedSurfaceHookCallFiles: sorted(hookCallFiles),
      staticallyResolvedSurfaceProfileApplications: hookApplicationFiles.size,
      staticallyResolvedSurfaceProfileApplicationFiles: sorted(hookApplicationFiles),
      staticallyResolvedSurfaceProfileApplicationRecords: sortedApplicationRecords,
      profileOverrideAppliedDeclarationRecords: appliedDeclarationRoster,
      profileOverrideUnappliedDeclarationRecords: unappliedDeclarationRecords,
      staticallyResolvedShowroomProfileOverrideReferences: showroomOverrideFiles.size,
      staticallyResolvedShowroomProfileOverrideReferenceFiles: sorted(showroomOverrideFiles),
      staticallyResolvedPotentialConsumers: potentialConsumerFiles['surface-profile-overrides'].size,
      staticallyResolvedPotentialConsumerFiles: sorted(potentialConsumerFiles['surface-profile-overrides']),
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

/**
 * Extract registry facts for a registry whose rows are PROJECTED from the
 * first-party roster instead of authored key by key.
 *
 * A direct-object-literal proof cannot read a projection, and weakening the
 * absence claim to "the text contains no `engine:`" would be a grep, not a
 * proof. The fail-closed shape proven here is exactly
 *
 *     Object.freeze(Object.fromEntries(
 *       ROSTER.map((entry) => [entry.slug, factory(entry)]),
 *     ))
 *
 * over an IMPORTED roster binding, with `factory` a same-module function whose
 * single return resolves to one authored object literal. That shape is what
 * lets one literal answer for every row: the map callback is total over the
 * roster, the key is the row's own slug, and no row can reach a different
 * literal. Field states therefore project per slug, and a field may be proven
 * absent, an authored literal, or a named roster field -- never inferred.
 *
 * Anything outside the shape (a spread, a second return, a computed key, a
 * write through the projected object, an unproven identity wrapper) resolves to
 * nothing and is reported as an unresolved entry.
 */
export function extractRosterProjectedRegistryFacts(text, fileName, options) {
  const { variableName, rosterName, slugs, fields } = options;
  const record = { path: fileName, kind: 'registry', text };
  const { checker, program, recordByFile } = typedRecordProgram([record]);
  const source = program.getSourceFiles().find((candidate) => recordByFile.has(candidate.fileName));
  if (!source) throw new Error(`${fileName}: cannot load roster-projected registry source`);

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
  const modifiers = ts.canHaveModifiers(selected.statement) ? ts.getModifiers(selected.statement) : undefined;
  const declaration = {
    line: sourceLine(source, selected.declaration),
    topLevel: true,
    exported: Boolean(modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)),
    evidenceKind: 'rosterProjectedFactoryLiteral',
    typeAnnotation,
    readonlyTypeAnnotation: /^Readonly\s*</.test(typeAnnotation ?? ''),
  };

  const unresolvedEntries = [];
  for (const duplicate of topLevel.slice(1)) {
    unresolvedEntries.push({
      line: sourceLine(source, duplicate.declaration),
      reason: `duplicate top-level ${variableName} declaration`,
    });
  }
  const reject = (node, reason) => {
    unresolvedEntries.push({ line: sourceLine(source, node), reason });
    unresolvedEntries.push(...registryCapabilityMutationFindings(text, fileName, variableName));
    return {
      facts: {},
      projection: null,
      unresolvedEntries: unresolvedEntries.sort((a, b) => a.line - b.line || a.reason.localeCompare(b.reason)),
      declaration,
    };
  };
  const SHAPE = `${variableName} initializer must be Object.freeze(Object.fromEntries(${rosterName}.map((entry) => [entry.slug, factory(entry)])))`;

  const isUnshadowedGlobal = (node, expected) => {
    const expression = unwrap(node);
    if (!expression || !ts.isIdentifier(expression) || expression.text !== expected) return false;
    const symbol = checker.getSymbolAtLocation(expression);
    return !symbol?.declarations?.some((candidate) => candidate.getSourceFile() === source);
  };
  const globalMemberCall = (node, owner, method, arity) => {
    const call = unwrap(node);
    if (!call || !ts.isCallExpression(call) || call.arguments.length !== arity) return null;
    const callee = unwrap(call.expression);
    if (!callee || !ts.isPropertyAccessExpression(callee) || callee.name.text !== method) return null;
    return isUnshadowedGlobal(callee.expression, owner) ? call : null;
  };
  const sameFileFunction = (node) => {
    const expression = unwrap(node);
    if (!expression || !ts.isIdentifier(expression)) return null;
    const declarations = checker.getSymbolAtLocation(expression)?.declarations ?? [];
    if (declarations.length !== 1) return null;
    const [candidate] = declarations;
    if (candidate.getSourceFile() !== source) return null;
    return ts.isFunctionDeclaration(candidate) && candidate.body ? candidate : null;
  };

  const frozen = globalMemberCall(selected.declaration.initializer, 'Object', 'freeze', 1);
  if (!frozen) return reject(selected.declaration, SHAPE);
  const fromEntries = globalMemberCall(frozen.arguments[0], 'Object', 'fromEntries', 1);
  if (!fromEntries) return reject(selected.declaration, SHAPE);
  const mapCall = unwrap(fromEntries.arguments[0]);
  if (!mapCall || !ts.isCallExpression(mapCall) || mapCall.arguments.length !== 1) {
    return reject(selected.declaration, SHAPE);
  }
  const mapCallee = unwrap(mapCall.expression);
  if (!mapCallee || !ts.isPropertyAccessExpression(mapCallee) || mapCallee.name.text !== 'map') {
    return reject(selected.declaration, SHAPE);
  }
  const rosterReference = unwrap(mapCallee.expression);
  if (!rosterReference || !ts.isIdentifier(rosterReference) || rosterReference.text !== rosterName) {
    return reject(selected.declaration, SHAPE);
  }
  const rosterDeclarations = checker.getSymbolAtLocation(rosterReference)?.declarations ?? [];
  const rosterImport = rosterDeclarations.length === 1 && ts.isImportSpecifier(rosterDeclarations[0])
    ? rosterDeclarations[0]
    : null;
  const rosterModuleSpecifier = rosterImport
    ? unwrap(rosterImport.parent.parent.parent.moduleSpecifier)
    : null;
  if (!rosterModuleSpecifier || !ts.isStringLiteralLike(rosterModuleSpecifier)) {
    return reject(rosterReference, `${rosterName} must resolve to a single imported roster binding`);
  }

  const callback = unwrap(mapCall.arguments[0]);
  if (
    !callback || !(ts.isArrowFunction(callback) || ts.isFunctionExpression(callback)) ||
    callback.parameters.length !== 1
  ) {
    return reject(selected.declaration, SHAPE);
  }
  const parameter = callback.parameters[0];
  if (!ts.isIdentifier(parameter.name) || parameter.dotDotDotToken || parameter.initializer) {
    return reject(parameter, `${variableName} projection callback must take one plain roster row parameter`);
  }
  const rowSymbol = checker.getSymbolAtLocation(parameter.name);
  const isRowReference = (node) => {
    const expression = unwrap(node);
    return Boolean(expression && ts.isIdentifier(expression) && checker.getSymbolAtLocation(expression) === rowSymbol);
  };

  let pair = unwrap(callback.body);
  if (pair && ts.isBlock(pair)) {
    const [only] = pair.statements;
    if (pair.statements.length !== 1 || !only || !ts.isReturnStatement(only) || !only.expression) {
      return reject(callback, `${variableName} projection callback must be a single returned pair`);
    }
    pair = unwrap(only.expression);
  }
  if (
    !pair || !ts.isArrayLiteralExpression(pair) || pair.elements.length !== 2 ||
    pair.elements.some((element) => ts.isSpreadElement(element))
  ) {
    return reject(callback, SHAPE);
  }
  const keyExpression = unwrap(pair.elements[0]);
  if (
    !keyExpression || !ts.isPropertyAccessExpression(keyExpression) ||
    keyExpression.name.text !== 'slug' || !isRowReference(keyExpression.expression)
  ) {
    return reject(pair.elements[0], `${variableName} projection key must be the roster row slug`);
  }
  const factoryCall = unwrap(pair.elements[1]);
  if (
    !factoryCall || !ts.isCallExpression(factoryCall) || factoryCall.arguments.length !== 1 ||
    !isRowReference(factoryCall.arguments[0])
  ) {
    return reject(pair.elements[1], `${variableName} projection value must be a same-module factory called with the roster row`);
  }
  const factory = sameFileFunction(factoryCall.expression);
  const factoryName = ts.isIdentifier(unwrap(factoryCall.expression) ?? factoryCall)
    ? unwrap(factoryCall.expression).text
    : '<computed>';
  if (!factory || factory.parameters.length !== 1 || !ts.isIdentifier(factory.parameters[0].name)) {
    return reject(factoryCall, `${factoryName} must be a same-module factory declaration taking one named roster row`);
  }
  // Inside the factory the roster row is the FACTORY's parameter, not the map
  // callback's: the call above proves the two are the same row, and the factory
  // may legitimately name its parameter anything.
  const factoryRowSymbol = checker.getSymbolAtLocation(factory.parameters[0].name);
  const isFactoryRowReference = (node) => {
    const expression = unwrap(node);
    return Boolean(
      expression && ts.isIdentifier(expression) &&
      checker.getSymbolAtLocation(expression) === factoryRowSymbol,
    );
  };

  const collectReturns = (fn) => {
    const returns = [];
    (function walk(node) {
      if (node !== fn.body && ts.isFunctionLike(node)) return;
      if (ts.isReturnStatement(node)) returns.push(node);
      ts.forEachChild(node, walk);
    })(fn.body);
    return returns;
  };
  const factoryReturns = collectReturns(factory);
  if (factoryReturns.length !== 1 || !factoryReturns[0].expression) {
    return reject(factory, `${factoryName} must project exactly one returned value`);
  }

  // An identity wrapper (a hardening `deepFreeze`) may sit between the authored
  // literal and the return, but only when it provably returns the SAME object
  // it received and never writes a key through it. `Object.assign(value, ...)`
  // is not an identity wrapper, and neither is anything that hands the
  // parameter to an unproven call.
  const PROVEN_PARAMETER_READS = new Set([
    'Object.entries', 'Object.freeze', 'Object.isFrozen', 'Object.keys',
    'Object.getOwnPropertyNames', 'Object.values',
  ]);
  const globalMemberName = (node) => {
    const callee = unwrap(node);
    if (!callee || !ts.isPropertyAccessExpression(callee)) return null;
    for (const owner of ['Object', 'Reflect', 'JSON']) {
      if (isUnshadowedGlobal(callee.expression, owner)) return `${owner}.${callee.name.text}`;
    }
    return null;
  };
  const identityWrapperReason = (fn, name) => {
    if (fn.parameters.length !== 1 || !ts.isIdentifier(fn.parameters[0].name)) {
      return `${name} is not a single-parameter identity wrapper`;
    }
    const wrappedSymbol = checker.getSymbolAtLocation(fn.parameters[0].name);
    const isWrapped = (node) => {
      const expression = unwrap(node);
      return Boolean(
        expression && ts.isIdentifier(expression) &&
        checker.getSymbolAtLocation(expression) === wrappedSymbol,
      );
    };
    const rootedAtWrapped = (node) => {
      let expression = unwrap(node);
      while (expression && (ts.isPropertyAccessExpression(expression) || ts.isElementAccessExpression(expression))) {
        expression = unwrap(expression.expression);
      }
      return Boolean(expression && isWrapped(expression));
    };
    const returnsIdentity = (node) => {
      const expression = unwrap(node);
      if (!expression) return false;
      if (isWrapped(expression)) return true;
      if (ts.isConditionalExpression(expression)) {
        return returnsIdentity(expression.whenTrue) && returnsIdentity(expression.whenFalse);
      }
      const member = ts.isCallExpression(expression) ? globalMemberName(expression.expression) : null;
      if (member === 'Object.freeze' && expression.arguments.length === 1) {
        return returnsIdentity(expression.arguments[0]);
      }
      return false;
    };
    let reason = null;
    (function walk(node) {
      if (reason) return;
      if (
        ts.isBinaryExpression(node) &&
        node.operatorToken.kind >= ts.SyntaxKind.FirstAssignment &&
        node.operatorToken.kind <= ts.SyntaxKind.LastAssignment &&
        rootedAtWrapped(node.left)
      ) {
        reason = `${name} writes through the wrapped projection`;
      } else if (ts.isDeleteExpression(node) && rootedAtWrapped(node.expression)) {
        reason = `${name} deletes through the wrapped projection`;
      } else if (ts.isCallExpression(node) || ts.isNewExpression(node)) {
        const member = ts.isCallExpression(node) ? globalMemberName(node.expression) : null;
        for (const argument of node.arguments ?? []) {
          if (!isWrapped(argument)) continue;
          if (!member || !PROVEN_PARAMETER_READS.has(member)) {
            reason = `${name} passes the wrapped projection to an unproven call`;
          }
        }
        if (!reason && ts.isCallExpression(node) && !member && rootedAtWrapped(node.expression)) {
          reason = `${name} invokes an unproven method on the wrapped projection`;
        }
      }
      ts.forEachChild(node, walk);
    })(fn.body);
    if (reason) return reason;
    const wrapperReturns = collectReturns(fn);
    if (wrapperReturns.length === 0) return `${name} never returns the wrapped projection`;
    for (const statement of wrapperReturns) {
      if (!statement.expression || !returnsIdentity(statement.expression)) {
        return `${name} has a return path that is not the wrapped projection`;
      }
    }
    return null;
  };

  const wrappers = [];
  const resolveAuthoredLiteral = (node, depth = 0) => {
    const expression = unwrap(node);
    if (!expression || depth > 4) return { literal: null, reason: `${factoryName} projection is not a resolvable authored literal` };
    if (ts.isObjectLiteralExpression(expression)) return { literal: expression, reason: null };
    if (ts.isIdentifier(expression)) {
      const declarations = checker.getSymbolAtLocation(expression)?.declarations ?? [];
      if (declarations.length !== 1) {
        return { literal: null, reason: `${factoryName} projection binding ${expression.text} is not uniquely declared` };
      }
      const [binding] = declarations;
      if (
        !ts.isVariableDeclaration(binding) || !binding.initializer ||
        !(binding.parent.flags & ts.NodeFlags.Const) ||
        !(binding.getStart(source) >= factory.body.getStart(source) && binding.getEnd() <= factory.body.getEnd())
      ) {
        return { literal: null, reason: `${factoryName} projection binding ${expression.text} is not a local const literal` };
      }
      const mutation = localProjectionMutationReason(binding, expression.text);
      if (mutation) return { literal: null, reason: mutation };
      return resolveAuthoredLiteral(binding.initializer, depth + 1);
    }
    if (ts.isCallExpression(expression) && expression.arguments.length === 1) {
      const wrapper = sameFileFunction(expression.expression);
      const wrapperName = ts.isIdentifier(unwrap(expression.expression) ?? expression)
        ? unwrap(expression.expression).text
        : '<computed>';
      if (!wrapper) {
        return { literal: null, reason: `${factoryName} projection wrapper ${wrapperName} is not a same-module declaration` };
      }
      const reason = identityWrapperReason(wrapper, wrapperName);
      if (reason) return { literal: null, reason };
      wrappers.push({ name: wrapperName, line: sourceLine(source, wrapper) });
      return resolveAuthoredLiteral(expression.arguments[0], depth + 1);
    }
    return { literal: null, reason: `${factoryName} projection is not a resolvable authored literal` };
  };

  // The projected object is immutable in the factory too: the only use of it
  // beyond the return that cannot widen its keys is a weak-collection key,
  // which is exactly how the governed-behavior side table is keyed by identity.
  function localProjectionMutationReason(binding, name) {
    const localSymbol = checker.getSymbolAtLocation(binding.name);
    const isLocal = (node) => {
      const expression = unwrap(node);
      return Boolean(
        expression && ts.isIdentifier(expression) && checker.getSymbolAtLocation(expression) === localSymbol,
      );
    };
    const rootedAtLocal = (node) => {
      let expression = unwrap(node);
      while (expression && (ts.isPropertyAccessExpression(expression) || ts.isElementAccessExpression(expression))) {
        expression = unwrap(expression.expression);
      }
      return Boolean(expression && isLocal(expression));
    };
    const weakKeyMethods = new Set(['add', 'delete', 'get', 'has', 'set']);
    const isWeakCollectionKey = (call, index) => {
      if (index !== 0) return false;
      const callee = unwrap(call.expression);
      if (!callee || !ts.isPropertyAccessExpression(callee) || !weakKeyMethods.has(callee.name.text)) return false;
      const owner = checker.getTypeAtLocation(callee.expression).getSymbol()?.getName() ?? '';
      return owner === 'WeakMap' || owner === 'WeakSet';
    };
    let reason = null;
    (function walk(node) {
      if (reason) return;
      if (
        ts.isBinaryExpression(node) &&
        node.operatorToken.kind >= ts.SyntaxKind.FirstAssignment &&
        node.operatorToken.kind <= ts.SyntaxKind.LastAssignment &&
        node !== binding && rootedAtLocal(node.left)
      ) {
        reason = `${factoryName} writes through the projected ${name}`;
      } else if (ts.isDeleteExpression(node) && rootedAtLocal(node.expression)) {
        reason = `${factoryName} deletes through the projected ${name}`;
      } else if (
        (ts.isPrefixUnaryExpression(node) || ts.isPostfixUnaryExpression(node)) &&
        [ts.SyntaxKind.PlusPlusToken, ts.SyntaxKind.MinusMinusToken].includes(node.operator) &&
        rootedAtLocal(node.operand)
      ) {
        reason = `${factoryName} updates through the projected ${name}`;
      } else if (ts.isCallExpression(node) || ts.isNewExpression(node)) {
        (node.arguments ?? []).forEach((argument, index) => {
          if (reason || !isLocal(argument)) return;
          if (!(ts.isCallExpression(node) && isWeakCollectionKey(node, index))) {
            reason = `${factoryName} passes the projected ${name} to an unproven call`;
          }
        });
      }
      ts.forEachChild(node, walk);
    })(factory.body);
    return reason;
  }

  const resolved = resolveAuthoredLiteral(factoryReturns[0].expression);
  if (!resolved.literal) return reject(factoryReturns[0], resolved.reason);

  const directPropertyName = (name) =>
    name && (ts.isIdentifier(name) || ts.isStringLiteralLike(name)) ? name.text : null;
  for (const member of resolved.literal.properties) {
    if (ts.isSpreadAssignment(member)) {
      unresolvedEntries.push({
        line: sourceLine(source, member),
        reason: `${factoryName} projection literal contains a spread`,
      });
    } else if (!directPropertyName(member.name)) {
      unresolvedEntries.push({
        line: sourceLine(source, member),
        reason: `${factoryName} projection literal contains a computed key`,
      });
    }
  }
  const projected = {};
  for (const field of fields) {
    const matching = resolved.literal.properties.filter((member) =>
      !ts.isSpreadAssignment(member) && directPropertyName(member.name) === field);
    if (matching.length === 0) {
      projected[field] = { kind: 'absent' };
      continue;
    }
    if (matching.length !== 1 || !ts.isPropertyAssignment(matching[0])) {
      projected[field] = { kind: 'nonLiteral', reason: `ambiguous/non-data ${field} property` };
      unresolvedEntries.push({
        line: sourceLine(source, matching[0]),
        reason: `${factoryName} projection ${field} is not a unique data property`,
      });
      continue;
    }
    const initializer = unwrap(matching[0].initializer);
    if (initializer && ts.isPropertyAccessExpression(initializer) && isFactoryRowReference(initializer.expression)) {
      projected[field] = { kind: 'rosterField', field: initializer.name.text };
      continue;
    }
    const state = literalState(matching[0].initializer);
    projected[field] = state;
    if (state.kind !== 'literal') {
      unresolvedEntries.push({
        line: sourceLine(source, matching[0]),
        reason: `${factoryName} projection ${field} is neither an authored literal nor a roster field`,
      });
    }
  }

  const facts = {};
  for (const slug of slugs) {
    facts[slug] = Object.fromEntries(fields.map((field) => [field, projected[field]]));
  }
  unresolvedEntries.push(...registryCapabilityMutationFindings(text, fileName, variableName));

  return {
    facts,
    projection: {
      rosterName,
      rosterModule: rosterModuleSpecifier.text,
      keySource: 'roster row slug',
      factory: { name: factoryName, line: sourceLine(source, factory) },
      wrappers,
      literalLine: sourceLine(source, resolved.literal),
      projectedSlugs: [...slugs],
    },
    unresolvedEntries: unresolvedEntries.sort((a, b) => a.line - b.line || a.reason.localeCompare(b.reason)),
    declaration,
  };
}

/*
 * Transitive canonical-forwarder proof (B-1).
 *
 * The former hardcoded Box/Stack/Text module-suffix map is gone. A JSX tag is
 * accepted as a canonical forwarder only when BOTH conjuncts hold:
 *
 *   1. the tag's local binding is a value import from a canonical DS module
 *      boundary (package public barrel, UI tier/category/family module, family
 *      engines/<engine> module, or a generated icon role module); and
 *   2. that export transitively proves that a caller-supplied `data-part`
 *      reaches a rendered element, descending every engine of an
 *      engine-switched component.
 *
 * A family reaches its engines through one of two switches, and both are
 * descended per engine. The lazy factory carries an inline
 * `{ engine: () => import('./engines/<engine>') }` literal and is recognised by
 * that shape. The synchronous factory carries a named implementation record and
 * has no self-identifying shape, so it is recognised by a pin instead: the
 * callee must resolve to the owning declaration, that declaration must still
 * carry the caller's part to its own render root, and the record must be TOTAL
 * over the implemented roster.
 *
 * Forwarding evidence terminates at the render root the carrier is spread onto.
 * An intrinsic DOM element is the strong terminal. A render root that provably
 * originates in a third-party package (a bare specifier this package cannot
 * resolve into `<root>/src/`) is the weaker terminal: the pass-through inside
 * that library is not observable from here, so the accepting mechanism records
 * the exact specifier (`rest-spread-external-root: antd`) instead of claiming a
 * DOM proof. This terminal is required, not a convenience — the Classic engine
 * of Box, Stack and Text renders through Ant Design, and the reconciled plan
 * mandates that those three be re-derived by this proof with no grandfathering.
 * Relative, `@/` and `@rottay/design-system` roots are in-package and are never
 * trusted this way; they must prove.
 *
 * Reaching a render root is necessary but not sufficient: the caller's part must
 * still SURVIVE there, and the bag that reaches the root must still CONTAIN it.
 * Four negations and one extra terminal enforce that, because without them a
 * spread that is immediately overwritten — or one the part was taken out of —
 * reads as forwarding.
 *   C1 An override written AFTER the carrier on the same element defeats the
 *      evidence; the same override written BEFORE it does not, because JSX
 *      resolves duplicate props last-wins. `Tag` is the living
 *      literal-before-spread counterexample that stays proven.
 *   C2 A pinned canonical helper called for effect with a part that is not the
 *      caller's re-stamps the root on every commit, so that engine cannot
 *      forward at all — the whole component is unproven, not one branch.
 *   C3 Aggregate proofs carry each member's own terminal, so a weaker
 *      external-root proof is never laundered into a bare engine list.
 *   C4 A rest bag whose pattern destructured `data-part` out no longer carries
 *      the part: spreading it forwards everything else and drops the anatomy,
 *      so it proves nothing until the part is re-attached from its own carrier.
 *      Aliasing the stripped bag does not launder the strip.
 *   C5 The mirror of C2: a pinned helper called for effect WITH the caller's
 *      part is a terminal in its own right, `imperative-part-forward`. It is
 *      the only mechanism available to an engine whose render root belongs to a
 *      third-party library (Button classic under Ant Design), and it is weaker
 *      than an attribute terminal — the node identity comes from the ref/effect
 *      wiring rather than from a proof — so it is reached only after every
 *      attribute path has failed and it never borrows an attribute's name.
 *
 * Every step is depth-bounded, cycle-guarded and fail-closed: an unreadable
 * module, an unresolvable export, a non-static engine map, or a component with
 * no forwarding evidence yields no proof, so the sink falls to the unresolved
 * channel with the tag recorded. The mechanism that produced the proof is
 * recorded as provenance, never hidden.
 */
const UI_TIER_SEGMENTS = ['primitives', 'patterns', 'structures', 'surfaces'];
const CANONICAL_ENGINE_NAMES = IMPLEMENTED_ENGINE_NAMES;
const FORWARDER_MAX_DEPTH = 16;
const FORWARDER_MAX_CARRIER_PASSES = 8;

/**
 * Canonical data-part stamping mechanisms, pinned by the module that owns the
 * declaration rather than by the imported name. `partAttributes` carries the
 * part in argument 0; `stampDataPart` carries it in argument 1.
 */
const PINNED_STAMP_HELPERS = {
  stampDataPart: {
    ownerModule: '/src/infrastructure/runtime/dom/foundation/data-part',
    partArgumentIndex: 1,
  },
  partAttributes: {
    ownerModule: '/src/foundation/behavior/kernel/anatomy',
    partArgumentIndex: 0,
  },
};

/**
 * The synchronous engine-switch factory, pinned by the module that owns the
 * declaration rather than by the imported name. It is the non-suspending
 * sibling of the lazy `() => import()` map: the switch reaches the same
 * per-engine implementations, so it proves the same thing, but the record is a
 * named const rather than an inline literal and the call carries no shape a
 * reader could recognise on its own.
 *
 * The pin is therefore stricter than the lazy path in two ways: the callee must
 * resolve to THIS module's declaration, and the record must be TOTAL over the
 * implemented roster. A record short of the roster, carrying a foreign key, or
 * declaring an absence (`null`) proves nothing.
 */
const PINNED_ENGINE_SWITCH_FACTORIES = {
  createSyncEngineComponent: {
    ownerModule: '/src/infrastructure/runtime/engines/presentation/component-factory/sync',
    implementationsArgumentIndex: 1,
  },
};

/**
 * The factory's OWN forwarding obligation, checked once at the pin: the
 * caller's part-carrying bag must still reach the render root, leaving the
 * switched tag as the single unproven step the call site then supplies. A
 * factory that strips `data-part` out of its rest bag, or overrides it at the
 * root, defeats the root instead and stops matching — so the pin refuses and
 * every family that switches through it falls to the unresolved channel.
 */
const SYNC_ENGINE_FACTORY_TAG_GAP =
  /^factory-return-unproven\[no-forwarding-evidence\[root-drops-part:spread-tag:/;

const ANALYSIS_PACKAGE_ROOT = findPackageRoot(dirname(fileURLToPath(import.meta.url))).replaceAll('\\', '/');

function moduleFileCandidates(base) {
  return [`${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`];
}

/**
 * Default module reader. Maps a workspace-relative module base onto disk using
 * the package root this analyzer itself lives in, and refuses to read anything
 * outside that package.
 */
function createSourceModuleReader(workspacePackageRoot) {
  if (!workspacePackageRoot || !ANALYSIS_PACKAGE_ROOT.endsWith(workspacePackageRoot)) return null;
  const cache = new Map();
  return (base) => {
    if (cache.has(base)) return cache.get(base);
    let record = null;
    if (base.startsWith(`${workspacePackageRoot}/src/`)) {
      const relative = base.slice(workspacePackageRoot.length);
      for (const candidate of moduleFileCandidates(relative)) {
        const absolute = `${ANALYSIS_PACKAGE_ROOT}${candidate}`;
        if (existsSync(absolute) && statSync(absolute).isFile()) {
          record = { path: `${workspacePackageRoot}${candidate}`, text: readFileSync(absolute, 'utf8') };
          break;
        }
      }
    }
    cache.set(base, record);
    return record;
  };
}

function valueBinding(bindings, name) {
  const entries = (bindings.get(name) ?? []).filter((entry) => !entry.typeOnly);
  return entries.length === 1 ? entries[0] : null;
}

function staticPropertyName(name) {
  if (!name) return null;
  if (ts.isIdentifier(name) || ts.isStringLiteralLike(name)) return name.text;
  return null;
}

/** Value-export table for one module: local values, aliases, re-exports, stars. */
function moduleExportTable(source) {
  const named = new Map();
  const stars = [];
  for (const statement of source.statements) {
    if (ts.isExportDeclaration(statement)) {
      if (statement.isTypeOnly) continue;
      const specifier = statement.moduleSpecifier;
      const from = specifier && ts.isStringLiteralLike(specifier) ? specifier.text : null;
      if (!statement.exportClause) {
        if (from) stars.push(from);
        continue;
      }
      if (!ts.isNamedExports(statement.exportClause)) continue;
      for (const element of statement.exportClause.elements) {
        if (element.isTypeOnly) continue;
        const imported = element.propertyName?.text ?? element.name.text;
        named.set(
          element.name.text,
          from ? { kind: 'reexport', from, imported } : { kind: 'local-name', localName: imported },
        );
      }
      continue;
    }
    if (ts.isExportAssignment(statement)) {
      if (!statement.isExportEquals) named.set('default', { kind: 'value', node: statement.expression });
      continue;
    }
    const modifiers = ts.canHaveModifiers(statement) ? ts.getModifiers(statement) : undefined;
    if (!modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)) continue;
    const isDefault = modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword);
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name) && declaration.initializer) {
          named.set(declaration.name.text, { kind: 'value', node: declaration.initializer });
        }
      }
      continue;
    }
    if (ts.isFunctionDeclaration(statement)) {
      if (isDefault) named.set('default', { kind: 'value', node: statement });
      if (statement.name) named.set(statement.name.text, { kind: 'value', node: statement });
    }
  }
  return { named, stars };
}

function createForwarderProver({ workspacePackageRoot, readModule }) {
  const modules = new Map();
  const componentMemo = new Map();
  const componentActive = new Set();

  function loadModule(base) {
    if (modules.has(base)) return modules.get(base);
    let record = null;
    const file = readModule ? readModule(base) : null;
    if (file) {
      try {
        const source = parseSource(file.text, file.path);
        record = {
          path: file.path,
          dir: posix.dirname(file.path),
          source,
          bindings: buildBindings(source),
          exports: moduleExportTable(source),
        };
      } catch {
        record = null;
      }
    }
    modules.set(base, record);
    return record;
  }

  function resolveSpecifier(fromDir, specifier) {
    if (!specifier) return null;
    if (specifier.startsWith('.')) {
      return posix.normalize(posix.join(fromDir, specifier)).replace(/\.(?:ts|tsx|mts|cts)$/, '');
    }
    if (specifier.startsWith('@/')) return `${workspacePackageRoot}/src/${specifier.slice(2)}`;
    if (specifier === '@rottay/design-system') return `${workspacePackageRoot}/src/index`;
    return null;
  }

  function importedModule(module, importSource) {
    const base = resolveSpecifier(module.dir, importSource ?? '');
    return base ? loadModule(base) : null;
  }

  function resolveValueDeclaration(module, name, depth) {
    if (depth > FORWARDER_MAX_DEPTH) return null;
    const binding = valueBinding(module.bindings, name);
    if (!binding) return null;
    if (binding.kind === 'variable' && binding.initializer) return { module, node: binding.initializer };
    if (binding.kind === 'function') return { module, node: binding.declaration };
    if (binding.kind === 'import' || binding.kind === 'default-import') {
      const target = importedModule(module, binding.importSource);
      if (!target) return null;
      const exportName = binding.kind === 'default-import' ? 'default' : binding.importedName;
      return resolveExportValue(target, exportName, depth + 1);
    }
    return null;
  }

  function resolveExportValue(module, name, depth) {
    if (depth > FORWARDER_MAX_DEPTH) return null;
    const record = module.exports.named.get(name);
    if (record) {
      if (record.kind === 'value') return { module, node: record.node };
      if (record.kind === 'local-name') return resolveValueDeclaration(module, record.localName, depth + 1);
      if (record.kind === 'reexport') {
        const target = importedModule(module, record.from);
        return target ? resolveExportValue(target, record.imported, depth + 1) : null;
      }
    }
    for (const star of module.exports.stars) {
      const target = importedModule(module, star);
      const found = target ? resolveExportValue(target, name, depth + 1) : null;
      if (found) return found;
    }
    return null;
  }

  function constObjectMember(module, objectNode, member) {
    const literal = unwrap(objectNode);
    if (!literal || !ts.isObjectLiteralExpression(literal)) return null;
    for (const property of literal.properties) {
      if (!ts.isPropertyAssignment(property)) continue;
      if (staticPropertyName(property.name) === member) return property.initializer;
    }
    return null;
  }

  function intrinsicTagName(module, node, depth, seen = new Set()) {
    if (depth > FORWARDER_MAX_DEPTH) return null;
    const expression = unwrap(node);
    if (!expression || seen.has(expression)) return null;
    const nextSeen = new Set(seen).add(expression);
    if (ts.isStringLiteralLike(expression)) {
      return /^[a-z][a-z0-9-]*$/.test(expression.text) ? expression.text : null;
    }
    if (ts.isIdentifier(expression)) {
      const binding = valueBinding(module.bindings, expression.text);
      if (binding && ['parameter', 'variable'].includes(binding.kind) && binding.initializer) {
        return intrinsicTagName(module, binding.initializer, depth + 1, nextSeen);
      }
      const resolved = resolveValueDeclaration(module, expression.text, depth + 1);
      return resolved ? intrinsicTagName(resolved.module, resolved.node, depth + 1, nextSeen) : null;
    }
    if (ts.isPropertyAccessExpression(expression)) {
      const owner = unwrap(expression.expression);
      if (!owner || !ts.isIdentifier(owner)) return null;
      const resolved = resolveValueDeclaration(module, owner.text, depth + 1);
      if (!resolved) return null;
      const member = constObjectMember(resolved.module, resolved.node, expression.name.text);
      return member ? intrinsicTagName(resolved.module, member, depth + 1, nextSeen) : null;
    }
    return null;
  }

  /** Resolve a pinned stamping helper import to its owning declaration module. */
  function resolveHelperPin(fromDir, importSource, importedName) {
    const pin = PINNED_STAMP_HELPERS[importedName];
    if (!pin) return null;
    const base = resolveSpecifier(fromDir, importSource ?? '');
    const target = base ? loadModule(base) : null;
    const resolved = target ? resolveExportValue(target, importedName, 0) : null;
    if (!resolved) return null;
    const owner = resolved.module.path.replace(/\.(?:ts|tsx)$/, '').replace(/\/index$/, '');
    if (!owner.endsWith(pin.ownerModule)) return null;
    return {
      mechanism: importedName,
      partArgumentIndex: pin.partArgumentIndex,
      ownerModule: owner,
    };
  }

  function pinnedHelperCall(module, node) {
    const call = unwrap(node);
    if (!call || !ts.isCallExpression(call)) return null;
    const callee = unwrap(call.expression);
    if (!callee || !ts.isIdentifier(callee)) return null;
    const binding = valueBinding(module.bindings, callee.text);
    if (binding?.kind !== 'import') return null;
    return resolveHelperPin(module.dir, binding.importSource, binding.importedName);
  }

  /**
   * Resolve a pinned engine-switch factory import to its owning declaration,
   * then hold that declaration to its own forwarding obligation before the
   * switch it performs may be trusted.
   */
  function resolveEngineSwitchFactoryPin(module, callee, depth) {
    const binding = valueBinding(module.bindings, callee.text);
    if (binding?.kind !== 'import') return null;
    const pin = PINNED_ENGINE_SWITCH_FACTORIES[binding.importedName];
    if (!pin) return null;
    const base = resolveSpecifier(module.dir, binding.importSource ?? '');
    const target = base ? loadModule(base) : null;
    const resolved = target ? resolveExportValue(target, binding.importedName, depth + 1) : null;
    if (!resolved) return null;
    const owner = resolved.module.path.replace(/\.(?:ts|tsx)$/, '').replace(/\/index$/, '');
    if (!owner.endsWith(pin.ownerModule)) return null;
    const declaration = unwrap(resolved.node);
    if (
      !declaration || !(ts.isFunctionDeclaration(declaration) || ts.isFunctionExpression(declaration) ||
        ts.isArrowFunction(declaration))
    ) {
      return null;
    }
    const forwarding = proveFactoryReturn(resolved.module, declaration, depth + 1);
    if (!forwarding.proven && !SYNC_ENGINE_FACTORY_TAG_GAP.test(forwarding.reason)) return null;
    return { ...pin, ownerModule: owner };
  }

  /**
   * `createSyncEngineComponent(name, implementations)`. The record must be a
   * static object literal — inline or a resolvable const — that is TOTAL over
   * the implemented roster; every value is then proven as a component in its
   * own right, so each engine's terminal stays visible (C3).
   */
  function syncEngineSwitchImplementations(module, call, depth) {
    const callee = unwrap(call.expression);
    if (!callee || !ts.isIdentifier(callee)) return null;
    const pin = resolveEngineSwitchFactoryPin(module, callee, depth);
    if (!pin) return null;
    const argument = call.arguments[pin.implementationsArgumentIndex];
    const record = argument ? unwrap(argument) : null;
    if (!record) return null;
    let owner = module;
    let literal = record;
    if (ts.isIdentifier(record)) {
      const resolved = resolveValueDeclaration(module, record.text, depth + 1);
      if (!resolved) return null;
      owner = resolved.module;
      literal = unwrap(resolved.node);
    }
    if (!literal || !ts.isObjectLiteralExpression(literal)) return null;
    const entries = [];
    for (const property of literal.properties) {
      if (!ts.isPropertyAssignment(property)) return null;
      const engine = staticPropertyName(property.name);
      if (!engine || !CANONICAL_ENGINE_NAMES.includes(engine)) return null;
      entries.push({ engine, node: property.initializer });
    }
    const covered = new Set(entries.map((entry) => entry.engine));
    if (covered.size !== entries.length) return null;
    if (!CANONICAL_ENGINE_NAMES.every((engine) => covered.has(engine))) return null;
    return { module: owner, entries };
  }

  function referencesCarrier(node, carriers, seen = new Set()) {
    const expression = unwrap(node);
    if (!expression || seen.has(expression)) return false;
    const nextSeen = new Set(seen).add(expression);
    if (ts.isIdentifier(expression)) return carriers.has(expression.text);
    if (ts.isObjectLiteralExpression(expression)) {
      return expression.properties.some(
        (property) => ts.isSpreadAssignment(property) && referencesCarrier(property.expression, carriers, nextSeen),
      );
    }
    if (ts.isConditionalExpression(expression)) {
      return referencesCarrier(expression.whenTrue, carriers, nextSeen) &&
        referencesCarrier(expression.whenFalse, carriers, nextSeen);
    }
    return false;
  }

  function referencesPartCarrier(node, partCarriers, carriers, seen = new Set()) {
    const expression = unwrap(node);
    if (!expression || seen.has(expression)) return false;
    const nextSeen = new Set(seen).add(expression);
    if (ts.isIdentifier(expression)) return partCarriers.has(expression.text);
    if (
      ts.isBinaryExpression(expression) &&
      [ts.SyntaxKind.QuestionQuestionToken, ts.SyntaxKind.BarBarToken].includes(expression.operatorToken.kind)
    ) {
      return referencesPartCarrier(expression.left, partCarriers, carriers, nextSeen);
    }
    if (ts.isConditionalExpression(expression)) {
      return referencesPartCarrier(expression.whenTrue, partCarriers, carriers, nextSeen) &&
        referencesPartCarrier(expression.whenFalse, partCarriers, carriers, nextSeen);
    }
    if (ts.isElementAccessExpression(expression)) {
      const owner = unwrap(expression.expression);
      const argument = unwrap(expression.argumentExpression);
      return Boolean(
        owner && ts.isIdentifier(owner) && carriers.has(owner.text) &&
        argument && ts.isStringLiteralLike(argument) && argument.text === 'data-part',
      );
    }
    return false;
  }

  function isReactCreateElement(module, callee) {
    if (!callee) return false;
    if (ts.isPropertyAccessExpression(callee)) {
      if (callee.name.text !== 'createElement') return false;
      const owner = unwrap(callee.expression);
      if (!owner || !ts.isIdentifier(owner)) return false;
      const binding = valueBinding(module.bindings, owner.text);
      return Boolean(
        binding && binding.importSource === 'react' &&
        ['default-import', 'namespace-import'].includes(binding.kind),
      );
    }
    if (!ts.isIdentifier(callee)) return false;
    const binding = valueBinding(module.bindings, callee.text);
    return binding?.kind === 'import' && binding.importSource === 'react' && binding.importedName === 'createElement';
  }

  /** Does this object pattern pull `data-part` out of the object it destructures? */
  function patternExtractsPart(pattern) {
    return pattern.elements.some((element) => (
      ts.isBindingElement(element) && !element.dotDotDotToken &&
      (staticPropertyName(element.propertyName) ?? (ts.isIdentifier(element.name) ? element.name.text : null)) === 'data-part'
    ));
  }

  function collectCarriers(fn) {
    const carriers = new Set();
    const partCarriers = new Set();
    const strippedCarriers = new Set();
    const parameter = fn.parameters?.[0];
    if (!parameter) return { carriers, partCarriers, strippedCarriers };
    if (ts.isIdentifier(parameter.name)) {
      carriers.add(parameter.name.text);
      return { carriers, partCarriers, strippedCarriers };
    }
    if (!ts.isObjectBindingPattern(parameter.name)) return { carriers, partCarriers, strippedCarriers };
    const stripsPart = patternExtractsPart(parameter.name);
    for (const element of parameter.name.elements) {
      if (!ts.isBindingElement(element) || !ts.isIdentifier(element.name)) continue;
      if (element.dotDotDotToken) {
        carriers.add(element.name.text);
        if (stripsPart) strippedCarriers.add(element.name.text);
        continue;
      }
      const key = staticPropertyName(element.propertyName) ?? element.name.text;
      if (key === 'data-part') partCarriers.add(element.name.text);
    }
    return { carriers, partCarriers, strippedCarriers };
  }

  function expandCarriers(fn, carriers, partCarriers, strippedCarriers, carrierInitializers) {
    const declarations = [];
    (function collect(node) {
      if (ts.isVariableDeclaration(node)) declarations.push(node);
      ts.forEachChild(node, collect);
    })(fn);
    for (let pass = 0; pass < FORWARDER_MAX_CARRIER_PASSES; pass += 1) {
      let changed = false;
      for (const declaration of declarations) {
        if (!declaration.initializer) continue;
        if (ts.isObjectBindingPattern(declaration.name)) {
          const initializer = unwrap(declaration.initializer);
          if (!initializer || !ts.isIdentifier(initializer) || !carriers.has(initializer.text)) continue;
          // C4. A rest binding inherits the part only when neither this pattern
          // nor the object it destructures has already taken it away.
          const stripsPart = patternExtractsPart(declaration.name) || strippedCarriers.has(initializer.text);
          for (const element of declaration.name.elements) {
            if (!ts.isBindingElement(element) || !ts.isIdentifier(element.name)) continue;
            if (element.dotDotDotToken) {
              if (!carriers.has(element.name.text)) {
                carriers.add(element.name.text);
                changed = true;
              }
              if (stripsPart && !strippedCarriers.has(element.name.text)) {
                strippedCarriers.add(element.name.text);
                changed = true;
              }
              continue;
            }
            const key = staticPropertyName(element.propertyName) ?? element.name.text;
            if (key === 'data-part' && !partCarriers.has(element.name.text)) {
              partCarriers.add(element.name.text);
              changed = true;
            }
          }
          continue;
        }
        if (!ts.isIdentifier(declaration.name) || carriers.has(declaration.name.text)) continue;
        if (referencesCarrier(declaration.initializer, carriers)) {
          carriers.add(declaration.name.text);
          // Kept so C4 can follow an alias back to what it actually copied.
          carrierInitializers.set(declaration.name.text, declaration.initializer);
          changed = true;
        }
      }
      if (!changed) break;
    }
  }

  /**
   * C4 accept-and-drop negation. `referencesCarrier` answers "is this the props
   * bag?", which is not the same question as "does this still hold the caller's
   * part?". A component that destructures `data-part` out and then spreads only
   * the rest forwards everything EXCEPT the anatomy part — the caller's part is
   * silently dropped, so such a spread proves nothing. The part comes back only
   * when the same expression re-attaches it from its own part carrier, and an
   * alias is followed to whatever it copied so the strip cannot be laundered
   * through `const merged = { ...rest }`.
   */
  function carriesPartForward(node, carriers, strippedCarriers, partCarriers, carrierInitializers, seen = new Set()) {
    const expression = unwrap(node);
    if (!expression || seen.has(expression)) return false;
    const nextSeen = new Set(seen).add(expression);
    const recurse = (child, childSeen = nextSeen) =>
      carriesPartForward(child, carriers, strippedCarriers, partCarriers, carrierInitializers, childSeen);
    if (ts.isIdentifier(expression)) {
      if (!carriers.has(expression.text) || strippedCarriers.has(expression.text)) return false;
      const initializer = carrierInitializers.get(expression.text);
      if (initializer && !seen.has(expression.text)) {
        return recurse(initializer, new Set(nextSeen).add(expression.text));
      }
      return true;
    }
    if (ts.isObjectLiteralExpression(expression)) {
      for (const property of expression.properties) {
        if (
          ts.isPropertyAssignment(property) && staticPropertyName(property.name) === 'data-part' &&
          referencesPartCarrier(property.initializer, partCarriers, carriers)
        ) {
          return true;
        }
        if (ts.isSpreadAssignment(property) && recurse(property.expression)) return true;
      }
      return false;
    }
    if (ts.isConditionalExpression(expression)) {
      return recurse(expression.whenTrue) && recurse(expression.whenFalse);
    }
    return false;
  }

  /**
   * Resolve a JSX tag to the third-party package it is imported from, when the
   * tag provably originates outside this package. A bare specifier that
   * `resolveSpecifier` cannot map into `<root>/src/` is out-of-package by
   * construction; relative, `@/` and `@rottay/design-system` specifiers are
   * in-package and must be proven, never trusted.
   */
  function externalImportSpecifier(module, name, depth, seen = new Set()) {
    if (depth > FORWARDER_MAX_DEPTH || seen.has(name)) return null;
    const nextSeen = new Set(seen).add(name);
    const binding = valueBinding(module.bindings, name);
    if (!binding) return null;
    if (['import', 'default-import', 'namespace-import'].includes(binding.kind)) {
      const specifier = binding.importSource ?? '';
      if (!specifier || specifier.startsWith('.') || specifier.startsWith('@/')) return null;
      if (specifier === '@rottay/design-system') return null;
      return resolveSpecifier(module.dir, specifier) ? null : specifier;
    }
    if (binding.kind !== 'variable') return null;
    let root = binding.initializer;
    if (!root && binding.declaration && ts.isBindingElement(binding.declaration)) {
      let owner = binding.declaration.parent;
      while (owner && !ts.isVariableDeclaration(owner)) owner = owner.parent;
      root = owner?.initializer ?? null;
    }
    const expression = root ? unwrap(root) : null;
    if (!expression) return null;
    if (ts.isIdentifier(expression)) {
      return externalImportSpecifier(module, expression.text, depth + 1, nextSeen);
    }
    if (ts.isPropertyAccessExpression(expression)) {
      const owner = unwrap(expression.expression);
      return owner && ts.isIdentifier(owner)
        ? externalImportSpecifier(module, owner.text, depth + 1, nextSeen)
        : null;
    }
    return null;
  }

  function externalComponentSpecifier(module, node, depth) {
    const expression = unwrap(node);
    if (!expression) return null;
    if (ts.isIdentifier(expression)) {
      return externalImportSpecifier(module, expression.text, depth);
    }
    if (ts.isPropertyAccessExpression(expression)) {
      const owner = unwrap(expression.expression);
      return owner && ts.isIdentifier(owner)
        ? externalImportSpecifier(module, owner.text, depth)
        : null;
    }
    return null;
  }

  /**
   * C1 override negation, part one: does this attribute stamp a part that is NOT
   * the caller's? JSX resolves duplicate props last-wins, so such an attribute
   * discards a caller part that reached the element through an earlier spread. A
   * `data-part` whose value cannot be proven to carry the caller's part counts as
   * an override (fail-closed); a pinned canonical helper counts when its part
   * argument is a literal or otherwise opaque, which is exactly the shape of
   * `partAttributes('trigger', interaction)`.
   */
  function literalPartOverride(module, attribute, partCarriers, carriers) {
    if (ts.isJsxAttribute(attribute)) {
      if (attribute.name.getText(module.source) !== 'data-part') return null;
      const initializer = attribute.initializer;
      if (
        initializer && ts.isJsxExpression(initializer) &&
        referencesPartCarrier(initializer.expression, partCarriers, carriers)
      ) return null;
      return 'attribute';
    }
    if (!ts.isJsxSpreadAttribute(attribute)) return null;
    const pin = pinnedHelperCall(module, attribute.expression);
    if (pin) {
      const call = unwrap(attribute.expression);
      const argument = call.arguments[pin.partArgumentIndex];
      return argument && referencesPartCarrier(argument, partCarriers, carriers)
        ? null
        : `helper:${pin.mechanism}`;
    }
    const object = unwrap(attribute.expression);
    if (object && ts.isObjectLiteralExpression(object)) {
      const property = object.properties.find(
        (entry) => ts.isPropertyAssignment(entry) && staticPropertyName(entry.name) === 'data-part',
      );
      if (property) {
        return referencesPartCarrier(property.initializer, partCarriers, carriers) ? null : 'object-literal';
      }
    }
    return null;
  }

  /**
   * C1 override negation, part two: ORDER. Only an override written after the
   * evidence on the same element defeats it. `Tag` is the living
   * literal-before-spread counterexample that must stay proven — modern stamps
   * `data-part="root"` and then spreads `restProps`, so the caller still wins —
   * while rustic Typography and rustic Button spread the carrier first and
   * overwrite it afterwards.
   */
  function overrideAfter(module, attribute, partCarriers, carriers) {
    const attributes = attribute.parent?.properties;
    if (!attributes) return null;
    const index = attributes.indexOf(attribute);
    if (index === -1) return null;
    for (let next = index + 1; next < attributes.length; next += 1) {
      const override = literalPartOverride(module, attributes[next], partCarriers, carriers);
      if (override) return override;
    }
    return null;
  }

  /** The `React.createElement` analogue of `overrideAfter`, over a props object. */
  function createdElementOverride(module, node, partCarriers, carriers) {
    const object = unwrap(node);
    if (!object || !ts.isObjectLiteralExpression(object)) return null;
    let spreadSeen = false;
    for (const property of object.properties) {
      if (ts.isSpreadAssignment(property)) {
        if (referencesCarrier(property.expression, carriers)) {
          spreadSeen = true;
          continue;
        }
        if (!spreadSeen) continue;
        const pin = pinnedHelperCall(module, property.expression);
        if (!pin) continue;
        const call = unwrap(property.expression);
        const argument = call.arguments[pin.partArgumentIndex];
        if (!argument || !referencesPartCarrier(argument, partCarriers, carriers)) {
          return `helper:${pin.mechanism}`;
        }
        continue;
      }
      if (!spreadSeen || !ts.isPropertyAssignment(property)) continue;
      if (staticPropertyName(property.name) !== 'data-part') continue;
      if (!referencesPartCarrier(property.initializer, partCarriers, carriers)) return 'property';
    }
    return null;
  }

  /**
   * C2 imperative-override negation and its C5 mirror image. A pinned canonical
   * helper called for effect writes the attribute directly onto a live node, so
   * the part it is given decides the whole component:
   *
   * - `literal` — the part is NOT the caller's. The stamp re-runs on every
   *   commit, so NOTHING this component renders can carry a caller part.
   * - `forward` — the part IS the caller's. This is the component's real
   *   forwarding mechanism, and C5 accepts it as a terminal in its own right
   *   (Button classic under Ant Design, which owns its root DOM node, has no
   *   attribute to forward through). It is deliberately recorded as
   *   `imperative-part-forward` rather than folded into an attribute proof:
   *   the node identity is taken from the ref/effect wiring rather than proven,
   *   so a reviewer must see which mechanism was relied on.
   *
   * Only calls whose result is discarded qualify — a helper call that produces a
   * value is attribute evidence, judged by C1.
   */
  function imperativeStamps(module, fn, partCarriers, carriers) {
    const found = { literal: null, forward: null };
    (function walk(node) {
      if (found.literal) return;
      if (ts.isCallExpression(node)) {
        const parent = node.parent;
        const forEffect = Boolean(
          parent && (
            ts.isExpressionStatement(parent) ||
            (ts.isArrowFunction(parent) && parent.body === node)
          ),
        );
        if (forEffect) {
          const pin = pinnedHelperCall(module, node);
          if (pin) {
            const argument = node.arguments[pin.partArgumentIndex];
            if (!argument || !referencesPartCarrier(argument, partCarriers, carriers)) {
              found.literal = pin.mechanism;
              return;
            }
            found.forward ??= pin.mechanism;
          }
        }
      }
      ts.forEachChild(node, walk);
    })(fn);
    return found;
  }

  /** C3. One terminal, kept legible instead of collapsed into a count. */
  function proofSummary(result) {
    if (!result.proven) return result.reason;
    return result.detail ? `${result.mechanism}:${result.detail}` : result.mechanism;
  }

  function proveFunctionForwards(module, fn, depth) {
    const { carriers, partCarriers, strippedCarriers } = collectCarriers(fn);
    if (carriers.size === 0 && partCarriers.size === 0) {
      return { proven: false, reason: 'no-props-carrier' };
    }
    const carrierInitializers = new Map();
    expandCarriers(fn, carriers, partCarriers, strippedCarriers, carrierInitializers);
    /** The local object a name is bound to, so a hoisted props bag can be read. */
    const localInitializer = (name) => {
      let found = null;
      const walk = (node) => {
        if (found) return;
        if (
          ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) &&
          node.name.text === name && node.initializer
        ) {
          found = node.initializer;
          return;
        }
        ts.forEachChild(node, walk);
      };
      walk(fn);
      return found;
    };
    /**
     * Does the value of this expression carry the caller's part? Beyond the
     * carrier bags themselves this follows a locally hoisted props object and
     * credits a pinned helper spread inside it, because an object assembled
     * before the JSX (`anatomyProps`) forwards exactly as a literal one does.
     */
    const carriesPart = (node, seen = new Set()) => {
      const expression = unwrap(node);
      if (!expression || seen.has(expression)) return false;
      const next = new Set(seen).add(expression);
      if (carriesPartForward(expression, carriers, strippedCarriers, partCarriers, carrierInitializers)) {
        return true;
      }
      if (ts.isIdentifier(expression)) {
        if (carriers.has(expression.text)) return false;
        const initializer = localInitializer(expression.text);
        return initializer ? carriesPart(initializer, next) : false;
      }
      if (ts.isObjectLiteralExpression(expression)) {
        for (const property of expression.properties) {
          if (
            ts.isPropertyAssignment(property) && staticPropertyName(property.name) === 'data-part' &&
            referencesPartCarrier(property.initializer, partCarriers, carriers)
          ) {
            return true;
          }
          if (!ts.isSpreadAssignment(property)) continue;
          const pin = pinnedHelperCall(module, property.expression);
          if (pin) {
            const call = unwrap(property.expression);
            const argument = call.arguments[pin.partArgumentIndex];
            if (argument && referencesPartCarrier(argument, partCarriers, carriers)) return true;
          }
          if (carriesPart(property.expression, next)) return true;
        }
        return false;
      }
      if (ts.isConditionalExpression(expression)) {
        return carriesPart(expression.whenTrue, next) && carriesPart(expression.whenFalse, next);
      }
      return false;
    };
    const imperative = imperativeStamps(module, fn, partCarriers, carriers);
    if (imperative.literal) {
      return { proven: false, reason: `imperative-literal-stamp:${imperative.literal}` };
    }
    let proof = null;
    const attempts = [];
    // C1/C4 are component-wide, not per-branch: a sibling branch that forwards
    // does not make a root that drops the caller part honest. Verdicts are
    // therefore accumulated per render root, and a defeated root vetoes.
    const NO_ROOT = Symbol('not-an-element');
    const verdicts = new Map();
    const rootOf = (node) => {
      if (ts.isJsxAttribute(node) || ts.isJsxSpreadAttribute(node)) {
        const owner = node.parent?.parent ?? null;
        if (!owner) return NO_ROOT;
        return ts.isJsxOpeningElement(owner) ? (owner.parent ?? owner) : owner;
      }
      if (ts.isCallExpression(node)) return node;
      return NO_ROOT;
    };
    /** Does any spread on this element hand the root the caller's part back? */
    const spreadRestoresPart = (element) => {
      if (element === NO_ROOT) return false;
      const attributes = ts.isJsxElement(element)
        ? element.openingElement.attributes.properties
        : element.attributes?.properties ?? null;
      if (!attributes) return false;
      for (const attribute of attributes) {
        if (!ts.isJsxSpreadAttribute(attribute)) continue;
        if (referencesCarrier(attribute.expression, carriers)) continue;
        if (!carriesPart(attribute.expression)) continue;
        if (overrideAfter(module, attribute, partCarriers, carriers)) continue;
        return true;
      }
      return false;
    };
    const isRenderRoot = (element) => {
      if (element === NO_ROOT) return false;
      let current = element.parent;
      while (current && current !== fn) {
        if (ts.isJsxElement(current) || ts.isJsxSelfClosingElement(current)) return false;
        if (ts.isCallExpression(current) && isReactCreateElement(module, unwrap(current.expression))) return false;
        current = current.parent;
      }
      return true;
    };
    const verdictFor = (node) => {
      const key = rootOf(node);
      let entry = verdicts.get(key);
      if (!entry) {
        entry = { proven: null, defeat: null, root: isRenderRoot(key) };
        verdicts.set(key, entry);
      }
      return entry;
    };
    const record = (node, mechanism, detail) => {
      verdictFor(node).proven ??= { mechanism, detail };
      if (!proof) proof = { proven: true, mechanism, detail };
    };
    const note = (node, reason) => {
      if (!reason) return;
      if (attempts.length < 3) attempts.push(reason);
      verdictFor(node).defeat ??= reason;
    };
    function scan(node) {
      if (ts.isJsxSpreadAttribute(node) && referencesCarrier(node.expression, carriers)) {
        const override = overrideAfter(module, node, partCarriers, carriers);
        const tag = node.parent?.parent?.tagName;
        if (override) {
          note(node, `spread-overridden-by-literal:${override}`);
        } else if (!carriesPart(node.expression)) {
          note(node, 'part-stripped-carrier-spread');
        } else if (tag && ts.isIdentifier(tag) && /^[a-z]/.test(tag.text)) {
          record(node, 'rest-spread-intrinsic', tag.text);
        } else if (tag) {
          const intrinsic = intrinsicTagName(module, tag, depth + 1);
          if (intrinsic) {
            record(node, 'rest-spread-prop-defaulted-intrinsic', intrinsic);
          } else {
            const nested = proveComponentValue(module, tag, depth + 1);
            if (nested.proven) {
              record(node, 'rest-spread-forwarder', proofSummary(nested));
            } else {
              const external = externalComponentSpecifier(module, tag, depth + 1);
              if (external) record(node, 'rest-spread-external-root', external);
              else note(node, `spread-tag:${nested.reason}`);
            }
          }
        }
      } else if (
        ts.isJsxAttribute(node) && node.name.getText(module.source) === 'data-part' &&
        node.initializer && ts.isJsxExpression(node.initializer) &&
        referencesPartCarrier(node.initializer.expression, partCarriers, carriers)
      ) {
        const override = overrideAfter(module, node, partCarriers, carriers);
        if (override) note(node, `part-forward-overridden-by-literal:${override}`);
        else record(node, 'explicit-part-forward', node.parent?.parent?.tagName?.getText(module.source) ?? '<unknown>');
      } else if (ts.isJsxSpreadAttribute(node) || ts.isSpreadAssignment(node)) {
        const pin = pinnedHelperCall(module, node.expression);
        if (pin) {
          const call = unwrap(node.expression);
          const argument = call.arguments[pin.partArgumentIndex];
          if (!argument || !referencesPartCarrier(argument, partCarriers, carriers)) {
            note(node, `helper-stamps-literal-part:${pin.mechanism}`);
          } else {
            const override = ts.isJsxSpreadAttribute(node)
              ? overrideAfter(module, node, partCarriers, carriers)
              : null;
            if (override) note(node, `helper-forward-overridden-by-literal:${override}`);
            else record(node, 'pinned-stamp-helper', pin.mechanism);
          }
        }
      } else if (ts.isCallExpression(node) && isReactCreateElement(module, unwrap(node.expression))) {
        if (node.arguments.length >= 2 && referencesCarrier(node.arguments[1], carriers)) {
          const override = createdElementOverride(module, node.arguments[1], partCarriers, carriers);
          const stripped = !override && !carriesPart(node.arguments[1]);
          const intrinsic = override || stripped ? null : intrinsicTagName(module, node.arguments[0], depth + 1);
          if (override) {
            note(node, `created-element-overridden-by-literal:${override}`);
          } else if (stripped) {
            note(node, 'part-stripped-carrier-props');
          } else if (intrinsic) {
            record(node, 'created-element-intrinsic', intrinsic);
          } else {
            const nested = proveComponentValue(module, node.arguments[0], depth + 1);
            if (nested.proven) {
              record(node, 'created-element-forwarder', proofSummary(nested));
            } else {
              const external = externalComponentSpecifier(module, node.arguments[0], depth + 1);
              if (external) record(node, 'created-element-external-root', external);
              else note(node, `created-element:${nested.reason}`);
            }
          }
        }
      }
      ts.forEachChild(node, scan);
    }
    scan(fn);
    // A render root that receives the carrier and drops the caller part vetoes
    // the whole component, whatever a sibling root does: `<Text as="span">` must
    // not be able to lose the caller anatomy just because `<Text as="p">` keeps
    // it. Only roots are policed — an inner element that re-spreads the carrier
    // under its own literal part is not a root and cannot lose the anatomy.
    // A strip is cured by an imperative forward (C5) that re-stamps the node
    // after commit; a literal override is not, because C1 is dominant.
    const CURABLE_DEFEATS = new Set(['part-stripped-carrier-spread', 'part-stripped-carrier-props']);
    for (const [element, verdict] of verdicts) {
      if (!verdict.root || verdict.proven || !verdict.defeat) continue;
      if (!CURABLE_DEFEATS.has(verdict.defeat)) {
        return { proven: false, reason: `no-forwarding-evidence[root-drops-part:${verdict.defeat}]` };
      }
      // A strip is cured either by an imperative forward that re-stamps the
      // node after commit (C5) or by a sibling spread on the same element that
      // does carry the part: spreading a bag WITHOUT the key cannot delete a
      // key another spread set, so position does not matter here — only a
      // literal override written after the curing spread would.
      if (imperative.forward) continue;
      if (spreadRestoresPart(element)) continue;
      return { proven: false, reason: `no-forwarding-evidence[root-drops-part:${verdict.defeat}]` };
    }
    if (proof) return proof;
    // C5. Weaker than an attribute terminal, so it is only reached once every
    // attribute path has failed, and it keeps its own mechanism name.
    if (imperative.forward) {
      return { proven: true, mechanism: 'imperative-part-forward', detail: imperative.forward };
    }
    return {
      proven: false,
      reason: attempts.length > 0 ? `no-forwarding-evidence[${attempts.join(';')}]` : 'no-forwarding-evidence',
    };
  }

  function engineSwitchFactories(module, args) {
    if (args.length < 2) return null;
    const literal = unwrap(args[1]);
    if (!literal || !ts.isObjectLiteralExpression(literal) || literal.properties.length === 0) return null;
    const entries = [];
    for (const property of literal.properties) {
      if (!ts.isPropertyAssignment(property)) return null;
      const engine = staticPropertyName(property.name);
      if (!engine || !CANONICAL_ENGINE_NAMES.includes(engine)) return null;
      const arrow = unwrap(property.initializer);
      const body = arrow && ts.isArrowFunction(arrow) ? unwrap(arrow.body) : null;
      const specifier = body && ts.isCallExpression(body) &&
        body.expression.kind === ts.SyntaxKind.ImportKeyword &&
        body.arguments.length === 1 && ts.isStringLiteralLike(body.arguments[0])
        ? body.arguments[0].text
        : null;
      if (!specifier) return null;
      const base = resolveSpecifier(module.dir, specifier);
      if (!base) return null;
      entries.push({ engine, base });
    }
    return entries;
  }

  function proveFactoryReturn(module, fn, depth) {
    const returned = [];
    if (ts.isArrowFunction(fn) && fn.body && !ts.isBlock(fn.body)) {
      returned.push(fn.body);
    } else if (fn.body) {
      (function collect(node) {
        if (
          ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) ||
          ts.isArrowFunction(node) || ts.isClassDeclaration(node)
        ) return;
        if (ts.isReturnStatement(node) && node.expression) returned.push(node.expression);
        ts.forEachChild(node, collect);
      })(fn.body);
    }
    if (returned.length === 0) return { proven: false, reason: 'factory-no-return' };
    const results = returned.map((value) => proveComponentValue(module, value, depth + 1));
    const failedReturn = results.findIndex((result) => !result.proven);
    if (failedReturn !== -1) {
      return { proven: false, reason: `factory-return-unproven[${results[failedReturn].reason}]` };
    }
    return { proven: true, mechanism: 'pinned-factory-return', detail: proofSummary(results[0]) };
  }

  function computeComponentValue(module, expression, depth) {
    if (
      ts.isFunctionDeclaration(expression) || ts.isFunctionExpression(expression) ||
      ts.isArrowFunction(expression)
    ) {
      return proveFunctionForwards(module, expression, depth);
    }
    if (ts.isIdentifier(expression)) {
      const resolved = resolveValueDeclaration(module, expression.text, depth + 1);
      return resolved
        ? proveComponentValue(resolved.module, resolved.node, depth + 1)
        : { proven: false, reason: 'unresolved-identifier' };
    }
    if (ts.isPropertyAccessExpression(expression)) {
      const owner = unwrap(expression.expression);
      if (owner && ts.isIdentifier(owner)) {
        const resolved = resolveValueDeclaration(module, owner.text, depth + 1);
        const member = resolved ? constObjectMember(resolved.module, resolved.node, expression.name.text) : null;
        if (member) return proveComponentValue(resolved.module, member, depth + 1);
      }
      return { proven: false, reason: 'unresolved-member' };
    }
    if (ts.isElementAccessExpression(expression)) {
      const owner = unwrap(expression.expression);
      if (!owner || !ts.isIdentifier(owner)) return { proven: false, reason: 'unresolved-element-access' };
      const resolved = resolveValueDeclaration(module, owner.text, depth + 1);
      const literal = resolved ? unwrap(resolved.node) : null;
      if (!literal || !ts.isObjectLiteralExpression(literal) || literal.properties.length === 0) {
        return { proven: false, reason: 'unresolved-element-access' };
      }
      const members = [];
      for (const property of literal.properties) {
        const key = ts.isPropertyAssignment(property) ? staticPropertyName(property.name) : null;
        if (!key) return { proven: false, reason: 'non-static-component-map' };
        members.push({ key, node: property.initializer });
      }
      const results = members.map((member) => proveComponentValue(resolved.module, member.node, depth + 1));
      const failed = results.findIndex((result) => !result.proven);
      return failed === -1
        ? {
          proven: true,
          mechanism: 'component-map-complete',
          detail: members.map((member, index) => `${member.key}=${proofSummary(results[index])}`).sort().join('+'),
        }
        : { proven: false, reason: `component-map-incomplete[${members[failed].key}:${results[failed].reason}]` };
    }
    if (
      ts.isBinaryExpression(expression) &&
      [ts.SyntaxKind.BarBarToken, ts.SyntaxKind.QuestionQuestionToken].includes(expression.operatorToken.kind)
    ) {
      const left = proveComponentValue(module, expression.left, depth + 1);
      const right = proveComponentValue(module, expression.right, depth + 1);
      return left.proven && right.proven
        ? { proven: true, mechanism: 'all-branches', detail: `${proofSummary(left)}+${proofSummary(right)}` }
        : { proven: false, reason: `branch-unproven[${(left.proven ? right : left).reason}]` };
    }
    if (ts.isCallExpression(expression)) {
      const args = [...expression.arguments];
      const engines = engineSwitchFactories(module, args);
      if (engines) {
        const results = engines.map(({ base }) => {
          const target = loadModule(base);
          if (!target) return { proven: false, reason: 'engine-module-unreadable' };
          const resolved = resolveExportValue(target, 'default', depth + 1);
          return resolved
            ? proveComponentValue(resolved.module, resolved.node, depth + 1)
            : { proven: false, reason: 'engine-default-unresolved' };
        });
        const failed = results.findIndex((result) => !result.proven);
        return failed === -1
          ? {
            proven: true,
            mechanism: 'engine-switch-complete',
            // C3: each engine's own terminal stays visible here, so a weaker
            // external-root proof is never laundered into a bare engine list.
            detail: engines
              .map(({ engine }, index) => `${engine}=${proofSummary(results[index])}`)
              .sort()
              .join('+'),
          }
          : {
            proven: false,
            reason: `engine-switch-incomplete[${engines[failed].engine}:${results[failed].reason}]`,
          };
      }
      const sync = syncEngineSwitchImplementations(module, expression, depth);
      if (sync) {
        const results = sync.entries.map((entry) => proveComponentValue(sync.module, entry.node, depth + 1));
        const failed = results.findIndex((result) => !result.proven);
        return failed === -1
          ? {
            proven: true,
            mechanism: 'sync-engine-switch-complete',
            detail: sync.entries
              .map((entry, index) => `${entry.engine}=${proofSummary(results[index])}`)
              .sort()
              .join('+'),
          }
          : {
            proven: false,
            reason: `sync-engine-switch-incomplete[${sync.entries[failed].engine}:${results[failed].reason}]`,
          };
      }
      const callee = unwrap(expression.expression);
      const calleeName = callee && ts.isIdentifier(callee)
        ? callee.text
        : callee && ts.isPropertyAccessExpression(callee)
        ? callee.name.text
        : null;
      if (['forwardRef', 'memo'].includes(calleeName) && args.length >= 1) {
        return proveComponentValue(module, args[0], depth + 1);
      }
      if (
        calleeName === 'assign' && callee && ts.isPropertyAccessExpression(callee) &&
        ts.isIdentifier(unwrap(callee.expression)) && unwrap(callee.expression).text === 'Object' &&
        args.length >= 1
      ) {
        return proveComponentValue(module, args[0], depth + 1);
      }
      if (callee && ts.isIdentifier(callee)) {
        const resolved = resolveValueDeclaration(module, callee.text, depth + 1);
        const factory = resolved ? unwrap(resolved.node) : null;
        if (
          factory && (ts.isFunctionDeclaration(factory) || ts.isFunctionExpression(factory) ||
            ts.isArrowFunction(factory))
        ) {
          return proveFactoryReturn(resolved.module, factory, depth + 1);
        }
      }
      return { proven: false, reason: 'unproven-call' };
    }
    return { proven: false, reason: `unsupported-${ts.SyntaxKind[expression.kind]}` };
  }

  function proveComponentValue(module, node, depth) {
    if (depth > FORWARDER_MAX_DEPTH) return { proven: false, reason: 'depth-exhausted' };
    const expression = unwrap(node);
    if (!expression) return { proven: false, reason: 'unresolvable-expression' };
    const key = `${module.path}@${expression.pos}:${expression.end}`;
    if (componentActive.has(key)) return { proven: false, reason: 'cycle-guard' };
    if (componentMemo.has(key)) return componentMemo.get(key);
    componentActive.add(key);
    let result;
    try {
      result = computeComponentValue(module, expression, depth);
    } finally {
      componentActive.delete(key);
    }
    componentMemo.set(key, result);
    return result;
  }

  return {
    proveExport(base, exportName) {
      const module = loadModule(base);
      if (!module) return { proven: false, reason: 'module-unreadable' };
      const resolved = resolveExportValue(module, exportName, 0);
      if (!resolved) return { proven: false, reason: 'export-unresolved' };
      return proveComponentValue(resolved.module, resolved.node, 0);
    },
    resolveHelperPin,
  };
}

const forwarderProverCache = new Map();

function forwarderProverFor(workspacePackageRoot, injectedReader) {
  if (injectedReader) return createForwarderProver({ workspacePackageRoot, readModule: injectedReader });
  if (!workspacePackageRoot) return createForwarderProver({ workspacePackageRoot, readModule: null });
  if (!forwarderProverCache.has(workspacePackageRoot)) {
    forwarderProverCache.set(
      workspacePackageRoot,
      createForwarderProver({
        workspacePackageRoot,
        readModule: createSourceModuleReader(workspacePackageRoot),
      }),
    );
  }
  return forwarderProverCache.get(workspacePackageRoot);
}

/** Collect only exact data-part sinks with statically provable values. */
export function collectDataPartStampsFromText(text, fileName = 'source.tsx', options = {}) {
  const source = parseSource(text, fileName);
  const bindings = buildBindings(source);
  const stamps = [];
  const unresolved = [];

  function bindingNameEntries(nameNode, base, out) {
    if (ts.isIdentifier(nameNode)) {
      out.push({ ...base, name: nameNode.text });
      return;
    }
    if (!ts.isObjectBindingPattern(nameNode) && !ts.isArrayBindingPattern(nameNode)) return;
    for (const element of nameNode.elements) {
      if (!ts.isBindingElement(element)) continue;
      bindingNameEntries(
        element.name,
        { ...base, initializer: element.initializer ?? null, declaration: element },
        out,
      );
    }
  }

  /**
   * Innermost lexical declaration of `name` visible from `useNode`. The
   * file-global binding table cannot answer this: names like `props` and
   * `dataPart` recur across sibling components in one file, and a global
   * uniqueness test would fail closed on every one of them. Ambiguity inside a
   * single scope still fails closed.
   */
  function lexicalBinding(useNode, name) {
    let current = useNode?.parent ?? null;
    while (current) {
      const declared = [];
      if (
        ts.isFunctionDeclaration(current) || ts.isFunctionExpression(current) ||
        ts.isArrowFunction(current) || ts.isMethodDeclaration(current) ||
        ts.isConstructorDeclaration(current)
      ) {
        for (const parameter of current.parameters) {
          bindingNameEntries(
            parameter.name,
            { kind: 'parameter', initializer: parameter.initializer ?? null, declaration: parameter },
            declared,
          );
        }
      }
      const statements = ts.isSourceFile(current) || ts.isBlock(current) || ts.isModuleBlock(current)
        ? current.statements
        : null;
      if (statements) {
        for (const statement of statements) {
          if (!ts.isVariableStatement(statement)) continue;
          for (const declaration of statement.declarationList.declarations) {
            bindingNameEntries(
              declaration.name,
              { kind: 'variable', initializer: declaration.initializer ?? null, declaration },
              declared,
            );
          }
        }
      }
      const matches = declared.filter((entry) => entry.name === name);
      if (matches.length === 1) return matches[0];
      if (matches.length > 1) return null;
      current = current.parent ?? null;
    }
    return null;
  }

  function resolvedBinding(useNode, name) {
    return lexicalBinding(useNode, name) ?? uniqueBinding(bindings, name);
  }

  /**
   * Governing declaration of a binding when it is a parameter, plus the
   * inline-object-type member key it was destructured from (null for a plain
   * identifier parameter).
   */
  function parameterAnnotation(binding) {
    if (binding?.kind !== 'parameter' || !binding.declaration) return null;
    const declaration = binding.declaration;
    if (ts.isParameter(declaration)) return { annotation: declaration.type ?? null, memberKey: null };
    if (!ts.isBindingElement(declaration)) return null;
    const pattern = declaration.parent;
    const parameter = pattern?.parent;
    if (!pattern || !ts.isObjectBindingPattern(pattern) || !parameter || !ts.isParameter(parameter)) return null;
    const memberKey = staticPropertyName(declaration.propertyName) ??
      (ts.isIdentifier(declaration.name) ? declaration.name.text : null);
    return memberKey ? { annotation: parameter.type ?? null, memberKey } : null;
  }

  function typeLiteralMemberType(annotation, key) {
    if (!annotation || !ts.isTypeLiteralNode(annotation)) return null;
    for (const member of annotation.members) {
      if (ts.isPropertySignature(member) && staticPropertyName(member.name) === key) return member.type ?? null;
    }
    return null;
  }

  /**
   * R-B: keys of a same-file `as const` object literal referenced through
   * `keyof typeof C`. Fail-closed on a missing `as const`, a computed or spread
   * key, an imported C, or any interface/type-alias indirection.
   */
  function keyofConstTypeKeys(typeNode) {
    if (!typeNode || !ts.isTypeOperatorNode(typeNode) || typeNode.operator !== ts.SyntaxKind.KeyOfKeyword) return null;
    const query = typeNode.type;
    if (!query || !ts.isTypeQueryNode(query) || !ts.isIdentifier(query.exprName)) return null;
    const binding = resolvedBinding(query, query.exprName.text);
    const declarationList = binding?.declaration?.parent;
    if (
      binding?.kind !== 'variable' || !binding.initializer ||
      !declarationList || !ts.isVariableDeclarationList(declarationList) ||
      (declarationList.flags & ts.NodeFlags.Const) === 0
    ) return null;
    const asConst = binding.initializer;
    if (
      !ts.isAsExpression(asConst) || !asConst.type || !ts.isTypeReferenceNode(asConst.type) ||
      !ts.isIdentifier(asConst.type.typeName) || asConst.type.typeName.text !== 'const'
    ) return null;
    const literal = unwrap(asConst);
    if (!literal || !ts.isObjectLiteralExpression(literal) || literal.properties.length === 0) return null;
    const keys = new Set();
    for (const property of literal.properties) {
      if (ts.isSpreadAssignment(property)) return null;
      if (!ts.isPropertyAssignment(property) && !ts.isShorthandPropertyAssignment(property)) return null;
      const key = staticPropertyName(property.name);
      if (!key) return null;
      keys.add(key);
    }
    return keys.size > 0 && keys.size <= 16 ? keys : null;
  }

  function keyofConstParameterValues(expression) {
    if (ts.isIdentifier(expression)) {
      const info = parameterAnnotation(resolvedBinding(expression, expression.text));
      if (!info) return null;
      return info.memberKey === null
        ? keyofConstTypeKeys(info.annotation)
        : keyofConstTypeKeys(typeLiteralMemberType(info.annotation, info.memberKey));
    }
    if (ts.isPropertyAccessExpression(expression)) {
      const owner = unwrap(expression.expression);
      if (!owner || !ts.isIdentifier(owner)) return null;
      const info = parameterAnnotation(resolvedBinding(owner, owner.text));
      if (!info || info.memberKey !== null) return null;
      return keyofConstTypeKeys(typeLiteralMemberType(info.annotation, expression.name.text));
    }
    return null;
  }

  /**
   * R-A left operand: a bare identifier bound to a caller-supplied prop or
   * parameter of the enclosing component, so every non-nullish value it can
   * carry originates at a caller sink proven in its own right. Any other left
   * operand (call, member access, complex expression) stays unresolved.
   */
  function callerSuppliedIdentifier(node, depth = 0) {
    const expression = unwrap(node);
    if (!expression || !ts.isIdentifier(expression) || depth > 4) return false;
    const binding = resolvedBinding(expression, expression.text);
    if (!binding || !['parameter', 'variable'].includes(binding.kind)) return false;
    const declaration = binding.declaration;
    if (!declaration) return false;
    if (ts.isParameter(declaration)) return depth > 0;
    if (!ts.isBindingElement(declaration) || declaration.dotDotDotToken) return false;
    const pattern = declaration.parent;
    if (!pattern || !ts.isObjectBindingPattern(pattern)) return false;
    const owner = pattern.parent;
    if (!owner) return false;
    if (ts.isParameter(owner)) return true;
    if (ts.isVariableDeclaration(owner)) return callerSuppliedIdentifier(owner.initializer, depth + 1);
    return false;
  }

  function finiteStaticPartValues(node, seen = new Set(), followConstBindings = false, rules = null) {
    const expression = unwrap(node);
    if (!expression || seen.has(expression)) return null;
    const nextSeen = new Set(seen).add(expression);
    if (ts.isStringLiteralLike(expression)) return new Set([expression.text]);
    if (ts.isConditionalExpression(expression)) {
      const left = finiteStaticPartValues(expression.whenTrue, nextSeen, followConstBindings, rules);
      const right = finiteStaticPartValues(expression.whenFalse, nextSeen, followConstBindings, rules);
      if (!left || !right || left.size + right.size > 16) return null;
      return new Set([...left, ...right]);
    }
    if (
      ts.isBinaryExpression(expression) &&
      expression.operatorToken.kind === ts.SyntaxKind.PlusToken
    ) {
      const left = finiteStaticPartValues(expression.left, nextSeen, followConstBindings, rules);
      const right = finiteStaticPartValues(expression.right, nextSeen, followConstBindings, rules);
      return left && right ? combineStrings(left, right, 16) : null;
    }
    if (
      ts.isBinaryExpression(expression) &&
      expression.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken
    ) {
      if (!callerSuppliedIdentifier(expression.left)) return null;
      const fallback = finiteStaticPartValues(expression.right, nextSeen, followConstBindings, rules);
      if (!fallback || fallback.size === 0 || fallback.size > 16) return null;
      rules?.add('defaulted-fallback');
      return fallback;
    }
    if (ts.isTemplateExpression(expression)) {
      let values = new Set([expression.head.text]);
      for (const span of expression.templateSpans) {
        const substitutions = finiteStaticPartValues(span.expression, nextSeen, followConstBindings, rules);
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
        return finiteStaticPartValues(binding.initializer, nextSeen, true, rules);
      }
    }
    const keyofValues = keyofConstParameterValues(expression);
    if (keyofValues) {
      rules?.add('keyof-const-parameter');
      return keyofValues;
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
    const valueRules = new Set();
    const values = finiteStaticPartValues(valueNode, new Set(), false, valueRules);
    if (!values || values.size === 0) {
      unresolvedSink(node, `${syntax}-dynamic-value`, valueNode, [], provenance);
      return;
    }
    const stampProvenance = valueRules.size > 0
      ? { ...provenance, valueProof: [...valueRules].sort() }
      : provenance;
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
        provenance: stampProvenance,
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

  const prover = forwarderProverFor(sourcePackageRoot, options.moduleReader ?? null);

  /** Normalize an import target onto a workspace-relative module base. */
  function packageRelativeModule(resolved) {
    if (!sourcePackageRoot) return null;
    if (resolved === '@rottay/design-system') return `${sourcePackageRoot}/src/index`;
    if (resolved.startsWith('@/')) return `${sourcePackageRoot}/src/${resolved.slice(2)}`;
    if (resolved.startsWith(`${sourcePackageRoot}/src/`)) return resolved;
    return null;
  }

  /**
   * Canonical DS module boundary. A deep intra-family path is NOT a boundary:
   * only the package public barrel, a UI tier/category/family module, a family
   * `engines/<engine>` module, and a generated icon role module qualify.
   */
  function canonicalModuleBoundary(resolved) {
    const absolute = packageRelativeModule(resolved);
    if (!absolute) return null;
    const trimmed = absolute.slice(sourcePackageRoot.length).replace(/\/index$/, '');
    const segments = trimmed.split('/').filter(Boolean);
    if (segments[0] !== 'src') return null;
    const tail = segments.slice(1);
    if (tail.length === 0) return { base: absolute, boundary: 'package-public-barrel' };
    if (tail[0] === 'components' && UI_TIER_SEGMENTS.includes(tail[1])) {
      const rest = tail.slice(2);
      if (rest.length === 0) return { base: absolute, boundary: 'ui-tier' };
      if (rest.length === 1) return { base: absolute, boundary: 'ui-category' };
      if (rest.length === 2) return { base: absolute, boundary: 'ui-family' };
      if (rest.length === 4 && rest[2] === 'engines' && CANONICAL_ENGINE_NAMES.includes(rest[3])) {
        return { base: absolute, boundary: 'ui-family-engine' };
      }
      return null;
    }
    if (
      tail.length === 6 &&
      tail.slice(0, 5).join('/') === 'graphics/icons/semantic/generated/roles'
    ) {
      return { base: absolute, boundary: 'icon-role' };
    }
    return null;
  }

  function canonicalForwarder(tagName) {
    if (!ts.isIdentifier(tagName)) return { proven: false, reason: 'non-identifier-tag' };
    const binding = valueBinding(bindings, tagName.text);
    if (!binding || !['import', 'default-import'].includes(binding.kind)) {
      return { proven: false, reason: 'tag-not-single-value-import' };
    }
    const resolved = resolvedImportPath(binding.importSource ?? '');
    const boundary = canonicalModuleBoundary(resolved);
    if (!boundary) return { proven: false, reason: 'non-canonical-module-boundary' };
    const exportName = binding.kind === 'default-import' ? 'default' : binding.importedName;
    const proof = prover.proveExport(boundary.base, exportName);
    if (!proof.proven) return { proven: false, reason: `forwarding-unproven:${proof.reason}` };
    return {
      proven: true,
      provenance: {
        canonicalComponent: exportName,
        localName: tagName.text,
        importSource: binding.importSource,
        resolvedModule: resolved,
        moduleBoundary: boundary.boundary,
        forwardingProof: proof.detail ? `${proof.mechanism}:${proof.detail}` : proof.mechanism,
      },
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
    return forwarder.proven
      ? { sinkKind: 'canonical-forwarder', provenance: forwarder.provenance }
      : { sinkKind: null, reason: forwarder.reason };
  }

  /**
   * A pinned canonical stamping mechanism, recognized by the module that owns
   * the declaration (resolved through re-export barrels), never by name alone.
   */
  function canonicalStampHelper(call) {
    const callee = unwrap(call.expression);
    if (!callee || !ts.isIdentifier(callee)) return null;
    const binding = valueBinding(bindings, callee.text);
    if (binding?.kind !== 'import' || !Object.hasOwn(PINNED_STAMP_HELPERS, binding.importedName)) return null;
    const pin = prover.resolveHelperPin(
      posix.dirname(normalizedSourcePath),
      binding.importSource,
      binding.importedName,
    );
    if (!pin) return null;
    return {
      localName: callee.text,
      importSource: binding.importSource,
      resolvedModule: resolvedImportPath(binding.importSource ?? ''),
      mechanism: pin.mechanism,
      ownerModule: pin.ownerModule,
      partArgumentIndex: pin.partArgumentIndex,
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
      if (!sink || !sink.sinkKind) {
        const values = finiteStaticPartValues(valueNode);
        unresolvedSink(
          node,
          'jsx-custom-unproven-forwarder',
          node,
          values ? [...values] : [],
          {
            tagName: node.parent?.parent?.tagName?.getText(source) ?? '<unknown>',
            reason: sink?.reason ?? 'no-tag-name',
          },
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
          node.arguments[helper.partArgumentIndex],
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
