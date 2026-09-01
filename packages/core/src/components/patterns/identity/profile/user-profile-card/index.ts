'use client';

/**
 * @fileoverview UserProfileCard pattern -- engine-aware user profile card
 * with avatar, role, online status, and configurable action buttons.
 */

import { createEngineComponent } from '../../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { UserProfileCardProps } from './contracts';

export type { UserProfileCardProps, UserProfile, ProfileAction } from './contracts';

export const PatternUserProfileCard = createEngineComponent<UserProfileCardProps>(
  'PatternUserProfileCard',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
