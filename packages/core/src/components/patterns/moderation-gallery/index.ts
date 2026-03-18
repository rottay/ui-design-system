'use client';

/**
 * @fileoverview ModerationGallery pattern -- engine-aware media moderation
 * grid with status states, engagement metrics, triage actions, and bulk
 * review capabilities.
 */

import { createEngineComponent } from '../../../engines/factory';
import type { ModerationGalleryProps } from './ModerationGallery.types';

export type {
  ModerationGalleryProps,
  ModerationItem,
  ModerationBulkAction,
} from './ModerationGallery.types';

/** Engine-resolved ModerationGallery pattern component. */
export const PatternModerationGallery = createEngineComponent<ModerationGalleryProps>(
  'PatternModerationGallery',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/classic'),
    rustic: () => import('./engines/classic'),
  }
);
