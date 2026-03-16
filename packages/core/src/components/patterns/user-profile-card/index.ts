'use client';

/**
 * @fileoverview UserProfileCard pattern -- engine-aware user profile card
 * with avatar, role, online status, and configurable action buttons.
 */

import { createEngineComponent } from '../../../engines/factory';
import type { UserProfileCardProps } from './UserProfileCard.types';

export type { UserProfileCardProps, UserProfile, ProfileAction } from './UserProfileCard.types';

export const PatternUserProfileCard = createEngineComponent<UserProfileCardProps>(
  'PatternUserProfileCard',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
