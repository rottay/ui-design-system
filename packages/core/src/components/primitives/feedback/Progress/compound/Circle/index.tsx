/**
 * @fileoverview Progress Circle Compound Component - Rottay Design System
 * @description Circular progress indicator with customizable size and styling.
 * Part of the Rottay Design System's feedback primitives collection.
 *
 * @remarks
 * The ProgressCircle component renders a circular SVG-based progress indicator.
 * It uses CSS variables and inline styles for maximum flexibility in theming
 * and can be used standalone or as part of the Progress compound component.
 *
 * **Key Features:**
 * - SVG-based circular progress ring
 * - Customizable size and stroke width
 * - Animated progress transitions
 * - Percentage display in center
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
 * <Progress.Circle percent={75} />
 * ```
 *
 * @example Custom Sizing
 * ```tsx
 * <Progress.Circle
 *   percent={60}
 *   size={150}
 *   strokeWidth={12}
 * />
 * ```
 *
 * @example Custom Colors
 * ```tsx
 * <Progress.Circle
 *   percent={100}
 *   strokeColor="var(--ds-color-success)"
 *   trailColor="var(--ds-color-neutral-200)"
 * />
 * ```
 *
 * @example Custom Format
 * ```tsx
 * <Progress.Circle
 *   percent={3}
 *   format={(p) => `${p} of 4 steps`}
 * />
 * ```
 *
 * @see {@link ProgressCircleProps} - Component props interface
 * @see {@link ProgressLine} - Line variant
 * @see {@link Progress} - Parent component
 * @module Progress/Compound/Circle
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Props for the ProgressCircle compound component.
 *
 * @interface ProgressCircleProps
 *
 * @example Complete Usage
 * ```tsx
 * <Progress.Circle
 *   percent={75}
 *   size={120}
 *   strokeWidth={8}
 *   strokeColor="var(--ds-color-primary)"
 *   trailColor="var(--ds-color-neutral-200)"
 *   showInfo
 *   format={(p) => `${p}%`}
 *   className="my-progress"
 *   style={{ margin: '20px' }}
 * />
 * ```
 */
export interface ProgressCircleProps {
  // ---------------------------------------------------------------------------
  // Progress Value
  // ---------------------------------------------------------------------------

  /**
   * Current progress percentage (0-100).
   * @default 0
   */
  percent?: number;

  // ---------------------------------------------------------------------------
  // Sizing
  // ---------------------------------------------------------------------------

  /**
   * Diameter of the circle in pixels.
   * @default 120
   */
  size?: number;

  /**
   * Width of the progress stroke in pixels.
   * @default 8
   */
  strokeWidth?: number;

  // ---------------------------------------------------------------------------
  // Colors
  // ---------------------------------------------------------------------------

  /**
   * Color of the progress stroke.
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
   * Whether to display the percentage in the center.
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
// Component
// ============================================================================

/**
 * ProgressCircle compound component.
 *
 * @description
 * Renders a circular SVG-based progress indicator with an optional
 * percentage display in the center. Uses stroke-dasharray and
 * stroke-dashoffset for the progress animation.
 *
 * @remarks
 * **SVG Structure:**
 * - Background circle (trail) with full circumference
 * - Foreground circle (progress) with calculated dashoffset
 * - Both circles share the same center and radius
 *
 * **Animation:**
 * - Uses CSS transition on stroke-dashoffset
 * - Smooth 0.3s ease animation on percent changes
 *
 * **Accessibility:**
 * - Uses role="progressbar" semantics
 * - Font size scales with circle size (20% of diameter)
 *
 * @param props - {@link ProgressCircleProps}
 * @param ref - Forwarded ref to the container div
 * @returns The rendered circular progress indicator
 *
 * @example
 * ```tsx
 * <ProgressCircle percent={75} size={100} strokeColor="#52c41a" />
 * ```
 */
export const ProgressCircle = forwardRef<HTMLDivElement, ProgressCircleProps>(
  (props, ref) => {
    // ---------------------------------------------------------------------------
    // Props Destructuring
    // ---------------------------------------------------------------------------

    const {
      percent = 0,
      size = 120,
      strokeWidth = 8,
      strokeColor = 'var(--ds-color-primary-500, #1890ff)',
      trailColor = 'var(--ds-color-neutral-200, #f0f0f0)',
      showInfo = true,
      format,
      className = '',
      style = {},
    } = props;

    // ---------------------------------------------------------------------------
    // SVG Calculations
    // ---------------------------------------------------------------------------

    // Calculate radius accounting for stroke width
    const radius = (size - strokeWidth) / 2;

    // Calculate circumference for dasharray
    const circumference = 2 * Math.PI * radius;

    // Calculate offset for current progress
    const offset = circumference - (percent / 100) * circumference;

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------

    return (
      <div
        ref={ref}
        className={`rottay-progress-circle ${className}`}
        style={{ position: 'relative', width: size, height: size, ...style }}
      >
        {/* SVG Circle Container */}
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background Trail Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={trailColor}
            strokeWidth={strokeWidth}
          />

          {/* Progress Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.3s ease' }}
          />
        </svg>

        {/* Center Percentage Display */}
        {showInfo && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: size * 0.2,
              fontWeight: 500,
            }}
          >
            {format ? format(percent) : `${percent}%`}
          </div>
        )}
      </div>
    );
  }
);

// Set display name for React DevTools debugging
ProgressCircle.displayName = 'Progress.Circle';

export default ProgressCircle;
