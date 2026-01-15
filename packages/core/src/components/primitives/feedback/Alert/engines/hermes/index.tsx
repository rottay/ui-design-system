/**
 * @fileoverview Alert Hermes Engine - Rottay Design System
 * @description DaisyUI/Tailwind implementation of the Alert component.
 * A lightweight, utility-first alternative to the Titan engine.
 *
 * @remarks
 * **Engine Overview:**
 * Hermes is the utility-first engine built on DaisyUI and Tailwind CSS.
 * It provides a smaller bundle size compared to Titan while maintaining
 * core alert functionality.
 *
 * **Key Features:**
 * - Utility-first styling with Tailwind
 * - Smaller bundle size than Ant Design
 * - DaisyUI component tokens
 * - Custom dismiss state management
 *
 * **When to Use Hermes:**
 * - Projects using Tailwind CSS
 * - When bundle size is a concern
 * - Landing pages and marketing sites
 * - When DaisyUI theme is preferred
 *
 * **Multi-Tenant Theming:**
 * Hermes uses DaisyUI's color system with CSS custom properties.
 * Tenant themes can override:
 * - `--alert-info`: Info alert background
 * - `--alert-success`: Success alert background
 * - `--alert-warning`: Warning alert background
 * - `--alert-error`: Error alert background
 *
 * **Type to DaisyUI Class Mapping:**
 * | Type | DaisyUI Class | Icon |
 * |------|---------------|------|
 * | info | alert-info | bulb |
 * | success | alert-success | checkmark |
 * | warning | alert-warning | warning |
 * | error | alert-error | x |
 *
 * @example Basic Usage
 * ```tsx
 * import { Alert } from '@rottay/design-system';
 *
 * <Alert engine="hermes" type="success" message="File uploaded!" />
 * ```
 *
 * @example Global Engine Configuration
 * ```tsx
 * import { EngineProvider, Alert } from '@rottay/design-system';
 *
 * <EngineProvider engine="hermes">
 *   <App>
 *     <Alert type="info" message="All alerts use Hermes engine" />
 *   </App>
 * </EngineProvider>
 * ```
 *
 * @see {@link AlertProps} - Component props interface
 * @see {@link TitanAlert} - Ant Design alternative
 * @see {@link ApolloAlert} - Vanilla alternative
 * @see {@link https://daisyui.com/components/alert} - DaisyUI Alert docs
 * @module Alert/Engines/Hermes
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
 * DaisyUI class mappings for alert types.
 * Each type corresponds to a DaisyUI modifier class.
 *
 * @internal
 */
const TYPE_CLASSES: Record<AlertType, string> = {
  /** Blue tint for informational messages */
  info: 'alert-info',
  /** Green tint for success confirmations */
  success: 'alert-success',
  /** Yellow/orange tint for warnings */
  warning: 'alert-warning',
  /** Red tint for error messages */
  error: 'alert-error',
};

/**
 * Default icons for each alert type.
 * Used when `showIcon` is true and no custom `icon` is provided.
 * Using inline SVGs for consistent rendering across themes.
 *
 * @internal
 */
const TYPE_ICONS: Record<AlertType, React.ReactNode> = {
  /** Info circle icon */
  info: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  /** Checkmark circle for successful operations */
  success: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  /** Warning triangle for caution messages */
  warning: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  /** X circle for errors and failures */
  error: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

// ============================================================================
// Component
// ============================================================================

/**
 * Hermes Engine implementation of the Alert component.
 *
 * @description
 * Custom alert implementation using DaisyUI classes and Tailwind utilities.
 * Provides a lightweight alternative to Ant Design with smaller bundle size.
 *
 * @remarks
 * **Implementation Details:**
 * - Uses `useState` for dismiss state management
 * - DaisyUI alert classes for styling
 * - Custom close button with ghost styling
 * - Flexbox layout for icon and content alignment
 *
 * **CSS Classes Used:**
 * - `alert`: Base DaisyUI alert container
 * - `alert-{type}`: Type-specific modifier
 * - `btn`, `btn-sm`, `btn-ghost`: Close button
 * - `font-bold`: Message text styling
 * - `text-sm`: Description text styling
 *
 * **Accessibility:**
 * - Semantic HTML structure
 * - Close button is focusable
 * - Icon provides visual context
 *
 * @param props - {@link AlertProps}
 * @returns The rendered DaisyUI Alert or null when dismissed
 *
 * @example
 * ```tsx
 * <HermesAlert
 *   type="warning"
 *   message="Low disk space"
 *   description="Consider cleaning up unused files."
 *   showIcon
 *   closable
 *   onClose={() => console.log('Alert dismissed')}
 * />
 * ```
 */
export default function HermesAlert(props: AlertProps): React.ReactElement | null {
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
    className = '',
    style,
  } = props;

  // ---------------------------------------------------------------------------
  // Early Return
  // ---------------------------------------------------------------------------

  // Don't render if dismissed
  if (!visible) return null;

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
  // Derived Values
  // ---------------------------------------------------------------------------

  const alertType = type as AlertType;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className={`alert ${TYPE_CLASSES[alertType]} ${className}`} style={style}>
      {/* Icon Section */}
      {showIcon && <span>{icon || TYPE_ICONS[alertType]}</span>}

      {/* Content Section */}
      <div>
        <div className="font-bold">{message}</div>
        {description && <div className="text-sm">{description}</div>}
      </div>

      {/* Close Button */}
      {closable && (
        <button className="btn btn-sm btn-ghost btn-circle" onClick={handleClose} aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
