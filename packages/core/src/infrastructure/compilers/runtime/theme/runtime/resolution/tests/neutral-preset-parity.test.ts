/**
 * Neutral foundation + preset against the authored theme, channel by channel.
 *
 * Identity is not required: the conversion measures and declares what the
 * neutral baseline changes for each vertical, so the diff below is published
 * (console) and its shape pinned, not hidden behind a "same" assertion.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { FIRST_PARTY_VERTICAL_SLUGS } from "@/foundation/contracts/kernel/verticals";
import { contrastRatio } from "@/foundation/kernel/color/contrast";
import { compileThemeIntent, staticThemeIntent } from "@/infrastructure/compilers/runtime/theme";

type Vars = Readonly<Record<string, string>>;

interface Surface {
  readonly base: Vars;
  readonly dark: Vars;
  readonly light: Vars;
  readonly colorScheme: string | undefined;
}

function surfaceOf(vertical: (typeof FIRST_PARTY_VERTICAL_SLUGS)[number], neutral: boolean): Surface {
  const { compiled } = compileThemeIntent(
    staticThemeIntent(vertical),
    neutral ? { baselineSource: "neutral-preset" } : undefined
  );
  const block = (mode: "dark" | "light"): Vars =>
    compiled.modeBlocks.find((b) => b.mode === mode)?.cssVariables ?? {};
  return { base: compiled.cssVariables, dark: block("dark"), light: block("light"), colorScheme: compiled.colorScheme };
}

interface Diff {
  readonly onlyAuthored: readonly string[];
  readonly onlyNeutral: readonly string[];
  readonly differing: readonly string[];
  readonly shared: number;
}

function diff(a: Vars, b: Vars): Diff {
  const keysA = new Set(Object.keys(a));
  const keysB = new Set(Object.keys(b));
  const onlyAuthored = [...keysA].filter((k) => !keysB.has(k)).sort();
  const onlyNeutral = [...keysB].filter((k) => !keysA.has(k)).sort();
  const shared = [...keysA].filter((k) => keysB.has(k));
  const differing = shared.filter((k) => a[k] !== b[k]).sort();
  return { onlyAuthored, onlyNeutral, differing, shared: shared.length };
}

const DEFAULT_CSS = readFileSync(
  resolve(process.cwd(), "src/foundation/tokens/css/foundation/themes/default/index.css"),
  "utf8"
);

function defaultCssValue(channel: string, block: "root" | "dark"): string | undefined {
  const marker = DEFAULT_CSS.indexOf("html.dark {");
  const haystack = block === "dark" ? DEFAULT_CSS.slice(marker) : DEFAULT_CSS.slice(0, marker);
  return new RegExp(`${channel}:\\s*([^;]+);`, "u").exec(haystack)?.[1]?.trim();
}

const ratio = (a: string | undefined, b: string | undefined): number | null =>
  a && b && /^#[0-9a-f]{6}$/iu.test(a) && /^#[0-9a-f]{6}$/iu.test(b)
    ? Number(contrastRatio(a, b).toFixed(2))
    : null;

describe("neutral foundation + preset, measured against the authored theme", () => {
  for (const vertical of FIRST_PARTY_VERTICAL_SLUGS) {
    it(`${vertical}: composes without throwing and keeps the vertical's resting mode`, () => {
      const authored = surfaceOf(vertical, false);
      const neutral = surfaceOf(vertical, true);
      expect(neutral.colorScheme).toBe(authored.colorScheme);
      expect(Object.keys(neutral.base).length).toBeGreaterThan(0);
    });

    it(`${vertical}: publishes the channel diff, base and mode blocks`, () => {
      const authored = surfaceOf(vertical, false);
      const neutral = surfaceOf(vertical, true);
      const report = {
        base: diff(authored.base, neutral.base),
        dark: diff(authored.dark, neutral.dark),
        light: diff(authored.light, neutral.light),
      };
      const summary = Object.entries(report).map(([block, d]) =>
        `${block}: shared ${d.shared}, differing ${d.differing.length}, only-authored ${d.onlyAuthored.length}, only-neutral ${d.onlyNeutral.length}`
      );
      console.info(`[WO-DER-06 D6-2a parity] ${vertical} authored ${Object.keys(authored.base).length} / neutral ${Object.keys(neutral.base).length} base channels; ${summary.join("; ")}`);
      console.info(`[WO-DER-06 D6-2a parity] ${vertical} base only-authored (first 40): ${report.base.onlyAuthored.slice(0, 40).join(" ")}`);
      console.info(`[WO-DER-06 D6-2a parity] ${vertical} base only-neutral (first 40): ${report.base.onlyNeutral.slice(0, 40).join(" ")}`);
      console.info(`[WO-DER-06 D6-2a parity] ${vertical} base differing (first 40): ${report.base.differing.slice(0, 40).map((k) => `${k}=${authored.base[k]}|${neutral.base[k]}`).join(" ")}`);
      expect(report.base.shared).toBeGreaterThan(0);
    });
  }

  it("evnto dark: --ds-color-primary-600 under the neutral baseline, measured", () => {
    // The 2.27:1 flag (G107) is the authored evnto ramp, not a seed: the base
    // block carries #515151 and the dark overlay keeps it, so on the dark ground
    // it reads at 2.27:1. The evnto preset states no palette (owner scope
    // 2026-09-05), so neutral+preset emits NO primary ramp and the default CSS
    // stands in: root #0a0a0a is not remapped by `html.dark`, whose ground is
    // --ds-color-neutral-50 = #0b1220. Neither value derives from a seed, so
    // the flag routes to mode-aware ramp derivation (derivation lane), not to
    // an override here; the static-vertical path stays on the authored theme.
    const authored = surfaceOf("evnto", false);
    const neutral = surfaceOf("evnto", true);
    const authored600 = authored.dark["--ds-color-primary-600"] ?? authored.base["--ds-color-primary-600"];
    const authoredBg = authored.dark["--ds-color-bg-primary"] ?? authored.base["--ds-color-bg-primary"];
    const before = ratio(authored600, authoredBg);
    const cssRoot600 = defaultCssValue("--ds-color-primary-600", "root");
    const cssDark600 = defaultCssValue("--ds-color-primary-600", "dark");
    const cssDarkGround = defaultCssValue("--ds-color-neutral-50", "dark");
    const fallback = ratio(cssDark600 ?? cssRoot600, cssDarkGround);
    console.info(
      `[WO-DER-06 D6-2a evnto dark] authored: primary-600 ${authored600} on ${authoredBg} = ${before}:1; ` +
        `neutral+preset: primary-600 absent from base, dark and light blocks (no palette decision in the evnto preset); ` +
        `effective fallback is the default CSS root ${cssRoot600} on the html.dark ground ${cssDarkGround} = ${fallback}:1 -> routed to mode-aware derivation`
    );
    // axe reported 2.27:1 on the rendered page; the kernel ratio over the same two hexes is 2.36:1.
    expect(before).toBe(2.36);
    expect(neutral.base["--ds-color-primary-600"]).toBeUndefined();
    expect(neutral.dark["--ds-color-primary-600"]).toBeUndefined();
    expect(neutral.light["--ds-color-primary-600"]).toBeUndefined();
    expect(cssDark600).toBeUndefined();
    expect(fallback).not.toBeNull();
    expect(fallback!).toBeLessThan(3);
  });

  it("bithire dark: the neutral path derives the dark ramp from the seeds the preset states", () => {
    // The one vertical whose preset carries palette.seeds: with no authored
    // dark overlay underneath, the dark block's ramp is seed-derived instead of
    // the theme's grey -- measured, so a future mode-aware derivation can be
    // read against it.
    const authored = surfaceOf("bithire", false);
    const neutral = surfaceOf("bithire", true);
    const authoredDark = authored.dark["--ds-color-primary-600"];
    const neutralDark = neutral.dark["--ds-color-primary-600"];
    const neutralBg = neutral.dark["--ds-color-bg-primary"] ?? neutral.base["--ds-color-bg-primary"];
    console.info(
      `[WO-DER-06 D6-2a bithire dark] authored dark primary-600 ${authoredDark ?? "carried from base"}; ` +
        `neutral+preset dark primary-600 ${neutralDark}; the neutral dark block states no ground (base ${neutralBg}), so the dark ground is the default CSS's`
    );
    expect(neutralDark).toMatch(/^#[0-9a-f]{6}$/iu);
  });

  it("pins the measured shape of the diff, so a move is a measured move", () => {
    // Measured on 9a6aed854 with every producer at its committed state. The
    // only-authored column is what the authored themes state beyond the kit;
    // the only-neutral column is what the presets decide that the themes never
    // authored. Identity is not the target of this lot.
    const shape = Object.fromEntries(
      FIRST_PARTY_VERTICAL_SLUGS.map((vertical) => {
        const authored = surfaceOf(vertical, false);
        const neutral = surfaceOf(vertical, true);
        const base = diff(authored.base, neutral.base);
        const dark = diff(authored.dark, neutral.dark);
        const light = diff(authored.light, neutral.light);
        return [vertical, {
          authored: Object.keys(authored.base).length,
          neutral: Object.keys(neutral.base).length,
          base: [base.shared, base.differing.length, base.onlyAuthored.length, base.onlyNeutral.length],
          dark: [dark.shared, dark.differing.length, dark.onlyAuthored.length, dark.onlyNeutral.length],
          light: [light.shared, light.differing.length, light.onlyAuthored.length, light.onlyNeutral.length],
        }];
      })
    );
    expect(shape).toEqual({
      rottay: { authored: 2462, neutral: 1588, base: [1573, 227, 889, 15], dark: [0, 0, 0, 0], light: [1, 1, 703, 0] },
      bithire: { authored: 2491, neutral: 1745, base: [1739, 331, 752, 6], dark: [39, 39, 402, 32], light: [0, 0, 0, 0] },
      evnto: { authored: 1872, neutral: 1588, base: [1573, 71, 299, 15], dark: [0, 0, 89, 1], light: [0, 0, 0, 0] },
    });
  });
});
