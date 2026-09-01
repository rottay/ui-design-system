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

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { BreadcrumbProps } from './contracts';
import { BreadcrumbItem } from './compound';

export {
  type BreadcrumbProps,
  type BreadcrumbItem as BreadcrumbItemType,
  type BreadcrumbMenuItem,
  type BreadcrumbOverflowConfig,
  BREADCRUMB_DEFAULTS,
  BREADCRUMB_OVERFLOW_DEFAULTS,
} from './contracts';

export { BreadcrumbItem };
export type { BreadcrumbItemProps } from './compound';

// Assemble compound component: Breadcrumb + Breadcrumb.Item
export const Breadcrumb = Object.assign(
  createEngineComponent<BreadcrumbProps>('Breadcrumb', {
    /** Ant Design implementation - full-featured with animations */
    classic: () => import('./engines/classic'),
    /** Rottay-native premium implementation - token-driven, skin-painted */
    modern: () => import('./engines/modern'),
    /** Vanilla HTML/CSS implementation - zero dependencies */
    rustic: () => import('./engines/rustic'),
  }),
  {
    /** Individual breadcrumb segment for declarative breadcrumb definition. */
    Item: BreadcrumbItem,
  }
);
