/**
 * @fileoverview Message Modern Engine - Rottay Design System
 * @description DaisyUI/Tailwind implementation of the Message component.
 * Provides lightweight, utility-first message functionality with modern styling.
 *
 * @remarks
 * The Modern engine uses DaisyUI's toast and alert components for a lightweight,
 * utility-first implementation:
 *
 * - **Tailwind Classes**: Uses DaisyUI utility classes for styling
 * - **Provider Required**: Unlike Classic, requires MessageProvider context
 * - **Lightweight**: Minimal bundle size with CSS-based styling
 * - **Accessible**: Full ARIA support with semantic HTML
 *
 * Note: Static message methods (message.success, etc.) are not fully supported
 * in Modern. Use the MessageProvider and useMessage hook for full functionality.
 *
 * @example Provider and Hook Usage
 * ```tsx
 * import { MessageProvider, useMessage } from '@rottay/design-system';
 * // Or import from Modern engine directly:
 * // import { MessageProvider, useMessage } from '@rottay/design-system/engines/modern';
 *
 * function App() {
 *   return (
 *     <MessageProvider placement="top" maxCount={3}>
 *       <MyComponent />
 *     </MessageProvider>
 *   );
 * }
 *
 * function MyComponent() {
 *   const [messageApi] = useMessage();
 *
 *   return (
 *     <button onClick={() => messageApi.success('Saved!')}>
 *       Show Message
 *     </button>
 *   );
 * }
 * ```
 *
 * @see {@link MessageProvider} for provider component
 * @see {@link useMessage} for React hook
 * @see {@link MessageItem} for individual message component
 *
 * @module Message/Modern
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import type {
  MessageConfig,
  MessageInstance,
  MessageProviderProps,
  MessageItemProps,
  MessageType,
} from '../Message.types';
import { MESSAGE_DEFAULTS } from '../Message.types';
import { warnOnceInDev } from '../../../../../utils/runtime-logger';

// ============================================================================
// Internal Types
// ============================================================================

/**
 * Internal message state type with additional key property.
 * @internal
 */
interface InternalMessage extends MessageItemProps {
  /** Optional key for message identification and updates */
  key?: string | number;
}

// ============================================================================
// Context
// ============================================================================

/**
 * React context for the message API.
 * Provides access to message methods throughout the component tree.
 * @internal
 */
const MessageContext = createContext<MessageInstance | null>(null);

// ============================================================================
// Utilities
// ============================================================================

/**
 * Unique ID counter for message identification.
 * @internal
 */
let messageId = 0;

/**
 * Generates a unique message ID.
 * @internal
 */
const generateId = () => `modern-message-${++messageId}`;

// ============================================================================
// Message Provider Component
// ============================================================================

/**
 * MessageProvider - Modern Engine
 *
 * @description
 * Provides message context and renders the toast container for DaisyUI messages.
 * Must wrap any components that use the useMessage hook.
 *
 * @remarks
 * The Modern provider manages message state internally and renders messages
 * using DaisyUI's toast positioning classes. Messages are automatically
 * positioned and stacked within the toast container.
 *
 * @param props - {@link MessageProviderProps}
 * @returns Provider component with toast container
 *
 * @example
 * ```tsx
 * <MessageProvider placement="bottom" maxCount={5} top={32}>
 *   <App />
 * </MessageProvider>
 * ```
 */
export const MessageProvider: React.FC<MessageProviderProps> = ({
  children,
  maxCount = MESSAGE_DEFAULTS.maxCount,
  placement = MESSAGE_DEFAULTS.placement,
  top = MESSAGE_DEFAULTS.top,
}) => {
  const [messages, setMessages] = useState<InternalMessage[]>([]);

  /**
   * Removes a message from state by ID.
   */
  const removeMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  /**
   * Adds a new message to state, respecting maxCount and key updates.
   */
  const addMessage = useCallback(
    (config: MessageConfig & { type: MessageType }): (() => void) => {
      const id = config.key?.toString() || generateId();

      const newMessage: InternalMessage = {
        id,
        key: config.key,
        type: config.type,
        content: config.content,
        duration: config.duration ?? MESSAGE_DEFAULTS.duration,
        onClose: config.onClose,
        icon: config.icon,
        className: config.className,
        style: config.style,
        closable: config.closable,
        closeIcon: config.closeIcon,
      };

      setMessages((prev) => {
        // Key-based deduplication: if a message with the same key exists,
        // replace it in-place rather than adding a duplicate. This enables
        // "loading -> success" transition patterns where the same key
        // is reused to update a message's content and type.
        const existingIndex = prev.findIndex(
          (m) => config.key && m.key === config.key
        );
        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = newMessage;
          return updated;
        }

        // Trim oldest messages when exceeding maxCount to prevent
        // unbounded DOM growth in rapid-fire scenarios (e.g., form validation).
        const updated = [...prev, newMessage];
        if (updated.length > maxCount) {
          return updated.slice(-maxCount);
        }
        return updated;
      });

      return () => removeMessage(id);
    },
    [maxCount, removeMessage]
  );

  /**
   * Creates a type-specific message method.
   */
  const createMessageMethod = useCallback(
    (type: MessageType) => {
      return (
        content: ReactNode | MessageConfig,
        duration?: number,
        onClose?: () => void
      ) => {
        const config: MessageConfig & { type: MessageType } =
          typeof content === 'object' && content !== null && 'content' in content
            ? { ...(content as MessageConfig), type }
            : { content: content as ReactNode, duration, onClose, type };

        const destroy = addMessage(config);

        const result = () => destroy();
        result.then = (fn: () => void) => {
          setTimeout(fn, (config.duration ?? MESSAGE_DEFAULTS.duration) * 1000);
        };
        return result;
      };
    },
    [addMessage]
  );

  /** Complete message API instance */
  const messageApi: MessageInstance = {
    success: createMessageMethod('success'),
    error: createMessageMethod('error'),
    info: createMessageMethod('info'),
    warning: createMessageMethod('warning'),
    loading: createMessageMethod('loading'),
    open: (config: MessageConfig) => {
      const type = config.type || 'info';
      return createMessageMethod(type)(config);
    },
    destroy: (key?: string | number) => {
      if (key !== undefined) {
        setMessages((prev) =>
          prev.filter((m) => m.key !== key && m.id !== key.toString())
        );
      } else {
        setMessages([]);
      }
    },
  };

  // DaisyUI toast classes handle fixed positioning and stacking natively,
  // avoiding manual z-index/position CSS. Only top/bottom are supported
  // (unlike Notification which supports 6 placements) because messages
  // are brief, centered alerts by convention.
  const placementClasses = {
    top: 'toast toast-top toast-center',
    bottom: 'toast toast-bottom toast-center',
  };

  return (
    <MessageContext.Provider value={messageApi}>
      {children}
      <div
        className={placementClasses[placement]}
        style={{ marginTop: placement === 'top' ? top : undefined }}
      >
        {messages.map(({ key: _messageKey, ...msg }) => (
          <MessageItem key={msg.id} {...msg} onRemove={removeMessage} />
        ))}
      </div>
    </MessageContext.Provider>
  );
};

MessageProvider.displayName = 'MessageProvider.Modern';

// ============================================================================
// useMessage Hook
// ============================================================================

/**
 * useMessage hook - Modern Engine
 *
 * @description
 * Returns the message API from the MessageProvider context.
 * Must be used within a MessageProvider component.
 *
 * @remarks
 * Unlike Classic, Modern does not require a context holder to be rendered.
 * The second element of the returned tuple is always null.
 *
 * If used outside a MessageProvider, returns no-op methods that do nothing.
 *
 * @returns Tuple of [MessageInstance, null]
 *   - MessageInstance: API object with message methods
 *   - null: No context holder needed for Modern
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const [messageApi] = useMessage();
 *
 *   return (
 *     <button onClick={() => messageApi.info('Hello!')}>
 *       Show Info
 *     </button>
 *   );
 * }
 * ```
 */
export function useMessage(): [MessageInstance, React.ReactElement | null] {
  const context = useContext(MessageContext);

  if (!context) {
    // Graceful degradation: return no-op methods when used outside a provider
    // rather than throwing. This prevents runtime crashes during SSR or when
    // components are rendered in isolation (e.g., Storybook without providers).
    const noop = () => {
      const result = () => {};
      result.then = () => {};
      return result;
    };
    return [
      {
        success: noop,
        error: noop,
        info: noop,
        warning: noop,
        loading: noop,
        open: noop,
        destroy: () => {},
      },
      null,
    ];
  }

  // Second tuple element is null because Modern renders messages inside
  // the provider's toast container -- no contextHolder injection needed
  // (unlike Classic which requires Ant Design's contextHolder in the tree).
  return [context, null];
}

// ============================================================================
// Message Item Component
// ============================================================================

/**
 * MessageItem - Modern Engine
 *
 * @description
 * Individual message component using DaisyUI alert classes.
 * Renders with appropriate styling based on message type.
 *
 * @remarks
 * Uses DaisyUI's alert component classes for consistent styling:
 * - `alert-success` for success messages
 * - `alert-error` for error messages
 * - `alert-info` for info and loading messages
 * - `alert-warning` for warning messages
 *
 * SVG icons are inline for better performance and customization.
 *
 * @param props - {@link MessageItemProps}
 * @returns DaisyUI-styled alert element
 *
 * @example
 * ```tsx
 * <MessageItem
 *   id="msg-1"
 *   type="success"
 *   content="Operation completed"
 *   duration={3}
 *   closable={true}
 * />
 * ```
 */
export const MessageItem: React.FC<MessageItemProps> = ({
  id,
  type,
  content,
  duration = MESSAGE_DEFAULTS.duration,
  onClose,
  icon,
  className = '',
  style,
  closable,
  closeIcon,
  onRemove,
}) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-close timer
  useEffect(() => {
    if (duration > 0) {
      timerRef.current = setTimeout(() => {
        onRemove?.(id);
        onClose?.();
      }, duration * 1000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [id, duration, onRemove, onClose]);

  // Manual close must cancel the auto-close timer first to prevent
  // a double-removal race condition (user clicks close, then timer fires).
  const handleClose = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    onRemove?.(id);
    onClose?.();
  };

  /** DaisyUI alert class mapping */
  const alertClasses: Record<MessageType, string> = {
    success: 'alert-success',
    error: 'alert-error',
    info: 'alert-info',
    warning: 'alert-warning',
    loading: 'alert-info',
  };

  // Inline SVG icons instead of an icon library to keep the Modern engine's
  // bundle lightweight. Each icon uses stroke-based paths for consistent
  // rendering at small sizes (h-5 w-5 = 20px). The loading type uses
  // DaisyUI's built-in spinner component for native animation support.
  const icons: Record<MessageType, ReactNode> = {
    success: (
      <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    error: (
      <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    info: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    loading: (
      <span className="loading loading-spinner loading-sm"></span>
    ),
  };

  // role="alert" triggers screen reader announcement on appearance.
  // DaisyUI alert classes provide semantic color coding that respects
  // the active DaisyUI theme (light/dark/custom).
  return (
    <div
      className={`alert ${alertClasses[type]} shadow-lg ${className}`}
      style={style}
      role="alert"
    >
      <span>{icon || icons[type]}</span>
      <span>{content}</span>
      {/* aria-label required because the close button has no visible text
          label -- only an SVG icon. btn-ghost keeps the button visually
          minimal so it doesn't compete with the alert content. */}
      {closable && (
        <button
          className="btn btn-ghost btn-xs"
          onClick={handleClose}
          aria-label="Close"
        >
          {closeIcon || (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
};

MessageItem.displayName = 'MessageItem.Modern';

// ============================================================================
// Global Message Store (Limited Support)
// ============================================================================

/**
 * Global message storage for static methods.
 * @internal
 */
let _globalMessages: InternalMessage[] = [];
let _globalSetMessages: React.Dispatch<React.SetStateAction<InternalMessage[]>> | null = null;

// Keep references to avoid unused variable warnings
void _globalMessages;
void _globalSetMessages;

/**
 * Sets the global message handler for static methods.
 * @internal
 */
export const setGlobalMessageHandler = (
  setter: React.Dispatch<React.SetStateAction<InternalMessage[]>>
) => {
  _globalSetMessages = setter;
};

// ============================================================================
// Static Message API (Limited Support)
// ============================================================================

/**
 * Static message methods - Modern Engine
 *
 * @description
 * Static methods are NOT fully supported in the Modern engine.
 * These methods will log a warning and do nothing.
 *
 * @remarks
 * For full functionality, use the MessageProvider and useMessage hook.
 * Static methods are only available in the Classic engine.
 *
 * @example
 * ```tsx
 * // This will NOT work - use Provider instead
 * message.success('Hello'); // Logs warning
 *
 * // Correct usage for Modern:
 * const [messageApi] = useMessage();
 * messageApi.success('Hello');
 * ```
 */
export const message: MessageInstance = {
  success: (_content, _duration, _onClose) => {
    warnOnceInDev(
      'message-modern:provider-required',
      'Modern message: Please use MessageProvider and useMessage hook for full functionality'
    );
    const result = () => {};
    result.then = () => {};
    return result;
  },
  error: (_content, _duration, _onClose) => {
    warnOnceInDev(
      'message-modern:provider-required',
      'Modern message: Please use MessageProvider and useMessage hook for full functionality'
    );
    const result = () => {};
    result.then = () => {};
    return result;
  },
  info: (_content, _duration, _onClose) => {
    warnOnceInDev(
      'message-modern:provider-required',
      'Modern message: Please use MessageProvider and useMessage hook for full functionality'
    );
    const result = () => {};
    result.then = () => {};
    return result;
  },
  warning: (_content, _duration, _onClose) => {
    warnOnceInDev(
      'message-modern:provider-required',
      'Modern message: Please use MessageProvider and useMessage hook for full functionality'
    );
    const result = () => {};
    result.then = () => {};
    return result;
  },
  loading: (_content, _duration, _onClose) => {
    warnOnceInDev(
      'message-modern:provider-required',
      'Modern message: Please use MessageProvider and useMessage hook for full functionality'
    );
    const result = () => {};
    result.then = () => {};
    return result;
  },
  open: (_config) => {
    warnOnceInDev(
      'message-modern:provider-required',
      'Modern message: Please use MessageProvider and useMessage hook for full functionality'
    );
    const result = () => {};
    result.then = () => {};
    return result;
  },
  destroy: () => {
    warnOnceInDev(
      'message-modern:provider-required',
      'Modern message: Please use MessageProvider and useMessage hook for full functionality'
    );
  },
};

// ============================================================================
// Default Export
// ============================================================================

/**
 * Default export containing all Modern engine message exports.
 */
export default {
  MessageProvider,
  MessageItem,
  useMessage,
  message,
};
