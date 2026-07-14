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
        addBindingName(scopes, scope, element.name, {
          ...entry,
          initializer: element.initializer ?? null,
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
    if (ts.isIdentifier(expression)) {
      const binding = resolveBinding(expression);
      return binding.status === "resolved" && binding.entry.initializer
        ? resolveStaticString(binding.entry.initializer, seen)
        : null;
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
    return (
      binding.status === "resolved" &&
      binding.entry.initializer &&
      isDocumentExpression(binding.entry.initializer, seen)
    );
  }

  function isDocumentCreateElementCall(node) {
    const expression = unwrapExpression(node);
    if (!expression || !ts.isCallExpression(expression)) return null;
    const receiver = accessReceiver(expression.expression);
    if (
      !receiver ||
      accessName(expression.expression) !== "createElement" ||
      !isDocumentExpression(receiver)
    ) {
      return null;
    }
    const tag = expression.arguments[0]
      ? resolveStaticString(expression.arguments[0])
      : null;
    return tag === "style" ? "style" : tag === null ? "maybe" : "not-style";
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
    const expression = unwrapExpression(node);
    if (!expression) return "not-style";
    const identity = `${expression.pos}:${expression.end}:${expression.kind}`;
    if (seen.has(identity)) return "maybe";
    seen.add(identity);
    if (
      ts.isNewExpression(expression) &&
      ts.isIdentifier(expression.expression) &&
      expression.expression.text === "CSSStyleSheet"
    ) {
      return "style";
    }
    if (
      (ts.isPropertyAccessExpression(expression) ||
        ts.isElementAccessExpression(expression)) &&
      accessName(expression) === "sheet"
    ) {
      return styleNodeStatus(expression.expression, seen);
    }
    if (ts.isIdentifier(expression)) {
      const binding = resolveBinding(expression);
      if (binding.status === "resolved" && binding.entry.initializer) {
        return sheetStatus(binding.entry.initializer, seen);
      }
      if (binding.status === "ambiguous") return "maybe";
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

  function analyzeCssLiteral(node, cssText, computedProperties = []) {
    if (!looksLikeCss(cssText)) return;
    const identity = `${node.pos}:${node.end}:${node.kind}`;
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

  function isReactStyleCall(node) {
    if (!ts.isCallExpression(node) || node.arguments.length === 0) return false;
    const callee = unwrapExpression(node.expression);
    let createElement = false;
    if (ts.isIdentifier(callee)) {
      createElement = callee.text === "createElement";
    } else if (
      ts.isPropertyAccessExpression(callee) ||
      ts.isElementAccessExpression(callee)
    ) {
      const receiver = unwrapExpression(callee.expression);
      createElement =
        accessName(callee) === "createElement" &&
        ts.isIdentifier(receiver) &&
        receiver.text === "React";
    }
    return createElement && resolveStaticString(node.arguments[0]) === "style";
  }

  function collectStyleMethodCall(node) {
    if (!ts.isCallExpression(node)) return;
    const callee = unwrapExpression(node.expression);
    if (
      !callee ||
      (!ts.isPropertyAccessExpression(callee) &&
        !ts.isElementAccessExpression(callee))
    ) {
      return;
    }
    const method = accessName(callee);
    const receiver = callee.expression;
    const domStatus = styleNodeStatus(receiver);
    const sheet = sheetStatus(receiver);

    if (["append", "prepend", "replaceChildren"].includes(method)) {
      if (domStatus === "style") {
        roots.push(...node.arguments);
      } else if (domStatus === "maybe") {
        recordUnknownSink(node, "computed-style-element");
      }
      return;
    }
    if (method === "appendChild") {
      if (domStatus === "style") {
        for (const argument of node.arguments) {
          const value = unwrapExpression(argument);
          if (
            value &&
            ts.isCallExpression(value) &&
            (ts.isPropertyAccessExpression(value.expression) ||
              ts.isElementAccessExpression(value.expression)) &&
            accessName(value.expression) === "createTextNode" &&
            isDocumentExpression(value.expression.expression)
          ) {
            if (value.arguments[0]) roots.push(value.arguments[0]);
          }
        }
      } else if (domStatus === "maybe") {
        recordUnknownSink(node, "computed-style-element");
      }
      return;
    }
    if (["replace", "replaceSync", "insertRule"].includes(method)) {
      if (sheet === "style") {
        if (node.arguments[0]) roots.push(node.arguments[0]);
      } else if (sheet === "maybe") {
        recordUnknownSink(node, "computed-stylesheet");
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
    if (ts.isJsxSpreadAttribute(node)) {
      const openingLike = jsxOpeningLike(node);
      if (openingLike?.tagName.getText() === "style") {
        collectStyleProps(node.expression);
      }
    }
    if (ts.isCallExpression(node)) {
      if (isReactStyleCall(node)) {
        if (node.arguments[1]) collectStyleProps(node.arguments[1]);
        roots.push(...node.arguments.slice(2));
      }
      collectStyleMethodCall(node);
    }
    if (
      ts.isBinaryExpression(node) &&
      [
        ts.SyntaxKind.EqualsToken,
        ts.SyntaxKind.PlusEqualsToken,
        ts.SyntaxKind.BarBarEqualsToken,
        ts.SyntaxKind.QuestionQuestionEqualsToken,
      ].includes(node.operatorToken.kind) &&
      (ts.isPropertyAccessExpression(node.left) ||
        ts.isElementAccessExpression(node.left))
    ) {
      const property = accessName(node.left);
      const receiverStatus = styleNodeStatus(node.left.expression);
      const knownTextSink = ["textContent", "innerHTML", "innerText"].includes(
        property
      );
      if (receiverStatus === "style" && knownTextSink) {
        roots.push(node.right);
      } else if (
        (receiverStatus === "style" && property === null) ||
        (receiverStatus === "maybe" && (knownTextSink || property === null))
      ) {
        recordUnknownSink(node.left, "computed-style-sink");
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
