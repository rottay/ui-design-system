'use client';

/**
 * NotificationCenter - Pattern Component
 *
 * Engine-aware notification bell with dropdown list, unread badges, and actions.
 */

import { createEngineComponent } from '../../../core/engines/factory';
import type { NotificationCenterProps } from './types';

export type { NotificationCenterProps, Notification } from './types';

export const PatternNotificationCenter = createEngineComponent<NotificationCenterProps>(
  'PatternNotificationCenter',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
