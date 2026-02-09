/**
 * PlFeatureSettings - All Presets
 */

export { FormPlFeatureSettings } from './form';
export { MatrixPlFeatureSettings } from './matrix';

import type { PlFeatureSettingsPreset } from '../core';
import type { ComponentType } from 'react';
import type { PlFeatureSettingsProps } from '../core';
import { FormPlFeatureSettings } from './form';
import { MatrixPlFeatureSettings } from './matrix';

export const PL_FEATURE_SETTINGS_PRESETS: Record<PlFeatureSettingsPreset, ComponentType<PlFeatureSettingsProps>> = {
  form: FormPlFeatureSettings,
  matrix: MatrixPlFeatureSettings,
};
