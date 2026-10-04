/**
 * The Modern Tooltip bubble is never a tab stop and stamps no focus state:
 * a control inside an interactive bubble holds focus and the bubble stays
 * unstamped, as a plain bubble does.
 */
import React from "react";
import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ModernTooltip from "../engines/modern";

describe("Tooltip modern engine -- the bubble stamps no focus state", () => {
  it("stays unstamped while a control inside it holds focus", async () => {
    render(
      <ModernTooltip interactive visible content={<a href="#docs">Docs</a>}>
        <button type="button">Trigger</button>
      </ModernTooltip>
    );
    const link = await screen.findByRole("link", { name: "Docs" });
    const bubble = link.closest<HTMLElement>('[data-part="bubble"]');
    if (!bubble) throw new Error("no bubble");

    expect(bubble.getAttribute("data-interactive")).toBe("true");
    expect(bubble.getAttribute("tabindex")).toBe("-1");
    expect(bubble.hasAttribute("data-state")).toBe(false);

    act(() => link.focus());
    expect(document.activeElement).toBe(link);
    expect(bubble.hasAttribute("data-state")).toBe(false);

    act(() => link.blur());
    expect(bubble.hasAttribute("data-state")).toBe(false);
  });

  it("stamps nothing on a plain bubble, which takes no tab stop", async () => {
    render(
      <ModernTooltip visible content="Plain">
        <button type="button">Trigger</button>
      </ModernTooltip>
    );
    const bubble = await screen.findByRole("tooltip");
    expect(bubble.getAttribute("data-part")).toBe("bubble");
    expect(bubble.hasAttribute("tabindex")).toBe(false);
    expect(bubble.hasAttribute("data-state")).toBe(false);
  });
});
