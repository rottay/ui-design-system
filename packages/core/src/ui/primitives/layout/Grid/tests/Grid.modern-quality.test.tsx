import React from "react";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { ModernGrid, ModernGridItem } from "../engines/modern";

describe("Modern Grid quality contract", () => {
  it("uses zero-minimum tracks so long content cannot overlap adjacent columns", () => {
    const { getByRole } = render(
      <ModernGrid
        role="grid"
        aria-label="Candidate comparison"
        columns={3}
        gap="md"
        overflow="clip"
        motion="rearrange"
        dir="rtl"
        lang="ar"
        data-component="caller-value"
      >
        <ModernGridItem role="row">محتوى طويل جدًا</ModernGridItem>
      </ModernGrid>
    );

    const grid = getByRole("grid");
    const item = getByRole("row");
    expect(grid).toHaveAttribute("data-component", "grid");
    expect(grid).toHaveAttribute("dir", "rtl");
    expect(grid.style.gridTemplateColumns).toBe("repeat(3, minmax(0, 1fr))");
    expect(grid.style.minInlineSize).toBe("0");
    expect(grid.style.overflow).toBe("clip");
    expect(grid.style.transition).toBe("var(--ds-transition-rearrange)");
    expect(item.style.minInlineSize).toBe("0");
    expect(item).toHaveAttribute("data-component", "grid-item");
    expect(grid.className).not.toMatch(/grid-cols-/);
    expect(item.className).not.toMatch(/col-span-|row-span-/);
  });

  it("creates a bounded auto-fit grid that never exceeds its container", () => {
    const { container } = render(
      <ModernGrid minColumnWidth="18rem" gap="lg">
        <ModernGridItem>One</ModernGridItem>
        <ModernGridItem>Two</ModernGridItem>
      </ModernGrid>
    );

    const grid = container.querySelector(".rottay-grid--modern") as HTMLElement;
    expect(grid.style.gridTemplateColumns).toBe(
      "repeat(auto-fit, minmax(min(100%, 18rem), 1fr))"
    );
    expect(grid.style.gap).toContain("--ds-spacing-6");
  });

  it("keeps responsive tracks scoped and zero-minimum at every breakpoint", () => {
    const { container } = render(
      <ModernGrid columns={{ xs: 1, md: 2, xl: 4 }} />
    );

    const css = container.querySelector("style")?.textContent ?? "";
    expect(css).toContain("repeat(1, minmax(0, 1fr))");
    expect(css).toContain("repeat(2, minmax(0, 1fr))");
    expect(css).toContain("repeat(4, minmax(0, 1fr))");
  });

  it("normalizes invalid counts, gaps, minimums, spans, and grid lines", () => {
    const { container, rerender } = render(
      <ModernGrid
        columns={Number.NaN as never}
        gap={Number.NEGATIVE_INFINITY}
        minColumnWidth={Number.NaN}
      >
        <ModernGridItem
          data-testid="item"
          span={0}
          rowSpan={-3}
          colStart={0}
          rowEnd={Number.POSITIVE_INFINITY}
        />
      </ModernGrid>
    );

    const grid = container.querySelector(".rottay-grid--modern") as HTMLElement;
    const item = container.querySelector('[data-testid="item"]') as HTMLElement;
    expect(grid.style.gridTemplateColumns).toBe(
      "repeat(auto-fit, minmax(min(100%, 0px), 1fr))"
    );
    expect(grid.style.gap).toBe("0px");
    expect(grid.getAttribute("style")).not.toMatch(/NaN|Infinity/);
    expect(item.style.gridColumn).toBe("");
    expect(item.style.gridRow).toBe("");

    rerender(
      <ModernGrid columns={99 as never} gap={-4}>
        <ModernGridItem data-testid="item" span={99} rowSpan={99} />
      </ModernGrid>
    );
    expect(grid.style.gridTemplateColumns).toBe("repeat(12, minmax(0, 1fr))");
    expect(grid.style.gap).toBe("0px");
    expect(item.style.gridColumn).toBe("span 12");
    expect(item.style.gridRow).toBe("span 12");
  });
});
