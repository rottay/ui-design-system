/**
 * EvInventoryTracker - All Presets
 */

export { OverviewEvInventoryTracker } from './overview';
export { DetailedEvInventoryTracker } from './detailed';

import type { EvInventoryTrackerPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvInventoryTrackerProps } from '../core';
import { OverviewEvInventoryTracker } from './overview';
import { DetailedEvInventoryTracker } from './detailed';

export const EV_INVENTORY_TRACKER_PRESETS: Record<EvInventoryTrackerPreset, ComponentType<EvInventoryTrackerProps>> = {
  overview: OverviewEvInventoryTracker,
  detailed: DetailedEvInventoryTracker,
};
