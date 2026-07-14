'use client';

/**
 * @fileoverview Modern engine for the NotificationCenter pattern, powered by DaisyUI / Tailwind.
 * Builds a custom dropdown (no Ant Popover) with manual click-outside detection,
 * supporting both controlled and uncontrolled open state. Notifications are
 * rendered in a scrollable menu list with per-type color coding and Unicode
 * fallback icons when no custom icon is provided.
 *
 * @example
 * <ModernNotificationCenter
 *   notifications={[{ id: '1', title: 'Build passed', message: 'CI green on main', type: 'success', read: false, timestamp: new Date().toISOString() }]}
 *   onRead={(id) => markRead(id)}
 *   maxVisible={5}
 * />
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { NotificationCenterProps, Notification } from '../NotificationCenter.types';

// Tinted background styles at 10% opacity for icon containers, giving each
// notification type a subtle color band without overpowering the row.
const typeBgStyles: Record<string, React.CSSProperties> = {
  info: { background: 'color-mix(in srgb, var(--ds-color-info) 10%, transparent)' },
  success: { background: 'color-mix(in srgb, var(--ds-color-success) 10%, transparent)' },
  warning: { background: 'color-mix(in srgb, var(--ds-color-warning) 10%, transparent)' },
  error: { background: 'color-mix(in srgb, var(--ds-color-error) 10%, transparent)' },
};

/**
 * Progressive degradation from relative ("3m ago") to calendar ("Mar 5").
 * Keeps recent notifications scannable while older ones stay unambiguous.
 */
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

/**
 * Modern (DaisyUI / Tailwind) engine for the NotificationCenter pattern.
 *
 * Uses a DaisyUI dropdown shell with manual click-outside detection to support
 * both controlled and uncontrolled open states. The default trigger is an
 * inline SVG bell icon with a DaisyUI indicator badge for the unread count.
 *
 * @param props - {@link NotificationCenterProps}
 * @returns A dropdown notification center with DaisyUI styling.
 */
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

  // Controlled/uncontrolled open state pattern -- see Classic engine for the
  // same approach. When `controlledOpen` is undefined, internal state drives.
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen ?? internalOpen;
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (controlledOpen === undefined) setInternalOpen(newOpen);
    onOpenChange?.(newOpen);
  }, [controlledOpen, onOpenChange]);

  // Manual click-outside detection because DaisyUI's native dropdown toggle
  // does not support controlled open state. Only attached while open to avoid
  // unnecessary document-level listeners.
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        handleOpenChange(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, handleOpenChange]);

  // Prefer server-authoritative count; fall back to client-side filter.
  const displayCount = unreadCount ?? notifications.filter(n => !n.read).length;
  // Cap the rendered list to `maxVisible` items for performance.
  const visibleNotifications = notifications.slice(0, maxVisible);

  return (
    <div
      ref={dropdownRef}
      data-part="root"
      className={`ds-pattern-notification-center ds-engine-modern ${className ?? ''}`}
      style={{ ...style, position: 'relative', display: 'inline-block' }}
    >
      {/* Trigger: inline SVG bell icon with DaisyUI indicator badge.
          A custom trigger replaces the entire button contents when provided. */}
      <div
        tabIndex={0}
        role="button"
        data-part="trigger"
        style={{ height: 40, width: 40, padding: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        onClick={() => handleOpenChange(!isOpen)}
        data-testid="notification-trigger"
        aria-label="Notifications"
      >
        {trigger || (
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {displayCount > 0 && (
              <span data-part="badge" style={{ position: 'absolute', top: -4, right: -4, display: 'inline-flex', alignItems: 'center', padding: '1px 6px', fontSize: 11 }}>{displayCount}</span>
            )}
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div data-part="panel" className="z-50 mt-2 w-[360px]" style={{ position: 'absolute', right: 0, padding: 12 }}>
          <div style={{ padding: 0 }}>
            {/* Header */}
            <div data-part="header" className="flex items-center justify-between px-4 py-3 border-b">
              <span className="font-semibold text-sm">Notifications</span>
              <div className="flex gap-2">
                {onReadAll && displayCount > 0 && (
                  <button data-part="mark-all-read" style={{ height: 24, padding: '0 8px', fontSize: 12, cursor: 'pointer' }} onClick={onReadAll}>
                    Mark all read
                  </button>
                )}
                {onClearAll && notifications.length > 0 && (
                  <button data-part="clear-all" style={{ height: 24, padding: '0 8px', fontSize: 12, cursor: 'pointer' }} onClick={onClearAll}>
                    Clear all
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable notification list. Unread items get a subtle primary
                tint (bg-primary/5). Unicode fallback icons are used when no custom
                icon is provided -- keeps the bundle lightweight. */}
            <div className="max-h-[360px] overflow-y-auto">
              {visibleNotifications.length === 0 ? (
                <div className="flex justify-center items-center py-12 opacity-50">
                  {emptyMessage}
                </div>
              ) : (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {visibleNotifications.map(item => (
                    <li key={item.id}>
                      <div
                        data-part="row"
                        data-unread={!item.read}
                        className="flex gap-3 items-start p-3 rounded-none border-b"
                        onClick={() => onRead?.(item.id)}
                      >
                        {/* Type icon: custom icon takes priority, otherwise a
                            Unicode glyph matching the notification type */}
                        <div data-part="icon" data-type={item.type} className="mt-0.5 text-lg">
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
                            {/* Small primary dot next to unread titles for visual emphasis */}
                            {!item.read && <div data-part="unread-dot" data-unread={true} className="w-1.5 h-1.5 rounded-full flex-shrink-0" />}
                          </div>
                          <p className="text-xs opacity-60 mt-0.5 line-clamp-2">{item.message}</p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs opacity-40">{formatTimestamp(item.timestamp)}</span>
                            {/* stopPropagation prevents the action click from also
                                firing the row-level onRead handler */}
                            {item.action && (
                              <button
                                data-part="action"
                                style={{ height: 24, padding: '0 8px', fontSize: 12, cursor: 'pointer' }}
                                onClick={(e) => { e.stopPropagation(); item.action!.onClick(); }}
                              >
                                {item.action.label}
                              </button>
                            )}
                          </div>
                        </div>
                        {/* Dismiss button: low opacity by default, full on hover */}
                        {onClear && (
                          <button
                            data-part="dismiss"
                            style={{ height: 24, width: 24, padding: 0, fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3, transition: 'opacity var(--ds-motion-fast)' }}
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
