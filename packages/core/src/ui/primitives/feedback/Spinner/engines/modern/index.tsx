/**
 * @fileoverview Spinner Modern Engine - Rottay Design System
 * @description CSS border-based spinner. All paint — ring geometry per size,
 * track/segment colors, spin cadence, label typography — is owned by the
 * unlayered modern skin; the engine stamps anatomy (`data-part`), the
 * `data-size` contract and the accessible status semantics.
 *
 * @remarks
 * The Modern engine uses a pure-CSS border spinner approach:
 * - Zero DaisyUI dependency
 * - DS token colors (--ds-color-border, --ds-color-primary)
 * - Skin-owned geometry: `data-size` selects the ring diameter/stroke
 * - The spin rides --ds-motion-slow, zeroed by the motion authority under
 *   reduced motion (the ring rests as a static arc)
 *
 * Size mapping (diameter / stroke, skin-owned):
 * - `sm` -> 20px / 2px
 * - `md` -> 24px / 2px
 * - `lg` -> 32px / 3px
 * - `xl` -> 40px / 3px
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
import { LoadingIndicator } from '../../../../foundation/loading-indicator';

// ============================================================================
// Modern Engine Implementation
// ============================================================================

/**
 * Modern implementation of the Spinner component.
 *
 * @description
 * Renders a CSS border-based spinner whose entire paint — ring geometry per
 * `data-size`, track/segment colors, spin cadence and label typography —
 * lives in the unlayered modern skin (`skin/spinner.css`). The engine stamps
 * only anatomy and semantics.
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
  const loadingLabel = i18n?.tOr('loading', 'Loading') ?? 'Loading';
  const {
    size = SPINNER_DEFAULTS.size,
    color,
    label,
    className = '',
    style,
    children,
  } = props;

  return (
    <LoadingIndicator
      data-part={props['data-part']}
      size={size}
      color={color}
      label={label}
      statusLabel={label || loadingLabel}
      className={className}
      style={style}
    >
      {children}
    </LoadingIndicator>
  );
}
