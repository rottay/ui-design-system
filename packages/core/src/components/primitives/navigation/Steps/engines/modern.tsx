'use client';

/**
 * @fileoverview Steps Modern Engine - Rottay Design System
 * @description DaisyUI/Tailwind implementation of the Steps component.
 * Leverages DaisyUI's steps classes for a utility-first, lightweight
 * step navigation component.
 *
 * @remarks
 * The Modern engine uses DaisyUI's steps component classes, providing:
 * - Lightweight bundle size with Tailwind utilities
 * - Easy customization via CSS classes
 * - Consistent styling with DaisyUI themes
 * - Support for horizontal and vertical layouts
 *
 * This implementation adapts Rottay's unified props interface to work
 * with DaisyUI's class-based styling system.
 *
 * @example
 * ```tsx
 * // Use Modern engine for DaisyUI styling
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
 * @see {@link https://daisyui.com/components/steps/} for DaisyUI Steps docs
 *
 * @module Steps/Engines/Modern
 * @category Navigation
 * @package @rottay/design-system
 */

import React, { useMemo } from 'react';
import type { StepsProps, StepStatus } from '../Steps.types';
import { STEPS_DEFAULTS } from '../Steps.types';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Maps step status to DaisyUI step class.
 *
 * @param status - The step status
 * @returns DaisyUI class name for the status
 */
const getStepClass = (status: StepStatus): string => {
  switch (status) {
    case 'finish':
    case 'process':
      return 'step-primary';
    case 'error':
      return 'step-error';
    default:
      return '';
  }
};

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
 * Steps component - Modern Engine (DaisyUI/Tailwind)
 *
 * @description
 * Lightweight implementation using DaisyUI's utility classes.
 * Optimized for projects already using Tailwind CSS.
 *
 * @remarks
 * Features supported:
 * - Horizontal and vertical layouts
 * - Size variants (default, small)
 * - Step status indicators (primary, error)
 * - Progress dot mode
 * - Clickable steps with onChange
 * - Disabled step styling
 *
 * @param props - {@link StepsProps}
 * @returns Steps component rendered with DaisyUI classes
 */
export const Steps = React.forwardRef<HTMLUListElement, StepsProps>(
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
    // Computed Classes
    // ========================================================================

    /** Direction class for layout */
    const directionClass = direction === 'vertical' ? 'steps-vertical' : 'steps-horizontal';

    /** Size class for smaller variant */
    const sizeClass = size === 'small' ? 'text-sm' : '';

    // ========================================================================
    // Memoized Step Computation
    // ========================================================================

    /**
     * Compute effective status and styling for each step.
     * Memoized to prevent unnecessary recalculations.
     */
    // Pre-compute status and DaisyUI class for each step. Memoized because
    // this runs on every render and the items array may be large. Only
    // recomputes when items, current position, or overall status change.
    const computedSteps = useMemo(() => {
      return items.map((item, index) => {
        const effectiveStatus = getEffectiveStatus(index, current, item.status, overallStatus);
        return { ...item, effectiveStatus, stepClass: getStepClass(effectiveStatus) };
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
      <ul
        ref={ref}
        className={`steps ${directionClass} ${sizeClass} ${className}`.trim()}
        style={style}
      >
        {computedSteps.map((step, index) => {
          const isClickable = !step.disabled && onChange;
          return (
            <li
              key={index}
              className={`step ${step.stepClass} ${step.disabled ? 'opacity-50' : ''} ${isClickable ? 'cursor-pointer' : ''}`}
              onClick={() => handleStepClick(index, step.disabled)}
              // In progressDot mode, replace the default number/icon with a
              // simple filled circle via DaisyUI's data-content attribute
              data-content={progressDot ? '●' : undefined}
            >
              <div className="flex flex-col items-start">
                {/* Custom icon if provided and not in progressDot mode */}
                {step.icon && !progressDot && <span className="mb-1">{step.icon}</span>}

                {/* Step title */}
                <span className="font-medium">{step.title}</span>

                {/* Optional subtitle */}
                {step.subTitle && <span className="text-xs" style={{ color: 'var(--ds-color-text-secondary)' }}>{step.subTitle}</span>}

                {/* Optional description */}
                {step.description && <span className="text-sm mt-1" style={{ color: 'var(--ds-color-text-secondary)' }}>{step.description}</span>}
              </div>
            </li>
          );
        })}
      </ul>
    );
  }
);

// ============================================================================
// Display Name
// ============================================================================

Steps.displayName = 'Steps.Modern';

export default Steps;
