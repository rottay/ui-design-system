/**
 * BarOrderQueue - All Presets
 */

export { KanbanBarOrderQueue } from './kanban';
export { ListBarOrderQueue } from './list';

import type { BarOrderQueuePreset } from '../core';
import type { ComponentType } from 'react';
import type { BarOrderQueueProps } from '../core';
import { KanbanBarOrderQueue } from './kanban';
import { ListBarOrderQueue } from './list';

export const BAR_ORDER_QUEUE_PRESETS: Record<BarOrderQueuePreset, ComponentType<BarOrderQueueProps>> = {
  kanban: KanbanBarOrderQueue,
  list: ListBarOrderQueue,
};
