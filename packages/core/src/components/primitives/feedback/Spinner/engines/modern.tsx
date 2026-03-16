/**
 * @fileoverview Spinner Modern Engine - Rottay Design System
 * @description DaisyUI/Tailwind CSS implementation of the Spinner component.
 * Uses DaisyUI's loading component classes for utility-first styling.
 *
 * @remarks
 * The Modern engine leverages DaisyUI's loading utilities, providing:
 * - Lightweight, utility-first CSS approach
 * - Tailwind CSS integration for easy customization
 * - DaisyUI's built-in loading animations
 * - Minimal bundle size impact
 *
 * Size mapping from Rottay to DaisyUI:
 * - `sm` -> `loading-sm`
 * - `md` -> `loading-md`
 * - `lg` -> `loading-lg`
 * - `xl` -> `loading-lg` (DaisyUI maximum)
 *
 * @example
 * ```tsx
 * import { Spinner } from '@rottay/design-system';
 *
 * // Modern engine for Tailwind projects
 * <Spinner engine="modern" size="lg" label="Loading..." />
 * ```
 *
 * @see {@link https://daisyui.com/components/loading/} DaisyUI Loading documentation
 *
 * @module Spinner/Engines/Modern
 * @category Feedback
 * @package @rottay/design-system
 */

import React from 'react';
import type { SpinnerProps } from '../Spinner.types';
import { SPINNER_DEFAULTS } from '../Spinner.types';

// ============================================================================
// Size Class Mapping
// ============================================================================

/**
 * Maps Rottay size variants to DaisyUI loading size classes.
 *
 * @remarks
 * DaisyUI doesn't have an 'xl' size, so we map it to 'lg'.
 */
const SIZE_CLASSES = {
  sm: 'loading-sm',
  md: 'loading-md',
  lg: 'loading-lg',
  xl: 'loading-lg', // DaisyUI doesn't have xl, use lg
};

// ============================================================================
// Modern Engine Implementation
// ============================================================================

/**
 * Modern (DaisyUI) implementation of the Spinner component.
 *
 * @description
 * Renders a spinner using DaisyUI's loading component classes with
 * Tailwind CSS utilities for layout and spacing.
 *
 * @param props - {@link SpinnerProps} Component properties
 * @returns React element with DaisyUI loading classes
 *
 * @example
 * ```tsx
 * <ModernSpinner size="lg" label="Processing..." />
 * ```
 */
export default function ModernSpinner(props: SpinnerProps): React.ReactElement {
  const {
    size = SPINNER_DEFAULTS.size,
    label,
    className = '',
    style,
  } = props;

  // ============================================================================
  // Render
  // ============================================================================

  // DaisyUI's `loading loading-spinner` classes produce a CSS-only rotating
  // spinner. The size class controls both width and height via DaisyUI tokens.
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`} style={style}>
      <span className={`loading loading-spinner ${SIZE_CLASSES[size!]}`}></span>
      {/* Label is text-sm to maintain visual hierarchy below the spinner */}
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}
