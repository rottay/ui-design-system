/**
 * The `avatar` vocabulary at rest: produced channels equal the Modern skin
 * fallbacks in their mode, and higher-ranked statements still win.
 *
 * The four geometry channels `--ds-avatar-{xs,sm,lg,xl}-size` are deliberately
 * NOT produced here: the engine-agnostic presentation base already declares
 * them at 1.5/2/3/3.5rem, and the Modern skin now reads each one through a
 * chained fallback to the spacing rung that rests at the same value
 * (`--ds-spacing-{6,8,12,14}`), so a size the base never states still lands
 * on a produced root instead of an invalid bare read. `--ds-avatar-ink` stays
 * unproduced too: its read fallback is the keyword `inherit`, which no
 * governed root reproduces, and the skin itself declares the channel
 * `initial` as the caller's hatch, so there is nothing to wire.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";
import postcss from "postcss";

import { parseHex, relativeLuminanceOf, ratioFromLuminance, type Rgb255 } from "@/foundation/kernel/color/contrast";
import { resolveChannel, type Bundle } from "@checks/tokens/cascade/preservation";

import type { FlatTheme, FlatThemeMode } from "@/foundation/contracts/composition/tenants/themes";
import {
  describeFamilyContract,
  FIXTURE_TENANT_FACTS,
  type FamilyFixture,
} from "@tests/support/family-contract";
import { firstPartyFixture, lowerFlatThemeFixture } from "@tests/support/theme-lowering";
import type { FamilyDeriver } from "../../../../../foundation/contract";
import { buildLoweringContext, runDerivation } from "../../../../pipeline";
import { avatarChromeDeriver } from "..";

const MINIMAL_THEME: FlatTheme = { id: "minimal", name: "Minimal" };

const FIXTURES: readonly FamilyFixture[] = [
  { label: "rottay", theme: firstPartyFixture("rottay") },
  { label: "bithire", theme: firstPartyFixture("bithire") },
  { label: "evnto", theme: firstPartyFixture("evnto") },
  { label: "minimal", theme: MINIMAL_THEME },
  {
    label: "bithire under a tenant floor",
    theme: firstPartyFixture("bithire"),
    tenant: FIXTURE_TENANT_FACTS,
  },
  {
    label: "minimal under a tenant floor",
    theme: MINIMAL_THEME,
    tenant: FIXTURE_TENANT_FACTS,
  },
];

describeFamilyContract(avatarChromeDeriver, FIXTURES);

const SKIN = readFileSync(
  resolve(process.cwd(), "src/foundation/tokens/css/runtime/engines/modern/skin/avatar/index.css"),
  "utf8"
).replace(/\/\*[\s\S]*?\*\//g, "");

const normalise = (value: string) =>
  value.replace(/\s+/g, " ").replace(/\( /g, "(").replace(/ \)/g, ")").trim();

/** Every distinct fallback the skin states for `channel`. */
function skinFallbacks(channel: string): string[] {
  const found = new Set<string>();
  for (const match of SKIN.matchAll(/var\(\s*(--ds-[a-z0-9-]+)\s*,/g)) {
    if (match[1] !== channel) continue;
    const start = (match.index ?? 0) + match[0].length;
    let end = start;
    for (let depth = 1; depth > 0; end += 1) {
      if (SKIN[end] === "(") depth += 1;
      else if (SKIN[end] === ")") depth -= 1;
    }
    found.add(normalise(SKIN.slice(start, end - 1)));
  }
  return [...found];
}

const SIZE_CHAINS: Record<string, string> = {
  "--ds-avatar-xs-size": "var(--ds-spacing-6, 1.5rem)",
  "--ds-avatar-sm-size": "var(--ds-spacing-8, 2rem)",
  "--ds-avatar-lg-size": "var(--ds-spacing-12, 3rem)",
  "--ds-avatar-xl-size": "var(--ds-spacing-14, 3.5rem)",
};

const MODES = ["light", "dark"] as const;
const OVERRIDE_RANKS = ["verticalOverride", "tenant"] as const;
const SOLID_TONES = ["secondary", "success", "warning", "error"] as const;
const context = (mode: FlatThemeMode = "light") => buildLoweringContext({ theme: firstPartyFixture("bithire"), mode });

describe("chrome/avatar", () => {
  it("states every declared channel at the resting values the skin reads in light and dark", () => {
    const derived = avatarChromeDeriver.derive(context(), {});
    const dark = new Map(Object.entries(avatarChromeDeriver.derive(context("dark"), {})));
    expect(Object.keys(derived).sort()).toEqual([...avatarChromeDeriver.produces].sort());
    for (const [channel, value] of Object.entries(derived)) {
      if (channel === "--ds-avatar-initials-tracking") continue;
      expect({ channel, fallbacks: skinFallbacks(channel) }).toEqual({ channel, fallbacks: [...new Set([value, dark.get(channel)])] });
    }
  });

  it("pins the pre-existing initials-tracking divergence (outside this lot's census)", () => {
    const derived = avatarChromeDeriver.derive(context(), {});
    expect(derived["--ds-avatar-initials-tracking"]).toBe("var(--ds-letter-spacing-wide, 0.025em)");
    expect(skinFallbacks("--ds-avatar-initials-tracking")).toEqual(["0.01em"]);
  });

  it("does not produce the size channels the presentation base declares", () => {
    const derived = avatarChromeDeriver.derive(context(), {});
    for (const name of Object.keys(SIZE_CHAINS)) {
      expect(derived[name]).toBeUndefined();
    }
  });

  it("reads every size channel through its spacing-rung chain, never bare", () => {
    for (const [name, chain] of Object.entries(SIZE_CHAINS)) {
      expect({ channel: name, fallbacks: skinFallbacks(name) }).toEqual({ channel: name, fallbacks: [chain] });
      expect(new RegExp(`var\\(\\s*${name}\\s*\\)`).test(SKIN), name).toBe(false);
    }
  });

  it("does not produce the caller-hatch ink channel", () => {
    const derived = avatarChromeDeriver.derive(context(), {});
    expect(derived["--ds-avatar-ink"]).toBeUndefined();
    // Unset, the hatch falls to the variant's governed resting ink before
    // inheriting (10194feca: an unset hatch used to paint inherited body text
    // on every solid fill). The resting ink is skin-owned, not derived.
    expect(derived["--ds-avatar-ink-resting"]).toBeUndefined();
    expect(skinFallbacks("--ds-avatar-ink")).toEqual(["var(--ds-avatar-ink-resting, inherit)"]);
  });

  it("names only its own family namespace", () => {
    for (const channel of avatarChromeDeriver.produces) {
      expect(channel.startsWith("--ds-avatar-")).toBe(true);
    }
  });

  it("yields every channel to a vertical or tenant statement of it", () => {
    const channels = Object.keys(avatarChromeDeriver.derive(context(), {}));
    for (const rank of OVERRIDE_RANKS) {
      const stated: FamilyDeriver = {
        family: `stated-${rank}`,
        rank,
        consumes: ["chrome.*"],
        produces: avatarChromeDeriver.produces,
        derive: () => Object.fromEntries(channels.map((channel) => [channel, rank])),
      };
      const result = runDerivation(context(), [avatarChromeDeriver, stated]);
      for (const channel of channels) {
        expect(result.channels[channel]).toBe(rank);
        expect(result.provenance.get(channel)?.rank).toBe(rank);
      }
    }
  });
});

const LIGHT_FILLS = new Map([
  ["--ds-avatar-secondary-solid-bg", "color-mix(in srgb, var(--ds-color-secondary) 82%, var(--ds-color-neutral-900) 18%)"],
  ["--ds-avatar-success-solid-bg", "color-mix(in srgb, var(--ds-color-success) 62%, var(--ds-color-neutral-900) 38%)"],
  ["--ds-avatar-warning-solid-bg", "color-mix(in srgb, var(--ds-color-warning) 55%, var(--ds-color-neutral-900) 45%)"],
  ["--ds-avatar-error-solid-bg", "color-mix(in srgb, var(--ds-color-error) 78%, var(--ds-color-neutral-900) 22%)"],
]);
const FOUNDATION = postcss.parse(readFileSync(
  resolve(process.cwd(), "src/foundation/tokens/css/foundation/themes/default/index.css"), "utf8"
));
const VERTICALS = ["rottay", "bithire", "evnto"] as const;
const COMPILED = VERTICALS.map((vertical) => ({
  vertical,
  compilation: lowerFlatThemeFixture({ flatTheme: firstPartyFixture(vertical) }),
}));

/** Compose current foundation declarations with the compiler's real per-mode deltas. */
function resolvedScope(compilation: typeof COMPILED[number]["compilation"], mode: FlatThemeMode): Map<string, string> {
  const scope = new Map<string, string>();
  FOUNDATION.walkRules((rule) => {
    if (rule.selector === ":root" || (mode === "dark" && rule.selector.includes(":root[data-theme='dark']"))) {
      rule.walkDecls((declaration) => { scope.set(declaration.prop, declaration.value); });
    }
  });
  for (const entry of Object.entries(compilation.cssVariables)) scope.set(...entry);
  for (const block of compilation.modeBlocks ?? []) {
    if (block.mode === mode) {
      for (const entry of Object.entries(block.cssVariables)) scope.set(...entry);
    }
  }
  return scope;
}

/** Resolve the emitted var graph, then evaluate its opaque sRGB mix without rounding. */
function resolvedColor(scope: Map<string, string>, channel: string): Rgb255 {
  const bundle: Bundle = { path: "avatar source scope", declarations: scope, sites: new Map() };
  const value = resolveChannel(bundle, channel);
  if (!value) throw new Error(`Unresolved ${channel}`);
  const plain = parseHex(value);
  if (plain) return plain;
  const mix = value.match(/^color-mix\(in srgb,\s*(?<first>#[\da-f]+)\s+(?<weight>[\d.]+)%,\s*(?<second>#[\da-f]+)\s+(?<rest>[\d.]+)%\)$/i)?.groups;
  if (!mix) throw new Error(`Unmeasured ${channel}: ${value}`);
  const first = parseHex(mix.first);
  const second = parseHex(mix.second);
  if (!first || !second || Number(mix.weight) + Number(mix.rest) !== 100) throw new Error(value);
  const weight = Number(mix.weight) / 100;
  const rest = Number(mix.rest) / 100;
  return { r: first.r * weight + second.r * rest, g: first.g * weight + second.g * rest, b: first.b * weight + second.b * rest };
}

/** Measure the actual solid fill against the initials ink through the shared WCAG owner. */
function solidRatio(scope: Map<string, string>, tone: string): number {
  return ratioFromLuminance(
    relativeLuminanceOf(resolvedColor(scope, `--ds-avatar-${tone}-solid-bg`)),
    relativeLuminanceOf(resolvedColor(scope, `--ds-avatar-${tone}-ink`))
  );
}

describe("chrome/avatar mode contrast", () => {
  it("reproduces the prior dark failures and retains bithire secondary's negative result", () => {
    for (const { vertical, compilation } of COMPILED) {
      const scope = resolvedScope(compilation, "dark");
      for (const entry of LIGHT_FILLS) scope.set(...entry);
      for (const tone of SOLID_TONES) {
        const ratio = solidRatio(scope, tone);
        if (vertical === "bithire" && tone === "secondary") expect(ratio).toBeGreaterThan(10);
        else expect(ratio, `${vertical}/${tone} inherited failure`).toBeLessThan(4.5);
      }
    }
  });

  it("changes only the light secondary recipe and never reduces a passing tone's contrast", () => {
    const light = new Map(Object.entries(avatarChromeDeriver.derive(context("light"), {})));
    for (const [channel, value] of LIGHT_FILLS) {
      if (channel !== "--ds-avatar-secondary-solid-bg") expect(light.get(channel)).toBe(value);
    }
    for (const { vertical, compilation } of COMPILED) {
      const before = resolvedScope(compilation, "light");
      for (const entry of LIGHT_FILLS) before.set(...entry);
      const after = resolvedScope(compilation, "light");
      for (const tone of SOLID_TONES) {
        expect(solidRatio(after, tone), `${vertical}/${tone}`).toBeGreaterThanOrEqual(solidRatio(before, tone));
        if (tone !== "secondary") expect(solidRatio(after, tone)).toBe(solidRatio(before, tone));
      }
    }
  });

  it("clears 4.5:1 on all dark solid tones with actual resolved source palettes", () => {
    for (const { vertical, compilation } of COMPILED) {
      const scope = resolvedScope(compilation, "dark");
      for (const tone of SOLID_TONES) {
        expect(solidRatio(scope, tone), `${vertical}/${tone}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("retains distinct tenant palette fills instead of replacing them with a shared neutral", () => {
    const rottay = resolvedScope(COMPILED.find((row) => row.vertical === "rottay")!.compilation, "dark");
    const bithire = resolvedScope(COMPILED.find((row) => row.vertical === "bithire")!.compilation, "dark");
    for (const tone of SOLID_TONES) {
      const channel = `--ds-avatar-${tone}-solid-bg`;
      expect(resolvedColor(rottay, channel)).not.toEqual(resolvedColor(bithire, channel));
      const changed = new Map(bithire);
      changed.set(`--ds-color-${tone}`, "#abcdef");
      expect(resolvedColor(changed, channel)).not.toEqual(resolvedColor(bithire, channel));
    }
  });

  it("bounds dark fills even at white and black seeds with each governed neutral temperature", () => {
    const temperatures = ["neutral", "warm", "cool"] as const;
    const extremes = ["#ffffff", "#000000"] as const;
    for (const neutralTemperature of temperatures) {
      const theme: FlatTheme = { ...firstPartyFixture("bithire"), palette: { neutralTemperature } };
      const compilation = lowerFlatThemeFixture({ flatTheme: theme });
      for (const tone of SOLID_TONES) {
        for (const seed of extremes) {
          const scope = resolvedScope(compilation, "dark");
          scope.set(`--ds-color-${tone}`, seed);
          expect(solidRatio(scope, tone), `${neutralTemperature}/${tone}/${seed}`).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });

  it("moves only the four non-primary fills between modes", () => {
    const light = new Map(Object.entries(avatarChromeDeriver.derive(context("light"), {})));
    const dark = new Map(Object.entries(avatarChromeDeriver.derive(context("dark"), {})));
    const changed = [...light].filter(([name, value]) => dark.get(name) !== value).map(([name]) => name).sort();
    expect(changed).toEqual([...LIGHT_FILLS.keys()].sort());
    expect(light.get("--ds-avatar-primary-solid-bg")).toBe("var(--ds-color-primary)");
    expect(light.get("--ds-avatar-primary-ink")).toBe("var(--ds-color-primary-foreground, var(--ds-color-text-inverse))");
  });

  it("yields dark fills and inks to both vertical and tenant authored channels", () => {
    for (const mode of MODES) {
      for (const rank of OVERRIDE_RANKS) {
        const authored: FamilyDeriver = {
          family: `authored-avatar-${rank}`, rank, consumes: ["chrome.*"], produces: avatarChromeDeriver.produces,
          derive: () => Object.fromEntries(avatarChromeDeriver.produces.map((channel) => [channel, "#123456"])),
        };
        const result = new Map(Object.entries(runDerivation(context(mode), [avatarChromeDeriver, authored]).channels));
        for (const channel of avatarChromeDeriver.produces) expect(result.get(channel)).toBe("#123456");
      }
    }
  });

  it("matches each uncompiled dark fallback and preserves caller-first paint", () => {
    const skin = postcss.parse(SKIN);
    const dark = new Map(Object.entries(avatarChromeDeriver.derive(context("dark"), {})));
    for (const tone of SOLID_TONES) {
      const matching: string[] = [];
      skin.walkRules((rule) => {
        if (rule.selector.startsWith(":where(:root[data-theme='dark'], html.dark)") && rule.selector.includes(`[data-variant='${tone}']`)) {
          rule.walkDecls("background", (declaration) => { matching.push(declaration.value); });
        }
      });
      expect(matching).toEqual([`var(--ds-avatar-custom-bg, var(--ds-avatar-${tone}-solid-bg, ${dark.get(`--ds-avatar-${tone}-solid-bg`)}))`]);
    }
    expect(SKIN).toContain("color: var(--ds-avatar-ink, var(--ds-avatar-ink-resting, inherit));");
  });
});


const NAMED_SOLIDS = ["primary", ...SOLID_TONES] as const;

describe("chrome/avatar light secondary contrast", () => {
  it("reproduces only the two current light failures against actual initials ink", () => {
    for (const { vertical, compilation } of COMPILED) {
      const scope = resolvedScope(compilation, "light");
      for (const entry of LIGHT_FILLS) scope.set(...entry);
      for (const tone of NAMED_SOLIDS) {
        const ratio = solidRatio(scope, tone);
        if (vertical !== "bithire" && tone === "secondary") {
          expect(resolvedColor(scope, "--ds-avatar-secondary-ink")).toEqual({ r: 255, g: 255, b: 255 });
          expect(ratio).toBeCloseTo(3.1947975038587746, 12);
          expect(ratio).toBeLessThan(4.5);
        } else expect(ratio, `${vertical}/${tone} passing control`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("clears 4.5:1 for all named solids in all first-party light and dark palettes", () => {
    for (const { vertical, compilation } of COMPILED) {
      for (const mode of MODES) {
        const scope = resolvedScope(compilation, mode);
        for (const tone of NAMED_SOLIDS) {
          expect(solidRatio(scope, tone), `${vertical}/${mode}/${tone}`).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });

  it("keeps accepted dark recipes and light primary, inks and non-secondary channels exact", () => {
    const light = new Map(Object.entries(avatarChromeDeriver.derive(context("light"), {})));
    const dark = new Map(Object.entries(avatarChromeDeriver.derive(context("dark"), {})));
    for (const tone of SOLID_TONES) {
      expect(dark.get(`--ds-avatar-${tone}-solid-bg`)).toBe(
        `color-mix(in srgb, var(--ds-color-${tone}) 45%, var(--ds-color-neutral-ink, var(--ds-color-black)) 55%)`
      );
      expect(light.get(`--ds-avatar-${tone}-ink`)).toBe("var(--ds-color-white)");
      expect(dark.get(`--ds-avatar-${tone}-ink`)).toBe(light.get(`--ds-avatar-${tone}-ink`));
    }
    for (const [name, value] of light) {
      if (!LIGHT_FILLS.has(name)) expect(dark.get(name)).toBe(value);
    }
    expect(light.get("--ds-avatar-primary-solid-bg")).toBe("var(--ds-color-primary)");
    expect(light.get("--ds-avatar-primary-ink")).toBe("var(--ds-color-primary-foreground, var(--ds-color-text-inverse))");
  });

  it("matches the uncompiled light fallback and keeps secondary responsive to each palette seed", () => {
    const light = new Map(Object.entries(avatarChromeDeriver.derive(context("light"), {})));
    const recipe = light.get("--ds-avatar-secondary-solid-bg");
    const matching: string[] = [];
    postcss.parse(SKIN).walkRules((rule) => {
      if (rule.selector.startsWith(".rottay-avatar.rottay-avatar--modern[data-variant='secondary']")) {
        rule.walkDecls("background", (declaration) => { matching.push(declaration.value); });
      }
    });
    expect(matching).toEqual([`var(--ds-avatar-custom-bg, var(--ds-avatar-secondary-solid-bg, ${recipe}))`]);
    const fills = new Map<string, Rgb255>();
    for (const { vertical, compilation } of COMPILED) {
      const scope = resolvedScope(compilation, "light");
      fills.set(vertical, resolvedColor(scope, "--ds-avatar-secondary-solid-bg"));
      const changed = new Map(scope);
      changed.set("--ds-color-secondary", "#abcdef");
      expect(resolvedColor(changed, "--ds-avatar-secondary-solid-bg")).not.toEqual(fills.get(vertical));
    }
    expect(fills.get("rottay")).not.toEqual(fills.get("bithire"));
    expect(fills.get("evnto")).toEqual(fills.get("rottay"));
  });
});
