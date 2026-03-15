'use client';

/**
 * UserProfileCard - Pattern Component
 *
 * Engine-aware user profile card with avatar, actions, and status.
 */

import { createEngineComponent } from '../../../core/engines/factory';
import type { UserProfileCardProps } from './types';

export type { UserProfileCardProps, UserProfile, ProfileAction } from './types';

export const PatternUserProfileCard = createEngineComponent<UserProfileCardProps>(
  'PatternUserProfileCard',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
