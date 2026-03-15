/**
 * EvKitchenDisplay - Main Export
 * Kitchen Display System with order cards, timers, bump-to-complete, and all-day summary
 */

import type { EvKitchenDisplayProps } from './core';
import { EV_KITCHEN_DISPLAY_DEFAULTS } from './core';
import { EV_KITCHEN_DISPLAY_PRESETS } from './presets';

export {
  type EvKitchenDisplayProps,
  type EvKitchenDisplayPreset,
  type KitchenOrder as EvKitchenDisplayKitchenOrder,
  type KitchenOrderItem as EvKitchenDisplayKitchenOrderItem,
  type AllDayItem as EvKitchenDisplayAllDayItem,
  EV_KITCHEN_DISPLAY_DEFAULTS,
} from './core';
export * from './presets';

export function EvKitchenDisplay(props: EvKitchenDisplayProps): React.ReactElement {
  const preset = props.preset ?? EV_KITCHEN_DISPLAY_DEFAULTS.preset ?? 'station';
  const PresetComponent = EV_KITCHEN_DISPLAY_PRESETS[preset];
  return <PresetComponent {...props} />;
}

EvKitchenDisplay.displayName = 'EvKitchenDisplay';

export { StationEvKitchenDisplay, ExpoEvKitchenDisplay } from './presets';
