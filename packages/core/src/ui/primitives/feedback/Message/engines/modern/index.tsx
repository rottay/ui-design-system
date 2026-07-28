/**
 * @fileoverview Message Modern Engine - Rottay Design System
 * @description Token-driven Tailwind implementation of the Message component.
 * Provides lightweight, utility-first message functionality with modern styling.
 *
 * @remarks
 * The Modern engine is a self-contained `rottay-message--modern` tree:
 *
 * - **No DaisyUI Classes**: the stack container's toast placement classes
 *   were drained; the unlayered skin `message.css` owns fixed placement,
 *   stacking and item surface paint outright
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
} from '../../contracts';
import { MESSAGE_DEFAULTS } from '../../contracts';
import { warnOnceInDev } from '@/infrastructure/runtime/foundation/diagnostics/development-logging';
import { useTranslation } from '@/infrastructure/runtime/i18n';
import { StatusInfoIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-info';
import { StatusSuccessIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-success';
import { StatusWarningIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-warning';
import { StatusErrorIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-error';
import { ActionCloseIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-close';

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
 * Exit-lifecycle cadence in milliseconds. Kept in lockstep with the skin's
 * `--ds-motion-fast` exit animation (skin/message.css, data-state='exit'):
 * the node stays mounted for exactly one cadence so the exit can paint.
 * @internal
 */
const MESSAGE_EXIT_DURATION_MS = 160;

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
 * Provides message context and renders the stack container for Modern
 * messages. Must wrap any components that use the useMessage hook.
 *
 * @remarks
 * The Modern provider manages message state internally. Placement and
 * surface paint are owned by the unlayered skin `message.css`, keyed on
 * the stamped `data-placement` attribute.
 *
 * @param props - {@link MessageProviderProps}
 * @returns Provider component with stack container
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

  // Fixed placement and stacking are owned outright by the unlayered skin
  // message.css, keyed on the stamped data-placement attribute -- no DaisyUI
  // toast placement classes are emitted (Notification K4-A pattern). Only
  // top/bottom are supported (unlike Notification which supports 6
  // placements) because messages are brief, centered alerts by convention.
  //
  // The provider's `top` prop is a block-axis offset from the viewport edge
  // (pixel number per the contracts). The engine stamps the dynamic value on
  // the --ds-message-stack-offset channel and the skin declares the `top`
  // property that consumes it, keeping the skin the single paint owner while
  // preserving the configurable-offset public API.
  const stackOffset: React.CSSProperties | undefined =
    placement === 'top'
      ? ({ '--ds-message-stack-offset': `${top}px` } as React.CSSProperties)
      : undefined;

  return (
    <MessageContext.Provider value={messageApi}>
      {children}
      {/* role="log" + aria-live="polite" mirrors the rustic stack: assistive
          technologies announce arriving messages without interrupting the
          user's current task. The items themselves keep role="alert". */}
      <div
        data-part="stack-container"
        data-placement={placement}
        className="rottay-message-stack--modern"
        style={stackOffset}
        role="log"
        aria-live="polite"
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
  // the provider's stack container -- no contextHolder injection needed
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
 * Individual message component using DS token inline styles.
 * Renders with appropriate styling based on message type.
 *
 * @remarks
 * Uses DS token alert style mapping for consistent styling:
 * - `--ds-color-success` tinted background for success messages
 * - `--ds-color-error` tinted background for error messages
 * - `--ds-color-info` tinted background for info and loading messages
 * - `--ds-color-warning` tinted background for warning messages
 *
 * SVG icons are inline for better performance and customization.
 *
 * @param props - {@link MessageItemProps}
 * @returns DS token-styled alert element
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
  const { t } = useTranslation('common');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Exit lifecycle (parity with the rustic engine): close/auto-expiry first
  // plays the skin's exit animation, then removes the node, so the stack
  // never witnesses an abrupt disappearance.
  const [exiting, setExiting] = useState(false);

  const beginExit = useCallback(() => {
    if (exitTimerRef.current) return; // exit already in flight
    setExiting(true);
    exitTimerRef.current = setTimeout(() => {
      onRemove?.(id);
      onClose?.();
    }, MESSAGE_EXIT_DURATION_MS);
  }, [id, onRemove, onClose]);

  // Auto-close countdown with hover pause (Toast family parity): hovering
  // freezes BOTH the JS countdown (remaining-time tracked, never a full
  // restart) and the skin's progress bar (data-paused), so a user reading a
  // long message never loses it mid-sentence.
  const [isPaused, setIsPaused] = useState(false);
  const remainingRef = useRef<number>(duration > 0 ? duration * 1000 : 0);
  const startedAtRef = useRef(0);
  // A duration prop change re-arms the countdown from its full length,
  // matching the pre-pause contract.
  const prevDurationRef = useRef(duration);
  if (prevDurationRef.current !== duration) {
    prevDurationRef.current = duration;
    remainingRef.current = duration > 0 ? duration * 1000 : 0;
  }

  useEffect(() => {
    if (duration > 0 && !isPaused) {
      startedAtRef.current = Date.now();
      timerRef.current = setTimeout(beginExit, remainingRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [duration, isPaused, beginExit]);

  // The exit timer is independent of the hover-aware countdown above: it only
  // needs cancelling on unmount.
  useEffect(() => () => {
    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
    }
  }, []);

  const handleMouseEnter = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startedAtRef.current));
    }
    setIsPaused(true);
  };
  const handleMouseLeave = () => setIsPaused(false);

  // Manual close must cancel the auto-close timer first to prevent
  // a double-removal race condition (user clicks close, then timer fires).
  const handleClose = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    beginExit();
  };

  // Per-type fill and text colour are keyed on `data-tone` in the unlayered
  // modern Message skin; the exit lifecycle rides `data-state` there. The
  // stack container's placement is skin-owned as well: the provider emits no
  // DaisyUI placement classes (drained alongside the theme.css toast bridge).

  const icons: Record<MessageType, ReactNode> = {
    success: <StatusSuccessIcon decorative size={18} />,
    error: <StatusErrorIcon decorative size={18} />,
    info: <StatusInfoIcon decorative size={18} />,
    warning: <StatusWarningIcon decorative size={18} />,
    // `data-icon` marks the built-in spinner so the skin's ring rule cannot also
    // paint a consumer-supplied `icon` rendered into the same slot. Geometry
    // and the spin cadence are skin-owned (message.css).
    loading: <span data-icon="spinner" />,
  };

  // role="alert" triggers screen reader announcement on appearance, inside the
  // stack's polite role="log" live region; aria-live="polite" on the item
  // mirrors the rustic engine's announcement posture.
  return (
    <div
      data-part="root"
      data-tone={type}
      data-state={exiting ? 'exit' : 'enter'}
      data-closable={closable ? 'true' : 'false'}
      data-paused={isPaused ? 'true' : 'false'}
      className={`rottay-message--modern ${className}`}
      style={{
        '--ds-message-duration': duration > 0 ? `${duration}s` : undefined,
        ...style,
      } as React.CSSProperties}
      role="alert"
      aria-live="polite"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span data-part="icon">{icon || icons[type]}</span>
      <span data-part="body">{content}</span>
      {/* aria-label required because the close button has no visible text
          label -- only an SVG icon. */}
      {closable && (
        <button
          type="button"
          data-part="close-button"
          onClick={handleClose}
          aria-label={t('close')}
        >
          {closeIcon || <ActionCloseIcon decorative size={14} />}
        </button>
      )}
      {duration > 0 && <span data-part="progress" aria-hidden="true" />}
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
