/**
 * EvVenueManager - All Presets
 */

export { OverviewEvVenueManager } from './overview';
export { AnalyticsEvVenueManager } from './analytics';

import type { EvVenueManagerPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvVenueManagerProps } from '../core';
import { OverviewEvVenueManager } from './overview';
import { AnalyticsEvVenueManager } from './analytics';

export const EV_VENUE_MANAGER_PRESETS: Record<EvVenueManagerPreset, ComponentType<EvVenueManagerProps>> = {
  overview: OverviewEvVenueManager,
  analytics: AnalyticsEvVenueManager,
};
