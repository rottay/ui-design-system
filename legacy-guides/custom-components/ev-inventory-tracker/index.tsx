/**
 * EvInventoryTracker - Main Export
 * Stock inventory tracking
 * Automatically selects preset based on props
 */

import type { EvInventoryTrackerProps } from './core';
import { EV_INVENTORY_TRACKER_DEFAULTS } from './core';
import { EV_INVENTORY_TRACKER_PRESETS } from './presets';

export {
  type EvInventoryTrackerProps,
  type EvInventoryTrackerPreset,
  type StockItem as EvInventoryTrackerStockItem,
  type StockAlert as EvInventoryTrackerStockAlert,
  type StockMovement as EvInventoryTrackerStockMovement,
  EV_INVENTORY_TRACKER_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvInventoryTracker component
 * Renders the appropriate preset based on the preset prop
 */
export function EvInventoryTracker(props: EvInventoryTrackerProps): React.ReactElement {
  const preset = props.preset ?? EV_INVENTORY_TRACKER_DEFAULTS.preset ?? 'overview';
  const PresetComponent = EV_INVENTORY_TRACKER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvInventoryTracker.displayName = 'EvInventoryTracker';

export { OverviewEvInventoryTracker, DetailedEvInventoryTracker } from './presets';
