import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import ModernTooltip from "../engines/modern";

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("ModernTooltip", () => {
  it("wraps long tooltip content and honors maxWidth/zIndex", () => {
    render(
      <ModernTooltip
        content="Open this operational row to review the complete context before routing work."
        maxWidth={272}
        visible
        zIndex={2700}
      >
        <button>Action</button>
      </ModernTooltip>
    );

    const tooltip = screen.getByRole("tooltip");
    expect(tooltip).toHaveStyle({ position: "fixed" });
    expect(
      tooltip.style.getPropertyValue("--ds-tooltip-instance-max-width")
    ).toBe("272px");
    expect(
      tooltip.style.getPropertyValue("--ds-tooltip-instance-z-index")
    ).toBe("2700");
    // The measured branch renders through the shared overlay portal root.
    expect(tooltip.closest("[data-rottay-portal]")).not.toBeNull();
  });

  it("uses a tokenized high z-index fallback", () => {
    render(
      <ModernTooltip content="Default wrapping" visible>
        <button>Default action</button>
      </ModernTooltip>
    );

    const tooltip = screen.getByRole("tooltip");
    expect(
      tooltip.style.getPropertyValue("--ds-tooltip-instance-z-index")
    ).toBe("var(--ds-z-index-tooltip)");
  });

  it("renders formatted key chips alongside content when shortcut is set", () => {
    render(
      <ModernTooltip content="Open command palette" shortcut="ctrl+k" visible>
        <button>Open</button>
      </ModernTooltip>
    );

    const tooltip = screen.getByRole("tooltip");
    expect(tooltip).toHaveTextContent("Open command palette");
    // formatShortcutKey renders platform-appropriate symbols (Ctrl or the
    // Mac control glyph) plus the letter -- assert on the kbd count and the
    // stable letter segment rather than the platform-dependent modifier glyph.
    expect(tooltip.querySelectorAll("kbd")).toHaveLength(2);
    expect(tooltip).toHaveTextContent("K");
  });

  it("renders no kbd chips when shortcut is omitted", () => {
    render(
      <ModernTooltip content="Plain tooltip" visible>
        <button>Action</button>
      </ModernTooltip>
    );

    const tooltip = screen.getByRole("tooltip");
    expect(tooltip.querySelectorAll("kbd")).toHaveLength(0);
  });

  it("does not publish a dangling description or overlay layer for empty content", () => {
    render(
      <ModernTooltip content={false} visible>
        <button>Empty help</button>
      </ModernTooltip>
    );

    expect(screen.getByRole("button")).not.toHaveAttribute("aria-describedby");
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("uses block-safe content anatomy for rich React nodes", () => {
    render(
      <ModernTooltip
        content={
          <section>
            <strong>Decision context</strong>
            <p>Evidence remains readable without invalid span nesting.</p>
          </section>
        }
        recipe="rich"
        visible
      >
        <button>Review</button>
      </ModernTooltip>
    );

    const content = screen
      .getByRole("tooltip")
      .querySelector('[data-part="content"]');
    expect(content?.tagName).toBe("DIV");
    expect(content?.querySelector("section")).not.toBeNull();
  });

  it("exposes radius, arrow, and interactive anatomy", () => {
    render(
      <ModernTooltip
        content="Interactive help"
        visible
        interactive
        radius="lg"
        placement="bottom"
      >
        <button>Help</button>
      </ModernTooltip>
    );

    const tooltip = screen.getByRole("dialog");
    expect(tooltip).toHaveAttribute("data-radius", "lg");
    expect(tooltip).toHaveAttribute("data-interactive", "true");
    expect(tooltip).toHaveAttribute("data-has-arrow", "true");
    expect(tooltip.querySelector('[data-part="arrow"]')).not.toBeNull();
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-haspopup",
      "dialog"
    );
    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true");
  });

  it("keeps interactive content open across the trigger-to-portal pointer gap", () => {
    vi.useFakeTimers();
    const { container } = render(
      <ModernTooltip
        content={<button>Surface action</button>}
        interactive
        trigger="hover"
        showDelay={0}
        hideDelay={20}
      >
        <button>Anchor</button>
      </ModernTooltip>
    );

    const root = container.querySelector('[data-part="root"]')!;
    fireEvent.pointerEnter(root, { pointerType: "mouse" });
    const surface = screen.getByRole("dialog");
    fireEvent.pointerLeave(root, { pointerType: "mouse" });
    fireEvent.pointerEnter(surface, { pointerType: "mouse" });
    act(() => vi.advanceTimersByTime(120));
    expect(surface).toHaveAttribute("data-open", "true");

    fireEvent.pointerLeave(surface, { pointerType: "mouse" });
    act(() => vi.advanceTimersByTime(120));
    expect(screen.getByRole("dialog", { hidden: true })).toHaveAttribute(
      "data-open",
      "false"
    );
  });

  it("links the visible description to the trigger and preserves an existing description", () => {
    render(
      <ModernTooltip content="Decision context" visible>
        <button aria-describedby="existing-help">Help</button>
      </ModernTooltip>
    );

    const trigger = screen.getByRole("button");
    const tooltip = screen.getByRole("tooltip");
    expect(trigger.getAttribute("aria-describedby")?.split(" ")).toEqual([
      "existing-help",
      tooltip.id,
    ]);
  });

  it("makes a hover tooltip immediately discoverable from keyboard focus", () => {
    render(
      <ModernTooltip content="Keyboard help" trigger="hover">
        <button>Focusable control</button>
      </ModernTooltip>
    );

    fireEvent.focus(screen.getByRole("button"));
    expect(screen.getByRole("tooltip")).toHaveTextContent("Keyboard help");
  });

  it("suppresses incidental touch hover", () => {
    render(
      <ModernTooltip content="Pointer help" trigger="hover" showDelay={0}>
        <button>Touch target</button>
      </ModernTooltip>
    );

    fireEvent.pointerEnter(screen.getByRole("button"), {
      pointerType: "touch",
    });
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("exposes a hover description by deliberate touch long press", () => {
    vi.useFakeTimers();
    render(
      <ModernTooltip
        content="Touch-accessible help"
        trigger="hover"
        touchLongPressDelay={450}
      >
        <button>Touch help</button>
      </ModernTooltip>
    );

    const trigger = screen.getByRole("button");
    fireEvent.pointerDown(trigger, { pointerType: "touch" });
    fireEvent.focus(trigger);
    expect(screen.queryByRole("tooltip")).toBeNull();
    act(() => vi.advanceTimersByTime(449));
    expect(screen.queryByRole("tooltip")).toBeNull();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByRole("tooltip")).toHaveTextContent(
      "Touch-accessible help"
    );
    fireEvent.pointerUp(trigger, { pointerType: "touch" });
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });

  it("removes competing native title chrome while preserving its accessible name", () => {
    render(
      <ModernTooltip content="DS-owned explanation" visible>
        <button title="Open evidence">Open</button>
      </ModernTooltip>
    );

    const trigger = screen.getByRole("button", { name: "Open evidence" });
    expect(trigger).not.toHaveAttribute("title");
    expect(trigger).toHaveAttribute("aria-label", "Open evidence");
  });

  it("dismisses an opened long-press tooltip when the touch gesture cancels", () => {
    vi.useFakeTimers();
    render(
      <ModernTooltip
        content="Touch context"
        trigger="hover"
        touchLongPressDelay={300}
      >
        <button>Touch target</button>
      </ModernTooltip>
    );

    const trigger = screen.getByRole("button");
    fireEvent.pointerDown(trigger, { pointerType: "touch" });
    act(() => vi.advanceTimersByTime(300));
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    fireEvent.pointerCancel(trigger, { pointerType: "touch" });
    expect(screen.getByRole("tooltip", { hidden: true })).toHaveAttribute(
      "data-open",
      "false"
    );
  });

  it("closes on Escape while retaining an aria-hidden exit frame", () => {
    render(
      <ModernTooltip content="Dismissible help" defaultVisible>
        <button>Dismiss target</button>
      </ModernTooltip>
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.getByRole("tooltip", { hidden: true })).toHaveAttribute(
      "aria-hidden",
      "true"
    );
    expect(screen.getByRole("tooltip", { hidden: true })).toHaveAttribute(
      "inert"
    );
    expect(screen.getByRole("button")).not.toHaveAttribute("aria-describedby");
  });

  it("exposes a bounded recipe and carries RTL locale context through the portal", () => {
    vi.spyOn(window, "getComputedStyle").mockReturnValue({
      direction: "rtl",
    } as CSSStyleDeclaration);
    render(
      <div dir="rtl" lang="ar">
        <ModernTooltip
          content="سياق قرار طويل قابل للالتفاف"
          recipe="rich"
          visible
        >
          <button>مساعدة</button>
        </ModernTooltip>
      </div>
    );

    const tooltip = screen.getByRole("tooltip");
    expect(tooltip).toHaveAttribute("data-recipe", "rich");
    expect(tooltip).toHaveAttribute("dir", "rtl");
    expect(tooltip).toHaveAttribute("lang", "ar");
  });

  it("projects a local DS theme scope onto the portal bubble", () => {
    render(
      <div
        data-ds-root=""
        data-vertical="bithire"
        data-tenant="themanagementmiami"
        data-theme="dark"
        data-engine="modern"
        data-density="compact"
        style={{
          "--ds-tooltip-bordered-radius": "7px",
          "--ds-tooltip-bordered-shadow": "0 8px 20px rgba(20, 40, 59, .14)",
        } as React.CSSProperties}
      >
        <ModernTooltip content="Scoped decision context" visible>
          <button>Inspect</button>
        </ModernTooltip>
      </div>
    );

    const tooltip = screen.getByRole("tooltip");
    expect(tooltip).toHaveAttribute("data-ds-root", "");
    expect(tooltip).toHaveAttribute("data-vertical", "bithire");
    expect(tooltip).toHaveAttribute("data-tenant", "themanagementmiami");
    expect(tooltip).toHaveAttribute("data-theme", "dark");
    expect(tooltip).toHaveAttribute("data-engine", "modern");
    expect(tooltip).toHaveAttribute("data-density", "compact");
    expect(tooltip).toHaveAttribute("data-layer-kind", "tooltip");
    expect(tooltip.closest('[data-rottay-portal]')).not.toBeNull();
    expect(
      tooltip.style.getPropertyValue("--ds-tooltip-bordered-radius")
    ).toBe("7px");
  });

  it("keeps the arrow on the resolved logical edge after an RTL collision flip", async () => {
    vi.spyOn(window, "getComputedStyle").mockReturnValue({
      direction: "rtl",
    } as CSSStyleDeclaration);
    render(
      <div dir="rtl">
        <ModernTooltip content="سياق القرار" placement="bottom-start" visible>
          <button>افتح</button>
        </ModernTooltip>
      </div>
    );

    const tooltip = screen.getByRole("tooltip");
    const anchor = screen.getByRole("button").parentElement as HTMLElement;
    vi.spyOn(anchor, "getBoundingClientRect").mockReturnValue({
      top: 100,
      bottom: 140,
      left: 100,
      right: 200,
      width: 100,
      height: 40,
      x: 100,
      y: 100,
      toJSON: () => ({}),
    } as DOMRect);
    vi.spyOn(tooltip, "getBoundingClientRect").mockReturnValue({
      top: 50,
      bottom: 90,
      left: 100,
      right: 180,
      width: 80,
      height: 40,
      x: 100,
      y: 50,
      toJSON: () => ({}),
    } as DOMRect);

    fireEvent(window, new Event("resize"));
    await waitFor(() =>
      expect(tooltip).toHaveAttribute("data-placement", "top-end")
    );
    expect(
      tooltip.style.getPropertyValue("--ds-tooltip-arrow-anchor-offset")
    ).toBe("30px");
    expect(tooltip).toHaveAttribute("data-arrow-tracked", "true");
    expect(tooltip).toHaveAttribute("data-collision-adjusted", "true");
  });

  it("updates portal locale and theme scope after a live tenant switch", async () => {
    const { rerender } = render(
      <div
        dir="ltr"
        lang="en"
        data-ds-root=""
        data-tenant="bithire"
        data-theme="light"
        data-density="compact"
        style={{ "--ds-tooltip-bordered-radius": "6px" } as React.CSSProperties}
      >
        <ModernTooltip content="Decision context" visible>
          <button>Inspect</button>
        </ModernTooltip>
      </div>
    );

    const bitHireTooltip = screen.getByRole("tooltip");
    expect(bitHireTooltip).toHaveAttribute("dir", "ltr");
    expect(bitHireTooltip).toHaveAttribute("lang", "en");
    expect(bitHireTooltip).toHaveAttribute("data-tenant", "bithire");
    expect(bitHireTooltip).toHaveAttribute("data-density", "compact");
    expect(
      bitHireTooltip.style.getPropertyValue("--ds-tooltip-bordered-radius")
    ).toBe("6px");

    rerender(
      <div
        dir="rtl"
        lang="ar"
        data-ds-root=""
        data-tenant="themanagementmiami"
        data-theme="dark"
        data-density="spacious"
        style={{ "--ds-tooltip-bordered-radius": "20px" } as React.CSSProperties}
      >
        <ModernTooltip content="سياق القرار" visible>
          <button>افتح</button>
        </ModernTooltip>
      </div>
    );

    await waitFor(() => {
      const tooltip = screen.getByRole("tooltip");
      expect(tooltip).toHaveAttribute("dir", "rtl");
      expect(tooltip).toHaveAttribute("lang", "ar");
      expect(tooltip).toHaveAttribute("data-tenant", "themanagementmiami");
      expect(tooltip).toHaveAttribute("data-theme", "dark");
      expect(tooltip).toHaveAttribute("data-density", "spacious");
      expect(
        tooltip.style.getPropertyValue("--ds-tooltip-bordered-radius")
      ).toBe("20px");
    });
  });

  it("routes Escape to the top-most tooltip only", () => {
    const firstChange = vi.fn();
    const secondChange = vi.fn();
    render(
      <>
        <ModernTooltip
          content="First layer"
          defaultVisible
          trigger="click"
          onVisibleChange={firstChange}
        >
          <button>First</button>
        </ModernTooltip>
        <ModernTooltip
          content="Second layer"
          trigger="click"
          onVisibleChange={secondChange}
        >
          <button>Second</button>
        </ModernTooltip>
      </>
    );

    fireEvent.click(screen.getByRole("button", { name: "Second" }));
    expect(screen.getAllByRole("tooltip")).toHaveLength(2);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(secondChange).toHaveBeenCalledWith(false);
    expect(firstChange).not.toHaveBeenCalledWith(false);
  });

  it("restores focus after interactive Escape without reopening from focus", () => {
    render(
      <ModernTooltip
        content={<button>Surface action</button>}
        interactive
        defaultVisible
      >
        <button>Trigger</button>
      </ModernTooltip>
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.getByRole("button", { name: "Trigger" })).toHaveFocus();
    expect(screen.getByRole("dialog", { hidden: true })).toHaveAttribute(
      "data-open",
      "false"
    );
  });
});
