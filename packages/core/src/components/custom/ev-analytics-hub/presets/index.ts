/**
 * EvAnalyticsHub - All Presets
 */

export { RealtimeEvAnalyticsHub } from './realtime';
export { HistoricalEvAnalyticsHub } from './historical';

import type { EvAnalyticsHubPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvAnalyticsHubProps } from '../core';
import { RealtimeEvAnalyticsHub } from './realtime';
import { HistoricalEvAnalyticsHub } from './historical';

export const EV_ANALYTICS_HUB_PRESETS: Record<EvAnalyticsHubPreset, ComponentType<EvAnalyticsHubProps>> = {
  realtime: RealtimeEvAnalyticsHub,
  historical: HistoricalEvAnalyticsHub,
};
