import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import { Container } from "../engines/modern";

function root(container: HTMLElement): HTMLElement {
  return container.querySelector('[data-component="container"]') as HTMLElement;
}

describe("Container modern probe", () => {
  it("padding={0} stamps a zero channel", () => {
    const { container } = render(<Container padding={0} />);
    expect(
      root(container).style.getPropertyValue("--ds-container-instance-padding")
    ).toBe("0px");
  });

  it("maxWidth={0} is honoured", () => {
    const { container } = render(<Container maxWidth={0} />);
    expect(
      root(container).style.getPropertyValue("--ds-container-instance-max-width")
    ).toBe("0px");
  });

  it("center={false} drops the centered flag", () => {
    const { container } = render(<Container center={false} />);
    expect(root(container).hasAttribute("data-centered")).toBe(false);
  });

  it("forwards the ref", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Container ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("consumer className survives", () => {
    const { container } = render(<Container className="mine" />);
    expect(root(container).className).toContain("rottay-container--modern");
    expect(root(container).className).toContain("mine");
  });

  it("does not leak the engine prop as a DOM attribute", () => {
    const { container } = render(<Container engine="modern" />);
    expect(root(container).hasAttribute("engine")).toBe(false);
  });

  it("fluid keeps the caller padding", () => {
    const { container } = render(<Container fluid padding="lg" />);
    expect(root(container).getAttribute("data-padding")).toBe("lg");
  });
});
