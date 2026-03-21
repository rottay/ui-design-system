'use client';

/**
 * @fileoverview Breadcrumb -- hierarchical navigation showing the current page
 * location, with custom separators, icons, and automatic truncation via maxItems.
 *
 * @example
 * ```tsx
 * import { Breadcrumb } from '@rottay/design-system';
 *
 * <Breadcrumb
 *   separator="/"
 *   items={[
 *     { key: 'home', label: 'Home', href: '/' },
 *     { key: 'docs', label: 'Docs', href: '/docs' },
 *     { key: 'api', label: 'API Reference' },
 *   ]}
 * />
 * ```
 *
 * @module Breadcrumb
 * @category Navigation
 */

import { createEngineComponent } from '../../../../runtime/engines/factory';
import type { BreadcrumbProps } from './Breadcrumb.types';
import { BreadcrumbItem } from './compound';

export {
  type BreadcrumbProps,
  type BreadcrumbItem as BreadcrumbItemType,
  BREADCRUMB_DEFAULTS,
} from './Breadcrumb.types';

export { BreadcrumbItem };
export type { BreadcrumbItemProps } from './compound';

// Assemble compound component: Breadcrumb + Breadcrumb.Item
export const Breadcrumb = Object.assign(
  createEngineComponent<BreadcrumbProps>('Breadcrumb', {
    /** Ant Design implementation - full-featured with animations */
    classic: () => import('./engines/classic'),
    /** DaisyUI/Tailwind implementation - utility-first styling */
    modern: () => import('./engines/modern'),
    /** Vanilla HTML/CSS implementation - zero dependencies */
    rustic: () => import('./engines/rustic'),
  }),
  {
    /** Individual breadcrumb segment for declarative breadcrumb definition. */
    Item: BreadcrumbItem,
  }
);
