'use client';

/**
 * NotificationCenter - Rustic Engine (Inline styles with --ds-* CSS variables)
 */

import React, { useState, useRef, useEffect, useCallback, type CSSProperties } from 'react';
import type { NotificationCenterProps, Notification } from '../NotificationCenter.types';

const typeColors: Record<string, string> = {
  info: 'var(--ds-color-primary)',
  success: 'var(--ds-color-success)',
  warning: 'var(--ds-color-warning)',
  error: 'var(--ds-color-error)',
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

const triggerBtnStyle: CSSProperties = {
  position: 'relative',
  background: 'none',
  border: 'none',
  padding: 8,
  cursor: 'pointer',
  fontSize: 20,
  color: 'var(--ds-color-text)',
  borderRadius: 'var(--ds-radius-md, 6px)',
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
  borderRadius: 'var(--ds-radius-lg, 8px)',
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

  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen ?? internalOpen;
  const containerRef = useRef<HTMLDivElement>(null);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (controlledOpen === undefined) setInternalOpen(newOpen);
    onOpenChange?.(newOpen);
  }, [controlledOpen, onOpenChange]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
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
      ref={containerRef}
      className={className}
      style={{ position: 'relative', display: 'inline-block', ...style }}
    >
      {/* Trigger */}
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

          {/* List */}
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
                      <span style={{ fontSize: 'var(--ds-font-size-sm, 13px)', fontWeight: item.read ? 400 : 600 }}>
                        {item.title}
                      </span>
                      {!item.read && (
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ds-color-primary)', flexShrink: 0 }} />
                      )}
                    </div>
                    <div style={{ fontSize: 'var(--ds-font-size-xs, 12px)', color: 'var(--ds-color-text-muted)', marginTop: 2 }}>
                      {item.message}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                      <span style={{ fontSize: 'var(--ds-font-size-xs, 11px)', color: 'var(--ds-color-text-muted)', opacity: 0.7 }}>
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
