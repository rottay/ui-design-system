/**
 * The Modern Popover surface stamps the kernel focus state for its OWN focus
 * only: a control inside it that takes focus leaves the surface unstamped.
 */
import React from "react";
import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ModernPopover from "../engines/modern";

function renderOpen(content: React.ReactNode) {
  render(
    <ModernPopover content={content} title="Details" trigger="click" open>
      <button type="button">Open popover</button>
    </ModernPopover>
  );
}

describe("Popover modern engine -- the surface stamps its own focus", () => {
  it("stamps focused and focus-visible while the surface itself holds focus, and clears on blur", async () => {
    renderOpen("Read-only body");
    const surface = await screen.findByRole("dialog", { name: "Details" });

    expect(surface.getAttribute("data-part")).toBe("surface");
    expect(surface.tabIndex).toBe(-1);
    expect(surface.hasAttribute("data-state")).toBe(false);

    act(() => surface.focus());
    expect(document.activeElement).toBe(surface);
    expect(surface.getAttribute("data-state")).toBe(
      surface.matches(":focus-visible") ? "focused focus-visible" : "focused"
    );

    act(() => surface.blur());
    expect(surface.hasAttribute("data-state")).toBe(false);
  });

  it("leaves the surface unstamped while a control inside it holds focus", async () => {
    renderOpen(<button type="button">Inner action</button>);
    const surface = await screen.findByRole("dialog", { name: "Details" });
    const inner = screen.getByRole("button", { name: "Inner action" });

    act(() => inner.focus());
    expect(document.activeElement).toBe(inner);
    expect(surface.hasAttribute("data-state")).toBe(false);
  });
});
