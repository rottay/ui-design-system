/** Framing anatomy: every framing family must stamp the data-part hooks the rest
 *  of the cohort already exposes, or a blueprint overlay can never target it. */
import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { CropMarks, TextureBackdrop } from '../../../../src/components/primitives/display';
import { AsciiFrame, InvertSection } from '../../../../src/components/primitives/layout';
import { SectionFrame } from '../../../../src/components/structures/headers/section-frame';

afterEach(() => {
  cleanup();
});

describe("AsciiFrame anatomy", () => {
  it("stamps data-part on the root and each of its four decorative corners", () => {
    const { container } = render(
      <AsciiFrame variant="double" label="RT-001">
        real body copy
      </AsciiFrame>,
    );
    const root = container.querySelector('[data-part="root"]');
    // Anti-vacuity: the part-tagged root really is the frame, not an unrelated node.
    expect(root).not.toBeNull();
    expect(root).toHaveClass("rt-ascii-frame");
    expect(root).toHaveAttribute("data-variant", "double");

    for (const corner of ["corner-tl", "corner-tr", "corner-bl", "corner-br"]) {
      const el = container.querySelector(`[data-part="${corner}"]`);
      expect(el).not.toBeNull();
      expect(el).toHaveAttribute("aria-hidden", "true");
    }
    expect(container.querySelector('[data-part="label"]')).toHaveTextContent("RT-001");
    expect(container.querySelector('[data-part="body"]')).toHaveTextContent("real body copy");
  });

  it("omits data-part=label when no label is supplied", () => {
    const { container } = render(<AsciiFrame>only body</AsciiFrame>);
    expect(screen.getByText("only body")).toBeInTheDocument();
    expect(container.querySelector('[data-part="label"]')).toBeNull();
  });
});

describe("CropMarks anatomy", () => {
  it("stamps data-part on the root, all four ticks, and the body", () => {
    const { container } = render(<CropMarks>marked content</CropMarks>);
    const root = container.querySelector('[data-part="root"]');
    expect(root).not.toBeNull();
    expect(root).toHaveClass("rt-crop-marks");

    for (const tick of ["tick-tl", "tick-tr", "tick-bl", "tick-br"]) {
      const el = container.querySelector(`[data-part="${tick}"]`);
      expect(el).not.toBeNull();
      expect(el).toHaveAttribute("aria-hidden", "true");
    }
    expect(container.querySelector('[data-part="body"]')).toHaveTextContent("marked content");
  });
});

describe("InvertSection anatomy", () => {
  it("stamps data-part=root on the surface element itself", () => {
    const { container } = render(<InvertSection surface="paper">paper content</InvertSection>);
    const root = container.querySelector('[data-part="root"]');
    expect(root).not.toBeNull();
    expect(root).toHaveAttribute("data-surface", "paper");
    expect(root).toHaveTextContent("paper content");
  });
});

describe("SectionFrame anatomy", () => {
  it("stamps data-part on the root, label row, index, dash, title, meta, and body", () => {
    const { container } = render(
      <SectionFrame index={3} title="Section title" meta="4 items">
        section body
      </SectionFrame>,
    );
    const root = container.querySelector('[data-part="root"]');
    expect(root).not.toBeNull();
    expect(root).toHaveClass("rt-section-frame");
    expect(container.querySelector('[data-part="label-row"]')).not.toBeNull();

    const index = container.querySelector('[data-part="index"]');
    expect(index).toHaveTextContent("[03]");
    expect(index).toHaveAttribute("aria-hidden", "true");

    expect(container.querySelector('[data-part="dash"]')).toHaveAttribute("aria-hidden", "true");

    const title = container.querySelector('[data-part="title"]');
    expect(title).toHaveTextContent("Section title");
    expect(title).not.toHaveAttribute("aria-hidden");

    const meta = container.querySelector('[data-part="meta"]');
    expect(meta).toHaveTextContent("4 items");
    expect(meta).not.toHaveAttribute("aria-hidden");

    expect(container.querySelector('[data-part="body"]')).toHaveTextContent("section body");
  });
});

describe("TextureBackdrop anatomy", () => {
  it("stamps data-part on the root and the decorative layer", () => {
    const { container } = render(
      <TextureBackdrop pattern="graph">textured content</TextureBackdrop>,
    );
    const root = container.querySelector('[data-part="root"]');
    expect(root).not.toBeNull();
    expect(root).toHaveClass("rt-texture-backdrop");

    const layer = container.querySelector('[data-part="layer"]');
    expect(layer).not.toBeNull();
    expect(layer).toHaveAttribute("aria-hidden", "true");
    expect(layer).toHaveAttribute("data-pattern", "graph");

    expect(screen.getByText("textured content")).toBeInTheDocument();
  });
});
