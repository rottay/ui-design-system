'use client';

/**
 * @fileoverview Splitter Modern Engine - Rottay Design System
 * @description Modern (token-driven) implementation of the Splitter compound component.
 * Uses Tailwind CSS utilities with custom mouse event handling for drag-to-resize.
 *
 * @remarks
 * The Modern engine provides:
 * - Tailwind CSS styled panels with `flex` layout
 * - Custom gutter with DS token surface and primary color styling
 * - Mouse event-based drag handling for resizing
 * - Percentage-based panel sizing
 * - Size constraints via min/max props
 *
 * Implementation details:
 * - Panels use `flex: 0 0 {size}%` for sizing
 * - Gutter changes cursor based on layout direction
 * - Uses React refs for container measurements
 * - Clones children to inject calculated sizes
 *
 * @example Using Modern Engine
 * ```tsx
 * import { Splitter } from '@rottay/design-system';
 *
 * // Tailwind-styled splitter
 * <Splitter engine="modern" layout="vertical">
 *   <Splitter.Panel engine="modern" defaultSize={40}>
 *     Top Panel
 *   </Splitter.Panel>
 *   <Splitter.Panel engine="modern">
 *     Bottom Panel
 *   </Splitter.Panel>
 * </Splitter>
 * ```
 *
 * @see {@link Splitter} - The main engine-aware component
 * @module Splitter/Engines/Modern
 * @category Layout
 * @package @rottay/design-system
 */
import React, { useState, useRef, useCallback, Children, cloneElement, isValidElement } from 'react';
import { arrayValueAt } from '@/_internal/utils/collections';
import type { SplitterProps, SplitterPanelProps } from '../Splitter.types';
import { SPLITTER_DEFAULTS } from '../Splitter.types';

/**
 * Modern engine implementation of the Splitter.Panel sub-component.
 * Uses percentage-based `flex: 0 0 {size}%` to size each panel, with
 * min/max constraints clamped in the 0-100 percentage range.
 * The `size` prop is injected at runtime by the parent Splitter via cloneElement.
 *
 * @param props - Panel configuration plus injected `size` percentage
 * @returns A Tailwind-styled div acting as a resizable panel
 */
export const Panel = React.forwardRef<HTMLDivElement, SplitterPanelProps & { size?: number }>(
  (props, ref) => {
    const { size, min, max, children, className = '', style } = props;

    // Normalize min/max to numeric percentages; default to the full 0-100 range
    // so panels without constraints behave naturally.
    const minSize = typeof min === 'number' ? min : 0;
    const maxSize = typeof max === 'number' ? max : 100;
    const clampedSize = Math.min(Math.max(size ?? 50, minSize), maxSize);

    return (
      <div
        ref={ref}
        className={`overflow-auto ${className}`}
        data-part="panel"
        style={{
          flex: `0 0 ${clampedSize}%`,
          // Prevent content from forcing the panel wider than its flex-basis
          minWidth: 0,
          minHeight: 0,
          ...style,
        }}
      >
        {children}
      </div>
    );
  }
);
Panel.displayName = 'Splitter.Panel.Modern';

/**
 * Modern engine implementation of the Splitter container.
 * Manages panel sizes via React state and handles drag-to-resize through
 * document-level mouse events. Gutter elements are styled with DS token inline
 * styles (--ds-surface-panel, --ds-color-primary on hover) for consistent theming.
 *
 * @param props - Splitter configuration (layout direction, resize callbacks)
 * @returns A flex container with interleaved gutter drag handles
 */
export const Splitter = React.forwardRef<HTMLDivElement, SplitterProps>(
  (props, ref) => {
    const {
      layout = SPLITTER_DEFAULTS.layout,
      onResize,
      onResizeStart,
      onResizeEnd,
      children,
      className = '',
      style,
    } = props;

    const containerRef = useRef<HTMLDivElement>(null);

    // Initialize each panel to an equal share of the container (100 / N percent)
    const [sizes, setSizes] = useState<number[]>(() => {
      const childCount = Children.count(children);
      return Array(childCount).fill(100 / childCount);
    });
    const isDragging = useRef(false);
    const activeGutter = useRef<number>(-1);
    // Reactive mirror of activeGutter, purely for the data-dragging anatomy
    // attribute below -- the drag math itself still reads the ref.
    const [draggingIndex, setDraggingIndex] = useState<number>(-1);

    const isVertical = layout === 'vertical';

    // Returns a mousedown handler bound to a specific gutter index.
    // On mousedown, document-level listeners are attached to track the drag
    // and cleaned up on mouseup to avoid stale handlers.
    const handleMouseDown = useCallback((index: number) => (e: React.MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;
      activeGutter.current = index;
      setDraggingIndex(index);
      onResizeStart?.();

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!isDragging.current || !containerRef.current) return;

        // Convert the mouse position to a percentage of the container's total dimension
        const rect = containerRef.current.getBoundingClientRect();
        const totalSize = isVertical ? rect.height : rect.width;
        const offset = isVertical
          ? moveEvent.clientY - rect.top
          : moveEvent.clientX - rect.left;
        const percentage = (offset / totalSize) * 100;

        setSizes((prevSizes: number[]) => {
          const newSizes = [...prevSizes];
          // Calculate how far the gutter has moved relative to the cumulative
          // size of all panels before (and including) the active one
          const beforeSum = prevSizes.slice(0, activeGutter.current + 1).reduce((a, b) => a + b, 0);
          const diff = percentage - beforeSum;

          // Redistribute the delta between the two adjacent panels, ensuring
          // neither panel goes below 0% (negative sizes cause layout collapse)
          if (activeGutter.current < newSizes.length - 1) {
            newSizes[activeGutter.current] = Math.max(0, prevSizes[activeGutter.current] + diff);
            newSizes[activeGutter.current + 1] = Math.max(0, prevSizes[activeGutter.current + 1] - diff);
          }

          onResize?.(newSizes);
          return newSizes;
        });
      };

      const handleMouseUp = () => {
        if (isDragging.current) {
          isDragging.current = false;
          setDraggingIndex(-1);
          onResizeEnd?.(sizes);
        }
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }, [isVertical, onResize, onResizeEnd, onResizeStart, sizes]);

    const childArray = Children.toArray(children);

    return (
      <div
        // Merge the internal containerRef with the forwarded ref so both
        // the resize logic and the consumer can access the DOM node.
        ref={(node) => {
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={`rottay-splitter rottay-splitter--modern flex ${isVertical ? 'flex-col' : 'flex-row'} w-full h-full ${className}`}
        style={style}
        data-part="root"
        data-orientation={isVertical ? 'vertical' : 'horizontal'}
      >
        {childArray.map((child, index) => (
          <React.Fragment key={index}>
            {/* Inject the calculated size percentage into each Panel child */}
            {isValidElement(child)
              ? cloneElement(child as React.ReactElement<SplitterPanelProps & { size?: number }>, { size: arrayValueAt(sizes, index) })
              : child}
            {/* Render a gutter drag handle between each pair of panels */}
            {index < childArray.length - 1 && (
              <div
                className={`flex-shrink-0 transition-colors ${
                  isVertical ? 'h-2 cursor-row-resize' : 'w-2 cursor-col-resize'
                }`}
                onMouseDown={handleMouseDown(index)}
                data-part="gutter"
                data-orientation={isVertical ? 'vertical' : 'horizontal'}
                data-dragging={draggingIndex === index ? 'true' : 'false'}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }
);
Splitter.displayName = 'Splitter.Modern';

export default Splitter;
