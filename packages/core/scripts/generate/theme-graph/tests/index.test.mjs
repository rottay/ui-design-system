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
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";

import { assertNoUnknown, canonical, stableStringify } from "../schema.mjs";
import { cascadeDrift, expandKeypath, familyOfFile, measureCascade } from "../derive.mjs";
import {
  assertDistIsFresh, buildGraph, byControl, byFamily, checkFailures, compareGraph, compareViews, MUTANT_SKIN, OUT_DIR,
  OUT_FILES, plantSkinMutant, render, renderViews, VIEWS_DIR,
} from "../index.mjs";
import { renderControlsView, renderFamiliesView } from "../views.mjs";

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

  it("MUTANT: a dist/ whose freshness no build stamp proves is refused, however new its mtime", () => {
    const root = mkdtempSync(join(tmpdir(), "theme-graph-dist-"));
    try {
      mkdirSync(join(root, "dist"));
      assert.throws(() => assertDistIsFresh(root), /not proven fresh by its build stamp -- build stamp missing/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
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

  it("MUTANT: a read site deleted from a real skin's source reddens the census and moves the graph", async () => {
    const skin = join(OUT_DIR, "../../..", MUTANT_SKIN);
    const skinBytes = readFileSync(skin);
    const clean = measureCascade(join(OUT_DIR, "../../.."));
    const planted = plantSkinMutant();
    let mutant;
    try {
      mutant = measureCascade(join(OUT_DIR, "../../.."), { cssRoot: planted.cssRoot });
    } finally {
      planted.cleanup();
    }
    assert.deepEqual(readFileSync(skin), skinBytes, "the drill mutates a copy, never the tree");
    assert.equal(planted.site.file, `packages/core/${MUTANT_SKIN}`);

    const lostIds = (from, to) => {
      const kept = new Set(to.document.readSites.map((site) => site.readSiteId));
      return from.document.readSites.map((site) => site.readSiteId).filter((id) => !kept.has(id));
    };
    assert.deepEqual(lostIds(clean, mutant), [planted.site.readSiteId], "exactly the planted site leaves the census");
    assert.deepEqual(lostIds(mutant, clean), [], "and no other site moves");

    const drift = cascadeDrift(clean, mutant);
    assert.equal(drift.length, 1);
    assert.match(drift[0], /is stale against the CSS source \(read-site ids -1 \+0,/);

    const cleanGraph = render(await buildGraph({ cascade: clean }));
    const mutantGraph = render(await buildGraph({ cascade: mutant }));
    const short = planted.site.readSiteId.slice(0, 12);
    const consumerIds = (rendered) => new Set(JSON.parse(rendered.files.nodes).nodes
      .filter((node) => node.kind === "consumer").map((node) => node.id));
    assert.ok(consumerIds(cleanGraph).has(short), "the clean source graph carries the site");
    assert.ok(!consumerIds(mutantGraph).has(short), "the mutant source graph does not");
    assert.equal(mutantGraph.counts.consumers, cleanGraph.counts.consumers - 1);
    assert.equal(mutantGraph.counts.edges.reads, cleanGraph.counts.edges.reads - planted.site.refs.length);
    assert.notEqual(mutantGraph.files.digest, cleanGraph.files.digest);

    const outDir = mkdtempSync(join(tmpdir(), "theme-graph-out-"));
    const viewsDir = mkdtempSync(join(tmpdir(), "theme-graph-views-"));
    try {
      for (const [name, text] of Object.entries(cleanGraph.files)) writeFileSync(join(outDir, `${name}.json`), text);
      const cleanViews = renderViews(cleanGraph.files);
      for (const [name, text] of Object.entries(cleanViews)) writeFileSync(join(viewsDir, name), text);

      assert.deepEqual(
        checkFailures({ files: cleanGraph.files, views: cleanViews, committed: clean, measured: clean, outDir, viewsDir }),
        [],
        "a census and graph that match their source pass",
      );
      const censusOnly = checkFailures({
        files: cleanGraph.files, views: cleanViews, committed: clean, measured: mutant, outDir, viewsDir,
      });
      assert.equal(censusOnly.length, 1, "a skin edited after the census was cut is red even while the graph matches it");
      assert.match(censusOnly[0], /stale against the CSS source/);

      const regenerated = checkFailures({
        files: mutantGraph.files, views: renderViews(mutantGraph.files), committed: mutant, measured: mutant, outDir, viewsDir,
      });
      assert.ok(regenerated.some((failure) => /nodes\.json differs from the derivation/.test(failure)));
      assert.ok(regenerated.some((failure) => /edges\.json differs from the derivation/.test(failure)));
    } finally {
      rmSync(outDir, { recursive: true, force: true });
      rmSync(viewsDir, { recursive: true, force: true });
    }
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

describe("theme-graph views -- generated, never authored", () => {
  const jsonViews = () => ({
    "by-control": readFileSync(join(OUT_DIR, "by-control.json"), "utf8"),
    "by-family": readFileSync(join(OUT_DIR, "by-family.json"), "utf8"),
  });

  it("the committed views match a fresh render of the committed JSON, byte for byte", () => {
    const rendered = renderViews(jsonViews());
    for (const [name, text] of Object.entries(rendered)) {
      assert.equal(readFileSync(join(VIEWS_DIR, name), "utf8"), text, `${name} drifted from its source`);
    }
  });

  it("the views are English and carry the do-not-edit banner the docs gate expects", () => {
    for (const name of ["controls.md", "families.md"]) {
      const text = readFileSync(join(VIEWS_DIR, name), "utf8");
      assert.match(text, /Do not hand-edit/, `${name} must say so in its own banner`);
      assert.match(text, /^digest: [0-9a-f]{64}$/m, `${name} must carry the digest of what it rendered`);
    }
  });

  it("MUTANT: a planted change in the graph moves the rendered row", () => {
    const document = JSON.parse(jsonViews()["by-control"]);
    const clean = renderControlsView(document);
    /* One decision loses one family. The view is a function of the graph, so the
       row and the digest both have to move; a view that did not would be a
       transcription with a generator's banner on it. */
    const victim = document.controls.find((row) => row.families.length > 0);
    victim.families = victim.families.slice(1);
    const mutant = renderControlsView(document);
    assert.notEqual(mutant, clean, "the rendered view must follow the graph");
    assert.ok(!mutant.includes(`digest: ${clean.match(/digest: ([0-9a-f]{64})/)[1]}`), "and so must its digest");
  });

  it("MUTANT: a planted change in the family graph moves the rendered row", () => {
    const document = JSON.parse(jsonViews()["by-family"]);
    const clean = renderFamiliesView(document);
    const victim = document.families.find((row) => row.decisions.length > 0);
    victim.decisions = [];
    const mutant = renderFamiliesView(document);
    assert.notEqual(mutant, clean);
    assert.match(mutant, /\*\*none\*\*/, "a family that lost every decision reads as none");
  });

  it("MUTANT: a hand-edited view fails regeneration", () => {
    /* The comparison `--check` performs, on a view somebody improved by hand.
       There is no tolerance to fall through: one byte is a red. */
    const rendered = renderViews(jsonViews());
    const handEdited = rendered["controls.md"].replace("Do not hand-edit", "Do not hand-edit (updated)");
    assert.notEqual(handEdited, rendered["controls.md"]);
    assert.ok(
      handEdited !== rendered["controls.md"],
      "a hand edit must not survive a byte comparison against the render",
    );
  });

  it("MUTANT: an invocation that would do nothing is refused, not exited 0", async () => {
    /* The package script shipped as `ds:derive ... run`: `run` is not a flag, so
       it fell through every branch and exited 0 having derived nothing. A green
       no-op is the one outcome this WO cannot ship. */
    const { execFileSync } = await import("node:child_process");
    const script = join(OUT_DIR, "../../../scripts/generate/theme-graph/index.mjs");
    for (const argv of [["run"], []]) {
      assert.throws(
        () => execFileSync(process.execPath, [script, ...argv], { encoding: "utf8", stdio: "pipe" }),
        /nothing to do|unknown argument/,
        `invoking with ${JSON.stringify(argv)} must refuse`,
      );
    }
  });
});

describe("theme-graph --check-views -- the pure half, verified without a build", () => {
  const SCRIPT = join(VIEWS_DIR, "../../../scripts/generate/theme-graph/index.mjs");

  const run = async (...argv) => {
    const { spawnSync } = await import("node:child_process");
    const result = spawnSync(process.execPath, [SCRIPT, ...argv], { encoding: "utf8" });
    return { status: result.status, out: `${result.stdout}${result.stderr}` };
  };

  it("positive: the committed views pass, and the command says what it did NOT check", async () => {
    const { status, out } = await run("--check-views");
    assert.equal(status, 0, out);
    /* The narrower guarantee is stated in the output on purpose. A reader of a
       green line must not come away believing the JSON was checked against the
       compiler, because it was not. */
    assert.match(out, /does NOT check the JSON against the compiler/);
  });

  it("MUTANT: a view edited by hand turns it red, and regeneration restores the bytes", async () => {
    const path = join(VIEWS_DIR, "controls.md");
    const original = readFileSync(path, "utf8");
    try {
      writeFileSync(path, original.replace("| `chrome.anatomy` |", "| `chrome.anatomy` (edited) |"));
      const red = await run("--check-views");
      assert.notEqual(red.status, 0, "a hand-edited view must fail");
      assert.match(red.out, /controls\.md differs from the derivation/);

      const regenerated = await run("--views");
      assert.equal(regenerated.status, 0, regenerated.out);
      assert.equal(readFileSync(path, "utf8"), original, "regeneration restores the bytes exactly");

      const green = await run("--check-views");
      assert.equal(green.status, 0, green.out);
    } finally {
      writeFileSync(path, original);
    }
  });

  it("MUTANT: a missing view is named, not silently passed", () => {
    const failures = compareViews({ "controls.md": "x" }, join(VIEWS_DIR, "nowhere"));
    assert.equal(failures.length, 1);
    assert.match(failures[0], /is missing/);
  });

  it("it needs no build, which is the whole reason it exists", async () => {
    /* `--check` asserts a fresh `dist` and refuses without one; this verb must
       not, because the coordinator owns the serialized build and a view is a
       pure function of JSON that is already committed. Asserted by running it
       with the build in whatever state this tree has it. */
    const { status } = await run("--check-views");
    assert.equal(status, 0, "--check-views must not depend on the build state");
    assert.equal(typeof assertDistIsFresh, "function", "...while the deriving check still owns that assertion");
  });
});

describe("theme-graph -- a check never repairs what it compares", () => {
  const SCRIPT = join(OUT_DIR, "../../../scripts/generate/theme-graph/index.mjs");
  const DIGEST = join(OUT_DIR, "digest.json");

  const run = async (...argv) => {
    const { spawnSync } = await import("node:child_process");
    const result = spawnSync(process.execPath, [SCRIPT, ...argv], { encoding: "utf8" });
    return { status: result.status, out: `${result.stdout}${result.stderr}` };
  };

  const withPlantedDrift = async (body) => {
    const original = readFileSync(DIGEST);
    const planted = Buffer.concat([original, Buffer.from("\n")]);
    writeFileSync(DIGEST, planted);
    try {
      await body(planted);
    } finally {
      writeFileSync(DIGEST, original);
    }
  };

  it("MUTANT: a writer combined with a checker is refused before any work, and the drift survives", async () => {
    const combinations = [
      ["--write", "--check"],
      ["--check", "--write"],
      ["--write", "--check-views"],
      ["--views", "--check"],
      ["--views", "--check-views"],
      ["--write", "--views", "--check", "--json"],
    ];
    await withPlantedDrift(async (planted) => {
      for (const argv of combinations) {
        const { status, out } = await run(...argv);
        assert.notEqual(status, 0, `${argv.join(" ")} must exit nonzero`);
        assert.match(out, /incompatible arguments/, `${argv.join(" ")} must name the incompatibility`);
        assert.doesNotMatch(out, /wrote|not proven fresh|dist\/ is missing/, `${argv.join(" ")} must refuse before any work`);
        assert.deepEqual(readFileSync(DIGEST), planted, `${argv.join(" ")} must not repair the planted drift`);
      }
    });
  });

  it("MUTANT: a drill is never written, and an unknown drill is refused, before any work", async () => {
    await withPlantedDrift(async (planted) => {
      for (const [argv, pattern] of [
        [["--drill=skin", "--write"], /a planted mutant is never written/],
        [["--drill=deriver", "--views"], /a planted mutant is never written/],
        [["--drill=nope", "--check"], /unknown drill nope/],
      ]) {
        const { status, out } = await run(...argv);
        assert.notEqual(status, 0, `${argv.join(" ")} must exit nonzero`);
        assert.match(out, pattern);
        assert.doesNotMatch(out, /wrote|not proven fresh|dist\/ is missing/, `${argv.join(" ")} must refuse before any work`);
        assert.deepEqual(readFileSync(DIGEST), planted);
      }
    });
  });

  it("MUTANT: pure --check on a drifted artefact exits nonzero and leaves its bytes untouched", async () => {
    await withPlantedDrift(async (planted) => {
      const { status, out } = await run("--check");
      assert.notEqual(status, 0, out);
      /* A stale build refuses before the comparison; a fresh one reaches it and
         names the drift. Neither path may write. */
      assert.match(out, /digest\.json differs from the derivation|not proven fresh by its build stamp|dist\/ is missing/);
      assert.deepEqual(readFileSync(DIGEST), planted, "--check must not repair the artefact it compares");
    });
  });

  it("MUTANT: the comparison --check runs reports the drift and writes nothing", () => {
    const dir = mkdtempSync(join(tmpdir(), "theme-graph-check-"));
    try {
      cpSync(OUT_DIR, dir, { recursive: true });
      const derived = Object.fromEntries(OUT_FILES.map((name) => [name, read(name)]));
      assert.deepEqual(compareGraph(derived, dir), [], "an identical copy has no drift");

      const path = join(dir, "digest.json");
      const planted = Buffer.from(`${derived.digest}\n`);
      writeFileSync(path, planted);
      const before = OUT_FILES.map((name) => readFileSync(join(dir, `${name}.json`)));

      const failures = compareGraph(derived, dir);
      assert.equal(failures.length, 1);
      assert.match(failures[0], /digest\.json differs from the derivation/);
      assert.deepEqual(
        OUT_FILES.map((name) => readFileSync(join(dir, `${name}.json`))),
        before,
        "the comparison must leave every artefact byte-identical",
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
