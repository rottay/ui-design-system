'use client';

/**
 * @fileoverview useChartBrush hook -- provides a brush/zoom interaction for
 * time-series charts. Renders a draggable brush overlay at the bottom of the
 * chart SVG that lets users select a horizontal range. The selection is
 * reported as data-domain values (via an optional xScale inversion) or as
 * raw pixel positions.
 *
 * Implemented as pure React state + SVG elements with no d3.brush dependency.
 * Mouse and pointer events are tracked on the brush area rect; selection,
 * handles, and dimming overlays are rendered as SVG elements returned by
 * `renderBrush()`.
 *
 * @example
 * ```tsx
 * const brush = useChartBrush({
 *   svgRef,
 *   width: 800,
 *   height: 400,
 *   margin: { top: 20, right: 20, bottom: 40, left: 50 },
 *   xScale: myD3Scale,
 *   enabled: true,
 *   onBrushEnd: (sel) => setDomain(sel),
 * });
 *
 * return (
 *   <svg ref={svgRef} width={800} height={400 + 50}>
 *     {/* main chart content *\/}
 *     {brush.renderBrush()}
 *   </svg>
 * );
 * ```
 */

import {
  createElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BrushSelection {
  /** Start index or value (always <= end) */
  start: number;
  /** End index or value (always >= start) */
  end: number;
}

export interface UseChartBrushOptions {
  /** SVG ref to attach brush event listeners to */
  svgRef: React.RefObject<SVGSVGElement | null>;
  /** Total chart width (including margins) */
  width: number;
  /** Total chart height (including margins, excluding brush area) */
  height: number;
  /** Chart margins around the plot area */
  margin: { top: number; right: number; bottom: number; left: number };
  /**
   * D3 scale for the x-axis. When provided, pixel positions are inverted
   * to data-domain values via `scale.invert()`. When omitted, the selection
   * reports raw pixel offsets relative to the plot area left edge.
   */
  xScale?: { invert?: (px: number) => number };
  /** Called continuously while the user drags the brush */
  onBrush?: (selection: BrushSelection | null) => void;
  /** Called once when the user releases the mouse after dragging */
  onBrushEnd?: (selection: BrushSelection | null) => void;
  /** Enable or disable the brush interaction. Default: false */
  enabled?: boolean;
  /** Height of the brush overlay area in pixels. Default: 30 */
  brushHeight?: number;
}

export interface UseChartBrushReturn {
  /** Whether the user is currently dragging a brush selection */
  isBrushing: boolean;
  /** Current selection in data coordinates (null when nothing is selected) */
  selection: BrushSelection | null;
  /** Programmatically clear the current brush selection */
  clear: () => void;
  /** Render function -- call inside the SVG to draw the brush overlay */
  renderBrush: () => React.ReactNode;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Pixel width of the drag handles on each edge of the selection */
const HANDLE_WIDTH = 6;

/** Minimum drag distance in pixels before a selection is created */
const MIN_DRAG_PX = 4;

// ---------------------------------------------------------------------------
// CSS variable references for brush visuals
// ---------------------------------------------------------------------------

const BRUSH_COLORS = {
  /** Selection rectangle fill */
  selectionFill: 'var(--ds-color-primary)',
  /** Drag handle fill */
  handleFill: 'var(--ds-color-primary)',
  /** Dimmed (non-selected) overlay fill */
  dimFill: 'var(--ds-color-bg-primary)',
  /** Brush area border */
  borderStroke: 'var(--ds-color-border-subtle)',
} as const;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Provides a brush/zoom interaction for time-series chart SVGs.
 *
 * Attach the returned `renderBrush()` output inside your `<svg>` element to
 * draw a brush overlay area below the main chart. The user can click-and-drag
 * to create a selection, drag the selection edges to resize, or double-click
 * to clear.
 *
 * @param options - Configuration for the brush interaction.
 * @returns Brush state and a render function for the SVG overlay.
 */
export function useChartBrush(options: UseChartBrushOptions): UseChartBrushReturn {
  const {
    svgRef,
    width,
    height,
    margin,
    xScale,
    onBrush,
    onBrushEnd,
    enabled = false,
    brushHeight = 30,
  } = options;

  // -- Internal state -------------------------------------------------------

  /** Pixel-space selection within the brush area (left, right relative to plot left) */
  const [pixelSelection, setPixelSelection] = useState<{ left: number; right: number } | null>(null);

  /** Whether the user is actively dragging */
  const [isBrushing, setIsBrushing] = useState(false);

  /** Drag origin and mode tracked via ref to avoid stale closures in listeners */
  const dragRef = useRef<{
    mode: 'create' | 'move' | 'resize-left' | 'resize-right';
    startX: number;
    /** Snapshot of pixelSelection at drag start (for move/resize) */
    initialSelection: { left: number; right: number } | null;
  } | null>(null);

  // Stable refs for callbacks to avoid re-attaching listeners on every render
  const onBrushRef = useRef(onBrush);
  onBrushRef.current = onBrush;
  const onBrushEndRef = useRef(onBrushEnd);
  onBrushEndRef.current = onBrushEnd;
  const pixelSelectionRef = useRef(pixelSelection);
  pixelSelectionRef.current = pixelSelection;

  // -- Derived geometry -----------------------------------------------------

  const plotLeft = margin.left;
  const plotWidth = Math.max(0, width - margin.left - margin.right);
  /** Y offset where the brush area starts (below the main chart) */
  const brushY = height;
  const brushAreaHeight = brushHeight;

  // -- Helpers --------------------------------------------------------------

  /** Convert pixel offset (relative to plot left) to data value via xScale */
  const pxToValue = useCallback(
    (px: number): number => {
      if (xScale?.invert) {
        return xScale.invert(px) as number;
      }
      return px;
    },
    [xScale],
  );

  /** Build a BrushSelection from pixel-space left/right */
  const toSelection = useCallback(
    (pxSel: { left: number; right: number }): BrushSelection => {
      const startVal = pxToValue(pxSel.left);
      const endVal = pxToValue(pxSel.right);
      return {
        start: Math.min(startVal, endVal),
        end: Math.max(startVal, endVal),
      };
    },
    [pxToValue],
  );

  /** Clamp a pixel value to the plot area bounds */
  const clampPx = useCallback(
    (px: number): number => Math.max(0, Math.min(plotWidth, px)),
    [plotWidth],
  );

  /** Convert a page-X coordinate from a mouse/pointer event to brush-local px */
  const eventToPx = useCallback(
    (pageX: number): number => {
      const svg = svgRef.current;
      if (!svg) return 0;
      const rect = svg.getBoundingClientRect();
      return clampPx(pageX - rect.left - plotLeft);
    },
    [svgRef, plotLeft, clampPx],
  );

  // -- Data-domain selection (exposed to consumers) -------------------------

  const selection = useMemo<BrushSelection | null>(() => {
    if (!pixelSelection) return null;
    return toSelection(pixelSelection);
  }, [pixelSelection, toSelection]);

  // -- Clear ----------------------------------------------------------------

  const clear = useCallback(() => {
    setPixelSelection(null);
    setIsBrushing(false);
    dragRef.current = null;
    onBrushRef.current?.(null);
    onBrushEndRef.current?.(null);
  }, []);

  // -- Pointer event handlers -----------------------------------------------

  /**
   * Determine the drag mode based on where the user clicked relative to
   * the current selection.
   */
  const getDragMode = useCallback(
    (px: number, sel: { left: number; right: number } | null): 'create' | 'move' | 'resize-left' | 'resize-right' => {
      if (!sel) return 'create';
      const distLeft = Math.abs(px - sel.left);
      const distRight = Math.abs(px - sel.right);
      if (distLeft <= HANDLE_WIDTH + 2) return 'resize-left';
      if (distRight <= HANDLE_WIDTH + 2) return 'resize-right';
      if (px > sel.left && px < sel.right) return 'move';
      return 'create';
    },
    [],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<SVGRectElement>) => {
      if (!enabled) return;
      e.preventDefault();
      (e.target as SVGRectElement).setPointerCapture(e.pointerId);

      const px = eventToPx(e.clientX);
      const currentSel = pixelSelectionRef.current;
      const mode = getDragMode(px, currentSel);

      dragRef.current = {
        mode,
        startX: px,
        initialSelection: currentSel ? { ...currentSel } : null,
      };

      if (mode === 'create') {
        setPixelSelection({ left: px, right: px });
      }

      setIsBrushing(true);
    },
    [enabled, eventToPx, getDragMode],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGRectElement>) => {
      const drag = dragRef.current;
      if (!drag || !enabled) return;

      const px = eventToPx(e.clientX);

      let newSel: { left: number; right: number };

      switch (drag.mode) {
        case 'create': {
          const left = Math.min(drag.startX, px);
          const right = Math.max(drag.startX, px);
          newSel = { left: clampPx(left), right: clampPx(right) };
          break;
        }
        case 'move': {
          const init = drag.initialSelection;
          if (!init) return;
          const delta = px - drag.startX;
          let newLeft = init.left + delta;
          let newRight = init.right + delta;
          // Keep within bounds
          if (newLeft < 0) {
            newRight -= newLeft;
            newLeft = 0;
          }
          if (newRight > plotWidth) {
            newLeft -= newRight - plotWidth;
            newRight = plotWidth;
          }
          newSel = { left: clampPx(newLeft), right: clampPx(newRight) };
          break;
        }
        case 'resize-left': {
          const init = drag.initialSelection;
          if (!init) return;
          newSel = { left: clampPx(px), right: init.right };
          // Swap if crossed over
          if (newSel.left > newSel.right) {
            newSel = { left: newSel.right, right: newSel.left };
          }
          break;
        }
        case 'resize-right': {
          const init = drag.initialSelection;
          if (!init) return;
          newSel = { left: init.left, right: clampPx(px) };
          if (newSel.left > newSel.right) {
            newSel = { left: newSel.right, right: newSel.left };
          }
          break;
        }
        default:
          return;
      }

      setPixelSelection(newSel);
      onBrushRef.current?.(toSelection(newSel));
    },
    [enabled, eventToPx, clampPx, plotWidth, toSelection],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<SVGRectElement>) => {
      (e.target as SVGRectElement).releasePointerCapture(e.pointerId);
      const drag = dragRef.current;
      dragRef.current = null;
      setIsBrushing(false);

      if (!drag) return;

      const currentSel = pixelSelectionRef.current;

      // Discard selections that are too small (accidental clicks)
      if (currentSel && currentSel.right - currentSel.left < MIN_DRAG_PX) {
        setPixelSelection(null);
        onBrushEndRef.current?.(null);
        return;
      }

      if (currentSel) {
        onBrushEndRef.current?.(toSelection(currentSel));
      } else {
        onBrushEndRef.current?.(null);
      }
    },
    [toSelection],
  );

  /** Double-click to clear the selection */
  const handleDoubleClick = useCallback(() => {
    clear();
  }, [clear]);

  // -- Clear selection when brush is disabled -------------------------------

  useEffect(() => {
    if (!enabled && pixelSelection) {
      setPixelSelection(null);
      setIsBrushing(false);
      dragRef.current = null;
    }
  }, [enabled, pixelSelection]);

  // -- Render function ------------------------------------------------------

  const renderBrush = useCallback((): React.ReactNode => {
    if (!enabled) return null;

    const children: React.ReactElement[] = [];

    // Brush area background
    children.push(
      createElement('rect', {
        key: 'brush-bg',
        x: plotLeft,
        y: brushY,
        width: plotWidth,
        height: brushAreaHeight,
        fill: 'var(--ds-color-bg-secondary, #f5f5f5)',
        stroke: BRUSH_COLORS.borderStroke,
        strokeWidth: 1,
      }),
    );

    // Separator line between chart and brush
    children.push(
      createElement('line', {
        key: 'brush-separator',
        x1: plotLeft,
        y1: brushY,
        x2: plotLeft + plotWidth,
        y2: brushY,
        stroke: BRUSH_COLORS.borderStroke,
        strokeWidth: 1,
      }),
    );

    if (pixelSelection) {
      const selLeft = pixelSelection.left + plotLeft;
      const selWidth = pixelSelection.right - pixelSelection.left;

      // Left dimmed area
      if (pixelSelection.left > 0) {
        children.push(
          createElement('rect', {
            key: 'dim-left',
            x: plotLeft,
            y: brushY,
            width: pixelSelection.left,
            height: brushAreaHeight,
            fill: BRUSH_COLORS.dimFill,
            opacity: 0.5,
            pointerEvents: 'none',
          }),
        );
      }

      // Right dimmed area
      if (pixelSelection.right < plotWidth) {
        children.push(
          createElement('rect', {
            key: 'dim-right',
            x: plotLeft + pixelSelection.right,
            y: brushY,
            width: plotWidth - pixelSelection.right,
            height: brushAreaHeight,
            fill: BRUSH_COLORS.dimFill,
            opacity: 0.5,
            pointerEvents: 'none',
          }),
        );
      }

      // Selection highlight
      children.push(
        createElement('rect', {
          key: 'selection',
          x: selLeft,
          y: brushY,
          width: Math.max(selWidth, 1),
          height: brushAreaHeight,
          fill: BRUSH_COLORS.selectionFill,
          opacity: 0.2,
          pointerEvents: 'none',
        }),
      );

      // Selection border (top and bottom)
      children.push(
        createElement('rect', {
          key: 'selection-border',
          x: selLeft,
          y: brushY,
          width: Math.max(selWidth, 1),
          height: brushAreaHeight,
          fill: 'none',
          stroke: BRUSH_COLORS.selectionFill,
          strokeWidth: 1,
          opacity: 0.6,
          pointerEvents: 'none',
        }),
      );

      // Left handle
      children.push(
        createElement('rect', {
          key: 'handle-left',
          x: selLeft - HANDLE_WIDTH / 2,
          y: brushY + 4,
          width: HANDLE_WIDTH,
          height: brushAreaHeight - 8,
          rx: 2,
          fill: BRUSH_COLORS.handleFill,
          opacity: 0.8,
          pointerEvents: 'none',
          style: { cursor: 'ew-resize' },
        }),
      );

      // Right handle
      children.push(
        createElement('rect', {
          key: 'handle-right',
          x: selLeft + selWidth - HANDLE_WIDTH / 2,
          y: brushY + 4,
          width: HANDLE_WIDTH,
          height: brushAreaHeight - 8,
          rx: 2,
          fill: BRUSH_COLORS.handleFill,
          opacity: 0.8,
          pointerEvents: 'none',
          style: { cursor: 'ew-resize' },
        }),
      );
    }

    // Invisible interaction rect on top of everything -- captures all pointer events
    children.push(
      createElement('rect', {
        key: 'brush-interaction',
        x: plotLeft,
        y: brushY,
        width: plotWidth,
        height: brushAreaHeight,
        fill: 'transparent',
        style: {
          cursor: isBrushing
            ? 'grabbing'
            : pixelSelection
              ? 'grab'
              : 'crosshair',
        },
        onPointerDown: handlePointerDown,
        onPointerMove: handlePointerMove,
        onPointerUp: handlePointerUp,
        onDoubleClick: handleDoubleClick,
      }),
    );

    return createElement('g', { key: 'chart-brush-group', 'data-testid': 'chart-brush' }, ...children);
  }, [
    enabled,
    plotLeft,
    plotWidth,
    brushY,
    brushAreaHeight,
    pixelSelection,
    isBrushing,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleDoubleClick,
  ]);

  return {
    isBrushing,
    selection,
    clear,
    renderBrush,
  };
}
