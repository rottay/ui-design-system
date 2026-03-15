import type { NotificationCenterProps } from './core';
import { NOTIFICATION_CENTER_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type {
  NotificationCenterProps,
  NotificationCenterPreset,
  Notification,
  NotificationCategory,
  NotificationType,
} from './core';
export { NOTIFICATION_CENTER_DEFAULTS } from './core';

export function NotificationCenter(props: NotificationCenterProps): React.ReactElement {
  const preset = props.preset ?? NOTIFICATION_CENTER_DEFAULTS.preset ?? 'panel';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}

NotificationCenter.displayName = 'NotificationCenter';
