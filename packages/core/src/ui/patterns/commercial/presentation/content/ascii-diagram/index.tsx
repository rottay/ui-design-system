"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type {
  AsciiDiagramProps,
  DiagramEdge,
  DiagramNode,
} from '../../../foundation/contracts/content/ascii-diagram';
import { useReveal } from '../../../runtime/reveal';

import "./AsciiDiagram.css";

/**
 * Grid geometry, in monospace characters. Every node renders as a fixed 3-row box (top rule,
 * label, bottom rule); box width is uniform across the WHOLE diagram (derived from the longest
 * label) so columns line up cleanly and edge routing math stays simple. `H_GAP`/`V_GAP` are the
 * character channels between adjacent columns/rows that connectors route through.
 */

/* A CONSUMED CONTRACT: a consumer re-derives these four to position an overlay, so changing
   one mis-registers that overlay rather than failing here. */
const BOX_HEIGHT = 3;
const H_GAP = 6;
const V_GAP = 2;
const MIN_INNER_WIDTH = 8;

/**
 * Fallback for the "type" reveal cadence (milliseconds each grid line stays revealed for
 * before the next one appears). The effective cadence is private to this reveal grammar and
 * read from `--_ds-ascii-diagram-line-cadence`; this constant applies only when that local
 * channel is undeclared or unparseable.
 */
const LINE_STEP_MS = 90;

/** Family-private channel governing the "type" reveal cadence (see `LINE_STEP_MS`). */
const LINE_CADENCE_AXIS = "--_ds-ascii-diagram-line-cadence";

/** Mirrors the grid's CSS line-height: the type reveal grows the text line by
 *  line, so the full height must be reserved up front or the page shifts. */
const GRID_LINE_HEIGHT_EM = 1.25;

/** Absolute px, not a rem ratio: the tenant root font varies (15px / 15.6px observed), so a
 *  ratio of the natural rem would silently permit sub-9px type on a smaller root. */
const MIN_FIT_PX = 9;
const GRID_SIZE_AXIS = "--_ds-ascii-diagram-grid-size";
const NATURAL_GRID_REM = 0.8125;
/* The reservation is expressed in the NATURAL size, not in em: an em would shrink with the fit
   and the guard would give back exactly the height it exists to hold. */
const GRID_LINE_HEIGHT_REM = GRID_LINE_HEIGHT_EM * NATURAL_GRID_REM;

/**
 * Reads a private `<time>` channel from the resolved style of `node`, falling back to
 * `fallbackMs` when it is undeclared or unparseable. Called only inside effects, once per
 * animation run.
 */
function readCadenceTimeMs(node: HTMLElement | null, axis: string, fallbackMs: number): number {
  if (node === null || typeof getComputedStyle !== "function") return fallbackMs;
  const raw = getComputedStyle(node).getPropertyValue(axis).trim();
  const parsed = raw.endsWith("ms")
    ? Number.parseFloat(raw)
    : raw.endsWith("s")
      ? Number.parseFloat(raw) * 1000
      : Number.NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallbackMs;
}

type CharGrid = string[][];

interface BoxGlyphs {
  tl: string;
  tr: string;
  bl: string;
  br: string;
  h: string;
  v: string;
}

const SINGLE_GLYPHS: BoxGlyphs = { tl: "┌", tr: "┐", bl: "└", br: "┘", h: "─", v: "│" };
const DOUBLE_GLYPHS: BoxGlyphs = { tl: "╔", tr: "╗", bl: "╚", br: "╝", h: "═", v: "║" };

interface LayoutNode {
  id: string;
  label: string;
  emphasis: boolean;
  col: number;
  row: number;
  colStart: number;
  rowStart: number;
}

function centerLabel(label: string, width: number): string {
  if (label.length >= width) return label.slice(0, width);
  const total = width - label.length;
  const left = Math.floor(total / 2);
  const right = total - left;
  return " ".repeat(left) + label + " ".repeat(right);
}

function paintChar(grid: CharGrid, row: number, col: number, ch: string): void {
  const line = grid[row];
  if (!line || col < 0 || col >= line.length) return;
  line[col] = ch;
}

function paintText(grid: CharGrid, row: number, col: number, text: string): void {
  for (let i = 0; i < text.length; i += 1) {
    paintChar(grid, row, col + i, text.charAt(i));
  }
}

function paintNode(grid: CharGrid, node: LayoutNode, boxWidth: number): void {
  const glyphs = node.emphasis ? DOUBLE_GLYPHS : SINGLE_GLYPHS;
  const innerWidth = boxWidth - 2;
  const top = node.rowStart;
  const mid = node.rowStart + 1;
  const bottom = node.rowStart + 2;
  const left = node.colStart;
  const right = node.colStart + boxWidth - 1;

  paintText(grid, top, left, `${glyphs.tl}${glyphs.h.repeat(innerWidth)}${glyphs.tr}`);
  paintText(grid, bottom, left, `${glyphs.bl}${glyphs.h.repeat(innerWidth)}${glyphs.br}`);
  paintChar(grid, mid, left, glyphs.v);
  paintChar(grid, mid, right, glyphs.v);
  paintText(grid, mid, left + 1, centerLabel(node.label, innerWidth));
}

/**
 * Writes an edge label centered inside a straight run of dashes, reserving the one cell at
 * `direction === 1 ? hi : lo` for the arrow/corner glyph that is always painted afterward.
 */
function paintInlineLabel(
  grid: CharGrid,
  row: number,
  lo: number,
  hi: number,
  direction: 1 | -1,
  label: string | undefined,
): void {
  if (!label) return;
  const text = ` ${label} `;
  const available = hi - lo;
  if (available <= 0 || text.length > available) return;
  const start =
    direction === 1
      ? lo + Math.floor((available - text.length) / 2)
      : lo + 1 + Math.floor((available - text.length) / 2);
  paintText(grid, row, start, text);
}

/** Same row, different column: a straight horizontal connector. */
function paintHorizontalEdge(
  grid: CharGrid,
  from: LayoutNode,
  to: LayoutNode,
  boxWidth: number,
  label: string | undefined,
): void {
  const row = from.rowStart + 1;
  const forward = to.col > from.col;
  const start = forward ? from.colStart + boxWidth : from.colStart - 1;
  const end = forward ? to.colStart - 1 : to.colStart + boxWidth;
  const lo = Math.min(start, end);
  const hi = Math.max(start, end);

  for (let c = lo; c <= hi; c += 1) paintChar(grid, row, c, "─");
  paintInlineLabel(grid, row, lo, hi, forward ? 1 : -1, label);
  paintChar(grid, row, forward ? hi : lo, forward ? "►" : "◄");
}

/** Same column, different row: a straight vertical connector. */
function paintVerticalEdge(
  grid: CharGrid,
  from: LayoutNode,
  to: LayoutNode,
  boxWidth: number,
  label: string | undefined,
): void {
  const col = from.colStart + Math.floor(boxWidth / 2);
  const forward = to.row > from.row;
  const start = forward ? from.rowStart + BOX_HEIGHT : from.rowStart - 1;
  const end = forward ? to.rowStart - 1 : to.rowStart + BOX_HEIGHT;
  const lo = Math.min(start, end);
  const hi = Math.max(start, end);
  const arrowRow = forward ? hi : lo;

  for (let r = lo; r <= hi; r += 1) paintChar(grid, r, col, "│");
  paintChar(grid, arrowRow, col, forward ? "▼" : "▲");
  if (label) paintText(grid, arrowRow, col + 2, label);
}

/**
 * Different row AND column: a straightforward Manhattan route — horizontal from `from`, one
 * bend, then vertical into `to`. Not a perfect router (it does not steer around intermediate
 * nodes), just a legible one, per spec section 3.
 */
function paintBendEdge(
  grid: CharGrid,
  from: LayoutNode,
  to: LayoutNode,
  boxWidth: number,
  label: string | undefined,
): void {
  const goingRight = to.col > from.col;
  const goingDown = to.row > from.row;
  const row = from.rowStart + 1;
  const bendCol = to.colStart + Math.floor(boxWidth / 2);
  const start = goingRight ? from.colStart + boxWidth : from.colStart - 1;
  const lo = Math.min(start, bendCol);
  const hi = Math.max(start, bendCol);

  for (let c = lo; c <= hi; c += 1) paintChar(grid, row, c, "─");
  paintInlineLabel(grid, row, lo, hi, goingRight ? 1 : -1, label);

  const corner = goingRight ? (goingDown ? "┐" : "┘") : goingDown ? "┌" : "└";
  paintChar(grid, row, bendCol, corner);

  const vStart = row + (goingDown ? 1 : -1);
  const vEnd = goingDown ? to.rowStart - 1 : to.rowStart + BOX_HEIGHT;
  const vLo = Math.min(vStart, vEnd);
  const vHi = Math.max(vStart, vEnd);
  const arrowRow = goingDown ? vHi : vLo;

  for (let r = vLo; r <= vHi; r += 1) paintChar(grid, r, bendCol, "│");
  paintChar(grid, arrowRow, bendCol, goingDown ? "▼" : "▲");
}

function paintEdge(
  grid: CharGrid,
  nodesById: Map<string, LayoutNode>,
  edge: DiagramEdge,
  boxWidth: number,
): void {
  const from = nodesById.get(edge.from);
  const to = nodesById.get(edge.to);
  if (!from || !to || from.id === to.id) return;

  const sameRow = from.row === to.row;
  const sameCol = from.col === to.col;

  if (sameRow && sameCol) return;
  if (sameRow) {
    paintHorizontalEdge(grid, from, to, boxWidth, edge.label);
    return;
  }
  if (sameCol) {
    paintVerticalEdge(grid, from, to, boxWidth, edge.label);
    return;
  }
  paintBendEdge(grid, from, to, boxWidth, edge.label);
}

/**
 * Stamps the node/edge model into a monospace character grid and returns it as `<pre>`-ready
 * text: nodes placed by `(col, row)` on a uniform grid, edges routed between them, then edges
 * are painted first and nodes painted on top so a node's box-drawing frame is never corrupted
 * by a connector passing near it.
 */
function buildDiagramText(nodes: DiagramNode[], edges: DiagramEdge[]): string {
  if (nodes.length === 0) return "";

  const minCol = Math.min(...nodes.map((node) => node.col));
  const minRow = Math.min(...nodes.map((node) => node.row));
  const maxLabelLength = Math.max(...nodes.map((node) => node.label.length));
  const innerWidth = Math.max(MIN_INNER_WIDTH, maxLabelLength + 2);
  const boxWidth = innerWidth + 2;

  const nodesById = new Map<string, LayoutNode>();
  let maxCol = 0;
  let maxRow = 0;

  for (const node of nodes) {
    const col = node.col - minCol;
    const row = node.row - minRow;
    maxCol = Math.max(maxCol, col);
    maxRow = Math.max(maxRow, row);
    nodesById.set(node.id, {
      id: node.id,
      label: node.label,
      emphasis: node.emphasis ?? false,
      col,
      row,
      colStart: col * (boxWidth + H_GAP),
      rowStart: row * (BOX_HEIGHT + V_GAP),
    });
  }

  const totalCols = maxCol * (boxWidth + H_GAP) + boxWidth;
  const totalRows = maxRow * (BOX_HEIGHT + V_GAP) + BOX_HEIGHT;
  const grid: CharGrid = Array.from({ length: totalRows }, () =>
    Array<string>(totalCols).fill(" "),
  );

  for (const edge of edges) paintEdge(grid, nodesById, edge, boxWidth);
  for (const node of nodesById.values()) paintNode(grid, node, boxWidth);

  return grid.map((line) => line.join("").replace(/\s+$/, "")).join("\n");
}

/**
 * AsciiDiagram — data-driven box-drawing architecture/flow diagram, animated with a one-shot
 * reveal on first scroll into view (spec sections 3 and 6). The signature "wow" object of the
 * commercial kit: consumers pass a node/edge model (a system architecture map, a two-door
 * layout, a data-flow chart, ...) and the component knows nothing about what any of it means.
 *
 * The grid is built by stamping fixed-size box-drawing boxes onto a monospace character grid
 * at their `(col, row)` position, then routing each edge between the two boxes it connects
 * (straight when the nodes share a row or column, a single-bend Manhattan route otherwise).
 *
 * Accessibility (spec section 3): the ASCII is never the sole carrier of information. The
 * REQUIRED `description` prop is rendered in a permanent visually-hidden element so a
 * screenreader always has the real summary; the `<pre>` grid itself is a separate `aria-hidden`
 * decorative layer — matching the kit's Typewriter/MonoStat/TerminalBlock convention.
 *
 * Motion (spec section 6): `reveal="type"` starts at the full grid (safe for SSR/first
 * paint/no-JS and for reduced motion) and is only ever reset to reveal line-by-line once
 * `useReveal` confirms the element is in view AND `animate` is true; a diagram can run to
 * hundreds of characters, so this reveals per LINE rather than per character (spec section 3
 * allows either) to keep the one-shot decode a sensible, bounded duration.
 * `reveal="draw"` fades/rises the whole grid in once instead, via CSS gated on the same
 * `revealed` signal (with a `prefers-reduced-motion` CSS fallback of its own). `reveal="none"`
 * never enters any animated branch — the grid is simply always the final, full text.
 */

/* ONE painter renders the same text at every viewport; a constrained measure is answered by
   type size, then by a reachable region, never by a second layout. */
export function AsciiDiagram({
  nodes,
  edges,
  description,
  reveal = "type",
  className,
}: AsciiDiagramProps): React.JSX.Element {
  const { ref, revealed, animate } = useReveal<HTMLDivElement>();
  const gridRef = useRef<HTMLPreElement>(null);
  const [overflowing, setOverflowing] = useState(false);
  const [fitScale, setFitScale] = useState<number | null>(null);
  const fullText = useMemo(() => buildDiagramText(nodes, edges), [nodes, edges]);
  const lineCount = useMemo(() => (fullText === "" ? 0 : fullText.split("\n").length), [fullText]);

  // Start at the final grid: safe for SSR/first paint/no-JS and for reduced motion, matching
  // the kit's Typewriter/MonoStat/TerminalBlock convention. Only ever reset to reveal
  // line-by-line once `animate` is confirmed true for a scroll-triggered "type" reveal.
  const [display, setDisplay] = useState(fullText);

  useEffect(() => {
    if (reveal !== "type" || !revealed) return;

    if (!animate) {
      setDisplay(fullText);
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const lines = fullText.split("\n");
    const stepMs = readCadenceTimeMs(ref.current, LINE_CADENCE_AXIS, LINE_STEP_MS);

    function step(count: number): void {
      if (cancelled) return;
      setDisplay(lines.slice(0, count).join("\n"));
      if (count < lines.length) {
        timer = setTimeout(() => step(count + 1), stepMs);
      }
    }

    step(0);

    return () => {
      cancelled = true;
      if (timer !== undefined) clearTimeout(timer);
    };
  }, [reveal, revealed, animate, fullText]);

  const typedText = reveal === "type" ? display : fullText;
  const settled = typedText === fullText;

  /* Gate on `settled`: a partially-typed frame measures narrower than its final self, and
     growing text inside a block box fires no ResizeObserver to correct it. */
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || !settled) return;

    const measure = (): void => {
      // Measure at natural metrics; a still-applied fit would report "fits" and ratchet down.
      grid.style.removeProperty(GRID_SIZE_AXIS);
      const available = grid.clientWidth;
      const required = grid.scrollWidth;

      if (available <= 0 || required <= available + 1) {
        setFitScale(null);
        setOverflowing(false);
        return;
      }

      const naturalPx = Number.parseFloat(getComputedStyle(grid).fontSize);
      const floor = Number.isFinite(naturalPx) && naturalPx > 0 ? MIN_FIT_PX / naturalPx : 1;
      const quantized = Math.floor((available / required) * 100) / 100;
      if (quantized < floor) {
        setFitScale(null);
        setOverflowing(true);
        return;
      }

      // Re-verify after applying: quantization can still leave a sub-pixel overflow.
      const apply = (scale: number): void => {
        // The channel name is spelled out rather than passed as an identifier:
        // an imperative `setProperty(someName, …)` is an unresolvable paint
        // site to the static census, which cannot prove the name is this
        // `--_ds-*` sizing channel and not `background`. The `satisfies` keeps
        // the two spellings welded -- renaming GRID_SIZE_AXIS fails to compile
        // here instead of silently writing a dead property.
        grid.style.setProperty(
          "--_ds-ascii-diagram-grid-size" satisfies typeof GRID_SIZE_AXIS,
          `${(NATURAL_GRID_REM * scale).toFixed(4)}rem`,
        );
      };
      apply(quantized);
      const settledScale =
        grid.scrollWidth > grid.clientWidth + 1 ? Math.max(floor, quantized - 0.01) : quantized;
      if (settledScale !== quantized) apply(settledScale);

      setFitScale(settledScale);
      setOverflowing(false);
    };
    measure();

    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(grid);
    return () => observer.disconnect();
  }, [settled, fullText]);

  const classes = ["rt-ascii-diagram", className].filter(Boolean).join(" ");

  return (
    <div
      ref={ref}
      className={classes}
      data-part="root"
      data-reveal={reveal}
      data-visible={revealed ? "true" : "false"}
      data-overflowing={overflowing ? "true" : "false"}
      data-fitted={fitScale === null ? "false" : "true"}
    >
      {/* Exactly one description carrier: the span here, or the named region below. */}
      {overflowing ? null : (
        <span className="rt-ascii-diagram__visually-hidden">{description}</span>
      )}
      <pre
        ref={gridRef}
        className="rt-ascii-diagram__grid"
        data-part="grid"
        /* role=img keeps the glyphs unvoiced while making the region nameable and focusable. */
        aria-hidden={overflowing ? undefined : "true"}
        role={overflowing ? "img" : undefined}
        aria-label={overflowing ? description : undefined}
        tabIndex={overflowing ? 0 : undefined}
        style={
          {
            minHeight: `${(lineCount * GRID_LINE_HEIGHT_REM).toFixed(4)}rem`,
            ...(fitScale === null
              ? {}
              : { [GRID_SIZE_AXIS]: `${(NATURAL_GRID_REM * fitScale).toFixed(4)}rem` }),
          } as React.CSSProperties
        }
      >
        {typedText}
      </pre>
    </div>
  );
}

export type {
  AsciiDiagramProps,
  AsciiDiagramReveal,
  DiagramEdge,
  DiagramNode,
} from '../../../foundation/contracts/content/ascii-diagram';
