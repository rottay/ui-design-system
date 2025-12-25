/**
 * Message API
 *
 * Multi-engine message (toast) component with imperative API.
 * Supports titan (AntD), hermes (DaisyUI), apollo (HTML+Tailwind), and athena (custom).
 *
 * Usage:
 * ```tsx
 * import { message } from '@rottay/core';
 *
 * message.success('Task completed!');
 * message.error('Something went wrong');
 * message.info('Information');
 * message.warning('Warning!');
 * message.loading('Processing...');
 * ```
 */

'use client';

import type { ReactNode } from 'react';
import { getGlobalEngine } from '../../../providers/EngineProvider';
import type {
  MessageAPI,
  MessageContentOptions,
  MessageConfigOptions,
  MessageInstance,
} from '../../../types/components/message';

// Import default engine directly
import titanMessage from './engines/titan';

// Engine cache for loaded engines
const engineCache: Record<string, MessageAPI> = {
  titan: titanMessage,
};

// Engine loading promises to avoid duplicate loads
const loadingPromises: Record<string, Promise<MessageAPI>> = {};

/**
 * Load an engine implementation asynchronously
 */
async function loadEngine(engine: string): Promise<MessageAPI> {
  if (engineCache[engine]) {
    return engineCache[engine];
  }

  if (engine in loadingPromises) {
    return loadingPromises[engine];
  }

  const loadPromise = (async () => {
    let module: { default: MessageAPI };
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
        return titanMessage;
    }
    engineCache[engine] = module.default;
    return module.default;
  })();

  loadingPromises[engine] = loadPromise;
  return loadPromise;
}

/**
 * Get the current engine's message API synchronously.
 * Falls back to titan if the engine isn't loaded yet, and loads it in background.
 */
function getMessageAPI(): MessageAPI {
  const engine = getGlobalEngine();

  // Return cached engine if available
  if (engineCache[engine]) {
    return engineCache[engine];
  }

  // Load engine in background, use titan as fallback
  loadEngine(engine);
  return titanMessage;
}

/**
 * Engine-aware Message API
 * Delegates to the current engine's implementation based on EngineProvider.
 */
const message: MessageAPI = {
  success(content: ReactNode | MessageContentOptions, duration?: number, onClose?: () => void): MessageInstance {
    return getMessageAPI().success(content, duration, onClose);
  },

  error(content: ReactNode | MessageContentOptions, duration?: number, onClose?: () => void): MessageInstance {
    return getMessageAPI().error(content, duration, onClose);
  },

  info(content: ReactNode | MessageContentOptions, duration?: number, onClose?: () => void): MessageInstance {
    return getMessageAPI().info(content, duration, onClose);
  },

  warning(content: ReactNode | MessageContentOptions, duration?: number, onClose?: () => void): MessageInstance {
    return getMessageAPI().warning(content, duration, onClose);
  },

  loading(content: ReactNode | MessageContentOptions, duration?: number, onClose?: () => void): MessageInstance {
    return getMessageAPI().loading(content, duration, onClose);
  },

  open(config: MessageContentOptions): MessageInstance {
    return getMessageAPI().open(config);
  },

  config(options: MessageConfigOptions): void {
    getMessageAPI().config(options);
  },

  destroy(key?: string | number): void {
    getMessageAPI().destroy(key);
  },
};

export { message, message as Message };
export default message;
