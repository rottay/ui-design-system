'use client';

/**
 * @fileoverview ChartTooltip -- Rich HTML tooltip overlay for D3-backed charts.
 *
 * Replaces basic SVG `<title>` tooltips with a positioned `<div>` that renders
 * arbitrary React content. The overlay sits inside the chart container with
 * `position: absolute` and auto-flips horizontally/vertically when the tooltip
 * would overflow the container edges.
 *
 * Also exports two pre-built content components:
 * - `TooltipValue` -- single label+value row with optional color swatch.
 * - `TooltipSeries` -- multi-series list with colored swatches per item.
 *
 * @example
 * ```tsx
 * const { show, hide, tooltipProps, containerRef } = useChartTooltip();
 *
 * return (
 *   <div ref={containerRef} style={{ position: 'relative' }}>
 *     <svg onMouseMove={(e) => show(e.clientX, e.clientY, <TooltipValue label="Revenue" value={420} />)} />
 *     <ChartTooltip {...tooltipProps} />
 *   </div>
 * );
 * ```
 */

import React, { useRef, useLayoutEffect, useState, type CSSProperties } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ChartTooltipProps {
  /** Whether tooltip is visible */
  visible: boolean;
  /** Position relative to chart container (px) */
  x: number;
  /** Position relative to chart container (px) */
  y: number;
  /** Content to render inside the tooltip */
  children: React.ReactNode;
  /** Auto-flip when near container edge. Default: true */
  autoFlip?: boolean;
  /** Offset from cursor in pixels. Default: 12 */
  offset?: number;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const TOOLTIP_STYLE: CSSProperties = {
  position: 'absolute',
  pointerEvents: 'none',
  zIndex: 10,
  background: 'var(--ds-color-bg-elevated)',
  border: '1px solid var(--ds-color-border)',
  color: 'var(--ds-color-text-primary)',
  boxShadow: 'var(--ds-shadow-lg)',
  borderRadius: 'var(--ds-radius-md)',
  padding: '8px 12px',
  fontSize: 12,
  maxWidth: 280,
  whiteSpace: 'nowrap',
  transition: 'opacity var(--ds-motion-fast) var(--ds-motion-ease-out)',
};

// ---------------------------------------------------------------------------
// ChartTooltip
// ---------------------------------------------------------------------------

/**
 * Positioned HTML tooltip overlay rendered inside a chart container.
 *
 * The component measures its own dimensions after render and adjusts placement
 * so the tooltip stays within the parent container bounds. When `autoFlip` is
 * enabled (default), the tooltip flips to the opposite side of the cursor if
 * it would otherwise overflow.
 *
 * Set `pointer-events: none` so the overlay never intercepts mouse events
 * intended for the underlying chart SVG.
 *
 * @param props - See {@link ChartTooltipProps}.
 */
export function ChartTooltip({
  visible,
  x,
  y,
  children,
  autoFlip = true,
  offset = 12,
}: ChartTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [adjusted, setAdjusted] = useState<{ left: number; top: number }>({ left: x + offset, top: y + offset });

  // Measure tooltip dimensions after paint and adjust position so it stays
  // within the parent container. useLayoutEffect runs synchronously before
  // the browser paints, preventing a visible "jump" on the first frame.
  useLayoutEffect(() => {
    if (!visible || !tooltipRef.current) return;

    const el = tooltipRef.current;
    const parent = el.parentElement;
    if (!parent) return;

    const parentRect = parent.getBoundingClientRect();
    const elWidth = el.offsetWidth;
    const elHeight = el.offsetHeight;

    let left = x + offset;
    let top = y + offset;

    if (autoFlip) {
      // Flip horizontally when tooltip would exceed the right edge.
      if (left + elWidth > parentRect.width) {
        left = x - elWidth - offset;
      }
      // Clamp to left edge.
      if (left < 0) {
        left = 0;
      }

      // Flip vertically when tooltip would exceed the bottom edge.
      if (top + elHeight > parentRect.height) {
        top = y - elHeight - offset;
      }
      // Clamp to top edge.
      if (top < 0) {
        top = 0;
      }
    }

    setAdjusted({ left, top });
  }, [visible, x, y, offset, autoFlip]);

  return (
    <div
      ref={tooltipRef}
      style={{
        ...TOOLTIP_STYLE,
        left: adjusted.left,
        top: adjusted.top,
        opacity: visible ? 1 : 0,
        visibility: visible ? 'visible' : 'hidden',
      }}
      role="tooltip"
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pre-built tooltip content components
// ---------------------------------------------------------------------------

/** Styles for the color swatch shown next to tooltip values. */
const SWATCH_STYLE: CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: '50%',
  display: 'inline-block',
  flexShrink: 0,
};

/**
 * Simple single-value tooltip row with an optional color swatch.
 *
 * @example
 * ```tsx
 * <TooltipValue label="Revenue" value="$4,200" color="var(--ds-color-primary-500)" />
 * ```
 */
export function TooltipValue({
  label,
  value,
  color,
}: {
  /** Descriptive label (e.g. category name, series name) */
  label: string;
  /** Formatted display value */
  value: string | number;
  /** Optional color swatch shown before the label */
  color?: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {color ? <span style={{ ...SWATCH_STYLE, backgroundColor: color }} /> : null}
      <span style={{ color: 'var(--ds-color-text-secondary)' }}>{label}</span>
      <span className="ds-nums-tabular" style={{ marginLeft: 'auto', fontWeight: 600, paddingLeft: 12 }}>{value}</span>
    </div>
  );
}

/**
 * Multi-series tooltip showing a list of name/value pairs with color swatches.
 *
 * @example
 * ```tsx
 * <TooltipSeries
 *   title="Q1 2026"
 *   items={[
 *     { name: 'Revenue', value: '$4,200', color: 'var(--ds-color-primary-500)' },
 *     { name: 'Expenses', value: '$2,100', color: 'var(--ds-color-error-500)' },
 *   ]}
 * />
 * ```
 */
export function TooltipSeries({
  title,
  items,
}: {
  /** Optional header text shown above the series list */
  title?: string;
  /** Array of series entries to display */
  items: Array<{ name: string; value: string | number; color: string }>;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {title ? (
        <div
          style={{
            fontWeight: 600,
            marginBottom: 2,
            color: 'var(--ds-color-text-primary)',
          }}
        >
          {title}
        </div>
      ) : null}
      {items.map((item, index) => (
        <div
          // `name` is not guaranteed unique -- compact mode (crosshair tooltips)
          // renders every row with an empty name, swatch-only.
          key={`${item.name}-${index}`}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <span style={{ ...SWATCH_STYLE, backgroundColor: item.color }} />
          <span style={{ color: 'var(--ds-color-text-secondary)' }}>{item.name}</span>
          <span className="ds-nums-tabular" style={{ marginLeft: 'auto', fontWeight: 600, paddingLeft: 12 }}>{item.value}</span>
        </div>
      ))}
    </div>
  );
}
