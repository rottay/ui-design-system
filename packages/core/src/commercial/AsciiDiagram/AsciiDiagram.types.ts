/**
 * A single box in the diagram, placed on the monospace layout grid by `(col, row)`.
 */
export interface DiagramNode {
  /** Stable identifier referenced by `DiagramEdge.from` / `DiagramEdge.to`. */
  id: string;
  /** Text rendered inside the box. */
  label: string;
  /** Column position on the layout grid. Any integer; positions are normalized internally. */
  col: number;
  /** Row position on the layout grid. Any integer; positions are normalized internally. */
  row: number;
  /** Renders with double-line box-drawing (`╔═╗`) instead of single-line (`┌─┐`). */
  emphasis?: boolean;
}

/**
 * A directed connector between two nodes, routed as a box-drawing line across the grid.
 */
export interface DiagramEdge {
  /** `DiagramNode.id` the edge starts from. */
  from: string;
  /** `DiagramNode.id` the edge points to. */
  to: string;
  /** Optional caption set inline on the connector, where the route has room for it. */
  label?: string;
}

/**
 * Reveal behavior on first scroll into view (spec sections 3 and 6).
 *
 * `type` wipes the grid in line-by-line, once (a "decode" read); `draw` fades/rises the whole
 * grid in at once; `none` renders statically with no scroll-gating.
 */
export type AsciiDiagramReveal = "type" | "draw" | "none";

export interface AsciiDiagramProps {
  /** Boxes placed on the layout grid. */
  nodes: DiagramNode[];
  /** Connectors routed between boxes. */
  edges: DiagramEdge[];
  /**
   * REQUIRED accessible summary of what the diagram shows. The ASCII grid is decorative
   * (`aria-hidden`) — this description is the sole information carrier for a screenreader;
   * the ASCII is never the only carrier of information (spec section 3).
   */
  description: string;
  /** One-shot reveal mode on first scroll into view. Defaults to `"type"`. */
  reveal?: AsciiDiagramReveal;
  /** Extra class names on the diagram container. */
  className?: string;
}
