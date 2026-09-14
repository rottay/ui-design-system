'use client';

/**
 * @fileoverview Notification Modern Engine - Rottay Design System.
 *
 * The notification role of the Notifier: the provider keeps the queue (keyed
 * updates, max count, per-placement stacks) and renders each entry as a
 * `ds-notifier` surface with `data-variant="notification"` inside a notifier
 * stack on the shared toast overlay band.
 *
 * Static methods are not supported in Modern; use the provider and
 * `useNotification`.
 *
 * @module Notification/Engines/Modern
 * @category Feedback
 * @package @rottay/design-system
 */

import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import type {
  NotificationConfig,
  NotificationInstance,
  NotificationItemProps,
  NotificationPlacement,
  NotificationProviderProps,
  NotificationType,
} from '../../contracts';
import { NOTIFICATION_DEFAULTS } from '../../contracts';
import { warnOnceInDev } from '@/infrastructure/runtime/foundation/diagnostics/development-logging';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { FieldOverlayPanel, useFieldOverlay } from '../../../../runtime/overlay/field-overlay';
import { NotifierItem, NotifierStack, type NotifierPlacement, type NotifierTone } from '../../../notifier';

interface InternalNotification extends NotificationItemProps {
  key?: string;
  placement: NotificationPlacement;
}

const NotificationContext = createContext<NotificationInstance | null>(null);

let notificationId = 0;
const generateId = () => `modern-notification-${++notificationId}`;

const PLACEMENTS: Record<NotificationPlacement, NotifierPlacement> = {
  top: 'top',
  topLeft: 'top-start',
  topRight: 'top-end',
  bottom: 'bottom',
  bottomLeft: 'bottom-start',
  bottomRight: 'bottom-end',
};

const TONES: Record<NotificationType, NotifierTone> = {
  success: 'success',
  error: 'error',
  info: 'info',
  warning: 'warning',
  open: 'neutral',
};

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  maxCount = NOTIFICATION_DEFAULTS.maxCount,
  placement = NOTIFICATION_DEFAULTS.placement,
  top = NOTIFICATION_DEFAULTS.top,
  bottom = NOTIFICATION_DEFAULTS.bottom,
}) => {
  const [notifications, setNotifications] = useState<InternalNotification[]>([]);
  const [anchorEl, setAnchorEl] = useState<HTMLSpanElement | null>(null);
  const revisionRef = useRef(0);

  // The stacks portal to the shared top-layer root, re-entering the tenant and
  // direction scope read from the provider's inline anchor.
  const overlay = useFieldOverlay({
    kind: 'toast',
    open: notifications.length > 0,
    anchor: anchorEl,
    surface: 'viewport',
    modal: false,
    lockScroll: false,
    restoreFocus: false,
  });

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addNotification = useCallback(
    (config: NotificationConfig & { type: NotificationType }) => {
      const id = config.key || generateId();
      const entry: InternalNotification = {
        id,
        key: config.key,
        type: config.type,
        message: config.message,
        description: config.description,
        duration: config.duration ?? NOTIFICATION_DEFAULTS.duration,
        onClose: config.onClose,
        onClick: config.onClick,
        icon: config.icon,
        className: config.className,
        style: config.style,
        actions: config.actions,
        closeIcon: config.closeIcon,
        closable: config.closable ?? NOTIFICATION_DEFAULTS.closable,
        role: config.role,
        placement: config.placement || placement,
        revision: ++revisionRef.current,
      };
      setNotifications((prev) => {
        const existing = prev.findIndex((n) => config.key && n.key === config.key);
        if (existing !== -1) {
          const updated = [...prev];
          updated[existing] = entry;
          return updated;
        }
        const updated = [...prev, entry];
        return updated.length > maxCount ? updated.slice(-maxCount) : updated;
      });
    },
    [maxCount, placement],
  );

  const method = useCallback(
    (type: NotificationType) => (config: NotificationConfig) => addNotification({ ...config, type }),
    [addNotification],
  );

  const api: NotificationInstance = {
    success: method('success'),
    error: method('error'),
    info: method('info'),
    warning: method('warning'),
    open: method('open'),
    destroy: (key?: string) => {
      if (key) setNotifications((prev) => prev.filter((n) => n.key !== key && n.id !== key));
      else setNotifications([]);
    },
  };

  const stacks = notifications.reduce<Partial<Record<NotificationPlacement, InternalNotification[]>>>((acc, entry) => {
    (acc[entry.placement] ??= []).push(entry);
    return acc;
  }, {});

  return (
    <NotificationContext.Provider value={api}>
      {children}
      <span ref={setAnchorEl} data-part="anchor" />
      {notifications.length === 0 ? null : (
        <FieldOverlayPanel overlay={overlay}>
          {(Object.entries(stacks) as Array<[NotificationPlacement, InternalNotification[]]>).map(([edge, items]) => (
            <NotifierStack
              key={edge}
              role="notification"
              placement={PLACEMENTS[edge]}
              layer={overlay.zIndex}
              offset={edge.startsWith('top') ? top : bottom}
              data-overlay-layer={overlay.panelProps['data-overlay-layer']}
              data-overlay-kind={overlay.panelProps['data-overlay-kind']}
            >
              {items.map(({ key: _key, placement: _placement, ...item }) => (
                <NotificationItem key={item.id} {...item} onRemove={removeNotification} />
              ))}
            </NotifierStack>
          ))}
        </FieldOverlayPanel>
      )}
    </NotificationContext.Provider>
  );
};

NotificationProvider.displayName = 'NotificationProvider.Modern';

export function useNotification(): [NotificationInstance, React.ReactElement | null] {
  const context = useContext(NotificationContext);
  if (context) return [context, null];
  const noop = () => {};
  return [{ success: noop, error: noop, info: noop, warning: noop, open: noop, destroy: noop }, null];
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  id,
  type,
  message,
  description,
  duration = NOTIFICATION_DEFAULTS.duration,
  onClose,
  onClick,
  icon,
  className,
  style,
  actions,
  closeIcon,
  closable = NOTIFICATION_DEFAULTS.closable,
  role,
  onRemove,
  revision,
}) => {
  const i18n = useOptionalTranslation('components');
  return (
    <NotifierItem
      role="notification"
      tone={TONES[type] ?? 'neutral'}
      title={message}
      description={description}
      icon={icon}
      actions={actions}
      closable={closable}
      closeIcon={closeIcon}
      closeLabel={i18n?.tOr('notification.close', 'Close') ?? 'Close'}
      duration={duration && duration > 0 ? duration * 1000 : 0}
      onDismiss={onClose}
      onExited={() => onRemove?.(id)}
      onActivate={onClick}
      announce={role ?? (type === 'error' || type === 'warning' ? 'alert' : 'status')}
      itemKey={id}
      revision={revision}
      className={className}
      style={style}
    />
  );
};

NotificationItem.displayName = 'NotificationItem.Modern';

const requireProvider = () =>
  warnOnceInDev(
    'notification-modern:provider-required',
    'Modern notification: Please use NotificationProvider and useNotification hook',
  );

export const notification: NotificationInstance = {
  success: requireProvider,
  error: requireProvider,
  info: requireProvider,
  warning: requireProvider,
  open: requireProvider,
  destroy: requireProvider,
};

export default {
  NotificationProvider,
  NotificationItem,
  useNotification,
  notification,
};
