import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { SvgPieRenderer } from "../SvgPieRenderer";

const DATA = [
  { id: "north", label: "North", value: 30 },
  { id: "south", label: "South", value: 70 },
] as const;

describe("SvgPieRenderer", () => {
  it("server-renders a stable semantic donut tree with direct and center labels", () => {
    const html = renderToString(
      <SvgPieRenderer
        ariaLabel="Revenue share"
        ariaDescription="Revenue grouped by region"
        data={DATA}
        variant="donut"
        responsive={false}
        showLabels
        centerValue="$1M"
        centerLabel="Revenue"
      />
    );

    expect(html).toContain("<title");
    expect(html).toContain("Revenue share");
    expect(html).toContain("Revenue grouped by region");
    expect(html.match(/data-part="pie-slice"/g)).toHaveLength(2);
    expect(html).toContain('data-variant="donut"');
    expect(html).toContain('data-part="pie-center-label"');
    expect(html).toContain("$1M");
    expect(html).toContain("30%");
    expect(html).toContain("70%");
  });

  it("exposes shared keyboard/action semantics and an anchored tooltip", () => {
    const onAction = vi.fn();
    render(
      <SvgPieRenderer
        ariaLabel="Revenue share"
        data={DATA}
        responsive={false}
        interaction={{
          mode: "select",
          defaultActiveKey: "north",
          actionLabel: "Select region",
          onAction,
          renderTooltip: (active) => `Active ${active.datum.label}`,
        }}
      />
    );

    const north = screen.getByRole("button", {
      name: "North: 30 (30%). Select region",
    });
    expect(north).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("tooltip")).toHaveTextContent("Active North");

    fireEvent.click(north);
    expect(onAction).toHaveBeenCalledWith(
      expect.objectContaining({
        key: "north",
        datum: expect.objectContaining({ id: "north" }),
      }),
      expect.objectContaining({ input: "keyboard", reason: "action" })
    );
  });

  it("renders a truthful empty surface for zero totals", () => {
    render(
      <SvgPieRenderer
        ariaLabel="No share"
        data={[{ id: "zero", label: "Zero", value: 0 }]}
        responsive={false}
      />
    );

    expect(
      screen
        .getByRole("img", { name: "No share" })
        .closest('[data-part="chart-renderer"]')
    ).toHaveAttribute("data-empty", "true");
    expect(document.querySelectorAll('[data-part="pie-slice"]')).toHaveLength(
      0
    );
  });
});
