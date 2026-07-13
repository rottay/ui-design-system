/**
 * @fileoverview Progress Line Compound Component - Rottay Design System
 * @description Linear progress bar with customizable size and styling.
 * Part of the Rottay Design System's feedback primitives collection.
 *
 * @remarks
 * The ProgressLine component renders a horizontal progress bar indicator.
 * It uses CSS variables and inline styles for maximum flexibility in theming
 * and can be used standalone or as part of the Progress compound component.
 *
 * **Key Features:**
 * - Horizontal progress bar with rounded ends
 * - Three size presets (sm, md, lg)
 * - Animated progress transitions
 * - Optional percentage display
 * - Custom format function support
 *
 * **Multi-Tenant Support:**
 * Uses CSS custom properties for colors, allowing automatic
 * adaptation to tenant themes:
 * - `--ds-color-primary-500`: Default stroke color
 * - `--ds-color-neutral-200`: Default trail color
 *
 * @example Basic Usage
 * ```tsx
 * import { Progress } from '@rottay/design-system';
 *
 * <Progress.Line percent={50} />
 * ```
 *
 * @example Size Variants
 * ```tsx
 * <Progress.Line percent={30} size="sm" />
 * <Progress.Line percent={50} size="md" />
 * <Progress.Line percent={70} size="lg" />
 * ```
 *
 * @example Custom Colors
 * ```tsx
 * <Progress.Line
 *   percent={100}
 *   strokeColor="#52c41a"
 *   trailColor="#e8f5e9"
 * />
 * ```
 *
 * @example Custom Format
 * ```tsx
 * <Progress.Line
 *   percent={75}
 *   format={(p) => `${p}% uploaded`}
 * />
 * ```
 *
 * @see {@link ProgressLineProps} - Component props interface
 * @see {@link ProgressCircle} - Circle variant
 * @see {@link Progress} - Parent component
 * @module Progress/Compound/Line
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Props for the ProgressLine compound component.
 *
 * @interface ProgressLineProps
 *
 * @example Complete Usage
 * ```tsx
 * <Progress.Line
 *   percent={75}
 *   size="lg"
 *   strokeColor="var(--ds-color-primary)"
 *   trailColor="var(--ds-color-neutral-200)"
 *   showInfo
 *   format={(p) => `${p}%`}
 *   className="my-progress"
 *   style={{ maxWidth: '400px' }}
 * />
 * ```
 */
export interface ProgressLineProps {
  // ---------------------------------------------------------------------------
  // Progress Value
  // ---------------------------------------------------------------------------

  /**
   * Current progress percentage (0-100).
   * Values outside this range are clamped.
   * @default 0
   */
  percent?: number;

  // ---------------------------------------------------------------------------
  // Sizing
  // ---------------------------------------------------------------------------

  /**
   * Size preset for the progress bar height.
   * - `sm`: 4px height - compact displays
   * - `md`: 8px height - standard usage (default)
   * - `lg`: 12px height - prominent displays
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';

  // ---------------------------------------------------------------------------
  // Colors
  // ---------------------------------------------------------------------------

  /**
   * Color of the progress bar fill.
   * Supports CSS colors, variables, and gradients.
   * @default 'var(--ds-color-primary-500, #1890ff)'
   */
  strokeColor?: string;

  /**
   * Color of the background trail.
   * @default 'var(--ds-color-neutral-200, #f0f0f0)'
   */
  trailColor?: string;

  // ---------------------------------------------------------------------------
  // Display Options
  // ---------------------------------------------------------------------------

  /**
   * Whether to display the percentage text.
   * @default true
   */
  showInfo?: boolean;

  /**
   * Custom formatter for the percentage display.
   * Receives the current percent value and returns formatted content.
   * @param percent - Current progress percentage
   * @returns Formatted display content
   * @example (p) => `${p}% complete`
   */
  format?: (percent: number) => React.ReactNode;

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
  style?: React.CSSProperties;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Size preset mappings for line progress height.
 *
 * @internal
 */
const SIZE_MAP = {
  /** Compact progress bar (4px) */
  sm: 4,
  /** Standard progress bar (8px) - default */
  md: 8,
  /** Prominent progress bar (12px) */
  lg: 12,
};

// ============================================================================
// Component
// ============================================================================

/**
 * ProgressLine compound component.
 *
 * @description
 * Renders a horizontal progress bar with an optional percentage display.
 * Uses flexbox layout to align the bar and info text.
 *
 * @remarks
 * **Layout Structure:**
 * - Container: flex row with 8px gap
 * - Track: flex-1, rounded background
 * - Bar: percentage width, rounded fill
 * - Info: fixed-width percentage text
 *
 * **Animation:**
 * - Uses CSS transition on width
 * - Smooth 0.3s ease animation on percent changes
 *
 * **Accessibility:**
 * - Uses semantic HTML structure
 * - Percentage text provides visual feedback
 * - Color alone is not the only indicator
 *
 * @param props - {@link ProgressLineProps}
 * @param ref - Forwarded ref to the container div
 * @returns The rendered linear progress bar
 *
 * @example
 * ```tsx
 * <ProgressLine percent={50} size="lg" strokeColor="#52c41a" />
 * ```
 */
export const ProgressLine = forwardRef<HTMLDivElement, ProgressLineProps>(
  (props, ref) => {
    // ---------------------------------------------------------------------------
    // Props Destructuring
    // ---------------------------------------------------------------------------

    const {
      percent = 0,
      size = 'md',
      strokeColor = 'var(--ds-color-primary-500, #1890ff)',
      trailColor = 'var(--ds-color-neutral-200, #f0f0f0)',
      showInfo = true,
      format,
      className = '',
      style = {},
    } = props;

    // ---------------------------------------------------------------------------
    // Size Calculation
    // ---------------------------------------------------------------------------

    const height = SIZE_MAP[size];

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------

    return (
      <div
        ref={ref}
        data-part="root"
        className={`rottay-progress-line ${className}`}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', ...style }}
      >
        {/* Track Container */}
        <div
          data-part="track"
          style={{
            flex: 1,
            height,
            borderRadius: height / 2,
            backgroundColor: trailColor,
            overflow: 'hidden',
          }}
        >
          {/* Progress Bar Fill */}
          <div
            data-part="fill"
            style={{
              width: `${Math.min(100, Math.max(0, percent))}%`,
              height: '100%',
              borderRadius: height / 2,
              backgroundColor: strokeColor,
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        {/* Percentage Info */}
        {showInfo && (
          <span data-part="label" style={{ fontSize: '14px', minWidth: '40px', textAlign: 'right' }}>
            {format ? format(percent) : `${percent}%`}
          </span>
        )}
      </div>
    );
  }
);

// Set display name for React DevTools debugging
ProgressLine.displayName = 'Progress.Line';

export default ProgressLine;
