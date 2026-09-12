/**
 * Box responsive prop tests.
 * Tests that Box engines correctly handle ResponsiveValue objects
 * for padding, margin, display, width, minWidth, and maxWidth.
 */

import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ClassicBox from "../engines/classic";
import { SPACING_MAP } from "../contracts";
import { responsiveChannelElement, responsiveCss } from '@tests/support/responsive';

describe("ClassicBox responsive props", () => {
  describe("backward compatibility", () => {
    it("renders plain scalar padding as inline style", () => {
      const { container } = render(<ClassicBox p="md">Content</ClassicBox>);
      const box = container.querySelector(".rottay-box--classic");
      expect(box).toBeInTheDocument();
      expect(box).toHaveStyle({ padding: SPACING_MAP.md });
      // No style tag should be injected
      expect(responsiveCss(container)).toBe('');
    });

    it("renders plain scalar display as inline style", () => {
      const { container } = render(
        <ClassicBox display="flex">Content</ClassicBox>
      );
      const box = container.querySelector(".rottay-box--classic");
      expect(box).toHaveStyle({ display: "flex" });
      expect(responsiveCss(container)).toBe('');
    });

    it("renders plain scalar width as inline style", () => {
      const { container } = render(
        <ClassicBox width="200px">Content</ClassicBox>
      );
      const box = container.querySelector(".rottay-box--classic");
      expect(box).toHaveStyle({ width: "200px" });
      expect(responsiveCss(container)).toBe('');
    });
  });

  describe("responsive padding", () => {
    it("generates CSS media queries for responsive padding", () => {
      const { container } = render(
        <ClassicBox p={{ xs: "sm", lg: "xl" }}>Content</ClassicBox>
      );
      const styleTag = responsiveCss(container);
      const box = responsiveChannelElement(container);

      expect(styleTag).not.toBe('');
      expect(box).toBeInTheDocument();
      expect(styleTag).toContain(`padding: ${SPACING_MAP.sm};`);
      expect(styleTag).toContain("@media (min-width: 1024px)");
      expect(styleTag).toContain(`padding: ${SPACING_MAP.xl};`);
    });

    it("generates CSS for responsive px (horizontal padding)", () => {
      const { container } = render(
        <ClassicBox px={{ base: "xs", md: "lg" }}>Content</ClassicBox>
      );
      const styleTag = responsiveCss(container);
      expect(styleTag).toContain(
        `padding-left: ${SPACING_MAP.xs};`
      );
      expect(styleTag).toContain(
        `padding-right: ${SPACING_MAP.xs};`
      );
      expect(styleTag).toContain("@media (min-width: 768px)");
      expect(styleTag).toContain(
        `padding-left: ${SPACING_MAP.lg};`
      );
    });
  });

  describe("responsive margin", () => {
    it("generates CSS media queries for responsive margin", () => {
      const { container } = render(
        <ClassicBox m={{ xs: "sm", xl: "2xl" }}>Content</ClassicBox>
      );
      const styleTag = responsiveCss(container);
      expect(styleTag).toContain(`margin: ${SPACING_MAP.sm};`);
      expect(styleTag).toContain("@media (min-width: 1280px)");
      expect(styleTag).toContain(`margin: ${SPACING_MAP["2xl"]};`);
    });

    it("generates CSS for responsive mx (horizontal margin)", () => {
      const { container } = render(
        <ClassicBox mx={{ phone: "xs", desktop: "lg" }}>Content</ClassicBox>
      );
      const styleTag = responsiveCss(container);
      expect(styleTag).toContain(
        `margin-left: ${SPACING_MAP.xs};`
      );
      expect(styleTag).toContain(
        `margin-right: ${SPACING_MAP.xs};`
      );
      expect(styleTag).toContain("@media (min-width: 1024px)");
    });
  });

  describe("responsive display", () => {
    it("generates CSS for responsive display", () => {
      const { container } = render(
        <ClassicBox display={{ xs: "none", md: "block", lg: "flex" }}>
          Content
        </ClassicBox>
      );
      const styleTag = responsiveCss(container);
      expect(styleTag).toContain("display: none;");
      expect(styleTag).toContain("@media (min-width: 768px)");
      expect(styleTag).toContain("display: block;");
      expect(styleTag).toContain("@media (min-width: 1024px)");
      expect(styleTag).toContain("display: flex;");
    });
  });

  describe("responsive width", () => {
    it("generates CSS for responsive width", () => {
      const { container } = render(
        <ClassicBox width={{ xs: "100%", md: "50%", lg: "33%" }}>
          Content
        </ClassicBox>
      );
      const styleTag = responsiveCss(container);
      expect(styleTag).toContain("width: 100%;");
      expect(styleTag).toContain("@media (min-width: 768px)");
      expect(styleTag).toContain("width: 50%;");
      expect(styleTag).toContain("width: 33%;");
    });
  });

  describe("responsive maxWidth", () => {
    it("generates CSS for responsive maxWidth", () => {
      const { container } = render(
        <ClassicBox maxWidth={{ xs: "100%", lg: "960px" }}>Content</ClassicBox>
      );
      const styleTag = responsiveCss(container);
      expect(styleTag).toContain("max-width: 100%;");
      expect(styleTag).toContain("@media (min-width: 1024px)");
      expect(styleTag).toContain("max-width: 960px;");
    });
  });

  describe("alias resolution", () => {
    it("resolves phone -> xs, tablet -> sm, desktop -> lg", () => {
      const { container } = render(
        <ClassicBox p={{ phone: "xs", tablet: "md", desktop: "xl" }}>
          Content
        </ClassicBox>
      );
      const styleTag = responsiveCss(container);
      // phone -> xs (no media query)
      expect(styleTag).toContain(`padding: ${SPACING_MAP.xs};`);
      // tablet -> sm (640px)
      expect(styleTag).toContain("@media (min-width: 640px)");
      expect(styleTag).toContain(`padding: ${SPACING_MAP.md};`);
      // desktop -> lg (1024px)
      expect(styleTag).toContain("@media (min-width: 1024px)");
      expect(styleTag).toContain(`padding: ${SPACING_MAP.xl};`);
    });
  });
});
