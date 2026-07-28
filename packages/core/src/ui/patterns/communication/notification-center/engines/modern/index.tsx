'use client';

/**
 * @fileoverview Modern engine for the NotificationCenter pattern.
 * Builds a dropdown panel (no Ant Popover) with manual click-outside detection,
 * supporting both controlled and uncontrolled open state. Notifications are
 * rendered in a scrollable list with per-type semantic iconography.
 *
 * The pattern COMPOSES public DS primitives — Button (header actions, row
 * action, dismiss), Badge (unread count), Empty (empty state) and Spinner
 * (loading) — and never recreates a control with its own HTML/CSS. Geometry
 * and the pattern's own paint live in the unlayered modern
 * notification-center skin, keyed on the `data-part`/`data-*` contract this
 * file stamps. Own copy resolves through the optional `components` i18n
 * channel with an English floor.
 *
 * @example
 * <ModernNotificationCenter
 *   notifications={[{ id: '1', title: 'Build passed', message: 'CI green on main', type: 'success', read: false, timestamp: new Date().toISOString() }]}
 *   onRead={(id) => markRead(id)}
 *   maxVisible={5}
 * />
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Button from '../../../../../primitives/inputs/Button/engines/modern';
import ModernBadge from '../../../../../primitives/display/Badge/engines/modern';
import ModernEmpty from '../../../../../primitives/display/Empty/engines/modern';
import ModernSpinner from '../../../../../primitives/feedback/Spinner/engines/modern';
import type { NotificationCenterProps, Notification } from '../../contracts';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { CommunicationNotificationIcon } from '@/graphics/icons/presentation/semantic/generated/roles/communication-notification';
import { StatusInfoIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-info';
import { StatusSuccessIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-success';
import { StatusWarningIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-warning';
import { StatusErrorIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-error';
import { ActionCloseIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-close';

/** Semantic per-type iconography (the skin owns the per-type accent color). */
const TYPE_ICON: Record<Notification['type'], React.ReactNode> = {
  info: <StatusInfoIcon decorative size={16} />,
  success: <StatusSuccessIcon decorative size={16} />,
  warning: <StatusWarningIcon decorative size={16} />,
  error: <StatusErrorIcon decorative size={16} />,
};

type Copy = {
  title: string;
  markAllRead: string;
  clearAll: string;
  empty: string;
  dismiss: string;
};

/**
 * Progressive degradation from relative ("3m ago") to calendar ("Mar 5").
 * Keeps recent notifications scannable while older ones stay unambiguous.
 * Relative units resolve through the i18n copy channel (English floor).
 */
function formatTimestamp(ts: string, tOr: (key: string, floor: string, params?: Record<string, string | number>) => string): string {
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return tOr('notificationCenter.justNow', 'just now');
  if (diffMin < 60) return tOr('notificationCenter.minutesAgo', '{count}m ago', { count: diffMin });
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return tOr('notificationCenter.hoursAgo', '{count}h ago', { count: diffHr });
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return tOr('notificationCenter.daysAgo', '{count}d ago', { count: diffDay });
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/**
 * Modern engine for the NotificationCenter pattern.
 *
 * Uses a dropdown shell with manual click-outside detection to support
 * both controlled and uncontrolled open states. The default trigger is a
 * semantic bell icon with a composed Badge for the unread count; the
 * trigger's inline 40x40 icon geometry is pinned by the public test
 * contract and deliberately stays inline.
 *
 * @param props - {@link NotificationCenterProps}
 * @returns A dropdown notification center composed of DS primitives.
 */
export default function ModernNotificationCenter(props: NotificationCenterProps) {
  // Optional channel with an English floor: the center renders standalone
  // (no I18nProvider) without crashing, and never echoes a raw key.
  const i18n = useOptionalTranslation('components');
  const tOr = (key: string, floor: string, params?: Record<string, string | number>): string =>
    i18n?.tOr(key, floor, params) ?? floor;

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
    emptyMessage: emptyMessageProp,
    maxVisible = 10,
    loading,
    className,
    style,
  } = props;

  const copy: Copy = {
    title: tOr('notificationCenter.title', 'Notifications'),
    markAllRead: tOr('notificationCenter.markAllRead', 'Mark all read'),
    clearAll: tOr('notificationCenter.clearAll', 'Clear all'),
    empty: tOr('notificationCenter.empty', 'No notifications'),
    dismiss: tOr('notificationCenter.dismiss', 'Dismiss'),
  };
  const emptyMessage = emptyMessageProp ?? copy.empty;

  // Controlled/uncontrolled open state pattern -- see Classic engine for the
  // same approach. When `controlledOpen` is undefined, internal state drives.
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen ?? internalOpen;
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (controlledOpen === undefined) setInternalOpen(newOpen);
    onOpenChange?.(newOpen);
  }, [controlledOpen, onOpenChange]);

  // Manual click-outside detection because the dropdown toggle does not
  // support controlled open state. Only attached while open to avoid
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

  // Loading state: the composed Spinner primitive owns ring and cadence; the
  // skin owns the centering frame.
  if (loading) {
    return (
      <div
        data-part="root"
        data-loading="true"
        className={`ds-pattern-notification-center ds-engine-modern ${className ?? ''}`}
        style={style}
      >
        <ModernSpinner size="md" data-part="loading-spinner" />
      </div>
    );
  }

  return (
    <div
      ref={dropdownRef}
      data-part="root"
      data-loading="false"
      className={`ds-pattern-notification-center ds-engine-modern ${className ?? ''}`}
      style={{ ...style, position: 'relative', display: 'inline-block' }}
    >
      {/* Trigger: semantic bell icon with a composed unread-count Badge.
          A custom trigger replaces the entire button contents when provided.
          The inline 40x40 icon geometry is pinned by the public test contract. */}
      <Button
        variant="ghost"
        htmlType="button"
        data-part="trigger"
        style={{ height: 40, width: 40, padding: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        onClick={() => handleOpenChange(!isOpen)}
        data-testid="notification-trigger"
        aria-label={copy.title}
      >
        {trigger || (
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <CommunicationNotificationIcon decorative size={20} />
            {displayCount > 0 && (
              <ModernBadge
                count={displayCount}
                variant="primary"
                size="xs"
                data-part="badge"
              />
            )}
          </div>
        )}
      </Button>

      {/* Dropdown panel (position and chrome are skin-owned) */}
      {isOpen && (
        <div data-part="panel">
          {/* Header */}
          <div data-part="header">
            <span data-part="title">{copy.title}</span>
            <div data-part="header-actions">
              {onReadAll && displayCount > 0 && (
                <Button
                  variant="ghost"
                  size="xs"
                  data-part="mark-all-read"
                  onClick={onReadAll}
                >
                  {copy.markAllRead}
                </Button>
              )}
              {onClearAll && notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="xs"
                  data-part="clear-all"
                  onClick={onClearAll}
                >
                  {copy.clearAll}
                </Button>
              )}
            </div>
          </div>

          {/* Scrollable notification list. Unread rows get a subtle primary
              tint (skin-owned). A custom icon takes priority over the
              semantic per-type icon. */}
          <div data-part="list">
            {visibleNotifications.length === 0 ? (
              <div data-part="empty">
                <ModernEmpty description={emptyMessage} />
              </div>
            ) : (
              <ul data-part="rows">
                {visibleNotifications.map(item => (
                  <li key={item.id}>
                    <div
                      data-part="row"
                      data-unread={!item.read}
                      onClick={() => onRead?.(item.id)}
                    >
                      <div data-part="icon" data-type={item.type}>
                        {item.icon || TYPE_ICON[item.type]}
                      </div>
                      <div data-part="row-body">
                        <div data-part="row-heading">
                          <span data-part="row-title" data-unread={!item.read}>{item.title}</span>
                          {!item.read && <div data-part="unread-dot" data-unread={true} />}
                        </div>
                        <p data-part="row-message">{item.message}</p>
                        <div data-part="row-footer">
                          <span data-part="row-timestamp">{formatTimestamp(item.timestamp, tOr)}</span>
                          {/* stopPropagation prevents the action click from also
                              firing the row-level onRead handler */}
                          {item.action && (
                            <Button
                              variant="ghost"
                              size="xs"
                              data-part="action"
                              onClick={(e: React.MouseEvent) => { e.stopPropagation(); item.action!.onClick(); }}
                            >
                              {item.action.label}
                            </Button>
                          )}
                        </div>
                      </div>
                      {/* Dismiss button: quiet until hover/focus (skin-owned) */}
                      {onClear && (
                        <Button
                          variant="ghost"
                          size="xs"
                          data-part="dismiss"
                          icon={<ActionCloseIcon decorative size={12} />}
                          aria-label={copy.dismiss}
                          onClick={(e: React.MouseEvent) => { e.stopPropagation(); onClear(item.id); }}
                        />
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
