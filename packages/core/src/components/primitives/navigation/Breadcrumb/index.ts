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
 * // Basic usage
 * <Breadcrumb
 *   items={[
 *     { key: 'home', label: 'Home', href: '/' },
 *     { key: 'products', label: 'Products', href: '/products' },
 *     { key: 'current', label: 'Current Page' },
 *   ]}
 * />
 *
 * // With custom separator
 * <Breadcrumb items={items} separator=">" />
 *
 * // With icons
 * <Breadcrumb items={[{ key: 'home', label: 'Home', icon: <HomeIcon /> }]} />
 * ```
 */
import { createEngineComponent } from '../../../../system/engines/factory';
import type { BreadcrumbProps } from './types';

export { type BreadcrumbProps, type BreadcrumbItem, BREADCRUMB_DEFAULTS } from './types';


// Export base component
export { BaseBreadcrumb } from './base';

export const Breadcrumb = createEngineComponent<BreadcrumbProps>('Breadcrumb', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});
