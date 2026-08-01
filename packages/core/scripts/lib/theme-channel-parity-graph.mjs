/**
 * Static BrandTheme channel graph used by theme-channel-parity-gate (DS-A003).
 *
 * The analysis is deliberately conservative:
 * - declarations are read from TypeScript ASTs, never from generated `dist`;
 * - only visual BrandTheme roots are traversed;
 * - a declared leaf is called "unemitted" only when it is neither attached to
 *   a concrete/pattern emitter assignment nor read by a compiler route;
 * - dynamic CSS-variable templates become wildcard patterns, so an unresolved
 *   loop can suppress a false "unowned" result but can never invent a concrete
 *   emitted channel or consumer;
 * - comments, tests, stories, fixtures and generated artifacts are not real
 *   consumers.
 */
import ts from "typescript";
import { stripScriptComments } from "./script-source-comment-stripper.mjs";

export const DEFAULT_VISUAL_ROOTS = Object.freeze([
  "palette",
  "typography",
  "surfaces",
  "motion",
  "charts",
  "chrome",
]);

const WRAPPER_TYPES = new Set(["Partial", "Readonly", "Required"]);
const PRIMITIVE_KINDS = new Set([
  ts.SyntaxKind.AnyKeyword,
  ts.SyntaxKind.BigIntKeyword,
  ts.SyntaxKind.BooleanKeyword,
  ts.SyntaxKind.NeverKeyword,
  ts.SyntaxKind.NumberKeyword,
  ts.SyntaxKind.StringKeyword,
  ts.SyntaxKind.SymbolKeyword,
  ts.SyntaxKind.UnknownKeyword,
  ts.SyntaxKind.VoidKeyword,
]);

function sourceFileFor(file, text) {
  return ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );
}

function propertyName(node) {
  if (!node) return null;
  if (
    ts.isIdentifier(node) ||
    ts.isStringLiteral(node) ||
    ts.isNumericLiteral(node)
  ) {
    return node.text;
  }
  return null;
}

function namedType(node) {
  if (!node) return null;
  if (ts.isParenthesizedTypeNode(node)) return namedType(node.type);
  if (ts.isUnionTypeNode(node)) {
    for (const part of node.types) {
      if (
        part.kind === ts.SyntaxKind.UndefinedKeyword ||
        part.kind === ts.SyntaxKind.NullKeyword
      )
        continue;
      const found = namedType(part);
      if (found) return found;
    }
    return null;
  }
  if (!ts.isTypeReferenceNode(node) || !ts.isIdentifier(node.typeName))
    return null;
  const name = node.typeName.text;
  if (WRAPPER_TYPES.has(name)) return namedType(node.typeArguments?.[0]);
  return name;
}

function literalKeys(node) {
  if (!node) return [];
  if (ts.isParenthesizedTypeNode(node)) return literalKeys(node.type);
  if (ts.isUnionTypeNode(node)) return node.types.flatMap(literalKeys);
  if (ts.isLiteralTypeNode(node)) {
    const value = propertyName(node.literal);
    return value == null ? [] : [value];
  }
  return [];
}

function typeMembers(node, registry) {
  if (!node) return null;
  if (ts.isParenthesizedTypeNode(node)) return typeMembers(node.type, registry);
  if (ts.isTypeLiteralNode(node)) return node.members;
  if (ts.isIntersectionTypeNode(node)) {
    const members = node.types.flatMap(
      (part) => typeMembers(part, registry) ?? []
    );
    return members.length > 0 ? members : null;
  }
  if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
    const name = node.typeName.text;
    if (WRAPPER_TYPES.has(name))
      return typeMembers(node.typeArguments?.[0], registry);
    if (name === "Omit") {
      const members = typeMembers(node.typeArguments?.[0], registry);
      if (!members) return null;
      const omitted = new Set(literalKeys(node.typeArguments?.[1]));
      return members.filter(
        (member) => !omitted.has(propertyName(member.name))
      );
    }
    return registry.get(name)?.members ?? null;
  }
  return null;
}

function isPrimitiveType(node) {
  if (!node) return true;
  if (PRIMITIVE_KINDS.has(node.kind) || ts.isLiteralTypeNode(node)) return true;
  if (ts.isUnionTypeNode(node)) return node.types.every(isPrimitiveType);
  if (ts.isParenthesizedTypeNode(node)) return isPrimitiveType(node.type);
  return false;
}

/** Parse interface/type-alias declarations from a set of source blobs. */
export function parseTypeRegistry(sources) {
  const registry = new Map();
  const ambiguous = new Set();
  for (const { file, text } of sources) {
    const source = sourceFileFor(file, text);
    for (const statement of source.statements) {
      let name = null;
      let members = null;
      let type = null;
      if (ts.isInterfaceDeclaration(statement)) {
        name = statement.name.text;
        members = statement.members;
      } else if (ts.isTypeAliasDeclaration(statement)) {
        name = statement.name.text;
        type = statement.type;
        members = typeMembers(statement.type, registry);
      }
      if (!name) continue;
      if (registry.has(name)) {
        ambiguous.add(name);
        continue;
      }
      registry.set(name, { name, members, type, file, node: statement });
    }
  }
  for (const name of ambiguous) registry.delete(name);
  return { registry, ambiguous: [...ambiguous].sort() };
}

function recordDescriptor(node) {
  if (!ts.isTypeReferenceNode(node) || !ts.isIdentifier(node.typeName))
    return null;
  if (
    node.typeName.text !== "Record" ||
    !node.typeArguments ||
    node.typeArguments.length < 2
  )
    return null;
  const keys = literalKeys(node.typeArguments[0]);
  return keys.length > 0 ? { keys, value: node.typeArguments[1] } : null;
}

function unwrapType(node) {
  if (ts.isParenthesizedTypeNode(node)) return unwrapType(node.type);
  if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
    if (WRAPPER_TYPES.has(node.typeName.text) && node.typeArguments?.[0]) {
      return unwrapType(node.typeArguments[0]);
    }
  }
  return node;
}

/**
 * Flatten the reachable, typed visual leaves below BrandTheme. Reused interface
 * leaves have one owner identity and retain every BrandTheme path that reaches
 * them (for example BrandPremiumCardChrome.bg has four theme paths).
 */
export function collectDeclaredThemeFields(
  registry,
  {
    rootType = "BrandTheme",
    visualRoots = DEFAULT_VISUAL_ROOTS,
    maxDepth = 16,
  } = {}
) {
  const fields = new Map();
  const unresolved = [];
  const root = registry.get(rootType);
  if (!root?.members)
    return {
      fields,
      unresolved: [{ path: rootType, reason: "root type not found" }],
    };
  const allowed = new Set(visualRoots);

  function add(owner, themePath, declarationFile) {
    const current = fields.get(owner) ?? {
      owner,
      themePaths: [],
      declarationFiles: [],
    };
    if (!current.themePaths.includes(themePath))
      current.themePaths.push(themePath);
    if (
      declarationFile &&
      !current.declarationFiles.includes(declarationFile)
    ) {
      current.declarationFiles.push(declarationFile);
    }
    fields.set(owner, current);
  }

  function expand(node, themePath, ownerPrefix, depth, stack, declarationFile) {
    if (depth > maxDepth) {
      unresolved.push({
        path: themePath,
        reason: `maximum depth ${maxDepth} reached`,
      });
      return;
    }
    const unwrapped = unwrapType(node);
    const record = recordDescriptor(unwrapped);
    if (record) {
      for (const key of record.keys) {
        const owner = `${ownerPrefix}.${key}`;
        if (isPrimitiveType(unwrapType(record.value)))
          add(owner, `${themePath}.${key}`, declarationFile);
        else
          expand(
            record.value,
            `${themePath}.${key}`,
            owner,
            depth + 1,
            stack,
            declarationFile
          );
      }
      return;
    }
    if (isPrimitiveType(unwrapped)) {
      add(ownerPrefix, themePath, declarationFile);
      return;
    }

    const refName = namedType(unwrapped);
    if (refName && registry.has(refName)) {
      if (stack.has(refName)) {
        unresolved.push({
          path: themePath,
          reason: `recursive type ${refName}`,
        });
        return;
      }
      const entry = registry.get(refName);
      const next = new Set(stack);
      next.add(refName);
      for (const member of entry.members ?? []) {
        if (!ts.isPropertySignature(member)) continue;
        const name = propertyName(member.name);
        if (!name) continue;
        expand(
          member.type,
          `${themePath}.${name}`,
          `${refName}.${name}`,
          depth + 1,
          next,
          entry.file
        );
      }
      return;
    }

    const members = typeMembers(unwrapped, registry);
    if (members) {
      for (const member of members) {
        if (!ts.isPropertySignature(member)) continue;
        const name = propertyName(member.name);
        if (!name) continue;
        expand(
          member.type,
          `${themePath}.${name}`,
          `${ownerPrefix}.${name}`,
          depth + 1,
          stack,
          declarationFile
        );
      }
      return;
    }
    unresolved.push({
      path: themePath,
      reason: `unresolved type ${unwrapped.getText?.() ?? "<unknown>"}`,
    });
  }

  for (const member of root.members) {
    if (!ts.isPropertySignature(member)) continue;
    const name = propertyName(member.name);
    if (!name || !allowed.has(name)) continue;
    expand(
      member.type,
      name,
      `${rootType}.${name}`,
      1,
      new Set([rootType]),
      root.file
    );
  }
  for (const field of fields.values()) {
    field.themePaths.sort();
    field.declarationFiles.sort();
  }
  unresolved.sort((a, b) => a.path.localeCompare(b.path));
  return { fields, unresolved };
}

function typeEntryForProperty(registry, typeName, property) {
  const entry = registry.get(typeName);
  const members =
    entry?.members ?? (entry?.type ? typeMembers(entry.type, registry) : null);
  if (!members) return null;
  const member = members.find(
    (candidate) =>
      ts.isPropertySignature(candidate) &&
      propertyName(candidate.name) === property
  );
  return member ? { member, type: member.type } : null;
}

function ownerForPath(registry, typeName, properties, ownerPrefix = typeName) {
  let currentType = typeName;
  let prefix = ownerPrefix;
  let currentNode = registry.get(typeName)?.type ?? null;
  let currentRecord = null;
  let owner = null;
  for (const property of properties) {
    if (currentRecord) {
      if (!currentRecord.keys.includes(property)) return null;
      owner = `${prefix}.${property}`;
      currentNode = currentRecord.value;
      currentRecord = recordDescriptor(unwrapType(currentNode));
      prefix = owner;
      currentType = namedType(unwrapType(currentNode));
      if (currentType && registry.has(currentType)) {
        prefix = currentType;
        currentRecord = null;
      } else {
        currentType = null;
      }
      continue;
    }
    let resolved = currentType
      ? typeEntryForProperty(registry, currentType, property)
      : null;
    if (!resolved && currentNode) {
      const members = typeMembers(currentNode, registry);
      const member = members?.find(
        (candidate) =>
          ts.isPropertySignature(candidate) &&
          propertyName(candidate.name) === property
      );
      if (member) resolved = { member, type: member.type };
    }
    if (!resolved) return null;
    owner = `${prefix}.${property}`;
    const node = unwrapType(resolved.type);
    const ref = namedType(node);
    if (ref && registry.has(ref)) {
      currentType = ref;
      prefix = ref;
      currentNode = registry.get(ref)?.type ?? null;
      continue;
    }
    const record = recordDescriptor(node);
    if (record) {
      currentType = null;
      prefix = owner;
      currentNode = record.value;
      currentRecord = record;
      continue;
    }
    currentType = null;
    prefix = owner;
    currentNode = node;
  }
  return owner;
}

function accessChain(node) {
  const properties = [];
  let cursor = node;
  while (
    ts.isPropertyAccessExpression(cursor) ||
    ts.isPropertyAccessChain(cursor)
  ) {
    properties.unshift(cursor.name.text);
    cursor = cursor.expression;
  }
  if (ts.isIdentifier(cursor)) return { base: cursor.text, properties };
  return null;
}

function rootTypeFromTypeNode(node) {
  return namedType(node);
}

function collectLiteralCallDomains(sourceFiles) {
  const domains = new Map();
  for (const source of sourceFiles) {
    function visit(node) {
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
        const fn = node.expression.text;
        const args = domains.get(fn) ?? new Map();
        node.arguments.forEach((argument, index) => {
          if (!ts.isStringLiteralLike(argument)) return;
          const values = args.get(index) ?? new Set();
          values.add(argument.text);
          args.set(index, values);
        });
        domains.set(fn, args);
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
  }
  return domains;
}

function cartesian(parts) {
  let values = [""];
  for (const part of parts) {
    values = values.flatMap((prefix) =>
      part.map((value) => `${prefix}${value}`)
    );
  }
  return values;
}

function keyCandidates(node, identifierDomains) {
  if (ts.isStringLiteralLike(node))
    return { concrete: [node.text], pattern: null };
  if (!ts.isTemplateExpression(node)) return { concrete: [], pattern: null };
  const parts = [[node.head.text]];
  let unresolved = false;
  for (const span of node.templateSpans) {
    let values = null;
    if (ts.isIdentifier(span.expression)) {
      values = [...(identifierDomains.get(span.expression.text) ?? [])].sort();
    }
    if (!values || values.length === 0) {
      values = ["*"];
      unresolved = true;
    }
    parts.push(values, [span.literal.text]);
  }
  const expanded = cartesian(parts);
  return unresolved
    ? { concrete: [], pattern: expanded[0] ?? null }
    : { concrete: expanded, pattern: null };
}

function patternRegex(pattern) {
  const escaped = pattern
    .split("*")
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("[a-z0-9-]+");
  return new RegExp(`^${escaped}$`, "i");
}

function findOwnersInExpression(node, environment, registry) {
  const owners = new Set();
  function visit(current) {
    if (
      ts.isPropertyAccessExpression(current) ||
      ts.isPropertyAccessChain(current)
    ) {
      const chain = accessChain(current);
      const root = chain ? environment.get(chain.base) : null;
      if (root) {
        const owner = ownerForPath(
          registry,
          root.typeName,
          [...(root.properties ?? []), ...chain.properties],
          root.ownerPrefix ?? root.typeName
        );
        if (owner) owners.add(owner);
      }
    } else if (ts.isIdentifier(current)) {
      for (const owner of environment.get(current.text)?.owners ?? [])
        owners.add(owner);
    }
    ts.forEachChild(current, visit);
  }
  visit(node);
  return owners;
}

function resolveAlias(node, environment, registry) {
  if (!node) return null;
  const owners = findOwnersInExpression(node, environment, registry);
  const chain = accessChain(node);
  if (!chain) return owners.size > 0 ? { owners } : null;
  const root = environment.get(chain.base);
  if (!root) return owners.size > 0 ? { owners } : null;
  let typeName = root.typeName;
  let ownerPrefix = root.ownerPrefix ?? typeName;
  let properties = [...(root.properties ?? [])];
  for (const property of chain.properties) {
    const resolved = typeEntryForProperty(registry, typeName, property);
    if (!resolved) {
      properties.push(property);
      return { typeName, ownerPrefix, properties, owners };
    }
    const ref = namedType(unwrapType(resolved.type));
    if (ref && registry.has(ref)) {
      typeName = ref;
      ownerPrefix = ref;
      properties = [];
    } else {
      properties.push(property);
    }
  }
  return { typeName, ownerPrefix, properties, owners };
}

const STATIC_MAP_KEBAB = (field) =>
  field.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

function recordKeyOwnerTypeName(typeNode) {
  if (!typeNode) return null;
  if (ts.isParenthesizedTypeNode(typeNode))
    return recordKeyOwnerTypeName(typeNode.type);
  if (!ts.isTypeReferenceNode(typeNode) || !ts.isIdentifier(typeNode.typeName))
    return null;
  const name = typeNode.typeName.text;
  if (WRAPPER_TYPES.has(name))
    return recordKeyOwnerTypeName(typeNode.typeArguments?.[0]);
  if (name !== "Record" || !typeNode.typeArguments?.length) return null;
  const keyArgument = typeNode.typeArguments[0];
  if (
    !ts.isTypeOperatorNode(keyArgument) ||
    keyArgument.operator !== ts.SyntaxKind.KeyOfKeyword
  )
    return null;
  const inner = keyArgument.type;
  if (!ts.isTypeReferenceNode(inner) || !ts.isIdentifier(inner.typeName))
    return null;
  return inner.typeName.text;
}

/**
 * Collect module-level exhaustive field→variable maps: either a literal
 * `{ field: "--ds-…" }` typed `Record<keyof T, string>` (annotation, `as` or
 * `satisfies`), or a `chromeVariableMap<T>("--ds-prefix-", [fields…])` call.
 * Both shapes are fully static, so crediting their entries as concrete
 * emissions cannot invent a channel — every field and destination is spelled
 * out in source and keyed by a registered contract type.
 */
function collectStaticVariableMaps(sourceFiles, registry) {
  const maps = new Map();
  for (const source of sourceFiles) {
    for (const statement of source.statements) {
      if (!ts.isVariableStatement(statement)) continue;
      for (const declaration of statement.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name) || !declaration.initializer)
          continue;
        let typeName = declaration.type
          ? recordKeyOwnerTypeName(declaration.type)
          : null;
        let expression = declaration.initializer;
        while (
          ts.isAsExpression(expression) ||
          ts.isSatisfiesExpression(expression) ||
          ts.isParenthesizedExpression(expression)
        ) {
          if (
            (ts.isAsExpression(expression) ||
              ts.isSatisfiesExpression(expression)) &&
            !typeName
          ) {
            typeName = recordKeyOwnerTypeName(expression.type);
          }
          expression = expression.expression;
        }
        const entries = new Map();
        if (ts.isObjectLiteralExpression(expression)) {
          let allStatic = expression.properties.length > 0;
          for (const property of expression.properties) {
            if (!ts.isPropertyAssignment(property)) {
              allStatic = false;
              break;
            }
            const field = propertyName(property.name);
            const value = unwrapStaticExpression(property.initializer);
            if (
              !field ||
              !value ||
              !ts.isStringLiteralLike(value) ||
              !value.text.startsWith("--ds-")
            ) {
              allStatic = false;
              break;
            }
            entries.set(field, value.text);
          }
          if (!allStatic) entries.clear();
        } else if (
          ts.isCallExpression(expression) &&
          ts.isIdentifier(expression.expression) &&
          expression.expression.text === "chromeVariableMap"
        ) {
          if (!typeName) {
            const typeArgument = expression.typeArguments?.[0];
            if (
              typeArgument &&
              ts.isTypeReferenceNode(typeArgument) &&
              ts.isIdentifier(typeArgument.typeName)
            ) {
              typeName = typeArgument.typeName.text;
            }
          }
          const prefixArgument = unwrapStaticExpression(
            expression.arguments[0]
          );
          const fieldsArgument = unwrapStaticExpression(
            expression.arguments[1]
          );
          const prefix =
            prefixArgument && ts.isStringLiteralLike(prefixArgument)
              ? prefixArgument.text
              : null;
          if (
            prefix?.startsWith("--ds-") &&
            fieldsArgument &&
            ts.isArrayLiteralExpression(fieldsArgument)
          ) {
            let allStatic = fieldsArgument.elements.length > 0;
            for (const rawElement of fieldsArgument.elements) {
              const element = unwrapStaticExpression(rawElement);
              if (!element || !ts.isStringLiteralLike(element)) {
                allStatic = false;
                break;
              }
              entries.set(
                element.text,
                `${prefix}${STATIC_MAP_KEBAB(element.text)}`
              );
            }
            if (!allStatic) entries.clear();
          }
        }
        if (!typeName || entries.size === 0 || !registry.has(typeName))
          continue;
        maps.set(declaration.name.text, {
          typeName,
          entries,
          file: source.fileName,
          nameNode: declaration.name,
        });
      }
    }
  }
  return maps;
}

/**
 * Parse compiler assignments into concrete/pattern CSS-variable emissions and
 * typed owner reads. The parser intentionally does not evaluate arbitrary JS;
 * the one sanctioned indirection is the static exhaustive field→variable map
 * (see collectStaticVariableMaps), whose referenced entries are credited as
 * concrete emissions owned by their contract type.
 */
export function parseEmitterMappings(sources, registry) {
  const sourceFiles = sources.map(({ file, text }) =>
    sourceFileFor(file, text)
  );
  const callDomains = collectLiteralCallDomains(sourceFiles);
  const emissions = [];
  const routedOwners = new Set();
  const unresolved = [];

  const staticMaps = collectStaticVariableMaps(sourceFiles, registry);
  if (staticMaps.size > 0) {
    const usedMaps = new Set();
    for (const source of sourceFiles) {
      const visitUse = (node) => {
        if (ts.isIdentifier(node) && staticMaps.has(node.text)) {
          const definition = staticMaps.get(node.text);
          if (node !== definition.nameNode) usedMaps.add(node.text);
        }
        ts.forEachChild(node, visitUse);
      };
      visitUse(source);
    }
    for (const name of usedMaps) {
      const { typeName, entries, file } = staticMaps.get(name);
      for (const [field, variable] of entries) {
        emissions.push({
          name: variable,
          pattern: null,
          owners: [`${typeName}.${field}`],
          file,
          functionName: `<static-map:${name}>`,
        });
      }
    }
  }

  for (const source of sourceFiles) {
    function analyzeFunction(node) {
      if (!node.body) return;
      const functionName = node.name?.text ?? "<anonymous>";
      const compilerOwner = `CompilerDerived.${functionName}`;
      const environment = new Map();
      const parameterIndex = new Map();
      const identifierDomains = new Map();
      node.parameters.forEach((parameter, index) => {
        if (!ts.isIdentifier(parameter.name)) return;
        const typeName = rootTypeFromTypeNode(parameter.type);
        if (typeName && registry.has(typeName)) {
          environment.set(parameter.name.text, {
            typeName,
            ownerPrefix: typeName,
            properties: [],
            owners: new Set(),
          });
        }
        parameterIndex.set(parameter.name.text, index);
      });
      const domains = callDomains.get(functionName) ?? new Map();
      for (const [name, index] of parameterIndex) {
        const values = domains.get(index);
        if (values?.size) identifierDomains.set(name, new Set(values));
      }

      function walk(current, guards = []) {
        if (
          ts.isVariableDeclaration(current) &&
          ts.isIdentifier(current.name) &&
          current.initializer
        ) {
          const alias = resolveAlias(
            current.initializer,
            environment,
            registry
          );
          if (alias) environment.set(current.name.text, alias);
          const strings = keyCandidates(current.initializer, identifierDomains);
          if (strings.concrete.length > 0) {
            identifierDomains.set(current.name.text, new Set(strings.concrete));
          }
        }

        if (
          ts.isPropertyAccessExpression(current) ||
          ts.isPropertyAccessChain(current)
        ) {
          for (const owner of findOwnersInExpression(
            current,
            environment,
            registry
          ))
            routedOwners.add(owner);
        }

        if (
          ts.isBinaryExpression(current) &&
          current.operatorToken.kind === ts.SyntaxKind.EqualsToken
        ) {
          const left = current.left;
          if (ts.isElementAccessExpression(left) && left.argumentExpression) {
            const keys = keyCandidates(
              left.argumentExpression,
              identifierDomains
            );
            const ownerSet = findOwnersInExpression(
              current.right,
              environment,
              registry
            );
            for (const guard of guards) {
              for (const owner of findOwnersInExpression(
                guard,
                environment,
                registry
              ))
                ownerSet.add(owner);
            }
            // A fixed or mechanically derived compiler output is still owned:
            // its contract is the named compiler function, not an editable
            // BrandTheme leaf. Treating it as unowned would encourage exposing
            // choreography, scale aliases, or other implementation constants
            // through TenantTheme merely to make the parity graph green.
            if (ownerSet.size === 0) ownerSet.add(compilerOwner);
            const owners = [...ownerSet].sort();
            for (const name of keys.concrete.filter((candidate) =>
              candidate.startsWith("--ds-")
            )) {
              emissions.push({
                name,
                pattern: null,
                owners,
                file: source.fileName,
                functionName,
              });
            }
            if (keys.pattern?.startsWith("--ds-")) {
              emissions.push({
                name: null,
                pattern: keys.pattern,
                owners,
                file: source.fileName,
                functionName,
              });
            }
          }
        }

        if (ts.isPropertyAssignment(current)) {
          const name = propertyName(current.name);
          if (name?.startsWith("--ds-")) {
            const ownerSet = findOwnersInExpression(
              current.initializer,
              environment,
              registry
            );
            if (ownerSet.size === 0) ownerSet.add(compilerOwner);
            const owners = [...ownerSet].sort();
            emissions.push({
              name,
              pattern: null,
              owners,
              file: source.fileName,
              functionName,
            });
          }
        }

        if (ts.isIfStatement(current)) {
          walk(current.expression, guards);
          walk(current.thenStatement, [...guards, current.expression]);
          if (current.elseStatement) walk(current.elseStatement, guards);
          return;
        }
        ts.forEachChild(current, (child) => walk(child, guards));
      }
      walk(node.body);
    }

    function visit(node) {
      if (ts.isFunctionDeclaration(node)) analyzeFunction(node);
      ts.forEachChild(node, visit);
    }
    visit(source);
  }

  const bySignature = new Map();
  for (const emission of emissions) {
    const signature = `${
      emission.name ?? emission.pattern
    }|${emission.owners.join(",")}`;
    if (!bySignature.has(signature)) bySignature.set(signature, emission);
  }
  const deduped = [...bySignature.values()].sort((a, b) =>
    (a.name ?? a.pattern).localeCompare(b.name ?? b.pattern)
  );
  for (const emission of deduped) {
    if (!emission.name && !emission.pattern) unresolved.push(emission);
  }
  return { emissions: deduped, routedOwners, unresolved };
}

function unwrapStaticExpression(node) {
  let current = node;
  while (
    current &&
    (ts.isAsExpression(current) ||
      ts.isSatisfiesExpression(current) ||
      ts.isParenthesizedExpression(current) ||
      ts.isNonNullExpression(current))
  ) {
    current = current.expression;
  }
  return current;
}

/**
 * Evaluate the deliberately small, data-only subset used by closed token
 * manifests: const arrays, spreads, map/flatMap and string templates. This is
 * not a JavaScript evaluator; unknown expressions fail closed to an empty set.
 */
function evaluateStaticStringArray(
  node,
  declarations,
  bindings = new Map(),
  stack = new Set()
) {
  const current = unwrapStaticExpression(node);
  if (!current) return [];

  if (ts.isStringLiteralLike(current)) return [current.text];

  if (ts.isIdentifier(current)) {
    if (bindings.has(current.text)) return [bindings.get(current.text)];
    const initializer = declarations.get(current.text);
    if (!initializer || stack.has(current.text)) return [];
    const nextStack = new Set(stack).add(current.text);
    return evaluateStaticStringArray(
      initializer,
      declarations,
      bindings,
      nextStack
    );
  }

  if (ts.isTemplateExpression(current)) {
    let value = current.head.text;
    for (const span of current.templateSpans) {
      const resolved = evaluateStaticStringArray(
        span.expression,
        declarations,
        bindings,
        stack
      );
      if (resolved.length !== 1) return [];
      value += `${resolved[0]}${span.literal.text}`;
    }
    return [value];
  }

  if (ts.isArrayLiteralExpression(current)) {
    const values = [];
    for (const element of current.elements) {
      const expression = ts.isSpreadElement(element)
        ? element.expression
        : element;
      values.push(
        ...evaluateStaticStringArray(expression, declarations, bindings, stack)
      );
    }
    return values;
  }

  if (
    ts.isCallExpression(current) &&
    ts.isPropertyAccessExpression(current.expression) &&
    (current.expression.name.text === "map" ||
      current.expression.name.text === "flatMap")
  ) {
    const input = evaluateStaticStringArray(
      current.expression.expression,
      declarations,
      bindings,
      stack
    );
    const callback = current.arguments[0];
    if (
      !callback ||
      (!ts.isArrowFunction(callback) && !ts.isFunctionExpression(callback))
    )
      return [];
    const parameter = callback.parameters[0]?.name;
    if (!parameter || !ts.isIdentifier(parameter)) return [];
    const output = [];
    for (const value of input) {
      const local = new Map(bindings).set(parameter.text, value);
      const body = ts.isBlock(callback.body)
        ? callback.body.statements.find(ts.isReturnStatement)?.expression
        : callback.body;
      output.push(
        ...evaluateStaticStringArray(body, declarations, local, stack)
      );
    }
    return output;
  }

  return [];
}

/** Extract the resolved closed string set from a named exported array. */
export function extractStringArrayExport(
  text,
  exportName,
  file = "contract.ts"
) {
  const source = sourceFileFor(file, text);
  const declarations = new Map();
  function collect(node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.initializer
    ) {
      declarations.set(node.name.text, node.initializer);
    }
    ts.forEachChild(node, collect);
  }
  collect(source);
  return new Set(
    evaluateStaticStringArray(
      declarations.get(exportName),
      declarations
    ).filter((value) => value.startsWith("--ds-"))
  );
}

/** Extract actual `var(--ds-*)` reads, excluding comments. */
export function extractConsumedCssVariables(text, file = "consumer.css") {
  const clean = /\.(?:ts|tsx|js|jsx|mjs|cjs)$/i.test(file)
    ? stripScriptComments(text, file)
    : text.replace(/\/\*[\s\S]*?\*\//g, " ");
  const names = new Set();
  for (const match of clean.matchAll(/var\(\s*(--ds-[a-z0-9-]+)/gi))
    names.add(match[1]);
  return names;
}

function namespaceOf(name) {
  return /^--ds-([a-z0-9]+)(?:-|$)/i.exec(name)?.[1]?.toLowerCase() ?? null;
}

function emissionPatternMatches(pattern, name) {
  return patternRegex(pattern).test(name);
}

/** Build the four-node parity graph and the three requested defect sets. */
export function buildThemeChannelParityGraph({
  declarations,
  emissions,
  routedOwners = new Set(),
  consumers,
  overrideTokens = new Set(),
}) {
  const emittedNames = new Set();
  const emittedPatterns = [];
  const ownersByVariable = new Map();
  const emittedOwners = new Set();
  for (const emission of emissions) {
    if (emission.name) emittedNames.add(emission.name);
    if (emission.pattern) emittedPatterns.push(emission);
    if (emission.name) {
      const owners = ownersByVariable.get(emission.name) ?? new Set();
      for (const owner of emission.owners) {
        owners.add(owner);
        emittedOwners.add(owner);
      }
      ownersByVariable.set(emission.name, owners);
    }
    for (const owner of emission.owners) emittedOwners.add(owner);
  }
  for (const token of overrideTokens) {
    const owners = ownersByVariable.get(token) ?? new Set();
    owners.add(`TenantThemeOverrideToken.${token}`);
    ownersByVariable.set(token, owners);
  }

  const declaredButUnemitted = [...declarations.values()]
    .filter(
      (field) =>
        !emittedOwners.has(field.owner) && !routedOwners.has(field.owner)
    )
    .map((field) => ({ ...field, id: field.owner }))
    .sort((a, b) => a.id.localeCompare(b.id));

  const emittedButUnconsumed = [...emittedNames]
    .filter((name) => !consumers.has(name))
    .map((name) => ({
      id: name,
      variable: name,
      owners: [...(ownersByVariable.get(name) ?? [])].sort(),
    }))
    .sort((a, b) => a.id.localeCompare(b.id));

  const managedNamespaces = new Set(
    [...emittedNames, ...overrideTokens].map(namespaceOf).filter(Boolean)
  );
  for (const emission of emittedPatterns) {
    const namespace = namespaceOf(emission.pattern);
    if (namespace) managedNamespaces.add(namespace);
  }

  // The graph starts at the tenant/BrandTheme contract, not at every base DS
  // token. A consumer-only `--ds-*` name is therefore in scope only when the
  // inspected compiler emits it (concretely or by pattern) or the tenant
  // override contract exposes it. Namespace-prefix matching was intentionally
  // rejected here: `--ds-color-*`, `--ds-card-*`, etc. also contain thousands
  // of foundation-only variables whose owners live in a different catalog.
  const consumedButUnowned = [...consumers.entries()]
    .filter(
      ([name]) =>
        emittedNames.has(name) ||
        overrideTokens.has(name) ||
        emittedPatterns.some((emission) =>
          emissionPatternMatches(emission.pattern, name)
        )
    )
    .filter(([name]) => {
      if ((ownersByVariable.get(name)?.size ?? 0) > 0) return false;
      return !emittedPatterns.some(
        (emission) =>
          emission.owners.length > 0 &&
          emissionPatternMatches(emission.pattern, name)
      );
    })
    .map(([name, files]) => ({
      id: name,
      variable: name,
      consumerFiles: [...files].sort(),
    }))
    .sort((a, b) => a.id.localeCompare(b.id));

  return {
    nodes: {
      declaredFields: declarations.size,
      emittedVariables: emittedNames.size,
      emittedPatterns: emittedPatterns.length,
      consumedVariables: consumers.size,
      typedOwnedVariables: [...ownersByVariable.values()].filter(
        (owners) => owners.size > 0
      ).length,
    },
    issues: { declaredButUnemitted, emittedButUnconsumed, consumedButUnowned },
    managedNamespaces: [...managedNamespaces].sort(),
  };
}

function bucketForOwner(owner) {
  return owner.split(".")[0] || "unknown";
}

function bucketForVariable(variable) {
  return namespaceOf(variable) ?? "unknown";
}

/** Count totals and stable owner/variable-family buckets for a decrease-only ratchet. */
export function buildParityCounters(graph) {
  const counters = {};
  const categories = [
    [
      "declared-but-unemitted",
      graph.issues.declaredButUnemitted,
      (issue) => bucketForOwner(issue.owner),
    ],
    [
      "emitted-but-unconsumed",
      graph.issues.emittedButUnconsumed,
      (issue) => bucketForVariable(issue.variable),
    ],
    [
      "consumed-but-unowned",
      graph.issues.consumedButUnowned,
      (issue) => bucketForVariable(issue.variable),
    ],
  ];
  for (const [category, issues, bucket] of categories) {
    counters[`${category}.total`] = issues.length;
    for (const issue of issues) {
      const key = `${category}.${bucket(issue)}`;
      counters[key] = (counters[key] ?? 0) + 1;
    }
  }
  return Object.fromEntries(
    Object.entries(counters).sort(([a], [b]) => a.localeCompare(b))
  );
}

/** Decrease-only evaluation; a new nonzero bucket cannot be silently absorbed. */
export function evaluateParityBaseline(current, baseline) {
  const errors = [];
  const tighten = [];
  const ceilings = baseline?.ceilings;
  if (!ceilings || typeof ceilings !== "object" || Array.isArray(ceilings)) {
    return {
      ok: false,
      errors: ["baseline.ceilings must be an object"],
      tighten,
    };
  }
  for (const [key, count] of Object.entries(current)) {
    if (!Number.isSafeInteger(count) || count < 0)
      errors.push(`invalid current counter ${key}=${count}`);
    if (!Object.hasOwn(ceilings, key)) {
      if (count > 0) errors.push(`new unbaselined bucket: ${key}=${count}`);
      continue;
    }
    const ceiling = ceilings[key];
    if (!Number.isSafeInteger(ceiling) || ceiling < 0) {
      errors.push(`invalid baseline ceiling ${key}=${ceiling}`);
      continue;
    }
    if (count > ceiling)
      errors.push(`parity regression: ${key}=${count}; baseline=${ceiling}`);
    if (count < ceiling) tighten.push(`${key}: ${ceiling} -> ${count}`);
  }
  for (const [key, ceiling] of Object.entries(ceilings)) {
    if (!Object.hasOwn(current, key) && ceiling > 0)
      tighten.push(`${key}: ${ceiling} -> 0`);
  }
  return {
    ok: errors.length === 0,
    errors,
    tighten: [...new Set(tighten)].sort(),
  };
}
