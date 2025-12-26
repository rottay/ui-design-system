'use client';

/**
 * Message - Hermes Engine (DaisyUI/Tailwind)
 * Uses DaisyUI toast/alert components
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
import { MESSAGE_DEFAULTS } from '../../types';

// Types for internal state
interface InternalMessage extends MessageItemProps {
  key?: string | number;
}

// Context for message API
const MessageContext = createContext<MessageInstance | null>(null);

// Unique ID generator
let messageId = 0;
const generateId = () => `hermes-message-${++messageId}`;

/**
 * MessageProvider - Hermes Engine
 */
export const MessageProvider: React.FC<MessageProviderProps> = ({
  children,
  maxCount = MESSAGE_DEFAULTS.maxCount,
  placement = MESSAGE_DEFAULTS.placement,
  top = MESSAGE_DEFAULTS.top,
}) => {
  const [messages, setMessages] = useState<InternalMessage[]>([]);

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

MessageProvider.displayName = 'MessageProvider.Hermes';

/**
 * useMessage hook - Hermes Engine
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

  return [context, null]; // No context holder needed for Hermes
}

/**
 * MessageItem - Hermes Engine
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

  const handleClose = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    onRemove?.(id);
    onClose?.();
  };

  const alertClasses: Record<MessageType, string> = {
    success: 'alert-success',
    error: 'alert-error',
    info: 'alert-info',
    warning: 'alert-warning',
    loading: 'alert-info',
  };

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

  return (
    <div
      className={`alert ${alertClasses[type]} shadow-lg ${className}`}
      style={style}
      role="alert"
    >
      <span>{icon || icons[type]}</span>
      <span>{content}</span>
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

MessageItem.displayName = 'MessageItem.Hermes';

/**
 * Global message store for static methods
 */
let _globalMessages: InternalMessage[] = [];
let _globalSetMessages: React.Dispatch<React.SetStateAction<InternalMessage[]>> | null = null;

// Keep references to avoid unused variable warnings
void _globalMessages;
void _globalSetMessages;

export const setGlobalMessageHandler = (
  setter: React.Dispatch<React.SetStateAction<InternalMessage[]>>
) => {
  _globalSetMessages = setter;
};

/**
 * Static message methods
 */
export const message: MessageInstance = {
  success: (_content, _duration, _onClose) => {
    console.warn('Hermes message: Please use MessageProvider and useMessage hook for full functionality');
    const result = () => {};
    result.then = () => {};
    return result;
  },
  error: (_content, _duration, _onClose) => {
    console.warn('Hermes message: Please use MessageProvider and useMessage hook for full functionality');
    const result = () => {};
    result.then = () => {};
    return result;
  },
  info: (_content, _duration, _onClose) => {
    console.warn('Hermes message: Please use MessageProvider and useMessage hook for full functionality');
    const result = () => {};
    result.then = () => {};
    return result;
  },
  warning: (_content, _duration, _onClose) => {
    console.warn('Hermes message: Please use MessageProvider and useMessage hook for full functionality');
    const result = () => {};
    result.then = () => {};
    return result;
  },
  loading: (_content, _duration, _onClose) => {
    console.warn('Hermes message: Please use MessageProvider and useMessage hook for full functionality');
    const result = () => {};
    result.then = () => {};
    return result;
  },
  open: (_config) => {
    console.warn('Hermes message: Please use MessageProvider and useMessage hook for full functionality');
    const result = () => {};
    result.then = () => {};
    return result;
  },
  destroy: () => {
    console.warn('Hermes message: Please use MessageProvider and useMessage hook for full functionality');
  },
};

export default {
  MessageProvider,
  MessageItem,
  useMessage,
  message,
};
