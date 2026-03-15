/**
 * BhEngagementSparkline - All Presets
 */

import type { BhEngagementSparklinePreset, BhEngagementSparklineProps } from '../core';
import type { ComponentType } from 'react';
import { StandardBhEngagementSparkline } from './standard';

export { StandardBhEngagementSparkline } from './standard';

export const BH_ENGAGEMENT_SPARKLINE_PRESETS: Record<BhEngagementSparklinePreset, ComponentType<BhEngagementSparklineProps>> = {
  standard: StandardBhEngagementSparkline,
};
