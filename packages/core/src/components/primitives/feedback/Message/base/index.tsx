/**
 * @fileoverview Message Base Component - Rottay Design System
 * @description Base implementation of the Message component using CSS variables.
 * Provides the foundation for engine-specific implementations.
 *
 * @remarks
 * This base component uses CSS variables from design tokens for consistent styling
 * across all engines. It serves as the foundational implementation that can be
 * extended or used directly by engine-specific versions.
 *
 * The component follows Rottay's design token system, using CSS custom properties
 * for colors, spacing, shadows, and typography to ensure consistent theming.
 *
 * @example Using the Base Component
 * ```tsx
 * import { BaseMessageItem } from './base';
 *
 * <BaseMessageItem
 *   id="msg-1"
 *   type="success"
 *   content="Operation completed successfully"
 *   duration={3}
 *   onClose={() => console.log('closed')}
 * />
 * ```
 *
 * @module Message/Base
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, useEffect, useState, useMemo } from 'react';
import type { MessageItemProps, MessageType } from '../types';
import { MESSAGE_DEFAULTS, MESSAGE_ICONS } from '../types';

// ============================================================================
// Type Color Configuration
// ============================================================================

/**
 * Color configurations for each message type.
 * Maps message types to their corresponding background, text, and icon colors.
 *
 * @internal
 */
const TYPE_COLORS: Record<MessageType, { bg: string; color: string; icon: string }> = {
  success: { bg: '#f6ffed', color: '#52c41a', icon: MESSAGE_ICONS.success },
  error: { bg: '#fff2f0', color: '#ff4d4f', icon: MESSAGE_ICONS.error },
  info: { bg: '#e6f4ff', color: '#1677ff', icon: MESSAGE_ICONS.info },
  warning: { bg: '#fffbe6', color: '#faad14', icon: MESSAGE_ICONS.warning },
  loading: { bg: '#e6f4ff', color: '#1677ff', icon: MESSAGE_ICONS.loading },
};

// ============================================================================
// Loading Spinner Component
// ============================================================================

/**
 * Animated loading spinner SVG component.
 * Used for loading type messages to indicate ongoing operations.
 *
 * @internal
 */
const LoadingSpinner: React.FC = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    style={{ animation: 'rottay-message-spin 1s linear infinite' }}
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeDasharray="31.416"
      strokeDashoffset="10"
    />
  </svg>
);

// ============================================================================
// Base Message Item Component
// ============================================================================

/**
 * Base MessageItem component using CSS variables.
 *
 * @description
 * This is the foundational message item component that uses CSS custom properties
 * for styling. It is extended by engine-specific implementations (Titan, Hermes, Apollo)
 * to provide consistent behavior while allowing framework-specific styling.
 *
 * @remarks
 * Features:
 * - Uses CSS variables for theming (--message-bg, --message-color, etc.)
 * - Auto-close timer based on duration prop
 * - Smooth enter/exit animations
 * - Accessible with role="alert" for screen readers
 * - Supports custom icons and close buttons
 *
 * @param props - {@link MessageItemProps}
 * @returns A styled message element with icon, content, and optional close button
 *
 * @example
 * ```tsx
 * <BaseMessageItem
 *   id="unique-id"
 *   type="success"
 *   content="Your changes have been saved"
 *   duration={3}
 *   closable={true}
 *   onRemove={(id) => removeFromState(id)}
 * />
 * ```
 */
export const BaseMessageItem = forwardRef<HTMLDivElement, MessageItemProps>(
  (props, ref) => {
    const {
      id,
      type,
      content,
      duration = MESSAGE_DEFAULTS.duration,
      onClose,
      icon,
      className = '',
      style = {},
      closable = MESSAGE_DEFAULTS.closable,
      closeIcon,
      onRemove,
    } = props;

    // ========================================================================
    // State Management
    // ========================================================================

    const [isVisible, setIsVisible] = useState(true);
    const [isExiting, setIsExiting] = useState(false);

    const typeConfig = TYPE_COLORS[type];

    // ========================================================================
    // Auto-Close Timer
    // ========================================================================

    useEffect(() => {
      if (duration && duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration * 1000);

        return () => clearTimeout(timer);
      }
    }, [duration]);

    // ========================================================================
    // Event Handlers
    // ========================================================================

    /**
     * Handles closing the message with exit animation.
     * Triggers the exit animation, then removes from DOM after animation completes.
     */
    const handleClose = () => {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
        onClose?.();
        onRemove?.(id);
      }, 200);
    };

    // ========================================================================
    // CSS Variables
    // ========================================================================

    /**
     * CSS custom properties for theming the message.
     * These variables can be overridden by tenant themes.
     */
    const messageVars = useMemo<React.CSSProperties>(() => ({
      '--message-bg': typeConfig.bg,
      '--message-color': typeConfig.color,
      '--message-shadow': 'var(--shadow-md)',
      '--message-border-radius': 'var(--radius-lg, 8px)',
      '--message-padding': '10px 16px',
      '--message-font-size': '14px',
    } as React.CSSProperties), [typeConfig]);

    // ========================================================================
    // Render Logic
    // ========================================================================

    if (!isVisible) return null;

    /** Combined styles for the message container */
    const messageStyle: React.CSSProperties = {
      ...messageVars,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: 'var(--message-padding)',
      backgroundColor: 'var(--message-bg)',
      borderRadius: 'var(--message-border-radius)',
      boxShadow: 'var(--message-shadow)',
      fontSize: 'var(--message-font-size)',
      opacity: isExiting ? 0 : 1,
      transform: isExiting ? 'translateY(-10px)' : 'translateY(0)',
      transition: 'opacity 0.2s, transform 0.2s',
      ...style,
    };

    /** Icon container styles */
    const iconStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      color: 'var(--message-color)',
    };

    /** Content text styles */
    const contentStyle: React.CSSProperties = {
      color: 'var(--color-text-primary)',
    };

    /** Close button styles */
    const closeStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      marginLeft: '8px',
      cursor: 'pointer',
      color: 'var(--color-text-secondary)',
    };

    return (
      <div
        ref={ref}
        className={`rottay-message rottay-message--${type} ${className}`}
        style={messageStyle}
        role="alert"
      >
        <span className="rottay-message__icon" style={iconStyle}>
          {icon !== undefined ? icon : (
            type === 'loading' ? <LoadingSpinner /> : typeConfig.icon
          )}
        </span>
        <span className="rottay-message__content" style={contentStyle}>
          {content}
        </span>
        {closable && (
          <span
            className="rottay-message__close"
            style={closeStyle}
            onClick={handleClose}
          >
            {closeIcon || '×'}
          </span>
        )}
      </div>
    );
  }
);

BaseMessageItem.displayName = 'BaseMessageItem';

// ============================================================================
// Base Message Container Component
// ============================================================================

/**
 * Container component for positioning messages on the viewport.
 *
 * @description
 * Provides a fixed-position container that holds and positions message items.
 * Handles the layout and z-index stacking for proper message display.
 *
 * @remarks
 * Features:
 * - Fixed positioning at top or bottom of viewport
 * - Horizontally centered with flex layout
 * - Proper z-index for overlay behavior
 * - Pointer-events handled for interaction passthrough
 *
 * @param props.placement - Position of container ('top' or 'bottom')
 * @param props.top - Top offset in pixels when placement is 'top'
 * @param props.children - MessageItem components to render
 *
 * @example
 * ```tsx
 * <BaseMessageContainer placement="top" top={24}>
 *   <BaseMessageItem type="success" content="Message 1" />
 *   <BaseMessageItem type="info" content="Message 2" />
 * </BaseMessageContainer>
 * ```
 */
export const BaseMessageContainer = forwardRef<HTMLDivElement, {
  /** Position of the container (top or bottom of viewport) */
  placement?: 'top' | 'bottom';
  /** Top offset in pixels when placement is 'top' */
  top?: number;
  /** Message items to render inside the container */
  children: React.ReactNode;
}>(({ placement = 'top', top = MESSAGE_DEFAULTS.top, children }, ref) => {
  /** Container positioning styles */
  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    left: '50%',
    transform: 'translateX(-50%)',
    [placement]: top,
    zIndex: 1010,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    pointerEvents: 'none',
  };

  return (
    <div ref={ref} className="rottay-message-container" style={containerStyle}>
      {React.Children.map(children, child => (
        <div style={{ pointerEvents: 'auto' }}>{child}</div>
      ))}
    </div>
  );
});

BaseMessageContainer.displayName = 'BaseMessageContainer';
