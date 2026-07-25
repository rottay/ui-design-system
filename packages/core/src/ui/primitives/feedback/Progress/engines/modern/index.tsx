/**
 * @fileoverview Progress Modern Engine - Rottay Design System
 * @description Token-driven implementation of the Progress component.
 * All paint lives in the unlayered modern skin
 * (`foundation/tokens/css/runtime/engines/modern/skin/progress.css`) -- no
 * DaisyUI classes remain on this tree (`progress`, `progress-primary`,
 * `progress-success`, `progress-error` and `radial-progress` were drained in
 * the K1 Lane C pass, decrementing `daisy.classConsumers`).
 *
 * @remarks
 * **Engine Overview:**
 * Modern is the utility-first engine whose geometry is bounded inline hatches
 * and whose paint is the token-driven skin. It provides a smaller bundle size
 * compared to Classic while keeping full status/indeterminate coverage.
 *
 * **Key Features:**
 * - Native `<progress>` element for the determinate line type
 * - Skin-owned conic-gradient ring for the circle type (no SVG, no DaisyUI)
 * - Indeterminate mode on both types, cadence from the motion authority
 *   (canon `ds-foundation-progress-indeterminate` / `ds-foundation-spin`
 *   keyframes riding `--ds-motion-*` durations; collapses under reduced motion)
 * - DS token inline hatches for geometry only (--ds-progress-circle-*,
 *   --ds-progress-arc-color)
 *
 * **Multi-Tenant Theming:**
 * Status color resolves through governed tokens:
 * - `--ds-color-primary`: normal / active
 * - `--ds-color-success`: success
 * - `--ds-color-error`: error
 * The `strokeColor` prop overrides through the `--ds-progress-arc-color`
 * hatch (accepts any CSS color/gradient, unlike the drained DaisyUI arc
 * which was limited to `currentColor`).
 *
 * @example Basic Usage
 * ```tsx
 * import { Progress } from '@rottay/design-system';
 *
 * <Progress engine="modern" percent={50} />
 * ```
 *
 * @example Circle Type
 * ```tsx
 * <Progress engine="modern" percent={60} type="circle" />
 * ```
 *
 * @example Indeterminate
 * ```tsx
 * <Progress engine="modern" indeterminate />
 * <Progress engine="modern" indeterminate type="circle" />
 * ```
 *
 * @see {@link ProgressProps} - Component props interface
 * @see {@link ClassicProgress} - Ant Design alternative
 * @see {@link RusticProgress} - Vanilla alternative
 * @module Progress/Engines/Modern
 * @category Feedback
 * @package @rottay/design-system
 */

import React from 'react';
import type { ProgressProps } from '../../contracts';
import { PROGRESS_DEFAULTS, TONE_TO_PROGRESS_STATUS } from '../../contracts';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

// ============================================================================
// Component
// ============================================================================

/**
 * Modern Engine implementation of the Progress component.
 *
 * @description
 * Token-driven progress: native `<progress>` for the line type, a
 * skin-painted conic ring for the circle type. Provides a lightweight
 * alternative to Ant Design with no DaisyUI dependency.
 *
 * @remarks
 * **Implementation Details:**
 * - `percent` is clamped to 0..100 (parity with the rustic engine; the
 *   drained DaisyUI arc silently over-rotated past 100).
 * - `data-type` ('line' | 'circle'), `data-status` and `data-indeterminate`
 *   select the skin rules; geometry rides `--ds-progress-*` inline hatches.
 * - Circle: single root div (the data-part contract proves no track/fill
 *   nodes), arc painted by the skin's `::before`/`::after`.
 * - Line indeterminate: the native element renders without `value` (correct
 *   ARIA indeterminate semantics) while a sibling `[data-part='indeterminate']`
 *   bar carries the canon sliding animation in the same grid area.
 *
 * **Accessibility:**
 * - Circle root carries `role="progressbar"` with aria-valuemin/max and,
 *   when determinate, aria-valuenow (omitted when indeterminate, per WAI-ARIA).
 * - Line uses the native element's built-in progressbar semantics.
 *
 * @param props - {@link ProgressProps}
 * @returns The rendered token-driven Progress
 *
 * @example
 * ```tsx
 * <ModernProgress
 *   percent={75}
 *   type="line"
 *   status="success"
 * />
 * ```
 */
export default function ModernProgress(props: ProgressProps): React.ReactElement {
  // Optional so standalone renders (no I18nProvider mounted, e.g. direct
  // engine renders in tests/Storybook isolation) fall back to the documented
  // English accessibility strings instead of throwing.
  const i18n = useOptionalTranslation('components');
  // ---------------------------------------------------------------------------
  // Props Destructuring
  // ---------------------------------------------------------------------------

  const {
    percent,
    type = PROGRESS_DEFAULTS.type,
    status = PROGRESS_DEFAULTS.status,
    tone,
    showInfo = PROGRESS_DEFAULTS.showInfo,
    indeterminate = PROGRESS_DEFAULTS.indeterminate,
    strokeColor,
    className = '',
    style,
  } = props;

  // `tone` takes precedence over `status`'s color implication when both are given.
  const resolvedStatus = tone ? TONE_TO_PROGRESS_STATUS[tone] : status;

  // Defensive clamping prevents visual overflow (arc over-rotation, bar
  // exceeding the track) -- mirrors the rustic engine's guard.
  const clampedPercent = Math.min(100, Math.max(0, percent));

  // strokeColor override rides the shared --ds-progress-arc-color hatch; the
  // skin falls back to the status token when the hatch is absent. Custom
  // property hatches use the Badge-family CSSProperties idiom so the
  // registered @property channels typecheck without an `unknown` escape.
  type ProgressArcStyle = React.CSSProperties &
    Record<'--ds-progress-arc-color', string>;
  const arcOverride: ProgressArcStyle | undefined = strokeColor
    ? { '--ds-progress-arc-color': strokeColor }
    : undefined;

  // ---------------------------------------------------------------------------
  // Circle Type Rendering
  // ---------------------------------------------------------------------------

  if (type === 'circle') {
    type ProgressCircleStyle = React.CSSProperties &
      Partial<
        Record<
          | '--ds-progress-arc-color'
          | '--ds-progress-circle-value'
          | '--ds-progress-circle-thickness',
          string | number
        >
      >;
    const circleStyle: ProgressCircleStyle = {
      '--ds-progress-circle-value': indeterminate ? 25 : clampedPercent,
      ...style,
      ...arcOverride,
    };
    // Honor an explicit strokeWidth as ring thickness; when only the default
    // applies, the skin keeps the legacy size/10 geometry. The diameter
    // itself rides the public --ds-progress-circle-size hatch (skin-side
    // 6rem fallback), so a tenant can size every circle from one token.
    if (props.strokeWidth != null) {
      circleStyle['--ds-progress-circle-thickness'] = `${props.strokeWidth}px`;
    }

    // role="progressbar" provides semantic accessibility information: the
    // skin-painted conic ring is a styled div, so the ARIA role is necessary
    // for screen readers to interpret it as a progress indicator rather than
    // generic content. aria-valuenow is omitted when indeterminate (WAI-ARIA).
    // The circle gets an explicit localized accessible name (the native line
    // <progress> has built-in value text naming; a styled div does not) --
    // determinates include the clamped percent (axe aria-progressbar-name).
    return (
      <div
        data-part="root"
        data-type="circle"
        data-status={resolvedStatus}
        data-indeterminate={indeterminate ? 'true' : 'false'}
        className={`rottay-progress-shell rottay-progress-shell--modern ${className}`}
        style={circleStyle}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={
          indeterminate
            ? i18n?.t('progress.indeterminate') ?? 'In progress'
            : i18n?.t('progress.percent_complete', { percent: clampedPercent }) ??
              `${clampedPercent}% complete`
        }
        {...(indeterminate ? {} : { 'aria-valuenow': clampedPercent })}
      >
        {showInfo && !indeterminate && (
          <span data-part="label">{`${clampedPercent}%`}</span>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Line Type Rendering
  // ---------------------------------------------------------------------------

  return (
    <div
      data-part="root"
      data-type="line"
      data-status={resolvedStatus}
      data-indeterminate={indeterminate ? 'true' : 'false'}
      className={`w-full rottay-progress-shell rottay-progress-shell--modern ${className}`}
      style={style}
    >
      {/* Native <progress> element provides built-in accessibility (no ARIA
          needed) and works with browser defaults when CSS fails to load.
          The `value` attribute is omitted when indeterminate, which is the
          native indeterminate state for assistive technologies. */}
      <progress
        data-part="fill"
        className="w-full"
        {...(indeterminate ? {} : { value: clampedPercent })}
        max="100"
        style={arcOverride}
      />

      {/* Indeterminate sliding bar: canon keyframe + motion-authority cadence,
          painted by the skin in the same grid area as the track. */}
      {indeterminate && <span data-part="indeterminate" aria-hidden="true" />}

      {/* Percentage info display (determinate only; an indeterminate meter
          has no value to report). Typography/alignment live in the skin. */}
      {showInfo && !indeterminate && (
        <div data-part="label">{clampedPercent}%</div>
      )}
    </div>
  );
}
