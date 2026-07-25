import React, { createRef } from "react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Container as ModernContainer } from "../engines/modern";

const layoutSkin = readFileSync(
  resolve(
    process.cwd(),
    "src/foundation/tokens/css/presentation/components/skin/layout-primitives.css"
  ),
  "utf8"
);

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

  it("contains narrow descendants and handles invalid numeric inputs deterministically", () => {
    render(
      <ModernContainer
        maxWidth={Number.NaN}
        padding={-4}
        data-testid="container"
      >
        candidate-with-a-long-unbroken-identifier@example.enterprise
      </ModernContainer>
    );

    const container = screen.getByTestId("container");
    expect(container).toHaveAttribute("data-component", "container");
    expect(layoutSkin).toContain("min-inline-size: 0");
    expect(container.getAttribute("style")).toContain("--ds-container-lg");
    expect(container.getAttribute("style")).toContain("--ds-spacing-4");
  });

  it("keeps identical component markup under different tenant token values", () => {
    const { container } = render(
      <>
        <section
          style={{ "--ds-container-radius": "0px" } as React.CSSProperties}
        >
          <ModernContainer>Shared anatomy</ModernContainer>
        </section>
        <section
          style={{ "--ds-container-radius": "24px" } as React.CSSProperties}
        >
          <ModernContainer>Shared anatomy</ModernContainer>
        </section>
      </>
    );

    const [first, second] = Array.from(container.querySelectorAll("section"));
    expect(first?.firstElementChild?.outerHTML).toBe(
      second?.firstElementChild?.outerHTML
    );
  });

  it("exposes tokenized visual channels and reduced-motion behavior", () => {
    render(<ModernContainer data-testid="container">Content</ModernContainer>);

    const container = screen.getByTestId("container");
    const inlineStyle = container.getAttribute("style") ?? "";
    expect(inlineStyle).toContain("--ds-container-instance-max-width");
    expect(inlineStyle).toContain("--ds-container-instance-padding");
    expect(layoutSkin).toContain("--ds-container-background");
    expect(layoutSkin).toContain("--ds-container-border");
    expect(layoutSkin).toContain("--ds-container-radius");
    expect(layoutSkin).toContain("--ds-container-shadow");
    expect(layoutSkin).toContain("prefers-reduced-motion: reduce");
  });
});
