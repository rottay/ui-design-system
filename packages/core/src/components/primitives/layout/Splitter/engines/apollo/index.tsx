'use client';

/**
 * Splitter - Apollo Engine (Vanilla HTML/CSS)
 */
import React, { useState, useRef, useCallback, Children, cloneElement, isValidElement } from 'react';
import type { SplitterProps, SplitterPanelProps } from '../../types';
import { SPLITTER_DEFAULTS } from '../../types';

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
    backgroundColor: '#e8e8e8',
    transition: 'background-color 0.2s',
  } as React.CSSProperties,
  gutterHorizontal: {
    width: 8,
    cursor: 'col-resize',
  } as React.CSSProperties,
  gutterVertical: {
    height: 8,
    cursor: 'row-resize',
  } as React.CSSProperties,
  gutterHover: {
    backgroundColor: '#1890ff',
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
Panel.displayName = 'Splitter.Panel.Apollo';

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
Splitter.displayName = 'Splitter.Apollo';

export default Splitter;
