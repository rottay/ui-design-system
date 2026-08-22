/**
 * PRE_F4B cross-file resolution subsystem -- PORTED from the sealed census v6
 * bundle, not invented. Dispositions fall out of the AST; there is no
 * allowlist of ids anywhere in this subsystem.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve as pathResolve } from "node:path";
import { fileURLToPath } from "node:url";

import ts from "typescript";

import { repoRoot as findRepoRoot } from "../../../lib/repo-root/index.mjs";

export const REPO_ABS = findRepoRoot(dirname(fileURLToPath(import.meta.url)));

import { resolveShape, readProperty, isShapeClosed, classifyRelayBoundary, getSource } from "./cascade-cross-file-resolver.mjs";
import { governanceOutcome, astPathFromSinkToPart, canonicalPreimageId, legacyPreimageIdWithSymbol, zeroEmissionSiteId, governedProducerSiteId, sourcePartId, decomposeImmediate, orderParts, digestText, canonicalJson, sortSet, digestOf, sha256Hex, utf8 } from "./cascade-governance.mjs";
/**
 * v4 driver — READ-ONLY. Same verbatim sink-anchored walk as
 * cascade-producers.mjs's scanTsxSource() / v3's drive.mjs (byte-identical
 * algorithm up to the walk itself -- NEVER changed, guarantees identity with
 * the live A5 artifact). At the point the original calls
 * noteUnresolved(node, form, reason) it captures the JSX sink's tag name and
 * invokes the v4 Shape resolver.
 *
 * v4 additions over v3's driver:
 *  - the new additive DT ruling (zero-governed-emission objects): a causally
 *    CLOSED object/computedKey shape with ZERO `--ds-*`/`--_ds-*` keys among
 *    its full recursive leaf set is `CLOSED_ZERO_GOVERNED_EMISSION_OBJECT`,
 *    not `CLOSED_PRODUCER`. `CLOSED_PRODUCER` is reserved for a closed shape
 *    that DOES emit at least one governed/internal key, which is enumerated.
 *    See `governanceAnalysis()` / `zeroEmissionObject` / `governedProducer`.
 *  - the per-row `closed` field is now derived from disposition membership in
 *    the closed-disposition set (CLOSED_PRODUCER / CLOSED_NONOBJECT /
 *    CLOSED_ZERO_GOVERNED_EMISSION_OBJECT), not the raw Shape-internal
 *    `isShapeClosed()` value -- the two could previously disagree for a
 *    branches shape mixing a closed object with a nonObject placeholder
 *    (correctly reported BRANCH_CONDITIONAL_AUTHORED by disposition, but
 *    `isShapeClosed()` on that same shape returns true by the narrower,
 *    nested-spread-only definition of closed). The row now states one
 *    single, disposition-consistent truth.
 */

const TSX_ROOTS = ["packages/core/src"];
const TSX_EXCLUDE = ["/tests/", "/fixtures/", "/__mocks__/", "/examples/", "/generated/", ".test.", ".spec.", ".stories."];

function tsxCandidates(root) {
  const out = [];
  const walk = (dir) => {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries.sort((a, b) => (a.name < b.name ? -1 : 1))) {
      const abs = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(abs);
        continue;
      }
      if (!/\.(ts|tsx)$/.test(entry.name)) continue;
      out.push(abs);
    }
  };
  for (const rel of TSX_ROOTS) walk(join(root, rel));
  return out;
}
const isExcluded = (rel) => TSX_EXCLUDE.some((needle) => rel.includes(needle));

function enclosingSymbol(node) {
  let current = node;
  while (current) {
    if (ts.isFunctionDeclaration(current) && current.name) return current.name.text;
    if ((ts.isVariableDeclaration(current) || ts.isPropertyAssignment(current)) && current.name && ts.isIdentifier(current.name)) return current.name.text;
    if (ts.isMethodDeclaration(current) && current.name && ts.isIdentifier(current.name)) return current.name.text;
    current = current.parent;
  }
  return "<module>";
}

/** Tag name of the JSX element that owns a `style=` JsxAttribute sink. */
function sinkTagNameOf(jsxAttributeNode) {
  let cur = jsxAttributeNode.parent;
  while (cur && !ts.isJsxOpeningElement(cur) && !ts.isJsxSelfClosingElement(cur)) cur = cur.parent;
  if (!cur) return null;
  const tag = cur.tagName;
  if (ts.isIdentifier(tag)) return tag.text;
  return tag.getText();
}

/* ---------------------------------------------------------- verbatim scan */
function scanTsxSource(rel, text, onUnresolved) {
  const source = ts.createSourceFile(rel, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const localBindings = new Map();
  const sinks = [];
  const stamps = [];

  const noteUnresolved = (node, form, reason, sinkNode) => {
    onUnresolved(node, form, reason, source, rel, sinkNode);
  };

  const collectBindings = (node) => {
    if (ts.isVariableDeclaration(node) && node.name && ts.isIdentifier(node.name) && node.initializer) {
      localBindings.set(node.name.text, node.initializer);
    }
    ts.forEachChild(node, collectBindings);
  };
  collectBindings(source);

  const unwrap = (expression) => {
    let current = expression;
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
  };

  let currentSinkNode = null;

  const resolveObjects = (expression, depth, seen) => {
    const found = [];
    const node = unwrap(expression);
    if (!node) return found;
    if (depth > 6) {
      noteUnresolved(expression, "depth-limit", "backward resolution hit the depth bound", currentSinkNode);
      return found;
    }
    if (ts.isObjectLiteralExpression(node)) {
      found.push(node);
      for (const property of node.properties) {
        if (ts.isSpreadAssignment(property)) {
          const spread = resolveObjects(property.expression, depth + 1, seen);
          if (spread.length === 0) noteUnresolved(property, "spread", "spread whose source object could not be resolved", currentSinkNode);
          found.push(...spread);
        }
      }
      return found;
    }
    if (ts.isIdentifier(node)) {
      if (seen.has(node.text)) return found;
      seen.add(node.text);
      const binding = localBindings.get(node.text);
      if (binding) return resolveObjects(binding, depth + 1, seen);
      noteUnresolved(node, "identifier", "identifier is not bound in this file (import, parameter or prop passthrough)", currentSinkNode);
      return found;
    }
    if (ts.isConditionalExpression(node)) {
      return [...resolveObjects(node.whenTrue, depth + 1, seen), ...resolveObjects(node.whenFalse, depth + 1, seen)];
    }
    if (ts.isBinaryExpression(node)) {
      return [...resolveObjects(node.left, depth + 1, seen), ...resolveObjects(node.right, depth + 1, seen)];
    }
    if (ts.isCallExpression(node)) {
      const callee = unwrap(node.expression);
      if (ts.isIdentifier(callee) && /^use[A-Z]/.test(callee.text) && node.arguments.length) {
        return resolveObjects(node.arguments[0], depth + 1, seen);
      }
      if (ts.isArrowFunction(callee) || ts.isFunctionExpression(callee)) {
        return resolveObjects(callee.body, depth + 1, seen);
      }
      noteUnresolved(node, "call", "call expression whose callee is not an inline factory", currentSinkNode);
      return found;
    }
    if (ts.isBlock(node)) {
      const returned = [];
      const findReturns = (child) => {
        if (ts.isReturnStatement(child) && child.expression) returned.push(...resolveObjects(child.expression, depth + 1, seen));
        if (!ts.isArrowFunction(child) && !ts.isFunctionExpression(child) && !ts.isFunctionDeclaration(child)) ts.forEachChild(child, findReturns);
      };
      ts.forEachChild(node, findReturns);
      if (returned.length) return returned;
      noteUnresolved(node, "block", "block body with no resolvable return", currentSinkNode);
      return found;
    }
    if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
      if (node.body) return resolveObjects(node.body, depth + 1, seen);
      noteUnresolved(node, "function", "function without a body", currentSinkNode);
      return found;
    }
    if (ts.isElementAccessExpression(node) || ts.isPropertyAccessExpression(node)) {
      noteUnresolved(node, "member-access", "member access: the object it reads is outside this file's scope", currentSinkNode);
      return found;
    }
    noteUnresolved(node, "expression", `unhandled expression kind ${ts.SyntaxKind[node.kind]}`, currentSinkNode);
    return found;
  };

  const customPropertyKey = (name) => {
    if (!name) return null;
    if (ts.isStringLiteralLike(name) && name.text.startsWith("--")) return name.text;
    if (ts.isComputedPropertyName(name)) {
      let expression = name.expression;
      while (ts.isAsExpression(expression) || ts.isParenthesizedExpression(expression)) expression = expression.expression;
      if (ts.isStringLiteralLike(expression) && expression.text.startsWith("--")) return expression.text;
    }
    return null;
  };
  const record = (channel, node, form) => stamps.push({ channel, node, form });

  const visit = (node) => {
    if (
      ts.isJsxAttribute(node) &&
      node.name &&
      ts.isIdentifier(node.name) &&
      node.name.text === "style" &&
      node.initializer &&
      ts.isJsxExpression(node.initializer) &&
      node.initializer.expression
    ) {
      sinks.push(node);
      currentSinkNode = node;
      const objects = resolveObjects(node.initializer.expression, 0, new Set());
      for (const object of objects) {
        for (const property of object.properties) {
          if (!ts.isPropertyAssignment(property) && !ts.isShorthandPropertyAssignment(property)) continue;
          const channel = customPropertyKey(property.name);
          if (channel) record(channel, property, "style-object-key");
        }
      }
      currentSinkNode = null;
    }
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === "setProperty" &&
      node.arguments.length > 0
    ) {
      const target = node.expression.expression;
      const isStyleTarget = ts.isPropertyAccessExpression(target) && target.name.text === "style";
      const first = unwrap(node.arguments[0]);
      if (isStyleTarget) {
        sinks.push(node);
        if (ts.isStringLiteralLike(first) && first.text.startsWith("--")) {
          record(first.text, node, "setProperty");
        } else if (!ts.isStringLiteralLike(first)) {
          noteUnresolved(node, "dynamic-setProperty", "setProperty with a non-literal property name", node);
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return { stamps, styleSinks: sinks.length };
}

/* --------------------------------------------------------- entry mapping */
function startExpressionFor(node, form) {
  if (form === "identifier") return node;
  if (form === "spread") return node.expression;
  if (form === "member-access") return node;
  if (form === "call") return node;
  return node;
}

/* ---------------------------------------- Shape -> JSON-safe disposition */
function summarizeShape(shape, depthGuard = 0) {
  if (!shape || depthGuard > 40) return { kind: "openUnknown", reason: "summarize-depth-guard" };
  const path = (shape.path ?? []).map(simplifyPathStep);
  switch (shape.kind) {
    case "object": {
      const authoredLeaves = shape.order.filter((e) => e.kind === "leaf").map((e) => ({ key: e.key, valuePreview: safeText(e.node), unresolvedKey: !!e.unresolvedKey }));
      const spreadOpenings = shape.order
        .filter((e) => e.kind === "spread")
        .map((e) => ({ closed: isShapeClosed(e.shape), summary: summarizeShape(e.shape, depthGuard + 1) }));
      const order = shape.order.map((e) => (e.kind === "leaf" ? { kind: "leaf", key: e.key, unresolvedKey: !!e.unresolvedKey } : { kind: "spread", closed: isShapeClosed(e.shape) }));
      return { kind: "object", closed: shape.closed, authoredLeaves, spreadOpenings, order, path };
    }
    case "array": {
      const elements = shape.elements.map((e) => ({ elementKind: e.kind, closed: isShapeClosed(e.shape), summary: summarizeShape(e.shape, depthGuard + 1) }));
      return { kind: "array", closed: shape.closed, elements, path };
    }
    case "branches":
      return { kind: "branches", branches: shape.branches.map((b) => summarizeShape(b, depthGuard + 1)), path };
    case "nonObject":
      return { kind: "nonObject", reason: shape.reason, leafValueText: shape.leafValueText ?? undefined, path };
    case "relay":
      return { kind: "relay", bindingKind: shape.binding?.kind, ownerFunction: shape.binding?.ownerFunction, declaredAt: shape.binding?.declaredAt, isDestructured: shape.binding?.isDestructured, path };
    case "callArgsPending":
      return { kind: "callArgsPending", reason: shape.reason, path };
    case "computedKey":
      return { kind: "computedKey", closed: !!shape.closed, domain: shape.domain, reason: shape.reason, branches: shape.branches ? shape.branches.map((b) => summarizeShape(b, depthGuard + 1)) : undefined, path };
    case "dynamicSink":
      return { kind: "dynamicSink", path };
    case "openUnknown":
      return { kind: "openUnknown", reason: shape.reason, path };
    default:
      return { kind: "openUnknown", reason: `unknown-shape-kind:${shape.kind}`, path };
  }
}
function simplifyPathStep(step) {
  const out = { kind: step.kind };
  if (step.name) out.name = step.name;
  if (step.declaredAt) out.declaredAt = step.declaredAt;
  if (step.key !== undefined) out.key = step.key;
  if (step.ownerFunction) out.ownerFunction = step.ownerFunction;
  if (step.moduleSpecifier) out.moduleSpecifier = step.moduleSpecifier;
  if (step.importedName) out.importedName = step.importedName;
  if (step.param) out.param = step.param;
  if (step.ordinal !== undefined) out.ordinal = step.ordinal;
  return out;
}
function safeText(node) {
  if (!node) return null;
  try {
    return node.getText().slice(0, 120).replace(/\s+/g, " ");
  } catch {
    return null;
  }
}


function dispositionOf(shape, boundaryReceipt, ctx, sourceParts) {
  if (shape.kind === "relay" && boundaryReceipt && boundaryReceipt.candidate) return { disposition: "PUBLIC_BOUNDARY_CANDIDATE", governance: null };
  // blocker 4: a wrapper mechanism applied but the chain did not close --
  // distinct from an unexamined relay, and NEVER a candidate.
  if (shape.kind === "relay" && boundaryReceipt && boundaryReceipt.kind === "PUBLIC_BOUNDARY_UNKNOWN") return { disposition: "PUBLIC_BOUNDARY_UNKNOWN", governance: null };
  switch (shape.kind) {
    case "object": {
      if (!shape.closed) return { disposition: "AUTHORED_OPEN", governance: null };
      return governanceOutcome(shape, ctx, sourceParts);
    }
    case "array": {
      if (!shape.closed) return { disposition: "AUTHORED_OPEN", governance: null };
      return governanceOutcome(shape, ctx, sourceParts);
    }
    case "nonObject":
      return { disposition: "CLOSED_NONOBJECT", governance: null };
    case "branches": {
      const kinds = shape.branches.map((b) => b.kind);
      const allNonObject = kinds.every((k) => k === "nonObject");
      if (allNonObject) return { disposition: "CLOSED_NONOBJECT", governance: null };
      const anyObjectClosed = shape.branches.some((b) => (b.kind === "object" || b.kind === "array") && b.closed);
      const anyObjectOpen = shape.branches.some((b) => (b.kind === "object" || b.kind === "array") && !b.closed);
      const anyOpaque = shape.branches.some((b) => !["object", "array", "nonObject"].includes(b.kind));
      if ((anyObjectClosed || anyObjectOpen || anyOpaque) && kinds.some((k) => k === "nonObject")) {
        return { disposition: anyOpaque || anyObjectOpen ? "BRANCH_COMPOSITE_OPEN" : "BRANCH_CONDITIONAL_AUTHORED", governance: null };
      }
      if (anyOpaque || anyObjectOpen) return { disposition: "BRANCH_COMPOSITE_OPEN", governance: null };
      if (anyObjectClosed) return { disposition: "BRANCH_CONDITIONAL_AUTHORED", governance: null };
      return { disposition: "BRANCH_COMPOSITE_OPEN", governance: null };
    }
    case "relay":
      return { disposition: "RELAY_PRIVATE_UNRESOLVED", governance: null };
    case "callArgsPending":
      return { disposition: "CALL_ARGS_PENDING", governance: null };
    case "computedKey": {
      if (!shape.closed) return { disposition: "COMPUTED_DOMAIN_PENDING", governance: null };
      return governanceOutcome(shape, ctx, sourceParts);
    }
    case "dynamicSink":
      return { disposition: "DYNAMIC_SINK_PENDING", governance: null };
    case "openUnknown":
      return { disposition: "OPEN_UNKNOWN", governance: null };
    default:
      return { disposition: "OPEN_UNKNOWN", governance: null };
  }
}

/** P0-4: `governance.sourcePartRefs` must be DERIVED from the row's actual
 * witness/read coverage (the `sourcePartId` governance.mjs attached to each
 * keyWitness/readChannelRef), never independently re-listed from
 * `sourceParts` -- v5 published ALL of a row's declared sourcePartIds
 * unconditionally, so the field never actually proved anything about what
 * governance used. This makes `sourcePartRefs` and "the exact sourceParts
 * referenced by coverage" equal BY CONSTRUCTION; the v6 assertions verify
 * that equality by independently recomputing this same derivation from the
 * raw witness/read data and comparing. */
function coverageSourcePartRefs(governance) {
  const ids = new Set();
  for (const w of governance.keyWitnesses) if (w.sourcePartId) ids.add(w.sourcePartId);
  for (const r of governance.readChannelRefs) if (r.sourcePartId) ids.add(r.sourcePartId);
  return [...ids].sort();
}

const CLOSED_DISPOSITIONS = new Set(["CLOSED_PRODUCER", "CLOSED_NONOBJECT", "CLOSED_ZERO_GOVERNED_EMISSION_OBJECT"]);
const A5_SHA = "7e977dfd0d8dc0a9bca0df7f4e9324d17360a5deecc4b7aad7dbcad645cdad0f";

/* --------------------------------------------------------------- main --- */
/**
 * Classify every unresolved tsx-inline-stamp site in the tree.
 *
 * PURE: no writes, no console, no side effects on import. Returns the rows
 * with their disposition and receipts so the producer inventory can drain
 * ONLY the dispositions it can prove.
 */
export function classifyCrossFileRows() {
  const candidates = tsxCandidates(REPO_ABS);
  const rows = [];
  let scannedFiles = 0,
    excludedFiles = 0;
  let snapshotIndex = 0;

  for (const abs of candidates) {
    const rel = relative(REPO_ABS, abs);
    if (isExcluded(`/${rel}`)) {
      excludedFiles += 1;
      continue;
    }
    scannedFiles += 1;
    const text = readFileSync(abs, "utf8");

    const onUnresolved = (node, form, reason, source, relFile, sinkNode) => {
      const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
      const ordinal = node.getStart(source);
      const symbol = enclosingSymbol(node);
      const template = node.getText(source).slice(0, 120).replace(/\s+/g, " ");

      let shape;
      let boundaryReceipt = null;
      let startExpr = null;
      if (form === "dynamic-setProperty") {
        shape = { kind: "dynamicSink", path: [{ kind: "terminal-at-sink", node: "setProperty-dynamic-name" }] };
        // P0-4 point 2: this row has no `startExpr` in the normal sense (its
        // shape is hardcoded, never resolved) -- but it still needs its OWN
        // sourcePart so it isn't one of the "4 rows with zero sourceParts" the
        // REJECT named. `node` (the setProperty(...) call itself) anchors it.
        startExpr = node;
      } else {
        startExpr = startExpressionFor(node, form);
        const baseCtx = { source, fileRel: relFile, depth: 0, path: [{ kind: "terminal-at-sink", form }] };
        shape = resolveShape(startExpr, baseCtx);
        if (shape.kind === "relay") {
          const tagName = ts.isJsxAttribute(sinkNode) ? sinkTagNameOf(sinkNode) : null;
          boundaryReceipt = classifyRelayBoundary(shape.binding, tagName, relFile);
        }
      }

      const summary = summarizeShape(shape);
      if (!summary.path || summary.path.length === 0) summary.path = [{ kind: "terminal-at-sink", form }];

      const thisSnapshotIndex = snapshotIndex++;
      const coord = { sourceInventorySha256: A5_SHA, plane: "tsx-inline-stamp", file: relFile, line: line + 1, ordinal, form, snapshotIndex: thisSnapshotIndex };
      const canonicalId = canonicalPreimageId(coord);
      const oldPreimageId = legacyPreimageIdWithSymbol({ ...coord, symbol });

      // P0-4 -- sourceParts/sourcePartRefs via decomposeImmediate (base-v4
      // §2.4, X2.4), keyed off the CANONICAL id, never the legacy one. Computed
      // BEFORE dispositionOf/governance now (v5 computed this AFTER), because
      // governance needs each part's `sourcePartId` to attach a causal
      // `sourcePartId` to every keyWitness/readChannelRef it collects (point 4
      // -- "asociar cada key/read witness a un sourcePartId causal").
      let rawOrderedParts = [];
      let sourceParts = [];
      if (form === "dynamic-setProperty") {
        // Not decomposeImmediate's grammar (a setProperty(...) CALL sink, not a
        // resolved style-object expression) -- a single dedicated "dynamic"
        // part anchors this row's own sourcePart identity honestly (never
        // mislabeled "call", which elsewhere means "we followed this call's
        // return value" -- this sink is never followed at all).
        rawOrderedParts = [{ role: "dynamic", node, childIndex: 0, ordinal: 0 }];
      } else if (startExpr) {
        const mutationDetected = shape.kind === "openUnknown" && shape.reason === "reassignment-or-mutation-present";
        const identifierIsImport = form === "identifier" && summary.path[0]?.kind === "import";
        try {
          const rawParts = decomposeImmediate(startExpr, { mutationDetected, identifierIsImport });
          rawOrderedParts = orderParts(rawParts, source);
        } catch (e) {
          sourceParts = [{ decomposeError: String(e && e.message) }];
        }
      }
      if (rawOrderedParts.length && !sourceParts.length) {
        sourceParts = rawOrderedParts.map((p) => {
          const astPath = astPathFromSinkToPart(startExpr, p.node, source) ?? "";
          return { sourcePartId: sourcePartId(canonicalId, astPath, p.role, p.ordinal), preimageId: canonicalId, role: p.role, astPath, ordinal: p.ordinal };
        });
        // Stitch the freshly-minted sourcePartId back onto the in-memory
        // (never published) raw parts, which still carry `.node` -- governance's
        // causal matcher (P0-4) keys off that node reference, not the stripped
        // public shape.
        rawOrderedParts = rawOrderedParts.map((p, i) => ({ ...p, sourcePartId: sourceParts[i].sourcePartId }));
      }

      const govCtx = { sinkNode: startExpr, sourceFile: source, fileRel: relFile, line: line + 1 };
      const { disposition, governance } = dispositionOf(shape, boundaryReceipt, govCtx, rawOrderedParts);

      if (governance && disposition === "CLOSED_ZERO_GOVERNED_EMISSION_OBJECT") {
        governance.zeroEmissionSiteId = zeroEmissionSiteId(canonicalId, "");
        governance.sourcePartRefs = coverageSourcePartRefs(governance);
      }
      if (governance && disposition === "CLOSED_PRODUCER") {
        governance.governedProducerSiteId = governedProducerSiteId(canonicalId, "");
        governance.sourcePartRefs = coverageSourcePartRefs(governance);
      }

      rows.push({
        snapshotIndex: thisSnapshotIndex,
        plane: "tsx-inline-stamp",
        canonicalPreimageId: canonicalId,
        oldPreimageId,
        file: relFile,
        line: line + 1,
        ordinal,
        symbol,
        reason: `unresolved-${form}`,
        form,
        template,
        detail: `${relFile}:${line + 1} ${reason}`,
        disposition,
        closed: CLOSED_DISPOSITIONS.has(disposition),
        resolutionPath: summary.path,
        receipt: summary,
        boundaryReceipt,
        governance,
        sourceParts,
      });
    };

    scanTsxSource(rel, text, onUnresolved);
  }

  return { rows, scannedFiles, excludedFiles };
}
