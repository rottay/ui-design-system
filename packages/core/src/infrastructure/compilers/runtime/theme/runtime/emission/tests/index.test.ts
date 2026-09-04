/**
 * Emission reproduces the compiler's CSS byte for byte.
 *
 * Run for a theme with two mode blocks and for one with zero, because the
 * `.filter(Boolean).join("\n\n")` grammar drops an empty base block and a naive
 * reimplementation gets the blank-line count wrong.
 */

import { describe, expect, it } from "vitest";

import type { ThemeCompilation } from "@/foundation/contracts/composition/tenants/themes/compiled";
import { FIRST_PARTY_THEMES } from "@/foundation/tokens/ts/presentation/brand-themes";

import { compileTheme } from "../../lowering";
import { resolveTheme } from "../../resolution";
import { resolveAdapter } from "../../../presentation/adapters";
import {
  containerScope,
  emitDeclarations,
  emitRule,
  emitThemeCss,
  firstPartyScope,
  tenantArtifactScope,
} from "..";

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
  const base = Object.entries(compiled.cssVariables).filter(([, v]) => v != null);
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
        ...Object.entries(block.cssVariables)
          .filter(([, v]) => v != null)
          .map(([k, v]) => `  ${k}: ${v};`),
      ])
    );
  }
  return blocks.join("\n\n");
}

describe("emitThemeCss reproduces the compiled CSS grammar", () => {
  for (const slug of slugs) {
    it(`is byte-identical to the reference grammar for ${slug}`, () => {
      const compiled = compileTheme(resolveTheme(FIRST_PARTY_THEMES[slug]), modern);
      expect(emitThemeCss(compiled, firstPartyScope(slug))).toBe(
        referenceCss(compiled, slug)
      );
    });
  }

  it("covers a theme that really has mode blocks", () => {
    const compiled = compileTheme(resolveTheme(FIRST_PARTY_THEMES.rottay), modern);
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
    const declarations = emitDeclarations({
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
    "--ds-recipe-profile",
    "--ds-experience-profile",
  ];

  it("admits every compiled channel of every first-party theme", () => {
    let total = 0;
    const dropped: string[] = [];
    const seenShapes = new Set<string>();
    for (const [slug, theme] of Object.entries(FIRST_PARTY_THEMES)) {
      const compiled = compileTheme(resolveTheme(theme), modern);
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
    // The four value shapes the grammar had to learn are really in the corpus,
    // so this control cannot pass vacuously: linear(), multi-line shadows and
    // the two quoted provenance markers carrying `@`.
    expect([...seenShapes].sort()).toEqual([...NAMED_SHAPES].sort());
  });
});
