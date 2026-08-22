/**
 * PRE_F4B cross-file resolution subsystem -- PORTED from the sealed census v6
 * bundle, not invented. Dispositions fall out of the AST; there is no
 * allowlist of ids anywhere in this subsystem.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve as pathResolve } from "node:path";
import { fileURLToPath } from "node:url";

import ts from "typescript";

import { repoRoot as findRepoRoot } from "../../../lib/repo-root/index.mjs";

export const REPO_ABS = findRepoRoot(dirname(fileURLToPath(import.meta.url)));

import { candidateExportedNamesForFunction, isDeclarationPubliclyReachable } from "./cascade-public-surface.mjs";
/**
 * v5 shared source cache — READ-ONLY. Extracted so `resolver.mjs` and
 * `publicSurface.mjs` share the SAME parsed AST objects for the SAME file.
 * v4 had each module maintain its own independent `sourceCache`/`getSource`,
 * which meant a node produced while resolving a shape in `resolver.mjs` was
 * never reference-identical to the "same" declaration re-parsed inside
 * `publicSurface.mjs`'s engine-usage-graph walk -- `nameOfEnclosingNamedFunction`
 * (blocker 4) matches declarations by node IDENTITY, so two independent
 * parses of the identical file silently never matched, and every wrapper
 * chain attempt failed with a false "owner-function-is-not-a-named-local-
 * declaration". One shared cache fixes this at the source instead of
 * papering over it with a name/position-based match.
 */



const sourceCache = new Map();
export function getSource(relFile) {
  if (sourceCache.has(relFile)) return sourceCache.get(relFile);
  const abs = join(REPO_ABS, relFile);
  let text;
  try {
    text = readFileSync(abs, "utf8");
  } catch {
    sourceCache.set(relFile, null);
    return null;
  }
  const source = ts.createSourceFile(relFile, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const entry = { text, source };
  sourceCache.set(relFile, entry);
  return entry;
}

/** Test-only: seed a SYNTHETIC file (never touching disk / the repo) into the
 * shared cache under a fake `relFile` key, for isolated multi-file wrapper-
 * chain fixtures. */
export function seedSyntheticSource(relFile, text, scriptKind = ts.ScriptKind.TSX) {
  const source = ts.createSourceFile(relFile, text, ts.ScriptTarget.Latest, true, scriptKind);
  sourceCache.set(relFile, { text, source });
  return sourceCache.get(relFile);
}

/**
 * v4 resolver — READ-ONLY. Extends v3's composite Shape model with the
 * corrections bound by the independent REJECT audit of v3 (P0-1..P0-6) and
 * the additive DT ruling on zero-governed-emission objects. v3's core model
 * (composite Shape, spread override order, opaque-shape propagation,
 * cross-file import following with cycle detection, call-argument
 * substitution) is UNCHANGED except where a specific correction below says
 * otherwise -- the independent audit re-verified those parts against live
 * source and found them sound.
 *
 * Shape kinds: unchanged from v3 (object/nonObject/branches/relay/
 * callArgsPending/computedKey/dynamicSink/openUnknown). `closed` is still
 * defined recursively per the v3 docstring, with ONE addition (P0-2 support):
 * an object leaf whose KEY could not be resolved to a literal string (a
 * computed property name that is not a string-literal expression) makes that
 * leaf's contribution to `closed` FALSE regardless of its value's shape --
 * an unproven key could name a governed channel at runtime, so this can never
 * be silently treated as closed. See `entryIsClosed()`.
 *
 * Corrections applied in this file, each tagged with its P0 number:
 *   P0-1 / P0-5: `classifyRelayBoundary` now uses publicSurface.mjs's full
 *     package.json#exports-driven graph (star/aliased/multi-hop re-exports,
 *     `memo`/`forwardRef` wrapper unwrapping, `createEngineComponent`
 *     wrapper->engine delegation) instead of v3's 2-barrel / 1-hop check.
 *   P0-3: `readPropertyOfBranches` no longer drops `absent` branches when a
 *     `found` branch coexists; the result carries `conditional:true` and its
 *     `valueShape` includes an explicit absent placeholder per branch, so a
 *     conditionally-authored key can never present as unconditionally closed.
 *     `readPropertyOfObject`'s spread-walk treats a `conditional` sub-result
 *     the same as an `open` one for override-tracking purposes (fail-closed:
 *     a later spread that only SOMETIMES defines the key cannot be trusted to
 *     have fully superseded an earlier open/unknown contributor).
 *   P0-4: `buildSubstitution` -- defaults now resolve in the CALLEE's lexical
 *     scope (with access to already-substituted earlier parameters), an
 *     explicit `undefined` argument triggers the default exactly like a
 *     missing argument, a missing argument with no default maps the parameter
 *     to a precise `undefined` shape (not a generic relay), an open
 *     destructured leaf propagates its opaque shape instead of a flattened
 *     string reason, and a rest element inside a destructured parameter is an
 *     explicit `openUnknown` rather than a silently skipped substitution.
 *     `hasReassignmentOrMutation` now covers every compound-assignment
 *     operator, prefix/postfix `++`/`--` on a property target (not just a
 *     bare identifier), and destructuring-assignment targets that mutate a
 *     property of the tracked name.
 */

const ALIAS_ROOT = join(REPO_ABS, "packages/core/src");


/* ---------------------------------------------------------------- misc --- */
function unwrap(expr) {
  let current = expr;
  for (let guard = 0; guard < 8 && current; guard += 1) {
    if (ts.isAsExpression(current) || ts.isParenthesizedExpression(current) || ts.isNonNullExpression(current)) {
      current = current.expression;
      continue;
    }
    if (ts.isSatisfiesExpression?.(current)) {
      current = current.expression;
      continue;
    }
    break;
  }
  return current;
}

function enclosingSymbol(node) {
  let current = node;
  while (current) {
    if (ts.isFunctionDeclaration(current) && current.name) return current.name.text;
    if ((ts.isVariableDeclaration(current) || ts.isPropertyAssignment(current)) && current.name && ts.isIdentifier(current.name)) {
      return current.name.text;
    }
    if (ts.isMethodDeclaration(current) && current.name && ts.isIdentifier(current.name)) return current.name.text;
    current = current.parent;
  }
  return "<module>";
}

function isFunctionLike(n) {
  return ts.isFunctionDeclaration(n) || ts.isFunctionExpression(n) || ts.isArrowFunction(n) || ts.isMethodDeclaration(n);
}

function paramLeaves(param) {
  const out = [];
  const walk = (name, isDestructured, defaultInit) => {
    if (ts.isIdentifier(name)) {
      out.push({ name: name.text, isDestructured, defaultInit });
      return;
    }
    if (ts.isObjectBindingPattern(name) || ts.isArrayBindingPattern(name)) {
      for (const el of name.elements) {
        if (ts.isOmittedExpression(el)) continue;
        if (el.dotDotDotToken) {
          out.push({ name: el.name.text, isDestructured: true, defaultInit: null, isRest: true });
          continue;
        }
        walk(el.name, true, el.initializer ?? null);
      }
    }
  };
  walk(param.name, false, param.initializer ?? null);
  return out;
}

function collectModuleImports(source) {
  const map = new Map();
  for (const stmt of source.statements) {
    if (!ts.isImportDeclaration(stmt) || !stmt.importClause) continue;
    const moduleSpecifier = ts.isStringLiteralLike(stmt.moduleSpecifier) ? stmt.moduleSpecifier.text : "<dynamic>";
    const clause = stmt.importClause;
    if (clause.name) map.set(clause.name.text, { moduleSpecifier, form: "default" });
    if (clause.namedBindings) {
      if (ts.isNamespaceImport(clause.namedBindings)) {
        map.set(clause.namedBindings.name.text, { moduleSpecifier, form: "namespace" });
      } else if (ts.isNamedImports(clause.namedBindings)) {
        for (const el of clause.namedBindings.elements) {
          map.set(el.name.text, { moduleSpecifier, form: "named", importedName: (el.propertyName ?? el.name).text });
        }
      }
    }
  }
  return map;
}

/* --------------------------------------------------- reassignment/mutation (P0-4) --- */
const ASSIGN_OPS = new Set([
  ts.SyntaxKind.EqualsToken,
  ts.SyntaxKind.PlusEqualsToken,
  ts.SyntaxKind.MinusEqualsToken,
  ts.SyntaxKind.AsteriskEqualsToken,
  ts.SyntaxKind.SlashEqualsToken,
  ts.SyntaxKind.PercentEqualsToken,
  ts.SyntaxKind.AsteriskAsteriskEqualsToken,
  ts.SyntaxKind.LessThanLessThanEqualsToken,
  ts.SyntaxKind.GreaterThanGreaterThanEqualsToken,
  ts.SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken,
  ts.SyntaxKind.AmpersandEqualsToken,
  ts.SyntaxKind.CaretEqualsToken,
  ts.SyntaxKind.BarEqualsToken,
  ts.SyntaxKind.QuestionQuestionEqualsToken,
  ts.SyntaxKind.BarBarEqualsToken,
  ts.SyntaxKind.AmpersandAmpersandEqualsToken,
]);

function targetsName(rootExpr, name) {
  let root = rootExpr;
  while (ts.isPropertyAccessExpression(root) || ts.isElementAccessExpression(root)) root = root.expression;
  return ts.isIdentifier(root) && root.text === name;
}

/** Does a destructuring-ASSIGNMENT pattern (not a declaration) write into a
 * property of `name` anywhere inside it? E.g. `({ a: name.x } = y)`. Shorthand
 * targets (`{ name }`) rebind a DIFFERENT local, not a property of `name`. */
function destructuringTargetsName(pattern, name) {
  if (ts.isObjectLiteralExpression(pattern)) {
    for (const prop of pattern.properties) {
      if (ts.isPropertyAssignment(prop)) {
        const value = unwrap(prop.initializer);
        if (ts.isObjectLiteralExpression(value) || ts.isArrayLiteralExpression(value)) {
          if (destructuringTargetsName(value, name)) return true;
        } else if (!ts.isIdentifier(value) && targetsName(value, name)) {
          return true;
        }
      } else if (ts.isSpreadAssignment(prop)) {
        const value = unwrap(prop.expression);
        if (!ts.isIdentifier(value) && targetsName(value, name)) return true;
      }
    }
    return false;
  }
  if (ts.isArrayLiteralExpression(pattern)) {
    for (const el of pattern.elements) {
      if (ts.isOmittedExpression(el)) continue;
      const target = unwrap(ts.isSpreadElement(el) ? el.expression : el);
      if (ts.isObjectLiteralExpression(target) || ts.isArrayLiteralExpression(target)) {
        if (destructuringTargetsName(target, name)) return true;
      } else if (!ts.isIdentifier(target) && targetsName(target, name)) {
        return true;
      }
    }
    return false;
  }
  return false;
}

/** Any assignment operator, prefix/postfix `++`/`--` (identifier or property
 * target), or destructuring-assignment write that targets `name` or a
 * property of `name`, anywhere in the same function scope (not crossing into
 * nested function bodies). */
function hasReassignmentOrMutation(funcScope, name) {
  let found = false;
  const walk = (node) => {
    if (found) return;
    if (isFunctionLike(node) && node !== funcScope) return;
    if (ts.isBinaryExpression(node) && ASSIGN_OPS.has(node.operatorToken.kind)) {
      const lhs = node.left;
      if (ts.isIdentifier(lhs) && lhs.text === name) {
        found = true;
        return;
      }
      if (ts.isPropertyAccessExpression(lhs) || ts.isElementAccessExpression(lhs)) {
        if (targetsName(lhs.expression, name)) {
          found = true;
          return;
        }
      }
      if (node.operatorToken.kind === ts.SyntaxKind.EqualsToken && (ts.isObjectLiteralExpression(lhs) || ts.isArrayLiteralExpression(lhs))) {
        if (destructuringTargetsName(lhs, name)) {
          found = true;
          return;
        }
      }
    }
    if (ts.isPrefixUnaryExpression(node) || ts.isPostfixUnaryExpression(node)) {
      const INC_DEC = new Set([ts.SyntaxKind.PlusPlusToken, ts.SyntaxKind.MinusMinusToken]);
      if (INC_DEC.has(node.operator)) {
        const operand = node.operand;
        if (ts.isIdentifier(operand) && operand.text === name) {
          found = true;
          return;
        }
        if ((ts.isPropertyAccessExpression(operand) || ts.isElementAccessExpression(operand)) && targetsName(operand.expression, name)) {
          found = true;
          return;
        }
      }
    }
    // P0-4 / independent-final blocker 3: `delete base['--ds-x']` (or
    // `delete base.x`) is a mutation of `base`'s shape capable of removing an
    // emitted channel or invalidating a claimed closure -- it was previously
    // undetected, letting a deleted-then-still-referenced object appear
    // falsely closed.
    if (ts.isDeleteExpression(node)) {
      const target = node.expression;
      if ((ts.isPropertyAccessExpression(target) || ts.isElementAccessExpression(target)) && targetsName(target.expression, name)) {
        found = true;
        return;
      }
    }
    ts.forEachChild(node, walk);
  };
  walk(funcScope);
  return found;
}
function nearestFunctionOrSource(node) {
  let c = node;
  while (c && !isFunctionLike(c) && !ts.isSourceFile(c)) c = c.parent;
  return c;
}

/* ------------------------------------------- typed relay closure (AST) --- */
/**
 * T-TYPED-RELAY -- prove from the TYPE ANNOTATION alone that a value can never
 * be an object.
 *
 * The resolver already closes a leaf when the VALUE's syntax proves it is a
 * non-object (T-NO-68, on `SyntaxKind`). This is the same principle applied to
 * the declared TYPE: a parameter annotated `string`, or a callee whose return
 * type is written `number | undefined`, cannot deliver a style object, so the
 * relay is a proven non-object rather than an unexamined passthrough.
 *
 * The proof is 100% syntactic -- no type checker, no inference, no allowlist,
 * no name heuristics. Everything that is not exhaustively proven stays OPEN:
 * interfaces, object/array/tuple types, `any`, `unknown`, `never`, function
 * types, mixed unions, an unsealed type reference, and a missing annotation.
 *
 * A type REFERENCE is followed only when it resolves to a SEALED type alias --
 * a local `type X = ...`, or one reached through a real import binding -- and
 * the alias body itself passes this same predicate. An interface never
 * qualifies: an interface names an object.
 */
const PRIMITIVE_TYPE_KEYWORDS = new Set([
  ts.SyntaxKind.StringKeyword,
  ts.SyntaxKind.NumberKeyword,
  ts.SyntaxKind.BooleanKeyword,
]);
const NULLISH_TYPE_KEYWORDS = new Set([ts.SyntaxKind.UndefinedKeyword, ts.SyntaxKind.NullKeyword, ts.SyntaxKind.VoidKeyword]);

function literalTypeIsPrimitive(literal) {
  if (!literal) return false;
  if (ts.isStringLiteralLike(literal) || ts.isNumericLiteral(literal)) return true;
  if (literal.kind === ts.SyntaxKind.TrueKeyword || literal.kind === ts.SyntaxKind.FalseKeyword) return true;
  if (literal.kind === ts.SyntaxKind.NullKeyword) return true;
  // `-1` arrives as a prefix unary over a numeric literal
  if (ts.isPrefixUnaryExpression(literal) && ts.isNumericLiteral(literal.operand)) return true;
  return false;
}

/** Find a SEALED type alias declaration for `name`, locally or through an import. */
function resolveSealedTypeAlias(name, source, depth) {
  if (depth > 8) return null;
  for (const stmt of source.statements) {
    if (ts.isTypeAliasDeclaration(stmt) && stmt.name.text === name) return { typeNode: stmt.type, source };
    // an interface with this name is a definitive NEGATIVE: it names an object
    if (ts.isInterfaceDeclaration(stmt) && stmt.name.text === name) return null;
  }
  const imports = collectModuleImports(source);
  const imported = imports.get(name);
  // only a real named import is followed; namespace/default forms are not proven
  if (!imported || imported.form !== "named") return null;
  const targetFile = resolveImportTargetFile(imported.moduleSpecifier, source.fileName);
  if (!targetFile) return null;
  const entry = getSource(targetFile);
  if (!entry) return null;
  const wanted = imported.importedName ?? name;
  for (const stmt of entry.source.statements) {
    if (ts.isTypeAliasDeclaration(stmt) && stmt.name.text === wanted) {
      return { typeNode: stmt.type, source: entry.source };
    }
    if (ts.isInterfaceDeclaration(stmt) && stmt.name.text === wanted) return null;
  }
  // a re-export chain is followed one hop through the target's own imports
  return resolveSealedTypeAlias(wanted, entry.source, depth + 1);
}

function isPrimitiveCssScalarTypeNode(typeNode, source, depth = 0, seen = new Set()) {
  if (!typeNode || depth > 8) return false;
  if (ts.isParenthesizedTypeNode(typeNode)) return isPrimitiveCssScalarTypeNode(typeNode.type, source, depth + 1, seen);
  if (PRIMITIVE_TYPE_KEYWORDS.has(typeNode.kind)) return true;
  if (NULLISH_TYPE_KEYWORDS.has(typeNode.kind)) return true;
  if (ts.isLiteralTypeNode(typeNode)) return literalTypeIsPrimitive(typeNode.literal);
  if (ts.isUnionTypeNode(typeNode)) {
    return typeNode.types.length > 0 && typeNode.types.every((t) => isPrimitiveCssScalarTypeNode(t, source, depth + 1, seen));
  }
  if (ts.isTypeReferenceNode(typeNode) && ts.isIdentifier(typeNode.typeName)) {
    // a generic instantiation is never proven primitive
    if (typeNode.typeArguments && typeNode.typeArguments.length > 0) return false;
    const key = `${source.fileName}::${typeNode.typeName.text}`;
    if (seen.has(key)) return false; // alias cycle -> fail closed
    seen.add(key);
    const alias = resolveSealedTypeAlias(typeNode.typeName.text, source, depth);
    if (!alias) return false;
    return isPrimitiveCssScalarTypeNode(alias.typeNode, alias.source, depth + 1, seen);
  }
  return false;
}

/* ------------------------------ static sequential assignment (T-SEQ-8) --- */
/**
 * T-SEQUENTIAL-8 -- resolve `const X = {}` followed by a fixed, exhaustively
 * proven sequence of property writes.
 *
 * `hasReassignmentOrMutation` is a deliberately COARSE detector: any write to a
 * local aborts resolution. That is the right default, but it also refuses a
 * shape that is fully decidable -- an empty literal filled by single-armed
 * `if (cond) X.key = expr;` statements is exactly the procedural spelling of
 * `...(cond ? { key: expr } : {})`, which this resolver already models. This
 * pass proves that narrow form and builds the SAME `branches` shape; the coarse
 * detector is untouched and every unproven form still falls through to it.
 *
 * ADMITTED, and nothing else:
 *   - initializer is an object literal with ZERO properties (no key, no spread);
 *   - a single, bare `return X;` and no statement after it;
 *   - every statement mentioning X is either `X.key = expr;` at statement level,
 *     or `if (cond) X.key = expr;` / `if (cond) { X.key = expr; }` with NO else
 *     and exactly that one statement in the body, and `cond` not mentioning X;
 *   - each key written at most ONCE across the whole function;
 *   - keys are static (identifier, string literal or numeric literal).
 *
 * Everything else fails closed and returns null: alias or escape of X (passed
 * to a call -- `Object.assign(X, …)` included -- spread, read in a condition,
 * assigned elsewhere), reassignment of X, a repeated key, a computed key,
 * `delete`, any write inside a loop, any `if` carrying an else/else-if, a
 * multi-statement if body, a switch/try, several returns, or a return that is
 * not the bare identifier.
 */
/** A key is static only in the position where it is written literally. */
function staticPropertyKeyOf(nameNode) {
  // `X.key` -- the identifier IS the key
  if (ts.isIdentifier(nameNode)) return nameNode.text;
  if (ts.isStringLiteralLike(nameNode) || ts.isNumericLiteral(nameNode)) return nameNode.text;
  return null;
}

/** `X[expr]` -- ONLY a literal is a key. An identifier here is a COMPUTED key
 *  whose value is unknown, and must never be treated as the literal name. */
function staticElementKeyOf(argumentExpression) {
  if (!argumentExpression) return null;
  if (ts.isStringLiteralLike(argumentExpression) || ts.isNumericLiteral(argumentExpression)) return argumentExpression.text;
  return null;
}

/** Does this subtree mention `name` at all? */
function mentionsName(node, name) {
  let hit = false;
  const walk = (n) => {
    if (hit || !n) return;
    if (ts.isIdentifier(n) && n.text === name) { hit = true; return; }
    ts.forEachChild(n, walk);
  };
  walk(node);
  return hit;
}

/** `X.key` / `X['key']` with a static key, else null. */
function staticWriteTargetOf(expr, name, source) {
  if (ts.isPropertyAccessExpression(expr) && ts.isIdentifier(expr.expression) && expr.expression.text === name) {
    return staticPropertyKeyOf(expr.name);
  }
  if (ts.isElementAccessExpression(expr) && ts.isIdentifier(expr.expression) && expr.expression.text === name) {
    return staticElementKeyOf(expr.argumentExpression);
  }
  return null;
}

/** `X.key = expr;` at statement level -> {key, valueNode}, else null. */
function simpleWriteStatement(stmt, name, source) {
  if (!ts.isExpressionStatement(stmt)) return null;
  const e = stmt.expression;
  if (!ts.isBinaryExpression(e) || e.operatorToken.kind !== ts.SyntaxKind.EqualsToken) return null;
  const key = staticWriteTargetOf(e.left, name, source);
  if (key === null) return null;
  // the VALUE must not mention X either (that would be a read/alias)
  if (mentionsName(e.right, name)) return null;
  return { key, valueNode: e.right, statement: stmt };
}

function resolveStaticSequentialAssignmentShape(binding, ctx, path, depth) {
  const { name, declNode, funcScope, source } = binding;
  if (!name || !declNode || !funcScope || !source) return null;
  const init = declNode.initializer;
  if (!init || !ts.isObjectLiteralExpression(init) || init.properties.length !== 0) return null;

  // the statement list that holds the declaration
  const body = ts.isSourceFile(funcScope) ? funcScope : funcScope.body;
  if (!body || !ts.isBlock(body)) return null;
  const statements = [...body.statements];
  const declStmtIndex = statements.findIndex((st) => st === declNode.parent?.parent);
  if (declStmtIndex < 0) return null;

  // The walk below SKIPS the declaration statement, so anything else declared in
  // that same list -- an alias `const s = {}, t = s;`, a closure `g = () => { s
  // [...] }` -- would never be inspected. Only a statement whose ONE declarator
  // is X may be skipped; any sibling declarator is an unproven form.
  const declStmt = statements[declStmtIndex];
  if (!ts.isVariableStatement(declStmt)) return null;
  const declSiblings = declStmt.declarationList.declarations;
  if (declSiblings.length !== 1 || declSiblings[0] !== declNode) return null;
  // `var` hoists: a write may execute BEFORE the declaration statement, which the
  // textual decl-to-return walk does not model. The proven form is `const X = {}`;
  // `let` shares the same declaration-before-use ordering. `var` is never proven.
  if ((declStmt.declarationList.flags & (ts.NodeFlags.Const | ts.NodeFlags.Let)) === 0) return null;

  const writes = [];
  const seenKeys = new Set();
  let returned = false;

  for (let i = 0; i < statements.length; i += 1) {
    const stmt = statements[i];
    if (i === declStmtIndex) continue;
    if (returned) return null; // nothing may follow the return

    if (ts.isReturnStatement(stmt)) {
      // must be the bare identifier, and the only return in the scope
      if (!stmt.expression || !ts.isIdentifier(stmt.expression) || stmt.expression.text !== name) return null;
      returned = true;
      continue;
    }
    if (!mentionsName(stmt, name)) continue;

    // (A) unconditional write
    const direct = simpleWriteStatement(stmt, name, source);
    if (direct) {
      if (seenKeys.has(direct.key)) return null; // a key may be written once
      seenKeys.add(direct.key);
      writes.push({ ...direct, conditional: false, conditionText: null });
      continue;
    }
    // (B) single-armed conditional write
    if (ts.isIfStatement(stmt) && !stmt.elseStatement && !mentionsName(stmt.expression, name)) {
      const inner = ts.isBlock(stmt.thenStatement)
        ? (stmt.thenStatement.statements.length === 1 ? stmt.thenStatement.statements[0] : null)
        : stmt.thenStatement;
      const write = inner ? simpleWriteStatement(inner, name, source) : null;
      if (write) {
        if (seenKeys.has(write.key)) return null;
        seenKeys.add(write.key);
        writes.push({
          ...write,
          statement: stmt,
          conditional: true,
          conditionText: stmt.expression.getText(source).slice(0, 120).replace(/\s+/g, " "),
        });
        continue;
      }
    }
    // any other statement that mentions X is an unproven form
    return null;
  }

  if (!returned || writes.length === 0) return null;
  // every return in the whole scope must be the one we accepted
  let returnCount = 0;
  const countReturns = (n) => {
    if (!n) return;
    if (isFunctionLike(n) && n !== funcScope) return;
    if (ts.isReturnStatement(n)) returnCount += 1;
    ts.forEachChild(n, countReturns);
  };
  countReturns(body);
  if (returnCount !== 1) return null;

  const stepPath = [...path, { kind: "sequentialAssignment", declaredAt: binding.declaredAt }];
  const order = [];
  const receipts = [];
  for (const w of writes) {
    const valueShape = resolveShape(w.valueNode, freshCtx(ctx, { depth: depth + 1, path: [...stepPath, { kind: "objectProperty", key: w.key }] }));
    const at = `${source.fileName}:${source.getLineAndCharacterOfPosition(w.statement.getStart(source)).line + 1}`;
    receipts.push({ key: w.key, at, conditional: w.conditional, condition: w.conditionText });
    if (!w.conditional) {
      order.push({ kind: "leaf", key: w.key, node: w.valueNode, source, fileRel: source.fileName, declNode: w.statement, shape: valueShape, unresolvedKey: false });
      continue;
    }
    // the SAME shape `...(cond ? {key: v} : {})` already produces
    const present = { kind: "object", order: [{ kind: "leaf", key: w.key, node: w.valueNode, source, fileRel: source.fileName, declNode: w.statement, shape: valueShape, unresolvedKey: false }], closed: isShapeClosed(valueShape), path: stepPath, node: init, fileRel: source.fileName };
    const absent = { kind: "object", order: [], closed: true, path: stepPath, node: init, fileRel: source.fileName };
    order.push({ kind: "spread", node: w.statement, shape: { kind: "branches", branches: [present, absent], path: stepPath } });
  }
  const closed = order.every(entryIsClosed);
  return {
    kind: "object",
    order,
    closed,
    path: stepPath,
    node: init,
    fileRel: source.fileName,
    sequentialAssignment: {
      binding: name,
      declaredAt: binding.declaredAt,
      returnAt: `${source.fileName}:${source.getLineAndCharacterOfPosition(statements[statements.length - 1].getStart(source)).line + 1}`,
      writeCount: receipts.length,
      writes: receipts,
    },
  };
}

/* ------------------------------------------------------- binding lookup --- */
function resolveBinding(name, useNode, source, moduleImports) {
  let current = useNode;
  let crossedFunctionBoundary = false;
  const useStart = useNode.getStart(source);

  while (current) {
    if (isFunctionLike(current)) {
      for (const param of current.parameters) {
        for (const leaf of paramLeaves(param)) {
          if (leaf.name === name) {
            const ownerName =
              ts.isFunctionDeclaration(current) && current.name ? current.name.text : enclosingSymbol(current);
            return {
              kind: "param",
              isDestructured: leaf.isDestructured,
              isRest: !!leaf.isRest,
              ownerFunctionNode: current,
              ownerFunction: ownerName,
              declaredAt: `${source.fileName}:${source.getLineAndCharacterOfPosition(param.getStart(source)).line + 1}`,
              paramText: param.getText(source).slice(0, 100),
              // T-TYPED-RELAY: only a NON-destructured parameter carries its own
              // annotation. A destructured one is typed by the pattern's type,
              // whose property signatures live on an interface/type literal --
              // never proven primitive here.
              declaredType: leaf.isDestructured ? null : (param.type ?? null),
              declaredTypeSource: leaf.isDestructured ? null : source,
              defaultInit: leaf.defaultInit,
            };
          }
        }
      }
      crossedFunctionBoundary = true;
    }
    if (ts.isBlock(current) || ts.isSourceFile(current)) {
      for (const stmt of current.statements) {
        if (ts.isFunctionDeclaration(stmt) && stmt.name?.text === name && stmt.body) {
          return { kind: "hoistedFunction", node: stmt, declaredAt: `${source.fileName}:${source.getLineAndCharacterOfPosition(stmt.getStart(source)).line + 1}` };
        }
        if (!ts.isVariableStatement(stmt)) continue;
        const isConstOrLet = (stmt.declarationList.flags & (ts.NodeFlags.Const | ts.NodeFlags.Let)) !== 0;
        for (const decl of stmt.declarationList.declarations) {
          const declStart = decl.getStart(source);
          const tdzOk = !isConstOrLet || crossedFunctionBoundary || declStart < useStart;
          if (ts.isIdentifier(decl.name) && decl.name.text === name) {
            if (!tdzOk) continue;
            if (!decl.initializer) return { kind: "uninitializedLocal", declaredAt: `${source.fileName}:${source.getLineAndCharacterOfPosition(declStart).line + 1}` };
            const mutated = hasReassignmentOrMutation(current === source ? current : nearestFunctionOrSource(current), name);
            return {
              kind: "localConst",
              node: decl.initializer,
              declaredAt: `${source.fileName}:${source.getLineAndCharacterOfPosition(declStart).line + 1}`,
              mutated,
              // T-SEQUENTIAL-8: what the fine-grained pass needs to walk the
              // scope. `mutated` stays the coarse detector; it only decides
              // whether the fine pass is worth attempting.
              name,
              declNode: decl,
              funcScope: current === source ? current : nearestFunctionOrSource(current),
              source,
            };
          }
          if ((ts.isObjectBindingPattern(decl.name) || ts.isArrayBindingPattern(decl.name)) && decl.initializer) {
            if (!tdzOk) continue;
            for (const el of decl.name.elements) {
              if (ts.isOmittedExpression(el)) continue;
              if (ts.isIdentifier(el.name) && el.name.text === name) {
                const mutated = hasReassignmentOrMutation(current === source ? current : nearestFunctionOrSource(current), name);
                return {
                  kind: "destructuredLocal",
                  sourceExpr: decl.initializer,
                  key: el.propertyName && ts.isIdentifier(el.propertyName) ? el.propertyName.text : name,
                  defaultInit: el.initializer ?? null,
                  isRest: !!el.dotDotDotToken,
                  declaredAt: `${source.fileName}:${source.getLineAndCharacterOfPosition(decl.getStart(source)).line + 1}`,
                  mutated,
                };
              }
            }
          }
        }
      }
    }
    current = current.parent;
  }
  if (moduleImports.has(name)) return { kind: "import", ...moduleImports.get(name) };
  return null;
}

/* ----------------------------------------------------- cross-file import --- */
function resolveImportTargetFile(moduleSpecifier, fromFileRel) {
  let base;
  if (moduleSpecifier.startsWith("@/")) {
    base = join(ALIAS_ROOT, moduleSpecifier.slice(2));
  } else if (moduleSpecifier.startsWith(".")) {
    base = pathResolve(dirname(join(REPO_ABS, fromFileRel)), moduleSpecifier);
  } else {
    return null;
  }
  const candidates = [`${base}.ts`, `${base}.tsx`, join(base, "index.ts"), join(base, "index.tsx")];
  for (const c of candidates) if (existsSync(c)) return relative(REPO_ABS, c);
  return null;
}

function findExportedDecl(targetSource, importedName, form) {
  for (const stmt of targetSource.statements) {
    const hasExportModifier = (stmt.modifiers ?? []).some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
    if (ts.isVariableStatement(stmt) && hasExportModifier) {
      for (const decl of stmt.declarationList.declarations) {
        if (ts.isIdentifier(decl.name) && decl.name.text === importedName && decl.initializer) {
          return { kind: "namedConst", node: decl.initializer };
        }
      }
    }
    if (ts.isFunctionDeclaration(stmt) && hasExportModifier && stmt.name?.text === importedName && stmt.body) {
      return { kind: "namedFunction", node: stmt };
    }
    if (form === "default" && ts.isExportAssignment(stmt) && !stmt.isExportEquals) {
      return { kind: "default", node: stmt.expression };
    }
    if (ts.isExportDeclaration(stmt) && stmt.moduleSpecifier && stmt.exportClause && ts.isNamedExports(stmt.exportClause)) {
      for (const el of stmt.exportClause.elements) {
        if (el.name.text === importedName) {
          return { kind: "reExport", moduleSpecifier: ts.isStringLiteralLike(stmt.moduleSpecifier) ? stmt.moduleSpecifier.text : null, importedName: (el.propertyName ?? el.name).text };
        }
      }
    }
    // local export list without a module specifier: `export { A as B };`
    if (ts.isExportDeclaration(stmt) && !stmt.moduleSpecifier && stmt.exportClause && ts.isNamedExports(stmt.exportClause)) {
      for (const el of stmt.exportClause.elements) {
        if (el.name.text === importedName) {
          const localName = (el.propertyName ?? el.name).text;
          return findExportedDecl(targetSource, localName, form) ?? findLocalDecl(targetSource, localName);
        }
      }
    }
  }
  return null;
}

/** A plain (non-exported-modifier) local declaration, needed when a name is
 * exported only via a separate `export { X }` list rather than inline. */
function findLocalDecl(targetSource, name) {
  for (const stmt of targetSource.statements) {
    if (ts.isVariableStatement(stmt)) {
      for (const decl of stmt.declarationList.declarations) {
        if (ts.isIdentifier(decl.name) && decl.name.text === name && decl.initializer) {
          return { kind: "namedConst", node: decl.initializer };
        }
      }
    }
    if (ts.isFunctionDeclaration(stmt) && stmt.name?.text === name && stmt.body) {
      return { kind: "namedFunction", node: stmt };
    }
  }
  return null;
}

/* --------------------------------------------------- domain enumeration --- */
function enumerateKeyDomainByType(keyNode, useNode, source) {
  if (!ts.isIdentifier(keyNode)) return null;
  const binding = resolveBinding(keyNode.text, useNode, source, new Map());
  if (!binding) return null;
  let typeNode = null;
  if (binding.kind === "param") {
    let cur = useNode;
    while (cur) {
      if (isFunctionLike(cur)) {
        for (const p of cur.parameters) {
          for (const leaf of paramLeaves(p)) if (leaf.name === keyNode.text && p.type) typeNode = p.type;
        }
      }
      cur = cur.parent;
    }
  }
  if (binding.kind === "localConst" || binding.kind === "destructuredLocal") {
    let cur = useNode;
    while (cur) {
      if (ts.isBlock(cur) || ts.isSourceFile(cur)) {
        for (const stmt of cur.statements) {
          if (!ts.isVariableStatement(stmt)) continue;
          for (const decl of stmt.declarationList.declarations) {
            if (ts.isIdentifier(decl.name) && decl.name.text === keyNode.text && decl.type) typeNode = decl.type;
          }
        }
      }
      cur = cur.parent;
    }
  }
  if (!typeNode || !ts.isUnionTypeNode(typeNode)) return null;
  const literals = [];
  for (const member of typeNode.types) {
    if (ts.isLiteralTypeNode(member) && ts.isStringLiteralLike(member.literal)) literals.push(member.literal.text);
    else return null;
  }
  return literals.length ? literals : null;
}

/**
 * T-COMPUTED-DOMAIN -- enumerate the domain of `OBJ[k]` from the CONTAINER
 * instead of from the index's declared type.
 *
 * `enumerateKeyDomainByType` can only read an inline literal-union annotation on
 * the index, which almost nothing in this tree carries (the types are named
 * aliases). But the domain of the LOOKUP does not actually depend on the
 * index's type at all: if the container is a sealed object literal whose keys
 * are all static literals, then `OBJ[k]` can only ever be one of its authored
 * values -- or, when `k` is outside that key set, `undefined`. Both halves are
 * enumerable from the container alone, with no type inference whatsoever.
 *
 * SEALED means, strictly: an object literal shape, with NO spread entry (a
 * spread imports keys this walk cannot enumerate), NO computed/unresolved key,
 * and every key a real static literal. Anything else returns null and the row
 * stays blocking.
 *
 * The `undefined` half is NOT optional. Nothing here proves `k` is confined to
 * the container's keys, so an explicit `absent` branch is always appended:
 * `indexMayEscape` records that, and the branch is a `nonObject`, which carries
 * no key and therefore cannot manufacture a governed channel.
 */
function enumerateKeyDomainByContainer(objShape) {
  if (!objShape || objShape.kind !== "object" || !Array.isArray(objShape.order)) return null;
  const members = [];
  const seen = new Set();
  for (const entry of objShape.order) {
    // a spread brings in keys from elsewhere: the key set is NOT enumerable here
    if (entry.kind !== "leaf") return null;
    if (entry.unresolvedKey) return null;
    if (typeof entry.key !== "string" || entry.key.length === 0) return null;
    /* P1a -- `__proto__` in an object literal is NOT an own property: it sets
     * the prototype. Enumerating it as a member would invent a key the object
     * does not have, and treating a lookup that misses it as `absent` would be
     * wrong too, because the prototype it installed can answer that lookup.
     * The whole container is therefore refused. */
    if (entry.key === "__proto__") return null;
    if (seen.has(entry.key)) continue; // later duplicate wins in JS; the key set is unchanged
    seen.add(entry.key);
    members.push(entry.key);
  }
  if (members.length === 0) return null;
  const sourceFile = objShape.node ? objShape.node.getSourceFile() : null;
  const start = objShape.node && sourceFile ? objShape.node.getStart(sourceFile) : null;
  const text = objShape.node && sourceFile ? objShape.node.getText(sourceFile) : null;
  return {
    domainKind: "sealed-container-keys",
    members,
    indexMayEscape: true,
    declaration: {
      file: objShape.fileRel ?? (sourceFile ? sourceFile.fileName : null),
      line: objShape.node && sourceFile ? sourceFile.getLineAndCharacterOfPosition(start).line + 1 : null,
      span: objShape.node && sourceFile ? [start, objShape.node.getEnd()] : null,
      sha256: text ? createHash("sha256").update(text, "utf8").digest("hex") : null,
      memberCount: members.length,
    },
  };
}

/* ================================================== the Shape resolver === */
const NONOBJECT_KINDS = new Set([
  ts.SyntaxKind.StringLiteral,
  ts.SyntaxKind.NoSubstitutionTemplateLiteral,
  ts.SyntaxKind.NumericLiteral,
  ts.SyntaxKind.TrueKeyword,
  ts.SyntaxKind.FalseKeyword,
  ts.SyntaxKind.NullKeyword,
]);

/** Returns { key: string|null } style descriptor -- `key===null` marks a
 * property whose name could not be resolved to a literal string (a computed
 * key whose expression is not itself a string literal). */
function customPropertyKeyOfName(name, source) {
  if (!name) return null;
  if (ts.isIdentifier(name)) return name.text;
  if (ts.isStringLiteralLike(name)) return name.text;
  if (ts.isComputedPropertyName(name)) {
    let expression = name.expression;
    while (ts.isAsExpression(expression) || ts.isParenthesizedExpression(expression)) expression = expression.expression;
    if (ts.isStringLiteralLike(expression)) return expression.text;
  }
  return null;
}

function freshCtx(base, overrides) {
  return { ...base, ...overrides };
}

/**
 * Resolve `node` (an expression) to a Shape, from the lexical position
 * `node` itself occupies in `ctx.source`/`ctx.fileRel`.
 */
export function resolveShape(node, ctx) {
  const depth = ctx.depth ?? 0;
  const path = ctx.path ?? [];
  const source = ctx.source;
  const fileRel = ctx.fileRel;
  const substitution = ctx.substitution ?? new Map();
  const visitedCalls = ctx.visitedCalls ?? new Set();

  if (depth > 24) return { kind: "openUnknown", reason: "depth-budget-exceeded", path };

  const n = unwrap(node);
  if (!n) return { kind: "openUnknown", reason: "empty-node", path };

  if (NONOBJECT_KINDS.has(n.kind)) return { kind: "nonObject", reason: `literal-kind:${ts.SyntaxKind[n.kind]}`, path };
  if (ts.isIdentifier(n) && n.text === "undefined") return { kind: "nonObject", reason: "undefined-keyword", path };
  if (ts.isPrefixUnaryExpression(n)) return { kind: "nonObject", reason: "prefix-unary-not-object", path };
  if (ts.isTemplateExpression(n)) return { kind: "nonObject", reason: "template-expression-css-string", path };
  if (ts.isArrayLiteralExpression(n)) {
    // Independent-final blocker 1 / X8.1 "asObjectLike ... objetos y arrays
    // anidados": an array literal is transparent, not an opaque nonObject --
    // a CSS-array element CAN itself be an object literal carrying a custom
    // property, and that must remain scannable at any depth. `SpreadElement`
    // entries resolve their spread source the same way object spreads do.
    const elements = n.elements.map((el, childIndex) => {
      if (ts.isSpreadElement(el)) {
        return { kind: "spread", shape: resolveShape(el.expression, freshCtx(ctx, { depth: depth + 1, path: [...path, { kind: "arraySpread", index: childIndex }] })), node: el };
      }
      if (ts.isOmittedExpression(el)) return { kind: "element", shape: { kind: "nonObject", reason: "array-hole", path }, node: el };
      return { kind: "element", shape: resolveShape(el, freshCtx(ctx, { depth: depth + 1, path: [...path, { kind: "arrayElement", index: childIndex }] })), node: el };
    });
    const closed = elements.every((e) => isShapeClosed(e.shape));
    return { kind: "array", elements, closed, path, node: n, fileRel };
  }

  if (ts.isObjectLiteralExpression(n)) {
    const order = [];
    for (const property of n.properties) {
      if (ts.isSpreadAssignment(property)) {
        const spreadShape = resolveShape(property.expression, freshCtx(ctx, { depth: depth + 1, path: [...path, { kind: "objectSpread" }] }));
        order.push({ kind: "spread", shape: spreadShape, node: property });
        continue;
      }
      if (
        ts.isGetAccessorDeclaration(property) ||
        ts.isSetAccessorDeclaration(property) ||
        ts.isMethodDeclaration(property) ||
        !(ts.isPropertyAssignment(property) || ts.isShorthandPropertyAssignment(property))
      ) {
        /* P1b -- a member kind this walk does not model (getter, setter,
         * method, or anything a future TypeScript grammar adds) must NEVER be
         * skipped silently: dropping it would let the object look sealed while
         * an unseen member decides the value. It is recorded as an OPEN SPREAD
         * entry, which is the honest reading -- "a member is here whose keys and
         * value this walk cannot account for". That single representation makes
         * `entryIsClosed` false, makes `readProperty` return `open`, makes
         * `scanClosedShape` mark the scan incomplete, and makes
         * `enumerateKeyDomainByContainer` refuse the container. A getter is
         * never evaluated. */
        order.push({
          kind: "spread",
          node: property,
          shape: {
            kind: "openUnknown",
            reason: `object-member-kind-not-modelled:${ts.SyntaxKind[property.kind]}`,
            path: [...path, { kind: "unmodelledObjectMember" }],
          },
        });
        continue;
      }
      if (ts.isPropertyAssignment(property) || ts.isShorthandPropertyAssignment(property)) {
        const key = customPropertyKeyOfName(property.name, source);
        // P0-2 support: a computed key that did not resolve to a literal
        // string can never be proven not to name a governed channel at
        // runtime -- flag it so `entryIsClosed` refuses to close over it
        // regardless of how simple its value looks.
        const unresolvedKey = key === null && ts.isComputedPropertyName(property.name);
        const valueNode = ts.isShorthandPropertyAssignment(property) ? property.name : property.initializer;
        const valueShape = resolveShape(valueNode, freshCtx(ctx, { depth: depth + 1, path: [...path, { kind: "objectProperty", key: key ?? "(non-channel-key)" }] }));
        order.push({ kind: "leaf", key, node: valueNode, source, fileRel, declNode: property, shape: valueShape, unresolvedKey });
      }
    }
    const closed = order.every(entryIsClosed);
    return { kind: "object", order, closed, path, node: n, fileRel };
  }

  if (ts.isConditionalExpression(n)) {
    const t = resolveShape(n.whenTrue, freshCtx(ctx, { depth: depth + 1, path: [...path, { kind: "ternary-true" }] }));
    const f = resolveShape(n.whenFalse, freshCtx(ctx, { depth: depth + 1, path: [...path, { kind: "ternary-false" }] }));
    return { kind: "branches", branches: [t, f], path };
  }
  if (ts.isBinaryExpression(n)) {
    const op = n.operatorToken.kind;
    if (op === ts.SyntaxKind.AmpersandAmpersandToken) {
      const guardFalse = { kind: "nonObject", reason: "guard-falsy-branch", path: [...path, { kind: "logical-and-guard" }] };
      const rhs = resolveShape(n.right, freshCtx(ctx, { depth: depth + 1, path: [...path, { kind: "logical-and-rhs" }] }));
      return { kind: "branches", branches: [guardFalse, rhs], path };
    }
    if (op === ts.SyntaxKind.BarBarToken || op === ts.SyntaxKind.QuestionQuestionToken) {
      const l = resolveShape(n.left, freshCtx(ctx, { depth: depth + 1, path: [...path, { kind: "logical-primary" }] }));
      const r = resolveShape(n.right, freshCtx(ctx, { depth: depth + 1, path: [...path, { kind: "logical-fallback" }] }));
      return { kind: "branches", branches: [l, r], path };
    }
    return { kind: "nonObject", reason: `binary-op:${ts.SyntaxKind[op]}`, path };
  }

  if (ts.isIdentifier(n)) {
    if (substitution.has(n.text)) {
      const sub = substitution.get(n.text);
      if (sub.precomputedShape) return { ...sub.precomputedShape, path: [...path, { kind: "argSubstitution", param: n.text }] };
      return resolveShape(sub.node, freshCtx({ ...ctx, source: sub.source, fileRel: sub.fileRel, substitution: sub.callerSubstitution ?? new Map() }, { depth: depth + 1, path: [...path, { kind: "argSubstitution", param: n.text }] }));
    }
    const moduleImports = collectModuleImports(source);
    const binding = resolveBinding(n.text, n, source, moduleImports);
    if (!binding) return { kind: "openUnknown", reason: "no-binding-in-scope", path: [...path, { kind: "identifier", name: n.text }] };

    if (binding.kind === "param") {
      const stepPath = [...path, { kind: binding.isDestructured ? "destructuredParam" : "directParam", name: n.text, declaredAt: binding.declaredAt, ownerFunction: binding.ownerFunction }];
      if (binding.isRest) return { kind: "callArgsPending", reason: "rest-parameter-substitution-not-implemented", path: stepPath };
      /* T-TYPED-RELAY: the annotation alone can prove this value is never an
       * object. Only a syntactically primitive CSS scalar qualifies; anything
       * unproven falls through to the relay exactly as before. */
      if (
        binding.declaredType &&
        binding.declaredTypeSource &&
        isPrimitiveCssScalarTypeNode(binding.declaredType, binding.declaredTypeSource)
      ) {
        return {
          kind: "nonObject",
          reason: "typed-relay-primitive",
          typedRelay: {
            origin: "parameter",
            ownerFunction: binding.ownerFunction ?? null,
            declaredAt: binding.declaredAt ?? null,
            typeText: binding.declaredType.getText(binding.declaredTypeSource).slice(0, 120),
          },
          path: stepPath,
        };
      }
      const relayShape = { kind: "relay", binding, path: stepPath };
      if (binding.defaultInit) {
        const def = resolveShape(binding.defaultInit, freshCtx(ctx, { depth: depth + 1, path: stepPath }));
        return { kind: "branches", branches: [relayShape, def], path: stepPath };
      }
      return relayShape;
    }
    if (binding.kind === "hoistedFunction") return { kind: "nonObject", reason: "identifier-is-a-function-value", path: [...path, { kind: "hoistedFunction", name: n.text }] };
    if (binding.kind === "uninitializedLocal") return { kind: "openUnknown", reason: "uninitialized-local-let", path: [...path, { kind: "uninitializedLocal", declaredAt: binding.declaredAt }] };
    if (binding.kind === "localConst") {
      if (binding.mutated) {
        // T-SEQUENTIAL-8: try the fine-grained, fail-closed pass first; any
        // unproven form falls straight through to the existing bail-out.
        const sequential = resolveStaticSequentialAssignmentShape(binding, ctx, path, depth);
        if (sequential) return sequential;
        return { kind: "openUnknown", reason: "reassignment-or-mutation-present", path: [...path, { kind: "localConst-mutated", declaredAt: binding.declaredAt }] };
      }
      return resolveShape(binding.node, freshCtx(ctx, { depth: depth + 1, path: [...path, { kind: "localConst", declaredAt: binding.declaredAt }] }));
    }
    if (binding.kind === "destructuredLocal") {
      if (binding.isRest) return { kind: "callArgsPending", reason: "rest-destructure-not-implemented", path: [...path, { kind: "destructuredLocal-rest", declaredAt: binding.declaredAt }] };
      if (binding.mutated) return { kind: "openUnknown", reason: "reassignment-or-mutation-present", path: [...path, { kind: "destructuredLocal-mutated", declaredAt: binding.declaredAt }] };
      const srcShape = resolveShape(binding.sourceExpr, freshCtx(ctx, { depth: depth + 1, path: [...path, { kind: "destructuredLocal-source", key: binding.key, declaredAt: binding.declaredAt }] }));
      const lookup = readProperty(srcShape, binding.key);
      if (lookup.status === "found") {
        if (binding.defaultInit) {
          const def = resolveShape(binding.defaultInit, freshCtx(ctx, { depth: depth + 1, path: lookup.path }));
          return { kind: "branches", branches: [lookup.valueShape, def], path: lookup.path };
        }
        return lookup.valueShape;
      }
      if (lookup.status === "absent") {
        if (binding.defaultInit) return resolveShape(binding.defaultInit, freshCtx(ctx, { depth: depth + 1, path: lookup.path }));
        return { kind: "nonObject", reason: "property-absent-from-resolved-object", path: lookup.path };
      }
      const openShape = shapeFromLookup(lookup);
      if (binding.defaultInit) {
        const def = resolveShape(binding.defaultInit, freshCtx(ctx, { depth: depth + 1, path: lookup.path }));
        return { kind: "branches", branches: [openShape, def], path: lookup.path };
      }
      return openShape;
    }
    if (binding.kind === "import") return followImport(binding, n.text, ctx, path, depth);
  }

  if (ts.isPropertyAccessExpression(n) || ts.isElementAccessExpression(n)) {
    const objShape = resolveShape(n.expression, freshCtx(ctx, { depth: depth + 1, path }));
    const isElement = ts.isElementAccessExpression(n);
    const literalKey = isElement
      ? (ts.isStringLiteralLike(n.argumentExpression) || ts.isNumericLiteral(n.argumentExpression) ? n.argumentExpression.text : null)
      : n.name.text;
    if (literalKey !== null) {
      const lookup = readProperty(objShape, literalKey);
      return shapeFromLookup(lookup);
    }
    const typeDomain = enumerateKeyDomainByType(n.argumentExpression, n, source);
    const domainInfo = typeDomain
      ? { domainKind: "index-type-literal-union", members: typeDomain, indexMayEscape: false, declaration: null }
      : enumerateKeyDomainByContainer(objShape);
    if (!domainInfo) return { kind: "computedKey", closed: false, reason: "index-not-a-closed-literal-union", path };
    const domain = domainInfo.members;
    const branchLookups = domain.map((v) => readProperty(objShape, v));
    const closed = branchLookups.every((l) => (l.status === "found" ? isShapeClosed(l.valueShape) && !l.conditional : l.status === "absent"));
    const branches = branchLookups.map(shapeFromLookup);
    if (domainInfo.indexMayEscape) {
      // fail-closed completeness: nothing proves the index stays inside the key
      // set, so the `undefined` outcome is carried explicitly as its own branch.
      branches.push({ kind: "nonObject", reason: "index-outside-sealed-container-domain", path });
    }
    return {
      kind: "computedKey",
      domain,
      domainKind: domainInfo.domainKind,
      indexMayEscape: domainInfo.indexMayEscape,
      declaration: domainInfo.declaration,
      memberStatuses: domain.map((v, i) => ({ member: v, status: branchLookups[i].status })),
      branches,
      closed,
      path,
    };
  }

  if (ts.isCallExpression(n)) {
    const callee = unwrap(n.expression);
    if (ts.isIdentifier(callee) && (callee.text === "useMemo" || callee.text === "useCallback") && n.arguments.length) {
      return resolveShape(n.arguments[0], freshCtx(ctx, { depth: depth + 1, path: [...path, { kind: "useMemo/useCallback-arg" }] }));
    }
    if (ts.isArrowFunction(callee) || ts.isFunctionExpression(callee)) {
      const sub = buildSubstitution(callee, n, ctx);
      return withArgumentComputedDomains(
        resolveFunctionBody(callee, freshCtx(ctx, { substitution: sub, depth, path: [...path, { kind: "iife" }] })),
        n, ctx, path, depth,
      );
    }
    if (ts.isIdentifier(callee)) {
      if (substitution.has(callee.text)) {
        return { kind: "relay", binding: { kind: "param-callee" }, path: [...path, { kind: "callToSubstitutedParam", callee: callee.text }] };
      }
      const moduleImports = collectModuleImports(source);
      const binding = resolveBinding(callee.text, callee, source, moduleImports);
      if (!binding) return { kind: "openUnknown", reason: "callee-no-binding", path: [...path, { kind: "call", callee: callee.text }] };
      if (binding.kind === "hoistedFunction") {
        const callKey = `${fileRel}::${binding.declaredAt}`;
        if (visitedCalls.has(callKey)) return { kind: "openUnknown", reason: "recursive-call-cycle", path: [...path, { kind: "callToHoistedFunction-cycle", declaredAt: binding.declaredAt }] };
        const sub = buildSubstitution(binding.node, n, ctx);
        return withArgumentComputedDomains(
          withAnnotatedPrimitiveReturn(
            resolveFunctionBody(binding.node, freshCtx(ctx, { substitution: sub, visitedCalls: new Set([...visitedCalls, callKey]), depth, path: [...path, { kind: "callToHoistedFunction", declaredAt: binding.declaredAt }] })),
            binding.node, source, [...path, { kind: "callToHoistedFunction", declaredAt: binding.declaredAt }],
          ),
          n, ctx, path, depth,
        );
      }
      if (binding.kind === "localConst" && !binding.mutated) {
        let fnNode = unwrap(binding.node);
        if (
          ts.isCallExpression(fnNode) &&
          ts.isIdentifier(unwrap(fnNode.expression)) &&
          ["useMemo", "useCallback"].includes(unwrap(fnNode.expression).text) &&
          fnNode.arguments.length
        ) {
          fnNode = unwrap(fnNode.arguments[0]);
        }
        if (ts.isArrowFunction(fnNode) || ts.isFunctionExpression(fnNode)) {
          const callKey = `${fileRel}::${binding.declaredAt}`;
          if (visitedCalls.has(callKey)) return { kind: "openUnknown", reason: "recursive-call-cycle", path: [...path, { kind: "callToLocalFunctionValue-cycle", declaredAt: binding.declaredAt }] };
          const sub = buildSubstitution(fnNode, n, ctx);
          return withArgumentComputedDomains(
            withAnnotatedPrimitiveReturn(
              resolveFunctionBody(fnNode, freshCtx(ctx, { substitution: sub, visitedCalls: new Set([...visitedCalls, callKey]), depth, path: [...path, { kind: "callToLocalFunctionValue", declaredAt: binding.declaredAt }] })),
              fnNode, source, [...path, { kind: "callToLocalFunctionValue", declaredAt: binding.declaredAt }],
            ),
            n, ctx, path, depth,
          );
        }
        return { kind: "callArgsPending", reason: "callee-local-const-not-a-function", path: [...path, { kind: "call", callee: callee.text }] };
      }
      if (binding.kind === "param") {
        return { kind: "relay", binding, reason: "callee-is-a-parameter", path: [...path, { kind: "callToParam", callee: callee.text, declaredAt: binding.declaredAt }] };
      }
      if (binding.kind === "import") {
        return followImport(binding, callee.text, ctx, [...path, { kind: "callToImport" }], depth, n);
      }
      return { kind: "openUnknown", reason: `callee-binding-kind:${binding.kind}`, path };
    }
    if (ts.isPropertyAccessExpression(callee)) {
      const objShape = resolveShape(callee.expression, freshCtx(ctx, { depth: depth + 1, path }));
      const lookup = readProperty(objShape, callee.name.text);
      if (lookup.status !== "found") return shapeFromLookup(lookup);
      const fnNode = lookup.rawNode ? unwrap(lookup.rawNode) : null;
      if (fnNode && (ts.isArrowFunction(fnNode) || ts.isFunctionExpression(fnNode))) {
        const sub = buildSubstitution(fnNode, n, ctx);
        return resolveFunctionBody(fnNode, freshCtx(ctx, { substitution: sub, depth, path: [...lookup.path, { kind: "methodCall", key: callee.name.text }] }));
      }
      return { kind: "openUnknown", reason: "method-not-a-function-in-resolved-object", path: lookup.path };
    }
    return { kind: "openUnknown", reason: "callee-form-not-handled", path };
  }

  if (ts.isArrowFunction(n) || ts.isFunctionExpression(n)) {
    if (!n.body) return { kind: "openUnknown", reason: "function-without-body", path };
    return resolveFunctionBody(n, freshCtx(ctx, { path }));
  }

  return { kind: "openUnknown", reason: `node-kind-not-handled:${ts.SyntaxKind[n.kind]}`, path };
}

/** Per-order-entry closedness: a spread is closed iff its shape is closed; a
 * leaf is closed iff its value shape is closed AND its key resolved to a
 * literal (P0-2 support, see module docstring). */
function entryIsClosed(entry) {
  if (entry.kind === "spread") return isShapeClosed(entry.shape);
  if (entry.unresolvedKey) return false;
  return isShapeClosed(entry.shape);
}

function isShapeClosed(shape) {
  if (!shape) return false;
  switch (shape.kind) {
    case "object":
      return shape.closed;
    case "array":
      return shape.closed;
    case "nonObject":
      return true;
    case "branches":
      return shape.branches.every(isShapeClosed);
    case "computedKey":
      return !!shape.closed;
    default:
      return false; // relay, callArgsPending, dynamicSink, openUnknown
  }
}

/* ------------------------------------------------ property lookup (P0-3) --- */
/**
 * readProperty(shape, key) -> { status:'found', valueShape, path, rawNode?, conditional? }
 *                            | { status:'absent', path }
 *                            | { status:'open', reason, path, opaqueShape? }
 *
 * `conditional:true` on a 'found' result means the key is NOT produced by
 * every branch that could apply (some branch is 'absent' and/or 'open'); its
 * `valueShape` is itself a `branches` shape whose members include an explicit
 * absent/open placeholder per non-producing branch, so a caller that only
 * inspects `valueShape` (never `conditional` itself) still gets the correct,
 * non-closed composite -- see `dispositionOf`'s existing branches handling in
 * drive.mjs, unchanged, which already renders a found-object + nonObject mix
 * as BRANCH_CONDITIONAL_AUTHORED, never CLOSED_*.
 */
export function readProperty(shape, key) {
  if (shape.kind === "object") return readPropertyOfObject(shape, key);
  if (shape.kind === "branches") return readPropertyOfBranches(shape, key);
  if (shape.kind === "nonObject") return { status: "absent", path: shape.path ?? [] };
  // an array literal never carries a custom-property STRING key on itself
  // (CSS custom properties are never numeric indices); its ELEMENTS are
  // scanned separately by the governance walk, not through property lookup.
  if (shape.kind === "array") return { status: "absent", path: shape.path ?? [] };
  if (shape.kind === "computedKey") {
    if (!shape.branches) return { status: "open", reason: "computed-key-not-enumerated", path: shape.path ?? [] };
    const through = readPropertyOfBranches({ branches: shape.branches, path: shape.path }, key);
    /* P0 -- reading THROUGH an enumerated lookup yields the member values, and
     * the `computedKey` node that justified them would otherwise vanish from the
     * derived graph, leaving a downstream closure unexplained. Carry a reference
     * to the originating enumeration on the derived shape so the audit trail
     * survives the read. It is a reference, not a copy: no evidence is invented,
     * and the cycle it creates is handled by the collector's visited set. */
    if (shape.domainKind) {
      if (through.valueShape) through.valueShape = { ...through.valueShape, viaComputedDomain: shape };
      if (through.opaqueShape) through.opaqueShape = { ...through.opaqueShape, viaComputedDomain: shape };
    }
    return through;
  }
  return { status: "open", reason: `property-read-through-opaque-shape:${shape.kind}`, path: shape.path ?? [], opaqueShape: shape };
}

function readPropertyOfObject(objShape, key) {
  let lastDefiner = null;
  let unsettledSincePivot = []; // both true 'open' contributors AND 'conditional found' contributors
  for (const entry of objShape.order) {
    if (entry.kind === "leaf") {
      if (entry.key === key) {
        lastDefiner = { status: "found", valueShape: entry.shape, rawNode: entry.node, path: [{ kind: "propertyLookup", key }] };
        unsettledSincePivot = [];
      }
      continue;
    }
    // spread
    const sub = readProperty(entry.shape, key);
    if (sub.status === "found" && !sub.conditional) {
      lastDefiner = sub;
      unsettledSincePivot = [];
    } else if (sub.status === "found" && sub.conditional) {
      // this spread SOMETIMES provides the key -- it can shadow whatever came
      // before, but (fail-closed) does not itself resolve the read: a later
      // definer can still supersede it, and if nothing later does, the final
      // value depends on which branch executed, which is exactly 'open', not
      // a proven single value.
      lastDefiner = sub;
      unsettledSincePivot.push(sub);
    } else if (sub.status === "open") {
      unsettledSincePivot.push(sub);
    }
    // 'absent' from a spread: no change (does not erase a prior found/open/
    // conditional, does not resolve one either).
  }
  if (unsettledSincePivot.length > 0) {
    const opaques = unsettledSincePivot.map((s) => s.opaqueShape ?? (s.conditional ? s.valueShape : undefined)).filter(Boolean);
    const opaqueShape = opaques.length === 1 ? opaques[0] : opaques.length > 1 ? { kind: "branches", branches: opaques, path: objShape.path ?? [] } : undefined;
    return { status: "open", reason: "unresolved-or-conditional-spread-may-provide-or-override-key", path: objShape.path ?? [], opaqueShape };
  }
  if (lastDefiner) return { status: "found", valueShape: lastDefiner.valueShape, rawNode: lastDefiner.rawNode, path: [...(objShape.path ?? []), ...(lastDefiner.path ?? [])] };
  return { status: "absent", path: objShape.path ?? [] };
}

function readPropertyOfBranches(branchesShape, key) {
  const results = branchesShape.branches.map((b) => readProperty(b, key));
  const foundOnes = results.filter((r) => r.status === "found");
  const openOnes = results.filter((r) => r.status === "open");
  const absentOnes = results.filter((r) => r.status === "absent");
  if (absentOnes.length === results.length) return { status: "absent", path: branchesShape.path ?? [] };
  if (openOnes.length > 0 && foundOnes.length === 0) {
    const opaques = openOnes.map((o) => o.opaqueShape).filter(Boolean);
    const opaqueShape = opaques.length === 1 ? opaques[0] : opaques.length > 1 ? { kind: "branches", branches: opaques, path: branchesShape.path ?? [] } : undefined;
    return { status: "open", reason: "branch-of-branches-open", path: branchesShape.path ?? [], opaqueShape };
  }
  if (foundOnes.length > 0) {
    // P0-3 fix: EVERY absent branch is kept as its own explicit nonObject
    // placeholder -- never dropped just because a found branch coexists.
    // `conditional:true` whenever not every branch produces the key
    // unconditionally (absent and/or open siblings present).
    const branches = [
      ...foundOnes.map((r) => r.valueShape),
      ...absentOnes.map(() => ({ kind: "nonObject", reason: "property-absent-from-resolved-object", path: branchesShape.path ?? [] })),
      ...openOnes.map((o) => o.opaqueShape ?? { kind: "openUnknown", reason: "sibling-branch-open", path: branchesShape.path ?? [] }),
    ];
    const conditional = absentOnes.length > 0 || openOnes.length > 0;
    return { status: "found", valueShape: { kind: "branches", branches, path: branchesShape.path ?? [] }, path: branchesShape.path ?? [], conditional };
  }
  return { status: "open", reason: "branches-mixed-inconclusive", path: branchesShape.path ?? [] };
}

function shapeFromLookup(lookup) {
  if (lookup.status === "found") return lookup.valueShape;
  if (lookup.status === "absent") return { kind: "nonObject", reason: "property-absent-from-resolved-object", path: lookup.path };
  if (lookup.opaqueShape) return { ...lookup.opaqueShape, path: [...(lookup.opaqueShape.path ?? []), { kind: "propertyLookupThroughOpaque" }] };
  return { kind: "openUnknown", reason: lookup.reason ?? "property-lookup-open", path: lookup.path };
}

/**
 * P0 -- carry the enumeration reference ACROSS a call boundary.
 *
 * `readProperty` already keeps the link when a value is read THROUGH an
 * enumerated lookup. A call breaks it a second way: when an enumerated value is
 * passed as an ARGUMENT, the function's return is built from the body, and a
 * return like `` `${pad} 2rem` `` produces a fresh shape that no longer touches
 * the argument's. The enumeration still determined the returned value, so the
 * reference is attached to the call RESULT -- a reference to the real
 * `computedKey` shape, never a synthesised receipt. Both the call form and the
 * spread of that call inherit it, because both resolve through here.
 */
function harvestComputedDomains(shape, out = [], seen = new WeakSet(), depth = 0) {
  if (!shape || typeof shape !== "object" || depth > 40 || seen.has(shape)) return out;
  seen.add(shape);
  if (shape.kind === "computedKey" && shape.domainKind) out.push(shape);
  if (shape.viaComputedDomain) harvestComputedDomains(shape.viaComputedDomain, out, seen, depth + 1);
  for (const entry of shape.order ?? []) harvestComputedDomains(entry.shape, out, seen, depth + 1);
  for (const el of shape.elements ?? []) harvestComputedDomains(el.shape, out, seen, depth + 1);
  for (const b of shape.branches ?? []) harvestComputedDomains(b, out, seen, depth + 1);
  return out;
}

function withArgumentComputedDomains(result, callNode, ctx, path, depth) {
  if (!result || typeof result !== "object" || !callNode.arguments?.length) return result;
  const found = [];
  for (const arg of callNode.arguments) {
    const argShape = resolveShape(arg, freshCtx(ctx, { depth: depth + 1, path }));
    harvestComputedDomains(argShape, found);
  }
  if (found.length === 0) return result;
  const already = harvestComputedDomains(result);
  const fresh = found.filter((d) => !already.includes(d));
  if (fresh.length === 0) return result;
  return {
    ...result,
    viaComputedDomain:
      fresh.length === 1 ? fresh[0] : { kind: "branches", branches: fresh, path: result.path ?? [] },
  };
}

/**
 * T-TYPED-RELAY -- a callee whose RETURN TYPE is written as a primitive CSS
 * scalar cannot hand back a style object, whatever its body does.
 *
 * Applied only AFTER the body has been resolved and only when the body left the
 * value OPEN: a body that already resolved keeps its own, more specific
 * evidence, so no row that closes today changes its receipt. The annotation
 * must be present syntactically -- an inferred return type is never accepted.
 */
function withAnnotatedPrimitiveReturn(result, fnNode, source, path) {
  if (!fnNode || !fnNode.type) return result;
  if (result && isShapeClosed(result)) return result;
  if (!isPrimitiveCssScalarTypeNode(fnNode.type, source)) return result;
  return {
    kind: "nonObject",
    reason: "typed-relay-primitive",
    typedRelay: {
      origin: "return-type",
      ownerFunction: fnNode.name ? fnNode.name.text : enclosingSymbol(fnNode),
      declaredAt: `${source.fileName}:${source.getLineAndCharacterOfPosition(fnNode.getStart(source)).line + 1}`,
      typeText: fnNode.type.getText(source).slice(0, 120),
    },
    path,
  };
}

/* ---------------------------------------------------- call substitution (P0-4) --- */
/**
 * Build a substitution map for entering `fnNode`'s body from call site
 * `callNode`. Plain-identifier parameters map to {node, source, fileRel}
 * (resolved lazily). Destructured parameters are resolved EAGERLY. Rest
 * parameters are left unsubstituted (an identifier use inside the callee that
 * needed one falls through to normal scope resolution, correctly reporting
 * relay/open rather than guessing).
 *
 * Corrections vs v3:
 *  - a DEFAULT value resolves in the CALLEE's own lexical scope/file, with
 *    the in-progress substitution map (so an earlier parameter's already-
 *    substituted value is visible to a later parameter's default expression,
 *    e.g. `function f(a, b = a + 1)`), not the caller's scope.
 *  - an explicit `undefined` argument triggers the default exactly like a
 *    missing argument (real JS semantics).
 *  - a missing argument with NO default maps the parameter to a precise
 *    "undefined, no argument, no default" nonObject shape rather than leaving
 *    it unsubstituted (which would fall through to a generic relay/open --
 *    imprecise when the call site proves the value IS simply undefined).
 *  - an OPEN destructured leaf propagates its opaque shape (matching
 *    shapeFromLookup elsewhere), not a flattened string reason.
 *  - a rest element inside a destructured parameter is an explicit
 *    `openUnknown`, not a silently skipped substitution.
 */
function buildSubstitution(fnNode, callNode, callerCtx) {
  const map = new Map();
  const args = callNode.arguments;
  const calleeSource = fnNode.getSourceFile();
  const calleeFileRel = calleeSource.fileName;
  fnNode.parameters.forEach((param, i) => {
    if (param.dotDotDotToken) return; // rest: left unsubstituted, see docstring
    const providedArgNode = i < args.length ? args[i] : null;
    const explicitUndefined = !!providedArgNode && ts.isIdentifier(unwrap(providedArgNode)) && unwrap(providedArgNode).text === "undefined";
    const useDefault = (!providedArgNode || explicitUndefined) && !!param.initializer;
    const defaultCtx = {
      source: calleeSource,
      fileRel: calleeFileRel,
      substitution: map,
      depth: (callerCtx.depth ?? 0) + 1,
      path: [...(callerCtx.path ?? []), { kind: "defaultValueInCalleeScope", param: ts.isIdentifier(param.name) ? param.name.text : "(destructured)" }],
    };
    let argNode = null;
    let argCtx = callerCtx;
    if (useDefault) {
      argNode = param.initializer;
      argCtx = defaultCtx;
    } else if (providedArgNode) {
      argNode = providedArgNode;
      argCtx = callerCtx;
    }
    if (ts.isIdentifier(param.name)) {
      if (argNode) {
        map.set(param.name.text, { node: argNode, source: argCtx.source, fileRel: argCtx.fileRel, callerSubstitution: argCtx === defaultCtx ? map : callerCtx.substitution });
      } else {
        map.set(param.name.text, { precomputedShape: { kind: "nonObject", reason: "undefined-no-argument-no-default" } });
      }
      return;
    }
    if (ts.isObjectBindingPattern(param.name) || ts.isArrayBindingPattern(param.name)) {
      const argShape = argNode
        ? resolveShape(argNode, { ...argCtx, depth: (argCtx.depth ?? callerCtx.depth ?? 0) + 1, path: [...(argCtx.path ?? callerCtx.path ?? []), { kind: "callArgForDestructuredParam" }] })
        : { kind: "nonObject", reason: "no-argument-and-no-default" };
      for (const el of param.name.elements) {
        if (ts.isOmittedExpression(el)) continue;
        if (el.dotDotDotToken) {
          const restName = ts.isIdentifier(el.name) ? el.name.text : null;
          if (restName) map.set(restName, { precomputedShape: { kind: "openUnknown", reason: "destructured-rest-element-not-enumerated" } });
          continue;
        }
        const leafName = ts.isIdentifier(el.name) ? el.name.text : null;
        if (!leafName) continue;
        const srcKey = el.propertyName && ts.isIdentifier(el.propertyName) ? el.propertyName.text : leafName;
        const lookup = readProperty(argShape, srcKey);
        let leafShape;
        if (lookup.status === "found") {
          leafShape = lookup.valueShape;
        } else if (lookup.status === "absent") {
          leafShape = el.initializer
            ? resolveShape(el.initializer, { source: calleeSource, fileRel: calleeFileRel, substitution: map, depth: (callerCtx.depth ?? 0) + 1, path: [] })
            : { kind: "nonObject", reason: "property-absent-from-resolved-object" };
        } else {
          leafShape = lookup.opaqueShape
            ? { ...lookup.opaqueShape, path: [...(lookup.opaqueShape.path ?? []), { kind: "destructuredParamLookupThroughOpaque" }] }
            : { kind: "openUnknown", reason: lookup.reason ?? "arg-destructure-open" };
        }
        map.set(leafName, { precomputedShape: leafShape });
      }
    }
  });
  return map;
}

function resolveFunctionBody(fnNode, ctx) {
  if (ts.isBlock(fnNode.body)) {
    const returns = [];
    const findReturns = (child) => {
      if (ts.isReturnStatement(child) && child.expression) returns.push(child.expression);
      if (!isFunctionLike(child)) ts.forEachChild(child, findReturns);
    };
    ts.forEachChild(fnNode.body, findReturns);
    if (!returns.length) return { kind: "openUnknown", reason: "function-body-no-resolvable-return", path: ctx.path ?? [] };
    const shapes = returns.map((r, i) => resolveShape(r, freshCtx(ctx, { depth: (ctx.depth ?? 0) + 1, path: [...(ctx.path ?? []), { kind: "return", ordinal: i }] })));
    if (shapes.length === 1) return shapes[0];
    return { kind: "branches", branches: shapes, path: ctx.path ?? [] };
  }
  return resolveShape(fnNode.body, freshCtx(ctx, { depth: (ctx.depth ?? 0) + 1 }));
}

/* ------------------------------------------------------------ imports --- */
function followImport(binding, localName, ctx, path, depth, callNode, callerCtx) {
  const effectiveCallerCtx = callerCtx ?? ctx;
  const stepPath = [...path, { kind: "import", moduleSpecifier: binding.moduleSpecifier, importedName: binding.importedName ?? localName, form: binding.form }];
  const visitedImports = ctx.visitedImports ?? new Set();
  const targetFile = resolveImportTargetFile(binding.moduleSpecifier, ctx.fileRel);
  if (!targetFile) {
    const isBare = !binding.moduleSpecifier.startsWith(".") && !binding.moduleSpecifier.startsWith("@/");
    return { kind: "openUnknown", reason: isBare ? "external-npm-package" : "specifier-resolved-no-matching-file", path: stepPath };
  }
  const visitKey = `${targetFile}::${binding.importedName ?? localName}`;
  if (visitedImports.has(visitKey)) return { kind: "openUnknown", reason: "import-cycle-detected", path: stepPath, targetFile };
  const targetSrc = getSource(targetFile);
  if (!targetSrc) return { kind: "openUnknown", reason: "target-file-unreadable", path: stepPath, targetFile };
  const exported = findExportedDecl(targetSrc.source, binding.importedName ?? localName, binding.form);
  if (!exported) return { kind: "openUnknown", reason: "export-not-found-in-target", path: stepPath, targetFile };
  const nextVisited = new Set([...visitedImports, visitKey]);

  if (exported.kind === "reExport") {
    return followImport(
      { moduleSpecifier: exported.moduleSpecifier, importedName: exported.importedName, form: "named" },
      exported.importedName,
      { ...ctx, fileRel: targetFile, source: targetSrc.source, visitedImports: nextVisited },
      stepPath,
      depth + 1,
      callNode,
      effectiveCallerCtx
    );
  }

  const nextCtx = { ...ctx, source: targetSrc.source, fileRel: targetFile, visitedImports: nextVisited, depth: depth + 1, path: stepPath };
  if (exported.kind === "namedFunction") {
    if (callNode) {
      const sub = buildSubstitution(exported.node, callNode, effectiveCallerCtx);
      return resolveFunctionBody(exported.node, { ...nextCtx, substitution: sub });
    }
    return { kind: "nonObject", reason: "identifier-is-a-function-value", path: stepPath };
  }
  return resolveShape(exported.node, nextCtx);
}

/* ---------------------------------------------- public-boundary receipt (P0-1/P0-5) --- */
/**
 * For a `relay` shape reached from a component's OWN outer parameter (no
 * call site to substitute -- this is the JSX-invocation boundary, not a
 * private-helper call), determine whether it is a candidate public boundary:
 * intrinsic DOM/SVG sink + demonstrable public export path via the full
 * package.json#exports-driven graph (publicSurface.mjs), including
 * memo/forwardRef-wrapped variable exports and createEngineComponent
 * wrapper->engine delegation. NEVER a final safety/adjudication -- "candidate"
 * is not "adjudication".
 */
export function classifyRelayBoundary(binding, sinkTagName, fileRel) {
  const isIntrinsicSink = typeof sinkTagName === "string" && /^[a-z]/.test(sinkTagName);
  const ownerFn = binding.ownerFunctionNode;
  let exported = false;
  let exportEvidence = null;
  let wrapperAttempt = null;
  if (ownerFn) {
    const result = candidateExportedNamesForFunction(ownerFn, fileRel);
    wrapperAttempt = result.wrapperAttempt;
    for (const cand of result.candidates) {
      const hit = isDeclarationPubliclyReachable(cand.file, cand.name);
      if (hit) {
        exported = true;
        exportEvidence = { ...hit, via: cand.via, candidateFile: cand.file, candidateName: cand.name, chainReceipt: cand.chainReceipt ?? null };
        break;
      }
    }
  }
  if (isIntrinsicSink && exported) {
    return { candidate: true, kind: "PUBLIC_BOUNDARY_CANDIDATE", sinkTagName, exportEvidence };
  }
  // blocker 4: a wrapper mechanism (createEngineComponent) DID apply to this
  // file but the full wrapper->engine->owner->intrinsic chain could not be
  // closed (dead/foreign local helper, missing default export, owner not a
  // named local). This is a distinct, investigated-but-inconclusive fact --
  // it must never collapse into an unexamined PRIVATE_RELAY_UNRESOLVED, and
  // it is NEVER a candidate.
  if (isIntrinsicSink && wrapperAttempt && wrapperAttempt.applicable && !wrapperAttempt.proven) {
    return { candidate: false, kind: "PUBLIC_BOUNDARY_UNKNOWN", sinkTagName, reason: wrapperAttempt.reason, wrapperAttempt };
  }
  return {
    candidate: false,
    kind: isIntrinsicSink ? "PRIVATE_RELAY_UNRESOLVED" : "CUSTOM_COMPONENT_SINK_NOT_FOLLOWED",
    sinkTagName,
    reason: isIntrinsicSink ? "no-demonstrated-public-export-path" : "sink-is-a-custom-component-not-intrinsic-dom-svg",
  };
}

export { isShapeClosed };
