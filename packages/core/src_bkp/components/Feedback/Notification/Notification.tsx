/**
 * Notification API
 *
 * Multi-engine notification component with imperative API.
 * Supports titan (AntD), hermes (DaisyUI), apollo (HTML+Tailwind), and athena (custom).
 *
 * Usage:
 * ```tsx
 * import { notification } from '@rottay/core';
 *
 * notification.success({ message: 'Success!', description: 'Task completed.' });
 * notification.error({ message: 'Error', description: 'Something went wrong.' });
 * notification.info({ message: 'Info', description: 'Here is some info.' });
 * notification.warning({ message: 'Warning', description: 'Please check this.' });
 * ```
 */

'use client';

import { getGlobalEngine } from '../../../providers/EngineProvider';
import type {
  NotificationInstance,
  NotificationConfig,
  NotificationGlobalConfig,
} from '../../../types/components/notification';

// Import default engine directly
import titanNotification from './engines/titan';

// Engine cache for loaded engines
const engineCache: Record<string, NotificationInstance> = {
  titan: titanNotification,
};

// Engine loading promises to avoid duplicate loads
const loadingPromises: Record<string, Promise<NotificationInstance>> = {};

/**
 * Load an engine implementation asynchronously
 */
async function loadEngine(engine: string): Promise<NotificationInstance> {
  if (engineCache[engine]) {
    return engineCache[engine];
  }

  if (engine in loadingPromises) {
    return loadingPromises[engine];
  }

  const loadPromise = (async () => {
    let module: { default: NotificationInstance };
    switch (engine) {
      case 'hermes':
        module = await import('./engines/hermes');
        break;
      case 'apollo':
        module = await import('./engines/apollo');
        break;
      case 'athena':
        module = await import('./engines/athena');
        break;
      default:
        return titanNotification;
    }
    engineCache[engine] = module.default;
    return module.default;
  })();

  loadingPromises[engine] = loadPromise;
  return loadPromise;
}

/**
 * Get the current engine's notification API synchronously.
 * Falls back to titan if the engine isn't loaded yet, and loads it in background.
 */
function getNotificationAPI(): NotificationInstance {
  const engine = getGlobalEngine();

  // Return cached engine if available
  if (engineCache[engine]) {
    return engineCache[engine];
  }

  // Load engine in background, use titan as fallback
  loadEngine(engine);
  return titanNotification;
}

/**
 * Engine-aware Notification API
 * Delegates to the current engine's implementation based on EngineProvider.
 */
const notification: NotificationInstance = {
  open(config: NotificationConfig): void {
    getNotificationAPI().open(config);
  },

  success(config: NotificationConfig): void {
    getNotificationAPI().success(config);
  },

  error(config: NotificationConfig): void {
    getNotificationAPI().error(config);
  },

  info(config: NotificationConfig): void {
    getNotificationAPI().info(config);
  },

  warning(config: NotificationConfig): void {
    getNotificationAPI().warning(config);
  },

  destroy(key?: string): void {
    getNotificationAPI().destroy(key);
  },

  config(options: NotificationGlobalConfig): void {
    getNotificationAPI().config?.(options);
  },
};

export { notification, notification as Notification };
export default notification;
