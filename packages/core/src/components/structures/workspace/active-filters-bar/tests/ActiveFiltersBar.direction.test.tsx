/**
 * The rail's arrow-key model reads ONE direction authority (WO-INV-01 L1).
 *
 * The chip group is an APG toolbar, so ArrowRight/ArrowLeft mean "next" and
 * "previous" in READING order, which reverses under RTL. That direction used
 * to be re-derived from the DOM -- `container.closest('[dir]')` with a
 * computed-style fallback -- which is unavailable during SSR, forces a style
 * recalculation inside a keydown handler, and re-derives from paint a fact the
 * i18n provider already holds. It now comes from `useReadingDirectionIsRtl`,
 * and this suite pins both directions through the provider that owns it.
 */
import React from "react";
import { describe, expect, it } from "vitest";
import { act, fireEvent, waitFor } from "@testing-library/react";

import { I18nProvider } from "@/infrastructure/runtime/i18n";
import { renderWithEngine } from "@tests/support/engine";
import { ActiveFiltersBar } from "../index";
import type { ActiveFilter } from "../contracts";

const FILTERS: ActiveFilter[] = [
  { key: "status", label: "Status", value: "active", displayValue: "Active" },
  { key: "owner", label: "Owner", value: "me", displayValue: "Me" },
  { key: "tier", label: "Tier", value: "gold", displayValue: "Gold" },
];

async function renderRail(locale: "en" | "ar"): Promise<HTMLElement[]> {
  const { container } = renderWithEngine(
    <I18nProvider locale={locale} fallbackLocale="en">
      <ActiveFiltersBar
        activeFilters={FILTERS}
        onRemoveFilter={() => undefined}
        onClearAll={() => undefined}
        onAddFilter={() => undefined}
      />
    </I18nProvider>,
    "modern"
  );
  await waitFor(() =>
    expect(container.querySelector('[data-part="chips"]')).not.toBeNull()
  );
  const chips = container.querySelector('[data-part="chips"]') as HTMLElement;
  await waitFor(() =>
    expect(chips.querySelectorAll("button").length).toBeGreaterThanOrEqual(3)
  );
  return Array.from(chips.querySelectorAll<HTMLElement>("button"));
}

describe("ActiveFiltersBar arrow-key direction", () => {
  it("moves forward with ArrowRight when the locale reads LTR", async () => {
    const items = await renderRail("en");

    act(() => items[0].focus());
    fireEvent.keyDown(items[0], { key: "ArrowRight" });
    expect(document.activeElement).toBe(items[1]);

    fireEvent.keyDown(items[1], { key: "ArrowLeft" });
    expect(document.activeElement).toBe(items[0]);
  });

  it("mirrors the model when the locale reads RTL: ArrowLeft moves forward", async () => {
    // Direction arrives through the i18n authority this owner now reads. No
    // `dir` attribute is set by this test: measuring one is exactly the probe
    // the migration removed.
    const items = await renderRail("ar");

    act(() => items[0].focus());
    fireEvent.keyDown(items[0], { key: "ArrowLeft" });
    expect(document.activeElement).toBe(items[1]);

    fireEvent.keyDown(items[1], { key: "ArrowRight" });
    expect(document.activeElement).toBe(items[0]);
  });

  it("keeps Home/End direction-free and wraps at both ends", async () => {
    const items = await renderRail("ar");
    const last = items[items.length - 1];

    act(() => items[0].focus());
    fireEvent.keyDown(items[0], { key: "End" });
    expect(document.activeElement).toBe(last);

    fireEvent.keyDown(last, { key: "Home" });
    expect(document.activeElement).toBe(items[0]);

    // Backward from the first lands on the last: under RTL "backward" is
    // ArrowRight, which is the half a physical mapping gets wrong.
    fireEvent.keyDown(items[0], { key: "ArrowRight" });
    expect(document.activeElement).toBe(last);
  });
});
