/**
 * @fileoverview Message Rustic Engine - Rottay Design System
 * @description Pure HTML/CSS implementation of the Message component.
 * Provides accessible, zero-dependency message functionality.
 *
 * @remarks
 * The Rustic engine uses vanilla HTML and CSS for a completely dependency-free
 * implementation with maximum accessibility:
 *
 * - **Zero Dependencies**: No external CSS frameworks required
 * - **Full Accessibility**: ARIA attributes, role="alert", aria-live regions
 * - **CSS Animations**: Smooth enter/exit animations via injected keyframes
 * - **Provider Required**: Requires MessageProvider context for functionality
 * - **Maximum Control**: Direct style object manipulation for full customization
 *
 * Note: Static message methods are not supported in Rustic.
 * Use the MessageProvider and useMessage hook for full functionality.
 *
 * @example Provider and Hook Usage
 * ```tsx
 * import { MessageProvider, useMessage } from '@rottay/design-system';
 *
 * function App() {
 *   return (
 *     <MessageProvider placement="top" maxCount={5}>
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
 * @module Message/Rustic
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
import { MESSAGE_DEFAULTS, MESSAGE_ICONS } from '../../contracts';
import { warnOnceInDev } from '@/infrastructure/runtime/foundation/diagnostics/development-logging';

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
const generateId = () => `rustic-message-${++messageId}`;

// ============================================================================
// Styles
// ============================================================================

/**
 * Style definitions for Rustic message components.
 * All styles are defined as React.CSSProperties objects.
 * @internal
 */
const styles = {
  /**
   * Container positioning styles based on placement.
   */
  // Fixed positioning with translateX(-50%) centers the container without
  // requiring a parent flex wrapper. pointerEvents: 'none' on the container
  // prevents it from blocking clicks on underlying content -- individual
  // messages re-enable pointer events via 'auto'.
  container: (placement: 'top' | 'bottom', top: number): React.CSSProperties => ({
    position: 'fixed',
    left: '50%',
    [placement]: placement === 'top' ? top : 24,
    zIndex: 'var(--ds-message-z-index, 1000)' as unknown as number,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--ds-message-gap, 8px)',
    pointerEvents: 'none',
  }),

  /**
   * Message box styles for each type.
   */
  // Per-type fill, border and icon colour are keyed on `data-tone` in the
  // unlayered rustic Message skin.
  message: {
    base: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: 'var(--ds-message-padding, 10px 16px)',
      pointerEvents: 'auto' as const,
      // cubic-bezier(0.22, 1, 0.36, 1) is an "ease-out-expo" curve that
      // decelerates sharply, giving messages a snappy entrance that settles
      // naturally. Duration and easing are exposed as CSS vars so tenants
      // can adjust animation feel without JS changes.
      animation:
        'ds-message-slide-in-rustic var(--ds-message-enter-duration, 220ms) var(--ds-message-enter-easing, cubic-bezier(0.22, 1, 0.36, 1))',
      maxWidth: 'var(--ds-message-max-width, 400px)',
      minWidth: 'var(--ds-message-min-width, 200px)',
    } as React.CSSProperties,
  },

  /**
   * Icon styles shared by every message type.
   */
  icon: {
    base: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '16px',
      height: '16px',
      fontSize: '14px',
    } as React.CSSProperties,
  },

  /**
   * Content text styles.
   */
  content: {
    flex: 1,
    fontSize: 'var(--ds-message-font-size, 14px)',
    lineHeight: 'var(--ds-message-line-height, 22px)',
  } as React.CSSProperties,

  /**
   * Close button styles.
   */
  closeButton: {
    cursor: 'pointer',
    padding: '0',
    marginLeft: '8px',
    fontSize: '14px',
    lineHeight: 1,
    transition: 'color var(--ds-duration-fast, 150ms)',
  } as React.CSSProperties,

  /**
   * Loading spinner styles.
   */
  // CSS-only spinner avoids importing a spinner component or animation library.
  // The ring (border + transparent top edge) is painted by the skin, keyed on
  // the loading tone's empty icon element.
  loadingSpinner: {
    display: 'inline-block',
    width: '14px',
    height: '14px',
    animation: 'ds-message-spin-rustic var(--ds-spinner-duration, 0.8s) linear infinite',
  } as React.CSSProperties,
};

// ============================================================================
// Keyframes Injection
// ============================================================================

/**
 * Injects CSS keyframes for message animations.
 * Only runs on client-side and only once per page load.
 * @internal
 */
// The three keyframes this engine drives (slide-in, slide-out, spin) ship in the
// unlayered rustic Message skin, engine-namespaced. Nothing is injected at runtime.

// ============================================================================
// Message Provider Component
// ============================================================================

/**
 * MessageProvider - Rustic Engine
 *
 * @description
 * Provides message context and renders the message container using vanilla CSS.
 * Must wrap any components that use the useMessage hook.
 *
 * @remarks
 * The Rustic provider:
 * - Injects necessary CSS keyframes on mount
 * - Manages message state internally
 * - Renders accessible message container with ARIA attributes
 * - Supports both top and bottom placement
 *
 * @param props - {@link MessageProviderProps}
 * @returns Provider component with message container
 *
 * @example
 * ```tsx
 * <MessageProvider placement="top" maxCount={5} top={24}>
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
        // If key exists, update existing message
        const existingIndex = prev.findIndex(
          (m) => config.key && m.key === config.key
        );
        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = newMessage;
          return updated;
        }

        // Add new message, respecting maxCount
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

  return (
    <MessageContext.Provider value={messageApi}>
      {children}
      {/* role="log" + aria-live="polite" tells assistive technologies to
          announce new messages without interrupting the user's current task.
          "polite" is preferred over "assertive" for messages since they are
          informational, not urgent (unlike error notifications). */}
      <div
        data-part="stack-container"
        data-placement={placement}
        className="rottay-message-stack--rustic"
        style={styles.container(placement, top)}
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

MessageProvider.displayName = 'MessageProvider.Rustic';

// ============================================================================
// useMessage Hook
// ============================================================================

/**
 * useMessage hook - Rustic Engine
 *
 * @description
 * Returns the message API from the MessageProvider context.
 * Must be used within a MessageProvider component.
 *
 * @remarks
 * Unlike Classic, Rustic does not require a context holder to be rendered.
 * The second element of the returned tuple is always null.
 *
 * If used outside a MessageProvider, returns no-op methods that do nothing.
 *
 * @returns Tuple of [MessageInstance, null]
 *   - MessageInstance: API object with message methods
 *   - null: No context holder needed for Rustic
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const [messageApi] = useMessage();
 *
 *   return (
 *     <button onClick={() => messageApi.warning('Careful!')}>
 *       Show Warning
 *     </button>
 *   );
 * }
 * ```
 */
export function useMessage(): [MessageInstance, React.ReactElement | null] {
  const context = useContext(MessageContext);

  if (!context) {
    // Fallback: return no-op methods if no provider
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

  return [context, null];
}

// ============================================================================
// Message Item Component
// ============================================================================

/**
 * MessageItem - Rustic Engine
 *
 * @description
 * Individual message component using vanilla HTML and CSS.
 * Fully accessible with ARIA attributes and keyboard support.
 *
 * @remarks
 * Features:
 * - Smooth CSS animations for enter/exit
 * - Accessible with role="alert" and aria-live
 * - Hover states for close button
 * - Auto-close timer with cleanup
 * - Custom icon support
 *
 * @param props - {@link MessageItemProps}
 * @returns Accessible message element with vanilla styling
 *
 * @example
 * ```tsx
 * <MessageItem
 *   id="msg-1"
 *   type="info"
 *   content="Here is some information"
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
  const [isExiting, setIsExiting] = useState(false);

  // Auto-close timer
  useEffect(() => {
    if (duration > 0) {
      timerRef.current = setTimeout(() => {
        handleClose();
      }, duration * 1000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [id, duration]);

  // Two-phase close: first trigger exit animation via isExiting state,
  // then remove from DOM after the animation completes (220ms matches
  // the CSS exit animation duration). This prevents the abrupt
  // disappearance that would occur with immediate DOM removal.
  const handleClose = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsExiting(true);
    setTimeout(() => {
      onRemove?.(id);
      onClose?.();
    }, 220);
  };

  /**
   * Renders the appropriate icon based on type or custom icon.
   */
  // `data-icon` marks which of the three icon shapes rendered. The skin keys the
  // spinner ring and the per-tone glyph colour on it, so a consumer-supplied
  // `icon` -- which carries neither and was never painted here -- stays unpainted.
  const renderIcon = () => {
    if (icon) return <span data-part="icon">{icon}</span>;

    if (type === 'loading') {
      return <span data-part="icon" data-icon="spinner" style={styles.loadingSpinner} />;
    }

    return (
      <span data-part="icon" data-icon="builtin" style={styles.icon.base}>
        {MESSAGE_ICONS[type]}
      </span>
    );
  };

  /** Combined message styles with animation styles */
  const messageStyle: React.CSSProperties = {
    ...styles.message.base,
    ...(isExiting
      ? {
          animation:
            'ds-message-slide-out-rustic var(--ds-message-exit-duration, 160ms) var(--ds-message-exit-easing, cubic-bezier(0.4, 0, 1, 1)) forwards',
        }
      : {}),
    ...style,
  };

  return (
    <div
      data-part="root"
      data-tone={type}
      className={`rottay-message--rustic ${className}`.trim()}
      style={messageStyle}
      role="alert"
      aria-live="polite"
    >
      {renderIcon()}
      <span data-part="body" style={styles.content}>{content}</span>
      {/* aria-label is essential since the button only contains "x" text. */}
      {closable && (
        <button
          data-part="close-button"
          onClick={handleClose}
          style={styles.closeButton}
          aria-label="Close message"
        >
          {closeIcon || '×'}
        </button>
      )}
    </div>
  );
};

MessageItem.displayName = 'MessageItem.Rustic';

// ============================================================================
// Static Message API (Not Supported)
// ============================================================================

/**
 * Static message methods - Rustic Engine
 *
 * @description
 * Static methods are NOT supported in the Rustic engine.
 * These methods will log a warning and do nothing.
 *
 * @remarks
 * Rustic engine requires the MessageProvider and useMessage hook pattern.
 * Static methods are only available in the Classic engine.
 *
 * @example
 * ```tsx
 * // This will NOT work - use Provider instead
 * message.success('Hello'); // Logs warning
 *
 * // Correct usage for Rustic:
 * const [messageApi] = useMessage();
 * messageApi.success('Hello');
 * ```
 */
export const message: MessageInstance = {
  success: () => {
    warnOnceInDev(
      'message-rustic:provider-required',
      'Rustic message: Please use MessageProvider and useMessage hook'
    );
    const result = () => {};
    result.then = () => {};
    return result;
  },
  error: () => {
    warnOnceInDev(
      'message-rustic:provider-required',
      'Rustic message: Please use MessageProvider and useMessage hook'
    );
    const result = () => {};
    result.then = () => {};
    return result;
  },
  info: () => {
    warnOnceInDev(
      'message-rustic:provider-required',
      'Rustic message: Please use MessageProvider and useMessage hook'
    );
    const result = () => {};
    result.then = () => {};
    return result;
  },
  warning: () => {
    warnOnceInDev(
      'message-rustic:provider-required',
      'Rustic message: Please use MessageProvider and useMessage hook'
    );
    const result = () => {};
    result.then = () => {};
    return result;
  },
  loading: () => {
    warnOnceInDev(
      'message-rustic:provider-required',
      'Rustic message: Please use MessageProvider and useMessage hook'
    );
    const result = () => {};
    result.then = () => {};
    return result;
  },
  open: () => {
    warnOnceInDev(
      'message-rustic:provider-required',
      'Rustic message: Please use MessageProvider and useMessage hook'
    );
    const result = () => {};
    result.then = () => {};
    return result;
  },
  destroy: () => {
    warnOnceInDev(
      'message-rustic:provider-required',
      'Rustic message: Please use MessageProvider and useMessage hook'
    );
  },
};

// ============================================================================
// Default Export
// ============================================================================

/**
 * Default export containing all Rustic engine message exports.
 */
export default {
  MessageProvider,
  MessageItem,
  useMessage,
  message,
};
