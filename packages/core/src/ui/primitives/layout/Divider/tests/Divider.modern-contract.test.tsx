import React from "react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getThicknessValue, THICKNESS_MAP } from "../contracts";
import ModernDivider from "../engines/modern";

const dividerSkin = readFileSync(
  resolve(
    process.cwd(),
    "src/foundation/tokens/css/runtime/engines/modern/skin/divider.css"
  ),
  "utf8"
);

describe("Divider modern premium contract", () => {
  it("keeps a numeric zero label and derives an accessible separator name", () => {
    render(<ModernDivider data-testid="divider">{0}</ModernDivider>);

    const divider = screen.getByTestId("divider");
    expect(divider).toHaveAttribute("role", "separator");
    expect(divider).toHaveAttribute("aria-label", "0");
    expect(screen.getByText("0")).toBeInTheDocument();
    divider.querySelectorAll('[data-part^="line-"]').forEach((line) => {
      expect(line).toHaveAttribute("aria-hidden", "true");
    });
  });

  it("uses tenant-remappable thickness and label typography channels", () => {
    render(
      <ModernDivider data-testid="divider">Localized section</ModernDivider>
    );

    const divider = screen.getByTestId("divider");
    expect(THICKNESS_MAP.thin).toContain("--ds-divider-thickness-thin");
    expect(divider).toHaveAttribute("data-plain", "false");
    expect(divider).toHaveAttribute("data-component", "divider");
    expect(dividerSkin).toContain("--ds-divider-label-font-size");
    expect(dividerSkin).toContain("--ds-divider-label-tracking");
    expect(dividerSkin).toContain("prefers-reduced-motion: reduce");
  });

  it("keeps localized labels intrinsic instead of shrinking behind full-width line segments", () => {
    render(
      <ModernDivider data-testid="divider" textPosition="left">
        Key metrics
      </ModernDivider>
    );

    const lines = screen
      .getByTestId("divider")
      .querySelectorAll<HTMLElement>('[data-part^="line-"]');
    expect(lines).toHaveLength(2);
    lines.forEach((line) => {
      expect(line.style.width).toBe("auto");
    });
    expect(lines[0]?.style.flexGrow).toBe("0");
    expect(lines[1]?.style.flexGrow).toBe("1");
  });

  it("forwards locale and direction while preserving the owned root part", () => {
    render(
      <ModernDivider lang="ar" dir="rtl" data-part="consumer-value">
        القسم التالي
      </ModernDivider>
    );

    const divider = screen.getByRole("separator", { name: "القسم التالي" });
    expect(divider).toHaveAttribute("lang", "ar");
    expect(divider).toHaveAttribute("dir", "rtl");
    expect(divider).toHaveAttribute("data-part", "root");
  });

  it("uses logical start/end positioning without locale-side inversion", () => {
    const { rerender } = render(
      <ModernDivider data-testid="divider" dir="rtl" textPosition="start">
        المؤشرات الرئيسية
      </ModernDivider>
    );

    const divider = screen.getByTestId("divider");
    const lines = divider.querySelectorAll<HTMLElement>('[data-part^="line-"]');
    expect(divider).toHaveAttribute("data-text-position", "start");
    expect(divider).toHaveClass("rottay-divider--modern");
    expect(divider).not.toHaveClass("divider");
    expect(lines[0]?.style.flexGrow).toBe("0");
    expect(lines[1]?.style.flexGrow).toBe("1");

    rerender(
      <ModernDivider data-testid="divider" dir="rtl" textPosition="left">
        Compatibility alias
      </ModernDivider>
    );
    expect(divider).toHaveAttribute("data-text-position", "start");
  });

  it("keeps an intrinsic vertical separator visible in inline containers", () => {
    render(
      <ModernDivider
        data-testid="divider"
        orientation="vertical"
        spacing="none"
      />
    );

    const divider = screen.getByTestId("divider");
    expect(divider).toHaveStyle({ height: "100%" });
    expect(divider.style.minHeight).toBe(
      "var(--ds-divider-vertical-min-block-size, 1em)"
    );
    expect(divider).toHaveAttribute("data-orientation", "vertical");
    expect(divider).not.toHaveClass("divider", "divider-vertical");
  });

  it("rejects unsafe custom thickness values", () => {
    expect(getThicknessValue(Number.NaN)).toBe(THICKNESS_MAP.thin);
    expect(getThicknessValue(-1)).toBe(THICKNESS_MAP.thin);
    expect(getThicknessValue(2.5)).toBe("2.5px");
  });
});
