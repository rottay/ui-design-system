import type { NotificationCenterProps } from './core';
import { NOTIFICATION_CENTER_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type {
  NotificationCenterProps,
  Notification,
  BroadcastMessage,
  NotificationCenterPreset,
} from './core';

export type EvNotificationCenterProps = NotificationCenterProps;

export function NotificationCenter(props: NotificationCenterProps) {
  const { preset = NOTIFICATION_CENTER_DEFAULTS.preset, ...rest } = props;
  const Component = PRESETS[preset];
  return <Component {...rest} />;
}

NotificationCenter.displayName = 'NotificationCenter';

export const EvNotificationCenter = NotificationCenter;
export { NotificationCenterInbox, NotificationCenterBroadcast } from './presets';
