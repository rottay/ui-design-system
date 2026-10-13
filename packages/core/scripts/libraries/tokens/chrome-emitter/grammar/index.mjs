/**
 * chrome-emitter grammar — what a member of each role may hold, judged from its
 * text alone. Nothing here touches the tree: the authority one level up owns
 * the member list, the closure and the door, and states the law in full.
 */
import ts from 'typescript';

// The whole call vocabulary of a section; the shipped bodies need nothing else.
const SECTION_CALLEES = Object.freeze(['String']);
const SECTION_KEY = /^--ds-[a-z0-9-]+$/;

const ADMITTED_HELPER = 'chromeVariableMap';
// The admitted helper's syntax tree, printed without comments; compared token by token (kind and exact raw
// text, literals byte for byte), ignoring whitespace, comments and trailing commas.
const ADMITTED_HELPER_TREE = `<T extends object>(prefix: string, fields: readonly (keyof T)[]): Readonly<Record<keyof T, string>> =>
  Object.fromEntries(fields.map((field) => [field, \`\${prefix}\${String(field).replace(/[A-Z]/g, (letter) => \`-\${letter.toLowerCase()}\`)}\`]))
  as Readonly<Record<keyof T, string>>`;
const HELPER_PRINTER = ts.createPrinter({ removeComments: true, newLine: ts.NewLineKind.LineFeed });
const CLOSERS = new Set([
  ts.SyntaxKind.CloseParenToken,
  ts.SyntaxKind.CloseBracketToken,
  ts.SyntaxKind.CloseBraceToken,
  ts.SyntaxKind.GreaterThanToken,
]);
const EXPRESSION_ENDS = new Set([
  ts.SyntaxKind.Identifier,
  ts.SyntaxKind.PrivateIdentifier,
  ts.SyntaxKind.NumericLiteral,
  ts.SyntaxKind.BigIntLiteral,
  ts.SyntaxKind.StringLiteral,
  ts.SyntaxKind.NoSubstitutionTemplateLiteral,
  ts.SyntaxKind.TemplateTail,
  ts.SyntaxKind.RegularExpressionLiteral,
  ts.SyntaxKind.CloseParenToken,
  ts.SyntaxKind.CloseBracketToken,
  ts.SyntaxKind.CloseBraceToken,
  ts.SyntaxKind.ThisKeyword,
  ts.SyntaxKind.SuperKeyword,
  ts.SyntaxKind.TrueKeyword,
  ts.SyntaxKind.FalseKeyword,
  ts.SyntaxKind.NullKeyword,
  ts.SyntaxKind.PlusPlusToken,
  ts.SyntaxKind.MinusMinusToken,
]);

/** Tokens as kind + exact raw text (literals byte for byte); trivia and closer-trailing commas drop. Null if unscannable. */
function canonicalHelperTokens(text) {
  const scanner = ts.createScanner(ts.ScriptTarget.Latest, true, ts.LanguageVariant.Standard, text);
  const tokens = [];
  const braces = [];
  for (let kind = scanner.scan(); kind !== ts.SyntaxKind.EndOfFileToken; kind = scanner.scan()) {
    if (kind === ts.SyntaxKind.CloseBraceToken && braces.at(-1) === 'template') {
      braces.pop();
      kind = scanner.reScanTemplateToken(false);
    } else if (
      (kind === ts.SyntaxKind.SlashToken || kind === ts.SyntaxKind.SlashEqualsToken) &&
      !EXPRESSION_ENDS.has(tokens.at(-1)?.kind)
    ) {
      kind = scanner.reScanSlashToken();
    }
    if (kind === ts.SyntaxKind.Unknown || scanner.isUnterminated()) return null;
    if (kind === ts.SyntaxKind.TemplateHead || kind === ts.SyntaxKind.TemplateMiddle) braces.push('template');
    else if (kind === ts.SyntaxKind.OpenBraceToken) braces.push('brace');
    else if (kind === ts.SyntaxKind.CloseBraceToken) braces.pop();
    tokens.push({ kind, text: scanner.getTokenText() });
  }
  return tokens
    .filter((token, index) => token.kind !== ts.SyntaxKind.CommaToken || !CLOSERS.has(tokens[index + 1]?.kind))
    .map((token) => `${ts.SyntaxKind[token.kind]} ${token.text}`);
}

export function parse(file, text) {
  return ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

function unwrap(node) {
  let current = node;
  while (
    ts.isAsExpression(current) ||
    ts.isSatisfiesExpression(current) ||
    ts.isParenthesizedExpression(current) ||
    ts.isTypeAssertionExpression(current)
  ) {
    current = current.expression;
  }
  return current;
}

function isDataValue(node, admitted) {
  const value = unwrap(node);
  if (ts.isIdentifier(value)) return admitted.has(value.text) && value.text !== ADMITTED_HELPER;
  if (
    ts.isStringLiteralLike(value) ||
    ts.isNumericLiteral(value) ||
    value.kind === ts.SyntaxKind.TrueKeyword ||
    value.kind === ts.SyntaxKind.FalseKeyword ||
    value.kind === ts.SyntaxKind.NullKeyword
  ) {
    return true;
  }
  if (ts.isArrayLiteralExpression(value)) return value.elements.every((element) => isDataValue(element, admitted));
  if (ts.isObjectLiteralExpression(value)) {
    return value.properties.every(
      (property) =>
        ts.isPropertyAssignment(property) &&
        !ts.isComputedPropertyName(property.name) &&
        isDataValue(property.initializer, admitted),
    );
  }
  if (ts.isCallExpression(value)) {
    return (
      ts.isIdentifier(value.expression) &&
      value.expression.text === ADMITTED_HELPER &&
      value.arguments.every((argument) => isDataValue(argument, admitted))
    );
  }
  return false;
}

function isAdmittedHelper(initializer, sourceFile) {
  const candidate = canonicalHelperTokens(HELPER_PRINTER.printNode(ts.EmitHint.Expression, initializer, sourceFile));
  const admitted = canonicalHelperTokens(ADMITTED_HELPER_TREE);
  return (
    candidate !== null &&
    admitted !== null &&
    candidate.length === admitted.length &&
    candidate.every((token, index) => token === admitted[index])
  );
}

/** Violations of the data-only grammar for one member; empty means data only. */
export function dataOnlyViolations(file, text) {
  const sourceFile = parse(file, text);
  const violations = [];
  const at = (node) => sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
  let helpers = 0;
  const admitted = new Set();
  for (const statement of sourceFile.statements) {
    if (ts.isImportDeclaration(statement)) {
      if (!statement.importClause?.isTypeOnly) violations.push(`:${at(statement)} value import`);
      continue;
    }
    if (ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement)) continue;
    if (!ts.isVariableStatement(statement)) {
      violations.push(`:${at(statement)} ${ts.SyntaxKind[statement.kind]}`);
      continue;
    }
    if ((statement.declarationList.flags & ts.NodeFlags.Const) === 0) {
      violations.push(`:${at(statement)} non-const binding`);
      continue;
    }
    for (const declaration of statement.declarationList.declarations) {
      const name = ts.isIdentifier(declaration.name) ? declaration.name.text : null;
      const initializer = declaration.initializer && unwrap(declaration.initializer);
      if (!name || !initializer) {
        violations.push(`:${at(declaration)} unsupported binding`);
        continue;
      }
      if (name === ADMITTED_HELPER && !ts.isCallExpression(initializer)) {
        helpers += 1;
        if (helpers > 1) violations.push(`:${at(declaration)} second ${ADMITTED_HELPER}`);
        if (!isAdmittedHelper(declaration.initializer, sourceFile)) {
          violations.push(`:${at(declaration)} ${ADMITTED_HELPER} is not the admitted helper`);
        }
        continue;
      }
      if (isDataValue(initializer, admitted)) admitted.add(name);
      else violations.push(`:${at(declaration)} ${name} is not data`);
    }
  }
  return violations;
}

const hasModifier = (node, kind) => Boolean(node.modifiers?.some((modifier) => modifier.kind === kind));

/** Top-level function declaration names of a parsed member. */
export function declaredFunctionNames(sourceFile) {
  return sourceFile.statements
    .filter((statement) => ts.isFunctionDeclaration(statement) && statement.name)
    .map((statement) => statement.name.text);
}

/**
 * The statement shape a writer and a section share: type-only imports, type
 * declarations, plain function declarations, one trailing export list naming
 * exactly those functions.
 */
function functionMemberShape(sourceFile, at, noun) {
  const violations = [];
  const functions = declaredFunctionNames(sourceFile);
  const statements = sourceFile.statements;
  let exportList = null;
  statements.forEach((statement, index) => {
    if (ts.isImportDeclaration(statement)) {
      if (statement.importClause?.isTypeOnly) return;
      violations.push(`:${at(statement)} value import of "${statement.moduleSpecifier.text}" (sibling-owner-dependency)`);
      return;
    }
    if (ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement)) return;
    if (ts.isFunctionDeclaration(statement)) {
      const name = statement.name?.text ?? '<anonymous>';
      if (hasModifier(statement, ts.SyntaxKind.ExportKeyword)) violations.push(`:${at(statement)} inline export of ${name}`);
      if (hasModifier(statement, ts.SyntaxKind.AsyncKeyword) || statement.asteriskToken) violations.push(`:${at(statement)} ${name} is async or a generator`);
      if (!statement.body) violations.push(`:${at(statement)} ${name} has no body`);
      if (name === ADMITTED_HELPER) violations.push(`:${at(statement)} ${ADMITTED_HELPER} is not a ${noun}`);
      return;
    }
    if (
      ts.isExportDeclaration(statement) &&
      !statement.moduleSpecifier &&
      !statement.isTypeOnly &&
      statement.exportClause &&
      ts.isNamedExports(statement.exportClause) &&
      index === statements.length - 1 &&
      exportList === null
    ) {
      exportList = statement.exportClause.elements;
      for (const element of exportList) {
        if (element.propertyName || element.isTypeOnly) violations.push(`:${at(element)} aliased or type-only export ${element.name.text}`);
      }
      return;
    }
    if (ts.isVariableStatement(statement)) {
      violations.push(`:${at(statement)} binding in a ${noun}`);
      return;
    }
    violations.push(`:${at(statement)} ${ts.SyntaxKind[statement.kind]}`);
  });
  const exported = (exportList ?? []).map((element) => (element.propertyName ?? element.name).text);
  if (exportList === null) violations.push('no single trailing export list');
  else if (exported.length !== functions.length || [...exported].sort().join() !== [...functions].sort().join()) {
    violations.push(`export list [${exported.join(', ')}] is not the declared ${noun}s [${functions.join(', ')}]`);
  }
  const ownNames = new Set(functions);
  const declarationNames = new Set(
    statements.filter((statement) => ts.isFunctionDeclaration(statement) && statement.name).map((statement) => statement.name),
  );
  const exportCounts = new Map();
  const referenceVisit = (node) => {
    if (ts.isIdentifier(node) && ownNames.has(node.text) && !declarationNames.has(node)) {
      const specifier = node.parent;
      if (exportList?.includes(specifier) && specifier.name === node && !specifier.propertyName) {
        const seen = (exportCounts.get(node.text) ?? 0) + 1;
        exportCounts.set(node.text, seen);
        if (seen > 1) violations.push(`:${at(node)} second export specifier for ${node.text}`);
      } else if (ts.isCallExpression(specifier) && specifier.expression === node) {
        violations.push(`:${at(node)} ${noun} calls ${noun} ${node.text}`);
      } else {
        violations.push(`:${at(node)} reference to ${noun} ${node.text}`);
      }
    }
    ts.forEachChild(node, referenceVisit);
  };
  referenceVisit(sourceFile);
  return violations;
}

/** Violations of the writer grammar for one member; empty means admitted. */
export function writerViolations(file, text) {
  const sourceFile = parse(file, text);
  const at = (node) => sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
  return [...functionMemberShape(sourceFile, at, 'writer'), ...templateViolations(sourceFile, at)];
}

const ASSIGNMENT_OPERATOR = (kind) => kind >= ts.SyntaxKind.FirstAssignment && kind <= ts.SyntaxKind.LastAssignment;

/** `node` sits in a type, where a name is not a value. */
function inTypePosition(node) {
  for (let current = node.parent; current && !ts.isSourceFile(current); current = current.parent) {
    if (ts.isTypeNode(current) || ts.isInterfaceDeclaration(current) || ts.isTypeAliasDeclaration(current)) return true;
  }
  return false;
}

/** `node` is a property NAME (`a.name`, `{ name: … }`), not a reference to a binding. */
const isPropertyName = (node) => {
  const parent = node.parent;
  return (
    (ts.isPropertyAccessExpression(parent) && parent.name === node) ||
    (ts.isPropertyAssignment(parent) && parent.name === node)
  );
};

/** `access` is `vars[key]` standing as the target of a plain `=`. */
const isVarsAssignmentTarget = (access) =>
  ts.isElementAccessExpression(access) &&
  ts.isIdentifier(access.expression) &&
  access.expression.text === 'vars' &&
  ts.isBinaryExpression(access.parent) &&
  access.parent.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
  access.parent.left === access;

/**
 * Violations of the section grammar for one member; empty means admitted.
 * `writers` and `sections` are the function names declared by the writer
 * member and by the OTHER section members: a section names none of them.
 */
export function sectionViolations(file, text, { writers = [], sections = [] } = {}) {
  const sourceFile = parse(file, text);
  const at = (node) => sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
  const violations = functionMemberShape(sourceFile, at, 'section');
  const foreign = new Map([...sections.map((name) => [name, 'section']), ...writers.map((name) => [name, 'writer'])]);
  const owners = sourceFile.statements.filter((statement) => ts.isFunctionDeclaration(statement));
  for (const owner of owners) {
    const name = owner.name?.text ?? '<anonymous>';
    if (!owner.parameters.some((parameter) => ts.isIdentifier(parameter.name) && parameter.name.text === 'vars' && !parameter.dotDotDotToken)) {
      violations.push(`:${at(owner)} ${name} takes no vars parameter`);
    }
  }
  const visit = (node) => {
    if (ts.isTemplateExpression(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      violations.push(`:${at(node)} template in a section (literal keys only)`);
    }
    if ((isFunctionScope(node) || ts.isClassLike(node)) && !owners.includes(node)) {
      violations.push(`:${at(node)} nested function or class in a section`);
    }
    if (ts.isCallExpression(node)) {
      if (!ts.isIdentifier(node.expression) || !SECTION_CALLEES.includes(node.expression.text)) {
        violations.push(`:${at(node)} call outside the section vocabulary [${SECTION_CALLEES.join(', ')}]`);
      }
    }
    if (ts.isNewExpression(node) || ts.isTaggedTemplateExpression(node)) violations.push(`:${at(node)} ${ts.SyntaxKind[node.kind]}`);
    if (ts.isBinaryExpression(node) && ASSIGNMENT_OPERATOR(node.operatorToken.kind) && !isVarsAssignmentTarget(node.left)) {
      violations.push(`:${at(node)} assignment to anything but vars["--ds-…"]`);
    }
    if (
      ((ts.isPrefixUnaryExpression(node) || ts.isPostfixUnaryExpression(node)) &&
        (node.operator === ts.SyntaxKind.PlusPlusToken || node.operator === ts.SyntaxKind.MinusMinusToken)) ||
      ts.isDeleteExpression(node)
    ) {
      violations.push(`:${at(node)} mutation outside vars["--ds-…"] = value`);
    }
    if (ts.isVariableDeclarationList(node) && (node.flags & ts.NodeFlags.Const) === 0) {
      violations.push(`:${at(node)} non-const binding in a section`);
    }
    if (ts.isStringLiteral(node)) {
      const isKey = isVarsAssignmentTarget(node.parent) && node.parent.argumentExpression === node;
      if (isKey) {
        if (!SECTION_KEY.test(node.text)) violations.push(`:${at(node)} "${node.text}" is not a channel name`);
        else if (node.getText(sourceFile).slice(1, -1) !== node.text) violations.push(`:${at(node)} key "${node.text}" is not written as it reads`);
      } else if (node.text.startsWith('--ds-')) {
        violations.push(`:${at(node)} "${node.text}" is not the key of a vars[…] = value`);
      }
    }
    if ((ts.isForOfStatement(node) || ts.isForInStatement(node)) && !ts.isVariableDeclarationList(node.initializer)) {
      violations.push(`:${at(node)} loop assigns to anything but its own const`);
    }
    if (ts.isIdentifier(node) && !isPropertyName(node) && !inTypePosition(node)) {
      if (node.text === 'vars') {
        const parent = node.parent;
        const isOwnParameter = ts.isParameter(parent) && parent.name === node && owners.includes(parent.parent);
        const isLiteralWrite =
          isVarsAssignmentTarget(parent) && parent.expression === node && ts.isStringLiteral(parent.argumentExpression);
        if (!isOwnParameter && !isLiteralWrite) violations.push(`:${at(node)} vars is used outside vars["--ds-…"] = value`);
      } else if (SECTION_CALLEES.includes(node.text) && !(ts.isCallExpression(node.parent) && node.parent.expression === node)) {
        violations.push(`:${at(node)} ${node.text} is rebound or used as a value`);
      } else if (node.text === 'arguments' || node.text === 'eval' || node.text === 'globalThis') {
        violations.push(`:${at(node)} ${node.text} in a section`);
      } else if (foreign.has(node.text)) {
        violations.push(`:${at(node)} section names ${foreign.get(node.text)} ${node.text}`);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return violations;
}

const isFunctionScope = (node) =>
  ts.isFunctionDeclaration(node) ||
  ts.isFunctionExpression(node) ||
  ts.isArrowFunction(node) ||
  ts.isMethodDeclaration(node) ||
  ts.isConstructorDeclaration(node) ||
  ts.isGetAccessorDeclaration(node) ||
  ts.isSetAccessorDeclaration(node) ||
  ts.isClassStaticBlockDeclaration(node);

/** The nearest enclosing function scope of `node`, or null at module level. */
function enclosingScope(node) {
  for (let current = node.parent; current; current = current.parent) if (isFunctionScope(current)) return current;
  return null;
}

/** `node` is the key of `vars[key] = value` (a plain assignment, never a read or `+=`). */
const isAssignedVarsKey = (node) => {
  const access = node.parent;
  return (
    ts.isElementAccessExpression(access) &&
    access.argumentExpression === node &&
    ts.isIdentifier(access.expression) &&
    access.expression.text === 'vars' &&
    ts.isBinaryExpression(access.parent) &&
    access.parent.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
    access.parent.left === access
  );
};

/** `node` is a `const name = <node>` declared directly in a writer function. */
const prefixConstOf = (node, writer) => {
  const declaration = node.parent;
  if (!ts.isVariableDeclaration(declaration) || declaration.initializer !== node || !ts.isIdentifier(declaration.name)) return null;
  const list = declaration.parent;
  if (!ts.isVariableDeclarationList(list) || (list.flags & ts.NodeFlags.Const) === 0 || !ts.isVariableStatement(list.parent)) return null;
  return enclosingScope(declaration) === writer ? declaration : null;
};

/**
 * Template literals in a writer member. Admitted only as (i) the key of a
 * plain `vars[`…`] = value` or (ii) a function-local `const` initializer every
 * reference to which is a hole of such a key; every hole is an identifier
 * naming a parameter of the writer or an admitted (ii) const.
 */
function templateViolations(sourceFile, at) {
  const violations = [];
  const writers = sourceFile.statements.filter((statement) => ts.isFunctionDeclaration(statement) && statement.body);
  const templates = [];
  const collect = (node) => {
    if (ts.isTemplateExpression(node) || ts.isNoSubstitutionTemplateLiteral(node)) templates.push(node);
    ts.forEachChild(node, collect);
  };
  collect(sourceFile);
  if (templates.length === 0) return violations;

  const scopeNames = (writer) => {
    const params = new Set(writer.parameters.filter((p) => ts.isIdentifier(p.name)).map((p) => p.name.text));
    const locals = new Set();
    const visit = (node) => {
      if ((ts.isVariableDeclaration(node) || ts.isParameter(node) || ts.isBindingElement(node)) && ts.isIdentifier(node.name)) {
        if (!(ts.isParameter(node) && node.parent === writer)) locals.add(node.name.text);
      }
      if ((ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isClassDeclaration(node)) && node !== writer && node.name) locals.add(node.name.text);
      ts.forEachChild(node, visit);
    };
    visit(writer);
    return { params, locals };
  };
  const scopes = new Map(writers.map((writer) => [writer, scopeNames(writer)]));
  const keyTemplate = (template) => ts.isTemplateExpression(template) && isAssignedVarsKey(template);

  const prefixConsts = new Map();
  for (const template of templates) {
    const writer = enclosingScope(template);
    if (!scopes.has(writer) || !ts.isTemplateExpression(template)) continue;
    const declaration = prefixConstOf(template, writer);
    if (!declaration) continue;
    const name = declaration.name.text;
    let references = 0;
    let onlyKeyHoles = true;
    const visit = (node) => {
      if (ts.isIdentifier(node) && node.text === name && node !== declaration.name) {
        references += 1;
        const span = node.parent;
        const inKeyHole =
          ts.isTemplateSpan(span) &&
          span.expression === node &&
          keyTemplate(span.parent) &&
          enclosingScope(span.parent) === writer;
        if (!inKeyHole) onlyKeyHoles = false;
      }
      ts.forEachChild(node, visit);
    };
    visit(writer);
    const sameNameDeclarations = [];
    const declarationsVisit = (node) => {
      if ((ts.isVariableDeclaration(node) || ts.isParameter(node) || ts.isBindingElement(node)) && ts.isIdentifier(node.name) && node.name.text === name) {
        sameNameDeclarations.push(node);
      }
      ts.forEachChild(node, declarationsVisit);
    };
    declarationsVisit(writer);
    if (references > 0 && onlyKeyHoles && sameNameDeclarations.length === 1) prefixConsts.set(template, { writer, name, declaration });
  }

  const holeAdmitted = (identifier, writer, template) => {
    const { params, locals } = scopes.get(writer);
    if (params.has(identifier.text) && !locals.has(identifier.text)) return true;
    for (const prefix of prefixConsts.values()) {
      if (prefix.writer === writer && prefix.name === identifier.text && prefix.declaration.getStart() < template.getStart()) return true;
    }
    return false;
  };

  for (const template of templates) {
    const writer = enclosingScope(template);
    if (!scopes.has(writer)) {
      violations.push(`:${at(template)} template outside a writer's own body`);
      continue;
    }
    if (ts.isNoSubstitutionTemplateLiteral(template)) {
      violations.push(`:${at(template)} template without substitution (use a string literal)`);
      continue;
    }
    if (!keyTemplate(template) && !prefixConsts.has(template)) {
      violations.push(`:${at(template)} template is neither a vars[…] = key nor a key-prefix const`);
      continue;
    }
    for (const span of template.templateSpans) {
      if (!ts.isIdentifier(span.expression) || !holeAdmitted(span.expression, writer, template)) {
        violations.push(`:${at(span.expression)} template hole is not a writer parameter or key-prefix const`);
      }
    }
  }
  return violations;
}
