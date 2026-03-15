/**
 * @fileoverview Spinner Rustic Engine - Rottay Design System
 * @description Pure HTML/CSS implementation of the Spinner component.
 * Uses CSS keyframe animations for a zero-dependency loading indicator.
 *
 * @remarks
 * The Rustic engine provides a lightweight, vanilla implementation:
 * - Zero external dependencies
 * - Pure CSS animations with keyframes
 * - Full customization via CSS variables
 * - Maximum accessibility and performance
 * - Works in any environment without framework requirements
 *
 * The spinner uses a circular border animation with configurable:
 * - Size via CSS variables (--ds-spinner-{size}-size)
 * - Stroke width via --ds-spinner-stroke-width
 * - Color via the color prop or CSS variables
 * - Animation speed (0.8s default rotation)
 *
 * @example
 * ```tsx
 * import { Spinner } from '@rottay/design-system';
 *
 * // Rustic engine for vanilla/headless projects
 * <Spinner engine="rustic" size="lg" color="#1890ff" label="Loading..." />
 * ```
 *
 * @module Spinner/Engines/Rustic
 * @category Feedback
 * @package @rottay/design-system
 */

import React from 'react';
import type { SpinnerProps } from '../../types';
import { SPINNER_DEFAULTS, SIZE_MAP } from '../../types';

// ============================================================================
// Rustic Engine Implementation
// ============================================================================

/**
 * Rustic (Pure HTML/CSS) implementation of the Spinner component.
 *
 * @description
 * Renders a spinner using pure CSS with keyframe animations.
 * The spinner is created using a circular border with a colored top
 * that rotates infinitely.
 *
 * @param props - {@link SpinnerProps} Component properties
 * @returns React element with CSS-animated spinner
 *
 * @example
 * ```tsx
 * <RusticSpinner size="lg" color="#8b5cf6" label="Processing..." />
 * ```
 */
export default function RusticSpinner(props: SpinnerProps): React.ReactElement {
  const {
    size = SPINNER_DEFAULTS.size,
    color,
    label,
    className,
    style,
  } = props;

  // Use provided color or fallback to CSS variable
  const spinnerColor = color || 'var(--ds-spinner-color, var(--ds-color-primary-500, #1890ff))';

  // ============================================================================
  // Styles
  // ============================================================================

  /** Resolve size from CSS variable map */
  const spinnerSize = SIZE_MAP[size!];

  /** Spinner circle styles with animation */
  const spinnerStyle: React.CSSProperties = {
    width: spinnerSize,
    height: spinnerSize,
    border: 'var(--ds-spinner-stroke-width, 2px) solid var(--ds-spinner-track-color, rgba(0, 0, 0, 0.1))',
    borderTopColor: spinnerColor,
    borderRadius: '50%',
    animation: 'rustic-spin var(--ds-spinner-duration, 0.8s) linear infinite',
  };

  /** Container styles for centering and spacing */
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    ...style,
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className={className} style={containerStyle}>
      {/* Keyframe animation definition */}
      <style>{`
        @keyframes rustic-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      {/* Animated spinner circle */}
      <div style={spinnerStyle} />
      {/* Optional label text */}
      {label && <div style={{ fontSize: 'var(--ds-spinner-label-size, 0.875rem)', color: 'var(--ds-spinner-label-color, inherit)' }}>{label}</div>}
    </div>
  );
}
