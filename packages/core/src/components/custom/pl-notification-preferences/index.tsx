/**
 * PlNotificationPreferences - Main Export
 * Configure notification delivery preferences by channel, category, and frequency
 */

import type { PlNotificationPreferencesProps } from './core';
import { PL_NOTIFICATION_PREFERENCES_DEFAULTS } from './core';
import { PL_NOTIFICATION_PREFERENCES_PRESETS } from './presets';

export { type PlNotificationPreferencesProps, type PlNotificationPreferencesPreset, PL_NOTIFICATION_PREFERENCES_DEFAULTS } from './core';
export * from './presets';

export function PlNotificationPreferences(props: PlNotificationPreferencesProps): React.ReactElement {
  const preset = props.preset ?? PL_NOTIFICATION_PREFERENCES_DEFAULTS.preset ?? 'form';
  const PresetComponent = PL_NOTIFICATION_PREFERENCES_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PlNotificationPreferences.displayName = 'PlNotificationPreferences';
