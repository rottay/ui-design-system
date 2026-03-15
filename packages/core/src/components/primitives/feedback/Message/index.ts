/**
 * @fileoverview Message Component - Rottay Design System
 * @description An imperative API for displaying global messages and toasts.
 * Part of the Rottay Design System's feedback primitives collection.
 *
 * @remarks
 * The Message component is built on Rottay's multi-engine architecture, allowing
 * seamless rendering across Classic (Ant Design), Modern (DaisyUI), and Rustic
 * (Vanilla) engines. This ensures consistent behavior while adapting to your
 * project's styling framework.
 *
 * Multi-tenant theming is fully supported - message styling automatically adapts
 * to your tenant's brand colors, spacing, and typography tokens.
 *
 * Unlike most components, Message uses an imperative API pattern where you call
 * methods like `messageApi.success()` to display messages programmatically.
 *
 * @example Basic Usage with Provider and Hook
 * ```tsx
 * import { MessageProvider, useMessage } from '@rottay/design-system';
 *
 * function App() {
 *   return (
 *     <MessageProvider>
 *       <MyComponent />
 *     </MessageProvider>
 *   );
 * }
 *
 * function MyComponent() {
 *   const [messageApi, contextHolder] = useMessage();
 *
 *   return (
 *     <>
 *       {contextHolder}
 *       <button onClick={() => messageApi.success('Operation completed!')}>
 *         Show Success
 *       </button>
 *     </>
 *   );
 * }
 * ```
 *
 * @example Different Message Types
 * ```tsx
 * import { useMessage } from '@rottay/design-system';
 *
 * function NotificationDemo() {
 *   const [messageApi, contextHolder] = useMessage();
 *
 *   const showMessages = () => {
 *     messageApi.success('This is a success message');
 *     messageApi.error('This is an error message');
 *     messageApi.info('This is an info message');
 *     messageApi.warning('This is a warning message');
 *     messageApi.loading('Loading in progress...');
 *   };
 *
 *   return (
 *     <>
 *       {contextHolder}
 *       <button onClick={showMessages}>Show All Types</button>
 *     </>
 *   );
 * }
 * ```
 *
 * @example Custom Duration and Callbacks
 * ```tsx
 * import { useMessage } from '@rottay/design-system';
 *
 * function CustomMessage() {
 *   const [messageApi, contextHolder] = useMessage();
 *
 *   const showMessage = () => {
 *     messageApi.success({
 *       content: 'Custom message with options',
 *       duration: 5,
 *       onClose: () => console.log('Message closed'),
 *       closable: true,
 *     });
 *   };
 *
 *   return (
 *     <>
 *       {contextHolder}
 *       <button onClick={showMessage}>Show Custom</button>
 *     </>
 *   );
 * }
 * ```
 *
 * @example Static Methods (Classic Engine Only)
 * ```tsx
 * import { message } from '@rottay/design-system';
 *
 * // These work globally without context (Classic engine only)
 * message.success('Success!');
 * message.error('Error!');
 * message.info('Info!');
 * message.warning('Warning!');
 * message.loading('Loading...');
 * ```
 *
 * @example Promise-like Chaining
 * ```tsx
 * import { useMessage } from '@rottay/design-system';
 *
 * function AsyncMessage() {
 *   const [messageApi, contextHolder] = useMessage();
 *
 *   const handleSave = async () => {
 *     const hide = messageApi.loading('Saving...');
 *     try {
 *       await saveData();
 *       hide(); // Destroy loading message
 *       messageApi.success('Saved successfully!');
 *     } catch (error) {
 *       hide();
 *       messageApi.error('Save failed!');
 *     }
 *   };
 *
 *   return (
 *     <>
 *       {contextHolder}
 *       <button onClick={handleSave}>Save</button>
 *     </>
 *   );
 * }
 * ```
 *
 * @example Multi-Tenant Theming
 * ```tsx
 * // Message automatically inherits tenant theme
 * <ThemeProvider tenant="acme-corp">
 *   <MessageProvider>
 *     {/* Messages use ACME Corp's brand colors and styling *\/}
 *     <App />
 *   </MessageProvider>
 * </ThemeProvider>
 * ```
 *
 * @see {@link MessageConfig} for message configuration options
 * @see {@link MessageInstance} for the message API interface
 * @see {@link MessageProviderProps} for provider configuration
 * @see {@link useMessage} for the React hook API
 *
 * @module Message
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import React from 'react';
import { useEngineContext } from '../../../../core/providers/engine';
import type { EngineName } from '../../../../core/types';
import * as classicEngine from './engines/classic';
import * as modernEngine from './engines/modern';
import * as rusticEngine from './engines/rustic';

// ============================================================================
// Type Exports
// ============================================================================

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
} from './types';

// ============================================================================
// Component Exports (Default: Classic Engine)
// ============================================================================

const messageEngines = {
  classic: classicEngine,
  modern: modernEngine,
  rustic: rusticEngine,
} as const satisfies Record<Exclude<EngineName, 'athena'>, typeof classicEngine>;

function resolveMessageEngine(engine: EngineName) {
  if (engine === 'athena') {
    return classicEngine;
  }

  return messageEngines[engine];
}

export const MessageProvider: React.FC<React.ComponentProps<typeof classicEngine.MessageProvider>> = (
  props
) => {
  const { engine } = useEngineContext();
  const Provider = resolveMessageEngine(engine).MessageProvider;
  return React.createElement(Provider, props);
};

export const MessageItem: React.FC<React.ComponentProps<typeof classicEngine.MessageItem>> = (
  props
) => {
  const { engine } = useEngineContext();
  const Item = resolveMessageEngine(engine).MessageItem;
  return React.createElement(Item, props);
};

export function useMessage() {
  const { engine } = useEngineContext();
  return resolveMessageEngine(engine).useMessage();
}

// ============================================================================
// Default Export
// ============================================================================

/**
 * Default export containing all Classic engine exports.
 * Includes MessageProvider, MessageItem, useMessage hook, and static message API.
 */
export const message = classicEngine.message;

export default {
  MessageProvider,
  MessageItem,
  useMessage,
  message,
};
