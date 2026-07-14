'use client';

/**
 * @fileoverview Splitter Rustic Engine - Rottay Design System
 * @description Rustic (Pure HTML/CSS) implementation of the Splitter compound component.
 * Uses inline CSS styles with custom mouse event handling for drag-to-resize.
 *
 * @remarks
 * The Rustic engine provides:
 * - Pure inline CSS with flexbox layout
 * - Custom gutter with hover state highlighting
 * - Mouse event-based drag handling for resizing
 * - Percentage-based panel sizing
 * - Size constraints via min/max props
 *
 * Implementation details:
 * - Container uses `display: flex` with configurable direction
 * - Panels use `flex: 0 0 {size}%` for sizing
 * - Gutter styled with light gray background, blue on hover
 * - Uses React refs for container measurements
 * - Clones children to inject calculated sizes
 *
 * This implementation is ideal for:
 * - Embedded applications without CSS framework dependencies
 * - Server-side rendering without CSS extraction
 * - Maximum browser compatibility scenarios
 *
 * @example Using Rustic Engine
 * ```tsx
 * import { Splitter } from '@rottay/design-system';
 *
 * // Pure inline CSS splitter
 * <Splitter engine="rustic" layout="horizontal">
 *   <Splitter.Panel engine="rustic" defaultSize={25}>
 *     Left Panel
 *   </Splitter.Panel>
 *   <Splitter.Panel engine="rustic">
 *     Right Panel
 *   </Splitter.Panel>
 * </Splitter>
 * ```
 *
 * @see {@link Splitter} - The main engine-aware component
 * @module Splitter/Engines/Rustic
 * @category Layout
 * @package @rottay/design-system
 */
import React, { useState, useRef, useCallback, Children, cloneElement, isValidElement } from 'react';
import type { SplitterProps, SplitterPanelProps } from '../Splitter.types';
import { SPLITTER_DEFAULTS } from '../Splitter.types';

/**
 * Precomputed inline style objects for the Rustic engine.
 * Uses CSS custom properties (--ds-splitter-*) with hardcoded fallbacks so
 * the component works even when the DS theme tokens are not loaded. Gutter
 * background (rest + hover) lives in `engines/rustic/skin/splitter.css`,
 * keyed on `[data-part='gutter']` and `:hover`.
 */
const styles = {
  container: {
    display: 'flex',
    width: '100%',
    height: '100%',
  } as React.CSSProperties,
  panel: {
    overflow: 'auto',
    minWidth: 0,
    minHeight: 0,
  } as React.CSSProperties,
  gutter: {
    flexShrink: 0,
    transition: 'background-color 0.2s',
  } as React.CSSProperties,
  gutterHorizontal: {
    width: 'var(--ds-splitter-gutter-size, 8px)',
    cursor: 'col-resize',
  } as React.CSSProperties,
  gutterVertical: {
    height: 'var(--ds-splitter-gutter-size, 8px)',
    cursor: 'row-resize',
  } as React.CSSProperties,
};

/**
 * Rustic engine implementation of the Splitter.Panel sub-component.
 * Uses percentage-based `flex: 0 0 {size}%` sizing with inline styles only.
 * The `size` prop is injected by the parent Splitter via cloneElement.
 *
 * @param props - Panel configuration plus injected `size` percentage
 * @returns A dependency-free div acting as a resizable panel
 */
export const Panel = React.forwardRef<HTMLDivElement, SplitterPanelProps & { size?: number }>(
  (props, ref) => {
    const { size, min, max, children, className, style } = props;

    // Clamp size within min/max bounds, defaulting to the full 0-100 range
    const minSize = typeof min === 'number' ? min : 0;
    const maxSize = typeof max === 'number' ? max : 100;
    const clampedSize = Math.min(Math.max(size ?? 50, minSize), maxSize);

    return (
      <div
        ref={ref}
        className={className}
        data-part="panel"
        style={{
          ...styles.panel,
          flex: `0 0 ${clampedSize}%`,
          ...style,
        }}
      >
        {children}
      </div>
    );
  }
);
Panel.displayName = 'Splitter.Panel.Rustic';

/**
 * Rustic engine implementation of the Splitter container.
 * Implements drag-to-resize with document-level mouse events and pure inline
 * CSS. The gutter's hover highlight is a `:hover` rule in
 * `engines/rustic/skin/splitter.css`, keyed on the same `[data-part='gutter']`
 * element the drag handler is bound to.
 *
 * @param props - Splitter configuration (layout direction, resize callbacks)
 * @returns A pure inline-CSS flex container with interleaved drag handles
 */
export const Splitter = React.forwardRef<HTMLDivElement, SplitterProps>(
  (props, ref) => {
    const {
      layout = SPLITTER_DEFAULTS.layout,
      onResize,
      onResizeStart,
      onResizeEnd,
      children,
      className,
      style,
    } = props;

    const containerRef = useRef<HTMLDivElement>(null);

    // Equal-share initialization: each panel starts at 100/N percent
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

    // Creates a curried mousedown handler for a specific gutter index.
    // Attaches document-level move/up listeners to track the drag across
    // the entire viewport, not just the gutter element.
    const handleMouseDown = useCallback((index: number) => (e: React.MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;
      activeGutter.current = index;
      setDraggingIndex(index);
      onResizeStart?.();

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!isDragging.current || !containerRef.current) return;

        // Convert absolute mouse position to a percentage of the container
        const rect = containerRef.current.getBoundingClientRect();
        const totalSize = isVertical ? rect.height : rect.width;
        const offset = isVertical
          ? moveEvent.clientY - rect.top
          : moveEvent.clientX - rect.left;
        const percentage = (offset / totalSize) * 100;

        setSizes((prevSizes) => {
          const newSizes = [...prevSizes];
          // Determine how far the mouse has moved past the cumulative edge
          // of all panels before (and including) the active gutter's left panel
          const beforeSum = prevSizes.slice(0, activeGutter.current + 1).reduce((a, b) => a + b, 0);
          const diff = percentage - beforeSum;

          // Transfer the size delta between the two adjacent panels,
          // clamping at 0% to prevent negative (inverted) panels
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
        // Merge internal containerRef with forwarded ref for both resize
        // measurement and consumer access to the DOM node.
        ref={(node) => {
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={`rottay-splitter rottay-splitter--rustic ${className ?? ''}`.trim()}
        style={{
          ...styles.container,
          flexDirection: isVertical ? 'column' : 'row',
          ...style,
        }}
        data-part="root"
        data-orientation={isVertical ? 'vertical' : 'horizontal'}
      >
        {childArray.map((child, index) => (
          <React.Fragment key={index}>
            {/* Inject calculated size into each Panel child */}
            {isValidElement(child)
              ? cloneElement(child as React.ReactElement<SplitterPanelProps & { size?: number }>, { size: sizes[index] })
              : child}
            {/* Render gutter drag handles between panels; hover highlight is CSS. */}
            {index < childArray.length - 1 && (
              <div
                style={{
                  ...styles.gutter,
                  ...(isVertical ? styles.gutterVertical : styles.gutterHorizontal),
                }}
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
Splitter.displayName = 'Splitter.Rustic';

export default Splitter;
