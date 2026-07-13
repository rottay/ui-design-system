/**
 * @fileoverview Progress Rustic Engine - Rottay Design System
 * @description Vanilla HTML/CSS implementation of the Progress component.
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
 * - SVG-based circle progress
 * - Animated stripe pattern for active status
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
 * - Progress colors adapt based on status
 * - All dimensions use inline styles for flexibility
 *
 * **Status Colors:**
 * | Status | Color |
 * |--------|-------|
 * | normal | #1890ff (blue) |
 * | success | #52c41a (green) |
 * | error | #ff4d4f (red) |
 * | active | #1890ff + animation |
 *
 * @example Basic Usage
 * ```tsx
 * import { Progress } from '@rottay/design-system';
 *
 * <Progress engine="rustic" percent={50} />
 * ```
 *
 * @example Circle Type
 * ```tsx
 * <Progress engine="rustic" percent={75} type="circle" />
 * ```
 *
 * @example With Custom Stroke Color
 * ```tsx
 * <Progress engine="rustic" percent={60} strokeColor="#8b5cf6" />
 * ```
 *
 * @see {@link ProgressProps} - Component props interface
 * @see {@link ClassicProgress} - Ant Design alternative
 * @see {@link ModernProgress} - DaisyUI alternative
 * @module Progress/Engines/Rustic
 * @category Feedback
 * @package @rottay/design-system
 */

import React from 'react';
import type { ProgressProps } from '../Progress.types';
import { PROGRESS_DEFAULTS } from '../Progress.types';

// ============================================================================
// Constants
// ============================================================================

// ============================================================================
// Component
// ============================================================================

/**
 * Rustic Engine implementation of the Progress component.
 *
 * @description
 * Pure vanilla implementation using only HTML, CSS, and React.
 * Provides complete control over styling through inline styles
 * and supports both line and circle progress types.
 *
 * @remarks
 * **Implementation Details:**
 * - Line type uses div-based track and bar
 * - Circle type uses SVG with stroke-dasharray
 * - Active status includes animated stripe pattern
 * - All styling done via inline styles for isolation
 *
 * **Circle Progress:**
 * - Uses SVG circles for track and progress
 * - Stroke-dasharray creates the progress arc
 * - Centered percentage text overlay
 * - Smooth CSS transitions on changes
 *
 * **Line Progress:**
 * - Track div with rounded corners
 * - Bar div with percentage width
 * - Active status adds striped gradient animation
 *
 * **Accessibility:**
 * - Semantic structure for screen readers
 * - Visual percentage display
 * - Color + pattern for active status
 *
 * @param props - {@link ProgressProps}
 * @returns The rendered vanilla Progress
 *
 * @example
 * ```tsx
 * <RusticProgress
 *   percent={75}
 *   type="circle"
 *   status="success"
 *   strokeWidth={10}
 * />
 * ```
 */
export default function RusticProgress(props: ProgressProps): React.ReactElement {
  // ---------------------------------------------------------------------------
  // Props Destructuring
  // ---------------------------------------------------------------------------

  const {
    percent,
    type = PROGRESS_DEFAULTS.type,
    status = PROGRESS_DEFAULTS.status,
    showInfo = PROGRESS_DEFAULTS.showInfo,
    strokeColor,
    strokeWidth = PROGRESS_DEFAULTS.strokeWidth,
    className,
    style,
  } = props;

  // ---------------------------------------------------------------------------
  // Derived Values
  // ---------------------------------------------------------------------------

  // Defensive clamping prevents visual overflow (bar exceeding track)
  // and negative values that would cause SVG rendering artifacts.
  const clampedPercent = Math.min(100, Math.max(0, percent));

  // ---------------------------------------------------------------------------
  // Circle Type Rendering
  // ---------------------------------------------------------------------------

  if (type === 'circle') {
    // SVG circle math: strokeDasharray = full circumference creates a
    // continuous stroke, then strokeDashoffset hides a portion to show
    // the progress arc. rotate(-90) starts the arc from 12 o'clock
    // (default SVG starts at 3 o'clock).
    const size = 120;
    const center = size / 2;
    const radius = (size - strokeWidth!) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (clampedPercent / 100) * circumference;

    // Container styles for circle type
    const containerStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      width: size,
      height: size,
      ...style,
      ...(strokeColor ? { '--ds-progress-arc-color': strokeColor } : {}),
    } as React.CSSProperties;

    return (
      <div
        data-part="root"
        data-status={status}
        className={['rottay-progress-shell', 'rottay-progress-shell--rustic', className].filter(Boolean).join(' ')}
        style={containerStyle}
      >
        {/* SVG Circle Container */}
        <svg width={size} height={size}>
          {/* Background Track Circle */}
          <circle
            data-part="track"
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--ds-progress-track-color, var(--ds-color-bg-secondary, var(--ds-color-neutral-100)))"
            strokeWidth={strokeWidth}
          />

          {/* strokeLinecap="round" gives the arc endpoints a rounded cap
              for a polished look. The 0.3s ease transition smoothly animates
              percent changes rather than jumping, providing visual feedback
              during incremental progress updates. */}
          <circle
            data-part="fill"
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
            style={{ transition: 'stroke-dashoffset 0.3s ease' }}
          />
        </svg>

        {/* Center Percentage Display */}
        {showInfo && (
          <div
            data-part="label"
            style={{
              position: 'absolute',
              fontSize: '1.5rem',
              fontWeight: 600,
            }}
          >
            {clampedPercent}%
          </div>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Line Type Rendering
  // ---------------------------------------------------------------------------

  // Container styles for line type. The strokeWidth-derived corner radius rides
  // a custom-property hatch consumed by the skin's track/bar rules; the optional
  // strokeColor override rides --ds-progress-arc-color (status color otherwise).
  const containerStyle: React.CSSProperties = {
    width: '100%',
    ...style,
    ...({
      '--ds-progress-bar-radius': `${strokeWidth! / 2}px`,
      ...(strokeColor ? { '--ds-progress-arc-color': strokeColor } : {}),
    } as React.CSSProperties),
  };

  // Track (background) styles
  const trackStyle: React.CSSProperties = {
    width: '100%',
    height: strokeWidth,
    overflow: 'hidden',
    position: 'relative',
  };

  // Active status uses a 45-degree striped gradient animation (barbershop pole
  // effect) to convey ongoing activity. This pattern provides motion cues
  // beyond color alone, benefiting users who may miss subtle color differences.
  // The semi-transparent white stripes (alpha-white-20) work on any bar color.
  const barStyle: React.CSSProperties = {
    height: '100%',
    width: `${clampedPercent}%`,
    transition: 'width 0.3s ease',
  };

  return (
    <div
      data-part="root"
      data-status={status}
      className={['rottay-progress-shell', 'rottay-progress-shell--rustic', className].filter(Boolean).join(' ')}
      style={containerStyle}
    >
      {/* Track with Progress Bar */}
      <div data-part="track" style={trackStyle}>
        <div data-part="fill" style={barStyle} />
      </div>

      {/* Percentage Info Display */}
      {showInfo && (
        <div data-part="label" style={{ marginTop: '0.25rem', fontSize: '0.875rem', textAlign: 'right' }}>
          {clampedPercent}%
        </div>
      )}
    </div>
  );
}
