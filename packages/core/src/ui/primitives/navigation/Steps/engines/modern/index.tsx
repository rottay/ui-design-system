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

import React, { useMemo } from 'react';
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
      current = STEPS_DEFAULTS.current!,
      direction = STEPS_DEFAULTS.direction,
      size = STEPS_DEFAULTS.size,
      status: overallStatus = STEPS_DEFAULTS.status,
      progressDot,
      onChange,
      items,
      className = '',
      style,
    } = props;

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
        const effectiveStatus = getEffectiveStatus(index, current, item.status, overallStatus);
        return { ...item, effectiveStatus };
      });
    }, [items, current, overallStatus]);

    // ========================================================================
    // Event Handlers
    // ========================================================================

    /**
     * Handle step click for navigation.
     * Only triggers onChange if step is not disabled.
     */
    const handleStepClick = (index: number, disabled?: boolean) => {
      if (!disabled && onChange) onChange(index);
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
        data-progress-dot={progressDot ? 'true' : undefined}
      >
        {computedSteps.map((step, index) => {
          const isClickable = !step.disabled && Boolean(onChange);

          const text = (
            <>
              {step.icon && !progressDot && <span data-part="icon">{step.icon}</span>}
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
