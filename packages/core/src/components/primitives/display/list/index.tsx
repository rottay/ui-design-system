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
 *     <List.Item actions={[<Button>Edit</button>]}>
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
import { createElement, forwardRef } from 'react';
import type { ComponentRef } from 'react';

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import { toListEngineSize } from './contracts';
import type { ListEngineProps, ListItemProps, ListItemMetaProps, ListSize } from './contracts';

export {
  type ListItemProps,
  type ListItemMetaProps,
  LIST_DEFAULTS,
} from './contracts';

/**
 * Props for the List component
 * @template T - Type of items in the data source
 */
export interface ListProps<T = unknown> extends Omit<ListEngineProps<T>, 'size'> {
  /**
   * Size of the list items
   * @default 'md'
   */
  size?: ListSize;
}

/** Engine-routed container -- the outer <ul>/<ol> wrapper. */
const ListBase = createEngineComponent<ListEngineProps>('List', {
  classic: () => import('./engines/classic').then(m => ({ default: m.List })),
  modern: () => import('./engines/modern').then(m => ({ default: m.List })),
  rustic: () => import('./engines/rustic').then(m => ({ default: m.List })),
});

/**
 * Resolves the public `size` step to the spelling the engines read, before an
 * engine is chosen, so the three engines receive the same value.
 */
const ListRoot = forwardRef<ComponentRef<typeof ListBase>, ListProps>(({ size, ...rest }, ref) =>
  createElement(ListBase, { ref, ...rest, size: toListEngineSize(size) }),
);

ListRoot.displayName = 'List';

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
export const List = Object.assign(ListRoot, {
  Item: Object.assign(Item, { Meta }),
});

export default List;
