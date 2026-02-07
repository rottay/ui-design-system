/**
 * @fileoverview Progress Types - Rottay Design System
 * @description Type definitions for the Progress component and its compound components.
 * Part of the Rottay Design System's feedback primitives collection.
 *
 * @remarks
 * This module defines the core TypeScript interfaces for the Progress component.
 * The types are designed to work across all three rendering engines (Classic,
 * Modern, Rustic) while providing a consistent API for developers.
 *
 * **Type Categories:**
 * - `ProgressType`: Display type (line or circle)
 * - `ProgressStatus`: Current state of the progress
 * - `ProgressProps`: Main component props interface
 *
 * **Multi-Tenant Support:**
 * Props extend `BaseComponentProps` and `EngineAwareProps` to ensure
 * compatibility with tenant theming and engine switching.
 *
 * @example Type Usage
 * ```tsx
 * import type { ProgressProps, ProgressType, ProgressStatus } from '@rottay/design-system';
 *
 * // Custom progress wrapper with typed props
 * interface CustomProgressProps extends ProgressProps {
 *   label?: string;
 * }
 *
 * // Type-safe status handling
 * const type: ProgressType = 'circle';
 * const status: ProgressStatus = 'success';
 * ```
 *
 * @example Default Values Usage
 * ```tsx
 * import { PROGRESS_DEFAULTS } from '@rottay/design-system';
 *
 * // Access default configuration
 * console.log(PROGRESS_DEFAULTS.type);       // 'line'
 * console.log(PROGRESS_DEFAULTS.status);     // 'normal'
 * console.log(PROGRESS_DEFAULTS.showInfo);   // true
 * console.log(PROGRESS_DEFAULTS.strokeWidth); // 8
 * ```
 *
 * @see {@link ProgressProps} - Main component props
 * @see {@link PROGRESS_DEFAULTS} - Default configuration values
 * @module Progress/Types
 * @category Feedback
 * @package @rottay/design-system
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps, BaseComponentProps } from '../../../../../types';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Display type options for the Progress component.
 * Determines the visual representation of the progress indicator.
 *
 * @type {string}
 *
 * | Value | Description |
 * |-------|-------------|
 * | `line` | Horizontal progress bar (default) |
 * | `circle` | Circular progress indicator |
 */
export type ProgressType = 'line' | 'circle';

/**
 * Status options for the Progress component.
 * Affects the color and animation of the progress indicator.
 *
 * @type {string}
 *
 * | Value | Color | Description |
 * |-------|-------|-------------|
 * | `normal` | Primary blue | Standard progress state (default) |
 * | `success` | Green | Completed successfully |
 * | `error` | Red | Failed or error state |
 * | `active` | Primary blue + animation | Actively processing |
 */
export type ProgressStatus = 'normal' | 'success' | 'error' | 'active';

// ============================================================================
// Props Interface
// ============================================================================

/**
 * Props for the Progress component.
 *
 * @interface ProgressProps
 * @extends {BaseComponentProps} - Standard props (className, style, id, etc.)
 * @extends {EngineAwareProps} - Engine selection support
 *
 * @example Complete Usage
 * ```tsx
 * <Progress
 *   percent={75}
 *   type="line"
 *   status="active"
 *   showInfo
 *   strokeColor="#1890ff"
 *   strokeWidth={10}
 *   className="my-progress"
 *   style={{ maxWidth: '400px' }}
 * />
 * ```
 */
export interface ProgressProps extends BaseComponentProps, EngineAwareProps {
  // ---------------------------------------------------------------------------
  // Styling
  // ---------------------------------------------------------------------------

  /**
   * Additional CSS class name for the container.
   */
  className?: string;

  /**
   * Inline styles for the container.
   */
  style?: CSSProperties;

  /**
   * Children elements (rarely used, most content is generated).
   */
  children?: ReactNode;

  // ---------------------------------------------------------------------------
  // Progress Value
  // ---------------------------------------------------------------------------

  /**
   * Current progress percentage (0-100).
   * Values outside this range are clamped by engine implementations.
   * @required
   */
  percent: number;

  // ---------------------------------------------------------------------------
  // Display Options
  // ---------------------------------------------------------------------------

  /**
   * Display type: horizontal bar or circular ring.
   * @default 'line'
   */
  type?: ProgressType;

  /**
   * Current status affecting color and animation.
   * @default 'normal'
   */
  status?: ProgressStatus;

  /**
   * Whether to display the percentage value.
   * @default true
   */
  showInfo?: boolean;

  // ---------------------------------------------------------------------------
  // Appearance
  // ---------------------------------------------------------------------------

  /**
   * Color of the progress bar/circle stroke.
   * Supports CSS colors, variables, and gradients.
   * @example '#52c41a'
   * @example 'var(--color-success-500)'
   * @example 'linear-gradient(to right, #108ee9, #87d068)'
   */
  strokeColor?: string;

  /**
   * Width of the progress stroke in pixels.
   * @default 8
   */
  strokeWidth?: number;
}

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default configuration values for the Progress component.
 * Used by engine implementations to ensure consistent behavior.
 *
 * @constant
 *
 * @example Accessing Defaults
 * ```tsx
 * import { PROGRESS_DEFAULTS } from '@rottay/design-system';
 *
 * const MyProgress = (props: ProgressProps) => {
 *   const type = props.type ?? PROGRESS_DEFAULTS.type;
 *   const status = props.status ?? PROGRESS_DEFAULTS.status;
 *   // ...
 * };
 * ```
 */
export const PROGRESS_DEFAULTS: Partial<ProgressProps> = {
  /** Default display type is line (horizontal bar) */
  type: 'line',

  /** Default status is normal (primary color) */
  status: 'normal',

  /** Show percentage info by default */
  showInfo: true,

  /** Default stroke width in pixels */
  strokeWidth: 8,
};
