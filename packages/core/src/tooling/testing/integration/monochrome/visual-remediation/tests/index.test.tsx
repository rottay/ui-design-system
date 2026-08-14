/** This environment does not apply an imported component stylesheet, so a computed-style
 *  assertion alone would pass vacuously; CSS claims read the stylesheet SOURCE instead. */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TerminalBlock } from '../../../../../../ui/patterns/feedback/terminal-block';
import {
  AsciiDiagram,
  type DiagramEdge,
  type DiagramNode,
} from '../../../../../../ui/patterns/visualization/ascii-diagram';
import { AsciiFrame, InvertSection } from '../../../../../../ui/primitives/layout';
import { SectionFrame } from '../../../../../../ui/structures/headers/section-frame';

let originalMatchMedia: typeof window.matchMedia;

beforeEach(() => {
  originalMatchMedia = window.matchMedia;
});

afterEach(() => {
  cleanup();
  window.matchMedia = originalMatchMedia;
  vi.restoreAllMocks();
});

// ---- CSS source text, read once per file: the reliable source of truth in this environment ----

/* These stylesheets are no longer co-located beside their components: the cohort was
   reclassified into the four canonical tiers and its CSS now ships as ordinary DS skins from
   the one skin folder, wired through the token entrypoints like every other skin. */
const SOURCE_ROOT = join(__dirname, "../../../../../..");
const SKIN_DIR = join(SOURCE_ROOT, "foundation/tokens/css/presentation/components/skin");

function skinCss(file: string): string {
  return readFileSync(join(SKIN_DIR, file), "utf8");
}

const RAMP_CSS = readFileSync(
  join(SOURCE_ROOT, "foundation/tokens/css/foundation/monochrome/index.css"),
  "utf8",
);
const ASCII_DIAGRAM_CSS = skinCss("ascii-diagram.css");
/* Read as TEXT, not imported: the assertion is about what the module is ALLOWED to depend on
   (no viewport branch), which a value import cannot express. */
const ASCII_DIAGRAM_SOURCE = readFileSync(
  join(SOURCE_ROOT, "ui/patterns/visualization/ascii-diagram/index.tsx"),
  "utf8",
);
const ASCII_FRAME_CSS = skinCss("ascii-frame.css");
const INVERT_SECTION_CSS = skinCss("invert-section.css");
const SECTION_FRAME_CSS = skinCss("section-frame.css");
const TERMINAL_BLOCK_CSS = skinCss("terminal-block.css");
const TREE_VIEW_CSS = skinCss("tree-view-connector.css");

/** Resolves through the ramp stylesheet, following aliases, so the contrast math below cannot
 *  drift from the source of truth the way a hand-copied hex table would. Takes a FULL channel
 *  name because the ramp's steps and its semantic anchors no longer share one prefix. */
function rampHex(channel: string): string {
  const literal = RAMP_CSS.match(new RegExp(`${channel}:\\s*(#[0-9a-fA-F]{6})`));
  if (literal) return literal[1]!;
  const alias = RAMP_CSS.match(new RegExp(`${channel}:\\s*var\\((--ds-[a-z0-9-]+)\\)`));
  if (alias) return rampHex(alias[1]!);
  throw new Error(`ramp token ${channel} not found (or not resolvable) in foundation/monochrome/index.css`);
}

const INK = rampHex("--ds-color-surface-ink");
const PAPER = rampHex("--ds-color-surface-paper");

/** Any reference that resolves INTO the ramp: a numeric step, a semantic anchor, or the
 *  surface pair the same rule seats from one. Written as a source fragment because several
 *  assertions below have to splice a role name in front of it. */
const RAMP_REF = "var\\(--ds-(?:color-mono-|color-surface-|color-hairline|surface-(?:fg|bg))";

/** Pure WCAG 2.1 math with no DOM, so this evidence never depends on how faithfully a given
 *  test environment resolves var() or the cascade. */
function relativeLuminance(hex: string): number {
  const int = Number.parseInt(hex.slice(1), 16);
  const channels = [(int >> 16) & 255, (int >> 8) & 255, int & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
}

function contrastRatio(a: string, b: string): number {
  const [l1, l2] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (l1! + 0.05) / (l2! + 0.05);
}

function hexToRgbTuple(hex: string): [number, number, number] {
  const int = Number.parseInt(hex.slice(1), 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

/** Both notations are handled because this CSSOM serializes a resolved var() chain back out as
 *  authored rather than normalizing to one canonical form. */
function parseRgb(value: string): [number, number, number] | null {
  const hexMatch = value.match(/^#([0-9a-fA-F]{6})$/);
  if (hexMatch) return hexToRgbTuple(`#${hexMatch[1]}`);
  const rgbMatch = value.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbMatch) return [Number(rgbMatch[1]), Number(rgbMatch[2]), Number(rgbMatch[3])];
  return null;
}

/* Derived, not enumerated: the defect this guards was a guard whose file list was narrower than
   the cohort it claimed to cover, and a hand-written list of ten filenames would reintroduce
   exactly that. Membership is instead the hazard itself -- a stylesheet reading the surface
   pair, which nothing declares at `:root` -- so a future skin that starts reading it is covered
   the moment it does, without anyone remembering to add it here. */
function collectSurfacePairCssFiles(): string[] {
  return readdirSync(SKIN_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".css"))
    .map((entry) => join(SKIN_DIR, entry.name))
    .filter((file) => /var\(\s*--ds-surface-(?:fg|bg)/.test(readFileSync(file, "utf8")));
}

/** Throws rather than returning empty when a selector is absent, so a typo fails loudly instead
 *  of letting the containing assertion pass vacuously. */
function ruleBody(css: string, selector: string): string {
  const escaped = selector.replace(/[.[\]="]/g, "\\$&");
  const match = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));
  if (!match) throw new Error(`selector not found: ${selector}`);
  return match[1]!;
}

/* Matches only a rule whose ENTIRE selector list is the one asked for, so a shared list can never
   answer a standalone lookup the way a bare `selector {` regex does. */
function standaloneRuleBody(css: string, selector: string): string {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, "");
  for (const rule of stripped.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (rule[1]!.trim() === selector) return rule[2]!;
  }
  throw new Error(`standalone rule not found: ${selector}`);
}

describe("standaloneRuleBody self-check (the helper that a shared selector list defeated)", () => {
  const FIXTURE = ".a, .b { shared: 1 } .b { own: 2 }";

  it("returns the standalone rule, never the shared list that merely mentions the selector", () => {
    expect(standaloneRuleBody(FIXTURE, ".b")).toMatch(/own:\s*2/);
    expect(standaloneRuleBody(FIXTURE, ".b")).not.toMatch(/shared/);
  });

  it("still resolves the shared list when the whole list is requested", () => {
    expect(standaloneRuleBody(FIXTURE, ".a, .b")).toMatch(/shared:\s*1/);
  });

  it("throws on an absent selector instead of returning an empty body", () => {
    expect(() => standaloneRuleBody(FIXTURE, ".missing")).toThrow(/standalone rule not found/);
  });

  it("proves the inherited helper really is defeated here, which is why this one exists", () => {
    expect(ruleBody(FIXTURE, ".b")).toMatch(/shared/);
  });
});

function injectRealCss(css: string, sink: HTMLStyleElement[]): void {
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);
  sink.push(style);
}

describe("contrast helper self-check (anti-vacuity for the math itself)", () => {
  it("agrees with the well-known #767676-on-white AA body-text boundary", () => {
    // #767676 is the widely-cited exact floor for 4.5:1 on white; one step lighter (#777777)
    // is the ramp's own gray-500 and is documented (spec) to sit just under that floor.
    expect(contrastRatio("#767676", "#ffffff")).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("#777777", "#ffffff")).toBeLessThan(4.5);
    // A color always has a contrast ratio of exactly 1 against itself.
    expect(contrastRatio("#123456", "#123456")).toBeCloseTo(1, 5);
  });
});

describe("Defect 1 -- AsciiDiagram answers a narrow measure without changing the grid a consumer re-derives", () => {
  const NODES: DiagramNode[] = [
    { id: "client", label: "CLIENT", col: 1, row: 0 },
    { id: "gateway", label: "API GATEWAY", col: 1, row: 1, emphasis: true },
    { id: "auth", label: "AUTH", col: 0, row: 2 },
    { id: "core", label: "CORE SERVICES", col: 1, row: 2 },
    { id: "events", label: "EVENTS", col: 2, row: 2 },
  ];
  const EDGES: DiagramEdge[] = [
    { from: "client", to: "gateway" },
    { from: "gateway", to: "auth", label: "verify" },
    { from: "gateway", to: "core" },
    { from: "gateway", to: "events", label: "emit" },
  ];
  const DESCRIPTION =
    "The client calls the API gateway, which verifies the request with auth, then routes to core services and emits domain events.";

  /* Restated as literals ON PURPOSE: importing the component's own constants would let both
     sides drift together silently, which is exactly what a consumer overlay cannot survive. */
  const BOX_HEIGHT = 3;
  const H_GAP = 6;
  const V_GAP = 2;
  const MIN_INNER_WIDTH = 8;

  function mockViewport(matchesNarrow: boolean): void {
    window.matchMedia = vi.fn().mockImplementation(
      (query: string) =>
        ({
          matches: query.includes("max-width") ? matchesNarrow : false,
          media: query,
          onchange: null,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          addListener: vi.fn(),
          removeListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }) as unknown as MediaQueryList,
    );
  }

  function gridTextAt(matchesNarrow: boolean): string {
    mockViewport(matchesNarrow);
    const { container } = render(
      <AsciiDiagram reveal="none" nodes={NODES} edges={EDGES} description={DESCRIPTION} />,
    );
    const grid = container.querySelector('[data-part="grid"]') as HTMLElement;
    const text = grid.textContent!;
    cleanup();
    return text;
  }

  it("paints byte-identical text at a narrow and a wide measure -- the grid geometry is a consumed contract, not a responsive detail", () => {
    const narrow = gridTextAt(true);
    const wide = gridTextAt(false);
    // Anti-vacuity: this really is a multi-line grid, so identity is a claim about a real artifact.
    expect(wide.split("\n").length).toBeGreaterThan(5);
    expect(narrow).toBe(wide);
  });

  it("places every node box at exactly the character coordinates a consumer re-derives from the painter constants", () => {
    const lines = gridTextAt(false).split("\n");
    const maxLabelLength = Math.max(...NODES.map((n) => n.label.length));
    const innerWidth = Math.max(MIN_INNER_WIDTH, maxLabelLength + 2);
    const boxWidth = innerWidth + 2;

    // Exactly the consumer's formulas: leftCh = col * (boxWidth + H_GAP), topRow = row * (BOX_HEIGHT + V_GAP).
    for (const node of NODES) {
      const leftCh = node.col * (boxWidth + H_GAP);
      const topRow = node.row * (BOX_HEIGHT + V_GAP);
      const corner = node.emphasis ? "╔" : "┌";
      expect(
        lines[topRow]?.charAt(leftCh),
        `${node.label} box corner must sit at line ${topRow}, char ${leftCh}`,
      ).toBe(corner);
      // The label row sits one line below the top rule, inside the same box.
      expect(lines[topRow + 1]?.slice(leftCh, leftCh + boxWidth)).toContain(node.label);
    }
  });

  it("keeps every node and every edge as real rendered text (the reported defect: EVENTS and its branch disappeared)", () => {
    const text = gridTextAt(true);
    for (const node of NODES) expect(text).toContain(node.label);
    for (const edge of EDGES) {
      if (edge.label) expect(text).toContain(edge.label);
    }
    /* Same-line pairing proves nothing in a 2D grid; every edge terminates in exactly one
       arrowhead, so counting heads is what counts delivered connections. */
    const arrowheads = (text.match(/[►◄▼▲]/g) ?? []).length;
    expect(arrowheads).toBe(EDGES.length);
  });

  it("reserves the full final grid height up front (CLS guard)", () => {
    mockViewport(false);
    const { container } = render(
      <AsciiDiagram reveal="none" nodes={NODES} edges={EDGES} description={DESCRIPTION} />,
    );
    const grid = container.querySelector('[data-part="grid"]') as HTMLElement;
    const lineCount = grid.textContent!.split("\n").length;
    expect(grid.style.minHeight).toBe(`${(lineCount * 1.25 * 0.8125).toFixed(4)}rem`);
  });

  it("carries no viewport dependency in source at all -- a media query here would reintroduce the consumer regression", () => {
    expect(ASCII_DIAGRAM_SOURCE).not.toMatch(/useMediaQuery|matchMedia|max-width:\s*\d/);
  });

  describe("overflow is made perceivable and operable, never relayed out or cropped", () => {
    function withGridMetrics(scrollWidth: number, clientWidth: number, run: () => void): void {
      const proto = Object.getPrototypeOf(document.createElement("pre")) as object;
      const sw = Object.getOwnPropertyDescriptor(proto, "scrollWidth");
      const cw = Object.getOwnPropertyDescriptor(proto, "clientWidth");
      Object.defineProperty(proto, "scrollWidth", { configurable: true, get: () => scrollWidth });
      Object.defineProperty(proto, "clientWidth", { configurable: true, get: () => clientWidth });
      try {
        run();
      } finally {
        if (sw) Object.defineProperty(proto, "scrollWidth", sw);
        if (cw) Object.defineProperty(proto, "clientWidth", cw);
      }
    }

    it("holds natural metrics and touches nothing when a consumer grants the diagram its natural width (the Rottay-app-shaped chain)", () => {
      mockViewport(true);
      /* overflow:auto with min-width:max-content keeps the box at least content width, so
         scrollWidth equals clientWidth -- the measured state the consumer overlay depends on. */
      withGridMetrics(462, 462, () => {
        const { container } = render(
          <AsciiDiagram reveal="none" nodes={NODES} edges={EDGES} description={DESCRIPTION} />,
        );
        const root = container.querySelector('[data-part="root"]') as HTMLElement;
        const grid = container.querySelector('[data-part="grid"]') as HTMLElement;

        expect(root).toHaveAttribute("data-overflowing", "false");
        expect(root).toHaveAttribute("data-fitted", "false");
        // The font must HOLD: the overlay pins 0.8125rem as a literal, so any scale desyncs it.
        expect(grid.style.getPropertyValue("--_ds-ascii-diagram-grid-size")).toBe("");
        expect(grid).toHaveAttribute("aria-hidden", "true");
        expect(grid).not.toHaveAttribute("tabindex");
        expect(grid).not.toHaveAttribute("role");
      });
    });

    it("quantizes the fit deterministically: the same box measured twice yields the same font", () => {
      mockViewport(false);
      const read = (): string => {
        let value = "";
        withGridMetrics(400, 330, () => {
          const { container } = render(
            <AsciiDiagram reveal="none" nodes={NODES} edges={EDGES} description={DESCRIPTION} />,
          );
          const grid = container.querySelector('[data-part="grid"]') as HTMLElement;
          value = grid.style.getPropertyValue("--_ds-ascii-diagram-grid-size");
          cleanup();
        });
        return value;
      };
      const first = read();
      expect(first).not.toBe("");
      expect(read()).toBe(first);
    });

    it("stays decorative with exactly one description carrier while the grid fits", () => {
      mockViewport(false);
      withGridMetrics(400, 400, () => {
        const { container } = render(
          <AsciiDiagram reveal="none" nodes={NODES} edges={EDGES} description={DESCRIPTION} />,
        );
        const root = container.querySelector('[data-part="root"]') as HTMLElement;
        const grid = container.querySelector('[data-part="grid"]') as HTMLElement;
        expect(root).toHaveAttribute("data-overflowing", "false");
        expect(grid).toHaveAttribute("aria-hidden", "true");
        expect(grid).not.toHaveAttribute("tabindex");
        // The visually-hidden span is the single carrier in this state.
        expect(container.querySelectorAll(".rt-ascii-diagram__visually-hidden")).toHaveLength(1);
      });
    });

    it("fits the SAME grid by type size when a constrained container is only modestly too narrow -- every node stays simultaneously visible, and no scroll region appears", () => {
      mockViewport(false);
      // 330 available against 400 required => scale 0.82, comfortably above the 9px floor.
      withGridMetrics(400, 330, () => {
        const { container } = render(
          <AsciiDiagram reveal="none" nodes={NODES} edges={EDGES} description={DESCRIPTION} />,
        );
        const root = container.querySelector('[data-part="root"]') as HTMLElement;
        const grid = container.querySelector('[data-part="grid"]') as HTMLElement;

        expect(root).toHaveAttribute("data-fitted", "true");
        // Fitting is not scrolling: the grid stays decorative and takes no tab stop.
        expect(root).toHaveAttribute("data-overflowing", "false");
        expect(grid).toHaveAttribute("aria-hidden", "true");
        expect(grid).not.toHaveAttribute("tabindex");

        // The fit rides the EXISTING private channel -- no new token, no new class.
        const applied = grid.style.getPropertyValue("--_ds-ascii-diagram-grid-size");
        expect(applied).not.toBe("");
        const rem = Number.parseFloat(applied);
        expect(rem).toBeLessThan(0.8125);
        expect(rem).toBeGreaterThanOrEqual(0.5625);
      });
    });

    it("refuses to shrink below the legibility floor and becomes a named, focusable region when it overflows -- still exactly one description carrier", () => {
      mockViewport(false);
      withGridMetrics(900, 300, () => {
        const { container } = render(
          <AsciiDiagram reveal="none" nodes={NODES} edges={EDGES} description={DESCRIPTION} />,
        );
        const root = container.querySelector('[data-part="root"]') as HTMLElement;
        const grid = container.querySelector('[data-part="grid"]') as HTMLElement;
        expect(root).toHaveAttribute("data-overflowing", "true");
        // Reachable by keyboard, announced as one thing, glyphs never voiced individually.
        expect(grid).toHaveAttribute("tabindex", "0");
        expect(grid).toHaveAttribute("role", "img");
        expect(grid).toHaveAttribute("aria-label", DESCRIPTION);
        expect(grid).not.toHaveAttribute("aria-hidden");
        // The span would now duplicate the region's name, so it must be gone.
        expect(container.querySelectorAll(".rt-ascii-diagram__visually-hidden")).toHaveLength(0);
        // Scaled and scrolling are mutually exclusive: never a floored font AND a scroller.
        expect(root).toHaveAttribute("data-fitted", "false");
        expect(grid.style.getPropertyValue("--_ds-ascii-diagram-grid-size")).toBe("");
      });
    });

    it("gives the scroll state an affordance that survives a monochrome ink surface", () => {
      /* A transparent-to-background gradient paints the surface onto itself and is therefore no
         affordance at all on ink; the stylesheet must carry a real glyph and a painted bar. */
      const overflowRule = ASCII_DIAGRAM_CSS.slice(
        ASCII_DIAGRAM_CSS.indexOf('[data-overflowing="true"]::after'),
      );
      expect(overflowRule).toMatch(/content:\s*"»"/);
      expect(ASCII_DIAGRAM_CSS).toMatch(/::-webkit-scrollbar\s*\{[^}]*height:/);
      expect(ASCII_DIAGRAM_CSS).toMatch(
        /::-webkit-scrollbar-thumb\s*\{[^}]*var\(--ds-color-hairline-strong\)/,
      );
      // Forced-colors drops gradients, so the signal needs a system-ink fallback there.
      expect(ASCII_DIAGRAM_CSS).toMatch(/forced-colors[\s\S]*?CanvasText/);
    });

    it("pins that affordance to the same LTR frame as the grid it annotates, rather than mirroring it to the opposite edge under RTL", () => {
      /* A logical inset put the marker at the START of the LTR-pinned run, and `»` (U+00BB,
         Bidi_Mirrored) additionally rendered as `«`: wrong way, wrong edge. */
      const rule = ruleBody(ASCII_DIAGRAM_CSS, '.rt-ascii-diagram[data-overflowing="true"]::after');
      expect(rule).toMatch(/direction:\s*ltr\s*;/);
      expect(rule).toMatch(/unicode-bidi:\s*isolate\s*;/);
      expect(rule).toMatch(/right:\s*0\s*;/);
      expect(rule).not.toMatch(/inset-inline-end\s*:/);
      // No surviving RTL override may move this pseudo-element back off the overflow edge.
      expect(ASCII_DIAGRAM_CSS).not.toMatch(/\[dir="rtl"\][^{]*\.rt-ascii-diagram/);
      // Anti-vacuity: the grid really is the LTR-pinned artifact whose edge this rule tracks.
      expect(ruleBody(ASCII_DIAGRAM_CSS, ".rt-ascii-diagram__grid")).toMatch(/direction:\s*ltr\s*;/);
    });

    it("keeps the decorative marker out of the accessibility tree, since its container is not aria-hidden and generated content is exposed to browse-mode readers", () => {
      const rule = ruleBody(ASCII_DIAGRAM_CSS, '.rt-ascii-diagram[data-overflowing="true"]::after');
      // Declared twice on purpose: the alt-text form wins where supported and is dropped where it
      // is not, so an unsupporting engine keeps the glyph instead of losing the affordance.
      expect(rule).toMatch(/content:\s*"»"\s*;/);
      expect(rule).toMatch(/content:\s*"»"\s*\/\s*""\s*;/);
    });
  });
});

describe("Defect 2/3 -- InvertSection re-keys generic DS text/border roles for composed primitives", () => {
  it("re-keys the generic DS text roles on the ink (default) scope, using ramp var() references, never a hardcoded hex or !important", () => {
    const inkBody = ruleBody(INVERT_SECTION_CSS, ".rt-invert-section");
    for (const role of [
      "--ds-color-text-primary",
      "--ds-color-text-secondary",
      "--ds-color-text-tertiary",
      "--ds-color-text-muted",
      "--ds-color-text-inverse",
    ]) {
      expect(inkBody).toMatch(new RegExp(`${role}:\\s*${RAMP_REF}`));
    }
    expect(inkBody).not.toMatch(/!important/);
    expect(inkBody).not.toMatch(/#[0-9a-fA-F]{3,8}/);
  });

  it("gives the muted (--ds-color-text-secondary) role a DIFFERENT ramp step than the primary role, so muted copy stays a real muted step instead of collapsing to full-strength ink", () => {
    const inkBody = ruleBody(INVERT_SECTION_CSS, ".rt-invert-section");
    const primary = inkBody.match(/--ds-color-text-primary:\s*var\(([^),]+)/)?.[1];
    const secondary = inkBody.match(/--ds-color-text-secondary:\s*var\(([^),]+)/)?.[1];
    expect(primary).toBeTruthy();
    expect(secondary).toBeTruthy();
    expect(secondary).not.toBe(primary);
  });

  it("re-keys the muted role to a DIFFERENT, surface-appropriate ramp step on paper than on ink (a single gray cannot clear 4.5:1 against both near-black ink and white paper)", () => {
    const inkBody = ruleBody(INVERT_SECTION_CSS, ".rt-invert-section");
    const paperBody = ruleBody(INVERT_SECTION_CSS, '.rt-invert-section[data-surface="paper"]');
    expect(paperBody).toMatch(new RegExp(`--ds-color-text-secondary:\\s*${RAMP_REF}`));
    const inkSecondary = inkBody.match(/--ds-color-text-secondary:\s*var\(([^),]+)/)?.[1];
    const paperSecondary = paperBody.match(/--ds-color-text-secondary:\s*var\(([^),]+)/)?.[1];
    expect(paperSecondary).toBeTruthy();
    expect(paperSecondary).not.toBe(inkSecondary);
  });

  it("the chosen ink-scope muted ramp step clears WCAG AA (4.5:1) body-text contrast against the actual ink background", () => {
    const inkBody = ruleBody(INVERT_SECTION_CSS, ".rt-invert-section");
    const ref = inkBody.match(/--ds-color-text-secondary:\s*var\((--ds-color-mono-\d+)\)/)?.[1];
    expect(ref).toBeTruthy();
    expect(contrastRatio(rampHex(ref!), INK)).toBeGreaterThanOrEqual(4.5);
  });

  it("the chosen paper-scope muted ramp step clears WCAG AA (4.5:1) body-text contrast against the actual paper background", () => {
    const paperBody = ruleBody(INVERT_SECTION_CSS, '.rt-invert-section[data-surface="paper"]');
    const ref = paperBody.match(/--ds-color-text-secondary:\s*var\((--ds-color-mono-\d+)\)/)?.[1];
    expect(ref).toBeTruthy();
    expect(contrastRatio(rampHex(ref!), PAPER)).toBeGreaterThanOrEqual(4.5);
  });

  it("re-keys a generic DS border/divider role a composed primitive might read, to a ramp step that clears at least 3:1 (meaningful non-text chrome) against ink", () => {
    const inkBody = ruleBody(INVERT_SECTION_CSS, ".rt-invert-section");
    const ref = inkBody.match(/--ds-color-border:\s*var\((--ds-color-[a-z0-9-]+)\)/)?.[1];
    expect(ref).toBeTruthy();
    expect(contrastRatio(rampHex(ref!), INK)).toBeGreaterThanOrEqual(3);
  });

  describe("live cascade proof (real CSS manually re-injected, mirroring the ChartC.skin-migration.test.tsx precedent)", () => {
    const injected: HTMLStyleElement[] = [];

    afterEach(() => {
      for (const style of injected.splice(0)) style.remove();
    });

    it('a composed primitive reading the generic --ds-color-text-secondary role resolves to the EXACT color .rt-invert-section itself re-keys that role to, inside <InvertSection surface="ink"> (not just SOME non-empty value)', () => {
      // Derived from the same source being injected, so this proves live cascade rather than
      // hardcoding whichever ramp step the fix happens to pick.
      const inkBody = ruleBody(INVERT_SECTION_CSS, ".rt-invert-section");
      const ref = inkBody.match(/--ds-color-text-secondary:\s*var\((--ds-color-[a-z0-9-]+)\)/)?.[1];
      expect(ref).toBeTruthy();

      injectRealCss(RAMP_CSS, injected);
      injectRealCss(INVERT_SECTION_CSS, injected);
      injectRealCss(".probe-consumer { color: var(--ds-color-text-secondary); }", injected);

      const { container } = render(
        <InvertSection surface="ink">
          <span className="probe-consumer">muted copy</span>
        </InvertSection>,
      );
      const probe = container.querySelector(".probe-consumer") as HTMLElement;
      const resolved = window.getComputedStyle(probe).getPropertyValue("color").trim();
      expect(parseRgb(resolved)).toEqual(hexToRgbTuple(rampHex(ref!)));
    });
  });
});

describe("Defect 2 -- cohort color declarations resolve without a .ds-mono-surface/InvertSection ancestor (honest fallback)", () => {
  it("carries a literal ramp fallback on every var(--ds-surface-fg) / var(--ds-surface-bg) reference in AsciiFrame, AsciiDiagram and SectionFrame -- none is a bare, unresolvable reference", () => {
    for (const [name, css] of [
      ["AsciiFrame.css", ASCII_FRAME_CSS],
      ["AsciiDiagram.css", ASCII_DIAGRAM_CSS],
      ["SectionFrame.css", SECTION_FRAME_CSS],
    ] as const) {
      const bareRefs = css.match(/var\(--ds-surface-(?:fg|bg)\)/g) ?? [];
      expect(bareRefs, `${name} has an un-fallbacked var(--ds-surface-fg/bg)`).toHaveLength(0);
      // Anti-vacuity: this file really does reference fg/bg (with a fallback), so the assertion
      // above is not vacuously true over a file that never mentions either token at all.
      expect(css).toMatch(/var\(--ds-surface-(?:fg|bg),\s*(?:currentColor|transparent)\)/);
      // A literal ink-polarity fallback resolves foreground to white, invisible on the light page
      // an unseated render most likely sits on -- one invisible-copy defect traded for another.
      expect(css, `${name} falls back to an absolute ramp color instead of degrading safely`).not.toMatch(
        /var\(--ds-surface-fg,\s*var\(--ds-color-mono-1000\)\)/,
      );
    }
  });

  it("carries a fallback on every var() inside every focus-ring declaration in the COHORT, not just in the three stylesheets the leg above happens to name", () => {
    /* An unresolvable var() invalidates the shorthand, so `outline-style` falls back to its
       `none` initial and the ring vanishes; `--ds-surface-fg` is never declared at `:root`. */
    const cssFiles = collectSurfacePairCssFiles().map(
      (file) => [file, readFileSync(file, "utf8")] as const,
    );
    // Anti-vacuity: the cohort really does ship stylesheets, and some really declare an outline.
    expect(cssFiles.length).toBeGreaterThan(5);

    const outlineDecls = cssFiles.flatMap(([name, css]) =>
      (css.match(/outline:[^;]+;/g) ?? []).map((decl) => [name, decl] as const),
    );
    expect(outlineDecls.length).toBeGreaterThan(0);

    for (const [name, decl] of outlineDecls) {
      for (const ref of decl.match(/var\(\s*--[a-z0-9-]+/g) ?? []) {
        const escaped = ref.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        expect(decl, `${name}: focus ring has a bare ${ref}...) with no fallback`).toMatch(
          new RegExp(`${escaped}\\s*,`),
        );
      }
    }
  });

  describe("live cascade proof (real CSS manually re-injected, no InvertSection/.ds-mono-surface ancestor present)", () => {
    const injected: HTMLStyleElement[] = [];

    afterEach(() => {
      for (const style of injected.splice(0)) style.remove();
    });

    it("AsciiFrame degrades its foreground to the inherited page color when mounted standalone -- never to the ramp's absolute white, which would vanish on a light page", () => {
      injectRealCss(RAMP_CSS, injected);
      injectRealCss(ASCII_FRAME_CSS, injected);

      const { container } = render(<AsciiFrame label="STANDALONE">standalone body</AsciiFrame>);
      const root = container.querySelector('[data-part="root"]') as HTMLElement;
      const resolved = window.getComputedStyle(root).getPropertyValue("color").trim();

      /* This environment cannot collapse `currentColor` to a triple, so the provable claim is the
         KEYWORD; the negative leg is what catches an absolute white invisible on a light page. */
      expect(resolved.toLowerCase()).toBe("currentcolor");
      expect(parseRgb(resolved)).not.toEqual(hexToRgbTuple(rampHex("--ds-color-mono-1000")));
    });
  });
});

describe("Defect F -- TerminalBlock's streamed rows reserve their settled box, not a one-line floor", () => {
  /* The 1lh floor held one line; a wrapped command needs the whole final measure, so the row is
     now a grid cell whose carrier reserves the settled text. */
  it("no longer relies on a one-line floor anywhere in the family", () => {
    expect(TERMINAL_BLOCK_CSS).not.toMatch(/min-block-size\s*:/);
    expect(standaloneRuleBody(TERMINAL_BLOCK_CSS, ".rt-terminal-block__line")).toMatch(
      /display:\s*grid/,
    );
  });

  it("keeps no min-size on the inline layers, where the carrier now owns the box", () => {
    expect(standaloneRuleBody(TERMINAL_BLOCK_CSS, ".rt-terminal-block__visual")).not.toMatch(
      /min-block-size\s*:|min-height\s*:/,
    );
    expect(
      standaloneRuleBody(TERMINAL_BLOCK_CSS, ".rt-terminal-block__visually-hidden"),
    ).not.toMatch(/min-block-size\s*:|min-height\s*:/);
  });
});

describe("Defect 4 -- SectionFrame binds ordinal, title and meta into one header group", () => {
  it("bounds the label row to a literal reading measure, so meta's auto-margin can never push it further than that measure away from the title -- instead of riding the full container width", () => {
    const body = ruleBody(SECTION_FRAME_CSS, ".rt-section-frame__label");
    expect(body).toMatch(/max-inline-size:\s*var\(--ds-type-paragraph-measure,\s*\d+ch\)/);
  });

  it("keeps the existing intentional wrap behavior intact (regression guard) while adding the measure cap", () => {
    const body = ruleBody(SECTION_FRAME_CSS, ".rt-section-frame__label");
    expect(body).toMatch(/flex-wrap:\s*wrap/);
  });

  it("keeps meta bound with a logical property, never a physical left/right rule (RTL correctness -- bithire-ar)", () => {
    const body = ruleBody(SECTION_FRAME_CSS, ".rt-section-frame__meta");
    expect(body).toMatch(/margin-inline-start:\s*auto/);
    expect(body).not.toMatch(/margin-left|margin-right/);
  });
});

describe("P3 -- SectionFrame ordinal has an accessible text equivalent, without double-announcing", () => {
  it("keeps the visible [NN] marker aria-hidden (unchanged) and exposes a separate, non-aria-hidden text equivalent for it", () => {
    const { container } = render(
      <SectionFrame index={2} title="Ships to every vertical">
        body
      </SectionFrame>,
    );
    const marker = container.querySelector('[data-part="index"]');
    expect(marker).toHaveAttribute("aria-hidden", "true");

    const hiddenLabel = container.querySelector('[data-part="index-label"]');
    expect(hiddenLabel).not.toBeNull();
    expect(hiddenLabel).not.toHaveAttribute("aria-hidden");
    expect(hiddenLabel).toHaveTextContent("2");
  });

  /* No hook, no id wiring: the ordinal is inside the heading, so the name is natural. */
  it("builds the heading's accessible name from the ordinal inside it, with no id plumbing at all", () => {
    const { container } = render(
      <SectionFrame index={3} title="Section title" meta="4 items">
        body
      </SectionFrame>,
    );
    const title = container.querySelector('[data-part="title"]') as HTMLElement;
    expect(title).not.toHaveAttribute("aria-labelledby");
    expect(title.id).toBe("");
    expect(container.querySelector("[aria-labelledby]")).toBeNull();

    const hiddenLabel = container.querySelector('[data-part="index-label"]') as HTMLElement;
    expect(title.contains(hiddenLabel)).toBe(true);
    expect(
      screen.getByRole("heading", { name: "03 Section title" }),
    ).toBeInTheDocument();
  });

  it("stays server-safe: the family imports no React hook and declares no client boundary", () => {
    const source = readFileSync(
      join(SOURCE_ROOT, "ui/structures/headers/section-frame/index.tsx"),
      "utf8",
    );
    expect(source).not.toMatch(/use client/);
    expect(source).not.toMatch(/\buseId\b/);
    expect(source).not.toMatch(/\buseState\b|\buseEffect\b|\buseRef\b/);
  });

  it("omits the hidden label and aria-labelledby entirely when there is no index (nothing to announce)", () => {
    const { container } = render(<SectionFrame title="No index here">body</SectionFrame>);
    const title = container.querySelector('[data-part="title"]');
    expect(title).not.toHaveAttribute("aria-labelledby");
    expect(container.querySelector('[data-part="index-label"]')).toBeNull();
    expect(
      screen.getByRole("heading", { name: "No index here" }),
    ).toBeInTheDocument();
  });

  it("keeps the ordinal OUTSIDE the heading when there is no title, as the only accessible carrier", () => {
    const { container } = render(<SectionFrame index={4}>body</SectionFrame>);
    const hiddenLabel = container.querySelector('[data-part="index-label"]') as HTMLElement;
    expect(hiddenLabel).toBeInTheDocument();
    expect(hiddenLabel.textContent).toBe("04");
    expect(container.querySelector('[data-part="title"]')).toBeNull();
    const carriers = Array.from(container.querySelectorAll("*")).filter(
      (el) => el.getAttribute("aria-hidden") !== "true" && el.textContent?.trim() === "04",
    );
    expect(carriers).toHaveLength(1);
  });

  it("composes the heading's real accessible name from the ordinal plus the title -- verified through @testing-library's own accessible-name computation, the same mechanism assistive tech relies on", () => {
    render(
      <SectionFrame index={2} title="What the platform actually ships to every vertical">
        body
      </SectionFrame>,
    );
    expect(
      screen.getByRole("heading", {
        name: "02 What the platform actually ships to every vertical",
      }),
    ).toBeInTheDocument();
  });

  it("never double-announces: exactly one element carries the ordinal's accessible text outside the aria-hidden marker", () => {
    const { container } = render(
      <SectionFrame index={5} title="Five">
        body
      </SectionFrame>,
    );
    const candidates = Array.from(container.querySelectorAll("*")).filter(
      (el) => el.getAttribute("aria-hidden") !== "true" && el.textContent?.trim() === "05",
    );
    expect(candidates).toHaveLength(1);
  });

  /* The DS must never invent a word in the consumer's language; the ordinal is data, not copy. */
  it("ships NO English word in the accessible ordinal -- the neutral fallback is the index alone", () => {
    const { container } = render(
      <SectionFrame index={7} title="Neutral">
        body
      </SectionFrame>,
    );
    const hiddenLabel = container.querySelector('[data-part="index-label"]') as HTMLElement;
    // Inside the heading the ordinal carries a separator space so the accessible name reads "07 Neutral".
    expect(hiddenLabel.textContent?.trim()).toBe("07");
    expect(hiddenLabel.textContent).not.toMatch(/[A-Za-z]/);
    expect(screen.getByRole("heading", { name: "07 Neutral" })).toBeInTheDocument();
  });

  it("lets the consumer localize the ordinal through indexLabel, and that text is what is announced", () => {
    render(
      <SectionFrame index={2} indexLabel="Sección 2" title="Lo que la plataforma entrega">
        body
      </SectionFrame>,
    );
    expect(
      screen.getByRole("heading", {
        name: "Sección 2 Lo que la plataforma entrega",
      }),
    ).toBeInTheDocument();
  });

  /* The ordinal must reuse the canonical primitive, not a second copy of the clip geometry. */
  it("carries the ordinal in the canonical ds-visually-hidden owner, with no inline clip style", () => {
    const { container } = render(
      <SectionFrame index={2} title="Title">
        body
      </SectionFrame>,
    );
    const hiddenLabel = container.querySelector('[data-part="index-label"]') as HTMLElement;
    expect(hiddenLabel).toHaveClass("ds-visually-hidden");
    expect(hiddenLabel.getAttribute("style")).toBeNull();
  });

  it("keeps the ordinal accessible when there is an index but NO title", () => {
    const { container } = render(<SectionFrame index={2}>body</SectionFrame>);
    const marker = container.querySelector('[data-part="index"]') as HTMLElement;
    expect(marker).toHaveAttribute("aria-hidden", "true");

    const hiddenLabel = container.querySelector('[data-part="index-label"]') as HTMLElement;
    expect(hiddenLabel).toBeInTheDocument();
    expect(hiddenLabel).toHaveClass("ds-visually-hidden");
    const carriers = Array.from(container.querySelectorAll("*")).filter(
      (el) => el.getAttribute("aria-hidden") !== "true" && el.textContent?.trim() === "02",
    );
    expect(carriers).toHaveLength(1);
  });

  it("creates no heading and no aria-labelledby when there is no title", () => {
    const { container } = render(<SectionFrame index={2}>body</SectionFrame>);
    expect(container.querySelector('[data-part="title"]')).toBeNull();
    expect(container.querySelector("h1, h2, h3, h4")).toBeNull();
    expect(container.querySelector("[aria-labelledby]")).toBeNull();
  });

  it("survives a zero index and a falsey indexLabel, which a truthy guard would drop", () => {
    const zero = render(<SectionFrame index={0}>body</SectionFrame>);
    expect(
      zero.container.querySelector('[data-part="index-label"]'),
    ).toHaveTextContent("00");
    expect(zero.container.querySelector('[data-part="index"]')).toHaveTextContent("[00]");
    zero.unmount();

    const emptyLabel = render(
      <SectionFrame index={3} indexLabel="">
        body
      </SectionFrame>,
    );
    const label = emptyLabel.container.querySelector('[data-part="index-label"]') as HTMLElement;
    expect(label).toBeInTheDocument();
    expect(label.textContent).toBe("");
  });

  it("keeps the visible marker aria-hidden and exposes exactly one heading named from ordinal plus title", () => {
    const { container } = render(
      <SectionFrame index={2} indexLabel="Sección 2" title="Título">
        body
      </SectionFrame>,
    );
    expect(container.querySelector('[data-part="index"]')).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector('[data-part="index"]')).toHaveTextContent("[02]");
    // The ordinal now lives inside the heading, so its NAME is the contract, not its textContent.
    expect(screen.getAllByRole("heading")).toHaveLength(1);
    expect(
      screen.getByRole("heading", { name: "Sección 2 Título" }),
    ).toBeInTheDocument();
    const carriers = Array.from(container.querySelectorAll("*")).filter(
      (el) => el.getAttribute("aria-hidden") !== "true" && el.textContent?.trim() === "Sección 2",
    );
    expect(carriers).toHaveLength(1);
  });
});

// ---- Round 2: measured browser-sweep findings, plus the canon ruling on the re-key's shape ----

describe("Defect E -- TerminalBlock's title/command clip at 390px (measured: 328 clientWidth vs 375 scrollWidth) is a PAINT clip, not an a11y loss", () => {
  it("keeps the inherited single-row ellipsis mechanics -- all three declarations are load-bearing together, and dropping any one silently changes the documented behaviour", () => {
    const body = ruleBody(TERMINAL_BLOCK_CSS, ".rt-terminal-block__title-bar");
    expect(body).toMatch(/overflow:\s*hidden/);
    expect(body).toMatch(/text-overflow:\s*ellipsis/);
    expect(body).toMatch(/white-space:\s*nowrap/);
  });

  it("does not re-litigate the clip by switching to wrapping -- the baseline invariant says a long caption truncates, and the prose stays byte-identical to it", () => {
    const body = ruleBody(TERMINAL_BLOCK_CSS, ".rt-terminal-block__title-bar");
    expect(body).not.toMatch(/overflow-wrap:\s*anywhere/);
    expect(TERMINAL_BLOCK_CSS).toMatch(
      /\/\* Long mono captions truncate with ellipsis instead of wrapping a second title row\. \*\//,
    );
  });

  it("exposes the WHOLE caption to assistive tech even though it is visually clipped -- overflow:hidden clips paint and does not prune the accessibility tree, and no ancestor marks the bar aria-hidden", () => {
    const command =
      "pnpm --filter @rottay/design-system typecheck -- a-genuinely-long-flag-that-would-have-overflowed-a-390px-panel";
    const { container } = render(
      <TerminalBlock title={command} lines={[{ prompt: true, text: "pnpm build" }]} />,
    );
    const titleBar = container.querySelector('[data-part="title-bar"]');
    expect(titleBar).toHaveTextContent(command);
    expect(titleBar?.closest('[aria-hidden="true"]')).toBeNull();
  });

  it("carries the caption exactly once, so restoring the clip cannot have introduced a duplicate announcement", () => {
    const command = "a-very-long-command-that-overflows";
    const { container } = render(
      <TerminalBlock title={command} lines={[{ prompt: true, text: "pnpm build" }]} />,
    );
    const carriers = Array.from(container.querySelectorAll("*")).filter(
      (el) => el.getAttribute("aria-hidden") !== "true" && el.textContent?.trim() === command,
    );
    expect(carriers).toHaveLength(1);
  });
});

describe("Reviewer source vetoes -- CLS reservations survive their own scaling", () => {
  /* The reservation must be in the NATURAL size, or the fit shrinks exactly what it reserves. */
  it("reserves the AsciiDiagram grid in rem of the natural size, never in em of the fitted size", () => {
    expect(ASCII_DIAGRAM_SOURCE).toMatch(
      /const GRID_LINE_HEIGHT_REM = GRID_LINE_HEIGHT_EM \* NATURAL_GRID_REM;/,
    );
    expect(ASCII_DIAGRAM_SOURCE).toMatch(/minHeight: `\$\{\(lineCount \* GRID_LINE_HEIGHT_REM\)/);
    expect(ASCII_DIAGRAM_SOURCE).not.toMatch(/minHeight: `\$\{lineCount \* GRID_LINE_HEIGHT_EM\}em`/);
  });

  it("keeps that reservation identical whether or not a font fit is applied", () => {
    const { container } = render(
      <AsciiDiagram
        nodes={[{ id: "a", label: "ALPHA", col: 0, row: 0 }]}
        edges={[]}
        description="One node."
      />,
    );
    const grid = container.querySelector('[data-part="grid"]') as HTMLElement;
    const reservedBefore = grid.style.minHeight;

    // Simulate the fit the component itself applies; the reservation must not move with it.
    grid.style.setProperty("--_ds-ascii-diagram-grid-size", "0.4000rem");
    expect(grid.style.minHeight).toBe(reservedBefore);
    expect(reservedBefore.endsWith("rem")).toBe(true);
    expect(reservedBefore.endsWith("em") && !reservedBefore.endsWith("rem")).toBe(false);
  });

  it("gives Typewriter an in-flow reservation sharing one grid cell with the animated layer", () => {
    const css = skinCss("typewriter.css");
    expect(ruleBody(css, ".rt-typewriter")).toMatch(/display:\s*inline-grid/);
    const shared = css.match(
      /\.rt-typewriter__visually-hidden,\s*\.rt-typewriter__visual\s*\{([^}]*)\}/,
    );
    expect(shared).toBeTruthy();
    expect(shared![1]).toMatch(/grid-area:\s*1 \/ 1/);
    expect(shared![1]).toMatch(/white-space:\s*pre-wrap/);
    expect(shared![1]).toMatch(/overflow-wrap:\s*break-word/);
    // An atomic inline box must still be allowed to shrink below a long URL's min-content.
    expect(shared![1]).toMatch(/min-inline-size:\s*0/);
    expect(ruleBody(css, ".rt-typewriter")).toMatch(/max-inline-size:\s*100%/);
    expect(ruleBody(css, ".rt-typewriter")).toMatch(/min-inline-size:\s*0/);
    // Paint is CLIPPED for the whole subtree; layout and the accessibility tree are untouched.
    const carrier = standaloneRuleBody(css, ".rt-typewriter__visually-hidden");
    expect(carrier).toMatch(/clip-path:\s*inset\(50%\)/);
    expect(carrier).toMatch(/overflow:\s*hidden/);
    expect(css).not.toMatch(/visibility:\s*hidden/);
    expect(css).not.toMatch(/display:\s*none/);
    expect(css).not.toMatch(/\.rt-typewriter__visually-hidden\s*\{[^}]*position:\s*absolute/);
    expect(standaloneRuleBody(css, ".rt-typewriter__visual")).toMatch(/user-select:\s*none/);
    // Decode metrics must apply to BOTH layers or the reserved box is the wrong width.
    expect(css).toMatch(
      /\[data-mode="decode"\] \.rt-typewriter__visual,\s*\.rt-typewriter\[data-mode="decode"\] \.rt-typewriter__visually-hidden/,
    );
  });

  it("reserves each TerminalBlock row with its final text and prompt footprint, not a one-line floor", () => {
    expect(ruleBody(TERMINAL_BLOCK_CSS, ".rt-terminal-block__line")).toMatch(/display:\s*grid/);
    const shared = TERMINAL_BLOCK_CSS.match(
      /\.rt-terminal-block__visually-hidden,\s*\.rt-terminal-block__visual\s*\{([^}]*)\}/,
    );
    expect(shared).toBeTruthy();
    expect(shared![1]).toMatch(/grid-area:\s*1 \/ 1/);
    expect(shared![1]).toMatch(/white-space:\s*pre-wrap/);
    expect(shared![1]).toMatch(/word-break:\s*break-word/);
    // Bidi pinning must be SHARED, or the two footprints diverge under RTL.
    expect(shared![1]).toMatch(/direction:\s*ltr/);
    expect(shared![1]).toMatch(/unicode-bidi:\s*isolate/);
    // The carrier clips its whole SUBTREE, so the prompt child cannot repaint over the visual
    // even though .rt-terminal-block__prompt sets its own colour at equal specificity.
    const carrier = standaloneRuleBody(TERMINAL_BLOCK_CSS, ".rt-terminal-block__visually-hidden");
    expect(carrier).toMatch(/clip-path:\s*inset\(50%\)/);
    expect(carrier).toMatch(/overflow:\s*hidden/);
    expect(carrier).not.toMatch(/color:\s*transparent/);
    expect(TERMINAL_BLOCK_CSS).not.toMatch(/visibility:\s*hidden/);
    expect(TERMINAL_BLOCK_CSS).not.toMatch(
      /\.rt-terminal-block__visually-hidden\s*\{[^}]*position:\s*absolute/,
    );
    // The decorative layer must not join a selection alongside the carrier.
    const visual = standaloneRuleBody(TERMINAL_BLOCK_CSS, ".rt-terminal-block__visual");
    expect(visual).toMatch(/user-select:\s*none/);
    expect(visual).toMatch(/pointer-events:\s*none/);
    // The one-line floor is gone: it was never the thing holding a wrapped row.
    expect(TERMINAL_BLOCK_CSS).not.toMatch(/min-block-size:\s*1lh/);
  });

  it("carries the full row text once and the prompt footprint aria-hidden, from the first frame", () => {
    const command =
      "pnpm --filter @rottay/design-system exec vitest run a-very-long-command-that-must-wrap-across-two-lines";
    const { container } = render(
      <TerminalBlock streaming lines={[{ prompt: true, text: command }]} />,
    );
    const row = container.querySelector('[data-part="line"]') as HTMLElement;
    const carrier = row.querySelector(".rt-terminal-block__visually-hidden") as HTMLElement;

    // The reserve holds the settled text immediately, before any streaming has happened.
    expect(carrier).toHaveTextContent(command);
    // Exactly one accessible carrier for the row text.
    const carriers = Array.from(row.querySelectorAll("*")).filter(
      (el) => el.getAttribute("aria-hidden") !== "true" && el.textContent?.includes(command),
    );
    expect(carriers).toHaveLength(1);
    // The prompt footprint is reserved but never announced.
    const reservedPrompt = carrier.querySelector(".rt-terminal-block__prompt") as HTMLElement;
    expect(reservedPrompt).toHaveAttribute("aria-hidden", "true");
    expect(reservedPrompt).toHaveTextContent("$");
  });
});

describe("Defect B (refinement) -- section-frame meta is real text and was measured at 4.42:1 on ink, just under the 4.5 body-copy floor", () => {
  it("routes meta's color through the canon-approved re-keyed role instead of the raw ramp step that measured under AA", () => {
    const body = ruleBody(SECTION_FRAME_CSS, ".rt-section-frame__meta");
    expect(body).toMatch(/color:\s*var\(--ds-color-text-secondary,\s*var\(--ds-color-mono-500\)\)/);
  });

  it("leaves the aria-hidden index/dash markers on their existing step (they are decorative chrome, held to the 3:1 non-text floor, which gray-500 already clears)", () => {
    const indexBody = ruleBody(SECTION_FRAME_CSS, ".rt-section-frame__index");
    const dashBody = ruleBody(SECTION_FRAME_CSS, ".rt-section-frame__dash");
    expect(indexBody).toMatch(/color:\s*var\(--ds-color-mono-500\)/);
    expect(dashBody).toMatch(/color:\s*var\(--ds-color-mono-500\)/);
  });

  it("the re-keyed role's ink-scope and paper-scope values (already proven AA-safe in the Defect 2/3 suite above) are what meta now resolves through -- no new ramp step invented for this fix", () => {
    // Re-derived from the InvertSection source, proving this fix rides the SAME canon-approved
    // mechanism rather than a new one-off literal.
    const inkBody = ruleBody(INVERT_SECTION_CSS, ".rt-invert-section");
    const ref = inkBody.match(/--ds-color-text-secondary:\s*var\((--ds-color-mono-\d+)\)/)?.[1];
    expect(ref).toBeTruthy();
    expect(contrastRatio(rampHex(ref!), INK)).toBeGreaterThanOrEqual(4.5);
  });
});

describe("Defect C -- AsciiFrame corner glyphs mismatch their physical position under RTL", () => {
  /* ruleBody() here escapes only `.[]="`, so a `:dir(rtl)` selector must be matched with an
     explicit regex rather than routed through it. */
  const MIRROR_RULE =
    /\.rt-ascii-frame:dir\(rtl\)\s+\.rt-ascii-frame__corner\s*\{([^}]*)\}/;

  it("keeps all four corner glyphs on LOGICAL offsets, so the inherited 'all offsets are logical properties' contract stays literally true", () => {
    for (const corner of ["tl", "tr", "bl", "br"]) {
      const body = ruleBody(ASCII_FRAME_CSS, `.rt-ascii-frame__corner--${corner}`);
      expect(body).toMatch(/inset-inline-(start|end)/);
      expect(body).not.toMatch(/(?<!inset-inline-)\b(left|right):/);
    }
  });

  it("mirrors the corner GLYPH under an RTL root -- mirroring the POSITIONS alone would seat the top-left elbow at the top-right", () => {
    const mirror = ASCII_FRAME_CSS.match(MIRROR_RULE)?.[1];
    expect(mirror).toBeTruthy();
    expect(mirror).toMatch(/transform:\s*scaleX\(-1\)\s*;/);
  });

  it("keys the mirror on the ambient ROOT and never on the corner itself -- the corner declares its own direction:ltr, which would make a self-keyed :dir() dormant", () => {
    expect(ASCII_FRAME_CSS).not.toMatch(/\.rt-ascii-frame__corner:dir\(/);
    expect(ruleBody(ASCII_FRAME_CSS, ".rt-ascii-frame__corner")).toMatch(/direction:\s*ltr\s*;/);
  });

  it("pins the shared corner rule to direction:ltr and unicode-bidi:isolate -- a fixed, code-like ASCII artifact whose character order never reorders", () => {
    const body = ruleBody(ASCII_FRAME_CSS, ".rt-ascii-frame__corner");
    expect(body).toMatch(/direction:\s*ltr/);
    expect(body).toMatch(/unicode-bidi:\s*isolate/);
  });

  it("makes the inherited docblock claim TRUE instead of rewriting it -- the fix is behavioural, so the baseline prose survives byte-for-byte", () => {
    expect(ASCII_FRAME_CSS).toMatch(
      /All offsets are logical properties: RTL mirrors corners and the seated label for free\./,
    );
  });

  it("scopes the mirror to the corner glyphs only -- the seated label carries real, potentially-localized text and must never be flipped", () => {
    const mirror = ASCII_FRAME_CSS.match(MIRROR_RULE)?.[1] ?? "";
    expect(mirror).not.toMatch(/label/);
    expect(ruleBody(ASCII_FRAME_CSS, ".rt-ascii-frame__label")).not.toMatch(/scaleX/);
  });

  it("still lets the seated LABEL follow logical/reading direction", () => {
    const body = ruleBody(ASCII_FRAME_CSS, ".rt-ascii-frame__label");
    expect(body).toMatch(/inset-inline-start/);
  });
});

describe("Bidi pinning -- ASCII-art text layers stay a stable LTR artifact regardless of ambient direction", () => {
  it("AsciiDiagram's grid is pinned direction:ltr / unicode-bidi:isolate (fixed-width column alignment must survive an RTL-script node label)", () => {
    const body = ruleBody(ASCII_DIAGRAM_CSS, ".rt-ascii-diagram__grid");
    expect(body).toMatch(/direction:\s*ltr/);
    expect(body).toMatch(/unicode-bidi:\s*isolate/);
  });

  it("TerminalBlock's decorative visual layer is pinned direction:ltr / unicode-bidi:isolate", () => {
    const body = ruleBody(TERMINAL_BLOCK_CSS, ".rt-terminal-block__visual");
    expect(body).toMatch(/direction:\s*ltr/);
    expect(body).toMatch(/unicode-bidi:\s*isolate/);
  });
});

describe("TerminalBlock scanlines -- forced-colors gap (TextureBackdrop's own pattern, not yet applied here)", () => {
  it("drops the decorative scanline layer under forced-colors, in addition to the existing prefers-contrast:more rule", () => {
    expect(TERMINAL_BLOCK_CSS).toMatch(
      /@media \(forced-colors: active\)\s*\{\s*\.rt-terminal-block__scanlines\s*\{\s*display:\s*none;/,
    );
    // Regression guard: the existing prefers-contrast:more rule must still be present.
    expect(TERMINAL_BLOCK_CSS).toMatch(
      /@media \(prefers-contrast: more\)\s*\{\s*\.rt-terminal-block__scanlines\s*\{\s*display:\s*none;/,
    );
  });
});

describe("InvertSection -- text-disabled role (canon-permitted addition)", () => {
  it("re-keys --ds-color-text-disabled to a ramp step, distinct from the ambient theme's own disabled value", () => {
    const inkBody = ruleBody(INVERT_SECTION_CSS, ".rt-invert-section");
    expect(inkBody).toMatch(new RegExp(`--ds-color-text-disabled:\\s*${RAMP_REF}`));
  });
});

describe("InvertSection -- paper-branch primary/inverse aliasing (the part canon flagged as most likely to be missed)", () => {
  it("does NOT need its own --ds-color-text-primary/-inverse override on the paper branch, because both alias --ds-surface-fg/-bg, which the paper branch already overrides -- proven via live cascade, not just source inspection", () => {
    const injected: HTMLStyleElement[] = [];
    injectRealCss(RAMP_CSS, injected);
    injectRealCss(INVERT_SECTION_CSS, injected);
    injectRealCss(".probe-primary { color: var(--ds-color-text-primary); }", injected);

    const { container } = render(
      <InvertSection surface="paper">
        <span className="probe-primary">primary copy</span>
      </InvertSection>,
    );
    const probe = container.querySelector(".probe-primary") as HTMLElement;
    const resolved = window.getComputedStyle(probe).getPropertyValue("color").trim();
    // Resolving to the PAPER foreground rather than the ink-branch white proves the alias tracks
    // the cascade override instead of freezing at whatever the base rule computed.
    expect(parseRgb(resolved)).toEqual(hexToRgbTuple(rampHex("--ds-color-mono-0")));

    for (const style of injected.splice(0)) style.remove();
  });
});
