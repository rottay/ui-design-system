/**
 * index.mjs — the cheap leg. No browser.
 *
 * WHAT IT ANSWERS
 *   1a REST EQUIVALENCE. The chain of a channel expanded to its leaves and
 *      EVALUATED with every dial at its default, before and after the edit.
 *      Values are compared as typed quantities, never as text: `1rem` and
 *      `16px` match, `1.5` and `1.5rem` do not and the report names the units.
 *   1b THE DERIVATIVE. This is the part that matters. Perturb ONE dial and
 *      measure how the RENDERED END OF THE CHAIN moves — not the channel, the
 *      property declaration that finally paints. The response is characterised
 *      as an exponent measured at two independent factors:
 *          e = ln(v(k)/v(1)) / ln(k),  for k = 1.25 and k = 1.5
 *      The two must agree, and e must be 0 or 1.
 *
 * WHY THE EXPONENT AND NOT "THE DERIVATIVE MUST NOT CHANGE".
 * A correct rewiring is SUPPOSED to change the derivative: that is the whole
 * point, it connects a dead literal to a live dial (e goes 0 -> 1). So
 * "unchanged derivative" is the wrong law and would redden every good edit.
 * The law that actually holds end to end is: a dial must be applied EXACTLY
 * ONCE. e = 0 means the dial never reaches this paint. e = 1 means it reaches
 * it once. e = 2 means it was applied twice — that is the real defect already
 * committed in this programme: `--ds-button-md-padding-x` wired to
 * `--ds-spacing-4`, which is itself `calc(<base> * var(--ds-density-effective-scale,1))`,
 * while the modern skin multiplies by the SAME scalar again at the reading
 * site. Byte-identical at rest, density squared everywhere else. No screenshot
 * can see it; this measures it.
 *
 * A non-integer or factor-inconsistent exponent is NOT rounded to the nearest
 * story. It is reported as `non-multiplicative` with both measured ratios.
 */
import {
  buildRootEnvironment,
  buildSheet,
  findReadingSites,
  indexDeclarations,
  makeReader,
  artifactMask,
  ENTRYPOINTS,
  sheetFromSources,
} from "../css-model/index.mjs";
import {
  GUARANTEED_INVALID,
  describeType,
  evaluate,
  expandVars,
  formatValue,
  sameValue,
  scalarOf,
  splitTopLevelWhitespace,
} from "../value-evaluation/index.mjs";

/** Dials probed by default, with the channel a caller actually turns. */
export const DEFAULT_DIALS = [
  { id: "density", channel: "--ds-density-scale" },
  { id: "type", channel: "--ds-type-scale" },
  { id: "radius", channel: "--ds-radius-scale" },
];

export const PROBE_FACTORS = [1.25, 1.5];

const EXPONENT_TOLERANCE = 1e-6;

/**
 * Channels the base sheet deliberately never declares. Verified on 2026-08-18:
 * `--ds-type-scale`, `--ds-density-scale` and `--ds-radius-scale` are declared
 * in NO file under src/foundation/tokens/css except the three tenant artifacts,
 * which enter unlayered. `--ds-density-mode-factor` and
 * `--ds-density-local-factor` are declared only under `[data-density=...]`
 * attribute selectors, which are not root-equivalent. Every reader therefore
 * reaches them through a `var(..., 1)` fallback at rest.
 */
export const DEFAULT_UNDECLARED_DIALS = new Set([
  "--ds-type-scale",
  "--ds-density-scale",
  "--ds-radius-scale",
  "--ds-density-mode-factor",
  "--ds-density-local-factor",
]);

/**
 * Load one side (a git revision, or the working tree when rev is null).
 */
export function sideFromSources(sources, layerOrder = []) {
  const sheet = sheetFromSources(sources, layerOrder);
  const decls = indexDeclarations(sheet);
  const { env, winner, competing } = buildRootEnvironment(decls);
  return {
    rev: null,
    entry: "<in-memory>",
    sheet,
    decls,
    env,
    winner,
    competing,
    rootFontSize: rootFontSizeExpression(decls),
  };
}

export function loadSide({ rev = null, entry = "base" } = {}) {
  const reader = makeReader({ rev });
  const sheet = buildSheet(ENTRYPOINTS[entry] ?? entry, reader);
  const decls = indexDeclarations(sheet);
  const { env, winner, competing } = buildRootEnvironment(decls);
  return {
    rev,
    entry,
    sheet,
    decls,
    env,
    winner,
    competing,
    rootFontSize: rootFontSizeExpression(decls),
  };
}

/**
 * THE REM BASE IS NOT 16px AND ASSUMING IT IS, IS A REAL BLINDNESS.
 *
 * This probe originally hardcoded `rem = 16px`. That silently converted a
 * defect into a pass: `runtime/engines/classic/theme/index.css:22` declares
 * `html[data-tenant] { font-size: var(--ds-font-size-base) }`, and
 * `foundation/themes/default/index.css:610` defines that as
 * `calc(var(--ds-font-size-base-base) * var(--ds-type-scale, 1))` over a
 * 0.9375rem base. So the root font-size is 15px at rest, and — the part that
 * matters — `rem` ITSELF carries the type dial. Any rem-valued token that is
 * ALSO multiplied by `--ds-type-scale` therefore receives that dial twice,
 * which is precisely the double-scaling defect, one level up from the
 * spacing/density instance. A fixed rem base cannot see it, at rest or under
 * perturbation.
 *
 * So the base is derived from the sheet: the winning `font-size` declaration
 * on a root element. Root-ness here is broader than the custom-property root
 * environment — `html[data-tenant]` is a qualified root, not a descendant —
 * so the test is "the compound targets html/:root and has no combinator".
 *
 * The expression is returned UNEVALUATED on purpose. It has to be re-evaluated
 * under every dial perturbation, otherwise the derivative measurement inherits
 * the rest-state base and the double application stays invisible.
 *
 * When no root font-size is declared, null is returned and callers fall back
 * to the CSS initial value, 16px — which is then the correct answer, not an
 * assumption.
 */
export function rootFontSizeExpression(decls) {
  let best = null;
  for (const d of decls) {
    if (d.prop !== "font-size") continue;
    if (d.atStack.some((a) => a.name !== "layer")) continue;
    const compounds = d.selector
      ? d.selector.split(",").map((x) => x.trim().replace(/\s+/g, " "))
      : [];
    const isRoot = compounds.some(
      (c) => c !== "" && !/[\s>+~]/.test(c) && /^(html|:root)([.#\[:][^\s]*)?$/.test(c),
    );
    if (!isRoot) continue;
    if (
      !best ||
      d.layerRank > best.layerRank ||
      (d.layerRank === best.layerRank &&
        (d.fileIndex > best.fileIndex ||
          (d.fileIndex === best.fileIndex && d.order > best.order)))
    ) {
      best = d;
    }
  }
  return best ? { value: best.value, rel: best.rel, line: best.line, selector: best.selector } : null;
}

/** Expand + evaluate a raw value in an environment, with dial overrides. */
export function evalIn(rawValue, env, overrides = null, rootFontSize = null) {
  const useEnv = overrides ? new Map(env) : env;
  if (overrides) for (const [k, v] of Object.entries(overrides)) useEnv.set(k, v);
  // Resolve the rem base FIRST, in the same (possibly perturbed) environment.
  // A rem-valued root font-size resolves against the CSS initial 16px, which
  // is what the second argument pins here.
  let rootFontSizePx = 16;
  if (rootFontSize && rootFontSize.value) {
    const rootExp = expandVars(rootFontSize.value, useEnv);
    if (rootExp.text !== GUARANTEED_INVALID) {
      const rv = evaluate(rootExp.text, { rootFontSizePx: 16 });
      if (rv.kind === "length" && Number.isFinite(rv.px)) rootFontSizePx = rv.px;
    }
  }
  const expansion = expandVars(rawValue, useEnv);
  if (expansion.text === GUARANTEED_INVALID) {
    return {
      value: { kind: "invalid", reason: "guaranteed-invalid (cycle or undeclared with no fallback)" },
      cycles: expansion.cycles,
      undeclared: expansion.undeclared,
      chain: expansion.chain,
      expanded: null,
    };
  }
  return {
    value: evaluate(expansion.text, { rootFontSizePx }),
    rootFontSizePx,
    cycles: expansion.cycles,
    undeclared: expansion.undeclared,
    chain: expansion.chain,
    expanded: expansion.text,
  };
}

/**
 * Measure the exponent of a value's response to one dial.
 * Returns { exponent, consistent, samples } — `exponent` is null when the
 * response is not a clean power law, and `samples` always carries the raw
 * numbers so a reader can check the claim.
 */
export function measureResponse(rawValue, env, dialChannel, factors = PROBE_FACTORS, rootFontSize = null) {
  const base = evalIn(rawValue, env, { [dialChannel]: "1" }, rootFontSize);

  // SHORTHAND LISTS get measured per position, never collapsed. `padding: A B`
  // is two independent quantities and the dial can be applied a different
  // number of times to each; reporting one exponent for the pair would hide
  // exactly the case worth finding. The returned exponent is the WORST
  // position, with every position kept for the report.
  if (base.value && base.value.kind === "list") {
    const parts = splitTopLevelWhitespace(String(rawValue).trim());
    if (parts.length === base.value.items.length) {
      const positions = parts.map((part, i) => ({
        position: i + 1,
        ...measureResponse(part, env, dialChannel, factors, rootFontSize),
      }));
      const known = positions.filter((p) => p.exponent !== null);
      const worst = known.length
        ? known.reduce((a, b) => (Math.abs(b.exponent) > Math.abs(a.exponent) ? b : a))
        : null;
      return {
        exponent: worst ? worst.exponent : null,
        consistent: positions.every((p) => p.consistent),
        positions,
        samples: worst ? worst.samples : [],
        reason: worst ? undefined : "no position produced a scalar",
        base,
      };
    }
  }

  const baseScalar = scalarOf(base.value);
  const samples = [{ k: 1, value: base.value, scalar: baseScalar }];
  if (baseScalar === null) {
    return { exponent: null, consistent: false, reason: `base is ${describeType(base.value)}`, samples, base };
  }
  const exponents = [];
  for (const k of factors) {
    const got = evalIn(rawValue, env, { [dialChannel]: String(k) }, rootFontSize);
    const s = scalarOf(got.value);
    samples.push({ k, value: got.value, scalar: s });
    if (s === null) {
      return { exponent: null, consistent: false, reason: `k=${k} is ${describeType(got.value)}`, samples, base };
    }
    if (baseScalar === 0) {
      if (s === 0) {
        exponents.push(0);
        continue;
      }
      return { exponent: null, consistent: false, reason: "zero at rest but non-zero under the dial", samples, base };
    }
    exponents.push(Math.log(s / baseScalar) / Math.log(k));
  }
  const first = exponents[0];
  const consistent = exponents.every((e) => Math.abs(e - first) < 1e-6);
  const rounded = Math.round(first);
  const integral = Math.abs(first - rounded) < 1e-6;
  return {
    exponent: consistent && integral ? rounded : null,
    rawExponents: exponents,
    consistent,
    integral,
    samples,
    base,
  };
}

function siteKey(d) {
  return `${d.rel}|${d.selector ?? ""}|${d.prop}`;
}

/**
 * Full leg-1 analysis of a channel list across two revisions.
 *
 * @param {object} opts
 * @param {string[]} opts.channels
 * @param {object} opts.before  side from loadSide({rev})
 * @param {object} opts.after   side from loadSide()
 * @param {Array}  [opts.dials]
 * @param {(d:object)=>boolean} [opts.siteFilter]
 */
export function analyse({
  channels,
  before,
  after,
  dials = DEFAULT_DIALS,
  siteFilter = null,
  maxDepth = 6,
  expectedUndeclared = DEFAULT_UNDECLARED_DIALS,
  tenants = undefined,
  artifactOptions = undefined,
}) {
  const mask = artifactMask(channels, tenants, artifactOptions);
  const sitesAfter = findReadingSites(after.decls, channels, { maxDepth, filter: siteFilter });
  const sitesBefore = findReadingSites(before.decls, channels, { maxDepth, filter: siteFilter });

  const results = [];
  for (const ch of channels) {
    const declBefore = before.winner.get(ch) || null;
    const declAfter = after.winner.get(ch) || null;

    const restBefore = evalIn(`var(${ch})`, before.env, null, before.rootFontSize);
    const restAfter = evalIn(`var(${ch})`, after.env, null, after.rootFontSize);
    const restCmp = sameValue(restBefore.value, restAfter.value);

    const findings = [];
    if (!declAfter) {
      findings.push({
        severity: "fail",
        code: "undeclared",
        message: `${ch} has no root-scope declaration in the working tree`,
      });
    }
    if (restAfter.cycles.length) {
      findings.push({
        severity: "fail",
        code: "cycle",
        message: `dependency cycle through ${restAfter.cycles.join(" -> ")}; the channel computes to the guaranteed-invalid value (Chromium reports getPropertyValue('${ch}') === '' with the declaration present)`,
      });
    }
    if (!restCmp.equal && declBefore && declAfter) {
      findings.push({
        severity: "fail",
        code: "rest-shift",
        message: `rest value moved: ${restCmp.reason}`,
      });
    }

    // reading sites, matched across revisions by file|selector|property
    const beforeByKey = new Map(
      (sitesBefore.get(ch) || []).map((s) => [siteKey(s.decl), s]),
    );
    const siteReports = [];
    for (const s of sitesAfter.get(ch) || []) {
      const key = siteKey(s.decl);
      const prior = beforeByKey.get(key) || null;
      const report = {
        rel: s.decl.rel,
        line: s.decl.line,
        selector: s.decl.selector,
        prop: s.decl.prop,
        via: s.hops,
        raw: s.decl.value.replace(/\s+/g, " "),
        rest: { before: null, after: null },
        dials: [],
      };
      const evAfter = evalIn(s.decl.value, after.env, null, after.rootFontSize);
      report.rest.after = formatValue(evAfter.value);
      if (prior) {
        const evBefore = evalIn(prior.decl.value, before.env, null, before.rootFontSize);
        report.rest.before = formatValue(evBefore.value);
        const cmp = sameValue(evBefore.value, evAfter.value);
        if (!cmp.equal) {
          findings.push({
            severity: "fail",
            code: "rest-shift",
            message: `rendered ${s.decl.prop} at ${s.decl.rel}:${s.decl.line} moved: ${cmp.reason}`,
          });
        }
      }
      // The dial channels themselves are undeclared in the base sheet BY
      // DESIGN — they exist only as `var(--x, 1)` fallbacks plus an unlayered
      // tenant-artifact pin. Reporting them here would bury the references
      // that genuinely need leg 2 under expected noise, so they are excluded
      // and named once in the method block instead.
      const unexpected = evAfter.undeclared.filter((n) => !expectedUndeclared.has(n));
      if (unexpected.length) {
        report.unresolved = unexpected;
        findings.push({
          severity: "unresolved",
          code: "site-unresolved",
          message: `${s.decl.prop} at ${s.decl.rel}:${s.decl.line} references ${unexpected.join(", ")}, which leg 1's root environment does not carry. The value shown is the one reached through the var() fallback; if any non-root scope declares it, the painted value differs — leg 2 required`,
        });
      }
      for (const dial of dials) {
        const respAfter = measureResponse(s.decl.value, after.env, dial.channel, PROBE_FACTORS, after.rootFontSize);
        const respBefore = prior
          ? measureResponse(prior.decl.value, before.env, dial.channel, PROBE_FACTORS, before.rootFontSize)
          : null;
        const entry = {
          dial: dial.id,
          channel: dial.channel,
          before: respBefore ? respBefore.exponent : null,
          after: respAfter.exponent,
          samples: respAfter.samples.map((x) => ({ k: x.k, v: formatValue(x.value) })),
        };
        if (respAfter.exponent === null && respAfter.samples.some((x) => x.k !== 1 && x.scalar !== respAfter.samples[0].scalar)) {
          entry.note = respAfter.reason || `non-multiplicative response: exponents ${(respAfter.rawExponents || []).map((e) => e.toFixed(4)).join(", ")}`;
          findings.push({
            severity: "fail",
            code: "non-multiplicative",
            message: `${s.decl.prop} at ${s.decl.rel}:${s.decl.line} responds to ${dial.channel} in a way that is not a clean power law — ${entry.note}`,
          });
        } else if (respAfter.exponent !== null && respAfter.exponent > 1) {
          findings.push({
            severity: "fail",
            code: respAfter.exponent === 2 ? "double-scaling" : "over-scaling",
            message: `${s.decl.prop} at ${s.decl.rel}:${s.decl.line} applies ${dial.channel} ${respAfter.exponent} times (exponent ${respAfter.exponent}; ${entry.samples.map((x) => `k=${x.k} -> ${x.v}`).join(", ")}). The dial is applied once too many: the value is byte-identical only while the dial sits at its default.`,
          });
        } else if (respAfter.exponent !== null && respAfter.exponent < 0) {
          findings.push({
            severity: "fail",
            code: "inverse-scaling",
            message: `${s.decl.prop} at ${s.decl.rel}:${s.decl.line} moves INVERSELY with ${dial.channel} (exponent ${respAfter.exponent})`,
          });
        }
        entry.delta =
          respBefore && respBefore.exponent !== null && respAfter.exponent !== null
            ? respAfter.exponent - respBefore.exponent
            : null;
        report.dials.push(entry);
      }
      siteReports.push(report);
    }

    // Channel-level response, useful when the channel has no reachable site.
    const channelDials = dials.map((dial) => {
      const respAfter = measureResponse(`var(${ch})`, after.env, dial.channel, PROBE_FACTORS, after.rootFontSize);
      const respBefore = measureResponse(`var(${ch})`, before.env, dial.channel, PROBE_FACTORS, before.rootFontSize);
      return {
        dial: dial.id,
        channel: dial.channel,
        before: respBefore.exponent,
        after: respAfter.exponent,
      };
    });

    const maskedTenants = (mask.get(ch) || []).map((m) => m.tenant);
    const failures = findings.filter((f) => f.severity === "fail");
    let verdict;
    if (failures.length) verdict = "FAIL";
    else if (maskedTenants.length) verdict = "MASKED";
    else verdict = "PASS";

    const dialConnected = channelDials.some(
      (d) => d.after !== null && d.after > 0 && (d.before === null || d.before === 0),
    );
    const anyLiveDial = channelDials.some((d) => d.after !== null && d.after > 0);

    results.push({
      channel: ch,
      verdict,
      subtype:
        verdict === "PASS"
          ? dialConnected
            ? "dial-connected"
            : anyLiveDial
              ? "dial-already-live"
              : "inert (no probed dial reaches this channel)"
          : verdict === "MASKED"
            ? `edit is dead paint under: ${maskedTenants.join(", ")}`
            : failures.map((f) => f.code).join(", "),
      before: {
        decl: declBefore ? `${declBefore.rel}:${declBefore.line}` : null,
        raw: declBefore ? declBefore.value.replace(/\s+/g, " ") : null,
        rest: formatValue(restBefore.value),
        type: describeType(restBefore.value),
      },
      after: {
        decl: declAfter ? `${declAfter.rel}:${declAfter.line}` : null,
        raw: declAfter ? declAfter.value.replace(/\s+/g, " ") : null,
        rest: formatValue(restAfter.value),
        type: describeType(restAfter.value),
      },
      restEquivalent: restCmp.equal,
      restReason: restCmp.equal ? null : restCmp.reason,
      channelDials,
      maskedIn: mask.get(ch) || [],
      competing: (after.competing.get(ch) || []).map(
        (d) => `${d.rel}:${d.line} { ${d.selector ?? "(at-rule)"} }${d.atStack.length ? ` @${d.atStack.map((a) => a.name).join("/")}` : ""}`,
      ),
      sites: siteReports,
      findings,
    });
  }
  return { results, mask };
}
