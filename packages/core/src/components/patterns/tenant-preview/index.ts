'use client';

/**
 * TenantPreview - Pattern Component
 *
 * Engine-aware tenant preview that renders a live demonstration of how
 * components look with a given tenant configuration. Used during tenant
 * onboarding to visualize branding choices before committing.
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

import { createEngineComponent } from '../../../core/engines/factory';
import type { TenantPreviewProps } from './TenantPreview.types';

export type { TenantPreviewProps, PreviewComponent } from './TenantPreview.types';

export const PatternTenantPreview = createEngineComponent<TenantPreviewProps>(
  'PatternTenantPreview',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
