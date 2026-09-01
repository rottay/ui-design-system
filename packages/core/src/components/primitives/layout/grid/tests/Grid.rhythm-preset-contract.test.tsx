/**
 * @fileoverview The Grid preset/numeric split.
 *
 * Grid's blocker was sharper than Flex's: the modern engine wrote an inline
 * `gap`, and no stylesheet can reach an inline declaration, so rhythm had no
 * way in at all. A rung now travels `--ds-grid-gap` with the spelling stamped
 * on `data-gap-preset`; a measurement keeps the inline `gap` and is therefore
 * sovereign by the strongest means CSS has. The two paths are mutually
 * exclusive, so a gap is never declared twice.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import React from "react";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { ClassicGrid } from "../engines/classic";
import { ModernGrid } from "../engines/modern";
import { RusticGrid } from "../engines/rustic";
import { GAP_MAP } from "../contracts";
import type { GridGapValue, GridProps } from "../contracts";
import { TENANT_THEME_RHYTHM_FACTORS } from "../../../../../foundation/contracts/composition/tenants/themes/tenant-theme";
import {
  RESPONSIVE_BREAKPOINT_ORDER,
  RESPONSIVE_BREAKPOINTS,
} from "../../../../../foundation/contracts/kernel/responsive/breakpoints";

const HERE = dirname(fileURLToPath(import.meta.url));
const CSS = readFileSync(
  resolve(
    HERE,
    "../../../../../foundation/tokens/css/presentation/components/skin/layout-primitives/index.css"
  ),
  "utf8"
);
const RESPONSIVE_CSS = readFileSync(
  resolve(
    HERE,
    "../../../../../foundation/tokens/css/foundation/responsive/grid/index.css"
  ),
  "utf8"
);
const RHYTHM = "--ds-rhythm-effective-scale";
const RUNGS = ["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl"] as const;

describe("responsive geometry ownership", () => {
  it("keeps the shared CSS media scale aligned with the runtime contract", () => {
    for (const breakpoint of RESPONSIVE_BREAKPOINT_ORDER) {
      expect(RESPONSIVE_CSS).toContain(`[data-grid-columns~="${breakpoint}"]`);
      expect(RESPONSIVE_CSS).toContain(`[data-grid-rows~="${breakpoint}"]`);
      expect(RESPONSIVE_CSS).toContain(`var(--_ds-grid-columns-${breakpoint})`);
      expect(RESPONSIVE_CSS).toContain(`var(--_ds-grid-rows-${breakpoint})`);
      if (breakpoint !== "xs") {
        expect(RESPONSIVE_CSS).toContain(
          `@media (min-width: ${RESPONSIVE_BREAKPOINTS[breakpoint]}px)`
        );
      }
    }
  });
});

describe("leg 1 -- a preset rung scales with rhythm", () => {
  it("routes every enumerated rung through the channel, not inline gap", () => {
    for (const rung of RUNGS) {
      const { container, unmount } = render(
        <ModernGrid gap={rung}>
          <div>a</div>
        </ModernGrid>
      );
      const grid = container.querySelector(".rottay-grid") as HTMLElement;
      expect(grid, rung).toHaveAttribute("data-gap-preset", rung);
      expect(grid.getAttribute("style"), rung).toContain("--ds-grid-gap:");
      expect(grid.style.gap, rung).toBe("");
      unmount();
    }
  });

  it("defaults to the md rung, so an unspecified gap is rhythm-aware too", () => {
    const { container } = render(
      <ModernGrid>
        <div>a</div>
      </ModernGrid>
    );
    const grid = container.querySelector(".rottay-grid") as HTMLElement;
    expect(grid).toHaveAttribute("data-gap-preset", "md");
  });

  it("the stylesheet scales the channel once, at the base rule's specificity", () => {
    expect(CSS).toContain(".rottay-grid[data-gap-preset]");
    expect(CSS).toContain(".rottay-grid.rottay-grid--modern:where(");
    expect(CSS).toContain(`gap: calc(var(--ds-grid-gap) * var(${RHYTHM}, 1))`);
    for (const rung of RUNGS) {
      expect(CSS, rung).toContain(`[data-gap-preset="${rung}"]`);
    }
  });

  it("anchors the scaled rule on the engine class, not a repeated attribute", () => {
    // Repeating [data-gap-preset] to climb specificity is forbidden, and
    // :where() contributes nothing -- matching (0,2,0) and sorting later is
    // what makes the scaled rule win over the base one.
    expect(CSS).not.toContain(
      ".rottay-grid[data-gap-preset]:where([data-gap-preset="
    );
  });
});

describe("leg 2 -- a numeric gap is exact geometry and NEVER scales", () => {
  it("keeps a number inline, where no stylesheet can scale it", () => {
    const { container } = render(
      <ModernGrid gap={24}>
        <div>a</div>
      </ModernGrid>
    );
    const grid = container.querySelector(".rottay-grid") as HTMLElement;
    expect(grid).not.toHaveAttribute("data-gap-preset");
    expect(grid.style.gap).toBe("24px");
    expect(grid.getAttribute("style")).not.toContain("--ds-grid-gap");
  });

  it("never emits both the channel and an inline gap for one value", () => {
    for (const gap of ["lg", 18] as const) {
      const { container, unmount } = render(
        <ModernGrid gap={gap}>
          <div>a</div>
        </ModernGrid>
      );
      const grid = container.querySelector(".rottay-grid") as HTMLElement;
      const style = grid.getAttribute("style") ?? "";
      const viaChannel = style.includes("--ds-grid-gap");
      const viaInline = grid.style.gap !== "";
      expect(viaChannel && viaInline, String(gap)).toBe(false);
      expect(viaChannel || viaInline, String(gap)).toBe(true);
      unmount();
    }
  });

  it("POSITIVE CONTROL: the preset path really is exercised above", () => {
    const { container } = render(
      <ModernGrid gap="lg">
        <div>a</div>
      </ModernGrid>
    );
    const grid = container.querySelector(".rottay-grid") as HTMLElement;
    expect(grid.getAttribute("style")).toContain("--ds-grid-gap:");
  });
});

describe("leg 3 -- tracks, wrapping and logical behaviour are untouched", () => {
  it("leaves column tracks and inline sizing exactly as before", () => {
    const { container } = render(
      <ModernGrid columns={3} gap="md">
        <div>a</div>
      </ModernGrid>
    );
    const grid = container.querySelector(".rottay-grid") as HTMLElement;
    expect(grid.style.gridTemplateColumns).toBe("repeat(3, minmax(0, 1fr))");
    expect(grid.style.minInlineSize).toBe("0");
  });

  it("keeps NUMERIC columnGap/rowGap on their own inline path, unscaled", () => {
    // A measurement stated per axis is exact geometry, exactly like a
    // measurement stated uniformly. A per-axis RUNG is a different case and is
    // covered by legs 4-8 below.
    const { container } = render(
      <ModernGrid columnGap={8} rowGap={4}>
        <div>a</div>
      </ModernGrid>
    );
    const grid = container.querySelector(".rottay-grid") as HTMLElement;
    expect(grid.style.columnGap).toBe("8px");
    expect(grid.style.rowGap).toBe("4px");
  });

  it("scales no physical side", () => {
    for (const line of CSS.split("\n").filter((l) => l.includes(RHYTHM))) {
      expect(line, line.trim()).not.toMatch(/(margin|padding)-(left|right)/);
    }
  });
});

/** The selector of the rule that owns a given declaration text. */
const owningSelector = (declaration: string): string => {
  const at = CSS.indexOf(declaration);
  expect(at, declaration).toBeGreaterThan(-1);
  const openBrace = CSS.lastIndexOf("{", at);
  return CSS.slice(CSS.lastIndexOf("}", openBrace) + 1, openBrace);
};

const renderModern = (props: GridProps): HTMLElement => {
  const { container } = render(
    <ModernGrid {...props}>
      <div>a</div>
    </ModernGrid>
  );
  return container.querySelector(".rottay-grid") as HTMLElement;
};

describe("leg 4 -- a preset AXIS rung scales with rhythm, like the uniform one", () => {
  it("routes every enumerated rung through its own seam, not an inline longhand", () => {
    for (const rung of RUNGS) {
      const { container, unmount } = render(
        <ModernGrid columnGap={rung} rowGap={rung}>
          <div>a</div>
        </ModernGrid>
      );
      const grid = container.querySelector(".rottay-grid") as HTMLElement;
      expect(grid, rung).toHaveAttribute("data-column-gap-preset", rung);
      expect(grid, rung).toHaveAttribute("data-row-gap-preset", rung);
      // The resolved rung is unchanged -- only the mechanism that carries it.
      expect(grid.style.getPropertyValue("--_ds-grid-column-gap"), rung).toBe(
        GAP_MAP[rung]
      );
      expect(grid.style.getPropertyValue("--_ds-grid-row-gap"), rung).toBe(
        GAP_MAP[rung]
      );
      expect(grid.style.columnGap, rung).toBe("");
      expect(grid.style.rowGap, rung).toBe("");
      unmount();
    }
  });

  it("the stylesheet scales each axis exactly once", () => {
    expect(CSS).toContain(".rottay-grid[data-column-gap-preset]");
    expect(CSS).toContain(".rottay-grid[data-row-gap-preset]");
    expect(CSS).toContain(
      `column-gap: calc(var(--_ds-grid-column-gap) * var(${RHYTHM}, 1))`
    );
    expect(CSS).toContain(
      `row-gap: calc(var(--_ds-grid-row-gap) * var(${RHYTHM}, 1))`
    );
    for (const rung of RUNGS) {
      expect(CSS, rung).toContain(`[data-column-gap-preset="${rung}"]`);
      expect(CSS, rung).toContain(`[data-row-gap-preset="${rung}"]`);
    }
  });

  it("anchors both scaled axis rules on the engine class, not a repeated attribute", () => {
    expect(CSS).not.toContain(
      ".rottay-grid[data-column-gap-preset]:where([data-column-gap-preset="
    );
    expect(CSS).not.toContain(
      ".rottay-grid[data-row-gap-preset]:where([data-row-gap-preset="
    );
  });

  it("sorts the axis rules AFTER the uniform gap rules, so an axis still overrides", () => {
    // An axis longhand and the `gap` shorthand tie at (0,2,0); source order is
    // the whole mechanism behind `columnGap` overriding `gap`.
    const uniform = CSS.indexOf(`gap: calc(var(--ds-grid-gap) * var(${RHYTHM}`);
    expect(uniform).toBeGreaterThan(-1);
    expect(CSS.indexOf(".rottay-grid[data-column-gap-preset]")).toBeGreaterThan(
      uniform
    );
    expect(CSS.indexOf(".rottay-grid[data-row-gap-preset]")).toBeGreaterThan(
      uniform
    );
  });
});

describe("leg 5 -- an AXIS that is not a rung is exact geometry and NEVER scales", () => {
  it("leaves none and every unsafe number at zero, with no calc, seam or stamp", () => {
    const cases: Array<[GridGapValue, string]> = [
      ["none", "0"],
      [-8, "0px"],
      [Number.NaN, "0px"],
      [Number.POSITIVE_INFINITY, "0px"],
    ];
    for (const [value, expected] of cases) {
      const label = String(value);
      const { container, unmount } = render(
        <ModernGrid columnGap={value} rowGap={value}>
          <div>a</div>
        </ModernGrid>
      );
      const grid = container.querySelector(".rottay-grid") as HTMLElement;
      expect(grid.style.columnGap, label).toBe(expected);
      expect(grid.style.rowGap, label).toBe(expected);
      expect(grid, label).not.toHaveAttribute("data-column-gap-preset");
      expect(grid, label).not.toHaveAttribute("data-row-gap-preset");
      expect(grid.getAttribute("style") ?? "", label).not.toContain(
        "--_ds-grid-"
      );
      unmount();
    }
  });

  it("writes no seam for a numeric axis, so the rhythm rule has nothing to read", () => {
    const grid = renderModern({ columnGap: 8, rowGap: 4 });
    const style = grid.getAttribute("style") ?? "";
    expect(style).not.toContain("--_ds-grid-column-gap");
    expect(style).not.toContain("--_ds-grid-row-gap");
  });

  it("keeps `none` out of both scaled selector lists", () => {
    expect(CSS).not.toContain('[data-column-gap-preset="none"]');
    expect(CSS).not.toContain('[data-row-gap-preset="none"]');
  });
});

describe("leg 6 -- counterfactual and positive controls for the axis stamp", () => {
  it("COUNTERFACTUAL: a caller cannot hand-stamp a preset onto a numeric axis", () => {
    // If the engine ever stopped owning these two attributes, this caller
    // value would survive and the stylesheet would multiply exact geometry --
    // precisely the defect the preset/measurement split exists to prevent.
    const grid = renderModern({
      columnGap: 8,
      rowGap: 4,
      "data-column-gap-preset": "4xl",
      "data-row-gap-preset": "4xl",
    });
    expect(grid).not.toHaveAttribute("data-column-gap-preset");
    expect(grid).not.toHaveAttribute("data-row-gap-preset");
    expect(grid.style.columnGap).toBe("8px");
    expect(grid.style.rowGap).toBe("4px");
  });

  it("POSITIVE CONTROL: the same render path does stamp a real rung", () => {
    const grid = renderModern({ columnGap: "4xl", rowGap: "4xl" });
    expect(grid).toHaveAttribute("data-column-gap-preset", "4xl");
    expect(grid).toHaveAttribute("data-row-gap-preset", "4xl");
  });
});

describe("leg 7 -- a measurement uniform gap beside a preset axis", () => {
  it("declares the measurement only on the axis it still owns, never as a shorthand", () => {
    // An inline `gap` shorthand also sets the column-gap longhand and outranks
    // every stylesheet, so it would kill the rule that now owns the preset
    // column axis. The measurement lands on the row axis alone.
    const grid = renderModern({ gap: 24, columnGap: "lg" });
    expect(grid.style.gap).toBe("");
    expect(grid.style.rowGap).toBe("24px");
    expect(grid.style.columnGap).toBe("");
    expect(grid).toHaveAttribute("data-column-gap-preset", "lg");
    expect(grid).not.toHaveAttribute("data-row-gap-preset");
    expect(grid.style.getPropertyValue("--_ds-grid-column-gap")).toBe(
      GAP_MAP.lg
    );
  });

  it("POSITIVE CONTROL: with no axis rung the measurement stays an inline shorthand", () => {
    const grid = renderModern({ gap: 24, columnGap: 8 });
    expect(grid.style.gap).toBe("24px");
    expect(grid.style.columnGap).toBe("8px");
    expect(grid.getAttribute("style") ?? "").not.toContain("--_ds-grid-");
  });

  it("keeps a preset uniform gap on its channel when an axis is also a rung", () => {
    const grid = renderModern({ gap: "4xl", columnGap: "xs" });
    expect(grid.style.getPropertyValue("--ds-grid-gap")).toBe(GAP_MAP["4xl"]);
    expect(grid.style.getPropertyValue("--_ds-grid-column-gap")).toBe(
      GAP_MAP.xs
    );
    expect(grid).toHaveAttribute("data-gap-preset", "4xl");
    expect(grid).toHaveAttribute("data-column-gap-preset", "xs");
    expect(grid.style.gap).toBe("");
  });
});

describe("leg 8 -- the axis fix is provably Modern-only", () => {
  const expectUntouchedReadOnlyEngine = (
    engine: string,
    grid: HTMLElement
  ): void => {
    expect(grid.style.gap, engine).toBe(GAP_MAP.md);
    expect(grid.style.columnGap, engine).toBe(GAP_MAP.lg);
    expect(grid.style.rowGap, engine).toBe(GAP_MAP.sm);
    expect(grid, engine).not.toHaveAttribute("data-gap-preset");
    expect(grid, engine).not.toHaveAttribute("data-column-gap-preset");
    expect(grid, engine).not.toHaveAttribute("data-row-gap-preset");
    const style = grid.getAttribute("style") ?? "";
    expect(style, engine).not.toContain("--ds-grid-gap");
    expect(style, engine).not.toContain("--_ds-grid-");
  };

  it("classic keeps every gap inline, stamps no preset and writes no seam", () => {
    const { container } = render(
      <ClassicGrid gap="md" columnGap="lg" rowGap="sm">
        <div>a</div>
      </ClassicGrid>
    );
    expectUntouchedReadOnlyEngine(
      "classic",
      container.querySelector(".rottay-grid--classic") as HTMLElement
    );
  });

  it("rustic keeps every gap inline, stamps no preset and writes no seam", () => {
    const { container } = render(
      <RusticGrid gap="md" columnGap="lg" rowGap="sm">
        <div>a</div>
      </RusticGrid>
    );
    expectUntouchedReadOnlyEngine(
      "rustic",
      container.querySelector(".rottay-grid--rustic") as HTMLElement
    );
  });

  it("scopes every scaled gap rule to the modern engine class", () => {
    for (const declaration of [
      `gap: calc(var(--ds-grid-gap) * var(${RHYTHM}, 1))`,
      `column-gap: calc(var(--_ds-grid-column-gap) * var(${RHYTHM}, 1))`,
      `row-gap: calc(var(--_ds-grid-row-gap) * var(${RHYTHM}, 1))`,
    ]) {
      expect(owningSelector(declaration), declaration).toContain(
        ".rottay-grid.rottay-grid--modern"
      );
    }
  });

  it("the unscaled base rules are ALSO Modern-scoped, via a zero-specificity :where()", () => {
    // AGED_EXPECTATION, corrected. This drill used to assert the opposite --
    // that these three base rules carried NO modern scope at all -- reasoning
    // that they were "inert for classic/rustic because those engines never
    // stamp the attribute". That inertness is still true today (proven by the
    // two engine cases above) and is exactly why this was a LATENT hazard
    // rather than a live one: `extractSemanticDOMAttributes`
    // (Grid/runtime/dom-attributes/index.ts) forwards ANY caller `data-*` prop
    // onto Classic/Rustic verbatim, so a caller-authored `data-gap-preset`
    // WOULD have reached this rule on a read-only engine's element even though
    // no engine code emits it there. The old assertion measured "nothing
    // exploits this today" and mistook it for "this is safe by construction",
    // which is the exact gap a stale test can hide. `:where()` is
    // zero-specificity, so scoping these three rules changes nothing about
    // WHICH selector wins wherever they already matched -- only whether a
    // Classic/Rustic element can match them at all.
    for (const declaration of [
      "gap: var(--ds-grid-gap)",
      "column-gap: var(--_ds-grid-column-gap)",
      "row-gap: var(--_ds-grid-row-gap)",
    ]) {
      expect(owningSelector(declaration), declaration).toContain(
        ":where(.rottay-grid--modern)"
      );
    }
  });

  it("COUNTERFACTUAL: the old unscoped selector text is genuinely gone", () => {
    // Reproduces the exact selector text the base rules carried before this
    // fix, so this pair of legs is proven load-bearing (it would have failed
    // against the pre-fix source) rather than green against any CSS at all.
    for (const oldSelector of [
      ".rottay-grid[data-gap-preset] {",
      ".rottay-grid[data-column-gap-preset] {",
      ".rottay-grid[data-row-gap-preset] {",
    ]) {
      expect(CSS, oldSelector).not.toContain(oldSelector);
    }
  });
});

/**
 * leg 9 -- the tri-stop rhythm law: 0.85 / 1 / 1.2, monotonicity, exact
 * removal. Mirrors Flex.rhythm-preset-contract.test.tsx's leg 7,
 * Stack.rhythm-preset-contract.test.tsx's equivalent leg, and
 * Space.rhythm-preset-contract.test.tsx's leg 5 for the same canonical
 * factor table; see any of them for the full jsdom-limitation reasoning
 * (calc() cannot be evaluated here, so the proof is algebraic, not a
 * computed pixel comparison).
 */
describe("leg 9 -- the tri-stop rhythm law: 0.85 / 1 / 1.2, monotonicity, exact removal", () => {
  it("pins the canonical tri-stop factor table", () => {
    expect(TENANT_THEME_RHYTHM_FACTORS).toEqual({
      tight: 0.85,
      normal: 1,
      airy: 1.2,
    });
  });

  it("the three factors are strictly monotonically increasing", () => {
    const { tight, normal, airy } = TENANT_THEME_RHYTHM_FACTORS;
    expect(tight).toBeLessThan(normal);
    expect(normal).toBeLessThan(airy);
  });

  it("EXACT REMOVAL: `normal` is the identity factor the CSS fallback already defaults to", () => {
    expect(TENANT_THEME_RHYTHM_FACTORS.normal).toBe(1);
    expect(CSS).toContain(`gap: calc(var(--ds-grid-gap) * var(${RHYTHM}, 1))`);
    // The base magnitude a caller's rung resolves to is untouched by rhythm
    // -- only wrapped. GAP_MAP (leg 1's own channel source) and the calc()
    // wrapper's left operand are fed by the identical map.
    expect(GAP_MAP.md).toBe("var(--ds-spacing-4, 1rem)");
  });
});
