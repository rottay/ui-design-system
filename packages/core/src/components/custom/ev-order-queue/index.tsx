/**
 * EvOrderQueue - Main Export
 * Bar order queue
 * Automatically selects preset based on props
 */

import type { EvOrderQueueProps } from './core';
import { EV_ORDER_QUEUE_DEFAULTS } from './core';
import { EV_ORDER_QUEUE_PRESETS } from './presets';

export {
  type EvOrderQueueProps,
  type EvOrderQueuePreset,
  type BarOrder as EvOrderQueueBarOrder,
  EV_ORDER_QUEUE_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvOrderQueue component
 * Renders the appropriate preset based on the preset prop
 */
export function EvOrderQueue(props: EvOrderQueueProps): React.ReactElement {
  const preset = props.preset ?? EV_ORDER_QUEUE_DEFAULTS.preset ?? 'kitchen';
  const PresetComponent = EV_ORDER_QUEUE_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvOrderQueue.displayName = 'EvOrderQueue';

export { KitchenEvOrderQueue, BartenderEvOrderQueue } from './presets';
