/**
 * The Modern HoverCard surface is not a focus target; it stamps the kernel
 * focus state while a control inside it holds focus, and clears it on blur.
 */
import React from "react";
import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ModernHoverCard from "../engines/modern";

describe("HoverCard modern engine -- the surface stamps focus held inside it", () => {
  it("is not focusable itself and follows the control that takes focus", async () => {
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
    expect(surface.getAttribute("data-state")).toBe(
      link.matches(":focus-visible") ? "focused focus-visible" : "focused"
    );

    act(() => link.blur());
    expect(surface.hasAttribute("data-state")).toBe(false);
  });
});
