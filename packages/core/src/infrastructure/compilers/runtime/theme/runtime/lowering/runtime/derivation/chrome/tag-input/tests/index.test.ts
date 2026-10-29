/**
 * The `tag-input` focus ring: the tenant's focus signature at rest, with a
 * tenant statement of the family channel above it.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import {
  describeFamilyContract,
  FIXTURE_TENANT_FACTS,
  type FamilyFixture,
} from "@tests/support/family-contract";
import { firstPartyFixture } from "@tests/support/theme-lowering";
import type { FamilyDeriver } from "../../../../../foundation/contract";
import { buildLoweringContext, runDerivation } from "../../../../pipeline";
import { tagInputChromeDeriver } from "..";

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
];

describeFamilyContract(tagInputChromeDeriver, FIXTURES);

const RING = "--ds-tag-input-shadow-focus";

const SKIN = readFileSync(
  resolve(process.cwd(), "src/foundation/tokens/css/runtime/engines/modern/skin/tag-input/index.css"),
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
    for (let depth = 1; depth > 0 && end < SKIN.length; end += 1) {
      if (SKIN[end] === "(") depth += 1;
      else if (SKIN[end] === ")") depth -= 1;
    }
    expect(end, `unbalanced var() for ${channel}`).toBeLessThan(SKIN.length);
    found.add(normalise(SKIN.slice(start, end - 1)));
  }
  return [...found];
}

const context = () => buildLoweringContext({ theme: firstPartyFixture("bithire") });

describe("chrome/tag-input focus ring", () => {
  it("rests the ring on the tenant's focus signature, never on the foundation literal", () => {
    for (const fixture of FIXTURES) {
      const derived = tagInputChromeDeriver.derive(
        buildLoweringContext({ theme: fixture.theme, tenant: fixture.tenant }),
        {}
      );
      expect(derived[RING], fixture.label).toBe("var(--ds-focus-ring)");
    }
    expect(skinFallbacks(RING)).toEqual(["var(--ds-focus-ring)"]);
    // The foundation literal is one fixed wash under every signature.
    expect(SKIN).not.toContain("--ds-shadow-focus-ring");
  });

  it("keeps the validation frame under the ring instead of a second halo", () => {
    expect(SKIN).toMatch(/:focus-within:not\(\[data-error='true'\]\)\s*\{\s*border-color:/);
    expect(SKIN).toMatch(/\[data-rejected\]:not\(:focus-within\)\s*\{\s*box-shadow:/);
  });

  it("lets a tenant statement of the ring outrank the signature reference", () => {
    const tenant: FamilyDeriver = {
      family: "stated-tenant-ring",
      rank: "tenant",
      consumes: ["chrome.*"],
      produces: [RING],
      derive: () => ({ [RING]: "0 0 0 3px currentColor" }),
    };
    const result = runDerivation(context(), [tagInputChromeDeriver, tenant]);
    expect(result.channels[RING]).toBe("0 0 0 3px currentColor");
    expect(result.provenance.get(RING)?.rank).toBe("tenant");
  });

  it("yields every channel to a vertical or tenant statement of it", () => {
    const channels = Object.keys(tagInputChromeDeriver.derive(context(), {}));
    for (const rank of ["verticalOverride", "tenant"] as const) {
      const stated: FamilyDeriver = {
        family: `stated-${rank}`,
        rank,
        consumes: ["chrome.*"],
        produces: channels as FamilyDeriver["produces"],
        derive: () => Object.fromEntries(channels.map((channel) => [channel, "stated"])),
      };
      const result = runDerivation(context(), [tagInputChromeDeriver, stated]);
      for (const channel of channels) {
        expect(result.channels[channel], `${rank} ${channel}`).toBe("stated");
      }
    }
  });
});


const readHeightCss = (path: string) =>
  readFileSync(resolve(process.cwd(), "src/foundation/tokens/css", path), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "");

const TAG_INPUT_PRESENTATION = readHeightCss("presentation/components/tag-input/index.css");
const INPUT_PRESENTATION = readHeightCss("presentation/components/input/index.css");
const INPUT_SKIN = readHeightCss("runtime/engines/modern/skin/input/index.css");
const HEIGHT_SIZES = ["sm", "md", "lg"] as const;
const HEIGHT_ROOTS = [15, 18, 20];
const HEIGHT_CASES = HEIGHT_ROOTS.flatMap((rootPx) =>
  HEIGHT_SIZES.map((size) => ({ rootPx, size }))
);

function cssChannels(css: string): Map<string, string> {
  return new Map(Array.from(css.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g),
    ([, channel, value]) => [channel!, value!.trim()]));
}

function cssRuleValue(css: string, selector: string, property: string): string {
  const rule = Array.from(css.matchAll(/([^{}]+)\{([^{}]*)\}/g))
    .find(([, candidate]) => normalise(candidate!) === selector);
  expect(rule, selector).toBeDefined();
  const [, , body] = rule!;
  const declarations = new Map(body!.split(";").map((declaration) => {
    const colon = declaration.indexOf(":");
    return [declaration.slice(0, colon).trim(), declaration.slice(colon + 1).trim()];
  }));
  const value = declarations.get(property);
  expect(value, `${selector} ${property}`).toBeDefined();
  return value!;
}

function heightChannels(density = 1, controlHeight = 1): Map<string, string> {
  return new Map([
    ...cssChannels(INPUT_PRESENTATION),
    ...cssChannels(TAG_INPUT_PRESENTATION),
    ["--ds-density-effective-scale", String(density)],
    ["--ds-control-height-scale", String(controlHeight)],
  ]);
}

function resolveHeightVars(expression: string, channels: ReadonlyMap<string, string>, depth = 0): string {
  expect(depth, expression).toBeLessThan(20);
  const match = /var\(\s*(--[a-z0-9-]+)\s*(,)?/.exec(expression);
  if (match === null) return expression;
  const [opening, channel, comma] = match;
  const start = match.index + opening.length;
  let end = start;
  for (let nesting = 1; nesting > 0 && end < expression.length; end += 1) {
    if (expression.charAt(end) === "(") nesting += 1;
    else if (expression.charAt(end) === ")") nesting -= 1;
  }
  expect(expression.charAt(end - 1), expression).toBe(")");
  const fallback = comma === undefined ? undefined : expression.slice(start, end - 1);
  const value = channels.get(channel!) ?? fallback;
  expect(value, channel).toBeDefined();
  return resolveHeightVars(expression.slice(0, match.index) +
    resolveHeightVars(value!, channels, depth + 1) + expression.slice(end), channels, depth + 1);
}

function cssLengthProduct(expression: string, channels: ReadonlyMap<string, string>, rootPx: number): number {
  const resolved = resolveHeightVars(expression, channels)
    .replace(/calc\(/g, "(").replace(/[()]/g, "").trim();
  let lengths = 0;
  const result = resolved.split("*").reduce((product, factor) => {
    const token = /^\s*(\d+(?:\.\d+)?)(px|rem)?\s*$/.exec(factor);
    expect(token, `unsupported length product: ${expression} -> ${resolved}`).not.toBeNull();
    const [, number, unit] = token!;
    if (unit !== undefined) lengths += 1;
    return product * Number(number) * (unit === "rem" ? rootPx : 1);
  }, 1);
  expect(lengths, expression).toBe(1);
  return result;
}

function tagHeightExpression(size: string): string {
  return cssRuleValue(SKIN,
    `.ds-tag-input.ds-tag-input--modern[data-part='root'][data-size='${size}']`, "min-block-size");
}

function inputHeightExpression(size: string): string {
  return cssRuleValue(INPUT_SKIN,
    `.ds-input-shell.ds-input-shell--modern[data-size='${size}']:not([data-size-responsive])`,
    "--_ds-input-resolved-height");
}

describe("chrome/tag-input minimum-height CSS calculation", () => {
  it.each(HEIGHT_CASES)("matches Input $size at a $rootPx px root", ({ rootPx, size }) => {
    const channels = heightChannels();
    expect(cssLengthProduct(tagHeightExpression(size), channels, rootPx))
      .toBeCloseTo(cssLengthProduct(inputHeightExpression(size), channels, rootPx), 10);
  });

  it.each(HEIGHT_SIZES)("keeps the %s floor equivalent at a 16px root", (size) => {
    const channels = heightChannels();
    const legacy = new Map([["sm", 32], ["md", 40], ["lg", 48]]);
    expect(cssLengthProduct(tagHeightExpression(size), channels, 16)).toBe(legacy.get(size));
  });

  it.each(HEIGHT_SIZES)("applies density and control-height once to %s, independently and together", (size) => {
    const expression = tagHeightExpression(size);
    const base = cssLengthProduct(expression, heightChannels(), 18);
    expect(expression.match(/--ds-density-effective-scale/g)).toHaveLength(1);
    expect(expression.match(/--ds-control-height-scale/g)).toHaveLength(1);
    const factors = [{ density: 0.85, control: 1 }, { density: 1, control: 1.12 },
      { density: 0.85, control: 1.12 }, { density: 1.15, control: 0.88 }];
    for (const { density, control } of factors) {
      const channels = heightChannels(density, control);
      expect(cssLengthProduct(expression, channels, 18)).toBeCloseTo(base * density * control, 10);
      expect(cssLengthProduct(expression, channels, 18))
        .toBeCloseTo(cssLengthProduct(inputHeightExpression(size), channels, 18), 10);
    }
    const withoutControl = heightChannels();
    withoutControl.delete("--ds-control-height-scale");
    expect(cssLengthProduct(expression, withoutControl, 18)).toBeCloseTo(base, 10);
  });

  it.each(HEIGHT_SIZES)("follows an authored Input %s height until the family overrides it", (size) => {
    const channels = heightChannels(0.85, 1.12);
    channels.set(`--ds-input-${size}-height`, "4rem");
    const expression = tagHeightExpression(size);
    expect(cssLengthProduct(expression, channels, 18)).toBeCloseTo(72 * 0.85 * 1.12, 10);
    channels.set(`--ds-tag-input-${size}-height`, "61px");
    expect(cssLengthProduct(expression, channels, 18)).toBeCloseTo(61 * 0.85 * 1.12, 10);
    expect(cssLengthProduct(inputHeightExpression(size), channels, 18)).toBeCloseTo(72 * 0.85 * 1.12, 10);
  });

  it("keeps every non-height presentation declaration fixed", () => {
    const declarations = cssChannels(TAG_INPUT_PRESENTATION);
    HEIGHT_SIZES.forEach((size) => declarations.delete(`--ds-tag-input-${size}-height`));
    expect(Object.fromEntries(declarations)).toEqual({
      "--ds-tag-input-gap": "var(--ds-spacing-1)",
      "--ds-tag-input-padding-y": "var(--ds-spacing-1)",
      "--ds-tag-input-padding-x": "var(--ds-spacing-2)",
      "--ds-tag-input-border-width": "var(--ds-edge-standard-width)",
      "--ds-tag-input-input-min-width": "60px",
      "--ds-tag-input-line-height": "var(--ds-line-height-normal)",
      "--ds-tag-input-error-gap": "var(--ds-spacing-1)",
      "--ds-tag-input-error-font-size": "var(--ds-font-size-xs)",
      "--ds-tag-input-rejected-halo-width": "3px",
      "--ds-tag-input-touch-target-min": "44px",
      "--ds-tag-input-transition-duration": "var(--ds-input-transition-duration)",
      "--ds-tag-input-transition-timing": "var(--ds-input-transition-timing)",
    });
  });

  it("holds the authored radius when density and control-height move the floor", () => {
    const radius = cssRuleValue(SKIN, ".ds-tag-input.ds-tag-input--modern[data-part='root']", "border-radius");
    const base = heightChannels();
    const changed = heightChannels(0.85, 1.12);
    base.set("--ds-tag-input-radius", "6px");
    changed.set("--ds-tag-input-radius", "6px");
    expect(cssLengthProduct(radius, base, 18)).toBe(6);
    expect(cssLengthProduct(radius, changed, 18)).toBe(6);
    expect(cssLengthProduct(tagHeightExpression("md"), changed, 18))
      .not.toBe(cssLengthProduct(tagHeightExpression("md"), base, 18));
  });
});
