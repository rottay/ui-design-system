import React, { createRef } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import { createIcon, type DSIconProps, type DSIconSourceComponent } from "..";
import { createPhosphorCompatibilityIcon } from "../phosphor-compat";

const TestSource = React.forwardRef<SVGSVGElement, DSIconProps>(
  function TestSource(props, ref) {
    const { size, color, children, ...svgProps } = props;

    return (
      <svg ref={ref} width={size} height={size} stroke={color} {...svgProps}>
        {children}
      </svg>
    );
  }
);

const TestIcon = createIcon(
  TestSource as unknown as DSIconSourceComponent,
  "TestIcon"
);

type SupplierProbeProps = DSIconProps & {
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
};

function SupplierProbe(props: SupplierProbeProps): React.JSX.Element {
  const { size, color, weight, children, ...svgProps } = props;

  return (
    <svg
      width={size}
      height={size}
      fill={color}
      data-supplier-weight={weight}
      {...svgProps}
    >
      {children}
    </svg>
  );
}

const PhosphorTestIcon = createPhosphorCompatibilityIcon(
  SupplierProbe,
  "PhosphorTestIcon"
);

afterEach(cleanup);

describe("createIcon accessibility and rendering contract", () => {
  it("is decorative by default", () => {
    const { container } = render(<TestIcon />);
    const icon = container.querySelector("svg");

    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(icon).not.toHaveAttribute("aria-label");
    expect(icon).not.toHaveAttribute("role");
  });

  it("uses aria-label as an accessible image name", () => {
    render(<TestIcon aria-label="Candidate search" />);

    const icon = screen.getByRole("img", { name: "Candidate search" });
    expect(icon).not.toHaveAttribute("aria-hidden");
    expect(icon.querySelector("title")).toBeNull();
  });

  it("renders title and exposes it as the accessible image name", () => {
    render(<TestIcon title="Candidate status" />);

    const icon = screen.getByRole("img", { name: "Candidate status" });
    expect(icon).not.toHaveAttribute("aria-hidden");
    expect(icon).toHaveAttribute("aria-label", "Candidate status");
    expect(icon.querySelector("title")).toHaveTextContent("Candidate status");
  });

  it("keeps an explicit aria-label authoritative while retaining title content", () => {
    render(<TestIcon aria-label="Accessible name" title="Visual title" />);

    const icon = screen.getByRole("img", { name: "Accessible name" });
    expect(icon).toHaveAttribute("aria-label", "Accessible name");
    expect(icon.querySelector("title")).toHaveTextContent("Visual title");
  });

  it("resolves token and numeric sizes while preserving visual defaults and hooks", () => {
    const { container, rerender } = render(
      <TestIcon size="lg" className="consumer-icon" data-testid="icon" />
    );
    const icon = screen.getByTestId("icon");

    expect(icon).toHaveAttribute("width", "var(--ds-icon-lg-size, 24px)");
    expect(icon).toHaveAttribute("height", "var(--ds-icon-lg-size, 24px)");
    expect(icon).toHaveAttribute("stroke", "currentColor");
    expect(icon).toHaveAttribute(
      "stroke-width",
      "var(--ds-icon-stroke-width, 1.5)"
    );
    expect(icon).toHaveClass("rottay-icon", "consumer-icon");

    rerender(<TestIcon size={28} data-testid="icon" />);
    expect(container.querySelector("svg")).toHaveAttribute("width", "28");
    expect(container.querySelector("svg")).toHaveAttribute("height", "28");
  });

  it("forwards its ref to the rendered svg", () => {
    const ref = createRef<SVGSVGElement>();
    const { container } = render(<TestIcon ref={ref} />);

    expect(ref.current).toBe(container.querySelector("svg"));
  });

  it("preserves the accessible contract during SSR", () => {
    const markup = renderToStaticMarkup(
      <TestIcon size="sm" title="Server status" />
    );
    const container = document.createElement("div");
    container.innerHTML = markup;
    const icon = container.querySelector("svg");

    expect(icon).toHaveAttribute("width", "var(--ds-icon-sm-size, 16px)");
    expect(icon).toHaveAttribute("role", "img");
    expect(icon).toHaveAttribute("aria-label", "Server status");
    expect(icon).not.toHaveAttribute("aria-hidden");
    expect(icon?.querySelector("title")).toHaveTextContent("Server status");
  });
});

describe("Phosphor compatibility factory contract", () => {
  it("maps DS sizes and continuous stroke widths to pinned supplier weights", () => {
    const { rerender } = render(
      <PhosphorTestIcon
        size="lg"
        strokeWidth={0.75}
        className="consumer-icon"
        data-testid="icon"
      />
    );
    const icon = screen.getByTestId("icon");

    expect(icon).toHaveAttribute("width", "var(--ds-icon-lg-size, 24px)");
    expect(icon).toHaveAttribute("height", "var(--ds-icon-lg-size, 24px)");
    expect(icon).toHaveAttribute("fill", "currentColor");
    expect(icon).toHaveAttribute("data-supplier-weight", "thin");
    expect(icon).not.toHaveAttribute("stroke-width");
    expect(icon).toHaveClass("rottay-icon", "consumer-icon");

    rerender(<PhosphorTestIcon strokeWidth={1} data-testid="icon" />);
    expect(screen.getByTestId("icon")).toHaveAttribute(
      "data-supplier-weight",
      "light"
    );

    rerender(<PhosphorTestIcon strokeWidth={1.5} data-testid="icon" />);
    expect(screen.getByTestId("icon")).toHaveAttribute(
      "data-supplier-weight",
      "regular"
    );

    rerender(<PhosphorTestIcon strokeWidth={2} data-testid="icon" />);
    expect(screen.getByTestId("icon")).toHaveAttribute(
      "data-supplier-weight",
      "bold"
    );
  });

  it("retains the decorative and informative accessibility contract", () => {
    const { rerender } = render(<PhosphorTestIcon data-testid="icon" />);

    expect(screen.getByTestId("icon")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByTestId("icon")).not.toHaveAttribute("role");

    rerender(
      <PhosphorTestIcon
        title="Candidate status"
        aria-label="Accessible candidate status"
        data-testid="icon"
      />
    );

    const icon = screen.getByRole("img", {
      name: "Accessible candidate status",
    });
    expect(icon).not.toHaveAttribute("aria-hidden");
    expect(icon.querySelector("title")).toHaveTextContent("Candidate status");
  });
});
