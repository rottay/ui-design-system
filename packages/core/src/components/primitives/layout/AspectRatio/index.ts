'use client';

/**
 * @fileoverview AspectRatio - Rottay Design System
 * @description Container that maintains a consistent aspect ratio for its content.
 * Part of the Rottay Design System's layout primitives collection.
 *
 * @remarks
 * The AspectRatio component provides a container that enforces a specific
 * width-to-height ratio, useful for responsive images, videos, maps, and
 * embedded content.
 *
 * **Multi-Engine Architecture:**
 * - **Classic**: Ant Design compatible wrapper with padding-bottom trick
 * - **Modern**: Tailwind CSS with aspect-ratio CSS property
 * - **Rustic**: Pure CSS implementation with padding-bottom fallback
 *
 * @example Basic AspectRatio
 * ```tsx
 * import { AspectRatio } from '@rottay/design-system';
 *
 * <AspectRatio ratio={16/9}>
 *   <img src="/image.jpg" alt="Landscape" style={{ objectFit: 'cover' }} />
 * </AspectRatio>
 * ```
 *
 * @example Square Ratio
 * ```tsx
 * <AspectRatio ratio={1}>
 *   <div>Square content</div>
 * </AspectRatio>
 * ```
 *
 * @module AspectRatio
 * @category Layout
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../core/engines/factory';
import type { AspectRatioProps } from './types';

export {
  type AspectRatioProps,
  type AspectRatioPreset,
  ASPECT_RATIO_DEFAULTS,
  RATIO_PRESETS,
} from './types';


export const AspectRatio = createEngineComponent<AspectRatioProps>('AspectRatio', {
  classic: () => import('./engines/classic'),
  modern: () => import('./engines/modern'),
  rustic: () => import('./engines/rustic'),
});

AspectRatio.displayName = 'AspectRatio';
