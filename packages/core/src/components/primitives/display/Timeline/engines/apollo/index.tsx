/**
 * Timeline - Apollo Engine (Pure HTML/CSS)
 *
 * Renders the Timeline component using vanilla HTML and CSS.
 * Minimal dependencies, maximum accessibility.
 */

'use client';

import React, { forwardRef } from 'react';
import type { TimelineProps, TimelineItemProps } from '../../types';
import { TIMELINE_DEFAULTS, TIMELINE_COLOR_MAP, TIMELINE_SIZE_MAP } from '../../types';

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
 * ApolloTimeline - Pure HTML/CSS implementation of Timeline.
 *
 * Features:
 * - Zero external dependencies
 * - Fully accessible with semantic HTML
 * - CSS-only styling and animations
 * - Lightweight and performant
 *
 * @example
 * ```tsx
 * <Timeline engine="apollo" mode="left">
 *   <Timeline.Item color="green">Task completed</Timeline.Item>
 *   <Timeline.Item color="blue">In progress</Timeline.Item>
 * </Timeline>
 * ```
 */
function ApolloTimeline(props: TimelineProps): React.ReactElement {
  const {
    mode = TIMELINE_DEFAULTS.mode,
    pending,
    pendingDot,
    reverse = TIMELINE_DEFAULTS.reverse,
    items,
    children,
    className = '',
    style,
  } = props;

  const timelineItems = items || React.Children.toArray(children);
  const orderedItems = reverse ? [...timelineItems].reverse() : timelineItems;

  const containerStyle: React.CSSProperties = {
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
    backgroundColor: '#e8e8e8',
  };

  return (
    <div
      className={`rottay-timeline ${className}`}
      style={containerStyle}
      role="list"
      aria-label="Timeline"
    >
      {/* Vertical line */}
      <div style={lineStyle} aria-hidden="true" />

      {/* Items */}
      {orderedItems.map((item, index) => {
        const isElement = React.isValidElement(item);
        const itemProps: TimelineItemProps = isElement
          ? (item.props as TimelineItemProps)
          : (item as TimelineItemProps);

        const colorValue = getColorValue(itemProps.color);
        const isAlternate = mode === 'alternate';
        const isRight = mode === 'right' || (isAlternate && index % 2 === 1);

        const itemStyle: React.CSSProperties = {
          position: 'relative',
          paddingBottom: TIMELINE_SIZE_MAP.itemPadding,
          textAlign: isRight ? 'right' : 'left',
          paddingLeft: isRight ? '0' : undefined,
          paddingRight: isRight ? TIMELINE_SIZE_MAP.dotOffset : undefined,
          ...itemProps.style,
        };

        const dotStyle: React.CSSProperties = {
          position: 'absolute',
          left: `calc(-1 * ${TIMELINE_SIZE_MAP.dotOffset})`,
          top: '4px',
          width: TIMELINE_SIZE_MAP.dotSize,
          height: TIMELINE_SIZE_MAP.dotSize,
          borderRadius: '50%',
          backgroundColor: itemProps.dot ? 'transparent' : colorValue,
          border: itemProps.dot ? 'none' : `${TIMELINE_SIZE_MAP.dotBorderWidth} solid white`,
          boxShadow: itemProps.dot ? 'none' : `0 0 0 ${TIMELINE_SIZE_MAP.dotBorderWidth} ${colorValue}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        };

        return (
          <div
            key={index}
            className={itemProps.className}
            style={itemStyle}
            role="listitem"
          >
            {/* Dot */}
            <div style={dotStyle} aria-hidden="true">
              {itemProps.dot}
            </div>

            {/* Label */}
            {itemProps.label && (
              <div style={{ color: '#999', fontSize: '12px', marginBottom: '4px' }}>
                {itemProps.label}
              </div>
            )}

            {/* Content */}
            <div>{itemProps.children}</div>
          </div>
        );
      })}

      {/* Pending item */}
      {pending && (
        <div
          style={{ position: 'relative', paddingBottom: TIMELINE_SIZE_MAP.itemPadding }}
          role="listitem"
          aria-label="Pending"
        >
          <div
            style={{
              position: 'absolute',
              left: `calc(-1 * ${TIMELINE_SIZE_MAP.dotOffset})`,
              top: '4px',
              width: TIMELINE_SIZE_MAP.dotSize,
              height: TIMELINE_SIZE_MAP.dotSize,
              borderRadius: '50%',
              backgroundColor: '#e8e8e8',
              animation: 'rottay-timeline-pulse 1.5s ease-in-out infinite',
            }}
            aria-hidden="true"
          >
            {pendingDot}
          </div>
          <div style={{ color: '#999' }}>{pending}</div>
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

ApolloTimeline.displayName = 'ApolloTimeline';

/**
 * ApolloTimelineItem - Pure HTML/CSS implementation of Timeline.Item.
 *
 * Note: This is primarily a pass-through component. The actual rendering
 * is handled by the parent Timeline component.
 *
 * @example
 * ```tsx
 * <Timeline.Item color="green" label="2024-01-01">
 *   Task completed successfully
 * </Timeline.Item>
 * ```
 */
const ApolloTimelineItem = forwardRef<HTMLDivElement, TimelineItemProps>(
  (props, ref) => {
    const { children } = props;
    return <div ref={ref}>{children}</div>;
  }
);

ApolloTimelineItem.displayName = 'ApolloTimelineItem';

export default ApolloTimeline;
export { ApolloTimeline as Timeline, ApolloTimelineItem as Item };
