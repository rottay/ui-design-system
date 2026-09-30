import React from "react";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import ModernDivider from "../engines/modern";

// A composite (Stack's interleaved divider) hands the divider its own part: the
// caller's part must land, and the owned `data-component` must stay for the skin.
describe("Divider (modern) caller-owned data-part", () => {
  it("keeps the default root part when the caller passes none", () => {
    const { container } = render(<ModernDivider />);
    const root = container.firstElementChild!;
    expect(root).toHaveAttribute("data-part", "root");
    expect(root).toHaveAttribute("data-component", "divider");
  });

  it("lets a caller part win on the plain line and on the labelled divider", () => {
    for (const ui of [<ModernDivider key="line" data-part="divider" />, <ModernDivider key="text" data-part="divider">Label</ModernDivider>]) {
      const { container, unmount } = render(ui);
      const root = container.firstElementChild!;
      expect(root).toHaveAttribute("data-part", "divider");
      expect(root).toHaveAttribute("data-component", "divider");
      unmount();
    }
  });

  it("keeps the owned data-component even when a caller passes another", () => {
    const { container } = render(<ModernDivider {...({ "data-component": "other" } as object)} />);
    expect(container.firstElementChild).toHaveAttribute("data-component", "divider");
  });
});
