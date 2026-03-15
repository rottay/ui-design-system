'use client';

/**
 * @fileoverview Alert Rustic Engine - Rottay Design System
 * @description Vanilla HTML/CSS implementation of the Alert component.
 * A zero-dependency engine for maximum accessibility and control.
 *
 * @remarks
 * **Engine Overview:**
 * Rustic is the headless, zero-dependency engine that uses only vanilla
 * HTML, CSS, and React. It provides the smallest bundle size and maximum
 * control over styling and behavior.
 *
 * **Key Features:**
 * - Zero external dependencies (no UI library)
 * - Maximum accessibility control
 * - Smallest bundle footprint
 * - Full CSS custom property support
 * - Semantic HTML structure
 *
 * **When to Use Rustic:**
 * - When bundle size is critical
 * - For accessibility-focused applications
 * - When full styling control is needed
 * - For custom design systems built on Rottay
 * - When avoiding third-party UI libraries
 *
 * **Multi-Tenant Theming:**
 * Rustic uses CSS custom properties for theming:
 * - `--ds-radius-md`: Border radius
 * - Type-specific colors are inlined for reliability
 *
 * **Type to Style Mapping:**
 * | Type | Background | Border | Text |
 * |------|------------|--------|------|
 * | info | #EFF6FF | #3B82F6 | #1E40AF |
 * | success | #F0FDF4 | #22C55E | #166534 |
 * | warning | #FFFBEB | #F59E0B | #92400E |
 * | error | #FEF2F2 | #EF4444 | #991B1B |
 *
 * @example Basic Usage
 * ```tsx
 * import { Alert } from '@rottay/design-system';
 *
 * <Alert engine="rustic" type="success" message="Profile updated!" />
 * ```
 *
 * @example With Custom CSS Variables
 * ```tsx
 * <div style={{
 *   '--ds-radius-md': '8px',
 * }}>
 *   <Alert engine="rustic" type="info" message="Custom styled alert" />
 * </div>
 * ```
 *
 * @example Full Example
 * ```tsx
 * <Alert
 *   engine="rustic"
 *   type="error"
 *   message="Upload Failed"
 *   description="The file size exceeds the 10MB limit."
 *   showIcon
 *   closable
 *   onClose={() => clearError()}
 * />
 * ```
 *
 * @see {@link AlertProps} - Component props interface
 * @see {@link ClassicAlert} - Ant Design alternative
 * @see {@link ModernAlert} - DaisyUI alternative
 * @module Alert/Engines/Rustic
 * @category Feedback
 * @package @rottay/design-system
 */

import React, { useState } from 'react';
import type { AlertProps, AlertType } from '../../types';
import { ALERT_DEFAULTS } from '../../types';

// ============================================================================
// Constants
// ============================================================================

/**
 * Inline styles for each alert type.
 * Provides complete color scheme without external dependencies.
 *
 * @remarks
 * Colors are based on Tailwind CSS color palette for consistency
 * with other engines while remaining dependency-free.
 *
 * @internal
 */
const TYPE_STYLES: Record<AlertType, React.CSSProperties> = {
  /** Blue theme for informational messages */
  info: {
    backgroundColor: 'var(--ds-alert-info-bg, var(--ds-color-info-bg))',
    borderColor: 'var(--ds-alert-info-border, var(--ds-color-info-border))',
    color: 'var(--ds-alert-info-color, var(--ds-color-info-700))',
  },
  /** Green theme for success confirmations */
  success: {
    backgroundColor: 'var(--ds-alert-success-bg, var(--ds-color-success-bg))',
    borderColor: 'var(--ds-alert-success-border, var(--ds-color-success-border))',
    color: 'var(--ds-alert-success-color, var(--ds-color-success-700))',
  },
  /** Yellow/orange theme for warnings */
  warning: {
    backgroundColor: 'var(--ds-alert-warning-bg, var(--ds-color-warning-bg))',
    borderColor: 'var(--ds-alert-warning-border, var(--ds-color-warning-border))',
    color: 'var(--ds-alert-warning-color, var(--ds-color-warning-700))',
  },
  /** Red theme for errors and failures */
  error: {
    backgroundColor: 'var(--ds-alert-error-bg, var(--ds-color-error-bg))',
    borderColor: 'var(--ds-alert-error-border, var(--ds-color-error-border))',
    color: 'var(--ds-alert-error-color, var(--ds-color-error-700))',
  },
};

/**
 * Default icons for each alert type.
 * Simple Unicode characters for zero-dependency rendering.
 *
 * @internal
 */
const TYPE_ICONS: Record<AlertType, string> = {
  /** Information symbol */
  info: 'i',
  /** Checkmark for success */
  success: 'checkmark',
  /** Warning triangle */
  warning: '!',
  /** X for error */
  error: 'x',
};

// ============================================================================
// Component
// ============================================================================

/**
 * Rustic Engine implementation of the Alert component.
 *
 * @description
 * Pure vanilla implementation using only HTML, CSS, and React.
 * Provides complete control over styling through CSS custom properties
 * and inline styles.
 *
 * @remarks
 * **Implementation Details:**
 * - Uses flexbox for layout structure
 * - Manages visibility state for dismissal
 * - Type-specific inline styles for colors
 * - CSS custom properties for customization
 * - Semantic HTML structure
 *
 * **Accessibility Features:**
 * - `role="alert"` for screen reader announcements
 * - Semantic heading-like message styling
 * - Accessible close button
 * - Clear visual hierarchy
 *
 * **CSS Custom Properties:**
 * | Property | Default | Description |
 * |----------|---------|-------------|
 * | `--ds-radius-md` | 0.375rem | Border radius |
 *
 * @param props - {@link AlertProps}
 * @returns The rendered vanilla Alert or null when dismissed
 *
 * @example
 * ```tsx
 * <RusticAlert
 *   type="warning"
 *   message="Unsaved Changes"
 *   description="You have unsaved changes that will be lost."
 *   showIcon
 *   closable
 *   onClose={() => handleDismiss()}
 * />
 * ```
 */
export default function RusticAlert(props: AlertProps): React.ReactElement | null {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  /**
   * Visibility state for dismiss functionality.
   * Managed internally when closable is true.
   */
  const [visible, setVisible] = useState(true);

  // ---------------------------------------------------------------------------
  // Props Destructuring
  // ---------------------------------------------------------------------------

  const {
    // Type & Appearance
    type = ALERT_DEFAULTS.type as AlertType,
    icon,
    showIcon = ALERT_DEFAULTS.showIcon,

    // Content
    message,
    description,

    // Behavior
    closable = ALERT_DEFAULTS.closable,
    onClose,

    // Styling
    className,
    style,
  } = props;

  // ---------------------------------------------------------------------------
  // Early Return
  // ---------------------------------------------------------------------------

  // Don't render if dismissed
  if (!visible) return null;

  // ---------------------------------------------------------------------------
  // Derived Values
  // ---------------------------------------------------------------------------

  const alertType = type as AlertType;

  // ---------------------------------------------------------------------------
  // Style Definitions
  // ---------------------------------------------------------------------------

  /**
   * Base container styles with type-specific colors.
   * Uses flexbox for icon and content alignment.
   */
  const baseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    padding: '1rem',
    borderRadius: 'var(--ds-radius-md, 0.375rem)',
    borderLeft: '4px solid',
    ...TYPE_STYLES[alertType],
    ...style,
  };

  /**
   * Icon styles for proper sizing.
   */
  const iconStyle: React.CSSProperties = {
    fontSize: '1.25rem',
  };

  /**
   * Content container styles for flex growth.
   */
  const contentStyle: React.CSSProperties = {
    flex: 1,
  };

  /**
   * Message styles for emphasis.
   */
  const messageStyle: React.CSSProperties = {
    fontWeight: 600,
  };

  /**
   * Description styles for visual hierarchy.
   */
  const descriptionStyle: React.CSSProperties = {
    marginTop: '0.25rem',
    opacity: 0.9,
  };

  /**
   * Close button styles for minimal appearance.
   */
  const closeButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    opacity: 0.7,
  };

  // ---------------------------------------------------------------------------
  // Event Handlers
  // ---------------------------------------------------------------------------

  /**
   * Handle close button click.
   * Sets visibility to false and triggers onClose callback.
   */
  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className={className} style={baseStyle} role="alert">
      {/* Icon Section */}
      {showIcon && (
        <span style={iconStyle}>
          {icon || TYPE_ICONS[alertType]}
        </span>
      )}

      {/* Content Section */}
      <div style={contentStyle}>
        <div style={messageStyle}>{message}</div>
        {description && <div style={descriptionStyle}>{description}</div>}
      </div>

      {/* Close Button */}
      {closable && (
        <button onClick={handleClose} style={closeButtonStyle}>
          x
        </button>
      )}
    </div>
  );
}
