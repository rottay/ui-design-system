'use client';

/**
 * @fileoverview Steps Modern Engine - Rottay Design System
 * @description Token-driven implementation of the Steps component.
 *
 * @remarks
 * The engine stamps anatomy (`data-part` hooks) and step state
 * (`data-status`, `aria-current="step"`); the modern skin
 * (`modern/skin/steps.css`) owns 100% of layout and paint — INCLUDING the
 * step circle and the connector, which are skin pseudo-elements keyed on
 * `data-part`/`data-status`, never DaisyUI `.step::before/::after` hooks.
 * No DaisyUI classes, no Tailwind utilities, no inline style objects.
 *
 * Contract notes:
 * - Steps render as an ordered list; the step at `current` carries
 *   `aria-current="step"`.
 * - Clickable steps (`onChange` + not disabled) render a real `<button>`
 *   trigger inside the item — keyboard-reachable by construction.
 * - `progressDot` supports both the boolean dot mode and the custom render
 *   function (`data-part="dot-slot"`), matching the rustic engine's contract.
 *
 * Phase-B Pass 2 (batch-33):
 * - `labelPlacement` rides `data-label-placement` on the root (the contract
 *   default is 'horizontal': indicator-beside-text; 'vertical' keeps the
 *   stacked geometry Pass 1 shipped).
 * - `initial` is honored: without a controlled `current` the component
 *   tracks its own position and `onChange` advances it (the contract
 *   documents the uncontrolled mode; Pass 1 silently ignored `initial`).
 * - A custom item icon now anchors the indicator cell as a direct item
 *   child (`data-part="icon"`); the skin seats it inside the status circle
 *   frame and suppresses the numeral via `:has()` — status stays expressed
 *   by the circle frame/ring, never by icon hue alone.
 * - `percent` is NOT implementable in this engine: the modern-engine
 *   contract pins `style.cssText === ''` on every part, so no inline data
 *   channel can carry the numeric value; documented as batch-33 debt.
 * - `type` ('navigation' | 'inline') is a visual recipe axis with no
 *   governed frame grammar in this wave; documented as debt, not invented.
 * - `responsive` (contract default true) is absorbed by the skin's
 *   container query: a horizontal track collapses to the vertical geometry
 *   at 420px unconditionally — matching the contract default.
 *
 * @example
 * ```tsx
 * <Steps
 *   engine="modern"
 *   items={[
 *     { title: 'Step 1', description: 'First step' },
 *     { title: 'Step 2', description: 'Second step' },
 *   ]}
 *   current={0}
 * />
 * ```
 *
 * @see {@link StepsProps} for prop documentation
 *
 * @module Steps/Engines/Modern
 * @category Navigation
 * @package @rottay/design-system
 */

import React, { useMemo, useState } from 'react';
import type { StepsProps, StepStatus, ProgressDotInfo } from '../../contracts';
import { STEPS_DEFAULTS } from '../../contracts';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculates the effective status for a step based on its position.
 *
 * @param index - Step index
 * @param current - Current active step
 * @param itemStatus - Optional explicit status for the step
 * @param overallStatus - Overall status applied to current step
 * @returns The effective status to display
 */
const getEffectiveStatus = (
  index: number,
  current: number,
  itemStatus?: StepStatus,
  overallStatus?: StepStatus
): StepStatus => {
  // Explicit status takes precedence
  if (itemStatus) return itemStatus;
  // Steps before current are finished
  if (index < current) return 'finish';
  // Current step uses overall status
  if (index === current) return overallStatus ?? 'process';
  // Future steps are waiting
  return 'wait';
};

// ============================================================================
// Modern Engine Component
// ============================================================================

/**
 * Steps component - Modern Engine (token-driven, skin-painted).
 *
 * @description
 * Self-contained anatomy: root (`data-direction`, `data-size`,
 * `data-progress-dot`), items (`data-part="item"` + `data-status`), an
 * optional icon slot, a text column (label/subtitle/description), and a
 * `<button data-part="trigger">` when the step is clickable.
 *
 * @param props - {@link StepsProps}
 * @returns Steps component rendered for the modern skin
 */
export const Steps = React.forwardRef<HTMLOListElement, StepsProps>(
  (props, ref) => {
    // ========================================================================
    // Props Destructuring with Defaults
    // ========================================================================

    const {
      current,
      direction = STEPS_DEFAULTS.direction,
      size = STEPS_DEFAULTS.size,
      status: overallStatus = STEPS_DEFAULTS.status,
      labelPlacement = STEPS_DEFAULTS.labelPlacement,
      initial = STEPS_DEFAULTS.initial,
      progressDot,
      onChange,
      items,
      className = '',
      style,
    } = props;

    // ========================================================================
    // State Management
    // ========================================================================

    /**
     * Uncontrolled position: only used when `current` is not provided (the
     * contract's documented uncontrolled mode, seeded by `initial`).
     */
    const [internalCurrent, setInternalCurrent] = useState(initial ?? 0);

    /** Resolved position — controlled `current` wins when provided. */
    const activeCurrent = current ?? internalCurrent;

    // ========================================================================
    // Memoized Step Computation
    // ========================================================================

    /**
     * Compute effective status for each step. Memoized because this runs on
     * every render and the items array may be large; only recomputes when
     * items, current position, or overall status change.
     */
    const computedSteps = useMemo(() => {
      return items.map((item, index) => {
        const effectiveStatus = getEffectiveStatus(index, activeCurrent, item.status, overallStatus);
        return { ...item, effectiveStatus };
      });
    }, [items, activeCurrent, overallStatus]);

    // ========================================================================
    // Event Handlers
    // ========================================================================

    /**
     * Handle step click for navigation.
     * Only triggers onChange if step is not disabled; advances the internal
     * position when running uncontrolled.
     */
    const handleStepClick = (index: number, disabled?: boolean) => {
      if (disabled || !onChange) return;
      if (current === undefined) {
        setInternalCurrent(index);
      }
      onChange(index);
    };

    // ========================================================================
    // Render
    // ========================================================================

    return (
      <ol
        ref={ref}
        className={`rottay-steps rottay-steps--modern ${className}`.trim()}
        style={style}
        data-part="root"
        data-direction={direction}
        data-size={size}
        data-label-placement={labelPlacement}
        data-progress-dot={progressDot ? 'true' : undefined}
      >
        {computedSteps.map((step, index) => {
          const isClickable = !step.disabled && Boolean(onChange);

          const text = (
            <>
              <span data-part="label">{step.title}</span>
              {step.subTitle && <span data-part="subtitle">{step.subTitle}</span>}
              {step.description && <span data-part="description">{step.description}</span>}
            </>
          );

          return (
            <li
              key={index}
              data-part="item"
              data-status={step.effectiveStatus}
              data-disabled={step.disabled || undefined}
              data-clickable={isClickable || undefined}
              aria-current={step.effectiveStatus === 'process' ? 'step' : undefined}
            >
              {step.icon && !progressDot && <span data-part="icon">{step.icon}</span>}
              {typeof progressDot === 'function' && (
                <span data-part="dot-slot">
                  {progressDot({
                    index,
                    status: step.effectiveStatus,
                    title: step.title ?? '',
                    description: step.description ?? '',
                  } satisfies ProgressDotInfo)}
                </span>
              )}
              {isClickable ? (
                <button
                  type="button"
                  data-part="trigger"
                  onClick={() => handleStepClick(index, step.disabled)}
                >
                  {text}
                </button>
              ) : (
                <span data-part="content">{text}</span>
              )}
            </li>
          );
        })}
      </ol>
    );
  }
);

// ============================================================================
// Display Name
// ============================================================================

Steps.displayName = 'Steps.Modern';

export default Steps;
