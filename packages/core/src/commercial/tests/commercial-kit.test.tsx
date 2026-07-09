/**
 * Commercial kit contract tests (WO-SHW-01 acceptance gate).
 *
 * Verifies the three laws the whole kit must uphold: every component renders; decorative
 * ASCII is `aria-hidden` with a real text alternative (ASCII is never the sole information
 * carrier); and reveals collapse to instant-and-visible under `prefers-reduced-motion`.
 */
import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  AsciiFrame,
  SectionFrame,
  Typewriter,
  TerminalBlock,
  TreeView,
  CropMarks,
  InvertSection,
  TextureBackdrop,
  MonoStat,
  AsciiDiagram,
  ProductWindow,
} from "../../commercial";

/** Force a reduced-motion preference so reveals must render their final state instantly. */
function mockReducedMotion(reduce: boolean): void {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes("prefers-reduced-motion") ? reduce : false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

beforeEach(() => {
  mockReducedMotion(true);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("commercial kit — every component renders", () => {
  it("renders all 11 components without throwing", () => {
    const { container } = render(
      <div>
        <AsciiFrame label="frame">framed content</AsciiFrame>
        <SectionFrame index={1} title="Section title">
          section body
        </SectionFrame>
        <Typewriter text="typed headline" />
        <TerminalBlock lines={[{ prompt: true, text: "pnpm build" }, { text: "done" }]} />
        <TreeView data={{ label: "root", children: [{ label: "leaf" }] }} />
        <CropMarks>marked</CropMarks>
        <InvertSection surface="ink">inverted</InvertSection>
        <TextureBackdrop pattern="dots">textured</TextureBackdrop>
        <MonoStat value={601} label="use cases" />
        <AsciiDiagram
          nodes={[
            { id: "a", label: "PLATFORM", col: 0, row: 0 },
            { id: "b", label: "BITHIRE", col: 1, row: 0 },
          ]}
          edges={[{ from: "a", to: "b" }]}
          description="Platform connects to BitHire"
        />
        <ProductWindow label="Dashboard — live view">
          <div>product</div>
        </ProductWindow>
      </div>,
    );
    expect(container).toBeTruthy();
    // Real (non-ASCII) content from each component is present in the DOM.
    expect(screen.getByText("framed content")).toBeInTheDocument();
    expect(screen.getByText("Section title")).toBeInTheDocument();
    expect(screen.getByText("root")).toBeInTheDocument();
    expect(screen.getByText("inverted")).toBeInTheDocument();
  });
});

describe("commercial kit — ASCII is never the sole information carrier", () => {
  it("AsciiFrame corners are aria-hidden and the content is real", () => {
    const { container } = render(<AsciiFrame>real body</AsciiFrame>);
    const corners = container.querySelectorAll('[aria-hidden="true"]');
    expect(corners.length).toBeGreaterThanOrEqual(4); // four decorative box-drawing corners
    expect(screen.getByText("real body")).toBeInTheDocument();
  });

  it("AsciiDiagram exposes its description and hides the pre grid from AT", () => {
    const { container } = render(
      <AsciiDiagram
        nodes={[{ id: "a", label: "ONE", col: 0, row: 0 }]}
        edges={[]}
        description="A single node labelled ONE"
      />,
    );
    // The required description is present as real text for screenreaders.
    expect(screen.getByText("A single node labelled ONE")).toBeInTheDocument();
    // The ASCII grid itself is aria-hidden (decorative).
    const pre = container.querySelector("pre");
    expect(pre).not.toBeNull();
    expect(pre?.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("commercial kit — reveals collapse under reduced motion", () => {
  it("MonoStat shows its final formatted value instantly under reduced motion", () => {
    render(<MonoStat value={601} label="use cases" />);
    // The final value is present with no count-up animation to wait on.
    expect(screen.getAllByText(/601/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("use cases")).toBeInTheDocument();
  });

  it("Typewriter renders its full text (the accessible alternative) under reduced motion", () => {
    render(<Typewriter text="typed headline" />);
    expect(screen.getAllByText("typed headline").length).toBeGreaterThanOrEqual(1);
  });
});
