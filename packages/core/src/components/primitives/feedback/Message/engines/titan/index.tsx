'use client';

/**
 * Message - Titan Engine (Ant Design)
 * Uses Ant Design's message API
 */
import React, { useCallback, useEffect, useRef } from 'react';
import { message as antMessage, App } from 'antd';
import type {
  MessageConfig,
  MessageInstance,
  MessageProviderProps,
  MessageItemProps,
  MessageType,
} from '../../types';
import { MESSAGE_DEFAULTS } from '../../types';

/**
 * MessageProvider - Titan Engine
 * Wraps children with Ant Design App for message context
 */
export const MessageProvider: React.FC<MessageProviderProps> = ({
  children,
  maxCount = MESSAGE_DEFAULTS.maxCount,
  placement: _placement = MESSAGE_DEFAULTS.placement,
  top = MESSAGE_DEFAULTS.top,
}) => {
  // Configure message globally
  useEffect(() => {
    antMessage.config({
      top,
      maxCount,
    });
  }, [top, maxCount]);

  return (
    <App>
      {children}
    </App>
  );
};

MessageProvider.displayName = 'MessageProvider.Titan';

/**
 * useMessage hook - Titan Engine
 * Returns message API from Ant Design
 */
export function useMessage(): [MessageInstance, React.ReactElement | null] {
  const [api, contextHolder] = antMessage.useMessage();

  const normalizeConfig = useCallback((
    content: React.ReactNode | MessageConfig,
    duration?: number,
    onClose?: () => void
  ): MessageConfig => {
    if (typeof content === 'object' && content !== null && 'content' in content) {
      return content as MessageConfig;
    }
    return {
      content: content as React.ReactNode,
      duration,
      onClose,
    };
  }, []);

  const createMessageMethod = useCallback((type: MessageType) => {
    return (
      content: React.ReactNode | MessageConfig,
      duration?: number,
      onClose?: () => void
    ) => {
      const config = normalizeConfig(content, duration, onClose);
      const destroy = api[type]({
        content: config.content,
        duration: config.duration ?? MESSAGE_DEFAULTS.duration,
        key: config.key,
        icon: config.icon,
        className: config.className,
        style: config.style,
        onClose: config.onClose,
      });

      // Return promise-like object
      const result = () => destroy?.();
      result.then = (fn: () => void) => {
        setTimeout(fn, (config.duration ?? MESSAGE_DEFAULTS.duration) * 1000);
      };
      return result;
    };
  }, [api, normalizeConfig]);

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

/**
 * MessageItem - Titan Engine
 * Individual message component (for custom rendering)
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
    onRemove?.(id);
    onClose?.();
  };

  // Use Ant Design's message styling through ConfigProvider
  const typeStyles: Record<MessageType, React.CSSProperties> = {
    success: { backgroundColor: '#f6ffed', borderColor: '#b7eb8f' },
    error: { backgroundColor: '#fff2f0', borderColor: '#ffccc7' },
    info: { backgroundColor: '#e6f4ff', borderColor: '#91caff' },
    warning: { backgroundColor: '#fffbe6', borderColor: '#ffe58f' },
    loading: { backgroundColor: '#e6f4ff', borderColor: '#91caff' },
  };

  const iconColors: Record<MessageType, string> = {
    success: '#52c41a',
    error: '#ff4d4f',
    info: '#1677ff',
    warning: '#faad14',
    loading: '#1677ff',
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
        boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08)',
        ...style,
      }}
    >
      <span style={{ color: iconColors[type] }}>
        {icon || (type === 'loading' ? '⏳' : type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '⚠' : 'ℹ')}
      </span>
      <span style={{ flex: 1 }}>{content}</span>
      {closable && (
        <button
          onClick={handleClose}
          style={{
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            padding: '0',
            marginLeft: '8px',
          }}
        >
          {closeIcon || '×'}
        </button>
      )}
    </div>
  );
};

MessageItem.displayName = 'MessageItem.Titan';

/**
 * Static message methods for global usage
 * These work without context but require App wrapper
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

export default {
  MessageProvider,
  MessageItem,
  useMessage,
  message,
};
