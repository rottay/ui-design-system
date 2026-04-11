/**
 * @fileoverview Spinner Modern Engine - Rottay Design System
 * @description CSS border-based spinner using DS tokens and inline styles.
 * No DaisyUI dependency -- uses a CSS keyframe animation injected at render
 * time and DS color tokens for theming.
 *
 * @remarks
 * The Modern engine uses a pure-CSS border spinner approach:
 * - Zero DaisyUI dependency
 * - DS token colors (--ds-color-border, --ds-color-primary)
 * - Inline styles for deterministic rendering
 * - Injected @keyframes for the spin animation
 *
 * Size mapping (pixel dimensions):
 * - `sm` -> 16px
 * - `md` -> 24px
 * - `lg` -> 32px
 * - `xl` -> 40px
 *
 * @example
 * ```tsx
 * import { Spinner } from '@rottay/design-system';
 *
 * // Modern engine for Tailwind projects
 * <Spinner engine="modern" size="lg" label="Loading..." />
 * ```
 *
 * @module Spinner/Engines/Modern
 * @category Feedback
 * @package @rottay/design-system
 */

import React from 'react';
import type { SpinnerProps } from '../Spinner.types';
import { SPINNER_DEFAULTS } from '../Spinner.types';

// ============================================================================
// Size Mapping
// ============================================================================

/**
 * Maps Rottay size variants to DS token dimensions and border widths.
 * Dimension uses --ds-spinner-*-size tokens with pixel fallbacks.
 */
const SIZE_MAP: Record<string, { dimension: string; borderWidth: number }> = {
  sm: { dimension: 'var(--ds-spinner-sm-size, 16px)', borderWidth: 2 },
  md: { dimension: 'var(--ds-spinner-md-size, 24px)', borderWidth: 2 },
  lg: { dimension: 'var(--ds-spinner-lg-size, 32px)', borderWidth: 3 },
  xl: { dimension: 'var(--ds-spinner-xl-size, 40px)', borderWidth: 3 },
};

/** Keyframes injected once per render tree via <style> tag */
const SPIN_KEYFRAMES = '@keyframes rottay-ds-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}';

// ============================================================================
// Modern Engine Implementation
// ============================================================================

/**
 * Modern implementation of the Spinner component.
 *
 * @description
 * Renders a CSS border-based spinner using DS tokens for colors and
 * inline styles for layout. A <style> block injects the spin keyframe.
 *
 * @param props - {@link SpinnerProps} Component properties
 * @returns React element with a pure-CSS spinner
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

  const sizeConfig = SIZE_MAP[size!] || SIZE_MAP.md;

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div
      className={className || undefined}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        ...style,
      }}
    >
      {/* Inject spin keyframes -- safe static string, no user input */}
      <style dangerouslySetInnerHTML={{ __html: SPIN_KEYFRAMES }} />
      <span
        style={{
          display: 'inline-block',
          width: sizeConfig.dimension,
          height: sizeConfig.dimension,
          border: `${sizeConfig.borderWidth}px solid var(--ds-color-border)`,
          borderTopColor: 'var(--ds-color-primary)',
          borderRadius: '50%',
          animation: `rottay-ds-spin var(--ds-motion-slow, 0.6s) linear infinite`,
        }}
        role="status"
        aria-label={label || 'Loading'}
      />
      {label && (
        <span style={{ fontSize: 'var(--ds-font-size-sm, 14px)', color: 'var(--ds-color-text-secondary)' }}>{label}</span>
      )}
    </div>
  );
}
