/**
 * @fileoverview Alert Type Definitions - Rottay Design System
 * @description TypeScript interfaces and types for the Alert component.
 * Defines the contract for all Alert engine implementations.
 *
 * @remarks
 * This module provides the core type definitions that ensure consistent
 * behavior across all Alert engine implementations (Titan, Hermes, Apollo).
 *
 * **Type Hierarchy:**
 * ```
 * AlertProps
 * ├── extends BaseComponentProps (className, style, id, data-testid)
 * └── extends EngineAwareProps (engine selection)
 * ```
 *
 * **Alert Types:**
 * | Type | Color | Use Case |
 * |------|-------|----------|
 * | info | Blue | General information |
 * | success | Green | Successful actions |
 * | warning | Yellow/Orange | Caution messages |
 * | error | Red | Error states |
 *
 * @example Type Usage
 * ```tsx
 * import type { AlertProps, AlertType } from '@rottay/design-system';
 *
 * const alertConfig: AlertProps = {
 *   type: 'success',
 *   message: 'Operation completed',
 *   showIcon: true,
 * };
 * ```
 *
 * @see {@link AlertProps} - Main props interface
 * @see {@link AlertType} - Alert type variants
 * @module Alert/Types
 * @category Feedback
 * @package @rottay/design-system
 */

import type { EngineAwareProps, BaseComponentProps } from '../../../../../types';
import type { ReactNode } from 'react';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Alert type variants for different message contexts.
 *
 * @description
 * Defines the semantic types available for alerts, each with its own
 * color scheme and iconography.
 *
 * | Type | Icon | Background | Use Case |
 * |------|------|------------|----------|
 * | info | ℹ | Blue tint | General information, tips |
 * | success | ✓ | Green tint | Successful operations |
 * | warning | ⚠ | Yellow tint | Caution, potential issues |
 * | error | ✕ | Red tint | Errors, failures |
 */
export type AlertType = 'info' | 'success' | 'warning' | 'error';

// ============================================================================
// Props Interface
// ============================================================================

/**
 * Props interface for the Alert component.
 *
 * @description
 * Extends base component props with alert-specific configuration
 * for message display, icons, and dismiss behavior.
 *
 * @remarks
 * **Required Props:**
 * - `message`: The main alert text (required)
 *
 * **Optional Props:**
 * - `type`: Alert variant (default: 'info')
 * - `description`: Additional detail text
 * - `icon`: Custom icon element
 * - `showIcon`: Whether to show the type icon (default: true)
 * - `closable`: Whether alert can be dismissed (default: false)
 * - `onClose`: Callback when dismissed
 *
 * @example
 * ```tsx
 * const alertProps: AlertProps = {
 *   type: 'warning',
 *   message: 'Session Expiring',
 *   description: 'Your session will expire in 5 minutes.',
 *   closable: true,
 *   onClose: () => refreshSession(),
 * };
 * ```
 */
export interface AlertProps extends BaseComponentProps, EngineAwareProps {
  /**
   * The alert type/variant.
   * Determines color scheme and default icon.
   * @default 'info'
   */
  type?: AlertType;

  /**
   * The main message content.
   * Displayed prominently in the alert.
   * @required
   */
  message: ReactNode;

  /**
   * Additional descriptive content.
   * Displayed below the main message in a smaller size.
   */
  description?: ReactNode;

  /**
   * Custom icon element.
   * Overrides the default type-based icon when provided.
   */
  icon?: ReactNode;

  /**
   * Whether to display the alert icon.
   * @default true
   */
  showIcon?: boolean;

  /**
   * Whether the alert can be dismissed.
   * Shows a close button when true.
   * @default false
   */
  closable?: boolean;

  /**
   * Callback fired when the alert is dismissed.
   * Only called when `closable` is true and user clicks close.
   */
  onClose?: () => void;

  /**
   * Children content for compound components.
   * Used with Alert.Description for structured content.
   */
  children?: ReactNode;
}

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default prop values for the Alert component.
 *
 * @description
 * Provides sensible defaults that can be overridden per-instance.
 *
 * | Property | Default | Reason |
 * |----------|---------|--------|
 * | type | 'info' | Most common, neutral type |
 * | showIcon | true | Icons aid recognition |
 * | closable | false | Permanent by default |
 *
 * @example
 * ```tsx
 * // Using defaults
 * <Alert message="Hello" />
 * // Equivalent to:
 * <Alert type="info" message="Hello" showIcon closable={false} />
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
