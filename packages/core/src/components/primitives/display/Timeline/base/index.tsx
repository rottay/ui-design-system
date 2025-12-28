/**
 * @fileoverview Timeline Base Component - Rottay Design System
 * @description Base timeline implementation using CSS custom properties
 * for consistent styling across the design system.
 *
 * @remarks
 * The BaseTimeline provides the foundation for all engine implementations:
 * - CSS variables for theming (--timeline-dot-color, --timeline-line-color)
 * - Three display modes: left, right, alternate
 * - Color preset mapping to CSS values
 * - Pending state with pulsing animation
 * - Reverse order support
 *
 * **CSS Custom Properties:**
 * - `--timeline-dot-size` - Dot diameter
 * - `--timeline-dot-border-width` - Dot border thickness
 * - `--timeline-line-width` - Connecting line width
 * - `--timeline-item-padding` - Item spacing
 * - `--timeline-dot-offset` - Dot position offset
 * - `--timeline-dot-color` - Individual item dot color
 * - `--timeline-line-color` - Connecting line color
 *
 * @example Base component usage
 * ```tsx
 * import { BaseTimeline, BaseTimelineItem } from './base';
 *
 * <BaseTimeline mode="alternate">
 *   <BaseTimelineItem color="green" index={0}>
 *     First event
 *   </BaseTimelineItem>
 * </BaseTimeline>
 * ```
 *
 * @see {@link Timeline} for engine-aware component
 * @module Timeline/Base
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';
import type { TimelineProps, TimelineItemProps } from '../types';
import { TIMELINE_DEFAULTS, TIMELINE_COLOR_MAP, TIMELINE_SIZE_MAP } from '../types';

/**
 * Get color value from preset name or return custom color.
 * @param color - Color preset name or custom CSS color
 * @returns CSS color value
 */
function getColorValue(color?: string): string {
  if (!color) return TIMELINE_COLOR_MAP.blue;
  return TIMELINE_COLOR_MAP[color] || color;
}

/**
 * Base Timeline Item component using CSS variables.
 * This is extended by engine-specific implementations.
 */
export const BaseTimelineItem = forwardRef<HTMLDivElement, TimelineItemProps & { index?: number; isLast?: boolean; mode?: string }>(
  (props, ref) => {
    const {
      dot,
      color = TIMELINE_DEFAULTS.itemColor,
      label,
      position,
      children,
      className = '',
      style = {},
      index = 0,
      isLast: _isLast = false,
      mode = 'left',
    } = props;

    const colorValue = getColorValue(color);
    const isAlternate = mode === 'alternate';
    const isRight = mode === 'right' || (isAlternate && index % 2 === 1);

    // Build CSS variables for the timeline item
    const itemVars: React.CSSProperties = {
      '--timeline-dot-color': colorValue,
    } as React.CSSProperties;

    const itemStyle: React.CSSProperties = {
      ...itemVars,
      position: 'relative',
      paddingBottom: TIMELINE_SIZE_MAP.itemPadding,
      paddingLeft: isRight ? '0' : TIMELINE_SIZE_MAP.dotOffset,
      paddingRight: isRight ? TIMELINE_SIZE_MAP.dotOffset : '0',
      textAlign: isRight ? 'right' : 'left',
      ...style,
    };

    const dotStyle: React.CSSProperties = {
      position: 'absolute',
      [isRight ? 'right' : 'left']: `calc(-1 * ${TIMELINE_SIZE_MAP.dotOffset})`,
      top: '4px',
      width: TIMELINE_SIZE_MAP.dotSize,
      height: TIMELINE_SIZE_MAP.dotSize,
      borderRadius: '50%',
      backgroundColor: dot ? 'transparent' : 'var(--timeline-dot-color)',
      border: dot ? 'none' : `${TIMELINE_SIZE_MAP.dotBorderWidth} solid white`,
      boxShadow: dot ? 'none' : `0 0 0 ${TIMELINE_SIZE_MAP.dotBorderWidth} var(--timeline-dot-color)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };

    const labelStyle: React.CSSProperties = {
      color: 'var(--color-text-secondary, #999)',
      fontSize: '12px',
      marginBottom: '4px',
    };

    return (
      <div
        ref={ref}
        className={`rottay-timeline-item ${className}`}
        style={itemStyle}
        data-position={position || (isRight ? 'right' : 'left')}
      >
        {/* Dot */}
        <div className="rottay-timeline-item__dot" style={dotStyle}>
          {dot}
        </div>

        {/* Label */}
        {label && (
          <div className="rottay-timeline-item__label" style={labelStyle}>
            {label}
          </div>
        )}

        {/* Content */}
        <div className="rottay-timeline-item__content">
          {children}
        </div>
      </div>
    );
  }
);

BaseTimelineItem.displayName = 'BaseTimelineItem';

/**
 * Base Timeline component using CSS variables.
 * This is extended by engine-specific implementations.
 */
export const BaseTimeline = forwardRef<HTMLDivElement, TimelineProps>(
  (props, ref) => {
    const {
      mode = TIMELINE_DEFAULTS.mode,
      pending,
      pendingDot,
      reverse = TIMELINE_DEFAULTS.reverse,
      items,
      children,
      className = '',
      style = {},
    } = props;

    // Collect items from either items prop or children
    const timelineItems = items || React.Children.toArray(children);
    const orderedItems = reverse ? [...timelineItems].reverse() : timelineItems;

    // Build CSS variables for the timeline
    const timelineVars: React.CSSProperties = {
      '--timeline-line-color': 'var(--color-border, #e8e8e8)',
    } as React.CSSProperties;

    const containerStyle: React.CSSProperties = {
      ...timelineVars,
      position: 'relative',
      padding: `0 0 0 ${TIMELINE_SIZE_MAP.dotOffset}`,
      ...style,
    };

    const lineStyle: React.CSSProperties = {
      position: 'absolute',
      left: `calc((${TIMELINE_SIZE_MAP.dotSize} - ${TIMELINE_SIZE_MAP.lineWidth}) / 2)`,
      top: `calc(${TIMELINE_SIZE_MAP.dotSize} / 2)`,
      bottom: pending ? '40px' : `calc(${TIMELINE_SIZE_MAP.dotSize} / 2)`,
      width: TIMELINE_SIZE_MAP.lineWidth,
      backgroundColor: 'var(--timeline-line-color)',
    };

    const pendingDotStyle: React.CSSProperties = {
      position: 'absolute',
      left: `calc(-1 * ${TIMELINE_SIZE_MAP.dotOffset})`,
      top: '4px',
      width: TIMELINE_SIZE_MAP.dotSize,
      height: TIMELINE_SIZE_MAP.dotSize,
      borderRadius: '50%',
      backgroundColor: 'var(--timeline-line-color)',
      animation: 'rottay-timeline-pulse 1.5s ease-in-out infinite',
    };

    return (
      <div
        ref={ref}
        className={`rottay-timeline rottay-timeline--${mode} ${className}`}
        style={containerStyle}
        data-mode={mode}
      >
        {/* Vertical line */}
        <div className="rottay-timeline__line" style={lineStyle} />

        {/* Items */}
        {orderedItems.map((item, index) => {
          const isElement = React.isValidElement(item);
          const itemProps: TimelineItemProps = isElement
            ? (item.props as TimelineItemProps)
            : (item as TimelineItemProps);

          return (
            <BaseTimelineItem
              key={index}
              {...itemProps}
              index={index}
              isLast={index === orderedItems.length - 1}
              mode={mode}
            />
          );
        })}

        {/* Pending item */}
        {pending && (
          <div className="rottay-timeline-item rottay-timeline-item--pending" style={{ position: 'relative', paddingBottom: '20px' }}>
            <div className="rottay-timeline-item__dot" style={pendingDotStyle}>
              {pendingDot}
            </div>
            <div className="rottay-timeline-item__content" style={{ color: 'var(--color-text-secondary, #999)' }}>
              {pending}
            </div>
          </div>
        )}

        {/* Keyframes for pending animation */}
        <style>{`
          @keyframes rottay-timeline-pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(0.9); }
          }
        `}</style>
      </div>
    );
  }
);

BaseTimeline.displayName = 'BaseTimeline';
