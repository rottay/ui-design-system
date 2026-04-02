'use client';

/**
 * @fileoverview ModerationGallery pattern -- engine-aware media moderation
 * grid with status states, engagement metrics, triage actions, and bulk
 * review capabilities.
 */

import { createEngineComponent } from '../../../runtime/engines/factory';
import type { ModerationGalleryProps } from './ModerationGallery.types';

export type {
  ModerationGalleryProps,
  ModerationItem,
  ModerationBulkAction,
} from './ModerationGallery.types';

/**
 * @engine classic-only
 * @category domain-kit (review/ops)
 * This pattern is domain-specific and ships only with the classic engine.
 * Modern engine parity is not planned. Consider moving to components/kits/
 * when the kit infrastructure is established.
 */
export const PatternModerationGallery = createEngineComponent<ModerationGalleryProps>(
  'PatternModerationGallery',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/classic'),
    rustic: () => import('./engines/classic'),
  }
);
