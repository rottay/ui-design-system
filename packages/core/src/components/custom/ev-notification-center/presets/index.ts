export { NotificationCenterInbox } from './inbox';
export { NotificationCenterBroadcast } from './broadcast';

import type { NotificationCenterPreset } from '../core';
import type { ComponentType } from 'react';
import type { NotificationCenterProps } from '../core';
import { NotificationCenterInbox } from './inbox';
import { NotificationCenterBroadcast } from './broadcast';

export const PRESETS: Record<
  NotificationCenterPreset,
  ComponentType<NotificationCenterProps>
> = {
  inbox: NotificationCenterInbox,
  broadcast: NotificationCenterBroadcast,
};
