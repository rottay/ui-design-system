/**
 * @fileoverview Notification - imperative API for corner-positioned rich alerts.
 * More prominent than Message/Toast: includes title, description, and optional actions.
 * Multi-engine: Classic (Ant Design), Modern (DaisyUI), Rustic (Vanilla).
 *
 * @example
 * ```tsx
 * const [api, contextHolder] = useNotification();
 * // ...
 * <>{contextHolder}</>
 * api.success({ message: 'Saved', description: 'Changes applied.' });
 * ```
 *
 * @module Notification
 * @category Feedback
 */

'use client';

import React from 'react';
import { useEngineContext } from '../../../../runtime/engines/EngineProvider';
import type { EngineName } from '../../../../contracts';
import * as classicEngine from './engines/classic';
import * as modernEngine from './engines/modern';
import * as rusticEngine from './engines/rustic';

export {
  type NotificationType,
  type NotificationPlacement,
  type NotificationConfig,
  type NotificationArgsProps,
  type NotificationInstance,
  type NotificationGlobalConfig,
  type NotificationProviderProps,
  type NotificationItemProps,
  NOTIFICATION_DEFAULTS,
  NOTIFICATION_ICONS,
} from './Notification.types';

// Engine lookup map -- typed to the classic shape so all three expose the same API.
const notificationEngines = {
  classic: classicEngine,
  modern: modernEngine,
  rustic: rusticEngine,
} as const satisfies Record<Exclude<EngineName, 'custom'>, typeof classicEngine>;

/**
 * Resolve the notification runtime for the active engine.
 * Custom packs fall back to classic until they register their own provider.
 */
function resolveNotificationEngine(engine: EngineName) {
  if (engine === 'custom') {
    return classicEngine;
  }

  return notificationEngines[engine];
}

// ---------------------------------------------------------------------------
// Engine-aware wrapper components
// Thin delegates that read the active engine from context.
// ---------------------------------------------------------------------------

/** Provider that creates the notification portal for the active engine. */
export const NotificationProvider: React.FC<
  React.ComponentProps<typeof classicEngine.NotificationProvider>
> = (props) => {
  const { engine } = useEngineContext();
  const Provider = resolveNotificationEngine(engine).NotificationProvider;
  return React.createElement(Provider, props);
};

/** Renders a single notification card through the active engine runtime. */
export const NotificationItem: React.FC<React.ComponentProps<typeof classicEngine.NotificationItem>> = (
  props
) => {
  const { engine } = useEngineContext();
  const Item = resolveNotificationEngine(engine).NotificationItem;
  return React.createElement(Item, props);
};

/** Hook facade -- returns `[notificationApi, contextHolder]` for the active engine. */
export function useNotification() {
  const { engine } = useEngineContext();
  return resolveNotificationEngine(engine).useNotification();
}

// ---------------------------------------------------------------------------
// Static API & default export
// ---------------------------------------------------------------------------

/** Classic-engine static methods (`notification.success(...)`) for use without a provider. */
export const notification = classicEngine.notification;

export default {
  NotificationProvider,
  NotificationItem,
  useNotification,
  notification,
};
