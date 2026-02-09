/**
 * PlNotificationPreferences - All Presets
 */

export { FormPlNotificationPreferences } from './form';
export { MatrixPlNotificationPreferences } from './matrix';

import type { PlNotificationPreferencesPreset } from '../core';
import type { ComponentType } from 'react';
import type { PlNotificationPreferencesProps } from '../core';
import { FormPlNotificationPreferences } from './form';
import { MatrixPlNotificationPreferences } from './matrix';

export const PL_NOTIFICATION_PREFERENCES_PRESETS: Record<PlNotificationPreferencesPreset, ComponentType<PlNotificationPreferencesProps>> = {
  form: FormPlNotificationPreferences,
  matrix: MatrixPlNotificationPreferences,
};
