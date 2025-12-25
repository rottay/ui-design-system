/**
 * Notification Types
 *
 * Re-exports unified notification types from the central types module.
 */

export type {
  NotificationType,
  NotificationPlacement,
  NotificationConfig,
  NotificationGlobalConfig,
  NotificationInstance,
} from '../../../types/components/notification';

export {
  getNotificationTypeStyles,
  getPlacementClasses,
} from '../../../types/components/notification';
