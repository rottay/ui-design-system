'use client';

/**
 * @fileoverview Rustic (Vanilla CSS) engine for the NotificationCenter pattern.
 * Uses only inline styles backed by `--ds-*` CSS custom properties -- no Ant
 * Design or Tailwind dependency. Implements its own absolute-positioned dropdown
 * with manual click-outside detection, matching the same controlled/uncontrolled
 * open state contract as the Classic and Modern engines.
 *
 * The default trigger is a bell emoji button. A custom trigger can replace it.
 *
 * @example
 * <RusticNotificationCenter
 *   notifications={[{ id: '1', title: 'Alert', message: 'Disk usage at 90%', type: 'warning', read: false, timestamp: new Date().toISOString() }]}
 *   onRead={(id) => markRead(id)}
 *   onClear={(id) => dismiss(id)}
 * />
 */

import React, { useState, useRef, useEffect, useCallback, type CSSProperties } from 'react';
import type { NotificationCenterProps, Notification } from '../NotificationCenter.types';

// Semantic color tokens for per-type icon coloring. Uses design system
// variables so the colors adapt to theme changes automatically.
const typeColors: Record<string, string> = {
  info: 'var(--ds-color-primary)',
  success: 'var(--ds-color-success)',
  warning: 'var(--ds-color-warning)',
  error: 'var(--ds-color-error)',
};

/**
 * Progressive degradation from relative ("3m ago") to calendar ("Mar 5").
 * Shared logic across all three engines, duplicated here because the Rustic
 * engine cannot import from Ant/DaisyUI utility files.
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

// Static style objects for the trigger, badge, dropdown, header, and link
// buttons. Extracted here to avoid re-creating objects on every render and
// to keep the JSX focused on structure rather than styling details.
const triggerBtnStyle: CSSProperties = {
  position: 'relative',
  background: 'none',
  border: 'none',
  padding: 8,
  cursor: 'pointer',
  fontSize: 20,
  color: 'var(--ds-color-text)',
  borderRadius: 'var(--ds-radius-md, 8px)',
};

const badgeStyle: CSSProperties = {
  position: 'absolute',
  top: 2,
  right: 2,
  minWidth: 16,
  height: 16,
  borderRadius: 8,
  background: 'var(--ds-color-primary)',
  color: 'var(--ds-color-text-on-primary, var(--ds-color-text-inverse))',
  fontSize: 10,
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 4px',
};

const dropdownStyle: CSSProperties = {
  position: 'absolute',
  top: '100%',
  right: 0,
  marginTop: 8,
  width: 360,
  maxHeight: 440,
  background: 'var(--ds-color-bg-elevated, var(--ds-color-bg-primary))',
  border: '1px solid var(--ds-color-border-primary, var(--ds-color-neutral-200))',
  borderRadius: 'var(--ds-radius-lg, 12px)',
  boxShadow: 'var(--ds-shadow-xl)',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  zIndex: 50,
};

const headerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 14px',
  borderBottom: '1px solid var(--ds-color-border-primary, var(--ds-color-neutral-200))',
};

const linkBtnStyle: CSSProperties = {
  background: 'none',
  border: 'none',
  padding: '2px 6px',
  fontSize: 'var(--ds-font-size-xs, 12px)',
  color: 'var(--ds-color-primary)',
  cursor: 'pointer',
  fontWeight: 500,
};

/**
 * Rustic (Vanilla CSS) engine for the NotificationCenter pattern.
 *
 * Renders a framework-agnostic dropdown using `position: absolute` and manual
 * click-outside handling. Styles are driven entirely by `--ds-*` CSS custom
 * properties with hardcoded fallbacks for graceful degradation.
 *
 * @param props - {@link NotificationCenterProps}
 * @returns A framework-agnostic notification dropdown with inline styles.
 */
export default function RusticNotificationCenter(props: NotificationCenterProps) {
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

  // Same controlled/uncontrolled pattern as Classic and Modern engines.
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen ?? internalOpen;
  const containerRef = useRef<HTMLDivElement>(null);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (controlledOpen === undefined) setInternalOpen(newOpen);
    onOpenChange?.(newOpen);
  }, [controlledOpen, onOpenChange]);

  // Click-outside listener is only attached while the dropdown is open to
  // minimize the number of active document-level event listeners.
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleOpenChange(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, handleOpenChange]);

  // Prefer server-authoritative unread count; fall back to client-side filter.
  const displayCount = unreadCount ?? notifications.filter(n => !n.read).length;
  const visibleNotifications = notifications.slice(0, maxVisible);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'relative', display: 'inline-block', ...style }}
    >
      {/* Trigger: custom element or default bell emoji button.
          The badge is absolutely positioned relative to the trigger button,
          which has position:relative in triggerBtnStyle. */}
      {trigger ? (
        <div onClick={() => handleOpenChange(!isOpen)} style={{ cursor: 'pointer' }} data-testid="notification-trigger">
          {trigger}
        </div>
      ) : (
        <button
          style={triggerBtnStyle}
          onClick={() => handleOpenChange(!isOpen)}
          aria-label="Notifications"
          data-testid="notification-trigger"
        >
          {'\uD83D\uDD14'}
          {displayCount > 0 && <span style={badgeStyle}>{displayCount}</span>}
        </button>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div style={dropdownStyle}>
          {/* Header */}
          <div style={headerStyle}>
            <span style={{ fontWeight: 600, fontSize: 'var(--ds-font-size-sm, 14px)' }}>Notifications</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {onReadAll && displayCount > 0 && (
                <button style={linkBtnStyle} onClick={onReadAll}>Mark all read</button>
              )}
              {onClearAll && notifications.length > 0 && (
                <button style={linkBtnStyle} onClick={onClearAll}>Clear all</button>
              )}
            </div>
          </div>

          {/* Scrollable notification list. Unread items get a primary-50 tinted
              background. Each row is clickable to trigger onRead. */}
          <div style={{ flex: 1, overflowY: 'auto', maxHeight: 360 }}>
            {visibleNotifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 48, color: 'var(--ds-color-text-muted)' }}>
                {emptyMessage}
              </div>
            ) : (
              visibleNotifications.map(item => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    gap: 10,
                    padding: '10px 14px',
                    borderBottom: '1px solid var(--ds-color-border-secondary, var(--ds-color-neutral-100))',
                    background: item.read ? undefined : 'var(--ds-color-primary-50, var(--ds-color-bg-muted))',
                    cursor: 'pointer',
                    alignItems: 'flex-start',
                  }}
                  onClick={() => onRead?.(item.id)}
                >
                  {/* Type icon: custom icon or Unicode fallback. Colored with
                      the semantic token matching the notification type. */}
                  <span style={{ fontSize: 16, marginTop: 2, flexShrink: 0, color: typeColors[item.type] }}>
                    {item.icon || (
                      item.type === 'success' ? '\u2713' :
                      item.type === 'error' ? '\u2717' :
                      item.type === 'warning' ? '\u26A0' :
                      '\u2139'
                    )}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {/* Unread titles are bold (600); read titles are normal (400) */}
                      <span style={{ fontSize: 'var(--ds-font-size-sm, 14px)', fontWeight: item.read ? 400 : 600 }}>
                        {item.title}
                      </span>
                      {/* Small primary dot for visual unread indicator */}
                      {!item.read && (
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ds-color-primary)', flexShrink: 0 }} />
                      )}
                    </div>
                    <div style={{ fontSize: 'var(--ds-font-size-xs, 12px)', color: 'var(--ds-color-text-muted)', marginTop: 2 }}>
                      {item.message}
                    </div>
                    {/* Footer row: timestamp + optional action button */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                      <span style={{ fontSize: 'var(--ds-font-size-xs, 12px)', color: 'var(--ds-color-text-muted)', opacity: 0.7 }}>
                        {formatTimestamp(item.timestamp)}
                      </span>
                      {item.action && (
                        <button
                          style={linkBtnStyle}
                          onClick={(e) => { e.stopPropagation(); item.action!.onClick(); }}
                        >
                          {item.action.label}
                        </button>
                      )}
                    </div>
                  </div>
                  {/* Dismiss button with muted styling so it does not compete
                      visually with the notification content */}
                  {onClear && (
                    <button
                      style={{ ...linkBtnStyle, color: 'var(--ds-color-text-muted)', opacity: 0.5, fontSize: 14, padding: 2 }}
                      onClick={(e) => { e.stopPropagation(); onClear(item.id); }}
                    >
                      x
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
