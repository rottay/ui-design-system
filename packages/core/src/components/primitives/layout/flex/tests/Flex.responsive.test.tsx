/**
 * Flex responsive prop tests.
 * Tests that Flex engines correctly handle ResponsiveValue objects
 * for direction, gap, wrap, justify, and align.
 */

import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Flex as RusticFlex } from "../engines/rustic";
import { Flex as ClassicFlex } from "../engines/classic";
import { Flex as ModernFlex } from "../engines/modern";

describe("RusticFlex responsive props", () => {
  describe("backward compatibility", () => {
    it("renders plain scalar direction as a declarative attribute", () => {
      const { container } = render(
        <RusticFlex direction="column">Content</RusticFlex>
      );
      const flex = container.firstChild as HTMLElement;
      expect(flex).toHaveAttribute("data-direction", "column");
      expect(flex.getAttribute("style") ?? "").not.toContain("flex-direction");
      expect(container.querySelector("style")).toBeNull();
    });

    it("renders plain scalar gap as a bounded CSS parameter", () => {
      const { container } = render(<RusticFlex gap={16}>Content</RusticFlex>);
      const flex = container.querySelector("div") as HTMLElement;
      expect(flex).toHaveAttribute("data-gap", "uniform");
      expect(flex.getAttribute("style")).toContain("--ds-flex-gap: 16px");
      expect(flex.getAttribute("style") ?? "").not.toMatch(/(?:^|;)\s*gap:/);
      expect(container.querySelector("style")).toBeNull();
    });

    it("keeps omitted defaults out of the inline style contract", () => {
      const { container } = render(<RusticFlex>Content</RusticFlex>);
      const flex = container.querySelector(".rottay-flex--rustic");
      expect(flex).not.toHaveAttribute("style");
      expect(flex).not.toHaveAttribute("data-direction");
    });
  });

  describe("responsive direction", () => {
    it("generates CSS media queries for responsive direction", () => {
      const { container } = render(
        <RusticFlex direction={{ xs: "column", lg: "row" }}>Content</RusticFlex>
      );
      const styleTag = container.querySelector("style");
      const flex = container.querySelector("[data-responsive-id]");

      expect(styleTag).not.toBeNull();
      expect(flex).toBeInTheDocument();
      expect(styleTag?.textContent).toContain("flex-direction: column;");
      expect(styleTag?.textContent).toContain("@media (min-width: 1024px)");
      expect(styleTag?.textContent).toContain("flex-direction: row;");
    });
  });

  describe("responsive gap", () => {
    it("generates CSS for responsive gap", () => {
      const { container } = render(
        <RusticFlex gap={{ xs: 8, md: 16, xl: 32 }}>Content</RusticFlex>
      );
      const styleTag = container.querySelector("style");
      expect(styleTag?.textContent).toContain("gap: 8px;");
      expect(styleTag?.textContent).toContain("@media (min-width: 768px)");
      expect(styleTag?.textContent).toContain("gap: 16px;");
      expect(styleTag?.textContent).toContain("@media (min-width: 1280px)");
      expect(styleTag?.textContent).toContain("gap: 32px;");
    });
  });

  describe("responsive wrap", () => {
    it("generates CSS for responsive wrap", () => {
      const { container } = render(
        <RusticFlex wrap={{ xs: "nowrap", md: "wrap" }}>Content</RusticFlex>
      );
      const styleTag = container.querySelector("style");
      expect(styleTag?.textContent).toContain("flex-wrap: nowrap;");
      expect(styleTag?.textContent).toContain("@media (min-width: 768px)");
      expect(styleTag?.textContent).toContain("flex-wrap: wrap;");
    });
  });

  describe("responsive justify", () => {
    it("generates CSS for responsive justify", () => {
      const { container } = render(
        <RusticFlex justify={{ xs: "start", lg: "between" }}>
          Content
        </RusticFlex>
      );
      const styleTag = container.querySelector("style");
      expect(styleTag?.textContent).toContain("justify-content: flex-start;");
      expect(styleTag?.textContent).toContain("@media (min-width: 1024px)");
      expect(styleTag?.textContent).toContain(
        "justify-content: space-between;"
      );
    });
  });

  describe("responsive align", () => {
    it("generates CSS for responsive align", () => {
      const { container } = render(
        <RusticFlex align={{ xs: "stretch", md: "center" }}>Content</RusticFlex>
      );
      const styleTag = container.querySelector("style");
      expect(styleTag?.textContent).toContain("align-items: stretch;");
      expect(styleTag?.textContent).toContain("@media (min-width: 768px)");
      expect(styleTag?.textContent).toContain("align-items: center;");
    });
  });

  describe("alias resolution", () => {
    it("resolves phone, tablet, desktop aliases", () => {
      const { container } = render(
        <RusticFlex direction={{ phone: "column", tablet: "row" }}>
          Content
        </RusticFlex>
      );
      const styleTag = container.querySelector("style");
      // phone -> xs (no media query)
      expect(styleTag?.textContent).toContain("flex-direction: column;");
      // tablet -> sm (640px)
      expect(styleTag?.textContent).toContain("@media (min-width: 640px)");
      expect(styleTag?.textContent).toContain("flex-direction: row;");
    });
  });
});

// ---------------------------------------------------------------------------
// Classic Engine
// ---------------------------------------------------------------------------

describe("ClassicFlex responsive props", () => {
  describe("backward compatibility", () => {
    it("renders plain scalar direction without a style tag", () => {
      const { container } = render(
        <ClassicFlex direction="column">Content</ClassicFlex>
      );
      expect(container.querySelector(".rottay-flex--classic")).toHaveAttribute(
        "data-direction",
        "column"
      );
      expect(container.querySelector("style")).toBeNull();
    });

    it("renders plain scalar gap without a style tag", () => {
      const { container } = render(<ClassicFlex gap={16}>Content</ClassicFlex>);
      const flex = container.querySelector(".rottay-flex--classic");
      expect(flex).toHaveAttribute("data-gap", "uniform");
      expect(flex?.getAttribute("style")).toContain("--ds-flex-gap: 16px");
      expect(container.querySelector("style")).toBeNull();
    });
  });

  describe("responsive direction", () => {
    it("generates CSS media queries for responsive direction", () => {
      const { container } = render(
        <ClassicFlex direction={{ xs: "column", lg: "row" }}>
          Content
        </ClassicFlex>
      );
      const styleTag = container.querySelector("style");
      const flex = container.querySelector("[data-responsive-id]");

      expect(styleTag).not.toBeNull();
      expect(flex).toBeInTheDocument();
      expect(styleTag?.textContent).toContain("flex-direction: column;");
      expect(styleTag?.textContent).toContain("@media (min-width: 1024px)");
      expect(styleTag?.textContent).toContain("flex-direction: row;");
    });
  });

  describe("responsive gap", () => {
    it("generates CSS for responsive gap", () => {
      const { container } = render(
        <ClassicFlex gap={{ xs: 8, md: 16, xl: 32 }}>Content</ClassicFlex>
      );
      const styleTag = container.querySelector("style");
      expect(styleTag?.textContent).toContain("gap: 8px;");
      expect(styleTag?.textContent).toContain("@media (min-width: 768px)");
      expect(styleTag?.textContent).toContain("gap: 16px;");
      expect(styleTag?.textContent).toContain("@media (min-width: 1280px)");
      expect(styleTag?.textContent).toContain("gap: 32px;");
    });
  });

  describe("alias resolution", () => {
    it("resolves phone, tablet, desktop aliases", () => {
      const { container } = render(
        <ClassicFlex direction={{ phone: "column", desktop: "row" }}>
          Content
        </ClassicFlex>
      );
      const styleTag = container.querySelector("style");
      expect(styleTag?.textContent).toContain("flex-direction: column;");
      // desktop -> lg (1024px)
      expect(styleTag?.textContent).toContain("@media (min-width: 1024px)");
      expect(styleTag?.textContent).toContain("flex-direction: row;");
    });
  });
});

// ---------------------------------------------------------------------------
// Modern Engine
// ---------------------------------------------------------------------------

describe("ModernFlex responsive props", () => {
  describe("backward compatibility", () => {
    it("renders plain scalar direction as a declarative attribute without a style tag", () => {
      const { container } = render(
        <ModernFlex direction="column">Content</ModernFlex>
      );
      const flex = container.firstChild as HTMLElement;
      expect(flex).toHaveAttribute("data-direction", "column");
      expect(flex.getAttribute("style") ?? "").not.toContain("flex-direction");
      expect(container.querySelector("style")).toBeNull();
    });

    it("renders plain scalar gap as a bounded CSS parameter without a style tag", () => {
      const { container } = render(<ModernFlex gap={16}>Content</ModernFlex>);
      const flex = container.querySelector("div") as HTMLElement;
      expect(flex).toHaveAttribute("data-gap", "uniform");
      expect(flex.getAttribute("style")).toContain("--ds-flex-gap: 16px");
      expect(flex.getAttribute("style") ?? "").not.toMatch(/(?:^|;)\s*gap:/);
      expect(container.querySelector("style")).toBeNull();
    });
  });

  describe("responsive direction", () => {
    it("generates CSS media queries for responsive direction", () => {
      const { container } = render(
        <ModernFlex direction={{ xs: "column", lg: "row" }}>Content</ModernFlex>
      );
      const styleTag = container.querySelector("style");
      const flex = container.querySelector("[data-responsive-id]");

      expect(styleTag).not.toBeNull();
      expect(flex).toBeInTheDocument();
      expect(styleTag?.textContent).toContain("flex-direction: column;");
      expect(styleTag?.textContent).toContain("@media (min-width: 1024px)");
      expect(styleTag?.textContent).toContain("flex-direction: row;");
    });
  });

  describe("responsive gap", () => {
    it("generates CSS for responsive gap", () => {
      const { container } = render(
        <ModernFlex gap={{ xs: 8, md: 16, xl: 32 }}>Content</ModernFlex>
      );
      const styleTag = container.querySelector("style");
      expect(styleTag?.textContent).toContain("gap: 8px;");
      expect(styleTag?.textContent).toContain("@media (min-width: 768px)");
      expect(styleTag?.textContent).toContain("gap: 16px;");
      expect(styleTag?.textContent).toContain("@media (min-width: 1280px)");
      expect(styleTag?.textContent).toContain("gap: 32px;");
    });
  });

  describe("alias resolution", () => {
    it("resolves phone, tablet, desktop aliases", () => {
      const { container } = render(
        <ModernFlex direction={{ phone: "column", tablet: "row" }}>
          Content
        </ModernFlex>
      );
      const styleTag = container.querySelector("style");
      expect(styleTag?.textContent).toContain("flex-direction: column;");
      // tablet -> sm (640px)
      expect(styleTag?.textContent).toContain("@media (min-width: 640px)");
      expect(styleTag?.textContent).toContain("flex-direction: row;");
    });
  });
});
