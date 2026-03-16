'use client';

/**
 * @fileoverview Descriptions - Key-value pair display with grid layout.
 * Renders label/value rows in a multi-column grid. Supports bordered and
 * borderless variants, horizontal/vertical layouts, and responsive columns.
 *
 * @example
 * ```tsx
 * import { Descriptions } from '@rottay/design-system';
 *
 * <Descriptions title="User Info" column={2} bordered>
 *   <Descriptions.Item label="Name">John Doe</Descriptions.Item>
 *   <Descriptions.Item label="Email">john@example.com</Descriptions.Item>
 * </Descriptions>
 * ```
 *
 * @module Descriptions
 * @category Display
 */

import { createEngineComponent } from '../../../../engines/factory';
import type { DescriptionsProps, DescriptionsItemProps } from './Descriptions.types';
import { DescriptionsItem } from './compound';

export type {
  DescriptionsProps,
  DescriptionsItemProps,
  DescriptionsLayout,
  DescriptionsSize,
  ResponsiveColumn,
} from './Descriptions.types';

export { DESCRIPTIONS_DEFAULTS, SIZE_MAP, PADDING_MAP } from './Descriptions.types';

export { DescriptionsItem };

/**
 * Engine-routed container component.
 * Each engine exports a named `Descriptions` (not default), so imports are
 * remapped with `.then()` to satisfy the factory's `{ default }` contract.
 */
const DescriptionsBase = createEngineComponent<DescriptionsProps>('Descriptions', {
  classic: () => import('./engines/classic').then((m) => ({ default: m.Descriptions })),
  modern: () => import('./engines/modern').then((m) => ({ default: m.Descriptions })),
  rustic: () => import('./engines/rustic').then((m) => ({ default: m.Descriptions })),
});

/**
 * Engine-routed Item component.
 * Kept as a separate `createEngineComponent` so it resolves the correct
 * engine independently (e.g. when used outside a Descriptions parent).
 */
const Item = createEngineComponent<DescriptionsItemProps>('Descriptions.Item', {
  classic: () => import('./engines/classic').then((m) => ({ default: m.Item })),
  modern: () => import('./engines/modern').then((m) => ({ default: m.Item })),
  rustic: () => import('./engines/rustic').then((m) => ({ default: m.Item })),
});

/** Compound assembly: attaches Item so consumers write `Descriptions.Item`. */
export const Descriptions = Object.assign(DescriptionsBase, {
  /** A single label-value row inside the descriptions grid. Supports `span` for wide entries. */
  Item,
});

export default Descriptions;
