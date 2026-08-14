import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import { Flex } from "../engines/modern";

function root(container: HTMLElement): HTMLElement {
  return container.querySelector('[data-component="flex"]') as HTMLElement;
}

describe("Flex modern probe", () => {
  /**
   * RECLASSIFIED: AGED_EXPECTATION.
   *
   * authorityRef   WO-CRA-23 LOTE 6B -- "estampar/limpiar atributos owned
   *                incondicionalmente despues de ...rest, como Grid".
   * measuredScope  Flex/engines/modern, the single owned-attribute stamp site.
   * sourceSha      68f258690f39100c91f981735b51bfb47dc16f09 + checkpoint WIP.
   * positiveControl the two tests immediately below -- a genuinely unowned
   *                consumer attribute still passes through, and a real `align`
   *                prop still stamps the channel.
   * allowedAction  update expectation with counterfactual control.
   *
   * This test used to assert that a caller-supplied `data-align` SURVIVES.
   * That is the leak, not the contract. `data-align` is not a free-form
   * consumer attribute: it is a member of `FlexPresentationAttributes`, and
   * `layout-primitives.css` keys geometry off the owned `data-*` namespace, so
   * a caller who hand-stamps one re-scales a layout the props never asked for.
   * It is the same defect class as `<Flex gap={24} data-gap-preset="4xl" />`
   * re-scaling exact geometry -- only the attribute differs.
   *
   * Grid already resolved this the mandated way: it writes every owned
   * attribute AFTER `...htmlAttributes`, passing `undefined` for the absent
   * ones so React clears them, and says so in its own comment ("a caller
   * cannot hand-stamp a preset onto exact geometry either"). Flex now matches.
   * So the expectation inverts: an owned attribute forged through rest is
   * CLEARED.
   */
  it("clears a consumer-forged data-align, because data-align is owned", () => {
    const { container } = render(
      <Flex direction="row" data-align="center" />
    );
    expect(root(container).getAttribute("data-align")).toBeNull();
  });

  it("COUNTERFACTUAL: an unowned consumer attribute still passes through", () => {
    // Guards the correction above from overshooting into a blanket attribute
    // filter. Only the OWNED namespace is reclaimed; everything else is still
    // the consumer's to set.
    const { container } = render(
      <Flex direction="row" data-testid="probe" data-analytics-id="hero-row" />
    );
    expect(root(container).getAttribute("data-testid")).toBe("probe");
    expect(root(container).getAttribute("data-analytics-id")).toBe("hero-row");
  });

  it("POSITIVE CONTROL: a real align prop still stamps data-align", () => {
    // Proves the channel is reclaimed, not disabled -- otherwise clearing it
    // would pass vacuously.
    const { container } = render(<Flex align="center" />);
    expect(root(container).getAttribute("data-align")).toBe("center");
  });

  it("gap={0} stamps a zero channel", () => {
    const { container } = render(<Flex gap={0} />);
    expect(root(container).style.getPropertyValue("--ds-flex-gap")).toBe("0px");
  });

  it("consumer minWidth beats the modern min-inline-size floor", () => {
    const { container } = render(<Flex minWidth={200} />);
    expect(root(container).style.minWidth).toBe("200px");
  });

  it("forwards the ref", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Flex ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("responsive direction emits a scoped rule and the id attr", () => {
    const { container } = render(<Flex direction={{ xs: "column", md: "row" }} />);
    expect(root(container).getAttribute("data-responsive-id")).toBeTruthy();
    expect(container.querySelector("style")?.innerHTML).toContain("flex-direction: row");
  });

  it("inline reaches the DOM", () => {
    const { container } = render(<Flex inline />);
    expect(root(container).getAttribute("data-inline")).toBe("true");
  });
});
