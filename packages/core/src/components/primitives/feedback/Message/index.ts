/**
 * Message - Engine Router
 * Imperative API for global messages/toasts
 *
 * Usage:
 * ```tsx
 * // With Provider (recommended)
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
 *       <button onClick={() => messageApi.success('Success!')}>
 *         Show Message
 *       </button>
 *     </>
 *   );
 * }
 *
 * // With static methods (Titan only)
 * import { message } from '@rottay/design-system';
 *
 * message.success('Success!');
 * message.error('Error!');
 * message.info('Info!');
 * message.warning('Warning!');
 * message.loading('Loading...');
 * ```
 */

// Re-export types
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

// Re-export from Titan engine (default)
export {
  MessageProvider,
  MessageItem,
  useMessage,
  message,
} from './engines/titan';

// Default export
import * as titanEngine from './engines/titan';
export default titanEngine;
