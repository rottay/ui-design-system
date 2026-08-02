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

import { ModernGrid } from "../engines/modern";

const HERE = dirname(fileURLToPath(import.meta.url));
const CSS = readFileSync(
  resolve(
    HERE,
    "../../../../../foundation/tokens/css/presentation/components/skin/layout-primitives.css"
  ),
  "utf8"
);
const RHYTHM = "--ds-rhythm-effective-scale";
const RUNGS = ["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl"] as const;

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

  it("keeps columnGap/rowGap on their own inline path, unscaled", () => {
    // These are per-axis overrides a caller states explicitly; they are exact
    // geometry and deliberately did not join the preset contract.
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
