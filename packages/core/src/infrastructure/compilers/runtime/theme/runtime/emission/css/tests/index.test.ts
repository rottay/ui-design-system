/**
 * Emission reproduces the compiler's CSS byte for byte.
 *
 * Run for a theme with two mode blocks and for one with zero, because the
 * `.filter(Boolean).join("\n\n")` grammar drops an empty base block and a naive
 * reimplementation gets the blank-line count wrong.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import type { ThemeCompilation } from "@/foundation/contracts/composition/tenants/themes/compiled";
import type { FirstPartyVerticalId } from "@/foundation/contracts/kernel/verticals";

import { compileTheme } from "../../../lowering";
import { staticThemeIntent } from "../../../ingress";
import { resolveAdapter } from "../../../../presentation/adapters";
import {
  containerScope,
  emitDeclarations,
  emitRule,
  emitThemeCss,
  firstPartyScope,
  tenantArtifactScope,
} from "../..";
import { emitOverlayDeclarations, RADIUS_CHAIN_STEPS, radiusChainValue } from "..";
import { ROOT_ALIASES } from "../root-aliases";
import { FIRST_PARTY_BASELINES, resolveFirstParty } from "@tests/support/theme-lowering";

const modern = resolveAdapter("modern");
const slugs = ["rottay", "bithire", "evnto"] as const;

/**
 * The reference grammar, restated independently of the emitter under test.
 *
 * Asserting against the emitter's own output — directly or through a helper
 * that calls it — proves nothing once there is a single emission owner. This
 * function is the oracle: it is the shape the compiled CSS has always had, and
 * `emitThemeCss` must reproduce it declaration for declaration.
 */
function referenceCss(compiled: ThemeCompilation, slug: string): string {
  const rule = (selector: string, declarations: readonly string[]) =>
    `${selector} {\n${declarations.join("\n")}\n}`;
  const root = `html[data-tenant='${slug}']`;
  const modeSelector = (mode: string) =>
    `${root}[data-theme='${mode}'], ${root}.${mode}`;
  // A root alias reading a name any same-element rule states is restated, in table order, in the base rule.
  const chained = (
    variables: Readonly<Record<string, string>>,
    alsoStated: readonly string[] = []
  ) => {
    const entries = Object.entries(variables).filter(([, v]) => v != null);
    const reached = new Set([...Object.keys(variables), ...alsoStated]);
    for (let grew = true; grew; ) {
      grew = false;
      for (const [name, value] of ROOT_ALIASES) {
        if (reached.has(name)) continue;
        if ([...value.matchAll(/var\((--[\w-]+)/g)].some((m) => reached.has(m[1] as string))) {
          reached.add(name);
          grew = true;
        }
      }
    }
    for (const [name, value] of ROOT_ALIASES) {
      if (reached.has(name) && !(name in variables)) entries.push([name, value]);
    }
    return entries;
  };
  const base = chained(
    compiled.cssVariables,
    compiled.modeBlocks.flatMap((block) => Object.keys(block.cssVariables))
  );
  const blocks: string[] = [];
  if (base.length > 0 || compiled.colorScheme) {
    blocks.push(
      rule(root, [
        ...(compiled.colorScheme ? [`  color-scheme: ${compiled.colorScheme};`] : []),
        ...base.map(([k, v]) => `  ${k}: ${v};`),
      ])
    );
  }
  for (const block of compiled.modeBlocks) {
    blocks.push(
      rule(modeSelector(block.mode), [
        `  color-scheme: ${block.colorScheme};`,
        ...Object.entries(block.cssVariables).map(([k, v]) => `  ${k}: ${v};`),
      ])
    );
  }
  const scoped = Object.entries(compiled.densityScopeBlock?.cssVariables ?? {});
  if (scoped.length > 0) {
    blocks.push(
      rule(
        `${root} :where([data-density='compact']:not(:root), [data-density='comfortable']:not(:root), [data-density='spacious']:not(:root))`,
        scoped.map(([k, v]) => `  ${k}: ${v};`)
      )
    );
  }
  return blocks.join("\n\n");
}

describe("emitThemeCss reproduces the compiled CSS grammar", () => {
  for (const slug of slugs) {
    it(`is byte-identical to the reference grammar for ${slug}`, () => {
      const compiled = compileTheme(resolveFirstParty(staticThemeIntent(slug)), modern);
      expect(emitThemeCss(compiled, firstPartyScope(slug))).toBe(
        referenceCss(compiled, slug)
      );
    });
  }

  it("covers a theme that really has mode blocks", () => {
    const compiled = compileTheme(resolveFirstParty(staticThemeIntent("rottay")), modern);
    expect(compiled.modeBlocks.length).toBeGreaterThan(0);
  });

  it("emits no leading blank line when the base block is empty", () => {
    const empty: ThemeCompilation = {
      cssVariables: {},
      modeBlocks: [
        { mode: "dark", cssVariables: { "--ds-x": "1" }, colorScheme: "dark" },
      ],
      runtime: { personality: {}, tokenOverrides: {} },
    };
    const css = emitThemeCss(empty, firstPartyScope("rottay"));
    expect(css.startsWith("\n")).toBe(false);
    expect(css).toBe(
      "html[data-tenant='rottay'][data-theme='dark'], html[data-tenant='rottay'].dark {\n" +
        "  color-scheme: dark;\n  --ds-x: 1;\n}"
    );
  });

  it("emits the empty string when there is nothing at all", () => {
    const nothing: ThemeCompilation = {
      cssVariables: {},
      modeBlocks: [],
      runtime: { personality: {}, tokenOverrides: {} },
    };
    expect(emitThemeCss(nothing, firstPartyScope("rottay"))).toBe("");
  });

  it("joins two mode blocks with exactly one blank line each", () => {
    const two: ThemeCompilation = {
      cssVariables: { "--a": "1" },
      colorScheme: "light",
      modeBlocks: [
        { mode: "light", cssVariables: { "--a": "2" }, colorScheme: "light" },
        { mode: "dark", cssVariables: { "--a": "3" }, colorScheme: "dark" },
      ],
      runtime: { personality: {}, tokenOverrides: {} },
    };
    expect(emitThemeCss(two, containerScope(".probe")).split("\n\n")).toHaveLength(3);
  });

  it("drops a null-valued declaration exactly as the compiler does", () => {
    const nulled = {
      cssVariables: { "--ds-a": "1", "--ds-b": null },
      modeBlocks: [],
      runtime: { personality: {}, tokenOverrides: {} },
    } as unknown as ThemeCompilation;
    expect(emitThemeCss(nulled, containerScope(".probe"))).toBe(
      ".probe {\n  --ds-a: 1;\n}"
    );
  });
});

describe("the three named scopes", () => {
  it("firstPartyScope is the static artifact grammar", () => {
    const scope = firstPartyScope("bithire");
    expect(scope.baseSelector).toBe("html[data-tenant='bithire']");
    expect(scope.modeSelector("dark")).toBe(
      "html[data-tenant='bithire'][data-theme='dark'], html[data-tenant='bithire'].dark"
    );
  });

  it("tenantArtifactScope is the DB grammar at specificity (0,4,0)", () => {
    expect(tenantArtifactScope("bithire", "acme").baseSelector).toBe(
      '[data-ds-root][data-vertical="bithire"][data-tenant][data-tenant="acme"]'
    );
  });

  it("containerScope is the identity, for the preview", () => {
    expect(containerScope(".preview-root").baseSelector).toBe(".preview-root");
  });
});


/* -------------------------------------------------------------------------- */
/* value safety: the sole assembler is where a hostile channel is refused      */
/* -------------------------------------------------------------------------- */

const ESCAPE = "#000; } body { display: none; } .x {";

/** The assembler as it behaved before the guard, for a direct A/B. */
function emitDeclarationsUnguarded(variables: Record<string, string>): string[] {
  return Object.entries(variables)
    .filter(([, value]) => value != null)
    .map(([name, value]) => `  ${name}: ${value};`);
}

describe("emitDeclarations refuses a breakout before assembling any text", () => {
  it("the unguarded assembler DID escape the rule (direct mutant)", () => {
    const css = emitRule(".probe", emitDeclarationsUnguarded({ "--ds-color-primary": ESCAPE }));
    expect(css).toMatch(/\}\s*body\s*\{/u);
    expect(css).toContain("display: none");
  });

  it("the shipped assembler omits the channel whole", () => {
    const css = emitRule(".probe", emitDeclarations({ "--ds-color-primary": ESCAPE }));
    expect(css).not.toMatch(/\}\s*body\s*\{/u);
    expect(css).not.toContain("display: none");
    expect(css).toBe(".probe {\n\n}");
  });

  it("keeps the safe siblings of a refused channel", () => {
    const declarations = emitOverlayDeclarations({
      "--ds-color-primary": "#4f46e5",
      "--ds-color-accent": ESCAPE,
      "--ds-color-bg-primary": "#ffffff",
    });
    expect(declarations).toEqual([
      "  --ds-color-primary: #4f46e5;",
      "  --ds-color-bg-primary: #ffffff;",
    ]);
  });

  it("refuses a channel whose NAME is the breakout", () => {
    expect(emitDeclarations({ "} body { color": "red" })).toEqual([]);
  });

  it("every emitter above it inherits the refusal", () => {
    const hostile = {
      cssVariables: { "--ds-color-primary": ESCAPE, "--ds-color-bg-primary": "#fff" },
      modeBlocks: [
        { mode: "dark" as const, cssVariables: { "--ds-color-primary": ESCAPE }, colorScheme: "dark" as const },
      ],
      runtime: { personality: {}, tokenOverrides: {} },
    } as unknown as ThemeCompilation;
    const css = emitThemeCss(hostile, containerScope(".probe"));
    expect(css).not.toMatch(/\}\s*body\s*\{/u);
    expect(css).not.toContain("display: none");
    expect(css).toContain("--ds-color-bg-primary: #fff;");
  });
});

describe("the guard drops no channel the first-party corpus actually emits", () => {
  const NAMED_SHAPES = [
    "--ds-motion-spring-gentle",
    "--ds-card-shadow",
    "--ds-card-shadow-hover",
  ];

  /**
   * D6-2c-ii (2026-09-15): tenant-document compiles over neutral + preset, and
   * no preset authors a spring curve or card shadow chrome, so the two hard
   * value shapes the grammar had to learn -- `linear()` and a multi-layer
   * shadow -- left the first-party corpus entirely (3 channels seen -> 0).
   *
   * The control they served is NOT dropped: a grammar proven only on the easy
   * shapes is the vacuous pass this describe exists to prevent. It is
   * re-anchored one layer down, on `emitDeclarations` itself, with the shapes
   * stated explicitly instead of harvested from a theme that no longer carries
   * them. The corpus sweep below keeps its own two assertions.
   */
  it("admits the hard value shapes explicitly, now that no preset authors them", () => {
    const hard = {
      "--ds-motion-spring-gentle":
        "linear(0, 0.009, 0.035, 0.078, 0.141, 0.285, 0.723, 0.938, 1)",
      "--ds-card-shadow":
        "0 1px 2px rgba(0,0,0,0.04), 0 8px 16px rgba(0,0,0,0.08)",
      "--ds-card-shadow-hover":
        "0 2px 4px rgba(0,0,0,0.06), 0 16px 32px rgba(0,0,0,0.12)",
    } as const;
    const emitted = emitOverlayDeclarations(hard);
    expect(emitted).toHaveLength(Object.keys(hard).length);
    for (const [name, value] of Object.entries(hard)) {
      expect(emitted).toContain(`  ${name}: ${value};`);
    }
  });

  it("admits every compiled channel of every first-party theme", () => {
    let total = 0;
    const dropped: string[] = [];
    const seenShapes = new Set<string>();
    for (const slug of Object.keys(FIRST_PARTY_BASELINES) as FirstPartyVerticalId[]) {
      const compiled = compileTheme(resolveFirstParty(staticThemeIntent(slug)), modern);
      const blocks = [
        compiled.cssVariables,
        ...(compiled.modeBlocks ?? []).map((block) => block.cssVariables),
      ];
      for (const variables of blocks) {
        const present = Object.entries(variables).filter(([, value]) => value != null);
        const emitted = emitDeclarations(variables);
        total += present.length;
        if (emitted.length !== present.length) {
          for (const [name] of present) {
            if (!emitted.some((line) => line.startsWith(`  ${name}: `))) {
              dropped.push(`${slug} ${name}`);
            }
          }
        }
        for (const [name] of present) if (NAMED_SHAPES.includes(name)) seenShapes.add(name);
      }
    }
    expect(dropped).toEqual([]);
    expect(total).toBeGreaterThan(4000);
    // D6-2c-ii (2026-09-15): the corpus carries NONE of the hard shapes any
    // more (3 -> 0), so the non-vacuity control moved to the test above. Pinned
    // to the measured emptiness rather than removed: a preset that authors a
    // spring or a card shadow again turns this red and moves the control back.
    expect([...seenShapes].sort()).toEqual([]);
    expect(NAMED_SHAPES).toHaveLength(3);
  });
});

/* -------------------------------------------------------------------------- */
/* the radius chain: a block stating an operand re-declares the step           */
/* -------------------------------------------------------------------------- */

describe("a block that states a radius operand re-declares the dial steps", () => {
  const ROOT_DECLARATIONS = readFileSync(
    resolve(__dirname, "../../../../../../../../foundation/tokens/css/foundation/themes/default/index.css"),
    "utf8"
  );

  it("restates each step exactly as themes/default declares it at :root", () => {
    for (const step of RADIUS_CHAIN_STEPS) {
      expect(ROOT_DECLARATIONS).toContain(`  --ds-radius-${step}: ${radiusChainValue(step)};`);
    }
  });

  const steps = (lines: readonly string[]) =>
    lines.filter((line) => /^ {2}--ds-radius-(sm|md|lg|xl):/.test(line));

  it("adds nothing to a block that states no operand", () => {
    expect(emitDeclarations({ "--ds-probe-unread-channel": "1px" })).toEqual([
      "  --ds-probe-unread-channel: 1px;",
    ]);
  });

  it("a stated scale re-declares all four steps", () => {
    expect(steps(emitDeclarations({ "--ds-radius-scale": "0.8" }))).toEqual([
      "  --ds-radius-lg: calc(var(--ds-radius-lg-base) * var(--ds-radius-scale, 1));",
      "  --ds-radius-md: calc(var(--ds-radius-md-base) * var(--ds-radius-scale, 1));",
      "  --ds-radius-sm: calc(var(--ds-radius-sm-base) * var(--ds-radius-scale, 1));",
      "  --ds-radius-xl: calc(var(--ds-radius-xl-base) * var(--ds-radius-scale, 1));",
    ]);
  });

  it("a stated operand re-declares only its own step", () => {
    expect(steps(emitDeclarations({ "--ds-radius-lg-base": "8px" }))).toEqual([
      "  --ds-radius-lg: calc(var(--ds-radius-lg-base) * var(--ds-radius-scale, 1));",
    ]);
  });

  it("a step the block names outright keeps its value", () => {
    expect(
      emitDeclarations({ "--ds-radius-scale": "1.2", "--ds-radius-md": "4px" }).filter((line) =>
        line.startsWith("  --ds-radius-md")
      )
    ).toEqual(["  --ds-radius-md: 4px;"]);
  });

  it("a refused operand does not re-declare its step", () => {
    expect(emitDeclarations({ "--ds-radius-lg-base": ESCAPE })).toEqual([]);
  });

  it("every first-party base block states the scale, so each carries the chain", () => {
    for (const slug of slugs) {
      const compiled = compileTheme(resolveFirstParty(staticThemeIntent(slug)), modern);
      expect(compiled.cssVariables["--ds-radius-scale"]).toBeDefined();
      const css = emitThemeCss(compiled, firstPartyScope(slug));
      for (const step of RADIUS_CHAIN_STEPS) {
        expect(css).toContain(`  --ds-radius-${step}: ${radiusChainValue(step)};`);
      }
    }
  });
});
