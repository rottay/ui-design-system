/**
 * @fileoverview Result Types - Rottay Design System
 * @description Type definitions for the Result component.
 * Part of the Rottay Design System's feedback primitives collection.
 *
 * @remarks
 * This module defines the core TypeScript interfaces for the Result component.
 * The types are designed to work across all three rendering engines (Classic,
 * Modern, Rustic) while providing a consistent API for developers.
 *
 * **Type Categories:**
 * - `ResultStatus`: Available status types for the result display
 * - `ResultProps`: Main component props interface
 *
 * **Multi-Tenant Support:**
 * Props include standard className and style support to ensure
 * compatibility with tenant theming and custom styling needs.
 *
 * @example Type Usage
 * ```tsx
 * import type { ResultProps, ResultStatus } from '@rottay/design-system';
 *
 * // Custom result wrapper with typed props
 * interface CustomResultProps extends ResultProps {
 *   showRetryButton?: boolean;
 * }
 *
 * // Type-safe status handling
 * const status: ResultStatus = 'success';
 * ```
 *
 * @example Default Values Usage
 * ```tsx
 * import { RESULT_DEFAULTS, RESULT_COLORS, RESULT_ICONS } from '@rottay/design-system';
 *
 * // Access default configuration
 * console.log(RESULT_DEFAULTS.status); // 'info'
 *
 * // Get color for a status
 * console.log(RESULT_COLORS.success); // '#52c41a'
 *
 * // Get icon character for a status
 * console.log(RESULT_ICONS.error); // '✕'
 * ```
 *
 * @see {@link ResultProps} - Main component props
 * @see {@link RESULT_DEFAULTS} - Default configuration values
 * @see {@link RESULT_COLORS} - Status color mappings
 * @see {@link RESULT_ICONS} - Status icon mappings
 * @module Result/Types
 * @category Feedback
 * @package @rottay/design-system
 */

import type { ReactNode, CSSProperties } from 'react';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Status options for the Result component.
 * Determines the visual appearance and icon displayed.
 *
 * @type {string}
 *
 * | Value | Description | Icon Color |
 * |-------|-------------|------------|
 * | `success` | Successful operation | Green |
 * | `error` | Failed operation | Red |
 * | `info` | Informational message (default) | Blue |
 * | `warning` | Warning message | Yellow/Orange |
 * | `404` | Page not found | Blue |
 * | `403` | Access forbidden | Yellow/Orange |
 * | `500` | Server error | Red |
 */
export type ResultStatus = 'success' | 'error' | 'info' | 'warning' | '404' | '403' | '500';

// ============================================================================
// Props Interface
// ============================================================================

/**
 * Props for the Result component.
 *
 * @interface ResultProps
 *
 * @example Complete Usage
 * ```tsx
 * <Result
 *   status="success"
 *   icon={<CustomIcon />}
 *   title="Operation Successful"
 *   subTitle="Your changes have been saved."
 *   extra={[
 *     <Button key="view">View Details</Button>,
 *     <Button key="home">Back Home</Button>,
 *   ]}
 *   className="my-result"
 *   style={{ maxWidth: 600 }}
 * >
 *   <AdditionalContent />
 * </Result>
 * ```
 */
export interface ResultProps {
  // ---------------------------------------------------------------------------
  // Status & Icon
  // ---------------------------------------------------------------------------

  /**
   * Result status type.
   * Determines the default icon and color scheme.
   * @default 'info'
   */
  status?: ResultStatus;

  /**
   * Custom icon to display.
   * Overrides the default status icon when provided.
   * @example <span style={{ fontSize: 64 }}>🎉</span>
   * @example <CustomSuccessIcon />
   */
  icon?: ReactNode;

  // ---------------------------------------------------------------------------
  // Content
  // ---------------------------------------------------------------------------

  /**
   * Primary title text.
   * Displayed prominently below the icon.
   * @example "Payment Successful!"
   * @example "404 - Page Not Found"
   */
  title?: ReactNode;

  /**
   * Secondary subtitle/description text.
   * Provides additional context below the title.
   * @example "Your order has been confirmed and will be shipped soon."
   */
  subTitle?: ReactNode;

  /**
   * Extra content, typically action buttons.
   * Rendered below the subtitle.
   * @example <Button>Back Home</Button>
   * @example [<Button key="1">Retry</Button>, <Button key="2">Cancel</Button>]
   */
  extra?: ReactNode;

  /**
   * Additional children content.
   * Rendered in a container below the extra content.
   * Useful for detailed error information or additional actions.
   */
  children?: ReactNode;

  // ---------------------------------------------------------------------------
  // Styling
  // ---------------------------------------------------------------------------

  /**
   * Custom CSS class name.
   * Applied to the root container element.
   */
  className?: string;

  /**
   * Custom inline styles.
   * Applied to the root container element.
   */
  style?: CSSProperties;
}

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default configuration values for the Result component.
 * Used by engine implementations to ensure consistent behavior.
 *
 * @constant
 *
 * @example Accessing Defaults
 * ```tsx
 * import { RESULT_DEFAULTS } from '@rottay/design-system';
 *
 * const MyResult = (props: ResultProps) => {
 *   const status = props.status ?? RESULT_DEFAULTS.status;
 *   // ...
 * };
 * ```
 */
export const RESULT_DEFAULTS: Partial<ResultProps> = {
  /** Default status is informational */
  status: 'info',
};

// ============================================================================
// Status Icon Mappings
// ============================================================================

/**
 * Icon characters for each result status.
 * Used by engines that don't have built-in icons.
 *
 * @constant
 *
 * @example Using Icon Mappings
 * ```tsx
 * import { RESULT_ICONS, ResultStatus } from '@rottay/design-system';
 *
 * const getIconForStatus = (status: ResultStatus): string => {
 *   return RESULT_ICONS[status];
 * };
 *
 * console.log(getIconForStatus('success')); // '✓'
 * console.log(getIconForStatus('404'));     // '404'
 * ```
 */
export const RESULT_ICONS: Record<ResultStatus, string> = {
  /** Checkmark for successful operations */
  success: '✓',
  /** X mark for failed operations */
  error: '✕',
  /** Information symbol for general info */
  info: 'ℹ',
  /** Warning triangle for caution messages */
  warning: '⚠',
  /** HTTP 404 status code display */
  '404': '404',
  /** HTTP 403 status code display */
  '403': '403',
  /** HTTP 500 status code display */
  '500': '500',
};

// ============================================================================
// Status Color Mappings
// ============================================================================

/**
 * Color values for each result status.
 * Used for icon coloring and visual indicators.
 *
 * @constant
 *
 * @remarks
 * These colors follow the Rottay Design System color conventions:
 * - Green (#52c41a) for positive/success states
 * - Red (#ff4d4f) for negative/error states
 * - Blue (#1677ff) for neutral/informational states
 * - Yellow/Orange (#faad14) for warning/caution states
 *
 * @example Using Color Mappings
 * ```tsx
 * import { RESULT_COLORS, ResultStatus } from '@rottay/design-system';
 *
 * const getColorForStatus = (status: ResultStatus): string => {
 *   return RESULT_COLORS[status];
 * };
 *
 * console.log(getColorForStatus('success')); // '#52c41a'
 * console.log(getColorForStatus('error'));   // '#ff4d4f'
 * ```
 */
export const RESULT_COLORS: Record<ResultStatus, string> = {
  /** Green - successful operations */
  success: '#52c41a',
  /** Red - failed operations */
  error: '#ff4d4f',
  /** Blue - informational messages */
  info: '#1677ff',
  /** Yellow/Orange - warning messages */
  warning: '#faad14',
  /** Blue - page not found (informational context) */
  '404': '#1677ff',
  /** Yellow/Orange - access denied (warning context) */
  '403': '#faad14',
  /** Red - server error (error context) */
  '500': '#ff4d4f',
};
