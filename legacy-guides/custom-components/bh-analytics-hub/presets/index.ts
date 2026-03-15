/**
 * BhAnalyticsHub - All Presets
 */

export { ExecutiveBhAnalyticsHub } from './executive';
export { OperationalBhAnalyticsHub } from './operational';

import type { BhAnalyticsHubPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhAnalyticsHubProps } from '../core';
import { ExecutiveBhAnalyticsHub } from './executive';
import { OperationalBhAnalyticsHub } from './operational';

export const BH_ANALYTICS_HUB_PRESETS: Record<BhAnalyticsHubPreset, ComponentType<BhAnalyticsHubProps>> = {
  executive: ExecutiveBhAnalyticsHub,
  operational: OperationalBhAnalyticsHub,
};
