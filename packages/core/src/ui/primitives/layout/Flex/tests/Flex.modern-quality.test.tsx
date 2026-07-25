import React from "react";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import ModernFlex from "../engines/modern";

describe("Modern Flex quality contract", () => {
  it("keeps semantic gaps tokenized and the formatting context shrink-safe", () => {
    const { getByRole } = render(
      <ModernFlex
        role="group"
        aria-label="Candidate actions"
        dir="rtl"
        lang="ar"
        gap={["sm", "lg"]}
        motion="rearrange"
        engine="modern"
        data-component="caller-value"
      >
        <span>الأدلة</span>
        <span>القرار</span>
      </ModernFlex>
    );

    const flex = getByRole("group");
    expect(flex).toHaveAttribute("data-component", "flex");
    expect(flex).toHaveAttribute("data-gap", "split");
    expect(flex).toHaveAttribute("dir", "rtl");
    expect(flex).not.toHaveAttribute("engine");
    expect(flex.style.minInlineSize).toBe("0");
    expect(flex.getAttribute("style")).toContain(
      "--ds-flex-column-gap: var(--ds-spacing-2"
    );
    expect(flex.getAttribute("style")).toContain(
      "--ds-flex-row-gap: var(--ds-spacing-6"
    );
    expect(flex.style.transition).toBe("var(--ds-transition-rearrange)");
  });

  it("projects responsive gap, width and overflow from one scoped rule set", () => {
    const { container } = render(
      <ModernFlex
        gap={{ xs: "sm", md: ["md", "lg"] }}
        width={{ xs: "100%", lg: 960 }}
        minWidth={{ xs: 0, lg: 640 }}
        overflow={{ xs: "auto", lg: "visible" }}
      />
    );

    const css = container.querySelector("style")?.textContent ?? "";
    expect(css).toContain("gap: var(--ds-spacing-2");
    expect(css).toContain("var(--ds-spacing-4");
    expect(css).toContain("var(--ds-spacing-6");
    expect(css).toContain("width: 100%");
    expect(css).toContain("width: 960px");
    expect(css).toContain("min-width: 0px");
    expect(css).toContain("overflow: auto");
  });

  it("normalizes invalid scalar, tuple, and responsive numeric gaps", () => {
    const { container, rerender } = render(
      <ModernFlex role="group" gap={Number.NaN} />
    );

    const scalar = container.querySelector('[role="group"]') as HTMLElement;
    expect(scalar.getAttribute("style")).toContain("--ds-flex-gap: 0px");
    expect(scalar.getAttribute("style")).not.toMatch(/NaN|Infinity|-[0-9]/);

    rerender(<ModernFlex role="group" gap={[-12, Number.POSITIVE_INFINITY]} />);
    expect(scalar.getAttribute("style")).toContain("--ds-flex-column-gap: 0px");
    expect(scalar.getAttribute("style")).toContain("--ds-flex-row-gap: 0px");

    rerender(
      <ModernFlex
        gap={{ xs: Number.NaN, md: [-4, Number.NEGATIVE_INFINITY] }}
      />
    );
    const css = container.querySelector("style")?.textContent ?? "";
    expect(css).toContain("gap: 0px");
    expect(css).not.toMatch(/NaN|Infinity|gap:\s*-/);
  });
});
