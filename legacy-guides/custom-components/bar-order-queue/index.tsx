/**
 * BarOrderQueue - Main Export
 * Real-time order queue with status columns
 */

import type { BarOrderQueueProps } from './core';
import { BAR_ORDER_QUEUE_DEFAULTS } from './core';
import { BAR_ORDER_QUEUE_PRESETS } from './presets';

export {
  type BarOrderQueueProps,
  type BarOrderQueuePreset,
  type QueueOrder as BarOrderQueueOrder,
  type OrderStatus as BarOrderQueueStatus,
  BAR_ORDER_QUEUE_DEFAULTS,
} from './core';
export * from './presets';

export function BarOrderQueue(props: BarOrderQueueProps): React.ReactElement {
  const preset = props.preset ?? BAR_ORDER_QUEUE_DEFAULTS.preset ?? 'kanban';
  const PresetComponent = BAR_ORDER_QUEUE_PRESETS[preset];
  return <PresetComponent {...props} />;
}

BarOrderQueue.displayName = 'BarOrderQueue';

export { KanbanBarOrderQueue, ListBarOrderQueue } from './presets';
