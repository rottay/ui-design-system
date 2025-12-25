'use client';

/**
 * Apollo Timeline Engine
 *
 * Native HTML + Tailwind implementation with unified props interface.
 */

import { useMemo } from 'react';
import type { TimelineProps, TimelineItem } from '../types';
import { getDotColorClass, getDotColorStyle, getItemPosition } from '../../../../types/components/timeline';

/**
 * Apollo Timeline Component
 *
 * Pure Tailwind-styled timeline display.
 */
export default function ApolloTimeline(props: TimelineProps) {
  const {
    items = [],
    children,
    mode,
    pending,
    pendingDot,
    reverse = false,
    className = '',
    style,
  } = props;

  // Process items
  const processedItems = useMemo(() => {
    const itemList = [...items];
    if (reverse) itemList.reverse();

    // Add pending item if needed
    if (pending) {
      const pendingItem: TimelineItem = {
        key: 'pending',
        children: pending === true ? 'Loading...' : pending,
        dot: pendingDot,
        color: 'gray',
      };
      itemList.push(pendingItem);
    }

    return itemList;
  }, [items, pending, pendingDot, reverse]);

  // Render children mode
  if (children) {
    return (
      <div className={`relative ${className}`} style={style}>
        {children}
      </div>
    );
  }

  // Determine if we need labels column (alternate mode)
  const hasLabels = mode === 'alternate' || items.some(item => item.label);

  return (
    <div className={`relative ${className}`} style={style}>
      {processedItems.map((item, index) => {
        const position = getItemPosition(index, mode, item.position);
        const isLast = index === processedItems.length - 1;
        const isPending = item.key === 'pending';
        const dotColorClass = getDotColorClass(item.color);
        const dotColorStyle = getDotColorStyle(item.color);

        // Left-aligned timeline (default)
        if (!mode || mode === 'left') {
          return (
            <div
              key={item.key ?? index}
              className={`flex gap-4 ${item.className || ''}`}
              style={item.style}
            >
              {/* Dot and line column */}
              <div className="flex flex-col items-center">
                {/* Dot */}
                {item.dot || (
                  <div
                    className={`w-3 h-3 rounded-full shrink-0 ${dotColorClass} ${isPending ? 'animate-pulse' : ''}`}
                    style={dotColorStyle}
                  />
                )}
                {/* Line */}
                {!isLast && (
                  <div className={`w-0.5 flex-1 min-h-[24px] ${isPending ? 'bg-gray-200' : 'bg-gray-300'}`} />
                )}
              </div>

              {/* Content */}
              <div className={`pb-6 ${isLast ? 'pb-0' : ''}`}>
                {item.children}
              </div>
            </div>
          );
        }

        // Right-aligned timeline
        if (mode === 'right') {
          return (
            <div
              key={item.key ?? index}
              className={`flex gap-4 justify-end ${item.className || ''}`}
              style={item.style}
            >
              {/* Content */}
              <div className={`pb-6 text-right ${isLast ? 'pb-0' : ''}`}>
                {item.children}
              </div>

              {/* Dot and line column */}
              <div className="flex flex-col items-center">
                {/* Dot */}
                {item.dot || (
                  <div
                    className={`w-3 h-3 rounded-full shrink-0 ${dotColorClass} ${isPending ? 'animate-pulse' : ''}`}
                    style={dotColorStyle}
                  />
                )}
                {/* Line */}
                {!isLast && (
                  <div className={`w-0.5 flex-1 min-h-[24px] ${isPending ? 'bg-gray-200' : 'bg-gray-300'}`} />
                )}
              </div>
            </div>
          );
        }

        // Alternate mode
        return (
          <div
            key={item.key ?? index}
            className={`flex gap-4 ${item.className || ''}`}
            style={item.style}
          >
            {/* Left content */}
            <div className={`flex-1 pb-6 ${isLast ? 'pb-0' : ''} ${position === 'left' ? '' : 'text-right'}`}>
              {position === 'left' ? item.children : item.label}
            </div>

            {/* Dot and line column */}
            <div className="flex flex-col items-center">
              {/* Dot */}
              {item.dot || (
                <div
                  className={`w-3 h-3 rounded-full shrink-0 ${dotColorClass} ${isPending ? 'animate-pulse' : ''}`}
                  style={dotColorStyle}
                />
              )}
              {/* Line */}
              {!isLast && (
                <div className={`w-0.5 flex-1 min-h-[24px] ${isPending ? 'bg-gray-200' : 'bg-gray-300'}`} />
              )}
            </div>

            {/* Right content */}
            <div className={`flex-1 pb-6 ${isLast ? 'pb-0' : ''} ${position === 'right' ? '' : 'text-left text-gray-500'}`}>
              {position === 'right' ? item.children : item.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
