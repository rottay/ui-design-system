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

import { repoRoot as findRepoRoot } from "../../../../libraries/repo-root/index.mjs";

export const REPO_ABS = findRepoRoot(dirname(fileURLToPath(import.meta.url)));

import {
  candidateExportedNamesForFunction,
  getSource,
  isDeclarationPubliclyReachable,
} from "../public-surface/index.mjs";
export { getSource } from "../public-surface/index.mjs";
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
function hasReassignmentOrMutation(funcScope, name, seen = new Set()) {
  let found = false;
  if (seen.has(name) || seen.size > 8) return false; // alias cycle / depth guard
  seen.add(name);
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
    /* `Object.assign(X, …)` and `delete X.k` MUTATE X as surely as `X.k = v`.
     * The coarse detector never modelled either, so a helper whose only
     * mutation was an `Object.assign` from an unresolved source resolved to its
     * bare initializer and could certify as a ZERO while unknown keys were
     * merged into it. Both are mutations; both make the binding unproven until
     * a fine-grained pass proves the composition. */
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      ts.isIdentifier(node.expression.expression) &&
      node.expression.expression.text === "Object" &&
      ["assign", "defineProperty", "defineProperties", "setPrototypeOf"].includes(node.expression.name.text) &&
      node.arguments.length > 0 &&
      targetsName(node.arguments[0], name)
    ) {
      found = true;
      return;
    }
    if (ts.isDeleteExpression(node) && (ts.isPropertyAccessExpression(node.expression) || ts.isElementAccessExpression(node.expression)) && targetsName(node.expression.expression, name)) {
      found = true;
      return;
    }
    /* ALIAS ESCAPE. `const alias = X;` (or `alias = X;`) hands out the SAME
     * object: every later `alias.k = v` mutates X, while the detector -- which
     * only looks for writes whose target expression is X itself -- sees
     * nothing, so X resolved to its bare initializer and could certify as a
     * ZERO with keys added behind it.
     *
     * Deliberately NARROW: only the binding used as the WHOLE initializer or
     * the WHOLE right-hand side aliases it. `{ ...X }` and `X.foo` are copies
     * and reads, not aliases, and must keep resolving exactly as before. */
    if (
      ts.isVariableDeclaration(node) &&
      node.initializer &&
      ts.isIdentifier(unwrap(node.initializer)) &&
      unwrap(node.initializer).text === name &&
      ts.isIdentifier(node.name)
    ) {
      // an alias only matters when the ALIAS is itself mutated; a read-only
      // second name for the same object changes nothing and must keep resolving
      if (hasReassignmentOrMutation(funcScope, node.name.text, seen)) {
        found = true;
        return;
      }
    }
    if (
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
      ts.isIdentifier(unwrap(node.right)) &&
      unwrap(node.right).text === name &&
      ts.isIdentifier(node.left)
    ) {
      if (hasReassignmentOrMutation(funcScope, node.left.text, seen)) {
        found = true;
        return;
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
            if (!decl.initializer) {
              return {
                kind: "uninitializedLocal",
                declaredAt: `${source.fileName}:${source.getLineAndCharacterOfPosition(declStart).line + 1}`,
                // T-LET-UNION: what the whole-value union prover needs to walk
                name,
                declNode: decl,
                funcScope: current === source ? current : nearestFunctionOrSource(current),
                source,
              };
            }
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
                  // T-USE-STATE: an ARRAY pattern binds by POSITION, not by
                  // name; a tuple-returning hook can only be read through the
                  // positional index and the pattern itself.
                  fromArrayPattern: ts.isArrayBindingPattern(decl.name),
                  arrayIndex: ts.isArrayBindingPattern(decl.name) ? decl.name.elements.indexOf(el) : null,
                  bindingPattern: decl.name,
                  declSource: source,
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

function findExportedDecl(targetSource, importedName, form, starDepth = 0, starSeen = new Set()) {
  const starTargets = [];
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
    /* `export * from './x'` -- a barrel. The name is not listed anywhere, so the
     * only way to find its owner is to look through each star target. Bounded by
     * `starDepth` and by the visited set the caller threads, and it never
     * invents: if no target declares the name, the lookup still fails. */
    if (ts.isExportDeclaration(stmt) && stmt.moduleSpecifier && !stmt.exportClause) {
      starTargets.push(ts.isStringLiteralLike(stmt.moduleSpecifier) ? stmt.moduleSpecifier.text : null);
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
  // only after the direct forms fail: walk the barrels
  if (starDepth < 4) {
    for (const spec of starTargets) {
      if (!spec) continue;
      const targetFile = resolveImportTargetFile(spec, targetSource.fileName);
      if (!targetFile || starSeen.has(targetFile)) continue;
      starSeen.add(targetFile);
      const entry = getSource(targetFile);
      if (!entry) continue;
      const hit = findExportedDecl(entry.source, importedName, form, starDepth + 1, starSeen);
      /* A hit found through a barrel carries specifiers that are relative to the
       * file that DECLARED them, not to the barrel the walk entered. Report that
       * file so the caller resolves the next hop from the right directory --
       * without it, `export { x } from './token-utils'` two barrels down is
       * resolved against the top barrel and silently fails to resolve. */
      if (hit) return { ...hit, declFile: hit.declFile ?? targetFile, declSource: hit.declSource ?? entry.source };
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

/* ------------- public style passthrough (T-PUBLIC-STYLE-PASSTHROUGH) --- */
/**
 * T-PUBLIC-STYLE-PASSTHROUGH -- a composed style object whose ONLY unresolved
 * operand is the component's own inbound props.
 *
 * `{...tokens, ...style}`, `mergePersonalityStyle(props.style, resolved)`,
 * `{...style, width, height}` -- in each the authored half is enumerable and the
 * one thing this walk cannot see is the value the CALLER handed in. That is not
 * authored debt: it is a boundary. Which boundary it is depends entirely on the
 * SINK, and that question is answered by `classifyRelayBoundary`, unchanged --
 * an intrinsic DOM element with a demonstrable public export path is a
 * PUBLIC_BOUNDARY; anything else (a custom component, a third-party forwarder)
 * is a PRIVATE_RELAY that grants nothing.
 *
 * Fail-closed: EVERY open sub-shape must be inbound-props, and everything else
 * must be key-enumerable. A computed key, a dynamic sink, an unresolved import,
 * an `openUnknown` from a mutation or an unproven call -- any of them refuses
 * the proof, because none of them is the caller's object.
 */
const INBOUND_REST_REASONS = new Set([
  "rest-parameter-substitution-not-implemented",
  "rest-destructure-not-implemented",
]);

/** Is this open shape the component's own inbound props/param value? */
function inboundPropsRelay(shape) {
  if (!shape || typeof shape !== "object") return null;
  if (shape.kind === "relay") {
    const b = shape.binding;
    if (!b) return null;
    // a parameter (or a property destructured off one) is the caller's value
    if (b.kind === "param" || b.kind === "destructuredLocal" || b.kind === "param-callee") return shape;
    return null;
  }
  // the resolver could not substitute a rest parameter -- structurally the same
  // thing: a value that arrived from the caller
  if (shape.kind === "callArgsPending" && INBOUND_REST_REASONS.has(shape.reason)) return shape;
  return null;
}

/**
 * Walk a shape and return every open sub-shape, or null the moment one of them
 * is NOT inbound props. Keys must stay enumerable everywhere.
 */
function publicStylePassthroughRelays(shape, depth = 0, seen = new WeakSet(), out = []) {
  if (!shape || typeof shape !== "object" || depth > 40) return null;
  if (seen.has(shape)) return null; // cycle -> fail closed
  seen.add(shape);
  switch (shape.kind) {
    case "nonObject":
      return out;
    case "object":
    case "array": {
      for (const entry of shape.order ?? []) {
        if (entry.kind !== "spread") {
          // a computed/dynamic key can add a name nobody enumerated
          if (entry.unresolvedKey || entry.key === null || entry.key === undefined) return null;
        }
        if (entry.kind === "spread") {
          // ONLY a spread can carry the caller's keys into this object
          if (!publicStylePassthroughRelays(entry.shape, depth + 1, seen, out)) return null;
        }
        /* A leaf VALUE is ignored outright. It cannot add a key, so it is
         * neither a passthrough nor an obstacle -- and treating an unresolved
         * leaf as "the caller's style object" is exactly how a helper parameter
         * like `col.align` would be mistaken for a public style prop. */
      }
      for (const el of shape.elements ?? []) {
        if (!publicStylePassthroughRelays(el.shape, depth + 1, seen, out)) return null;
      }
      return out;
    }
    case "branches": {
      const arms = shape.branches ?? [];
      if (!arms.length) return null;
      for (const arm of arms) if (!publicStylePassthroughRelays(arm, depth + 1, seen, out)) return null;
      return out;
    }
    case "computedKey":
      return shape.closed === true ? out : null;
    default: {
      /* A relay this programme has ALREADY proven -- a sealed-import relay with a
       * known key set, or a namespace-bounded one -- is not an obstacle to the
       * passthrough question. Its contribution is characterised; it simply is not
       * the caller's object, so it is accepted without being collected. */
      if (shape.kind === "relay" && shape.binding &&
          (shape.binding.kind === "sealed-import-relay" || shape.binding.kind === "custom-property-namespace-relay")) {
        return out;
      }
      const inbound = inboundPropsRelay(shape);
      if (!inbound) return null;
      out.push(inbound);
      return out;
    }
  }
}

/**
 * The proof: at least one inbound-props operand, and nothing unresolved that is
 * not one. Returns the relays (so the caller can reuse the FIRST one's binding
 * for the existing boundary classification) or null.
 */
export function publicStylePassthroughProof(shape) {
  const relays = publicStylePassthroughRelays(shape);
  if (!relays || relays.length === 0) return null;
  return relays;
}


/* ------------------------------- conditional let union (T-LET-UNION) --- */
/**
 * T-LET-UNION -- `let x; if (a) x = {…}; else x = {…}; use(x)`.
 *
 * A declaration-only `let` assigned ONLY whole values inside conditional arms of
 * its own scope has a fully enumerable domain: `undefined` plus every
 * right-hand side. Nothing about it is unknowable -- the resolver simply had no
 * rule for it and returned `uninitialized-local-let`.
 *
 * Fail-closed on every one of the addendum's seven negatives:
 *   1. an assignment outside the declaring scope (another helper, an effect);
 *   2. any PROPERTY mutation (`x.k = …`, `Object.assign(x, …)`, `delete x.k`)
 *      after or before a whole-value assignment -- the RHS set stops being the
 *      whole story;
 *   3. an RHS whose own key set is not enumerable (notably a spread of the
 *      component's external `style`);
 *   4. a computed key inside any RHS;
 *   5. an alias, an escape into a call, a capture by a nested function, or a
 *      store onto a ref -- anything that could read or write it elsewhere;
 *   6. it resolves the VALUE only; carrying it to a `state.field` read still
 *      needs the independently-proven single-setter `useState` route;
 *   7. a compound assignment (`x ||= …`) is never a whole-value replacement.
 */
function resolveLetUnionShape(binding, ctx, path, depth) {
  const { name, declNode, funcScope, source } = binding;
  if (!name || !declNode || !funcScope || !source) return null;
  if (declNode.initializer) return null; // declaration-only by construction
  const declStmt = declNode.parent && declNode.parent.parent;
  if (!declStmt || !ts.isVariableStatement(declStmt)) return null;
  // `var` hoists across the scope; only `let` is ordered the way this walk reads
  if ((declStmt.declarationList.flags & ts.NodeFlags.Let) === 0) return null;

  const rhs = [];
  let refused = false;
  const walk = (node) => {
    if (refused || !node) return;
    if (ts.isIdentifier(node) && node.text === name) {
      const parent = node.parent;
      // the declaration itself is not a use
      if (parent && ts.isVariableDeclaration(parent) && parent.name === node) return;
      // whole-value assignment `x = <expr>` -- the ONLY admitted write
      if (
        parent && ts.isBinaryExpression(parent) && parent.left === node &&
        parent.operatorToken.kind === ts.SyntaxKind.EqualsToken
      ) {
        if (mentionsName(parent.right, name)) { refused = true; return; }
        rhs.push(parent.right);
        return;
      }
      // a shorthand property (`{ x }`) is the single consuming read this rule expects
      if (parent && ts.isShorthandPropertyAssignment(parent) && parent.name === node) return;
      // a plain read as a value is fine; anything that could WRITE or ALIAS is not
      if (parent && (ts.isPropertyAccessExpression(parent) || ts.isElementAccessExpression(parent)) && parent.expression === node) {
        refused = true; // `x.k` -- a property read here means a property write may exist
        return;
      }
      if (parent && ts.isCallExpression(parent) && parent.arguments.includes(node)) { refused = true; return; }
      if (parent && ts.isSpreadAssignment(parent)) return; // `...x` at the sink is the read
      if (parent && ts.isVariableDeclaration(parent) && parent.initializer === node) { refused = true; return; } // alias
      if (parent && ts.isBinaryExpression(parent) && parent.right === node) { refused = true; return; } // alias
      return;
    }
    ts.forEachChild(node, walk);
  };
  walk(funcScope);
  if (refused || rhs.length === 0) return null;

  const stepPath = [...path, { kind: "letUnion", declaredAt: binding.declaredAt }];
  const arms = [{ kind: "nonObject", reason: "let-union-unassigned", path: stepPath }];
  const receipts = [];
  for (let i = 0; i < rhs.length; i += 1) {
    const shape = resolveShape(rhs[i], freshCtx(ctx, { depth: depth + 1, path: [...stepPath, { kind: "letUnion-assignment", ordinal: i }] }));
    // an RHS whose key set is not enumerable reopens exactly what this rule excludes
    if (!keySetEnumerable(shape)) return null;
    arms.push(shape);
    receipts.push({
      at: `${source.fileName}:${source.getLineAndCharacterOfPosition(rhs[i].getStart(source)).line + 1}`,
      text: rhs[i].getText(source).slice(0, 100).replace(/\s+/g, " "),
    });
  }
  return {
    kind: "branches",
    branches: arms,
    path: stepPath,
    letUnion: { binding: name, declaredAt: binding.declaredAt, assignmentCount: receipts.length, assignments: receipts },
  };
}

/* ------------- internal-base mutation (T-INTERNAL-MUTATION) --- */
/**
 * T-INTERNAL-MUTATION -- resolve a helper that declares a FRESH INTERNAL object
 * and then composes it by mutation before returning it.
 *
 * `const base = {…}; if (c) base.k = v; Object.assign(base, other); return base;`
 * is the procedural spelling of a spread composition this resolver already
 * models. T-SEQUENTIAL-8 proves the narrow `const X = {}` form; this proves the
 * same idiom over a NON-EMPTY base, with `Object.assign` and with else-arms.
 *
 * The base must be FRESH and INTERNAL: an object literal declared here whose own
 * key set is enumerable. A base spread from a caller-supplied `style` prop is
 * refused by exactly that test -- an unresolved spread is not key-enumerable --
 * which is what keeps this rule away from the unbounded-passthrough question.
 *
 * Fail-closed on: an alias or any escape of the binding (passed to a call other
 * than as `Object.assign`'s target, returned early, closed over, read into
 * another declarator), a computed/dynamic write key, `delete`, a compound
 * assignment, `Object.assign` from a source whose key set is not enumerable, a
 * write whose value mentions the binding, a condition that mentions it, more
 * than one `return`, a return that is not the bare binding, any statement after
 * it, and any statement shape this walk does not model.
 */
function staticWritesOfStatement(stmt, name, source, conditional, conditionText, out) {
  // `X.key = expr;`
  if (ts.isExpressionStatement(stmt)) {
    const e = stmt.expression;
    if (ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
      const key = staticWriteTargetOf(e.left, name, source);
      if (key === null) return false;
      if (mentionsName(e.right, name)) return false;
      out.push({ kind: "write", key, valueNode: e.right, statement: stmt, conditional, conditionText });
      return true;
    }
    // `Object.assign(X, source)` -- the ONLY admitted call over the binding
    if (
      ts.isCallExpression(e) &&
      ts.isPropertyAccessExpression(e.expression) &&
      ts.isIdentifier(e.expression.expression) && e.expression.expression.text === "Object" &&
      e.expression.name.text === "assign" &&
      e.arguments.length === 2 &&
      ts.isIdentifier(e.arguments[0]) && e.arguments[0].text === name &&
      !mentionsName(e.arguments[1], name)
    ) {
      out.push({ kind: "assign", sourceNode: e.arguments[1], statement: stmt, conditional, conditionText });
      return true;
    }
    return false;
  }
  return false;
}

/** Collect the writes of one if/else arm; false if any statement is unmodelled.
 *
 * A statement that never mentions the binding cannot change it -- a local
 * `const` used to compute a value, a log, an early guard -- so it is skipped,
 * exactly as the top-level walk already skips them. Nested `if`/`else` inside an
 * arm recurses; anything else that DOES mention the binding is unproven. */
function collectArmWrites(node, name, source, conditionText, out) {
  const statements = ts.isBlock(node) ? [...node.statements] : [node];
  for (const st of statements) {
    if (!mentionsName(st, name)) continue;
    if (staticWritesOfStatement(st, name, source, true, conditionText, out)) continue;
    if (ts.isIfStatement(st)) {
      if (!collectIfChainWrites(st, name, source, out, conditionText)) return false;
      continue;
    }
    return false;
  }
  return true;
}

/** An `if / else if / else` chain, at any depth; false if anything is unproven. */
function collectIfChainWrites(stmt, name, source, out, outerCondition = null) {
  let node = stmt;
  while (node) {
    if (mentionsName(node.expression, name)) return false;
    const own = node.expression.getText(source).slice(0, 120).replace(/\s+/g, " ");
    const conditionText = outerCondition ? `${outerCondition} && ${own}` : own;
    if (!collectArmWrites(node.thenStatement, name, source, conditionText, out)) return false;
    const alt = node.elseStatement;
    if (!alt) return true;
    if (ts.isIfStatement(alt)) { node = alt; continue; }
    return collectArmWrites(alt, name, source, `!(${conditionText})`, out);
  }
  return true;
}

function resolveInternalMutationShape(binding, ctx, path, depth) {
  const { name, declNode, funcScope, source } = binding;
  if (!name || !declNode || !funcScope || !source) return null;
  const init = declNode.initializer;
  // FRESH: an object literal written right here. Not a call, not an identifier.
  if (!init || !ts.isObjectLiteralExpression(init)) return null;

  const body = ts.isSourceFile(funcScope) ? funcScope : funcScope.body;
  if (!body || !ts.isBlock(body)) return null;
  const statements = [...body.statements];
  const declStmtIndex = statements.findIndex((st) => st === declNode.parent?.parent);
  if (declStmtIndex < 0) return null;
  const declStmt = statements[declStmtIndex];
  if (!ts.isVariableStatement(declStmt)) return null;
  if ((declStmt.declarationList.flags & (ts.NodeFlags.Const | ts.NodeFlags.Let)) === 0) return null;
  const declSiblings = declStmt.declarationList.declarations;
  if (declSiblings.length !== 1 || declSiblings[0] !== declNode) return null;

  const ops = [];
  let returned = false;
  let conditionalReturn = false;
  for (let i = 0; i < statements.length; i += 1) {
    const stmt = statements[i];
    if (i === declStmtIndex) continue;
    if (returned) return null; // nothing may follow the return
    if (ts.isReturnStatement(stmt)) {
      const ret = stmt.expression ? unwrap(stmt.expression) : null;
      if (!ret) return null;
      if (ts.isIdentifier(ret) && ret.text === name) { returned = true; continue; }
      /* `return keys.length > 0 ? style : undefined` -- the helper hands back the
       * binding or nothing. Admitted only when ONE arm is exactly the binding and
       * the other is a proven non-object, and the condition does not read the
       * binding's contents in a way this walk models as a value. The `undefined`
       * arm contributes no key, so the key set is unchanged. */
      if (ts.isConditionalExpression(ret)) {
        const t = unwrap(ret.whenTrue), f = unwrap(ret.whenFalse);
        const isBinding = (x) => ts.isIdentifier(x) && x.text === name;
        const isNothing = (x) => (ts.isIdentifier(x) && x.text === "undefined") || x.kind === ts.SyntaxKind.NullKeyword;
        if ((isBinding(t) && isNothing(f)) || (isNothing(t) && isBinding(f))) { returned = true; conditionalReturn = true; continue; }
      }
      return null;
    }
    if (!mentionsName(stmt, name)) continue;
    if (staticWritesOfStatement(stmt, name, source, false, null, ops)) continue;
    // if / else-if / else, each arm a list of writes; the condition may not read X
    if (ts.isIfStatement(stmt)) {
      if (!collectIfChainWrites(stmt, name, source, ops)) return null;
      continue;
    }
    return null; // any other statement mentioning X is unproven
  }
  if (!returned || ops.length === 0) return null;

  // exactly one return in the whole scope, and no escape of the binding
  let returnCount = 0;
  const countReturns = (n) => {
    if (!n) return;
    if (isFunctionLike(n) && n !== funcScope) return;
    if (ts.isReturnStatement(n)) returnCount += 1;
    ts.forEachChild(n, countReturns);
  };
  countReturns(body);
  if (returnCount !== 1) return null;

  const stepPath = [...path, { kind: "internalMutation", declaredAt: binding.declaredAt }];
  // the FRESH base, resolved as the ordinary object literal it is
  const baseShape = resolveShape(init, freshCtx(ctx, { depth: depth + 1, path: [...stepPath, { kind: "mutationBase" }] }));
  if (!baseShape || baseShape.kind !== "object") return null;
  /* INTERNAL: the base must not import keys this walk cannot enumerate.
   *
   * ONE admitted exception, and it is not a weakening: a base that is the
   * CALLER'S OWN object (`{ ...style }`) is not an unenumerable third party --
   * it is a boundary, and the boundary rule classifies it by sink. Building the
   * composite here lets that rule see it; refusing would strand the row as
   * anonymous mutation debt while the real question (whose object is it?) has a
   * proper answer. Anything else unenumerable still refuses. */
  if (!keySetEnumerable(baseShape) && !publicStylePassthroughProof(baseShape)) return null;

  const order = [...baseShape.order];
  const receipts = [];
  for (const op of ops) {
    const at = `${source.fileName}:${source.getLineAndCharacterOfPosition(op.statement.getStart(source)).line + 1}`;
    if (op.kind === "assign") {
      const src = resolveShape(op.sourceNode, freshCtx(ctx, { depth: depth + 1, path: [...stepPath, { kind: "objectAssignSource" }] }));
      // an Object.assign from an open source would import unknown keys
      if (!keySetEnumerable(src)) return null;
      receipts.push({ kind: "assign", at, conditional: op.conditional, condition: op.conditionText });
      order.push({
        kind: "spread",
        node: op.statement,
        shape: op.conditional
          ? { kind: "branches", branches: [src, { kind: "object", order: [], closed: true, path: stepPath, node: init, fileRel: source.fileName }], path: stepPath }
          : src,
      });
      continue;
    }
    const valueShape = resolveShape(op.valueNode, freshCtx(ctx, { depth: depth + 1, path: [...stepPath, { kind: "objectProperty", key: op.key }] }));
    receipts.push({ kind: "write", key: op.key, at, conditional: op.conditional, condition: op.conditionText });
    if (!op.conditional) {
      order.push({ kind: "leaf", key: op.key, node: op.valueNode, source, fileRel: source.fileName, declNode: op.statement, shape: valueShape, unresolvedKey: false });
      continue;
    }
    const present = { kind: "object", order: [{ kind: "leaf", key: op.key, node: op.valueNode, source, fileRel: source.fileName, declNode: op.statement, shape: valueShape, unresolvedKey: false }], closed: isShapeClosed(valueShape), path: stepPath, node: init, fileRel: source.fileName };
    const absent = { kind: "object", order: [], closed: true, path: stepPath, node: init, fileRel: source.fileName };
    order.push({ kind: "spread", node: op.statement, shape: { kind: "branches", branches: [present, absent], path: stepPath } });
  }

  return {
    kind: "object",
    order,
    closed: order.every(entryIsClosed),
    path: stepPath,
    node: init,
    fileRel: source.fileName,
    internalMutation: {
      binding: name,
      declaredAt: binding.declaredAt,
      conditionalReturn,
      baseKeyCount: baseShape.order.length,
      operationCount: receipts.length,
      operations: receipts,
    },
  };
}

/* ------------- custom-property namespace relay (T-NAMESPACE-RELAY) --- */
/**
 * T-NAMESPACE-RELAY -- a value whose declared type bounds it to a custom-property
 * NAMESPACE rather than to a key set.
 *
 * `DsPortalVariableStyle = CSSProperties & Partial<Record<`--ds-${string}`, string>>`
 * is the canonical shape: a live snapshot whose keys are decided at runtime by
 * reading the DOM, bounded by construction to one prefix. Such a value has no
 * enumerable key set, so it can never be a ZERO (that would certify silence it
 * has not got) and never a PRODUCER (there is no key set to attribute). It is a
 * RELAY: a passthrough this walk names, bounds and refuses to enumerate.
 *
 * The proof is the TYPE, not a name: the declared type must mention a
 * template-literal type whose head begins with `--`. Nothing else qualifies, and
 * nothing about tenant reach, roots or keys is ever inferred from it.
 */
function customPropertyNamespaceOfType(typeNode, source, depth = 0, seen = new Set()) {
  if (!typeNode || depth > 6) return null;
  let found = null;
  const walk = (node) => {
    if (found || !node) return;
    // `--ds-${string}` -- the head carries the literal prefix
    if (ts.isTemplateLiteralTypeNode(node) && node.head && typeof node.head.text === "string" && node.head.text.startsWith("--")) {
      found = node.head.text;
      return;
    }
    ts.forEachChild(node, walk);
  };
  walk(typeNode);
  if (found) return { namespace: found, declaredIn: source.fileName };
  // follow ONE bare type reference hop, locally or through a named import
  let node = typeNode;
  while (ts.isParenthesizedTypeNode(node)) node = node.type;
  if (!ts.isTypeReferenceNode(node) || !ts.isIdentifier(node.typeName)) return null;
  const name = node.typeName.text;
  const key = `${source.fileName}::${name}`;
  if (seen.has(key)) return null;
  seen.add(key);
  for (const stmt of source.statements) {
    if ((ts.isTypeAliasDeclaration(stmt) || ts.isInterfaceDeclaration(stmt)) && stmt.name.text === name) {
      const body = ts.isTypeAliasDeclaration(stmt) ? stmt.type : stmt;
      const hit = customPropertyNamespaceOfType(body, source, depth + 1, seen);
      return hit ? { ...hit, typeName: name } : null;
    }
  }
  const imported = collectModuleImports(source).get(name);
  if (!imported || imported.form !== "named") return null;
  const targetFile = resolveImportTargetFile(imported.moduleSpecifier, source.fileName);
  if (!targetFile) return null;
  const entry = getSource(targetFile);
  if (!entry) return null;
  const wanted = imported.importedName ?? name;
  for (const stmt of entry.source.statements) {
    if ((ts.isTypeAliasDeclaration(stmt) || ts.isInterfaceDeclaration(stmt)) && stmt.name.text === wanted) {
      const body = ts.isTypeAliasDeclaration(stmt) ? stmt.type : stmt;
      const hit = customPropertyNamespaceOfType(body, entry.source, depth + 1, seen);
      return hit ? { ...hit, typeName: wanted } : null;
    }
  }
  return null;
}

/* ---------------------------- React useState resolution (T-USE-STATE) --- */
/**
 * T-USE-STATE -- resolve `const [v, setV] = useState<T>(init)` when the hook is
 * the CANONICAL React one and the whole state domain is first-party.
 *
 * The resolver stops at `external-npm-package` the moment it sees the callee
 * imported from `react`, without looking at the type argument or the initial
 * value -- both first-party and both right there in the file. The state a
 * component can ever hold is exactly `init` plus every value handed to its own
 * setter, so when all of those resolve, the domain is decidable.
 *
 * Fail-closed on everything else: a `useState` that is not a named import from
 * exactly `react`; a non-array binding pattern; a positional index other than
 * the state slot; a setter referenced anywhere except as the callee of a direct
 * one-argument call (passed as a value, aliased, or curried); a functional
 * update (`setV(prev => …)`), whose result depends on the previous state; and
 * any argument this walk cannot resolve.
 */
function canonicalUseStateCall(sourceExpr, source) {
  const call = unwrap(sourceExpr);
  if (!ts.isCallExpression(call)) return null;
  const callee = unwrap(call.expression);
  if (!ts.isIdentifier(callee) || callee.text !== "useState") return null;
  const imported = collectModuleImports(source).get(callee.text);
  // the canonical hook: a NAMED import of `useState` from exactly `react`
  if (!imported || imported.form !== "named") return null;
  if (imported.moduleSpecifier !== "react") return null;
  if ((imported.importedName ?? callee.text) !== "useState") return null;
  return call;
}

/** Every direct `setter(arg)` call in the file, or null if the setter escapes. */
function exhaustiveSetterArguments(setterName, source, declNode) {
  const args = [];
  let escaped = false;
  const walk = (n) => {
    if (escaped || !n) return;
    if (ts.isIdentifier(n) && n.text === setterName) {
      const parent = n.parent;
      // the binding element that declares it is not a use
      if (parent && ts.isBindingElement(parent) && parent.name === n) return;
      // the ONLY admitted use is as the callee of a direct call
      if (parent && ts.isCallExpression(parent) && parent.expression === n) {
        if (parent.arguments.length !== 1) { escaped = true; return; }
        const arg = unwrap(parent.arguments[0]);
        // a functional update reads the PREVIOUS state -- not resolvable here
        if (ts.isArrowFunction(arg) || ts.isFunctionExpression(arg)) { escaped = true; return; }
        args.push(arg);
        return;
      }
      escaped = true;
      return;
    }
    ts.forEachChild(n, walk);
  };
  walk(source);
  return escaped ? null : args;
}

/* ------------- closed record via Object.entries (T-ENTRIES-RECORD) --- */
/**
 * T-ENTRIES-RECORD -- `for (const [k, v] of Object.entries(R))` where `R` is a
 * LOCAL CONST whose initializer the resolver already proves to be a closed,
 * finite record.
 *
 * The stamped name is not a literal, but it ranges over exactly the key set of
 * that record, and this walk can already enumerate that key set with the
 * machinery it has -- no container semantics, no call-graph enumeration, no
 * interpretation of the loop body. If the record is enumerable, the domain is
 * enumerable.
 *
 * Fail-closed on everything else: a name that is not the first element of the
 * `for…of` array pattern; an iterable that is not exactly `Object.entries(<ident>)`;
 * a binding that is not a local `const`, or that is mutated; an initializer the
 * resolver cannot prove closed (a spread it could not follow, a computed key, an
 * open branch, a relay, an unresolved import); and an empty key set.
 *
 * Unlike T-DYNAMIC-DOMAIN -- which enumerates a frozen array of PLAIN property
 * names and refuses outright if a custom property appears -- this rule exists
 * precisely for records that DO carry custom properties. It therefore publishes
 * them as the emission they are: the synthetic shape carries one leaf per key,
 * so the ordinary governance scan classifies the row as a producer. A record of
 * custom properties can never certify here as a zero emission.
 */
function staticKeyUnionOf(shape, depth = 0, seen = new WeakSet(), out = new Set()) {
  if (!shape || typeof shape !== "object" || depth > 40) return null;
  if (seen.has(shape)) return null; // cycle / shared node -> fail closed
  seen.add(shape);
  switch (shape.kind) {
    case "nonObject":
      return out; // an `undefined` arm contributes no key
    case "object": {
      for (const entry of shape.order ?? []) {
        if (entry.kind === "spread") {
          // a spread only contributes if IT is enumerable too
          if (!staticKeyUnionOf(entry.shape, depth + 1, seen, out)) return null;
          continue;
        }
        if (entry.unresolvedKey) return null;
        if (typeof entry.key !== "string" || entry.key.length === 0) return null;
        out.add(entry.key);
      }
      return out;
    }
    case "branches": {
      const arms = shape.branches ?? [];
      if (!arms.length) return null;
      for (const arm of arms) if (!staticKeyUnionOf(arm, depth + 1, seen, out)) return null;
      return out;
    }
    default:
      // array, computedKey, relay, openUnknown, callArgsPending, dynamicSink
      return null;
  }
}

/** The `for…of` whose array pattern binds `identifier` at position 0. */
function forOfEntriesSourceOf(identifier, source) {
  let current = identifier.parent;
  while (current && !ts.isSourceFile(current)) {
    if (ts.isForOfStatement(current)) {
      const init = current.initializer;
      if (!ts.isVariableDeclarationList(init)) return null;
      if ((init.flags & ts.NodeFlags.Const) === 0) return null;
      if (init.declarations.length !== 1) return null;
      const name = init.declarations[0].name;
      if (!ts.isArrayBindingPattern(name) || name.elements.length === 0) return null;
      const first = name.elements[0];
      if (!ts.isBindingElement(first) || !ts.isIdentifier(first.name)) return null;
      if (first.name.text !== identifier.text) return null; // only the KEY slot
      // the iterable must be exactly `Object.entries(<ident>)`
      const call = unwrap(current.expression);
      if (!ts.isCallExpression(call) || call.arguments.length !== 1) return null;
      const callee = unwrap(call.expression);
      if (!ts.isPropertyAccessExpression(callee)) return null;
      if (!ts.isIdentifier(callee.expression) || callee.expression.text !== "Object") return null;
      if (callee.name.text !== "entries") return null;
      const arg = unwrap(call.arguments[0]);
      return ts.isIdentifier(arg) ? arg : null;
    }
    current = current.parent;
  }
  return null;
}

export function entriesRecordSetPropertyDomain(callNode, source, fileRel) {
  if (!ts.isCallExpression(callNode) || callNode.arguments.length < 1) return null;
  const nameArg = unwrap(callNode.arguments[0]);
  if (!ts.isIdentifier(nameArg)) return null;
  const recordIdent = forOfEntriesSourceOf(nameArg, source);
  if (!recordIdent) return null;

  const binding = resolveBinding(recordIdent.text, recordIdent, source, collectModuleImports(source));
  if (!binding || binding.kind !== "localConst" || binding.mutated) return null;
  /* `localConst` is the resolver's name for "a local with an initializer" and
   * covers `let` as well; `mutated` then excludes the ones it can SEE rebound.
   * That is not enough here. A `let` is a binding that PERMITS rebinding, and
   * this walk sees one file -- absence of an observed write is not proof of
   * immutability. Require the declaration itself to be `const`. */
  const declList = binding.declNode?.parent;
  if (!declList || !ts.isVariableDeclarationList(declList)) return null;
  if ((declList.flags & ts.NodeFlags.Const) === 0) return null;

  const shape = resolveShape(binding.node, {
    source,
    fileRel,
    depth: 0,
    path: [{ kind: "entriesRecord", name: recordIdent.text }],
  });
  if (!keySetEnumerable(shape)) return null;
  const keys = staticKeyUnionOf(shape);
  if (!keys || keys.size === 0) return null;

  const names = [...keys];
  const order = names.map((key) => ({
    kind: "leaf",
    key,
    node: recordIdent,
    source,
    fileRel,
    declNode: recordIdent,
    // the VALUE is whatever the record holds; it can never add a key
    shape: { kind: "nonObject", reason: "set-property-value", path: [] },
    unresolvedKey: false,
  }));
  return {
    shape: {
      kind: "object",
      order,
      closed: true,
      path: [{ kind: "terminal-at-sink", form: "dynamic-setProperty" }, { kind: "entriesRecordDomain", name: recordIdent.text }],
      node: callNode,
      fileRel,
    },
    receipt: {
      record: recordIdent.text,
      recordAt: `${fileRel}:${source.getLineAndCharacterOfPosition(recordIdent.getStart(source)).line + 1}`,
      names,
      nameCount: names.length,
      customPropertyCount: names.filter((n) => n.startsWith("--")).length,
    },
  };
}

/* ------------- publicly reachable generic writer (T-PUBLIC-WRITER) --- */
/**
 * T-PUBLIC-WRITER -- `element.style.setProperty(property, …)` where `property` is
 * a PARAMETER of a function this package publishes.
 *
 * The in-repo call sites of such a function prove nothing about its domain: any
 * consumer of the published package can call it with any property name,
 * including a governed channel. So the honest classification is not ZERO --
 * that would certify a silence the export cannot guarantee -- and not PRODUCER
 * either, because no key set exists to attribute. It is a PUBLIC BOUNDARY: the
 * caller supplies the name, exactly as the caller supplies a `style` object at
 * a JSX boundary, and the row grants nothing.
 *
 * The proof is the EXPORT, and it is the whole proof:
 *   - the name argument is a plain identifier;
 *   - it binds to a PARAMETER (not a local, not a literal, not a loop variable
 *     over a frozen constant -- that case is T-DYNAMIC-DOMAIN and closes ZERO);
 *   - the function owning that parameter is reachable from a published
 *     entrypoint, demonstrated by `isDeclarationPubliclyReachable`, whose hit is
 *     published verbatim as the receipt.
 *
 * A private or non-exported writer is REFUSED and stays a pending dynamic sink.
 * Elevating it would be strictly worse than leaving it open: it would claim a
 * boundary that does not exist, and it would hide a domain that IS in principle
 * enumerable from its own module's call sites.
 *
 * This closes the row's PROVENANCE, not its debt: the domain of names such a
 * writer can stamp remains unenumerated, and the row stays non-consumable and
 * non-tenant-safe. It is carried as explicit F5 debt.
 */
export function publicGenericWriterProof(callNode, source, fileRel) {
  if (!ts.isCallExpression(callNode) || callNode.arguments.length < 1) return null;
  const nameArg = unwrap(callNode.arguments[0]);
  if (!ts.isIdentifier(nameArg)) return null;
  const binding = resolveBinding(nameArg.text, nameArg, source, collectModuleImports(source));
  // ONLY a parameter. A local const, a literal or a `for…of` variable is a
  // different question with a different (and stricter) answer.
  if (!binding || binding.kind !== "param") return null;
  const ownerName = binding.ownerFunction;
  if (!ownerName) return null;
  const hit = isDeclarationPubliclyReachable(fileRel, ownerName);
  if (!hit) return null; // private / not exported -> stays pending, never elevated
  return {
    exportEvidence: {
      entrypoint: hit.entrypoint ?? null,
      exportedAs: hit.exportedAs ?? null,
      via: hit.via ?? "package-export",
      hopChain: hit.hopChain ?? [],
    },
    receipt: {
      writer: ownerName,
      parameter: nameArg.text,
      declaredAt: binding.declaredAt ?? null,
      entrypoint: hit.entrypoint ?? null,
      exportedAs: hit.exportedAs ?? null,
      domainEnumerated: false,
      residualDebt: "f5-generic-writer-name-domain",
    },
  };
}

/* --------------------- dynamic setProperty domain (T-DYNAMIC-DOMAIN) --- */
/**
 * T-DYNAMIC-DOMAIN -- a `style.setProperty(name, value)` whose NAME is a
 * `for…of` variable over a frozen, finite, same-module constant array.
 *
 * `dynamic-setProperty` is published unresolved because the stamped property is
 * not a literal at the sink. When the name ranges over an `as const` array
 * declared in the SAME module, the set of names it can ever stamp IS statically
 * enumerable, so the sink is decidable without inventing anything.
 *
 * Fail-closed on everything else: a non-identifier name, a name that is not a
 * `for…of` const binding, an iterable that is not a same-module `const`, an
 * array without `as const`, a container that is reassigned or mutated anywhere
 * in the module, a non-string element, a spread of anything but another array
 * proven by this same predicate, and the depth guard.
 *
 * **Any element beginning with `--` refuses the whole domain.** Such an array
 * would make the sink a real custom-property producer whose attribution this
 * predicate cannot supply, and admitting it would certify an emission as
 * silent. The refusal is unconditional -- it is not a namespace filter, it is
 * a hard stop.
 */
function constStringArrayElements(name, source, depth = 0, seen = new Set()) {
  if (depth > 4) return null;
  const key = `${source.fileName}::${name}`;
  if (seen.has(key)) return null; // cycle -> fail closed
  seen.add(key);
  let decl = null;
  for (const stmt of source.statements) {
    if (!ts.isVariableStatement(stmt)) continue;
    if ((stmt.declarationList.flags & ts.NodeFlags.Const) === 0) continue;
    for (const d of stmt.declarationList.declarations) {
      if (ts.isIdentifier(d.name) && d.name.text === name && d.initializer) decl = d;
    }
  }
  if (!decl) return null;
  // the binding must never be reassigned or mutated anywhere in the module
  if (hasReassignmentOrMutation(source, name)) return null;
  let init = decl.initializer;
  // only an `as const` array literal is admitted: a plain array is mutable
  if (!ts.isAsExpression(init)) return null;
  if (!(ts.isTypeReferenceNode(init.type) && ts.isIdentifier(init.type.typeName) && init.type.typeName.text === "const")) return null;
  init = init.expression;
  if (!ts.isArrayLiteralExpression(init)) return null;
  const out = [];
  for (const el of init.elements) {
    if (ts.isSpreadElement(el)) {
      if (!ts.isIdentifier(el.expression)) return null;
      const nested = constStringArrayElements(el.expression.text, source, depth + 1, seen);
      if (!nested) return null;
      out.push(...nested);
      continue;
    }
    if (!ts.isStringLiteralLike(el)) return null;
    out.push({ text: el.text, node: el });
  }
  if (!out.length) return null;
  // a custom property in the domain makes this a real producer -- hard stop
  if (out.some((e) => e.text.startsWith("--"))) return null;
  return out;
}

/** The `for…of` const binding a name identifier comes from, or null. */
function forOfConstIterableOf(identifier, source) {
  let current = identifier.parent;
  while (current && !ts.isSourceFile(current)) {
    if (ts.isForOfStatement(current)) {
      const init = current.initializer;
      if (!ts.isVariableDeclarationList(init)) return null;
      if ((init.flags & ts.NodeFlags.Const) === 0) return null;
      if (init.declarations.length !== 1) return null;
      const d = init.declarations[0];
      if (!ts.isIdentifier(d.name) || d.name.text !== identifier.text) return null;
      return current.expression;
    }
    current = current.parent;
  }
  return null;
}

/**
 * Resolve a dynamic `setProperty` sink to the closed set of property names it
 * can stamp, as a synthetic object shape whose leaves are exactly those names.
 * Returns null when anything is unproven.
 */
export function dynamicSetPropertyDomain(callNode, source, fileRel) {
  if (!ts.isCallExpression(callNode) || callNode.arguments.length < 1) return null;
  const nameArg = unwrap(callNode.arguments[0]);
  if (!ts.isIdentifier(nameArg)) return null;
  const iterable = forOfConstIterableOf(nameArg, source);
  if (!iterable || !ts.isIdentifier(iterable)) return null;
  const elements = constStringArrayElements(iterable.text, source);
  if (!elements) return null;
  const order = elements.map((e) => ({
    kind: "leaf",
    key: e.text,
    node: e.node,
    source,
    fileRel,
    declNode: e.node,
    // the VALUE is whatever the caller computes; it can never add a key
    shape: { kind: "nonObject", reason: "set-property-value", path: [] },
    unresolvedKey: false,
  }));
  return {
    shape: { kind: "object", order, closed: true, path: [{ kind: "terminal-at-sink", form: "dynamic-setProperty" }, { kind: "dynamicDomain", name: iterable.text }], node: callNode, fileRel },
    receipt: {
      container: iterable.text,
      containerAt: `${fileRel}:${source.getLineAndCharacterOfPosition(iterable.getStart(source)).line + 1}`,
      names: elements.map((e) => e.text),
      nameCount: elements.length,
    },
  };
}

/* ------------------------------- sealed imported relay (T-SEALED-RELAY) --- */
/**
 * T-SEALED-RELAY -- prove that `<ident>.<prop>` at a style sink is a PRIVATE
 * RELAY of one externally-owned producer, not content authored here.
 *
 * The resolver already follows such a read across the import graph and reaches
 * the upstream object literal. When that literal's VALUES are runtime
 * expressions the object never closes, so the reading site is published as
 * AUTHORED_OPEN -- which states something false about it: the site authors
 * nothing. Its whole content is one property of one imported call's sealed
 * return type.
 *
 * This pass proves exactly that, and nothing more. It never closes the values
 * and never attributes a channel: the row stays non-consumable, non-tenant-safe
 * and unattributed. What it buys is an HONEST disposition -- a relay with a
 * durable receipt naming the binding, the import/export, the property, the sole
 * upstream owner and the exact key set -- instead of open authored debt.
 *
 * The proof is 100% syntactic: no type checker, no inference, no name or path
 * allowlist. `overlayMotion`, `pressMotion`, `stateMotion` and every other local
 * alias are irrelevant to it -- the predicate keys off the BINDING FORM and the
 * DECLARED TYPES it reaches. Everything not exhaustively proven stays open:
 * a locally-declared lookalike, a non-`const` or mutated binding, a callee that
 * is not a named import, a missing return annotation, a generic/extended/
 * optional/indexed/method-bearing declaration, a branching producer, and any
 * disagreement between the declared key set and the re-derived one.
 */

/** One nested type declaration is SEALED only in this exhaustive form. */
function sealedMemberNamesOf(decl) {
  if (!decl) return null;
  // a generic declaration is instantiated per use -- never proven here
  if (decl.typeParameters && decl.typeParameters.length > 0) return null;
  let members = null;
  if (ts.isInterfaceDeclaration(decl)) {
    // `extends` imports members this walk does not enumerate
    if (decl.heritageClauses && decl.heritageClauses.length > 0) return null;
    members = decl.members;
  } else if (ts.isTypeAliasDeclaration(decl)) {
    let body = decl.type;
    while (body && ts.isParenthesizedTypeNode(body)) body = body.type;
    if (!body || !ts.isTypeLiteralNode(body)) return null; // unions/mapped/etc: not sealed
    members = body.members;
  } else {
    return null;
  }
  if (!members || members.length === 0) return null;
  const names = [];
  for (const member of members) {
    // an index signature, call/construct signature, method or accessor makes the
    // key set non-enumerable or the value callable: fail closed on all of them
    if (!ts.isPropertySignature(member)) return null;
    if (member.questionToken) return null; // optional: the key may be absent
    const name = member.name;
    if (!name) return null;
    if (ts.isIdentifier(name) || ts.isStringLiteralLike(name) || ts.isNumericLiteral(name)) {
      names.push({ name: name.text, typeNode: member.type ?? null });
      continue;
    }
    return null; // computed member name
  }
  return names;
}

/**
 * Resolve a bare type REFERENCE to its sealed declaration, locally or through a
 * real named import / re-export hop. A generic instantiation, a namespace or
 * default import form, and an unresolvable specifier are all refused.
 */
function resolveSealedTypeDecl(typeNode, source, depth = 0, seen = new Set()) {
  if (!typeNode || depth > 8) return null;
  let node = typeNode;
  while (ts.isParenthesizedTypeNode(node)) node = node.type;
  if (!ts.isTypeReferenceNode(node) || !ts.isIdentifier(node.typeName)) return null;
  if (node.typeArguments && node.typeArguments.length > 0) return null;
  const name = node.typeName.text;
  const key = `${source.fileName}::${name}`;
  if (seen.has(key)) return null; // reference cycle -> fail closed
  seen.add(key);
  for (const stmt of source.statements) {
    if (
      (ts.isInterfaceDeclaration(stmt) || ts.isTypeAliasDeclaration(stmt)) &&
      stmt.name.text === name
    ) {
      const members = sealedMemberNamesOf(stmt);
      return members ? { members, declSource: source, declName: name } : null;
    }
  }
  const imported = collectModuleImports(source).get(name);
  if (!imported || imported.form !== "named") return null;
  const targetFile = resolveImportTargetFile(imported.moduleSpecifier, source.fileName);
  if (!targetFile) return null;
  const entry = getSource(targetFile);
  if (!entry) return null;
  const wanted = imported.importedName ?? name;
  const synthetic = ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(wanted), undefined);
  // the synthetic reference carries no position: resolve it against the target
  // module's own statements exactly as a written reference would be
  return resolveSealedTypeDecl(synthetic, entry.source, depth + 1, seen);
}

/** Follow `export { X } from '...'` hops to the declaration that owns the name. */
function followExportedDecl(targetFile, importedName, depth = 0) {
  if (depth > 8) return null;
  const entry = getSource(targetFile);
  if (!entry) return null;
  const exported = findExportedDecl(entry.source, importedName, "named");
  if (!exported) return null;
  if (exported.kind === "reExport") {
    if (!exported.moduleSpecifier) return null;
    const next = resolveImportTargetFile(exported.moduleSpecifier, targetFile);
    if (!next) return null;
    return followExportedDecl(next, exported.importedName, depth + 1);
  }
  return { exported, file: targetFile, source: entry.source };
}

/** The nearest NAMED function-like owner of a node, for the receipt. */
function owningFunctionNameOf(node) {
  let current = node?.parent;
  while (current) {
    if (ts.isFunctionDeclaration(current) && current.name) return current.name.text;
    if (
      (ts.isArrowFunction(current) || ts.isFunctionExpression(current)) &&
      current.parent &&
      ts.isVariableDeclaration(current.parent) &&
      ts.isIdentifier(current.parent.name)
    ) {
      return current.parent.name.text;
    }
    if (ts.isFunctionExpression(current) && current.name) return current.name.text;
    current = current.parent;
  }
  return null;
}

/**
 * The key set an object literal STATICALLY declares, or null when any member
 * makes it non-enumerable (spread, computed key, getter/setter/method).
 */
function staticObjectLiteralKeys(objectNode) {
  if (!objectNode || !ts.isObjectLiteralExpression(objectNode)) return null;
  const keys = [];
  for (const property of objectNode.properties) {
    if (ts.isShorthandPropertyAssignment(property)) {
      keys.push(property.name.text);
      continue;
    }
    if (!ts.isPropertyAssignment(property)) return null; // spread/method/accessor
    const name = property.name;
    if (ts.isIdentifier(name) || ts.isStringLiteralLike(name) || ts.isNumericLiteral(name)) {
      keys.push(name.text);
      continue;
    }
    return null; // computed key
  }
  return keys.length ? keys : null;
}

/**
 * The whole predicate. `valueShape` is what the ordinary property read already
 * produced; it is the RE-DERIVATION the declared key set must agree with, and
 * it is also the uniqueness proof: a single `object` shape means a single
 * producer literal. A `branches` shape (two possible producers) is refused.
 */
function sealedImportRelayProof(n, ctx, valueShape) {
  const { source, substitution = new Map() } = ctx;
  if (!ts.isPropertyAccessExpression(n)) return null;
  if (n.questionDotToken) return null; // optional chaining: the read may not happen
  if (!ts.isIdentifier(n.name)) return null;
  const property = n.name.text;
  const objectIdent = n.expression;
  if (!ts.isIdentifier(objectIdent)) return null;
  // a substituted parameter is a caller's value, not a local binding
  if (substitution.has(objectIdent.text)) return null;

  const moduleImports = collectModuleImports(source);
  const binding = resolveBinding(objectIdent.text, objectIdent, source, moduleImports);
  if (!binding || binding.kind !== "localConst" || binding.mutated) return null;

  const init = unwrap(binding.node);
  if (!ts.isCallExpression(init)) return null;
  const callee = unwrap(init.expression);
  if (!ts.isIdentifier(callee)) return null;
  const calleeBinding = resolveBinding(callee.text, callee, source, moduleImports);
  if (!calleeBinding || calleeBinding.kind !== "import" || calleeBinding.form !== "named") return null;

  const targetFile = resolveImportTargetFile(calleeBinding.moduleSpecifier, ctx.fileRel);
  if (!targetFile) return null;
  const resolvedExport = followExportedDecl(targetFile, calleeBinding.importedName ?? callee.text);
  if (!resolvedExport || resolvedExport.exported.kind !== "namedFunction") return null;
  const fnNode = resolvedExport.exported.node;
  // an INFERRED return type is never accepted: the seal must be written down
  if (!fnNode.type) return null;
  const outer = resolveSealedTypeDecl(fnNode.type, resolvedExport.source);
  if (!outer) return null;
  const member = outer.members.find((m) => m.name === property);
  if (!member || !member.typeNode) return null;
  const relayed = resolveSealedTypeDecl(member.typeNode, outer.declSource);
  if (!relayed) {
    /* T-NAMESPACE-RELAY: the property is not key-enumerable, but its declared
     * type may still bound it to a custom-property NAMESPACE. That is a relay
     * too -- the same chain, a weaker (and honestly weaker) guarantee: a prefix
     * instead of a key set. Nothing is enumerated and nothing is attributed. */
    const ns = customPropertyNamespaceOfType(member.typeNode, outer.declSource);
    if (!ns) return null;
    return {
      namespaceProof: {
        origin: "imported-call-property",
        localBinding: objectIdent.text,
        localDeclaredAt: binding.declaredAt ?? null,
        importedCallee: callee.text,
        moduleSpecifier: calleeBinding.moduleSpecifier,
        importedName: calleeBinding.importedName ?? callee.text,
        exportFile: resolvedExport.file,
        exportedFunction: fnNode.name ? fnNode.name.text : null,
        returnType: outer.declName,
        property,
        typeName: ns.typeName ?? null,
        namespace: ns.namespace,
      },
    };
  }
  const declaredKeys = relayed.members.map((m) => m.name);

  // uniqueness + re-derivation: ONE object literal, and its static key set is
  // exactly the declared one. Anything else -- branches, a relay, a computed
  // lookup, a spread inside the producer -- refuses the proof.
  if (!valueShape || valueShape.kind !== "object" || !valueShape.node) return null;
  const derivedKeys = staticObjectLiteralKeys(valueShape.node);
  if (!derivedKeys) return null;
  /* A REPEATED key is not an enumeration of the declared set. `{a: 1, a: 2}`
   * against a declared `{a, b}` has the same LENGTH and every member is
   * declared, so a length+membership test alone admits it -- while the literal
   * actually produces one key and never produces `b`. Both sides must be sets
   * before they can be compared as sets. */
  if (new Set(derivedKeys).size !== derivedKeys.length) return null;
  if (derivedKeys.length !== declaredKeys.length) return null;
  const declaredSet = new Set(declaredKeys);
  if (declaredSet.size !== declaredKeys.length) return null;
  if (!derivedKeys.every((k) => declaredSet.has(k))) return null;

  const ownerFunction = owningFunctionNameOf(valueShape.node);
  if (!ownerFunction) return null; // an unnameable owner cannot be published
  const declSource = valueShape.node.getSourceFile();
  return {
    localBinding: objectIdent.text,
    localDeclaredAt: binding.declaredAt ?? null,
    importedCallee: callee.text,
    moduleSpecifier: calleeBinding.moduleSpecifier,
    importedName: calleeBinding.importedName ?? callee.text,
    exportFile: resolvedExport.file,
    exportedFunction: fnNode.name ? fnNode.name.text : null,
    returnType: outer.declName,
    property,
    propertyType: relayed.declName,
    owner: ownerFunction,
    ownerFile: valueShape.fileRel ?? null,
    ownerDeclaredAt: declSource
      ? `${declSource.fileName}:${declSource.getLineAndCharacterOfPosition(valueShape.node.getStart(declSource)).line + 1}`
      : null,
    keys: [...declaredKeys].sort(),
    keyCount: declaredKeys.length,
  };
}

/* --------------------------------------------------- domain enumeration --- */
function enumerateKeyDomainByType(keyNode, useNode, source, { allowNullish = false } = {}) {
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
  /* A named alias is as enumerable as an inline union: follow ONE hop to its
   * declaration (locally or through a named import) and read the union there.
   * Anything that is not a plain union of string literals still refuses. */
  if (typeNode && !ts.isUnionTypeNode(typeNode) && ts.isTypeReferenceNode(typeNode) && ts.isIdentifier(typeNode.typeName) && !typeNode.typeArguments) {
    const aliasName = typeNode.typeName.text;
    let aliasBody = null;
    for (const stmt of source.statements) {
      if (ts.isTypeAliasDeclaration(stmt) && stmt.name.text === aliasName && !stmt.typeParameters) aliasBody = stmt.type;
    }
    if (!aliasBody) {
      const imported = collectModuleImports(source).get(aliasName);
      if (imported && imported.form === "named") {
        const targetFile = resolveImportTargetFile(imported.moduleSpecifier, source.fileName);
        const entry = targetFile ? getSource(targetFile) : null;
        if (entry) {
          const wanted = imported.importedName ?? aliasName;
          for (const stmt of entry.source.statements) {
            if (ts.isTypeAliasDeclaration(stmt) && stmt.name.text === wanted && !stmt.typeParameters) aliasBody = stmt.type;
          }
        }
      }
    }
    if (aliasBody) typeNode = aliasBody;
  }
  if (!typeNode || !ts.isUnionTypeNode(typeNode)) return null;
  const literals = [];
  for (const member of typeNode.types) {
    if (ts.isLiteralTypeNode(member) && ts.isStringLiteralLike(member.literal)) { literals.push(member.literal.text); continue; }
    /* A nullish member of the union. For a computed property NAME it is not a
     * reason to give up: JavaScript coerces it to the literal key "undefined" /
     * "null", so the domain is still finite and still enumerable -- and neither
     * coerced name is a custom property, so nothing can hide behind it. Only the
     * computed-NAME caller opts in; index-access enumeration keeps refusing, so
     * no row that closes today changes. */
    if (allowNullish && (member.kind === ts.SyntaxKind.UndefinedKeyword || member.kind === ts.SyntaxKind.NullKeyword)) {
      literals.push(member.kind === ts.SyntaxKind.UndefinedKeyword ? "undefined" : "null");
      continue;
    }
    if (allowNullish && ts.isLiteralTypeNode(member) && member.literal.kind === ts.SyntaxKind.NullKeyword) { literals.push("null"); continue; }
    return null;
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
        let resolvedKey = key;
        let keyDomain = null;
        if (resolvedKey === null && ts.isComputedPropertyName(property.name)) {
          /* T-COMPUTED-NAME: a computed PROPERTY NAME is not automatically
           * unknowable. Two proofs, both fail-closed:
           *   (1) the expression substitutes to a literal at this call site
           *       (`buildPinStyle('right', …)` makes `[side]` exactly `right`);
           *   (2) its declared type is a closed literal union, so the name
           *       ranges over a finite, enumerable set.
           * Anything else keeps `unresolvedKey` and the object stays open. */
          const nameExpr = unwrap(property.name.expression);
          const substituted = ts.isIdentifier(nameExpr) && substitution.has(nameExpr.text)
            ? unwrap(substitution.get(nameExpr.text).node ?? nameExpr)
            : nameExpr;
          if (ts.isStringLiteralLike(substituted)) {
            resolvedKey = substituted.text;
          } else {
            const domain = enumerateKeyDomainByType(nameExpr, property.name, source, { allowNullish: true });
            if (domain && domain.length) keyDomain = domain;
          }
        }
        const unresolvedKey = resolvedKey === null && keyDomain === null && ts.isComputedPropertyName(property.name);
        const valueNode = ts.isShorthandPropertyAssignment(property) ? property.name : property.initializer;
        const valueShape = resolveShape(valueNode, freshCtx(ctx, { depth: depth + 1, path: [...path, { kind: "objectProperty", key: resolvedKey ?? "(non-channel-key)" }] }));
        if (keyDomain) {
          // one CONDITIONAL member per enumerated name: the union of them is the
          // exact key set this property can contribute, and no member is asserted
          /* Each arm resolves its OWN value shape. Sharing one object across the
           * arms would make the governance walk meet the same node twice and
           * report a CYCLE -- a DAG is not a cycle, and a false positive there
           * fails the whole row closed for no reason. */
          const arms = keyDomain.map((member) => {
            const armValue = resolveShape(valueNode, freshCtx(ctx, { depth: depth + 1, path: [...path, { kind: "objectProperty", key: member }] }));
            return {
              kind: "object",
              order: [{ kind: "leaf", key: member, node: valueNode, source, fileRel, declNode: property, shape: armValue, unresolvedKey: false }],
              closed: isShapeClosed(armValue),
              path,
              node: n,
              fileRel,
            };
          });
          order.push({ kind: "spread", node: property, shape: { kind: "branches", branches: arms, computedNameDomain: keyDomain, path } });
          continue;
        }
        order.push({ kind: "leaf", key: resolvedKey, node: valueNode, source, fileRel, declNode: property, shape: valueShape, unresolvedKey });
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
    if (binding.kind === "uninitializedLocal") {
      // T-LET-UNION: the domain may still be `undefined` plus every whole-value
      // assignment in the declaring scope; anything unproven falls through.
      const letUnion = resolveLetUnionShape(binding, ctx, path, depth);
      if (letUnion) return letUnion;
      return { kind: "openUnknown", reason: "uninitialized-local-let", path: [...path, { kind: "uninitializedLocal", declaredAt: binding.declaredAt }] };
    }
    if (binding.kind === "localConst") {
      if (binding.mutated) {
        // T-SEQUENTIAL-8: try the fine-grained, fail-closed pass first; any
        // unproven form falls straight through to the existing bail-out.
        const sequential = resolveStaticSequentialAssignmentShape(binding, ctx, path, depth);
        if (sequential) return sequential;
        // T-INTERNAL-MUTATION: the same idiom over a NON-EMPTY fresh base.
        const mutated = resolveInternalMutationShape(binding, ctx, path, depth);
        if (mutated) return mutated;
        return { kind: "openUnknown", reason: "reassignment-or-mutation-present", path: [...path, { kind: "localConst-mutated", declaredAt: binding.declaredAt }] };
      }
      return resolveShape(binding.node, freshCtx(ctx, { depth: depth + 1, path: [...path, { kind: "localConst", declaredAt: binding.declaredAt }] }));
    }
    if (binding.kind === "destructuredLocal") {
      if (binding.isRest) return { kind: "callArgsPending", reason: "rest-destructure-not-implemented", path: [...path, { kind: "destructuredLocal-rest", declaredAt: binding.declaredAt }] };
      if (binding.mutated) return { kind: "openUnknown", reason: "reassignment-or-mutation-present", path: [...path, { kind: "destructuredLocal-mutated", declaredAt: binding.declaredAt }] };
      /* T-USE-STATE / T-NAMESPACE-RELAY: `const [v, setV] = useState<T>(init)`.
       * Read positionally -- slot 0 is the state, and it is the only slot a
       * style sink can consume. */
      if (binding.fromArrayPattern && binding.arrayIndex === 0) {
        const useStateCall = canonicalUseStateCall(binding.sourceExpr, source);
        if (useStateCall) {
          const typeArg = useStateCall.typeArguments && useStateCall.typeArguments.length === 1 ? useStateCall.typeArguments[0] : null;
          const stepPath = [...path, { kind: "useState", declaredAt: binding.declaredAt }];
          /* The type bounds the value to a custom-property NAMESPACE: it has no
           * enumerable key set, so it is a relay -- never a zero, never a
           * producer. Checked BEFORE the value domain, because no amount of
           * resolving initial values can make such a state enumerable. */
          const namespace = typeArg ? customPropertyNamespaceOfType(typeArg, source) : null;
          if (namespace) {
            return {
              kind: "relay",
              binding: { kind: "custom-property-namespace-relay" },
              namespaceRelay: {
                origin: "use-state-type-argument",
                typeText: typeArg.getText(source).slice(0, 120),
                typeName: namespace.typeName ?? null,
                namespace: namespace.namespace,
                declaredAt: binding.declaredAt ?? null,
              },
              path: stepPath,
            };
          }
          const setterEl = binding.bindingPattern && binding.bindingPattern.elements[1];
          const setterName = setterEl && ts.isBindingElement(setterEl) && ts.isIdentifier(setterEl.name) ? setterEl.name.text : null;
          const setterArgs = setterName ? exhaustiveSetterArguments(setterName, binding.declSource ?? source, binding.bindingPattern) : null;
          // no setter name, or a setter that escapes, leaves the domain unproven
          if (setterName && setterArgs) {
            const initArg = useStateCall.arguments.length ? useStateCall.arguments[0] : null;
            const arms = [];
            arms.push(
              initArg
                ? resolveShape(initArg, freshCtx(ctx, { depth: depth + 1, path: [...stepPath, { kind: "useState-initial" }] }))
                : { kind: "nonObject", reason: "useState-no-initial-value", path: stepPath },
            );
            for (let i = 0; i < setterArgs.length; i += 1) {
              arms.push(resolveShape(setterArgs[i], freshCtx(ctx, { depth: depth + 1, path: [...stepPath, { kind: "useState-setter", ordinal: i }] })));
            }
            // tagged so a property read THROUGH the state machine is not
            // mistaken for an authored conditional (see the read guard below)
            return { kind: "branches", branches: arms, fromUseState: true, path: stepPath };
          }
        }
      }
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
      const read = shapeFromLookup(lookup);
      /* T-SEALED-RELAY: applied ONLY to a read that did not close, and only
       * AFTER the ordinary resolution produced its own answer -- which is also
       * the re-derivation the proof is checked against. A read that closes
       * today keeps its exact shape and receipt; nothing that is already
       * resolved moves. */
      if (!isShapeClosed(read)) {
        const proof = sealedImportRelayProof(n, ctx, read);
        if (proof && proof.namespaceProof) {
          return {
            kind: "relay",
            binding: { kind: "custom-property-namespace-relay" },
            namespaceRelay: proof.namespaceProof,
            path: [...(read.path ?? path), { kind: "namespaceRelay", name: proof.namespaceProof.property }],
          };
        }
        if (proof) {
          return {
            kind: "relay",
            binding: { kind: "sealed-import-relay" },
            sealedImportRelay: proof,
            // keep the FULL resolution path the ordinary read walked, then the
            // sealing step -- the receipt must show how the producer was reached
            path: [...(read.path ?? path), { kind: "sealedImportRelay", name: proof.property }],
          };
        }
      }
      /* T-USE-STATE -- LAST resort, after every relay proof has been offered.
       * Reading a PROPERTY off a resolved state machine whose value did not
       * resolve is an unknown, not an authored conditional: the branch
       * structure belongs to the state machine, not to the expression at the
       * sink, so publishing it as a composite branch would describe code nobody
       * wrote. The row stays exactly as blocked as it was. */
      if (objShape.fromUseState && !isShapeClosed(read) && !keySetEnumerable(read)) {
        return { kind: "openUnknown", reason: "use-state-property-value-unresolved", path: [...path, { kind: "useState-propertyRead", key: literalKey }] };
      }
      return read;
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
    // resolve the next hop from the file that declared it (see `declFile`)
    const hopFile = exported.declFile ?? targetFile;
    const hopSource = exported.declSource ?? targetSrc.source;
    return followImport(
      { moduleSpecifier: exported.moduleSpecifier, importedName: exported.importedName, form: "named" },
      exported.importedName,
      { ...ctx, fileRel: hopFile, source: hopSource, visitedImports: nextVisited },
      stepPath,
      depth + 1,
      callNode,
      effectiveCallerCtx
    );
  }

  const declaringFile = exported.declFile ?? targetFile;
  const declaringSource = exported.declSource ?? targetSrc.source;
  const nextCtx = { ...ctx, source: declaringSource, fileRel: declaringFile, visitedImports: nextVisited, depth: depth + 1, path: stepPath };
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
  /* A JSX tag is INTRINSIC only when it is a bare lowercase identifier -- a real
   * DOM/SVG element. `motion.div` (a `JsxMemberExpression` from the third-party
   * `motion/react`) also begins with a lowercase letter, so the original
   * `/^[a-z]/` test silently admitted any lowercase-namespaced third-party
   * forwarder as an intrinsic sink and could hand it PUBLIC_BOUNDARY. A dot in
   * the tag means the element is a property of some object this walk does not
   * own; it is never intrinsic. */
  const isIntrinsicSink =
    typeof sinkTagName === "string" && /^[a-z][a-zA-Z0-9-]*$/.test(sinkTagName) && !sinkTagName.includes(".");
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

/* ----------------------------- static key-set proof (T-STATIC-KEYSET) --- */
/**
 * T-STATIC-KEYSET -- prove a shape's KEY SET is fully enumerable, even when
 * some of its leaf VALUES stay open.
 *
 * `isShapeClosed` answers a STRONGER question than the census needs: "is every
 * value resolved?". The load-bearing question for a style sink is narrower --
 * "can this expression still contribute a custom property this walk has not
 * seen?". A plain leaf VALUE cannot: whatever it evaluates to at runtime, it
 * lands UNDER a key this walk already named. Only a spread, a computed or
 * dynamic key, or a branch that was never enumerated can introduce a key.
 *
 * So this predicate ignores leaf value shapes entirely and interrogates only
 * the things that can create keys. Everything else stays open exactly as
 * before -- fail-closed on every one of them:
 *
 *   - a spread whose own key set is not enumerable (a caller-supplied or
 *     otherwise unbounded `style`/prop object is the canonical case);
 *   - a computed or dynamic key (`{ [side]: 0 }`), and a computedKey shape
 *     whose domain was not closed;
 *   - a getter/setter/method member, which `resolveShape` already models as an
 *     open spread entry and which therefore fails here too;
 *   - a branch tree with any arm that is not itself enumerable -- relay,
 *     callArgsPending, dynamicSink, openUnknown, an unresolved import;
 *   - a cycle, or any shape reached twice, which is refused rather than
 *     assumed benign;
 *   - the depth guard.
 *
 * A proven `nonObject` is enumerable and contributes nothing -- that is what
 * makes a clean `cond ? {…} : undefined` guard admissible: the guard arm
 * enumerates the empty key set.
 *
 * This is NOT a closedness claim and must never be used as one: the values
 * really are unresolved. It licenses exactly one thing -- that the KEY UNION
 * is complete, so the census can decide emission without inventing a value.
 */
function keySetEnumerable(shape, depth = 0, seen = new WeakSet()) {
  if (!shape || typeof shape !== "object" || depth > 40) return false;
  // a shape reached twice is a cycle or a shared node: refuse, never assume
  if (seen.has(shape)) return false;
  seen.add(shape);
  switch (shape.kind) {
    // a proven non-object cannot carry a key -- this is the `undefined` guard
    case "nonObject":
      return true;
    case "object":
    case "array": {
      for (const entry of shape.order ?? []) {
        // a spread CAN introduce keys: it must prove its own key set
        if (entry.kind === "spread") {
          if (!keySetEnumerable(entry.shape, depth + 1, seen)) return false;
          continue;
        }
        // a computed/dynamic key is exactly what this predicate refuses
        if (entry.unresolvedKey) return false;
        if (entry.key === null || entry.key === undefined) return false;
        // entry.shape -- the VALUE -- is deliberately NOT interrogated
      }
      for (const el of shape.elements ?? []) {
        if (!keySetEnumerable(el.shape, depth + 1, seen)) return false;
      }
      return true;
    }
    case "branches": {
      const arms = shape.branches ?? [];
      // a branch tree with no arms enumerates nothing provable
      return arms.length > 0 && arms.every((b) => keySetEnumerable(b, depth + 1, seen));
    }
    case "computedKey": {
      if (shape.closed === true) return true;
      /* `closed` on a computed lookup means "domain enumerated AND every member's
       * VALUE resolved". For a KEY-SET question only the first half matters: if
       * the domain was enumerated (no `reason` -- that field is set exactly when
       * it was not) the union of the arms' key sets is known, whatever the values
       * turn out to be. An unenumerated lookup still carries its reason and is
       * still refused. */
      if (shape.reason) return false;
      const arms = shape.branches ?? [];
      return arms.length > 0 && arms.every((b) => keySetEnumerable(b, depth + 1, seen));
    }
    default:
      // relay, callArgsPending, dynamicSink, openUnknown
      return false;
  }
}

export { isShapeClosed, keySetEnumerable };
/** Test seam: the SEALED-declaration predicate, so the shape refusals
 * (generic, optional, indexed, extended, method-bearing, union alias, cycle)
 * can be drilled without a cross-file fixture tree. */
export { resolveSealedTypeDecl };
