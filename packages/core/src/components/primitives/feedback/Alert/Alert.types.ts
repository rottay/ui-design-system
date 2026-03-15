/**
 * @fileoverview Alert Types - Rottay Design System
 * @description Type definitions for the Alert component and its variants.
 * Part of the Rottay Design System's feedback primitives collection.
 *
 * @remarks
 * This module defines the core TypeScript interfaces for the Alert component.
 * The types are designed to work across all three rendering engines (Classic,
 * Modern, Rustic) while providing a consistent API for developers.
 *
 * **Type Categories:**
 * - `AlertType`: Semantic variants (info, success, warning, error)
 * - `AlertProps`: Main component props interface
 *
 * **Multi-Tenant Support:**
 * Props extend `BaseComponentProps` and `EngineAwareProps` to ensure
 * compatibility with tenant theming and engine switching.
 *
 * @example Type Usage
 * ```tsx
 * import type { AlertProps, AlertType } from '@rottay/design-system';
 *
 * // Custom alert wrapper with typed props
 * interface CustomAlertProps extends AlertProps {
 *   customIcon?: React.ReactNode;
 *   autoClose?: boolean;
 * }
 *
 * // Type-safe alert configuration
 * const alertType: AlertType = 'success';
 * const alertConfig: AlertProps = {
 *   type: alertType,
 *   message: 'Operation completed',
 *   showIcon: true,
 * };
 * ```
 *
 * @example Default Values Usage
 * ```tsx
 * import { ALERT_DEFAULTS } from '@rottay/design-system';
 *
 * // Access default configuration
 * console.log(ALERT_DEFAULTS.type);      // 'info'
 * console.log(ALERT_DEFAULTS.showIcon);  // true
 * console.log(ALERT_DEFAULTS.closable);  // false
 * ```
 *
 * @see {@link AlertProps} - Main component props
 * @see {@link ALERT_DEFAULTS} - Default configuration values
 * @module Alert/Types
 * @category Feedback
 * @package @rottay/design-system
 */

import type { EngineAwareProps, BaseComponentProps } from '../../../../types';
import type { ReactNode } from 'react';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Alert type variants for different message contexts.
 *
 * @description
 * Defines the semantic types available for alerts, each with its own
 * color scheme and iconography across all engines.
 *
 * @type {string}
 *
 * | Value | Icon | Color | Use Case |
 * |-------|------|-------|----------|
 * | `info` | i | Blue | General information, tips |
 * | `success` | checkmark | Green | Successful operations |
 * | `warning` | ! | Yellow/Orange | Caution, potential issues |
 * | `error` | x | Red | Errors, failures |
 *
 * @example
 * ```tsx
 * import type { AlertType } from '@rottay/design-system';
 *
 * const getAlertType = (status: string): AlertType => {
 *   switch (status) {
 *     case 'ok': return 'success';
 *     case 'pending': return 'warning';
 *     case 'failed': return 'error';
 *     default: return 'info';
 *   }
 * };
 * ```
 */
export type AlertType = 'info' | 'success' | 'warning' | 'error';

// ============================================================================
// Props Interface
// ============================================================================

/**
 * Props for the Alert component.
 *
 * @interface AlertProps
 * @extends {BaseComponentProps} - Standard props (className, style, id, etc.)
 * @extends {EngineAwareProps} - Engine selection support
 *
 * @example Complete Usage
 * ```tsx
 * <Alert
 *   type="warning"
 *   message="Session Expiring Soon"
 *   description="Your session will expire in 5 minutes. Save your work."
 *   icon={<ClockIcon />}
 *   showIcon
 *   closable
 *   onClose={() => refreshSession()}
 *   className="session-warning"
 *   style={{ marginBottom: 16 }}
 * />
 * ```
 */
export interface AlertProps extends BaseComponentProps, EngineAwareProps {
  // ---------------------------------------------------------------------------
  // Type & Appearance
  // ---------------------------------------------------------------------------

  /**
   * The alert type/variant.
   * Determines color scheme and default icon.
   * @default 'info'
   */
  type?: AlertType;

  /**
   * Custom icon element.
   * Overrides the default type-based icon when provided.
   * @example <InfoIcon />
   * @example <CustomSvg />
   */
  icon?: ReactNode;

  /**
   * Whether to display the alert icon.
   * When true, shows either the custom icon or the default type icon.
   * @default true
   */
  showIcon?: boolean;

  // ---------------------------------------------------------------------------
  // Content
  // ---------------------------------------------------------------------------

  /**
   * The main message content.
   * Displayed prominently in the alert.
   * Can be a string or React elements.
   * @required
   * @example "Changes saved successfully!"
   * @example <><strong>Success:</strong> Your profile has been updated.</>
   */
  message: ReactNode;

  /**
   * Additional descriptive content.
   * Displayed below the main message in a smaller, subdued style.
   * For complex descriptions, use `<Alert.Description>` compound component.
   * @example "Please refresh the page to see the changes."
   */
  description?: ReactNode;

  /**
   * Children content for compound components.
   * Used with `<Alert.Description>` for structured content.
   * @example
   * ```tsx
   * <Alert type="error" message="Upload Failed">
   *   <Alert.Description>File size exceeds limit.</Alert.Description>
   * </Alert>
   * ```
   */
  children?: ReactNode;

  // ---------------------------------------------------------------------------
  // Behavior
  // ---------------------------------------------------------------------------

  /**
   * Whether the alert can be dismissed.
   * Shows a close button when true.
   * @default false
   */
  closable?: boolean;

  /**
   * Callback fired when the alert is dismissed.
   * Only called when `closable` is true and user clicks the close button.
   */
  onClose?: () => void;
}

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default configuration values for the Alert component.
 * Used by engine implementations to ensure consistent behavior.
 *
 * @constant
 *
 * @example Accessing Defaults
 * ```tsx
 * import { ALERT_DEFAULTS } from '@rottay/design-system';
 *
 * const MyAlert = (props: AlertProps) => {
 *   const type = props.type ?? ALERT_DEFAULTS.type;
 *   const showIcon = props.showIcon ?? ALERT_DEFAULTS.showIcon;
 *   // ...
 * };
 * ```
 *
 * @example Using in Custom Components
 * ```tsx
 * import { ALERT_DEFAULTS } from '@rottay/design-system';
 *
 * function StatusBanner({ type = ALERT_DEFAULTS.type, ...props }) {
 *   // type defaults to 'info' if not provided
 *   return <Alert type={type} {...props} />;
 * }
 * ```
 */
export const ALERT_DEFAULTS: Partial<AlertProps> = {
  /** Default to info type for general messages */
  type: 'info',

  /** Show icons by default for visual context */
  showIcon: true,

  /** Alerts are not dismissible by default */
  closable: false,
};
