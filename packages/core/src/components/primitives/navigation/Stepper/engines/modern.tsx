/**
 * @fileoverview Stepper Modern Engine - Rottay Design System
 * @description DaisyUI/Tailwind-based implementation of the Stepper component.
 * Provides a lightweight, utility-first stepper with modern styling.
 *
 * @remarks
 * The Modern engine uses DaisyUI's steps component to provide:
 * - Lightweight bundle size
 * - Tailwind CSS utility classes
 * - Modern, clean appearance
 * - Easy customization via Tailwind
 *
 * This engine is ideal for projects already using Tailwind CSS or
 * those prioritizing bundle size and customization flexibility.
 *
 * @example Basic Usage
 * ```tsx
 * <Stepper
 *   engine="modern"
 *   items={[
 *     { title: 'Step 1', description: 'First step' },
 *     { title: 'Step 2', description: 'Second step' },
 *   ]}
 *   current={0}
 * />
 * ```
 *
 * @example Vertical Layout
 * ```tsx
 * <Stepper
 *   engine="modern"
 *   direction="vertical"
 *   items={steps}
 *   current={current}
 * />
 * ```
 *
 * @see {@link Stepper} for the main component
 * @see {@link StepperProps} for prop documentation
 * @see {@link https://daisyui.com/components/steps} DaisyUI Steps documentation
 *
 * @module Stepper/Engines/Modern
 * @category Navigation
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useCallback } from 'react';
import type { CSSProperties } from 'react';
import type { StepperProps, StepItem, StepStatus } from '../Stepper.types';
import { STEPPER_DEFAULTS } from '../Stepper.types';

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Gets the DaisyUI step class based on step status.
 * @param status - The step status
 * @returns DaisyUI class name for the status
 * @internal
 */
function getStepClass(status: StepStatus): string {
  switch (status) {
    case 'finish':
    case 'process':
      // Both finished and active steps use `step-primary` because DaisyUI
      // does not differentiate between "completed" and "in-progress" visually.
      // The filled primary color signals that the step has been reached.
      return 'step-primary';
    case 'error':
      return 'step-error';
    case 'wait':
    default:
      // No class yields DaisyUI's neutral (unfilled) step appearance
      return '';
  }
}

/**
 * Returns an inline style object with DS token color overrides for the step.
 * DaisyUI structural classes are kept for layout, but the accent color is
 * driven by DS tokens to support tenant-aware theming.
 * @internal
 */
function getStepTokenStyle(status: StepStatus): React.CSSProperties {
  const base: React.CSSProperties = {
    // Override DaisyUI connector-line color via the CSS custom property
    // it exposes on step elements. The fallback ensures a neutral line
    // when no DS token is set.
    '--step-neutral': 'var(--ds-stepper-connector-color, var(--ds-color-border-secondary, #e5e7eb))',
  } as React.CSSProperties;

  switch (status) {
    case 'finish':
    case 'process':
      return {
        ...base,
        '--step-color': 'var(--ds-color-primary)',
        accentColor: 'var(--ds-color-primary)',
        // Override the connector line for reached steps
        '--step-neutral': 'var(--ds-color-primary)',
      } as React.CSSProperties;
    case 'error':
      return {
        ...base,
        '--step-color': 'var(--ds-color-error)',
        accentColor: 'var(--ds-color-error)',
      } as React.CSSProperties;
    case 'wait':
    default:
      return base;
  }
}

/**
 * Computes the status for a step based on its position.
 * @param index - Step index
 * @param current - Current active step
 * @param itemStatus - Optional explicit status
 * @returns Computed step status
 * @internal
 */
function computeStatus(index: number, current: number, itemStatus?: StepStatus): StepStatus {
  if (itemStatus) return itemStatus;
  if (index < current) return 'finish';
  if (index === current) return 'process';
  return 'wait';
}

/**
 * Renders DaisyUI step elements from items array.
 * @param items - Array of step items
 * @param current - Current active step
 * @param clickable - Whether steps are clickable
 * @param onChange - Change handler callback
 * @param globalStatus - Global status override
 * @returns Array of step li elements
 * @internal
 */
function renderDaisySteps(
  items: StepItem[],
  current: number,
  clickable: boolean,
  onChange?: (current: number) => void,
  globalStatus?: StepStatus
): React.ReactNode {
  return items.map((item, index) => {
    // Priority: explicit item status > global status (only on current step) > positional computation.
    // This lets consumers override specific steps while inheriting defaults elsewhere.
    const status = item.status || (globalStatus && index === current ? globalStatus : computeStatus(index, current));
    const stepClass = getStepClass(status);
    const tokenStyle = getStepTokenStyle(status);

    return (
      <li
        key={index}
        className={`step ${stepClass}`}
        onClick={() => {
          if (clickable && !item.disabled) {
            onChange?.(index);
          }
        }}
        style={{
          cursor: clickable && !item.disabled ? 'pointer' : 'default',
          opacity: item.disabled ? 0.5 : 1,
          ...tokenStyle,
        }}
        // DaisyUI's `data-content` attribute renders text/numbers inside the
        // step circle indicator. When a custom icon is provided, we skip it
        // so the icon can be rendered inside the step-content div instead.
        data-content={item.icon ? undefined : (index + 1).toString()}
      >
        <div className="step-content">
          <span className="font-medium" style={{ color: 'var(--ds-color-text-primary)' }}>{item.title}</span>
          {item.description && (
            <span className="text-sm" style={{ color: 'var(--ds-color-text-tertiary)', opacity: 0.8 }}>{item.description}</span>
          )}
        </div>
      </li>
    );
  });
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Modern engine Stepper implementation using DaisyUI.
 *
 * @description
 * Provides a lightweight stepper using DaisyUI's steps component.
 * Features include:
 * - Minimal bundle impact
 * - Tailwind CSS styling
 * - Horizontal and vertical layouts
 * - Clickable step navigation
 *
 * @param props - {@link StepperProps}
 * @returns DaisyUI steps component with Rottay styling
 */
export default function ModernStepper(props: StepperProps): React.ReactElement {
  const {
    items,
    current: controlledCurrent,
    defaultCurrent = STEPPER_DEFAULTS.defaultCurrent,
    direction = STEPPER_DEFAULTS.direction,
    size: _size = STEPPER_DEFAULTS.size,
    variant: _variant = STEPPER_DEFAULTS.variant,
    status,
    clickable = STEPPER_DEFAULTS.clickable,
    onChange,
    children,
    className = '',
    style,
  } = props;

  // Suppress unused - could be used for future customization
  void _size;
  void _variant;

  // ============================================================================
  // State Management
  // ============================================================================

  /** Internal state for uncontrolled mode */
  const [internalCurrent, setInternalCurrent] = useState(defaultCurrent);

  /** Use controlled or uncontrolled state */
  const current = controlledCurrent ?? internalCurrent;

  // ============================================================================
  // Event Handlers
  // ============================================================================

  /**
   * Handles step change events.
   * Updates internal state and calls the onChange callback.
   */
  const handleChange = useCallback(
    (step: number) => {
      if (!clickable) return;

      if (controlledCurrent === undefined) {
        setInternalCurrent(step);
      }

      onChange?.(step);
    },
    [clickable, controlledCurrent, onChange]
  );

  // ============================================================================
  // CSS Classes
  // ============================================================================

  /** DaisyUI steps classes based on direction */
  const stepsClasses = [
    'steps',
    direction === 'vertical' ? 'steps-vertical' : 'steps-horizontal',
    className,
  ].filter(Boolean).join(' ');

  /** Container styles */
  const containerStyle: CSSProperties = {
    width: '100%',
    ...style,
  };

  // ============================================================================
  // Content Rendering
  // ============================================================================

  /** Process items or children into step content */
  let stepsContent: React.ReactNode = null;

  if (items) {
    // Render from items prop
    stepsContent = renderDaisySteps(items, current, clickable, handleChange, status);
  } else if (children) {
    // Convert children to items for DaisyUI rendering
    const childItems: StepItem[] = [];

    React.Children.forEach(children, (child) => {
      if (!React.isValidElement(child)) return;

      const displayName = (child.type as any)?.displayName || '';
      if (displayName === 'Stepper.Step') {
        const stepProps = child.props as any;
        childItems.push({
          title: stepProps.title,
          description: stepProps.description,
          subTitle: stepProps.subTitle,
          icon: stepProps.icon,
          status: stepProps.status,
          disabled: stepProps.disabled,
        });
      }
    });

    if (childItems.length > 0) {
      stepsContent = renderDaisySteps(childItems, current, clickable, handleChange, status);
    }
  }

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <ul
      className={`rottay-stepper rottay-stepper--modern ${stepsClasses}`}
      style={containerStyle}
      role="navigation"
      aria-label="Progress steps"
    >
      {stepsContent}
    </ul>
  );
}

// Set display name for debugging
ModernStepper.displayName = 'ModernStepper';
