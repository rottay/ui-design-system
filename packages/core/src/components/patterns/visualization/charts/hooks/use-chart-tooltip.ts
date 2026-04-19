'use client';

/**
 * @fileoverview useChartTooltip -- state manager for the {@link ChartTooltip}
 * overlay component.
 *
 * Returns `show`/`hide` callbacks, the current tooltip props object ready to
 * spread into `<ChartTooltip>`, and a `containerRef` that must be attached to
 * the chart's wrapping element so that mouse coordinates are correctly
 * translated from page-space to container-relative space.
 *
 * @example
 * ```tsx
 * const { show, hide, tooltipProps, containerRef } = useChartTooltip();
 *
 * return (
 *   <div ref={containerRef} style={{ position: 'relative' }}>
 *     <svg>
 *       <rect
 *         onMouseEnter={(e) => {
 *           const rect = containerRef.current!.getBoundingClientRect();
 *           show(e.clientX - rect.left, e.clientY - rect.top, <span>Hello</span>);
 *         }}
 *         onMouseLeave={() => hide()}
 *       />
 *     </svg>
 *     <ChartTooltip {...tooltipProps} />
 *   </div>
 * );
 * ```
 */

import { useCallback, useRef, useState, type ReactNode } from 'react';

import type { ChartTooltipProps } from '../tooltip';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseChartTooltipReturn {
  /** Show tooltip at position (relative to container) with the given content. */
  show: (x: number, y: number, content: ReactNode) => void;
  /** Hide tooltip. */
  hide: () => void;
  /** Current tooltip state -- spread directly into `<ChartTooltip>`. */
  tooltipProps: ChartTooltipProps;
  /** Ref to attach to the chart container for coordinate translation. */
  containerRef: React.RefObject<HTMLDivElement | null>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Manages tooltip show/hide state and provides a clean API for chart components
 * to integrate the {@link ChartTooltip} overlay.
 *
 * The returned `containerRef` should be placed on the outermost chart wrapper
 * so that `show(x, y, content)` receives container-relative coordinates. Charts
 * that use `ChartScaffold` already have a `containerRef` -- in that case, share
 * the same ref or compute the offset from the scaffold container.
 *
 * @returns An object with `show`, `hide`, `tooltipProps`, and `containerRef`.
 */
export function useChartTooltip(): UseChartTooltipReturn {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [state, setState] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: ReactNode;
  }>({
    visible: false,
    x: 0,
    y: 0,
    content: null,
  });

  const show = useCallback((x: number, y: number, content: ReactNode) => {
    setState({ visible: true, x, y, content });
  }, []);

  const hide = useCallback(() => {
    setState((prev) => ({ ...prev, visible: false }));
  }, []);

  const tooltipProps: ChartTooltipProps = {
    visible: state.visible,
    x: state.x,
    y: state.y,
    children: state.content,
  };

  return { show, hide, tooltipProps, containerRef };
}
