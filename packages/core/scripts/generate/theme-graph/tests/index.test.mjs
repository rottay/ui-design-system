/**
 * The drill for theme-graph.
 *
 * The failure this generator exists against is a graph that stops being derived:
 * a number transcribed once, then maintained by hand until it describes a tree
 * nobody has. F-04 is what that looks like at scale -- 5,355 cells, every one
 * `UNKNOWN`, cross-validated against a second hand-written list from the same
 * file. So every case below either plants a change that the graph MUST notice,
 * or plants a placeholder that the graph MUST refuse.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { assertNoUnknown, canonical, stableStringify } from "../schema.mjs";
import { expandKeypath, familyOfFile } from "../derive.mjs";
import { assertDistIsFresh, buildGraph, byControl, byFamily, OUT_DIR, render } from "../index.mjs";

const read = (name) => readFileSync(join(OUT_DIR, `${name}.json`), "utf8");

describe("theme-graph -- the emitted graph is the derivation", () => {
  it("the four files and the digest match a fresh derivation, byte for byte", async () => {
    const { files } = render(await buildGraph());
    for (const [name, text] of Object.entries(files)) {
      assert.equal(read(name), text, `${name}.json drifted from the derivation`);
    }
  });

  it("every counted node kind is present, so the graph is not a partial walk", async () => {
    const graph = await buildGraph();
    assert.ok(graph.decisions.length > 0, "no decisions: the catalog read is broken");
    assert.ok(graph.derivers.length > 0, "no derivers: the registry read is broken");
    assert.ok(graph.channels.length > 0, "no channels: the dry-run is broken");
    assert.ok(graph.consumers.length > 0, "no consumers: the read census is broken");
    assert.ok(graph.families.length > 0, "no families: the skin walk is broken");
  });

  it("a stale build is refused, because the graph must describe THIS tree", () => {
    /* Named, not incidental: the manifest's defining failure was describing a
       cascade nobody had. The command asserts this before it derives; a tree
       whose sources are newer than its build cannot publish a digest. */
    assert.equal(typeof assertDistIsFresh, "function");
    assert.throws(() => assertDistIsFresh("/nonexistent-root-for-this-drill"), /dist\/ is missing/);
  });

  it("the dry-run covered three verticals in two modes each", async () => {
    const graph = await buildGraph();
    assert.equal(graph.run.blocks.length, 6, "3 verticals x 2 modes is the stated coverage");
    assert.deepEqual(
      [...new Set(graph.run.blocks.map((block) => block.vertical))].sort(),
      ["bithire", "evnto", "rottay"],
    );
    for (const block of graph.run.blocks) {
      assert.ok(block.channels > 0, `${block.vertical}/${block.mode} emitted nothing`);
    }
  });
});

describe("theme-graph drills -- a graph that cannot move is not derived", () => {
  it("MUTANT: a deriver that stops producing a channel moves the graph", async () => {
    const clean = render(await buildGraph());
    const mutant = render(await buildGraph({ drill: "deriver" }));
    assert.notEqual(mutant.files.nodes, clean.files.nodes, "a lost channel must move the nodes");
    assert.notEqual(mutant.files.digest, clean.files.digest, "...and the digest");
    assert.equal(mutant.counts.channels, clean.counts.channels - 1);
  });

  it("MUTANT: a skin that stops reading a channel moves the graph", async () => {
    const clean = render(await buildGraph());
    const mutant = render(await buildGraph({ drill: "skin" }));
    assert.notEqual(mutant.files.nodes, clean.files.nodes, "a lost read site must move the nodes");
    assert.notEqual(mutant.files.edges, clean.files.edges, "...and its read edges");
    assert.equal(mutant.counts.consumers, clean.counts.consumers - 1);
  });

  it("MUTANT: a placeholder anywhere in the graph is refused", () => {
    /* The exact shape F-04 recorded: a cell that says UNKNOWN instead of a row
       that is absent. It is refused structurally, so a NEW field cannot carry
       the old habit back in. */
    assert.throws(() => assertNoUnknown({ nodes: [{ kind: "channel", producedBy: "UNKNOWN" }] }), /placeholder/);
    assert.throws(() => assertNoUnknown({ nodes: [{ kind: "family", tier: "UNATTRIBUTED" }] }), /placeholder/);
    assert.throws(() => assertNoUnknown({ edges: [{ from: "a", to: null }] }), /never nulled/);
  });

  it("MUTANT: an unmeasured fact is OMITTED, never nulled -- and the real graph obeys", async () => {
    const graph = await buildGraph();
    assert.doesNotThrow(() => assertNoUnknown(graph.nodes, "nodes"));
    assert.doesNotThrow(() => assertNoUnknown(graph.edges, "edges"));
    /* A family with no component tier omits the field rather than carrying an
       empty one, which is the same law the guard enforces. */
    const untiered = graph.families.filter((family) => !("tier" in family));
    for (const family of untiered) assert.deepEqual(Object.keys(family).sort(), ["id", "kind"]);
  });

  it("the emitted JSON is canonical, so a digest moves only when a fact moves", () => {
    assert.equal(stableStringify({ b: 1, a: 2 }), stableStringify({ a: 2, b: 1 }));
    assert.deepEqual(canonical({ z: { y: 1, x: 2 } }), { z: { x: 2, y: 1 } });
  });
});

describe("theme-graph -- the joins are the measured ones", () => {
  it("a catalog keypath expands the way the catalog writes it", () => {
    assert.deepEqual(expandKeypath("palette.{primaryColor,secondaryColor}"), [
      "palette.primaryColor",
      "palette.secondaryColor",
    ]);
    assert.deepEqual(expandKeypath("surfaces.radiusScale"), ["surfaces.radiusScale"]);
  });

  it("the decision -> deriver join runs on keypaths, never on the two id vocabularies", async () => {
    /* The defect this pins: derivers declare `surfaces.radiusScale` and the
       catalog calls the same decision `shape.radius-scale`. Joining the ids
       reported eleven decisions as moving nothing at all. */
    const graph = await buildGraph();
    const radius = graph.decisions.find((decision) => decision.id === "shape.radius-scale");
    assert.ok(radius, "the catalog still carries shape.radius-scale");
    assert.ok(radius.keypaths.includes("surfaces.radiusScale"), "its FlatTheme keypath travels with it");
    const consumes = graph.edges.filter((edge) => edge.kind === "consumes" && edge.from === "shape.radius-scale");
    assert.ok(consumes.length > 0, "and at least one deriver consumes it");
  });

  it("a consumer is attributed to a family by its own path, or to none at all", () => {
    assert.equal(
      familyOfFile("packages/core/src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css"),
      "card",
    );
    assert.equal(familyOfFile("packages/core/src/foundation/tokens/css/facade/entrypoints/base/index.css"), undefined);
  });

  it("reach follows the alias chain, which is why it is in the schema", async () => {
    const graph = await buildGraph();
    const controls = byControl(graph);
    const withAliases = controls.filter((row) => row.channelsThroughAliases > row.channels);
    assert.ok(
      withAliases.length > 0,
      "no decision gains reach through an alias: the closure is not walking the measured chain",
    );
    const families = byFamily(graph, controls);
    assert.equal(families.length, graph.families.length, "every family gets a row, reached or not");
  });
});
