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
const legs = () => contrast.APCA_LEGS ?? [];

/** A throwaway token tree: one foundation theme, one tenant artifact, one component layer,
 * each with a dark scheme block in the selector shape its real counterpart uses. */
function fixtureTree() {
  const dir = mkdtempSync(join(tmpdir(), "apca-coverage-"));
  const write = (rel, text) => {
    mkdirSync(dirname(join(dir, rel)), { recursive: true });
    writeFileSync(join(dir, rel), text);
  };
  write(
    "foundation.css",
    ":root {\n  --ink: #111111;\n  --ground: #ffffff;\n  --faint: #eeeeee;\n  --status: #111111;\n}\n" +
      ":root[data-theme='dark'],\nhtml[data-theme='dark'],\nhtml.dark {\n  --ink: #f5f5f5;\n  --ground: #0a0a0a;\n  --faint: #1a1a1a;\n}\n"
  );
  write(
    "tenant.css",
    "html[data-tenant='acme'] {\n  --layer-ground: #000000;\n}\n" +
      "html[data-tenant='acme'][data-theme='dark'], html[data-tenant='acme'].dark {\n  --layer-ground: #101010;\n}\n"
  );
  write(
    "layer/index.css",
    ":root {\n  --layer-ink: #ffffff;\n  --layer-ground: #222222;\n}\n" +
      ":where(:root, [data-ds-root]):is([data-theme='dark'], .dark) {\n  --layer-ground: #333333;\n}\n"
  );
  return {
    dir,
    palettes: [
      { id: "base", kind: "foundation", file: join(dir, "foundation.css"), theme: "light" },
      { id: "acme", kind: "artifact", tenant: "acme", file: join(dir, "tenant.css"), theme: "light" },
    ],
    write,
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
  assert.deepEqual(legs(), ["light", "dark"]);
  assert.equal(apca.total, pairings().length * palettes().length * legs().length);
  assert.equal(apca.evaluated + apca.skipped, apca.total);
  assert.equal(apca.results.length, apca.total);
  for (const leg of legs()) {
    const tally = apca.byLeg[leg];
    assert.equal(tally.total, pairings().length * palettes().length, `${leg} covers every pairing on every palette`);
    assert.equal(tally.evaluated + tally.skipped, tally.total, `${leg} has no unjustified skip`);
  }
});

test("every skip in the real tree carries a named disposition and a reason", () => {
  const apca = evaluateApcaPairings();
  const named = new Set(
    dispositions().flatMap((entry) =>
      entry.palettes.flatMap((palette) => (entry.legs ?? legs()).map((leg) => `${palette}/${leg}:${entry.pair}`))
    )
  );
  const skips = apca.results.filter((row) => row.status !== "pass" && row.status !== "FAIL");
  for (const row of skips) {
    const key = `${row.palette}/${row.leg}:${row.pair}`;
    assert.equal(row.status, "skip", `${key} is unmeasured without a disposition`);
    assert.ok(named.has(key), `${key} is not in APCA_SKIP_DISPOSITIONS`);
    assert.match(row.disposition ?? "", /^[a-z][a-z-]+$/);
    assert.ok((row.reason ?? "").length > 40, `${key} has no real reason`);
    assert.match(row.unmeasured ?? "", /not declared in this cascade|not a static opaque colour/);
  }
  assert.equal(skips.length, named.size, "no disposition is left over");
});

test("the measured set is pinned per leg: 32 evaluated, 20 badge-tone skips, the button label on every palette", () => {
  const apca = evaluateApcaPairings();
  for (const leg of legs()) {
    assert.equal(apca.byLeg[leg].evaluated, 32, `${leg} evaluated`);
    assert.equal(apca.byLeg[leg].skipped, 20, `${leg} skipped`);
    const label = apca.results.filter((row) => row.leg === leg && row.pair === "primary-button-label");
    assert.deepEqual(label.map((row) => row.palette), palettes().map((palette) => palette.id));
    assert.ok(label.every((row) => typeof row.lc === "number"), `the primary button label is measured in ${leg}, not skipped`);
  }
  assert.equal(apca.evaluated, 64);
  assert.equal(apca.skipped, 40);
  assert.ok(apca.results.filter((row) => row.status === "skip").every((row) => /^badge-/.test(row.pair)));
});

test("the dark leg reads the dark cascade of every source, not the light values again", () => {
  const apca = evaluateApcaPairings();
  const row = (palette, leg, pair) => apca.results.find((r) => r.palette === palette && r.leg === leg && r.pair === pair);
  for (const palette of palettes()) {
    const light = row(palette.id, "light", "body-text-on-page-bg");
    const dark = row(palette.id, "dark", "body-text-on-page-bg");
    assert.notEqual(dark.bgColor, light.bgColor, `${palette.id} dark page ground is its light one`);
    assert.notEqual(dark.textColor, light.textColor, `${palette.id} dark body ink is its light one`);
  }
  // Foundation scheme block (html.dark), followed through the dark neutral ramp.
  assert.equal(row("default", "dark", "body-text-on-page-bg").bgColor, "#0b1220");
  // Tenant artifact scheme block (…[data-theme='dark'], ….dark) over the foundation's.
  assert.equal(row("bithire", "dark", "body-text-on-page-bg").bgColor, "#0A0A0A");
  // Component-layer scheme block: the label follows the role's dark ink.
  assert.equal(row("default", "light", "primary-button-label").textColor, "#ffffff");
  assert.equal(row("default", "dark", "primary-button-label").textColor, "#171717");
  // A dark-first artifact: its light leg reads the light scheme block, never the dark one.
  assert.equal(row("rottay", "light", "body-text-on-page-bg").bgColor, row("default", "light", "body-text-on-page-bg").bgColor);
});

test("the gated count is exactly the named below-threshold rows plus the coverage breaches", () => {
  const apca = evaluateApcaPairings();
  const below = apca.results.filter((row) => row.status === "FAIL");
  assert.equal(apca.belowThreshold, below.length);
  assert.equal(apca.failures, below.length + apca.coverageFailures.length);
  assert.equal(legs().reduce((n, leg) => n + apca.byLeg[leg].belowThreshold, 0), below.length);
  for (const row of below) assert.ok(row.lc < row.threshold, `${row.palette}/${row.leg}:${row.pair} is named with its Lc`);
  assert.match(contrast.describeApcaOutcome(apca), new RegExp(`^${apca.failures} failures \\(${below.length} below threshold, 0 coverage breaches\\)`));
  assert.doesNotMatch(contrast.describeApcaOutcome(apca), /unresolvable/);
});

test("drill: a palette file that does not exist is a failure, never a silent run of skips", () => {
  const broken = palettes().map((palette) =>
    palette.kind === "foundation" ? { ...palette, file: join(dirname(palette.file), "renamed-away.css") } : palette
  );
  const apca = evaluateApcaPairings({ palettes: broken });
  assert.ok(apca.failures > 0);
  assert.ok(apca.coverageFailures.some((failure) => /^missing source: palette default reads .*renamed-away\.css/.test(failure)));
  for (const leg of legs()) {
    assert.ok(apca.coverageFailures.some((failure) => failure.startsWith(`unjustified skip: default/${leg}:body-text-on-page-bg `)));
  }
});

test("drill: removing one justification turns its skips into failures", () => {
  const without = dispositions().filter((entry) => entry.pair !== "badge-warning");
  assert.equal(without.length, dispositions().length - 1, "the drilled disposition exists");
  const apca = evaluateApcaPairings({ dispositions: without });
  const breaches = apca.coverageFailures.filter((failure) => /^unjustified skip: [a-z]+\/(light|dark):badge-warning /.test(failure));
  assert.equal(breaches.length, palettes().length * legs().length);
  assert.equal(apca.coverageFailures.length, breaches.length, "and no other coverage breach appears");
  assert.equal(apca.unjustifiedSkips, breaches.length);
  assert.equal(apca.failures, apca.belowThreshold + breaches.length);
  assert.equal(apca.evaluated + apca.skipped + apca.unjustifiedSkips, apca.total);
});

test("drill: a justification narrowed to the light leg leaves the dark leg red", () => {
  const lightOnly = dispositions().map((entry) => (entry.pair === "badge-warning" ? { ...entry, legs: ["light"] } : entry));
  const apca = evaluateApcaPairings({ dispositions: lightOnly });
  const breaches = apca.coverageFailures.filter((failure) => /^unjustified skip: [a-z]+\/dark:badge-warning /.test(failure));
  assert.equal(breaches.length, palettes().length);
  assert.equal(apca.coverageFailures.length, breaches.length, "the light leg stays justified");
  assert.equal(apca.byLeg.dark.unjustifiedSkips, palettes().length);
  assert.equal(apca.byLeg.light.unjustifiedSkips, 0);
});

test("drill: a disposition whose pairing measures again is stale and red", () => {
  const stale = [
    ...dispositions(),
    { pair: "body-text-on-page-bg", palettes: ["bithire"], disposition: "drill", reason: "a pairing that is measured may not also be excused" },
  ];
  const apca = evaluateApcaPairings({ dispositions: stale });
  assert.deepEqual(apca.coverageFailures, [
    "stale skip disposition: bithire/light:body-text-on-page-bg is named in APCA_SKIP_DISPOSITIONS but is not an unmeasured pairing; remove it",
    "stale skip disposition: bithire/dark:body-text-on-page-bg is named in APCA_SKIP_DISPOSITIONS but is not an unmeasured pairing; remove it",
  ]);
  assert.equal(apca.failures, apca.belowThreshold + 2);
});

test("drill: a disposition that only the dark leg makes reachable is stale in that leg alone", () => {
  const tree = fixtureTree();
  try {
    // --late is declared by the dark scheme block only: unmeasurable in light, measured in dark.
    tree.write("foundation.css", ":root {\n  --ground: #ffffff;\n}\nhtml.dark {\n  --ground: #0a0a0a;\n  --late: #f5f5f5;\n}\n");
    const run = (entryLegs) =>
      evaluateApcaPairings({
        pairings: [{ id: "late", kind: "ui", text: "--late", bg: "--ground" }],
        palettes: [tree.palettes[0]],
        dispositions: [{ pair: "late", palettes: ["base"], ...entryLegs, disposition: "drill", reason: "fixture" }],
        cssRoot: tree.dir,
      });
    assert.deepEqual(run({}).coverageFailures, [
      "stale skip disposition: base/dark:late is named in APCA_SKIP_DISPOSITIONS but is not an unmeasured pairing; remove it",
    ]);
    const narrowed = run({ legs: ["light"] });
    assert.deepEqual(narrowed.coverageFailures, []);
    assert.equal(narrowed.byLeg.light.skipped, 1);
    assert.equal(narrowed.byLeg.dark.evaluated, 1);
  } finally {
    tree.cleanup();
  }
});

test("drill: a pairing with nothing to measure and no disposition is red; with one it is a counted skip", () => {
  const tree = fixtureTree();
  try {
    const dead = [{ id: "dead", kind: "ui", text: "--nowhere", bg: "--ground" }];
    const red = evaluateApcaPairings({ pairings: dead, palettes: tree.palettes, dispositions: [], cssRoot: tree.dir });
    assert.equal(red.failures, 4);
    assert.equal(red.unjustifiedSkips, 4);
    assert.equal(red.skipped, 0);
    assert.ok(red.coverageFailures.every((failure) => failure.includes("--nowhere is not declared in this cascade")));
    const excused = evaluateApcaPairings({
      pairings: dead,
      palettes: tree.palettes,
      dispositions: [{ pair: "dead", palettes: ["base", "acme"], disposition: "drill", reason: "fixture" }],
      cssRoot: tree.dir,
    });
    assert.equal(excused.failures, 0);
    assert.equal(excused.skipped, 4);
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
    const row = (palette, pair, leg = "light") => apca.results.find((r) => r.palette === palette && r.leg === leg && r.pair === pair);
    assert.equal(row("base", "readable").status, "pass");
    assert.equal(row("base", "washed-out").status, "FAIL");
    assert.equal(apca.byLeg.light.belowThreshold, 2);
    assert.equal(apca.byLeg.dark.belowThreshold, 2);
    assert.equal(apca.failures, 4);
    assert.deepEqual(apca.coverageFailures, []);
    assert.equal(row("base", "layered").bgColor, "#222222");
    assert.equal(row("acme", "layered").bgColor, "#000000");
    // Dark: each source's scheme block overrides its own base, in the same cascade order.
    assert.equal(row("base", "readable", "dark").textColor, "#f5f5f5");
    assert.equal(row("base", "readable", "dark").bgColor, "#0a0a0a");
    assert.equal(row("base", "layered", "dark").bgColor, "#333333");
    assert.equal(row("acme", "layered", "dark").bgColor, "#101010");
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

test("mutant: a pair that only the dark leg breaks is a named failure of the gated count", () => {
  const tree = fixtureTree();
  try {
    // --status keeps its light ink (#111111) on the dark ground: readable in light, invisible in dark.
    const apca = evaluateApcaPairings({
      pairings: [{ id: "status", kind: "ui", text: "--status", bg: "--ground" }],
      palettes: [tree.palettes[0]],
      dispositions: [],
      cssRoot: tree.dir,
    });
    const row = (leg) => apca.results.find((r) => r.leg === leg);
    assert.equal(row("light").status, "pass");
    assert.equal(row("dark").status, "FAIL");
    assert.equal(row("dark").bgColor, "#0a0a0a");
    assert.ok(row("dark").lc < 45);
    assert.equal(apca.byLeg.light.belowThreshold, 0);
    assert.equal(apca.byLeg.dark.belowThreshold, 1);
    assert.equal(apca.failures, 1);
    const lightOnly = evaluateApcaPairings({
      pairings: [{ id: "status", kind: "ui", text: "--status", bg: "--ground" }],
      palettes: [tree.palettes[0]],
      dispositions: [],
      cssRoot: tree.dir,
      legs: ["light"],
    });
    assert.equal(lightOnly.failures, 0, "which is exactly what a light-only instrument reported");
  } finally {
    tree.cleanup();
  }
});

test("mutant: a dark-leg pairing that stops resolving is red unless a disposition names that leg", () => {
  const tree = fixtureTree();
  try {
    // The dark scheme block turns the surface into a gradient: nothing static to measure in dark.
    tree.write(
      "foundation.css",
      ":root {\n  --ink: #111111;\n  --ground: #ffffff;\n}\nhtml.dark {\n  --ink: #f5f5f5;\n  --ground: linear-gradient(#000000, #111111);\n}\n"
    );
    const run = (named) =>
      evaluateApcaPairings({
        pairings: [{ id: "readable", kind: "body", text: "--ink", bg: "--ground" }],
        palettes: [tree.palettes[0]],
        dispositions: named,
        cssRoot: tree.dir,
      });
    const red = run([]);
    assert.deepEqual(red.coverageFailures, [
      "unjustified skip: base/dark:readable cannot be measured (--ground is declared, but not a static opaque colour) and APCA_SKIP_DISPOSITIONS does not name it",
    ]);
    assert.equal(red.failures, 1);
    assert.equal(red.byLeg.light.evaluated, 1);
    const lightNamed = run([{ pair: "readable", palettes: ["base"], legs: ["light"], disposition: "drill", reason: "fixture" }]);
    assert.equal(lightNamed.failures, 2, "a light-leg disposition excuses nothing in dark, and is stale in light");
    const darkNamed = run([{ pair: "readable", palettes: ["base"], legs: ["dark"], disposition: "drill", reason: "fixture" }]);
    assert.equal(darkNamed.failures, 0);
    assert.equal(darkNamed.byLeg.dark.skipped, 1);
  } finally {
    tree.cleanup();
  }
});

test("mutant: a palette with no scheme block for its other leg is a missing source, never a second light run", () => {
  const tree = fixtureTree();
  try {
    tree.write("foundation.css", ":root {\n  --ink: #111111;\n  --ground: #ffffff;\n}\n");
    tree.write("tenant.css", "html[data-tenant='acme'] {\n  --ground: #fefefe;\n}\n");
    const apca = evaluateApcaPairings({
      pairings: [{ id: "readable", kind: "body", text: "--ink", bg: "--ground" }],
      palettes: tree.palettes,
      dispositions: [],
      cssRoot: tree.dir,
    });
    assert.equal(apca.belowThreshold, 0, "every row passes, on the light values");
    assert.equal(apca.coverageFailures.length, 2);
    assert.match(apca.coverageFailures[0], /^missing source: palette base has no dark scheme block in .*foundation\.css; its dark leg would re-measure the light values$/);
    assert.match(apca.coverageFailures[1], /^missing source: palette acme has no dark scheme block in .*tenant\.css/);
    assert.equal(apca.failures, 2);
    // A dark-first palette owes the LIGHT block instead.
    const darkFirst = evaluateApcaPairings({
      pairings: [{ id: "readable", kind: "body", text: "--ink", bg: "--ground" }],
      palettes: [{ ...tree.palettes[0], theme: "dark" }],
      dispositions: [],
      cssRoot: tree.dir,
    });
    assert.match(darkFirst.coverageFailures[0], /^missing source: palette base has no light scheme block /);
  } finally {
    tree.cleanup();
  }
});

test("a scheme block is admitted only for its own leg, in each selector shape the tree uses", () => {
  const tree = fixtureTree();
  try {
    tree.write(
      "foundation.css",
      ":root {\n  --ink: #111111;\n  --ground: #ffffff;\n}\n" +
        "html.dark {\n  --ground: #0a0a0a;\n  --ink: #f5f5f5;\n}\n" +
        "html.dark .card {\n  --ground: #ff0000;\n}\n" +
        "html.darker {\n  --ground: #00ff00;\n}\n"
    );
    tree.write(
      "tenant.css",
      "html[data-tenant='acme'] {\n  --ink: #222222;\n}\n" +
        "html[data-tenant='acme']:not(.dark) {\n  --ground: #fdfdfd;\n}\n" +
        "html[data-tenant='acme'].dark {\n  --ink: #eeeeee;\n}\n" +
        "html[data-tenant='other'].dark {\n  --ink: #ff0000;\n}\n"
    );
    const apca = evaluateApcaPairings({
      pairings: [{ id: "readable", kind: "body", text: "--ink", bg: "--ground" }],
      palettes: tree.palettes,
      dispositions: [],
      cssRoot: tree.dir,
    });
    const row = (palette, leg) => apca.results.find((r) => r.palette === palette && r.leg === leg);
    assert.deepEqual([row("base", "light").textColor, row("base", "light").bgColor], ["#111111", "#ffffff"]);
    assert.deepEqual([row("base", "dark").textColor, row("base", "dark").bgColor], ["#f5f5f5", "#0a0a0a"]);
    assert.deepEqual([row("acme", "light").textColor, row("acme", "light").bgColor], ["#222222", "#fdfdfd"]);
    assert.deepEqual([row("acme", "dark").textColor, row("acme", "dark").bgColor], ["#eeeeee", "#0a0a0a"]);
    assert.deepEqual(apca.coverageFailures, []);
  } finally {
    tree.cleanup();
  }
});

test("a base block that redeclares a token after an equal-specificity scheme block is an ambiguous cascade", () => {
  const tree = fixtureTree();
  try {
    tree.write(
      "layer/index.css",
      ":where(:root, [data-ds-root]):is([data-theme='dark'], .dark) {\n  --layer-ground: #333333;\n}\n" +
        ":root {\n  --layer-ink: #ffffff;\n  --layer-ground: #222222;\n}\n"
    );
    const apca = evaluateApcaPairings({
      pairings: [{ id: "layered", kind: "ui", text: "--layer-ink", bg: "--layer-ground", componentLayer: "layer/index.css" }],
      palettes: [tree.palettes[0]],
      dispositions: [],
      cssRoot: tree.dir,
    });
    assert.deepEqual(apca.coverageFailures, [
      "ambiguous cascade: component layer layer/index.css redeclares --layer-ground in a base block after its dark scheme block set it at equal specificity",
    ]);
    assert.equal(apca.failures, 1);
  } finally {
    tree.cleanup();
  }
});
