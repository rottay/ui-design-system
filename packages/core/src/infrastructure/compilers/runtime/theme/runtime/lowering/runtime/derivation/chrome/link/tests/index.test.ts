/**
 * The `link` family produces one root scalar, the share of
 * `--ds-color-neutral-900` in the Modern hover ink, and the skin mixes the
 * variant tone it declares on the Link element at that share. These tests
 * prove the share follows `states.emphasis` with medium at the skin's own 30%
 * (tone 70%), every variant keeps its own hue, no other Link ink moves, and the
 * root never names the element-local tone.
 *
 * Channel text is substituted in two scopes -- the theme root, then the Link
 * element inheriting the root's resolved values -- which is a model of custom
 * property inheritance, not a CSS engine. Contrast and computed paint are not
 * measured here.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import {
  classifySemanticOwner,
  extractDirectVarsAssignments,
} from "@checks/tokens/cascade/channels/liveness/index.mjs";
import {
  describeFamilyContract,
  FIXTURE_TENANT_FACTS,
  type FamilyFixture,
} from "@tests/support/family-contract";
import { firstPartyFixture } from "@tests/support/theme-lowering";
import { FAMILY_DERIVERS } from "../../..";
import type { FamilyDeriver } from "../../../../../foundation/contract";
import { buildLoweringContext, runDerivation } from "../../../../pipeline";
import { deriveStateChannels } from "../../../states";
import { linkChromeDeriver } from "..";

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

describeFamilyContract(linkChromeDeriver, FIXTURES);

const SHARE = "--ds-link-hover-mix";
const DERIVER_SOURCE_PATH =
  "src/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/chrome/link/index.ts";

const SKIN = readFileSync(
  resolve(process.cwd(), "src/foundation/tokens/css/runtime/engines/modern/skin/link/index.css"),
  "utf8"
).replace(/\/\*[\s\S]*?\*\//g, "");

const normalise = (value: string) =>
  value.replace(/\s+/g, " ").replace(/\( /g, "(").replace(/ \)/g, ")").trim();

interface SkinRule {
  readonly at: readonly string[];
  readonly selector: string;
  readonly declarations: ReadonlyMap<string, string>;
}

/** The skin's leaf rules with their enclosing at-rules; values are normalised text. */
function skinRules(css: string): SkinRule[] {
  const rules: SkinRule[] = [];
  const stack: string[] = [];
  let start = 0;
  for (let index = 0; index < css.length; index += 1) {
    const char = css.charAt(index);
    if (char === "{") {
      stack.push(normalise(css.slice(start, index)));
      start = index + 1;
    } else if (char === "}") {
      const prelude = stack.pop();
      if (prelude !== undefined && !prelude.startsWith("@")) {
        const declarations = new Map<string, string>();
        for (const declaration of css.slice(start, index).split(";")) {
          const colon = declaration.indexOf(":");
          if (colon === -1) continue;
          declarations.set(declaration.slice(0, colon).trim(), normalise(declaration.slice(colon + 1)));
        }
        rules.push({ at: stack.filter((entry) => entry.startsWith("@")), selector: prelude, declarations });
      }
      start = index + 1;
    }
  }
  return rules;
}

const RULES = skinRules(SKIN);
const ROOT = ".rottay-link-shell.rottay-link-shell--modern[data-part='root']";
const HOVER_MEDIA = "@media (hover: hover)";

function declared(selector: string, property: string, at: readonly string[] = []): string {
  const found = RULES.filter(
    (rule) =>
      rule.selector === selector &&
      rule.declarations.has(property) &&
      rule.at.length === at.length &&
      rule.at.every((entry, index) => entry === at[index])
  );
  if (found.length !== 1) {
    throw new Error(`Expected one ${property} on ${selector}, found ${found.length}`);
  }
  return found[0]!.declarations.get(property)!;
}

const HOVER_SELECTOR = `${ROOT}:is([data-state~='hovered'], :hover)`;
const HOVER_INK = declared(HOVER_SELECTOR, "color", [HOVER_MEDIA]);

/** Every Link ink other than hover, which this family must not move. */
const OTHER_INKS = {
  rest: declared(ROOT, "color"),
  visited: declared(`${ROOT}:visited`, "color"),
  pressed: declared(`${ROOT}:is([data-state~='pressed'], :active)`, "color"),
  disabled: declared(`${ROOT}[data-disabled='true'][data-disabled='true']`, "color"),
} as const;

const VARIANTS = ["default", "primary", "secondary", "success", "warning", "danger"] as const;
type Variant = (typeof VARIANTS)[number];
const TONES = new Map<Variant, string>(
  VARIANTS.map((variant) => [variant, declared(`${ROOT}[data-variant='${variant}']`, "--ds-link-tone")])
);

/** The hover ink before this family existed: a literal 70/30 mix. */
const PREIMAGE_HOVER_INK =
  "var(--ds-link-hover-color, color-mix(in srgb, var(--ds-link-tone) 70%, var(--ds-color-neutral-900) 30%))";

/** Substitute test channel values only; this is not a CSS engine or a paint measurement. */
function substituteChannels(value: string, channels: ReadonlyMap<string, string>, depth = 0): string {
  if (depth > 32) throw new Error("Channel substitution did not settle");
  let result = "";
  let cursor = 0;
  for (let start = value.indexOf("var("); start !== -1; start = value.indexOf("var(", cursor)) {
    result += value.slice(cursor, start);
    let end = start + 4;
    let balance = 1;
    for (; balance > 0 && end < value.length; end += 1) {
      if (value.charAt(end) === "(") balance += 1;
      else if (value.charAt(end) === ")") balance -= 1;
    }
    if (balance !== 0) throw new Error("Unbalanced channel reference");
    const body = value.slice(start + 4, end - 1);
    const comma = body.indexOf(",");
    const name = (comma === -1 ? body : body.slice(0, comma)).trim();
    const chosen = channels.get(name) ?? (comma === -1 ? undefined : body.slice(comma + 1).trim());
    result += chosen === undefined ? value.slice(start, end) : substituteChannels(chosen, channels, depth + 1);
    cursor = end;
  }
  return result + value.slice(cursor);
}

const unresolved = (value: string) => /var\(\s*--/.test(value);

/**
 * A scope's computed custom properties. A value still naming an absent channel
 * is guaranteed-invalid, so a descendant reads it as missing (its fallback).
 */
function computedScope(declarations: ReadonlyMap<string, string>): Map<string, string> {
  const computed = new Map<string, string>();
  for (const [name, value] of declarations) {
    const settled = substituteChannels(value, declarations);
    if (!unresolved(settled)) computed.set(name, settled);
  }
  return computed;
}

const PALETTE: ReadonlyArray<readonly [string, string]> = [
  ["--ds-color-info", "#1d6fb8"],
  ["--ds-color-primary", "#2457a7"],
  ["--ds-color-secondary", "#6b4fa1"],
  ["--ds-color-success", "#1f7a4d"],
  ["--ds-color-warning", "#a35b00"],
  ["--ds-color-error", "#b3261e"],
  ["--ds-color-neutral-900", "#171717"],
  ["--ds-color-text-secondary", "#5c5c5c"],
  ["--ds-color-text-disabled", "#9a9a9a"],
];

const POSTURES = ["subtle", "medium", "strong"] as const;
type Posture = (typeof POSTURES)[number];

/** The theme root's declarations under one emphasis posture. */
function rootDeclarations(posture: Posture, theme: FlatTheme = MINIMAL_THEME): Map<string, string> {
  const themed: FlatTheme = { ...theme, surfaces: { ...theme.surfaces, stateEmphasis: posture } };
  return new Map([
    ...PALETTE,
    ...Object.entries(deriveStateChannels(themed)),
    ...Object.entries(linkChromeDeriver.derive(buildLoweringContext({ theme: themed }), {})),
  ]);
}

/** A Link element: the root's computed values inherited, plus its own variant tone. */
function linkElement(root: ReadonlyMap<string, string>, variant: Variant): Map<string, string> {
  const element = computedScope(root);
  element.set("--ds-link-tone", substituteChannels(TONES.get(variant)!, element));
  return element;
}

function splitTopLevel(text: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < text.length; index += 1) {
    const char = text.charAt(index);
    if (char === "(") depth += 1;
    else if (char === ")") depth -= 1;
    else if (char === "," && depth === 0) {
      parts.push(text.slice(start, index).trim());
      start = index + 1;
    }
  }
  parts.push(text.slice(start).trim());
  return parts;
}

/** Settle a literal percentage or a `calc(a% + b%)` sum; nothing else is accepted. */
function settlePercent(text: string): number {
  const literal = /^(\d+(?:\.\d+)?)%$/.exec(text);
  if (literal) return Number(literal[1]);
  const sum = /^calc\((\d+(?:\.\d+)?)% \+ (\d+(?:\.\d+)?)%\)$/.exec(text);
  if (sum) return Number(sum[1]) + Number(sum[2]);
  throw new Error(`Unsettled percentage: ${text}`);
}

function operand(text: string): { readonly color: string; readonly percent?: number } {
  const match = /^(\S+) (\d+(?:\.\d+)?%|calc\([^()]*\))$/.exec(text);
  return match ? { color: match[1]!, percent: settlePercent(match[2]!) } : { color: text };
}

interface Mix {
  readonly tone: string;
  readonly tonePercent: number;
  readonly ink: string;
  readonly inkPercent: number;
}

/** Read `color-mix(in srgb, A [p1], B [p2])`, an omitted share being the other's complement. */
function readMix(value: string): Mix {
  const match = /^color-mix\(in srgb, ([\s\S]*)\)$/.exec(normalise(value));
  if (!match) throw new Error(`Not an srgb color-mix: ${value}`);
  const parts = splitTopLevel(match[1]!);
  if (parts.length !== 2) throw new Error(`Expected two operands: ${value}`);
  const tone = operand(parts[0]!);
  const ink = operand(parts[1]!);
  const tonePercent = tone.percent ?? (ink.percent === undefined ? 50 : 100 - ink.percent);
  return { tone: tone.color, tonePercent, ink: ink.color, inkPercent: ink.percent ?? 100 - tonePercent };
}

const hoverMix = (element: ReadonlyMap<string, string>, ink = HOVER_INK) =>
  readMix(substituteChannels(ink, element));

describe("chrome/link registration", () => {
  it("is registered once, at rank derived, producing only the hover share", () => {
    expect(FAMILY_DERIVERS.filter((deriver) => deriver === linkChromeDeriver)).toHaveLength(1);
    expect(linkChromeDeriver.family).toBe("link");
    expect(linkChromeDeriver.rank).toBe("derived");
    expect(linkChromeDeriver.produces).toEqual([SHARE]);
    expect(linkChromeDeriver.consumes).toEqual(["surfaces.stateEmphasis"]);
  });

  it("reaches the compiled channel set through the registry with link provenance", () => {
    const result = runDerivation(buildLoweringContext({ theme: MINIMAL_THEME }));
    expect(result.channels[SHARE]).toBe("calc(var(--ds-state-hover-shift, 4%) + 26%)");
    expect(result.provenance.get(SHARE)).toEqual({ family: "link", rank: "derived" });
    expect(result.channels["--ds-state-hover-shift"]).toBe("4%");
  });

  it("states the share in the literal shape the producer census reads, owned by chrome.link", () => {
    const source = readFileSync(resolve(process.cwd(), DERIVER_SOURCE_PATH), "utf8");
    expect([...extractDirectVarsAssignments(source).keys()]).toEqual([SHARE]);
    // A computed key emits the same channel and is invisible to the census.
    const computedKey = source.replace(`vars["${SHARE}"]`, "vars[SHARE_NAME]");
    expect([...extractDirectVarsAssignments(computedKey).keys()]).toEqual([]);
    expect(classifySemanticOwner(SHARE)).toBe("chrome.link");
  });

  it("is read once by the Modern skin, with the medium share as its fallback", () => {
    const reads = [...SKIN.matchAll(/var\(\s*--ds-link-hover-mix\s*,\s*([^()]*)\)/g)];
    expect(reads.map((match) => match[1]!.trim())).toEqual(["30%"]);
    expect(SKIN.match(/--ds-link-hover-mix/g)).toHaveLength(1);
    expect(HOVER_INK).toContain("var(--ds-link-hover-mix, 30%)");
  });
});

describe("link hover share at the theme root", () => {
  it.each(FIXTURES)("never names the element-local tone and settles at the root ($label)", ({ theme, tenant }) => {
    const derived = linkChromeDeriver.derive(buildLoweringContext({ theme, tenant }), {});
    expect(Object.keys(derived)).toEqual([SHARE]);
    expect(derived[SHARE]).not.toContain("--ds-link-tone");
    const root = computedScope(new Map([...Object.entries(deriveStateChannels(theme)), ...Object.entries(derived)]));
    expect(root.has(SHARE)).toBe(true);
    expect(unresolved(root.get(SHARE)!)).toBe(false);
  });

  it("refuses the two producers this family replaces: a tone-reading colour is inert, a tone-free one flattens", () => {
    const toneReading = rootDeclarations("strong");
    toneReading.set(
      "--ds-link-hover-color",
      "color-mix(in srgb, var(--ds-link-tone) calc(100% - var(--ds-state-hover-shift)), var(--ds-color-neutral-900))"
    );
    expect(computedScope(toneReading).has("--ds-link-hover-color")).toBe(false);
    const inert = hoverMix(linkElement(toneReading, "success"), PREIMAGE_HOVER_INK);
    expect(inert.inkPercent).toBe(30);

    const toneFree = rootDeclarations("strong");
    toneFree.set("--ds-link-hover-color", "color-mix(in srgb, var(--ds-color-primary) 66%, var(--ds-color-neutral-900))");
    const flattened = new Set(
      VARIANTS.map((variant) => substituteChannels(HOVER_INK, linkElement(toneFree, variant)))
    );
    expect(flattened.size).toBe(1);
  });
});

describe("link hover emphasis on the element", () => {
  it("moves the share with the posture and keeps medium at exactly 70/30", () => {
    const shares = POSTURES.map((posture) => hoverMix(linkElement(rootDeclarations(posture), "default")));
    expect(shares.map(({ tonePercent, inkPercent }) => [tonePercent, inkPercent])).toEqual([
      [72, 28],
      [70, 30],
      [66, 34],
    ]);
    const medium = linkElement(rootDeclarations("medium"), "default");
    expect(hoverMix(medium)).toEqual(hoverMix(medium, PREIMAGE_HOVER_INK));
  });

  it("follows the hover delta only", () => {
    const root = rootDeclarations("medium");
    const baseline = hoverMix(linkElement(root, "primary"));
    const moved = new Map(root);
    moved.set("--ds-state-hover-shift", "11%");
    expect(hoverMix(linkElement(moved, "primary")).inkPercent).toBe(37);
    const unrelated = new Map(root);
    for (const name of [
      "--ds-state-active-shift",
      "--ds-state-selected-shift",
      "--ds-state-disabled-mix",
      "--ds-state-disabled-opacity",
      "--ds-state-press-scale",
    ]) {
      unrelated.set(name, "29%");
    }
    expect(hoverMix(linkElement(unrelated, "primary"))).toEqual(baseline);
  });

  it.each(POSTURES)("keeps every variant on its own hue under %s emphasis", (posture) => {
    const root = rootDeclarations(posture);
    const mixes = VARIANTS.map((variant) => {
      const element = linkElement(root, variant);
      const mix = hoverMix(element);
      expect(mix.tone, variant).toBe(element.get("--ds-link-tone"));
      expect(mix.ink).toBe("#171717");
      return mix;
    });
    expect(new Set(mixes.map(({ tone }) => tone)).size).toBe(VARIANTS.length);
    expect(new Set(mixes.map(({ inkPercent }) => inkPercent)).size).toBe(1);
    expect(mixes.map(({ tone }) => tone)).toEqual(["#1d6fb8", "#2457a7", "#6b4fa1", "#1f7a4d", "#a35b00", "#b3261e"]);
  });

  it("leaves the rest, visited, pressed and disabled inks and the hover underline untouched", () => {
    for (const variant of VARIANTS) {
      const settled = POSTURES.map((posture) => {
        const element = linkElement(rootDeclarations(posture), variant);
        return Object.fromEntries(
          Object.entries(OTHER_INKS).map(([state, ink]) => [state, substituteChannels(ink, element)])
        );
      });
      expect(settled[0]).toEqual(settled[1]);
      expect(settled[2]).toEqual(settled[1]);
    }
    expect(Object.values(OTHER_INKS).some((ink) => ink.includes(SHARE))).toBe(false);
    expect(OTHER_INKS.rest).toBe("color-mix(in srgb, var(--ds-link-tone) 84%, var(--ds-color-neutral-900) 16%)");
    expect(OTHER_INKS.pressed).toBe(
      "var(--ds-link-active-color, color-mix(in srgb, var(--ds-link-tone) 58%, var(--ds-color-neutral-900) 42%))"
    );
    expect(declared(HOVER_SELECTOR, "text-underline-offset", [HOVER_MEDIA])).toBe(
      "var(--ds-link-underline-offset-hover, 3px)"
    );
    expect(declared(HOVER_SELECTOR, "text-decoration-thickness", [HOVER_MEDIA])).toBe(
      "var(--ds-link-underline-thickness-hover, 1.5px)"
    );
  });
});

describe("link hover statements and absences", () => {
  it("lets an authored hover colour win over every posture and variant", () => {
    for (const posture of POSTURES) {
      const root = rootDeclarations(posture);
      root.set("--ds-link-hover-color", "#c7548d");
      for (const variant of VARIANTS) {
        expect(substituteChannels(HOVER_INK, linkElement(root, variant))).toBe("#c7548d");
      }
    }
  });

  it("yields the share to vertical and tenant statements in the ranked pipeline", () => {
    for (const rank of ["verticalOverride", "tenant"] as const) {
      const stated: FamilyDeriver = {
        family: `stated-link-${rank}`,
        rank,
        consumes: ["chrome.*"],
        produces: [SHARE],
        derive: () => ({ [SHARE]: "45%" }),
      };
      const result = runDerivation(buildLoweringContext({ theme: MINIMAL_THEME }), [linkChromeDeriver, stated]);
      expect(result.channels[SHARE]).toBe("45%");
      expect(result.provenance.get(SHARE)?.rank).toBe(rank);
      const root = rootDeclarations("strong");
      root.set(SHARE, result.channels[SHARE]!);
      expect(hoverMix(linkElement(root, "warning"))).toMatchObject({ tonePercent: 55, inkPercent: 45 });
    }
  });

  it("paints the previous 70/30 ink when the share is absent or the states root is absent", () => {
    for (const posture of POSTURES) {
      const absentShare = rootDeclarations(posture);
      absentShare.delete(SHARE);
      for (const variant of VARIANTS) {
        const element = linkElement(absentShare, variant);
        expect(hoverMix(element)).toEqual(hoverMix(element, PREIMAGE_HOVER_INK));
      }
    }
    const absentStates = rootDeclarations("strong");
    absentStates.delete("--ds-state-hover-shift");
    const element = linkElement(absentStates, "danger");
    expect(hoverMix(element)).toEqual(hoverMix(element, PREIMAGE_HOVER_INK));
  });
});
