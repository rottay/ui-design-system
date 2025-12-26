'use client';

/**
 * Message - Apollo Engine (Vanilla HTML/CSS)
 * Pure HTML/CSS implementation with no external dependencies
 */
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

// Types for internal state
interface InternalMessage extends MessageItemProps {
  key?: string | number;
}

// Context for message API
const MessageContext = createContext<MessageInstance | null>(null);

// Unique ID generator
let messageId = 0;
const generateId = () => `apollo-message-${++messageId}`;

// Styles
const styles = {
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
  content: {
    flex: 1,
    fontSize: '14px',
    lineHeight: '22px',
    color: 'rgba(0, 0, 0, 0.88)',
  } as React.CSSProperties,
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

// Keyframes injection
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

/**
 * MessageProvider - Apollo Engine
 */
export const MessageProvider: React.FC<MessageProviderProps> = ({
  children,
  maxCount = MESSAGE_DEFAULTS.maxCount,
  placement = MESSAGE_DEFAULTS.placement,
  top = MESSAGE_DEFAULTS.top,
}) => {
  const [messages, setMessages] = useState<InternalMessage[]>([]);

  useEffect(() => {
    injectStyles();
  }, []);

  const removeMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

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

/**
 * useMessage hook - Apollo Engine
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

/**
 * MessageItem - Apollo Engine
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

/**
 * Static message methods
 * Note: For Apollo engine, static methods are not available without provider
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

export default {
  MessageProvider,
  MessageItem,
  useMessage,
  message,
};
