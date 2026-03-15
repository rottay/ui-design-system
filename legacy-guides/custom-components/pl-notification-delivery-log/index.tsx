/**
 * PlNotificationDeliveryLog - Main Export
 * Track notification delivery status across email, SMS, push, and in-app channels
 */

import type { PlNotificationDeliveryLogProps } from './core';
import { PL_NOTIFICATION_DELIVERY_LOG_DEFAULTS } from './core';
import { PL_NOTIFICATION_DELIVERY_LOG_PRESETS } from './presets';

export { type PlNotificationDeliveryLogProps, type PlNotificationDeliveryLogPreset, PL_NOTIFICATION_DELIVERY_LOG_DEFAULTS } from './core';
export * from './presets';

export function PlNotificationDeliveryLog(props: PlNotificationDeliveryLogProps): React.ReactElement {
  const preset = props.preset ?? PL_NOTIFICATION_DELIVERY_LOG_DEFAULTS.preset ?? 'table';
  const PresetComponent = PL_NOTIFICATION_DELIVERY_LOG_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PlNotificationDeliveryLog.displayName = 'PlNotificationDeliveryLog';
