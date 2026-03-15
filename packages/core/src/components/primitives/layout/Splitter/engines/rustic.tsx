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
    backgroundColor: 'var(--ds-splitter-gutter-bg, var(--ds-color-neutral-200, #e8e8e8))',
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
  gutterHover: {
    backgroundColor: 'var(--ds-splitter-gutter-hover-bg, var(--ds-color-primary-500, #1890ff))',
  } as React.CSSProperties,
};

export const Panel = React.forwardRef<HTMLDivElement, SplitterPanelProps & { size?: number }>(
  (props, ref) => {
    const { size, min, max, children, className, style } = props;

    const minSize = typeof min === 'number' ? min : 0;
    const maxSize = typeof max === 'number' ? max : 100;
    const clampedSize = Math.min(Math.max(size ?? 50, minSize), maxSize);

    return (
      <div
        ref={ref}
        className={className}
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
    const [sizes, setSizes] = useState<number[]>(() => {
      const childCount = Children.count(children);
      return Array(childCount).fill(100 / childCount);
    });
    const [hoveredGutter, setHoveredGutter] = useState<number>(-1);
    const isDragging = useRef(false);
    const activeGutter = useRef<number>(-1);

    const isVertical = layout === 'vertical';

    const handleMouseDown = useCallback((index: number) => (e: React.MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;
      activeGutter.current = index;
      onResizeStart?.();

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!isDragging.current || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const totalSize = isVertical ? rect.height : rect.width;
        const offset = isVertical
          ? moveEvent.clientY - rect.top
          : moveEvent.clientX - rect.left;
        const percentage = (offset / totalSize) * 100;

        setSizes((prevSizes) => {
          const newSizes = [...prevSizes];
          const beforeSum = prevSizes.slice(0, activeGutter.current + 1).reduce((a, b) => a + b, 0);
          const diff = percentage - beforeSum;

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
        ref={(node) => {
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={className}
        style={{
          ...styles.container,
          flexDirection: isVertical ? 'column' : 'row',
          ...style,
        }}
      >
        {childArray.map((child, index) => (
          <React.Fragment key={index}>
            {isValidElement(child)
              ? cloneElement(child as React.ReactElement<SplitterPanelProps & { size?: number }>, { size: sizes[index] })
              : child}
            {index < childArray.length - 1 && (
              <div
                style={{
                  ...styles.gutter,
                  ...(isVertical ? styles.gutterVertical : styles.gutterHorizontal),
                  ...(hoveredGutter === index ? styles.gutterHover : {}),
                }}
                onMouseDown={handleMouseDown(index)}
                onMouseEnter={() => setHoveredGutter(index)}
                onMouseLeave={() => setHoveredGutter(-1)}
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
