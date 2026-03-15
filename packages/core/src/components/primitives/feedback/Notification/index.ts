/**
 * @fileoverview Notification Component - Rottay Design System
 * @description An imperative API for displaying global notifications/alerts that appear
 * at the corner of the screen. Part of the Rottay Design System's feedback primitives collection.
 *
 * @remarks
 * The Notification component is built on Rottay's multi-engine architecture, allowing
 * seamless rendering across Classic (Ant Design), Modern (DaisyUI), and Rustic
 * (Vanilla) engines. This ensures consistent behavior while adapting to your
 * project's styling framework.
 *
 * Multi-tenant theming is fully supported - notification styling automatically adapts
 * to your tenant's brand colors, spacing, and typography tokens.
 *
 * Unlike Toast/Message components which are brief, Notifications are more prominent
 * and typically include a title, description, and optional action buttons.
 *
 * @example Basic Usage with Provider and Hook
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
 *   const [notificationApi, contextHolder] = useNotification();
 *
 *   const showSuccess = () => {
 *     notificationApi.success({
 *       message: 'Operation Successful',
 *       description: 'Your changes have been saved successfully.'
 *     });
 *   };
 *
 *   return (
 *     <>
 *       {contextHolder}
 *       <button onClick={showSuccess}>Save</button>
 *     </>
 *   );
 * }
 * ```
 *
 * @example Different Notification Types
 * ```tsx
 * import { useNotification } from '@rottay/design-system';
 *
 * function NotificationDemo() {
 *   const [api] = useNotification();
 *
 *   return (
 *     <div>
 *       <button onClick={() => api.success({ message: 'Success!', description: 'Task completed.' })}>
 *         Success
 *       </button>
 *       <button onClick={() => api.error({ message: 'Error!', description: 'Something went wrong.' })}>
 *         Error
 *       </button>
 *       <button onClick={() => api.info({ message: 'Info', description: 'Here is some information.' })}>
 *         Info
 *       </button>
 *       <button onClick={() => api.warning({ message: 'Warning', description: 'Please be careful.' })}>
 *         Warning
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example With Custom Duration and Placement
 * ```tsx
 * import { useNotification } from '@rottay/design-system';
 *
 * function CustomNotification() {
 *   const [api] = useNotification();
 *
 *   const showNotification = () => {
 *     api.info({
 *       message: 'Custom Notification',
 *       description: 'This notification will stay for 10 seconds.',
 *       duration: 10,
 *       placement: 'bottomRight',
 *     });
 *   };
 *
 *   return <button onClick={showNotification}>Show</button>;
 * }
 * ```
 *
 * @example With Action Buttons
 * ```tsx
 * import { useNotification, Button } from '@rottay/design-system';
 *
 * function NotificationWithActions() {
 *   const [api] = useNotification();
 *
 *   const showWithAction = () => {
 *     const key = 'updatable';
 *     api.open({
 *       message: 'Confirm Action',
 *       description: 'Do you want to proceed with this action?',
 *       key,
 *       duration: 0, // Won't auto-close
 *       actions: (
 *         <Button size="sm" onClick={() => api.destroy(key)}>
 *           Confirm
 *         </Button>
 *       ),
 *     });
 *   };
 *
 *   return <button onClick={showWithAction}>Show Confirmation</button>;
 * }
 * ```
 *
 * @example Static Methods (Classic Engine Only)
 * ```tsx
 * import { notification } from '@rottay/design-system';
 *
 * // These static methods work without a provider (Classic engine only)
 * notification.success({ message: 'Success!', description: 'Details...' });
 * notification.error({ message: 'Error!', description: 'Details...' });
 * notification.info({ message: 'Info!', description: 'Details...' });
 * notification.warning({ message: 'Warning!', description: 'Details...' });
 *
 * // Destroy a specific notification by key
 * notification.destroy('my-notification-key');
 *
 * // Destroy all notifications
 * notification.destroy();
 * ```
 *
 * @example Multi-Tenant Theming
 * ```tsx
 * import { ThemeProvider, NotificationProvider, useNotification } from '@rottay/design-system';
 *
 * // Notifications automatically inherit tenant theme
 * <ThemeProvider tenant="acme-corp">
 *   <NotificationProvider>
 *     <App />
 *     {/* Notifications use ACME Corp's brand colors and styling *\/}
 *   </NotificationProvider>
 * </ThemeProvider>
 * ```
 *
 * @example Provider Configuration
 * ```tsx
 * import { NotificationProvider } from '@rottay/design-system';
 *
 * <NotificationProvider
 *   maxCount={5}
 *   placement="topRight"
 *   top={24}
 *   bottom={24}
 * >
 *   <App />
 * </NotificationProvider>
 * ```
 *
 * @see {@link NotificationConfig} for notification configuration options
 * @see {@link NotificationInstance} for API methods
 * @see {@link NotificationProviderProps} for provider props
 * @see {@link useNotification} for the notification hook
 * @see {@link Message} for brief, non-intrusive messages
 * @see {@link Alert} for inline alert messages
 *
 * @module Notification
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import React from 'react';
import { useEngineContext } from '../../../../core/providers/engine';
import type { EngineName } from '../../../../core/types';
import * as classicEngine from './engines/classic';
import * as modernEngine from './engines/modern';
import * as rusticEngine from './engines/rustic';

// ============================================================================
// Type Exports
// ============================================================================

export {
  type NotificationType,
  type NotificationPlacement,
  type NotificationConfig,
  type NotificationArgsProps,
  type NotificationInstance,
  type NotificationGlobalConfig,
  type NotificationProviderProps,
  type NotificationItemProps,
  NOTIFICATION_DEFAULTS,
  NOTIFICATION_ICONS,
} from './types';

// ============================================================================
// Component Exports (Classic Engine - Default)
// ============================================================================

const notificationEngines = {
  classic: classicEngine,
  modern: modernEngine,
  rustic: rusticEngine,
} as const satisfies Record<Exclude<EngineName, 'athena'>, typeof classicEngine>;

function resolveNotificationEngine(engine: EngineName) {
  if (engine === 'athena') {
    return classicEngine;
  }

  return notificationEngines[engine];
}

export const NotificationProvider: React.FC<
  React.ComponentProps<typeof classicEngine.NotificationProvider>
> = (props) => {
  const { engine } = useEngineContext();
  const Provider = resolveNotificationEngine(engine).NotificationProvider;
  return React.createElement(Provider, props);
};

export const NotificationItem: React.FC<React.ComponentProps<typeof classicEngine.NotificationItem>> = (
  props
) => {
  const { engine } = useEngineContext();
  const Item = resolveNotificationEngine(engine).NotificationItem;
  return React.createElement(Item, props);
};

export function useNotification() {
  const { engine } = useEngineContext();
  return resolveNotificationEngine(engine).useNotification();
}

// ============================================================================
// Default Export
// ============================================================================

/**
 * Default export provides all Classic engine exports.
 *
 * @example
 * ```tsx
 * import Notification from '@rottay/design-system/Notification';
 *
 * const { NotificationProvider, useNotification, notification } = Notification;
 * ```
 */
export const notification = classicEngine.notification;

export default {
  NotificationProvider,
  NotificationItem,
  useNotification,
  notification,
};
