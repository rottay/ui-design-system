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

import { createElement, forwardRef } from 'react';
import type { ComponentRef } from 'react';

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import { toDescriptionsEngineSize } from './contracts';
import type { DescriptionsEngineProps, DescriptionsItemProps, DescriptionsSize } from './contracts';
import { DescriptionsItem } from './compound';

export type {
  DescriptionsItemProps,
  DescriptionsLayout,
  DescriptionsSize,
  ResponsiveColumn,
} from './contracts';

export { DESCRIPTIONS_DEFAULTS, SIZE_MAP, PADDING_MAP } from './contracts';

export { DescriptionsItem };

/**
 * Main props interface for the Descriptions component.
 * Provides configuration for displaying structured key-value data.
 */
export interface DescriptionsProps extends Omit<DescriptionsEngineProps, 'size'> {
  /**
   * Size step affecting spacing and font sizes.
   * @default 'lg'
   */
  size?: DescriptionsSize;
}

/**
 * Engine-routed container component.
 * Each engine exports a named `Descriptions` (not default), so imports are
 * remapped with `.then()` to satisfy the factory's `{ default }` contract.
 */
const DescriptionsBase = createEngineComponent<DescriptionsEngineProps>('Descriptions', {
  classic: () => import('./engines/classic').then((m) => ({ default: m.Descriptions })),
  modern: () => import('./engines/modern').then((m) => ({ default: m.Descriptions })),
  rustic: () => import('./engines/rustic').then((m) => ({ default: m.Descriptions })),
});

/**
 * Resolves the public `size` step to the spelling the engines read, before an
 * engine is chosen, so the three engines receive the same value.
 */
const DescriptionsRoot = forwardRef<ComponentRef<typeof DescriptionsBase>, DescriptionsProps>(({ size, ...rest }, ref) =>
  createElement(DescriptionsBase, { ref, ...rest, size: toDescriptionsEngineSize(size) }),
);

DescriptionsRoot.displayName = 'Descriptions';

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
export const Descriptions = Object.assign(DescriptionsRoot, {
  /** A single label-value row inside the descriptions grid. Supports `span` for wide entries. */
  Item,
});

export default Descriptions;
