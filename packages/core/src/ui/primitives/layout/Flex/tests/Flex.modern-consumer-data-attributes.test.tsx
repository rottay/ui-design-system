import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import { Flex } from "../engines/modern";

function root(container: HTMLElement): HTMLElement {
  return container.querySelector('[data-component="flex"]') as HTMLElement;
}

describe("Flex modern probe", () => {
  it("keeps a consumer data-align passed through rest", () => {
    const { container } = render(
      <Flex direction="row" data-align="center" />
    );
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
