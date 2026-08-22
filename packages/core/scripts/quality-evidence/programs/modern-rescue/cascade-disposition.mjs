/**
 * PRE_F4B cross-file resolution subsystem -- PORTED from the sealed census v6
 * bundle, not invented. Dispositions fall out of the AST; there is no
 * allowlist of ids anywhere in this subsystem.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve as pathResolve } from "node:path";
import { fileURLToPath } from "node:url";

import ts from "typescript";

import { repoRoot as findRepoRoot } from "../../../lib/repo-root/index.mjs";

export const REPO_ABS = findRepoRoot(dirname(fileURLToPath(import.meta.url)));

import { resolveShape, readProperty, isShapeClosed, classifyRelayBoundary, getSource } from "./cascade-cross-file-resolver.mjs";
import { governanceOutcome, governanceAnalysis, astPathFromSinkToPart, canonicalPreimageId, legacyPreimageIdWithSymbol, zeroEmissionSiteId, governedProducerSiteId, sourcePartId, decomposeImmediate, orderParts, digestText, canonicalJson, sortSet, digestOf, sha256Hex, utf8 } from "./cascade-governance.mjs";
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
      return {
        kind: "computedKey",
        closed: !!shape.closed,
        domain: shape.domain,
        // T-COMPUTED-DOMAIN: the contract of HOW the domain was enumerated
        domainKind: shape.domainKind,
        indexMayEscape: shape.indexMayEscape,
        declaration: shape.declaration,
        memberStatuses: shape.memberStatuses,
        reason: shape.reason,
        branches: shape.branches ? shape.branches.map((b) => summarizeShape(b, depthGuard + 1)) : undefined,
        path,
      };
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


export function dispositionOf(shape, boundaryReceipt, ctx, sourceParts) {
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

      /* T-BRANCH-37 -- exhaustive branch inspection.
       *
       * When EVERY arm is either a closed object/array or a proven non-object,
       * the conditional has no unexamined path: `scanClosedShape` already walks
       * a `branches` shape arm by arm (origin "branch"), so the union of the
       * emissions is decidable WITHOUT merging the arms into one style object.
       * Each arm keeps its own key witnesses and its own astPath; nothing is
       * flattened and no arm's shape is imposed on another.
       *
       * The disposition then comes from the EVIDENCE, not from the arms merely
       * looking authored:
       *   - scan complete AND the union emits no governed channel and no
       *     internal socket -> the row is genuinely a zero-governed emission,
       *     and closes as one with its per-arm witnesses as the receipt;
       *   - the union DOES emit -> it is a real producer, but no cascade root
       *     or owner has been proven for a conditional sink, so closing it
       *     would mean inventing attribution. It stays BLOCKING;
       *   - the scan is incomplete for any reason (spread that would not
       *     resolve, computed key, cycle, depth guard, unproven causal link)
       *     -> fail-closed, it stays BLOCKING.
       * The last two keep the row in its own bucket and attach the governance
       * evidence that explains why it could not close.
       */
      /* T-BRANCH-COMPOSITE-162: the exhaustiveness test is now RECURSIVE. A
       * nested conditional (`a ? {..} : b ? {..} : {..}`) puts a `branches`
       * shape inside an arm; if every one of ITS terminal arms is likewise a
       * closed object/array or a proven non-object, the whole tree has no
       * unexamined path and the union is decidable. `scanClosedShape` already
       * recurses through nested `branches`, so each terminal arm keeps its own
       * witnesses, order and astPath -- arms are never merged, and an arm from
       * one nesting level is never mixed with an incompatible sibling.
       *
       * Every other arm kind -- relay, callArgsPending, computedKey,
       * openUnknown, or an object that did not close -- makes the tree
       * non-exhaustive and keeps the row blocking. */
      const armExhaustive = (arm) => {
        if (arm.kind === "nonObject") return true;
        if (arm.kind === "object" || arm.kind === "array") return arm.closed === true;
        if (arm.kind === "branches") {
          const nested = arm.branches ?? [];
          return nested.length > 0 && nested.every(armExhaustive);
        }
        return false;
      };
      const hasClosedObjectAnywhere = (arm) => {
        if (arm.kind === "object" || arm.kind === "array") return arm.closed === true;
        if (arm.kind === "branches") return (arm.branches ?? []).some(hasClosedObjectAnywhere);
        return false;
      };
      const armsExhaustivelyResolved =
        shape.branches.every(armExhaustive) && shape.branches.some(hasClosedObjectAnywhere);
      if (armsExhaustivelyResolved) {
        const outcome = governanceOutcome(shape, ctx, sourceParts);
        if (outcome.disposition === "CLOSED_ZERO_GOVERNED_EMISSION_OBJECT") return outcome;
        return { disposition: "BRANCH_CONDITIONAL_AUTHORED", governance: outcome.governance };
      }

      /* T-BRANCH-RELAY-99: a tree whose only non-authored terminals are RELAYS.
       *
       * A relay terminal can never be proven ZERO -- nobody can see the object
       * the caller supplies -- so the tree cannot close as a zero emission. But
       * it CAN inherit a relay disposition, and only under all of:
       *
       *   (a) every terminal is exhaustively resolved: a closed object/array, a
       *       proven non-object, or a relay. One open/dynamic/computed/callArgs
       *       terminal anywhere and the row stays composite;
       *   (b) the AUTHORED terminals emit nothing governed and nothing socketed,
       *       proven by a complete scan over just those terminals. A real
       *       emission means the tree writes channels of its own, which no relay
       *       disposition may absorb;
       *   (c) every relay terminal is classified by the SAME typed authority the
       *       top-level shapes use (`classifyRelayBoundary`), and they all land
       *       on ONE disposition. A public/private mix, or any
       *       PUBLIC_BOUNDARY_UNKNOWN, keeps the row blocking -- an
       *       investigated-but-inconclusive relay is never a candidate.
       *
       * The composite site then inherits that single disposition, and with it
       * `consumable:false` / `tenantSafe:false`. A relay is never turned into a
       * ZERO, and no owner, root or tenant reach is invented: the receipt is
       * exactly the per-terminal evidence the authority already produced.
       */
      const terminals = [];
      const collect = (arm) => {
        if (arm.kind === "branches") {
          for (const child of arm.branches ?? []) collect(child);
          return;
        }
        terminals.push(arm);
      };
      for (const arm of shape.branches) collect(arm);

      const relayTerminals = terminals.filter((t) => t.kind === "relay");
      const authoredTerminals = terminals.filter((t) => t.kind !== "relay");
      const everyTerminalResolved = terminals.every(
        (t) =>
          t.kind === "relay" ||
          t.kind === "nonObject" ||
          ((t.kind === "object" || t.kind === "array") && t.closed === true),
      );

      if (relayTerminals.length > 0 && everyTerminalResolved) {
        // (b) the authored half must be provably silent. Scanned on its OWN
        // synthetic tree so the relays -- which would fail the scan closed by
        // construction -- do not mask a real emission from the authored arms.
        const authoredScan = governanceAnalysis(
          { kind: "branches", branches: authoredTerminals },
          ctx,
          sourceParts,
        );
        const authoredSilent =
          authoredScan.customPropertyScanComplete &&
          authoredScan.governedChannelKeys.length === 0 &&
          authoredScan.internalSocketKeys.length === 0;

        /* The authority is asked about `ctx.fileRel`, so it is only sound when
         * the relay's owning function is declared in THAT file. Every relay
         * terminal in the live tree satisfies this (106/106 measured), but a
         * cross-file owner would be classified against the wrong file, so it is
         * refused explicitly rather than left as a latent assumption. */
        const fileOf = (declaredAt) => (typeof declaredAt === "string" ? declaredAt.split(":")[0] : null);
        const foreignOwner = relayTerminals.some(
          (t) => fileOf(t.binding?.declaredAt) !== null && fileOf(t.binding?.declaredAt) !== ctx.fileRel,
        );

        // (c) one typed verdict for every relay terminal, from the same authority
        const verdicts = relayTerminals.map((t) =>
          classifyRelayBoundary(t.binding, ctx.sinkTagName ?? null, ctx.fileRel),
        );
        const dispositionOfVerdict = (v) =>
          v.candidate ? "PUBLIC_BOUNDARY_CANDIDATE" : v.kind === "PUBLIC_BOUNDARY_UNKNOWN" ? "PUBLIC_BOUNDARY_UNKNOWN" : "RELAY_PRIVATE_UNRESOLVED";
        const inherited = [...new Set(verdicts.map(dispositionOfVerdict))];
        const singleDisposition = inherited.length === 1 ? inherited[0] : null;

        if (authoredSilent && !foreignOwner && singleDisposition && singleDisposition !== "PUBLIC_BOUNDARY_UNKNOWN") {
          return {
            disposition: singleDisposition,
            governance: null,
            branchRelayReceipt: {
              inheritedFrom: singleDisposition,
              terminalCount: terminals.length,
              relayTerminalCount: relayTerminals.length,
              authoredTerminalCount: authoredTerminals.length,
              authoredTerminalsSilent: true,
              authoredScanComplete: authoredScan.customPropertyScanComplete,
              relayKinds: [...new Set(verdicts.map((v) => v.kind))].sort(),
              relayBindingKinds: [...new Set(relayTerminals.map((t) => t.binding?.kind ?? null))].filter(Boolean).sort(),
              relayOwners: [...new Set(relayTerminals.map((t) => t.binding?.ownerFunction ?? null))].filter(Boolean).sort(),
              exportEvidence: verdicts
                .map((v) => v.exportEvidence)
                .filter(Boolean)
                .map((e) => ({ entrypoint: e.entrypoint ?? null, exportedAs: e.exportedAs ?? null, via: e.via ?? null, hopChainDepth: e.hopChain?.length ?? 0 }))
                .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
            },
          };
        }
        // Otherwise the row stays composite, and the cause is published below.
        return {
          disposition: "BRANCH_COMPOSITE_OPEN",
          governance: null,
          branchRelayReceipt: {
            inheritedFrom: null,
            blockedBy: !authoredSilent
              ? authoredScan.customPropertyScanComplete
                ? "authored-terminals-emit-governed-channels"
                : "authored-terminal-scan-incomplete"
              : foreignOwner
                ? "relay-terminal-owner-declared-in-another-file"
                : inherited.length > 1
                  ? "relay-terminals-disagree-on-disposition"
                  : "relay-terminal-public-boundary-unknown",
            terminalCount: terminals.length,
            relayTerminalCount: relayTerminals.length,
            authoredTerminalCount: authoredTerminals.length,
            authoredTerminalsSilent: authoredSilent,
            authoredScanComplete: authoredScan.customPropertyScanComplete,
            governedChannelKeys: [...authoredScan.governedChannelKeys].sort(),
            internalSocketKeys: [...authoredScan.internalSocketKeys].sort(),
            relayDispositions: inherited.sort(),
            relayKinds: [...new Set(verdicts.map((v) => v.kind))].sort(),
          },
        };
      }

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
      // Hoisted: the SAME sink tag drives the relay authority for the top-level
      // shape and for every relay terminal buried inside a conditional tree.
      const sinkTagName = ts.isJsxAttribute(sinkNode) ? sinkTagNameOf(sinkNode) : null;
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
          boundaryReceipt = classifyRelayBoundary(shape.binding, sinkTagName, relFile);
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

      const govCtx = { sinkNode: startExpr, sourceFile: source, fileRel: relFile, line: line + 1, sinkTagName };
      const { disposition, governance, branchRelayReceipt = null } = dispositionOf(
        shape, boundaryReceipt, govCtx, rawOrderedParts,
      );
      // P0: enumerations reachable INSIDE this shape. Only meaningful when the
      // root is not itself a computed lookup (that one publishes its own
      // domain receipt).
      const nestedComputedDomains =
        shape && shape.kind !== "computedKey"
          ? normalizeNestedComputedDomains(collectNestedComputedDomains(shape))
          : [];
      // T-TYPED-RELAY: the annotation proofs that justified this row's closure.
      const typedRelays = normalizeTypedRelays(collectTypedRelays(shape));
      // T-SEQUENTIAL-8: the static write sequences that justified it.
      const sequentialAssignments = normalizeSequentialAssignments(collectSequentialAssignments(shape));
      // T-SEALED-RELAY: the sealed-import proofs that justified this row's
      // relay disposition.
      const sealedImportRelays = normalizeSealedImportRelays(collectSealedImportRelays(shape));

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
        // T-BRANCH-RELAY-99: present only on conditional trees whose non-authored
        // terminals are relays -- carries the per-terminal evidence for the
        // inheritance, or the published cause when it was refused.
        branchRelayReceipt,
        // P0: non-empty only on rows that closed because an enumeration nested
        // inside them resolved.
        nestedComputedDomains,
        // T-TYPED-RELAY: non-empty only on rows whose closure rests on a type
        // annotation proof. Absent everywhere else -- no empty/spurious field.
        typedRelays,
        // T-SEQUENTIAL-8: non-empty only on rows closed by a proven static
        // write sequence.
        sequentialAssignments,
        // T-SEALED-RELAY: non-empty only on rows whose relay disposition rests
        // on a sealed-import proof. Absent everywhere else.
        sealedImportRelays,
        sourceParts,
      });
    };

    scanTsxSource(rel, text, onUnresolved);
  }

  return { rows, scannedFiles, excludedFiles };
}

/* ------------------------------------------------- fail-closed join --- */
/**
 * The natural key a producer inventory can join on is `file|ordinal`: a stable
 * source coordinate. It is NOT unique -- 66 coordinates carry more than one row
 * (154 rows in total) because the SAME expression node flows into SEVERAL JSX
 * sinks. `<Modal style={style}>` and `<Drawer style={style}>` in one component
 * produce two rows at one coordinate.
 *
 * Those duplicates must never be collapsed by "last write wins", which silently
 * picks one row's evidence and discards the rest. This index splits every field
 * into one of two classes and treats them differently:
 *
 *  - DECISION fields decide WHETHER and HOW a row drains. If two rows at one
 *    coordinate disagree on any of them the join THROWS: a coordinate whose
 *    classification is ambiguous is never drained. Measured on the live tree:
 *    0 disagreements over 66 duplicated coordinates.
 *  - The bounded receipt is the invariant evidence of origin and reason
 *    (entrypoint, exported name, wrapper, hop depth, resolution path, causal
 *    governance). It must also agree, and it THROWS otherwise. Measured: 0
 *    disagreements.
 *  - PER-SINK evidence -- which tag the expression reached, and which relay
 *    kind that sink implies -- legitimately varies between occurrences. It is
 *    the one thing that is MERGED, as a sorted set, so nothing is discarded and
 *    nothing is chosen arbitrarily. Measured: at most 4 distinct sink tags and
 *    2 distinct relay kinds per coordinate.
 *
 * The result: the only collapse that happens is one drain DECISION per
 * coordinate, and that decision is provably unambiguous.
 */
export const DISPOSITION_DECISION_FIELDS = Object.freeze([
  "disposition",
  "closed",
  "form",
  "symbol",
  "line",
  "reason",
  "template",
]);

const stable = (value) => JSON.stringify(value ?? null);

/**
 * P0 -- collect every ENUMERATED computed lookup reachable inside a shape.
 *
 * A row can close INDIRECTLY: its own shape is an ordinary object, and what was
 * blocking it was a `computedKey` buried in a leaf value or a spread. Such a row
 * must not close on an unexplained "it resolved" -- it has to name the
 * enumerations that justified it. This walks the LIVE shape (the summary does
 * not carry leaf value sub-shapes) and returns one entry per enumerated lookup,
 * with the resolution path that reaches it and the sealed declaration it read.
 *
 * Deduplication is by EXACT identity only: two lookups that differ in any
 * published field are both kept, so no material occurrence is lost. Ordering is
 * stable by astPath, then declaration file/line/span.
 */
function collectNestedComputedDomains(shape, visited = new WeakSet(), depth = 0, out = []) {
  if (!shape || typeof shape !== "object" || depth > 80) return out;
  if (visited.has(shape)) return out;
  visited.add(shape);
  if (shape.kind === "computedKey" && shape.domainKind) {
    out.push({
      astPath: (shape.path ?? []).map((step) => step.kind).join(">"),
      domainKind: shape.domainKind,
      members: [...(shape.domain ?? [])],
      memberCount: (shape.domain ?? []).length,
      memberStatuses: (shape.memberStatuses ?? []).map((st) => ({ member: st.member, status: st.status })),
      indexMayEscape: shape.indexMayEscape ?? null,
      domainComplete: shape.closed === true,
      declaration: shape.declaration
        ? {
            file: shape.declaration.file,
            line: shape.declaration.line,
            span: shape.declaration.span,
            sha256: shape.declaration.sha256,
          }
        : null,
    });
  }
  // P0: an enumeration referenced by a shape derived THROUGH it (see
  // `readProperty`'s computedKey branch) is part of this row's justification.
  if (shape.viaComputedDomain) collectNestedComputedDomains(shape.viaComputedDomain, visited, depth + 1, out);
  switch (shape.kind) {
    case "object":
      for (const entry of shape.order ?? []) collectNestedComputedDomains(entry.shape, visited, depth + 1, out);
      break;
    case "array":
      for (const el of shape.elements ?? []) collectNestedComputedDomains(el.shape, visited, depth + 1, out);
      break;
    case "branches":
    case "computedKey":
      for (const b of shape.branches ?? []) collectNestedComputedDomains(b, visited, depth + 1, out);
      break;
    default:
      break;
  }
  return out;
}

/**
 * T-TYPED-RELAY (Fable P0) -- collect every TYPED-RELAY proof reachable inside
 * a shape.
 *
 * The resolver attaches `typedRelay` to the `nonObject` it produces when a type
 * annotation proves a value can never be an object. That proof lived only in
 * memory: it justified the closure but never reached the artifact, so a reader
 * of `producers.json` could not audit WHY the row closed. This walks the LIVE
 * shape -- exactly as `collectNestedComputedDomains` does -- and carries the
 * proofs out to the published row.
 *
 * Every container is traversed (object entries, array elements, branch arms,
 * computedKey arms and the `viaComputedDomain` back-reference), so a proof
 * buried under a branch, a spread or a return is never dropped.
 */
function collectTypedRelays(shape, visited = new WeakSet(), depth = 0, out = []) {
  if (!shape || typeof shape !== "object" || depth > 80) return out;
  if (visited.has(shape)) return out;
  visited.add(shape);
  if (shape.typedRelay) {
    out.push({
      origin: shape.typedRelay.origin ?? null,
      ownerFunction: shape.typedRelay.ownerFunction ?? null,
      declaredAt: shape.typedRelay.declaredAt ?? null,
      typeText: shape.typedRelay.typeText ?? null,
    });
  }
  if (shape.viaComputedDomain) collectTypedRelays(shape.viaComputedDomain, visited, depth + 1, out);
  for (const entry of shape.order ?? []) collectTypedRelays(entry.shape, visited, depth + 1, out);
  for (const el of shape.elements ?? []) collectTypedRelays(el.shape, visited, depth + 1, out);
  for (const b of shape.branches ?? []) collectTypedRelays(b, visited, depth + 1, out);
  return out;
}

/**
 * T-SEQUENTIAL-8 -- collect the proofs produced by the static
 * sequential-assignment pass, wherever they sit in the shape.
 *
 * Same precedent as `collectTypedRelays`: harvest across the WHOLE shape so a
 * proof under a branch, a spread or a return is never dropped, and carry it out
 * to the published row. The proof states the binding, its declaration, the
 * return it was read at, and EVERY static write (key, statement coordinate,
 * whether it was conditional and the condition text) -- enough to re-derive why
 * no alias, escape or forbidden form was present, without asserting anything
 * about governance.
 */
function collectSequentialAssignments(shape, visited = new WeakSet(), depth = 0, out = []) {
  if (!shape || typeof shape !== "object" || depth > 80) return out;
  if (visited.has(shape)) return out;
  visited.add(shape);
  if (shape.sequentialAssignment) {
    const sa = shape.sequentialAssignment;
    out.push({
      binding: sa.binding ?? null,
      declaredAt: sa.declaredAt ?? null,
      returnAt: sa.returnAt ?? null,
      writeCount: sa.writeCount ?? (sa.writes ?? []).length,
      writes: [...(sa.writes ?? [])]
        .map((w) => ({ key: w.key, at: w.at, conditional: !!w.conditional, condition: w.condition ?? null }))
        .sort((a, b) => (`${a.key}|${a.at}` < `${b.key}|${b.at}` ? -1 : `${a.key}|${a.at}` > `${b.key}|${b.at}` ? 1 : 0)),
    });
  }
  if (shape.viaComputedDomain) collectSequentialAssignments(shape.viaComputedDomain, visited, depth + 1, out);
  for (const entry of shape.order ?? []) collectSequentialAssignments(entry.shape, visited, depth + 1, out);
  for (const el of shape.elements ?? []) collectSequentialAssignments(el.shape, visited, depth + 1, out);
  for (const b of shape.branches ?? []) collectSequentialAssignments(b, visited, depth + 1, out);
  return out;
}

/** Stable order + exact-identity dedup for the sequential-assignment list. */
function normalizeSequentialAssignments(list) {
  const seen = new Set();
  const unique = [];
  for (const item of list) {
    const identity = JSON.stringify(item);
    if (seen.has(identity)) continue;
    seen.add(identity);
    unique.push(item);
  }
  return unique.sort((a, b) => {
    const ka = `${a.binding ?? ""}|${a.declaredAt ?? ""}|${a.returnAt ?? ""}`;
    const kb = `${b.binding ?? ""}|${b.declaredAt ?? ""}|${b.returnAt ?? ""}`;
    return ka < kb ? -1 : ka > kb ? 1 : 0;
  });
}

/**
 * T-SEALED-RELAY -- collect every SEALED-IMPORT-RELAY proof reachable inside a
 * shape.
 *
 * The resolver attaches `sealedImportRelay` to the `relay` it produces when a
 * `<ident>.<prop>` read is proven to be a passthrough of one imported call's
 * sealed return type. That proof justifies the row's disposition, so it must
 * reach the artifact: a reader of `producers.json` has to be able to audit WHY
 * a row is a relay instead of authored-open, without re-running the resolver.
 *
 * Walks the LIVE shape exactly as `collectTypedRelays` does, so a proof buried
 * under a branch, a spread or a return is never dropped.
 */
function collectSealedImportRelays(shape, visited = new WeakSet(), depth = 0, out = []) {
  if (!shape || typeof shape !== "object" || depth > 80) return out;
  if (visited.has(shape)) return out;
  visited.add(shape);
  if (shape.sealedImportRelay) out.push({ ...shape.sealedImportRelay });
  if (shape.viaComputedDomain) collectSealedImportRelays(shape.viaComputedDomain, visited, depth + 1, out);
  for (const entry of shape.order ?? []) collectSealedImportRelays(entry.shape, visited, depth + 1, out);
  for (const el of shape.elements ?? []) collectSealedImportRelays(el.shape, visited, depth + 1, out);
  for (const b of shape.branches ?? []) collectSealedImportRelays(b, visited, depth + 1, out);
  return out;
}

/** Stable order + exact-identity dedup for the sealed-relay list. */
function normalizeSealedImportRelays(list) {
  const seen = new Set();
  const unique = [];
  for (const item of list) {
    const identity = JSON.stringify(item);
    if (seen.has(identity)) continue;
    seen.add(identity);
    unique.push(item);
  }
  return unique.sort((a, b) => {
    const ka = `${a.exportFile ?? ""}|${a.owner ?? ""}|${a.property ?? ""}|${a.localBinding ?? ""}`;
    const kb = `${b.exportFile ?? ""}|${b.owner ?? ""}|${b.property ?? ""}|${b.localBinding ?? ""}`;
    return ka < kb ? -1 : ka > kb ? 1 : 0;
  });
}

/** Stable order + exact-identity dedup for the typed-relay list. */
function normalizeTypedRelays(list) {
  const seen = new Set();
  const unique = [];
  for (const item of list) {
    const identity = JSON.stringify(item);
    if (seen.has(identity)) continue;
    seen.add(identity);
    unique.push(item);
  }
  return unique.sort((a, b) => {
    const ka = `${a.origin ?? ""}|${a.ownerFunction ?? ""}|${a.declaredAt ?? ""}|${a.typeText ?? ""}`;
    const kb = `${b.origin ?? ""}|${b.ownerFunction ?? ""}|${b.declaredAt ?? ""}|${b.typeText ?? ""}`;
    return ka < kb ? -1 : ka > kb ? 1 : 0;
  });
}

/** Stable order + exact-identity dedup for the nested-domain list. */
function normalizeNestedComputedDomains(list) {
  const seen = new Set();
  const unique = [];
  for (const item of list) {
    const identity = JSON.stringify(item);
    if (seen.has(identity)) continue;
    seen.add(identity);
    unique.push(item);
  }
  return unique.sort((a, b) => {
    const ka = `${a.astPath}|${a.declaration?.file ?? ""}|${a.declaration?.line ?? 0}|${(a.declaration?.span ?? []).join(",")}`;
    const kb = `${b.astPath}|${b.declaration?.file ?? ""}|${b.declaration?.line ?? 0}|${(b.declaration?.span ?? []).join(",")}`;
    return ka < kb ? -1 : ka > kb ? 1 : 0;
  });
}

/**
 * T-COMPUTED-DOMAIN -- the evidence a computed lookup produces once its domain
 * has been enumerated. It states HOW the domain was obtained, WHICH members it
 * has in authored order, WHERE the sealed declaration lives (path + span +
 * content hash, so a moved or edited container is detectable), whether the
 * index could escape the key set, and the per-member lookup status. A reader
 * can re-derive the enumeration from this alone.
 */
function computedDomainReceipt(row, path) {
  const receipt = row.receipt ?? {};
  const governance = row.governance ?? {};
  return {
    domainKind: receipt.domainKind ?? null,
    members: [...(receipt.domain ?? [])],
    memberCount: (receipt.domain ?? []).length,
    memberStatuses: receipt.memberStatuses ?? [],
    indexMayEscape: receipt.indexMayEscape ?? null,
    declaration: receipt.declaration ?? null,
    branchCount: (receipt.branches ?? []).length,
    domainComplete: receipt.closed === true,
    customPropertyScanComplete: governance.customPropertyScanComplete ?? null,
    governedChannelKeys: [...(governance.governedChannelKeys ?? [])].sort(),
    internalSocketKeys: [...(governance.internalSocketKeys ?? [])].sort(),
    path,
  };
}

/**
 * T-BRANCH-37 -- the evidence a conditional sink produces once every arm has
 * been inspected. It reports the arms, whether the custom-property scan was
 * exhaustive, and the UNION of the governed channels and internal sockets the
 * arms emit. The union is computed by walking each arm separately (governance
 * recurses a `branches` shape arm by arm), so the arms are never merged into a
 * single style object and each keeps its own witnesses.
 *
 * An EMPTY union under a complete scan is what licenses a close; a non-empty
 * one is exactly what forbids it without a proven root.
 */
function branchUnionReceipt(row, arms, path) {
  const governance = row.governance ?? {};
  const witnesses = governance.keyWitnesses ?? [];
  const receipt = {
    branchCount: arms.length,
    branchKinds: [...new Set(arms.map((b) => b.kind))].sort(),
    allArmsClosed: arms.every((b) =>
      b.kind === "object" || b.kind === "array" ? b.closed === true : true,
    ),
    customPropertyScanComplete: governance.customPropertyScanComplete ?? null,
    governedChannelKeys: [...(governance.governedChannelKeys ?? [])].sort(),
    internalSocketKeys: [...(governance.internalSocketKeys ?? [])].sort(),
    branchWitnessCount: witnesses.filter((w) => w.origin === "branch").length,
    witnessCount: witnesses.length,
    path,
  };
  /* T-BRANCH-COMPOSITE-162: a NESTED tree needs its own exhaustiveness proof --
   * the top-level `branchCount` alone says nothing about the arms hidden one
   * level down. These fields are emitted ONLY when nesting is actually present,
   * so every flat row published by the previous tranche keeps its exact bytes
   * and its exact meaning. */
  const nesting = branchTreeCensus(arms);
  if (nesting.depth > 0) {
    receipt.nestingDepth = nesting.depth;
    receipt.terminalArmCount = nesting.terminals;
    receipt.terminalArmKinds = nesting.kinds;
    receipt.allTerminalArmsResolved = nesting.allResolved;
  }
  return receipt;
}

/** Recursive census of a branch tree: how deep it nests, how many TERMINAL
 * (non-branch) arms it has, which kinds those terminals are, and whether every
 * one of them is resolved. Terminals are counted, never merged. */
function branchTreeCensus(arms) {
  let depth = 0;
  let terminals = 0;
  let allResolved = true;
  const kinds = new Set();
  const walk = (arm, level) => {
    if (arm.kind === "branches") {
      depth = Math.max(depth, level + 1);
      const nested = arm.branches ?? [];
      if (nested.length === 0) allResolved = false;
      for (const child of nested) walk(child, level + 1);
      return;
    }
    terminals += 1;
    kinds.add(arm.kind);
    if (arm.kind === "object" || arm.kind === "array") {
      if (arm.closed !== true) allResolved = false;
    } else if (arm.kind !== "nonObject") {
      allResolved = false;
    }
  };
  for (const arm of arms) walk(arm, 0);
  return { depth, terminals, kinds: [...kinds].sort(), allResolved };
}

/**
 * The invariant half of a row's evidence: enough to audit ORIGIN and REASON,
 * bounded so the inventory does not carry the entire resolution graph. Per-sink
 * fields are deliberately absent -- they are merged by `dispositionIndex`.
 */
export function boundedReceiptOf(row) {
  const path = (row.resolutionPath ?? []).map((step) => step.kind);
  /* T-BRANCH-RELAY-99: a conditional tree that INHERITED its relay disposition
   * is structurally a different object from a direct relay -- it has terminals,
   * an authored half that had to be proven silent, and possibly several export
   * chains. It publishes that evidence instead of the direct-relay projection,
   * which would have been degenerate here (no `boundaryReceipt` exists on these
   * rows). Rows without `branchRelayReceipt` are untouched. */
  if (row.branchRelayReceipt && row.branchRelayReceipt.inheritedFrom) {
    return { ...row.branchRelayReceipt, resolvedVia: "branch-relay-inheritance", path };
  }
  switch (row.disposition) {
    case "PUBLIC_BOUNDARY_CANDIDATE": {
      const evidence = row.boundaryReceipt?.exportEvidence ?? {};
      return {
        entrypoint: evidence.entrypoint ?? null,
        exportedAs: evidence.exportedAs ?? null,
        via: evidence.via ?? null,
        hopChainDepth: evidence.hopChain?.length ?? 0,
        path,
      };
    }
    case "RELAY_PRIVATE_UNRESOLVED":
      return {
        bindingKind: row.receipt?.kind ?? null,
        // T-SEALED-RELAY: the durable proof -- binding, import/export, property,
        // sole upstream owner and the exact relayed key set. Present ONLY on a
        // row proven by that route; every relay published earlier gains no
        // field at all and stays byte-identical.
        ...(row.sealedImportRelays?.length ? { sealedImportRelay: row.sealedImportRelays } : {}),
        path,
      };
    case "CLOSED_PRODUCER": {
      const governance = row.governance;
      return {
        // T-COMPUTED-DOMAIN: present only when the producer was reached through
        // an enumerated lookup; absent on every producer published earlier.
        ...(row.receipt?.kind === "computedKey"
          ? { computedDomain: computedDomainReceipt(row, path) }
          : {}),
        // T-TYPED-RELAY: the annotation proofs that closed this row, published
        // so the artifact can be audited without re-running the resolver. Only
        // present when there ARE proofs -- a producer that closed by any other
        // route gains no field at all.
        ...(row.typedRelays?.length ? { typedRelays: row.typedRelays } : {}),
        // T-SEQUENTIAL-8: same proof, when a producer rests on a write sequence.
        ...(row.sequentialAssignments?.length ? { sequentialAssignments: row.sequentialAssignments } : {}),
        governedProducerSiteId: governance?.governedProducerSiteId ?? null,
        customPropertyScanComplete: governance?.customPropertyScanComplete ?? null,
        governedChannelKeys: [...(governance?.governedChannelKeys ?? [])].sort(),
        internalSocketKeys: [...(governance?.internalSocketKeys ?? [])].sort(),
        sourcePartRefs: [...(governance?.sourcePartRefs ?? [])].sort(),
        path,
      };
    }
    case "CLOSED_NONOBJECT":
      return { nonObjectReason: row.receipt?.reason ?? null, path };

    /* T-BRANCH-37: a ZERO row that closed through the BRANCH UNION publishes
     * the per-arm evidence that justified it. A ZERO row that closed by any
     * earlier route keeps `null`, so nothing already in the artifact moves. */
    case "CLOSED_ZERO_GOVERNED_EMISSION_OBJECT": {
      // T-COMPUTED-DOMAIN: a lookup closed by domain enumeration publishes its
      // domain contract; a conditional closed by branch union publishes its
      // arms; anything closed by an earlier route keeps `null` so nothing that
      // is already in the artifact moves.
      if (row.receipt?.kind === "computedKey") return computedDomainReceipt(row, path);
      // T-SEQUENTIAL-8: a closure that rests on a proven static write sequence
      // publishes it. Checked before the indirect-enumeration branch so a row
      // that has both keeps each proof under its own key.
      if (row.sequentialAssignments?.length) {
        return {
          sequentialAssignments: row.sequentialAssignments,
          sequentialAssignmentCount: row.sequentialAssignments.length,
          ...(row.nestedComputedDomains?.length ? { nestedComputedDomains: row.nestedComputedDomains } : {}),
          customPropertyScanComplete: row.governance?.customPropertyScanComplete ?? null,
          governedChannelKeys: [...(row.governance?.governedChannelKeys ?? [])].sort(),
          internalSocketKeys: [...(row.governance?.internalSocketKeys ?? [])].sort(),
          path,
        };
      }
      // P0: an INDIRECT closure names the enumerations that justified it.
      if (row.receipt?.kind !== "branches" && row.nestedComputedDomains?.length) {
        return {
          nestedComputedDomains: row.nestedComputedDomains,
          nestedComputedDomainCount: row.nestedComputedDomains.length,
          customPropertyScanComplete: row.governance?.customPropertyScanComplete ?? null,
          governedChannelKeys: [...(row.governance?.governedChannelKeys ?? [])].sort(),
          internalSocketKeys: [...(row.governance?.internalSocketKeys ?? [])].sort(),
          path,
        };
      }
      if (row.receipt?.kind !== "branches") return null;
      const arms = row.receipt.branches ?? [];
      return branchUnionReceipt(row, arms, path);
    }

    /* ---- the seven OPEN dispositions: classified debt, never closed ---- *
     * These carry a receipt so the debt is actionable, but the receipt says
     * WHY resolution stopped -- it never asserts a shape the resolver could
     * not prove. A bounded projection is deliberate: publishing the whole
     * nested branch/leaf graph would put unproven structure into the durable
     * artifact and invite it being read as a result.                        */
    case "BRANCH_COMPOSITE_OPEN": {
      const branches = row.receipt?.branches ?? [];
      return {
        branchCount: branches.length,
        branchKinds: [...new Set(branches.map((b) => b.kind))].sort(),
        path,
      };
    }
    /* T-BRANCH-37: a row that survives here has been inspected arm by arm and
     * did NOT close. The receipt must say which of the two reasons applies --
     * an incomplete scan, or a real governed emission with no proven root --
     * otherwise the blocker is unactionable. */
    case "BRANCH_CONDITIONAL_AUTHORED":
      return branchUnionReceipt(row, row.receipt?.branches ?? [], path);
    case "AUTHORED_OPEN": {
      const leaves = row.receipt?.authoredLeaves ?? [];
      return {
        closed: row.receipt?.closed ?? null,
        authoredKeys: [...new Set(leaves.map((leaf) => leaf.key))].sort(),
        authoredLeafCount: leaves.length,
        // the openings are exactly what keeps the object open
        spreadOpeningCount: (row.receipt?.spreadOpenings ?? []).length,
        path,
      };
    }
    case "COMPUTED_DOMAIN_PENDING":
      return {
        reason: row.receipt?.reason ?? null,
        closed: row.receipt?.closed ?? null,
        // false here is the WHOLE point: an enumerated domain would have been
        // resolved instead of left pending.
        domainEnumerated: Array.isArray(row.receipt?.domain),
        branchCount: (row.receipt?.branches ?? []).length,
        path,
      };
    case "OPEN_UNKNOWN":
    case "CALL_ARGS_PENDING":
      return { reason: row.receipt?.reason ?? null, path };
    case "DYNAMIC_SINK_PENDING":
      return { path };

    default:
      return null;
  }
}

export class DispositionJoinConflict extends Error {
  constructor(key, field, left, right) {
    super(
      `disposition join conflict at ${key}: field ${field} disagrees between two rows ` +
        `sharing one natural key (${stable(left)} vs ${stable(right)}). A coordinate whose ` +
        `classification is ambiguous is never drained.`,
    );
    this.name = "DispositionJoinConflict";
    this.key = key;
    this.field = field;
    this.left = left;
    this.right = right;
  }
}

/**
 * Build the fail-closed `file|ordinal` -> entry index. Throws
 * `DispositionJoinConflict` on any material disagreement; merges per-sink
 * evidence. Pure.
 */
/**
 * T-COMPUTED-DOMAIN -- fields that are per-OCCURRENCE by construction and can
 * therefore never agree between two rows at one coordinate.
 *
 * `governedProducerSiteId` derives from `canonicalPreimageId`, whose coordinate
 * includes `snapshotIndex` -- a counter that is unique per row. `sourcePartRefs`
 * is minted from the same id. Comparing them for INVARIANCE is a category
 * error: they are identities of the occurrence, not claims about the site's
 * classification. Until now no coordinate carried two producers, so the error
 * was latent; enumerating computed domains produced the first one (3
 * occurrences at collection-workspace/index.tsx|30542, identical in every
 * classification field and differing only in these two ids).
 *
 * They are therefore MERGED, exactly like `sinkTags`/`relayKinds`: nothing is
 * discarded, nothing is chosen arbitrarily, and every other field of the
 * receipt -- governed keys, socket keys, scan completeness, resolution path,
 * domain contract -- is still compared and still throws on disagreement.
 */
const PER_OCCURRENCE_IDENTITY_FIELDS = Object.freeze(["governedProducerSiteId", "sourcePartRefs"]);

function invariantPartOf(receipt) {
  if (!receipt || typeof receipt !== "object") return receipt;
  const out = {};
  for (const [field, value] of Object.entries(receipt)) {
    if (PER_OCCURRENCE_IDENTITY_FIELDS.includes(field)) continue;
    out[field] = value;
  }
  return out;
}

export function dispositionIndex(rows) {
  const index = new Map();
  for (const row of rows) {
    const key = `${row.file}|${row.ordinal}`;
    const decision = {};
    for (const field of DISPOSITION_DECISION_FIELDS) decision[field] = row[field];
    const receipt = boundedReceiptOf(row);
    const producerSiteId = receipt && receipt.governedProducerSiteId ? receipt.governedProducerSiteId : null;
    const partRefs = receipt && Array.isArray(receipt.sourcePartRefs) ? receipt.sourcePartRefs : [];
    const sinkTag = row.boundaryReceipt?.sinkTagName ?? null;
    const relayKind = row.boundaryReceipt?.kind ?? null;

    const prior = index.get(key);
    if (!prior) {
      index.set(key, {
        key,
        decision,
        receipt,
        sinkTags: new Set(sinkTag ? [sinkTag] : []),
        relayKinds: new Set(relayKind ? [relayKind] : []),
        producerSiteIds: new Set(producerSiteId ? [producerSiteId] : []),
        producerSourcePartRefs: new Set(partRefs),
        occurrences: 1,
      });
      continue;
    }
    for (const field of DISPOSITION_DECISION_FIELDS) {
      if (stable(prior.decision[field]) !== stable(decision[field])) {
        throw new DispositionJoinConflict(key, field, prior.decision[field], decision[field]);
      }
    }
    if (stable(invariantPartOf(prior.receipt)) !== stable(invariantPartOf(receipt))) {
      throw new DispositionJoinConflict(key, "boundedReceipt", prior.receipt, receipt);
    }
    if (sinkTag) prior.sinkTags.add(sinkTag);
    if (relayKind) prior.relayKinds.add(relayKind);
    if (producerSiteId) prior.producerSiteIds.add(producerSiteId);
    for (const ref of partRefs) prior.producerSourcePartRefs.add(ref);
    prior.occurrences += 1;
  }
  // Freeze the merged sets into deterministic sorted arrays.
  for (const entry of index.values()) {
    entry.sinkTags = [...entry.sinkTags].sort();
    entry.relayKinds = [...entry.relayKinds].sort();
    entry.producerSiteIds = [...entry.producerSiteIds].sort();
    entry.producerSourcePartRefs = [...entry.producerSourcePartRefs].sort();
    /* Order-independence, the same rule the merged sets already obey: when a
     * coordinate carries SEVERAL producer occurrences, `entry.receipt` still
     * held whichever one happened to be indexed first, so reversing the input
     * changed the published id. Strip the scalar identities there and let the
     * sorted merged sets be the only account -- nothing is discarded and
     * nothing is chosen arbitrarily. A coordinate with exactly one occurrence
     * keeps its scalar fields untouched, so every producer published before
     * this tranche is byte-identical. */
    if (entry.producerSiteIds.length > 1) {
      entry.receipt = invariantPartOf(entry.receipt);
    }
  }
  return index;
}
