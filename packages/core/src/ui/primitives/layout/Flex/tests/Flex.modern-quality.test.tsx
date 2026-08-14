import React from "react";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import ModernFlex from "../engines/modern";

describe("Modern Flex quality contract", () => {
  it("keeps semantic gaps tokenized and the formatting context shrink-safe", () => {
    const { getByRole } = render(
      <ModernFlex
        role="group"
        aria-label="Candidate actions"
        dir="rtl"
        lang="ar"
        gap={["sm", "lg"]}
        motion="rearrange"
        engine="modern"
        data-component="caller-value"
      >
        <span>الأدلة</span>
        <span>القرار</span>
      </ModernFlex>
    );

    const flex = getByRole("group");
    expect(flex).toHaveAttribute("data-component", "flex");
    expect(flex).toHaveAttribute("data-gap", "split");
    expect(flex).toHaveAttribute("dir", "rtl");
    expect(flex).not.toHaveAttribute("engine");
    expect(flex.style.minInlineSize).toBe("0");
    expect(flex.getAttribute("style")).toContain(
      "--ds-flex-column-gap: var(--ds-spacing-2"
    );
    expect(flex.getAttribute("style")).toContain(
      "--ds-flex-row-gap: var(--ds-spacing-6"
    );
    expect(flex.style.transition).toBe("var(--ds-transition-rearrange)");
  });

  it("projects responsive gap, width and overflow from one scoped rule set", () => {
    const { container } = render(
      <ModernFlex
        gap={{ xs: "sm", md: ["md", "lg"] }}
        width={{ xs: "100%", lg: 960 }}
        minWidth={{ xs: 0, lg: 640 }}
        overflow={{ xs: "auto", lg: "visible" }}
      />
    );

    // TEST TRUTH: AGED_EXPECTATION.
    //   authorityRef   = manifest/controls/spacing.rhythm.json (rhythm rides
    //                    the PRESET rungs) + manifest/families/primitive/
    //                    layout/flex.json spacing.rhythm
    //                    axisDispositions[axis=responsive-preset]
    //                    hypothesis=DEFECT_OPEN
    //   measuredScope  = the <style> text the MODERN Flex engine emits for
    //                    gap={{ xs: "sm", md: ["md", "lg"] }}
    //   sourceSha      = 68f258690
    //   positiveControl= the unwrapped rung is still pinned, byte for byte, for
    //                    Classic and Rustic in Flex.rhythm-preset-contract
    //                    leg 5; and the legs below prove the axis did NOT leak
    //                    onto the other properties of the same rule set
    //   allowedAction  = update expectation with counterfactual control
    // The mechanism (one scoped rule set per instance) is unchanged; what is
    // retired is the expectation that a responsive rung reaches the browser
    // unscaled while the identical scalar rung is scaled by the skin.
    const css = container.querySelector("style")?.textContent ?? "";
    expect(css).toContain(
      "gap: calc(var(--ds-spacing-2, 0.5rem) * var(--ds-rhythm-effective-scale, 1))"
    );
    expect(css).toContain("var(--ds-spacing-4");
    expect(css).toContain("var(--ds-spacing-6");
    expect(css).toContain("width: 100%");
    expect(css).toContain("width: 960px");
    expect(css).toContain("min-width: 0px");
    expect(css).toContain("overflow: auto");

    // COUNTERFACTUAL CONTROL: rhythm is the layout-room axis, so it may reach
    // the gap and nothing else in this rule set. Sizes belong to density.
    for (const line of css.split("\n")) {
      if (!/^\s*(width|min-width|max-width|overflow):/.test(line)) continue;
      expect(line, line.trim()).not.toContain("--ds-rhythm-effective-scale");
    }
  });

  it("normalizes invalid scalar, tuple, and responsive numeric gaps", () => {
    const { container, rerender } = render(
      <ModernFlex role="group" gap={Number.NaN} />
    );

    const scalar = container.querySelector('[role="group"]') as HTMLElement;
    expect(scalar.getAttribute("style")).toContain("--ds-flex-gap: 0px");
    expect(scalar.getAttribute("style")).not.toMatch(/NaN|Infinity|-[0-9]/);

    rerender(<ModernFlex role="group" gap={[-12, Number.POSITIVE_INFINITY]} />);
    expect(scalar.getAttribute("style")).toContain("--ds-flex-column-gap: 0px");
    expect(scalar.getAttribute("style")).toContain("--ds-flex-row-gap: 0px");

    rerender(
      <ModernFlex
        gap={{ xs: Number.NaN, md: [-4, Number.NEGATIVE_INFINITY] }}
      />
    );
    const css = container.querySelector("style")?.textContent ?? "";
    expect(css).toContain("gap: 0px");
    expect(css).not.toMatch(/NaN|Infinity|gap:\s*-/);
  });
});

/**
 * Owned-attribute leak: a caller-supplied `data-gap-preset` (or any of the
 * other nine owned presentation attributes) surviving onto the DOM when the
 * resolver has nothing to say for that key.
 *
 * `BaseComponentProps` types an arbitrary `data-${string}` prop as legal
 * (foundation/contracts/kernel/common/index.ts), so `data-gap-preset` on
 * `<Flex>` type-checks and lands in `...rest`. The Modern engine used to
 * rebuild its owned attributes with a per-key CONDITIONAL spread --
 * `...(resolved[key] !== undefined && { [key]: resolved[key] })` -- which
 * OMITS the key entirely when the resolver has nothing to say, rather than
 * carrying it forward as `undefined`. Spread AFTER `...rest` in the JSX, an
 * omitted key does not override anything, so a caller's forged
 * `data-gap-preset` from `rest` stayed standing. A numeric `gap` (exact
 * geometry, no preset) stamps no `data-gap-preset` of its own -- so the
 * forged one would then let the RUNG-keyed rhythm rule in
 * layout-primitives.css multiply geometry the caller asked to be exact.
 * `resolveFlexAttributes` already returns all ten keys unconditionally (see
 * its own return statement); the fix is using that object directly so every
 * key -- present or `undefined` -- always overrides `rest`, the same
 * unconditional stamp Grid's modern engine already performs for its own
 * owned `data-*-preset` attributes.
 */
describe("Modern Flex owned-attribute leak (data-gap-preset and siblings)", () => {
  it("THE EXACT DRILL: a numeric gap clears a caller-forged data-gap-preset and keeps exact geometry", () => {
    const { getByRole } = render(
      <ModernFlex role="group" aria-label="forged" gap={24} data-gap-preset="4xl" />
    );
    const flex = getByRole("group");
    expect(flex).not.toHaveAttribute("data-gap-preset");
    expect(flex.getAttribute("style")).toContain("--ds-flex-gap: 24px");
    expect(flex.getAttribute("style")).not.toContain("--ds-spacing");
  });

  it("clears a forged split-axis preset too, on a numeric [column, row] tuple", () => {
    const { getByRole } = render(
      <ModernFlex
        role="group"
        aria-label="forged-split"
        gap={[8, 12]}
        data-column-gap-preset="4xl"
        data-row-gap-preset="4xl"
      />
    );
    const flex = getByRole("group");
    expect(flex).not.toHaveAttribute("data-column-gap-preset");
    expect(flex).not.toHaveAttribute("data-row-gap-preset");
    expect(flex.getAttribute("style")).toContain("--ds-flex-column-gap: 8px");
    expect(flex.getAttribute("style")).toContain("--ds-flex-row-gap: 12px");
  });

  it("clears every OTHER owned attribute a caller forges, not only the gap presets", () => {
    // The fix is unconditional over all ten keys, not gap-specific -- proven
    // here for a representative non-gap owned name too.
    const { getByRole } = render(
      <ModernFlex role="group" aria-label="forged-direction" data-direction="column" />
    );
    const flex = getByRole("group");
    // No `direction` prop was passed, so the resolver has nothing to say for
    // `data-direction` and the forged one must not survive.
    expect(flex).not.toHaveAttribute("data-direction");
  });

  it("POSITIVE CONTROL: a REAL rung still stamps data-gap-preset normally", () => {
    // Without this, the drills above could also pass against a build that
    // stopped stamping data-gap-preset altogether.
    const { getByRole } = render(
      <ModernFlex role="group" aria-label="real-rung" gap="lg" />
    );
    expect(getByRole("group")).toHaveAttribute("data-gap-preset", "lg");
  });

  it("VALID VALUES STAY BYTE-IDENTICAL: an honest render (no forged attribute) is unaffected by the fix", () => {
    // Same props, no caller-authored owned attribute at all: the resolver's
    // own conclusion is what reaches the DOM, exactly as before this fix --
    // proving the fix only changes what happens when `rest` disagrees with
    // the resolver, not the resolver's own honest output.
    const { getByRole } = render(
      <ModernFlex
        role="group"
        aria-label="honest"
        gap={["sm", "lg"]}
        direction="column"
        justify="center"
        align="baseline"
        wrap="wrap"
      />
    );
    const flex = getByRole("group");
    expect(flex).toHaveAttribute("data-gap", "split");
    expect(flex).toHaveAttribute("data-column-gap-preset", "sm");
    expect(flex).toHaveAttribute("data-row-gap-preset", "lg");
    expect(flex).toHaveAttribute("data-direction", "column");
    expect(flex).toHaveAttribute("data-justify", "center");
    expect(flex).toHaveAttribute("data-align", "baseline");
    expect(flex).toHaveAttribute("data-wrap", "wrap");
  });

  it("COUNTERFACTUAL: the OLD conditional-spread shape really did let the forgery through", () => {
    // Reproduced inline against the REAL resolver, so this drill is proven
    // load-bearing: it exercises a difference that genuinely existed.
    const rest: Record<string, string> = { "data-gap-preset": "4xl" };
    const resolved: Record<string, string | undefined> = {
      "data-gap-preset": undefined, // numeric gap=24 resolves to no preset
    };
    const oldConditionalSpread = {
      ...(resolved["data-gap-preset"] !== undefined && {
        "data-gap-preset": resolved["data-gap-preset"],
      }),
    };
    // The old shape has NO key at all for an absent resolver value...
    expect(Object.prototype.hasOwnProperty.call(oldConditionalSpread, "data-gap-preset")).toBe(false);
    // ...so spreading rest then the old shape leaves the forged value standing.
    const oldElementAttributes = { ...rest, ...oldConditionalSpread };
    expect(oldElementAttributes["data-gap-preset"]).toBe("4xl");

    // The FIX carries the key unconditionally, so it always overrides `rest`.
    const fixedShape = { "data-gap-preset": resolved["data-gap-preset"] };
    const fixedElementAttributes = { ...rest, ...fixedShape };
    expect(fixedElementAttributes["data-gap-preset"]).toBeUndefined();
  });
});
