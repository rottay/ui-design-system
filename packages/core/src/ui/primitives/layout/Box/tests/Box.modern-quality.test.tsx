import React from "react";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import ModernBox from "../engines/modern";

describe("Modern Box quality contract", () => {
  it("projects scalar structure without runtime Tailwind class dependencies", () => {
    const { getByRole } = render(
      <ModernBox
        as="section"
        role="region"
        aria-label="Decision workspace"
        dir="rtl"
        lang="ar"
        display="grid"
        position="relative"
        overflow="clip"
        paddingInlineStart="lg"
        paddingInlineEnd="sm"
        motion="resize"
        engine="modern"
        data-component="caller-value"
      >
        المحتوى
      </ModernBox>
    );

    const box = getByRole("region");
    expect(box).toHaveClass("rottay-box--modern");
    expect(box).toHaveAttribute("data-component", "box");
    expect(box).toHaveAttribute("dir", "rtl");
    expect(box).toHaveAttribute("lang", "ar");
    expect(box).not.toHaveAttribute("engine");
    expect(box.style.display).toBe("grid");
    expect(box.style.position).toBe("relative");
    expect(box.style.overflow).toBe("clip");
    expect(box.style.paddingInlineStart).toContain("--ds-spacing-6");
    expect(box.style.transition).toBe("var(--ds-transition-resize)");
    expect(box.className).not.toMatch(/overflow-|grid-cols-|\brelative\b/);
  });

  it("emits logical, height and overflow responsive CSS with token values", () => {
    const { container } = render(
      <ModernBox
        paddingInlineStart={{ xs: "sm", lg: "xl" }}
        paddingBlock={{ xs: "xs", md: "lg" }}
        height={{ xs: 240, lg: "70vh" }}
        maxHeight={{ xs: 480, lg: "none" }}
        overflow={{ xs: "auto", lg: "clip" }}
      />
    );

    const css = container.querySelector("style")?.textContent ?? "";
    expect(css).toContain("padding-inline-start: var(--ds-spacing-2");
    expect(css).toContain("padding-block: var(--ds-spacing-1");
    expect(css).toContain("height: 240px");
    expect(css).toContain("max-height: 480px");
    expect(css).toContain("overflow: auto");
    expect(css).toContain("@media (min-width: 1024px)");
    expect(css).toContain("overflow: clip");
  });
});
