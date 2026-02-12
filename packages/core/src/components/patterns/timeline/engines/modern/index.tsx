'use client';

/**
 * Timeline - Modern Engine (DaisyUI/Tailwind)
 */

import React, { useMemo } from 'react';
import type { TimelinePatternProps, TimelineItem } from '../../types';

function formatTimestamp(ts: string | Date): string {
  const date = typeof ts === 'string' ? new Date(ts) : ts;
  return date.toLocaleString();
}

function formatDateKey(ts: string | Date): string {
  const date = typeof ts === 'string' ? new Date(ts) : ts;
  return date.toLocaleDateString();
}

const typeBadgeClass: Record<string, string> = {
  default: 'badge-info',
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
  info: 'badge-info',
};

export default function ModernTimeline<T>(props: TimelinePatternProps<T>) {
  const {
    items,
    renderItem,
    onItemClick,
    mode = 'left',
    showTimestamp = true,
    header,
    footer,
    emptyState,
    groupByDate,
    loading,
    className,
    style,
  } = props;

  const grouped = useMemo(() => {
    if (!groupByDate) return null;
    const groups: Record<string, TimelineItem<T>[]> = {};
    for (const item of items) {
      const key = formatDateKey(item.timestamp);
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    }
    return groups;
  }, [items, groupByDate]);

  const buildDefaultRender = (item: TimelineItem<T>, index: number, total: number) => {
    const isAlternate = mode === 'alternate';
    const isRight = mode === 'right' || (isAlternate && index % 2 === 1);

    return (
      <li key={item.key}>
        {index !== 0 && <hr />}
        {showTimestamp && (
          <div className={isRight ? 'timeline-end timeline-box' : 'timeline-start'}>
            {!isRight && (
              <time className="font-mono text-xs opacity-60">
                {formatTimestamp(item.timestamp)}
              </time>
            )}
          </div>
        )}
        <div className="timeline-middle">
          {item.icon ? (
            <span className="flex items-center justify-center w-5 h-5">{item.icon}</span>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${item.type === 'error' ? 'text-error' : item.type === 'success' ? 'text-success' : item.type === 'warning' ? 'text-warning' : 'text-primary'}`}>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div
          className={`${isRight ? 'timeline-start' : 'timeline-end'} timeline-box ${onItemClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
          onClick={onItemClick ? () => onItemClick(item) : undefined}
        >
          <div className="flex items-center gap-2 mb-1">
            {item.user?.avatar && (
              <div className="avatar">
                <div className="w-6 rounded-full">
                  <img src={item.user.avatar} alt={item.user.name} />
                </div>
              </div>
            )}
            {item.user && <span className="text-xs font-semibold">{item.user.name}</span>}
            {item.type && item.type !== 'default' && (
              <span className={`badge badge-xs ${typeBadgeClass[item.type]}`}>{item.type}</span>
            )}
          </div>
          <div className="font-semibold text-sm">{item.title}</div>
          {isRight && showTimestamp && (
            <time className="font-mono text-xs opacity-60">
              {formatTimestamp(item.timestamp)}
            </time>
          )}
          {item.description && <p className="text-xs opacity-70 mt-1">{item.description}</p>}
        </div>
        {index !== total - 1 && <hr />}
      </li>
    );
  };

  const renderList = (list: TimelineItem<T>[]) => (
    <ul className="timeline timeline-vertical">
      {list.map((item, index) => {
        const defaultRender = buildDefaultRender(item, index, list.length);
        return renderItem ? (
          <li key={item.key}>{renderItem(item, defaultRender)}</li>
        ) : (
          defaultRender
        );
      })}
    </ul>
  );

  if (loading) {
    return (
      <div className={`flex justify-center items-center py-12 ${className ?? ''}`} style={style}>
        <span className="loading loading-spinner loading-md" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={className} style={style}>
        {header}
        {emptyState ?? (
          <div className="text-center py-12 opacity-60">No timeline items</div>
        )}
        {footer}
      </div>
    );
  }

  return (
    <div className={`ds-pattern-timeline ds-engine-modern ${className ?? ''}`} style={style}>
      {header}
      {grouped ? (
        Object.entries(grouped).map(([dateKey, group]) => (
          <div key={dateKey} className="mb-6">
            <div className="text-sm font-semibold opacity-70 mb-3">{dateKey}</div>
            {renderList(group)}
          </div>
        ))
      ) : (
        renderList(items)
      )}
      {footer}
    </div>
  );
}
