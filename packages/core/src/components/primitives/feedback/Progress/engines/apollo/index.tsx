/**
 * @fileoverview Progress Apollo Engine - Rottay Design System
 * @description Vanilla HTML/CSS implementation of the Progress component.
 * A zero-dependency engine for maximum accessibility and control.
 *
 * @remarks
 * **Engine Overview:**
 * Apollo is the headless, zero-dependency engine that uses only vanilla
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
 * **When to Use Apollo:**
 * - When bundle size is critical
 * - For accessibility-focused applications
 * - When full styling control is needed
 * - For custom design systems built on Rottay
 * - When avoiding third-party UI libraries
 *
 * **Multi-Tenant Theming:**
 * Apollo uses CSS custom properties for theming:
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
 * <Progress engine="apollo" percent={50} />
 * ```
 *
 * @example Circle Type
 * ```tsx
 * <Progress engine="apollo" percent={75} type="circle" />
 * ```
 *
 * @example With Custom Stroke Color
 * ```tsx
 * <Progress engine="apollo" percent={60} strokeColor="#8b5cf6" />
 * ```
 *
 * @see {@link ProgressProps} - Component props interface
 * @see {@link TitanProgress} - Ant Design alternative
 * @see {@link HermesProgress} - DaisyUI alternative
 * @module Progress/Engines/Apollo
 * @category Feedback
 * @package @rottay/design-system
 */

import React from 'react';
import type { ProgressProps, ProgressStatus } from '../../types';
import { PROGRESS_DEFAULTS } from '../../types';

// ============================================================================
// Constants
// ============================================================================

/**
 * Status to color mappings.
 * Maps Rottay status values to hex colors for vanilla styling.
 *
 * @internal
 */
const STATUS_COLORS: Record<ProgressStatus, string> = {
  /** Normal state - primary blue */
  normal: '#1890ff',
  /** Success state - green */
  success: '#52c41a',
  /** Error state - red */
  error: '#ff4d4f',
  /** Active state - primary blue (with animation) */
  active: '#1890ff',
};

// ============================================================================
// Component
// ============================================================================

/**
 * Apollo Engine implementation of the Progress component.
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
 * <ApolloProgress
 *   percent={75}
 *   type="circle"
 *   status="success"
 *   strokeWidth={10}
 * />
 * ```
 */
export default function ApolloProgress(props: ProgressProps): React.ReactElement {
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

  // Determine color from status or custom strokeColor
  const color = strokeColor || STATUS_COLORS[status!];

  // Clamp percent to valid range
  const clampedPercent = Math.min(100, Math.max(0, percent));

  // ---------------------------------------------------------------------------
  // Circle Type Rendering
  // ---------------------------------------------------------------------------

  if (type === 'circle') {
    // Circle dimensions
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
    };

    return (
      <div className={className} style={containerStyle}>
        {/* SVG Circle Container */}
        <svg width={size} height={size}>
          {/* Background Track Circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#f0f0f0"
            strokeWidth={strokeWidth}
          />

          {/* Progress Circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
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
            style={{
              position: 'absolute',
              fontSize: '1.5rem',
              fontWeight: 600,
              color: color,
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

  // Container styles for line type
  const containerStyle: React.CSSProperties = {
    width: '100%',
    ...style,
  };

  // Track (background) styles
  const trackStyle: React.CSSProperties = {
    width: '100%',
    height: strokeWidth,
    backgroundColor: '#f0f0f0',
    borderRadius: strokeWidth! / 2,
    overflow: 'hidden',
    position: 'relative',
  };

  // Progress bar styles with optional animation for active status
  const barStyle: React.CSSProperties = {
    height: '100%',
    width: `${clampedPercent}%`,
    backgroundColor: color,
    borderRadius: strokeWidth! / 2,
    transition: 'width 0.3s ease',
    ...(status === 'active' ? {
      backgroundImage: `linear-gradient(
        45deg,
        rgba(255, 255, 255, 0.15) 25%,
        transparent 25%,
        transparent 50%,
        rgba(255, 255, 255, 0.15) 50%,
        rgba(255, 255, 255, 0.15) 75%,
        transparent 75%,
        transparent
      )`,
      backgroundSize: '1rem 1rem',
      animation: 'apollo-progress-active 1s linear infinite',
    } : {}),
  };

  return (
    <div className={className} style={containerStyle}>
      {/* Keyframes for active animation - injected as style tag */}
      {status === 'active' && (
        <style>{`
          @keyframes apollo-progress-active {
            0% { background-position: 0 0; }
            100% { background-position: 1rem 0; }
          }
        `}</style>
      )}

      {/* Track with Progress Bar */}
      <div style={trackStyle}>
        <div style={barStyle} />
      </div>

      {/* Percentage Info Display */}
      {showInfo && (
        <div style={{ marginTop: '0.25rem', fontSize: '0.875rem', textAlign: 'right' }}>
          {clampedPercent}%
        </div>
      )}
    </div>
  );
}
