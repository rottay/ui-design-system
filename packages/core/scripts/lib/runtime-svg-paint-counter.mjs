import { readFileSync, realpathSync } from "node:fs";
import { extname, resolve } from "node:path";
import ts from "typescript";

/**
 * Runtime SVG paint is a separate channel from React's `style={{ ... }}` paint:
 * D3 writes presentation properties through setter calls, DOM code can use
 * `setAttribute`, and JSX can emit SVG presentation attributes directly. These
 * channels are invisible or ambiguous to a text lexer, so this counter deliberately
 * works from TypeScript's syntax tree.
 *
 * Coverage is intentionally SVG-only: Canvas `fillStyle`/`strokeStyle`, CSS paint,
 * and props on custom React components are separate channels and are not counted.
 * `React.createElement('path', { fill: value })` prop bags also remain in the
 * fleet inline/object-literal channel; counting them here as well would make one
 * authored site satisfy two independently-ratcheted channels.
 */
const D3_PAINT_PROPERTIES = new Set([
  "fill",
  "stroke",
  "stop-color",
  "flood-color",
  "lighting-color",
]);
const DOM_PAINT_ATTRIBUTES = D3_PAINT_PROPERTIES;
const JSX_PAINT_ATTRIBUTES = new Set([
  "fill",
  "stroke",
  "stopColor",
  "stop-color",
  "floodColor",
  "flood-color",
  "lightingColor",
  "lighting-color",
]);

/**
 * Intrinsic SVG element names accepted by React/JSX. Restricting attributes to
 * these names keeps a component API such as `<Icon fill={tone} />` out of the
 * runtime-paint gate: that prop may or may not reach an SVG presentation
 * attribute, whereas `<path fill={tone} />` certainly does.
 */
const SVG_INTRINSIC_ELEMENTS = new Set([
  "a",
  "animate",
  "animateMotion",
  "animateTransform",
  "circle",
  "clipPath",
  "defs",
  "desc",
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
  "metadata",
  "mpath",
  "path",
  "pattern",
  "polygon",
  "polyline",
  "radialGradient",
  "rect",
  "script",
  "set",
  "stop",
  "style",
  "svg",
  "switch",
  "symbol",
  "text",
  "textPath",
  "title",
  "tspan",
  "use",
  "view",
]);

// These tag names exist in both HTML and SVG. SVG-only tags such as `path`
// remain countable as a component root, but an ambiguous tag needs namespace
// context so an ordinary HTML `<a {...props}>` is not reported as SVG paint.
const HTML_SVG_AMBIGUOUS_ELEMENTS = new Set([
  "a",
  "script",
  "style",
  "title",
]);

/**
 * Machine-readable convention for structural values that are intentionally not
 * paint decisions:
 *
 * - `none` suppresses painting.
 * - `currentColor` delegates the decision to the element's CSS `color`. This
 *   counter records that delegation, but the actual `color` declaration remains
 *   owned by the inline/CSS paint channels. D3 `.style('color', ...)` is not
 *   counted here because, without type and ancestry information, it is usually
 *   inherited text colour rather than an SVG presentation-paint write.
 * - `url(#...)` only references a local paint server; its stops are counted at
 *   their own `stop-color`/`stopColor` sites, avoiding double counting.
 * - an explicit nullish D3 setter removes the attribute/property; nullish JSX
 *   attributes are omitted by React.
 *
 * DOM `setAttribute(name, nullish)` is deliberately not structural: the DOM API
 * stringifies the value instead of removing the attribute.
 *
 * `transparent` is intentionally absent: it is an authored color and therefore
 * remains a paint site even if its alpha is zero.
 */
export const STRUCTURAL_SVG_PAINT_CONVENTION = Object.freeze({
  none: "suppresses-paint",
  currentColor: "delegates-to-css-color",
  localPaintServer: "delegates-to-local-paint-server",
  nullishRemoval: "removes-runtime-paint",
});

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
    const message = ts.flattenDiagnosticMessageText(
      diagnostic.messageText,
      " "
    );
    throw new SyntaxError(
      `Cannot count runtime SVG paint in ${fileName}:${line + 1}:${
        character + 1
      }: ${message}`
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

function staticValueFromExpression(node) {
  const expression = unwrapExpression(node);
  if (!expression) return null;

  if (ts.isStringLiteralLike(expression)) return expression.text;
  if (ts.isTemplateExpression(expression)) {
    let value = expression.head.text;
    for (const span of expression.templateSpans) {
      value += "__RUNTIME_EXPRESSION__" + span.literal.text;
    }
    return value;
  }
  return null;
}

function structuralReasonForString(value) {
  const normalized = value.trim();
  const lower = normalized.toLowerCase();
  if (lower === "none") return STRUCTURAL_SVG_PAINT_CONVENTION.none;
  if (lower === "currentcolor") {
    return STRUCTURAL_SVG_PAINT_CONVENTION.currentColor;
  }

  // Only local fragment references are structural. An external `url(...)` can
  // introduce its own authored paint and must remain visible to the gate.
  const url = /^url\(\s*(.*?)\s*\)$/i.exec(normalized);
  if (url) {
    let reference = url[1].trim();
    const quote = reference[0];
    if ((quote === '"' || quote === "'") && reference.at(-1) === quote) {
      reference = reference.slice(1, -1).trim();
    }
    if (reference.startsWith("#") && reference.length > 1) {
      return STRUCTURAL_SVG_PAINT_CONVENTION.localPaintServer;
    }
  }

  return null;
}

function structuralValue(expression, { nullishRemoval = true } = {}) {
  const unwrapped = unwrapExpression(expression);
  if (
    nullishRemoval &&
    unwrapped &&
    (unwrapped.kind === ts.SyntaxKind.NullKeyword ||
      (ts.isIdentifier(unwrapped) && unwrapped.text === "undefined"))
  ) {
    return {
      value: unwrapped.getText(),
      reason: STRUCTURAL_SVG_PAINT_CONVENTION.nullishRemoval,
    };
  }

  const value = staticValueFromExpression(unwrapped);
  if (value === null) return null;
  const reason = structuralReasonForString(value);
  return reason ? { value, reason } : null;
}

function jsxAttributeExpression(attribute) {
  const initializer = attribute.initializer;
  if (!initializer) return null;
  if (ts.isStringLiteral(initializer)) return initializer;
  if (ts.isJsxExpression(initializer)) return initializer.expression ?? null;
  return null;
}

function jsxElementName(attribute) {
  const openingLike = attribute.parent?.parent;
  if (
    !openingLike ||
    (!ts.isJsxOpeningElement(openingLike) &&
      !ts.isJsxSelfClosingElement(openingLike))
  ) {
    return null;
  }
  return openingLike.tagName.getText();
}

function isSvgPaintElement(attribute) {
  const element = jsxElementName(attribute);
  if (!element || !SVG_INTRINSIC_ELEMENTS.has(element)) return false;
  if (!HTML_SVG_AMBIGUOUS_ELEMENTS.has(element)) return true;

  // Walk from the use site outward. `foreignObject` changes descendants back
  // to the HTML namespace; a nested `<svg>` changes them back again.
  for (let ancestor = attribute.parent; ancestor; ancestor = ancestor.parent) {
    if (!ts.isJsxElement(ancestor)) continue;
    const tag = ancestor.openingElement.tagName.getText();
    if (tag === "svg") return true;
    if (tag === "foreignObject") return false;
  }
  return false;
}

function staticObjectPropertyName(name) {
  if (ts.isIdentifier(name) || ts.isStringLiteralLike(name)) return name.text;
  if (ts.isComputedPropertyName(name)) {
    return staticStringLiteral(name.expression);
  }
  return null;
}

function objectPropertyNameExpression(name) {
  return ts.isComputedPropertyName(name) ? name.expression : name;
}

function sourceLocation(sourceFile, node) {
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(
    node.getStart(sourceFile)
  );
  return { line: line + 1, column: character + 1 };
}

function paintSite(sourceFile, node, kind, property) {
  return { kind, property, ...sourceLocation(sourceFile, node) };
}

function staticStringLiteral(node) {
  const expression = unwrapExpression(node);
  return expression && ts.isStringLiteralLike(expression)
    ? expression.text
    : null;
}

function callMethodName(callExpression) {
  const expression = unwrapExpression(callExpression.expression);
  if (!expression) return null;
  if (ts.isPropertyAccessExpression(expression)) return expression.name.text;
  if (ts.isElementAccessExpression(expression)) {
    return staticStringLiteral(expression.argumentExpression);
  }
  return null;
}

function computedElementAccessMethod(callExpression) {
  const expression = unwrapExpression(callExpression.expression);
  if (
    ts.isElementAccessExpression(expression) &&
    staticStringLiteral(expression.argumentExpression) === null
  ) {
    return expression.argumentExpression;
  }
  return null;
}

function isD3SetterShape(method, argumentCount) {
  return method === "attr" || method === "attrTween"
    ? argumentCount === 2
    : (method === "style" || method === "styleTween") &&
        (argumentCount === 2 || argumentCount === 3);
}

/**
 * Analyze one JS/TS source without type-checking it. D3 setters are recognized as
 * `.attr`/`.attrTween(<name>, <value>)` and
 * `.style`/`.styleTween(<name>, <value>[, <priority>])`; the setter arity
 * distinguishes them from one-argument getters. DOM `setAttribute`/`setAttributeNS`
 * writes and JSX paint attributes/spreads on intrinsic SVG elements form the
 * other two channels.
 *
 * A recognized setter whose property name is not a static string is counted as an
 * unclassified gate site. This is deliberately fail-closed: changing a literal
 * paint name to an alias or computed expression cannot silently evade the census.
 */
export function analyzeRuntimeSvgPaint(text, fileName = "source.tsx") {
  const sourceFile = parseSource(text, fileName);
  const sites = [];
  const ignoredSites = [];
  const unclassifiedSites = [];

  function record(node, kind, property, valueExpression, structuralOptions) {
    const structural = structuralValue(valueExpression, structuralOptions);
    const site = paintSite(sourceFile, node, kind, property);
    if (structural) {
      ignoredSites.push({ ...site, ...structural });
    } else {
      sites.push(site);
    }
  }

  function recordUnclassified(node, kind, method, nameExpression) {
    unclassifiedSites.push({
      kind,
      method,
      expression: nameExpression.getText(sourceFile),
      ...sourceLocation(sourceFile, node),
    });
  }

  function recordJsxSpread(spread) {
    if (!isSvgPaintElement(spread)) return;

    const expression = unwrapExpression(spread.expression);
    if (!expression || !ts.isObjectLiteralExpression(expression)) {
      recordUnclassified(spread, "jsx-spread", "spread", spread.expression);
      return;
    }

    for (const propertyNode of expression.properties) {
      if (ts.isSpreadAssignment(propertyNode)) {
        recordUnclassified(
          propertyNode,
          "jsx-spread",
          "spread",
          propertyNode.expression
        );
        continue;
      }

      if (ts.isShorthandPropertyAssignment(propertyNode)) {
        const property = propertyNode.name.text;
        if (JSX_PAINT_ATTRIBUTES.has(property)) {
          record(
            propertyNode,
            "jsx-spread",
            property,
            propertyNode.name
          );
        }
        continue;
      }

      if (ts.isPropertyAssignment(propertyNode)) {
        const property = staticObjectPropertyName(propertyNode.name);
        if (property === null) {
          recordUnclassified(
            propertyNode,
            "jsx-spread",
            "spread",
            objectPropertyNameExpression(propertyNode.name)
          );
        } else if (JSX_PAINT_ATTRIBUTES.has(property)) {
          record(
            propertyNode,
            "jsx-spread",
            property,
            propertyNode.initializer
          );
        }
        continue;
      }

      if (propertyNode.name) {
        const property = staticObjectPropertyName(propertyNode.name);
        if (property === null) {
          recordUnclassified(
            propertyNode,
            "jsx-spread",
            "spread",
            objectPropertyNameExpression(propertyNode.name)
          );
        } else if (JSX_PAINT_ATTRIBUTES.has(property)) {
          record(propertyNode, "jsx-spread", property, propertyNode);
        }
      }
    }
  }

  function visit(node) {
    if (ts.isCallExpression(node)) {
      const method = callMethodName(node);
      const computedMethod = computedElementAccessMethod(node);
      if (
        method === null &&
        computedMethod &&
        (node.arguments.length === 2 || node.arguments.length === 3) &&
        (staticStringLiteral(node.arguments[0]) === null ||
          D3_PAINT_PROPERTIES.has(staticStringLiteral(node.arguments[0])))
      ) {
        const [nameExpression] = node.arguments;
        unclassifiedSites.push({
          kind: "d3-setter",
          method: computedMethod.getText(sourceFile),
          expression: nameExpression.getText(sourceFile),
          ...sourceLocation(sourceFile, computedMethod),
        });
      } else if (method && isD3SetterShape(method, node.arguments.length)) {
        const [nameExpression, valueExpression] = node.arguments;
        const property = staticStringLiteral(nameExpression);
        if (property === null) {
          recordUnclassified(
            nameExpression,
            "d3-setter",
            method,
            nameExpression
          );
        } else if (D3_PAINT_PROPERTIES.has(property)) {
          // Anchor at the property-name argument rather than the whole nested call;
          // every node in a fluent D3 chain otherwise starts at the chain root.
          record(nameExpression, "d3-setter", property, valueExpression);
        }
      } else if (
        (method === "setAttribute" && node.arguments.length === 2) ||
        (method === "setAttributeNS" && node.arguments.length === 3)
      ) {
        const nameExpression =
          method === "setAttributeNS" ? node.arguments[1] : node.arguments[0];
        const valueExpression =
          method === "setAttributeNS" ? node.arguments[2] : node.arguments[1];
        const property = staticStringLiteral(nameExpression);
        if (property === null) {
          recordUnclassified(
            nameExpression,
            "dom-set-attribute",
            method,
            nameExpression
          );
        } else if (DOM_PAINT_ATTRIBUTES.has(property)) {
          record(
            nameExpression,
            "dom-set-attribute",
            property,
            valueExpression,
            { nullishRemoval: false }
          );
        }
      }
    } else if (ts.isJsxAttribute(node)) {
      const property = node.name.getText();
      if (
        JSX_PAINT_ATTRIBUTES.has(property) &&
        isSvgPaintElement(node)
      ) {
        record(node, "jsx-attribute", property, jsxAttributeExpression(node));
      }
    } else if (ts.isJsxSpreadAttribute(node)) {
      recordJsxSpread(node);
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  // Chained calls are nested AST nodes, so a depth-first walk observes the
  // outermost call first. Source ordering makes diagnostics and baselines much
  // easier to review and remains stable if a chain is reformatted.
  const byLocation = (left, right) =>
    left.line - right.line || left.column - right.column;
  sites.sort(byLocation);
  ignoredSites.sort(byLocation);
  unclassifiedSites.sort(byLocation);

  const d3Setters = sites.filter((site) => site.kind === "d3-setter").length;
  const domSetAttributes = sites.filter(
    (site) => site.kind === "dom-set-attribute"
  ).length;
  const jsxAttributes = sites.length - d3Setters - domSetAttributes;
  const classifiedPaint = sites.length;
  const unclassified = unclassifiedSites.length;
  return {
    // `count` is the fail-closed gate count: known paint plus possible paint whose
    // computed property name cannot be classified without data-flow analysis.
    count: classifiedPaint + unclassified,
    classifiedPaint,
    d3Setters,
    jsxAttributes,
    domSetAttributes,
    unclassified,
    ignoredStructural: ignoredSites.length,
    sites,
    ignoredSites,
    unclassifiedSites,
  };
}

export function countRuntimeSvgPaintInFile(text, fileName = "source.tsx") {
  return analyzeRuntimeSvgPaint(text, fileName).count;
}

/**
 * Stable, JSON-serializable per-file output suitable for a baseline/ratchet gate.
 * Duplicate paths cannot inflate the total and keys are sorted deterministically.
 */
export function countRuntimeSvgPaintByFile(sourceFiles) {
  const files = {};
  const unclassifiedSites = [];

  const canonicalFiles = [
    ...new Set(sourceFiles.map((file) => realpathSync(resolve(file)))),
  ].sort();

  for (const file of canonicalFiles) {
    const result = analyzeRuntimeSvgPaint(readFileSync(file, "utf8"), file);
    files[file] = {
      count: result.count,
      classifiedPaint: result.classifiedPaint,
      d3Setters: result.d3Setters,
      jsxAttributes: result.jsxAttributes,
      domSetAttributes: result.domSetAttributes,
      unclassified: result.unclassified,
      ignoredStructural: result.ignoredStructural,
    };
    unclassifiedSites.push(
      ...result.unclassifiedSites.map((site) => ({ file, ...site }))
    );
  }

  const counts = Object.values(files);
  const sum = (property) =>
    counts.reduce((total, file) => total + file[property], 0);

  return {
    // Derive every aggregate from the per-file records so the invariant
    // `total === sum(files[*].count)` cannot drift.
    total: sum("count"),
    classifiedPaint: sum("classifiedPaint"),
    d3Setters: sum("d3Setters"),
    jsxAttributes: sum("jsxAttributes"),
    domSetAttributes: sum("domSetAttributes"),
    unclassified: sum("unclassified"),
    ignoredStructural: sum("ignoredStructural"),
    unclassifiedSites,
    files,
  };
}
