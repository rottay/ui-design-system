/**
 * PlNotificationDeliveryLog - All Presets
 */

export { TablePlNotificationDeliveryLog } from './table';
export { TimelinePlNotificationDeliveryLog } from './timeline';

import type { PlNotificationDeliveryLogPreset } from '../core';
import type { ComponentType } from 'react';
import type { PlNotificationDeliveryLogProps } from '../core';
import { TablePlNotificationDeliveryLog } from './table';
import { TimelinePlNotificationDeliveryLog } from './timeline';

export const PL_NOTIFICATION_DELIVERY_LOG_PRESETS: Record<PlNotificationDeliveryLogPreset, ComponentType<PlNotificationDeliveryLogProps>> = {
  table: TablePlNotificationDeliveryLog,
  timeline: TimelinePlNotificationDeliveryLog,
};
