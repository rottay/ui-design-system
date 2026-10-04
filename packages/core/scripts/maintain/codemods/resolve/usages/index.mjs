import ts from 'typescript';

export function symbolKey(subpath, name) {
  return `${subpath}#${name}`;
}

export function excerpt(node, sourceFile) {
  const text = node.getText(sourceFile).replace(/\s+/g, ' ');
  return text.length > 96 ? `${text.slice(0, 93)}...` : text;
}

function rootIdentifier(expression) {
  let current = expression;
  while (ts.isPropertyAccessExpression(current) || ts.isElementAccessExpression(current)) current = current.expression;
  while (ts.isQualifiedName(current)) current = current.left;
  return ts.isIdentifier(current) ? current : null;
}

/**
 * Every place a file names a design-system export (imports, re-exports, namespace members, destructuring,
 * `import()` type queries), keyed by `<subpath>#<name>[.<member>]`. Nothing is matched by spelling alone.
 */
export function symbolSites(analysis, memberRoots = new Set()) {
  if (analysis.symbolSiteIndex) return analysis.symbolSiteIndex;
  const { sourceFile, table, workspace, file } = analysis;
  const index = new Map();
  const add = (origin, site) => {
    if (origin.kind !== 'ds' || origin.members.length > 1 || origin.name === '*') return;
    const key = symbolKey(origin.subpath, [origin.name, ...origin.members].join('.'));
    if (!index.has(key)) index.set(key, []);
    index.get(key).push({ ...site, origin });
  };

  const namespaces = new Set();
  for (const [local, binding] of table.imports) {
    const origin = workspace.resolveImport(file, binding.specifier, binding.imported);
    if (ts.isImportSpecifier(binding.node)) {
      add(origin, { type: 'import', node: binding.node, local });
      if (origin.kind === 'ds' && memberRoots.has(symbolKey(origin.subpath, origin.name))) namespaces.add(local);
    } else if (origin.kind === 'ds' || origin.kind === 'module') namespaces.add(local);
  }
  for (const statement of sourceFile.statements) {
    if (!ts.isExportDeclaration(statement) || !statement.moduleSpecifier || !statement.exportClause) continue;
    if (!ts.isNamedExports(statement.exportClause) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
    for (const element of statement.exportClause.elements) {
      const imported = (element.propertyName ?? element.name).text;
      add(workspace.resolveImport(file, statement.moduleSpecifier.text, imported), { type: 'reexport', node: element });
    }
  }

  analysis.walk((node) => {
    if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)
      && ts.isStringLiteral(node.argument.literal) && node.qualifier && ts.isIdentifier(node.qualifier)) {
      const subpath = workspace.packageSubpath(node.argument.literal.text, file);
      if (subpath) {
        add({ kind: 'ds', subpath, name: node.qualifier.text, members: [], hops: [] }, { type: 'import-type', node });
      }
      return;
    }
    if (namespaces.size === 0) return;
    if (ts.isPropertyAccessExpression(node) || ts.isQualifiedName(node) || ts.isElementAccessExpression(node)) {
      const root = rootIdentifier(node);
      if (!root || !namespaces.has(root.text)) return;
      const origin = analysis.originOfExpression(node);
      if (origin.kind === 'dynamic') {
        if (!index.has('dynamic')) index.set('dynamic', []);
        index.get('dynamic').push({ type: 'dynamic', node, origin });
        return;
      }
      const nameNode = ts.isPropertyAccessExpression(node) ? node.name
        : ts.isQualifiedName(node) ? node.right : node.argumentExpression;
      add(origin, { type: ts.isElementAccessExpression(node) ? 'element-access' : 'member', node, nameNode });
      return;
    }
    if (ts.isVariableDeclaration(node) && node.initializer && ts.isObjectBindingPattern(node.name)) {
      const root = rootIdentifier(node.initializer);
      if (!root || !namespaces.has(root.text)) return;
      const source = analysis.originOfExpression(node.initializer);
      if (source.kind !== 'ds' && source.kind !== 'module') return;
      for (const element of node.name.elements) {
        const key = element.propertyName ?? element.name;
        if (element.dotDotDotToken || !ts.isIdentifier(key)) continue;
        add(workspace.memberOf(source, key.text), { type: 'destructure', node: element });
      }
    }
  });

  analysis.symbolSiteIndex = index;
  return index;
}

/** Identifiers in the file bound to the given import specifier, the specifier itself excluded. */
export function referencesOf(analysis, specifier) {
  const local = specifier.name.text;
  const references = [];
  analysis.walk((node) => {
    if (!ts.isIdentifier(node) || node.text !== local || node.parent === specifier) return;
    if (analysis.declarationOf(node) === specifier) references.push(node);
  });
  return references;
}

function isComponentTag(tagName) {
  if (ts.isIdentifier(tagName)) return /^[A-Z_$]/.test(tagName.text);
  return ts.isPropertyAccessExpression(tagName);
}

function matchesComponent(origin, entry) {
  return origin.kind === 'ds' && origin.subpath === entry.subpath && origin.members.length === 0
    && entry.components.includes(origin.name);
}

const wrapperCache = new WeakMap();

/**
 * True when a consumer declaration mentions one of the entry's components (wrapper, `memo`, `styled`).
 * The kit never follows a wrapper; it reports the usage as `indirect`.
 */
function wrapsComponent(context, origin, entry) {
  const declaration = origin.declaration;
  if (!declaration) return false;
  const cacheKey = `${entry.subpath}\0${entry.components.join()}`;
  if (!wrapperCache.has(declaration)) wrapperCache.set(declaration, new Map());
  const cache = wrapperCache.get(declaration);
  if (cache.has(cacheKey)) return cache.get(cacheKey);
  cache.set(cacheKey, false);
  const owner = context.analysis(origin.file);
  const candidates = new Set(owner.table.imports.keys());
  let found = false;
  const visit = (node) => {
    if (found) return;
    if (ts.isIdentifier(node) && candidates.has(node.text)) {
      const parent = node.parent;
      const expression = (ts.isPropertyAccessExpression(parent) && parent.expression === node) ? parent : node;
      if (matchesComponent(owner.originOfExpression(expression), entry)) found = true;
    }
    ts.forEachChild(node, visit);
  };
  visit(declaration);
  cache.set(cacheKey, found);
  return found;
}

function attributeName(attribute) {
  return ts.isIdentifier(attribute.name) ? attribute.name.text : attribute.name.getText();
}

/**
 * True when a JSX spread is proven not to carry any of the names: its operand is an object literal written
 * in place (through parentheses, `as` and `satisfies`) whose every key is a static name other than them.
 * A computed key, a nested spread, or any operand that is not a literal (identifier, call, conditional)
 * proves nothing. A literal that states a name is not proven either: an object is not an attribute list.
 */
function spreadOmitsProps(spread, names) {
  let operand = spread.expression;
  while (ts.isParenthesizedExpression(operand) || ts.isAsExpression(operand) || ts.isSatisfiesExpression(operand)) {
    operand = operand.expression;
  }
  if (!ts.isObjectLiteralExpression(operand)) return false;
  return operand.properties.every((property) => {
    const name = property.name;
    if (ts.isSpreadAssignment(property) || !name) return false;
    if (!ts.isIdentifier(name) && !ts.isStringLiteralLike(name) && !ts.isNumericLiteral(name)) return false;
    return !names.includes(name.text);
  });
}

/**
 * JSX elements carrying the entry's prop (or a spread that could): `direct` when proven to be the
 * design-system component, `indirect` when they only reach it through a consumer wrapper. A spread of an
 * inline object literal that cannot carry the prop is not a use of it and is left out. `successor` is the
 * name a rename gives the prop: on an element that states the prop, a literal that states the successor
 * decides which value survives the rename, so it is kept as a spread.
 */
export function propSites(context, analysis, entry, successor = null) {
  const sites = [];
  analysis.walk((node) => {
    if (!ts.isJsxOpeningElement(node) && !ts.isJsxSelfClosingElement(node)) return;
    if (!isComponentTag(node.tagName)) return;
    const properties = node.attributes.properties;
    const attribute = properties.find((item) => ts.isJsxAttribute(item) && attributeName(item) === entry.member);
    const names = attribute && successor ? [entry.member, successor] : [entry.member];
    const spreads = properties.filter((item) => ts.isJsxSpreadAttribute(item) && !spreadOmitsProps(item, names));
    if (!attribute && spreads.length === 0) return;
    const origin = analysis.originOfExpression(node.tagName);
    if (matchesComponent(origin, entry)) {
      sites.push({ kind: 'direct', element: node, attribute, spreads, origin });
    } else if (attribute && origin.kind === 'local' && wrapsComponent(context, origin, entry)) {
      sites.push({ kind: 'indirect', element: node, attribute, spreads, origin });
    }
  });
  return sites;
}

function typeReferenceMatches(analysis, typeNode, entry) {
  if (!typeNode || !ts.isTypeReferenceNode(typeNode)) return false;
  const origin = analysis.originOfExpression(typeNode.typeName);
  return origin.kind === 'ds' && origin.subpath === entry.subpath && origin.members.length === 0
    && (entry.propsTypes ?? []).includes(origin.name);
}

/**
 * Objects stated to be the entry's props type, and `createElement(Component, { prop })` calls.
 * Both are reported: an object is not an attribute list and the kit does not infer types.
 */
export function objectSites(analysis, entry) {
  const sites = [];
  analysis.walk((node) => {
    if (ts.isObjectLiteralExpression(node)) {
      const property = node.properties.find((item) => (ts.isPropertyAssignment(item)
        || ts.isShorthandPropertyAssignment(item)) && item.name.getText(analysis.sourceFile) === entry.member);
      const spread = node.properties.some((item) => ts.isSpreadAssignment(item));
      if (!property && !spread) return;
      const parent = node.parent;
      let typeNode = null;
      if (ts.isVariableDeclaration(parent) && parent.initializer === node) typeNode = parent.type;
      else if (ts.isAsExpression(parent) || ts.isSatisfiesExpression(parent)) typeNode = parent.type;
      if (typeNode && typeReferenceMatches(analysis, typeNode, entry) && property) {
        sites.push({ kind: 'typed-object', node: property });
        return;
      }
      if (ts.isCallExpression(parent) && parent.arguments[1] === node && parent.arguments[0]
        && /(^|\.)createElement$/.test(parent.expression.getText(analysis.sourceFile))
        && matchesComponent(analysis.originOfExpression(parent.arguments[0]), entry)) {
        sites.push({ kind: 'create-element', node: property ?? node });
      }
    }
  });
  return sites;
}
