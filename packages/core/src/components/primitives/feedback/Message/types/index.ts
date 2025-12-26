/**
 * Message Types
 * Imperative API for global messages/toasts
 */
import type { ReactNode, CSSProperties } from 'react';

export type MessageType = 'success' | 'error' | 'info' | 'warning' | 'loading';

export type MessagePlacement = 'top' | 'bottom';

export interface MessageConfig {
  /** Message content */
  content: ReactNode;
  /** Message type */
  type?: MessageType;
  /** Duration in seconds (0 = no auto close) */
  duration?: number;
  /** Unique key to update existing message */
  key?: string | number;
  /** Callback when message closes */
  onClose?: () => void;
  /** Custom icon */
  icon?: ReactNode;
  /** Custom className */
  className?: string;
  /** Custom style */
  style?: CSSProperties;
  /** Whether to show close button */
  closable?: boolean;
  /** Custom close button */
  closeIcon?: ReactNode;
}

export interface MessageArgsProps extends MessageConfig {
  /** Internal: unique ID */
  id?: string;
}

export interface MessageInstance {
  /** Show success message */
  success: (content: ReactNode | MessageConfig, duration?: number, onClose?: () => void) => MessagePromise;
  /** Show error message */
  error: (content: ReactNode | MessageConfig, duration?: number, onClose?: () => void) => MessagePromise;
  /** Show info message */
  info: (content: ReactNode | MessageConfig, duration?: number, onClose?: () => void) => MessagePromise;
  /** Show warning message */
  warning: (content: ReactNode | MessageConfig, duration?: number, onClose?: () => void) => MessagePromise;
  /** Show loading message */
  loading: (content: ReactNode | MessageConfig, duration?: number, onClose?: () => void) => MessagePromise;
  /** Open message with config */
  open: (config: MessageConfig) => MessagePromise;
  /** Destroy message by key or all */
  destroy: (key?: string | number) => void;
}

export interface MessagePromise {
  (): void;
  then: (fn: () => void) => void;
}

export interface MessageGlobalConfig {
  /** Default duration in seconds */
  duration?: number;
  /** Max messages to show */
  maxCount?: number;
  /** Placement */
  placement?: MessagePlacement;
  /** Top offset */
  top?: number;
  /** Custom prefix class */
  prefixCls?: string;
  /** RTL mode */
  rtl?: boolean;
}

export interface MessageProviderProps {
  /** Children */
  children: ReactNode;
  /** Global config */
  config?: MessageGlobalConfig;
  /** Max messages */
  maxCount?: number;
  /** Placement */
  placement?: MessagePlacement;
  /** Top offset */
  top?: number;
}

export interface MessageItemProps {
  /** Message ID */
  id: string;
  /** Message type */
  type: MessageType;
  /** Message content */
  content: ReactNode;
  /** Duration in seconds */
  duration?: number;
  /** On close callback */
  onClose?: () => void;
  /** Custom icon */
  icon?: ReactNode;
  /** Custom className */
  className?: string;
  /** Custom style */
  style?: CSSProperties;
  /** Whether closable */
  closable?: boolean;
  /** Close icon */
  closeIcon?: ReactNode;
  /** Internal: remove handler */
  onRemove?: (id: string) => void;
}

export const MESSAGE_DEFAULTS = {
  duration: 3,
  maxCount: 5,
  placement: 'top' as MessagePlacement,
  top: 24,
  closable: false,
};

export const MESSAGE_ICONS: Record<MessageType, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
  loading: '⏳',
};
