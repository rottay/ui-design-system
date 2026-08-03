'use client';

/**
 * @fileoverview ModerationGallery pattern -- engine-aware media moderation
 * grid with status states, engagement metrics, triage actions, and bulk
 * review capabilities.
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { ModerationGalleryProps } from './contracts';

export type {
  ModerationGalleryProps,
  ModerationItem,
  ModerationBulkAction,
} from './contracts';

/**
 * @category domain-kit (review/ops)
 * Ships a real modern engine (token-driven, composed primitives); classic and
 * rustic continue to resolve to the shared classic implementation.
 */
export const PatternModerationGallery = createEngineComponent<ModerationGalleryProps>(
  'PatternModerationGallery',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/classic'),
  }
);
