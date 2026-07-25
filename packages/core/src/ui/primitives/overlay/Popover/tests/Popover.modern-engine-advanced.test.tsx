import React from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import ModernPopover from "../engines/modern";

describe("Popover modern engine advanced coverage", () => {
  afterEach(() => {
    vi.useRealTimers();
    // Geometry/locale probes patch browser globals. Restore them between
    // scenarios so an RTL computed-style fixture cannot leak into collision,
    // live-locale or nested accessibility coverage.
    vi.restoreAllMocks();
  });

  it("covers trigger arrays, placement classes, hover delays, focus, click, outside click, and overlay branches", async () => {
    vi.useFakeTimers();

    const onOpenChange = vi.fn();

    const { container, rerender } = render(
      <ModernPopover
        content="Popover body"
        title="Popover title"
        trigger={["hover", "focus", "click"]}
        placement="rightTop"
        mouseEnterDelay={25}
        mouseLeaveDelay={25}
        destroyTooltipOnHide
        onOpenChange={onOpenChange}
      >
        <button type="button">Open popover</button>
      </ModernPopover>
    );

    // Chrome moved into the modern skin: the trigger wrapper carries the scope
    // class and open state; placement rides data-placement on the surface part.
    const wrapper = container.querySelector(".rottay-popover--modern");
    expect(wrapper).not.toBeNull();
    expect(wrapper).toHaveAttribute("data-part", "trigger");
    expect(wrapper).toHaveAttribute("data-open", "false");

    fireEvent.pointerEnter(wrapper!, { pointerType: "mouse" });
    act(() => {
      vi.advanceTimersByTime(25);
    });
    expect(screen.getByText("Popover body")).toBeInTheDocument();
    expect(document.querySelector('[data-part="surface"]')).toHaveAttribute(
      "data-placement",
      "right-start"
    );

    fireEvent.pointerLeave(wrapper!, { pointerType: "mouse" });
    act(() => {
      vi.advanceTimersByTime(25);
    });
    expect(screen.getByRole("dialog", { hidden: true })).toHaveAttribute(
      "aria-hidden",
      "true"
    );
    act(() => {
      vi.advanceTimersByTime(240);
    });
    expect(screen.queryByText("Popover body")).not.toBeInTheDocument();

    fireEvent.focus(wrapper!);
    expect(screen.getByText("Popover title")).toBeInTheDocument();

    fireEvent.blur(wrapper!);
    expect(screen.getByRole("dialog", { hidden: true })).toHaveAttribute(
      "data-open",
      "false"
    );
    act(() => {
      vi.advanceTimersByTime(240);
    });
    expect(screen.queryByText("Popover title")).not.toBeInTheDocument();

    fireEvent.click(wrapper!);
    expect(screen.getByText("Popover body")).toBeInTheDocument();

    fireEvent.pointerDown(document.body);
    act(() => {
      vi.advanceTimersByTime(240);
    });
    expect(screen.queryByText("Popover body")).not.toBeInTheDocument();

    rerender(
      <ModernPopover
        content="Controlled body"
        title="Controlled title"
        open
        arrow={false}
        overlayClassName="qa-popover"
        overlayStyle={{ minWidth: "220px" }}
      >
        <button type="button">Open popover</button>
      </ModernPopover>
    );

    expect(screen.getByText("Controlled body")).toBeInTheDocument();
    expect(document.querySelector(".qa-popover")).not.toBeNull();
    expect(
      document.querySelector('.qa-popover [data-part="arrow"]')
    ).toBeNull();
    expect(onOpenChange).toHaveBeenCalled();
  });

  it("publishes popup semantics and removes competing native title chrome", () => {
    render(
      <ModernPopover
        open
        trigger="click"
        title="Decision context"
        content="Verified evidence"
      >
        <button type="button" title="Open context">
          Open
        </button>
      </ModernPopover>
    );

    const trigger = screen.getByRole("button", { name: "Open context" });
    const surface = screen.getByRole("dialog");
    expect(trigger).not.toHaveAttribute("title");
    expect(trigger).toHaveAttribute("aria-controls", surface.id);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    expect(surface).toHaveAttribute("aria-labelledby");
    expect(surface).toHaveAttribute("aria-modal", "false");
  });

  it("does not toggle when an interactive descendant inside the surface is clicked", () => {
    const onOpenChange = vi.fn();
    render(
      <ModernPopover
        open
        trigger="click"
        onOpenChange={onOpenChange}
        content={<button type="button">Run action</button>}
      >
        <button type="button">Open</button>
      </ModernPopover>
    );

    fireEvent.click(screen.getByRole("button", { name: "Run action" }));
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("preserves hidden surface state by default and deactivates it accessibly", () => {
    render(
      <ModernPopover
        defaultOpen
        trigger="click"
        content={<input aria-label="Draft note" defaultValue="Initial" />}
      >
        <button type="button">Toggle</button>
      </ModernPopover>
    );

    const input = screen.getByRole("textbox", { name: "Draft note" });
    fireEvent.change(input, { target: { value: "Preserved draft" } });
    fireEvent.pointerDown(document.body);
    const hiddenSurface = screen.getByRole("dialog", { hidden: true });
    fireEvent.animationEnd(hiddenSurface);

    expect(hiddenSurface).toHaveAttribute("aria-hidden", "true");
    expect(hiddenSurface).toHaveAttribute("inert");
    expect(input).toHaveValue("Preserved draft");

    fireEvent.click(screen.getByRole("button", { name: "Toggle" }));
    expect(screen.getByRole("textbox", { name: "Draft note" })).toHaveValue(
      "Preserved draft"
    );
  });

  it("makes a hover-only popover available to touch without stealing desktop hover", () => {
    render(
      <ModernPopover trigger="hover" content="Touch-accessible context">
        <button type="button">Context</button>
      </ModernPopover>
    );

    const trigger = screen.getByRole("button");
    fireEvent.pointerDown(trigger, { pointerType: "touch" });
    fireEvent.focus(trigger);
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.pointerUp(trigger, { pointerType: "touch" });
    expect(screen.getByRole("dialog")).toHaveTextContent(
      "Touch-accessible context"
    );

    fireEvent.pointerDown(document.body, { pointerType: "touch" });
    expect(screen.getByRole("dialog", { hidden: true })).toHaveAttribute(
      "data-open",
      "false"
    );
  });

  it("keeps hoverable content open while focus remains active", () => {
    vi.useFakeTimers();
    const { container } = render(
      <ModernPopover
        trigger="hover"
        mouseEnterDelay={20}
        mouseLeaveDelay={40}
        content={<button type="button">Surface action</button>}
      >
        <button type="button">Anchor</button>
      </ModernPopover>
    );

    const wrapper = container.querySelector('[data-part="trigger"]')!;
    const anchor = screen.getByRole("button", { name: "Anchor" });
    fireEvent.pointerEnter(wrapper, { pointerType: "mouse" });
    act(() => vi.advanceTimersByTime(20));
    const surface = screen.getByRole("dialog");
    fireEvent.pointerLeave(wrapper, { pointerType: "mouse" });
    fireEvent.pointerEnter(surface, { pointerType: "mouse" });
    act(() => vi.advanceTimersByTime(40));
    expect(surface).toHaveAttribute("data-open", "true");

    fireEvent.focus(anchor);
    fireEvent.pointerLeave(wrapper, { pointerType: "mouse" });
    act(() => vi.advanceTimersByTime(40));
    expect(screen.getByRole("dialog")).toHaveAttribute("data-open", "true");

    fireEvent.blur(anchor, { relatedTarget: document.body });
    expect(screen.getByRole("dialog", { hidden: true })).toHaveAttribute(
      "data-open",
      "false"
    );
  });

  it("closes on Escape and returns keyboard focus to the trigger", () => {
    const onOpenChange = vi.fn();
    render(
      <ModernPopover
        open
        trigger="click"
        onOpenChange={onOpenChange}
        content={<button type="button">Surface action</button>}
      >
        <button type="button">Trigger</button>
      </ModernPopover>
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole("button", { name: "Trigger" })).toHaveFocus();
  });

  it("carries RTL locale, recipe and viewport-safe instance measure", () => {
    vi.spyOn(window, "getComputedStyle").mockReturnValue({
      direction: "rtl",
    } as CSSStyleDeclaration);
    render(
      <div
        dir="rtl"
        lang="ar"
        data-tenant="the-management"
        data-theme="editorial"
        data-density="compact"
        style={{
          "--ds-popover-bordered-radius": "7px",
        } as React.CSSProperties}
      >
        <ModernPopover
          open
          recipe="rich"
          maxWidth={320}
          placement="bottomLeft"
          content="سياق قرار طويل قابل للالتفاف"
        >
          <button type="button">فتح</button>
        </ModernPopover>
      </div>
    );

    const surface = screen.getByRole("dialog");
    expect(surface).toHaveAttribute("dir", "rtl");
    expect(surface).toHaveAttribute("lang", "ar");
    expect(surface).toHaveAttribute("data-recipe", "rich");
    expect(surface).toHaveAttribute("data-density", "compact");
    expect(surface.closest('[data-tenant="the-management"]')).not.toBeNull();
    expect(surface.closest('[data-rottay-portal]')).not.toBeNull();
    expect(surface).toHaveAttribute("data-layer-kind", "popover");
    expect(
      surface
        .closest<HTMLElement>('[data-portal-scope="true"]')
        ?.style.getPropertyValue("--ds-popover-bordered-radius")
    ).toBe("7px");
    expect(
      surface.style.getPropertyValue("--ds-popover-instance-max-width")
    ).toBe("320px");
  });

  it("updates arrow placement after viewport collision flips the surface", async () => {
    render(
      <ModernPopover
        open
        placement="bottomLeft"
        content="Collision-aware context"
      >
        <button type="button">Anchor</button>
      </ModernPopover>
    );

    const surface = screen.getByRole("dialog");
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
    vi.spyOn(surface, "getBoundingClientRect").mockReturnValue({
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
      expect(surface).toHaveAttribute("data-placement", "top-start")
    );
    expect(
      surface.style.getPropertyValue("--ds-popover-arrow-anchor-offset")
    ).toBe("50px");
    expect(surface).toHaveAttribute("data-arrow-tracked", "true");
    expect(surface).toHaveAttribute("data-collision-adjusted", "true");
  });

  it("reacts when a white-labelled shell changes locale and direction live", async () => {
    const { rerender } = render(
      <div
        dir="ltr"
        lang="en"
        data-ds-root=""
        data-tenant="bithire"
        data-theme="light"
        data-density="compact"
        style={{ "--ds-popover-bordered-radius": "6px" } as React.CSSProperties}
      >
        <ModernPopover open content="Decision context">
          <button type="button">Open</button>
        </ModernPopover>
      </div>
    );

    const bitHireSurface = screen.getByRole("dialog");
    expect(bitHireSurface).toHaveAttribute("dir", "ltr");
    expect(bitHireSurface).toHaveAttribute("lang", "en");
    expect(bitHireSurface).toHaveAttribute("data-density", "compact");
    const bitHireScope = bitHireSurface.closest<HTMLElement>(
      '[data-portal-scope="true"]'
    );
    expect(bitHireScope).toHaveAttribute("data-tenant", "bithire");
    expect(
      bitHireScope?.style.getPropertyValue("--ds-popover-bordered-radius")
    ).toBe("6px");
    rerender(
      <div
        dir="rtl"
        lang="ar"
        data-ds-root=""
        data-tenant="the-management"
        data-theme="editorial"
        data-density="spacious"
        style={{ "--ds-popover-bordered-radius": "20px" } as React.CSSProperties}
      >
        <ModernPopover open content="سياق القرار">
          <button type="button">فتح</button>
        </ModernPopover>
      </div>
    );

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toHaveAttribute("dir", "rtl");
      expect(screen.getByRole("dialog")).toHaveAttribute("lang", "ar");
      expect(screen.getByRole("dialog")).toHaveAttribute(
        "data-density",
        "spacious"
      );
      const portalScope = screen
        .getByRole("dialog")
        .closest<HTMLElement>('[data-portal-scope="true"]');
      expect(portalScope).toHaveAttribute("data-tenant", "the-management");
      expect(
        portalScope?.style.getPropertyValue("--ds-popover-bordered-radius")
      ).toBe("20px");
    });
  });

  it("dismisses only the top nested popover on Escape", () => {
    const outerChange = vi.fn();
    const innerChange = vi.fn();
    render(
      <ModernPopover
        defaultOpen
        trigger="click"
        onOpenChange={outerChange}
        content={
          <ModernPopover
            trigger="click"
            onOpenChange={innerChange}
            content="Nested evidence"
          >
            <button type="button">Open nested</button>
          </ModernPopover>
        }
      >
        <button type="button">Open outer</button>
      </ModernPopover>
    );

    fireEvent.click(screen.getByRole("button", { name: "Open nested" }));
    expect(screen.getAllByRole("dialog")).toHaveLength(2);
    fireEvent.keyDown(document, { key: "Escape" });

    expect(innerChange).toHaveBeenCalledWith(false);
    expect(outerChange).not.toHaveBeenCalledWith(false);
    expect(
      screen
        .getAllByRole("dialog", { hidden: true })
        .filter((surface) => surface.getAttribute("aria-hidden") === "false")
    ).toHaveLength(1);
  });
});
