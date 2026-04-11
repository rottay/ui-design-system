'use client';

/**
 * @fileoverview TenantPreview pattern - Rottay Design System
 * @description Engine-aware preview surface for tenant branding, personality,
 * and theme choices during onboarding or admin editing flows.
 *
 * @remarks
 * This pattern is one of the key bridges between app-platform and the DS: it
 * demonstrates what runtime theming will look like before a tenant config is saved.
 *
 * @example
 * ```tsx
 * import { PatternTenantPreview } from '@rottay/design-system';
 *
 * <PatternTenantPreview
 *   config={{
 *     slug: 'acme',
 *     name: 'ACME Corp',
 *     primaryColor: '#3B82F6',
 *     personality: 'formal',
 *   }}
 *   showColorPalette
 *   showPersonalityInfo
 * />
 * ```
 */

import { createEngineComponent } from '../../../../runtime/engines/factory';
import type { TenantPreviewProps } from './TenantPreview.types';

export type { TenantPreviewProps, PreviewComponent } from './TenantPreview.types';

/** Public tenant preview entry point resolved through the engine factory. */
export const PatternTenantPreview = createEngineComponent<TenantPreviewProps>(
  'PatternTenantPreview',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
