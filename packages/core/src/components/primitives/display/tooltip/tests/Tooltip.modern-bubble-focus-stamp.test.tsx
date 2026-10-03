/**
 * The Modern interactive Tooltip bubble stamps the kernel focus state while a
 * control inside it holds focus, and clears it on blur; a plain tooltip bubble
 * stamps nothing.
 */
import React from "react";
import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ModernTooltip from "../engines/modern";

describe("Tooltip modern engine -- the interactive bubble stamps focus held inside it", () => {
  it("follows the control that takes focus", async () => {
    render(
      <ModernTooltip interactive visible content={<a href="#docs">Docs</a>}>
        <button type="button">Trigger</button>
      </ModernTooltip>
    );
    const link = await screen.findByRole("link", { name: "Docs" });
    const bubble = link.closest<HTMLElement>('[data-part="bubble"]');
    if (!bubble) throw new Error("no bubble");

    expect(bubble.getAttribute("data-interactive")).toBe("true");
    expect(bubble.hasAttribute("data-state")).toBe(false);

    act(() => link.focus());
    expect(bubble.getAttribute("data-state")).toBe(
      link.matches(":focus-visible") ? "focused focus-visible" : "focused"
    );

    act(() => link.blur());
    expect(bubble.hasAttribute("data-state")).toBe(false);
  });

  it("stamps nothing on a plain bubble", async () => {
    render(
      <ModernTooltip visible content="Plain">
        <button type="button">Trigger</button>
      </ModernTooltip>
    );
    const bubble = await screen.findByRole("tooltip");
    expect(bubble.getAttribute("data-part")).toBe("bubble");
    expect(bubble.hasAttribute("data-state")).toBe(false);
  });
});
