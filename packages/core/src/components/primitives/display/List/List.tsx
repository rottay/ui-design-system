'use client';

/**
 * @fileoverview List - Collection display with item metadata and pagination.
 * Two-level compound structure: `List.Item` wraps each row, and
 * `List.Item.Meta` provides avatar + title + description layout.
 * Supports both declarative children and data-driven `renderItem` patterns.
 *
 * @example
 * ```tsx
 * import { List } from '@rottay/design-system';
 *
 * <List
 *   dataSource={users}
 *   renderItem={(user) => (
 *     <List.Item actions={[<Button>Edit</Button>]}>
 *       <List.Item.Meta title={user.name} description={user.email} />
 *     </List.Item>
 *   )}
 *   pagination={{ pageSize: 10 }}
 * />
 * ```
 *
 * @module List
 * @category Display
 */
import { createEngineComponent } from '../../../../engines/factory';
import type { ListProps, ListItemProps, ListItemMetaProps } from './List.types';

export {
  type ListProps,
  type ListItemProps,
  type ListItemMetaProps,
  LIST_DEFAULTS,
} from './List.types';

/** Engine-routed container -- the outer <ul>/<ol> wrapper. */
const ListBase = createEngineComponent<ListProps>('List', {
  classic: () => import('./engines/classic').then(m => ({ default: m.List })),
  modern: () => import('./engines/modern').then(m => ({ default: m.List })),
  rustic: () => import('./engines/rustic').then(m => ({ default: m.List })),
});

/** Engine-routed row -- wraps each individual list entry. */
const Item = createEngineComponent<ListItemProps>('List.Item', {
  classic: () => import('./engines/classic').then(m => ({ default: m.Item })),
  modern: () => import('./engines/modern').then(m => ({ default: m.Item })),
  rustic: () => import('./engines/rustic').then(m => ({ default: m.Item })),
});

/** Engine-routed metadata -- avatar + title + description layout inside an Item. */
const Meta = createEngineComponent<ListItemMetaProps>('List.Item.Meta', {
  classic: () => import('./engines/classic').then(m => ({ default: m.Meta })),
  modern: () => import('./engines/modern').then(m => ({ default: m.Meta })),
  rustic: () => import('./engines/rustic').then(m => ({ default: m.Meta })),
});

/**
 * Compound assembly: List -> Item -> Meta (two-level nesting).
 * This mirrors the Ant Design API so consumers can write:
 *   <List.Item><List.Item.Meta ... /></List.Item>
 */
export const List = Object.assign(ListBase, {
  Item: Object.assign(Item, { Meta }),
});

export default List;
