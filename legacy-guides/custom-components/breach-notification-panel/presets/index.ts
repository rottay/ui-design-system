/**
 * BreachNotificationPanel - All Presets
 */

import type { BreachNotificationPanelPreset, BreachNotificationPanelProps } from '../core';
import type { ComponentType } from 'react';
import { TimelineBreachNotificationPanel } from './timeline';
import { NotificationBreachNotificationPanel } from './notification';
import { SummaryBreachNotificationPanel } from './summary';

export { TimelineBreachNotificationPanel } from './timeline';
export { NotificationBreachNotificationPanel } from './notification';
export { SummaryBreachNotificationPanel } from './summary';

export const BREACH_NOTIFICATION_PANEL_PRESETS: Record<BreachNotificationPanelPreset, ComponentType<BreachNotificationPanelProps>> = {
  timeline: TimelineBreachNotificationPanel,
  notification: NotificationBreachNotificationPanel,
  summary: SummaryBreachNotificationPanel,
};
