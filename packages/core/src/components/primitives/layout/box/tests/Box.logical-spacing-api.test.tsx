/**
 * The public layout API is logical (WO-FAM-07 step 4).
 *
 * `ps` / `pe` / `ms` / `me` are the inline-edge shorthands, and they follow the
 * reading direction the way `pl` / `pr` / `ml` / `mr` never could: a physical
 * edge lands on the wrong side of the box under RTL. The physical four are
 * formally deprecated rather than deleted, because the FROZEN Classic and
 * Rustic engines still read them by name and a family cut may not touch a
 * frozen engine. This suite pins both halves: the logical shorthands reach the
 * element on both the scalar and the responsive path, and the deprecated
 * physical props still behave exactly as they did.
 */
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import ModernBox from "../engines/modern";
import { responsiveCss } from "@tests/support/responsive";

describe("Box logical spacing API", () => {
  it("resolves ps/pe/ms/me onto the writing-mode-aware edges", () => {
    const { getByRole } = render(
      <ModernBox role="region" aria-label="Logical" ps="lg" pe="sm" ms="md" me="xs" />
    );

    const box = getByRole("region");
    expect(box.style.paddingInlineStart).toContain("--ds-spacing-6");
    expect(box.style.paddingInlineEnd).toContain("--ds-spacing-2");
    expect(box.style.marginInlineStart).toContain("--ds-spacing-4");
    expect(box.style.marginInlineEnd).toContain("--ds-spacing-1");
    // A shorthand is a prop, never an attribute: it must not reach the DOM.
    for (const shorthand of ["ps", "pe", "ms", "me"]) {
      expect(box).not.toHaveAttribute(shorthand);
    }
  });

  it("lets the long form win when both are given, like every other pair", () => {
    const { getByRole } = render(
      <ModernBox
        role="region"
        aria-label="Both"
        paddingInlineStart="xl"
        ps="xs"
        marginInlineEnd="lg"
        me="xs"
      />
    );

    const box = getByRole("region");
    expect(box.style.paddingInlineStart).toContain("--ds-spacing-8");
    expect(box.style.marginInlineEnd).toContain("--ds-spacing-6");
  });

  it("carries the logical shorthands through the responsive path", () => {
    const { container } = render(
      <ModernBox ps={{ xs: "sm", lg: "xl" }} me={{ xs: "xs", lg: "md" }} />
    );

    const css = responsiveCss(container);
    expect(css).toContain("padding-inline-start: var(--ds-spacing-2");
    expect(css).toContain("padding-inline-start: var(--ds-spacing-8");
    expect(css).toContain("margin-inline-end: var(--ds-spacing-1");
    expect(css).toContain("margin-inline-end: var(--ds-spacing-4");
  });

  it("leaves the deprecated physical props behaving exactly as before", () => {
    // Read from the SERVER serialization, not from `element.style`: happy-dom's
    // CSSOM silently drops a `var()` value assigned to `padding-left` while
    // accepting the same value on `padding-inline-start`, so the DOM read
    // reports an empty string for a declaration React really emitted. The
    // server renderer writes the style object out verbatim.
    const html = renderToStaticMarkup(
      <ModernBox pl="lg" pr="sm" ml="md" mr="xs" />
    );

    // Still physical, which is the whole reason they are deprecated: these
    // four do not move when the reading direction does.
    expect(html).toContain("padding-left:var(--ds-spacing-6");
    expect(html).toContain("padding-right:var(--ds-spacing-2");
    expect(html).toContain("margin-left:var(--ds-spacing-4");
    expect(html).toContain("margin-right:var(--ds-spacing-1");
    expect(html).not.toContain("padding-inline-start");
    expect(html).not.toContain("margin-inline-end");
  });
});
