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
 * - `AlertTone`: Semantic tones (info, success, warning, danger)
 * - `AlertType`: The internal color key each tone resolves to
 * - `AlertProps`: Main component props interface
 *
 * **Multi-Tenant Support:**
 * Props extend `BaseComponentProps` and `EngineAwareProps` to ensure
 * compatibility with tenant theming and engine switching.
 *
 * @example Type Usage
 * ```tsx
 * import type { AlertProps } from '@rottay/design-system';
 *
 * // Type-safe alert configuration
 * const alertConfig: AlertProps = {
 *   tone: 'success',
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

import type { EngineAwareProps, BaseComponentProps } from '../../../../../foundation/contracts';
import type { Tone } from '../../../../../foundation/contracts/kernel/common';
import { TONE_TO_VARIANT } from '../../../../../foundation/contracts/kernel/common';
import type { ReactNode } from 'react';
import type { ResponsiveValue } from '@/foundation/contracts/kernel/responsive/values';

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

/**
 * The {@link Tone} values Alert accepts through the `tone` prop ('neutral' and 'primary' have no
 * Alert rendering and remain excluded -- the same curated subset Callout's `CalloutTone` uses).
 */
export type AlertTone = 'info' | 'warning' | 'danger' | 'success';

/**
 * Every {@link AlertTone} value mapped to the internal color-token key the engines paint with
 * ('danger' is the canonical Tone spelling; Alert's internal key has always been 'error').
 * Resolves through the kernel {@link TONE_TO_VARIANT} map (single authority): Alert's own
 * `AlertType` vocabulary ('info' | 'warning' | 'error' | 'success') is a subset of the literal
 * values `TONE_TO_VARIANT` produces for these four keys -- the same relationship Callout's
 * `TONE_TO_CALLOUT_VARIANT` has to it.
 */
export const TONE_TO_ALERT_TYPE: Record<AlertTone, AlertType> = TONE_TO_VARIANT;

// ============================================================================
// Props Interface
// ============================================================================

/** An alert led by its message line; the description is optional detail under it. */
interface AlertTitledContent {
  /**
   * The main message content.
   * Displayed prominently in the alert.
   * Can be a string or React elements.
   * Required unless a `description` is given.
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
}

/** A body-only notice: no message line, so the description is the content. */
interface AlertBodyOnlyContent {
  /** The main message content. Optional here because the `description` carries the notice. */
  message?: ReactNode;

  /** The body of the notice. Required when there is no `message`. */
  description: ReactNode;
}

/** Every Alert prop except the content pair (`message`, `description`). */
interface AlertSharedProps extends BaseComponentProps, EngineAwareProps {
  // ---------------------------------------------------------------------------
  // Type & Appearance
  // ---------------------------------------------------------------------------

  /**
   * Alert semantic color. Determines the color scheme and the default icon.
   * @default 'info'
   */
  tone?: AlertTone;

  /**
   * Custom icon element.
   * Overrides the default tone icon when provided.
   * @example <InfoIcon />
   * @example <CustomSvg />
   */
  icon?: ReactNode;

  /**
   * Whether to display the alert icon.
   * When true, shows either the custom icon or the default tone icon.
   * @default true
   */
  showIcon?: boolean;

  /**
   * Visual weight of the surface. `subtle` washes one tint step lighter than
   * `standard`: the weight of a guidance notice rather than an alert.
   * Rendered by the Modern engine.
   * @default 'standard'
   */
  emphasis?: 'standard' | 'subtle';

  /**
   * How assistive technology announces the alert. `alert` interrupts
   * (`role="alert"`), `status` waits its turn (`role="status"`), and `tone`
   * interrupts only for the urgent tones (warning, danger) and stays polite
   * for the calm ones (info, success).
   * Rendered by the Modern engine.
   * @default 'alert'
   */
  announce?: 'alert' | 'status' | 'tone';

  // ---------------------------------------------------------------------------
  // Content
  // ---------------------------------------------------------------------------

  /**
   * Children content for compound components.
   * Used with `<Alert.Description>` for structured content.
   * @example
   * ```tsx
   * <Alert tone="danger" message="Upload Failed">
   *   <Alert.Description>File size exceeds limit.</Alert.Description>
   * </Alert>
   * ```
   */
  children?: ReactNode;

  /**
   * Controls rendered in a tray under the copy (the former Callout action).
   * Rendered by the Modern engine.
   */
  action?: ReactNode;

  // ---------------------------------------------------------------------------
  // Behavior
  // ---------------------------------------------------------------------------

  /**
   * Whether the alert uses compact styling (reduced padding and font size).
   * Accepts a plain boolean or a responsive breakpoint object.
   * @default false
   * @example
   * ```tsx
   * <Alert compact message="Short" />
   * <Alert compact={{ base: true, md: false }} message="Responsive compact" />
   * ```
   */
  compact?: ResponsiveValue<boolean>;

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

/**
 * Props for the Alert component: the contract the family publishes as `AlertProps`.
 *
 * An alert always says something: `message` is required unless `description`
 * is given, so an alert with neither does not type-check.
 *
 * @interface AlertProps
 * @extends {BaseComponentProps} - Standard props (className, style, id, etc.)
 * @extends {EngineAwareProps} - Engine selection support
 *
 * @example Complete Usage
 * ```tsx
 * <Alert
 *   tone="warning"
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
export type AlertPublicProps = AlertSharedProps & (AlertTitledContent | AlertBodyOnlyContent);

/**
 * Props the engines receive. Family-internal and not published: it adds to the public contract
 * the `type` member the Classic and Rustic engines read when `tone` is absent; the family entry
 * publishes {@link AlertPublicProps} as `AlertProps`.
 */
export type AlertProps = AlertPublicProps & { type?: AlertType };

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
 *   const showIcon = props.showIcon ?? ALERT_DEFAULTS.showIcon;
 *   // ...
 * };
 * ```
 */
export const ALERT_DEFAULTS: Partial<AlertProps> = {
  /** The color key the Classic and Rustic engines fall back to when `tone` is absent */
  type: 'info',

  /** Show icons by default for visual context */
  showIcon: true,

  /** Alerts are not dismissible by default */
  closable: false,

  /** Alerts use normal (non-compact) styling by default */
  compact: false,

  /** Alerts wash at the standard weight by default */
  emphasis: 'standard',

  /** Alerts announce assertively by default */
  announce: 'alert',
};
