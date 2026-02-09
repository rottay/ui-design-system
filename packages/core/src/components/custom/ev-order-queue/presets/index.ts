/**
 * EvOrderQueue - All Presets
 */

export { KitchenEvOrderQueue } from './kitchen';
export { BartenderEvOrderQueue } from './bartender';

import type { EvOrderQueuePreset } from '../core';
import type { ComponentType } from 'react';
import type { EvOrderQueueProps } from '../core';
import { KitchenEvOrderQueue } from './kitchen';
import { BartenderEvOrderQueue } from './bartender';

export const EV_ORDER_QUEUE_PRESETS: Record<EvOrderQueuePreset, ComponentType<EvOrderQueueProps>> = {
  kitchen: KitchenEvOrderQueue,
  bartender: BartenderEvOrderQueue,
};
