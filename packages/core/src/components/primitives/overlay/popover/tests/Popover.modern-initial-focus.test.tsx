/**
 * Deliberate initial focus on an activation-driven open: the first control of
 * the panel receives it, including when the panel's content resolves after the
 * surface is already on screen (engine-switched primitives suspend on first
 * use). Read-only content keeps focus on the surface, and a focus the user has
 * already moved is never taken back.
 */
import React, { Suspense, lazy } from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { EngineProvider } from "@/infrastructure/runtime/engines/composition/react/provider";
import { Button } from "@/components/primitives/inputs/button";
import { Stack } from "@/components/primitives/layout/stack";
import { Popover } from "..";
import ModernPopover from "../engines/modern";

type Deferred = {
  Content: React.LazyExoticComponent<React.ComponentType>;
  resolve: (component: React.ComponentType) => Promise<void>;
};

/** Content whose module resolves on demand, as an engine implementation does. */
function deferredContent(): Deferred {
  let release: (module: { default: React.ComponentType }) => void = () => {};
  const pending = new Promise<{ default: React.ComponentType }>((resolve) => {
    release = resolve;
  });
  return {
    Content: lazy(() => pending),
    resolve: async (component) => {
      await act(async () => {
        release({ default: component });
        await pending;
      });
    },
  };
}

function PanelControls() {
  return (
    <div>
      <button type="button">First control</button>
      <button type="button">Second control</button>
    </div>
  );
}

function renderDeferred(Content: Deferred["Content"]) {
  return render(
    <div>
      <ModernPopover
        trigger="click"
        title="Settings"
        content={
          <Suspense fallback={null}>
            <Content />
          </Suspense>
        }
      >
        <button type="button">Open settings</button>
      </ModernPopover>
      <button type="button">Elsewhere</button>
    </div>
  );
}

const surface = () => screen.getByRole("dialog", { name: "Settings" });

describe("Popover modern engine -- initial focus on an activation-driven open", () => {
  it("moves a keyboard open to the first control of engine-switched content", async () => {
    const user = userEvent.setup();
    render(
      <EngineProvider defaultEngine="modern">
        <Popover
          trigger="click"
          title="Settings"
          content={
            <Stack>
              <Button>First control</Button>
              <Button>Second control</Button>
            </Stack>
          }
        >
          <button type="button">Open settings</button>
        </Popover>
      </EngineProvider>
    );

    const trigger = await screen.findByRole("button", { name: "Open settings" });
    await user.tab();
    expect(document.activeElement).toBe(trigger);
    await user.keyboard("{Enter}");

    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "First control" })
      )
    );
  });

  it("hands a keyboard open from the parked surface to the first control once late content mounts", async () => {
    const user = userEvent.setup();
    const { Content, resolve } = deferredContent();
    renderDeferred(Content);

    await user.tab();
    await user.keyboard("{Enter}");

    await waitFor(() => expect(document.activeElement).toBe(surface()));
    expect(screen.queryByRole("button", { name: "First control" })).toBeNull();

    await resolve(PanelControls);

    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "First control" })
      )
    );
    expect(surface().hasAttribute("data-state")).toBe(false);
  });

  it("hands a pointer open to the first control once late content mounts", async () => {
    const user = userEvent.setup();
    const { Content, resolve } = deferredContent();
    renderDeferred(Content);

    await user.click(screen.getByRole("button", { name: "Open settings" }));
    await waitFor(() => expect(document.activeElement).toBe(surface()));

    await resolve(PanelControls);

    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "First control" })
      )
    );
  });

  it("reaches a late menu item that is outside the tab order", async () => {
    const user = userEvent.setup();
    const { Content, resolve } = deferredContent();
    renderDeferred(Content);

    await user.tab();
    await user.keyboard("{Enter}");
    await waitFor(() => expect(document.activeElement).toBe(surface()));

    await resolve(() => (
      <div role="menu">
        <div role="menuitem" tabIndex={-1}>
          First item
        </div>
      </div>
    ));

    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("menuitem", { name: "First item" })
      )
    );
  });

  it("keeps focus on the surface when the content that mounts is read-only", async () => {
    const user = userEvent.setup();
    const { Content, resolve } = deferredContent();
    renderDeferred(Content);

    await user.tab();
    await user.keyboard("{Enter}");
    await waitFor(() => expect(document.activeElement).toBe(surface()));

    await resolve(() => <p>Read-only details</p>);
    await screen.findByText("Read-only details");
    await act(
      () => new Promise<void>((done) => requestAnimationFrame(() => done()))
    );

    expect(document.activeElement).toBe(surface());
  });

  it("never takes back a focus the user moved before the content mounted", async () => {
    const user = userEvent.setup();
    const { Content, resolve } = deferredContent();
    renderDeferred(Content);

    await user.tab();
    await user.keyboard("{Enter}");
    await waitFor(() => expect(document.activeElement).toBe(surface()));

    const elsewhere = screen.getByRole("button", { name: "Elsewhere" });
    act(() => elsewhere.focus());

    await resolve(PanelControls);
    await screen.findByRole("button", { name: "First control" });
    await act(
      () => new Promise<void>((done) => requestAnimationFrame(() => done()))
    );

    expect(document.activeElement).toBe(elsewhere);
  });

  it("stops waiting once focus has left the surface, even when it comes back", async () => {
    const user = userEvent.setup();
    const { Content, resolve } = deferredContent();
    renderDeferred(Content);

    await user.tab();
    await user.keyboard("{Enter}");
    await waitFor(() => expect(document.activeElement).toBe(surface()));

    act(() => screen.getByRole("button", { name: "Elsewhere" }).focus());
    act(() => surface().focus());

    await resolve(PanelControls);
    await screen.findByRole("button", { name: "First control" });
    await act(
      () => new Promise<void>((done) => requestAnimationFrame(() => done()))
    );

    expect(document.activeElement).toBe(surface());
  });

  it("leaves a control that mounts after the hand-off window where it is", async () => {
    const user = userEvent.setup();
    const { Content, resolve } = deferredContent();
    renderDeferred(Content);

    await user.tab();
    await user.keyboard("{Enter}");
    await waitFor(() => expect(document.activeElement).toBe(surface()));

    await act(() => new Promise<void>((done) => setTimeout(done, 1100)));
    await resolve(PanelControls);
    await screen.findByRole("button", { name: "First control" });
    await act(
      () => new Promise<void>((done) => requestAnimationFrame(() => done()))
    );

    expect(document.activeElement).toBe(surface());
  });

  it("does not move focus into late content after Escape closed the surface", async () => {
    const user = userEvent.setup();
    const { Content, resolve } = deferredContent();
    renderDeferred(Content);

    const trigger = screen.getByRole("button", { name: "Open settings" });
    await user.tab();
    await user.keyboard("{Enter}");
    await waitFor(() => expect(document.activeElement).toBe(surface()));

    await user.keyboard("{Escape}");
    await waitFor(() => expect(document.activeElement).toBe(trigger));

    await resolve(PanelControls);
    await act(
      () => new Promise<void>((done) => requestAnimationFrame(() => done()))
    );

    expect(document.activeElement).toBe(trigger);
  });
});

describe("Popover modern engine -- initial focus on a re-open that outruns the unmount", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("focuses the first control when the trigger is pressed in the commit that unmounts the closed surface", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const nextFrame = () =>
      act(() => new Promise<void>((done) => requestAnimationFrame(() => done())));
    render(
      <ModernPopover
        trigger="click"
        title="Settings"
        destroyTooltipOnHide
        content={<button type="button">First control</button>}
      >
        <button type="button">Open settings</button>
      </ModernPopover>
    );
    const trigger = screen.getByRole("button", { name: "Open settings" });

    fireEvent.click(trigger);
    await nextFrame();
    const closedSurface = surface();
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "First control" })
    );

    fireEvent.keyDown(document.activeElement as HTMLElement, { key: "Escape" });
    expect(document.activeElement).toBe(trigger);

    // One batch: the exit fallback unmounts the surface and the press re-opens
    // it, so the open commits while the engine still holds the removed element.
    act(() => {
      vi.advanceTimersByTime(1000);
      trigger.click();
    });
    await nextFrame();

    expect(closedSurface.isConnected).toBe(false);
    expect(surface()).not.toBe(closedSurface);
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "First control" })
    );
  });
});
