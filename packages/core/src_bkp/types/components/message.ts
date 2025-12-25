/**
 * Message Component Types
 *
 * Unified type definitions for Message component across all engines.
 * Message provides toast-style notifications with imperative API.
 * Compatible with: titan (AntD), hermes (DaisyUI toast), apollo (Custom toast)
 */

import type { CSSProperties, ReactNode } from 'react';

/**
 * Message type variants
 */
export type MessageType = 'success' | 'error' | 'info' | 'warning' | 'loading';

/**
 * Message placement options
 */
export type MessagePlacement = 'top' | 'topLeft' | 'topRight' | 'bottom' | 'bottomLeft' | 'bottomRight';

/**
 * Message configuration options
 */
export interface MessageConfigOptions {
  /** Duration in seconds (0 = never auto-close) */
  duration?: number;

  /** Maximum number of messages to show at once */
  maxCount?: number;

  /** Top offset in pixels */
  top?: number;

  /** Whether to render in RTL mode */
  rtl?: boolean;

  /** Prefix class name for custom styling */
  prefixCls?: string;

  /** Container element or selector */
  getContainer?: () => HTMLElement;
}

/**
 * Base message content options
 */
export interface MessageContentOptions {
  /** Message content */
  content: ReactNode;

  /** Duration in seconds (default: 3, 0 = never close) */
  duration?: number;

  /** Custom icon */
  icon?: ReactNode;

  /** Unique key for the message */
  key?: string | number;

  /** Custom class name */
  className?: string;

  /** Custom inline styles */
  style?: CSSProperties;

  /** Callback when message is closed */
  onClose?: () => void;

  /** Message type (for generic open method) */
  type?: MessageType;
}

/**
 * Message instance API returned by open/success/error/etc
 */
export type MessageInstance = () => void;

/**
 * Message API interface
 * Imperative API for showing messages
 */
export interface MessageAPI {
  /** Show a success message */
  success(content: ReactNode | MessageContentOptions, duration?: number, onClose?: () => void): MessageInstance;

  /** Show an error message */
  error(content: ReactNode | MessageContentOptions, duration?: number, onClose?: () => void): MessageInstance;

  /** Show an info message */
  info(content: ReactNode | MessageContentOptions, duration?: number, onClose?: () => void): MessageInstance;

  /** Show a warning message */
  warning(content: ReactNode | MessageContentOptions, duration?: number, onClose?: () => void): MessageInstance;

  /** Show a loading message */
  loading(content: ReactNode | MessageContentOptions, duration?: number, onClose?: () => void): MessageInstance;

  /** Generic open method with type */
  open(config: MessageContentOptions): MessageInstance;

  /** Update global config */
  config(options: MessageConfigOptions): void;

  /** Destroy all messages */
  destroy(key?: string | number): void;
}

/**
 * Utility: Normalize message content to config object
 */
export function normalizeMessageConfig(
  content: ReactNode | MessageContentOptions,
  duration?: number,
  onClose?: () => void
): MessageContentOptions {
  if (typeof content === 'object' && content !== null && 'content' in content) {
    return content as MessageContentOptions;
  }

  return {
    content,
    duration,
    onClose,
  };
}

/**
 * Utility: Get message type icon
 */
export function getMessageTypeIcon(type: MessageType): string {
  switch (type) {
    case 'success':
      return '✓';
    case 'error':
      return '✕';
    case 'warning':
      return '⚠';
    case 'info':
      return 'ℹ';
    case 'loading':
      return '⟳';
    default:
      return 'ℹ';
  }
}

/**
 * Utility: Get message type color classes
 */
export function getMessageTypeColor(type: MessageType): {
  bg: string;
  text: string;
  border: string;
} {
  switch (type) {
    case 'success':
      return {
        bg: 'bg-green-50',
        text: 'text-green-800',
        border: 'border-green-200',
      };
    case 'error':
      return {
        bg: 'bg-red-50',
        text: 'text-red-800',
        border: 'border-red-200',
      };
    case 'warning':
      return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-800',
        border: 'border-yellow-200',
      };
    case 'info':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-800',
        border: 'border-blue-200',
      };
    case 'loading':
      return {
        bg: 'bg-gray-50',
        text: 'text-gray-800',
        border: 'border-gray-200',
      };
    default:
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-800',
        border: 'border-blue-200',
      };
  }
}
