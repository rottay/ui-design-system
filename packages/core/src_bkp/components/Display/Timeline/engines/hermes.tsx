'use client';

/**
 * Hermes Timeline Engine
 *
 * DaisyUI implementation with unified props interface.
 */

import { useMemo } from 'react';
import type { TimelineProps, TimelineItem } from '../types';
import { getItemPosition } from '../../../../types/components/timeline';

/**
 * Hermes Timeline Component
 *
 * DaisyUI-styled timeline display.
 */
export default function HermesTimeline(props: TimelineProps) {
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
      <ul className={`timeline timeline-vertical ${className}`} style={style}>
        {children}
      </ul>
    );
  }

  return (
    <ul className={`timeline timeline-vertical ${className}`} style={style}>
      {processedItems.map((item, index) => {
        const position = getItemPosition(index, mode, item.position);
        const isLast = index === processedItems.length - 1;
        const isPending = item.key === 'pending';

        // Get dot color
        const dotColorClass = item.color === 'blue' ? 'bg-primary' :
          item.color === 'red' ? 'bg-error' :
          item.color === 'green' ? 'bg-success' :
          item.color === 'gray' ? 'bg-base-300' :
          'bg-primary';

        return (
          <li key={item.key ?? index} className={item.className} style={item.style}>
            {/* Connector line before */}
            {index > 0 && <hr className={isPending ? 'bg-base-300' : ''} />}

            {/* Content on left side (for alternate/left mode) */}
            {mode && position === 'right' && (
              <div className="timeline-start">
                {item.label}
              </div>
            )}

            {/* Dot */}
            <div className="timeline-middle">
              {item.dot || (
                <div className={`w-3 h-3 rounded-full ${dotColorClass} ${isPending ? 'animate-pulse' : ''}`}
                     style={item.color && !['blue', 'red', 'green', 'gray'].includes(item.color)
                       ? { backgroundColor: item.color }
                       : undefined}
                />
              )}
            </div>

            {/* Content */}
            <div className={position === 'right' ? 'timeline-start' : 'timeline-end'}>
              {item.children}
            </div>

            {/* Label on right side (for alternate mode) */}
            {mode && position === 'left' && item.label && (
              <div className="timeline-end text-base-content/60">
                {item.label}
              </div>
            )}

            {/* Connector line after */}
            {!isLast && <hr className={isPending ? 'bg-base-300' : ''} />}
          </li>
        );
      })}
    </ul>
  );
}
