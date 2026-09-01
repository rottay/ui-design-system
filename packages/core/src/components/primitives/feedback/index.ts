/**
 * @fileoverview Feedback primitives barrel export.
 * Re-exports all feedback-category primitive components.
 */

export { Alert } from './alert';
export type { AlertProps, AlertType } from './alert';

export { Spinner } from './spinner';
export type { SpinnerProps, SpinnerSize } from './spinner';

export { Progress } from './progress';
export type { ProgressProps, ProgressType, ProgressStatus } from './progress';

export { Modal, ModalHeader, ModalBody, ModalFooter, ModalCloseButton } from './modal';
export type {
  ModalProps,
  ModalSize,
  ModalPlacement,
  ModalHeaderProps,
  ModalBodyProps,
  ModalFooterProps,
  ModalCloseButtonProps,
} from './modal';

export { Toast, ToastProvider, ToastContainer, useToast, toast } from './toast';
export type {
  ToastProps,
  ToastVariant,
  ToastPosition,
  ToastAction,
  ToastProviderConfig,
  ToastOptions,
  ToastMethods,
  ToastState,
  ToastProviderProps,
  UseToastReturn,
  ToastContainerProps,
} from './toast';

export {
  Skeleton,
  SkeletonAvatar,
  SkeletonText,
  SkeletonButton,
  SkeletonCard,
  SkeletonListItem,
  SkeletonTable,
  SkeletonForm,
  SkeletonParagraph,
} from './skeleton';
export type {
  SkeletonProps,
  SkeletonVariant,
  SkeletonAnimation,
  SkeletonCardProps,
  SkeletonListItemProps,
  SkeletonTableProps,
  SkeletonFormProps,
  SkeletonParagraphProps,
} from './skeleton';

export { Drawer } from './drawer';
export type { DrawerProps, DrawerPlacement, DrawerSize } from './drawer';

export { MessageProvider, MessageItem, useMessage, message } from './message';
export type {
  MessageType,
  MessagePlacement,
  MessageConfig,
  MessageArgsProps,
  MessageInstance,
  MessagePromise,
  MessageGlobalConfig,
  MessageProviderProps,
  MessageItemProps,
} from './message';

export { NotificationProvider, NotificationItem, useNotification, notification } from './notification';
export type {
  NotificationType,
  NotificationPlacement,
  NotificationConfig,
  NotificationArgsProps,
  NotificationInstance,
  NotificationGlobalConfig,
  NotificationProviderProps,
  NotificationItemProps,
} from './notification';

export { Result } from './result';
export type { ResultProps, ResultStatus } from './result';

export { Rate, RATE_DEFAULTS, RATE_SIZE_MAP } from './rate';
export type { RateProps, RateSize, RateEngine, RateCharacterProps } from './rate';
