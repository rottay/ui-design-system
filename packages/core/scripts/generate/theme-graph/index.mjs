#!/usr/bin/env node
/**
 * theme-graph -- the DERIVED cascade graph (WO-EVI-01, closing F-04 / F-53).
 *
 * WHAT IT REPLACES. `governance/manifest` published 5,355 control x family cells,
 * every one `UNKNOWN`, cross-validated against a second hand-written list from the
 * same manifest and never against the measured graph beside it. It prescribed 4,035
 * `--_ds-*` channels of which 32 existed: 99.2% fiction, used as an acceptance
 * authority by a programme that accepted 0 of 255 families.
 *
 * THE RULE THAT MAKES THIS DIFFERENT. Nothing here is authored. Every node and every
 * edge is read from a measurement, and a fact that was not measured produces NO row
 * rather than a cell saying so. `assertNoUnknown` refuses a placeholder structurally,
 * so the old habit cannot return through a new field.
 *
 * THE GRAPH NEVER DECIDES. It is not read at runtime and it is not an acceptance
 * authority. Gates may cite it as derived, verifiable evidence -- `--check` re-derives
 * and compares byte for byte, and a planted change in a deriver or a skin turns it
 * red -- and that is the whole of its standing.
 *
 * Usage:
 *   node scripts/generate/theme-graph/index.mjs --write    emit the four files + digest
 *   node scripts/generate/theme-graph/index.mjs --check    exit 1 on any drift
 *   node scripts/generate/theme-graph/index.mjs --json     the counts, no write
 *   node scripts/generate/theme-graph/index.mjs --drill=<case>   plant a mutation; must exit 1
 *
 * A writer (--write, --views) and a checker (--check, --check-views) are refused
 * together: the check would compare against the bytes the write just produced.
 */
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { assertDistFresh } from "../../package/artifacts/freshness/index.mjs";
import { assertNoUnknown, EDGE_KINDS, stableStringify } from "./schema.mjs";
import { VIEWS } from "./views.mjs";
import {
  cascadeDrift, channelNodes, CSS_ROOT, CSS_ROOT_REL, decisionNodes, deriverNodes, dryRun, familyNodes,
  familyOfFile, measureCascade, readCascade, sha256, VERTICALS,
} from "./derive.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "../../..");
export const OUT_DIR = join(ROOT, "artifacts/generated/theme-graph");
export const OUT_FILES = Object.freeze(["nodes", "edges", "by-control", "by-family", "digest"]);
export const VIEWS_DIR = join(ROOT, "docs/generated/theme-graph");

/**
 * The two Markdown views: a PURE function of the two JSON views.
 *
 * They need no build, because they add no measurement -- every number in them is
 * already in `by-control.json` / `by-family.json`. What keeps them honest is not
 * a second freshness check of their own but `--check`, which re-derives the JSON
 * from the compiler AND re-renders the views from that derivation, so a drift in
 * either half is one red. Rendering here from the files on disk is therefore the
 * same single chain one step later, not a second door: if the JSON is stale,
 * `--check` says so about the JSON, which is where the staleness is.
 */
export function renderViews(files) {
  const controls = JSON.parse(files["by-control"]);
  const families = JSON.parse(files["by-family"]);
  return {
    "controls.md": VIEWS["controls.md"](controls),
    "families.md": VIEWS["families.md"](families),
  };
}

/**
 * Compare the rendered views against what is on disk.
 *
 * ONE comparison, called by both checks. `--check` hands it the views it just
 * re-rendered from a fresh derivation; `--check-views` hands it the views
 * rendered from the committed JSON. Two copies of this loop would be two
 * answers to one question, which is the defect this whole WO replaces.
 */
export function compareViews(views, dir = VIEWS_DIR) {
  const failures = [];
  for (const [name, text] of Object.entries(views)) {
    const path = join(dir, name);
    if (!existsSync(path)) { failures.push(`views/${name} is missing -- run --views`); continue; }
    if (readFileSync(path, "utf8") !== text) {
      failures.push(`views/${name} differs from the derivation -- a view is generated, never edited; run --views`);
    }
  }
  return failures;
}

/**
 * Read-only: `--check` compares the derived files against the artefact on disk
 * and reports; it never repairs what it compares.
 */
export function compareGraph(files, dir = OUT_DIR) {
  const failures = [];
  for (const [name, text] of Object.entries(files)) {
    const path = join(dir, `${name}.json`);
    if (!existsSync(path)) { failures.push(`${name}.json is missing -- run --write`); continue; }
    if (readFileSync(path, "utf8") !== text) failures.push(`${name}.json differs from the derivation -- regenerate with --write`);
  }
  return failures;
}

/**
 * Everything `--check` compares, and nothing it writes: the committed census against
 * the CSS source, the graph and views against the derivation, and the size pin.
 */
export function checkFailures({ files, views, committed, measured, outDir = OUT_DIR, viewsDir = VIEWS_DIR }) {
  const failures = cascadeDrift(committed, measured);
  failures.push(...compareGraph(files, outDir), ...compareViews(views, viewsDir));
  const total = Object.values(files).reduce((n, text) => n + Buffer.byteLength(text), 0);
  if (total > SIZE_BUDGET_BYTES) {
    failures.push(
      `the graph is ${(total / 1024 / 1024).toFixed(2)} MB, over the pinned ${(SIZE_BUDGET_BYTES / 1024 / 1024).toFixed(2)} MB`,
    );
  }
  return failures;
}

export const DRILLS = Object.freeze(["deriver", "skin"]);

/** The JSON views as committed, for a render that does not derive. */
function readJsonViews() {
  const files = {};
  for (const name of ["by-control", "by-family"]) {
    const path = join(OUT_DIR, `${name}.json`);
    if (!existsSync(path)) throw new Error(`${name}.json is missing -- derive the graph first with --write`);
    files[name] = readFileSync(path, "utf8");
  }
  return files;
}

/**
 * The size pin, measured rather than estimated.
 *
 * `audit/40-architecture/manifest` §2 rule 4 estimated "< 5 MB" for this graph,
 * and said so before anyone had derived one: the estimate was a contrast with
 * the 103 MB of manifest and receipts it replaces, not a measurement. The real
 * graph is 8.97 MB, and every byte of it is a measured fact -- 16,960 read sites
 * with their selector, property and line are 4.23 MB on their own, and 39,866
 * edge endpoints are most of the rest. Two rounds of honest deduplication took
 * it from 16.74 MB: short ids with an asserted-unique truncation, an interned
 * file table, and dropping the census id the short one already prefixes.
 *
 * It is pinned, not loosened: this is an exact ceiling, so growth reddens and is
 * re-anchored with a reason like every other ratchet here. What it is not is a
 * promise the estimate made on the tree's behalf.
 */
export const SIZE_BUDGET_BYTES = 9 * 1024 * 1024;

/** A key no id can collide with, used only to sort and de-duplicate pairs. */
const SEP = "\u241F";

/**
 * The built door has to be the tree's own build, or the dry-run measures yesterday.
 * Proven by the build stamp's content hash of the build inputs and dist bytes, not by mtime.
 */
export function assertDistIsFresh(root = ROOT) {
  const dist = join(root, "dist");
  if (!existsSync(dist)) throw new Error("theme-graph: dist/ is missing -- run the build; the dry-run compiles the built door");
  const proof = assertDistFresh({ packageRoot: root, stampPath: join(dist, "build-stamp.json") });
  if (!proof.ok) {
    throw new Error(`theme-graph: dist/ is not proven fresh by its build stamp -- ${proof.failures.join("; ")}`);
  }
}

/** The modern skin a real-source drill mutates: the reference paint implementation. */
export const MUTANT_SKIN = "src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css";

/**
 * Plant a source-level skin mutant: copy the CSS tree, delete the first read site
 * the extractor measures in MUTANT_SKIN (keeping its line breaks, so no other site
 * moves), and hand back the copy to be re-measured.
 */
export function plantSkinMutant(root = ROOT) {
  const cssRoot = join(root, CSS_ROOT);
  const target = `packages/core/${MUTANT_SKIN}`;
  const site = measureCascade(root, { cssRoot }).document.readSites.find((row) => row.file === target);
  if (site === undefined) throw new Error(`theme-graph: ${MUTANT_SKIN} has no measured read site to mutate`);

  const copy = mkdtempSync(join(tmpdir(), "theme-graph-skin-"));
  const cleanup = () => rmSync(copy, { recursive: true, force: true });
  try {
    cpSync(cssRoot, copy, {
      recursive: true,
      filter: (path) => !relative(cssRoot, path).split(sep).join("/").startsWith("facade/artifacts"),
    });
    const file = join(copy, relative(CSS_ROOT_REL, site.file));
    const lines = readFileSync(file, "utf8").split("\n");
    const row = lines[site.line - 1];
    const start = site.column - 1;
    if (!row.slice(start).startsWith(`${site.property}:`)) {
      throw new Error(`theme-graph: ${site.file}:${site.line}:${site.column} is not the ${site.property} declaration the census names`);
    }
    const text = lines.join("\n");
    const offset = lines.slice(0, site.line - 1).reduce((n, line) => n + line.length + 1, 0) + start;
    const end = text.indexOf(";", offset);
    if (end === -1) throw new Error(`theme-graph: the ${site.property} declaration at ${site.file}:${site.line} never terminates`);
    const removed = text.slice(offset, end + 1).replace(/[^\n]/g, "");
    writeFileSync(file, `${text.slice(0, offset)}${removed}${text.slice(end + 1)}`);
    return { cssRoot: copy, site, cleanup };
  } catch (error) {
    cleanup();
    throw error;
  }
}

async function loadDoor(root) {
  const at = async (rel) => import(pathToFileURL(join(root, rel)).href);
  const [server, pipeline, derivation, catalog] = await Promise.all([
    at("dist/server.js"),
    at("dist/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/pipeline/index.js"),
    at("dist/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/index.js"),
    at("dist/contracts/theme/runtime/catalog/index.js"),
  ]);
  return { server, pipeline, derivation, catalog };
}

/**
 * Does a deriver's `consumes` pattern cover one of a decision's FlatTheme keypaths?
 *
 * Three shapes, all read from the two declarations and none invented here:
 *   - `surfaces.*` is a prefix wildcard, the form the contract's own
 *     `channelMatches` uses;
 *   - an exact keypath matches itself;
 *   - a deriver may name a BRANCH (`surfaces.materials`) that contains the
 *     decision's leaf, or a LEAF under a branch the decision names. Both are
 *     dotted-prefix containment, and both are real: the branch is what the
 *     deriver reads and the leaf is what the decision writes.
 */
function consumesCovers(pattern, keypath) {
  if (pattern.endsWith("*")) return keypath.startsWith(pattern.slice(0, -1));
  if (pattern === keypath) return true;
  return keypath.startsWith(`${pattern}.`) || pattern.startsWith(`${keypath}.`);
}

export async function buildGraph({ root = ROOT, drill, cascade = readCascade(root) } = {}) {
  const door = await loadDoor(root);

  const decisions = decisionNodes(door.catalog);
  const derivers = deriverNodes(door.derivation, root);
  const run = dryRun(door);

  /* A CHANNEL WITH NO PRODUCER IS THE POINT, not an omission. F-04's first
     question is "which channels has nobody produced"; a graph built only from the
     dry-run cannot answer it, because an unproduced channel would simply be
     absent and absence would read as "not a channel". So every name the measured
     census references joins the node set, and `producedBy: []` is the answer --
     a measured empty set, not a placeholder standing in for one. */
  const observed = new Set();
  for (const edge of cascade.document.edges) { observed.add(edge.from); observed.add(edge.to); }
  for (const site of cascade.document.readSites) for (const ref of site.refs) observed.add(ref.channel);
  for (const name of observed) if (!run.producedBy.has(name)) run.producedBy.set(name, new Map());

  const channels = channelNodes(run.producedBy);
  const families = familyNodes(root);

  // DRILL: a deriver stops producing one channel. The graph must move, which is
  // what proves it is derived rather than transcribed.
  if (drill === "deriver") channels.splice(0, 1);
  const readSites = cascade.document.readSites;

  const channelNames = new Set(channels.map((c) => c.name));
  const familyIds = new Set(families.map((f) => f.id));

  /* SHORT IDS, VERIFIED. The census identifies a read site by a 64-character
     sha256, and that id is an endpoint on 39,866 edges here: carried whole it
     costs 4.2 MB of the artifact to say the same thing 40,000 times. The graph
     carries the first 12 characters as the edge endpoint and keeps the full
     `siteId` on the node, so every row still traces back to the census row it
     came from. The truncation is ASSERTED unique rather than assumed: a
     collision throws instead of silently merging two read sites into one. The
     full census id is NOT carried beside it: the short id is its prefix and the
     census travels in the digest as a named input, so the whole value is
     recoverable by lookup. Carrying both cost 1.21 MB to say one thing twice,
     which is the habit this generator exists to end.

     FILE PATHS ARE INTERNED for the same reason -- 403 distinct paths repeated
     16,960 times. `files[]` is emitted once and the node carries its index. */
  const fileTable = [...new Set(readSites.map((site) => site.file))].sort();
  const fileIndex = new Map(fileTable.map((file, index) => [file, index]));
  const shortOf = new Map();
  for (const site of readSites) {
    const short = site.readSiteId.slice(0, 12);
    const held = shortOf.get(short);
    if (held !== undefined && held !== site.readSiteId) {
      throw new Error(`theme-graph: short id ${short} collides between two read sites -- widen the truncation`);
    }
    shortOf.set(short, site.readSiteId);
  }
  const consumers = readSites.map((site) => ({
    kind: "consumer",
    id: site.readSiteId.slice(0, 12),
    fileRef: fileIndex.get(site.file),
    line: site.line,
    property: site.property,
    selector: site.selector.replace(/[\s]+/g, " ").trim(),
  })).sort((a, b) => a.id.localeCompare(b.id));

  const edges = [];
  const consumesSeen = new Set();
  for (const deriver of derivers) {
    for (const pattern of deriver.consumes) {
      for (const decision of decisions) {
        for (const keypath of decision.keypaths) {
          if (!consumesCovers(pattern, keypath)) continue;
          const key = `${decision.id}${SEP}${deriver.id}${SEP}${pattern}`;
          if (consumesSeen.has(key)) continue;
          consumesSeen.add(key);
          edges.push({ kind: "consumes", from: decision.id, to: deriver.id, via: pattern, keypath });
        }
      }
    }
  }
  for (const channel of channels) {
    for (const family of channel.producedBy) {
      edges.push({ kind: "produces", from: family, to: channel.name });
    }
  }
  for (const edge of cascade.document.edges) {
    if (!channelNames.has(edge.from) && !channelNames.has(edge.to)) continue;
    // `edgeClass` is stated for every measured edge; `kind` only for some, so it
    // is carried when the census has it and OMITTED when it does not. A `relation:
    // null` would be the manifest's habit in a new field.
    edges.push({
      kind: "aliases",
      from: edge.from,
      to: edge.to,
      edgeClass: edge.edgeClass,
      depth: edge.depth,
      ...(typeof edge.kind === "string" ? { relation: edge.kind } : {}),
    });
  }
  const consumerIds = new Set(consumers.map((c) => c.id));
  for (const site of readSites) {
    if (!consumerIds.has(site.readSiteId.slice(0, 12))) continue;
    for (const ref of site.refs) {
      edges.push({ kind: "reads", from: ref.channel, to: site.readSiteId.slice(0, 12), role: ref.role, depth: ref.depth });
    }
  }
  const paints = new Set();
  for (const consumer of consumers) {
    const family = familyOfFile(fileTable[consumer.fileRef]);
    if (family === undefined || !familyIds.has(family)) continue;
    paints.add(`${consumer.id}${SEP}${family}`);
  }
  for (const pair of [...paints].sort()) {
    const [from, to] = pair.split(SEP);
    edges.push({ kind: "paints", from, to });
  }
  edges.sort((a, b) => `${a.kind}${SEP}${a.from}${SEP}${a.to}`.localeCompare(`${b.kind}${SEP}${b.from}${SEP}${b.to}`));

  const nodes = [...decisions, ...derivers, ...channels, ...consumers, ...families];
  assertNoUnknown(nodes, "nodes");
  assertNoUnknown(edges, "edges");

  return { nodes, edges, decisions, derivers, channels, consumers, families, fileTable, run, cascade };
}

/** By control: what each decision reaches, counted through the graph it just built. */
export function byControl(graph) {
  const deriversOf = new Map();
  for (const edge of graph.edges.filter((e) => e.kind === "consumes")) {
    if (!deriversOf.has(edge.from)) deriversOf.set(edge.from, new Set());
    deriversOf.get(edge.from).add(edge.to);
  }
  const channelsOf = new Map();
  for (const edge of graph.edges.filter((e) => e.kind === "produces")) {
    if (!channelsOf.has(edge.from)) channelsOf.set(edge.from, new Set());
    channelsOf.get(edge.from).add(edge.to);
  }
  const consumersOf = new Map();
  for (const edge of graph.edges.filter((e) => e.kind === "reads")) {
    if (!consumersOf.has(edge.from)) consumersOf.set(edge.from, new Set());
    consumersOf.get(edge.from).add(edge.to);
  }
  const familyOf = new Map();
  for (const edge of graph.edges.filter((e) => e.kind === "paints")) familyOf.set(edge.from, edge.to);

  /* REACH FOLLOWS THE ALIAS CHAIN, because most skins do not read a derived
     channel directly. `--ds-card-radius: var(--ds-radius-md)` is one measured
     alias edge, and the card skin reads the LEFT name; a reach computed only
     over produced channels reported eleven decisions as moving nothing at all,
     including `shape.radius-scale`. The schema carries channel -> channel for
     exactly this, so the closure walks it. Cycles are bounded by the visited
     set, never by a depth guess. */
  const aliasOut = new Map();
  for (const edge of graph.edges.filter((e) => e.kind === "aliases")) {
    if (!aliasOut.has(edge.from)) aliasOut.set(edge.from, new Set());
    aliasOut.get(edge.from).add(edge.to);
  }
  const closure = (seeds) => {
    const seen = new Set(seeds);
    const stack = [...seeds];
    while (stack.length > 0) {
      for (const next of aliasOut.get(stack.pop()) ?? []) {
        if (seen.has(next)) continue;
        seen.add(next);
        stack.push(next);
      }
    }
    return seen;
  };

  return graph.decisions.map((decision) => {
    const reachedDerivers = [...(deriversOf.get(decision.id) ?? [])].sort();
    const produced = new Set();
    for (const deriver of reachedDerivers) for (const channel of channelsOf.get(deriver) ?? []) produced.add(channel);
    const reachedChannels = closure(produced);
    const reachedFamilies = new Set();
    for (const channel of reachedChannels) {
      for (const consumer of consumersOf.get(channel) ?? []) {
        const family = familyOf.get(consumer);
        if (family !== undefined) reachedFamilies.add(family);
      }
    }
    return {
      decision: decision.id,
      tier: decision.tier,
      derivers: reachedDerivers,
      channels: produced.size,
      channelsThroughAliases: reachedChannels.size,
      families: [...reachedFamilies].sort(),
    };
  });
}

/** By family: which decisions reach a skin family, and which none reaches. */
export function byFamily(graph, controls) {
  const reachedBy = new Map();
  for (const row of controls) for (const family of row.families) {
    if (!reachedBy.has(family)) reachedBy.set(family, new Set());
    reachedBy.get(family).add(row.decision);
  }
  return graph.families.map((family) => ({
    family: family.id,
    ...(family.tier === undefined ? {} : { tier: family.tier }),
    decisions: [...(reachedBy.get(family.id) ?? [])].sort(),
  }));
}

export function render(graph) {
  const controls = byControl(graph);
  const families = byFamily(graph, controls);
  const counts = {
    decisions: graph.decisions.length,
    derivers: graph.derivers.length,
    channels: graph.channels.length,
    consumers: graph.consumers.length,
    families: graph.families.length,
    edges: Object.fromEntries(Object.keys(EDGE_KINDS).map((kind) => [kind, graph.edges.filter((e) => e.kind === kind).length])),
  };
  const files = {
    nodes: stableStringify({ generated: true, generator: "scripts/generate/theme-graph", schemaVersion: 1, counts, files: graph.fileTable, nodes: graph.nodes }),
    edges: stableStringify({ generated: true, generator: "scripts/generate/theme-graph", schemaVersion: 1, kinds: EDGE_KINDS, edges: graph.edges }),
    "by-control": stableStringify({ generated: true, schemaVersion: 1, controls }, { pretty: true }),
    "by-family": stableStringify({ generated: true, schemaVersion: 1, families }, { pretty: true }),
  };
  const digest = stableStringify({
    generated: true,
    schemaVersion: 1,
    verticals: VERTICALS,
    blocks: graph.run.blocks,
    counts,
    inputs: { cascadeEdges: graph.cascade.digest },
    files: Object.fromEntries(Object.entries(files).map(([name, text]) => [name, sha256(text)])),
  });
  return { files: { ...files, digest }, counts, controls, families };
}

function main() {
  const args = process.argv.slice(2);
  const drillArg = args.find((a) => a.startsWith("--drill="));
  const drill = drillArg ? drillArg.slice("--drill=".length) : undefined;

  /* A GREEN NO-OP IS THE WORST OUTCOME HERE, so an invocation this command does
     not understand is refused instead of falling through every branch. The
     package script shipped as `ds:derive ... run`, and `run` is not a flag: it
     exited 0 having written nothing and checked nothing, which is precisely the
     shape of false green this WO was written against. */
  const KNOWN = new Set(["--write", "--views", "--check-views", "--check", "--json"]);
  const unknown = args.filter((arg) => !KNOWN.has(arg) && !arg.startsWith("--drill="));
  if (unknown.length > 0) {
    throw new Error(`unknown argument(s) ${unknown.join(", ")} -- expected some of ${[...KNOWN].join(", ")}`);
  }
  if (!args.some((arg) => KNOWN.has(arg))) {
    throw new Error(`nothing to do -- name one of ${[...KNOWN].join(", ")}; a silent exit 0 would say the graph was derived when it was not`);
  }

  /* A check that runs after a write compares the tree against bytes it just
     wrote, so it can only ever pass. The combination is refused before any
     build assertion, derivation or write. */
  const writers = args.filter((arg) => arg === "--write" || arg === "--views");
  const checkers = args.filter((arg) => arg === "--check" || arg === "--check-views");
  if (writers.length > 0 && checkers.length > 0) {
    throw new Error(
      `incompatible arguments ${[...writers, ...checkers].join(" + ")} -- a check must never run after a write; `
      + "run the write and the check as separate commands (ds:derive, then ds:derive:check)",
    );
  }
  if (drill !== undefined && !DRILLS.includes(drill)) {
    throw new Error(`unknown drill ${drill} -- expected one of ${DRILLS.join(", ")}`);
  }
  if (drill !== undefined && writers.length > 0) {
    throw new Error(`--drill=${drill} + ${writers.join(" + ")} -- a planted mutant is never written`);
  }

  /* The dry-run compiles the BUILT door, so a stale build would publish a graph
     of yesterday's compiler under today's digest -- the exact failure mode that
     let the manifest describe a cascade nobody had. Asserted here, at the
     command, so the library stays a pure function of the tree it is handed and
     the drill can build a graph without owning the build. */
  /* `--views` alone renders the committed JSON and derives nothing, so it does
     not need the build and must not demand it: the coordinator owns the
     serialized build, and a view regenerated between two of their builds is
     still exactly the JSON it came from. Every verb that DERIVES asserts the
     build first. */
  const derives = args.some((arg) => arg === "--write" || arg === "--check" || arg === "--json");

  /* `--check-views` is the pure half: JSON -> view, compared. It answers "has
     anybody edited a view by hand", which needs no compiler, and it deliberately
     does NOT answer "is the JSON still what the compiler says" -- that is
     `--check`'s question and it keeps its build assertion. Naming the narrower
     guarantee is the point: a reader of a green `--check-views` learns that the
     views match their source, and nothing more. */
  if (!derives && args.includes("--check-views")) {
    const failures = compareViews(renderViews(readJsonViews()));
    if (failures.length > 0) {
      for (const failure of failures) console.error(`theme-graph FAIL -- ${failure}`);
      process.exit(1);
    }
    console.log(
      "theme-graph --check-views OK -- both views match a fresh render of the committed by-control/by-family. "
      + "This does NOT check the JSON against the compiler; --check does, and asserts the build.",
    );
    return Promise.resolve();
  }

  if (!derives) {
    const views = renderViews(readJsonViews());
    mkdirSync(VIEWS_DIR, { recursive: true });
    for (const [name, text] of Object.entries(views)) writeFileSync(join(VIEWS_DIR, name), text);
    const bytes = Object.values(views).reduce((n, text) => n + Buffer.byteLength(text), 0);
    console.log(`theme-graph: wrote ${Object.keys(views).length} view(s) from the committed JSON, ${(bytes / 1024).toFixed(1)} KB`);
    return Promise.resolve();
  }

  assertDistIsFresh();
  const committed = readCascade(ROOT);
  const mutant = drill === "skin" ? plantSkinMutant() : undefined;
  let measured;
  try {
    measured = measureCascade(ROOT, mutant === undefined ? {} : { cssRoot: mutant.cssRoot });
  } finally {
    mutant?.cleanup();
  }
  const drift = cascadeDrift(committed, measured);
  if (args.includes("--write") && drift.length > 0) {
    throw new Error(`${drift[0]}; refusing to write a graph over a census that is not this tree's`);
  }

  return buildGraph({ drill, cascade: mutant === undefined ? committed : measured }).then((graph) => {
    const { files, counts } = render(graph);
    const total = Object.values(files).reduce((n, text) => n + Buffer.byteLength(text), 0);

    const views = renderViews(files);

    if (args.includes("--write")) {
      mkdirSync(OUT_DIR, { recursive: true });
      for (const [name, text] of Object.entries(files)) writeFileSync(join(OUT_DIR, `${name}.json`), text);
      console.log(`theme-graph: wrote ${OUT_FILES.length} file(s), ${(total / 1024 / 1024).toFixed(2)} MB`);
    }
    if (args.includes("--write") || args.includes("--views")) {
      mkdirSync(VIEWS_DIR, { recursive: true });
      for (const [name, text] of Object.entries(views)) writeFileSync(join(VIEWS_DIR, name), text);
      const bytes = Object.values(views).reduce((n, text) => n + Buffer.byteLength(text), 0);
      console.log(`theme-graph: wrote ${Object.keys(views).length} view(s), ${(bytes / 1024).toFixed(1)} KB`);
    }
    if (args.includes("--json")) console.log(JSON.stringify(counts, null, 2));

    if (args.includes("--check")) {
      const failures = checkFailures({ files, views, committed, measured });
      if (failures.length > 0) {
        for (const failure of failures) console.error(`theme-graph FAIL -- ${failure}`);
        process.exit(1);
      }
      console.log(
        `theme-graph --check OK -- ${counts.decisions} decisions, ${counts.derivers} derivers, ${counts.channels} channels, `
        + `${counts.consumers} consumers, ${counts.families} families; ${Object.values(counts.edges).reduce((a, b) => a + b, 0)} edges; `
        + `${(total / 1024 / 1024).toFixed(2)} MB. Read census re-measured from CSS source and byte-equal to the committed one; `
        + "compiler read from dist/ under its build-stamp content proof.",
      );
    }
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  /* `main` throws synchronously on a stale build, so the handler is attached
     around the CALL and not only to the promise it would otherwise return. A
     refusal is a finding this gate states in one line, never a stack trace. */
  Promise.resolve()
    .then(main)
    .catch((error) => { console.error(`theme-graph FAIL -- ${error.message}`); process.exit(1); });
}
