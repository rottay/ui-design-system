/**
 * Breadcrumb - Engine Router
 *
 * This module exports the Breadcrumb component with multi-engine support.
 * Breadcrumb shows the current page's location within a navigational hierarchy.
 *
 * @module Breadcrumb
 * @example
 * ```tsx
 * import { Breadcrumb } from '@rottay/design-system';
 *
 * // Basic usage with items
 * <Breadcrumb
 *   items={[
 *     { key: 'home', label: 'Home', href: '/' },
 *     { key: 'products', label: 'Products', href: '/products' },
 *     { key: 'current', label: 'Current Page' },
 *   ]}
 * />
 *
 * // Alternative: compound component syntax
 * <Breadcrumb>
 *   <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
 *   <Breadcrumb.Item href="/products">Products</Breadcrumb.Item>
 *   <Breadcrumb.Item>Current Page</Breadcrumb.Item>
 * </Breadcrumb>
 * ```
 */
import { createEngineComponent } from '../../../../system/engines/factory';
import type { BreadcrumbProps } from './types';
import { BreadcrumbItem } from './compound';

export { type BreadcrumbProps, type BreadcrumbItem as BreadcrumbItemType, BREADCRUMB_DEFAULTS } from './types';

export { BaseBreadcrumb } from './base';

export { BreadcrumbItem };
export type { BreadcrumbItemProps } from './compound';

export const Breadcrumb = Object.assign(
  createEngineComponent<BreadcrumbProps>('Breadcrumb', {
    titan: () => import('./engines/titan'),
    hermes: () => import('./engines/hermes'),
    apollo: () => import('./engines/apollo'),
  }),
  {
    Item: BreadcrumbItem,
  }
);
