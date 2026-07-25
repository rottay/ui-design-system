import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ClassicGrid } from "../engines/classic";

describe("ClassicGrid responsive templates", () => {
  it("injects responsive CSS using the shared breakpoint scale", () => {
    const { container } = render(
      <ClassicGrid columns={{ xs: 1, lg: 4 }} rows={{ xs: 1, xl: 2 }}>
        Content
      </ClassicGrid>
    );

    const grid = container.querySelector('[data-component="grid"]');
    const styleTag = container.querySelector("style");

    expect(grid).toHaveAttribute("data-grid-id");
    expect(styleTag?.textContent).toContain(
      "grid-template-columns: repeat(1, 1fr);"
    );
    expect(styleTag?.textContent).toContain("@media (min-width: 1024px)");
    expect(styleTag?.textContent).toContain(
      "grid-template-columns: repeat(4, 1fr);"
    );
    expect(styleTag?.textContent).toContain("@media (min-width: 1280px)");
    expect(styleTag?.textContent).toContain(
      "grid-template-rows: repeat(2, 1fr);"
    );
  });
});
