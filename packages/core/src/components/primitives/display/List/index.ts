/**
 * List - Engine Router (Compound Component)
 */
import { createEngineComponent } from '../../../../system/engines/factory';
import type { ListProps, ListItemProps, ListItemMetaProps } from './types';

export {
  type ListProps,
  type ListItemProps,
  type ListItemMetaProps,
  LIST_DEFAULTS,
} from './types';

const ListBase = createEngineComponent<ListProps>('List', {
  titan: () => import('./engines/titan').then(m => ({ default: m.List })),
  hermes: () => import('./engines/hermes').then(m => ({ default: m.List })),
  apollo: () => import('./engines/apollo').then(m => ({ default: m.List })),
});

const Item = createEngineComponent<ListItemProps>('List.Item', {
  titan: () => import('./engines/titan').then(m => ({ default: m.Item })),
  hermes: () => import('./engines/hermes').then(m => ({ default: m.Item })),
  apollo: () => import('./engines/apollo').then(m => ({ default: m.Item })),
});

const Meta = createEngineComponent<ListItemMetaProps>('List.Item.Meta', {
  titan: () => import('./engines/titan').then(m => ({ default: m.Meta })),
  hermes: () => import('./engines/hermes').then(m => ({ default: m.Meta })),
  apollo: () => import('./engines/apollo').then(m => ({ default: m.Meta })),
});

export const List = Object.assign(ListBase, {
  Item: Object.assign(Item, { Meta }),
});

export default List;
