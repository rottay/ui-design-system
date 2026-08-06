import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ModernPopover from "../engines/modern";

describe("Popover modern engine controlled dismissal", () => {
  it("keeps reporting Escape while a controlled parent holds the popover open", async () => {
    const onOpenChange = vi.fn();

    render(
      <ModernPopover
        content="Controlled body"
        title="Controlled popover"
        trigger="click"
        open
        onOpenChange={onOpenChange}
      >
        <button type="button">Open popover</button>
      </ModernPopover>
    );

    await screen.findByRole("dialog", { name: "Controlled popover" });

    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.keyDown(document, { key: "Escape" });

    // The parent refused the first close, so the surface is still open and the
    // second dismissal is a fresh request that must reach the owner.
    expect(screen.getByRole("dialog", { name: "Controlled popover" })).toBeTruthy();
    expect(onOpenChange.mock.calls).toEqual([[false], [false]]);
  });

  it("keeps reporting outside dismissal while a controlled parent holds the popover open", async () => {
    const onOpenChange = vi.fn();

    render(
      <div>
        <button type="button">Outside</button>
        <ModernPopover
          content="Controlled body"
          title="Controlled popover"
          trigger="click"
          open
          onOpenChange={onOpenChange}
        >
          <button type="button">Open popover</button>
        </ModernPopover>
      </div>
    );

    await screen.findByRole("dialog", { name: "Controlled popover" });
    const outside = screen.getByRole("button", { name: "Outside" });

    fireEvent.pointerDown(outside);
    fireEvent.pointerDown(outside);

    expect(onOpenChange.mock.calls).toEqual([[false], [false]]);
  });
});
