/**
 * PlFeatureToggle - All Presets
 */

export { PanelPlFeatureToggle } from './panel';
export { CompactPlFeatureToggle } from './compact';

import type { PlFeatureTogglePreset } from '../core';
import type { ComponentType } from 'react';
import type { PlFeatureToggleProps } from '../core';
import { PanelPlFeatureToggle } from './panel';
import { CompactPlFeatureToggle } from './compact';

export const PL_FEATURE_TOGGLE_PRESETS: Record<PlFeatureTogglePreset, ComponentType<PlFeatureToggleProps>> = {
  panel: PanelPlFeatureToggle,
  compact: CompactPlFeatureToggle,
};
