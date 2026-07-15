/**
 * @fileoverview Message Classic Engine - Rottay Design System
 * @description Ant Design implementation of the Message component.
 * Provides full-featured message functionality with rich animations and static methods.
 *
 * @remarks
 * The Classic engine leverages Ant Design's message API for a production-ready
 * implementation with the following features:
 *
 * - **Static Methods**: Unlike other engines, Classic supports global static
 *   methods (message.success(), etc.) that work without provider context
 * - **Rich Animations**: Smooth enter/exit animations powered by Ant Design
 * - **Full Feature Set**: Complete implementation of all message options
 * - **App Integration**: Uses Ant Design's App wrapper for proper context
 *
 * @example Using Static Methods (Classic Only)
 * ```tsx
 * import { message } from '@rottay/design-system';
 *
 * // Works globally without context
 * message.success('Saved!');
 * message.error('Failed to save');
 * message.loading('Processing...');
 * ```
 *
 * @example Using Provider and Hook
 * ```tsx
 * import { MessageProvider, useMessage } from '@rottay/design-system';
 *
 * function App() {
 *   return (
 *     <MessageProvider maxCount={5} top={24}>
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
 *       <button onClick={() => messageApi.success('Done!')}>
 *         Show Message
 *       </button>
 *     </>
 *   );
 * }
 * ```
 *
 * @see {@link MessageProvider} for provider component
 * @see {@link useMessage} for React hook
 * @see {@link message} for static API
 *
 * @module Message/Classic
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { message as antMessage, App } from 'antd';
import type {
  MessageConfig,
  MessageInstance,
  MessageProviderProps,
  MessageItemProps,
  MessageType,
} from '../Message.types';
import { MESSAGE_DEFAULTS } from '../Message.types';

// ============================================================================
// Message Provider Component
// ============================================================================

/**
 * MessageProvider - Classic Engine
 *
 * @description
 * Wraps children with Ant Design's App component for message context.
 * Configures global message settings and provides the context for useMessage hook.
 *
 * @remarks
 * The Classic provider uses Ant Design's App wrapper which is required for
 * proper message rendering in certain React environments (like Next.js).
 *
 * @param props - {@link MessageProviderProps}
 * @returns Provider component wrapping children with message context
 *
 * @example
 * ```tsx
 * <MessageProvider maxCount={3} top={50}>
 *   <App />
 * </MessageProvider>
 * ```
 */
export const MessageProvider: React.FC<MessageProviderProps> = ({
  children,
  maxCount = MESSAGE_DEFAULTS.maxCount,
  placement: _placement = MESSAGE_DEFAULTS.placement,
  top = MESSAGE_DEFAULTS.top,
}) => {
  // Bridge Rottay provider props to Ant Design's global config API.
  // Ant Design manages message positioning via a singleton config rather than
  // per-instance props, so we sync on mount and whenever settings change.
  useEffect(() => {
    antMessage.config({
      top,
      maxCount,
    });
  }, [top, maxCount]);

  // Ant Design's App wrapper is required in Next.js (SSR) environments to
  // provide the correct context for message rendering. Without it, messages
  // rendered via the hook may not appear or lose their animation context.
  return (
    <App>
      {children}
    </App>
  );
};

MessageProvider.displayName = 'MessageProvider.Classic';

// ============================================================================
// useMessage Hook
// ============================================================================

/**
 * useMessage hook - Classic Engine
 *
 * @description
 * Returns the message API instance and context holder from Ant Design.
 * The context holder must be rendered in the component tree for messages to appear.
 *
 * @remarks
 * The hook normalizes the Ant Design message API to match the Rottay interface,
 * providing consistent behavior across all engines.
 *
 * @returns Tuple of [MessageInstance, ReactElement | null]
 *   - MessageInstance: API object with success, error, info, warning, loading, open, destroy methods
 *   - ReactElement: Context holder to render in component (required for Classic)
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const [messageApi, contextHolder] = useMessage();
 *
 *   const showSuccess = () => {
 *     messageApi.success('Operation completed!');
 *   };
 *
 *   return (
 *     <>
 *       {contextHolder}
 *       <button onClick={showSuccess}>Show Success</button>
 *     </>
 *   );
 * }
 * ```
 */
export function useMessage(): [MessageInstance, React.ReactElement | null] {
  const [api, contextHolder] = antMessage.useMessage();

  /**
   * Normalizes content parameter to MessageConfig object.
   * Handles both simple content and full config objects.
   */
  const normalizeConfig = useCallback((
    content: React.ReactNode | MessageConfig,
    duration?: number,
    onClose?: () => void
  ): MessageConfig => {
    // Supports two call signatures: simple content string or full config object.
    // Duck-typing via 'content' property check avoids needing separate overloads
    // and keeps the API compatible with Ant Design's dual-signature pattern.
    if (typeof content === 'object' && content !== null && 'content' in content) {
      return content as MessageConfig;
    }
    return {
      content: content as React.ReactNode,
      duration,
      onClose,
    };
  }, []);

  /**
   * Creates a type-specific message method.
   * Returns a function that shows a message of the specified type.
   */
  const createMessageMethod = useCallback((type: MessageType) => {
    return (
      content: React.ReactNode | MessageConfig,
      duration?: number,
      onClose?: () => void
    ) => {
      const config = normalizeConfig(content, duration, onClose);
      const messageConfig = {
        content: config.content,
        duration: config.duration ?? MESSAGE_DEFAULTS.duration,
        key: config.key,
        icon: config.icon,
        className: config.className,
        style: config.style,
        onClose: config.onClose,
      };
      const destroy = (() => {
        switch (type) {
          case 'success':
            return api.success(messageConfig);
          case 'error':
            return api.error(messageConfig);
          case 'info':
            return api.info(messageConfig);
          case 'warning':
            return api.warning(messageConfig);
          case 'loading':
            return api.loading(messageConfig);
          default: {
            const unsupportedType: never = type;
            throw new Error(`Unsupported message type: ${String(unsupportedType)}`);
          }
        }
      })();

      // Return a callable + thenable object so consumers can either call
      // result() to destroy immediately or result.then() to chain after auto-close.
      // This mimics Ant Design's MessageType return while keeping the Rottay API
      // engine-agnostic (Modern/Rustic return the same shape).
      const result = () => destroy?.();
      result.then = (fn: () => void) => {
        setTimeout(fn, (config.duration ?? MESSAGE_DEFAULTS.duration) * 1000);
      };
      return result;
    };
  }, [api, normalizeConfig]);

  /** Complete message API instance */
  const messageInstance: MessageInstance = {
    success: createMessageMethod('success'),
    error: createMessageMethod('error'),
    info: createMessageMethod('info'),
    warning: createMessageMethod('warning'),
    loading: createMessageMethod('loading'),
    open: (config: MessageConfig) => {
      const type = config.type || 'info';
      return createMessageMethod(type)(config);
    },
    // Key-based destroy uses the hook API for targeted removal;
    // keyless destroy falls back to the global antMessage singleton
    // because the hook API's destroy() requires a key argument.
    destroy: (key?: string | number) => {
      if (key !== undefined) {
        api.destroy(key);
      } else {
        antMessage.destroy();
      }
    },
  };

  return [messageInstance, contextHolder as React.ReactElement | null];
}

// ============================================================================
// Message Item Component
// ============================================================================

/**
 * MessageItem - Classic Engine
 *
 * @description
 * Individual message component for custom rendering scenarios.
 * Provides Ant Design-styled message items with auto-close functionality.
 *
 * @remarks
 * While the Classic engine typically uses Ant Design's internal message rendering,
 * this component is provided for custom implementations and consistency with
 * other engines.
 *
 * @param props - {@link MessageItemProps}
 * @returns Styled message element with Ant Design styling
 *
 * @example
 * ```tsx
 * <MessageItem
 *   id="msg-1"
 *   type="success"
 *   content="Changes saved"
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
  className,
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

  /** Handle manual close */
  const handleClose = () => {
    onRemove?.(id);
    onClose?.();
  };

  // CSS variables enable multi-tenant theming: each tenant can override
  // --ds-color-success-bg etc. without changing component code.
  // Loading reuses info colors intentionally since both represent neutral states.
  const typeStyles: Record<MessageType, React.CSSProperties> = {
    success: {
      backgroundColor: 'var(--ds-color-success-bg)',
      borderColor: 'var(--ds-color-success-border)',
    },
    error: {
      backgroundColor: 'var(--ds-color-error-bg)',
      borderColor: 'var(--ds-color-error-border)',
    },
    info: {
      backgroundColor: 'var(--ds-color-info-bg)',
      borderColor: 'var(--ds-color-info-border)',
    },
    warning: {
      backgroundColor: 'var(--ds-color-warning-bg)',
      borderColor: 'var(--ds-color-warning-border)',
    },
    loading: {
      backgroundColor: 'var(--ds-color-info-bg)',
      borderColor: 'var(--ds-color-info-border)',
    },
  };

  /** Type-specific icon colors */
  const iconColors: Record<MessageType, string> = {
    success: 'var(--ds-color-success)',
    error: 'var(--ds-color-error)',
    info: 'var(--ds-color-info)',
    warning: 'var(--ds-color-warning)',
    loading: 'var(--ds-color-info)',
  };

  return (
    <div
      className={`ant-message-notice ${className || ''}`}
      style={{
        ...typeStyles[type],
        padding: '10px 16px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: 'var(--ds-message-shadow, var(--ds-shadow-md))',
        ...style,
      }}
    >
      {/* Fallback text icons chosen for cross-platform unicode support
          (no emoji rendering inconsistencies across OS/browser). */}
      <span style={{ color: iconColors[type] }}>
        {icon || (type === 'loading' ? '⏳' : type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '⚠' : 'ℹ')}
      </span>
      <span style={{ flex: 1 }}>{content}</span>
      {/* Close button uses tertiary text color by default to stay unobtrusive,
          relying on the DS token so tenant themes can adjust contrast. */}
      {closable && (
        <button
          onClick={handleClose}
          style={{
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            padding: '0',
            marginLeft: '8px',
            color: 'var(--ds-message-close-color, var(--ds-color-text-tertiary))',
          }}
        >
          {closeIcon || '×'}
        </button>
      )}
    </div>
  );
};

MessageItem.displayName = 'MessageItem.Classic';

// ============================================================================
// Static Message API
// ============================================================================

/**
 * Static message methods for global usage.
 *
 * @description
 * These methods work without requiring a React context or provider.
 * They are only available in the Classic engine due to Ant Design's
 * global message singleton.
 *
 * @remarks
 * For server-side rendering or when using other engines (Modern, Rustic),
 * use the MessageProvider and useMessage hook instead.
 *
 * @example
 * ```tsx
 * import { message } from '@rottay/design-system';
 *
 * // Show different message types
 * message.success('Success!');
 * message.error('Error occurred');
 * message.info('FYI...');
 * message.warning('Be careful!');
 * message.loading('Please wait...');
 *
 * // With duration and callback
 * message.success('Saved!', 5, () => console.log('Closed'));
 *
 * // With full config
 * message.open({
 *   type: 'success',
 *   content: 'Custom message',
 *   duration: 0, // Won't auto-close
 *   key: 'my-message',
 * });
 *
 * // Destroy by key or all
 * message.destroy('my-message');
 * message.destroy();
 * ```
 */
export const message: MessageInstance = {
  success: (content, duration, onClose) => {
    const config = typeof content === 'object' && content !== null && 'content' in content
      ? content as MessageConfig
      : { content, duration, onClose };

    const destroy = antMessage.success({
      content: config.content,
      duration: config.duration ?? MESSAGE_DEFAULTS.duration,
      key: config.key,
      icon: config.icon,
      className: config.className,
      style: config.style,
      onClose: config.onClose,
    });

    const result = () => destroy?.();
    result.then = (fn: () => void) => {
      setTimeout(fn, (config.duration ?? MESSAGE_DEFAULTS.duration) * 1000);
    };
    return result;
  },
  error: (content, duration, onClose) => {
    const config = typeof content === 'object' && content !== null && 'content' in content
      ? content as MessageConfig
      : { content, duration, onClose };

    const destroy = antMessage.error({
      content: config.content,
      duration: config.duration ?? MESSAGE_DEFAULTS.duration,
      key: config.key,
      icon: config.icon,
      className: config.className,
      style: config.style,
      onClose: config.onClose,
    });

    const result = () => destroy?.();
    result.then = (fn: () => void) => {
      setTimeout(fn, (config.duration ?? MESSAGE_DEFAULTS.duration) * 1000);
    };
    return result;
  },
  info: (content, duration, onClose) => {
    const config = typeof content === 'object' && content !== null && 'content' in content
      ? content as MessageConfig
      : { content, duration, onClose };

    const destroy = antMessage.info({
      content: config.content,
      duration: config.duration ?? MESSAGE_DEFAULTS.duration,
      key: config.key,
      icon: config.icon,
      className: config.className,
      style: config.style,
      onClose: config.onClose,
    });

    const result = () => destroy?.();
    result.then = (fn: () => void) => {
      setTimeout(fn, (config.duration ?? MESSAGE_DEFAULTS.duration) * 1000);
    };
    return result;
  },
  warning: (content, duration, onClose) => {
    const config = typeof content === 'object' && content !== null && 'content' in content
      ? content as MessageConfig
      : { content, duration, onClose };

    const destroy = antMessage.warning({
      content: config.content,
      duration: config.duration ?? MESSAGE_DEFAULTS.duration,
      key: config.key,
      icon: config.icon,
      className: config.className,
      style: config.style,
      onClose: config.onClose,
    });

    const result = () => destroy?.();
    result.then = (fn: () => void) => {
      setTimeout(fn, (config.duration ?? MESSAGE_DEFAULTS.duration) * 1000);
    };
    return result;
  },
  loading: (content, duration, onClose) => {
    const config = typeof content === 'object' && content !== null && 'content' in content
      ? content as MessageConfig
      : { content, duration, onClose };

    const destroy = antMessage.loading({
      content: config.content,
      duration: config.duration ?? MESSAGE_DEFAULTS.duration,
      key: config.key,
      icon: config.icon,
      className: config.className,
      style: config.style,
      onClose: config.onClose,
    });

    const result = () => destroy?.();
    result.then = (fn: () => void) => {
      setTimeout(fn, (config.duration ?? MESSAGE_DEFAULTS.duration) * 1000);
    };
    return result;
  },
  open: (config) => {
    const type = config.type || 'info';
    return message[type](config);
  },
  destroy: (key?: string | number) => {
    if (key !== undefined) {
      antMessage.destroy(key);
    } else {
      antMessage.destroy();
    }
  },
};

// ============================================================================
// Default Export
// ============================================================================

/**
 * Default export containing all Classic engine message exports.
 */
export default {
  MessageProvider,
  MessageItem,
  useMessage,
  message,
};
