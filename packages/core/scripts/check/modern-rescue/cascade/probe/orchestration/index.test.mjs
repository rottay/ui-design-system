/**
 * index.test.mjs — run with `node --test`.
 *
 * A probe that only ever says PASS has proved nothing. Every negative control
 * below plants a KNOWN defect and requires the probe to go red on it, with the
 * right code and a message that names the thing that broke. Two of the five are
 * defects already committed in this programme; the other three are the failure
 * modes the byte-equivalent rewiring makes possible.
 *
 * Fixtures are in-memory. They deliberately do NOT read the working tree: a
 * control whose colour depends on what another agent edited five minutes ago
 * is not a control.
 */
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import {
  parseStylesheet,
  splitTopLevel,
  stripComments,
  varReferences,
} from "../css-parsing/index.mjs";
import { describeType, evaluate, expandVars, sameValue } from "../value-evaluation/index.mjs";
import {
  analyse,
  evalIn,
  measureResponse,
  rootFontSizeExpression,
  sideFromSources,
} from "../symbolic-analysis/index.mjs";
import {
  buildFixture,
  findChromium,
  runFixture,
  synthesiseElement,
} from "../browser-analysis/index.mjs";
import {
  OUT_OF_GRAPH,
  changedChannels,
  entrypointsReaching,
  exitCodeFor,
  familyChannels,
  findTreeDeclarations,
  parseArgs,
  reclassifyOutOfGraph,
  resolveEntry,
} from "./index.mjs";

/* ───────────────────────────────── fixtures ───────────────────────────────── */

const THEME = `
@layer theme, base, components;
@layer theme {
  :root {
    --ds-density-effective-scale: clamp(0.5, calc(var(--ds-density-scale, 1) * var(--ds-density-local-factor, 1)), 3);
    --ds-spacing-4: calc(1rem * var(--ds-density-effective-scale, 1));
    --ds-font-size-sm-base: 0.875rem;
    --ds-font-size-md-base: 1rem;
    --ds-font-size-sm: calc(var(--ds-font-size-sm-base) * var(--ds-type-scale, 1));
    --ds-font-size-md: calc(var(--ds-font-size-md-base) * var(--ds-type-scale, 1));
    --ds-line-height-heading: 1.2;
    --ds-line-height-none: 1;
  }
}
`;

/** The reading sites: the modern skin multiplies padding by density itself. */
const SKIN = `
@layer components {
  .rottay-button[data-size='md'] {
    padding-inline: calc(var(--ds-button-md-padding-x) * var(--ds-density-effective-scale));
    font-size: var(--ds-button-md-font-size);
    line-height: var(--ds-button-md-line-height);
  }
}
`;

function sides({ before, after }) {
  const mk = (componentCss) =>
    sideFromSources([
      { rel: "theme.css", layer: "theme", text: THEME },
      { rel: "components.css", layer: "components", text: componentCss },
      { rel: "skin.css", layer: "components", text: SKIN },
    ]);
  return { before: mk(before), after: mk(after) };
}

const EMPTY_ARTIFACTS = { artifactDir: mkdtempSync(join(tmpdir(), "cp-noart-")) };

function probe(channels, beforeCss, afterCss, extra = {}) {
  const { before, after } = sides({ before: beforeCss, after: afterCss });
  return analyse({
    channels,
    before,
    after,
    artifactOptions: EMPTY_ARTIFACTS,
    ...extra,
  });
}

const only = (r) => r.results[0];
const codes = (r) => only(r).findings.map((f) => f.code);

/* ──────────────────────── control 0: it can say PASS ──────────────────────── */

test("positive control: a CORRECT rewiring is PASS and the dial goes live", () => {
  // 0.875rem pinned -> the sm ramp. Same rest, and now the type dial reaches it.
  const r = probe(
    ["--ds-button-md-font-size"],
    `:root { --ds-button-md-font-size: 0.875rem; }`,
    `:root { --ds-button-md-font-size: var(--ds-font-size-sm, 0.875rem); }`,
  );
  const c = only(r);
  assert.equal(c.verdict, "PASS", JSON.stringify(c.findings));
  assert.equal(c.restEquivalent, true);
  assert.equal(c.subtype, "dial-connected");
  const type = c.channelDials.find((d) => d.dial === "type");
  assert.equal(type.before, 0, "the pinned literal must not respond to the type dial");
  assert.equal(type.after, 1, "the rewired channel must respond exactly once");
});

test("positive control: an untouched pinned literal is PASS and inert", () => {
  const css = `:root { --ds-button-md-font-size: 0.875rem; }`;
  const c = only(probe(["--ds-button-md-font-size"], css, css));
  assert.equal(c.verdict, "PASS");
  assert.match(c.subtype, /inert/);
});

/* ───────────────── control 1: double scaling (real, committed) ───────────────── */

test("NEGATIVE 1 — double scaling is RED in leg 1b and invisible in 1a", () => {
  // --ds-button-md-padding-x wired to --ds-spacing-4. Same value, same
  // dimension, byte-identical at rest. But --ds-spacing-4 already carries
  // --ds-density-effective-scale and the skin multiplies by it AGAIN.
  const r = probe(
    ["--ds-button-md-padding-x"],
    `:root { --ds-button-md-padding-x: 1rem; }`,
    `:root { --ds-button-md-padding-x: var(--ds-spacing-4, 1rem); }`,
  );
  const c = only(r);

  // 1a sees nothing. That is the point of the whole exercise.
  assert.equal(c.restEquivalent, true, "rest MUST be equal — otherwise this is not the byte-equivalent case");
  assert.equal(c.before.rest, c.after.rest);

  // 1b sees it.
  assert.equal(c.verdict, "FAIL");
  assert.ok(codes(r).includes("double-scaling"), `expected double-scaling, got ${codes(r)}`);

  const site = c.sites.find((s) => s.prop === "padding-inline");
  const density = site.dials.find((d) => d.dial === "density");
  assert.equal(density.before, 1, "before the edit the dial was applied exactly once");
  assert.equal(density.after, 2, "after the edit it is applied twice");

  const msg = c.findings.find((f) => f.code === "double-scaling").message;
  assert.match(msg, /--ds-density-scale/);
  assert.match(msg, /2 times/);
});

test("NEGATIVE 1b — the exponent is measured, not assumed: k=1.25 gives 1.5625x", () => {
  const { after } = sides({
    before: "",
    after: `:root { --ds-button-md-padding-x: var(--ds-spacing-4, 1rem); }`,
  });
  const site = after.decls.find((d) => d.prop === "padding-inline");
  const resp = measureResponse(site.value, after.env, "--ds-density-scale", [1.25]);
  assert.equal(resp.exponent, 2);
  const [rest, k125] = resp.samples;
  assert.ok(Math.abs(k125.scalar / rest.scalar - 1.5625) < 1e-9, `${k125.scalar} / ${rest.scalar}`);
});

/* ─────────────── control 2: wrong ramp by suffix (real, committed) ─────────────── */

test("NEGATIVE 2 — wrong ramp by suffix is RED in leg 1a", () => {
  // --ds-input-md-font-size is 0.875rem. --ds-font-size-md is 1rem: the
  // component 'md' and the typographic 'md' are not the same axis. The correct
  // pair is --ds-font-size-sm. Pairing by suffix moves 14px to 16px.
  const r = probe(
    ["--ds-input-md-font-size"],
    `:root { --ds-input-md-font-size: 0.875rem; }`,
    `:root { --ds-input-md-font-size: var(--ds-font-size-md, 1rem); }`,
  );
  const c = only(r);
  assert.equal(c.verdict, "FAIL");
  assert.ok(codes(r).includes("rest-shift"), `expected rest-shift, got ${codes(r)}`);
  assert.equal(c.restEquivalent, false);
  assert.equal(c.before.rest, "14px");
  assert.equal(c.after.rest, "16px");
  assert.match(c.restReason, /14px/);
  assert.match(c.restReason, /16px/);
});

test("NEGATIVE 2b — the var() fallback does NOT rescue a wrong ramp", () => {
  // The fallback in `var(--ds-font-size-md, 0.875rem)` never runs: the
  // property IS declared, so the fallback is dead text. Anyone reading the
  // source and seeing the old literal there is being misled.
  const c = only(
    probe(
      ["--ds-input-md-font-size"],
      `:root { --ds-input-md-font-size: 0.875rem; }`,
      `:root { --ds-input-md-font-size: var(--ds-font-size-md, 0.875rem); }`,
    ),
  );
  assert.equal(c.after.rest, "16px", "a declared property never takes its fallback");
  assert.equal(c.verdict, "FAIL");
});

/* ───────────────────── control 3: incompatible CSS type ───────────────────── */

test("NEGATIVE 3 — unitless against rem is RED and the message NAMES the units", () => {
  // line-height: 1.2 is a NUMBER (a ratio). Wiring it to a length is a type
  // error that arithmetic alone would never catch: on 20px text `1.2` is 24px
  // while `1.2rem` is 19.2px, and they can even coincide at one font size.
  const r = probe(
    ["--ds-button-xl-line-height"],
    `:root { --ds-button-xl-line-height: 1.2; }`,
    `:root { --ds-button-xl-line-height: var(--ds-spacing-4, 1rem); }`,
  );
  const c = only(r);
  assert.equal(c.verdict, "FAIL");
  assert.ok(codes(r).includes("rest-shift"));
  assert.equal(c.before.type, "number(unitless)");
  assert.equal(c.after.type, "length(rem)");
  assert.match(c.restReason, /CSS type differs/);
  assert.match(c.restReason, /number/);
  assert.match(c.restReason, /rem/);
});

test("NEGATIVE 3b — bare digits are never enough: 1.5 does not equal 1.5rem", () => {
  const a = evaluate("1.5");
  const b = evaluate("1.5rem");
  const cmp = sameValue(a, b);
  assert.equal(cmp.equal, false);
  assert.match(cmp.reason, /number/);
  assert.match(cmp.reason, /rem/);
  assert.equal(describeType(a), "number(unitless)");
  assert.equal(describeType(b), "length(rem)");
});

test("NEGATIVE 3c — a DIFFERENT ROLE with correct arithmetic is still caught by 1b", () => {
  // --ds-button-xl-line-height: 1.2 -> --ds-line-height-heading. Same number,
  // same type, so 1a is silent and always will be. What 1b shows is that the
  // button's leading now moves with a dial that belongs to headings.
  const c = only(
    probe(
      ["--ds-button-xl-line-height"],
      `:root { --ds-button-xl-line-height: 1.2; }`,
      `:root { --ds-button-xl-line-height: var(--ds-line-height-heading, 1.2); }`,
    ),
  );
  assert.equal(c.restEquivalent, true, "1a cannot see this one, by construction");
  // The coupling is visible as a changed provenance, not as a changed number.
  assert.match(c.after.raw, /--ds-line-height-heading/);
  assert.doesNotMatch(c.before.raw ?? "", /--ds-line-height-heading/);
  // Honest limit, asserted so it cannot rot into a false claim: with the
  // heading ramp itself a constant, NO probed dial separates the two. The
  // report must say so rather than call this a PASS on the merits.
  assert.deepEqual(
    c.channelDials.map((d) => d.after),
    [0, 0, 0],
  );
});

/* ─────────────────────────── control 4: planted cycle ─────────────────────────── */

test("NEGATIVE 4 — a planted cycle is RED, detected as invalid-at-computed-value-time", () => {
  const r = probe(
    ["--ds-button-md-padding-x"],
    `:root { --ds-button-md-padding-x: 1rem; }`,
    `:root {
       --ds-button-md-padding-x: var(--ds-loop-a, 1rem);
       --ds-loop-a: var(--ds-loop-b);
       --ds-loop-b: var(--ds-loop-a);
     }`,
  );
  const c = only(r);
  assert.equal(c.verdict, "FAIL");
  assert.ok(codes(r).includes("cycle"), `expected cycle, got ${codes(r)}`);
  const msg = c.findings.find((f) => f.code === "cycle").message;
  assert.match(msg, /guaranteed-invalid|invalid/i);
  assert.match(msg, /''|empty/);

  // THE DETECTION RULE, stated precisely, because getting it backwards is easy.
  // A cyclic custom property computes to the guaranteed-invalid value, and a
  // var() reference to a guaranteed-invalid property DOES take its fallback.
  // So the referencing channel resolves to 16px and looks perfectly healthy:
  const referencing = only(
    probe(
      ["--ds-button-md-padding-x"],
      `:root { --ds-button-md-padding-x: 1rem; }`,
      `:root {
         --ds-button-md-padding-x: var(--ds-loop-a, 1rem);
         --ds-loop-a: var(--ds-loop-b);
         --ds-loop-b: var(--ds-loop-a);
       }`,
    ),
  );
  assert.equal(referencing.after.rest, "16px", "the fallback IS taken — a cycle is not detectable by its absence");
  // The cycle is caught at the CYCLIC property itself, which computes to
  // nothing at all despite being declared. That is the detector.
  const loop = only(
    probe(
      ["--ds-loop-a"],
      `:root { --ds-loop-a: 1rem; }`,
      `:root { --ds-loop-a: var(--ds-loop-b); --ds-loop-b: var(--ds-loop-a); }`,
    ),
  );
  assert.equal(loop.verdict, "FAIL");
  assert.ok(loop.findings.some((f) => f.code === "cycle"));
  assert.match(loop.after.rest, /invalid/);
});

test("NEGATIVE 4b — the evaluator reproduces Chromium: cycle is empty, undeclared falls back", () => {
  const env = new Map([
    ["--a", "var(--b)"],
    ["--b", "var(--a)"],
  ]);
  const cycled = expandVars("var(--a, 7px)", env);
  assert.ok(cycled.cycles.length > 0, "the cycle must be reported");
  // Verified in Chromium 149 on 2026-08-18: getPropertyValue('--a') === ''
  // while the declaration is present, and var(--a, 7px) DOES take 7px.
  assert.equal(evaluate(cycled.text).kind, "length");
  const undeclared = expandVars("var(--nope, 9px)", new Map());
  assert.equal(undeclared.cycles.length, 0, "an undeclared property is not a cycle");
  assert.deepEqual(undeclared.undeclared, ["--nope"]);
});

/* ──────────────────────── control 5: planted artifact mask ──────────────────────── */

test("NEGATIVE 5 — a channel redeclared in an artifact is MASKED, never PASS", () => {
  const dir = mkdtempSync(join(tmpdir(), "cp-art-"));
  mkdirSync(join(dir, "acme"), { recursive: true });
  writeFileSync(
    join(dir, "acme/index.css"),
    `:is(html[data-tenant='acme']) {\n  --ds-button-md-font-size: 13px;\n}\n`,
  );

  const r = probe(
    ["--ds-button-md-font-size"],
    `:root { --ds-button-md-font-size: 0.875rem; }`,
    `:root { --ds-button-md-font-size: var(--ds-font-size-sm, 0.875rem); }`,
    { tenants: ["acme"], artifactOptions: { artifactDir: dir } },
  );
  const c = only(r);

  assert.equal(c.verdict, "MASKED", "MASKED is a third state; folding it into PASS is the headline false green");
  assert.notEqual(c.verdict, "PASS");
  assert.equal(c.findings.filter((f) => f.severity === "fail").length, 0, "the EDIT is correct — only its delivery fails");
  assert.equal(c.maskedIn.length, 1);
  assert.equal(c.maskedIn[0].tenant, "acme");
  assert.equal(c.maskedIn[0].value, "13px");
  assert.match(c.subtype, /dead paint/);
});

test("NEGATIVE 5b — the same channel with no artifact redeclaration is PASS", () => {
  const dir = mkdtempSync(join(tmpdir(), "cp-art2-"));
  mkdirSync(join(dir, "acme"), { recursive: true });
  writeFileSync(join(dir, "acme/index.css"), `:root { --ds-unrelated: 1px; }\n`);
  const c = only(
    probe(
      ["--ds-button-md-font-size"],
      `:root { --ds-button-md-font-size: 0.875rem; }`,
      `:root { --ds-button-md-font-size: var(--ds-font-size-sm, 0.875rem); }`,
      { tenants: ["acme"], artifactOptions: { artifactDir: dir } },
    ),
  );
  assert.equal(c.verdict, "PASS");
  assert.equal(c.maskedIn.length, 0);
});

/* ─────────── control 7: undeclared vs OUT-OF-GRAPH, which are NOT the same ───────────
 *
 * Leg 1 says `undeclared` whenever the probed entrypoint's root environment
 * has no declaration. That sentence is true of two opposite situations, and
 * collapsing them cost this programme seven false FAILs on the `--ds-collapse-*`
 * matrix: those channels are declared at :root in
 * presentation/components/collapse.css, which no entrypoint imported until
 * WO-CAN-03 wired it into `base`. The controls below plant BOTH situations
 * against the SAME probed side, so any future change that merges the two
 * verdicts goes red.
 */

/** A side where the channel is read but nothing declares it. */
function undeclaredResults(channels) {
  const css = `:root { --ds-unrelated: 1px; }`;
  const r = probe(channels, css, css, {
    siteFilter: null,
  });
  for (const x of r.results) {
    assert.equal(x.verdict, "FAIL", `${x.channel} must start as FAIL/undeclared`);
    assert.ok(x.findings.some((f) => f.severity === "fail" && f.code === "undeclared"));
  }
  return r;
}

test("NEGATIVE 7 — declared-but-outside-the-graph is OUT-OF-GRAPH, never FAIL", () => {
  const leg1 = undeclaredResults(["--ds-collapse-root-ghost-idle-border-width"]);
  const rel = "packages/core/src/foundation/tokens/css/presentation/components/collapse.css";
  const ledger = reclassifyOutOfGraph({
    leg1,
    entry: "base",
    probedFiles: ["packages/core/src/foundation/tokens/css/facade/entrypoints/base.css"],
    declarations: new Map([
      [
        "--ds-collapse-root-ghost-idle-border-width",
        [{ rel, line: 42, selector: ":root", value: "var(--ds-border-width-0, 0)", rootScope: true }],
      ],
    ]),
    reach: new Map([[rel, ["styles"]]]),
  });

  const c = only(leg1);
  assert.equal(c.verdict, OUT_OF_GRAPH);
  assert.notEqual(c.verdict, "FAIL", "a channel that IS declared is not a defect of the rewiring");
  assert.equal(
    c.findings.filter((f) => f.severity === "fail").length,
    0,
    "OUT-OF-GRAPH must carry no fail-severity finding, or it still poisons the exit code",
  );
  // The verdict has to CARRY ITS EVIDENCE: where it is declared, which
  // entrypoint was probed, and which one would cover it.
  assert.equal(ledger.length, 1);
  assert.match(ledger[0].message, /collapse\.css:42/);
  assert.match(ledger[0].message, /entrypoint "base" does not import/);
  assert.match(ledger[0].message, /--entry styles/);
  assert.deepEqual(ledger[0].reachedBy, ["styles"]);
  assert.match(c.subtype, /outside the "base" import graph/);
});

test("NEGATIVE 7b — a channel declared NOWHERE stays FAIL/undeclared", () => {
  const leg1 = undeclaredResults(["--ds-ghost-nowhere-width"]);
  const ledger = reclassifyOutOfGraph({
    leg1,
    entry: "base",
    probedFiles: [],
    declarations: new Map(), // the tree scan found nothing, because there is nothing
    reach: new Map(),
  });
  const c = only(leg1);
  assert.equal(c.verdict, "FAIL", "no declaration anywhere is a REAL defect and must keep failing");
  assert.equal(ledger.length, 0);
  assert.ok(c.findings.some((f) => f.severity === "fail" && f.code === "undeclared"));
});

test("NEGATIVE 7c — the two cases are adjudicated SEPARATELY in one run", () => {
  // The regression this pins: any implementation that answers the question
  // once for the whole set — all FAIL, or all OUT-OF-GRAPH — fails here.
  const leg1 = undeclaredResults(["--ds-collapse-root-ghost-idle-border-width", "--ds-ghost-nowhere-width"]);
  const rel = "css/presentation/components/collapse.css";
  reclassifyOutOfGraph({
    leg1,
    entry: "base",
    probedFiles: ["css/facade/entrypoints/base.css"],
    declarations: new Map([
      ["--ds-collapse-root-ghost-idle-border-width", [{ rel, line: 42, selector: ":root", value: "0", rootScope: true }]],
    ]),
    reach: new Map([[rel, ["styles"]]]),
  });
  const byChannel = new Map(leg1.results.map((r) => [r.channel, r.verdict]));
  assert.equal(byChannel.get("--ds-collapse-root-ghost-idle-border-width"), OUT_OF_GRAPH);
  assert.equal(byChannel.get("--ds-ghost-nowhere-width"), "FAIL");
  assert.notEqual(
    byChannel.get("--ds-collapse-root-ghost-idle-border-width"),
    byChannel.get("--ds-ghost-nowhere-width"),
    "these two are different facts and must never share one verdict",
  );
});

test("NEGATIVE 7d — a NON-root-scope declaration does not buy an OUT-OF-GRAPH", () => {
  const leg1 = undeclaredResults(["--ds-ghost-scoped-width"]);
  reclassifyOutOfGraph({
    leg1,
    entry: "base",
    probedFiles: [],
    declarations: new Map([
      ["--ds-ghost-scoped-width", [{ rel: "x.css", line: 3, selector: ".card", value: "1px", rootScope: false }]],
    ]),
    reach: new Map([["x.css", ["styles"]]]),
  });
  assert.equal(only(leg1).verdict, "FAIL", "a .card-scoped declaration is not a root declaration");
});

test("NEGATIVE 7e — a declaration in a file the entrypoint DID import stays FAIL", () => {
  // If the probed sheet contains the declaring file and the root environment
  // still has nothing, the explanation is NOT coverage. Reclassifying here
  // would launder a genuine defect.
  const leg1 = undeclaredResults(["--ds-ghost-inside-width"]);
  reclassifyOutOfGraph({
    leg1,
    entry: "base",
    probedFiles: ["inside.css"],
    declarations: new Map([
      ["--ds-ghost-inside-width", [{ rel: "inside.css", line: 9, selector: ":root", value: "1px", rootScope: true }]],
    ]),
    reach: new Map([["inside.css", ["base"]]]),
  });
  assert.equal(only(leg1).verdict, "FAIL");
});

test("NEGATIVE 7f — a channel that ALSO cycles keeps its FAIL, declared elsewhere or not", () => {
  const r = probe(
    ["--ds-button-md-font-size"],
    `:root { --ds-button-md-font-size: 0.875rem; }`,
    `:root { --ds-button-md-font-size: var(--ds-loop-a); --ds-loop-a: var(--ds-button-md-font-size); }`,
  );
  const before = only(r).verdict;
  reclassifyOutOfGraph({
    leg1: r,
    entry: "base",
    probedFiles: [],
    declarations: new Map([
      ["--ds-button-md-font-size", [{ rel: "elsewhere.css", line: 1, selector: ":root", value: "1px", rootScope: true }]],
    ]),
    reach: new Map(),
  });
  assert.equal(before, "FAIL");
  assert.equal(only(r).verdict, "FAIL", "the coverage hole must not absorb an unrelated failure");
});

test("OUT-OF-GRAPH is a coverage hole: it never returns exit 0, and never returns exit 1", () => {
  assert.equal(exitCodeFor({ PASS: 5, FAIL: 0, MASKED: 0, [OUT_OF_GRAPH]: 0 }), 0);
  assert.equal(exitCodeFor({ PASS: 5, FAIL: 0, MASKED: 0, [OUT_OF_GRAPH]: 1 }), 2, "not verified is not green");
  assert.equal(exitCodeFor({ PASS: 5, FAIL: 0, MASKED: 1, [OUT_OF_GRAPH]: 0 }), 2);
  assert.equal(
    exitCodeFor({ PASS: 5, FAIL: 1, MASKED: 0, [OUT_OF_GRAPH]: 9 }),
    1,
    "a real FAIL always wins the exit code",
  );
});

test("tree scan finds root declarations, records scope, and recurses", () => {
  const dir = mkdtempSync(join(tmpdir(), "cp-tree-"));
  mkdirSync(join(dir, "presentation/components"), { recursive: true });
  writeFileSync(
    join(dir, "presentation/components/collapse.css"),
    `:root {\n  --ds-x-width: var(--ds-border-width-0, 0);\n}\n.card {\n  --ds-y-width: 1px;\n}\n`,
  );
  const found = findTreeDeclarations(["--ds-x-width", "--ds-y-width", "--ds-absent"], { cssRoot: dir, cwd: dir });
  assert.equal(found.get("--ds-x-width")[0].rootScope, true);
  assert.equal(found.get("--ds-x-width")[0].line, 2);
  assert.equal(found.get("--ds-y-width")[0].rootScope, false, "a .card block is not the root environment");
  assert.equal(found.has("--ds-absent"), false, "the scan must never invent a declaration");
});

test("entrypoint reach is measured on the real import graph, not assumed", () => {
  // This assertion used to encode the DEFECT as the expectation: the collapse
  // token sheet reached the retired `styles` entrypoint and NOT `base`, so the
  // bridge shipped in every bundle reading channels with no producer. It now
  // pins the repair.
  const rel = "packages/core/src/foundation/tokens/css/presentation/components/collapse/index.css";
  const reach = entrypointsReaching([rel]);
  assert.deepEqual(reach.get(rel), ["base"], "base is the one entrypoint, and it imports the collapse token sheet");
});

test("--entry accepts every entrypoint the probe can recommend", () => {
  assert.match(resolveEntry("base"), /facade\/entrypoints\/base\/index\.css$/);
  assert.equal(resolveEntry("styles"), "styles", "the retired styles entrypoint no longer resolves");
  assert.equal(resolveEntry("not-an-entrypoint"), "not-an-entrypoint");
});

/* ─────────────────── parser: the 446-channel lesson, as a test ─────────────────── */

test("parser: a declaration spanning five physical lines is ONE declaration", () => {
  const css = `:root {
  --ds-density-effective-scale: clamp(
    0.5,
    calc(var(--a, 1) * var(--b, 1)),
    3
  );
  --after: 2px;
}`;
  const { declarations } = parseStylesheet(css, "t.css");
  assert.equal(declarations.length, 2);
  assert.equal(declarations[0].prop, "--ds-density-effective-scale");
  assert.match(declarations[0].value, /clamp\(/);
  assert.equal(declarations[1].prop, "--after");
});

test("parser: line numbers survive comment stripping and stay 1-based-exact", () => {
  const css = ["/* a", "   multi-line", "   comment */", ":root {", "  --x: 1px;", "}"].join("\n");
  assert.equal(stripComments(css).split("\n").length, css.split("\n").length);
  const { declarations } = parseStylesheet(css, "t.css");
  assert.equal(declarations[0].line, 5);
});

test("parser: a semicolon inside url() or a string does not end the declaration", () => {
  const { declarations } = parseStylesheet(
    `:root { --img: url("a;b.png"); --q: "x;y"; }`,
    "t.css",
  );
  assert.deepEqual(declarations.map((d) => d.prop), ["--img", "--q"]);
});

test("parser: top-level split and var enumeration are paren-aware", () => {
  assert.deepEqual(
    splitTopLevel("--a, var(--b, 1px)").map((s) => s.trim()),
    ["--a", "var(--b, 1px)"],
  );
  assert.deepEqual(varReferences("calc(var(--a) * var(--b, var(--c)))"), ["--a", "--b", "--c"]);
});

test("parser: an unlayered file is distinguishable from a layered one", () => {
  const side = sideFromSources([
    { rel: "layered.css", layer: "components", text: `:root { --x: 1px; }` },
    { rel: "artifact.css", layer: null, text: `:root { --x: 2px; }` },
  ]);
  // unlayered outranks every layer, regardless of document order
  assert.equal(side.env.get("--x"), "2px");
  assert.equal(side.winner.get("--x").rel, "artifact.css");
});

/* ───────────────────────────── CLI surface ───────────────────────────── */

test("CLI: arguments parse, including the bare --ds- shorthand", () => {
  const o = parseArgs(["--channel", "--ds-a", "--ds-b", "--family", "button", "--leg2", "--baseline", "HEAD~1"]);
  assert.deepEqual(o.channels, ["--ds-a", "--ds-b"]);
  assert.deepEqual(o.families, ["button"]);
  assert.equal(o.leg2, true);
  assert.equal(o.baseline, "HEAD~1");
  assert.throws(() => parseArgs(["--nope"]), /unknown argument/);
});

test("CLI: familyChannels reads a real family and returns only custom properties", () => {
  const chans = familyChannels("button");
  assert.ok(chans.length > 0);
  assert.ok(chans.every((c) => c.startsWith("--")));
  assert.ok(chans.includes("--ds-button-md-padding-x"));
});

test("CLI: changedChannels parses whole files, so multi-line edits cannot be lost", () => {
  const r = changedChannels({ baseline: "1d474eefe" });
  assert.ok(Array.isArray(r.channels));
  assert.ok(Array.isArray(r.files));
  // A diff-line scanner would report channels it saw on a '+' line. This one
  // reports channels whose PARSED value differs, so the two sets can only be
  // compared honestly if every reported name is really declared somewhere.
  assert.ok(r.channels.every((c) => c.startsWith("--")));
});

/* ─────────────────────── leg 2: real Chromium, or loud skip ─────────────────────── */

const CHROMIUM = findChromium();

test("leg 2: selector synthesis refuses what it cannot build, and says why", () => {
  const ok = synthesiseElement(".rottay-button[data-size='md']:not([data-size-responsive])");
  assert.equal(ok.supported, true);
  assert.deepEqual(ok.classes, ["rottay-button"]);
  assert.deepEqual(ok.attrs, { "data-size": "md" });

  // Combinators are BUILT, not refused: the ancestors/siblings the selector
  // demands are synthesised so the declaration is really measured.
  const nested = synthesiseElement(".ds-toggle.ds-toggle--modern [data-part='description']");
  assert.equal(nested.supported, true);
  assert.equal(nested.chain.length, 2);
  assert.deepEqual(nested.chain[1].attrs, { "data-part": "description" });
  assert.equal(nested.chain[1].combinator, " ");

  // html/body are singletons and become requirements on the real document
  // element rather than clones, which the HTML parser would silently drop.
  const rooted = synthesiseElement("html[data-tenant] .ant-tag");
  assert.equal(rooted.supported, true);
  assert.deepEqual(rooted.roots, [{ target: "html", classes: [], attrs: { "data-tenant": "" } }]);
  assert.equal(rooted.chain.length, 1);

  // What genuinely cannot be built is refused WITH a reason, never faked.
  for (const bad of [
    "li:nth-child(2)",
    ".x input:focus-visible ~ [data-part='track']",
    ":root",
  ]) {
    const r = synthesiseElement(bad);
    assert.equal(r.supported, false, bad);
    assert.ok(r.reason, `${bad} must carry a reason`);
  }
});

test(
  "leg 2: real Chromium reproduces double scaling, IACVT and portal freeze",
  { skip: CHROMIUM ? false : "no Chromium binary installed — leg 2 CANNOT run, and a skip is not a pass" },
  () => {
    const css = `
@layer theme, components;
@layer theme {
  :root {
    --ds-density-effective-scale: clamp(0.5, calc(var(--ds-density-scale, 1) * 1), 3);
    --ds-spacing-4: calc(1rem * var(--ds-density-effective-scale, 1));
    --bad-padding-x: var(--ds-spacing-4, 1rem);
    --good-padding-x: 1rem;
    --cyc-a: var(--cyc-b);
    --cyc-b: var(--cyc-a);
  }
}
@layer components {
  .bad { padding-inline: calc(var(--bad-padding-x) * var(--ds-density-effective-scale)); }
  .good { padding-inline: calc(var(--good-padding-x) * var(--ds-density-effective-scale)); }
  .cyc { font-size: var(--cyc-a, 13px); }
}
:root { --ds-density-scale: 1; }
`;
    const probes = ["bad", "good", "cyc"].map((n) => ({
      id: n,
      element: synthesiseElement(`.${n}`),
      longhands: [n === "cyc" ? "font-size" : "padding-left"],
      channels: [n === "cyc" ? "--cyc-a" : `--${n}-padding-x`],
    }));
    const html = buildFixture({
      css,
      tenant: null,
      probes,
      perturbations: [{ id: "density@1.25", decls: { "--ds-density-scale": "1.25" } }],
      portal: true,
    });
    const { measurement } = runFixture({ css, html, binary: CHROMIUM });

    const px = (m, id, lh) => parseFloat(m[id].longhands[lh]);
    const restBad = px(measurement.rest, "bad", "padding-left");
    const kBad = px(measurement.perturbed["density@1.25"], "bad", "padding-left");
    const restGood = px(measurement.rest, "good", "padding-left");
    const kGood = px(measurement.perturbed["density@1.25"], "good", "padding-left");

    // byte-equivalent at rest: this is exactly why a capture is blind
    assert.equal(restBad, restGood, "the defect is invisible at rest, in a real browser");
    // and separable under the dial
    assert.ok(Math.abs(kGood / restGood - 1.25) < 0.01, `good: ${kGood}/${restGood}`);
    assert.ok(Math.abs(kBad / restBad - 1.5625) < 0.02, `bad: ${kBad}/${restBad}`);

    // IACVT: declared, yet the computed custom property is the empty string,
    // while a reference to it DOES take the fallback.
    assert.equal(measurement.rest.cyc.channels["--cyc-a"], "");
    assert.equal(px(measurement.rest, "cyc", "font-size"), 13);

    // Portal freeze: the wrapper stamps resolved --ds-* inline, so the dial
    // stops propagating into the subtree.
    assert.ok(measurement.portal.stampedCustomProperties > 0);
    assert.equal(
      px(measurement.portal.afterDial, "good", "padding-left"),
      px(measurement.portal.rest, "good", "padding-left"),
      "inside a portal the dial must be observed NOT to move — that is the freeze",
    );
  },
);

test("leg 2: absence of a binary is reported, never silently treated as green", () => {
  // findChromium returning null must be handled by the caller as NOT RUN.
  // This asserts the contract exists rather than the environment's state.
  assert.ok(CHROMIUM === null || typeof CHROMIUM === "string");
  if (CHROMIUM === null) assert.fail("expected a binary in this environment; see runLeg2's NOT RUN branch");
});

/* ────────────────────────────────────────────────────────────────────────────
 * NEGATIVE CONTROL 6 — A DIAL-SCALED ROOT FONT-SIZE MAKES `rem` A DIAL.
 *
 * This is the control for a blindness that was REAL in this probe, not a
 * hypothetical: leg 1 hardcoded `rem = 16px`, and with that assumption it
 * rated a genuine double scaling as clean while leg 2 called it red. The
 * sheet declares `html[data-tenant] { font-size: var(--ds-font-size-base) }`
 * with `--ds-font-size-base: calc(0.9375rem * var(--ds-type-scale))`, so
 * `rem` itself carries the type dial. A token that is BOTH rem-valued AND
 * multiplied by the same dial receives it twice.
 *
 * The control has to prove three things at once, because any one of them
 * alone is satisfiable by a probe that is simply broken:
 *   • the rem base is derived, not assumed (15px, not 16px);
 *   • the rewired value reports exponent 2 — the defect;
 *   • the literal it replaced reports exponent 1 — so the 2 is attributable
 *     to the rewiring and is not just "rem moves".
 * ──────────────────────────────────────────────────────────────────────────── */
test("NEGATIVE 6: a type-scaled root font-size turns a rem token into a double scaling", () => {
  const side = sideFromSources(
    [
      {
        rel: "theme.css",
        layer: "rottay-tokens",
        text: `:root {
  --ds-font-size-base-base: 0.9375rem;
  --ds-font-size-base: calc(var(--ds-font-size-base-base) * var(--ds-type-scale, 1));
  --ds-font-size-sm: calc(0.875rem * var(--ds-type-scale, 1));
}`,
      },
      {
        rel: "root-fs.css",
        layer: "rottay-tokens",
        text: `html[data-tenant] { font-size: var(--ds-font-size-base); }`,
      },
    ],
    ["rottay-tokens"],
  );

  const found = rootFontSizeExpression(side.decls);
  assert.equal(found.value, "var(--ds-font-size-base)");
  assert.equal(found.selector, "html[data-tenant]");

  // Derived, not assumed: 0.9375 x 16 = 15.
  assert.equal(evalIn("1rem", side.env, null, side.rootFontSize).value.px, 15);

  const exp = (v) =>
    measureResponse(v, side.env, "--ds-type-scale", [1.25, 1.5], side.rootFontSize).exponent;

  assert.equal(exp("var(--ds-font-size-sm)"), 2, "rewired to the ramp: the dial lands twice");
  assert.equal(exp("0.875rem"), 1, "the literal it replaced: the dial lands once, through rem only");
  assert.equal(exp("12px"), 0, "a px literal is untouched by the type dial");

  // And the blindness itself: with the rem base pinned at 16 the SAME value
  // reports a clean exponent of 1. This asserts the old behaviour so nobody
  // can reintroduce the hardcode and still see green.
  const blind = sideFromSources(
    [{ rel: "theme.css", layer: "rottay-tokens", text: `:root { --ds-font-size-sm: calc(0.875rem * var(--ds-type-scale, 1)); }` }],
    ["rottay-tokens"],
  );
  assert.equal(blind.rootFontSize, null, "no root font-size declared -> CSS initial 16px");
  assert.equal(
    measureResponse("var(--ds-font-size-sm)", blind.env, "--ds-type-scale", [1.25, 1.5], null).exponent,
    1,
    "with a constant rem base the same value is a single application — this is what made the defect invisible",
  );
});

test("NEGATIVE 6b: a constant root font-size must NOT manufacture a false double scaling", () => {
  // The mirror control. A probe that reported 2 whenever a root font-size
  // exists would be just as useless as one that never reported 2.
  const side = sideFromSources(
    [
      {
        rel: "theme.css",
        layer: "rottay-tokens",
        text: `:root {
  --ds-font-size-sm: calc(0.875rem * var(--ds-type-scale, 1));
}`,
      },
      { rel: "root-fs.css", layer: "rottay-tokens", text: `html { font-size: 16px; }` },
    ],
    ["rottay-tokens"],
  );
  assert.equal(side.rootFontSize.value, "16px");
  assert.equal(evalIn("1rem", side.env, null, side.rootFontSize).value.px, 16);
  assert.equal(
    measureResponse("var(--ds-font-size-sm)", side.env, "--ds-type-scale", [1.25, 1.5], side.rootFontSize)
      .exponent,
    1,
    "the dial is applied exactly once when rem does not carry it",
  );
});

test("root font-size detection refuses descendant selectors", () => {
  // `html .thing { font-size }` is not the root font-size. Admitting it would
  // silently rebase every rem in the sheet against an unrelated element.
  const side = sideFromSources(
    [{ rel: "a.css", layer: "base", text: `html .content { font-size: 40px; }\nbody { font-size: 32px; }` }],
    ["base"],
  );
  assert.equal(side.rootFontSize, null);
  assert.equal(evalIn("1rem", side.env, null, side.rootFontSize).value.px, 16);
});
