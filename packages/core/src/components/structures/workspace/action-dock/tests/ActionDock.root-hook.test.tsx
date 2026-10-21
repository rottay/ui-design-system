/**
 * ActionDock own-root hook on every posture.
 *
 * The carrier skin arms the dock root through `.ds-action-dock__root`, a class
 * twin of `[data-part='root']`. A twin only paints when the element that stamps
 * `data-part="root"` also carries the hook, so this file mounts the real
 * component in each of the five postures the skin and its readers name and
 * reads the hook off the rendered root. Skin reachability proves that some
 * root matches each selector; it cannot prove that EVERY posture's own root
 * carries the hook, which is what this file pins.
 *
 * The viewport contexts mirror `ActionDock.skin-reachability.test.tsx`: a
 * resolved desktop and a phone with the virtual keyboard open. Each dock gets
 * a distinct caller class so the assertion also proves the hook sits beside
 * the caller's own class on the same element.
 */

import React from "react";

import { describe, expect, it } from "vitest";

import { ActionDock } from "..";
import {
  ResponsiveContext,
  type ResponsiveContextValue,
} from "../../../../../infrastructure/runtime/responsive";
import { renderWithEngine } from "@tests/support/engine";

/** The owner block class every dock root stamps. */
const BLOCK_CLASS = "ds-action-dock";

/** The carrier hook under test: the root's class twin of `[data-part='root']`. */
const ROOT_HOOK = "ds-action-dock__root";

/** A resolved desktop viewport with the virtual keyboard closed. */
const DESKTOP: ResponsiveContextValue = {
  hasResolvedViewport: true,
  deviceClass: "desktop",
  activeBreakpoint: "lg",
  isPhone: false,
  isTablet: false,
  isDesktop: true,
  pointer: "fine",
  orientation: "landscape",
  prefersReducedMotion: false,
  isPhoneOrTablet: false,
  isTabletOrDesktop: true,
  isTouchDevice: false,
  virtualKeyboardInset: 0,
  isVirtualKeyboardOpen: false,
};

/** A phone viewport whose virtual keyboard is open, the only keyboard-open posture. */
const PHONE_KEYBOARD_OPEN: ResponsiveContextValue = {
  ...DESKTOP,
  deviceClass: "phone",
  activeBreakpoint: "xs",
  isPhone: true,
  isDesktop: false,
  isTabletOrDesktop: false,
  isPhoneOrTablet: true,
  isTouchDevice: true,
  pointer: "coarse",
  virtualKeyboardInset: 260,
  isVirtualKeyboardOpen: true,
};

/**
 * One rendered posture and the root attributes it must expose.
 *
 * `placement`, `mode` and `keyboardOpen` are the values the component is
 * expected to stamp, not props: the bottom/fixed default passes neither
 * `position` nor `mode`, so it proves the defaults rather than echoing input.
 */
interface Posture {
  /** `data-testid` given to the dock; the root carries it. */
  testId: string;
  /** Caller className unique to this dock. */
  callerClass: string;
  /** Expected `data-placement` on the root. */
  placement: "bottom" | "top";
  /** Expected `data-mode` on the root. */
  mode: "fixed" | "sticky";
  /** Expected `data-keyboard-open` on the root. */
  keyboardOpen: "true" | "false";
}

/** The five postures, in the order they are rendered below. */
const POSTURES: readonly Posture[] = [
  {
    testId: "dock-bottom-fixed",
    callerClass: "caller-bottom-fixed",
    placement: "bottom",
    mode: "fixed",
    keyboardOpen: "false",
  },
  {
    testId: "dock-bottom-sticky",
    callerClass: "caller-bottom-sticky",
    placement: "bottom",
    mode: "sticky",
    keyboardOpen: "false",
  },
  {
    testId: "dock-top-fixed",
    callerClass: "caller-top-fixed",
    placement: "top",
    mode: "fixed",
    keyboardOpen: "false",
  },
  {
    testId: "dock-top-sticky",
    callerClass: "caller-top-sticky",
    placement: "top",
    mode: "sticky",
    keyboardOpen: "false",
  },
  {
    testId: "dock-keyboard",
    callerClass: "caller-keyboard",
    placement: "bottom",
    mode: "fixed",
    keyboardOpen: "true",
  },
];

/**
 * Mounts the five postures under the modern engine and waits for every root.
 *
 * @returns The rendered root element of each posture, keyed by test id.
 */
async function renderEveryPosture(): Promise<Map<string, HTMLElement>> {
  const rendered = renderWithEngine(
    <>
      <ResponsiveContext.Provider value={DESKTOP}>
        {/* Defaults only: no position and no mode, so bottom/fixed must come from the component. */}
        <ActionDock
          data-testid="dock-bottom-fixed"
          className="caller-bottom-fixed"
          actions={[{ key: "a", label: "A" }]}
        />
        <ActionDock
          data-testid="dock-bottom-sticky"
          className="caller-bottom-sticky"
          mode="sticky"
          actions={[{ key: "b", label: "B" }]}
        />
        <ActionDock
          data-testid="dock-top-fixed"
          className="caller-top-fixed"
          position="top"
          actions={[{ key: "c", label: "C" }]}
        />
        <ActionDock
          data-testid="dock-top-sticky"
          className="caller-top-sticky"
          position="top"
          mode="sticky"
          actions={[{ key: "d", label: "D" }]}
        />
      </ResponsiveContext.Provider>
      <ResponsiveContext.Provider value={PHONE_KEYBOARD_OPEN}>
        <ActionDock
          data-testid="dock-keyboard"
          className="caller-keyboard"
          actions={[{ key: "e", label: "E" }]}
        />
      </ResponsiveContext.Provider>
    </>,
    "modern"
  );
  // The engine component resolves asynchronously, so each root is awaited
  // rather than queried synchronously against a possibly empty container.
  const roots = new Map<string, HTMLElement>();
  for (const posture of POSTURES)
    roots.set(posture.testId, await rendered.findByTestId(posture.testId));
  return roots;
}

describe("ActionDock own-root hook", () => {
  it("stamps ds-action-dock__root on the data-part root of all five postures, and only there", async () => {
    const roots = await renderEveryPosture();

    for (const posture of POSTURES) {
      const root = roots.get(posture.testId);
      expect(root, posture.testId).toBeDefined();
      if (!root) continue;
      // The hook must sit on the element that stamps the root part, beside
      // the block class and the caller's own class.
      expect(root).toHaveAttribute("data-part", "root");
      expect(root).toHaveClass(BLOCK_CLASS, ROOT_HOOK, posture.callerClass);
      // The posture is read off the rendered root, so the five checks above
      // cover five distinct real states, not one state five times.
      expect(root).toHaveAttribute("data-placement", posture.placement);
      expect(root).toHaveAttribute("data-mode", posture.mode);
      expect(root).toHaveAttribute("data-keyboard-open", posture.keyboardOpen);
      // No descendant may supply the hook in the root's place.
      expect(
        root.querySelectorAll(`.${ROOT_HOOK}`),
        posture.testId
      ).toHaveLength(0);
      // The caller class is applied once, on this root.
      expect(
        document.querySelectorAll(`.${posture.callerClass}`),
        posture.callerClass
      ).toHaveLength(1);
    }

    // Exactly the five roots carry the hook: no other element in the render does.
    const hooked = Array.from(
      document.querySelectorAll<HTMLElement>(`.${ROOT_HOOK}`)
    );
    expect(hooked).toHaveLength(POSTURES.length);
    // Identity, not structural equality: each hooked node IS one of the five roots.
    const rootElements = Array.from(roots.values());
    expect(hooked.every((element) => rootElements.includes(element))).toBe(
      true
    );
    expect(
      hooked.map((element) => element.getAttribute("data-testid")).sort()
    ).toEqual(POSTURES.map((posture) => posture.testId).sort());
  });
});
