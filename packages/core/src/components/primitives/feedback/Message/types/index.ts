/**
 * @fileoverview Message Type Definitions - Rottay Design System
 * @description TypeScript type definitions for the Message component.
 * Provides comprehensive typing for the imperative message/toast API.
 *
 * @remarks
 * These types support the multi-engine architecture of the Message component,
 * ensuring consistent interfaces across Classic, Modern, and Rustic engines.
 *
 * @module Message/Types
 * @category Feedback
 * @package @rottay/design-system
 */

import type { ReactNode, CSSProperties } from 'react';

// ============================================================================
// Basic Types
// ============================================================================

/**
 * Available message types that determine the visual style and icon.
 *
 * @remarks
 * - `success` - Green styling with checkmark icon
 * - `error` - Red styling with X icon
 * - `info` - Blue styling with info icon
 * - `warning` - Yellow/orange styling with warning icon
 * - `loading` - Blue styling with spinner animation
 */
export type MessageType = 'success' | 'error' | 'info' | 'warning' | 'loading';

/**
 * Message placement options for positioning the message container.
 *
 * @remarks
 * Messages are always horizontally centered. This option controls
 * whether they appear at the top or bottom of the viewport.
 */
export type MessagePlacement = 'top' | 'bottom';

// ============================================================================
// Configuration Interfaces
// ============================================================================

/**
 * Configuration options for displaying a message.
 *
 * @remarks
 * This interface is used when calling message methods with an object
 * instead of simple parameters, allowing for full customization.
 *
 * @example
 * ```tsx
 * messageApi.success({
 *   content: 'File uploaded successfully',
 *   duration: 5,
 *   key: 'upload-progress',
 *   closable: true,
 *   onClose: () => console.log('Message dismissed'),
 * });
 * ```
 */
export interface MessageConfig {
  /** Message content - can be text or React elements */
  content: ReactNode;
  /** Message type that determines styling and default icon */
  type?: MessageType;
  /** Duration in seconds before auto-close (0 = no auto close) */
  duration?: number;
  /** Unique key to update existing message instead of creating new */
  key?: string | number;
  /** Callback function invoked when message closes */
  onClose?: () => void;
  /** Custom icon to replace the default type icon */
  icon?: ReactNode;
  /** Additional CSS class name for custom styling */
  className?: string;
  /** Inline styles to apply to the message */
  style?: CSSProperties;
  /** Whether to show a close button */
  closable?: boolean;
  /** Custom close button element */
  closeIcon?: ReactNode;
}

/**
 * Extended message configuration with internal properties.
 *
 * @remarks
 * Used internally by the message system to track individual messages.
 * Extends MessageConfig with a unique identifier.
 *
 * @internal
 */
export interface MessageArgsProps extends MessageConfig {
  /** Internal: unique ID for message tracking */
  id?: string;
}

// ============================================================================
// API Interfaces
// ============================================================================

/**
 * The message API instance returned by useMessage hook.
 *
 * @remarks
 * This interface defines all available methods for showing, updating,
 * and destroying messages programmatically.
 *
 * @example
 * ```tsx
 * const [messageApi, contextHolder] = useMessage();
 *
 * // Show different message types
 * messageApi.success('Operation completed');
 * messageApi.error('Something went wrong');
 * messageApi.info('Here is some information');
 * messageApi.warning('Please be careful');
 * messageApi.loading('Processing...');
 *
 * // Show with full config
 * messageApi.open({
 *   type: 'success',
 *   content: 'Custom message',
 *   duration: 5,
 * });
 *
 * // Destroy specific or all messages
 * messageApi.destroy('my-key');
 * messageApi.destroy(); // Destroys all
 * ```
 */
export interface MessageInstance {
  /** Show success message with green styling and checkmark icon */
  success: (content: ReactNode | MessageConfig, duration?: number, onClose?: () => void) => MessagePromise;
  /** Show error message with red styling and X icon */
  error: (content: ReactNode | MessageConfig, duration?: number, onClose?: () => void) => MessagePromise;
  /** Show info message with blue styling and info icon */
  info: (content: ReactNode | MessageConfig, duration?: number, onClose?: () => void) => MessagePromise;
  /** Show warning message with yellow styling and warning icon */
  warning: (content: ReactNode | MessageConfig, duration?: number, onClose?: () => void) => MessagePromise;
  /** Show loading message with blue styling and spinner animation */
  loading: (content: ReactNode | MessageConfig, duration?: number, onClose?: () => void) => MessagePromise;
  /** Open message with full configuration object */
  open: (config: MessageConfig) => MessagePromise;
  /** Destroy message by key, or destroy all messages if no key provided */
  destroy: (key?: string | number) => void;
}

/**
 * Promise-like return value from message methods.
 *
 * @remarks
 * Allows for programmatic control and chaining:
 * - Call the function to destroy the message immediately
 * - Use `.then()` to execute code after the message closes
 *
 * @example
 * ```tsx
 * // Destroy immediately
 * const hide = messageApi.loading('Saving...');
 * await saveData();
 * hide(); // Remove loading message
 *
 * // Chain after close
 * messageApi.success('Saved!').then(() => {
 *   console.log('Message has closed');
 * });
 * ```
 */
export interface MessagePromise {
  /** Call to destroy the message immediately */
  (): void;
  /** Execute callback after message closes (based on duration) */
  then: (fn: () => void) => void;
}

// ============================================================================
// Provider Interfaces
// ============================================================================

/**
 * Global configuration options for the message system.
 *
 * @remarks
 * These options affect all messages within the provider scope.
 * Can be passed to MessageProvider or used with static configuration.
 */
export interface MessageGlobalConfig {
  /** Default duration in seconds for all messages */
  duration?: number;
  /** Maximum number of messages to display simultaneously */
  maxCount?: number;
  /** Position of the message container (top or bottom) */
  placement?: MessagePlacement;
  /** Top offset in pixels when placement is 'top' */
  top?: number;
  /** Custom prefix class for styling */
  prefixCls?: string;
  /** Enable right-to-left mode for RTL languages */
  rtl?: boolean;
}

/**
 * Props for the MessageProvider component.
 *
 * @remarks
 * The MessageProvider wraps your application and provides the message
 * context. Required for the useMessage hook to function properly.
 *
 * @example
 * ```tsx
 * <MessageProvider maxCount={3} placement="top" top={50}>
 *   <App />
 * </MessageProvider>
 * ```
 */
export interface MessageProviderProps {
  /** Child components that will have access to message API */
  children: ReactNode;
  /** Global configuration object */
  config?: MessageGlobalConfig;
  /** Maximum number of messages to show (default: 5) */
  maxCount?: number;
  /** Position of messages (default: 'top') */
  placement?: MessagePlacement;
  /** Top offset in pixels (default: 24) */
  top?: number;
}

// ============================================================================
// Item Interfaces
// ============================================================================

/**
 * Props for the individual MessageItem component.
 *
 * @remarks
 * Used internally by the message system to render individual messages.
 * Can also be used for custom message rendering implementations.
 *
 * @internal
 */
export interface MessageItemProps {
  /** Unique message identifier */
  id: string;
  /** Message type determining visual style */
  type: MessageType;
  /** Message content to display */
  content: ReactNode;
  /** Duration in seconds before auto-close */
  duration?: number;
  /** Callback when message closes */
  onClose?: () => void;
  /** Custom icon element */
  icon?: ReactNode;
  /** Additional CSS class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Whether to show close button */
  closable?: boolean;
  /** Custom close button element */
  closeIcon?: ReactNode;
  /** Internal: handler to remove message from state */
  onRemove?: (id: string) => void;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Default values for message configuration.
 *
 * @remarks
 * These defaults are used when specific values are not provided:
 * - `duration`: 3 seconds
 * - `maxCount`: 5 messages maximum
 * - `placement`: 'top' of the viewport
 * - `top`: 24 pixels from top
 * - `closable`: false (no close button by default)
 */
export const MESSAGE_DEFAULTS = {
  /** Default auto-close duration in seconds */
  duration: 3,
  /** Default maximum number of visible messages */
  maxCount: 5,
  /** Default position of message container */
  placement: 'top' as MessagePlacement,
  /** Default top offset in pixels */
  top: 24,
  /** Default closable state */
  closable: false,
};

/**
 * Default icon characters for each message type.
 *
 * @remarks
 * These are used as fallback icons when custom icons are not provided.
 * Engine-specific implementations may override these with SVG icons.
 */
export const MESSAGE_ICONS: Record<MessageType, string> = {
  /** Checkmark for success messages */
  success: '✓',
  /** X mark for error messages */
  error: '✕',
  /** Info symbol for info messages */
  info: 'ℹ',
  /** Warning triangle for warning messages */
  warning: '⚠',
  /** Hourglass for loading messages */
  loading: '⏳',
};
