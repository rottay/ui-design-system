import React from "react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Space as ModernSpace } from "../engines/modern";

const layoutSkin = readFileSync(
  resolve(
    process.cwd(),
    "src/foundation/tokens/css/presentation/components/skin/layout-primitives.css"
  ),
  "utf8"
);

describe("Space modern premium contract", () => {
  it("resolves preset gaps as valid token values rather than malformed var()px CSS", () => {
    render(
      <ModernSpace size="middle" data-testid="space">
        Content
      </ModernSpace>
    );

    const style = screen.getByTestId("space").getAttribute("style") ?? "";
    expect(style).toContain("--ds-space-middle-size");
    expect(style).not.toContain(")px");
  });

  it("preserves numeric zero children and marks visual split items as decorative", () => {
    render(
      <ModernSpace split="·" data-testid="space">
        <span>First</span>
        {0}
        <span>Last</span>
      </ModernSpace>
    );

    const space = screen.getByTestId("space");
    expect(within(space).getByText("0")).toBeInTheDocument();
    expect(space.querySelectorAll('[data-part="separator"]')).toHaveLength(2);
    space.querySelectorAll('[data-part="separator"]').forEach((separator) => {
      expect(separator).toHaveAttribute("aria-hidden", "true");
    });
  });

  it("forwards RTL and semantic grouping metadata while protecting anatomy", () => {
    render(
      <ModernSpace
        role="group"
        lang="he"
        dir="rtl"
        aria-label="פעולות"
        data-part="override"
      >
        <button type="button">אישור</button>
      </ModernSpace>
    );

    const space = screen.getByRole("group");
    expect(space).toHaveAttribute("dir", "rtl");
    expect(space).toHaveAttribute("lang", "he");
    expect(space).toHaveAttribute("data-part", "root");
    expect(space).toHaveAttribute("data-component", "space");
    expect(layoutSkin).toContain("--ds-space-motion-duration");
    expect(layoutSkin).toContain("prefers-reduced-motion: reduce");
  });

  it("normalizes unsafe negative and non-finite gaps", () => {
    const { rerender } = render(
      <ModernSpace size={-8} data-testid="space">
        A
      </ModernSpace>
    );
    expect(
      screen
        .getByTestId("space")
        .style.getPropertyValue("--ds-space-instance-gap")
    ).toBe("0px");

    rerender(
      <ModernSpace size={[Number.NaN, 8]} data-testid="space">
        A
      </ModernSpace>
    );
    expect(
      screen
        .getByTestId("space")
        .style.getPropertyValue("--ds-space-instance-gap")
    ).toBe("8px 0px");
  });
});
