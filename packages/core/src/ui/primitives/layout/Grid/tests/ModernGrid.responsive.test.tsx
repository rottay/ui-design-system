import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ModernGrid from "../engines/modern";

describe("ModernGrid responsive templates", () => {
  it("injects responsive CSS instead of relying on dead data attributes", () => {
    const { container } = render(
      <ModernGrid columns={{ xs: 1, md: 3 }} rows={{ xs: 1, lg: 2 }}>
        Content
      </ModernGrid>
    );

    const grid = container.querySelector('[data-component="grid"]');
    const styleTag = container.querySelector("style");

    expect(grid).toHaveAttribute("data-grid-id");
    expect(styleTag?.textContent).toContain(
      "grid-template-columns: repeat(1, minmax(0, 1fr));"
    );
    expect(styleTag?.textContent).toContain("@media (min-width: 768px)");
    expect(styleTag?.textContent).toContain(
      "grid-template-columns: repeat(3, minmax(0, 1fr));"
    );
    expect(styleTag?.textContent).toContain("@media (min-width: 1024px)");
    expect(styleTag?.textContent).toContain(
      "grid-template-rows: repeat(2, minmax(0, 1fr));"
    );
  });
});
