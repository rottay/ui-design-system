import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getThicknessValue, THICKNESS_MAP } from "../contracts";
import ModernDivider from "../engines/modern";

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

  it("carries the resolved hairline on its one channel and nothing else inline", () => {
    render(
      <ModernDivider data-testid="divider">Localized section</ModernDivider>
    );

    const divider = screen.getByTestId("divider");
    expect(THICKNESS_MAP.thin).toContain("--ds-divider-thickness-thin");
    expect(divider).toHaveAttribute("data-plain", "false");
    expect(divider).toHaveAttribute("data-component", "divider");
    expect(divider.style.getPropertyValue("--ds-divider-line")).toContain(
      "--ds-divider-thickness-thin"
    );
    const declared = (divider.getAttribute("style") ?? "")
      .split(";")
      .map((entry) => entry.split(":")[0]?.trim())
      .filter((name): name is string => Boolean(name));
    expect(declared).toEqual(["--ds-divider-line"]);
  });

  it("stamps both segments and the label placement the skin keys on", () => {
    render(
      <ModernDivider data-testid="divider" textPosition="left">
        Key metrics
      </ModernDivider>
    );

    const divider = screen.getByTestId("divider");
    const lines = divider.querySelectorAll<HTMLElement>('[data-part^="line-"]');
    expect(lines).toHaveLength(2);
    expect(lines[0]).toHaveAttribute("data-part", "line-before");
    expect(lines[1]).toHaveAttribute("data-part", "line-after");
    // The legacy physical alias normalizes onto the logical contract.
    expect(divider).toHaveAttribute("data-text-position", "start");
    // No segment carries a value of its own any more.
    lines.forEach((line) => {
      expect(line.getAttribute("style")).toBeNull();
    });
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
    expect(divider).toHaveClass("ds-divider--modern");
    expect(divider).not.toHaveClass("divider");
    expect(lines).toHaveLength(2);

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
    expect(divider).toHaveAttribute("data-orientation", "vertical");
    expect(divider).toHaveAttribute("data-spacing", "none");
    expect(divider).not.toHaveClass("divider", "divider-vertical");
  });

  it("rejects unsafe custom thickness values", () => {
    expect(getThicknessValue(Number.NaN)).toBe(THICKNESS_MAP.thin);
    expect(getThicknessValue(-1)).toBe(THICKNESS_MAP.thin);
    expect(getThicknessValue(2.5)).toBe("2.5px");
  });
});
