/**
 * PlFeatureRollout - All Presets
 */

export { WizardPlFeatureRollout } from './wizard';
export { TimelinePlFeatureRollout } from './timeline';

import type { PlFeatureRolloutPreset } from '../core';
import type { ComponentType } from 'react';
import type { PlFeatureRolloutProps } from '../core';
import { WizardPlFeatureRollout } from './wizard';
import { TimelinePlFeatureRollout } from './timeline';

export const PL_FEATURE_ROLLOUT_PRESETS: Record<PlFeatureRolloutPreset, ComponentType<PlFeatureRolloutProps>> = {
  wizard: WizardPlFeatureRollout,
  timeline: TimelinePlFeatureRollout,
};
