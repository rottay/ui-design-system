/**
 * The control cluster is an APG toolbar, so ArrowRight/ArrowLeft mean "next"
 * and "previous" in READING order, which reverses under RTL. The rail's LTR
 * half was already pinned by the reachability suite; this one pins the mirrored
 * half and the wrap, through the i18n provider that owns reading direction.
 */
import React from "react";
import { describe, expect, it } from "vitest";
import { act, fireEvent, waitFor } from "@testing-library/react";

import { I18nProvider } from "@/infrastructure/runtime/i18n";
import { renderWithEngine } from "@tests/support/engine";
import { TableToolbar } from "../index";

async function renderControls(locale: "en" | "ar"): Promise<HTMLElement[]> {
  const { container } = renderWithEngine(
    <I18nProvider locale={locale} fallbackLocale="en">
      <TableToolbar
        search=""
        onSearchChange={() => undefined}
        isFiltered
        onResetFilters={() => undefined}
        filters={<button type="button">Status</button>}
        actions={<button type="button">Extra</button>}
        primaryAction={{ label: "New", onClick: () => undefined }}
      />
    </I18nProvider>,
    "modern"
  );
  await waitFor(() =>
    expect(container.querySelector('[role="toolbar"]')).not.toBeNull()
  );
  const toolbar = container.querySelector('[role="toolbar"]') as HTMLElement;
  await waitFor(() =>
    expect(toolbar.querySelectorAll("button").length).toBeGreaterThanOrEqual(3)
  );
  return Array.from(toolbar.querySelectorAll<HTMLElement>("button"));
}

describe("TableToolbar arrow-key direction", () => {
  it("moves forward with ArrowRight when the locale reads LTR", async () => {
    const controls = await renderControls("en");
    const toolbar = controls[0].closest('[role="toolbar"]') as HTMLElement;

    act(() => controls[0].focus());
    fireEvent.keyDown(toolbar, { key: "ArrowRight" });
    expect(document.activeElement).toBe(controls[1]);

    fireEvent.keyDown(toolbar, { key: "ArrowLeft" });
    expect(document.activeElement).toBe(controls[0]);
  });

  it("mirrors the model when the locale reads RTL: ArrowLeft moves forward", async () => {
    // Direction arrives through the i18n authority; this test sets no `dir`
    // attribute, because measuring one is the probe the kernel refuses.
    const controls = await renderControls("ar");
    const toolbar = controls[0].closest('[role="toolbar"]') as HTMLElement;

    act(() => controls[0].focus());
    fireEvent.keyDown(toolbar, { key: "ArrowLeft" });
    expect(document.activeElement).toBe(controls[1]);

    fireEvent.keyDown(toolbar, { key: "ArrowRight" });
    expect(document.activeElement).toBe(controls[0]);
  });

  it("keeps Home/End direction-free and wraps at both ends under RTL", async () => {
    const controls = await renderControls("ar");
    const toolbar = controls[0].closest('[role="toolbar"]') as HTMLElement;
    const last = controls[controls.length - 1];

    act(() => controls[0].focus());
    fireEvent.keyDown(toolbar, { key: "End" });
    expect(document.activeElement).toBe(last);

    fireEvent.keyDown(toolbar, { key: "Home" });
    expect(document.activeElement).toBe(controls[0]);

    // Backward from the first lands on the last: under RTL "backward" is
    // ArrowRight, which is the half a physical key mapping gets wrong.
    fireEvent.keyDown(toolbar, { key: "ArrowRight" });
    expect(document.activeElement).toBe(last);
  });

  it("leaves the cross-axis arrows to the controls themselves", async () => {
    const controls = await renderControls("en");
    const toolbar = controls[0].closest('[role="toolbar"]') as HTMLElement;

    act(() => controls[0].focus());
    fireEvent.keyDown(toolbar, { key: "ArrowDown" });
    expect(document.activeElement).toBe(controls[0]);

    fireEvent.keyDown(toolbar, { key: "ArrowUp" });
    expect(document.activeElement).toBe(controls[0]);
  });
});
