import React from "react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import ModernStack from "../engines/modern";

const layoutSkin = readFileSync(
  resolve(
    process.cwd(),
    "src/foundation/tokens/css/presentation/components/skin/layout-primitives.css"
  ),
  "utf8"
);

describe("Modern Stack quality contract", () => {
  it("uses a direction-agnostic tokenized divider and safe nested sizing", () => {
    const { getByRole, container } = render(
      <ModernStack
        as="section"
        role="region"
        aria-label="Decision evidence"
        direction="horizontal"
        spacing="md"
        divider
        motion="rearrange"
        dir="rtl"
        lang="ar"
      >
        <span>الدليل الأول</span>
        <span>الدليل الثاني</span>
      </ModernStack>
    );

    const stack = getByRole("region");
    const divider = container.querySelector(
      '[data-part="divider"]'
    ) as HTMLElement;
    expect(stack).toHaveAttribute("data-component", "stack");
    expect(stack).toHaveAttribute("dir", "rtl");
    expect(stack.style.minInlineSize).toBe("0");
    expect(stack.style.transition).toBe("var(--ds-transition-rearrange)");
    expect(divider).toHaveAttribute("aria-hidden", "true");
    expect(divider).toHaveClass("rottay-stack-divider");
    expect(divider).not.toHaveAttribute("style");
    expect(layoutSkin).toContain("--ds-stack-divider-size");
    expect(layoutSkin).toContain("--ds-stack-divider-color");
    expect(divider.getAttribute("style") ?? "").not.toMatch(
      /border-(left|inline-start)/
    );
  });

  it("keeps responsive direction, gap and wrap in one scoped layout contract", () => {
    const { container } = render(
      <ModernStack
        direction={{ xs: "vertical", lg: "horizontal" }}
        spacing={{ xs: "sm", lg: "xl" }}
        wrap={{ xs: false, lg: true }}
      >
        <span>One</span>
        <span>Two</span>
      </ModernStack>
    );

    const css = container.querySelector("style")?.textContent ?? "";
    expect(css).toContain("flex-direction: column");
    expect(css).toContain("flex-direction: row");
    expect(css).toContain("gap: var(--ds-spacing-2");
    expect(css).toContain("gap: var(--ds-spacing-8");
    expect(css).toContain("flex-wrap: wrap");
  });
});
