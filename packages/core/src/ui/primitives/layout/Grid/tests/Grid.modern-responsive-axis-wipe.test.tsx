import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ModernGrid from "../engines/modern";

describe("ModernGrid non-responsive axis survives a responsive sibling axis", () => {
  it("keeps the static column template when only rows are responsive", () => {
    const { container } = render(
      <ModernGrid columns={3} rows={{ xs: 1, lg: 2 }}>
        Content
      </ModernGrid>
    );

    const grid = container.querySelector<HTMLElement>(
      '[data-component="grid"]'
    );

    expect(grid?.style.gridTemplateColumns).toBe(
      "repeat(3, minmax(0, 1fr))"
    );
  });

  it("keeps the minColumnWidth auto-fit track when only rows are responsive", () => {
    const { container } = render(
      <ModernGrid minColumnWidth={240} rows={{ xs: 1, lg: 2 }}>
        Content
      </ModernGrid>
    );

    const grid = container.querySelector<HTMLElement>(
      '[data-component="grid"]'
    );

    expect(grid?.style.gridTemplateColumns).toBe(
      "repeat(auto-fit, minmax(min(100%, 240px), 1fr))"
    );
  });

  it("keeps the static row template when only columns are responsive", () => {
    const { container } = render(
      <ModernGrid columns={{ xs: 1, md: 3 }} rows={2}>
        Content
      </ModernGrid>
    );

    const grid = container.querySelector<HTMLElement>(
      '[data-component="grid"]'
    );

    expect(grid?.style.gridTemplateRows).toBe("repeat(2, minmax(0, 1fr))");
  });

  it("still clears the inline template on the axis the media rules own", () => {
    const { container } = render(
      <ModernGrid columns={{ xs: 1, md: 3 }}>Content</ModernGrid>
    );

    const grid = container.querySelector<HTMLElement>(
      '[data-component="grid"]'
    );

    expect(grid?.style.gridTemplateColumns).toBe("");
  });
});
