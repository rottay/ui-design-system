import React, { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Container as ModernContainer } from "../engines/modern";

describe("Container modern premium contract", () => {
  it("forwards landmark, locale, direction, and ref while protecting its anatomy", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <ModernContainer
        ref={ref}
        role="main"
        lang="ar"
        dir="rtl"
        aria-label="المحتوى الرئيسي"
        data-part="consumer-value"
      >
        المحتوى
      </ModernContainer>
    );

    const container = screen.getByRole("main");
    expect(container).toHaveAttribute("lang", "ar");
    expect(container).toHaveAttribute("dir", "rtl");
    expect(container).toHaveAttribute("data-part", "root");
    expect(ref.current).toBe(container);
  });

  it("keeps one anatomy for every tenant token value", () => {
    const { container } = render(
      <>
        <section style={{ "--ds-container-radius": "0px" } as React.CSSProperties}>
          <ModernContainer>Shared anatomy</ModernContainer>
        </section>
        <section style={{ "--ds-container-radius": "24px" } as React.CSSProperties}>
          <ModernContainer>Shared anatomy</ModernContainer>
        </section>
      </>
    );

    const [first, second] = Array.from(container.querySelectorAll("section"));
    expect(first?.firstElementChild?.outerHTML).toBe(second?.firstElementChild?.outerHTML);
  });

  it("stamps the measure and inset decision and carries no value of its own", () => {
    render(<ModernContainer data-testid="container">Content</ModernContainer>);

    const container = screen.getByTestId("container");
    expect(container).toHaveAttribute("data-component", "container");
    expect(container).toHaveAttribute("data-max-width", "lg");
    expect(container).toHaveAttribute("data-padding", "md");
    expect(container.getAttribute("style")).toBeNull();
  });
});
