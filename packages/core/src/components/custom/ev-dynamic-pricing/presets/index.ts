/**
 * EvDynamicPricing - All Presets
 */

export { ControlEvDynamicPricing } from './control';
export { MonitorEvDynamicPricing } from './monitor';

import type { EvDynamicPricingPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvDynamicPricingProps } from '../core';
import { ControlEvDynamicPricing } from './control';
import { MonitorEvDynamicPricing } from './monitor';

export const EV_DYNAMIC_PRICING_PRESETS: Record<EvDynamicPricingPreset, ComponentType<EvDynamicPricingProps>> = {
  control: ControlEvDynamicPricing,
  monitor: MonitorEvDynamicPricing,
};
