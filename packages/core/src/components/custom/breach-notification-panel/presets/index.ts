/**
 * BreachNotificationPanel - All Presets
 */

import type { BreachNotificationPanelPreset } from '../core';
import { TimelineBreachNotificationPanel } from './timeline';
import { NotificationBreachNotificationPanel } from './notification';
import { SummaryBreachNotificationPanel } from './summary';

export { TimelineBreachNotificationPanel } from './timeline';
export { NotificationBreachNotificationPanel } from './notification';
export { SummaryBreachNotificationPanel } from './summary';

export const BREACH_NOTIFICATION_PANEL_PRESETS: Record<BreachNotificationPanelPreset, React.ComponentType<any>> = {
  timeline: TimelineBreachNotificationPanel,
  notification: NotificationBreachNotificationPanel,
  summary: SummaryBreachNotificationPanel,
};
