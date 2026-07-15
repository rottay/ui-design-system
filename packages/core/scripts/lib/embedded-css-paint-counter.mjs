import { readFileSync, realpathSync } from "node:fs";
import { dirname, extname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";
import ts from "typescript";

const CSS_PAINT_PROPERTIES = new Set([
  "accent-color",
  "backdrop-filter",
  "box-shadow",
  "color",
  "fill",
  "filter",
  "stroke",
  "text-shadow",
  "transform",
  "-webkit-backdrop-filter",
]);
const CSS_PAINT_PREFIXES = ["background", "border", "outline"];
const CSS_PAINT_EXEMPT = new Set(["border-collapse", "border-spacing"]);

// These generators are deliberate data CSS channels, not opaque escape
// hatches. `generateResponsiveCSS` is driven by the component responsive-prop
// contract (layout/typography only), `generateResponsiveGridCSS` emits grid
// layout, and `generateTenantCss` emits tenant custom-property definitions.
// Everything else used as a whole stylesheet root must be source-resolvable or
// it fails closed. Runtime fragments interpolated *inside* a classified source
// template remain data and are handled separately below.
const CERTIFIED_DATA_CSS_IMPORTS = new Map([
  [
    "generateResponsiveCSS",
    "src/components/primitives/layout/shared/responsive-props",
  ],
  [
    "generateResponsiveGridCSS",
    "src/components/primitives/layout/Grid/shared/responsive",
  ],
  ["generateTenantCss", "src/runtime/tenant/storage/static/generator"],
]);
const CORE_PACKAGE_ROOT = realpathSync(
  resolve(dirname(fileURLToPath(import.meta.url)), "../..")
);
const MODULE_RESOLUTION_SUFFIXES = [
  "",
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  "/index.ts",
  "/index.tsx",
  "/index.js",
  "/index.jsx",
  "/index.mjs",
  "/index.cjs",
];

function canonicalModulePath(modulePath) {
  for (const suffix of MODULE_RESOLUTION_SUFFIXES) {
    try {
      return realpathSync(`${modulePath}${suffix}`);
    } catch {
      // Try the next source extension / directory index candidate.
    }
  }
  return null;
}

function isInsideCorePackage(path) {
  const packageRelative = relative(CORE_PACKAGE_ROOT, path);
  return (
    packageRelative.length > 0 &&
    packageRelative !== ".." &&
    !packageRelative.startsWith(
      `..${process.platform === "win32" ? "\\" : "/"}`
    ) &&
    !isAbsolute(packageRelative)
  );
}

export function isEmbeddedCssPaintProperty(property) {
  const normalized = property.trim().toLowerCase();
  if (normalized.startsWith("--") || CSS_PAINT_EXEMPT.has(normalized)) {
    return false;
  }
  return (
    CSS_PAINT_PROPERTIES.has(normalized) ||
    CSS_PAINT_PREFIXES.some((prefix) => normalized.startsWith(prefix))
  );
}

function scriptKindFor(fileName) {
  switch (extname(fileName).toLowerCase()) {
    case ".js":
    case ".mjs":
    case ".cjs":
      return ts.ScriptKind.JS;
    case ".jsx":
      return ts.ScriptKind.JSX;
    case ".ts":
    case ".mts":
    case ".cts":
      return ts.ScriptKind.TS;
    case ".tsx":
      return ts.ScriptKind.TSX;
    default:
      return ts.ScriptKind.Unknown;
  }
}

function parseSource(text, fileName) {
  const sourceFile = ts.createSourceFile(
    fileName,
    text,
    ts.ScriptTarget.Latest,
    true,
    scriptKindFor(fileName)
  );
  const [diagnostic] = sourceFile.parseDiagnostics;
  if (diagnostic) {
    const start = diagnostic.start ?? 0;
    const { line, character } = sourceFile.getLineAndCharacterOfPosition(start);
    throw new SyntaxError(
      `Cannot count embedded CSS paint in ${fileName}:${line + 1}:${
        character + 1
      }: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, " ")}`
    );
  }
  return sourceFile;
}

function unwrapExpression(node) {
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
  return expression;
}

function sourceLocation(sourceFile, node) {
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(
    node.getStart(sourceFile)
  );
  return { line: line + 1, column: character + 1 };
}

function staticPropertyName(name) {
  if (ts.isIdentifier(name) || ts.isStringLiteralLike(name)) return name.text;
  if (ts.isComputedPropertyName(name)) {
    const expression = unwrapExpression(name.expression);
    return expression && ts.isStringLiteralLike(expression)
      ? expression.text
      : null;
  }
  return null;
}

function jsxOpeningLike(node) {
  const openingLike = node.parent?.parent;
  return openingLike &&
    (ts.isJsxOpeningElement(openingLike) ||
      ts.isJsxSelfClosingElement(openingLike))
    ? openingLike
    : null;
}

function jsxAttributeExpression(attribute) {
  const initializer = attribute.initializer;
  return initializer && ts.isJsxExpression(initializer)
    ? initializer.expression ?? null
    : null;
}

function looksLikeCss(text) {
  return (
    text.includes("{") ||
    /(?:^|[;\s])(?:--[\w-]+|[a-zA-Z][\w-]*)\s*:/.test(text) ||
    /@(keyframes|media|supports|container|layer|font-face|property)\b/i.test(
      text
    )
  );
}

function interpolationContext(prefix, suffix) {
  const trimmedSuffix = suffix.trimStart();
  const lastOpen = prefix.lastIndexOf("{");
  const lastClose = prefix.lastIndexOf("}");
  const insideBlock = lastOpen > lastClose;
  const blockTail = prefix.slice(
    Math.max(lastOpen, prefix.lastIndexOf(";")) + 1
  );

  if (
    insideBlock &&
    blockTail.trim().length === 0 &&
    trimmedSuffix.startsWith(":")
  ) {
    return "property";
  }
  if (insideBlock && blockTail.includes(":")) return "value";
  if (!insideBlock && /[^\s}]/.test(prefix.slice(lastClose + 1))) {
    return "selector";
  }
  return "fragment";
}

function templateOwnCss(template, sourceFile) {
  if (ts.isNoSubstitutionTemplateLiteral(template)) {
    return {
      text: template.text,
      dynamicProperties: [],
      fragmentExpressions: [],
    };
  }

  let text = template.head.text;
  const dynamicProperties = [];
  const fragmentExpressions = [];
  for (let index = 0; index < template.templateSpans.length; index += 1) {
    const span = template.templateSpans[index];
    const suffix = span.literal.text;
    const context = interpolationContext(text, suffix);
    if (context === "property") {
      dynamicProperties.push({
        expression: span.expression.getText(sourceFile),
        ...sourceLocation(sourceFile, span.expression),
      });
      text += `--__embedded_dynamic_property_${index}`;
    } else if (context === "value") {
      text += `var(--__embedded_css_expression_${index})`;
    } else if (context === "selector") {
      text += `embedded-css-expression-${index}`;
    } else {
      fragmentExpressions.push(span.expression);
      text += `/*__embedded_css_fragment_${index}__*/`;
    }
    text += suffix;
  }
  return { text, dynamicProperties, fragmentExpressions };
}

function isLexicalScope(node) {
  return (
    ts.isSourceFile(node) ||
    ts.isBlock(node) ||
    ts.isModuleBlock(node) ||
    ts.isFunctionLike(node)
  );
}

function nearestScope(node) {
  let current = node;
  while (current && !isLexicalScope(current)) current = current.parent;
  return current ?? null;
}

function addBinding(scopes, scope, name, entry) {
  if (!scope) return;
  let bindings = scopes.get(scope);
  if (!bindings) {
    bindings = new Map();
    scopes.set(scope, bindings);
  }
  const entries = bindings.get(name) ?? [];
  entries.push(entry);
  bindings.set(name, entries);
}

  function addBindingName(scopes, scope, name, entry) {
  if (ts.isIdentifier(name)) {
    addBinding(scopes, scope, name.text, entry);
    return;
  }
    if (ts.isObjectBindingPattern(name) || ts.isArrayBindingPattern(name)) {
      for (const element of name.elements) {
        if (ts.isBindingElement(element)) {
          const bindingSource = entry.bindingSource ?? entry.initializer ?? null;
          addBindingName(scopes, scope, element.name, {
            ...entry,
            initializer: element.initializer ?? null,
            bindingSource,
            boundProperty: ts.isObjectBindingPattern(name)
              ? element.propertyName
                ? staticPropertyName(element.propertyName)
                : ts.isIdentifier(element.name)
                ? element.name.text
                : null
              : null,
          });
        }
      }
  }
}

/**
 * Build a deliberately small lexical binder. File-global name maps silently
 * lose both sides when two components use the same local `CSS` identifier;
 * resolving from the use-site's nearest scope keeps those independent.
 */
function collectLexicalBindings(sourceFile) {
  const scopes = new Map();

  function importSource(node) {
    let current = node;
    while (current && !ts.isImportDeclaration(current))
      current = current.parent;
    return current && ts.isStringLiteralLike(current.moduleSpecifier)
      ? current.moduleSpecifier.text
      : null;
  }

  function declarationScope(node, blockScoped = true) {
    let current = node.parent;
    while (current) {
      if (blockScoped && isLexicalScope(current)) return current;
      if (
        !blockScoped &&
        (ts.isFunctionLike(current) || ts.isSourceFile(current))
      ) {
        return current;
      }
      current = current.parent;
    }
    return sourceFile;
  }

  function visit(node) {
    if (ts.isVariableDeclaration(node)) {
      const list = ts.isVariableDeclarationList(node.parent)
        ? node.parent
        : null;
      const blockScoped = Boolean(
        list?.flags & (ts.NodeFlags.Let | ts.NodeFlags.Const)
      );
      addBindingName(scopes, declarationScope(node, blockScoped), node.name, {
        kind: "variable",
        initializer: node.initializer ?? null,
        declaration: node,
      });
    } else if (ts.isParameter(node)) {
      addBindingName(scopes, nearestScope(node.parent), node.name, {
        kind: "parameter",
        initializer: node.initializer ?? null,
        declaration: node,
      });
    } else if (ts.isFunctionDeclaration(node) && node.name) {
      addBinding(scopes, declarationScope(node), node.name.text, {
        kind: "function",
        initializer: node,
        declaration: node,
      });
    } else if (ts.isImportClause(node) && node.name) {
      addBinding(scopes, sourceFile, node.name.text, {
        kind: "import",
        initializer: null,
        declaration: node,
        importedName: "default",
        importSource: importSource(node),
      });
    } else if (ts.isImportSpecifier(node)) {
      addBinding(scopes, sourceFile, node.name.text, {
        kind: "import",
        initializer: null,
        declaration: node,
        importedName: node.propertyName?.text ?? node.name.text,
        importSource: importSource(node),
      });
    } else if (ts.isNamespaceImport(node)) {
      addBinding(scopes, sourceFile, node.name.text, {
        kind: "import",
        initializer: null,
        declaration: node,
        importedName: "*",
        importSource: importSource(node),
      });
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);

  function resolveBinding(identifier) {
    let scope = nearestScope(identifier);
    while (scope) {
      const entries = scopes.get(scope)?.get(identifier.text);
      if (entries) {
        return entries.length === 1
          ? { status: "resolved", entry: entries[0] }
          : { status: "ambiguous", entries };
      }
      scope = nearestScope(scope.parent);
    }
    return { status: "missing" };
  }

  // Keep simple reassignments attached to the exact lexical binding. Style
  // nodes are commonly declared before an effect and assigned inside it; an
  // initializer-only binder silently misses those sinks.
  function collectAssignments(node) {
    if (
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.EqualsToken
    ) {
      const left = unwrapExpression(node.left);
      if (left && ts.isIdentifier(left)) {
        const binding = resolveBinding(left);
        if (
          binding.status === "resolved" &&
          binding.entry.kind === "variable"
        ) {
          const assignments = binding.entry.assignments ?? [];
          assignments.push({
            expression: node.right,
            declaration: node,
          });
          binding.entry.assignments = assignments;
        }
      }
    }
    ts.forEachChild(node, collectAssignments);
  }
  collectAssignments(sourceFile);

  return resolveBinding;
}

/**
 * Count source-authored paint declarations in CSS that is demonstrably injected
 * through an intrinsic `<style>` element. Arbitrary runtime fragments remain a
 * data channel: only literal/template declarations authored in this source are
 * counted. Malformed CSS and computed property names fail closed as one gate
 * site each instead of certifying a false zero.
 */
export function analyzeEmbeddedCssPaint(text, fileName = "source.tsx") {
  const sourceFile = parseSource(text, fileName);
  const resolveBinding = collectLexicalBindings(sourceFile);
  const roots = [];
  const seenExpressions = new Set();
  const seenCssLiterals = new Set();
  const seenUnknownSinks = new Set();
  const sites = [];
  const parseFailures = [];
  const dynamicProperties = [];
  const unknownSinks = [];
  let cssLiterals = 0;

  function recordUnknownSink(
    node,
    kind,
    expression = node.getText(sourceFile)
  ) {
    const identity = `${node.pos}:${node.end}:${kind}`;
    if (seenUnknownSinks.has(identity)) return;
    seenUnknownSinks.add(identity);
    unknownSinks.push({
      kind,
      expression,
      ...sourceLocation(sourceFile, node),
    });
  }

  function resolveStaticString(node, seen = new Set()) {
    const expression = unwrapExpression(node);
    if (!expression) return null;
    const identity = `${expression.pos}:${expression.end}:${expression.kind}`;
    if (seen.has(identity)) return null;
    seen.add(identity);
    if (
      ts.isStringLiteralLike(expression) ||
      ts.isNoSubstitutionTemplateLiteral(expression)
    ) {
      return expression.text;
    }
    if (ts.isTemplateExpression(expression)) {
      let value = expression.head.text;
      for (const span of expression.templateSpans) {
        const interpolated = resolveStaticString(span.expression, new Set(seen));
        if (interpolated === null) return null;
        value += interpolated + span.literal.text;
      }
      return value;
    }
    if (
      ts.isBinaryExpression(expression) &&
      expression.operatorToken.kind === ts.SyntaxKind.PlusToken
    ) {
      const left = resolveStaticString(expression.left, new Set(seen));
      const right = resolveStaticString(expression.right, new Set(seen));
      return left === null || right === null ? null : left + right;
    }
    if (ts.isConditionalExpression(expression)) {
      const whenTrue = resolveStaticString(expression.whenTrue, new Set(seen));
      const whenFalse = resolveStaticString(expression.whenFalse, new Set(seen));
      return whenTrue !== null && whenTrue === whenFalse ? whenTrue : null;
    }
    if (ts.isIdentifier(expression)) {
      const binding = resolveBinding(expression);
      if (binding.status !== "resolved") return null;
      const value = bindingValueBeforeUse(binding.entry, expression);
      return value ? resolveStaticString(value, seen) : null;
    }
    return null;
  }

  function accessName(expression) {
    if (ts.isPropertyAccessExpression(expression)) return expression.name.text;
    if (
      ts.isElementAccessExpression(expression) &&
      expression.argumentExpression
    ) {
      return resolveStaticString(expression.argumentExpression);
    }
    return null;
  }

  function accessReceiver(expression) {
    return ts.isPropertyAccessExpression(expression) ||
      ts.isElementAccessExpression(expression)
      ? expression.expression
      : null;
  }

  function isDocumentExpression(node, seen = new Set()) {
    const expression = unwrapExpression(node);
    if (!expression) return false;
    if (
      (ts.isPropertyAccessExpression(expression) ||
        ts.isElementAccessExpression(expression)) &&
      accessName(expression) === "document"
    ) {
      const receiver = unwrapExpression(expression.expression);
      if (receiver && ts.isIdentifier(receiver)) {
        const binding = resolveBinding(receiver);
        if (
          ["window", "globalThis", "self"].includes(receiver.text) &&
          binding.status === "missing"
        ) {
          return true;
        }
        if (binding.status === "resolved" && binding.entry.initializer) {
          const target = unwrapExpression(binding.entry.initializer);
          return Boolean(
            target &&
              ts.isIdentifier(target) &&
              ["window", "globalThis", "self"].includes(target.text) &&
              resolveBinding(target).status === "missing"
          );
        }
      }
      return false;
    }
    if (!ts.isIdentifier(expression)) return false;
    const identity = `${expression.pos}:${expression.end}`;
    if (seen.has(identity)) return false;
    seen.add(identity);
    const binding = resolveBinding(expression);
    if (expression.text === "document" && binding.status === "missing") {
      return true;
    }
    if (
      binding.status === "resolved" &&
      binding.entry.boundProperty === "document"
    ) {
      const source = unwrapExpression(binding.entry.bindingSource);
      if (source && ts.isIdentifier(source)) {
        const sourceBinding = resolveBinding(source);
        if (
          ["window", "globalThis", "self"].includes(source.text) &&
          sourceBinding.status === "missing"
        ) {
          return true;
        }
      }
    }
    return (
      binding.status === "resolved" &&
      binding.entry.initializer &&
      isDocumentExpression(binding.entry.initializer, seen)
    );
  }

  function isDocumentCreateElementCall(node) {
    const expression = unwrapExpression(node);
    if (!expression || !ts.isCallExpression(expression)) return null;
    const invocation = normalizeInvocation(expression);
    if (
      !invocation ||
      !["createElement", "createElementNS"].includes(invocation.target.name) ||
      !invocation.receiver ||
      !isDocumentExpression(invocation.receiver)
    ) {
      return null;
    }
    if (!invocation.args) return "maybe";
    const tagIndex = invocation.target.name === "createElementNS" ? 1 : 0;
    const tag = invocation.args[tagIndex]
      ? resolveStaticString(invocation.args[tagIndex])
      : null;
    return tag?.toLowerCase() === "style"
      ? "style"
      : tag === null
      ? "maybe"
      : "not-style";
  }

  function mergeStatuses(statuses) {
    const relevant = statuses.filter((status) => status !== "not-style");
    if (relevant.length === 0) return "not-style";
    return relevant.every((status) => status === "style") &&
      relevant.length === statuses.length
      ? "style"
      : "maybe";
  }

  function executionScope(node) {
    let current = node;
    while (
      current &&
      !ts.isFunctionLike(current) &&
      !ts.isSourceFile(current)
    ) {
      current = current.parent;
    }
    return current ?? sourceFile;
  }

  function bindingValueBeforeUse(entry, useNode) {
    const useStart = useNode.getStart(sourceFile);
    const scope = executionScope(useNode);
    const assignments = (entry.assignments ?? [])
      .filter(
        ({ declaration }) =>
          declaration.getStart(sourceFile) < useStart &&
          executionScope(declaration) === scope
      )
      .sort(
        (left, right) =>
          left.declaration.getStart(sourceFile) -
          right.declaration.getStart(sourceFile)
      );
    return assignments.at(-1)?.expression ?? entry.initializer ?? null;
  }

  function isReflectExpression(node) {
    const expression = unwrapExpression(node);
    if (!expression || !ts.isIdentifier(expression)) return false;
    const binding = resolveBinding(expression);
    return expression.text === "Reflect" && binding.status === "missing";
  }

  function staticArgumentList(node, seen = new Set()) {
    const expression = unwrapExpression(node);
    if (!expression || seen.has(expression)) return null;
    seen.add(expression);
    if (ts.isArrayLiteralExpression(expression)) {
      const result = [];
      for (const element of expression.elements) {
        if (ts.isOmittedExpression(element)) return null;
        if (ts.isSpreadElement(element)) {
          const nested = staticArgumentList(element.expression, new Set(seen));
          if (!nested) return null;
          result.push(...nested);
        } else {
          result.push(element);
        }
      }
      return result;
    }
    if (ts.isIdentifier(expression)) {
      const binding = resolveBinding(expression);
      if (binding.status !== "resolved" || seen.has(binding.entry)) return null;
      seen.add(binding.entry);
      const value = bindingValueBeforeUse(binding.entry, expression);
      return value ? staticArgumentList(value, seen) : null;
    }
    return null;
  }

  /**
   * Normalize the productive JS spellings of a callable member. The paint
   * audit must see the same sink through direct calls, lexical aliases,
   * destructuring, bind/call/apply, and Reflect.get/apply.
   */
  function resolveCallableExpression(node, seen = new Set()) {
    const expression = unwrapExpression(node);
    if (!expression || seen.has(expression)) return null;
    seen.add(expression);

    if (
      ts.isPropertyAccessExpression(expression) ||
      ts.isElementAccessExpression(expression)
    ) {
      return {
        name: accessName(expression),
        receiver: expression.expression,
        boundArgs: [],
        boundThis: false,
        moduleSource: null,
      };
    }

    if (ts.isIdentifier(expression)) {
      const binding = resolveBinding(expression);
      if (binding.status === "missing") {
        return {
          name: expression.text,
          receiver: null,
          boundArgs: [],
          boundThis: false,
          moduleSource: null,
        };
      }
      if (binding.status !== "resolved" || seen.has(binding.entry)) return null;
      seen.add(binding.entry);
      const entry = binding.entry;
      if (entry.kind === "import") {
        return {
          name: entry.importedName,
          receiver: null,
          boundArgs: [],
          boundThis: false,
          moduleSource: entry.importSource,
        };
      }
      if (entry.boundProperty) {
        return {
          name: entry.boundProperty,
          receiver: entry.bindingSource ?? null,
          boundArgs: [],
          boundThis: false,
          moduleSource: null,
        };
      }
      const value = bindingValueBeforeUse(entry, expression);
      return value ? resolveCallableExpression(value, seen) : null;
    }

    if (!ts.isCallExpression(expression)) return null;
    const callee = unwrapExpression(expression.expression);
    const calleeAccess =
      callee &&
      (ts.isPropertyAccessExpression(callee) ||
        ts.isElementAccessExpression(callee))
        ? callee
        : null;
    if (
      calleeAccess &&
      accessName(calleeAccess) === "get" &&
      isReflectExpression(calleeAccess.expression)
    ) {
      return {
        name: expression.arguments[1]
          ? resolveStaticString(expression.arguments[1])
          : null,
        receiver: expression.arguments[0] ?? null,
        boundArgs: [],
        boundThis: false,
        moduleSource: null,
      };
    }
    if (calleeAccess && accessName(calleeAccess) === "bind") {
      const target = resolveCallableExpression(calleeAccess.expression, seen);
      if (!target) return null;
      return {
        ...target,
        receiver: expression.arguments[0] ?? null,
        boundThis: true,
        boundArgs: [
          ...(target.boundArgs ?? []),
          ...expression.arguments.slice(1),
        ],
      };
    }
    return null;
  }

  function normalizeInvocation(node) {
    if (!ts.isCallExpression(node)) return null;
    const callee = unwrapExpression(node.expression);
    const calleeAccess =
      callee &&
      (ts.isPropertyAccessExpression(callee) ||
        ts.isElementAccessExpression(callee))
        ? callee
        : null;

    if (
      calleeAccess &&
      accessName(calleeAccess) === "apply" &&
      isReflectExpression(calleeAccess.expression)
    ) {
      const target = resolveCallableExpression(node.arguments[0]);
      if (!target) return null;
      const args = staticArgumentList(node.arguments[2]);
      return {
        target,
        receiver: target.boundThis
          ? target.receiver
          : node.arguments[1] ?? null,
        args:
          args === null ? null : [...(target.boundArgs ?? []), ...args],
        opaqueArgs: args === null,
      };
    }

    if (calleeAccess && ["call", "apply"].includes(accessName(calleeAccess))) {
      const target = resolveCallableExpression(calleeAccess.expression);
      if (!target) return null;
      const isApply = accessName(calleeAccess) === "apply";
      const args = isApply
        ? staticArgumentList(node.arguments[1])
        : [...node.arguments].slice(1);
      return {
        target,
        receiver: target.boundThis
          ? target.receiver
          : node.arguments[0] ?? null,
        args: args === null ? null : [...(target.boundArgs ?? []), ...args],
        opaqueArgs: args === null,
      };
    }

    const target = resolveCallableExpression(callee);
    if (!target) return null;
    return {
      target,
      receiver: target.receiver,
      args: [...(target.boundArgs ?? []), ...node.arguments],
      opaqueArgs: false,
    };
  }

  function isReactNamespaceExpression(node, seen = new Set()) {
    const expression = unwrapExpression(node);
    if (!expression || seen.has(expression)) return false;
    seen.add(expression);
    if (
      (ts.isPropertyAccessExpression(expression) ||
        ts.isElementAccessExpression(expression)) &&
      accessName(expression) === "React"
    ) {
      const receiver = unwrapExpression(expression.expression);
      if (receiver && ts.isIdentifier(receiver)) {
        const binding = resolveBinding(receiver);
        return (
          ["window", "globalThis", "self"].includes(receiver.text) &&
          binding.status === "missing"
        );
      }
      return false;
    }
    if (!ts.isIdentifier(expression)) return false;
    const binding = resolveBinding(expression);
    if (binding.status === "missing") return expression.text === "React";
    if (binding.status !== "resolved" || seen.has(binding.entry)) return false;
    seen.add(binding.entry);
    if (
      binding.entry.kind === "import" &&
      binding.entry.importSource === "react" &&
      ["default", "*"].includes(binding.entry.importedName)
    ) {
      return true;
    }
    const value = bindingValueBeforeUse(binding.entry, expression);
    return value ? isReactNamespaceExpression(value, seen) : false;
  }

  function functionStyleNodeStatus(fn, seen) {
    if (!fn.body) return "not-style";
    if (!ts.isBlock(fn.body)) return styleNodeStatus(fn.body, seen);
    const statuses = [];
    function visitReturn(node) {
      if (ts.isFunctionLike(node) && node !== fn) return;
      if (ts.isReturnStatement(node)) {
        statuses.push(
          node.expression
            ? styleNodeStatus(node.expression, new Set(seen))
            : "not-style"
        );
        return;
      }
      ts.forEachChild(node, visitReturn);
    }
    visitReturn(fn.body);
    return mergeStatuses(statuses);
  }

  function styleNodeStatus(node, seen = new Set()) {
    const expression = unwrapExpression(node);
    if (!expression) return "not-style";
    const identity = `${expression.pos}:${expression.end}:${expression.kind}`;
    if (seen.has(identity)) return "maybe";
    seen.add(identity);

    const created = isDocumentCreateElementCall(expression);
    if (created) return created;
    if (ts.isIdentifier(expression)) {
      const binding = resolveBinding(expression);
      if (binding.status === "ambiguous") {
        return mergeStatuses(
          binding.entries.map((entry) =>
            entry.initializer
              ? styleNodeStatus(entry.initializer, new Set(seen))
              : "not-style"
          )
        );
      }
      if (binding.status === "resolved") {
        const value = bindingValueBeforeUse(binding.entry, expression);
        if (value) return styleNodeStatus(value, seen);
      }
      return "not-style";
    }
    if (ts.isCallExpression(expression)) {
      const callee = unwrapExpression(expression.expression);
      if (ts.isIdentifier(callee)) {
        const binding = resolveBinding(callee);
        const fn =
          binding.status === "resolved"
            ? bindingValueBeforeUse(binding.entry, callee)
            : null;
        if (
          fn &&
          (ts.isArrowFunction(fn) ||
            ts.isFunctionExpression(fn) ||
            ts.isFunctionDeclaration(fn))
        ) {
          return functionStyleNodeStatus(fn, seen);
        }
      } else if (
        ts.isArrowFunction(callee) ||
        ts.isFunctionExpression(callee)
      ) {
        return functionStyleNodeStatus(callee, seen);
      }
      return "not-style";
    }
    if (ts.isConditionalExpression(expression)) {
      return mergeStatuses([
        styleNodeStatus(expression.whenTrue, new Set(seen)),
        styleNodeStatus(expression.whenFalse, new Set(seen)),
      ]);
    }
    if (
      ts.isBinaryExpression(expression) &&
      [
        ts.SyntaxKind.BarBarToken,
        ts.SyntaxKind.QuestionQuestionToken,
        ts.SyntaxKind.AmpersandAmpersandToken,
      ].includes(expression.operatorToken.kind)
    ) {
      return mergeStatuses([
        styleNodeStatus(expression.left, new Set(seen)),
        styleNodeStatus(expression.right, new Set(seen)),
      ]);
    }
    return "not-style";
  }

  function sheetStatus(node, seen = new Set()) {
    let asserted = node;
    while (
      asserted &&
      (ts.isParenthesizedExpression(asserted) ||
        ts.isAsExpression(asserted) ||
        ts.isTypeAssertionExpression(asserted) ||
        ts.isNonNullExpression(asserted) ||
        ts.isSatisfiesExpression(asserted))
    ) {
      if (
        (ts.isAsExpression(asserted) ||
          ts.isTypeAssertionExpression(asserted) ||
          ts.isSatisfiesExpression(asserted)) &&
        /(?:^|\W)CSSStyleSheet(?:\W|$)/.test(
          asserted.type.getText(sourceFile)
        )
      ) {
        return "style";
      }
      asserted = asserted.expression;
    }
    const expression = unwrapExpression(node);
    if (!expression) return "not-style";
    const identity = `${expression.pos}:${expression.end}:${expression.kind}`;
    if (seen.has(identity)) return "maybe";
    seen.add(identity);
    if (ts.isNewExpression(expression)) {
      const ctor = unwrapExpression(expression.expression);
      if (ctor && ts.isIdentifier(ctor)) {
        const binding = resolveBinding(ctor);
        if (ctor.text === "CSSStyleSheet" && binding.status === "missing") {
          return "style";
        }
        if (binding.status === "resolved") {
          const value = bindingValueBeforeUse(binding.entry, ctor);
          if (
            value &&
            ts.isIdentifier(unwrapExpression(value)) &&
            unwrapExpression(value).text === "CSSStyleSheet" &&
            resolveBinding(unwrapExpression(value)).status === "missing"
          ) {
            return "style";
          }
        }
      }
      if (
        ctor &&
        (ts.isPropertyAccessExpression(ctor) ||
          ts.isElementAccessExpression(ctor)) &&
        accessName(ctor) === "CSSStyleSheet"
      ) {
        return "style";
      }
    }
    if (
      (ts.isPropertyAccessExpression(expression) ||
        ts.isElementAccessExpression(expression)) &&
      accessName(expression) === "sheet"
    ) {
      return styleNodeStatus(expression.expression, seen);
    }
    if (
      ts.isElementAccessExpression(expression) &&
      isAdoptedStyleSheetList(expression.expression)
    ) {
      return "style";
    }
    if (ts.isIdentifier(expression)) {
      const binding = resolveBinding(expression);
      if (binding.status === "resolved") {
        if (binding.entry.boundProperty === "sheet") {
          return styleNodeStatus(binding.entry.bindingSource, seen);
        }
        const declaredType = binding.entry.declaration?.type;
        if (
          declaredType &&
          /(?:^|\W)CSSStyleSheet(?:\W|$)/.test(
            declaredType.getText(sourceFile)
          )
        ) {
          return "style";
        }
        const value = bindingValueBeforeUse(binding.entry, expression);
        if (value) return sheetStatus(value, seen);
      }
      if (binding.status === "ambiguous") return "maybe";
    }
    if (ts.isConditionalExpression(expression)) {
      return mergeStatuses([
        sheetStatus(expression.whenTrue, new Set(seen)),
        sheetStatus(expression.whenFalse, new Set(seen)),
      ]);
    }
    if (
      ts.isBinaryExpression(expression) &&
      [
        ts.SyntaxKind.BarBarToken,
        ts.SyntaxKind.QuestionQuestionToken,
        ts.SyntaxKind.AmpersandAmpersandToken,
      ].includes(expression.operatorToken.kind)
    ) {
      return mergeStatuses([
        sheetStatus(expression.left, new Set(seen)),
        sheetStatus(expression.right, new Set(seen)),
      ]);
    }
    return "not-style";
  }

  function callName(call) {
    const callee = unwrapExpression(call.expression);
    if (ts.isIdentifier(callee)) return callee.text;
    if (
      ts.isPropertyAccessExpression(callee) ||
      ts.isElementAccessExpression(callee)
    ) {
      return accessName(callee);
    }
    return null;
  }

  function isCertifiedDataCssImport(call) {
    const callee = unwrapExpression(call.expression);
    let binding = null;
    let importedName = null;
    if (ts.isIdentifier(callee)) {
      const resolved = resolveBinding(callee);
      if (resolved.status === "resolved") {
        binding = resolved.entry;
        importedName = binding.importedName;
      }
    } else if (
      ts.isPropertyAccessExpression(callee) ||
      ts.isElementAccessExpression(callee)
    ) {
      const receiver = unwrapExpression(callee.expression);
      if (ts.isIdentifier(receiver)) {
        const resolved = resolveBinding(receiver);
        if (
          resolved.status === "resolved" &&
          resolved.entry.importedName === "*"
        ) {
          binding = resolved.entry;
          importedName = accessName(callee);
        }
      }
    }
    if (!binding || binding.kind !== "import" || !binding.importSource) {
      return false;
    }
    const certifiedPath = CERTIFIED_DATA_CSS_IMPORTS.get(importedName);
    if (!certifiedPath) return false;
    let canonicalFile;
    try {
      canonicalFile = realpathSync(resolve(fileName));
    } catch {
      return false;
    }
    if (!isInsideCorePackage(canonicalFile)) return false;
    const resolvedSource = canonicalModulePath(
      resolve(dirname(canonicalFile), binding.importSource)
    );
    const certifiedSource = canonicalModulePath(
      resolve(CORE_PACKAGE_ROOT, certifiedPath)
    );
    return (
      resolvedSource !== null &&
      certifiedSource !== null &&
      resolvedSource === certifiedSource
    );
  }

  function functionReturnsCertifiedDataCss(fn, seen) {
    if (!fn.body) return false;
    if (!ts.isBlock(fn.body)) {
      return isCertifiedDataCssExpression(fn.body, seen);
    }
    const returns = [];
    function visitReturn(node) {
      if (ts.isFunctionLike(node) && node !== fn) return;
      if (ts.isReturnStatement(node)) {
        returns.push(node.expression ?? null);
        return;
      }
      ts.forEachChild(node, visitReturn);
    }
    visitReturn(fn.body);
    return (
      returns.length > 0 &&
      returns.every(
        (expression) =>
          expression === null || isCertifiedDataCssExpression(expression, seen)
      )
    );
  }

  function isCertifiedDataCssExpression(node, seen = new Set()) {
    const expression = unwrapExpression(node);
    if (!expression) return false;
    const identity = `${expression.pos}:${expression.end}:${expression.kind}`;
    if (seen.has(identity)) return false;
    seen.add(identity);
    if (
      expression.kind === ts.SyntaxKind.NullKeyword ||
      expression.kind === ts.SyntaxKind.FalseKeyword
    ) {
      return true;
    }
    if (ts.isStringLiteralLike(expression)) return expression.text.length === 0;
    if (ts.isIdentifier(expression)) {
      if (expression.text === "undefined") return true;
      const binding = resolveBinding(expression);
      return (
        binding.status === "resolved" &&
        binding.entry.initializer !== null &&
        isCertifiedDataCssExpression(binding.entry.initializer, seen)
      );
    }
    if (ts.isConditionalExpression(expression)) {
      return (
        isCertifiedDataCssExpression(expression.whenTrue, new Set(seen)) &&
        isCertifiedDataCssExpression(expression.whenFalse, new Set(seen))
      );
    }
    if (
      ts.isBinaryExpression(expression) &&
      expression.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken
    ) {
      return isCertifiedDataCssExpression(expression.right, seen);
    }
    if (
      ts.isPropertyAccessExpression(expression) ||
      ts.isElementAccessExpression(expression)
    ) {
      return (
        accessName(expression) === "css" &&
        isCertifiedDataCssExpression(expression.expression, seen)
      );
    }
    if (ts.isCallExpression(expression)) {
      const name = callName(expression);
      if (isCertifiedDataCssImport(expression)) return true;
      if (
        ["useMemo", "useCallback"].includes(name) &&
        expression.arguments[0]
      ) {
        const callback = unwrapExpression(expression.arguments[0]);
        return (
          (ts.isArrowFunction(callback) || ts.isFunctionExpression(callback)) &&
          functionReturnsCertifiedDataCss(callback, seen)
        );
      }
      const callee = unwrapExpression(expression.expression);
      if (ts.isIdentifier(callee)) {
        const binding = resolveBinding(callee);
        const fn =
          binding.status === "resolved" ? binding.entry.initializer : null;
        return Boolean(
          fn &&
            (ts.isArrowFunction(fn) ||
              ts.isFunctionExpression(fn) ||
              ts.isFunctionDeclaration(fn)) &&
            functionReturnsCertifiedDataCss(fn, seen)
        );
      }
    }
    return false;
  }

  function analyzeCssLiteral(
    node,
    cssText,
    computedProperties = [],
    identitySalt = ""
  ) {
    if (!looksLikeCss(cssText)) return;
    const identity = `${node.pos}:${node.end}:${node.kind}:${identitySalt}`;
    if (seenCssLiterals.has(identity)) return;
    seenCssLiterals.add(identity);
    cssLiterals += 1;
    dynamicProperties.push(...computedProperties);
    let root;
    try {
      root = postcss.parse(cssText, { from: fileName });
    } catch (error) {
      parseFailures.push({
        message: error.reason ?? error.message,
        ...sourceLocation(sourceFile, node),
      });
      return;
    }
    root.walkDecls((declaration) => {
      if (!isEmbeddedCssPaintProperty(declaration.prop)) return;
      sites.push({
        property: declaration.prop.toLowerCase(),
        cssLine: declaration.source?.start?.line ?? null,
        ...sourceLocation(sourceFile, node),
      });
    });
  }

  function analyzeReachableExpression(node, mode = "whole-root") {
    const expression = unwrapExpression(node);
    if (!expression) return;
    // Runtime fragments deliberately tolerate opaque data, while whole roots
    // must fail closed. Keep those visits distinct so an alias first seen in a
    // template interpolation cannot suppress a later whole-root audit.
    const identity = `${expression.pos}:${expression.end}:${expression.kind}:${mode}`;
    if (seenExpressions.has(identity)) return;
    seenExpressions.add(identity);

    if (ts.isTemplateExpression(expression)) {
      const own = templateOwnCss(expression, sourceFile);
      analyzeCssLiteral(expression, own.text, own.dynamicProperties);
      for (const fragment of own.fragmentExpressions) {
        analyzeReachableExpression(fragment, "runtime-fragment");
      }
      return;
    }
    if (ts.isStringLiteralLike(expression)) {
      analyzeCssLiteral(expression, expression.text);
      return;
    }
    if (ts.isIdentifier(expression)) {
      const binding = resolveBinding(expression);
      if (binding.status === "resolved" && binding.entry.initializer) {
        analyzeReachableExpression(binding.entry.initializer, mode);
      } else if (mode === "whole-root" && binding.status === "ambiguous") {
        recordUnknownSink(expression, "ambiguous-css-alias");
      } else if (
        mode === "whole-root" &&
        binding.status === "resolved" &&
        binding.entry.kind === "import"
      ) {
        recordUnknownSink(expression, "imported-css-root");
      } else if (mode === "whole-root") {
        recordUnknownSink(expression, "unresolved-css-root");
      }
      return;
    }
    if (ts.isConditionalExpression(expression)) {
      analyzeReachableExpression(expression.whenTrue, mode);
      analyzeReachableExpression(expression.whenFalse, mode);
      return;
    }
    if (ts.isBinaryExpression(expression)) {
      if (
        expression.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken
      ) {
        analyzeReachableExpression(expression.right, mode);
      } else if (
        expression.operatorToken.kind === ts.SyntaxKind.PlusToken ||
        expression.operatorToken.kind === ts.SyntaxKind.BarBarToken ||
        expression.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken
      ) {
        analyzeReachableExpression(expression.left, mode);
        analyzeReachableExpression(expression.right, mode);
      }
      return;
    }
    if (ts.isTaggedTemplateExpression(expression)) {
      analyzeReachableExpression(expression.template, mode);
      return;
    }
    if (ts.isArrayLiteralExpression(expression)) {
      for (const element of expression.elements) {
        analyzeReachableExpression(
          ts.isSpreadElement(element) ? element.expression : element,
          mode
        );
      }
      return;
    }
    if (
      ts.isPropertyAccessExpression(expression) ||
      ts.isElementAccessExpression(expression)
    ) {
      const propertyName = accessName(expression);
      const receiver = unwrapExpression(expression.expression);
      let resolved = false;
      if (propertyName && receiver) {
        let object = receiver;
        if (ts.isIdentifier(object)) {
          const binding = resolveBinding(object);
          object =
            binding.status === "resolved" && binding.entry.initializer
              ? unwrapExpression(binding.entry.initializer)
              : object;
        }
        if (object && ts.isObjectLiteralExpression(object)) {
          for (const property of object.properties) {
            if (
              ts.isPropertyAssignment(property) &&
              staticPropertyName(property.name) === propertyName
            ) {
              resolved = true;
              analyzeReachableExpression(property.initializer, mode);
            } else if (ts.isSpreadAssignment(property)) {
              analyzeReachableExpression(property.expression, mode);
            }
          }
        }
      }
      if (
        mode === "whole-root" &&
        !resolved &&
        !isCertifiedDataCssExpression(expression)
      ) {
        recordUnknownSink(expression, "unresolved-css-property-root");
      }
      return;
    }
    if (ts.isCallExpression(expression)) {
      const callee = unwrapExpression(expression.expression);
      if (
        (ts.isPropertyAccessExpression(callee) ||
          ts.isElementAccessExpression(callee)) &&
        ["trim", "trimStart", "trimEnd", "join"].includes(accessName(callee))
      ) {
        analyzeReachableExpression(callee.expression, mode);
        return;
      }
      if (ts.isIdentifier(callee)) {
        const binding = resolveBinding(callee);
        if (
          binding.status === "resolved" &&
          binding.entry.initializer &&
          (ts.isArrowFunction(binding.entry.initializer) ||
            ts.isFunctionExpression(binding.entry.initializer) ||
            ts.isFunctionDeclaration(binding.entry.initializer))
        ) {
          analyzeFunctionResult(binding.entry.initializer, mode);
          return;
        }
        if (
          ["useMemo", "useCallback"].includes(callee.text) &&
          expression.arguments[0] &&
          (ts.isArrowFunction(unwrapExpression(expression.arguments[0])) ||
            ts.isFunctionExpression(unwrapExpression(expression.arguments[0])))
        ) {
          analyzeFunctionResult(
            unwrapExpression(expression.arguments[0]),
            mode
          );
          return;
        }
      } else if (
        ts.isArrowFunction(callee) ||
        ts.isFunctionExpression(callee)
      ) {
        analyzeFunctionResult(callee, mode);
        return;
      }
      if (mode === "whole-root" && !isCertifiedDataCssExpression(expression)) {
        recordUnknownSink(expression, "unresolved-css-call-root");
      }
      return;
    }
    if (ts.isArrowFunction(expression) || ts.isFunctionExpression(expression)) {
      analyzeFunctionResult(expression, mode);
      return;
    }
    if (mode === "whole-root" && !isCertifiedDataCssExpression(expression)) {
      recordUnknownSink(expression, "unresolved-css-root");
    }
  }

  function analyzeFunctionResult(fn, mode = "whole-root") {
    if (!fn.body) return;
    if (!ts.isBlock(fn.body)) {
      analyzeReachableExpression(fn.body, mode);
      return;
    }
    function visitReturn(node) {
      if (ts.isFunctionLike(node) && node !== fn) return;
      if (ts.isReturnStatement(node) && node.expression) {
        analyzeReachableExpression(node.expression, mode);
        return;
      }
      ts.forEachChild(node, visitReturn);
    }
    visitReturn(fn.body);
  }

  function walkObjectExpression(node, callback, seen = new Set()) {
    const expression = unwrapExpression(node);
    if (!expression) return false;
    const identity = `${expression.pos}:${expression.end}:${expression.kind}`;
    if (seen.has(identity)) return false;
    seen.add(identity);
    if (ts.isIdentifier(expression)) {
      const binding = resolveBinding(expression);
      if (binding.status === "resolved" && binding.entry.initializer) {
        return walkObjectExpression(binding.entry.initializer, callback, seen);
      }
      return false;
    }
    if (ts.isConditionalExpression(expression)) {
      const whenTrue = walkObjectExpression(
        expression.whenTrue,
        callback,
        new Set(seen)
      );
      const whenFalse = walkObjectExpression(
        expression.whenFalse,
        callback,
        new Set(seen)
      );
      return whenTrue && whenFalse;
    }
    if (!ts.isObjectLiteralExpression(expression)) return false;
    let resolved = true;
    for (const property of expression.properties) {
      if (ts.isSpreadAssignment(property)) {
        resolved =
          walkObjectExpression(property.expression, callback, new Set(seen)) &&
          resolved;
      } else {
        resolved = callback(property) !== false && resolved;
      }
    }
    return resolved;
  }

  function collectHtmlObject(node) {
    const resolved = walkObjectExpression(node, (property) => {
      if (
        ts.isPropertyAssignment(property) &&
        staticPropertyName(property.name) === "__html"
      ) {
        roots.push(property.initializer);
        return true;
      }
      if (
        ts.isShorthandPropertyAssignment(property) &&
        property.name.text === "__html"
      ) {
        roots.push(property.name);
        return true;
      }
      const name = staticPropertyName(property.name);
      return name !== null && name !== "__html";
    });
    if (!resolved) {
      recordUnknownSink(node, "opaque-dangerous-html-payload");
    }
  }

  function collectStyleProps(node) {
    const resolved = walkObjectExpression(node, (property) => {
      if (ts.isShorthandPropertyAssignment(property)) {
        if (property.name.text === "dangerouslySetInnerHTML") {
          collectHtmlObject(property.name);
        } else if (property.name.text === "children") {
          roots.push(property.name);
        }
        return true;
      }
      if (!ts.isPropertyAssignment(property)) {
        const name = staticPropertyName(property.name);
        return (
          name !== null &&
          name !== "dangerouslySetInnerHTML" &&
          name !== "children"
        );
      }
      const name = staticPropertyName(property.name);
      if (name === "dangerouslySetInnerHTML") {
        collectHtmlObject(property.initializer);
      } else if (name === "children") {
        roots.push(property.initializer);
      }
      return name !== null;
    });
    if (!resolved) recordUnknownSink(node, "opaque-style-props");
  }

  function reactCreateElementInvocation(node) {
    const invocation = normalizeInvocation(node);
    if (!invocation || invocation.target.name !== "createElement") return null;
    const importedFactory =
      invocation.target.moduleSource === "react" &&
      invocation.target.name === "createElement";
    if (
      !importedFactory &&
      (!invocation.receiver ||
        !isReactNamespaceExpression(invocation.receiver))
    ) {
      return null;
    }
    return invocation;
  }

  function analyzeHtmlPayload(node, kind) {
    const html = resolveStaticString(node);
    if (html === null) {
      recordUnknownSink(node, `opaque-${kind}-payload`);
      return;
    }

    let match;
    let index = 0;
    const styleBlocks = /<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi;
    while ((match = styleBlocks.exec(html))) {
      analyzeCssLiteral(node, match[1], [], `${kind}:style:${index}`);
      index += 1;
    }
    if (
      /<style\b/i.test(
        html.replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, "")
      )
    ) {
      recordUnknownSink(node, `malformed-${kind}-style-markup`);
    }

    let styleAttributeCount = 0;
    const quotedStyleAttributes =
      /\sstyle\s*=\s*(["'])([\s\S]*?)\1/gi;
    while ((match = quotedStyleAttributes.exec(html))) {
      analyzeCssLiteral(
        node,
        `embedded-html-node{${match[2]}}`,
        [],
        `${kind}:attribute:${index}`
      );
      index += 1;
      styleAttributeCount += 1;
    }
    const unquotedStyleAttributes = /\sstyle\s*=\s*(?!["'])([^\s>]+)/gi;
    while ((match = unquotedStyleAttributes.exec(html))) {
      analyzeCssLiteral(
        node,
        `embedded-html-node{${match[1]}}`,
        [],
        `${kind}:attribute:${index}`
      );
      index += 1;
      styleAttributeCount += 1;
    }
    const attributeMarkers = html.match(/\sstyle\s*=/gi)?.length ?? 0;
    if (styleAttributeCount < attributeMarkers) {
      recordUnknownSink(node, `malformed-${kind}-style-attribute`);
    }
  }

  function isAdoptedStyleSheetList(node, seen = new Set()) {
    const expression = unwrapExpression(node);
    if (!expression || seen.has(expression)) return false;
    seen.add(expression);
    if (
      (ts.isPropertyAccessExpression(expression) ||
        ts.isElementAccessExpression(expression)) &&
      accessName(expression) === "adoptedStyleSheets"
    ) {
      return true;
    }
    if (ts.isIdentifier(expression)) {
      const binding = resolveBinding(expression);
      if (binding.status !== "resolved" || seen.has(binding.entry)) return false;
      seen.add(binding.entry);
      const value = bindingValueBeforeUse(binding.entry, expression);
      return value ? isAdoptedStyleSheetList(value, seen) : false;
    }
    return false;
  }

  function isLocallyConstructedStyleSheet(node, seen = new Set()) {
    const expression = unwrapExpression(node);
    if (!expression || seen.has(expression)) return false;
    seen.add(expression);
    if (ts.isNewExpression(expression)) {
      return sheetStatus(expression) === "style";
    }
    if (
      (ts.isPropertyAccessExpression(expression) ||
        ts.isElementAccessExpression(expression)) &&
      accessName(expression) === "sheet"
    ) {
      return styleNodeStatus(expression.expression) === "style";
    }
    if (ts.isIdentifier(expression)) {
      const binding = resolveBinding(expression);
      if (binding.status !== "resolved" || seen.has(binding.entry)) return false;
      seen.add(binding.entry);
      const value = bindingValueBeforeUse(binding.entry, expression);
      return value ? isLocallyConstructedStyleSheet(value, seen) : false;
    }
    if (ts.isConditionalExpression(expression)) {
      return (
        isLocallyConstructedStyleSheet(expression.whenTrue, new Set(seen)) &&
        isLocallyConstructedStyleSheet(expression.whenFalse, new Set(seen))
      );
    }
    return false;
  }

  function validateAdoptedStyleSheets(node, owner = node, seen = new Set()) {
    const expression = unwrapExpression(node);
    if (!expression || seen.has(expression)) {
      recordUnknownSink(owner, "opaque-adopted-stylesheets");
      return;
    }
    seen.add(expression);
    if (isAdoptedStyleSheetList(expression)) return;
    if (ts.isArrayLiteralExpression(expression)) {
      for (const element of expression.elements) {
        if (ts.isOmittedExpression(element)) continue;
        const value = ts.isSpreadElement(element)
          ? unwrapExpression(element.expression)
          : unwrapExpression(element);
        if (!value) {
          recordUnknownSink(owner, "opaque-adopted-stylesheet");
        } else if (ts.isSpreadElement(element)) {
          if (!isAdoptedStyleSheetList(value)) {
            validateAdoptedStyleSheets(value, owner, new Set(seen));
          }
        } else {
          const status = sheetStatus(value);
          if (!isLocallyConstructedStyleSheet(value)) {
            recordUnknownSink(
              owner,
              status === "maybe"
                ? "computed-adopted-stylesheet"
                : "opaque-adopted-stylesheet"
            );
          }
        }
      }
      return;
    }
    if (ts.isIdentifier(expression)) {
      const binding = resolveBinding(expression);
      if (binding.status === "resolved") {
        const value = bindingValueBeforeUse(binding.entry, expression);
        if (value) {
          validateAdoptedStyleSheets(value, owner, seen);
          return;
        }
      }
    }
    if (ts.isConditionalExpression(expression)) {
      validateAdoptedStyleSheets(expression.whenTrue, owner, new Set(seen));
      validateAdoptedStyleSheets(expression.whenFalse, owner, new Set(seen));
      return;
    }
    recordUnknownSink(owner, "opaque-adopted-stylesheets");
  }

  function collectReflectPropertySink(invocation, node) {
    if (
      invocation?.target.name !== "set" ||
      !invocation.receiver ||
      !isReflectExpression(invocation.receiver)
    ) {
      return;
    }
    if (!invocation.args) {
      recordUnknownSink(node, "opaque-reflect-set-arguments");
      return;
    }
    const [target, propertyNode, value] = invocation.args;
    const property = propertyNode ? resolveStaticString(propertyNode) : null;
    if (property === "adoptedStyleSheets") {
      if (value) validateAdoptedStyleSheets(value, node);
      else recordUnknownSink(node, "opaque-adopted-stylesheets");
      return;
    }
    const receiverStatus = target ? styleNodeStatus(target) : "not-style";
    if (
      receiverStatus === "style" &&
      ["textContent", "innerHTML", "innerText"].includes(property)
    ) {
      if (value) roots.push(value);
      else recordUnknownSink(node, "opaque-style-text-sink");
    } else if (receiverStatus === "maybe") {
      recordUnknownSink(node, "computed-style-sink");
    } else if (["innerHTML", "outerHTML"].includes(property)) {
      if (value) analyzeHtmlPayload(value, property.toLowerCase());
      else recordUnknownSink(node, `opaque-${property.toLowerCase()}-payload`);
    } else if (property === null && receiverStatus !== "not-style") {
      recordUnknownSink(node, "computed-style-sink");
    }
  }

  function collectStyleMethodCall(node) {
    if (!ts.isCallExpression(node)) return;
    const invocation = normalizeInvocation(node);
    if (!invocation) return;
    const method = invocation.target.name;
    const receiver = invocation.receiver;
    if (!receiver) return;
    const domStatus = styleNodeStatus(receiver);
    const sheet = sheetStatus(receiver);
    const args = invocation.args;

    if (["append", "prepend", "replaceChildren"].includes(method)) {
      if (domStatus === "style") {
        if (args) roots.push(...args);
        else recordUnknownSink(node, "opaque-style-element-arguments");
      } else if (domStatus === "maybe") {
        recordUnknownSink(node, "computed-style-element");
      }
      return;
    }
    if (method === "appendChild") {
      if (domStatus === "style") {
        if (!args) {
          recordUnknownSink(node, "opaque-style-element-arguments");
          return;
        }
        for (const argument of args) {
          const value = unwrapExpression(argument);
          const textInvocation =
            value && ts.isCallExpression(value)
              ? normalizeInvocation(value)
              : null;
          if (
            textInvocation?.target.name === "createTextNode" &&
            textInvocation.receiver &&
            isDocumentExpression(textInvocation.receiver)
          ) {
            if (textInvocation.args?.[0]) roots.push(textInvocation.args[0]);
            else recordUnknownSink(value, "opaque-style-text-node");
          } else {
            recordUnknownSink(argument, "opaque-style-child");
          }
        }
      } else if (domStatus === "maybe") {
        recordUnknownSink(node, "computed-style-element");
      }
      return;
    }
    if (["replace", "replaceSync", "insertRule"].includes(method)) {
      if (sheet === "style") {
        if (args?.[0]) roots.push(args[0]);
        else recordUnknownSink(node, "opaque-stylesheet-arguments");
      } else if (sheet === "maybe") {
        recordUnknownSink(node, "computed-stylesheet");
      }
      return;
    }
    if (method === "insertAdjacentHTML") {
      if (args?.[1]) analyzeHtmlPayload(args[1], "insert-adjacent-html");
      else recordUnknownSink(node, "opaque-insert-adjacent-html-arguments");
      return;
    }
    if (
      ["push", "unshift"].includes(method) &&
      isAdoptedStyleSheetList(receiver)
    ) {
      if (!args) {
        recordUnknownSink(node, "opaque-adopted-stylesheets-arguments");
      } else {
        validateAdoptedStyleSheets(
          ts.factory.createArrayLiteralExpression(args),
          node
        );
      }
      return;
    }
    if (
      method === null &&
      (domStatus !== "not-style" || sheet !== "not-style")
    ) {
      recordUnknownSink(node, "computed-style-sink");
    }
  }

  function visit(node) {
    if (
      ts.isJsxElement(node) &&
      node.openingElement.tagName.getText() === "style"
    ) {
      for (const child of node.children) {
        if (ts.isJsxExpression(child) && child.expression) {
          roots.push(child.expression);
        } else if (ts.isJsxText(child) && child.text.trim()) {
          analyzeCssLiteral(child, child.text);
        }
      }
    }
    if (
      ts.isJsxAttribute(node) &&
      node.name.getText() === "dangerouslySetInnerHTML"
    ) {
      const openingLike = jsxOpeningLike(node);
      if (openingLike?.tagName.getText() === "style") {
        const value = jsxAttributeExpression(node);
        if (value) collectHtmlObject(value);
      }
    }
    if (ts.isJsxAttribute(node) && node.name.getText() === "children") {
      const openingLike = jsxOpeningLike(node);
      if (openingLike?.tagName.getText() === "style") {
        const initializer = node.initializer;
        if (initializer && ts.isJsxExpression(initializer) && initializer.expression) {
          roots.push(initializer.expression);
        } else if (initializer && ts.isStringLiteralLike(initializer)) {
          roots.push(initializer);
        }
      }
    }
    if (ts.isJsxSpreadAttribute(node)) {
      const openingLike = jsxOpeningLike(node);
      if (openingLike?.tagName.getText() === "style") {
        collectStyleProps(node.expression);
      }
    }
    if (ts.isCallExpression(node)) {
      const reactInvocation = reactCreateElementInvocation(node);
      if (reactInvocation) {
        if (!reactInvocation.args) {
          recordUnknownSink(node, "opaque-react-create-element-arguments");
        } else {
          const tag = reactInvocation.args[0]
            ? resolveStaticString(reactInvocation.args[0])
            : null;
          if (tag?.toLowerCase() === "style") {
            if (reactInvocation.args[1]) {
              collectStyleProps(reactInvocation.args[1]);
            }
            roots.push(...reactInvocation.args.slice(2));
          }
        }
      }
      const normalized = normalizeInvocation(node);
      collectReflectPropertySink(normalized, node);
      if (
        normalized?.target.name === null &&
        normalized.receiver &&
        (isDocumentExpression(normalized.receiver) ||
          isReactNamespaceExpression(normalized.receiver))
      ) {
        const possibleTag = normalized.args?.[0]
          ? resolveStaticString(normalized.args[0])
          : null;
        if (possibleTag?.toLowerCase() === "style" || normalized.opaqueArgs) {
          recordUnknownSink(node, "computed-style-factory");
        }
      }
      collectStyleMethodCall(node);
    }
    if (
      ts.isBinaryExpression(node) &&
      [
        ts.SyntaxKind.EqualsToken,
        ts.SyntaxKind.PlusEqualsToken,
        ts.SyntaxKind.AmpersandAmpersandEqualsToken,
        ts.SyntaxKind.BarBarEqualsToken,
        ts.SyntaxKind.QuestionQuestionEqualsToken,
      ].includes(node.operatorToken.kind) &&
      (ts.isPropertyAccessExpression(node.left) ||
        ts.isElementAccessExpression(node.left))
    ) {
      const property = accessName(node.left);
      const receiverStatus = styleNodeStatus(node.left.expression);
      const knownTextSink = ["textContent", "innerHTML", "innerText"].includes(property);
      if (receiverStatus === "style" && knownTextSink) {
        roots.push(node.right);
      } else if (
        (receiverStatus === "style" && property === null) ||
        (receiverStatus === "maybe" && (knownTextSink || property === null))
      ) {
        recordUnknownSink(node.left, "computed-style-sink");
      } else if (["innerHTML", "outerHTML"].includes(property)) {
        analyzeHtmlPayload(node.right, property.toLowerCase());
      }
      if (property === "adoptedStyleSheets") {
        validateAdoptedStyleSheets(node.right, node.left);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  for (const root of roots) analyzeReachableExpression(root);

  const classifiedPaint = sites.length;
  const unclassified =
    parseFailures.length + dynamicProperties.length + unknownSinks.length;
  return {
    count: classifiedPaint + unclassified,
    classifiedPaint,
    parseFailures: parseFailures.length,
    dynamicProperties: dynamicProperties.length,
    unknownSinks: unknownSinks.length,
    unclassified,
    cssLiterals,
    roots: roots.length,
    sites,
    parseFailureSites: parseFailures,
    dynamicPropertySites: dynamicProperties,
    unknownSinkSites: unknownSinks,
  };
}

export function countEmbeddedCssPaintInFile(text, fileName = "source.tsx") {
  return analyzeEmbeddedCssPaint(text, fileName).count;
}

export function countEmbeddedCssPaintByFile(sourceFiles) {
  const files = {};
  const failureSites = [];
  const canonicalFiles = [
    ...new Set(sourceFiles.map((file) => realpathSync(resolve(file)))),
  ].sort();

  for (const file of canonicalFiles) {
    const result = analyzeEmbeddedCssPaint(readFileSync(file, "utf8"), file);
    files[file] = {
      count: result.count,
      classifiedPaint: result.classifiedPaint,
      parseFailures: result.parseFailures,
      dynamicProperties: result.dynamicProperties,
      unknownSinks: result.unknownSinks,
      unclassified: result.unclassified,
      cssLiterals: result.cssLiterals,
      roots: result.roots,
      paintProperties: Object.fromEntries(
        [...new Set(result.sites.map((site) => site.property))]
          .sort()
          .map((property) => [
            property,
            result.sites.filter((site) => site.property === property).length,
          ])
      ),
    };
    failureSites.push(
      ...result.parseFailureSites.map((site) => ({
        file,
        kind: "parse-failure",
        ...site,
      })),
      ...result.dynamicPropertySites.map((site) => ({
        file,
        kind: "dynamic-property",
        ...site,
      })),
      ...result.unknownSinkSites.map((site) => ({
        file,
        ...site,
      }))
    );
  }

  const records = Object.values(files);
  const sum = (property) =>
    records.reduce((total, file) => total + file[property], 0);
  return {
    total: sum("count"),
    classifiedPaint: sum("classifiedPaint"),
    parseFailures: sum("parseFailures"),
    dynamicProperties: sum("dynamicProperties"),
    unknownSinks: sum("unknownSinks"),
    unclassified: sum("unclassified"),
    cssLiterals: sum("cssLiterals"),
    roots: sum("roots"),
    failureSites,
    files,
  };
}
