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

/**
 * v5 contract-informed primitives — READ-ONLY. Implements ONLY the pieces of
 * the proposed base contract (`pre-f4b-runtime-boundaries-dt-addendum-opus-v4.md`,
 * SHA `ab634a23ec80071e292f63962b65499f93fc4ce124ea13ca5b50b6202ef1c982`) and its
 * errata v4.1 (`pre-f4b-runtime-boundaries-dt-errata-v4.1-opus.md`, SHA
 * `a132977d53b2bfb815ed0c9634a2a69b5100dd456acaaff1ce842b2d12b308d0`) that the
 * independent BINARY review of that contract
 * (`pre-f4b-runtime-contract-v41-independent-binary.md`, SHA
 * `ce092d93517a2e1e16b745367fb32f5629d1fc814337f04089765648d72ce92c`) found
 * CLOSED: X1 (hash primitives) and the AST decomposition algorithm of §2.4
 * (never flagged defective by the binary review -- its rejections are about
 * the 17-collection writer topology/digest wiring in X2/X3/X8, not about
 * `decomposeImmediate` itself).
 *
 * This module does NOT implement the full 15-collection/17-digest writer
 * schema (siteResolutions, producerSites, channelEmissions, ownershipConflicts,
 * etc.) -- that belongs to the future A4/A5/A6 writer, which this READ-ONLY
 * mapper is not. What this module DOES provide, and what the v5 census uses:
 *
 *   - `sha256Hex`/`utf8`/`digestText`/`digestFile` (X1, CLOSED, applied literally)
 *   - `canonicalPreimageId` -- CI-1's canonical formula, WITHOUT `symbol`
 *   - `decomposeImmediate` + `orderParts` + canonical `astPath` (§2.4/X2.4) --
 *     used to produce `sourceParts`/`sourcePartRefs` on this census's own rows
 *   - `sourcePartId`/`zeroEmissionSiteId` (X1's literal formulas)
 *   - `canonicalJson`/`compareCodeUnit`/`sortSet`/`digestOf` (§3.1-3.3/X3.1) --
 *     used ONLY for this census's own small rebind-table and receipt digests,
 *     not for a 17-collection writer certification.
 *
 * AUTHORITY STATUS: the base+errata contract is PINNED, not ratified. The
 * binary independent review REJECTed it (X2 sourcePart.preimageId missing
 * from the published schema, X3's builders don't apply nested SET
 * canonicalization and one snippet does not parse, X8's scanClosedObject has
 * a spread-shape bug and an undeclared array grammar). This module never
 * claims compliance with X2/X3/X8 as ratified; it implements the SPECIFIC
 * closed primitives (X1, §2.4) directly and independently, and everywhere
 * else builds its own honest, self-consistent (but not contractually
 * asserted) receipt shapes -- "receipts no autoafirmados": nothing here
 * asserts contractual ACCEPT.
 */

/* ------------------------------------------------------------------ X1 --- */
export const sha256Hex = (bytes) => createHash("sha256").update(bytes).digest("hex");
export const utf8 = (text) => Buffer.from(text, "utf8");
export const digestText = (text) => sha256Hex(utf8(text));
export const digestFile = (absPath) => sha256Hex(readFileSync(absPath));

/* -------------------------------------------------------- CI-1 canonical --- */
/** The base-v4 §8 canonical formula, WITHOUT `symbol` (symbol stays a
 * descriptive field on the row, never part of the coordinate that mints the
 * ID -- per Fable's quantified conflict: with-symbol and without-symbol
 * formulas have a 0/2024 overlap on the SAME 2024 coordinates). */
export function canonicalPreimageId({ sourceInventorySha256, plane, file, line, ordinal, form, snapshotIndex }) {
  return digestText([sourceInventorySha256, plane, file, String(line), String(ordinal), form, String(snapshotIndex)].join("|"));
}

/** The v4/v3 formula, WITH `symbol` -- kept only to build the rebind table
 * (old -> canonical), never treated as canonical itself. */
export function legacyPreimageIdWithSymbol({ sourceInventorySha256, plane, file, line, ordinal, symbol, form, snapshotIndex }) {
  return digestText([sourceInventorySha256, plane, file, String(line), String(ordinal), symbol, form, String(snapshotIndex)].join("|"));
}

/* --------------------------------------------------- canonicalJson (X3.1) --- */
export const compareCodeUnit = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

export function canonicalJson(value) {
  if (value === null) return "null";
  const t = typeof value;
  if (t === "boolean") return value ? "true" : "false";
  if (t === "number") {
    if (!Number.isFinite(value)) throw new Error("canonicalJson: non-finite number");
    return JSON.stringify(value);
  }
  if (t === "string") return JSON.stringify(value);
  if (Array.isArray(value)) return "[" + value.map(canonicalJson).join(",") + "]";
  if (t === "object") {
    if (value.constructor !== Object) throw new Error("canonicalJson: non-plain object");
    const keys = Object.keys(value).sort(compareCodeUnit);
    const parts = [];
    for (const k of keys) {
      const v = value[k];
      if (v === undefined) throw new Error("canonicalJson: undefined value");
      parts.push(JSON.stringify(k) + ":" + canonicalJson(v));
    }
    return "{" + parts.join(",") + "}";
  }
  throw new Error("canonicalJson: unsupported type " + t);
}

export const sortSet = (rows, keyFns = [(x) => x]) =>
  rows.slice().sort((a, b) => {
    for (const k of keyFns) {
      const c = compareCodeUnit(String(k(a)), String(k(b)));
      if (c) return c;
    }
    return compareCodeUnit(canonicalJson(a), canonicalJson(b));
  });

export const digestOf = (rows, keyFns) => digestText(canonicalJson(sortSet(rows, keyFns)));

/* -------------------------------------------------- source parts (§2.4) --- */
const ROLE_ORDER = ["direct", "spread", "branch", "call", "import", "mutation", "opaque"];
const DELIM_GUARD = (...parts) => {
  for (const p of parts) if (typeof p === "string" && p.includes("|")) throw new Error("sourcePartId: delimiter | present in a coordinate component");
};

export function sourcePartId(preimageId, astPath, role, ordinal) {
  DELIM_GUARD(preimageId, astPath, role);
  return digestText([preimageId, astPath, role, String(ordinal)].join("|"));
}

export function zeroEmissionSiteId(preimageId, astPath) {
  DELIM_GUARD(preimageId, astPath);
  return digestText([preimageId, astPath, "zero-emission"].join("|"));
}

/** Symmetric to `zeroEmissionSiteId`, for a genuinely governed producer
 * (>=1 real `--ds-*`/`--_ds-*` emission) -- NOT part of the base contract's
 * literal schema (which reserves a full `producerSiteId` for the future
 * A4/A5/A6 writer's richer receipt: owner/evidence/conflict/engineScope/
 * causalRootIds/precedence). This is this census's own, honestly-scoped
 * identifier for "which resolved site produced these exact governed keys",
 * not a claim of contractual producerSite compliance. */
export function governedProducerSiteId(preimageId, astPath) {
  DELIM_GUARD(preimageId, astPath);
  return digestText([preimageId, astPath, "governed-producer"].join("|"));
}

function unwrapForDecompose(node) {
  let current = node;
  for (let guard = 0; guard < 8 && current; guard += 1) {
    if (ts.isParenthesizedExpression(current) || ts.isAsExpression(current) || ts.isNonNullExpression(current) || (ts.isSatisfiesExpression && ts.isSatisfiesExpression(current))) {
      current = current.expression;
      continue;
    }
    break;
  }
  return current;
}

/**
 * `decomposeImmediate(E)` per base-v4 §2.4, total by construction: never
 * flagged defective by the binary review (its REJECT targets the writer's
 * digest/topology wiring around sourceParts, not this algorithm). `ctx`:
 * `{ mutationDetected, identifierIsImport }` -- both optional booleans the
 * caller supplies from information it already has (this census's resolver
 * already detects mutation/import bindings at a higher level; decompose
 * receives that as a fact, it does not re-derive it).
 */
export function decomposeImmediate(sinkExprNode, ctx = {}) {
  if (ctx.mutationDetected) return [{ role: "mutation", node: sinkExprNode, childIndex: 0 }];
  const n = unwrapForDecompose(sinkExprNode);
  if (!n) return [{ role: "opaque", node: sinkExprNode, childIndex: 0 }];
  if (ts.isObjectLiteralExpression(n)) {
    const parts = [];
    n.properties.forEach((property, childIndex) => {
      if (ts.isPropertyAssignment(property) || ts.isShorthandPropertyAssignment(property)) {
        parts.push({ role: "direct", node: property, childIndex });
      } else if (ts.isSpreadAssignment(property)) {
        parts.push({ role: "spread", node: property, childIndex });
      }
    });
    return parts.length ? parts : [{ role: "direct", node: n, childIndex: 0 }];
  }
  if (ts.isConditionalExpression(n)) {
    return [
      { role: "branch", node: n.whenTrue, childIndex: 0 },
      { role: "branch", node: n.whenFalse, childIndex: 1 },
    ];
  }
  if (ts.isBinaryExpression(n)) {
    const op = n.operatorToken.kind;
    if (op === ts.SyntaxKind.BarBarToken || op === ts.SyntaxKind.QuestionQuestionToken || op === ts.SyntaxKind.AmpersandAmpersandToken) {
      return [
        { role: "branch", node: n.left, childIndex: 0 },
        { role: "branch", node: n.right, childIndex: 1 },
      ];
    }
  }
  if (ts.isCallExpression(n)) return [{ role: "call", node: n, childIndex: 0 }];
  if (ts.isIdentifier(n) && ctx.identifierIsImport) return [{ role: "import", node: n, childIndex: 0 }];
  return [{ role: "opaque", node: n, childIndex: 0 }];
}

/** `ordinal` = index in the ORDERED output of decomposeImmediate (X2.4). A
 * tie between two distinct parts is a hard failure, never an arbitrary
 * tiebreak. */
export function orderParts(parts, sourceFile) {
  const key = (p) => [p.node.getStart(sourceFile), p.node.getEnd(), p.childIndex ?? 0, ROLE_ORDER.indexOf(p.role)];
  const sorted = parts.slice().sort((a, b) => {
    const ka = key(a);
    const kb = key(b);
    for (let i = 0; i < ka.length; i += 1) if (ka[i] !== kb[i]) return ka[i] - kb[i];
    throw new Error("decomposeImmediate: tie between distinct parts");
  });
  return sorted.map((p, index) => ({ ...p, ordinal: index }));
}

/** `getChildren()` on a container node (e.g. ObjectLiteralExpression) wraps
 * its element list in an intermediate `SyntaxList` token that is invisible
 * to the semantic `.parent` chain (a PropertyAssignment's `.parent` IS the
 * ObjectLiteralExpression directly, skipping the SyntaxList) -- so a plain
 * `indexOf` against the raw `getChildren()` array never finds the real
 * child. Flattening one level of `SyntaxList` wrapper fixes this: the base
 * contract's snippet does not address this TS-specific quirk, so this is a
 * disclosed implementation decision, not part of X2/X3/X8. */
function flattenSyntaxListChildren(parent, sourceFile) {
  const out = [];
  for (const child of parent.getChildren(sourceFile)) {
    if (child.kind === ts.SyntaxKind.SyntaxList) out.push(...child.getChildren(sourceFile));
    else out.push(child);
  }
  return out;
}

/** Canonical `astPath`: sequence of `SyntaxKindName[childIndex]` from the
 * sink node (root, `""`) down to `partNode`, `childIndex` over the
 * SyntaxList-flattened `node.getChildren(sourceFile)` (see
 * `flattenSyntaxListChildren`). */
export function astPathFromSinkToPart(sinkNode, partNode, sourceFile) {
  if (partNode === sinkNode) return "";
  const chain = [];
  let n = partNode;
  while (n && n !== sinkNode) {
    chain.push(n);
    n = n.parent;
  }
  if (n !== sinkNode) return null;
  chain.reverse();
  let parent = sinkNode;
  const steps = [];
  for (const child of chain) {
    const children = flattenSyntaxListChildren(parent, sourceFile);
    const idx = children.indexOf(child);
    steps.push(`${ts.SyntaxKind[child.kind]}[${idx}]`);
    parent = child;
  }
  return steps.join("/");
}

/**
 * v6 ZERO-emission governance scan — READ-ONLY. Focal correction of v5's
 * governance.mjs against the three governance-side blockers named by the
 * v5 independent REJECT (`pre-f4b-unknown-census-v5-independent-final.md`,
 * SHA `db32b3f55381ec699203e6b8fbd3abd77b68a83d7d2a1b7580aad2f0d7aef922`):
 * P0-1 (fail-closed guard), P0-2 (exact read receipts), and half of P0-4
 * (causal sourcePartId on every witness/read -- the other half, publishing
 * `preimageId` on each sourcePart and giving the four dynamic sinks their
 * own part, lives in drive.mjs). v5's recursive-scan design itself (blockers
 * 1+2 from the v4 round) is UNCHANGED: every leaf's own VALUE shape is still
 * walked at any depth, through objects/arrays/branches/computedKey, and
 * `readRefsIn` still scans the FULL untruncated node text, never a preview.
 *
 * P0-1 -- the v5 bug, exact: `scanClosedShape` threaded its accumulator as
 * `{ ...acc, origin: "..." }` on every recursive call. `visited`/
 * `keyWitnesses`/`readRefs` are references, so those stayed shared, but
 * `incomplete`/`cycleDetected`/`hasUnresolvedKey` are booleans -- a spread
 * copies their CURRENT value into a new object, so a descendant's
 * `acc.cycleDetected = true` mutated only ITS OWN copy, never the root's.
 * `governanceAnalysis()` reads the ROOT accumulator, so a cycle, a depth-guard
 * overflow, an unresolved computed key, or an unexpected shape reached under
 * a nominally-closed container could all falsely certify ZERO/PRODUCER.
 * Fixed here by making `acc` genuinely ONE mutable object for the entire
 * scan (never spread-copied); `origin` and the new `causalSourcePartId`
 * (P0-4) are passed as plain per-call arguments instead, exactly as the
 * REJECT's own suggested correction describes.
 *
 * P0-2 -- the v5 bug, exact: a container leaf's own node text was scanned in
 * full for `var()` refs, and then `scanClosedShape` recursed into that same
 * leaf's resolved VALUE shape, which (for an object/array value) scans its
 * OWN children's text too -- every `var()` reference nested inside a
 * multi-property object value was found once by the ANCESTOR's full-text
 * scan and again by each descendant leaf's own narrower scan. Fixed by
 * keying every match on a stable `occurrenceId` = `file:absoluteSourceOffset`
 * (finer-grained than any AST path -- a `var()` call has no node of its own
 * when it lives inside a string/template literal) and deduping through a
 * single `Map` on the shared accumulator: the SAME physical source range
 * scanned twice from different recursion depths collapses to one entry,
 * while two textually-identical `var()` calls at different offsets on the
 * same line stay two, each with its own id.
 *
 * P0-4 (governance half) -- every keyWitness/readChannelRef now carries the
 * `sourcePartId` of the row's OWN top-level sourcePart that causally led to
 * it, INCLUDING across import/call hops (the id is threaded down unchanged
 * through however many cross-file recursions it takes to reach a witness --
 * see drive.mjs's docstring for why decomposeImmediate's limited grammar
 * makes this provable by construction for every row in this codebase: a
 * multi-part decomposition only ever happens for a directly-authored object
 * literal, where `resolveShape` and `decomposeImmediate` independently walk
 * the SAME `n.properties` from the SAME parse, so their entries always
 * correspond by exact AST node identity). If a witness genuinely cannot be
 * matched to a declared sourcePart, the scan is marked incomplete (fail
 * closed, per P0-1's own mechanism) rather than inventing coverage.
 */

const GOVERNED_CHANNEL_RE = /^--ds-/;
const INTERNAL_SOCKET_RE = /^--_ds-/;
/* T-STATIC-KEYSET: ANY literal key beginning with `--` is a custom property
 * the element really emits. `--ds-` is the governed channel namespace and
 * `--_ds-` the internal socket namespace; everything else (`--rottay-*` and any
 * other authored prefix) is still a REAL emission -- it is simply not governed
 * by this programme. Counting it as an ordinary CSS property would let a shape
 * that stamps custom properties certify as a ZERO emission, which is the one
 * verdict that must never be reachable by omission. */
const CUSTOM_PROPERTY_RE = /^--/;
const VAR_REF_RE = /var\(\s*(--(?:ds|_ds)-[a-zA-Z0-9-]+)/g;

function fullText(node) {
  if (!node) return "";
  try {
    return node.getText();
  } catch {
    return "";
  }
}

/** Absolute source-file character offset of `node`'s own text start, or
 * `null` when unavailable (a synthetic/placeholder shape node with no real
 * `SourceFile`, as used by this file's own isolated assertions fixtures). */
function absoluteStart(node) {
  if (!node) return null;
  try {
    const sf = node.getSourceFile();
    if (!sf) return null;
    return node.getStart(sf);
  } catch {
    return null;
  }
}

/** Every `var(--ds-*|--_ds-*)` reference in the FULL, UNTRUNCATED text of
 * `node` -- independent-final blocker 2 / v5 P0-2: a preview truncation must
 * never be the input to evidence detection, only to display. Each match is
 * pushed into `acc.readByOccurrence`, a `Map` keyed by a stable
 * `occurrenceId` (`file:absoluteOffset`) so re-scanning the identical source
 * range from an ancestor container's full-text scan and again from a
 * descendant leaf's own narrower scan (the P0-2 duplication mechanism)
 * collapses to ONE entry, while two textually-identical `var()` calls at
 * different offsets on the same line remain two, each with its own id and
 * its own `sourcePartId` causal attribution (P0-4). */
function readRefsIn(node, sourceLabel, fileRel, acc, causalSourcePartId) {
  const text = fullText(node);
  if (!text) return;
  const base = absoluteStart(node);
  let m;
  VAR_REF_RE.lastIndex = 0;
  while ((m = VAR_REF_RE.exec(text))) {
    const channel = m[1];
    const occurrenceId = base === null ? `${fileRel ?? sourceLabel ?? "<fixture>"}::text-relative::${sourceLabel}::${m.index}` : `${fileRel ?? sourceLabel ?? "<fixture>"}::${base + m.index}`;
    if (acc.readByOccurrence.has(occurrenceId)) continue;
    acc.readByOccurrence.set(occurrenceId, {
      channel,
      channelKind: channel.startsWith("--_ds-") ? "internal-socket" : "governed",
      at: sourceLabel,
      occurrenceId,
      sourcePartId: causalSourcePartId ?? null,
    });
  }
}

/**
 * Recursively collects EVERY key witness and read reference reachable from
 * `shape`, at any depth, through objects/arrays/branches/computedKey. Each
 * witness carries `{astPath, key, kind, origin, sourcePartId}`. `astPath` is
 * computed relative to its OWN immediate containing object literal (not the
 * outer row's sink) -- a witness reached through a call/import hop physically
 * lives in a different file/AST subtree than the sink, so a sink-relative
 * path would be null for most cross-file cases; the LOCAL decomposition is
 * always computable and always meaningful. `localRootFile`/`localRootAt`
 * record where that local object itself lives, for full traceability across
 * the hop. `origin` is how THIS container was reached: `direct` own
 * property, `spread` via a spread source, `branch` via a branches
 * alternative, `array-element`. `sourcePartId` (P0-4) is the row's OWN
 * top-level sourcePart this witness/read causally descends from -- see
 * `resolveCausalId` below and the module docstring.
 *
 * `acc` is ONE mutable object for the entire scan (P0-1: never spread-copied
 * on recursion). `origin` and `causalSourcePartId` are plain per-call
 * arguments, not accumulator fields, so a descendant's boolean flag writes
 * (`incomplete`/`cycleDetected`/`hasUnresolvedKey`) always land on the SAME
 * object `governanceAnalysis()` reads back at the root.
 */
export function scanClosedShape(shape, ctx, acc, depthGuard = 0, origin = "direct", causalSourcePartId = null, valuePosition = false) {
  if (!shape || depthGuard > 80) {
    acc.incomplete = true;
    acc.depthOverflow = true;
    return;
  }
  if (acc.visited.has(shape)) {
    acc.cycleDetected = true;
    acc.incomplete = true;
    return;
  }
  acc.visited.add(shape);

  /** P0-4: at the OUTERMOST call only (`depthGuard===0`), and only when the
   * row's sourceParts decomposition produced more than one part (only
   * possible for a directly-authored multi-property object literal -- see
   * drive.mjs), resolve which declared sourcePart a specific top-level
   * `order` entry descends from, by exact AST node identity. `undefined`
   * from the matcher means "no declared sourcePart corresponds to this
   * entry" -- a fail-closed signal (should be structurally unreachable given
   * decomposeImmediate/resolveShape share the same `n.properties` walk, but
   * never invented). Every level below `depthGuard===0` just inherits the
   * causal id its parent already resolved -- once a subtree's cause is
   * proven, it stays proven through however many further hops.
   */
  const resolveCausalId = (partNode) => {
    if (depthGuard !== 0 || !acc.causalMatcher) return causalSourcePartId;
    const matched = acc.causalMatcher(partNode);
    if (matched === undefined) {
      acc.incomplete = true;
      acc.unprovenCausalLink = true;
      return null;
    }
    return matched;
  };

  if (shape.kind === "object") {
    const localRootSourceFile = shape.node ? shape.node.getSourceFile() : null;
    const localRootCoord = shape.node && localRootSourceFile ? `${shape.fileRel ?? localRootSourceFile.fileName}:${localRootSourceFile.getLineAndCharacterOfPosition(shape.node.getStart(localRootSourceFile)).line + 1}` : null;
    const fileForReads = shape.fileRel ?? (localRootSourceFile ? localRootSourceFile.fileName : null);
    for (const entry of shape.order) {
      if (entry.kind === "spread") {
        const partId = resolveCausalId(entry.node);
        scanClosedShape(entry.shape, ctx, acc, depthGuard + 1, "spread", partId, valuePosition);
        continue;
      }
      // leaf
      if (entry.unresolvedKey) {
        acc.hasUnresolvedKey = true;
        acc.incomplete = true;
        continue;
      }
      const partId = resolveCausalId(entry.declNode ?? entry.node);
      const partNode = entry.declNode ?? entry.node;
      const astPath = shape.node && localRootSourceFile && partNode ? astPathFromSinkToPart(shape.node, partNode, localRootSourceFile) : null;
      const kind = entry.key && INTERNAL_SOCKET_RE.test(entry.key)
        ? "internal-socket"
        : entry.key && GOVERNED_CHANNEL_RE.test(entry.key)
          ? "governed"
          // T-STATIC-KEYSET: a custom property outside both governed namespaces
          : entry.key && CUSTOM_PROPERTY_RE.test(entry.key)
            ? "ungoverned-custom"
            : "ordinary";
      acc.keyWitnesses.push({ astPath, localRootFile: shape.fileRel ?? null, localRootAt: localRootCoord, key: entry.key, kind, origin, sourcePartId: partId });
      const readAt = entry.node && localRootSourceFile ? `${shape.fileRel ?? localRootSourceFile.fileName}:${localRootSourceFile.getLineAndCharacterOfPosition(entry.node.getStart(localRootSourceFile)).line + 1}` : localRootCoord;
      readRefsIn(entry.node, readAt, fileForReads, acc, partId);
      // recurse into the LEAF'S OWN VALUE SHAPE -- this is exactly the
      // recursion the v4 blocker found missing.
      // T-STATIC-KEYSET: this recursion ENTERS a value position, and every
      // recursion below inherits it -- nothing nested under a leaf value can
      // put a key on the style object either. That makes this walk agree
      // exactly with `keySetEnumerable`, which likewise never descends into a
      // leaf value. A spread or branch reached OUTSIDE a value position keeps
      // its old fail-closed behaviour.
      // Whatever it resolves to lands under `entry.key`, which is already
      // witnessed above, so an unresolved value here cannot hide a key. Every
      // other recursion below stays key-bearing and keeps failing closed.
      scanClosedShape(entry.shape, ctx, acc, depthGuard + 1, "direct", partId, true);
    }
    return;
  }
  if (shape.kind === "array") {
    const arraySourceFile = shape.node ? shape.node.getSourceFile() : null;
    const arrayAt = shape.node && arraySourceFile ? `${shape.fileRel ?? arraySourceFile.fileName}:${arraySourceFile.getLineAndCharacterOfPosition(shape.node.getStart(arraySourceFile)).line + 1}` : null;
    const fileForReads = shape.fileRel ?? (arraySourceFile ? arraySourceFile.fileName : null);
    for (const el of shape.elements) {
      readRefsIn(el.node, arrayAt, fileForReads, acc, causalSourcePartId);
      scanClosedShape(el.shape, ctx, acc, depthGuard + 1, el.kind === "spread" ? "spread" : "array-element", causalSourcePartId, valuePosition);
    }
    return;
  }
  if (shape.kind === "branches") {
    for (const b of shape.branches) scanClosedShape(b, ctx, acc, depthGuard + 1, "branch", causalSourcePartId, valuePosition);
    return;
  }
  if (shape.kind === "computedKey") {
    for (const b of shape.branches ?? []) scanClosedShape(b, ctx, acc, depthGuard + 1, "branch", causalSourcePartId, valuePosition);
    /* An unresolved computed-key DOMAIN blocks the scan only where it could
     * introduce a name. Reached in a VALUE position -- `{ width: map[k] }` --
     * the lookup decides a value under a key that is already witnessed, so it
     * can hide nothing; it is recorded like any other open value. */
    if (shape.reason) {
      if (valuePosition) acc.openLeafValues += 1;
      else acc.incomplete = true;
    }
    return;
  }
  if (shape.kind === "nonObject") {
    readRefsIn(shape.node, `${ctx.fileRel ?? "<fixture>"}:${ctx.line ?? "?"}`, ctx.fileRel ?? null, acc, causalSourcePartId);
    return;
  }
  /* relay / callArgsPending / dynamicSink / openUnknown.
   *
   * T-STATIC-KEYSET: reached in a VALUE position this is not a gap in the key
   * census -- the key is already witnessed and an unresolved value cannot add
   * another. It is recorded as evidence (the row must be able to say how much
   * of it stayed unresolved) and the scan continues.
   *
   * Reached anywhere else -- a spread, a branch arm, an array element, or the
   * root itself -- it CAN still hide a key, and fails closed exactly as before.
   */
  if (valuePosition) {
    acc.openLeafValues += 1;
    acc.openLeafValueKinds.add(shape.kind);
    return;
  }
  acc.incomplete = true;
}

/** P0-4: build the causal-id resolution strategy for this row.
 *   - 0 or 1 sourceParts: TRIVIAL -- the entire scan (every witness/read, at
 *     any depth) is caused by that one part (or by nothing, if there are no
 *     parts at all). No per-entry matching needed or possible.
 *   - >1 sourceParts: only reachable when `startExpr` is a directly-authored
 *     object literal with 2+ direct/spread properties (decomposeImmediate's
 *     only multi-part grammar rule; every other sink form decomposes to
 *     exactly one part). Build a `node identity -> sourcePartId` map from the
 *     row's OWN raw ordered parts (which still carry their original AST node
 *     references) and match each top-level `shape.order` entry against it.
 *
 * A `branches` root does NOT consult that matcher. Before T-BRANCH-37 this
 * paragraph claimed conditional sinks "never reach governance at all"; that is
 * no longer true -- an exhaustively resolved conditional is scanned arm by arm.
 * What holds instead is structural: `scanClosedShape`'s `branches` case
 * recurses straight into the arms at `depthGuard + 1`, while `resolveCausalId`
 * only runs at `depthGuard === 0`, so the matcher is never reached from a
 * branch root. Measured on the live tree: of the 11 branch rows that decompose
 * to more than one part, the 6 that reach governance carry witnesses with a
 * null `sourcePartId` and `unprovenCausalLink: false`. That is sound for the
 * ZERO verdict, which turns only on the ABSENCE of governed keys, and it is a
 * further reason a branch row is never admitted as CLOSED_PRODUCER.
 */
function buildCausalIndex(sourceParts) {
  if (!sourceParts || sourceParts.length <= 1) {
    return { trivialId: sourceParts && sourceParts[0] ? sourceParts[0].sourcePartId : null, matcher: null };
  }
  const byNode = new Map();
  for (const p of sourceParts) if (p.node) byNode.set(p.node, p.sourcePartId);
  return {
    trivialId: null,
    matcher: (node) => (node && byNode.has(node) ? byNode.get(node) : undefined),
  };
}

/**
 * Full recursive governance scan of a CLOSED shape. Returns:
 *   keyWitnesses          -- {astPath,key,kind,origin,sourcePartId} for EVERY
 *                            authored key reachable at any depth (exhaustive)
 *   governedChannelKeys / internalSocketKeys / ordinaryPropertyKeys --
 *                            derived (deduped) projections of keyWitnesses
 *   readChannelRefs        -- {channel,channelKind,at,occurrenceId,sourcePartId},
 *                            scanned from FULL untruncated leaf/value text,
 *                            deduped by occurrenceId (P0-2)
 *   customPropertyScanComplete -- DERIVED: `!incomplete && !hasUnresolvedKey
 *                            && !cycleDetected && !unprovenCausalLink`,
 *                            computed from what the walk actually observed
 *                            on the SHARED root accumulator (P0-1) -- never
 *                            hardcoded true.
 *
 * `sourceParts` (P0-4, optional -- omitted callers get `sourcePartId: null`
 * on every witness/read, never a fabricated id) is the row's OWN raw ordered
 * decomposeImmediate output, still carrying `.node` AST references.
 */
export function governanceAnalysis(shape, ctx, sourceParts = []) {
  const causal = buildCausalIndex(sourceParts);
  const acc = {
    keyWitnesses: [],
    readByOccurrence: new Map(),
    visited: new WeakSet(),
    incomplete: false,
    hasUnresolvedKey: false,
    cycleDetected: false,
    depthOverflow: false,
    unprovenCausalLink: false,
    // T-STATIC-KEYSET: how much of the shape stayed unresolved in a VALUE
    // position. Evidence, never a licence: a row publishes it so a reader can
    // see the census closed the KEY SET, not the values.
    openLeafValues: 0,
    openLeafValueKinds: new Set(),
    causalMatcher: causal.matcher,
  };
  scanClosedShape(shape, ctx, acc, 0, "direct", causal.trivialId);
  const governedSet = new Map();
  const internalSet = new Map();
  const ungovernedCustomSet = new Map();
  const ordinarySet = new Set();
  for (const w of acc.keyWitnesses) {
    if (!w.key) continue;
    if (w.kind === "internal-socket") internalSet.set(w.key, true);
    else if (w.kind === "governed") governedSet.set(w.key, true);
    else if (w.kind === "ungoverned-custom") ungovernedCustomSet.set(w.key, true);
    else ordinarySet.add(w.key);
  }
  const customPropertyScanComplete = !acc.incomplete && !acc.hasUnresolvedKey && !acc.cycleDetected && !acc.unprovenCausalLink;
  return {
    keyWitnesses: acc.keyWitnesses,
    governedChannelKeys: [...governedSet.keys()],
    internalSocketKeys: [...internalSet.keys()],
    // T-STATIC-KEYSET: real emissions outside both governed namespaces
    ungovernedCustomPropertyKeys: [...ungovernedCustomSet.keys()],
    ordinaryPropertyKeys: [...ordinarySet],
    readChannelRefs: [...acc.readByOccurrence.values()],
    customPropertyScanComplete,
    scanIncomplete: acc.incomplete,
    cycleDetected: acc.cycleDetected,
    depthOverflow: acc.depthOverflow,
    hasUnresolvedKey: acc.hasUnresolvedKey,
    unprovenCausalLink: acc.unprovenCausalLink,
    openLeafValues: acc.openLeafValues,
    openLeafValueKinds: [...acc.openLeafValueKinds].sort(),
  };
}

/** Collapse a governance scan into a disposition: `governanceOutcome` maps a
 * CLOSED object/array/computedKey shape to CLOSED_PRODUCER (>=1 governed or
 * internal-socket key found, anywhere) or CLOSED_ZERO_GOVERNED_EMISSION_OBJECT
 * (none found AND the scan is provably complete). An INCOMPLETE scan (cycle,
 * depth guard, unresolved computed domain, or -- P0-4 -- an unproven causal
 * link reached under a nominally-closed container) never certifies either
 * way -- fail-closed per the base-contract admission rule (§9.3 / X8.2
 * `admitsZeroEmission`). */
export function governanceOutcome(shape, ctx, sourceParts = []) {
  const gov = governanceAnalysis(shape, ctx, sourceParts);
  if (!gov.customPropertyScanComplete) return { disposition: "OPEN_UNKNOWN", governance: gov };
  /* T-STATIC-KEYSET: a shape is ZERO only when NO branch enumerates ANY custom
   * property. An ungoverned one (`--rottay-*`) is still an emission: it makes
   * the row a producer -- one with no governed root, no tenant reach and no
   * consumability -- never a zero. */
  const isReal =
    gov.governedChannelKeys.length > 0 ||
    gov.internalSocketKeys.length > 0 ||
    gov.ungovernedCustomPropertyKeys.length > 0;
  return { disposition: isReal ? "CLOSED_PRODUCER" : "CLOSED_ZERO_GOVERNED_EMISSION_OBJECT", governance: gov };
}
