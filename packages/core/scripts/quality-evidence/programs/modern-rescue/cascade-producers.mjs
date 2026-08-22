#!/usr/bin/env node
/**
 * cascade-producers.mjs — WO-CRA-23 cascade, PRODUCER INVENTORY (PRE_F4B A4).
 *
 * WHY THIS EXISTS. `cascade-extract.mjs` declares a CLOSED vocabulary of four
 * planes and scans exactly one. The other three lived as hand-written prose
 * with hard-coded counters. The fourth, `tsx-inline-stamp`, was declared the
 * ONLY producer of 153 governed channels — 48 of them read by the modern skin
 * with no fallback at all — and shipped without a single line of code that
 * could name them. A plane that is declared and not enumerated can produce ANY
 * channel, so it contaminates every bucket whose adjudication rests on the
 * ABSENCE of a producer. That is why this module is a precondition of the
 * cascade gate and not an extra.
 *
 * THREE STRUCTURES, KEPT APART (contrato v3 + addendum C3/V3-3). Conflating
 * them is what made the previous attempt unfalsifiable:
 *
 *   producerSiteId    -> exactly ONE ownerId          (ownership)
 *   channelEmissionId -> engineScope + evidence       (applicability)
 *   channelEmissionId -> causalRootIds[] with witness (causality)
 *
 * Two different functions may legitimately emit the same channel: the overlap
 * of names is NOT an ownership conflict, and picking a "winner" by name would
 * erase a real producer. Every producer site and every emission survives.
 * Merge precedence is recorded as METADATA and never resolves ownership.
 *
 * ROOT CAUSALITY IS PER EMISSION. A global `enumeratorId -> rootId` map is
 * refused by measurement: six of the twelve enumerators (456 names) have no
 * unambiguous candidate, and `premium-card` alone emits 301 names whose single
 * exact match would otherwise be propagated to all of them. An `enumerator`
 * edge toward a root may only be created for an emission whose channel matches
 * an authored LIVE derivation EXACTLY. `causalRootIds: []` is a legitimate,
 * complete answer: it means `producedExternalTerminal`, never UNKNOWN.
 *
 * FAIL-CLOSED, AND WHY UNDER-COUNTING IS *NOT* SAFE. An earlier form of this
 * module claimed that missing a producer merely inflates debt. That is FALSE
 * for the contracted semantics: under STRICT, a fallback alternative is
 * admitted only when its `guardPrimary` has NO producer. Omit a producer and
 * the branch becomes admissible, `wiredToAdoptedRoot` grows and debt DROPS.
 * An unenumerated site can therefore BUY a false green, which is why every
 * expression this scanner cannot resolve becomes a row in
 * `unknownProvenance` -- one per site, with file, symbol and reason -- and
 * never a bare counter. `unknownProvenance` is the entry condition of lot B:
 * while a single row survives, the gate certifies nothing (addendum F-5).
 *
 * CLI CONTRACT (identical to cascade-extract.mjs):
 *   node cascade-producers.mjs            -> --check (DEFAULT, FAIL-CLOSED)
 *   node cascade-producers.mjs --check    -> recompute, byte-compare, exit 1 on diff, NEVER write
 *   node cascade-producers.mjs --write    -> write OUT
 * `buildProducers()` is PURE; importing this module writes nothing.
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import ts from "typescript";

import { repoRoot as findRepoRoot } from "../../../lib/repo-root/index.mjs";
import { classifyCrossFileRows, dispositionIndex } from "./cascade-disposition.mjs";
import {
  BRAND_THEME,
  CHROME_VARIABLES,
  buildEnumerators,
  expandTemplate,
  functionBodies,
  literalTokens,
  overrideTokens,
  tenantReach,
  templateEmissions,
} from "../../../../src/tooling/lane-control/runtime/tenant-reach/index.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const MANIFEST = join(HERE, "../../../../manifest");
const REPO_ABS = findRepoRoot(HERE);
const OUT = join(MANIFEST, "cascade/extracted/producers.json");
const CSS_EDGES = join(MANIFEST, "cascade/extracted/css-edges.json");
const CASCADE_ROOTS = join(MANIFEST, "cascade/roots");
const ROOT_CATALOG = join(MANIFEST, "cascade/root-catalog.json");
const ARTIFACTS_DIR = join(REPO_ABS, "packages/core/src/foundation/tokens/css/facade/artifacts");
const TENANT_THEME_PATH =
  "packages/core/src/foundation/contracts/composition/tenants/themes/tenant-theme/index.ts";

export const PLANES = ["css", "ts-compilers", "ts-chrome-variables", "tsx-inline-stamp"];

/** Which plane a compiler source belongs to. The split is BY NAME, not postal. */
const APPEARANCE_POSTURE =
  "packages/core/src/infrastructure/compilers/kernel/foundation/css/appearance-posture/index.ts";
const planeOfCompilerFile = (file) =>
  file === CHROME_VARIABLES ? "ts-chrome-variables" : "ts-compilers";

/* ---------------------------------------------------------------- ids --- */
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
export const producerSiteIdOf = (plane, file, line, symbol, occurrence) =>
  sha256(`${plane}|${file}|${line}|${symbol}|${occurrence}`);
export const channelEmissionIdOf = (producerSiteId, channel) =>
  sha256(`${producerSiteId}|${channel}`);

const lineAt = (source, index) => source.slice(0, index).split("\n").length;
const bodyOf = (source, name) =>
  functionBodies(source).find((entry) => entry.name === name)?.body ?? source;

/* =========================================================== TSX PLANE ===
 * The fourth plane, enumerated at last.
 *
 * MEMBERSHIP CRITERION, copied from the authored census it must reproduce: a
 * channel belongs to this plane ONLY if it is assigned as a property of an
 * object that reaches a JSX `style`, or via `element.style.setProperty()`, or
 * through a variables object spread into a `style`. Enumeration is BY ENTITY
 * (AST), never by text shape: we start at the SINK and resolve the expression
 * backwards — identifier, property, call, useMemo/useCallback, indexed map —
 * until the object literal. Interface keys, objects that never reach a style,
 * comment prose, test strings and names inside evidence JSON stay out by
 * construction.
 * ======================================================================== */

/**
 * SCAN UNIVERSE. The authored census names `ui/**` and `infrastructure/runtime/**`
 * as where this plane's producers LIVE, but its own file counts only reconcile
 * against the WHOLE package source: 3391 .ts/.tsx files in `src` against its
 * 1740 scanned + 1664 excluded = 3404, and 1727 after the same exclusions
 * against its 1740. Measured, not assumed -- so the scan is `src`, and a stamp
 * is counted wherever it is, not only where the prose expected it.
 */
const TSX_ROOTS = ["packages/core/src"];
const TSX_EXCLUDE = [
  "/tests/",
  "/fixtures/",
  "/__mocks__/",
  "/examples/",
  "/generated/",
  ".test.",
  ".spec.",
  ".stories.",
];

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

/** The enclosing named function/component of a node, or `<module>`. */
function enclosingSymbol(node) {
  let current = node;
  while (current) {
    if (ts.isFunctionDeclaration(current) && current.name) return current.name.text;
    if (
      (ts.isVariableDeclaration(current) || ts.isPropertyAssignment(current)) &&
      current.name &&
      ts.isIdentifier(current.name)
    ) {
      return current.name.text;
    }
    if (ts.isMethodDeclaration(current) && current.name && ts.isIdentifier(current.name)) {
      return current.name.text;
    }
    current = current.parent;
  }
  return "<module>";
}

/** A property key that names a custom property, whatever the syntactic form. */
function customPropertyKey(name) {
  if (!name) return null;
  if (ts.isStringLiteralLike(name) && name.text.startsWith("--")) return name.text;
  if (ts.isComputedPropertyName(name)) {
    let expression = name.expression;
    while (ts.isAsExpression(expression) || ts.isParenthesizedExpression(expression)) {
      expression = expression.expression;
    }
    if (ts.isStringLiteralLike(expression) && expression.text.startsWith("--")) {
      return expression.text;
    }
  }
  return null;
}

/**
 * Scan ONE source file, sink-anchored.
 *
 * Returns the stamp sites it can prove, plus the passthroughs it could not
 * resolve — declared, never silently dropped, because an unresolved
 * passthrough is exactly the shape that would hide a producer.
 */
/**
 * Syntactic forms that CANNOT carry a custom property. A site whose backward
 * resolution lands on one of them is closed BY PROOF -- it is not a producer
 * hiding behind an unresolved passthrough, so leaving it in `unknownProvenance`
 * would overstate the debt. The vocabulary is the census shape vocabulary:
 * literals, `undefined`, a prefix-unary (always boolean) and a template
 * expression (always a CSS string). Anything richer stays unresolved on
 * purpose -- this rule adds proof, it never re-routes resolution.
 */
// Canonical names, NOT `ts.SyntaxKind[kind]`: that reverse lookup returns the
// first alias sharing the numeric value, so NoSubstitutionTemplateLiteral would
// print as `FirstTemplateToken` and NumericLiteral as `FirstLiteralToken`. The
// receipt has to be stable and readable, so the name is pinned here.
const NONOBJECT_KINDS = new Map([
  [ts.SyntaxKind.StringLiteral, "StringLiteral"],
  [ts.SyntaxKind.NoSubstitutionTemplateLiteral, "NoSubstitutionTemplateLiteral"],
  [ts.SyntaxKind.NumericLiteral, "NumericLiteral"],
  [ts.SyntaxKind.TrueKeyword, "TrueKeyword"],
  [ts.SyntaxKind.FalseKeyword, "FalseKeyword"],
  [ts.SyntaxKind.NullKeyword, "NullKeyword"],
]);

/**
 * The typed reason a node is provably non-object, or null. Decided on the
 * TypeScript AST node kind -- never on a list of ids, files or lines.
 */
export function provablyNonObject(node) {
  if (!node) return null;
  const literalKind = NONOBJECT_KINDS.get(node.kind);
  if (literalKind) return `literal-kind:${literalKind}`;
  if (ts.isIdentifier(node) && node.text === "undefined") return "undefined-keyword";
  if (ts.isPrefixUnaryExpression(node)) return "prefix-unary-not-object";
  if (ts.isTemplateExpression(node)) return "template-expression-css-string";
  return null;
}

export function scanTsxSource(rel, text) {
  const source = ts.createSourceFile(rel, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const localBindings = new Map();
  const sinks = [];
  const stamps = [];
  const unresolved = [];
  const noteUnresolved = (node, form, reason) => {
    const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
    unresolved.push({
      line: line + 1,
      ordinal: node.getStart(source),
      symbol: enclosingSymbol(node),
      form,
      reason,
      expression: node.getText(source).slice(0, 120).replace(/\s+/g, " "),
    });
  };
  // CLOSED BY PROOF. Same identity family as an unresolved site (line,
  // ordinal, symbol, text) so the receipt is reconcilable row by row. It is a
  // SEQUENCE in deterministic generation order: two occurrences can share
  // file:line:ordinal, so nothing here asserts tuple uniqueness.
  const closedNonObject = [];
  const noteClosedNonObject = (node, reason) => {
    const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
    closedNonObject.push({
      line: line + 1,
      ordinal: node.getStart(source),
      symbol: enclosingSymbol(node),
      reason,
      expression: node.getText(source).slice(0, 120).replace(/\s+/g, " "),
    });
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

  /**
   * Resolve an expression to the object literals it can be, bounded.
   *
   * Anything it refuses to follow is recorded as an UNRESOLVED SITE, not as a
   * counter: a site whose producer is unknown must be able to block, and a
   * number cannot be blocked on.
   */
  const resolveObjects = (expression, depth, seen) => {
    const found = [];
    const node = unwrap(expression);
    if (!node) return found;
    // PROOF BEFORE SUSPICION.
    const nonObject = provablyNonObject(node);
    if (nonObject) {
      noteClosedNonObject(node, nonObject);
      return found;
    }
    if (depth > 6) {
      noteUnresolved(expression, "depth-limit", "backward resolution hit the depth bound");
      return found;
    }
    if (ts.isObjectLiteralExpression(node)) {
      found.push(node);
      for (const property of node.properties) {
        if (ts.isSpreadAssignment(property)) {
          const spread = resolveObjects(property.expression, depth + 1, seen);
          if (spread.length === 0) {
            noteUnresolved(property, "spread", "spread whose source object could not be resolved");
          }
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
      noteUnresolved(node, "identifier", "identifier is not bound in this file (import, parameter or prop passthrough)");
      return found;
    }
    if (ts.isConditionalExpression(node)) {
      return [
        ...resolveObjects(node.whenTrue, depth + 1, seen),
        ...resolveObjects(node.whenFalse, depth + 1, seen),
      ];
    }
    if (ts.isBinaryExpression(node)) {
      return [
        ...resolveObjects(node.left, depth + 1, seen),
        ...resolveObjects(node.right, depth + 1, seen),
      ];
    }
    if (ts.isCallExpression(node)) {
      const callee = unwrap(node.expression);
      // useMemo(() => ({...}), deps) / useCallback(...)
      if (ts.isIdentifier(callee) && /^use[A-Z]/.test(callee.text) && node.arguments.length) {
        return resolveObjects(node.arguments[0], depth + 1, seen);
      }
      if (ts.isArrowFunction(callee) || ts.isFunctionExpression(callee)) {
        return resolveObjects(callee.body, depth + 1, seen);
      }
      noteUnresolved(node, "call", "call expression whose callee is not an inline factory");
      return found;
    }
    // A BLOCK is reachable both directly (an arrow with a block body) and
    // through a call whose callee is an inline factory. Handling it here means
    // both paths behave the same instead of one silently returning nothing.
    if (ts.isBlock(node)) {
      const returned = [];
      const findReturns = (child) => {
        if (ts.isReturnStatement(child) && child.expression) {
          returned.push(...resolveObjects(child.expression, depth + 1, seen));
        }
        if (
          !ts.isArrowFunction(child) &&
          !ts.isFunctionExpression(child) &&
          !ts.isFunctionDeclaration(child)
        ) {
          ts.forEachChild(child, findReturns);
        }
      };
      ts.forEachChild(node, findReturns);
      if (returned.length) return returned;
      noteUnresolved(node, "block", "block body with no resolvable return");
      return found;
    }
    if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
      if (node.body) return resolveObjects(node.body, depth + 1, seen);
      noteUnresolved(node, "function", "function without a body");
      return found;
    }
    if (ts.isElementAccessExpression(node) || ts.isPropertyAccessExpression(node)) {
      noteUnresolved(node, "member-access", "member access: the object it reads is outside this file's scope");
      return found;
    }
    noteUnresolved(node, "expression", `unhandled expression kind ${ts.SyntaxKind[node.kind]}`);
    return found;
  };

  const record = (channel, node, form) => {
    const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
    // `ordinal` is the character offset: a STABLE source coordinate, so two
    // owners claiming the same site collide instead of being handed two ids.
    stamps.push({
      channel,
      line: line + 1,
      ordinal: node.getStart(source),
      symbol: enclosingSymbol(node),
      form,
    });
  };

  const visit = (node) => {
    // sink 1: JSX style attribute
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
      const objects = resolveObjects(node.initializer.expression, 0, new Set());
      for (const object of objects) {
        for (const property of object.properties) {
          if (!ts.isPropertyAssignment(property) && !ts.isShorthandPropertyAssignment(property)) continue;
          const channel = customPropertyKey(property.name);
          if (channel) record(channel, property, "style-object-key");
        }
      }
    }
    // sink 2: element.style.setProperty('--x', v)
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === "setProperty" &&
      node.arguments.length > 0
    ) {
      const target = node.expression.expression;
      const isStyleTarget =
        ts.isPropertyAccessExpression(target) && target.name.text === "style";
      const first = unwrap(node.arguments[0]);
      if (isStyleTarget) {
        sinks.push(node);
        if (ts.isStringLiteralLike(first) && first.text.startsWith("--")) {
          record(first.text, node, "setProperty");
        } else if (!ts.isStringLiteralLike(first)) {
          // `rule.style.setProperty(name, value)` -- the channel is computed at
          // run time. It USED to be invisible: not a stamp and not even a
          // counter. It is now an unresolved site, because a producer nobody
          // can name is exactly what STRICT must not be allowed to assume away.
          noteUnresolved(node, "dynamic-setProperty", "setProperty with a non-literal property name");
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);

  return { stamps, styleSinks: sinks.length, unresolved, closedNonObject };
}

/* ================================================= AUTHORED CENSUS DIFF ===
 * The census `cascade-extract.mjs` published by hand on 2026-08-18. This
 * module must reproduce it or publish the difference, figure by figure, with
 * the reason. A silent match would be as unfalsifiable as the prose was.
 * ======================================================================== */
const AUTHORED_TSX_CENSUS = {
  measuredOn: "2026-08-18",
  source: "cascade-extract.mjs PLANES_NOT_SCANNED[tsx-inline-stamp].census",
  scannedFiles: 1740,
  excludedFiles: 1664,
  styleSinks: 3283,
  distinctCustomProperties: 236,
  distinctGovernedChannels: 183,
  distinctInternalSockets: 30,
  distinctForeignProperties: 23,
  stampSites: 513,
};

/* ======================================================== CAUSAL ROOTS ===
 * Authored LIVE derivations, wildcard excluded BY SHAPE and not by flag: a
 * `to` containing `*` is a map-level fold, never a concrete channel, and one
 * of them (`--ds-effect-intensity -> --ds-*`) collapses the whole debt to zero
 * if expanded literally.
 * ======================================================================== */
export function authoredCausalRoots(cascadeRootsDir) {
  const byChannel = new Map();
  const excluded = [];
  if (!existsSync(cascadeRootsDir)) return { byChannel, excluded };
  for (const name of readdirSync(cascadeRootsDir).sort()) {
    if (!name.endsWith(".json")) continue;
    const rel = `manifest/cascade/roots/${name}`;
    const doc = JSON.parse(readFileSync(join(cascadeRootsDir, name), "utf8"));
    for (const derivation of doc.derivations ?? []) {
      if (derivation.state !== "LIVE") continue;
      if (derivation.toIsPattern === true || String(derivation.to ?? "").includes("*")) {
        excluded.push({ rootId: doc.rootId, to: derivation.to, reason: "wildcard-shape" });
        continue;
      }
      if (!byChannel.has(derivation.to)) byChannel.set(derivation.to, []);
      byChannel.get(derivation.to).push({
        rootId: doc.rootId,
        witness: `${rel} (derivations from ${derivation.from} to ${derivation.to}${
          derivation.line ? `, site ${derivation.site}:${derivation.line}` : ""
        })`,
      });
    }
  }
  return { byChannel, excluded };
}

/* ============================================================== BUILD ==== */

/* ==================================================== ENGINE APPLICABILITY ===
 * Applicability is DERIVED from the path (and, for CSS, from the substrate's
 * own path INTERSECT selector scope). It is never inferred from specificity:
 * an inline style winning the cascade says nothing about whether the component
 * that stamps it ships in a given engine. A component under
 * `.../engines/rustic/index.tsx` is Rustic's, full stop.
 *
 * Where applicability cannot be demonstrated the emission does NOT get all
 * three engines: it gets `unknown`, and the site is published in
 * `unknownProvenance`.
 * ========================================================================== */
export const ENGINES = ["modern", "rustic", "classic"];

export function engineScopeOfPath(rel) {
  for (const engine of ENGINES) {
    if (rel.includes(`/engines/${engine}/`) || rel.startsWith(`engines/${engine}/`)) {
      return {
        engineScope: [engine],
        applicabilityEvidence: `path segment /engines/${engine}/: this owner ships only in the ${engine} engine`,
      };
    }
  }
  return {
    engineScope: [...ENGINES],
    applicabilityEvidence:
      "no /engines/<engine>/ segment on the path: the owner is engine-agnostic and renders under whichever engine is active",
  };
}

/* ------------------------------------------- cross-file cohort rows --- */
/**
 * The four cohorts below are CLOSED contractually: every row is named, carries
 * a receipt of where it came from and why, and is marked NOT consumable. None
 * of them may ever be promoted to a tenant-consumable channel, and none of them
 * may be merged into `closedZeroGoverned`, whose members are proven to emit no
 * governed channel at all. Closing a row here means "this debt is identified
 * and bounded", never "this debt is resolved".
 */
const cohortRow = ({ file, site, entry, reason, cause }) => ({
  plane: "tsx-inline-stamp",
  file,
  symbol: site.symbol,
  line: site.line,
  ordinal: site.ordinal,
  template: site.expression,
  reason,
  // Explicit, not inferred from the section name: a reader of a single row must
  // be able to tell that it grants nothing.
  consumable: false,
  tenantSafe: false,
  nonConsumableCause: cause,
  // Every JSX sink this one expression reaches, merged across occurrences,
  // and the relay kind each of those sinks implies. Both are sorted arrays and
  // both may be empty; together they are the ONLY evidence that survives a
  // coordinate carrying more than one occurrence, so neither may be dropped.
  sinkTags: entry.sinkTags,
  relayKinds: entry.relayKinds,
  occurrences: entry.occurrences,
  evidence: entry.receipt,
});

export function publicBoundaryRow(file, site, entry) {
  return cohortRow({
    file,
    site,
    entry,
    reason: `public-boundary-candidate:${site.form}`,
    // The object is supplied by the CALLER across a published entrypoint. The
    // inventory cannot see it and never will from inside this package.
    cause: "object-supplied-by-caller-across-public-entrypoint",
  });
}

export function privateRelayRow(file, site, entry) {
  return cohortRow({
    file,
    site,
    entry,
    reason: `private-relay-unresolved:${site.form}`,
    cause: "private-passthrough-not-followed-by-resolver",
  });
}

export function closedProducerRow(file, site, entry) {
  return cohortRow({
    file,
    site,
    entry,
    reason: `governed-producer-object:${site.form}`,
    // It DOES emit governed channels -- that is why it is a producer -- but no
    // cascade root claims it. Inventing a root or a tenant reach for it is
    // exactly the relabel this programme forbids.
    cause: "governed-producer-with-no-attributed-cascade-root",
  });
}

export function buildProducers({
  root = REPO_ABS,
  cssEdgesPath = CSS_EDGES,
  cascadeRootsDir = CASCADE_ROOTS,
  rootCatalogPath = ROOT_CATALOG,
  artifactsDir = ARTIFACTS_DIR,
} = {}) {
  const unknownProvenance = [];
  // Receipt for the sites the scanner CLOSES by proof (see provablyNonObject).
  // Same identity family as `unknownProvenance`; a SEQUENCE, not a set.
  const closedNonObject = [];
  // Receipt for the sites the CROSS-FILE subsystem proves are closed objects
  // that emit ZERO governed channels. Only this disposition drains: boundary,
  // relay and every residual stay in `unknownProvenance`, non-consumable.
  const closedZeroGoverned = [];
  // The three cross-file dispositions this inventory closes CONTRACTUALLY
  // without ever making them consumable. A boundary row is a public API surface
  // whose caller supplies the object, so it can never be tenant-safe; a relay
  // row is a private passthrough the resolver refused to follow; a producer row
  // emits governed channels but is attributed to NO cascade root. All three are
  // accounted for by name and receipt instead of being left as anonymous debt.
  const publicBoundary = [];
  const privateRelay = [];
  const closedProducer = [];
  // FAIL-CLOSED join. `file|ordinal` is stable but NOT unique: one expression
  // reaching several JSX sinks yields several rows. `dispositionIndex` throws on
  // any material disagreement at a shared coordinate and merges only the
  // per-sink evidence, so nothing is silently overwritten.
  const crossFile = classifyCrossFileRows();
  const dispositionAt = dispositionIndex(crossFile.rows);
  const precedenceMetadata = [];

  const { byChannel: causalByChannel, excluded: causalExcluded } =
    authoredCausalRoots(cascadeRootsDir);

  /* --------------------------------------------------------- claims --- */
  /**
   * Claims are ACCUMULATED before ownership is resolved, and the site ordinal
   * is a STABLE source coordinate (a character offset for AST sites, the line
   * for textual ones) rather than an auto-incrementing counter. With a counter,
   * two owners claiming the same coordinate silently received two different
   * ids and `ownershipConflicts` could never fire from a real build -- the law
   * was only testable through a hand-built helper.
   */
  const claims = new Map();
  const claim = ({
    plane,
    file,
    line,
    symbol,
    ordinal,
    ownerId,
    ownerEvidence,
    channels,
    engineScope,
    applicabilityEvidence,
  }) => {
    const producerSiteId = producerSiteIdOf(plane, file, line, symbol, ordinal);
    if (!claims.has(producerSiteId)) {
      claims.set(producerSiteId, { producerSiteId, plane, file, line, symbol, ordinal, owners: new Map() });
    }
    const site = claims.get(producerSiteId);
    if (!site.owners.has(ownerId)) {
      site.owners.set(ownerId, {
        ownerId,
        ownerEvidence,
        engineScope,
        applicabilityEvidence,
        channels: new Set(),
      });
    }
    for (const channel of channels) site.owners.get(ownerId).channels.add(channel);
    return producerSiteId;
  };

  const unknown = (row) => unknownProvenance.push(row);

  /* ---------------------------------------------------------- plane css --- */
  const edgesDoc = JSON.parse(readFileSync(cssEdgesPath, "utf8"));
  const scopeTable = edgesDoc.scopeTable ?? [];
  const cssDeclarations = new Map();
  for (const edge of edgesDoc.edges) {
    if (edge.edgeClass !== "decl") continue;
    if (!String(edge.to).startsWith("--ds-")) continue;
    const key = `${edge.file}|${edge.line}|${edge.to}`;
    if (!cssDeclarations.has(key)) {
      cssDeclarations.set(key, { file: edge.file, line: edge.line, channel: edge.to, scopeId: edge.scopeId });
    }
  }
  for (const pin of edgesDoc.literalPins) {
    if (!String(pin.channel).startsWith("--ds-")) continue;
    const key = `${pin.file}|${pin.line}|${pin.channel}`;
    if (!cssDeclarations.has(key)) {
      cssDeclarations.set(key, {
        file: pin.file,
        line: pin.line,
        channel: pin.channel,
        scopeId: typeof pin.scopeId === "number" ? pin.scopeId : null,
      });
    }
  }
  for (const declaration of [...cssDeclarations.values()].sort((a, b) =>
    a.file === b.file ? a.line - b.line || (a.channel < b.channel ? -1 : 1) : a.file < b.file ? -1 : 1,
  )) {
    const scope = declaration.scopeId === null ? null : scopeTable[declaration.scopeId];
    if (!scope) {
      // Absent scope is UNKNOWN applicability, never all three engines.
      unknown({
        plane: "css",
        file: declaration.file,
        symbol: declaration.channel,
        template: null,
        reason: "unknown-applicability",
        detail: `declaration at ${declaration.file}:${declaration.line} has no scopeId in the substrate`,
      });
      continue;
    }
    claim({
      plane: "css",
      file: declaration.file,
      line: declaration.line,
      symbol: declaration.channel,
      ordinal: 0,
      ownerId: "css-declaration",
      ownerEvidence: `${declaration.file}:${declaration.line} declares ${declaration.channel}`,
      channels: [declaration.channel],
      engineScope: scope.effectiveEngines,
      applicabilityEvidence: `css-edges.json scopeTable[${declaration.scopeId}] (path ${scope.pathEngines.join("+")} INTERSECT selector ${
        Array.isArray(scope.selectorEngines) ? scope.selectorEngines.join("+") : scope.selectorEngines
      })`,
    });
  }

  /* ------------------------------------------- planes ts-* (enumerated) --- */
  const reach = tenantReach({ root });
  const enumerators = buildEnumerators(root);
  const read = (path) => readFileSync(join(root, path), "utf8");
  const compilerSources = new Map();

  const attributed = new Map();
  for (const enumerator of enumerators) {
    for (const fn of enumerator.functions) attributed.set(`${enumerator.file}::${fn}`, enumerator);
  }

  const COMPILER_APPLICABILITY =
    "compiler emission: the theme document is applied at :root / [data-tenant] scope, above every engine selector, and the compiler has no engine branch -- engine-agnostic by construction, not by specificity";

  for (const path of [CHROME_VARIABLES, BRAND_THEME, APPEARANCE_POSTURE].filter((p) =>
    existsSync(join(root, p)),
  )) {
    const source = read(path);
    compilerSources.set(path, source);
    const plane = planeOfCompilerFile(path);
    for (const emission of templateEmissions(source)) {
      const enumerator = attributed.get(`${path}::${emission.owner}`);
      const line = lineAt(source, emission.index);
      if (enumerator) {
        const body = bodyOf(source, emission.owner);
        const names = expandTemplate(emission.template, enumerator.holes, (local) => {
          const match = new RegExp(`const\\s+${local}\\s*=\\s*\`([^\`]+)\``).exec(body);
          return match?.[1] ?? null;
        }).filter((name) => name.startsWith("--ds-"));
        if (names.length === 0) {
          unknown({
            plane,
            file: path,
            symbol: emission.owner,
            template: emission.template,
            reason: "enumerator-produced-no-names",
          });
          continue;
        }
        claim({
          plane,
          file: path,
          line,
          symbol: emission.owner,
          ordinal: emission.index,
          ownerId: `enumerator:${enumerator.id}`,
          ownerEvidence: enumerator.evidence,
          channels: names,
          engineScope: [...ENGINES],
          applicabilityEvidence: COMPILER_APPLICABILITY,
        });
        continue;
      }
      const adjudicated = adjudicateDeclarationOwner({ root, file: path, emission, source });
      if (!adjudicated) {
        unknown({
          plane,
          file: path,
          symbol: emission.owner,
          template: emission.template,
          reason: "missing-owner",
        });
        continue;
      }
      claim({
        plane,
        file: path,
        line,
        symbol: emission.owner,
        ordinal: emission.index,
        ownerId: `declaration:${adjudicated.declarationOwnerId}`,
        ownerEvidence: adjudicated.evidence,
        channels: adjudicated.channels,
        engineScope: [...ENGINES],
        applicabilityEvidence: COMPILER_APPLICABILITY,
      });
    }
    const literals = [...literalTokens(source)].sort();
    if (literals.length) {
      claim({
        plane,
        file: path,
        line: 1,
        symbol: "<literal-writes>",
        ordinal: 0,
        ownerId: "declaration:literal-token",
        ownerEvidence: `${path}: literal "--ds-*" tokens, the greppable half of the reach set (tenant-reach literalTokens)`,
        channels: literals,
        engineScope: [...ENGINES],
        applicabilityEvidence: COMPILER_APPLICABILITY,
      });
    }
  }

  const overrides = overrideTokens(root);
  const overrideNames = [...overrides.names].sort();
  if (overrideNames.length) {
    claim({
      plane: "ts-compilers",
      file: TENANT_THEME_PATH,
      line: 1,
      symbol: "TENANT_THEME_OVERRIDE_TOKENS",
      ordinal: 0,
      ownerId: "declaration:TENANT_THEME_OVERRIDE_TOKENS",
      ownerEvidence: "tenant-theme/index.ts: the bounded override allowlist, read by tenant-reach overrideTokens()",
      channels: overrideNames,
      engineScope: [...ENGINES],
      applicabilityEvidence: "tenant override token: applied at [data-tenant] scope, engine-agnostic",
    });
  }

  /* ------------------------------- tenant ARTIFACT declarations (STRICT) --- */
  // STRICT counts three producer shapes: a CSS declaration, an ENUMERATED
  // emission, and a declaration in a TENANT ARTIFACT. The third was missing, so
  // a channel a tenant artifact declares looked unproduced. Artifacts are the
  // compiler's own emitted snapshot, so they enter `ts-compilers` -- no fifth
  // plane is invented.
  const artifactFiles = existsSync(artifactsDir)
    ? readdirSync(artifactsDir)
        .sort()
        .map((theme) => ({ theme, abs: join(artifactsDir, theme, "index.css") }))
        .filter((entry) => existsSync(entry.abs))
    : [];
  const artifactSources = new Map();
  for (const { theme, abs } of artifactFiles) {
    const text = readFileSync(abs, "utf8");
    artifactSources.set(theme, text);
    const rel = `packages/core/src/foundation/tokens/css/facade/artifacts/${theme}/index.css`;
    const declared = new Set();
    for (const match of text.matchAll(/(^|[;{\s])(--ds-[A-Za-z0-9-]+)\s*:/g)) declared.add(match[2]);
    if (declared.size === 0) continue;
    claim({
      plane: "ts-compilers",
      file: rel,
      line: 1,
      symbol: `<tenant-artifact:${theme}>`,
      ordinal: 0,
      ownerId: `declaration:tenant-artifact:${theme}`,
      ownerEvidence: `${rel}: compiled tenant snapshot declaring ${declared.size} governed channels at its own :root/[data-tenant] scope`,
      channels: [...declared].sort(),
      engineScope: [...ENGINES],
      applicabilityEvidence:
        "tenant artifact: a compiled snapshot applied at :root / [data-tenant] scope, with no engine branch",
    });
  }

  /* ------------------------------------------- plane tsx-inline-stamp --- */
  const candidates = tsxCandidates(root);
  let scannedFiles = 0;
  let excludedFiles = 0;
  let styleSinks = 0;
  const scannedFileList = [];
  const tsxHashes = [];
  const tsxChannels = new Set();
  const tsxSockets = new Set();
  const tsxForeign = new Set();
  let stampSites = 0;
  let unresolvedSites = 0;
  for (const abs of candidates) {
    const rel = relative(root, abs);
    if (isExcluded(`/${rel}`)) {
      excludedFiles += 1;
      continue;
    }
    scannedFiles += 1;
    scannedFileList.push(rel);
    const text = readFileSync(abs, "utf8");
    tsxHashes.push([rel, sha256(text)]);
    // NO text short-circuit. Skipping files with no literal `--` also skipped
    // their SINKS: `style={imported}` in a file that never spells a custom
    // property is precisely an unresolved producer, and the fast path made it
    // invisible. Parsing every scanned file is the price of not lying.
    const scan = scanTsxSource(rel, text);
    styleSinks += scan.styleSinks;
    const applicability = engineScopeOfPath(`/${rel}`);
    for (const site of scan.unresolved) {
      const entry = dispositionAt.get(`${rel}|${site.ordinal}`);
      const disposition = entry ? entry.decision.disposition : null;
      if (disposition === "CLOSED_ZERO_GOVERNED_EMISSION_OBJECT") {
        closedZeroGoverned.push({
          plane: "tsx-inline-stamp",
          file: rel,
          symbol: site.symbol,
          line: site.line,
          ordinal: site.ordinal,
          template: site.expression,
          reason: `zero-governed-emission-object:${site.form}`,
        });
        continue;
      }
      if (disposition === "PUBLIC_BOUNDARY_CANDIDATE") {
        publicBoundary.push(publicBoundaryRow(rel, site, entry));
        continue;
      }
      if (disposition === "RELAY_PRIVATE_UNRESOLVED") {
        privateRelay.push(privateRelayRow(rel, site, entry));
        continue;
      }
      if (disposition === "CLOSED_PRODUCER") {
        closedProducer.push(closedProducerRow(rel, site, entry));
        continue;
      }
      if (disposition === "CLOSED_NONOBJECT") {
        // The one site whose non-object nature is only visible ACROSS files:
        // `SELECT_DEFAULTS.size` is a member of an imported object, so the local
        // predicate in `provablyNonObject` cannot see the literal it resolves
        // to. It joins the same receipt as the 68 locally-proven rows -- one
        // identity, one array -- and declares its own provenance in two
        // independent ways: the `cross-file:` reason prefix and `resolvedVia`.
        closedNonObject.push({
          plane: "tsx-inline-stamp",
          file: rel,
          symbol: site.symbol,
          line: site.line,
          ordinal: site.ordinal,
          template: site.expression,
          reason: `cross-file:${entry.receipt.nonObjectReason}`,
          resolvedVia: "cross-file",
          evidence: entry.receipt,
        });
        continue;
      }
      unresolvedSites += 1;
      unknown({
        plane: "tsx-inline-stamp",
        file: rel,
        symbol: site.symbol,
        template: site.expression,
        reason: `unresolved-${site.form}`,
        detail: `${rel}:${site.line} ${site.reason}`,
      });
    }
    for (const site of scan.closedNonObject) {
      closedNonObject.push({
        plane: "tsx-inline-stamp",
        file: rel,
        symbol: site.symbol,
        line: site.line,
        ordinal: site.ordinal,
        template: site.expression,
        reason: site.reason,
      });
    }
    if (scan.stamps.length === 0) continue;
    const bySite = new Map();
    for (const stamp of scan.stamps) {
      stampSites += 1;
      if (stamp.channel.startsWith("--ds-")) tsxChannels.add(stamp.channel);
      else if (stamp.channel.startsWith("--_ds-")) tsxSockets.add(stamp.channel);
      else tsxForeign.add(stamp.channel);
      const key = `${stamp.line}|${stamp.symbol}|${stamp.ordinal}`;
      if (!bySite.has(key)) bySite.set(key, { line: stamp.line, symbol: stamp.symbol, ordinal: stamp.ordinal, channels: new Set() });
      bySite.get(key).channels.add(stamp.channel);
    }
    for (const site of [...bySite.values()].sort((a, b) => a.ordinal - b.ordinal)) {
      const governed = [...site.channels].filter((c) => c.startsWith("--ds-")).sort();
      if (governed.length === 0) continue;
      claim({
        plane: "tsx-inline-stamp",
        file: rel,
        line: site.line,
        symbol: site.symbol,
        ordinal: site.ordinal,
        ownerId: `tsx-stamp:${site.symbol}`,
        ownerEvidence: `${rel}:${site.line} stamps the custom property onto the element's inline style attribute`,
        channels: governed,
        engineScope: applicability.engineScope,
        applicabilityEvidence: applicability.applicabilityEvidence,
      });
    }
  }

  /* --------------------------------------------------- residual emitters --- */
  for (const entry of reach.unattributed) {
    const already = [...claims.values()].some(
      (site) => site.file === entry.file && site.symbol === entry.owner,
    );
    if (already) continue;
    unknown({
      plane: planeOfCompilerFile(entry.file),
      file: entry.file,
      symbol: entry.owner,
      template: entry.template,
      reason: entry.reason ?? "missing-owner",
    });
  }

  /* --------------------------------------------- materialise the claims --- */
  const producerSites = [];
  const channelEmissions = [];
  const ownershipConflicts = [];
  for (const site of [...claims.values()].sort((a, b) =>
    a.producerSiteId < b.producerSiteId ? -1 : 1,
  )) {
    const owners = [...site.owners.values()].sort((a, b) => (a.ownerId < b.ownerId ? -1 : 1));
    if (owners.length > 1) {
      ownershipConflicts.push({
        producerSiteId: site.producerSiteId,
        plane: site.plane,
        file: site.file,
        line: site.line,
        symbol: site.symbol,
        owners: owners.map((owner) => owner.ownerId),
      });
    }
    producerSites.push({
      producerSiteId: site.producerSiteId,
      plane: site.plane,
      file: site.file,
      line: site.line,
      symbol: site.symbol,
      ordinal: site.ordinal,
      ownerId: owners[0].ownerId,
      ownerEvidence: owners[0].ownerEvidence,
      ...(owners.length > 1 ? { ownerConflict: owners.map((owner) => owner.ownerId) } : {}),
    });
    for (const owner of owners) {
      for (const channel of [...owner.channels].sort()) {
        channelEmissions.push({
          channelEmissionId: channelEmissionIdOf(site.producerSiteId, channel),
          producerSiteId: site.producerSiteId,
          channel,
          engineScope: owner.engineScope,
          applicabilityEvidence: owner.applicabilityEvidence,
          causalRootIds: (causalByChannel.get(channel) ?? []).map((hit) => ({
            rootId: hit.rootId,
            witness: hit.witness,
          })),
        });
      }
    }
  }

  /* -------------------------------------------- precedence as METADATA --- */
  // Schema: executionContext / order / evidence. The order is the CSS cascade
  // law, which is demonstrable; it is NOT an ownership resolution and never
  // names a winner.
  const CONTEXT_OF_PLANE = {
    css: "stylesheet cascade",
    "ts-compilers": "compileTheme document",
    "ts-chrome-variables": "compileTheme document",
    "tsx-inline-stamp": "render-time inline style attribute",
  };
  const CONTEXT_ORDER = ["stylesheet cascade", "compileTheme document", "render-time inline style attribute"];
  const siteById = new Map(producerSites.map((site) => [site.producerSiteId, site]));
  const emissionsByChannel = new Map();
  for (const emission of channelEmissions) {
    if (!emissionsByChannel.has(emission.channel)) emissionsByChannel.set(emission.channel, []);
    emissionsByChannel.get(emission.channel).push(emission);
  }
  for (const [channel, emissions] of [...emissionsByChannel.entries()].sort()) {
    if (emissions.length < 2) continue;
    const owners = [...new Set(emissions.map((e) => siteById.get(e.producerSiteId).ownerId))].sort();
    if (owners.length < 2) continue;
    const contexts = [
      ...new Set(emissions.map((e) => CONTEXT_OF_PLANE[siteById.get(e.producerSiteId).plane])),
    ].sort((a, b) => CONTEXT_ORDER.indexOf(a) - CONTEXT_ORDER.indexOf(b));
    precedenceMetadata.push({
      channel,
      executionContext: contexts,
      order: contexts,
      evidence:
        "CSS cascade law: a declaration in a stylesheet is overridden by the tenant/theme document applied at :root/[data-tenant], and both are overridden by an inline style attribute. This orders EXECUTION only.",
      owners,
      note: "several owners legitimately emit this channel; ownership is NOT resolved here and no winner is named.",
    });
  }

  const byChannel = {};
  for (const [channel, emissions] of [...emissionsByChannel.entries()].sort()) {
    byChannel[channel] = emissions.map((emission) => emission.channelEmissionId);
  }

  /* ------------------------------------------------------ tsx census --- */
  const tsxCensus = {
    scannedFiles,
    excludedFiles,
    styleSinks,
    stampSites,
    distinctCustomProperties: tsxChannels.size + tsxSockets.size + tsxForeign.size,
    distinctGovernedChannels: tsxChannels.size,
    distinctInternalSockets: tsxSockets.size,
    distinctForeignProperties: tsxForeign.size,
    unresolvedSites,
  };
  const censusDiff = Object.fromEntries(
    Object.keys(AUTHORED_TSX_CENSUS)
      .filter((key) => typeof AUTHORED_TSX_CENSUS[key] === "number")
      .map((key) => [
        key,
        {
          authored: AUTHORED_TSX_CENSUS[key],
          measured: tsxCensus[key] ?? null,
          delta: (tsxCensus[key] ?? 0) - AUTHORED_TSX_CENSUS[key],
        },
      ]),
  );

  const digest = (value) => sha256(JSON.stringify(value));
  const dirDigest = (dir, filter = () => true) =>
    existsSync(dir)
      ? digest(
          readdirSync(dir)
            .sort()
            .filter(filter)
            .map((name) => [name, sha256(readFileSync(join(dir, name)))]),
        )
      : digest([]);

  return {
    generated: true,
    generator: "cascade-producers.mjs",
    schemaVersion: 1,
    planes: PLANES,
    law: {
      ownership:
        "producerSiteId -> exactly one ownerId, where the site ordinal is a STABLE source coordinate. Claims accumulate before ownership resolves, so a second owner on the same coordinate is representable and therefore falsifiable.",
      applicability:
        "channelEmissionId -> engineScope + applicabilityEvidence, DERIVED from path (and, for CSS, path INTERSECT selector). Never from specificity. Undemonstrable applicability is UNKNOWN, never `all`.",
      causality:
        "channelEmissionId -> causalRootIds[], each with witness, matched EXACTLY by channel against an authored LIVE derivation. Never propagated from one channel to a whole enumerator. An empty list with an attributed producer is producedExternalTerminal, not UNKNOWN.",
      failClosed:
        "every expression the scanner cannot resolve is ONE ROW in unknownProvenance. Under STRICT a missing producer ADMITS a fallback branch and can LOWER debt, so under-counting producers can buy a false green: it is not a safe approximation and is never treated as one.",
    },
    inputsDigest: {
      cssEdges: sha256(readFileSync(cssEdgesPath)),
      cascadeRoots: dirDigest(cascadeRootsDir, (name) => name.endsWith(".json")),
      rootCatalog: existsSync(rootCatalogPath) ? sha256(readFileSync(rootCatalogPath)) : null,
      srcTsx: digest(tsxHashes),
      srcCompilers: digest(
        [...compilerSources.entries()].sort().map(([path, text]) => [path, sha256(text)]),
      ),
      artifacts: digest([...artifactSources.entries()].sort().map(([theme, text]) => [theme, sha256(text)])),
    },
    stats: {
      producerSites: producerSites.length,
      channelEmissions: channelEmissions.length,
      distinctChannels: Object.keys(byChannel).length,
      byPlane: PLANES.reduce((acc, plane) => {
        acc[plane] = {
          producerSites: producerSites.filter((s) => s.plane === plane).length,
          channelEmissions: channelEmissions.filter(
            (e) => siteById.get(e.producerSiteId).plane === plane,
          ).length,
        };
        return acc;
      }, {}),
      emissionsByEngineScope: channelEmissions.reduce((acc, emission) => {
        const key = emission.engineScope.join("+") || "(unknown)";
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      }, {}),
      emissionsWithCausalRoot: channelEmissions.filter((e) => e.causalRootIds.length > 0).length,
      ownershipConflicts: ownershipConflicts.length,
      unknownProvenance: unknownProvenance.length,
      closedNonObject: closedNonObject.length,
      closedZeroGoverned: closedZeroGoverned.length,
      publicBoundary: publicBoundary.length,
      privateRelay: privateRelay.length,
      closedProducer: closedProducer.length,
      unknownProvenanceByReason: unknownProvenance.reduce((acc, row) => {
        acc[row.reason] = (acc[row.reason] ?? 0) + 1;
        return acc;
      }, {}),
      precedenceMetadata: precedenceMetadata.length,
      causalRootsExcludedByWildcardShape: causalExcluded.length,
      artifactThemes: artifactFiles.length,
    },
    tsxInlineStamp: {
      membershipCriterion:
        "sink-anchored AST: a channel belongs to this plane only if it is a property of an object that reaches a JSX `style`, or a literal argument of element.style.setProperty(). Resolution walks BACKWARDS from the sink through identifier, conditional, binary, useMemo/useCallback, block returns and inline arrow bodies, bounded to depth 6. EVERY expression it refuses to follow becomes a row in unknownProvenance.",
      authoredCensus: AUTHORED_TSX_CENSUS,
      measuredCensus: tsxCensus,
      censusDiff,
      censusReconciliation: {
        method:
          "identity, not tolerance. This module publishes the full member lists below; the authored census published COUNTS ONLY and no member list, so the two cannot be reconciled member by member from its side. The residual is therefore expressed as unknownProvenance rows with file and symbol, never as a numeric tolerance.",
        authoredPublishesMemberLists: false,
        scannedFiles: scannedFileList.length,
        governedChannels: tsxChannels.size,
        unresolvedSites,
      },
      governedChannels: [...tsxChannels].sort(),
      internalSockets: [...tsxSockets].sort(),
      foreignProperties: [...tsxForeign].sort(),
      scannedFileList,
    },
    causalRootsExcluded: causalExcluded,
    digests: {
      producerSites: digest(producerSites.map((s) => s.producerSiteId).sort()),
      channelEmissions: digest(channelEmissions.map((e) => e.channelEmissionId).sort()),
      byChannel: digest(byChannel),
      unknownProvenance: digest(
        unknownProvenance.map((row) => [row.plane, row.file, row.symbol, row.reason]),
      ),
      closedNonObject: digest(
        closedNonObject.map((row) => [row.plane, row.file, row.symbol, row.reason]),
      ),
      closedZeroGoverned: digest(
        closedZeroGoverned.map((row) => [row.plane, row.file, row.symbol, row.reason]),
      ),
      publicBoundary: digest(
        publicBoundary.map((row) => [row.plane, row.file, row.symbol, row.reason]),
      ),
      privateRelay: digest(
        privateRelay.map((row) => [row.plane, row.file, row.symbol, row.reason]),
      ),
      closedProducer: digest(
        closedProducer.map((row) => [row.plane, row.file, row.symbol, row.reason]),
      ),
      // Receipt-bound digests: they cover the EVIDENCE, not just identity, so
      // removing or editing a receipt reddens `--check` instead of passing.
      publicBoundaryReceipts: digest(
        publicBoundary.map((row) => [row.file, row.ordinal, row.sinkTags, row.relayKinds, row.evidence]),
      ),
      privateRelayReceipts: digest(
        privateRelay.map((row) => [row.file, row.ordinal, row.sinkTags, row.relayKinds, row.evidence]),
      ),
      closedProducerReceipts: digest(
        closedProducer.map((row) => [row.file, row.ordinal, row.sinkTags, row.relayKinds, row.evidence]),
      ),
    },
    producerSites,
    channelEmissions,
    byChannel,
    ownershipConflicts,
    precedenceMetadata,
    unknownProvenance,
    closedNonObject,
    closedZeroGoverned,
    publicBoundary,
    privateRelay,
    closedProducer,
  };
}

export function ownershipConflictsOf(producerSites) {
  const ownerBySite = new Map();
  for (const site of producerSites) {
    if (!ownerBySite.has(site.producerSiteId)) ownerBySite.set(site.producerSiteId, new Set());
    ownerBySite.get(site.producerSiteId).add(site.ownerId);
  }
  const conflicts = [];
  for (const [producerSiteId, owners] of ownerBySite) {
    if (owners.size > 1) conflicts.push({ producerSiteId, owners: [...owners].sort() });
  }
  return conflicts.sort((a, b) => (a.producerSiteId < b.producerSiteId ? -1 : 1));
}

/* ============================================ V3-3: DECLARATION OWNERS ===
 * The three emitters `tenantReach()` cannot enumerate are not dynamic by
 * nature: each has a STATICALLY CLOSED domain. They are adjudicated by
 * `declarationOwnerId` -- the declaration that closes the domain -- and never
 * by inventing an enumerator or a root.
 *
 * THE EVIDENCE IS AST, NOT TEXT. An earlier form used regexes and a comma
 * split: a homonym inside a comment or a string, a shadowed binding, or a
 * refactor that moved an argument could invent or lose members while the
 * counts still looked right. Every domain below is now bound through the
 * TypeScript AST -- the real declaration, the real call sites, the real
 * symbol -- so a homonym in prose cannot reach it.
 * ======================================================================== */

const parseTs = (fileName, text) =>
  ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

/** Every node of a source, depth first. */
function* astNodes(node) {
  yield node;
  for (const child of node.getChildren()) yield* astNodes(child);
}

/** Is `name` shadowed by a local binding that is not the function we mean? */
function functionDeclarationOf(source, name) {
  const declarations = [];
  for (const node of astNodes(source)) {
    if (ts.isFunctionDeclaration(node) && node.name?.text === name) declarations.push(node);
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === name &&
      node.initializer &&
      (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer))
    ) {
      declarations.push(node);
    }
  }
  return declarations;
}

export function adjudicateDeclarationOwner({ root, file, emission, source }) {
  const read = (path) => readFileSync(join(root, path), "utf8");

  if (emission.owner === "setLegacyButtonHoverBgAlias" || /button-\$\{prefix\}/.test(emission.template)) {
    const ast = parseTs(file, source);
    const declarations = functionDeclarationOf(ast, "setLegacyButtonHoverBgAlias");
    if (declarations.length !== 1) return null; // shadowed or absent: not adjudicable
    const prefixes = [];
    for (const node of astNodes(ast)) {
      if (!ts.isCallExpression(node)) continue;
      const callee = node.expression;
      if (!ts.isIdentifier(callee) || callee.text !== "setLegacyButtonHoverBgAlias") continue;
      const second = node.arguments[1];
      if (!second) return null;
      if (!ts.isStringLiteralLike(second)) return null; // a dynamic argument does not close a domain
      prefixes.push(second.text);
    }
    if (prefixes.length === 0) return null;
    const unique = [...new Set(prefixes)].sort();
    return {
      declarationOwnerId: "setLegacyButtonHoverBgAlias",
      evidence: `${file}: AST -- one function declaration and ${prefixes.length} call sites, every second argument a string literal, closing the domain at prefixes [${unique.join(", ")}]`,
      channels: unique.map((prefix) => emission.template.replace("${prefix}", prefix)).sort(),
    };
  }

  if (/chart-series-\$\{index \+ 1\}/.test(emission.template)) {
    const rel = "packages/core/src/foundation/kernel/color/oklch/chart-series/index.ts";
    let text;
    try {
      text = read(rel);
    } catch {
      return null;
    }
    const ast = parseTs(rel, text);
    const arrays = [];
    for (const node of astNodes(ast)) {
      if (
        ts.isVariableDeclaration(node) &&
        ts.isIdentifier(node.name) &&
        node.name.text === "CHART_SERIES_HUE_OFFSETS"
      ) {
        let initializer = node.initializer;
        while (initializer && (ts.isAsExpression(initializer) || ts.isParenthesizedExpression(initializer))) {
          initializer = initializer.expression;
        }
        if (initializer && ts.isArrayLiteralExpression(initializer)) arrays.push(initializer);
        else return null; // present but not a literal array: the domain is not closed
      }
    }
    if (arrays.length !== 1) return null;
    const count = arrays[0].elements.length;
    if (count === 0) return null;
    return {
      declarationOwnerId: "CHART_SERIES_HUE_OFFSETS",
      evidence: `${rel}: AST -- a single const whose initializer is an array literal of ${count} elements; deriveChartSeriesPalette maps one colour per offset`,
      channels: Array.from({ length: count }, (_, index) =>
        emission.template.replace("${index + 1}", String(index + 1)),
      ),
    };
  }

  if (/chart-category-\$\{index \+ 1\}/.test(emission.template)) {
    const ast = parseTs(file, source);
    let bound = null;
    for (const node of astNodes(ast)) {
      // the guard must GOVERN the emission: `if (index < N && …) vars[`--ds-chart-category-…`] = …`
      if (!ts.isIfStatement(node)) continue;
      if (!node.thenStatement.getText(ast).includes("--ds-chart-category-")) continue;
      const conditions = [node.expression];
      while (conditions.length) {
        const condition = conditions.pop();
        if (ts.isBinaryExpression(condition)) {
          if (condition.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) {
            conditions.push(condition.left, condition.right);
            continue;
          }
          if (
            condition.operatorToken.kind === ts.SyntaxKind.LessThanToken &&
            ts.isIdentifier(condition.left) &&
            condition.left.text === "index" &&
            ts.isNumericLiteral(condition.right)
          ) {
            bound = Number(condition.right.text);
          }
        }
      }
    }
    if (bound === null || !Number.isInteger(bound) || bound <= 0) return null;
    return {
      declarationOwnerId: "chart-category-index-guard",
      evidence: `${file}: AST -- an if-statement whose then-branch performs the emission and whose condition bounds \`index < ${bound}\`, closing the domain at ${bound} channels`,
      channels: Array.from({ length: bound }, (_, index) =>
        emission.template.replace("${index + 1}", String(index + 1)),
      ),
    };
  }

  return null;
}

/* --------------------------------------------------------- serialise --- */
const ROW_ARRAYS = new Set([
  "scannedFileList",
  "producerSites",
  "channelEmissions",
  "ownershipConflicts",
  "precedenceMetadata",
  "unknownProvenance",
  "closedNonObject",
  "closedZeroGoverned",
  "publicBoundary",
  "privateRelay",
  "closedProducer",
  "causalRootsExcluded",
]);

export function serialize(output) {
  const keys = Object.keys(output);
  const lines = ["{"];
  keys.forEach((key, index) => {
    const comma = index === keys.length - 1 ? "" : ",";
    if (ROW_ARRAYS.has(key)) {
      const rows = output[key];
      if (rows.length === 0) {
        lines.push(`  ${JSON.stringify(key)}: []${comma}`);
        return;
      }
      lines.push(`  ${JSON.stringify(key)}: [`);
      rows.forEach((row, rowIndex) => {
        lines.push(`    ${JSON.stringify(row)}${rowIndex === rows.length - 1 ? "" : ","}`);
      });
      lines.push(`  ]${comma}`);
      return;
    }
    const body = JSON.stringify(output[key], null, 2)
      .split("\n")
      .map((line, lineIndex) => (lineIndex === 0 ? line : `  ${line}`))
      .join("\n");
    lines.push(`  ${JSON.stringify(key)}: ${body}${comma}`);
  });
  lines.push("}");
  return lines.join("\n") + "\n";
}

export const OUT_PATH = OUT;

function usage(stream) {
  stream.write(
    "usage: node cascade-producers.mjs [--check|--write]\n" +
      "  --check  (default) recompute and byte-compare against the committed inventory; never writes\n" +
      "  --write  regenerate the inventory\n",
  );
}

function main(argv) {
  const mode = argv.length === 0 ? "--check" : argv[0];
  if (argv.length > 1 || (mode !== "--check" && mode !== "--write")) {
    usage(process.stderr);
    process.exit(2);
  }
  const output = buildProducers();
  const text = serialize(output);
  if (mode === "--check") {
    let onDisk = null;
    try {
      onDisk = readFileSync(OUT, "utf8");
    } catch {
      console.error(`cascade-producers --check FAILED: ${OUT} does not exist`);
      process.exit(1);
    }
    if (onDisk !== text) {
      console.error(
        "cascade-producers --check FAILED: the committed inventory is not what the tree produces.\n" +
          "  run: node cascade-producers.mjs --write",
      );
      process.exit(1);
    }
    console.log(`cascade-producers --check OK -- ${OUT} matches the tree`);
    return;
  }
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, text);
  console.log(`producer sites:       ${output.stats.producerSites}`);
  console.log(`channel emissions:    ${output.stats.channelEmissions}`);
  console.log(`distinct channels:    ${output.stats.distinctChannels}`);
  console.log(`by plane:             ${JSON.stringify(output.stats.byPlane)}`);
  console.log(`with causal root:     ${output.stats.emissionsWithCausalRoot}`);
  console.log(`ownership conflicts:  ${output.stats.ownershipConflicts}`);
  console.log(`unknownProvenance:    ${output.stats.unknownProvenance}`);
  console.log(
    `closed non-consumable: nonObject=${output.stats.closedNonObject} zeroGoverned=${output.stats.closedZeroGoverned} ` +
      `boundary=${output.stats.publicBoundary} relay=${output.stats.privateRelay} producer=${output.stats.closedProducer}`,
  );
  console.log(`tsx census diff:      ${JSON.stringify(output.tsxInlineStamp.censusDiff)}`);
  console.log(`wrote ${OUT}`);
}

const isMain =
  process.argv[1] &&
  realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (isMain) main(process.argv.slice(2));
