/**
 * Notification - Engine Router
 * Imperative API for global notifications
 *
 * Usage:
 * ```tsx
 * // With Provider (recommended)
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
 *   return (
 *     <>
 *       {contextHolder}
 *       <button onClick={() => notificationApi.success({
 *         message: 'Success!',
 *         description: 'Operation completed successfully.'
 *       })}>
 *         Show Notification
 *       </button>
 *     </>
 *   );
 * }
 *
 * // With static methods (Titan only)
 * import { notification } from '@rottay/design-system';
 *
 * notification.success({ message: 'Success!', description: 'Details...' });
 * notification.error({ message: 'Error!', description: 'Details...' });
 * notification.info({ message: 'Info!', description: 'Details...' });
 * notification.warning({ message: 'Warning!', description: 'Details...' });
 * ```
 */

// Re-export types
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

// Re-export from Titan engine (default)
export {
  NotificationProvider,
  NotificationItem,
  useNotification,
  notification,
} from './engines/titan';

// Default export
import * as titanEngine from './engines/titan';
export default titanEngine;
