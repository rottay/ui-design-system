import { existsSync, readFileSync, realpathSync, statSync } from "node:fs";
import {
  dirname,
  extname,
  isAbsolute,
  join,
  relative,
  resolve as resolvePath,
  sep,
} from "node:path";
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
    ")\\s*:"
);
// border*/table box-model that is layout, not paint.
export const ARC09_PAINT_EXEMPT = new Set([
  "borderCollapse",
  "borderSpacing",
  // Not CSS properties at all -- they are PROP names that the `border*` family
  // pattern happens to match. Counting them invents paint that cannot exist.
  "bordered",
  "borderless",
  // Semantic recipe / data-contract names, not CSS declarations.
  "outlined",
  "backgroundMode",
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
  ARC09_PAINT_KEY_RE.source.replace(/\\s\*:$/, "") + "\\s*(?=[,}])"
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
 * Same-package style producers whose authored paint is owned by their defining
 * module, not by every consumer that spreads/calls them. The registry is
 * deliberately export-specific and canonical-path-specific: a same-named
 * helper in another file remains opaque and therefore fails closed.
 *
 * Component-owned paint producers are normally enumerated at their defining
 * module. `Tooltip/contracts/PLACEMENT_MAP` is the narrow exception: its placement
 * transforms are overwritten later in the only productive consumer before the
 * style reaches React. The two lower-layer producers (`runtime/personality`
 * and `foundation/tokens/ts/foundation/base/density`) return only non-paint/custom-property values.
 * Every entry is still verified to exist and export the exact symbol.
 */
const ownedStyle = (transparentArgs = []) => ({
  kind: "style",
  ownership: "owned",
  transparentArgs,
});

const CERTIFIED_INLINE_STYLE_PRODUCERS = new Map([
  [
    "ui/patterns/foundation/engine-styles/modern/index",
    new Map(
      [
        "cardBodyStyle",
        "menuSectionTitleStyle",
        "panelCardStyle",
        "pillBadgeSmStyle",
        "pillBadgeStyle",
        "popupPanelStyle",
        "spinnerStyle",
      ].map((name) => [name, ownedStyle()])
    ),
  ],
  [
    "ui/patterns/data/list-toolbar/foundation/tokens/index",
    new Map([["searchInputStyle", ownedStyle([{ index: 0, mode: "style" }])]]),
  ],
  [
    "ui/primitives/feedback/Toast/runtime/animation/index",
    new Map([["getToastAnimationStyle", ownedStyle()]]),
  ],
  [
    "ui/primitives/display/Tooltip/contracts/index",
    new Map([
      [
        "PLACEMENT_MAP",
        {
          kind: "style",
          ownership: "overwritten",
          allowedPaint: new Set(["transform"]),
          expectedPaintCount: 4,
          consumers: new Map([
            [
              "ui/primitives/display/Tooltip/engines/rustic/index",
              new Set(["transform"]),
            ],
          ]),
        },
      ],
    ]),
  ],
  [
    "ui/primitives/layout/Flex/runtime/presentation/index",
    new Map([
      [
        "resolveFlexAttributes",
        {
          kind: "nonStylePropBag",
          ownership: "zeroPaint",
          nonStylePaths: new Set([""]),
          transparentArgs: [],
        },
      ],
      [
        "resolveFlexParameterStyle",
        {
          kind: "style",
          ownership: "zeroPaint",
          stylePaths: new Set([""]),
          transparentArgs: [],
        },
      ],
    ]),
  ],
  [
    "ui/primitives/layout/Stack/runtime/presentation/index",
    new Map([
      [
        "resolveStackPresentation",
        {
          kind: "style",
          ownership: "zeroPaint",
          stylePaths: new Set(["style"]),
          transparentArgs: [{ index: 0, mode: "propBag" }],
        },
      ],
    ]),
  ],
  [
    "foundation/tokens/ts/runtime/personality/index",
    new Map([
      [
        "mergePersonalityStyle",
        {
          kind: "style",
          ownership: "zeroPaint",
          stylePaths: new Set([""]),
          transparentArgs: [
            { index: 0, mode: "style" },
            { index: 1, mode: "style" },
          ],
        },
      ],
      [
        "resolveButtonPersonalityStyle",
        {
          kind: "style",
          ownership: "zeroPaint",
          stylePaths: new Set([""]),
          transparentArgs: [],
        },
      ],
      [
        "resolveTypographyHeadingStyle",
        {
          kind: "style",
          ownership: "zeroPaint",
          stylePaths: new Set([""]),
          transparentArgs: [],
        },
      ],
      [
        "resolveTypographyTextStyle",
        {
          kind: "style",
          ownership: "zeroPaint",
          stylePaths: new Set([""]),
          transparentArgs: [],
        },
      ],
      [
        "resolveStatisticPersonalityStyle",
        {
          kind: "style",
          ownership: "zeroPaint",
          stylePaths: new Set([""]),
          transparentArgs: [],
        },
      ],
      [
        "resolveSkeletonPersonalityDefaults",
        {
          kind: "style",
          ownership: "zeroPaint",
          stylePaths: new Set(["style"]),
          transparentArgs: [],
        },
      ],
      [
        "resolveDividerPersonalityDefaults",
        {
          kind: "style",
          ownership: "zeroPaint",
          stylePaths: new Set(["style"]),
          transparentArgs: [],
        },
      ],
    ]),
  ],
  [
    "foundation/tokens/ts/foundation/base/density/index",
    new Map([
      [
        "resolveDensityStyleVars",
        {
          kind: "style",
          ownership: "zeroPaint",
          stylePaths: new Set([""]),
          transparentArgs: [],
        },
      ],
    ]),
  ],
  [
    "foundation/behavior/index",
    new Map([
      [
        "partAttributes",
        {
          kind: "nonStylePropBag",
          ownership: "zeroPaint",
          nonStylePaths: new Set([""]),
          transparentArgs: [],
        },
      ],
      [
        "useInteractionState",
        {
          kind: "nonStylePropBag",
          ownership: "zeroPaint",
          nonStylePaths: new Set(["handlers"]),
          transparentArgs: [],
        },
      ],
    ]),
  ],
  [
    "infrastructure/runtime/foundation/density/index",
    new Map([
      [
        "densityScopeAttributes",
        {
          kind: "nonStylePropBag",
          ownership: "zeroPaint",
          nonStylePaths: new Set([""]),
          transparentArgs: [],
        },
      ],
    ]),
  ],
  [
    "infrastructure/runtime/responsive/runtime/style-properties/index",
    new Map([
      [
        "generateResponsiveCSS",
        {
          kind: "nonStylePropBag",
          ownership: "zeroPaint",
          nonStylePaths: new Set(["attrs"]),
          transparentArgs: [],
        },
      ],
    ]),
  ],
  [
    // Motion recipe canon (WO-CRA-15): `variables` carries only `--ds-recipe-*`
    // custom properties (durations/distances/curve identity) and `attributes`
    // only `data-recipe`/`data-recipe-state`; the engine skin owns the paint
    // that consumes them. zeroPaint is verified against the hook's source.
    "infrastructure/runtime/foundation/motion/composition/react/preference/recipe/index",
    new Map([
      [
        "useMotionRecipePresentation",
        {
          kind: "style",
          ownership: "zeroPaint",
          stylePaths: new Set(["variables"]),
          nonStylePaths: new Set(["attributes"]),
          transparentArgs: [],
        },
      ],
    ]),
  ],
  [
    // View-transition vocabulary: these return only `viewTransitionName`/
    // `viewTransitionClass` identity declarations; the VT keyframes in
    // foundation/animations/transitions.css own the paint.
    "graphics/motion/react/runtime/index",
    new Map([
      [
        "tabPanelTransitionStyle",
        {
          kind: "style",
          ownership: "zeroPaint",
          stylePaths: new Set([""]),
          transparentArgs: [],
        },
      ],
      [
        "recordMorphStyle",
        {
          kind: "style",
          ownership: "zeroPaint",
          stylePaths: new Set([""]),
          transparentArgs: [],
        },
      ],
    ]),
  ],
  [
    // Typography craft emits layout and type declarations only. Contrast paint
    // is selected by the engine skins through the stable `data-contrast` stamp.
    "ui/primitives/display/Typography/runtime",
    new Map([
      [
        "resolveTypographyCraftStyle",
        {
          kind: "style",
          ownership: "zeroPaint",
          stylePaths: new Set([""]),
          transparentArgs: [],
        },
      ],
      [
        "typographyDataAttributes",
        {
          kind: "nonStylePropBag",
          ownership: "zeroPaint",
          nonStylePaths: new Set([""]),
          transparentArgs: [],
        },
      ],
    ]),
  ],
  [
    // Shared overlay positioning engine: `style` carries only positioning
    // declarations (position/top/left/visibility/inset/margins plus the CSS
    // anchor-positioning properties) and `anchorAttrs` only `data-ds-anchor`;
    // overlay paint stays with the component skins. zeroPaint is verified
    // against the hook's source.
    "ui/primitives/runtime/overlay/positioning/index",
    new Map([
      [
        "useOverlayPosition",
        {
          kind: "style",
          ownership: "zeroPaint",
          stylePaths: new Set(["style"]),
          nonStylePaths: new Set(["anchorAttrs"]),
          transparentArgs: [],
        },
      ],
    ]),
  ],
  [
    // The overlay stack returns a spreadable `layerProps` bag whose only style
    // declaration is z-index geometry. Certify the complete bag so consumers
    // do not treat its JSX spread as opaque component paint.
    "ui/primitives/runtime/overlay/layer-stack/index",
    new Map([
      [
        "useOverlayLayer",
        {
          kind: "style",
          ownership: "zeroPaint",
          stylePaths: new Set(["layerProps.style"]),
          nonStylePaths: new Set(["layerProps"]),
          transparentArgs: [],
        },
      ],
    ]),
  ],
  [
    // Portal scoping transports already-resolved `--ds-*` custom properties
    // across a DOM portal. It owns no visual property of its own.
    "ui/primitives/runtime/overlay/portal-theme/index",
    new Map([
      [
        "readDsPortalVariables",
        {
          kind: "style",
          ownership: "zeroPaint",
          stylePaths: new Set([""]),
          transparentArgs: [],
        },
      ],
    ]),
  ],
]);

const certifiedProducerCache = new Map();
const parsedModuleCache = new Map();

function coreSrcRootFor(fileName) {
  if (!isAbsolute(fileName)) return null;
  const marker = `${sep}packages${sep}core${sep}src${sep}`;
  const absolute = resolvePath(fileName);
  const markerIndex = absolute.lastIndexOf(marker);
  return markerIndex < 0
    ? null
    : absolute.slice(0, markerIndex + marker.length - 1);
}

function corePackagePathFor(fileName) {
  const root = coreSrcRootFor(fileName);
  if (!root) return null;
  const packageRelative = relative(root, resolvePath(fileName));
  if (
    packageRelative === "" ||
    packageRelative === ".." ||
    packageRelative.startsWith(`..${sep}`)
  ) {
    return null;
  }
  return stripModuleExtension(packageRelative.replaceAll(sep, "/"));
}

function stripModuleExtension(path) {
  return path.replace(/\.(?:[cm]?[jt]sx?)$/i, "");
}

function resolveSamePackageModule(fileName, specifier) {
  const coreSrcRoot = coreSrcRootFor(fileName);
  if (!coreSrcRoot || typeof specifier !== "string") return null;

  let unresolved;
  if (specifier.startsWith("@/")) {
    unresolved = join(coreSrcRoot, specifier.slice(2));
  } else if (specifier.startsWith(".")) {
    unresolved = resolvePath(dirname(fileName), specifier);
  } else {
    return null;
  }

  const base = stripModuleExtension(unresolved);
  const candidates = [
    unresolved,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    `${base}.jsx`,
    join(base, "index.ts"),
    join(base, "index.tsx"),
    join(base, "index.js"),
    join(base, "index.jsx"),
  ];
  const candidate = candidates.find(
    (path) => existsSync(path) && statSync(path).isFile()
  );
  if (!candidate) return null;

  const canonicalRoot = realpathSync(coreSrcRoot);
  const canonicalFile = realpathSync(candidate);
  const packageRelative = relative(canonicalRoot, canonicalFile);
  if (
    packageRelative === "" ||
    packageRelative === ".." ||
    packageRelative.startsWith(`..${sep}`)
  ) {
    return null;
  }
  return {
    file: canonicalFile,
    packagePath: stripModuleExtension(packageRelative.replaceAll(sep, "/")),
  };
}

function parsedModule(file) {
  if (parsedModuleCache.has(file)) return parsedModuleCache.get(file);
  const sourceFile = parseSource(readFileSync(file, "utf8"), file);
  parsedModuleCache.set(file, sourceFile);
  return sourceFile;
}

function declarationNamed(sourceFile, name) {
  for (const statement of sourceFile.statements) {
    if (
      (ts.isFunctionDeclaration(statement) ||
        ts.isClassDeclaration(statement) ||
        ts.isEnumDeclaration(statement)) &&
      statement.name?.text === name
    ) {
      return statement;
    }
    if (ts.isVariableStatement(statement)) {
      const declaration = statement.declarationList.declarations.find(
        (candidate) =>
          ts.isIdentifier(candidate.name) && candidate.name.text === name
      );
      if (declaration) return declaration;
    }
  }
  return null;
}

/** Follow an exact named re-export so a facade cannot certify a missing symbol. */
function exportedSymbol(file, exportName, seen = new Set()) {
  const identity = `${file}#${exportName}`;
  if (seen.has(identity)) return null;
  const nextSeen = new Set(seen).add(identity);
  const sourceFile = parsedModule(file);

  const direct = declarationNamed(sourceFile, exportName);
  if (
    direct?.parent?.parent?.modifiers?.some(
      (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
    ) ||
    direct?.modifiers?.some(
      (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
    )
  ) {
    return { file, sourceFile, node: direct };
  }

  for (const statement of sourceFile.statements) {
    if (!ts.isExportDeclaration(statement) || !statement.exportClause) continue;
    if (!ts.isNamedExports(statement.exportClause)) continue;
    for (const element of statement.exportClause.elements) {
      if (element.name.text !== exportName) continue;
      const localName = element.propertyName?.text ?? element.name.text;
      if (!statement.moduleSpecifier) {
        const local = declarationNamed(sourceFile, localName);
        return local ? { file, sourceFile, node: local } : null;
      }
      const specifier = staticString(statement.moduleSpecifier);
      const resolved = resolveSamePackageModule(file, specifier);
      return resolved
        ? exportedSymbol(resolved.file, localName, nextSeen)
        : null;
    }
  }
  return null;
}

function returnExpressionsForContract(node) {
  if (!ts.isFunctionLike(node)) return [];
  if (ts.isArrowFunction(node) && !ts.isBlock(node.body)) return [node.body];
  if (!node.body || !ts.isBlock(node.body)) return [];
  const returned = [];
  function visit(candidate) {
    if (candidate !== node.body && ts.isFunctionLike(candidate)) return;
    if (ts.isReturnStatement(candidate)) {
      if (candidate.expression) returned.push(candidate.expression);
      return;
    }
    ts.forEachChild(candidate, visit);
  }
  visit(node.body);
  return returned;
}

function isProvenNonStylePropBag(node) {
  const expression = unwrapExpression(node);
  if (!expression) return false;
  if (
    expression.kind === ts.SyntaxKind.NullKeyword ||
    expression.kind === ts.SyntaxKind.UndefinedKeyword ||
    ts.isVoidExpression(expression)
  ) {
    return true;
  }
  if (ts.isConditionalExpression(expression)) {
    return (
      isProvenNonStylePropBag(expression.whenTrue) &&
      isProvenNonStylePropBag(expression.whenFalse)
    );
  }
  if (!ts.isObjectLiteralExpression(expression)) return false;
  for (const property of expression.properties) {
    if (ts.isSpreadAssignment(property)) return false;
    if (!property.name) return false;
    const name = staticPropertyName(property.name);
    if (name === null || name === "style") return false;
  }
  return true;
}

function returnedExpressionHasPath(node, path) {
  const expression = unwrapExpression(node);
  if (!expression) return false;
  if (ts.isConditionalExpression(expression)) {
    return (
      returnedExpressionHasPath(expression.whenTrue, path) &&
      returnedExpressionHasPath(expression.whenFalse, path)
    );
  }
  if (path.length === 0) return isProvenNonStylePropBag(expression);
  if (!ts.isObjectLiteralExpression(expression)) return false;
  const property = expression.properties.find(
    (candidate) =>
      (ts.isPropertyAssignment(candidate) ||
        ts.isShorthandPropertyAssignment(candidate) ||
        ts.isGetAccessorDeclaration(candidate)) &&
      staticPropertyName(candidate.name) === path[0]
  );
  if (!property) return false;
  if (path.length === 1) return true;
  if (ts.isPropertyAssignment(property)) {
    return returnedExpressionHasPath(property.initializer, path.slice(1));
  }
  return false;
}

function hasNonStylePropBagHazard(node) {
  let hazard = false;
  function visit(candidate) {
    if (hazard) return;
    if (ts.isObjectLiteralExpression(candidate)) {
      for (const property of candidate.properties) {
        if (ts.isSpreadAssignment(property)) {
          hazard = true;
          return;
        }
        if (!property.name) {
          hazard = true;
          return;
        }
        const name = staticPropertyName(property.name);
        if (name === null || name === "style") {
          hazard = true;
          return;
        }
      }
    }
    ts.forEachChild(candidate, visit);
  }
  visit(node);
  return hazard;
}

function paintNamesInContractNode(node) {
  const names = [];
  function visit(candidate) {
    if (
      ts.isPropertyAssignment(candidate) ||
      ts.isShorthandPropertyAssignment(candidate) ||
      ts.isGetAccessorDeclaration(candidate)
    ) {
      const name = staticPropertyName(candidate.name);
      if (name !== null && isPaintProperty(name)) names.push(name);
      else if (name === null && ts.isComputedPropertyName(candidate.name)) {
        // An unresolved key could become paint; represent it as a contract
        // violation rather than blessing it under an allow-list.
        names.push(null);
      }
    }
    ts.forEachChild(candidate, visit);
  }
  visit(node);
  return names;
}

function certifiedProducerContract(entry, fileName) {
  if (!entry?.importSource || !entry.importedName) return null;
  const resolved = resolveSamePackageModule(fileName, entry.importSource);
  if (!resolved) return null;
  const contract = CERTIFIED_INLINE_STYLE_PRODUCERS.get(
    resolved.packagePath
  )?.get(entry.importedName);
  if (!contract) return null;

  const cacheKey = `${resolved.file}#${entry.importedName}#${contract.kind}#${contract.ownership}`;
  if (certifiedProducerCache.has(cacheKey)) {
    return certifiedProducerCache.get(cacheKey) ? contract : null;
  }
  // Mark a recursive validation as failed until it proves itself. This keeps a
  // zero-paint producer that starts delegating to itself from recursing forever.
  certifiedProducerCache.set(cacheKey, false);
  const symbol = exportedSymbol(resolved.file, entry.importedName);
  if (!symbol) return null;

  let valid = true;
  if (contract.kind === "nonStylePropBag") {
    const returned = returnExpressionsForContract(symbol.node);
    valid =
      returned.length > 0 &&
      !hasNonStylePropBagHazard(symbol.node) &&
      [...contract.nonStylePaths].every((path) =>
        returned.every((value) =>
          returnedExpressionHasPath(value, path === "" ? [] : path.split("."))
        )
      );
  } else if (contract.ownership === "zeroPaint") {
    valid =
      countArc09PaintInFile(
        symbol.node.getText(symbol.sourceFile),
        symbol.file
      ) === 0;
  } else if (contract.ownership === "overwritten") {
    const names = paintNamesInContractNode(symbol.node);
    valid =
      names.length === contract.expectedPaintCount &&
      names.every((name) => contract.allowedPaint.has(name));
  }
  certifiedProducerCache.set(cacheKey, valid);
  return valid ? contract : null;
}

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
      const kw = /^interface\s+[A-Za-z_$]/.test(ahead)
        ? "interface"
        : /^type\s+[A-Za-z_$][\w$]*\s*(<[^=<>]*>)?\s*=/.test(ahead)
        ? "type"
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
        if (
          typeBodyDepths.length > 0 &&
          typeBodyDepths[typeBodyDepths.length - 1] === stack.length
        ) {
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
    if (
      topIs("{") &&
      !inTypeBody() &&
      /[A-Za-z]/.test(c) &&
      (i === 0 || !/[A-Za-z0-9_$]/.test(text[i - 1]))
    ) {
      const ahead = text.slice(i, i + 48);
      // An object KEY is preceded by `{` or `,` -- and by nothing else. Without this
      // the `color` in `background: active ? color : x` reads as a second key (the
      // TERNARY's colon looks like a key's colon) and the counter inflates. It is
      // computed from the last MEANINGFUL character, so comments between the comma
      // and the key do not hide the key.
      const atKeyPosition = prevMeaningful === "{" || prevMeaningful === ",";
      const m = atKeyPosition ? ARC09_PAINT_KEY_RE.exec(ahead) : null;
      if (m && !ARC09_PAINT_EXEMPT.has(m[1])) {
        count += 1;
        if (process.env.DEBUG_INLINE_PAINT) {
          const line = text.slice(0, i).split("\n").length;
          console.error(
            `[inline-paint explicit] line ${line} ${m[1]} ${ahead
              .slice(0, 100)
              .replace(/\s+/g, " ")}`
          );
        }
      }
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
  return ARC09_PAINT_KEY_RE.test(camel + ":") && !ARC09_PAINT_EXEMPT.has(camel);
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
      for (const [bindingIndex, element] of name.elements.entries()) {
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
          bindingIndex: ts.isArrayBindingPattern(name) ? bindingIndex : null,
          restBinding: Boolean(element.dotDotDotToken),
          bindingSource,
        });
      }
    }
  }

  function visit(node) {
    if (ts.isVariableDeclaration(node)) {
      const list = ts.isVariableDeclarationList(node.parent)
        ? node.parent
        : null;
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
      let importDeclaration = node.parent;
      while (importDeclaration && !ts.isImportDeclaration(importDeclaration)) {
        importDeclaration = importDeclaration.parent;
      }
      const importSource =
        importDeclaration &&
        ts.isStringLiteralLike(importDeclaration.moduleSpecifier)
          ? importDeclaration.moduleSpecifier.text
          : null;
      const importedName = ts.isImportSpecifier(node)
        ? node.propertyName?.text ?? node.name.text
        : ts.isImportClause(node)
        ? "default"
        : "*";
      add(sourceFile, node.name.text, {
        declaration: node,
        initializer: null,
        type: null,
        importSource,
        importedName,
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
  return (
    kind >= ts.SyntaxKind.FirstAssignment &&
    kind <= ts.SyntaxKind.LastAssignment
  );
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
  const svgPropBagObjects = new Set();
  const directPaintPropBagObjects = new Set();
  const directPaintPropBagBindings = new Set();
  const bindingAssignments = new Map();
  const propertySlotAssignments = new Map();
  const objectAssignCalls = [];
  const allNodes = [];
  const opaqueRoots = new Set();
  const visitedFunctions = new Set();
  const visitedPropertySlots = new Set();

  function assignmentFor(entry, expression) {
    const values = bindingAssignments.get(entry) ?? [];
    values.push(expression);
    bindingAssignments.set(entry, values);
  }

  function propertySlotIdentity(node) {
    let expression = unwrapExpression(node);
    const segments = [];
    while (
      expression &&
      (ts.isPropertyAccessExpression(expression) ||
        ts.isElementAccessExpression(expression))
    ) {
      const access = propertyAccessParts(expression);
      if (!access) return null;
      if (access.name !== null) {
        segments.unshift(`.${access.name}`);
      } else if (
        ts.isElementAccessExpression(expression) &&
        expression.argumentExpression
      ) {
        segments.unshift(
          `[${expression.argumentExpression.getText(sourceFile)}]`
        );
      } else {
        return null;
      }
      expression = unwrapExpression(access.object);
    }
    if (!expression || !ts.isIdentifier(expression)) return null;
    const entry = resolve(expression);
    if (!entry) return null;
    return `${entry.declaration.pos}:${entry.declaration.end}${segments.join(
      ""
    )}`;
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
      } else if (
        left &&
        (ts.isPropertyAccessExpression(left) ||
          ts.isElementAccessExpression(left))
      ) {
        const identity = propertySlotIdentity(left);
        if (identity) {
          const values = propertySlotAssignments.get(identity) ?? [];
          values.push(node.right);
          propertySlotAssignments.set(identity, values);
        }
      }
    }
    if (
      ts.isCallExpression(node) &&
      callName(node) === "assign" &&
      propertyAccessParts(node.expression)?.object.getText(sourceFile) ===
        "Object"
    ) {
      objectAssignCalls.push(node);
    }
    ts.forEachChild(node, collect);
  }
  collect(sourceFile);

  function isConsumerStyleInput(entry, seen = new Set()) {
    if (!entry || seen.has(entry)) return false;
    seen.add(entry);
    const bindingSource = unwrapExpression(entry.bindingSource);
    // Any value received as a parameter is caller-owned, including renamed
    // object-binding properties such as `{ overlayStyle }`.
    if (ts.isParameter(entry.declaration)) return true;
    if (
      entry.fromBindingPattern === true &&
      bindingSource &&
      ts.isIdentifier(bindingSource)
    ) {
      // Rest bags may be peeled more than once (`props -> rest -> htmlProps`).
      // Preserve caller ownership across that chain instead of turning the
      // second destructuring layer into a false opaque local producer.
      return (
        bindingSource.text === "props" ||
        isConsumerStyleInput(resolve(bindingSource), seen)
      );
    }
    return false;
  }

  function isCertifiedProducerEntry(entry, seen = new Set()) {
    if (!entry || seen.has(entry)) return false;
    seen.add(entry);
    const contract = certifiedProducerContract(entry, fileName);
    if (
      contract?.kind === "style" &&
      (contract.ownership !== "overwritten" ||
        isSafeOverwrittenProducerUse(entry, contract))
    ) {
      return true;
    }

    // A rest binding derived from a certified object producer is still owned
    // by that producer (`const { color, ...layout } = importedStyle`). It must
    // not become a fresh opaque consumer site.
    const bindingSource = unwrapExpression(entry.bindingSource);
    if (
      entry.fromBindingPattern &&
      bindingSource &&
      ts.isIdentifier(bindingSource)
    ) {
      return isCertifiedProducerEntry(resolve(bindingSource), seen);
    }
    return false;
  }

  function isCertifiedNonStylePropBagEntry(entry) {
    return (
      certifiedProducerContract(entry, fileName)?.kind === "nonStylePropBag"
    );
  }

  function isCertifiedNonStylePropBagValue(
    node,
    path = [],
    seenEntries = new Set()
  ) {
    const expression = unwrapExpression(node);
    if (!expression) return false;
    if (
      expression.kind === ts.SyntaxKind.NullKeyword ||
      ts.isVoidExpression(expression) ||
      (ts.isIdentifier(expression) &&
        expression.text === "undefined" &&
        !resolve(expression))
    ) {
      return true;
    }
    if (ts.isConditionalExpression(expression)) {
      return (
        isCertifiedNonStylePropBagValue(
          expression.whenTrue,
          path,
          new Set(seenEntries)
        ) &&
        isCertifiedNonStylePropBagValue(
          expression.whenFalse,
          path,
          new Set(seenEntries)
        )
      );
    }
    if (
      ts.isPropertyAccessExpression(expression) ||
      ts.isElementAccessExpression(expression)
    ) {
      const access = propertyAccessParts(expression);
      if (!access?.name) return false;
      return isCertifiedNonStylePropBagValue(
        access.object,
        [access.name, ...path],
        seenEntries
      );
    }
    if (ts.isIdentifier(expression)) {
      const entry = resolve(expression);
      if (!entry || seenEntries.has(entry)) return false;
      const nextSeen = new Set(seenEntries).add(entry);
      const nextPath =
        entry.fromBindingPattern && entry.boundProperty
          ? [entry.boundProperty, ...path]
          : path;
      const sources = [
        entry.bindingSource,
        entry.initializer,
        ...(bindingAssignments.get(entry) ?? []),
      ].filter(Boolean);
      return (
        sources.length > 0 &&
        sources.every((source) =>
          isCertifiedNonStylePropBagValue(source, nextPath, nextSeen)
        )
      );
    }
    if (ts.isCallExpression(expression)) {
      const callable = localCallable(expression);
      const contract = callable?.entry
        ? certifiedProducerContract(callable.entry, fileName)
        : null;
      if (!contract) return false;
      if (contract.kind === "nonStylePropBag") {
        return contract.nonStylePaths.has(path.join("."));
      }
      // A zero-paint style producer may declare sibling non-style paths (e.g.
      // a hook returning { variables, attributes }): its whole source is
      // verified paint-free, so any declared non-style path is safe here too.
      return Boolean(
        contract.kind === "style" &&
          contract.ownership === "zeroPaint" &&
          contract.nonStylePaths?.has(path.join("."))
      );
    }
    return false;
  }

  function isCertifiedStyleProducerValue(
    node,
    path = [],
    seenEntries = new Set()
  ) {
    const expression = unwrapExpression(node);
    if (!expression) return false;
    if (
      expression.kind === ts.SyntaxKind.NullKeyword ||
      ts.isVoidExpression(expression) ||
      (ts.isIdentifier(expression) &&
        expression.text === "undefined" &&
        !resolve(expression))
    ) {
      return true;
    }
    if (ts.isConditionalExpression(expression)) {
      return (
        isCertifiedStyleProducerValue(
          expression.whenTrue,
          path,
          new Set(seenEntries)
        ) &&
        isCertifiedStyleProducerValue(
          expression.whenFalse,
          path,
          new Set(seenEntries)
        )
      );
    }
    if (
      ts.isPropertyAccessExpression(expression) ||
      ts.isElementAccessExpression(expression)
    ) {
      const access = propertyAccessParts(expression);
      if (!access?.name) return false;
      return isCertifiedStyleProducerValue(
        access.object,
        [access.name, ...path],
        seenEntries
      );
    }
    if (ts.isIdentifier(expression)) {
      const entry = resolve(expression);
      if (!entry || seenEntries.has(entry)) return false;
      const nextSeen = new Set(seenEntries).add(entry);
      const nextPath =
        entry.fromBindingPattern && entry.boundProperty
          ? [entry.boundProperty, ...path]
          : path;
      const sources = [
        entry.bindingSource,
        entry.initializer,
        ...(bindingAssignments.get(entry) ?? []),
      ].filter(Boolean);
      return (
        sources.length > 0 &&
        sources.every((source) =>
          isCertifiedStyleProducerValue(source, nextPath, nextSeen)
        )
      );
    }
    if (ts.isCallExpression(expression)) {
      const callable = localCallable(expression);
      const contract = callable?.entry
        ? certifiedProducerContract(callable.entry, fileName)
        : null;
      const paths = contract?.stylePaths ?? new Set([""]);
      return Boolean(
        contract?.kind === "style" &&
          contract.ownership !== "overwritten" &&
          paths.has(path.join("."))
      );
    }
    return false;
  }

  function isReactHookCall(call, hookName) {
    const callee = unwrapExpression(call.expression);
    if (callee && ts.isIdentifier(callee)) {
      const entry = resolve(callee);
      return Boolean(
        entry?.importSource === "react" && entry.importedName === hookName
      );
    }
    const access = propertyAccessParts(callee);
    if (!access || access.name !== hookName) return false;
    const object = unwrapExpression(access.object);
    if (!object || !ts.isIdentifier(object)) return false;
    const entry = resolve(object);
    return Boolean(
      entry?.importSource === "react" && entry.importedName === "*"
    );
  }

  function isReactFactoryCall(call, factoryName) {
    const callee = unwrapExpression(call.expression);
    if (callee && ts.isIdentifier(callee)) {
      const entry = resolve(callee);
      return Boolean(
        entry?.importSource === "react" && entry.importedName === factoryName
      );
    }
    const access = propertyAccessParts(callee);
    if (!access || access.name !== factoryName) return false;
    const object = unwrapExpression(access.object);
    if (!object || !ts.isIdentifier(object)) return false;
    const entry = resolve(object);
    return entry
      ? entry.importSource === "react" &&
          (entry.importedName === "*" || entry.importedName === "default")
      : object.text === "React";
  }

  function staticStringValues(node, seen = new Set()) {
    const expression = unwrapExpression(node);
    if (!expression || seen.has(expression)) return null;
    seen.add(expression);

    if (ts.isStringLiteralLike(expression)) return new Set([expression.text]);
    if (ts.isTemplateExpression(expression)) {
      let values = new Set([expression.head.text]);
      for (const span of expression.templateSpans) {
        const interpolated = staticStringValues(span.expression, new Set(seen));
        if (!interpolated) return null;
        const next = new Set();
        for (const prefix of values) {
          for (const value of interpolated) {
            next.add(`${prefix}${value}${span.literal.text}`);
          }
        }
        values = next;
      }
      return values;
    }
    if (
      ts.isBinaryExpression(expression) &&
      expression.operatorToken.kind === ts.SyntaxKind.PlusToken
    ) {
      const left = staticStringValues(expression.left, new Set(seen));
      const right = staticStringValues(expression.right, new Set(seen));
      if (!left || !right) return null;
      return new Set(
        [...left].flatMap((prefix) =>
          [...right].map((suffix) => `${prefix}${suffix}`)
        )
      );
    }
    if (ts.isConditionalExpression(expression)) {
      const left = staticStringValues(expression.whenTrue, seen);
      const right = staticStringValues(expression.whenFalse, seen);
      if (!left || !right) return null;
      return new Set([...left, ...right]);
    }
    if (ts.isIdentifier(expression)) {
      const entry = resolve(expression);
      if (!entry) return null;
      const sources = [
        entry.initializer,
        ...(bindingAssignments.get(entry) ?? []).filter(
          (value) =>
            value.getStart(sourceFile) < expression.getStart(sourceFile)
        ),
      ].filter(Boolean);
      if (sources.length > 0) {
        const resolved = sources.map((value) =>
          staticStringValues(value, new Set(seen))
        );
        if (resolved.some((value) => value === null)) return null;
        return new Set(resolved.flatMap((value) => [...value]));
      }
      const type = entry.type;
      if (!type) return null;
      const nodes = ts.isUnionTypeNode(type) ? type.types : [type];
      const values = [];
      for (const candidate of nodes) {
        if (
          ts.isLiteralTypeNode(candidate) &&
          ts.isStringLiteralLike(candidate.literal)
        ) {
          values.push(candidate.literal.text);
        } else if (
          candidate.kind !== ts.SyntaxKind.UndefinedKeyword &&
          candidate.kind !== ts.SyntaxKind.NullKeyword
        ) {
          return null;
        }
      }
      return values.length > 0 ? new Set(values) : null;
    }
    if (
      ts.isPropertyAccessExpression(expression) ||
      ts.isElementAccessExpression(expression)
    ) {
      const access = propertyAccessParts(expression);
      if (!access?.name) return null;
      const object = localObjectForExpression(access.object);
      const property = objectLiteralProperty(object, access.name);
      if (property && ts.isPropertyAssignment(property)) {
        return staticStringValues(property.initializer, seen);
      }
      if (property && ts.isShorthandPropertyAssignment(property)) {
        return staticStringValues(property.name, seen);
      }
      if (property && ts.isGetAccessorDeclaration(property)) {
        const returned = functionReturnExpressions(property).map((value) =>
          staticStringValues(value, new Set(seen))
        );
        if (returned.length === 0 || returned.some((value) => value === null)) {
          return null;
        }
        return new Set(returned.flatMap((value) => [...value]));
      }
      return null;
    }
    if (ts.isCallExpression(expression)) {
      const callable = localCallable(expression);
      if (!callable?.fn) return null;
      const returned = functionReturnExpressions(callable.fn).map((value) =>
        staticStringValues(value, new Set(seen))
      );
      if (returned.length === 0 || returned.some((value) => value === null)) {
        return null;
      }
      return new Set(returned.flatMap((value) => [...value]));
    }
    return null;
  }

  function isDefinitelyDataOrAriaProperty(node, seenEntries = new Set()) {
    const expression = unwrapExpression(node);
    if (!expression) return false;
    if (ts.isStringLiteralLike(expression)) {
      return /^(?:data|aria)-/.test(expression.text);
    }
    if (ts.isTemplateExpression(expression)) {
      return /^(?:data|aria)-/.test(expression.head.text);
    }
    if (ts.isIdentifier(expression)) {
      const entry = resolve(expression);
      if (!entry || seenEntries.has(entry) || !entry.initializer) return false;
      return isDefinitelyDataOrAriaProperty(
        entry.initializer,
        new Set(seenEntries).add(entry)
      );
    }
    if (ts.isConditionalExpression(expression)) {
      return (
        isDefinitelyDataOrAriaProperty(expression.whenTrue, seenEntries) &&
        isDefinitelyDataOrAriaProperty(expression.whenFalse, seenEntries)
      );
    }
    return false;
  }

  function countCssTextExpression(node) {
    const values = staticStringValues(node);
    if (!values) return 1;
    let maximum = 0;
    for (const value of values) {
      const count = value
        .split(";")
        .map((declaration) => declaration.trim())
        .filter(Boolean)
        .reduce((total, declaration) => {
          const match = declaration.match(/^(-?[A-Za-z][\w-]*)\s*:/);
          return total + Number(Boolean(match && isPaintProperty(match[1])));
        }, 0);
      maximum = Math.max(maximum, count);
    }
    return maximum;
  }

  /**
   * Resolve productive DOM attribute-writer aliases. Direct member calls,
   * `.bind(...)`, `.call(...)`, `.apply(...)`, Reflect.apply and lexical alias
   * chains all reach the same sink. Leaving those spellings unclassified lets
   * an inline style bypass an exact-zero counter without changing behavior.
   */
  function resolveAttributeWriter(
    node,
    directInvocation = false,
    seen = new Set()
  ) {
    const expression = unwrapExpression(node);
    if (!expression || seen.has(expression)) return null;
    seen.add(expression);

    const access = propertyAccessParts(expression);
    let accessNames = access?.name ? new Set([access.name]) : null;
    if (
      !accessNames &&
      ts.isElementAccessExpression(expression) &&
      expression.argumentExpression
    ) {
      accessNames = staticStringValues(expression.argumentExpression);
    }
    const writerNames = accessNames
      ? [...accessNames].filter((name) =>
          ["setAttribute", "setAttributeNS"].includes(name)
        )
      : [];
    if (writerNames.length > 0) {
      return { method: writerNames[0], bound: directInvocation };
    }

    if (ts.isCallExpression(expression)) {
      const bind = propertyAccessParts(expression.expression);
      if (
        bind?.name === "get" &&
        unwrapExpression(bind.object)?.getText(sourceFile) === "Reflect"
      ) {
        const names = staticStringValues(expression.arguments[1]);
        const methods = names
          ? [...names].filter((name) =>
              ["setAttribute", "setAttributeNS"].includes(name)
            )
          : [];
        return methods.length > 0 ? { method: methods[0], bound: false } : null;
      }
      if (bind?.name === "bind") {
        const writer = resolveAttributeWriter(bind.object, false, seen);
        return writer ? { ...writer, bound: true } : null;
      }
      return null;
    }

    if (!ts.isIdentifier(expression)) return null;
    const entry = resolve(expression);
    if (!entry || seen.has(entry)) return null;
    seen.add(entry);
    if (
      entry.fromBindingPattern &&
      ["setAttribute", "setAttributeNS"].includes(entry.boundProperty)
    ) {
      return { method: entry.boundProperty, bound: false };
    }
    const sources = [
      entry.initializer,
      ...(bindingAssignments.get(entry) ?? []),
    ].filter(Boolean);
    if (sources.length !== 1) return null;
    return resolveAttributeWriter(sources[0], false, seen);
  }

  function staticApplyArguments(node, seen = new Set()) {
    const expression = unwrapExpression(node);
    if (!expression || seen.has(expression)) return null;
    seen.add(expression);
    if (ts.isArrayLiteralExpression(expression)) {
      const args = [];
      for (const element of expression.elements) {
        if (ts.isOmittedExpression(element)) return null;
        if (ts.isSpreadElement(element)) {
          const nested = staticApplyArguments(
            element.expression,
            new Set(seen)
          );
          if (!nested) return null;
          args.push(...nested);
        } else {
          args.push(element);
        }
      }
      return args;
    }
    if (ts.isIdentifier(expression)) {
      const entry = resolve(expression);
      if (!entry || seen.has(entry)) return null;
      seen.add(entry);
      const sources = [
        entry.initializer,
        ...(bindingAssignments.get(entry) ?? []),
      ].filter(Boolean);
      return sources.length === 1
        ? staticApplyArguments(sources[0], seen)
        : null;
    }
    return null;
  }

  function normalizedAttributeWriterCall(node) {
    const callee = unwrapExpression(node.expression);
    const access = propertyAccessParts(callee);

    if (
      access?.name === "apply" &&
      unwrapExpression(access.object)?.getText(sourceFile) === "Reflect"
    ) {
      const writer = resolveAttributeWriter(node.arguments[0]);
      if (!writer) return null;
      const args = staticApplyArguments(node.arguments[2]);
      return { writer, args, opaqueArgs: args === null };
    }

    if (access && ["call", "apply"].includes(access.name)) {
      const writer = resolveAttributeWriter(access.object);
      if (!writer) return null;
      if (access.name === "call") {
        return {
          writer,
          args: [...node.arguments].slice(1),
          opaqueArgs: false,
        };
      }
      const args = staticApplyArguments(node.arguments[1]);
      return { writer, args, opaqueArgs: args === null };
    }

    const writer = resolveAttributeWriter(callee, true);
    return writer?.bound
      ? { writer, args: [...node.arguments], opaqueArgs: false }
      : null;
  }

  function createElementTargetKind(node) {
    const values = staticStringValues(node);
    if (values) {
      return [...values].some((value) => SVG_CREATE_ELEMENT_TAGS.has(value))
        ? "svg"
        : "html";
    }
    const expression = unwrapExpression(node);
    if (!expression) return "unknown";
    if (ts.isConditionalExpression(expression)) {
      const branches = [
        createElementTargetKind(expression.whenTrue),
        createElementTargetKind(expression.whenFalse),
      ];
      if (branches.every((kind) => kind === "component")) return "component";
      if (branches.every((kind) => kind === "html")) return "html";
      if (branches.some((kind) => kind === "svg")) return "svg";
      return "unknown";
    }
    // React's uppercase convention is the only non-literal proof available
    // without a type-checker that a value denotes a component rather than an
    // intrinsic tag. Everything else may resolve to SVG and fails closed.
    if (ts.isIdentifier(expression) && /^[A-Z]/.test(expression.text)) {
      return "component";
    }
    const access = propertyAccessParts(expression);
    if (access) {
      let root = unwrapExpression(access.object);
      while (
        root &&
        (ts.isPropertyAccessExpression(root) ||
          ts.isElementAccessExpression(root))
      ) {
        root = unwrapExpression(propertyAccessParts(root)?.object);
      }
      if (root && ts.isIdentifier(root) && /^[A-Z]/.test(root.text)) {
        return "component";
      }
    }
    return "unknown";
  }

  function jsxSpreadMode(node) {
    const owner = node.parent?.parent;
    if (
      !owner ||
      (!ts.isJsxOpeningElement(owner) && !ts.isJsxSelfClosingElement(owner))
    ) {
      return null;
    }
    const tag = owner.tagName.getText(sourceFile);
    if (/^[A-Z]/.test(tag)) return null;
    if (tag.includes(":")) return "svgPropBag";
    if (!SVG_CREATE_ELEMENT_TAGS.has(tag)) return "propBag";
    if (tag !== "a") return "svgPropBag";

    // `<a>` exists in both HTML and SVG. It is an SVG prop bag only under an
    // actual `<svg>` ancestor; otherwise top-level `fill`/`stroke` are ordinary
    // DOM props and not inline style.
    let current = owner.parent;
    while (current) {
      if (
        (ts.isJsxElement(current) || ts.isJsxSelfClosingElement(current)) &&
        (ts.isJsxElement(current)
          ? current.openingElement.tagName.getText(sourceFile)
          : current.tagName.getText(sourceFile)) === "svg"
      ) {
        return "svgPropBag";
      }
      current = current.parent;
    }
    return "propBag";
  }

  function objectLiteralProperty(object, name) {
    if (!object || !ts.isObjectLiteralExpression(object)) return null;
    for (const property of object.properties) {
      if (
        (ts.isPropertyAssignment(property) ||
          ts.isShorthandPropertyAssignment(property) ||
          ts.isMethodDeclaration(property) ||
          ts.isGetAccessorDeclaration(property)) &&
        staticPropertyName(property.name) === name
      ) {
        return property;
      }
    }
    return null;
  }

  function localObjectForExpression(node) {
    const expression = unwrapExpression(node);
    if (expression && ts.isObjectLiteralExpression(expression))
      return expression;
    if (!expression || !ts.isIdentifier(expression)) return null;
    const entry = resolve(expression);
    const initializer = unwrapExpression(entry?.initializer);
    return initializer && ts.isObjectLiteralExpression(initializer)
      ? initializer
      : null;
  }

  function isConsumerPropertyAccess(node) {
    const access = propertyAccessParts(node);
    if (!access) return false;

    function isConsumerExpression(expressionNode, seen = new Set()) {
      const expression = unwrapExpression(expressionNode);
      if (!expression) return false;
      if (ts.isConditionalExpression(expression)) {
        return (
          isConsumerExpression(expression.whenTrue, new Set(seen)) &&
          isConsumerExpression(expression.whenFalse, new Set(seen))
        );
      }
      if (
        ts.isPropertyAccessExpression(expression) ||
        ts.isElementAccessExpression(expression)
      ) {
        return isConsumerExpression(
          propertyAccessParts(expression)?.object,
          seen
        );
      }
      if (!ts.isIdentifier(expression)) return false;
      const entry = resolve(expression);
      if (!entry || seen.has(entry)) return false;
      seen.add(entry);
      if (isConsumerStyleInput(entry)) return true;
      if (
        entry.bindingSource &&
        isConsumerExpression(entry.bindingSource, seen)
      ) {
        return true;
      }
      return Boolean(
        entry.initializer && isConsumerExpression(entry.initializer, seen)
      );
    }

    return isConsumerExpression(access.object);
  }

  function isCertifiedProducerPropertyAccess(node) {
    let expression = unwrapExpression(node);
    while (
      expression &&
      (ts.isPropertyAccessExpression(expression) ||
        ts.isElementAccessExpression(expression))
    ) {
      expression = unwrapExpression(propertyAccessParts(expression)?.object);
    }
    if (!expression || !ts.isIdentifier(expression)) return false;
    return isCertifiedProducerEntry(resolve(expression));
  }

  function isContractedProducerPropertyAccess(node) {
    let expression = unwrapExpression(node);
    while (
      expression &&
      (ts.isPropertyAccessExpression(expression) ||
        ts.isElementAccessExpression(expression))
    ) {
      expression = unwrapExpression(propertyAccessParts(expression)?.object);
    }
    if (!expression || !ts.isIdentifier(expression)) return false;
    return (
      certifiedProducerContract(resolve(expression), fileName)?.kind === "style"
    );
  }

  function isSafeOverwrittenProducerUse(entry, contract) {
    const required = contract.consumers?.get(corePackagePathFor(fileName));
    if (!required) return false;

    function containsReference(node, candidates) {
      let found = false;
      function visit(candidate) {
        if (found) return;
        if (ts.isIdentifier(candidate) && candidates.has(resolve(candidate))) {
          found = true;
          return;
        }
        ts.forEachChild(candidate, visit);
      }
      visit(node);
      return found;
    }

    function isAliasExpression(node, candidates) {
      const expression = unwrapExpression(node);
      if (!expression) return false;
      if (ts.isIdentifier(expression))
        return candidates.has(resolve(expression));
      if (
        ts.isPropertyAccessExpression(expression) ||
        ts.isElementAccessExpression(expression)
      ) {
        return isAliasExpression(
          propertyAccessParts(expression)?.object,
          candidates
        );
      }
      if (ts.isConditionalExpression(expression)) {
        return (
          isAliasExpression(expression.whenTrue, candidates) &&
          isAliasExpression(expression.whenFalse, candidates)
        );
      }
      if (ts.isBinaryExpression(expression)) {
        if (expression.operatorToken.kind === ts.SyntaxKind.CommaToken) {
          return isAliasExpression(expression.right, candidates);
        }
        if (
          expression.operatorToken.kind === ts.SyntaxKind.BarBarToken ||
          expression.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken
        ) {
          return (
            isAliasExpression(expression.left, candidates) &&
            isAliasExpression(expression.right, candidates)
          );
        }
      }
      return false;
    }

    const derived = new Set();
    let changed = true;
    while (changed) {
      changed = false;
      const candidates = new Set([entry, ...derived]);
      for (const candidate of entries) {
        if (
          candidate.initializer &&
          !derived.has(candidate) &&
          containsReference(candidate.initializer, candidates) &&
          isAliasExpression(candidate.initializer, candidates)
        ) {
          derived.add(candidate);
          changed = true;
        }
      }
    }
    if (derived.size === 0) return false;

    const inside = (node, ancestor) =>
      Boolean(ancestor && node.pos >= ancestor.pos && node.end <= ancestor.end);

    function safeSpreadForReference(identifier) {
      let current = identifier.parent;
      while (current && !ts.isSpreadAssignment(current)) {
        if (ts.isObjectLiteralExpression(current) || ts.isStatement(current)) {
          return false;
        }
        current = current.parent;
      }
      if (!current || !ts.isObjectLiteralExpression(current.parent))
        return false;
      const properties = current.parent.properties;
      const spreadIndex = properties.indexOf(current);
      if (spreadIndex < 0) return false;
      const laterNames = new Set(
        properties.slice(spreadIndex + 1).flatMap((property) => {
          if (
            ts.isPropertyAssignment(property) ||
            ts.isShorthandPropertyAssignment(property) ||
            ts.isGetAccessorDeclaration(property)
          ) {
            const name = staticPropertyName(property.name);
            return name === null ? [] : [name];
          }
          return [];
        })
      );
      return [...required].every((name) => laterNames.has(name));
    }

    let safeSpreadCount = 0;
    const relevant = new Set([entry, ...derived]);
    for (const node of allNodes) {
      if (!ts.isIdentifier(node)) continue;
      const resolved = resolve(node);
      if (!relevant.has(resolved)) continue;
      if (inside(node, resolved.declaration)) continue;
      if (
        [...derived].some(
          (candidate) =>
            candidate !== resolved && inside(node, candidate.initializer)
        )
      ) {
        continue;
      }
      if (safeSpreadForReference(node)) {
        safeSpreadCount += 1;
        continue;
      }
      return false;
    }
    return safeSpreadCount > 0;
  }

  function recordOpaque(node, mode, entry = null) {
    if (entry && isConsumerStyleInput(entry)) return;
    const identity = entry
      ? `${entry.declaration.pos}:${entry.declaration.end}`
      : `${node.getText(sourceFile)}:${nearestScope(node)?.pos ?? 0}`;
    opaqueRoots.add(`${mode}:${identity}`);
    if (process.env.DEBUG_INLINE_PAINT) {
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
      console.error(
        `[inline-paint opaque] ${fileName}:${line + 1}:${character + 1} ${mode} ${node
          .getText(sourceFile)
          .slice(0, 160)
          .replace(/\s+/g, " ")}`
      );
    }
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

  function callableFromExpression(node) {
    const candidate = unwrapExpression(node);
    if (!candidate) return null;
    if (ts.isFunctionLike(candidate)) return candidate;
    if (
      ts.isCallExpression(candidate) &&
      (isReactHookCall(candidate, "useMemo") ||
        isReactHookCall(candidate, "useCallback"))
    ) {
      const factory = unwrapExpression(candidate.arguments[0]);
      return factory && ts.isFunctionLike(factory) ? factory : null;
    }
    return null;
  }

  function localCallable(call) {
    const callee = unwrapExpression(call.expression);
    if (!callee) return null;
    if (ts.isIdentifier(callee)) {
      const entry = resolve(callee);
      if (!entry) return null;
      const fn =
        callableFromExpression(entry.initializer) ??
        callableFromExpression(entry.declaration);
      return { entry, fn };
    }

    const access = propertyAccessParts(callee);
    if (!access?.name) return null;
    const object = localObjectForExpression(access.object);
    const property = objectLiteralProperty(object, access.name);
    if (!property) return null;
    const candidate = ts.isPropertyAssignment(property)
      ? property.initializer
      : property;
    return { entry: null, fn: callableFromExpression(candidate) };
  }

  function reactStateSources(entry) {
    if (
      !entry?.fromBindingPattern ||
      entry.bindingIndex !== 0 ||
      !ts.isCallExpression(unwrapExpression(entry.bindingSource))
    ) {
      return null;
    }
    const stateCall = unwrapExpression(entry.bindingSource);
    if (!isReactHookCall(stateCall, "useState")) return null;

    const sources = [];
    if (stateCall.arguments[0]) sources.push(stateCall.arguments[0]);
    for (const node of allNodes) {
      if (!ts.isCallExpression(node)) continue;
      const callee = unwrapExpression(node.expression);
      if (!callee || !ts.isIdentifier(callee)) continue;
      const setter = resolve(callee);
      if (
        setter?.declaration === entry.declaration &&
        setter.bindingIndex === 1 &&
        node.arguments[0]
      ) {
        sources.push(node.arguments[0]);
      }
    }
    return sources;
  }

  function functionReturnExpressions(fn) {
    if (ts.isArrowFunction(fn) && !ts.isBlock(fn.body)) return [fn.body];
    const body = fn.body;
    if (!body || !ts.isBlock(body)) return [];
    const expressions = [];
    function visitReturns(node) {
      if (node !== body && ts.isFunctionLike(node)) return;
      if (ts.isReturnStatement(node)) {
        if (node.expression) expressions.push(node.expression);
        return;
      }
      ts.forEachChild(node, visitReturns);
    }
    visitReturns(body);
    return expressions;
  }

  function localValues(node, seenNodes = new Set(), seenEntries = new Set()) {
    const expression = unwrapExpression(node);
    if (!expression) return { proven: true, values: [] };
    if (seenNodes.has(expression)) return { proven: false, values: [] };
    const nextNodes = new Set(seenNodes).add(expression);

    if (
      expression.kind === ts.SyntaxKind.NullKeyword ||
      ts.isVoidExpression(expression)
    ) {
      return { proven: true, values: [] };
    }
    if (
      ts.isObjectLiteralExpression(expression) ||
      ts.isArrayLiteralExpression(expression) ||
      ts.isFunctionLike(expression)
    ) {
      return { proven: true, values: [expression] };
    }
    if (ts.isIdentifier(expression)) {
      const entry = resolve(expression);
      if (!entry) {
        return {
          proven: expression.text === "undefined",
          values: [],
        };
      }
      if (seenEntries.has(entry)) return { proven: false, values: [] };
      const nextEntries = new Set(seenEntries).add(entry);
      let sources = [
        entry.initializer,
        ...(bindingAssignments.get(entry) ?? []),
      ].filter(Boolean);
      if (sources.length === 0) sources = reactStateSources(entry) ?? [];
      if (sources.length === 0) return { proven: false, values: [] };
      return mergeLocalValues(
        sources.map((source) => localValues(source, nextNodes, nextEntries))
      );
    }
    if (ts.isConditionalExpression(expression)) {
      return mergeLocalValues([
        localValues(expression.whenTrue, nextNodes, seenEntries),
        localValues(expression.whenFalse, nextNodes, seenEntries),
      ]);
    }
    if (ts.isBinaryExpression(expression)) {
      if (
        expression.operatorToken.kind === ts.SyntaxKind.CommaToken ||
        expression.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken
      ) {
        return localValues(expression.right, nextNodes, seenEntries);
      }
      if (
        expression.operatorToken.kind === ts.SyntaxKind.BarBarToken ||
        expression.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken
      ) {
        return mergeLocalValues([
          localValues(expression.left, nextNodes, seenEntries),
          localValues(expression.right, nextNodes, seenEntries),
        ]);
      }
    }
    if (ts.isCallExpression(expression)) {
      if (
        (isReactHookCall(expression, "useMemo") ||
          isReactHookCall(expression, "useCallback")) &&
        expression.arguments[0]
      ) {
        const factory = callableFromExpression(expression.arguments[0]);
        return factory
          ? mergeLocalValues(
              functionReturnExpressions(factory).map((value) =>
                localValues(value, nextNodes, seenEntries)
              )
            )
          : { proven: false, values: [] };
      }
      const callable = localCallable(expression);
      if (!callable?.fn) return { proven: false, values: [] };
      return mergeLocalValues(
        functionReturnExpressions(callable.fn).map((value) =>
          localValues(value, nextNodes, seenEntries)
        )
      );
    }
    if (
      ts.isPropertyAccessExpression(expression) ||
      ts.isElementAccessExpression(expression)
    ) {
      const access = propertyAccessParts(expression);
      const base = localValues(access.object, nextNodes, seenEntries);
      if (!base.proven) return base;

      let names = access.name === null ? null : new Set([access.name]);
      if (
        names === null &&
        ts.isElementAccessExpression(expression) &&
        expression.argumentExpression
      ) {
        names = staticStringValues(expression.argumentExpression);
        const argument = unwrapExpression(expression.argumentExpression);
        if (argument && ts.isNumericLiteral(argument)) {
          names = new Set([argument.text]);
        }
      }

      const results = [];
      for (const value of base.values) {
        const candidate = unwrapExpression(value);
        if (candidate && ts.isObjectLiteralExpression(candidate)) {
          // A spread can supply/overwrite any requested key. Proving its exact
          // merge semantics belongs to a future value lattice; until then the
          // access remains unknown instead of silently losing nested shorthand.
          if (candidate.properties.some(ts.isSpreadAssignment)) {
            return { proven: false, values: [] };
          }
          const candidates = candidate.properties.filter(
            (property) =>
              ts.isPropertyAssignment(property) ||
              ts.isShorthandPropertyAssignment(property) ||
              ts.isMethodDeclaration(property) ||
              ts.isGetAccessorDeclaration(property)
          );
          const namedCandidates = candidates.map((property) => {
            const staticName = staticPropertyName(property.name);
            const propertyNames =
              staticName !== null
                ? new Set([staticName])
                : ts.isComputedPropertyName(property.name)
                ? staticStringValues(property.name.expression)
                : null;
            return { property, propertyNames };
          });
          if (
            namedCandidates.some(({ propertyNames }) => propertyNames === null)
          ) {
            return { proven: false, values: [] };
          }
          const properties = names
            ? namedCandidates
                .filter(({ propertyNames }) =>
                  [...propertyNames].some((name) => names.has(name))
                )
                .map(({ property }) => property)
            : candidates;
          for (const property of properties) {
            if (ts.isPropertyAssignment(property)) {
              results.push(
                localValues(property.initializer, nextNodes, seenEntries)
              );
            } else if (ts.isShorthandPropertyAssignment(property)) {
              results.push(localValues(property.name, nextNodes, seenEntries));
            } else if (ts.isGetAccessorDeclaration(property)) {
              results.push(
                mergeLocalValues(
                  functionReturnExpressions(property).map((returned) =>
                    localValues(returned, nextNodes, seenEntries)
                  )
                )
              );
            } else {
              results.push({ proven: true, values: [property] });
            }
          }
          continue;
        }
        if (candidate && ts.isArrayLiteralExpression(candidate)) {
          if (candidate.elements.some(ts.isSpreadElement)) {
            return { proven: false, values: [] };
          }
          const elements = names
            ? [...names]
                .map((name) => Number(name))
                .filter(
                  (index) =>
                    Number.isInteger(index) &&
                    index >= 0 &&
                    index < candidate.elements.length
                )
                .map((index) => candidate.elements[index])
            : candidate.elements.filter(
                (element) => !ts.isSpreadElement(element)
              );
          for (const element of elements) {
            results.push(localValues(element, nextNodes, seenEntries));
          }
          continue;
        }
        return { proven: false, values: [] };
      }
      return mergeLocalValues(results);
    }
    return { proven: false, values: [] };
  }

  function mergeLocalValues(results) {
    if (results.some((result) => !result.proven)) {
      return { proven: false, values: [] };
    }
    return {
      proven: true,
      values: results.flatMap((result) => result.values),
    };
  }

  function markLocalObjectAccess(expression, mode) {
    const resolved = localValues(expression);
    if (!resolved.proven) return false;
    for (const value of resolved.values) markExpression(value, mode);
    return true;
  }

  function markExpression(node, mode) {
    if (!node) return;
    const expression = unwrapExpression(node);
    if (!expression) return;

    if (
      expression.kind === ts.SyntaxKind.NullKeyword ||
      ts.isVoidExpression(expression)
    ) {
      return;
    }

    if (mode !== "style" && isCertifiedNonStylePropBagValue(expression)) {
      return;
    }

    if (ts.isIdentifier(expression)) {
      const entry = resolve(expression);
      if (!entry) {
        // The global `undefined` sentinel contributes no style. A shadowed
        // binding with the same spelling still resolves above and is analyzed.
        if (expression.text === "undefined") return;
        recordOpaque(expression, mode);
        return;
      }
      const target = mode === "style" ? styleBindings : propBagBindings;
      const directPaintMode = mode === "clonePropBag" || mode === "svgPropBag";
      const needsDirectUpgrade =
        directPaintMode && !directPaintPropBagBindings.has(entry);
      if (target.has(entry) && !needsDirectUpgrade) {
        if (
          !entry.initializer &&
          !isCertifiedProducerEntry(entry) &&
          (ts.isImportClause(entry.declaration) ||
            ts.isImportSpecifier(entry.declaration) ||
            ts.isNamespaceImport(entry.declaration))
        ) {
          recordOpaque(expression, mode, entry);
        }
        return;
      }
      target.add(entry);
      if (directPaintMode) directPaintPropBagBindings.add(entry);
      const assigned = bindingAssignments.get(entry) ?? [];
      if (entry.initializer) markExpression(entry.initializer, mode);
      else if (assigned.length === 0) {
        const stateSources = reactStateSources(entry);
        if (stateSources) {
          for (const source of stateSources) markExpression(source, mode);
        } else if (!isCertifiedProducerEntry(entry)) {
          recordOpaque(expression, mode, entry);
        }
      }
      for (const value of assigned) {
        markExpression(value, mode);
      }
      return;
    }

    if (ts.isObjectLiteralExpression(expression)) {
      const target = mode === "style" ? styleObjects : propBagObjects;
      const directPaintMode = mode === "clonePropBag" || mode === "svgPropBag";
      const needsDirectUpgrade =
        directPaintMode && !directPaintPropBagObjects.has(expression);
      if (target.has(expression) && !needsDirectUpgrade) return;
      target.add(expression);
      if (mode === "svgPropBag") svgPropBagObjects.add(expression);
      if (directPaintMode) directPaintPropBagObjects.add(expression);
      for (const property of expression.properties) {
        if (ts.isSpreadAssignment(property)) {
          markExpression(property.expression, mode);
        } else if (
          ts.isPropertyAssignment(property) &&
          staticPropertyName(property.name) === "style"
        ) {
          markExpression(property.initializer, "style");
        } else if (
          ts.isShorthandPropertyAssignment(property) &&
          property.name.text === "style"
        ) {
          markExpression(property.name, "style");
        } else if (
          ts.isGetAccessorDeclaration(property) &&
          staticPropertyName(property.name) === "style"
        ) {
          markFunction(property, "style");
        }
      }
      return;
    }

    if (ts.isFunctionLike(expression)) {
      markFunction(expression, mode);
      return;
    }

    if (
      ts.isPropertyAccessExpression(expression) ||
      ts.isElementAccessExpression(expression)
    ) {
      const slotIdentity = propertySlotIdentity(expression);
      const visitIdentity = slotIdentity ? `${mode}:${slotIdentity}` : null;
      if (slotIdentity && !visitedPropertySlots.has(visitIdentity)) {
        visitedPropertySlots.add(visitIdentity);
        for (const value of propertySlotAssignments.get(slotIdentity) ?? []) {
          markExpression(value, mode);
        }
      }
      if (isCertifiedStyleProducerValue(expression)) return;
      if (isConsumerPropertyAccess(expression)) return;
      if (isCertifiedProducerPropertyAccess(expression)) return;
      if (!markLocalObjectAccess(expression, mode)) {
        recordOpaque(expression, mode);
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
        expression.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken
      ) {
        // The left side is the boolean guard, not a style source.
        markExpression(expression.right, mode);
      } else if (
        expression.operatorToken.kind === ts.SyntaxKind.BarBarToken ||
        expression.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken
      ) {
        markExpression(expression.left, mode);
        markExpression(expression.right, mode);
      }
      return;
    }

    if (ts.isCallExpression(expression)) {
      // A callback supplied through caller-owned props (for example
      // `column.onCell(...)`) returns a caller-owned DOM bag just like a direct
      // `onRow(...)` parameter. Do not turn the member-call spelling into a
      // source-authored opaque bag.
      if (isConsumerPropertyAccess(expression.expression)) return;
      if (
        (isReactHookCall(expression, "useMemo") ||
          isReactHookCall(expression, "useCallback")) &&
        expression.arguments[0]
      ) {
        const factory = callableFromExpression(expression.arguments[0]);
        if (factory) markFunction(factory, mode);
        else recordOpaque(expression.arguments[0], mode);
        return;
      }
      const callable = localCallable(expression);
      if (callable?.fn) {
        markFunction(callable.fn, mode);
        return;
      }
      const contract = callable?.entry
        ? certifiedProducerContract(callable.entry, fileName)
        : null;
      if (
        contract?.kind === "style" &&
        isCertifiedProducerEntry(callable.entry)
      ) {
        for (const transparent of contract.transparentArgs ?? []) {
          if (expression.arguments[transparent.index]) {
            markExpression(
              expression.arguments[transparent.index],
              transparent.mode
            );
          }
        }
        return;
      }
      if (
        contract?.kind === "nonStylePropBag" &&
        isCertifiedNonStylePropBagEntry(callable.entry)
      ) {
        return;
      }
      if (!isCertifiedProducerEntry(callable?.entry)) {
        recordOpaque(expression.expression, mode, callable?.entry ?? null);
      }
      return;
    }

    // Any unhandled value that can execute or manufacture an object remains an
    // opaque style source. In particular, `new StyleBag()` and
    // `await getStyle()` must never silently certify a zero.
    if (
      ts.isNewExpression(expression) ||
      ts.isAwaitExpression(expression) ||
      ts.isTaggedTemplateExpression(expression) ||
      ts.isYieldExpression(expression)
    ) {
      recordOpaque(expression, mode);
    }
  }

  // A style-like name is evidence only when it directly initializes an object
  // builder. Strings named `inlineStyle` and DOM stylesheet roots belong to
  // other channels. All non-literal builders must be proven by a CSS type,
  // assertion or an actual style/prop-bag sink.
  for (const entry of entries) {
    const initializer = unwrapExpression(entry.initializer);
    if (entry.fromBindingPattern && entry.boundProperty === "style") {
      styleBindings.add(entry);
      continue;
    }
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
    } else if (ts.isJsxSpreadAttribute(node)) {
      const mode = jsxSpreadMode(node);
      if (mode) markExpression(node.expression, mode);
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
      if (isReactFactoryCall(node, "cloneElement")) {
        markExpression(node.arguments[1], "clonePropBag");
      } else if (isReactFactoryCall(node, "createElement")) {
        const targetKind = createElementTargetKind(node.arguments[0]);
        if (targetKind !== "component") {
          // Unknown factories may resolve to an SVG intrinsic; a direct paint
          // shorthand must therefore fail closed. Known HTML bags still expose
          // nested/shorthand `style`, but not top-level DOM props such as color.
          markExpression(
            node.arguments[1],
            targetKind === "html" ? "propBag" : "svgPropBag"
          );
        }
      } else if (
        name === "defineProperties" &&
        propertyAccessParts(node.expression)?.object.getText(sourceFile) ===
          "Object" &&
        isQualifiedStyleTarget(node.arguments[0])
      ) {
        markExpression(node.arguments[1], "style");
      }
    }
  }

  // Sources merged into a proven style/prop bag are themselves style data.
  // Iterate because an Object.assign source can alias another assigned target.
  let changed = true;
  while (changed) {
    const before =
      styleBindings.size +
      propBagBindings.size +
      styleObjects.size +
      propBagObjects.size;
    for (const call of objectAssignCalls) {
      const [target, ...sources] = call.arguments;
      if (isQualifiedStyleTarget(target)) {
        for (const source of sources) markExpression(source, "style");
      } else {
        const unwrapped = unwrapExpression(target);
        const entry =
          unwrapped && ts.isIdentifier(unwrapped) ? resolve(unwrapped) : null;
        if (entry && propBagBindings.has(entry)) {
          for (const source of sources) markExpression(source, "propBag");
        }
      }
    }
    // Forward aliases need the reverse edge too: `cardStyle` can be proven by
    // its name/type before `alias.color = …` is encountered.
    for (const entry of entries) {
      const sources = [
        entry.initializer,
        ...(bindingAssignments.get(entry) ?? []),
      ].filter(Boolean);
      if (
        !styleBindings.has(entry) &&
        sources.some((source) => isStyleExpression(source))
      ) {
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
          return Boolean(
            expression &&
              ts.isObjectLiteralExpression(expression) &&
              propBagObjects.has(expression)
          );
        });
        if (propBagSource) {
          propBagBindings.add(entry);
          for (const source of sources) markExpression(source, "propBag");
        }
      }
    }
    const after =
      styleBindings.size +
      propBagBindings.size +
      styleObjects.size +
      propBagObjects.size;
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

  function isDirectPaintObject(node) {
    return styleObjects.has(node) || directPaintPropBagObjects.has(node);
  }

  function isQualifiedStyleTarget(node) {
    if (isStyleExpression(node)) return true;
    // Caller-owned bags remain exempt when merely forwarded, but paint
    // written into one by the component is component-authored mutation.
    if (isConsumerPropertyAccess(node)) return true;
    // A certified imported producer is safe to READ without re-counting its
    // defining paint, but a write through that producer is new authored paint
    // in the consumer and must never inherit the read exemption.
    if (isContractedProducerPropertyAccess(node)) return true;
    const resolved = localValues(node);
    return (
      resolved.proven &&
      resolved.values.some((value) => {
        const expression = unwrapExpression(value);
        return Boolean(expression && isQualifiedObject(expression));
      })
    );
  }

  function writeProperty(left, value = null) {
    const access = propertyAccessParts(left);
    if (!access || !isQualifiedStyleTarget(access.object)) return 0;
    if (access.name === "cssText") return countCssTextExpression(value);
    // A computed name on a proven style object fails closed. A known non-paint
    // property (width, opacity, animation, etc.) remains outside this channel.
    const result =
      access.name === null ? 1 : Number(isPaintProperty(access.name));
    if (result > 0 && process.env.DEBUG_INLINE_PAINT) {
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(
        left.getStart(sourceFile)
      );
      console.error(
        `[inline-paint write] ${fileName}:${line + 1}:${character + 1} ${
          access.name ?? "<computed>"
        }`
      );
    }
    return result;
  }

  let count = 0;
  for (const node of allNodes) {
    if (ts.isShorthandPropertyAssignment(node)) {
      const object = node.parent;
      if (isDirectPaintObject(object) && isPaintProperty(node.name.text)) {
        count += 1;
      }
      continue;
    }

    if (ts.isGetAccessorDeclaration(node) && isQualifiedObject(node.parent)) {
      const name = staticPropertyName(node.name);
      if (name !== null) {
        count += Number(
          isDirectPaintObject(node.parent) && isPaintProperty(name)
        );
      } else if (ts.isComputedPropertyName(node.name)) {
        const values = staticStringValues(node.name.expression);
        count += values
          ? Number([...values].some(isPaintProperty))
          : Number(!isDefinitelyDataOrAriaProperty(node.name.expression));
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
        else if (ts.isComputedPropertyName(node.name)) {
          const values = staticStringValues(node.name.expression);
          if (values) {
            count += Number([...values].some(isPaintProperty));
          } else if (isQualifiedObject(node.parent)) {
            count += Number(
              !isDefinitelyDataOrAriaProperty(node.name.expression)
            );
          }
        } else if (isQualifiedObject(node.parent)) count += 1;
      }
      continue;
    }

    if (
      ts.isBinaryExpression(node) &&
      isAssignmentOperator(node.operatorToken.kind)
    ) {
      count += writeProperty(node.left, node.right);
      continue;
    }

    if (!ts.isCallExpression(node)) continue;
    const name = callName(node);
    const callee = propertyAccessParts(node.expression);
    const attributeWriter = normalizedAttributeWriterCall(node);
    if (attributeWriter) {
      if (!attributeWriter.args) {
        count += 1;
      } else {
        const attributeIndex =
          attributeWriter.writer.method === "setAttributeNS" ? 1 : 0;
        const valueIndex = attributeIndex + 1;
        const attributes = staticStringValues(
          attributeWriter.args[attributeIndex]
        );
        if (
          attributes &&
          [...attributes].some(
            (attribute) => attribute.toLowerCase() === "style"
          )
        ) {
          count += countCssTextExpression(attributeWriter.args[valueIndex]);
        } else if (attributes === null && attributeWriter.opaqueArgs) {
          count += 1;
        }
      }
    } else if (
      name === "setProperty" &&
      callee &&
      isQualifiedStyleTarget(callee.object)
    ) {
      if (node.arguments.length === 0) count += 1;
      else {
        const property = staticString(node.arguments[0]);
        count += property === null ? 1 : Number(isPaintProperty(property));
      }
    } else if (
      name === "set" &&
      propertyAccessParts(callee?.object)?.name === "attributeStyleMap" &&
      node.arguments.length >= 1
    ) {
      const property = staticString(node.arguments[0]);
      count += property === null ? 1 : Number(isPaintProperty(property));
    } else if (
      name === "set" &&
      callee?.object.getText(sourceFile) === "Reflect" &&
      node.arguments.length >= 2 &&
      isQualifiedStyleTarget(node.arguments[0])
    ) {
      const property = staticString(node.arguments[1]);
      count += property === null ? 1 : Number(isPaintProperty(property));
    } else if (
      name === "defineProperty" &&
      (callee?.object.getText(sourceFile) === "Object" ||
        callee?.object.getText(sourceFile) === "Reflect") &&
      node.arguments.length >= 2 &&
      isQualifiedStyleTarget(node.arguments[0])
    ) {
      const property = staticString(node.arguments[1]);
      count += property === null ? 1 : Number(isPaintProperty(property));
    } else if (
      name === "defineProperties" &&
      callee?.object.getText(sourceFile) === "Object" &&
      node.arguments.length >= 2 &&
      isQualifiedStyleTarget(node.arguments[0])
    ) {
      markExpression(node.arguments[1], "style");
    } else if (name === "style" && node.arguments.length >= 2) {
      // D3 and compatible CSS setter chains use `.style(name, value)`. SVG
      // presentation paint (`fill`/`stroke`) and dynamic setter names remain
      // owned by the runtime-SVG channel, but ordinary CSS paint set through
      // `.style()` belongs here (notably inherited text `color`).
      const property = staticString(node.arguments[0]);
      count += Number(
        property !== null &&
          property !== "fill" &&
          property !== "stroke" &&
          isPaintProperty(property)
      );
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
