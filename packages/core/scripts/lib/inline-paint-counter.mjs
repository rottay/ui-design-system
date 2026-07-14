import { extname } from "node:path";
import ts from "typescript";

// Single source of truth for the inline-paint counter: the engine-token-audit
// ratchet and the WO-SKIN census must never disagree on what counts as paint.
export const ARC09_PAINT_KEY_RE = new RegExp(
  "^(" +
    [
      "background[A-Za-z]*",
      "border[A-Za-z]*",
      "outline[A-Za-z]*",
      "color",
      "boxShadow",
      "textShadow",
      "fill",
      "stroke",
      "accentColor",
      "filter",
      "backdropFilter",
      "WebkitBackdropFilter",
      "transform",
    ].join("|") +
    ")\\s*:",
);
// border*/table box-model that is layout, not paint.
export const ARC09_PAINT_EXEMPT = new Set([
  "borderCollapse",
  "borderSpacing",
  // Not CSS properties at all -- they are PROP names that the `border*` family
  // pattern happens to match. Counting them invents paint that cannot exist.
  "bordered",
  "borderless",
]);

/**
 * The same paint names in ES6 SHORTHAND position: `style={{ color }}`, or a bare
 * `color,` inside a style object. The colon-anchored regex above cannot see these,
 * so a file could report ZERO inline paint while still painting inline — a gate
 * that certifies a false zero is worse than no gate. Found in the wild at
 * structures/dashboard/stats-header (WO-SKIN-06 CK-A inventory).
 *
 * The AST pass below applies this only to a source object proven to feed a
 * React style/prop-bag sink. A bare `{ color }` elsewhere is far more often a
 * data object or destructuring pattern than paint.
 */
export const ARC09_PAINT_SHORTHAND_RE = new RegExp(
  ARC09_PAINT_KEY_RE.source.replace(/\\s\*:$/, "") + "\\s*(?=[,}])",
);

// `React.createElement()` bypasses JSX attribute analysis. The runtime-SVG
// counter deliberately delegates these prop bags to this channel, so a
// shorthand `{ fill }` must remain visible here. HTML intrinsic prop bags are
// not included: a computed `data-*`/ARIA property on a `<div>` is not paint.
const SVG_CREATE_ELEMENT_TAGS = new Set([
  "a",
  "circle",
  "clipPath",
  "defs",
  "ellipse",
  "feBlend",
  "feColorMatrix",
  "feComponentTransfer",
  "feComposite",
  "feConvolveMatrix",
  "feDiffuseLighting",
  "feDisplacementMap",
  "feDistantLight",
  "feDropShadow",
  "feFlood",
  "feFuncA",
  "feFuncB",
  "feFuncG",
  "feFuncR",
  "feGaussianBlur",
  "feImage",
  "feMerge",
  "feMergeNode",
  "feMorphology",
  "feOffset",
  "fePointLight",
  "feSpecularLighting",
  "feSpotLight",
  "feTile",
  "feTurbulence",
  "filter",
  "foreignObject",
  "g",
  "image",
  "line",
  "linearGradient",
  "marker",
  "mask",
  "path",
  "pattern",
  "polygon",
  "polyline",
  "radialGradient",
  "rect",
  "stop",
  "svg",
  "symbol",
  "text",
  "textPath",
  "tspan",
  "use",
]);

/**
 * Count inline paint in a TSX source: paint-named object-literal keys AND
 * imperative `el.style.<paint> = …` mutations.
 *
 * Paint does not live only in inline `style={{}}` literals — these engines also
 * assemble it in `const cellStyle = { … }` objects later spread into a style
 * prop and in conditional spreads `...(cond ? { background } : {})`. These are
 * object-literal keys, so this lexical first pass scans keys whose innermost
 * open bracket is an object `{`, which a `style={{}}`-span scanner misses
 * (measured: it saw 4 of Table rustic's ~50 consts). A scope-aware AST pass
 * below owns shorthand properties and imperative writes.
 *
 * Two false-positive classes are excluded structurally, not by value regex:
 * (1) strings, template-literal text and comments are skipped, so a `@keyframes`
 * CSS string (`'…transform:rotate…'`, the spinner animation — an exempt residual)
 * and any CSS value with a colon do NOT count; (2) a paint-named key is counted
 * only when the innermost open bracket is `{`, so a function-parameter type
 * annotation like `(filter: FilterDef)` (innermost `(`) does not count — that
 * `filter` is a param name, not paint. `${…}` template expressions are scanned
 * as code.
 */
function countExplicitObjectPaintInFile(text) {
  const n = text.length;
  let count = 0;
  let str = null; // "'" | '"' while inside a plain string
  // Bracket stack: "{" "(" "[" for code brackets, "`" for a template literal,
  // "$" for a ${…} expression (opened by `${`, closed by its matching `}`).
  const stack = [];
  const topIs = (ch) => stack.length > 0 && stack[stack.length - 1] === ch;
  // Stack depths at which a TYPE body opened (`interface X {`, `type X = {`).
  // A member named `color`/`background`/`fill` inside one is a type annotation,
  // not paint -- it cannot be migrated to a skin, so counting it would leave the
  // file permanently unable to reach 0. The parameter case (`(filter: FilterDef)`)
  // is already excluded structurally by the innermost-bracket rule; interface and
  // type-alias bodies are not, because their innermost bracket IS `{`.
  const typeBodyDepths = [];
  const inTypeBody = () => typeBodyDepths.length > 0;
  let pendingTypeBody = false;
  // The last CODE character seen -- comments and whitespace never update it. A
  // backward scan over raw text cannot do this: it lands inside any comment that
  // sits between the previous `,`/`{` and the key, and the key vanishes from the
  // count. That is an UNDER-count, the worst direction for a ratchet: a file with
  // live paint right after a comment would read as `inlinePaint: 0` -- migrated.
  let prevMeaningful = "";
  let i = 0;
  while (i < n) {
    const c = text[i];
    const c2 = text[i + 1];
    if (str) {
      if (c === "\\") i += 2;
      else {
        if (c === str) str = null;
        i++;
      }
      continue;
    }
    if (topIs("`")) {
      if (c === "\\") i += 2;
      else if (c === "`") {
        stack.pop();
        i++;
      } else if (c === "$" && c2 === "{") {
        stack.push("$");
        i += 2;
      } else i++;
      continue;
    }
    // code context (stack empty, inside a bracket, or inside a ${…} expression)
    if (c === "/" && c2 === "/") {
      while (i < n && text[i] !== "\n") i++;
      continue;
    }
    if (c === "/" && c2 === "*") {
      i += 2;
      while (i < n && !(text[i] === "*" && text[i + 1] === "/")) i++;
      i += 2;
      continue;
    }
    if (c === "'" || c === '"') {
      str = c;
      i++;
      continue;
    }
    if (c === "`") {
      stack.push("`");
      i++;
      continue;
    }
    // `interface X {` / `type X = {` open a type body, not an object literal.
    if (/[A-Za-z]/.test(c) && (i === 0 || !/[A-Za-z0-9_$]/.test(text[i - 1]))) {
      // `interface X {` and `type X = {` -- and ONLY those. A bare `type` is an
      // extremely common object KEY (`{ type: 'success' }`); matching it would
      // silence the whole object literal that follows and hide real paint.
      const ahead = text.slice(i, i + 120);
      const kw =
        /^interface\s+[A-Za-z_$]/.test(ahead) ? "interface"
        : /^type\s+[A-Za-z_$][\w$]*\s*(<[^=<>]*>)?\s*=/.test(ahead) ? "type"
        : null;
      if (kw && !inTypeBody()) {
        pendingTypeBody = true;
        i += kw.length;
        continue;
      }
    }
    if (c === "{" || c === "(" || c === "[") {
      if (c === "{" && pendingTypeBody) {
        typeBodyDepths.push(stack.length);
        pendingTypeBody = false;
      }
      if (c === "{") {
        // `const { bordered, backgroundColor } = props` is a DESTRUCTURING PATTERN,
        // not an object literal: its keys are PROP NAMES that merely resemble paint
        // (`bordered` matches the `border*` family). Counting them invents paint that
        // does not exist -- Card rustic reported a phantom site this way.
        const beforeDestr = text.slice(Math.max(0, i - 12), i);
        if (/\b(const|let|var)\s*$/.test(beforeDestr) && !inTypeBody()) {
          typeBodyDepths.push(stack.length);
        }
        // A RETURN-TYPE annotation opens a type body too: `function f(x: T): { color: string }`.
        // Its innermost bracket is `{`, so without this its members read as paint. The
        // `)` -> `:` -> `{` signature is unambiguous; an object literal's `key: {` is
        // never preceded by a closing paren.
        const beforeBrace = text.slice(Math.max(0, i - 40), i);
        if (/\)\s*:\s*$/.test(beforeBrace) && !inTypeBody()) {
          typeBodyDepths.push(stack.length);
        }
      }
      stack.push(c);
      prevMeaningful = c;
      i++;
      continue;
    }
    if (c === ";" && pendingTypeBody && !inTypeBody()) {
      // `type Alias = string;` -- never opened a body.
      pendingTypeBody = false;
      i++;
      continue;
    }
    if (c === "}") {
      if (topIs("{") || topIs("$")) {
        stack.pop();
        if (typeBodyDepths.length > 0 && typeBodyDepths[typeBodyDepths.length - 1] === stack.length) {
          typeBodyDepths.pop();
        }
      }
      prevMeaningful = c;
      i++;
      continue;
    }
    if (c === ")") {
      if (topIs("(")) stack.pop();
      i++;
      continue;
    }
    if (c === "]") {
      if (topIs("[")) stack.pop();
      i++;
      continue;
    }
    // a paint key is an object-literal key (innermost bracket is `{`) starting
    // at an identifier boundary.
    if (topIs("{") && !inTypeBody() && /[A-Za-z]/.test(c) && (i === 0 || !/[A-Za-z0-9_$]/.test(text[i - 1]))) {
      const ahead = text.slice(i, i + 48);
      // An object KEY is preceded by `{` or `,` -- and by nothing else. Without this
      // the `color` in `background: active ? color : x` reads as a second key (the
      // TERNARY's colon looks like a key's colon) and the counter inflates. It is
      // computed from the last MEANINGFUL character, so comments between the comma
      // and the key do not hide the key.
      const atKeyPosition = prevMeaningful === "{" || prevMeaningful === ",";
      const m = atKeyPosition ? ARC09_PAINT_KEY_RE.exec(ahead) : null;
      if (m && !ARC09_PAINT_EXEMPT.has(m[1])) count += 1;
    }
    if (!/\s/.test(c)) prevMeaningful = c;
    i++;
  }
  return count;
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
      return ts.ScriptKind.TSX;
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
      `Cannot count inline paint in ${fileName}:${line + 1}:${
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

function staticString(node) {
  const expression = unwrapExpression(node);
  return expression && ts.isStringLiteralLike(expression)
    ? expression.text
    : null;
}

function staticPropertyName(name) {
  if (ts.isIdentifier(name) || ts.isStringLiteralLike(name)) return name.text;
  if (ts.isComputedPropertyName(name)) return staticString(name.expression);
  return null;
}

function propertyAccessParts(node) {
  const expression = unwrapExpression(node);
  if (expression && ts.isPropertyAccessExpression(expression)) {
    return { object: expression.expression, name: expression.name.text };
  }
  if (expression && ts.isElementAccessExpression(expression)) {
    return {
      object: expression.expression,
      name: expression.argumentExpression
        ? staticString(expression.argumentExpression)
        : null,
    };
  }
  return null;
}

function isPaintProperty(name) {
  if (typeof name !== "string" || name.startsWith("--")) return false;
  const camel = name.replace(/-([a-z])/g, (_, ch) => ch.toUpperCase());
  return (
    ARC09_PAINT_KEY_RE.test(camel + ":") && !ARC09_PAINT_EXEMPT.has(camel)
  );
}

function isStyleTypeNode(node, sourceFile) {
  return Boolean(
    node &&
      /(?:^|\W)(?:(?:React|csstype)\.)?(?:CSSProperties|CSSStyleDeclaration|Properties)(?:\W|$)/.test(
        node.getText(sourceFile)
      )
  );
}

function expressionHasStyleAssertion(node, sourceFile) {
  let expression = node;
  while (expression) {
    if (
      (ts.isAsExpression(expression) ||
        ts.isTypeAssertionExpression(expression) ||
        ts.isSatisfiesExpression(expression)) &&
      isStyleTypeNode(expression.type, sourceFile)
    ) {
      return true;
    }
    if (
      ts.isParenthesizedExpression(expression) ||
      ts.isAsExpression(expression) ||
      ts.isTypeAssertionExpression(expression) ||
      ts.isNonNullExpression(expression) ||
      ts.isSatisfiesExpression(expression)
    ) {
      expression = expression.expression;
    } else {
      break;
    }
  }
  return false;
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

function declarationScope(node, blockScoped, sourceFile) {
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

/**
 * Bind names to declarations by lexical scope. A file-global `Set<string>` is
 * unsafe here: a local data variable can shadow an outer value that feeds a
 * JSX `style` sink, causing either a false positive or a hidden mutation.
 */
function collectLexicalBindings(sourceFile) {
  const scopes = new Map();
  const entries = [];

  function add(scope, name, entry) {
    if (!scope) return;
    const bindings = scopes.get(scope) ?? new Map();
    const sameName = bindings.get(name) ?? [];
    const complete = { ...entry, name };
    sameName.push(complete);
    bindings.set(name, sameName);
    scopes.set(scope, bindings);
    entries.push(complete);
  }

  function addName(scope, name, entry) {
    if (ts.isIdentifier(name)) {
      add(scope, name.text, entry);
      return;
    }
    if (ts.isObjectBindingPattern(name) || ts.isArrayBindingPattern(name)) {
      for (const element of name.elements) {
        if (!ts.isBindingElement(element)) continue;
        const boundProperty = ts.isObjectBindingPattern(name)
          ? element.propertyName
            ? staticPropertyName(element.propertyName)
            : ts.isIdentifier(element.name)
              ? element.name.text
              : null
          : null;
        const bindingSource = entry.bindingSource ?? entry.initializer ?? null;
        addName(scope, element.name, {
          ...entry,
          initializer: element.initializer ?? null,
          type: null,
          fromBindingPattern: true,
          boundProperty,
          bindingSource,
        });
      }
    }
  }

  function visit(node) {
    if (ts.isVariableDeclaration(node)) {
      const list = ts.isVariableDeclarationList(node.parent) ? node.parent : null;
      const blockScoped = Boolean(
        list?.flags & (ts.NodeFlags.Let | ts.NodeFlags.Const)
      );
      addName(declarationScope(node, blockScoped, sourceFile), node.name, {
        declaration: node,
        initializer: node.initializer ?? null,
        type: node.type ?? null,
      });
    } else if (ts.isParameter(node)) {
      addName(nearestScope(node.parent), node.name, {
        declaration: node,
        initializer: node.initializer ?? null,
        type: node.type ?? null,
      });
    } else if (
      (ts.isImportClause(node) ||
        ts.isImportSpecifier(node) ||
        ts.isNamespaceImport(node)) &&
      node.name
    ) {
      add(sourceFile, node.name.text, {
        declaration: node,
        initializer: null,
        type: null,
      });
    } else if (
      (ts.isFunctionDeclaration(node) ||
        ts.isClassDeclaration(node) ||
        ts.isEnumDeclaration(node)) &&
      node.name
    ) {
      add(declarationScope(node, true, sourceFile), node.name.text, {
        declaration: node,
        initializer: null,
        type: null,
      });
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);

  function resolve(identifier) {
    let scope = nearestScope(identifier);
    while (scope) {
      const candidates = scopes.get(scope)?.get(identifier.text);
      if (candidates) return candidates.length === 1 ? candidates[0] : null;
      scope = nearestScope(scope.parent);
    }
    return null;
  }

  return { entries, resolve };
}

function callName(node) {
  const expression = unwrapExpression(node.expression);
  if (expression && ts.isIdentifier(expression)) return expression.text;
  const access = propertyAccessParts(expression);
  return access?.name ?? null;
}

function isAssignmentOperator(kind) {
  return kind >= ts.SyntaxKind.FirstAssignment && kind <= ts.SyntaxKind.LastAssignment;
}

function nearestFunction(node) {
  let current = node.parent;
  while (current && !ts.isFunctionLike(current)) current = current.parent;
  return current ?? null;
}

function isDomStylesheetRoot(node) {
  const expression = unwrapExpression(node);
  if (!expression) return false;
  if (ts.isNewExpression(expression)) {
    const ctor = unwrapExpression(expression.expression);
    return Boolean(ts.isIdentifier(ctor) && ctor.text === "CSSStyleSheet");
  }
  if (!ts.isCallExpression(expression)) return false;
  const callee = propertyAccessParts(expression.expression);
  if (!callee || callee.object.getText() !== "document") return false;
  if (callee.name === "createElement") {
    return staticString(expression.arguments[0])?.toLowerCase() === "style";
  }
  if (callee.name === "createElementNS") {
    return staticString(expression.arguments[1])?.toLowerCase() === "style";
  }
  return false;
}

/**
 * Count the channels a property-key lexer cannot classify safely:
 *
 * - shorthand paint in proven React `style` objects and create/clone prop bags;
 * - writes to CSSProperties/style bindings (`cardStyle.color = …`), including
 *   aliases and block shadowing;
 * - DOM `.style` writes and `setProperty` calls;
 * - quoted/computed paint keys, with unresolved computed names failing closed.
 */
function countScopedStylePaintInFile(text, fileName) {
  const sourceFile = parseSource(text, fileName);
  const { entries, resolve } = collectLexicalBindings(sourceFile);
  const styleBindings = new Set();
  const propBagBindings = new Set();
  const styleObjects = new Set();
  const propBagObjects = new Set();
  const bindingAssignments = new Map();
  const objectAssignCalls = [];
  const allNodes = [];
  const opaqueRoots = new Set();
  const visitedFunctions = new Set();

  function assignmentFor(entry, expression) {
    const values = bindingAssignments.get(entry) ?? [];
    values.push(expression);
    bindingAssignments.set(entry, values);
  }

  function collect(node) {
    allNodes.push(node);
    if (
      ts.isBinaryExpression(node) &&
      isAssignmentOperator(node.operatorToken.kind)
    ) {
      const left = unwrapExpression(node.left);
      if (left && ts.isIdentifier(left)) {
        const entry = resolve(left);
        if (entry) assignmentFor(entry, node.right);
      }
    }
    if (
      ts.isCallExpression(node) &&
      callName(node) === "assign" &&
      propertyAccessParts(node.expression)?.object.getText(sourceFile) === "Object"
    ) {
      objectAssignCalls.push(node);
    }
    ts.forEachChild(node, collect);
  }
  collect(sourceFile);

  function isConsumerStyleInput(entry) {
    const bindingSource = unwrapExpression(entry.bindingSource);
    return (
      // Any value received as a parameter is caller-owned, including renamed
      // object-binding properties such as `{ overlayStyle }`.
      ts.isParameter(entry.declaration) ||
      // A direct `const { imageStyle } = props` is equally caller-owned. Keep
      // this deliberately demonstrable: arbitrary objects named `config` or
      // `theme` may contain source-authored style decisions and stay fail-closed.
      (entry.fromBindingPattern === true &&
        bindingSource &&
        ts.isIdentifier(bindingSource) &&
        bindingSource.text === "props")
    );
  }

  function recordOpaque(node, mode, entry = null) {
    if (entry && isConsumerStyleInput(entry)) return;
    const identity = entry
      ? `${entry.declaration.pos}:${entry.declaration.end}`
      : `${node.getText(sourceFile)}:${nearestScope(node)?.pos ?? 0}`;
    opaqueRoots.add(`${mode}:${identity}`);
  }

  function markFunction(fn, mode) {
    const identity = `${mode}:${fn.pos}:${fn.end}`;
    if (visitedFunctions.has(identity)) return;
    visitedFunctions.add(identity);
    if (ts.isArrowFunction(fn) && !ts.isBlock(fn.body)) {
      markExpression(fn.body, mode);
      return;
    }
    const body = fn.body;
    if (!body || !ts.isBlock(body)) return;
    function visitReturns(node) {
      if (node !== body && ts.isFunctionLike(node)) return;
      if (ts.isReturnStatement(node) && node.expression) {
        markExpression(node.expression, mode);
        return;
      }
      ts.forEachChild(node, visitReturns);
    }
    visitReturns(body);
  }

  function localCallable(call) {
    const callee = unwrapExpression(call.expression);
    if (!callee || !ts.isIdentifier(callee)) return null;
    const entry = resolve(callee);
    if (!entry) return null;
    const candidate = unwrapExpression(entry.initializer) ?? entry.declaration;
    return ts.isFunctionLike(candidate) ? { entry, fn: candidate } : { entry, fn: null };
  }

  function markExpression(node, mode) {
    if (!node) return;
    const expression = unwrapExpression(node);
    if (!expression) return;

    if (ts.isIdentifier(expression)) {
      const entry = resolve(expression);
      if (!entry) {
        recordOpaque(expression, mode);
        return;
      }
      const target = mode === "style" ? styleBindings : propBagBindings;
      if (target.has(entry)) {
        if (
          !entry.initializer &&
          bindingAssignments.get(entry)?.length !== 0 &&
          (ts.isImportClause(entry.declaration) ||
            ts.isImportSpecifier(entry.declaration) ||
            ts.isNamespaceImport(entry.declaration))
        ) {
          recordOpaque(expression, mode, entry);
        }
        return;
      }
      target.add(entry);
      const assigned = bindingAssignments.get(entry) ?? [];
      if (entry.initializer) markExpression(entry.initializer, mode);
      else if (assigned.length === 0) recordOpaque(expression, mode, entry);
      for (const value of assigned) {
        markExpression(value, mode);
      }
      return;
    }

    if (ts.isObjectLiteralExpression(expression)) {
      const target = mode === "style" ? styleObjects : propBagObjects;
      if (target.has(expression)) return;
      target.add(expression);
      for (const property of expression.properties) {
        if (ts.isSpreadAssignment(property)) {
          markExpression(property.expression, mode);
        } else if (
          ts.isPropertyAssignment(property) &&
          staticPropertyName(property.name) === "style"
        ) {
          markExpression(property.initializer, "style");
        }
      }
      return;
    }

    if (ts.isConditionalExpression(expression)) {
      markExpression(expression.whenTrue, mode);
      markExpression(expression.whenFalse, mode);
      return;
    }
    if (ts.isBinaryExpression(expression)) {
      if (expression.operatorToken.kind === ts.SyntaxKind.CommaToken) {
        markExpression(expression.right, mode);
      } else if (
        expression.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ||
        expression.operatorToken.kind === ts.SyntaxKind.BarBarToken ||
        expression.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken
      ) {
        markExpression(expression.left, mode);
        markExpression(expression.right, mode);
      }
      return;
    }

    if (ts.isCallExpression(expression)) {
      const callable = localCallable(expression);
      if (callable?.fn) markFunction(callable.fn, mode);
      else recordOpaque(expression.expression, mode, callable?.entry ?? null);
    }
  }

  // A style-like name is evidence only when it directly initializes an object
  // builder. Strings named `inlineStyle` and DOM stylesheet roots belong to
  // other channels. All non-literal builders must be proven by a CSS type,
  // assertion or an actual style/prop-bag sink.
  for (const entry of entries) {
    const initializer = unwrapExpression(entry.initializer);
    if (
      !isDomStylesheetRoot(entry.initializer) &&
      ((/style$/i.test(entry.name) &&
        initializer &&
        ts.isObjectLiteralExpression(initializer)) ||
        isStyleTypeNode(entry.type, sourceFile) ||
        expressionHasStyleAssertion(entry.initializer, sourceFile))
    ) {
      if (!styleBindings.has(entry)) {
        styleBindings.add(entry);
        markExpression(entry.initializer, "style");
      }
    }
  }

  for (const node of allNodes) {
    if (ts.isJsxAttribute(node) && node.name.getText(sourceFile) === "style") {
      const initializer = node.initializer;
      if (initializer && ts.isJsxExpression(initializer)) {
        markExpression(initializer.expression, "style");
      }
    } else if (
      ts.isPropertyAssignment(node) &&
      staticPropertyName(node.name) === "style"
    ) {
      markExpression(node.initializer, "style");
    } else if (ts.isReturnStatement(node) && node.expression) {
      const fn = nearestFunction(node);
      if (fn && isStyleTypeNode(fn.type, sourceFile)) {
        markExpression(node.expression, "style");
      }
    } else if (
      ts.isArrowFunction(node) &&
      !ts.isBlock(node.body) &&
      isStyleTypeNode(node.type, sourceFile)
    ) {
      markExpression(node.body, "style");
    } else if (ts.isCallExpression(node) && node.arguments.length >= 2) {
      const name = callName(node);
      if (name === "cloneElement") {
        markExpression(node.arguments[1], "propBag");
      } else if (
        name === "createElement" &&
        SVG_CREATE_ELEMENT_TAGS.has(staticString(node.arguments[0]))
      ) {
        // Intrinsic createElement prop bags are not visited by JSX-aware SVG
        // counters. Paint shorthands here therefore belong to this channel.
        markExpression(node.arguments[1], "propBag");
      }
    }
  }

  // Sources merged into a proven style/prop bag are themselves style data.
  // Iterate because an Object.assign source can alias another assigned target.
  let changed = true;
  while (changed) {
    const before =
      styleBindings.size + propBagBindings.size + styleObjects.size + propBagObjects.size;
    for (const call of objectAssignCalls) {
      const [target, ...sources] = call.arguments;
      if (isStyleExpression(target)) {
        for (const source of sources) markExpression(source, "style");
      } else {
        const unwrapped = unwrapExpression(target);
        const entry = unwrapped && ts.isIdentifier(unwrapped) ? resolve(unwrapped) : null;
        if (entry && propBagBindings.has(entry)) {
          for (const source of sources) markExpression(source, "propBag");
        }
      }
    }
    // Forward aliases need the reverse edge too: `cardStyle` can be proven by
    // its name/type before `alias.color = …` is encountered.
    for (const entry of entries) {
      const sources = [entry.initializer, ...(bindingAssignments.get(entry) ?? [])].filter(Boolean);
      if (!styleBindings.has(entry) && sources.some((source) => isStyleExpression(source))) {
        styleBindings.add(entry);
        for (const source of sources) markExpression(source, "style");
      }
      if (!propBagBindings.has(entry)) {
        const propBagSource = sources.some((source) => {
          const expression = unwrapExpression(source);
          if (expression && ts.isIdentifier(expression)) {
            const sourceEntry = resolve(expression);
            return Boolean(sourceEntry && propBagBindings.has(sourceEntry));
          }
          return Boolean(expression && ts.isObjectLiteralExpression(expression) && propBagObjects.has(expression));
        });
        if (propBagSource) {
          propBagBindings.add(entry);
          for (const source of sources) markExpression(source, "propBag");
        }
      }
    }
    const after =
      styleBindings.size + propBagBindings.size + styleObjects.size + propBagObjects.size;
    changed = after !== before;
  }

  function isStyleExpression(node) {
    if (!node) return false;
    if (expressionHasStyleAssertion(node, sourceFile)) return true;
    const expression = unwrapExpression(node);
    if (!expression) return false;
    if (ts.isIdentifier(expression)) {
      const entry = resolve(expression);
      return Boolean(entry && styleBindings.has(entry));
    }
    if (ts.isObjectLiteralExpression(expression)) {
      return styleObjects.has(expression);
    }
    const access = propertyAccessParts(expression);
    return access?.name === "style";
  }

  function isQualifiedObject(node) {
    return styleObjects.has(node) || propBagObjects.has(node);
  }

  function writeProperty(left) {
    const access = propertyAccessParts(left);
    if (!access || !isStyleExpression(access.object)) return 0;
    // A computed name on a proven style object fails closed. A known non-paint
    // property (width, opacity, animation, etc.) remains outside this channel.
    return access.name === null ? 1 : Number(isPaintProperty(access.name));
  }

  let count = 0;
  for (const node of allNodes) {
    if (ts.isShorthandPropertyAssignment(node)) {
      const object = node.parent;
      if (isQualifiedObject(object) && isPaintProperty(node.name.text)) {
        count += 1;
      }
      continue;
    }

    if (ts.isPropertyAssignment(node)) {
      // Identifier keys are already owned by the lexical first pass. Quoted and
      // computed keys are not; statically classify them everywhere to preserve
      // that pass's whole-object convention.
      if (!ts.isIdentifier(node.name)) {
        const name = staticPropertyName(node.name);
        if (name !== null) count += Number(isPaintProperty(name));
        else if (isQualifiedObject(node.parent)) count += 1;
      }
      continue;
    }

    if (
      ts.isBinaryExpression(node) &&
      isAssignmentOperator(node.operatorToken.kind)
    ) {
      count += writeProperty(node.left);
      continue;
    }

    if (!ts.isCallExpression(node)) continue;
    const name = callName(node);
    const callee = propertyAccessParts(node.expression);
    if (name === "setProperty" && callee && isStyleExpression(callee.object)) {
      if (node.arguments.length === 0) count += 1;
      else {
        const property = staticString(node.arguments[0]);
        count += property === null ? 1 : Number(isPaintProperty(property));
      }
    } else if (
      name === "set" &&
      callee?.object.getText(sourceFile) === "Reflect" &&
      node.arguments.length >= 2 &&
      isStyleExpression(node.arguments[0])
    ) {
      const property = staticString(node.arguments[1]);
      count += property === null ? 1 : Number(isPaintProperty(property));
    } else if (
      name === "defineProperty" &&
      callee?.object.getText(sourceFile) === "Object" &&
      node.arguments.length >= 2 &&
      isStyleExpression(node.arguments[0])
    ) {
      const property = staticString(node.arguments[1]);
      count += property === null ? 1 : Number(isPaintProperty(property));
    }
  }

  return count + opaqueRoots.size;
}

export function countArc09PaintInFile(text, fileName = "source.tsx") {
  return (
    countExplicitObjectPaintInFile(text) +
    countScopedStylePaintInFile(text, fileName)
  );
}
