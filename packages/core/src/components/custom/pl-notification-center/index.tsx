/**
 * PlNotificationCenter - Main Export
 * Central hub for viewing, filtering, and managing all user notifications
 */

import type { PlNotificationCenterProps } from './core';
import { PL_NOTIFICATION_CENTER_DEFAULTS } from './core';
import { PL_NOTIFICATION_CENTER_PRESETS } from './presets';

export { type PlNotificationCenterProps, type PlNotificationCenterPreset, PL_NOTIFICATION_CENTER_DEFAULTS } from './core';
export * from './presets';

export function PlNotificationCenter(props: PlNotificationCenterProps): React.ReactElement {
  const preset = props.preset ?? PL_NOTIFICATION_CENTER_DEFAULTS.preset ?? 'panel';
  const PresetComponent = PL_NOTIFICATION_CENTER_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PlNotificationCenter.displayName = 'PlNotificationCenter';
