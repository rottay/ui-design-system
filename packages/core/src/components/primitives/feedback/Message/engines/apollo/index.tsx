/**
 * @fileoverview Message Apollo Engine - Rottay Design System
 * @description Pure HTML/CSS implementation of the Message component.
 * Provides accessible, zero-dependency message functionality.
 *
 * @remarks
 * The Apollo engine uses vanilla HTML and CSS for a completely dependency-free
 * implementation with maximum accessibility:
 *
 * - **Zero Dependencies**: No external CSS frameworks required
 * - **Full Accessibility**: ARIA attributes, role="alert", aria-live regions
 * - **CSS Animations**: Smooth enter/exit animations via injected keyframes
 * - **Provider Required**: Requires MessageProvider context for functionality
 * - **Maximum Control**: Direct style object manipulation for full customization
 *
 * Note: Static message methods are not supported in Apollo.
 * Use the MessageProvider and useMessage hook for full functionality.
 *
 * @example Provider and Hook Usage
 * ```tsx
 * import { MessageProvider, useMessage } from '@rottay/design-system';
 * // Or import from Apollo engine directly:
 * // import { MessageProvider, useMessage } from '@rottay/design-system/engines/apollo';
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
 * @module Message/Apollo
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
} from '../../types';
import { MESSAGE_DEFAULTS, MESSAGE_ICONS } from '../../types';

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
const generateId = () => `apollo-message-${++messageId}`;

// ============================================================================
// Styles
// ============================================================================

/**
 * Style definitions for Apollo message components.
 * All styles are defined as React.CSSProperties objects.
 * @internal
 */
const styles = {
  /**
   * Container positioning styles based on placement.
   */
  container: (placement: 'top' | 'bottom', top: number): React.CSSProperties => ({
    position: 'fixed',
    left: '50%',
    transform: 'translateX(-50%)',
    [placement]: placement === 'top' ? top : 24,
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    pointerEvents: 'none',
  }),

  /**
   * Message box styles for each type.
   */
  message: {
    base: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '10px 16px',
      borderRadius: '8px',
      boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
      backgroundColor: '#fff',
      pointerEvents: 'auto' as const,
      animation: 'messageSlideIn 0.3s ease-out',
      maxWidth: '400px',
      minWidth: '200px',
    } as React.CSSProperties,
    success: {
      backgroundColor: '#f6ffed',
      border: '1px solid #b7eb8f',
    },
    error: {
      backgroundColor: '#fff2f0',
      border: '1px solid #ffccc7',
    },
    info: {
      backgroundColor: '#e6f4ff',
      border: '1px solid #91caff',
    },
    warning: {
      backgroundColor: '#fffbe6',
      border: '1px solid #ffe58f',
    },
    loading: {
      backgroundColor: '#e6f4ff',
      border: '1px solid #91caff',
    },
  },

  /**
   * Icon styles for each message type.
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
    success: { color: '#52c41a' },
    error: { color: '#ff4d4f' },
    info: { color: '#1677ff' },
    warning: { color: '#faad14' },
    loading: { color: '#1677ff' },
  },

  /**
   * Content text styles.
   */
  content: {
    flex: 1,
    fontSize: '14px',
    lineHeight: '22px',
    color: 'rgba(0, 0, 0, 0.88)',
  } as React.CSSProperties,

  /**
   * Close button styles.
   */
  closeButton: {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    padding: '0',
    marginLeft: '8px',
    color: 'rgba(0, 0, 0, 0.45)',
    fontSize: '14px',
    lineHeight: 1,
    transition: 'color 0.2s',
  } as React.CSSProperties,

  /**
   * Loading spinner styles.
   */
  loadingSpinner: {
    display: 'inline-block',
    width: '14px',
    height: '14px',
    border: '2px solid #1677ff',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animation: 'messageSpin 0.8s linear infinite',
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
const injectStyles = () => {
  if (typeof document === 'undefined') return;

  const styleId = 'apollo-message-styles';
  if (document.getElementById(styleId)) return;

  const styleSheet = document.createElement('style');
  styleSheet.id = styleId;
  styleSheet.textContent = `
    @keyframes messageSlideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @keyframes messageSlideOut {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(-10px);
      }
    }
    @keyframes messageSpin {
      to {
        transform: rotate(360deg);
      }
    }
  `;
  document.head.appendChild(styleSheet);
};

// ============================================================================
// Message Provider Component
// ============================================================================

/**
 * MessageProvider - Apollo Engine
 *
 * @description
 * Provides message context and renders the message container using vanilla CSS.
 * Must wrap any components that use the useMessage hook.
 *
 * @remarks
 * The Apollo provider:
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

  // Inject CSS keyframes on mount
  useEffect(() => {
    injectStyles();
  }, []);

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
      <div style={styles.container(placement, top)} role="log" aria-live="polite">
        {messages.map((msg) => (
          <MessageItem
            key={msg.id}
            {...msg}
            onRemove={removeMessage}
          />
        ))}
      </div>
    </MessageContext.Provider>
  );
};

MessageProvider.displayName = 'MessageProvider.Apollo';

// ============================================================================
// useMessage Hook
// ============================================================================

/**
 * useMessage hook - Apollo Engine
 *
 * @description
 * Returns the message API from the MessageProvider context.
 * Must be used within a MessageProvider component.
 *
 * @remarks
 * Unlike Titan, Apollo does not require a context holder to be rendered.
 * The second element of the returned tuple is always null.
 *
 * If used outside a MessageProvider, returns no-op methods that do nothing.
 *
 * @returns Tuple of [MessageInstance, null]
 *   - MessageInstance: API object with message methods
 *   - null: No context holder needed for Apollo
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
 * MessageItem - Apollo Engine
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

  /**
   * Handle close with exit animation.
   */
  const handleClose = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsExiting(true);
    setTimeout(() => {
      onRemove?.(id);
      onClose?.();
    }, 300); // Animation duration
  };

  /**
   * Renders the appropriate icon based on type or custom icon.
   */
  const renderIcon = () => {
    if (icon) return icon;

    if (type === 'loading') {
      return <span style={styles.loadingSpinner} />;
    }

    return (
      <span style={{ ...styles.icon.base, ...styles.icon[type] }}>
        {MESSAGE_ICONS[type]}
      </span>
    );
  };

  /** Combined message styles with type-specific and animation styles */
  const messageStyle: React.CSSProperties = {
    ...styles.message.base,
    ...styles.message[type],
    ...(isExiting ? { animation: 'messageSlideOut 0.3s ease-out forwards' } : {}),
    ...style,
  };

  return (
    <div
      className={className}
      style={messageStyle}
      role="alert"
      aria-live="polite"
    >
      {renderIcon()}
      <span style={styles.content}>{content}</span>
      {closable && (
        <button
          onClick={handleClose}
          style={styles.closeButton}
          aria-label="Close message"
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'rgba(0, 0, 0, 0.88)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(0, 0, 0, 0.45)';
          }}
        >
          {closeIcon || '×'}
        </button>
      )}
    </div>
  );
};

MessageItem.displayName = 'MessageItem.Apollo';

// ============================================================================
// Static Message API (Not Supported)
// ============================================================================

/**
 * Static message methods - Apollo Engine
 *
 * @description
 * Static methods are NOT supported in the Apollo engine.
 * These methods will log a warning and do nothing.
 *
 * @remarks
 * Apollo engine requires the MessageProvider and useMessage hook pattern.
 * Static methods are only available in the Titan engine.
 *
 * @example
 * ```tsx
 * // This will NOT work - use Provider instead
 * message.success('Hello'); // Logs warning
 *
 * // Correct usage for Apollo:
 * const [messageApi] = useMessage();
 * messageApi.success('Hello');
 * ```
 */
export const message: MessageInstance = {
  success: () => {
    console.warn('Apollo message: Please use MessageProvider and useMessage hook');
    const result = () => {};
    result.then = () => {};
    return result;
  },
  error: () => {
    console.warn('Apollo message: Please use MessageProvider and useMessage hook');
    const result = () => {};
    result.then = () => {};
    return result;
  },
  info: () => {
    console.warn('Apollo message: Please use MessageProvider and useMessage hook');
    const result = () => {};
    result.then = () => {};
    return result;
  },
  warning: () => {
    console.warn('Apollo message: Please use MessageProvider and useMessage hook');
    const result = () => {};
    result.then = () => {};
    return result;
  },
  loading: () => {
    console.warn('Apollo message: Please use MessageProvider and useMessage hook');
    const result = () => {};
    result.then = () => {};
    return result;
  },
  open: () => {
    console.warn('Apollo message: Please use MessageProvider and useMessage hook');
    const result = () => {};
    result.then = () => {};
    return result;
  },
  destroy: () => {
    console.warn('Apollo message: Please use MessageProvider and useMessage hook');
  },
};

// ============================================================================
// Default Export
// ============================================================================

/**
 * Default export containing all Apollo engine message exports.
 */
export default {
  MessageProvider,
  MessageItem,
  useMessage,
  message,
};
