/**
 * @fileoverview Notification Modern Engine - Rottay Design System
 * @description Token-driven implementation of the Notification component.
 * Provides a lightweight notification experience on a self-contained,
 * skin-owned tree — no DaisyUI or utility-framework classes.
 *
 * @remarks
 * The Modern engine is a self-contained `rottay-notification--modern` tree:
 * - No DaisyUI classes: the stack container's `toast`/`toast-top`/
 *   `toast-bottom`/`toast-center`/`toast-start`/`toast-end` placement classes
 *   were drained (K4-A); the unlayered skin `notification.css` owns fixed
 *   placement, stacking and item surface paint outright
 * - Lightweight bundle size
 * - Easy customization through class overrides and token channels
 * - Consistent DS token theming integration
 *
 * This engine is recommended for applications prioritizing bundle size and
 * token theming over feature richness.
 *
 * Note: Static methods are not supported in Modern. Always use the Provider
 * and useNotification hook pattern.
 *
 * @example Basic Usage
 * ```tsx
 * import { NotificationProvider, useNotification } from '@rottay/design-system';
 *
 * function App() {
 *   return (
 *     <NotificationProvider>
 *       <MyComponent />
 *     </NotificationProvider>
 *   );
 * }
 *
 * function MyComponent() {
 *   const [api] = useNotification();
 *
 *   return (
 *     <button onClick={() => api.success({ message: 'Saved!' })}>
 *       Save
 *     </button>
 *   );
 * }
 * ```
 *
 * @module Notification/Engines/Modern
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import type {
  NotificationConfig,
  NotificationInstance,
  NotificationProviderProps,
  NotificationItemProps,
  NotificationType,
  NotificationPlacement,
} from '../../contracts';
import { NOTIFICATION_DEFAULTS } from '../../contracts';
import { warnOnceInDev } from '@/infrastructure/runtime/foundation/diagnostics/development-logging';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { useReducedMotion } from '@/graphics/motion/react/runtime';
import { governedExitMs } from '@/graphics/motion/react/runtime/presence/duration';
import { Portal } from '../../../../runtime/overlay/portal';
import { PortalScope, usePortalScope } from '../../../../runtime/overlay/portal-scope';
import { StatusInfoIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-info';
import { StatusSuccessIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-success';
import { StatusWarningIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-warning';
import { StatusErrorIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-error';
import { CommunicationNotificationIcon } from '@/graphics/icons/presentation/semantic/generated/roles/communication-notification';
import { ActionCloseIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-close';

// ============================================================================
// Internal Types
// ============================================================================

/**
 * Internal notification state with additional properties.
 *
 * @internal
 */
interface InternalNotification extends NotificationItemProps {
  /** Optional key for updating existing notifications */
  key?: string;
  /** Placement position for this notification */
  placement: NotificationPlacement;
}

// ============================================================================
// Context
// ============================================================================

/**
 * Context for providing notification API to child components.
 *
 * @internal
 */
const NotificationContext = createContext<NotificationInstance | null>(null);

// ============================================================================
// ID Generator
// ============================================================================

/**
 * Counter for generating unique notification IDs.
 *
 * @internal
 */
let notificationId = 0;

/**
 * Generates a unique notification ID.
 *
 * @returns Unique string identifier
 * @internal
 */
const generateId = () => `modern-notification-${++notificationId}`;

// ============================================================================
// Notification Provider
// ============================================================================

/**
 * Stack-item shell: owns one item's exit window. While `leaving` is true the
 * skin's exit animation plays on the inner card; the shell finalizes the exit
 * when the matching keyframes end (primary) or when a fallback timer derived
 * from the card's computed animation/transition duration fires (tests and
 * engines without animation events). The window is therefore always in
 * lockstep with the governed motion value — never a fixed JS constant.
 * @internal
 */
function NotificationStackItemShell({
  id,
  leaving,
  onExitDone,
  children,
}: {
  id: string;
  leaving: boolean;
  onExitDone: (id: string) => void;
  children: React.ReactNode;
}): React.ReactElement {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!leaving) return;
    const card = ref.current?.firstElementChild as HTMLElement | null;
    const timer = setTimeout(() => onExitDone(id), card ? governedExitMs(card) : 0);
    return () => clearTimeout(timer);
  }, [leaving, id, onExitDone]);

  return (
    <div
      ref={ref}
      data-part="stack-item"
      data-state={leaving ? 'leaving' : 'open'}
      style={{ display: 'contents' }}
      onAnimationEnd={(event) => {
        if (leaving && event.animationName.startsWith('ds-notification-exit')) onExitDone(id);
      }}
    >
      {children}
    </div>
  );
}

/**
 * NotificationProvider component for the Modern engine.
 *
 * @description
 * Provides notification context to child components and manages the
 * notification state. Placement and surface paint are owned by the unlayered
 * skin `notification.css`, keyed on the stamped `data-placement`/`data-tone`
 * attributes.
 *
 * @remarks
 * Key features:
 * - Context-based notification management
 * - Supports multiple placements simultaneously
 * - Automatic notification stacking and limiting
 * - Skin-owned placement (no DaisyUI toast classes)
 * - Stack containers portal to the shared top-layer root (a transformed or
 *   filtered ancestor can never trap their fixed placement), with the
 *   tenant/locale/direction lineage re-stamped across the portal boundary
 * - Graceful exits: dismissal stamps `data-state='leaving'` on the item's
 *   stack-item wrapper so the skin's exit animation plays before the node
 *   leaves state (immediate under reduced motion); `destroy()` stays the
 *   immediate teardown path
 *
 * @param props - {@link NotificationProviderProps}
 * @returns Provider component with notification containers
 *
 * @example
 * ```tsx
 * <NotificationProvider
 *   maxCount={5}
 *   placement="topRight"
 *   top={24}
 *   bottom={24}
 * >
 *   <App />
 * </NotificationProvider>
 * ```
 */
export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  maxCount = NOTIFICATION_DEFAULTS.maxCount,
  placement = NOTIFICATION_DEFAULTS.placement,
  top = NOTIFICATION_DEFAULTS.top,
  bottom = NOTIFICATION_DEFAULTS.bottom,
}) => {
  // ========================================================================
  // State Management
  // ========================================================================

  const [notifications, setNotifications] = useState<InternalNotification[]>([]);

  // Anchored portal scope (Modal engine idiom): the stack containers portal to
  // the shared top-layer root so a transformed/filtered ancestor can never
  // trap their fixed placement, and the portal scope re-stamps the
  // tenant/locale/direction lineage the portal boundary would otherwise cut.
  const [anchorEl, setAnchorEl] = useState<HTMLSpanElement | null>(null);
  const portalScope = usePortalScope(anchorEl);
  const reducedMotion = useReducedMotion();

  // Graceful exit bookkeeping: ids currently playing their exit animation.
  // Each leaving item's stack-item shell owns its exit window (animationend
  // primary, computed-duration fallback), so there are no provider-side
  // timers to cancel on unmount.
  const [leavingIds, setLeavingIds] = useState<ReadonlySet<string>>(() => new Set());

  const clearLeaving = useCallback((id: string) => {
    // Re-arming an id (keyed update) flips its shell back to `open`; the
    // shell's own effect cleanup cancels its pending fallback timer.
    setLeavingIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  // ========================================================================
  // Notification Actions
  // ========================================================================

  /**
   * Removes a notification by ID. The removal is GRACEFUL (Message family
   * parity): the item is stamped `data-state='leaving'` through its stack-item
   * shell, which owns the exit window from here on (animationend primary,
   * computed-duration fallback — never a fixed JS constant). Under reduced
   * motion there is no exit animation, so the item leaves immediately.
   * `destroy()` stays the immediate path.
   */
  const finalizeRemove = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setLeavingIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const removeNotification = useCallback(
    (id: string) => {
      if (reducedMotion) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        return;
      }
      setLeavingIds((prev) => {
        if (prev.has(id)) return prev;
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    },
    [reducedMotion]
  );

  /**
   * Adds a new notification to the stack.
   * Updates existing notification if key matches.
   */
  const addNotification = useCallback(
    (config: NotificationConfig & { type: NotificationType }) => {
      const id = config.key || generateId();

      // A keyed update re-arms a notification that may be mid-exit: cancel the
      // pending removal so the refreshed card never vanishes under the user.
      clearLeaving(id);

      const newNotification: InternalNotification = {
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
      };

      setNotifications((prev) => {
        // Update if key exists
        const existingIndex = prev.findIndex((n) => config.key && n.key === config.key);
        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = newNotification;
          return updated;
        }

        // Add new, respecting maxCount
        const updated = [...prev, newNotification];
        if (updated.length > maxCount) {
          return updated.slice(-maxCount);
        }
        return updated;
      });
    },
    [maxCount, placement, clearLeaving]
  );

  /**
   * Creates a notification method for a specific type.
   */
  const createNotificationMethod = useCallback(
    (type: NotificationType) => {
      return (config: NotificationConfig) => {
        addNotification({ ...config, type });
      };
    },
    [addNotification]
  );

  // ========================================================================
  // API Instance
  // ========================================================================

  /**
   * Notification API provided to consumers.
   */
  const notificationApi: NotificationInstance = {
    success: createNotificationMethod('success'),
    error: createNotificationMethod('error'),
    info: createNotificationMethod('info'),
    warning: createNotificationMethod('warning'),
    open: createNotificationMethod('open'),
    destroy: (key?: string) => {
      // destroy() is the IMMEDIATE path (explicit teardown): no exit motion,
      // and any mid-exit bookkeeping for the removed items is cancelled so a
      // dying timer can never touch a re-added key.
      const removed = key
        ? notifications.filter((n) => n.key === key || n.id === key)
        : notifications;
      removed.forEach((n) => clearLeaving(n.id));
      if (key) {
        setNotifications((prev) => prev.filter((n) => n.key !== key && n.id !== key));
      } else {
        setNotifications([]);
      }
    },
  };

  // ========================================================================
  // Grouping and Styling
  // ========================================================================

  // Grouping by placement creates separate DOM containers for each position,
  // allowing simultaneous notifications in different corners (e.g., success
  // in topRight while an error shows in bottomRight). Each group renders its
  // own stack container keyed on `data-placement` -- the unlayered skin
  // `notification.css` owns fixed placement outright; no DaisyUI toast
  // classes are emitted (drained in K4-A).
  const groupedNotifications = notifications.reduce<Record<NotificationPlacement, InternalNotification[]>>(
    (acc: Record<NotificationPlacement, InternalNotification[]>, notification) => {
      const p = notification.placement || placement;
      if (!acc[p]) acc[p] = [];
      acc[p].push(notification);
      return acc;
    },
    {} as Record<NotificationPlacement, InternalNotification[]>
  );

  // The provider's top/bottom props are block-axis offsets from the viewport
  // edge (pixel numbers per the contracts). The engine stamps the dynamic
  // value on the --ds-notification-stack-offset channel and the skin declares
  // the top/bottom property that consumes it, keeping the skin the single
  // paint owner while preserving the configurable-offset public API.
  const stackOffset = (value: number): React.CSSProperties =>
    ({ '--ds-notification-stack-offset': `${value}px` }) as React.CSSProperties;

  const placementStyles: Record<NotificationPlacement, React.CSSProperties> = {
    top: stackOffset(top),
    topLeft: stackOffset(top),
    topRight: stackOffset(top),
    bottom: stackOffset(bottom),
    bottomLeft: stackOffset(bottom),
    bottomRight: stackOffset(bottom),
  };

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <NotificationContext.Provider value={notificationApi}>
      {children}
      {/* Inline anchor: the provider's own DOM position carries the
          tenant/locale/direction lineage that `usePortalScope` snapshots and
          re-stamps around the portaled stacks (Modal engine idiom). */}
      <span ref={setAnchorEl} data-part="anchor" />
      {/* Render notification containers for each placement with notifications.
          The stacks portal to the shared top-layer root: a `position: fixed`
          container rendered inline would be trapped by any ancestor transform,
          filter or backdrop-filter (new containing block), breaking the
          placement contract near app-shell chrome. The display:contents scope
          wrapper adds no layout box. The portal only mounts while at least one
          stack is alive (a leaving item is still alive until its exit timer
          drops it, so exits never lose their stage). */}
      {Object.keys(groupedNotifications).length === 0 ? null : (
        <Portal>
          <PortalScope snapshot={portalScope}>
            {Object.entries(groupedNotifications).map(([p, items]) => (
              <div
                key={p}
                data-part="stack-container"
                data-placement={p}
                className="rottay-notification-stack--modern"
                style={placementStyles[p as NotificationPlacement]}
              >
                {items.map((notification) => {
                  const { key: _notificationKey, ...notificationProps } = notification;

                  return (
                    <NotificationStackItemShell
                      key={notification.id}
                      id={notification.id}
                      leaving={leavingIds.has(notification.id)}
                      onExitDone={finalizeRemove}
                    >
                      <NotificationItem
                        {...notificationProps}
                        onRemove={removeNotification}
                      />
                    </NotificationStackItemShell>
                  );
                })}
              </div>
            ))}
          </PortalScope>
        </Portal>
      )}
    </NotificationContext.Provider>
  );
};

NotificationProvider.displayName = 'NotificationProvider.Modern';

// ============================================================================
// useNotification Hook
// ============================================================================

/**
 * Hook for accessing the notification API in the Modern engine.
 *
 * @description
 * Returns a notification API instance. Unlike Classic, Modern doesn't need
 * a context holder element since notifications are rendered by the provider.
 *
 * @remarks
 * Must be used within a NotificationProvider. If used outside, returns
 * a no-op API that logs warnings.
 *
 * @returns Tuple of [NotificationInstance, null]
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const [api] = useNotification();
 *
 *   return (
 *     <button onClick={() => api.success({ message: 'Done!' })}>
 *       Complete
 *     </button>
 *   );
 * }
 * ```
 */
export function useNotification(): [NotificationInstance, React.ReactElement | null] {
  const context = useContext(NotificationContext);

  // Return no-op API if outside provider
  if (!context) {
    const noop = () => {};
    return [
      {
        success: noop,
        error: noop,
        info: noop,
        warning: noop,
        open: noop,
        destroy: () => {},
      },
      null,
    ];
  }

  return [context, null];
}

// ============================================================================
// Notification Item Component
// ============================================================================

/**
 * NotificationItem component for the Modern engine.
 *
 * @description
 * Renders an individual notification as a self-contained
 * `rottay-notification--modern` tree. All static surface paint lives in the
 * unlayered skin `notification.css`.
 *
 * @remarks
 * Skin-owned paint, keyed on stamped data attributes:
 * - No DaisyUI classes; tone is keyed on `data-tone`
 * - Token-driven backgrounds and colors for type variants (success, error, info, warning, open)
 * - Skin-owned elevation shadow
 *
 * @param props - {@link NotificationItemProps}
 * @returns A DS token-styled notification item
 *
 * @example
 * ```tsx
 * <NotificationItem
 *   id="notif-1"
 *   type="success"
 *   message="File Uploaded"
 *   description="Your file has been uploaded successfully."
 *   duration={4.5}
 *   closable
 *   onRemove={(id) => handleRemove(id)}
 * />
 * ```
 */
export const NotificationItem: React.FC<NotificationItemProps> = ({
  id,
  type,
  message,
  description,
  duration = NOTIFICATION_DEFAULTS.duration,
  onClose,
  onClick,
  icon,
  className = '',
  style,
  actions,
  closeIcon,
  closable = NOTIFICATION_DEFAULTS.closable,
  role,
  onRemove,
}) => {
  const i18n = useOptionalTranslation('components');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ========================================================================
  // Auto-close countdown with hover AND focus pause (Toast family parity):
  // hovering or tabbing into the card freezes BOTH the JS countdown
  // (remaining-time tracked, never a full restart) and the skin's progress
  // bar (data-paused), so a user reading or operating a long notification
  // never loses it mid-sentence.
  // ========================================================================

  const [isPaused, setIsPaused] = useState(false);
  const remainingRef = useRef<number>(duration && duration > 0 ? duration * 1000 : 0);
  const startedAtRef = useRef(0);
  // A duration prop change re-arms the countdown from its full length,
  // matching the pre-pause contract.
  const prevDurationRef = useRef(duration);
  if (prevDurationRef.current !== duration) {
    prevDurationRef.current = duration;
    remainingRef.current = duration && duration > 0 ? duration * 1000 : 0;
  }

  useEffect(() => {
    if (duration && duration > 0 && !isPaused) {
      startedAtRef.current = Date.now();
      timerRef.current = setTimeout(() => {
        onRemove?.(id);
        onClose?.();
      }, remainingRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [id, duration, isPaused, onRemove, onClose]);

  const pauseCountdown = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startedAtRef.current));
    }
    setIsPaused(true);
  };
  const resumeCountdown = () => setIsPaused(false);
  // Keyboard parity for the hover pause (Toast/Message engines' contains-check
  // precedent): focus bubbles in React, so a blur that lands on ANOTHER
  // descendant of the same card (close button -> action button) must not
  // resume the countdown -- only a blur that leaves the card entirely does.
  const handleBlurResume = (event: React.FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null;
    if (!next || !event.currentTarget.contains(next)) resumeCountdown();
  };

  // ========================================================================
  // Event Handlers
  // ========================================================================

  /**
   * Handles manual close of the notification.
   */
  const handleClose = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    onRemove?.(id);
    onClose?.();
  };

  // ========================================================================
  // Style Definitions
  // ========================================================================

  // Per-type fill and text colour are keyed on `data-tone` in the unlayered modern
  // Notification skin. The root carries NO DaisyUI class: the skin is the single
  // paint owner and derives every tone -- including `open` (primary accent) --
  // from --ds-notification-accent.

  const icons: Record<NotificationType, ReactNode> = {
    success: <StatusSuccessIcon decorative size={20} />,
    error: <StatusErrorIcon decorative size={20} />,
    info: <StatusInfoIcon decorative size={20} />,
    warning: <StatusWarningIcon decorative size={20} />,
    open: <CommunicationNotificationIcon decorative size={20} />,
  };

  // ========================================================================
  // Render
  // ========================================================================

  // The skin owns width (full-width of the stack container) and elevation.
  // role="alert" triggers immediate screen reader announcement for urgent
  // types; quieter types announce politely through role="status".
  return (
    <div
      data-part="root"
      data-tone={type}
      data-has-description={description ? 'true' : 'false'}
      data-has-actions={actions ? 'true' : 'false'}
      data-closable={closable ? 'true' : 'false'}
      data-clickable={onClick ? 'true' : 'false'}
      data-paused={isPaused ? 'true' : 'false'}
      className={`rottay-notification--modern ${className}`}
      style={{
        '--ds-notification-duration': duration && duration > 0 ? `${duration}s` : undefined,
        ...style,
      } as React.CSSProperties}
      onClick={onClick}
      onMouseEnter={pauseCountdown}
      onMouseLeave={resumeCountdown}
      onFocus={pauseCountdown}
      onBlur={handleBlurResume}
      onKeyDown={(event) => {
        // Escape dismisses a closable notification while focus lives inside it
        // (Toast engine parity: a transient surface yields to the keyboard).
        // Non-closable notifications are deliberately sticky, so the key stays
        // inert there. Focus is never moved by the dismiss itself.
        if (event.key === 'Escape') {
          if (closable) handleClose();
          return;
        }
        if (onClick && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          onClick();
        }
      }}
      tabIndex={onClick ? 0 : undefined}
      role={role ?? (type === 'error' || type === 'warning' ? 'alert' : 'status')}
    >
      <div data-part="layout">
        {/* Icon */}
        {icon !== null && <span data-part="icon">{icon || icons[type]}</span>}

        {/* Content */}
        <div data-part="body">
          {/* Title */}
          <div data-part="title">{message}</div>

          {/* Description */}
          {description && <div data-part="description">{description}</div>}

          {/* Action Button */}
          {actions && (
            <div data-part="action" data-slot="actions">
              {actions}
            </div>
          )}
        </div>

        {/* Close Button */}
        {closable && (
          <button
            type="button"
            data-part="close-button"
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            aria-label={i18n?.tOr('notification.close', 'Close') ?? 'Close'}
          >
            {closeIcon || <ActionCloseIcon decorative size={16} />}
          </button>
        )}
      </div>
      {duration !== null && duration > 0 && <span data-part="progress" aria-hidden="true" />}
    </div>
  );
};

NotificationItem.displayName = 'NotificationItem.Modern';

// ============================================================================
// Static Notification Methods (Not Supported)
// ============================================================================

/**
 * Static notification API for the Modern engine.
 *
 * @remarks
 * Static methods are not supported in the Modern engine because it relies
 * on React context for state management. All methods will log a warning
 * instructing users to use the Provider and hook pattern instead.
 *
 * @example
 * ```tsx
 * // DON'T do this with Modern:
 * notification.success({ message: 'Hello' }); // Will only log a warning
 *
 * // DO this instead:
 * function MyComponent() {
 *   const [api] = useNotification();
 *   api.success({ message: 'Hello' }); // Works correctly
 * }
 * ```
 */
export const notification: NotificationInstance = {
  success: () => warnOnceInDev('notification-modern:provider-required', 'Modern notification: Please use NotificationProvider and useNotification hook'),
  error: () => warnOnceInDev('notification-modern:provider-required', 'Modern notification: Please use NotificationProvider and useNotification hook'),
  info: () => warnOnceInDev('notification-modern:provider-required', 'Modern notification: Please use NotificationProvider and useNotification hook'),
  warning: () => warnOnceInDev('notification-modern:provider-required', 'Modern notification: Please use NotificationProvider and useNotification hook'),
  open: () => warnOnceInDev('notification-modern:provider-required', 'Modern notification: Please use NotificationProvider and useNotification hook'),
  destroy: () => warnOnceInDev('notification-modern:provider-required', 'Modern notification: Please use NotificationProvider and useNotification hook'),
};

// ============================================================================
// Default Export
// ============================================================================

/**
 * Default export containing all Modern engine exports.
 */
export default {
  NotificationProvider,
  NotificationItem,
  useNotification,
  notification,
};
