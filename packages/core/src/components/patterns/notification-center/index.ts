'use client';

/**
 * NotificationCenter - Pattern Component
 *
 * Engine-aware notification bell with dropdown list, unread badges, and actions.
 */

import { createEngineComponent } from '../../../core/engines/factory';
import type { NotificationCenterProps } from './NotificationCenter.types';

export type { NotificationCenterProps, Notification } from './NotificationCenter.types';

export const PatternNotificationCenter = createEngineComponent<NotificationCenterProps>(
  'PatternNotificationCenter',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
