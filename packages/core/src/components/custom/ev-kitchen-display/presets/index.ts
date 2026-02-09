/**
 * EvKitchenDisplay - All Presets
 */

export { StationEvKitchenDisplay } from './station';
export { ExpoEvKitchenDisplay } from './expo';

import type { EvKitchenDisplayPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvKitchenDisplayProps } from '../core';
import { StationEvKitchenDisplay } from './station';
import { ExpoEvKitchenDisplay } from './expo';

export const EV_KITCHEN_DISPLAY_PRESETS: Record<EvKitchenDisplayPreset, ComponentType<EvKitchenDisplayProps>> = {
  station: StationEvKitchenDisplay,
  expo: ExpoEvKitchenDisplay,
};
