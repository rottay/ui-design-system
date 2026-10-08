/**
 * Read from the modern skin: the native trigger reserves the arrow's own inset, size and
 * gap at its inline end, and the option check wears its chip's paired ink.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const CSS_ROOT = resolve(process.cwd(), "src/foundation/tokens/css");
const read = (path: string) =>
  readFileSync(resolve(CSS_ROOT, path), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

const SKIN = read("runtime/engines/modern/skin/select/index.css");
const ICON = read("presentation/components/semantic-icon/index.css");
const PRESENTATION = read("presentation/components/select/index.css");

interface Rule {
  readonly selectors: readonly string[];
  readonly body: string;
}

/** Top-level rules only: `@media` blocks are dropped so a query branch cannot answer for the rest. */
function rules(css: string): Rule[] {
  let flat = "";
  let depth = 0;
  let inMedia = 0;
  for (let at = 0; at < css.length; at += 1) {
    const char = css[at]!;
    if (char === "@" && depth === 0) inMedia = 1;
    if (char === "{") depth += 1;
    if (inMedia === 0) flat += char;
    if (char === "}") {
      depth -= 1;
      if (depth === 0 && inMedia) inMedia = 0;
    }
  }
  return [...flat.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
    selectors: match[1]!.replace(/\s+/g, " ").trim().split(/,\s*(?![^()]*\))/),
    body: match[2]!.replace(/\s+/g, " "),
  }));
}

function declaration(rule: Rule, property: string): string | undefined {
  return new RegExp(`(?:^|;)\\s*${property}\\s*:\\s*([^;]+)`).exec(rule.body)?.[1]?.trim();
}

/** The one rule whose whole selector list is `selector`. */
function ruleFor(css: string, selector: string): Rule {
  const found = rules(css).filter((rule) => rule.selectors.length === 1 && rule.selectors[0] === selector);
  expect(found, selector).toHaveLength(1);
  return found[0]!;
}

/** (ids, classes + attributes + pseudo-classes, types); `:is()` counts its most specific argument. */
function specificity(selector: string): [number, number, number] {
  let rest = selector;
  const total: [number, number, number] = [0, 0, 0];
  rest = rest.replace(/:is\(([^()]*)\)/g, (_, list: string) => {
    const best = list
      .split(",")
      .map((item) => specificity(item.trim()))
      .sort((a, b) => b[0] - a[0] || b[1] - a[1] || b[2] - a[2])[0]!;
    total[0] += best[0];
    total[1] += best[1];
    total[2] += best[2];
    return " ";
  });
  total[0] += (rest.match(/#[\w-]+/g) ?? []).length;
  total[1] += (rest.match(/\.[\w-]+|\[[^\]]+\]|:(?!:)[\w-]+/g) ?? []).length;
  total[2] += (rest.replace(/\[[^\]]+\]/g, "").match(/(?:^|[\s>+~])([a-z][\w-]*)/gi) ?? []).length;
  return total;
}

const beats = (a: [number, number, number], b: [number, number, number]) =>
  a[0] - b[0] || a[1] - b[1] || a[2] - b[2];

const NATIVE_TRIGGER = ".ds-select-shell.ds-select-shell--modern[data-part='root'] select[data-part='trigger']:not(:where([data-chrome='none']))";
const NATIVE_ARROW = ".ds-select-shell.ds-select-shell--modern[data-part='root'] [data-part='native-arrow']";
const CHECK_GLYPH =
  ".ds-select-shell__dropdown[data-part='dropdown'] :is([data-part='option-checkbox'], [data-part='option-check']) > .rottay-semantic-icon";
const LENGTH_LITERAL = /(?<![\w-])\d*\.?\d+(?:px|rem|em|%)/;

describe("modern native Select: arrow clearance", () => {
  it("reserves the arrow's inset, its size and the trigger gap, so it scales with the size", () => {
    const inset = declaration(ruleFor(SKIN, NATIVE_ARROW), "inset-inline-end");
    const clearance = declaration(ruleFor(SKIN, NATIVE_TRIGGER), "padding-inline-end");
    expect(inset).toBe("var(--ds-select-trigger-responsive-padding-x, var(--ds-select-native-arrow-inset))");
    expect(clearance).toBe(
      `calc( ${inset} + var(--ds-select-arrow-size, var(--ds-icon-sm-size)) + var(--ds-select-trigger-gap, var(--ds-spacing-2)) )`,
    );
    expect(clearance).not.toMatch(LENGTH_LITERAL);
  });

  it("reads the arrow size from its declared presentation channel", () => {
    expect(PRESENTATION).toMatch(/--ds-select-arrow-size:\s*[^;]+;/);
  });

  it("declares the arrow inset on every size the clearance reads it from", () => {
    for (const size of ["xs", "sm", "md", "lg", "xl"]) {
      const rule = ruleFor(
        SKIN,
        `.ds-select-shell.ds-select-shell--modern[data-part='root'][data-size='${size}'] :is([data-part='trigger'], [data-part='native-arrow'])`,
      );
      expect(declaration(rule, "--ds-select-native-arrow-inset"), size).toBe("var(--ds-select-trigger-padding-x)");
    }
  });

  it("leaves the custom trigger's padding to the shared trigger rule", () => {
    const custom = rules(SKIN).filter((rule) =>
      rule.selectors.some((selector) => /div\[data-part='trigger'\]$/.test(selector)),
    );
    for (const rule of custom) expect(declaration(rule, "padding-inline-end")).toBeUndefined();
  });
});

describe("modern Select: option check ink", () => {
  it("paints the check with its chip's ink instead of the success tone", () => {
    expect(declaration(ruleFor(SKIN, CHECK_GLYPH), "color")).toBe("currentColor");
  });

  it("outranks every semantic icon tone rule regardless of sheet order", () => {
    ruleFor(SKIN, CHECK_GLYPH);
    const tones = rules(ICON).flatMap((rule) =>
      rule.selectors.filter((selector) => selector.startsWith(".rottay-semantic-icon[data-icon-tone=")),
    );
    expect(tones.length).toBeGreaterThan(0);
    for (const tone of tones) expect(beats(specificity(CHECK_GLYPH), specificity(tone)), tone).toBeGreaterThan(0);
  });

  it("gives each chip the ink paired with its fill", () => {
    expect(
      declaration(ruleFor(SKIN, ".ds-select-shell__dropdown[data-part='dropdown'] [data-part='option-checkbox']"), "color"),
    ).toBe("var(--ds-color-text-on-primary)");
    expect(
      declaration(
        ruleFor(SKIN, ".ds-select-shell__dropdown[data-part='dropdown'] [data-selected='true'] [data-part='option-checkbox']"),
        "background",
      ),
    ).toBe("var(--ds-color-primary)");
    expect(
      declaration(ruleFor(SKIN, ".ds-select-shell__dropdown[data-part='dropdown'] [data-part='option-check']"), "color"),
    ).toBe("var(--ds-color-primary)");
  });
});
