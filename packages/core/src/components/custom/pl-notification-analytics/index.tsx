/**
 * PlNotificationAnalytics - Main Export
 * Analyze notification delivery rates, open rates, and engagement metrics
 */

import type { PlNotificationAnalyticsProps } from './core';
import { PL_NOTIFICATION_ANALYTICS_DEFAULTS } from './core';
import { PL_NOTIFICATION_ANALYTICS_PRESETS } from './presets';

export { type PlNotificationAnalyticsProps, type PlNotificationAnalyticsPreset, PL_NOTIFICATION_ANALYTICS_DEFAULTS } from './core';
export * from './presets';

export function PlNotificationAnalytics(props: PlNotificationAnalyticsProps): React.ReactElement {
  const preset = props.preset ?? PL_NOTIFICATION_ANALYTICS_DEFAULTS.preset ?? 'dashboard';
  const PresetComponent = PL_NOTIFICATION_ANALYTICS_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PlNotificationAnalytics.displayName = 'PlNotificationAnalytics';
