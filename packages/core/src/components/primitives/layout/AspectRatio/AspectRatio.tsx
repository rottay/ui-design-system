'use client';

/**
 * @fileoverview AspectRatio -- container that enforces a width-to-height ratio
 * for responsive images, videos, maps, and embedded content.
 *
 * @example
 * ```tsx
 * import { AspectRatio } from '@rottay/design-system';
 *
 * <AspectRatio ratio={16 / 9}>
 *   <img src="/hero.jpg" alt="Hero" style={{ objectFit: 'cover' }} />
 * </AspectRatio>
 * ```
 *
 * @module AspectRatio
 * @category Layout
 */

import { createEngineComponent } from '../../../../runtime/engines/factory';
import type { AspectRatioProps } from './AspectRatio.types';

export {
  type AspectRatioProps,
  type AspectRatioPreset,
  ASPECT_RATIO_DEFAULTS,
  RATIO_PRESETS,
} from './AspectRatio.types';

/** Aspect ratio container resolved through the active engine. */
export const AspectRatio = createEngineComponent<AspectRatioProps>('AspectRatio', {
  /** Ant Design compatible wrapper using padding-bottom trick */
  classic: () => import('./engines/classic'),
  /** Tailwind CSS using native aspect-ratio property */
  modern: () => import('./engines/modern'),
  /** Pure CSS with padding-bottom fallback for older browsers */
  rustic: () => import('./engines/rustic'),
});

AspectRatio.displayName = 'AspectRatio';
