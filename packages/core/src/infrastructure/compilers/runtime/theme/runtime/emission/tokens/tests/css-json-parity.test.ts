/**
 * I-3 — CSS to JSON parity, per channel, on all three first-party verticals.
 *
 * The suite copies the shape of the first-party artifact parity gate and adds
 * what a RESOLVED comparison needs. Byte comparison of the authored CSS text is
 * impossible by construction: the artifact carries reference text and the
 * document carries its value.
 *
 * Assertion 2 is explicitly scoped. It runs the artifact's own declaration
 * through the same pipeline the emitter ran, so it binds ASSEMBLY (did the
 * emitter start from the channel the artifact declares, at the declared mode),
 * DOMAIN and SERIALIZATION. It does not and cannot bind resolver or evaluator
 * semantics -- the pipeline is on both sides and a defect there cancels. The
 * independent oracle beside this file is what binds those.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import postcss from "postcss";
import { describe, expect, it } from "vitest";

import {
  TOKEN_EMISSION_BOUNDS,
  type ThemeTokenLeaf,
  type TokenEmissionEnvironment,
  type TokenEmissionMode,
} from "@/contracts/theme/runtime/compilation";

import { admitCssVariables } from "@/infrastructure/compilers/kernel/foundation/css/value-safety";

import { compileThemeIntent, staticThemeIntent } from "../../../..";
import {
  compilationScope,
  emitThemeTokens,
  evaluateCssValue,
  resolveChannelValue,
  type ResolvedBaseEnvironment,
} from "..";

const VERTICALS = ["rottay", "bithire", "evnto"] as const;
const MODES: readonly TokenEmissionMode[] = ["light", "dark"];
/** Two denominators, so the `rem` leg of the environment is measured, not assumed. */
const ROOT_FONT_SIZES = [16, 20] as const;

export const TOKEN_EMISSION_SPECS = MODES.flatMap((mode) =>
  ROOT_FONT_SIZES.map((rootFontSizePx) => ({ mode, rootFontSizePx }))
);

const CORE_ROOT = process.cwd();

function baseEnvironment(vertical: string, mode: TokenEmissionMode): ResolvedBaseEnvironment {
  const document = JSON.parse(
    readFileSync(
      resolve(CORE_ROOT, `artifacts/generated/tokens/base-environment/${vertical}/${mode}/index.json`),
      "utf8"
    )
  ) as ResolvedBaseEnvironment;
  return {
    vertical: document.vertical,
    mode: document.mode,
    channels: document.channels,
    digest: document.digest,
  };
}

/**
 * The committed artifact's declarations, base rule overlaid with the rule for
 * the named mode. The mode rule is recognised by its selector rather than by
 * position: a vertical may be dark-first, and two of the three are not.
 */
function artifactDeclarations(
  vertical: string,
  mode: TokenEmissionMode
): Record<string, string> {
  const css = readFileSync(
    resolve(CORE_ROOT, `src/foundation/tokens/css/facade/artifacts/${vertical}/index.css`),
    "utf8"
  );
  const base: Record<string, string> = {};
  const overlay: Record<string, string> = {};
  postcss.parse(css).walkRules((rule) => {
    const modeScoped = /\[data-theme=['"](light|dark)['"]\]/.exec(rule.selector);
    if (modeScoped && modeScoped[1] !== mode) return;
    const target = modeScoped ? overlay : base;
    rule.walkDecls((declaration) => {
      if (!declaration.prop.startsWith("--")) return;
      target[declaration.prop] = declaration.value.trim();
    });
  });
  return { ...base, ...overlay };
}

/**
 * Which colour tolerance a leaf is compared at.
 *
 * `gamutMapToSrgb` is a mapping and not an identity, so a value that reached
 * sRGB THROUGH oklab rides its width; everything else is integer-exact after
 * rounding and is granted nothing. The space is read off the value's own text,
 * which is the same text both sides evaluate.
 */
const OKLAB_DERIVED = /\boklab\b|\boklch\b/i;

/** A typed leaf, re-read as the CSS text a consumer would paint. */
function serializeLeaf(leaf: ThemeTokenLeaf): string {
  if (leaf.kind === "color") {
    return `rgba(${leaf.srgb[0]},${leaf.srgb[1]},${leaf.srgb[2]},${leaf.alpha})`;
  }
  if (leaf.kind === "length") return `${leaf.value}${leaf.unit}`;
  if (leaf.kind === "time") return `${leaf.ms}ms`;
  if (leaf.kind === "angle") return `${leaf.deg}deg`;
  if (leaf.kind === "number") return `${leaf.value}`;
  if (leaf.kind === "keyword") return leaf.value;
  return leaf.css;
}

function leavesAgree(one: ThemeTokenLeaf, two: ThemeTokenLeaf, tolerance: number): boolean {
  if (one.kind !== two.kind) return false;
  if (one.kind === "color" && two.kind === "color") {
    return (
      one.srgb.every((channel, index) => Math.abs(channel - two.srgb[index]) <= tolerance) &&
      Math.abs(one.alpha - two.alpha) <= 1e-9
    );
  }
  return serializeLeaf(one) === serializeLeaf(two);
}

describe.each(VERTICALS)("%s", (vertical) => {
  const { compiled } = compileThemeIntent(staticThemeIntent(vertical));

  describe.each(TOKEN_EMISSION_SPECS)("mode $mode at $rootFontSizePx px", (environment) => {
    const base = baseEnvironment(vertical, environment.mode);
    const document = emitThemeTokens(compiled, environment as TokenEmissionEnvironment, base, {
      vertical,
      slug: vertical,
      engine: "modern",
      compilerVersion: "parity-suite",
      digest: base.digest,
    });
    const scope = compilationScope(compiled, environment.mode);
    const closure = { ...base.channels, ...scope };

    it("1. domain parity: tokens and unresolved partition the compiled channels", () => {
      const domain = new Set(Object.keys(compiled.cssVariables));
      const emitted = new Set(Object.keys(document.tokens));
      const refused = new Set<string>(document.unresolved.map((entry) => entry.channel));
      for (const channel of emitted) expect(refused.has(channel)).toBe(false);
      expect([...emitted, ...refused].sort()).toEqual([...domain].sort());
    });

    it("2. value parity: every leaf re-reads as the artifact's own declaration resolves", () => {
      const declared = artifactDeclarations(vertical, environment.mode);
      const mismatches: string[] = [];
      const compared = { srgb: 0, oklab: 0 };
      for (const [channel, leaf] of Object.entries(document.tokens)) {
        const raw = declared[channel];
        if (raw === undefined) {
          // A channel the CSS artifact does not carry must be one the VALUE
          // AUTHORITY refuses -- the grammar that decides whether a value may
          // become CSS TEXT. It has no jurisdiction over a JSON leaf, so the
          // document keeps the channel and this suite holds the difference to
          // that one declared cause rather than to a literal channel name.
          const refusedAsText =
            admitCssVariables({ [channel]: scope[channel] })[channel] === undefined;
          if (!refusedAsText) {
            mismatches.push(`${channel}: absent from the committed artifact`);
          }
          continue;
        }
        const resolution = resolveChannelValue(raw, closure, {
          maxDepth: TOKEN_EMISSION_BOUNDS.maxResolutionDepth,
          self: channel,
        });
        if (resolution.unresolved) {
          mismatches.push(`${channel}: artifact side refused (${resolution.unresolved.reason})`);
          continue;
        }
        const evaluation = evaluateCssValue(resolution.value, environment as TokenEmissionEnvironment);
        if (evaluation.refused !== null) {
          mismatches.push(`${channel}: artifact side refused (${evaluation.refused})`);
          continue;
        }
        const fromCss =
          evaluation.leaf.kind === "length" && evaluation.leaf.unit === "rem"
            ? ({
                kind: "length",
                value: Number((evaluation.leaf.value * environment.rootFontSizePx).toPrecision(12)),
                unit: "px",
              } as ThemeTokenLeaf)
            : evaluation.leaf;
        // 3. Colour parity at the tolerance the value's own space declares:
        // an sRGB-path leaf is granted nothing, an oklab-derived one rides the
        // gamut mapping's width. One tolerance for both would let an oklab
        // width through on a leaf that never left sRGB.
        const viaOklab = OKLAB_DERIVED.test(raw) || OKLAB_DERIVED.test(resolution.value);
        const tolerance = viaOklab
          ? TOKEN_EMISSION_BOUNDS.oklabSrgbChannelTolerance * 255
          : TOKEN_EMISSION_BOUNDS.srgbChannelTolerance;
        if (leaf.kind === "color") compared[viaOklab ? "oklab" : "srgb"] += 1;
        if (!leavesAgree(leaf, fromCss, tolerance)) {
          mismatches.push(
            `${channel}: document=${serializeLeaf(leaf)} artifact=${serializeLeaf(fromCss)} at ${viaOklab ? "oklab" : "srgb"} tolerance ${tolerance}`
          );
        }
      }
      expect(mismatches.slice(0, 20)).toEqual([]);
      // Non-vacuity, per leg: neither tolerance is a branch nothing reaches.
      // Measured on the lot's tree: rottay and evnto 1061 sRGB + 4 oklab,
      // bithire 1177 + 51, identical in both modes and at both denominators.
      expect(Object.keys(declared).length).toBeGreaterThan(2500);
      expect(compared.srgb).toBeGreaterThan(900);
      expect(compared.oklab).toBeGreaterThan(0);
    });

    it("4. non-vacuity: the document is a population, not a sample", () => {
      expect(Object.keys(document.tokens).length).toBeGreaterThan(2500);
      // Pinned from the lot's first green run (rottay/evnto 249, bithire 228).
      // A refusal here is the emitter declining to report a value the root
      // document genuinely cannot carry; it is not tightened below what the
      // tree measures. Decrease-only.
      expect(document.unresolved.length).toBeLessThanOrEqual(260);
      expect(document.unresolved.length).toBeGreaterThan(0);
      expect(document.environment).toEqual(environment);
      expect(document.formatVersion).toBe(1);
    });
  });
});
