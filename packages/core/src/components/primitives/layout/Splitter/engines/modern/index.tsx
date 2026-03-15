'use client';

/**
 * @fileoverview Splitter Modern Engine - Rottay Design System
 * @description Modern (DaisyUI/Tailwind) implementation of the Splitter compound component.
 * Uses Tailwind CSS utilities with custom mouse event handling for drag-to-resize.
 *
 * @remarks
 * The Modern engine provides:
 * - Tailwind CSS styled panels with `flex` layout
 * - Custom gutter with `bg-base-300 hover:bg-primary` styling
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
import type { SplitterProps, SplitterPanelProps } from '../../Splitter.types';
import { SPLITTER_DEFAULTS } from '../../Splitter.types';

export const Panel = React.forwardRef<HTMLDivElement, SplitterPanelProps & { size?: number }>(
  (props, ref) => {
    const { size, min, max, children, className = '', style } = props;

    const minSize = typeof min === 'number' ? min : 0;
    const maxSize = typeof max === 'number' ? max : 100;
    const clampedSize = Math.min(Math.max(size ?? 50, minSize), maxSize);

    return (
      <div
        ref={ref}
        className={`overflow-auto ${className}`}
        style={{
          flex: `0 0 ${clampedSize}%`,
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
    const [sizes, setSizes] = useState<number[]>(() => {
      const childCount = Children.count(children);
      return Array(childCount).fill(100 / childCount);
    });
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
        className={`flex ${isVertical ? 'flex-col' : 'flex-row'} w-full h-full ${className}`}
        style={style}
      >
        {childArray.map((child, index) => (
          <React.Fragment key={index}>
            {isValidElement(child)
              ? cloneElement(child as React.ReactElement<SplitterPanelProps & { size?: number }>, { size: sizes[index] })
              : child}
            {index < childArray.length - 1 && (
              <div
                className={`flex-shrink-0 bg-base-300 hover:bg-primary transition-colors ${
                  isVertical ? 'h-2 cursor-row-resize' : 'w-2 cursor-col-resize'
                }`}
                onMouseDown={handleMouseDown(index)}
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
