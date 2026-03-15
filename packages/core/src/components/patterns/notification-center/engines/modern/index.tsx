'use client';

/**
 * NotificationCenter - Modern Engine (DaisyUI/Tailwind)
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { NotificationCenterProps, Notification } from '../../types';

const typeColors: Record<string, string> = {
  info: 'text-info',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
};

const typeBg: Record<string, string> = {
  info: 'bg-info/10',
  success: 'bg-success/10',
  warning: 'bg-warning/10',
  error: 'bg-error/10',
};

function formatTimestamp(ts: string): string {
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function ModernNotificationCenter(props: NotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    onRead,
    onReadAll,
    onClear,
    onClearAll,
    trigger,
    open: controlledOpen,
    onOpenChange,
    emptyMessage = 'No notifications',
    maxVisible = 10,
    loading,
    className,
    style,
  } = props;

  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen ?? internalOpen;
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (controlledOpen === undefined) setInternalOpen(newOpen);
    onOpenChange?.(newOpen);
  }, [controlledOpen, onOpenChange]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        handleOpenChange(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, handleOpenChange]);

  const displayCount = unreadCount ?? notifications.filter(n => !n.read).length;
  const visibleNotifications = notifications.slice(0, maxVisible);

  return (
    <div
      ref={dropdownRef}
      className={`dropdown dropdown-end ds-pattern-notification-center ds-engine-modern ${className ?? ''}`}
      style={style}
    >
      {/* Trigger */}
      <div
        tabIndex={0}
        role="button"
        className="btn btn-ghost btn-circle"
        onClick={() => handleOpenChange(!isOpen)}
        data-testid="notification-trigger"
        aria-label="Notifications"
      >
        {trigger || (
          <div className="indicator">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {displayCount > 0 && (
              <span className="badge badge-sm badge-primary indicator-item">{displayCount}</span>
            )}
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="dropdown-content z-50 mt-2 card card-compact shadow-lg bg-base-100 w-[360px]">
          <div className="card-body p-0">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-base-300">
              <span className="font-semibold text-sm">Notifications</span>
              <div className="flex gap-2">
                {onReadAll && displayCount > 0 && (
                  <button className="btn btn-ghost btn-xs" onClick={onReadAll}>
                    Mark all read
                  </button>
                )}
                {onClearAll && notifications.length > 0 && (
                  <button className="btn btn-ghost btn-xs" onClick={onClearAll}>
                    Clear all
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="max-h-[360px] overflow-y-auto">
              {visibleNotifications.length === 0 ? (
                <div className="flex justify-center items-center py-12 opacity-50">
                  {emptyMessage}
                </div>
              ) : (
                <ul className="menu p-0">
                  {visibleNotifications.map(item => (
                    <li key={item.id}>
                      <div
                        className={`flex gap-3 items-start p-3 rounded-none border-b border-base-200 ${!item.read ? 'bg-primary/5' : ''}`}
                        onClick={() => onRead?.(item.id)}
                      >
                        <div className={`mt-0.5 text-lg ${typeColors[item.type]}`}>
                          {item.icon || (
                            item.type === 'success' ? '\u2713' :
                            item.type === 'error' ? '\u2717' :
                            item.type === 'warning' ? '!' :
                            '\u2139'
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm ${!item.read ? 'font-semibold' : ''}`}>{item.title}</span>
                            {!item.read && <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
                          </div>
                          <p className="text-xs opacity-60 mt-0.5 line-clamp-2">{item.message}</p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs opacity-40">{formatTimestamp(item.timestamp)}</span>
                            {item.action && (
                              <button
                                className="btn btn-ghost btn-xs"
                                onClick={(e) => { e.stopPropagation(); item.action!.onClick(); }}
                              >
                                {item.action.label}
                              </button>
                            )}
                          </div>
                        </div>
                        {onClear && (
                          <button
                            className="btn btn-ghost btn-xs btn-circle opacity-30 hover:opacity-100"
                            onClick={(e) => { e.stopPropagation(); onClear(item.id); }}
                          >
                            x
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
