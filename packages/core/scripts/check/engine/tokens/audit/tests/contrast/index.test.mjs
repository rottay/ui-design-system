import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import * as contrast from "../../counters/contrast/index.mjs";

const { evaluateApcaPairings } = contrast;
const pairings = () => contrast.APCA_PAIRINGS ?? [];
const palettes = () => contrast.APCA_PALETTES ?? [];
const dispositions = () => contrast.APCA_SKIP_DISPOSITIONS ?? [];

/** A throwaway token tree: one foundation theme, one tenant artifact, one component layer. */
function fixtureTree() {
  const dir = mkdtempSync(join(tmpdir(), "apca-coverage-"));
  const write = (rel, text) => {
    mkdirSync(dirname(join(dir, rel)), { recursive: true });
    writeFileSync(join(dir, rel), text);
  };
  write("foundation.css", ":root {\n  --ink: #111111;\n  --ground: #ffffff;\n  --faint: #eeeeee;\n}\n");
  write("tenant.css", "html[data-tenant='acme'] {\n  --layer-ground: #000000;\n}\n");
  write("layer/index.css", ":root {\n  --layer-ink: #ffffff;\n  --layer-ground: #222222;\n}\n");
  return {
    dir,
    palettes: [
      { id: "base", kind: "foundation", file: join(dir, "foundation.css"), theme: "light" },
      { id: "acme", kind: "artifact", tenant: "acme", file: join(dir, "tenant.css"), theme: "light" },
    ],
    cleanup: () => rmSync(dir, { recursive: true, force: true }),
  };
}

test("every palette the instrument reads exists on disk", () => {
  assert.ok(palettes().length > 0, "the palette list is exported");
  for (const palette of palettes()) {
    assert.ok(existsSync(palette.file), `palette ${palette.id} reads ${palette.file}, which does not exist`);
  }
});

test("the real tree has no coverage breach and its accounting closes", () => {
  const apca = evaluateApcaPairings();
  assert.deepEqual(apca.coverageFailures, []);
  assert.equal(apca.unjustifiedSkips, 0);
  assert.equal(apca.total, pairings().length * palettes().length);
  assert.equal(apca.evaluated + apca.skipped, apca.total);
  assert.equal(apca.results.length, apca.total);
});

test("every skip in the real tree carries a named disposition and a reason", () => {
  const apca = evaluateApcaPairings();
  const named = new Set(dispositions().flatMap((entry) => entry.palettes.map((palette) => `${palette}:${entry.pair}`)));
  const skips = apca.results.filter((row) => row.status !== "pass" && row.status !== "FAIL");
  for (const row of skips) {
    assert.equal(row.status, "skip", `${row.palette}:${row.pair} is unmeasured without a disposition`);
    assert.ok(named.has(`${row.palette}:${row.pair}`), `${row.palette}:${row.pair} is not in APCA_SKIP_DISPOSITIONS`);
    assert.match(row.disposition ?? "", /^[a-z][a-z-]+$/);
    assert.ok((row.reason ?? "").length > 40, `${row.palette}:${row.pair} has no real reason`);
  }
  assert.equal(skips.length, named.size, "no disposition is left over");
});

test("the measured set is pinned: 32 evaluated, 20 badge-tone skips, the button label on every palette", () => {
  const apca = evaluateApcaPairings();
  assert.equal(apca.evaluated, 32);
  assert.equal(apca.skipped, 20);
  assert.ok(apca.results.filter((row) => row.status === "skip").every((row) => /^badge-/.test(row.pair)));
  const label = apca.results.filter((row) => row.pair === "primary-button-label");
  assert.deepEqual(label.map((row) => row.palette), palettes().map((palette) => palette.id));
  assert.ok(label.every((row) => typeof row.lc === "number"), "the primary button label is measured, not skipped");
});

test("drill: a palette file that does not exist is a failure, never a silent run of skips", () => {
  const broken = palettes().map((palette) =>
    palette.kind === "foundation" ? { ...palette, file: join(dirname(palette.file), "renamed-away.css") } : palette
  );
  const apca = evaluateApcaPairings({ palettes: broken });
  assert.ok(apca.failures > 0);
  assert.ok(apca.coverageFailures.some((failure) => /^missing source: palette default reads .*renamed-away\.css/.test(failure)));
  assert.ok(apca.coverageFailures.some((failure) => /^unjustified skip: default:body-text-on-page-bg /.test(failure)));
});

test("drill: removing one justification turns its skips into failures", () => {
  const without = dispositions().filter((entry) => entry.pair !== "badge-warning");
  assert.equal(without.length, dispositions().length - 1, "the drilled disposition exists");
  const apca = evaluateApcaPairings({ dispositions: without });
  const breaches = apca.coverageFailures.filter((failure) => /^unjustified skip: [a-z]+:badge-warning /.test(failure));
  assert.equal(breaches.length, palettes().length);
  assert.equal(apca.coverageFailures.length, breaches.length, "and nothing else is red");
  assert.equal(apca.unjustifiedSkips, breaches.length);
  assert.equal(apca.failures, breaches.length);
  assert.equal(apca.evaluated + apca.skipped + apca.unjustifiedSkips, apca.total);
});

test("drill: a disposition whose pairing measures again is stale and red", () => {
  const stale = [
    ...dispositions(),
    { pair: "body-text-on-page-bg", palettes: ["bithire"], disposition: "drill", reason: "a pairing that is measured may not also be excused" },
  ];
  const apca = evaluateApcaPairings({ dispositions: stale });
  assert.deepEqual(apca.coverageFailures, [
    "stale skip disposition: bithire:body-text-on-page-bg is named in APCA_SKIP_DISPOSITIONS but is not an unmeasured pairing; remove it",
  ]);
  assert.equal(apca.failures, 1);
});

test("drill: an unresolvable pairing with no disposition is red; with one it is a counted skip", () => {
  const tree = fixtureTree();
  try {
    const dead = [{ id: "dead", kind: "ui", text: "--nowhere", bg: "--ground" }];
    const red = evaluateApcaPairings({ pairings: dead, palettes: tree.palettes, dispositions: [], cssRoot: tree.dir });
    assert.equal(red.failures, 2);
    assert.equal(red.unjustifiedSkips, 2);
    assert.equal(red.skipped, 0);
    const excused = evaluateApcaPairings({
      pairings: dead,
      palettes: tree.palettes,
      dispositions: [{ pair: "dead", palettes: ["base", "acme"], disposition: "drill", reason: "fixture" }],
      cssRoot: tree.dir,
    });
    assert.equal(excused.failures, 0);
    assert.equal(excused.skipped, 2);
    assert.equal(excused.evaluated + excused.skipped, excused.total);
  } finally {
    tree.cleanup();
  }
});

test("a pair below its floor still fails, and a component layer resolves under the tenant artifact", () => {
  const tree = fixtureTree();
  try {
    const apca = evaluateApcaPairings({
      pairings: [
        { id: "readable", kind: "body", text: "--ink", bg: "--ground" },
        { id: "washed-out", kind: "body", text: "--faint", bg: "--ground" },
        { id: "layered", kind: "ui", text: "--layer-ink", bg: "--layer-ground", componentLayer: "layer/index.css" },
      ],
      palettes: tree.palettes,
      dispositions: [],
      cssRoot: tree.dir,
    });
    const row = (palette, pair) => apca.results.find((r) => r.palette === palette && r.pair === pair);
    assert.equal(row("base", "readable").status, "pass");
    assert.equal(row("base", "washed-out").status, "FAIL");
    assert.equal(apca.belowThreshold, 2);
    assert.equal(apca.failures, 2);
    assert.deepEqual(apca.coverageFailures, []);
    assert.equal(row("base", "layered").bgColor, "#222222");
    assert.equal(row("acme", "layered").bgColor, "#000000");
    const missing = evaluateApcaPairings({
      pairings: [{ id: "layered", kind: "ui", text: "--layer-ink", bg: "--layer-ground", componentLayer: "gone/index.css" }],
      palettes: tree.palettes,
      dispositions: [],
      cssRoot: tree.dir,
    });
    assert.ok(missing.coverageFailures.some((failure) => /^missing source: component layer gone\/index\.css /.test(failure)));
  } finally {
    tree.cleanup();
  }
});
