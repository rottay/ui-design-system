/**
 * The Modern HoverCard surface is not a focus target and stamps no focus state:
 * a control inside it holds focus and the surface stays unstamped.
 */
import React from "react";
import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ModernHoverCard from "../engines/modern";

describe("HoverCard modern engine -- the surface stamps no focus state", () => {
  it("is not focusable itself and stays unstamped while a control inside it holds focus", async () => {
    render(
      <ModernHoverCard
        open
        trigger={<button type="button">Trigger</button>}
        content={<a href="#profile">Profile</a>}
      />
    );
    const link = await screen.findByRole("link", { name: "Profile" });
    const surface = link.closest<HTMLElement>('[data-part="surface"]');
    if (!surface) throw new Error("no surface");

    expect(surface.hasAttribute("tabindex")).toBe(false);
    expect(surface.hasAttribute("data-state")).toBe(false);

    act(() => link.focus());
    expect(document.activeElement).toBe(link);
    expect(surface.hasAttribute("data-state")).toBe(false);

    act(() => link.blur());
    expect(surface.hasAttribute("data-state")).toBe(false);
  });
});
