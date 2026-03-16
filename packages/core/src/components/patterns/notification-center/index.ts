'use client';

/**
 * @fileoverview NotificationCenter pattern - Rottay Design System
 * @description Engine-aware notification inbox with badge state, dropdown list,
 * and quick actions for read/archive flows.
 *
 * @remarks
 * This is intentionally a pattern, not a primitive: it coordinates trigger,
 * list rendering, unread state, and item actions into a reusable shell.
 */

import { createEngineComponent } from '../../../engines/factory';
import type { NotificationCenterProps } from './NotificationCenter.types';

export type { NotificationCenterProps, Notification } from './NotificationCenter.types';

/** Public notification center entry point resolved through the current engine. */
export const PatternNotificationCenter = createEngineComponent<NotificationCenterProps>(
  'PatternNotificationCenter',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
