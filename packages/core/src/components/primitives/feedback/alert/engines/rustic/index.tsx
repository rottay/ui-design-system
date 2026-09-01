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

import React, { useState, useId } from 'react';
import type { AlertProps, AlertType } from '../../contracts';
import { ALERT_DEFAULTS, TONE_TO_ALERT_TYPE } from '../../contracts';
import { isResponsiveValue, generateResponsiveCSS, type ResponsivePropEntry } from '@/infrastructure/runtime/responsive/runtime/style-properties';

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
    tone,
    type = ALERT_DEFAULTS.type as AlertType,
    icon,
    showIcon = ALERT_DEFAULTS.showIcon,

    // Content
    message,
    description,

    // Behavior
    compact: compactProp = ALERT_DEFAULTS.compact,
    closable = ALERT_DEFAULTS.closable,
    onClose,

    // Styling
    className,
    style,
  } = props;

  // Responsive compact handling
  const reactId = useId();
  const responsiveEntries: ResponsivePropEntry<any>[] = [];
  const compactIsResponsive = isResponsiveValue(compactProp);

  if (compactIsResponsive) {
    responsiveEntries.push({
      cssProperty: 'padding',
      value: compactProp,
      resolve: (v: boolean) => v ? '0.5rem 0.75rem' : '1rem',
    } as ResponsivePropEntry<any>);
    responsiveEntries.push({
      cssProperty: 'font-size',
      value: compactProp,
      resolve: (v: boolean) => v ? '0.8125rem' : '0.875rem',
    } as ResponsivePropEntry<any>);
  }

  const needsResponsiveCSS = responsiveEntries.length > 0;
  const elementId = needsResponsiveCSS ? `alert-${reactId.replace(/:/g, '')}` : '';
  const responsive = needsResponsiveCSS
    ? generateResponsiveCSS(elementId, responsiveEntries)
    : null;

  const isCompact = !compactIsResponsive && compactProp === true;

  // ---------------------------------------------------------------------------
  // Early Return
  // ---------------------------------------------------------------------------

  // Don't render if dismissed
  if (!visible) return null;

  // ---------------------------------------------------------------------------
  // Derived Values
  // ---------------------------------------------------------------------------

  // `tone` takes precedence over the deprecated `type` prop when both are given.
  const alertType = tone ? TONE_TO_ALERT_TYPE[tone] : (type as AlertType);

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
    gap: isCompact ? '0.5rem' : '0.75rem',
    padding: isCompact ? '0.5rem 0.75rem' : '1rem',
    fontSize: isCompact ? '0.8125rem' : undefined,
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
    <>
    {responsive && responsive.css && (
      <style dangerouslySetInnerHTML={{ __html: responsive.css }} />
    )}
    <div data-part="root" data-tone={alertType} className={`rottay-alert-shell rottay-alert-shell--rustic ${className ?? ''}`} style={baseStyle} role="alert" {...(responsive ? responsive.attrs : {})}>
      {/* Icon Section */}
      {showIcon && (
        <span data-part="icon" style={iconStyle}>
          {icon || TYPE_ICONS[alertType]}
        </span>
      )}

      {/* Content Section */}
      <div style={contentStyle}>
        <div data-part="label" style={messageStyle}>{message}</div>
        {description && <div data-part="description" style={descriptionStyle}>{description}</div>}
      </div>

      {/* Close Button */}
      {closable && (
        <button data-part="action" onClick={handleClose} style={closeButtonStyle}>
          x
        </button>
      )}
    </div>
    </>
  );
}
