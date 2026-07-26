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
import type { SpinnerProps } from '../../contracts';
import { SPINNER_DEFAULTS } from '../../contracts';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

// ============================================================================
// Size Mapping
// ============================================================================

/**
 * Maps Rottay size variants to DS token dimensions and border widths.
 * Dimension uses --ds-spinner-*-size tokens with pixel fallbacks.
 */
const SIZE_MAP: Record<string, { dimension: string; ringWidth: number }> = {
  sm: { dimension: 'var(--ds-spinner-sm-size, 20px)', ringWidth: 2 },
  md: { dimension: 'var(--ds-spinner-md-size, 24px)', ringWidth: 2 },
  lg: { dimension: 'var(--ds-spinner-lg-size, 32px)', ringWidth: 3 },
  xl: { dimension: 'var(--ds-spinner-xl-size, 40px)', ringWidth: 3 },
};

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
  // Optional + English floor: the primitive must also render when composed
  // bare (no I18nProvider above it, e.g. direct engine renders in tests and
  // lightweight consumers) — a hard provider requirement would crash those
  // compositions. Idiom matches Rate/ListToolbar modern.
  const i18n = useOptionalTranslation('common');
  const resolved = i18n?.t('loading');
  const loadingLabel = resolved && resolved !== 'loading' && resolved !== 'common.loading'
    ? resolved
    : 'Loading';
  const {
    size = SPINNER_DEFAULTS.size,
    label,
    className = '',
    style,
  } = props;

  const sizeConfig = SIZE_MAP[size!] || SIZE_MAP.md;
  // P-79 caller-wins: a pattern composing the Spinner as one named part of
  // its own anatomy (loading branches stamp `spinner`) overrides the
  // default `root` stamp; standalone usage keeps `root`.
  const dataPart = props['data-part'];

  // ============================================================================
  // Render
  // ============================================================================

  // Layout (column stack, token gap) lives in the unlayered modern skin; the
  // engine keeps only prop-driven geometry/cadence hatches inline. The spin
  // cadence rides --ds-motion-slow, which the motion authority zeroes under
  // reduced motion -- the ring then rests as a calm static arc.
  return (
    <div
      data-part={dataPart ?? 'root'}
      className={['rottay-spinner', 'rottay-spinner--modern', className].filter(Boolean).join(' ')}
      style={style}
    >
      <span
        data-part="indicator"
        style={{
          display: 'inline-block',
          width: sizeConfig.dimension,
          height: sizeConfig.dimension,
          '--ds-spinner-ring-width': `${sizeConfig.ringWidth}px`,
          animation: `ds-spinner-modern-spin var(--ds-motion-slow) linear infinite`,
        } as React.CSSProperties}
        role="status"
        aria-label={label || loadingLabel}
      />
      {label && (
        <span data-part="label" style={{ fontSize: 'var(--ds-font-size-sm, 14px)' }}>{label}</span>
      )}
    </div>
  );
}
