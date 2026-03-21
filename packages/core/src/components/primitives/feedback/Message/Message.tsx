/**
 * @fileoverview Message - imperative API for global feedback toasts.
 * Unlike declarative components, Message is invoked via `useMessage()` hook
 * or the static `message.success()` / `message.error()` methods.
 * Multi-engine: Classic (Ant Design), Modern (DaisyUI), Rustic (Vanilla).
 *
 * @example
 * ```tsx
 * const [messageApi, contextHolder] = useMessage();
 * // ...
 * <>{contextHolder}</>
 * messageApi.success('Saved!');
 * messageApi.loading('Processing...');
 * ```
 *
 * @module Message
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
  type MessageType,
  type MessagePlacement,
  type MessageConfig,
  type MessageArgsProps,
  type MessageInstance,
  type MessagePromise,
  type MessageGlobalConfig,
  type MessageProviderProps,
  type MessageItemProps,
  MESSAGE_DEFAULTS,
  MESSAGE_ICONS,
} from './Message.types';

// Engine lookup map -- keyed by built-in engine name, typed to the classic shape
// so all three modules expose the same public surface.
const messageEngines = {
  classic: classicEngine,
  modern: modernEngine,
  rustic: rusticEngine,
} as const satisfies Record<Exclude<EngineName, 'custom'>, typeof classicEngine>;

/**
 * Resolve the imperative message runtime for the active engine.
 * Custom engine packs don't register a message provider contract yet,
 * so classic is used as a stable fallback.
 */
function resolveMessageEngine(engine: EngineName) {
  if (engine === 'custom') {
    return classicEngine;
  }

  return messageEngines[engine];
}

// ---------------------------------------------------------------------------
// Engine-aware wrapper components
// These thin wrappers read the active engine from context and delegate to the
// matching runtime, keeping the public API engine-agnostic.
// ---------------------------------------------------------------------------

/** Provider that creates the message portal for the active engine. */
export const MessageProvider: React.FC<React.ComponentProps<typeof classicEngine.MessageProvider>> = (
  props
) => {
  const { engine } = useEngineContext();
  const Provider = resolveMessageEngine(engine).MessageProvider;
  return React.createElement(Provider, props);
};

/** Renders a single message item through the active engine runtime. */
export const MessageItem: React.FC<React.ComponentProps<typeof classicEngine.MessageItem>> = (
  props
) => {
  const { engine } = useEngineContext();
  const Item = resolveMessageEngine(engine).MessageItem;
  return React.createElement(Item, props);
};

/** Hook facade -- returns `[messageApi, contextHolder]` for the active engine. */
export function useMessage() {
  const { engine } = useEngineContext();
  return resolveMessageEngine(engine).useMessage();
}

// ---------------------------------------------------------------------------
// Static API & default export
// ---------------------------------------------------------------------------

/** Classic-engine static methods (`message.success(...)`) for use without a provider. */
export const message = classicEngine.message;

export default {
  MessageProvider,
  MessageItem,
  useMessage,
  message,
};
