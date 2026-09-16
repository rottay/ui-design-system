import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import { Container } from "../engines/modern";

function root(container: HTMLElement): HTMLElement {
  return container.querySelector('[data-component="container"]') as HTMLElement;
}

describe("Container modern probe", () => {
  it("padding={0} stamps a zero inset on the family channel", () => {
    const { container } = render(<Container padding={0} />);
    expect(root(container).style.getPropertyValue("--ds-container-pad")).toBe("0px");
    expect(root(container).getAttribute("data-padding")).toBe("custom");
  });

  it("maxWidth={0} is honoured", () => {
    const { container } = render(<Container maxWidth={0} />);
    expect(root(container).style.getPropertyValue("--ds-container-measure")).toBe("0px");
    expect(root(container).getAttribute("data-max-width")).toBe("custom");
  });

  it("a named rung travels as the stamp alone, never as an inline value", () => {
    const { container } = render(<Container maxWidth="xl" padding="sm" />);
    const node = root(container);
    expect(node.getAttribute("data-max-width")).toBe("xl");
    expect(node.getAttribute("data-padding")).toBe("sm");
    expect(node.style.getPropertyValue("--ds-container-measure")).toBe("");
    expect(node.style.getPropertyValue("--ds-container-pad")).toBe("");
  });

  it("an unusable number falls back to the declared rung", () => {
    const { container } = render(<Container maxWidth={Number.NaN} padding={-4} />);
    const node = root(container);
    expect(node.getAttribute("data-max-width")).toBe("lg");
    expect(node.getAttribute("data-padding")).toBe("md");
    expect(node.style.getPropertyValue("--ds-container-measure")).toBe("");
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
    expect(root(container).className).toContain("ds-container--modern");
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
