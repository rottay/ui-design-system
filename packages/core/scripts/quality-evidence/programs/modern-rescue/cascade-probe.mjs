#!/usr/bin/env node
/**
 * cascade-probe.mjs — verification for BYTE-EQUIVALENT rewirings.
 *
 * THE PROBLEM THIS EXISTS FOR. When a pinned literal is rewired to hang off a
 * theme root, the rewriting is byte-equivalent while every dial sits at its
 * default. A visual capture of that change is not weak, it is BLIND: at rest
 * the correct wiring and the wrong one paint the same pixels. What a capture
 * cannot see is the wrong ramp, the dead dial, the double scaling, the channel
 * masked by an unlayered tenant artifact, and the value frozen inside a portal.
 *
 * TWO LEGS, cheap one first.
 *
 *   LEG 1 (symbolic, no browser) answers two questions per channel:
 *     1a REST EQUIVALENCE — the value evaluated with all dials at default,
 *        before and after. Compared as TYPED quantities, never as text and
 *        never as bare numbers: `1.5` and `1.5rem` are different CSS types and
 *        a type mismatch is a FAILURE, not a match.
 *     1b THE DERIVATIVE — perturb ONE dial and require the value to move by
 *        exactly the expected law. Measured as an exponent at two independent
 *        factors. e=1 is one application, e=2 is the dial applied twice, which
 *        is the double-scaling defect and is invisible at rest by construction.
 *
 *   LEG 2 (real Chromium) answers only what leg 1 cannot decide: cascade
 *   order, @layer, specificity, the unlayered artifact mask, portal freeze. It
 *   reads RENDERED LONGHANDS in px, never custom properties.
 *
 * FOUR VERDICTS. PASS, FAIL, MASKED, and OUT-OF-GRAPH. MASKED is not a shade
 * of PASS: the edit is correct and does not arrive, because a tenant artifact
 * redeclares the channel outside every layer. Reporting MASKED as PASS is the
 * single worst false green available here, so it has its own state.
 *
 * OUT-OF-GRAPH is the mirror mistake, and it was a real one: leg 1 resolves a
 * channel against ONE entrypoint's import graph, so a channel it cannot find
 * has two completely different explanations that must never share a verdict.
 *   - `undeclared` (FAIL): no declaration exists anywhere in the CSS tree. The
 *     channel is a reference into nothing. Real defect.
 *   - OUT-OF-GRAPH (not FAIL): the declaration EXISTS, at a named file:line,
 *     in a file the probed entrypoint does not import. Nothing about the
 *     rewiring is wrong; this run simply never evaluated it. Calling that FAIL
 *     is noise that buries real defects, and it slanders correct work.
 * OUT-OF-GRAPH is a COVERAGE HOLE, not a green: the channel was not verified.
 * It therefore never returns exit 0 on its own.
 *
 * USAGE
 *   node cascade-probe.mjs --channel --ds-button-md-padding-x [--channel ...]
 *   node cascade-probe.mjs --family button
 *   node cascade-probe.mjs --changed            # every channel edited vs baseline
 *   node cascade-probe.mjs --changed --leg2     # add the Chromium leg
 *
 * OPTIONS
 *   --baseline <rev>   revision to compare against (default 1d474eefe)
 *   --entry <name>     base | rottay | bithire | evnto (default base)
 *   --leg2             run the Chromium leg on channels with reading sites
 *   --tenant <name>    tenant entrypoint for leg 2 (default rottay)
 *   --json <path>      write the full machine-readable result
 *   --quiet            verdict lines only
 *
 * EXIT CODES: 0 all PASS; 1 at least one FAIL; 2 no FAIL but at least one
 * MASKED or OUT-OF-GRAPH (signal: something was not delivered, or not
 * measured); 3 the probe itself could not run.
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

import {
  CSS_ROOT,
  REPO_ROOT,
  buildSheet,
  isConditional,
  isRootEquivalent,
  makeReader,
} from "./probe/css-model.mjs";
import { parseStylesheet } from "./probe/css-parse.mjs";
import { DEFAULT_DIALS, analyse, loadSide } from "./probe/leg1-symbolic.mjs";
import {
  buildFixture,
  findChromium,
  inlineSheet,
  runFixture,
  synthesiseElement,
} from "./probe/leg2-chromium.mjs";

export const DEFAULT_BASELINE = "1d474eefe";
const COMPONENTS_DIR = join(CSS_ROOT, "presentation/components");
const ENTRYPOINT_DIR = join(CSS_ROOT, "facade/entrypoints");
export const OUT_OF_GRAPH = "OUT-OF-GRAPH";
export const VERDICTS = ["PASS", "FAIL", "MASKED", OUT_OF_GRAPH];

export function parseArgs(argv) {
  const out = {
    channels: [],
    families: [],
    changed: false,
    baseline: DEFAULT_BASELINE,
    entry: "base",
    leg2: false,
    tenant: "rottay",
    json: null,
    quiet: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    const next = () => argv[(i += 1)];
    if (a === "--channel") out.channels.push(next());
    else if (a === "--family") out.families.push(next());
    else if (a === "--changed") out.changed = true;
    else if (a === "--baseline") out.baseline = next();
    else if (a === "--entry") out.entry = next();
    else if (a === "--leg2") out.leg2 = true;
    else if (a === "--tenant") out.tenant = next();
    else if (a === "--json") out.json = next();
    else if (a === "--quiet") out.quiet = true;
    else if (a.startsWith("--ds-")) out.channels.push(a);
    else throw new Error(`unknown argument: ${a}`);
  }
  return out;
}

/**
 * Resolve `--entry <name>` against the entrypoint directory rather than a
 * hardcoded list of four. Naming an uncovered entrypoint in an OUT-OF-GRAPH
 * message is only honest if that name is actually runnable, and
 * `facade/entrypoints/styles.css` — the one file that imports the
 * presentation components — was not in the list. `base`/`rottay`/`bithire`/
 * `evnto` resolve to exactly the same paths as before.
 */
export function resolveEntry(entry, { dir = ENTRYPOINT_DIR } = {}) {
  if (!entry || entry.includes("/") || entry.includes("\\")) return entry;
  const cand = join(dir, `${entry}.css`);
  try {
    readFileSync(cand);
    return cand;
  } catch {
    return entry;
  }
}

/** Every custom property declared by a family's component stylesheet. */
export function familyChannels(family, dir = COMPONENTS_DIR) {
  const abs = join(dir, `${family}.css`);
  const parsed = parseStylesheet(readFileSync(abs, "utf8"), abs);
  const names = new Set();
  for (const d of parsed.declarations) if (d.prop.startsWith("--")) names.add(d.prop);
  return [...names].sort();
}

/**
 * Channels whose declared VALUE differs between the baseline and the working
 * tree. Derived by parsing both whole files with the balanced-paren parser —
 * NOT by reading `+`/`-` lines out of a diff, which would lose every
 * declaration that spans more than one line (6.1% of this corpus, and a
 * line-oriented scanner has already cost this programme 446 channels once).
 */
export function changedChannels({ baseline, cwd = REPO_ROOT }) {
  const listed = execFileSync(
    "git",
    ["diff", "--name-only", baseline, "--", "packages/core/src/foundation/tokens/css/"],
    { cwd, encoding: "utf8" },
  )
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const channels = new Set();
  const perFile = [];
  const unreadable = [];
  for (const rel of listed) {
    const abs = join(cwd, rel);
    let afterText = null;
    let beforeText = null;
    try {
      afterText = readFileSync(abs, "utf8");
    } catch {
      afterText = null;
    }
    try {
      beforeText = execFileSync("git", ["show", `${baseline}:${rel}`], {
        cwd,
        encoding: "utf8",
        maxBuffer: 64 * 1024 * 1024,
        stdio: ["ignore", "pipe", "pipe"],
      });
    } catch {
      beforeText = null;
    }
    if (afterText === null && beforeText === null) {
      unreadable.push(rel);
      continue;
    }
    const mapOf = (text) => {
      const m = new Map();
      if (text === null) return m;
      for (const d of parseStylesheet(text, rel).declarations) {
        if (d.prop.startsWith("--")) m.set(d.prop, d.value.replace(/\s+/g, " ").trim());
      }
      return m;
    };
    const b = mapOf(beforeText);
    const a = mapOf(afterText);
    const hits = [];
    for (const [name, val] of a) {
      if (b.get(name) !== val) {
        channels.add(name);
        hits.push(name);
      }
    }
    for (const name of b.keys()) {
      if (!a.has(name)) {
        channels.add(name);
        hits.push(name);
      }
    }
    if (hits.length) perFile.push({ file: rel, count: hits.length });
  }
  return { channels: [...channels].sort(), files: listed, perFile, unreadable };
}

/** Digest of the live tree, so a run against a moving worktree is reproducible. */
export function treeDigest(files, cwd = REPO_ROOT) {
  const h = createHash("sha256");
  for (const rel of [...files].sort()) {
    h.update(rel);
    try {
      h.update(readFileSync(join(cwd, rel)));
    } catch {
      h.update("<absent>");
    }
  }
  return h.digest("hex").slice(0, 16);
}

/* ─────────────────────── OUT-OF-GRAPH adjudication ───────────────────────
 *
 * Leg 1's `undeclared` finding means one thing precisely: "the root
 * environment assembled from THIS entrypoint carries no declaration". That is
 * a statement about the probed graph, not about the repository. Two different
 * worlds satisfy it, and they deserve opposite verdicts:
 *
 *   (a) nothing declares the channel anywhere    -> undeclared, FAIL, real
 *   (b) something declares it in a file this     -> OUT-OF-GRAPH, not a FAIL,
 *       entrypoint never imports                    a hole in the coverage
 *
 * Case (b) is not hypothetical: `presentation/components/collapse.css` is
 * imported by `facade/entrypoints/styles.css` alone, so every `--ds-collapse-*`
 * root declaration is invisible to `--entry base` while being perfectly
 * present in the tree. Emitting FAIL there is noise on top of correct work.
 *
 * The distinction is decided by evidence, never by a name pattern: the tree is
 * scanned for a ROOT-SCOPE declaration (the same admission rule the root
 * environment uses — root-equivalent selector, no conditional at-rule), and
 * the declaring file must be absent from the probed sheet. A declaration that
 * lives in a file the entrypoint DID import cannot be out of graph, so it
 * stays FAIL rather than being explained away.
 */

/** Every .css file under a root, recursively. */
function cssFilesUnder(root) {
  const out = [];
  const walk = (dir) => {
    for (const ent of readdirSync(dir, { withFileTypes: true })) {
      const abs = join(dir, ent.name);
      if (ent.isDirectory()) walk(abs);
      else if (ent.isFile() && ent.name.endsWith(".css")) out.push(abs);
    }
  };
  walk(root);
  return out.sort();
}

/**
 * Where a channel is declared ANYWHERE in the CSS tree, independent of any
 * entrypoint. `rootScope` records whether the declaration would be admitted to
 * a root environment, so a `.foo { --x: 1px }` can never be mistaken for one.
 *
 * `files` is injectable so the tests can plant a tree instead of depending on
 * whatever another agent edited five minutes ago.
 */
export function findTreeDeclarations(channels, { cssRoot = CSS_ROOT, files = null, cwd = REPO_ROOT } = {}) {
  const want = new Set(channels);
  const found = new Map();
  if (!want.size) return found;
  const list =
    files ?? cssFilesUnder(cssRoot).map((abs) => ({ abs, rel: relative(cwd, abs) }));
  for (const f of list) {
    let text = f.text;
    if (text === undefined) {
      try {
        text = readFileSync(f.abs, "utf8");
      } catch {
        continue;
      }
    }
    let touched = false;
    for (const ch of want) {
      if (text.includes(ch)) {
        touched = true;
        break;
      }
    }
    if (!touched) continue;
    for (const d of parseStylesheet(text, f.abs).declarations) {
      if (!want.has(d.prop)) continue;
      if (!found.has(d.prop)) found.set(d.prop, []);
      found.get(d.prop).push({
        rel: f.rel ?? f.abs,
        line: d.line,
        selector: d.selector,
        value: d.value.replace(/\s+/g, " ").trim(),
        rootScope: isRootEquivalent(d.selector) && !isConditional(d.atStack),
      });
    }
  }
  return found;
}

/**
 * Which entrypoints under facade/entrypoints/ actually import a given file.
 * Answering "then which entrypoint WOULD reach it" is the difference between
 * reporting a hole and reporting a hole with its patch attached.
 */
export function entrypointsReaching(rels, { dir = ENTRYPOINT_DIR } = {}) {
  const wanted = new Set(rels);
  const out = new Map();
  for (const rel of wanted) out.set(rel, []);
  if (!wanted.size) return out;
  const reader = makeReader({});
  let names = [];
  try {
    names = readdirSync(dir).filter((n) => n.endsWith(".css")).sort();
  } catch {
    return out;
  }
  for (const name of names) {
    const sheet = buildSheet(join(dir, name), reader);
    const inSheet = new Set(sheet.files.map((f) => f.rel));
    for (const rel of wanted) if (inSheet.has(rel)) out.get(rel).push(name.replace(/\.css$/, ""));
  }
  return out;
}

/**
 * Rewrite the `undeclared` FAILs that are really coverage holes. Mutates the
 * leg-1 results in place and returns the ledger for the report.
 *
 * `declarations` / `reach` are injectable for the tests; in production they
 * are derived from the tree.
 */
export function reclassifyOutOfGraph({
  leg1,
  entry = "base",
  probedFiles = null,
  declarations = null,
  reach = null,
  cssRoot = CSS_ROOT,
  entrypointDir = ENTRYPOINT_DIR,
}) {
  const candidates = leg1.results.filter((r) => {
    if (r.verdict !== "FAIL") return false;
    const fails = r.findings.filter((f) => f.severity === "fail");
    // Only a channel whose ENTIRE case against it is `undeclared` can be
    // reclassified. One that also cycles or shifts at rest stays FAIL: the
    // coverage hole would otherwise launder a genuine defect.
    return fails.length > 0 && fails.every((f) => f.code === "undeclared");
  });
  const ledger = [];
  if (!candidates.length) return ledger;

  const decls =
    declarations ?? findTreeDeclarations(candidates.map((r) => r.channel), { cssRoot });
  const probed = probedFiles ? new Set(probedFiles) : null;

  const outside = new Map();
  for (const r of candidates) {
    const hits = (decls.get(r.channel) || []).filter(
      (d) => d.rootScope && (probed === null || !probed.has(d.rel)),
    );
    if (hits.length) outside.set(r.channel, hits);
  }
  if (!outside.size) return ledger;

  const rels = new Set();
  for (const hits of outside.values()) for (const h of hits) rels.add(h.rel);
  const reachMap = reach ?? entrypointsReaching([...rels], { dir: entrypointDir });

  for (const r of candidates) {
    const hits = outside.get(r.channel);
    if (!hits) continue;
    const declaredAt = hits.map((h) => `${h.rel}:${h.line}`);
    const reachedBy = [
      ...new Set(hits.flatMap((h) => (reachMap.get ? reachMap.get(h.rel) : reachMap[h.rel]) || [])),
    ]
      .filter((n) => n !== entry)
      .sort();
    const message =
      `${r.channel} IS declared, at ${declaredAt.join(", ")} ` +
      `(${hits.map((h) => `${h.selector} { ${r.channel}: ${h.value} }`).join("; ")}), ` +
      `but the probed entrypoint "${entry}" does not import that file, so this run never evaluated the channel. ` +
      (reachedBy.length
        ? `Re-run with --entry ${reachedBy[0]} to cover it${reachedBy.length > 1 ? ` (also reached by: ${reachedBy.join(", ")})` : ""}.`
        : `No entrypoint under facade/entrypoints/ imports that file, so no --entry covers it today.`) +
      ` This is NOT a defect of the rewiring and NOT a verification: it is an uncovered channel.`;

    r.verdict = OUT_OF_GRAPH;
    r.subtype = `declared at ${declaredAt[0]}, outside the "${entry}" import graph`;
    r.findings = r.findings.map((f) =>
      f.severity === "fail" && f.code === "undeclared"
        ? { severity: "out-of-graph", code: "out-of-graph", message }
        : f,
    );
    r.outOfGraph = { probedEntrypoint: entry, declaredAt: hits, reachedBy };
    ledger.push({ channel: r.channel, probedEntrypoint: entry, declaredAt: hits, reachedBy, message });
  }
  return ledger;
}

/**
 * EXIT CODE POLICY, stated once so it cannot drift.
 *   1  FAIL      — a defect in the rewiring. The only blocking colour.
 *   2  MASKED or OUT-OF-GRAPH — the run is clean of defects but is NOT a full
 *      verification: something correct does not arrive (MASKED), or something
 *      was never measured (OUT-OF-GRAPH). Both are signal for a human.
 *   0  every probed channel was actually verified.
 * OUT-OF-GRAPH deliberately shares 2 with MASKED rather than claiming a new
 * code: 3 already means "the probe could not run", and a caller reading
 * anything above 2 as a crash would misread a coverage hole as a broken probe.
 * The two states stay distinguishable in the summary and in --json.
 */
export function exitCodeFor(counts) {
  if (counts.FAIL) return 1;
  if (counts.MASKED || counts[OUT_OF_GRAPH]) return 2;
  return 0;
}

/**
 * Leg 2. Only runs for channels that leg 1 found a synthesisable reading site
 * for. Sites it cannot synthesise (combinators, structural pseudo-classes) are
 * returned in `notCovered` and MUST be reported: silently narrowing the set
 * would turn "not measured" into "measured fine".
 */
export function runLeg2({ leg1, entry = "rottay", binary = null, baseline = null }) {
  const bin = binary || findChromium();
  if (!bin) {
    return { ran: false, reason: "no Chromium binary installed; leg 2 NOT RUN", probes: [], notCovered: [] };
  }
  const side = loadSide({ entry });
  const css = inlineSheet(side.sheet);

  const probes = [];
  const notCovered = [];
  const channelsOf = new Map();
  for (const r of leg1.results) {
    for (const s of r.sites) {
      const el = synthesiseElement(s.selector);
      if (!el.supported) {
        notCovered.push({ channel: r.channel, selector: s.selector, reason: el.reason });
        continue;
      }
      const id = `p${probes.length}`;
      probes.push({
        id,
        element: el,
        longhands: [longhandFor(s.prop)],
        channels: [r.channel],
        meta: { channel: r.channel, prop: s.prop, rel: s.rel, line: s.line, selector: s.selector },
      });
      if (!channelsOf.has(r.channel)) channelsOf.set(r.channel, []);
      channelsOf.get(r.channel).push(id);
    }
  }
  if (!probes.length) {
    return { ran: false, reason: "no synthesisable reading site", probes: [], notCovered };
  }

  const perturbations = DEFAULT_DIALS.flatMap((d) =>
    [1.25, 1.5].map((k) => ({ id: `${d.id}@${k}`, decls: { [d.channel]: String(k) } })),
  );
  const html = buildFixture({ css, tenant: entry === "base" ? null : entry, probes, perturbations, portal: true });
  const { measurement, fixtureDir } = runFixture({ css, html, binary: bin });

  // BOTH SIDES. An exponent of 2 measured only on the working tree cannot say
  // whether this wave caused it or merely inherited it, and the difference is
  // the whole question. So the baseline revision is assembled and rendered in
  // the same browser with the same probes, and the exponents are compared.
  let baselineMeasurement = null;
  if (baseline) {
    const priorSide = loadSide({ rev: baseline, entry });
    const priorCss = inlineSheet(priorSide.sheet);
    const priorHtml = buildFixture({
      css: priorCss,
      tenant: entry === "base" ? null : entry,
      probes,
      perturbations,
      portal: false,
    });
    baselineMeasurement = runFixture({ css: priorCss, html: priorHtml, binary: bin }).measurement;
  }

  const exponentOf = (m, id, lh, dial) => {
    const rest = parseFloat(m.rest[id]?.longhands?.[lh]);
    const a = parseFloat(m.perturbed[`${dial}@1.25`]?.[id]?.longhands?.[lh]);
    const b = parseFloat(m.perturbed[`${dial}@1.5`]?.[id]?.longhands?.[lh]);
    if (!Number.isFinite(rest) || rest === 0 || !Number.isFinite(a) || !Number.isFinite(b)) return null;
    const e1 = Math.log(a / rest) / Math.log(1.25);
    const e2 = Math.log(b / rest) / Math.log(1.5);
    // Chromium rounds rendered px to 1/64, so the two exponents agree only
    // approximately. 0.05 is far below the 1.0 gap between e=1 and e=2.
    if (Math.abs(e1 - e2) > 0.05) return { exponent: null, e1, e2, rest, a, b };
    const e = Math.round(e1);
    if (Math.abs(e1 - e) > 0.05) return { exponent: null, e1, e2, rest, a, b };
    return { exponent: e, e1, e2, rest, a, b };
  };

  const findings = [];
  for (const p of probes) {
    const lh = p.longhands[0];
    const rest = measurement.rest[p.id];
    if (!rest || rest.missing) continue;
    const restPx = parseFloat(rest.longhands[lh]);
    const cp = rest.channels[p.meta.channel];
    if (cp === "" || cp === undefined) {
      findings.push({
        severity: "fail",
        code: "iacvt",
        channel: p.meta.channel,
        message: `${p.meta.channel} is declared but computes to the empty string at ${p.meta.selector} — invalid at computed-value time (a dependency cycle, or a reference to a property that is itself invalid). This is NOT a fallback: the fallback is only taken by references to a guaranteed-invalid property.`,
      });
    }
    // REST EQUIVALENCE, measured in the browser rather than argued
    // symbolically. Leg 1 can only compare the values it can resolve; the
    // rendered longhand is the paint. A rest shift here is the strongest
    // possible statement the probe can make, because it means the change is
    // not byte-equivalent at all and every dial argument is secondary.
    if (baselineMeasurement) {
      const beforePx = parseFloat(baselineMeasurement.rest[p.id]?.longhands?.[lh]);
      const afterPx = parseFloat(restPx);
      if (Number.isFinite(beforePx) && Number.isFinite(afterPx) && Math.abs(beforePx - afterPx) > 0.02) {
        findings.push({
          severity: "fail",
          code: "rest-shift",
          channel: p.meta.channel,
          restBefore: beforePx,
          restAfter: afterPx,
          message: `RENDERED ${lh} at ${p.meta.selector} (${p.meta.rel}:${p.meta.line}) is NOT rest-equivalent: ${beforePx}px at the baseline, ${afterPx}px now, with every dial at default.`,
        });
      }
    }

    for (const d of DEFAULT_DIALS) {
      const now = exponentOf(measurement, p.id, lh, d.id);
      if (!now || now.exponent === null) continue;
      const was = baselineMeasurement ? exponentOf(baselineMeasurement, p.id, lh, d.id) : null;
      const priorExponent = was ? was.exponent : null;
      if (now.exponent <= 1) continue;
      const introduced = priorExponent !== null && priorExponent < now.exponent;
      findings.push({
        severity: introduced ? "fail" : "pre-existing",
        code: now.exponent === 2 ? "double-scaling" : "over-scaling",
        channel: p.meta.channel,
        dial: d.channel,
        exponentBefore: priorExponent,
        exponentAfter: now.exponent,
        restBefore: was ? was.rest : null,
        restAfter: now.rest,
        message:
          `RENDERED ${lh} at ${p.meta.selector} (${p.meta.rel}:${p.meta.line}) applies ${d.channel} ${now.exponent} times` +
          (priorExponent === null
            ? " (baseline not measured)"
            : introduced
              ? `, up from ${priorExponent} at the baseline — INTRODUCED by this change`
              : `, unchanged from the baseline (${priorExponent}) — pre-existing`) +
          `: rest ${now.rest}px, k=1.25 -> ${now.a}px, k=1.5 -> ${now.b}px.`,
      });
    }
  }

  const portal = measurement.portal
    ? {
        stampedCustomProperties: measurement.portal.stampedCustomProperties,
        frozen: probes
          .filter((p) => {
            const lh = p.longhands[0];
            const r = measurement.portal.rest[p.id]?.longhands?.[lh];
            const a = measurement.portal.afterDial[p.id]?.longhands?.[lh];
            return r !== undefined && r === a;
          })
          .map((p) => p.meta),
      }
    : null;

  return {
    ran: true,
    binary: bin,
    userAgent: measurement.userAgent || measurement.ua,
    fixtureDir,
    entry,
    probeCount: probes.length,
    findings,
    introduced: findings.filter((f) => f.severity === "fail").length,
    preExisting: findings.filter((f) => f.severity === "pre-existing").length,
    notCovered,
    portal,
    baselineMeasured: Boolean(baselineMeasurement),
    measurement,
  };
}

function longhandFor(prop) {
  if (prop === "padding-inline" || prop === "padding") return "padding-left";
  if (prop === "margin-inline" || prop === "margin") return "margin-left";
  if (prop === "gap") return "column-gap";
  if (prop === "inset-inline") return "left";
  if (prop === "border-radius") return "border-top-left-radius";
  if (prop === "border-width" || prop === "border") return "border-top-width";
  if (prop === "block-size") return "height";
  if (prop === "inline-size") return "width";
  return prop;
}

function render(report, opts) {
  const lines = [];
  const icon = { PASS: "✓", FAIL: "✗", MASKED: "─", [OUT_OF_GRAPH]: "?" };
  for (const r of report.leg1.results) {
    lines.push(`${icon[r.verdict] ?? "?"} ${r.verdict.padEnd(12)} ${r.channel}  ${r.subtype}`);
    if (opts.quiet) continue;
    lines.push(`    before  ${r.before.decl ?? "(absent)"}  ${r.before.raw ?? ""}`);
    lines.push(`            rest = ${r.before.rest} [${r.before.type}]`);
    lines.push(`    after   ${r.after.decl ?? "(absent)"}  ${r.after.raw ?? ""}`);
    lines.push(`            rest = ${r.after.rest} [${r.after.type}]`);
    for (const d of r.channelDials) {
      if (d.before === null && d.after === null) continue;
      lines.push(`    dial ${d.dial.padEnd(8)} exponent ${String(d.before)} → ${String(d.after)}`);
    }
    for (const s of r.sites) {
      const dials = s.dials
        .filter((d) => d.after !== null || d.note)
        .map((d) => `${d.dial}:${d.before === null ? "?" : d.before}→${d.after === null ? "?" : d.after}`)
        .join(" ");
      lines.push(
        `    site  ${s.rel}:${s.line}  ${s.prop}  rest ${s.rest.before} → ${s.rest.after}  ${dials}`,
      );
    }
    for (const m of r.maskedIn) {
      lines.push(`    masked in ${m.tenant}: ${m.rel}:${m.line} = ${m.value}`);
    }
    for (const c of r.competing) lines.push(`    competing decl ${c}`);
    for (const f of r.findings) lines.push(`    [${f.severity}] ${f.code}: ${f.message}`);
    lines.push("");
  }
  return lines.join("\n");
}

export function run(argv) {
  const opts = parseArgs(argv);
  const channels = new Set(opts.channels);
  let changed = null;
  for (const fam of opts.families) for (const c of familyChannels(fam)) channels.add(c);
  if (opts.changed) {
    changed = changedChannels({ baseline: opts.baseline });
    for (const c of changed.channels) channels.add(c);
  }
  const list = [...channels].sort();
  if (!list.length) throw new Error("no channels selected; pass --channel, --family or --changed");

  const entryTarget = resolveEntry(opts.entry);
  const before = loadSide({ rev: opts.baseline, entry: entryTarget });
  const after = loadSide({ entry: entryTarget });
  const leg1 = analyse({ channels: list, before, after });
  // Separate the two things leg 1 cannot tell apart — a channel declared
  // nowhere, and a channel declared outside this entrypoint's import graph —
  // BEFORE anything counts verdicts or picks an exit code.
  const outOfGraph = reclassifyOutOfGraph({
    leg1,
    entry: opts.entry,
    probedFiles: after.sheet.files.map((f) => f.rel),
  });
  const leg2 = opts.leg2
    ? runLeg2({ leg1, entry: opts.tenant, baseline: opts.baseline })
    : { ran: false, reason: "not requested" };

  const counts = { PASS: 0, FAIL: 0, MASKED: 0, [OUT_OF_GRAPH]: 0 };
  for (const r of leg1.results) counts[r.verdict] += 1;

  const report = {
    method: {
      baseline: opts.baseline,
      entrypoint: opts.entry,
      dials: DEFAULT_DIALS,
      factors: [1.25, 1.5],
      denominator: {
        channelsProbed: list.length,
        source: opts.changed
          ? `custom properties whose declared value differs from ${opts.baseline} across ${changed.files.length} changed CSS files under src/foundation/tokens/css/`
          : "explicitly requested channels",
      },
      treeDigest: changed ? treeDigest(changed.files) : null,
      timestamp: new Date().toISOString(),
      sheetFiles: after.sheet.files.length,
      unresolvedImports: after.sheet.unresolved,
    },
    counts,
    // The channels this run did NOT verify, each with the file:line that does
    // declare it. A consumer that treats them as green is reading past an
    // explicit statement that they were never measured.
    outOfGraph,
    leg1,
    leg2,
  };

  const text = render(report, opts);
  const summary = [
    "",
    `── cascade-probe ─────────────────────────────────────────`,
    `   baseline        ${opts.baseline}`,
    `   entrypoint      ${opts.entry}  (${after.sheet.files.length} css files)`,
    `   channels probed ${list.length}`,
    changed ? `   tree digest     ${report.method.treeDigest}  (${changed.files.length} changed files)` : null,
    `   PASS ${counts.PASS}   FAIL ${counts.FAIL}   MASKED ${counts.MASKED}   ${OUT_OF_GRAPH} ${counts[OUT_OF_GRAPH]}`,
    counts[OUT_OF_GRAPH]
      ? `   ! ${counts[OUT_OF_GRAPH]} channel(s) declared outside the "${opts.entry}" import graph — NOT failures, NOT verified` +
        (outOfGraph.some((o) => o.reachedBy.length)
          ? `; covered by --entry ${[...new Set(outOfGraph.flatMap((o) => o.reachedBy))].sort().join(", ")}`
          : "")
      : null,
    opts.leg2
      ? `   leg 2           ${leg2.ran ? `${leg2.probeCount} probes; ${leg2.introduced} INTRODUCED, ${leg2.preExisting} pre-existing, ${leg2.notCovered.length} sites NOT COVERED` : `NOT RUN — ${leg2.reason}`}`
      : `   leg 2           not requested`,
    after.sheet.unresolved.length
      ? `   ! ${after.sheet.unresolved.length} unresolved imports — the probed set is a LOWER BOUND`
      : null,
    "",
  ]
    .filter((l) => l !== null)
    .join("\n");

  return { report, text, summary, exitCode: exitCodeFor(counts) };
}

const invokedDirectly =
  process.argv[1] && process.argv[1].endsWith("cascade-probe.mjs");
if (invokedDirectly) {
  try {
    const out = run(process.argv.slice(2));
    process.stdout.write(`${out.text}\n${out.summary}\n`);
    const opts = parseArgs(process.argv.slice(2));
    if (opts.json) {
      // A Map serialises to `{}`, which would silently drop the artifact-mask
      // evidence from the machine-readable output while the terminal still
      // printed it. Losing the mask table is the exact failure mode this probe
      // treats as most dangerous, so it is converted explicitly.
      writeFileSync(
        opts.json,
        JSON.stringify(
          out.report,
          (_k, v) => (v instanceof Map ? Object.fromEntries(v) : v),
          2,
        ),
      );
      process.stdout.write(`   json → ${opts.json}\n`);
    }
    for (const o of out.report.outOfGraph)
      process.stdout.write(`   [out-of-graph] ${o.channel}: ${o.message}\n`);
    if (out.report.leg2.ran) {
      for (const f of out.report.leg2.findings)
        process.stdout.write(`   [leg2 ${f.severity}] ${f.code}: ${f.message}\n`);
      for (const n of out.report.leg2.notCovered)
        process.stdout.write(`   [leg2 not-covered] ${n.channel} @ ${n.selector} — ${n.reason}\n`);
    }
    process.exit(out.exitCode);
  } catch (err) {
    process.stderr.write(`cascade-probe failed: ${err.message}\n${err.stack}\n`);
    process.exit(3);
  }
}
