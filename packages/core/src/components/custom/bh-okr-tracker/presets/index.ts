/**
 * BhOkrTracker - All Presets
 */

import type { BhOkrTrackerPreset, BhOkrTrackerProps } from '../core';
import type { ComponentType } from 'react';
import { CompactBhOkrTracker } from './compact';

export { CompactBhOkrTracker } from './compact';

export const BH_OKR_TRACKER_PRESETS: Record<BhOkrTrackerPreset, ComponentType<BhOkrTrackerProps>> = {
  compact: CompactBhOkrTracker,
};
